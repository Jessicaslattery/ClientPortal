type PrepBrief = {
  id: string;
  content: string;
  approvedAt: Date | null;
  createdAt: Date;
  title: string;
};

export function CallPrepSection({ brief }: { brief: PrepBrief }) {
  return (
    <div className="rounded-3xl border border-[#E8E2D9] p-5">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-[10px] tracking-[0.15em] uppercase text-[#8C8277]">Call Prep</h3>
        <span className="text-[10px] text-[#2D6A4F] tracking-wide">
          {brief.approvedAt
            ? `Approved ${new Date(brief.approvedAt).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}`
            : `Generated ${new Date(brief.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}`}
        </span>
      </div>
      <div className="text-xs text-[#1A1714] leading-6 whitespace-pre-wrap font-mono">
        {brief.content}
      </div>
    </div>
  );
}
