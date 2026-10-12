import { prisma } from "@/lib/db";
import { SetPasswordForm } from "./SetPasswordForm";

export default async function SetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Pre-validate so we can show a meaningful error server-side
  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });

  const expired = record && record.expires < new Date();
  const invalid = !record;

  if (invalid || expired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2EDE4] px-4">
        <div className="w-full max-w-sm text-center space-y-4">
          <h1 className="font-display text-3xl font-light tracking-widest text-[#1A1714] uppercase">
            Pivot Co.
          </h1>
          <div className="rounded-3xl border border-[#DDD5C8] bg-[#FFFFFF] px-8 py-10"
            style={{ boxShadow: "0 1px 3px rgba(92,71,48,0.08)" }}
          >
            <p className="text-sm text-[#1A1714] mb-2">
              {expired ? "This invite link has expired." : "This link is invalid or has already been used."}
            </p>
            <p className="text-xs text-[#8C8277]">
              Contact Jess to receive a new invite.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Get first name from the user record for a personalised greeting
  const user = await prisma.user.findUnique({
    where: { email: record.identifier },
    select: { name: true },
  });
  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2EDE4] px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Wordmark */}
        <div className="text-center">
          <h1 className="font-display text-4xl font-light tracking-[0.2em] text-[#1A1714] uppercase">
            Pivot Co.
          </h1>
          <p className="mt-2 text-xs tracking-[0.15em] text-[#8C8277] uppercase">
            Client Portal
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-[#DDD5C8] bg-[#FFFFFF] px-8 py-10"
          style={{ boxShadow: "0 1px 3px rgba(92,71,48,0.08)" }}
        >
          <p className="text-sm text-[#1A1714] mb-1">
            Welcome, {firstName}.
          </p>
          <p className="text-xs text-[#8C8277] mb-8 leading-relaxed">
            Set a password to access your dashboard.
          </p>

          <SetPasswordForm token={token} />
        </div>

        <p className="text-center text-xs text-[#8C8277] tracking-wider">
          Strategic business refinement for founder-led brands.
        </p>
      </div>
    </div>
  );
}
