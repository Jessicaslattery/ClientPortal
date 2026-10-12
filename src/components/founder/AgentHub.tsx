"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  runExecBriefingAction,
  runGranolaSyncAction,
  runPulseNudgeAction,
  runProgressReportAction,
  runPrepBriefAction,
  runContentPlanAction,
} from "@/app/(founder)/agents/actions";

// ── Types ─────────────────────────────────────────────────────────────────────

type Client = { id: string; founderName: string; businessName: string };

type DraftRow = {
  id: string; title: string; status: string;
  createdAt: string; clientName: string;
};

type ExecRow = { id: string; createdAt: string; preview: string };

type SyncLog = {
  id: string; runAt: string; meetingsFound: number;
  transcriptsSaved: number; unmatched: number; errors: string | null;
};

type OnboardingStepRow = {
  id: string; step: number; status: string;
  createdAt: string; completedAt: string | null; clientName: string;
};

type AgentKey =
  | "scribe" | "exec" | "progress" | "content"
  | "prep" | "granola" | "onboarding" | "pulse";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-AU", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

function StatusPill({ status }: { status: string }) {
  const s = status.toLowerCase();
  const style =
    s === "approved" ? "bg-[#EAF3DE] text-[#2D6A4F]" :
    s === "pending"  ? "bg-[#FEF3C7] text-[#B7791F]" :
    s === "complete" ? "bg-[#EAF3DE] text-[#2D6A4F]" :
                      "bg-[#F5F2ED] text-[#8C8277]";
  return (
    <span className={`text-[9px] tracking-[0.08em] uppercase px-2 py-0.5 rounded-full ${style}`}>
      {status}
    </span>
  );
}

// ── Run button ─────────────────────────────────────────────────────────────────

function RunButton({
  label,
  onRun,
}: {
  label: string;
  onRun: () => Promise<{ error?: string; success?: string }>;
}) {
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  function handleClick() {
    setMsg(null);
    startTransition(async () => {
      const res = await onRun();
      setMsg(res.error
        ? { text: res.error, ok: false }
        : { text: res.success ?? "Done.", ok: true }
      );
    });
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleClick}
        disabled={isPending}
        className="px-4 py-1.5 rounded-2xl bg-[#1A1714] text-[#FAFAF8] text-[10px] tracking-[0.1em] uppercase hover:bg-[#2C2520] transition-colors disabled:opacity-40"
      >
        {isPending ? "Running…" : label}
      </button>
      {msg && (
        <p className={`text-xs ${msg.ok ? "text-[#2D6A4F]" : "text-[#9B2335]"}`}>
          {msg.text}
        </p>
      )}
    </div>
  );
}

// ── Client picker + run button ─────────────────────────────────────────────────

function ClientRunButton({
  label,
  clients,
  onRun,
}: {
  label: string;
  clients: Client[];
  onRun: (clientId: string) => Promise<{ error?: string; success?: string }>;
}) {
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  function handleClick() {
    if (!clientId) return;
    setMsg(null);
    startTransition(async () => {
      const res = await onRun(clientId);
      setMsg(res.error
        ? { text: res.error, ok: false }
        : { text: res.success ?? "Done.", ok: true }
      );
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <select
          value={clientId}
          onChange={(e) => { setClientId(e.target.value); setMsg(null); }}
          className="bg-[#FFFFFF] border border-[#E8E2D9] rounded-xl px-3 py-1.5 text-xs text-[#1A1714] focus:outline-none focus:border-[#C8B89A]"
        >
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.founderName}</option>
          ))}
        </select>
        <button
          onClick={handleClick}
          disabled={isPending || !clientId}
          className="px-4 py-1.5 rounded-2xl bg-[#1A1714] text-[#FAFAF8] text-[10px] tracking-[0.1em] uppercase hover:bg-[#2C2520] transition-colors disabled:opacity-40"
        >
          {isPending ? "Running…" : label}
        </button>
      </div>
      {msg && (
        <p className={`text-xs ${msg.ok ? "text-[#2D6A4F]" : "text-[#9B2335]"}`}>
          {msg.text}
        </p>
      )}
    </div>
  );
}

// ── Draft list ─────────────────────────────────────────────────────────────────

function DraftList({ drafts }: { drafts: DraftRow[] }) {
  if (drafts.length === 0) {
    return <p className="text-xs text-[#8C8277] italic">No outputs in the last 30 days.</p>;
  }
  return (
    <div className="divide-y divide-[#E8E2D9] rounded-2xl border border-[#E8E2D9] overflow-hidden">
      {drafts.map((d) => (
        <div key={d.id} className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-xs text-[#1A1714]">{d.title}</p>
            <p className="text-[10px] text-[#8C8277] mt-0.5">
              {d.clientName} · {fmtDate(d.createdAt)}
            </p>
          </div>
          <StatusPill status={d.status} />
        </div>
      ))}
    </div>
  );
}

// ── Agent card content ─────────────────────────────────────────────────────────

function AgentDetail({
  agentKey,
  clients,
  scribeDrafts,
  execOutputs,
  progressDrafts,
  contentDrafts,
  prepDrafts,
  granolaSyncLogs,
  onboardingDrafts,
  pulseDrafts,
  onboardingSteps,
}: {
  agentKey: AgentKey;
  clients: Client[];
  scribeDrafts: DraftRow[];
  execOutputs: ExecRow[];
  progressDrafts: DraftRow[];
  contentDrafts: DraftRow[];
  prepDrafts: DraftRow[];
  granolaSyncLogs: SyncLog[];
  onboardingDrafts: DraftRow[];
  pulseDrafts: DraftRow[];
  onboardingSteps: OnboardingStepRow[];
}) {
  const configs: Record<AgentKey, {
    name: string;
    description: string;
    trigger: string;
    schedule: string;
    output: string;
    approval: boolean;
  }> = {
    scribe: {
      name: "Scribe Agent",
      description: "Processes call transcripts and extracts structured intelligence: session summaries, key decisions, commitments, tasks and goal updates. Runs automatically when Granola pulls a transcript, or manually by pasting a transcript in a client's profile.",
      trigger: "Automatic (Granola sync) or manual",
      schedule: "On every synced transcript",
      output: "Session summary draft → Agent Workspace",
      approval: true,
    },
    exec: {
      name: "Executive Assistant",
      description: "Generates a personalised weekly briefing for Jess covering all clients: health scores, upcoming calls, open tasks, unread messages, and MRR. Acts as your Chief of Staff — pulls everything together so you start each week with full context.",
      trigger: "Automatic (cron) or manual",
      schedule: "Sunday 9pm + Friday 7am (AEST)",
      output: "Briefing published to Command Centre",
      approval: false,
    },
    progress: {
      name: "Progress Agent",
      description: "Writes a personalised monthly progress report per client. Covers wins, goal progress, energy trend, biggest moment, next month focus, and a personal note from Jess. Also surfaces content ideas and resource gaps Jess could address.",
      trigger: "Automatic (last day of month) or manual",
      schedule: "Last day of each month at 10pm",
      output: "Progress report draft → Agent Workspace",
      approval: true,
    },
    content: {
      name: "Content Agent",
      description: "Creates a full monthly social media content plan for each client — posts, hooks, captions, call-to-actions — all grounded in real client data, goals and brand voice. Never generic: every post references something specific to the client.",
      trigger: "Manual",
      schedule: "On demand",
      output: "Content plan draft → Agent Workspace",
      approval: true,
    },
    prep: {
      name: "Prep Agent",
      description: "Generates a pre-call brief for Jess before every client session. Covers: client snapshot, what has changed since last call, Granola context, this week's focus, talking points and quick numbers. Runs automatically 24 hours before a scheduled call.",
      trigger: "Automatic (24h before call) or manual",
      schedule: "Every 30 minutes — fires when call is within 24h",
      output: "Prep brief draft → Agent Workspace (founder-only, never shown to client)",
      approval: true,
    },
    granola: {
      name: "Granola Sync Agent",
      description: "Connects to Granola via MCP and pulls today's meeting transcripts automatically. Matches each transcript to a client by name and email, creates a Call record, then triggers the Scribe Agent to process it. Unmatched transcripts go to a queue for manual assignment.",
      trigger: "Automatic (cron) or manual",
      schedule: "Hourly, Monday–Friday",
      output: "Call records + Scribe Agent triggered",
      approval: false,
    },
    onboarding: {
      name: "Onboarding Agent",
      description: "Writes personalised onboarding messages at each stage of the client onboarding journey. Step 1: welcome message. Step 2: intake form intro. Step 3: intake received acknowledgement + founder notes. Step 4: first call confirmation. Each message is warm, specific and never templated.",
      trigger: "Automatic (on new client creation + intake submission)",
      schedule: "Event-driven",
      output: "Onboarding message draft → Agent Workspace",
      approval: true,
    },
    pulse: {
      name: "Pulse Agent",
      description: "Sends personalised check-in nudges on Monday mornings and Friday progress messages at end of week. Every message references something specific from the client's recent sessions or goals — never copy-pasted. Also runs the churn risk scanner (Pulse scan) to flag clients who may be disengaging.",
      trigger: "Automatic (cron) or manual",
      schedule: "Monday 9am (nudge) · Friday 3pm (progress)",
      output: "Pulse message draft → Agent Workspace",
      approval: true,
    },
  };

  const c = configs[agentKey];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-medium text-[#1A1714]">{c.name}</h2>
        <p className="text-sm text-[#5C5550] mt-1.5 leading-relaxed">{c.description}</p>
      </div>

      {/* Meta row */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Trigger", value: c.trigger },
          { label: "Schedule", value: c.schedule },
          { label: "Output", value: c.output },
          { label: "Approval needed", value: c.approval ? "Yes — appears in Agent Workspace" : "No — published automatically" },
        ].map((m) => (
          <div key={m.label} className="rounded-2xl border border-[#E8E2D9] bg-[#FFFFFF] px-4 py-3">
            <p className="text-[10px] tracking-[0.08em] uppercase text-[#8C8277]">{m.label}</p>
            <p className="text-xs text-[#1A1714] mt-1 leading-relaxed">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Manual run */}
      <div className="rounded-2xl border border-[#E8E2D9] bg-[#FFFFFF] p-4 space-y-3">
        <p className="text-[10px] tracking-[0.08em] uppercase text-[#8C8277]">Run manually</p>

        {agentKey === "exec" && (
          <RunButton label="Generate briefing now" onRun={runExecBriefingAction} />
        )}

        {agentKey === "granola" && (
          <RunButton label="Sync Granola now" onRun={runGranolaSyncAction} />
        )}

        {agentKey === "scribe" && (
          <p className="text-xs text-[#5C5550]">
            Run the Scribe Agent from a client's profile page → paste transcript directly.{" "}
            <Link href="/clients" className="text-[#C8B89A] hover:underline">Go to clients →</Link>
          </p>
        )}

        {agentKey === "onboarding" && (
          <p className="text-xs text-[#5C5550]">
            Onboarding messages are triggered automatically when a new client is created or submits their intake form.{" "}
            <Link href="/clients/new" className="text-[#C8B89A] hover:underline">Add new client →</Link>
          </p>
        )}

        {agentKey === "progress" && (
          <ClientRunButton
            label="Generate progress report"
            clients={clients}
            onRun={runProgressReportAction}
          />
        )}

        {agentKey === "prep" && (
          <ClientRunButton
            label="Generate prep brief"
            clients={clients}
            onRun={runPrepBriefAction}
          />
        )}

        {agentKey === "content" && (
          <ClientRunButton
            label="Generate content plan"
            clients={clients}
            onRun={runContentPlanAction}
          />
        )}

        {agentKey === "pulse" && (
          <div className="space-y-3">
            <div>
              <p className="text-[10px] text-[#8C8277] mb-1.5">Check-in nudge</p>
              <ClientRunButton
                label="Send nudge"
                clients={clients}
                onRun={(id) => runPulseNudgeAction(id, "checkin_nudge")}
              />
            </div>
            <div>
              <p className="text-[10px] text-[#8C8277] mb-1.5">Friday progress message</p>
              <ClientRunButton
                label="Send progress message"
                clients={clients}
                onRun={(id) => runPulseNudgeAction(id, "friday_progress")}
              />
            </div>
          </div>
        )}
      </div>

      {/* Recent outputs */}
      <div className="space-y-2">
        <p className="text-[10px] tracking-[0.08em] uppercase text-[#8C8277]">Recent outputs (last 30 days)</p>

        {agentKey === "scribe" && <DraftList drafts={scribeDrafts} />}
        {agentKey === "progress" && <DraftList drafts={progressDrafts} />}
        {agentKey === "content" && <DraftList drafts={contentDrafts} />}
        {agentKey === "prep" && <DraftList drafts={prepDrafts} />}
        {agentKey === "onboarding" && <DraftList drafts={onboardingDrafts} />}
        {agentKey === "pulse" && <DraftList drafts={pulseDrafts} />}

        {agentKey === "exec" && (
          execOutputs.length === 0
            ? <p className="text-xs text-[#8C8277] italic">No briefings generated yet.</p>
            : (
              <div className="divide-y divide-[#E8E2D9] rounded-2xl border border-[#E8E2D9] overflow-hidden">
                {execOutputs.map((o) => (
                  <div key={o.id} className="px-4 py-3">
                    <p className="text-[10px] text-[#8C8277]">{fmtDateTime(o.createdAt)}</p>
                    <p className="text-xs text-[#5C5550] mt-1 line-clamp-2 leading-relaxed">{o.preview}…</p>
                  </div>
                ))}
              </div>
            )
        )}

        {agentKey === "granola" && (
          granolaSyncLogs.length === 0
            ? <p className="text-xs text-[#8C8277] italic">No syncs logged yet.</p>
            : (
              <div className="divide-y divide-[#E8E2D9] rounded-2xl border border-[#E8E2D9] overflow-hidden">
                {granolaSyncLogs.map((l) => (
                  <div key={l.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-[10px] text-[#8C8277]">{fmtDateTime(l.runAt)}</p>
                      {l.errors && (
                        <p className="text-[10px] text-[#9B2335] mt-0.5">{l.errors}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#1A1714]">
                        {l.transcriptsSaved} saved · {l.unmatched} unmatched
                      </p>
                      <p className="text-[10px] text-[#8C8277]">{l.meetingsFound} meetings found</p>
                    </div>
                  </div>
                ))}
              </div>
            )
        )}

        {/* Onboarding steps per client */}
        {agentKey === "onboarding" && onboardingSteps.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-[10px] tracking-[0.08em] uppercase text-[#8C8277]">Client onboarding status</p>
            {Array.from(new Set(onboardingSteps.map((s) => s.clientName))).map((name) => {
              const steps = onboardingSteps.filter((s) => s.clientName === name);
              const done = steps.filter((s) => s.status === "complete").length;
              return (
                <div key={name} className="flex items-center justify-between rounded-2xl border border-[#E8E2D9] px-4 py-3">
                  <p className="text-xs text-[#1A1714]">{name}</p>
                  <div className="flex items-center gap-3">
                    <p className="text-xs text-[#8C8277]">{done}/{steps.length} steps</p>
                    <div className="flex gap-1">
                      {[1,2,3,4].map((n) => {
                        const step = steps.find((s) => s.step === n);
                        const complete = step?.status === "complete";
                        return (
                          <div
                            key={n}
                            className={`w-2 h-2 rounded-full ${complete ? "bg-[#2D6A4F]" : "bg-[#E8E2D9]"}`}
                            title={`Step ${n}: ${step?.status ?? "not started"}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────

const AGENT_LIST: Array<{ key: AgentKey; label: string; icon: string }> = [
  { key: "scribe",     label: "Scribe",              icon: "✦" },
  { key: "exec",       label: "Executive Assistant", icon: "✦" },
  { key: "progress",   label: "Progress",            icon: "✦" },
  { key: "content",    label: "Content",             icon: "✦" },
  { key: "prep",       label: "Prep",                icon: "✦" },
  { key: "granola",    label: "Granola Sync",        icon: "✦" },
  { key: "onboarding", label: "Onboarding",          icon: "✦" },
  { key: "pulse",      label: "Pulse",               icon: "✦" },
];

export function AgentHub(props: {
  clients: Client[];
  scribeDrafts: DraftRow[];
  execOutputs: ExecRow[];
  progressDrafts: DraftRow[];
  contentDrafts: DraftRow[];
  prepDrafts: DraftRow[];
  granolaSyncLogs: SyncLog[];
  onboardingDrafts: DraftRow[];
  pulseDrafts: DraftRow[];
  onboardingSteps: OnboardingStepRow[];
}) {
  const [active, setActive] = useState<AgentKey>("scribe");

  // Count recent outputs per agent for the sidebar badge
  const counts: Record<AgentKey, number> = {
    scribe:     props.scribeDrafts.length,
    exec:       props.execOutputs.length,
    progress:   props.progressDrafts.length,
    content:    props.contentDrafts.length,
    prep:       props.prepDrafts.length,
    granola:    props.granolaSyncLogs.length,
    onboarding: props.onboardingDrafts.length,
    pulse:      props.pulseDrafts.length,
  };

  return (
    <div className="flex gap-6 items-start">
      {/* Left nav */}
      <div className="w-52 shrink-0 rounded-3xl border border-[#E8E2D9] bg-[#FFFFFF] overflow-hidden"
        style={{ boxShadow: "0 1px 3px rgba(92,71,48,0.08)" }}
      >
        {AGENT_LIST.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors border-b border-[#E8E2D9] last:border-0 ${
              active === key
                ? "bg-[#EDE8E0] border-l-2 border-l-[#C8B89A] pl-[14px]"
                : "hover:bg-[#F5F2ED]"
            }`}
          >
            <span className={`text-sm ${active === key ? "text-[#1A1714] font-medium" : "text-[#5C5550]"}`}>
              {label}
            </span>
            {counts[key] > 0 && (
              <span className="text-[9px] bg-[#F2EDE4] text-[#8C8277] rounded-full px-1.5 py-0.5">
                {counts[key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Detail panel */}
      <div className="flex-1 min-w-0 rounded-3xl border border-[#E8E2D9] bg-[#FFFFFF] p-6"
        style={{ boxShadow: "0 1px 3px rgba(92,71,48,0.08)" }}
      >
        <AgentDetail agentKey={active} {...props} />
      </div>
    </div>
  );
}
