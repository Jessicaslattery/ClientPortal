"use client";

import { useActionState } from "react";
import { logWinAction } from "@/app/(client)/wins/actions";

export function WinLogForm() {
  const [state, action, pending] = useActionState(logWinAction, null);

  return (
    <form action={action} className="border border-[#EDEBE6] rounded-2xl p-5 space-y-4">
      <p className="text-[9px] tracking-[0.22em] uppercase text-[#7B746B]">Log a win</p>

      <div>
        <input
          name="title"
          type="text"
          required
          placeholder="What did you achieve?"
          className="w-full border-b border-[#EDEBE6] bg-transparent text-sm text-[#1A1917] py-2 placeholder:text-[#b0a89e] focus:outline-none focus:border-[#8C735A] transition-colors"
        />
      </div>

      <div>
        <textarea
          name="description"
          rows={2}
          placeholder="Any context or detail? (optional)"
          className="w-full border-b border-[#EDEBE6] bg-transparent text-xs text-[#1A1917] py-2 placeholder:text-[#b0a89e] focus:outline-none focus:border-[#8C735A] transition-colors resize-none"
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex gap-2 flex-wrap">
          {["general", "revenue", "milestone", "personal"].map((cat) => (
            <label key={cat} className="cursor-pointer">
              <input type="radio" name="category" value={cat} defaultChecked={cat === "general"} className="sr-only peer" />
              <span className="peer-checked:bg-[#1A1917] peer-checked:text-white text-[10px] tracking-[0.08em] uppercase text-[#7B746B] border border-[#EDEBE6] peer-checked:border-[#1A1917] rounded px-2.5 py-1 transition-all">
                {cat === "general" ? "Win" : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </span>
            </label>
          ))}
        </div>
        <button
          type="submit"
          disabled={pending}
          className="ml-auto px-5 py-2 rounded-xl bg-[#1A1917] text-white text-xs tracking-[0.08em] hover:bg-[#2C2520] transition-colors disabled:opacity-40"
        >
          {pending ? "Saving…" : "Log win"}
        </button>
      </div>

      {state && "success" in state && (
        <p className="text-xs text-[#2D6A4F]">{state.success as string}</p>
      )}
      {state && "error" in state && (
        <p className="text-xs text-[#9B2335]">{state.error as string}</p>
      )}
    </form>
  );
}
