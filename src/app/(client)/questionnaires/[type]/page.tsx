import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { submitQuestionnaireAction } from "../actions";

type Question = {
  key: string;
  label: string;
  hint?: string;
  type: "textarea" | "text" | "select";
  options?: string[];
  rows?: number;
};

const QUESTIONNAIRES: Record<string, { title: string; intro: string; questions: Question[] }> = {
  business_onboarding: {
    title: "Business Onboarding",
    intro: "This gives me a clear picture of where you are now so we can build from there. Take your time: the more honest you are, the better I can help.",
    questions: [
      { key: "whatTheyDo", label: "What does your business do?", hint: "In plain language: who you help and how.", type: "textarea", rows: 3 },
      { key: "whoTheyServe", label: "Who is your ideal client?", hint: "Be specific: industry, stage, situation.", type: "textarea", rows: 3 },
      { key: "howLongTrading", label: "How long have you been in business?", type: "text" },
      { key: "currentRevenue", label: "What's your current monthly revenue?", hint: "Approximate is fine.", type: "text" },
      { key: "revenueGoal", label: "What's your revenue goal for the next 12 months?", type: "text" },
      { key: "biggestChallenge", label: "What's your biggest challenge right now?", hint: "What keeps you up at night?", type: "textarea", rows: 4 },
      { key: "whatIsWorking", label: "What's currently working well in your business?", type: "textarea", rows: 3 },
      { key: "whatIsNot", label: "What isn't working, or what feels stuck?", type: "textarea", rows: 3 },
      { key: "teamSituation", label: "What does your team look like?", hint: "Solo, contractors, employees?", type: "text" },
      { key: "workingHoursPerWeek", label: "How many hours per week are you working in the business?", type: "text" },
      { key: "biggestPersonalBlock", label: "What's the biggest thing holding you back personally?", hint: "Mindset, capacity, skills, something else?", type: "textarea", rows: 3 },
      { key: "successIn6Months", label: "What would success look like in 6 months?", hint: "Be specific: what would be different?", type: "textarea", rows: 4 },
    ],
  },
  goal_setting: {
    title: "Goal Setting",
    intro: "These goals become our north star for everything we work on together. Think big, but also think real.",
    questions: [
      { key: "primaryGoal", label: "What's your single most important goal for our work together?", type: "textarea", rows: 3 },
      { key: "revenueTarget", label: "What's your revenue target for the next 90 days?", type: "text" },
      { key: "clientTarget", label: "How many clients do you want to have in 90 days?", type: "text" },
      { key: "offeringChanges", label: "Are there any changes to your offering or pricing you want to make?", type: "textarea", rows: 3 },
      { key: "personalGoal", label: "Is there a personal or lifestyle goal tied to this?", hint: "More time off, paying yourself more, feeling less stressed?", type: "textarea", rows: 3 },
      { key: "successMetric", label: "How will we know in 90 days that this has worked?", hint: "What numbers or outcomes would tell you we nailed it?", type: "textarea", rows: 3 },
      { key: "potentialObstacles", label: "What obstacles do you anticipate?", hint: "What might get in the way?", type: "textarea", rows: 3 },
    ],
  },
  social_onboarding: {
    title: "Social Media Onboarding",
    intro: "Let's understand where your social media is right now so we can build on what's already there.",
    questions: [
      { key: "primaryPlatform", label: "What's your primary social media platform?", type: "select", options: ["Instagram", "TikTok", "LinkedIn", "Facebook", "YouTube", "Pinterest", "Other"] },
      { key: "otherPlatforms", label: "Any other platforms you're active on?", type: "text" },
      { key: "currentFollowers", label: "Current follower count on your primary platform?", type: "text" },
      { key: "postingFrequency", label: "How often are you currently posting?", type: "text" },
      { key: "topPerformingContent", label: "What type of content performs best for you?", hint: "What gets the most engagement, saves, or DMs?", type: "textarea", rows: 3 },
      { key: "contentChallenges", label: "What's the biggest challenge with your content right now?", type: "textarea", rows: 3 },
      { key: "brandVoice", label: "How would you describe your brand voice?", hint: "Professional? Warm? Witty? A mix?", type: "textarea", rows: 2 },
      { key: "competitorAccounts", label: "Are there any accounts (competitors or inspiration) you admire?", hint: "Instagram handles or names.", type: "textarea", rows: 2 },
      { key: "contentCreationTime", label: "How much time per week can you realistically dedicate to content?", type: "text" },
    ],
  },
  social_goal_setting: {
    title: "Social Media Goal Setting",
    intro: "What do you want social media to actually do for your business?",
    questions: [
      { key: "primarySocialGoal", label: "What's the main thing you want social media to achieve for your business?", type: "select", options: ["Attract leads/clients", "Build brand awareness", "Establish authority", "Grow community", "Drive website traffic", "Other"] },
      { key: "followerGoal", label: "What's your follower growth goal for the next 90 days?", hint: "Be realistic: quality over quantity.", type: "text" },
      { key: "leadsFromSocial", label: "How many leads per month do you want to generate from social?", type: "text" },
      { key: "targetAudience", label: "Who exactly are you trying to reach on social?", hint: "Get specific: industry, role, pain point, life stage.", type: "textarea", rows: 3 },
      { key: "contentPillars", label: "What 3–4 topics do you want to be known for?", hint: "These become your content pillars.", type: "textarea", rows: 3 },
      { key: "socialTone", label: "What tone do you want your social media content to feel?", hint: "Educational? Inspirational? Personal? Direct?", type: "textarea", rows: 2 },
      { key: "platformFocus", label: "Should we go deep on one platform or build across a few?", hint: "What feels right given your capacity?", type: "textarea", rows: 2 },
    ],
  },
  client_voice: {
    title: "Client Voice",
    intro: "Your best clients can describe your value better than any marketer. This helps us write copy and content in a way that speaks directly to the people you want to attract.",
    questions: [
      { key: "clientWins", label: "What results have your clients achieved working with you?", hint: "Be specific: revenue, time saved, confidence gained, problems solved.", type: "textarea", rows: 4 },
      { key: "clientFeedback", label: "What do clients say about working with you?", hint: "Direct quotes if you have them: from DMs, reviews, testimonials.", type: "textarea", rows: 4 },
      { key: "whyTheyHired", label: "Why did your best clients choose you over others?", hint: "What was the deciding factor?", type: "textarea", rows: 3 },
      { key: "beforeState", label: "What were your clients struggling with before they found you?", type: "textarea", rows: 3 },
      { key: "afterState", label: "What does life/business look like for them after working with you?", type: "textarea", rows: 3 },
      { key: "objections", label: "What hesitations did clients have before signing up?", hint: "Price, time, trust, something else?", type: "textarea", rows: 3 },
      { key: "personalStory", label: "What's your own story: why do you do this work?", hint: "The personal reason behind the business.", type: "textarea", rows: 4 },
    ],
  },
  monthly_momentum: {
    title: "Monthly Momentum Check-in",
    intro: "A quick reflection to close out the month and set up the next one well.",
    questions: [
      { key: "biggestWin", label: "What was your biggest win this month?", type: "textarea", rows: 2 },
      { key: "biggestChallenge", label: "What was your biggest challenge this month?", type: "textarea", rows: 2 },
      { key: "revenueThisMonth", label: "What was your revenue this month?", type: "text" },
      { key: "newClients", label: "How many new clients did you sign?", type: "text" },
      { key: "energyLevel", label: "How's your energy and wellbeing this month?", type: "select", options: ["Really struggling", "Getting by", "Okay", "Good", "Excellent"] },
      { key: "focusNextMonth", label: "What's your single biggest focus for next month?", type: "textarea", rows: 2 },
      { key: "supportNeeded", label: "What do you need most from me this month?", type: "textarea", rows: 2 },
    ],
  },
};

export default async function QuestionnaireFormPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const session = await requireAuth("client");
  if (!session.clientProfileId) redirect("/login");
  const { type } = await params;

  const questionnaire = QUESTIONNAIRES[type];
  if (!questionnaire) notFound();

  const previous = await prisma.questionnaireResponse.findFirst({
    where: { clientProfileId: session.clientProfileId, type },
    orderBy: { submittedAt: "desc" },
  });

  const previousAnswers = previous ? (JSON.parse(previous.answersJson) as Record<string, string>) : {};

  async function handleSubmit(formData: FormData) {
    "use server";
    await submitQuestionnaireAction(type, formData);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <a href="/questionnaires" className="text-xs text-[#b0a89e] hover:text-[#7a7268] transition-colors">
          ← Back to questionnaires
        </a>
        <h1 className="mt-3 text-4xl font-[200] text-[#1A1917]">{questionnaire.title}</h1>
        <p className="mt-2 text-sm text-[#7a7268] leading-6">{questionnaire.intro}</p>
      </div>

      {previous && (
        <div className="rounded-xl border border-[#C8B89A]/30 bg-[#FDFCF9] px-4 py-3">
          <p className="text-xs text-[#7a7268]">
            You last completed this on{" "}
            <span className="text-[#1A1917]">
              {new Date(previous.submittedAt).toLocaleDateString("en-AU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            . Your previous answers are pre-filled below: update anything that's changed.
          </p>
        </div>
      )}

      <form action={handleSubmit} className="space-y-5">
        {questionnaire.questions.map((q, i) => (
          <div key={q.key} className="rounded-2xl border border-[#EDEBE6] p-5">
            <label className="block text-sm font-[400] text-[#1A1917] mb-1">
              <span className="text-[10px] tracking-[0.1em] text-[#b0a89e] mr-2">{i + 1 < 10 ? `0${i + 1}` : i + 1}</span>
              {q.label}
            </label>
            {q.hint && <p className="text-xs text-[#b0a89e] mb-2.5">{q.hint}</p>}

            {q.type === "textarea" && (
              <textarea
                name={q.key}
                rows={q.rows ?? 3}
                defaultValue={previousAnswers[q.key] ?? ""}
                className="w-full rounded-xl border border-[#EDEBE6] text-[#1A1917] px-4 py-3 text-sm placeholder:text-[#b0a89e] focus:outline-none focus:border-[#C8B89A] transition-colors resize-none"
                placeholder="Your answer…"
              />
            )}
            {q.type === "text" && (
              <input
                name={q.key}
                type="text"
                defaultValue={previousAnswers[q.key] ?? ""}
                className="w-full rounded-xl border border-[#EDEBE6] text-[#1A1917] px-4 py-3 text-sm placeholder:text-[#b0a89e] focus:outline-none focus:border-[#C8B89A] transition-colors"
                placeholder="Your answer…"
              />
            )}
            {q.type === "select" && q.options && (
              <select
                name={q.key}
                defaultValue={previousAnswers[q.key] ?? ""}
                className="w-full rounded-xl border border-[#EDEBE6] text-[#1A1917] px-4 py-3 text-sm focus:outline-none focus:border-[#C8B89A] transition-colors bg-white"
              >
                <option value="">Select…</option>
                {q.options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}
          </div>
        ))}

        <div className="flex items-center justify-between pt-2">
          <a href="/questionnaires" className="text-sm text-[#7a7268] hover:text-[#1A1917] transition-colors">
            Cancel
          </a>
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-[#1A1917] text-white text-xs tracking-[0.1em] hover:bg-[#2C2520] transition-colors"
          >
            Submit answers →
          </button>
        </div>
      </form>
    </div>
  );
}
