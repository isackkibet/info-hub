export function SiteFooter() {
  return (
    <footer className="bg-forest-950 text-sand-100">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-sand-50 text-sm font-semibold text-forest-800">
                KN
              </span>
              <span className="flex flex-col leading-none">
                <span className="text-sm font-semibold tracking-wide text-sand-50">
                  KAI NUVARI
                </span>
                <span className="text-xs text-forest-300">Info Hub</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-forest-200">
              The Info Hub section of the KAI Nuvari blockchain financial
              operating system for the green economy.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-forest-300">
                Platform
              </p>
              <ul className="mt-4 space-y-2 text-sm text-forest-200">
                <li>
                  <a href="#hubs" className="hover:text-sand-50">
                    The two hubs
                  </a>
                </li>
                <li>
                  <a href="#trust-layer" className="hover:text-sand-50">
                    Trust layer
                  </a>
                </li>
                <li>
                  <a href="#principles" className="hover:text-sand-50">
                    Principles
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-forest-300">
                Hubs
              </p>
              <ul className="mt-4 space-y-2 text-sm text-forest-200">
                <li>SIHU News Hub</li>
                <li>CFA Conservation Hub</li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-forest-300">
                Status
              </p>
              <ul className="mt-4 space-y-2 text-sm text-forest-200">
                <li>Build specification 2.0</li>
                <li>Unified platform</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-forest-800 pt-6 text-xs text-forest-300">
          KAI Nuvari, Unified Environmental Info Hub. Confidential build
          specification.
        </div>
      </div>
    </footer>
  );
}
