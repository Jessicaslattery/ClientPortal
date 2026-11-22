import { requireAuth } from "@/lib/auth";
import { LeadDesk, type Lead } from "@/components/founder/LeadDesk";

export default async function CRMPage() {
  await requireAuth("founder");

  const leads: Lead[] = [];

  return <LeadDesk initialLeads={leads} />;
}
