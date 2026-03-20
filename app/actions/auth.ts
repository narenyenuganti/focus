"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createSessionToken,
  isPasswordValid,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";

export async function unlockTracker(formData: FormData) {
  const password = String(formData.get("password") ?? "");

  if (!isPasswordValid(password)) {
    redirect("/login?error=invalid-password");
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect("/");
}

export async function logoutTracker() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/login");
}
