"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { runPulseAgentAction, resolveChurnRiskAction } from "@/app/(founder)/actions";
import type { PulseSignal } from "@/lib/pulseAgent";

type ChurnRisk = {
  id: string;
  clientProfileId: string;
  signal: string;
  detectedAt: Date;
  resolved: boolean;
  clientProfile: { founderName: string; tier: string };
};

function daysSince(date: Date | undefined): number | null {
  if (!date) return null;
  const diff = Date.now() - new Date(date).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function ResolveButton({ riskId }: { riskId: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      onClick={() => startTransition(() => resolveChurnRiskAction(riskId))}
      disabled={isPending}
      className="text-[10px] tracking-[0.08em] uppercase text-[#2D6A4F] hover:text-[#1A1714] transition-colors disabled:opacity-40"
    >
      {isPending ? "Resolving…" : "Mark resolved"}
    </button>
  );
}

export function ChurnMonitor({
  activeRisks,
  clientNames,
  lastMessageMap,
}: {
  activeRisks: ChurnRisk[];
  clientNames: Map<string, string>;
  lastMessageMap: Map<string, Date>;
}) {
  const [isPending, startTransition] = useTransition();
  const [pulseResults, setPulseResults] = useState<PulseSignal[] | null>(null);

  function handleRunPulse() {
    startTransition(async () => {
      const results = await runPulseAgentAction();
      setPulseResults(results);
    });
  }

  // Group persisted risks by client
  const groupedRisks = new Map<string, ChurnRisk[]>();
  for (const risk of activeRisks) {
    const existing = groupedRisks.get(risk.clientProfileId) ?? [];
    existing.push(risk);
    groupedRisks.set(risk.clientProfileId, existing);
  }

  return (
    <div className="rounded-3xl border border-[#E8E2D9] bg-[#FFFFFF] p-6 space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] tracking-[0.15em] uppercase text-[#5C5550]">Needs Attention</p>
        <button
          onClick={handleRunPulse}
          disabled={isPending}
          className="px-4 py-1.5 text-[10px] tracking-[0.1em] uppercase text-[#FAFAF8] bg-[#1A1714] rounded-2xl hover:bg-[#2C2520] transition-colors disabled:opacity-40"
        >
          {isPending ? "Scanning…" : "Run Pulse"}
        </button>
      </div>

      {/* Live pulse results */}
      {pulseResults && (
        <div className="space-y-3">
          {pulseResults.length === 0 ? (
            <p className="text-xs text-[#8C8277] italic">No clients to scan.</p>
          ) : (
            pulseResults.map((r) => {
              const color =
                r.riskLevel === "high"
                  ? "#9B2335"
                  : r.riskLevel === "medium"
                  ? "#B7791F"
                  : "#2D6A4F";
              return (
                <div key={r.clientProfileId} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-[#1A1714]">{r.founderName}</p>
                    <span
                      className="text-[10px] tracking-[0.1em] uppercase px-2 py-0.5 rounded-full"
                      style={{ color, backgroundColor: `${color}18` }}
                    >
                      {r.riskLevel}
                    </span>
                  </div>
                  {r.signals.length > 0 && (
                    <ul className="space-y-0.5">
                      {r.signals.map((s, i) => (
                        <li key={i} className="text-xs text-[#5C5550] flex gap-2">
                          <span className="text-[#8C8277]">·</span> {s}
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="text-xs text-[#B7791F] italic">{r.recommendation}</p>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Persisted risks · "Needs Attention" cards */}
      {!pulseResults && groupedRisks.size > 0 && (
        <div className="space-y-3">
          {Array.from(groupedRisks.entries()).map(([clientId, risks]) => {
            const client = risks[0].clientProfile;
            const lastMsg = lastMessageMap.get(clientId);
            const daysSinceContact = daysSince(lastMsg);

            return (
              <div
                key={clientId}
                className="rounded-2xl border border-[#E8E2D9] bg-[#F2EDE4] p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-[#1A1714]">{client.founderName}</p>
                    <p className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] mt-0.5">
                      {client.tier}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    {daysSinceContact != null ? (
                      <p className="text-[10px] text-[#B7791F]">
                        Last contact {daysSinceContact}d ago
                      </p>
                    ) : (
                      <p className="text-[10px] text-[#8C8277]">No messages on record</p>
                    )}
                  </div>
                </div>

                <ul className="space-y-1">
                  {risks.map((r) => (
                    <li key={r.id} className="flex items-start gap-2 text-xs text-[#5C5550]">
                      <span className="text-[#9B2335] mt-0.5 shrink-0">·</span>
                      {r.signal}
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between pt-1">
                  <Link
                    href={`/clients/${clientId}`}
                    className="text-[10px] tracking-[0.08em] uppercase text-[#5C5550] hover:text-[#1A1714] transition-colors"
                  >
                    Open thread →
                  </Link>
                  <div className="flex gap-3">
                    {risks.map((r) => (
                      <ResolveButton key={r.id} riskId={r.id} />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!pulseResults && groupedRisks.size === 0 && (
        <p className="text-xs text-[#8C8277] italic">
          No active risk signals. Run Pulse to scan all clients.
        </p>
      )}
    </div>
  );
}
