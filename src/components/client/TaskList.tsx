"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { completeTask, updateClientTask } from "@/app/(client)/tasks/actions";

type Task = {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  assignedTo: string;
  notes: string | null;
  dueDate: Date | null;
};

const priorityColors: Record<string, string> = {
  high:   "bg-[#9B2335]",
  medium: "bg-[#C8B89A]",
  low:    "bg-[#2D6A4F]",
};

const priorityLabel: Record<string, string> = {
  high: "High", medium: "Medium", low: "Low",
};

function EditableText({
  value,
  placeholder,
  multiline = false,
  className,
  onSave,
}: {
  value: string;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  onSave: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLTextAreaElement & HTMLInputElement>(null);

  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);

  function commit() {
    const trimmed = draft.trim();
    if (trimmed !== value) onSave(trimmed);
    setEditing(false);
  }

  if (!editing) {
    return (
      <span
        className={`cursor-text hover:opacity-70 transition-opacity ${className ?? ""}`}
        onClick={() => { setDraft(value); setEditing(true); }}
        title="Click to edit"
      >
        {value || <span className="text-[#8C8277] italic">{placeholder}</span>}
      </span>
    );
  }

  const sharedClass = `bg-[#F5F2ED] border border-[#C8B89A]/50 rounded-xl px-3 py-1.5 focus:outline-none text-[#1A1714] w-full ${className ?? ""}`;

  return multiline ? (
    <textarea
      ref={ref as React.Ref<HTMLTextAreaElement>}
      value={draft}
      rows={2}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === "Escape") { setEditing(false); setDraft(value); } }}
      className={sharedClass}
    />
  ) : (
    <input
      ref={ref as React.Ref<HTMLInputElement>}
      type="text"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setEditing(false); setDraft(value); } }}
      className={sharedClass}
    />
  );
}

function TaskRow({ task }: { task: Task }) {
  const [completing, setCompleting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [, startTransition] = useTransition();

  async function handleComplete() {
    setCompleting(true);
    await completeTask(task.id);
    setCompleting(false);
  }

  function save(field: "title" | "description" | "notes" | "dueDate", value: string) {
    startTransition(async () => {
      await updateClientTask(task.id, { [field]: value || null });
    });
  }

  const dueDateStr = task.dueDate
    ? new Date(task.dueDate).toISOString().split("T")[0]
    : "";

  return (
    <div
      className="rounded-3xl border border-[#E8E2D9] bg-[#FFFFFF] px-6 py-5 group transition-shadow hover:shadow-sm"
      style={{ boxShadow: "0 1px 4px rgba(92,71,48,0.07)" }}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <button
          onClick={handleComplete}
          disabled={completing}
          className="mt-0.5 w-5 h-5 border-2 border-[#E8E2D9] rounded-full flex-shrink-0 hover:border-[#1A1714] hover:bg-[#1A1714]/5 transition-colors disabled:opacity-50 flex items-center justify-center"
          aria-label="Complete task"
        >
          {completing && <div className="w-2 h-2 rounded-full bg-[#C8B89A] animate-pulse" />}
        </button>

        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-start justify-between gap-3">
            <EditableText
              value={task.title}
              className="text-sm text-[#1A1714] leading-5 font-medium"
              onSave={(v) => { if (v) save("title", v); }}
            />
            <div className="flex items-center gap-2 flex-shrink-0">
              {task.assignedTo === "founder" && (
                <span className="text-[9px] tracking-[0.1em] uppercase text-[#C8B89A] bg-[#F5EEE4] px-2 py-0.5 rounded-full">
                  Consultant
                </span>
              )}
              <span className={`w-1.5 h-1.5 rounded-full ${priorityColors[task.priority] ?? "bg-[#E8E2D9]"}`} />
              <button
                onClick={() => setExpanded((v) => !v)}
                className="text-[#C8B89A] hover:text-[#1A1714] transition-colors opacity-0 group-hover:opacity-100"
                title="Edit details"
              >
                <svg width="13" height="13" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M8.5 1.5l2 2-7 7H1.5v-2l7-7z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Metadata row */}
          {(task.description || task.dueDate || task.priority) && !expanded && (
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {task.description && (
                <p className="text-xs text-[#5C5550] leading-5">{task.description}</p>
              )}
              {task.dueDate && (
                <span className="text-[10px] tracking-[0.06em] uppercase text-[#8C8277] bg-[#F5F2ED] px-2 py-0.5 rounded-full">
                  Due {new Date(task.dueDate).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                </span>
              )}
            </div>
          )}

          {/* Expanded edit panel */}
          {expanded && (
            <div className="mt-4 space-y-4 border-t border-[#F0EBE3] pt-4">
              <div>
                <p className="text-[10px] tracking-[0.12em] uppercase text-[#8C8277] mb-1.5">Description</p>
                <EditableText
                  value={task.description ?? ""}
                  placeholder="Add a description"
                  multiline
                  className="text-xs text-[#5C5550] leading-5"
                  onSave={(v) => save("description", v)}
                />
              </div>
              <div>
                <p className="text-[10px] tracking-[0.12em] uppercase text-[#8C8277] mb-1.5">Notes</p>
                <EditableText
                  value={task.notes ?? ""}
                  placeholder="Add a note"
                  multiline
                  className="text-xs text-[#5C5550] leading-5"
                  onSave={(v) => save("notes", v)}
                />
              </div>
              <div>
                <p className="text-[10px] tracking-[0.12em] uppercase text-[#8C8277] mb-1.5">Due date</p>
                <input
                  type="date"
                  defaultValue={dueDateStr}
                  onBlur={(e) => save("dueDate", e.target.value)}
                  className="bg-[#F5F2ED] border border-[#E8E2D9] rounded-xl px-3 py-1.5 text-xs text-[#1A1714] focus:outline-none focus:border-[#C8B89A]"
                />
              </div>
              <button
                onClick={() => setExpanded(false)}
                className="text-[10px] tracking-[0.1em] uppercase text-[#8C8277] hover:text-[#1A1714] transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function TaskList({ tasks }: { tasks: Task[] }) {
  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskRow key={task.id} task={task} />
      ))}
    </div>
  );
}
