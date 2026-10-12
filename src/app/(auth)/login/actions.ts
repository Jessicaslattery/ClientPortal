"use server";

import { login } from "@/lib/auth";
import { redirect } from "next/navigation";

type State = { error: string };

export async function loginAction(_prev: State, formData: FormData): Promise<State> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const result = await login(email, password);
  if (result.error) {
    return { error: result.error };
  }

  if (result.role === "founder") {
    redirect("/dashboard");
  } else {
    redirect("/home");
  }
}
