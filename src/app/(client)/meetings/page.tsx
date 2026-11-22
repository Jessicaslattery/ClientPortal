import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function MeetingsPage() {
  const session = await requireAuth("client");
  if (!session.clientProfileId) redirect("/login");

  const calls = await prisma.call.findMany({
    where: { clientProfileId: session.clientProfileId },
    orderBy: { scheduledAt: "desc" },
  });

  const upcoming = calls.filter((c) => c.scheduledAt >= new Date());
  const past = calls.filter((c) => c.scheduledAt < new Date());

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-[200] text-[#1A1917]">Meeting Hub</h1>
          <p className="mt-1.5 text-sm text-[#7a7268]">
            {calls.length} session{calls.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <a
          href="https://calendar.app.google/FbQgWUjAyyQ5t53b9"
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 rounded-2xl bg-[#1A1917] text-[#FAFAF8] text-xs tracking-[0.12em] uppercase hover:bg-[#2C2520] transition-colors"
        >
          Book a call
        </a>
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div>
          <h2 className="text-[10px] tracking-[0.15em] uppercase text-[#b0a89e] mb-3">
            Upcoming
          </h2>
          <div className="rounded-2xl border border-[#C8B89A]/20 divide-y divide-[#C8B89A]/10">
            {upcoming.map((call) => (
              <div key={call.id} className="px-5 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[#1A1917]">{call.title}</p>
                  <p className="text-xs text-[#C8B89A] tabular-nums">
                    {new Date(call.scheduledAt).toLocaleDateString("en-AU", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past sessions */}
      {past.length > 0 && (
        <div>
          <h2 className="text-[10px] tracking-[0.15em] uppercase text-[#b0a89e] mb-3">
            Session History
          </h2>
          <div className="space-y-4">
            {past.map((call) => (
              <div key={call.id} className="rounded-2xl border border-[#EDEBE6]">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#EDEBE6]">
                  <div>
                    <p className="text-sm text-[#1A1917]">{call.title}</p>
                    <p className="text-xs text-[#7a7268] mt-0.5">
                      {new Date(call.scheduledAt).toLocaleDateString("en-AU", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  {call.summaryStatus === "approved" ? (
                    <span className="text-[10px] tracking-[0.1em] uppercase text-[#2D6A4F]">
                      Summary available
                    </span>
                  ) : call.summaryStatus === "pending" ? (
                    <span className="text-[10px] tracking-[0.1em] uppercase text-[#B7791F]">
                      Summary pending
                    </span>
                  ) : null}
                </div>

                {/* Summary */}
                {call.summaryStatus === "approved" && call.summaryContent && (
                  <div className="px-5 py-4">
                    <p className="text-[10px] tracking-[0.12em] uppercase text-[#b0a89e] mb-3">
                      Session summary
                    </p>
                    <p className="text-sm text-[#7a7268] leading-6 whitespace-pre-wrap">
                      {call.summaryContent}
                    </p>

                    {call.keyDecisions && (
                      <div className="mt-4">
                        <p className="text-[10px] tracking-[0.12em] uppercase text-[#b0a89e] mb-2">
                          Key decisions
                        </p>
                        <div className="space-y-1.5">
                          {(JSON.parse(call.keyDecisions) as string[]).map((d, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-[#C8B89A] mt-0.5">·</span>
                              <p className="text-xs text-[#7a7268]">{d}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {call.nextSteps && (
                      <div className="mt-4">
                        <p className="text-[10px] tracking-[0.12em] uppercase text-[#b0a89e] mb-2">
                          Next steps
                        </p>
                        <div className="space-y-1.5">
                          {(JSON.parse(call.nextSteps) as string[]).map((s, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-[#C8B89A] mt-0.5">→</span>
                              <p className="text-xs text-[#7a7268]">{s}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {call.notesUrl && (
                      <div className="mt-4 pt-4 border-t border-[#EDEBE6]">
                        <a
                          href={call.notesUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs tracking-[0.1em] uppercase text-[#C8B89A] hover:opacity-70 transition-opacity"
                        >
                          View in Gemini Notes →
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {calls.length === 0 && (
        <div className="rounded-2xl border border-[#EDEBE6] px-8 py-16 text-center">
          <p className="text-2xl font-[200] text-[#1A1917]">No sessions yet</p>
          <p className="mt-2 text-sm text-[#7a7268]">
            Your first call will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
