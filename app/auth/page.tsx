"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import posthog from "posthog-js";
import { ChevronDown, GraduationCap, LockKeyhole, School, Sparkles, UserRound } from "lucide-react";
import { useAppState } from "@/components/providers";
import { resolveSafeAppRedirect } from "@/lib/auth-redirect";
import { normalizePublicLanguage, type PublicLanguage } from "@/lib/copy";
import { clearShareAttribution, getShareAttributionFromStorage } from "@/lib/share-growth";

type AuthUi = {
  secure: string;
  signupTitle: string;
  signinTitle: string;
  resetTitle: string;
  signupBody: string;
  signinBody: string;
  resetBody: string;
  features: [string, string, string];
  access: string;
  create: string;
  signIn: string;
  reset: string;
  createHint: string;
  signInHint: string;
  resetHint: string;
  google: string;
  emailDivider: string;
  chooseRole: string;
  roleHint: string;
  roles: Array<{ key: "student" | "teacher" | "school"; label: string; description: string }>;
  name: string;
  namePlaceholder: string;
  password: string;
  passwordPlaceholder: string;
  passwordHint: string;
  optionalOpen: string;
  optionalClose: string;
  classCode: string;
  classPlaceholder: string;
  schoolCode: string;
  schoolPlaceholder: string;
  organization: string;
  organizationPlaceholder: string;
  referral: string;
  referralPlaceholder: string;
  guest: string;
};

const authUi: Record<PublicLanguage, AuthUi> = {
  en: {
    secure: "Protected account access", signupTitle: "Create the account. Start the practice.", signinTitle: "Welcome back to your practice.", resetTitle: "Choose a new password.", signupBody: "Start with the essentials. Class, school, and referral details stay optional and out of your way.", signinBody: "Sign in and continue from your latest score, draft, or assigned practice.", resetBody: "Set a new password and return to your account securely.",
    features: ["Your speaking and writing history stays together", "Student, teacher, and school workspaces stay separate", "Secure server-side session protection"], access: "Account access", create: "Create account", signIn: "Sign in", reset: "Reset password", createHint: "Only the essentials are required.", signInHint: "Use your email and password to continue.", resetHint: "Enter a new password to regain access.", google: "Continue with Google", emailDivider: "or use email", chooseRole: "I am joining as", roleHint: "This sets up the right workspace after signup.",
    roles: [{ key: "student", label: "Student", description: "Practise and track progress" }, { key: "teacher", label: "Teacher", description: "Run classes and assignments" }, { key: "school", label: "School", description: "Coordinate a programme" }],
    name: "Full name", namePlaceholder: "Your name", password: "Password", passwordPlaceholder: "At least 8 characters and 1 number", passwordHint: "Use at least 8 characters and include 1 number.", optionalOpen: "Have a class, school, or referral code?", optionalClose: "Hide optional details", classCode: "Class code", classPlaceholder: "Code from your teacher", schoolCode: "School invite code", schoolPlaceholder: "Code from your school admin", organization: "School or organization", organizationPlaceholder: "Example: SpeakAce Academy", referral: "Referral code", referralPlaceholder: "Add your code", guest: "Continue as guest"
  },
  tr: {
    secure: "Korumalı hesap erişimi", signupTitle: "Hesabı oluştur. Pratiğe başla.", signinTitle: "Pratiğine tekrar hoş geldin.", resetTitle: "Yeni şifreni belirle.", signupBody: "Yalnız gerekli bilgilerle başla. Sınıf, okul ve referans detayları opsiyonel kalır.", signinBody: "Giriş yap; son skorundan, taslağından veya ödevinden devam et.", resetBody: "Yeni şifreni belirle ve hesabına güvenle dön.",
    features: ["Konuşma ve yazma geçmişin birlikte kalır", "Öğrenci, öğretmen ve kurum alanları ayrıdır", "Güvenli sunucu tarafı oturum koruması"], access: "Hesap erişimi", create: "Hesap oluştur", signIn: "Giriş yap", reset: "Şifreyi yenile", createHint: "Yalnız gerekli bilgiler zorunlu.", signInHint: "Devam etmek için e-posta ve şifreni kullan.", resetHint: "Erişimini geri almak için yeni şifreni gir.", google: "Google ile devam et", emailDivider: "veya e-posta kullan", chooseRole: "Katılım türüm", roleHint: "Kayıttan sonra doğru çalışma alanı hazırlanır.",
    roles: [{ key: "student", label: "Öğrenci", description: "Pratik yap ve ilerlemeni izle" }, { key: "teacher", label: "Öğretmen", description: "Sınıf ve ödev yönet" }, { key: "school", label: "Kurum", description: "Programı koordine et" }],
    name: "Ad soyad", namePlaceholder: "Adın soyadın", password: "Şifre", passwordPlaceholder: "En az 8 karakter ve 1 sayı", passwordHint: "En az 8 karakter ve 1 sayı kullan.", optionalOpen: "Sınıf, okul veya referans kodun var mı?", optionalClose: "Opsiyonel detayları gizle", classCode: "Sınıf kodu", classPlaceholder: "Öğretmeninden aldığın kod", schoolCode: "Okul davet kodu", schoolPlaceholder: "Okul yöneticinden aldığın kod", organization: "Okul veya kurum", organizationPlaceholder: "Örn. SpeakAce Academy", referral: "Referans kodu", referralPlaceholder: "Kodunu ekle", guest: "Misafir olarak devam et"
  },
  de: {
    secure: "Geschützter Kontozugang", signupTitle: "Konto erstellen. Übung starten.", signinTitle: "Willkommen zurück beim Training.", resetTitle: "Neues Passwort wählen.", signupBody: "Beginne mit dem Nötigsten. Klassen-, Schul- und Empfehlungscodes bleiben optional.", signinBody: "Anmelden und beim letzten Ergebnis, Entwurf oder Auftrag weitermachen.", resetBody: "Lege ein neues Passwort fest und kehre sicher zurück.", features: ["Sprech- und Schreibverlauf bleiben zusammen", "Getrennte Bereiche für Lernende, Lehrkräfte und Schulen", "Sichere serverseitige Sitzung"], access: "Kontozugang", create: "Konto erstellen", signIn: "Anmelden", reset: "Passwort zurücksetzen", createHint: "Nur das Nötigste ist Pflicht.", signInHint: "Mit E-Mail und Passwort fortfahren.", resetHint: "Neues Passwort eingeben.", google: "Mit Google fortfahren", emailDivider: "oder E-Mail nutzen", chooseRole: "Ich bin", roleHint: "Damit wird der richtige Bereich eingerichtet.", roles: [{ key: "student", label: "Lernende", description: "Üben und Fortschritt sehen" }, { key: "teacher", label: "Lehrkraft", description: "Klassen und Aufgaben führen" }, { key: "school", label: "Schule", description: "Programm koordinieren" }], name: "Vollständiger Name", namePlaceholder: "Dein Name", password: "Passwort", passwordPlaceholder: "Mindestens 8 Zeichen und 1 Zahl", passwordHint: "Mindestens 8 Zeichen und eine Zahl verwenden.", optionalOpen: "Hast du einen Klassen-, Schul- oder Empfehlungscode?", optionalClose: "Optionale Angaben ausblenden", classCode: "Klassencode", classPlaceholder: "Code der Lehrkraft", schoolCode: "Schul-Einladungscode", schoolPlaceholder: "Code der Schulverwaltung", organization: "Schule oder Organisation", organizationPlaceholder: "Beispiel: SpeakAce Academy", referral: "Empfehlungscode", referralPlaceholder: "Code hinzufügen", guest: "Als Gast fortfahren"
  },
  es: {
    secure: "Acceso protegido", signupTitle: "Crea la cuenta. Empieza a practicar.", signinTitle: "Bienvenido de nuevo a tu práctica.", resetTitle: "Elige una nueva contraseña.", signupBody: "Empieza con lo esencial. Los códigos de clase, escuela y referido son opcionales.", signinBody: "Entra y continúa desde tu última puntuación, borrador o tarea.", resetBody: "Define una nueva contraseña y vuelve a tu cuenta de forma segura.", features: ["Tu historial de speaking y writing permanece unido", "Espacios separados para alumno, profesor y escuela", "Sesión segura en el servidor"], access: "Acceso a la cuenta", create: "Crear cuenta", signIn: "Entrar", reset: "Restablecer contraseña", createHint: "Solo pedimos lo esencial.", signInHint: "Usa tu email y contraseña para continuar.", resetHint: "Introduce una nueva contraseña.", google: "Continuar con Google", emailDivider: "o usar email", chooseRole: "Me uno como", roleHint: "Prepararemos el espacio correcto.", roles: [{ key: "student", label: "Estudiante", description: "Practicar y ver progreso" }, { key: "teacher", label: "Profesor", description: "Gestionar clases y tareas" }, { key: "school", label: "Escuela", description: "Coordinar un programa" }], name: "Nombre completo", namePlaceholder: "Tu nombre", password: "Contraseña", passwordPlaceholder: "Mínimo 8 caracteres y 1 número", passwordHint: "Usa al menos 8 caracteres e incluye 1 número.", optionalOpen: "¿Tienes código de clase, escuela o referido?", optionalClose: "Ocultar datos opcionales", classCode: "Código de clase", classPlaceholder: "Código de tu profesor", schoolCode: "Código de invitación", schoolPlaceholder: "Código de la escuela", organization: "Escuela u organización", organizationPlaceholder: "Ejemplo: SpeakAce Academy", referral: "Código de referido", referralPlaceholder: "Añade tu código", guest: "Continuar como invitado"
  },
  fr: {
    secure: "Accès protégé", signupTitle: "Crée le compte. Commence la pratique.", signinTitle: "Bienvenue dans ta pratique.", resetTitle: "Choisis un nouveau mot de passe.", signupBody: "Commence par l’essentiel. Les codes classe, école et parrainage restent facultatifs.", signinBody: "Connecte-toi et reprends depuis ton dernier score, brouillon ou devoir.", resetBody: "Définis un nouveau mot de passe et retrouve ton compte en sécurité.", features: ["L’historique oral et écrit reste réuni", "Espaces séparés pour élève, enseignant et école", "Session sécurisée côté serveur"], access: "Accès au compte", create: "Créer un compte", signIn: "Connexion", reset: "Réinitialiser", createHint: "Seul l’essentiel est obligatoire.", signInHint: "Utilise ton e-mail et ton mot de passe.", resetHint: "Saisis un nouveau mot de passe.", google: "Continuer avec Google", emailDivider: "ou utiliser l’e-mail", chooseRole: "Je rejoins comme", roleHint: "Nous préparerons le bon espace.", roles: [{ key: "student", label: "Élève", description: "Pratiquer et suivre ses progrès" }, { key: "teacher", label: "Enseignant", description: "Gérer classes et devoirs" }, { key: "school", label: "École", description: "Coordonner un programme" }], name: "Nom complet", namePlaceholder: "Ton nom", password: "Mot de passe", passwordPlaceholder: "8 caractères et 1 chiffre minimum", passwordHint: "Utilise au moins 8 caractères et un chiffre.", optionalOpen: "Tu as un code classe, école ou parrainage ?", optionalClose: "Masquer les détails facultatifs", classCode: "Code classe", classPlaceholder: "Code de ton enseignant", schoolCode: "Code d’invitation école", schoolPlaceholder: "Code de l’administration", organization: "École ou organisation", organizationPlaceholder: "Exemple : SpeakAce Academy", referral: "Code de parrainage", referralPlaceholder: "Ajouter le code", guest: "Continuer en invité"
  }
};

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthPageInner />
    </Suspense>
  );
}

function AuthPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshSession, language } = useAppState();
  const ui = authUi[normalizePublicLanguage(language)];
  const tr = language === "tr";
  const authError = searchParams.get("error");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [memberType, setMemberType] = useState<"student" | "teacher" | "school">("student");
  const [classCode, setClassCode] = useState("");
  const [schoolInviteCode, setSchoolInviteCode] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [successToast, setSuccessToast] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [handledVerifyToken, setHandledVerifyToken] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [storedAttributionPath, setStoredAttributionPath] = useState<string | null>(null);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const inviteReferrerId = searchParams.get("invite");

  useEffect(() => {
    const requestedMode = searchParams.get("mode");
    if (requestedMode === "signin" || requestedMode === "signup") {
      setMode(requestedMode);
    }
    const requestedReferral = searchParams.get("ref");
    if (requestedReferral) {
      setReferralCode(requestedReferral.toUpperCase());
      setShowOptionalFields(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!successToast) return;
    const timer = window.setTimeout(() => setSuccessToast(""), 5000);
    return () => window.clearTimeout(timer);
  }, [successToast]);

  useEffect(() => {
    const stored = getShareAttributionFromStorage();
    setStoredAttributionPath(stored?.path ?? null);
  }, []);

  const submit = async () => {
    setError("");
    setNotice("");
    setSuccessToast("");
    setNeedsVerification(false);
    const effectiveAttributionPath = searchParams.get("cta") ?? storedAttributionPath ?? null;
    const response = await fetch(mode === "signup" ? "/api/auth/signup" : "/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        name,
        memberType,
        classCode,
        schoolInviteCode,
        organizationName,
        referralCode,
        inviteReferrerId,
        attributionPath: effectiveAttributionPath,
        attributionEvent: searchParams.get("cta_event") ?? null
      })
    });

    const data = (await response.json()) as { error?: string; verificationRequired?: boolean; verificationUrl?: string; needsEmailVerification?: boolean; emailSent?: boolean; classJoinMessage?: string };
    if (!response.ok) {
      setError(data.error ?? (tr ? "Kimlik doğrulama işlemi tamamlanamadı." : "Authentication failed."));
      if (data.needsEmailVerification) {
        setNotice(tr ? "Giriş yapmadan önce e-posta adresini doğrulaman gerekiyor. Aşağıdan yeni bir doğrulama maili isteyebilirsin." : "You need to verify your email before signing in. You can request a new verification link below.");
        setNeedsVerification(true);
      }
      return;
    }

    if (mode === "signup" && data.verificationRequired) {
      clearShareAttribution();
      posthog.capture("user_signed_up", {
        member_type: memberType,
        email,
        has_referral_code: Boolean(referralCode),
        has_class_code: Boolean(classCode)
      });
      setSuccessToast(
        data.emailSent
          ? tr ? "Hesabın oluşturuldu. Lütfen hesabını e-posta kutundan onayla." : "Your account was created. Please verify it from your inbox."
          : tr ? "Hesabın oluşturuldu. Giriş yapmadan önce e-posta doğrulaması gerekiyor." : "Your account was created. Email verification is required."
      );
      setPassword("");
      setMode("signin");
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (data.classJoinMessage) {
        setNotice(data.classJoinMessage);
      }
      return;
    }

    if (mode === "signup") {
      clearShareAttribution();
      posthog.identify(email, { email, member_type: memberType });
      posthog.capture("user_signed_up", {
        member_type: memberType,
        email,
        has_referral_code: Boolean(referralCode),
        has_class_code: Boolean(classCode)
      });
    } else {
      posthog.identify(email, { email });
      posthog.capture("user_signed_in", { email });
    }
    await refreshSession();
    const requestedNext = mode === "signin" ? resolveSafeAppRedirect(searchParams.get("next")) : null;
    router.push((requestedNext ?? (mode === "signup" && memberType === "student" ? "/app/onboarding" : "/app")) as Route);
  };

  useEffect(() => {
    const verifyToken = searchParams.get("verify");
    if (!verifyToken || verifying || handledVerifyToken === verifyToken) return;

    setVerifying(true);
    setHandledVerifyToken(verifyToken);
    setError("");
    setNotice("");
    setSuccessToast("");
    fetch(`/api/auth/verify-email?token=${encodeURIComponent(verifyToken)}`)
      .then(async (response) => {
        const data = (await response.json()) as { error?: string; authenticated?: boolean };
        if (!response.ok) {
          setError(data.error ?? (tr ? "Doğrulama işlemi başarısız oldu." : "Verification failed."));
          return;
        }
        if (data.authenticated) {
          await refreshSession();
          posthog.capture("signup_activated", { source: "email_verification" });
          router.replace("/app/practice?quickStart=1&runMode=interview&activation=verified_signup");
          return;
        }
        setSuccessToast(tr ? "E-posta adresin doğrulandı. Artık giriş yapabilirsin." : "Your email address has been verified. You can now sign in.");
        setMode("signin");
      })
      .finally(() => setVerifying(false));
  }, [handledVerifyToken, refreshSession, router, searchParams, tr, verifying]);

  const resendVerification = async () => {
    if (!email || resendingVerification) return;
    setResendingVerification(true);
    setError("");
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = (await response.json()) as { error?: string; emailSent?: boolean };
      if (!response.ok) {
        setError(data.error ?? (tr ? "Doğrulama maili gönderilemedi." : "Could not send verification email."));
      } else {
        setNeedsVerification(false);
        setNotice("");
        setSuccessToast(
          data.emailSent
            ? tr
              ? "Doğrulama maili gönderildi. Lütfen e-posta kutunu kontrol et."
              : "Verification email sent. Please check your inbox."
            : tr
              ? "Hesabın zaten doğrulanmış olabilir. Giriş yapmayı dene."
              : "Your account may already be verified. Try signing in."
        );
      }
    } finally {
      setResendingVerification(false);
    }
  };

  const resetPassword = async () => {
    const resetToken = searchParams.get("reset");
    if (!resetToken) return;
    setError("");
    setNotice("");
    setSuccessToast("");
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: resetToken, password })
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(data.error ?? (tr ? "Şifre sıfırlanamadı." : "Password could not be reset."));
      return;
    }
    setSuccessToast(tr ? "Şifren güncellendi. Yeni şifrenle giriş yapabilirsin." : "Your password has been updated. You can now sign in.");
    setMode("signin");
    setPassword("");
  };

  const cta = searchParams.get("cta") ?? storedAttributionPath;
  const ctaEvent = searchParams.get("cta_event");
  const resetToken = searchParams.get("reset");
  const isResetMode = Boolean(resetToken);
  const isSignup = !isResetMode && mode === "signup";
  const safeNext = resolveSafeAppRedirect(searchParams.get("next"));
  const googleParams = new URLSearchParams();
  googleParams.set("mode", mode);
  if (safeNext) {
    googleParams.set("next", safeNext);
  }
  if (cta) {
    googleParams.set("cta", cta);
  }
  if (ctaEvent) {
    googleParams.set("cta_event", ctaEvent);
  }
  if (inviteReferrerId) {
    googleParams.set("invite", inviteReferrerId);
  }
  if (isSignup) {
    googleParams.set("memberType", memberType);
    if (classCode.trim()) {
      googleParams.set("classCode", classCode.trim());
    }
    if (organizationName.trim()) {
      googleParams.set("organizationName", organizationName.trim());
    }
    if (referralCode.trim()) {
      googleParams.set("referralCode", referralCode.trim().toUpperCase());
    }
    if (memberType === "teacher" && schoolInviteCode.trim()) {
      googleParams.set("schoolInviteCode", schoolInviteCode.trim().toUpperCase());
    }
  }

  const googleErrorMessage =
    authError === "google_not_configured"
      ? tr
        ? "Google ile giriş henüz yapılandırılmamış. Yönetici önce Google OAuth ayarlarını tamamlamalı."
        : "Google sign-in is not configured yet. An admin needs to finish the Google OAuth setup first."
      : authError === "google_denied"
        ? tr
          ? "Google giriş isteği iptal edildi."
          : "The Google sign-in request was cancelled."
        : authError === "google_state_invalid"
          ? tr
            ? "Google giriş oturumu doğrulanamadı. Lütfen tekrar dene."
            : "We could not validate the Google sign-in session. Please try again."
          : authError === "google_token_failed"
            ? tr
              ? "Google erişim belirteci alınamadı. Lütfen tekrar dene."
              : "We could not retrieve the Google access token. Please try again."
            : authError === "google_no_email"
              ? tr
                ? "Google hesabından e-posta bilgisi alınamadı."
                : "We could not read an email address from your Google account."
              : authError === "google_failed"
                ? tr
                  ? "Google ile giriş sırasında beklenmeyen bir hata oluştu."
                  : "An unexpected error occurred during Google sign-in."
                : "";

  const roleIcons = { student: UserRound, teacher: GraduationCap, school: School } as const;

  return (
    <main className="auth-entry" data-mode={isSignup ? "signup" : isResetMode ? "reset" : "signin"}>
      <div className="auth-entry-frame">
        <section className="auth-entry-story">
          <span className="auth-entry-chip"><LockKeyhole size={14} />{ui.secure}</span>
          <h1>{isResetMode ? ui.resetTitle : isSignup ? ui.signupTitle : ui.signinTitle}</h1>
          <p className="auth-entry-story-copy">
            {isResetMode ? ui.resetBody : isSignup ? ui.signupBody : ui.signinBody}
          </p>

          <div className="auth-entry-benefits">
            {ui.features.map((item) => (
              <div key={item}>
                <span aria-hidden="true"><Sparkles size={13} /></span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="auth-entry-monogram" aria-hidden="true"><span>SA</span><i /></div>
        </section>

        <section className="auth-entry-panel">
          {successToast ? (
            <div className="auth-alert auth-alert-success">
              <span className="auth-alert-icon" aria-hidden="true">
                ✓
              </span>
              <div>
                <strong>{tr ? "İşlem tamamlandı" : "Success"}</strong>
                <p>{successToast}</p>
              </div>
            </div>
          ) : null}

          {inviteReferrerId ? (
            <div className="auth-alert auth-alert-info">
              <div>
                <strong>{tr ? "Davet bağlantısı algılandı" : "Invite link detected"}</strong>
                <p>
                  {tr
                    ? "Bu hesap, kişisel davet akışıyla oluşturulacak. Kayıt tamamlandığında yönlendirme bilgisi otomatik işlenecek."
                    : "This account will be created through a personal invite flow. Referral attribution will be applied automatically after signup."}
                </p>
              </div>
            </div>
          ) : null}

          {resetToken ? (
            <div className="auth-alert auth-alert-neutral">
              <div>
                <strong>{tr ? "Şifre yenileme modu" : "Password reset mode"}</strong>
                <p>
                  {tr
                    ? "Aşağıdan yeni şifreni belirle. Şifre güncellendikten sonra doğrudan giriş yapabilirsin."
                    : "Set your new password below. Once updated, you can sign in right away."}
                </p>
              </div>
            </div>
          ) : null}

          <div className="auth-entry-panel-head">
            <div>
              <span className="auth-mini-label">{ui.access}</span>
              <h2>{isResetMode ? ui.reset : isSignup ? ui.create : ui.signIn}</h2>
              <p>{isResetMode ? ui.resetHint : isSignup ? ui.createHint : ui.signInHint}</p>
            </div>

            {!resetToken ? (
              <div className="auth-mode-switch" role="tablist" aria-label={ui.access}>
                <button
                  className={`auth-mode-tab ${isSignup ? "is-active" : ""}`}
                  type="button"
                  onClick={() => setMode("signup")}
                >
                  {ui.create}
                </button>
                <button
                  className={`auth-mode-tab ${!isSignup ? "is-active" : ""}`}
                  type="button"
                  onClick={() => setMode("signin")}
                >
                  {ui.signIn}
                </button>
              </div>
            ) : null}
          </div>

          {!isResetMode ? (
            <>
              <a
                href={`/api/auth/google${googleParams.size ? `?${googleParams.toString()}` : ""}`}
                className="auth-google-button"
              >
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span>{ui.google}</span>
              </a>

              <div className="auth-divider">
                <span>{ui.emailDivider}</span>
              </div>
            </>
          ) : null}

          <div className="auth-form">
            {isSignup ? (
              <>
                <div className="auth-form-section">
                  <div className="auth-section-head">
                    <strong>{ui.chooseRole}</strong>
                    <span>{ui.roleHint}</span>
                  </div>
                  <div className="auth-account-grid">
                    {ui.roles.map((item) => {
                      const Icon = roleIcons[item.key];
                      return (
                        <button
                          key={item.key}
                          type="button"
                          className={`auth-account-card ${memberType === item.key ? "is-active" : ""}`}
                          onClick={() => setMemberType(item.key)}
                        >
                          <Icon size={16} />
                          <strong>{item.label}</strong>
                          <span>{item.description}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="auth-input-grid auth-input-grid-double">
                  <label className="auth-field">
                    <span>{ui.name}</span>
                    <input
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder={ui.namePlaceholder}
                    />
                  </label>

                  <label className="auth-field">
                    <span>Email</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="learner@example.com"
                    />
                  </label>
                </div>

                {memberType === "school" ? (
                  <label className="auth-field">
                    <span>{ui.organization}</span>
                    <input
                      type="text"
                      value={organizationName}
                      onChange={(event) => setOrganizationName(event.target.value)}
                      placeholder={ui.organizationPlaceholder}
                    />
                  </label>
                ) : null}

                <button
                  className="auth-optional-toggle"
                  type="button"
                  aria-expanded={showOptionalFields}
                  onClick={() => setShowOptionalFields((current) => !current)}
                >
                  <span>{showOptionalFields ? ui.optionalClose : ui.optionalOpen}</span>
                  <ChevronDown size={16} />
                </button>

                {showOptionalFields ? (
                  <div className="auth-optional-fields">
                    {memberType === "student" ? (
                      <label className="auth-field">
                        <span>{ui.classCode}</span>
                        <input type="text" value={classCode} onChange={(event) => setClassCode(event.target.value)} placeholder={ui.classPlaceholder} />
                      </label>
                    ) : null}
                    {memberType === "teacher" ? (
                      <label className="auth-field">
                        <span>{ui.schoolCode}</span>
                        <input type="text" value={schoolInviteCode} onChange={(event) => setSchoolInviteCode(event.target.value.toUpperCase())} placeholder={ui.schoolPlaceholder} />
                      </label>
                    ) : null}
                    <label className="auth-field">
                      <span>{ui.referral}</span>
                      <input type="text" value={referralCode} onChange={(event) => setReferralCode(event.target.value.toUpperCase())} placeholder={ui.referralPlaceholder} />
                    </label>
                  </div>
                ) : null}
              </>
            ) : !isResetMode ? (
              <label className="auth-field">
                <span>Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="learner@example.com"
                />
              </label>
            ) : null}

            <label className="auth-field">
              <span>{ui.password}</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={ui.passwordPlaceholder}
              />
              <small>
                {ui.passwordHint}
              </small>
            </label>

            {error ? <p className="auth-inline-message auth-inline-error">{error}</p> : null}
            {googleErrorMessage ? <p className="auth-inline-message auth-inline-error">{googleErrorMessage}</p> : null}
            {notice ? <p className="auth-inline-message auth-inline-notice">{notice}</p> : null}
            {needsVerification ? (
              <button
                className="button button-secondary"
                type="button"
                onClick={resendVerification}
                disabled={resendingVerification}
                style={{ width: "100%" }}
              >
                {resendingVerification
                  ? tr
                    ? "Gönderiliyor…"
                    : "Sending…"
                  : tr
                    ? "Doğrulama mailini tekrar gönder"
                    : "Resend verification email"}
              </button>
            ) : null}

            <div className="auth-actions">
              {resetToken ? (
                <button className="button button-primary auth-submit" type="button" onClick={resetPassword}>
                  {ui.reset}
                </button>
              ) : (
                <button className="button button-primary auth-submit" type="button" onClick={submit}>
                  {isSignup ? ui.create : ui.signIn}
                </button>
              )}
              <Link className="button button-secondary auth-guest" href="/app/practice">
                {ui.guest}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
