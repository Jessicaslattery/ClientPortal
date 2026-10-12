"use client";

import { useActionState, useState } from "react";
import {
  addExpenseAction,
  updateExpenseAction,
  deleteExpenseAction,
  addIncomeAction,
  updateIncomeAction,
  deleteIncomeAction,
} from "@/app/(founder)/expenses/actions";

type Expense = {
  id: string;
  name: string;
  amount: number;
  category: string;
  month: string;
  notes: string | null;
};

type Income = {
  id: string;
  name: string;
  amount: number;
  month: string;
  notes: string | null;
};

const CATEGORIES = ["Operations", "Tools & Software", "Marketing", "Education", "Contractors", "Tax & Accounting", "Other"];

const MONTHS_LABEL: Record<string, string> = {
  "01": "January", "02": "February", "03": "March", "04": "April",
  "05": "May", "06": "June", "07": "July", "08": "August",
  "09": "September", "10": "October", "11": "November", "12": "December",
};

function monthLabel(key: string) {
  const [year, m] = key.split("-");
  return `${MONTHS_LABEL[m] ?? m} ${year}`;
}

const inputClass = "w-full rounded-xl border border-[#E8E2D9] bg-[#FFFFFF] px-3 py-2 text-sm text-[#1A1714] placeholder:text-[#8C8277] focus:outline-none focus:border-[#C8B89A]";
const labelClass = "text-[10px] tracking-[0.1em] uppercase text-[#8C8277] mb-1 block";

function ExpenseRow({ expense }: { expense: Expense }) {
  const [editing, setEditing] = useState(false);
  const [updateState, updateAction, updatePending] = useActionState(updateExpenseAction, {});

  if (editing) {
    return (
      <form
        action={(fd) => { updateAction(fd); setEditing(false); }}
        className="px-5 py-4 space-y-3 bg-[#FDFCFA]"
      >
        <input type="hidden" name="id" value={expense.id} />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Name *</label>
            <input name="name" required defaultValue={expense.name} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Amount ($) *</label>
            <input name="amount" type="number" step="0.01" required defaultValue={expense.amount} className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Category</label>
            <select name="category" defaultValue={expense.category} className={inputClass}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Notes</label>
            <input name="notes" defaultValue={expense.notes ?? ""} placeholder="Optional" className={inputClass} />
          </div>
        </div>
        {updateState.error && <p className="text-xs text-[#9B2335]">{updateState.error}</p>}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={updatePending} className="px-4 py-1.5 rounded-xl bg-[#1A1714] text-[#FAFAF8] text-xs tracking-[0.1em] uppercase disabled:opacity-50">
            {updatePending ? "Saving…" : "Save"}
          </button>
          <button type="button" onClick={() => setEditing(false)} className="text-xs text-[#5C5550] hover:text-[#1A1714]">Cancel</button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between px-5 py-3.5">
      <div>
        <p className="text-sm text-[#1A1714]">{expense.name}</p>
        {expense.notes && <p className="text-xs text-[#8C8277] mt-0.5">{expense.notes}</p>}
      </div>
      <div className="flex items-center gap-4">
        <p className="text-sm font-medium text-[#1A1714]">
          ${expense.amount.toLocaleString("en-AU", { minimumFractionDigits: 2 })}
        </p>
        <button onClick={() => setEditing(true)} className="text-[10px] tracking-[0.08em] uppercase text-[#8C8277] hover:text-[#1A1714] transition-colors">
          Edit
        </button>
        <form action={async () => { await deleteExpenseAction(expense.id); }}>
          <button type="submit" className="text-[10px] tracking-[0.08em] uppercase text-[#8C8277] hover:text-[#9B2335] transition-colors">
            Remove
          </button>
        </form>
      </div>
    </div>
  );
}

function IncomeRow({ income }: { income: Income }) {
  const [editing, setEditing] = useState(false);
  const [updateState, updateAction, updatePending] = useActionState(updateIncomeAction, {});

  if (editing) {
    return (
      <form
        action={(fd) => { updateAction(fd); setEditing(false); }}
        className="px-5 py-4 space-y-3 bg-[#FDFCFA]"
      >
        <input type="hidden" name="id" value={income.id} />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Name *</label>
            <input name="name" required defaultValue={income.name} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Amount ($) *</label>
            <input name="amount" type="number" step="0.01" required defaultValue={income.amount} className={inputClass} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Notes</label>
          <input name="notes" defaultValue={income.notes ?? ""} placeholder="Optional" className={inputClass} />
        </div>
        {updateState.error && <p className="text-xs text-[#9B2335]">{updateState.error}</p>}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={updatePending} className="px-4 py-1.5 rounded-xl bg-[#1A1714] text-[#FAFAF8] text-xs tracking-[0.1em] uppercase disabled:opacity-50">
            {updatePending ? "Saving…" : "Save"}
          </button>
          <button type="button" onClick={() => setEditing(false)} className="text-xs text-[#5C5550] hover:text-[#1A1714]">Cancel</button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between px-5 py-3.5">
      <div>
        <p className="text-sm text-[#1A1714]">{income.name}</p>
        {income.notes && <p className="text-xs text-[#8C8277] mt-0.5">{income.notes}</p>}
      </div>
      <div className="flex items-center gap-4">
        <p className="text-sm font-medium text-[#2D6A4F]">
          ${income.amount.toLocaleString("en-AU", { minimumFractionDigits: 2 })}
        </p>
        <button onClick={() => setEditing(true)} className="text-[10px] tracking-[0.08em] uppercase text-[#8C8277] hover:text-[#1A1714] transition-colors">
          Edit
        </button>
        <form action={async () => { await deleteIncomeAction(income.id); }}>
          <button type="submit" className="text-[10px] tracking-[0.08em] uppercase text-[#8C8277] hover:text-[#9B2335] transition-colors">
            Remove
          </button>
        </form>
      </div>
    </div>
  );
}

export function ExpenseTracker({
  expenses,
  incomes,
  currentMonth,
  revenueByMonth,
  expensesByMonth,
}: {
  expenses: Expense[];
  incomes: Income[];
  currentMonth: string;
  revenueByMonth: Record<string, number>;
  expensesByMonth: Record<string, number>;
}) {
  const [addExpState, addExpAction, addExpPending] = useActionState(addExpenseAction, {});
  const [addIncState, addIncAction, addIncPending] = useActionState(addIncomeAction, {});
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddIncome, setShowAddIncome] = useState(false);

  const filteredExpenses = expenses.filter((e) => e.month === selectedMonth);
  const filteredIncomes = incomes.filter((i) => i.month === selectedMonth);
  const monthExpenseTotal = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const monthRevenue = revenueByMonth[selectedMonth] ?? 0;
  const monthProfit = monthRevenue - monthExpenseTotal;

  // All unique months across expenses + income + current month
  const allMonths = Array.from(
    new Set([currentMonth, ...expenses.map((e) => e.month), ...incomes.map((i) => i.month)])
  ).sort((a, b) => b.localeCompare(a));

  const groupedByCategory = filteredExpenses.reduce<Record<string, Expense[]>>((acc, e) => {
    acc[e.category] = acc[e.category] ?? [];
    acc[e.category].push(e);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Month selector */}
      <div className="flex items-center gap-2 flex-wrap">
        {allMonths.map((m) => (
          <button
            key={m}
            onClick={() => setSelectedMonth(m)}
            className={`px-4 py-1.5 rounded-full text-xs tracking-[0.08em] border transition-colors ${
              selectedMonth === m
                ? "bg-[#1A1714] text-[#FAFAF8] border-[#1A1714]"
                : "bg-[#FFFFFF] text-[#5C5550] border-[#E8E2D9] hover:border-[#C8B89A]"
            }`}
          >
            {monthLabel(m)}
          </button>
        ))}
      </div>

      {/* Month summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-[#E8E2D9] bg-[#FFFFFF] p-4">
          <p className="text-[10px] tracking-[0.12em] uppercase text-[#8C8277]">Income received</p>
          <p className="font-display text-2xl font-light text-[#1A1714] mt-1">
            ${monthRevenue.toLocaleString("en-AU", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="rounded-2xl border border-[#E8E2D9] bg-[#FFFFFF] p-4">
          <p className="text-[10px] tracking-[0.12em] uppercase text-[#8C8277]">Expenses</p>
          <p className="font-display text-2xl font-light text-[#1A1714] mt-1">
            ${monthExpenseTotal.toLocaleString("en-AU", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="rounded-2xl border border-[#E8E2D9] bg-[#FFFFFF] p-4">
          <p className="text-[10px] tracking-[0.12em] uppercase text-[#8C8277]">Profit</p>
          <p className={`font-display text-2xl font-light mt-1 ${monthProfit >= 0 ? "text-[#2D6A4F]" : "text-[#9B2335]"}`}>
            {monthProfit < 0 ? "-" : ""}${Math.abs(monthProfit).toLocaleString("en-AU", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Income list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277]">
            {monthLabel(selectedMonth)} income received
          </h2>
          <button
            onClick={() => setShowAddIncome(!showAddIncome)}
            className="px-4 py-1.5 rounded-2xl bg-[#1A1714] text-[#FAFAF8] text-xs tracking-[0.1em] uppercase hover:bg-[#2C2520] transition-colors"
          >
            {showAddIncome ? "Cancel" : "+ Add income"}
          </button>
        </div>

        {showAddIncome && (
          <form
            action={(fd) => { addIncAction(fd); setShowAddIncome(false); }}
            className="rounded-2xl border border-[#C8B89A] bg-[#FDFCFA] p-5 mb-4 space-y-3"
          >
            <input type="hidden" name="month" value={selectedMonth} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Name *</label>
                <input name="name" required placeholder="e.g. Stripe payout" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Amount ($) *</label>
                <input name="amount" type="number" step="0.01" required placeholder="0.00" className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Notes</label>
              <input name="notes" placeholder="e.g. net of Stripe fees" className={inputClass} />
            </div>
            {addIncState.error && <p className="text-xs text-[#9B2335]">{addIncState.error}</p>}
            <button type="submit" disabled={addIncPending} className="px-5 py-2 rounded-xl bg-[#1A1714] text-[#FAFAF8] text-xs tracking-[0.1em] uppercase disabled:opacity-50">
              {addIncPending ? "Saving…" : "Save income"}
            </button>
          </form>
        )}

        {filteredIncomes.length === 0 && !showAddIncome ? (
          <div className="rounded-2xl border border-[#E8E2D9] bg-[#FFFFFF] px-6 py-10 text-center">
            <p className="text-sm text-[#8C8277]">No income logged for {monthLabel(selectedMonth)}.</p>
          </div>
        ) : (
          filteredIncomes.length > 0 && (
            <div className="rounded-2xl border border-[#E8E2D9] bg-[#FFFFFF] divide-y divide-[#E8E2D9]"
              style={{ boxShadow: "0 1px 3px rgba(92,71,48,0.08)" }}
            >
              {filteredIncomes.map((i) => <IncomeRow key={i.id} income={i} />)}
              <div className="flex justify-between px-5 py-2.5 bg-[#F5F2ED] rounded-b-2xl">
                <p className="text-xs text-[#8C8277]">Total received</p>
                <p className="text-xs font-medium text-[#2D6A4F]">
                  ${filteredIncomes.reduce((s, i) => s + i.amount, 0).toLocaleString("en-AU", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          )
        )}
      </div>

      {/* Expense list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277]">
            {monthLabel(selectedMonth)} expenses
          </h2>
          <button
            onClick={() => setShowAddExpense(!showAddExpense)}
            className="px-4 py-1.5 rounded-2xl bg-[#1A1714] text-[#FAFAF8] text-xs tracking-[0.1em] uppercase hover:bg-[#2C2520] transition-colors"
          >
            {showAddExpense ? "Cancel" : "+ Add expense"}
          </button>
        </div>

        {/* Add expense form */}
        {showAddExpense && (
          <form
            action={(fd) => { addExpAction(fd); setShowAddExpense(false); }}
            className="rounded-2xl border border-[#C8B89A] bg-[#FDFCFA] p-5 mb-4 space-y-3"
          >
            <input type="hidden" name="month" value={selectedMonth} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Name *</label>
                <input
                  name="name"
                  required
                  placeholder="e.g. Kajabi subscription"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Amount ($) *</label>
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  className={inputClass}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Category</label>
                <select
                  name="category"
                  className={inputClass}
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Notes</label>
                <input
                  name="notes"
                  placeholder="Optional"
                  className={inputClass}
                />
              </div>
            </div>
            {addExpState.error && <p className="text-xs text-[#9B2335]">{addExpState.error}</p>}
            <button
              type="submit"
              disabled={addExpPending}
              className="px-5 py-2 rounded-xl bg-[#1A1714] text-[#FAFAF8] text-xs tracking-[0.1em] uppercase disabled:opacity-50"
            >
              {addExpPending ? "Saving…" : "Save expense"}
            </button>
          </form>
        )}

        {filteredExpenses.length === 0 && !showAddExpense && (
          <div className="rounded-2xl border border-[#E8E2D9] bg-[#FFFFFF] px-6 py-10 text-center">
            <p className="text-sm text-[#8C8277]">No expenses logged for {monthLabel(selectedMonth)}.</p>
          </div>
        )}

        {Object.entries(groupedByCategory).map(([cat, items]) => (
          <div key={cat} className="mb-4">
            <p className="text-[10px] tracking-[0.12em] uppercase text-[#8C8277] mb-2">{cat}</p>
            <div className="rounded-2xl border border-[#E8E2D9] bg-[#FFFFFF] divide-y divide-[#E8E2D9]"
              style={{ boxShadow: "0 1px 3px rgba(92,71,48,0.08)" }}
            >
              {items.map((e) => <ExpenseRow key={e.id} expense={e} />)}
              <div className="flex justify-between px-5 py-2.5 bg-[#F5F2ED] rounded-b-2xl">
                <p className="text-xs text-[#8C8277]">{cat} total</p>
                <p className="text-xs font-medium text-[#1A1714]">
                  ${items.reduce((s, e) => s + e.amount, 0).toLocaleString("en-AU", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
