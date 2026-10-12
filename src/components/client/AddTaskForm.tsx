"use client";

import { useActionState, useRef, useEffect } from "react";
import { createClientTask } from "@/app/(client)/tasks/actions";

export function AddTaskForm() {
  const [state, formAction, pending] = useActionState(createClientTask, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction}>
      <div
        className="rounded-3xl border border-[#E8E2D9] bg-[#FFFFFF] px-6 pt-5 pb-5"
        style={{ boxShadow: "0 1px 4px rgba(92,71,48,0.07)" }}
      >
        <p className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277] mb-4">New Task</p>

        <div className="space-y-3">
          <input
            name="title"
            type="text"
            required
            placeholder="Task title"
            className="w-full bg-[#F5F2ED] border border-[#E8E2D9] rounded-2xl px-4 py-3 text-sm text-[#1A1714] placeholder:text-[#8C8277] focus:outline-none focus:border-[#C8B89A]/60 transition-colors"
          />

          {state.error && (
            <p className="text-xs text-[#9B2335]">{state.error}</p>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={pending}
              className="px-5 py-2 rounded-full bg-[#1A1714] text-[#FAFAF8] text-[10px] tracking-[0.12em] uppercase hover:bg-[#2C2520] transition-colors disabled:opacity-40"
            >
              {pending ? "Adding…" : "Add Task"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
