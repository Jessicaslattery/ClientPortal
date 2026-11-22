import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BookCallForm } from "@/components/client/BookCallForm";
import { WinLogForm } from "@/components/client/WinLogForm";


export default async function ClientHomePage() {
  const session = await requireAuth("client");
  if (!session.clientProfileId) redirect("/login");

  const profile = await prisma.clientProfile.findUnique({
    where: { id: session.clientProfileId },
    include: {
      tasks: { where: { completed: false } },
      calls: {
        where: { scheduledAt: { gte: new Date() } },
        orderBy: { scheduledAt: "asc" },
        take: 1,
      },
      goals: true,
      messages: {
        orderBy: { createdAt: "desc" },
        take: 3,
      },
      checkIns: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      wins: {
        orderBy: { celebratedAt: "desc" },
        take: 3,
      },
    },
  });

  if (!profile) redirect("/login");

  // Load announcements relevant to this client
  const pkg = profile.package ?? "consulting";
  const isOnboarding = profile.currentMonth === 1;
  const announcements = await prisma.announcement.findMany({
    where: {
      audience: {
        in: ["all", pkg, isOnboarding ? "onboarding" : "active"],
      },
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  // Redirect to onboarding if not yet completed
  if (!profile.onboardingComplete) {
    redirect("/onboarding");
  }

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1);
  weekStart.setHours(0, 0, 0, 0);

  const completedTasksThisWeek = await prisma.task.count({
    where: {
      clientProfileId: profile.id,
      completed: true,
      completedAt: { gte: weekStart },
    },
  });

  const goalsOnTrack = profile.goals.filter((g) => g.progressPercent >= 50).length;

  const lastCheckIn = profile.checkIns[0];
  const hasCheckInThisWeek =
    lastCheckIn && new Date(lastCheckIn.createdAt) >= weekStart;

  const nextCall = profile.calls[0];
  const recentMessages = profile.messages;

  return (
    <div className="max-w-4xl space-y-12">
      {/* Welcome header */}
      <div className="border-b border-[#EDEBE6] pb-6">
        <p className="text-[9px] tracking-[0.22em] uppercase text-[#7B746B] mb-1">
          {now.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <h1 className="text-5xl font-[200] text-[#1A1917] leading-tight">
          {profile.founderName.includes("&") ? profile.founderName.split(" ").slice(0, -1).join(" ") : profile.founderName.split(" ")[0]}
        </h1>
        <p className="mt-1.5 text-xs tracking-[0.1em] text-[#7B746B]">Growth Partnership</p>
      </div>

      {/* Stats row: hairline top border tiles */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { label: "Completed this week", value: completedTasksThisWeek },
          { label: "Goals on track", value: goalsOnTrack },
          { label: "Open tasks", value: profile.tasks.length },
          { label: "Goals total", value: profile.goals.length },
        ].map((stat) => (
          <div key={stat.label} className="border-t border-[#1A1917] pt-4">
            <p className="text-[9px] tracking-[0.2em] uppercase text-[#7B746B]">{stat.label}</p>
            <p className="text-4xl font-[200] text-[#1A1917] mt-2">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Weekly focus */}
      {profile.weeklyFocus && (
        <div className="border-t border-[#EDEBE6] pt-8">
          <p className="text-[9px] tracking-[0.22em] uppercase text-[#7B746B] mb-3">This week&apos;s focus</p>
          <p className="text-base text-[#1A1917] leading-7 font-[300] max-w-2xl">{profile.weeklyFocus}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6 border-t border-[#EDEBE6] pt-8">
        {/* Next call */}
        <div className="border border-[#EDEBE6] rounded-xl p-6">
          <p className="text-[9px] tracking-[0.22em] uppercase text-[#7B746B] mb-4">Weekly Call</p>
          {nextCall ? (
            <div>
              <p className="text-2xl font-[200] text-[#1A1917]">
                {new Date(nextCall.scheduledAt).toLocaleDateString("en-AU", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
              <p className="text-xs text-[#7B746B] mt-1">{nextCall.title}</p>
              <div className="mt-4 border-t border-[#EDEBE6] pt-4">
                <BookCallForm />
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-[#7B746B]">No call scheduled yet.</p>
              <div className="mt-4">
                <BookCallForm />
              </div>
            </div>
          )}
        </div>

        {/* Check-in status */}
        <div className="border border-[#EDEBE6] rounded-xl p-6">
          <p className="text-[9px] tracking-[0.22em] uppercase text-[#7B746B] mb-4">Weekly Check-in</p>
          {hasCheckInThisWeek ? (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F]" />
                <p className="text-sm text-[#2D6A4F]">Submitted this week</p>
              </div>
              <p className="text-xs text-[#7B746B]">Energy score: {lastCheckIn.energyScore}/10</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8C735A]" />
                <p className="text-sm text-[#8C735A]">Not yet submitted</p>
              </div>
              <Link
                href="/check-in"
                className="text-xs tracking-[0.1em] uppercase text-[#8C735A] hover:opacity-70 transition-opacity"
              >
                Complete check-in →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="border-t border-[#EDEBE6] pt-8">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[9px] tracking-[0.22em] uppercase text-[#7B746B]">Messages</p>
          <Link href="/messages" className="text-xs tracking-[0.1em] uppercase text-[#8C735A] hover:opacity-70 transition-opacity">
            View all →
          </Link>
        </div>
        {recentMessages.length === 0 ? (
          <p className="text-sm text-[#7B746B]">No messages yet.</p>
        ) : (
          <div className="border border-[#EDEBE6] rounded-xl divide-y divide-[#EDEBE6]">
            {recentMessages.map((msg) => (
              <div key={msg.id} className="px-5 py-4 flex items-start gap-3">
                {!msg.read && (
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#8C735A] shrink-0" />
                )}
                <div className={!msg.read ? "" : "pl-[18px]"}>
                  <p className="text-sm text-[#1A1917] leading-5">{msg.content}</p>
                  <p className="text-xs text-[#7B746B] mt-1">
                    {new Date(msg.createdAt).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <div className="border-t border-[#EDEBE6] pt-8">
          <p className="text-[9px] tracking-[0.22em] uppercase text-[#7B746B] mb-4">From Pivot Co</p>
          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a.id} className="border border-[#C8B89A]/40 rounded-xl bg-[#FDFCF9] px-5 py-4">
                <p className="text-sm font-medium text-[#1A1917] mb-1">{a.title}</p>
                <p className="text-xs text-[#7B746B] leading-5 whitespace-pre-wrap">{a.body}</p>
                <p className="text-[10px] text-[#b0a89e] mt-2">
                  {new Date(a.publishedAt).toLocaleDateString("en-AU", { day: "numeric", month: "long" })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Win log */}
      <div className="border-t border-[#EDEBE6] pt-8">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[9px] tracking-[0.22em] uppercase text-[#7B746B]">Recent wins</p>
          <Link href="/wins" className="text-xs tracking-[0.1em] uppercase text-[#8C735A] hover:opacity-70 transition-opacity">
            View all →
          </Link>
        </div>
        {profile.wins.length > 0 ? (
          <div className="space-y-2 mb-4">
            {profile.wins.map((win) => (
              <div key={win.id} className="flex items-center gap-2">
                <span className="text-[10px] text-[#8C735A]">✦</span>
                <p className="text-xs text-[#1A1917]">{win.title}</p>
                <span className="text-[10px] text-[#b0a89e] ml-auto">
                  {new Date(win.celebratedAt).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#7B746B] mb-4">Log your first win below.</p>
        )}
        <WinLogForm />
      </div>

      {/* Quick links */}
      <div className="border-t border-[#EDEBE6] pt-8">
        <p className="text-[9px] tracking-[0.22em] uppercase text-[#7B746B] mb-4">Quick access</p>
        <div className="flex flex-wrap gap-4">
          {[
            { label: "Tasks", href: "/tasks" },
            { label: "Goals", href: "/goals" },
            { label: "Wins", href: "/wins" },
            { label: "Deliverables", href: "/deliverables" },
            { label: "Messages", href: "/messages" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="border border-[#EDEBE6] rounded-xl px-5 py-2.5 text-xs tracking-wide text-[#7B746B] hover:text-[#1A1917] hover:border-[#8C735A]/50 transition-all"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
