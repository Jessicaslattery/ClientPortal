"use client";

export type CalendarPost = { id: string; postDate: string };

// Post dates are stored as UTC midnight (date-only values). Building the grid
// with local-time Date objects would drift by a day for any timezone ahead of
// UTC (e.g. AEST) once compared via toISOString() — so every day here is
// constructed and read back in UTC to keep grid cells and stored dates aligned.
function getDaysInMonth(month: string) {
  const [year, m] = month.split("-").map(Number);
  const firstDay = new Date(Date.UTC(year, m - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, m, 0)).getUTCDate();
  const days: Date[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(Date.UTC(year, m - 1, d)));
  }
  return { days, startDayOfWeek: firstDay.getUTCDay() };
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Shared month-grid calendar with HTML5 drag-and-drop rescheduling.
 * Used by both the client and founder content-calendar views so the two
 * don't drift — the caller supplies how each post chip renders and which
 * posts are draggable.
 */
export function CalendarGrid<T extends CalendarPost>({
  month,
  posts,
  renderChip,
  onAddClick,
  onDropPost,
  onDayClick,
  canDrag,
}: {
  month: string;
  posts: T[];
  renderChip: (post: T) => React.ReactNode;
  onAddClick?: (dateKey: string) => void;
  onDropPost?: (postId: string, dateKey: string) => void;
  /** Called when a day with at least one post/story is clicked anywhere (including its chips). */
  onDayClick?: (dateKey: string) => void;
  canDrag?: (post: T) => boolean;
}) {
  const { days, startDayOfWeek } = getDaysInMonth(month);
  const today = new Date().toISOString().slice(0, 10);

  const postsByDate = new Map<string, T[]>();
  for (const post of posts) {
    const key = new Date(post.postDate).toISOString().slice(0, 10);
    if (!postsByDate.has(key)) postsByDate.set(key, []);
    postsByDate.get(key)!.push(post);
  }

  function handleDragStart(e: React.DragEvent, postId: string) {
    e.dataTransfer.setData("text/plain", postId);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDrop(e: React.DragEvent, dateKey: string) {
    e.preventDefault();
    const postId = e.dataTransfer.getData("text/plain");
    if (postId && onDropPost) onDropPost(postId, dateKey);
  }

  return (
    <div className="rounded-3xl border border-[#E8E2D9] overflow-hidden">
      <div className="grid grid-cols-7 border-b border-[#E8E2D9]">
        {DAY_LABELS.map((d) => (
          <div key={d} className="py-2 text-center text-[10px] tracking-[0.1em] uppercase text-[#8C8277]">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {Array.from({ length: startDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="min-h-[80px] border-b border-r border-[#E8E2D9] bg-[#FAFAF8]" />
        ))}
        {days.map((day) => {
          const key = day.toISOString().slice(0, 10);
          const dayPosts = postsByDate.get(key) ?? [];
          const isToday = key === today;
          const clickable = !!onDayClick && dayPosts.length > 0;
          return (
            <div
              key={key}
              className={`min-h-[80px] border-b border-r border-[#E8E2D9] p-1.5 group/day ${clickable ? "cursor-pointer hover:bg-[#FAFAF8]" : ""}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, key)}
              onClick={() => { if (clickable) onDayClick!(key); }}
            >
              <div className="flex items-start justify-between mb-1">
                <div className={`text-[11px] w-5 h-5 flex items-center justify-center rounded-full ${isToday ? "bg-[#1A1714] text-[#FAFAF8]" : "text-[#5C5550]"}`}>
                  {day.getUTCDate()}
                </div>
                {onAddClick && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onAddClick(key); }}
                    className="text-[#C8B89A] hover:text-[#1A1714] text-sm leading-none opacity-0 group-hover/day:opacity-100 transition-all"
                  >+</button>
                )}
              </div>
              <div className="space-y-0.5">
                {dayPosts.map((post) => (
                  <div
                    key={post.id}
                    draggable={canDrag ? canDrag(post) : true}
                    onDragStart={(e) => handleDragStart(e, post.id)}
                  >
                    {renderChip(post)}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
