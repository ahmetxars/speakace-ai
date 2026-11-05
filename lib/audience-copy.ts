import type { PublicLanguage } from "@/lib/copy";

export type ProgramAudience = "students" | "teachers" | "schools";

export type ProgramCopy = {
  eyebrow: string;
  title: string;
  body: string;
  primary: string;
  secondary: string;
  signals: [string, string, string];
  outcomesEyebrow: string;
  outcomesTitle: string;
  outcomesBody: string;
  outcomes: Array<{
    title: string;
    body: string;
  }>;
  workflowEyebrow: string;
  workflowTitle: string;
  workflow: Array<{
    title: string;
    body: string;
  }>;
  leadEyebrow: string;
  leadTitle: string;
  leadBody: string;
  closingEyebrow: string;
  closingTitle: string;
  closingBody: string;
  closingPrimary: string;
  closingSecondary: string;
};

export const content: Record<
  PublicLanguage,
  Record<ProgramAudience, ProgramCopy>
> = {
  en: {
    students: {
      eyebrow: "For independent learners",
      title: "Know what to fix before your next answer.",
      body: "SpeakAce turns IELTS and TOEFL practice into a clear loop: answer, see the evidence, improve one skill, and try again.",
      primary: "Start a free practice",
      secondary: "See the plans",
      signals: [
        "No credit card to start",
        "Speaking and writing in one place",
        "Your history stays organized",
      ],
      outcomesEyebrow: "A calmer way to improve",
      outcomesTitle: "Every session should answer one question: what next?",
      outcomesBody:
        "The workspace keeps the score, transcript, feedback, and next practice together so you spend less time deciding and more time improving.",
      outcomes: [
        {
          title: "Feedback tied to your answer",
          body: "Read the transcript beside skill-level feedback instead of guessing why a score moved.",
        },
        {
          title: "Practice that builds on itself",
          body: "Retry the same prompt, compare attempts, and keep useful answers available for review.",
        },
        {
          title: "Speaking and writing, one rhythm",
          body: "Move between IELTS speaking and writing without rebuilding your study system.",
        },
      ],
      workflowEyebrow: "The daily loop",
      workflowTitle: "Ten focused minutes can still be structured.",
      workflow: [
        {
          title: "Choose one exam task",
          body: "Open a prompt matched to the skill you want to train.",
        },
        {
          title: "Get specific evidence",
          body: "Review your score, transcript, and the issue that matters most.",
        },
        {
          title: "Retry with one goal",
          body: "Apply the feedback immediately and keep the stronger attempt.",
        },
      ],
      leadEyebrow: "Study notes",
      leadTitle: "Get the first-week speaking checklist.",
      leadBody:
        "A short practice plan for learners who want structure before they commit to a subscription.",
      closingEyebrow: "Your next answer",
      closingTitle: "Start with one scored attempt, not another study plan.",
      closingBody:
        "Create a free account, finish a real prompt, and decide from your own feedback whether SpeakAce fits.",
      closingPrimary: "Practice for free",
      closingSecondary: "Compare plans",
    },
    teachers: {
      eyebrow: "For IELTS and TOEFL teachers",
      title: "See the practice that happens between lessons.",
      body: "Create a class, assign focused work, and open the next lesson already knowing who practiced and where each learner is stuck.",
      primary: "Create a teacher account",
      secondary: "Explore the demo class",
      signals: [
        "One join code per class",
        "No student spreadsheets",
        "Homework and results stay connected",
      ],
      outcomesEyebrow: "Teach from evidence",
      outcomesTitle: "Less chasing. Better lesson decisions.",
      outcomesBody:
        "SpeakAce collects the practice trail automatically, so your attention stays on feedback and instruction rather than administration.",
      outcomes: [
        {
          title: "Know who needs you first",
          body: "Spot overdue work, weak skills, and inactive learners before class begins.",
        },
        {
          title: "Assign work with context",
          body: "Send a prompt with a due date and keep the attempt attached to the learner.",
        },
        {
          title: "Keep the whole class aligned",
          body: "Share study lists and announcements without scattering the conversation across tools.",
        },
      ],
      workflowEyebrow: "Teacher workflow",
      workflowTitle: "From class setup to next-lesson insight.",
      workflow: [
        {
          title: "Create and invite",
          body: "Open a class and share its short join code with your learners.",
        },
        {
          title: "Assign and observe",
          body: "Set the task once; progress and scores appear as students complete it.",
        },
        {
          title: "Teach the real gap",
          body: "Use the class pulse to choose the right follow-up for the next lesson.",
        },
      ],
      leadEyebrow: "Teacher walkthrough",
      leadTitle: "See the complete class workflow.",
      leadBody:
        "Leave your email for a focused walkthrough of setup, homework, progress, and learner follow-up.",
      closingEyebrow: "First class",
      closingTitle: "Build the class before your next lesson.",
      closingBody:
        "Start free, invite a small group, and judge the workflow with real learner activity.",
      closingPrimary: "Open teacher tools",
      closingSecondary: "View demo class",
    },
    schools: {
      eyebrow: "For language schools and programmes",
      title: "Pilot one cohort before you scale the whole programme.",
      body: "Give learners a consistent practice space, teachers a usable class workflow, and coordinators a clear view of adoption.",
      primary: "Request a focused demo",
      secondary: "See the pilot plans",
      signals: [
        "Browser based",
        "Separate student and staff roles",
        "Start with a small cohort",
      ],
      outcomesEyebrow: "A rollout people can understand",
      outcomesTitle:
        "One product story for learners, teachers, and coordinators.",
      outcomesBody:
        "A clear role-based system makes a pilot easier to run, evaluate, and explain internally.",
      outcomes: [
        {
          title: "A learner experience people adopt",
          body: "Focused daily tasks make the platform useful before any reporting conversation begins.",
        },
        {
          title: "A teacher workflow that stays light",
          body: "Classes, homework, and progress live together without adding another reporting routine.",
        },
        {
          title: "Evidence for the rollout decision",
          body: "Review activity by cohort and expand only when the pilot earns it.",
        },
      ],
      workflowEyebrow: "Pilot path",
      workflowTitle: "A smaller first commitment, with a clear decision point.",
      workflow: [
        {
          title: "Choose one cohort",
          body: "Agree on the learners, teacher, and practice objective for the pilot.",
        },
        {
          title: "Run the real workflow",
          body: "Learners practice while teachers use the same tools they would after rollout.",
        },
        {
          title: "Review and decide",
          body: "Use adoption and class activity to decide whether and where to expand.",
        },
      ],
      leadEyebrow: "Programme demo",
      leadTitle: "Show us the cohort you want to improve.",
      leadBody:
        "We will focus the walkthrough on your programme size, teaching workflow, and pilot decision.",
      closingEyebrow: "Start smaller",
      closingTitle: "A useful pilot beats a long procurement deck.",
      closingBody:
        "See the platform, choose a cohort, and test the workflow before making a wider commitment.",
      closingPrimary: "Request the demo",
      closingSecondary: "Explore teacher view",
    },
  },
  tr: {
    students: {
      eyebrow: "Bireysel öğrenciler için",
      title: "Bir sonraki cevaptan önce neyi düzeltmen gerektiğini bil.",
      body: "SpeakAce, IELTS ve TOEFL pratiğini net bir döngüye çevirir: cevapla, kanıtı gör, tek bir beceriyi geliştir ve yeniden dene.",
      primary: "Ücretsiz pratiğe başla",
      secondary: "Planları gör",
      signals: [
        "Başlamak için kart gerekmez",
        "Konuşma ve yazma tek yerde",
        "Geçmişin düzenli kalır",
      ],
      outcomesEyebrow: "Daha sakin gelişim",
      outcomesTitle: "Her çalışma tek soruyu cevaplamalı: sırada ne var?",
      outcomesBody:
        "Skor, transkript, geri bildirim ve sonraki pratik aynı yerde kalır; karar vermeye değil gelişmeye zaman ayırırsın.",
      outcomes: [
        {
          title: "Cevabına bağlı geri bildirim",
          body: "Skorun neden değiştiğini tahmin etmek yerine transkript ve beceri analizini birlikte gör.",
        },
        {
          title: "Birbirini tamamlayan pratik",
          body: "Aynı soruyu yeniden dene, cevapları karşılaştır ve güçlü olanı inceleme için sakla.",
        },
        {
          title: "Konuşma ve yazmada tek ritim",
          body: "Çalışma sistemini yeniden kurmadan iki IELTS becerisi arasında geçiş yap.",
        },
      ],
      workflowEyebrow: "Günlük döngü",
      workflowTitle: "On odaklı dakika bile düzenli olabilir.",
      workflow: [
        {
          title: "Tek bir görev seç",
          body: "Geliştirmek istediğin beceriye uygun gerçek bir soru aç.",
        },
        {
          title: "Somut kanıtı gör",
          body: "Skorunu, transkriptini ve en önemli gelişim alanını incele.",
        },
        {
          title: "Tek hedefle yeniden dene",
          body: "Geri bildirimi hemen uygula ve daha güçlü cevabı kaydet.",
        },
      ],
      leadEyebrow: "Çalışma notları",
      leadTitle: "İlk hafta konuşma kontrol listesini al.",
      leadBody:
        "Abonelikten önce düzen kurmak isteyen öğrenciler için kısa bir pratik planı.",
      closingEyebrow: "Sıradaki cevabın",
      closingTitle:
        "Yeni bir çalışma planıyla değil, puanlanan bir cevapla başla.",
      closingBody:
        "Ücretsiz hesabını aç, gerçek bir soruyu tamamla ve SpeakAce'in sana uygun olup olmadığına kendi geri bildiriminle karar ver.",
      closingPrimary: "Ücretsiz pratik yap",
      closingSecondary: "Planları karşılaştır",
    },
    teachers: {
      eyebrow: "IELTS ve TOEFL öğretmenleri için",
      title: "Dersler arasında yapılan pratiği gerçekten gör.",
      body: "Sınıfını kur, odaklı ödev ver ve sonraki derse kimin çalıştığını, kimin nerede zorlandığını bilerek gir.",
      primary: "Öğretmen hesabı oluştur",
      secondary: "Demo sınıfı incele",
      signals: [
        "Her sınıfa tek katılım kodu",
        "Öğrenci tablosu gerekmez",
        "Ödev ve sonuçlar bağlantılı kalır",
      ],
      outcomesEyebrow: "Kanıtla öğret",
      outcomesTitle: "Daha az takip, daha iyi ders kararları.",
      outcomesBody:
        "SpeakAce pratik geçmişini otomatik toplar; zamanın yönetime değil geri bildirime ve öğretime kalır.",
      outcomes: [
        {
          title: "Önce kimin desteğe ihtiyacı olduğunu bil",
          body: "Ders başlamadan geciken ödevleri, zayıf becerileri ve pasif öğrencileri gör.",
        },
        {
          title: "Bağlamı olan ödev ver",
          body: "Soruyu tarih ile gönder ve tamamlanan denemeyi öğrencinin akışında tut.",
        },
        {
          title: "Tüm sınıfı aynı hizada tut",
          body: "Çalışma listeleri ve duyuruları farklı araçlara dağıtmadan paylaş.",
        },
      ],
      workflowEyebrow: "Öğretmen akışı",
      workflowTitle: "Sınıf kurulumundan sonraki ders içgörüsüne.",
      workflow: [
        {
          title: "Oluştur ve davet et",
          body: "Sınıfı aç, kısa katılım kodunu öğrencilerinle paylaş.",
        },
        {
          title: "Ata ve izle",
          body: "Görevi bir kez ver; öğrenciler tamamladıkça ilerleme ve skorlar gelsin.",
        },
        {
          title: "Gerçek açığı çalış",
          body: "Sınıf nabzını kullanarak sonraki dersin doğru odağını seç.",
        },
      ],
      leadEyebrow: "Öğretmen turu",
      leadTitle: "Eksiksiz sınıf akışını gör.",
      leadBody:
        "Kurulum, ödev, ilerleme ve öğrenci takibini anlatan odaklı tur için e-postanı bırak.",
      closingEyebrow: "İlk sınıf",
      closingTitle: "Sonraki dersinden önce sınıfı kur.",
      closingBody:
        "Ücretsiz başla, küçük bir grup davet et ve sistemi gerçek öğrenci aktivitesiyle değerlendir.",
      closingPrimary: "Öğretmen araçlarını aç",
      closingSecondary: "Demo sınıfı gör",
    },
    schools: {
      eyebrow: "Dil okulları ve programlar için",
      title: "Tüm programa yaymadan önce tek bir grupla pilot yap.",
      body: "Öğrencilere tutarlı pratik alanı, öğretmenlere kullanılabilir sınıf akışı, koordinatörlere benimsemeyi gösteren net bir görünüm ver.",
      primary: "Odaklı demo iste",
      secondary: "Pilot planlarını gör",
      signals: [
        "Tarayıcı tabanlı",
        "Öğrenci ve ekip rolleri ayrı",
        "Küçük bir grupla başla",
      ],
      outcomesEyebrow: "Anlaşılır bir yayılım",
      outcomesTitle: "Öğrenci, öğretmen ve koordinatör için tek ürün hikayesi.",
      outcomesBody:
        "Net rol sistemi, pilotu yürütmeyi, değerlendirmeyi ve kurum içinde anlatmayı kolaylaştırır.",
      outcomes: [
        {
          title: "Benimsenen öğrenci deneyimi",
          body: "Odaklı günlük görevler, raporlama konuşmasından önce ürünü öğrenci için faydalı yapar.",
        },
        {
          title: "Hafif kalan öğretmen akışı",
          body: "Sınıflar, ödevler ve ilerleme yeni bir raporlama rutini eklemeden birlikte kalır.",
        },
        {
          title: "Yayılım kararı için kanıt",
          body: "Aktiviteyi grup bazında incele ve yalnız pilot bunu hak ettiğinde genişle.",
        },
      ],
      workflowEyebrow: "Pilot yolu",
      workflowTitle: "Daha küçük ilk taahhüt, net bir karar noktası.",
      workflow: [
        {
          title: "Tek bir grup seç",
          body: "Pilot için öğrenciyi, öğretmeni ve pratik hedefini belirle.",
        },
        {
          title: "Gerçek akışı çalıştır",
          body: "Öğrenciler pratik yaparken öğretmenler yayılım sonrası kullanacağı araçları kullansın.",
        },
        {
          title: "İncele ve karar ver",
          body: "Nerede genişleyeceğine aktivite ve kullanım verisiyle karar ver.",
        },
      ],
      leadEyebrow: "Program demosu",
      leadTitle: "Geliştirmek istediğiniz grubu bize anlatın.",
      leadBody:
        "Turu program büyüklüğünüze, öğretim akışınıza ve pilot kararınıza göre odaklayalım.",
      closingEyebrow: "Küçük başlayın",
      closingTitle: "Faydalı bir pilot, uzun bir satın alma sunumundan iyidir.",
      closingBody:
        "Platformu görün, bir grup seçin ve geniş kapsamlı taahhütten önce iş akışını test edin.",
      closingPrimary: "Demo iste",
      closingSecondary: "Öğretmen görünümünü incele",
    },
  },
  de: {
    students: {
      eyebrow: "Für selbstständige Lernende",
      title: "Wisse vor der nächsten Antwort, was du verbessern musst.",
      body: "SpeakAce macht IELTS- und TOEFL-Training zu einem klaren Ablauf: antworten, Belege sehen, eine Fähigkeit verbessern, erneut versuchen.",
      primary: "Kostenlos üben",
      secondary: "Tarife ansehen",
      signals: [
        "Keine Kreditkarte zum Start",
        "Sprechen und Schreiben an einem Ort",
        "Dein Verlauf bleibt geordnet",
      ],
      outcomesEyebrow: "Ruhiger verbessern",
      outcomesTitle:
        "Jede Einheit sollte eine Frage beantworten: Was kommt als Nächstes?",
      outcomesBody:
        "Punktzahl, Transkript, Feedback und nächste Übung bleiben zusammen.",
      outcomes: [
        {
          title: "Feedback zu deiner Antwort",
          body: "Sieh Transkript und Kompetenzanalyse zusammen, statt die Punktzahl zu erraten.",
        },
        {
          title: "Training, das aufbaut",
          body: "Wiederhole Aufgaben, vergleiche Versuche und speichere die stärkere Antwort.",
        },
        {
          title: "Ein Rhythmus für Sprechen und Schreiben",
          body: "Wechsle zwischen IELTS-Fähigkeiten, ohne dein System neu zu bauen.",
        },
      ],
      workflowEyebrow: "Täglicher Ablauf",
      workflowTitle: "Zehn fokussierte Minuten können strukturiert sein.",
      workflow: [
        {
          title: "Eine Aufgabe wählen",
          body: "Öffne eine echte Frage für deine Zielfähigkeit.",
        },
        {
          title: "Konkrete Belege sehen",
          body: "Prüfe Punktzahl, Transkript und wichtigsten Fokus.",
        },
        {
          title: "Mit einem Ziel wiederholen",
          body: "Wende das Feedback direkt an.",
        },
      ],
      leadEyebrow: "Lernnotizen",
      leadTitle: "Erhalte die Checkliste für Woche eins.",
      leadBody: "Ein kurzer Plan für Lernende, die zuerst Struktur möchten.",
      closingEyebrow: "Deine nächste Antwort",
      closingTitle:
        "Starte mit einem bewerteten Versuch, nicht mit einem weiteren Plan.",
      closingBody:
        "Erstelle ein kostenloses Konto und entscheide anhand deines eigenen Feedbacks.",
      closingPrimary: "Kostenlos üben",
      closingSecondary: "Tarife vergleichen",
    },
    teachers: {
      eyebrow: "Für IELTS- und TOEFL-Lehrkräfte",
      title: "Sieh das Training zwischen den Unterrichtsstunden.",
      body: "Erstelle eine Klasse, weise gezielte Aufgaben zu und starte die nächste Stunde mit einem klaren Bild.",
      primary: "Lehrerkonto erstellen",
      secondary: "Demo-Klasse ansehen",
      signals: [
        "Ein Beitrittscode pro Klasse",
        "Keine Schülertabellen",
        "Aufgaben und Ergebnisse verbunden",
      ],
      outcomesEyebrow: "Mit Belegen unterrichten",
      outcomesTitle: "Weniger Nachfassen. Bessere Unterrichtsentscheidungen.",
      outcomesBody: "SpeakAce sammelt den Übungsverlauf automatisch.",
      outcomes: [
        {
          title: "Prioritäten sofort erkennen",
          body: "Fällige Aufgaben, schwache Fähigkeiten und inaktive Lernende vor dem Unterricht sehen.",
        },
        {
          title: "Aufgaben mit Kontext",
          body: "Aufgabe und Ergebnis bleiben beim Lernenden verbunden.",
        },
        {
          title: "Die Klasse ausrichten",
          body: "Listen und Mitteilungen ohne verstreute Tools teilen.",
        },
      ],
      workflowEyebrow: "Lehrerablauf",
      workflowTitle:
        "Von der Einrichtung zur nächsten Unterrichtsentscheidung.",
      workflow: [
        {
          title: "Erstellen und einladen",
          body: "Klasse öffnen und kurzen Code teilen.",
        },
        {
          title: "Zuweisen und beobachten",
          body: "Aufgabe einmal setzen; Fortschritt erscheint automatisch.",
        },
        {
          title: "Die echte Lücke trainieren",
          body: "Den Klassenpuls für die nächste Stunde nutzen.",
        },
      ],
      leadEyebrow: "Lehrer-Rundgang",
      leadTitle: "Sieh den kompletten Klassenablauf.",
      leadBody:
        "Ein fokussierter Rundgang durch Einrichtung, Aufgaben und Fortschritt.",
      closingEyebrow: "Erste Klasse",
      closingTitle: "Richte die Klasse vor der nächsten Stunde ein.",
      closingBody:
        "Starte kostenlos und teste den Ablauf mit echter Aktivität.",
      closingPrimary: "Lehrer-Tools öffnen",
      closingSecondary: "Demo-Klasse ansehen",
    },
    schools: {
      eyebrow: "Für Sprachschulen und Programme",
      title: "Teste eine Kohorte, bevor du das ganze Programm ausrollst.",
      body: "Ein konsistenter Übungsraum für Lernende, ein leichter Ablauf für Lehrkräfte und klare Nutzung für Koordinatoren.",
      primary: "Fokussierte Demo anfragen",
      secondary: "Pilot-Tarife ansehen",
      signals: [
        "Browserbasiert",
        "Getrennte Rollen",
        "Mit einer kleinen Kohorte starten",
      ],
      outcomesEyebrow: "Verständlicher Rollout",
      outcomesTitle:
        "Eine Produktgeschichte für Lernende, Lehrkräfte und Koordination.",
      outcomesBody:
        "Klare Rollen erleichtern Pilot, Bewertung und interne Abstimmung.",
      outcomes: [
        {
          title: "Nutzbare Lernerfahrung",
          body: "Fokussierte tägliche Aufgaben schaffen zuerst echten Lernwert.",
        },
        {
          title: "Leichter Lehrerablauf",
          body: "Klassen, Aufgaben und Fortschritt bleiben ohne Zusatzberichte zusammen.",
        },
        {
          title: "Belege für die Entscheidung",
          body: "Aktivität je Kohorte prüfen und nur dann erweitern.",
        },
      ],
      workflowEyebrow: "Pilotweg",
      workflowTitle: "Kleiner Start mit klarem Entscheidungspunkt.",
      workflow: [
        {
          title: "Eine Kohorte wählen",
          body: "Lernende, Lehrkraft und Ziel definieren.",
        },
        {
          title: "Den echten Ablauf testen",
          body: "Alle Rollen nutzen die spätere Arbeitsweise.",
        },
        {
          title: "Prüfen und entscheiden",
          body: "Auf Basis der Aktivität erweitern.",
        },
      ],
      leadEyebrow: "Programm-Demo",
      leadTitle: "Zeig uns die Kohorte, die du verbessern willst.",
      leadBody:
        "Wir richten den Rundgang auf Größe, Ablauf und Pilotentscheidung aus.",
      closingEyebrow: "Kleiner starten",
      closingTitle:
        "Ein nützlicher Pilot ist besser als ein langes Beschaffungsdeck.",
      closingBody:
        "Plattform ansehen, Kohorte wählen und vor dem Rollout testen.",
      closingPrimary: "Demo anfragen",
      closingSecondary: "Lehreransicht ansehen",
    },
  },
  es: {
    students: {
      eyebrow: "Para estudiantes independientes",
      title: "Sabe qué corregir antes de tu próxima respuesta.",
      body: "SpeakAce convierte la práctica de IELTS y TOEFL en un ciclo claro: responde, revisa la evidencia, mejora una habilidad y repite.",
      primary: "Practicar gratis",
      secondary: "Ver planes",
      signals: [
        "Sin tarjeta para empezar",
        "Speaking y writing en un lugar",
        "Tu historial organizado",
      ],
      outcomesEyebrow: "Mejorar con calma",
      outcomesTitle: "Cada sesión debe responder: ¿qué sigue?",
      outcomesBody:
        "Puntuación, transcripción, feedback y próxima práctica permanecen juntos.",
      outcomes: [
        {
          title: "Feedback ligado a tu respuesta",
          body: "Lee la transcripción junto al análisis de habilidades.",
        },
        {
          title: "Práctica que se acumula",
          body: "Repite, compara intentos y guarda la mejor respuesta.",
        },
        {
          title: "Un ritmo para speaking y writing",
          body: "Cambia de habilidad sin reconstruir tu sistema.",
        },
      ],
      workflowEyebrow: "Ciclo diario",
      workflowTitle: "Diez minutos enfocados también pueden tener estructura.",
      workflow: [
        {
          title: "Elige una tarea",
          body: "Abre una pregunta real para la habilidad objetivo.",
        },
        {
          title: "Revisa la evidencia",
          body: "Mira puntuación, transcripción y foco principal.",
        },
        {
          title: "Repite con un objetivo",
          body: "Aplica el feedback de inmediato.",
        },
      ],
      leadEyebrow: "Notas de estudio",
      leadTitle: "Recibe la lista de la primera semana.",
      leadBody: "Un plan breve para empezar con estructura.",
      closingEyebrow: "Tu próxima respuesta",
      closingTitle: "Empieza con un intento evaluado, no con otro plan.",
      closingBody: "Crea una cuenta gratis y decide con tu propio feedback.",
      closingPrimary: "Practicar gratis",
      closingSecondary: "Comparar planes",
    },
    teachers: {
      eyebrow: "Para profesores de IELTS y TOEFL",
      title: "Ve la práctica que ocurre entre clases.",
      body: "Crea una clase, asigna trabajo enfocado y llega a la siguiente sesión sabiendo quién practicó y dónde necesita ayuda.",
      primary: "Crear cuenta de profesor",
      secondary: "Explorar clase demo",
      signals: [
        "Un código por clase",
        "Sin hojas de alumnos",
        "Tareas y resultados conectados",
      ],
      outcomesEyebrow: "Enseña con evidencia",
      outcomesTitle: "Menos seguimiento. Mejores decisiones.",
      outcomesBody:
        "SpeakAce reúne la práctica automáticamente para que enseñes en lugar de administrar.",
      outcomes: [
        {
          title: "Prioriza al instante",
          body: "Detecta tareas pendientes, habilidades débiles y alumnos inactivos.",
        },
        {
          title: "Tareas con contexto",
          body: "La tarea y el intento permanecen conectados al alumno.",
        },
        {
          title: "Toda la clase alineada",
          body: "Comparte listas y avisos sin dispersar el trabajo.",
        },
      ],
      workflowEyebrow: "Flujo docente",
      workflowTitle: "De crear la clase a decidir la próxima lección.",
      workflow: [
        {
          title: "Crea e invita",
          body: "Abre una clase y comparte el código.",
        },
        {
          title: "Asigna y observa",
          body: "Define la tarea una vez; el progreso aparece solo.",
        },
        {
          title: "Enseña la brecha real",
          body: "Usa el pulso para enfocar la próxima clase.",
        },
      ],
      leadEyebrow: "Tour docente",
      leadTitle: "Mira el flujo completo de la clase.",
      leadBody: "Un recorrido enfocado por configuración, tareas y progreso.",
      closingEyebrow: "Primera clase",
      closingTitle: "Configúrala antes de tu próxima lección.",
      closingBody: "Empieza gratis y prueba el flujo con actividad real.",
      closingPrimary: "Abrir herramientas",
      closingSecondary: "Ver clase demo",
    },
    schools: {
      eyebrow: "Para escuelas y programas",
      title: "Prueba con un grupo antes de escalar todo el programa.",
      body: "Una experiencia coherente para alumnos, un flujo ligero para profesores y visibilidad clara para coordinadores.",
      primary: "Solicitar demo enfocada",
      secondary: "Ver planes piloto",
      signals: [
        "En el navegador",
        "Roles separados",
        "Empieza con un grupo pequeño",
      ],
      outcomesEyebrow: "Despliegue comprensible",
      outcomesTitle:
        "Una historia de producto para alumnos, docentes y coordinación.",
      outcomesBody:
        "Los roles claros facilitan ejecutar, evaluar y explicar el piloto.",
      outcomes: [
        {
          title: "Experiencia que se adopta",
          body: "Las tareas diarias crean valor real para el alumno.",
        },
        {
          title: "Flujo docente ligero",
          body: "Clases, tareas y progreso juntos sin informes extra.",
        },
        {
          title: "Evidencia para decidir",
          body: "Revisa actividad por grupo y amplía solo cuando funcione.",
        },
      ],
      workflowEyebrow: "Ruta piloto",
      workflowTitle: "Un primer compromiso menor y un punto de decisión claro.",
      workflow: [
        {
          title: "Elige un grupo",
          body: "Define alumnos, profesor y objetivo.",
        },
        {
          title: "Ejecuta el flujo real",
          body: "Todos usan la forma de trabajo final.",
        },
        { title: "Revisa y decide", body: "Amplía según la actividad real." },
      ],
      leadEyebrow: "Demo de programa",
      leadTitle: "Cuéntanos qué grupo quieres mejorar.",
      leadBody: "Enfocaremos el recorrido en tamaño, flujo y decisión piloto.",
      closingEyebrow: "Empieza pequeño",
      closingTitle: "Un piloto útil supera una larga presentación.",
      closingBody: "Mira la plataforma y prueba el flujo antes de escalar.",
      closingPrimary: "Solicitar demo",
      closingSecondary: "Ver experiencia docente",
    },
  },
  fr: {
    students: {
      eyebrow: "Pour les candidats autonomes",
      title: "Sache quoi corriger avant ta prochaine réponse.",
      body: "SpeakAce transforme l’entraînement IELTS et TOEFL en boucle claire : répondre, voir les preuves, améliorer une compétence, recommencer.",
      primary: "Commencer gratuitement",
      secondary: "Voir les offres",
      signals: [
        "Aucune carte au départ",
        "Oral et écrit au même endroit",
        "Historique bien organisé",
      ],
      outcomesEyebrow: "Progresser sereinement",
      outcomesTitle: "Chaque session doit répondre : quelle est la suite ?",
      outcomesBody:
        "Score, transcription, feedback et prochain exercice restent réunis.",
      outcomes: [
        {
          title: "Feedback lié à ta réponse",
          body: "Lis la transcription avec l’analyse des compétences.",
        },
        {
          title: "Une pratique qui s’accumule",
          body: "Refais, compare et garde la meilleure réponse.",
        },
        {
          title: "Un rythme pour l’oral et l’écrit",
          body: "Change de compétence sans reconstruire ton système.",
        },
      ],
      workflowEyebrow: "Boucle quotidienne",
      workflowTitle: "Dix minutes ciblées peuvent être structurées.",
      workflow: [
        {
          title: "Choisir une tâche",
          body: "Ouvre une vraie question pour la compétence visée.",
        },
        {
          title: "Voir les preuves",
          body: "Vérifie score, transcription et priorité.",
        },
        {
          title: "Refaire avec un objectif",
          body: "Applique immédiatement le feedback.",
        },
      ],
      leadEyebrow: "Notes d’étude",
      leadTitle: "Reçois la checklist de la première semaine.",
      leadBody: "Un plan court pour commencer avec une structure.",
      closingEyebrow: "Ta prochaine réponse",
      closingTitle: "Commence par une réponse notée, pas un autre plan.",
      closingBody: "Crée un compte gratuit et décide avec ton propre feedback.",
      closingPrimary: "Pratiquer gratuitement",
      closingSecondary: "Comparer les offres",
    },
    teachers: {
      eyebrow: "Pour les enseignants IELTS et TOEFL",
      title: "Voyez la pratique réalisée entre les cours.",
      body: "Créez une classe, assignez un travail ciblé et commencez le prochain cours en sachant qui a pratiqué et où aider.",
      primary: "Créer un compte enseignant",
      secondary: "Explorer la classe démo",
      signals: [
        "Un code par classe",
        "Aucun tableau d’élèves",
        "Devoirs et résultats reliés",
      ],
      outcomesEyebrow: "Enseigner avec des preuves",
      outcomesTitle: "Moins de relances. De meilleures décisions.",
      outcomesBody:
        "SpeakAce rassemble automatiquement la pratique pour préserver le temps d’enseignement.",
      outcomes: [
        {
          title: "Prioriser immédiatement",
          body: "Repérez les devoirs dus, compétences faibles et élèves inactifs.",
        },
        {
          title: "Des devoirs avec contexte",
          body: "La tâche et la tentative restent liées à l’élève.",
        },
        {
          title: "Aligner toute la classe",
          body: "Partagez listes et annonces sans disperser le travail.",
        },
      ],
      workflowEyebrow: "Flux enseignant",
      workflowTitle: "De la création à la prochaine décision pédagogique.",
      workflow: [
        {
          title: "Créer et inviter",
          body: "Ouvrez la classe et partagez le code.",
        },
        {
          title: "Assigner et observer",
          body: "Définissez la tâche; le progrès apparaît automatiquement.",
        },
        {
          title: "Travailler le vrai besoin",
          body: "Utilisez le pouls pour préparer le cours suivant.",
        },
      ],
      leadEyebrow: "Visite enseignant",
      leadTitle: "Découvrez le flux complet de la classe.",
      leadBody:
        "Une visite ciblée sur la configuration, les devoirs et le progrès.",
      closingEyebrow: "Première classe",
      closingTitle: "Préparez-la avant votre prochain cours.",
      closingBody: "Commencez gratuitement et testez avec une activité réelle.",
      closingPrimary: "Ouvrir les outils",
      closingSecondary: "Voir la classe démo",
    },
    schools: {
      eyebrow: "Pour les écoles et programmes",
      title: "Pilotez un groupe avant de déployer tout le programme.",
      body: "Un espace cohérent pour les élèves, un flux léger pour les enseignants et une adoption visible pour la coordination.",
      primary: "Demander une démo ciblée",
      secondary: "Voir les offres pilote",
      signals: [
        "Dans le navigateur",
        "Rôles séparés",
        "Commencer avec un petit groupe",
      ],
      outcomesEyebrow: "Déploiement compréhensible",
      outcomesTitle:
        "Un même produit pour élèves, enseignants et coordination.",
      outcomesBody:
        "Des rôles clairs facilitent le pilote, son évaluation et son explication interne.",
      outcomes: [
        {
          title: "Une expérience adoptée",
          body: "Les tâches quotidiennes créent d’abord une vraie valeur d’apprentissage.",
        },
        {
          title: "Un flux enseignant léger",
          body: "Classes, devoirs et progrès réunis sans rapport supplémentaire.",
        },
        {
          title: "Des preuves pour décider",
          body: "Analysez par groupe et élargissez uniquement si le pilote fonctionne.",
        },
      ],
      workflowEyebrow: "Parcours pilote",
      workflowTitle:
        "Un premier engagement plus petit, avec un point de décision clair.",
      workflow: [
        {
          title: "Choisir un groupe",
          body: "Définir élèves, enseignant et objectif.",
        },
        {
          title: "Tester le flux réel",
          body: "Chaque rôle utilise le futur mode de travail.",
        },
        {
          title: "Analyser et décider",
          body: "Élargir selon l’activité réelle.",
        },
      ],
      leadEyebrow: "Démo programme",
      leadTitle: "Présentez-nous le groupe à améliorer.",
      leadBody:
        "Nous adapterons la visite à votre taille, flux et décision pilote.",
      closingEyebrow: "Commencer petit",
      closingTitle: "Un pilote utile vaut mieux qu’un long dossier.",
      closingBody: "Découvrez la plateforme et testez avant de déployer.",
      closingPrimary: "Demander la démo",
      closingSecondary: "Voir l’espace enseignant",
    },
  },
};

export const programNavigation: Record<
  PublicLanguage,
  {
    label: string;
    students: string;
    teachers: string;
    schools: string;
  }
> = {
  en: {
    label: "Choose your path",
    students: "For students",
    teachers: "For teachers",
    schools: "For schools",
  },
  tr: {
    label: "Yolunu seç",
    students: "Öğrenciler için",
    teachers: "Öğretmenler için",
    schools: "Kurumlar için",
  },
  de: {
    label: "Wähle deinen Weg",
    students: "Für Lernende",
    teachers: "Für Lehrkräfte",
    schools: "Für Schulen",
  },
  es: {
    label: "Elige tu ruta",
    students: "Para estudiantes",
    teachers: "Para profesores",
    schools: "Para escuelas",
  },
  fr: {
    label: "Choisissez votre parcours",
    students: "Pour les étudiants",
    teachers: "Pour les enseignants",
    schools: "Pour les écoles",
  },
};
