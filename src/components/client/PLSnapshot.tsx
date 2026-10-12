"use client";

import { useActionState, useState } from "react";
import { addExpenseAction, deleteExpenseAction } from "@/app/(client)/health/actions";

type Expense = { id: string; name: string; amount: number };

type MonthData = {
  label: string;
  revenue: number;
  target: number;
};

function BarChart({ months }: { months: MonthData[] }) {
  const maxVal = Math.max(...months.map((m) => Math.max(m.revenue, m.target)), 1);
  const h = 80;
  const w = 40;
  const gap = 8;
  const total = months.length * (w + gap) - gap;

  return (
    <svg width={total} height={h + 24} viewBox={`0 0 ${total} ${h + 24}`} className="w-full">
      {months.map((m, i) => {
        const x = i * (w + gap);
        const barH = Math.max(2, (m.revenue / maxVal) * h);
        const tH = Math.max(1, (m.target / maxVal) * h);
        return (
          <g key={m.label}>
            {/* Target line */}
            <line x1={x} y1={h - tH} x2={x + w} y2={h - tH}
              stroke="#E8E2D9" strokeWidth="1.5" strokeDasharray="3 2" />
            {/* Revenue bar */}
            <rect x={x} y={h - barH} width={w} height={barH}
              fill={m.revenue >= m.target ? "#2D6A4F" : m.revenue >= m.target * 0.7 ? "#B7791F" : "#9B2335"}
              rx="4"
            />
            {/* Label */}
            <text x={x + w / 2} y={h + 16} textAnchor="middle"
              fill="#8C8277" fontSize="9" fontFamily="inherit">{m.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function PLSnapshot({
  months,
  currentRevenue,
  monthlyTarget,
  expenses: initialExpenses,
}: {
  months: MonthData[];
  currentRevenue: number;
  monthlyTarget: number;
  expenses: Expense[];
}) {
  const totalExpenses = initialExpenses.reduce((s, e) => s + e.amount, 0);
  const net = currentRevenue - totalExpenses;

  const [addState, addAction, addPending] = useActionState(addExpenseAction, {});
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="rounded-3xl border border-[#E8E2D9] bg-[#FFFFFF] p-6 space-y-5">
      <p className="text-[10px] tracking-[0.15em] uppercase text-[#5C5550]">Monthly P&L Snapshot</p>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Revenue", val: `$${currentRevenue.toLocaleString("en-AU")}`, color: "text-[#1A1714]" },
          { label: "Expenses", val: `$${totalExpenses.toLocaleString("en-AU")}`, color: "text-[#5C5550]" },
          { label: "Net profit", val: `$${net.toLocaleString("en-AU")}`, color: net >= 0 ? "text-[#2D6A4F]" : "text-[#9B2335]" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-[#F2EDE4] p-3 text-center">
            <div className={`font-display text-xl font-thin ${s.color}`}>{s.val}</div>
            <div className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* vs target */}
      <div className="flex items-center gap-2 text-xs text-[#5C5550]">
        <span>vs. monthly target</span>
        <span className={currentRevenue >= monthlyTarget ? "text-[#2D6A4F]" : "text-[#B7791F]"}>
          {currentRevenue >= monthlyTarget ? "▲" : "▼"} ${Math.abs(currentRevenue - monthlyTarget).toLocaleString("en-AU")}
        </span>
        <span>{currentRevenue >= monthlyTarget ? "ahead" : "behind"}</span>
      </div>

      {/* Bar chart */}
      {months.length > 1 && (
        <div>
          <p className="text-[9px] tracking-[0.1em] uppercase text-[#8C8277] mb-3">Last 6 months</p>
          <BarChart months={months} />
        </div>
      )}

      {/* Expenses list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[9px] tracking-[0.1em] uppercase text-[#8C8277]">Known monthly expenses</p>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="text-[10px] text-[#8C8277] hover:text-[#1A1714] transition-colors"
          >+ Add</button>
        </div>

        {showAdd && (
          <form action={async (fd) => { await addAction(fd); setShowAdd(false); }} className="flex gap-2 mb-3">
            <input name="name" placeholder="Expense name"
              className="flex-1 bg-[#FFFFFF] border border-[#E8E2D9] rounded-2xl px-3 py-2 text-xs text-[#1A1714] placeholder-[#8C8277] focus:outline-none focus:border-[#C8B89A]/40" />
            <input name="amount" type="number" placeholder="$0"
              className="w-24 bg-[#FFFFFF] border border-[#E8E2D9] rounded-2xl px-3 py-2 text-xs text-[#1A1714] placeholder-[#8C8277] focus:outline-none focus:border-[#C8B89A]/40" />
            <button type="submit" disabled={addPending}
              className="px-4 py-2 text-xs bg-[#1A1714] text-[#FAFAF8] rounded-2xl hover:bg-[#2C2520] disabled:opacity-40">
              Add
            </button>
          </form>
        )}

        <div className="space-y-1">
          {initialExpenses.length === 0 && (
            <p className="text-xs text-[#8C8277] italic">No expenses added yet.</p>
          )}
          {initialExpenses.map((e) => (
            <div key={e.id} className="flex items-center justify-between text-xs">
              <span className="text-[#5C5550]">{e.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-[#1A1714]">${e.amount.toLocaleString("en-AU")}/mo</span>
                <form action={() => deleteExpenseAction(e.id)}>
                  <button type="submit" className="text-[#8C8277] hover:text-[#9B2335] transition-colors">×</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
