"use server";

import { signIn } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";

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
    // Next.js redirect() throws a special error — let it through
    if (isRedirectError(error)) {
      throw error;
    }
    // Everything else is a bad credential or config error
    return { error: "Incorrect email or password." };
  }

  return {};
}
