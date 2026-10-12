"use client";

import { useState, useActionState, useEffect } from "react";
import {
  founderUpdatePostAction,
  founderAddPostAction,
  founderAddStoryAction,
  founderDeletePostAction,
  founderUpdatePostStatusAction,
  founderReschedulePostAction,
  founderAcknowledgeFeedbackAction,
} from "@/app/(founder)/clients/[id]/content-calendar/actions";
import { CalendarGrid } from "@/components/shared/CalendarGrid";
import { BulkAddPosts } from "@/components/founder/BulkAddPosts";
import {
  POST_TYPES,
  POST_TYPE_LABELS,
  FUNNEL_STAGES,
  FUNNEL_LABELS,
  HOOK_TYPES,
  HOOK_TYPE_LABELS,
  OUTCOMES,
  OUTCOME_LABELS,
  STATUSES,
  STATUS_LABELS,
  STATUS_BG,
  STATUS_TEXT,
  STORY_CONTENT_TYPE,
} from "@/lib/contentPostOptions";

type Post = {
  id: string;
  postDate: string;
  contentType: string;
  funnel: string;
  topic: string;
  hook: string;
  hookType: string;
  desiredOutcome: string | null;
  status: string;
  createdBy: string;
  clientApproved: boolean;
  clientFeedback?: string | null;
  inspirationLink?: string | null;
  planDetails?: string | null;
  likes?: number | null;
  comments?: number | null;
  reposts?: number | null;
  shares?: number | null;
  saves?: number | null;
  views?: number | null;
  reach?: number | null;
  profileVisits?: number | null;
  follows?: number | null;
  metricsLoggedAt?: string | null;
};

const TYPE_COLORS: Record<string, string> = {
  reel: "#2D6A4F",
  carousel: "#5C5550",
  picture: "#B7791F",
  [STORY_CONTENT_TYPE]: "#9B7DB8",
};

function isStory(post: Post) {
  return post.contentType === STORY_CONTENT_TYPE;
}

function Field({ label, value, multiline }: { label: string; value?: string | null; multiline?: boolean }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] mb-0.5">{label}</p>
      {multiline ? (
        <p className="text-sm text-[#1A1714] whitespace-pre-wrap leading-relaxed">{value}</p>
      ) : (
        <p className="text-sm text-[#1A1714]">{value}</p>
      )}
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value?: number | null }) {
  if (value == null) return null;
  return (
    <div className="text-center">
      <p className="font-display text-lg font-light text-[#1A1714]">{value.toLocaleString()}</p>
      <p className="text-[9px] tracking-[0.1em] uppercase text-[#8C8277]">{label}</p>
    </div>
  );
}

function StatusButtons({ post, clientProfileId }: { post: Post; clientProfileId: string }) {
  return (
    <div className="flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
      <span
        className="text-[10px] px-2.5 py-1 rounded-full uppercase tracking-[0.08em]"
        style={{ backgroundColor: STATUS_BG[post.status], color: STATUS_TEXT[post.status] }}
      >
        {STATUS_LABELS[post.status]}
      </span>
      {post.status !== "working_on_it" && (
        <button onClick={() => founderUpdatePostStatusAction(post.id, clientProfileId, "working_on_it")}
          className="text-[10px] px-3 py-1 rounded-full border border-[#E8E2D9] text-[#5C5550] hover:border-[#B7791F] hover:text-[#B7791F] transition-colors uppercase tracking-[0.08em]">
          Working on it
        </button>
      )}
      {post.status !== "complete" && (
        <button onClick={() => founderUpdatePostStatusAction(post.id, clientProfileId, "complete")}
          className="text-[10px] px-3 py-1 rounded-full border border-[#E8E2D9] text-[#5C5550] hover:border-[#2D6A4F] hover:text-[#2D6A4F] transition-colors uppercase tracking-[0.08em]">
          Complete
        </button>
      )}
    </div>
  );
}

function PostRow({
  post,
  clientProfileId,
  defaultExpanded,
}: {
  post: Post;
  clientProfileId: string;
  month: string;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded ?? false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updateState, updateAction, updatePending] = useActionState(founderUpdatePostAction, {});

  const date = new Date(post.postDate);
  const dateStr = date.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" });
  const hasMetrics = post.views != null || post.likes != null || post.reach != null;
  const story = isStory(post);

  return (
    <div className="border-b border-[#E8E2D9] last:border-0">
      {/* Row summary */}
      <div className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-[#F5F2ED] transition-colors"
        onClick={() => { setExpanded(!expanded); setEditing(false); }}
      >
        <div className="w-16 shrink-0 text-center">
          <p className="text-xs text-[#8C8277]">{dateStr.split(" ")[0]}</p>
          <p className="text-lg font-light text-[#1A1714] leading-none">{date.getDate()}</p>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[#1A1714] truncate">{story ? (post.planDetails?.slice(0, 60) || "Story") : (post.topic || "Untitled")}</p>
          <p className="text-xs text-[#8C8277] mt-0.5">
            {story ? "Story" : `${POST_TYPE_LABELS[post.contentType] ?? post.contentType} · ${FUNNEL_LABELS[post.funnel]}`}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {post.clientFeedback && (
            <span className="text-[10px] tracking-[0.08em] uppercase text-[#9B2335] bg-[#FBEAEA] px-2 py-0.5 rounded-full">
              Feedback
            </span>
          )}
          {post.createdBy === "founder" && (
            <span className={`text-[10px] tracking-[0.08em] uppercase px-2 py-0.5 rounded-full ${post.clientApproved ? "text-[#2D6A4F] bg-[#EAF3DE]" : "text-[#B7791F] bg-[#FEF3C7]"}`}>
              {post.clientApproved ? "Approved" : "Awaiting approval"}
            </span>
          )}
          {hasMetrics && (
            <span className="text-[10px] tracking-[0.08em] uppercase text-[#C8B89A] bg-[#F5EEE4] px-2 py-0.5 rounded-full">
              Analytics
            </span>
          )}
          <span
            className="px-2.5 py-1 rounded-full text-[10px] tracking-[0.08em] uppercase font-medium"
            style={{ backgroundColor: STATUS_BG[post.status], color: STATUS_TEXT[post.status] }}
          >
            {STATUS_LABELS[post.status]}
          </span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#8C8277" strokeWidth="1.2"
            className={`transition-transform ${expanded ? "rotate-180" : ""}`}>
            <path d="M2 4l4 4 4-4" />
          </svg>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-6 pt-4 pb-5 bg-[#FDFCFA]">
          {!editing ? (
            <div className="space-y-5">
              {post.clientFeedback && (
                <div className="rounded-2xl border border-[#F0C0C0] bg-[#FBEAEA] p-4 space-y-2">
                  <p className="text-[10px] tracking-[0.1em] uppercase text-[#9B2335]">Client requested changes</p>
                  <p className="text-sm text-[#1A1714] whitespace-pre-wrap">{post.clientFeedback}</p>
                  <button
                    onClick={() => founderAcknowledgeFeedbackAction(post.id, clientProfileId)}
                    className="text-[10px] tracking-[0.08em] uppercase text-[#9B2335] hover:text-[#1A1714] transition-colors"
                  >
                    Mark as addressed
                  </button>
                </div>
              )}

              <div className="space-y-3">
                <StatusButtons post={post} clientProfileId={clientProfileId} />

                <div className="flex gap-3">
                  <button onClick={() => setEditing(true)}
                    className="text-[10px] tracking-[0.08em] uppercase text-[#C8B89A] hover:text-[#1A1714] transition-colors">
                    Edit
                  </button>
                  {deleting ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#9B2335]">Delete this?</span>
                      <button onClick={() => { founderDeletePostAction(post.id, clientProfileId); }}
                        className="text-[10px] text-[#9B2335] uppercase tracking-[0.08em]">Yes, delete</button>
                      <button onClick={() => setDeleting(false)}
                        className="text-[10px] text-[#8C8277] uppercase tracking-[0.08em]">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleting(true)}
                      className="text-[10px] tracking-[0.08em] uppercase text-[#8C8277] hover:text-[#9B2335] transition-colors">
                      Delete
                    </button>
                  )}
                </div>
              </div>

              <div className="border-t border-[#E8E2D9] pt-5 space-y-5">
              {story ? (
                <Field label="Outline" value={post.planDetails} multiline />
              ) : (
                <>
                  <Field label="Topic" value={post.topic} />
                  <Field label={`Hook · ${HOOK_TYPE_LABELS[post.hookType] ?? post.hookType}`} value={post.hook} />
                  {post.inspirationLink && (
                    <div>
                      <p className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] mb-0.5">Inspo</p>
                      <a href={post.inspirationLink} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-[#C8B89A] underline truncate block">{post.inspirationLink}</a>
                    </div>
                  )}
                  <Field label="Details / plan structure" value={post.planDetails} multiline />
                  <div>
                    <p className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] mb-0.5">Outcome they want</p>
                    <p className="text-sm text-[#1A1714]">
                      {post.desiredOutcome ? OUTCOME_LABELS[post.desiredOutcome] : <span className="text-[#8C8277] italic">Not set yet — client chooses</span>}
                    </p>
                  </div>
                </>
              )}

              {/* Analytics */}
              {hasMetrics && (
                <div className="rounded-2xl bg-[#F5F2ED] p-4">
                  <p className="text-[10px] tracking-[0.12em] uppercase text-[#8C8277] mb-3">Analytics</p>
                  <div className="grid grid-cols-4 gap-3">
                    <MetricPill label="Views" value={post.views} />
                    <MetricPill label="Likes" value={post.likes} />
                    <MetricPill label="Comments" value={post.comments} />
                    <MetricPill label="Shares" value={post.shares} />
                    <MetricPill label="Saves" value={post.saves} />
                    <MetricPill label="Reposts" value={post.reposts} />
                    <MetricPill label="Reach" value={post.reach} />
                    <MetricPill label="Follows" value={post.follows} />
                  </div>
                  {post.metricsLoggedAt && (
                    <p className="text-[10px] text-[#8C8277] mt-2">
                      Logged {new Date(post.metricsLoggedAt).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                    </p>
                  )}
                </div>
              )}
              </div>
            </div>
          ) : (
            /* Edit form */
            <form action={updateAction} className="space-y-3" onSubmit={() => setTimeout(() => setEditing(false), 800)}>
              <input type="hidden" name="postId" value={post.id} />
              <input type="hidden" name="clientProfileId" value={clientProfileId} />

              {!story && (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] mb-1 block">Content type</label>
                      <select name="contentType" defaultValue={post.contentType}
                        className="w-full rounded-xl border border-[#E8E2D9] bg-[#FFFFFF] px-3 py-2 text-xs text-[#1A1714] focus:outline-none focus:border-[#C8B89A]">
                        {POST_TYPES.map((t) => <option key={t} value={t}>{POST_TYPE_LABELS[t]}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] mb-1 block">Funnel</label>
                      <select name="funnel" defaultValue={post.funnel}
                        className="w-full rounded-xl border border-[#E8E2D9] bg-[#FFFFFF] px-3 py-2 text-xs text-[#1A1714] focus:outline-none focus:border-[#C8B89A]">
                        {FUNNEL_STAGES.map((f) => <option key={f} value={f}>{FUNNEL_LABELS[f]}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] mb-1 block">Hook type</label>
                      <select name="hookType" defaultValue={post.hookType}
                        className="w-full rounded-xl border border-[#E8E2D9] bg-[#FFFFFF] px-3 py-2 text-xs text-[#1A1714] focus:outline-none focus:border-[#C8B89A]">
                        {HOOK_TYPES.map((h) => <option key={h} value={h}>{HOOK_TYPE_LABELS[h]}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] mb-1 block">Topic</label>
                    <input name="topic" defaultValue={post.topic}
                      className="w-full rounded-xl border border-[#E8E2D9] bg-[#FFFFFF] px-3 py-2 text-xs text-[#1A1714] focus:outline-none focus:border-[#C8B89A]" />
                  </div>
                  <div>
                    <label className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] mb-1 block">Hook</label>
                    <input name="hook" defaultValue={post.hook}
                      className="w-full rounded-xl border border-[#E8E2D9] bg-[#FFFFFF] px-3 py-2 text-xs text-[#1A1714] focus:outline-none focus:border-[#C8B89A]" />
                  </div>
                  <div>
                    <label className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] mb-1 block">Inspiration link</label>
                    <input name="inspirationLink" defaultValue={post.inspirationLink ?? ""}
                      className="w-full rounded-xl border border-[#E8E2D9] bg-[#FFFFFF] px-3 py-2 text-xs text-[#1A1714] focus:outline-none focus:border-[#C8B89A]" />
                  </div>
                  <div>
                    <label className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] mb-1 block">Outcome they want</label>
                    <select name="desiredOutcome" defaultValue={post.desiredOutcome ?? ""}
                      className="w-full rounded-xl border border-[#E8E2D9] bg-[#FFFFFF] px-3 py-2 text-xs text-[#1A1714] focus:outline-none focus:border-[#C8B89A]">
                      <option value="">Not set yet — client chooses</option>
                      {OUTCOMES.map((o) => <option key={o} value={o}>{OUTCOME_LABELS[o]}</option>)}
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] mb-1 block">
                  {story ? "Outline" : "Details / plan structure"}
                </label>
                <textarea
                  name="planDetails"
                  rows={story ? 6 : 4}
                  defaultValue={post.planDetails ?? ""}
                  className="w-full rounded-xl border border-[#E8E2D9] bg-[#FFFFFF] px-3 py-2 text-xs text-[#1A1714] placeholder:text-[#8C8277] focus:outline-none focus:border-[#C8B89A] resize-none"
                />
              </div>

              {updateState.error && <p className="text-xs text-[#9B2335]">{updateState.error}</p>}
              <div className="flex gap-3">
                <button type="submit" disabled={updatePending}
                  className="px-4 py-2 rounded-xl bg-[#1A1714] text-[#FAFAF8] text-xs tracking-[0.1em] uppercase disabled:opacity-50">
                  {updatePending ? "Saving…" : "Save"}
                </button>
                <button type="button" onClick={() => setEditing(false)}
                  className="px-4 py-2 rounded-xl border border-[#E8E2D9] text-[#5C5550] text-xs tracking-[0.1em] uppercase">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

function AddForm({
  clientProfileId,
  month,
  onDone,
}: {
  clientProfileId: string;
  month: string;
  onDone: () => void;
}) {
  const [kind, setKind] = useState<"post" | "story">("post");
  const [addPostState, addPostAction, addPostPending] = useActionState(founderAddPostAction, {});
  const [addStoryState, addStoryAction, addStoryPending] = useActionState(founderAddStoryAction, {});

  useEffect(() => {
    if (addPostState.success || addStoryState.success) onDone();
  }, [addPostState, addStoryState, onDone]);

  const [year, m] = month.split("-").map(Number);
  const daysInMonth = new Date(year, m, 0).getDate();
  const dateProps = {
    type: "date" as const,
    name: "postDate",
    required: true,
    min: `${year}-${String(m).padStart(2, "0")}-01`,
    max: `${year}-${String(m).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`,
    className: "w-full rounded-xl border border-[#E8E2D9] bg-[#FFFFFF] px-3 py-2 text-xs focus:outline-none focus:border-[#C8B89A]",
  };
  const inputClass = "w-full rounded-xl border border-[#E8E2D9] bg-[#FFFFFF] px-3 py-2 text-xs focus:outline-none focus:border-[#C8B89A]";
  const labelClass = "text-[10px] tracking-[0.1em] uppercase text-[#8C8277] mb-1 block";

  return (
    <div className="rounded-2xl border border-[#C8B89A] bg-[#FDFCFA] p-5 space-y-4">
      <div className="flex items-center rounded-xl border border-[#E8E2D9] overflow-hidden w-fit">
        <button type="button" onClick={() => setKind("post")}
          className={`px-3 py-1.5 text-[10px] tracking-[0.1em] uppercase transition-colors ${kind === "post" ? "bg-[#1A1714] text-[#FAFAF8]" : "text-[#5C5550]"}`}>Post</button>
        <button type="button" onClick={() => setKind("story")}
          className={`px-3 py-1.5 text-[10px] tracking-[0.1em] uppercase transition-colors ${kind === "story" ? "bg-[#1A1714] text-[#FAFAF8]" : "text-[#5C5550]"}`}>Story</button>
      </div>

      {kind === "post" ? (
        <form action={addPostAction} className="space-y-3">
          <input type="hidden" name="clientProfileId" value={clientProfileId} />
          <input type="hidden" name="month" value={month} />
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Date *</label>
              <input {...dateProps} />
            </div>
            <div>
              <label className={labelClass}>Content type</label>
              <select name="contentType" className={inputClass}>
                {POST_TYPES.map((t) => <option key={t} value={t}>{POST_TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Funnel</label>
              <select name="funnel" className={inputClass}>
                {FUNNEL_STAGES.map((f) => <option key={f} value={f}>{FUNNEL_LABELS[f]}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Topic</label>
              <input name="topic" required placeholder="What's this piece about?" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Hook type</label>
              <select name="hookType" className={inputClass}>
                {HOOK_TYPES.map((h) => <option key={h} value={h}>{HOOK_TYPE_LABELS[h]}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Hook</label>
            <input name="hook" placeholder="Opening hook or headline" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Inspo (link)</label>
            <input name="inspirationLink" placeholder="https://…" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Details / plan structure</label>
            <textarea name="planDetails" rows={4} placeholder="Structure, talking points, shots…" className={`${inputClass} resize-none`} />
          </div>
          <div>
            <label className={labelClass}>Outcome they want</label>
            <select name="desiredOutcome" defaultValue="" className={inputClass}>
              <option value="">Not set yet — client chooses</option>
              {OUTCOMES.map((o) => <option key={o} value={o}>{OUTCOME_LABELS[o]}</option>)}
            </select>
          </div>
          {addPostState.error && <p className="text-xs text-[#9B2335]">{addPostState.error}</p>}
          <button type="submit" disabled={addPostPending}
            className="px-5 py-2 rounded-xl bg-[#1A1714] text-[#FAFAF8] text-xs tracking-[0.1em] uppercase disabled:opacity-50">
            {addPostPending ? "Adding…" : "Add post"}
          </button>
        </form>
      ) : (
        <form action={addStoryAction} className="space-y-3">
          <input type="hidden" name="clientProfileId" value={clientProfileId} />
          <input type="hidden" name="month" value={month} />
          <div>
            <label className={labelClass}>Date *</label>
            <input {...dateProps} />
          </div>
          <div>
            <label className={labelClass}>Outline</label>
            <textarea name="outline" rows={5} required placeholder="What happens across this story sequence…" className={`${inputClass} resize-none`} />
          </div>
          {addStoryState.error && <p className="text-xs text-[#9B2335]">{addStoryState.error}</p>}
          <button type="submit" disabled={addStoryPending}
            className="px-5 py-2 rounded-xl bg-[#1A1714] text-[#FAFAF8] text-xs tracking-[0.1em] uppercase disabled:opacity-50">
            {addStoryPending ? "Adding…" : "Add story"}
          </button>
        </form>
      )}
    </div>
  );
}

export function FounderContentCalendar({
  posts,
  clientProfileId,
  month,
}: {
  posts: Post[];
  clientProfileId: string;
  month: string;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [view, setView] = useState<"list" | "calendar">("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const byStatus = {
    todo: posts.filter((p) => p.status === "todo").length,
    working_on_it: posts.filter((p) => p.status === "working_on_it").length,
    complete: posts.filter((p) => p.status === "complete").length,
  };

  const totalWithMetrics = posts.filter((p) => p.views != null || p.likes != null).length;

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {STATUSES.map((s) => (
          <div key={s} className="rounded-2xl border border-[#E8E2D9] bg-[#FFFFFF] p-4 text-center">
            <p className="font-display text-2xl font-light" style={{ color: STATUS_TEXT[s] }}>{byStatus[s]}</p>
            <p className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] mt-0.5">{STATUS_LABELS[s]}</p>
          </div>
        ))}
      </div>
      {totalWithMetrics > 0 && (
        <p className="text-xs text-[#8C8277]">{totalWithMetrics} of {posts.length} have analytics logged by client.</p>
      )}

      {/* View toggle + Add */}
      <div className="flex items-center justify-between">
        <div className="flex items-center rounded-xl border border-[#E8E2D9] overflow-hidden">
          <button
            onClick={() => { setView("list"); setSelectedId(null); }}
            className={`px-3 py-1.5 text-[10px] tracking-[0.1em] uppercase transition-colors ${view === "list" ? "bg-[#1A1714] text-[#FAFAF8]" : "text-[#5C5550] hover:text-[#1A1714]"}`}
          >List</button>
          <button
            onClick={() => { setView("calendar"); setSelectedId(null); }}
            className={`px-3 py-1.5 text-[10px] tracking-[0.1em] uppercase transition-colors ${view === "calendar" ? "bg-[#1A1714] text-[#FAFAF8]" : "text-[#5C5550] hover:text-[#1A1714]"}`}
          >Calendar</button>
        </div>
        <div className="flex items-center gap-2">
          {view === "list" && (
            <button onClick={() => { setShowBulk(!showBulk); setShowAdd(false); }}
              className="px-4 py-2 rounded-2xl border border-[#1A1714] text-[#1A1714] text-xs tracking-[0.1em] uppercase hover:bg-[#F5F2ED] transition-colors">
              {showBulk ? "Close bulk add" : "Bulk add"}
            </button>
          )}
          <button onClick={() => { setShowAdd(!showAdd); setShowBulk(false); }}
            className="px-4 py-2 rounded-2xl bg-[#1A1714] text-[#FAFAF8] text-xs tracking-[0.1em] uppercase hover:bg-[#2C2520] transition-colors">
            {showAdd ? "Cancel" : "+ Add"}
          </button>
        </div>
      </div>

      {showBulk && view === "list" && (
        <BulkAddPosts clientProfileId={clientProfileId} month={month} onDone={() => setShowBulk(false)} />
      )}

      {showAdd && (
        <AddForm clientProfileId={clientProfileId} month={month} onDone={() => setShowAdd(false)} />
      )}

      {/* Post list */}
      {view === "list" && (() => {
        const postItems = posts.filter((p) => !isStory(p));
        const storyItems = posts.filter(isStory);
        if (posts.length === 0) {
          return (
            <div className="rounded-3xl border border-[#E8E2D9] bg-[#FFFFFF]" style={{ boxShadow: "0 1px 3px rgba(92,71,48,0.08)" }}>
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-[#8C8277]">Nothing planned for this month.</p>
              </div>
            </div>
          );
        }
        return (
          <div className="space-y-6">
            <div>
              <p className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] mb-2">Posts · {postItems.length}</p>
              <div className="rounded-3xl border border-[#E8E2D9] bg-[#FFFFFF]" style={{ boxShadow: "0 1px 3px rgba(92,71,48,0.08)" }}>
                {postItems.length === 0 ? (
                  <div className="px-6 py-8 text-center">
                    <p className="text-sm text-[#8C8277]">No posts planned for this month.</p>
                  </div>
                ) : (
                  postItems.map((post) => (
                    <PostRow key={post.id} post={post} clientProfileId={clientProfileId} month={month} />
                  ))
                )}
              </div>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] mb-2">Stories · {storyItems.length}</p>
              <div className="rounded-3xl border border-[#E8E2D9] bg-[#FFFFFF]" style={{ boxShadow: "0 1px 3px rgba(92,71,48,0.08)" }}>
                {storyItems.length === 0 ? (
                  <div className="px-6 py-8 text-center">
                    <p className="text-sm text-[#8C8277]">No stories planned for this month.</p>
                  </div>
                ) : (
                  storyItems.map((post) => (
                    <PostRow key={post.id} post={post} clientProfileId={clientProfileId} month={month} />
                  ))
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Calendar grid */}
      {view === "calendar" && (
        <div className="space-y-4">
          <CalendarGrid
            month={month}
            posts={posts}
            onDropPost={(postId, dateKey) => founderReschedulePostAction(postId, clientProfileId, dateKey)}
            renderChip={(post) => {
              const pendingApproval = post.createdBy === "founder" && !post.clientApproved;
              return (
                <button
                  onClick={() => setSelectedId(selectedId === post.id ? null : post.id)}
                  className="w-full text-left"
                >
                  <div
                    className="rounded px-1 py-0.5 text-[9px] leading-tight flex items-center gap-1 hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: `${TYPE_COLORS[post.contentType]}15` }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: TYPE_COLORS[post.contentType] }} />
                    <span className="truncate text-[#1A1714]">{isStory(post) ? "Story" : (post.topic || "Untitled")}</span>
                    {post.clientFeedback && <span className="ml-auto text-[#9B2335] flex-shrink-0" title="Client requested changes">●</span>}
                    {!post.clientFeedback && pendingApproval && <span className="ml-auto text-[#B7791F] flex-shrink-0" title="Awaiting client approval">●</span>}
                    {post.status === "complete" && <span className="ml-auto text-[#2D6A4F] flex-shrink-0">✓</span>}
                  </div>
                </button>
              );
            }}
          />
          {selectedId && posts.find((p) => p.id === selectedId) && (
            <div className="rounded-3xl border border-[#E8E2D9] bg-[#FFFFFF]" style={{ boxShadow: "0 1px 3px rgba(92,71,48,0.08)" }}>
              <PostRow
                post={posts.find((p) => p.id === selectedId)!}
                clientProfileId={clientProfileId}
                month={month}
                defaultExpanded
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
