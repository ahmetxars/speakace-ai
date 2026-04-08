"use client";

import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { copy, languageMeta, localeOptions, type Language } from "@/lib/copy";
import { useAppState } from "@/components/providers";
import { buildPlanCheckoutPath } from "@/lib/commerce";

type HeaderLabels = {
  practice: string;
  explore: string;
  programs: string;
  about: string;
  freeTest: string;
  tools: string;
  topics: string;
  blog: string;
  reviews: string;
  resources: string;
  students: string;
  teachers: string;
  schools: string;
  demo: string;
  caseStudies: string;
  compare: string;
  dashboard: string;
  profile: string;
  billing: string;
  settings: string;
  signUp: string;
  signIn: string;
  signOut: string;
  account: string;
  notifications: string;
  menu: string;
  close: string;
};

const headerLabels: Record<Language, HeaderLabels> = {
  en: {
    practice: "Practice",
    explore: "Explore",
    programs: "Programs",
    about: "About",
    freeTest: "Free test",
    tools: "Tools",
    topics: "IELTS topics",
    blog: "Blog",
    reviews: "Reviews",
    resources: "Resources",
    students: "Students",
    teachers: "Teachers",
    schools: "Schools",
    demo: "Demo class",
    caseStudies: "Case studies",
    compare: "Compare",
    dashboard: "Dashboard",
    profile: "Profile",
    billing: "Billing",
    settings: "Settings",
    signUp: "Sign up",
    signIn: "Sign in",
    signOut: "Sign out",
    account: "Account",
    notifications: "Notifications",
    menu: "Menu",
    close: "Close"
  },
  tr: {
    practice: "Pratik",
    explore: "Keşfet",
    programs: "Programlar",
    about: "Hakkımızda",
    freeTest: "Ücretsiz test",
    tools: "Araçlar",
    topics: "IELTS konuları",
    blog: "Blog",
    reviews: "Yorumlar",
    resources: "Kaynaklar",
    students: "Öğrenciler",
    teachers: "Öğretmenler",
    schools: "Kurumlar",
    demo: "Demo sınıf",
    caseStudies: "Vaka örnekleri",
    compare: "Karşılaştır",
    dashboard: "Panel",
    profile: "Profil",
    billing: "Ödeme",
    settings: "Ayarlar",
    signUp: "Kayıt ol",
    signIn: "Giriş yap",
    signOut: "Çıkış yap",
    account: "Hesap",
    notifications: "Bildirimler",
    menu: "Menü",
    close: "Kapat"
  },
  de: {
    practice: "Üben",
    explore: "Entdecken",
    programs: "Programme",
    about: "Über uns",
    freeTest: "Gratis-Test",
    tools: "Tools",
    topics: "IELTS-Themen",
    blog: "Blog",
    reviews: "Bewertungen",
    resources: "Ressourcen",
    students: "Lernende",
    teachers: "Lehrkräfte",
    schools: "Schulen",
    demo: "Demo-Klasse",
    caseStudies: "Fallstudien",
    compare: "Vergleichen",
    dashboard: "Dashboard",
    profile: "Profil",
    billing: "Abrechnung",
    settings: "Einstellungen",
    signUp: "Registrieren",
    signIn: "Anmelden",
    signOut: "Abmelden",
    account: "Konto",
    notifications: "Benachrichtigungen",
    menu: "Menü",
    close: "Schließen"
  },
  es: {
    practice: "Practicar",
    explore: "Explorar",
    programs: "Programas",
    about: "Nosotros",
    freeTest: "Prueba gratis",
    tools: "Herramientas",
    topics: "Temas IELTS",
    blog: "Blog",
    reviews: "Opiniones",
    resources: "Recursos",
    students: "Estudiantes",
    teachers: "Profesores",
    schools: "Escuelas",
    demo: "Clase demo",
    caseStudies: "Casos",
    compare: "Comparar",
    dashboard: "Panel",
    profile: "Perfil",
    billing: "Pagos",
    settings: "Ajustes",
    signUp: "Crear cuenta",
    signIn: "Entrar",
    signOut: "Salir",
    account: "Cuenta",
    notifications: "Notificaciones",
    menu: "Menú",
    close: "Cerrar"
  },
  fr: {
    practice: "Pratique",
    explore: "Explorer",
    programs: "Programmes",
    about: "À propos",
    freeTest: "Test gratuit",
    tools: "Outils",
    topics: "Sujets IELTS",
    blog: "Blog",
    reviews: "Avis",
    resources: "Ressources",
    students: "Étudiants",
    teachers: "Enseignants",
    schools: "Écoles",
    demo: "Classe démo",
    caseStudies: "Études de cas",
    compare: "Comparer",
    dashboard: "Tableau",
    profile: "Profil",
    billing: "Paiement",
    settings: "Réglages",
    signUp: "Créer un compte",
    signIn: "Connexion",
    signOut: "Déconnexion",
    account: "Compte",
    notifications: "Notifications",
    menu: "Menu",
    close: "Fermer"
  },
  it: {
    practice: "Pratica",
    explore: "Esplora",
    programs: "Programmi",
    about: "Chi siamo",
    freeTest: "Test gratuito",
    tools: "Strumenti",
    topics: "Argomenti IELTS",
    blog: "Blog",
    reviews: "Recensioni",
    resources: "Risorse",
    students: "Studenti",
    teachers: "Docenti",
    schools: "Scuole",
    demo: "Classe demo",
    caseStudies: "Casi studio",
    compare: "Confronta",
    dashboard: "Dashboard",
    profile: "Profilo",
    billing: "Pagamenti",
    settings: "Impostazioni",
    signUp: "Registrati",
    signIn: "Accedi",
    signOut: "Esci",
    account: "Account",
    notifications: "Notifiche",
    menu: "Menu",
    close: "Chiudi"
  },
  pt: {
    practice: "Praticar",
    explore: "Explorar",
    programs: "Programas",
    about: "Sobre",
    freeTest: "Teste grátis",
    tools: "Ferramentas",
    topics: "Tópicos IELTS",
    blog: "Blog",
    reviews: "Avaliações",
    resources: "Recursos",
    students: "Alunos",
    teachers: "Professores",
    schools: "Escolas",
    demo: "Turma demo",
    caseStudies: "Casos",
    compare: "Comparar",
    dashboard: "Painel",
    profile: "Perfil",
    billing: "Cobrança",
    settings: "Configurações",
    signUp: "Criar conta",
    signIn: "Entrar",
    signOut: "Sair",
    account: "Conta",
    notifications: "Notificações",
    menu: "Menu",
    close: "Fechar"
  },
  nl: {
    practice: "Oefenen",
    explore: "Ontdekken",
    programs: "Programma's",
    about: "Over ons",
    freeTest: "Gratis test",
    tools: "Tools",
    topics: "IELTS-onderwerpen",
    blog: "Blog",
    reviews: "Reviews",
    resources: "Bronnen",
    students: "Studenten",
    teachers: "Docenten",
    schools: "Scholen",
    demo: "Demo-les",
    caseStudies: "Praktijkvoorbeelden",
    compare: "Vergelijken",
    dashboard: "Dashboard",
    profile: "Profiel",
    billing: "Facturatie",
    settings: "Instellingen",
    signUp: "Registreren",
    signIn: "Inloggen",
    signOut: "Uitloggen",
    account: "Account",
    notifications: "Meldingen",
    menu: "Menu",
    close: "Sluiten"
  },
  pl: {
    practice: "Ćwiczenia",
    explore: "Odkrywaj",
    programs: "Programy",
    about: "O nas",
    freeTest: "Darmowy test",
    tools: "Narzędzia",
    topics: "Tematy IELTS",
    blog: "Blog",
    reviews: "Opinie",
    resources: "Materiały",
    students: "Uczniowie",
    teachers: "Nauczyciele",
    schools: "Szkoły",
    demo: "Klasa demo",
    caseStudies: "Studia przypadków",
    compare: "Porównaj",
    dashboard: "Panel",
    profile: "Profil",
    billing: "Płatności",
    settings: "Ustawienia",
    signUp: "Załóż konto",
    signIn: "Zaloguj się",
    signOut: "Wyloguj się",
    account: "Konto",
    notifications: "Powiadomienia",
    menu: "Menu",
    close: "Zamknij"
  },
  ru: {
    practice: "Практика",
    explore: "Обзор",
    programs: "Программы",
    about: "О нас",
    freeTest: "Бесплатный тест",
    tools: "Инструменты",
    topics: "Темы IELTS",
    blog: "Блог",
    reviews: "Отзывы",
    resources: "Материалы",
    students: "Студенты",
    teachers: "Преподаватели",
    schools: "Школы",
    demo: "Демо-класс",
    caseStudies: "Кейсы",
    compare: "Сравнить",
    dashboard: "Панель",
    profile: "Профиль",
    billing: "Оплата",
    settings: "Настройки",
    signUp: "Регистрация",
    signIn: "Войти",
    signOut: "Выйти",
    account: "Аккаунт",
    notifications: "Уведомления",
    menu: "Меню",
    close: "Закрыть"
  },
  ar: {
    practice: "التدريب",
    explore: "استكشاف",
    programs: "البرامج",
    about: "من نحن",
    freeTest: "اختبار مجاني",
    tools: "الأدوات",
    topics: "مواضيع IELTS",
    blog: "المدونة",
    reviews: "التقييمات",
    resources: "المصادر",
    students: "الطلاب",
    teachers: "المعلمون",
    schools: "المدارس",
    demo: "حصة تجريبية",
    caseStudies: "دراسات حالة",
    compare: "قارن",
    dashboard: "اللوحة",
    profile: "الملف الشخصي",
    billing: "الفوترة",
    settings: "الإعدادات",
    signUp: "إنشاء حساب",
    signIn: "تسجيل الدخول",
    signOut: "تسجيل الخروج",
    account: "الحساب",
    notifications: "الإشعارات",
    menu: "القائمة",
    close: "إغلاق"
  },
  ja: {
    practice: "練習",
    explore: "見る",
    programs: "プログラム",
    about: "概要",
    freeTest: "無料テスト",
    tools: "ツール",
    topics: "IELTSトピック",
    blog: "ブログ",
    reviews: "レビュー",
    resources: "リソース",
    students: "受講者",
    teachers: "教師",
    schools: "学校",
    demo: "デモクラス",
    caseStudies: "事例",
    compare: "比較",
    dashboard: "ダッシュボード",
    profile: "プロフィール",
    billing: "請求",
    settings: "設定",
    signUp: "登録",
    signIn: "ログイン",
    signOut: "ログアウト",
    account: "アカウント",
    notifications: "通知",
    menu: "メニュー",
    close: "閉じる"
  },
  ko: {
    practice: "연습",
    explore: "탐색",
    programs: "프로그램",
    about: "소개",
    freeTest: "무료 테스트",
    tools: "도구",
    topics: "IELTS 주제",
    blog: "블로그",
    reviews: "후기",
    resources: "리소스",
    students: "학생",
    teachers: "교사",
    schools: "학교",
    demo: "데모 수업",
    caseStudies: "사례 연구",
    compare: "비교",
    dashboard: "대시보드",
    profile: "프로필",
    billing: "결제",
    settings: "설정",
    signUp: "회원가입",
    signIn: "로그인",
    signOut: "로그아웃",
    account: "계정",
    notifications: "알림",
    menu: "메뉴",
    close: "닫기"
  }
};

const navGroups = (labels: HeaderLabels) => [
  {
    key: "practice",
    label: labels.practice,
    items: [
      { href: "/app/practice", label: labels.practice },
      { href: "/free-ielts-speaking-test", label: labels.freeTest },
      { href: "/ielts-speaking-topics", label: labels.topics },
      { href: "/tools", label: labels.tools }
    ]
  },
  {
    key: "resources",
    label: labels.explore,
    items: [
      { href: "/resources", label: labels.resources },
      { href: "/blog", label: labels.blog },
      { href: "/reviews", label: labels.reviews },
      { href: "/pricing", label: copy.en.nav.pricing }
    ]
  },
  {
    key: "programs",
    label: labels.programs,
    items: [
      { href: "/for-students", label: labels.students },
      { href: "/for-teachers", label: labels.teachers },
      { href: "/for-schools", label: labels.schools },
      { href: "/teacher-demo", label: labels.demo }
    ]
  },
  {
    key: "about",
    label: labels.about,
    items: [
      { href: "/about", label: labels.about },
      { href: "/case-studies", label: labels.caseStudies },
      { href: "/compare", label: labels.compare }
    ]
  }
];

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const { language, setLanguage, signedIn, currentUser, signOut } = useAppState();
  const content = copy[language];
  const labels = headerLabels[language];
  const locale = languageMeta[language];
  const groups = useMemo(() => navGroups(labels), [labels]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [localeOpen, setLocaleOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
    setActiveGroup(null);
    setLocaleOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <header className="page-shell sa-header-shell">
      <div className={`card sa-header${scrolled ? " is-scrolled" : ""}`}>
        <div className="sa-header-brand">
          <Link href="/" className="sa-header-logo">
            <Image src="/brand/speakace-logo.png" alt="SpeakAce" width={958} height={330} priority className="sa-header-logo-image" />
          </Link>
          <p className="sa-header-tagline">{content.tagline}</p>
          {currentUser ? (
            <span className="sa-header-userline">
              {currentUser.name} · {currentUser.plan.toUpperCase()}
            </span>
          ) : null}
        </div>

        <div className="sa-header-center desktop-nav">
          <nav className="sa-header-nav">
            {signedIn ? (
              <Link href="/app" className={`sa-nav-link${isActive("/app") ? " is-active" : ""}`}>
                {labels.dashboard}
              </Link>
            ) : null}

            {groups.map((group) => (
              <div
                key={group.key}
                className="sa-nav-group"
                onMouseEnter={() => setActiveGroup(group.key)}
                onMouseLeave={() => setActiveGroup((current) => (current === group.key ? null : current))}
              >
                <button className={`sa-nav-link sa-nav-trigger${activeGroup === group.key ? " is-open" : ""}`} type="button">
                  {group.label}
                </button>
                <div className={`sa-nav-dropdown${activeGroup === group.key ? " is-open" : ""}`}>
                  <div className="sa-nav-dropdown-grid">
                    {group.items.map((item) => (
                      <Link key={item.href} href={item.href as Route} className={`sa-nav-dropdown-link${isActive(item.href) ? " is-active" : ""}`}>
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="sa-header-actions desktop-nav">
          {signedIn ? (
            <>
              <Link href="/app/notifications" className="sa-icon-button" aria-label={labels.notifications}>
                🔔
              </Link>
              <div className="sa-account-wrap">
                <button type="button" className="sa-secondary-button" onClick={() => setAccountOpen((value) => !value)}>
                  {labels.account}
                </button>
                <div className={`sa-account-dropdown${accountOpen ? " is-open" : ""}`}>
                  <Link href="/app/profile">{labels.profile}</Link>
                  <Link href="/app/billing">{labels.billing}</Link>
                  <Link href="/app/settings">{labels.settings}</Link>
                </div>
              </div>
              <button type="button" className="sa-ghost-button" onClick={() => void signOut()}>
                {labels.signOut}
              </button>
            </>
          ) : (
            <>
              <Link href="/auth?mode=signup" className="sa-secondary-button">
                {labels.signUp}
              </Link>
              <Link href="/auth?mode=signin" className="sa-ghost-button">
                {labels.signIn}
              </Link>
              <a href={buildPlanCheckoutPath({ campaign: "header_cta" })} className="sa-primary-button">
                Get Plus
              </a>
            </>
          )}

          <div className="sa-locale-wrap">
            <button type="button" className="sa-locale-button" onClick={() => setLocaleOpen((value) => !value)}>
              <span>{locale.flag}</span>
              <span>{locale.code.toUpperCase()}</span>
            </button>
            <div className={`sa-locale-dropdown${localeOpen ? " is-open" : ""}`}>
              {localeOptions.map((item) => (
                <button key={item.code} type="button" className={`sa-locale-option${language === item.code ? " is-active" : ""}`} onClick={() => setLanguage(item.code)}>
                  <span>{item.flag}</span>
                  <span>{item.nativeLabel}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <button type="button" className={`sa-mobile-toggle${mobileOpen ? " is-open" : ""}`} aria-label={mobileOpen ? labels.close : labels.menu} onClick={() => setMobileOpen((value) => !value)}>
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className={`sa-mobile-overlay${mobileOpen ? " is-open" : ""}`} onClick={() => setMobileOpen(false)} />
      <aside className={`sa-mobile-panel${mobileOpen ? " is-open" : ""}`}>
        <div className="sa-mobile-head">
          <Image src="/brand/speakace-logo.png" alt="SpeakAce" width={958} height={330} className="sa-mobile-logo" />
          <button type="button" className="sa-mobile-close" onClick={() => setMobileOpen(false)}>
            ✕
          </button>
        </div>
        <p className="sa-mobile-tagline">{content.tagline}</p>

        {groups.map((group) => (
          <div key={group.key} className="sa-mobile-group">
            <strong>{group.label}</strong>
            <div className="sa-mobile-links">
              {group.items.map((item) => (
                <Link key={item.href} href={item.href as Route} className={`sa-mobile-link${isActive(item.href) ? " is-active" : ""}`}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}

        <div className="sa-mobile-group">
          <strong>Language</strong>
          <div className="sa-mobile-locale-list">
            {localeOptions.map((item) => (
              <button key={item.code} type="button" className={`sa-mobile-locale${language === item.code ? " is-active" : ""}`} onClick={() => setLanguage(item.code)}>
                <span>{item.flag}</span>
                <span>{item.nativeLabel}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="sa-mobile-actions">
          {signedIn ? (
            <>
              <Link href="/app" className="sa-secondary-button">
                {labels.dashboard}
              </Link>
              <Link href="/app/profile" className="sa-ghost-button">
                {labels.profile}
              </Link>
              <button type="button" className="sa-ghost-button" onClick={() => void signOut()}>
                {labels.signOut}
              </button>
            </>
          ) : (
            <>
              <Link href="/auth?mode=signup" className="sa-secondary-button">
                {labels.signUp}
              </Link>
              <Link href="/auth?mode=signin" className="sa-ghost-button">
                {labels.signIn}
              </Link>
              <a href={buildPlanCheckoutPath({ campaign: "mobile_header_cta" })} className="sa-primary-button">
                Get Plus
              </a>
            </>
          )}
        </div>
      </aside>
    </header>
  );
}
