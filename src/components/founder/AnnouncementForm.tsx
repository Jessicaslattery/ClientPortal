"use client";

import { useActionState } from "react";
import { createAnnouncementAction } from "@/app/(founder)/announcements/actions";

export function AnnouncementForm() {
  const [state, action, pending] = useActionState(createAnnouncementAction, null);

  return (
    <form action={action} className="rounded-2xl border border-[#EDEBE6] p-5 space-y-4">
      <h2 className="text-[10px] tracking-[0.15em] text-[#b0a89e]">New announcement</h2>

      <div>
        <label className="block text-xs tracking-[0.1em] text-[#7a7268] mb-1.5">Title</label>
        <input
          name="title"
          type="text"
          required
          placeholder="e.g. November updates"
          className="w-full rounded-2xl border border-[#EDEBE6] text-[#1A1917] px-4 py-3 text-sm placeholder:text-[#b0a89e] focus:outline-none focus:border-[#C8B89A] transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs tracking-[0.1em] text-[#7a7268] mb-1.5">Message</label>
        <textarea
          name="body"
          rows={4}
          required
          placeholder="What do you want your clients to know?"
          className="w-full rounded-2xl border border-[#EDEBE6] text-[#1A1917] px-4 py-3 text-sm placeholder:text-[#b0a89e] focus:outline-none focus:border-[#C8B89A] transition-colors resize-none"
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <label className="block text-xs tracking-[0.1em] text-[#7a7268] mb-1.5">Audience</label>
          <select
            name="audience"
            defaultValue="all"
            className="rounded-xl border border-[#EDEBE6] text-[#1A1917] px-3 py-2 text-xs focus:outline-none focus:border-[#C8B89A] transition-colors bg-white"
          >
            <option value="all">All clients</option>
            <option value="consulting">Consulting only</option>
            <option value="social">Social media only</option>
            <option value="onboarding">Onboarding</option>
            <option value="active">Active</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="px-6 py-2.5 rounded-2xl bg-[#1A1917] text-white text-xs tracking-[0.1em] hover:bg-[#2C2520] transition-colors disabled:opacity-40 self-end"
        >
          {pending ? "Publishing…" : "Publish"}
        </button>
      </div>

      {state && "error" in state && (
        <p className="text-xs text-[#9B2335]">{state.error as string}</p>
      )}
      {state && "success" in state && (
        <p className="text-xs text-[#2D6A4F]">Announcement published.</p>
      )}
    </form>
  );
}
