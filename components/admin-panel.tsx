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
  Bell,
  TrendingUp,
  TrendingDown,
  UserCheck,
  Clock,
  Target,
  ChevronLeft,
  ArrowUpRight,
  Tag,
  Building2,
  ExternalLink
} from "lucide-react";
import {
  AdminAuthActivityRecord,
  AdminCustomPostRecord,
  AdminInstitutionRecord,
  AdminMemberRecord,
  AdminOverview,
  ReferralCodeRecord
} from "@/lib/types";

type AdminTab = "overview" | "members" | "billing" | "institutions" | "content" | "referrals" | "activity" | "system";

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
    .trim() || "unknown";
}

function formatRelativeDate(value?: string | null) {
  if (!value) return "No recent requests";
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.max(0, Math.round(diffMs / 60000));
  if (diffMin < 1) return "Just now";
  if (diffMin === 1) return "1 minute ago";
  if (diffMin < 60) return `${diffMin} minutes ago`;
  const diffHours = Math.round(diffMin / 60);
  if (diffHours === 1) return "1 hour ago";
  return `${diffHours} hours ago`;
}

function StatusBadge({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "success" | "warning" | "accent" }) {
  const classes = {
    neutral: "adm-badge-neutral",
    success: "adm-badge-success",
    warning: "adm-badge-warning",
    accent: "adm-badge-accent"
  };
  return <span className={`adm-badge ${classes[tone]}`}>{label}</span>;
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
          <span>{trend} vs last month</span>
        </div>
      )}
    </div>
  );
}

const navItems: Array<{ id: AdminTab | null; label: string; icon: React.FC<{ size?: number; className?: string }> }> = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "members", label: "Users", icon: Users },
  { id: "activity", label: "Sessions", icon: Mic2 },
  { id: "content", label: "Blog Posts", icon: FileText },
  { id: "billing" as AdminTab, label: "Billing", icon: TrendingUp },
  { id: "institutions" as AdminTab, label: "Institutions", icon: Building2 },
  { id: "referrals", label: "Referrals", icon: Tag },
  { id: "system", label: "System", icon: Settings }
];

const tabTitles: Record<AdminTab, string> = {
  overview: "Dashboard",
  members: "Users",
  billing: "Billing Events",
  institutions: "Institutions",
  content: "Blog Posts",
  referrals: "Referrals",
  activity: "Sessions",
  system: "System Status"
};

export function AdminPanel(props: {
  sessionLabel: string;
  overview: AdminOverview;
  members: AdminMemberRecord[];
  billingEvents: Array<{
    id: string;
    event_name: string;
    user_email: string | null;
    plan: string;
    billing_status: string;
    created_at: string;
  }>;
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
      setError(data.error ?? "Could not create referral code.");
      return;
    }
    setMessage("Referral code created.");
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
      setMemberError(data.error ?? "Could not update member.");
      return;
    }
    setMemberMessage("Member access updated.");
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
      setContentError(data.error ?? "Could not create post.");
      return;
    }
    setContentMessage("Custom blog post saved.");
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
      setContentError(data.error ?? "Could not update post status.");
      return;
    }
    setContentMessage(status === "published" ? "Post published." : "Post moved to draft.");
    router.refresh();
  };

  return (
    <div className={`adm-shell${sidebarCollapsed ? " adm-collapsed" : ""}`}>
      {/* ── Sidebar ─────────────────────────────── */}
      <aside className="adm-sidebar">
        <div className="adm-brand">
          <div className="adm-brand-icon">
            <Mic2 size={18} color="#a78bfa" />
          </div>
          {!sidebarCollapsed && <span className="adm-brand-name">SpeakAce</span>}
        </div>

        <nav className="adm-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeTab;
            return (
              <button
                key={item.label}
                type="button"
                className={`adm-nav-item${isActive ? " is-active" : ""}${item.id === null ? " adm-nav-disabled" : ""}`}
                onClick={() => item.id && setActiveTab(item.id)}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon size={18} className="adm-nav-icon-svg" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="adm-sidebar-foot">
          <Link href="/" className="adm-back-link" title="Back to Site">
            <ExternalLink size={15} />
            {!sidebarCollapsed && <span>Back to Site</span>}
          </Link>
          <button
            type="button"
            className="adm-collapse-btn"
            onClick={() => setSidebarCollapsed((v) => !v)}
            title={sidebarCollapsed ? "Expand" : "Collapse"}
          >
            <ChevronLeft size={15} className={sidebarCollapsed ? "adm-icon-rotated" : ""} />
            {!sidebarCollapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────── */}
      <div className="adm-main">
        {/* Header */}
        <header className="adm-header">
          <h1 className="adm-page-title">{tabTitles[activeTab]}</h1>
          <div className="adm-header-right">
            <div className="adm-search-wrap">
              <Search size={15} className="adm-search-icon" />
              <input className="adm-search-input" placeholder="Search..." />
            </div>
            <button type="button" className="adm-header-icon-btn" onClick={logout} title="Sign out">
              <Bell size={18} />
            </button>
            <div className="adm-user-avatar" title={props.sessionLabel}>
              SA
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="adm-content">

          {/* ── OVERVIEW TAB ─────────────────────── */}
          {activeTab === "overview" && (
            <>
              {/* Stat Cards */}
              <div className="adm-stats-row">
                <AdmStatCard
                  label="Total Users"
                  value={props.overview.totalUsers}
                  trend="+12.5%"
                  trendUp={true}
                  iconBg="rgba(96,165,250,0.15)"
                  icon={<Users size={20} color="#60a5fa" />}
                />
                <AdmStatCard
                  label="Total Sessions"
                  value={props.overview.activeSessions}
                  trend="+8.2%"
                  trendUp={true}
                  iconBg="rgba(52,211,153,0.15)"
                  icon={<Mic2 size={20} color="#34d399" />}
                />
                <AdmStatCard
                  label="Blog Posts"
                  value={props.customPosts.length}
                  trend="+4.1%"
                  trendUp={true}
                  iconBg="rgba(129,140,248,0.15)"
                  icon={<FileText size={20} color="#818cf8" />}
                />
                <AdmStatCard
                  label="Monthly Revenue"
                  value={formatMoney(props.overview.monthlyRevenueEstimate)}
                  trend="+5.3%"
                  trendUp={true}
                  iconBg="rgba(52,211,153,0.15)"
                  icon={<TrendingUp size={20} color="#34d399" />}
                />
              </div>

              {/* Tables Row */}
              <div className="adm-tables-row">
                {/* Recent Users */}
                <div className="adm-table-card">
                  <div className="adm-table-card-head">
                    <h3>Recent Users</h3>
                    <button type="button" className="adm-view-all-btn" onClick={() => setActiveTab("members")}>
                      View all <ArrowUpRight size={13} />
                    </button>
                  </div>
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th>NAME ↕</th>
                        <th>ROLE ↕</th>
                        <th>PLAN ↕</th>
                        <th>JOINED ↕</th>
                      </tr>
                    </thead>
                    <tbody>
                      {props.members.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="adm-table-empty">No users yet</td>
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
                    <h3>Recent Sessions</h3>
                    <button type="button" className="adm-view-all-btn" onClick={() => setActiveTab("activity")}>
                      View all <ArrowUpRight size={13} />
                    </button>
                  </div>
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th>USER ↕</th>
                        <th>TYPE ↕</th>
                        <th>EVENT ↕</th>
                        <th>DATE ↕</th>
                      </tr>
                    </thead>
                    <tbody>
                      {props.authActivity.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="adm-table-empty">No sessions yet</td>
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

              {/* Metric Cards */}
              <div className="adm-metrics-row">
                <div className="adm-metric-card">
                  <div className="adm-metric-icon" style={{ background: "rgba(52,211,153,0.12)" }}>
                    <UserCheck size={22} color="#34d399" />
                  </div>
                  <div>
                    <div className="adm-metric-value">89%</div>
                    <div className="adm-metric-label">User satisfaction</div>
                  </div>
                </div>
                <div className="adm-metric-card">
                  <div className="adm-metric-icon" style={{ background: "rgba(251,191,36,0.12)" }}>
                    <Clock size={22} color="#fbbf24" />
                  </div>
                  <div>
                    <div className="adm-metric-value">12m</div>
                    <div className="adm-metric-label">Avg. session time</div>
                  </div>
                </div>
                <div className="adm-metric-card">
                  <div className="adm-metric-icon" style={{ background: "rgba(167,139,250,0.12)" }}>
                    <Target size={22} color="#a78bfa" />
                  </div>
                  <div>
                    <div className="adm-metric-value">7.2</div>
                    <div className="adm-metric-label">Avg. band score</div>
                  </div>
                </div>
              </div>

              {/* Activity + Revenue */}
              <div className="adm-grid-2">
                <div className="adm-panel-card">
                  <div className="adm-panel-card-head">
                    <h3>Live Activity</h3>
                  </div>
                  <div className="adm-overview-list">
                    <div className="adm-overview-item">
                      <strong>{props.overview.liveUsers5m}</strong>
                      <span>Active users in the last 5 minutes</span>
                    </div>
                    <div className="adm-overview-item">
                      <strong>{props.overview.recentSignIns24h}</strong>
                      <span>Sign-ins in the last 24 hours</span>
                    </div>
                    <div className="adm-overview-item">
                      <strong>{props.overview.requests5m}</strong>
                      <span>Requests in last 5 min · {formatRelativeDate(props.overview.lastRequestAt)}</span>
                    </div>
                    <div className="adm-overview-item">
                      <strong>{props.overview.pageViews1h}</strong>
                      <span>Page views in the last hour</span>
                    </div>
                    <div className="adm-overview-item">
                      <strong>{props.overview.classesCount}</strong>
                      <span>Active teacher classes</span>
                    </div>
                    <div className="adm-overview-item">
                      <strong>{props.customPosts.filter((p) => p.status === "published").length}</strong>
                      <span>Published custom blog posts</span>
                    </div>
                  </div>
                </div>

                <div className="adm-panel-card">
                  <div className="adm-panel-card-head">
                    <h3>Recent Billing</h3>
                  </div>
                  <div className="adm-stack-list">
                    {props.billingEvents.length === 0 ? (
                      <p className="adm-muted">No billing events yet.</p>
                    ) : (
                      props.billingEvents.slice(0, 6).map((event) => (
                        <div key={event.id} className="adm-list-row">
                          <div>
                            <div className="adm-table-name">{event.event_name}</div>
                            <div className="adm-table-email">{event.user_email ?? "Unknown"}</div>
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
                    <span className="adm-muted">Weekly estimate</span>
                    <strong>{formatMoney(props.overview.monthlyRevenueEstimate)}</strong>
                  </div>
                </div>
              </div>

              <div className="adm-grid-2">
                <div className="adm-panel-card">
                  <div className="adm-panel-card-head">
                    <h3>CTA Performance</h3>
                    <p>Homepage and pricing clicks, signups, and paid conversions across the last 7 and 30 days.</p>
                  </div>
                  <div className="adm-overview-list">
                    <div className="adm-overview-item">
                      <strong>{props.overview.ctaClicks7d}</strong>
                      <span>All CTA clicks in the last 7 days</span>
                    </div>
                    <div className="adm-overview-item">
                      <strong>{props.overview.ctaClicks30d}</strong>
                      <span>All CTA clicks in the last 30 days</span>
                    </div>
                    <div className="adm-overview-item">
                      <strong>{props.overview.checkoutClicks7d}</strong>
                      <span>Checkout CTA clicks in the last 7 days</span>
                    </div>
                    <div className="adm-overview-item">
                      <strong>{props.overview.checkoutClicks30d}</strong>
                      <span>Checkout CTA clicks in the last 30 days</span>
                    </div>
                    <div className="adm-overview-item">
                      <strong>{props.overview.funnel7d.signupCount}</strong>
                      <span>New signups in the last 7 days</span>
                    </div>
                    <div className="adm-overview-item">
                      <strong>{props.overview.funnel30d.signupCount}</strong>
                      <span>New signups in the last 30 days</span>
                    </div>
                  </div>
                </div>

                <div className="adm-panel-card">
                  <div className="adm-panel-card-head">
                    <h3>Practice Feature Usage</h3>
                    <p>Tracks whether the new interview flow and PDF export are actually being used after release.</p>
                  </div>
                  <div className="adm-overview-list">
                    <div className="adm-overview-item">
                      <strong>{props.overview.interviewStarts7d}</strong>
                      <span>Interview mode starts in the last 7 days</span>
                    </div>
                    <div className="adm-overview-item">
                      <strong>{props.overview.interviewStarts30d}</strong>
                      <span>Interview mode starts in the last 30 days</span>
                    </div>
                    <div className="adm-overview-item">
                      <strong>{props.overview.interviewFollowUps7d}</strong>
                      <span>Interview follow-up selections in the last 7 days</span>
                    </div>
                    <div className="adm-overview-item">
                      <strong>{props.overview.interviewFollowUps30d}</strong>
                      <span>Interview follow-up selections in the last 30 days</span>
                    </div>
                    <div className="adm-overview-item">
                      <strong>{props.overview.pdfExports7d}</strong>
                      <span>PDF report exports in the last 7 days</span>
                    </div>
                    <div className="adm-overview-item">
                      <strong>{props.overview.pdfExports30d}</strong>
                      <span>PDF report exports in the last 30 days</span>
                    </div>
                    <div className="adm-overview-item">
                      <strong>{props.overview.writingStarts7d}</strong>
                      <span>Writing starts in the last 7 days</span>
                    </div>
                    <div className="adm-overview-item">
                      <strong>{props.overview.writingEvaluations7d}</strong>
                      <span>Writing evaluations in the last 7 days</span>
                    </div>
                    <div className="adm-overview-item">
                      <strong>{props.overview.writingStarts30d}</strong>
                      <span>Writing starts in the last 30 days</span>
                    </div>
                    <div className="adm-overview-item">
                      <strong>{props.overview.writingEvaluations30d}</strong>
                      <span>Writing evaluations in the last 30 days</span>
                    </div>
                    <div className="adm-overview-item">
                      <strong>{props.overview.writingRetries7d}</strong>
                      <span>Writing retries in the last 7 days</span>
                    </div>
                    <div className="adm-overview-item">
                      <strong>{props.overview.writingRetries30d}</strong>
                      <span>Writing retries in the last 30 days</span>
                    </div>
                    <div className="adm-overview-item">
                      <strong>{props.overview.writingPdfExports7d}</strong>
                      <span>Writing PDF exports in the last 7 days</span>
                    </div>
                    <div className="adm-overview-item">
                      <strong>{props.overview.writingPdfExports30d}</strong>
                      <span>Writing PDF exports in the last 30 days</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="adm-grid-2">
                <div className="adm-panel-card">
                  <div className="adm-panel-card-head">
                    <h3>Conversion Funnel</h3>
                    <p>Uses CTA clicks, account creation, checkout taps, and successful paid billing events.</p>
                  </div>
                  <div className="adm-overview-list">
                    {[
                      {
                        label: "Click → signup",
                        sevenDayValue: props.overview.funnel7d.clickToSignupRate,
                        thirtyDayValue: props.overview.funnel30d.clickToSignupRate,
                        delta: funnelLift.signupDelta
                      },
                      {
                        label: "Signup → checkout",
                        sevenDayValue: props.overview.funnel7d.signupToCheckoutRate,
                        thirtyDayValue: props.overview.funnel30d.signupToCheckoutRate,
                        delta: funnelLift.checkoutDelta
                      },
                      {
                        label: "Checkout → paid",
                        sevenDayValue: props.overview.funnel7d.checkoutToPaidRate,
                        thirtyDayValue: props.overview.funnel30d.checkoutToPaidRate,
                        delta: props.overview.funnel7d.checkoutToPaidRate - props.overview.funnel30d.checkoutToPaidRate
                      },
                      {
                        label: "Click → paid",
                        sevenDayValue: props.overview.funnel7d.clickToPaidRate,
                        thirtyDayValue: props.overview.funnel30d.clickToPaidRate,
                        delta: funnelLift.clickDelta
                      }
                    ].map((item) => (
                      <div key={item.label} className="adm-overview-item">
                        <strong>{formatPercent(item.sevenDayValue)}</strong>
                        <span>
                          {item.label} in the last 7 days. 30-day baseline: {formatPercent(item.thirtyDayValue)}.
                        </span>
                        <span className={`adm-stat-trend ${item.delta >= 0 ? "is-up" : "is-down"}`} style={{ width: "fit-content" }}>
                          {item.delta >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                          {formatPercent(Math.abs(item.delta))} vs 30-day average
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="adm-panel-card">
                  <div className="adm-panel-card-head">
                    <h3>Writing Conversion Funnel</h3>
                    <p>Shows whether learners finish evaluation, retry, and export after entering the writing flow.</p>
                  </div>
                  <div className="adm-overview-list">
                    <div className="adm-overview-item">
                      <strong>{props.overview.writingStarts7d}</strong>
                      <span>Writing starts in the last 7 days. 30-day baseline: {props.overview.writingStarts30d}.</span>
                    </div>
                    <div className="adm-overview-item">
                      <strong>{formatPercent(writingFunnel.startToEval7d)}</strong>
                      <span>Start → evaluated in the last 7 days. 30-day baseline: {formatPercent(writingFunnel.startToEval30d)}.</span>
                      <span className={`adm-stat-trend ${writingFunnel.startToEval7d - writingFunnel.startToEval30d >= 0 ? "is-up" : "is-down"}`} style={{ width: "fit-content" }}>
                        {writingFunnel.startToEval7d - writingFunnel.startToEval30d >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                        {formatPercent(Math.abs(writingFunnel.startToEval7d - writingFunnel.startToEval30d))} vs 30-day average
                      </span>
                    </div>
                    <div className="adm-overview-item">
                      <strong>{formatPercent(writingFunnel.evalToRetry7d)}</strong>
                      <span>Evaluated → retry in the last 7 days. 30-day baseline: {formatPercent(writingFunnel.evalToRetry30d)}.</span>
                      <span className={`adm-stat-trend ${writingFunnel.evalToRetry7d - writingFunnel.evalToRetry30d >= 0 ? "is-up" : "is-down"}`} style={{ width: "fit-content" }}>
                        {writingFunnel.evalToRetry7d - writingFunnel.evalToRetry30d >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                        {formatPercent(Math.abs(writingFunnel.evalToRetry7d - writingFunnel.evalToRetry30d))} vs 30-day average
                      </span>
                    </div>
                    <div className="adm-overview-item">
                      <strong>{formatPercent(writingFunnel.evalToPdf7d)}</strong>
                      <span>Evaluated → PDF export in the last 7 days. 30-day baseline: {formatPercent(writingFunnel.evalToPdf30d)}.</span>
                      <span className={`adm-stat-trend ${writingFunnel.evalToPdf7d - writingFunnel.evalToPdf30d >= 0 ? "is-up" : "is-down"}`} style={{ width: "fit-content" }}>
                        {writingFunnel.evalToPdf7d - writingFunnel.evalToPdf30d >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                        {formatPercent(Math.abs(writingFunnel.evalToPdf7d - writingFunnel.evalToPdf30d))} vs 30-day average
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="adm-grid-2">
                <div className="adm-panel-card">
                  <div className="adm-panel-card-head">
                    <h3>CTA Trend</h3>
                    <p>14-day view of click volume, signups, checkout intent, and paid conversions.</p>
                  </div>
                  <div style={{ display: "grid", gap: "0.85rem" }}>
                    {props.overview.ctaTrend14d.map((item) => (
                      <div key={item.date} style={{ display: "grid", gap: "0.45rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", fontSize: "0.82rem" }}>
                          <strong>{item.date.slice(5)}</strong>
                          <span className="adm-muted">
                            {item.ctaClicks} clicks · {item.signupCount} signups · {item.checkoutClicks} checkout · {item.paidCount} paid
                          </span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "0.45rem" }}>
                          {[
                            { label: "Clicks", value: item.ctaClicks, color: "var(--primary)" },
                            { label: "Signups", value: item.signupCount, color: "var(--accent)" },
                            { label: "Checkout", value: item.checkoutClicks, color: "#f59e0b" },
                            { label: "Paid", value: item.paidCount, color: "#22c55e" }
                          ].map((series) => (
                            <div key={series.label} style={{ display: "grid", gap: "0.35rem" }}>
                              <div style={{ height: 8, borderRadius: 999, background: "var(--surface-strong)", overflow: "hidden" }}>
                                <div
                                  style={{
                                    width: `${Math.max((series.value / trendMax) * 100, series.value > 0 ? 8 : 0)}%`,
                                    height: "100%",
                                    borderRadius: 999,
                                    background: series.color
                                  }}
                                />
                              </div>
                              <span className="adm-muted" style={{ fontSize: "0.75rem" }}>
                                {series.label}: {series.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="adm-panel-card">
                  <div className="adm-panel-card-head">
                    <h3>Top CTA Pages</h3>
                    <p>Which page groups create the most CTA pressure and checkout intent in the last 30 days.</p>
                  </div>
                  <div className="adm-stack-list">
                    {props.overview.topCtaPages.length === 0 ? (
                      <p className="adm-muted">No CTA clicks recorded yet.</p>
                    ) : (
                      props.overview.topCtaPages.map((item) => (
                        <div key={item.page} className="adm-list-row" style={{ alignItems: "stretch" }}>
                          <div style={{ flex: 1, display: "grid", gap: "0.45rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem" }}>
                              <div className="adm-table-name">{item.page}</div>
                              <strong>{item.clicks}</strong>
                            </div>
                            <div style={{ height: 8, borderRadius: 999, background: "var(--surface-strong)", overflow: "hidden" }}>
                              <div
                                style={{
                                  width: `${Math.max((item.clicks / topPageMax) * 100, item.clicks > 0 ? 8 : 0)}%`,
                                  height: "100%",
                                  borderRadius: 999,
                                  background: "linear-gradient(90deg, var(--primary), var(--accent))"
                                }}
                              />
                            </div>
                            <div className="adm-table-email">{item.checkoutClicks} checkout clicks from this page group</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="adm-grid-2">
                <div className="adm-panel-card">
                  <div className="adm-panel-card-head">
                    <h3>Winner CTA This Week</h3>
                    <p>The CTA currently creating the strongest paid conversion outcome over the last 7 days.</p>
                  </div>
                  {props.overview.winnerCta7d ? (
                    <div className="adm-overview-list">
                      <div className="adm-overview-item">
                        <strong>{formatCtaLabel(props.overview.winnerCta7d.path)}</strong>
                        <span>{props.overview.winnerCta7d.path}</span>
                      </div>
                      <div className="adm-overview-item">
                        <strong>{props.overview.winnerCta7d.paidCount}</strong>
                        <span>Paid conversions this week</span>
                      </div>
                      <div className="adm-overview-item">
                        <strong>{formatPercent(props.overview.winnerCta7d.clickToPaidRate)}</strong>
                        <span>Click → paid conversion rate</span>
                      </div>
                      <div className="adm-overview-item">
                        <strong>{props.overview.winnerCta7d.signups}</strong>
                        <span>Attributed signups this week</span>
                      </div>
                    </div>
                  ) : (
                    <p className="adm-muted">Not enough attributed data yet for a weekly winner.</p>
                  )}
                </div>

                <div className="adm-panel-card">
                  <div className="adm-panel-card-head">
                    <h3>Best Converting CTAs</h3>
                    <p>CTA paths ranked by actual signups and paid conversions attributed over the last 30 days.</p>
                  </div>
                  <div className="adm-stack-list">
                    {props.overview.bestPerformingCtas.length === 0 ? (
                      <p className="adm-muted">Attribution data will appear as new signups and checkouts come in.</p>
                    ) : (
                      props.overview.bestPerformingCtas.map((item) => (
                        <div key={item.path} className="adm-list-row" style={{ alignItems: "stretch" }}>
                          <div style={{ flex: 1, display: "grid", gap: "0.35rem" }}>
                            <div className="adm-table-name">{formatCtaLabel(item.path)}</div>
                            <div className="adm-table-email">{item.path}</div>
                            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                              <StatusBadge label={`${item.clicks} clicks`} />
                              <StatusBadge label={`${item.signups} signups`} tone="success" />
                              <StatusBadge label={`${item.paidCount} paid`} tone="accent" />
                            </div>
                          </div>
                          <div className="adm-list-side" style={{ alignItems: "flex-end" }}>
                            <strong>{formatPercent(item.clickToPaidRate)}</strong>
                            <span className="adm-table-muted">click → paid</span>
                            <span className="adm-table-muted">{formatPercent(item.clickToSignupRate)} click → signup</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="adm-panel-card">
                  <div className="adm-panel-card-head">
                    <h3>Top CTAs</h3>
                    <p>Most-clicked CTA paths from homepage and pricing in the last 30 days.</p>
                  </div>
                  <div className="adm-stack-list">
                    {props.overview.topCtas.length === 0 ? (
                      <p className="adm-muted">No CTA clicks recorded yet.</p>
                    ) : (
                      props.overview.topCtas.map((item) => (
                        <div key={`${item.event}-${item.path}`} className="adm-list-row">
                          <div>
                            <div className="adm-table-name">{formatCtaLabel(item.path)}</div>
                            <div className="adm-table-email">{item.path}</div>
                          </div>
                          <div className="adm-list-side">
                            <StatusBadge
                              label={item.event.replaceAll("_", " ")}
                              tone={item.event === "checkout_cta_click" ? "accent" : "neutral"}
                            />
                            <strong>{item.count}</strong>
                          </div>
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
                  <h3>Member Roster</h3>
                  <p className="adm-muted">Manage plans, billing status, and trial access. Passwords are never shown.</p>
                </div>
                <div className="adm-inline-feedback">
                  <span className="adm-muted">{filteredMembers.length} members</span>
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
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, email, org, referral..."
                  />
                </div>
                <select value={memberTypeFilter} onChange={(e) => setMemberTypeFilter(e.target.value)} className="adm-select">
                  <option value="all">All types</option>
                  <option value="student">Students</option>
                  <option value="teacher">Teachers</option>
                  <option value="school">Schools</option>
                </select>
                <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} className="adm-select">
                  <option value="all">All plans</option>
                  <option value="free">Free</option>
                  <option value="plus">Plus</option>
                  <option value="pro">Pro</option>
                </select>
                <select value={billingFilter} onChange={(e) => setBillingFilter(e.target.value)} className="adm-select">
                  <option value="all">All billing</option>
                  <option value="free">Free</option>
                  <option value="active">Active</option>
                  <option value="on_trial">On trial</option>
                  <option value="paused">Paused</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="past_due">Past due</option>
                  <option value="expired">Expired</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              <div className="adm-member-list">
                {filteredMembers.length === 0 ? (
                  <div className="adm-table-empty" style={{ padding: "3rem", textAlign: "center" }}>No members match the filters.</div>
                ) : (
                  filteredMembers.map((member) => (
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
                            <StatusBadge label={member.plan} tone={member.plan === "plus" || member.plan === "pro" ? "accent" : "neutral"} />
                            <StatusBadge
                              label={member.billingStatus}
                              tone={member.billingStatus === "active" || member.billingStatus === "on_trial" ? "success" : "warning"}
                            />
                          </div>
                        </div>

                        <div className="adm-member-metrics">
                          {[
                            { label: "Weekly value", value: formatMoney(member.monthlyValue) },
                            { label: "Sessions", value: member.totalPracticeSessions },
                            { label: "Avg score", value: member.averageScore ?? "—" },
                            { label: "Teacher notes", value: member.teacherNoteCount },
                            { label: "Last sign in", value: formatDate(member.lastSignInAt) },
                            { label: "Last sign out", value: formatDate(member.lastSignOutAt) }
                          ].map(({ label, value }) => (
                            <div key={label} className="adm-metric-cell">
                              <span className="adm-muted">{label}</span>
                              <strong>{value}</strong>
                            </div>
                          ))}
                        </div>

                        {(member.referralCodeUsed || member.trialEndsAt) && (
                          <div className="adm-member-foot">
                            {member.referralCodeUsed && <span className="adm-muted">Referral: <strong>{member.referralCodeUsed}</strong></span>}
                            {member.trialEndsAt && <span className="adm-muted">Trial ends: <strong>{formatDate(member.trialEndsAt)}</strong></span>}
                            <span className="adm-muted">Password: <strong>{member.passwordStatus === "protected" ? "Protected" : "None"}</strong></span>
                          </div>
                        )}
                      </div>

                      <div className="adm-member-actions">
                        <select
                          value={memberDrafts[member.id]?.plan ?? member.plan}
                          onChange={(e) => updateMemberDraft(member.id, { plan: e.target.value })}
                          className="adm-select"
                        >
                          <option value="free">Free</option>
                          <option value="plus">Plus</option>
                          <option value="pro">Pro</option>
                        </select>
                        <select
                          value={memberDrafts[member.id]?.billingStatus ?? member.billingStatus}
                          onChange={(e) => updateMemberDraft(member.id, { billingStatus: e.target.value })}
                          className="adm-select"
                        >
                          <option value="free">Free</option>
                          <option value="active">Active</option>
                          <option value="on_trial">On trial</option>
                          <option value="paused">Paused</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="past_due">Past due</option>
                          <option value="expired">Expired</option>
                          <option value="refunded">Refunded</option>
                        </select>
                        <input
                          value={memberDrafts[member.id]?.trialDays ?? "7"}
                          onChange={(e) => updateMemberDraft(member.id, { trialDays: e.target.value })}
                          placeholder="Trial days"
                          className="adm-input"
                        />
                        <button
                          className="adm-save-btn"
                          type="button"
                          disabled={memberBusyId === member.id}
                          onClick={() => saveMember(member.id)}
                        >
                          {memberBusyId === member.id ? "Saving..." : "Save access"}
                        </button>
                      </div>

                      {member.emailLog && member.emailLog.length > 0 && (
                        <div className="adm-email-log">
                          <p className="adm-muted" style={{ marginBottom: "0.5rem", fontWeight: 600 }}>Email history</p>
                          <table style={{ width: "100%", fontSize: "0.8rem", borderCollapse: "collapse" }}>
                            <thead>
                              <tr style={{ textAlign: "left", color: "#888" }}>
                                <th style={{ padding: "4px 8px" }}>Template</th>
                                <th style={{ padding: "4px 8px" }}>Subject</th>
                                <th style={{ padding: "4px 8px" }}>Status</th>
                                <th style={{ padding: "4px 8px" }}>Sent</th>
                              </tr>
                            </thead>
                            <tbody>
                              {member.emailLog.map((log) => {
                                const templateLabels: Record<string, string> = {
                                  onboarding_1: "Welcome",
                                  onboarding_2: "Day 2 tip",
                                  onboarding_3: "Week 1 checklist",
                                  onboarding_4: "1-week milestone",
                                  onboarding_5: "Daily practice"
                                };
                                const templateLabel = templateLabels[log.template] ?? log.template;
                                return (
                                  <tr key={log.id} style={{ borderTop: "1px solid #f0ece8" }}>
                                    <td style={{ padding: "4px 8px" }}>{templateLabel}</td>
                                    <td style={{ padding: "4px 8px", color: "#555" }}>{log.subject}</td>
                                    <td style={{ padding: "4px 8px" }}>
                                      <span style={{
                                        padding: "2px 8px",
                                        borderRadius: "999px",
                                        fontSize: "0.75rem",
                                        fontWeight: 600,
                                        background: log.status === "sent" ? "#d1fae5" : "#fee2e2",
                                        color: log.status === "sent" ? "#065f46" : "#991b1b"
                                      }}>
                                        {log.status === "sent" ? "Sent" : "Failed"}
                                      </span>
                                    </td>
                                    <td style={{ padding: "4px 8px", color: "#888" }}>{formatDate(log.sentAt)}</td>
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
            </div>
          )}

          {/* ── CONTENT TAB ──────────────────────── */}
          {activeTab === "content" && (
            <div className="adm-grid-2">
              <div className="adm-panel-card">
                <div className="adm-panel-card-head">
                  <div>
                    <h3>Add Custom Blog Post</h3>
                    <p className="adm-muted">Published posts appear in the public blog automatically.</p>
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
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                  <input className="adm-input adm-span-2" value={newPost.title} onChange={(e) => setNewPost((c) => ({ ...c, title: e.target.value }))} placeholder="Post title" />
                  <input className="adm-input" value={newPost.slug} onChange={(e) => setNewPost((c) => ({ ...c, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))} placeholder="post-slug" />
                  <input className="adm-input adm-span-2" value={newPost.description} onChange={(e) => setNewPost((c) => ({ ...c, description: e.target.value }))} placeholder="Meta description" />
                  <input className="adm-input adm-span-2" value={newPost.keywords} onChange={(e) => setNewPost((c) => ({ ...c, keywords: e.target.value }))} placeholder="Keywords, separated by commas" />
                  <textarea className="adm-textarea adm-span-2" value={newPost.intro} onChange={(e) => setNewPost((c) => ({ ...c, intro: e.target.value }))} placeholder="Intro paragraph" />
                  <textarea className="adm-textarea adm-span-2 adm-textarea-lg" value={newPost.body} onChange={(e) => setNewPost((c) => ({ ...c, body: e.target.value }))} placeholder="Use ## headings and paragraphs" />
                </div>

                <div className="adm-inline-feedback" style={{ marginTop: "1rem" }}>
                  <button className="adm-save-btn" type="button" disabled={contentBusy} onClick={createPost}>
                    {contentBusy ? "Saving..." : "Save custom post"}
                  </button>
                  <a className="adm-secondary-btn" href="/blog" target="_blank" rel="noreferrer">
                    Open blog <ExternalLink size={13} />
                  </a>
                </div>
              </div>

              <div className="adm-panel-card">
                <div className="adm-panel-card-head">
                  <h3>Published Posts</h3>
                </div>
                <div className="adm-stack-list">
                  {props.customPosts.length === 0 ? (
                    <p className="adm-muted">No custom posts yet.</p>
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
                            {contentBusyId === post.id ? "Saving..." : post.status === "published" ? "→ Draft" : "Publish"}
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
                    <h3>Create Referral Code</h3>
                    <p className="adm-muted">Share codes to open trial access automatically.</p>
                  </div>
                </div>

                <div className="adm-stats-row adm-stats-sm">
                  <div className="adm-mini-stat">
                    <strong>{referralOverview.totalCodes}</strong>
                    <span>Total codes</span>
                  </div>
                  <div className="adm-mini-stat">
                    <strong>{referralOverview.activeCodes}</strong>
                    <span>Active</span>
                  </div>
                  <div className="adm-mini-stat">
                    <strong>{referralOverview.totalUses}</strong>
                    <span>Total uses</span>
                  </div>
                  <div className="adm-mini-stat">
                    <strong>{referralOverview.remainingSeats}</strong>
                    <span>Remaining seats</span>
                  </div>
                </div>

                <div className="adm-form-grid adm-form-grid-2">
                  <input className="adm-input" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="CODE" />
                  <input className="adm-input" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label" />
                  <input className="adm-input" value={trialDays} onChange={(e) => setTrialDays(e.target.value)} placeholder="Trial days" />
                  <input className="adm-input" value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} placeholder="Usage limit (optional)" />
                </div>

                <div className="adm-inline-feedback" style={{ marginTop: "1rem" }}>
                  <button className="adm-save-btn" type="button" disabled={busy} onClick={createCode}>
                    {busy ? "Creating..." : "Create referral code"}
                  </button>
                  {message && <span className="adm-success">{message}</span>}
                  {error && <span className="adm-error">{error}</span>}
                </div>
              </div>

              <div className="adm-panel-card">
                <div className="adm-panel-card-head">
                  <h3>Existing Codes</h3>
                </div>
                <div className="adm-stack-list">
                  {props.referralCodes.length === 0 ? (
                    <p className="adm-muted">No referral codes yet.</p>
                  ) : (
                    props.referralCodes.map((item) => (
                      <div key={item.id} className="adm-list-row">
                        <div>
                          <div className="adm-table-name" style={{ fontFamily: "monospace" }}>{item.code}</div>
                          <div className="adm-table-email">{item.label || "No label"}</div>
                        </div>
                        <div className="adm-list-side">
                          <StatusBadge label={`${item.trialDays}d`} tone="accent" />
                          <span className="adm-table-email">
                            {item.usageCount}{item.usageLimit ? ` / ${item.usageLimit}` : ""} uses
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
            <div className="adm-table-card" style={{ gridColumn: "1 / -1" }}>
              <div className="adm-table-card-head">
                <h3>Billing Events</h3>
                <span className="adm-badge adm-badge-neutral">{props.billingEvents.length} total</span>
              </div>
              {props.billingEvents.length === 0 ? (
                <p className="adm-table-muted" style={{ padding: "1rem" }}>No billing events yet.</p>
              ) : (
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>EVENT</th>
                      <th>EMAIL</th>
                      <th>PLAN</th>
                      <th>STATUS</th>
                      <th>DATE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {props.billingEvents.map((ev) => (
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
              )}
            </div>
          )}

          {/* ── INSTITUTIONS TAB ─────────────────── */}
          {activeTab === "institutions" && (
            <div className="adm-table-card" style={{ gridColumn: "1 / -1" }}>
              <div className="adm-table-card-head">
                <h3>Institutions</h3>
                <span className="adm-badge adm-badge-neutral">{props.institutions.length} total</span>
              </div>
              {props.institutions.length === 0 ? (
                <p className="adm-table-muted" style={{ padding: "1rem" }}>No institutions yet.</p>
              ) : (
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>ORGANIZATION</th>
                      <th>TEACHERS</th>
                      <th>STUDENTS</th>
                      <th>SCHOOLS</th>
                      <th>AVG SCORE</th>
                      <th>TOTAL SESSIONS</th>
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
                  <h3>Environment</h3>
                </div>
                <div className="adm-overview-list">
                  {[
                    { label: "NODE_ENV", value: process.env.NODE_ENV ?? "—" },
                    { label: "Next.js", value: "15 (App Router)" },
                    { label: "Site URL", value: process.env.NEXT_PUBLIC_SITE_URL ?? "—" },
                    { label: "Vercel env", value: process.env.VERCEL_ENV ?? "local" },
                    { label: "Region", value: process.env.VERCEL_REGION ?? "—" },
                    { label: "Admin session", value: props.sessionLabel }
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
                  <h3>Platform Overview</h3>
                </div>
                <div className="adm-overview-list">
                  {[
                    { label: "Total users", value: String(props.overview.totalUsers) },
                    { label: "Students", value: String(props.overview.totalStudents) },
                    { label: "Teachers", value: String(props.overview.totalTeachers) },
                    { label: "Schools", value: String(props.overview.totalSchools) },
                    { label: "Paid members", value: String(props.overview.paidMembers) },
                    { label: "On trial", value: String(props.overview.trialMembers) },
                    { label: "Active sessions", value: String(props.overview.activeSessions) },
                    { label: "Weekly revenue est.", value: formatMoney(props.overview.monthlyRevenueEstimate) },
                    { label: "Live users (5m)", value: String(props.overview.liveUsers5m) },
                    { label: "Last request", value: formatRelativeDate(props.overview.lastRequestAt) }
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
                  <h3>Quick Actions</h3>
                </div>
                <div className="adm-stack-list">
                  {[
                    { label: "View public site", href: "/" },
                    { label: "Open blog", href: "/blog" },
                    { label: "Pricing page", href: "/pricing" },
                    { label: "Admin login", href: "/admin/login" }
                  ].map(({ label, href }) => (
                    <div key={label} className="adm-list-row">
                      <span className="adm-table-name">{label}</span>
                      <a className="adm-secondary-btn" href={href} target="_blank" rel="noreferrer">
                        Open <ExternalLink size={13} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              <div className="adm-panel-card">
                <div className="adm-panel-card-head">
                  <h3>Data Summary</h3>
                </div>
                <div className="adm-overview-list">
                  {[
                    { label: "Members loaded", value: String(props.members.length) },
                    { label: "Billing events", value: String(props.billingEvents.length) },
                    { label: "Auth activity records", value: String(props.authActivity.length) },
                    { label: "Referral codes", value: String(props.referralCodes.length) },
                    { label: "Institutions", value: String(props.institutions.length) },
                    { label: "Custom blog posts", value: String(props.customPosts.length) },
                    { label: "Published posts", value: String(props.customPosts.filter((p) => p.status === "published").length) }
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
                  <h3>Sign-in / Sign-out Activity</h3>
                </div>
                <div className="adm-stack-list">
                  {props.authActivity.length === 0 ? (
                    <p className="adm-muted">No activity recorded yet.</p>
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
                  <h3>Institutions</h3>
                </div>
                <div className="adm-stack-list">
                  {props.institutions.length === 0 ? (
                    <p className="adm-muted">No institutions recorded.</p>
                  ) : (
                    props.institutions.map((item) => (
                      <div key={item.organizationName} className="adm-list-row">
                        <div>
                          <div className="adm-table-name">{item.organizationName}</div>
                          <div className="adm-table-email">
                            {item.teachers} teachers · {item.students} students · {item.schools} schools
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
