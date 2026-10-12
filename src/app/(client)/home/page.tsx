import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BookCallForm } from "@/components/client/BookCallForm";


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
    },
  });

  if (!profile) redirect("/login");

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
    <div className="space-y-10">
      {/* Welcome header */}
      <div>
        <p className="text-xs tracking-[0.15em] uppercase text-[#8C8277] mb-1">
          {now.toLocaleDateString("en-AU", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
        <h1 className="font-display text-2xl md:text-4xl font-thin tracking-widest text-[#1A1714] uppercase leading-tight">
          <span className="block md:inline">Welcome back,</span>{" "}
          <span className="block md:inline">{profile.founderName.includes("&") ? profile.founderName.split(" ").slice(0, -1).join(" ") : profile.founderName.split(" ")[0]}.</span>
        </h1>
        <p className="mt-1.5 text-sm text-[#5C5550]">Growth Partnership</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Tasks this week", value: completedTasksThisWeek },
          { label: "Goals on track", value: goalsOnTrack },
          { label: "Open tasks", value: profile.tasks.length },
          { label: "Goals total", value: profile.goals.length },
        ].map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-[#E8E2D9] p-4">
            <p className="text-[10px] tracking-[0.12em] uppercase text-[#8C8277]">
              {stat.label}
            </p>
            <p className="font-display text-3xl font-thin tracking-widest text-[#1A1714] mt-2">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Weekly focus */}
        {profile.weeklyFocus && (
          <div className="col-span-2 rounded-3xl border border-[#C8B89A]/20 bg-[#C8B89A]/4 p-5">
            <p className="text-[10px] tracking-[0.15em] uppercase text-[#C8B89A] mb-2">
              This week&apos;s focus
            </p>
            <p className="text-sm text-[#1A1714] leading-6">{profile.weeklyFocus}</p>
          </div>
        )}

        {/* Next call */}
        <div className="rounded-3xl border border-[#E8E2D9] p-5">
          <p className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277] mb-4">
            Book Weekly Call
          </p>
          {nextCall ? (
            <div>
              <p className="font-display text-2xl font-thin tracking-wide text-[#1A1714]">
                {new Date(nextCall.scheduledAt).toLocaleDateString("en-AU", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
              <p className="text-xs text-[#5C5550] mt-1">{nextCall.title}</p>
              <BookCallForm />
            </div>
          ) : (
            <div>
              <p className="text-sm text-[#8C8277]">No call scheduled yet.</p>
              <BookCallForm />
            </div>
          )}
        </div>

        {/* Check-in status */}
        <div className="rounded-3xl border border-[#E8E2D9] p-5">
          <p className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277] mb-4">
            Weekly Check-in
          </p>
          {hasCheckInThisWeek ? (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F]" />
                <p className="text-sm text-[#2D6A4F]">Submitted this week</p>
              </div>
              <p className="text-xs text-[#5C5550]">Energy: {lastCheckIn.energyScore}/10</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B7791F]" />
                <p className="text-sm text-[#B7791F]">Not yet submitted</p>
              </div>
              <Link
                href="/check-in"
                className="text-xs tracking-[0.1em] uppercase text-[#C8B89A] hover:opacity-70 transition-opacity"
              >
                Complete check-in →
              </Link>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="col-span-2 rounded-3xl border border-[#E8E2D9]">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <p className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277]">
              Messages
            </p>
            <Link
              href="/messages"
              className="text-xs tracking-[0.1em] uppercase text-[#C8B89A] hover:opacity-70 transition-opacity"
            >
              View all →
            </Link>
          </div>
          {recentMessages.length === 0 ? (
            <p className="px-5 pb-5 text-sm text-[#8C8277]">No messages yet.</p>
          ) : (
            <div className="divide-y divide-[#E8E2D9]">
              {recentMessages.map((msg) => (
                <div key={msg.id} className="px-5 py-4 flex items-start gap-3">
                  {!msg.read && (
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#C8B89A] shrink-0" />
                  )}
                  <div className={!msg.read ? "" : "pl-[18px]"}>
                    <p className="text-sm text-[#1A1714] leading-5">{msg.content}</p>
                    <p className="text-xs text-[#8C8277] mt-1">
                      {new Date(msg.createdAt).toLocaleDateString("en-AU", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="col-span-2">
          <p className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277] mb-3">Quick access</p>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Tasks", href: "/tasks" },
              { label: "Goals", href: "/goals" },
              { label: "Deliverables", href: "/deliverables" },
              { label: "Content Calendar", href: "/social-plan" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-2xl border border-[#E8E2D9] px-4 py-3 text-xs tracking-wide text-[#5C5550] hover:text-[#1A1714] hover:border-[#C8B89A] transition-all text-center"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
