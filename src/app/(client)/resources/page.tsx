import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { ResourceLibrary } from "@/components/client/ResourceLibrary";

export default async function ClientResourcesPage() {
  const session = await requireAuth("client");
  if (!session.clientProfileId) redirect("/login");

  const profile = await prisma.clientProfile.findUnique({
    where: { id: session.clientProfileId },
    select: { tier: true },
  });

  if (!profile) redirect("/login");

  const tier = profile.tier.toUpperCase();
  const now = new Date();
  const newThreshold = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const resources = await prisma.resource.findMany({
    where: {
      OR: [
        { visibility: "all" },
        { visibility: tier.toLowerCase() },
        { visibility: "specific", specificClientId: session.clientProfileId },
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  const serialised = resources.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    category: r.category,
    type: r.type,
    fileUrl: r.fileUrl,
    createdAt: r.createdAt,
    isNew: r.createdAt >= newThreshold,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-thin tracking-widest text-[#1A1714] uppercase">
          Resource Library
        </h1>
        <p className="mt-1.5 text-sm text-[#5C5550]">
          {resources.length} resource{resources.length !== 1 ? "s" : ""} available to you
        </p>
      </div>

      <ResourceLibrary resources={serialised} />
    </div>
  );
}
