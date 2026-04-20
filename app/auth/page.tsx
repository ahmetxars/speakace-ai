"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAppState } from "@/components/providers";
import { clearShareAttribution, getShareAttributionFromStorage } from "@/lib/share-growth";

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
  const tr = language === "tr";
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [memberType, setMemberType] = useState<"student" | "teacher" | "school">("student");
  const [classCode, setClassCode] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [successToast, setSuccessToast] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [handledVerifyToken, setHandledVerifyToken] = useState("");
  const [storedAttributionPath, setStoredAttributionPath] = useState<string | null>(null);
  const inviteReferrerId = searchParams.get("invite");

  useEffect(() => {
    const requestedMode = searchParams.get("mode");
    if (requestedMode === "signin" || requestedMode === "signup") {
      setMode(requestedMode);
    }
    const requestedReferral = searchParams.get("ref");
    if (requestedReferral) {
      setReferralCode(requestedReferral.toUpperCase());
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
      }
      return;
    }

    if (mode === "signup" && data.verificationRequired) {
      clearShareAttribution();
      setSuccessToast(
        data.emailSent
          ? tr ? "Hesabın oluşturuldu. Doğrulama maili gönderildi." : "Your account was created. Verification email sent."
          : tr ? "Hesabın oluşturuldu. Giriş yapmadan önce e-posta doğrulaması gerekiyor." : "Your account was created. Email verification is required."
      );
      if (data.classJoinMessage) {
        setNotice(data.classJoinMessage);
      }
      return;
    }

    if (mode === "signup") {
      clearShareAttribution();
    }
    await refreshSession();
    router.push("/app");
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
        const data = (await response.json()) as { error?: string };
        if (!response.ok) {
          setError(data.error ?? (tr ? "Doğrulama işlemi başarısız oldu." : "Verification failed."));
          return;
        }
        setSuccessToast(tr ? "E-posta adresin doğrulandı. Artık giriş yapabilirsin." : "Your email address has been verified. You can now sign in.");
        setMode("signin");
      })
      .finally(() => setVerifying(false));
  }, [handledVerifyToken, searchParams, tr, verifying]);

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
  const googleParams = new URLSearchParams();
  if (cta) {
    googleParams.set("cta", cta);
  }
  if (ctaEvent) {
    googleParams.set("cta_event", ctaEvent);
  }
  if (inviteReferrerId) {
    googleParams.set("invite", inviteReferrerId);
  }

  const resetToken = searchParams.get("reset");
  const isResetMode = Boolean(resetToken);
  const isSignup = !isResetMode && mode === "signup";
  const featureItems = tr
    ? [
        "2 dakikada hesap oluştur, hemen konuşma pratiğine başla",
        "İlerleme, sonuçlar ve çalışma planın tek yerde toplansın",
        "Öğrenci, öğretmen ve kurum için ayrı onboarding akışı"
      ]
    : [
        "Create your account in 2 minutes and start practicing right away",
        "Keep your progress, results, and study plan in one place",
        "Tailored onboarding for students, teachers, and schools"
      ];
  const accountTypeOptions = [
    {
      key: "student",
      label: tr ? "Öğrenci" : "Student",
      description: tr ? "Sınıfa katıl, ödevleri ve skorları takip et." : "Join a class and track homework and scores."
    },
    {
      key: "teacher",
      label: tr ? "Öğretmen" : "Teacher",
      description: tr ? "Öğrenci takibi ve sınıf yönetimi için." : "For student tracking and class management."
    },
    {
      key: "school",
      label: tr ? "Kurum" : "School",
      description: tr ? "Kurum genelinde kullanım ve ekip erişimi." : "For institution-wide usage and team access."
    }
  ] as const;

  return (
    <main className="page-shell section auth-shell">
      <div className="auth-layout">
        <section className="auth-showcase">
          <span className="eyebrow auth-eyebrow">{tr ? "Güvenli giriş" : "Secure auth"}</span>
          <h1>
            {isResetMode
              ? tr
                ? "Yeni şifreni belirle"
                : "Set your new password"
              : isSignup
                ? tr
                  ? "Dağınık değil, net bir başlangıç"
                  : "A cleaner way to get started"
                : tr
                  ? "Tekrar hoş geldin"
                  : "Welcome back"}
          </h1>
          <p className="auth-showcase-copy">
            {isResetMode
              ? tr
                ? "Bu ekranda sadece gerekli adımı gösteriyoruz: yeni şifreni belirle ve hesabına güvenle geri dön."
                : "This screen only shows what you need right now: set a new password and get back into your account securely."
              : isSignup
              ? tr
                ? "SpeakAce hesabını gereksiz kalabalık olmadan oluştur. Önce ana hesabını aç, sonra sana uygun akışla devam et."
                : "Create your SpeakAce account without the clutter. Start with the essentials, then continue with the flow that fits you."
              : tr
                ? "Hesabına geri dön, çalışmalarını kaldığın yerden sürdür. Oturum bilgisi güvenli çerezlerle sunucuda korunur."
                : "Get back to your account and continue where you left off. Session state is protected on the server with secure cookies."}
          </p>

          <div className="auth-feature-list">
            {featureItems.map((item) => (
              <div key={item} className="auth-feature-item">
                <span className="auth-feature-check" aria-hidden="true">
                  ✓
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="auth-metrics">
            <div className="auth-metric-card">
              <strong>{tr ? "Tek ekran" : "One focused screen"}</strong>
              <span>{tr ? "Karar yorgunluğunu azaltan sade akış" : "A stripped-back flow with less decision fatigue"}</span>
            </div>
            <div className="auth-metric-card">
              <strong>{tr ? "Rol bazlı giriş" : "Role-based setup"}</strong>
              <span>{tr ? "Öğrenci, öğretmen veya kurum için net ayrım" : "Clear setup for student, teacher, or school"}</span>
            </div>
          </div>
        </section>

        <section className="card auth-panel">
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

          <div className="auth-panel-head">
            <div>
              <span className="auth-mini-label">{tr ? "Hesap erişimi" : "Account access"}</span>
              <h2>
                {isResetMode
                  ? tr
                    ? "Şifre yenile"
                    : "Reset password"
                  : isSignup
                    ? tr
                      ? "Hesap oluştur"
                      : "Create account"
                    : tr
                      ? "Giriş yap"
                      : "Sign in"}
              </h2>
              <p>
                {isResetMode
                  ? tr
                    ? "Yeni şifreni gir ve hesabına erişimini geri kazan."
                    : "Enter a new password to regain access to your account."
                  : isSignup
                  ? tr
                    ? "İlk adımda sadece gerekli bilgileri alıyoruz."
                    : "We only ask for the essentials in the first step."
                  : tr
                    ? "E-posta ve şifrenle hesabına güvenle geri dön."
                    : "Use your email and password to get back in securely."}
              </p>
            </div>

            {!resetToken ? (
              <div className="auth-mode-switch" role="tablist" aria-label={tr ? "Giriş modu" : "Auth mode"}>
                <button
                  className={`auth-mode-tab ${isSignup ? "is-active" : ""}`}
                  type="button"
                  onClick={() => setMode("signup")}
                >
                  {tr ? "Kayıt ol" : "Sign up"}
                </button>
                <button
                  className={`auth-mode-tab ${!isSignup ? "is-active" : ""}`}
                  type="button"
                  onClick={() => setMode("signin")}
                >
                  {tr ? "Giriş yap" : "Sign in"}
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
                <span>{tr ? "Google ile devam et" : "Continue with Google"}</span>
              </a>

              <div className="auth-divider">
                <span>{tr ? "veya e-posta ile devam et" : "or continue with email"}</span>
              </div>
            </>
          ) : null}

          <div className="auth-form">
            {isSignup ? (
              <>
                <div className="auth-form-section">
                  <div className="auth-section-head">
                    <strong>{tr ? "Hesap türünü seç" : "Choose your account type"}</strong>
                    <span>{tr ? "Sonraki deneyimi buna göre hazırlayalım." : "We'll tailor the next steps based on this."}</span>
                  </div>
                  <div className="auth-account-grid">
                    {accountTypeOptions.map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        className={`auth-account-card ${memberType === item.key ? "is-active" : ""}`}
                        onClick={() => setMemberType(item.key)}
                      >
                        <strong>{item.label}</strong>
                        <span>{item.description}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="auth-input-grid auth-input-grid-double">
                  <label className="auth-field">
                    <span>{tr ? "İsim" : "Name"}</span>
                    <input
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder={tr ? "Adın soyadın" : "Your full name"}
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

                {memberType === "student" ? (
                  <label className="auth-field">
                    <span>{tr ? "Sınıf kodu" : "Class code"}</span>
                    <input
                      type="text"
                      value={classCode}
                      onChange={(event) => setClassCode(event.target.value)}
                      placeholder={tr ? "Varsa öğretmeninden aldığın kod" : "Add the code your teacher shared, if you have one"}
                    />
                    <small>
                      {tr
                        ? "Opsiyonel. Eklersen hesabın kayıt sonrası doğrudan sınıfa bağlanır."
                        : "Optional. If you add one, your account will connect to the class right after signup."}
                    </small>
                  </label>
                ) : null}

                {memberType === "school" ? (
                  <label className="auth-field">
                    <span>{tr ? "Kurum adı" : "School or organization name"}</span>
                    <input
                      type="text"
                      value={organizationName}
                      onChange={(event) => setOrganizationName(event.target.value)}
                      placeholder={tr ? "Örn. SpeakAce Academy" : "Example: SpeakAce Academy"}
                    />
                  </label>
                ) : null}

                <label className="auth-field">
                  <span>{tr ? "Referans kodu" : "Referral code"}</span>
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(event) => setReferralCode(event.target.value.toUpperCase())}
                    placeholder={tr ? "Opsiyonelse boş bırakabilirsin" : "Leave blank if you don't have one"}
                  />
                  <small>
                    {tr
                      ? "Opsiyonel. Uygun bir kampanya varsa otomatik uygulanır."
                      : "Optional. Any eligible promotion will be applied automatically."}
                  </small>
                </label>
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
              <span>{tr ? "Şifre" : "Password"}</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={tr ? "En az 8 karakter ve 1 sayı" : "At least 8 characters and 1 number"}
              />
              <small>
                {tr
                  ? "Şifren en az 8 karakter olmalı ve en az 1 sayı içermeli."
                  : "Your password must be at least 8 characters long and include at least 1 number."}
              </small>
            </label>

            {error ? <p className="auth-inline-message auth-inline-error">{error}</p> : null}
            {notice ? <p className="auth-inline-message auth-inline-notice">{notice}</p> : null}

            <div className="auth-actions">
              {resetToken ? (
                <button className="button button-primary auth-submit" type="button" onClick={resetPassword}>
                  {tr ? "Şifreyi yenile" : "Reset password"}
                </button>
              ) : (
                <button className="button button-primary auth-submit" type="button" onClick={submit}>
                  {isSignup ? (tr ? "Hesap oluştur" : "Create account") : tr ? "Giriş yap" : "Sign in"}
                </button>
              )}
              <Link className="button button-secondary auth-guest" href="/app/practice">
                {tr ? "Misafir olarak devam et" : "Continue as guest"}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
