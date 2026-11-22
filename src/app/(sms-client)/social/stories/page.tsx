import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StorySchedule, type StoryItem } from "@/components/sms/StorySchedule";

export default async function SmsStoriesPage() {
  const session = await requireAuth("client");
  if (!session.clientProfileId) redirect("/login");

  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  // Demo data: replace with DB query once SMS models are live
  const stories: StoryItem[] = [
    { id: "1",  title: "Monday motivation",         outline: "Quick poll: what's your biggest challenge this week?",          date: `${month}-01`, type: "poll",        status: "posted",    slides: 3 },
    { id: "2",  title: "Client win share",          outline: "Show screenshot of client win + celebrate in stories",            date: `${month}-03`, type: "testimonial", status: "posted",    slides: 4 },
    { id: "3",  title: "BTS content shoot day",     outline: "Film the behind the scenes of monthly content creation day",      date: `${month}-05`, type: "bts",         status: "posted",    slides: 6 },
    { id: "4",  title: "Q&A: DMs answered",        outline: "Repost top DM questions and answer them in stories",             date: `${month}-07`, type: "qa",          status: "posted",    slides: 5 },
    { id: "5",  title: "November offer countdown",  outline: "Day 3 of countdown: 2 spots left at current rate",              date: `${month}-08`, type: "countdown",   status: "posted",    slides: 2 },
    { id: "6",  title: "Quick tips Tuesday",        outline: "3 things to do TODAY to improve your content",                   date: `${month}-10`, type: "tips",        status: "posted",    slides: 4 },
    { id: "7",  title: "Personal share",            outline: "What I've been struggling with lately + what's helping",         date: `${month}-12`, type: "personal",    status: "posted",    slides: 3 },
    { id: "8",  title: "Swipe up: new reel",       outline: "Drive traffic to latest reel: behind the scenes teaser",        date: `${month}-14`, type: "cta",         status: "scheduled", slides: 2 },
    { id: "9",  title: "Poll: content preferences","outline": "Do you prefer carousels or reels? Help us plan your month",    date: `${month}-15`, type: "poll",        status: "scheduled", slides: 3 },
    { id: "10", title: "Client result story",       outline: "Feature client transformation: permission given, photo ready",  date: `${month}-17`, type: "testimonial", status: "scheduled", slides: 5 },
    { id: "11", title: "New service teaser BTS",    outline: "Mysterious teaser for upcoming service announcement",             date: `${month}-19`, type: "bts",         status: "scheduled", slides: 3 },
    { id: "12", title: "Tips: engagement boosters","outline": "Top 3 story types that get the most replies from followers",   date: `${month}-21`, type: "tips",        status: "scheduled", slides: 4 },
    { id: "13", title: "December preview tease",    outline: "Get them excited for what's coming next month",                  date: `${month}-25`, type: "cta",         status: "draft",     slides: 2 },
    { id: "14", title: "Year wrap reflection",      outline: "Personal reflection on the year: raw, honest, relatable",       date: `${month}-28`, type: "personal",    status: "draft",     slides: 4 },
    { id: "15", title: "December countdown begin",  outline: "Start the countdown to new year content shift",                  date: `${month}-30`, type: "countdown",   status: "draft",     slides: 3 },
  ];

  const monthLabel = new Date(`${month}-01`).toLocaleDateString("en-AU", { month: "long", year: "numeric" });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[9px] tracking-[0.22em] uppercase text-[#b0a89e]">Content</p>
        <h1 className="mt-1 text-3xl font-[200] text-[#1A1917] tracking-tight">{monthLabel} Stories</h1>
      </div>
      <StorySchedule stories={stories} month={month} />
    </div>
  );
}
