import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";

const PILLAR_COLORS = [
  { bg: "#F5F1EB", accent: "#8C735A", label: "#8C735A" },
  { bg: "#EEF3EE", accent: "#2D6A4F", label: "#2D6A4F" },
  { bg: "#F3EEEE", accent: "#9B2335", label: "#9B2335" },
  { bg: "#EEF0F5", accent: "#3A5A8C", label: "#3A5A8C" },
  { bg: "#F5F3EE", accent: "#6B5A3A", label: "#6B5A3A" },
];

const PILLARS = [
  {
    number: 1,
    name: "Education & Tips",
    purpose: "Position Sophie as the go-to expert in her field and give the audience real value they can act on.",
    formats: ["Carousel", "Reel", "Story Q&A"],
    allocation: "30%",
    ideas: [
      "5 things your wellness routine is missing",
      "Why rest is a productivity strategy",
      "How to build a morning routine that actually sticks",
      "The truth about [common myth in your niche]",
    ],
    caption_tone: "Warm, authoritative, actionable. Lead with the insight, not the sell.",
  },
  {
    number: 2,
    name: "Behind the Scenes",
    purpose: "Build trust and relatability by showing the real person and process behind the brand.",
    formats: ["Reel", "Story", "Talking Head"],
    allocation: "20%",
    ideas: [
      "A day in my life as a wellness founder",
      "How I prep for a client session",
      "What my workspace actually looks like",
      "The messy middle of building this business",
    ],
    caption_tone: "Candid and conversational. First-person. Invite people in.",
  },
  {
    number: 3,
    name: "Client Transformations",
    purpose: "Show proof. Let your clients' results do the selling for you.",
    formats: ["Carousel", "Testimonial Post", "Short Reel"],
    allocation: "20%",
    ideas: [
      "Before & after client story with their permission",
      "Screenshot of a client win shared in messages",
      "\"I used to think… now I know…\" quote format",
      "Mini case study: the problem, the process, the result",
    ],
    caption_tone: "Celebratory but grounded. Centre the client, not yourself.",
  },
  {
    number: 4,
    name: "Offers & Services",
    purpose: "Make it easy for warm followers to take the next step without feeling sold to.",
    formats: ["Carousel", "Story with Link", "Reel"],
    allocation: "15%",
    ideas: [
      "What's included in [your signature offer]",
      "Who this is (and isn't) for",
      "What happens after you book",
      "\"Spots are open for [month]\": behind-the-scenes of onboarding",
    ],
    caption_tone: "Direct but warm. Speak to one person. Always include a clear next step.",
  },
  {
    number: 5,
    name: "Community & Connection",
    purpose: "Drive engagement, grow relationships, and remind your audience there's a real human here.",
    formats: ["Story Poll", "Question Post", "Meme/Relatable"],
    allocation: "15%",
    ideas: [
      "\"Tell me in one word how you're feeling this week\"",
      "This or that: [relevant choice for your niche]",
      "A relatable moment from your week",
      "Open question: what's your biggest challenge with [topic]?",
    ],
    caption_tone: "Light, curious, inviting. Ask a question. Make it easy to reply.",
  },
];

export default async function PillarsPage() {
  const session = await requireAuth("client");
  if (!session.clientProfileId) redirect("/login");

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <p className="text-[9px] tracking-[0.22em] uppercase text-[#b0a89e]">November 2026</p>
        <h1 className="mt-1 text-3xl font-[200] text-[#1A1917] tracking-tight">Content Pillars</h1>
        <p className="mt-2 text-sm text-[#7a7268] font-[300] leading-relaxed max-w-xl">
          Your 5 content pillars for this month. Every post you publish should sit clearly inside one of these themes: this is what keeps your feed intentional and your audience growing.
        </p>
      </div>

      {/* Pillar cards */}
      <div className="space-y-5">
        {PILLARS.map((pillar, i) => {
          const color = PILLAR_COLORS[i];
          return (
            <div
              key={pillar.number}
              className="rounded-2xl border border-[#EDEBE6] overflow-hidden"
            >
              {/* Card header */}
              <div className="flex items-start gap-5 p-6" style={{ backgroundColor: color.bg }}>
                <span
                  className="text-5xl font-[200] leading-none shrink-0 tabular-nums"
                  style={{ color: color.accent, opacity: 0.5 }}
                >
                  {String(pillar.number).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p
                        className="text-[9px] tracking-[0.2em] uppercase font-[400] mb-1"
                        style={{ color: color.label }}
                      >
                        Pillar {pillar.number}
                      </p>
                      <h2 className="text-xl font-[300] text-[#1A1917]">{pillar.name}</h2>
                    </div>
                    <span
                      className="text-[11px] font-[400] px-3 py-1 rounded-full shrink-0"
                      style={{ backgroundColor: color.accent + "20", color: color.accent }}
                    >
                      {pillar.allocation} of content
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[#5a5450] font-[300] leading-relaxed">
                    {pillar.purpose}
                  </p>
                </div>
              </div>

              {/* Card body */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Formats */}
                <div>
                  <p className="text-[9px] tracking-[0.18em] uppercase text-[#b0a89e] mb-3">Formats</p>
                  <div className="flex flex-wrap gap-1.5">
                    {pillar.formats.map((f) => (
                      <span
                        key={f}
                        className="text-[11px] font-[300] px-2.5 py-1 rounded-md bg-[#F5F3EF] text-[#5a5450]"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Post ideas */}
                <div>
                  <p className="text-[9px] tracking-[0.18em] uppercase text-[#b0a89e] mb-3">Post ideas</p>
                  <ul className="space-y-1.5">
                    {pillar.ideas.map((idea) => (
                      <li key={idea} className="flex items-start gap-2 text-xs text-[#5a5450] font-[300] leading-relaxed">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-[#CDCAC4] shrink-0" />
                        {idea}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Caption tone */}
                <div>
                  <p className="text-[9px] tracking-[0.18em] uppercase text-[#b0a89e] mb-3">Caption tone</p>
                  <p className="text-xs text-[#5a5450] font-[300] leading-relaxed italic">
                    &ldquo;{pillar.caption_tone}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Strategist note */}
      <div className="border border-[#EDEBE6] rounded-xl p-6">
        <p className="text-[9px] tracking-[0.22em] uppercase text-[#b0a89e] mb-2">Strategist Note</p>
        <p className="text-sm text-[#1A1917] font-[300] leading-relaxed">
          These pillars aren&apos;t rigid boxes: they&apos;re a guide. If a piece of content spans two pillars, that&apos;s fine. What matters is that before you post anything, you can point to which pillar it serves and why it earns its place in your feed this month.
        </p>
      </div>
    </div>
  );
}
