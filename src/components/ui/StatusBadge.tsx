type Status = "active" | "pending" | "complete" | "alert" | "gold";

const styles: Record<Status, string> = {
  active:   "bg-[#EAF3DE] text-[#2D6A4F] border-[#C6E0B8]",
  complete: "bg-[#EAF3DE] text-[#2D6A4F] border-[#C6E0B8]",
  pending:  "bg-[#FEF3C7] text-[#B7791F] border-[#F6D98A]",
  alert:    "bg-[#FBEAF0] text-[#9B2335] border-[#EDB8C4]",
  gold:     "bg-[#FDF6EE] text-[#B7791F] border-[#E8D5B4]",
};

export function StatusBadge({
  label,
  status = "gold",
}: {
  label: string;
  status?: Status;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] tracking-[0.12em] uppercase border ${styles[status]}`}
    >
      {label}
    </span>
  );
}
