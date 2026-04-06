"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAppState } from "@/components/providers";
import { buildPlanCheckoutPath, couponCatalog } from "@/lib/commerce";
import { Difficulty, ExamType, ProgressSummary, SpeakingSession, TaskType } from "@/lib/types";
import { trackClientEvent } from "@/lib/analytics-client";
import { listPromptsForTask } from "@/lib/prompts";

const taskOptions: Record<ExamType, TaskType[]> = {
  IELTS: ["ielts-part-1", "ielts-part-2", "ielts-part-3"],
  TOEFL: ["toefl-task-1", "toefl-task-2", "toefl-task-3", "toefl-task-4"]
};

type PracticeMode = "idle" | "permission" | "prep" | "speak" | "saving" | "done";
type RunMode = "drill" | "simulation" | "pronunciation";

type SimulationState = {
  examType: ExamType;
  queue: TaskType[];
  currentIndex: number;
  completed: Array<{ sessionId: string; taskType: TaskType; title: string; score?: number }>;
  startedAt: string;
  finishedAt?: string;
};

type StoredMockExamSummary = {
  examType: ExamType;
  average: string;
  completedCount: number;
  totalCount: number;
  readinessLabel: string;
  headline: string;
  body: string;
  gapLabel: string;
  nextStep: string;
  targetScore: string;
  generatedAt: string;
  tasks: Array<{ sessionId: string; taskType: TaskType; title: string; score?: number }>;
};

type RetryQueueItem = {
  promptId: string;
  examType: ExamType;
  taskType: TaskType;
  difficulty: Difficulty;
  title: string;
  createdAt: string;
};

type PromptBookmark = {
  promptId: string;
  examType: ExamType;
  taskType: TaskType;
  difficulty: Difficulty;
  title: string;
  createdAt: string;
};

type DrillGoal = "balanced" | "fluency" | "pronunciation" | "topicDevelopment";
type AnswerMode = "safe" | "natural" | "bold";
type WizardStep = 1 | 2 | 3;

const emptySummary: ProgressSummary = {
  totalSessions: 0,
  averageScore: 0,
  streakDays: 0,
  freeSessionsRemaining: 4,
  remainingMinutesToday: 8,
  currentPlan: "free",
  recentSessions: []
};

export function PracticeConsole() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, language } = useAppState();
  const tr = language === "tr";

  const [examType, setExamType] = useState<ExamType>("IELTS");
  const [taskType, setTaskType] = useState<TaskType>("ielts-part-1");
  const [difficulty, setDifficulty] = useState<Difficulty>("Starter");
  const [preferredPromptId, setPreferredPromptId] = useState<string | undefined>(undefined);
  const [session, setSession] = useState<SpeakingSession | null>(null);
  const [mode, setMode] = useState<PracticeMode>("idle");
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [status, setStatus] = useState("Pick an exam mode and start your session.");
  const [error, setError] = useState<string | null>(null);
  const [micReady, setMicReady] = useState(false);
  const [recordingLive, setRecordingLive] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [summary, setSummary] = useState<ProgressSummary>(emptySummary);
  const [targetScore, setTargetScore] = useState("");
  const [runMode, setRunMode] = useState<RunMode>("drill");
  const [simulationState, setSimulationState] = useState<SimulationState | null>(null);
  const [retryQueue, setRetryQueue] = useState<RetryQueueItem[]>([]);
  const [drillGoal, setDrillGoal] = useState<DrillGoal>("balanced");
  const [answerMode, setAnswerMode] = useState<AnswerMode>("natural");
  const [bookmarks, setBookmarks] = useState<PromptBookmark[]>([]);
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);
  const [topicSearch, setTopicSearch] = useState("");
  const [showAllTopics, setShowAllTopics] = useState(false);

  const sessionRef = useRef<SpeakingSession | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const autoStartedRef = useRef(false);

  useEffect(() => {
    const nextExam = searchParams.get("examType");
    const nextTask = searchParams.get("taskType");
    const nextDifficulty = searchParams.get("difficulty");
    const nextPromptId = searchParams.get("promptId");

    if (nextExam === "IELTS" || nextExam === "TOEFL") {
      setExamType(nextExam);
    }
    if (nextTask && ["ielts-part-1", "ielts-part-2", "ielts-part-3", "toefl-task-1", "toefl-task-2", "toefl-task-3", "toefl-task-4", "toefl-independent", "toefl-integrated"].includes(nextTask)) {
      setTaskType(nextTask as TaskType);
    }
    if (nextDifficulty && ["Starter", "Target", "Stretch"].includes(nextDifficulty)) {
      setDifficulty(nextDifficulty as Difficulty);
    }
    setPreferredPromptId(nextPromptId ?? undefined);
  }, [searchParams]);

  useEffect(() => {
    if (!taskOptions[examType].includes(taskType)) {
      setTaskType(taskOptions[examType][0]);
      setPreferredPromptId(undefined);
    }
  }, [examType, taskType]);

  useEffect(() => {
    setWizardStep(1);
    setTopicSearch("");
    setShowAllTopics(false);
  }, [examType]);

  useEffect(() => {
    if (!currentUser) {
      setSummary(emptySummary);
      return;
    }

    fetch(`/api/progress/summary?userId=${encodeURIComponent(currentUser.id)}`)
      .then((response) => response.json())
      .then((data: ProgressSummary) => setSummary(data))
      .catch(() => setSummary(emptySummary));
  }, [currentUser]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storageKey = currentUser ? `speakace-target-${currentUser.id}` : "speakace-target-guest";
    setTargetScore(window.localStorage.getItem(storageKey) ?? "");
    setRetryQueue(readRetryQueue());
    setBookmarks(readBookmarks());
  }, [currentUser]);

  const progressLabel = useMemo(() => {
    if (!session) {
      return tr ? "Aktif bir oturum yok" : "No active session";
    }

    if (mode === "prep") {
      return tr ? `Hazırlık: ${remainingSeconds}s` : `Prep time: ${remainingSeconds}s`;
    }

    if (mode === "speak") {
      return tr ? `Konuşma: ${remainingSeconds}s` : `Speaking time: ${remainingSeconds}s`;
    }

    if (mode === "saving") {
      return tr ? "Yanıt analiz ediliyor" : "Analyzing answer";
    }

    return tr ? "Oturum tamamlandı" : "Session complete";
  }, [mode, remainingSeconds, session, tr]);

  const cleanupMedia = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    recorderRef.current = null;
    chunksRef.current = [];
    setMicReady(false);
    setRecordingLive(false);
  }, []);

  const resetSession = useCallback((message?: string) => {
    cleanupMedia();
    sessionRef.current = null;
    setMode("idle");
    setRemainingSeconds(0);
    setSession(null);
    setError(null);
    setStatus(message ?? (tr ? "Hazırsan yeni bir speaking çalışması başlatabilirsin." : "You can start a new speaking drill."));
  }, [cleanupMedia, tr]);

  const evaluateSessionNow = useCallback(async (sessionId: string) => {
    const response = await fetch(`/api/speaking/session/${sessionId}/evaluate`, { method: "POST" });
    const data = (await readJsonSafely(response)) as { error?: string; session?: SpeakingSession };

    if (!response.ok) {
      setError(data.error ?? (tr ? "Değerlendirme tamamlanamadı." : "Evaluation failed."));
      setMode("done");
      return null;
    }

    if (!data.session) {
      setError(tr ? "Sonuç verisi boş döndü." : "The result response was empty.");
      setMode("done");
      return null;
    }

    const evaluatedSession = data.session;
    setSession(evaluatedSession);
    setMode("done");

    if (runMode === "simulation" && simulationState) {
      const completedEntry = {
        sessionId,
        taskType: evaluatedSession.taskType,
        title: evaluatedSession.prompt.title,
        score: evaluatedSession.report?.overall
      };
      const nextIndex = simulationState.currentIndex + 1;
      const hasNextTask = nextIndex < simulationState.queue.length;

      setSimulationState((current) => {
        if (!current) return current;
        return {
          ...current,
          currentIndex: nextIndex,
          completed: [...current.completed, completedEntry],
          finishedAt: hasNextTask ? undefined : new Date().toISOString()
        };
      });

      sessionRef.current = null;
      setRemainingSeconds(0);
      if (hasNextTask) {
        setSession(null);
        setStatus(
          tr
            ? `${humanizeTaskType(evaluatedSession.taskType, true)} tamamlandı. Sıradaki görev için devam et.`
            : `${humanizeTaskType(evaluatedSession.taskType, false)} is complete. Continue to the next task.`
        );
      } else {
        setStatus(
          tr
            ? "Simulasyon tamamlandi. Tum gorevlerin ozetini asagida gorebilirsin."
            : "Simulation complete. You can review the full summary below."
        );
        if (currentUser?.id) {
          void trackClientEvent({ userId: currentUser.id, event: "simulation_complete", path: "/app/practice" });
        }
      }
      return evaluatedSession;
    }

    setStatus(tr ? "Sonuç hazır. Sonuç ekranı açılıyor." : "Your result is ready. Opening the full review.");
    router.push(`/app/results/${sessionId}`);
    return evaluatedSession;
  }, [currentUser?.id, router, runMode, simulationState, tr]);

  const prepareMicrophone = useCallback(async (activeSession?: SpeakingSession | null) => {
    setError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setError(tr ? "Bu tarayici mikrofon kaydini desteklemiyor." : "This browser does not support microphone recording.");
      return false;
    }

    if (!currentUser) {
      setError(tr ? "Kullanıcı profili henüz yükleniyor. Lütfen birkaç saniye bekle." : "User profile is loading. Please wait a moment.");
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1
        }
      });

      streamRef.current = stream;
      setMicReady(true);
      const options = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? { mimeType: "audio/webm;codecs=opus", audioBitsPerSecond: 56_000 }
        : undefined;
      const recorder = options ? new MediaRecorder(stream, options) : new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        setRecordingLive(false);
        const targetSession = activeSession ?? sessionRef.current;
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        cleanupMedia();

        if (!targetSession || blob.size === 0) {
          return;
        }

        const base64 = await blobToBase64(blob);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(`speakace-audio-${targetSession.id}`, base64);
        }
        if (currentUser?.id) {
          void trackClientEvent({ userId: currentUser.id, event: "recording_uploaded", path: "/app/practice" });
        }
        setMode("saving");
        setStatus(tr ? "Kayıt yükleniyor, yanıtın analiz ediliyor..." : "Uploading your recording and analyzing your answer...");

        const uploadResponse = await fetch(`/api/speaking/session/${targetSession.id}/upload`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audioBase64: base64,
            durationSeconds: targetSession.prompt.speakingSeconds
          })
        });

        const uploadData = (await readJsonSafely(uploadResponse)) as {
          error?: string;
          session?: SpeakingSession;
          transcriptSource?: "openai" | "fallback";
          transcriptStatus?: string;
          transcriptionError?: string | null;
        };

        if (!uploadResponse.ok) {
          setError(uploadData.error ?? (tr ? "Kayıt yüklenemedi." : "Recording upload failed."));
          setMode("done");
          return;
        }

        if (uploadData.session) {
          setSession(uploadData.session);
        }
        if (uploadData.transcriptionError) {
          setError(uploadData.transcriptionError);
        }

        setStatus(
          uploadData.transcriptSource === "openai"
            ? tr
              ? "Kayıt başarıyla çözüldü. OpenAI transcript'i üzerinden analiz yapılıyor."
              : "Recording captured successfully. Evaluating with the OpenAI transcript."
            : tr
              ? "Kayıt alındı ancak transcript yedek modda üretildi."
              : "Recording was captured, but the transcript fell back to generated mode."
        );

        await evaluateSessionNow(targetSession.id);
      };

      return true;
    } catch {
      setMicReady(false);
      setError(tr ? "Mikrofon izni reddedildi. Lutfen izin verip tekrar dene." : "Microphone permission was denied. Please allow access and try again.");
      setStatus(tr ? "Speaking calismasi icin mikrofon izni gerekli." : "Microphone access is required for speaking practice.");
      return false;
    }
  }, [cleanupMedia, currentUser, evaluateSessionNow, tr]);

  const beginRecording = useCallback(async () => {
    if (!recorderRef.current) {
      const granted = await prepareMicrophone(sessionRef.current);
      if (!granted || !recorderRef.current) {
        return;
      }
    }

    const recorder = recorderRef.current;
    if (recorder && recorder.state === "inactive") {
      recorder.start(1000);
      setRecordingLive(true);
      setStatus(tr ? "Kayıt başladı. Şimdi konuşmaya başlayabilirsin." : "Recording in progress.");
    }
  }, [prepareMicrophone, tr]);

  const requestMicrophoneAccess = useCallback(async () => {
    const granted = await prepareMicrophone(sessionRef.current);
    if (!granted) {
      return;
    }

    setMode("prep");
    setStatus(
      tr
        ? "Mikrofon hazır. Otomatik kayıt başlamadan önce cevabını kısaca planla."
        : "Microphone ready. Prepare your structure before automatic recording begins."
    );
  }, [prepareMicrophone, tr]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
      return;
    }

    cleanupMedia();
  }, [cleanupMedia]);

  const startSession = async (overrides?: {
    examType?: ExamType;
    taskType?: TaskType;
    difficulty?: Difficulty;
    promptId?: string;
  }) => {
    setError(null);

    const resolvedExamType = overrides?.examType ?? examType;
    const resolvedTaskType = overrides?.taskType ?? taskType;
    const resolvedDifficulty = overrides?.difficulty ?? difficulty;
    const resolvedPromptId = overrides?.promptId ?? preferredPromptId;

    const queue = buildSimulationQueue(resolvedExamType);
    const currentSimulation = runMode === "simulation"
      ? simulationState && simulationState.examType === resolvedExamType && !simulationState.finishedAt
        ? simulationState
        : {
            examType: resolvedExamType,
            queue,
            currentIndex: 0,
            completed: [],
            startedAt: new Date().toISOString()
          }
      : null;
    const adaptivePlan =
      runMode === "simulation"
        ? null
        : buildAdaptiveDrillPlan({
            summary,
            examType: resolvedExamType,
            selectedTaskType: resolvedTaskType,
            selectedDifficulty: resolvedDifficulty,
            drillGoal,
            tr
          });
    const requestedTaskType = runMode === "simulation"
      ? currentSimulation?.queue[currentSimulation.currentIndex] ?? queue[0]
      : adaptivePlan?.taskType ?? resolvedTaskType;
    const requestedDifficulty = runMode === "simulation" ? resolvedDifficulty : adaptivePlan?.difficulty ?? resolvedDifficulty;
    const requestedPromptId = runMode === "simulation" ? undefined : resolvedPromptId ?? adaptivePlan?.promptId;

    if (runMode === "simulation" && (!simulationState || simulationState.examType !== resolvedExamType || simulationState.finishedAt)) {
      setSimulationState(currentSimulation);
    }

    setStatus(
      runMode === "simulation"
        ? tr
          ? `${humanizeTaskType(requestedTaskType, true)} icin simulasyon gorevi olusturuluyor...`
          : `Creating the simulation task for ${humanizeTaskType(requestedTaskType, false)}...`
        : tr
          ? "Session olusturuluyor..."
          : "Creating your session..."
    );

    const response = await fetch("/api/speaking/session/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        examType: resolvedExamType,
        taskType: requestedTaskType,
        difficulty: requestedDifficulty,
        promptId: requestedPromptId,
        userId: currentUser?.id
      })
    });

    const data = (await readJsonSafely(response)) as { error?: string; session?: SpeakingSession };
    if (!response.ok) {
      setError(data.error ?? (tr ? "Session olusturulamadi." : "Could not create session."));
      setStatus(tr ? "Planini guncelle veya tekrar dene." : "Update your plan or try again.");
      return;
    }

    if (!data.session) {
      setError(tr ? "Session verisi bos dondu." : "The session response was empty.");
      setStatus(tr ? "Lutfen tekrar dene." : "Please try again.");
      return;
    }

    sessionRef.current = data.session;
    setPreferredPromptId(data.session.prompt.id);
    setTaskType(data.session.taskType);
    setDifficulty(data.session.difficulty);
    setExamType(data.session.examType);
    setMode("permission");
    setStatus(
      runMode === "simulation"
        ? tr
          ? `${humanizeTaskType(data.session.taskType, true)} icin mikrofon izni ver.`
          : `Allow microphone access to begin ${humanizeTaskType(data.session.taskType, false)}.`
        : tr
          ? "Timed speaking calismasi icin mikrofon izni ver."
          : "Please allow microphone access to begin the timed speaking drill."
    );
    setSession(data.session);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(`speakace-session-mode-${data.session.id}`, runMode);
    }

    if (currentUser?.id) {
      void trackClientEvent({ userId: currentUser.id, event: "practice_start", path: "/app/practice" });
    }

  };

  // This effect is intentionally one-shot for the quick-start landing CTA.
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    const quickStart = searchParams.get("quickStart") === "1";

    if (!quickStart || autoStartedRef.current || mode !== "idle" || session) {
      return;
    }

    autoStartedRef.current = true;
    void startSession();
  }, [mode, searchParams, session]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const endEarly = useCallback(() => {
    if (runMode === "simulation" && mode === "idle") {
      setSimulationState(null);
      setStatus(tr ? "Simulasyon kapatildi." : "Simulation closed.");
      return;
    }

    if (mode === "prep" || mode === "permission") {
      if (runMode === "simulation") {
        setSimulationState(null);
      }
      resetSession(tr ? "Session kapatildi." : "Session closed.");
      return;
    }

    if (mode === "speak") {
      setStatus(tr ? "Kayit erken bitiriliyor..." : "Finishing your answer early...");
      stopRecording();
    }
  }, [mode, resetSession, runMode, stopRecording, tr]);

  const skipPrep = useCallback(() => {
    void beginRecording();
    setMode("speak");
    setStatus(tr ? "Hazirlik atlandi. Kayit hemen basladi." : "Prep was skipped. Recording started immediately.");
  }, [beginRecording, tr]);

  const handleExamChange = useCallback((value: string) => {
    setPreferredPromptId(undefined);
    setExamType(value as ExamType);
    setWizardStep(2);
  }, []);

  const handleTaskChange = useCallback((value: string) => {
    setPreferredPromptId(undefined);
    setTaskType(value as TaskType);
    setWizardStep(3);
  }, []);

  const handleDifficultyChange = useCallback((value: string) => {
    setPreferredPromptId(undefined);
    setDifficulty(value as Difficulty);
  }, []);

  useEffect(() => {
    if (!session) {
      return;
    }

    if (mode === "prep") {
      setRemainingSeconds(session.prompt.prepSeconds);
    }

    if (mode === "speak") {
      setRemainingSeconds(session.prompt.speakingSeconds);
    }
  }, [mode, session]);

  useEffect(() => {
    if (mode !== "prep" && mode !== "speak") {
      return;
    }

    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          if (mode === "prep") {
            void beginRecording();
            setMode("speak");
            setStatus(tr ? "Şimdi konuş. Kayıt otomatik olarak başladı." : "Speak now. Recording has started automatically.");
            return session?.prompt.speakingSeconds ?? 0;
          }

          setMode("saving");
          setStatus(tr ? "Süre doldu. Cevabın analiz ediliyor." : "Time is up. Your recording is being analyzed.");
          stopRecording();
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [beginRecording, mode, session, stopRecording, tr]);

  useEffect(() => () => cleanupMedia(), [cleanupMedia]);

  useEffect(() => {
    setNoteDraft("");
  }, [session?.id, examType, taskType]);

  const retryMode = Boolean(preferredPromptId);
  const liveMicVisible = mode === "permission" || mode === "prep" || mode === "speak";
  const simulationQueue = useMemo(() => buildSimulationQueue(examType), [examType]);
  const activeSimulationTask = simulationState ? simulationState.queue[Math.min(simulationState.currentIndex, simulationState.queue.length - 1)] : null;
  const effectiveTaskType = runMode === "simulation" ? activeSimulationTask ?? simulationQueue[0] : taskType;
  const activeBriefing = buildTaskBriefing(session?.examType ?? examType, session?.taskType ?? effectiveTaskType, tr);
  const activeTaskLayout = buildTaskLayout(session?.examType ?? examType, session?.taskType ?? effectiveTaskType, session?.prompt.prompt ?? "", tr);
  const focusInsight = useMemo(() => buildPracticeFocus({ summary, examType, taskType: effectiveTaskType, tr, targetScore }), [summary, examType, effectiveTaskType, tr, targetScore]);
  const adaptivePlanPreview = useMemo(
    () =>
      runMode === "simulation"
        ? null
        : buildAdaptiveDrillPlan({
            summary,
            examType,
            selectedTaskType: taskType,
            selectedDifficulty: difficulty,
            drillGoal,
            tr
          }),
    [difficulty, drillGoal, examType, runMode, summary, taskType, tr]
  );
  const simulationAverage = simulationState?.completed.length
    ? (simulationState.completed.reduce((total, item) => total + (item.score ?? 0), 0) / simulationState.completed.length).toFixed(1)
    : null;
  const simulationSummary = useMemo(
    () => buildSimulationSummary({
      examType,
      average: simulationAverage,
      targetScore,
      tr,
      completedCount: simulationState?.completed.length ?? 0,
      totalCount: simulationQueue.length,
      focusInsightPrimary: focusInsight.primary
    }),
    [examType, focusInsight.primary, simulationAverage, simulationQueue.length, simulationState?.completed.length, targetScore, tr]
  );
  const simulationIdle = runMode === "simulation" && mode === "idle";
  const mockReportStorageKey = currentUser ? `speakace-mock-report-${currentUser.id}` : "speakace-mock-report-guest";
  const pronunciationGuide = useMemo(() => buildPronunciationGuide(session?.prompt.prompt ?? activeTaskLayout.overlayPrompt, tr), [activeTaskLayout.overlayPrompt, session?.prompt.prompt, tr]);
  const answerModeGuide = useMemo(
    () => buildAnswerModeGuide({ mode: answerMode, taskType: effectiveTaskType, tr }),
    [answerMode, effectiveTaskType, tr]
  );

  const removeRetryItem = (promptId: string) => {
    if (typeof window === "undefined") return;
    const next = readRetryQueue().filter((item) => item.promptId !== promptId);
    window.localStorage.setItem("speakace-retry-queue", JSON.stringify(next));
    setRetryQueue(next);
  };

  const saveBookmark = () => {
    const candidate = session?.prompt
      ? {
          promptId: session.prompt.id,
          examType: session.examType,
          taskType: session.taskType,
          difficulty: session.difficulty,
          title: session.prompt.title,
          createdAt: new Date().toISOString()
        }
      : adaptivePlanPreview
        ? {
            promptId: adaptivePlanPreview.promptId,
            examType,
            taskType: adaptivePlanPreview.taskType,
            difficulty: adaptivePlanPreview.difficulty,
            title: adaptivePlanPreview.title,
            createdAt: new Date().toISOString()
          }
        : null;
    if (!candidate || typeof window === "undefined") return;
    const next = [candidate, ...readBookmarks().filter((item) => item.promptId !== candidate.promptId)].slice(0, 16);
    window.localStorage.setItem("speakace-bookmarks", JSON.stringify(next));
    setBookmarks(next);
  };

  const removeBookmark = (promptId: string) => {
    if (typeof window === "undefined") return;
    const next = readBookmarks().filter((item) => item.promptId !== promptId);
    window.localStorage.setItem("speakace-bookmarks", JSON.stringify(next));
    setBookmarks(next);
  };

  const loadBookmark = (item: PromptBookmark) => {
    setExamType(item.examType);
    setTaskType(item.taskType);
    setDifficulty(item.difficulty);
    setPreferredPromptId(item.promptId);
    setRunMode(item.taskType.includes("toefl") || item.taskType.includes("ielts") ? "drill" : "drill");
    setStatus(tr ? "Kaydedilen soru yuklendi. Bu soruyla yeni deneme baslatabilirsin." : "Saved prompt loaded. You can start a new attempt with this prompt.");
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!simulationState?.finishedAt || !simulationAverage) return;

    const payload: StoredMockExamSummary = {
      examType,
      average: simulationAverage,
      completedCount: simulationState.completed.length,
      totalCount: simulationQueue.length,
      readinessLabel: simulationSummary.readinessLabel,
      headline: simulationSummary.headline,
      body: simulationSummary.body,
      gapLabel: simulationSummary.gapLabel,
      nextStep: simulationSummary.nextStep,
      targetScore,
      generatedAt: simulationState.finishedAt,
      tasks: simulationState.completed
    };

    window.localStorage.setItem(mockReportStorageKey, JSON.stringify(payload));
  }, [currentUser, examType, mockReportStorageKey, simulationAverage, simulationQueue.length, simulationState, simulationSummary, targetScore]);

  const availablePrompts = useMemo(() => {
    const prompts = listPromptsForTask(examType, taskType);
    const byDifficulty = prompts.filter((item) => item.difficulty === difficulty);
    return byDifficulty.length ? byDifficulty : prompts;
  }, [difficulty, examType, taskType]);

  const recommendedPrompts = useMemo(() => {
    const shortlist = availablePrompts.slice(0, 3);
    return shortlist.length ? shortlist : availablePrompts;
  }, [availablePrompts]);

  const filteredPrompts = useMemo(() => {
    const query = topicSearch.trim().toLowerCase();
    if (!query) return availablePrompts;
    return availablePrompts.filter((item) => item.title.toLowerCase().includes(query));
  }, [availablePrompts, topicSearch]);

  const pickPromptAndStart = async (promptId: string) => {
    setPreferredPromptId(promptId);
    setWizardStep(3);
    await startSession({ promptId, examType, taskType, difficulty });
  };

  const surpriseMe = async () => {
    if (!availablePrompts.length) return;
    const randomPrompt = availablePrompts[Math.floor(Math.random() * availablePrompts.length)];
    await pickPromptAndStart(randomPrompt.id);
  };

  return (
    <div className="page-shell section practice-page-shell">
      {currentUser?.plan === "free" && summary.totalSessions > 0 ? (
        <section className="card free-plan-banner">
          <div>
            <span className="eyebrow">{tr ? "Free plan" : "Free plan"}</span>
            <h2 style={{ margin: "0.7rem 0 0.35rem" }}>{tr ? "Skoru gördün, şimdi tam geri bildirimi aç" : "You saw the score, now unlock full feedback"}</h2>
            <p className="practice-copy">
              {tr
                ? "İlk deneme değeri gösterir. Plus ile daha fazla speaking süresi, daha fazla tekrar ve tam analiz açılır."
                : "The first attempt shows the value. Plus unlocks more speaking time, more retries, and the full review."}
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <a className="button button-primary" href={buildPlanCheckoutPath({ coupon: couponCatalog.LAUNCH20.code, campaign: "practice_banner" })}>
              {tr ? "Plus'i aç" : "Unlock Plus"}
            </a>
            <Link className="button button-secondary" href="/pricing">
              {tr ? "Planlari gor" : "See plans"}
            </Link>
          </div>
        </section>
      ) : null}

      <div className="practice-shell practice-shell-simple practice-shell-dashboard">
        <section className="card practice-panel practice-main-column">
          {summary.totalSessions === 0 ? (
            <div className="card practice-simulation-card">
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", flexWrap: "wrap", alignItems: "center" }}>
                <strong>{tr ? "İlk speaking testin" : "Your first speaking test"}</strong>
                <span className="pill">{tr ? "30 saniye" : "30 seconds"}</span>
              </div>
              <p className="practice-meta" style={{ margin: "0.45rem 0 0.8rem" }}>
                {tr
                  ? "İlk denemeyi başlat, skorunu gör ve istersen ardından tam geri bildirimi aç."
                  : "Start the first attempt, see your score, and unlock full feedback afterwards if you want more."}
              </p>
              <button className="button button-primary" type="button" onClick={() => void startSession()} disabled={!currentUser || mode !== "idle"}>
                {tr ? "Konuşmaya başla" : "Start Speaking Now"}
              </button>
            </div>
          ) : null}

          <div>
            <span className="eyebrow">{tr ? "Speaking practice" : "Speaking practice"}</span>
            <h1 className="practice-title">{tr ? "Adım adım speaking pratiğine başla" : "Start speaking with a guided flow"}</h1>
            <p className="practice-copy">
              {tr
                ? "Önce sınavı seç, sonra görev tipini belirle, en son bir konuyla konuşmaya başla. Böylece tek ekranda çok fazla karar vermen gerekmez."
                : "Choose the exam first, then the task type, and then one topic. This keeps the path from landing to recording much easier to follow."}
            </p>
          </div>

          <div className="card practice-setup-card">
            <div className="practice-stepper" aria-label={tr ? "Practice adimlari" : "Practice steps"}>
              {[
                { step: 1, label: tr ? "Sınav" : "Exam" },
                { step: 2, label: tr ? "Görev" : "Task" },
                { step: 3, label: tr ? "Konu" : "Topic" }
              ].map((item) => (
                <div
                  key={item.step}
                  className={`practice-stepper-item ${wizardStep === item.step ? "is-active" : wizardStep > item.step ? "is-complete" : ""}`}
                >
                  <span className="practice-stepper-badge">{item.step}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", flexWrap: "wrap", alignItems: "center" }}>
              <strong>{tr ? "Yönlendirmeli seçim" : "Guided selection"}</strong>
              <span className="pill">{retryMode ? (tr ? "Aynı konu seçildi" : "Same prompt selected") : progressLabel}</span>
            </div>

            <div className="practice-wizard">
              <div className="practice-wizard-grid">
                <button
                  type="button"
                  className={`practice-choice-card ${examType === "IELTS" ? "is-selected" : ""}`}
                  onClick={() => handleExamChange("IELTS")}
                  disabled={mode !== "idle"}
                >
                  <span className="practice-choice-icon">🎯</span>
                  <strong>IELTS</strong>
                  <p>{tr ? "Part 1, cue card ve discussion akışıyla band odaklı çalış." : "Practice Part 1, cue cards, and discussion with band-style scoring."}</p>
                </button>
                <button
                  type="button"
                  className={`practice-choice-card ${examType === "TOEFL" ? "is-selected" : ""}`}
                  onClick={() => handleExamChange("TOEFL")}
                  disabled={mode !== "idle"}
                >
                  <span className="practice-choice-icon">🗣️</span>
                  <strong>TOEFL</strong>
                  <p>{tr ? "Independent ve integrated speaking görevleriyle daha düzenli çalış." : "Train with independent and integrated speaking tasks more clearly."}</p>
                </button>
              </div>

              <div className="practice-wizard-grid">
                {taskOptions[examType].map((option) => {
                  const meta = getTaskCardMeta(option, tr);
                  return (
                    <button
                      key={option}
                      type="button"
                      className={`practice-choice-card ${taskType === option ? "is-selected" : ""}`}
                      onClick={() => handleTaskChange(option)}
                      disabled={mode !== "idle"}
                    >
                      <span className="practice-choice-icon">{meta.icon}</span>
                      <strong>{meta.title}</strong>
                      <p>{meta.description}</p>
                    </button>
                  );
                })}
              </div>

              <div className="practice-topic-panel">
                <div className="practice-topic-head">
                  <div>
                    <strong>{tr ? "Sana önerilen konular" : "Recommended for you"}</strong>
                    <p className="practice-meta">
                      {tr ? "Önce bunlardan biriyle başla, sonra istersen tüm konulara göz at." : "Start with one of these, then browse all topics if you want more control."}
                    </p>
                  </div>
                  <div className="practice-topic-actions">
                    <button type="button" className="button button-secondary" onClick={surpriseMe} disabled={!availablePrompts.length || mode !== "idle"}>
                      {tr ? "Sürpriz başlat" : "Surprise Me"}
                    </button>
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={() => setShowAllTopics((current) => !current)}
                      disabled={mode !== "idle"}
                    >
                      {showAllTopics ? (tr ? "Listeyi kapat" : "Hide all") : (tr ? "Ara / tümünü gör" : "Search / Browse all")}
                    </button>
                  </div>
                </div>

                <div className="practice-wizard-grid">
                  {recommendedPrompts.map((prompt) => (
                    <article key={prompt.id} className={`practice-topic-card ${preferredPromptId === prompt.id ? "is-selected" : ""}`}>
                      <div className="practice-topic-card-copy">
                        <span className="pill">{tr ? translateDifficulty(prompt.difficulty) : prompt.difficulty}</span>
                        <strong>{prompt.title}</strong>
                        <p className="practice-meta">{humanizeTaskType(prompt.taskType, tr)}</p>
                      </div>
                      <button
                        type="button"
                        className="button button-primary"
                        onClick={() => void pickPromptAndStart(prompt.id)}
                        disabled={!currentUser || mode !== "idle"}
                      >
                        {tr ? "Bu konuyla başla" : "Start"}
                      </button>
                    </article>
                  ))}
                </div>

                {showAllTopics ? (
                  <div className="practice-topic-browser">
                    <input
                      className="practice-topic-search"
                      value={topicSearch}
                      onChange={(event) => setTopicSearch(event.target.value)}
                      placeholder={tr ? "Konu veya görev ara" : "Search topics or task types"}
                    />
                    <div className="practice-topic-list">
                      {filteredPrompts.map((prompt) => (
                        <article key={`browse-${prompt.id}`} className={`practice-topic-row ${preferredPromptId === prompt.id ? "is-selected" : ""}`}>
                          <div>
                            <strong>{prompt.title}</strong>
                            <div className="practice-meta">{humanizeTaskType(prompt.taskType, tr)} · {tr ? translateDifficulty(prompt.difficulty) : prompt.difficulty}</div>
                          </div>
                          <button
                            type="button"
                            className="button button-secondary"
                            onClick={() => void pickPromptAndStart(prompt.id)}
                            disabled={!currentUser || mode !== "idle"}
                          >
                            {tr ? "Başlat" : "Start"}
                          </button>
                        </article>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

          </div>

          <div className="practice-main-insights">
            <div className="card practice-tone-card practice-tone-card-cool practice-focus-card">
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", flexWrap: "wrap", alignItems: "center" }}>
                <strong>{tr ? "Bugünkü odak" : "Today's focus"}</strong>
                <span className="pill">{focusInsight.badge}</span>
              </div>
              <p style={{ margin: 0, lineHeight: 1.7 }}>{focusInsight.primary}</p>
              <p className="practice-meta" style={{ margin: 0 }}>{focusInsight.secondary}</p>
            </div>

            <div className="card practice-tone-card practice-tone-card-warm practice-answer-plan-card">
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", flexWrap: "wrap", alignItems: "center" }}>
                <strong>{tr ? "Cevap planı" : "Answer plan"}</strong>
                <span className="pill">{answerModeGuide.badge}</span>
              </div>
              <p style={{ margin: 0, lineHeight: 1.7 }}>{answerModeGuide.primary}</p>
              <div className="simulation-queue practice-answer-moves" style={{ marginTop: "0.8rem" }}>
                {answerModeGuide.moves.map((move) => (
                  <span key={move} className="simulation-step is-active">{move}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="card practice-panel practice-sidebar">
          <div className="card practice-tone-card practice-tone-card-warm practice-sidebar-card">
            <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", flexWrap: "wrap", alignItems: "center" }}>
              <strong>{tr ? "Drill ayarı" : "Drill goal"}</strong>
              <span className="pill">{tr ? "Kontrol" : "Control"}</span>
            </div>
            <div className="practice-sidebar-selects">
              <SelectField
                label={tr ? "Drill hedefi" : "Drill goal"}
                value={drillGoal}
                onChange={(value) => setDrillGoal(value as DrillGoal)}
                options={[
                  { value: "balanced", label: tr ? "Dengeli" : "Balanced" },
                  { value: "fluency", label: tr ? "Akıcılık" : "Fluency" },
                  { value: "pronunciation", label: tr ? "Telaffuz" : "Pronunciation" },
                  { value: "topicDevelopment", label: tr ? "İçerik gelişimi" : "Topic development" }
                ]}
                disabled={runMode === "simulation"}
              />
              <SelectField
                label={tr ? "Cevap modu" : "Answer mode"}
                value={answerMode}
                onChange={(value) => setAnswerMode(value as AnswerMode)}
                options={[
                  { value: "safe", label: tr ? "Güvenli" : "Safe" },
                  { value: "natural", label: tr ? "Doğal" : "Natural" },
                  { value: "bold", label: tr ? "Cesur" : "Bold" }
                ]}
                disabled={runMode === "simulation"}
              />
            </div>
            <div className="practice-run-modes practice-run-modes-compact">
              <button
                className={`button ${runMode === "drill" ? "button-primary" : "button-secondary"}`}
                type="button"
                onClick={() => {
                  setRunMode("drill");
                  setSimulationState(null);
                }}
                disabled={mode !== "idle"}
              >
                {tr ? "Tek görev" : "Drill"}
              </button>
              <button
                className={`button ${runMode === "simulation" ? "button-primary" : "button-secondary"}`}
                type="button"
                onClick={() => {
                  setRunMode("simulation");
                  setPreferredPromptId(undefined);
                }}
                disabled={mode !== "idle"}
              >
                {tr ? "Simülasyon" : "Simulation"}
              </button>
              <button
                className={`button ${runMode === "pronunciation" ? "button-primary" : "button-secondary"}`}
                type="button"
                onClick={() => {
                  setRunMode("pronunciation");
                  setSimulationState(null);
                }}
                disabled={mode !== "idle"}
              >
                {tr ? "Telaffuz" : "Pronunciation"}
              </button>
            </div>
            <details className="practice-collapsible practice-collapsible-compact">
              <summary>
                <strong>{tr ? "Gelişmiş ayarlar" : "Advanced options"}</strong>
                <span className="pill">{tr ? "İsteğe bağlı" : "Optional"}</span>
              </summary>
              <div className="practice-form-grid practice-form-grid-compact" style={{ marginTop: "0.8rem" }}>
                <SelectField label={tr ? "Sınav" : "Exam"} value={examType} onChange={handleExamChange} options={[{ value: "IELTS", label: "IELTS" }, { value: "TOEFL", label: "TOEFL" }]} />
                <SelectField label={tr ? "Görev tipi" : "Task type"} value={effectiveTaskType} onChange={handleTaskChange} options={taskOptions[examType].map((option) => ({ value: option, label: humanizeTaskType(option, tr) }))} disabled={runMode === "simulation"} />
                <SelectField label={tr ? "Seviye" : "Difficulty"} value={difficulty} onChange={handleDifficultyChange} options={["Starter", "Target", "Stretch"].map((option) => ({ value: option, label: tr ? translateDifficulty(option as Difficulty) : option }))} />
                <SelectField label={tr ? "Plan" : "Plan"} value={currentUser?.plan ?? "free"} onChange={() => undefined} options={[{ value: currentUser?.plan ?? "free", label: humanizePlan(currentUser?.plan ?? "free", tr) }]} disabled />
              </div>
            </details>
          </div>

          <div className="card practice-status-card practice-sidebar-card">
            <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", flexWrap: "wrap", alignItems: "center" }}>
              <strong>{tr ? "Sıradaki adım" : "Next steps"}</strong>
              {liveMicVisible ? (
                <span className={`mic-pill ${recordingLive ? "is-live" : "is-ready"}`}>
                  <span className="mic-pill-dot" />
                  {recordingLive
                    ? tr ? "Mikrofon canlı" : "Mic live"
                    : micReady
                      ? tr ? "Mikrofon hazır" : "Mic ready"
                      : tr ? "Mikrofon bekleniyor" : "Waiting for mic"}
                </span>
              ) : (
                <span className="pill">{progressLabel}</span>
              )}
            </div>
            <p className="practice-status-copy">{status}</p>
            {currentUser ? (
              <p className="practice-meta practice-meta-compact">
                {tr ? `Aktif plan: ${humanizePlan(currentUser.plan, tr)}` : `Active plan: ${humanizePlan(currentUser.plan, tr)}`}
              </p>
            ) : null}
            {session?.transcriptStatus ? <p className="practice-meta practice-meta-compact">{session.transcriptStatus}</p> : null}
            {preferredPromptId && mode === "idle" ? (
              <p className="practice-meta practice-meta-compact">{tr ? "Bu oturum aynı soruyu tekrar denemek için hazırlandı." : "This session is preloaded to retry the same prompt."}</p>
            ) : null}
            {error ? <p className="practice-error">{error}</p> : null}
          </div>

          <div className="card practice-simulation-card practice-sidebar-card">
            <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", flexWrap: "wrap", alignItems: "center" }}>
              <strong>{tr ? "Bu deneme için yönlendirme" : "Guidance for this attempt"}</strong>
              <span className="pill">{runMode === "simulation" ? (tr ? "Tam akış" : "Full flow") : runMode === "pronunciation" ? (tr ? "Net söyleyiş" : "Clear speech") : (tr ? "Akıllı seçim" : "Smart pick")}</span>
            </div>
            {runMode !== "simulation" && adaptivePlanPreview ? (
              <p className="practice-meta practice-meta-compact" style={{ margin: "0.45rem 0 0.8rem" }}>{adaptivePlanPreview.reason}</p>
            ) : null}
            {runMode === "simulation" ? (
              <p className="practice-meta practice-meta-compact" style={{ margin: "0.45rem 0 0.8rem" }}>
                {tr ? `${examType} simülasyonu resmi görev sırasını takip eder. Tek soru yerine tüm akış çalışır.` : `${examType} simulation follows the official task order. The full sequence runs instead of a single prompt.`}
              </p>
            ) : null}
            {runMode === "pronunciation" ? (
              <p className="practice-meta practice-meta-compact" style={{ margin: "0.45rem 0 0.8rem" }}>{pronunciationGuide.lead}</p>
            ) : null}
            <div className="simulation-queue practice-answer-moves">
              {runMode === "simulation"
                ? simulationQueue.map((queuedTask, index) => {
                    const completed = Boolean(simulationState?.completed[index]);
                    const active = !completed && (simulationState ? index === simulationState.currentIndex : index === 0);
                    return (
                      <span key={queuedTask} className={`simulation-step ${completed ? "is-complete" : active ? "is-active" : ""}`}>
                        {index + 1}. {humanizeTaskType(queuedTask, tr)}
                      </span>
                    );
                  })
                : runMode === "pronunciation"
                  ? pronunciationGuide.focusWords.map((word) => (
                      <span key={word} className="simulation-step is-active">{word}</span>
                    ))
                  : answerModeGuide.moves.map((move) => (
                      <span key={move} className="simulation-step is-active">{move}</span>
                    ))}
            </div>
          </div>

          <span className="eyebrow">{runMode === "simulation" ? (tr ? "Simülasyon durumu" : "Simulation status") : tr ? "Aktif görev" : "Active task"}</span>
          {runMode === "simulation" ? (
            <div className="card practice-simulation-card" style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", flexWrap: "wrap", alignItems: "center" }}>
                <strong>{tr ? `${examType} speaking simulasyonu` : `${examType} speaking simulation`}</strong>
                <span className="pill">{simulationState?.completed.length ?? 0}/{simulationQueue.length}</span>
              </div>
              <p className="practice-meta" style={{ margin: "0.5rem 0 0.8rem" }}>
                {simulationState?.finishedAt
                  ? tr ? "Tum gorevler bitti. Ortalama ve gorev bazli performans asagida." : "All tasks are complete. Your average and task-level performance appear below."
                  : tr ? `${humanizeTaskType(activeSimulationTask ?? simulationQueue[0], true)} siradaki resmi gorev.` : `${humanizeTaskType(activeSimulationTask ?? simulationQueue[0], false)} is the next official task.`}
              </p>
              <div className="simulation-queue">
                {simulationQueue.map((queuedTask, index) => {
                  const completed = Boolean(simulationState?.completed[index]);
                  const active = !completed && (simulationState ? index === simulationState.currentIndex : index === 0);
                  return (
                    <span key={`sidebar-${queuedTask}`} className={`simulation-step ${completed ? "is-complete" : active ? "is-active" : ""}`}>
                      {index + 1}. {humanizeTaskType(queuedTask, tr)}
                    </span>
                  );
                })}
              </div>
              {simulationState?.completed.length ? (
                <div className="simulation-results">
                  {simulationState.completed.map((item, index) => (
                    <div key={item.sessionId} className="simulation-result-row">
                      <span>{index + 1}. {humanizeTaskType(item.taskType, tr)}</span>
                      <span>{item.score?.toFixed(1) ?? "-"}</span>
                    </div>
                  ))}
                </div>
              ) : null}
              {simulationState?.finishedAt && simulationAverage ? (
                <>
                  <div className="card practice-result-preview" style={{ marginTop: "0.9rem" }}>
                    <div style={{ fontWeight: 800, fontSize: "1.6rem" }}>{simulationAverage}</div>
                    <div className="practice-meta">{tr ? "Simulasyon ortalamasi" : "Simulation average"}</div>
                  </div>
                  <div className="card practice-simulation-card" style={{ marginTop: "0.9rem" }}>
                    <div style={{ display: "grid", gap: "0.45rem" }}>
                      <strong>{tr ? "Mock exam summary" : "Mock exam summary"}</strong>
                      <p className="practice-meta" style={{ margin: 0 }}>{simulationSummary.headline}</p>
                    </div>
                    <div className="simulation-summary-grid">
                      <div className="simulation-summary-tile">
                        <span className="practice-meta">{tr ? "Hazirlik seviyesi" : "Readiness"}</span>
                        <strong>{simulationSummary.readinessLabel}</strong>
                      </div>
                      <div className="simulation-summary-tile">
                        <span className="practice-meta">{tr ? "Hedef mesafesi" : "Target gap"}</span>
                        <strong>{simulationSummary.gapLabel}</strong>
                      </div>
                    </div>
                    <p style={{ margin: 0, lineHeight: 1.7 }}>{simulationSummary.body}</p>
                    <div className="card practice-tone-card practice-tone-card-cool practice-tone-card-inline">
                      <strong style={{ display: "block", marginBottom: "0.35rem" }}>{tr ? "Bir sonraki net odak" : "One clear next focus"}</strong>
                      <p style={{ margin: 0, lineHeight: 1.65 }}>{simulationSummary.nextStep}</p>
                    </div>
                    <Link href="/app/mock-results" className="button button-primary" style={{ width: "100%" }}>
                      {tr ? "Tam mock raporunu ac" : "Open full mock report"}
                    </Link>
                  </div>
                </>
              ) : null}
            </div>
          ) : null}
          {session ? (
            <>
              <div>
                <div className="practice-meta" style={{ marginBottom: "0.5rem" }}>
                  {session.examType} · {humanizeTaskType(session.taskType, tr)} · {tr ? translateDifficulty(session.difficulty) : session.difficulty}
                </div>
                <h2 className="practice-task-title">{session.prompt.title}</h2>
              </div>
              <TaskPromptLayout layout={activeTaskLayout} />
              {runMode === "pronunciation" ? (
                <div className="card practice-simulation-card" style={{ marginTop: "1rem" }}>
                  <strong>{tr ? "Telaffuz rehberi" : "Pronunciation guide"}</strong>
                  <p className="practice-meta" style={{ margin: "0.45rem 0 0.8rem" }}>{pronunciationGuide.lead}</p>
                  <div className="simulation-queue">
                    {pronunciationGuide.focusWords.map((word) => (
                      <span key={`guide-${word}`} className="simulation-step is-active">{word}</span>
                    ))}
                  </div>
                  <ul style={{ margin: "0.8rem 0 0", paddingLeft: "1.15rem" }}>
                    {pronunciationGuide.tips.map((tip) => (
                      <li key={tip} style={{ marginTop: "0.35rem", lineHeight: 1.6 }}>{tip}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <NotePad
                layout={activeTaskLayout}
                value={noteDraft}
                onChange={setNoteDraft}
                tr={tr}
              />
              <TaskBriefCard briefing={activeBriefing} />
              <div className="practice-metrics">
                <Metric label={tr ? "Hazirlik suresi" : "Prep time"} value={`${session.prompt.prepSeconds}s`} />
                <Metric label={tr ? "Konusma suresi" : "Speaking time"} value={`${session.prompt.speakingSeconds}s`} />
              </div>
              {session.report ? (
                <div className="card practice-result-preview">
                  <div style={{ fontWeight: 800, fontSize: "1.6rem" }}>{session.report.overall}</div>
                  <div className="practice-meta">{session.report.scaleLabel}</div>
                  <Link href={`/app/results/${session.id}`} style={{ color: "var(--accent-deep)", fontWeight: 700 }}>
                    {tr ? "Tum sonucu ac" : "Open full result"}
                  </Link>
                </div>
              ) : null}
            </>
          ) : (
            <div className="practice-empty-state">
              <strong>{tr ? "Siradaki session burada gorunecek" : "Your next session will appear here"}</strong>
              <p>{tr ? "Soru, sureler ve kayit akisinin yuklenmesi icin bir session baslat." : "Create a session to load the speaking prompt, timers, and recording flow."}</p>
              <TaskBriefCard briefing={activeBriefing} compact />
              <TaskPromptLayout layout={activeTaskLayout} compact />
              {runMode === "pronunciation" ? (
                <div className="card practice-simulation-card">
                  <strong>{tr ? "Telaffuz rehberi" : "Pronunciation guide"}</strong>
                  <p className="practice-meta" style={{ margin: "0.45rem 0 0.8rem" }}>{pronunciationGuide.lead}</p>
                  <div className="simulation-queue">
                    {pronunciationGuide.focusWords.map((word) => (
                      <span key={`empty-guide-${word}`} className="simulation-step is-active">{word}</span>
                    ))}
                  </div>
                </div>
              ) : null}
              <NotePad layout={activeTaskLayout} value={noteDraft} onChange={setNoteDraft} tr={tr} compact />
            </div>
          )}
          {retryQueue.length ? (
            <details className="card practice-simulation-card practice-collapsible practice-sidebar-card">
              <summary>
                <strong>{tr ? "Kaydedilen retry listesi" : "Saved retry queue"}</strong>
                <span className="pill">{retryQueue.length}</span>
              </summary>
              <div className="grid" style={{ gap: "0.65rem", marginTop: "0.8rem" }}>
                {retryQueue.slice(0, 6).map((item) => (
                  <div key={`${item.promptId}-${item.createdAt}`} className="card" style={{ padding: "0.9rem", background: "var(--surface-strong)", display: "grid", gap: "0.55rem" }}>
                    <strong>{item.title}</strong>
                    <div className="practice-meta">{item.examType} · {humanizeTaskType(item.taskType, tr)}</div>
                    <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                      <Link
                        href={{ pathname: "/app/practice", query: { promptId: item.promptId, examType: item.examType, taskType: item.taskType, difficulty: item.difficulty } }}
                        className="button button-secondary"
                        style={{ padding: "0.55rem 0.9rem" }}
                      >
                        {tr ? "Tekrar aç" : "Open retry"}
                      </Link>
                      <button type="button" className="button button-secondary" style={{ padding: "0.55rem 0.9rem" }} onClick={() => removeRetryItem(item.promptId)}>
                        {tr ? "Kaldır" : "Remove"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          ) : null}

          {bookmarks.length ? (
            <details className="card practice-simulation-card practice-collapsible practice-sidebar-card">
              <summary>
                <strong>{tr ? "Kaydedilen sorular" : "Bookmarked prompts"}</strong>
                <span className="pill">{bookmarks.length}</span>
              </summary>
              <div className="grid" style={{ gap: "0.65rem", marginTop: "0.75rem" }}>
                {bookmarks.slice(0, 6).map((item) => (
                  <div key={item.promptId} className="card practice-bookmark-card">
                    <strong>{item.title}</strong>
                    <div className="practice-meta">{item.examType} · {humanizeTaskType(item.taskType, tr)}</div>
                    <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                      <button type="button" className="button button-secondary" onClick={() => loadBookmark(item)}>
                        {tr ? "Yükle" : "Load"}
                      </button>
                      <button type="button" className="button button-secondary" onClick={() => removeBookmark(item.promptId)}>
                        {tr ? "Sil" : "Remove"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          ) : null}
        </section>
      </div>

      <div className="practice-action-bar">
        <div className="page-shell practice-action-bar-shell">
          <button className="button button-primary" type="button" onClick={() => void startSession()} disabled={!currentUser || mode === "permission" || mode === "prep" || mode === "speak" || mode === "saving"}>
            {runMode === "simulation"
              ? simulationState?.finishedAt
                ? tr ? "Simülasyonu yeniden başlat" : "Restart simulation"
                : simulationState?.completed.length
                  ? tr ? "Sıradaki göreve geç" : "Continue simulation"
                  : tr ? "Simülasyonu başlat" : "Start simulation"
              : runMode === "pronunciation"
                ? tr ? "Telaffuz denemesini başlat" : "Start pronunciation drill"
                : tr ? "Konuşmayı başlat" : retryMode ? "Retry same prompt" : "Start Speaking Now"}
          </button>
          <button className="button button-secondary" type="button" onClick={endEarly} disabled={(mode !== "permission" && mode !== "prep" && mode !== "speak") && !simulationIdle}>
            {simulationIdle && runMode === "simulation"
              ? tr ? "Simülasyonu bitir" : "End simulation"
              : mode === "speak"
                ? tr ? "Cevabı bitir" : "Finish answer"
                : tr ? "Çıkış" : "Exit"}
          </button>
          <button className="button button-secondary" type="button" onClick={saveBookmark} disabled={runMode === "simulation" && !session}>
            {tr ? "Soruyu kaydet" : "Bookmark prompt"}
          </button>
        </div>
      </div>

      {session && (mode === "permission" || mode === "prep" || mode === "speak" || mode === "saving") ? (
        <div className="practice-overlay">
          <div className="card practice-overlay-card">
            <span className="eyebrow">
              {mode === "permission"
                ? tr ? "Mikrofon kontrolu" : "Microphone check"
                : mode === "prep"
                  ? tr ? "Hazirlan" : "Get ready"
                  : mode === "speak"
                    ? tr ? "Simdi konus" : "Speak now"
                    : tr ? "Analiz" : "Analyzing"}
            </span>
            <div className="practice-overlay-number">{mode === "permission" ? "Mic" : mode === "saving" ? "..." : remainingSeconds}</div>
            <h2 className="practice-overlay-title" style={{ margin: 0 }}>
              {mode === "permission"
                ? tr ? "Mikrofon izni ver" : "Allow microphone access"
                : mode === "prep"
                  ? runMode === "pronunciation"
                    ? tr ? "Geri sayim bitince telaffuz kaydi otomatik baslayacak" : "Pronunciation recording starts automatically after the countdown"
                    : tr ? "Geri sayim bitince kayit otomatik baslayacak" : "Recording starts automatically after the countdown"
                  : mode === "speak"
                    ? runMode === "pronunciation"
                      ? tr ? "Kelimeleri net bitir, vurguyu belirginlestir ve ritmi koru" : "Finish words clearly, stress key syllables, and keep a steady rhythm"
                      : tr ? "Net konus ve istersen erken bitir" : "Now speak clearly and keep going until the timer ends"
                    : tr ? "Cevabin kaydediliyor ve degerlendiriliyor" : "Saving and evaluating your answer"}
            </h2>
            <p className="practice-overlay-prompt">
              {mode === "permission"
                ? tr ? "Tarayicin once mikrofon izni isteyecek. Izin verince geri sayim baslar." : "Your browser will ask for permission first. Once allowed, the countdown begins."
                : mode === "saving"
                  ? tr ? "Birkac saniye icinde transcript ve speaking analizi hazir olacak." : "Your transcript and speaking review will be ready in a few seconds."
                  : activeTaskLayout.overlayPrompt}
            </p>
            <div className="practice-overlay-mic" style={{ display: "grid", gap: "0.8rem", justifyItems: "center" }}>
              <span className={`mic-pill ${recordingLive ? "is-live" : micReady ? "is-ready" : ""}`}>
                <span className="mic-pill-dot" />
                {recordingLive
                  ? tr ? "Kayit acik" : "Recording live"
                  : micReady
                    ? tr ? "Mikrofon hazir" : "Mic ready"
                    : tr ? "Mikrofon bekleniyor" : "Waiting for mic"}
              </span>
              {(mode === "prep" || mode === "speak") ? (
                <div className="card practice-tone-card practice-tone-card-cool practice-overlay-focus-card">
                  <strong style={{ display: "block", marginBottom: "0.35rem" }}>{tr ? "Bu denemedeki tek odak" : "One focus for this attempt"}</strong>
                  <p style={{ margin: 0, lineHeight: 1.65 }}>{runMode === "pronunciation" ? pronunciationGuide.overlayFocus : focusInsight.primary}</p>
                </div>
              ) : null}
            </div>
            <div className="practice-overlay-actions">
              {(mode === "prep" || mode === "permission") ? (
                <button className="button button-secondary" type="button" onClick={endEarly}>
                  {tr ? "Session'dan cik" : "Exit session"}
                </button>
              ) : null}
              {mode === "permission" ? (
                <button className="button button-primary" type="button" onClick={() => void requestMicrophoneAccess()}>
                  {tr ? "Mikrofon izni ver" : "Allow microphone access"}
                </button>
              ) : null}
              {mode === "prep" ? (
                <button className="button button-primary" type="button" onClick={skipPrep}>
                  {tr ? "Hazirligi gec, simdi konus" : "Skip prep and speak now"}
                </button>
              ) : null}
              {mode === "speak" ? (
                <button className="button button-primary" type="button" onClick={endEarly}>
                  {tr ? "Cevabi simdi bitir" : "Finish answer now"}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function readRetryQueue(): RetryQueueItem[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem("speakace-retry-queue");
  if (!raw) return [];
  try {
    return JSON.parse(raw) as RetryQueueItem[];
  } catch {
    return [];
  }
}

function buildPronunciationGuide(prompt: string, tr: boolean) {
  const focusWords = extractFocusWords(prompt);
  return {
    lead: tr
      ? "Asagidaki kelimeleri biraz daha yavas, daha net ve daha belirgin vurgu ile soylemeye odaklan."
      : "Focus on saying the words below a little slower, more clearly, and with more obvious stress.",
    overlayFocus: tr
      ? `Bugun tek gorevin: ${focusWords.slice(0, 3).join(", ")} gibi anahtar kelimeleri temiz bitirmek.`
      : `One focus today: finish key words like ${focusWords.slice(0, 3).join(", ")} more clearly.`,
    focusWords,
    tips: tr
      ? [
          "Kelime sonlarini yutma; son sessizleri hafif de olsa duyur.",
          "Uzun cumle yerine daha kontrollu ve sabit bir ritim hedefle.",
          "Vurgu gereken kelimelerde sesi bir tik belirginlestir."
        ]
      : [
          "Do not swallow word endings; let the final sounds be heard.",
          "Aim for a controlled and steady rhythm instead of long rushed lines.",
          "Make the stressed key words slightly more prominent."
        ]
  };
}

function extractFocusWords(prompt: string) {
  const stopwords = new Set(["describe", "about", "that", "your", "with", "from", "this", "have", "what", "when", "where", "which", "explain", "would", "like", "talk", "place", "thing", "person"]);
  const words = prompt
    .toLowerCase()
    .match(/[a-z']+/g)
    ?.filter((word) => word.length > 3 && !stopwords.has(word)) ?? [];
  const extracted = [...new Set(words)].slice(0, 5).map((word) => word.charAt(0).toUpperCase() + word.slice(1));
  return extracted.length ? extracted : ["Clarity", "Stress", "Rhythm"];
}

function SelectField({
  label,
  value,
  onChange,
  options,
  disabled = false
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <label className="practice-field">
      <span className="practice-field-label">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="practice-select" disabled={disabled}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function humanizeTaskType(taskType: TaskType, tr: boolean) {
  const labels: Record<TaskType, { en: string; tr: string }> = {
    "ielts-part-1": { en: "IELTS Part 1", tr: "IELTS Part 1" },
    "ielts-part-2": { en: "IELTS Part 2", tr: "IELTS Part 2" },
    "ielts-part-3": { en: "IELTS Part 3", tr: "IELTS Part 3" },
    "toefl-task-1": { en: "TOEFL Task 1", tr: "TOEFL Gorev 1" },
    "toefl-task-2": { en: "TOEFL Task 2", tr: "TOEFL Gorev 2" },
    "toefl-task-3": { en: "TOEFL Task 3", tr: "TOEFL Gorev 3" },
    "toefl-task-4": { en: "TOEFL Task 4", tr: "TOEFL Gorev 4" },
    "toefl-independent": { en: "TOEFL Independent", tr: "TOEFL Independent" },
    "toefl-integrated": { en: "TOEFL Integrated", tr: "TOEFL Integrated" }
  };
  return tr ? labels[taskType].tr : labels[taskType].en;
}

function humanizePlan(plan: string, tr: boolean) {
  if (plan === "pro") return "Pro";
  if (plan === "plus") return "Plus";
  return tr ? "Ucretsiz" : "Free";
}

function getTaskCardMeta(taskType: TaskType, tr: boolean) {
  const meta: Record<TaskType, { icon: string; titleEn: string; titleTr: string; descriptionEn: string; descriptionTr: string }> = {
    "ielts-part-1": {
      icon: "👋",
      titleEn: "Part 1: Introduction",
      titleTr: "Part 1: Tanışma",
      descriptionEn: "Short warm-up questions about familiar daily topics.",
      descriptionTr: "Tanıdık günlük konular hakkında kısa ısınma soruları."
    },
    "ielts-part-2": {
      icon: "📝",
      titleEn: "Part 2: Cue Card",
      titleTr: "Part 2: Cue Card",
      descriptionEn: "A longer answer built around one topic card and story flow.",
      descriptionTr: "Tek bir cue card üzerinden daha uzun ve akışlı cevap."
    },
    "ielts-part-3": {
      icon: "💬",
      titleEn: "Part 3: Discussion",
      titleTr: "Part 3: Tartışma",
      descriptionEn: "Opinion and analysis questions that need clearer reasoning.",
      descriptionTr: "Daha net gerekçe isteyen görüş ve analiz soruları."
    },
    "toefl-task-1": {
      icon: "🎙️",
      titleEn: "Task 1: Independent",
      titleTr: "Task 1: Independent",
      descriptionEn: "State your opinion fast and support it with one example.",
      descriptionTr: "Görüşünü hızlıca söyle ve tek bir örnekle destekle."
    },
    "toefl-task-2": {
      icon: "📚",
      titleEn: "Task 2: Campus",
      titleTr: "Task 2: Campus",
      descriptionEn: "Summarize a notice and explain two student reactions.",
      descriptionTr: "Bir duyuruyu özetle ve iki öğrenci görüşünü açıkla."
    },
    "toefl-task-3": {
      icon: "🧠",
      titleEn: "Task 3: Academic Concept",
      titleTr: "Task 3: Akademik Kavram",
      descriptionEn: "Connect a reading concept to the lecturer's example.",
      descriptionTr: "Okuma parçasındaki kavramı hocanın örneğine bağla."
    },
    "toefl-task-4": {
      icon: "🎓",
      titleEn: "Task 4: Lecture Summary",
      titleTr: "Task 4: Lecture Özeti",
      descriptionEn: "Summarize the main topic and two key supporting points.",
      descriptionTr: "Ana konuyu ve iki temel destek noktasını özetle."
    },
    "toefl-independent": {
      icon: "🎙️",
      titleEn: "Independent Speaking",
      titleTr: "Independent Speaking",
      descriptionEn: "Give a personal opinion with cleaner structure.",
      descriptionTr: "Kişisel görüşünü daha temiz yapıyla anlat."
    },
    "toefl-integrated": {
      icon: "🔗",
      titleEn: "Integrated Speaking",
      titleTr: "Integrated Speaking",
      descriptionEn: "Combine reading and listening into one focused answer.",
      descriptionTr: "Okuma ve dinlemeyi tek bir odaklı cevapta birleştir."
    }
  };

  const item = meta[taskType];
  return {
    icon: item.icon,
    title: tr ? item.titleTr : item.titleEn,
    description: tr ? item.descriptionTr : item.descriptionEn
  };
}

function translateDifficulty(difficulty: Difficulty) {
  if (difficulty === "Starter") return "Baslangic";
  if (difficulty === "Target") return "Hedef";
  return "Zorlayici";
}

type TaskBriefing = {
  title: string;
  focus: string;
  bullets: string[];
};

function TaskBriefCard({ briefing, compact = false }: { briefing: TaskBriefing; compact?: boolean }) {
  return (
    <div className={`card practice-brief-card ${compact ? "is-compact" : ""}`}>
      <strong>{briefing.title}</strong>
      <p className="practice-meta" style={{ marginTop: "0.55rem" }}>{briefing.focus}</p>
      <ul style={{ margin: "0.7rem 0 0", paddingLeft: "1.15rem" }}>
        {briefing.bullets.map((bullet) => (
          <li key={bullet} style={{ marginTop: "0.35rem", lineHeight: 1.55 }}>{bullet}</li>
        ))}
      </ul>
    </div>
  );
}

function buildTaskBriefing(examType: ExamType, taskType: TaskType, tr: boolean): TaskBriefing {
  if (examType === "IELTS") {
    if (taskType === "ielts-part-1") {
      return {
        title: tr ? "Part 1 stratejisi" : "Part 1 strategy",
        focus: tr ? "Kisa interview cevabi ver: net cevap + 1 neden." : "Give a short interview answer: direct response + 1 reason.",
        bullets: tr
          ? ["Kisa ve dogal konus", "Direkt cevap ver", "1 mini ornek veya neden ekle"]
          : ["Keep it short and natural", "Answer directly", "Add 1 quick reason or example"]
      };
    }
    if (taskType === "ielts-part-2") {
      return {
        title: tr ? "Part 2 cue card plani" : "Part 2 cue card plan",
        focus: tr ? "Uzun turn beklenir. Giris, gelisme, kapanis yapisi kullan." : "A longer turn is expected. Use an opening, middle, and close.",
        bullets: tr
          ? ["Konuya giris yap", "En az 2-3 detay ver", "Cue card maddelerini kapsa", "Kisa bir kapanisla bitir"]
          : ["Start with a clear topic sentence", "Give at least 2-3 details", "Cover the cue-card points", "End with a short closing line"]
      };
    }
    return {
      title: tr ? "Part 3 discussion plani" : "Part 3 discussion plan",
      focus: tr ? "Fikir + neden + ornek yapisi en guclu formdur." : "Opinion + reason + example is the strongest format.",
      bullets: tr
        ? ["Daha analitik konus", "Neden-sonuc kur", "Kisa bir gercek hayat ornegi ekle"]
        : ["Sound more analytical", "Explain cause and effect", "Add one short real-world example"]
    };
  }

  if (taskType === "toefl-task-1") {
    return {
      title: tr ? "TOEFL Task 1 plani" : "TOEFL Task 1 plan",
      focus: tr ? "Kendi gorusunu savun. Ilk cumlede fikrini soyle." : "Defend your own opinion. State it in the first sentence.",
      bullets: tr
        ? ["Net opinion ile basla", "1 ana sebep ver", "1 detayli ornek kullan"]
        : ["Open with a clear opinion", "Give 1 main reason", "Use 1 detailed example"]
    };
  }
  if (taskType === "toefl-task-2") {
    return {
      title: tr ? "TOEFL Task 2 plani" : "TOEFL Task 2 plan",
      focus: tr ? "Duyuru + ogrenci tepkisi ozetlenir. Kendi fikrini ekleme." : "Summarize the announcement and student reaction. Do not add your own opinion.",
      bullets: tr
        ? ["Duyuruyu kisaca ozetle", "1. kisinin gorusunu soyle", "2. kisinin gorusunu soyle"]
        : ["Summarize the announcement briefly", "Explain speaker 1's view", "Explain speaker 2's view"]
    };
  }
  if (taskType === "toefl-task-3") {
    return {
      title: tr ? "TOEFL Task 3 plani" : "TOEFL Task 3 plan",
      focus: tr ? "Akademik kavram + profesör örneği baglantisini anlat." : "Explain the academic concept and connect it to the professor's example.",
      bullets: tr
        ? ["Kavrami tanimla", "Ornegi anlat", "Ornegin kavrami nasil gosterdigini bagla"]
        : ["Define the concept", "Describe the example", "Explain how the example shows the concept"]
    };
  }
  return {
    title: tr ? "TOEFL Task 4 plani" : "TOEFL Task 4 plan",
    focus: tr ? "Dersi ozetle. Ana konu + 2 ana nokta yapisi kullan." : "Summarize the lecture. Use one main topic plus two key points.",
    bullets: tr
      ? ["Ana konuyu hemen belirt", "2 ana noktayi ayir", "Detaylari duzenli sirayla ver"]
      : ["Name the main topic immediately", "Separate 2 key points", "Present details in a clear order"]
  };
}


type TaskPromptLayout = {
  overlayPrompt: string;
  lead?: string;
  cueCardTitle?: string;
  cueBullets?: string[];
  sourcePanels?: Array<{ label: string; body: string; bullets?: string[] }>;
  noteTitle?: string;
  noteHint?: string;
  notePlaceholder?: string;
};

function TaskPromptLayout({ layout, compact = false }: { layout: TaskPromptLayout; compact?: boolean }) {
  const hasSourcePanels = Boolean(layout.sourcePanels?.length);
  const hasCueBullets = Boolean(layout.cueBullets?.length);

  return (
    <div className={`task-layout ${compact ? "is-compact" : ""}`}>
      {layout.lead ? <p className="practice-task-copy">{layout.lead}</p> : null}
      {hasCueBullets ? (
        <div className="task-cue-card">
          <div className="task-cue-card-label">{layout.cueCardTitle}</div>
          <ul className="task-cue-list">
            {layout.cueBullets?.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {hasSourcePanels ? (
        <div className="task-source-grid">
          {layout.sourcePanels?.map((panel) => (
            <div key={`${panel.label}-${panel.body}`} className="task-source-card">
              <div className="task-source-label">{panel.label}</div>
              <p>{panel.body}</p>
              {panel.bullets?.length ? (
                <ul className="task-source-list">
                  {panel.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function NotePad({
  layout,
  value,
  onChange,
  tr,
  compact = false
}: {
  layout: TaskPromptLayout;
  value: string;
  onChange: (value: string) => void;
  tr: boolean;
  compact?: boolean;
}) {
  if (!layout.noteTitle) {
    return null;
  }

  return (
    <div className={`task-note-card ${compact ? "is-compact" : ""}`}>
      <div className="task-note-header">
        <strong>{layout.noteTitle}</strong>
        {layout.noteHint ? <span className="practice-meta">{layout.noteHint}</span> : null}
      </div>
      <textarea
        className="task-note-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={layout.notePlaceholder ?? (tr ? "Kisa notlarini buraya yaz" : "Write quick notes here")}
      />
    </div>
  );
}

function buildTaskLayout(examType: ExamType, taskType: TaskType, prompt: string, tr: boolean): TaskPromptLayout {
  const normalizedPrompt = prompt.trim();

  if (!normalizedPrompt) {
    return {
      overlayPrompt: tr ? "Bir session baslattiginda gorev ayrintilari burada gorunecek." : "Your task details will appear here when you start a session."
    };
  }

  if (examType === "IELTS" && taskType === "ielts-part-2") {
    const cueSegments = normalizedPrompt.split(" You should say ");
    const lead = cueSegments[0]?.trim() ?? normalizedPrompt;
    const bulletText = cueSegments[1] ?? "";
    const cueBullets = bulletText
      .split(",")
      .map((item) => item.trim().replace(/\.$/, ""))
      .filter(Boolean);

    return {
      overlayPrompt: lead,
      lead,
      cueCardTitle: tr ? "Cue card notlari" : "Cue card notes",
      cueBullets,
      noteTitle: tr ? "Hazirlik notlari" : "Prep notes",
      noteHint: tr ? "1 dakikalik hazirlikta sadece anahtar kelimeleri yaz." : "Use your prep minute for keywords only.",
      notePlaceholder: tr ? "Kisi / ne oldu / neden onemli gibi 3-4 kelime yaz" : "Write 3-4 keywords: person / what happened / why it matters"
    };
  }

  if (examType === "TOEFL" && taskType === "toefl-task-2") {
    const readBody = normalizedPrompt.split(" Conversation: ")[0]?.replace(/^Campus notice:\s*/, "").trim() ?? normalizedPrompt;
    const listenBody = normalizedPrompt.split(" Conversation: ")[1]?.trim() ?? "";

    return {
      overlayPrompt: tr ? "Duyuruyu ve ogrenci goruslerini ozetle." : "Summarize the announcement and both student views.",
      lead: tr ? "Bu integrated task'te once duyuruyu, sonra konusmadaki bakis acilarini duzenli anlat." : "In this integrated task, explain the announcement first and then organize the student reactions clearly.",
      sourcePanels: [
        { label: tr ? "Oku" : "Read", body: readBody, bullets: sentenceBullets(readBody) },
        { label: tr ? "Dinle" : "Listen", body: listenBody, bullets: sentenceBullets(listenBody) }
      ].filter((panel) => panel.body),
      noteTitle: tr ? "Speaker notlari" : "Speaker notes",
      noteHint: tr ? "Duyuru + ogrenci A + ogrenci B seklinde not tut." : "Take notes as announcement + speaker A + speaker B.",
      notePlaceholder: tr ? "Duyuru...\nOgrenci 1...\nOgrenci 2..." : "Announcement...\nSpeaker 1...\nSpeaker 2..."
    };
  }

  if (examType === "TOEFL" && taskType === "toefl-task-3") {
    const readBody = normalizedPrompt.split(" Lecture: ")[0]?.replace(/^Reading:\s*/, "").trim() ?? normalizedPrompt;
    const listenBody = normalizedPrompt.split(" Lecture: ")[1]?.trim() ?? "";

    return {
      overlayPrompt: tr ? "Kavrami tanimla ve profesor orunegine bagla." : "Explain the concept and connect it to the professor's example.",
      lead: tr ? "Akademik terimi kisa tanimla, sonra lecturer'in verdigi ornegi bu kavrama bagla." : "Briefly define the academic term, then connect the lecturer's example back to that concept.",
      sourcePanels: [
        { label: tr ? "Oku" : "Read", body: readBody, bullets: sentenceBullets(readBody) },
        { label: tr ? "Dinle" : "Listen", body: listenBody, bullets: sentenceBullets(listenBody) }
      ].filter((panel) => panel.body),
      noteTitle: tr ? "Concept notlari" : "Concept notes",
      noteHint: tr ? "Tanim + ornek + baglanti seklinde not al." : "Take notes as definition + example + connection.",
      notePlaceholder: tr ? "Kavram...\nOrnek...\nBaglanti..." : "Concept...\nExample...\nConnection..."
    };
  }

  if (examType === "TOEFL" && taskType === "toefl-task-4") {
    const lectureBody = normalizedPrompt.replace(/^Lecture summary:\s*/, "");

    return {
      overlayPrompt: tr ? "Ana konu ve iki temel noktayi ozetle." : "Summarize the main topic and the two key supporting points.",
      lead: tr ? "Bu bolum lecture summary ister. Ana konu, ardindan 2 temel detayi sirali ver." : "This task expects a lecture summary. State the main topic, then present the two key details in order.",
      sourcePanels: [{ label: tr ? "Lecture ozeti" : "Lecture summary", body: lectureBody, bullets: sentenceBullets(lectureBody) }],
      noteTitle: tr ? "Lecture notlari" : "Lecture notes",
      noteHint: tr ? "Ana konu + nokta 1 + nokta 2 seklinde not al." : "Take notes as topic + point 1 + point 2.",
      notePlaceholder: tr ? "Ana konu...\nNokta 1...\nNokta 2..." : "Main topic...\nPoint 1...\nPoint 2..."
    };
  }

  return {
    overlayPrompt: normalizedPrompt,
    lead: normalizedPrompt
  };
}

function sentenceBullets(text: string) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim().replace(/[.]+$/, ""))
    .filter(Boolean)
    .slice(0, 4);
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="card practice-metric-card">
      <div className="practice-meta">{label}</div>
      <div style={{ fontSize: "1.4rem", fontWeight: 800 }}>{value}</div>
    </div>
  );
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Could not serialize recording."));
        return;
      }

      resolve(result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function readJsonSafely(response: Response) {
  const raw = await response.text();
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return {};
  }
}

function buildSimulationQueue(examType: ExamType): TaskType[] {
  return examType === "IELTS"
    ? ["ielts-part-1", "ielts-part-2", "ielts-part-3"]
    : ["toefl-task-1", "toefl-task-2", "toefl-task-3", "toefl-task-4"];
}


function buildSimulationSummary({
  examType,
  average,
  targetScore,
  tr,
  completedCount,
  totalCount,
  focusInsightPrimary
}: {
  examType: ExamType;
  average: string | null;
  targetScore: string;
  tr: boolean;
  completedCount: number;
  totalCount: number;
  focusInsightPrimary: string;
}) {
  const numericAverage = Number(average ?? 0);
  const numericTarget = Number(targetScore || 0);
  const gap = numericTarget ? Number((numericTarget - numericAverage).toFixed(1)) : null;

  const thresholds = examType === "IELTS"
    ? { strong: 7, ready: 6 }
    : { strong: 24, ready: 20 };

  let readinessLabel = tr ? "Gelisim asamasi" : "Developing";
  let headline = tr ? "Simulasyon genel resmi cikardi." : "The simulation created a clear overall picture.";
  let body = tr
    ? `Bu tam denemede ${completedCount}/${totalCount} gorev tamamlandi. Ortalama skorun simdilik istikrar ve gorev aktarimi tarafinda gelisime acik gorunuyor.`
    : `In this full mock, ${completedCount}/${totalCount} tasks were completed. Your average score still shows room for growth in consistency and task execution.`;

  if (numericAverage >= thresholds.strong) {
    readinessLabel = tr ? "Guclu hazirlik" : "Strong readiness";
    headline = tr ? "Mock exam sonucu hedefe yakin bir taban gosteriyor." : "The mock exam shows a strong base close to exam-ready performance.";
    body = tr
      ? "Tam simulasyonda puani task'ler arasinda koruyabildin. Bundan sonraki kazanc en cok ayrinti kalitesi ve dogal akista gelir."
      : "You sustained your level across tasks in the full simulation. The next gain will mostly come from sharper detail and more natural flow.";
  } else if (numericAverage >= thresholds.ready) {
    readinessLabel = tr ? "Hedefe yaklasiyor" : "Approaching target";
    headline = tr ? "Mock exam sonucu dogru yonde oldugunu gosteriyor." : "The mock exam shows that you are moving in the right direction.";
    body = tr
      ? "Genel performans duzgun ama skor dagilimi hala task'ten task'e oynuyor. Bir sonraki asama, zayif kalan gorevlerde ayni kaliteyi tekrar edebilmek."
      : "The overall performance is solid, but the score still moves too much from task to task. The next step is repeating the same quality in weaker tasks.";
  }

  const gapLabel = gap === null
    ? tr ? "Hedef secilmedi" : "No target selected"
    : gap <= 0
      ? tr ? "Hedefe ulasti veya asti" : "At or above target"
      : tr ? `${gap} puan geride` : `${gap} points behind`;

  const nextStep = gap !== null && gap > 0
    ? tr
      ? `Hedefe yaklasmak icin once su noktayi sabitle: ${focusInsightPrimary}`
      : `To move closer to your target, lock in this one habit first: ${focusInsightPrimary}`
    : tr
      ? `Bir sonraki simulasyonda seviyani korumak icin bu odaga sadik kal: ${focusInsightPrimary}`
      : `To hold your level in the next simulation, stay disciplined around this focus: ${focusInsightPrimary}`;

  return { readinessLabel, headline, body, gapLabel, nextStep };
}


function buildPracticeFocus({
  summary,
  examType,
  taskType,
  tr,
  targetScore
}: {
  summary: ProgressSummary;
  examType: ExamType;
  taskType: TaskType;
  tr: boolean;
  targetScore: string;
}) {
  const scoredSessions = summary.recentSessions.filter((session) => session.report);
  const buckets = new Map<string, { total: number; count: number }>();

  scoredSessions.forEach((session) => {
    session.report?.categories.forEach((category) => {
      const current = buckets.get(category.label) ?? { total: 0, count: 0 };
      buckets.set(category.label, {
        total: current.total + category.score,
        count: current.count + 1
      });
    });
  });

  const weakest = [...buckets.entries()]
    .map(([label, stats]) => ({ label, score: stats.total / stats.count }))
    .sort((a, b) => a.score - b.score)[0];

  const numericTarget = Number(targetScore || 0);
  const gap = numericTarget && summary.averageScore ? Number((numericTarget - summary.averageScore).toFixed(1)) : null;
  const weakestLabel = weakest ? (tr ? translateFocusCategory(weakest.label) : weakest.label) : tr ? "Temel yapi" : "Core structure";
  const taskSpecific = buildTaskSpecificFocus({ examType, taskType });

  if (!scoredSessions.length) {
    return {
      badge: tr ? "Temel baslangic" : "Foundation",
      primary: tr
        ? taskSpecific.foundationTr
        : taskSpecific.foundationEn,
      secondary: tr
        ? taskSpecific.secondaryTr
        : taskSpecific.secondaryEn
    };
  }

  if (gap !== null && gap > (examType === "IELTS" ? 1 : 0.7)) {
    return {
      badge: tr ? "Hedefe yaklas" : "Close the gap",
      primary: tr
        ? `Ortalaman ile hedefin arasinda ${gap} puan fark var. Bugun once ${taskSpecific.microGoalTr.toLowerCase()}, sonra ${weakestLabel} tarafina ozel dikkat ver.`
        : `There is a ${gap}-point gap between your average and target. Today, first ${taskSpecific.microGoalEn.toLowerCase()}, then pay special attention to ${weakestLabel}.`,
      secondary: tr
        ? taskSpecific.secondaryTr
        : taskSpecific.secondaryEn
    };
  }

  return {
    badge: weakest ? weakestLabel : tr ? "Genel kalite" : "Overall quality",
    primary: tr
      ? `${weakestLabel} su an en cok gelistirmen gereken alan. Bu denemede tek gorevin ${taskSpecific.microGoalTr.toLowerCase()} ve sonra cevabini daha temiz baglamak.`
      : `${weakestLabel} is the skill that needs the most work right now. In this attempt, your one job is to ${taskSpecific.microGoalEn.toLowerCase()} and then connect your ideas more cleanly.`,
    secondary: tr
      ? taskSpecific.secondaryTr
      : taskSpecific.secondaryEn
  };
}

function translateFocusCategory(label: string) {
  const labels: Record<string, string> = {
    "Fluency and Coherence": "Akicilik ve Tutarlilik",
    "Lexical Resource": "Kelime Kullanimi",
    "Grammatical Range and Accuracy": "Dilbilgisi ve Dogruluk",
    Pronunciation: "Telaffuz",
    Delivery: "Delivery",
    "Language Use": "Dil kullanimi",
    "Topic Development": "Icerik gelisimi"
  };

  return labels[label] ?? label;
}


function buildTaskSpecificFocus({
  examType,
  taskType
}: {
  examType: ExamType;
  taskType: TaskType;
}) {
  if (examType === "IELTS") {
    if (taskType === "ielts-part-1") {
      return {
        microGoalTr: "soruya ilk cumlede direkt cevap verip bir neden eklemek",
        microGoalEn: "answer the question directly in the first sentence and add one reason",
        foundationTr: "IELTS Part 1'de once direkt cevap ver, sonra tek bir neden veya mini ornek ekle.",
        foundationEn: "In IELTS Part 1, answer directly first and then add one reason or a mini example.",
        secondaryTr: "Part 1'de uzun konusmaktan cok net ve dogal cevap vermek daha degerlidir.",
        secondaryEn: "In Part 1, clear and natural answers matter more than speaking for too long."
      };
    }

    if (taskType === "ielts-part-2") {
      return {
        microGoalTr: "cue card maddelerini sirayla kapsayan kucuk bir hikaye akisi kurmak",
        microGoalEn: "build a short story flow that covers the cue-card points in order",
        foundationTr: "IELTS Part 2'de hedefin, cue card maddelerini dagilmadan acilis-gelisme-kapanisla anlatmak olmali.",
        foundationEn: "In IELTS Part 2, your goal should be to cover the cue-card points with a clear opening, middle, and closing.",
        secondaryTr: "Ezber paragraf yerine kisa bir hikaye akisi daha guclu hissettirir.",
        secondaryEn: "A short story flow works better than a memorized paragraph."
      };
    }

    return {
      microGoalTr: "gorus + neden + ornek zincirini bozmadan daha analitik konusmak",
      microGoalEn: "speak more analytically while keeping an opinion + reason + example chain",
      foundationTr: "IELTS Part 3'te en guclu cevaplar daha analitik olur; fikrini neden ve ornekle acman gerekir.",
      foundationEn: "The strongest IELTS Part 3 responses sound more analytical and expand the opinion with a reason and example.",
      secondaryTr: "Genel ve yuvarlak cevaplardan kac, neden-sonuc iliskisini netlestir.",
      secondaryEn: "Avoid vague answers and make the cause-and-effect relationship clearer."
    };
  }

  if (taskType === "toefl-task-1") {
    return {
      microGoalTr: "ilk 10 saniyede net opinion verip tek bir guclu ornek etrafinda kalmak",
      microGoalEn: "state a clear opinion in the first 10 seconds and stay around one strong example",
      foundationTr: "TOEFL Task 1'de guclu bir opinion ve tek iyi ornek, daginik iki ornekten daha iyidir.",
      foundationEn: "In TOEFL Task 1, one strong opinion with one solid example is better than two scattered examples.",
      secondaryTr: "Gec acilma; fikrini ilk cumlede soyle.",
      secondaryEn: "Do not delay your position; state it in the first sentence."
    };
  }

  if (taskType === "toefl-task-2") {
    return {
      microGoalTr: "duyuruyu kisa ozetleyip ogrenci goruslerini karistirmadan ayirmak",
      microGoalEn: "briefly summarize the announcement and keep the student views clearly separated",
      foundationTr: "TOEFL Task 2'de kendi fikrini ekleme; announcement ve speaker goruslerini temiz tasiman yeterli.",
      foundationEn: "In TOEFL Task 2, do not add your own opinion; carrying the announcement and speaker views clearly is enough.",
      secondaryTr: "Notlarini announcement / speaker 1 / speaker 2 diye bolmek isi cok kolaylastirir.",
      secondaryEn: "Splitting your notes into announcement / speaker 1 / speaker 2 makes this task much easier."
    };
  }

  if (taskType === "toefl-task-3") {
    return {
      microGoalTr: "akademik kavrami bir cumlede tanimlayip profesör orunegine net baglamak",
      microGoalEn: "define the academic concept in one sentence and connect it clearly to the professor's example",
      foundationTr: "TOEFL Task 3'te kavrami tanimla, sonra ornegin bu kavrami nasil gosterdigini anlat.",
      foundationEn: "In TOEFL Task 3, define the concept first and then explain how the example shows that concept.",
      secondaryTr: "Reading tarafini sadece acilis icin kullan; ana agirlik lecture orneginde olsun.",
      secondaryEn: "Use the reading mainly for the setup; let the lecture example carry the answer."
    };
  }

  return {
    microGoalTr: "ana konu ve iki temel noktayi duzenli bir sirayla ozetlemek",
    microGoalEn: "summarize the main topic and two key points in a clean order",
    foundationTr: "TOEFL Task 4'te lecture'i kronolojik degil, mantikli basliklar halinde ozetlemek daha gucludur.",
    foundationEn: "In TOEFL Task 4, summarizing the lecture by logical points is stronger than repeating it chronologically.",
    secondaryTr: "Topic + point 1 + point 2 yapisi bu task'te en guvenli iskeletlerden biridir.",
    secondaryEn: "A topic + point 1 + point 2 structure is one of the safest frameworks for this task."
  };
}

function readBookmarks(): PromptBookmark[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem("speakace-bookmarks");
    return raw ? (JSON.parse(raw) as PromptBookmark[]) : [];
  } catch {
    return [];
  }
}

function buildAdaptiveDrillPlan({
  summary,
  examType,
  selectedTaskType,
  selectedDifficulty,
  drillGoal,
  tr
}: {
  summary: ProgressSummary;
  examType: ExamType;
  selectedTaskType: TaskType;
  selectedDifficulty: Difficulty;
  drillGoal: DrillGoal;
  tr: boolean;
}) {
  const weakest = findWeakestSkillLabel(summary.recentSessions);
  let taskType = selectedTaskType;
  let difficulty = selectedDifficulty;
  let reason = "";

  if (drillGoal === "fluency") {
    taskType = examType === "IELTS" ? "ielts-part-2" : "toefl-task-1";
    difficulty = selectedDifficulty === "Stretch" ? "Target" : selectedDifficulty;
    reason =
      examType === "IELTS"
        ? tr ? "Adaptive secim, akicilik icin daha uzun turn gerektirdigi icin Part 2'yi secti." : "Adaptive mode picked Part 2 because longer turns build fluency fastest."
        : tr ? "Adaptive secim, akicilik icin surekli konusma gerektirdigi icin Task 1'i secti." : "Adaptive mode picked Task 1 because sustained speaking helps fluency most.";
  } else if (drillGoal === "pronunciation") {
    taskType = examType === "IELTS" ? "ielts-part-1" : "toefl-task-1";
    difficulty = "Starter";
    reason =
      examType === "IELTS"
        ? tr ? "Adaptive secim, sesleri daha temiz calisabilmen icin daha kisa bir cevap tipi secti." : "Adaptive mode picked a shorter response so you can focus on cleaner sounds and pacing."
        : tr ? "Adaptive secim, vurgu ve kelime sonlarina odaklanman icin direkt opinion task'i secti." : "Adaptive mode picked a direct opinion task so you can focus on word endings and stress.";
  } else if (drillGoal === "topicDevelopment") {
    taskType = examType === "IELTS" ? "ielts-part-2" : "toefl-task-4";
    difficulty = selectedDifficulty === "Starter" ? "Target" : selectedDifficulty;
    reason =
      examType === "IELTS"
        ? tr ? "Adaptive secim, daha dolu hikaye akisi kurdurdugu icin Part 2'yi secti." : "Adaptive mode picked Part 2 to train fuller story flow and stronger support."
        : tr ? "Adaptive secim, duzenli icerik aktarimini guclendirmek icin Task 4'u secti." : "Adaptive mode picked Task 4 to strengthen organized content transfer.";
  } else if (weakest) {
    if (weakest === "Pronunciation") {
      taskType = examType === "IELTS" ? "ielts-part-1" : "toefl-task-1";
      difficulty = "Starter";
    } else if (weakest === "Topic Development") {
      taskType = examType === "IELTS" ? "ielts-part-2" : "toefl-task-4";
    } else if (weakest === "Fluency and Coherence" || weakest === "Delivery") {
      taskType = examType === "IELTS" ? "ielts-part-2" : "toefl-task-1";
    }
    reason = tr ? `Adaptive secim, son denemelerdeki en zayif skill'ine gore yapildi: ${weakest}.` : `Adaptive mode used your weakest recent skill: ${weakest}.`;
  } else {
    reason = tr ? "Adaptive secim, daha fazla skor verisi gelene kadar senin sectigin gorevi koruyor." : "Adaptive mode is keeping your selected task until more score data comes in.";
  }

  const prompts = listPromptsForTask(examType, taskType).filter((item) => item.difficulty === difficulty);
  const fallbackPrompts = prompts.length ? prompts : listPromptsForTask(examType, taskType);
  const offset = summary.totalSessions % Math.max(fallbackPrompts.length, 1);
  const prompt = fallbackPrompts[offset] ?? fallbackPrompts[0];

  return {
    taskType,
    difficulty,
    promptId: prompt?.id,
    title: prompt?.title ?? humanizeTaskType(taskType, false),
    reason
  };
}

function buildAnswerModeGuide({
  mode,
  taskType,
  tr
}: {
  mode: AnswerMode;
  taskType: TaskType;
  tr: boolean;
}) {
  const partTwo = taskType === "ielts-part-2";

  if (mode === "safe") {
    return {
      badge: tr ? "daha kontrollu" : "more controlled",
      primary: tr
        ? "Guvenli mod, riski azaltir: kisa ama temiz cumleler, tek ana fikir ve net bir ornek kullan."
        : "Safe mode lowers risk: use shorter clean sentences, one main idea, and one clear example.",
      secondary: tr
        ? "Bu mod gramer hatasi ve daginik yapi yasayan ogrenciler icin iyi calisir."
        : "This mode works well when grammar slips and messy structure are the main problem.",
      moves: partTwo
        ? [tr ? "konuyu tanit" : "introduce the topic", tr ? "tek bir net hikaye ver" : "give one clear story", tr ? "kisa kapanis yap" : "end cleanly"]
        : [tr ? "direkt cevap ver" : "answer directly", tr ? "bir neden ekle" : "add one reason", tr ? "kisa bitir" : "close briefly"]
    };
  }

  if (mode === "bold") {
    return {
      badge: tr ? "daha etkili" : "more expressive",
      primary: tr
        ? "Cesur mod, cevabi daha yukari tasimayi dener: daha guclu kelime secimi, daha canli ornek ve daha belirgin bir durus kullan."
        : "Bold mode tries to lift the answer higher: stronger word choice, a more vivid example, and a clearer stance.",
      secondary: tr
        ? "Bu mod ancak temel yapin cok dagilmiyorsa faydali olur."
        : "This mode helps only when your base structure is already fairly stable.",
      moves: partTwo
        ? [tr ? "daha canli bir acilis kur" : "use a more vivid opening", tr ? "detayli bir an ekle" : "add one lived-in detail", tr ? "guclu bitir" : "finish with impact"]
        : [tr ? "net gorus belirt" : "state a clear position", tr ? "daha guclu bir ifade kullan" : "use a stronger phrase", tr ? "ornekle destekle" : "support it with an example"]
    };
  }

  return {
    badge: tr ? "daha dogal" : "more natural",
    primary: tr
      ? "Dogal mod, fazla kasmadan iyi duyulan cevaplar uretir: net fikir, rahat baglanti ve yasayan bir ornek."
      : "Natural mode aims for answers that sound good without overpushing: clear idea, relaxed linking, and one lived-in example.",
    secondary: tr
      ? "Cogu ogrenci icin en dengeli mod budur; ne fazla guvenli ne de gereksiz agresif."
      : "This is the most balanced mode for most learners; not too safe and not unnecessarily aggressive.",
    moves: partTwo
      ? [tr ? "konuyu dogal ac" : "open naturally", tr ? "tek bir iyi ornek sec" : "pick one good example", tr ? "neden onemli oldugunu bagla" : "connect why it matters"]
      : [tr ? "soruyu dogrudan al" : "take the question directly", tr ? "tek bir neden ver" : "give one reason", tr ? "dogal bir ornekle bagla" : "link it to a natural example"]
  };
}

function findWeakestSkillLabel(sessions: SpeakingSession[]) {
  const buckets = new Map<string, { total: number; count: number }>();
  sessions.forEach((session) => {
    session.report?.categories.forEach((category) => {
      const current = buckets.get(category.label) ?? { total: 0, count: 0 };
      buckets.set(category.label, {
        total: current.total + category.score,
        count: current.count + 1
      });
    });
  });
  if (!buckets.size) return null;
  return [...buckets.entries()]
    .map(([label, stats]) => ({ label, average: stats.total / stats.count }))
    .sort((a, b) => a.average - b.average)[0]?.label ?? null;
}
