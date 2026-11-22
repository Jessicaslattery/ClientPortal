import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AnalyticsDashboard } from "@/components/sms/AnalyticsDashboard";

export default async function AnalyticsPage() {
  const session = await requireAuth("client");
  if (!session.clientProfileId) redirect("/login");

  return <AnalyticsDashboard />;
}
