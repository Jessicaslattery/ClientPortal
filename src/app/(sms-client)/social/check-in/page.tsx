"use client";

import { useState } from "react";

const QUESTIONS = [
  { id: "wins", label: "What's working well this week?", placeholder: "Posts, engagement, any wins..." },
  { id: "challenges", label: "Any challenges or blockers?", placeholder: "What felt hard or didn't land..." },
  { id: "energy", label: "Energy for content creation this week (1–10)", type: "number", placeholder: "7" },
  { id: "posted", label: "How many times did you post?", type: "number", placeholder: "4" },
  { id: "focus", label: "What do you want to focus on next week?", placeholder: "One thing to improve or try..." },
];

export default function SocialCheckInPage() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-xl space-y-10 py-4">
        <div className="border-b border-[#EDEBE6] pb-6">
          <p className="text-[9px] tracking-[0.22em] uppercase text-[#b0a89e] mb-1">Social Strategy</p>
          <h1 className="text-4xl font-[300] text-[#1A1917]">Check-in</h1>
        </div>
        <div className="border border-[#EDEBE6] rounded-xl p-8 text-center space-y-3">
          <span className="w-10 h-10 rounded-full bg-[#F5F3EF] flex items-center justify-center mx-auto">
            <svg width="18" height="18" viewBox="0 0 14 14" fill="none" stroke="#8C735A" strokeWidth="1.4">
              <path d="M3 7l3 3 5-5" />
            </svg>
          </span>
          <p className="text-base font-[300] text-[#1A1917]">Check-in submitted</p>
          <p className="text-sm text-[#b0a89e]">Your strategy coach will review this and follow up.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-10 py-4">
      <div className="border-b border-[#EDEBE6] pb-6">
        <p className="text-[9px] tracking-[0.22em] uppercase text-[#b0a89e] mb-1">Social Strategy</p>
        <h1 className="text-4xl font-[300] text-[#1A1917]">Check-in</h1>
        <p className="mt-2 text-sm text-[#b0a89e]">A quick weekly pulse on how your social is going.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {QUESTIONS.map((q) => (
          <div key={q.id}>
            <label className="block text-xs text-[#1A1917] mb-2 font-[400]">{q.label}</label>
            {q.type === "number" ? (
              <input
                type="number"
                min={1}
                max={10}
                placeholder={q.placeholder}
                value={answers[q.id] ?? ""}
                onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
                className="w-24 px-4 py-2.5 border border-[#EDEBE6] rounded-xl text-sm text-[#1A1917] bg-white placeholder:text-[#b0a89e] focus:outline-none focus:border-[#8C735A] transition-colors"
              />
            ) : (
              <textarea
                rows={3}
                placeholder={q.placeholder}
                value={answers[q.id] ?? ""}
                onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
                className="w-full px-4 py-3 border border-[#EDEBE6] rounded-xl text-sm text-[#1A1917] bg-white placeholder:text-[#b0a89e] focus:outline-none focus:border-[#8C735A] transition-colors resize-none"
              />
            )}
          </div>
        ))}

        <button
          type="submit"
          className="px-6 py-3 bg-[#1A1917] text-white text-xs tracking-[0.1em] rounded-xl hover:bg-[#2a2927] transition-colors"
        >
          Submit check-in
        </button>
      </form>
    </div>
  );
}
