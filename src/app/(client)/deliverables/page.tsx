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
        <h1 className="text-4xl font-[200] text-[#1A1917]">Deliverables</h1>
        <p className="mt-1.5 text-sm text-[#7a7268]">
          {deliverables.length} document{deliverables.length !== 1 ? "s" : ""} delivered
        </p>
      </div>

      {deliverables.length === 0 ? (
        <div className="rounded-2xl border border-[#EDEBE6] px-8 py-16 text-center">
          <p className="text-2xl font-[200] text-[#1A1917]">
            Coming soon
          </p>
          <p className="mt-2 text-sm text-[#7a7268]">
            Your deliverables will appear here as the programme progresses.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#EDEBE6] divide-y divide-[#EDEBE6]">
          {deliverables.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 border border-[#EDEBE6] flex items-center justify-center flex-shrink-0">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          stroke="#7a7268"
                          strokeWidth="1.2"
                        >
                          <path d="M2.5 1.5h6l3 3v8a.5.5 0 01-.5.5h-8.5a.5.5 0 01-.5-.5v-11a.5.5 0 01.5-.5z" />
                          <path d="M8.5 1.5v3h3" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-[#1A1917]">{doc.title}</p>
                        {doc.description && (
                          <p className="text-xs text-[#7a7268] mt-0.5">{doc.description}</p>
                        )}
                        <p className="text-xs text-[#b0a89e] mt-0.5">
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
