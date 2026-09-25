export function SiteFooter() {
  return (
    <footer className="border-t border-sand-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
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
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-600">
              Environmental and conservation information, reported,
              verified, and made trustworthy.
            </p>
            {/* Hub badges */}
            <div className="mt-5 flex gap-2">
              <span className="rounded-full border border-lake-200 bg-lake-50 px-2.5 py-1 text-xs font-medium text-lake-700">
                SIHU
              </span>
              <span className="rounded-full border border-forest-200 bg-forest-50 px-2.5 py-1 text-xs font-medium text-forest-700">
                CFA
              </span>
            </div>
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
                <li>
                  <a href="/sihu/submit" className="hover:text-lake-700">
                    SIHU News Hub
                  </a>
                </li>
                <li>
                  <a href="/cfa/dashboard" className="hover:text-forest-700">
                    CFA Conservation Hub
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-sand-200 pt-6 text-xs text-ink-600">
          KAI Nuvari, Unified Environmental Info Hub.
        </div>
      </div>
    </footer>
  );
}
