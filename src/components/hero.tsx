const flowSteps = [
  { label: "Field submission", detail: "Reporters and CFA members capture data on the ground" },
  { label: "Clean and validate", detail: "Automated checks catch structural and logic errors" },
  { label: "Human verification", detail: "Validators and verifiers review evidence and confirm" },
  { label: "Secure proof", detail: "Verified records are sealed into one tamper-evident proof" },
];

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden border-b border-slate-200">
      <div className="mx-auto grid max-w-7xl gap-16 px-6 py-20 lg:grid-cols-2 lg:items-center lg:py-28 lg:px-8">
        <div>
          <span className="inline-flex items-center rounded-full border border-forest-200 bg-forest-50 px-3 py-1 text-xs font-medium tracking-wide text-forest-700">
            Unified Environmental Info Hub
          </span>

          <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
            One platform, two hubs, one shared trust layer
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-700">
            The SIHU News Hub and the CFA Conservation Hub turn scattered
            environmental and conservation information into structured,
            trustworthy records, verified by real people and backed by
            one shared proof layer.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="/dashboard"
              className="rounded-md bg-forest-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-forest-700"
            >
              Enter the Platform
            </a>
            <a
              href="#trust-layer"
              className="rounded-md border border-slate-200 px-6 py-3 text-sm font-semibold text-ink-800 transition-colors hover:border-forest-300 hover:text-forest-700"
            >
              How it works
            </a>
          </div>

          <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-slate-200 pt-8">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-600">
                Hubs
              </dt>
              <dd className="mt-1 text-2xl font-semibold text-ink-900">2</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-600">
                Identity layer
              </dt>
              <dd className="mt-1 text-2xl font-semibold text-ink-900">1</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-600">
                Anchoring chain
              </dt>
              <dd className="mt-1 text-2xl font-semibold text-ink-900">Avalanche</dd>
            </div>
          </dl>
        </div>

        <div className="relative">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-600">
              Record lifecycle
            </p>
            <ol className="mt-6 space-y-6">
              {flowSteps.map((step, index) => (
                <li key={step.label} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest-600 text-xs font-semibold text-white">
                      {index + 1}
                    </span>
                    {index < flowSteps.length - 1 && (
                      <span className="mt-1 h-full w-px flex-1 bg-slate-200" />
                    )}
                  </div>
                  <div className="pb-2">
                    <p className="text-sm font-semibold text-ink-900">
                      {step.label}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-600">
                      {step.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
