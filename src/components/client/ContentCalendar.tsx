"use client";

import { useState, useActionState, useTransition } from "react";
import {
  updatePostStatus,
  updatePostOutcome,
  updatePostDetails,
  logPostMetrics,
  addClientPost,
  addClientStory,
  approvePost,
  requestPostChanges,
  reschedulePost,
} from "@/app/(client)/content-calendar/actions";
import { CalendarGrid } from "@/components/shared/CalendarGrid";
import { AnalyticsForm } from "@/components/client/AnalyticsForm";
import {
  POST_TYPES,
  POST_TYPE_LABELS,
  FUNNEL_STAGES,
  FUNNEL_LABELS,
  FUNNEL_COLORS,
  HOOK_TYPES,
  HOOK_TYPE_LABELS,
  OUTCOMES,
  OUTCOME_LABELS,
  STATUS_LABELS,
  STATUS_BG,
  STATUS_TEXT,
  STORY_CONTENT_TYPE,
} from "@/lib/contentPostOptions";

type Post = {
  id: string;
  postDate: string;
  month: string;
  contentType: string;
  funnel: string;
  topic: string;
  hook: string;
  hookType: string;
  desiredOutcome: string | null;
  inspirationLink?: string | null;
  planDetails?: string | null;
  status: string;
  createdBy: string;
  clientApproved: boolean;
  clientFeedback?: string | null;
  views?: number | null;
  likes?: number | null;
  shares?: number | null;
  saves?: number | null;
  comments?: number | null;
  reach?: number | null;
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

function dateKey(post: Post) {
  return new Date(post.postDate).toISOString().slice(0, 10);
}

function monthLabel(month: string) {
  const [year, m] = month.split("-").map(Number);
  return new Date(year, m - 1, 1).toLocaleDateString("en-AU", { month: "long", year: "numeric" });
}

const METRICS = [
  { key: "views", label: "Views" },
  { key: "likes", label: "Likes" },
  { key: "comments", label: "Comments" },
  { key: "shares", label: "Shares" },
  { key: "saves", label: "Saves" },
  { key: "reach", label: "Reach" },
] as const;

// ── Status buttons ──────────────────────────────────────────────────────────────

function StatusButtons({ post, onChange }: { post: Post; onChange?: (status: string) => void }) {
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState<string | null>(null);
  const status = optimistic ?? post.status;

  function setStatus(next: string) {
    setOptimistic(next);
    startTransition(async () => {
      await updatePostStatus(post.id, next);
      onChange?.(next);
    });
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span
        className="text-[10px] px-2.5 py-1 rounded-full uppercase tracking-[0.08em]"
        style={{ backgroundColor: STATUS_BG[status], color: STATUS_TEXT[status] }}
      >
        {STATUS_LABELS[status]}
      </span>
      {status !== "working_on_it" && (
        <button disabled={pending} onClick={() => setStatus("working_on_it")}
          className="text-[10px] px-3 py-1 rounded-full border border-[#E8E2D9] text-[#5C5550] hover:border-[#B7791F] hover:text-[#B7791F] transition-colors disabled:opacity-50 uppercase tracking-[0.08em]">
          Working on it
        </button>
      )}
      {status !== "complete" && (
        <button disabled={pending} onClick={() => setStatus("complete")}
          className="text-[10px] px-3 py-1 rounded-full border border-[#E8E2D9] text-[#5C5550] hover:border-[#2D6A4F] hover:text-[#2D6A4F] transition-colors disabled:opacity-50 uppercase tracking-[0.08em]">
          Complete
        </button>
      )}
    </div>
  );
}

// ── Outcome picker — client chooses what this piece is built to drive ─────────

function OutcomePicker({ post }: { post: Post }) {
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState<string | null>(null);
  const value = optimistic ?? post.desiredOutcome ?? "";

  function handleChange(next: string) {
    setOptimistic(next);
    startTransition(async () => { await updatePostOutcome(post.id, next); });
  }

  return (
    <div>
      <p className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] mb-1">Outcome they want</p>
      <select
        value={value}
        disabled={pending}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full rounded-xl border border-[#E8E2D9] px-3 py-2 text-sm text-[#1A1714] bg-white focus:outline-none focus:border-[#C8B89A] disabled:opacity-50"
      >
        <option value="">Not set yet</option>
        {OUTCOMES.map((o) => <option key={o} value={o}>{OUTCOME_LABELS[o]}</option>)}
      </select>
    </div>
  );
}

// ── Metrics panel ─────────────────────────────────────────────────────────────

function MetricsPanel({ post }: { post: Post }) {
  const [showForm, setShowForm] = useState(false);
  const hasMetrics = post.views != null || post.likes != null || post.saves != null;

  const [, formAction, pending] = useActionState(
    async (_prev: { ok: boolean }, fd: FormData) => {
      await logPostMetrics(fd);
      setShowForm(false);
      return { ok: true };
    },
    { ok: false }
  );

  return (
    <div className="border-t border-[#E8E2D9] pt-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277]">Performance</p>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="text-[10px] text-[#C8B89A] hover:text-[#1A1714] transition-colors">
            {hasMetrics ? "Update" : "Log stats"}
          </button>
        )}
      </div>
      {hasMetrics && !showForm && (
        <>
          <div className="grid grid-cols-3 gap-3">
            {METRICS.map(({ key, label }) => {
              const val = post[key as keyof Post] as number | null | undefined;
              if (val == null) return null;
              return (
                <div key={key} className="rounded-xl bg-[#F5F2ED] px-3 py-2.5 text-center">
                  <p className="text-base font-light text-[#1A1714]">{val.toLocaleString("en-AU")}</p>
                  <p className="text-[10px] text-[#8C8277] mt-0.5">{label}</p>
                </div>
              );
            })}
          </div>
          {post.metricsLoggedAt && (
            <p className="text-[10px] text-[#8C8277]">Updated {new Date(post.metricsLoggedAt).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}</p>
          )}
        </>
      )}
      {!hasMetrics && !showForm && <p className="text-sm text-[#8C8277]">No stats logged yet.</p>}
      {showForm && <MetricsForm post={post} formAction={formAction} pending={pending} onCancel={() => setShowForm(false)} />}
    </div>
  );
}

function MetricsForm({ post, formAction, pending, onCancel }: { post: Post; formAction: (fd: FormData) => void; pending: boolean; onCancel: () => void }) {
  return (
    <form action={formAction} className="space-y-4 mt-3">
      <input type="hidden" name="postId" value={post.id} />
      <div className="grid grid-cols-3 gap-3">
        {METRICS.map(({ key, label }) => (
          <div key={key}>
            <label className="text-[10px] text-[#8C8277] block mb-1">{label}</label>
            <input type="number" name={key} min={0}
              defaultValue={(post[key as keyof Post] as number | null | undefined) ?? ""}
              placeholder="0"
              className="w-full rounded-xl border border-[#E8E2D9] px-3 py-2 text-sm text-[#1A1714] bg-white focus:outline-none focus:border-[#C8B89A]" />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending}
          className="px-4 py-2 rounded-xl bg-[#1A1714] text-[#FAFAF8] text-xs tracking-wide hover:bg-[#2a2420] transition-colors disabled:opacity-50">
          {pending ? "Saving…" : "Save Stats"}
        </button>
        <button type="button" onClick={onCancel} className="text-xs text-[#5C5550] hover:text-[#1A1714] transition-colors">Cancel</button>
      </div>
    </form>
  );
}

// ── Approval panel ────────────────────────────────────────────────────────────

function ApprovalPanel({ post }: { post: Post }) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [pending, startTransition] = useTransition();

  if (post.createdBy !== "founder" || post.clientApproved) return null;

  function handleApprove() {
    startTransition(async () => { await approvePost(post.id); });
  }

  function handleRequestChanges(fd: FormData) {
    startTransition(async () => { await requestPostChanges(fd); setShowFeedback(false); });
  }

  return (
    <div className="rounded-2xl border border-[#C8B89A] bg-[#FDF9F0] p-4 space-y-3">
      <p className="text-[10px] tracking-[0.1em] uppercase text-[#B7791F]">Awaiting your approval</p>
      <p className="text-xs text-[#5C5550]">Jess planned this. Approve it to lock it in, or ask for changes.</p>
      {!showFeedback ? (
        <div className="flex items-center gap-3">
          <button onClick={handleApprove} disabled={pending}
            className="px-4 py-2 rounded-xl bg-[#2D6A4F] text-white text-xs tracking-wide hover:bg-[#235a40] transition-colors disabled:opacity-50">
            {pending ? "Saving…" : "Approve"}
          </button>
          <button onClick={() => setShowFeedback(true)}
            className="text-xs text-[#5C5550] hover:text-[#1A1714] transition-colors">
            Request changes
          </button>
        </div>
      ) : (
        <form action={handleRequestChanges} className="space-y-2">
          <input type="hidden" name="postId" value={post.id} />
          <textarea name="feedback" required rows={2} placeholder="What would you like changed?"
            className="w-full rounded-xl border border-[#E8E2D9] px-3 py-2 text-sm text-[#1A1714] bg-white focus:outline-none focus:border-[#C8B89A] resize-none" />
          <div className="flex items-center gap-3">
            <button type="submit" disabled={pending}
              className="px-4 py-2 rounded-xl bg-[#1A1714] text-[#FAFAF8] text-xs tracking-wide hover:bg-[#2a2420] transition-colors disabled:opacity-50">
              {pending ? "Sending…" : "Send feedback"}
            </button>
            <button type="button" onClick={() => setShowFeedback(false)} className="text-xs text-[#5C5550] hover:text-[#1A1714] transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ── Add post / add story forms ────────────────────────────────────────────────

function AddPostForm({ defaultDate, onClose }: { defaultDate: string; onClose: () => void }) {
  const [, startTransition] = useTransition();

  function handleSubmit(fd: FormData) {
    startTransition(async () => {
      await addClientPost(fd);
      onClose();
    });
  }

  const inputClass = "w-full rounded-2xl border border-[#E8E2D9] px-4 py-3 text-sm text-[#1A1714] bg-white focus:outline-none focus:border-[#C8B89A]";
  const labelClass = "text-[10px] tracking-[0.1em] uppercase text-[#8C8277] block mb-1.5";

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Date</label>
          <input type="date" name="postDate" defaultValue={defaultDate} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Content type</label>
          <select name="contentType" defaultValue="reel" className={inputClass}>
            {POST_TYPES.map((t) => <option key={t} value={t}>{POST_TYPE_LABELS[t]}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Funnel</label>
          <select name="funnel" defaultValue="top" className={inputClass}>
            {FUNNEL_STAGES.map((f) => <option key={f} value={f}>{FUNNEL_LABELS[f]}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Topic</label>
          <input type="text" name="topic" required placeholder="What's this piece about?" className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass}>Inspo (link)</label>
        <input type="url" name="inspirationLink" placeholder="https://…" className={inputClass} />
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-4 items-end">
        <div>
          <label className={labelClass}>Hook</label>
          <input type="text" name="hook" placeholder="The opening line or idea that grabs attention" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Type</label>
          <select name="hookType" defaultValue="visual" className={inputClass}>
            {HOOK_TYPES.map((h) => <option key={h} value={h}>{HOOK_TYPE_LABELS[h]}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className={labelClass}>Details / plan structure</label>
        <textarea name="planDetails" rows={6} placeholder="How this piece plays out — structure, talking points, shots…" className={`${inputClass} resize-none`} />
      </div>
      <div>
        <label className={labelClass}>Outcome they want</label>
        <select name="desiredOutcome" defaultValue="" className={inputClass}>
          <option value="">Not set yet</option>
          {OUTCOMES.map((o) => <option key={o} value={o}>{OUTCOME_LABELS[o]}</option>)}
        </select>
      </div>
      <div className="flex items-center gap-3 pt-1">
        <button type="submit" className="px-5 py-2.5 rounded-full bg-[#1A1714] text-[#FAFAF8] text-[10px] tracking-[0.12em] uppercase hover:bg-[#2C2520] transition-colors">
          Add Post
        </button>
        <button type="button" onClick={onClose} className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] hover:text-[#1A1714] transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}

function AddStoryForm({ defaultDate, onClose }: { defaultDate: string; onClose: () => void }) {
  const [, startTransition] = useTransition();

  function handleSubmit(fd: FormData) {
    startTransition(async () => {
      await addClientStory(fd);
      onClose();
    });
  }

  const inputClass = "w-full rounded-2xl border border-[#E8E2D9] px-4 py-3 text-sm text-[#1A1714] bg-white focus:outline-none focus:border-[#C8B89A]";
  const labelClass = "text-[10px] tracking-[0.1em] uppercase text-[#8C8277] block mb-1.5";

  return (
    <form action={handleSubmit} className="space-y-5">
      <div>
        <label className={labelClass}>Date</label>
        <input type="date" name="postDate" defaultValue={defaultDate} required className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Outline</label>
        <textarea name="outline" rows={6} required placeholder="What happens across this story sequence…" className={`${inputClass} resize-none`} />
      </div>
      <div className="flex items-center gap-3 pt-1">
        <button type="submit" className="px-5 py-2.5 rounded-full bg-[#1A1714] text-[#FAFAF8] text-[10px] tracking-[0.12em] uppercase hover:bg-[#2C2520] transition-colors">
          Add Story
        </button>
        <button type="button" onClick={onClose} className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] hover:text-[#1A1714] transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Analytics overview ────────────────────────────────────────────────────────

function AnalyticsOverview({ posts }: { posts: Post[] }) {
  const withMetrics = posts.filter((p) => p.views != null || p.likes != null || p.reach != null);
  if (withMetrics.length === 0) return null;

  const totals = {
    views: withMetrics.reduce((s, p) => s + (p.views ?? 0), 0),
    likes: withMetrics.reduce((s, p) => s + (p.likes ?? 0), 0),
    comments: withMetrics.reduce((s, p) => s + (p.comments ?? 0), 0),
    shares: withMetrics.reduce((s, p) => s + (p.shares ?? 0), 0),
    saves: withMetrics.reduce((s, p) => s + (p.saves ?? 0), 0),
    reach: withMetrics.reduce((s, p) => s + (p.reach ?? 0), 0),
  };

  const completeCount = posts.filter((p) => p.status === "complete").length;
  const engagementTotal = totals.likes + totals.comments + totals.shares + totals.saves;
  const engagementRate = totals.reach > 0 ? ((engagementTotal / totals.reach) * 100).toFixed(1) : null;

  const bestPost = [...withMetrics].sort((a, b) => {
    const score = (p: Post) => (p.views ?? 0) + (p.likes ?? 0) * 5 + (p.saves ?? 0) * 10;
    return score(b) - score(a);
  })[0];

  const statCards = [
    { label: "Total Views", value: totals.views.toLocaleString("en-AU") },
    { label: "Total Reach", value: totals.reach.toLocaleString("en-AU") },
    { label: "Likes", value: totals.likes.toLocaleString("en-AU") },
    { label: "Saves", value: totals.saves.toLocaleString("en-AU") },
    { label: "Comments", value: totals.comments.toLocaleString("en-AU") },
    ...(engagementRate ? [{ label: "Eng. Rate", value: `${engagementRate}%` }] : []),
  ];

  return (
    <div className="rounded-3xl border border-[#E8E2D9] p-6 space-y-6" style={{ boxShadow: "0 1px 4px rgba(92,71,48,0.06)" }}>
      <div>
        <p className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277]">Month Overview</p>
        <p className="text-xs text-[#5C5550] mt-0.5">{withMetrics.length} piece{withMetrics.length !== 1 ? "s" : ""} with stats logged · {completeCount} complete this month</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {statCards.map(({ label, value }) => (
          <div key={label} className="rounded-2xl bg-[#F5F2ED] px-4 py-4 text-center">
            <p className="text-xl font-light text-[#1A1714]">{value}</p>
            <p className="text-[10px] tracking-[0.08em] uppercase text-[#8C8277] mt-1">{label}</p>
          </div>
        ))}
      </div>
      {bestPost && (
        <div className="rounded-2xl bg-[#FAFAF8] border border-[#E8E2D9] px-5 py-4 space-y-2">
          <p className="text-[10px] tracking-[0.12em] uppercase text-[#C8B89A]">Top performing piece</p>
          <p className="text-sm font-medium text-[#1A1714]">{isStory(bestPost) ? "Story" : (bestPost.topic || bestPost.hook || "Untitled")}</p>
          <div className="flex items-center gap-4 flex-wrap">
            {bestPost.views != null && <span className="text-xs text-[#1A1714]">{bestPost.views.toLocaleString("en-AU")} views</span>}
            {bestPost.likes != null && <span className="text-xs text-[#1A1714]">{bestPost.likes.toLocaleString("en-AU")} likes</span>}
            {bestPost.saves != null && <span className="text-xs text-[#1A1714]">{bestPost.saves.toLocaleString("en-AU")} saves</span>}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Post content (no header/close — reused by the day modal and list view) ────

function PostContent({ post }: { post: Post }) {
  const story = isStory(post);
  const [editing, setEditing] = useState(false);
  const [, formAction, saving] = useActionState(
    async (_prev: null, fd: FormData) => {
      await updatePostDetails(fd);
      setEditing(false);
      return null;
    },
    null
  );

  const inputClass = "w-full rounded-xl border border-[#E8E2D9] px-3 py-2 text-sm text-[#1A1714] bg-white focus:outline-none focus:border-[#C8B89A]";
  const labelClass = "text-[10px] tracking-[0.1em] uppercase text-[#8C8277] block mb-1";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: TYPE_COLORS[post.contentType] }}>
            {story ? "Story" : POST_TYPE_LABELS[post.contentType] ?? post.contentType}
          </span>
          {!story && (
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: `${FUNNEL_COLORS[post.funnel]}20`, color: FUNNEL_COLORS[post.funnel] }}>
              {FUNNEL_LABELS[post.funnel]}
            </span>
          )}
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)} className="text-[10px] text-[#C8B89A] hover:text-[#1A1714] transition-colors uppercase tracking-[0.08em]">
            Edit
          </button>
        )}
      </div>

      <StatusButtons post={post} />
      <ApprovalPanel post={post} />

      {editing ? (
        <form action={formAction} className="space-y-4 pt-1">
          <input type="hidden" name="postId" value={post.id} />
          <input type="hidden" name="isStory" value={story ? "true" : "false"} />
          {story ? (
            <div>
              <label className={labelClass}>Outline</label>
              <textarea name="planDetails" rows={6} defaultValue={post.planDetails ?? ""} className={`${inputClass} resize-none`} />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Content type</label>
                  <select name="contentType" defaultValue={post.contentType} className={inputClass}>
                    {POST_TYPES.map((t) => <option key={t} value={t}>{POST_TYPE_LABELS[t]}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Funnel</label>
                  <select name="funnel" defaultValue={post.funnel} className={inputClass}>
                    {FUNNEL_STAGES.map((f) => <option key={f} value={f}>{FUNNEL_LABELS[f]}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Topic</label>
                <input name="topic" type="text" defaultValue={post.topic} className={inputClass} />
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-3">
                <div>
                  <label className={labelClass}>Hook</label>
                  <input name="hook" type="text" defaultValue={post.hook} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Type</label>
                  <select name="hookType" defaultValue={post.hookType} className={inputClass}>
                    {HOOK_TYPES.map((h) => <option key={h} value={h}>{HOOK_TYPE_LABELS[h]}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Inspo (link)</label>
                <input name="inspirationLink" type="url" defaultValue={post.inspirationLink ?? ""} placeholder="https://…" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Details / plan structure</label>
                <textarea name="planDetails" rows={5} defaultValue={post.planDetails ?? ""} placeholder="Structure, talking points, shots…" className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label className={labelClass}>Outcome they want</label>
                <select name="desiredOutcome" defaultValue={post.desiredOutcome ?? ""} className={inputClass}>
                  <option value="">Not set yet</option>
                  {OUTCOMES.map((o) => <option key={o} value={o}>{OUTCOME_LABELS[o]}</option>)}
                </select>
              </div>
            </>
          )}
          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving}
              className="px-4 py-2 rounded-xl bg-[#1A1714] text-[#FAFAF8] text-xs tracking-wide hover:bg-[#2a2420] transition-colors disabled:opacity-50">
              {saving ? "Saving…" : "Save changes"}
            </button>
            <button type="button" onClick={() => setEditing(false)} className="text-xs text-[#5C5550] hover:text-[#1A1714] transition-colors">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          {story ? (
            <div>
              <p className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] mb-1">Outline</p>
              <p className="text-sm text-[#1A1714] whitespace-pre-wrap leading-relaxed">{post.planDetails || "—"}</p>
            </div>
          ) : (
            <>
              {post.topic && (
                <div>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] mb-1">Topic</p>
                  <p className="text-sm text-[#1A1714]">{post.topic}</p>
                </div>
              )}
              {post.hook && (
                <div>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] mb-1">Hook · {HOOK_TYPE_LABELS[post.hookType]}</p>
                  <p className="text-sm font-medium text-[#1A1714]">{post.hook}</p>
                </div>
              )}
              {post.inspirationLink && (
                <div>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] mb-1">Inspo</p>
                  <a href={post.inspirationLink} target="_blank" rel="noopener noreferrer" className="text-sm text-[#C8B89A] hover:opacity-70 break-all underline underline-offset-2">
                    {post.inspirationLink}
                  </a>
                </div>
              )}
              {post.planDetails && (
                <div>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] mb-1">Details / plan structure</p>
                  <p className="text-sm text-[#1A1714] whitespace-pre-wrap leading-relaxed">{post.planDetails}</p>
                </div>
              )}
              <OutcomePicker post={post} />
            </>
          )}
          <MetricsPanel post={post} />
        </>
      )}

    </div>
  );
}

// ── Day modal — pops up the content planned for a clicked calendar date ───────

function DayModal({ date, posts, onClose }: { date: string; posts: Post[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl border border-[#E8E2D9] bg-white p-6 space-y-6"
        style={{ boxShadow: "0 8px 30px rgba(26,23,20,0.15)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm font-medium text-[#1A1714]">
            {new Date(date).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <button onClick={onClose} className="text-[#8C8277] hover:text-[#1A1714] transition-colors text-lg leading-none">×</button>
        </div>
        {posts.map((post, i) => (
          <div key={post.id} className={i > 0 ? "pt-6 border-t border-[#E8E2D9]" : ""}>
            <PostContent post={post} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ContentCalendar({
  allPosts,
  initialMonth,
  availableMonths,
  clientProfileId,
}: {
  allPosts: Post[];
  initialMonth: string;
  availableMonths: string[];
  clientProfileId: string;
}) {
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [modalDate, setModalDate] = useState<string | null>(null);
  const [addForDate, setAddForDate] = useState<string | null>(null);
  const [addKind, setAddKind] = useState<"post" | "story" | null>(null);

  const posts = allPosts.filter((p) => p.month === currentMonth);
  const currentIndex = availableMonths.indexOf(currentMonth);
  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < availableMonths.length - 1;

  const modalPosts = modalDate ? posts.filter((p) => dateKey(p) === modalDate) : [];

  async function handleDropPost(postId: string, key: string) {
    await reschedulePost(postId, key);
  }

  function openAdd(key: string) {
    if (addForDate === key) {
      setAddForDate(null);
      setAddKind(null);
    } else {
      setAddForDate(key);
      setAddKind(null);
      setModalDate(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header: month nav + view toggle */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setCurrentMonth(availableMonths[currentIndex - 1]); setModalDate(null); }}
            disabled={!canGoBack}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-[#E8E2D9] text-[#5C5550] hover:border-[#1A1714] hover:text-[#1A1714] disabled:opacity-30 transition-colors"
          >←</button>
          <h2 className="font-display text-lg font-thin tracking-widest text-[#1A1714] uppercase min-w-[180px] text-center">
            {monthLabel(currentMonth)}
          </h2>
          <button
            onClick={() => { setCurrentMonth(availableMonths[currentIndex + 1]); setModalDate(null); }}
            disabled={!canGoForward}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-[#E8E2D9] text-[#5C5550] hover:border-[#1A1714] hover:text-[#1A1714] disabled:opacity-30 transition-colors"
          >→</button>
        </div>
        <div className="flex items-center rounded-xl border border-[#E8E2D9] overflow-hidden">
          <button
            onClick={() => setView("calendar")}
            className={`px-3 py-1.5 text-[10px] tracking-[0.1em] uppercase transition-colors ${view === "calendar" ? "bg-[#1A1714] text-[#FAFAF8]" : "text-[#5C5550] hover:text-[#1A1714]"}`}
          >Calendar</button>
          <button
            onClick={() => setView("list")}
            className={`px-3 py-1.5 text-[10px] tracking-[0.1em] uppercase transition-colors ${view === "list" ? "bg-[#1A1714] text-[#FAFAF8]" : "text-[#5C5550] hover:text-[#1A1714]"}`}
          >List</button>
        </div>
      </div>

      {/* Calendar grid */}
      {view === "calendar" && (
        <CalendarGrid
          month={currentMonth}
          posts={posts}
          onAddClick={openAdd}
          onDropPost={handleDropPost}
          onDayClick={(key) => { setModalDate(modalDate === key ? null : key); setAddForDate(null); }}
          canDrag={(post) => post.createdBy !== "founder" || post.clientApproved}
          renderChip={(post) => {
            const pendingApproval = post.createdBy === "founder" && !post.clientApproved;
            return (
              <button
                onClick={() => setModalDate(dateKey(post))}
                className="w-full text-left"
              >
                <div
                  className="rounded px-1 py-0.5 text-[9px] leading-tight flex items-center gap-1 hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: `${TYPE_COLORS[post.contentType]}15` }}
                >
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: TYPE_COLORS[post.contentType] }} />
                  <span className="truncate text-[#1A1714]">{isStory(post) ? "Story" : (post.topic.slice(0, 22) || "Untitled")}</span>
                  {pendingApproval && <span className="ml-auto text-[#B7791F] flex-shrink-0" title="Awaiting your approval">●</span>}
                  {!pendingApproval && post.status === "complete" && <span className="ml-auto text-[#2D6A4F] flex-shrink-0">✓</span>}
                </div>
              </button>
            );
          }}
        />
      )}

      {/* Add post/story — opens below calendar when a day "+" is clicked */}
      {addForDate && (
        <div className="rounded-3xl border border-[#E8E2D9] bg-white p-6" style={{ boxShadow: "0 1px 4px rgba(92,71,48,0.07)" }}>
          <p className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277] mb-1">
            {addKind === "story" ? "New Story" : addKind === "post" ? "New Post" : "Add to"} {new Date(addForDate).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          {!addKind && (
            <div className="flex items-center gap-3 mt-4">
              <button onClick={() => setAddKind("post")} className="px-5 py-2.5 rounded-full bg-[#1A1714] text-[#FAFAF8] text-[10px] tracking-[0.12em] uppercase hover:bg-[#2C2520] transition-colors">
                Add Post
              </button>
              <button onClick={() => setAddKind("story")} className="px-5 py-2.5 rounded-full border border-[#E8E2D9] text-[#5C5550] text-[10px] tracking-[0.12em] uppercase hover:border-[#1A1714] hover:text-[#1A1714] transition-colors">
                Add Story
              </button>
            </div>
          )}
          {addKind === "post" && <AddPostForm defaultDate={addForDate} onClose={() => { setAddForDate(null); setAddKind(null); }} />}
          {addKind === "story" && <AddStoryForm defaultDate={addForDate} onClose={() => { setAddForDate(null); setAddKind(null); }} />}
        </div>
      )}

      {/* List view */}
      {view === "list" && <ListView posts={posts} />}

      {/* Day modal — pops up when a calendar date with content is clicked */}
      {modalDate && modalPosts.length > 0 && (
        <DayModal date={modalDate} posts={modalPosts} onClose={() => setModalDate(null)} />
      )}

      {/* Analytics overview */}
      <AnalyticsOverview posts={posts} />
      <AnalyticsForm clientProfileId={clientProfileId} />
    </div>
  );
}

// ── List view ─────────────────────────────────────────────────────────────────

function ListView({ posts }: { posts: Post[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const sorted = [...posts].sort((a, b) => new Date(a.postDate).getTime() - new Date(b.postDate).getTime());

  const byWeek = new Map<string, Post[]>();
  for (const post of sorted) {
    const d = new Date(post.postDate);
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const key = monday.toISOString().slice(0, 10);
    if (!byWeek.has(key)) byWeek.set(key, []);
    byWeek.get(key)!.push(post);
  }

  return (
    <div className="space-y-6">
      {Array.from(byWeek.entries()).map(([weekStart, weekPosts]) => {
        const weekDate = new Date(weekStart);
        const weekEnd = new Date(weekDate);
        weekEnd.setDate(weekDate.getDate() + 6);
        const weekLabel = `${weekDate.toLocaleDateString("en-AU", { day: "numeric", month: "short" })} – ${weekEnd.toLocaleDateString("en-AU", { day: "numeric", month: "short" })}`;
        return (
          <div key={weekStart}>
            <p className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277] mb-3">{weekLabel}</p>
            <div className="rounded-2xl border border-[#E8E2D9] divide-y divide-[#E8E2D9]">
              {weekPosts.map((post) => {
                const isExpanded = expandedId === post.id;
                const story = isStory(post);
                return (
                  <div key={post.id}>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : post.id)}
                      className="w-full text-left px-5 py-5 hover:bg-[#F5F2ED] transition-colors"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-[#5C5550]">
                              {new Date(post.postDate).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })}
                            </span>
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded-full text-white"
                              style={{ backgroundColor: TYPE_COLORS[post.contentType] }}
                            >{story ? "Story" : POST_TYPE_LABELS[post.contentType] ?? post.contentType}</span>
                            {!story && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${FUNNEL_COLORS[post.funnel]}20`, color: FUNNEL_COLORS[post.funnel] }}>
                                {FUNNEL_LABELS[post.funnel]}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-[#1A1714] font-medium leading-snug">{story ? (post.planDetails?.slice(0, 60) || "Story") : (post.hook || "Untitled")}</p>
                        </div>
                        <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-[0.08em]" style={{ backgroundColor: STATUS_BG[post.status], color: STATUS_TEXT[post.status] }}>
                          {STATUS_LABELS[post.status]}
                        </span>
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="px-5 pb-5 border-t border-[#E8E2D9] bg-[#FAFAF8] pt-5">
                        <PostContent post={post} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

