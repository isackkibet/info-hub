"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { redirect } from "next/navigation";

export type LoginState = { error?: string };

export async function loginAction(
  _prevState: LoginState | undefined,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") ?? "/dashboard");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Incorrect email or password." };
    }
    // NextAuth throws a NEXT_REDIRECT — let it propagate
    throw error;
  }

  // Successful sign-in — redirect server-side
  redirect(callbackUrl);
}
