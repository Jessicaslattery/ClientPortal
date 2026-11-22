"use client";

import { useTransition } from "react";
import { deleteAnnouncementAction } from "@/app/(founder)/announcements/actions";

export function DeleteAnnouncementButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => deleteAnnouncementAction(id))}
      disabled={pending}
      className="text-[10px] tracking-[0.08em] text-[#b0a89e] hover:text-[#9B2335] transition-colors shrink-0 disabled:opacity-40"
    >
      {pending ? "…" : "Delete"}
    </button>
  );
}
