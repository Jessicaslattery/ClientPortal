"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { redirect } from "next/navigation";

type State = { error?: string };

export async function setPasswordAction(
  token: string,
  _prev: State,
  formData: FormData
): Promise<State> {
  const password = (formData.get("password") as string)?.trim();
  const confirm = (formData.get("confirm") as string)?.trim();

  if (!password || password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirm) {
    return { error: "Passwords don't match." };
  }

  // Look up and validate the token
  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!record) return { error: "This link is invalid or has already been used." };
  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } });
    return { error: "This link has expired. Ask Jess to send a new invite." };
  }

  // Find the user by email (identifier)
  const user = await prisma.user.findUnique({
    where: { email: record.identifier },
    include: { clientProfile: true },
  });

  if (!user) return { error: "Account not found." };

  // Set the real password and consume the token atomically
  const hashed = await hashPassword(password);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    }),
    prisma.verificationToken.delete({ where: { token } }),
  ]);

  // Auto-login: create session cookie
  const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as "client",
    clientProfileId: user.clientProfile?.id,
    exp: Date.now() + SESSION_DURATION,
  };
  const sessionToken = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const cookieStore = await cookies();
  cookieStore.set("pivot_session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000,
    path: "/",
  });

  redirect("/home");
}
