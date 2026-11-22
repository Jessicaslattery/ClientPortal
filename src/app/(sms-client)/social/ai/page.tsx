"use client";

import { useState } from "react";

type Tab = "create" | "vault" | "stories" | "coach" | "hook-lab" | "repurpose";

// ---- Create tab -----

const FORMAT_OPTIONS = ["Reel", "Carousel", "Static", "Story"];
const PILLAR_OPTIONS = ["Education & Tips", "Behind the Scenes", "Client Transformations", "Offers & Services", "Community & Connection"];
const AVAILABLE_TODAY = ["Phone only", "Gym", "Kitchen / home", "Car", "Outdoor", "No makeup day", "Client with me", "Team / crew"];

function CreateTab() {
  const [prompt, setPrompt] = useState("");
  const [format, setFormat] = useState("Reel");
  const [pillar, setPillar] = useState("Education & Tips");
  const [filmingKit, setFilmingKit] = useState<string[]>(["Phone only", "Kitchen / home"]);
  const [generated, setGenerated] = useState(false);
  const [teleprompter, setTeleprompter] = useState(false);
  const [generating, setGenerating] = useState(false);

  function toggleKit(item: string) {
    setFilmingKit((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  }

  function handleGenerate() {
    if (!prompt.trim()) return;
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 1600);
  }

  const DEMO_SCRIPT = {
    hooks: [
      "The reason my clients stop at week 3 has nothing to do with willpower.",
      "Week 3 is where most wellness programs fail their clients. Here's why.",
      "I used to think week 3 drop-off was a motivation problem. It's not.",
    ],
    body: "Here's what actually happens: the novelty wears off, life kicks back in, and suddenly the new habit is competing with everything else. The issue isn't your client's commitment: it's that the program hasn't been designed for real life. In week 3, your job isn't to push harder. It's to get curious. What's pulling their attention? What's feeling heavy? The clients who make it to week 12 are the ones whose coaches met them in week 3.",
    cta: "If you're in a program and week 3 feels hard: this is normal. DM me the word WEEK3 and I'll send you something that actually helps.",
    onScreenText: ["Week 3 is where most people quit", "It's not a motivation problem", "Here's what's really happening", "And how to get through it"],
    shotList: [
      { beat: "Hook (0-2s)", angle: "Talking head, tight crop", what: "Direct to camera. Hold eye contact. Say the first line slowly.", voiceOver: false },
      { beat: "Problem (3-8s)", angle: "Wide, natural light", what: "Walking and talking, or standing in kitchen. Casual, like you're talking to a friend.", voiceOver: false },
      { beat: "Insight (9-18s)", angle: "Close-up, steady", what: "Lean in slightly. This is the key point.", voiceOver: false },
      { beat: "Resolution (19-25s)", angle: "Over the shoulder, B-roll", what: "Client testimonial screenshot on phone, or notes/journal.", voiceOver: true },
      { beat: "CTA (26-30s)", angle: "Talking head", what: "Back to camera. Soft smile. Direct ask.", voiceOver: false },
    ],
  };

  if (teleprompter) {
    return (
      <div className="bg-[#1A1917] rounded-2xl p-6 min-h-[500px] flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <p className="text-white/50 text-[9px] tracking-[0.2em] uppercase">Teleprompter</p>
          <button
            onClick={() => setTeleprompter(false)}
            className="text-white/40 hover:text-white text-xs transition-colors"
          >
            Exit
          </button>
        </div>
        <div className="flex-1 space-y-6 overflow-y-auto">
          <p className="text-2xl text-white font-[200] leading-relaxed tracking-wide">
            {DEMO_SCRIPT.hooks[0]}
          </p>
          <div className="border-t border-white/10 pt-6">
            <p className="text-lg text-white/70 font-[200] leading-loose">
              {DEMO_SCRIPT.body}
            </p>
          </div>
          <div className="border-t border-white/10 pt-6">
            <p className="text-lg text-[#8C735A] font-[300] leading-loose">
              {DEMO_SCRIPT.cta}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="border border-[#EDEBE6] rounded-2xl p-5 space-y-4">
        <p className="text-[9px] tracking-[0.2em] uppercase text-[#b0a89e]">What do you want to talk about?</p>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={2}
          placeholder="e.g. Why my clients stop at week 3 of a program"
          className="w-full text-sm text-[#1A1917] font-[300] placeholder:text-[#CDCAC4] focus:outline-none resize-none"
        />
        <div className="flex gap-3 flex-wrap items-end justify-between border-t border-[#EDEBE6] pt-4">
          <div className="flex flex-wrap gap-2">
            {FORMAT_OPTIONS.map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`px-3 py-1.5 rounded-xl text-[11px] border transition-all ${
                  format === f ? "bg-[#1A1917] text-white border-[#1A1917]" : "text-[#6d675e] border-[#EDEBE6] hover:border-[#1A1917]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || generating}
            className="px-5 py-2.5 bg-[#1A1917] text-white text-xs rounded-xl hover:bg-[#2D2A26] disabled:opacity-40 transition-all"
          >
            {generating ? "Generating..." : "Generate script"}
          </button>
        </div>
      </div>

      {/* Filming kit */}
      <div className="border border-[#EDEBE6] rounded-2xl p-5">
        <p className="text-[9px] tracking-[0.2em] uppercase text-[#b0a89e] mb-3">What do you have available to film with today?</p>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_TODAY.map((item) => (
            <button
              key={item}
              onClick={() => toggleKit(item)}
              className={`px-3 py-1.5 rounded-xl text-[11px] border transition-all ${
                filmingKit.includes(item)
                  ? "bg-[#F5EFE5] text-[#8C735A] border-[#8C735A]40"
                  : "text-[#6d675e] border-[#EDEBE6] hover:border-[#CDCAC4]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        {filmingKit.length > 0 && (
          <p className="mt-3 text-xs text-[#b0a89e]">Shot list will be tailored to: {filmingKit.join(", ")}</p>
        )}
      </div>

      {/* Generated output */}
      {generated && (
        <div className="space-y-4">
          {/* Hooks */}
          <div className="border border-[#EDEBE6] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[9px] tracking-[0.2em] uppercase text-[#b0a89e]">Hook options (A/B test these)</p>
              <span className="text-[9px] text-[#2D6A4F] bg-[#E5F2EC] px-2 py-0.5 rounded-full">3 variants</span>
            </div>
            <div className="space-y-2">
              {DEMO_SCRIPT.hooks.map((hook, i) => (
                <div key={i} className="flex items-start gap-3 p-3 border border-[#EDEBE6] rounded-xl hover:border-[#CDCAC4] transition-colors group cursor-pointer">
                  <span className="text-[9px] text-[#b0a89e] mt-0.5 shrink-0">0{i + 1}</span>
                  <p className="text-sm text-[#1A1917] font-[300] leading-relaxed flex-1">{hook}</p>
                  <button className="shrink-0 opacity-0 group-hover:opacity-100 text-[10px] text-[#8C735A] transition-opacity">Use</button>
                </div>
              ))}
            </div>
          </div>

          {/* Script body */}
          <div className="border border-[#EDEBE6] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[9px] tracking-[0.2em] uppercase text-[#b0a89e]">Script</p>
              <button
                onClick={() => setTeleprompter(true)}
                className="text-[10px] text-[#8C735A] border border-[#8C735A]40 px-3 py-1 rounded-lg hover:bg-[#F5EFE5] transition-colors"
              >
                Open teleprompter
              </button>
            </div>
            <p className="text-sm text-[#1A1917] font-[300] leading-relaxed mb-4">{DEMO_SCRIPT.body}</p>
            <div className="bg-[#F5F1EB] rounded-xl p-3">
              <p className="text-[9px] tracking-[0.14em] uppercase text-[#8C735A] mb-1">Call to action</p>
              <p className="text-sm text-[#1A1917] font-[300] leading-relaxed">{DEMO_SCRIPT.cta}</p>
            </div>
          </div>

          {/* On-screen text */}
          <div className="border border-[#EDEBE6] rounded-2xl p-5">
            <p className="text-[9px] tracking-[0.2em] uppercase text-[#b0a89e] mb-3">On-screen text</p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_SCRIPT.onScreenText.map((t, i) => (
                <div key={i} className="bg-[#1A1917] rounded-xl px-4 py-3">
                  <p className="text-white text-xs font-[300] leading-snug">{t}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Shot list */}
          <div className="border border-[#EDEBE6] rounded-2xl p-5">
            <p className="text-[9px] tracking-[0.2em] uppercase text-[#b0a89e] mb-3">Shot list</p>
            <div className="space-y-2">
              {DEMO_SCRIPT.shotList.map((shot, i) => (
                <div key={i} className="grid grid-cols-[90px_1fr] gap-4 p-3 border border-[#EDEBE6] rounded-xl">
                  <div>
                    <p className="text-[10px] text-[#8C735A] font-[400]">{shot.beat}</p>
                    <p className="text-[10px] text-[#b0a89e] mt-0.5">{shot.angle}</p>
                    {shot.voiceOver && (
                      <span className="text-[9px] text-[#2D5F8A] bg-[#E5EEF7] px-1.5 py-0.5 rounded mt-1 inline-block">VO</span>
                    )}
                  </div>
                  <p className="text-xs text-[#5a5450] font-[300] leading-relaxed">{shot.what}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Proof Vault tab -----

const PROOF_ITEMS = [
  {
    id: "1",
    type: "testimonial",
    content: "Sophie, I had my first full night's sleep in 3 years last night and I actually cried. Thank you.",
    client: "Mel K.",
    date: "Nov 2026",
    pillar: "Education & Tips",
    objection: "I've tried everything",
    tags: ["sleep", "nervous system", "emotional"],
  },
  {
    id: "2",
    type: "result",
    content: "Lost 8kg in 4 months without tracking a single calorie. Just followed the foundations.",
    client: "Sarah T.",
    date: "Oct 2026",
    pillar: "Client Transformations",
    objection: "It won't work for me",
    tags: ["weight loss", "sustainable", "no tracking"],
  },
  {
    id: "3",
    type: "dm",
    content: "I signed up for the retreat before I even finished reading the sales page. I just knew.",
    client: "Anonymous",
    date: "Nov 2026",
    pillar: "Offers & Services",
    objection: "I need to think about it",
    tags: ["retreat", "quick decision", "trust"],
  },
  {
    id: "4",
    type: "result",
    content: "Back at the gym 3x a week for the first time in 5 years. It doesn't feel like punishment anymore.",
    client: "Jess W.",
    date: "Sep 2026",
    pillar: "Client Transformations",
    objection: "I hate exercise",
    tags: ["gym", "movement", "mindset shift"],
  },
];

const TYPE_CONFIG = {
  testimonial: { label: "Testimonial", color: "#2D5F8A", bg: "#E5EEF7" },
  result:      { label: "Result",      color: "#2D6A4F", bg: "#E5F2EC" },
  dm:          { label: "DM",          color: "#8C735A", bg: "#F5EFE5" },
  screenshot:  { label: "Screenshot",  color: "#7B746B", bg: "#F5F1EB" },
};

function VaultTab() {
  const [filter, setFilter] = useState<string>("all");
  const filtered = filter === "all" ? PROOF_ITEMS : PROOF_ITEMS.filter((p) => p.type === filter);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {["all", "testimonial", "result", "dm"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-[11px] border capitalize transition-all ${
                filter === f ? "bg-[#1A1917] text-white border-[#1A1917]" : "text-[#6d675e] border-[#EDEBE6] hover:border-[#CDCAC4]"
              }`}
            >
              {f === "all" ? "All" : TYPE_CONFIG[f as keyof typeof TYPE_CONFIG]?.label}
            </button>
          ))}
        </div>
        <button className="text-xs text-[#8C735A] border border-[#8C735A]40 px-3 py-1.5 rounded-xl hover:bg-[#F5EFE5] transition-colors">
          + Add proof
        </button>
      </div>
      <div className="space-y-3">
        {filtered.map((item) => {
          const tc = TYPE_CONFIG[item.type as keyof typeof TYPE_CONFIG];
          return (
            <div key={item.id} className="border border-[#EDEBE6] rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className="text-[9px] tracking-[0.14em] uppercase px-2 py-0.5 rounded-full" style={{ color: tc.color, background: tc.bg }}>
                  {tc.label}
                </span>
                <span className="text-[10px] text-[#b0a89e] shrink-0">{item.date}</span>
              </div>
              <p className="text-sm text-[#1A1917] font-[300] leading-relaxed mb-3 italic">&ldquo;{item.content}&rdquo;</p>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[10px] text-[#7a7268]">{item.client}</span>
                <span className="text-[10px] text-[#b0a89e]">Objection: {item.objection}</span>
                <div className="flex gap-1 ml-auto">
                  {item.tags.map((t) => (
                    <span key={t} className="text-[9px] text-[#b0a89e] bg-[#F5F3EF] px-2 py-0.5 rounded">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- Story Bank tab -----

const STORY_BANK_ITEMS = [
  {
    id: "1",
    title: "The burnout",
    summary: "I was running the studio, raising two kids, and trying to be perfect at everything. At 32, my body said no. I ended up in bed for three months.",
    lastUsed: "Nov 2026",
    timesUsed: 4,
    formats: ["Reel", "Caption"],
    tags: ["origin story", "burnout", "vulnerability"],
  },
  {
    id: "2",
    title: "First client cry",
    summary: "My first client called me after her session and just sobbed. Not because anything was wrong. Because for the first time in years, something felt right.",
    lastUsed: "Oct 2026",
    timesUsed: 2,
    formats: ["Story", "Caption"],
    tags: ["client story", "emotional", "why I do this"],
  },
  {
    id: "3",
    title: "Mel's sleep",
    summary: "Mel slept a full night for the first time in 3 years. She texted me at 7am just to say thank you. That's the whole thing.",
    lastUsed: "Sep 2026",
    timesUsed: 1,
    formats: ["Reel"],
    tags: ["client result", "proof", "nervous system"],
  },
  {
    id: "4",
    title: "Why I became a wellness coach (not a fitness coach)",
    summary: "The shift from fitness to wellness wasn't a business pivot. It was realising the body keeps score of everything we're not saying.",
    lastUsed: null,
    timesUsed: 0,
    formats: ["Reel", "Carousel"],
    tags: ["brand story", "niche", "turning point"],
  },
];

function StoriesTab() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#7a7268] font-[300]">Personal stories, logged once, rotated into content. Never overused.</p>
        <button className="text-xs text-[#8C735A] border border-[#8C735A]40 px-3 py-1.5 rounded-xl hover:bg-[#F5EFE5] transition-colors">
          + Log a story
        </button>
      </div>
      <div className="space-y-3">
        {STORY_BANK_ITEMS.map((story) => (
          <div key={story.id} className="border border-[#EDEBE6] rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="text-sm font-[300] text-[#1A1917]">{story.title}</p>
              <div className="flex items-center gap-2 shrink-0">
                {story.timesUsed === 0 && (
                  <span className="text-[9px] text-[#2D5F8A] bg-[#E5EEF7] px-2 py-0.5 rounded-full">Never used</span>
                )}
                {story.lastUsed && (
                  <span className="text-[9px] text-[#b0a89e]">Last used {story.lastUsed}</span>
                )}
              </div>
            </div>
            <p className="text-xs text-[#5a5450] font-[300] leading-relaxed mb-3">{story.summary}</p>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex gap-1">
                {story.formats.map((f) => (
                  <span key={f} className="text-[9px] text-[#6d675e] bg-[#F5F3EF] px-2 py-0.5 rounded">{f}</span>
                ))}
              </div>
              <div className="flex gap-1 ml-auto">
                {story.tags.map((t) => (
                  <span key={t} className="text-[9px] text-[#b0a89e]">#{t.replace(/ /g, "-")}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Coach tab -----

function CoachTab() {
  return (
    <div className="space-y-5">
      {/* Weekly note */}
      <div className="border border-[#1A1917] rounded-2xl overflow-hidden">
        <div className="bg-[#1A1917] px-5 py-4">
          <p className="text-[9px] tracking-[0.2em] uppercase text-white/50">Weekly AI coach note</p>
          <p className="text-white font-[200] mt-0.5">Week of 17 November 2026</p>
        </div>
        <div className="px-5 py-5 space-y-4">
          <div>
            <p className="text-[9px] tracking-[0.14em] uppercase text-[#2D6A4F] mb-1.5">What worked</p>
            <p className="text-sm text-[#1A1917] font-[300] leading-relaxed">Your talking-head reel on Wednesday hit 4,200 views: 3x your weekly average. The hook was personal and specific, which is exactly what your audience responds to. Your story engagement rate was 68%, well above the 40% benchmark.</p>
          </div>
          <div>
            <p className="text-[9px] tracking-[0.14em] uppercase text-[#9B4F2A] mb-1.5">What to adjust</p>
            <p className="text-sm text-[#1A1917] font-[300] leading-relaxed">Your carousel on Tuesday had a low save rate (12 saves vs your usual 40+). The topic was strong but the hook slide was vague. Lead with the result, not the concept.</p>
          </div>
          <div>
            <p className="text-[9px] tracking-[0.14em] uppercase text-[#2D5F8A] mb-1.5">This week: 3 reels to film</p>
            <ul className="space-y-2">
              {[
                "The moment I knew the program was working (personal story format)",
                "3 things your body does when it's depleted (education reel, hook with a list)",
                "Client message reaction: the nervous system sleep win (proof reel)",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#1A1917] font-[300]">
                  <span className="text-[#b0a89e] shrink-0 mt-0.5">{i + 1}.</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Pillar balance */}
      <div className="border border-[#EDEBE6] rounded-2xl p-5">
        <p className="text-[9px] tracking-[0.2em] uppercase text-[#b0a89e] mb-4">Pillar balance this month</p>
        <div className="space-y-3">
          {[
            { label: "Education & Tips",       pct: 42, target: 30, color: "#2D5F8A" },
            { label: "Behind the Scenes",      pct: 25, target: 20, color: "#8C735A" },
            { label: "Client Transformations", pct: 17, target: 20, color: "#2D6A4F" },
            { label: "Offers & Services",      pct: 8,  target: 15, color: "#9B4F2A" },
            { label: "Community & Connection", pct: 8,  target: 15, color: "#7B746B" },
          ].map((p) => (
            <div key={p.label}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-[#1A1917] font-[300]">{p.label}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#b0a89e]">target {p.target}%</span>
                  <span className="text-[10px] font-[400]" style={{ color: p.pct > p.target + 5 ? "#9B4F2A" : p.pct < p.target - 5 ? "#2D5F8A" : "#2D6A4F" }}>
                    {p.pct}%
                  </span>
                </div>
              </div>
              <div className="relative h-2 bg-[#EDEBE6] rounded-full overflow-visible">
                <div className="h-full rounded-full" style={{ width: `${p.pct}%`, background: p.color }} />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-px h-4 bg-[#1A1917]/30"
                  style={{ left: `${p.target}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-[#9B4F2A] font-[300]">
          Education content is running heavy this month. You need 2 more Offers and 2 more Community posts before December.
        </p>
      </div>

      {/* Content debt meter */}
      <div className="border border-[#EDEBE6] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[9px] tracking-[0.2em] uppercase text-[#b0a89e]">Content bank</p>
          <span className="text-[9px] text-[#2D6A4F] bg-[#E5F2EC] px-2 py-0.5 rounded-full">Healthy</span>
        </div>
        <div className="flex items-end gap-1 mb-3">
          {Array.from({ length: 14 }, (_, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm transition-all"
              style={{
                height: `${16 + (i < 8 ? i * 3 : (13 - i) * 3)}px`,
                background: i < 5 ? "#2D6A4F" : i < 8 ? "#8C735A" : "#EDEBE6",
                opacity: i >= 8 ? 0.5 : 1,
              }}
            />
          ))}
        </div>
        <div className="flex items-center justify-between text-[10px] text-[#b0a89e]">
          <span>8 posts banked</span>
          <span>14 days needed</span>
        </div>
        <div className="mt-3 h-2 bg-[#EDEBE6] rounded-full overflow-hidden">
          <div className="h-full bg-[#2D6A4F] rounded-full" style={{ width: "57%" }} />
        </div>
        <p className="mt-2 text-xs text-[#5a5450] font-[300]">You have 8 days of content banked. At 4 posts/week you need to film 6 more before the end of the month to stay ahead.</p>
      </div>

      {/* Plain-language insight */}
      <div className="border border-[#EDEBE6] rounded-2xl p-5">
        <p className="text-[9px] tracking-[0.2em] uppercase text-[#b0a89e] mb-3">Plain-English insights</p>
        <div className="space-y-3">
          {[
            { insight: "Your talking-head reels about mindset get 3x more saves than gym clips. Post 2 more this week.", type: "win" },
            { insight: "Posts published on Wednesday get 40% more reach than Monday posts. Shift your anchor post to Wednesday.", type: "win" },
            { insight: "Your carousel engagement drops sharply when the hook slide is text-only. Add a face photo to the first slide.", type: "fix" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-[#F5F3EF] rounded-xl">
              <span className={`shrink-0 mt-0.5 text-sm ${item.type === "win" ? "text-[#2D6A4F]" : "text-[#9B4F2A]"}`}>
                {item.type === "win" ? "+" : "!"}
              </span>
              <p className="text-xs text-[#1A1917] font-[300] leading-relaxed">{item.insight}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- Hook Lab tab -----

const HOOK_RESULTS = [
  { style: "Personal story", example: "The moment I realised I was the reason my clients weren't getting results.", score: 92, wins: 4 },
  { style: "Bold claim",     example: "Most wellness programs fail their clients in week 3. Here's why.",            score: 88, wins: 3 },
  { style: "Direct question", example: "What would your life look like if you stopped forcing your body to perform?", score: 71, wins: 1 },
  { style: "Stat / number",  example: "I've worked with 60+ women. 90% of them weren't eating enough.",             score: 65, wins: 1 },
  { style: "Controversy",    example: "Rest is not laziness. The wellness industry lied to you.",                   score: 83, wins: 2 },
];

function HookLabTab() {
  const [prompt, setPrompt] = useState("");

  return (
    <div className="space-y-5">
      {/* Generator */}
      <div className="border border-[#EDEBE6] rounded-2xl p-5">
        <p className="text-[9px] tracking-[0.2em] uppercase text-[#b0a89e] mb-3">Generate 5 hooks</p>
        <div className="flex gap-3">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Topic or key message..."
            className="flex-1 border border-[#EDEBE6] rounded-xl px-4 py-2.5 text-sm text-[#1A1917] font-[300] placeholder:text-[#CDCAC4] focus:outline-none focus:border-[#8C735A] transition-colors"
          />
          <button className="px-5 py-2.5 bg-[#1A1917] text-white text-xs rounded-xl hover:bg-[#2D2A26] transition-colors">
            Generate
          </button>
        </div>
      </div>

      {/* Hook performance breakdown */}
      <div className="border border-[#EDEBE6] rounded-2xl p-5">
        <p className="text-[9px] tracking-[0.2em] uppercase text-[#b0a89e] mb-4">Your hook performance by style</p>
        <div className="space-y-3">
          {[...HOOK_RESULTS].sort((a, b) => b.score - a.score).map((h, i) => (
            <div key={i} className="border border-[#EDEBE6] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-[#1A1917] font-[400]">{h.style}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#b0a89e]">{h.wins} wins</span>
                  <span
                    className="text-[11px] font-[400] px-2 py-0.5 rounded-full"
                    style={{ color: h.score >= 85 ? "#2D6A4F" : h.score >= 70 ? "#8C735A" : "#7B746B",
                             background: h.score >= 85 ? "#E5F2EC" : h.score >= 70 ? "#F5EFE5" : "#F5F1EB" }}
                  >
                    {h.score}
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#5a5450] font-[300] leading-relaxed italic">&ldquo;{h.example}&rdquo;</p>
              <div className="mt-2 h-1 bg-[#EDEBE6] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${h.score}%`, background: h.score >= 85 ? "#2D6A4F" : h.score >= 70 ? "#8C735A" : "#CDCAC4" }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-[#5a5450] font-[300]">
          Personal story hooks are your strongest format. Lead with them when you want reach. Bold claims perform well for saves.
        </p>
      </div>
    </div>
  );
}

// ---- Repurpose tab -----

function RepurposeTab() {
  const [selected, setSelected] = useState<string | null>(null);
  const [generated, setGenerated] = useState(false);

  const TOP_POSTS = [
    { id: "1", title: "The reason my clients stop at week 3", format: "Reel", views: 4200, saves: 187 },
    { id: "2", title: "What burnout actually feels like in the body", format: "Reel", views: 3100, saves: 143 },
    { id: "3", title: "5 signs your nervous system is in survival mode", format: "Carousel", views: 2800, saves: 310 },
  ];

  return (
    <div className="space-y-5">
      <p className="text-xs text-[#7a7268] font-[300]">Pick a top-performing post and turn it into 5 more pieces of content in one click.</p>

      <div className="space-y-2">
        {TOP_POSTS.map((post) => (
          <button
            key={post.id}
            onClick={() => { setSelected(post.id); setGenerated(false); }}
            className={`w-full text-left border rounded-2xl p-4 transition-all ${
              selected === post.id ? "border-[#1A1917] bg-white" : "border-[#EDEBE6] hover:border-[#CDCAC4]"
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#1A1917] font-[300]">{post.title}</p>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[10px] text-[#b0a89e]">{post.views.toLocaleString()} views</span>
                <span className="text-[10px] text-[#8C735A]">{post.saves} saves</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {selected && !generated && (
        <button
          onClick={() => setGenerated(true)}
          className="w-full py-3 bg-[#1A1917] text-white text-sm rounded-xl hover:bg-[#2D2A26] transition-colors"
        >
          Repurpose this post
        </button>
      )}

      {generated && (
        <div className="space-y-3">
          {[
            { label: "New hook version",    desc: "Same body, 3 fresh hooks to A/B test",                             format: "Reel" },
            { label: "Carousel version",    desc: "5-slide carousel: hook slide + each point as its own slide",        format: "Carousel" },
            { label: "Story sequence",      desc: "7-slide story: teaser, 3 key points, poll, CTA, reply prompt",      format: "Story" },
            { label: "Caption post",        desc: "Long-form caption with hook, story, insight and CTA",               format: "Static" },
            { label: "Email newsletter",    desc: "250-word email version for your list with subject line options",     format: "Email" },
          ].map((item, i) => (
            <div key={i} className="border border-[#EDEBE6] rounded-2xl p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-[#1A1917] font-[300]">{item.label}</p>
                <p className="text-xs text-[#7a7268] font-[300] mt-0.5">{item.desc}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[9px] text-[#6d675e] border border-[#EDEBE6] px-2 py-0.5 rounded">{item.format}</span>
                <button className="text-[11px] text-[#8C735A] border border-[#8C735A]40 px-3 py-1 rounded-lg hover:bg-[#F5EFE5] transition-colors">
                  Generate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Main page -----

const TABS: { id: Tab; label: string }[] = [
  { id: "create",    label: "Create" },
  { id: "vault",     label: "Proof Vault" },
  { id: "stories",   label: "Story Bank" },
  { id: "coach",     label: "Coach" },
  { id: "hook-lab",  label: "Hook Lab" },
  { id: "repurpose", label: "Repurpose" },
];

export default function AIAssistantPage() {
  const [tab, setTab] = useState<Tab>("create");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-[9px] tracking-[0.22em] uppercase text-[#b0a89e]">AI-powered tools</p>
        <h1 className="mt-1 text-3xl font-[200] text-[#1A1917] tracking-tight">AI Assistant</h1>
        <p className="mt-2 text-sm text-[#7a7268] font-[300] leading-relaxed max-w-xl">
          Every tool here is trained on your brand, your voice and your proof. Nothing sounds like generic AI.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#EDEBE6] overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-xs whitespace-nowrap transition-all border-b-2 -mb-px ${
              tab === t.id
                ? "border-[#1A1917] text-[#1A1917] font-[400]"
                : "border-transparent text-[#7B746B] hover:text-[#1A1917]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "create"    && <CreateTab />}
      {tab === "vault"     && <VaultTab />}
      {tab === "stories"   && <StoriesTab />}
      {tab === "coach"     && <CoachTab />}
      {tab === "hook-lab"  && <HookLabTab />}
      {tab === "repurpose" && <RepurposeTab />}
    </div>
  );
}
