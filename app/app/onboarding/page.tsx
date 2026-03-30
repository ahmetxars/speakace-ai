import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding-wizard";
import { getStudentProfile } from "@/lib/student-profile-store";
import { getAuthenticatedUser, getSessionCookieName } from "@/lib/server/auth";

export default async function OnboardingPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const profile = await getAuthenticatedUser(token);

  if (!profile || profile.role === "guest") {
    redirect("/auth");
  }

  const studentProfile = await getStudentProfile(profile.id);
  return <OnboardingWizard profile={studentProfile} />;
}
