import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { updateClientAction } from "./actions";
import Link from "next/link";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth("founder");
  const { id } = await params;

  const client = await prisma.clientProfile.findUnique({ where: { id } });
  if (!client) notFound();

  const action = updateClientAction.bind(null, id);

  const fmt = (d: Date | null | undefined) =>
    d ? new Date(d).toISOString().slice(0, 10) : "";

  return (
    <div className="space-y-8 max-w-xl">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Link href={`/clients/${id}`} className="text-xs text-[#8C8277] hover:text-[#5C5550] transition-colors tracking-wide">
            {client.founderName}
          </Link>
          <span className="text-[#E8E2D9]">/</span>
          <span className="text-xs text-[#5C5550]">Edit</span>
        </div>
        <h1 className="font-display text-4xl font-thin tracking-widest text-[#1A1714] uppercase">
          Edit details
        </h1>
      </div>

      <form action={action} className="space-y-8">

        {/* Contact */}
        <section className="space-y-4">
          <h2 className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277]">Contact</h2>
          {[
            { name: "founderName", label: "Founder name", type: "text", value: client.founderName, required: true },
            { name: "businessName", label: "Business name", type: "text", value: client.businessName, required: true },
            { name: "email", label: "Email", type: "email", value: client.email, required: true },
            { name: "phone", label: "Phone", type: "tel", value: client.phone ?? "", required: false },
            { name: "website", label: "Website", type: "url", value: client.website ?? "", required: false },
            { name: "birthday", label: "Birthday", type: "date", value: fmt(client.birthday), required: false },
          ].map((f) => (
            <div key={f.name}>
              <label className="block text-xs tracking-[0.12em] uppercase text-[#5C5550] mb-1.5">
                {f.label}
                {!f.required && <span className="ml-1 normal-case tracking-normal text-[#8C8277]">(optional)</span>}
              </label>
              <input
                name={f.name}
                type={f.type}
                defaultValue={f.value}
                required={f.required}
                className="w-full rounded-2xl bg-[#FFFFFF] border border-[#E8E2D9] text-[#1A1714] px-4 py-3 text-sm placeholder:text-[#8C8277] focus:outline-none focus:border-[#C8B89A] transition-colors"
              />
            </div>
          ))}
        </section>

        {/* Package & billing */}
        <section className="space-y-4">
          <h2 className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277]">Package & billing</h2>
          <div>
            <label className="block text-xs tracking-[0.12em] uppercase text-[#5C5550] mb-1.5">
              Package name <span className="normal-case tracking-normal text-[#8C8277]">(optional)</span>
            </label>
            <input
              name="packageName"
              type="text"
              defaultValue={client.tier}
              placeholder="e.g. Growth Partnership, VIP Intensive…"
              className="w-full rounded-2xl bg-[#FFFFFF] border border-[#E8E2D9] text-[#1A1714] px-4 py-3 text-sm placeholder:text-[#8C8277] focus:outline-none focus:border-[#C8B89A] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs tracking-[0.12em] uppercase text-[#5C5550] mb-1.5">
              Monthly investment ($) <span className="normal-case tracking-normal text-[#8C8277]">(optional)</span>
            </label>
            <input
              name="monthlyInvestment"
              type="number"
              step="0.01"
              defaultValue={client.monthlyInvestment ?? ""}
              className="w-full rounded-2xl bg-[#FFFFFF] border border-[#E8E2D9] text-[#1A1714] px-4 py-3 text-sm focus:outline-none focus:border-[#C8B89A] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs tracking-[0.12em] uppercase text-[#5C5550] mb-1.5">
              Next billing date <span className="normal-case tracking-normal text-[#8C8277]">(optional)</span>
            </label>
            <input
              name="nextBillingDate"
              type="date"
              defaultValue={fmt(client.nextBillingDate)}
              className="w-full rounded-2xl bg-[#FFFFFF] border border-[#E8E2D9] text-[#1A1714] px-4 py-3 text-sm focus:outline-none focus:border-[#C8B89A] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs tracking-[0.12em] uppercase text-[#5C5550] mb-1.5">
              Billing notes <span className="normal-case tracking-normal text-[#8C8277]">(optional)</span>
            </label>
            <textarea
              name="billingNotes"
              rows={2}
              defaultValue={client.billingNotes ?? ""}
              className="w-full rounded-2xl bg-[#FFFFFF] border border-[#E8E2D9] text-[#1A1714] px-4 py-3 text-sm focus:outline-none focus:border-[#C8B89A] transition-colors resize-none"
            />
          </div>
        </section>

        {/* Business context */}
        <section className="space-y-4">
          <h2 className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277]">Business context</h2>
          <div>
            <label className="block text-xs tracking-[0.12em] uppercase text-[#5C5550] mb-1.5">
              Business overview <span className="normal-case tracking-normal text-[#8C8277]">(optional)</span>
            </label>
            <textarea
              name="businessContext"
              rows={5}
              defaultValue={client.businessContext ?? ""}
              className="w-full rounded-2xl bg-[#FFFFFF] border border-[#E8E2D9] text-[#1A1714] px-4 py-3 text-sm focus:outline-none focus:border-[#C8B89A] transition-colors resize-none"
            />
          </div>
          <div>
            <label className="block text-xs tracking-[0.12em] uppercase text-[#5C5550] mb-1.5">
              Personality notes <span className="normal-case tracking-normal text-[#8C8277]">(optional)</span>
            </label>
            <textarea
              name="personalityNotes"
              rows={3}
              defaultValue={client.personalityNotes ?? ""}
              className="w-full rounded-2xl bg-[#FFFFFF] border border-[#E8E2D9] text-[#1A1714] px-4 py-3 text-sm focus:outline-none focus:border-[#C8B89A] transition-colors resize-none"
            />
          </div>
          <div>
            <label className="block text-xs tracking-[0.12em] uppercase text-[#5C5550] mb-1.5">
              Communication style <span className="normal-case tracking-normal text-[#8C8277]">(optional)</span>
            </label>
            <textarea
              name="communicationStyle"
              rows={2}
              defaultValue={client.communicationStyle ?? ""}
              className="w-full rounded-2xl bg-[#FFFFFF] border border-[#E8E2D9] text-[#1A1714] px-4 py-3 text-sm focus:outline-none focus:border-[#C8B89A] transition-colors resize-none"
            />
          </div>
          <div>
            <label className="block text-xs tracking-[0.12em] uppercase text-[#5C5550] mb-1.5">
              Next session focus <span className="normal-case tracking-normal text-[#8C8277]">(optional)</span>
            </label>
            <textarea
              name="nextSessionFocus"
              rows={2}
              defaultValue={client.nextSessionFocus ?? ""}
              className="w-full rounded-2xl bg-[#FFFFFF] border border-[#E8E2D9] text-[#1A1714] px-4 py-3 text-sm focus:outline-none focus:border-[#C8B89A] transition-colors resize-none"
            />
          </div>
        </section>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-[#1A1714] text-[#FAFAF8] text-xs tracking-[0.15em] uppercase font-medium hover:bg-[#2C2520] transition-colors"
          >
            Save changes
          </button>
          <Link
            href={`/clients/${id}`}
            className="px-6 py-3 rounded-2xl border border-[#E8E2D9] text-[#5C5550] text-xs tracking-[0.15em] uppercase hover:border-[#C8B89A] transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
