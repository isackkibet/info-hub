import Link from "next/link";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; registered?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl ?? "/dashboard";
  const justRegistered = params.registered === "1";

  return (
    <main className="flex min-h-screen items-center justify-center bg-sand-50 px-6 py-12">
      <div className="w-full max-w-sm">
        {/* Logo + heading */}
        <div className="mb-8 flex flex-col items-center text-center">
          <Link href="/">
            <span className="flex h-11 w-11 items-center justify-center rounded-md bg-forest-900 text-sm font-semibold text-white">
              KN
            </span>
          </Link>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-forest-700">
            KAI NUVARI
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink-900">
            Sign in to Info Hub
          </h1>
          <p className="mt-1 text-sm text-ink-600">
            Access your SIHU and CFA workspaces.
          </p>
        </div>

        {/* Success banner after registration */}
        {justRegistered && (
          <div className="mb-6 rounded-xl bg-forest-50 px-4 py-3 text-sm text-forest-800">
            Account created. Sign in below to get started.
          </div>
        )}

        <LoginForm callbackUrl={callbackUrl} />

        {/* Register link */}
        <p className="mt-6 text-center text-sm text-ink-600">
          New to KAI Nuvari?{" "}
          <Link
            href="/register"
            className="font-medium text-forest-700 hover:text-forest-900 hover:underline"
          >
            Create an account
          </Link>
        </p>

        {/* Demo hint */}
        <p className="mt-4 text-center text-xs text-ink-600">
          Demo:{" "}
          <span className="font-mono font-medium text-ink-800">
            demo@kainuvari.test
          </span>{" "}
          /{" "}
          <span className="font-mono font-medium text-ink-800">
            password123
          </span>
        </p>
      </div>
    </main>
  );
}
