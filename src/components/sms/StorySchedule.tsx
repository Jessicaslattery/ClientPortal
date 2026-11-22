"use client";

import { useState } from "react";

export type StoryItem = {
  id: string;
  title: string;
  outline: string;
  date: string; // YYYY-MM-DD
  type: "poll" | "qa" | "countdown" | "bts" | "testimonial" | "cta" | "tips" | "personal";
  status: "posted" | "scheduled" | "draft";
  slides: number;
  slideContent?: string[]; // per-slide copy/brief
  notes?: string;
};

type View = "list" | "calendar";

const TYPE_OPTIONS: { value: StoryItem["type"]; label: string; color: string; bg: string }[] = [
  { value: "poll",        label: "Poll",        color: "#2D5F8A", bg: "#EBF2F9" },
  { value: "qa",          label: "Q&A",         color: "#5A3B7A", bg: "#F0EBF9" },
  { value: "countdown",   label: "Countdown",   color: "#9B4F2A", bg: "#F9EDE5" },
  { value: "bts",         label: "BTS",         color: "#8C735A", bg: "#F5EFE5" },
  { value: "testimonial", label: "Testimonial", color: "#2D6A4F", bg: "#E5F2EC" },
  { value: "cta",         label: "CTA",         color: "#9B2335", bg: "#F9E5E8" },
  { value: "tips",        label: "Tips",        color: "#2D5F8A", bg: "#EBF2F9" },
  { value: "personal",    label: "Personal",    color: "#7B746B", bg: "#F5F1EB" },
];

const TYPE_CONFIG = Object.fromEntries(TYPE_OPTIONS.map((t) => [t.value, t])) as Record<
  StoryItem["type"],
  { label: string; color: string; bg: string }
>;

const STATUS_OPTIONS: { value: StoryItem["status"]; label: string; color: string; bg: string }[] = [
  { value: "draft",     label: "Draft",     color: "#7B746B", bg: "#F5F1EB" },
  { value: "scheduled", label: "Scheduled", color: "#8C735A", bg: "#F5EFE5" },
  { value: "posted",    label: "Posted",    color: "#2D6A4F", bg: "#E5F2EC" },
];

const STATUS_CONFIG = Object.fromEntries(STATUS_OPTIONS.map((s) => [s.value, s])) as Record<
  StoryItem["status"],
  { label: string; color: string; bg: string }
>;

// ─── Edit Drawer ─────────────────────────────────────────────────────────────

function EditDrawer({
  story,
  onClose,
  onChange,
}: {
  story: StoryItem;
  onClose: () => void;
  onChange: (updated: StoryItem) => void;
}) {
  const initSlides = story.slideContent?.length
    ? story.slideContent
    : Array.from({ length: story.slides }, () => "");

  const [form, setForm] = useState<StoryItem>({ ...story, slideContent: initSlides });
  const [saved, setSaved] = useState(false);

  function set<K extends keyof StoryItem>(key: K, value: StoryItem[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function setSlide(index: number, value: string) {
    setForm((prev) => {
      const updated = [...(prev.slideContent ?? [])];
      updated[index] = value;
      return { ...prev, slideContent: updated };
    });
    setSaved(false);
  }

  function addSlide() {
    setForm((prev) => ({
      ...prev,
      slides: prev.slides + 1,
      slideContent: [...(prev.slideContent ?? []), ""],
    }));
    setSaved(false);
  }

  function removeSlide(index: number) {
    if (form.slides <= 1) return;
    setForm((prev) => {
      const updated = [...(prev.slideContent ?? [])];
      updated.splice(index, 1);
      return { ...prev, slides: prev.slides - 1, slideContent: updated };
    });
    setSaved(false);
  }

  function handleSave() {
    onChange(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  const tc = TYPE_CONFIG[form.type];

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#EDEBE6]">
          <div>
            <p className="text-[9px] tracking-[0.2em] uppercase text-[#b0a89e]">Edit Story</p>
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

          {/* Title */}
          <div>
            <label className="block text-[9px] tracking-[0.18em] uppercase text-[#b0a89e] mb-2">Story title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Weekend Q&A series"
              className="w-full border border-[#EDEBE6] rounded-xl px-4 py-2.5 text-sm text-[#1A1917] font-[300] placeholder:text-[#CDCAC4] focus:outline-none focus:border-[#8C735A] transition-colors"
            />
          </div>

          {/* Outline */}
          <div>
            <label className="block text-[9px] tracking-[0.18em] uppercase text-[#b0a89e] mb-2">Outline / brief</label>
            <textarea
              value={form.outline}
              onChange={(e) => set("outline", e.target.value)}
              rows={2}
              placeholder="What's the overall idea for this story set?"
              className="w-full border border-[#EDEBE6] rounded-xl px-4 py-2.5 text-sm text-[#1A1917] font-[300] placeholder:text-[#CDCAC4] focus:outline-none focus:border-[#8C735A] transition-colors resize-none"
            />
          </div>

          {/* Type */}
          <div>
            <p className="text-[9px] tracking-[0.18em] uppercase text-[#b0a89e] mb-2">Story type</p>
            <div className="flex flex-wrap gap-2">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => set("type", opt.value)}
                  className="px-3 py-1.5 rounded-xl text-[11px] font-[400] border transition-all"
                  style={
                    form.type === opt.value
                      ? { background: opt.bg, color: opt.color, borderColor: opt.color + "60" }
                      : { background: "transparent", color: "#7B746B", borderColor: "#EDEBE6" }
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Slides */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[9px] tracking-[0.18em] uppercase text-[#b0a89e]">
                Slides: {form.slides} {form.slides === 1 ? "slide" : "slides"}
              </p>
              <button
                onClick={addSlide}
                className="text-[11px] text-[#8C735A] hover:text-[#6B5240] transition-colors flex items-center gap-1"
              >
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 1v10M1 6h10" />
                </svg>
                Add slide
              </button>
            </div>
            <div className="space-y-3">
              {Array.from({ length: form.slides }).map((_, i) => (
                <div key={i} className="relative">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-6 h-6 rounded-full border border-[#EDEBE6] flex items-center justify-center mt-2.5">
                      <span className="text-[9px] text-[#b0a89e] font-[400]">{i + 1}</span>
                    </div>
                    <textarea
                      value={form.slideContent?.[i] ?? ""}
                      onChange={(e) => setSlide(i, e.target.value)}
                      rows={3}
                      placeholder={`Slide ${i + 1}: copy, questions, or creative brief...`}
                      className="flex-1 border border-[#EDEBE6] rounded-xl px-4 py-2.5 text-sm text-[#1A1917] font-[300] placeholder:text-[#CDCAC4] focus:outline-none focus:border-[#8C735A] transition-colors resize-none"
                    />
                    {form.slides > 1 && (
                      <button
                        onClick={() => removeSlide(i)}
                        className="shrink-0 mt-2.5 w-6 h-6 flex items-center justify-center text-[#CDCAC4] hover:text-[#9B2335] transition-colors"
                      >
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M2 2l8 8M10 2L2 10" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[9px] tracking-[0.18em] uppercase text-[#b0a89e] mb-2">Notes</label>
            <textarea
              value={form.notes ?? ""}
              onChange={(e) => set("notes", e.target.value)}
              rows={3}
              placeholder="Any extra context or instructions..."
              className="w-full border border-[#EDEBE6] rounded-xl px-4 py-2.5 text-sm text-[#1A1917] font-[300] placeholder:text-[#CDCAC4] focus:outline-none focus:border-[#8C735A] transition-colors resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#EDEBE6] flex items-center justify-between gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#7B746B] hover:text-[#1A1917] transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={`px-6 py-2.5 rounded-xl text-sm font-[400] transition-all ${
              saved ? "bg-[#2D6A4F] text-white" : "bg-[#1A1917] text-white hover:bg-[#2D2A26]"
            }`}
          >
            {saved ? "Saved ✓" : "Save changes"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── List view ───────────────────────────────────────────────────────────────

function ListView({ stories, onEdit }: { stories: StoryItem[]; onEdit: (s: StoryItem) => void }) {
  return (
    <div className="border border-[#EDEBE6] rounded-xl overflow-hidden">
      <div className="grid grid-cols-[1fr_100px_90px_70px_80px_32px] gap-4 px-5 py-3 bg-[#F5F3EF] border-b border-[#EDEBE6]">
        {["Story", "Date", "Type", "Slides", "Status", ""].map((h, i) => (
          <p key={i} className="text-[9px] tracking-[0.18em] uppercase text-[#b0a89e]">{h}</p>
        ))}
      </div>
      {stories.map((story, i) => {
        const tc = TYPE_CONFIG[story.type];
        const sc = STATUS_CONFIG[story.status];
        return (
          <div
            key={story.id}
            onClick={() => onEdit(story)}
            className={`grid grid-cols-[1fr_100px_90px_70px_80px_32px] gap-4 px-5 py-4 items-center hover:bg-[#F5F3EF]/60 transition-colors cursor-pointer group ${
              i > 0 ? "border-t border-[#EDEBE6]" : ""
            }`}
          >
            <div className="min-w-0">
              <p className="text-sm text-[#1A1917] font-[300] truncate group-hover:text-[#8C735A] transition-colors">{story.title}</p>
              <p className="text-xs text-[#b0a89e] truncate mt-0.5">{story.outline}</p>
            </div>
            <p className="text-xs text-[#6d675e] font-[300]">
              {new Date(story.date + "T00:00:00").toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
            </p>
            <span className="text-[10px] tracking-[0.08em] uppercase px-2 py-0.5 rounded w-fit" style={{ color: tc.color, background: tc.bg }}>
              {tc.label}
            </span>
            <p className="text-xs text-[#6d675e]">{story.slides} slides</p>
            <span className="text-[10px] tracking-[0.08em] uppercase px-2 py-0.5 rounded w-fit" style={{ color: sc.color, background: sc.bg }}>
              {sc.label}
            </span>
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

// ─── Calendar view ───────────────────────────────────────────────────────────

function CalendarView({ stories, month, onEdit }: { stories: StoryItem[]; month: string; onEdit: (s: StoryItem) => void }) {
  const [year, mon] = month.split("-").map(Number);
  const firstDay = new Date(year, mon - 1, 1).getDay();
  const daysInMonth = new Date(year, mon, 0).getDate();
  const startOffset = (firstDay + 6) % 7;

  const byDate: Record<string, StoryItem[]> = {};
  stories.forEach((s) => {
    if (!byDate[s.date]) byDate[s.date] = [];
    byDate[s.date].push(s);
  });

  return (
    <div>
      <div className="grid grid-cols-7 mb-2">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="text-[9px] tracking-[0.18em] uppercase text-[#b0a89e] text-center py-2">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 border-l border-t border-[#EDEBE6]">
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`e-${i}`} className="border-r border-b border-[#EDEBE6] min-h-[80px]" />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const dateKey = `${month}-${String(day).padStart(2, "0")}`;
          const dayStories = byDate[dateKey] ?? [];
          const isToday = dateKey === new Date().toISOString().slice(0, 10);
          return (
            <div key={day} className="border-r border-b border-[#EDEBE6] min-h-[80px] p-1.5">
              <span className={`text-[11px] font-[300] mb-1 inline-flex w-5 h-5 items-center justify-center ${
                isToday ? "bg-[#1A1917] text-white rounded-full" : "text-[#7B746B]"
              }`}>{day}</span>
              <div className="space-y-0.5">
                {dayStories.map((s) => {
                  const tc = TYPE_CONFIG[s.type];
                  return (
                    <button
                      key={s.id}
                      onClick={() => onEdit(s)}
                      className="w-full text-left rounded px-1.5 py-0.5 text-[9px] leading-tight truncate hover:opacity-70 transition-opacity cursor-pointer"
                      style={{ background: tc.bg, color: tc.color }}
                    >
                      {s.title}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function StorySchedule({ stories: initialStories, month }: { stories: StoryItem[]; month: string }) {
  const [view, setView] = useState<View>("list");
  const [stories, setStories] = useState<StoryItem[]>(initialStories);
  const [editing, setEditing] = useState<StoryItem | null>(null);

  function handleChange(updated: StoryItem) {
    setStories((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setEditing(updated);
  }

  const posted    = stories.filter((s) => s.status === "posted").length;
  const scheduled = stories.filter((s) => s.status === "scheduled").length;
  const drafts    = stories.filter((s) => s.status === "draft").length;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div className="flex gap-6">
          {[
            { label: "Total",     value: stories.length },
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
          {(["list", "calendar"] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-2 text-xs tracking-[0.08em] uppercase transition-colors ${
                view === v ? "bg-[#1A1917] text-white" : "text-[#6d675e] hover:text-[#1A1917] hover:bg-[#F5F3EF]"
              }`}
            >
              {v === "list" ? (
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3">
                  <path d="M1.5 3.5h11M1.5 7h11M1.5 10.5h11" />
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3">
                  <rect x="1" y="2.5" width="12" height="10" rx="0.5" /><path d="M1 6h12M4.5 1v3M9.5 1v3" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {view === "list"     && <ListView     stories={stories}            onEdit={setEditing} />}
      {view === "calendar" && <CalendarView stories={stories} month={month} onEdit={setEditing} />}

      {editing && (
        <EditDrawer
          story={editing}
          onClose={() => setEditing(null)}
          onChange={handleChange}
        />
      )}
    </div>
  );
}
