import { ReferralCenter } from "@/components/referral-center";
import { redirectPrivilegedDashboardUsers } from "@/lib/server/dashboard-access";

export default async function ReferralCenterPage() {
  await redirectPrivilegedDashboardUsers();
  return <ReferralCenter />;
}
