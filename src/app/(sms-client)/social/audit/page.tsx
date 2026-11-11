import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

const CATEGORY_LABELS: Record<string, string> = {
  profile_bio: "Profile & Bio",
  content_mix: "Content Mix",
  consistency: "Consistency",
  engagement: "Engagement",
  views_to_leads: "Views → Leads",
};

const RATING_STYLES: Record<string, { dot: string; label: string; labelColor: string }> = {
  strong: { dot: "#2D6A4F", label: "Strong", labelColor: "#2D6A4F" },
  building: { dot: "#C8A86B", label: "Building", labelColor: "#C8A86B" },
  focus: { dot: "#9B2335", label: "Focus area", labelColor: "#9B2335" },
};

export default async function SmsAuditPage() {
  const session = await requireAuth("client");
  if (!session.clientProfileId) redirect("/login");

  const smsProfile = await prisma.smsClientProfile.findUnique({
    where: { clientProfileId: session.clientProfileId },
    include: {
      quarterlyAudits: {
        where: { quarter: "2026-Q4" },
        include: { healthRatings: true },
      },
      competitors: { orderBy: { isClient: "desc" } },
    },
  });

  if (!smsProfile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-sm text-[#6d675e]">No social strategy found.</p>
      </div>
    );
  }

  const audit = smsProfile.quarterlyAudits[0];
  const competitors = smsProfile.competitors;

  return (
    <div className="space-y-10">
      <div>
        <p className="text-[10px] tracking-[0.28em] uppercase text-[#6d675e]">Q4 2026</p>
        <h1 className="mt-1 text-3xl font-[200] text-[#1A1917] tracking-tight" style={{ fontFamily: "var(--font-jakarta)" }}>
          Quarterly Audit
        </h1>
      </div>

      {/* Health ratings */}
      {audit && (
        <section className="space-y-4">
          <p className="text-[10px] tracking-[0.28em] uppercase text-[#6d675e]">Profile health</p>
          <div className="space-y-px bg-[#D9D3C6]">
            {audit.healthRatings.map((r) => {
              const style = RATING_STYLES[r.rating] ?? RATING_STYLES.building;
              return (
                <div key={r.id} className="bg-white px-5 py-4 flex items-start gap-4">
                  <span className="mt-1.5 w-2 h-2 rounded-full shrink-0" style={{ background: style.dot }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-sm text-[#1A1917]">{CATEGORY_LABELS[r.category] ?? r.category}</p>
                      <span className="text-[9px] tracking-[0.14em] uppercase" style={{ color: style.labelColor }}>
                        {style.label}
                      </span>
                    </div>
                    {r.note && <p className="text-xs text-[#6d675e] leading-relaxed">{r.note}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Strategist notes */}
      {audit?.reportText && (
        <section className="border border-[#D9D3C6] p-6">
          <p className="text-[10px] tracking-[0.28em] uppercase text-[#6d675e] mb-3">Audit summary</p>
          <p className="text-sm text-[#1A1917] leading-relaxed">{audit.reportText}</p>
          {audit.nextAuditDate && (
            <p className="mt-3 text-xs text-[#6d675e]">
              Next audit: {new Date(audit.nextAuditDate).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}
        </section>
      )}

      {/* Competitor table */}
      {competitors.length > 0 && (
        <section className="space-y-4">
          <p className="text-[10px] tracking-[0.28em] uppercase text-[#6d675e]">Competitor landscape</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#D9D3C6]">
                  {["Handle", "Followers", "Posts/wk", "Avg eng%", "Top format"].map((h) => (
                    <th key={h} className="text-left py-2 px-3 text-[9px] tracking-[0.14em] uppercase text-[#6d675e] font-normal">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {competitors.map((c) => (
                  <tr
                    key={c.id}
                    className={`border-b border-[#E6E2D9] ${c.isClient ? "bg-[#F7F5F0]" : ""}`}
                  >
                    <td className="py-3 px-3 text-[#1A1917]">
                      {c.handle}
                      {c.isClient && <span className="ml-2 text-[9px] text-[#6d675e]">(you)</span>}
                    </td>
                    <td className="py-3 px-3 text-[#1A1917]">
                      {c.followersCount != null ? c.followersCount.toLocaleString() : "—"}
                    </td>
                    <td className="py-3 px-3 text-[#1A1917]">{c.postsPerWeek ?? "—"}</td>
                    <td className="py-3 px-3 text-[#1A1917]">
                      {c.avgEngagement != null ? `${c.avgEngagement}%` : "—"}
                    </td>
                    <td className="py-3 px-3 text-[#1A1917] capitalize">{c.topFormat ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
