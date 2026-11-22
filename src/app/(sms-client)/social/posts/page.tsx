import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PostSchedule, type PostItem } from "@/components/sms/PostSchedule";

export default async function SmsPostsPage() {
  const session = await requireAuth("client");
  if (!session.clientProfileId) redirect("/login");

  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  // Demo data: replace with DB query once SMS models are live
  const posts: PostItem[] = [
    { id: "1",  title: "Morning routine reel",         caption: "5am club: here's what my morning actually looks like before the chaos hits.", date: `${month}-01`, format: "reel",     pillar: "Behind the Scenes", status: "posted",    likes: 312, saves: 48, reach: 4200, color: "#8C735A" },
    { id: "2",  title: "Client result carousel",       caption: "She came in stuck. 6 weeks later, here's what changed.", date: `${month}-02`, format: "carousel", pillar: "Social Proof",        status: "posted",    likes: 541, saves: 97, reach: 6800, color: "#2D6A4F" },
    { id: "3",  title: "Common mistake reel",          caption: "If you're doing this one thing in your content, it's killing your reach.", date: `${month}-05`, format: "reel",     pillar: "Education",           status: "posted",    likes: 288, saves: 61, reach: 5100, color: "#2D5F8A" },
    { id: "4",  title: "Behind the brand story",       caption: "Why I almost quit: and what made me stay.", date: `${month}-07`, format: "static",   pillar: "Personal Brand",      status: "posted",    likes: 203, saves: 34, reach: 2900, color: "#7B746B" },
    { id: "5",  title: "November offer post",          caption: "For the month of November only: here's how to work with us.", date: `${month}-08`, format: "carousel", pillar: "Promo",               status: "posted",    likes: 177, saves: 29, reach: 3400, color: "#9B4F2A" },
    { id: "6",  title: "Quick tip reel: hook",        caption: "The 3-second rule that doubled our reel saves.", date: `${month}-10`, format: "reel",     pillar: "Education",           status: "posted",    likes: 490, saves: 118, reach: 7200, color: "#2D5F8A" },
    { id: "7",  title: "Team day BTS",                 caption: "What it looks like when we shoot a whole month of content in one day.", date: `${month}-12`, format: "reel",     pillar: "Behind the Scenes", status: "posted",    likes: 356, saves: 55, reach: 5600, color: "#8C735A" },
    { id: "8",  title: "Testimonial graphic",          caption: "\"I went from 400 to 2.1k followers in 8 weeks.\": Sophie", date: `${month}-14`, format: "static",   pillar: "Social Proof",        status: "scheduled", color: "#2D6A4F" },
    { id: "9",  title: "Reel: myth busting",          caption: "You don't need to post every day. Here's the truth.", date: `${month}-15`, format: "reel",     pillar: "Education",           status: "scheduled", color: "#2D5F8A" },
    { id: "10", title: "Story: Q&A highlights",       caption: "You asked, we answered. Here are the top 5 questions from this month.", date: `${month}-17`, format: "carousel", pillar: "Entertainment",       status: "scheduled", color: "#5A3B7A" },
    { id: "11", title: "New service teaser",           caption: "Something new is coming. Dropping this week.", date: `${month}-19`, format: "reel",     pillar: "Promo",               status: "scheduled", color: "#9B4F2A" },
    { id: "12", title: "Client focus: week 4",        caption: "What one month of consistent content did for this client's business.", date: `${month}-21`, format: "carousel", pillar: "Social Proof",        status: "scheduled", color: "#2D6A4F" },
    { id: "13", title: "Personal brand moment",        caption: "The email I got that made me realise why we do this.", date: `${month}-22`, format: "static",   pillar: "Personal Brand",      status: "draft",     color: "#7B746B" },
    { id: "14", title: "End of month reel: recap",    caption: "November wrapped. Here's what we learned.", date: `${month}-26`, format: "reel",     pillar: "Behind the Scenes", status: "draft",     color: "#8C735A" },
    { id: "15", title: "December preview carousel",    caption: "What's coming in December: here's your sneak peek.", date: `${month}-28`, format: "carousel", pillar: "Promo",               status: "draft",     color: "#9B4F2A" },
    { id: "16", title: "Year in review reel",          caption: "From 0 to here. A look back at how far we've come.", date: `${month}-30`, format: "reel",     pillar: "Personal Brand",      status: "draft",     color: "#7B746B" },
  ];

  const monthLabel = new Date(`${month}-01`).toLocaleDateString("en-AU", { month: "long", year: "numeric" });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[9px] tracking-[0.22em] uppercase text-[#b0a89e]">Content</p>
        <h1 className="mt-1 text-3xl font-[200] text-[#1A1917] tracking-tight">{monthLabel} Posts</h1>
      </div>
      <PostSchedule posts={posts} month={month} />
    </div>
  );
}
