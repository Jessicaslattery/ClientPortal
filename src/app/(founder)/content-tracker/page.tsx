import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";

// The season runs September through December — clients don't see months
// outside this window, so the tracker shouldn't offer them either.
const SEASON_MONTHS = ["2026-09", "2026-10", "2026-11", "2026-12"];

function monthLabel(month: string) {
  const [year, m] = month.split("-").map(Number);
  return new Date(year, m - 1, 1).toLocaleDateString("en-AU", { month: "long", year: "numeric" });
}

export default async function ContentTrackerPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  await requireAuth("founder");

  const { month: monthParam } = await searchParams;
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const selectedMonth = monthParam && SEASON_MONTHS.includes(monthParam)
    ? monthParam
    : (SEASON_MONTHS.includes(currentMonth) ? currentMonth : SEASON_MONTHS[0]);
  const monthName = monthLabel(selectedMonth);

  const currentIndex = SEASON_MONTHS.indexOf(selectedMonth);
  const prevMonth = currentIndex > 0 ? SEASON_MONTHS[currentIndex - 1] : null;
  const nextMonth = currentIndex < SEASON_MONTHS.length - 1 ? SEASON_MONTHS[currentIndex + 1] : null;

  const clients = await prisma.clientProfile.findMany({
    where: { isActive: true },
    select: {
      id: true,
      founderName: true,
      businessName: true,
      contentPosts: {
        where: { month: selectedMonth },
        select: { id: true, contentType: true, status: true, postDate: true, hook: true },
      },
    },
    orderBy: { founderName: "asc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-thin tracking-widest text-[#1A1714] uppercase">
            Content Tracker
          </h1>
          <p className="mt-1.5 text-sm text-[#5C5550]">
            {monthName} — monthly content completion per client
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {prevMonth ? (
            <Link href={`/content-tracker?month=${prevMonth}`}
              className="px-3 py-1.5 rounded-xl border border-[#E8E2D9] text-[#5C5550] text-xs hover:border-[#C8B89A] transition-colors">←</Link>
          ) : (
            <span className="px-3 py-1.5 rounded-xl border border-[#E8E2D9] text-[#E8E2D9] text-xs">←</span>
          )}
          <span className="text-sm text-[#1A1714] min-w-[140px] text-center">{monthName}</span>
          {nextMonth ? (
            <Link href={`/content-tracker?month=${nextMonth}`}
              className="px-3 py-1.5 rounded-xl border border-[#E8E2D9] text-[#5C5550] text-xs hover:border-[#C8B89A] transition-colors">→</Link>
          ) : (
            <span className="px-3 py-1.5 rounded-xl border border-[#E8E2D9] text-[#E8E2D9] text-xs">→</span>
          )}
        </div>
      </div>

      {clients.length === 0 && (
        <div className="rounded-3xl border border-[#E8E2D9] px-8 py-16 text-center">
          <p className="text-sm text-[#8C8277]">No active clients yet.</p>
        </div>
      )}

      <div className="space-y-4">
        {clients.map((client) => {
          const posts = client.contentPosts.filter((p) => p.contentType !== "story");
          const stories = client.contentPosts.filter((p) => p.contentType === "story");

          const postedPosts = posts.filter((p) => p.status === "complete").length;
          const postedStories = stories.filter((p) => p.status === "complete").length;
          const totalPosts = posts.length;
          const totalStories = stories.length;

          const postsDone = totalPosts > 0 && postedPosts === totalPosts;
          const storiesDone = totalStories > 0 && postedStories === totalStories;
          const allDone = postsDone && storiesDone;
          const noPlan = totalPosts === 0 && totalStories === 0;

          return (
            <div
              key={client.id}
              className="rounded-3xl border border-[#E8E2D9] bg-[#FFFFFF] p-6"
              style={{ boxShadow: "0 1px 3px rgba(92,71,48,0.08)" }}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium text-[#1A1714]">{client.founderName}</p>
                  <p className="text-xs text-[#8C8277]">{client.businessName}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] tracking-[0.1em] uppercase font-medium ${
                  noPlan
                    ? "bg-[#F5F2ED] text-[#8C8277]"
                    : allDone
                    ? "bg-[#D8EFE3] text-[#2D6A4F]"
                    : "bg-[#FFF4E0] text-[#B7791F]"
                }`}>
                  {noPlan ? "No plan" : allDone ? "All done" : "In progress"}
                </span>
              </div>

              {noPlan ? (
                <p className="text-xs text-[#8C8277]">No content posts planned for this month.</p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {/* Posts */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] tracking-[0.12em] uppercase text-[#8C8277]">Posts</p>
                      <p className="text-xs text-[#1A1714]">{postedPosts}/{totalPosts} posted</p>
                    </div>
                    {totalPosts > 0 && (
                      <div className="h-1.5 rounded-full bg-[#E8E2D9] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.round((postedPosts / totalPosts) * 100)}%`,
                            backgroundColor: postsDone ? "#2D6A4F" : "#C8B89A",
                          }}
                        />
                      </div>
                    )}
                    <div className="mt-2 space-y-1">
                      {posts.slice(0, 6).map((p) => (
                        <div key={p.id} className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            p.status === "complete" ? "bg-[#2D6A4F]" :
                            p.status === "working_on_it" ? "bg-[#B7791F]" :
                            "bg-[#E8E2D9]"
                          }`} />
                          <p className="text-[11px] text-[#5C5550] truncate">
                            {new Date(p.postDate).toLocaleDateString("en-AU", { day: "numeric", month: "short" })} — {p.hook || p.contentType}
                          </p>
                        </div>
                      ))}
                      {posts.length > 6 && (
                        <p className="text-[10px] text-[#8C8277]">+{posts.length - 6} more</p>
                      )}
                    </div>
                  </div>

                  {/* Stories */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] tracking-[0.12em] uppercase text-[#8C8277]">Stories</p>
                      <p className="text-xs text-[#1A1714]">{postedStories}/{totalStories} posted</p>
                    </div>
                    {totalStories > 0 && (
                      <div className="h-1.5 rounded-full bg-[#E8E2D9] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.round((postedStories / totalStories) * 100)}%`,
                            backgroundColor: storiesDone ? "#2D6A4F" : "#C8B89A",
                          }}
                        />
                      </div>
                    )}
                    {totalStories === 0 && (
                      <p className="text-[11px] text-[#8C8277] mt-1">No stories planned</p>
                    )}
                    <div className="mt-2 space-y-1">
                      {stories.slice(0, 6).map((p) => (
                        <div key={p.id} className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            p.status === "complete" ? "bg-[#2D6A4F]" :
                            p.status === "working_on_it" ? "bg-[#B7791F]" :
                            "bg-[#E8E2D9]"
                          }`} />
                          <p className="text-[11px] text-[#5C5550] truncate">
                            {new Date(p.postDate).toLocaleDateString("en-AU", { day: "numeric", month: "short" })} — {p.hook || "Story"}
                          </p>
                        </div>
                      ))}
                      {stories.length > 6 && (
                        <p className="text-[10px] text-[#8C8277]">+{stories.length - 6} more</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
