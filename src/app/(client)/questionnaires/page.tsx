import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

const QUESTIONNAIRE_TYPES = [
  {
    type: "business_onboarding",
    title: "Business Onboarding",
    description: "Tell me about your business: where you are now and where you want to go.",
    estimatedMins: 15,
    icon: "🏢",
  },
  {
    type: "goal_setting",
    title: "Goal Setting",
    description: "Define your goals for our work together so we can measure real progress.",
    estimatedMins: 10,
    icon: "🎯",
  },
  {
    type: "social_onboarding",
    title: "Social Media Onboarding",
    description: "Your current social presence, content approach, and what's working.",
    estimatedMins: 10,
    icon: "📱",
  },
  {
    type: "social_goal_setting",
    title: "Social Media Goal Setting",
    description: "Where you want your social media to take your business in the next 90 days.",
    estimatedMins: 8,
    icon: "📈",
  },
  {
    type: "client_voice",
    title: "Client Voice",
    description: "How your clients talk about you and what they value most: the foundation of your brand voice.",
    estimatedMins: 12,
    icon: "💬",
  },
  {
    type: "monthly_momentum",
    title: "Monthly Momentum Check-in",
    description: "A quick reflection on the past month: wins, challenges, and focus for next month.",
    estimatedMins: 5,
    icon: "📅",
  },
];

export default async function QuestionnairesPage() {
  const session = await requireAuth("client");
  if (!session.clientProfileId) redirect("/login");

  const responses = await prisma.questionnaireResponse.findMany({
    where: { clientProfileId: session.clientProfileId },
    orderBy: { submittedAt: "desc" },
  });

  const completedTypes = new Set(responses.map((r) => r.type));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-[200] text-[#1A1917]">Questionnaires</h1>
        <p className="mt-1.5 text-sm text-[#7a7268]">
          Complete these to help me understand your business and goals better
        </p>
      </div>

      <div className="space-y-3">
        {QUESTIONNAIRE_TYPES.map((q) => {
          const done = completedTypes.has(q.type);
          const lastResponse = responses.find((r) => r.type === q.type);

          return (
            <div
              key={q.type}
              className={`rounded-2xl border p-5 transition-colors ${
                done ? "border-[#EDEBE6] bg-[#FAFAF8]" : "border-[#C8B89A]/30 bg-white hover:border-[#C8B89A]/60"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <span className="text-2xl mt-0.5">{q.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <p className="text-sm font-[500] text-[#1A1917]">{q.title}</p>
                      {done && (
                        <span className="text-[9px] tracking-[0.12em] text-[#2D6A4F] uppercase">
                          Completed
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-[#7a7268] leading-5">{q.description}</p>
                    <p className="mt-1.5 text-[10px] text-[#b0a89e]">~{q.estimatedMins} mins</p>
                    {lastResponse && (
                      <p className="mt-1 text-[10px] text-[#b0a89e]">
                        Last submitted{" "}
                        {new Date(lastResponse.submittedAt).toLocaleDateString("en-AU", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                </div>

                <Link
                  href={`/questionnaires/${q.type}`}
                  className={`shrink-0 px-4 py-2 rounded-xl text-[10px] tracking-[0.1em] transition-colors ${
                    done
                      ? "border border-[#EDEBE6] text-[#7a7268] hover:border-[#C8B89A] hover:text-[#1A1917]"
                      : "bg-[#1A1917] text-white hover:bg-[#2C2520]"
                  }`}
                >
                  {done ? "Update" : "Start"}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
