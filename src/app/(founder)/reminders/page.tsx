import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { RemindersList } from "@/components/founder/RemindersList";

export default async function RemindersPage() {
  await requireAuth("founder");

  const templates = await prisma.reminderTemplate.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      sentHistory: {
        orderBy: { sentAt: "desc" },
        take: 1,
      },
    },
  });

  const activeClientCount = await prisma.clientProfile.count({ where: { isActive: true } });

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-[300] tracking-tight text-[#1A1917]">Reminders</h1>
          <p className="mt-1.5 text-sm text-[#7a7268]">
            Pre-written messages you can send to clients on a schedule
          </p>
        </div>
      </div>

      <RemindersList
        templates={templates.map((t) => ({
          id: t.id,
          title: t.title,
          message: t.message,
          dayOfWeek: t.dayOfWeek,
          audience: t.audience,
          active: t.active,
          lastSentAt: t.sentHistory[0]?.sentAt?.toISOString() ?? null,
        }))}
        activeClientCount={activeClientCount}
      />
    </div>
  );
}
