"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
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
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [successToast, setSuccessToast] = useState("");
  const [forgotMode, setForgotMode] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [handledVerifyToken, setHandledVerifyToken] = useState("");

  useEffect(() => {
    const requestedMode = searchParams.get("mode");
    if (requestedMode === "signin" || requestedMode === "signup") {
      setMode(requestedMode);
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
        name
      })
    });

    const data = (await response.json()) as { error?: string; verificationRequired?: boolean; verificationUrl?: string; needsEmailVerification?: boolean; emailSent?: boolean };
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
          : tr ? "Hesabın oluşturuldu. Giris yapmadan once e-posta dogrulamasi gerekiyor." : "Your account was created. Email verification is required."
      );
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
        setSuccessToast(tr ? "E-posta adresin doğrulandı. Artik giris yapabilirsin." : "Your email address has been verified. You can now sign in.");
        setMode("signin");
      })
      .finally(() => setVerifying(false));
  }, [handledVerifyToken, searchParams, tr, verifying]);

  const requestPasswordReset = async () => {
    setError("");
    setNotice("");
    setSuccessToast("");
    const response = await fetch("/api/auth/request-password-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = (await response.json()) as { error?: string; message?: string; resetUrl?: string; emailSent?: boolean };
    if (!response.ok) {
      setError(data.error ?? (tr ? "Şifre sıfırlama bağlantısı oluşturulamadı." : "Could not create a password reset link."));
      return;
    }
    setSuccessToast(
      data.emailSent
        ? tr ? "Sifre sifirlama maili gonderildi." : "Password reset email sent."
        : tr ? "Sifre sifirlama baglantisi hazirlandi." : "Password reset link prepared."
    );
  };

  const resendVerification = async () => {
    setError("");
    setNotice("");
    setSuccessToast("");
    const response = await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = (await response.json()) as { error?: string; verificationUrl?: string; emailSent?: boolean };
    if (!response.ok) {
      setError(data.error ?? (tr ? "Doğrulama maili yeniden gönderilemedi." : "Could not resend verification link."));
      return;
    }
    setSuccessToast(
      data.emailSent
        ? tr ? "Yeni dogrulama maili gonderildi." : "New verification email sent."
        : tr ? "Yeni dogrulama baglantisi hazirlandi." : "New verification link prepared."
    );
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
    setSuccessToast(tr ? "Sifren guncellendi. Yeni sifrenle giris yapabilirsin." : "Your password has been updated. You can now sign in.");
    setMode("signin");
    setPassword("");
  };

  const resetToken = searchParams.get("reset");

  return (
    <>
      <SiteHeader />
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
                <strong>{tr ? "Mail gonderildi" : "Email sent"}</strong>
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
          <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>
            <button className={`button ${mode === "signup" ? "button-primary" : "button-secondary"}`} type="button" onClick={() => setMode("signup")}>
              {tr ? "Kayıt ol" : "Sign up"}
            </button>
            <button className={`button ${mode === "signin" ? "button-primary" : "button-secondary"}`} type="button" onClick={() => setMode("signin")}>
              {tr ? "Giriş yap" : "Sign in"}
            </button>
          </div>
          {mode === "signup" ? (
            <label style={{ display: "grid", gap: "0.4rem" }}>
              <span>{tr ? "İsim" : "Name"}</span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={tr ? "Ahmet" : "Ahmet"}
                style={{ padding: "0.9rem", borderRadius: 14, border: "1px solid var(--line)" }}
              />
            </label>
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
              placeholder={tr ? "En az 8 karakter ve 1 sayi" : "At least 8 characters and 1 number"}
              style={{ padding: "0.9rem", borderRadius: 14, border: "1px solid var(--line)" }}
            />
            <span style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.55 }}>
              {tr
                ? "Sifren en az 8 karakter olmali ve en az 1 sayi icermeli."
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
          {!resetToken ? (
            <div className="card" style={{ padding: "1rem", display: "grid", gap: "0.8rem", background: "rgba(255,255,255,0.58)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", flexWrap: "wrap", alignItems: "center" }}>
                <strong>{tr ? "Doğrulama ve şifre yardımı" : "Verification and password help"}</strong>
                <button className="button button-secondary" type="button" style={{ padding: "0.55rem 0.9rem" }} onClick={() => setForgotMode((current) => !current)}>
                  {forgotMode ? (tr ? "Kapat" : "Hide") : tr ? "Şifre yardımı" : "Password help"}
                </button>
              </div>
              <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>
                <button className="button button-secondary" type="button" onClick={resendVerification}>
                  {tr ? "Dogrulama mailini yeniden gonder" : "Send verification email again"}
                </button>
                {forgotMode ? (
                  <button className="button button-secondary" type="button" onClick={requestPasswordReset}>
                    {tr ? "Sifre sifirlama maili gonder" : "Send password reset email"}
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </>
  );
}
