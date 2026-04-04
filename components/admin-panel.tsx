"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminAuthActivityRecord,
  AdminInstitutionRecord,
  AdminMemberRecord,
  AdminOverview,
  ReferralCodeRecord
} from "@/lib/types";

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
}) {
  const router = useRouter();
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
  const [memberDrafts, setMemberDrafts] = useState<Record<string, { plan: string; billingStatus: string; trialDays: string }>>(
    () =>
      Object.fromEntries(
        props.members.map((member) => [
          member.id,
          { plan: member.plan, billingStatus: member.billingStatus, trialDays: "7" }
        ])
      )
  );

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

  const updateMemberDraft = (memberId: string, patch: Partial<{ plan: string; billingStatus: string; trialDays: string }>) => {
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

  return (
    <main className="page-shell section" style={{ display: "grid", gap: "1.25rem" }}>
      <section className="card" style={{ padding: "1.25rem", display: "grid", gap: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "grid", gap: "0.35rem" }}>
            <span className="eyebrow">Admin panel</span>
            <h1 style={{ margin: 0 }}>SpeakAce control center</h1>
            <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.6 }}>
              Welcome, {props.sessionLabel}. This panel shows users, payments, sign-ins, teacher visibility, and referral-based trial access.
            </p>
          </div>
          <button className="button button-secondary" type="button" onClick={logout}>
            Sign out
          </button>
        </div>
        <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))" }}>
          <div className="card" style={{ padding: "1rem" }}>
            <strong>Total users</strong>
            <div style={{ fontSize: "2rem", fontWeight: 800 }}>{props.overview.totalUsers}</div>
          </div>
          <div className="card" style={{ padding: "1rem" }}>
            <strong>Students</strong>
            <div style={{ fontSize: "2rem", fontWeight: 800 }}>{props.overview.totalStudents}</div>
          </div>
          <div className="card" style={{ padding: "1rem" }}>
            <strong>Teachers</strong>
            <div style={{ fontSize: "2rem", fontWeight: 800 }}>{teacherCount}</div>
          </div>
          <div className="card" style={{ padding: "1rem" }}>
            <strong>Schools</strong>
            <div style={{ fontSize: "2rem", fontWeight: 800 }}>{props.overview.totalSchools}</div>
          </div>
          <div className="card" style={{ padding: "1rem" }}>
            <strong>Paid / trial</strong>
            <div style={{ fontSize: "2rem", fontWeight: 800 }}>
              {props.overview.paidMembers} / {props.overview.trialMembers}
            </div>
          </div>
          <div className="card" style={{ padding: "1rem" }}>
            <strong>Monthly value</strong>
            <div style={{ fontSize: "2rem", fontWeight: 800 }}>{formatMoney(props.overview.monthlyRevenueEstimate)}</div>
          </div>
          <div className="card" style={{ padding: "1rem" }}>
            <strong>Live users (5m)</strong>
            <div style={{ fontSize: "2rem", fontWeight: 800 }}>{props.overview.liveUsers5m}</div>
            <div style={{ color: "var(--muted)", marginTop: "0.3rem", fontSize: "0.92rem" }}>
              Distinct users with recent activity
            </div>
          </div>
          <div className="card" style={{ padding: "1rem" }}>
            <strong>Requests (5m)</strong>
            <div style={{ fontSize: "2rem", fontWeight: 800 }}>{props.overview.requests5m}</div>
            <div style={{ color: "var(--muted)", marginTop: "0.3rem", fontSize: "0.92rem" }}>
              Last request: {formatRelativeDate(props.overview.lastRequestAt)}
            </div>
          </div>
          <div className="card" style={{ padding: "1rem" }}>
            <strong>Page views (1h)</strong>
            <div style={{ fontSize: "2rem", fontWeight: 800 }}>{props.overview.pageViews1h}</div>
            <div style={{ color: "var(--muted)", marginTop: "0.3rem", fontSize: "0.92rem" }}>
              Based on tracked page views
            </div>
          </div>
        </div>
      </section>

      <section className="card" style={{ padding: "1.25rem", display: "grid", gap: "1rem" }}>
        <div>
          <span className="eyebrow">Referral access</span>
          <h2 style={{ margin: "0.35rem 0 0.25rem" }}>Create a code for 1-week free Plus</h2>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            Share a code with a student or teacher. When they sign up with it, the account gets trial access automatically.
          </p>
        </div>
        <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))" }}>
          <div className="card" style={{ padding: "1rem" }}>
            <strong>Total codes</strong>
            <div style={{ fontSize: "1.8rem", fontWeight: 800 }}>{referralOverview.totalCodes}</div>
          </div>
          <div className="card" style={{ padding: "1rem" }}>
            <strong>Active codes</strong>
            <div style={{ fontSize: "1.8rem", fontWeight: 800 }}>{referralOverview.activeCodes}</div>
          </div>
          <div className="card" style={{ padding: "1rem" }}>
            <strong>Total uses</strong>
            <div style={{ fontSize: "1.8rem", fontWeight: 800 }}>{referralOverview.totalUses}</div>
          </div>
          <div className="card" style={{ padding: "1rem" }}>
            <strong>Remaining seats</strong>
            <div style={{ fontSize: "1.8rem", fontWeight: 800 }}>{referralOverview.remainingSeats}</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.85rem" }}>
          <input
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="Code"
            style={{ padding: "0.9rem", borderRadius: 14, border: "1px solid var(--line)" }}
          />
          <input
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder="Label"
            style={{ padding: "0.9rem", borderRadius: 14, border: "1px solid var(--line)" }}
          />
          <input
            value={trialDays}
            onChange={(event) => setTrialDays(event.target.value)}
            placeholder="Trial days"
            style={{ padding: "0.9rem", borderRadius: 14, border: "1px solid var(--line)" }}
          />
          <input
            value={usageLimit}
            onChange={(event) => setUsageLimit(event.target.value)}
            placeholder="Usage limit (optional)"
            style={{ padding: "0.9rem", borderRadius: 14, border: "1px solid var(--line)" }}
          />
        </div>
        <div style={{ display: "flex", gap: "0.8rem", alignItems: "center", flexWrap: "wrap" }}>
          <button className="button button-primary" type="button" disabled={busy} onClick={createCode}>
            {busy ? "Creating..." : "Create referral code"}
          </button>
          {message ? <span style={{ color: "var(--success)" }}>{message}</span> : null}
          {error ? <span style={{ color: "var(--accent-deep)" }}>{error}</span> : null}
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th align="left">Code</th>
                <th align="left">Label</th>
                <th align="left">Trial</th>
                <th align="left">Uses</th>
                <th align="left">Active</th>
                <th align="left">Created</th>
              </tr>
            </thead>
            <tbody>
              {props.referralCodes.map((item) => (
                <tr key={item.id}>
                  <td>{item.code}</td>
                  <td>{item.label || "—"}</td>
                  <td>{item.trialDays} days</td>
                  <td>
                    {item.usageCount}
                    {item.usageLimit ? ` / ${item.usageLimit}` : ""}
                  </td>
                  <td>{item.active ? "Active" : "Inactive"}</td>
                  <td>{formatDate(item.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" style={{ padding: "1.25rem", display: "grid", gap: "1rem" }}>
        <div>
          <span className="eyebrow">Member roster</span>
          <h2 style={{ margin: "0.35rem 0 0.25rem" }}>Users, plans, activity, and security status</h2>
          <p style={{ margin: 0, color: "var(--muted)" }}>
            Passwords are intentionally not shown. They are stored as protected hashes. This panel shows safe account status instead.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr repeat(3, minmax(140px, 1fr))", gap: "0.85rem" }}>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search member, email, organization, referral..."
            style={{ padding: "0.9rem", borderRadius: 14, border: "1px solid var(--line)" }}
          />
          <select
            value={memberTypeFilter}
            onChange={(event) => setMemberTypeFilter(event.target.value)}
            style={{ padding: "0.9rem", borderRadius: 14, border: "1px solid var(--line)" }}
          >
            <option value="all">All member types</option>
            <option value="student">Students</option>
            <option value="teacher">Teachers</option>
            <option value="school">Schools</option>
          </select>
          <select
            value={planFilter}
            onChange={(event) => setPlanFilter(event.target.value)}
            style={{ padding: "0.9rem", borderRadius: 14, border: "1px solid var(--line)" }}
          >
            <option value="all">All plans</option>
            <option value="free">Free</option>
            <option value="plus">Plus</option>
            <option value="pro">Pro</option>
          </select>
          <select
            value={billingFilter}
            onChange={(event) => setBillingFilter(event.target.value)}
            style={{ padding: "0.9rem", borderRadius: 14, border: "1px solid var(--line)" }}
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
        <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ color: "var(--muted)" }}>{filteredMembers.length} members shown</span>
          {memberMessage ? <span style={{ color: "var(--success)" }}>{memberMessage}</span> : null}
          {memberError ? <span style={{ color: "var(--accent-deep)" }}>{memberError}</span> : null}
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th align="left">Member</th>
                <th align="left">Type</th>
                <th align="left">Plan</th>
                <th align="left">Billing</th>
                <th align="left">Monthly</th>
                <th align="left">Sessions</th>
                <th align="left">Last sign in</th>
                <th align="left">Last sign out</th>
                <th align="left">Password</th>
                <th align="left">Notes</th>
                <th align="left">Admin actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id}>
                  <td>
                    <strong>{member.name}</strong>
                    <div style={{ color: "var(--muted)", fontSize: "0.92rem" }}>{member.email}</div>
                    {member.organizationName ? (
                      <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{member.organizationName}</div>
                    ) : null}
                  </td>
                  <td>{member.memberType}</td>
                  <td>
                    {member.plan}
                    {member.referralCodeUsed ? (
                      <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>ref: {member.referralCodeUsed}</div>
                    ) : null}
                  </td>
                  <td>
                    {member.billingStatus}
                    {member.trialEndsAt ? (
                      <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>until {formatDate(member.trialEndsAt)}</div>
                    ) : null}
                  </td>
                  <td>{formatMoney(member.monthlyValue)}</td>
                  <td>
                    {member.totalPracticeSessions}
                    <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                      active sessions: {member.activeSessionCount}
                    </div>
                  </td>
                  <td>{formatDate(member.lastSignInAt)}</td>
                  <td>{formatDate(member.lastSignOutAt)}</td>
                  <td>{member.passwordStatus === "protected" ? "Protected hash" : "No password"}</td>
                  <td>
                    {member.teacherNoteCount}
                    {member.averageScore ? (
                      <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>avg {member.averageScore}</div>
                    ) : null}
                  </td>
                  <td style={{ minWidth: 270 }}>
                    <div style={{ display: "grid", gap: "0.55rem" }}>
                      <select
                        value={memberDrafts[member.id]?.plan ?? member.plan}
                        onChange={(event) => updateMemberDraft(member.id, { plan: event.target.value })}
                        style={{ padding: "0.75rem", borderRadius: 12, border: "1px solid var(--line)" }}
                      >
                        <option value="free">Free</option>
                        <option value="plus">Plus</option>
                        <option value="pro">Pro</option>
                      </select>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 110px", gap: "0.55rem" }}>
                        <select
                          value={memberDrafts[member.id]?.billingStatus ?? member.billingStatus}
                          onChange={(event) => updateMemberDraft(member.id, { billingStatus: event.target.value })}
                          style={{ padding: "0.75rem", borderRadius: 12, border: "1px solid var(--line)" }}
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
                          style={{ padding: "0.75rem", borderRadius: 12, border: "1px solid var(--line)" }}
                        />
                      </div>
                      <button
                        className="button button-secondary"
                        type="button"
                        disabled={memberBusyId === member.id}
                        onClick={() => saveMember(member.id)}
                      >
                        {memberBusyId === member.id ? "Saving..." : "Save access"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="feature-grid">
        <section className="card" style={{ padding: "1.25rem", display: "grid", gap: "1rem" }}>
          <div>
            <span className="eyebrow">Institutions</span>
            <h2 style={{ margin: "0.35rem 0 0.25rem" }}>Teacher / student visibility by organization</h2>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th align="left">Organization</th>
                  <th align="left">Teachers</th>
                  <th align="left">Students</th>
                  <th align="left">Schools</th>
                  <th align="left">Avg score</th>
                  <th align="left">Sessions</th>
                </tr>
              </thead>
              <tbody>
                {props.institutions.map((item) => (
                  <tr key={item.organizationName}>
                    <td>{item.organizationName}</td>
                    <td>{item.teachers}</td>
                    <td>{item.students}</td>
                    <td>{item.schools}</td>
                    <td>{item.averageScore ?? "—"}</td>
                    <td>{item.totalSessions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card" style={{ padding: "1.25rem", display: "grid", gap: "1rem" }}>
          <div>
            <span className="eyebrow">Recent payments</span>
            <h2 style={{ margin: "0.35rem 0 0.25rem" }}>Latest billing events</h2>
          </div>
          <div style={{ display: "grid", gap: "0.7rem" }}>
            {props.billingEvents.map((event) => (
              <div key={event.id} className="card" style={{ padding: "0.9rem" }}>
                <strong>{event.event_name}</strong>
                <div style={{ color: "var(--muted)", fontSize: "0.92rem" }}>{event.user_email ?? "Unknown email"}</div>
                <div style={{ color: "var(--muted)", fontSize: "0.92rem" }}>
                  {event.plan} / {event.billing_status} / {formatDate(event.created_at)}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="card" style={{ padding: "1.25rem", display: "grid", gap: "1rem" }}>
        <div>
          <span className="eyebrow">Recent access</span>
          <h2 style={{ margin: "0.35rem 0 0.25rem" }}>Sign-in and sign-out activity</h2>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th align="left">User</th>
                <th align="left">Type</th>
                <th align="left">Event</th>
                <th align="left">Time</th>
              </tr>
            </thead>
            <tbody>
              {props.authActivity.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.userName}</strong>
                    <div style={{ color: "var(--muted)", fontSize: "0.92rem" }}>{item.userEmail}</div>
                  </td>
                  <td>{item.memberType ?? "—"}</td>
                  <td>{item.eventType}</td>
                  <td>{formatDate(item.occurredAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
