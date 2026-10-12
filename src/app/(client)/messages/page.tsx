import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { MessageThread } from "@/components/client/MessageThread";

export default async function MessagesPage() {
  const session = await requireAuth("client");
  if (!session.clientProfileId) redirect("/login");

  const messages = await prisma.message.findMany({
    where: { clientProfileId: session.clientProfileId },
    orderBy: { createdAt: "asc" },
  });

  // Mark all founder messages as read
  await prisma.message.updateMany({
    where: {
      clientProfileId: session.clientProfileId,
      senderRole: "founder",
      read: false,
    },
    data: { read: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-thin tracking-widest text-[#1A1714] uppercase">Messages</h1>
        <p className="mt-1.5 text-sm text-[#5C5550]">
          Private conversation with your consultant
        </p>
      </div>

      <MessageThread
        messages={messages.map((m) => ({
          id: m.id,
          content: m.content,
          senderRole: m.senderRole,
          createdAt: m.createdAt,
          attachmentUrl: m.attachmentUrl,
          attachmentName: m.attachmentName,
        }))}
        clientProfileId={session.clientProfileId}
      />
    </div>
  );
}
