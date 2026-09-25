import Link from "next/link";

const navLinks = [
  { href: "#hubs", label: "The Two Hubs" },
  { href: "#trust-layer", label: "Trust Layer" },
  { href: "#principles", label: "Principles" },
  { href: "#build-plan", label: "Build Plan" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-forest-900/10 bg-sand-50/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="#top" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-forest-700 text-sm font-semibold text-sand-50">
            KN
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-wide text-ink-900">
              KAI NUVARI
            </span>
            <span className="text-xs text-ink-600">Info Hub</span>
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

        <div className="flex items-center gap-3">
          <a
            href="#build-plan"
            className="hidden rounded-md px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:text-forest-700 sm:inline-block"
          >
            Build Spec
          </a>
          <a
            href="#hubs"
            className="rounded-md bg-forest-700 px-4 py-2 text-sm font-medium text-sand-50 transition-colors hover:bg-forest-800"
          >
            Enter Platform
          </a>
        </div>
      </div>
    </header>
  );
}
