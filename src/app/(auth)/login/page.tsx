"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";
import { Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500"],
  variable: "--font-jakarta",
});

const initialState = { error: "" };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <div
      className={`${jakarta.variable} min-h-screen flex items-center justify-center bg-white px-4`}
      style={{ fontFamily: "var(--font-jakarta), sans-serif" }}
    >
      <div className="w-full max-w-sm">
        {/* Wordmark */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center mb-4">
            <img src="/logo.svg" alt="Pivot Co." className="h-12 w-auto" />
          </div>
          <p className="text-[10px] tracking-[0.2em] text-[#b0a89e]">
            Portal
          </p>
        </div>

        {/* Form */}
        <form action={formAction} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-[10px] tracking-[0.14em] text-[#7a7268] mb-2"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-xl bg-white border border-[#EDEBE6] text-[#1A1917] px-4 py-3 text-sm placeholder:text-[#b0a89e] focus:outline-none focus:border-[#8C735A] transition-colors"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-[10px] tracking-[0.14em] text-[#7a7268] mb-2"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-xl bg-white border border-[#EDEBE6] text-[#1A1917] px-4 py-3 text-sm placeholder:text-[#b0a89e] focus:outline-none focus:border-[#8C735A] transition-colors"
              placeholder="••••••••"
            />
          </div>

          {state.error && (
            <p className="text-xs text-[#9B2335] py-1">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full mt-2 rounded-xl bg-[#1A1917] text-white px-6 py-3 text-xs tracking-[0.14em] hover:bg-[#2C2520] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-10 text-center text-[11px] text-[#b0a89e]">
          Strategic business refinement for founder-led brands.
        </p>

        <p className="mt-3 text-center text-[11px] text-[#b0a89e]">
          Trouble logging in?{" "}
          <a href="mailto:jess@pivotco.com.au" className="text-[#8C735A] hover:opacity-70 transition-opacity">
            Email Jess
          </a>
        </p>
      </div>
    </div>
  );
}
