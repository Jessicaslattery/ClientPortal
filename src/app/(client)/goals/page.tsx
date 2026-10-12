import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { GoalUpdateForm, GoalEditForm, GoalDeleteButton, AddGoalForm } from "@/components/client/GoalUpdateForm";

export default async function GoalsPage() {
  const session = await requireAuth("client");
  if (!session.clientProfileId) redirect("/login");

  const goals = await prisma.goal.findMany({
    where: { clientProfileId: session.clientProfileId },
    include: {
      progressNotes: { orderBy: { createdAt: "desc" }, take: 5 },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-thin tracking-widest text-[#1A1714] uppercase">Goals & Progress</h1>
        <p className="mt-1.5 text-sm text-[#5C5550]">
          {goals.filter((g) => g.status === "active").length} active goal
          {goals.filter((g) => g.status === "active").length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="space-y-5">
        {goals.map((goal) => (
          <GoalCardWrapper
            key={goal.id}
            goal={{
              id: goal.id,
              title: goal.title,
              description: goal.description,
              baselineNote: goal.baselineNote,
              targetNote: goal.targetNote,
              progressPercent: goal.progressPercent,
              status: goal.status,
              progressNotes: goal.progressNotes.map((n) => ({
                id: n.id,
                note: n.note,
                progress: n.progress,
                createdAt: n.createdAt.toISOString(),
              })),
            }}
          />
        ))}

        <AddGoalForm />
      </div>
    </div>
  );
}

// Server component wrapper — renders the card with client sub-components inside
function GoalCardWrapper({ goal }: {
  goal: {
    id: string;
    title: string;
    description: string | null;
    baselineNote: string | null;
    targetNote: string | null;
    progressPercent: number;
    status: string;
    progressNotes: { id: string; note: string; progress: number; createdAt: string }[];
  };
}) {
  return <GoalCardClient goal={goal} />;
}

// We need a client component that can toggle between view/edit modes
import { GoalCardClientWrapper as GoalCardClient } from "@/components/client/GoalCardClient";
