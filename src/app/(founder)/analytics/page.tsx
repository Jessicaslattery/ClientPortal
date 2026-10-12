import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getWeekStart, getPreviousWeekStarts } from "@/lib/healthScore";

function engagementScore(p: { likes: number | null; comments: number | null; shares: number | null; saves: number | null }) {
  return (p.likes ?? 0) + (p.comments ?? 0) * 2 + (p.shares ?? 0) * 3 + (p.saves ?? 0) * 3;
}

export default async function FounderAnalyticsPage() {
  await requireAuth("founder");

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, "0")}`;
  const monthName = now.toLocaleDateString("en-AU", { month: "long", year: "numeric" });

  const fourWeeksAgo = getPreviousWeekStarts(4, now)[0];

  const clients = await prisma.clientProfile.findMany({
    where: { isActive: true },
    select: {
      id: true,
      founderName: true,
      businessName: true,
      contentPosts: {
        where: { month: { in: [currentMonth, lastMonth] } },
        select: { month: true, status: true, views: true, likes: true, comments: true, shares: true, saves: true, reach: true },
      },
      scorecards: {
        where: { weekStart: { gte: fourWeeksAgo } },
        select: { contentEnquiries: true, contentPieces: true },
      },
    },
    orderBy: { founderName: "asc" },
  });

  const rows = clients.map((client) => {
    const thisMonthPosts = client.contentPosts.filter((p) => p.month === currentMonth);
    const lastMonthPosts = client.contentPosts.filter((p) => p.month === lastMonth);

    const postedThisMonth = thisMonthPosts.filter((p) => p.status === "complete");
    const postedLastMonth = lastMonthPosts.filter((p) => p.status === "complete");

    const reachThisMonth = postedThisMonth.reduce((s, p) => s + (p.reach ?? 0), 0);
    const reachLastMonth = postedLastMonth.reduce((s, p) => s + (p.reach ?? 0), 0);
    const engagementThisMonth = postedThisMonth.reduce((s, p) => s + engagementScore(p), 0);

    const consistency = thisMonthPosts.length > 0 ? postedThisMonth.length / thisMonthPosts.length : null;

    const enquiries = client.scorecards.reduce((s, w) => s + (w.contentEnquiries ?? 0), 0);
    const piecesLogged = client.scorecards.reduce((s, w) => s + (w.contentPieces ?? 0), 0);

    const reachTrend = reachLastMonth > 0 ? (reachThisMonth - reachLastMonth) / reachLastMonth : null;

    return {
      id: client.id,
      name: client.founderName,
      business: client.businessName,
      plannedThisMonth: thisMonthPosts.length,
      postedThisMonth: postedThisMonth.length,
      consistency,
      reachThisMonth,
      reachTrend,
      engagementThisMonth,
      enquiries,
      piecesLogged,
      contentNotConverting: piecesLogged >= 3 && enquiries === 0,
    };
  });

  const totalReach = rows.reduce((s, r) => s + r.reachThisMonth, 0);
  const totalEngagement = rows.reduce((s, r) => s + r.engagementThisMonth, 0);
  const totalPosted = rows.reduce((s, r) => s + r.postedThisMonth, 0);
  const flagged = rows.filter((r) => r.contentNotConverting);

  const byReach = [...rows].sort((a, b) => b.reachThisMonth - a.reachThisMonth);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-4xl font-thin tracking-widest text-[#1A1714] uppercase">Analytics</h1>
        <p className="mt-1.5 text-sm text-[#5C5550]">{monthName} — performance across all clients</p>
      </div>

      {/* Roster totals */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-3xl border border-[#E8E2D9] bg-white p-5 text-center">
          <p className="font-display text-2xl font-light text-[#1A1714]">{totalReach.toLocaleString("en-AU")}</p>
          <p className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] mt-1">Total reach logged</p>
        </div>
        <div className="rounded-3xl border border-[#E8E2D9] bg-white p-5 text-center">
          <p className="font-display text-2xl font-light text-[#1A1714]">{totalEngagement.toLocaleString("en-AU")}</p>
          <p className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] mt-1">Weighted engagement</p>
        </div>
        <div className="rounded-3xl border border-[#E8E2D9] bg-white p-5 text-center">
          <p className="font-display text-2xl font-light text-[#1A1714]">{totalPosted}</p>
          <p className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] mt-1">Posts published this month</p>
        </div>
      </div>

      {/* Conversion flag */}
      {flagged.length > 0 && (
        <div className="rounded-3xl border border-[#F0C0C0] bg-[#FBEAEA] p-6 space-y-2">
          <p className="text-[10px] tracking-[0.15em] uppercase text-[#9B2335]">Content isn&apos;t converting</p>
          <p className="text-xs text-[#5C5550]">
            These clients have logged content in the last 4 weeks but zero enquiries from it — worth auditing the hook, CTA, or pillar mix.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {flagged.map((r) => (
              <span key={r.id} className="text-xs px-3 py-1 rounded-full bg-white border border-[#F0C0C0] text-[#9B2335]">
                {r.name} · {r.piecesLogged} pieces, 0 enquiries
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Per-client breakdown */}
      <div>
        <p className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277] mb-4">By client — sorted by reach this month</p>
        <div className="rounded-3xl border border-[#E8E2D9] bg-white divide-y divide-[#E8E2D9]" style={{ boxShadow: "0 1px 3px rgba(92,71,48,0.08)" }}>
          {byReach.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-[#8C8277]">No active clients yet.</p>
            </div>
          )}
          {byReach.map((r) => (
            <div key={r.id} className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <p className="text-sm text-[#1A1714] font-medium">{r.name}</p>
                <p className="text-xs text-[#8C8277]">{r.business}</p>
              </div>
              <div className="flex items-center gap-6 flex-wrap">
                <div className="text-center">
                  <p className="text-sm text-[#1A1714]">
                    {r.consistency != null ? `${r.postedThisMonth}/${r.plannedThisMonth}` : "—"}
                  </p>
                  <p className="text-[10px] tracking-[0.08em] uppercase text-[#8C8277]">Posted</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-[#1A1714]">
                    {r.reachThisMonth.toLocaleString("en-AU")}
                    {r.reachTrend != null && (
                      <span className={r.reachTrend >= 0 ? "text-[#2D6A4F]" : "text-[#9B2335]"}>
                        {" "}{r.reachTrend >= 0 ? "↑" : "↓"}{Math.abs(Math.round(r.reachTrend * 100))}%
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] tracking-[0.08em] uppercase text-[#8C8277]">Reach</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-[#1A1714]">{r.enquiries}</p>
                  <p className="text-[10px] tracking-[0.08em] uppercase text-[#8C8277]">Enquiries (4wk)</p>
                </div>
                {r.contentNotConverting && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FBEAEA] text-[#9B2335] uppercase tracking-[0.08em]">Not converting</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
