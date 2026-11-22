import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { TaskList } from "@/components/client/TaskList";
import { AddTaskForm } from "@/components/client/AddTaskForm";

const CATEGORIES = ["Operations", "Client Experience", "Retention", "Content", "Brand"] as const;

export default async function TasksPage() {
  const session = await requireAuth("client");
  if (!session.clientProfileId) redirect("/login");

  const tasks = await prisma.task.findMany({
    where: { clientProfileId: session.clientProfileId },
    orderBy: [{ completed: "asc" }, { priority: "asc" }, { createdAt: "desc" }],
  });

  const openTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  const tasksByCategory = CATEGORIES.reduce<Record<string, typeof openTasks>>(
    (acc, cat) => {
      const catTasks = openTasks.filter((t) => t.category === cat);
      if (catTasks.length > 0) acc[cat] = catTasks;
      return acc;
    },
    {}
  );

  // Tasks with categories not in the fixed list (e.g. "General" added by founder)
  const uncategorised = openTasks.filter((t) => !CATEGORIES.includes(t.category as typeof CATEGORIES[number]));
  if (uncategorised.length > 0) tasksByCategory["General"] = uncategorised;

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-[200] text-[#1A1917]">Tasks</h1>
          <p className="mt-1.5 text-sm text-[#7a7268]">
            {openTasks.length} open · {completedTasks.length} completed
          </p>
        </div>
      </div>

      {/* Add task */}
      <AddTaskForm />

      {/* Open tasks by category */}
      {openTasks.length === 0 ? (
        <div className="rounded-2xl border border-[#EDEBE6] px-8 py-10 text-center">
          <p className="text-sm text-[#7a7268]">No open tasks right now. Add one above.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(tasksByCategory).map(([category, catTasks]) => (
            <div key={category}>
              <h2 className="text-[10px] tracking-[0.15em] uppercase text-[#b0a89e] mb-3">
                {category}
              </h2>
              <TaskList tasks={catTasks} />
            </div>
          ))}
        </div>
      )}

      {/* Completed tasks */}
      {completedTasks.length > 0 && (
        <div>
          <h2 className="text-[10px] tracking-[0.15em] uppercase text-[#b0a89e] mb-3">
            Completed
          </h2>
          <div className="rounded-2xl border border-[#EDEBE6] divide-y divide-[#EDEBE6] opacity-60">
            {completedTasks.slice(0, 10).map((task) => (
              <div key={task.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="w-3.5 h-3.5 border border-[#2D6A4F] bg-[#2D6A4F]/20 flex items-center justify-center flex-shrink-0">
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="#2D6A4F" strokeWidth="1.5">
                    <path d="M1.5 4l2 2 3-3" />
                  </svg>
                </div>
                <span className="text-xs text-[#7a7268] line-through">{task.title}</span>
                {task.completedAt && (
                  <span className="ml-auto text-[10px] text-[#b0a89e]">
                    {new Date(task.completedAt).toLocaleDateString("en-AU", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
