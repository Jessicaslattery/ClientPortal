import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { FounderMessagesView } from "@/components/founder/FounderMessagesView";
import { AnnouncementForm } from "@/components/founder/AnnouncementForm";
import { DeleteAnnouncementButton } from "@/components/founder/DeleteAnnouncementButton";
import { RemindersList } from "@/components/founder/RemindersList";
import Link from "next/link";

const AUDIENCE_LABELS: Record<string, string> = {
  all: "All clients",
  consulting: "Consulting only",
  social: "Social media only",
  onboarding: "Onboarding",
  active: "Active",
};

type Tab = "inbox" | "announcements" | "reminders";

export default async function FounderMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string; tab?: string }>;
}) {
  await requireAuth("founder");

  const { client: activeClientId, tab: tabParam } = await searchParams;
  const tab: Tab = (tabParam === "announcements" || tabParam === "reminders") ? tabParam : "inbox";

  // ── Inbox data ──────────────────────────────────────────────────────────────
  const clients = await prisma.clientProfile.findMany({
    select: {
      id: true,
      founderName: true,
      businessName: true,
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true, senderRole: true, createdAt: true },
      },
    },
    orderBy: { founderName: "asc" },
  });

  const unreadGroups = await prisma.message.groupBy({
    by: ["clientProfileId"],
    where: { senderRole: "client", read: false },
    _count: { id: true },
  });
  const unreadMap = Object.fromEntries(unreadGroups.map((g) => [g.clientProfileId, g._count.id]));

  const conversations = clients.map((c) => ({
    clientId: c.id,
    founderName: c.founderName,
    businessName: c.businessName,
    lastMessage: c.messages[0]
      ? {
          content: c.messages[0].content,
          senderRole: c.messages[0].senderRole,
          createdAt: c.messages[0].createdAt.toISOString(),
        }
      : null,
    unreadCount: unreadMap[c.id] ?? 0,
  }));

  let activeMessages: { id: string; content: string; senderRole: string; createdAt: string }[] = [];
  let activeClientName: string | null = null;

  if (activeClientId) {
    const [msgs, client] = await Promise.all([
      prisma.message.findMany({
        where: { clientProfileId: activeClientId },
        orderBy: { createdAt: "asc" },
        select: { id: true, content: true, senderRole: true, createdAt: true },
      }),
      prisma.clientProfile.findUnique({
        where: { id: activeClientId },
        select: { founderName: true, businessName: true },
      }),
    ]);
    activeMessages = msgs.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() }));
    activeClientName = client ? `${client.founderName} · ${client.businessName}` : null;
    await prisma.message.updateMany({
      where: { clientProfileId: activeClientId, senderRole: "client", read: false },
      data: { read: true },
    });
  }

  // ── Announcements data ──────────────────────────────────────────────────────
  const announcements = tab === "announcements"
    ? await prisma.announcement.findMany({ orderBy: { publishedAt: "desc" } })
    : [];

  // ── Reminders data ──────────────────────────────────────────────────────────
  const [reminderTemplates, activeClientCount] = tab === "reminders"
    ? await Promise.all([
        prisma.reminderTemplate.findMany({
          orderBy: { createdAt: "asc" },
          include: { sentHistory: { orderBy: { sentAt: "desc" }, take: 1 } },
        }),
        prisma.clientProfile.count({ where: { isActive: true } }),
      ])
    : [[], 0];

  const totalUnread = Object.values(unreadMap).reduce((a, b) => a + b, 0);

  const TABS: { key: Tab; label: string; count?: number }[] = [
    { key: "inbox", label: "Inbox", count: totalUnread || undefined },
    { key: "announcements", label: "Announcements" },
    { key: "reminders", label: "Scheduled Messages" },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-[300] tracking-tight text-[#1A1917]">Messaging</h1>
        <p className="mt-1 text-sm text-[#b0a89e]">Client conversations, announcements and reminders</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-[#EDEBE6]">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/inbox${t.key === "inbox" ? "" : `?tab=${t.key}`}`}
            className={`flex items-center gap-1.5 px-5 py-2.5 text-xs tracking-[0.08em] transition-colors -mb-px ${
              tab === t.key
                ? "text-[#1A1917] border-b-2 border-[#1A1917]"
                : "text-[#7a7268] hover:text-[#1A1917]"
            }`}
          >
            {t.label}
            {t.count ? (
              <span className="w-4 h-4 rounded-full bg-[#8C735A] text-white text-[8px] flex items-center justify-center">
                {t.count}
              </span>
            ) : null}
          </Link>
        ))}
      </div>

      {/* Inbox */}
      {tab === "inbox" && (
        <FounderMessagesView
          conversations={conversations}
          activeClientId={activeClientId ?? null}
          activeMessages={activeMessages}
          activeClientName={activeClientName}
        />
      )}

      {/* Announcements */}
      {tab === "announcements" && (
        <div className="space-y-6 max-w-2xl">
          <p className="text-sm text-[#7a7268]">Write an update: clients see it pinned to their home page.</p>
          <AnnouncementForm />
          {announcements.length === 0 ? (
            <div className="rounded-2xl border border-[#EDEBE6] px-6 py-12 text-center">
              <p className="text-sm text-[#b0a89e]">No announcements yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((a) => (
                <div key={a.id} className="rounded-2xl border border-[#EDEBE6] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-[#1A1917]">{a.title}</p>
                        <span className="text-[9px] tracking-[0.1em] uppercase text-[#b0a89e] border border-[#EDEBE6] rounded px-1.5 py-0.5">
                          {AUDIENCE_LABELS[a.audience] ?? a.audience}
                        </span>
                      </div>
                      <p className="text-xs text-[#7a7268] leading-5 whitespace-pre-wrap">{a.body}</p>
                      <p className="text-[10px] text-[#b0a89e] mt-2">
                        {new Date(a.publishedAt).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                    <DeleteAnnouncementButton id={a.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reminders */}
      {tab === "reminders" && (
        <RemindersList
          templates={reminderTemplates.map((t) => ({
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
      )}
    </div>
  );
}
