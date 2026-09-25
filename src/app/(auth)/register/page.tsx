import Link from "next/link";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-sand-50 px-6 py-12">
      <div className="w-full max-w-sm">
        {/* Logo + heading */}
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
            Create your account
          </h1>
          <p className="mt-1 text-sm text-ink-600">
            Join SIHU or CFA, and an admin will assign your hub membership.
          </p>
        </div>

        <RegisterForm />

        {/* Link back to login */}
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
    </main>
  );
}
