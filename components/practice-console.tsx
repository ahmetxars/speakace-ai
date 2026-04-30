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
type RunMode = "drill" | "simulation" | "pronunciation" | "interview";

type SimulationState = {
  examType: ExamType;
  queue: TaskType[];
  currentIndex: number;
  completed: Array<{ sessionId: string; taskType: TaskType; title: string; score?: number }>;
  startedAt: string;
  finishedAt?: string;
};

type InterviewState = {
  step: number;
  history: Array<{
    sessionId: string;
    promptTitle: string;
    score?: number;
  }>;
  followUps: Array<{
    id: string;
    title: string;
    prompt: string;
  }>;
  lastPromptTitle?: string;
  completedAt?: string;
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
  const canPractice = Boolean(currentUser && currentUser.role !== "guest");

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
  const [interviewState, setInterviewState] = useState<InterviewState | null>(null);
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
    const nextRunMode = searchParams.get("runMode");

    if (nextExam === "IELTS" || nextExam === "TOEFL") {
      setExamType(nextExam);
    }
    if (nextTask && ["ielts-part-1", "ielts-part-2", "ielts-part-3", "toefl-task-1", "toefl-task-2", "toefl-task-3", "toefl-task-4", "toefl-independent", "toefl-integrated"].includes(nextTask)) {
      setTaskType(nextTask as TaskType);
    }
    if (nextDifficulty && ["Starter", "Target", "Stretch"].includes(nextDifficulty)) {
      setDifficulty(nextDifficulty as Difficulty);
    }
    if (nextRunMode && ["drill", "simulation", "pronunciation", "interview"].includes(nextRunMode)) {
      setRunMode(nextRunMode as RunMode);
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
    if (!canPractice) {
      setSummary(emptySummary);
      return;
    }

    fetch("/api/progress/summary")
      .then((response) => response.json())
      .then((data: ProgressSummary) => setSummary(data))
      .catch(() => setSummary(emptySummary));
  }, [canPractice]);

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
    setInterviewState(null);
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

    if (runMode === "interview") {
      const nextStep = (interviewState?.step ?? 0) + 1;
      const followUps = nextStep >= 3 ? [] : buildInterviewFollowUps(evaluatedSession, tr);

      setInterviewState((current) => ({
        step: nextStep,
        history: [
          ...(current?.history ?? []),
          {
            sessionId,
            promptTitle: evaluatedSession.prompt.title,
            score: evaluatedSession.report?.overall
          }
        ],
        followUps,
        lastPromptTitle: evaluatedSession.prompt.title,
        completedAt: nextStep >= 3 ? new Date().toISOString() : undefined
      }));

      setStatus(
        nextStep >= 3
          ? tr
            ? "Interview modu tamamlandi. Tum turleri bitirdin ve son rapor hazir."
            : "Interview mode is complete. You finished all rounds and your final report is ready."
          : tr
            ? "Ilk cevap hazir. Simdi daha derin bir follow-up sorusu secip devam et."
            : "Your first answer is ready. Now choose a deeper follow-up question and continue."
      );
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

    if (!canPractice) {
      setError(tr ? "Practice için giriş yapman gerekiyor." : "You need to sign in to start practice.");
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
  }, [canPractice, cleanupMedia, currentUser, evaluateSessionNow, tr]);

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
    customPrompt?: {
      id?: string;
      title: string;
      prompt: string;
      prepSeconds?: number;
      speakingSeconds?: number;
    };
  }) => {
    setError(null);

    const resolvedExamType = overrides?.examType ?? examType;
    const resolvedTaskType = overrides?.taskType ?? taskType;
    const resolvedDifficulty = overrides?.difficulty ?? difficulty;
    const resolvedPromptId = overrides?.promptId ?? preferredPromptId;
    const customPrompt = overrides?.customPrompt;

    if (runMode === "interview" && !customPrompt) {
      setInterviewState({ step: 0, history: [], followUps: [] });
    }

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
    const requestedPromptId = runMode === "simulation" || customPrompt ? undefined : resolvedPromptId ?? adaptivePlan?.promptId;

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
        customPrompt
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
    const requestedRunMode = searchParams.get("runMode");

    if (!quickStart || autoStartedRef.current || mode !== "idle" || session) {
      return;
    }

    if (requestedRunMode && requestedRunMode !== runMode) {
      return;
    }

    autoStartedRef.current = true;
    void startSession();
  }, [mode, runMode, searchParams, session]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const endEarly = useCallback(() => {
    if (runMode === "simulation" && mode === "idle") {
      setSimulationState(null);
      setStatus(tr ? "Simulasyon kapatildi." : "Simulation closed.");
      return;
    }

    if (runMode === "interview" && mode === "idle") {
      setInterviewState(null);
      setStatus(tr ? "Interview modu kapatildi." : "Interview mode closed.");
      return;
    }

    if (mode === "prep" || mode === "permission") {
      if (runMode === "simulation") {
        setSimulationState(null);
      }
      if (runMode === "interview") {
        setInterviewState(null);
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

  const simulationQueue = useMemo(() => buildSimulationQueue(examType), [examType]);
  const activeSimulationTask = simulationState ? simulationState.queue[Math.min(simulationState.currentIndex, simulationState.queue.length - 1)] : null;
  const effectiveTaskType = runMode === "simulation" ? activeSimulationTask ?? simulationQueue[0] : taskType;
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
  const mockReportStorageKey = currentUser ? `speakace-mock-report-${currentUser.id}` : "speakace-mock-report-guest";
  const pronunciationGuide = useMemo(() => buildPronunciationGuide(session?.prompt.prompt ?? activeTaskLayout.overlayPrompt, tr), [activeTaskLayout.overlayPrompt, session?.prompt.prompt, tr]);
  const interviewGuide = useMemo(
    () => buildInterviewGuide(session?.prompt.title ?? activeTaskLayout.overlayPrompt, tr, interviewState?.step ?? 0),
    [activeTaskLayout.overlayPrompt, interviewState?.step, session?.prompt.title, tr]
  );
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

  const continueInterviewWithPrompt = async (followUp: { id: string; title: string; prompt: string }) => {
    if (currentUser?.id) {
      void trackClientEvent({ userId: currentUser.id, event: "interview_followup_continue", path: "/app/practice" });
    }
    await startSession({
      examType,
      taskType,
      difficulty,
      customPrompt: {
        id: followUp.id,
        title: followUp.title,
        prompt: followUp.prompt,
        prepSeconds: session?.prompt.prepSeconds ?? 20,
        speakingSeconds: session?.prompt.speakingSeconds ?? 45
      }
    });
  };

  return (
    <div className="page-shell section">

      {currentUser?.plan === "free" && summary.totalSessions > 0 ? (
        <div style={{ maxWidth: 700, margin: "0 auto 1rem", padding: "0.7rem 1rem", borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.88rem", color: "var(--muted-foreground)" }}>
            {tr ? "Plus ile tam geri bildirim ve sınırsız deneme." : "Unlock full feedback and unlimited sessions with Plus."}
          </span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <a className="button button-primary" href={buildPlanCheckoutPath({ coupon: couponCatalog.LAUNCH20.code, campaign: "practice_banner" })} style={{ padding: "0.4rem 0.9rem", fontSize: "0.85rem" }}>
              {tr ? "Plus'i aç" : "Unlock Plus"}
            </a>
            <Link className="button button-secondary" href="/pricing" style={{ padding: "0.4rem 0.9rem", fontSize: "0.85rem" }}>
              {tr ? "Planlar" : "Plans"}
            </Link>
          </div>
        </div>
      ) : null}

      <div style={{ maxWidth: 700, margin: "0 auto", display: "grid", gap: "2rem" }}>

        {/* HEADER */}
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 800, margin: "0 0 0.5rem" }}>
            {tr ? "Speaking Pratik" : "Speaking Practice"}
          </h1>
          <p style={{ color: "var(--muted-foreground)", margin: 0, fontSize: "0.95rem" }}>
            {tr ? "Sınavı seç, konu seç, başla." : "Pick your exam, choose a topic, start speaking."}
          </p>
        </div>

        {/* PRACTICE MODES — 3 cards (drill, interview, pronunciation) */}
        {runMode !== "simulation" ? (
          <div style={{ display: "grid", gap: "0.7rem" }}>
            <strong style={{ fontSize: "0.95rem" }}>{tr ? "Çalışma modu" : "Practice mode"}</strong>
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
              {[
                {
                  value: "drill",
                  label: tr ? "Hızlı drill" : "Quick drill",
                  description: tr ? "Tek cevap, hızlı skor ve retry yönü." : "One answer, quick score, and retry direction."
                },
                {
                  value: "interview",
                  label: tr ? "Interview mode" : "Interview mode",
                  description: tr ? "İlk cevaptan sonra follow-up sorularla derine iner." : "Adds deeper follow-up questions after your first answer."
                },
                {
                  value: "pronunciation",
                  label: tr ? "Telaffuz odağı" : "Pronunciation focus",
                  description: tr ? "Ritim, vurgu ve kelime sonları için kontrollü çalışma." : "Controlled practice for stress, rhythm, and word endings."
                }
              ].map((option) => {
                const active = runMode === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      if (mode !== "idle") return;
                      setRunMode(option.value as RunMode);
                      setInterviewState(null);
                      setSimulationState(null);
                      if (option.value === "interview" && currentUser?.id) {
                        void trackClientEvent({ userId: currentUser.id, event: "interview_mode_start", path: "/app/practice" });
                      }
                    }}
                    disabled={mode !== "idle"}
                    style={{
                      flex: "1 1 180px",
                      textAlign: "left",
                      padding: "0.95rem 1rem",
                      borderRadius: 14,
                      border: active ? "1.5px solid var(--primary)" : "1px solid var(--border)",
                      background: active ? "color-mix(in oklch, var(--primary) 10%, var(--card) 90%)" : "var(--card)",
                      color: "var(--foreground)",
                      cursor: mode === "idle" ? "pointer" : "not-allowed"
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: "0.35rem", color: active ? "var(--primary)" : "var(--foreground)" }}>{option.label}</div>
                    <div style={{ fontSize: "0.82rem", lineHeight: 1.55, color: "var(--muted-foreground)" }}>{option.description}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* MOCK EXAM — separate prominent block */}
        <div style={{
          borderRadius: 16,
          border: runMode === "simulation" ? "2px solid var(--primary)" : "1.5px solid var(--border)",
          background: runMode === "simulation" ? "color-mix(in oklch, var(--primary) 6%, var(--card) 94%)" : "var(--card)",
          overflow: "hidden",
          transition: "border-color 0.2s, background 0.2s"
        }}>
          <div style={{ padding: "1.1rem 1.25rem", display: "grid", gap: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.35rem" }}>
                  <span style={{ fontSize: "1.1rem" }}>🧪</span>
                  <strong style={{ fontSize: "1rem", color: runMode === "simulation" ? "var(--primary)" : "var(--foreground)" }}>
                    {tr ? "Mock Exam" : "Mock Exam"}
                  </strong>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "0.15rem 0.55rem", borderRadius: 999, background: "color-mix(in oklch, var(--primary) 15%, var(--card) 85%)", color: "var(--primary)", letterSpacing: "0.04em" }}>
                    {tr ? "TAM SINAV" : "FULL EXAM"}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--muted-foreground)", lineHeight: 1.6 }}>
                  {tr
                    ? "Gerçek sınav sırası ve süreleriyle tüm partları arka arkaya çöz. Sonunda toplam skor ve hazırlık analizi alırsın."
                    : "Complete all parts back-to-back with real exam timing. Get a total score and readiness analysis at the end."}
                </p>
              </div>
              {runMode === "simulation" ? (
                <button
                  type="button"
                  onClick={() => { if (mode === "idle") { setRunMode("drill"); setSimulationState(null); } }}
                  disabled={mode !== "idle"}
                  style={{ flexShrink: 0, fontSize: "0.8rem", color: "var(--muted-foreground)", background: "none", border: "none", cursor: "pointer", padding: "0.2rem" }}
                >
                  {tr ? "İptal" : "Cancel"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { if (mode === "idle") { setRunMode("simulation"); setInterviewState(null); } }}
                  disabled={mode !== "idle"}
                  className="button button-secondary"
                  style={{ flexShrink: 0, fontSize: "0.85rem", padding: "0.5rem 1.1rem" }}
                >
                  {tr ? "Seç" : "Select"}
                </button>
              )}
            </div>

            {runMode === "simulation" ? (
              <div style={{ display: "grid", gap: "0.6rem" }}>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {(["IELTS", "TOEFL"] as ExamType[]).map(exam => (
                    <button
                      key={exam}
                      type="button"
                      onClick={() => handleExamChange(exam)}
                      disabled={mode !== "idle"}
                      style={{
                        padding: "0.45rem 1.3rem",
                        borderRadius: 999,
                        border: "2px solid",
                        borderColor: examType === exam ? "var(--primary)" : "var(--border)",
                        background: examType === exam ? "var(--primary)" : "transparent",
                        color: examType === exam ? "#fff" : "var(--foreground)",
                        fontWeight: 700,
                        fontSize: "0.88rem",
                        cursor: "pointer",
                        transition: "all 0.15s"
                      }}
                    >{exam}</button>
                  ))}
                </div>
                <div style={{ padding: "0.65rem 0.9rem", borderRadius: 10, background: "var(--secondary)", border: "1px solid var(--border)", fontSize: "0.83rem", color: "var(--muted-foreground)", lineHeight: 1.6 }}>
                  {examType === "IELTS"
                    ? (tr ? "Part 1 (Giriş) → Part 2 (Cue Card) → Part 3 (Tartışma)" : "Part 1 (Introduction) → Part 2 (Cue Card) → Part 3 (Discussion)")
                    : (tr ? "Task 1 (Bağımsız) → Task 2 (Kampüs) → Task 3 (Akademik) → Task 4 (Ders Özeti)" : "Task 1 (Independent) → Task 2 (Campus) → Task 3 (Academic) → Task 4 (Lecture)")}
                </div>
              </div>
            ) : null}
          </div>

          {runMode === "simulation" ? (
            <div style={{ borderTop: "1px solid var(--border)", padding: "0.85rem 1.25rem" }}>
              <button
                className="button button-primary"
                type="button"
                onClick={() => void startSession()}
                disabled={!canPractice || mode === "permission" || mode === "prep" || mode === "speak" || mode === "saving"}
                style={{ width: "100%", padding: "0.85rem", fontSize: "1rem", fontWeight: 700, borderRadius: 12 }}
              >
                {mode === "saving"
                  ? (tr ? "Kaydediliyor..." : "Saving...")
                  : (tr ? "🧪 Mock Exam'i Başlat" : "🧪 Start Mock Exam")}
              </button>
            </div>
          ) : null}
        </div>

        {/* EXAM + TASK SELECTOR — only for non-mock modes */}
        {runMode !== "simulation" ? (
        <>
        <div style={{ display: "grid", gap: "1rem" }}>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {(["IELTS", "TOEFL"] as ExamType[]).map(exam => (
              <button
                key={exam}
                type="button"
                onClick={() => handleExamChange(exam)}
                disabled={mode !== "idle"}
                style={{
                  padding: "0.55rem 1.5rem",
                  borderRadius: 999,
                  border: "2px solid",
                  borderColor: examType === exam ? "var(--primary)" : "var(--border)",
                  background: examType === exam ? "var(--primary)" : "transparent",
                  color: examType === exam ? "#fff" : "var(--foreground)",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  transition: "all 0.15s"
                }}
              >{exam}</button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {taskOptions[examType].map(option => {
              const meta = getTaskCardMeta(option, tr);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleTaskChange(option)}
                  disabled={mode !== "idle"}
                  style={{
                    padding: "0.45rem 1.1rem",
                    borderRadius: 999,
                    border: "1.5px solid",
                    borderColor: taskType === option ? "var(--primary)" : "var(--border)",
                    background: taskType === option ? "oklch(0.623 0.214 259.815 / 0.1)" : "transparent",
                    color: taskType === option ? "var(--primary)" : "var(--foreground)",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    transition: "all 0.15s"
                  }}
                >{meta.title}</button>
              );
            })}
          </div>
        </div>

        {/* TOPIC SELECTION */}
        <div style={{ display: "grid", gap: "1rem" }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.8rem", flexWrap: "wrap" }}>
            <strong style={{ fontSize: "0.95rem" }}>
              {tr ? "Konu seç" : "Choose a topic"}
            </strong>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button type="button" className="button button-secondary" onClick={surpriseMe} disabled={!availablePrompts.length || mode !== "idle"} style={{ padding: "0.45rem 1rem", fontSize: "0.85rem" }}>
                {tr ? "🎲 Sürpriz" : "🎲 Surprise"}
              </button>
              <button type="button" className="button button-secondary" onClick={() => setShowAllTopics(c => !c)} disabled={mode !== "idle"} style={{ padding: "0.45rem 1rem", fontSize: "0.85rem" }}>
                {showAllTopics ? (tr ? "Gizle" : "Hide") : (tr ? "Tümü" : "Browse all")}
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gap: "0.6rem" }}>
            {recommendedPrompts.map(prompt => (
              <div
                key={prompt.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1rem",
                  padding: "0.9rem 1.1rem",
                  borderRadius: 12,
                  border: "1.5px solid",
                  borderColor: preferredPromptId === prompt.id ? "var(--primary)" : "var(--border)",
                  background: preferredPromptId === prompt.id ? "oklch(0.623 0.214 259.815 / 0.06)" : "var(--card)",
                  transition: "all 0.15s",
                  cursor: "pointer"
                }}
                onClick={() => !canPractice || mode !== "idle" ? undefined : void pickPromptAndStart(prompt.id)}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, marginBottom: "0.2rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{prompt.title}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>{humanizeTaskType(prompt.taskType, tr)} · {tr ? translateDifficulty(prompt.difficulty) : prompt.difficulty}</div>
                </div>
                <button
                  type="button"
                  className="button button-primary"
                  onClick={e => { e.stopPropagation(); void pickPromptAndStart(prompt.id); }}
                  disabled={!canPractice || mode !== "idle"}
                  style={{ flexShrink: 0, padding: "0.45rem 1rem", fontSize: "0.85rem" }}
                >
                  {tr ? "Başla" : "Start"}
                </button>
              </div>
            ))}
          </div>

          {showAllTopics ? (
            <div style={{ display: "grid", gap: "0.6rem" }}>
              <input
                className="practice-topic-search"
                value={topicSearch}
                onChange={e => setTopicSearch(e.target.value)}
                placeholder={tr ? "Konu veya görev ara..." : "Search topics..."}
                style={{ padding: "0.65rem 1rem", borderRadius: 10, border: "1.5px solid var(--border)", background: "var(--card)", color: "var(--foreground)", fontSize: "0.9rem", outline: "none" }}
              />
              <div style={{ display: "grid", gap: "0.5rem", maxHeight: "40vh", overflowY: "auto" }}>
                {filteredPrompts.map(prompt => (
                  <div
                    key={`browse-${prompt.id}`}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", padding: "0.75rem 1rem", borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)" }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{prompt.title}</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>{humanizeTaskType(prompt.taskType, tr)} · {tr ? translateDifficulty(prompt.difficulty) : prompt.difficulty}</div>
                    </div>
                    <button type="button" className="button button-secondary" onClick={() => void pickPromptAndStart(prompt.id)} disabled={!canPractice || mode !== "idle"} style={{ padding: "0.4rem 0.9rem", fontSize: "0.82rem", flexShrink: 0 }}>
                      {tr ? "Başlat" : "Start"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
        </>
        ) : null}

        {/* STATS ROW */}
        {summary.totalSessions > 0 ? (
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            {[
              { label: tr ? "Toplam" : "Sessions", value: summary.totalSessions },
              { label: tr ? "Ort. skor" : "Avg score", value: summary.averageScore || "-" },
              { label: tr ? "Kalan" : "Remaining", value: `${summary.freeSessionsRemaining}` }
            ].map(stat => (
              <div key={stat.label} style={{ flex: 1, minWidth: 100, padding: "0.8rem 1rem", borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)", textAlign: "center" }}>
                <div style={{ fontSize: "1.4rem", fontWeight: 800 }}>{stat.value}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", marginTop: "0.2rem" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        ) : null}

        {/* ADVANCED OPTIONS — hidden in mock exam mode */}
        {runMode !== "simulation" ? <details style={{ borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
          <summary style={{ padding: "0.8rem 1.1rem", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--card)" }}>
            <span>{tr ? "⚙ Gelişmiş ayarlar" : "⚙ Advanced options"}</span>
            <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>{tr ? "Drill hedefi, cevap modu" : "Drill goal, answer mode"}</span>
          </summary>
          <div style={{ padding: "1rem 1.1rem", background: "var(--card)", display: "grid", gap: "0.8rem", borderTop: "1px solid var(--border)" }}>
            <SelectField
              label={tr ? "Drill hedefi" : "Drill goal"}
              value={drillGoal}
              onChange={v => setDrillGoal(v as DrillGoal)}
              options={[
                { value: "balanced", label: tr ? "Dengeli" : "Balanced" },
                { value: "fluency", label: tr ? "Akıcılık" : "Fluency" },
                { value: "pronunciation", label: tr ? "Telaffuz" : "Pronunciation" },
                { value: "topicDevelopment", label: tr ? "İçerik" : "Topic dev" }
              ]}
              disabled={false}
            />
            <SelectField
              label={tr ? "Cevap modu" : "Answer mode"}
              value={answerMode}
              onChange={v => setAnswerMode(v as AnswerMode)}
              options={[
                { value: "safe", label: tr ? "Güvenli" : "Safe" },
                { value: "natural", label: tr ? "Doğal" : "Natural" },
                { value: "bold", label: tr ? "Cesur" : "Bold" }
              ]}
              disabled={false}
            />
          </div>
        </details> : null}

        {/* PREVIOUS RESULT PREVIEW */}
        {mode === "done" && session?.report ? (
          <div style={{ padding: "1.2rem", borderRadius: 14, border: "2px solid var(--primary)", background: "oklch(0.623 0.214 259.815 / 0.06)", display: "grid", gap: "0.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong>{tr ? "Son sonuç" : "Last result"}</strong>
              <span style={{ fontSize: "2rem", fontWeight: 800 }}>{session.report.overall}</span>
            </div>
            <div style={{ color: "var(--muted-foreground)", fontSize: "0.9rem" }}>{session.report.scaleLabel}</div>
            <Link href={`/app/results/${session.id}`} className="button button-primary" style={{ marginTop: "0.4rem", textAlign: "center" }}>
              {tr ? "Tam raporu gör →" : "View full report →"}
            </Link>
          </div>
        ) : null}

        {runMode === "interview" ? (
          <div style={{ padding: "1.1rem", borderRadius: 14, border: "1px solid var(--border)", background: "var(--card)", display: "grid", gap: "0.75rem" }}>
            <div>
              <strong style={{ display: "block", marginBottom: "0.3rem" }}>{tr ? "Simulated interview coach" : "Simulated interview coach"}</strong>
              <p style={{ margin: 0, color: "var(--muted-foreground)", lineHeight: 1.6 }}>{interviewGuide.summary}</p>
            </div>
            <div style={{ display: "grid", gap: "0.55rem" }}>
              {interviewGuide.tips.map((tip) => (
                <div key={tip} style={{ padding: "0.75rem 0.9rem", borderRadius: 12, background: "color-mix(in oklch, var(--surface-strong) 25%, var(--card) 75%)", border: "1px solid var(--border)", fontSize: "0.86rem", lineHeight: 1.6 }}>
                  {tip}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {runMode === "interview" && mode === "done" && interviewState?.followUps.length ? (
          <div style={{ padding: "1.1rem", borderRadius: 14, border: "1px solid color-mix(in oklch, var(--primary) 28%, var(--border) 72%)", background: "color-mix(in oklch, var(--primary) 7%, var(--card) 93%)", display: "grid", gap: "0.8rem" }}>
            <div>
              <strong style={{ display: "block", marginBottom: "0.3rem" }}>{tr ? "Sıradaki follow-up sorusu" : "Next follow-up question"}</strong>
              <p style={{ margin: 0, color: "var(--muted-foreground)", lineHeight: 1.6 }}>
                {tr ? "Bu mod şimdi cevabını daha derinleştiriyor. Bir follow-up seç ve aynı konu etrafında devam et." : "This mode now pushes your answer deeper. Pick one follow-up and continue around the same topic."}
              </p>
            </div>
            <div style={{ display: "grid", gap: "0.7rem" }}>
              {interviewState.followUps.map((followUp) => (
                <button
                  key={followUp.id}
                  type="button"
                  onClick={() => void continueInterviewWithPrompt(followUp)}
                  className="button button-secondary"
                  style={{ justifyContent: "flex-start", textAlign: "left", padding: "0.95rem 1rem", whiteSpace: "normal", lineHeight: 1.55 }}
                >
                  {followUp.prompt}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {runMode === "interview" && interviewState?.history.length ? (
          <div style={{ padding: "1.1rem", borderRadius: 14, border: "1px solid var(--border)", background: "var(--card)", display: "grid", gap: "0.8rem" }}>
            <strong>{tr ? "Interview ilerleme özeti" : "Interview progress"}</strong>
            <div style={{ display: "grid", gap: "0.6rem" }}>
              {interviewState.history.map((entry, index) => (
                <div key={entry.sessionId} style={{ display: "flex", justifyContent: "space-between", gap: "1rem", padding: "0.8rem 0.9rem", borderRadius: 12, background: "var(--secondary)", border: "1px solid var(--border)" }}>
                  <div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--primary)", marginBottom: "0.25rem" }}>
                      {tr ? `${index + 1}. tur` : `Round ${index + 1}`}
                    </div>
                    <div style={{ fontSize: "0.88rem", lineHeight: 1.55 }}>{entry.promptTitle}</div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: "1rem", alignSelf: "center" }}>{entry.score ?? "-"}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* ERROR */}
        {error ? (
          <div style={{ padding: "1rem", borderRadius: 12, background: "oklch(0.55 0.2 20 / 0.08)", border: "1px solid oklch(0.55 0.2 20 / 0.2)", color: "oklch(0.45 0.18 20)" }}>
            {error}
          </div>
        ) : null}

        {/* MAIN ACTION BUTTON — hidden in simulation mode (button lives inside mock exam card) */}
        {runMode !== "simulation" ? (
          <button
            className="button button-primary"
            type="button"
            onClick={() => void startSession()}
            disabled={!canPractice || mode === "permission" || mode === "prep" || mode === "speak" || mode === "saving"}
            style={{ width: "100%", padding: "1rem", fontSize: "1rem", fontWeight: 700, borderRadius: 14 }}
          >
            {mode === "saving"
              ? (tr ? "Kaydediliyor..." : "Saving...")
              : runMode === "interview"
                ? (tr ? "🗣 Interview Modunu Başlat" : "🗣 Start Interview Mode")
                : runMode === "pronunciation"
                  ? (tr ? "🔊 Telaffuz Drillini Başlat" : "🔊 Start Pronunciation Drill")
                  : (tr ? "🎙 Konuşmaya Başla" : "🎙 Start Speaking")}
          </button>
        ) : null}

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
                    : runMode === "interview"
                      ? tr ? "Geri sayım bitince interview cevabın otomatik başlayacak" : "Your interview answer starts automatically after the countdown"
                    : tr ? "Geri sayim bitince kayit otomatik baslayacak" : "Recording starts automatically after the countdown"
                  : mode === "speak"
                    ? runMode === "pronunciation"
                      ? tr ? "Kelimeleri net bitir, vurguyu belirginlestir ve ritmi koru" : "Finish words clearly, stress key syllables, and keep a steady rhythm"
                      : runMode === "interview"
                        ? tr ? "Kısa ama gelişmiş cevap ver; follow-up bir sonraki turda gelecek" : "Give a concise but developed answer; the follow-up will come in the next round"
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
                  <p style={{ margin: 0, lineHeight: 1.65 }}>
                    {runMode === "pronunciation"
                      ? pronunciationGuide.overlayFocus
                      : runMode === "interview"
                        ? interviewGuide.overlayFocus
                        : focusInsight.primary}
                  </p>
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

function buildInterviewGuide(promptTitle: string, tr: boolean, step: number) {
  const stage = step + 1;
  return {
    summary: tr
      ? "Interview mode, ana cevaptan sonra seni daha net örnek, gerekçe ve karşılaştırma isteyen follow-up sorulara taşır."
      : "Interview mode pushes you from a base answer into follow-up questions that demand clearer reasons, examples, and comparisons.",
    overlayFocus: tr
      ? `${stage}. tur odağı: kısa cevap verme; fikir + neden + küçük örnek zinciri kur.`
      : `Round ${stage} focus: do not stop at a short answer; build an opinion + reason + mini-example chain.`,
    tips: tr
      ? [
          `Bu turda "${promptTitle}" başlığını tek cümlede kapatma; cevabı bir neden ile büyüt.`,
          "Cevabın sonunda küçük bir kişisel örnek veya sonuç ekle.",
          "Takıldığında yeni fikir açmak yerine mevcut fikri netleştir."
        ]
      : [
          `Do not close "${promptTitle}" in one sentence this round; expand it with a reason.`,
          "End with one small personal example or consequence.",
          "If you get stuck, clarify the current idea instead of opening a new one."
        ]
  };
}

function buildInterviewFollowUps(session: SpeakingSession, tr: boolean) {
  const baseTitle = session.prompt.title;
  const strongerLine = session.report?.improvedAnswer?.split(/(?<=[.!?])\s+/).find(Boolean) ?? "";
  const weakestCategory = session.report?.categories.slice().sort((a, b) => a.score - b.score)[0]?.label;
  const weaknessHint = weakestCategory?.toLowerCase().includes("pronunciation")
    ? tr ? "aynı fikri daha yavaş ve net kur" : "say the same idea more slowly and clearly"
    : weakestCategory?.toLowerCase().includes("topic")
      ? tr ? "fikrini bir örnekle geliştir" : "develop the idea with one example"
      : tr ? "nedenini daha net aç" : "open up your reason more clearly";

  return [
    {
      id: `followup-${crypto.randomUUID()}`,
      title: tr ? `${baseTitle} · Follow-up 1` : `${baseTitle} · Follow-up 1`,
      prompt: tr
        ? `"${baseTitle}" konusu için şimdi tek bir somut örnek ver ve bunun neden önemli olduğunu açıkla.`
        : `For "${baseTitle}", give one concrete example now and explain why it matters.`
    },
    {
      id: `followup-${crypto.randomUUID()}`,
      title: tr ? `${baseTitle} · Follow-up 2` : `${baseTitle} · Follow-up 2`,
      prompt: tr
        ? `${weaknessHint.charAt(0).toUpperCase()}${weaknessHint.slice(1)}. Ardından önceki cevabını bir adım daha güçlü hale getir.`
        : `${weaknessHint.charAt(0).toUpperCase()}${weaknessHint.slice(1)}. Then make your previous answer one step stronger.`
    },
    {
      id: `followup-${crypto.randomUUID()}`,
      title: tr ? `${baseTitle} · Follow-up 3` : `${baseTitle} · Follow-up 3`,
      prompt: tr
        ? `Bu fikirle ilgili farklı bir bakış açısını kabul et, sonra kendi görüşünü savun. ${strongerLine ? `İpucu: ${strongerLine}` : ""}`.trim()
        : `Acknowledge a different point of view on this idea, then defend your own position. ${strongerLine ? `Hint: ${strongerLine}` : ""}`.trim()
    }
  ];
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
