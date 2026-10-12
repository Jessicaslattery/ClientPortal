"use client";

import { useState, useTransition, useEffect, useActionState, useRef } from "react";
import Link from "next/link";
import {
  completeTaskAction,
  reopenTaskAction,
  createFounderTaskAction,
  updateTaskNotesAction,
  createRecurringTaskAction,
  deleteRecurringTaskAction,
  toggleRecurringCompletionAction,
} from "@/app/(founder)/my-tasks/actions";

// ─── Types ────────────────────────────────────────────────────────────────────

type Task = {
  id: string;
  title: string;
  category: string;
  priority: string;
  dueDate: Date | null;
  notes: string | null;
  clientProfileId: string | null;
  clientProfile: { id: string; founderName: string; businessName: string } | null;
};

type RecurringTask = {
  id: string;
  title: string;
  category: string;
  priority: string;
  notes: string | null;
  days: string;
  completedThisWeek: boolean;
};

type Client = { id: string; founderName: string; businessName: string };
type GroupMode = "dueDate" | "client" | "week";

const STORAGE_KEY = "pivot-founder-task-group";
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const DAY_FULL: Record<string, string> = {
  Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday",
  Fri: "Friday", Sat: "Saturday", Sun: "Sunday",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function startOfDay(d: Date) {
  const c = new Date(d); c.setHours(0, 0, 0, 0); return c;
}

function getDueDateBucket(dueDate: Date | null): string {
  if (!dueDate) return "No due date";
  const now = startOfDay(new Date());
  const due = startOfDay(new Date(dueDate));
  const diffDays = Math.round((due.getTime() - now.getTime()) / 86400000);
  if (diffDays < 0) return "Overdue";
  if (diffDays === 0) return "Today";
  if (diffDays <= 6) return "This week";
  return "Later";
}

const BUCKET_ORDER = ["Overdue", "Today", "This week", "Later", "No due date"];

function formatDueDate(d: Date | null) {
  if (!d) return null;
  const now = startOfDay(new Date());
  const due = startOfDay(new Date(d));
  const diff = Math.round((due.getTime() - now.getTime()) / 86400000);
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return new Date(d).toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}

// Get the Date for a given day abbreviation within the current week (weekStart = Monday)
function getDayDate(weekStartIso: string, dayAbbr: string): Date {
  const idx = DAYS.indexOf(dayAbbr as typeof DAYS[number]);
  const d = new Date(weekStartIso);
  d.setDate(d.getDate() + idx);
  return d;
}

const PRIORITY_DOT: Record<string, string> = {
  high: "bg-[#9B2335]",
  medium: "bg-[#C8B89A]",
  low: "bg-[#2D6A4F]",
};

// ─── Recurring task row ───────────────────────────────────────────────────────

function RecurringTaskRow({
  task,
  weekStart,
}: {
  task: RecurringTask;
  weekStart: string;
}) {
  const [done, setDone] = useState(task.completedThisWeek);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = !done;
    setDone(next);
    startTransition(() =>
      toggleRecurringCompletionAction(task.id, weekStart, !next)
    );
  }

  return (
    <div className={`flex items-center gap-3 px-4 py-3 hover:bg-[#F2EDE4] transition-colors ${done ? "opacity-50" : ""}`}>
      <button
        onClick={toggle}
        disabled={isPending}
        className="shrink-0 w-4 h-4 rounded border border-[#DDD5C8] flex items-center justify-center transition-colors hover:border-[#C8B89A] disabled:opacity-40"
        aria-label={done ? "Mark incomplete" : "Mark complete"}
      >
        {done && (
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="#2D6A4F" strokeWidth="1.5">
            <path d="M1.5 4.5l2 2 4-4" />
          </svg>
        )}
        {isPending && <div className="w-2 h-2 rounded-full bg-[#C8B89A] animate-pulse" />}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${PRIORITY_DOT[task.priority] ?? "bg-[#C8B89A]"}`} />
          <p className={`text-sm ${done ? "line-through text-[#8C8277]" : "text-[#1A1714]"}`}>{task.title}</p>
        </div>
        <p className="text-[10px] text-[#8C8277] mt-0.5 pl-3.5">{task.category}</p>
      </div>
      <span className="text-[9px] tracking-[0.1em] uppercase text-[#C8B89A]/60">Recurring</span>
    </div>
  );
}

// ─── One-time task row ────────────────────────────────────────────────────────

function TaskRow({
  task,
  showClient = false,
  completed = false,
}: {
  task: Task & { completedAt?: Date | null };
  showClient?: boolean;
  completed?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [notesDraft, setNotesDraft] = useState(task.notes ?? "");
  const [notesPending, startNotesTrans] = useTransition();
  const [checkPending, startCheckTrans] = useTransition();

  function saveNotes() {
    if (notesDraft === (task.notes ?? "")) return;
    startNotesTrans(() => updateTaskNotesAction(task.id, notesDraft));
  }

  return (
    <div className={`transition-colors ${completed ? "opacity-50" : ""}`}>
      <div className="flex items-start gap-3 px-4 py-3 hover:bg-[#F2EDE4]">
        <button
          onClick={() =>
            startCheckTrans(() =>
              completed ? reopenTaskAction(task.id) : completeTaskAction(task.id)
            )
          }
          disabled={checkPending}
          className="mt-0.5 shrink-0 w-4 h-4 rounded border border-[#DDD5C8] flex items-center justify-center transition-colors hover:border-[#C8B89A] disabled:opacity-40"
          aria-label={completed ? "Reopen task" : "Complete task"}
        >
          {completed && (
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="#2D6A4F" strokeWidth="1.5">
              <path d="M1.5 4.5l2 2 4-4" />
            </svg>
          )}
          {checkPending && <div className="w-2 h-2 rounded-full bg-[#C8B89A] animate-pulse" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${PRIORITY_DOT[task.priority] ?? "bg-[#C8B89A]"}`} />
            <p className={`text-sm ${completed ? "line-through text-[#8C8277]" : "text-[#1A1714]"}`}>
              {task.title}
            </p>
          </div>
          <div className="flex items-center gap-3 mt-0.5 pl-3.5">
            {showClient && task.clientProfile && (
              <Link href={`/clients/${task.clientProfile.id}`} className="text-[10px] tracking-[0.06em] text-[#C8B89A] hover:underline">
                {task.clientProfile.founderName}
              </Link>
            )}
            {showClient && !task.clientProfile && (
              <span className="text-[10px] text-[#8C8277]">Personal</span>
            )}
            <span className="text-[10px] text-[#8C8277]">{task.category}</span>
            {task.dueDate && (
              <span className={`text-[10px] ${getDueDateBucket(task.dueDate) === "Overdue" ? "text-[#9B2335]" : "text-[#8C8277]"}`}>
                {formatDueDate(task.dueDate)}
              </span>
            )}
            {task.notes && !expanded && (
              <span className="text-[10px] text-[#8C8277] italic truncate max-w-[160px]">{task.notes}</span>
            )}
          </div>
        </div>

        {!completed && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className={`shrink-0 mt-0.5 text-[10px] tracking-[0.06em] uppercase transition-colors ${expanded ? "text-[#C8B89A]" : "text-[#8C8277] hover:text-[#1A1714]"}`}
            title="Notes"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M2 2h8M2 5h8M2 8h5" />
            </svg>
          </button>
        )}
      </div>

      {expanded && (
        <div className="px-4 pb-3 pl-11">
          <textarea
            value={notesDraft}
            onChange={(e) => setNotesDraft(e.target.value)}
            onBlur={saveNotes}
            rows={3}
            placeholder="Add notes…"
            className="w-full bg-[#FFFFFF] border border-[#E8E2D9] rounded-2xl px-3 py-2 text-xs text-[#1A1714] placeholder:text-[#8C8277] focus:outline-none focus:border-[#C8B89A] transition-colors resize-none"
          />
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-[10px] text-[#8C8277]">{notesPending ? "Saving…" : "Click away to save"}</p>
            <button onClick={() => { saveNotes(); setExpanded(false); }} className="text-[10px] tracking-[0.06em] uppercase text-[#8C8277] hover:text-[#1A1714] transition-colors">
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Collapsible section ──────────────────────────────────────────────────────

function TaskSection({
  title, count, tasks, showClient = false, accent = false,
}: {
  title: string; count: number; tasks: Task[];
  showClient?: boolean; accent?: boolean;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-3xl border border-[#DDD5C8] bg-[#FFFFFF] overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(92,71,48,0.08)" }}>
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-[#F2EDE4] transition-colors">
        <div className="flex items-center gap-2.5">
          <span className={`text-[10px] tracking-[0.12em] uppercase font-medium ${accent ? "text-[#9B2335]" : "text-[#8C8277]"}`}>{title}</span>
          <span className="text-[10px] text-[#8C8277] bg-[#F2EDE4] px-1.5 py-0.5 rounded-full">{count}</span>
        </div>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" className={`text-[#8C8277] transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M2 4l4 4 4-4" />
        </svg>
      </button>
      {open && (
        <div className="divide-y divide-[#E8E2D9]">
          {tasks.map((t) => <TaskRow key={t.id} task={t} showClient={showClient} />)}
        </div>
      )}
    </div>
  );
}

// ─── Week view ────────────────────────────────────────────────────────────────

function WeekView({
  tasks,
  recurringTasks,
  weekStart,
}: {
  tasks: Task[];
  recurringTasks: RecurringTask[];
  weekStart: string;
}) {
  const _now = new Date();
  const today = `${_now.getFullYear()}-${String(_now.getMonth() + 1).padStart(2, "0")}-${String(_now.getDate()).padStart(2, "0")}`;

  return (
    <div className="space-y-3">
      {DAYS.map((day) => {
        const dayDate = getDayDate(weekStart, day);
        const dayIso = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, "0")}-${String(dayDate.getDate()).padStart(2, "0")}`;
        const isToday = dayIso === today;

        const dayRecurring = recurringTasks.filter((r) =>
          r.days.split(",").map((d) => d.trim()).includes(day)
        );

        const dayTasks = tasks.filter((t) => {
          if (!t.dueDate) return false;
          return new Date(t.dueDate).toISOString().slice(0, 10) === dayIso;
        });

        const totalCount = dayRecurring.length + dayTasks.length;

        return (
          <div
            key={day}
            className={`rounded-3xl border bg-[#FFFFFF] overflow-hidden ${isToday ? "border-[#C8B89A]/40" : "border-[#DDD5C8]"}`}
            style={{ boxShadow: "0 1px 3px rgba(92,71,48,0.08)" }}
          >
            {/* Day header */}
            <div className={`flex items-center justify-between px-5 py-3 border-b ${isToday ? "border-[#C8B89A]/20 bg-[#C8B89A]/5" : "border-[#E8E2D9]"}`}>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] tracking-[0.15em] uppercase font-medium ${isToday ? "text-[#C8B89A]" : "text-[#8C8277]"}`}>
                  {DAY_FULL[day]}
                </span>
                <span className={`text-[10px] ${isToday ? "text-[#C8B89A]" : "text-[#8C8277]"}`}>
                  {dayDate.toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                </span>
                {isToday && (
                  <span className="text-[9px] tracking-[0.12em] uppercase text-[#C8B89A]">Today</span>
                )}
              </div>
              {totalCount > 0 && (
                <span className="text-[10px] text-[#8C8277] bg-[#F2EDE4] px-1.5 py-0.5 rounded-full">{totalCount}</span>
              )}
            </div>

            {/* Tasks */}
            {totalCount === 0 ? (
              <div className="px-5 py-3">
                <p className="text-xs text-[#DDD5C8]">Nothing scheduled</p>
              </div>
            ) : (
              <div className="divide-y divide-[#E8E2D9]">
                {dayRecurring.map((r) => (
                  <RecurringTaskRow key={r.id} task={r} weekStart={weekStart} />
                ))}
                {dayTasks.map((t) => (
                  <TaskRow key={t.id} task={t} showClient />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Add recurring task form ──────────────────────────────────────────────────

function AddRecurringTaskForm({ onClose }: { onClose: () => void }) {
  const [state, formAction, pending] = useActionState(createRecurringTaskAction, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) { formRef.current?.reset(); onClose(); }
  }, [state.success, onClose]);

  return (
    <div className="rounded-3xl border border-[#DDD5C8] bg-[#FFFFFF] p-5 space-y-4" style={{ boxShadow: "0 1px 3px rgba(92,71,48,0.08)" }}>
      <p className="text-[10px] tracking-[0.12em] uppercase text-[#8C8277]">New recurring task</p>
      <form ref={formRef} action={formAction} className="space-y-4">
        <input
          name="title" type="text" required placeholder="What needs doing each week?"
          autoFocus
          className="w-full rounded-2xl bg-[#FFFFFF] border border-[#E8E2D9] text-[#1A1714] px-4 py-2.5 text-sm placeholder:text-[#8C8277] focus:outline-none focus:border-[#C8B89A] transition-colors"
        />

        {/* Day picker */}
        <div>
          <p className="text-[10px] tracking-[0.08em] uppercase text-[#8C8277] mb-2">Repeat on</p>
          <div className="flex gap-2 flex-wrap">
            {DAYS.map((d) => (
              <label key={d} className="cursor-pointer">
                <input type="checkbox" name={`day_${d}`} className="sr-only peer" />
                <span className="block px-3 py-1.5 rounded-xl border border-[#E8E2D9] text-xs text-[#5C5550] peer-checked:bg-[#1A1714] peer-checked:text-[#FAFAF8] peer-checked:border-[#1A1714] transition-colors select-none">
                  {d}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] tracking-[0.08em] uppercase text-[#8C8277] mb-1">Category</label>
            <input
              name="category" type="text" placeholder="e.g. Admin, Strategy"
              defaultValue="General"
              className="w-full rounded-2xl bg-[#FFFFFF] border border-[#E8E2D9] text-[#1A1714] px-3 py-2 text-xs placeholder:text-[#8C8277] focus:outline-none focus:border-[#C8B89A] transition-colors"
            />
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.08em] uppercase text-[#8C8277] mb-1">Priority</label>
            <select name="priority" defaultValue="medium" className="w-full rounded-2xl bg-[#FFFFFF] border border-[#E8E2D9] text-[#1A1714] px-3 py-2 text-xs focus:outline-none focus:border-[#C8B89A] transition-colors">
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {state.error && <p className="text-xs text-[#9B2335]">{state.error}</p>}

        <div className="flex items-center gap-3 pt-1">
          <button type="submit" disabled={pending} className="px-5 py-2 rounded-2xl bg-[#1A1714] text-[#FAFAF8] text-xs tracking-[0.1em] uppercase hover:bg-[#2C2520] transition-colors disabled:opacity-40">
            {pending ? "Saving…" : "Save recurring task"}
          </button>
          <button type="button" onClick={onClose} className="px-5 py-2 rounded-2xl text-xs tracking-[0.1em] uppercase text-[#8C8277] hover:text-[#1A1714] transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Add one-time task form ───────────────────────────────────────────────────

function AddTaskForm({ clients, onClose }: { clients: Client[]; onClose: () => void }) {
  const [state, formAction, pending] = useActionState(createFounderTaskAction, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) { formRef.current?.reset(); onClose(); }
  }, [state.success, onClose]);

  return (
    <div className="rounded-3xl border border-[#DDD5C8] bg-[#FFFFFF] p-5 space-y-4" style={{ boxShadow: "0 1px 3px rgba(92,71,48,0.08)" }}>
      <p className="text-[10px] tracking-[0.12em] uppercase text-[#8C8277]">New task</p>
      <form ref={formRef} action={formAction} className="space-y-3">
        <input
          name="title" type="text" required placeholder="What needs doing?"
          autoFocus
          className="w-full rounded-2xl bg-[#FFFFFF] border border-[#E8E2D9] text-[#1A1714] px-4 py-2.5 text-sm placeholder:text-[#8C8277] focus:outline-none focus:border-[#C8B89A] transition-colors"
        />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] tracking-[0.08em] uppercase text-[#8C8277] mb-1">Client <span className="normal-case tracking-normal">(optional)</span></label>
            <select name="clientProfileId" defaultValue="" className="w-full rounded-2xl bg-[#FFFFFF] border border-[#E8E2D9] text-[#1A1714] px-3 py-2 text-xs focus:outline-none focus:border-[#C8B89A] transition-colors">
              <option value="">Personal / no client</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.founderName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.08em] uppercase text-[#8C8277] mb-1">Category</label>
            <input name="category" type="text" placeholder="e.g. Admin, Strategy" defaultValue="General" className="w-full rounded-2xl bg-[#FFFFFF] border border-[#E8E2D9] text-[#1A1714] px-3 py-2 text-xs placeholder:text-[#8C8277] focus:outline-none focus:border-[#C8B89A] transition-colors" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] tracking-[0.08em] uppercase text-[#8C8277] mb-1">Due date <span className="normal-case tracking-normal">(optional)</span></label>
            <input name="dueDate" type="date" className="w-full rounded-2xl bg-[#FFFFFF] border border-[#E8E2D9] text-[#1A1714] px-3 py-2 text-xs focus:outline-none focus:border-[#C8B89A] transition-colors" />
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.08em] uppercase text-[#8C8277] mb-1">Priority</label>
            <select name="priority" defaultValue="medium" className="w-full rounded-2xl bg-[#FFFFFF] border border-[#E8E2D9] text-[#1A1714] px-3 py-2 text-xs focus:outline-none focus:border-[#C8B89A] transition-colors">
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-[10px] tracking-[0.08em] uppercase text-[#8C8277] mb-1">Notes <span className="normal-case tracking-normal">(optional)</span></label>
          <textarea name="notes" rows={2} placeholder="Any context or detail…" className="w-full rounded-2xl bg-[#FFFFFF] border border-[#E8E2D9] text-[#1A1714] px-4 py-2.5 text-sm placeholder:text-[#8C8277] focus:outline-none focus:border-[#C8B89A] transition-colors resize-none" />
        </div>
        {state.error && <p className="text-xs text-[#9B2335]">{state.error}</p>}
        <div className="flex items-center gap-3 pt-1">
          <button type="submit" disabled={pending} className="px-5 py-2 rounded-2xl bg-[#1A1714] text-[#FAFAF8] text-xs tracking-[0.1em] uppercase hover:bg-[#2C2520] transition-colors disabled:opacity-40">
            {pending ? "Adding…" : "Add task"}
          </button>
          <button type="button" onClick={onClose} className="px-5 py-2 rounded-2xl text-xs tracking-[0.1em] uppercase text-[#8C8277] hover:text-[#1A1714] transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Recurring task management ────────────────────────────────────────────────

function RecurringTaskManager({ recurringTasks }: { recurringTasks: RecurringTask[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (recurringTasks.length === 0) return null;

  return (
    <div className="rounded-3xl border border-[#DDD5C8] bg-[#FFFFFF] overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(92,71,48,0.08)" }}>
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-[#F2EDE4] transition-colors">
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] tracking-[0.12em] uppercase font-medium text-[#8C8277]">Recurring tasks</span>
          <span className="text-[10px] text-[#8C8277] bg-[#F2EDE4] px-1.5 py-0.5 rounded-full">{recurringTasks.length}</span>
        </div>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" className={`text-[#8C8277] transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M2 4l4 4 4-4" />
        </svg>
      </button>
      {open && (
        <div className="divide-y divide-[#E8E2D9]">
          {recurringTasks.map((r) => (
            <div key={r.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm text-[#1A1714]">{r.title}</p>
                <p className="text-[10px] text-[#8C8277] mt-0.5">
                  {r.days.split(",").map((d) => d.trim()).join(" · ")} · {r.category}
                </p>
              </div>
              <button
                onClick={() => startTransition(() => deleteRecurringTaskAction(r.id))}
                disabled={isPending}
                className="text-[10px] tracking-[0.06em] uppercase text-[#8C8277] hover:text-[#9B2335] transition-colors disabled:opacity-40"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function FounderTaskList({
  tasks,
  recentlyCompleted,
  clients,
  recurringTasks,
  weekStart,
}: {
  tasks: Task[];
  recentlyCompleted: (Task & { completedAt?: Date | null })[];
  clients: Client[];
  recurringTasks: RecurringTask[];
  weekStart: string;
}) {
  const [groupMode, setGroupMode] = useState<GroupMode>("week");
  const [showCompleted, setShowCompleted] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showRecurringForm, setShowRecurringForm] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as GroupMode | null;
    if (stored === "dueDate" || stored === "client" || stored === "week") setGroupMode(stored);
  }, []);

  function handleGroupChange(mode: GroupMode) {
    setGroupMode(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  }

  const byDueDate = (() => {
    const buckets: Record<string, Task[]> = {};
    for (const t of tasks) {
      const b = getDueDateBucket(t.dueDate);
      if (!buckets[b]) buckets[b] = [];
      buckets[b].push(t);
    }
    return BUCKET_ORDER.filter((b) => buckets[b]?.length).map((b) => ({ title: b, tasks: buckets[b] }));
  })();

  const byClient = (() => {
    const map = new Map<string, { id: string; name: string; tasks: Task[] }>();
    for (const t of tasks) {
      const key = t.clientProfileId ?? "__personal__";
      if (!map.has(key)) map.set(key, { id: key, name: t.clientProfile?.founderName ?? "Personal", tasks: [] });
      map.get(key)!.tasks.push(t);
    }
    return Array.from(map.values()).sort((a, b) => {
      if (a.id === "__personal__") return -1;
      if (b.id === "__personal__") return 1;
      return a.name.localeCompare(b.name);
    });
  })();

  const isEmpty = tasks.length === 0 && recurringTasks.length === 0;

  return (
    <div className="space-y-5">
      {/* Toggle bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1 bg-[#EDE5D8] rounded-2xl p-1">
          {(["week", "dueDate", "client"] as GroupMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => handleGroupChange(mode)}
              className={`px-4 py-1.5 rounded-xl text-[10px] tracking-[0.1em] uppercase transition-all ${
                groupMode === mode ? "bg-[#FFFFFF] text-[#1A1714] shadow-sm" : "text-[#5C5550] hover:text-[#1A1714]"
              }`}
            >
              {mode === "week" ? "Week" : mode === "dueDate" ? "Due Date" : "Client"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setShowCompleted((v) => !v)} className="text-[10px] tracking-[0.08em] uppercase text-[#8C8277] hover:text-[#1A1714] transition-colors">
            {showCompleted ? "Hide completed" : `Completed (${recentlyCompleted.length})`}
          </button>
          {groupMode === "week" && (
            <button
              onClick={() => { setShowRecurringForm((v) => !v); setShowAddForm(false); }}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-2xl border border-[#DDD5C8] text-[#5C5550] text-[10px] tracking-[0.1em] uppercase hover:border-[#C8B89A] transition-colors"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 1v8M1 5h8" />
              </svg>
              Recurring
            </button>
          )}
          <button
            onClick={() => { setShowAddForm((v) => !v); setShowRecurringForm(false); }}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-2xl bg-[#1A1714] text-[#FAFAF8] text-[10px] tracking-[0.1em] uppercase hover:bg-[#2C2520] transition-colors"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 1v8M1 5h8" />
            </svg>
            Add task
          </button>
        </div>
      </div>

      {showRecurringForm && <AddRecurringTaskForm onClose={() => setShowRecurringForm(false)} />}
      {showAddForm && <AddTaskForm clients={clients} onClose={() => setShowAddForm(false)} />}

      {isEmpty && !showAddForm && !showRecurringForm && (
        <div className="rounded-3xl border border-[#DDD5C8] bg-[#FFFFFF] px-8 py-16 text-center" style={{ boxShadow: "0 1px 3px rgba(92,71,48,0.08)" }}>
          <p className="text-sm text-[#8C8277]">No tasks yet. Add a task or set up recurring ones with the buttons above.</p>
        </div>
      )}

      {/* Week view */}
      {groupMode === "week" && (
        <>
          <WeekView tasks={tasks} recurringTasks={recurringTasks} weekStart={weekStart} />
          <RecurringTaskManager recurringTasks={recurringTasks} />
        </>
      )}

      {/* Due date view */}
      {groupMode === "dueDate" && tasks.length > 0 && (
        <div className="space-y-3">
          {byDueDate.map(({ title, tasks: st }) => (
            <TaskSection key={title} title={title} count={st.length} tasks={st} showClient accent={title === "Overdue"} />
          ))}
        </div>
      )}

      {/* Client view */}
      {groupMode === "client" && tasks.length > 0 && (
        <div className="space-y-3">
          {byClient.map(({ id, name, tasks: ct }) => (
            <TaskSection key={id} title={name} count={ct.length} tasks={ct} showClient={false} />
          ))}
        </div>
      )}

      {/* Recently completed */}
      {showCompleted && recentlyCompleted.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] tracking-[0.12em] uppercase text-[#8C8277] px-1">Completed this week</p>
          <div className="rounded-3xl border border-[#DDD5C8] bg-[#FFFFFF] overflow-hidden divide-y divide-[#E8E2D9]" style={{ boxShadow: "0 1px 3px rgba(92,71,48,0.08)" }}>
            {recentlyCompleted.map((t) => <TaskRow key={t.id} task={t} showClient completed />)}
          </div>
        </div>
      )}
    </div>
  );
}
