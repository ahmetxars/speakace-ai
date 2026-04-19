"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAppState } from "@/components/providers";
import { trackClientEvent } from "@/lib/analytics-client";
import { ProgressSummary, SpeakingSession } from "@/lib/types";
import { readStudyFolders, readStudyItems, writeStudyFolders, writeStudyItems } from "@/lib/study-lists";

export function ResultView({ session, summary }: { session: SpeakingSession; summary: ProgressSummary }) {
  const { language, currentUser } = useAppState();
  const tr = language === "tr";
  const canExportReport = Boolean(currentUser && currentUser.plan !== "free");
  const previousSession = summary.recentSessions.find((item) => item.id !== session.id && item.report);
  const delta = session.report && previousSession?.report ? Number((session.report.overall - previousSession.report.overall).toFixed(1)) : null;
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
  const examMeta = getExamMeta(session, tr);
  const learnerName = currentUser?.name?.trim() || (tr ? "SpeakAce learner" : "SpeakAce learner");
  const avatarInitials = getAvatarInitials(learnerName);
  const localeFlag = getLocaleFlag(language);
  const scoreBadge = getScoreBadge({ score: session.report?.overall ?? 0, examType: session.examType, tr });
  const streakLabel = summary.streakDays > 0
    ? (tr ? `${summary.streakDays} günlük seri` : `${summary.streakDays}-day streak`)
    : (tr ? "İlk seriyi başlat" : "Start your first streak");
  const [avatarDataUrl, setAvatarDataUrl] = useState<string>("");
  const [publicShareUrl, setPublicShareUrl] = useState<string>("");
  const [audioSource, setAudioSource] = useState<string>("");
  const [savedStudyList, setSavedStudyList] = useState(false);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [activeTab, setActiveTab] = useState<"feedback" | "transcript" | "compare" | "history">("feedback");
  const [shareMessage, setShareMessage] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setAudioSource(window.localStorage.getItem(`speakace-audio-${session.id}`) ?? "");
    const studyItems = readStudyItems();
    setSavedStudyList(studyItems.some((item) => item.promptId === session.prompt.id));
    void (async () => {
      try {
        const profileResponse = await fetch("/api/profile", { cache: "no-store" });
        if (profileResponse.ok) {
          const profilePayload = (await profileResponse.json()) as { profile?: { avatarDataUrl?: string } };
          setAvatarDataUrl(profilePayload.profile?.avatarDataUrl ?? "");
        }
      } catch {
        setAvatarDataUrl("");
      }
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
  }, [session.id, session.prompt.id]);

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

  const shareText = session.report
    ? tr
      ? `SpeakAce sonucum: ${session.report.overall} ${session.report.scaleLabel}. ${session.prompt.title}`
      : `My SpeakAce result: ${session.report.overall} ${session.report.scaleLabel}. ${session.prompt.title}`
    : "";

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

  const exportPdfReport = () => {
    if (typeof window === "undefined") return;
    if (currentUser?.id) {
      void trackClientEvent({ userId: currentUser.id, event: "pdf_report_export", path: `/app/results/${session.id}` });
    }
    const printWindow = window.open("", "_blank", "noopener,noreferrer,width=960,height=1200");
    if (!printWindow) return;

    const report = session.report;
    const categoryMarkup = report
      ? report.categories
          .map(
            (cat) => `
              <div class="metric-row">
                <span>${tr ? translateCategoryLabel(cat.label) : cat.label}</span>
                <strong>${cat.score}</strong>
              </div>
            `
          )
          .join("")
      : "";
    const strengthsMarkup = report?.strengths.map((item) => `<li>${escapeHtml(item)}</li>`).join("") ?? "";
    const improvementsMarkup = report?.improvements.map((item) => `<li>${escapeHtml(item)}</li>`).join("") ?? "";
    const fillerMarkup = report?.fillerWords.length ? `<p>${report.fillerWords.map((item) => escapeHtml(item)).join(", ")}</p>` : "";

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${escapeHtml(`${session.prompt.title} report`)}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #111827; }
            h1, h2, h3 { margin: 0 0 12px; }
            p, li { line-height: 1.6; font-size: 14px; }
            .hero { border: 1px solid #dbe3f0; border-radius: 18px; padding: 24px; margin-bottom: 24px; }
            .score { font-size: 56px; font-weight: 800; color: #2563eb; margin: 8px 0; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-top: 18px; }
            .card { border: 1px solid #dbe3f0; border-radius: 16px; padding: 18px; break-inside: avoid; margin-bottom: 18px; }
            .metric-row { display: flex; justify-content: space-between; gap: 16px; padding: 8px 0; border-bottom: 1px solid #eef2f7; }
            .metric-row:last-child { border-bottom: none; }
            .eyebrow { text-transform: uppercase; letter-spacing: .12em; font-size: 11px; font-weight: 700; color: #2563eb; }
            @media print { body { margin: 20px; } }
          </style>
        </head>
        <body>
          <section class="hero">
            <div class="eyebrow">SpeakAce Report</div>
            <h1>${escapeHtml(session.prompt.title)}</h1>
            <p>${escapeHtml(`${session.examType} • ${session.taskType} • ${session.difficulty}`)}</p>
            ${report ? `<div class="score">${report.overall}</div><p>${escapeHtml(report.scaleLabel)}</p>` : ""}
          </section>
          <section class="grid">
            <div class="card">
              <h2>${tr ? "Kategori skorları" : "Category scores"}</h2>
              ${categoryMarkup}
            </div>
            <div class="card">
              <h2>${tr ? "Sonraki adım" : "Next step"}</h2>
              <p>${escapeHtml(report?.nextExercise ?? "")}</p>
              <h3>${tr ? "Filler words" : "Filler words"}</h3>
              ${fillerMarkup || `<p>${tr ? "Yok" : "None"}</p>`}
            </div>
          </section>
          <section class="card">
            <h2>${tr ? "Güçlü yönler" : "Strengths"}</h2>
            <ul>${strengthsMarkup}</ul>
          </section>
          <section class="card">
            <h2>${tr ? "Geliştirme alanları" : "Improve next"}</h2>
            <ul>${improvementsMarkup}</ul>
          </section>
          <section class="card">
            <h2>${tr ? "Senin transkriptin" : "Your transcript"}</h2>
            <p>${escapeHtml(displayedRawTranscript ?? "")}</p>
          </section>
          <section class="card">
            <h2>${tr ? "Düzeltilmiş versiyon" : "Corrected version"}</h2>
            <p>${escapeHtml(report?.improvedAnswer ?? "")}</p>
          </section>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    window.setTimeout(() => {
      printWindow.print();
    }, 150);
  };

  const handleAudioTimeUpdate = () => {
    if (!audioRef.current || !syncedSegments.length) return;
    const currentTime = audioRef.current.currentTime;
    const matchIndex = syncedSegments.findIndex((segment) => currentTime >= segment.start && currentTime < segment.end);
    if (matchIndex >= 0 && matchIndex !== activeSentenceIndex) {
      setActiveSentenceIndex(matchIndex);
    }
  };

  const buildShareableCardSvg = () => {
    if (!session.report) return "";
    return buildScoreCardSvg({
      title: session.prompt.title,
      examLine: `${session.examType} • ${session.taskType.toUpperCase()} • ${session.difficulty}`,
      score: String(session.report.overall),
      scaleLabel: session.report.scaleLabel,
      categories: session.report.categories.map((item) => ({
        label: tr ? translateCategoryLabel(item.label) : item.label,
        score: String(item.score)
      })),
      nextExercise: session.report.nextExercise,
      delta,
      tr,
      learnerName,
      avatarInitials,
      avatarDataUrl,
      localeFlag,
      streakLabel,
      badgeLabel: scoreBadge
    });
  };

  const ensurePublicShareUrl = async () => {
    if (publicShareUrl) return publicShareUrl;
    const response = await fetch("/api/results/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: session.id,
        delta,
        learnerName,
        localeFlag,
        streakLabel,
        badgeLabel: scoreBadge
      })
    });
    const data = (await response.json()) as { shareUrl?: string; error?: string };
    if (!response.ok || !data.shareUrl) {
      throw new Error(data.error ?? "Could not create share URL.");
    }
    setPublicShareUrl(data.shareUrl);
    return data.shareUrl;
  };

  const downloadScoreImage = async () => {
    if (!session.report || typeof window === "undefined") return;
    try {
      const pngBlob = await svgToPngBlob(buildShareableCardSvg(), 1400, 1100);
      const url = URL.createObjectURL(pngBlob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `speakace-${session.examType.toLowerCase()}-result-${session.id}.png`;
      anchor.click();
      URL.revokeObjectURL(url);
      if (currentUser?.id) {
        void trackClientEvent({ userId: currentUser.id, event: "result_card_download", path: `/app/results/${session.id}` });
      }
      setShareMessage(tr ? "Premium sonuç kartı PNG olarak indirildi." : "Premium result card downloaded as PNG.");
    } catch {
      setShareMessage(tr ? "PNG indirilemedi." : "Could not download the PNG card.");
    }
  };

  const shareResult = async () => {
    if (!session.report || typeof window === "undefined") return;
    const shareUrl = await ensurePublicShareUrl();

    try {
      if (navigator.share) {
        await navigator.share({
          title: "SpeakAce Result",
          text: shareText,
          url: shareUrl
        });
        if (currentUser?.id) {
          void trackClientEvent({ userId: currentUser.id, event: "result_share_native", path: `/app/results/${session.id}` });
        }
        setShareMessage(tr ? "Sonuç başarıyla paylaşıldı." : "Result shared successfully.");
        return;
      }

      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      if (currentUser?.id) {
        void trackClientEvent({ userId: currentUser.id, event: "result_share_copy", path: `/app/results/${session.id}` });
      }
      setShareMessage(tr ? "Paylaşım metni panoya kopyalandı." : "Share text copied to clipboard.");
    } catch {
      setShareMessage(tr ? "Paylaşım şu anda tamamlanamadı." : "Could not complete sharing right now.");
    }
  };

  const openSocialShare = (platform: "x" | "whatsapp" | "linkedin") => {
    if (typeof window === "undefined") return;
    void (async () => {
      const shareUrl = await ensurePublicShareUrl();
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);

    const urls = {
      x: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
    };

    const events = {
      x: "result_share_x" as const,
      whatsapp: "result_share_whatsapp" as const,
      linkedin: "result_share_linkedin" as const
    };

    if (currentUser?.id) {
      void trackClientEvent({ userId: currentUser.id, event: events[platform], path: `/app/results/${session.id}` });
    }
    window.open(urls[platform], "_blank", "noopener,noreferrer,width=720,height=720");
    setShareMessage(
      platform === "x"
        ? tr ? "X paylaşımı açıldı." : "X share opened."
        : platform === "whatsapp"
          ? tr ? "WhatsApp paylaşımı açıldı." : "WhatsApp share opened."
          : tr ? "LinkedIn paylaşımı açıldı." : "LinkedIn share opened."
    );
    })().catch(() => {
      setShareMessage(tr ? "Public share link oluşturulamadı." : "Could not create a public share link.");
    });
  };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <div
        style={{
          position: "relative",
          padding: "1.5rem",
          borderRadius: 30,
          background: "radial-gradient(circle at top right, rgba(76,132,255,0.34), transparent 28%), radial-gradient(circle at bottom left, rgba(18,184,166,0.26), transparent 35%), linear-gradient(135deg, #06111f 0%, #0d1a33 52%, #102f43 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 32px 90px rgba(7, 17, 31, 0.28)",
          marginBottom: "1.6rem",
          overflow: "hidden"
        }}
      >
        <div style={{ position: "absolute", top: -40, right: -20, width: 220, height: 220, borderRadius: 999, background: "rgba(93, 112, 255, 0.18)", filter: "blur(36px)" }} />
        <div style={{ position: "absolute", bottom: -70, left: -30, width: 260, height: 260, borderRadius: 999, background: "rgba(16, 185, 129, 0.14)", filter: "blur(42px)" }} />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "grid",
            gap: "1.2rem",
            padding: "1.5rem",
            borderRadius: 24,
            background: "linear-gradient(180deg, rgba(8, 15, 28, 0.58), rgba(8, 15, 28, 0.32))",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(18px)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.55rem", padding: "0.4rem 0.8rem", borderRadius: 999, background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.82)", fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.8rem" }}>
                <span style={{ width: 11, height: 11, borderRadius: 999, background: "linear-gradient(135deg, #60a5fa, #34d399)", boxShadow: "0 0 18px rgba(96,165,250,0.7)" }} />
                SpeakAce Result Card
              </div>
              <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap", marginBottom: "0.9rem" }}>
                <div style={{ width: 42, height: 42, borderRadius: 999, overflow: "hidden", background: "linear-gradient(135deg, rgba(96,165,250,0.9), rgba(52,211,153,0.85))", color: "white", display: "grid", placeItems: "center", fontWeight: 900, fontSize: "0.95rem", boxShadow: "0 10px 24px rgba(96,165,250,0.22)" }}>
                  {avatarDataUrl ? (
                    <img src={avatarDataUrl} alt={learnerName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    avatarInitials
                  )}
                </div>
                <div style={{ display: "grid", gap: "0.1rem" }}>
                  <div style={{ color: "white", fontWeight: 700, fontSize: "0.95rem" }}>{learnerName}</div>
                  <div style={{ color: "rgba(255,255,255,0.66)", fontSize: "0.82rem" }}>{localeFlag} {streakLabel}</div>
                </div>
                <div style={{ padding: "0.38rem 0.75rem", borderRadius: 999, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.86)", fontWeight: 700, fontSize: "0.8rem" }}>
                  {scoreBadge}
                </div>
              </div>
              <h1 style={{ fontSize: "clamp(1.3rem, 2.8vw, 1.9rem)", margin: 0, fontWeight: 800, color: "white", maxWidth: 580 }}>{session.prompt.title}</h1>
              <p style={{ margin: "0.55rem 0 0", color: "rgba(255,255,255,0.68)", fontSize: "0.96rem" }}>{examMeta.leftEyebrow} • {session.examType} • {session.difficulty}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.08em" }}>speakace.org</div>
              <div style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.62)", marginTop: "0.45rem" }}>{tr ? "AI speaking score" : "AI speaking score"}</div>
            </div>
          </div>

          {session.report ? (
            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "1rem", alignItems: "stretch" }}>
              <div style={{ padding: "1.25rem", borderRadius: 24, background: "linear-gradient(180deg, rgba(255,255,255,0.09), rgba(255,255,255,0.04))", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ display: "flex", gap: "0.85rem", alignItems: "end", flexWrap: "wrap" }}>
                  <div style={{ fontSize: "clamp(4.3rem, 8vw, 6.4rem)", fontWeight: 900, lineHeight: 0.95, color: "white", textShadow: "0 12px 40px rgba(59,130,246,0.35)" }}>{session.report.overall}</div>
                  {delta !== null ? (
                    <div style={{ padding: "0.42rem 0.82rem", borderRadius: 999, background: delta >= 0 ? "rgba(16,185,129,0.16)" : "rgba(248,113,113,0.16)", color: delta >= 0 ? "#6ee7b7" : "#fca5a5", fontWeight: 800, fontSize: "0.92rem", marginBottom: "0.45rem" }}>
                      {delta >= 0 ? `+${delta}` : `${delta}`} {tr ? "son denemeye göre" : "vs last try"}
                    </div>
                  ) : null}
                </div>
                <div style={{ marginTop: "0.65rem", fontSize: "1rem", color: "rgba(255,255,255,0.78)", fontWeight: 600 }}>{session.report.scaleLabel}</div>
                <p style={{ margin: "1rem 0 0", lineHeight: 1.65, color: "rgba(255,255,255,0.66)", maxWidth: 520 }}>{session.report.nextExercise}</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "0.75rem" }}>
                {session.report.categories.map((cat) => (
                  <div key={cat.category} style={{ padding: "0.95rem", borderRadius: 18, background: "linear-gradient(180deg, rgba(255,255,255,0.11), rgba(255,255,255,0.05))", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <div style={{ fontSize: "0.8rem", minHeight: 36, color: "rgba(255,255,255,0.72)" }}>{tr ? translateCategoryLabel(cat.label) : cat.label}</div>
                    <div style={{ marginTop: "0.45rem", fontSize: "1.75rem", fontWeight: 900, color: "white" }}>{cat.score}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
              <button type="button" className="button button-secondary" onClick={() => void downloadScoreImage()}>
                {tr ? "PNG indir" : "Download PNG"}
              </button>
              <button type="button" className="button button-primary" onClick={() => void shareResult()}>
                {tr ? "Hızlı paylaş" : "Quick share"}
              </button>
            </div>
            <div style={{ display: "flex", gap: "0.55rem", flexWrap: "wrap" }}>
              <button type="button" className="button button-secondary" onClick={() => openSocialShare("x")}>Share to X</button>
              <button type="button" className="button button-secondary" onClick={() => openSocialShare("whatsapp")}>WhatsApp</button>
              <button type="button" className="button button-secondary" onClick={() => openSocialShare("linkedin")}>LinkedIn</button>
            </div>
          </div>
          {shareMessage ? <p style={{ margin: 0, color: "rgba(255,255,255,0.68)", fontSize: "0.88rem" }}>{shareMessage}</p> : null}
        </div>
      </div>

      {session.report ? (
        <div style={{ display: "grid", gap: "0.75rem", marginBottom: "2rem" }}>
          {session.report.categories.map((cat) => {
            const max = session.examType === "TOEFL" ? 4 : 9;
            const pct = Math.round((cat.score / max) * 100);
            return (
              <div key={cat.category} style={{ display: "grid", gap: "0.35rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.88rem", fontWeight: 600 }}>{tr ? translateCategoryLabel(cat.label) : cat.label}</span>
                  <span style={{ fontSize: "0.95rem", fontWeight: 800 }}>{cat.score}</span>
                </div>
                <div style={{ height: 8, borderRadius: 999, background: "var(--border)", overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", borderRadius: 999, background: "var(--primary)", transition: "width 0.6s ease" }} />
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      <div style={{ display: "flex", gap: 0, marginBottom: "1.5rem", borderBottom: "2px solid var(--border)" }}>
        {[
          { key: "feedback", label: tr ? "Geri Bildirim" : "Feedback" },
          { key: "transcript", label: tr ? "Transkript" : "Transcript" },
          { key: "compare", label: tr ? "Karşılaştır" : "Compare" },
          { key: "history", label: tr ? "Geçmiş" : "History" }
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as "feedback" | "transcript" | "compare" | "history")}
            style={{
              padding: "0.7rem 1.2rem",
              border: "none",
              borderBottom: activeTab === tab.key ? "2px solid var(--primary)" : "2px solid transparent",
              background: "transparent",
              color: activeTab === tab.key ? "var(--primary)" : "var(--muted-foreground)",
              fontWeight: activeTab === tab.key ? 700 : 500,
              fontSize: "0.9rem",
              cursor: "pointer",
              marginBottom: "-2px",
              transition: "all 0.15s"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "feedback" && session.report ? (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          <div style={{ padding: "1.2rem", borderRadius: 14, background: "oklch(0.71 0.18 165.41 / 0.07)", border: "1px solid oklch(0.71 0.18 165.41 / 0.2)" }}>
            <div style={{ fontWeight: 700, marginBottom: "0.8rem", color: "oklch(0.45 0.18 165)" }}>
              ✓ {examMeta.strengthsLabel}
            </div>
            <ul style={{ margin: 0, padding: "0 0 0 1.2rem", display: "grid", gap: "0.4rem" }}>
              {session.report.strengths.map((s, i) => <li key={i} style={{ lineHeight: 1.6, fontSize: "0.9rem" }}>{s}</li>)}
            </ul>
          </div>

          <div style={{ padding: "1.2rem", borderRadius: 14, background: "oklch(0.55 0.2 20 / 0.05)", border: "1px solid oklch(0.55 0.2 20 / 0.15)" }}>
            <div style={{ fontWeight: 700, marginBottom: "0.8rem", color: "oklch(0.45 0.18 20)" }}>
              ↗ {examMeta.improvementsLabel}
            </div>
            <ul style={{ margin: 0, padding: "0 0 0 1.2rem", display: "grid", gap: "0.4rem" }}>
              {session.report.improvements.map((s, i) => <li key={i} style={{ lineHeight: 1.6, fontSize: "0.9rem" }}>{s}</li>)}
            </ul>
          </div>

          <div style={{ padding: "1rem", borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }}>
            <div style={{ fontWeight: 700, marginBottom: "0.5rem", fontSize: "0.9rem" }}>🎯 {examMeta.nextExerciseLabel}</div>
            <p style={{ margin: 0, color: "var(--foreground)", lineHeight: 1.7, fontSize: "0.9rem" }}>{session.report.nextExercise}</p>
          </div>

          {session.report.fillerWords.length > 0 ? (
            <div style={{ padding: "1rem", borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }}>
              <div style={{ fontWeight: 700, marginBottom: "0.5rem", fontSize: "0.9rem" }}>{examMeta.fillerWordsLabel}</div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {session.report.fillerWords.map((w) => (
                  <span key={w} style={{ padding: "0.25rem 0.75rem", borderRadius: 999, background: "var(--secondary)", border: "1px solid var(--border)", fontSize: "0.85rem", fontWeight: 600 }}>{w}</span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : activeTab === "feedback" ? (
        <p style={{ color: "var(--muted-foreground)" }}>{tr ? "Henüz AI raporu yok." : "No AI report yet."}</p>
      ) : null}

      {activeTab === "transcript" ? (
        <div style={{ display: "grid", gap: "1.2rem" }}>
          {audioSource ? (
            <div style={{ padding: "1rem", borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }}>
              <div style={{ fontWeight: 600, marginBottom: "0.7rem", fontSize: "0.9rem" }}>{tr ? "🎧 Kaydını dinle" : "🎧 Listen to your recording"}</div>
              <audio
                ref={audioRef}
                controls
                preload="metadata"
                src={audioSource}
                style={{ width: "100%", borderRadius: 8 }}
                onLoadedMetadata={(e) => setAudioDuration(e.currentTarget.duration || 0)}
                onTimeUpdate={handleAudioTimeUpdate}
              />
            </div>
          ) : null}

          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", padding: "0.8rem 1rem", borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }}>
            <span style={{ fontWeight: 600, fontSize: "0.88rem" }}>{examMeta.qualityLabel}</span>
            <span className={`quality-pill quality-${qualityTone}`}>{qualityScore}/100 · {translateQualityLabel(qualityLabel, tr)}</span>
          </div>

          <div style={{ padding: "1.1rem", borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }}>
            <div style={{ fontWeight: 700, marginBottom: "0.75rem", fontSize: "0.9rem" }}>{examMeta.rawTranscriptLabel}</div>
            <p style={{ margin: 0, lineHeight: 1.8, fontSize: "0.92rem" }}>{displayedRawTranscript ?? examMeta.noTranscriptText}</p>
          </div>

          {session.report?.improvedAnswer ? (
            <div style={{ padding: "1.1rem", borderRadius: 12, border: "1px solid oklch(0.71 0.18 165.41 / 0.3)", background: "oklch(0.71 0.18 165.41 / 0.05)" }}>
              <div style={{ fontWeight: 700, marginBottom: "0.75rem", fontSize: "0.9rem", color: "oklch(0.45 0.18 165)" }}>{examMeta.improvedAnswerLabel}</div>
              <p style={{ margin: 0, lineHeight: 1.8, fontSize: "0.92rem" }}>{session.report.improvedAnswer}</p>
            </div>
          ) : null}
        </div>
      ) : null}

      {activeTab === "compare" && session.report?.improvedAnswer ? (
        <div style={{ display: "grid", gap: "1rem" }}>
          <p style={{ color: "var(--muted-foreground)", fontSize: "0.88rem", margin: 0 }}>
            {tr ? "Her cümlenin güçlendirilmiş versiyonuyla karşılaştır." : "Compare each sentence with its stronger version."}
          </p>
          {sentencePairs.map((pair, index) => (
            <div key={index} style={{ borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                <div style={{ padding: "1rem", borderRight: "1px solid var(--border)", background: "var(--card)" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--muted-foreground)", marginBottom: "0.5rem", textTransform: "uppercase" }}>{tr ? "Senin cümlen" : "Your line"}</div>
                  <p style={{ margin: 0, lineHeight: 1.65, fontSize: "0.88rem" }}>{pair.mine || "—"}</p>
                </div>
                <div style={{ padding: "1rem", background: "oklch(0.71 0.18 165.41 / 0.05)" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "oklch(0.45 0.18 165)", marginBottom: "0.5rem", textTransform: "uppercase" }}>{tr ? "Güçlü versiyon" : "Stronger version"}</div>
                  <p style={{ margin: 0, lineHeight: 1.65, fontSize: "0.88rem" }}>{pair.stronger || "—"}</p>
                </div>
              </div>
              <div style={{ padding: "0.75rem 1rem", background: "var(--secondary)", borderTop: "1px solid var(--border)", fontSize: "0.82rem", color: "var(--muted-foreground)", lineHeight: 1.6 }}>
                {buildSentenceUpgradeReason(pair.mine, pair.stronger, tr)}
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === "compare" ? (
        <p style={{ color: "var(--muted-foreground)" }}>{tr ? "Karşılaştırma için gelişmiş cevap gerekli." : "No improved answer available to compare."}</p>
      ) : null}

      {activeTab === "history" ? (
        <div style={{ display: "grid", gap: "1rem" }}>
          <div style={{ padding: "1.1rem", borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }}>
            <div style={{ fontWeight: 700, marginBottom: "1rem", fontSize: "0.9rem" }}>{examMeta.trendPanelLabel}</div>
            <div style={{ display: "grid", gap: "0.65rem" }}>
              {summary.recentSessions.slice(0, 5).map((item) => {
                const max = session.examType === "TOEFL" ? 4 : 9;
                const pct = Math.round(((item.report?.overall ?? 0) / max) * 100);
                return (
                  <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "0.8rem", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.prompt.title}</div>
                      <div style={{ height: 6, borderRadius: 999, background: "var(--border)", marginTop: "0.3rem", overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: "var(--primary)", borderRadius: 999 }} />
                      </div>
                    </div>
                    <strong style={{ fontSize: "1rem" }}>{item.report?.overall ?? "-"}</strong>
                  </div>
                );
              })}
            </div>
          </div>

          {samePromptHistory.length ? (
            <div style={{ padding: "1.1rem", borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }}>
              <div style={{ fontWeight: 700, marginBottom: "0.8rem", fontSize: "0.9rem" }}>{tr ? "Bu soruda önceki denemeler" : "Previous attempts on this topic"}</div>
              <div style={{ display: "grid", gap: "0.75rem" }}>
                {samePromptHistory.map((item) => (
                  <div key={item.id} style={{ padding: "0.9rem", borderRadius: 10, background: "var(--secondary)", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{new Date(item.createdAt).toLocaleDateString(tr ? "tr-TR" : "en-US")}</span>
                      <span className="pill">{item.report?.overall ?? "-"}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted-foreground)", lineHeight: 1.6 }}>
                      {(item.rawTranscript ?? item.transcript ?? "").slice(0, 120)}{(item.rawTranscript ?? item.transcript ?? "").length > 120 ? "..." : ""}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border)" }}>
        <Link href={retryHref} className="button button-primary" style={{ flex: 1, textAlign: "center" }}>
          {examMeta.retryLabel}
        </Link>
        <Link href="/app/practice" className="button button-secondary" style={{ flex: 1, textAlign: "center" }}>
          {examMeta.newPracticeLabel}
        </Link>
        <button type="button" className="button button-secondary" onClick={saveToStudyList} disabled={savedStudyList} style={{ flex: 1 }}>
          {savedStudyList ? (tr ? "✓ Kaydedildi" : "✓ Saved") : (tr ? "Kaydet" : "Save")}
        </button>
        {canExportReport ? (
          <button type="button" className="button button-secondary" onClick={exportPdfReport} style={{ flex: 1 }}>
            {tr ? "PDF raporu indir" : "Download PDF report"}
          </button>
        ) : null}
      </div>
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

function buildScoreCardSvg(input: {
  title: string;
  examLine: string;
  score: string;
  scaleLabel: string;
  categories: Array<{ label: string; score: string }>;
  nextExercise: string;
  delta: number | null;
  tr: boolean;
  learnerName?: string;
  avatarInitials?: string;
  avatarDataUrl?: string;
  localeFlag?: string;
  streakLabel?: string;
  badgeLabel?: string;
}) {
  const rows = input.categories
    .slice(0, 4)
    .map(
      (item, index) => `
        <g transform="translate(${64 + index * 220}, 654)">
          <rect x="0" y="0" width="196" height="136" rx="26" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.14)" />
          <text x="98" y="50" text-anchor="middle" fill="rgba(255,255,255,0.78)" font-size="22" font-family="Arial, sans-serif">${escapeXml(truncateForCard(item.label, 18))}</text>
          <text x="98" y="98" text-anchor="middle" fill="#ffffff" font-size="48" font-weight="800" font-family="Arial, sans-serif">${escapeXml(item.score)}</text>
        </g>
      `
    )
    .join("");

  const deltaBadge = input.delta !== null
    ? `<g transform="translate(640, 258)"><rect x="0" y="0" width="200" height="56" rx="28" fill="${input.delta >= 0 ? "rgba(16,185,129,0.16)" : "rgba(248,113,113,0.16)"}" /><text x="100" y="36" text-anchor="middle" fill="${input.delta >= 0 ? "#86efac" : "#fca5a5"}" font-size="24" font-weight="800" font-family="Arial, sans-serif">${escapeXml(input.delta >= 0 ? `+${input.delta}` : `${input.delta}`)} ${escapeXml(input.tr ? "son denemeye göre" : "vs last try")}</text></g>`
    : "";
  const avatarMarkup = input.avatarDataUrl
    ? `
        <clipPath id="avatarClip">
          <circle cx="30" cy="30" r="30" />
        </clipPath>
      `
    : "";
  const avatarContent = input.avatarDataUrl
    ? `
        <circle cx="30" cy="30" r="30" fill="rgba(255,255,255,0.18)" />
        <image href="${escapeXml(input.avatarDataUrl)}" x="0" y="0" width="60" height="60" preserveAspectRatio="xMidYMid slice" clip-path="url(#avatarClip)" />
      `
    : `
        <circle cx="30" cy="30" r="30" fill="rgba(255,255,255,0.14)" />
        <text x="30" y="39" text-anchor="middle" fill="#ffffff" font-size="28" font-weight="800" font-family="Arial, sans-serif">${escapeXml(input.avatarInitials ?? "SA")}</text>
      `;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1400" height="1100" viewBox="0 0 1400 1100" fill="none">
      <defs>
        <linearGradient id="bg" x1="72" y1="72" x2="1320" y2="1010" gradientUnits="userSpaceOnUse">
          <stop stop-color="#071325"/>
          <stop offset="0.55" stop-color="#153563"/>
          <stop offset="1" stop-color="#0b7b71"/>
        </linearGradient>
        <radialGradient id="glowA" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1180 150) rotate(90) scale(300 300)">
          <stop stop-color="#6EA8FF" stop-opacity="0.55"/>
          <stop offset="1" stop-color="#6EA8FF" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="glowB" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(180 960) rotate(90) scale(340 340)">
          <stop stop-color="#34D399" stop-opacity="0.45"/>
          <stop offset="1" stop-color="#34D399" stop-opacity="0"/>
        </radialGradient>
        ${avatarMarkup}
      </defs>
      <rect width="1400" height="1100" rx="44" fill="#04101d"/>
      <rect x="32" y="32" width="1336" height="1036" rx="42" fill="url(#bg)"/>
      <circle cx="1180" cy="150" r="300" fill="url(#glowA)"/>
      <circle cx="180" cy="960" r="340" fill="url(#glowB)"/>
      <rect x="60" y="60" width="1280" height="980" rx="36" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)"/>
      <rect x="86" y="86" width="1228" height="928" rx="34" fill="rgba(4,11,22,0.24)" stroke="rgba(255,255,255,0.08)"/>

      <g transform="translate(122, 132)">
        <rect x="0" y="0" width="286" height="58" rx="29" fill="rgba(255,255,255,0.09)" />
        <circle cx="34" cy="29" r="11" fill="url(#glowA)" />
        <text x="60" y="38" fill="rgba(255,255,255,0.82)" font-size="24" font-weight="700" font-family="Arial, sans-serif">SpeakAce Result Card</text>
      </g>
      <g transform="translate(122, 216)">
        ${avatarContent}
        <text x="76" y="26" fill="#ffffff" font-size="24" font-weight="700" font-family="Arial, sans-serif">${escapeXml(truncateForCard(input.learnerName ?? "SpeakAce learner", 26))}</text>
        <text x="76" y="56" fill="rgba(255,255,255,0.72)" font-size="18" font-family="Arial, sans-serif">${escapeXml(`${input.localeFlag ?? "🌍"} ${input.streakLabel ?? ""}`)}</text>
      </g>
      <g transform="translate(990, 244)">
        <rect x="0" y="0" width="214" height="48" rx="24" fill="rgba(255,255,255,0.1)" />
        <text x="107" y="31" text-anchor="middle" fill="#ffffff" font-size="20" font-weight="800" font-family="Arial, sans-serif">${escapeXml(input.badgeLabel ?? "Momentum builder")}</text>
      </g>
      <text x="122" y="252" fill="#ffffff" font-size="58" font-weight="800" font-family="Arial, sans-serif">${escapeXml(truncateForCard(input.title, 36))}</text>
      <text x="122" y="334" fill="rgba(255,255,255,0.72)" font-size="28" font-family="Arial, sans-serif">${escapeXml(input.examLine)}</text>
      <text x="1120" y="168" text-anchor="end" fill="rgba(255,255,255,0.88)" font-size="30" font-weight="800" font-family="Arial, sans-serif">speakace.org</text>
      <text x="1120" y="206" text-anchor="end" fill="rgba(255,255,255,0.62)" font-size="22" font-family="Arial, sans-serif">${escapeXml(input.tr ? "AI speaking score" : "AI speaking score")}</text>

      <text x="122" y="556" fill="#ffffff" font-size="214" font-weight="900" font-family="Arial, sans-serif">${escapeXml(input.score)}</text>
      <text x="128" y="612" fill="rgba(255,255,255,0.88)" font-size="44" font-weight="700" font-family="Arial, sans-serif">${escapeXml(input.scaleLabel)}</text>
      ${deltaBadge}
      <foreignObject x="126" y="644" width="1110" height="90">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; color: rgba(255,255,255,0.72); font-size: 26px; line-height: 1.45;">${escapeHtml(input.nextExercise)}</div>
      </foreignObject>

      ${rows}

      <g transform="translate(1088, 886)">
        <rect x="0" y="0" width="164" height="78" rx="26" fill="rgba(255,255,255,0.09)" stroke="rgba(255,255,255,0.14)" />
        <text x="82" y="30" text-anchor="middle" fill="rgba(255,255,255,0.72)" font-size="18" font-family="Arial, sans-serif">${escapeXml(input.tr ? "Powered by" : "Powered by")}</text>
        <text x="82" y="58" text-anchor="middle" fill="#ffffff" font-size="28" font-weight="800" font-family="Arial, sans-serif">SpeakAce</text>
      </g>
    </svg>
  `.trim();
}

async function svgToPngBlob(svg: string, width: number, height: number) {
  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const svgUrl = URL.createObjectURL(svgBlob);

  try {
    const image = await loadImage(svgUrl);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas context unavailable.");
    }
    context.fillStyle = "#04101d";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("PNG conversion failed."));
          return;
        }
        resolve(blob);
      }, "image/png");
    });
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function truncateForCard(value: string, max: number) {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function getAvatarInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "SA";
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}

function getLocaleFlag(language: string) {
  const flags: Record<string, string> = {
    tr: "🇹🇷",
    en: "🇬🇧",
    de: "🇩🇪",
    es: "🇪🇸",
    fr: "🇫🇷",
    it: "🇮🇹",
    pt: "🇵🇹",
    nl: "🇳🇱",
    pl: "🇵🇱",
    ru: "🇷🇺",
    ar: "🇸🇦",
    ja: "🇯🇵",
    ko: "🇰🇷"
  };
  return flags[language] ?? "🌍";
}

function getScoreBadge(input: { score: number; examType: string; tr: boolean }) {
  if (input.examType === "TOEFL") {
    if (input.score >= 3.5) return input.tr ? "Yüksek performans" : "High performer";
    if (input.score >= 3) return input.tr ? "Güçlü yükseliş" : "Strong climb";
    return input.tr ? "İvme yakalıyor" : "Building momentum";
  }

  if (input.score >= 7.5) return input.tr ? "Share-worthy band" : "Share-worthy band";
  if (input.score >= 7) return input.tr ? "Band 7 yolunda" : "Band 7 path";
  if (input.score >= 6) return input.tr ? "Skor yükseliyor" : "Score climbing";
  return input.tr ? "İvme yakalıyor" : "Building momentum";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
