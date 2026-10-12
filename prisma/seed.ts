import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("Seeding database…");

  // Create founder
  const founderPassword = await bcrypt.hash("pivot2024", 12);
  const founder = await prisma.user.upsert({
    where: { email: "hello@pivotco.com" },
    update: {},
    create: {
      email: "hello@pivotco.com",
      name: "Pivot Co.",
      password: founderPassword,
      role: "founder",
    },
  });
  console.log("Created founder:", founder.email);

  // Create demo client 1
  const clientPassword = await bcrypt.hash("client123", 12);
  const client1User = await prisma.user.upsert({
    where: { email: "sarah@example.com" },
    update: {},
    create: {
      email: "sarah@example.com",
      name: "Sarah Thompson",
      password: clientPassword,
      role: "client",
    },
  });

  const client1 = await prisma.clientProfile.upsert({
    where: { userId: client1User.id },
    update: {},
    create: {
      userId: client1User.id,
      founderName: "Sarah Thompson",
      businessName: "The Edit Studio",
      email: "sarah@example.com",
      phone: "+44 7700 900123",
      website: "theeditstudio.co.uk",
      tier: "CORE",
      currentMonth: 2,
      currentWeek: 3,
      currentPhase: "REFINE",
      monthlyInvestment: 1500,
      businessContext:
        "Sarah runs a premium brand photography and creative direction studio for founder-led businesses. She's been operating for 3 years, has strong referrals but struggles with pricing confidence and scaling beyond herself. Main friction: undercharging, no clear process for onboarding, relies heavily on Instagram DMs for client communication.",
      personalityNotes:
        "Highly creative, slightly perfectionist. Needs reassurance when making business decisions. Responds well to direct, practical advice with context. Gets overwhelmed by too many options.",
      communicationStyle:
        "Prefers voice notes and detailed written feedback. Dislikes being rushed. Processes information slowly but thoroughly.",
      weeklyFocus:
        "This week: finalise your client onboarding sequence and send it to your last 3 new clients for feedback. Focus on reducing friction in the first 48 hours.",
    },
  });

  // Add goals for client 1
  const goalsExist = await prisma.goal.count({ where: { clientProfileId: client1.id } });
  if (goalsExist === 0) {
    await prisma.goal.createMany({
      data: [
        {
          clientProfileId: client1.id,
          title: "Raise average project value to $3,500",
          baselineNote: "Average project value currently $1,800",
          targetNote: "$3,500+ per project by end of month 3",
          progressPercent: 35,
        },
        {
          clientProfileId: client1.id,
          title: "Build a clear client onboarding process",
          baselineNote: "No formal onboarding — relies on WhatsApp",
          targetNote: "Documented 5-step onboarding delivered via portal",
          progressPercent: 70,
        },
        {
          clientProfileId: client1.id,
          title: "Reduce content creation time by 40%",
          baselineNote: "Spending ~12 hours/week creating content",
          targetNote: "Under 7 hours/week with batching system",
          progressPercent: 20,
        },
      ],
    });
  }

  // Add tasks
  const tasksExist = await prisma.task.count({ where: { clientProfileId: client1.id } });
  if (tasksExist === 0) {
    await prisma.task.createMany({
      data: [
        {
          clientProfileId: client1.id,
          title: "Write your premium tier service description",
          category: "Brand",
          priority: "high",
          assignedTo: "client",
        },
        {
          clientProfileId: client1.id,
          title: "Map your 5-step client onboarding process",
          category: "Client Experience",
          priority: "high",
          assignedTo: "client",
        },
        {
          clientProfileId: client1.id,
          title: "Create a content batching schedule for next month",
          category: "Content",
          priority: "medium",
          assignedTo: "client",
        },
        {
          clientProfileId: client1.id,
          title: "Send retention check-in to 3 past clients",
          category: "Retention",
          priority: "medium",
          assignedTo: "client",
        },
        {
          clientProfileId: client1.id,
          title: "Review and update pricing page",
          category: "Operations",
          priority: "low",
          assignedTo: "client",
        },
      ],
    });
  }

  // Add a call
  const callsExist = await prisma.call.count({ where: { clientProfileId: client1.id } });
  if (callsExist === 0) {
    const nextTuesday = new Date();
    const day = nextTuesday.getDay();
    const daysUntilTuesday = (2 - day + 7) % 7 || 7;
    nextTuesday.setDate(nextTuesday.getDate() + daysUntilTuesday);
    nextTuesday.setHours(10, 0, 0, 0);

    await prisma.call.create({
      data: {
        clientProfileId: client1.id,
        title: "Month 2, Week 3 — Strategy Review",
        scheduledAt: nextTuesday,
      },
    });

    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    await prisma.call.create({
      data: {
        clientProfileId: client1.id,
        title: "Month 2, Week 2 — Client Experience Deep Dive",
        scheduledAt: lastWeek,
        completedAt: lastWeek,
        summaryStatus: "approved",
        summaryContent:
          "Excellent session this week. Sarah arrived with clear notes and we were able to move quickly through the client experience framework.\n\nWe spent the majority of the call working through her current onboarding pain points and identifying where she's losing potential clients to friction. Key insight: her portfolio page is doing the heavy lifting but the enquiry process drops off sharply — clients are losing confidence between first contact and booking.\n\nSarah has committed to mapping her ideal 5-step journey before next Tuesday. Energy was high and she left the call with clarity.",
        keyDecisions: JSON.stringify([
          "Premium tier minimum project value set at $2,800",
          "Onboarding will use a portal rather than email chain",
          "Content batching will move to Fridays",
        ]),
        nextSteps: JSON.stringify([
          "Draft 5-step onboarding map by Thursday",
          "Update services page with new pricing tier",
          "Test the enquiry process as a client would experience it",
        ]),
      },
    });
  }

  // Add a check-in
  const checkInsExist = await prisma.checkIn.count({ where: { clientProfileId: client1.id } });
  if (checkInsExist === 0) {
    await prisma.checkIn.create({
      data: {
        clientProfileId: client1.id,
        monthNumber: 2,
        weekNumber: 2,
        completed:
          "Mapped out my current client journey end-to-end. Found three places where the process feels clunky for clients. Also finally sent invoices I'd been putting off.",
        notCompleted:
          "Didn't get to the services page update. I kept second-guessing the wording and ran out of time.",
        stuck:
          "Still not confident on the new pricing. I know intellectually it's right but I hesitate when I have to say the number out loud.",
        shifted:
          "I feel like I understand my own process better now. Mapping it out made it feel less overwhelming.",
        energyScore: 7,
        callNotes:
          "Can we spend some time on the pricing conversation? I want to practise saying the number out loud.",
      },
    });
  }

  // Add a deliverable
  const deliverablesExist = await prisma.deliverable.count({ where: { clientProfileId: client1.id } });
  if (deliverablesExist === 0) {
    await prisma.deliverable.createMany({
      data: [
        {
          clientProfileId: client1.id,
          title: "Pivot Diagnostic Report",
          description:
            "A comprehensive analysis of your business foundations, identifying the key friction points and priority areas for refinement.",
          phase: "DIAGNOSE",
          monthNumber: 1,
          deliveredAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
        {
          clientProfileId: client1.id,
          title: "Friction Map",
          description:
            "A visual map of every point of friction in your business — operational, client-facing, and internal.",
          phase: "DIAGNOSE",
          monthNumber: 1,
          deliveredAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
        },
        {
          clientProfileId: client1.id,
          title: "Priority Sequence",
          description:
            "Your ranked action sequence — what to tackle first, second, and third for maximum impact.",
          phase: "DIAGNOSE",
          monthNumber: 1,
          deliveredAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
        },
        {
          clientProfileId: client1.id,
          title: "Content Direction Framework",
          description:
            "A strategic framework for your content — positioning, pillars, voice, and platform approach.",
          phase: "DIAGNOSE",
          monthNumber: 1,
          deliveredAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        },
      ],
    });
  }

  // Add messages
  const messagesExist = await prisma.message.count({ where: { clientProfileId: client1.id } });
  if (messagesExist === 0) {
    await prisma.message.createMany({
      data: [
        {
          clientProfileId: client1.id,
          senderId: client1User.id,
          senderRole: "client",
          content:
            "I've been thinking about what we discussed and I think I finally understand why I've been underpricing. It's not really about the money — it's that I don't fully trust that my work is worth it yet. Does that make sense?",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          clientProfileId: client1.id,
          senderId: founder.id,
          senderRole: "founder",
          content:
            "That makes complete sense, and it's one of the most honest things you can recognise in yourself as a founder. Worth and price are different things — your work has a market value that exists independently of how you feel about yourself on any given day.\n\nThe price is a signal. When you undercharge, you're actually making the client's decision harder, not easier. Premium clients buy confidence as much as they buy the work.\n\nLet's talk more on Tuesday. In the meantime — read your own case studies as if someone else wrote them.",
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          read: true,
        },
        {
          clientProfileId: client1.id,
          senderId: client1User.id,
          senderRole: "client",
          content: "That last line. I screenshot it. Thank you.",
          createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
        },
      ],
    });
  }

  // Add a pending agent draft
  const draftsExist = await prisma.agentDraft.count({ where: { clientProfileId: client1.id } });
  if (draftsExist === 0) {
    await prisma.agentDraft.create({
      data: {
        clientProfileId: client1.id,
        type: "pre-call-brief",
        title: "Pre-call Brief — Sarah, M2W3",
        status: "pending",
        context:
          "Generated from: Week 2 check-in + client profile + previous call summary",
        content: `PRE-CALL BRIEF — SARAH THOMPSON
Month 2, Week 3 | Tuesday

CONTEXT
Sarah is in her third week of the Refine month. Energy last week was 7/10. She's making real progress on understanding her client journey but hitting a block on pricing confidence — a pattern we've seen in previous sessions.

WHAT HAPPENED LAST WEEK
• Mapped her end-to-end client journey (completed)
• Identified three friction points in the enquiry process
• Did not complete the services page update — got stuck on wording

WHAT SHE SAID IN HER CHECK-IN
"I hesitate when I have to say the number out loud."
This is worth time on the call. Not a logical problem — a confidence one.

She also mentioned the invoice backlog is cleared. Small but meaningful.

STUCK POINT
The pricing confidence issue is recurring. It's not information she needs — she knows the numbers are right. She needs language and a felt sense of permission. Consider a roleplay exercise on the call.

RECOMMENDED FOCUS FOR THIS SESSION
1. Pricing language rehearsal (high priority — her explicit request)
2. Review her onboarding map draft if ready
3. Quick win: identify one piece of content from last month to repurpose

WATCH FOR
Any signs of overwhelm — she can spiral when too many tasks are visible at once. Narrow down by end of call to maximum 3 actions.

MOOD INDICATOR
Check-in suggests forward momentum with one persistent block. Call should feel affirming not pressuring.`,
      },
    });
  }

  // Add social plan
  const plansExist = await prisma.socialPlan.count({ where: { clientProfileId: client1.id } });
  if (plansExist === 0) {
    const now = new Date();
    await prisma.socialPlan.create({
      data: {
        clientProfileId: client1.id,
        monthNumber: now.getMonth() + 1,
        year: now.getFullYear(),
        status: "published",
        brandVoiceNotes:
          "The Edit Studio speaks with quiet authority. Confident without being loud. Visual and precise. Never trends for trend's sake — always positioning, always purpose.",
        contentPillars:
          `PILLAR 1: The Work (40%)\nBehind-the-scenes of shoot days, editing process, finished work. Show the care that goes into each frame.\n\nPILLAR 2: The Founder Lens (30%)\nSarah's perspective on visual identity, brand photography, and what makes a brand look premium. Educational and positioning.\n\nPILLAR 3: The Client World (20%)\nClient transformations, results, testimonials. Social proof told with elegance — never pushy.\n\nPILLAR 4: The Edit (10%)\nCurated inspiration. What's influencing Sarah's creative direction this month.`,
        storyOutlines:
          `WEEK 1\nMon: Morning light from current shoot setup\nTue: Poll — "What's missing from most brand photos?"\nWed: Quote from client feedback (anonymised)\nThu: One thing you'd never do on a shoot and why\nFri: Friday finish — what the work looked like this week\n\nWEEK 2\nMon: Process frame — the edit before/after\nTue: Behind the brief — what a client brief looks like before a shoot\nWed: Something you noticed this week about how founders show up on camera\nThu: Myth-busting: "You don't need a big budget to look premium"\nFri: Preview of upcoming work`,
        dailyPostingGuide:
          `POSTING RHYTHM\n• Grid posts: 3x per week (Mon / Wed / Fri)\n• Stories: Daily, 3-5 frames\n• Reels: 1x per week (Thursday preferred)\n\nTONE GUIDE\nCaption energy: Confident, considered, occasionally warm. Short sentences. No excessive hashtags — max 5, always in first comment.\n\nAVOID THIS MONTH\n× Don't use the word "stunning" or "gorgeous"\n× Avoid before/after unless it tells a proper story\n× No urgency language ("last spots", "limited availability")`,
        socialAudit:
          `LAST MONTH REVIEW\n\nTop performing post: The overhead flat lay shot with the caption about "intentional negative space" — 847 impressions, 12 saves, 4 enquiry DMs.\n\nWhat worked: Process content. People want to see the thinking behind the work.\n\nWhat didn't land: The motivational quote reposts. Off-brand and low engagement.\n\nFollower growth: +47. Solid but growth is not the primary objective this month — quality of engagement is.\n\nEnquiry quality: 2 of 3 enquiries from the month converted. Both found her via Instagram. This validates the content strategy.`,
      },
    });
  }

  console.log("✓ Seed complete");
  console.log("  Founder login: hello@pivotco.com / pivot2024");
  console.log("  Client login:  sarah@example.com / client123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
