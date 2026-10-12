"use client";

import { useActionState, useState } from "react";
import { addResourceAction } from "@/app/(founder)/library/actions";

const CATEGORIES = [
  "Sales and Conversion",
  "Retention and Client Experience",
  "Operations and Systems",
  "Content and Brand",
  "Mindset and Leadership",
  "Templates and Frameworks",
  "Pivot Co. Masterclasses",
];

const TYPES = ["Video", "PDF", "Guide", "Template", "Link"];
const VISIBILITY = [
  { value: "all", label: "All clients" },
  { value: "core", label: "Core only" },
  { value: "lite", label: "Lite only" },
  { value: "specific", label: "Specific client" },
];

type Client = { id: string; founderName: string; businessName: string };

export function AddResourceForm({ clients }: { clients: Client[] }) {
  const [open, setOpen] = useState(false);
  const [visibility, setVisibility] = useState("all");
  const [state, action, pending] = useActionState(addResourceAction, {});

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 text-xs tracking-[0.1em] uppercase bg-[#1A1714] text-[#FAFAF8] rounded-2xl hover:bg-[#2C2520] transition-colors"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 1v10M1 6h10" />
        </svg>
        Add resource
      </button>
    );
  }

  return (
    <div className="rounded-3xl border border-[#C8B89A]/20 bg-[#FFFFFF] p-6">
      <div className="flex items-center justify-between mb-6">
        <p className="text-[10px] tracking-[0.15em] uppercase text-[#5C5550]">New resource</p>
        <button onClick={() => setOpen(false)} className="text-[#8C8277] hover:text-[#1A1714] transition-colors">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M2 2l10 10M12 2L2 12" />
          </svg>
        </button>
      </div>

      <form action={action} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs text-[#5C5550] mb-1.5">Title</label>
            <input
              name="title"
              required
              placeholder="Resource title…"
              className="w-full bg-[#FFFFFF] border border-[#E8E2D9] rounded-2xl px-4 py-2.5 text-sm text-[#1A1714] placeholder-[#8C8277] focus:outline-none focus:border-[#C8B89A]/40 transition-colors"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-xs text-[#5C5550] mb-1.5">Description <span className="text-[#8C8277]">(optional)</span></label>
            <textarea
              name="description"
              rows={2}
              placeholder="Brief description of what this resource covers…"
              className="w-full bg-[#FFFFFF] border border-[#E8E2D9] rounded-2xl px-4 py-2.5 text-sm text-[#1A1714] placeholder-[#8C8277] focus:outline-none focus:border-[#C8B89A]/40 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs text-[#5C5550] mb-1.5">Category</label>
            <select
              name="category"
              required
              className="w-full bg-[#FFFFFF] border border-[#E8E2D9] rounded-2xl px-4 py-2.5 text-sm text-[#1A1714] focus:outline-none focus:border-[#C8B89A]/40 transition-colors"
            >
              <option value="">Select…</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs text-[#5C5550] mb-1.5">Type</label>
            <select
              name="type"
              required
              className="w-full bg-[#FFFFFF] border border-[#E8E2D9] rounded-2xl px-4 py-2.5 text-sm text-[#1A1714] focus:outline-none focus:border-[#C8B89A]/40 transition-colors"
            >
              <option value="">Select…</option>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-xs text-[#5C5550] mb-1.5">URL / Link</label>
            <input
              name="fileUrl"
              type="url"
              required
              placeholder="https://…"
              className="w-full bg-[#FFFFFF] border border-[#E8E2D9] rounded-2xl px-4 py-2.5 text-sm text-[#1A1714] placeholder-[#8C8277] focus:outline-none focus:border-[#C8B89A]/40 transition-colors"
            />
          </div>

          <div className={visibility === "specific" ? "" : "col-span-2"}>
            <label className="block text-xs text-[#5C5550] mb-1.5">Visibility</label>
            <select
              name="visibility"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#E8E2D9] rounded-2xl px-4 py-2.5 text-sm text-[#1A1714] focus:outline-none focus:border-[#C8B89A]/40 transition-colors"
            >
              {VISIBILITY.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
            </select>
          </div>

          {visibility === "specific" && (
            <div>
              <label className="block text-xs text-[#5C5550] mb-1.5">Client</label>
              <select
                name="specificClientId"
                required
                className="w-full bg-[#FFFFFF] border border-[#E8E2D9] rounded-2xl px-4 py-2.5 text-sm text-[#1A1714] focus:outline-none focus:border-[#C8B89A]/40 transition-colors"
              >
                <option value="">Select client…</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.founderName} · {c.businessName}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {state.error && <p className="text-xs text-[#9B2335]">{state.error}</p>}
        {state.success && <p className="text-xs text-[#2D6A4F]">{state.success}</p>}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-4 py-2.5 text-xs tracking-[0.1em] uppercase text-[#8C8277] hover:text-[#1A1714] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending}
            className="px-5 py-2.5 text-xs tracking-[0.1em] uppercase bg-[#1A1714] text-[#FAFAF8] rounded-2xl hover:bg-[#2C2520] disabled:opacity-40 transition-colors"
          >
            {pending ? "Adding…" : "Add resource"}
          </button>
        </div>
      </form>
    </div>
  );
}
