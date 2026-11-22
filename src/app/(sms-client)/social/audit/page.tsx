import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AuditDashboard } from "@/components/sms/AuditDashboard";

export default async function SmsAuditPage() {
  const session = await requireAuth("client");
  if (!session.clientProfileId) redirect("/login");

  return <AuditDashboard />;
}
