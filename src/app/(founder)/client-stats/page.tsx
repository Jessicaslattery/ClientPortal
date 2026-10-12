import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ClientStatsBoard } from "@/components/founder/ClientStatsBoard";

export default async function ClientStatsPage() {
  await requireAuth("founder");

  const clients = await prisma.clientProfile.findMany({
    where: { isActive: true },
    select: {
      id: true,
      founderName: true,
      businessName: true,
      scorecards: {
        orderBy: { weekStart: "asc" },
        select: {
          weekStart: true,
          revenue: true,
          leads: true,
          callsBooked: true,
          callsConverted: true,
          avgClientValue: true,
          currentClients: true,
          cancellations: true,
          contentPieces: true,
          contentEnquiries: true,
          followerGrowth: true,
          bestPerformingPost: true,
          hoursWorked: true,
          energyScore: true,
          biggestWin: true,
          biggestBlock: true,
        },
      },
    },
    orderBy: { founderName: "asc" },
  });

  const data = clients.map((c) => ({
    id: c.id,
    name: c.founderName,
    business: c.businessName,
    scorecards: c.scorecards.map((s) => ({
      weekStart: s.weekStart.toISOString().slice(0, 10),
      revenue: s.revenue,
      leads: s.leads,
      callsBooked: s.callsBooked,
      callsConverted: s.callsConverted,
      avgClientValue: s.avgClientValue,
      currentClients: s.currentClients,
      cancellations: s.cancellations,
      contentPieces: s.contentPieces,
      contentEnquiries: s.contentEnquiries,
      followerGrowth: s.followerGrowth,
      bestPerformingPost: s.bestPerformingPost,
      hoursWorked: s.hoursWorked,
      energyScore: s.energyScore,
      biggestWin: s.biggestWin,
      biggestBlock: s.biggestBlock,
    })),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-thin tracking-widest text-[#1A1714] uppercase">
          Client Stats
        </h1>
        <p className="mt-1.5 text-sm text-[#5C5550]">
          Weekly performance tracked over time — week on week change
        </p>
      </div>
      <ClientStatsBoard clients={data} />
    </div>
  );
}
