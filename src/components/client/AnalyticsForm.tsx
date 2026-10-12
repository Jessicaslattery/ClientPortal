"use client";

import { useState } from "react";
import { submitAnalytics } from "@/app/(client)/content-calendar/actions";

const PLATFORMS = ["Instagram", "LinkedIn", "TikTok", "Facebook"];
const FORMATS = ["Reel", "Carousel", "Talking Head", "Story", "Text Post", "Static Image"];

export function AnalyticsForm({ clientProfileId }: { clientProfileId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData(e.currentTarget);
      await submitAnalytics(fd);
      setSuccess(true);
      setOpen(false);
      setTimeout(() => setSuccess(false), 3000);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 rounded-xl border border-[#E8E2D9] text-xs tracking-wide text-[#5C5550] hover:border-[#C8B89A] hover:text-[#1A1714] transition-colors"
        >
          + Log this week's stats
        </button>
        {success && (
          <span className="text-xs text-[#2D6A4F]">Analytics saved.</span>
        )}
      </div>
    );
  }

  // Monday of this week
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const defaultWeekOf = monday.toISOString().slice(0, 10);

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[#E8E2D9] bg-white p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#1A1714]">Log weekly analytics</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-[#8C8277] hover:text-[#1A1714] text-lg leading-none"
        >
          ×
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] block mb-1">
            Platform
          </label>
          <select
            name="platform"
            required
            className="w-full rounded-xl border border-[#E8E2D9] px-3 py-2 text-sm text-[#1A1714] bg-white focus:outline-none focus:border-[#C8B89A]"
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] block mb-1">
            Week of
          </label>
          <input
            type="date"
            name="weekOf"
            defaultValue={defaultWeekOf}
            required
            className="w-full rounded-xl border border-[#E8E2D9] px-3 py-2 text-sm text-[#1A1714] bg-white focus:outline-none focus:border-[#C8B89A]"
          />
        </div>
        <div>
          <label className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] block mb-1">
            Reach
          </label>
          <input
            type="number"
            name="reach"
            required
            min={0}
            placeholder="e.g. 4200"
            className="w-full rounded-xl border border-[#E8E2D9] px-3 py-2 text-sm text-[#1A1714] bg-white focus:outline-none focus:border-[#C8B89A]"
          />
        </div>
        <div>
          <label className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] block mb-1">
            Engagement Rate (%)
          </label>
          <input
            type="number"
            name="engagementRate"
            required
            min={0}
            max={100}
            step={0.1}
            placeholder="e.g. 4.2"
            className="w-full rounded-xl border border-[#E8E2D9] px-3 py-2 text-sm text-[#1A1714] bg-white focus:outline-none focus:border-[#C8B89A]"
          />
        </div>
        <div>
          <label className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] block mb-1">
            Follower Growth
          </label>
          <input
            type="number"
            name="followerGrowth"
            required
            placeholder="e.g. 47"
            className="w-full rounded-xl border border-[#E8E2D9] px-3 py-2 text-sm text-[#1A1714] bg-white focus:outline-none focus:border-[#C8B89A]"
          />
        </div>
        <div>
          <label className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] block mb-1">
            Top Format
          </label>
          <select
            name="topFormat"
            className="w-full rounded-xl border border-[#E8E2D9] px-3 py-2 text-sm text-[#1A1714] bg-white focus:outline-none focus:border-[#C8B89A]"
          >
            <option value="">Select…</option>
            {FORMATS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] block mb-1">
          Top Performing Post (describe it briefly)
        </label>
        <input
          type="text"
          name="topPost"
          placeholder="e.g. The reel about my morning routine"
          className="w-full rounded-xl border border-[#E8E2D9] px-3 py-2 text-sm text-[#1A1714] bg-white focus:outline-none focus:border-[#C8B89A]"
        />
      </div>

      <div>
        <label className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] block mb-1">
          Insights / Notes (optional)
        </label>
        <textarea
          name="insights"
          rows={2}
          placeholder="Anything that stood out this week…"
          className="w-full rounded-xl border border-[#E8E2D9] px-3 py-2 text-sm text-[#1A1714] bg-white focus:outline-none focus:border-[#C8B89A] resize-none"
        />
      </div>

      {error && <p className="text-xs text-[#9B2335]">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-[#1A1714] text-[#FAFAF8] text-xs tracking-wide hover:bg-[#2a2420] transition-colors disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save Analytics"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-[#5C5550] hover:text-[#1A1714] transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
