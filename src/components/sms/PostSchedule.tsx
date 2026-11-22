"use client";

import { useState } from "react";

export type PostLink = {
  label: string;
  url: string;
};

export type PostItem = {
  id: string;
  title: string;
  caption: string;
  date: string; // YYYY-MM-DD
  format: "reel" | "carousel" | "static" | "story";
  pillar: string;
  status: "posted" | "scheduled" | "draft";
  likes?: number;
  saves?: number;
  reach?: number;
  color: string;
  notes?: string;
  links?: PostLink[];
};

type View = "calendar" | "list" | "feed";

const FORMAT_OPTIONS: { value: PostItem["format"]; label: string }[] = [
  { value: "reel",     label: "Reel" },
  { value: "carousel", label: "Carousel" },
  { value: "static",   label: "Static" },
  { value: "story",    label: "Story" },
];

const PILLAR_OPTIONS = [
  "Education & Tips",
  "Behind the Scenes",
  "Client Transformations",
  "Offers & Services",
  "Community & Connection",
  "Education",
  "Social Proof",
  "Promo",
  "Entertainment",
  "Personal Brand",
];

const STATUS_OPTIONS: { value: PostItem["status"]; label: string; color: string; bg: string }[] = [
  { value: "draft",     label: "Draft",     color: "#7B746B", bg: "#F5F1EB" },
  { value: "scheduled", label: "Scheduled", color: "#8C735A", bg: "#F5EFE5" },
  { value: "posted",    label: "Posted",    color: "#2D6A4F", bg: "#E5F2EC" },
];

const FORMAT_LABELS: Record<PostItem["format"], string> = {
  reel: "Reel", carousel: "Carousel", static: "Static", story: "Story",
};

const STATUS_CONFIG = {
  posted:    { label: "Posted",    color: "#2D6A4F", bg: "#E5F2EC" },
  scheduled: { label: "Scheduled", color: "#8C735A", bg: "#F5EFE5" },
  draft:     { label: "Draft",     color: "#7B746B", bg: "#F5F1EB" },
};

const PILLAR_COLORS: Record<string, string> = {
  "Education":              "#2D5F8A",
  "Education & Tips":       "#2D5F8A",
  "Behind the Scenes":      "#8C735A",
  "Social Proof":           "#2D6A4F",
  "Client Transformations": "#2D6A4F",
  "Promo":                  "#9B4F2A",
  "Offers & Services":      "#9B4F2A",
  "Entertainment":          "#5A3B7A",
  "Community & Connection": "#5A3B7A",
  "Personal Brand":         "#7B746B",
};

// ─── Edit Drawer ─────────────────────────────────────────────────────────────

function EditDrawer({
  post,
  onClose,
  onChange,
}: {
  post: PostItem;
  onClose: () => void;
  onChange: (updated: PostItem) => void;
}) {
  const [form, setForm] = useState<PostItem>({ ...post });
  const [saved, setSaved] = useState(false);

  function set<K extends keyof PostItem>(key: K, value: PostItem[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    onChange(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  const sc = STATUS_CONFIG[form.status];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#EDEBE6]">
          <div>
            <p className="text-[9px] tracking-[0.2em] uppercase text-[#b0a89e]">Edit Post</p>
            <p className="text-sm text-[#1A1917] font-[300] mt-0.5 truncate max-w-[260px]">{form.title || "Untitled"}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F5F3EF] text-[#7B746B] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 2l10 10M12 2L2 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Status */}
          <div>
            <p className="text-[9px] tracking-[0.18em] uppercase text-[#b0a89e] mb-2">Status</p>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => set("status", opt.value)}
                  className="px-3 py-1.5 rounded-full text-[11px] font-[400] transition-all border"
                  style={
                    form.status === opt.value
                      ? { background: opt.bg, color: opt.color, borderColor: opt.color + "60" }
                      : { background: "transparent", color: "#7B746B", borderColor: "#EDEBE6" }
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-[9px] tracking-[0.18em] uppercase text-[#b0a89e] mb-2">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              className="w-full border border-[#EDEBE6] rounded-xl px-4 py-2.5 text-sm text-[#1A1917] font-[300] focus:outline-none focus:border-[#8C735A] transition-colors"
            />
          </div>

          {/* Post topic */}
          <div>
            <label className="block text-[9px] tracking-[0.18em] uppercase text-[#b0a89e] mb-2">Post topic</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Morning routine reel"
              className="w-full border border-[#EDEBE6] rounded-xl px-4 py-2.5 text-sm text-[#1A1917] font-[300] placeholder:text-[#CDCAC4] focus:outline-none focus:border-[#8C735A] transition-colors"
            />
          </div>

          {/* Hook / caption */}
          <div>
            <label className="block text-[9px] tracking-[0.18em] uppercase text-[#b0a89e] mb-2">Hook / caption</label>
            <textarea
              value={form.caption}
              onChange={(e) => set("caption", e.target.value)}
              rows={4}
              placeholder="Opening line or caption copy..."
              className="w-full border border-[#EDEBE6] rounded-xl px-4 py-2.5 text-sm text-[#1A1917] font-[300] placeholder:text-[#CDCAC4] focus:outline-none focus:border-[#8C735A] transition-colors resize-none"
            />
          </div>

          {/* Format */}
          <div>
            <p className="text-[9px] tracking-[0.18em] uppercase text-[#b0a89e] mb-2">Format</p>
            <div className="flex gap-2 flex-wrap">
              {FORMAT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => set("format", opt.value)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-[400] border transition-all ${
                    form.format === opt.value
                      ? "bg-[#1A1917] text-white border-[#1A1917]"
                      : "text-[#6d675e] border-[#EDEBE6] hover:border-[#1A1917] hover:text-[#1A1917]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pillar */}
          <div>
            <p className="text-[9px] tracking-[0.18em] uppercase text-[#b0a89e] mb-2">Pillar</p>
            <div className="flex flex-wrap gap-2">
              {PILLAR_OPTIONS.map((p) => {
                const pc = PILLAR_COLORS[p] ?? "#7B746B";
                const active = form.pillar === p;
                return (
                  <button
                    key={p}
                    onClick={() => set("pillar", p)}
                    className="px-3 py-1.5 rounded-xl text-[11px] font-[400] border transition-all"
                    style={
                      active
                        ? { background: pc + "20", color: pc, borderColor: pc + "60" }
                        : { background: "transparent", color: "#7B746B", borderColor: "#EDEBE6" }
                    }
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[9px] tracking-[0.18em] uppercase text-[#b0a89e] mb-2">Notes</label>
            <textarea
              value={form.notes ?? ""}
              onChange={(e) => set("notes", e.target.value)}
              rows={3}
              placeholder="Any extra context, instructions, or ideas for this post..."
              className="w-full border border-[#EDEBE6] rounded-xl px-4 py-2.5 text-sm text-[#1A1917] font-[300] placeholder:text-[#CDCAC4] focus:outline-none focus:border-[#8C735A] transition-colors resize-none"
            />
          </div>

          {/* Links */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] tracking-[0.18em] uppercase text-[#b0a89e]">Links</p>
              <button
                onClick={() => set("links", [...(form.links ?? []), { label: "", url: "" }])}
                className="flex items-center gap-1 text-[10px] text-[#8C735A] hover:text-[#6B5240] transition-colors"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M5 1v8M1 5h8" />
                </svg>
                Add link
              </button>
            </div>
            {(form.links ?? []).length === 0 ? (
              <p className="text-xs text-[#CDCAC4] font-[300]">No links yet: add a Canva file, live post URL, Dropbox folder, etc.</p>
            ) : (
              <div className="space-y-2">
                {(form.links ?? []).map((link, idx) => (
                  <div key={idx} className="flex gap-2 items-start">
                    <div className="flex-1 grid grid-cols-[100px_1fr] gap-2">
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) => {
                          const updated = [...(form.links ?? [])];
                          updated[idx] = { ...updated[idx], label: e.target.value };
                          set("links", updated);
                        }}
                        placeholder="Label"
                        className="border border-[#EDEBE6] rounded-lg px-3 py-2 text-xs text-[#1A1917] font-[300] placeholder:text-[#CDCAC4] focus:outline-none focus:border-[#8C735A] transition-colors"
                      />
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => {
                          const updated = [...(form.links ?? [])];
                          updated[idx] = { ...updated[idx], url: e.target.value };
                          set("links", updated);
                        }}
                        placeholder="https://..."
                        className="border border-[#EDEBE6] rounded-lg px-3 py-2 text-xs text-[#1A1917] font-[300] placeholder:text-[#CDCAC4] focus:outline-none focus:border-[#8C735A] transition-colors"
                      />
                    </div>
                    <div className="flex gap-1 pt-1.5">
                      {link.url && (
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#EDEBE6] text-[#8C735A] hover:border-[#8C735A] transition-colors"
                          title="Open link"
                        >
                          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4">
                            <path d="M5 2H2a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V7" />
                            <path d="M8 1h3v3M11 1L6 6" />
                          </svg>
                        </a>
                      )}
                      <button
                        onClick={() => {
                          const updated = (form.links ?? []).filter((_, i) => i !== idx);
                          set("links", updated);
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#EDEBE6] text-[#CDCAC4] hover:border-red-200 hover:text-red-400 transition-colors"
                        title="Remove link"
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M2 2l6 6M8 2L2 8" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Posted stats (read-only if posted) */}
          {form.status === "posted" && (form.reach || form.likes || form.saves) && (
            <div>
              <p className="text-[9px] tracking-[0.18em] uppercase text-[#b0a89e] mb-3">Performance</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Reach",  value: form.reach },
                  { label: "Likes",  value: form.likes },
                  { label: "Saves",  value: form.saves },
                ].map(({ label, value }) => value != null && (
                  <div key={label} className="border border-[#EDEBE6] rounded-xl p-3 text-center">
                    <p className="text-[9px] tracking-[0.14em] uppercase text-[#b0a89e]">{label}</p>
                    <p className="text-lg font-[200] text-[#1A1917] mt-0.5">{value.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#EDEBE6] flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-[#7B746B] hover:text-[#1A1917] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={`px-6 py-2.5 rounded-xl text-sm font-[400] transition-all ${
              saved
                ? "bg-[#2D6A4F] text-white"
                : "bg-[#1A1917] text-white hover:bg-[#2D2A26]"
            }`}
          >
            {saved ? "Saved ✓" : "Save changes"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Calendar view ───────────────────────────────────────────────────────────

function CalendarView({
  posts,
  month,
  onEdit,
}: {
  posts: PostItem[];
  month: string;
  onEdit: (post: PostItem) => void;
}) {
  const [year, mon] = month.split("-").map(Number);
  const firstDay = new Date(year, mon - 1, 1).getDay();
  const daysInMonth = new Date(year, mon, 0).getDate();
  const startOffset = (firstDay + 6) % 7;

  const postsByDate: Record<string, PostItem[]> = {};
  posts.forEach((p) => {
    if (!postsByDate[p.date]) postsByDate[p.date] = [];
    postsByDate[p.date].push(p);
  });

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div>
      <div className="grid grid-cols-7 mb-2">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="text-[9px] tracking-[0.18em] uppercase text-[#b0a89e] text-center py-2">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 border-l border-t border-[#EDEBE6]">
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="border-r border-b border-[#EDEBE6] min-h-[90px]" />
        ))}
        {days.map((day) => {
          const dateKey = `${month}-${String(day).padStart(2, "0")}`;
          const dayPosts = postsByDate[dateKey] ?? [];
          const isToday = dateKey === new Date().toISOString().slice(0, 10);
          return (
            <div key={day} className="border-r border-b border-[#EDEBE6] min-h-[90px] p-1.5">
              <span className={`text-[11px] font-[300] mb-1 inline-flex w-5 h-5 items-center justify-center ${
                isToday ? "bg-[#1A1917] text-white rounded-full" : "text-[#7B746B]"
              }`}>{day}</span>
              <div className="space-y-0.5">
                {dayPosts.slice(0, 3).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onEdit(p)}
                    className="w-full text-left rounded px-1.5 py-0.5 text-[9px] leading-tight truncate transition-opacity hover:opacity-70 cursor-pointer"
                    style={{ background: p.color + "22", color: p.color }}
                  >
                    {p.title}
                  </button>
                ))}
                {dayPosts.length > 3 && (
                  <div className="text-[9px] text-[#b0a89e] pl-1">+{dayPosts.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── List view ───────────────────────────────────────────────────────────────

function ListView({ posts, onEdit }: { posts: PostItem[]; onEdit: (post: PostItem) => void }) {
  return (
    <div className="border border-[#EDEBE6] rounded-xl overflow-hidden">
      <div className="grid grid-cols-[1fr_100px_90px_80px_90px_32px] gap-4 px-5 py-3 bg-[#F5F3EF] border-b border-[#EDEBE6]">
        {["Post", "Date", "Format", "Pillar", "Status", ""].map((h, i) => (
          <p key={i} className="text-[9px] tracking-[0.18em] uppercase text-[#b0a89e]">{h}</p>
        ))}
      </div>
      {posts.map((post, i) => {
        const sc = STATUS_CONFIG[post.status];
        const pc = PILLAR_COLORS[post.pillar] ?? "#7B746B";
        return (
          <div
            key={post.id}
            onClick={() => onEdit(post)}
            className={`grid grid-cols-[1fr_100px_90px_80px_90px_32px] gap-4 px-5 py-4 items-center hover:bg-[#F5F3EF]/60 transition-colors cursor-pointer group ${
              i > 0 ? "border-t border-[#EDEBE6]" : ""
            }`}
          >
            <div className="min-w-0">
              <p className="text-sm text-[#1A1917] truncate font-[300] group-hover:text-[#8C735A] transition-colors">{post.title}</p>
              <p className="text-xs text-[#b0a89e] truncate mt-0.5">{post.caption}</p>
            </div>
            <p className="text-xs text-[#6d675e] font-[300]">
              {new Date(post.date + "T00:00:00").toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
            </p>
            <span className="text-[10px] tracking-[0.08em] uppercase text-[#6d675e] border border-[#EDEBE6] rounded px-2 py-0.5 w-fit">
              {FORMAT_LABELS[post.format]}
            </span>
            <span className="text-[10px]" style={{ color: pc }}>{post.pillar}</span>
            <span
              className="text-[10px] tracking-[0.08em] uppercase px-2 py-0.5 rounded w-fit"
              style={{ color: sc.color, background: sc.bg }}
            >
              {sc.label}
            </span>
            {/* Edit icon */}
            <span className="text-[#CDCAC4] group-hover:text-[#8C735A] transition-colors">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3">
                <path d="M9.5 2.5l2 2-7 7H2.5v-2l7-7z" />
              </svg>
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Feed view ───────────────────────────────────────────────────────────────

function FeedView({ posts, onEdit }: { posts: PostItem[]; onEdit: (post: PostItem) => void }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const grid = [...posts].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      <p className="text-xs text-[#b0a89e] mb-4">Feed preview: ordered by publish date. Click any post to edit.</p>
      <div className="grid grid-cols-3 gap-1">
        {grid.map((post) => (
          <div
            key={post.id}
            className="relative aspect-square cursor-pointer"
            onClick={() => onEdit(post)}
            onMouseEnter={() => setHovered(post.id)}
            onMouseLeave={() => setHovered(null)}
          >
            <div
              className="w-full h-full rounded-sm flex items-end p-2"
              style={{ background: `${post.color}18`, border: `1px solid ${post.color}30` }}
            >
              <span
                className="text-[9px] tracking-[0.08em] uppercase px-1.5 py-0.5 rounded"
                style={{ background: post.color + "22", color: post.color }}
              >
                {FORMAT_LABELS[post.format]}
              </span>
            </div>
            {hovered === post.id && (
              <div className="absolute inset-0 bg-[#1A1917]/80 rounded-sm flex flex-col justify-end p-3">
                <p className="text-white text-[11px] font-[300] leading-tight line-clamp-2">{post.title}</p>
                <p className="text-white/60 text-[9px] mt-1">
                  {new Date(post.date + "T00:00:00").toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                </p>
                {post.status === "posted" && (
                  <div className="flex gap-3 mt-2">
                    {post.reach && <span className="text-white/70 text-[9px]">{post.reach.toLocaleString()} reach</span>}
                    {post.likes && <span className="text-white/70 text-[9px]">♥ {post.likes}</span>}
                    {post.saves && <span className="text-white/70 text-[9px]">⬆ {post.saves}</span>}
                  </div>
                )}
                <p className="text-white/40 text-[9px] mt-1.5">Click to edit</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function PostSchedule({ posts: initialPosts, month }: { posts: PostItem[]; month: string }) {
  const [view, setView] = useState<View>("calendar");
  const [posts, setPosts] = useState<PostItem[]>(initialPosts);
  const [editing, setEditing] = useState<PostItem | null>(null);

  function handleChange(updated: PostItem) {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setEditing(updated);
  }

  const posted = posts.filter((p) => p.status === "posted").length;
  const scheduled = posts.filter((p) => p.status === "scheduled").length;
  const drafts = posts.filter((p) => p.status === "draft").length;

  return (
    <div className="space-y-6">
      {/* Stats + view toggle */}
      <div className="flex items-end justify-between">
        <div className="flex gap-6">
          {[
            { label: "Total",     value: posts.length },
            { label: "Posted",    value: posted,    color: "#2D6A4F" },
            { label: "Scheduled", value: scheduled, color: "#8C735A" },
            { label: "Draft",     value: drafts,    color: "#7B746B" },
          ].map((s) => (
            <div key={s.label} className="border-t border-[#EDEBE6] pt-3">
              <p className="text-[9px] tracking-[0.18em] uppercase text-[#b0a89e]">{s.label}</p>
              <p className="text-2xl font-[200] mt-1" style={{ color: s.color ?? "#1A1917" }}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex border border-[#EDEBE6] rounded-lg overflow-hidden">
          {(["calendar", "list", "feed"] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2 text-xs tracking-[0.08em] uppercase transition-colors ${
                view === v ? "bg-[#1A1917] text-white" : "text-[#6d675e] hover:text-[#1A1917] hover:bg-[#F5F3EF]"
              }`}
            >
              {v === "calendar" ? (
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3">
                  <rect x="1" y="2.5" width="12" height="10" rx="0.5" /><path d="M1 6h12M4.5 1v3M9.5 1v3" />
                </svg>
              ) : v === "list" ? (
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3">
                  <path d="M1.5 3.5h11M1.5 7h11M1.5 10.5h11" />
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3">
                  <rect x="1" y="1" width="5" height="5" rx="0.5" /><rect x="8" y="1" width="5" height="5" rx="0.5" />
                  <rect x="1" y="8" width="5" height="5" rx="0.5" /><rect x="8" y="8" width="5" height="5" rx="0.5" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* View content */}
      {view === "calendar" && <CalendarView posts={posts} month={month} onEdit={setEditing} />}
      {view === "list"     && <ListView     posts={posts}            onEdit={setEditing} />}
      {view === "feed"     && <FeedView     posts={posts}            onEdit={setEditing} />}

      {/* Edit drawer */}
      {editing && (
        <EditDrawer
          post={editing}
          onClose={() => setEditing(null)}
          onChange={handleChange}
        />
      )}
    </div>
  );
}
