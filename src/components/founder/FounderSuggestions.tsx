"use client";

import { useState, useTransition } from "react";
import { markSuggestionUsed } from "@/app/(founder)/dashboard/suggestion-actions";

interface Suggestion {
  id: string;
  type: string;
  content: string;
  used: boolean;
}

interface Props {
  socialSuggestions: Suggestion[];
  resourceSuggestions: Suggestion[];
  month: string; // YYYY-MM display label
}

export function FounderSuggestions({ socialSuggestions, resourceSuggestions, month }: Props) {
  const [usedIds, setUsedIds] = useState<Set<string>>(
    new Set([
      ...socialSuggestions.filter((s) => s.used).map((s) => s.id),
      ...resourceSuggestions.filter((s) => s.used).map((s) => s.id),
    ])
  );
  const [pending, startTransition] = useTransition();

  function handleUse(id: string) {
    startTransition(async () => {
      await markSuggestionUsed(id);
      setUsedIds((prev) => new Set([...prev, id]));
    });
  }

  if (socialSuggestions.length === 0 && resourceSuggestions.length === 0) return null;

  return (
    <div>
      <h2 className="text-xs tracking-[0.15em] uppercase text-[#8C8277] mb-4">
        This month&apos;s suggestions
      </h2>
      <div className="rounded-3xl border border-[#E8E2D9] divide-y divide-[#E8E2D9]">
        {socialSuggestions.length > 0 && (
          <div className="px-6 py-5">
            <p className="text-[10px] tracking-[0.12em] uppercase text-[#C8B89A] mb-3">
              Social post ideas
            </p>
            <div className="space-y-3">
              {socialSuggestions.map((s) => (
                <SuggestionRow
                  key={s.id}
                  suggestion={s}
                  used={usedIds.has(s.id)}
                  disabled={pending}
                  onUse={() => handleUse(s.id)}
                />
              ))}
            </div>
          </div>
        )}

        {resourceSuggestions.length > 0 && (
          <div className="px-6 py-5">
            <p className="text-[10px] tracking-[0.12em] uppercase text-[#C8B89A] mb-3">
              Library resources to add
            </p>
            <div className="space-y-3">
              {resourceSuggestions.map((s) => (
                <SuggestionRow
                  key={s.id}
                  suggestion={s}
                  used={usedIds.has(s.id)}
                  disabled={pending}
                  onUse={() => handleUse(s.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SuggestionRow({
  suggestion,
  used,
  disabled,
  onUse,
}: {
  suggestion: Suggestion;
  used: boolean;
  disabled: boolean;
  onUse: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <p
        className={`text-sm flex-1 leading-relaxed ${
          used ? "text-[#8C8277] line-through" : "text-[#1A1714]"
        }`}
      >
        {suggestion.content}
      </p>
      {!used ? (
        <button
          onClick={onUse}
          disabled={disabled}
          className="shrink-0 text-[10px] tracking-[0.1em] uppercase text-[#C8B89A] border border-[#C8B89A]/40 rounded-full px-3 py-1 hover:bg-[#C8B89A]/8 transition-colors disabled:opacity-40"
        >
          Use this
        </button>
      ) : (
        <span className="shrink-0 text-[10px] tracking-[0.1em] uppercase text-[#8C8277]">
          Done
        </span>
      )}
    </div>
  );
}
