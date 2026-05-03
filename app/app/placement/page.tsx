import { PlacementCheck } from "@/components/placement-check";
import { redirectPrivilegedDashboardUsers } from "@/lib/server/dashboard-access";

export default async function PlacementPage() {
  await redirectPrivilegedDashboardUsers();
  return <PlacementCheck />;
}
