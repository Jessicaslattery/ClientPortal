"use client";

import { useState, useTransition } from "react";
import {
  createReminderAction,
  toggleReminderAction,
  deleteReminderAction,
  sendReminderNowAction,
} from "@/app/(founder)/reminders/actions";

type Template = {
  id: string;
  title: string;
  message: string;
  dayOfWeek: string;
  audience: string;
  active: boolean;
  lastSentAt: string | null;
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const AUDIENCES = [
  { value: "all", label: "All active clients" },
  { value: "consulting", label: "Consulting clients only" },
  { value: "sms", label: "Social media clients only" },
];

export function RemindersList({
  templates,
  activeClientCount,
}: {
  templates: Template[];
  activeClientCount: number;
}) {
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [sendResult, setSendResult] = useState<Record<string, { sent: number; failed: number }>>({});
  const [pending, startTransition] = useTransition();

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await createReminderAction(fd);
      setShowForm(false);
    });
  }

  function handleSendNow(id: string) {
    setSending(id);
    startTransition(async () => {
      const result = await sendReminderNowAction(id);
      if (result && "sent" in result) setSendResult((prev) => ({ ...prev, [id]: result as { sent: number; failed: number } }));
      setSending(null);
    });
  }

  function handleToggle(id: string, active: boolean) {
    startTransition(() => toggleReminderAction(id, active));
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this reminder template?")) return;
    startTransition(() => deleteReminderAction(id));
  }

  return (
    <div className="space-y-6">
      {/* New reminder form */}
      {showForm ? (
        <form onSubmit={handleCreate} className="rounded-2xl border border-[#C8B89A]/40 bg-[#FDFCF9] p-6 space-y-4">
          <h2 className="text-[10px] tracking-[0.15em] text-[#b0a89e]">New scheduled message</h2>

          <div>
            <label className="block text-xs tracking-[0.08em] text-[#7a7268] mb-1.5">Title</label>
            <input
              name="title"
              required
              placeholder="e.g. Weekly check-in nudge"
              className="w-full rounded-xl border border-[#EDEBE6] text-[#1A1917] px-4 py-2.5 text-sm placeholder:text-[#b0a89e] focus:outline-none focus:border-[#C8B89A] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs tracking-[0.08em] text-[#7a7268] mb-1.5">
              Message <span className="text-[#b0a89e] normal-case tracking-normal font-normal">(use {"{firstName}"} to personalise)</span>
            </label>
            <textarea
              name="message"
              required
              rows={5}
              placeholder={"Hi {firstName},\n\nJust checking in: how's the week going? Drop me a message if anything has come up or if you'd like to talk something through.\n\nJess"}
              className="w-full rounded-xl border border-[#EDEBE6] text-[#1A1917] px-4 py-3 text-sm placeholder:text-[#b0a89e] focus:outline-none focus:border-[#C8B89A] transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs tracking-[0.08em] text-[#7a7268] mb-1.5">Send day</label>
              <select
                name="dayOfWeek"
                defaultValue="Monday"
                className="w-full rounded-xl border border-[#EDEBE6] text-[#1A1917] px-4 py-2.5 text-sm focus:outline-none focus:border-[#C8B89A] transition-colors bg-white"
              >
                {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs tracking-[0.08em] text-[#7a7268] mb-1.5">Who receives it</label>
              <select
                name="audience"
                defaultValue="all"
                className="w-full rounded-xl border border-[#EDEBE6] text-[#1A1917] px-4 py-2.5 text-sm focus:outline-none focus:border-[#C8B89A] transition-colors bg-white"
              >
                {AUDIENCES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl text-xs text-[#7a7268] hover:text-[#1A1917] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="px-5 py-2 rounded-xl bg-[#1A1917] text-white text-xs tracking-[0.08em] hover:bg-[#2C2520] transition-colors disabled:opacity-40"
            >
              {pending ? "Saving…" : "Create reminder"}
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-[#EDEBE6] text-xs text-[#7a7268] hover:border-[#C8B89A] hover:text-[#1A1917] transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 1v10M1 6h10" />
          </svg>
          Schedule a message
        </button>
      )}

      {/* Template list */}
      {templates.length === 0 ? (
        <div className="rounded-2xl border border-[#EDEBE6] px-8 py-16 text-center">
          <p className="text-xl font-[300] text-[#1A1917]">No scheduled messages yet</p>
          <p className="mt-1.5 text-sm text-[#7a7268]">Create a template to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((t) => {
            const result = sendResult[t.id];

            return (
              <div
                key={t.id}
                className={`rounded-2xl border p-5 ${t.active ? "border-[#EDEBE6] bg-white" : "border-[#EDEBE6] bg-[#F5F3EF] opacity-60"}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <p className="text-sm font-[500] text-[#1A1917]">{t.title}</p>
                      <span className="text-[9px] tracking-[0.1em] text-[#b0a89e] uppercase">
                        {t.dayOfWeek} · {AUDIENCES.find((a) => a.value === t.audience)?.label ?? t.audience}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-[#7a7268] leading-5 whitespace-pre-wrap line-clamp-3">{t.message}</p>
                    {t.lastSentAt && (
                      <p className="mt-2 text-[10px] text-[#b0a89e]">
                        Last sent{" "}
                        {new Date(t.lastSentAt).toLocaleDateString("en-AU", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    )}
                    {result && (
                      <p className="mt-2 text-[11px] text-[#2D6A4F]">
                        ✓ Sent to {result.sent} client{result.sent !== 1 ? "s" : ""}
                        {result.failed > 0 ? ` (${result.failed} failed)` : ""}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleSendNow(t.id)}
                      disabled={sending === t.id || pending}
                      className="px-3 py-1.5 rounded-lg border border-[#EDEBE6] text-[10px] tracking-[0.08em] text-[#7a7268] hover:border-[#C8B89A] hover:text-[#1A1917] transition-colors disabled:opacity-40"
                    >
                      {sending === t.id ? "Sending…" : `Send now · ${activeClientCount}`}
                    </button>
                    <button
                      onClick={() => handleToggle(t.id, !t.active)}
                      disabled={pending}
                      className="px-3 py-1.5 rounded-lg border border-[#EDEBE6] text-[10px] tracking-[0.08em] text-[#7a7268] hover:border-[#C8B89A] hover:text-[#1A1917] transition-colors disabled:opacity-40"
                    >
                      {t.active ? "Disable" : "Enable"}
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      disabled={pending}
                      className="px-3 py-1.5 rounded-lg border border-red-100 text-[10px] text-red-400 hover:border-red-300 transition-colors disabled:opacity-40"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-xl bg-[#F5F3EF] border border-[#EDEBE6] px-5 py-4">
        <p className="text-[11px] text-[#7a7268] leading-5">
          <span className="font-[500] text-[#1A1917]">About scheduled messages.</span>{" "}
          "Send now" delivers the message directly to each matching client's in-app inbox: it appears as a message from you, and they can reply. Use {"{firstName}"} to personalise.
        </p>
      </div>
    </div>
  );
}
