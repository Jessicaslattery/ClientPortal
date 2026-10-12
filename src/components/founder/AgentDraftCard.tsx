"use client";

import { useState } from "react";
import { approveDraft, rejectDraft } from "@/app/(founder)/agent-workspace/actions";
import { StatusBadge } from "@/components/ui/StatusBadge";

type Draft = {
  id: string;
  title: string;
  type: string;
  content: string;
  context: string | null;
  clientProfile: { founderName: string; businessName: string };
  createdAt: Date;
};

export function AgentDraftCard({ draft }: { draft: Draft }) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  async function handleApprove() {
    setLoading("approve");
    await approveDraft(draft.id);
  }

  async function handleReject() {
    setLoading("reject");
    await rejectDraft(draft.id);
  }

  return (
    <div className="border border-[#E8E2D9] hover:border-[#E8E2D9] transition-colors">
      {/* Header */}
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <div>
            <p className="text-sm text-[#1A1714]">{draft.title}</p>
            <p className="text-xs text-[#5C5550]">
              {draft.clientProfile.founderName} · {draft.clientProfile.businessName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <StatusBadge label={draft.type.replace(/-/g, " ")} status="gold" />
          <span className="text-xs text-[#8C8277]">
            {new Date(draft.createdAt).toLocaleDateString("en-AU", {
              day: "numeric",
              month: "short",
            })}
          </span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            className={`text-[#8C8277] transition-transform ${expanded ? "rotate-180" : ""}`}
          >
            <path d="M2 4l4 4 4-4" />
          </svg>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-[#E8E2D9]">
          {draft.context && (
            <div className="px-5 py-3 bg-[#FFFFFF]/30 border-b border-[#E8E2D9]">
              <p className="text-[10px] tracking-[0.12em] uppercase text-[#8C8277] mb-1">Context used</p>
              <p className="text-xs text-[#5C5550]">{draft.context}</p>
            </div>
          )}
          <div className="px-5 py-4">
            <p className="text-[10px] tracking-[0.12em] uppercase text-[#8C8277] mb-3">Generated content</p>
            {draft.type === "content_plan" ? (
              (() => {
                let plan: {
                  month?: string;
                  clientName?: string;
                  strategyNote?: string;
                  posts?: Array<{
                    postDate: string;
                    contentType: string;
                    funnel: string;
                    topic: string;
                    hook: string;
                    planDetails: string;
                    desiredOutcome: string;
                  }>;
                } = {};
                try { plan = JSON.parse(draft.content) as typeof plan; } catch { /* show raw */ }
                if (!plan.posts) {
                  return <div className="text-sm text-[#1A1714] whitespace-pre-wrap font-light">{draft.content}</div>;
                }
                return (
                  <div className="space-y-5">
                    {plan.strategyNote && (
                      <div className="rounded-xl bg-[#F5F2ED] border border-[#E8E2D9] p-4">
                        <p className="text-[10px] tracking-[0.12em] uppercase text-[#8C8277] mb-1">Strategy Note</p>
                        <p className="text-sm text-[#1A1714] leading-6">{plan.strategyNote}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] tracking-[0.12em] uppercase text-[#8C8277] mb-3">
                        {plan.posts.length} posts
                      </p>
                      <div className="space-y-2">
                        {plan.posts.map((post, i) => (
                          <div key={i} className="rounded-xl border border-[#E8E2D9] p-3">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <span className="text-[10px] text-[#5C5550]">
                                {new Date(post.postDate).toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })}
                              </span>
                              <span className="text-[#E8E2D9]">·</span>
                              <span className="text-[10px] text-[#8C8277]">{post.contentType}</span>
                              <span className="text-[#E8E2D9]">·</span>
                              <span className="text-[10px] text-[#C8B89A]">{post.funnel}</span>
                              <span className="text-[#E8E2D9]">·</span>
                              <span className="text-[10px] text-[#8C8277]">{post.topic}</span>
                            </div>
                            <p className="text-sm font-medium text-[#1A1714] mb-1">{post.hook}</p>
                            <p className="text-xs text-[#5C5550] leading-5">{post.planDetails}</p>
                            <p className="text-[10px] text-[#8C8277] mt-1.5 italic">Wants: {post.desiredOutcome}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : draft.type === "onboarding-message" ? (
              (() => {
                let parsed: { message?: string; founderNote?: string } = {};
                try { parsed = JSON.parse(draft.content) as typeof parsed; } catch { /* ignore */ }
                return (
                  <div className="space-y-4">
                    <div className="text-sm text-[#1A1714] leading-7 whitespace-pre-wrap font-light">
                      {parsed.message ?? draft.content}
                    </div>
                    {parsed.founderNote && (
                      <div className="rounded-xl bg-[#C8B89A]/10 border border-[#C8B89A]/30 p-4">
                        <p className="text-[10px] tracking-[0.12em] uppercase text-[#C8B89A] mb-2">
                          Jess&apos;s notes · not sent to client
                        </p>
                        <p className="text-sm text-[#5C5550] leading-7 whitespace-pre-wrap font-light">
                          {parsed.founderNote}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()
            ) : (
              <div className="text-sm text-[#1A1714] leading-7 whitespace-pre-wrap font-light">
                {draft.content}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 px-5 py-4 border-t border-[#E8E2D9]">
            <button
              onClick={handleApprove}
              disabled={loading !== null}
              className="px-5 py-2 rounded-2xl bg-[#1A1714] text-[#FAFAF8] text-xs tracking-[0.12em] uppercase hover:bg-[#2C2520] transition-colors disabled:opacity-50"
            >
              {loading === "approve" ? "Approving…" : "Approve & publish"}
            </button>
            <button
              onClick={handleReject}
              disabled={loading !== null}
              className="rounded-2xl px-5 py-2 border border-[#E8E2D9] text-[#5C5550] text-xs tracking-[0.12em] uppercase hover:border-[#9B2335] hover:text-[#9B2335] transition-colors disabled:opacity-50"
            >
              {loading === "reject" ? "Rejecting…" : "Reject"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
