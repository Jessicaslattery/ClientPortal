import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";

const SKILL_OF_MONTH = {
  title: "Writing hooks that stop the scroll",
  description: "The first 1–3 seconds of your reel or the first line of your caption determines whether anyone sees the rest. This month we're focusing on the craft of opening lines: what makes someone stop, what makes them tap away, and how to write hooks that consistently perform.",
  type: "video" as const,
  lengthMins: 18,
  videoUrl: null as string | null,
};

const MODULES = [
  {
    id: "1",
    title: "How the Instagram algorithm works in 2026",
    description: "What signals actually matter for reach, saves, shares and profile visits, and what's a myth.",
    type: "guide" as const,
    lengthMins: 12,
    videoUrl: null as string | null,
  },
  {
    id: "2",
    title: "Writing captions that convert",
    description: "A repeatable framework for captions that build connection and drive action without feeling salesy.",
    type: "guide" as const,
    lengthMins: 10,
    videoUrl: null as string | null,
  },
  {
    id: "3",
    title: "Reels structure: hook, hold, payoff",
    description: "The three-part structure behind every high-performing reel and how to apply it to your content.",
    type: "video" as const,
    lengthMins: 15,
    videoUrl: null as string | null,
  },
  {
    id: "4",
    title: "Batch content creation: shoot a month in a day",
    description: "How to plan, prep and shoot an entire month of content in a single session without burning out.",
    type: "guide" as const,
    lengthMins: 20,
    videoUrl: null as string | null,
  },
  {
    id: "5",
    title: "Using Stories to warm up your audience",
    description: "Stories are your highest-trust touchpoint. Here's how to use them to build relationships that convert.",
    type: "guide" as const,
    lengthMins: 8,
    videoUrl: null as string | null,
  },
  {
    id: "6",
    title: "Link-in-bio strategy: turning followers into leads",
    description: "How to structure your bio link to drive actual traffic and capture interest from warm followers.",
    type: "guide" as const,
    lengthMins: 10,
    videoUrl: null as string | null,
  },
  {
    id: "8",
    title: "Reading your analytics: what to track",
    description: "The 5 numbers that actually tell you if your content strategy is working, and how to act on them.",
    type: "video" as const,
    lengthMins: 14,
    videoUrl: null as string | null,
  },
];

export default async function SmsLearnPage() {
  const session = await requireAuth("client");
  if (!session.clientProfileId) redirect("/login");

  return (
    <div className="space-y-10">
      <div>
        <p className="text-[9px] tracking-[0.22em] uppercase text-[#b0a89e]">Learn + Tools</p>
        <h1 className="mt-1 text-3xl font-[200] text-[#1A1917] tracking-tight">Your learning hub</h1>
        <p className="mt-2 text-sm text-[#7a7268] font-[300] leading-relaxed max-w-lg">
          Practical guides and videos to help you build your skills alongside your strategy.
        </p>
      </div>

      {/* Skill of the month */}
      <section className="border border-[#1A1917] rounded-xl overflow-hidden">
        <div className="px-6 py-5 bg-[#1A1917]">
          <p className="text-[9px] tracking-[0.22em] uppercase text-white/50">Skill of the month</p>
          <h2 className="mt-1 text-xl font-[200] text-white">{SKILL_OF_MONTH.title}</h2>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-[#5a5450] font-[300] leading-relaxed">{SKILL_OF_MONTH.description}</p>
          <div className="flex items-center gap-4 mt-4">
            <span className="text-[10px] tracking-[0.14em] uppercase text-[#b0a89e]">
              {SKILL_OF_MONTH.type === "video" ? "Video" : "Guide"} · {SKILL_OF_MONTH.lengthMins} min
            </span>
            {SKILL_OF_MONTH.videoUrl ? (
              <a
                href={SKILL_OF_MONTH.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-white bg-[#1A1917] px-4 py-1.5 rounded-lg hover:bg-[#2D2A26] transition-colors"
              >
                Watch now
              </a>
            ) : (
              <span className="text-xs text-[#b0a89e] border border-[#EDEBE6] px-4 py-1.5 rounded-lg">
                Coming soon
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Module library */}
      <section className="space-y-3">
        <p className="text-[9px] tracking-[0.22em] uppercase text-[#b0a89e]">Module library</p>
        <div className="space-y-2">
          {MODULES.map((m) => (
            <div
              key={m.id}
              className="border border-[#EDEBE6] rounded-xl px-5 py-4 flex items-start justify-between gap-4 hover:border-[#CDCAC4] transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#1A1917] font-[300]">{m.title}</p>
                <p className="mt-1 text-xs text-[#7a7268] leading-relaxed font-[300]">{m.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span
                    className="text-[9px] tracking-[0.14em] uppercase px-2 py-0.5 rounded"
                    style={
                      m.type === "video"
                        ? { background: "#EBF2F9", color: "#2D5F8A" }
                        : { background: "#F5F1EB", color: "#8C735A" }
                    }
                  >
                    {m.type === "video" ? "Video" : "Guide"}
                  </span>
                  <span className="text-[9px] text-[#b0a89e]">{m.lengthMins} min</span>
                </div>
              </div>
              {m.videoUrl ? (
                <a
                  href={m.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-[11px] tracking-[0.08em] uppercase text-[#1A1917] border border-[#EDEBE6] px-3 py-1.5 rounded-lg hover:border-[#1A1917] transition-colors"
                >
                  Open
                </a>
              ) : (
                <span className="shrink-0 text-[11px] tracking-[0.08em] uppercase text-[#b0a89e] border border-[#EDEBE6] px-3 py-1.5 rounded-lg">
                  Soon
                </span>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
