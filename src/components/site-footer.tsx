import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-sand-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-forest-900 text-sm font-semibold text-white">
                KN
              </span>
              <span className="flex flex-col leading-none">
                <span className="text-sm font-semibold tracking-wide text-ink-900">
                  KAI NUVARI
                </span>
                <span className="text-xs text-ink-600">Environmental Info Hub</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-600">
              Environmental and conservation information, reported,
              verified, and anchored on-chain for permanent accountability.
            </p>
            <div className="mt-5 flex gap-2">
              <span className="rounded-full border border-lake-200 bg-lake-50 px-2.5 py-1 text-xs font-medium text-lake-700">
                SIHU
              </span>
              <span className="rounded-full border border-forest-200 bg-forest-50 px-2.5 py-1 text-xs font-medium text-forest-700">
                CFA
              </span>
            </div>
          </div>

          {/* Platform links */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-600">
              Platform
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a href="#hubs" className="text-ink-700 hover:text-forest-700">
                  The two hubs
                </a>
              </li>
              <li>
                <a href="#trust-layer" className="text-ink-700 hover:text-forest-700">
                  Trust layer
                </a>
              </li>
              <li>
                <a href="#principles" className="text-ink-700 hover:text-forest-700">
                  How it works
                </a>
              </li>
            </ul>
          </div>

          {/* Hub links */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-600">
              Hubs
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a href="/sihu/submit" className="text-ink-700 hover:text-lake-700">
                  SIHU News Hub
                </a>
              </li>
              <li>
                <a href="/cfa/dashboard" className="text-ink-700 hover:text-forest-700">
                  CFA Conservation Hub
                </a>
              </li>
            </ul>
          </div>

          {/* Get started CTA column */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-600">
              Get started
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/register"
                  className="text-ink-700 hover:text-forest-700"
                >
                  Create an account
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-ink-700 hover:text-forest-700"
                >
                  Sign in
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-ink-700 hover:text-forest-700"
                >
                  Dashboard
                </Link>
              </li>
            </ul>

            {/* CTA card */}
            <div className="mt-6 rounded-xl bg-forest-50 p-4">
              <p className="text-xs font-semibold text-forest-800">
                New member?
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink-600">
                Register your account. An admin will assign your hub membership.
              </p>
              <Link
                href="/register"
                className="mt-3 inline-block rounded-md bg-forest-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-forest-800"
              >
                Register now →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-2 border-t border-sand-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink-600">
            © {new Date().getFullYear()} KAI Nuvari, Unified Environmental Info Hub.
          </p>
          <div className="flex gap-4 text-xs text-ink-600">
            <Link href="/login" className="hover:text-forest-700">Sign in</Link>
            <Link href="/register" className="hover:text-forest-700">Register</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
