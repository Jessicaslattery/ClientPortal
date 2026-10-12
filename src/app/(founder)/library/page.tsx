import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AddResourceForm } from "@/components/founder/AddResourceForm";
import { deleteResourceAction } from "@/app/(founder)/library/actions";

const TYPE_STYLES: Record<string, string> = {
  Video:    "bg-[#9B2335]/12 text-[#9B2335] border-[#9B2335]/20",
  PDF:      "bg-[#2D6A4F]/12 text-[#2D6A4F] border-[#2D6A4F]/20",
  Guide:    "bg-[#C8B89A]/12 text-[#C8B89A] border-[#C8B89A]/20",
  Template: "bg-[#b89060]/12 text-[#b89060] border-[#b89060]/20",
  Link:     "bg-[#5C5550]/12 text-[#5C5550] border-[#5C5550]/20",
};

const VISIBILITY_LABELS: Record<string, string> = {
  all: "All clients",
  core: "Core only",
  lite: "Lite only",
  specific: "Specific client",
};

export default async function FounderResourcesPage() {
  await requireAuth("founder");

  const [resources, clients] = await Promise.all([
    prisma.resource.findMany({
      orderBy: { createdAt: "desc" },
      include: { specificClient: { select: { founderName: true, businessName: true } } },
    }),
    prisma.clientProfile.findMany({
      select: { id: true, founderName: true, businessName: true },
      orderBy: { founderName: "asc" },
    }),
  ]);

  const now = new Date();
  const isNew = (date: Date) => (now.getTime() - date.getTime()) < 14 * 24 * 60 * 60 * 1000;

  const grouped = resources.reduce<Record<string, typeof resources>>((acc, r) => {
    if (!acc[r.category]) acc[r.category] = [];
    acc[r.category].push(r);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-4xl font-thin tracking-widest text-[#1A1714] uppercase">
            Resource Library
          </h1>
          <p className="mt-1.5 text-sm text-[#5C5550]">
            {resources.length} resource{resources.length !== 1 ? "s" : ""} across {Object.keys(grouped).length} categories
          </p>
        </div>
        <AddResourceForm clients={clients} />
      </div>

      {resources.length === 0 ? (
        <div className="rounded-3xl border border-[#E8E2D9] px-6 py-16 text-center">
          <p className="text-sm text-[#8C8277]">No resources yet. Add your first one above.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h2 className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277] mb-3">{category}</h2>
              <div className="rounded-3xl border border-[#E8E2D9] divide-y divide-[#E8E2D9]">
                {items.map((r) => (
                  <div key={r.id} className="flex items-start justify-between px-5 py-4 gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <a
                          href={r.fileUrl ?? "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#1A1714] hover:text-[#C8B89A] transition-colors truncate"
                        >
                          {r.title}
                        </a>
                        {isNew(r.createdAt) && (
                          <span className="shrink-0 text-[9px] tracking-[0.1em] uppercase px-1.5 py-0.5 rounded-full bg-[#C8B89A]/10 text-[#C8B89A] border border-[#C8B89A]/20">
                            New
                          </span>
                        )}
                      </div>
                      {r.description && (
                        <p className="text-xs text-[#5C5550] leading-5 line-clamp-2">{r.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`text-[9px] tracking-[0.1em] uppercase px-2 py-0.5 rounded-full border ${TYPE_STYLES[r.type] ?? TYPE_STYLES.Link}`}>
                          {r.type}
                        </span>
                        <span className="text-[10px] text-[#8C8277]">
                          {VISIBILITY_LABELS[r.visibility] ?? r.visibility}
                          {r.specificClient && ` · ${r.specificClient.founderName}`}
                        </span>
                        <span className="text-[10px] text-[#8C8277]">
                          {r.createdAt.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                    </div>
                    <form
                      action={async () => {
                        "use server";
                        await deleteResourceAction(r.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="text-[#8C8277] hover:text-[#9B2335] transition-colors shrink-0 mt-0.5"
                        title="Delete"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                          <path d="M2 2l8 8M10 2L2 10" />
                        </svg>
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
