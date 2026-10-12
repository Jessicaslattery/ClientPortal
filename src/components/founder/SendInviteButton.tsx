"use client";

import { useState, useTransition } from "react";
import { sendClientInviteAction } from "@/app/(founder)/clients/[id]/invite-actions";

export function SendInviteButton({ clientProfileId }: { clientProfileId: string }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: string; error?: string } | null>(null);

  function handleSend() {
    startTransition(async () => {
      const res = await sendClientInviteAction(clientProfileId);
      setResult(res);
    });
  }

  if (result?.success) {
    return (
      <div className="flex items-center gap-2 text-xs text-[#2D6A4F]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F]" />
        {result.success}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <button
        onClick={handleSend}
        disabled={isPending}
        className="w-full py-2 text-[10px] tracking-[0.1em] uppercase text-[#FAFAF8] bg-[#1A1714] rounded-2xl hover:bg-[#2C2520] transition-colors disabled:opacity-40"
      >
        {isPending ? "Sending…" : "Send portal invite"}
      </button>
      {result?.error && (
        <p className="text-[10px] text-[#9B2335]">{result.error}</p>
      )}
    </div>
  );
}
