"use client";

import type { Route } from "next";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { copy, languageMeta, localeOptions } from "@/lib/copy";
import { useAppState } from "@/components/providers";
import type { NotificationItem } from "@/lib/notifications";

type NavMenuItem = {
  href: Route;
  label: string;
};

type NavGroup = {
  label: string;
  items: NavMenuItem[];
};

const localeText = {
  en: {
    practice: "Practice",
    explore: "Explore",
    programs: "Programs",
    about: "About",
    speakingPractice: "Speaking practice",
    tools: "Tools",
    freeTest: "Free test",
    dailyPrompt: "Daily prompt",
    resources: "Resources",
    reviews: "Reviews",
    students: "Students",
    teachers: "Teachers",
    schools: "Schools",
    demoClass: "Demo class",
    whoIsSpeakAce: "Who is SpeakAce?",
    caseStudies: "Case studies",
    successStories: "Success stories",
    compare: "Compare",
    dashboard: "Dashboard",
    signUp: "Sign up",
    getPlus: "Get Plus",
    notifications: "Notifications",
    viewAll: "View all",
    noNotifications: "No new notifications right now.",
    account: "Account",
    profile: "Profile",
    teacherPanel: "Teacher panel",
    quickAccess: "Quick access",
    openMenu: "Open menu",
    closeMenu: "Close menu"
  },
  tr: {
    practice: "Pratik",
    explore: "Keşfet",
    programs: "Programlar",
    about: "Hakkımızda",
    speakingPractice: "Speaking practice",
    tools: "Araçlar",
    freeTest: "Ücretsiz test",
    dailyPrompt: "Günlük prompt",
    resources: "Kaynaklar",
    reviews: "Yorumlar",
    students: "Öğrenciler",
    teachers: "Öğretmenler",
    schools: "Kurumlar",
    demoClass: "Demo sınıf",
    whoIsSpeakAce: "SpeakAce kimdir?",
    caseStudies: "Örnekler",
    successStories: "Başarı hikayeleri",
    compare: "Karşılaştır",
    dashboard: "Panel",
    signUp: "Kayıt ol",
    getPlus: "Plus al",
    notifications: "Bildirimler",
    viewAll: "Tümünü gör",
    noNotifications: "Şu an yeni bildirim yok.",
    account: "Hesap",
    profile: "Profil",
    teacherPanel: "Öğretmen paneli",
    quickAccess: "Hızlı giriş",
    openMenu: "Menüyü aç",
    closeMenu: "Menüyü kapat"
  },
  de: {
    practice: "Üben",
    explore: "Entdecken",
    programs: "Programme",
    about: "Über uns",
    speakingPractice: "Sprechtraining",
    tools: "Tools",
    freeTest: "Gratis-Test",
    dailyPrompt: "Täglicher Prompt",
    resources: "Ressourcen",
    reviews: "Bewertungen",
    students: "Lernende",
    teachers: "Lehrkräfte",
    schools: "Schulen",
    demoClass: "Demo-Klasse",
    whoIsSpeakAce: "Wer ist SpeakAce?",
    caseStudies: "Fallstudien",
    successStories: "Erfolgsgeschichten",
    compare: "Vergleichen",
    dashboard: "Dashboard",
    signUp: "Registrieren",
    getPlus: "Plus holen",
    notifications: "Benachrichtigungen",
    viewAll: "Alle anzeigen",
    noNotifications: "Zurzeit keine neuen Benachrichtigungen.",
    account: "Konto",
    profile: "Profil",
    teacherPanel: "Lehrerbereich",
    quickAccess: "Schnellzugriff",
    openMenu: "Menü öffnen",
    closeMenu: "Menü schließen"
  },
  es: {
    practice: "Practicar",
    explore: "Explorar",
    programs: "Programas",
    about: "Nosotros",
    speakingPractice: "Práctica oral",
    tools: "Herramientas",
    freeTest: "Prueba gratis",
    dailyPrompt: "Prompt diario",
    resources: "Recursos",
    reviews: "Opiniones",
    students: "Estudiantes",
    teachers: "Profesores",
    schools: "Escuelas",
    demoClass: "Clase demo",
    whoIsSpeakAce: "¿Quién es SpeakAce?",
    caseStudies: "Casos reales",
    successStories: "Historias de éxito",
    compare: "Comparar",
    dashboard: "Panel",
    signUp: "Crear cuenta",
    getPlus: "Obtener Plus",
    notifications: "Notificaciones",
    viewAll: "Ver todo",
    noNotifications: "No hay notificaciones nuevas por ahora.",
    account: "Cuenta",
    profile: "Perfil",
    teacherPanel: "Panel docente",
    quickAccess: "Acceso rápido",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú"
  },
  fr: {
    practice: "Pratique",
    explore: "Explorer",
    programs: "Programmes",
    about: "À propos",
    speakingPractice: "Pratique orale",
    tools: "Outils",
    freeTest: "Test gratuit",
    dailyPrompt: "Prompt du jour",
    resources: "Ressources",
    reviews: "Avis",
    students: "Étudiants",
    teachers: "Enseignants",
    schools: "Écoles",
    demoClass: "Classe démo",
    whoIsSpeakAce: "Qui est SpeakAce ?",
    caseStudies: "Études de cas",
    successStories: "Histoires de réussite",
    compare: "Comparer",
    dashboard: "Tableau",
    signUp: "Créer un compte",
    getPlus: "Passer à Plus",
    notifications: "Notifications",
    viewAll: "Voir tout",
    noNotifications: "Aucune nouvelle notification pour le moment.",
    account: "Compte",
    profile: "Profil",
    teacherPanel: "Espace enseignant",
    quickAccess: "Accès rapide",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu"
  },
  it: {
    practice: "Pratica",
    explore: "Esplora",
    programs: "Programmi",
    about: "Chi siamo",
    speakingPractice: "Pratica speaking",
    tools: "Strumenti",
    freeTest: "Test gratuito",
    dailyPrompt: "Prompt del giorno",
    resources: "Risorse",
    reviews: "Recensioni",
    students: "Studenti",
    teachers: "Docenti",
    schools: "Scuole",
    demoClass: "Classe demo",
    whoIsSpeakAce: "Chi è SpeakAce?",
    caseStudies: "Casi studio",
    successStories: "Storie di successo",
    compare: "Confronta",
    dashboard: "Dashboard",
    signUp: "Registrati",
    getPlus: "Passa a Plus",
    notifications: "Notifiche",
    viewAll: "Vedi tutto",
    noNotifications: "Nessuna nuova notifica al momento.",
    account: "Account",
    profile: "Profilo",
    teacherPanel: "Area docente",
    quickAccess: "Accesso rapido",
    openMenu: "Apri menu",
    closeMenu: "Chiudi menu"
  },
  pt: {
    practice: "Praticar",
    explore: "Explorar",
    programs: "Programas",
    about: "Sobre",
    speakingPractice: "Prática oral",
    tools: "Ferramentas",
    freeTest: "Teste grátis",
    dailyPrompt: "Prompt diário",
    resources: "Recursos",
    reviews: "Avaliações",
    students: "Alunos",
    teachers: "Professores",
    schools: "Escolas",
    demoClass: "Turma demo",
    whoIsSpeakAce: "Quem é a SpeakAce?",
    caseStudies: "Casos de uso",
    successStories: "Histórias de sucesso",
    compare: "Comparar",
    dashboard: "Painel",
    signUp: "Criar conta",
    getPlus: "Obter Plus",
    notifications: "Notificações",
    viewAll: "Ver tudo",
    noNotifications: "Nenhuma notificação nova no momento.",
    account: "Conta",
    profile: "Perfil",
    teacherPanel: "Painel do professor",
    quickAccess: "Acesso rápido",
    openMenu: "Abrir menu",
    closeMenu: "Fechar menu"
  },
  nl: {
    practice: "Oefenen",
    explore: "Ontdekken",
    programs: "Programma's",
    about: "Over ons",
    speakingPractice: "Spreekoefening",
    tools: "Tools",
    freeTest: "Gratis test",
    dailyPrompt: "Dagelijkse prompt",
    resources: "Bronnen",
    reviews: "Reviews",
    students: "Studenten",
    teachers: "Docenten",
    schools: "Scholen",
    demoClass: "Demo-les",
    whoIsSpeakAce: "Wie is SpeakAce?",
    caseStudies: "Praktijkvoorbeelden",
    successStories: "Succesverhalen",
    compare: "Vergelijken",
    dashboard: "Dashboard",
    signUp: "Registreren",
    getPlus: "Neem Plus",
    notifications: "Meldingen",
    viewAll: "Alles bekijken",
    noNotifications: "Er zijn nu geen nieuwe meldingen.",
    account: "Account",
    profile: "Profiel",
    teacherPanel: "Docentenpaneel",
    quickAccess: "Snelle toegang",
    openMenu: "Menu openen",
    closeMenu: "Menu sluiten"
  },
  pl: {
    practice: "Ćwiczenia",
    explore: "Odkrywaj",
    programs: "Programy",
    about: "O nas",
    speakingPractice: "Praktyka mówienia",
    tools: "Narzędzia",
    freeTest: "Darmowy test",
    dailyPrompt: "Codzienny prompt",
    resources: "Materiały",
    reviews: "Opinie",
    students: "Uczniowie",
    teachers: "Nauczyciele",
    schools: "Szkoły",
    demoClass: "Klasa demo",
    whoIsSpeakAce: "Kim jest SpeakAce?",
    caseStudies: "Studia przypadków",
    successStories: "Historie sukcesu",
    compare: "Porównaj",
    dashboard: "Panel",
    signUp: "Załóż konto",
    getPlus: "Kup Plus",
    notifications: "Powiadomienia",
    viewAll: "Zobacz wszystko",
    noNotifications: "Brak nowych powiadomień.",
    account: "Konto",
    profile: "Profil",
    teacherPanel: "Panel nauczyciela",
    quickAccess: "Szybki dostęp",
    openMenu: "Otwórz menu",
    closeMenu: "Zamknij menu"
  },
  ru: {
    practice: "Практика",
    explore: "Обзор",
    programs: "Программы",
    about: "О нас",
    speakingPractice: "Практика speaking",
    tools: "Инструменты",
    freeTest: "Бесплатный тест",
    dailyPrompt: "Ежедневный prompt",
    resources: "Материалы",
    reviews: "Отзывы",
    students: "Студенты",
    teachers: "Преподаватели",
    schools: "Школы",
    demoClass: "Демо-класс",
    whoIsSpeakAce: "Кто такой SpeakAce?",
    caseStudies: "Кейсы",
    successStories: "Истории успеха",
    compare: "Сравнить",
    dashboard: "Панель",
    signUp: "Регистрация",
    getPlus: "Купить Plus",
    notifications: "Уведомления",
    viewAll: "Смотреть все",
    noNotifications: "Сейчас нет новых уведомлений.",
    account: "Аккаунт",
    profile: "Профиль",
    teacherPanel: "Панель преподавателя",
    quickAccess: "Быстрый доступ",
    openMenu: "Открыть меню",
    closeMenu: "Закрыть меню"
  },
  ar: {
    practice: "التدريب",
    explore: "استكشاف",
    programs: "البرامج",
    about: "من نحن",
    speakingPractice: "تدريب المحادثة",
    tools: "الأدوات",
    freeTest: "اختبار مجاني",
    dailyPrompt: "مهمة يومية",
    resources: "المصادر",
    reviews: "التقييمات",
    students: "الطلاب",
    teachers: "المعلمون",
    schools: "المدارس",
    demoClass: "حصة تجريبية",
    whoIsSpeakAce: "من هي SpeakAce؟",
    caseStudies: "دراسات حالة",
    successStories: "قصص نجاح",
    compare: "قارن",
    dashboard: "اللوحة",
    signUp: "إنشاء حساب",
    getPlus: "احصل على Plus",
    notifications: "الإشعارات",
    viewAll: "عرض الكل",
    noNotifications: "لا توجد إشعارات جديدة الآن.",
    account: "الحساب",
    profile: "الملف الشخصي",
    teacherPanel: "لوحة المعلم",
    quickAccess: "وصول سريع",
    openMenu: "فتح القائمة",
    closeMenu: "إغلاق القائمة"
  },
  ja: {
    practice: "練習",
    explore: "見る",
    programs: "プログラム",
    about: "About",
    speakingPractice: "スピーキング練習",
    tools: "ツール",
    freeTest: "無料テスト",
    dailyPrompt: "今日のプロンプト",
    resources: "リソース",
    reviews: "レビュー",
    students: "受講者",
    teachers: "教師",
    schools: "学校",
    demoClass: "デモクラス",
    whoIsSpeakAce: "SpeakAceとは？",
    caseStudies: "事例",
    successStories: "成功事例",
    compare: "比較",
    dashboard: "ダッシュボード",
    signUp: "登録",
    getPlus: "Plusにする",
    notifications: "通知",
    viewAll: "すべて見る",
    noNotifications: "新しい通知はありません。",
    account: "アカウント",
    profile: "プロフィール",
    teacherPanel: "教師パネル",
    quickAccess: "クイックアクセス",
    openMenu: "メニューを開く",
    closeMenu: "メニューを閉じる"
  },
  ko: {
    practice: "연습",
    explore: "탐색",
    programs: "프로그램",
    about: "소개",
    speakingPractice: "스피킹 연습",
    tools: "도구",
    freeTest: "무료 테스트",
    dailyPrompt: "오늘의 프롬프트",
    resources: "리소스",
    reviews: "후기",
    students: "학생",
    teachers: "교사",
    schools: "학교",
    demoClass: "데모 수업",
    whoIsSpeakAce: "SpeakAce는 누구인가요?",
    caseStudies: "사례 연구",
    successStories: "성공 사례",
    compare: "비교",
    dashboard: "대시보드",
    signUp: "회원가입",
    getPlus: "플러스 받기",
    notifications: "알림",
    viewAll: "전체 보기",
    noNotifications: "새 알림이 없습니다.",
    account: "계정",
    profile: "프로필",
    teacherPanel: "교사용 패널",
    quickAccess: "빠른 이동",
    openMenu: "메뉴 열기",
    closeMenu: "메뉴 닫기"
  }
} as const;

const menuItem = (href: Route, label: string): NavMenuItem => ({ href, label });

export function SiteHeader() {
  const { language, setLanguage, signedIn, currentUser, signOut } = useAppState();
  const content = copy[language];
  const labels = localeText[language];
  const currentLocale = languageMeta[language];
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const bellRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!signedIn || !currentUser?.id) {
      setNotifications([]);
      return;
    }

    fetch("/api/notifications")
      .then((response) => response.json())
      .then((data: { notifications?: NotificationItem[] }) => setNotifications((data.notifications ?? []).slice(0, 5)))
      .catch(() => setNotifications([]));
  }, [currentUser?.id, signedIn]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!bellRef.current?.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const practiceGroup = useMemo<NavGroup>(
    () => ({
      label: labels.practice,
      items: [
        menuItem("/app/practice", labels.speakingPractice),
        menuItem("/tools", labels.tools),
        menuItem("/free-ielts-speaking-test", labels.freeTest),
        menuItem("/daily-ielts-speaking-prompt", labels.dailyPrompt)
      ]
    }),
    [labels]
  );

  const exploreGroup = useMemo<NavGroup>(
    () => ({
      label: labels.explore,
      items: [
        menuItem("/resources", labels.resources),
        menuItem("/blog", "Blog"),
        menuItem("/reviews", labels.reviews),
        menuItem("/pricing", content.nav.pricing)
      ]
    }),
    [content.nav.pricing, labels]
  );

  const programsGroup = useMemo<NavGroup>(
    () => ({
      label: labels.programs,
      items: [
        menuItem("/for-students", labels.students),
        menuItem("/for-teachers", labels.teachers),
        menuItem("/for-schools", labels.schools),
        menuItem("/teacher-demo", labels.demoClass)
      ]
    }),
    [labels]
  );

  const aboutGroup = useMemo<NavGroup>(
    () => ({
      label: labels.about,
      items: [
        menuItem("/about", labels.whoIsSpeakAce),
        menuItem("/case-studies", labels.caseStudies),
        menuItem("/success-stories", labels.successStories),
        menuItem("/compare", labels.compare)
      ]
    }),
    [labels]
  );

  const mobileGroups = useMemo(
    () => [practiceGroup, exploreGroup, programsGroup, aboutGroup],
    [aboutGroup, exploreGroup, practiceGroup, programsGroup]
  );

  const closeMenu = () => setMenuOpen(false);
  const changeLanguage = (nextLanguage: typeof language) => {
    setLanguage(nextLanguage);
    setMenuOpen(false);
    setNotificationOpen(false);
  };

  return (
    <header className="page-shell site-header-shell">
      <div className="card site-header-card">
        <div className="site-header-brand">
          <Link href="/" className="site-header-logo" onClick={closeMenu}>
            <Image
              src="/brand/speakace-logo.jpeg"
              alt="SpeakAce"
              width={958}
              height={330}
              priority
              className="site-header-logo-image"
            />
          </Link>
          <div className="site-header-tagline">{content.tagline}</div>
          {currentUser ? (
            <div className="site-header-userline">
              {currentUser.name} · {currentUser.plan.toUpperCase()}
              {currentUser.isTeacher ? ` · ${labels.teachers.toUpperCase()}` : ""}
            </div>
          ) : null}
        </div>

        <div className="site-header-desktop desktop-nav">
          <nav className="site-header-nav site-header-nav-groups">
            {signedIn ? (
              <Link className="site-header-toplink" href="/app">
                {labels.dashboard}
              </Link>
            ) : null}

            {[practiceGroup, exploreGroup, programsGroup, aboutGroup].map((group) => (
              <div key={group.label} className="site-header-dropdown site-header-mega">
                <button type="button" className="site-header-dropdown-trigger">
                  {group.label}
                </button>
                <div className="site-header-dropdown-menu card site-header-mega-menu">
                  <div className="site-header-mega-grid">
                    {group.items.map((item) => (
                      <Link key={item.href} href={item.href} className="site-header-mega-link">
                        <strong>{item.label}</strong>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </nav>

          <div className="site-header-utility">
            <div className="site-header-actions">
              {!signedIn ? (
                <>
                  <Link className="button button-secondary button-header-minor" href="/auth?mode=signup">
                    {labels.signUp}
                  </Link>
                  <Link className="button button-ghost button-header-minor" href="/auth?mode=signin">
                    {content.nav.signIn}
                  </Link>
                  <a className="button button-primary" href="/api/payments/lemon/checkout?plan=plus&coupon=LAUNCH20&campaign=header_cta">
                    {labels.getPlus}
                  </a>
                </>
              ) : (
                <>
                  <div className="notification-bell-wrap" ref={bellRef}>
                    <button
                      className="notification-bell"
                      type="button"
                      aria-label={labels.notifications}
                      aria-expanded={notificationOpen}
                      onClick={() => setNotificationOpen((value) => !value)}
                    >
                      <span className="notification-bell-icon">🔔</span>
                      {notifications.length ? <span className="notification-bell-count">{Math.min(notifications.length, 9)}</span> : null}
                    </button>
                    {notificationOpen ? (
                      <div className="notification-dropdown card">
                        <div className="notification-dropdown-head">
                          <strong>{labels.notifications}</strong>
                          <Link href="/app/notifications" onClick={() => setNotificationOpen(false)}>
                            {labels.viewAll}
                          </Link>
                        </div>
                        <div className="notification-dropdown-list">
                          {notifications.length ? (
                            notifications.map((item) => (
                              <a
                                key={item.id}
                                href={item.href ?? "/app/notifications"}
                                className={`notification-dropdown-item is-${item.level}`}
                                onClick={() => setNotificationOpen(false)}
                              >
                                <strong>{item.title}</strong>
                                <span>{item.body}</span>
                              </a>
                            ))
                          ) : (
                            <div className="notification-dropdown-empty">{labels.noNotifications}</div>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                  <div className="site-header-dropdown site-header-mega">
                    <button type="button" className="button button-secondary button-header-minor">
                      {labels.account}
                    </button>
                    <div className="site-header-dropdown-menu card site-header-mega-menu site-header-account-menu">
                      <div className="site-header-mega-grid">
                        <Link href="/app/profile" className="site-header-mega-link">
                          <strong>{labels.profile}</strong>
                        </Link>
                        <Link href="/app/billing" className="site-header-mega-link">
                          <strong>{content.nav.billing}</strong>
                        </Link>
                        <Link href="/app/settings" className="site-header-mega-link">
                          <strong>{content.nav.settings}</strong>
                        </Link>
                        {currentUser?.isTeacher ? (
                          <Link href="/app/teacher" className="site-header-mega-link">
                            <strong>{labels.teacherPanel}</strong>
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <button className="button button-ghost button-header-minor" type="button" onClick={() => void signOut()}>
                    {content.nav.signOut}
                  </button>
                </>
              )}
            </div>
            <div className="site-header-dropdown site-header-locale-dropdown">
              <button className="button button-locale button-locale-trigger" type="button" aria-label="Change language">
                <span className="button-locale-flag" aria-hidden="true">{currentLocale.flag}</span>
                <span>{currentLocale.code.toUpperCase()}</span>
              </button>
              <div className="site-header-dropdown-menu card site-header-locale-menu">
                {localeOptions.map((locale) => (
                  <button
                    key={locale.code}
                    className="site-header-locale-option"
                    type="button"
                    onClick={() => changeLanguage(locale.code)}
                    data-active={language === locale.code}
                  >
                    <span aria-hidden="true">{locale.flag}</span>
                    <span>{locale.nativeLabel}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="site-header-menu-button"
          aria-label={menuOpen ? labels.closeMenu : labels.openMenu}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {menuOpen ? <div className="mobile-nav-overlay is-open" onClick={closeMenu} /> : null}
      {menuOpen ? (
        <aside className="mobile-nav-panel is-open">
          <div className="mobile-nav-panel-head">
            <div>
              <strong>{content.brand}</strong>
              <div className="site-header-tagline">{content.tagline}</div>
            </div>
            <button type="button" className="site-header-menu-button is-close" aria-label={labels.closeMenu} onClick={closeMenu}>
              <span />
              <span />
            </button>
          </div>

          {signedIn ? (
            <div className="mobile-nav-section">
              <span className="eyebrow">{labels.quickAccess}</span>
              <div className="mobile-nav-links">
                <Link href="/app" onClick={closeMenu}>
                  {labels.dashboard}
                </Link>
              </div>
            </div>
          ) : null}

          {mobileGroups.map((group) => (
            <div key={group.label} className="mobile-nav-section">
              <span className="eyebrow">{group.label}</span>
              <div className="mobile-nav-links">
                {group.items.map((item) => (
                  <Link key={item.href} href={item.href} onClick={closeMenu}>
                    <strong>{item.label}</strong>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {signedIn ? (
            <div className="mobile-nav-section">
              <span className="eyebrow">{labels.account}</span>
              <div className="mobile-nav-links">
                <Link href="/app/profile" onClick={closeMenu}>
                  {labels.profile}
                </Link>
                <Link href="/app/billing" onClick={closeMenu}>
                  {content.nav.billing}
                </Link>
                <Link href="/app/settings" onClick={closeMenu}>
                  {content.nav.settings}
                </Link>
                <Link href="/app/notifications" onClick={closeMenu}>
                  {labels.notifications}
                </Link>
                {currentUser?.isTeacher ? (
                  <Link href="/app/teacher" onClick={closeMenu}>
                    {labels.teacherPanel}
                  </Link>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="mobile-nav-actions">
            {!signedIn ? (
              <>
                <Link className="button button-secondary" href="/auth?mode=signup" onClick={closeMenu}>
                  {labels.signUp}
                </Link>
                <Link className="button button-ghost" href="/auth?mode=signin" onClick={closeMenu}>
                  {content.nav.signIn}
                </Link>
                <a className="button button-primary" href="/api/payments/lemon/checkout?plan=plus&coupon=LAUNCH20&campaign=header_mobile_cta">
                  {labels.getPlus}
                </a>
              </>
            ) : (
              <button className="button button-secondary" type="button" onClick={() => void signOut()}>
                {content.nav.signOut}
              </button>
            )}
          </div>

          <div className="mobile-language-switch mobile-language-grid">
            {localeOptions.map((locale) => (
              <button
                key={locale.code}
                className="button button-locale mobile-language-option"
                type="button"
                onClick={() => changeLanguage(locale.code)}
                data-active={language === locale.code}
              >
                <span aria-hidden="true">{locale.flag}</span>
                <span>{locale.code.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </aside>
      ) : null}
    </header>
  );
}
