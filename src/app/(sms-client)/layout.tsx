import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SmsNav } from "@/components/sms/SmsNav";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
});

const inter = Inter({
  variable: "--font-inter-sms",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export default async function SmsClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth("client");
  if (!session.clientProfileId) redirect("/login");

  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${inter.variable} h-full`}
      suppressHydrationWarning
    >
      <body
        style={{ fontFamily: "var(--font-jakarta), sans-serif", background: "#FFFFFF" }}
        className="min-h-full"
      >
        <div className="flex min-h-screen bg-white">
          {/* Desktop sidebar */}
          <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-[#D9D3C6] bg-white px-5 py-8">
            <div className="mb-10">
              <p className="text-[10px] tracking-[0.28em] uppercase text-[#6d675e] font-[var(--font-inter-sms)]">
                Social Strategy
              </p>
              <p className="mt-0.5 text-xs text-[#1A1917]">Move Well Coaching</p>
            </div>
            <SmsNav />
          </aside>

          {/* Main */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Mobile top bar */}
            <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-[#D9D3C6]">
              <span className="text-[10px] tracking-[0.28em] uppercase text-[#6d675e]">
                Social Strategy
              </span>
            </header>

            <main className="flex-1 px-5 py-8 lg:px-10 lg:py-10 max-w-5xl">
              {children}
            </main>

            {/* Mobile bottom tab bar */}
            <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-[#D9D3C6] flex">
              <SmsNav mobile />
            </nav>
          </div>
        </div>
      </body>
    </html>
  );
}
