"use server";

import { logout } from "@/lib/auth";

export async function clientLogoutAction() {
  await logout();
}
