"use client";

import { useState } from "react";

type Post = {
  id: string;
  title: string;
  publishDate: string | null;
  format: string;
  pillar: string;
  hook: string | null;
  cta: string | null;
  goal: string | null;
  inspoLink: string | null;
  status: string;
  liveUrl: string | null;
  views: number | null;
  likes: number | null;
  comments: number | null;
  saves: number | null;
  reach: number | null;
};

const FORMAT_LABEL: Record<string, string> = { reel: "Reel", carousel: "Carousel", static: "Static" };
const PILLAR_LABEL: Record<string, string> = {
  training: "Training", nutrition: "Nutrition", results: "Results", personal_brand: "Personal Brand",
};
const PILLAR_DOT: Record<string, string> = {
  training: "#1A1917", nutrition: "#6d675e", results: "#2D6A4F", personal_brand: "#9B2335",
};

function fmt(n: number | null) {
  if (n == null) return "—";
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}

function PostCard({ post }: { post: Post }) {
  const [open, setOpen] = useState(false);
  const posted = post.status === "posted";

  return (
    <div className={`border ${posted ? "border-[#D9D3C6]" : "border-dashed border-[#D9D3C6]"} bg-white`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left px-5 py-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <span
              className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: PILLAR_DOT[post.pillar] ?? "#1A1917" }}
            />
            <p className="text-sm text-[#1A1917] leading-snug">{post.title}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {posted ? (
              <span className="text-[9px] tracking-[0.14em] uppercase text-[#2D6A4F] bg-[#2D6A4F]/8 px-2 py-0.5">
                Posted
              </span>
            ) : (
              <span className="text-[9px] tracking-[0.14em] uppercase text-[#6d675e] px-2 py-0.5">
                To film
              </span>
            )}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#6d675e" strokeWidth="1.3"
              className={`transition-transform ${open ? "rotate-180" : ""}`}>
              <path d="M2 4l4 4 4-4" />
            </svg>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-2 ml-3.5 flex-wrap">
          <span className="text-[10px] text-[#6d675e]">{FORMAT_LABEL[post.format]}</span>
          <span className="text-[10px] text-[#6d675e]">{PILLAR_LABEL[post.pillar]}</span>
          {post.publishDate && (
            <span className="text-[10px] text-[#6d675e]">{formatDate(post.publishDate)}</span>
          )}
        </div>
      </button>

      {open && (
        <div className="border-t border-[#E6E2D9] px-5 py-4 space-y-4 bg-[#F7F5F0]">
          {post.hook && (
            <div>
              <p className="text-[9px] tracking-[0.2em] uppercase text-[#6d675e] mb-1">Hook</p>
              <p className="text-sm text-[#1A1917] italic leading-relaxed">&ldquo;{post.hook}&rdquo;</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            {post.cta && (
              <div>
                <p className="text-[9px] tracking-[0.2em] uppercase text-[#6d675e] mb-1">CTA</p>
                <p className="text-xs text-[#1A1917]">{post.cta}</p>
              </div>
            )}
            {post.goal && (
              <div>
                <p className="text-[9px] tracking-[0.2em] uppercase text-[#6d675e] mb-1">Goal</p>
                <p className="text-xs text-[#1A1917]">{post.goal}</p>
              </div>
            )}
          </div>
          {post.inspoLink && (
            <div>
              <p className="text-[9px] tracking-[0.2em] uppercase text-[#6d675e] mb-1">Inspo</p>
              <a href={post.inspoLink} target="_blank" rel="noopener noreferrer" className="text-xs text-[#1A1917] underline underline-offset-2">
                View reference
              </a>
            </div>
          )}
          {posted && (
            <div className="pt-2 border-t border-[#E6E2D9]">
              <p className="text-[9px] tracking-[0.2em] uppercase text-[#6d675e] mb-2">Metrics</p>
              <div className="grid grid-cols-5 gap-3">
                {(["reach", "views", "likes", "saves", "comments"] as const).map((m) => (
                  <div key={m}>
                    <p className="text-xs font-medium text-[#1A1917]">{fmt(post[m])}</p>
                    <p className="text-[9px] text-[#6d675e] uppercase tracking-[0.1em]">{m}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function PostsGrid({ posts }: { posts: Post[] }) {
  const [filter, setFilter] = useState<"all" | "posted" | "to_film">("all");
  const [pillar, setPillar] = useState<string>("all");

  const pillars = ["all", "training", "nutrition", "results", "personal_brand"] as const;
  const statuses = [
    { value: "all", label: "All" },
    { value: "posted", label: "Posted" },
    { value: "to_film", label: "To film" },
  ];

  const filtered = posts.filter((p) => {
    const statusMatch = filter === "all" || p.status === filter;
    const pillarMatch = pillar === "all" || p.pillar === pillar;
    return statusMatch && pillarMatch;
  });

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-1">
          {statuses.map((s) => (
            <button
              key={s.value}
              onClick={() => setFilter(s.value as typeof filter)}
              className={`px-3 py-1.5 text-[10px] tracking-[0.14em] uppercase transition-colors ${
                filter === s.value
                  ? "bg-[#1A1917] text-white"
                  : "text-[#6d675e] hover:text-[#1A1917] border border-[#D9D3C6]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {pillars.map((p) => (
            <button
              key={p}
              onClick={() => setPillar(p)}
              className={`px-3 py-1.5 text-[10px] tracking-[0.14em] uppercase transition-colors ${
                pillar === p
                  ? "bg-[#1A1917] text-white"
                  : "text-[#6d675e] hover:text-[#1A1917] border border-[#D9D3C6]"
              }`}
            >
              {p === "all" ? "All" : PILLAR_LABEL[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-px bg-[#D9D3C6]">
        {filtered.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-sm text-[#6d675e] py-6 text-center">No posts match the filter.</p>
      )}
    </div>
  );
}
