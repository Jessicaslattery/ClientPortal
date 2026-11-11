/**
 * SMS demo seed — Sophie Brennan / Move Well Coaching
 * Run: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/sms-seed.ts
 */
import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ── User + ClientProfile ───────────────────────────────────────────────────
  const hash = await bcrypt.hash("Demo1234", 10);

  const user = await prisma.user.upsert({
    where: { email: "sophie@movewellcoaching.com.au" },
    update: {},
    create: {
      email: "sophie@movewellcoaching.com.au",
      name: "Sophie Brennan",
      password: hash,
      role: "client",
    },
  });

  const cp = await prisma.clientProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      businessName: "Move Well Coaching",
      founderName: "Sophie Brennan",
      email: "sophie@movewellcoaching.com.au",
      instagram: "@movewellcoaching",
      tier: "GROWTH",
      onboardingComplete: true,
    },
  });

  // ── SmsClientProfile ───────────────────────────────────────────────────────
  const smsProfile = await prisma.smsClientProfile.upsert({
    where: { clientProfileId: cp.id },
    update: {},
    create: {
      clientProfileId: cp.id,
      igHandle: "@movewellcoaching",
    },
  });

  // ── MonthPlan — November 2026 ──────────────────────────────────────────────
  const monthPlan = await prisma.monthPlan.upsert({
    where: { smsClientId_month: { smsClientId: smsProfile.id, month: "2026-11" } },
    update: {},
    create: {
      smsClientId: smsProfile.id,
      month: "2026-11",
      status: "published",
      publishedAt: new Date("2026-10-28"),
      dueDate: new Date("2026-10-25"),
    },
  });

  // ── Post Outlines (20) ────────────────────────────────────────────────────
  const posts = [
    { title: "5 signs your body needs a movement reset", format: "carousel", pillar: "training", publishDate: "2026-11-02", hook: "If you're waking up stiff every single morning, your body is trying to tell you something.", cta: "Save this for your morning routine", goal: "Educate + save", status: "posted", views: 4820, likes: 312, comments: 47, saves: 189, reach: 3940 },
    { title: "What I eat before a morning class", format: "reel", pillar: "nutrition", publishDate: "2026-11-03", hook: "POV: 5:45am and you're about to teach a 60-min pilates class — here's what I eat", cta: "Tell me your pre-workout go-to below", goal: "Relatability + engagement", status: "posted", views: 9100, likes: 701, comments: 83, saves: 94, reach: 7200 },
    { title: "Client transformation: Sarah's 12-week journey", format: "carousel", pillar: "results", publishDate: "2026-11-05", hook: "Sarah came to me in pain. 12 weeks later, she ran her first 5k.", cta: "Link in bio to book a free consult", goal: "Social proof + leads", status: "posted", views: 3400, likes: 198, comments: 29, saves: 56, reach: 2800 },
    { title: "Why rest days are part of the plan", format: "static", pillar: "training", publishDate: "2026-11-07", hook: "You don't get stronger in the gym. You get stronger when you recover.", cta: "Drop a 🙋 if you skip rest days", goal: "Education + engagement", status: "posted", views: 2100, likes: 143, saves: 71, reach: 1900 },
    { title: "The truth about 'toning'", format: "reel", pillar: "training", publishDate: "2026-11-10", hook: "There's no such thing as toning a muscle. Here's what's actually happening.", cta: "Share this with someone who needs to hear it", goal: "Education + shares", status: "posted", views: 14200, likes: 1120, comments: 198, saves: 310, reach: 11000 },
    { title: "My meal prep Sunday routine", format: "reel", pillar: "nutrition", publishDate: "2026-11-12", hook: "2 hours on Sunday = 5 easy dinners. Here's exactly what I make.", cta: "Save + try it this Sunday", goal: "Saves + follows", status: "posted", views: 7800, likes: 540, saves: 410, reach: 6100 },
    { title: "3 mobility moves for desk workers", format: "carousel", pillar: "training", publishDate: "2026-11-14", hook: "If you sit at a desk all day, your hips and shoulders are probably screaming.", cta: "Screenshot the last slide for quick reference", goal: "Saves + shares", status: "posted", views: 5500, likes: 390, saves: 290, reach: 4400 },
    { title: "How I built a 6-figure coaching business in 18 months", format: "carousel", pillar: "personal_brand", publishDate: "2026-11-17", hook: "I didn't have a huge following. I had a clear message and consistent action.", cta: "DM me 'COACHING' to learn how", goal: "Lead gen + authority", status: "posted", views: 6200, likes: 480, comments: 112, saves: 180, reach: 5100 },
    { title: "Protein: how much do you actually need?", format: "reel", pillar: "nutrition", publishDate: "2026-11-19", hook: "Everyone's talking about protein. But most people are under-eating it.", cta: "Save this and calculate your number", goal: "Education + saves", status: "to_film" },
    { title: "My morning movement ritual (10 mins)", format: "reel", pillar: "training", publishDate: "2026-11-21", hook: "10 minutes every morning changed how my entire day feels.", cta: "Try it tomorrow and tell me how you go", goal: "Engagement + saves", status: "to_film" },
    { title: "What nobody tells you about losing fat", format: "carousel", pillar: "nutrition", publishDate: "2026-11-24", hook: "You can't spot-reduce. But here's what actually works.", cta: "Share this with your gym partner", goal: "Shares + educate", status: "to_film" },
    { title: "A day in my life as a coach", format: "reel", pillar: "personal_brand", publishDate: "2026-11-25", hook: "5am alarm. Quiet house. This is why I love what I do.", cta: "What does your ideal workday look like?", goal: "Connection + brand", status: "to_film" },
    { title: "The 3 biggest nutrition myths I see coaches spread", format: "carousel", pillar: "nutrition", publishDate: "2026-11-27", hook: "I've been in this industry 8 years. These myths need to die.", cta: "Tag a coach who needs to see this", goal: "Authority + reach", status: "to_film" },
    { title: "How to stay consistent over the holidays", format: "carousel", pillar: "training", publishDate: "2026-11-28", hook: "The holidays are coming. Here's how to keep your momentum without being miserable.", cta: "Save this for December", goal: "Timely + saves", status: "to_film" },
    { title: "Client win: 10kg down, still going strong", format: "static", pillar: "results", publishDate: "2026-11-04", hook: "Sometimes the most powerful thing you can do is just show up.", cta: "DM me to start your journey", goal: "Social proof", status: "posted", views: 2900, likes: 220, comments: 34, reach: 2400 },
    { title: "What a 'healthy plate' actually looks like", format: "carousel", pillar: "nutrition", publishDate: "2026-11-06", hook: "Forget the food pyramid. Here's what I actually eat and recommend.", cta: "Screenshot the plate template", goal: "Education + saves", status: "posted", views: 3800, likes: 260, saves: 220, reach: 3100 },
    { title: "Should you train when you're sore?", format: "reel", pillar: "training", publishDate: "2026-11-11", hook: "DOMS got you walking like you've never used your legs before? Here's what to do.", cta: "Drop a 🔥 if this is you right now", goal: "Engagement + relatable", status: "posted", views: 8900, likes: 680, comments: 145, saves: 95, reach: 7000 },
    { title: "My top 3 supplements (and the ones I skip)", format: "reel", pillar: "nutrition", publishDate: "2026-11-13", hook: "The supplement industry wants you to spend thousands. Here's what's actually worth it.", cta: "Save this before your next shop", goal: "Trust + saves", status: "posted", views: 6700, likes: 490, saves: 340, reach: 5400 },
    { title: "Behind the scenes: filming content for a week", format: "reel", pillar: "personal_brand", publishDate: "2026-11-18", hook: "What it really takes to show up consistently on Instagram as a solo coach.", cta: "If this is relatable, share it!", goal: "Brand + shares", status: "posted", views: 5100, likes: 390, comments: 67, reach: 4200 },
    { title: "FREE workout: 20-min full body, no equipment", format: "carousel", pillar: "training", publishDate: "2026-11-20", hook: "Travelling? No gym? No problem. This workout goes everywhere with you.", cta: "Save and tag someone who needs this", goal: "Saves + follows", status: "to_film" },
  ];

  for (let i = 0; i < posts.length; i++) {
    const p = posts[i];
    await prisma.postOutline.create({
      data: {
        smsClientId: smsProfile.id,
        monthPlanId: monthPlan.id,
        title: p.title,
        format: p.format,
        pillar: p.pillar,
        publishDate: new Date(p.publishDate),
        hook: p.hook,
        cta: p.cta,
        goal: p.goal,
        status: p.status,
        position: i,
        views: p.views ?? null,
        likes: p.likes ?? null,
        comments: p.comments ?? null,
        saves: p.saves ?? null,
        reach: p.reach ?? null,
      },
    });
  }

  // ── Story Outlines (30 days of November) ─────────────────────────────────
  const storyData = [
    { day: 1, theme: "Weekend check-in", et: "poll", cta: "How was your week?", done: true },
    { day: 2, theme: "New post alert", et: "none", cta: "See latest carousel post", done: true },
    { day: 3, theme: "Morning routine snap", et: "question_box", cta: "Ask me anything about mornings", done: true },
    { day: 4, theme: "Client win share", et: "none", cta: "DM me to start your journey", done: true },
    { day: 5, theme: "Post promotion", et: "none", cta: "Swipe up for full carousel", done: true },
    { day: 6, theme: "Nutrition quick tip", et: "poll", cta: "Do you meal prep?", done: true },
    { day: 7, theme: "Rest day reminder", et: "slider", cta: "Rate your recovery this week", done: true },
    { day: 8, theme: "Weekend vibes", et: "none", cta: "What are you doing for movement this weekend?", done: true },
    { day: 9, theme: "Monday motivation", et: "poll", cta: "Morning or evening workouts?", done: true },
    { day: 10, theme: "Reel behind the scenes", et: "question_box", cta: "What do you want to know about training?", done: true },
    { day: 11, theme: "DOMS check", et: "poll", cta: "Are you sore today?", done: true },
    { day: 12, theme: "New post: meal prep", et: "none", cta: "See today's reel", done: true },
    { day: 13, theme: "Supplement myth bust", et: "quiz", cta: "Test your supplement knowledge", done: true },
    { day: 14, theme: "Free consult promo", et: "link_sticker", cta: "Book your free call", isLaunchDay: true, done: true },
    { day: 15, theme: "Mid-month check-in", et: "question_box", cta: "What's your biggest challenge right now?", done: false },
    { day: 16, theme: "Quote card share", et: "none", cta: "Share this if it resonates", done: false },
    { day: 17, theme: "New carousel: 6-figure business", et: "none", cta: "See today's post", done: false },
    { day: 18, theme: "BTS content filming", et: "none", cta: "Watch today's reel", done: false },
    { day: 19, theme: "Protein tip", et: "poll", cta: "Do you track protein?", done: false },
    { day: 20, theme: "Free workout promo", et: "none", cta: "Save today's carousel", done: false },
    { day: 21, theme: "Morning ritual share", et: "question_box", cta: "What's your morning ritual?", done: false },
    { day: 22, theme: "Weekend check-in", et: "slider", cta: "How consistent were you this week?", done: false },
    { day: 23, theme: "Client story", et: "none", cta: "DM to work with me", done: false },
    { day: 24, theme: "Fat loss myth bust", et: "quiz", cta: "Did you know this?", done: false },
    { day: 25, theme: "Day in the life", et: "question_box", cta: "What do you want to see more of?", done: false },
    { day: 26, theme: "Holiday consistency tips", et: "poll", cta: "Do you train over the holidays?", done: false },
    { day: 27, theme: "Myth bust promotion", et: "none", cta: "See today's carousel", done: false },
    { day: 28, theme: "Holiday prep share", et: "none", cta: "Save for December", done: false },
    { day: 29, theme: "Month wrap-up", et: "none", cta: "What was your November win?", done: false },
    { day: 30, theme: "December preview", et: "countdown", cta: "Big announcement coming soon", done: false },
  ];

  for (const s of storyData) {
    await prisma.storyOutline.create({
      data: {
        smsClientId: smsProfile.id,
        monthPlanId: monthPlan.id,
        date: new Date(`2026-11-${String(s.day).padStart(2, "0")}`),
        theme: s.theme,
        engagementTool: s.et,
        cta: s.cta,
        isLaunchDay: s.isLaunchDay ?? false,
        isPromoDay: false,
        doneByClient: s.done,
      },
    });
  }

  // ── Monthly Report ────────────────────────────────────────────────────────
  await prisma.monthlyReport.create({
    data: {
      smsClientId: smsProfile.id,
      monthPlanId: monthPlan.id,
      headlineNote: "Sophie's strongest month yet — the 'toning' reel broke 14k views and the personal brand content is converting to DMs.",
      worked: "Educational reels (especially myth-bust style) are reaching non-followers well. Meal prep content gets high saves. Personal brand carousels are driving DM conversations.",
      didntWork: "Static posts underperform compared to reels and carousels. Posting on Saturdays gets lower reach.",
      nextMonth: "More reel hooks in first 3 seconds. Add a lead magnet carousel. Test posting at 7am vs 6pm to find the sweet spot for Sophie's audience.",
      published: true,
    },
  });

  // ── Quarterly Audit — Q4 2026 ─────────────────────────────────────────────
  const audit = await prisma.quarterlyAudit.upsert({
    where: { smsClientId_quarter: { smsClientId: smsProfile.id, quarter: "2026-Q4" } },
    update: {},
    create: {
      smsClientId: smsProfile.id,
      quarter: "2026-Q4",
      nextAuditDate: new Date("2027-01-20"),
      reportText: "Overall Q4 performance is strong. Reels are outperforming carousels on reach but carousels win on saves. Profile bio needs updating to reflect new offer. Consistency has been excellent at 4-5 posts/week.",
      published: true,
    },
  });

  await prisma.healthRating.createMany({
    data: [
      { auditId: audit.id, category: "profile_bio", rating: "building", note: "Bio is clear but CTA is weak — 'health coach' is generic. Needs a specific outcome and call-to-action." },
      { auditId: audit.id, category: "content_mix", rating: "strong", note: "Good balance of education, results, and personal brand. Nutrition is slightly underrepresented." },
      { auditId: audit.id, category: "consistency", rating: "strong", note: "4-5 posts per week consistently. Story posting at 90% completion rate." },
      { auditId: audit.id, category: "engagement", rating: "building", note: "Comments are growing but response rate from Sophie to comments could improve." },
      { auditId: audit.id, category: "views_to_leads", rating: "focus", note: "High views but DM-to-call conversion needs a clearer bridge — add a lead magnet." },
    ],
    skipDuplicates: true,
  });

  // ── Competitors ───────────────────────────────────────────────────────────
  await prisma.competitor.createMany({
    data: [
      { smsClientId: smsProfile.id, handle: "@movewellcoaching", name: "Move Well Coaching (Sophie)", followersCount: 8400, postsPerWeek: 4.5, avgEngagement: 4.8, topFormat: "reel", isClient: true },
      { smsClientId: smsProfile.id, handle: "@bodybyjess_au", name: "Body by Jess", followersCount: 24000, postsPerWeek: 6, avgEngagement: 2.9, topFormat: "reel" },
      { smsClientId: smsProfile.id, handle: "@pilates_with_kate", name: "Pilates With Kate", followersCount: 15600, postsPerWeek: 4, avgEngagement: 3.4, topFormat: "carousel" },
    ],
    skipDuplicates: false,
  });

  // ── Learn Modules ──────────────────────────────────────────────────────────
  await prisma.learnModule.createMany({
    data: [
      { title: "Writing hooks that stop the scroll", description: "The 5 hook formulas that work in fitness and coaching niches.", lengthMins: 12, type: "video", isSkillOfMonth: true, sortOrder: 0 },
      { title: "The reel formula that gets shared", description: "Problem → agitate → solution → CTA. Done in 30 seconds.", lengthMins: 9, type: "video", sortOrder: 1 },
      { title: "How to batch 30 days of content in 3 hours", description: "Prep, batch, schedule. The system that eliminates daily content stress.", lengthMins: 15, type: "guide", sortOrder: 2 },
      { title: "Instagram SEO: get found without hashtags", description: "How the algorithm reads captions and why keywords beat hashtags.", lengthMins: 8, type: "video", sortOrder: 3 },
      { title: "Turning comments into DM conversations", description: "Reply scripts and patterns that move followers off the feed.", lengthMins: 7, type: "guide", sortOrder: 4 },
      { title: "Analytics that actually matter", description: "Ignore vanity metrics. These are the 5 numbers that predict growth.", lengthMins: 11, type: "video", sortOrder: 5 },
    ],
    skipDuplicates: false,
  });

  // ── Account Insight Daily — October + first half November ────────────────
  const metrics = ["followers", "reach", "impressions", "profile_visits", "followers_gained"] as const;
  const baseValues: Record<string, number> = {
    followers: 8100,
    reach: 3200,
    impressions: 5800,
    profile_visits: 190,
    followers_gained: 12,
  };
  const dailyGrowth: Record<string, number> = {
    followers: 4,
    reach: 80,
    impressions: 140,
    profile_visits: 5,
    followers_gained: 0,
  };

  const insightRows: { smsClientId: string; date: Date; metric: string; value: number }[] = [];
  for (let d = 0; d < 45; d++) {
    const date = new Date("2026-10-01");
    date.setDate(date.getDate() + d);
    for (const metric of metrics) {
      const jitter = Math.round((Math.random() - 0.5) * baseValues[metric] * 0.15);
      const base = baseValues[metric] + dailyGrowth[metric] * d;
      insightRows.push({ smsClientId: smsProfile.id, date, metric, value: Math.max(0, base + jitter) });
    }
  }

  await prisma.accountInsightDaily.createMany({ data: insightRows, skipDuplicates: true });

  console.log("✅ SMS seed complete — Sophie Brennan / Move Well Coaching");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
