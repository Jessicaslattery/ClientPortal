import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";

const TYPE_LABELS: Record<string, string> = {
  business_onboarding: "Business Onboarding",
  goal_setting: "Goal Setting",
  social_onboarding: "Social Media Onboarding",
  social_goal_setting: "Social Media Goal Setting",
  client_voice: "Client Voice",
  monthly_momentum: "Monthly Momentum Check-in",
};

export default async function ClientQuestionnairesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth(["founder", "staff"]);
  const { id } = await params;

  const client = await prisma.clientProfile.findUnique({ where: { id } });
  if (!client) notFound();

  const responses = await prisma.questionnaireResponse.findMany({
    where: { clientProfileId: id },
    orderBy: { submittedAt: "desc" },
  });

  const byType = responses.reduce<Record<string, typeof responses>>((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {});

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Link href={`/clients/${id}`} className="text-xs text-[#b0a89e] hover:text-[#7a7268] transition-colors">
            {client.founderName}
          </Link>
          <span className="text-[#EDEBE6]">/</span>
          <span className="text-xs text-[#7a7268]">Questionnaires</span>
        </div>
        <h1 className="text-4xl font-[300] tracking-tight text-[#1A1917]">Questionnaires</h1>
        <p className="mt-1 text-sm text-[#7a7268]">{responses.length} response{responses.length !== 1 ? "s" : ""} total</p>
      </div>

      {responses.length === 0 ? (
        <div className="rounded-2xl border border-[#EDEBE6] px-8 py-12 text-center">
          <p className="text-lg font-[300] text-[#1A1917]">No responses yet</p>
          <p className="mt-1 text-sm text-[#7a7268]">{client.founderName} hasn't completed any questionnaires yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(TYPE_LABELS).map(([type, label]) => {
            const typeResponses = byType[type] ?? [];
            if (typeResponses.length === 0) return null;
            const latest = typeResponses[0];
            const answers = JSON.parse(latest.answersJson) as Record<string, string>;

            return (
              <div key={type} className="rounded-2xl border border-[#EDEBE6] overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 bg-[#FAFAF8] border-b border-[#EDEBE6]">
                  <div>
                    <p className="text-sm font-[500] text-[#1A1917]">{label}</p>
                    <p className="text-xs text-[#b0a89e] mt-0.5">
                      Submitted{" "}
                      {new Date(latest.submittedAt).toLocaleDateString("en-AU", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                      {typeResponses.length > 1 && ` · ${typeResponses.length} submissions`}
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-[#EDEBE6]">
                  {Object.entries(answers).map(([key, value]) => {
                    if (!value) return null;
                    const readableKey = key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (s) => s.toUpperCase())
                      .trim();

                    return (
                      <div key={key} className="px-5 py-4">
                        <p className="text-[10px] tracking-[0.1em] text-[#b0a89e] mb-1.5">{readableKey}</p>
                        <p className="text-sm text-[#1A1917] leading-6 whitespace-pre-wrap">{value}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
