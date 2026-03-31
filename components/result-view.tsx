"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAppState } from "@/components/providers";
import { ProgressSummary, SpeakingSession } from "@/lib/types";
import { readStudyFolders, readStudyItems, writeStudyFolders, writeStudyItems } from "@/lib/study-lists";

export function ResultView({ session, summary }: { session: SpeakingSession; summary: ProgressSummary }) {
  const { language, currentUser } = useAppState();
  const tr = language === "tr";
  const retryRequired =
    session.report?.scaleLabel === "Please respond in English" ||
    session.report?.scaleLabel === "Response too short to score reliably";
  const previousSession = summary.recentSessions.find((item) => item.id !== session.id && item.report);
  const delta = session.report && previousSession?.report ? Number((session.report.overall - previousSession.report.overall).toFixed(1)) : null;
  const weakestCategory = session.report?.categories.slice().sort((a, b) => a.score - b.score)[0];
  const strongestCategory = session.report?.categories.slice().sort((a, b) => b.score - a.score)[0];
  const qualityScore = session.transcriptQualityScore ?? 0;
  const qualityLabel = session.transcriptQualityLabel ?? (tr ? "Bilinmiyor" : "Unknown");
  const qualityTone = qualityScore >= 85 ? "strong" : qualityScore >= 65 ? "usable" : qualityScore >= 40 ? "weak" : "retry";
  const retryHref = {
    pathname: "/app/practice" as const,
    query: {
      promptId: session.prompt.id,
      examType: session.examType,
      taskType: session.taskType,
      difficulty: session.difficulty
    }
  };
  const displayedRawTranscript = session.rawTranscript ?? session.transcript;
  const showCleanedTranscript = Boolean(session.transcript && session.rawTranscript && session.transcript !== session.rawTranscript);
  const examMeta = getExamMeta(session, tr);
  const [targetScore, setTargetScore] = useState<string>("");
  const [audioSource, setAudioSource] = useState<string>("");
  const [savedRetry, setSavedRetry] = useState(false);
  const [savedBookmark, setSavedBookmark] = useState(false);
  const [savedStudyList, setSavedStudyList] = useState(false);
  const [sessionMode, setSessionMode] = useState<"drill" | "simulation" | "pronunciation">("drill");
  const [activeSentenceIndex, setActiveSentenceIndex] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const targetStorageKey = currentUser ? `speakace-target-${currentUser.id}` : "speakace-target-guest";
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setTargetScore(window.localStorage.getItem(targetStorageKey) ?? "");
    setAudioSource(window.localStorage.getItem(`speakace-audio-${session.id}`) ?? "");
    setSessionMode((window.localStorage.getItem(`speakace-session-mode-${session.id}`) as "drill" | "simulation" | "pronunciation" | null) ?? "drill");
    const queue = readRetryQueue();
    setSavedRetry(queue.some((item) => item.promptId === session.prompt.id));
    const bookmarks = readPromptBookmarks();
    setSavedBookmark(bookmarks.some((item) => item.promptId === session.prompt.id));
    const studyItems = readStudyItems();
    setSavedStudyList(studyItems.some((item) => item.promptId === session.prompt.id));
    void (async () => {
      try {
        const response = await fetch("/api/study-lists", { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as { items?: Array<{ promptId: string }> };
        if ((payload.items ?? []).some((item) => item.promptId === session.prompt.id)) {
          setSavedStudyList(true);
        }
      } catch {
        // local fallback is already applied above
      }
    })();
  }, [session.id, session.prompt.id, targetStorageKey]);

  const numericTarget = Number(targetScore || 0);
  const targetGap = numericTarget && session.report ? Number((numericTarget - session.report.overall).toFixed(1)) : null;
  const nextAction = useMemo(
    () =>
      buildNextAction({
        tr,
        retryRequired,
        report: session.report,
        weakestLabel: weakestCategory?.label,
        examType: session.examType
      }),
    [retryRequired, session.examType, session.report, tr, weakestCategory?.label]
  );
  const targetProgressNote = useMemo(
    () =>
      buildTargetProgressNote({
        tr,
        targetScore,
        targetGap,
        overall: session.report?.overall ?? null
      }),
    [session.report?.overall, targetGap, targetScore, tr]
  );
  const sentencePairs = useMemo(() => buildSentenceComparePairs(displayedRawTranscript ?? "", session.report?.improvedAnswer ?? ""), [displayedRawTranscript, session.report?.improvedAnswer]);
  const samePromptHistory = useMemo(
    () =>
      summary.recentSessions
        .filter((item) => item.id !== session.id && item.prompt.id === session.prompt.id && item.report)
        .slice(0, 2),
    [session.id, session.prompt.id, summary.recentSessions]
  );
  const transcriptSegments = useMemo(() => buildTranscriptSegments(displayedRawTranscript ?? ""), [displayedRawTranscript]);
  const syncedSegments = useMemo(() => {
    if (!transcriptSegments.length) return [];
    return allocateSegmentTimings(transcriptSegments, audioDuration);
  }, [audioDuration, transcriptSegments]);

  const saveToRetryQueue = () => {
    if (typeof window === "undefined") return;
    const queue = readRetryQueue();
    const next = [
      {
        promptId: session.prompt.id,
        examType: session.examType,
        taskType: session.taskType,
        difficulty: session.difficulty,
        title: session.prompt.title,
        createdAt: new Date().toISOString()
      },
      ...queue.filter((item) => item.promptId !== session.prompt.id)
    ].slice(0, 12);
    window.localStorage.setItem("speakace-retry-queue", JSON.stringify(next));
    setSavedRetry(true);
  };

  const saveToBookmarks = () => {
    if (typeof window === "undefined") return;
    const next = [
      {
        promptId: session.prompt.id,
        examType: session.examType,
        taskType: session.taskType,
        difficulty: session.difficulty,
        title: session.prompt.title,
        createdAt: new Date().toISOString()
      },
      ...readPromptBookmarks().filter((item) => item.promptId !== session.prompt.id)
    ].slice(0, 16);
    window.localStorage.setItem("speakace-bookmarks", JSON.stringify(next));
    setSavedBookmark(true);
  };

  const saveToStudyList = () => {
    if (typeof window === "undefined") return;
    void (async () => {
      try {
        const boardResponse = await fetch("/api/study-lists", { cache: "no-store" });
        const boardPayload = (await boardResponse.json().catch(() => ({ folders: [] }))) as { folders?: Array<{ id: string; name: string; createdAt: string }> };
        let folderId = boardPayload.folders?.[0]?.id;

        if (!folderId) {
          const createResponse = await fetch("/api/study-lists", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "create-folder",
              name: tr ? "Hizli kayitlar" : "Quick saves"
            })
          });
          const createPayload = (await createResponse.json().catch(() => ({}))) as { folder?: { id: string } };
          folderId = createPayload.folder?.id;
        }

        if (!folderId) {
          throw new Error("Folder not available");
        }

        await fetch("/api/study-lists/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            folderId,
            promptId: session.prompt.id,
            examType: session.examType,
            taskType: session.taskType,
            difficulty: session.difficulty,
            title: session.prompt.title
          })
        });
        setSavedStudyList(true);
      } catch {
        let folders = readStudyFolders();
        if (!folders.length) {
          folders = [
            {
              id: crypto.randomUUID(),
              name: tr ? "Hizli kayitlar" : "Quick saves",
              createdAt: new Date().toISOString()
            }
          ];
          writeStudyFolders(folders);
        }
        const folderId = folders[0].id;
        const items = readStudyItems();
        const next = [
          {
            id: crypto.randomUUID(),
            folderId,
            promptId: session.prompt.id,
            examType: session.examType,
            taskType: session.taskType,
            difficulty: session.difficulty,
            title: session.prompt.title,
            createdAt: new Date().toISOString()
          },
          ...items.filter((item) => item.promptId !== session.prompt.id)
        ].slice(0, 32);
        writeStudyItems(next);
        setSavedStudyList(true);
      }
    })();
  };

  const handleAudioTimeUpdate = () => {
    if (!audioRef.current || !syncedSegments.length) return;
    const currentTime = audioRef.current.currentTime;
    const matchIndex = syncedSegments.findIndex((segment) => currentTime >= segment.start && currentTime < segment.end);
    if (matchIndex >= 0 && matchIndex !== activeSentenceIndex) {
      setActiveSentenceIndex(matchIndex);
    }
  };

  const jumpToSegment = (index: number) => {
    if (!audioRef.current || !syncedSegments[index]) return;
    audioRef.current.currentTime = syncedSegments[index].start;
    audioRef.current.play().catch(() => undefined);
    setActiveSentenceIndex(index);
  };

  return (
    <div className="page-shell section">
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", alignItems: "start" }}>
        <section className="card" style={{ padding: "1.4rem", display: "grid", gap: "1rem" }}>
          <div>
            <span className="eyebrow">{examMeta.leftEyebrow}</span>
            <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", marginBottom: "0.5rem" }}>{session.prompt.title}</h1>
            <p style={{ color: "var(--muted)" }}>
              {examMeta.headerLine}
            </p>
          </div>

          <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)" }}>
            <strong>{examMeta.promptLabel}</strong>
            <p>{session.prompt.prompt}</p>
          </div>

          <div className="card" style={{ padding: "1rem", display: "grid", gap: "0.8rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.8rem", flexWrap: "wrap" }}>
              <strong>{examMeta.qualityLabel}</strong>
              <span className={`quality-pill quality-${qualityTone}`}>{qualityScore}/100 · {translateQualityLabel(qualityLabel, tr)}</span>
            </div>
            <p style={{ color: "var(--muted)", margin: 0, lineHeight: 1.7 }}>{buildQualityHelperText(qualityScore, tr)}</p>
          </div>

          <div className="card" style={{ padding: "1rem" }}>
            <strong>{examMeta.rawTranscriptLabel}</strong>
            <p style={{ lineHeight: "1.8", marginTop: "0.7rem" }}>{displayedRawTranscript ?? examMeta.noTranscriptText}</p>
            {audioSource ? (
              <div style={{ marginTop: "0.9rem", display: "grid", gap: "0.45rem" }}>
                <strong style={{ fontSize: "0.95rem" }}>{tr ? "Ses kaydini dinle" : "Listen to your recording"}</strong>
                <audio
                  ref={audioRef}
                  controls
                  preload="metadata"
                  src={audioSource}
                  style={{ width: "100%" }}
                  onLoadedMetadata={(event) => setAudioDuration(event.currentTarget.duration || 0)}
                  onTimeUpdate={handleAudioTimeUpdate}
                />
                <div style={{ display: "flex", gap: "0.55rem", flexWrap: "wrap" }}>
                  <Link href={`/app/replay/${session.id}`} className="button button-secondary">
                    {tr ? "Session replay" : "Session replay"}
                  </Link>
                </div>
              </div>
            ) : null}
          </div>

          {audioSource && syncedSegments.length ? (
            <div className="card" style={{ padding: "1rem", display: "grid", gap: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", alignItems: "center", flexWrap: "wrap" }}>
                <strong>{tr ? "Ses + transcript senkronu" : "Audio + transcript sync"}</strong>
                <span className="pill">{tr ? "Cumleye tikla" : "Tap a sentence"}</span>
              </div>
              <div style={{ display: "grid", gap: "0.65rem" }}>
                {syncedSegments.map((segment, index) => (
                  <button
                    key={`${segment.text}-${index}`}
                    type="button"
                    className="button button-secondary"
                    onClick={() => jumpToSegment(index)}
                    style={{
                      justifyContent: "flex-start",
                      textAlign: "left",
                      whiteSpace: "normal",
                      padding: "0.85rem 1rem",
                      background: activeSentenceIndex === index ? "rgba(29, 111, 117, 0.12)" : "rgba(255,255,255,0.65)",
                      borderColor: activeSentenceIndex === index ? "rgba(29, 111, 117, 0.3)" : "var(--line)"
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{segment.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {showCleanedTranscript ? (
            <div className="card" style={{ padding: "1rem", background: "rgba(255,255,255,0.58)" }}>
              <strong>{examMeta.cleanedTranscriptLabel}</strong>
              <p style={{ lineHeight: "1.8", marginTop: "0.7rem", color: "var(--muted)" }}>{session.transcript}</p>
            </div>
          ) : null}

          {session.report?.improvedAnswer ? (
            <>
              <div className="card" style={{ padding: "1rem", background: "rgba(47, 125, 75, 0.08)" }}>
                <strong>{examMeta.improvedAnswerLabel}</strong>
                <p style={{ lineHeight: "1.8", marginTop: "0.7rem" }}>{session.report.improvedAnswer}</p>
              </div>
              {sentencePairs.length ? (
                <div className="card" style={{ padding: "1rem" }}>
                  <strong>{tr ? "Cumle karsilastirmasi" : "Sentence compare"}</strong>
                  <div className="grid" style={{ gap: "0.75rem", marginTop: "0.85rem" }}>
                    {sentencePairs.map((pair, index) => (
                      <div key={`${pair.mine}-${pair.stronger}-${index}`} className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.75rem" }}>
                        <div className="card" style={{ padding: "0.9rem", background: "rgba(255,255,255,0.58)" }}>
                          <strong style={{ display: "block", marginBottom: "0.45rem" }}>{tr ? "Senin cumlen" : "Your line"}</strong>
                          <p style={{ margin: 0, lineHeight: 1.7 }}>{pair.mine || (tr ? "Bu bolumde net bir cumle yok." : "No clear sentence captured here.")}</p>
                        </div>
                        <div className="card" style={{ padding: "0.9rem", background: "rgba(29, 111, 117, 0.08)" }}>
                          <strong style={{ display: "block", marginBottom: "0.45rem" }}>{tr ? "Daha guclu versiyon" : "Stronger version"}</strong>
                          <p style={{ margin: 0, lineHeight: 1.7 }}>{pair.stronger || (tr ? "Bu kisim guclendirilmemis." : "No upgraded sentence here.")}</p>
                        </div>
                        <div className="card" style={{ padding: "0.9rem", background: "rgba(217, 93, 57, 0.06)", gridColumn: "1 / -1" }}>
                          <strong style={{ display: "block", marginBottom: "0.45rem" }}>{tr ? "Neden daha iyi?" : "Why this is stronger"}</strong>
                          <p style={{ margin: 0, lineHeight: 1.7 }}>{buildSentenceUpgradeReason(pair.mine, pair.stronger, tr)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          ) : null}

          {samePromptHistory.length ? (
            <div className="card" style={{ padding: "1rem" }}>
              <strong>{tr ? "Ayni sorudaki onceki denemeler" : "Retry compare history"}</strong>
              <div className="grid" style={{ gap: "0.75rem", marginTop: "0.8rem" }}>
                {samePromptHistory.map((item) => (
                  <div key={item.id} className="card" style={{ padding: "0.9rem", background: "rgba(255,255,255,0.58)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", alignItems: "center", flexWrap: "wrap" }}>
                      <strong>{new Date(item.createdAt).toLocaleDateString(tr ? "tr-TR" : "en-US")}</strong>
                      <span className="pill">
                        {item.report?.overall ?? "-"} {session.report && item.report ? `→ ${Number((session.report.overall - item.report.overall).toFixed(1)) > 0 ? "+" : ""}${Number((session.report.overall - item.report.overall).toFixed(1))}` : ""}
                      </span>
                    </div>
                    <p style={{ margin: "0.65rem 0 0", lineHeight: 1.7, color: "var(--muted)" }}>
                      {item.rawTranscript ?? item.transcript ?? (tr ? "Transcript yok." : "No transcript.")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="card" style={{ padding: "1rem", background: "rgba(29, 111, 117, 0.08)" }}>
            <strong>{examMeta.coachLabel}</strong>
            <p style={{ marginTop: "0.7rem", lineHeight: 1.8 }}>
              {buildCoachSummary({
                tr,
                retryRequired,
                report: session.report,
                strongestLabel: strongestCategory?.label,
                weakestLabel: weakestCategory?.label,
                examType: session.examType
              })}
            </p>
          </div>

          <div className="card" style={{ padding: "1rem", background: "rgba(217, 93, 57, 0.06)" }}>
            <strong>{examMeta.structureLabel}</strong>
            <p style={{ marginTop: "0.7rem", lineHeight: 1.8 }}>{examMeta.structureHint}</p>
          </div>
        </section>

        <section className="card" style={{ padding: "1.4rem", display: "grid", gap: "1rem" }}>
          <span className="eyebrow">{examMeta.rightEyebrow}</span>
          {session.report ? (
            <>
              <div>
                <div style={{ fontSize: "3rem", fontWeight: 800 }}>{session.report.overall}</div>
                <div style={{ color: "var(--muted)" }}>{session.report.scaleLabel}</div>
              </div>
              <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
                <InsightCard title={examMeta.totalSessionsLabel} value={String(summary.totalSessions)} note={examMeta.totalSessionsNote} />
                <InsightCard title={examMeta.averageLabel} value={summary.averageScore ? String(summary.averageScore) : "-"} note={examMeta.averageNote} />
                <InsightCard title={examMeta.trendLabel} value={delta === null ? "-" : delta > 0 ? `+${delta}` : String(delta)} note={buildTrendNote(delta, tr)} />
              </div>
              <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                <InsightCard title={tr ? "Hedefe mesafe" : "Distance to target"} value={targetScore || "-"} note={targetProgressNote} />
                <InsightCard title={tr ? "Bir sonraki net gorev" : "One clear next task"} value={tr ? "Sonraki adim" : "Next step"} note={nextAction} />
              </div>
              <ChecklistCard
                title={tr ? "Session checklist" : "Session checklist"}
                items={buildSessionChecklist({
                  tr,
                  retryRequired,
                  report: session.report,
                  strongestLabel: strongestCategory?.label,
                  weakestLabel: weakestCategory?.label,
                  examType: session.examType
                })}
              />
              <div className="grid" style={{ gridTemplateColumns: "1fr" }}>
                {session.report.categories.map((category) => (
                  <div key={category.category} className="card" style={{ padding: "0.9rem", background: "var(--surface-strong)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem" }}>
                      <span>{tr ? translateCategoryLabel(category.label) : category.label}</span>
                      <strong>{category.score}</strong>
                    </div>
                  </div>
                ))}
              </div>
              <DetailList title={examMeta.strengthsLabel} items={session.report.strengths} />
              <DetailList title={examMeta.improvementsLabel} items={session.report.improvements} />
              <div className="card" style={{ padding: "1rem" }}>
                <strong>{examMeta.nextExerciseLabel}</strong>
                <p>{session.report.nextExercise}</p>
              </div>
              <div className="card" style={{ padding: "1rem" }}>
                <strong>{examMeta.trendPanelLabel}</strong>
                <div style={{ display: "grid", gap: "0.65rem", marginTop: "0.8rem" }}>
                  {summary.recentSessions.slice(0, 4).map((item) => (
                    <div key={item.id} style={{ display: "grid", gridTemplateColumns: "140px 1fr 60px", gap: "0.8rem", alignItems: "center" }}>
                      <span style={{ color: "var(--muted)", fontSize: "0.92rem" }}>{item.prompt.title}</span>
                      <div style={{ height: 10, borderRadius: 999, background: "rgba(29, 111, 117, 0.12)", overflow: "hidden" }}>
                        <div style={{ width: `${Math.max(((item.report?.overall ?? 0) / examMeta.scoreMax) * 100, 8)}%`, height: "100%", background: "linear-gradient(90deg, var(--accent), var(--accent-cool))" }} />
                      </div>
                      <strong>{item.report?.overall ?? "-"}</strong>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card" style={{ padding: "1rem", background: "rgba(29, 111, 117, 0.08)" }}>
                <strong>{examMeta.fillerWordsLabel}</strong>
                <p>{session.report.fillerWords.join(", ") || (tr ? "Yok" : "None")}</p>
                <p style={{ color: "var(--muted)" }}>{session.report.caution}</p>
              </div>
            </>
          ) : (
            <p>{tr ? "Henuz AI raporu yok." : "No AI report yet."}</p>
          )}

          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <Link href={retryHref} className="button button-primary">
              {examMeta.retryLabel}
            </Link>
            <button type="button" className="button button-secondary" onClick={saveToRetryQueue} disabled={savedRetry}>
              {savedRetry ? (tr ? "Retry listesine eklendi" : "Saved to retry queue") : tr ? "Retry listesine kaydet" : "Save to retry queue"}
            </button>
            <button type="button" className="button button-secondary" onClick={saveToBookmarks} disabled={savedBookmark}>
              {savedBookmark ? (tr ? "Soru kaydedildi" : "Prompt bookmarked") : tr ? "Soruyu kaydet" : "Bookmark prompt"}
            </button>
            <button type="button" className="button button-secondary" onClick={saveToStudyList} disabled={savedStudyList}>
              {savedStudyList ? (tr ? "Study list'e eklendi" : "Added to study list") : tr ? "Study list'e ekle" : "Add to study list"}
            </button>
            <Link href="/app/practice" className="button button-secondary">
              {examMeta.newPracticeLabel}
            </Link>
          </div>
          {sessionMode === "pronunciation" ? (
            <div className="card" style={{ padding: "1rem", background: "rgba(29, 111, 117, 0.08)" }}>
              <strong>{tr ? "Pronunciation mode notu" : "Pronunciation mode note"}</strong>
              <p style={{ marginTop: "0.65rem", lineHeight: 1.75 }}>
                {tr
                  ? "Bu deneme telaffuz odakli modda kaydedildi. Sonraki denemede kelime sonlarini daha net bitirmeye, vurgu yerlerini belirginlestirmeye ve hizini bir tik dusurmeye calis."
                  : "This attempt was recorded in pronunciation mode. In the next attempt, focus on clearer word endings, stronger stress, and a slightly slower pace."}
              </p>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

function readPromptBookmarks() {
  if (typeof window === "undefined") return [] as Array<{ promptId: string }>;
  try {
    const raw = window.localStorage.getItem("speakace-bookmarks");
    return raw ? (JSON.parse(raw) as Array<{ promptId: string }>) : [];
  } catch {
    return [];
  }
}

function InsightCard({ title, value, note }: { title: string; value: string; note: string }) {
  return (
    <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)" }}>
      <div style={{ color: "var(--muted)", marginBottom: "0.4rem" }}>{title}</div>
      <div style={{ fontSize: "1.8rem", fontWeight: 800 }}>{value}</div>
      <div style={{ color: "var(--muted)", marginTop: "0.35rem", lineHeight: 1.5 }}>{note}</div>
    </div>
  );
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="card" style={{ padding: "1rem" }}>
      <strong>{title}</strong>
      <ul style={{ marginBottom: 0 }}>
        {items.map((item) => (
          <li key={item} style={{ marginTop: "0.5rem" }}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function getExamMeta(session: SpeakingSession, tr: boolean) {
  if (session.examType === "IELTS") {
    return {
      leftEyebrow: tr ? "IELTS Transcript" : "IELTS Transcript",
      rightEyebrow: tr ? "IELTS Band Analizi" : "IELTS Band Analysis",
      headerLine: `${session.examType} · ${session.taskType} · ${session.difficulty}`,
      promptLabel: tr ? "IELTS sorusu" : "IELTS prompt",
      qualityLabel: tr ? "Transcript kalitesi" : "Transcript quality",
      cleanedTranscriptLabel: tr ? "Analiz icin temizlenmis transcript" : "Cleaned transcript for analysis",
      rawTranscriptLabel: tr ? "Birebir transcript" : "Exact transcript",
      improvedAnswerLabel: tr ? "Bu soruya daha guclu bir ornek cevap" : "A stronger sample answer for this prompt",
      noTranscriptText: tr ? "Degerlendirmeden sonra transcript burada gorunur." : "Transcript will appear after evaluation.",
      coachLabel: tr ? "IELTS koç ozeti" : "IELTS coach summary",
      structureLabel: tr ? "Bu partta ne beklenir" : "What this part expects",
      structureHint: buildIeltsStructureHint(session.taskType, tr),
      totalSessionsLabel: tr ? "Toplam deneme" : "Total attempts",
      totalSessionsNote: tr ? "Kayitli IELTS speaking denemen" : "Recorded IELTS speaking attempts",
      averageLabel: tr ? "Ortalama band" : "Average band",
      averageNote: tr ? "Son denemelerdeki ortalama" : "Across recent attempts",
      trendLabel: tr ? "Band trendi" : "Band trend",
      strengthsLabel: tr ? "Guclu yonler" : "Strengths",
      improvementsLabel: tr ? "Band artisi icin gelistir" : "Improve for a higher band",
      nextExerciseLabel: tr ? "Sonraki IELTS calismasi" : "Next IELTS drill",
      trendPanelLabel: tr ? "Son IELTS denemeleri" : "Recent IELTS attempts",
      fillerWordsLabel: tr ? "Akiciligi etkileyen filler kelimeler" : "Fluency filler words",
      retryLabel: tr ? "Ayni IELTS sorusunu tekrar dene" : "Retry the same IELTS question",
      newPracticeLabel: tr ? "Yeni IELTS/TOEFL sorusu ac" : "Try a new exam question",
      scoreMax: 9
    };
  }

  return {
    leftEyebrow: tr ? "TOEFL Transcript" : "TOEFL Transcript",
    rightEyebrow: tr ? "TOEFL Task Analizi" : "TOEFL Task Analysis",
    headerLine: `${session.examType} · ${session.taskType} · ${session.difficulty}`,
    promptLabel: tr ? "TOEFL gorevi" : "TOEFL task",
    qualityLabel: tr ? "Transcript kalitesi" : "Transcript quality",
    cleanedTranscriptLabel: tr ? "Analiz icin temizlenmis transcript" : "Cleaned transcript for analysis",
    rawTranscriptLabel: tr ? "Birebir transcript" : "Exact transcript",
    improvedAnswerLabel: tr ? "Bu soruya daha guclu bir ornek cevap" : "A stronger sample answer for this prompt",
    noTranscriptText: tr ? "Degerlendirmeden sonra transcript burada gorunur." : "Transcript will appear after evaluation.",
    coachLabel: tr ? "TOEFL koç ozeti" : "TOEFL coach summary",
    structureLabel: tr ? "Bu taskta ne beklenir" : "What this task expects",
    structureHint: buildToeflStructureHint(session.taskType, tr),
    totalSessionsLabel: tr ? "Toplam task denemesi" : "Total task attempts",
    totalSessionsNote: tr ? "Kayitli TOEFL speaking denemen" : "Recorded TOEFL speaking attempts",
    averageLabel: tr ? "Ortalama tahmin" : "Average estimate",
    averageNote: tr ? "Son TOEFL denemelerinde" : "Across recent TOEFL attempts",
    trendLabel: tr ? "Task trendi" : "Task trend",
    strengthsLabel: tr ? "Taskta iyi gidenler" : "Task strengths",
    improvementsLabel: tr ? "Task icin gelistir" : "Improve for this task",
    nextExerciseLabel: tr ? "Sonraki TOEFL calismasi" : "Next TOEFL drill",
    trendPanelLabel: tr ? "Son TOEFL denemeleri" : "Recent TOEFL attempts",
    fillerWordsLabel: tr ? "Delivery filler kelimeleri" : "Delivery filler words",
    retryLabel: tr ? "Ayni TOEFL taskini tekrar dene" : "Retry the same TOEFL task",
    newPracticeLabel: tr ? "Yeni TOEFL/IELTS sorusu ac" : "Try a new exam question",
    scoreMax: 4
  };
}

function buildIeltsStructureHint(taskType: string, tr: boolean) {
  if (taskType === "ielts-part-1") {
    return tr ? "IELTS Part 1'de kisa ama net cevap beklenir: once direkt cevap, sonra bir neden veya mini ornek." : "IELTS Part 1 expects short but clear personal answers: direct response first, then one reason or mini example.";
  }
  if (taskType === "ielts-part-2") {
    return tr ? "IELTS Part 2'de uzun konusma beklenir. Cue card maddelerini kapsayan acilis, gelisme ve kapanis yapisi en guclu formattir." : "IELTS Part 2 expects a longer turn. A clear opening, development, and close that covers the cue-card points is the strongest structure.";
  }
  return tr ? "IELTS Part 3'te fikir gelistirme beklenir. Bir gorus, neden ve kisa bir ornek cevabi daha yuksek band seviyesine tasir." : "IELTS Part 3 expects idea development. One opinion, one reason, and one short example usually creates a stronger band-level response.";
}

function buildToeflStructureHint(taskType: string, tr: boolean) {
  if (taskType === "toefl-task-1") {
    return tr ? "TOEFL Task 1'de once fikrini net soyle, sonra 1 guclu sebep ve 1 detayli ornek ver." : "TOEFL Task 1 works best when you state your opinion immediately, then support it with one strong reason and one detailed example.";
  }
  if (taskType === "toefl-task-2") {
    return tr ? "TOEFL Task 2'de kendi fikrini verme. Once duyuruyu kisaca ozetle, sonra konusmadaki kisilerin goruslerini sirayla aktar." : "TOEFL Task 2 should not include your own opinion. Briefly summarize the announcement first, then explain each speaker's view in order.";
  }
  if (taskType === "toefl-task-3") {
    return tr ? "TOEFL Task 3'te once akademik kavrami tanimla, sonra profesörün örneğinin kavramı nasıl gösterdiğini açıkla." : "TOEFL Task 3 works best when you define the academic concept first, then explain how the professor's example demonstrates it.";
  }
  return tr ? "TOEFL Task 4'te dersi ana konu ve 2 ana nokta halinde ozetlemek en temiz yapidir." : "TOEFL Task 4 is strongest when you summarize the lecture as one main topic plus two organized key points.";
}

function buildTrendNote(delta: number | null, tr: boolean) {
  if (delta === null) {
    return tr ? "Karsilastirma icin daha fazla deneme lazim" : "Need another scored attempt";
  }
  if (delta > 0) {
    return tr ? "Bir onceki denemeden daha iyi" : "Better than the previous scored attempt";
  }
  return tr ? "Bir onceki denemeye gore dusus var" : "Below the previous scored attempt";
}

function buildTargetProgressNote({
  tr,
  targetScore,
  targetGap,
  overall
}: {
  tr: boolean;
  targetScore: string;
  targetGap: number | null;
  overall: number | null;
}) {
  if (!targetScore) {
    return tr
      ? "Dashboard'dan istege bagli hedef skor secersen bu denemenin seni hedefine ne kadar yaklastirdigini burada gorebilirsin."
      : "Pick an optional target score in the dashboard to see how much this attempt moves you toward that goal.";
  }

  if (overall === null) {
    return tr ? "Hedef karsilastirmasi icin once puan gerekli." : "A scored result is needed before target comparison appears.";
  }

  if ((targetGap ?? 0) <= 0) {
    return tr
      ? `Bu deneme secili hedefin olan ${targetScore} seviyesine ulasiyor ya da onu geciyor. Siradaki amac bunu daha istikrarli hale getirmek olmali.`
      : `This attempt already reaches or exceeds your selected target of ${targetScore}. The next goal is to make that level more consistent.`;
  }

  return tr
    ? `Bu deneme seni hedefinden ${targetGap} puan uzakta birakti. Dogru odakla bu fark parcali olarak kapanabilir.`
    : `This attempt leaves you ${targetGap} points away from your target. With the right focus, that gap can close step by step.`;
}

function buildNextAction({
  tr,
  retryRequired,
  report,
  weakestLabel,
  examType
}: {
  tr: boolean;
  retryRequired: boolean;
  report: SpeakingSession["report"];
  weakestLabel?: string;
  examType: SpeakingSession["examType"];
}) {
  if (!report) {
    return tr ? "Sonuc hazir olduktan sonra burada tek bir sonraki gorev goreceksin." : "Once the result is ready, you will see one clear next task here.";
  }

  if (retryRequired) {
    return tr
      ? "Ayni soruyu tekrar cozerken sadece Ingilizce konus ve cevabini en az bir neden ile uzat."
      : "Retry the same question in English only and extend the answer with at least one reason.";
  }

  const weakest = weakestLabel ?? (examType === "IELTS" ? "Fluency and Coherence" : "Topic Development");

  if (weakest.includes("Fluency") || weakest.includes("Coherence") || weakest.includes("Delivery")) {
    return tr
      ? "Bir sonraki denemede daha yavas basla, iki fikrini baglanti kelimeleriyle birlestir ve gereksiz duraksamalari azalt."
      : "In the next attempt, start slightly slower, connect your ideas with clear linking words, and reduce unnecessary pauses.";
  }

  if (weakest.includes("Lexical") || weakest.includes("Language Use")) {
    return tr
      ? "Ayni soruyu tekrar dene ama bu kez iki anahtar kelimeyi daha guclu es anlamlilarla degistir ve tekrar oranini azalt."
      : "Retry the same prompt, but replace two repeated words with stronger alternatives and reduce repetition.";
  }

  if (weakest.includes("Grammatical")) {
    return tr
      ? "Bir sonraki practice'te daha kisa ama daha temiz cumleler kur; hiz yerine dogrulugu onceliklendir."
      : "In the next practice, use slightly shorter but cleaner sentences and prioritize accuracy over speed.";
  }

  if (weakest.includes("Pronunciation")) {
    return tr
      ? "Ayni soruyu tekrar kaydetmeden once anahtar kelimeleri yavasca bir kez sesli prova et, sonra daha net vurgu ile konus."
      : "Before retrying the same question, rehearse the key words once out loud, then speak again with clearer stress and endings.";
  }

  return tr
    ? "Bir sonraki denemede ana fikrini ilk 10 saniyede netlestir, sonra bir neden ve bir ornekle cevabi tamamla."
    : "In the next attempt, make your main point clear in the first 10 seconds, then finish with one reason and one example.";
}

function translateCategoryLabel(label: string) {
  const labels: Record<string, string> = {
    "Fluency and Coherence": "Akicilik ve Tutarlilik",
    "Lexical Resource": "Kelime Kullanimi",
    "Grammatical Range and Accuracy": "Dilbilgisi Araligi ve Dogruluk",
    Pronunciation: "Telaffuz",
    Delivery: "Delivery",
    "Language Use": "Dil kullanimi",
    "Topic Development": "Icerik gelisimi",
    Fluency: "Akicilik",
    Coherence: "Tutarlilik"
  };
  return labels[label] ?? label;
}

function translateQualityLabel(label: string, tr: boolean) {
  if (!tr) return label;
  if (label === "Strong") return "Guclu";
  if (label === "Usable") return "Kullanilabilir";
  if (label === "Weak") return "Zayif";
  if (label === "Retry needed") return "Tekrar gerekli";
  return label;
}

function buildQualityHelperText(score: number, tr: boolean) {
  if (score >= 85) {
    return tr ? "Transcript temiz gorunuyor. Bu analiz icin saglam bir temel." : "This transcript looks clean and is a strong base for analysis.";
  }
  if (score >= 65) {
    return tr ? "Transcript kullanilabilir durumda. Kucuk kelime kacirmalari olsa da analiz genel olarak guvenilir." : "The transcript is usable. A few missed words are possible, but the overall analysis should still be reliable.";
  }
  if (score >= 40) {
    return tr ? "Transcript zayif gorunuyor. Sonucu yorumlarken dikkatli olmakta fayda var; bir tekrar daha daha guvenilir olabilir." : "The transcript looks weak. Treat the result carefully; retrying once may give a more reliable report.";
  }
  return tr ? "Bu transcript tekrar gerektiriyor. Net Ingilizce ve biraz daha uzun cevapla yeniden denemek en iyi sonuc verir." : "This transcript needs a retry. A clearer, longer English response will produce a much better result.";
}

function buildCoachSummary({
  tr,
  retryRequired,
  report,
  strongestLabel,
  weakestLabel,
  examType
}: {
  tr: boolean;
  retryRequired: boolean;
  report: SpeakingSession["report"];
  strongestLabel?: string;
  weakestLabel?: string;
  examType: SpeakingSession["examType"];
}) {
  if (!report) {
    return tr ? "Sonuc hazir oldugunda burada daha net bir koç yorumu goreceksin." : "You will see a clearer coach summary here once the result is ready.";
  }

  if (retryRequired) {
    return report.scaleLabel === "Please respond in English"
      ? tr
        ? "Sistem bu cevabin agirlikli olarak Ingilizce olmadigini algiladi. Bu yuzden sinav mantigina gore puanlama yapilmadi. Morali bozma; ayni soruyu sadece Ingilizce ve biraz daha net bir telaffuzla tekrar denersen cok daha faydali bir analiz alirsin."
        : "The system detected that this answer was not primarily in English, so it was not scored normally against the exam rubric. Do not let that discourage you; if you retry the same question in English with calmer, clearer delivery, you will get a much more useful analysis."
      : tr
        ? "Bu cevap guvenilir puanlama icin fazla kisaydi. Bu kotu oldugun anlamina gelmez; sadece sistemin yeterli dil verisi alamadigi anlamina gelir. Bir sonraki denemede daha uzun ve tam cumlelerle konusursan cok daha iyi geri bildirim alirsin."
        : "This response was too short for reliable scoring. That does not mean you are bad at speaking; it means the system did not receive enough language to judge fairly. In the next attempt, speak longer in complete sentences and you will get much better feedback.";
  }

  const lowThreshold = examType === "IELTS" ? 4 : 2;
  if (report.overall <= lowThreshold) {
    return tr
      ? `Bu deneme su an hedef seviyenin belirgin sekilde altinda. En zayif nokta ${weakestLabel ?? "yanit gelistirme"} tarafinda gorunuyor ve cevap daha net, daha uzun ve daha Ingilizce odakli olmali. Yine de bu cok duzeltilebilir bir durum; eger bu sekilde duzenli calisip her cevapta tek bir fikri ornekle desteklersen hizli ilerleme gorebilirsin.`
      : `This attempt is clearly below the current target level. The weakest area appears to be ${weakestLabel ?? "response development"}, and the answer needs to be clearer, fuller, and more controlled. Even so, this is very fixable; if you keep practicing consistently and support each answer with one clear example, you can improve quickly.`;
  }

  return tr
    ? `Bu cevapta en guclu alanin ${strongestLabel ?? "genel yapi"} tarafinda gorunuyor. En fazla puan artisi potansiyeli ise ${weakestLabel ?? "detay kullanimi"} tarafinda. Bir sonraki denemede cevaplarini biraz daha detaylandirip daha temiz baglaclarla ilerlersen daha dengeli bir sonuc alirsin.`
    : `Your strongest area in this attempt appears to be ${strongestLabel ?? "overall structure"}. The clearest room for growth is ${weakestLabel ?? "detail support"}. In the next attempt, add one more concrete detail and connect ideas more cleanly to produce a more balanced score.`;
}


function ChecklistCard({
  title,
  items
}: {
  title: string;
  items: Array<{ label: string; text: string }>;
}) {
  return (
    <div className="card" style={{ padding: "1rem", display: "grid", gap: "0.75rem" }}>
      <strong>{title}</strong>
      <div style={{ display: "grid", gap: "0.7rem" }}>
        {items.map((item) => (
          <div key={`${item.label}-${item.text}`} className="card" style={{ padding: "0.9rem", background: "var(--surface-strong)" }}>
            <div style={{ fontWeight: 700, marginBottom: "0.35rem" }}>{item.label}</div>
            <div style={{ color: "var(--muted)", lineHeight: 1.6 }}>{item.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

type RetryQueueItem = {
  promptId: string;
  examType: SpeakingSession["examType"];
  taskType: SpeakingSession["taskType"];
  difficulty: SpeakingSession["difficulty"];
  title: string;
  createdAt: string;
};

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

function buildTranscriptSegments(transcript: string) {
  return transcript
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((text) => ({ text }));
}

function allocateSegmentTimings(segments: Array<{ text: string }>, duration: number) {
  if (!segments.length) return [];
  const safeDuration = duration > 0 ? duration : segments.length * 2.2;
  const totalWeight = segments.reduce((sum, segment) => sum + Math.max(segment.text.length, 12), 0);
  let cursor = 0;
  return segments.map((segment, index) => {
    const weight = Math.max(segment.text.length, 12);
    const slice = (weight / totalWeight) * safeDuration;
    const start = cursor;
    const end = index === segments.length - 1 ? safeDuration : cursor + slice;
    cursor = end;
    return { ...segment, start, end };
  });
}

function buildSentenceUpgradeReason(mine: string, stronger: string, tr: boolean) {
  if (!mine && stronger) {
    return tr
      ? "Bu bolumde net bir cümle yakalanmadigi icin ornek cevap daha tam ve sinav mantigina uygun bir cümle kuruyor."
      : "No clear sentence was captured here, so the stronger version gives you a fuller and more exam-ready line.";
  }

  const mineWords = mine.split(/\s+/).filter(Boolean).length;
  const strongerWords = stronger.split(/\s+/).filter(Boolean).length;

  if (strongerWords > mineWords + 4) {
    return tr
      ? "Guclu versiyon fikri biraz daha aciyor, bu da cevabi daha gelistirilmis ve puanlanabilir hale getiriyor."
      : "The stronger version develops the idea more fully, which makes the answer easier to score well.";
  }

  if (/[,.]/.test(stronger) && !/[,.]/.test(mine)) {
    return tr
      ? "Bu versiyon cümleyi daha kontrollü bölüyor ve dinleyici için daha takip edilebilir hale getiriyor."
      : "This version controls the sentence more clearly and makes it easier for a listener to follow.";
  }

  return tr
    ? "Guclu versiyon ayni ana fikri korurken daha net, daha dogal ve sinavda daha guven veren bir ifade kuruyor."
    : "The stronger version keeps the same core idea but expresses it in a clearer, more natural, and more exam-ready way.";
}

function buildSessionChecklist({
  tr,
  retryRequired,
  report,
  strongestLabel,
  weakestLabel,
  examType
}: {
  tr: boolean;
  retryRequired: boolean;
  report: SpeakingSession["report"];
  strongestLabel?: string;
  weakestLabel?: string;
  examType: SpeakingSession["examType"];
}) {
  if (!report) {
    return [
      {
        label: tr ? "Hazirlan" : "Get ready",
        text: tr ? "Sonuc olustuktan sonra bu denemeyi 3 satirda ozetleyen hizli bir checklist burada gorunecek." : "Once the result is ready, you will see a fast 3-line checklist that summarizes this attempt."
      }
    ];
  }

  if (retryRequired) {
    return [
      {
        label: tr ? "Iyi taraf" : "Worked well",
        text: tr ? "Sisteme bir cevap verdin ve analiz akisini tamamladin; bu tekrar denemek icin iyi bir temel." : "You completed the response flow, which is already a useful base for a retry."
      },
      {
        label: tr ? "Kacan nokta" : "Missed point",
        text: tr ? "Bu deneme guvenilir puanlama icin ya yeterince Ingilizce degildi ya da yeterince uzun degildi." : "This attempt was either not English enough or not long enough for reliable scoring."
      },
      {
        label: tr ? "Bir sonrakinde" : "Fix next",
        text: tr ? "Ayni soruyu tekrar cozerken sadece Ingilizce konus ve cevabini en az bir neden ile uzat." : "On the next try, answer in English only and extend the response with at least one reason."
      }
    ];
  }

  const strongest = strongestLabel ? (tr ? translateCategoryLabel(strongestLabel) : strongestLabel) : tr ? "genel yapi" : "overall structure";
  const weakest = weakestLabel ? (tr ? translateCategoryLabel(weakestLabel) : weakestLabel) : tr ? "yanit gelistirme" : "response development";
  const lowThreshold = examType === "IELTS" ? 4 : 2;

  if (report.overall <= lowThreshold) {
    return [
      {
        label: tr ? "Iyi taraf" : "Worked well",
        text: tr ? `Bu denemede en azindan ${strongest} tarafinda bir temel var; yani sifirdan baslamiyorsun.` : `There is still a base in ${strongest}, so you are not starting from zero.`
      },
      {
        label: tr ? "Kacan nokta" : "Missed point",
        text: tr ? `${weakest} ve cevap gelisimi su an skoru en cok asagi ceken alanlar.` : `${weakest} and response development are the main areas holding the score down right now.`
      },
      {
        label: tr ? "Bir sonrakinde" : "Fix next",
        text: tr ? "Bir sonraki denemede ana fikrini ilk cümlede netlestir, sonra tek bir neden ve tek bir ornekle cevabi tamamla." : "In the next attempt, make the main point clear in the first sentence, then complete the answer with one reason and one example."
      }
    ];
  }

  return [
    {
      label: tr ? "Iyi taraf" : "Worked well",
      text: tr ? `Bu denemede en guclu tarafin ${strongest} oldu.` : `Your strongest area in this attempt was ${strongest}.`
    },
    {
      label: tr ? "Kacan nokta" : "Missed point",
      text: tr ? `En fazla puan kaybi ${weakest} tarafinda gorunuyor.` : `The clearest score loss shows up in ${weakest}.`
    },
    {
      label: tr ? "Bir sonrakinde" : "Fix next",
      text: tr ? `Bir sonraki denemede ${weakest} tarafini duzeltmek icin ayni soruda bir neden ve bir ornek daha temiz bagla.` : `In the next attempt, improve ${weakest} by linking one reason and one example more cleanly in the same prompt.`
    }
  ];
}

function buildSentenceComparePairs(rawTranscript: string, improvedAnswer: string) {
  const split = (text: string) =>
    text
      .split(/(?<=[.!?])\s+/)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 6);

  const mine = split(rawTranscript);
  const stronger = split(improvedAnswer);
  const max = Math.max(mine.length, stronger.length);

  return Array.from({ length: max }, (_, index) => ({
    mine: mine[index] ?? "",
    stronger: stronger[index] ?? ""
  })).filter((pair) => pair.mine || pair.stronger);
}
