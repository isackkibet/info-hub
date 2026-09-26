import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

export function SiteFooter() {
  return (
    <footer className="bg-forest-950">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <BrandMark />
              <span className="flex flex-col leading-none">
                <span className="text-sm font-semibold tracking-wide text-white">
                  KAI NUVARI
                </span>
                <span className="text-xs text-white/50">Environmental Info Hub</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
              Environmental and conservation information, reported,
              verified, and anchored on-chain for permanent accountability.
            </p>
            <div className="mt-5 flex gap-2">
              <span className="rounded-full bg-lake-500/15 px-2.5 py-1 text-xs font-medium text-lake-300">
                SIHU
              </span>
              <span className="rounded-full bg-forest-500/15 px-2.5 py-1 text-xs font-medium text-forest-300">
                CFA
              </span>
            </div>
          </div>

          {/* Platform links */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/40">
              Platform
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a href="#hubs" className="text-white/70 hover:text-white">
                  The two hubs
                </a>
              </li>
              <li>
                <a href="#trust-layer" className="text-white/70 hover:text-white">
                  Trust layer
                </a>
              </li>
              <li>
                <a href="#principles" className="text-white/70 hover:text-white">
                  How it works
                </a>
              </li>
            </ul>
          </div>

          {/* Hub links */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/40">
              Hubs
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a href="/sihu/submit" className="text-white/70 hover:text-lake-300">
                  SIHU News Hub
                </a>
              </li>
              <li>
                <a href="/cfa/dashboard" className="text-white/70 hover:text-forest-300">
                  CFA Conservation Hub
                </a>
              </li>
            </ul>
          </div>

          {/* Get started CTA column */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/40">
              Get started
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="/register" className="text-white/70 hover:text-white">
                  Create an account
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-white/70 hover:text-white">
                  Sign in
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-white/70 hover:text-white">
                  Dashboard
                </Link>
              </li>
            </ul>

            {/* CTA card */}
            <div className="mt-6 rounded-xl bg-white/5 p-4">
              <p className="text-xs font-semibold text-white">
                New member?
              </p>
              <p className="mt-1 text-xs leading-relaxed text-white/60">
                Register your account. An admin will assign your hub membership.
              </p>
              <Link
                href="/register"
                className="mt-3 inline-block rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-forest-950 transition-colors hover:bg-white/90"
              >
                Register now →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-3 rounded-xl bg-white/5 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} KAI Nuvari, Unified Environmental Info Hub.
          </p>
          <div className="flex gap-4 text-xs text-white/50">
            <Link href="/login" className="hover:text-white">Sign in</Link>
            <Link href="/register" className="hover:text-white">Register</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
