"use client";

import { useState, useTransition, useRef } from "react";
import {
  syncGranolaMCPAction,
  pasteTranscriptAction,
  assignUnmatchedTranscriptAction,
  deleteUnmatchedTranscriptAction,
} from "@/app/(founder)/granola/actions";

type Client = { id: string; founderName: string; businessName: string };
type Unmatched = { id: string; granolaId: string; date: Date; title: string; transcript: string };
type Transcript = {
  id: string;
  date: Date;
  title: string;
  processed: boolean;
  clientProfile: { founderName: string; businessName: string } | null;
};
type SyncLog = {
  id: string;
  runAt: Date;
  meetingsFound: number;
  transcriptsSaved: number;
  unmatched: number;
  errors: string | null;
};

export function GranolaSync({
  clients,
  unmatched: initialUnmatched,
  transcripts: initialTranscripts,
  syncLogs: initialLogs,
  hasApiToken,
}: {
  clients: Client[];
  unmatched: Unmatched[];
  transcripts: Transcript[];
  syncLogs: SyncLog[];
  hasApiToken: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [pasteMessage, setPasteMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"paste" | "unmatched" | "saved">("paste");
  const formRef = useRef<HTMLFormElement>(null);

  function handleSync() {
    startTransition(async () => {
      const result = await syncGranolaMCPAction();
      setSyncMessage(result.message);
    });
  }

  function handlePaste(formData: FormData) {
    startTransition(async () => {
      const result = await pasteTranscriptAction(formData);
      if ("error" in result) {
        setPasteMessage(`⚠ ${result.error}`);
      } else {
        setPasteMessage(`✓ ${result.success}`);
        formRef.current?.reset();
      }
    });
  }

  function handleAssign(id: string, clientProfileId: string) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", id);
      fd.set("clientProfileId", clientProfileId);
      await assignUnmatchedTranscriptAction(fd);
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteUnmatchedTranscriptAction(id);
    });
  }

  const tabs = [
    { id: "paste" as const, label: "Add Transcript" },
    { id: "unmatched" as const, label: `Unmatched (${initialUnmatched.length})` },
    { id: "saved" as const, label: `Saved (${initialTranscripts.length})` },
  ];

  return (
    <div className="space-y-8">
      {/* Sync strip */}
      <div className="rounded-3xl border border-[#E8E2D9] bg-[#FFFFFF] p-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-[#1A1714]">Granola API Sync</p>
          <p className="text-xs text-[#5C5550] mt-0.5">
            {hasApiToken
              ? "MCP token configured · syncs today's meetings from Granola"
              : "No GRANOLA_MCP_TOKEN in .env · use manual paste below"}
          </p>
          {syncMessage && (
            <p className="text-xs text-[#B7791F] mt-1">{syncMessage}</p>
          )}
        </div>
        <button
          onClick={handleSync}
          disabled={isPending || !hasApiToken}
          className="px-5 py-2.5 text-xs tracking-[0.1em] uppercase text-[#FAFAF8] bg-[#1A1714] rounded-2xl hover:bg-[#2C2520] transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {isPending ? "Syncing…" : "Sync Now"}
        </button>
      </div>

      {/* Recent sync log */}
      {initialLogs.length > 0 && (
        <div className="rounded-3xl border border-[#E8E2D9] bg-[#FFFFFF] p-6">
          <p className="text-[10px] tracking-[0.15em] uppercase text-[#5C5550] mb-4">Recent Sync Logs</p>
          <div className="space-y-2">
            {initialLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between text-xs">
                <span className="text-[#5C5550]">
                  {new Date(log.runAt).toLocaleDateString("en-AU", {
                    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                  })}
                </span>
                <span className="text-[#1A1714]">
                  {log.transcriptsSaved} saved · {log.unmatched} unmatched · {log.meetingsFound} found
                </span>
                {log.errors && (
                  <span className="text-[#9B2335] truncate max-w-[200px]">{log.errors}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div>
        <div className="flex gap-1 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs tracking-[0.1em] uppercase rounded-2xl transition-colors ${
                activeTab === tab.id
                  ? "text-[#C8B89A] bg-[#C8B89A]/8"
                  : "text-[#5C5550] hover:text-[#1A1714]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Paste tab */}
        {activeTab === "paste" && (
          <form ref={formRef} action={handlePaste} className="rounded-3xl border border-[#E8E2D9] bg-[#FFFFFF] p-6 space-y-5">
            <p className="text-[10px] tracking-[0.15em] uppercase text-[#5C5550]">Paste Transcript</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277]">Meeting title</label>
                <input
                  name="title"
                  required
                  placeholder="e.g. Sarah · M2W3 Strategy Call"
                  className="w-full bg-[#FFFFFF] border border-[#E8E2D9] rounded-2xl px-4 py-2.5 text-sm text-[#1A1714] placeholder:text-[#8C8277] focus:outline-none focus:border-[#C8B89A]/40"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277]">Date</label>
                <input
                  name="date"
                  type="date"
                  className="w-full bg-[#FFFFFF] border border-[#E8E2D9] rounded-2xl px-4 py-2.5 text-sm text-[#1A1714] focus:outline-none focus:border-[#C8B89A]/40"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277]">Assign to client (optional · auto-matched if blank)</label>
              <select
                name="clientProfileId"
                className="w-full bg-[#FFFFFF] border border-[#E8E2D9] rounded-2xl px-4 py-2.5 text-sm text-[#1A1714] focus:outline-none focus:border-[#C8B89A]/40"
              >
                <option value="">Auto-match by name</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.founderName} · {c.businessName}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277]">Transcript</label>
              <textarea
                name="transcript"
                required
                rows={10}
                placeholder="Paste the full session transcript here…"
                className="w-full bg-[#FFFFFF] border border-[#E8E2D9] rounded-2xl px-4 py-3 text-sm text-[#1A1714] placeholder:text-[#8C8277] focus:outline-none focus:border-[#C8B89A]/40 resize-y"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277]">Summary (optional)</label>
              <textarea
                name="summary"
                rows={3}
                placeholder="Optional · Granola's AI summary of the meeting…"
                className="w-full bg-[#FFFFFF] border border-[#E8E2D9] rounded-2xl px-4 py-3 text-sm text-[#1A1714] placeholder:text-[#8C8277] focus:outline-none focus:border-[#C8B89A]/40 resize-y"
              />
            </div>

            {pasteMessage && (
              <p className={`text-xs ${pasteMessage.startsWith("✓") ? "text-[#2D6A4F]" : "text-[#9B2335]"}`}>
                {pasteMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 text-xs tracking-[0.1em] uppercase text-[#FAFAF8] bg-[#1A1714] rounded-2xl hover:bg-[#2C2520] transition-colors disabled:opacity-40"
            >
              {isPending ? "Saving…" : "Save Transcript"}
            </button>
          </form>
        )}

        {/* Unmatched tab */}
        {activeTab === "unmatched" && (
          <div className="rounded-3xl border border-[#E8E2D9] bg-[#FFFFFF] divide-y divide-[#E8E2D9]">
            {initialUnmatched.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-[#8C8277]">
                No unmatched transcripts · all sessions have been assigned.
              </div>
            ) : (
              initialUnmatched.map((t) => (
                <div key={t.id} className="px-6 py-5 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-[#1A1714]">{t.title}</p>
                      <p className="text-xs text-[#5C5550] mt-0.5">
                        {new Date(t.date).toLocaleDateString("en-AU", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(t.id)}
                      disabled={isPending}
                      className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] hover:text-[#9B2335] transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      id={`assign-${t.id}`}
                      className="flex-1 bg-[#FFFFFF] border border-[#E8E2D9] rounded-2xl px-3 py-2 text-xs text-[#1A1714] focus:outline-none focus:border-[#C8B89A]/40"
                    >
                      <option value="">Select client…</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>{c.founderName} · {c.businessName}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        const sel = document.getElementById(`assign-${t.id}`) as HTMLSelectElement;
                        if (sel.value) handleAssign(t.id, sel.value);
                      }}
                      disabled={isPending}
                      className="px-4 py-2 text-xs tracking-[0.1em] uppercase text-[#FAFAF8] bg-[#1A1714] rounded-2xl hover:bg-[#2C2520] transition-colors disabled:opacity-40"
                    >
                      Assign
                    </button>
                  </div>
                  <p className="text-[11px] text-[#8C8277] line-clamp-2">{t.transcript}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Saved tab */}
        {activeTab === "saved" && (
          <div className="rounded-3xl border border-[#E8E2D9] bg-[#FFFFFF] divide-y divide-[#E8E2D9]">
            {initialTranscripts.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-[#8C8277]">
                No transcripts saved yet.
              </div>
            ) : (
              initialTranscripts.map((t) => (
                <div key={t.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#1A1714]">{t.title}</p>
                    <p className="text-xs text-[#5C5550] mt-0.5">
                      {t.clientProfile?.founderName} · {new Date(t.date).toLocaleDateString("en-AU", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] tracking-[0.1em] uppercase px-2.5 py-1 rounded-full ${
                      t.processed
                        ? "text-[#2D6A4F] bg-[#2D6A4F]/10"
                        : "text-[#8C8277] bg-[#E8E2D9]"
                    }`}
                  >
                    {t.processed ? "Processed" : "Pending"}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
