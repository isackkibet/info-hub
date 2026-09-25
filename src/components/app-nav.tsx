"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/lib/auth-actions";

const sihuLinks = [
  { href: "/sihu/dashboard", label: "SIHU Hub" },
  { href: "/sihu/submit", label: "Submit Report" },
  { href: "/sihu/validator", label: "Validator Queue" },
  { href: "/sihu/my-reports", label: "My Reports" },
];

const cfaLinks = [
  { href: "/cfa/dashboard", label: "CFA Hub" },
  { href: "/cfa/nurseries", label: "Nurseries" },
  { href: "/cfa/inventory", label: "Inventory" },
  { href: "/cfa/verification", label: "Verification" },
];

export function AppNav() {
  const pathname = usePathname();

  const isSihu = pathname.startsWith("/sihu");
  const isCfa = pathname.startsWith("/cfa");

  return (
    <header className="sticky top-0 z-50 border-b border-sand-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-forest-900 text-sm font-semibold text-white">
            KN
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-wide text-ink-900">
              KAI NUVARI
            </span>
            <span className="text-xs text-ink-600">Environmental Info Hub</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden items-center gap-1 md:flex">
          {/* Dashboard — always visible */}
          <Link
            href="/dashboard"
            className={
              pathname === "/dashboard"
                ? "rounded-md bg-forest-900 px-3 py-2 text-sm font-medium text-white"
                : "rounded-md px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-sand-100 hover:text-ink-900"
            }
          >
            Dashboard
          </Link>

          {/* SIHU section divider + links */}
          <span className="mx-1 h-5 w-px bg-sand-200" />
          <span className="px-2 text-xs font-semibold uppercase tracking-wide text-lake-600">
            SIHU
          </span>
          {sihuLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  active
                    ? "rounded-md bg-lake-600 px-3 py-2 text-sm font-medium text-white"
                    : "rounded-md px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-lake-50 hover:text-lake-700"
                }
              >
                {link.label}
              </Link>
            );
          })}

          {/* CFA section divider + links */}
          <span className="mx-1 h-5 w-px bg-sand-200" />
          <span className="px-2 text-xs font-semibold uppercase tracking-wide text-forest-700">
            CFA
          </span>
          {cfaLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  active
                    ? "rounded-md bg-forest-900 px-3 py-2 text-sm font-medium text-white"
                    : "rounded-md px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-forest-50 hover:text-forest-700"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hidden rounded-md border border-sand-200 px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:border-sand-200 hover:bg-sand-50 sm:inline-block"
          >
            Overview
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded-md border border-sand-200 px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-sand-50"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>

      {/* Hub context bar — only shown inside a hub */}
      {(isSihu || isCfa) && (
        <div
          className={
            isSihu
              ? "border-t border-lake-100 bg-lake-50 px-6 py-1.5 lg:px-8"
              : "border-t border-forest-100 bg-forest-50 px-6 py-1.5 lg:px-8"
          }
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <span
              className={
                isSihu
                  ? "text-xs font-medium text-lake-700"
                  : "text-xs font-medium text-forest-700"
              }
            >
              {isSihu
                ? "SIHU: Sango Information Hub, Lake Victoria Basin"
                : "CFA: Community Forest Association Conservation Hub"}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gold-700">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
              {isSihu
                ? "Preview: saved in this browser only"
                : "Preview: ledger saved in this browser only"}
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
