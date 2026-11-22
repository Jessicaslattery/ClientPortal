"use client";

import { useActionState } from "react";
import { submitSocialMediaIntake } from "@/app/(client)/onboarding/actions";

type Existing = {
  primaryPlatform: string;
  currentFollowers: string;
  contentGoal: string;
  targetAudience: string;
  topPerformingContent: string;
  contentChallenges: string;
  brandVoice: string;
  competitorAccounts: string;
  postingFrequency: string;
  contentCreationTime: string;
  submittedAt: Date | null;
} | null;

const initial: { error?: string; success?: string } = {};

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  rows = 2,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-xs tracking-[0.1em] text-[#7a7268] mb-1.5">{label}</label>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className="w-full rounded-2xl bg-[#FFFFFF] border border-[#EDEBE6] text-[#1A1917] px-4 py-3 text-sm placeholder:text-[#b0a89e] focus:outline-none focus:border-[#C8B89A] transition-colors resize-none"
      />
    </div>
  );
}

export function SocialMediaIntakeForm({
  clientProfileId,
  existing,
}: {
  clientProfileId: string;
  existing: Existing;
}) {
  const [state, formAction, pending] = useActionState(submitSocialMediaIntake, initial);

  return (
    <div className="rounded-2xl border border-[#EDEBE6] bg-[#FFFFFF] p-6 space-y-5">
      <div className="flex items-start justify-between">
        <p className="text-[10px] tracking-[0.15em] uppercase text-[#7a7268]">Social media questionnaire</p>
        {existing?.submittedAt && (
          <span className="text-[10px] text-[#2D6A4F]">
            Submitted {new Date(existing.submittedAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        )}
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="clientProfileId" value={clientProfileId} />

        <Field
          label="What is your primary social media platform?"
          name="primaryPlatform"
          defaultValue={existing?.primaryPlatform}
          placeholder="e.g. Instagram, TikTok, LinkedIn…"
          rows={1}
        />
        <Field
          label="Current follower count (approximate)"
          name="currentFollowers"
          defaultValue={existing?.currentFollowers}
          placeholder="e.g. 2,400 on Instagram"
          rows={1}
        />
        <Field
          label="What is your main goal for social media?"
          name="contentGoal"
          defaultValue={existing?.contentGoal}
          placeholder="e.g. Build brand awareness, attract coaching clients, grow community…"
        />
        <Field
          label="Who is your target audience?"
          name="targetAudience"
          defaultValue={existing?.targetAudience}
          placeholder="e.g. Women aged 28–42 who want to lose weight after having children…"
        />
        <Field
          label="What content has performed best for you so far?"
          name="topPerformingContent"
          defaultValue={existing?.topPerformingContent}
          placeholder="e.g. Before and afters, behind the scenes, educational reels…"
        />
        <Field
          label="What are your biggest challenges with content?"
          name="contentChallenges"
          defaultValue={existing?.contentChallenges}
          placeholder="e.g. Consistency, knowing what to post, filming confidence…"
        />
        <Field
          label="How would you describe your brand voice?"
          name="brandVoice"
          defaultValue={existing?.brandVoice}
          placeholder="e.g. Warm, motivating and direct. I swear occasionally but keep it real…"
        />
        <Field
          label="Are there any accounts you admire or want to emulate?"
          name="competitorAccounts"
          defaultValue={existing?.competitorAccounts}
          placeholder="e.g. @username1, @username2: I love their mix of education and personality"
        />
        <Field
          label="How often do you currently post?"
          name="postingFrequency"
          defaultValue={existing?.postingFrequency}
          placeholder="e.g. 2–3 times per week on the grid, rarely stories"
          rows={1}
        />
        <Field
          label="How much time can you realistically spend on content each week?"
          name="contentCreationTime"
          defaultValue={existing?.contentCreationTime}
          placeholder="e.g. Around 3–4 hours, mostly on weekends"
          rows={1}
        />

        {state?.error && <p className="text-xs text-[#9B2335]">{state.error}</p>}
        {state?.success && <p className="text-xs text-[#2D6A4F]">{state.success}</p>}

        <button
          type="submit"
          disabled={pending}
          className="px-6 py-3 rounded-2xl bg-[#1A1917] text-[#FAFAF8] text-xs tracking-[0.15em] font-medium hover:bg-[#2C2520] transition-colors disabled:opacity-50"
        >
          {pending ? "Saving…" : existing?.submittedAt ? "Update questionnaire" : "Submit questionnaire"}
        </button>
      </form>
    </div>
  );
}
