import { Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
  variable: "--font-jakarta",
});

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${jakarta.variable} min-h-screen bg-white`}
      style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
    >
      <header className="border-b border-[#EDEBE6] px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="Pivot Co." className="h-6 w-auto" />
        </div>
        <a
          href="/login"
          className="text-[11px] tracking-[0.1em] text-[#8C735A] hover:opacity-70 transition-opacity"
        >
          Portal login
        </a>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-12 pb-20">
        {children}
      </main>
      <footer className="border-t border-[#EDEBE6] px-6 py-6 text-center">
        <p className="text-[11px] text-[#b0a89e]">
          © {new Date().getFullYear()} Pivot Co. · <a href="/privacy" className="hover:text-[#8C735A] transition-colors">Privacy Policy</a>
        </p>
      </footer>
    </div>
  );
}
