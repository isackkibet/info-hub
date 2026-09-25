import Link from "next/link";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
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
        <div className="absolute inset-0 bg-forest-950/70" />
        <div className="absolute inset-0 bg-linear-to-r from-forest-950/30 to-forest-950/80" />

        {/* Branding overlay */}
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
              Join the platform.<br />
              <span className="text-forest-300">Make it count.</span>
            </h2>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
              Create your account to access SIHU or CFA. An admin will assign
              your hub membership after you register.
            </p>

            <div className="mt-6 flex gap-3">
              <span className="rounded-full border border-lake-300/40 bg-lake-900/50 px-3 py-1 text-xs font-medium text-lake-300 backdrop-blur-sm">
                SIHU
              </span>
              <span className="rounded-full border border-forest-300/40 bg-forest-900/50 px-3 py-1 text-xs font-medium text-forest-300 backdrop-blur-sm">
                CFA
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
            Create your account
          </h1>
          <p className="mt-1 text-sm text-ink-600">
            Join SIHU or CFA, and an admin will assign your hub membership.
          </p>

          <div className="mt-8">
            <RegisterForm />
          </div>

          <p className="mt-6 text-center text-sm text-ink-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-forest-700 hover:text-forest-900 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
