import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";

const PROFILE = {
  business: {
    name: "Bloom Wellness Co.",
    founder: "Sophie Clarke",
    whatTheyDo: "I run a holistic wellness studio offering 1:1 coaching, group programs, and retreats for women who are burnt out and want to feel like themselves again, without restrictive diets or punishing exercise.",
    whoTheyServe: "Women 28–45, usually in corporate or running their own small business. They're high-achievers who've put everyone else first and are finally ready to invest in themselves. They've tried everything but haven't found something that feels sustainable.",
    howLongTrading: "3 years",
    currentRevenue: "$8–10k/month",
  },
  current: {
    biggestChallenge: "I'm inconsistent with content. I'll go hard for two weeks then fall off for a month. My audience doesn't know what to expect from me and I don't either.",
    whatIsWorking: "My stories get great replies, and people DM after personal ones. My reels about burnout and nervous system stuff perform well. Word of mouth is still my best lead source.",
    whatIsNot: "Posting just to post. Generic 'wellness tip' carousels that get no engagement. Trying to be on every platform.",
    whatTheyTried: "A content VA who didn't get my voice at all. A content calendar I made myself and abandoned in week 2. ChatGPT for captions, always sounds wrong.",
  },
  goals: {
    goalOne: "Post consistently: 4x/week minimum, for a full 90 days without burning out",
    goalTwo: "Grow from 3,400 to 5,000 followers by end of Q1",
    goalThree: "Have 3 clients DM me directly from content (not referrals) in the next 60 days",
    successIn6Months: "My content is working so well that I'm turning down enquiries. I have a waitlist. Creating feels like part of my life, not a task on my list.",
    revenueGoal: "$15k/month",
  },
  voice: {
    personalStory: "I burnt out completely at 32. I was running my studio, raising two kids, and trying to be perfect at everything. I ended up in bed for three months. That's what turned me from a fitness coach into a wellness coach. I know what it feels like to have your body tell you no.",
    mostProudOf: "A client called me last month to say she ran her first 10k, and she cried because she finally enjoyed movement again, not because she felt like she had to. That's the whole thing.",
    industryBelief: "The wellness industry sells solutions that require you to white-knuckle it. Real change happens slowly and it has to feel good. Anyone telling you that you need to suffer to be well is lying.",
    clientsFeedback: "\"You're the first person who actually listened.\" \"I didn't feel judged.\" \"I didn't realise how much I needed someone in my corner.\"",
  },
  lifestyle: {
    dailyRoutine: "Early riser. I'm up at 5:30, meditation and coffee before the kids are up. I batch my admin and content on Tuesday mornings. I do not check my phone after 8pm.",
    workingHoursPerWeek: 32,
    energyLevel: 7,
    biggestPersonalBlock: "Perfectionism. I'll film something, hate it, and not post it. I know my content doesn't have to be perfect but I still sit on drafts.",
  },
  tools: {
    currentTools: "Canva, CapCut, Notion (poorly), Google Calendar, Stripe",
    teamSituation: "Just me. I had a VA for 6 months but it added more work than it saved because I still had to brief and edit everything.",
    contentPlatforms: "Instagram (main), Facebook (barely), email list of ~400 (monthly newsletter)",
  },
};

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border border-[#EDEBE6] rounded-2xl overflow-hidden">
      <div className="px-6 py-4 bg-[#F5F3EF] border-b border-[#EDEBE6]">
        <p className="text-[9px] tracking-[0.22em] uppercase text-[#8C735A] font-[400]">{label}</p>
      </div>
      <div className="px-6 py-5 space-y-5">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-[9px] tracking-[0.18em] uppercase text-[#b0a89e] mb-1.5">{label}</p>
      <p className="text-sm text-[#1A1917] font-[300] leading-relaxed">{value}</p>
    </div>
  );
}

function FieldRow({ items }: { items: { label: string; value: string | number }[] }) {
  return (
    <div className={`grid grid-cols-${items.length} gap-5`}>
      {items.map((item) => (
        <Field key={item.label} label={item.label} value={item.value} />
      ))}
    </div>
  );
}

export default async function ProfilePage() {
  const session = await requireAuth("client");
  if (!session.clientProfileId) redirect("/login");

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <p className="text-[9px] tracking-[0.22em] uppercase text-[#b0a89e]">Your brand</p>
        <h1 className="mt-1 text-3xl font-[200] text-[#1A1917] tracking-tight">Brand Profile</h1>
        <p className="mt-2 text-sm text-[#7a7268] font-[300] leading-relaxed max-w-xl">
          Everything your strategy is built on: your business, your audience, your story and your voice. This is the brain behind your content.
        </p>
      </div>

      {/* Business overview */}
      <Section label="Your business">
        <div className="grid grid-cols-2 gap-5">
          <Field label="Business name" value={PROFILE.business.name} />
          <Field label="Founder" value={PROFILE.business.founder} />
        </div>
        <Field label="What you do" value={PROFILE.business.whatTheyDo} />
        <Field label="Who you serve" value={PROFILE.business.whoTheyServe} />
        <div className="grid grid-cols-2 gap-5">
          <Field label="Time in business" value={PROFILE.business.howLongTrading} />
          <Field label="Current revenue" value={PROFILE.business.currentRevenue} />
        </div>
      </Section>

      {/* What's working */}
      <Section label="Current state">
        <Field label="Biggest challenge with content" value={PROFILE.current.biggestChallenge} />
        <Field label="What is working" value={PROFILE.current.whatIsWorking} />
        <Field label="What is not working" value={PROFILE.current.whatIsNot} />
        <Field label="What you've already tried" value={PROFILE.current.whatTheyTried} />
      </Section>

      {/* Goals */}
      <Section label="Goals">
        <Field label="Goal 1" value={PROFILE.goals.goalOne} />
        <Field label="Goal 2" value={PROFILE.goals.goalTwo} />
        <Field label="Goal 3" value={PROFILE.goals.goalThree} />
        <div className="grid grid-cols-2 gap-5">
          <Field label="Revenue goal" value={PROFILE.goals.revenueGoal} />
        </div>
        <div className="bg-[#F5F1EB] rounded-xl p-4">
          <p className="text-[9px] tracking-[0.18em] uppercase text-[#8C735A] mb-2">Success in 6 months looks like…</p>
          <p className="text-sm text-[#1A1917] font-[300] leading-relaxed italic">&ldquo;{PROFILE.goals.successIn6Months}&rdquo;</p>
        </div>
      </Section>

      {/* Your story / voice */}
      <Section label="Your story & voice">
        <Field label="Your story" value={PROFILE.voice.personalStory} />
        <Field label="Most proud of" value={PROFILE.voice.mostProudOf} />
        <Field label="What you believe that your industry won't say" value={PROFILE.voice.industryBelief} />
        <div>
          <p className="text-[9px] tracking-[0.18em] uppercase text-[#b0a89e] mb-2">What clients say about you</p>
          <div className="space-y-2">
            {PROFILE.voice.clientsFeedback.split('" "').map((quote, i) => (
              <p key={i} className="text-sm text-[#5a5450] font-[300] leading-relaxed italic border-l-2 border-[#EDEBE6] pl-3">
                {quote.startsWith("“") ? quote : `“${quote}`}{quote.endsWith("”") ? "" : "”"}
              </p>
            ))}
          </div>
        </div>
      </Section>

      {/* Lifestyle */}
      <Section label="Lifestyle & capacity">
        <Field label="Daily routine" value={PROFILE.lifestyle.dailyRoutine} />
        <Field label="Biggest personal block" value={PROFILE.lifestyle.biggestPersonalBlock} />
        <div className="grid grid-cols-2 gap-5">
          <div>
            <p className="text-[9px] tracking-[0.18em] uppercase text-[#b0a89e] mb-2">Working hours / week</p>
            <p className="text-2xl font-[200] text-[#1A1917]">{PROFILE.lifestyle.workingHoursPerWeek}<span className="text-sm text-[#b0a89e] ml-1">hrs</span></p>
          </div>
          <div>
            <p className="text-[9px] tracking-[0.18em] uppercase text-[#b0a89e] mb-2">Energy level (self-rated)</p>
            <div className="flex items-end gap-1 mt-1">
              {Array.from({ length: 10 }, (_, i) => (
                <div
                  key={i}
                  className="w-3 rounded-sm transition-all"
                  style={{
                    height: `${12 + i * 2}px`,
                    background: i < PROFILE.lifestyle.energyLevel ? "#8C735A" : "#EDEBE6",
                  }}
                />
              ))}
              <span className="text-xs text-[#b0a89e] ml-1 pb-0.5">{PROFILE.lifestyle.energyLevel}/10</span>
            </div>
          </div>
        </div>
      </Section>

      {/* Tools & team */}
      <Section label="Tools & team">
        <Field label="Tools you use" value={PROFILE.tools.currentTools} />
        <Field label="Team situation" value={PROFILE.tools.teamSituation} />
        <Field label="Platforms" value={PROFILE.tools.contentPlatforms} />
      </Section>

      <p className="text-xs text-[#b0a89e] text-center pb-4">
        Need to update something? Send a message to your strategist and we'll keep this current.
      </p>
    </div>
  );
}
