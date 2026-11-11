import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function SmsLearnPage() {
  const session = await requireAuth("client");
  if (!session.clientProfileId) redirect("/login");

  const modules = await prisma.learnModule.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const skillOfMonth = modules.find((m) => m.isSkillOfMonth);
  const library = modules.filter((m) => !m.isSkillOfMonth);

  return (
    <div className="space-y-10">
      <div>
        <p className="text-[10px] tracking-[0.28em] uppercase text-[#6d675e]">Learn + Tools</p>
        <h1 className="mt-1 text-3xl font-[200] text-[#1A1917] tracking-tight" style={{ fontFamily: "var(--font-jakarta)" }}>
          Your learning hub
        </h1>
      </div>

      {/* Skill of the month */}
      {skillOfMonth && (
        <section className="border border-[#1A1917] p-6 space-y-3">
          <p className="text-[9px] tracking-[0.28em] uppercase text-[#1A1917]">Skill of the month</p>
          <h2 className="text-xl font-[300] text-[#1A1917]">{skillOfMonth.title}</h2>
          {skillOfMonth.description && (
            <p className="text-sm text-[#6d675e] leading-relaxed">{skillOfMonth.description}</p>
          )}
          <div className="flex items-center gap-4 pt-1">
            <span className="text-[10px] tracking-[0.14em] uppercase text-[#6d675e]">
              {skillOfMonth.type === "video" ? "Video" : "Guide"} · {skillOfMonth.lengthMins} min
            </span>
            {skillOfMonth.videoUrl ? (
              <a
                href={skillOfMonth.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#1A1917] border border-[#1A1917] px-4 py-1.5 hover:bg-[#1A1917] hover:text-white transition-colors"
              >
                Watch now
              </a>
            ) : (
              <span className="text-xs text-[#6d675e] border border-[#D9D3C6] px-4 py-1.5">
                Coming soon
              </span>
            )}
          </div>
        </section>
      )}

      {/* Module library */}
      <section className="space-y-4">
        <p className="text-[10px] tracking-[0.28em] uppercase text-[#6d675e]">Module library</p>
        <div className="space-y-px bg-[#D9D3C6]">
          {library.map((m) => (
            <div key={m.id} className="bg-white px-5 py-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#1A1917]">{m.title}</p>
                {m.description && (
                  <p className="mt-1 text-xs text-[#6d675e] leading-relaxed">{m.description}</p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[9px] tracking-[0.14em] uppercase text-[#6d675e]">
                    {m.type === "video" ? "Video" : "Guide"}
                  </span>
                  {m.lengthMins && (
                    <span className="text-[9px] text-[#6d675e]">{m.lengthMins} min</span>
                  )}
                </div>
              </div>
              {m.videoUrl ? (
                <a
                  href={m.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-[10px] tracking-[0.1em] uppercase text-[#1A1917] border border-[#D9D3C6] px-3 py-1.5 hover:border-[#1A1917] transition-colors"
                >
                  Open
                </a>
              ) : (
                <span className="shrink-0 text-[10px] tracking-[0.1em] uppercase text-[#6d675e] border border-[#D9D3C6] px-3 py-1.5">
                  Soon
                </span>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
