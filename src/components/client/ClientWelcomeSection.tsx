"use client";

function getLoomEmbedUrl(url: string): string | null {
  const match = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
  if (match) return `https://www.loom.com/embed/${match[1]}`;
  return null;
}

function getYouTubeEmbedUrl(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  return null;
}

type Props = {
  welcomeVideoUrl: string | null;
  kickoffCallUrl: string | null;
  termsPath: string;
};

export function ClientWelcomeSection({ welcomeVideoUrl, kickoffCallUrl, termsPath }: Props) {
  const hasContent = welcomeVideoUrl || kickoffCallUrl;
  if (!hasContent) return null;

  const embedUrl = welcomeVideoUrl
    ? (getLoomEmbedUrl(welcomeVideoUrl) ?? getYouTubeEmbedUrl(welcomeVideoUrl))
    : null;

  return (
    <div className="space-y-5">
      {welcomeVideoUrl && (
        <div className="rounded-2xl border border-[#EDEBE6] bg-[#FFFFFF] p-5">
          <p className="text-[10px] tracking-[0.15em] uppercase text-[#7a7268] mb-4">Welcome video</p>
          {embedUrl ? (
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <iframe
                src={embedUrl}
                className="absolute inset-0 w-full h-full rounded-xl"
                allowFullScreen
                allow="autoplay; fullscreen"
              />
            </div>
          ) : (
            <a
              href={welcomeVideoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#8C735A] underline underline-offset-2 hover:opacity-70 transition-opacity"
            >
              Watch welcome video ↗
            </a>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {kickoffCallUrl && (
          <a
            href={kickoffCallUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-4 rounded-2xl border border-[#EDEBE6] bg-[#FFFFFF] px-5 py-4 hover:border-[#C8B89A] transition-colors group"
          >
            <div>
              <p className="text-xs font-medium text-[#1A1917] group-hover:text-[#8C735A] transition-colors">Book your kickoff call</p>
              <p className="text-[10px] text-[#b0a89e] mt-0.5">Schedule your first session</p>
            </div>
            <span className="text-[#b0a89e] group-hover:text-[#8C735A] transition-colors text-lg">→</span>
          </a>
        )}
        <a
          href={termsPath}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between gap-4 rounded-2xl border border-[#EDEBE6] bg-[#FFFFFF] px-5 py-4 hover:border-[#C8B89A] transition-colors group"
        >
          <div>
            <p className="text-xs font-medium text-[#1A1917] group-hover:text-[#8C735A] transition-colors">Terms & Conditions</p>
            <p className="text-[10px] text-[#b0a89e] mt-0.5">Read your service agreement</p>
          </div>
          <span className="text-[#b0a89e] group-hover:text-[#8C735A] transition-colors text-lg">→</span>
        </a>
      </div>
    </div>
  );
}
