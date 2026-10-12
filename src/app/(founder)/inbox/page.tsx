import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { FounderMessagesView } from "@/components/founder/FounderMessagesView";

export default async function FounderMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  await requireAuth("founder");

  const { client: activeClientId } = await searchParams;

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

  let activeMessages: {
    id: string;
    content: string;
    senderRole: string;
    createdAt: string;
  }[] = [];

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

    activeMessages = msgs.map((m) => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
    }));

    activeClientName = client ? `${client.founderName} · ${client.businessName}` : null;

    // Mark client messages as read
    await prisma.message.updateMany({
      where: { clientProfileId: activeClientId, senderRole: "client", read: false },
      data: { read: true },
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-light tracking-widest text-[#1A1714] uppercase">
          Messages
        </h1>
        <p className="mt-1 text-sm text-[#8C8277]">
          Client conversations
        </p>
      </div>

      <FounderMessagesView
        conversations={conversations}
        activeClientId={activeClientId ?? null}
        activeMessages={activeMessages}
        activeClientName={activeClientName}
      />
    </div>
  );
}
