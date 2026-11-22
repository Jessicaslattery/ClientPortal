import { Plus_Jakarta_Sans } from "next/font/google";
import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { SmsNav } from "@/components/sms/SmsNav";
import { ClientSidebar } from "@/components/client/ClientSidebar";
import { MobileNav } from "@/components/client/MobileNav";
import { Logo } from "@/components/ui/Logo";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
});

export default async function SmsClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth("client");
  if (!session.clientProfileId) redirect("/login");

  const profile = session.clientProfileId
    ? await prisma.clientProfile.findUnique({
        where: { id: session.clientProfileId },
        select: {
          businessName: true,
          founderName: true,
          package: true,
          hiddenTabs: true,
          messages: {
            where: { read: false, senderRole: "founder" },
            select: { id: true },
          },
        },
      })
    : null;

  const pkg = (profile?.package ?? session.package ?? "sms") as "sms" | "consulting";
  const businessName = profile?.businessName ?? session.name ?? "My Business";
  const founderName = profile?.founderName ?? session.name ?? "";
  const hiddenTabs = profile?.hiddenTabs ?? [];
  const unreadCount = profile?.messages?.length ?? 0;

  // Consulting clients: render social pages inside the consulting portal shell
  if (pkg === "consulting") {
    return (
      <div
        className={`${jakarta.variable} min-h-screen flex bg-white`}
        style={{ fontFamily: "var(--font-jakarta), var(--font-inter), sans-serif" }}
      >
        <div className="hidden md:block">
          <ClientSidebar
            name={founderName}
            unreadMessages={unreadCount}
            hiddenTabs={hiddenTabs}
            pkg="consulting"
          />
        </div>
        <div className="md:hidden">
          <MobileNav name={founderName} unreadMessages={unreadCount} hiddenTabs={hiddenTabs} />
        </div>
        <main className="flex-1 min-w-0 md:ml-60">
          <div className="max-w-5xl mx-auto px-4 md:px-8 pt-20 pb-24 md:py-8 page-enter">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // SMS-only clients: render the full SMS portal shell
  return (
    <div className={`${jakarta.variable} flex min-h-screen bg-white`} style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-[#EDEBE6] bg-white px-4 py-7">
        {/* Logo + client */}
        <div className="px-3 mb-8">
          <Logo size="sm" />
          <div className="mt-3 pt-3 border-t border-[#EDEBE6]">
            <p className="text-[9px] tracking-[0.22em] uppercase text-[#b0a89e] font-[300]">Social Strategy</p>
            <p className="mt-0.5 text-[13px] text-[#1A1917] font-[400] truncate">{businessName}</p>
          </div>
        </div>

        <SmsNav />

        {/* Footer */}
        <div className="mt-auto pt-6 px-3 border-t border-[#EDEBE6]">
          <p className="text-[11px] text-[#b0a89e]">{founderName}</p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center justify-between px-5 py-3 border-b border-[#EDEBE6]">
          <Logo size="sm" />
          <p className="text-[9px] tracking-[0.22em] uppercase text-[#b0a89e]">Social Strategy</p>
        </header>

        <main className="flex-1 px-5 py-8 lg:px-10 lg:py-10">
          <div className="max-w-5xl">
            {children}
          </div>
        </main>

        {/* Mobile bottom tab bar */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-[#EDEBE6] flex">
          <SmsNav mobile />
        </nav>
      </div>
    </div>
  );
}
