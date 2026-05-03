import { NotificationsCenter } from "@/components/notifications-center";
import { redirectPrivilegedDashboardUsers } from "@/lib/server/dashboard-access";

export default async function NotificationsPage() {
  await redirectPrivilegedDashboardUsers();
  return <NotificationsCenter />;
}
