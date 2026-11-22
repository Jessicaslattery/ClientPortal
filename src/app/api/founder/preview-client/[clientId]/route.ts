import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Creates a short-lived token so the founder can preview what a client sees
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const session = await requireAuth("founder");
  const { clientId } = await params;

  const client = await prisma.clientProfile.findUnique({
    where: { id: clientId },
    select: { id: true, userId: true, email: true, package: true, founderName: true },
  });

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

  await prisma.verificationToken.upsert({
    where: { token },
    create: { identifier: `preview:${client.userId}:${session.id}`, token, expires },
    update: { expires },
  });

  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  return NextResponse.redirect(`${appUrl}/preview-login/${token}`);
}
