import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function SocialPlanningPage() {
  await requireAuth("founder");

  const clients = await prisma.clientProfile.findMany({
    where: { package: { in: ["sms", "consulting"] } },
    select: { id: true, founderName: true, businessName: true },
    orderBy: { createdAt: "desc" },
  });

  // Single client: go straight to their calendar
  if (clients.length === 1) {
    redirect(`/social-planning/${clients[0].id}`);
  }

  // No social clients
  if (clients.length === 0) {
    return (
      <div className="space-y-6">
        <div className="border-b border-[#EDEBE6] pb-6">
          <p className="text-[9px] tracking-[0.22em] uppercase text-[#7a7268] mb-1">Social</p>
          <h1 className="text-5xl font-[300] text-[#1A1917]">Content Planner</h1>
        </div>
        <p className="text-sm text-[#b0a89e]">No social strategy clients yet.</p>
      </div>
    );
  }

  // Multiple clients: show picker
  return (
    <div className="space-y-8">
      <div className="border-b border-[#EDEBE6] pb-6">
        <p className="text-[9px] tracking-[0.22em] uppercase text-[#7a7268] mb-1">Social</p>
        <h1 className="text-5xl font-[300] text-[#1A1917]">Content Planner</h1>
      </div>
      <div className="space-y-2">
        {clients.map((client) => (
          <Link
            key={client.id}
            href={`/social-planning/${client.id}`}
            className="flex items-center justify-between px-5 py-4 border border-[#EDEBE6] rounded-xl hover:border-[#8C735A]/40 transition-colors group"
          >
            <div>
              <p className="text-sm text-[#1A1917]">{client.founderName}</p>
              <p className="text-xs text-[#b0a89e]">{client.businessName}</p>
            </div>
            <span className="text-xs text-[#b0a89e] group-hover:text-[#8C735A] transition-colors">Open calendar →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
