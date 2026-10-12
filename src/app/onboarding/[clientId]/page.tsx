import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { IntakeForm } from "./IntakeForm";
import { Logo } from "@/components/ui/Logo";

export default async function IntakePage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;

  const client = await prisma.clientProfile.findUnique({
    where: { id: clientId },
    include: { businessContext_: true },
  });

  if (!client) notFound();

  const firstName = client.founderName.split(" ")[0];

  if (client.businessContext_?.submittedAt) {
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
            You&apos;re all set, {firstName}.
          </h1>
          <p className="text-sm text-[#5C5550] leading-7">
            You&apos;ve already completed this form · thank you. Jess will be in touch shortly to book
            your first call.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2EDE4]">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="flex justify-center mb-12">
          <Logo size="md" />
        </div>
        <div className="mb-10 text-center">
          <h1
            className="font-display text-4xl font-light tracking-wide text-[#E8E2D9] mb-3"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Business Context Intake
          </h1>
          <p className="text-sm text-[#5C5550]">
            Welcome, {firstName}. This form takes 15–20 minutes. The more honest and specific you
            are, the better your first session will be.
          </p>
        </div>
        <IntakeForm clientId={clientId} firstName={firstName} />
      </div>
    </div>
  );
}
