"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppState } from "@/components/providers";
import { InstitutionBillingSummary } from "@/lib/types";

type TeacherClassSummary = {
  id: string;
  name: string;
  joinCode: string;
  studentCount: number;
};

const emptyBilling: InstitutionBillingSummary = {
  teacherId: "",
  plan: "starter",
  status: "draft",
  seatCount: 20,
  monthlyPrice: 49,
  includedClasses: 3,
  includedStudents: 20,
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString()
};

export function TeacherBilling() {
  const { currentUser, language } = useAppState();
  const tr = language === "tr";
  const [billing, setBilling] = useState<InstitutionBillingSummary>(emptyBilling);
  const [plan, setPlan] = useState<InstitutionBillingSummary["plan"]>("starter");
  const [seatCount, setSeatCount] = useState(20);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [classes, setClasses] = useState<TeacherClassSummary[]>([]);

  useEffect(() => {
    if (!currentUser?.isTeacher && !currentUser?.isAdmin) return;
    fetch("/api/teacher/billing")
      .then((response) => response.json())
      .then((data: { billing?: InstitutionBillingSummary }) => {
        const next = data.billing ?? emptyBilling;
        setBilling(next);
        setPlan(next.plan);
        setSeatCount(next.seatCount);
      })
      .catch(() => {
        setBilling(emptyBilling);
        setPlan("starter");
        setSeatCount(20);
      });
  }, [currentUser?.id, currentUser?.isAdmin, currentUser?.isTeacher]);

  useEffect(() => {
    if (!currentUser?.isTeacher && !currentUser?.isAdmin) return;
    fetch("/api/teacher/classes")
      .then((response) => response.json())
      .then((data: { classes?: TeacherClassSummary[] }) => setClasses(data.classes ?? []))
      .catch(() => setClasses([]));
  }, [currentUser?.id, currentUser?.isAdmin, currentUser?.isTeacher]);

  const draftSummary = useMemo(() => {
    if (plan === "campus") {
      return { monthlyPrice: 249, includedClasses: 20, minimumSeats: 120 };
    }
    if (plan === "team") {
      return { monthlyPrice: 99, includedClasses: 8, minimumSeats: 40 };
    }
    return { monthlyPrice: 49, includedClasses: 3, minimumSeats: 20 };
  }, [plan]);

  const effectiveSeatCount = Math.max(draftSummary.minimumSeats, seatCount);
  const includedStudents = Math.max(effectiveSeatCount, plan === "campus" ? 250 : plan === "team" ? 80 : 20);
  const currentClassCount = classes.length;
  const currentSeatUsage = classes.reduce((sum, item) => sum + item.studentCount, 0);
  const classUsageWarning = currentClassCount > draftSummary.includedClasses;
  const seatUsageWarning = currentSeatUsage > includedStudents;

  const saveBilling = async () => {
    setNotice("");
    setError("");
    const response = await fetch("/api/teacher/billing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, seatCount: effectiveSeatCount })
    });
    const data = (await response.json()) as { billing?: InstitutionBillingSummary; error?: string };
    if (!response.ok || !data.billing) {
      setError(data.error ?? (tr ? "Kurum paketi guncellenemedi." : "Could not update institution billing."));
      return;
    }
    setBilling(data.billing);
    setPlan(data.billing.plan);
    setSeatCount(data.billing.seatCount);
    setNotice(tr ? "Kurum paketi kaydedildi." : "Institution plan saved.");
  };

  const goToCheckout = () => {
    const params = new URLSearchParams({ plan, seats: String(effectiveSeatCount) });
    window.location.href = `/api/payments/lemon/institution-checkout?${params.toString()}`;
  };

  if (!currentUser?.isTeacher && !currentUser?.isAdmin) {
    return (
      <main className="page-shell section">
        <div className="card" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
          <span className="eyebrow">{tr ? "Kurum" : "Institution"}</span>
          <h1 style={{ margin: 0 }}>{tr ? "Ogretmen erisimi gerekli" : "Teacher access required"}</h1>
          <p style={{ color: "var(--muted)", maxWidth: 720 }}>
            {tr ? "Bu alan kurum ve kurs paketlerini yonetmek icin ogretmen hesabina aciktir." : "This area is reserved for teachers managing institution plans."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell section" style={{ display: "grid", gap: "1rem" }}>
      <section className="card" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
        <span className="eyebrow">{tr ? "Kurum billing" : "Institution billing"}</span>
        <h1 style={{ margin: 0 }}>{tr ? "Kurs paketi ve seat planlama" : "Course plan and seat planning"}</h1>
        <p style={{ color: "var(--muted)", maxWidth: 780, lineHeight: 1.7 }}>
          {tr
            ? "Bu alan gercek odeme entegrasyonundan once kurum paketini modellemek icin hazirlandi. Plan, seat sayisi ve kapsanan sinif hacmini buradan yonetebilirsin."
            : "This area models your institution package before real payment wiring. Manage the plan, seat count, and class capacity from one place."}
        </p>
      </section>

      <section className="grid" style={{ gridTemplateColumns: "minmax(320px, 0.95fr) minmax(320px, 1.05fr)", gap: "1rem", alignItems: "start" }}>
        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "1rem" }}>
          <div>
            <span className="eyebrow">{tr ? "Plan secimi" : "Plan selection"}</span>
            <h2 style={{ fontSize: "2rem", margin: "0.6rem 0 0.2rem" }}>{tr ? "Kurum paketini duzenle" : "Adjust institution plan"}</h2>
          </div>

          <select className="practice-select" value={plan} onChange={(event) => setPlan(event.target.value as InstitutionBillingSummary["plan"])}>
            <option value="starter">{tr ? "Starter kurs" : "Starter course"}</option>
            <option value="team">{tr ? "Team academy" : "Team academy"}</option>
            <option value="campus">{tr ? "Campus partner" : "Campus partner"}</option>
          </select>

          <label style={{ display: "grid", gap: "0.5rem" }}>
            <span style={{ color: "var(--muted)" }}>{tr ? "Seat sayisi" : "Seat count"}</span>
            <input
              type="number"
              min={draftSummary.minimumSeats}
              value={seatCount}
              onChange={(event) => setSeatCount(Number(event.target.value || draftSummary.minimumSeats))}
              style={{ padding: "0.9rem", borderRadius: 14, border: "1px solid var(--line)" }}
            />
          </label>

          <div style={{ display: "grid", gap: "0.6rem" }}>
            <button type="button" className="button button-primary" onClick={goToCheckout}>
              {tr ? "Odemeye gec" : "Select plan & checkout"}
            </button>
            <button type="button" className="button" onClick={saveBilling} style={{ opacity: 0.75 }}>
              {tr ? "Taslak olarak kaydet" : "Save as draft"}
            </button>
          </div>
          {notice ? <p style={{ margin: 0, color: "var(--success)" }}>{notice}</p> : null}
          {error ? <p style={{ margin: 0, color: "var(--accent-deep)" }}>{error}</p> : null}
        </div>

        <div className="grid" style={{ gap: "1rem" }}>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.8rem" }}>
            <SummaryCard label={tr ? "Aylik fiyat" : "Monthly price"} value={`$${draftSummary.monthlyPrice}`} note={tr ? "Kurum paketi" : "Institution package"} />
            <SummaryCard label={tr ? "Dahil sinif" : "Included classes"} value={String(draftSummary.includedClasses)} note={tr ? "Aktif sinif limiti" : "Active class allowance"} />
            <SummaryCard label={tr ? "Dahil ogrenci" : "Included students"} value={String(includedStudents)} note={tr ? "Seat tabanli kapasite" : "Seat-based capacity"} />
            <SummaryCard label={tr ? "Durum" : "Status"} value={billing.status.toUpperCase()} note={tr ? "Abonelik durumu" : "Subscription status"} />
          </div>

          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.8rem" }}>
            <SummaryCard label={tr ? "Aktif sinif kullanim" : "Active class usage"} value={`${currentClassCount}/${draftSummary.includedClasses}`} note={tr ? "Mevcut sinif hacmi" : "Current class volume"} />
            <SummaryCard label={tr ? "Seat kullanim" : "Seat usage"} value={`${currentSeatUsage}/${includedStudents}`} note={tr ? "Toplam ogrenci baglantisi" : "Total enrolled students"} />
          </div>

          {classUsageWarning || seatUsageWarning ? (
            <div className="card" style={{ padding: "1rem", background: "rgba(217, 93, 57, 0.08)", display: "grid", gap: "0.65rem" }}>
              <strong>{tr ? "Kapasite uyarisi" : "Capacity warning"}</strong>
              {classUsageWarning ? (
                <p style={{ margin: 0, color: "var(--accent-deep)", lineHeight: 1.7 }}>
                  {tr ? `Aktif sinif sayin secili paket limitini asti. Simdi ${currentClassCount} sinifin var, secili paket ${draftSummary.includedClasses} sinif kapsiyor.` : `Your active class count is above the selected package allowance. You have ${currentClassCount} classes while the selected plan includes ${draftSummary.includedClasses}.`}
                </p>
              ) : null}
              {seatUsageWarning ? (
                <p style={{ margin: 0, color: "var(--accent-deep)", lineHeight: 1.7 }}>
                  {tr ? `Seat kullanimin secili paket kapasitesini asti. Simdi ${currentSeatUsage} ogrenci baglantin var, secili paket ${includedStudents} ogrenci kapsiyor.` : `Your seat usage is above the selected plan capacity. You now have ${currentSeatUsage} enrolled students while the selected plan includes ${includedStudents}.`}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="card" style={{ padding: "1rem", background: "rgba(47, 125, 75, 0.08)" }}>
              <strong>{tr ? "Kapasite durumu saglikli" : "Capacity looks healthy"}</strong>
              <p style={{ margin: "0.55rem 0 0", color: "var(--muted)", lineHeight: 1.7 }}>
                {tr ? "Mevcut sinif ve seat kullanim seviyen secili kurumsal paketle uyumlu." : "Your current class and seat usage fits within the selected institution plan."}
              </p>
            </div>
          )}

          <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)", display: "grid", gap: "0.7rem" }}>
            <strong>{tr ? "Bu paket ne icin iyi?" : "What is this plan good for?"}</strong>
            <ul style={{ margin: 0, paddingLeft: "1.1rem" }}>
              {(plan === "starter"
                ? tr
                  ? ["Kucuk speaking kulubu veya birebir hoca modeli", "Az sayida sinif, dusuk operasyon", "Ilk kurumsal pilot icin ideal"]
                  : ["Small speaking club or private tutor setup", "Few classes with light operations", "Ideal for the first institutional pilot"]
                : plan === "team"
                  ? tr
                    ? ["Birden fazla grup acan dil kursu", "Ogretmen basi daha dengeli seat dagilimi", "Kursta weekly progress takibi icin uygun"]
                    : ["Language academy with multiple active groups", "Balanced seat allocation across teachers", "Suitable for weekly progress tracking"]
                  : tr
                    ? ["Buyuk kurs veya universite birimi", "Yuksek seat ve sinif hacmi", "Kurumsal raporlama ve department rollout icin uygun"]
                    : ["Larger academy or university unit", "High seat and class volume", "Suitable for institutional reporting and department rollout"]).map((item) => (
                <li key={item} style={{ marginTop: "0.45rem", lineHeight: 1.7 }}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}

function SummaryCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)" }}>
      <div style={{ color: "var(--muted)", marginBottom: "0.4rem" }}>{label}</div>
      <div style={{ fontSize: "1.8rem", fontWeight: 800 }}>{value}</div>
      <div style={{ color: "var(--muted)", marginTop: "0.4rem", lineHeight: 1.5 }}>{note}</div>
    </div>
  );
}
