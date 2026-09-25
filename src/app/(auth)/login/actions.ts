"use server";

import { signIn } from "@/auth";
import { AuthError, CredentialsSignin } from "next-auth";
import { unstable_rethrow } from "next/navigation";

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
    // In NextAuth v5, signIn() in a server action always throws a redirect
    // on success. We must let that redirect propagate — do NOT catch it.
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    unstable_rethrow(error);

    if (error instanceof CredentialsSignin) {
      return { error: "Incorrect email or password." };
    }

    if (error instanceof AuthError) {
      return {
        error: "Sign-in is temporarily unavailable. Please try again.",
      };
    }

    throw error;
  }

  return {};
}
