"use client";

import { useState, type ReactNode } from "react";

type Props = {
  profileContent: ReactNode;
  onboardingContent: ReactNode;
  hasOnboardingAlert?: boolean;
};

export function ClientProfileTabs({ profileContent, onboardingContent, hasOnboardingAlert }: Props) {
  const [activeTab, setActiveTab] = useState<"profile" | "onboarding">("profile");

  return (
    <div>
      <div className="flex items-center gap-1 border-b border-[#EDEBE6] mb-8">
        {[
          { key: "profile", label: "Profile" },
          { key: "onboarding", label: "Onboarding", alert: hasOnboardingAlert },
        ].map(({ key, label, alert }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as "profile" | "onboarding")}
            className={`relative px-5 py-3 text-xs tracking-[0.1em] transition-colors ${
              activeTab === key
                ? "text-[#1A1917] border-b-2 border-[#C8B89A] -mb-px"
                : "text-[#b0a89e] hover:text-[#7a7268]"
            }`}
          >
            {label}
            {alert && (
              <span className="ml-2 inline-flex items-center justify-center w-1.5 h-1.5 rounded-full bg-[#C8B89A]" />
            )}
          </button>
        ))}
      </div>
      {activeTab === "profile" ? profileContent : onboardingContent}
    </div>
  );
}
