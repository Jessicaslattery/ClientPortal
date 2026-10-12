"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { POST_TYPES, STATUSES, STORY_CONTENT_TYPE } from "@/lib/contentPostOptions";

type State = { error?: string; success?: boolean };

function isValidDateKey(v: unknown): v is string {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(v);
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
}

export type BulkRow = {
  postDate: string;
  kind: string; // reel | carousel | picture | story
  funnel: string;
  topic: string;
  hook: string;
  hookType: string;
  inspirationLink: string;
  planDetails: string;
};

export type BulkResult = { created?: number; error?: string; rowErrors?: Record<number, string> };

// All-or-nothing: if any row is invalid nothing is saved, so a retry never duplicates.
export async function founderBulkAddPostsAction(clientProfileId: string, rows: BulkRow[]): Promise<BulkResult> {
  await requireAuth("founder");

  if (!Array.isArray(rows) || rows.length === 0) return { error: "Add at least one row." };
  if (rows.length > 100) return { error: "Max 100 rows at a time." };

  const client = await prisma.clientProfile.findUnique({ where: { id: clientProfileId }, select: { id: true } });
  if (!client) return { error: "Client not found." };

  const rowErrors: Record<number, string> = {};
  const data = rows.map((r, i) => {
    const isStory = r.kind === STORY_CONTENT_TYPE;
    if (!isValidDateKey(r.postDate)) rowErrors[i] = "Pick a valid date.";
    else if (!isStory && !(POST_TYPES as readonly string[]).includes(r.kind)) rowErrors[i] = "Pick a type.";
    else if (!isStory && !r.topic?.trim()) rowErrors[i] = "Topic is required.";
    else if (isStory && !r.planDetails?.trim()) rowErrors[i] = "Story needs an outline (Details).";

    return {
      clientProfileId,
      month: (r.postDate ?? "").slice(0, 7),
      postDate: new Date(r.postDate),
      contentType: isStory ? STORY_CONTENT_TYPE : r.kind,
      funnel: (["top", "middle", "bottom"] as string[]).includes(r.funnel) ? r.funnel : "top",
      topic: isStory ? "" : (r.topic ?? "").trim(),
      hook: isStory ? "" : (r.hook ?? "").trim(),
      hookType: r.hookType === "audio" ? "audio" : "visual",
      inspirationLink: isStory ? null : (r.inspirationLink ?? "").trim() || null,
      planDetails: (r.planDetails ?? "").trim() || null,
      status: "todo",
      createdBy: "founder",
      clientApproved: false,
    };
  });

  if (Object.keys(rowErrors).length > 0) return { error: "Fix the highlighted rows — nothing was saved.", rowErrors };

  await prisma.contentPost.createMany({ data });
  revalidatePath(`/clients/${clientProfileId}/content-calendar`);
  return { created: data.length };
}

export async function founderUpdatePostAction(_prev: State, formData: FormData): Promise<State> {
  await requireAuth("founder");

  const postId = formData.get("postId") as string;
  const clientProfileId = formData.get("clientProfileId") as string;

  const post = await prisma.contentPost.findFirst({ where: { id: postId, clientProfileId } });
  if (!post) return { error: "Post not found." };

  const str = (k: string) => (formData.get(k) as string)?.trim() || null;
  const contentTypeRaw = formData.get("contentType") as string;
  const contentType = post.contentType === STORY_CONTENT_TYPE
    ? STORY_CONTENT_TYPE
    : ((POST_TYPES as readonly string[]).includes(contentTypeRaw) ? contentTypeRaw : post.contentType);

  await prisma.contentPost.update({
    where: { id: postId },
    data: {
      contentType,
      funnel: (formData.get("funnel") as string) || post.funnel,
      topic: str("topic") ?? post.topic,
      hook: str("hook") ?? "",
      hookType: (formData.get("hookType") as string) || post.hookType,
      desiredOutcome: str("desiredOutcome"),
      status: (formData.get("status") as string) || post.status,
      inspirationLink: str("inspirationLink"),
      planDetails: str("planDetails"),
      // A substantive founder edit to a founder-planned post needs fresh sign-off.
      ...(post.createdBy === "founder" ? { clientApproved: false, clientFeedback: null } : {}),
    },
  });

  revalidatePath(`/clients/${clientProfileId}/content-calendar`);
  return { success: true };
}

export async function founderAddPostAction(_prev: State, formData: FormData): Promise<State> {
  await requireAuth("founder");

  const clientProfileId = formData.get("clientProfileId") as string;
  const postDateRaw = formData.get("postDate") as string;
  const topic = (formData.get("topic") as string)?.trim() || "";

  if (!isValidDateKey(postDateRaw) || !clientProfileId || !topic) return { error: "Missing required fields." };
  const month = postDateRaw.slice(0, 7);

  const contentTypeRaw = (formData.get("contentType") as string) || "reel";
  const contentType = (POST_TYPES as readonly string[]).includes(contentTypeRaw) ? contentTypeRaw : "reel";

  await prisma.contentPost.create({
    data: {
      clientProfileId,
      month,
      postDate: new Date(postDateRaw),
      contentType,
      funnel: (formData.get("funnel") as string) || "top",
      topic,
      hook: (formData.get("hook") as string)?.trim() || "",
      hookType: (formData.get("hookType") as string) || "visual",
      desiredOutcome: (formData.get("desiredOutcome") as string)?.trim() || null,
      inspirationLink: (formData.get("inspirationLink") as string)?.trim() || null,
      planDetails: (formData.get("planDetails") as string)?.trim() || null,
      status: "todo",
      createdBy: "founder",
      clientApproved: false,
    },
  });

  revalidatePath(`/clients/${clientProfileId}/content-calendar`);
  return { success: true };
}

export async function founderAddStoryAction(_prev: State, formData: FormData): Promise<State> {
  await requireAuth("founder");

  const clientProfileId = formData.get("clientProfileId") as string;
  const postDateRaw = formData.get("postDate") as string;
  const outline = (formData.get("outline") as string)?.trim() || "";

  if (!isValidDateKey(postDateRaw) || !clientProfileId) return { error: "Missing required fields." };
  const month = postDateRaw.slice(0, 7);

  await prisma.contentPost.create({
    data: {
      clientProfileId,
      month,
      postDate: new Date(postDateRaw),
      contentType: STORY_CONTENT_TYPE,
      planDetails: outline,
      status: "todo",
      createdBy: "founder",
      clientApproved: false,
    },
  });

  revalidatePath(`/clients/${clientProfileId}/content-calendar`);
  return { success: true };
}

export async function founderDeletePostAction(postId: string, clientProfileId: string): Promise<void> {
  await requireAuth("founder");
  await prisma.contentPost.deleteMany({ where: { id: postId, clientProfileId } });
  revalidatePath(`/clients/${clientProfileId}/content-calendar`);
}

export async function founderUpdatePostStatusAction(
  postId: string,
  clientProfileId: string,
  status: string
): Promise<void> {
  await requireAuth("founder");
  if (!(STATUSES as readonly string[]).includes(status)) return;
  await prisma.contentPost.update({ where: { id: postId }, data: { status } });
  revalidatePath(`/clients/${clientProfileId}/content-calendar`);
}

export async function founderReschedulePostAction(
  postId: string,
  clientProfileId: string,
  newDateISO: string
): Promise<void> {
  await requireAuth("founder");

  if (!isValidDateKey(newDateISO)) return;
  const postDate = new Date(newDateISO);
  const month = newDateISO.slice(0, 7);

  await prisma.contentPost.updateMany({
    where: { id: postId, clientProfileId },
    data: { postDate, month },
  });

  revalidatePath(`/clients/${clientProfileId}/content-calendar`);
}

export async function founderAcknowledgeFeedbackAction(
  postId: string,
  clientProfileId: string
): Promise<void> {
  await requireAuth("founder");
  await prisma.contentPost.updateMany({
    where: { id: postId, clientProfileId },
    data: { clientFeedback: null },
  });
  revalidatePath(`/clients/${clientProfileId}/content-calendar`);
}
