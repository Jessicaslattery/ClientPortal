import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default async function DeliverablesPage() {
  const session = await requireAuth("client");
  if (!session.clientProfileId) redirect("/login");

  const deliverables = await prisma.deliverable.findMany({
    where: { clientProfileId: session.clientProfileId },
    orderBy: { deliveredAt: "asc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-thin tracking-widest text-[#1A1714] uppercase">Deliverables</h1>
        <p className="mt-1.5 text-sm text-[#5C5550]">
          {deliverables.length} document{deliverables.length !== 1 ? "s" : ""} delivered
        </p>
      </div>

      {deliverables.length === 0 ? (
        <div className="rounded-3xl border border-[#E8E2D9] px-8 py-16 text-center">
          <p className="font-display text-2xl font-thin tracking-wide text-[#1A1714]">
            Coming soon
          </p>
          <p className="mt-2 text-sm text-[#5C5550]">
            Your deliverables will appear here as the programme progresses.
          </p>
        </div>
      ) : (
        <div className="rounded-3xl border border-[#E8E2D9] divide-y divide-[#E8E2D9]">
          {deliverables.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 border border-[#E8E2D9] flex items-center justify-center flex-shrink-0">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          stroke="#5C5550"
                          strokeWidth="1.2"
                        >
                          <path d="M2.5 1.5h6l3 3v8a.5.5 0 01-.5.5h-8.5a.5.5 0 01-.5-.5v-11a.5.5 0 01.5-.5z" />
                          <path d="M8.5 1.5v3h3" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-[#1A1714]">{doc.title}</p>
                        {doc.description && (
                          <p className="text-xs text-[#5C5550] mt-0.5">{doc.description}</p>
                        )}
                        <p className="text-xs text-[#8C8277] mt-0.5">
                          Delivered{" "}
                          {new Date(doc.deliveredAt).toLocaleDateString("en-AU", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {doc.monthNumber && (
                        <StatusBadge
                          label={`Month ${doc.monthNumber}`}
                          status="gold"
                        />
                      )}
                      {doc.fileUrl && (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs tracking-[0.1em] uppercase text-[#C8B89A] hover:opacity-70 transition-opacity"
                        >
                          View →
                        </a>
                      )}
                    </div>
                  </div>
          ))}
        </div>
      )}
    </div>
  );
}
