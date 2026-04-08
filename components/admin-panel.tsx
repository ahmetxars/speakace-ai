"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminAuthActivityRecord,
  AdminCustomPostRecord,
  AdminInstitutionRecord,
  AdminMemberRecord,
  AdminOverview,
  ReferralCodeRecord
} from "@/lib/types";

type AdminTab = "overview" | "members" | "content" | "referrals" | "activity";

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("tr-TR");
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
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

function MemberBadge({
  label,
  tone = "neutral"
}: {
  label: string;
  tone?: "neutral" | "success" | "warning" | "accent";
}) {
  return <span className={`admin-pill admin-pill-${tone}`}>{label}</span>;
}

function StatCard({
  label,
  value,
  hint
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="card admin-stat-card">
      <span className="admin-stat-label">{label}</span>
      <strong className="admin-stat-value">{value}</strong>
      {hint ? <span className="admin-stat-hint">{hint}</span> : null}
    </div>
  );
}

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

  const teacherCount = useMemo(
    () => props.members.filter((member) => member.memberType === "teacher").length,
    [props.members]
  );

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

  const tabs: Array<{ id: AdminTab; label: string; count?: number }> = [
    { id: "overview", label: "Overview" },
    { id: "members", label: "Members", count: filteredMembers.length },
    { id: "content", label: "Content", count: props.customPosts.length },
    { id: "referrals", label: "Referrals", count: props.referralCodes.length },
    { id: "activity", label: "Activity", count: props.authActivity.length }
  ];

  const activeTabInfo = tabs.find((tab) => tab.id === activeTab);

  const activeTabCopy = {
    overview: {
      title: "Control the whole product from one place",
      body: "See traffic, memberships, billing momentum, and content health without losing the signal in admin noise."
    },
    members: {
      title: "Members, plans, and access in one clear roster",
      body: "Find any learner quickly, understand their plan and billing state, then update access without scanning a messy table."
    },
    content: {
      title: "Publish and manage content from admin",
      body: "Create custom blog posts, keep drafts moving, and see what is already live from one writing workspace."
    },
    referrals: {
      title: "Create referral offers and trial flows",
      body: "Launch new codes, watch usage, and control how many seats each offer can unlock."
    },
    activity: {
      title: "Watch access patterns and institution usage",
      body: "Track sign-ins, sign-outs, and organization-level usage to see how the product is actually being used."
    }
  } as const;

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
    <main className="page-shell section admin-shell sa-admin-shell">
      <div className="sa-admin-layout">
        <aside className="sa-admin-sidebar">
          <div className="sa-admin-brand">
            <span className="eyebrow">Admin panel</span>
            <h1>SpeakAce control center</h1>
            <p>Members, content, referrals, and live traffic in one calmer workspace.</p>
          </div>

          <nav className="sa-admin-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`sa-admin-nav-item ${activeTab === tab.id ? "is-active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined ? <span className="sa-admin-nav-count">{tab.count}</span> : null}
              </button>
            ))}
          </nav>

          <div className="sa-admin-sidecard">
            <strong>{props.sessionLabel}</strong>
            <span>{props.overview.liveUsers5m} live in the last 5 minutes</span>
            <span>{props.overview.requests5m} requests in the last 5 minutes</span>
            <button className="button button-secondary" type="button" onClick={logout}>
              Sign out
            </button>
          </div>
        </aside>

        <section className="sa-admin-content">
          <section className="card admin-hero sa-admin-topbar">
            <div className="admin-hero-copy">
              <span className="eyebrow">{activeTabInfo?.label ?? "Overview"}</span>
              <h2>{activeTabCopy[activeTab].title}</h2>
              <p>{activeTabCopy[activeTab].body}</p>
            </div>
            <div className="admin-hero-actions">
              <MemberBadge label={`${props.overview.liveUsers5m} live in 5m`} tone="success" />
              <MemberBadge label={`${props.overview.requests5m} requests / 5m`} tone="accent" />
            </div>
          </section>

          {activeTab === "overview" ? (
            <>
              <section className="admin-stats-grid">
                <StatCard label="Total users" value={props.overview.totalUsers} />
                <StatCard label="Students" value={props.overview.totalStudents} />
                <StatCard label="Teachers" value={teacherCount} />
                <StatCard label="Schools" value={props.overview.totalSchools} />
                <StatCard
                  label="Paid / trial"
                  value={`${props.overview.paidMembers} / ${props.overview.trialMembers}`}
                />
                <StatCard
                  label="Weekly value"
                  value={formatMoney(props.overview.monthlyRevenueEstimate)}
                  hint="$3.99 weekly model"
                />
                <StatCard
                  label="Requests (5m)"
                  value={props.overview.requests5m}
                  hint={`Last request ${formatRelativeDate(props.overview.lastRequestAt)}`}
                />
                <StatCard label="Page views (1h)" value={props.overview.pageViews1h} />
              </section>

              <section className="admin-grid-2">
                <div className="card admin-panel-card">
                  <div className="admin-card-head">
                    <div>
                      <span className="eyebrow">Quick read</span>
                      <h2>What matters right now</h2>
                    </div>
                  </div>
                  <div className="admin-overview-list">
                    <div className="admin-overview-item">
                      <strong>{props.overview.liveUsers5m}</strong>
                      <span>Active users in the last 5 minutes</span>
                    </div>
                    <div className="admin-overview-item">
                      <strong>{props.overview.recentSignIns24h}</strong>
                      <span>Sign-ins during the last 24 hours</span>
                    </div>
                    <div className="admin-overview-item">
                      <strong>{props.overview.classesCount}</strong>
                      <span>Teacher classes currently created</span>
                    </div>
                    <div className="admin-overview-item">
                      <strong>{props.customPosts.filter((item) => item.status === "published").length}</strong>
                      <span>Custom blog posts already published</span>
                    </div>
                  </div>
                </div>

                <div className="card admin-panel-card">
                  <div className="admin-card-head">
                    <div>
                      <span className="eyebrow">Recent payments</span>
                      <h2>Latest billing events</h2>
                    </div>
                  </div>
                  <div className="admin-stack-list">
                    {props.billingEvents.slice(0, 6).map((event) => (
                      <div key={event.id} className="admin-list-row">
                        <div>
                          <strong>{event.event_name}</strong>
                          <div className="admin-muted">{event.user_email ?? "Unknown email"}</div>
                        </div>
                        <div className="admin-list-side">
                          <MemberBadge label={event.plan} tone="accent" />
                          <span className="admin-muted">{formatDate(event.created_at)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </>
          ) : null}

          {activeTab === "members" ? (
            <section className="card admin-panel-card">
              <div className="admin-card-head">
                <div>
                  <span className="eyebrow">Member roster</span>
                  <h2>Users, plans, activity, and access controls</h2>
                  <p className="admin-muted">
                    Passwords are never shown. Only safe account status is displayed.
                  </p>
                </div>
                <div className="admin-inline-feedback">
                  <span className="admin-muted">{filteredMembers.length} members shown</span>
                  {memberMessage ? <span className="admin-success">{memberMessage}</span> : null}
                  {memberError ? <span className="admin-error">{memberError}</span> : null}
                </div>
              </div>

              <div className="admin-filter-grid">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search member, email, organization, referral..."
                  className="admin-input"
                />
                <select
                  value={memberTypeFilter}
                  onChange={(event) => setMemberTypeFilter(event.target.value)}
                  className="admin-input"
                >
                  <option value="all">All member types</option>
                  <option value="student">Students</option>
                  <option value="teacher">Teachers</option>
                  <option value="school">Schools</option>
                </select>
                <select
                  value={planFilter}
                  onChange={(event) => setPlanFilter(event.target.value)}
                  className="admin-input"
                >
                  <option value="all">All plans</option>
                  <option value="free">Free</option>
                  <option value="plus">Plus</option>
                  <option value="pro">Pro</option>
                </select>
                <select
                  value={billingFilter}
                  onChange={(event) => setBillingFilter(event.target.value)}
                  className="admin-input"
                >
                  <option value="all">All billing states</option>
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

              <div className="admin-member-list">
                {filteredMembers.map((member) => (
                  <article key={member.id} className="admin-member-card">
                    <div className="admin-member-main">
                      <div className="admin-member-head">
                        <div>
                          <h3>{member.name}</h3>
                          <div className="admin-muted">{member.email}</div>
                          {member.organizationName ? (
                            <div className="admin-muted">{member.organizationName}</div>
                          ) : null}
                        </div>
                        <div className="admin-member-badges">
                          <MemberBadge label={member.memberType} />
                          <MemberBadge
                            label={member.plan}
                            tone={member.plan === "plus" || member.plan === "pro" ? "accent" : "neutral"}
                          />
                          <MemberBadge
                            label={member.billingStatus}
                            tone={
                              member.billingStatus === "active" || member.billingStatus === "on_trial"
                                ? "success"
                                : "warning"
                            }
                          />
                        </div>
                      </div>

                      <div className="admin-member-metrics">
                        <div>
                          <span className="admin-muted">Weekly value</span>
                          <strong>{formatMoney(member.monthlyValue)}</strong>
                        </div>
                        <div>
                          <span className="admin-muted">Sessions</span>
                          <strong>{member.totalPracticeSessions}</strong>
                        </div>
                        <div>
                          <span className="admin-muted">Average score</span>
                          <strong>{member.averageScore ?? "—"}</strong>
                        </div>
                        <div>
                          <span className="admin-muted">Teacher notes</span>
                          <strong>{member.teacherNoteCount}</strong>
                        </div>
                        <div>
                          <span className="admin-muted">Last sign in</span>
                          <strong>{formatDate(member.lastSignInAt)}</strong>
                        </div>
                        <div>
                          <span className="admin-muted">Last sign out</span>
                          <strong>{formatDate(member.lastSignOutAt)}</strong>
                        </div>
                      </div>

                      <div className="admin-member-foot">
                        <span className="admin-muted">Password</span>
                        <strong>
                          {member.passwordStatus === "protected" ? "Protected hash" : "No password"}
                        </strong>
                        {member.referralCodeUsed ? (
                          <span className="admin-muted">Referral: {member.referralCodeUsed}</span>
                        ) : null}
                        {member.trialEndsAt ? (
                          <span className="admin-muted">Trial ends: {formatDate(member.trialEndsAt)}</span>
                        ) : null}
                      </div>
                    </div>

                    <div className="admin-member-actions">
                      <select
                        value={memberDrafts[member.id]?.plan ?? member.plan}
                        onChange={(event) => updateMemberDraft(member.id, { plan: event.target.value })}
                        className="admin-input"
                      >
                        <option value="free">Free</option>
                        <option value="plus">Plus</option>
                        <option value="pro">Pro</option>
                      </select>
                      <select
                        value={memberDrafts[member.id]?.billingStatus ?? member.billingStatus}
                        onChange={(event) =>
                          updateMemberDraft(member.id, { billingStatus: event.target.value })
                        }
                        className="admin-input"
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
                        onChange={(event) => updateMemberDraft(member.id, { trialDays: event.target.value })}
                        placeholder="Trial days"
                        className="admin-input"
                      />
                      <button
                        className="button button-primary"
                        type="button"
                        disabled={memberBusyId === member.id}
                        onClick={() => saveMember(member.id)}
                      >
                        {memberBusyId === member.id ? "Saving..." : "Save access"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {activeTab === "content" ? (
            <div className="admin-grid-2">
              <section className="card admin-panel-card">
                <div className="admin-card-head">
                  <div>
                    <span className="eyebrow">Content studio</span>
                    <h2>Add a custom blog post</h2>
                    <p className="admin-muted">
                      Create extra posts from the admin panel. Published entries appear in the public blog automatically.
                    </p>
                  </div>
                  <div className="admin-inline-feedback">
                    {contentMessage ? <span className="admin-success">{contentMessage}</span> : null}
                    {contentError ? <span className="admin-error">{contentError}</span> : null}
                  </div>
                </div>

                <div className="admin-form-grid">
                  <select
                    className="admin-input"
                    value={newPost.language}
                    onChange={(event) =>
                      setNewPost((current) => ({ ...current, language: event.target.value }))
                    }
                  >
                    <option value="en">English</option>
                    <option value="tr">Türkçe</option>
                    <option value="de">Deutsch</option>
                    <option value="fr">Français</option>
                    <option value="es">Español</option>
                  </select>
                  <select
                    className="admin-input"
                    value={newPost.status}
                    onChange={(event) =>
                      setNewPost((current) => ({ ...current, status: event.target.value }))
                    }
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                  <input
                    className="admin-input admin-input-span"
                    value={newPost.title}
                    onChange={(event) =>
                      setNewPost((current) => ({ ...current, title: event.target.value }))
                    }
                    placeholder="Post title"
                  />
                  <input
                    className="admin-input"
                    value={newPost.slug}
                    onChange={(event) =>
                      setNewPost((current) => ({
                        ...current,
                        slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-")
                      }))
                    }
                    placeholder="post-slug"
                  />
                  <input
                    className="admin-input admin-input-span"
                    value={newPost.description}
                    onChange={(event) =>
                      setNewPost((current) => ({ ...current, description: event.target.value }))
                    }
                    placeholder="Meta description"
                  />
                  <input
                    className="admin-input admin-input-span"
                    value={newPost.keywords}
                    onChange={(event) =>
                      setNewPost((current) => ({ ...current, keywords: event.target.value }))
                    }
                    placeholder="Keywords separated by commas"
                  />
                  <textarea
                    className="admin-textarea admin-input-span"
                    value={newPost.intro}
                    onChange={(event) =>
                      setNewPost((current) => ({ ...current, intro: event.target.value }))
                    }
                    placeholder="Intro paragraph"
                  />
                  <textarea
                    className="admin-textarea admin-input-span"
                    value={newPost.body}
                    onChange={(event) =>
                      setNewPost((current) => ({ ...current, body: event.target.value }))
                    }
                    placeholder="Use ## headings and paragraphs to shape the article"
                    style={{ minHeight: "18rem" }}
                  />
                </div>

                <div className="admin-content-actions">
                  <button className="button button-primary" type="button" disabled={contentBusy} onClick={createPost}>
                    {contentBusy ? "Saving..." : "Save custom post"}
                  </button>
                  <a className="button button-secondary" href="/blog" target="_blank" rel="noreferrer">
                    Open blog
                  </a>
                </div>
              </section>

              <section className="card admin-panel-card">
                <div className="admin-card-head">
                  <div>
                    <span className="eyebrow">Published content</span>
                    <h2>Custom posts already in the system</h2>
                  </div>
                </div>
                <div className="admin-stack-list">
                  {props.customPosts.length ? (
                    props.customPosts.map((post) => (
                      <div key={post.id} className="admin-list-row admin-content-row">
                        <div>
                          <strong>{post.title}</strong>
                          <div className="admin-muted">/{post.slug}</div>
                          <div className="admin-muted">{post.description}</div>
                        </div>
                        <div className="admin-list-side">
                          <MemberBadge label={post.language.toUpperCase()} />
                          <MemberBadge
                            label={post.status}
                            tone={post.status === "published" ? "success" : "warning"}
                          />
                          <button
                            type="button"
                            className="button button-secondary"
                            disabled={contentBusyId === post.id}
                            onClick={() =>
                              updatePostStatus(post.id, post.status === "published" ? "draft" : "published")
                            }
                          >
                            {contentBusyId === post.id
                              ? "Saving..."
                              : post.status === "published"
                                ? "Move to draft"
                                : "Publish"}
                          </button>
                          <a
                            className="button button-secondary"
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open
                          </a>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="admin-muted">No custom posts yet.</p>
                  )}
                </div>
              </section>
            </div>
          ) : null}

          {activeTab === "referrals" ? (
            <div className="admin-grid-2">
              <section className="card admin-panel-card">
                <div className="admin-card-head">
                  <div>
                    <span className="eyebrow">Referral access</span>
                    <h2>Create a 1-week free Plus code</h2>
                    <p className="admin-muted">
                      Share codes with learners or teachers and open trial access automatically.
                    </p>
                  </div>
                </div>
                <div className="admin-stats-grid admin-stats-grid-compact">
                  <StatCard label="Total codes" value={referralOverview.totalCodes} />
                  <StatCard label="Active codes" value={referralOverview.activeCodes} />
                  <StatCard label="Total uses" value={referralOverview.totalUses} />
                  <StatCard label="Remaining seats" value={referralOverview.remainingSeats} />
                </div>
                <div className="admin-form-grid admin-form-grid-compact">
                  <input
                    value={code}
                    onChange={(event) => setCode(event.target.value.toUpperCase())}
                    placeholder="Code"
                    className="admin-input"
                  />
                  <input
                    value={label}
                    onChange={(event) => setLabel(event.target.value)}
                    placeholder="Label"
                    className="admin-input"
                  />
                  <input
                    value={trialDays}
                    onChange={(event) => setTrialDays(event.target.value)}
                    placeholder="Trial days"
                    className="admin-input"
                  />
                  <input
                    value={usageLimit}
                    onChange={(event) => setUsageLimit(event.target.value)}
                    placeholder="Usage limit (optional)"
                    className="admin-input"
                  />
                </div>
                <div className="admin-inline-feedback">
                  <button className="button button-primary" type="button" disabled={busy} onClick={createCode}>
                    {busy ? "Creating..." : "Create referral code"}
                  </button>
                  {message ? <span className="admin-success">{message}</span> : null}
                  {error ? <span className="admin-error">{error}</span> : null}
                </div>
              </section>

              <section className="card admin-panel-card">
                <div className="admin-card-head">
                  <div>
                    <span className="eyebrow">Code list</span>
                    <h2>Existing referral offers</h2>
                  </div>
                </div>
                <div className="admin-stack-list">
                  {props.referralCodes.map((item) => (
                    <div key={item.id} className="admin-list-row">
                      <div>
                        <strong>{item.code}</strong>
                        <div className="admin-muted">{item.label || "No label"}</div>
                      </div>
                      <div className="admin-list-side">
                        <MemberBadge label={`${item.trialDays} days`} />
                        <span className="admin-muted">
                          {item.usageCount}
                          {item.usageLimit ? ` / ${item.usageLimit}` : ""} uses
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          ) : null}

          {activeTab === "activity" ? (
            <div className="admin-grid-2">
              <section className="card admin-panel-card">
                <div className="admin-card-head">
                  <div>
                    <span className="eyebrow">Recent access</span>
                    <h2>Sign-in and sign-out activity</h2>
                  </div>
                </div>
                <div className="admin-stack-list">
                  {props.authActivity.map((item) => (
                    <div key={item.id} className="admin-list-row">
                      <div>
                        <strong>{item.userName}</strong>
                        <div className="admin-muted">{item.userEmail}</div>
                      </div>
                      <div className="admin-list-side">
                        {item.memberType ? <MemberBadge label={item.memberType} /> : null}
                        <MemberBadge
                          label={item.eventType}
                          tone={item.eventType === "signin" ? "success" : "neutral"}
                        />
                        <span className="admin-muted">{formatDate(item.occurredAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="card admin-panel-card">
                <div className="admin-card-head">
                  <div>
                    <span className="eyebrow">Institutions</span>
                    <h2>Teacher / student visibility by organization</h2>
                  </div>
                </div>
                <div className="admin-stack-list">
                  {props.institutions.map((item) => (
                    <div key={item.organizationName} className="admin-list-row">
                      <div>
                        <strong>{item.organizationName}</strong>
                        <div className="admin-muted">
                          {item.teachers} teachers · {item.students} students · {item.schools} schools
                        </div>
                      </div>
                      <div className="admin-list-side">
                        <span className="admin-muted">Avg score {item.averageScore ?? "—"}</span>
                        <span className="admin-muted">{item.totalSessions} sessions</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
