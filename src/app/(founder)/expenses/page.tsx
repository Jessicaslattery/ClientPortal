import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ExpenseTracker } from "@/components/founder/ExpenseTracker";

export default async function ExpensesPage() {
  await requireAuth("founder");

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  // Last 6 months of expenses
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const sixMonthsAgoKey = `${sixMonthsAgo.getFullYear()}-${String(sixMonthsAgo.getMonth() + 1).padStart(2, "0")}`;

  const [expenses, incomes, clients] = await Promise.all([
    prisma.founderExpense.findMany({
      where: { month: { gte: sixMonthsAgoKey } },
      orderBy: [{ month: "desc" }, { createdAt: "desc" }],
    }),
    prisma.founderIncome.findMany({
      where: { month: { gte: sixMonthsAgoKey } },
      orderBy: [{ month: "desc" }, { createdAt: "desc" }],
    }),
    prisma.clientProfile.findMany({
      where: { isActive: true },
      select: { monthlyInvestment: true },
    }),
  ]);

  const totalMRR = clients.reduce((sum, c) => sum + (c.monthlyInvestment ?? 0), 0);

  // Group actual income received (e.g. Stripe payouts, net of fees) by month —
  // this is Pivot Co's own revenue, not to be confused with MRR (contracted,
  // gross) or clients' own self-reported business revenue in their check-ins.
  const revenueByMonth: Record<string, number> = {};
  for (const inc of incomes) {
    revenueByMonth[inc.month] = (revenueByMonth[inc.month] ?? 0) + inc.amount;
  }

  // Group expenses by month
  const expensesByMonth: Record<string, number> = {};
  for (const e of expenses) {
    expensesByMonth[e.month] = (expensesByMonth[e.month] ?? 0) + e.amount;
  }

  const thisMonthExpenses = expensesByMonth[currentMonth] ?? 0;
  const thisMonthRevenue = revenueByMonth[currentMonth] ?? 0;
  const thisMonthProfit = thisMonthRevenue - thisMonthExpenses;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-thin tracking-widest text-[#1A1714] uppercase">
          Expenses
        </h1>
        <p className="mt-1.5 text-sm text-[#5C5550]">Business expenses and profit overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "MRR (contracted)", value: `$${totalMRR.toLocaleString("en-AU")}` },
          { label: "Revenue this month", value: `$${thisMonthRevenue.toLocaleString("en-AU")}` },
          { label: "Expenses this month", value: `$${thisMonthExpenses.toLocaleString("en-AU")}` },
          {
            label: "Profit this month",
            value: `$${Math.abs(thisMonthProfit).toLocaleString("en-AU")}`,
            color: thisMonthProfit >= 0 ? "#2D6A4F" : "#9B2335",
            prefix: thisMonthProfit < 0 ? "-" : "",
          },
        ].map((s) => (
          <div key={s.label}
            className="rounded-3xl border border-[#E8E2D9] bg-[#FFFFFF] p-5"
            style={{ boxShadow: "0 1px 3px rgba(92,71,48,0.08)" }}
          >
            <p className="text-[10px] tracking-[0.12em] uppercase text-[#8C8277]">{s.label}</p>
            <p className="font-display text-2xl font-light mt-1" style={{ color: s.color ?? "#1A1714" }}>
              {s.prefix}{s.value}
            </p>
          </div>
        ))}
      </div>

      <ExpenseTracker
        expenses={expenses.map((e) => ({
          id: e.id,
          name: e.name,
          amount: e.amount,
          category: e.category,
          month: e.month,
          notes: e.notes,
        }))}
        incomes={incomes.map((i) => ({
          id: i.id,
          name: i.name,
          amount: i.amount,
          month: i.month,
          notes: i.notes,
        }))}
        currentMonth={currentMonth}
        revenueByMonth={revenueByMonth}
        expensesByMonth={expensesByMonth}
      />
    </div>
  );
}
