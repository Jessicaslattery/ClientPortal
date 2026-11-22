"use client";

import { useState, useRef, useActionState, useEffect } from "react";
import { createFounderTaskAction } from "@/app/(founder)/my-tasks/actions";

export function QuickAddTaskButton({ clientProfileId }: { clientProfileId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createFounderTaskAction, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setOpen(false);
    }
  }, [state.success]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-[10px] tracking-[0.08em] text-[#8C735A] hover:opacity-70 transition-opacity"
      >
        + Add task
      </button>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-2 mt-3 p-3 bg-[#F5F3EF] rounded-xl">
      <input type="hidden" name="clientProfileId" value={clientProfileId} />
      <input type="hidden" name="assignedTo" value="founder" />
      <input
        name="title"
        placeholder="Task title"
        required
        className="w-full text-xs bg-white border border-[#EDEBE6] rounded-lg px-3 py-2 focus:outline-none focus:border-[#C8B89A] transition-colors"
        autoFocus
      />
      <div className="flex gap-2">
        <select
          name="category"
          defaultValue="general"
          className="flex-1 text-xs bg-white border border-[#EDEBE6] rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#C8B89A] transition-colors"
        >
          <option value="general">General</option>
          <option value="onboarding">Onboarding</option>
          <option value="content">Content</option>
          <option value="sales">Sales</option>
          <option value="admin">Admin</option>
        </select>
        <select
          name="priority"
          defaultValue="medium"
          className="flex-1 text-xs bg-white border border-[#EDEBE6] rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#C8B89A] transition-colors"
        >
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-[11px] text-[#b0a89e] hover:text-[#7a7268] px-2 py-1"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="text-[11px] bg-[#1A1917] text-white px-3 py-1 rounded-lg hover:bg-[#2a2927] transition-colors disabled:opacity-50"
        >
          {pending ? "Adding…" : "Add"}
        </button>
      </div>
      {state.error && <p className="text-[11px] text-red-500">{state.error}</p>}
    </form>
  );
}
