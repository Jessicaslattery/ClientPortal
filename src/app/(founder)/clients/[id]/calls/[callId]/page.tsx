import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CallNotesForm } from "@/components/founder/CallNotesForm";

export default async function CallNotesPage({
  params,
}: {
  params: Promise<{ id: string; callId: string }>;
}) {
  await requireAuth("founder");
  const { id, callId } = await params;

  const call = await prisma.call.findUnique({
    where: { id: callId, clientProfileId: id },
  });
  const client = await prisma.clientProfile.findUnique({ where: { id } });

  if (!call || !client) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Link href={`/clients/${id}`} className="text-xs text-[#b0a89e] hover:text-[#7a7268] transition-colors">
            {client.founderName}
          </Link>
          <span className="text-[#EDEBE6]">/</span>
          <span className="text-xs text-[#7a7268]">Call notes</span>
        </div>
        <h1 className="text-4xl font-[300] tracking-tight text-[#1A1917]">{call.title}</h1>
        <p className="mt-1 text-sm text-[#7a7268]">
          {new Date(call.scheduledAt).toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      <CallNotesForm clientId={id} callId={callId} call={{
        transcript: call.transcript,
        summaryContent: call.summaryContent,
        keyDecisions: call.keyDecisions,
        nextSteps: call.nextSteps,
        completedAt: call.completedAt?.toISOString() ?? null,
        notesUrl: call.notesUrl ?? null,
      }} />
    </div>
  );
}
