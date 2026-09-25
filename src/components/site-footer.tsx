export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-forest-600 text-sm font-semibold text-white">
                KN
              </span>
              <span className="flex flex-col leading-none">
                <span className="text-sm font-semibold tracking-wide text-ink-900">
                  KAI NUVARI
                </span>
                <span className="text-xs text-ink-600">Info Hub</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-600">
              Environmental and conservation information, reported,
              verified, and made trustworthy.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-600">
                Platform
              </p>
              <ul className="mt-4 space-y-2 text-sm text-ink-700">
                <li>
                  <a href="#hubs" className="hover:text-forest-700">
                    The two hubs
                  </a>
                </li>
                <li>
                  <a href="#trust-layer" className="hover:text-forest-700">
                    Trust layer
                  </a>
                </li>
                <li>
                  <a href="#principles" className="hover:text-forest-700">
                    How it works
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-600">
                Hubs
              </p>
              <ul className="mt-4 space-y-2 text-sm text-ink-700">
                <li>SIHU News Hub</li>
                <li>CFA Conservation Hub</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-200 pt-6 text-xs text-ink-600">
          KAI Nuvari, Unified Environmental Info Hub.
        </div>
      </div>
    </footer>
  );
}
