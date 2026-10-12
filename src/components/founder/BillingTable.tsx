"use client";

import { useActionState, useState } from "react";
import { updateBillingAction } from "@/app/(founder)/billing/actions";

type Client = {
  id: string;
  founderName: string;
  businessName: string;
  tier: string;
  monthlyInvestment: number | null;
  nextBillingDate: Date | null;
  billingNotes: string | null;
};

const initial: { error?: string; success?: string } = {};

function BillingRow({ client }: { client: Client }) {
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState(updateBillingAction, initial);

  const now = new Date();
  const billingDate = client.nextBillingDate ? new Date(client.nextBillingDate) : null;
  const isOverdue = billingDate && billingDate < now;
  const isDueThisWeek =
    billingDate &&
    !isOverdue &&
    billingDate.getTime() - now.getTime() <= 7 * 24 * 60 * 60 * 1000;

  return (
    <>
      <div className="grid grid-cols-5 px-6 py-4 items-center border-b border-[#E8E2D9] last:border-b-0">
        <div>
          <p className="text-sm text-[#1A1714]">{client.founderName}</p>
          <p className="text-xs text-[#5C5550]">{client.businessName}</p>
        </div>
        <p className="text-xs text-[#1A1714]">{client.tier}</p>
        <p className="text-sm text-[#C8B89A]">
          {client.monthlyInvestment ? `$${client.monthlyInvestment.toLocaleString("en-AU")}` : "-"}
        </p>
        <div>
          {billingDate ? (
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                isOverdue
                  ? "text-[#9B2335] bg-[#9B2335]/10"
                  : isDueThisWeek
                  ? "text-[#B7791F] bg-[#B7791F]/10"
                  : "text-[#5C5550]"
              }`}
            >
              {isOverdue && "Overdue · "}
              {billingDate.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          ) : (
            <span className="text-xs text-[#8C8277]">—</span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#8C8277] truncate max-w-[120px]">{client.billingNotes || "—"}</p>
          <button
            onClick={() => setEditing((v) => !v)}
            className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] hover:text-[#1A1714] transition-colors ml-2"
          >
            Edit
          </button>
        </div>
      </div>

      {editing && (
        <div className="border-b border-[#E8E2D9] bg-[#F2EDE4] px-6 py-5">
          <form action={action} className="grid grid-cols-4 gap-4 items-end">
            <input type="hidden" name="clientProfileId" value={client.id} />
            <div className="space-y-1.5">
              <label className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277]">Monthly ($)</label>
              <input
                name="monthlyInvestment"
                type="number"
                step="50"
                defaultValue={client.monthlyInvestment ?? ""}
                placeholder="e.g. 2500"
                className="w-full bg-[#FFFFFF] border border-[#E8E2D9] rounded-2xl px-3 py-2 text-xs text-[#1A1714] focus:outline-none focus:border-[#C8B89A]/40"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277]">Next Billing Date</label>
              <input
                name="nextBillingDate"
                type="date"
                defaultValue={
                  client.nextBillingDate
                    ? new Date(client.nextBillingDate).toISOString().split("T")[0]
                    : ""
                }
                className="w-full bg-[#FFFFFF] border border-[#E8E2D9] rounded-2xl px-3 py-2 text-xs text-[#1A1714] focus:outline-none focus:border-[#C8B89A]/40"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277]">Notes</label>
              <input
                name="billingNotes"
                type="text"
                defaultValue={client.billingNotes ?? ""}
                placeholder="e.g. invoice sent"
                className="w-full bg-[#FFFFFF] border border-[#E8E2D9] rounded-2xl px-3 py-2 text-xs text-[#1A1714] focus:outline-none focus:border-[#C8B89A]/40"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={pending}
                className="px-4 py-2 text-[10px] tracking-[0.1em] uppercase text-[#FAFAF8] bg-[#1A1714] rounded-2xl hover:bg-[#2C2520] transition-colors disabled:opacity-40"
              >
                {pending ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-4 py-2 text-[10px] tracking-[0.1em] uppercase text-[#5C5550] hover:text-[#1A1714] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
          {state?.success && <p className="text-xs text-[#2D6A4F] mt-2">{state.success}</p>}
          {state?.error && <p className="text-xs text-[#9B2335] mt-2">{state.error}</p>}
        </div>
      )}
    </>
  );
}

export function BillingTable({ clients }: { clients: Client[] }) {
  if (clients.length === 0) {
    return (
      <div className="rounded-3xl border border-[#E8E2D9] px-6 py-10 text-center text-sm text-[#8C8277]">
        No clients yet.
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-[#E8E2D9] overflow-hidden">
      <div className="grid grid-cols-5 px-6 py-3 border-b border-[#E8E2D9]">
        {["Client", "Tier", "Monthly", "Next Billing", "Notes"].map((h) => (
          <p key={h} className="text-[10px] tracking-[0.12em] uppercase text-[#8C8277]">{h}</p>
        ))}
      </div>
      {clients.map((client) => (
        <BillingRow key={client.id} client={client} />
      ))}
    </div>
  );
}
