"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import crypto from "crypto";

const SESSION_COOKIE = "pivot_session";
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
const SECRET = process.env.SESSION_SECRET ?? "pivot-dev-secret-CHANGE-IN-PRODUCTION";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: "founder" | "client";
  clientProfileId?: string;
};

function hmac(data: string): string {
  return crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
}

async function signSession(payload: SessionUser): Promise<string> {
  const encoded = Buffer.from(
    JSON.stringify({ ...payload, exp: Date.now() + SESSION_DURATION })
  ).toString("base64url");
  return `${encoded}.${hmac(encoded)}`;
}

async function verifySession(token: string): Promise<SessionUser | null> {
  try {
    const dot = token.lastIndexOf(".");
    if (dot === -1) return null;
    const encoded = token.slice(0, dot);
    const sig = token.slice(dot + 1);
    if (sig !== hmac(encoded)) return null; // tampered
    const data = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    if (data.exp < Date.now()) return null;
    return data as SessionUser;
  } catch {
    return null;
  }
}

export async function login(email: string, password: string): Promise<{ error?: string; role?: string }> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: "Invalid email or password." };

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return { error: "Invalid email or password." };

  let clientProfileId: string | undefined;
  if (user.role === "client") {
    const profile = await prisma.clientProfile.findUnique({ where: { userId: user.id } });
    clientProfileId = profile?.id;
  }

  const sessionUser: SessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as "founder" | "client",
    clientProfileId,
  };

  const token = await signSession(sessionUser);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" && (process.env.APP_URL ?? "").startsWith("https://"),
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000,
    path: "/",
  });

  return { role: user.role };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function requireAuth(role?: "founder" | "client"): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (role && session.role !== role) redirect("/login");
  return session;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
