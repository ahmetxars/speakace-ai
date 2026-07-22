"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, ChevronRight, Clock3, FilePenLine, Gauge, Sparkles } from "lucide-react";
import { useAppState } from "@/components/providers";
import { trackClientEvent } from "@/lib/analytics-client";
import { normalizePublicLanguage, type PublicLanguage } from "@/lib/copy";
import { listWritingPrompts } from "@/lib/writing-prompts";
import { Difficulty, WritingPromptTemplate, WritingTaskType } from "@/lib/types";

type WritingTaskCopy = {
  title: string;
  body: string;
  placeholder: string;
  quickCheckLow: string;
  quickCheckHigh: string;
  statusStart: string;
};

type WritingConsoleCopy = {
  studio: string;
  backToHub: string;
  taskSetup: string;
  promptLibrary: string;
  promptsAvailable: string;
  difficulty: string;
  starter: string;
  target: string;
  stretch: string;
  selectedTask: string;
  recommended: string;
  minutes: string;
  words: string;
  targetWords: string;
  quickCheck: string;
  prepare: string;
  evaluate: string;
  evaluating: string;
  preparing: string;
  ready: string;
  saving: string;
  startError: string;
  saveError: string;
  evaluateError: string;
};

const consoleCopy: Record<PublicLanguage, WritingConsoleCopy> = {
  en: {
    studio: "Writing studio", backToHub: "Writing hub", taskSetup: "Task setup", promptLibrary: "Prompt library", promptsAvailable: "prompts", difficulty: "Difficulty", starter: "Starter", target: "Target", stretch: "Stretch", selectedTask: "Selected task", recommended: "Recommended", minutes: "min", words: "Words", targetWords: "Target", quickCheck: "Live writing check", prepare: "Prepare session", evaluate: "Evaluate my draft", evaluating: "Evaluating...", preparing: "Preparing your writing session...", ready: "Your session is ready. Write the draft and send it for evaluation.", saving: "Saving your draft...", startError: "Could not start the writing session.", saveError: "Could not save the draft.", evaluateError: "Could not evaluate the draft."
  },
  tr: {
    studio: "Yazma stüdyosu", backToHub: "Yazma merkezi", taskSetup: "Görev ayarları", promptLibrary: "Soru kütüphanesi", promptsAvailable: "soru", difficulty: "Zorluk", starter: "Başlangıç", target: "Hedef", stretch: "Zorlayıcı", selectedTask: "Seçili görev", recommended: "Önerilen", minutes: "dk", words: "Kelime", targetWords: "Hedef", quickCheck: "Canlı yazma kontrolü", prepare: "Oturumu hazırla", evaluate: "Taslağımı değerlendir", evaluating: "Değerlendiriliyor...", preparing: "Yazma oturumun hazırlanıyor...", ready: "Oturumun hazır. Taslağını yaz ve değerlendirmeye gönder.", saving: "Taslağın kaydediliyor...", startError: "Yazma oturumu başlatılamadı.", saveError: "Taslak kaydedilemedi.", evaluateError: "Taslak değerlendirilemedi."
  },
  de: {
    studio: "Schreibstudio", backToHub: "Schreibübersicht", taskSetup: "Aufgabe einrichten", promptLibrary: "Aufgabenbibliothek", promptsAvailable: "Aufgaben", difficulty: "Niveau", starter: "Einstieg", target: "Ziel", stretch: "Anspruchsvoll", selectedTask: "Gewählte Aufgabe", recommended: "Empfohlen", minutes: "Min.", words: "Wörter", targetWords: "Ziel", quickCheck: "Live-Schreibcheck", prepare: "Sitzung vorbereiten", evaluate: "Entwurf bewerten", evaluating: "Wird bewertet...", preparing: "Schreibsitzung wird vorbereitet...", ready: "Die Sitzung ist bereit. Schreibe deinen Entwurf und sende ihn zur Bewertung.", saving: "Entwurf wird gespeichert...", startError: "Die Schreibsitzung konnte nicht gestartet werden.", saveError: "Der Entwurf konnte nicht gespeichert werden.", evaluateError: "Der Entwurf konnte nicht bewertet werden."
  },
  es: {
    studio: "Estudio de writing", backToHub: "Centro de writing", taskSetup: "Configurar tarea", promptLibrary: "Biblioteca de preguntas", promptsAvailable: "preguntas", difficulty: "Dificultad", starter: "Inicial", target: "Objetivo", stretch: "Avanzado", selectedTask: "Tarea elegida", recommended: "Recomendado", minutes: "min", words: "Palabras", targetWords: "Objetivo", quickCheck: "Control de writing en vivo", prepare: "Preparar sesión", evaluate: "Evaluar mi borrador", evaluating: "Evaluando...", preparing: "Preparando tu sesión de writing...", ready: "La sesión está lista. Escribe el borrador y envíalo para evaluar.", saving: "Guardando tu borrador...", startError: "No se pudo iniciar la sesión de writing.", saveError: "No se pudo guardar el borrador.", evaluateError: "No se pudo evaluar el borrador."
  },
  fr: {
    studio: "Studio d’écriture", backToHub: "Accueil écriture", taskSetup: "Préparer la tâche", promptLibrary: "Bibliothèque de sujets", promptsAvailable: "sujets", difficulty: "Niveau", starter: "Débutant", target: "Objectif", stretch: "Avancé", selectedTask: "Sujet choisi", recommended: "Recommandé", minutes: "min", words: "Mots", targetWords: "Objectif", quickCheck: "Contrôle d’écriture en direct", prepare: "Préparer la session", evaluate: "Évaluer mon brouillon", evaluating: "Évaluation...", preparing: "Préparation de la session d’écriture...", ready: "La session est prête. Rédige ton brouillon puis envoie-le à l’évaluation.", saving: "Enregistrement du brouillon...", startError: "Impossible de démarrer la session d’écriture.", saveError: "Impossible d’enregistrer le brouillon.", evaluateError: "Impossible d’évaluer le brouillon."
  }
};

const taskConfig: Record<WritingTaskType, { minWords: number; copy: Record<PublicLanguage, WritingTaskCopy> }> = {
  "ielts-writing-task-1": {
    minWords: 150,
    copy: {
      en: { title: "IELTS Writing Task 1", body: "Turn a visual into a clear report with a strong overview and useful comparisons.", placeholder: "Write your report with an introduction, a clear overview, and detail paragraphs that compare the key features...", quickCheckLow: "Build toward 150 words and make the overview easy to find.", quickCheckHigh: "The length is healthy. Check that every detail supports a clear comparison.", statusStart: "Choose a Task 1 visual and begin your report." },
      tr: { title: "IELTS Writing Task 1", body: "Bir görseli net overview ve anlamlı karşılaştırmalar içeren güçlü bir rapora dönüştür.", placeholder: "Introduction, net bir overview ve ana özellikleri karşılaştıran detail paragraflarıyla raporunu yaz...", quickCheckLow: "150 kelimeye yaklaş ve overview bölümünü kolay bulunur hâle getir.", quickCheckHigh: "Uzunluk iyi. Her detayın net bir karşılaştırmayı desteklediğini kontrol et.", statusStart: "Bir Task 1 görseli seç ve raporuna başla." },
      de: { title: "IELTS Writing Task 1", body: "Mache aus einer Grafik einen klaren Bericht mit Überblick und sinnvollen Vergleichen.", placeholder: "Schreibe deinen Bericht mit Einleitung, klarem Überblick und Absätzen, die die wichtigsten Merkmale vergleichen...", quickCheckLow: "Arbeite auf 150 Wörter hin und mache den Überblick deutlich sichtbar.", quickCheckHigh: "Die Länge passt. Prüfe, ob jedes Detail einen klaren Vergleich unterstützt.", statusStart: "Wähle eine Task-1-Grafik und beginne deinen Bericht." },
      es: { title: "IELTS Writing Task 1", body: "Convierte un gráfico en un informe claro con overview y comparaciones útiles.", placeholder: "Escribe el informe con introducción, overview claro y párrafos que comparen los datos principales...", quickCheckLow: "Acércate a 150 palabras y deja el overview muy visible.", quickCheckHigh: "La extensión es buena. Comprueba que cada dato apoye una comparación clara.", statusStart: "Elige un visual de Task 1 y empieza el informe." },
      fr: { title: "IELTS Writing Task 1", body: "Transforme un visuel en rapport clair avec overview et comparaisons utiles.", placeholder: "Rédige ton rapport avec une introduction, un overview clair et des paragraphes comparant les éléments principaux...", quickCheckLow: "Vise 150 mots et rends l’overview facile à repérer.", quickCheckHigh: "La longueur est bonne. Vérifie que chaque détail soutient une comparaison claire.", statusStart: "Choisis un visuel de Task 1 et commence ton rapport." }
    }
  },
  "ielts-writing-task-2": {
    minWords: 250,
    copy: {
      en: { title: "IELTS Writing Task 2", body: "Build a focused argument, support it with examples, and keep every paragraph doing one job.", placeholder: "Write your essay with a clear introduction, developed body paragraphs, and a concise conclusion...", quickCheckLow: "Build toward 250 words and develop each example instead of only naming it.", quickCheckHigh: "The length is healthy. Check the links between your position, examples, and conclusion.", statusStart: "Choose a Task 2 topic and begin your essay." },
      tr: { title: "IELTS Writing Task 2", body: "Odaklı bir argüman kur, örneklerle destekle ve her paragrafın tek bir iş yapmasını sağla.", placeholder: "Net bir introduction, geliştirilmiş body paragrafları ve kısa conclusion ile essay'ini yaz...", quickCheckLow: "250 kelimeye yaklaş ve örneklerini yalnız saymak yerine geliştir.", quickCheckHigh: "Uzunluk iyi. Görüşün, örneklerin ve conclusion arasındaki bağlantıyı kontrol et.", statusStart: "Bir Task 2 konusu seç ve essay'ine başla." },
      de: { title: "IELTS Writing Task 2", body: "Entwickle ein klares Argument, belege es und gib jedem Absatz eine Aufgabe.", placeholder: "Schreibe deinen Essay mit klarer Einleitung, entwickelten Hauptabsätzen und knappem Schluss...", quickCheckLow: "Arbeite auf 250 Wörter hin und entwickle jedes Beispiel ausreichend.", quickCheckHigh: "Die Länge passt. Prüfe die Verbindung zwischen Position, Beispielen und Schluss.", statusStart: "Wähle ein Task-2-Thema und beginne deinen Essay." },
      es: { title: "IELTS Writing Task 2", body: "Construye un argumento claro, apóyalo con ejemplos y da una función a cada párrafo.", placeholder: "Escribe el essay con introducción clara, párrafos desarrollados y una conclusión concisa...", quickCheckLow: "Acércate a 250 palabras y desarrolla cada ejemplo en lugar de solo nombrarlo.", quickCheckHigh: "La extensión es buena. Revisa la conexión entre postura, ejemplos y conclusión.", statusStart: "Elige un tema de Task 2 y empieza tu essay." },
      fr: { title: "IELTS Writing Task 2", body: "Construis un argument clair, appuie-le avec des exemples et donne un rôle à chaque paragraphe.", placeholder: "Rédige ton essai avec une introduction claire, des paragraphes développés et une conclusion concise...", quickCheckLow: "Vise 250 mots et développe chaque exemple au lieu de simplement le citer.", quickCheckHigh: "La longueur est bonne. Vérifie le lien entre position, exemples et conclusion.", statusStart: "Choisis un sujet de Task 2 et commence ton essai." }
    }
  }
};

export function WritingConsole({ taskType }: { taskType: WritingTaskType }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, language } = useAppState();
  const publicLanguage = normalizePublicLanguage(language);
  const ui = consoleCopy[publicLanguage];
  const config = taskConfig[taskType];
  const taskCopy = config.copy[publicLanguage];
  const initialDifficulty = (searchParams.get("difficulty") as Difficulty | null) ?? "Target";
  const [difficulty, setDifficulty] = useState<Difficulty>(["Starter", "Target", "Stretch"].includes(initialDifficulty) ? initialDifficulty : "Target");
  const [selectedPromptId, setSelectedPromptId] = useState(searchParams.get("promptId") ?? "");
  const [essay, setEssay] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(taskCopy.statusStart);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  const prompts = useMemo(() => listWritingPrompts(taskType, difficulty), [difficulty, taskType]);
  const selectedPrompt = useMemo<WritingPromptTemplate | null>(() => prompts.find((item) => item.id === selectedPromptId) ?? prompts[0] ?? null, [prompts, selectedPromptId]);
  const wordCount = essay.trim() ? essay.trim().split(/\s+/).filter(Boolean).length : 0;
  const progress = Math.min(100, Math.round((wordCount / config.minWords) * 100));
  const taskPath = taskType === "ielts-writing-task-1" ? "/app/writing/task-1" : "/app/writing/task-2";

  const startWritingSession = async () => {
    if (!currentUser || !selectedPrompt) return;
    setLoading(true);
    setError(null);
    setStatus(ui.preparing);
    try {
      const response = await fetch("/api/writing/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          taskType,
          difficulty,
          promptId: selectedPrompt.id
        })
      });
      const data = (await response.json()) as { error?: string; session?: { id: string } };
      if (!response.ok || !data.session) {
        setError(data.error ?? ui.startError);
        setLoading(false);
        return;
      }
      setSessionId(data.session.id);
      setStartedAt(Date.now());
      setStatus(ui.ready);
      void trackClientEvent({ userId: currentUser.id, event: "writing_start", path: taskPath });
    } catch {
      setError(ui.startError);
    } finally {
      setLoading(false);
    }
  };

  const evaluateWriting = async () => {
    if (!currentUser || !selectedPrompt) return;
    setLoading(true);
    setError(null);
    try {
      let activeSessionId = sessionId;
      if (!activeSessionId) {
        const response = await fetch("/api/writing/session/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUser.id, taskType, difficulty, promptId: selectedPrompt.id })
        });
        const data = (await response.json()) as { session?: { id: string }; error?: string };
        if (!response.ok || !data.session) {
          setError(data.error ?? ui.startError);
          setLoading(false);
          return;
        }
        activeSessionId = data.session.id;
        setSessionId(activeSessionId);
        setStartedAt(Date.now());
        void trackClientEvent({ userId: currentUser.id, event: "writing_start", path: taskPath });
      }

      const minutesSpent = startedAt ? Math.max(1, Math.round((Date.now() - startedAt) / 60000)) : null;
      setStatus(ui.saving);
      const submitResponse = await fetch(`/api/writing/session/${activeSessionId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftText: essay, minutesSpent })
      });
      const submitData = (await submitResponse.json()) as { error?: string };
      if (!submitResponse.ok) {
        setError(submitData.error ?? ui.saveError);
        setLoading(false);
        return;
      }
      void trackClientEvent({ userId: currentUser.id, event: "writing_submitted", path: taskPath });

      setStatus(ui.evaluating);
      const evaluateResponse = await fetch(`/api/writing/session/${activeSessionId}/evaluate`, { method: "POST" });
      const evaluateData = (await evaluateResponse.json()) as { error?: string };
      if (!evaluateResponse.ok) {
        setError(evaluateData.error ?? ui.evaluateError);
        setLoading(false);
        return;
      }
      void trackClientEvent({ userId: currentUser.id, event: "writing_evaluated", path: taskPath });
      router.push(`/app/writing/results/${activeSessionId}`);
    } catch {
      setError(ui.evaluateError);
      setLoading(false);
    }
  };

  return (
    <main className="writing-studio page-shell">
      <header className="writing-studio-head">
        <div className="writing-studio-crumbs">
          <Link href="/app/writing"><ArrowLeft size={14} />{ui.backToHub}</Link>
          <ChevronRight size={14} aria-hidden="true" />
          <span>{taskType === "ielts-writing-task-1" ? "Task 1" : "Task 2"}</span>
        </div>
        <div className="writing-studio-title-row">
          <div>
            <span className="writing-studio-kicker"><Sparkles size={14} />{ui.studio}</span>
            <h1>{taskCopy.title}</h1>
            <p>{taskCopy.body}</p>
          </div>
          <nav className="writing-task-switcher" aria-label={ui.taskSetup}>
            <Link href="/app/writing/task-1" aria-current={taskType === "ielts-writing-task-1" ? "page" : undefined}>Task 1</Link>
            <Link href="/app/writing/task-2" aria-current={taskType === "ielts-writing-task-2" ? "page" : undefined}>Task 2</Link>
          </nav>
        </div>
      </header>

      <div className="writing-studio-grid">
        <aside className="writing-prompt-panel">
          <div className="writing-panel-heading">
            <div><span>{ui.taskSetup}</span><strong>{ui.promptLibrary}</strong></div>
            <small>{prompts.length} {ui.promptsAvailable}</small>
          </div>

          <label className="writing-difficulty-field">
            <span><Gauge size={15} />{ui.difficulty}</span>
            <select value={difficulty} onChange={(event) => setDifficulty(event.target.value as Difficulty)}>
              <option value="Starter">{ui.starter}</option>
              <option value="Target">{ui.target}</option>
              <option value="Stretch">{ui.stretch}</option>
            </select>
          </label>

          <div className="writing-prompt-options">
            {prompts.map((prompt, index) => {
              const active = (selectedPrompt?.id ?? "") === prompt.id;
              return (
                <button
                  key={prompt.id}
                  type="button"
                  className={active ? "is-active" : ""}
                  aria-pressed={active}
                  onClick={() => setSelectedPromptId(prompt.id)}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div><strong>{prompt.title}</strong><p>{prompt.prompt}</p></div>
                  <ChevronRight size={16} />
                </button>
              );
            })}
          </div>
        </aside>

        <section className="writing-editor-panel">
          <header className="writing-editor-head">
            <div>
              <span>{ui.selectedTask}</span>
              <h2>{selectedPrompt?.title}</h2>
            </div>
            <span className="writing-editor-status"><i />{status}</span>
          </header>

          <div className="writing-task-brief">
            <FilePenLine size={18} aria-hidden="true" />
            <p>{selectedPrompt?.prompt}</p>
          </div>

          <div className="writing-editor-meta">
            <span><Clock3 size={14} />{ui.recommended}: {selectedPrompt?.recommendedMinutes ?? 40} {ui.minutes}</span>
            <span>{ui.words}: <strong>{wordCount}</strong></span>
            <span>{ui.targetWords}: <strong>{config.minWords}</strong></span>
          </div>

          <textarea
            value={essay}
            onChange={(event) => setEssay(event.target.value)}
            placeholder={taskCopy.placeholder}
            aria-label={taskCopy.title}
          />

          <div className="writing-progress-track" aria-label={`${ui.words}: ${wordCount} / ${config.minWords}`}>
            <span style={{ width: `${progress}%` }} />
          </div>

          <footer className="writing-editor-footer">
            <div className="writing-live-check">
              <span><CheckCircle2 size={16} />{ui.quickCheck}</span>
              <p>{wordCount < config.minWords ? taskCopy.quickCheckLow : taskCopy.quickCheckHigh}</p>
            </div>
            {error ? <p className="writing-editor-error">{error}</p> : null}
            <div className="writing-editor-actions">
              <button type="button" className="button button-secondary" onClick={startWritingSession} disabled={!currentUser || loading || !selectedPrompt}>
                {ui.prepare}
              </button>
              <button type="button" className="button button-primary" onClick={() => void evaluateWriting()} disabled={!currentUser || loading || !selectedPrompt || wordCount < 40}>
                {loading ? ui.evaluating : ui.evaluate}
              </button>
            </div>
          </footer>
        </section>
      </div>
    </main>
  );
}
