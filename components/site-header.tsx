"use client";

import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Globe, Menu, X, ChevronDown } from "lucide-react";
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
  const { language, setLanguage, signedIn, signOut } = useAppState();
  const content = copy[language];
  const labels = headerLabels[language];
  const locale = languageMeta[language];
  const groups = useMemo(() => navGroups(labels), [labels]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [localeOpen, setLocaleOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const localeRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
    setActiveGroup(null);
    setLocaleOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  // Fix: close locale dropdown on outside click
  useEffect(() => {
    if (!localeOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (localeRef.current && !localeRef.current.contains(event.target as Node)) {
        setLocaleOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [localeOpen]);

  // Fix: close account dropdown on outside click
  useEffect(() => {
    if (!accountOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [accountOpen]);

  // Fix: close mega menu on outside click
  useEffect(() => {
    if (!activeGroup) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target as Node)) {
        setActiveGroup(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeGroup]);

  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transition: "all 0.3s ease",
        background: scrolled ? "oklch(0.08 0.01 280 / 0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid oklch(1 0 0 / 8%)" : "1px solid transparent"
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 1.5rem",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem"
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            textDecoration: "none",
            flexShrink: 0
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              background: "linear-gradient(135deg, var(--primary), var(--accent))",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <span style={{ color: "white", fontWeight: 700, fontSize: "12px" }}>SA</span>
          </div>
          <Image
            src="/brand/speakace-logo.png"
            alt="SpeakAce"
            width={120}
            height={41}
            priority
            style={{ height: "22px", width: "auto", filter: "brightness(0) invert(1)" }}
          />
        </Link>

        {/* Desktop nav */}
        <div
          ref={megaMenuRef}
          style={{ display: "flex", alignItems: "center", gap: "0", position: "relative", flex: 1, justifyContent: "center" }}
          className="desktop-nav"
        >
          <nav style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            {signedIn ? (
              <Link
                href="/app"
                style={{
                  padding: "0.375rem 0.75rem",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: isActive("/app") ? "var(--primary)" : "var(--foreground)",
                  textDecoration: "none",
                  borderRadius: "6px",
                  transition: "all 0.2s",
                  opacity: isActive("/app") ? 1 : 0.8
                }}
              >
                {labels.dashboard}
              </Link>
            ) : null}

            {groups.map((group) => (
              <button
                key={group.key}
                type="button"
                onClick={() => setActiveGroup(activeGroup === group.key ? null : group.key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  padding: "0.375rem 0.75rem",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: activeGroup === group.key ? "var(--primary)" : "var(--foreground)",
                  background: activeGroup === group.key ? "oklch(1 0 0 / 6%)" : "transparent",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  opacity: 0.85
                }}
              >
                {group.label}
                <ChevronDown
                  size={14}
                  style={{
                    transition: "transform 0.2s",
                    transform: activeGroup === group.key ? "rotate(180deg)" : "rotate(0deg)"
                  }}
                />
              </button>
            ))}
          </nav>

          {/* Mega dropdown */}
          {activeGroup && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                left: "50%",
                transform: "translateX(-50%)",
                background: "oklch(0.12 0.015 280)",
                border: "1px solid oklch(1 0 0 / 10%)",
                borderRadius: "12px",
                padding: "1rem",
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "0.5rem",
                minWidth: "520px",
                boxShadow: "0 20px 60px oklch(0 0 0 / 0.5)",
                zIndex: 100
              }}
            >
              {groups.map((group) => (
                <div
                  key={group.key}
                  style={{
                    opacity: activeGroup === group.key ? 1 : 0.4,
                    transition: "opacity 0.2s",
                    padding: "0.5rem"
                  }}
                >
                  <strong style={{ display: "block", fontSize: "0.75rem", color: "var(--primary)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {group.label}
                  </strong>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.125rem" }}>
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href as Route}
                        style={{
                          display: "block",
                          padding: "0.375rem 0.5rem",
                          fontSize: "0.8125rem",
                          color: isActive(item.href) ? "var(--primary)" : "var(--foreground)",
                          textDecoration: "none",
                          borderRadius: "6px",
                          background: isActive(item.href) ? "oklch(0.623 0.214 259.815 / 0.15)" : "transparent",
                          transition: "all 0.15s",
                          opacity: 0.9
                        }}
                        onClick={() => setActiveGroup(null)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop actions */}
        <div
          style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}
          className="desktop-nav"
        >
          {signedIn ? (
            <>
              <Link
                href="/app/notifications"
                style={{
                  padding: "0.5rem",
                  borderRadius: "8px",
                  color: "var(--foreground)",
                  opacity: 0.7,
                  textDecoration: "none",
                  transition: "opacity 0.2s"
                }}
                aria-label={labels.notifications}
              >
                🔔
              </Link>
              <div ref={accountRef} style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => setAccountOpen((v) => !v)}
                  style={{
                    padding: "0.375rem 0.75rem",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "var(--foreground)",
                    background: "oklch(1 0 0 / 8%)",
                    border: "1px solid oklch(1 0 0 / 12%)",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  {labels.account}
                </button>
                {accountOpen && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 8px)",
                      background: "oklch(0.12 0.015 280)",
                      border: "1px solid oklch(1 0 0 / 10%)",
                      borderRadius: "10px",
                      padding: "0.5rem",
                      minWidth: "160px",
                      boxShadow: "0 10px 40px oklch(0 0 0 / 0.5)",
                      zIndex: 100,
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.125rem"
                    }}
                  >
                    {[
                      { href: "/app/profile", label: labels.profile },
                      { href: "/app/billing", label: labels.billing },
                      { href: "/app/settings", label: labels.settings }
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href as Route}
                        onClick={() => setAccountOpen(false)}
                        style={{
                          display: "block",
                          padding: "0.5rem 0.75rem",
                          fontSize: "0.875rem",
                          color: "var(--foreground)",
                          textDecoration: "none",
                          borderRadius: "6px",
                          transition: "background 0.15s"
                        }}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => void signOut()}
                style={{
                  padding: "0.375rem 0.75rem",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "var(--foreground)",
                  background: "transparent",
                  border: "1px solid oklch(1 0 0 / 12%)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  opacity: 0.7,
                  transition: "all 0.2s"
                }}
              >
                {labels.signOut}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth?mode=signup"
                style={{
                  padding: "0.375rem 0.875rem",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "var(--foreground)",
                  background: "oklch(1 0 0 / 8%)",
                  border: "1px solid oklch(1 0 0 / 12%)",
                  borderRadius: "8px",
                  textDecoration: "none",
                  transition: "all 0.2s",
                  opacity: 0.85
                }}
              >
                {labels.signUp}
              </Link>
              <Link
                href="/auth?mode=signin"
                style={{
                  padding: "0.375rem 0.875rem",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "var(--foreground)",
                  background: "transparent",
                  border: "1px solid transparent",
                  borderRadius: "8px",
                  textDecoration: "none",
                  transition: "all 0.2s",
                  opacity: 0.65
                }}
              >
                {labels.signIn}
              </Link>
              <a
                href={buildPlanCheckoutPath({ campaign: "header_cta" })}
                style={{
                  padding: "0.375rem 1rem",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "white",
                  background: "var(--primary)",
                  border: "none",
                  borderRadius: "8px",
                  textDecoration: "none",
                  transition: "all 0.2s",
                  boxShadow: "0 0 20px oklch(0.623 0.214 259.815 / 0.3)"
                }}
              >
                Get Plus
              </a>
            </>
          )}

          {/* Language selector */}
          <div ref={localeRef} style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setLocaleOpen((v) => !v)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                padding: "0.5rem",
                background: "transparent",
                border: "1px solid oklch(1 0 0 / 12%)",
                borderRadius: "8px",
                color: "var(--foreground)",
                cursor: "pointer",
                opacity: 0.75,
                transition: "all 0.2s"
              }}
              aria-label="Select language"
            >
              <Globe size={16} />
              <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>{locale.code.toUpperCase()}</span>
            </button>

            {localeOpen && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 8px)",
                  background: "oklch(0.12 0.015 280)",
                  border: "1px solid oklch(1 0 0 / 10%)",
                  borderRadius: "10px",
                  padding: "0.5rem",
                  minWidth: "160px",
                  maxHeight: "320px",
                  overflowY: "auto",
                  boxShadow: "0 10px 40px oklch(0 0 0 / 0.5)",
                  zIndex: 100,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.125rem"
                }}
              >
                {localeOptions.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => { setLanguage(item.code); setLocaleOpen(false); }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.5rem 0.75rem",
                      fontSize: "0.875rem",
                      color: "var(--foreground)",
                      background: language === item.code ? "oklch(0.623 0.214 259.815 / 0.2)" : "transparent",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      textAlign: "left",
                      width: "100%",
                      transition: "background 0.15s"
                    }}
                  >
                    <span>{item.flag}</span>
                    <span>{item.nativeLabel}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="mobile-only"
          style={{
            padding: "0.5rem",
            background: "oklch(1 0 0 / 8%)",
            border: "1px solid oklch(1 0 0 / 12%)",
            borderRadius: "8px",
            color: "var(--foreground)",
            cursor: "pointer"
          }}
          aria-label={mobileOpen ? labels.close : labels.menu}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "oklch(0 0 0 / 0.6)",
            zIndex: 40
          }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(320px, 85vw)",
          background: "oklch(0.10 0.015 280)",
          borderLeft: "1px solid oklch(1 0 0 / 10%)",
          zIndex: 50,
          transform: mobileOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          overflowY: "auto",
          padding: "1.5rem"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: "28px", height: "28px", background: "linear-gradient(135deg, var(--primary), var(--accent))", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "white", fontWeight: 700, fontSize: "11px" }}>SA</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--foreground)" }}>SpeakAce</span>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            style={{ padding: "0.375rem", background: "transparent", border: "none", color: "var(--foreground)", cursor: "pointer", opacity: 0.6 }}
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: "0.8125rem", color: "var(--muted-foreground)", marginBottom: "1.5rem" }}>{content.tagline}</p>

        {groups.map((group) => (
          <div key={group.key} style={{ marginBottom: "1.25rem" }}>
            <strong style={{ display: "block", fontSize: "0.6875rem", color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.375rem" }}>
              {group.label}
            </strong>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.125rem" }}>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href as Route}
                  style={{
                    display: "block",
                    padding: "0.5rem 0.75rem",
                    fontSize: "0.875rem",
                    color: isActive(item.href) ? "var(--primary)" : "var(--foreground)",
                    textDecoration: "none",
                    borderRadius: "6px",
                    background: isActive(item.href) ? "oklch(0.623 0.214 259.815 / 0.1)" : "transparent",
                    opacity: isActive(item.href) ? 1 : 0.8
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Mobile language selector */}
        <div style={{ marginBottom: "1.25rem" }}>
          <strong style={{ display: "block", fontSize: "0.6875rem", color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.375rem" }}>
            Language
          </strong>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.25rem" }}>
            {localeOptions.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => { setLanguage(item.code); setMobileOpen(false); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  padding: "0.5rem 0.625rem",
                  fontSize: "0.8125rem",
                  color: "var(--foreground)",
                  background: language === item.code ? "oklch(0.623 0.214 259.815 / 0.2)" : "oklch(1 0 0 / 4%)",
                  border: `1px solid ${language === item.code ? "oklch(0.623 0.214 259.815 / 0.4)" : "oklch(1 0 0 / 8%)"}`,
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "all 0.15s"
                }}
              >
                <span>{item.flag}</span>
                <span>{item.nativeLabel}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mobile CTA */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", paddingTop: "0.75rem", borderTop: "1px solid oklch(1 0 0 / 8%)" }}>
          {signedIn ? (
            <>
              <Link href="/app" style={{ display: "block", padding: "0.625rem 1rem", textAlign: "center", fontSize: "0.875rem", fontWeight: 600, color: "white", background: "var(--primary)", borderRadius: "8px", textDecoration: "none" }}>
                {labels.dashboard}
              </Link>
              <Link href="/app/profile" style={{ display: "block", padding: "0.625rem 1rem", textAlign: "center", fontSize: "0.875rem", fontWeight: 500, color: "var(--foreground)", background: "oklch(1 0 0 / 8%)", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: "8px", textDecoration: "none", opacity: 0.8 }}>
                {labels.profile}
              </Link>
              <button type="button" onClick={() => void signOut()} style={{ padding: "0.625rem 1rem", fontSize: "0.875rem", fontWeight: 500, color: "var(--foreground)", background: "transparent", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: "8px", cursor: "pointer", opacity: 0.6 }}>
                {labels.signOut}
              </button>
            </>
          ) : (
            <>
              <a href={buildPlanCheckoutPath({ campaign: "mobile_header_cta" })} style={{ display: "block", padding: "0.625rem 1rem", textAlign: "center", fontSize: "0.875rem", fontWeight: 600, color: "white", background: "var(--primary)", borderRadius: "8px", textDecoration: "none", boxShadow: "0 0 20px oklch(0.623 0.214 259.815 / 0.3)" }}>
                Get Plus
              </a>
              <Link href="/auth?mode=signup" style={{ display: "block", padding: "0.625rem 1rem", textAlign: "center", fontSize: "0.875rem", fontWeight: 500, color: "var(--foreground)", background: "oklch(1 0 0 / 8%)", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: "8px", textDecoration: "none" }}>
                {labels.signUp}
              </Link>
              <Link href="/auth?mode=signin" style={{ display: "block", padding: "0.625rem 1rem", textAlign: "center", fontSize: "0.875rem", fontWeight: 500, color: "var(--foreground)", background: "transparent", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: "8px", textDecoration: "none", opacity: 0.65 }}>
                {labels.signIn}
              </Link>
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) { .mobile-only { display: none !important; } }
        @media (max-width: 767px) { .desktop-nav { display: none !important; } }
      `}</style>
    </header>
  );
}
