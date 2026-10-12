"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { logoutAction } from "@/app/(founder)/actions";

const navItems = [
  {
    label: "Command Centre",
    href: "/dashboard",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="1" y="1" width="5" height="5" rx="0.5" />
        <rect x="8" y="1" width="5" height="5" rx="0.5" />
        <rect x="1" y="8" width="5" height="5" rx="0.5" />
        <rect x="8" y="8" width="5" height="5" rx="0.5" />
      </svg>
    ),
  },
  {
    label: "Business Health",
    href: "/business-health",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M1 9l3-4 3 3 3-5 3 2" />
        <path d="M1 13h12" />
      </svg>
    ),
  },
  {
    label: "Clients",
    href: "/clients",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="7" cy="4.5" r="2.5" />
        <path d="M1.5 13c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5" />
      </svg>
    ),
  },
  {
    label: "Agent Hub",
    href: "/agents",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="7" cy="7" r="2" />
        <path d="M7 1.5v2M7 10.5v2M1.5 7h2M10.5 7h2M3.1 3.1l1.4 1.4M9.5 9.5l1.4 1.4M10.9 3.1l-1.4 1.4M4.5 9.5l-1.4 1.4" />
      </svg>
    ),
  },
  {
    label: "Agent Workspace",
    href: "/agent-workspace",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M7 1.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11z" />
        <path d="M5 7l1.5 1.5L9 5" />
      </svg>
    ),
  },
  {
    label: "My Tasks",
    href: "/my-tasks",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M2.5 4h9M2.5 7h9M2.5 10h5" />
        <path d="M11 8.5l1.5 1.5-1.5 1.5" />
      </svg>
    ),
  },
  {
    label: "Messages",
    href: "/inbox",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M7 1C3.69 1 1 3.35 1 6.25c0 1.57.74 2.98 1.93 3.96L2.5 13l2.87-1.44A6.4 6.4 0 007 11.5c3.31 0 6-2.35 6-5.25S10.31 1 7 1z" />
      </svg>
    ),
  },
  {
    label: "Content Calendar",
    href: "/calendar",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="1" y="2.5" width="12" height="10" rx="0.5" />
        <path d="M1 6h12M4.5 1v3M9.5 1v3" />
      </svg>
    ),
  },
  {
    label: "Billing",
    href: "/billing",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="1" y="3" width="12" height="8" rx="0.5" />
        <path d="M1 6.5h12" />
      </svg>
    ),
  },
  {
    label: "Expenses",
    href: "/expenses",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="7" cy="7" r="5.5" />
        <path d="M7 4v6M5 5.5h3a1 1 0 010 2H6a1 1 0 000 2h3" />
      </svg>
    ),
  },
  {
    label: "Content Tracker",
    href: "/content-tracker",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="1" y="1" width="12" height="12" rx="0.5" />
        <path d="M4 7l2 2 4-4" />
      </svg>
    ),
  },
  {
    label: "Client Stats",
    href: "/client-stats",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M1.5 12.5h11M3 12.5V8M6.5 12.5V4M10 12.5V6" />
      </svg>
    ),
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="7" cy="6" r="2" /><path d="M1 13c0-3.314 2.686-6 6-6s6 2.686 6 6" />
      </svg>
    ),
  },
  {
    label: "Resources",
    href: "/library",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M2 2.5h10M2 5.5h10M2 8.5h6" />
        <circle cx="10.5" cy="10.5" r="2" />
        <path d="M12 10.5h-3M10.5 9v3" />
      </svg>
    ),
  },
  {
    label: "Granola",
    href: "/granola",
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M7 1.5v11M3 5l4-3.5L11 5M2.5 12.5h9" />
      </svg>
    ),
  },
];

export function FounderSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 h-screen w-56 bg-[#F5F2ED] border-r border-[#E8E2D9] flex flex-col z-10">
      {/* Logo */}
      <div className="px-6 py-8 border-b border-[#E8E2D9]">
        <Logo size="sm" />
        <p className="mt-1 text-[10px] tracking-[0.1em] text-[#8C8277] uppercase">
          Founder
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-0.5">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 text-xs tracking-wide rounded-xl transition-all ${
                active
                  ? "text-[#1A1714] bg-[#EDE8E0] border-l-2 border-[#C8B89A] pl-[10px]"
                  : "text-[#5C5550] hover:text-[#1A1714] hover:bg-[#EDE8E0]/60"
              }`}
            >
              <span className={active ? "text-[#C8B89A]" : ""}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-6 border-t border-[#E8E2D9] pt-4">
        <form action={logoutAction}>
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
