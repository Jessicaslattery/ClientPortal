"use client";

import { useActionState } from "react";
import { setPasswordAction } from "./actions";

export function SetPasswordForm({ token }: { token: string }) {
  const action = setPasswordAction.bind(null, token);
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label
          htmlFor="password"
          className="block text-xs tracking-[0.12em] uppercase text-[#5C5550] mb-1.5"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-2xl bg-[#FFFFFF] border border-[#E8E2D9] text-[#1A1714] px-4 py-3 text-sm placeholder:text-[#8C8277] focus:outline-none focus:border-[#C8B89A] transition-colors"
          placeholder="At least 8 characters"
        />
      </div>

      <div>
        <label
          htmlFor="confirm"
          className="block text-xs tracking-[0.12em] uppercase text-[#5C5550] mb-1.5"
        >
          Confirm password
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-2xl bg-[#FFFFFF] border border-[#E8E2D9] text-[#1A1714] px-4 py-3 text-sm placeholder:text-[#8C8277] focus:outline-none focus:border-[#C8B89A] transition-colors"
          placeholder="Repeat password"
        />
      </div>

      {state.error && (
        <p className="text-xs text-[#9B2335]">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full mt-2 rounded-2xl bg-[#1A1714] text-[#FAFAF8] px-6 py-3 text-xs tracking-[0.15em] uppercase font-medium hover:bg-[#2C2520] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? "Setting up your account…" : "Set password & enter dashboard →"}
      </button>
    </form>
  );
}
