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
  const [actionUrl, setActionUrl] = useState("");
  const [forgotMode, setForgotMode] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [handledVerifyToken, setHandledVerifyToken] = useState("");

  const submit = async () => {
    setError("");
    setNotice("");
    setActionUrl("");
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
      setError(data.error ?? (tr ? "Kimlik dogrulama basarisiz oldu." : "Authentication failed."));
      if (data.needsEmailVerification) {
        setNotice(tr ? "Giris yapmadan once e-postani dogrulaman gerekiyor. Aşağıdan yeni dogrulama linki isteyebilirsin." : "You need to verify your email before signing in. You can request a new verification link below.");
      }
      return;
    }

    if (mode === "signup" && data.verificationRequired) {
      setNotice(
        data.emailSent
          ? tr ? "Hesabin olusturuldu. Dogrulama maili gonderildi, lutfen gelen kutunu kontrol et." : "Your account was created. A verification email has been sent, so please check your inbox."
          : tr ? "Hesabin olusturuldu. Giris yapmadan once e-posta dogrulamasi gerekli." : "Your account was created. Email verification is required before signing in."
      );
      setActionUrl(data.verificationUrl ?? "");
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
    fetch(`/api/auth/verify-email?token=${encodeURIComponent(verifyToken)}`)
      .then(async (response) => {
        const data = (await response.json()) as { error?: string };
        if (!response.ok) {
          setError(data.error ?? (tr ? "Dogrulama basarisiz oldu." : "Verification failed."));
          return;
        }
        setNotice(tr ? "E-posta adresin dogrulandi. Artik giris yapabilirsin." : "Your email address has been verified. You can sign in now.");
        setMode("signin");
      })
      .finally(() => setVerifying(false));
  }, [handledVerifyToken, searchParams, tr, verifying]);

  const requestPasswordReset = async () => {
    setError("");
    setNotice("");
    setActionUrl("");
    const response = await fetch("/api/auth/request-password-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = (await response.json()) as { error?: string; message?: string; resetUrl?: string; emailSent?: boolean };
    if (!response.ok) {
      setError(data.error ?? (tr ? "Sifre sifirlama linki olusturulamadi." : "Could not create a password reset link."));
      return;
    }
    setNotice(
      data.emailSent
        ? tr ? "Eger hesap varsa sifre sifirlama maili gonderildi." : "If the account exists, a password reset email has been sent."
        : tr ? "Eger hesap varsa sifre sifirlama linki hazirlandi." : "If the account exists, a password reset link is ready."
    );
    setActionUrl(data.resetUrl ?? "");
  };

  const resendVerification = async () => {
    setError("");
    setNotice("");
    setActionUrl("");
    const response = await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = (await response.json()) as { error?: string; verificationUrl?: string; emailSent?: boolean };
    if (!response.ok) {
      setError(data.error ?? (tr ? "Dogrulama linki tekrar gonderilemedi." : "Could not resend verification link."));
      return;
    }
    setNotice(
      data.emailSent
        ? tr ? "Eger hesap hala dogrulanmadiysa yeni dogrulama maili gonderildi." : "If the account is still unverified, a new verification email has been sent."
        : tr ? "Eger hesap hala dogrulanmadiysa yeni link hazirlandi." : "If the account is still unverified, a new link is ready."
    );
    setActionUrl(data.verificationUrl ?? "");
  };

  const resetPassword = async () => {
    const resetToken = searchParams.get("reset");
    if (!resetToken) return;
    setError("");
    setNotice("");
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: resetToken, password })
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(data.error ?? (tr ? "Sifre sifirlanamadi." : "Password could not be reset."));
      return;
    }
    setNotice(tr ? "Sifren guncellendi. Simdi yeni sifrenle giris yapabilirsin." : "Your password has been updated. You can now sign in with the new password.");
    setMode("signin");
    setPassword("");
  };

  const resetToken = searchParams.get("reset");

  return (
    <>
      <SiteHeader />
      <main className="page-shell section">
        <div className="card" style={{ padding: "1.5rem", maxWidth: 620, margin: "0 auto", display: "grid", gap: "1rem" }}>
          <span className="eyebrow">{tr ? "Guvenli giris" : "Secure auth"}</span>
          <h1 style={{ margin: 0 }}>{mode === "signup" ? (tr ? "Speaking panelini olustur" : "Create your speaking dashboard") : tr ? "Tekrar hos geldin" : "Welcome back"}</h1>
          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
            {tr ? "E-posta ve sifre ile gercek bir hesap olustur. Session durumu guvenli cookie ile sunucuda tutulur." : "Create a real account with email and password. Session state is stored on the server with a secure cookie."}
          </p>
          {resetToken ? (
            <div className="card" style={{ padding: "1rem", background: "rgba(29, 111, 117, 0.08)" }}>
              <strong>{tr ? "Sifreyi yenile" : "Reset your password"}</strong>
              <p style={{ margin: "0.55rem 0 0", lineHeight: 1.7 }}>
                {tr ? "Bu sayfa sifreni guvenli sekilde yenilemek icin acildi. Asagida yeni bir sifre belirle." : "This page was opened to securely reset your password. Choose a new password below."}
              </p>
            </div>
          ) : null}
          <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>
            <button className={`button ${mode === "signup" ? "button-primary" : "button-secondary"}`} type="button" onClick={() => setMode("signup")}>
              {tr ? "Kayit ol" : "Sign up"}
            </button>
            <button className={`button ${mode === "signin" ? "button-primary" : "button-secondary"}`} type="button" onClick={() => setMode("signin")}>
              {tr ? "Giris yap" : "Sign in"}
            </button>
          </div>
          <label style={{ display: "grid", gap: "0.4rem" }}>
            <span>{tr ? "Isim" : "Name"}</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={tr ? "Ahmet" : "Ahmet"}
              style={{ padding: "0.9rem", borderRadius: 14, border: "1px solid var(--line)" }}
              disabled={mode === "signin"}
            />
          </label>
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
            <span>{tr ? "Sifre" : "Password"}</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={tr ? "En az 8 karakter" : "At least 8 characters"}
              style={{ padding: "0.9rem", borderRadius: 14, border: "1px solid var(--line)" }}
            />
          </label>
          {error ? <p style={{ color: "var(--accent-deep)", margin: 0 }}>{error}</p> : null}
          {notice ? <p style={{ color: "var(--success)", margin: 0, lineHeight: 1.65 }}>{notice}</p> : null}
          {actionUrl ? (
            <div className="card" style={{ padding: "1rem", background: "rgba(255,255,255,0.6)" }}>
              <strong>{tr ? "Yedek link" : "Fallback link"}</strong>
              <p style={{ margin: "0.55rem 0 0.6rem", lineHeight: 1.65, color: "var(--muted)" }}>
                {tr ? "Mail servisi tam baglanana kadar bu link ile akisi manuel olarak da test edebilirsin." : "Until the email provider is fully connected, you can still test the flow manually with this link."}
              </p>
              <a href={actionUrl} style={{ color: "var(--accent-deep)", fontWeight: 700, wordBreak: "break-all" }}>{actionUrl}</a>
            </div>
          ) : null}
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            {resetToken ? (
              <button className="button button-primary" type="button" onClick={resetPassword}>
                {tr ? "Sifreyi yenile" : "Reset password"}
              </button>
            ) : (
              <button className="button button-primary" type="button" onClick={submit}>
                {mode === "signup" ? (tr ? "Hesap olustur" : "Create account") : tr ? "Giris yap" : "Sign in"}
              </button>
            )}
            <Link className="button button-secondary" href="/app/practice">
              {tr ? "Misafir olarak devam et" : "Continue as guest"}
            </Link>
          </div>
          {!resetToken ? (
            <div className="card" style={{ padding: "1rem", display: "grid", gap: "0.8rem", background: "rgba(255,255,255,0.58)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", flexWrap: "wrap", alignItems: "center" }}>
                <strong>{tr ? "Dogrulama ve sifre yardimi" : "Verification and password help"}</strong>
                <button className="button button-secondary" type="button" style={{ padding: "0.55rem 0.9rem" }} onClick={() => setForgotMode((current) => !current)}>
                  {forgotMode ? (tr ? "Kapat" : "Hide") : tr ? "Sifre yardimi" : "Password help"}
                </button>
              </div>
              <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>
                <button className="button button-secondary" type="button" onClick={resendVerification}>
                  {tr ? "Dogrulama linkini tekrar hazirla" : "Prepare a new verification link"}
                </button>
                {forgotMode ? (
                  <button className="button button-secondary" type="button" onClick={requestPasswordReset}>
                    {tr ? "Sifre sifirlama linki hazirla" : "Prepare password reset link"}
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
