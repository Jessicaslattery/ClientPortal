"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { scheduleCallAction } from "@/app/(founder)/clients/[id]/call-actions";

type Call = {
  id: string;
  title: string;
  scheduledAt: string;
  completedAt: string | null;
};

export function ClientCallsSection({
  clientId,
  calls,
}: {
  clientId: string;
  calls: Call[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const upcoming = calls.filter((c) => !c.completedAt && new Date(c.scheduledAt) >= new Date());
  const past = calls.filter((c) => c.completedAt || new Date(c.scheduledAt) < new Date());

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = await scheduleCallAction(clientId, fd);
      if ("error" in result && result.error) {
        setError(result.error);
      } else {
        setShowForm(false);
        (e.target as HTMLFormElement).reset();
      }
    });
  }

  return (
    <div className="rounded-2xl border border-[#EDEBE6] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] tracking-[0.15em] text-[#b0a89e]">Calls</h3>
        <div className="flex items-center gap-3">
          <Link
            href={`/clients/${clientId}/prep`}
            className="text-[10px] tracking-[0.08em] text-[#b0a89e] hover:text-[#8C735A] transition-colors"
          >
            Session prep ↗
          </Link>
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-[10px] tracking-[0.08em] text-[#8C735A] hover:opacity-70 transition-opacity"
          >
            {showForm ? "Cancel" : "+ Schedule call"}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 space-y-3 pb-4 border-b border-[#EDEBE6]">
          <div>
            <label className="block text-[10px] tracking-[0.08em] text-[#b0a89e] mb-1">Title</label>
            <input
              name="title"
              type="text"
              required
              placeholder="e.g. Strategy session"
              autoFocus
              className="w-full rounded-xl border border-[#EDEBE6] text-[#1A1917] px-3 py-2 text-xs placeholder:text-[#b0a89e] focus:outline-none focus:border-[#C8B89A] transition-colors"
            />
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.08em] text-[#b0a89e] mb-1">Date &amp; time</label>
            <input
              name="scheduledAt"
              type="datetime-local"
              required
              className="w-full rounded-xl border border-[#EDEBE6] text-[#1A1917] px-3 py-2 text-xs focus:outline-none focus:border-[#C8B89A] transition-colors"
            />
          </div>
          {error && <p className="text-xs text-[#9B2335]">{error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="px-4 py-1.5 rounded-xl bg-[#1A1917] text-white text-xs tracking-[0.08em] hover:bg-[#2C2520] transition-colors disabled:opacity-40"
          >
            {pending ? "Saving…" : "Save call"}
          </button>
        </form>
      )}

      {upcoming.length === 0 && past.length === 0 ? (
        <p className="text-xs text-[#b0a89e]">No calls scheduled yet.</p>
      ) : (
        <div className="space-y-2">
          {upcoming.map((call) => (
            <div key={call.id} className="flex items-center justify-between py-1.5 border-b border-[#EDEBE6] last:border-0">
              <p className="text-xs text-[#1A1917]">{call.title}</p>
              <span className="text-[10px] text-[#8C735A] tabular-nums">
                {new Date(call.scheduledAt).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))}
          {past.slice(0, 3).map((call) => (
            <div key={call.id} className="flex items-center justify-between py-1.5 border-b border-[#EDEBE6] last:border-0">
              <p className="text-xs text-[#7a7268]">{call.title}</p>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-[#b0a89e] tabular-nums">
                  {new Date(call.scheduledAt).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                </span>
                <Link
                  href={`/clients/${clientId}/calls/${call.id}`}
                  className="text-[10px] text-[#8C735A] hover:opacity-70 transition-opacity"
                >
                  Notes →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
