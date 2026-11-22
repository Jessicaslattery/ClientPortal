"use client";

import { useTransition, useState } from "react";
import { toggleFeatureAction } from "@/app/(founder)/clients/[id]/feature-actions";

const FEATURES = [
  {
    group: "Core",
    items: [
      { key: "health",    label: "Business Health",    desc: "Weekly scorecards and check-ins" },
      { key: "tasks",     label: "Tasks",              desc: "Action items and to-dos" },
      { key: "goals",     label: "Goals",              desc: "Goal tracking and progress" },
      { key: "messages",  label: "Messages",           desc: "Direct messaging with you" },
    ],
  },
  {
    group: "Strategy",
    items: [
      { key: "roadmap",          label: "Roadmap",          desc: "Phase-by-phase business roadmap" },
      { key: "content-calendar", label: "Content Calendar", desc: "Content planning calendar" },
      { key: "session-notes",    label: "Session Notes",    desc: "Notes from your sessions together" },
      { key: "meetings",         label: "Meetings",         desc: "Upcoming meeting schedule" },
    ],
  },
  {
    group: "Resources",
    items: [
      { key: "deliverables", label: "Deliverables", desc: "Files and deliverables from Jess" },
      { key: "resources",    label: "Resources",    desc: "Library of resources and tools" },
      { key: "check-in",     label: "Check-in",     desc: "Weekly check-in form" },
    ],
  },
  {
    group: "Social Strategy",
    items: [
      { key: "social-strategy", label: "Social Strategy", desc: "Post plan, story plan, audit and analytics" },
    ],
  },
];

function Toggle({
  enabled,
  onChange,
  pending,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
  pending: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={pending}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-[28px] w-[48px] shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-60 ${
        enabled ? "bg-[#8C735A]" : "bg-[#EDEBE6]"
      }`}
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      <span
        className={`pointer-events-none inline-block h-[24px] w-[24px] transform rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.3)] ring-0 transition-transform duration-200 ease-in-out mt-[2px] ${
          enabled ? "translate-x-[22px]" : "translate-x-[2px]"
        }`}
      />
    </button>
  );
}

export function FeatureToggles({
  clientProfileId,
  hiddenTabs,
}: {
  clientProfileId: string;
  hiddenTabs: string[];
}) {
  const [pending, startTransition] = useTransition();
  const [localHidden, setLocalHidden] = useState<string[]>(hiddenTabs);

  function handleToggle(key: string, enabled: boolean) {
    // Optimistic update
    setLocalHidden((prev) =>
      enabled ? prev.filter((t) => t !== key) : [...prev, key]
    );

    startTransition(async () => {
      await toggleFeatureAction(clientProfileId, key, enabled);
    });
  }

  return (
    <div className="space-y-5">
      {FEATURES.map((group) => (
        <div key={group.group}>
          <p className="text-[9px] tracking-[0.18em] text-[#b0a89e] mb-3">{group.group}</p>
          <div className="space-y-1">
            {group.items.map((item) => {
              const enabled = !localHidden.includes(item.key);
              return (
                <div
                  key={item.key}
                  className="flex items-center justify-between py-3 border-b border-[#EDEBE6] last:border-0"
                >
                  <div className="min-w-0 pr-4">
                    <p className="text-sm text-[#1A1917] font-[300]">{item.label}</p>
                    <p className="text-[11px] text-[#b0a89e] mt-0.5">{item.desc}</p>
                  </div>
                  <Toggle
                    enabled={enabled}
                    onChange={(v) => handleToggle(item.key, v)}
                    pending={pending}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
