"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { POST_TYPES, STATUSES, STORY_CONTENT_TYPE } from "@/lib/contentPostOptions";

export async function updatePostStatus(postId: string, status: string) {
  const session = await requireAuth("client");
  if (!session.clientProfileId) throw new Error("No client profile");
  if (!(STATUSES as readonly string[]).includes(status)) throw new Error("Invalid status");

  await prisma.contentPost.updateMany({
    where: { id: postId, clientProfileId: session.clientProfileId },
    data: { status },
  });

  revalidatePath("/content-calendar");
}

export async function updatePostOutcome(postId: string, outcome: string) {
  const session = await requireAuth("client");
  if (!session.clientProfileId) throw new Error("No client profile");

  await prisma.contentPost.updateMany({
    where: { id: postId, clientProfileId: session.clientProfileId },
    data: { desiredOutcome: outcome || null },
  });

  revalidatePath("/content-calendar");
}

export async function logPostMetrics(formData: FormData) {
  const session = await requireAuth("client");
  if (!session.clientProfileId) throw new Error("No client profile");

  const postId = formData.get("postId") as string;
  const views = formData.get("views") ? parseInt(formData.get("views") as string, 10) : null;
  const likes = formData.get("likes") ? parseInt(formData.get("likes") as string, 10) : null;
  const shares = formData.get("shares") ? parseInt(formData.get("shares") as string, 10) : null;
  const saves = formData.get("saves") ? parseInt(formData.get("saves") as string, 10) : null;
  const comments = formData.get("comments") ? parseInt(formData.get("comments") as string, 10) : null;
  const reach = formData.get("reach") ? parseInt(formData.get("reach") as string, 10) : null;

  await prisma.contentPost.updateMany({
    where: { id: postId, clientProfileId: session.clientProfileId },
    data: {
      views,
      likes,
      shares,
      saves,
      comments,
      reach,
      status: "complete",
      metricsLoggedAt: new Date(),
    },
  });

  revalidatePath("/content-calendar");
}

export async function addClientPost(formData: FormData) {
  const session = await requireAuth("client");
  if (!session.clientProfileId) throw new Error("No client profile");

  const postDateStr = formData.get("postDate") as string;
  const hook = (formData.get("hook") as string)?.trim() || "";
  const hookType = (formData.get("hookType") as string) || "visual";
  const contentTypeRaw = (formData.get("contentType") as string) || "reel";
  const contentType = (POST_TYPES as readonly string[]).includes(contentTypeRaw) ? contentTypeRaw : "reel";
  const funnel = (formData.get("funnel") as string) || "top";
  const topic = (formData.get("topic") as string)?.trim() || "";
  const desiredOutcome = (formData.get("desiredOutcome") as string)?.trim() || null;
  const inspirationLink = (formData.get("inspirationLink") as string)?.trim() || null;
  const planDetails = (formData.get("planDetails") as string)?.trim() || null;

  if (!postDateStr || !topic) throw new Error("Missing required fields");

  const postDate = new Date(postDateStr);
  const month = `${postDate.getFullYear()}-${String(postDate.getMonth() + 1).padStart(2, "0")}`;

  await prisma.contentPost.create({
    data: {
      clientProfileId: session.clientProfileId,
      month,
      postDate,
      contentType,
      funnel,
      topic,
      hook,
      hookType,
      desiredOutcome,
      inspirationLink,
      planDetails,
      status: "todo",
      createdBy: "client",
      clientApproved: true,
    },
  });

  revalidatePath("/content-calendar");
}

export async function addClientStory(formData: FormData) {
  const session = await requireAuth("client");
  if (!session.clientProfileId) throw new Error("No client profile");

  const postDateStr = formData.get("postDate") as string;
  const outline = (formData.get("outline") as string)?.trim() || "";
  if (!postDateStr) throw new Error("Missing required fields");

  const postDate = new Date(postDateStr);
  const month = `${postDate.getFullYear()}-${String(postDate.getMonth() + 1).padStart(2, "0")}`;

  await prisma.contentPost.create({
    data: {
      clientProfileId: session.clientProfileId,
      month,
      postDate,
      contentType: STORY_CONTENT_TYPE,
      planDetails: outline,
      status: "todo",
      createdBy: "client",
      clientApproved: true,
    },
  });

  revalidatePath("/content-calendar");
}

export async function deleteClientPost(postId: string) {
  const session = await requireAuth("client");
  if (!session.clientProfileId) throw new Error("No client profile");

  // Clients can only delete posts they created themselves — a post Jess planned
  // can only be handled via approve / request changes, never deleted outright.
  await prisma.contentPost.deleteMany({
    where: { id: postId, clientProfileId: session.clientProfileId, createdBy: "client" },
  });

  revalidatePath("/content-calendar");
}

export async function approvePost(postId: string) {
  const session = await requireAuth("client");
  if (!session.clientProfileId) throw new Error("No client profile");

  await prisma.contentPost.updateMany({
    where: { id: postId, clientProfileId: session.clientProfileId },
    data: { clientApproved: true, clientFeedback: null, reviewedAt: new Date() },
  });

  revalidatePath("/content-calendar");
}

export async function requestPostChanges(formData: FormData) {
  const session = await requireAuth("client");
  if (!session.clientProfileId) throw new Error("No client profile");

  const postId = formData.get("postId") as string;
  const feedback = (formData.get("feedback") as string)?.trim();
  if (!postId || !feedback) throw new Error("Missing required fields");

  await prisma.contentPost.updateMany({
    where: { id: postId, clientProfileId: session.clientProfileId },
    data: { clientApproved: false, clientFeedback: feedback, reviewedAt: new Date() },
  });

  revalidatePath("/content-calendar");
}

export async function updatePostDetails(formData: FormData) {
  const session = await requireAuth("client");
  if (!session.clientProfileId) throw new Error("No client profile");

  const postId = formData.get("postId") as string;
  const isStory = formData.get("isStory") === "true";

  if (isStory) {
    await prisma.contentPost.updateMany({
      where: { id: postId, clientProfileId: session.clientProfileId },
      data: {
        planDetails: (formData.get("planDetails") as string)?.trim() || null,
      },
    });
  } else {
    const contentTypeRaw = (formData.get("contentType") as string) || "reel";
    const contentType = (POST_TYPES as readonly string[]).includes(contentTypeRaw) ? contentTypeRaw : "reel";
    await prisma.contentPost.updateMany({
      where: { id: postId, clientProfileId: session.clientProfileId },
      data: {
        contentType,
        funnel: (formData.get("funnel") as string) || "top",
        topic: (formData.get("topic") as string)?.trim() || "",
        hook: (formData.get("hook") as string)?.trim() || "",
        hookType: (formData.get("hookType") as string) || "visual",
        inspirationLink: (formData.get("inspirationLink") as string)?.trim() || null,
        planDetails: (formData.get("planDetails") as string)?.trim() || null,
        desiredOutcome: (formData.get("desiredOutcome") as string)?.trim() || null,
      },
    });
  }

  revalidatePath("/content-calendar");
}

export async function reschedulePost(postId: string, newDateISO: string) {
  const session = await requireAuth("client");
  if (!session.clientProfileId) throw new Error("No client profile");

  const post = await prisma.contentPost.findFirst({
    where: { id: postId, clientProfileId: session.clientProfileId },
  });
  if (!post) return;

  // A founder-planned post still awaiting sign-off can't be silently moved —
  // the client needs to approve or request changes first.
  if (post.createdBy === "founder" && !post.clientApproved) return;

  const postDate = new Date(newDateISO);
  const month = `${postDate.getFullYear()}-${String(postDate.getMonth() + 1).padStart(2, "0")}`;

  await prisma.contentPost.update({
    where: { id: postId },
    data: { postDate, month },
  });

  revalidatePath("/content-calendar");
}

export async function submitAnalytics(formData: FormData) {
  const session = await requireAuth("client");
  if (!session.clientProfileId) throw new Error("No client profile");

  const platform = formData.get("platform") as string;
  const weekOf = formData.get("weekOf") as string;
  const reach = parseInt(formData.get("reach") as string, 10);
  const engagementRate = parseFloat(formData.get("engagementRate") as string);
  const followerGrowth = parseInt(formData.get("followerGrowth") as string, 10);
  const topPost = formData.get("topPost") as string;
  const topFormat = formData.get("topFormat") as string;
  const insights = formData.get("insights") as string;

  if (!platform || !weekOf || isNaN(reach) || isNaN(engagementRate) || isNaN(followerGrowth)) {
    throw new Error("Missing required fields");
  }

  await prisma.contentAnalytics.create({
    data: {
      clientProfileId: session.clientProfileId,
      weekOf: new Date(weekOf),
      platform,
      reach,
      engagementRate,
      followerGrowth,
      topPost: topPost ?? "",
      topFormat: topFormat ?? "",
      insights: insights ?? "",
    },
  });

  revalidatePath("/content-calendar");
}
