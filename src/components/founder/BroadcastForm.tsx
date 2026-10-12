"use client";

import { useActionState, useState } from "react";
import { broadcastMessageAction } from "@/app/(founder)/actions";

const initial: { error?: string; success?: string } = {};

export function BroadcastForm() {
  const [state, action, pending] = useActionState(broadcastMessageAction, initial);
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="rounded-3xl border border-[#E8E2D9] p-5">
      <p className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277] mb-4">
        Send update to all clients
      </p>
      <form action={action} className="space-y-3">
        <textarea
          name="content"
          rows={3}
          placeholder="Write your update…"
          onChange={() => setConfirming(false)}
          className="w-full bg-[#FFFFFF] border border-[#E8E2D9] rounded-2xl px-4 py-3 text-sm text-[#1A1714] placeholder-[#8C8277] resize-none focus:outline-none focus:border-[#C8B89A]/40 transition-colors"
        />
        <div className="flex items-center justify-between">
          <div>
            {state.error && <p className="text-xs text-[#9B2335]">{state.error}</p>}
            {state.success && <p className="text-xs text-[#2D6A4F]">{state.success}</p>}
          </div>
          {!confirming ? (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="px-4 py-2 text-xs tracking-[0.1em] uppercase bg-[#1A1714] text-[#FAFAF8] rounded-2xl hover:bg-[#2C2520] transition-colors"
            >
              Send to all
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <p className="text-xs text-[#B7791F]">Send to all clients?</p>
              <button
                type="submit"
                disabled={pending}
                className="px-4 py-2 text-xs tracking-[0.1em] uppercase bg-[#9B2335] text-[#FAFAF8] rounded-2xl hover:bg-[#7a1c29] disabled:opacity-40 transition-colors"
              >
                {pending ? "Sending…" : "Confirm send"}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="text-xs text-[#8C8277] hover:text-[#1A1714] transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
