type CheckIn = { monthNumber: number; energyScore: number; createdAt: Date };
type Goal = { title: string; progressPercent: number; status: string };
type Win = { title: string; celebratedAt: Date };
type Task = { completed: boolean; completedAt: Date | null; monthNumber: number | null };

type Props = {
  currentMonth: number;
  checkIns: CheckIn[];
  goals: Goal[];
  wins: Win[];
  tasks: Task[];
};

export function MonthlySnapshot({ currentMonth, checkIns, goals, wins, tasks }: Props) {
  const monthCheckIns = checkIns.filter((c) => c.monthNumber === currentMonth);
  const avgEnergy = monthCheckIns.length > 0
    ? (monthCheckIns.reduce((s, c) => s + c.energyScore, 0) / monthCheckIns.length).toFixed(1)
    : null;

  const monthWins = wins.filter((w) => {
    const d = new Date(w.celebratedAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const monthTasks = tasks.filter((t) => t.monthNumber === currentMonth);
  const completedMonthTasks = monthTasks.filter((t) => t.completed);
  const taskRate = monthTasks.length > 0
    ? Math.round((completedMonthTasks.length / monthTasks.length) * 100)
    : null;

  const activeGoals = goals.filter((g) => g.status === "active");
  const avgGoalProgress = activeGoals.length > 0
    ? Math.round(activeGoals.reduce((s, g) => s + g.progressPercent, 0) / activeGoals.length)
    : null;

  return (
    <div className="rounded-2xl border border-[#EDEBE6] p-5">
      <h3 className="text-[10px] tracking-[0.15em] text-[#b0a89e] mb-4">Month {currentMonth} snapshot</h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="border-l-2 border-[#EDEBE6] pl-3">
          <p className="text-[10px] tracking-[0.1em] text-[#b0a89e]">Check-ins</p>
          <p className="text-xl font-[300] text-[#1A1917] mt-0.5">{monthCheckIns.length}</p>
        </div>
        {avgEnergy && (
          <div className="border-l-2 border-[#EDEBE6] pl-3">
            <p className="text-[10px] tracking-[0.1em] text-[#b0a89e]">Avg energy</p>
            <p className="text-xl font-[300] text-[#1A1917] mt-0.5">{avgEnergy}<span className="text-xs text-[#b0a89e]">/10</span></p>
          </div>
        )}
        {taskRate !== null && (
          <div className="border-l-2 border-[#EDEBE6] pl-3">
            <p className="text-[10px] tracking-[0.1em] text-[#b0a89e]">Task completion</p>
            <p className="text-xl font-[300] text-[#1A1917] mt-0.5">{taskRate}<span className="text-xs text-[#b0a89e]">%</span></p>
          </div>
        )}
        {avgGoalProgress !== null && (
          <div className="border-l-2 border-[#EDEBE6] pl-3">
            <p className="text-[10px] tracking-[0.1em] text-[#b0a89e]">Goal progress</p>
            <p className="text-xl font-[300] text-[#1A1917] mt-0.5">{avgGoalProgress}<span className="text-xs text-[#b0a89e]">%</span></p>
          </div>
        )}
      </div>

      {monthWins.length > 0 && (
        <div>
          <p className="text-[10px] tracking-[0.1em] text-[#b0a89e] mb-2">Wins this month</p>
          <div className="space-y-1">
            {monthWins.map((win, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[10px] text-[#8C735A]">✦</span>
                <p className="text-xs text-[#7a7268]">{win.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
