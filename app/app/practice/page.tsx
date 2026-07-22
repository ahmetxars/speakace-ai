import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PracticeConsole } from "@/components/practice-console";
import { redirectPrivilegedDashboardUsers } from "@/lib/server/dashboard-access";

const RETURN_PARAM_KEYS = [
  "examType",
  "taskType",
  "difficulty",
  "promptId",
  "runMode",
  "quickStart",
  "activation",
  "cta",
  "cta_event"
] as const;

type PracticePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PracticePage({ searchParams }: PracticePageProps) {
  const profile = await redirectPrivilegedDashboardUsers();
  if (!profile || profile.role === "guest") {
    const requestedParams = await searchParams;
    const returnParams = new URLSearchParams();
    for (const key of RETURN_PARAM_KEYS) {
      const rawValue = requestedParams[key];
      const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;
      if (value && value.length <= 200) {
        returnParams.set(key, value);
      }
    }
    const returnTo = `/app/practice${returnParams.size ? `?${returnParams.toString()}` : ""}`;
    redirect(`/auth?mode=signin&next=${encodeURIComponent(returnTo)}`);
  }

  return (
    <Suspense fallback={null}>
      <PracticeConsole />
    </Suspense>
  );
}
