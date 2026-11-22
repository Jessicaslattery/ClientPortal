import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { computeHealthScore } from "@/lib/health-score";

export default async function ClientsListPage() {
  const session = await requireAuth(["founder", "staff"]);
  const isStaff = session.role === "staff";

  // Staff see only their own clients; founder sees all
  const clients = await prisma.clientProfile.findMany({
    where: isStaff ? { ownedByUserId: session.id } : undefined,
    include: {
      tasks: true,
      goals: true,
      checkIns: { orderBy: { createdAt: "desc" }, take: 10 },
      messages: { orderBy: { createdAt: "desc" }, take: 20 },
      wins: { orderBy: { createdAt: "desc" }, take: 10 },
    },
    orderBy: { founderName: "asc" },
  });

  // Founder also sees staff clients in a separate section
  const staffClients = !isStaff
    ? await prisma.clientProfile.findMany({
        where: { NOT: { ownedByUserId: null } },
        include: {
          tasks: true,
          goals: true,
          checkIns: { orderBy: { createdAt: "desc" }, take: 10 },
          messages: { orderBy: { createdAt: "desc" }, take: 20 },
          wins: { orderBy: { createdAt: "desc" }, take: 10 },
        },
        orderBy: { founderName: "asc" },
      })
    : [];

  // For founder, exclude staff-owned clients from the main list
  const myClients = isStaff ? clients : clients.filter((c) => !c.ownedByUserId);

  const onboarding = myClients.filter((c) => c.isActive && c.currentMonth === 1);
  const active = myClients.filter((c) => c.isActive && c.currentMonth > 1);
  const past = myClients.filter((c) => !c.isActive);

  function fmt(d: Date | null | undefined, opts?: Intl.DateTimeFormatOptions) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-AU", opts ?? { day: "numeric", month: "short", year: "numeric" });
  }

  function Col({ label, value, width }: { label: string; value: string; width: string }) {
    return (
      <div className={width}>
        <p className="text-[10px] tracking-[0.1em] text-[#b0a89e]">{label}</p>
        <p className="text-xs text-[#1A1917] mt-0.5 truncate">{value}</p>
      </div>
    );
  }

  function ClientRow({ client }: { client: (typeof clients)[number] }) {
    const health = computeHealthScore({
      checkIns: client.checkIns.map((c) => ({ createdAt: new Date(c.createdAt) })),
      goals: client.goals.map((g) => ({ progressPercent: g.progressPercent, status: g.status })),
      tasks: client.tasks.map((t) => ({ completed: t.completed, assignedTo: t.assignedTo, createdAt: new Date(t.createdAt) })),
      messages: client.messages.map((m) => ({ createdAt: new Date(m.createdAt) })),
      wins: client.wins.map((w) => ({ createdAt: new Date(w.createdAt) })),
      startDate: new Date(client.startDate),
    });
    const openTasks = client.tasks.filter((t) => !t.completed);

    return (
      <Link
        href={`/clients/${client.id}`}
        className="flex items-center gap-6 px-6 py-4 hover:bg-[#F5F2ED] transition-colors group"
      >
        {/* Avatar + name */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 shrink-0 bg-[#F5F2ED] border border-[#EDEBE6] rounded-full flex items-center justify-center text-xs text-[#7a7268] font-medium">
            {client.founderName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-[#1A1917] group-hover:text-[#8C735A] transition-colors truncate">
              {client.founderName}
            </p>
            <p className="text-xs text-[#b0a89e] truncate">{client.businessName}</p>
          </div>
        </div>

        {/* Package */}
        <div className="hidden sm:block w-24 shrink-0">
          <p className="text-[10px] tracking-[0.1em] text-[#b0a89e]">Package</p>
          <p className="text-xs text-[#1A1917] mt-0.5">{client.tier}</p>
        </div>

        {/* Price */}
        <div className="hidden md:block w-24 shrink-0">
          <p className="text-[10px] tracking-[0.1em] text-[#b0a89e]">Weekly</p>
          <p className="text-xs text-[#1A1917] mt-0.5">
            {client.monthlyInvestment ? `$${Math.round(client.monthlyInvestment / 4).toLocaleString("en-AU")}` : "—"}
          </p>
        </div>

        {/* Duration */}
        <div className="hidden lg:block w-28 shrink-0">
          <p className="text-[10px] tracking-[0.1em] text-[#b0a89e]">{client.isActive ? "Since" : "Duration"}</p>
          <p className="text-xs text-[#1A1917] mt-0.5">
            {(() => {
              const start = new Date(client.startDate);
              const end = client.isActive ? new Date() : (client.endDate ? new Date(client.endDate) : new Date());
              const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
              const months = Math.floor(days / 30.4);
              if (client.isActive) {
                return months >= 2 ? `${months} mo` : days <= 7 ? `${days}d` : `${Math.floor(days / 7)}wk`;
              }
              return months >= 2 ? `${months} mo` : days <= 7 ? `${days}d` : `${Math.floor(days / 7)}wk`;
            })()}
          </p>
        </div>

        {/* Open tasks */}
        <div className="hidden lg:block w-16 shrink-0 text-right">
          <p className="text-[10px] tracking-[0.1em] text-[#b0a89e]">Tasks</p>
          <p className={`text-xs mt-0.5 ${openTasks.length > 0 ? "text-[#8C735A]" : "text-[#b0a89e]"}`}>
            {openTasks.length > 0 ? openTasks.length : "—"}
          </p>
        </div>

        {/* Health score */}
        <div className="w-24 shrink-0 text-right">
          <p className="text-[10px] tracking-[0.1em] text-[#b0a89e]">Health</p>
          <div className="flex items-center justify-end gap-1.5 mt-0.5">
            <span className="text-xs tabular-nums" style={{ color: health.color }}>{health.total}</span>
            <span className="text-[10px]" style={{ color: health.color }}>{health.label}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-[300] tracking-tight text-[#1A1917]">Clients</h1>
          <p className="mt-1.5 text-sm text-[#7a7268]">
            {onboarding.length > 0 ? `${onboarding.length} onboarding · ` : ""}{active.length} active · {past.length} past
          </p>
        </div>
        <Link
          href="/clients/new"
          className="px-5 py-2.5 rounded-2xl bg-[#1A1917] text-[#FAFAF8] text-xs tracking-[0.12em] hover:bg-[#2C2520] transition-colors"
        >
          Add client
        </Link>
      </div>

      {/* Onboarding clients */}
      {onboarding.length > 0 && (
        <div>
          <h2 className="text-[10px] tracking-[0.2em] text-[#b0a89e] mb-3">
            Onboarding · {onboarding.length}
          </h2>
          <div className="rounded-3xl border border-[#C8B89A]/40 bg-[#FDFCF9] divide-y divide-[#EDEBE6]"
            style={{ boxShadow: "0 1px 3px rgba(92,71,48,0.08)" }}
          >
            {onboarding.map((client) => (
              <ClientRow key={client.id} client={client} />
            ))}
          </div>
        </div>
      )}

      {/* Active clients */}
      {active.length > 0 && (
        <div>
          <h2 className="text-[10px] tracking-[0.2em] text-[#b0a89e] mb-3">
            Active · {active.length}
          </h2>
          <div className="rounded-3xl border border-[#EDEBE6] bg-[#FFFFFF] divide-y divide-[#EDEBE6]"
            style={{ boxShadow: "0 1px 3px rgba(92,71,48,0.08)" }}
          >
            {active.map((client) => (
              <ClientRow key={client.id} client={client} />
            ))}
            <div className="flex items-center justify-end gap-8 px-6 py-4 bg-[#F5F2ED]">
              <div className="text-right">
                <p className="text-[10px] tracking-[0.1em] text-[#b0a89e]">Weekly total</p>
                <p className="text-sm text-[#1A1917] mt-0.5">
                  ${Math.round(active.reduce((sum, c) => sum + ((c.monthlyInvestment ?? 0) * 12) / 52, 0)).toLocaleString("en-AU")}/wk
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] tracking-[0.1em] text-[#b0a89e]">Monthly total (MRR)</p>
                <p className="text-sm text-[#1A1917] mt-0.5">
                  ${Math.round(active.reduce((sum, c) => sum + (c.monthlyInvestment ?? 0), 0)).toLocaleString("en-AU")}/mo
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Previous clients */}
      {past.length > 0 && (
        <div>
          <h2 className="text-[10px] tracking-[0.2em] text-[#b0a89e] mb-3">
            Previous clients · {past.length}
          </h2>
          <div className="rounded-3xl border border-[#EDEBE6] bg-[#F5F2ED] divide-y divide-[#EDEBE6]"
            style={{ boxShadow: "0 1px 3px rgba(92,71,48,0.08)" }}
          >
            {past.map((client) => (
              <ClientRow key={client.id} client={client} />
            ))}
          </div>
        </div>
      )}

      {myClients.length === 0 && staffClients.length === 0 && (
        <div className="rounded-3xl border border-[#EDEBE6] px-8 py-16 text-center">
          <p className="text-2xl font-[300] tracking-wide text-[#1A1917]">No clients yet</p>
          <p className="mt-2 text-sm text-[#7a7268]">Add your first client to get started.</p>
        </div>
      )}

      {/* Staff clients: visible to founder only */}
      {!isStaff && staffClients.length > 0 && (
        <div className="mt-8 pt-8 border-t border-[#EDEBE6]">
          <h2 className="text-[10px] tracking-[0.2em] text-[#b0a89e] mb-3">
            Staff clients · {staffClients.length}
          </h2>
          <div className="rounded-3xl border border-[#EDEBE6] bg-[#FDFCF9] divide-y divide-[#EDEBE6]"
            style={{ boxShadow: "0 1px 3px rgba(92,71,48,0.08)" }}
          >
            {staffClients.map((client) => (
              <ClientRow key={client.id} client={client} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
