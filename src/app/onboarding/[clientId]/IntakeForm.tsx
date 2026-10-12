"use client";

import { useState } from "react";
import { submitIntakeForm } from "./actions";

type Props = { clientId: string; firstName: string };

const TOTAL_SECTIONS = 6;

const sectionTitles = [
  "Your business",
  "Where you are now",
  "Systems and team",
  "You as a founder",
  "Your goals",
  "Content",
];

export function IntakeForm({ clientId, firstName }: Props) {
  const [section, setSection] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    businessName: "",
    whatTheyDo: "",
    whoTheyServe: "",
    howLongTrading: "",
    currentRevenue: "",
    revenueGoal: "",
    biggestChallenge: "",
    whatTheyTried: "",
    whatIsWorking: "",
    whatIsNot: "",
    currentTools: "",
    teamSituation: "",
    contentPlatforms: "",
    workingHoursPerWeek: "",
    energyLevel: 5,
    biggestPersonalBlock: "",
    goalOne: "",
    goalTwo: "",
    goalThree: "",
    successIn6Months: "",
    personalStory: "",
    clientsFeedback: "",
    industryBelief: "",
    dailyRoutine: "",
    mostProudOf: "",
  });

  function set(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    setLoading(true);
    await submitIntakeForm(clientId, {
      businessName: form.businessName,
      whatTheyDo: form.whatTheyDo,
      whoTheyServe: form.whoTheyServe,
      howLongTrading: form.howLongTrading,
      currentRevenue: form.currentRevenue,
      revenueGoal: form.revenueGoal,
      biggestChallenge: form.biggestChallenge,
      whatTheyTried: form.whatTheyTried,
      whatIsWorking: form.whatIsWorking,
      whatIsNot: form.whatIsNot,
      currentTools: form.currentTools,
      teamSituation: form.teamSituation,
      contentPlatforms: form.contentPlatforms,
      workingHoursPerWeek: form.workingHoursPerWeek ? parseInt(form.workingHoursPerWeek) : null,
      energyLevel: form.energyLevel,
      biggestPersonalBlock: form.biggestPersonalBlock,
      goalOne: form.goalOne,
      goalTwo: form.goalTwo,
      goalThree: form.goalThree,
      successIn6Months: form.successIn6Months,
      personalStory: form.personalStory,
      clientsFeedback: form.clientsFeedback,
      industryBelief: form.industryBelief,
      dailyRoutine: form.dailyRoutine,
      mostProudOf: form.mostProudOf,
    });
  }

  const inputClass =
    "w-full rounded-xl border border-[#E8E2D9] bg-white px-4 py-3 text-sm text-[#1A1714] placeholder-[#8C8277] focus:outline-none focus:border-[#C8B89A] transition-colors";
  const textareaClass =
    "w-full rounded-xl border border-[#E8E2D9] bg-white px-4 py-3 text-sm text-[#1A1714] placeholder-[#8C8277] focus:outline-none focus:border-[#C8B89A] transition-colors resize-none min-h-[100px]";
  const labelClass = "block text-xs tracking-[0.08em] text-[#5C5550] mb-1.5 uppercase";

  const progressPercent = ((section - 1) / TOTAL_SECTIONS) * 100;

  return (
    <div>
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#5C5550] tracking-wide">
            Section {section} of {TOTAL_SECTIONS} · {sectionTitles[section - 1]}
          </span>
          <span className="text-xs text-[#C8B89A]">{Math.round(progressPercent)}%</span>
        </div>
        <div className="h-1 bg-[#F5F2ED] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#C8B89A] rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex gap-1 mt-2">
          {Array.from({ length: TOTAL_SECTIONS }, (_, i) => (
            <div
              key={i}
              className={`flex-1 h-0.5 rounded-full transition-all duration-300 ${
                i + 1 < section ? "bg-[#C8B89A]" : i + 1 === section ? "bg-[#C8B89A]/60" : "bg-[#F5F2ED]"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#F5F2ED] p-8 shadow-sm">
        {/* Section 1 */}
        {section === 1 && (
          <div className="space-y-6">
            <div>
              <label className={labelClass}>Business name</label>
              <input className={inputClass} value={form.businessName} onChange={(e) => set("businessName", e.target.value)} placeholder="Your business name" required />
            </div>
            <div>
              <label className={labelClass}>What does your business do?</label>
              <textarea className={textareaClass} value={form.whatTheyDo} onChange={(e) => set("whatTheyDo", e.target.value)} placeholder="Describe what you do and how you deliver value" required />
            </div>
            <div>
              <label className={labelClass}>Who do you serve?</label>
              <textarea className={textareaClass} value={form.whoTheyServe} onChange={(e) => set("whoTheyServe", e.target.value)} placeholder="Your ideal client · who they are, what they need" required />
            </div>
            <div>
              <label className={labelClass}>How long have you been trading?</label>
              <input className={inputClass} value={form.howLongTrading} onChange={(e) => set("howLongTrading", e.target.value)} placeholder="e.g. 2 years, 6 months" required />
            </div>
            <div>
              <label className={labelClass}>Current revenue (monthly or annual)</label>
              <input className={inputClass} value={form.currentRevenue} onChange={(e) => set("currentRevenue", e.target.value)} placeholder="e.g. $5k/month, $80k/year" required />
            </div>
            <div>
              <label className={labelClass}>Revenue goal</label>
              <input className={inputClass} value={form.revenueGoal} onChange={(e) => set("revenueGoal", e.target.value)} placeholder="What revenue do you want to reach and by when?" required />
            </div>
          </div>
        )}

        {/* Section 2 */}
        {section === 2 && (
          <div className="space-y-6">
            <div>
              <label className={labelClass}>What is your biggest challenge right now?</label>
              <textarea className={textareaClass} value={form.biggestChallenge} onChange={(e) => set("biggestChallenge", e.target.value)} placeholder="Be as specific and honest as you can" required />
            </div>
            <div>
              <label className={labelClass}>What have you tried to address it?</label>
              <textarea className={textareaClass} value={form.whatTheyTried} onChange={(e) => set("whatTheyTried", e.target.value)} placeholder="What approaches, strategies or tools have you already tested?" required />
            </div>
            <div>
              <label className={labelClass}>What is currently working in your business?</label>
              <textarea className={textareaClass} value={form.whatIsWorking} onChange={(e) => set("whatIsWorking", e.target.value)} placeholder="What's generating results or momentum?" required />
            </div>
            <div>
              <label className={labelClass}>What is not working?</label>
              <textarea className={textareaClass} value={form.whatIsNot} onChange={(e) => set("whatIsNot", e.target.value)} placeholder="Where are you stuck, leaking energy or getting poor results?" required />
            </div>
          </div>
        )}

        {/* Section 3 */}
        {section === 3 && (
          <div className="space-y-6">
            <div>
              <label className={labelClass}>What tools do you currently use?</label>
              <textarea className={textareaClass} value={form.currentTools} onChange={(e) => set("currentTools", e.target.value)} placeholder="CRM, project management, email, scheduling · list everything" required />
            </div>
            <div>
              <label className={labelClass}>Your team situation</label>
              <textarea className={textareaClass} value={form.teamSituation} onChange={(e) => set("teamSituation", e.target.value)} placeholder="Solo? VA? Team? Who helps you and what do they do?" required />
            </div>
            <div>
              <label className={labelClass}>Content platforms</label>
              <textarea className={textareaClass} value={form.contentPlatforms} onChange={(e) => set("contentPlatforms", e.target.value)} placeholder="Where do you create and publish content? How often?" required />
            </div>
          </div>
        )}

        {/* Section 4 */}
        {section === 4 && (
          <div className="space-y-6">
            <div>
              <label className={labelClass}>How many hours per week do you work?</label>
              <input
                type="number"
                className={inputClass}
                value={form.workingHoursPerWeek}
                onChange={(e) => set("workingHoursPerWeek", e.target.value)}
                placeholder="e.g. 40"
                min={1}
                max={100}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Energy level · {form.energyLevel}/10</label>
              <p className="text-xs text-[#8C8277] mb-3">
                How would you rate your current energy and motivation as a founder?
              </p>
              <input
                type="range"
                min={1}
                max={10}
                value={form.energyLevel}
                onChange={(e) => set("energyLevel", parseInt(e.target.value))}
                className="w-full accent-[#C8B89A]"
              />
              <div className="flex justify-between text-xs text-[#8C8277] mt-1">
                <span>1 · exhausted</span>
                <span>10 · energised</span>
              </div>
            </div>
            <div>
              <label className={labelClass}>What is your biggest personal block as a founder?</label>
              <textarea className={textareaClass} value={form.biggestPersonalBlock} onChange={(e) => set("biggestPersonalBlock", e.target.value)} placeholder="Fear, perfectionism, visibility, delegation · be honest" required />
            </div>
          </div>
        )}

        {/* Section 5 */}
        {section === 5 && (
          <div className="space-y-6">
            <div>
              <label className={labelClass}>Goal 1</label>
              <input className={inputClass} value={form.goalOne} onChange={(e) => set("goalOne", e.target.value)} placeholder="Your first key goal for this programme" required />
            </div>
            <div>
              <label className={labelClass}>Goal 2</label>
              <input className={inputClass} value={form.goalTwo} onChange={(e) => set("goalTwo", e.target.value)} placeholder="Your second goal" required />
            </div>
            <div>
              <label className={labelClass}>Goal 3</label>
              <input className={inputClass} value={form.goalThree} onChange={(e) => set("goalThree", e.target.value)} placeholder="Your third goal" required />
            </div>
            <div>
              <label className={labelClass}>What does success look like in 6 months?</label>
              <textarea className={textareaClass} value={form.successIn6Months} onChange={(e) => set("successIn6Months", e.target.value)} placeholder="Paint the picture · what has changed in your business and your life?" required />
            </div>
          </div>
        )}

        {/* Section 6 */}
        {section === 6 && (
          <div className="space-y-6">
            <p className="text-xs text-[#C8B89A] tracking-[0.12em] uppercase mb-4">
              This helps us create personalised content for you
            </p>
            <div>
              <label className={labelClass}>A personal story that shaped how you do business</label>
              <textarea className={textareaClass} value={form.personalStory} onChange={(e) => set("personalStory", e.target.value)} placeholder="Share a moment, experience or turning point that defines your approach" required />
            </div>
            <div>
              <label className={labelClass}>What do your clients say about working with you?</label>
              <textarea className={textareaClass} value={form.clientsFeedback} onChange={(e) => set("clientsFeedback", e.target.value)} placeholder="Share feedback, testimonials or recurring themes" required />
            </div>
            <div>
              <label className={labelClass}>What do you believe about your industry that most people disagree with?</label>
              <textarea className={textareaClass} value={form.industryBelief} onChange={(e) => set("industryBelief", e.target.value)} placeholder="Your contrarian take · be bold and specific" required />
            </div>
            <div>
              <label className={labelClass}>What does your daily routine look like?</label>
              <textarea className={textareaClass} value={form.dailyRoutine} onChange={(e) => set("dailyRoutine", e.target.value)} placeholder="Morning to evening · what does a typical day look like?" required />
            </div>
            <div>
              <label className={labelClass}>What are you most proud of in your business?</label>
              <textarea className={textareaClass} value={form.mostProudOf} onChange={(e) => set("mostProudOf", e.target.value)} placeholder="Achievements, milestones, moments that matter" required />
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        {section > 1 ? (
          <button
            type="button"
            onClick={() => setSection((s) => s - 1)}
            className="px-6 py-3 rounded-xl border border-[#E8E2D9] text-sm text-[#5C5550] hover:border-[#C8B89A] hover:text-[#1A1714] transition-colors"
          >
            Previous
          </button>
        ) : (
          <div />
        )}

        {section < TOTAL_SECTIONS ? (
          <button
            type="button"
            onClick={() => setSection((s) => s + 1)}
            className="px-8 py-3 rounded-xl bg-[#1A1714] text-sm text-[#F5F2ED] hover:bg-[#2C2520] transition-colors"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-[#C8B89A] text-sm text-[#1A1714] font-medium hover:bg-[#b8a88a] transition-colors disabled:opacity-60"
          >
            {loading ? "Submitting…" : `Submit, ${firstName}`}
          </button>
        )}
      </div>
    </div>
  );
}
