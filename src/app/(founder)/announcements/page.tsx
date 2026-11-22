import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AnnouncementForm } from "@/components/founder/AnnouncementForm";
import { DeleteAnnouncementButton } from "@/components/founder/DeleteAnnouncementButton";

const AUDIENCE_LABELS: Record<string, string> = {
  all: "All clients",
  consulting: "Consulting only",
  social: "Social media only",
  onboarding: "Onboarding",
  active: "Active",
};

export default async function AnnouncementsPage() {
  await requireAuth("founder");

  const announcements = await prisma.announcement.findMany({
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-4xl font-[300] tracking-tight text-[#1A1917]">Announcements</h1>
        <p className="mt-1.5 text-sm text-[#7a7268]">Send updates to your clients. They see these on their home page.</p>
      </div>

      <AnnouncementForm />

      {announcements.length === 0 ? (
        <div className="rounded-2xl border border-[#EDEBE6] px-6 py-12 text-center">
          <p className="text-sm text-[#b0a89e]">No announcements yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <div key={a.id} className="rounded-2xl border border-[#EDEBE6] p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-[#1A1917]">{a.title}</p>
                    <span className="text-[9px] tracking-[0.1em] uppercase text-[#b0a89e] border border-[#EDEBE6] rounded px-1.5 py-0.5">
                      {AUDIENCE_LABELS[a.audience] ?? a.audience}
                    </span>
                  </div>
                  <p className="text-xs text-[#7a7268] leading-5 whitespace-pre-wrap">{a.body}</p>
                  <p className="text-[10px] text-[#b0a89e] mt-2">
                    {new Date(a.publishedAt).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                <DeleteAnnouncementButton id={a.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
