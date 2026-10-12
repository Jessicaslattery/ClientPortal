import { requireAuth } from "@/lib/auth";
import { FounderSidebar } from "@/components/founder/FounderSidebar";

export default async function FounderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth("founder");

  return (
    <div className="min-h-screen flex bg-[#F2EDE4]">
      <div className="hidden md:block">
        <FounderSidebar />
      </div>
      <main className="flex-1 min-w-0 md:ml-56">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8 page-enter">{children}</div>
      </main>
    </div>
  );
}
