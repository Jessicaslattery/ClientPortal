"use client";

import { useState, useTransition } from "react";
import { syncGranolaMCPAction, assignAndProcessAction } from "@/app/(founder)/granola/actions";

type Client = { id: string; founderName: string; businessName: string };
type SyncLog = {
  id: string;
  runAt: Date;
  meetingsFound: number;
  transcriptsSaved: number;
  unmatched: number;
  errors: string | null;
};
type Unmatched = {
  id: string;
  granolaId: string;
  date: Date;
  title: string;
  transcript: string;
};

export function GranolaDashboardStrip({
  clients,
  lastLog,
  unmatchedTranscripts,
  hasMcpToken,
}: {
  clients: Client[];
  lastLog: SyncLog | null;
  unmatchedTranscripts: Unmatched[];
  hasMcpToken: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [assignMessages, setAssignMessages] = useState<Record<string, string>>({});
  const [selectedClients, setSelectedClients] = useState<Record<string, string>>({});

  function handleSync() {
    startTransition(async () => {
      const result = await syncGranolaMCPAction();
      setSyncMessage(result.message);
    });
  }

  function handleAssign(unmatchedId: string) {
    const clientProfileId = selectedClients[unmatchedId];
    if (!clientProfileId) return;
    startTransition(async () => {
      const result = await assignAndProcessAction(unmatchedId, clientProfileId);
      setAssignMessages((prev) => ({ ...prev, [unmatchedId]: result.success }));
    });
  }

  const lastRunText = lastLog
    ? new Date(lastLog.runAt).toLocaleDateString("en-AU", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  // Don't show anything on the dashboard if Granola isn't configured
  if (!hasMcpToken && unmatchedTranscripts.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Sync strip — only shown when Granola is configured */}
      {hasMcpToken && (
      <div className="rounded-3xl border border-[#E8E2D9] bg-[#FFFFFF] p-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-[#1A1714]">Granola Sync</p>
          <p className="text-xs text-[#5C5550] mt-0.5">
            {lastRunText
              ? `Last sync: ${lastRunText} · ${lastLog!.transcriptsSaved} saved`
              : "No syncs yet — connect via Granola settings"}
          </p>
          {syncMessage && (
            <p className="text-xs text-[#B7791F] mt-1">{syncMessage}</p>
          )}
        </div>
        <button
          onClick={handleSync}
          disabled={isPending}
          className="px-5 py-2.5 text-xs tracking-[0.1em] uppercase text-[#FAFAF8] bg-[#1A1714] rounded-2xl hover:bg-[#2C2520] transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {isPending ? "Syncing…" : "Sync Granola"}
        </button>
      </div>
      )}

      {/* Unmatched transcripts */}
      {unmatchedTranscripts.length > 0 && (
        <div className="rounded-3xl border border-[#B7791F]/20 bg-[#B7791F]/5 divide-y divide-[#E8E2D9]">
          <div className="px-5 py-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B7791F]" />
            <p className="text-xs tracking-[0.1em] uppercase text-[#B7791F]">
              {unmatchedTranscripts.length} unmatched transcript{unmatchedTranscripts.length !== 1 ? "s" : ""}
            </p>
          </div>
          {unmatchedTranscripts.map((t) => (
            <div key={t.id} className="px-5 py-4 space-y-3">
              <div>
                <p className="text-sm text-[#1A1714]">{t.title}</p>
                <p className="text-xs text-[#5C5550] mt-0.5">
                  {new Date(t.date).toLocaleDateString("en-AU", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <p className="text-[11px] text-[#8C8277] mt-1.5 line-clamp-2">
                  {t.transcript.slice(0, 200)}
                </p>
              </div>
              {assignMessages[t.id] ? (
                <p className="text-xs text-[#2D6A4F]">{assignMessages[t.id]}</p>
              ) : (
                <div className="flex items-center gap-2">
                  <select
                    value={selectedClients[t.id] ?? ""}
                    onChange={(e) =>
                      setSelectedClients((prev) => ({ ...prev, [t.id]: e.target.value }))
                    }
                    className="flex-1 bg-[#FFFFFF] border border-[#E8E2D9] rounded-2xl px-3 py-2 text-xs text-[#1A1714] focus:outline-none focus:border-[#C8B89A]/40"
                  >
                    <option value="">Select client…</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.founderName} · {c.businessName}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleAssign(t.id)}
                    disabled={isPending || !selectedClients[t.id]}
                    className="px-4 py-2 text-xs tracking-[0.1em] uppercase text-[#FAFAF8] bg-[#1A1714] rounded-2xl hover:bg-[#2C2520] transition-colors disabled:opacity-40"
                  >
                    Assign & Process
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
