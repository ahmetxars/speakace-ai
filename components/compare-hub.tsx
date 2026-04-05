"use client";

import Link from "next/link";
import { Fragment } from "react";
import { useAppState } from "@/components/providers";

type CompareRow = {
  label: { en: string; tr: string };
  other: { en: string; tr: string };
  speakace: { en: string; tr: string };
};

const compareRows: CompareRow[] = [
  {
    label: { en: "Practice style", tr: "Çalışma tarzı" },
    other: { en: "Often broad and generic", tr: "Genelde daha geniş ve genel" },
    speakace: { en: "Built around IELTS and TOEFL speaking flow", tr: "IELTS ve TOEFL speaking akışına göre tasarlandı" }
  },
  {
    label: { en: "Feedback loop", tr: "Geri bildirim döngüsü" },
    other: { en: "One answer, one response", tr: "Bir cevap, bir geri dönüş" },
    speakace: { en: "Record, review, retry, and improve again", tr: "Kaydet, incele, tekrar dene, yeniden geliştir" }
  },
  {
    label: { en: "Transcript review", tr: "Transcript inceleme" },
    other: { en: "Sometimes secondary", tr: "Bazen ikincil planda" },
    speakace: { en: "Core part of the learning flow", tr: "Öğrenme akışının merkezinde" }
  },
  {
    label: { en: "Exam focus", tr: "Sınav odağı" },
    other: { en: "May focus on general speaking", tr: "Genel speaking pratiğine odaklanabilir" },
    speakace: { en: "Focused on exam performance and score movement", tr: "Sınav performansı ve skor gelişimine odaklı" }
  },
  {
    label: { en: "Teacher and school use", tr: "Öğretmen ve okul kullanımı" },
    other: { en: "Not always built for class workflows", tr: "Her zaman sınıf akışına uygun değil" },
    speakace: { en: "Includes teacher, school, and study workflow support", tr: "Öğretmen, okul ve çalışma akışı desteği içerir" }
  },
  {
    label: { en: "Daily return habit", tr: "Günlük geri dönüş alışkanlığı" },
    other: { en: "Can feel one-off", tr: "Tek seferlik kalabilir" },
    speakace: { en: "Prompts, tools, reviews, and repeat practice create a habit loop", tr: "Promptlar, araçlar, yorumlar ve tekrar pratiği alışkanlık döngüsü kurar" }
  }
];

const namedComparisons = [
  {
    id: "smalltalk2me",
    title: "SpeakAce vs SmallTalk2Me",
    intro:
      "SmallTalk2Me is often positioned as a general speaking and confidence tool, while SpeakAce is intentionally built around IELTS and TOEFL speaking improvement. That means the value is not only recording or talking more; it is seeing score direction, reviewing transcripts, retrying the same topic, and building a cleaner exam-focused habit. For learners who care about score movement rather than generic speaking confidence alone, that difference matters because the workflow stays tied to prompts, review loops, and test performance instead of broad conversation practice.",
    summary:
      "If your goal is exam improvement, SpeakAce gives a more structured score-improvement loop. If your goal is broad speaking comfort, a general speaking tool may feel enough at first."
  },
  {
    id: "speechful",
    title: "SpeakAce vs Speechful",
    intro:
      "Speechful can be useful for pronunciation and speaking confidence, but exam preparation usually needs more than isolated speaking feedback. SpeakAce is stronger when the learner needs IELTS or TOEFL-style prompt practice, a transcript-centered review flow, and a clearer path from weak answer to stronger retry. The important difference is not just what the AI says after you speak, but whether the full workflow helps you move toward a better speaking score over repeated attempts.",
    summary:
      "Speechful may fit learners focused on speaking confidence alone. SpeakAce is better aligned with band score improvement, answer structure, and repeatable exam prep."
  },
  {
    id: "ielts-org",
    title: "SpeakAce vs IELTS.org Mock Tests",
    intro:
      "Official IELTS materials are useful because they show the tone and format of the real test, but they do not always create a strong daily practice loop. A learner may open a mock test, finish it once, and still not know how to improve the next answer. SpeakAce fills that gap by making the practice process more active: answer, transcript, score estimate, feedback, retry, and visible progress. The goal is not to replace official material, but to make practice between official mock sessions more consistent and more measurable.",
    summary:
      "Official mock tests are valuable for realism. SpeakAce is stronger for everyday speaking practice and faster feedback between mock attempts."
  },
  {
    id: "private-tutoring",
    title: "SpeakAce vs Private Tutoring",
    intro:
      "Private tutoring can be powerful because a good teacher gives tailored advice and accountability, but it is usually expensive and limited by lesson frequency. SpeakAce is not the same as live tutoring, yet it can support the same learner between lessons by keeping speaking attempts active every day. For students who cannot afford frequent private speaking sessions, or for teachers who want their students to keep practicing outside class, SpeakAce creates a lower-cost improvement layer that keeps momentum visible.",
    summary:
      "Private tutoring gives human guidance. SpeakAce gives cheaper, repeatable daily speaking practice with clearer feedback loops between lessons."
  }
];

export function CompareHub() {
  const { language } = useAppState();
  const tr = language === "tr";

  return (
    <main className="page-shell section compare-hub-shell">
      <div className="section-head">
        <span className="eyebrow">{tr ? "Karşılaştır" : "Compare"}</span>
        <h1 style={{ fontSize: "clamp(2.8rem, 6vw, 4.8rem)", lineHeight: 0.96 }}>
          {tr
            ? "SpeakAce ile diğer speaking araçları arasındaki fark"
            : "See how SpeakAce differs from other speaking tools"}
        </h1>
        <p>
          {tr
            ? "Bu sayfa kart kart ürün toplamak için değil; SpeakAce'in neden daha sınav odaklı, daha düzenli ve daha kullanışlı olduğunu net görmek için hazırlandı."
            : "This page is built to show the practical difference between a generic speaking app and a cleaner exam-focused workflow like SpeakAce."}
        </p>
      </div>

      <section className="card compare-overview-card">
        <div className="compare-overview-grid">
          <div className="compare-overview-block">
            <span className="pill">{tr ? "Diğer araçlarda" : "Other tools"}</span>
            <h2>{tr ? "Genel konuşma pratiği var ama sınav düzeni net olmayabiliyor" : "Useful for general speaking, but not always shaped for exam prep"}</h2>
            <p>
              {tr
                ? "Birçok araç konuşma pratiği sunar ama IELTS ve TOEFL gibi sınavlar için net bir tekrar, transcript ve skor gelişimi akışı vermez."
                : "Many tools help users talk more, but they do not always create a clear exam-style loop for transcript review, retries, and score movement."}
            </p>
          </div>
          <div className="compare-overview-block">
            <span className="pill">{tr ? "SpeakAce'de" : "In SpeakAce"}</span>
            <h2>{tr ? "Daha net, daha ölçülebilir ve daha sınav odaklı bir akış var" : "A cleaner workflow built around practice, feedback, and improvement"}</h2>
            <p>
              {tr
                ? "SpeakAce; speaking denemesi, transcript inceleme, yeniden deneme ve düzenli ilerleme mantığını aynı yerde birleştirir."
                : "SpeakAce keeps the speaking session, transcript review, retry path, and daily improvement habit inside one more practical product flow."}
            </p>
          </div>
        </div>
      </section>

      <section className="card compare-table-card">
        <div className="section-head" style={{ marginBottom: "1rem" }}>
          <span className="eyebrow">{tr ? "Özellik karşılaştırması" : "Feature comparison"}</span>
          <h2>{tr ? "Diğer araçlarda nasıl, SpeakAce'de nasıl?" : "How it works elsewhere vs how it works in SpeakAce"}</h2>
        </div>

        <div className="compare-table-grid">
          <div className="compare-table-head">{tr ? "Başlık" : "Category"}</div>
          <div className="compare-table-head">{tr ? "Diğer araçlar" : "Other tools"}</div>
          <div className="compare-table-head compare-table-head-accent">SpeakAce</div>

          {compareRows.map((row) => (
            <Fragment key={row.label.en}>
              <div className="compare-table-cell compare-table-cell-label">
                {tr ? row.label.tr : row.label.en}
              </div>
              <div className="compare-table-cell">
                {tr ? row.other.tr : row.other.en}
              </div>
              <div className="compare-table-cell compare-table-cell-accent">
                {tr ? row.speakace.tr : row.speakace.en}
              </div>
            </Fragment>
          ))}
        </div>
      </section>

      <section className="card compare-summary-card">
        <div>
          <span className="eyebrow">{tr ? "Kısa sonuç" : "Short answer"}</span>
          <h2 style={{ margin: "0.8rem 0 0.5rem" }}>
            {tr ? "SpeakAce, sınava yönelik çalışan öğrenciler için daha net bir ürün" : "SpeakAce is the clearer option for students who care about exam progress"}
          </h2>
          <p className="practice-copy">
            {tr
              ? "Eğer hedefin sadece İngilizce konuşmak değil; IELTS veya TOEFL speaking performansını yükseltmekse, SpeakAce daha odaklı bir yapı sunar."
              : "If your goal is not only to speak more English but to improve IELTS or TOEFL speaking performance, SpeakAce offers a more focused structure."}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
          <Link className="button button-primary" href="/app/practice">
            {tr ? "Pratiğe başla" : "Start practice"}
          </Link>
          <Link className="button button-secondary" href="/pricing">
            {tr ? "Plus planı gör" : "See Plus plan"}
          </Link>
        </div>
      </section>

      {namedComparisons.map((item) => (
        <section key={item.id} id={item.id} className="card compare-table-card">
          <div className="section-head" style={{ marginBottom: "1rem" }}>
            <span className="eyebrow">{tr ? "Ayrıntılı karşılaştırma" : "Detailed comparison"}</span>
            <h2>{item.title}</h2>
            <p>{item.intro}</p>
          </div>

          <div className="comparison-table">
            <div className="comparison-head">{tr ? "Başlık" : "Category"}</div>
            <div className="comparison-head">{tr ? "Diğer seçenek" : "Other option"}</div>
            <div className="comparison-head">SpeakAce</div>

            <div className="comparison-cell comparison-label">{tr ? "Sınav odağı" : "Exam focus"}</div>
            <div className="comparison-cell">{tr ? "Daha genel veya daha tek katmanlı olabilir" : "Can feel broader or more one-layered"}</div>
            <div className="comparison-cell">IELTS and TOEFL speaking score improvement workflow</div>

            <div className="comparison-cell comparison-label">{tr ? "Geri bildirim akışı" : "Feedback flow"}</div>
            <div className="comparison-cell">{tr ? "Tek cevap sonrası sınırlı yönlendirme olabilir" : "May stop after one answer and one response"}</div>
            <div className="comparison-cell">Transcript, estimated score, targeted retry, and progress loop</div>

            <div className="comparison-cell comparison-label">{tr ? "Günlük kullanım" : "Daily practice habit"}</div>
            <div className="comparison-cell">{tr ? "Her gün dönmek için net yapı vermeyebilir" : "May not create a strong return habit"}</div>
            <div className="comparison-cell">Built for repeated speaking attempts and visible progress</div>
          </div>

          <p className="practice-copy" style={{ marginTop: "1rem" }}>
            {item.summary}
          </p>
        </section>
      ))}
    </main>
  );
}
