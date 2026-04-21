"use client";

import Link from "next/link";
import { Download, Link2, Linkedin, MessageCircle, Share2 } from "lucide-react";
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
  const [shareOpen, setShareOpen] = useState(false);
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
      {/* ── SHARE CARD ─────────────────────────────────────────────────────── */}
      <div className="rsc-card">

        {/* Top bar */}
        <div className="rsc-topbar">
          <span className="rsc-brand">SpeakAce</span>
          <span className="rsc-exam-tag">{session.examType}</span>
        </div>

        {/* User */}
        <div className="rsc-user-row">
          <div className="rsc-avatar">
            {avatarDataUrl ? (
              <img src={avatarDataUrl} alt={learnerName} />
            ) : (
              <span>{avatarInitials}</span>
            )}
          </div>
          <div className="rsc-user-info">
            <strong>{learnerName}</strong>
            <span>{localeFlag} {streakLabel}</span>
          </div>
        </div>

        {session.report ? (
          <>
            {/* Score + meta */}
            <div className="rsc-score-row">
              <div
                className="rsc-score-ring"
                style={{
                  background: `conic-gradient(#22d3ee 0% ${Math.round((session.report.overall / (session.examType === "TOEFL" ? 4 : 9)) * 100)}%, rgba(255,255,255,0.08) 0%)`
                }}
              >
                <div className="rsc-score-inner">
                  <strong>{session.report.overall}</strong>
                  <span>{tr ? "GENEL SKOR" : "OVERALL"}</span>
                </div>
              </div>
              <div className="rsc-score-meta">
                <span className="rsc-scale-label">≈ {session.report.scaleLabel}</span>
                <span className="rsc-badge-label">{scoreBadge}</span>
                {delta !== null ? (
                  <span className={`rsc-delta ${delta >= 0 ? "rsc-delta-pos" : "rsc-delta-neg"}`}>
                    {delta >= 0 ? `+${delta}` : `${delta}`} {tr ? "son denemeden" : "vs last try"}
                  </span>
                ) : null}
              </div>
            </div>

            {/* Category bars */}
            <div className="rsc-categories">
              {session.report.categories.map((cat, index) => {
                const max = session.examType === "TOEFL" ? 4 : 9;
                const pct = Math.max(6, Math.min(100, (cat.score / max) * 100));
                return (
                  <div key={cat.category} className="rsc-cat-row">
                    <span>{tr ? translateCategoryLabel(cat.label) : cat.label}</span>
                    <div className="rsc-cat-track">
                      <div className="rsc-cat-fill" style={{ width: `${pct}%` }} data-idx={String(index)} />
                    </div>
                    <strong>{cat.score}</strong>
                  </div>
                );
              })}
            </div>
          </>
        ) : null}

        {/* Prompt + exam info */}
        <div className="rsc-prompt-row">
          <p>{session.prompt.title}</p>
          <span>{examMeta.leftEyebrow} · {session.difficulty}</span>
        </div>

        {/* Footer */}
        <div className="rsc-footer">
          <span className="rsc-footer-tag">
            {tr ? "SpeakAce AI ile speaking pratiği" : "Practice IELTS / TOEFL speaking with AI"}
          </span>
          <span className="rsc-domain">speakace.ai</span>
        </div>
      </div>

      {/* ── ACTIONS ────────────────────────────────────────────────────────── */}
      <div className="rsc-actions">
        <Link className="button button-secondary" href={retryHref}>
          {tr ? "Tekrar dene" : "Retry"}
        </Link>
        {session.report ? (
          <button type="button" className="button button-primary" onClick={() => setShareOpen(true)}>
            <Share2 size={15} />
            {tr ? "Paylaş" : "Share result"}
          </button>
        ) : null}
      </div>

      {/* ── SHARE MODAL ────────────────────────────────────────────────────── */}
      {shareOpen ? (
        <div className="share-overlay" onClick={() => setShareOpen(false)}>
          <div className="share-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="share-sheet-handle" />
            <strong className="share-sheet-title">
              {tr ? "Sonucunu paylaş" : "Share your result"}
            </strong>
            <p className="share-sheet-body">
              {tr
                ? "Sonuç kartını PNG olarak indir veya sosyal medyada paylaş."
                : "Download your result card as PNG or share it on social media."}
            </p>
            <div className="share-options">
              <button
                type="button"
                className="share-option"
                onClick={() => { void downloadScoreImage(); setShareOpen(false); }}
              >
                <Download size={22} />
                <span>{tr ? "PNG indir" : "Download"}</span>
              </button>
              <button type="button" className="share-option" onClick={() => openSocialShare("x")}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
                </svg>
                <span>X / Twitter</span>
              </button>
              <button type="button" className="share-option" onClick={() => openSocialShare("whatsapp")}>
                <MessageCircle size={22} />
                <span>WhatsApp</span>
              </button>
              <button type="button" className="share-option" onClick={() => openSocialShare("linkedin")}>
                <Linkedin size={22} />
                <span>LinkedIn</span>
              </button>
              <button type="button" className="share-option" onClick={() => void shareResult()}>
                <Link2 size={22} />
                <span>{tr ? "Link kopyala" : "Copy link"}</span>
              </button>
            </div>
            {shareMessage ? <p className="share-status-msg">{shareMessage}</p> : null}
            <button
              type="button"
              className="button button-secondary share-sheet-close"
              onClick={() => setShareOpen(false)}
            >
              {tr ? "Kapat" : "Close"}
            </button>
          </div>
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

function getCategoryTone(index: number) {
  return [
    { fill: "#22d3ee", glow: "0 0 18px rgba(34,211,238,0.35)" },
    { fill: "#f472b6", glow: "0 0 18px rgba(244,114,182,0.35)" },
    { fill: "#818cf8", glow: "0 0 18px rgba(129,140,248,0.35)" },
    { fill: "#fbbf24", glow: "0 0 18px rgba(251,191,36,0.35)" }
  ][index % 4];
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
  const statMeta = [
    { fill: "#22d3ee", glow: "#22d3ee", icon: "◆" },
    { fill: "#f472b6", glow: "#f472b6", icon: "◈" },
    { fill: "#818cf8", glow: "#818cf8", icon: "▣" },
    { fill: "#fbbf24", glow: "#fbbf24", icon: "◉" }
  ];

  const rows = input.categories
    .slice(0, 4)
    .map((item, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      const x = 98 + col * 612;
      const y = 664 + row * 150;
      const meta = statMeta[index] ?? statMeta[0];
      const numericScore = Number(item.score);
      const fillWidth = Math.max(16, Math.min(100, (numericScore / 9) * 100));

      return `
        <g transform="translate(${x}, ${y})">
          <rect x="0" y="0" width="500" height="118" rx="26" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" />
          <text x="30" y="36" fill="rgba(255,255,255,0.72)" font-size="18" font-family="Arial, sans-serif">${escapeXml(meta.icon)}</text>
          <text x="58" y="36" fill="rgba(255,255,255,0.72)" font-size="24" font-family="Arial, sans-serif">${escapeXml(truncateForCard(item.label, 22))}</text>
          <text x="446" y="36" text-anchor="end" fill="#ffffff" font-size="28" font-weight="800" font-family="Arial, sans-serif">${escapeXml(item.score)}</text>
          <rect x="30" y="72" width="440" height="10" rx="5" fill="rgba(255,255,255,0.10)" />
          <rect x="30" y="72" width="${(440 * fillWidth) / 100}" height="10" rx="5" fill="${meta.fill}" />
        </g>
      `;
    })
    .join("");

  const deltaBadge = input.delta !== null
    ? `<g transform="translate(926, 190)"><rect x="0" y="0" width="214" height="54" rx="27" fill="${input.delta >= 0 ? "rgba(16,185,129,0.18)" : "rgba(248,113,113,0.18)"}" stroke="${input.delta >= 0 ? "rgba(16,185,129,0.22)" : "rgba(248,113,113,0.22)"}" /><text x="107" y="35" text-anchor="middle" fill="${input.delta >= 0 ? "#34d399" : "#fca5a5"}" font-size="22" font-weight="800" font-family="Arial, sans-serif">${escapeXml(input.delta >= 0 ? `+${input.delta}` : `${input.delta}`)} ${escapeXml(input.tr ? "trend" : "trend")}</text></g>`
    : "";
  const avatarMarkup = input.avatarDataUrl
    ? `
        <clipPath id="avatarClip">
          <circle cx="44" cy="44" r="44" />
        </clipPath>
      `
    : "";
  const avatarContent = input.avatarDataUrl
    ? `
        <circle cx="44" cy="44" r="44" fill="rgba(255,255,255,0.18)" />
        <image href="${escapeXml(input.avatarDataUrl)}" x="0" y="0" width="88" height="88" preserveAspectRatio="xMidYMid slice" clip-path="url(#avatarClip)" />
      `
    : `
        <circle cx="44" cy="44" r="44" fill="rgba(255,255,255,0.14)" />
        <text x="44" y="58" text-anchor="middle" fill="#ffffff" font-size="34" font-weight="800" font-family="Arial, sans-serif">${escapeXml(input.avatarInitials ?? "SA")}</text>
      `;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1400" height="1100" viewBox="0 0 1400 1100" fill="none">
      <defs>
        <linearGradient id="cardShell" x1="0" y1="0" x2="1400" y2="1100" gradientUnits="userSpaceOnUse">
          <stop stop-color="#151e32"/>
          <stop offset="1" stop-color="#131c2d"/>
        </linearGradient>
        <linearGradient id="brandGradient" x1="0" y1="0" x2="1" y2="1">
          <stop stop-color="#6366f1"/>
          <stop offset="1" stop-color="#a855f7"/>
        </linearGradient>
        <radialGradient id="glowA" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1180 150) rotate(90) scale(300 300)">
          <stop stop-color="#6366f1" stop-opacity="0.45"/>
          <stop offset="1" stop-color="#6366f1" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="glowB" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(180 960) rotate(90) scale(340 340)">
          <stop stop-color="#a855f7" stop-opacity="0.35"/>
          <stop offset="1" stop-color="#a855f7" stop-opacity="0"/>
        </radialGradient>
        ${avatarMarkup}
      </defs>
      <rect width="1400" height="1100" rx="44" fill="#0f172a"/>
      <rect x="32" y="32" width="1336" height="1036" rx="42" fill="url(#cardShell)"/>
      <circle cx="1180" cy="150" r="300" fill="url(#glowA)"/>
      <circle cx="180" cy="960" r="340" fill="url(#glowB)"/>
      <rect x="60" y="60" width="1280" height="980" rx="36" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)"/>

      <g transform="translate(112, 112)">
        <text x="0" y="36" fill="url(#brandGradient)" font-size="34" font-weight="800" font-family="Arial, sans-serif">SpeakAce</text>
        <g transform="translate(984, 0)">
          <rect x="0" y="0" width="168" height="42" rx="21" fill="rgba(255,255,255,0.08)" stroke="rgba(34,211,238,0.18)" />
          <text x="84" y="28" text-anchor="middle" fill="#22d3ee" font-size="18" font-weight="700" font-family="Arial, sans-serif">AI CERTIFIED</text>
        </g>
      </g>

      <g transform="translate(110, 164)">
        ${avatarContent}
        <text x="106" y="38" fill="#ffffff" font-size="28" font-weight="700" font-family="Arial, sans-serif">${escapeXml(truncateForCard(input.learnerName ?? "SpeakAce learner", 26))}</text>
        <text x="106" y="72" fill="rgba(148,163,184,1)" font-size="20" font-family="Arial, sans-serif">${escapeXml(`${input.localeFlag ?? "🌍"} ${input.streakLabel ?? ""}`)}</text>
      </g>
      <g transform="translate(1040, 176)">
        <rect x="0" y="0" width="196" height="46" rx="23" fill="rgba(16,185,129,0.15)" stroke="rgba(16,185,129,0.2)" />
        <text x="98" y="30" text-anchor="middle" fill="#34d399" font-size="20" font-weight="700" font-family="Arial, sans-serif">${escapeXml(input.badgeLabel ?? "Momentum builder")}</text>
      </g>
      <text x="700" y="304" text-anchor="middle" fill="#ffffff" font-size="56" font-weight="800" font-family="Arial, sans-serif">${escapeXml(truncateForCard(input.title, 34))}</text>

      <g transform="translate(532, 350)">
        <circle cx="168" cy="168" r="168" fill="rgba(255,255,255,0.08)" />
        <circle cx="168" cy="168" r="138" fill="#151e32" />
        <path d="M168 30 A138 138 0 1 1 30 168" stroke="#22d3ee" stroke-width="24" fill="none" stroke-linecap="round" />
        <text x="168" y="162" text-anchor="middle" fill="#ffffff" font-size="110" font-weight="900" font-family="Arial, sans-serif">${escapeXml(input.score)}</text>
        <text x="168" y="205" text-anchor="middle" fill="rgba(148,163,184,1)" font-size="24" font-weight="600" font-family="Arial, sans-serif">${escapeXml(input.tr ? "GENEL SKOR" : "OVERALL SCORE")}</text>
      </g>

      <g transform="translate(532, 714)">
        <rect x="0" y="0" width="336" height="52" rx="26" fill="rgba(16,185,129,0.15)" stroke="rgba(16,185,129,0.2)" />
        <text x="168" y="33" text-anchor="middle" fill="#34d399" font-size="24" font-weight="700" font-family="Arial, sans-serif">≈ ${escapeXml(input.scaleLabel)}</text>
      </g>
      ${deltaBadge}
      <text x="700" y="806" text-anchor="middle" fill="rgba(148,163,184,1)" font-size="24" font-family="Arial, sans-serif">${escapeXml(truncateForCard(input.examLine, 44))}</text>

      ${rows}

      <g transform="translate(112, 968)">
        <text x="0" y="0" fill="rgba(148,163,184,1)" font-size="20" font-family="Arial, sans-serif">${escapeXml(input.tr ? "SpeakAce AI tarafından analiz edildi." : "Analyzed by SpeakAce AI.")}</text>
        <rect x="870" y="-36" width="266" height="64" rx="18" fill="url(#brandGradient)" />
        <text x="1003" y="5" text-anchor="middle" fill="#ffffff" font-size="26" font-weight="700" font-family="Arial, sans-serif">${escapeXml(input.tr ? "Kendi Skorunu Öğren" : "Get Your Score")}</text>
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
