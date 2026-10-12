"use client";

import { useActionState } from "react";
import { submitOnboardingAction } from "@/app/(client)/onboarding/actions";

type Intake = {
  businessDescription?: string | null;
  productsServices?: string | null;
  targetAudience?: string | null;
  pricePoints?: string | null;
  revenueModel?: string | null;
  currentRevenue?: string | null;
  revenueGoal?: string | null;
  biggestRevenueChallenge?: string | null;
  currentMarketingChannels?: string | null;
  contentFrequency?: string | null;
  bestPerformingContent?: string | null;
  contentChallenges?: string | null;
  brandVoice?: string | null;
  uniqueValueProp?: string | null;
  competitors?: string | null;
  founderStrengths?: string | null;
  founderWeaknesses?: string | null;
  workStyle?: string | null;
  biggestFear?: string | null;
  biggestMotivation?: string | null;
  supportNeeded?: string | null;
  programmeGoal1?: string | null;
  programmeGoal2?: string | null;
  programmeGoal3?: string | null;
  successLooksLike?: string | null;
};

const initial: { error?: string; success?: string } = {};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-[#E8E2D9] bg-[#FFFFFF] p-6 space-y-5">
      <p className="text-[10px] tracking-[0.15em] uppercase text-[#5C5550]">{title}</p>
      {children}
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  rows = 2,
  required = false,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
  rows?: number;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277]">
        {label}{required && <span className="text-[#9B2335] ml-1">*</span>}
      </label>
      {rows === 1 ? (
        <input
          name={name}
          defaultValue={defaultValue ?? ""}
          placeholder={placeholder}
          required={required}
          className="w-full bg-[#FFFFFF] border border-[#E8E2D9] rounded-2xl px-4 py-2.5 text-sm text-[#1A1714] placeholder:text-[#8C8277] focus:outline-none focus:border-[#C8B89A]/40"
        />
      ) : (
        <textarea
          name={name}
          defaultValue={defaultValue ?? ""}
          placeholder={placeholder}
          required={required}
          rows={rows}
          className="w-full bg-[#FFFFFF] border border-[#E8E2D9] rounded-2xl px-4 py-3 text-sm text-[#1A1714] placeholder:text-[#8C8277] focus:outline-none focus:border-[#C8B89A]/40 resize-y"
        />
      )}
    </div>
  );
}

export function OnboardingForm({ existing }: { existing: Intake | null }) {
  const [state, action, pending] = useActionState(submitOnboardingAction, initial);

  return (
    <form action={action} className="space-y-6">
      <Section title="Your Business">
        <Field
          label="Describe your business in 2–3 sentences"
          name="businessDescription"
          defaultValue={existing?.businessDescription}
          placeholder="What do you do, who for, and how?"
          rows={3}
          required
        />
        <Field
          label="Products and services"
          name="productsServices"
          defaultValue={existing?.productsServices}
          placeholder="List your main offerings and price points"
          rows={2}
        />
        <Field
          label="Who is your target audience?"
          name="targetAudience"
          defaultValue={existing?.targetAudience}
          placeholder="Be specific · demographics, psychographics, pain points"
          rows={2}
        />
        <Field
          label="Price points"
          name="pricePoints"
          defaultValue={existing?.pricePoints}
          placeholder="e.g. $500 workshop, $2,500/month retainer…"
          rows={1}
        />
        <Field
          label="Revenue model"
          name="revenueModel"
          defaultValue={existing?.revenueModel}
          placeholder="e.g. project-based, retainer, product sales, membership…"
          rows={1}
        />
      </Section>

      <Section title="Revenue & Goals">
        <Field
          label="Current monthly revenue (approx)"
          name="currentRevenue"
          defaultValue={existing?.currentRevenue}
          placeholder="e.g. $5,000/month"
          rows={1}
        />
        <Field
          label="Revenue goal by end of programme"
          name="revenueGoal"
          defaultValue={existing?.revenueGoal}
          placeholder="e.g. $20,000/month consistently"
          rows={1}
        />
        <Field
          label="What's your biggest revenue challenge right now?"
          name="biggestRevenueChallenge"
          defaultValue={existing?.biggestRevenueChallenge}
          placeholder="Be honest · what's the real sticking point?"
          rows={3}
        />
      </Section>

      <Section title="Marketing & Content">
        <Field
          label="Current marketing channels"
          name="currentMarketingChannels"
          defaultValue={existing?.currentMarketingChannels}
          placeholder="e.g. Instagram, email, referrals, podcast…"
          rows={1}
        />
        <Field
          label="How often do you post content?"
          name="contentFrequency"
          defaultValue={existing?.contentFrequency}
          placeholder="e.g. 3x/week on Instagram, weekly newsletter"
          rows={1}
        />
        <Field
          label="What content performs best for you?"
          name="bestPerformingContent"
          defaultValue={existing?.bestPerformingContent}
          placeholder="What gets the most engagement, enquiries, or sales?"
          rows={2}
        />
        <Field
          label="What's your biggest content challenge?"
          name="contentChallenges"
          defaultValue={existing?.contentChallenges}
          placeholder="Consistency? Ideas? Conversion? Time?"
          rows={2}
        />
      </Section>

      <Section title="Brand & Positioning">
        <Field
          label="How would you describe your brand voice?"
          name="brandVoice"
          defaultValue={existing?.brandVoice}
          placeholder="e.g. warm and direct, educational but fun, premium and calm…"
          rows={2}
        />
        <Field
          label="What makes you different from competitors?"
          name="uniqueValueProp"
          defaultValue={existing?.uniqueValueProp}
          placeholder="Your unique value proposition"
          rows={2}
        />
        <Field
          label="Who are your main competitors?"
          name="competitors"
          defaultValue={existing?.competitors}
          placeholder="Businesses or people you consider alternatives to you"
          rows={1}
        />
      </Section>

      <Section title="About You">
        <Field
          label="Your biggest strengths as a founder"
          name="founderStrengths"
          defaultValue={existing?.founderStrengths}
          placeholder="What do you do better than most?"
          rows={2}
        />
        <Field
          label="Areas you find challenging"
          name="founderWeaknesses"
          defaultValue={existing?.founderWeaknesses}
          placeholder="What drains you or holds you back?"
          rows={2}
        />
        <Field
          label="How do you work best?"
          name="workStyle"
          defaultValue={existing?.workStyle}
          placeholder="e.g. deep work mornings, need accountability, thrive with structure…"
          rows={2}
        />
        <Field
          label="What's your biggest fear in this programme?"
          name="biggestFear"
          defaultValue={existing?.biggestFear}
          placeholder="Be honest · what would make this feel like a failure?"
          rows={2}
        />
        <Field
          label="What motivates you most?"
          name="biggestMotivation"
          defaultValue={existing?.biggestMotivation}
          placeholder="What gets you out of bed and doing the work?"
          rows={2}
        />
        <Field
          label="What kind of support do you need most?"
          name="supportNeeded"
          defaultValue={existing?.supportNeeded}
          placeholder="e.g. accountability, strategy, emotional support, accountability, clarity…"
          rows={2}
        />
      </Section>

      <Section title="Programme Goals">
        <Field
          label="Goal 1 · most important outcome"
          name="programmeGoal1"
          defaultValue={existing?.programmeGoal1}
          placeholder="The single most important thing you want to achieve"
          rows={2}
          required
        />
        <Field
          label="Goal 2"
          name="programmeGoal2"
          defaultValue={existing?.programmeGoal2}
          placeholder="Second priority outcome"
          rows={2}
        />
        <Field
          label="Goal 3"
          name="programmeGoal3"
          defaultValue={existing?.programmeGoal3}
          placeholder="Third priority outcome"
          rows={2}
        />
        <Field
          label="What does success look like at the end?"
          name="successLooksLike"
          defaultValue={existing?.successLooksLike}
          placeholder="Paint the picture · what's different in your life and business?"
          rows={3}
          required
        />
      </Section>

      {state?.error && (
        <p className="text-sm text-[#9B2335]">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-3.5 text-sm tracking-[0.1em] uppercase text-[#FAFAF8] bg-[#1A1714] rounded-2xl hover:bg-[#2C2520] transition-colors disabled:opacity-40 font-medium"
      >
        {pending ? "Submitting…" : "Submit Intake"}
      </button>

      <p className="text-xs text-[#8C8277] text-center">
        Your answers are private and shared only with Jess. You can update them at any time.
      </p>
    </form>
  );
}
