"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type State = { error: string };

export async function submitCheckIn(
  clientProfileId: string,
  monthNumber: number,
  weekNumber: number,
  _prev: State,
  formData: FormData
): Promise<State> {
  const session = await requireAuth("client");

  if (session.clientProfileId !== clientProfileId) {
    return { error: "Not authorised." };
  }

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1);
  weekStart.setHours(0, 0, 0, 0);

  const existing = await prisma.checkIn.findFirst({
    where: { clientProfileId, createdAt: { gte: weekStart } },
  });

  if (existing) {
    return { error: "You have already submitted a check-in this week." };
  }

  const completed        = (formData.get("completed") as string)?.trim();
  const notCompleted     = (formData.get("notCompleted") as string)?.trim();
  const shifted          = (formData.get("shifted") as string)?.trim();
  const stuck            = (formData.get("stuck") as string)?.trim();
  const energyScore      = parseInt(formData.get("energyScore") as string, 10);
  const energyNote       = (formData.get("energyNote") as string)?.trim();
  const bottleneck       = (formData.get("bottleneck") as string)?.trim();
  const clientExperience = (formData.get("clientExperience") as string)?.trim();
  const callNotes        = (formData.get("callNotes") as string)?.trim();
  const preCallNote      = (formData.get("preCallNote") as string)?.trim();

  if (!completed || !notCompleted || !shifted || !stuck || !energyNote || !bottleneck || !clientExperience || !callNotes) {
    return { error: "Please complete all required fields." };
  }

  await prisma.checkIn.create({
    data: {
      clientProfileId,
      monthNumber,
      weekNumber,
      completed,
      notCompleted,
      shifted,
      stuck,
      energyScore: isNaN(energyScore) ? 7 : energyScore,
      energyNote,
      bottleneck,
      clientExperience,
      callNotes,
      preCallNote: preCallNote || null,
    },
  });

  revalidatePath("/check-in");
  revalidatePath("/home");
  redirect("/check-in");
}
