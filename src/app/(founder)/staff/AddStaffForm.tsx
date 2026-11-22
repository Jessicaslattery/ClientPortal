"use client";

import { useActionState } from "react";

type Action = (
  prev: { error?: string; success?: boolean },
  formData: FormData
) => Promise<{ error?: string; success?: boolean }>;

export function AddStaffForm({ action }: { action: Action }) {
  const [state, formAction, pending] = useActionState(action, {});

  if (state.success) {
    return (
      <p className="text-xs text-green-600 py-2">
        Staff member added.{" "}
        <button className="underline" onClick={() => window.location.reload()}>
          Refresh to see
        </button>
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-wrap gap-3 items-end">
      <div className="flex flex-col gap-1">
        <label className="text-[10px] tracking-[0.1em] text-[#b0a89e]">Name</label>
        <input
          name="name"
          required
          placeholder="Emma"
          className="px-3 py-2 rounded-xl border border-[#EDEBE6] text-xs bg-white text-[#1A1917] outline-none focus:border-[#8C735A] w-40"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[10px] tracking-[0.1em] text-[#b0a89e]">Email</label>
        <input
          name="email"
          type="email"
          required
          placeholder="emma@pivotco.com.au"
          className="px-3 py-2 rounded-xl border border-[#EDEBE6] text-xs bg-white text-[#1A1917] outline-none focus:border-[#8C735A] w-52"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[10px] tracking-[0.1em] text-[#b0a89e]">Password</label>
        <input
          name="password"
          type="password"
          placeholder="Temporary password"
          className="px-3 py-2 rounded-xl border border-[#EDEBE6] text-xs bg-white text-[#1A1917] outline-none focus:border-[#8C735A] w-44"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="px-5 py-2 rounded-xl bg-[#1A1917] text-[#FAFAF8] text-xs tracking-[0.1em] hover:bg-[#2C2520] transition-colors disabled:opacity-50"
      >
        {pending ? "Adding…" : "Add"}
      </button>
      {state.error && <p className="w-full text-xs text-red-500 mt-1">{state.error}</p>}
    </form>
  );
}
