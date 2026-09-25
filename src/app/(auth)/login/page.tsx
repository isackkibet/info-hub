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
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-forest-600 text-sm font-semibold text-white">
              KN
            </span>
          </Link>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink-900">
            Sign in to Info Hub
          </h1>
          <p className="mt-1 text-sm text-ink-600">
            Access your SIHU and CFA workspaces.
          </p>
        </div>

        <LoginForm callbackUrl={callbackUrl} />

        <p className="mt-6 text-center text-xs text-ink-600">
          Demo account: demo@kainuvari.test / password123
        </p>
      </div>
    </main>
  );
}
