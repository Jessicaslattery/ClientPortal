"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { logoutAction } from "@/app/(founder)/actions";

const NAV_SECTIONS = [
  {
    section: "Overview",
    items: [
      {
        label: "HQ",
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
    ],
  },
  {
    section: "Clients",
    items: [
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
        label: "CRM",
        href: "/crm",
        icon: (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M1.5 3h11M1.5 7h7M1.5 11h5" />
            <circle cx="11" cy="10.5" r="2" />
            <path d="M11 9v1.5l1 1" />
          </svg>
        ),
      },
      {
        label: "Messaging",
        href: "/inbox",
        icon: (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M7 1C3.69 1 1 3.35 1 6.25c0 1.57.74 2.98 1.93 3.96L2.5 13l2.87-1.44A6.4 6.4 0 007 11.5c3.31 0 6-2.35 6-5.25S10.31 1 7 1z" />
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
        label: "Staff",
        href: "/staff",
        founderOnly: true,
        icon: (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
            <circle cx="5" cy="4" r="2" />
            <circle cx="10" cy="4" r="2" />
            <path d="M1 13c0-2.21 1.79-4 4-4s4 1.79 4 4" />
            <path d="M10 9c1.66 0 3 1.34 3 3" />
          </svg>
        ),
      },
    ],
  },
  {
    section: "Work",
    items: [
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
    ],
  },
  {
    section: "Social",
    items: [
      {
        label: "Content Planner",
        href: "/social-planning",
        icon: (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
            <rect x="1" y="2.5" width="12" height="10" rx="0.5" />
            <path d="M1 6h12M4.5 1v3M9.5 1v3M4.5 8.5h2M4.5 10.5h4" />
          </svg>
        ),
      },
      {
        label: "Content Tracker",
        href: "/content-tracker",
        icon: (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
            <rect x="1" y="1" width="12" height="12" rx="0.5" />
            <path d="M1 5h12M1 9h12M5 1v12" />
          </svg>
        ),
      },
    ],
  },
  {
    section: "Finance",
    items: [
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
        label: "Analytics",
        href: "/analytics",
        icon: (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
            <circle cx="7" cy="6" r="2" /><path d="M1 13c0-3.314 2.686-6 6-6s6 2.686 6 6" />
          </svg>
        ),
      },
    ],
  },
];

export function FounderSidebar({ role = "founder" }: { role?: "founder" | "staff" }) {
  const pathname = usePathname();

  const visibleSections = NAV_SECTIONS
    .map((section) => {
      if (role === "staff" && section.section === "Finance") return null;
      const items = section.items.filter((item) => {
        if (role === "staff" && (item as { founderOnly?: boolean }).founderOnly) return false;
        if (role === "staff" && item.href === "/crm") return false;
        return true;
      });
      return { ...section, items };
    })
    .filter(Boolean) as typeof NAV_SECTIONS;

  return (
    <aside className="fixed top-0 left-0 h-screen w-60 bg-white border-r border-[#EDEBE6] flex flex-col z-10">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-[#EDEBE6]">
        <Logo size="sm" />
        <p className="mt-1 text-[9px] tracking-[0.18em] text-[#b0a89e]">{role === "staff" ? "Staff" : "Founder"}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
        {visibleSections.map((section) => (
          <div key={section.section}>
            <p className="px-3 mb-1.5 text-[9px] tracking-[0.2em] text-[#b0a89e]">
              {section.section}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all ${
                      active
                        ? "bg-[#1A1917] text-white"
                        : "text-[#7a7268] hover:text-[#1A1917] hover:bg-[#F5F3EF]"
                    }`}
                  >
                    <span className={active ? "opacity-80" : "opacity-60"}>{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5 border-t border-[#EDEBE6] pt-3">
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#7a7268] hover:text-[#1A1917] hover:bg-[#F5F3EF] w-full transition-all"
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
