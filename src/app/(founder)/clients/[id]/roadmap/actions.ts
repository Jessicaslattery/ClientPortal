"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

type RoadmapWeek = { week: number; focus: string; priority: string; milestone: string };
type State = { error?: string; success?: boolean };

export async function saveRoadmapAction(_prev: State, formData: FormData): Promise<State> {
  await requireAuth("founder");

  const clientProfileId = formData.get("clientProfileId") as string;
  const roadmapId = (formData.get("roadmapId") as string) || null;
  const title = (formData.get("title") as string)?.trim() || "90-Day Roadmap";
  const startDateStr = formData.get("startDate") as string;
  const phase1Focus = (formData.get("phase1Focus") as string)?.trim() || null;
  const phase2Focus = (formData.get("phase2Focus") as string)?.trim() || null;
  const phase3Focus = (formData.get("phase3Focus") as string)?.trim() || null;

  if (!clientProfileId || !startDateStr) return { error: "Client and start date required." };

  const startDate = new Date(startDateStr);

  const weeks: RoadmapWeek[] = [];
  for (let w = 1; w <= 12; w++) {
    const focus = (formData.get(`week_${w}_focus`) as string)?.trim() || "";
    const priority = (formData.get(`week_${w}_priority`) as string)?.trim() || "";
    const milestone = (formData.get(`week_${w}_milestone`) as string)?.trim() || "";
    weeks.push({ week: w, focus, priority, milestone });
  }

  const data = {
    title,
    startDate,
    phase1Focus,
    phase2Focus,
    phase3Focus,
    weeksJson: JSON.stringify(weeks),
    status: "active",
  };

  if (roadmapId) {
    await prisma.clientRoadmap.update({ where: { id: roadmapId }, data });
  } else {
    await prisma.clientRoadmap.create({ data: { ...data, clientProfileId } });
  }

  revalidatePath(`/clients/${clientProfileId}/roadmap`);
  revalidatePath(`/roadmap`);
  return { success: true };
}
