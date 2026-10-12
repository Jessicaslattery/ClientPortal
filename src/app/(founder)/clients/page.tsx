import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function ClientsListPage() {
  await requireAuth("founder");

  const clients = await prisma.clientProfile.findMany({
    include: {
      tasks: { where: { completed: false } },
    },
    orderBy: { founderName: "asc" },
  });

  const active = clients.filter((c) => c.isActive);
  const past = clients.filter((c) => !c.isActive);

  function fmt(d: Date | null | undefined, opts?: Intl.DateTimeFormatOptions) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-AU", opts ?? { day: "numeric", month: "short", year: "numeric" });
  }

  function Col({ label, value, width }: { label: string; value: string; width: string }) {
    return (
      <div className={width}>
        <p className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277]">{label}</p>
        <p className="text-xs text-[#1A1714] mt-0.5 truncate">{value}</p>
      </div>
    );
  }

  const hasEndDate = active.some((c) => c.endDate) || past.some((c) => c.endDate);
  const hasPhone = active.some((c) => c.phone) || past.some((c) => c.phone);
  const hasLeadSource = active.some((c) => c.leadSource) || past.some((c) => c.leadSource);

  function ClientRow({ client }: { client: (typeof clients)[number] }) {
    return (
      <Link
        href={`/clients/${client.id}`}
        className="block px-6 py-5 hover:bg-[#F5F2ED] transition-colors group"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-9 h-9 shrink-0 bg-[#F5F2ED] border border-[#E8E2D9] rounded-full flex items-center justify-center text-xs text-[#5C5550] font-medium">
              {client.founderName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm text-[#1A1714] group-hover:text-[#C8B89A] transition-colors font-medium">
                {client.founderName}
              </p>
              <p className="text-xs text-[#5C5550] mt-0.5">{client.businessName}</p>
              {client.instagram && (
                <p className="text-xs text-[#8C8277] mt-0.5">@{client.instagram.replace(/^@/, "")}</p>
              )}
            </div>
          </div>

          {/* Fixed-width columns so every row lines up, regardless of how long
              any one client's email/tier/etc. happens to be. */}
          <div className="flex items-start gap-6 text-right shrink-0">
            <Col label="Tier" value={client.tier} width="w-16" />
            <Col label="Price" value={client.monthlyInvestment ? `$${Math.round(client.monthlyInvestment / 4).toLocaleString("en-AU")}/wk` : "—"} width="w-20" />
            <Col label="Start" value={fmt(client.startDate, { month: "short", year: "numeric" })} width="w-16" />
            {hasEndDate && <Col label="End" value={fmt(client.endDate, { month: "short", year: "numeric" })} width="w-16" />}
            <Col label="Open tasks" value={String(client.tasks.length)} width="w-16" />
            <Col label="Email" value={client.email ?? "—"} width="w-48" />
            {hasPhone && <Col label="Phone" value={client.phone ?? "—"} width="w-28" />}
            {hasLeadSource && <Col label="Lead source" value={client.leadSource ?? "—"} width="w-24" />}
          </div>
        </div>
        {client.address && (
          <p className="text-xs text-[#8C8277] mt-2 pl-[52px]">{client.address}</p>
        )}
      </Link>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-4xl font-thin tracking-widest text-[#1A1714] uppercase">Clients</h1>
          <p className="mt-1.5 text-sm text-[#5C5550]">
            {active.length} active · {past.length} past
          </p>
        </div>
        <Link
          href="/clients/new"
          className="px-5 py-2.5 rounded-2xl bg-[#1A1714] text-[#FAFAF8] text-xs tracking-[0.12em] uppercase hover:bg-[#2C2520] transition-colors"
        >
          Add client
        </Link>
      </div>

      {/* Active clients */}
      {active.length > 0 && (
        <div>
          <h2 className="text-[10px] tracking-[0.2em] uppercase text-[#8C8277] mb-3">
            Active · {active.length}
          </h2>
          <div className="rounded-3xl border border-[#E8E2D9] bg-[#FFFFFF] divide-y divide-[#E8E2D9]"
            style={{ boxShadow: "0 1px 3px rgba(92,71,48,0.08)" }}
          >
            {active.map((client) => (
              <ClientRow key={client.id} client={client} />
            ))}
            <div className="flex items-center justify-end gap-8 px-6 py-4 bg-[#F5F2ED]">
              <div className="text-right">
                <p className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277]">Weekly total</p>
                <p className="text-sm text-[#1A1714] mt-0.5">
                  ${Math.round(active.reduce((sum, c) => sum + ((c.monthlyInvestment ?? 0) * 12) / 52, 0)).toLocaleString("en-AU")}/wk
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277]">Monthly total (MRR)</p>
                <p className="text-sm text-[#1A1714] mt-0.5">
                  ${Math.round(active.reduce((sum, c) => sum + (c.monthlyInvestment ?? 0), 0)).toLocaleString("en-AU")}/mo
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Past clients */}
      {past.length > 0 && (
        <div>
          <h2 className="text-[10px] tracking-[0.2em] uppercase text-[#8C8277] mb-3">
            Past clients · {past.length}
          </h2>
          <div className="rounded-3xl border border-[#E8E2D9] bg-[#F5F2ED] divide-y divide-[#E8E2D9]"
            style={{ boxShadow: "0 1px 3px rgba(92,71,48,0.08)" }}
          >
            {past.map((client) => (
              <ClientRow key={client.id} client={client} />
            ))}
          </div>
        </div>
      )}

      {clients.length === 0 && (
        <div className="rounded-3xl border border-[#E8E2D9] px-8 py-16 text-center">
          <p className="font-display text-2xl font-thin tracking-wide text-[#1A1714]">No clients yet</p>
          <p className="mt-2 text-sm text-[#5C5550]">Add your first client to get started.</p>
        </div>
      )}
    </div>
  );
}
