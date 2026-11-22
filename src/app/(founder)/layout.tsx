import { requireAuth } from "@/lib/auth";
import { FounderSidebar } from "@/components/founder/FounderSidebar";
import { FounderMobileNav } from "@/components/founder/FounderMobileNav";
import { Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
  variable: "--font-jakarta",
});

export default async function FounderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth(["founder", "staff"]);
  const role = session.role as "founder" | "staff";

  return (
    <div className={`${jakarta.variable} min-h-screen flex bg-white`} style={{ fontFamily: "var(--font-jakarta), var(--font-inter), sans-serif" }}>
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <FounderSidebar role={role} />
      </div>
      {/* Mobile header + drawer */}
      <FounderMobileNav role={role} />
      <main className="flex-1 min-w-0 md:ml-60">
        <div className="max-w-6xl mx-auto px-4 md:px-8 pt-20 pb-8 md:py-10 page-enter">{children}</div>
      </main>
    </div>
  );
}
