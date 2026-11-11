"use client";

type Post = { id: string; title: string; format: string; pillar: string; reach: number; likes: number; saves: number; comments: number };

const FORMAT_LABEL: Record<string, string> = { reel: "Reel", carousel: "Carousel", static: "Static" };
const PILLAR_LABEL: Record<string, string> = {
  training: "Training", nutrition: "Nutrition", results: "Results", personal_brand: "Personal Brand",
};

function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

export function TopPosts({ posts }: { posts: Post[] }) {
  if (!posts.length) return null;
  return (
    <section className="space-y-4">
      <p className="text-[10px] tracking-[0.28em] uppercase text-[#6d675e]">Top posts this month</p>
      <div className="space-y-px bg-[#D9D3C6]">
        {posts.map((p, i) => (
          <div key={p.id} className="bg-white px-5 py-4 flex items-start gap-4">
            <span className="text-xs text-[#6d675e] w-5 shrink-0 pt-0.5">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#1A1917] leading-snug">{p.title}</p>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span className="text-[10px] text-[#6d675e]">{FORMAT_LABEL[p.format]}</span>
                <span className="text-[10px] text-[#6d675e]">{PILLAR_LABEL[p.pillar]}</span>
              </div>
            </div>
            <div className="flex items-center gap-6 shrink-0 text-right">
              <div>
                <p className="text-xs font-medium text-[#1A1917]">{fmt(p.reach)}</p>
                <p className="text-[9px] text-[#6d675e] uppercase tracking-[0.1em]">reach</p>
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-medium text-[#1A1917]">{fmt(p.saves)}</p>
                <p className="text-[9px] text-[#6d675e] uppercase tracking-[0.1em]">saves</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
