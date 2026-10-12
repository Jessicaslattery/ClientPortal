import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { RoadmapEditor } from "@/components/founder/RoadmapEditor";

export default async function ClientRoadmapPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth("founder");
  const { id } = await params;

  const client = await prisma.clientProfile.findUnique({
    where: { id },
    select: { id: true, founderName: true, businessName: true, startDate: true },
  });
  if (!client) notFound();

  const roadmap = await prisma.clientRoadmap.findFirst({
    where: { clientProfileId: id, status: "active" },
    orderBy: { createdAt: "desc" },
  });

  type RoadmapWeek = { week: number; focus: string; priority: string; milestone: string };
  let weeks: RoadmapWeek[] = [];
  if (roadmap?.weeksJson) {
    try { weeks = JSON.parse(roadmap.weeksJson); } catch { weeks = []; }
  }
  if (weeks.length < 12) {
    for (let w = weeks.length + 1; w <= 12; w++) {
      weeks.push({ week: w, focus: "", priority: "", milestone: "" });
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Link href="/clients" className="text-xs text-[#8C8277] hover:text-[#5C5550] transition-colors">Clients</Link>
          <span className="text-[#E8E2D9]">/</span>
          <Link href={`/clients/${id}`} className="text-xs text-[#8C8277] hover:text-[#5C5550] transition-colors">{client.founderName}</Link>
          <span className="text-[#E8E2D9]">/</span>
          <span className="text-xs text-[#5C5550]">90-Day Roadmap</span>
        </div>
        <h1 className="font-display text-4xl font-thin tracking-widest text-[#1A1714] uppercase mt-1">
          90-Day Roadmap
        </h1>
        <p className="mt-1 text-sm text-[#5C5550]">{client.founderName} · {client.businessName}</p>
      </div>

      <RoadmapEditor
        clientProfileId={id}
        roadmapId={roadmap?.id ?? null}
        defaultTitle={roadmap?.title ?? "90-Day Roadmap"}
        defaultStartDate={
          roadmap?.startDate
            ? new Date(roadmap.startDate).toISOString().slice(0, 10)
            : new Date(client.startDate).toISOString().slice(0, 10)
        }
        defaultPhase1={roadmap?.phase1Focus ?? ""}
        defaultPhase2={roadmap?.phase2Focus ?? ""}
        defaultPhase3={roadmap?.phase3Focus ?? ""}
        weeks={weeks}
      />
    </div>
  );
}
