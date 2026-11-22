"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { clientLogoutAction } from "@/app/(client)/actions";

const NAV_SECTIONS = [
  {
    section: "Overview",
    items: [
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
    ],
  },
  {
    section: "Work",
    items: [
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
        label: "Roadmap",
        href: "/roadmap",
        icon: (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M1 3.5h3l2 2h7M1 7h4l2 2h6M1 10.5h5l2-2" />
          </svg>
        ),
      },
    ],
  },
  {
    section: "Connect",
    items: [
      {
        label: "Messages",
        href: "/messages",
        hasBadge: true,
        icon: (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M12.5 2.5h-11a.5.5 0 00-.5.5v7a.5.5 0 00.5.5h2v2l3-2h6a.5.5 0 00.5-.5V3a.5.5 0 00-.5-.5z" />
          </svg>
        ),
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
        label: "Wins",
        href: "/wins",
        icon: (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M7 1l1.5 3.5L12 5l-2.5 2.5.5 3.5L7 9.5 4 11l.5-3.5L2 5l3.5-.5z" />
          </svg>
        ),
      },
      {
        label: "Questionnaires",
        href: "/questionnaires",
        icon: (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
            <rect x="2" y="1.5" width="10" height="11" rx="0.5" />
            <path d="M4.5 5h5M4.5 7.5h5M4.5 10h3" />
          </svg>
        ),
      },
    ],
  },
];

const SOCIAL_NAV_SECTIONS = [
  {
    section: "Content",
    items: [
      { label: "Pillars", href: "/social/pillars", icon: <svg width="14" height="14" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M7.5 1.5l2 2h3l-1.5 2.5 1.5 2.5h-3l-2 2-2-2h-3l1.5-2.5L2 3.5h3l2-2z" /></svg> },
      { label: "Posts", href: "/social/posts", icon: <svg width="14" height="14" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="1" y="1" width="13" height="9.5" rx="1.5" /><path d="M4 13.5h7M7.5 10.5v3" /></svg> },
      { label: "Stories", href: "/social/stories", icon: <svg width="14" height="14" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="4.5" y="1" width="6" height="13" rx="1.5" /><path d="M6.5 5h2M6.5 7.5h2M6.5 10h1.5" /></svg> },
    ],
  },
  {
    section: "Insights",
    items: [
      { label: "Audit", href: "/social/audit", icon: <svg width="14" height="14" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="7.5" cy="7.5" r="6" /><path d="M4.5 7.5l2 2 4-4" /></svg> },
      { label: "Analytics", href: "/social/analytics", icon: <svg width="14" height="14" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M1.5 13.5h12M3 13.5V9M6.5 13.5V5M10 13.5V7" /></svg> },
    ],
  },
  {
    section: "AI",
    items: [
      { label: "AI Assistant", href: "/social/ai", icon: <svg width="14" height="14" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M7.5 1.5v2M7.5 11.5v2M1.5 7.5h2M11.5 7.5h2M3.4 3.4l1.4 1.4M10.2 10.2l1.4 1.4M3.4 11.6l1.4-1.4M10.2 4.8l1.4-1.4" /><circle cx="7.5" cy="7.5" r="2.5" /></svg> },
    ],
  },
  {
    section: "Brand",
    items: [
      { label: "Brand Profile", href: "/social/profile", icon: <svg width="14" height="14" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="7.5" cy="5" r="2.5" /><path d="M2 13c0-3.03 2.46-5.5 5.5-5.5S13 9.97 13 13" /></svg> },
      { label: "Social Goals", href: "/social/goals", icon: <svg width="14" height="14" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.3"><circle cx="7.5" cy="7.5" r="6" /><circle cx="7.5" cy="7.5" r="3.5" /><circle cx="7.5" cy="7.5" r="1" fill="currentColor" stroke="none" /></svg> },
    ],
  },
  {
    section: "Growth",
    items: [
      { label: "Learn", href: "/social/learn", icon: <svg width="14" height="14" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M7.5 2L1.5 5.5l6 3 6-3-6-3z" /><path d="M1.5 5.5v5c0 1.9 2.7 2.5 6 2.5s6-.6 6-2.5v-5" /></svg> },
    ],
  },
];

export function ClientSidebar({
  name,
  unreadMessages,
  hiddenTabs = [],
  pkg = "consulting",
}: {
  name: string;
  unreadMessages: number;
  hiddenTabs?: string[];
  pkg?: "sms" | "consulting";
}) {
  const pathname = usePathname();

  const isHidden = (href: string) => hiddenTabs.includes(href.replace("/", ""));

  return (
    <aside className="fixed top-0 left-0 h-screen w-60 bg-white border-r border-[#EDEBE6] flex flex-col z-10">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-[#EDEBE6]">
        <Logo size="sm" />
        <p className="mt-1 text-[9px] tracking-[0.18em] text-[#b0a89e] uppercase truncate">{name}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
        {NAV_SECTIONS.map((section) => {
          const visibleItems = section.items.filter((item) => !isHidden(item.href));
          if (visibleItems.length === 0) return null;
          return (
            <div key={section.section}>
              <p className="px-3 mb-1.5 text-[9px] tracking-[0.2em] uppercase text-[#b0a89e]">
                {section.section}
              </p>
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                        active
                          ? "bg-[#1A1917] text-white"
                          : "text-[#7a7268] hover:text-[#1A1917] hover:bg-[#F5F3EF]"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className={active ? "opacity-80" : "opacity-60"}>{item.icon}</span>
                        {item.label}
                      </span>
                      {"hasBadge" in item && item.hasBadge && unreadMessages > 0 ? (
                        <span className={`w-4 h-4 rounded-full text-[9px] flex items-center justify-center ${active ? "bg-white text-[#1A1917]" : "bg-[#1A1917] text-white"}`}>
                          {unreadMessages}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Social Strategy section (consulting only) */}
        {pkg === "consulting" && !isHidden("social-strategy") && (
          <div className="border-t border-[#EDEBE6] pt-5 space-y-5">
            {SOCIAL_NAV_SECTIONS.map((section) => (
              <div key={section.section}>
                <p className="px-3 mb-1.5 text-[9px] tracking-[0.2em] uppercase text-[#b0a89e]">
                  {section.section}
                </p>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const active = pathname.startsWith(item.href);
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
          </div>
        )}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5 border-t border-[#EDEBE6] pt-3">
        <form action={clientLogoutAction}>
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
