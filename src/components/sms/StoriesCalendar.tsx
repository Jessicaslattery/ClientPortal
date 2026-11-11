"use client";

type Story = {
  id: string;
  date: string;
  theme: string | null;
  engagementTool: string;
  cta: string | null;
  isLaunchDay: boolean;
  isPromoDay: boolean;
  doneByClient: boolean;
};

const ET_LABEL: Record<string, string> = {
  poll: "Poll", slider: "Slider", question_box: "Q&A", quiz: "Quiz",
  countdown: "Countdown", link_sticker: "Link", none: "",
};

function dayOfWeek(iso: string) {
  return new Date(iso).toLocaleDateString("en-AU", { weekday: "short" });
}
function dayNum(iso: string) {
  return new Date(iso).getDate();
}

export function StoriesCalendar({ stories }: { stories: Story[] }) {
  // Group by week (Mon-Sun)
  const weeks: Story[][] = [];
  let currentWeek: Story[] = [];

  for (const s of stories) {
    currentWeek.push(s);
    const dow = new Date(s.date).getDay(); // 0=Sun
    if (dow === 0 || stories.indexOf(s) === stories.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) weeks.push(currentWeek);

  return (
    <div className="space-y-6">
      {weeks.map((week, wi) => (
        <div key={wi}>
          <div className="grid grid-cols-7 gap-px bg-[#D9D3C6]">
            {week.map((s) => (
              <div
                key={s.id}
                className={`bg-white px-2 py-3 min-h-[88px] relative ${s.doneByClient ? "opacity-60" : ""}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] text-[#6d675e] uppercase tracking-[0.1em]">{dayOfWeek(s.date)}</span>
                  <span className="text-[9px] text-[#6d675e]">{dayNum(s.date)}</span>
                </div>
                {s.theme && (
                  <p className="text-[10px] text-[#1A1917] leading-tight mb-1.5 line-clamp-2">{s.theme}</p>
                )}
                <div className="flex flex-wrap gap-1">
                  {ET_LABEL[s.engagementTool] && (
                    <span className="text-[8px] tracking-[0.1em] uppercase text-[#6d675e] border border-[#D9D3C6] px-1 py-0.5">
                      {ET_LABEL[s.engagementTool]}
                    </span>
                  )}
                  {s.isLaunchDay && (
                    <span className="text-[8px] tracking-[0.1em] uppercase text-[#9B2335] border border-[#9B2335]/30 px-1 py-0.5">
                      Launch
                    </span>
                  )}
                </div>
                {s.doneByClient && (
                  <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-[#2D6A4F]/20 flex items-center justify-center">
                    <svg width="7" height="7" viewBox="0 0 7 7" fill="none" stroke="#2D6A4F" strokeWidth="1.5">
                      <path d="M1 3.5l1.5 1.5 3-3" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
            {/* pad empty days if week < 7 */}
            {Array.from({ length: 7 - week.length }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-[#F7F5F0] min-h-[88px]" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
