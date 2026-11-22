type TimelineEvent = {
  date: string;
  label: string;
  type: "start" | "win" | "checkin" | "goal" | "call" | "month";
};

type Props = {
  startDate: Date;
  currentMonth: number;
  wins: { title: string; celebratedAt: Date }[];
  goals: { title: string; progressPercent: number; createdAt: Date }[];
  calls: { title: string; scheduledAt: Date; completedAt: Date | null }[];
};

const TYPE_CONFIG: Record<TimelineEvent["type"], { dot: string; textColor: string }> = {
  start:   { dot: "bg-[#1A1917]", textColor: "text-[#1A1917]" },
  month:   { dot: "bg-[#8C735A]", textColor: "text-[#8C735A]" },
  win:     { dot: "bg-[#2D6A4F]", textColor: "text-[#2D6A4F]" },
  goal:    { dot: "bg-[#8C735A]", textColor: "text-[#7a7268]" },
  call:    { dot: "bg-[#b0a89e]", textColor: "text-[#7a7268]" },
  checkin: { dot: "bg-[#EDEBE6]", textColor: "text-[#b0a89e]" },
};

export function ClientTimeline({ startDate, currentMonth, wins, goals, calls }: Props) {
  const events: TimelineEvent[] = [];

  events.push({
    date: new Date(startDate).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" }),
    label: "Started with Pivot Co",
    type: "start",
  });

  // Month markers
  for (let m = 2; m <= currentMonth; m++) {
    const d = new Date(startDate);
    d.setMonth(d.getMonth() + (m - 1));
    events.push({
      date: d.toLocaleDateString("en-AU", { month: "long", year: "numeric" }),
      label: `Entered month ${m}`,
      type: "month",
    });
  }

  // Wins
  for (const win of wins) {
    events.push({
      date: new Date(win.celebratedAt).toLocaleDateString("en-AU", { day: "numeric", month: "long" }),
      label: win.title,
      type: "win",
    });
  }

  // Goals created
  for (const goal of goals) {
    events.push({
      date: new Date(goal.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "long" }),
      label: `Goal set: ${goal.title}`,
      type: "goal",
    });
  }

  // Completed calls
  for (const call of calls.filter((c) => c.completedAt)) {
    events.push({
      date: new Date(call.completedAt!).toLocaleDateString("en-AU", { day: "numeric", month: "long" }),
      label: call.title,
      type: "call",
    });
  }

  // Sort by approximate date (using the label since we have formatted dates)
  // We store raw dates separately for sorting
  const withRaw = events.map((e, i) => ({ ...e, _i: i }));
  const rawDates: (Date | null)[] = [
    new Date(startDate),
    ...Array.from({ length: currentMonth - 1 }, (_, i) => {
      const d = new Date(startDate); d.setMonth(d.getMonth() + i + 1); return d;
    }),
    ...wins.map((w) => new Date(w.celebratedAt)),
    ...goals.map((g) => new Date(g.createdAt)),
    ...calls.filter((c) => c.completedAt).map((c) => new Date(c.completedAt!)),
  ];

  const sorted = withRaw
    .map((e, i) => ({ e, d: rawDates[i] ?? new Date(0) }))
    .sort((a, b) => b.d.getTime() - a.d.getTime())
    .slice(0, 10);

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute left-2 top-2 bottom-2 w-px bg-[#EDEBE6]" />
        <div className="space-y-4">
          {sorted.map(({ e }, i) => {
            const cfg = TYPE_CONFIG[e.type];
            return (
              <div key={i} className="flex items-start gap-4 relative pl-7">
                <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-white ${cfg.dot}`} />
                <div>
                  <p className={`text-xs ${cfg.textColor}`}>{e.label}</p>
                  <p className="text-[10px] text-[#b0a89e] mt-0.5">{e.date}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
