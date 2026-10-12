import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function SessionNotesPage() {
  const session = await requireAuth("client");
  if (!session.clientProfileId) redirect("/login");

  const summaries = await prisma.sessionSummary.findMany({
    where: {
      clientProfileId: session.clientProfileId,
      status: "approved",
    },
    orderBy: { date: "desc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-thin tracking-widest text-[#1A1714] uppercase">
          Session Notes
        </h1>
        <p className="mt-1 text-sm text-[#5C5550]">
          Summaries from your Pivot Co. sessions, ready when you need them.
        </p>
      </div>

      {summaries.length === 0 ? (
        <div className="rounded-3xl border border-[#E8E2D9] p-8 text-center">
          <p className="text-sm text-[#8C8277]">No session notes yet.</p>
          <p className="text-xs text-[#C8B89A] mt-1">Notes will appear here after each session is reviewed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {summaries.map((s) => {
            const keyDecisions = JSON.parse(s.keyDecisions) as string[];
            const commitments = JSON.parse(s.commitments) as string[];
            const themes = JSON.parse(s.themes) as string[];
            const dateStr = new Date(s.date).toLocaleDateString("en-AU", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            });

            return (
              <div key={s.id} className="rounded-3xl border border-[#E8E2D9] p-6 space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277]">Session</p>
                    <p className="text-sm text-[#1A1714] mt-0.5">{dateStr}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] mb-2">Summary</p>
                  <p className="text-sm text-[#5C5550] leading-6">{s.summary}</p>
                </div>

                {keyDecisions.length > 0 && (
                  <div>
                    <p className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] mb-2">Key Decisions</p>
                    <ul className="space-y-1.5">
                      {keyDecisions.map((d, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[#5C5550]">
                          <span className="mt-1.5 w-1 h-1 rounded-full bg-[#C8B89A] shrink-0" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {commitments.length > 0 && (
                  <div>
                    <p className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] mb-2">Your Commitments</p>
                    <ul className="space-y-1.5">
                      {commitments.map((c, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[#5C5550]">
                          <span className="mt-1.5 w-1 h-1 rounded-full bg-[#2D6A4F] shrink-0" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {themes.length > 0 && (
                  <div>
                    <p className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] mb-2">Themes</p>
                    <div className="flex flex-wrap gap-2">
                      {themes.map((t, i) => (
                        <span
                          key={i}
                          className="rounded-full border border-[#E8E2D9] px-3 py-1 text-xs text-[#5C5550]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
