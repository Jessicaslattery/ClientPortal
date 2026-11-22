"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sections = [
  {
    label: null,
    items: [
      { href: "/social/overview", label: "Overview", icon: IconOverview },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/social/pillars", label: "Pillars", icon: IconPillars },
      { href: "/social/posts", label: "Posts", icon: IconPosts },
      { href: "/social/stories", label: "Stories", icon: IconStories },
    ],
  },
  {
    label: "Insights",
    items: [
      { href: "/social/audit", label: "Audit", icon: IconAudit },
      { href: "/social/analytics", label: "Analytics", icon: IconAnalytics },
    ],
  },
  {
    label: "AI",
    items: [
      { href: "/social/ai", label: "AI Assistant", icon: IconAI },
    ],
  },
  {
    label: "Brand",
    items: [
      { href: "/social/profile", label: "Brand Profile", icon: IconProfile },
      { href: "/social/goals", label: "Goals", icon: IconGoals },
    ],
  },
  {
    label: "Growth",
    items: [
      { href: "/social/learn", label: "Learn", icon: IconLearn },
    ],
  },
  {
    label: "Connect",
    items: [
      { href: "/social/check-in", label: "Check-in", icon: IconCheckIn },
      { href: "/social/messages", label: "Messages", icon: IconMessages },
    ],
  },
];

const mobileLinks = [
  { href: "/social/overview", label: "Overview", icon: IconOverview },
  { href: "/social/pillars", label: "Pillars", icon: IconPillars },
  { href: "/social/posts", label: "Posts", icon: IconPosts },
  { href: "/social/analytics", label: "Analytics", icon: IconAnalytics },
  { href: "/social/messages", label: "Messages", icon: IconMessages },
];

export function SmsNav({ mobile = false }: { mobile?: boolean }) {
  const path = usePathname();

  if (mobile) {
    return (
      <>
        {mobileLinks.map(({ href, label, icon: Icon }) => {
          const active = path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center gap-1 py-2 text-[9px] tracking-[0.14em] uppercase transition-colors ${
                active ? "text-[#1A1917]" : "text-[#9e9890]"
              }`}
            >
              <Icon active={active} />
              {label}
            </Link>
          );
        })}
      </>
    );
  }

  return (
    <nav className="space-y-5">
      {sections.map((section, si) => (
        <div key={si}>
          {section.label && (
            <p className="px-3 mb-1.5 text-[9px] tracking-[0.22em] uppercase text-[#b0a89e] font-[300]">
              {section.label}
            </p>
          )}
          <div className="space-y-0.5">
            {section.items.map(({ href, label, icon: Icon }) => {
              const active = path.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] transition-all ${
                    active
                      ? "bg-[#1A1917] text-white"
                      : "text-[#6d675e] hover:text-[#1A1917] hover:bg-[#F5F3EF]"
                  }`}
                >
                  <Icon active={active} />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function IconCheckIn({ active }: { active: boolean }) {
  const c = active ? "white" : "#6d675e";
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke={c} strokeWidth="1.3">
      <path d="M4 7.5l2.5 2.5 5-5" />
      <circle cx="7.5" cy="7.5" r="6" />
    </svg>
  );
}

function IconOverview({ active }: { active: boolean }) {
  const c = active ? "white" : "#6d675e";
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke={c} strokeWidth="1.3">
      <rect x="1" y="1" width="5.5" height="5.5" rx="1.5" />
      <rect x="8.5" y="1" width="5.5" height="5.5" rx="1.5" />
      <rect x="1" y="8.5" width="5.5" height="5.5" rx="1.5" />
      <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.5" />
    </svg>
  );
}

function IconPillars({ active }: { active: boolean }) {
  const c = active ? "white" : "#6d675e";
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke={c} strokeWidth="1.3">
      <path d="M7.5 1.5l2 2h3l-1.5 2.5 1.5 2.5h-3l-2 2-2-2h-3l1.5-2.5L2 3.5h3l2-2z" />
    </svg>
  );
}

function IconPosts({ active }: { active: boolean }) {
  const c = active ? "white" : "#6d675e";
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke={c} strokeWidth="1.3">
      <rect x="1" y="1" width="13" height="9.5" rx="1.5" />
      <path d="M4 13.5h7M7.5 10.5v3" />
    </svg>
  );
}

function IconStories({ active }: { active: boolean }) {
  const c = active ? "white" : "#6d675e";
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke={c} strokeWidth="1.3">
      <rect x="4.5" y="1" width="6" height="13" rx="1.5" />
      <path d="M6.5 5h2M6.5 7.5h2M6.5 10h1.5" />
    </svg>
  );
}

function IconAudit({ active }: { active: boolean }) {
  const c = active ? "white" : "#6d675e";
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke={c} strokeWidth="1.3">
      <circle cx="7.5" cy="7.5" r="6" />
      <path d="M4.5 7.5l2 2 4-4" />
    </svg>
  );
}

function IconAnalytics({ active }: { active: boolean }) {
  const c = active ? "white" : "#6d675e";
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke={c} strokeWidth="1.3">
      <path d="M1.5 13.5h12M3 13.5V9M6.5 13.5V5M10 13.5V7" />
    </svg>
  );
}

function IconLearn({ active }: { active: boolean }) {
  const c = active ? "white" : "#6d675e";
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke={c} strokeWidth="1.3">
      <path d="M7.5 2L1.5 5.5l6 3 6-3-6-3z" />
      <path d="M1.5 5.5v5c0 1.9 2.7 2.5 6 2.5s6-.6 6-2.5v-5" />
    </svg>
  );
}

function IconMessages({ active }: { active: boolean }) {
  const c = active ? "white" : "#6d675e";
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke={c} strokeWidth="1.3">
      <path d="M7.5 1.5C4.19 1.5 1.5 3.85 1.5 6.75c0 1.57.74 2.98 1.93 3.96L3 13l2.87-1.44A6.4 6.4 0 007.5 12c3.31 0 6-2.35 6-5.25S10.81 1.5 7.5 1.5z" />
    </svg>
  );
}

function IconAI({ active }: { active: boolean }) {
  const c = active ? "white" : "#6d675e";
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke={c} strokeWidth="1.3">
      <path d="M7.5 1.5v2M7.5 11.5v2M1.5 7.5h2M11.5 7.5h2M3.4 3.4l1.4 1.4M10.2 10.2l1.4 1.4M3.4 11.6l1.4-1.4M10.2 4.8l1.4-1.4" />
      <circle cx="7.5" cy="7.5" r="2.5" />
    </svg>
  );
}

function IconProfile({ active }: { active: boolean }) {
  const c = active ? "white" : "#6d675e";
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke={c} strokeWidth="1.3">
      <circle cx="7.5" cy="5" r="2.5" />
      <path d="M2 13c0-3.03 2.46-5.5 5.5-5.5S13 9.97 13 13" />
    </svg>
  );
}

function IconGoals({ active }: { active: boolean }) {
  const c = active ? "white" : "#6d675e";
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke={c} strokeWidth="1.3">
      <circle cx="7.5" cy="7.5" r="6" />
      <circle cx="7.5" cy="7.5" r="3.5" />
      <circle cx="7.5" cy="7.5" r="1" fill={c} stroke="none" />
    </svg>
  );
}
