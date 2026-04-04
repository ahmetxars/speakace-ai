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
  const [code, setCode] = useState("");
  const [label, setLabel] = useState("");
  const [trialDays, setTrialDays] = useState("7");
  const [usageLimit, setUsageLimit] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const teacherCount = useMemo(
    () => props.members.filter((member) => member.memberType === "teacher").length,
    [props.members]
  );

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
                <th align="left">Password</th>
                <th align="left">Notes</th>
              </tr>
            </thead>
            <tbody>
              {props.members.map((member) => (
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
                  <td>{member.passwordStatus === "protected" ? "Protected hash" : "No password"}</td>
                  <td>
                    {member.teacherNoteCount}
                    {member.averageScore ? (
                      <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>avg {member.averageScore}</div>
                    ) : null}
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
