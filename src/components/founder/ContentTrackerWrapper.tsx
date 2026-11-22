"use client";

import { useRouter } from "next/navigation";
import { ContentTrackerBoard } from "./ContentTrackerBoard";

type ClientRow = {
  clientProfileId: string;
  name: string;
  business: string;
  planStatus: "not_started" | "in_progress" | "done";
  storiesStatus: "not_started" | "in_progress" | "done";
  reelsStatus: "not_started" | "in_progress" | "done";
  notes: string;
};

export function ContentTrackerWrapper({
  initialRows,
  month,
}: {
  initialRows: ClientRow[];
  month: string;
}) {
  const router = useRouter();

  function handleMonthChange(newMonth: string) {
    router.push(`/content-tracker?month=${newMonth}`);
  }

  return (
    <ContentTrackerBoard
      initialRows={initialRows}
      month={month}
      onMonthChange={handleMonthChange}
    />
  );
}
