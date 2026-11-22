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
          <Link href={`/clients/${id}`} className="text-xs text-[#b0a89e] hover:text-[#7a7268] transition-colors tracking-wide">
            {client.founderName}
          </Link>
          <span className="text-[#EDEBE6]">/</span>
          <span className="text-xs text-[#7a7268]">Edit</span>
        </div>
        <h1 className="text-4xl font-[300] tracking-tight text-[#1A1917]">
          Edit details
        </h1>
      </div>

      <form action={action} className="space-y-8">

        {/* Contact */}
        <section className="space-y-4">
          <h2 className="text-[10px] tracking-[0.15em] text-[#b0a89e]">Contact</h2>
          {[
            { name: "founderName", label: "Founder name", type: "text", value: client.founderName, required: true },
            { name: "businessName", label: "Business name", type: "text", value: client.businessName, required: true },
            { name: "email", label: "Email", type: "email", value: client.email, required: true },
            { name: "phone", label: "Phone", type: "tel", value: client.phone ?? "", required: false },
            { name: "website", label: "Website", type: "url", value: client.website ?? "", required: false },
            { name: "instagram", label: "Instagram", type: "text", value: client.instagram ?? "", required: false },
            { name: "address", label: "Address", type: "text", value: client.address ?? "", required: false },
            { name: "birthday", label: "Birthday", type: "date", value: fmt(client.birthday), required: false },
          ].map((f) => (
            <div key={f.name}>
              <label className="block text-xs tracking-[0.12em] text-[#7a7268] mb-1.5">
                {f.label}
                {!f.required && <span className="ml-1 normal-case tracking-normal text-[#b0a89e]">(optional)</span>}
              </label>
              <input
                name={f.name}
                type={f.type}
                defaultValue={f.value}
                required={f.required}
                className="w-full rounded-2xl bg-[#FFFFFF] border border-[#EDEBE6] text-[#1A1917] px-4 py-3 text-sm placeholder:text-[#b0a89e] focus:outline-none focus:border-[#C8B89A] transition-colors"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs tracking-[0.12em] text-[#7a7268] mb-1.5">
              Lead source <span className="normal-case tracking-normal text-[#b0a89e]">(optional)</span>
            </label>
            <input
              name="leadSource"
              type="text"
              defaultValue={client.leadSource ?? ""}
              placeholder="e.g. Instagram, referral, podcast…"
              className="w-full rounded-2xl bg-[#FFFFFF] border border-[#EDEBE6] text-[#1A1917] px-4 py-3 text-sm placeholder:text-[#b0a89e] focus:outline-none focus:border-[#C8B89A] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs tracking-[0.12em] text-[#7a7268] mb-1.5">
              Start date <span className="normal-case tracking-normal text-[#b0a89e]">(optional)</span>
            </label>
            <input
              name="startDate"
              type="date"
              defaultValue={fmt(client.startDate)}
              className="w-full rounded-2xl bg-[#FFFFFF] border border-[#EDEBE6] text-[#1A1917] px-4 py-3 text-sm focus:outline-none focus:border-[#C8B89A] transition-colors"
            />
          </div>
        </section>

        {/* Package & billing */}
        <section className="space-y-4">
          <h2 className="text-[10px] tracking-[0.15em] text-[#b0a89e]">Package & billing</h2>
          <div>
            <label className="block text-xs tracking-[0.12em] text-[#7a7268] mb-1.5">
              Package name <span className="normal-case tracking-normal text-[#b0a89e]">(optional)</span>
            </label>
            <div className="relative">
              <select
                name="packageName"
                defaultValue={client.tier}
                className="w-full appearance-none rounded-2xl bg-[#FFFFFF] border border-[#EDEBE6] text-[#1A1917] px-4 py-3 text-sm focus:outline-none focus:border-[#C8B89A] transition-colors cursor-pointer"
              >
                <option value="Growth Partnership">Growth Partnership</option>
                <option value="Socials Strategy">Socials Strategy</option>
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                <svg width="12" height="7" viewBox="0 0 12 7" fill="none">
                  <path d="M1 1L6 6L11 1" stroke="#8C735A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs tracking-[0.12em] text-[#7a7268] mb-1.5">
              Weekly investment ($) <span className="normal-case tracking-normal text-[#b0a89e]">(optional)</span>
            </label>
            <input
              name="monthlyInvestment"
              type="number"
              step="0.01"
              defaultValue={client.monthlyInvestment ? Math.round(client.monthlyInvestment / 4) : ""}
              className="w-full rounded-2xl bg-[#FFFFFF] border border-[#EDEBE6] text-[#1A1917] px-4 py-3 text-sm focus:outline-none focus:border-[#C8B89A] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs tracking-[0.12em] text-[#7a7268] mb-1.5">
              Next billing date <span className="normal-case tracking-normal text-[#b0a89e]">(optional)</span>
            </label>
            <input
              name="nextBillingDate"
              type="date"
              defaultValue={fmt(client.nextBillingDate)}
              className="w-full rounded-2xl bg-[#FFFFFF] border border-[#EDEBE6] text-[#1A1917] px-4 py-3 text-sm focus:outline-none focus:border-[#C8B89A] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs tracking-[0.12em] text-[#7a7268] mb-1.5">
              Billing notes <span className="normal-case tracking-normal text-[#b0a89e]">(optional)</span>
            </label>
            <textarea
              name="billingNotes"
              rows={2}
              defaultValue={client.billingNotes ?? ""}
              className="w-full rounded-2xl bg-[#FFFFFF] border border-[#EDEBE6] text-[#1A1917] px-4 py-3 text-sm focus:outline-none focus:border-[#C8B89A] transition-colors resize-none"
            />
          </div>
        </section>

        {/* Onboarding links */}
        <section className="space-y-4">
          <h2 className="text-[10px] tracking-[0.15em] text-[#b0a89e]">Onboarding links</h2>
          <div>
            <label className="block text-xs tracking-[0.12em] text-[#7a7268] mb-1.5">
              Welcome video URL <span className="normal-case tracking-normal text-[#b0a89e]">(optional: Loom or YouTube)</span>
            </label>
            <input
              name="welcomeVideoUrl"
              type="url"
              defaultValue={client.welcomeVideoUrl ?? ""}
              placeholder="https://loom.com/share/…"
              className="w-full rounded-2xl bg-[#FFFFFF] border border-[#EDEBE6] text-[#1A1917] px-4 py-3 text-sm placeholder:text-[#b0a89e] focus:outline-none focus:border-[#C8B89A] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs tracking-[0.12em] text-[#7a7268] mb-1.5">
              Kickoff call booking link <span className="normal-case tracking-normal text-[#b0a89e]">(optional: Calendly or similar)</span>
            </label>
            <input
              name="kickoffCallUrl"
              type="url"
              defaultValue={client.kickoffCallUrl ?? ""}
              placeholder="https://calendly.com/…"
              className="w-full rounded-2xl bg-[#FFFFFF] border border-[#EDEBE6] text-[#1A1917] px-4 py-3 text-sm placeholder:text-[#b0a89e] focus:outline-none focus:border-[#C8B89A] transition-colors"
            />
          </div>
        </section>

        {/* Business context */}
        <section className="space-y-4">
          <h2 className="text-[10px] tracking-[0.15em] text-[#b0a89e]">Business context</h2>
          <div>
            <label className="block text-xs tracking-[0.12em] text-[#7a7268] mb-1.5">
              Business overview <span className="normal-case tracking-normal text-[#b0a89e]">(optional)</span>
            </label>
            <textarea
              name="businessContext"
              rows={5}
              defaultValue={client.businessContext ?? ""}
              className="w-full rounded-2xl bg-[#FFFFFF] border border-[#EDEBE6] text-[#1A1917] px-4 py-3 text-sm focus:outline-none focus:border-[#C8B89A] transition-colors resize-none"
            />
          </div>
          <div>
            <label className="block text-xs tracking-[0.12em] text-[#7a7268] mb-1.5">
              Personality notes <span className="normal-case tracking-normal text-[#b0a89e]">(optional)</span>
            </label>
            <textarea
              name="personalityNotes"
              rows={3}
              defaultValue={client.personalityNotes ?? ""}
              className="w-full rounded-2xl bg-[#FFFFFF] border border-[#EDEBE6] text-[#1A1917] px-4 py-3 text-sm focus:outline-none focus:border-[#C8B89A] transition-colors resize-none"
            />
          </div>
          <div>
            <label className="block text-xs tracking-[0.12em] text-[#7a7268] mb-1.5">
              Communication style <span className="normal-case tracking-normal text-[#b0a89e]">(optional)</span>
            </label>
            <textarea
              name="communicationStyle"
              rows={2}
              defaultValue={client.communicationStyle ?? ""}
              className="w-full rounded-2xl bg-[#FFFFFF] border border-[#EDEBE6] text-[#1A1917] px-4 py-3 text-sm focus:outline-none focus:border-[#C8B89A] transition-colors resize-none"
            />
          </div>
          <div>
            <label className="block text-xs tracking-[0.12em] text-[#7a7268] mb-1.5">
              Next session focus <span className="normal-case tracking-normal text-[#b0a89e]">(optional)</span>
            </label>
            <textarea
              name="nextSessionFocus"
              rows={2}
              defaultValue={client.nextSessionFocus ?? ""}
              className="w-full rounded-2xl bg-[#FFFFFF] border border-[#EDEBE6] text-[#1A1917] px-4 py-3 text-sm focus:outline-none focus:border-[#C8B89A] transition-colors resize-none"
            />
          </div>
        </section>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-[#1A1917] text-[#FAFAF8] text-xs tracking-[0.15em] font-medium hover:bg-[#2C2520] transition-colors"
          >
            Save changes
          </button>
          <Link
            href={`/clients/${id}`}
            className="px-6 py-3 rounded-2xl border border-[#EDEBE6] text-[#7a7268] text-xs tracking-[0.15em] hover:border-[#C8B89A] transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
