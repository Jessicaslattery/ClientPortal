"use client";

import { useState, useRef, useEffect } from "react";
import { sendMessage } from "@/app/(client)/messages/actions";

const EMOJIS = [
  "😊","😂","🙏","❤️","🔥","✅","👍","🎉","😍","🤔",
  "💪","🙌","😭","👏","💯","🚀","😅","🤝","💡","📌",
  "⭐","✨","😎","🥳","😬","😮","🤩","💬","📈","🎯",
];

type Message = {
  id: string;
  content: string;
  senderRole: string;
  createdAt: Date;
  attachmentUrl: string | null;
  attachmentName: string | null;
};

export function MessageThread({
  messages: initialMessages,
  clientProfileId,
}: {
  messages: Message[];
  clientProfileId: string;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim() || sending) return;
    setSending(true);

    const text = value.trim();
    setValue("");

    // Optimistic update
    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      content: text,
      senderRole: "client",
      createdAt: new Date(),
      attachmentUrl: null,
      attachmentName: null,
    };
    setMessages((prev) => [...prev, optimistic]);

    await sendMessage(text, clientProfileId);
    setSending(false);
  }

  const formatTime = (date: Date) =>
    new Date(date).toLocaleTimeString("en-AU", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  // Group messages by date
  const grouped = messages.reduce<{ date: string; messages: Message[] }[]>(
    (acc, msg) => {
      const dateStr = formatDate(msg.createdAt);
      const last = acc[acc.length - 1];
      if (last?.date === dateStr) {
        last.messages.push(msg);
      } else {
        acc.push({ date: dateStr, messages: [msg] });
      }
      return acc;
    },
    []
  );

  return (
    <div className="flex flex-col rounded-3xl border border-[#E8E2D9] overflow-hidden bg-[#FFFFFF]" style={{ height: "calc(100vh - 200px)" }}>
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-[#FAFAF8]">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-10 h-10 rounded-full border border-dashed border-[#C8B89A]/50 mx-auto mb-3 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#C8B89A" strokeWidth="1.2">
                  <path d="M7 1C3.69 1 1 3.35 1 6.25c0 1.57.74 2.98 1.93 3.96L2.5 13l2.87-1.44A6.4 6.4 0 007 11.5c3.31 0 6-2.35 6-5.25S10.31 1 7 1z" />
                </svg>
              </div>
              <p className="text-sm text-[#8C8277]">No messages yet.</p>
              <p className="text-xs text-[#8C8277]/70 mt-0.5">Start the conversation below.</p>
            </div>
          </div>
        )}

        {grouped.map(({ date, messages: dayMsgs }) => (
          <div key={date}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-[#FFFFFF]" />
              <span className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277]">{date}</span>
              <div className="flex-1 h-px bg-[#FFFFFF]" />
            </div>

            <div className="space-y-4">
              {dayMsgs.map((msg) => {
                const isClient = msg.senderRole === "client";
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isClient ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[72%] ${isClient ? "items-end" : "items-start"} flex flex-col gap-1`}>
                      <div
                        className={`px-4 py-3 text-sm leading-6 ${
                          isClient
                            ? "bg-[#C8B89A]/15 rounded-3xl border border-[#C8B89A]/20 text-[#1A1714]"
                            : "rounded-2xl bg-[#FFFFFF] border border-[#E8E2D9] text-[#1A1714]"
                        }`}
                      >
                        {msg.content}
                        {msg.attachmentName && (
                          <div className="mt-2 pt-2 border-t border-current/20">
                            <a
                              href={msg.attachmentUrl ?? "#"}
                              className="text-xs text-[#C8B89A] hover:opacity-70"
                            >
                              📎 {msg.attachmentName}
                            </a>
                          </div>
                        )}
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

      {/* Compose area */}
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
          <form onSubmit={handleSend} className="flex items-end gap-2 rounded-2xl border border-[#E8E2D9] bg-[#FAFAF8] px-4 py-3 focus-within:border-[#C8B89A]/60 transition-colors">
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
              placeholder="Write a message…"
              rows={1}
              className="flex-1 bg-transparent text-sm text-[#1A1714] placeholder:text-[#8C8277] resize-none focus:outline-none leading-6"
              style={{ maxHeight: "120px", overflowY: "auto" }}
            />
            <button
              type="submit"
              disabled={!value.trim() || sending}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1A1714] text-[#FAFAF8] flex items-center justify-center hover:bg-[#2C2520] transition-all disabled:opacity-30 disabled:cursor-default"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M12 7L2 2l2 5-2 5 10-5z" fill="currentColor" />
              </svg>
            </button>
          </form>
        </div>
        <p className="text-[10px] text-[#8C8277]/60 mt-1.5 px-1">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
