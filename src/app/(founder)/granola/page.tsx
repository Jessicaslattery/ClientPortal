import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GranolaSync } from "@/components/founder/GranolaSync";

export default async function GranolaPage() {
  await requireAuth("founder");

  const [clients, unmatched, transcripts, syncLogs] = await Promise.all([
    prisma.clientProfile.findMany({
      select: { id: true, founderName: true, businessName: true },
      orderBy: { founderName: "asc" },
    }),
    prisma.unmatchedTranscript.findMany({
      where: { resolved: false },
      orderBy: { date: "desc" },
    }),
    prisma.granolaTranscript.findMany({
      orderBy: { date: "desc" },
      take: 20,
      include: { clientProfile: { select: { founderName: true, businessName: true } } },
    }),
    prisma.granolaSyncLog.findMany({ orderBy: { runAt: "desc" }, take: 5 }),
  ]);

  const hasApiToken = !!process.env.GRANOLA_MCP_TOKEN;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-4xl font-thin tracking-widest text-[#1A1714] uppercase">
          Granola
        </h1>
        <p className="mt-1.5 text-sm text-[#5C5550]">Sync and manage session transcripts</p>
      </div>

      <GranolaSync
        clients={clients}
        unmatched={unmatched}
        transcripts={transcripts}
        syncLogs={syncLogs}
        hasApiToken={hasApiToken}
      />
    </div>
  );
}
