import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ContentTrackerWrapper } from "@/components/founder/ContentTrackerWrapper";

export default async function ContentTrackerPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  await requireAuth("founder");

  const { month: monthParam } = await searchParams;

  // Default to current month
  const now = new Date();
  const month = monthParam ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const clients = await prisma.clientProfile.findMany({
    where: { package: { in: ["sms", "consulting"] }, isActive: true },
    select: {
      id: true,
      founderName: true,
      businessName: true,
      socialTrackerEntries: {
        where: { month },
      },
    },
    orderBy: { founderName: "asc" },
  });

  const rows = clients.map((c) => {
    const entry = c.socialTrackerEntries[0];
    return {
      clientProfileId: c.id,
      name: c.founderName,
      business: c.businessName,
      planStatus: (entry?.planStatus ?? "not_started") as "not_started" | "in_progress" | "done",
      storiesStatus: (entry?.storiesStatus ?? "not_started") as "not_started" | "in_progress" | "done",
      reelsStatus: (entry?.reelsStatus ?? "not_started") as "not_started" | "in_progress" | "done",
      notes: entry?.notes ?? "",
    };
  });

  const [year, monthNum] = month.split("-");
  const monthLabel = new Date(Number(year), Number(monthNum) - 1).toLocaleDateString("en-AU", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="border-b border-[#EDEBE6] pb-6">
        <p className="text-[9px] tracking-[0.22em] text-[#7a7268] mb-1">Social</p>
        <h1 className="text-5xl font-[300] tracking-tight text-[#1A1917]">Content Tracker</h1>
        <p className="mt-1.5 text-sm text-[#7a7268]">{monthLabel}: track social plans, stories and reels per client</p>
      </div>

      <ContentTrackerWrapper initialRows={rows} month={month} />
    </div>
  );
}
