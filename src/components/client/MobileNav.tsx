"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { clientLogoutAction } from "@/app/(client)/actions";

const PRIMARY_NAV = [
  {
    label: "Home",
    href: "/home",
    icon: (
      <svg width="20" height="20" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M1.5 6.5L7 2l5.5 4.5V12a.5.5 0 01-.5.5H9V9H5v3.5H2a.5.5 0 01-.5-.5V6.5z" />
      </svg>
    ),
  },
  {
    label: "Health",
    href: "/health",
    icon: (
      <svg width="20" height="20" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M1 9l3-4 3 3 3-5 3 2" />
        <path d="M1 13h12" />
      </svg>
    ),
  },
  {
    label: "Tasks",
    href: "/tasks",
    icon: (
      <svg width="20" height="20" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M2.5 4h9M2.5 7h9M2.5 10h5" />
      </svg>
    ),
  },
  {
    label: "Messages",
    href: "/messages",
    icon: (
      <svg width="20" height="20" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M12.5 2.5h-11a.5.5 0 00-.5.5v7a.5.5 0 00.5.5h2v2l3-2h6a.5.5 0 00.5-.5V3a.5.5 0 00-.5-.5z" />
      </svg>
    ),
  },
];

const ALL_NAV = [
  { label: "Home", href: "/home" },
  { label: "Business Health", href: "/health" },
  { label: "My Journey", href: "/journey" },
  { label: "Tasks", href: "/tasks" },
  { label: "Goals", href: "/goals" },
  { label: "Session Notes", href: "/session-notes" },
  { label: "Meetings", href: "/meetings" },
  { label: "Messages", href: "/messages" },
  { label: "Check-in", href: "/check-in" },
  { label: "Deliverables", href: "/deliverables" },
  { label: "Content Calendar", href: "/content-calendar" },
  { label: "Resources", href: "/resources" },
  { label: "Onboarding", href: "/onboarding" },
];

export function MobileNav({
  name,
  unreadMessages,
  hiddenTabs = [],
}: {
  name: string;
  unreadMessages: number;
  hiddenTabs?: string[];
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const visiblePrimaryNav = PRIMARY_NAV.filter(
    (item) => !hiddenTabs.includes(item.href.replace("/", ""))
  );
  const visibleAllNav = ALL_NAV.filter(
    (item) => !hiddenTabs.includes(item.href.replace("/", ""))
  );

  return (
    <>
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-[#F2EDE4] border-b border-[#E8E2D9] flex items-center justify-between px-4 z-30">
        <Logo size="sm" />
        <button
          onClick={() => setMenuOpen(true)}
          className="p-2 text-[#5C5550] hover:text-[#1A1714] transition-colors"
          aria-label="Open menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 5h14M3 10h14M3 15h14" />
          </svg>
        </button>
      </div>

      {/* Extra top padding for content */}
      <div className="h-14" />

      {/* Bottom tab bar */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-[#F2EDE4] border-t border-[#E8E2D9] flex items-center justify-around px-2 z-30">
        {visiblePrimaryNav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-colors relative ${
                active ? "text-[#C8B89A]" : "text-[#8C8277]"
              }`}
            >
              {item.label === "Messages" && unreadMessages > 0 && (
                <span className="absolute -top-0.5 right-1 w-4 h-4 rounded-full bg-[#C8B89A] text-[#FAFAF8] text-[8px] flex items-center justify-center">
                  {unreadMessages}
                </span>
              )}
              {item.icon}
              <span className="text-[9px] tracking-[0.05em] uppercase">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setMenuOpen(true)}
          className="flex flex-col items-center gap-1 px-3 py-1.5 text-[#8C8277]"
        >
          <svg width="20" height="20" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
            <circle cx="7" cy="7" r="5.5" />
            <path d="M7 4.5v5M4.5 7h5" />
          </svg>
          <span className="text-[9px] tracking-[0.05em] uppercase">More</span>
        </button>
      </div>

      {/* Slide-over menu */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed top-0 left-0 h-full w-72 bg-[#F2EDE4] border-r border-[#E8E2D9] z-50 flex flex-col">
            <div className="flex items-center justify-between px-6 py-6 border-b border-[#E8E2D9]">
              <div>
                <Logo size="sm" />
                <p className="mt-1 text-[10px] tracking-[0.1em] text-[#8C8277] uppercase">{name}</p>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="text-[#8C8277] hover:text-[#1A1714] transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M2 2l10 10M12 2L2 12" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
              {visibleAllNav.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`block px-4 py-3 text-sm rounded-2xl transition-colors ${
                      active
                        ? "text-[#C8B89A] bg-[#C8B89A]/8"
                        : "text-[#5C5550] hover:text-[#1A1714] hover:bg-[#F5F2ED]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="px-3 pb-6 border-t border-[#E8E2D9] pt-4">
              <form action={clientLogoutAction}>
                <button
                  type="submit"
                  className="w-full px-4 py-3 text-sm text-[#8C8277] hover:text-[#1A1714] text-left transition-colors rounded-2xl hover:bg-[#F5F2ED]"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}
