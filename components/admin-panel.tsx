"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Mic2,
  FileText,
  Settings,
  Search,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ArrowUpRight,
  Tag,
  Building2,
  ExternalLink,
  LogOut,
  AlertTriangle,
  Activity,
  Rocket,
  CircleDollarSign,
  ShieldCheck,
  MailCheck,
  Menu,
  X,
  BarChart3
} from "lucide-react";
import {
  AdminAuthActivityRecord,
  AdminCustomPostRecord,
  AdminInstitutionRecord,
  AdminMemberRecord,
  AdminOverview,
  ReferralCodeRecord
} from "@/lib/types";

type AdminTab =
  | "overview"
  | "members"
  | "billing"
  | "institutions"
  | "content"
  | "referrals"
  | "activity"
  | "analytics"
  | "system";

type AdminBillingEvent = {
  id: string;
  event_name: string;
  user_email: string | null;
  plan: string;
  billing_status: string;
  created_at: string;
};

type AdminSystemHealth = {
  nodeEnv: string;
  siteUrl: string;
  vercelEnv: string;
  region: string;
  databaseConfigured: boolean;
  lemonWebhookConfigured: boolean;
  emailConfigured: boolean;
  analyticsConfigured: boolean;
  lifecycleDailyBudget: number;
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("tr-TR");
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function formatCtaLabel(path: string) {
  return path
    .replace(/^\//, "")
    .replace(/^#/, "")
    .replace(/[:/#?-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim() || "bilinmiyor";
}

function formatRelativeDate(value?: string | null) {
  if (!value) return "Henüz istek yok";
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.max(0, Math.round(diffMs / 60000));
  if (diffMin < 1) return "Az önce";
  if (diffMin === 1) return "1 dakika önce";
  if (diffMin < 60) return `${diffMin} dakika önce`;
  const diffHours = Math.round(diffMin / 60);
  if (diffHours === 1) return "1 saat önce";
  if (diffHours < 24) return `${diffHours} saat önce`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays === 1) return "1 gün önce";
  if (diffDays < 30) return `${diffDays} gün önce`;
  const diffMonths = Math.round(diffDays / 30);
  return diffMonths === 1 ? "1 ay önce" : `${diffMonths} ay önce`;
}

function translateStatus(label: string) {
  const labels: Record<string, string> = {
    student: "öğrenci",
    teacher: "öğretmen",
    school: "okul",
    active: "aktif",
    inactive: "pasif",
    free: "ücretsiz",
    on_trial: "denemede",
    trialing: "denemede",
    cancelled: "iptal",
    expired: "süresi doldu",
    paused: "duraklatıldı",
    past_due: "ödeme gecikti",
    refunded: "iade edildi",
    signin: "giriş",
    signout: "çıkış",
    published: "yayında",
    draft: "taslak",
    ready: "hazır",
    "needs action": "aksiyon gerekli"
  };
  return labels[label.toLowerCase()] ?? label;
}

function StatusBadge({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "success" | "warning" | "accent" }) {
  const classes = {
    neutral: "adm-badge-neutral",
    success: "adm-badge-success",
    warning: "adm-badge-warning",
    accent: "adm-badge-accent"
  };
  return <span className={`adm-badge ${classes[tone]}`}>{translateStatus(label)}</span>;
}

function AdmStatCard({
  label,
  value,
  trend,
  trendUp,
  iconBg,
  icon
}: {
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  iconBg: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="adm-stat-card">
      <div className="adm-stat-top">
        <div>
          <p className="adm-stat-label">{label}</p>
          <p className="adm-stat-value">{value}</p>
        </div>
        <div className="adm-stat-icon" style={{ background: iconBg }}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className={`adm-stat-trend ${trendUp ? "is-up" : "is-down"}`}>
          {trendUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}

function AdmHeroMetric({
  label,
  value,
  hint
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="adm-hero-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{hint}</small>
    </div>
  );
}

function AdmSignalCard({
  label,
  value,
  detail,
  tone
}: {
  label: string;
  value: string;
  detail: string;
  tone: "success" | "warning" | "neutral";
}) {
  return (
    <div className={`adm-signal-card adm-signal-${tone}`}>
      <div>
        <span className="adm-signal-label">{label}</span>
        <strong>{value}</strong>
      </div>
      <p>{detail}</p>
    </div>
  );
}

const navGroups: Array<{
  label: string;
  items: Array<{ id: AdminTab; label: string; icon: React.FC<{ size?: number; className?: string }> }>;
}> = [
  {
    label: "Günlük yönetim",
    items: [
      { id: "overview", label: "Genel bakış", icon: LayoutDashboard },
      { id: "billing", label: "Gelir ve ödemeler", icon: CircleDollarSign },
      { id: "members", label: "Kullanıcılar", icon: Users }
    ]
  },
  {
    label: "Ürün",
    items: [
      { id: "activity", label: "Kullanım hareketleri", icon: Mic2 },
      { id: "content", label: "İçerikler", icon: FileText },
      { id: "analytics", label: "Detaylı raporlar", icon: BarChart3 }
    ]
  },
  {
    label: "Operasyon",
    items: [
      { id: "referrals", label: "Kupon ve davetler", icon: Tag },
      { id: "institutions", label: "Kurumlar", icon: Building2 },
      { id: "system", label: "Sistem sağlığı", icon: Settings }
    ]
  }
];

const tabTitles: Record<AdminTab, string> = {
  overview: "Genel bakış",
  members: "Kullanıcılar",
  billing: "Gelir ve ödemeler",
  institutions: "Kurumlar",
  content: "İçerikler",
  referrals: "Kupon ve davetler",
  activity: "Kullanım hareketleri",
  analytics: "Detaylı raporlar",
  system: "Sistem sağlığı"
};

const tabDescriptions: Record<AdminTab, string> = {
  overview: "Bugün neye odaklanman gerektiğini tek ekranda gör.",
  members: "Hesapları bul, planları incele ve erişim durumunu yönet.",
  billing: "Checkout kayıplarını, ödeme olaylarını ve abonelik durumunu izle.",
  institutions: "Öğretmen ve okul hesaplarının genel durumunu incele.",
  content: "SEO içeriklerini taslak olarak hazırla ve yayınla.",
  referrals: "Deneme ve kampanya kodlarını oluştur, kullanımlarını takip et.",
  activity: "Son girişleri ve kullanıcı hareketlerini incele.",
  analytics: "Ham metrikleri ve ayrıntılı ürün raporlarını gerektiğinde aç.",
  system: "Veritabanı, ödeme, e-posta ve analitik bağlantılarını doğrula."
};

function AdminDailyOverview({
  overview,
  members,
  billingEvents,
  customPosts,
  systemHealth,
  onNavigate
}: {
  overview: AdminOverview;
  members: AdminMemberRecord[];
  billingEvents: AdminBillingEvent[];
  customPosts: AdminCustomPostRecord[];
  systemHealth: AdminSystemHealth;
  onNavigate: (tab: AdminTab) => void;
}) {
  const revenueGoal = 100;
  const revenueProgress = Math.min((overview.monthlyRevenueEstimate / revenueGoal) * 100, 100);
  const netRevenueEstimate = overview.monthlyRevenueEstimate - overview.aiEstimatedCost30d;
  const recentMembers = [...members]
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 5);
  const publishedPosts = customPosts.filter((post) => post.status === "published").length;
  const checkoutDropOff = Math.max(
    overview.monetizationFunnel30d.checkoutInitiated - overview.monetizationFunnel30d.checkoutCompleted,
    0
  );

  const actions: Array<{
    title: string;
    detail: string;
    label: string;
    tab: AdminTab;
    severity: "critical" | "warning" | "info";
  }> = [];

  if (
    !systemHealth.lemonWebhookConfigured ||
    (
      overview.monetizationFunnel30d.checkoutInitiated > 0 &&
      overview.monetizationFunnel30d.checkoutCompleted === 0
    )
  ) {
    actions.push({
      title: "Ödeme akışını doğrula",
      detail: !systemHealth.lemonWebhookConfigured
        ? "Lemon Squeezy webhook secret canlı ortamda görünmüyor. Ödeme yapan kullanıcıların erişimi otomatik açılmayabilir."
        : `${overview.monetizationFunnel30d.checkoutInitiated} tekil checkout başlangıcına karşılık tamamlanmış ödeme görünmüyor. Önce canlı test ödeme ve webhook teslimatını kontrol et.`,
      label: "Ödemelere git",
      tab: "billing",
      severity: "critical"
    });
  } else if (checkoutDropOff > 0) {
    actions.push({
      title: "Checkout kaybını azalt",
      detail: `Son 30 günde checkout başlatan ${overview.monetizationFunnel30d.checkoutInitiated} kişiden ${checkoutDropOff} kişi ödemeyi tamamlamadı.`,
      label: "Kaybı incele",
      tab: "billing",
      severity: "warning"
    });
  }

  if (overview.retentionRate30d < 15) {
    actions.push({
      title: "İkinci gün geri dönüşünü yükselt",
      detail: `Yeni kullanıcıların yalnızca ${formatPercent(overview.retentionRate30d)} kadarı farklı bir günde pratiğe döndü. İlk hedef %15.`,
      label: "Kohortu aç",
      tab: "analytics",
      severity: "warning"
    });
  }

  if (overview.activationRate30d < 60) {
    actions.push({
      title: "İlk skor adımını sadeleştir",
      detail: `${overview.newUsers30d} yeni öğrencinin ${overview.activatedNewUsers30d} tanesi ilk skorunu aldı. Kayıt sonrası yönlendirmeyi gözden geçir.`,
      label: "Kullanıcıları gör",
      tab: "members",
      severity: "warning"
    });
  }

  if (overview.emailQuotaBlocked || overview.emailFailed24h > 0 || !systemHealth.emailConfigured) {
    actions.push({
      title: "E-posta teslimatını düzelt",
      detail: !systemHealth.emailConfigured
        ? "Resend bağlantısı canlı ortamda yapılandırılmamış görünüyor."
        : `${overview.emailSent24h} gönderim başarılı, ${overview.emailFailed24h} gönderim başarısız. Yaşam döngüsü maillerinin kullanıcıya ulaştığını doğrula.`,
      label: "Sistemi kontrol et",
      tab: "system",
      severity: overview.emailQuotaBlocked ? "critical" : "warning"
    });
  }

  if (actions.length < 3 && publishedPosts === 0) {
    actions.push({
      title: "İlk organik içerikleri yayınla",
      detail: "Henüz yayında özel içerik görünmüyor. Satın alma niyeti yüksek bir IELTS rehberiyle organik trafik akışını başlat.",
      label: "İçeriklere git",
      tab: "content",
      severity: "info"
    });
  }

  if (actions.length === 0) {
    actions.push({
      title: "Temel sistemler sağlıklı",
      detail: "Bugün kritik bir blokaj görünmüyor. Dönüşümü büyütmek için en iyi trafik ve checkout kaynaklarını ayrıntılı raporlardan takip et.",
      label: "Raporları aç",
      tab: "analytics",
      severity: "info"
    });
  }

  const journeySteps = [
    {
      label: "Yeni öğrenci",
      value: overview.newUsers30d,
      detail: `${overview.newUsers7d} son 7 günde`
    },
    {
      label: "İlk skor",
      value: overview.activatedNewUsers30d,
      detail: formatPercent(overview.activationRate30d)
    },
    {
      label: "Farklı gün dönüş",
      value: overview.retainedNewUsers30d,
      detail: `${formatPercent(overview.retentionRate30d)} · hedef %15`
    }
  ];

  const systemRows = [
    {
      label: "Veritabanı",
      detail: systemHealth.databaseConfigured ? "Canlı bağlantı hazır" : "Bağlantı eksik",
      ready: systemHealth.databaseConfigured
    },
    {
      label: "Lemon webhook",
      detail: systemHealth.lemonWebhookConfigured ? "İmza secretı hazır" : "Canlı secret eksik",
      ready: systemHealth.lemonWebhookConfigured
    },
    {
      label: "E-posta",
      detail: overview.emailQuotaBlocked
        ? "Sağlayıcı kotası bloklu"
        : systemHealth.emailConfigured
          ? `${overview.emailSent24h} gönderim / 24 saat`
          : "Resend bağlantısı eksik",
      ready: systemHealth.emailConfigured && !overview.emailQuotaBlocked
    },
    {
      label: "Analitik",
      detail: systemHealth.analyticsConfigured ? `${overview.pageViews1h} görüntülenme / son saat` : "Bağlantı eksik",
      ready: systemHealth.analyticsConfigured
    }
  ];

  return (
    <div className="adm-daily">
      <section className="adm-daily-hero">
        <div className="adm-daily-intro">
          <span className="adm-eyebrow">30 günlük gelir hedefi</span>
          <h2>
            İlk <strong>$100</strong> için bugün ne yapmalıyız?
          </h2>
          <p>Gelir, kullanıcı davranışı ve sistem riskleri tek bir öncelik sırasına indirildi.</p>
          <div className="adm-daily-actions">
            <button type="button" className="adm-primary-btn" onClick={() => onNavigate("billing")}>
              Gelir akışını aç <ArrowUpRight size={16} />
            </button>
            <button type="button" className="adm-secondary-btn" onClick={() => onNavigate("analytics")}>
              Detaylı raporlar
            </button>
          </div>
        </div>
        <div className="adm-goal-card">
          <div className="adm-goal-head">
            <span>Tahmini aylık gelir</span>
            <strong>{formatMoney(overview.monthlyRevenueEstimate)}</strong>
          </div>
          <div className="adm-goal-track" aria-label={`100 dolar hedefinin yüzde ${Math.round(revenueProgress)} kadarı`}>
            <span style={{ width: `${revenueProgress}%` }} />
          </div>
          <div className="adm-goal-foot">
            <span>{formatPercent(revenueProgress)} tamamlandı</span>
            <span>{formatMoney(Math.max(revenueGoal - overview.monthlyRevenueEstimate, 0))} kaldı</span>
          </div>
        </div>
      </section>

      <section className="adm-kpi-grid" aria-label="Temel işletme göstergeleri">
        <article className="adm-kpi adm-kpi-featured">
          <span>Net gelir tahmini</span>
          <strong>{formatMoney(netRevenueEstimate)}</strong>
          <small>{formatMoney(overview.aiEstimatedCost30d)} yapay zeka maliyeti düşüldü</small>
        </article>
        <article className="adm-kpi">
          <span>Yeni öğrenci</span>
          <strong>{overview.newUsers30d}</strong>
          <small>{overview.newUsers7d} öğrenci son 7 günde geldi</small>
        </article>
        <article className="adm-kpi">
          <span>İlk skor aktivasyonu</span>
          <strong>{formatPercent(overview.activationRate30d)}</strong>
          <small>{overview.activatedNewUsers30d} / {overview.newUsers30d} yeni öğrenci</small>
        </article>
        <article className={`adm-kpi${overview.retentionRate30d < 15 ? " adm-kpi-alert" : ""}`}>
          <span>Farklı gün geri dönüş</span>
          <strong>{formatPercent(overview.retentionRate30d)}</strong>
          <small>Hedef %15 · {overview.retainedNewUsers30d} kullanıcı döndü</small>
        </article>
        <article className="adm-kpi">
          <span>Haftalık aktif pratik</span>
          <strong>{overview.weeklyActivePracticeUsers}</strong>
          <small>İlk hedef 15 aktif kullanıcı</small>
        </article>
        <article className={`adm-kpi${checkoutDropOff > 0 ? " adm-kpi-alert" : ""}`}>
          <span>Checkout sonucu</span>
          <strong>
            {overview.monetizationFunnel30d.checkoutCompleted} / {overview.monetizationFunnel30d.checkoutInitiated}
          </strong>
          <small>{checkoutDropOff} ödeme adayı kaybedildi</small>
        </article>
      </section>

      <div className="adm-daily-grid adm-daily-grid-wide">
        <section className="adm-panel-card adm-priority-panel">
          <div className="adm-panel-card-head">
            <div>
              <span className="adm-eyebrow">Öncelik sırası</span>
              <h3>Bugünün aksiyonları</h3>
            </div>
            <span className="adm-count-pill">{actions.length} konu</span>
          </div>
          <div className="adm-action-list">
            {actions.slice(0, 4).map((action, index) => (
              <article className={`adm-action-item is-${action.severity}`} key={action.title}>
                <span className="adm-action-index">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h4>{action.title}</h4>
                  <p>{action.detail}</p>
                </div>
                <button type="button" onClick={() => onNavigate(action.tab)}>
                  {action.label} <ArrowUpRight size={14} />
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="adm-panel-card">
          <div className="adm-panel-card-head">
            <div>
              <span className="adm-eyebrow">Yeni kullanıcı kohortu</span>
              <h3>Kayıttan alışkanlığa</h3>
            </div>
            <span className="adm-period-pill">Son 30 gün</span>
          </div>
          <div className="adm-journey">
            {journeySteps.map((step, index) => (
              <div className="adm-journey-step" key={step.label}>
                <span className="adm-journey-number">{index + 1}</span>
                <div>
                  <span>{step.label}</span>
                  <strong>{step.value}</strong>
                  <small>{step.detail}</small>
                </div>
              </div>
            ))}
          </div>
          <button type="button" className="adm-text-button" onClick={() => onNavigate("analytics")}>
            Kohort ayrıntısını incele <ArrowUpRight size={14} />
          </button>
        </section>
      </div>

      <div className="adm-daily-grid">
        <section className="adm-panel-card">
          <div className="adm-panel-card-head">
            <div>
              <span className="adm-eyebrow">Operasyon</span>
              <h3>Sistem hazır mı?</h3>
            </div>
            <button type="button" className="adm-text-button" onClick={() => onNavigate("system")}>
              Tümünü aç
            </button>
          </div>
          <div className="adm-system-list">
            {systemRows.map((row) => (
              <div className="adm-system-row" key={row.label}>
                <span className={`adm-status-dot${row.ready ? " is-ready" : " is-blocked"}`} />
                <div>
                  <strong>{row.label}</strong>
                  <span>{row.detail}</span>
                </div>
                <span className={`adm-health-label${row.ready ? " is-ready" : " is-blocked"}`}>
                  {row.ready ? "Hazır" : "Kontrol et"}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="adm-panel-card">
          <div className="adm-panel-card-head">
            <div>
              <span className="adm-eyebrow">Son hareket</span>
              <h3>Yeni kullanıcılar</h3>
            </div>
            <button type="button" className="adm-text-button" onClick={() => onNavigate("members")}>
              Tümünü aç
            </button>
          </div>
          <div className="adm-recent-list">
            {recentMembers.map((member) => (
              <div className="adm-recent-member" key={member.id}>
                <span className="adm-member-avatar">{member.name.slice(0, 2).toUpperCase()}</span>
                <div>
                  <strong>{member.name}</strong>
                  <span>{translateStatus(member.memberType)} · {formatRelativeDate(member.createdAt)}</span>
                </div>
                <StatusBadge
                  label={member.plan}
                  tone={member.plan === "free" ? "neutral" : member.billingStatus === "active" ? "success" : "warning"}
                />
              </div>
            ))}
            {recentMembers.length === 0 && <p className="adm-empty-copy">Henüz yeni kullanıcı yok.</p>}
          </div>
          <div className="adm-recent-summary">
            <span>{billingEvents.length} ödeme olayı</span>
            <span>{publishedPosts} içerik yayında</span>
          </div>
        </section>
      </div>
    </div>
  );
}

export function AdminPanel(props: {
  sessionLabel: string;
  systemHealth: AdminSystemHealth;
  overview: AdminOverview;
  members: AdminMemberRecord[];
  billingEvents: AdminBillingEvent[];
  authActivity: AdminAuthActivityRecord[];
  referralCodes: ReferralCodeRecord[];
  institutions: AdminInstitutionRecord[];
  customPosts: AdminCustomPostRecord[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [search, setSearch] = useState("");
  const [memberTypeFilter, setMemberTypeFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [billingFilter, setBillingFilter] = useState("all");
  const [memberVisibleCount, setMemberVisibleCount] = useState(20);
  const [code, setCode] = useState("");
  const [label, setLabel] = useState("");
  const [trialDays, setTrialDays] = useState("7");
  const [usageLimit, setUsageLimit] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [memberMessage, setMemberMessage] = useState("");
  const [memberError, setMemberError] = useState("");
  const [memberBusyId, setMemberBusyId] = useState<string | null>(null);
  const [contentMessage, setContentMessage] = useState("");
  const [contentError, setContentError] = useState("");
  const [contentBusy, setContentBusy] = useState(false);
  const [contentBusyId, setContentBusyId] = useState<string | null>(null);
  const [emailTestBusy, setEmailTestBusy] = useState(false);
  const [emailTestMessage, setEmailTestMessage] = useState("");
  const [emailTestError, setEmailTestError] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [memberDrafts, setMemberDrafts] = useState<Record<string, { plan: string; billingStatus: string; trialDays: string }>>(
    () =>
      Object.fromEntries(
        props.members.map((member) => [
          member.id,
          { plan: member.plan, billingStatus: member.billingStatus, trialDays: "7" }
        ])
      )
  );
  const [newPost, setNewPost] = useState({
    language: "en",
    title: "",
    slug: "",
    description: "",
    keywords: "",
    intro: "",
    body: "## What this guide covers\n\nAdd the first key explanation here.\n\n## Common mistakes\n\nExplain what usually goes wrong.\n\n## Better answer pattern\n\nShow what a stronger answer sounds like.\n\n## How to practice it\n\nGive the learner a repeatable action plan.",
    status: "draft"
  });

  const navigateTo = (tab: AdminTab) => {
    setActiveTab(tab);
    setMobileNavOpen(false);
  };

  const referralOverview = useMemo(() => {
    const totalCodes = props.referralCodes.length;
    const activeCodes = props.referralCodes.filter((item) => item.active).length;
    const totalUses = props.referralCodes.reduce((sum, item) => sum + item.usageCount, 0);
    const remainingSeats = props.referralCodes.reduce(
      (sum, item) => sum + (item.usageLimit ? Math.max(item.usageLimit - item.usageCount, 0) : 0),
      0
    );
    return { totalCodes, activeCodes, totalUses, remainingSeats };
  }, [props.referralCodes]);

  const funnelLift = useMemo(() => {
    const clickDelta = props.overview.funnel7d.clickToPaidRate - props.overview.funnel30d.clickToPaidRate;
    return {
      clickDelta,
      signupDelta: props.overview.funnel7d.clickToSignupRate - props.overview.funnel30d.clickToSignupRate,
      checkoutDelta: props.overview.funnel7d.signupToCheckoutRate - props.overview.funnel30d.signupToCheckoutRate
    };
  }, [props.overview.funnel30d, props.overview.funnel7d]);

  const writingFunnel = useMemo(() => {
    const startToEval7d = props.overview.writingStarts7d ? (props.overview.writingEvaluations7d / props.overview.writingStarts7d) * 100 : 0;
    const startToEval30d = props.overview.writingStarts30d ? (props.overview.writingEvaluations30d / props.overview.writingStarts30d) * 100 : 0;
    const evalToRetry7d = props.overview.writingEvaluations7d ? (props.overview.writingRetries7d / props.overview.writingEvaluations7d) * 100 : 0;
    const evalToRetry30d = props.overview.writingEvaluations30d ? (props.overview.writingRetries30d / props.overview.writingEvaluations30d) * 100 : 0;
    const evalToPdf7d = props.overview.writingEvaluations7d ? (props.overview.writingPdfExports7d / props.overview.writingEvaluations7d) * 100 : 0;
    const evalToPdf30d = props.overview.writingEvaluations30d ? (props.overview.writingPdfExports30d / props.overview.writingEvaluations30d) * 100 : 0;

    return {
      startToEval7d,
      startToEval30d,
      evalToRetry7d,
      evalToRetry30d,
      evalToPdf7d,
      evalToPdf30d
    };
  }, [
    props.overview.writingEvaluations30d,
    props.overview.writingEvaluations7d,
    props.overview.writingPdfExports30d,
    props.overview.writingPdfExports7d,
    props.overview.writingRetries30d,
    props.overview.writingRetries7d,
    props.overview.writingStarts30d,
    props.overview.writingStarts7d
  ]);

  const speakingShareFunnel = useMemo(() => {
    const cardToShare7d = props.overview.resultCardDownloads7d ? (props.overview.resultShares7d / props.overview.resultCardDownloads7d) * 100 : 0;
    const cardToShare30d = props.overview.resultCardDownloads30d ? (props.overview.resultShares30d / props.overview.resultCardDownloads30d) * 100 : 0;
    return {
      cardToShare7d,
      cardToShare30d
    };
  }, [
    props.overview.resultCardDownloads30d,
    props.overview.resultCardDownloads7d,
    props.overview.resultShares30d,
    props.overview.resultShares7d
  ]);

  const trendMax = useMemo(
    () =>
      Math.max(
        1,
        ...props.overview.ctaTrend14d.flatMap((item) => [item.ctaClicks, item.signupCount, item.checkoutClicks, item.paidCount])
      ),
    [props.overview.ctaTrend14d]
  );

  const topPageMax = useMemo(
    () => Math.max(1, ...props.overview.topCtaPages.map((item) => item.clicks)),
    [props.overview.topCtaPages]
  );

  const revenuePerPaidMember = useMemo(() => {
    if (!props.overview.paidMembers) return 0;
    return props.overview.monthlyRevenueEstimate / props.overview.paidMembers;
  }, [props.overview.monthlyRevenueEstimate, props.overview.paidMembers]);

  const monetizationBottleneck = useMemo(() => {
    const candidates = [
      {
        key: "pricing",
        label: "Fiyat sayfasından checkout'a",
        rate: props.overview.monetizationFunnel7d.pricingViewToCheckoutRate,
        detail: "Fiyatı gören kullanıcıların yeterli bölümü ödeme adımına geçmiyor.",
        sampleSize: props.overview.monetizationFunnel7d.pricingViews
      },
      {
        key: "paywall",
        label: "Kullanım limitinden checkout'a",
        rate: props.overview.monetizationFunnel7d.limitHitToCheckoutRate,
        detail: "Ücretsiz limite ulaşan kullanıcılar yükseltme teklifine yeterince yanıt vermiyor.",
        sampleSize: props.overview.monetizationFunnel7d.practiceLimitHits
      },
      {
        key: "checkout",
        label: "Checkout tamamlama",
        rate: props.overview.monetizationFunnel7d.checkoutToCompletionRate,
        detail: "Satın alma niyeti var ancak ödeme tamamlanmadan kayıp yaşanıyor.",
        sampleSize: props.overview.monetizationFunnel7d.checkoutInitiated
      }
    ];
    const measuredCandidates = candidates.filter((candidate) => candidate.sampleSize > 0);
    return measuredCandidates.sort((a, b) => a.rate - b.rate)[0] ?? {
      key: "data",
      label: "Ölçüm bekleniyor",
      rate: 0,
      detail: "Güvenilir bir darboğaz seçmek için yeterli örnek henüz oluşmadı.",
      sampleSize: 0
    };
  }, [
    props.overview.monetizationFunnel7d.checkoutInitiated,
    props.overview.monetizationFunnel7d.checkoutToCompletionRate,
    props.overview.monetizationFunnel7d.limitHitToCheckoutRate,
    props.overview.monetizationFunnel7d.practiceLimitHits,
    props.overview.monetizationFunnel7d.pricingViews,
    props.overview.monetizationFunnel7d.pricingViewToCheckoutRate
  ]);

  const adminHealth = useMemo(() => {
    const paidRate = props.overview.funnel7d.clickToPaidRate;
    const checkoutCompletion = props.overview.monetizationFunnel7d.checkoutToCompletionRate;
    if (paidRate >= 4 && checkoutCompletion >= 45) {
      return {
        label: "Sağlıklı",
        tone: "success" as const,
        summary: "Dönüşüm ve ödeme tamamlama akışı sağlıklı çalışıyor."
      };
    }
    if (paidRate >= 2 && checkoutCompletion >= 25) {
      return {
        label: "Yakından izle",
        tone: "warning" as const,
        summary: "Gelir akışı hareketli ancak funnel içinde hâlâ görünür sürtünme var."
      };
    }
    return {
      label: "Aksiyon gerekli",
      tone: "neutral" as const,
      summary: "Gelir funnelındaki bir veya daha fazla temel adım hedefin altında."
    };
  }, [props.overview.funnel7d.clickToPaidRate, props.overview.monetizationFunnel7d.checkoutToCompletionRate]);

  const revenueActionPlan = useMemo(() => {
    const bestCheckoutSource = props.overview.topCheckoutSources.find((source) => source.completed > 0);
    const winnerCta = props.overview.winnerCta7d;
    const actions: Array<{ title: string; detail: string; tone: "success" | "warning" | "neutral" }> = [];

    if (monetizationBottleneck.key === "pricing") {
      actions.push({
        title: "Fiyat teklifini netleştir",
        detail: `Son 7 günde fiyat→checkout oranı ${formatPercent(props.overview.monetizationFunnel7d.pricingViewToCheckoutRate)}. Önce fiyat metni, CTA ve hesap durumunu sadeleştir.`,
        tone: "warning"
      });
    } else if (monetizationBottleneck.key === "paywall") {
      actions.push({
        title: "Limit sonrası geri kazanımı güçlendir",
        detail: `Son 7 günde limit→checkout oranı ${formatPercent(props.overview.monetizationFunnel7d.limitHitToCheckoutRate)}. Niyetin yüksek olduğu pratik ve sonuç ekranlarına odaklan.`,
        tone: "warning"
      });
    } else if (monetizationBottleneck.key === "checkout") {
      actions.push({
        title: "Checkout kaybını kapat",
        detail: `Son 7 günde checkout tamamlama oranı ${formatPercent(props.overview.monetizationFunnel7d.checkoutToCompletionRate)}. Başlatılan ödeme ile satın alma arasındaki kaybı azalt.`,
        tone: "warning"
      });
    } else {
      actions.push({
        title: "Önce güvenilir veri topla",
        detail: "Darboğaz seçmek için yeterli hacim yok. Yeni deney açmadan önce mevcut checkout ve satın alma olaylarını doğrula.",
        tone: "neutral"
      });
    }

    if (bestCheckoutSource) {
      actions.push({
        title: "En iyi checkout kaynağını büyüt",
        detail: `${formatCtaLabel(bestCheckoutSource.path)}, ${bestCheckoutSource.completed} tamamlanmış ödemede ${formatPercent(bestCheckoutSource.completionRate)} oranla önde.`,
        tone: "success"
      });
    } else {
      actions.push({
        title: "Checkout kazananı seçmek için erken",
        detail: "Tamamlanmış ödeme atfı henüz yeterli değil. Bir sayfayı kazanan ilan etmeden önce kaynak bazlı ödeme verisi topla.",
        tone: "neutral"
      });
    }

    if (winnerCta) {
      actions.push({
        title: "En güçlü CTA dilini tekrar kullan",
        detail: `${formatCtaLabel(winnerCta.path)}, ${formatPercent(winnerCta.clickToPaidRate)} tıklama→ödeme oranıyla haftanın kazananı.`,
        tone: "success"
      });
    } else {
      actions.push({
        title: "CTA atfı henüz yetersiz",
        detail: "Geniş sayfa deneyleri yerine satın alma niyeti yüksek ekranlardan veri toplamaya devam et.",
        tone: "neutral"
      });
    }

    return actions;
  }, [
    monetizationBottleneck.key,
    props.overview.monetizationFunnel7d.pricingViewToCheckoutRate,
    props.overview.monetizationFunnel7d.limitHitToCheckoutRate,
    props.overview.monetizationFunnel7d.checkoutToCompletionRate,
    props.overview.topCheckoutSources,
    props.overview.winnerCta7d
  ]);

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return props.members.filter((member) => {
      if (memberTypeFilter !== "all" && member.memberType !== memberTypeFilter) return false;
      if (planFilter !== "all" && member.plan !== planFilter) return false;
      if (billingFilter !== "all" && member.billingStatus !== billingFilter) return false;
      if (!query) return true;
      return [member.name, member.email, member.organizationName ?? "", member.referralCodeUsed ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(query);
      });
  }, [billingFilter, memberTypeFilter, planFilter, props.members, search]);

  const visibleMembers = useMemo(
    () => filteredMembers.slice(0, memberVisibleCount),
    [filteredMembers, memberVisibleCount]
  );

  const topQuickActions = useMemo(
    () => [
      {
        label: "Kullanıcıları aç",
        detail: `${filteredMembers.length} görünür hesap`,
        onClick: () => setActiveTab("members")
      },
      {
        label: "Geliri incele",
        detail: `${props.billingEvents.length} ödeme olayı`,
        onClick: () => setActiveTab("billing")
      },
      {
        label: "Sistem durumunu aç",
        detail: `${props.overview.emailFailed24h} e-posta hatası`,
        onClick: () => setActiveTab("system")
      }
    ],
    [filteredMembers.length, props.billingEvents.length, props.overview.emailFailed24h]
  );

  const billingOverview = useMemo(() => {
    const statusCounts = props.billingEvents.reduce<Record<string, number>>((acc, event) => {
      acc[event.billing_status] = (acc[event.billing_status] ?? 0) + 1;
      return acc;
    }, {});
    const planCounts = props.billingEvents.reduce<Record<string, number>>((acc, event) => {
      acc[event.plan] = (acc[event.plan] ?? 0) + 1;
      return acc;
    }, {});
    const recentEvents = [...props.billingEvents]
      .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime())
      .slice(0, 6);

    return {
      activeCount: statusCounts.active ?? 0,
      trialingCount: statusCounts.trialing ?? 0,
      churnedCount: (statusCounts.cancelled ?? 0) + (statusCounts.expired ?? 0),
      statusCounts,
      planCounts,
      recentEvents
    };
  }, [props.billingEvents]);

  const billingActionQueue = useMemo(() => {
    const droppedCheckouts = Math.max(
      props.overview.monetizationFunnel7d.checkoutInitiated - props.overview.monetizationFunnel7d.checkoutCompleted,
      0
    );
    const missingSuccessViews = Math.max(
      props.overview.monetizationFunnel7d.checkoutCompleted - props.overview.monetizationFunnel7d.billingSuccessSeen,
      0
    );
    const bestCheckoutSource = props.overview.topCheckoutSources.find((source) => source.completed > 0);
    const actions: Array<{ title: string; value: string; detail: string; tone: "success" | "warning" | "neutral" }> = [];

    actions.push({
      title: "Kurtarılacak checkout kaybı",
      value: `${droppedCheckouts}`,
      detail:
        droppedCheckouts > 0
          ? `Son 7 günde ${props.overview.monetizationFunnel7d.checkoutInitiated} başlangıca karşılık ${props.overview.monetizationFunnel7d.checkoutCompleted} ödeme tamamlandı. Önce ödeme kaybını düzelt.`
          : "Son 7 günde checkout kaybı kaydedilmedi.",
      tone: droppedCheckouts > 0 ? "warning" : "success"
    });

    actions.push({
      title: "Ödeme sonrası devamlılık",
      value: `${missingSuccessViews}`,
      detail:
        missingSuccessViews > 0
          ? `${props.overview.monetizationFunnel7d.checkoutCompleted} tamamlanmış ödemeden ${props.overview.monetizationFunnel7d.billingSuccessSeen} tanesi başarı ekranına ulaştı. Başarı sayfası ve onboarding devamlılığını düzelt.`
          : "Tamamlanan checkout'lar başarı durumuna sorunsuz ulaşıyor.",
      tone: missingSuccessViews > 0 ? "warning" : "success"
    });

    actions.push({
      title: "Ücretli erişim senkronu",
      value: `${props.overview.billingSyncPending7d}`,
      detail:
        props.overview.billingSyncPending7d > 0
          ? `Son 7 günde ${props.overview.billingSyncPending7d} alıcı checkout'tan döndüğü halde ücretsiz erişimde kaldı. Yeni satın alma istemeden önce ödeme teslimatını düzelt.`
          : "Son 7 günde erişimi senkronlanmamış alıcı görünmüyor.",
      tone: props.overview.billingSyncPending7d > 0 ? "warning" : "success"
    });

    actions.push({
      title: "Yaşam döngüsü e-postaları",
      value: props.overview.emailQuotaBlocked ? "Bloklu" : `${props.overview.emailSent24h} gönderildi`,
      detail: props.overview.emailQuotaBlocked
        ? `Sağlayıcı kotası gönderimi engelliyor; son 24 saatte ${props.overview.emailFailed24h} deneme başarısız. Kota sıfırlanana kadar tekrar fırtınası engellendi.`
        : `Son 24 saatte ${props.overview.emailSent24h} e-posta gönderildi, ${props.overview.emailFailed24h} gönderim başarısız. 30 günde ${props.overview.dayOneReturnStarts30d} kullanıcı ilk gün dönüş akışından geldi.`,
      tone: props.overview.emailQuotaBlocked || props.overview.emailFailed24h > 0 ? "warning" : "success"
    });

    actions.push({
      title: "Pratik limiti geri kazanımı",
      value: props.overview.practiceLimitRecoveryEnabled
        ? `${props.overview.practiceLimitRecoveryCheckoutStarts7d}/${props.overview.practiceLimitRecoverySent7d}`
        : "Kapalı",
      detail: !props.overview.practiceLimitRecoveryEnabled
        ? "Hazır fakat güvenli biçimde kapalı. Canlı Lemon webhook ve imzalı teslimat doğrulanana kadar açma."
        : props.overview.practiceLimitRecoverySent7d > 0
          ? `7 günde ${props.overview.practiceLimitRecoverySent7d} kurtarma e-postası gönderildi ve ${props.overview.practiceLimitRecoveryCheckoutStarts7d} checkout başlatıldı.`
          : "Geri kazanım açık ancak son 7 günde uygun yüksek niyetli kullanıcı bulunmadı.",
      tone: !props.overview.practiceLimitRecoveryEnabled
        ? "neutral"
        : props.overview.practiceLimitRecoveryCheckoutStarts7d > 0
          ? "success"
          : "neutral"
    });

    actions.push({
      title: "Büyütülecek checkout kaynağı",
      value: bestCheckoutSource ? formatCtaLabel(bestCheckoutSource.path) : "Henüz sinyal yok",
      detail: bestCheckoutSource
        ? `${bestCheckoutSource.completed} tamamlanmış checkout ile ${formatPercent(bestCheckoutSource.completionRate)} başarı oranı.`
        : "Atfedilmiş tamamlanmış ödeme verisi geldiğinde en güçlü kaynak burada görünecek.",
      tone: bestCheckoutSource ? "success" : "neutral"
    });

    return actions;
  }, [
    props.overview.billingSyncPending7d,
    props.overview.dayOneReturnStarts30d,
    props.overview.emailFailed24h,
    props.overview.emailQuotaBlocked,
    props.overview.emailSent24h,
    props.overview.practiceLimitRecoveryCheckoutStarts7d,
    props.overview.practiceLimitRecoveryEnabled,
    props.overview.practiceLimitRecoverySent7d,
    props.overview.topCheckoutSources,
    props.overview.monetizationFunnel7d.billingSuccessSeen,
    props.overview.monetizationFunnel7d.checkoutCompleted,
    props.overview.monetizationFunnel7d.checkoutInitiated
  ]);

  const logout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const createCode = async () => {
    setBusy(true);
    setError("");
    setMessage("");
    const response = await fetch("/api/admin/referrals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        label,
        trialDays: Number(trialDays || 7),
        usageLimit: usageLimit ? Number(usageLimit) : null
      })
    });
    const data = (await response.json()) as { error?: string };
    setBusy(false);
    if (!response.ok) {
      setError(data.error ?? "Davet kodu oluşturulamadı.");
      return;
    }
    setMessage("Davet kodu oluşturuldu.");
    setCode("");
    setLabel("");
    setUsageLimit("");
    setTrialDays("7");
    router.refresh();
  };

  const updateMemberDraft = (
    memberId: string,
    patch: Partial<{ plan: string; billingStatus: string; trialDays: string }>
  ) => {
    setMemberDrafts((current) => ({
      ...current,
      [memberId]: {
        ...(current[memberId] ?? { plan: "free", billingStatus: "free", trialDays: "7" }),
        ...patch
      }
    }));
  };

  const saveMember = async (memberId: string) => {
    const draft = memberDrafts[memberId];
    if (!draft) return;
    setMemberBusyId(memberId);
    setMemberError("");
    setMemberMessage("");
    const response = await fetch(`/api/admin/members/${memberId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        plan: draft.plan,
        billingStatus: draft.billingStatus,
        trialDays: draft.trialDays ? Number(draft.trialDays) : null
      })
    });
    const data = (await response.json()) as { error?: string };
    setMemberBusyId(null);
    if (!response.ok) {
      setMemberError(data.error ?? "Kullanıcı erişimi güncellenemedi.");
      return;
    }
    setMemberMessage("Kullanıcı erişimi güncellendi.");
    router.refresh();
  };

  const createPost = async () => {
    setContentBusy(true);
    setContentError("");
    setContentMessage("");
    const response = await fetch("/api/admin/content/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPost)
    });
    const data = (await response.json()) as { error?: string };
    setContentBusy(false);
    if (!response.ok) {
      setContentError(data.error ?? "İçerik kaydedilemedi.");
      return;
    }
    setContentMessage("Blog içeriği kaydedildi.");
    setNewPost({
      language: "en",
      title: "",
      slug: "",
      description: "",
      keywords: "",
      intro: "",
      body: "## What this guide covers\n\nAdd the first key explanation here.\n\n## Common mistakes\n\nExplain what usually goes wrong.\n\n## Better answer pattern\n\nShow what a stronger answer sounds like.\n\n## How to practice it\n\nGive the learner a repeatable action plan.",
      status: "draft"
    });
    router.refresh();
  };

  const updatePostStatus = async (postId: string, status: "draft" | "published") => {
    setContentBusyId(postId);
    setContentError("");
    setContentMessage("");
    const response = await fetch(`/api/admin/content/posts/${postId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    const data = (await response.json()) as { error?: string };
    setContentBusyId(null);
    if (!response.ok) {
      setContentError(data.error ?? "İçerik durumu güncellenemedi.");
      return;
    }
    setContentMessage(status === "published" ? "İçerik yayınlandı." : "İçerik taslağa taşındı.");
    router.refresh();
  };

  const sendEmailDeliveryTest = async () => {
    setEmailTestBusy(true);
    setEmailTestMessage("");
    setEmailTestError("");

    const response = await fetch("/api/admin/email-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });
    const data = (await response.json()) as {
      ok?: boolean;
      quotaRecoveryRecorded?: boolean;
      error?: string;
    };

    setEmailTestBusy(false);
    if (!response.ok || !data.ok) {
      setEmailTestError(data.error ?? "E-posta teslimat testi başarısız oldu.");
      return;
    }

    setEmailTestMessage(
      data.quotaRecoveryRecorded
        ? "Test gönderildi ve eski sağlayıcı kota blokajı temizlendi."
        : "Test gönderildi ancak kota kurtarma kaydı oluşturulamadı."
    );
    router.refresh();
  };

  return (
    <div
      className={`adm-shell${sidebarCollapsed ? " adm-collapsed" : ""}${mobileNavOpen ? " adm-mobile-open" : ""}`}
    >
      {/* ── Sidebar ─────────────────────────────── */}
      <aside className="adm-sidebar">
        <div className="adm-brand">
          <div className="adm-brand-icon">
            <Mic2 size={18} />
          </div>
          {!sidebarCollapsed && (
            <div className="adm-brand-copy">
              <span className="adm-brand-name">SpeakAce</span>
              <small>Yönetim</small>
            </div>
          )}
          <button
            type="button"
            className="adm-sidebar-close"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Menüyü kapat"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="adm-nav">
          {navGroups.map((group) => (
            <div className="adm-nav-group" key={group.label}>
              {!sidebarCollapsed && <span className="adm-nav-group-label">{group.label}</span>}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.id === activeTab;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`adm-nav-item${isActive ? " is-active" : ""}`}
                    onClick={() => navigateTo(item.id)}
                    title={sidebarCollapsed ? item.label : undefined}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon size={18} className="adm-nav-icon-svg" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="adm-sidebar-foot">
          <Link href="/" className="adm-back-link" title="Siteye dön">
            <ExternalLink size={15} />
            {!sidebarCollapsed && <span>Siteye dön</span>}
          </Link>
          <button
            type="button"
            className="adm-collapse-btn"
            onClick={() => setSidebarCollapsed((v) => !v)}
            title={sidebarCollapsed ? "Menüyü genişlet" : "Menüyü daralt"}
          >
            <ChevronLeft size={15} className={sidebarCollapsed ? "adm-icon-rotated" : ""} />
            {!sidebarCollapsed && <span>Menüyü daralt</span>}
          </button>
        </div>
      </aside>
      <button
        type="button"
        className="adm-mobile-backdrop"
        onClick={() => setMobileNavOpen(false)}
        aria-label="Menüyü kapat"
      />

      {/* ── Main ─────────────────────────────────── */}
      <div className="adm-main">
        {/* Header */}
        <header className="adm-header">
          <div className="adm-header-title-wrap">
            <button
              type="button"
              className="adm-mobile-menu"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Yönetim menüsünü aç"
            >
              <Menu size={20} />
            </button>
            <div>
            <h1 className="adm-page-title">{tabTitles[activeTab]}</h1>
              <p className="adm-header-subtitle">{tabDescriptions[activeTab]}</p>
            </div>
          </div>
          <div className="adm-header-right">
            <div className="adm-search-wrap">
              <Search size={15} className="adm-search-icon" />
              <input
                className="adm-search-input"
                placeholder="Kullanıcı ara..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setMemberVisibleCount(20);
                  if (activeTab !== "members") {
                    navigateTo("members");
                  }
                }}
                aria-label="Kullanıcı ara"
              />
            </div>
            <div className="adm-session-chip" title={props.sessionLabel}>
              <ShieldCheck size={14} />
              <span>{props.sessionLabel}</span>
            </div>
            <button type="button" className="adm-header-icon-btn" onClick={logout} title="Çıkış yap">
              <LogOut size={18} />
            </button>
            <div className="adm-user-avatar" title={props.sessionLabel}>
              {props.sessionLabel.slice(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="adm-content">

          {/* ── OVERVIEW TAB ─────────────────────── */}
          {activeTab === "overview" && (
            <AdminDailyOverview
              overview={props.overview}
              members={props.members}
              billingEvents={props.billingEvents}
              customPosts={props.customPosts}
              systemHealth={props.systemHealth}
              onNavigate={navigateTo}
            />
          )}

          {/* ── DETAILED ANALYTICS TAB ───────────── */}
          {activeTab === "analytics" && (
            <>
              <section className="adm-command-center">
                <div className="adm-command-main">
                  <div className="adm-command-kicker">
                    <StatusBadge label={adminHealth.label} tone={adminHealth.tone} />
                    <span>Gelir analiz merkezi</span>
                  </div>
                  <h2>Neyin değiştiğini, neyin engellendiğini ve gelirin nerede kaybolduğunu gör.</h2>
                  <p>{adminHealth.summary}</p>
                  <div className="adm-command-actions">
                    {topQuickActions.map((item) => (
                      <button key={item.label} type="button" className="adm-secondary-btn" onClick={item.onClick}>
                        {item.label}
                        <span>{item.detail}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="adm-command-side">
                  <AdmHeroMetric
                    label="Aylık gelir tahmini"
                    value={formatMoney(props.overview.monthlyRevenueEstimate)}
                    hint={`${props.overview.paidMembers} ücretli kullanıcı`}
                  />
                  <AdmHeroMetric
                    label="Ödeme dönüşümü"
                    value={formatPercent(props.overview.funnel7d.clickToPaidRate)}
                    hint="son 7 günde tıklamadan ödemeye"
                  />
                  <AdmHeroMetric
                    label="Ücretli kullanıcı değeri"
                    value={formatMoney(revenuePerPaidMember)}
                    hint="kullanıcı başına aylık ortalama"
                  />
                </div>
              </section>

              <div className="adm-signal-grid">
                <AdmSignalCard
                  label="Ana darboğaz"
                  value={monetizationBottleneck.label}
                  detail={`Son 7 günde ${formatPercent(monetizationBottleneck.rate)}. ${monetizationBottleneck.detail}`}
                  tone="warning"
                />
                <AdmSignalCard
                  label="En iyi checkout kaynağı"
                  value={props.overview.topCheckoutSources.find((source) => source.completed > 0)?.path
                    ? formatCtaLabel(props.overview.topCheckoutSources.find((source) => source.completed > 0)?.path ?? "")
                    : "Henüz sinyal yok"}
                  detail={
                    props.overview.topCheckoutSources.find((source) => source.completed > 0)
                      ? `${props.overview.topCheckoutSources.find((source) => source.completed > 0)?.completed} tamamlanmış ödemede ${formatPercent(props.overview.topCheckoutSources.find((source) => source.completed > 0)?.completionRate ?? 0)} başarı.`
                      : "Tamamlanmış ödeme verisi biriktiğinde en güçlü kaynak burada görünecek."
                  }
                  tone="success"
                />
                <AdmSignalCard
                  label="Canlı hareket"
                  value={`${props.overview.liveUsers5m} canlı · ${props.overview.recentSignIns24h} giriş`}
                  detail={`Son saatte ${props.overview.pageViews1h} sayfa görüntülenmesi ve son 5 dakikada ${props.overview.requests5m} istek var.`}
                  tone="neutral"
                />
              </div>

              <div className="adm-panel-card" style={{ marginBottom: "1rem" }}>
                <div className="adm-panel-card-head">
                  <h3>Gelir aksiyon planı</h3>
                  <p>Tahmine değil mevcut dönüşüm verisine göre sonraki üç hareket.</p>
                </div>
                <div className="adm-signal-grid">
                  {revenueActionPlan.map((item) => (
                    <AdmSignalCard key={item.title} label={item.title} value={item.tone === "success" ? "Büyüt" : item.tone === "warning" ? "Düzelt" : "İzle"} detail={item.detail} tone={item.tone} />
                  ))}
                </div>
              </div>

              {/* Stat Cards */}
              <div className="adm-stats-row">
                <AdmStatCard
                  label="Toplam kullanıcı"
                  value={props.overview.totalUsers}
                  trend={`${props.overview.paidMembers} ücretli · ${props.overview.trialMembers} denemede`}
                  trendUp={props.overview.paidMembers > 0}
                  iconBg="rgba(96,165,250,0.15)"
                  icon={<Users size={20} color="#60a5fa" />}
                />
                <AdmStatCard
                  label="Aktif oturum"
                  value={props.overview.activeSessions}
                  trend={`Son 24 saatte ${props.overview.recentSignIns24h} giriş`}
                  trendUp={props.overview.recentSignIns24h > 0}
                  iconBg="rgba(52,211,153,0.15)"
                  icon={<Activity size={20} color="#34d399" />}
                />
                <AdmStatCard
                  label="Yayındaki içerik"
                  value={props.customPosts.filter((p) => p.status === "published").length}
                  trend={`${props.customPosts.length} toplam · ${props.customPosts.filter((p) => p.status === "draft").length} taslak`}
                  trendUp={props.customPosts.filter((p) => p.status === "published").length > 0}
                  iconBg="rgba(129,140,248,0.15)"
                  icon={<FileText size={20} color="#818cf8" />}
                />
                <AdmStatCard
                  label="Aylık gelir tahmini"
                  value={formatMoney(props.overview.monthlyRevenueEstimate)}
                  trend={`${props.overview.paidMembers} ücretli abone`}
                  trendUp={props.overview.paidMembers > 0}
                  iconBg="rgba(52,211,153,0.15)"
                  icon={<CircleDollarSign size={20} color="#34d399" />}
                />
                <AdmStatCard
                  label="AI maliyeti (30 gün)"
                  value={formatMoney(props.overview.aiEstimatedCost30d)}
                  trend={`${props.overview.aiRequests30d} istek · ${(props.overview.aiInputTokens30d + props.overview.aiOutputTokens30d).toLocaleString("tr-TR")} token`}
                  trendUp={props.overview.aiEstimatedCost30d <= props.overview.monthlyRevenueEstimate}
                  iconBg="rgba(96,165,250,0.15)"
                  icon={<Activity size={20} color="#60a5fa" />}
                />
                <AdmStatCard
                  label="Checkout tamamlama"
                  value={formatPercent(props.overview.monetizationFunnel7d.checkoutToCompletionRate)}
                  trend={`7 günde ${props.overview.monetizationFunnel7d.checkoutCompleted}/${props.overview.monetizationFunnel7d.checkoutInitiated} tekil checkout tamamlandı`}
                  trendUp={
                    props.overview.monetizationFunnel7d.checkoutToCompletionRate >=
                    props.overview.monetizationFunnel30d.checkoutToCompletionRate
                  }
                  iconBg="rgba(251,191,36,0.15)"
                  icon={<Rocket size={20} color="#fbbf24" />}
                />
                <AdmStatCard
                  label="Fiyat → Checkout"
                  value={formatPercent(props.overview.monetizationFunnel7d.pricingViewToCheckoutRate)}
                  trend={`7 günde ${props.overview.pricingViews7d} fiyat görüntülenmesi`}
                  trendUp={
                    props.overview.monetizationFunnel7d.pricingViewToCheckoutRate >=
                    props.overview.monetizationFunnel30d.pricingViewToCheckoutRate
                  }
                  iconBg="rgba(248,113,113,0.15)"
                  icon={<AlertTriangle size={20} color="#f87171" />}
                />
              </div>

              {/* Tables Row */}
              <div className="adm-tables-row">
                {/* Recent Users */}
                <div className="adm-table-card">
                  <div className="adm-table-card-head">
                    <h3>Son kullanıcılar</h3>
                    <button type="button" className="adm-view-all-btn" onClick={() => setActiveTab("members")}>
                      Tümünü aç <ArrowUpRight size={13} />
                    </button>
                  </div>
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th>İSİM</th>
                        <th>ROL</th>
                        <th>PLAN</th>
                        <th>KAYIT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {props.members.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="adm-table-empty">Henüz kullanıcı yok.</td>
                        </tr>
                      ) : (
                        props.members.slice(0, 6).map((m) => (
                          <tr key={m.id}>
                            <td>
                              <div className="adm-table-user">
                                <div className="adm-table-avatar">{m.name.slice(0, 2).toUpperCase()}</div>
                                <div>
                                  <div className="adm-table-name">{m.name}</div>
                                  <div className="adm-table-email">{m.email}</div>
                                </div>
                              </div>
                            </td>
                            <td><StatusBadge label={m.memberType} /></td>
                            <td><StatusBadge label={m.plan} tone={m.plan === "plus" || m.plan === "pro" ? "accent" : "neutral"} /></td>
                            <td className="adm-table-muted">{formatDate(m.createdAt)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Recent Sessions */}
                <div className="adm-table-card">
                  <div className="adm-table-card-head">
                    <h3>Son oturumlar</h3>
                    <button type="button" className="adm-view-all-btn" onClick={() => setActiveTab("activity")}>
                      Tümünü aç <ArrowUpRight size={13} />
                    </button>
                  </div>
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th>KULLANICI</th>
                        <th>TÜR</th>
                        <th>OLAY</th>
                        <th>TARİH</th>
                      </tr>
                    </thead>
                    <tbody>
                      {props.authActivity.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="adm-table-empty">Henüz oturum yok.</td>
                        </tr>
                      ) : (
                        props.authActivity.slice(0, 6).map((item) => (
                          <tr key={item.id}>
                            <td>
                              <div className="adm-table-name">{item.userName}</div>
                              <div className="adm-table-email">{item.userEmail}</div>
                            </td>
                            <td>{item.memberType ? <StatusBadge label={item.memberType} /> : <span className="adm-table-muted">—</span>}</td>
                            <td>
                              <StatusBadge
                                label={item.eventType}
                                tone={item.eventType === "signin" ? "success" : "neutral"}
                              />
                            </td>
                            <td className="adm-table-muted">{formatDate(item.occurredAt)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Activity + Revenue */}
              <div className="adm-grid-2">
                <div className="adm-panel-card">
                  <div className="adm-panel-card-head">
                    <h3>Canlı hareket</h3>
                  </div>
                  <div className="adm-overview-list">
                    <div className="adm-overview-item">
                      <strong>{props.overview.liveUsers5m}</strong>
                      <span>Son 5 dakikadaki aktif kullanıcı</span>
                    </div>
                    <div className="adm-overview-item">
                      <strong>{props.overview.recentSignIns24h}</strong>
                      <span>Son 24 saatteki giriş</span>
                    </div>
                    <div className="adm-overview-item">
                      <strong>{props.overview.requests5m}</strong>
                      <span>Son 5 dakikadaki istek · {formatRelativeDate(props.overview.lastRequestAt)}</span>
                    </div>
                    <div className="adm-overview-item">
                      <strong>{props.overview.pageViews1h}</strong>
                      <span>Son saatteki sayfa görüntülenmesi</span>
                    </div>
                    <div className="adm-overview-item">
                      <strong>{props.overview.classesCount}</strong>
                      <span>Aktif öğretmen sınıfı</span>
                    </div>
                    <div className="adm-overview-item">
                      <strong>{props.customPosts.filter((p) => p.status === "published").length}</strong>
                      <span>Yayındaki özel blog içeriği</span>
                    </div>
                  </div>
                </div>

                <div className="adm-panel-card">
                  <div className="adm-panel-card-head">
                    <h3>Son ödemeler</h3>
                  </div>
                  <div className="adm-stack-list">
                    {props.billingEvents.length === 0 ? (
                      <p className="adm-muted">Henüz ödeme olayı yok.</p>
                    ) : (
                      props.billingEvents.slice(0, 6).map((event) => (
                        <div key={event.id} className="adm-list-row">
                          <div>
                            <div className="adm-table-name">{event.event_name}</div>
                            <div className="adm-table-email">{event.user_email ?? "Bilinmiyor"}</div>
                          </div>
                          <div className="adm-list-side">
                            <StatusBadge label={event.plan} tone="accent" />
                            <span className="adm-table-muted">{formatDate(event.created_at)}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="adm-revenue-total">
                    <span className="adm-muted">Aylık gelir tahmini</span>
                    <strong>{formatMoney(props.overview.monthlyRevenueEstimate)}</strong>
                  </div>
                </div>
              </div>

              <div className="adm-grid-2">
                <div className="adm-panel-card">
                  <div className="adm-panel-card-head">
                    <h3>En çok paylaşılan konuşma soruları</h3>
                    <p>Son 30 günde sosyal paylaşımı en çok üreten konuşma sonuçlarını gösterir.</p>
                  </div>
                  <div className="adm-stack-list">
                    {props.overview.topSharedSpeakingPrompts.length === 0 ? (
                      <p className="adm-muted">Henüz konuşma paylaşımı kaydedilmedi.</p>
                    ) : (
                      props.overview.topSharedSpeakingPrompts.map((item) => (
                        <div key={item.promptTitle} className="adm-list-row" style={{ alignItems: "stretch" }}>
                          <div style={{ display: "grid", gap: "0.3rem", flex: 1 }}>
                            <strong>{item.promptTitle}</strong>
                            <span className="adm-muted">
                              {item.totalShares} toplam · X {item.xShares} · WhatsApp {item.whatsappShares} · LinkedIn {item.linkedInShares}
                            </span>
                          </div>
                          <StatusBadge label={`${item.totalShares} paylaşım`} tone="accent" />
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="adm-panel-card">
                  <div className="adm-panel-card-head">
                    <h3>En çok paylaşılan rozetler</h3>
                    <p>Son 30 günde hangi sonuç rozeti etiketlerinin en güçlü paylaşımı ürettiğini gösterir.</p>
                  </div>
                  <div className="adm-stack-list">
                    {props.overview.topSharedBadges.length === 0 ? (
                      <p className="adm-muted">Henüz rozete bağlı paylaşım kaydedilmedi.</p>
                    ) : (
                      props.overview.topSharedBadges.map((item) => (
                        <div key={item.badgeLabel} className="adm-list-row" style={{ alignItems: "stretch" }}>
                          <div style={{ display: "grid", gap: "0.3rem", flex: 1 }}>
                            <strong>{item.badgeLabel}</strong>
                            <span className="adm-muted">
                              {item.totalShares} toplam · X {item.xShares} · WhatsApp {item.whatsappShares} · LinkedIn {item.linkedInShares}
                            </span>
                          </div>
                          <StatusBadge label={`${item.totalShares} paylaşım`} tone="success" />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="adm-grid-2">
                <div className="adm-panel-card">
                  <div className="adm-panel-card-head">
                    <h3>En iyi paylaşım segmentleri</h3>
                    <p>Son 30 günde en yüksek paylaşımı üreten rozet, ülke ve seri kombinasyonlarını gösterir.</p>
                  </div>
                  <div className="adm-stack-list">
                    {props.overview.topSharedIdentitySegments.length === 0 ? (
                      <p className="adm-muted">Henüz segment düzeyinde paylaşım kaydedilmedi.</p>
                    ) : (
                      props.overview.topSharedIdentitySegments.map((item) => (
                        <div key={item.segmentLabel} className="adm-list-row" style={{ alignItems: "stretch" }}>
                          <div style={{ display: "grid", gap: "0.3rem", flex: 1 }}>
                            <strong>{item.segmentLabel}</strong>
                            <span className="adm-muted">
                              {item.totalShares} toplam · X {item.xShares} · WhatsApp {item.whatsappShares} · LinkedIn {item.linkedInShares}
                            </span>
                          </div>
                          <div className="adm-list-side">
                            <StatusBadge label={item.badgeLabel} tone="accent" />
                            <span className="adm-table-muted">{item.localeFlag} {item.streakLabel}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* ── SECTION: CTA & CONVERSION ─────────────────────────────── */}
              <div style={{ padding: "0.25rem 0 0.1rem", borderBottom: "1px solid var(--line)", marginBottom: "0.5rem" }}>
                <span className="adm-muted" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
                  CTA ve dönüşüm funnelı
                </span>
              </div>

              {/* CTA raw counts quick-stats */}
              <div className="adm-stats-row adm-stats-sm" style={{ marginBottom: "0.25rem" }}>
                {[
                  { label: "CTA tıklaması (7 gün)", value: props.overview.ctaClicks7d },
                  { label: "CTA tıklaması (30 gün)", value: props.overview.ctaClicks30d },
                  { label: "Checkout tıklaması (7 gün)", value: props.overview.checkoutClicks7d },
                  { label: "Checkout tıklaması (30 gün)", value: props.overview.checkoutClicks30d },
                  { label: "Kayıt (7 gün)", value: props.overview.funnel7d.signupCount },
                  { label: "Kayıt (30 gün)", value: props.overview.funnel30d.signupCount }
                ].map(({ label, value }) => (
                  <div key={label} className="adm-mini-stat">
                    <strong>{value}</strong>
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              <div className="adm-stats-row adm-stats-sm" style={{ marginBottom: "0.5rem" }}>
                {[
                  { label: "Fiyat görüntülenmesi (7 gün)", value: props.overview.pricingViews7d },
                  { label: "Plus tıklaması (7 gün)", value: props.overview.pricingPlusClicks7d },
                  { label: "Limit teması (7 gün)", value: props.overview.practiceLimitHits7d },
                  { label: "Yükseltme teklifi (7 gün)", value: props.overview.upgradePromptViews7d },
                  { label: "Kurtarma e-postası (7 gün)", value: props.overview.practiceLimitRecoverySent7d },
                  { label: "Kurtarma checkout'u (7 gün)", value: props.overview.practiceLimitRecoveryCheckoutStarts7d },
                  { label: "Gönderilen e-posta (24 saat)", value: props.overview.emailSent24h },
                  { label: "Hatalı e-posta (24 saat)", value: props.overview.emailFailed24h },
                  { label: "İlk gün dönüşü (30 gün)", value: props.overview.dayOneReturnStarts30d },
                  { label: "Checkout başlangıcı (7 gün)", value: props.overview.checkoutInitiated7d },
                  { label: "Tamamlanan checkout (7 gün)", value: props.overview.checkoutCompleted7d },
                  { label: "Bekleyen erişim (7 gün)", value: props.overview.billingSyncPending7d },
                  { label: "AI isteği (30 gün)", value: props.overview.aiRequests30d },
                  {
                    label: "AI tokenı (30 gün)",
                    value: props.overview.aiInputTokens30d + props.overview.aiOutputTokens30d
                  }
                ].map(({ label, value }) => (
                  <div key={label} className="adm-mini-stat">
                    <strong>{value}</strong>
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              {/* Conversion Funnel + CTA Trend side-by-side */}
              <div className="adm-grid-2">
                <div className="adm-panel-card">
                  <div className="adm-panel-card-head">
                    <h3>Dönüşüm funnelı</h3>
                    <p>CTA tıklaması → kayıt → checkout → ödeme. 7 günlük oran, 30 günlük tabanla karşılaştırılır.</p>
                  </div>
                  <div className="adm-overview-list">
                    {[
                      { label: "Tıklama → kayıt", v7: props.overview.funnel7d.clickToSignupRate, v30: props.overview.funnel30d.clickToSignupRate, delta: funnelLift.signupDelta },
                      { label: "Kayıt → checkout", v7: props.overview.funnel7d.signupToCheckoutRate, v30: props.overview.funnel30d.signupToCheckoutRate, delta: funnelLift.checkoutDelta },
                      { label: "Checkout → ödeme", v7: props.overview.funnel7d.checkoutToPaidRate, v30: props.overview.funnel30d.checkoutToPaidRate, delta: props.overview.funnel7d.checkoutToPaidRate - props.overview.funnel30d.checkoutToPaidRate },
                      { label: "Tıklama → ödeme (genel)", v7: props.overview.funnel7d.clickToPaidRate, v30: props.overview.funnel30d.clickToPaidRate, delta: funnelLift.clickDelta }
                    ].map((item) => (
                      <div key={item.label} className="adm-overview-item">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "0.5rem" }}>
                          <span>{item.label}</span>
                          <span className="adm-muted" style={{ fontSize: "0.8rem" }}>30 gün: {formatPercent(item.v30)}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
                          <strong style={{ fontSize: "1.1rem" }}>{formatPercent(item.v7)}</strong>
                          <span className={`adm-stat-trend ${item.delta >= 0 ? "is-up" : "is-down"}`} style={{ width: "fit-content" }}>
                            {item.delta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            30 gün ortalamasına göre {formatPercent(Math.abs(item.delta))}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="adm-panel-card">
                  <div className="adm-panel-card-head">
                    <h3>CTA eğilimi (14 gün)</h3>
                    <p>Günlük tıklama, kayıt, checkout niyeti ve ödeme dönüşümü.</p>
                  </div>
                  <div style={{ display: "grid", gap: "0.85rem" }}>
                    {props.overview.ctaTrend14d.map((item) => (
                      <div key={item.date} style={{ display: "grid", gap: "0.45rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", fontSize: "0.82rem" }}>
                          <strong>{item.date.slice(5)}</strong>
                          <span className="adm-muted">
                            {item.ctaClicks}cl · {item.signupCount}su · {item.checkoutClicks}ch · {item.paidCount}pd
                          </span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "0.45rem" }}>
                          {[
                            { label: "Tıklama", value: item.ctaClicks, color: "var(--primary)" },
                            { label: "Kayıt", value: item.signupCount, color: "var(--accent)" },
                            { label: "Checkout", value: item.checkoutClicks, color: "#f59e0b" },
                            { label: "Ödeme", value: item.paidCount, color: "#22c55e" }
                          ].map((series) => (
                            <div key={series.label} style={{ display: "grid", gap: "0.3rem" }}>
                              <div style={{ height: 8, borderRadius: 999, background: "var(--surface-strong)", overflow: "hidden" }}>
                                <div style={{ width: `${Math.max((series.value / trendMax) * 100, series.value > 0 ? 6 : 0)}%`, height: "100%", borderRadius: 999, background: series.color }} />
                              </div>
                              <span className="adm-muted" style={{ fontSize: "0.72rem" }}>{series.label}: {series.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="adm-grid-2">
                <div className="adm-panel-card">
                  <div className="adm-panel-card-head">
                    <h3>İlk ödeme funnelı</h3>
                    <p>Fiyatlandırma, limit, checkout ve başarı arasında gelirin nerede koptuğunu gösterir.</p>
                  </div>
                  <div className="adm-overview-list">
                    {[
                      {
                        label: "Fiyat görüntülenmesi → checkout",
                        v7: props.overview.monetizationFunnel7d.pricingViewToCheckoutRate,
                        v30: props.overview.monetizationFunnel30d.pricingViewToCheckoutRate
                      },
                      {
                        label: "Limit teması → checkout",
                        v7: props.overview.monetizationFunnel7d.limitHitToCheckoutRate,
                        v30: props.overview.monetizationFunnel30d.limitHitToCheckoutRate
                      },
                      {
                        label: "Checkout → tamamlama",
                        v7: props.overview.monetizationFunnel7d.checkoutToCompletionRate,
                        v30: props.overview.monetizationFunnel30d.checkoutToCompletionRate
                      }
                    ].map((item) => (
                      <div key={item.label} className="adm-overview-item">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "0.5rem" }}>
                          <span>{item.label}</span>
                          <span className="adm-muted" style={{ fontSize: "0.8rem" }}>30 gün: {formatPercent(item.v30)}</span>
                        </div>
                        <strong style={{ fontSize: "1.1rem" }}>{formatPercent(item.v7)}</strong>
                      </div>
                    ))}
                    <div className="adm-overview-item">
                      <strong>{props.overview.billingSuccessSeen7d}</strong>
                      <span>Son 7 günde görülen ödeme başarı ekranı</span>
                    </div>
                    <div className="adm-overview-item">
                      <strong>{props.overview.billingSyncPending7d}</strong>
                      <span>7 günde hâlâ ücretli erişim bekleyen alıcı (30 gün: {props.overview.billingSyncPending30d})</span>
                    </div>
                  </div>
                </div>

                <div className="adm-panel-card">
                  <div className="adm-panel-card-head">
                    <h3>En iyi checkout kaynakları</h3>
                    <p>Son 30 gündeki en iyi checkout başlangıç yolları.</p>
                  </div>
                  <div className="adm-stack-list">
                    {props.overview.topCheckoutSources.length === 0 ? (
                      <p className="adm-muted">Henüz ilk ödeme checkout kaynağı kaydedilmedi.</p>
                    ) : (
                      props.overview.topCheckoutSources.map((item) => (
                        <div key={item.path} className="adm-list-row" style={{ alignItems: "stretch" }}>
                          <div style={{ flex: 1, display: "grid", gap: "0.3rem" }}>
                            <div className="adm-table-name">{formatCtaLabel(item.path)}</div>
                            <div className="adm-table-email">{item.path}</div>
                            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                              <StatusBadge label={`${item.initiated} başlangıç`} />
                              <StatusBadge label={`${item.completed} tamamlandı`} tone="success" />
                            </div>
                          </div>
                          <div className="adm-list-side" style={{ alignItems: "flex-end" }}>
                            <strong>{formatPercent(item.completionRate)}</strong>
                            <span className="adm-table-muted" style={{ fontSize: "0.75rem" }}>tamamlama oranı</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Best Converting CTAs + Top CTA Pages */}
              <div className="adm-grid-2">
                <div className="adm-panel-card">
                  <div className="adm-panel-card-head">
                    <h3>En iyi dönüşen CTA&apos;lar</h3>
                    <p>Son 30 günde atfedilen ödemelere göre sıralanır.</p>
                  </div>
                  <div className="adm-stack-list">
                    {props.overview.bestPerformingCtas.length === 0 ? (
                      <p className="adm-muted">Yeni kayıt ve checkout geldikçe atıf verisi burada görünecek.</p>
                    ) : (
                      props.overview.bestPerformingCtas.map((item) => (
                        <div key={item.path} className="adm-list-row" style={{ alignItems: "stretch" }}>
                          <div style={{ flex: 1, display: "grid", gap: "0.3rem" }}>
                            <div className="adm-table-name">{formatCtaLabel(item.path)}</div>
                            <div className="adm-table-email">{item.path}</div>
                            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                              <StatusBadge label={`${item.clicks} tıklama`} />
                              <StatusBadge label={`${item.signups} kayıt`} tone="success" />
                              <StatusBadge label={`${item.paidCount} ödeme`} tone="accent" />
                            </div>
                          </div>
                          <div className="adm-list-side" style={{ alignItems: "flex-end" }}>
                            <strong>{formatPercent(item.clickToPaidRate)}</strong>
                            <span className="adm-table-muted" style={{ fontSize: "0.75rem" }}>tıklama→ödeme</span>
                            <span className="adm-table-muted" style={{ fontSize: "0.75rem" }}>{formatPercent(item.clickToSignupRate)} tıklama→kayıt</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="adm-panel-card">
                  <div className="adm-panel-card-head">
                    <h3>En iyi CTA sayfaları</h3>
                    <p>Son 30 günde CTA tıklaması ve checkout niyetine göre sayfa grupları.</p>
                  </div>
                  <div className="adm-stack-list">
                    {props.overview.topCtaPages.length === 0 ? (
                      <p className="adm-muted">Henüz CTA tıklaması kaydedilmedi.</p>
                    ) : (
                      props.overview.topCtaPages.map((item) => (
                        <div key={item.page} className="adm-list-row" style={{ alignItems: "stretch" }}>
                          <div style={{ flex: 1, display: "grid", gap: "0.4rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem" }}>
                              <div className="adm-table-name">{item.page}</div>
                              <strong>{item.clicks}</strong>
                            </div>
                            <div style={{ height: 8, borderRadius: 999, background: "var(--surface-strong)", overflow: "hidden" }}>
                              <div style={{ width: `${Math.max((item.clicks / topPageMax) * 100, item.clicks > 0 ? 6 : 0)}%`, height: "100%", borderRadius: 999, background: "linear-gradient(90deg, var(--primary), var(--accent))" }} />
                            </div>
                            <div className="adm-table-email">{item.checkoutClicks} checkout tıklaması</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Winner CTA + Top CTAs */}
              <div className="adm-grid-2">
                <div className="adm-panel-card">
                  <div className="adm-panel-card-head">
                    <h3>Haftanın kazanan CTA&apos;sı</h3>
                    <p>Son 7 gündeki en güçlü ödeme dönüşümü.</p>
                  </div>
                  {props.overview.winnerCta7d ? (
                    <div className="adm-overview-list">
                      <div className="adm-overview-item">
                        <strong>{formatCtaLabel(props.overview.winnerCta7d.path)}</strong>
                        <span className="adm-table-email">{props.overview.winnerCta7d.path}</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginTop: "0.5rem" }}>
                        {[
                          { label: "Ödeme dönüşümü", value: String(props.overview.winnerCta7d.paidCount) },
                          { label: "Atfedilen kayıt", value: String(props.overview.winnerCta7d.signups) },
                          { label: "Tıklama → ödeme", value: formatPercent(props.overview.winnerCta7d.clickToPaidRate) },
                          { label: "Tıklama → kayıt", value: formatPercent(props.overview.winnerCta7d.clickToSignupRate) }
                        ].map(({ label, value }) => (
                          <div key={label} className="adm-mini-stat">
                            <strong>{value}</strong>
                            <span>{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="adm-muted">Haftalık kazanan seçmek için yeterli atıf verisi yok.</p>
                  )}
                </div>

                <div className="adm-panel-card">
                  <div className="adm-panel-card-head">
                    <h3>Tıklamaya göre en iyi CTA&apos;lar</h3>
                    <p>Son 30 günde ana sayfa ve fiyatlandırmadaki en çok tıklanan CTA yolları.</p>
                  </div>
                  <div className="adm-stack-list">
                    {props.overview.topCtas.length === 0 ? (
                      <p className="adm-muted">Henüz CTA tıklaması kaydedilmedi.</p>
                    ) : (
                      props.overview.topCtas.map((item) => (
                        <div key={`${item.event}-${item.path}`} className="adm-list-row">
                          <div>
                            <div className="adm-table-name">{formatCtaLabel(item.path)}</div>
                            <div className="adm-table-email">{item.path}</div>
                          </div>
                          <div className="adm-list-side">
                            <StatusBadge label={item.event.replaceAll("_", " ")} tone={item.event === "checkout_cta_click" ? "accent" : "neutral"} />
                            <strong>{item.count}</strong>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* ── SECTION: FEATURE USAGE ─────────────────────────────────── */}
              <div style={{ padding: "0.25rem 0 0.1rem", borderBottom: "1px solid var(--line)", marginBottom: "0.5rem" }}>
                <span className="adm-muted" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
                  Özellik kullanımı ve writing funnelı
                </span>
              </div>

              <div className="adm-grid-2">
                <div className="adm-panel-card">
                  <div className="adm-panel-card-head">
                    <h3>Özellik kullanımı</h3>
                    <p>Speaking ve writing kullanımının 7 ve 30 günlük karşılaştırması.</p>
                  </div>
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th>ÖZELLİK</th>
                        <th style={{ textAlign: "right" }}>7 GÜN</th>
                        <th style={{ textAlign: "right" }}>30 GÜN</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { label: "Mülakat başlangıcı", v7: props.overview.interviewStarts7d, v30: props.overview.interviewStarts30d },
                        { label: "Mülakat takip sorusu", v7: props.overview.interviewFollowUps7d, v30: props.overview.interviewFollowUps30d },
                        { label: "Speaking PDF dışa aktarımı", v7: props.overview.pdfExports7d, v30: props.overview.pdfExports30d },
                        { label: "Sonuç kartı indirme", v7: props.overview.resultCardDownloads7d, v30: props.overview.resultCardDownloads30d },
                        { label: "Sonuç paylaşımı", v7: props.overview.resultShares7d, v30: props.overview.resultShares30d },
                        { label: "Writing başlangıcı", v7: props.overview.writingStarts7d, v30: props.overview.writingStarts30d },
                        { label: "Writing değerlendirmesi", v7: props.overview.writingEvaluations7d, v30: props.overview.writingEvaluations30d },
                        { label: "Writing tekrarı", v7: props.overview.writingRetries7d, v30: props.overview.writingRetries30d },
                        { label: "Writing PDF dışa aktarımı", v7: props.overview.writingPdfExports7d, v30: props.overview.writingPdfExports30d }
                      ].map(({ label, v7, v30 }) => (
                        <tr key={label}>
                          <td>{label}</td>
                          <td style={{ textAlign: "right", fontWeight: 600 }}>{v7}</td>
                          <td style={{ textAlign: "right" }} className="adm-table-muted">{v30}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="adm-panel-card">
                  <div className="adm-panel-card-head">
                    <h3>Writing dönüşüm funnelı</h3>
                    <p>Kullanıcıların değerlendirme, tekrar ve dışa aktarım adımlarını tamamlayıp tamamlamadığını gösterir.</p>
                  </div>
                  <div className="adm-overview-list">
                    <div className="adm-overview-item">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "0.5rem" }}>
                        <span>Writing başlangıcı</span>
                        <span className="adm-muted" style={{ fontSize: "0.8rem" }}>30 gün: {props.overview.writingStarts30d}</span>
                      </div>
                      <strong style={{ fontSize: "1.1rem" }}>{props.overview.writingStarts7d}</strong>
                    </div>
                    {[
                      { label: "Başlangıç → değerlendirme", v7: writingFunnel.startToEval7d, v30: writingFunnel.startToEval30d },
                      { label: "Değerlendirme → tekrar", v7: writingFunnel.evalToRetry7d, v30: writingFunnel.evalToRetry30d },
                      { label: "Değerlendirme → PDF", v7: writingFunnel.evalToPdf7d, v30: writingFunnel.evalToPdf30d }
                    ].map((item) => {
                      const delta = item.v7 - item.v30;
                      return (
                        <div key={item.label} className="adm-overview-item">
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "0.5rem" }}>
                            <span>{item.label}</span>
                            <span className="adm-muted" style={{ fontSize: "0.8rem" }}>30 gün: {formatPercent(item.v30)}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
                            <strong style={{ fontSize: "1.1rem" }}>{formatPercent(item.v7)}</strong>
                            <span className={`adm-stat-trend ${delta >= 0 ? "is-up" : "is-down"}`} style={{ width: "fit-content" }}>
                              {delta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                              30 gün ortalamasına göre {formatPercent(Math.abs(delta))}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ── SECTION: SHARING ──────────────────────────────────────── */}
              <div style={{ padding: "0.25rem 0 0.1rem", borderBottom: "1px solid var(--line)", marginBottom: "0.5rem" }}>
                <span className="adm-muted" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
                  Speaking paylaşımı ve organik yayılım
                </span>
              </div>

              {/* Speaking Share Funnel + Top Share Signup Sources */}
              <div className="adm-grid-2">
                <div className="adm-panel-card">
                  <div className="adm-panel-card-head">
                    <h3>Speaking paylaşım funnelı</h3>
                    <p>Sonuç kartı indirmeden kanal bazlı paylaşıma geçişin 7 ve 30 günlük karşılaştırması.</p>
                  </div>
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th>METRİK</th>
                        <th style={{ textAlign: "right" }}>7 GÜN</th>
                        <th style={{ textAlign: "right" }}>30 GÜN</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Kart indirme</td>
                        <td style={{ textAlign: "right", fontWeight: 600 }}>{props.overview.resultCardDownloads7d}</td>
                        <td style={{ textAlign: "right" }} className="adm-table-muted">{props.overview.resultCardDownloads30d}</td>
                      </tr>
                      <tr>
                        <td>Toplam paylaşım</td>
                        <td style={{ textAlign: "right", fontWeight: 600 }}>{props.overview.resultShares7d}</td>
                        <td style={{ textAlign: "right" }} className="adm-table-muted">{props.overview.resultShares30d}</td>
                      </tr>
                      <tr>
                        <td>İndirme → paylaşım oranı</td>
                        <td style={{ textAlign: "right", fontWeight: 600 }}>
                          <span style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.3rem" }}>
                            {formatPercent(speakingShareFunnel.cardToShare7d)}
                            {(() => { const d = speakingShareFunnel.cardToShare7d - speakingShareFunnel.cardToShare30d; return <span className={`adm-stat-trend ${d >= 0 ? "is-up" : "is-down"}`} style={{ width: "fit-content", fontSize: "0.72rem" }}>{d >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}{formatPercent(Math.abs(d))}</span>; })()}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }} className="adm-table-muted">{formatPercent(speakingShareFunnel.cardToShare30d)}</td>
                      </tr>
                      <tr>
                        <td>X (Twitter) paylaşımı</td>
                        <td style={{ textAlign: "right", fontWeight: 600 }}>{props.overview.resultShareX7d}</td>
                        <td style={{ textAlign: "right" }} className="adm-table-muted">{props.overview.resultShareX30d}</td>
                      </tr>
                      <tr>
                        <td>WhatsApp paylaşımı</td>
                        <td style={{ textAlign: "right", fontWeight: 600 }}>{props.overview.resultShareWhatsApp7d}</td>
                        <td style={{ textAlign: "right" }} className="adm-table-muted">{props.overview.resultShareWhatsApp30d}</td>
                      </tr>
                      <tr>
                        <td>LinkedIn paylaşımı</td>
                        <td style={{ textAlign: "right", fontWeight: 600 }}>{props.overview.resultShareLinkedIn7d}</td>
                        <td style={{ textAlign: "right" }} className="adm-table-muted">{props.overview.resultShareLinkedIn30d}</td>
                      </tr>
                      <tr>
                        <td>Paylaşıma atfedilen kayıt</td>
                        <td style={{ textAlign: "right", fontWeight: 600 }}>{props.overview.shareAttributedSignups7d}</td>
                        <td style={{ textAlign: "right" }} className="adm-table-muted">{props.overview.shareAttributedSignups30d}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="adm-panel-card">
                  <div className="adm-panel-card-head">
                    <h3>Kayıt getiren paylaşım kaynakları</h3>
                    <p>Son 30 günde sosyal paylaşımı kullanıcı kaydına dönüştüren herkese açık sonuç sayfaları.</p>
                  </div>
                  <div className="adm-stack-list">
                    {props.overview.topShareSignupSources.length === 0 ? (
                      <p className="adm-muted">Paylaşılan sonuç sayfalarından henüz kayıt atfı yok.</p>
                    ) : (
                      props.overview.topShareSignupSources.map((item) => (
                        <div key={item.sharePath} className="adm-list-row" style={{ alignItems: "stretch" }}>
                          <div style={{ display: "grid", gap: "0.3rem", flex: 1 }}>
                            <strong>{item.promptTitle}</strong>
                            <span className="adm-muted">{item.learnerName} · {item.sharePath}</span>
                          </div>
                          <StatusBadge label={`${item.signups} kayıt`} tone="success" />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── MEMBERS TAB ──────────────────────── */}
          {activeTab === "members" && (
            <div className="adm-panel-card">
              <div className="adm-panel-card-head">
                <div>
                  <h3>Kullanıcı listesi</h3>
                  <p className="adm-muted">Plan, ödeme ve deneme erişimini yönet. Parolalar hiçbir zaman gösterilmez.</p>
                </div>
                <div className="adm-inline-feedback">
                  <span className="adm-muted">{filteredMembers.length} kullanıcı</span>
                  {memberMessage && <span className="adm-success">{memberMessage}</span>}
                  {memberError && <span className="adm-error">{memberError}</span>}
                </div>
              </div>

              <div className="adm-filter-grid">
                <div className="adm-search-wrap adm-filter-search">
                  <Search size={14} className="adm-search-icon" />
                  <input
                    className="adm-search-input"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setMemberVisibleCount(20);
                    }}
                    placeholder="İsim, e-posta, kurum veya kod ara..."
                  />
                </div>
                <select
                  value={memberTypeFilter}
                  onChange={(e) => {
                    setMemberTypeFilter(e.target.value);
                    setMemberVisibleCount(20);
                  }}
                  className="adm-select"
                >
                  <option value="all">Tüm kullanıcı türleri</option>
                  <option value="student">Öğrenciler</option>
                  <option value="teacher">Öğretmenler</option>
                  <option value="school">Okullar</option>
                </select>
                <select
                  value={planFilter}
                  onChange={(e) => {
                    setPlanFilter(e.target.value);
                    setMemberVisibleCount(20);
                  }}
                  className="adm-select"
                >
                  <option value="all">Tüm planlar</option>
                  <option value="free">Ücretsiz</option>
                  <option value="plus">Plus</option>
                  <option value="pro">Pro</option>
                </select>
                <select
                  value={billingFilter}
                  onChange={(e) => {
                    setBillingFilter(e.target.value);
                    setMemberVisibleCount(20);
                  }}
                  className="adm-select"
                >
                  <option value="all">Tüm ödeme durumları</option>
                  <option value="free">Ücretsiz</option>
                  <option value="active">Aktif</option>
                  <option value="on_trial">Denemede</option>
                  <option value="paused">Duraklatıldı</option>
                  <option value="cancelled">İptal</option>
                  <option value="past_due">Ödeme gecikti</option>
                  <option value="expired">Süresi doldu</option>
                  <option value="refunded">İade edildi</option>
                </select>
              </div>

              <div className="adm-member-list">
                {filteredMembers.length === 0 ? (
                  <div className="adm-table-empty" style={{ padding: "3rem", textAlign: "center" }}>Filtrelerle eşleşen kullanıcı yok.</div>
                ) : (
                  visibleMembers.map((member) => (
                    <article key={member.id} className="adm-member-card">
                      <div className="adm-member-main">
                        <div className="adm-member-top">
                          <div className="adm-table-avatar adm-avatar-lg">
                            {member.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="adm-table-name">{member.name}</div>
                            <div className="adm-table-email">{member.email}</div>
                            {member.organizationName && <div className="adm-table-email">{member.organizationName}</div>}
                          </div>
                          <div className="adm-member-badges">
                            <StatusBadge label={member.memberType} />
                            <StatusBadge
                              label={`Plan: ${translateStatus(member.plan)}`}
                              tone={member.plan === "plus" || member.plan === "pro" ? "accent" : "neutral"}
                            />
                            <StatusBadge
                              label={`Ödeme: ${translateStatus(member.billingStatus)}`}
                              tone={member.billingStatus === "active" || member.billingStatus === "on_trial" ? "success" : "warning"}
                            />
                          </div>
                        </div>

                        <div className="adm-member-metrics">
                          {[
                            { label: "Aylık değer", value: formatMoney(member.monthlyValue) },
                            { label: "Pratik", value: member.totalPracticeSessions },
                            { label: "Ort. skor", value: member.averageScore ?? "—" },
                            { label: "Öğretmen notu", value: member.teacherNoteCount },
                            { label: "Son giriş", value: formatDate(member.lastSignInAt) },
                            { label: "Son çıkış", value: formatDate(member.lastSignOutAt) }
                          ].map(({ label, value }) => (
                            <div key={label} className="adm-metric-cell">
                              <span className="adm-muted">{label}</span>
                              <strong>{value}</strong>
                            </div>
                          ))}
                        </div>

                        {(member.referralCodeUsed || member.trialEndsAt) && (
                          <div className="adm-member-foot">
                            {member.referralCodeUsed && <span className="adm-muted">Davet kodu: <strong>{member.referralCodeUsed}</strong></span>}
                            {member.trialEndsAt && <span className="adm-muted">Deneme bitişi: <strong>{formatDate(member.trialEndsAt)}</strong></span>}
                            <span className="adm-muted">Parola: <strong>{member.passwordStatus === "protected" ? "Korumalı" : "Yok"}</strong></span>
                          </div>
                        )}
                      </div>

                      <div className="adm-member-actions">
                        <select
                          value={memberDrafts[member.id]?.plan ?? member.plan}
                          onChange={(e) => updateMemberDraft(member.id, { plan: e.target.value })}
                          className="adm-select"
                        >
                          <option value="free">Ücretsiz</option>
                          <option value="plus">Plus</option>
                          <option value="pro">Pro</option>
                        </select>
                        <select
                          value={memberDrafts[member.id]?.billingStatus ?? member.billingStatus}
                          onChange={(e) => updateMemberDraft(member.id, { billingStatus: e.target.value })}
                          className="adm-select"
                        >
                          <option value="free">Ücretsiz</option>
                          <option value="active">Aktif</option>
                          <option value="on_trial">Denemede</option>
                          <option value="paused">Duraklatıldı</option>
                          <option value="cancelled">İptal</option>
                          <option value="past_due">Ödeme gecikti</option>
                          <option value="expired">Süresi doldu</option>
                          <option value="refunded">İade edildi</option>
                        </select>
                        <input
                          value={memberDrafts[member.id]?.trialDays ?? "7"}
                          onChange={(e) => updateMemberDraft(member.id, { trialDays: e.target.value })}
                          placeholder="Deneme günü"
                          className="adm-input"
                        />
                        <button
                          className="adm-save-btn"
                          type="button"
                          disabled={memberBusyId === member.id}
                          onClick={() => saveMember(member.id)}
                        >
                          {memberBusyId === member.id ? "Kaydediliyor..." : "Erişimi kaydet"}
                        </button>
                      </div>

                      {member.emailLog && member.emailLog.length > 0 && (
                        <div className="adm-email-log">
                          <p className="adm-muted" style={{ marginBottom: "0.5rem", fontWeight: 600 }}>E-posta geçmişi</p>
                          <table className="adm-email-log-table">
                            <thead>
                              <tr>
                                <th>Şablon</th>
                                <th>Konu</th>
                                <th>Durum</th>
                                <th>Gönderim</th>
                              </tr>
                            </thead>
                            <tbody>
                              {member.emailLog.map((log) => {
                                const templateLabels: Record<string, string> = {
                                  onboarding_1: "Hoş geldin",
                                  onboarding_2: "1. gün dönüş",
                                  onboarding_3: "İlk hafta listesi",
                                  onboarding_4: "1. hafta başarısı",
                                  onboarding_5: "Günlük pratik"
                                };
                                const templateLabel = templateLabels[log.template] ?? log.template;
                                return (
                                  <tr key={log.id}>
                                    <td>{templateLabel}</td>
                                    <td>{log.subject}</td>
                                    <td>
                                      <span className={`adm-email-state ${log.status === "sent" ? "is-sent" : "is-failed"}`}>
                                        {log.status === "sent" ? "Gönderildi" : "Başarısız"}
                                      </span>
                                    </td>
                                    <td>{formatDate(log.sentAt)}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </article>
                  ))
                )}
              </div>
              {visibleMembers.length < filteredMembers.length && (
                <div className="adm-member-pagination">
                  <span>
                    {visibleMembers.length} / {filteredMembers.length} kullanıcı gösteriliyor
                  </span>
                  <button
                    type="button"
                    className="adm-secondary-btn"
                    onClick={() => setMemberVisibleCount((current) => current + 20)}
                  >
                    20 kullanıcı daha yükle
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── CONTENT TAB ──────────────────────── */}
          {activeTab === "content" && (
            <div className="adm-grid-2">
              <div className="adm-panel-card">
                <div className="adm-panel-card-head">
                  <div>
                    <h3>Blog içeriği ekle</h3>
                    <p className="adm-muted">Yayınlanan içerikler otomatik olarak herkese açık blogda görünür.</p>
                  </div>
                  <div className="adm-inline-feedback">
                    {contentMessage && <span className="adm-success">{contentMessage}</span>}
                    {contentError && <span className="adm-error">{contentError}</span>}
                  </div>
                </div>

                <div className="adm-form-grid">
                  <select className="adm-select" value={newPost.language} onChange={(e) => setNewPost((c) => ({ ...c, language: e.target.value }))}>
                    <option value="en">English</option>
                    <option value="tr">Türkçe</option>
                    <option value="de">Deutsch</option>
                    <option value="fr">Français</option>
                    <option value="es">Español</option>
                  </select>
                  <select className="adm-select" value={newPost.status} onChange={(e) => setNewPost((c) => ({ ...c, status: e.target.value }))}>
                    <option value="draft">Taslak</option>
                    <option value="published">Yayında</option>
                  </select>
                  <input className="adm-input adm-span-2" value={newPost.title} onChange={(e) => setNewPost((c) => ({ ...c, title: e.target.value }))} placeholder="İçerik başlığı" />
                  <input className="adm-input" value={newPost.slug} onChange={(e) => setNewPost((c) => ({ ...c, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))} placeholder="post-slug" />
                  <input className="adm-input adm-span-2" value={newPost.description} onChange={(e) => setNewPost((c) => ({ ...c, description: e.target.value }))} placeholder="Meta açıklaması" />
                  <input className="adm-input adm-span-2" value={newPost.keywords} onChange={(e) => setNewPost((c) => ({ ...c, keywords: e.target.value }))} placeholder="Anahtar kelimeler, virgülle ayır" />
                  <textarea className="adm-textarea adm-span-2" value={newPost.intro} onChange={(e) => setNewPost((c) => ({ ...c, intro: e.target.value }))} placeholder="Giriş paragrafı" />
                  <textarea className="adm-textarea adm-span-2 adm-textarea-lg" value={newPost.body} onChange={(e) => setNewPost((c) => ({ ...c, body: e.target.value }))} placeholder="## başlıklarını ve paragrafları kullan" />
                </div>

                <div className="adm-inline-feedback" style={{ marginTop: "1rem" }}>
                  <button className="adm-save-btn" type="button" disabled={contentBusy} onClick={createPost}>
                    {contentBusy ? "Kaydediliyor..." : "İçeriği kaydet"}
                  </button>
                  <a className="adm-secondary-btn" href="/blog" target="_blank" rel="noreferrer">
                    Blogu aç <ExternalLink size={13} />
                  </a>
                </div>
              </div>

              <div className="adm-panel-card">
                <div className="adm-panel-card-head">
                  <h3>Blog içerikleri</h3>
                </div>
                <div className="adm-stack-list">
                  {props.customPosts.length === 0 ? (
                    <p className="adm-muted">Henüz özel içerik yok.</p>
                  ) : (
                    props.customPosts.map((post) => (
                      <div key={post.id} className="adm-list-row">
                        <div>
                          <div className="adm-table-name">{post.title}</div>
                          <div className="adm-table-email">/{post.slug}</div>
                          <div className="adm-table-email">{post.description}</div>
                        </div>
                        <div className="adm-list-side">
                          <StatusBadge label={post.language.toUpperCase()} />
                          <StatusBadge label={post.status} tone={post.status === "published" ? "success" : "warning"} />
                          <button
                            type="button"
                            className="adm-secondary-btn"
                            disabled={contentBusyId === post.id}
                            onClick={() => updatePostStatus(post.id, post.status === "published" ? "draft" : "published")}
                          >
                            {contentBusyId === post.id ? "Kaydediliyor..." : post.status === "published" ? "Taslağa al" : "Yayınla"}
                          </button>
                          <a className="adm-secondary-btn" href={`/blog/${post.slug}`} target="_blank" rel="noreferrer">
                            <ExternalLink size={13} />
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── REFERRALS TAB ────────────────────── */}
          {activeTab === "referrals" && (
            <div className="adm-grid-2">
              <div className="adm-panel-card">
                <div className="adm-panel-card-head">
                  <div>
                    <h3>Davet kodu oluştur</h3>
                    <p className="adm-muted">Paylaşılan kodlar kullanıcıya otomatik deneme erişimi açar.</p>
                  </div>
                </div>

                <div className="adm-stats-row adm-stats-sm">
                  <div className="adm-mini-stat">
                    <strong>{referralOverview.totalCodes}</strong>
                    <span>Toplam kod</span>
                  </div>
                  <div className="adm-mini-stat">
                    <strong>{referralOverview.activeCodes}</strong>
                    <span>Aktif</span>
                  </div>
                  <div className="adm-mini-stat">
                    <strong>{referralOverview.totalUses}</strong>
                    <span>Toplam kullanım</span>
                  </div>
                  <div className="adm-mini-stat">
                    <strong>{referralOverview.remainingSeats}</strong>
                    <span>Kalan hak</span>
                  </div>
                </div>

                <div className="adm-form-grid adm-form-grid-2">
                  <input className="adm-input" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="CODE" />
                  <input className="adm-input" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Açıklama" />
                  <input className="adm-input" value={trialDays} onChange={(e) => setTrialDays(e.target.value)} placeholder="Deneme günü" />
                  <input className="adm-input" value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} placeholder="Kullanım sınırı (isteğe bağlı)" />
                </div>

                <div className="adm-inline-feedback" style={{ marginTop: "1rem" }}>
                  <button className="adm-save-btn" type="button" disabled={busy} onClick={createCode}>
                    {busy ? "Oluşturuluyor..." : "Davet kodu oluştur"}
                  </button>
                  {message && <span className="adm-success">{message}</span>}
                  {error && <span className="adm-error">{error}</span>}
                </div>
              </div>

              <div className="adm-panel-card">
                <div className="adm-panel-card-head">
                  <h3>Mevcut kodlar</h3>
                </div>
                <div className="adm-stack-list">
                  {props.referralCodes.length === 0 ? (
                    <p className="adm-muted">Henüz davet kodu yok.</p>
                  ) : (
                    props.referralCodes.map((item) => (
                      <div key={item.id} className="adm-list-row">
                        <div>
                          <div className="adm-table-name" style={{ fontFamily: "monospace" }}>{item.code}</div>
                          <div className="adm-table-email">{item.label || "Açıklama yok"}</div>
                        </div>
                        <div className="adm-list-side">
                          <StatusBadge label={`${item.trialDays}d`} tone="accent" />
                          <span className="adm-table-email">
                            {item.usageCount}{item.usageLimit ? ` / ${item.usageLimit}` : ""} kullanım
                          </span>
                          <StatusBadge label={item.active ? "active" : "inactive"} tone={item.active ? "success" : "warning"} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── BILLING TAB ──────────────────────── */}
          {activeTab === "billing" && (
            <div style={{ display: "grid", gap: "1rem", gridColumn: "1 / -1" }}>
              <div className="adm-signal-grid">
                <AdmSignalCard
                  label="Aktif abonelik"
                  value={String(billingOverview.activeCount)}
                  detail={`${billingOverview.trialingCount} denemede, ${billingOverview.churnedCount} iptal veya süresi dolmuş ödeme kaydı var.`}
                  tone={billingOverview.activeCount > billingOverview.churnedCount ? "success" : "warning"}
                />
                <AdmSignalCard
                  label="Checkout tamamlama"
                  value={formatPercent(props.overview.monetizationFunnel7d.checkoutToCompletionRate)}
                  detail={`Son 7 günde ${props.overview.monetizationFunnel7d.checkoutCompleted}/${props.overview.monetizationFunnel7d.checkoutInitiated} tekil checkout tamamlandı.`}
                  tone={
                    props.overview.monetizationFunnel7d.checkoutToCompletionRate >= 40
                      ? "success"
                      : props.overview.monetizationFunnel7d.checkoutToCompletionRate >= 20
                        ? "neutral"
                        : "warning"
                  }
                />
                <AdmSignalCard
                  label="Başarı sayfasına ulaşım"
                  value={`${props.overview.monetizationFunnel7d.billingSuccessSeen}/${props.overview.monetizationFunnel7d.checkoutCompleted}`}
                  detail="Son 7 günde ödeme tamamlayanların kaçı başarı durumuna ulaştı."
                  tone={
                    props.overview.monetizationFunnel7d.billingSuccessSeen >=
                    props.overview.monetizationFunnel7d.checkoutCompleted
                      ? "success"
                      : "warning"
                  }
                />
                <AdmSignalCard
                  label="Bekleyen erişim senkronu"
                  value={String(props.overview.billingSyncPending7d)}
                  detail={`Son 30 günde ${props.overview.billingSyncPending30d} alıcı hesabı bekleyen erişim durumuna düştü.`}
                  tone={props.overview.billingSyncPending7d > 0 ? "warning" : "success"}
                />
                <AdmSignalCard
                  label="Limit kurtarma e-postası"
                  value={
                    props.overview.practiceLimitRecoveryEnabled
                      ? `${props.overview.practiceLimitRecoveryCheckoutStarts7d}/${props.overview.practiceLimitRecoverySent7d}`
                      : "Kapalı"
                  }
                  detail={
                    props.overview.practiceLimitRecoveryEnabled
                      ? `30 günde ${props.overview.practiceLimitRecoverySent30d} gönderildi ve ${props.overview.practiceLimitRecoveryCheckoutStarts30d} checkout başlatıldı.`
                      : "Etkinleştirmek için doğrulanmış Lemon webhook teslimatı bekleniyor."
                  }
                  tone={props.overview.practiceLimitRecoveryCheckoutStarts7d > 0 ? "success" : "neutral"}
                />
              </div>

              <div className="adm-panel-card">
                <div className="adm-panel-card-head">
                  <h3>Ödeme aksiyon kuyruğu</h3>
                  <p>Bir sonraki gelir artışının nereden geleceğini burada önceliklendir.</p>
                </div>
                <div className="adm-signal-grid">
                  {billingActionQueue.map((item) => (
                    <AdmSignalCard key={item.title} label={item.title} value={item.value} detail={item.detail} tone={item.tone} />
                  ))}
                </div>
              </div>

              <div className="adm-tables-row">
                <div className="adm-table-card">
                  <div className="adm-table-card-head">
                    <h3>Ödeme durumu dağılımı</h3>
                    <span className="adm-badge adm-badge-neutral">{props.billingEvents.length} toplam</span>
                  </div>
                  <div className="adm-stack-list">
                    {Object.keys(billingOverview.statusCounts).length === 0 ? (
                      <p className="adm-muted">Henüz ödeme olayı yok.</p>
                    ) : (
                      Object.entries(billingOverview.statusCounts)
                        .sort((left, right) => right[1] - left[1])
                        .map(([status, count]) => (
                          <div key={status} className="adm-list-row">
                            <div>
                              <div className="adm-table-name">{translateStatus(status)}</div>
                              <div className="adm-table-email">Ödeme kayıtlarının {formatPercent(props.billingEvents.length ? (count / props.billingEvents.length) * 100 : 0)} kadarı</div>
                            </div>
                            <div className="adm-list-side">
                              <StatusBadge
                                label={`${count}`}
                                tone={status === "active" ? "success" : status === "cancelled" || status === "expired" ? "warning" : "neutral"}
                              />
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>

                <div className="adm-table-card">
                  <div className="adm-table-card-head">
                    <h3>Plan dağılımı</h3>
                    <span className="adm-badge adm-badge-neutral">{Object.keys(billingOverview.planCounts).length} plan</span>
                  </div>
                  <div className="adm-stack-list">
                    {Object.keys(billingOverview.planCounts).length === 0 ? (
                      <p className="adm-muted">Henüz plan sinyali yok.</p>
                    ) : (
                      Object.entries(billingOverview.planCounts)
                        .sort((left, right) => right[1] - left[1])
                        .map(([plan, count]) => (
                          <div key={plan} className="adm-list-row">
                            <div>
                              <div className="adm-table-name">{plan}</div>
                              <div className="adm-table-email">
                                Ödeme kayıtlarının {formatPercent(props.billingEvents.length ? (count / props.billingEvents.length) * 100 : 0)} kadarı
                              </div>
                            </div>
                            <div className="adm-list-side">
                              <StatusBadge label={`${count} olay`} tone={plan === "plus" || plan === "pro" ? "accent" : "neutral"} />
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>

              <div className="adm-table-card">
                <div className="adm-table-card-head">
                  <h3>Son ödeme olayları</h3>
                  <span className="adm-badge adm-badge-neutral">{billingOverview.recentEvents.length} kayıt</span>
                </div>
              </div>
              {props.billingEvents.length === 0 ? (
                <div className="adm-table-card">
                  <p className="adm-table-muted" style={{ padding: "1rem" }}>Henüz ödeme olayı yok.</p>
                </div>
              ) : (
                <div className="adm-table-card">
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th>OLAY</th>
                        <th>E-POSTA</th>
                        <th>PLAN</th>
                        <th>DURUM</th>
                        <th>TARİH</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billingOverview.recentEvents.map((ev) => (
                        <tr key={ev.id}>
                          <td style={{ fontWeight: 600 }}>{ev.event_name.replace(/_/g, " ")}</td>
                          <td className="adm-table-muted">{ev.user_email ?? "—"}</td>
                          <td><StatusBadge label={ev.plan} tone={ev.plan === "pro" || ev.plan === "plus" ? "accent" : "neutral"} /></td>
                          <td><StatusBadge label={ev.billing_status} tone={ev.billing_status === "active" ? "success" : ev.billing_status === "cancelled" || ev.billing_status === "expired" ? "warning" : "neutral"} /></td>
                          <td className="adm-table-muted">{formatDate(ev.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── INSTITUTIONS TAB ─────────────────── */}
          {activeTab === "institutions" && (
            <div className="adm-table-card" style={{ gridColumn: "1 / -1" }}>
              <div className="adm-table-card-head">
                <h3>Kurumlar</h3>
                <span className="adm-badge adm-badge-neutral">{props.institutions.length} toplam</span>
              </div>
              {props.institutions.length === 0 ? (
                <p className="adm-table-muted" style={{ padding: "1rem" }}>Henüz kurum yok.</p>
              ) : (
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>KURUM</th>
                      <th>ÖĞRETMEN</th>
                      <th>ÖĞRENCİ</th>
                      <th>OKUL</th>
                      <th>ORT. SKOR</th>
                      <th>TOPLAM PRATİK</th>
                    </tr>
                  </thead>
                  <tbody>
                    {props.institutions.map((inst) => (
                      <tr key={inst.organizationName}>
                        <td>
                          <div className="adm-table-user">
                            <div className="adm-table-avatar">{inst.organizationName.slice(0, 2).toUpperCase()}</div>
                            <div className="adm-table-name">{inst.organizationName}</div>
                          </div>
                        </td>
                        <td>{inst.teachers}</td>
                        <td>{inst.students}</td>
                        <td>{inst.schools}</td>
                        <td>{inst.averageScore != null ? inst.averageScore.toFixed(1) : "—"}</td>
                        <td>{inst.totalSessions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── SYSTEM TAB ───────────────────────── */}
          {activeTab === "system" && (
            <div className="adm-grid-2">
              <div className="adm-panel-card">
                <div className="adm-panel-card-head">
                  <h3>Ortam bilgisi</h3>
                </div>
                <div className="adm-overview-list">
                  {[
                    { label: "NODE_ENV", value: props.systemHealth.nodeEnv },
                    { label: "Next.js", value: "15 (App Router)" },
                    { label: "Site URL", value: props.systemHealth.siteUrl },
                    { label: "Vercel env", value: props.systemHealth.vercelEnv },
                    { label: "Region", value: props.systemHealth.region },
                    { label: "Yönetici oturumu", value: props.sessionLabel }
                  ].map(({ label, value }) => (
                    <div key={label} className="adm-overview-item">
                      <strong style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{label}</strong>
                      <span style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--adm-muted)" }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="adm-panel-card">
                <div className="adm-panel-card-head">
                  <h3>Gelir altyapısı</h3>
                </div>
                <div className="adm-stack-list">
                  {[
                    {
                      label: "Canlı veritabanı",
                      ready: props.systemHealth.databaseConfigured,
                      detail: props.systemHealth.databaseConfigured ? "Kalıcı ürün verisi bağlı." : "DATABASE_URL eksik."
                    },
                    {
                      label: "Lemon webhook",
                      ready: props.systemHealth.lemonWebhookConfigured,
                      detail: props.systemHealth.lemonWebhookConfigured
                        ? "İmzalı ödeme olayları erişimi güncelleyebilir."
                        : "Secret eklenene kadar ödeme olayları ücretli erişimi açamaz."
                    },
                    {
                      label: "E-posta teslimatı",
                      ready: props.systemHealth.emailConfigured && !props.overview.emailQuotaBlocked,
                      detail: props.overview.emailQuotaBlocked
                        ? "Sağlayıcı kotası yaşam döngüsü gönderimlerini engelliyor."
                        : props.systemHealth.emailConfigured
                          ? `Günlük ${props.systemHealth.lifecycleDailyBudget} gönderim bütçesiyle hazır.`
                          : "RESEND_API_KEY veya EMAIL_FROM eksik."
                    },
                    {
                      label: "Ürün analitiği",
                      ready: props.systemHealth.analyticsConfigured,
                      detail: props.systemHealth.analyticsConfigured
                        ? "Birinci taraf funnel olayları açık."
                        : "Analitik ortam ayarlarında kapalı."
                    }
                  ].map((item) => (
                    <div key={item.label} className="adm-list-row">
                      <div>
                        <span className="adm-table-name">{item.label}</span>
                        <span className="adm-table-email">{item.detail}</span>
                      </div>
                      <StatusBadge
                        label={item.ready ? "Hazır" : "Aksiyon gerekli"}
                        tone={item.ready ? "success" : "warning"}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="adm-panel-card">
                <div className="adm-panel-card-head">
                  <h3>Platform özeti</h3>
                </div>
                <div className="adm-overview-list">
                  {[
                    { label: "Toplam kullanıcı", value: String(props.overview.totalUsers) },
                    { label: "Öğrenci", value: String(props.overview.totalStudents) },
                    { label: "Öğretmen", value: String(props.overview.totalTeachers) },
                    { label: "Okul", value: String(props.overview.totalSchools) },
                    { label: "Ücretli kullanıcı", value: String(props.overview.paidMembers) },
                    { label: "Denemede", value: String(props.overview.trialMembers) },
                    { label: "Aktif oturum", value: String(props.overview.activeSessions) },
                    { label: "Aylık gelir tahmini", value: formatMoney(props.overview.monthlyRevenueEstimate) },
                    { label: "Canlı kullanıcı (5 dk)", value: String(props.overview.liveUsers5m) },
                    { label: "Son istek", value: formatRelativeDate(props.overview.lastRequestAt) }
                  ].map(({ label, value }) => (
                    <div key={label} className="adm-overview-item">
                      <strong>{label}</strong>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="adm-panel-card">
                <div className="adm-panel-card-head">
                  <h3>Hızlı işlemler</h3>
                </div>
                <div className="adm-stack-list">
                  <div className="adm-list-row">
                    <div>
                      <span className="adm-table-name">E-posta teslimat testi</span>
                      <span className="adm-table-email">
                        Yapılandırılmış SpeakAce adresine tek bir canlı test mesajı gönder.
                      </span>
                    </div>
                    <button
                      type="button"
                      className="adm-secondary-btn"
                      onClick={sendEmailDeliveryTest}
                      disabled={emailTestBusy || !props.systemHealth.emailConfigured}
                    >
                      <MailCheck size={13} />
                      {emailTestBusy ? "Gönderiliyor..." : "Test gönder"}
                    </button>
                  </div>
                  {emailTestMessage && <span className="adm-success">{emailTestMessage}</span>}
                  {emailTestError && <span className="adm-error">{emailTestError}</span>}
                  {[
                    { label: "Herkese açık site", href: "/" },
                    { label: "Blog", href: "/blog" },
                    { label: "Fiyatlandırma", href: "/pricing" },
                    { label: "Yönetici girişi", href: "/admin/login" }
                  ].map(({ label, href }) => (
                    <div key={label} className="adm-list-row">
                      <span className="adm-table-name">{label}</span>
                      <a className="adm-secondary-btn" href={href} target="_blank" rel="noreferrer">
                        Aç <ExternalLink size={13} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              <div className="adm-panel-card">
                <div className="adm-panel-card-head">
                  <h3>Veri özeti</h3>
                </div>
                <div className="adm-overview-list">
                  {[
                    { label: "Yüklenen kullanıcı", value: String(props.members.length) },
                    { label: "Ödeme olayı", value: String(props.billingEvents.length) },
                    { label: "Oturum hareketi", value: String(props.authActivity.length) },
                    { label: "Davet kodu", value: String(props.referralCodes.length) },
                    { label: "Kurum", value: String(props.institutions.length) },
                    { label: "Özel blog içeriği", value: String(props.customPosts.length) },
                    { label: "Yayındaki içerik", value: String(props.customPosts.filter((p) => p.status === "published").length) }
                  ].map(({ label, value }) => (
                    <div key={label} className="adm-overview-item">
                      <strong>{label}</strong>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── ACTIVITY TAB ─────────────────────── */}
          {activeTab === "activity" && (
            <div className="adm-grid-2">
              <div className="adm-panel-card">
                <div className="adm-panel-card-head">
                  <h3>Giriş ve çıkış hareketleri</h3>
                </div>
                <div className="adm-stack-list">
                  {props.authActivity.length === 0 ? (
                    <p className="adm-muted">Henüz hareket kaydedilmedi.</p>
                  ) : (
                    props.authActivity.map((item) => (
                      <div key={item.id} className="adm-list-row">
                        <div>
                          <div className="adm-table-name">{item.userName}</div>
                          <div className="adm-table-email">{item.userEmail}</div>
                        </div>
                        <div className="adm-list-side">
                          {item.memberType && <StatusBadge label={item.memberType} />}
                          <StatusBadge label={item.eventType} tone={item.eventType === "signin" ? "success" : "neutral"} />
                          <span className="adm-table-email">{formatDate(item.occurredAt)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="adm-panel-card">
                <div className="adm-panel-card-head">
                  <h3>Kurum hareketleri</h3>
                </div>
                <div className="adm-stack-list">
                  {props.institutions.length === 0 ? (
                    <p className="adm-muted">Henüz kurum kaydı yok.</p>
                  ) : (
                    props.institutions.map((item) => (
                      <div key={item.organizationName} className="adm-list-row">
                        <div>
                          <div className="adm-table-name">{item.organizationName}</div>
                          <div className="adm-table-email">
                            {item.teachers} öğretmen · {item.students} öğrenci · {item.schools} okul
                          </div>
                        </div>
                        <Building2 size={18} color="#8b949e" />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
