import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { BillingTable } from "@/components/founder/BillingTable";

export default async function BillingPage() {
  await requireAuth("founder");

  const clients = await prisma.clientProfile.findMany({
    orderBy: { nextBillingDate: "asc" },
    select: {
      id: true,
      founderName: true,
      businessName: true,
      tier: true,
      monthlyInvestment: true,
      nextBillingDate: true,
      billingNotes: true,
    },
  });

  const now = new Date();
  const totalMrr = clients.reduce((sum, c) => sum + (c.monthlyInvestment ?? 0), 0);
  const overdueCount = clients.filter(
    (c) => c.nextBillingDate && new Date(c.nextBillingDate) < now
  ).length;
  const dueThisWeek = clients.filter((c) => {
    if (!c.nextBillingDate) return false;
    const d = new Date(c.nextBillingDate);
    const diff = d.getTime() - now.getTime();
    return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
  }).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-[300] tracking-tight text-[#1A1917]">
          Billing
        </h1>
        <p className="mt-1.5 text-sm text-[#7a7268]">Monthly investment overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total MRR", value: `$${totalMrr.toLocaleString("en-AU")}`, color: "#C8B89A" },
          { label: "Active Clients", value: clients.length, color: "#1A1917" },
          { label: "Overdue", value: overdueCount, color: overdueCount > 0 ? "#9B2335" : "#2D6A4F" },
          { label: "Due This Week", value: dueThisWeek, color: dueThisWeek > 0 ? "#B7791F" : "#b0a89e" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-[#EDEBE6] p-5">
            <p className="text-[10px] tracking-[0.15em] text-[#b0a89e]">{stat.label}</p>
            <p className="mt-2 text-3xl font-[300] tracking-tight" style={{ color: stat.color }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <BillingTable clients={clients} />
    </div>
  );
}
