"use client";

import { useState, useMemo } from "react";

export type LeadStatus =
  | "not_contacted"
  | "contacted"
  | "replied"
  | "meeting_booked"
  | "won"
  | "not_interested"
  | "unsubscribed";

export type Lead = {
  id: string;
  name: string;
  businessName: string;
  industry: string;
  email: string;
  phone?: string;
  instagram?: string;
  status: LeadStatus;
  source: string;
  assignedTo: "Jess" | "Lovisa";
  notes: string;
  lastContactedAt?: string;
  nextFollowUp?: string;
  createdAt: string;
};

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; bg: string; dot: string }> = {
  not_contacted: { label: "Not Contacted", color: "#7a7268", bg: "white", dot: "#7a7268" },
  contacted:     { label: "Contacted",     color: "#8C735A", bg: "#F5EFE5", dot: "#8C735A" },
  replied:       { label: "Replied",       color: "#2D5F8A", bg: "#EBF2F9", dot: "#2D5F8A" },
  meeting_booked:{ label: "Meeting Booked",color: "#5A6B2A", bg: "#EDF2E5", dot: "#5A6B2A" },
  won:           { label: "Won",           color: "#2D6A4F", bg: "#E5F2EC", dot: "#2D6A4F" },
  not_interested:{ label: "Not Interested",color: "#9B4F2A", bg: "#F9EDE5", dot: "#9B4F2A" },
  unsubscribed:  { label: "Unsubscribed",  color: "#9B2335", bg: "#F9E5E8", dot: "#9B2335" },
};

const PIPELINE_ORDER: LeadStatus[] = [
  "not_contacted", "contacted", "replied", "meeting_booked", "won", "not_interested", "unsubscribed",
];

const TABS = ["Tracker", "Generator", "Find Businesses", "Add a Business", "Your Agency"] as const;
type Tab = typeof TABS[number];

function StatusPill({ status }: { status: LeadStatus }) {
  const c = STATUS_CONFIG[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.1em] px-2 py-1 rounded" style={{ color: c.color, background: c.bg }}>
      <span className="w-1 h-1 rounded-full" style={{ background: c.dot }} />
      {c.label}
    </span>
  );
}

function LeadDetail({ lead, onStatusChange, onDelete }: { lead: Lead; onStatusChange: (id: string, status: LeadStatus) => void; onDelete: (id: string) => void }) {
  const c = STATUS_CONFIG[lead.status];
  return (
    <div className="h-full overflow-y-auto">
      <div className="border-b border-[#EDEBE6] pb-5 mb-5">
        <p className="text-[9px] tracking-[0.22em] text-[#7a7268] mb-1">{lead.industry} · {lead.source}</p>
        <h2 className="text-3xl font-[300] text-[#1A1917]">{lead.name}</h2>
        <p className="text-sm text-[#7a7268] mt-0.5">{lead.businessName}</p>
        {lead.instagram && <p className="text-xs text-[#8C735A] mt-1">{lead.instagram}</p>}
      </div>

      {/* Status selector */}
      <div className="mb-6">
        <p className="text-[9px] tracking-[0.22em] text-[#7a7268] mb-3">Status</p>
        <div className="flex flex-wrap gap-2">
          {PIPELINE_ORDER.map((s) => {
            const sc = STATUS_CONFIG[s];
            const active = lead.status === s;
            return (
              <button
                key={s}
                onClick={() => onStatusChange(lead.id, s)}
                className="text-[10px] tracking-[0.1em] px-3 py-1.5 rounded transition-all border"
                style={active
                  ? { color: sc.color, background: sc.bg, borderColor: sc.dot }
                  : { color: "#7a7268", background: "transparent", borderColor: "#EDEBE6" }
                }
              >
                {sc.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contact */}
      <div className="mb-6 border-t border-[#EDEBE6] pt-5">
        <p className="text-[9px] tracking-[0.22em] text-[#7a7268] mb-3">Contact</p>
        <div className="space-y-2">
          <p className="text-sm text-[#1A1917]">{lead.email}</p>
          {lead.phone && <p className="text-sm text-[#7a7268]">{lead.phone}</p>}
        </div>
      </div>

      {/* Assignment */}
      <div className="mb-6 border-t border-[#EDEBE6] pt-5">
        <p className="text-[9px] tracking-[0.22em] text-[#7a7268] mb-2">Assigned to</p>
        <p className="text-sm text-[#1A1917]">{lead.assignedTo}</p>
      </div>

      {/* Timeline */}
      {(lead.lastContactedAt || lead.nextFollowUp) && (
        <div className="mb-6 border-t border-[#EDEBE6] pt-5">
          <p className="text-[9px] tracking-[0.22em] text-[#7a7268] mb-3">Timeline</p>
          <div className="space-y-2">
            {lead.lastContactedAt && (
              <div className="flex justify-between text-xs">
                <span className="text-[#7a7268]">Last contacted</span>
                <span className="text-[#1A1917]">{new Date(lead.lastContactedAt).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}</span>
              </div>
            )}
            {lead.nextFollowUp && (
              <div className="flex justify-between text-xs">
                <span className="text-[#7a7268]">Next follow-up</span>
                <span className="text-[#8C735A]">{new Date(lead.nextFollowUp).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="border-t border-[#EDEBE6] pt-5">
        <p className="text-[9px] tracking-[0.22em] text-[#7a7268] mb-3">Notes</p>
        <p className="text-sm text-[#1A1917] leading-6">{lead.notes}</p>
      </div>

      {/* Remove */}
      <div className="border-t border-[#EDEBE6] pt-5 mt-6">
        <button
          onClick={() => {
            if (confirm(`Remove ${lead.name} from the CRM?`)) onDelete(lead.id);
          }}
          className="text-[10px] tracking-[0.08em] text-red-400 hover:text-red-600 transition-colors"
        >
          Remove lead
        </button>
      </div>
    </div>
  );
}

export function LeadDesk({ initialLeads }: { initialLeads: Lead[] }) {
  const [tab, setTab] = useState<Tab>("Tracker");
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [selectedId, setSelectedId] = useState<string | null>(initialLeads[0]?.id ?? null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<LeadStatus | "all">("all");

  const selectedLead = leads.find((l) => l.id === selectedId) ?? null;

  const counts = useMemo(() => {
    const all = leads.length;
    const byStatus = Object.fromEntries(
      PIPELINE_ORDER.map((s) => [s, leads.filter((l) => l.status === s).length])
    ) as Record<LeadStatus, number>;
    return { all, ...byStatus };
  }, [leads]);

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const matchSearch =
        !search ||
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.businessName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "all" || l.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [leads, search, filterStatus]);

  function handleStatusChange(id: string, status: LeadStatus) {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  }

  function handleDelete(id: string) {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setSelectedId((prev) => {
      if (prev !== id) return prev;
      const remaining = leads.filter((l) => l.id !== id);
      return remaining[0]?.id ?? null;
    });
  }

  return (
    <div className="max-w-6xl space-y-8">
      {/* Header */}
      <div className="border-b border-[#EDEBE6] pb-6 flex items-end justify-between">
        <div>
          <p className="text-[9px] tracking-[0.22em] text-[#7a7268] mb-1">Pivot Co</p>
          <h1 className="text-5xl font-[300] tracking-tight text-[#1A1917]">CRM</h1>
        </div>
        <button className="text-xs tracking-[0.1em] text-[#8C735A] border border-[#8C735A]/30 px-4 py-2 rounded hover:bg-[#8C735A]/5 transition-colors">
          + Add Lead
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-[#EDEBE6]">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-xs tracking-[0.08em] transition-colors -mb-px ${
              tab === t
                ? "text-[#1A1917] border-b-2 border-[#1A1917]"
                : "text-[#7a7268] hover:text-[#1A1917]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Tracker" && (
        <>
          {/* Pipeline tiles */}
          <div className="grid grid-cols-7 gap-3">
            {([["all", "All Leads", counts.all]] as [string, string, number][]).concat(
              PIPELINE_ORDER.map((s) => [s, STATUS_CONFIG[s].label, counts[s]])
            ).map(([s, label, count]) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s as LeadStatus | "all")}
                className={`border-t pt-3 text-left transition-colors ${
                  filterStatus === s ? "border-[#1A1917]" : "border-[#EDEBE6] hover:border-[#8C735A]/50"
                }`}
              >
                <p className={`text-[9px] tracking-[0.18em] leading-tight ${filterStatus === s ? "text-[#1A1917]" : "text-[#7a7268]"}`}>
                  {label}
                </p>
                <p className={`text-3xl font-[300] mt-1 ${filterStatus === s ? "text-[#1A1917]" : "text-[#7a7268]"}`}>
                  {count}
                </p>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a7268]" width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3">
              <circle cx="6" cy="6" r="4.5" /><path d="M9.5 9.5l3 3" />
            </svg>
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#EDEBE6] rounded bg-transparent text-[#1A1917] placeholder:text-[#7a7268] focus:outline-none focus:border-[#8C735A] transition-colors"
            />
          </div>

          {/* Split view */}
          <div className="flex gap-0 border border-[#EDEBE6] rounded" style={{ height: "520px" }}>
            {/* Lead list */}
            <div className="w-[42%] border-r border-[#EDEBE6] overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="p-6 text-sm text-[#7a7268] text-center">No leads found.</div>
              ) : (
                filtered.map((lead, i) => {
                  const active = lead.id === selectedId;
                  const c = STATUS_CONFIG[lead.status];
                  return (
                    <button
                      key={lead.id}
                      onClick={() => setSelectedId(lead.id)}
                      className={`w-full text-left px-5 py-4 transition-colors ${
                        active ? "bg-[#F5F3EF]/50" : "hover:bg-[white]"
                      } ${i > 0 ? "border-t border-[#EDEBE6]" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className={`text-sm truncate ${active ? "text-[#1A1917] font-[450]" : "text-[#1A1917]"}`}>
                            {lead.name}
                          </p>
                          <p className="text-xs text-[#7a7268] truncate">{lead.businessName}</p>
                        </div>
                        <span className="shrink-0 w-1.5 h-1.5 rounded-full mt-1.5" style={{ background: c.dot }} />
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[9px] tracking-[0.1em]" style={{ color: c.color }}>{c.label}</span>
                        <span className="text-[9px] text-[#7a7268]">· {lead.assignedTo}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Detail panel */}
            <div className="flex-1 p-6 overflow-y-auto">
              {selectedLead ? (
                <LeadDetail lead={selectedLead} onStatusChange={handleStatusChange} onDelete={handleDelete} />
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-[#7a7268]">
                  Select a lead to view details
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {tab === "Generator" && (
        <div className="border border-[#EDEBE6] rounded px-8 py-16 text-center">
          <p className="text-[9px] tracking-[0.22em] text-[#7a7268] mb-3">Coming soon</p>
          <p className="text-2xl font-[300] text-[#1A1917]">AI Lead Generator</p>
          <p className="text-sm text-[#7a7268] mt-2 max-w-xs mx-auto">Generate targeted lead lists from Instagram, LinkedIn and local business directories.</p>
        </div>
      )}

      {tab === "Find Businesses" && (
        <div className="border border-[#EDEBE6] rounded px-8 py-16 text-center">
          <p className="text-[9px] tracking-[0.22em] text-[#7a7268] mb-3">Coming soon</p>
          <p className="text-2xl font-[300] text-[#1A1917]">Find Businesses</p>
          <p className="text-sm text-[#7a7268] mt-2 max-w-xs mx-auto">Search and browse businesses by industry, location, and social presence.</p>
        </div>
      )}

      {tab === "Add a Business" && (
        <div className="max-w-lg border border-[#EDEBE6] rounded p-8 space-y-5">
          <p className="text-[9px] tracking-[0.22em] text-[#7a7268]">New Lead</p>
          {[
            { label: "Full name", placeholder: "Jane Smith" },
            { label: "Business name", placeholder: "Smith & Co." },
            { label: "Industry", placeholder: "e.g. Wellness, Retail, Fitness" },
            { label: "Email", placeholder: "jane@example.com" },
            { label: "Instagram handle", placeholder: "@handle" },
          ].map((f) => (
            <div key={f.label}>
              <label className="block text-[9px] tracking-[0.18em] text-[#7a7268] mb-1.5">{f.label}</label>
              <input
                type="text"
                placeholder={f.placeholder}
                className="w-full px-3 py-2.5 text-sm border border-[#EDEBE6] rounded bg-transparent text-[#1A1917] placeholder:text-[#7a7268]/50 focus:outline-none focus:border-[#8C735A] transition-colors"
              />
            </div>
          ))}
          <div>
            <label className="block text-[9px] tracking-[0.18em] text-[#7a7268] mb-1.5">Assign to</label>
            <div className="flex gap-3">
              {["Jess", "Lovisa"].map((name) => (
                <button key={name} className="flex-1 py-2.5 text-sm border border-[#EDEBE6] rounded text-[#7a7268] hover:border-[#8C735A] hover:text-[#1A1917] transition-colors">
                  {name}
                </button>
              ))}
            </div>
          </div>
          <button className="w-full py-2.5 text-xs tracking-[0.1em] bg-[#1A1917] text-[white] rounded hover:bg-[#2a2520] transition-colors mt-2">
            Add Lead
          </button>
        </div>
      )}

      {tab === "Your Agency" && (
        <div className="border border-[#EDEBE6] rounded px-8 py-16 text-center">
          <p className="text-[9px] tracking-[0.22em] text-[#7a7268] mb-3">Coming soon</p>
          <p className="text-2xl font-[300] text-[#1A1917]">Your Agency</p>
          <p className="text-sm text-[#7a7268] mt-2 max-w-xs mx-auto">Agency profile, team members, service packages and pitch deck.</p>
        </div>
      )}
    </div>
  );
}
