import Link from "next/link";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl ?? "/dashboard";

  return (
    <main className="flex min-h-screen items-center justify-center bg-sand-50 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link href="/" className="flex items-center gap-3">
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

        <LoginForm callbackUrl={callbackUrl} />

        <p className="mt-6 text-center text-xs text-ink-600">
          Demo account:{" "}
          <span className="font-mono font-medium text-ink-800">
            demo@kainuvari.test / password123
          </span>
        </p>
      </div>
    </main>
  );
}
