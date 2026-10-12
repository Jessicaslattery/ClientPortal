"use client";

import { useState, useTransition } from "react";
import { founderBulkAddPostsAction, type BulkRow } from "@/app/(founder)/clients/[id]/content-calendar/actions";
import { POST_TYPES, POST_TYPE_LABELS, FUNNEL_STAGES, FUNNEL_LABELS, HOOK_TYPES, HOOK_TYPE_LABELS } from "@/lib/contentPostOptions";

const KINDS = [...POST_TYPES, "story"] as const;
const KIND_LABELS: Record<string, string> = { ...POST_TYPE_LABELS, story: "Story" };

const inputClass = "w-full rounded-lg border border-[#E8E2D9] bg-white px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#C8B89A]";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function addDays(dateKey: string, days: number) {
  const d = new Date(`${dateKey}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function blankRow(postDate: string, prev?: BulkRow): BulkRow {
  return {
    postDate,
    kind: prev?.kind ?? "reel",
    funnel: prev?.funnel ?? "top",
    topic: "",
    hook: "",
    hookType: prev?.hookType ?? "visual",
    inspirationLink: "",
    planDetails: "",
  };
}

// Accepts 2026-10-23, 23/10/2026, 23/10/26 or 23/10 (year taken from the month being viewed).
function parseDate(raw: string, fallbackYear: number): string | null {
  const v = raw.trim();
  let y: number, m: number, d: number;
  let match = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match) {
    [y, m, d] = [+match[1], +match[2], +match[3]];
  } else if ((match = v.match(/^(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{2,4}))?$/))) {
    d = +match[1];
    m = +match[2];
    y = match[3] ? (match[3].length === 2 ? 2000 + +match[3] : +match[3]) : fallbackYear;
  } else return null;
  const key = `${y}-${pad(m)}-${pad(d)}`;
  const check = new Date(`${key}T00:00:00Z`);
  return isNaN(check.getTime()) || check.toISOString().slice(0, 10) !== key ? null : key;
}

function parseKind(raw: string): string {
  const v = raw.trim().toLowerCase();
  if (v.startsWith("stor")) return "story";
  if (v.startsWith("car")) return "carousel";
  if (v.startsWith("pic") || v.startsWith("img") || v.startsWith("image") || v.startsWith("photo") || v.startsWith("static")) return "picture";
  return "reel";
}

function parseFunnel(raw: string): string {
  const v = raw.trim().toLowerCase();
  if (v.startsWith("m")) return "middle";
  if (v.startsWith("b")) return "bottom";
  return "top";
}

// Columns: Date | Type | Funnel | Topic | Hook | Details
function parsePasted(text: string, fallbackYear: number): { rows: BulkRow[]; skipped: number } {
  const rows: BulkRow[] = [];
  let skipped = 0;
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const cells = line.split("\t");
    const date = parseDate(cells[0] ?? "", fallbackYear);
    if (!date) {
      if (!/^date$/i.test((cells[0] ?? "").trim())) skipped++;
      continue;
    }
    const kind = parseKind(cells[1] ?? "");
    const details = (cells[5] ?? "").trim();
    rows.push({
      postDate: date,
      kind,
      funnel: parseFunnel(cells[2] ?? ""),
      topic: kind === "story" ? "" : (cells[3] ?? "").trim(),
      hook: kind === "story" ? "" : (cells[4] ?? "").trim(),
      hookType: "visual",
      inspirationLink: "",
      planDetails: kind === "story" && !details ? (cells[3] ?? "").trim() : details,
    });
  }
  return { rows, skipped };
}

export function BulkAddPosts({ clientProfileId, month, onDone }: { clientProfileId: string; month: string; onDone: () => void }) {
  const [year] = month.split("-").map(Number);
  const [rows, setRows] = useState<BulkRow[]>(() => [blankRow(`${month}-01`)]);
  const [rowErrors, setRowErrors] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPaste, setShowPaste] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [pasteNote, setPasteNote] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function update(i: number, patch: Partial<BulkRow>) {
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
    setRowErrors((e) => {
      if (!(i in e)) return e;
      const { [i]: _drop, ...rest } = e;
      return rest;
    });
  }

  function addRow() {
    setRows((rs) => {
      const prev = rs[rs.length - 1];
      return [...rs, blankRow(prev?.postDate ? addDays(prev.postDate, 1) : `${month}-01`, prev)];
    });
  }

  function removeRow(i: number) {
    setRows((rs) => (rs.length === 1 ? rs : rs.filter((_, idx) => idx !== i)));
    setRowErrors({});
  }

  function loadPasted() {
    const { rows: parsed, skipped } = parsePasted(pasteText, year);
    if (parsed.length === 0) {
      setPasteNote("Couldn't read any rows. Each line needs a date first (e.g. 23/10/2026), then Type, Funnel, Topic, Hook, Details separated by tabs.");
      return;
    }
    const isBlank = rows.length === 1 && !rows[0].topic && !rows[0].planDetails;
    setRows((rs) => (isBlank ? parsed : [...rs, ...parsed]));
    setPasteNote(`Loaded ${parsed.length} row${parsed.length === 1 ? "" : "s"}${skipped ? ` · ${skipped} line${skipped === 1 ? "" : "s"} skipped (no valid date)` : ""}. Check them below, then Save all.`);
    setPasteText("");
    setRowErrors({});
  }

  function save() {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      try {
        const res = await founderBulkAddPostsAction(clientProfileId, rows);
        if (res.created) {
          setSuccess(`Added ${res.created} item${res.created === 1 ? "" : "s"}. They show under each item's own month — use the month arrows to check.`);
          setRows([blankRow(`${month}-01`)]);
          setRowErrors({});
        } else {
          setError(res.error ?? "Something went wrong — nothing was saved.");
          setRowErrors(res.rowErrors ?? {});
        }
      } catch {
        setError("Couldn't reach the server — nothing was saved. Your rows are still here, try again.");
      }
    });
  }

  const labelClass = "text-[9px] tracking-[0.1em] uppercase text-[#8C8277] mb-1 block";

  return (
    <div className="rounded-2xl border border-[#C8B89A] bg-[#FDFCFA] p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[#1A1714]">Bulk add</p>
          <p className="text-xs text-[#8C8277] mt-0.5">Add any dates, any months. Nothing saves until you press Save all — and if a row has a problem, nothing is saved.</p>
        </div>
        <button type="button" onClick={onDone} className="text-[#8C8277] hover:text-[#1A1714] text-lg leading-none">×</button>
      </div>

      <div>
        <button type="button" onClick={() => setShowPaste(!showPaste)} className="text-[10px] tracking-[0.1em] uppercase text-[#5C5550] hover:text-[#1A1714]">
          {showPaste ? "− Hide paste" : "+ Paste from spreadsheet"}
        </button>
        {showPaste && (
          <div className="mt-2 space-y-2">
            <p className="text-[11px] text-[#8C8277]">Copy rows from Sheets/Excel with columns in this order: <span className="text-[#5C5550]">Date · Type · Funnel · Topic · Hook · Details</span>. Stories: put the outline in Details (or Topic).</p>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              rows={4}
              placeholder={"23/10/2026\tReel\tTop\tMorning routine\tI stopped doing this…\tShow 3 steps…"}
              className={`${inputClass} font-mono`}
            />
            <button type="button" onClick={loadPasted} disabled={!pasteText.trim()} className="px-4 py-1.5 rounded-lg border border-[#E8E2D9] text-xs text-[#5C5550] hover:border-[#C8B89A] disabled:opacity-40">
              Load into rows
            </button>
          </div>
        )}
        {pasteNote && <p className="text-[11px] text-[#5C5550] mt-2">{pasteNote}</p>}
      </div>

      <div className="space-y-3">
        {rows.map((r, i) => {
          const isStory = r.kind === "story";
          return (
            <div key={i} className={`rounded-xl border p-3 space-y-2 bg-white ${rowErrors[i] ? "border-[#9B2335]" : "border-[#E8E2D9]"}`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#8C8277]">#{i + 1}</span>
                <button type="button" onClick={() => removeRow(i)} disabled={rows.length === 1} className="text-[#8C8277] hover:text-[#9B2335] text-sm leading-none disabled:opacity-30" title="Remove row">×</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div>
                  <label className={labelClass}>Date</label>
                  <input type="date" value={r.postDate} onChange={(e) => update(i, { postDate: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Type</label>
                  <select value={r.kind} onChange={(e) => update(i, { kind: e.target.value })} className={inputClass}>
                    {KINDS.map((k) => <option key={k} value={k}>{KIND_LABELS[k]}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Funnel</label>
                  <select value={r.funnel} onChange={(e) => update(i, { funnel: e.target.value })} className={inputClass}>
                    {FUNNEL_STAGES.map((f) => <option key={f} value={f}>{FUNNEL_LABELS[f]}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Hook type</label>
                  <select value={r.hookType} onChange={(e) => update(i, { hookType: e.target.value })} disabled={isStory} className={`${inputClass} disabled:opacity-40`}>
                    {HOOK_TYPES.map((h) => <option key={h} value={h}>{HOOK_TYPE_LABELS[h]}</option>)}
                  </select>
                </div>
              </div>
              {!isStory && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className={labelClass}>Topic *</label>
                    <input value={r.topic} onChange={(e) => update(i, { topic: e.target.value })} placeholder="What's this piece about?" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Hook</label>
                    <input value={r.hook} onChange={(e) => update(i, { hook: e.target.value })} placeholder="Opening line / idea" className={inputClass} />
                  </div>
                </div>
              )}
              <div className={`grid gap-2 ${isStory ? "grid-cols-1" : "grid-cols-1 md:grid-cols-[2fr_1fr]"}`}>
                <div>
                  <label className={labelClass}>{isStory ? "Story outline *" : "Details / plan structure"}</label>
                  <textarea value={r.planDetails} onChange={(e) => update(i, { planDetails: e.target.value })} rows={2} placeholder={isStory ? "What happens across this story sequence…" : "Structure, talking points, shots…"} className={`${inputClass} resize-y`} />
                </div>
                {!isStory && (
                  <div>
                    <label className={labelClass}>Inspo link</label>
                    <input value={r.inspirationLink} onChange={(e) => update(i, { inspirationLink: e.target.value })} placeholder="https://…" className={inputClass} />
                  </div>
                )}
              </div>
              {rowErrors[i] && <p className="text-[11px] text-[#9B2335]">{rowErrors[i]}</p>}
            </div>
          );
        })}
      </div>

      {error && <p className="text-xs text-[#9B2335]">{error}</p>}
      {success && <p className="text-xs text-[#2D6A4F]">{success}</p>}

      <div className="flex items-center gap-3">
        <button type="button" onClick={addRow} className="px-4 py-2 rounded-xl border border-[#E8E2D9] text-xs text-[#5C5550] hover:border-[#C8B89A]">+ Add row</button>
        <button type="button" onClick={save} disabled={pending} className="px-5 py-2 rounded-xl bg-[#1A1714] text-[#FAFAF8] text-xs tracking-[0.1em] uppercase disabled:opacity-50">
          {pending ? "Saving…" : `Save all (${rows.length})`}
        </button>
      </div>
    </div>
  );
}
