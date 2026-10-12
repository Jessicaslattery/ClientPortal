import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";

const SYSTEM_PROMPT = `You are the Pivot Co. Onboarding Agent writing messages on behalf of Jess, founder of Pivot Co.

Return VALID JSON ONLY: no preamble, no markdown backticks, just the raw JSON:

{"message": "string", "founderNote": "string"}

founderNote is only populated for step 3. Leave as empty string for steps 1, 2 and 4.

Step 1: Welcome message:
Address the client by first name. Reference their specific tier (Foundations, Core or Operator) and what it means for them. Set clear expectations: they will receive a business context form shortly, then Jess will be in touch to book their first call. Feel warm, excited and genuinely human: never automated or templated. End with one sentence about what Pivot Co. is going to do specifically for them based on their tier. Australian English.

Step 2: Intake form introduction:
Short warm note introducing the business context intake form. Let them know it takes 15 to 20 minutes. Explain that the more honest and specific they are the better their first session will be. Encourage them to take their time. Australian English.

Step 3: Intake received acknowledgement:
Warm acknowledgement that the form has been received. Tell them Jess will review everything and be in touch shortly to book their first call. They do not need to do anything else right now.
founderNote: based on the intake data provided, give Jess your observations about this client: their biggest challenge, their energy and mindset, any red flags or exciting opportunities, and your recommended focus areas for the first call. Be direct and specific. Australian English.

Step 4: First call confirmation:
Confirm the date and time of the first call. Explain briefly what to expect from the session. End with exactly this line: 'Before we speak, I would love you to think about what the single biggest unlock would be for your business in the next 90 days.' Australian English.`;

type OnboardingResult = {
  agentDraftId: string;
};

export async function runOnboardingAgent(
  clientId: string,
  step: 1 | 2 | 3 | 4,
  scheduledCallDateTime?: string
): Promise<OnboardingResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set.");
  }

  const profile = await prisma.clientProfile.findUniqueOrThrow({
    where: { id: clientId },
    select: {
      founderName: true,
      tier: true,
      currentPhase: true,
      businessContext_: step === 3,
    },
  });

  const firstName = profile.founderName.split(" ")[0];
  const tier = profile.tier;

  let context = "";
  if (step === 1 || step === 2) {
    context = `Name: ${firstName}\nTier: ${tier}`;
  } else if (step === 3) {
    const intake = profile.businessContext_;
    if (intake) {
      const lines: string[] = [
        `Name: ${firstName}`,
        `Tier: ${tier}`,
        `Business name: ${intake.businessName}`,
        `What they do: ${intake.whatTheyDo}`,
        `Who they serve: ${intake.whoTheyServe}`,
        `How long trading: ${intake.howLongTrading}`,
        `Current revenue: ${intake.currentRevenue}`,
        `Revenue goal: ${intake.revenueGoal}`,
        `Biggest challenge: ${intake.biggestChallenge}`,
        `What they've tried: ${intake.whatTheyTried}`,
        `What's working: ${intake.whatIsWorking}`,
        `What's not working: ${intake.whatIsNot}`,
        `Current tools: ${intake.currentTools}`,
        `Team situation: ${intake.teamSituation}`,
        `Content platforms: ${intake.contentPlatforms}`,
        `Working hours per week: ${intake.workingHoursPerWeek ?? "not provided"}`,
        `Energy level (1-10): ${intake.energyLevel ?? "not provided"}`,
        `Biggest personal block: ${intake.biggestPersonalBlock}`,
        `Goal 1: ${intake.goalOne}`,
        `Goal 2: ${intake.goalTwo}`,
        `Goal 3: ${intake.goalThree}`,
        `Success in 6 months: ${intake.successIn6Months}`,
        `Personal story: ${intake.personalStory}`,
        `Client feedback: ${intake.clientsFeedback}`,
        `Industry belief: ${intake.industryBelief}`,
        `Daily routine: ${intake.dailyRoutine}`,
        `Most proud of: ${intake.mostProudOf}`,
      ];
      context = lines.join("\n");
    } else {
      context = `Name: ${firstName}\nTier: ${tier}`;
    }
  } else if (step === 4) {
    context = `Name: ${firstName}\nTier: ${tier}${scheduledCallDateTime ? `\nFirst call: ${scheduledCallDateTime}` : ""}`;
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 600,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Generate step ${step} onboarding message for ${firstName}, ${tier} tier. Context:\n${context}`,
      },
    ],
  });

  const block = response.content[0];
  if (block.type !== "text") throw new Error("Unexpected response type from Claude");

  let parsed: { message: string; founderNote: string } = { message: "", founderNote: "" };
  try {
    parsed = JSON.parse(block.text) as typeof parsed;
  } catch {
    parsed = { message: block.text.trim(), founderNote: "" };
  }

  const stepLabels: Record<number, string> = {
    1: "Welcome",
    2: "Intake Form Introduction",
    3: "Intake Received",
    4: "First Call Confirmation",
  };

  const isAutoApproved = step === 1;

  const draft = await prisma.agentDraft.create({
    data: {
      clientProfileId: clientId,
      type: "onboarding-message",
      title: `Onboarding Step ${step}: ${stepLabels[step]}: ${profile.founderName}`,
      status: isAutoApproved ? "auto-approved" : "pending",
      content: JSON.stringify(parsed),
      context: `Step: ${step} | Tier: ${tier} | Generated: ${new Date().toISOString()}`,
    },
  });

  // Step 1 auto-sends immediately as a Message
  if (step === 1) {
    const founder = await prisma.user.findFirst({ where: { role: "founder" } });
    if (founder) {
      await prisma.message.create({
        data: {
          clientProfileId: clientId,
          senderId: founder.id,
          senderRole: "founder",
          content: parsed.message,
          read: false,
        },
      });
    }
  }

  return { agentDraftId: draft.id };
}
