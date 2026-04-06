"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { useAppState } from "@/components/providers";
import { buildPlanCheckoutPath } from "@/lib/commerce";
import { copy } from "@/lib/copy";

const footerCopy = {
  en: {
    eyebrow: "SpeakAce AI",
    title: "A calmer, clearer place to practice IELTS and TOEFL speaking.",
    description: "Built around speaking practice, transcript review, and a calmer daily study rhythm.",
    startPractice: "Start practice",
    unlockPlus: "Unlock Plus",
    product: "Product",
    productHint: "Practice and account flow",
    resources: "Resources",
    resourcesHint: "Free entry points and study guides",
    programs: "Programs",
    programsHint: "Student, teacher, and school views",
    company: "Company",
    companyHint: "Brand story and trust pages",
    practice: "Practice",
    freeTest: "Free test",
    dailyPrompt: "Daily prompt",
    weeklyChallenge: "Weekly challenge",
    tools: "Tools",
    compare: "Compare",
    guides: "Guides",
    reviews: "Reviews",
    caseStudies: "Case studies",
    about: "About",
    contact: "Contact",
    privacy: "Privacy Policy",
    terms: "Terms of Use",
    schools: "For schools",
    teachers: "For teachers",
    successStories: "Success stories",
    summary: "SpeakAce AI · A next-generation study space for IELTS and TOEFL speaking"
  },
  tr: {
    eyebrow: "SpeakAce AI",
    title: "IELTS ve TOEFL speaking pratiği için daha sakin ve net bir çalışma alanı.",
    description: "Speaking practice akışı, transcript incelemesi ve düzenli çalışma ritmiyle daha güçlü günlük gelişim.",
    startPractice: "Practice başlat",
    unlockPlus: "Plus aç",
    product: "Ürün",
    productHint: "Pratik ve hesap akışı",
    resources: "Kaynaklar",
    resourcesHint: "Ücretsiz giriş noktaları ve rehberler",
    programs: "Programlar",
    programsHint: "Öğrenci, öğretmen ve okul tarafı",
    company: "Şirket",
    companyHint: "Marka ve güven sayfaları",
    practice: "Pratik",
    freeTest: "Ücretsiz test",
    dailyPrompt: "Günlük prompt",
    weeklyChallenge: "Haftalık challenge",
    tools: "Araçlar",
    compare: "Karşılaştır",
    guides: "Rehberler",
    reviews: "Yorumlar",
    caseStudies: "Örnekler",
    about: "Hakkımızda",
    contact: "İletişim",
    privacy: "Gizlilik",
    terms: "Kullanım Koşulları",
    schools: "Kurumlar için",
    teachers: "Öğretmenler için",
    successStories: "Başarı hikayeleri",
    summary: "SpeakAce AI · IELTS ve TOEFL speaking için yeni nesil çalışma alanı"
  },
  de: {
    eyebrow: "SpeakAce AI",
    title: "Ein ruhigerer, klarerer Ort zum Üben von IELTS- und TOEFL-Speaking.",
    description: "Gebaut rund um Sprechtraining, Transkript-Review und einen ruhigeren täglichen Lernrhythmus.",
    startPractice: "Jetzt üben",
    unlockPlus: "Plus freischalten",
    product: "Produkt",
    productHint: "Übung und Konto",
    resources: "Ressourcen",
    resourcesHint: "Kostenlose Einstiege und Leitfäden",
    programs: "Programme",
    programsHint: "Ansichten für Lernende, Lehrkräfte und Schulen",
    company: "Unternehmen",
    companyHint: "Marke und Vertrauensseiten",
    practice: "Üben",
    freeTest: "Gratis-Test",
    dailyPrompt: "Täglicher Prompt",
    weeklyChallenge: "Wochen-Challenge",
    tools: "Tools",
    compare: "Vergleichen",
    guides: "Leitfäden",
    reviews: "Bewertungen",
    caseStudies: "Fallstudien",
    about: "Über uns",
    contact: "Kontakt",
    privacy: "Datenschutz",
    terms: "Nutzungsbedingungen",
    schools: "Für Schulen",
    teachers: "Für Lehrkräfte",
    successStories: "Erfolgsgeschichten",
    summary: "SpeakAce AI · Ein Lernraum der nächsten Generation für IELTS- und TOEFL-Speaking"
  },
  es: {
    eyebrow: "SpeakAce AI",
    title: "Un lugar más claro y más tranquilo para practicar speaking de IELTS y TOEFL.",
    description: "Creado alrededor de práctica oral, revisión del transcript y una rutina diaria más estable.",
    startPractice: "Empezar práctica",
    unlockPlus: "Desbloquear Plus",
    product: "Producto",
    productHint: "Práctica y cuenta",
    resources: "Recursos",
    resourcesHint: "Entradas gratis y guías",
    programs: "Programas",
    programsHint: "Vistas para estudiantes, profesores y escuelas",
    company: "Empresa",
    companyHint: "Marca y confianza",
    practice: "Practicar",
    freeTest: "Prueba gratis",
    dailyPrompt: "Prompt diario",
    weeklyChallenge: "Reto semanal",
    tools: "Herramientas",
    compare: "Comparar",
    guides: "Guías",
    reviews: "Opiniones",
    caseStudies: "Casos reales",
    about: "Nosotros",
    contact: "Contacto",
    privacy: "Privacidad",
    terms: "Términos de uso",
    schools: "Para escuelas",
    teachers: "Para profesores",
    successStories: "Historias de éxito",
    summary: "SpeakAce AI · Un espacio de estudio de nueva generación para IELTS y TOEFL speaking"
  },
  fr: {
    eyebrow: "SpeakAce AI",
    title: "Un espace plus calme et plus clair pour travailler le speaking IELTS et TOEFL.",
    description: "Pensé autour de la pratique orale, de la relecture du transcript et d’un rythme d’étude plus régulier.",
    startPractice: "Commencer",
    unlockPlus: "Débloquer Plus",
    product: "Produit",
    productHint: "Pratique et compte",
    resources: "Ressources",
    resourcesHint: "Entrées gratuites et guides",
    programs: "Programmes",
    programsHint: "Vues étudiant, enseignant et école",
    company: "Entreprise",
    companyHint: "Marque et confiance",
    practice: "Pratique",
    freeTest: "Test gratuit",
    dailyPrompt: "Prompt du jour",
    weeklyChallenge: "Challenge hebdo",
    tools: "Outils",
    compare: "Comparer",
    guides: "Guides",
    reviews: "Avis",
    caseStudies: "Études de cas",
    about: "À propos",
    contact: "Contact",
    privacy: "Confidentialité",
    terms: "Conditions d’utilisation",
    schools: "Pour les écoles",
    teachers: "Pour les enseignants",
    successStories: "Histoires de réussite",
    summary: "SpeakAce AI · Un espace d’étude nouvelle génération pour le speaking IELTS et TOEFL"
  },
  it: {
    eyebrow: "SpeakAce AI",
    title: "Uno spazio più chiaro e più calmo per praticare lo speaking IELTS e TOEFL.",
    description: "Progettato intorno alla pratica orale, alla revisione del transcript e a un ritmo di studio più ordinato.",
    startPractice: "Inizia pratica",
    unlockPlus: "Sblocca Plus",
    product: "Prodotto",
    productHint: "Pratica e account",
    resources: "Risorse",
    resourcesHint: "Ingressi gratuiti e guide",
    programs: "Programmi",
    programsHint: "Viste per studenti, docenti e scuole",
    company: "Azienda",
    companyHint: "Brand e fiducia",
    practice: "Pratica",
    freeTest: "Test gratuito",
    dailyPrompt: "Prompt del giorno",
    weeklyChallenge: "Sfida settimanale",
    tools: "Strumenti",
    compare: "Confronta",
    guides: "Guide",
    reviews: "Recensioni",
    caseStudies: "Casi studio",
    about: "Chi siamo",
    contact: "Contatti",
    privacy: "Privacy",
    terms: "Termini d’uso",
    schools: "Per scuole",
    teachers: "Per docenti",
    successStories: "Storie di successo",
    summary: "SpeakAce AI · Uno spazio di studio di nuova generazione per IELTS e TOEFL speaking"
  },
  pt: {
    eyebrow: "SpeakAce AI",
    title: "Um lugar mais calmo e mais claro para praticar speaking de IELTS e TOEFL.",
    description: "Criado em torno de prática oral, revisão do transcript e um ritmo diário de estudo mais estável.",
    startPractice: "Começar prática",
    unlockPlus: "Desbloquear Plus",
    product: "Produto",
    productHint: "Prática e conta",
    resources: "Recursos",
    resourcesHint: "Entradas grátis e guias",
    programs: "Programas",
    programsHint: "Visões para alunos, professores e escolas",
    company: "Empresa",
    companyHint: "Marca e confiança",
    practice: "Praticar",
    freeTest: "Teste grátis",
    dailyPrompt: "Prompt diário",
    weeklyChallenge: "Desafio semanal",
    tools: "Ferramentas",
    compare: "Comparar",
    guides: "Guias",
    reviews: "Avaliações",
    caseStudies: "Casos de uso",
    about: "Sobre",
    contact: "Contato",
    privacy: "Privacidade",
    terms: "Termos de uso",
    schools: "Para escolas",
    teachers: "Para professores",
    successStories: "Histórias de sucesso",
    summary: "SpeakAce AI · Um espaço de estudo de nova geração para IELTS e TOEFL speaking"
  },
  nl: {
    eyebrow: "SpeakAce AI",
    title: "Een rustigere en duidelijkere plek om IELTS en TOEFL speaking te oefenen.",
    description: "Gebouwd rond spreekoefening, transcriptcontrole en een rustiger dagelijks studieritme.",
    startPractice: "Start oefening",
    unlockPlus: "Ontgrendel Plus",
    product: "Product",
    productHint: "Oefenen en account",
    resources: "Bronnen",
    resourcesHint: "Gratis ingangen en gidsen",
    programs: "Programma's",
    programsHint: "Weergaven voor studenten, docenten en scholen",
    company: "Bedrijf",
    companyHint: "Merk en vertrouwen",
    practice: "Oefenen",
    freeTest: "Gratis test",
    dailyPrompt: "Dagelijkse prompt",
    weeklyChallenge: "Wekelijkse challenge",
    tools: "Tools",
    compare: "Vergelijken",
    guides: "Gidsen",
    reviews: "Reviews",
    caseStudies: "Praktijkvoorbeelden",
    about: "Over ons",
    contact: "Contact",
    privacy: "Privacy",
    terms: "Gebruiksvoorwaarden",
    schools: "Voor scholen",
    teachers: "Voor docenten",
    successStories: "Succesverhalen",
    summary: "SpeakAce AI · Een studieruimte van de nieuwe generatie voor IELTS en TOEFL speaking"
  },
  pl: {
    eyebrow: "SpeakAce AI",
    title: "Spokojniejsze i czytelniejsze miejsce do ćwiczenia speaking TOEFL i IELTS.",
    description: "Zbudowane wokół praktyki mówienia, przeglądu transkryptu i spokojniejszego rytmu codziennej nauki.",
    startPractice: "Zacznij ćwiczyć",
    unlockPlus: "Odblokuj Plus",
    product: "Produkt",
    productHint: "Ćwiczenia i konto",
    resources: "Materiały",
    resourcesHint: "Darmowe wejścia i przewodniki",
    programs: "Programy",
    programsHint: "Widoki dla uczniów, nauczycieli i szkół",
    company: "Firma",
    companyHint: "Marka i zaufanie",
    practice: "Ćwiczenia",
    freeTest: "Darmowy test",
    dailyPrompt: "Codzienny prompt",
    weeklyChallenge: "Wyzwanie tygodnia",
    tools: "Narzędzia",
    compare: "Porównaj",
    guides: "Przewodniki",
    reviews: "Opinie",
    caseStudies: "Studia przypadków",
    about: "O nas",
    contact: "Kontakt",
    privacy: "Prywatność",
    terms: "Warunki korzystania",
    schools: "Dla szkół",
    teachers: "Dla nauczycieli",
    successStories: "Historie sukcesu",
    summary: "SpeakAce AI · Nowoczesna przestrzeń do nauki TOEFL i IELTS speaking"
  },
  ru: {
    eyebrow: "SpeakAce AI",
    title: "Более спокойное и понятное место для практики TOEFL и IELTS speaking.",
    description: "Построено вокруг speaking practice, разбора transcript и более ровного ежедневного ритма обучения.",
    startPractice: "Начать практику",
    unlockPlus: "Открыть Plus",
    product: "Продукт",
    productHint: "Практика и аккаунт",
    resources: "Материалы",
    resourcesHint: "Бесплатные входы и гайды",
    programs: "Программы",
    programsHint: "Виды для студентов, преподавателей и школ",
    company: "Компания",
    companyHint: "Бренд и доверие",
    practice: "Практика",
    freeTest: "Бесплатный тест",
    dailyPrompt: "Ежедневный prompt",
    weeklyChallenge: "Недельный челлендж",
    tools: "Инструменты",
    compare: "Сравнить",
    guides: "Гайды",
    reviews: "Отзывы",
    caseStudies: "Кейсы",
    about: "О нас",
    contact: "Контакты",
    privacy: "Конфиденциальность",
    terms: "Условия использования",
    schools: "Для школ",
    teachers: "Для преподавателей",
    successStories: "Истории успеха",
    summary: "SpeakAce AI · Пространство нового поколения для TOEFL и IELTS speaking"
  },
  ar: {
    eyebrow: "SpeakAce AI",
    title: "مكان أكثر هدوءًا ووضوحًا للتدرّب على TOEFL وIELTS speaking.",
    description: "مبني حول ممارسة المحادثة ومراجعة النص وإيقاع دراسة يومي أكثر وضوحًا.",
    startPractice: "ابدأ التدريب",
    unlockPlus: "افتح Plus",
    product: "المنتج",
    productHint: "التدريب والحساب",
    resources: "المصادر",
    resourcesHint: "نقاط دخول مجانية وأدلة",
    programs: "البرامج",
    programsHint: "واجهات للطلاب والمعلمين والمدارس",
    company: "الشركة",
    companyHint: "العلامة والثقة",
    practice: "التدريب",
    freeTest: "اختبار مجاني",
    dailyPrompt: "مهمة يومية",
    weeklyChallenge: "تحدٍ أسبوعي",
    tools: "الأدوات",
    compare: "قارن",
    guides: "الأدلة",
    reviews: "التقييمات",
    caseStudies: "دراسات حالة",
    about: "من نحن",
    contact: "اتصل بنا",
    privacy: "الخصوصية",
    terms: "شروط الاستخدام",
    schools: "للمدارس",
    teachers: "للمعلمين",
    successStories: "قصص نجاح",
    summary: "SpeakAce AI · مساحة دراسة حديثة لـ TOEFL وIELTS speaking"
  },
  ja: {
    eyebrow: "SpeakAce AI",
    title: "IELTSとTOEFL speaking をもっと落ち着いて練習できる場所。",
    description: "スピーキング練習、transcript の見直し、そして穏やかな日々の学習リズムを中心に作られています。",
    startPractice: "練習を始める",
    unlockPlus: "Plusを開く",
    product: "製品",
    productHint: "練習とアカウント",
    resources: "リソース",
    resourcesHint: "無料の導線とガイド",
    programs: "プログラム",
    programsHint: "学生・教師・学校向けの導線",
    company: "会社",
    companyHint: "ブランドと信頼ページ",
    practice: "練習",
    freeTest: "無料テスト",
    dailyPrompt: "今日のプロンプト",
    weeklyChallenge: "週間チャレンジ",
    tools: "ツール",
    compare: "比較",
    guides: "ガイド",
    reviews: "レビュー",
    caseStudies: "事例",
    about: "About",
    contact: "お問い合わせ",
    privacy: "プライバシー",
    terms: "利用規約",
    schools: "学校向け",
    teachers: "教師向け",
    successStories: "成功事例",
    summary: "SpeakAce AI · IELTS と TOEFL speaking のための次世代学習スペース"
  },
  ko: {
    eyebrow: "SpeakAce AI",
    title: "IELTS와 TOEFL speaking을 더 차분하고 명확하게 연습하는 공간.",
    description: "스피킹 연습, transcript 검토, 더 안정적인 일일 학습 흐름을 중심으로 만들었습니다.",
    startPractice: "연습 시작",
    unlockPlus: "Plus 열기",
    product: "제품",
    productHint: "연습과 계정",
    resources: "리소스",
    resourcesHint: "무료 진입점과 가이드",
    programs: "프로그램",
    programsHint: "학생, 교사, 학교용 흐름",
    company: "회사",
    companyHint: "브랜드와 신뢰 페이지",
    practice: "연습",
    freeTest: "무료 테스트",
    dailyPrompt: "오늘의 프롬프트",
    weeklyChallenge: "주간 챌린지",
    tools: "도구",
    compare: "비교",
    guides: "가이드",
    reviews: "후기",
    caseStudies: "사례 연구",
    about: "소개",
    contact: "문의",
    privacy: "개인정보",
    terms: "이용약관",
    schools: "학교용",
    teachers: "교사용",
    successStories: "성공 사례",
    summary: "SpeakAce AI · IELTS와 TOEFL speaking을 위한 차세대 학습 공간"
  }
} as const;

export function SiteFooter() {
  const pathname = usePathname();
  const { language } = useAppState();
  if (pathname?.startsWith("/admin")) {
    return null;
  }
  const text = footerCopy[language];

  const productLinks = [
    { href: "/pricing" as Route, label: copy[language].nav.pricing },
    { href: "/app/practice" as Route, label: text.practice },
    { href: "/app/billing" as Route, label: copy[language].nav.billing },
    { href: "/auth" as Route, label: copy[language].nav.signIn }
  ];

  const resourceLinks = [
    { href: "/resources" as Route, label: text.resources },
    { href: "/free-ielts-speaking-test" as Route, label: text.freeTest },
    { href: "/daily-ielts-speaking-prompt" as Route, label: text.dailyPrompt },
    { href: "/weekly-ielts-speaking-challenge" as Route, label: text.weeklyChallenge },
    { href: "/ielts-speaking-topics" as Route, label: "IELTS topics" },
    { href: "/tools" as Route, label: text.tools },
    { href: "/compare" as Route, label: text.compare },
    { href: "/guides" as Route, label: text.guides },
    { href: "/blog" as Route, label: "Blog" },
    { href: "/reviews" as Route, label: text.reviews },
    { href: "/case-studies" as Route, label: text.caseStudies }
  ];

  const useCaseLinks = [
    { href: "/for-teachers" as Route, label: text.teachers },
    { href: "/for-schools" as Route, label: text.schools },
    { href: "/teacher-demo" as Route, label: localeCopy(language, "demoClass") },
    { href: "/success-stories" as Route, label: text.successStories },
    { href: "/for-students" as Route, label: localeCopy(language, "students") }
  ];

  const companyLinks = [
    { href: "/about" as Route, label: text.about },
    { href: "/contact" as Route, label: text.contact },
    { href: "/privacy-policy" as Route, label: text.privacy },
    { href: "/terms" as Route, label: text.terms },
    { href: "/blog" as Route, label: "Blog" }
  ];

  return (
    <footer className="site-footer">
      <div className="page-shell card site-footer-card">
        <div className="site-footer-top">
          <div className="site-footer-brand">
            <Image
              src="/brand/speakace-logo.jpeg"
              alt="SpeakAce"
              width={958}
              height={330}
              className="site-footer-logo"
            />
            <h2 className="site-footer-brand-title">{text.title}</h2>
            <p className="practice-copy site-footer-brand-copy">{text.description}</p>
          </div>

          <div className="site-footer-brand-actions">
            <Link className="button button-secondary" href="/app/practice">
              {text.startPractice}
            </Link>
            <a className="button button-primary" href={buildPlanCheckoutPath({ coupon: "LAUNCH20", campaign: "footer_cta" })}>
              {text.unlockPlus}
            </a>
          </div>
        </div>

        <div className="site-footer-grid">
          <div className="site-footer-panel">
            <div className="site-footer-panel-header">
              <strong>{text.product}</strong>
              <span>{text.productHint}</span>
            </div>
            <div className="site-footer-link-columns site-footer-link-columns-compact">
              {productLinks.map((item) => (
                <Link key={item.href} href={item.href}>{item.label}</Link>
              ))}
            </div>
          </div>

          <div className="site-footer-panel">
            <div className="site-footer-panel-header">
              <strong>{text.resources}</strong>
              <span>{text.resourcesHint}</span>
            </div>
            <div className="site-footer-link-columns">
              {resourceLinks.map((item) => (
                <Link key={item.href} href={item.href}>{item.label}</Link>
              ))}
            </div>
          </div>

          <div className="site-footer-panel">
            <div className="site-footer-panel-header">
              <strong>{text.programs}</strong>
              <span>{text.programsHint}</span>
            </div>
            <div className="site-footer-link-columns site-footer-link-columns-compact">
              {useCaseLinks.map((item) => (
                <Link key={item.href} href={item.href}>{item.label}</Link>
              ))}
            </div>
          </div>

          <div className="site-footer-panel">
            <div className="site-footer-panel-header">
              <strong>{text.company}</strong>
              <span>{text.companyHint}</span>
            </div>
            <div className="site-footer-link-columns site-footer-link-columns-compact">
              {companyLinks.map((item) => (
                <Link key={item.href} href={item.href}>{item.label}</Link>
              ))}
            </div>
          </div>
        </div>

        <div className="site-footer-bottom">
          <span>{text.summary}</span>
          <span>speakace.org</span>
        </div>
      </div>
    </footer>
  );
}

function localeCopy(language: keyof typeof footerCopy, key: "demoClass" | "students") {
  const map = {
    demoClass: {
      en: "Demo class",
      tr: "Demo sınıf",
      de: "Demo-Klasse",
      es: "Clase demo",
      fr: "Classe démo",
      it: "Classe demo",
      pt: "Turma demo",
      nl: "Demo-les",
      pl: "Klasa demo",
      ru: "Демо-класс",
      ar: "حصة تجريبية",
      ja: "デモクラス",
      ko: "데모 수업"
    },
    students: {
      en: "For students",
      tr: "Öğrenciler için",
      de: "Für Lernende",
      es: "Para estudiantes",
      fr: "Pour les étudiants",
      it: "Per studenti",
      pt: "Para alunos",
      nl: "Voor studenten",
      pl: "Dla uczniów",
      ru: "Для студентов",
      ar: "للطلاب",
      ja: "受講者向け",
      ko: "학생용"
    }
  } as const;

  return map[key][language];
}
