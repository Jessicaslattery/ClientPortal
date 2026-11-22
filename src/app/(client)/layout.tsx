import { requireAuth } from "@/lib/auth";
import { ClientSidebar } from "@/components/client/ClientSidebar";
import { MobileNav } from "@/components/client/MobileNav";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
  variable: "--font-jakarta",
});

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth("client");

  // SMS-only clients don't belong in this portal
  if (session.package === "sms") redirect("/social/overview");

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
  const pkg = (session.package ?? "consulting") as "sms" | "consulting";

  return (
    <div className={`${jakarta.variable} min-h-screen flex bg-white`} style={{ fontFamily: "var(--font-jakarta), var(--font-inter), sans-serif" }}>
      {/* Desktop sidebar · hidden on mobile */}
      <div className="hidden md:block">
        <ClientSidebar name={name} unreadMessages={unreadCount} hiddenTabs={hiddenTabs} pkg={pkg} />
      </div>

      {/* Mobile nav */}
      <div className="md:hidden">
        <MobileNav name={name} unreadMessages={unreadCount} hiddenTabs={hiddenTabs} />
      </div>

      <main className="flex-1 min-w-0 md:ml-60">
        <div className="max-w-4xl mx-auto px-4 md:px-8 pt-20 pb-24 md:py-8 page-enter">
          {children}
        </div>
      </main>
    </div>
  );
}
