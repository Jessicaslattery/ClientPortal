import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { SessionUser } from "@/lib/auth";
import crypto from "crypto";

const SESSION_COOKIE = "pivot_session";
const SECRET = process.env.SESSION_SECRET ?? "pivot-dev-secret-CHANGE-IN-PRODUCTION";

function hmac(data: string): string {
  return crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
}

async function signSession(payload: SessionUser): Promise<string> {
  const exp = Date.now() + 30 * 60 * 1000; // 30 min preview
  const encoded = Buffer.from(JSON.stringify({ ...payload, exp })).toString("base64url");
  return `${encoded}.${hmac(encoded)}`;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";

  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record || record.expires < new Date() || !record.identifier.startsWith("preview:")) {
    return NextResponse.redirect(`${appUrl}/login`);
  }

  const [, userId] = record.identifier.split(":");
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { clientProfile: true },
  });

  if (!user || user.role !== "client" || !user.clientProfile) {
    return NextResponse.redirect(`${appUrl}/login`);
  }

  await prisma.verificationToken.delete({ where: { token } });

  const pkg = (user.clientProfile.package ?? "consulting") as "sms" | "consulting";
  const sessionUser: SessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: "client",
    clientProfileId: user.clientProfile.id,
    package: pkg,
  };

  const sessionToken = await signSession(sessionUser);
  const isSecure = process.env.NODE_ENV === "production" && (appUrl ?? "").startsWith("https://");

  const destination = pkg === "sms" ? "/social/home" : "/home";
  const response = NextResponse.redirect(`${appUrl}${destination}`);
  response.cookies.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    maxAge: 30 * 60,
    path: "/",
  });

  return response;
}
