"use client";

import { useState, useActionState } from "react";
import { submitCheckIn } from "@/app/(client)/check-in/actions";

type Props = {
  clientProfileId: string;
  currentMonth: number;
  currentWeek: number;
};

const initialState = { error: "" };

function Section({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-[#E8E2D9] p-6 space-y-5">
      <div className="flex items-center gap-3">
        <span className="w-5 h-5 rounded-full border border-[#E8E2D9] flex items-center justify-center text-[9px] text-[#8C8277] tabular-nums shrink-0">
          {number}
        </span>
        <h2 className="text-[10px] tracking-[0.15em] uppercase text-[#5C5550]">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function LongField({ name, label, placeholder, required = true }: { name: string; label: string; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <label htmlFor={name} className="block text-xs text-[#1A1714] mb-2 leading-5">
        {label}
        {!required && <span className="ml-1.5 text-[#8C8277]">(optional)</span>}
      </label>
      <textarea
        id={name}
        name={name}
        required={required}
        rows={4}
        placeholder={placeholder}
        className="w-full rounded-2xl bg-[#FFFFFF] border border-[#E8E2D9] text-[#1A1714] px-4 py-3 text-sm placeholder:text-[#8C8277] focus:outline-none focus:border-[#C8B89A]/40 transition-colors resize-none leading-6"
      />
    </div>
  );
}

function ShortField({ name, label, placeholder, required = true }: { name: string; label: string; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <label htmlFor={name} className="block text-xs text-[#1A1714] mb-2 leading-5">
        {label}
        {!required && <span className="ml-1.5 text-[#8C8277]">(optional)</span>}
      </label>
      <textarea
        id={name}
        name={name}
        required={required}
        rows={2}
        placeholder={placeholder}
        className="w-full rounded-2xl bg-[#FFFFFF] border border-[#E8E2D9] text-[#1A1714] px-4 py-3 text-sm placeholder:text-[#8C8277] focus:outline-none focus:border-[#C8B89A]/40 transition-colors resize-none leading-6"
      />
    </div>
  );
}

export function CheckInForm({ clientProfileId, currentMonth, currentWeek }: Props) {
  const [energy, setEnergy] = useState(7);
  const submitWithIds = submitCheckIn.bind(null, clientProfileId, currentMonth, currentWeek);
  const [state, formAction, pending] = useActionState(submitWithIds, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="energyScore" value={energy} />

      {/* Section 1 · Progress */}
      <Section number={1} title="Progress">
        <LongField
          name="completed"
          label="What did you complete from your task list this week?"
          placeholder="Walk me through what you actually finished and shipped…"
        />
        <LongField
          name="notCompleted"
          label="What did you not complete · and what got in the way?"
          placeholder="Be honest. No judgment here…"
        />
      </Section>

      {/* Section 2 · Momentum */}
      <Section number={2} title="Momentum">
        <LongField
          name="shifted"
          label="What has shifted or improved in your business this week?"
          placeholder="Even small wins count. What feels different?"
        />
        <LongField
          name="stuck"
          label="What feels stuck, unclear, or heavy right now?"
          placeholder="Anything creating friction or weighing on you…"
        />
      </Section>

      {/* Section 3 · Energy */}
      <Section number={3} title="Energy">
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs text-[#1A1714]">
              How is your energy and momentum this week?
            </label>
            <span className="font-display text-2xl font-thin tracking-wide text-[#C8B89A] tabular-nums w-6 text-right">
              {energy}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={energy}
            onChange={(e) => setEnergy(Number(e.target.value))}
            className="w-full cursor-pointer"
            style={{
              appearance: "none",
              height: "1px",
              background: `linear-gradient(to right, #C8B89A ${(energy - 1) / 9 * 100}%, #E8E2D9 ${(energy - 1) / 9 * 100}%)`,
            }}
          />
          <div className="flex justify-between mt-2">
            <span className="text-[9px] text-[#8C8277]">1 · Depleted</span>
            <span className="text-[9px] text-[#8C8277]">10 · Energised</span>
          </div>
        </div>
        <ShortField
          name="energyNote"
          label="What is that number telling you?"
          placeholder="What's behind that score…"
        />
      </Section>

      {/* Section 4 · Operations */}
      <Section number={4} title="Operations">
        <LongField
          name="bottleneck"
          label="Where did you feel most like the bottleneck in your business this week?"
          placeholder="Where were you the blocker · for yourself or your team…"
        />
        <LongField
          name="clientExperience"
          label="Did anything in your client experience feel inconsistent or off?"
          placeholder="Delivery, communication, expectations, onboarding…"
        />
      </Section>

      {/* Section 5 · Call Prep */}
      <Section number={5} title="Call Prep">
        <LongField
          name="callNotes"
          label="What is the one thing you most want to cover on your next call?"
          placeholder="The thing you'd be disappointed not to discuss…"
        />
        <ShortField
          name="preCallNote"
          label="Is there anything I should know before we speak?"
          placeholder="Context, news, or something on your mind…"
          required={false}
        />
      </Section>

      {state.error && (
        <p className="text-xs text-[#9B2335] px-1">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-[#1A1714] text-[#FAFAF8] px-6 py-3.5 text-xs tracking-[0.15em] uppercase font-medium hover:bg-[#2C2520] transition-colors disabled:opacity-50"
      >
        {pending ? "Submitting…" : "Submit check-in"}
      </button>
    </form>
  );
}
