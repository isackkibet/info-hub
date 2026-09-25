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
    <main className="flex min-h-screen">
      {/* ── Left panel — background image (desktop only) ── */}
      <div className="relative hidden w-1/2 lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/auth-bg.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        {/* Dark forest overlay so branding text is readable */}
        <div className="absolute inset-0 bg-forest-950/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-950/30 to-forest-950/80" />

        {/* Branding overlay content */}
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white/10 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur-sm">
              KN
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-sm font-semibold tracking-wide text-white">KAI NUVARI</span>
              <span className="text-xs text-white/60">Environmental Info Hub</span>
            </span>
          </Link>

          <div>
            <h2 className="text-3xl font-semibold leading-tight text-white drop-shadow-lg">
              Environmental data<br />
              <span className="text-forest-300">you can trust.</span>
            </h2>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
              SIHU and CFA — two hubs, one shared proof layer, anchored on Avalanche.
            </p>

            {/* Hub badges */}
            <div className="mt-6 flex gap-3">
              <span className="rounded-full border border-lake-300/40 bg-lake-900/50 px-3 py-1 text-xs font-medium text-lake-300 backdrop-blur-sm">
                🌊 SIHU
              </span>
              <span className="rounded-full border border-forest-300/40 bg-forest-900/50 px-3 py-1 text-xs font-medium text-forest-300 backdrop-blur-sm">
                🌲 CFA
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-sand-50 px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile-only logo */}
          <div className="mb-8 flex flex-col items-center text-center lg:hidden">
            <Link href="/">
              <span className="flex h-11 w-11 items-center justify-center rounded-md bg-forest-900 text-sm font-semibold text-white">
                KN
              </span>
            </Link>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-forest-700">
              KAI NUVARI
            </p>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
            Sign in
          </h1>
          <p className="mt-1 text-sm text-ink-600">
            Access your SIHU and CFA workspaces.
          </p>

          {/* Success banner after registration */}
          {justRegistered && (
            <div className="mt-5 rounded-xl border border-forest-200 bg-forest-50 px-4 py-3 text-sm text-forest-800">
              ✓ Account created — sign in below to get started.
            </div>
          )}

          <div className="mt-8">
            <LoginForm callbackUrl={callbackUrl} />
          </div>

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
          <p className="mt-4 rounded-lg border border-sand-200 bg-sand-100 px-3 py-2 text-center text-xs text-ink-600">
            Demo:{" "}
            <span className="font-mono font-medium text-ink-800">demo@kainuvari.test</span>
            {" / "}
            <span className="font-mono font-medium text-ink-800">password123</span>
          </p>
        </div>
      </div>
    </main>
  );
}
