"use client";

import { useState, useRef, useEffect, useActionState } from "react";
import { useRouter } from "next/navigation";
import { sendFounderMessageAction } from "@/app/(founder)/inbox/actions";

const EMOJIS = [
  "😊","😂","🙏","❤️","🔥","✅","👍","🎉","😍","🤔",
  "💪","🙌","😭","👏","💯","🚀","😅","🤝","💡","📌",
  "⭐","✨","😎","🥳","😬","😮","🤩","💬","📈","🎯",
];

type Convo = {
  clientId: string;
  founderName: string;
  businessName: string;
  lastMessage: { content: string; senderRole: string; createdAt: string } | null;
  unreadCount: number;
};

type Message = {
  id: string;
  content: string;
  senderRole: string;
  createdAt: string;
};

export function FounderMessagesView({
  conversations,
  activeClientId,
  activeMessages,
  activeClientName,
}: {
  conversations: Convo[];
  activeClientId: string | null;
  activeMessages: Message[];
  activeClientName: string | null;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState(activeMessages);
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [state, formAction, pending] = useActionState(sendFounderMessageAction, {});

  useEffect(() => {
    setMessages(activeMessages);
  }, [activeClientId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (state.success) setValue("");
  }, [state]);

  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" });

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });

  const formatRelative = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return formatTime(date);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return d.toLocaleDateString("en-AU", { weekday: "short" });
    return d.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
  };

  // Group messages by date
  const grouped = messages.reduce<{ date: string; msgs: Message[] }[]>((acc, msg) => {
    const dateStr = formatDate(msg.createdAt);
    const last = acc[acc.length - 1];
    if (last?.date === dateStr) last.msgs.push(msg);
    else acc.push({ date: dateStr, msgs: [msg] });
    return acc;
  }, []);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim() || sending || !activeClientId) return;
    setSending(true);
    const text = value.trim();
    setValue("");
    setMessages((prev) => [
      ...prev,
      { id: `temp-${Date.now()}`, content: text, senderRole: "founder", createdAt: new Date().toISOString() },
    ]);
    const fd = new FormData();
    fd.set("clientProfileId", activeClientId);
    fd.set("content", text);
    await formAction(fd);
    setSending(false);
  }

  return (
    <div className="flex h-[calc(100vh-120px)] gap-0 rounded-3xl border border-[#E8E2D9] overflow-hidden">
      {/* Left — conversation list */}
      <div className="w-64 shrink-0 border-r border-[#E8E2D9] flex flex-col bg-[#FAFAF8]">
        <div className="px-4 py-4 border-b border-[#E8E2D9]">
          <p className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277]">Conversations</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 && (
            <p className="text-xs text-[#8C8277] p-4">No clients yet.</p>
          )}
          {conversations.map((c) => {
            const active = c.clientId === activeClientId;
            return (
              <button
                key={c.clientId}
                onClick={() => router.push(`/inbox?client=${c.clientId}`)}
                className={`w-full text-left px-4 py-3.5 border-b border-[#E8E2D9]/60 transition-colors ${
                  active ? "bg-[#EDE8E0]" : "hover:bg-[#F5F2ED]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs truncate ${active ? "text-[#1A1714] font-medium" : "text-[#1A1714]"}`}>
                      {c.founderName}
                    </p>
                    <p className="text-[10px] text-[#8C8277] truncate">{c.businessName}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {c.lastMessage && (
                      <span className="text-[9px] text-[#8C8277]">
                        {formatRelative(c.lastMessage.createdAt)}
                      </span>
                    )}
                    {c.unreadCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-[#C8B89A] text-[#FAFAF8] text-[9px] flex items-center justify-center">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
                {c.lastMessage && (
                  <p className="text-[10px] text-[#8C8277] truncate mt-1 leading-4">
                    {c.lastMessage.senderRole === "founder" ? "You: " : ""}
                    {c.lastMessage.content}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right — thread */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#FFFFFF]">
        {!activeClientId ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-10 h-10 rounded-full border border-dashed border-[#C8B89A]/50 mx-auto mb-3 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#C8B89A" strokeWidth="1.2">
                  <path d="M7 1C3.69 1 1 3.35 1 6.25c0 1.57.74 2.98 1.93 3.96L2.5 13l2.87-1.44A6.4 6.4 0 007 11.5c3.31 0 6-2.35 6-5.25S10.31 1 7 1z" />
                </svg>
              </div>
              <p className="text-sm text-[#8C8277]">Select a conversation</p>
            </div>
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div className="px-6 py-4 border-b border-[#E8E2D9] flex items-center gap-3">
              <div>
                <p className="text-sm text-[#1A1714]">{activeClientName}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 bg-[#FAFAF8]">
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-[#8C8277]">No messages yet. Send the first one.</p>
                </div>
              )}
              {grouped.map(({ date, msgs }) => (
                <div key={date}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-[#E8E2D9]" />
                    <span className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277]">{date}</span>
                    <div className="flex-1 h-px bg-[#E8E2D9]" />
                  </div>
                  <div className="space-y-3">
                    {msgs.map((msg) => {
                      const isFounder = msg.senderRole === "founder";
                      return (
                        <div key={msg.id} className={`flex ${isFounder ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[72%] flex flex-col gap-1 ${isFounder ? "items-end" : "items-start"}`}>
                            <div className={`px-4 py-3 text-sm leading-6 ${
                              isFounder
                                ? "bg-[#1A1714] text-[#FAFAF8] rounded-3xl"
                                : "bg-[#FFFFFF] border border-[#E8E2D9] text-[#1A1714] rounded-2xl"
                            }`}>
                              {msg.content}
                            </div>
                            <span className="text-[10px] text-[#8C8277]">{formatTime(msg.createdAt)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Compose */}
            <div className="border-t border-[#E8E2D9] px-4 py-3 bg-[#FFFFFF]">
              <div className="relative">
                {showEmoji && (
                  <div className="absolute bottom-full mb-2 left-0 bg-white border border-[#E8E2D9] rounded-2xl shadow-lg p-3 z-10 w-64">
                    <div className="grid grid-cols-10 gap-1">
                      {EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            const ta = textareaRef.current;
                            if (ta) {
                              const start = ta.selectionStart;
                              const end = ta.selectionEnd;
                              setValue(v => v.slice(0, start) + emoji + v.slice(end));
                              setTimeout(() => { ta.focus(); ta.setSelectionRange(start + emoji.length, start + emoji.length); }, 0);
                            } else {
                              setValue(v => v + emoji);
                            }
                            setShowEmoji(false);
                          }}
                          className="text-lg hover:bg-[#F5F0E8] rounded-lg p-0.5 transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <form
                  onSubmit={handleSend}
                  className="flex items-end gap-2 rounded-2xl border border-[#E8E2D9] bg-[#FAFAF8] px-4 py-3 focus-within:border-[#C8B89A]/60 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setShowEmoji(v => !v)}
                    className="flex-shrink-0 text-[#8C8277] hover:text-[#1A1714] transition-colors mb-0.5"
                    aria-label="Emoji"
                  >
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <circle cx="10" cy="10" r="8"/>
                      <path d="M7 11.5c.8 1.5 5.2 1.5 6 0"/>
                      <circle cx="7.5" cy="8.5" r="0.8" fill="currentColor" stroke="none"/>
                      <circle cx="12.5" cy="8.5" r="0.8" fill="currentColor" stroke="none"/>
                    </svg>
                  </button>
                  <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(e as unknown as React.FormEvent);
                      }
                    }}
                    placeholder="Write a message to your client…"
                    rows={1}
                    className="flex-1 bg-transparent text-sm text-[#1A1714] placeholder:text-[#8C8277] resize-none focus:outline-none leading-6"
                    style={{ maxHeight: "120px", overflowY: "auto" }}
                  />
                  <button
                    type="submit"
                    disabled={!value.trim() || sending || pending}
                    className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1A1714] text-[#FAFAF8] flex items-center justify-center hover:bg-[#2C2520] transition-all disabled:opacity-30"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M12 7L2 2l2 5-2 5 10-5z" fill="currentColor" />
                    </svg>
                  </button>
                </form>
              </div>
              <p className="text-[10px] text-[#8C8277]/60 mt-1.5 px-1">Press Enter to send · Shift+Enter for new line</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
