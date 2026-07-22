"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BellRing,
  BookOpenCheck,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  LayoutDashboard,
  Plus,
  UsersRound
} from "lucide-react";
import { useAppState } from "@/components/providers";
import { normalizePublicLanguage, type PublicLanguage } from "@/lib/copy";

type DemoCopy = {
  eyebrow: string;
  title: string;
  body: string;
  primary: string;
  secondary: string;
  demoNote: string;
  className: string;
  week: string;
  overview: string;
  students: string;
  assignments: string;
  announcements: string;
  classAverage: string;
  weeklyAttempts: string;
  completion: string;
  attention: string;
  activity: string;
  actionQueue: string;
  actions: [string, string, string];
  openQueue: string;
  roster: string;
  learner: string;
  latest: string;
  focus: string;
  status: string;
  rows: Array<{ learner: string; score: string; focus: string; status: string }>;
  viewAll: string;
  sectionEyebrow: string;
  sectionTitle: string;
  sectionBody: string;
  features: Array<{ title: string; body: string }>;
  closingEyebrow: string;
  closingTitle: string;
  closingBody: string;
};

const demoCopy: Record<PublicLanguage, DemoCopy> = {
  en: {
    eyebrow: "Interactive teacher preview",
    title: "Know what needs attention before class starts.",
    body: "This demo shows the teacher side of SpeakAce: one calm view for practice activity, homework follow-up, learner risk, and the next lesson decision.",
    primary: "Create your first class",
    secondary: "See teacher programme",
    demoNote: "Illustrative class data · no login required",
    className: "IELTS Evening · B2",
    week: "This week",
    overview: "Overview",
    students: "Students",
    assignments: "Assignments",
    announcements: "Announcements",
    classAverage: "Class average",
    weeklyAttempts: "Weekly attempts",
    completion: "Homework complete",
    attention: "Need attention",
    activity: "Practice activity",
    actionQueue: "Action queue",
    actions: ["2 learners missed the due date", "Pronunciation is the class-wide focus", "6 new attempts are ready to review"],
    openQueue: "Review priority list",
    roster: "Learner pulse",
    learner: "Learner",
    latest: "Latest band",
    focus: "Current focus",
    status: "Status",
    rows: [
      { learner: "Student 04", score: "6.5", focus: "Fluency", status: "Improving" },
      { learner: "Student 11", score: "5.5", focus: "Pronunciation", status: "Follow up" },
      { learner: "Student 16", score: "7.0", focus: "Development", status: "On track" },
      { learner: "Student 18", score: "6.0", focus: "Vocabulary", status: "Homework due" }
    ],
    viewAll: "Open full roster",
    sectionEyebrow: "Built around the next lesson",
    sectionTitle: "The dashboard does not just report. It helps you decide.",
    sectionBody: "Every area is arranged around a real teacher question, so you can move from signal to action without assembling the story yourself.",
    features: [
      { title: "Who should I help first?", body: "Risk and due-date signals bring the right learners to the top." },
      { title: "What should the class practise?", body: "Skill patterns show where a shared follow-up will have the most value." },
      { title: "Did the assignment work?", body: "Completion, attempts, and results stay connected to the task." }
    ],
    closingEyebrow: "Try the real workflow",
    closingTitle: "Create one class. Invite a few learners. Judge it with real activity.",
    closingBody: "The teacher workspace is free to explore, and your first class takes only a short join code to start."
  },
  tr: {
    eyebrow: "Etkileşimli öğretmen önizlemesi",
    title: "Derse girmeden neye odaklanacağını gör.",
    body: "Bu demo SpeakAce'in öğretmen tarafını gösterir: pratik aktivitesi, ödev takibi, öğrenci riski ve sonraki ders kararı için sakin tek görünüm.",
    primary: "İlk sınıfını oluştur",
    secondary: "Öğretmen programını gör",
    demoNote: "Temsili sınıf verisi · giriş gerekmez",
    className: "IELTS Akşam · B2",
    week: "Bu hafta",
    overview: "Özet",
    students: "Öğrenciler",
    assignments: "Ödevler",
    announcements: "Duyurular",
    classAverage: "Sınıf ortalaması",
    weeklyAttempts: "Haftalık deneme",
    completion: "Ödev tamamlandı",
    attention: "Dikkat gerekli",
    activity: "Pratik aktivitesi",
    actionQueue: "Aksiyon sırası",
    actions: ["2 öğrenci son tarihi kaçırdı", "Sınıf genelinde odak telaffuz", "6 yeni deneme incelemeye hazır"],
    openQueue: "Öncelik listesini incele",
    roster: "Öğrenci nabzı",
    learner: "Öğrenci",
    latest: "Son band",
    focus: "Mevcut odak",
    status: "Durum",
    rows: [
      { learner: "Öğrenci 04", score: "6.5", focus: "Akıcılık", status: "Gelişiyor" },
      { learner: "Öğrenci 11", score: "5.5", focus: "Telaffuz", status: "Takip et" },
      { learner: "Öğrenci 16", score: "7.0", focus: "Geliştirme", status: "Yolunda" },
      { learner: "Öğrenci 18", score: "6.0", focus: "Kelime", status: "Ödev bekliyor" }
    ],
    viewAll: "Tüm listeyi aç",
    sectionEyebrow: "Sonraki ders etrafında kuruldu",
    sectionTitle: "Panel yalnız raporlamaz. Karar vermene yardım eder.",
    sectionBody: "Her alan gerçek bir öğretmen sorusuna göre düzenlendi; hikâyeyi kendin birleştirmeden sinyalden aksiyona geçersin.",
    features: [
      { title: "Önce kime yardım etmeliyim?", body: "Risk ve son tarih sinyalleri doğru öğrencileri üste taşır." },
      { title: "Sınıf ne çalışmalı?", body: "Beceri örüntüleri ortak tekrarın en değerli olacağı alanı gösterir." },
      { title: "Ödev işe yaradı mı?", body: "Tamamlama, deneme ve sonuçlar görevle bağlantılı kalır." }
    ],
    closingEyebrow: "Gerçek akışı dene",
    closingTitle: "Bir sınıf oluştur. Birkaç öğrenci çağır. Gerçek aktiviteyle değerlendir.",
    closingBody: "Öğretmen alanını ücretsiz keşfedebilirsin; ilk sınıfı başlatmak için kısa bir katılım kodu yeterli."
  },
  de: {
    eyebrow: "Interaktive Lehrervorschau", title: "Sieh vor dem Unterricht, was Aufmerksamkeit braucht.", body: "Diese Demo zeigt die Lehrerseite von SpeakAce: Aktivität, Aufgaben, Risiken und nächste Entscheidungen in einer ruhigen Ansicht.", primary: "Erste Klasse erstellen", secondary: "Lehrerprogramm ansehen", demoNote: "Beispieldaten · keine Anmeldung nötig",
    className: "IELTS Abend · B2", week: "Diese Woche", overview: "Übersicht", students: "Lernende", assignments: "Aufgaben", announcements: "Mitteilungen", classAverage: "Klassenschnitt", weeklyAttempts: "Versuche diese Woche", completion: "Aufgaben erledigt", attention: "Brauchen Hilfe", activity: "Übungsaktivität", actionQueue: "Aktionsliste", actions: ["2 Lernende verpassten die Frist", "Aussprache ist Klassenfokus", "6 Versuche warten auf Prüfung"], openQueue: "Prioritäten prüfen", roster: "Lernendenpuls", learner: "Lernende", latest: "Letztes Band", focus: "Aktueller Fokus", status: "Status",
    rows: [{ learner: "Lernende 04", score: "6.5", focus: "Flüssigkeit", status: "Verbessert sich" }, { learner: "Lernende 11", score: "5.5", focus: "Aussprache", status: "Nachfassen" }, { learner: "Lernende 16", score: "7.0", focus: "Entwicklung", status: "Im Plan" }, { learner: "Lernende 18", score: "6.0", focus: "Wortschatz", status: "Aufgabe fällig" }], viewAll: "Ganze Liste öffnen",
    sectionEyebrow: "Für die nächste Stunde", sectionTitle: "Das Dashboard berichtet nicht nur. Es hilft entscheiden.", sectionBody: "Jeder Bereich beantwortet eine echte Lehrerfrage und führt vom Signal zur Aktion.", features: [{ title: "Wem helfe ich zuerst?", body: "Risiken und Fristen priorisieren die richtigen Lernenden." }, { title: "Was soll die Klasse üben?", body: "Fähigkeitsmuster zeigen den besten gemeinsamen Fokus." }, { title: "Hat die Aufgabe funktioniert?", body: "Erledigung, Versuche und Ergebnisse bleiben verbunden." }], closingEyebrow: "Echten Ablauf testen", closingTitle: "Eine Klasse erstellen, Lernende einladen, mit echter Aktivität bewerten.", closingBody: "Der Lehrerbereich ist kostenlos zu erkunden; ein kurzer Code startet die Klasse."
  },
  es: {
    eyebrow: "Vista docente interactiva", title: "Ve qué necesita atención antes de empezar la clase.", body: "Esta demo muestra el lado docente de SpeakAce: actividad, tareas, riesgo y decisiones para la próxima lección en una sola vista.", primary: "Crear primera clase", secondary: "Ver programa docente", demoNote: "Datos ilustrativos · sin iniciar sesión",
    className: "IELTS tarde · B2", week: "Esta semana", overview: "Resumen", students: "Estudiantes", assignments: "Tareas", announcements: "Avisos", classAverage: "Media de clase", weeklyAttempts: "Intentos semanales", completion: "Tareas completas", attention: "Necesitan atención", activity: "Actividad", actionQueue: "Acciones", actions: ["2 alumnos pasaron la fecha", "Pronunciación es el foco común", "6 intentos listos para revisar"], openQueue: "Revisar prioridades", roster: "Pulso de alumnos", learner: "Estudiante", latest: "Último band", focus: "Foco actual", status: "Estado",
    rows: [{ learner: "Estudiante 04", score: "6.5", focus: "Fluidez", status: "Mejorando" }, { learner: "Estudiante 11", score: "5.5", focus: "Pronunciación", status: "Seguimiento" }, { learner: "Estudiante 16", score: "7.0", focus: "Desarrollo", status: "En línea" }, { learner: "Estudiante 18", score: "6.0", focus: "Vocabulario", status: "Tarea pendiente" }], viewAll: "Abrir lista completa",
    sectionEyebrow: "Construido para la próxima clase", sectionTitle: "El panel no solo informa. Ayuda a decidir.", sectionBody: "Cada área responde una pregunta docente real para pasar de señal a acción.", features: [{ title: "¿A quién ayudo primero?", body: "Riesgo y fechas ponen arriba a los alumnos correctos." }, { title: "¿Qué debe practicar la clase?", body: "Los patrones muestran el mejor foco compartido." }, { title: "¿Funcionó la tarea?", body: "Finalización, intentos y resultados siguen conectados." }], closingEyebrow: "Prueba el flujo real", closingTitle: "Crea una clase, invita alumnos y evalúa con actividad real.", closingBody: "Puedes explorar gratis; un código corto basta para empezar."
  },
  fr: {
    eyebrow: "Aperçu enseignant interactif", title: "Voyez quoi prioriser avant le début du cours.", body: "Cette démo montre l’espace enseignant SpeakAce : activité, devoirs, risques et décisions du prochain cours dans une vue calme.", primary: "Créer ma première classe", secondary: "Voir le programme enseignant", demoNote: "Données illustratives · sans connexion",
    className: "IELTS soir · B2", week: "Cette semaine", overview: "Aperçu", students: "Élèves", assignments: "Devoirs", announcements: "Annonces", classAverage: "Moyenne de classe", weeklyAttempts: "Essais cette semaine", completion: "Devoirs terminés", attention: "À suivre", activity: "Activité", actionQueue: "Actions", actions: ["2 élèves ont dépassé l’échéance", "La prononciation est le focus commun", "6 essais sont à revoir"], openQueue: "Voir les priorités", roster: "Pouls des élèves", learner: "Élève", latest: "Dernier band", focus: "Focus actuel", status: "Statut",
    rows: [{ learner: "Élève 04", score: "6.5", focus: "Fluidité", status: "En progrès" }, { learner: "Élève 11", score: "5.5", focus: "Prononciation", status: "À relancer" }, { learner: "Élève 16", score: "7.0", focus: "Développement", status: "Dans le rythme" }, { learner: "Élève 18", score: "6.0", focus: "Vocabulaire", status: "Devoir attendu" }], viewAll: "Ouvrir la liste complète",
    sectionEyebrow: "Pensé pour le prochain cours", sectionTitle: "Le tableau ne fait pas que rapporter. Il aide à décider.", sectionBody: "Chaque zone répond à une vraie question pédagogique et mène du signal à l’action.", features: [{ title: "Qui aider en premier ?", body: "Risques et échéances font remonter les bons élèves." }, { title: "Que doit travailler la classe ?", body: "Les tendances indiquent le meilleur focus commun." }, { title: "Le devoir a-t-il fonctionné ?", body: "Achèvement, essais et résultats restent reliés." }], closingEyebrow: "Tester le vrai flux", closingTitle: "Créez une classe, invitez quelques élèves et jugez sur l’activité réelle.", closingBody: "L’espace enseignant est gratuit à explorer; un code court suffit pour démarrer."
  }
};

const bars = [36, 58, 44, 76, 64, 92, 71];

const demoUnits: Record<PublicLanguage, { attempts: string; priorities: string; urgent: string }> = {
  en: { attempts: "attempts", priorities: "priorities", urgent: "urgent" },
  tr: { attempts: "deneme", priorities: "öncelik", urgent: "acil" },
  de: { attempts: "Versuche", priorities: "Prioritäten", urgent: "dringend" },
  es: { attempts: "intentos", priorities: "prioridades", urgent: "urgentes" },
  fr: { attempts: "essais", priorities: "priorités", urgent: "urgents" }
};

export function TeacherDemoPage() {
  const { language } = useAppState();
  const publicLanguage = normalizePublicLanguage(language);
  const copy = demoCopy[publicLanguage];
  const units = demoUnits[publicLanguage];

  return (
    <main className="demo-class-page">
      <section className="demo-class-hero page-shell">
        <div>
          <span className="program-kicker">{copy.eyebrow}</span>
          <h1>{copy.title}</h1>
          <p>{copy.body}</p>
          <div className="program-actions">
            <Link className="button button-primary" href="/auth?mode=signup&cta=teacher_demo">{copy.primary}<ArrowRight size={16} /></Link>
            <Link className="button button-secondary" href="/for-teachers">{copy.secondary}</Link>
          </div>
          <span className="demo-class-note"><CheckCircle2 size={14} />{copy.demoNote}</span>
        </div>
        <aside className="demo-hero-pulse" aria-label={copy.overview}>
          <div className="demo-hero-pulse-head">
            <span className="demo-hero-pulse-icon"><LayoutDashboard size={19} /></span>
            <div><small>{copy.overview}</small><strong>{copy.className}</strong></div>
            <span className="demo-hero-live"><i />{copy.week}</span>
          </div>
          <div className="demo-hero-metrics">
            <article><UsersRound size={17} /><span>{copy.students}</span><strong>18</strong></article>
            <article><BookOpenCheck size={17} /><span>{copy.completion}</span><strong>78%</strong></article>
          </div>
          <div className="demo-hero-priority">
            <span><CircleAlert size={17} />{copy.attention}</span>
            <strong>4</strong>
            <small>2 {units.urgent}</small>
          </div>
        </aside>
      </section>

      <section className="demo-workspace page-shell" aria-label={copy.overview}>
        <aside className="demo-workspace-nav">
          <div className="demo-workspace-brand">SA</div>
          <nav>
            <span className="is-active"><LayoutDashboard size={17} />{copy.overview}</span>
            <span><UsersRound size={17} />{copy.students}</span>
            <span><BookOpenCheck size={17} />{copy.assignments}</span>
            <span><BellRing size={17} />{copy.announcements}</span>
          </nav>
          <button type="button"><Plus size={16} />{copy.assignments}</button>
        </aside>

        <div className="demo-workspace-main">
          <header className="demo-workspace-header">
            <div><span>{copy.overview}</span><h2>{copy.className}</h2></div>
            <span>{copy.week}</span>
          </header>

          <div className="demo-kpis">
            <article><span>{copy.classAverage}</span><strong>6.4</strong><small>+0.3</small></article>
            <article><span>{copy.weeklyAttempts}</span><strong>62</strong><small>+18%</small></article>
            <article><span>{copy.completion}</span><strong>78%</strong><small>14 / 18</small></article>
            <article className="is-alert"><span>{copy.attention}</span><strong>4</strong><small><CircleAlert size={13} />2 {units.urgent}</small></article>
          </div>

          <div className="demo-workspace-grid">
            <article className="demo-activity-panel">
              <div className="demo-panel-head"><div><span>{copy.activity}</span><strong>62 {units.attempts}</strong></div><BarChart3 size={18} /></div>
              <div className="demo-chart" aria-hidden="true">
                {bars.map((height, index) => <span key={`${height}-${index}`} style={{ height: `${height}%` }} />)}
              </div>
              <div className="demo-chart-labels"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div>
            </article>

            <article className="demo-action-panel">
              <div className="demo-panel-head"><div><span>{copy.actionQueue}</span><strong>3 {units.priorities}</strong></div><CircleAlert size={18} /></div>
              <div className="demo-action-list">
                {copy.actions.map((action, index) => <div key={action}><span>0{index + 1}</span><p>{action}</p><ChevronRight size={15} /></div>)}
              </div>
              <button type="button">{copy.openQueue}<ArrowRight size={15} /></button>
            </article>
          </div>

          <article className="demo-roster-panel">
            <div className="demo-panel-head"><div><span>{copy.roster}</span><strong>18 {copy.students.toLowerCase()}</strong></div><UsersRound size={18} /></div>
            <div className="demo-roster-table">
              <div className="demo-roster-head"><span>{copy.learner}</span><span>{copy.latest}</span><span>{copy.focus}</span><span>{copy.status}</span></div>
              {copy.rows.map((row, index) => (
                <div className="demo-roster-row" key={row.learner}>
                  <span><i>{String(index + 4).padStart(2, "0")}</i>{row.learner}</span>
                  <strong>{row.score}</strong>
                  <span>{row.focus}</span>
                  <span data-status={index === 1 || index === 3 ? "attention" : "good"}>{row.status}</span>
                </div>
              ))}
            </div>
            <button type="button" className="demo-roster-link">{copy.viewAll}<ArrowRight size={15} /></button>
          </article>
        </div>
      </section>

      <section className="demo-decision page-shell">
        <div className="program-section-intro">
          <span className="program-kicker">{copy.sectionEyebrow}</span>
          <h2>{copy.sectionTitle}</h2>
          <p>{copy.sectionBody}</p>
        </div>
        <div className="demo-decision-list">
          {copy.features.map((feature, index) => (
            <article key={feature.title}><span>0{index + 1}</span><div><h3>{feature.title}</h3><p>{feature.body}</p></div></article>
          ))}
        </div>
      </section>

      <section className="demo-closing page-shell">
        <div><span className="program-kicker">{copy.closingEyebrow}</span><h2>{copy.closingTitle}</h2><p>{copy.closingBody}</p></div>
        <Link className="button button-primary" href="/auth?mode=signup&cta=teacher_demo_bottom">{copy.primary}<ArrowRight size={16} /></Link>
      </section>
    </main>
  );
}
