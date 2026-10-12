import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Logo } from "@/components/ui/Logo";

export default async function ThankYouPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;

  const client = await prisma.clientProfile.findUnique({
    where: { id: clientId },
    select: { founderName: true },
  });

  if (!client) notFound();

  const firstName = client.founderName.split(" ")[0];

  return (
    <div className="min-h-screen bg-[#F2EDE4] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-10">
          <Logo size="md" />
        </div>
        <h1
          className="font-display text-3xl font-light tracking-wide text-[#E8E2D9] mb-4"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          Thank you, {firstName}.
        </h1>
        <p className="text-sm text-[#5C5550] leading-7">
          Jess will review everything and be in touch soon to book your first call.
        </p>
      </div>
    </div>
  );
}
