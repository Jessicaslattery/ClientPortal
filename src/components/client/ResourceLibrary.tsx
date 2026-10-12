"use client";

import { useState, useMemo } from "react";

const CATEGORIES = [
  "Sales and Conversion",
  "Retention and Client Experience",
  "Operations and Systems",
  "Content and Brand",
  "Mindset and Leadership",
  "Templates and Frameworks",
  "Pivot Co. Masterclasses",
];

const TYPE_STYLES: Record<string, string> = {
  Video:    "bg-[#9B2335]/12 text-[#9B2335] border-[#9B2335]/20",
  PDF:      "bg-[#2D6A4F]/12 text-[#2D6A4F] border-[#2D6A4F]/20",
  Guide:    "bg-[#C8B89A]/12 text-[#C8B89A] border-[#C8B89A]/20",
  Template: "bg-[#b89060]/12 text-[#b89060] border-[#b89060]/20",
  Link:     "bg-[#5C5550]/12 text-[#5C5550] border-[#5C5550]/20",
};

type Resource = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  type: string;
  fileUrl: string | null;
  createdAt: Date;
  isNew: boolean;
};

export function ResourceLibrary({ resources }: { resources: Resource[] }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return resources.filter((r) => {
      const matchesSearch = !search || r.title.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !activeCategory || r.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [resources, search, activeCategory]);

  const grouped = useMemo(() => {
    const order = activeCategory ? [activeCategory] : CATEGORIES.filter((c) => filtered.some((r) => r.category === c));
    return order.reduce<Record<string, Resource[]>>((acc, cat) => {
      const items = filtered.filter((r) => r.category === cat);
      if (items.length) acc[cat] = items;
      return acc;
    }, {});
  }, [filtered, activeCategory]);

  const usedCategories = useMemo(
    () => CATEGORIES.filter((c) => resources.some((r) => r.category === c)),
    [resources]
  );

  return (
    <div className="space-y-6">
      {/* Search + filter bar */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <svg
            width="13"
            height="13"
            viewBox="0 0 13 13"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C8277] pointer-events-none"
          >
            <circle cx="5.5" cy="5.5" r="4" />
            <path d="M9 9l2.5 2.5" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resources…"
            className="w-full bg-[#FFFFFF] border border-[#E8E2D9] rounded-2xl pl-9 pr-4 py-2.5 text-sm text-[#1A1714] placeholder-[#8C8277] focus:outline-none focus:border-[#C8B89A]/40 transition-colors"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1.5 rounded-2xl text-[10px] tracking-[0.1em] uppercase transition-colors ${
              !activeCategory
                ? "bg-[#C8B89A]/10 text-[#C8B89A] border border-[#C8B89A]/20"
                : "text-[#8C8277] hover:text-[#1A1714] border border-transparent hover:border-[#E8E2D9]"
            }`}
          >
            All
          </button>
          {usedCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={`px-3 py-1.5 rounded-2xl text-[10px] tracking-[0.08em] transition-colors ${
                activeCategory === cat
                  ? "bg-[#C8B89A]/10 text-[#C8B89A] border border-[#C8B89A]/20"
                  : "text-[#8C8277] hover:text-[#1A1714] border border-transparent hover:border-[#E8E2D9]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-[#E8E2D9] px-6 py-16 text-center">
          <p className="text-sm text-[#8C8277]">{search || activeCategory !== "All" ? "No resources match your search." : "No resources yet."}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h2 className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277] mb-3">{category}</h2>
              <div className="rounded-3xl border border-[#E8E2D9] divide-y divide-[#E8E2D9]">
                {items.map((r) => {
                  const hasLink = !!r.fileUrl;
                  const inner = (
                    <>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-sm transition-colors ${hasLink ? "text-[#1A1714] group-hover:text-[#C8B89A]" : "text-[#1A1714]"}`}>
                            {r.title}
                          </span>
                          {r.isNew && (
                            <span className="shrink-0 text-[9px] tracking-[0.1em] uppercase px-1.5 py-0.5 rounded-full bg-[#C8B89A]/10 text-[#C8B89A] border border-[#C8B89A]/20">
                              New
                            </span>
                          )}
                          {!hasLink && (
                            <span className="shrink-0 text-[9px] tracking-[0.1em] uppercase px-1.5 py-0.5 rounded-full bg-[#E8E2D9] text-[#8C8277]">
                              Coming soon
                            </span>
                          )}
                        </div>
                        {r.description && (
                          <p className="text-xs text-[#5C5550] leading-5 line-clamp-2">{r.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`text-[9px] tracking-[0.1em] uppercase px-2 py-0.5 rounded-full border ${TYPE_STYLES[r.type] ?? TYPE_STYLES.Link}`}>
                            {r.type}
                          </span>
                          <span className="text-[10px] text-[#8C8277]">
                            Added {new Date(r.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                      </div>
                      {hasLink && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2"
                          className="text-[#8C8277] group-hover:text-[#C8B89A] shrink-0 mt-1 transition-colors">
                          <path d="M2.5 9.5l7-7M4 2.5h5.5v5.5" />
                        </svg>
                      )}
                    </>
                  );

                  return hasLink ? (
                    <a
                      key={r.id}
                      href={r.fileUrl!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-4 px-5 py-4 hover:bg-[#F5F2ED] transition-colors group"
                    >
                      {inner}
                    </a>
                  ) : (
                    <div key={r.id} className="flex items-start gap-4 px-5 py-4 opacity-60">
                      {inner}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
