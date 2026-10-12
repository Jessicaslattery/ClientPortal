import { requireAuth } from "@/lib/auth";
import { ClientSidebar } from "@/components/client/ClientSidebar";
import { MobileNav } from "@/components/client/MobileNav";
import { prisma } from "@/lib/db";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth("client");

  const profile = session.clientProfileId
    ? await prisma.clientProfile.findUnique({
        where: { id: session.clientProfileId },
        select: {
          founderName: true,
          businessName: true,
          currentMonth: true,
          currentWeek: true,
          hiddenTabs: true,
          messages: {
            where: { read: false, senderRole: "founder" },
            select: { id: true },
          },
        },
      })
    : null;

  const unreadCount = profile?.messages.length ?? 0;
  const name = profile?.founderName ?? session.name ?? "";
  const hiddenTabs = profile?.hiddenTabs ?? [];

  return (
    <div className="min-h-screen flex bg-[#F2EDE4]">
      {/* Desktop sidebar · hidden on mobile */}
      <div className="hidden md:block">
        <ClientSidebar name={name} unreadMessages={unreadCount} hiddenTabs={hiddenTabs} />
      </div>

      {/* Mobile nav */}
      <div className="md:hidden">
        <MobileNav name={name} unreadMessages={unreadCount} hiddenTabs={hiddenTabs} />
      </div>

      <main className="flex-1 min-w-0 md:ml-56">
        <div className="max-w-4xl mx-auto px-4 md:px-8 pt-20 pb-24 md:py-8 page-enter">
          {children}
        </div>
      </main>
    </div>
  );
}
