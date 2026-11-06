import { describe, expect, it } from "vitest";
import {
  getAdminHealthRows,
  type AdminHealthConfiguration,
} from "./admin-health";
const configured: AdminHealthConfiguration = {
  databaseConfigured: true,
  lemonWebhookConfigured: true,
  emailConfigured: true,
  emailLegalIdentityConfigured: false,
  commercialEmailConfigured: false,
  analyticsConfigured: true,
  posthogConfigured: false,
};
describe("admin service configuration", () => {
  it("distinguishes account mail from deliberately stopped commercial mail", () => {
    const rows = getAdminHealthRows(configured);
    expect(
      rows.find((r) => r.label === "Kayıt ve hesap e-postaları")?.status,
    ).toBe("Tanımlı");
    expect(rows.find((r) => r.label === "Ticari e-postalar")).toMatchObject({
      status: "Kapalı",
      tone: "neutral",
    });
  });
  it("does not report intentionally disabled optional tracking as a failure", () => {
    const rows = getAdminHealthRows({
      ...configured,
      analyticsConfigured: false,
    });
    for (const label of ["PostHog", "Birinci taraf analitik"])
      expect(rows.find((r) => r.label === label)).toMatchObject({
        status: "Kapalı",
        tone: "neutral",
      });
  });
  it("does not claim a configured webhook or mail transport has passed a live test", () => {
    const rows = getAdminHealthRows(configured);
    for (const label of [
      "Veritabanı",
      "Lemon webhook",
      "Kayıt ve hesap e-postaları",
    ])
      expect(rows.find((r) => r.label === label)).toMatchObject({
        status: "Tanımlı",
        tone: "neutral",
      });
  });
  it("flags missing required connection settings", () => {
    const rows = getAdminHealthRows({
      ...configured,
      databaseConfigured: false,
      lemonWebhookConfigured: false,
      emailConfigured: false,
    });
    for (const label of [
      "Veritabanı",
      "Lemon webhook",
      "Kayıt ve hesap e-postaları",
    ])
      expect(rows.find((r) => r.label === label)).toMatchObject({
        status: "Ayar eksik",
        tone: "warning",
      });
  });
  it("requires the computed commercial readiness before displaying consent-based sending", () => {
    expect(
      getAdminHealthRows({
        ...configured,
        emailLegalIdentityConfigured: true,
        commercialEmailConfigured: true,
      }).find((r) => r.label === "Ticari e-postalar"),
    ).toMatchObject({ status: "İzinle etkin", tone: "success" });
  });
});
