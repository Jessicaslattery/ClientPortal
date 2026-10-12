import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { FounderTaskList } from "@/components/founder/FounderTaskList";

function getWeekStart() {
  const today = new Date();
  const day = today.getDay(); // 0=Sun
  const daysFromMonday = day === 0 ? 6 : day - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - daysFromMonday);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export default async function FounderTasksPage() {
  await requireAuth("founder");

  const weekStart = getWeekStart();

  const [clients, tasks, recentlyCompleted, recurringTasks] = await Promise.all([
    prisma.clientProfile.findMany({
      select: { id: true, founderName: true, businessName: true },
      orderBy: { founderName: "asc" },
    }),
    prisma.task.findMany({
      where: {
        completed: false,
        OR: [{ assignedTo: "founder" }, { owner: "Jess" }],
      },
      include: {
        clientProfile: { select: { id: true, founderName: true, businessName: true } },
      },
      orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }],
    }),
    prisma.task.findMany({
      where: {
        completed: true,
        OR: [{ assignedTo: "founder" }, { owner: "Jess" }],
        completedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      include: {
        clientProfile: { select: { id: true, founderName: true, businessName: true } },
      },
      orderBy: { completedAt: "desc" },
      take: 20,
    }),
    prisma.recurringTask.findMany({
      include: {
        completions: { where: { weekStart } },
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-light tracking-widest text-[#1A1714] uppercase">
          My Tasks
        </h1>
        <p className="mt-1 text-sm text-[#8C8277]">
          {tasks.length} open · {recentlyCompleted.length} completed this week
        </p>
      </div>

      <FounderTaskList
        tasks={tasks}
        recentlyCompleted={recentlyCompleted}
        clients={clients}
        recurringTasks={recurringTasks.map((r) => ({
          id: r.id,
          title: r.title,
          category: r.category,
          priority: r.priority,
          notes: r.notes,
          days: r.days,
          completedThisWeek: r.completions.length > 0,
        }))}
        weekStart={weekStart.toISOString()}
      />
    </div>
  );
}
