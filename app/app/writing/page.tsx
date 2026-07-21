import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowRight, BarChart3, FilePenLine, History, Sparkles, Target } from "lucide-react";
import type { PublicLanguage } from "@/lib/copy";
import { getServerLanguage } from "@/lib/language";
import { resolveDashboardRole } from "@/lib/roles";
import { getSessionCookieName, getAuthenticatedUser } from "@/lib/server/auth";
import { listWritingPrompts } from "@/lib/writing-prompts";
import { getWritingSummary } from "@/lib/writing-store";

type WritingCopy = {
  eyebrow: string;
  title: string;
  body: string;
  taskTwoCta: string;
  taskOneCta: string;
  attempts: string;
  average: string;
  weakest: string;
  taskTwoLabel: string;
  taskTwoTitle: string;
  taskTwoBody: string;
  taskTwoOpen: string;
  taskOneLabel: string;
  taskOneTitle: string;
  taskOneBody: string;
  taskOneOpen: string;
  promptLabel: string;
  latestLabel: string;
  latestTitle: string;
  latestOpen: string;
  emptyTitle: string;
  emptyBody: string;
  emptyAction: string;
  focusLabel: string;
};

const writingCopy: Record<PublicLanguage, WritingCopy> = {
  en: {
    eyebrow: "IELTS writing studio",
    title: "Write with a target, not a blank page.",
    body: "Choose the task, build a timed draft, and turn the evaluation into one specific goal for your next attempt.",
    taskTwoCta: "Start Task 2 essay",
    taskOneCta: "Open Task 1 report",
    attempts: "Writing attempts",
    average: "Average band",
    weakest: "Current focus",
    taskTwoLabel: "Primary practice track",
    taskTwoTitle: "Task 2 · Essay",
    taskTwoBody: "Train argument structure, position, examples, and paragraph control with a complete essay workflow.",
    taskTwoOpen: "Open Task 2 workspace",
    taskOneLabel: "Visual reporting track",
    taskOneTitle: "Task 1 · Report",
    taskOneBody: "Practise overviews, comparisons, trends, and accurate data language without drifting into opinion.",
    taskOneOpen: "Open Task 1 workspace",
    promptLabel: "Suggested prompt",
    latestLabel: "Latest progress",
    latestTitle: "Continue from your last evaluation",
    latestOpen: "Open latest report",
    emptyTitle: "Your writing history starts with one finished draft.",
    emptyBody: "Complete a task to unlock score history, sentence comments, retry comparison, and report export.",
    emptyAction: "Write the first essay",
    focusLabel: "Next exercise"
  },
  tr: {
    eyebrow: "IELTS yazma stüdyosu",
    title: "Boş sayfayla değil, net bir hedefle yaz.",
    body: "Görevi seç, süreli taslağını oluştur ve değerlendirmeyi sonraki denemen için tek bir somut hedefe çevir.",
    taskTwoCta: "Task 2 essay başlat",
    taskOneCta: "Task 1 raporu aç",
    attempts: "Yazma denemeleri",
    average: "Ortalama band",
    weakest: "Mevcut odak",
    taskTwoLabel: "Ana pratik yolu",
    taskTwoTitle: "Task 2 · Essay",
    taskTwoBody: "Eksiksiz essay akışıyla argüman yapısı, görüş, örnek ve paragraf kontrolünü çalış.",
    taskTwoOpen: "Task 2 alanını aç",
    taskOneLabel: "Görsel raporlama yolu",
    taskOneTitle: "Task 1 · Rapor",
    taskOneBody: "Görüşe kaymadan overview, karşılaştırma, trend ve doğru veri dilini çalış.",
    taskOneOpen: "Task 1 alanını aç",
    promptLabel: "Önerilen soru",
    latestLabel: "Son ilerleme",
    latestTitle: "Son değerlendirmenden devam et",
    latestOpen: "Son raporu aç",
    emptyTitle: "Yazma geçmişin tamamlanan tek bir taslakla başlar.",
    emptyBody: "Skor geçmişi, cümle yorumları, yeniden deneme karşılaştırması ve rapor dışa aktarımı için bir görevi tamamla.",
    emptyAction: "İlk essay'i yaz",
    focusLabel: "Sonraki egzersiz"
  },
  de: {
    eyebrow: "IELTS Schreibstudio", title: "Schreibe mit einem Ziel, nicht vor einer leeren Seite.", body: "Wähle die Aufgabe, schreibe einen zeitlich begrenzten Entwurf und mache aus der Bewertung ein klares nächstes Ziel.", taskTwoCta: "Task-2-Essay starten", taskOneCta: "Task-1-Bericht öffnen", attempts: "Schreibversuche", average: "Durchschnittliches Band", weakest: "Aktueller Fokus", taskTwoLabel: "Haupt-Übungsweg", taskTwoTitle: "Task 2 · Essay", taskTwoBody: "Trainiere Argument, Position, Beispiele und Absätze in einem vollständigen Essay-Ablauf.", taskTwoOpen: "Task-2-Bereich öffnen", taskOneLabel: "Visueller Bericht", taskOneTitle: "Task 1 · Bericht", taskOneBody: "Übe Überblick, Vergleiche, Trends und genaue Datensprache.", taskOneOpen: "Task-1-Bereich öffnen", promptLabel: "Empfohlene Aufgabe", latestLabel: "Letzter Fortschritt", latestTitle: "An die letzte Bewertung anknüpfen", latestOpen: "Letzten Bericht öffnen", emptyTitle: "Dein Verlauf beginnt mit einem fertigen Entwurf.", emptyBody: "Schließe eine Aufgabe ab, um Verlauf, Satzkommentare und Vergleiche freizuschalten.", emptyAction: "Ersten Essay schreiben", focusLabel: "Nächste Übung"
  },
  es: {
    eyebrow: "Estudio de writing IELTS", title: "Escribe con un objetivo, no ante una página vacía.", body: "Elige la tarea, crea un borrador cronometrado y convierte la evaluación en un objetivo concreto para el siguiente intento.", taskTwoCta: "Empezar essay Task 2", taskOneCta: "Abrir informe Task 1", attempts: "Intentos de writing", average: "Band promedio", weakest: "Foco actual", taskTwoLabel: "Ruta principal", taskTwoTitle: "Task 2 · Essay", taskTwoBody: "Entrena argumento, postura, ejemplos y párrafos con un flujo completo.", taskTwoOpen: "Abrir espacio Task 2", taskOneLabel: "Ruta de informe visual", taskOneTitle: "Task 1 · Informe", taskOneBody: "Practica overview, comparaciones, tendencias y lenguaje de datos preciso.", taskOneOpen: "Abrir espacio Task 1", promptLabel: "Pregunta sugerida", latestLabel: "Último progreso", latestTitle: "Continúa desde tu última evaluación", latestOpen: "Abrir último informe", emptyTitle: "Tu historial empieza con un borrador terminado.", emptyBody: "Completa una tarea para desbloquear puntuaciones, comentarios y comparación de intentos.", emptyAction: "Escribir primer essay", focusLabel: "Siguiente ejercicio"
  },
  fr: {
    eyebrow: "Studio d’écriture IELTS", title: "Écris avec un objectif, pas face à une page vide.", body: "Choisis la tâche, rédige un brouillon chronométré et transforme l’évaluation en objectif précis pour le prochain essai.", taskTwoCta: "Commencer l’essai Task 2", taskOneCta: "Ouvrir le rapport Task 1", attempts: "Essais d’écriture", average: "Band moyen", weakest: "Focus actuel", taskTwoLabel: "Parcours principal", taskTwoTitle: "Task 2 · Essay", taskTwoBody: "Travaille l’argument, la position, les exemples et les paragraphes dans un flux complet.", taskTwoOpen: "Ouvrir l’espace Task 2", taskOneLabel: "Parcours rapport visuel", taskOneTitle: "Task 1 · Rapport", taskOneBody: "Travaille l’overview, les comparaisons, les tendances et la précision des données.", taskOneOpen: "Ouvrir l’espace Task 1", promptLabel: "Sujet suggéré", latestLabel: "Dernier progrès", latestTitle: "Reprendre depuis la dernière évaluation", latestOpen: "Ouvrir le dernier rapport", emptyTitle: "Ton historique commence avec un brouillon terminé.", emptyBody: "Termine une tâche pour débloquer scores, commentaires et comparaison des essais.", emptyAction: "Écrire le premier essay", focusLabel: "Prochain exercice"
  }
};

export default async function WritingHubPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const profile = await getAuthenticatedUser(token);
  const dashboardRole = resolveDashboardRole(profile);
  if (dashboardRole === "teacher") redirect("/app/teacher");
  if (dashboardRole === "school") redirect("/app/institution-admin");

  const language = await getServerLanguage();
  const copy = writingCopy[language];
  const summary = profile
    ? await getWritingSummary(profile.id)
    : { totalSessions: 0, averageScore: 0, latestSession: null, recentSessions: [], weakestCategory: null };
  const taskOnePrompts = listWritingPrompts("ielts-writing-task-1", "Target").slice(0, 3);
  const taskTwoPrompts = listWritingPrompts("ielts-writing-task-2", "Target").slice(0, 3);
  const metrics = [
    { label: copy.attempts, value: String(summary.totalSessions), icon: History },
    { label: copy.average, value: summary.averageScore ? summary.averageScore.toFixed(1) : "-", icon: BarChart3 },
    { label: copy.weakest, value: summary.weakestCategory ?? "-", icon: Target }
  ];

  return (
    <div className="writing-hub page-shell">
      <header className="writing-hub-hero">
        <div className="writing-hub-copy">
          <span className="writing-kicker"><Sparkles size={14} />{copy.eyebrow}</span>
          <h1>{copy.title}</h1>
          <p>{copy.body}</p>
          <div className="writing-hub-actions">
            <Link href="/app/writing/task-2" className="button button-primary">{copy.taskTwoCta}<ArrowRight size={16} /></Link>
            <Link href="/app/writing/task-1" className="button button-secondary">{copy.taskOneCta}</Link>
          </div>
        </div>
        <div className="writing-metric-stack">
          {metrics.map(({ label, value, icon: Icon }, index) => (
            <div key={label} className={index === 0 ? "is-primary" : ""}>
              <span><Icon size={15} />{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </header>

      <section className="writing-track-grid">
        <article className="writing-track writing-track-primary">
          <div className="writing-track-head">
            <span>{copy.taskTwoLabel}</span>
            <i>02</i>
          </div>
          <div className="writing-track-copy"><h2>{copy.taskTwoTitle}</h2><p>{copy.taskTwoBody}</p></div>
          <div className="writing-prompt-list">
            {taskTwoPrompts.map((prompt, index) => (
              <Link key={prompt.id} href={`/app/writing/task-2?promptId=${prompt.id}&difficulty=${prompt.difficulty}`}>
                <span>{copy.promptLabel} {index + 1}</span><strong>{prompt.title}</strong><ArrowRight size={16} />
              </Link>
            ))}
          </div>
          <Link href="/app/writing/task-2" className="button button-primary">{copy.taskTwoOpen}<ArrowRight size={16} /></Link>
        </article>

        <article className="writing-track writing-track-secondary">
          <div className="writing-track-head"><span>{copy.taskOneLabel}</span><i>01</i></div>
          <div className="writing-track-copy"><h2>{copy.taskOneTitle}</h2><p>{copy.taskOneBody}</p></div>
          <div className="writing-prompt-list writing-prompt-list-compact">
            {taskOnePrompts.map((prompt) => (
              <Link key={prompt.id} href={`/app/writing/task-1?promptId=${prompt.id}&difficulty=${prompt.difficulty}`}>
                <strong>{prompt.title}</strong><ArrowRight size={16} />
              </Link>
            ))}
          </div>
          <Link href="/app/writing/task-1" className="button button-secondary">{copy.taskOneOpen}<ArrowRight size={16} /></Link>
        </article>
      </section>

      <section className="writing-progress-panel">
        <div className="writing-progress-label"><FilePenLine size={18} /><span>{copy.latestLabel}</span></div>
        {summary.latestSession?.report ? (
          <>
            <div className="writing-progress-score"><span>{summary.latestSession.taskType === "ielts-writing-task-1" ? "Task 1" : "Task 2"}</span><strong>{summary.latestSession.report.overall}</strong></div>
            <div className="writing-progress-copy"><h2>{copy.latestTitle}</h2><p>{summary.latestSession.prompt.title}</p><small>{copy.focusLabel}: {summary.latestSession.report.nextExercise}</small></div>
            <Link href={`/app/writing/results/${summary.latestSession.id}`} className="button button-primary">{copy.latestOpen}<ArrowRight size={16} /></Link>
          </>
        ) : (
          <>
            <div className="writing-progress-empty-icon"><FilePenLine size={24} /></div>
            <div className="writing-progress-copy"><h2>{copy.emptyTitle}</h2><p>{copy.emptyBody}</p></div>
            <Link href="/app/writing/task-2" className="button button-primary">{copy.emptyAction}<ArrowRight size={16} /></Link>
          </>
        )}
      </section>
    </div>
  );
}
