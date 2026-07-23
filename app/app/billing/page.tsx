"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { TrackedLink } from "@/components/tracked-link";
import {
  buildPlanCheckoutPath,
  commerceConfig,
  commerceNumbers,
  couponCatalog,
  formatUsd,
  getAnnualMonthlyEquivalent,
  getAnnualSavingsPercentFromWeekly,
  getPlanComparison
} from "@/lib/commerce";
import { useAppState } from "@/components/providers";
import { resolveDashboardRole } from "@/lib/roles";

export default function BillingPage() {
  const router = useRouter();
  const { currentUser, signedIn, language, refreshSession } = useAppState();
  const tr = language === "tr";
  const dashboardRole = resolveDashboardRole(currentUser);
  const comparison = getPlanComparison(tr);
  const plusAnnualMonthlyEquivalent = getAnnualMonthlyEquivalent(commerceNumbers.plusAnnualPrice);
  const plusAnnualSavings = getAnnualSavingsPercentFromWeekly(commerceNumbers.plusWeeklyPrice, commerceNumbers.plusAnnualPrice);
  const isPaidPlan = currentUser?.plan === "plus" || currentUser?.plan === "pro" || currentUser?.plan === "lifetime";
  const planOutcome = useMemo(
    () =>
      tr
        ? [
            "Daha fazla gunluk speaking hacmi",
            "Daha guclu transcript ve skor icgorusu",
            "Daha hizli retry ve ilerleme dongusu"
          ]
        : [
            "More daily speaking volume",
            "Stronger transcript and score insight",
            "Faster retry and improvement loops"
          ],
    [tr]
  );
  const growthLoopActions = useMemo(
    () =>
      tr
        ? [
            "Bugun bir speaking oturumu daha acip yeni limiti kullan.",
            "Ayni gun retry yaparak geri bildirimi ikinci cevaba uygula.",
            "Memnunsan bir arkadasini referral linkinle davet et."
          ]
        : [
            "Open another speaking session today and use the new limit.",
            "Retry on the same day and apply the feedback to a second answer.",
            "If the product is working for you, invite one friend through your referral link."
          ],
    [tr]
  );
  const purchaseDecisionGuide = useMemo(
    () =>
      currentUser?.plan === "free"
        ? {
            heading: tr ? "En dusuk surtunmeli baslangic" : "Lowest-friction start",
            title: tr ? "3 gunluk Plus denemesini haftalik planla baslat" : "Start the 3-day Plus trial on the weekly plan",
            detail: tr
              ? `Once 3 gun boyunca tam geri bildirim ve retry dongusunu dene. Deneme sonrasinda Plus haftalik $3.99 ile devam eder; uzun hazirlik yapacaksan yillik secenek yaklasik %${plusAnnualSavings} tasarruf saglar.`
              : `Try the full feedback and retry loop for 3 days first. Plus then continues at $3.99/week; if you already expect a longer prep cycle, annual saves about ${plusAnnualSavings}%.`,
            ctaLabel: tr ? "3 gunluk Plus denemesini baslat" : "Start the 3-day Plus trial",
            ctaHref: buildPlanCheckoutPath({ plan: "plus", coupon: couponCatalog.LAUNCH20.code, campaign: "billing_decision_weekly" }),
            secondaryLabel: tr ? "Uzun hazirlik: yillik" : "Longer prep: annual",
            secondaryHref: buildPlanCheckoutPath({ plan: "plus", billing: "annual", coupon: couponCatalog.LAUNCH20.code, campaign: "billing_decision_annual" })
          }
        : currentUser?.plan === "plus"
          ? {
              heading: tr ? "Bir sonraki gelir adimi" : "Next revenue step",
              title: tr ? "Pro sadece daha agir kullanimda mantikli" : "Pro makes sense only for heavier usage",
              detail: tr
                ? "Plus zaten acik. Daha yogun calisiyor ve daha fazla speaking hacmi istiyorsan Pro'ya gec; aksi halde once kullanim aliskanligini buyut."
                : "Plus is already active. Upgrade to Pro only if you are pushing a heavier study routine and want more volume; otherwise keep compounding usage first.",
              ctaLabel: tr ? "Yillik Pro'ya bak" : "View Pro Annual",
              ctaHref: buildPlanCheckoutPath({ plan: "pro", billing: "annual", campaign: "billing_decision_pro" }),
              secondaryLabel: tr ? "Once practice yap" : "Practice first",
              secondaryHref: "/app/practice"
            }
          : {
              heading: tr ? "Plan aktif" : "Plan active",
              title: tr ? "Su an odak kullanimi buyutmek" : "The focus now is growing usage",
              detail: tr
                ? "Planin zaten acik. En iyi sonraki adim practice ve referral dongusunu calistirmak."
                : "Your paid plan is already active. The best next move is to increase usage and activate the referral loop.",
              ctaLabel: tr ? "Practice ac" : "Open practice",
              ctaHref: "/app/practice",
              secondaryLabel: tr ? "Referral merkezi" : "Referral center",
              secondaryHref: "/app/referrals"
            },
    [currentUser?.plan, plusAnnualSavings, tr]
  );
  const purchaseConfidencePoints = useMemo(
    () =>
      tr
        ? [
            "Checkout ayni hesaba baglanir, yeni hesap acman gerekmez.",
            "3 gunluk deneme sonrasinda plan haftalik $3.99 ile devam eder; billing sayfasindan yonetebilirsin.",
            "Ilk satin almada LAUNCH20 kodu ile daha yumusak giris yapabilirsin."
          ]
        : [
            "Checkout stays on the same account, so you do not need a second login.",
            "After the 3-day trial, the plan continues at $3.99/week and can be managed from billing.",
            `For a softer first purchase, you can use ${couponCatalog.LAUNCH20.code}.`
          ],
    [tr]
  );

  useEffect(() => {
    if (dashboardRole === "teacher") {
      router.replace("/app/teacher");
      return;
    }
    if (dashboardRole === "school") {
      router.replace("/app/teacher/billing");
    }
  }, [dashboardRole, router]);

  if (dashboardRole === "teacher" || dashboardRole === "school") {
    return null;
  }

  if (!signedIn) {
    return (
      <main className="page-shell section">
        <div className="card" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
          <span className="eyebrow">{tr ? "Ödeme" : "Billing"}</span>
          <h1 style={{ margin: 0 }}>{tr ? "Ödeme ayarları için giriş yap" : "Sign in to manage billing"}</h1>
          <p style={{ color: "var(--muted)", maxWidth: 720 }}>
            {tr ? "Fiyatları ana sayfada görebilirsin. Ücretli plan satın almak ve fatura bilgilerini yönetmek için önce giriş yapman gerekir." : "You can view pricing on the home page. To purchase a paid plan and manage invoices, sign in first."}
          </p>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <Link className="button button-primary" href="/auth">
              {tr ? "Giriş yap" : "Sign in"}
            </Link>
            <a className="button button-secondary" href={commerceConfig.plusCheckoutPath}>
              {tr ? "Plus planını gör" : "View Plus plan"}
            </a>
            <Link className="button button-secondary" href="/pricing">
              {tr ? "Fiyatlara dön" : "Back to pricing"}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell section">
      <div className="card" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
        <span className="eyebrow">{tr ? "Ödeme" : "Billing"}</span>
        <h1 style={{ margin: 0 }}>{tr ? "SpeakAce Plus veya Pro ile daha fazla speaking pratiği aç" : "Unlock more speaking practice with SpeakAce Plus or Pro"}</h1>
        <p style={{ color: "var(--muted)", maxWidth: 720 }}>
          {tr ? "Ücretli plan, sadece daha fazla limit değil; ayni gun daha fazla speaking denemesi, daha derin AI geri bildirimi ve daha hizli retry dongusu aciyor." : "A paid plan does more than raise limits. It unlocks same-day retries, deeper AI feedback, and a faster improvement loop."}
        </p>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)" }}>
            <strong>{tr ? "Mevcut plan" : "Current plan"}</strong>
            <p>{currentUser?.plan?.toUpperCase() ?? "FREE"}</p>
          </div>
          <div className="card" style={{ padding: "1rem", background: "rgba(29, 111, 117, 0.08)" }}>
            <strong>{commerceConfig.plusPlanName} · {commerceConfig.plusMonthlyPrice}/week</strong>
            <p>{tr ? `Ilk upgrade icin en net teklif: bugun devam et, daha fazla speaking yap, ayni prompt'u geri bildirimle tekrar dene. Yillik planda aylik maliyet ${formatUsd(plusAnnualMonthlyEquivalent)} seviyesine iner.` : `The clearest first upgrade: continue today, practice more, and retry the same prompt with stronger feedback. On annual billing the monthly equivalent drops to about ${formatUsd(plusAnnualMonthlyEquivalent)}.`}</p>
          </div>
          <div className="card" style={{ padding: "1rem", background: "rgba(201,162,39,0.08)", border: "1px solid rgba(201,162,39,0.3)" }}>
            <strong style={{ color: "#b38600" }}>{commerceConfig.proPlanName} · {commerceConfig.proAnnualPrice}/year</strong>
            <p>{tr ? "Daha agir kullanim veya yogun calisma rutini icin yillik ikinci adim. Cogu ilk odeme once Plus ile daha kolay yapilir." : "A verified annual option for heavier usage or an intense study routine. Most first purchases convert more easily through Plus."}</p>
          </div>
        </div>
        <div className="card" style={{ padding: "1rem", background: "rgba(255,255,255,0.6)" }}>
          <strong>{tr ? "Free ve Plus karşılaştırması" : "Free vs Plus"}</strong>
          <div style={{ display: "grid", gap: "0.65rem", marginTop: "0.8rem" }}>
            {comparison.map((item) => (
              <div key={item.label} style={{ display: "grid", gridTemplateColumns: "minmax(160px, 1fr) 110px 110px", gap: "0.7rem" }}>
                <span>{item.label}</span>
                <span className="practice-meta">{item.free}</span>
                <strong>{item.plus}</strong>
              </div>
            ))}
          </div>
        </div>
        <div
          className="card"
          style={{
            padding: "1rem",
            display: "grid",
            gap: "0.9rem",
            background: "linear-gradient(135deg, rgba(29, 111, 117, 0.08) 0%, rgba(255, 255, 255, 0.98) 100%)"
          }}
        >
          <div>
            <span className="eyebrow" style={{ marginBottom: "0.45rem", display: "inline-flex" }}>{purchaseDecisionGuide.heading}</span>
            <h2 style={{ margin: 0, fontSize: "1.25rem" }}>{purchaseDecisionGuide.title}</h2>
            <p style={{ margin: "0.55rem 0 0", color: "var(--muted)", lineHeight: 1.7 }}>{purchaseDecisionGuide.detail}</p>
          </div>
          {currentUser?.plan === "free" ? (
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.8rem" }}>
              <div className="card" style={{ padding: "0.95rem", background: "rgba(255,255,255,0.82)" }}>
                <strong>{tr ? "Yillik fiyat avantaji" : "Annual value edge"}</strong>
                <div style={{ fontSize: "1.35rem", fontWeight: 700, marginTop: "0.35rem" }}>%{plusAnnualSavings}</div>
                <p style={{ margin: "0.35rem 0 0", color: "var(--muted)" }}>
                  {tr ? "Haftalik odemeye gore yaklasik tasarruf" : "Approximate savings versus paying weekly"}
                </p>
              </div>
              <div className="card" style={{ padding: "0.95rem", background: "rgba(255,255,255,0.82)" }}>
                <strong>{tr ? "Aylik esit maliyet" : "Monthly equivalent"}</strong>
                <div style={{ fontSize: "1.35rem", fontWeight: 700, marginTop: "0.35rem" }}>{formatUsd(plusAnnualMonthlyEquivalent)}</div>
                <p style={{ margin: "0.35rem 0 0", color: "var(--muted)" }}>
                  {tr ? "Plus yillik icin aylik ortalama" : "Average monthly cost on Plus annual"}
                </p>
              </div>
              <div className="card" style={{ padding: "0.95rem", background: "rgba(255,255,255,0.82)" }}>
                <strong>{tr ? "Kupon" : "Coupon"}</strong>
                <div style={{ fontSize: "1.35rem", fontWeight: 700, marginTop: "0.35rem" }}>{couponCatalog.LAUNCH20.code}</div>
                <p style={{ margin: "0.35rem 0 0", color: "var(--muted)" }}>
                  {tr ? "Ilk checkout surtunmesini azaltmak icin" : "To soften the first checkout decision"}
                </p>
              </div>
            </div>
          ) : null}
          <div style={{ display: "grid", gap: "0.55rem" }}>
            {purchaseConfidencePoints.map((item) => (
              <div key={item} className="card" style={{ padding: "0.8rem 0.9rem", background: "rgba(255,255,255,0.8)" }}>
                {item}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <TrackedLink
              className="button button-primary"
              href={purchaseDecisionGuide.ctaHref}
              userId={currentUser?.id}
              analyticsEvent={purchaseDecisionGuide.ctaHref.startsWith("/api/payments/lemon/checkout") ? "checkout_initiated" : "marketing_cta_click"}
              analyticsPath={
                currentUser?.plan === "free"
                  ? purchaseDecisionGuide.ctaHref.includes("billing=annual")
                    ? "/app/billing/decision/plus/annual"
                    : "/app/billing/decision/plus/weekly"
                  : currentUser?.plan === "plus"
                    ? "/app/billing/decision/pro"
                    : "/app/billing/decision/practice"
              }
              onClick={() => {
                if (purchaseDecisionGuide.ctaHref.includes("plan=plus")) {
                  const billing = purchaseDecisionGuide.ctaHref.includes("billing=annual") ? "annual" : "weekly";
                  posthog.capture("checkout_initiated", { plan: "plus", billing, current_plan: currentUser?.plan, campaign: `billing_decision_${billing}` });
                } else if (purchaseDecisionGuide.ctaHref.includes("plan=pro")) {
                  posthog.capture("checkout_initiated", { plan: "pro", billing: "annual", current_plan: currentUser?.plan, campaign: "billing_decision_pro" });
                }
              }}
            >
              {purchaseDecisionGuide.ctaLabel}
            </TrackedLink>
            <TrackedLink
              className="button button-secondary"
              href={purchaseDecisionGuide.secondaryHref}
              userId={currentUser?.id}
              analyticsEvent={currentUser?.plan === "free" ? "checkout_initiated" : "marketing_cta_click"}
              analyticsPath={
                currentUser?.plan === "free"
                  ? purchaseDecisionGuide.secondaryHref.includes("billing=annual")
                    ? "/app/billing/decision/plus/annual"
                    : "/app/billing/decision/plus/weekly"
                  : currentUser?.plan === "plus"
                    ? "/app/billing/decision/practice"
                    : "/app/billing/decision/referrals"
              }
              onClick={() => {
                if (currentUser?.plan === "free") {
                  const billing = purchaseDecisionGuide.secondaryHref.includes("billing=annual") ? "annual" : "weekly";
                  posthog.capture("checkout_initiated", { plan: "plus", billing, current_plan: currentUser?.plan, campaign: `billing_decision_${billing}` });
                }
              }}
            >
              {purchaseDecisionGuide.secondaryLabel}
            </TrackedLink>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
          {currentUser?.plan === "free" ? (
            <>
              <TrackedLink
                className="button button-primary"
                href={buildPlanCheckoutPath({ plan: "plus", coupon: couponCatalog.LAUNCH20.code, campaign: "billing_buy_plus_weekly" })}
                userId={currentUser?.id}
                analyticsEvent="checkout_initiated"
                analyticsPath="/app/billing/plus/weekly"
                onClick={() => {
                  posthog.capture("checkout_initiated", { plan: "plus", billing: "weekly", current_plan: currentUser?.plan, campaign: "billing_buy_plus_weekly" });
                  if (typeof window !== 'undefined' && (window as unknown as { gtag: (...args: unknown[]) => void }).gtag) {
                    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', 'begin_checkout', {
                      currency: 'USD',
                      value: commerceNumbers.plusWeeklyPrice,
                      coupon: couponCatalog.LAUNCH20.code,
                      items: [{ item_id: 'plus_weekly', item_name: 'SpeakAce Plus - Weekly', price: commerceNumbers.plusWeeklyPrice, quantity: 1 }]
                    });
                  }
                }}
              >
                {tr ? "3 gunluk denemeyi baslat" : "Start the 3-day trial"}
              </TrackedLink>
              <TrackedLink
                className="button button-secondary"
                href={buildPlanCheckoutPath({ plan: "plus", billing: "annual", coupon: couponCatalog.LAUNCH20.code, campaign: "billing_buy_plus_annual" })}
                userId={currentUser?.id}
                analyticsEvent="checkout_initiated"
                analyticsPath="/app/billing/plus/annual"
                onClick={() => {
                  posthog.capture("checkout_initiated", { plan: "plus", billing: "annual", current_plan: currentUser?.plan, campaign: "billing_buy_plus_annual" });
                  if (typeof window !== 'undefined' && (window as unknown as { gtag: (...args: unknown[]) => void }).gtag) {
                    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', 'begin_checkout', {
                      currency: 'USD',
                      value: commerceNumbers.plusAnnualPrice,
                      coupon: couponCatalog.LAUNCH20.code,
                      items: [{ item_id: 'plus_annual', item_name: 'SpeakAce Plus - Annual', price: commerceNumbers.plusAnnualPrice, quantity: 1 }]
                    });
                  }
                }}
              >
                {tr ? "Uzun hazirlik: Plus yillik" : "Longer prep: Plus annual"}
              </TrackedLink>
              <a
                className="button button-secondary"
                href={buildPlanCheckoutPath({ plan: "pro", billing: "annual", campaign: "billing_buy_pro" })}
                style={{ borderColor: "#c9a227", color: "#b38600" }}
                onClick={() => {
                  posthog.capture("checkout_initiated", { plan: "pro", billing: "annual", current_plan: currentUser?.plan, campaign: "billing_buy_pro" });
                  if (typeof window !== 'undefined' && (window as unknown as { gtag: (...args: unknown[]) => void }).gtag) {
                    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', 'begin_checkout', {
                      currency: 'USD',
                      value: commerceNumbers.proAnnualPrice,
                      items: [{ item_id: 'pro_annual', item_name: 'SpeakAce Pro - Annual', price: commerceNumbers.proAnnualPrice, quantity: 1 }]
                    });
                  }
                }}
              >
                {tr ? "Yillik Pro'ya bak" : "View Pro Annual"}
              </a>
            </>
          ) : currentUser?.plan === "plus" ? (
            <>
              <a
                className="button button-primary"
                href={buildPlanCheckoutPath({ plan: "pro", billing: "annual", campaign: "billing_upgrade_pro" })}
                style={{ background: "#c9a227", borderColor: "#c9a227" }}
                onClick={() => {
                  posthog.capture("checkout_initiated", { plan: "pro", billing: "annual", current_plan: currentUser?.plan, campaign: "billing_upgrade_pro" });
                  if (typeof window !== 'undefined' && (window as unknown as { gtag: (...args: unknown[]) => void }).gtag) {
                    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', 'begin_checkout', {
                      currency: 'USD',
                      value: commerceNumbers.proAnnualPrice,
                      items: [{ item_id: 'pro_annual', item_name: 'SpeakAce Pro - Annual', price: commerceNumbers.proAnnualPrice, quantity: 1 }]
                    });
                  }
                }}
              >
                {tr ? "Yillik Pro'ya yükselt" : "Upgrade to Pro Annual"}
              </a>
              <a className="button button-secondary" href="/api/payments/lemon/portal">
                {tr ? "Faturayı yönet" : "Manage billing"}
              </a>
            </>
          ) : (
            <a className="button button-primary" href="/api/payments/lemon/portal">
              {tr ? "Faturayı yönet" : "Manage billing"}
            </a>
          )}
          <button className="button button-secondary" type="button" onClick={() => void refreshSession()}>
            {tr ? "Plani yenile" : "Refresh plan"}
          </button>
          <Link className="button button-secondary" href="/app/billing/success">
            {tr ? "Odeme durumunu kontrol et" : "Check payment status"}
          </Link>
          <Link className="button button-secondary" href="/pricing">
            {tr ? "Fiyat sayfasını aç" : "Open pricing page"}
          </Link>
        </div>
        <p style={{ color: "var(--muted)" }}>
          {tr
            ? `Su anki planin: ${currentUser?.plan ?? "free"}. Checkout ayni hesaba baglanir; odeme sonrasi planini success ekranindan otomatik dogrulayabilirsin. Ilk satin almada en net teklif genelde Plus'tir, Pro ise ikinci adimdir.`
            : `Current plan: ${currentUser?.plan ?? "free"}. Checkout stays on the same account, and the billing success screen can verify the upgrade automatically. For most first purchases, Plus is the clearest offer and Pro works better as a second-step upgrade.`}
        </p>
        <div className="marketing-grid">
          {planOutcome.map((item) => (
            <article key={item} className="card feature-card">
              <h3>{item}</h3>
              <p>
                {tr
                  ? "Bu avantaj daha siki practice, daha net geri bildirim ve daha hizli skor gelisimi icin eklendi."
                  : "This advantage is built to support more practice, clearer feedback, and faster score growth."}
              </p>
            </article>
          ))}
        </div>

        {isPaidPlan ? (
          <div
            className="card"
            style={{
              padding: "1rem",
              display: "grid",
              gap: "0.85rem",
              background: "linear-gradient(135deg, rgba(29,111,117,0.08) 0%, rgba(255,255,255,0.98) 100%)"
            }}
          >
            <div>
              <strong>{tr ? "Bu plani gelir ve kullanim dongusune cevir" : "Turn this plan into a usage and growth loop"}</strong>
              <p style={{ margin: "0.45rem 0 0", color: "var(--muted)", lineHeight: 1.7 }}>
                {tr
                  ? "Ucretli planda en iyi sonuc sadece satin alma degil; ayni gun kullanim aliskanligini oturtup memnun kaldigin noktada referral akisini da acmaktan gelir."
                  : "The best outcome from a paid plan is not just the purchase itself. It is building same-day usage and then opening the referral loop once the product proves value."}
              </p>
            </div>
            <div style={{ display: "grid", gap: "0.55rem" }}>
              {growthLoopActions.map((item) => (
                <div key={item} className="card" style={{ padding: "0.8rem 0.9rem", background: "rgba(255,255,255,0.78)" }}>
                  {item}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
              <TrackedLink
                className="button button-primary"
                href="/app/practice"
                userId={currentUser?.id}
                analyticsEvent="marketing_cta_click"
                analyticsPath="/app/billing/practice"
              >
                {tr ? "Practice ac" : "Open practice"}
              </TrackedLink>
              <TrackedLink
                className="button button-secondary"
                href="/app/referrals"
                userId={currentUser?.id}
                analyticsEvent="marketing_cta_click"
                analyticsPath="/app/billing/referrals"
              >
                {tr ? "Referral merkezi" : "Referral center"}
              </TrackedLink>
            </div>
          </div>
        ) : null}

        {currentUser?.plan === "free" ? (
          <div className="card" style={{ padding: "1rem", background: "rgba(255, 248, 242, 0.9)", border: "1px solid rgba(217, 93, 57, 0.16)" }}>
            <strong style={{ display: "block", marginBottom: "0.45rem" }}>{tr ? "Ilk checkout notu" : "First checkout note"}</strong>
            <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
              {tr ? `Kararsizsan ${couponCatalog.LAUNCH20.code} kuponunu kullan. Asil amac indirim degil, ilk odemeyi risksiz hissettirmek.` : `If you need a softer first step, use ${couponCatalog.LAUNCH20.code}. The point is not the discount alone, but making the first upgrade feel low-risk.`}
            </p>
          </div>
        ) : null}
      </div>
    </main>
  );
}
