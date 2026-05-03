import { ReviewMistakes } from "@/components/review-mistakes";
import { redirectPrivilegedDashboardUsers } from "@/lib/server/dashboard-access";

export default async function ReviewPage() {
  await redirectPrivilegedDashboardUsers();
  return <ReviewMistakes />;
}
