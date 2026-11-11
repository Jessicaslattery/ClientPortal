"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/social/overview", label: "Overview", icon: IconOverview },
  { href: "/social/posts", label: "Posts", icon: IconPosts },
  { href: "/social/stories", label: "Stories", icon: IconStories },
  { href: "/social/audit", label: "Audit", icon: IconAudit },
  { href: "/social/learn", label: "Learn", icon: IconLearn },
];

export function SmsNav({ mobile = false }: { mobile?: boolean }) {
  const path = usePathname();

  if (mobile) {
    return (
      <>
        {links.map(({ href, label, icon: Icon }) => {
          const active = path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center gap-1 py-2 text-[9px] tracking-[0.14em] uppercase transition-colors ${
                active ? "text-[#1A1917]" : "text-[#6d675e]"
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
    <nav className="space-y-0.5">
      {links.map(({ href, label, icon: Icon }) => {
        const active = path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors ${
              active
                ? "bg-[#F7F5F0] text-[#1A1917] font-medium"
                : "text-[#6d675e] hover:text-[#1A1917] hover:bg-[#F7F5F0]/60"
            }`}
          >
            <Icon active={active} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function IconOverview({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={active ? "#1A1917" : "#6d675e"} strokeWidth="1.3">
      <rect x="1" y="1" width="6" height="6" rx="1" />
      <rect x="9" y="1" width="6" height="6" rx="1" />
      <rect x="1" y="9" width="6" height="6" rx="1" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  );
}

function IconPosts({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={active ? "#1A1917" : "#6d675e"} strokeWidth="1.3">
      <rect x="1" y="1" width="14" height="10" rx="1" />
      <path d="M4 14h8M8 11v3" />
    </svg>
  );
}

function IconStories({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={active ? "#1A1917" : "#6d675e"} strokeWidth="1.3">
      <rect x="4" y="1" width="8" height="14" rx="1" />
      <path d="M6 5h4M6 8h4M6 11h2" />
    </svg>
  );
}

function IconAudit({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={active ? "#1A1917" : "#6d675e"} strokeWidth="1.3">
      <circle cx="8" cy="8" r="6.5" />
      <path d="M5 8l2 2 4-4" />
    </svg>
  );
}

function IconLearn({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={active ? "#1A1917" : "#6d675e"} strokeWidth="1.3">
      <path d="M8 2L2 5l6 3 6-3-6-3z" />
      <path d="M2 5v5c0 2 2.7 3 6 3s6-1 6-3V5" />
    </svg>
  );
}
