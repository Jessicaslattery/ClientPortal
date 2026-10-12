"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { clientLogoutAction } from "@/app/(client)/actions";

export function ClientSidebar({
  name,
  unreadMessages,
}: {
  name: string;
  unreadMessages: number;
}) {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Home",
      href: "/home",
      icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M1.5 6.5L7 2l5.5 4.5V12a.5.5 0 01-.5.5H9V9H5v3.5H2a.5.5 0 01-.5-.5V6.5z" />
        </svg>
      ),
    },
    {
      label: "Business Health",
      href: "/health",
      icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M1 9l3-4 3 3 3-5 3 2" />
          <path d="M1 13h12" />
        </svg>
      ),
    },
    {
      label: "Tasks",
      href: "/tasks",
      icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M2.5 4h9M2.5 7h9M2.5 10h5" />
        </svg>
      ),
    },
    {
      label: "Roadmap",
      href: "/roadmap",
      icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M1 3.5h3l2 2h7M1 7h4l2 2h6M1 10.5h5l2-2" />
        </svg>
      ),
    },
    {
      label: "Goals",
      href: "/goals",
      icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
          <circle cx="7" cy="7" r="5.5" />
          <circle cx="7" cy="7" r="2.5" />
        </svg>
      ),
    },
    {
      label: "Messages",
      href: "/messages",
      icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M12.5 2.5h-11a.5.5 0 00-.5.5v7a.5.5 0 00.5.5h2v2l3-2h6a.5.5 0 00.5-.5V3a.5.5 0 00-.5-.5z" />
        </svg>
      ),
      badge: unreadMessages,
    },
    {
      label: "Check-in",
      href: "/check-in",
      icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M3 7l3 3 5-5" />
          <circle cx="7" cy="7" r="5.5" />
        </svg>
      ),
    },
    {
      label: "Content Calendar",
      href: "/content-calendar",
      icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M12.5 1.5c0 0-4 .5-5.5 3.5-1.5-1-4-1-5 .5 1 0 2 .5 2.5 1.5C3 7.5 1.5 9 1.5 12.5c1.5-1 3.5-3.5 5-5 .5.5 1 .5 1 .5s.5-1.5 1.5-2.5 3.5-4 3.5-4z" />
        </svg>
      ),
    },
    {
      label: "Session Notes",
      href: "/session-notes",
      icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M2.5 1.5h9a.5.5 0 01.5.5v10a.5.5 0 01-.5.5h-9a.5.5 0 01-.5-.5V2a.5.5 0 01.5-.5z" />
          <path d="M4.5 4.5h5M4.5 7h5M4.5 9.5h3" />
        </svg>
      ),
    },
    {
      label: "Meetings",
      href: "/meetings",
      icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="1" y="2.5" width="12" height="10" rx="0.5" />
          <path d="M1 6h12M4.5 1v3M9.5 1v3" />
        </svg>
      ),
    },
    {
      label: "Deliverables",
      href: "/deliverables",
      icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M2.5 1.5h6l3 3v8a.5.5 0 01-.5.5h-8.5a.5.5 0 01-.5-.5v-11a.5.5 0 01.5-.5z" />
          <path d="M8.5 1.5v3h3" />
        </svg>
      ),
    },
    {
      label: "Resources",
      href: "/resources",
      icon: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M2 2.5h10M2 5.5h10M2 8.5h6" />
          <circle cx="10.5" cy="10.5" r="2" />
          <path d="M12 10.5h-3M10.5 9v3" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="fixed top-0 left-0 h-screen w-56 bg-[#F5F2ED] border-r border-[#E8E2D9] flex flex-col z-10">
      {/* Logo */}
      <div className="px-6 py-8 border-b border-[#E8E2D9]">
        <Logo size="sm" />
        <p className="mt-1 text-[10px] tracking-[0.1em] text-[#8C8277] uppercase truncate">
          {name}
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 text-xs tracking-wide rounded-xl transition-all ${
                active
                  ? "text-[#1A1714] bg-[#EDE8E0] border-l-2 border-[#C8B89A] pl-[10px]"
                  : "text-[#5C5550] hover:text-[#1A1714] hover:bg-[#EDE8E0]/60 rounded-xl"
              }`}
            >
              <span className="flex items-center gap-3">
                <span className={active ? "text-[#C8B89A]" : ""}>{item.icon}</span>
                {item.label}
              </span>
              {"badge" in item && item.badge && item.badge > 0 ? (
                <span className="w-4 h-4 rounded-full bg-[#1A1714] text-[#FAFAF8] text-[9px] flex items-center justify-center">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-6 border-t border-[#E8E2D9] pt-4">
        <form action={clientLogoutAction}>
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2.5 text-xs tracking-wide text-[#8C8277] hover:text-[#1A1714] w-full transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M5 12H2.5a.5.5 0 01-.5-.5v-9a.5.5 0 01.5-.5H5M9.5 9.5L12 7l-2.5-2.5M12 7H5" />
            </svg>
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
