"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAppState } from "@/components/providers";

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

  const submit = async () => {
    setError("");
    setNotice("");
    setSuccessToast("");
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
        attributionPath: searchParams.get("cta") ?? null,
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

  const resetToken = searchParams.get("reset");

  return (
    <>
      <main className="page-shell section">
        <div className="card" style={{ padding: "1.5rem", maxWidth: 620, margin: "0 auto", display: "grid", gap: "1rem" }}>
          {successToast ? (
            <div
              className="card"
              style={{
                padding: "1rem 1.1rem",
                background: "rgba(47, 125, 75, 0.12)",
                borderColor: "rgba(47, 125, 75, 0.24)",
                display: "flex",
                alignItems: "center",
                gap: "0.8rem"
              }}
            >
              <span style={{ fontSize: "1.35rem", lineHeight: 1 }} aria-hidden="true">
                ✓
              </span>
              <div style={{ display: "grid", gap: "0.18rem" }}>
                <strong>{tr ? "Mail gönderildi" : "Email sent"}</strong>
                <span style={{ color: "var(--muted)", lineHeight: 1.55 }}>{successToast}</span>
              </div>
            </div>
          ) : null}
          <span className="eyebrow">{tr ? "Güvenli giriş" : "Secure auth"}</span>
          <h1 style={{ margin: 0 }}>{mode === "signup" ? (tr ? "Speaking hesabını oluştur" : "Create your speaking dashboard") : tr ? "Tekrar hoş geldin" : "Welcome back"}</h1>
          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
            {tr ? "E-posta adresin ve şifrenle hesabını oluştur. Oturum bilgisi güvenli bir çerez ile sunucuda saklanır." : "Create a real account with email and password. Session state is stored on the server with a secure cookie."}
          </p>
          {resetToken ? (
            <div className="card" style={{ padding: "1rem", background: "rgba(29, 111, 117, 0.08)" }}>
              <strong>{tr ? "Şifreni yenile" : "Reset your password"}</strong>
              <p style={{ margin: "0.55rem 0 0", lineHeight: 1.7 }}>
                {tr ? "Bu sayfa şifreni güvenli şekilde yenilemen için açıldı. Aşağıdan yeni bir şifre belirleyebilirsin." : "This page was opened to securely reset your password. Choose a new password below."}
              </p>
            </div>
          ) : null}
          {/* Google OAuth */}
          <a
            href={`/api/auth/google${searchParams.get("cta") ? `?${new URLSearchParams({
              cta: searchParams.get("cta") ?? "",
              cta_event: searchParams.get("cta_event") ?? ""
            }).toString()}` : ""}`}
            className="button button-secondary"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.65rem",
              fontWeight: 600,
              border: "1px solid var(--line)",
              borderRadius: 14,
              padding: "0.85rem 1rem",
              textDecoration: "none"
            }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            {tr ? "Google ile devam et" : "Continue with Google"}
          </a>

          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", color: "var(--muted)", fontSize: "0.85rem" }}>
            <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
            {tr ? "veya e-posta ile" : "or continue with email"}
            <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
          </div>

          <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>
            <button className={`button ${mode === "signup" ? "button-primary" : "button-secondary"}`} type="button" onClick={() => setMode("signup")}>
              {tr ? "Kayıt ol" : "Sign up"}
            </button>
            <button className={`button ${mode === "signin" ? "button-primary" : "button-secondary"}`} type="button" onClick={() => setMode("signin")}>
              {tr ? "Giriş yap" : "Sign in"}
            </button>
          </div>
          {mode === "signup" ? (
            <>
              <div style={{ display: "grid", gap: "0.55rem" }}>
                <span>{tr ? "Hesap türü" : "Account type"}</span>
                <div style={{ display: "flex", gap: "0.55rem", flexWrap: "wrap" }}>
                  {[
                    { key: "student", en: "Student", tr: "Öğrenci" },
                    { key: "teacher", en: "Teacher", tr: "Öğretmen" },
                    { key: "school", en: "School", tr: "Kurum" }
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      className={`button ${memberType === item.key ? "button-primary" : "button-secondary"}`}
                      onClick={() => setMemberType(item.key as typeof memberType)}
                    >
                      {tr ? item.tr : item.en}
                    </button>
                  ))}
                </div>
              </div>
              <label style={{ display: "grid", gap: "0.4rem" }}>
                <span>{tr ? "İsim" : "Name"}</span>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={tr ? "İsim" : "Name"}
                  style={{ padding: "0.9rem", borderRadius: 14, border: "1px solid var(--line)" }}
                />
              </label>
              {memberType === "student" ? (
                <label style={{ display: "grid", gap: "0.4rem" }}>
                  <span>{tr ? "Sınıf kodu (opsiyonel)" : "Class code (optional)"}</span>
                  <input
                    type="text"
                    value={classCode}
                    onChange={(event) => setClassCode(event.target.value)}
                    placeholder={tr ? "Öğretmenin verdiyse ekle" : "Add it if your teacher gave you one"}
                    style={{ padding: "0.9rem", borderRadius: 14, border: "1px solid var(--line)" }}
                  />
                  <span style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.55 }}>
                    {tr
                      ? "Kod girersen hesabın kayıt sonrası doğrudan öğretmenin sınıfına bağlanır."
                      : "If you enter a class code, your account will connect to your teacher's class right after signup."}
                  </span>
                </label>
              ) : null}
              {memberType === "school" ? (
                <label style={{ display: "grid", gap: "0.4rem" }}>
                  <span>{tr ? "Kurum adı" : "School or organization name"}</span>
                  <input
                    type="text"
                    value={organizationName}
                    onChange={(event) => setOrganizationName(event.target.value)}
                    placeholder={tr ? "Örn. SpeakAce Academy" : "Example: SpeakAce Academy"}
                    style={{ padding: "0.9rem", borderRadius: 14, border: "1px solid var(--line)" }}
                  />
                </label>
              ) : null}
              <label style={{ display: "grid", gap: "0.4rem" }}>
                <span>{tr ? "Referans kodu (opsiyonel)" : "Referral code (optional)"}</span>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(event) => setReferralCode(event.target.value.toUpperCase())}
                  placeholder={tr ? "Örn. SPEAKACE7" : "Example: SPEAKACE7"}
                  style={{ padding: "0.9rem", borderRadius: 14, border: "1px solid var(--line)" }}
                />
                <span style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.55 }}>
                  {tr
                    ? "Geçerli bir kod girersen 1 haftalık ücretsiz deneme gibi kampanyalar otomatik uygulanır."
                    : "If you enter a valid code, offers like a 1-week free trial will be applied automatically."}
                </span>
              </label>
            </>
          ) : null}
          <label style={{ display: "grid", gap: "0.4rem" }}>
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="learner@example.com"
              style={{ padding: "0.9rem", borderRadius: 14, border: "1px solid var(--line)" }}
            />
          </label>
          <label style={{ display: "grid", gap: "0.4rem" }}>
            <span>{tr ? "Şifre" : "Password"}</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={tr ? "En az 8 karakter ve 1 sayı" : "At least 8 characters and 1 number"}
              style={{ padding: "0.9rem", borderRadius: 14, border: "1px solid var(--line)" }}
            />
            <span style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.55 }}>
              {tr
                ? "Şifren en az 8 karakter olmalı ve en az 1 sayı içermeli."
                : "Your password must be at least 8 characters long and include at least 1 number."}
            </span>
          </label>
          {error ? <p style={{ color: "var(--accent-deep)", margin: 0 }}>{error}</p> : null}
          {notice ? <p style={{ color: "var(--success)", margin: 0, lineHeight: 1.65 }}>{notice}</p> : null}
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            {resetToken ? (
              <button className="button button-primary" type="button" onClick={resetPassword}>
                {tr ? "Şifreyi yenile" : "Reset password"}
              </button>
            ) : (
              <button className="button button-primary" type="button" onClick={submit}>
                {mode === "signup" ? (tr ? "Hesap oluştur" : "Create account") : tr ? "Giriş yap" : "Sign in"}
              </button>
            )}
            <Link className="button button-secondary" href="/app/practice">
              {tr ? "Misafir olarak devam et" : "Continue as guest"}
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
