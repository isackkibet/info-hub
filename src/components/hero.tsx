const flowSteps = [
  { label: "Field submission", detail: "Reporters and CFA members capture data on the ground" },
  { label: "Clean and validate", detail: "Automated checks catch structural and logic errors" },
  { label: "Human verification", detail: "Validators and verifiers review evidence and confirm" },
  { label: "Secure proof", detail: "Verified records are sealed into one tamper-evident proof" },
];

export function Hero() {
  return (
    <section id="top" className="relative isolate overflow-hidden bg-forest-950">
      {/*
        Background image slot.
        Drop a photo in here later, e.g.:
          <Image src="/hero.jpg" alt="" fill priority className="object-cover" />
        placed as the first child of this section, before the gradient overlay below.
        The gradient stays on top of it so the text keeps its contrast either way.
      */}
      <div className="absolute inset-0 bg-linear-to-br from-forest-950 via-forest-900 to-forest-800" />
      <div className="absolute inset-0 bg-linear-to-r from-forest-950/95 via-forest-950/70 to-forest-950/30" />

      <div className="relative mx-auto grid max-w-7xl gap-16 px-6 py-24 lg:grid-cols-2 lg:items-center lg:py-32 lg:px-8">
        {/* Left column */}
        <div>
          <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-gold-200">
            Unified Environmental Info Hub
          </span>

          <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            One platform, two hubs, one shared trust layer
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-forest-100">
            The SIHU News Hub and the CFA Conservation Hub turn scattered
            environmental and conservation information into structured,
            trustworthy records, verified by real people and backed by
            one shared proof layer.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="/dashboard"
              className="rounded-md bg-gold-500 px-6 py-3 text-sm font-semibold text-forest-950 transition-colors hover:bg-gold-400"
            >
              Enter the Platform
            </a>
            <a
              href="#hubs"
              className="rounded-md border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Explore the hubs
            </a>
          </div>

          {/* Two-hub mini preview */}
          <div className="mt-12 grid grid-cols-2 gap-4 border-t border-white/10 pt-8">
            <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-wide text-lake-300">SIHU</p>
              <p className="mt-1 text-sm font-medium text-white">Water &amp; Civic Reports</p>
              <p className="mt-1 text-xs text-forest-200">Lake Victoria Basin</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-wide text-gold-300">CFA</p>
              <p className="mt-1 text-sm font-medium text-white">Forest Conservation</p>
              <p className="mt-1 text-xs text-forest-200">Community Forest Associations</p>
            </div>
          </div>
        </div>

        {/* Right column: record lifecycle card, floats above the background */}
        <div className="relative">
          <div className="rounded-2xl border border-white/15 bg-white/95 p-8 shadow-xl backdrop-blur">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-600">
                Record lifecycle
              </p>
              <span className="rounded-full border border-forest-200 bg-forest-50 px-2.5 py-1 text-xs font-medium text-forest-700">
                Avalanche anchored
              </span>
            </div>
            <ol className="space-y-6">
              {flowSteps.map((step, index) => (
                <li key={step.label} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest-900 text-xs font-semibold text-white">
                      {index + 1}
                    </span>
                    {index < flowSteps.length - 1 && (
                      <span className="mt-1 h-full w-px flex-1 bg-sand-200" />
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

            {/* Trust badge at the bottom */}
            <div className="mt-6 flex items-center gap-2 rounded-lg border border-sand-200 bg-sand-50 px-4 py-3">
              <span className="h-2 w-2 rounded-full bg-gold-500" />
              <p className="text-xs text-ink-700">
                No wallets required, anchoring is automatic and invisible to
                field users.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
