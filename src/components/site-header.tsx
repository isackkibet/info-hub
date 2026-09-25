import Link from "next/link";

const navLinks = [
  { href: "#hubs", label: "The Two Hubs" },
  { href: "#trust-layer", label: "Trust Layer" },
  { href: "#principles", label: "Principles" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-sand-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="#top" className="flex items-center gap-3">
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

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-700 transition-colors hover:text-forest-700"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <Link
          href="/dashboard"
          className="rounded-md bg-forest-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-forest-800"
        >
          Enter Platform
        </Link>
      </div>
    </header>
  );
}
