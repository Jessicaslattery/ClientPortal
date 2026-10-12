"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

const initialState = { error: "" };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2EDE4] px-4">
      <div className="w-full max-w-sm">
        {/* Logo / wordmark */}
        <div className="mb-12 text-center">
          <h1 className="font-display text-4xl font-thin tracking-widest tracking-[0.2em] text-[#1A1714] uppercase">
            Pivot Co.
          </h1>
          <p className="mt-2 text-xs tracking-[0.15em] text-[#5C5550] uppercase">
            Portal
          </p>
        </div>

        {/* Form */}
        <form action={formAction} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs tracking-[0.12em] uppercase text-[#5C5550] mb-2"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-2xl bg-[#FFFFFF] border border-[#E8E2D9] text-[#1A1714] px-4 py-3 text-sm placeholder:text-[#8C8277] focus:outline-none focus:border-[#C8B89A] transition-colors"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs tracking-[0.12em] uppercase text-[#5C5550] mb-2"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-2xl bg-[#FFFFFF] border border-[#E8E2D9] text-[#1A1714] px-4 py-3 text-sm placeholder:text-[#8C8277] focus:outline-none focus:border-[#C8B89A] transition-colors"
              placeholder="••••••••"
            />
          </div>

          {state.error && (
            <p className="text-xs text-[#9B2335] py-2">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full mt-2 rounded-2xl bg-[#1A1714] text-[#FAFAF8] px-6 py-3 text-xs tracking-[0.15em] uppercase font-medium hover:bg-[#2C2520] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-[#8C8277] tracking-wider">
          Strategic business refinement for founder-led brands.
        </p>

        <p className="mt-4 text-center text-xs text-[#8C8277]">
          Trouble logging in?{" "}
          <a href="mailto:hello@pivotco.com.au" className="text-[#C8B89A] hover:opacity-70 transition-opacity">
            Message Jess
          </a>
        </p>
      </div>
    </div>
  );
}
