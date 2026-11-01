import { describe, expect, it } from "vitest";
import { createMemberProfile } from "@/lib/membership";
import { resolveDashboardRole } from "@/lib/roles";
import { withAdminPrivileges } from "@/lib/admin";

describe("dashboard routing versus account capabilities", () => {
  it("keeps a platform administrator's personal practice reachable", () => {
    const operator = withAdminPrivileges({
      ...createMemberProfile("operator@example.test", "Operator"),
      adminAccess: true
    });
    expect(operator.isAdmin).toBe(true);
    expect(resolveDashboardRole(operator)).toBe("student");
  });

  it("preserves the institution workspace for an authorised school account", () => {
    const school = withAdminPrivileges({
      ...createMemberProfile("school@example.test", "School", { memberType: "school" }),
      adminAccess: true,
      organizationId: "org-a"
    });
    expect(resolveDashboardRole(school)).toBe("school");
  });

  it("does not grant a school workspace from a self-selected account type", () => {
    const unapproved = createMemberProfile("unapproved@example.test", "School", { memberType: "school" });
    expect(resolveDashboardRole(unapproved)).toBe("student");
  });

  it("preserves teacher routing for explicitly authorised teachers", () => {
    const teacher = {
      ...createMemberProfile("teacher@example.test", "Teacher", { memberType: "teacher" }),
      teacherAccess: true
    };
    expect(resolveDashboardRole(teacher)).toBe("teacher");
    expect(resolveDashboardRole({ ...teacher, adminAccess: true })).toBe("teacher");
  });

  it("keeps guests and ordinary learners on their own routes", () => {
    expect(resolveDashboardRole(null)).toBe("guest");
    expect(resolveDashboardRole(createMemberProfile("learner@example.test", "Learner"))).toBe("student");
  });
});
