"use client";

import { useActionState } from "react";
import { createClient } from "@/app/(founder)/clients/new/actions";

const initialState = { error: "" };

export function NewClientForm() {
  const [state, formAction, pending] = useActionState(createClient, initialState);

  return (
    <form action={formAction} className="space-y-6 max-w-xl">
      {/* Basic info */}
      <div>
        <h2 className="text-[10px] tracking-[0.15em] text-[#b0a89e] mb-4">
          Business details
        </h2>
        <div className="space-y-4">
          {[
            { name: "founderName", label: "Founder name", type: "text", required: true },
            { name: "businessName", label: "Business name", type: "text", required: true },
            { name: "email", label: "Email address", type: "email", required: true },
            { name: "phone", label: "Phone", type: "tel", required: false },
            { name: "website", label: "Website", type: "url", required: false },
            { name: "instagram", label: "Instagram", type: "text", required: false },
            { name: "birthday", label: "Birthday", type: "date", required: false },
            { name: "address", label: "Address", type: "text", required: false },
          ].map((field) => (
            <div key={field.name}>
              <label
                htmlFor={field.name}
                className="block text-xs tracking-[0.12em] text-[#7a7268] mb-1.5"
              >
                {field.label}
                {!field.required && (
                  <span className="ml-1 text-[#b0a89e] normal-case tracking-normal">
                    (optional)
                  </span>
                )}
              </label>
              <input
                id={field.name}
                name={field.name}
                type={field.type}
                required={field.required}
                className="w-full rounded-2xl bg-[#FFFFFF] border border-[#EDEBE6] text-[#1A1917] px-4 py-3 text-sm placeholder:text-[#b0a89e] focus:outline-none focus:border-[#C8B89A] transition-colors"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Programme */}
      <div>
        <h2 className="text-[10px] tracking-[0.15em] text-[#b0a89e] mb-4">
          Programme
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs tracking-[0.12em] text-[#7a7268] mb-1.5">
              Package name
            </label>
            <div className="relative">
              <select
                name="packageName"
                defaultValue=""
                className="w-full appearance-none rounded-2xl bg-[#FFFFFF] border border-[#EDEBE6] text-[#1A1917] px-4 py-3 text-sm focus:outline-none focus:border-[#C8B89A] transition-colors cursor-pointer"
              >
                <option value="" disabled>Select a package…</option>
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
              Lead source <span className="normal-case tracking-normal text-[#b0a89e]">(optional)</span>
            </label>
            <input
              name="leadSource"
              type="text"
              placeholder="e.g. Instagram, referral, podcast…"
              className="w-full rounded-2xl bg-[#FFFFFF] border border-[#EDEBE6] text-[#1A1917] px-4 py-3 text-sm placeholder:text-[#b0a89e] focus:outline-none focus:border-[#C8B89A] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs tracking-[0.12em] text-[#7a7268] mb-1.5">
              Start date
            </label>
            <input
              name="startDate"
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
              className="w-full rounded-2xl bg-[#FFFFFF] border border-[#EDEBE6] text-[#1A1917] px-4 py-3 text-sm focus:outline-none focus:border-[#C8B89A] transition-colors"
            />
            <p className="text-[10px] text-[#b0a89e] mt-1.5 leading-relaxed">
              Month and week are calculated automatically from this date.
            </p>
          </div>
          <div>
            <label className="block text-xs tracking-[0.12em] text-[#7a7268] mb-1.5">
              End date <span className="normal-case tracking-normal text-[#b0a89e]">(optional: for past clients)</span>
            </label>
            <input
              name="endDate"
              type="date"
              className="w-full rounded-2xl bg-[#FFFFFF] border border-[#EDEBE6] text-[#1A1917] px-4 py-3 text-sm focus:outline-none focus:border-[#C8B89A] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs tracking-[0.12em] text-[#7a7268] mb-1.5">
              Weekly investment ($) <span className="normal-case tracking-normal text-[#b0a89e]">(optional)</span>
            </label>
            <input
              name="monthlyInvestment"
              type="number"
              step="0.01"
              className="w-full rounded-2xl bg-[#FFFFFF] border border-[#EDEBE6] text-[#1A1917] px-4 py-3 text-sm focus:outline-none focus:border-[#C8B89A] transition-colors"
            />
          </div>

          {/* Invite toggle */}
          <div className="rounded-2xl border border-[#EDEBE6] px-4 py-4 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                name="sendInviteNow"
                className="mt-0.5 accent-[#1A1917] w-4 h-4 shrink-0"
              />
              <div>
                <p className="text-sm text-[#1A1917] group-hover:text-[#7a7268] transition-colors">
                  Send portal invite now
                </p>
                <p className="text-xs text-[#b0a89e] mt-0.5 leading-relaxed">
                  Sends a secure link to set their password. Leave unticked to set up their profile first and send the invite when you're ready.
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Onboarding links */}
      <div>
        <h2 className="text-[10px] tracking-[0.15em] text-[#b0a89e] mb-4">
          Onboarding links
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs tracking-[0.12em] text-[#7a7268] mb-1.5">
              Welcome video URL <span className="text-[#b0a89e] normal-case tracking-normal">(optional: Loom or YouTube)</span>
            </label>
            <input
              name="welcomeVideoUrl"
              type="url"
              placeholder="https://loom.com/share/…"
              className="w-full rounded-2xl bg-[#FFFFFF] border border-[#EDEBE6] text-[#1A1917] px-4 py-3 text-sm placeholder:text-[#b0a89e] focus:outline-none focus:border-[#C8B89A] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs tracking-[0.12em] text-[#7a7268] mb-1.5">
              Kickoff call booking link <span className="text-[#b0a89e] normal-case tracking-normal">(optional: Calendly or similar)</span>
            </label>
            <input
              name="kickoffCallUrl"
              type="url"
              placeholder="https://calendly.com/…"
              className="w-full rounded-2xl bg-[#FFFFFF] border border-[#EDEBE6] text-[#1A1917] px-4 py-3 text-sm placeholder:text-[#b0a89e] focus:outline-none focus:border-[#C8B89A] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Business context */}
      <div>
        <h2 className="text-[10px] tracking-[0.15em] text-[#b0a89e] mb-4">
          Business context
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs tracking-[0.12em] text-[#7a7268] mb-1.5">
              Business overview <span className="text-[#b0a89e] normal-case tracking-normal">(optional)</span>
            </label>
            <textarea
              name="businessContext"
              rows={4}
              className="w-full rounded-2xl bg-[#FFFFFF] border border-[#EDEBE6] text-[#1A1917] px-4 py-3 text-sm focus:outline-none focus:border-[#C8B89A] transition-colors resize-none"
            />
          </div>
          <div>
            <label className="block text-xs tracking-[0.12em] text-[#7a7268] mb-1.5">
              Founder personality notes <span className="text-[#b0a89e] normal-case tracking-normal">(optional)</span>
            </label>
            <textarea
              name="personalityNotes"
              rows={3}
              className="w-full rounded-2xl bg-[#FFFFFF] border border-[#EDEBE6] text-[#1A1917] px-4 py-3 text-sm focus:outline-none focus:border-[#C8B89A] transition-colors resize-none"
            />
          </div>
          <div>
            <label className="block text-xs tracking-[0.12em] text-[#7a7268] mb-1.5">
              Communication style <span className="text-[#b0a89e] normal-case tracking-normal">(optional)</span>
            </label>
            <textarea
              name="communicationStyle"
              rows={2}
              className="w-full rounded-2xl bg-[#FFFFFF] border border-[#EDEBE6] text-[#1A1917] px-4 py-3 text-sm focus:outline-none focus:border-[#C8B89A] transition-colors resize-none"
            />
          </div>
        </div>
      </div>

      {state.error && (
        <p className="text-xs text-[#9B2335]">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="px-6 py-3 rounded-2xl bg-[#1A1917] text-[#FAFAF8] text-xs tracking-[0.15em] font-medium hover:bg-[#2C2520] transition-colors disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create client"}
      </button>
    </form>
  );
}
