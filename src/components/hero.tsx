const flowSteps = [
  { label: "Field submission", detail: "Reporters and CFA members capture data on the ground" },
  { label: "Clean and validate", detail: "Automated checks catch structural and logic errors" },
  { label: "Human verification", detail: "Validators and verifiers review evidence and confirm" },
  { label: "Secure proof", detail: "Verified records are sealed into one tamper-evident proof" },
];

export function Hero() {
  return (
    <section
      id="top"
      className="relative isolate overflow-hidden"
      style={{ minHeight: "calc(100vh - 4rem)" }}
    >
      {/* ── Background image ── */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hero-bg.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      {/* ── Layered overlays: keep left col fully readable, let right col breathe ── */}
      {/* Base dark wash over the whole image */}
      <div className="absolute inset-0 bg-forest-950/75" />
      {/* Stronger left-to-right fade so left text column is always readable */}
      <div className="absolute inset-0 bg-gradient-to-r from-forest-950/90 via-forest-950/60 to-transparent" />
      {/* Subtle vertical vignette top + bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-forest-950/40 via-transparent to-forest-950/60" />

      {/* ── Content ── */}
      <div className="relative mx-auto grid max-w-7xl gap-16 px-6 py-24 lg:grid-cols-2 lg:items-center lg:py-32 lg:px-8">

        {/* Left column — text floats above dark overlay */}
        <div>
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-white backdrop-blur-sm">
            Unified Environmental Info Hub
          </span>

          <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl">
            One platform,{" "}
            <span className="text-forest-300">two hubs,</span>{" "}
            one shared trust layer
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-forest-100/90 drop-shadow">
            The SIHU News Hub and the CFA Conservation Hub turn scattered
            environmental and conservation information into structured,
            trustworthy records — verified by real people and backed by
            one shared proof layer.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="/dashboard"
              className="rounded-md bg-gold-500 px-6 py-3 text-sm font-semibold text-forest-950 shadow-lg shadow-gold-500/30 transition-all hover:bg-gold-400 hover:shadow-gold-400/40"
            >
              Enter the Platform
            </a>
            <a
              href="#hubs"
              className="rounded-md border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
            >
              Explore the hubs
            </a>
          </div>

          {/* Two-hub mini preview */}
          <div className="mt-12 grid grid-cols-2 gap-4 border-t border-white/10 pt-8">
            <div className="rounded-xl border border-lake-300/30 bg-lake-900/40 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-lake-300">SIHU</p>
              <p className="mt-1 text-sm font-medium text-white">Water &amp; Civic Reports</p>
              <p className="mt-1 text-xs text-forest-200/80">Lake Victoria Basin</p>
            </div>
            <div className="rounded-xl border border-forest-300/30 bg-forest-900/40 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-forest-300">CFA</p>
              <p className="mt-1 text-sm font-medium text-white">Forest Conservation</p>
              <p className="mt-1 text-xs text-forest-200/80">Community Forest Associations</p>
            </div>
          </div>
        </div>

        {/* Right column — frosted glass card */}
        <div className="relative">
          {/* Glow halo behind the card */}
          <div className="absolute -inset-4 rounded-3xl bg-forest-400/10 blur-2xl" />

          <div className="relative rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-md">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
                Record lifecycle
              </p>
              <span className="rounded-full border border-gold-400/40 bg-gold-500/20 px-2.5 py-1 text-xs font-medium text-gold-300 backdrop-blur-sm">
                Avalanche anchored
              </span>
            </div>

            <ol className="space-y-6">
              {flowSteps.map((step, index) => (
                <li key={step.label} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest-600/80 text-xs font-semibold text-white ring-1 ring-white/20 backdrop-blur-sm">
                      {index + 1}
                    </span>
                    {index < flowSteps.length - 1 && (
                      <span className="mt-1 h-full w-px flex-1 bg-white/15" />
                    )}
                  </div>
                  <div className="pb-2">
                    <p className="text-sm font-semibold text-white">
                      {step.label}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-white/65">
                      {step.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            {/* Trust badge */}
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <span className="h-2 w-2 shrink-0 rounded-full bg-gold-400 shadow-sm shadow-gold-400/60" />
              <p className="text-xs text-white/70">
                No wallets required — anchoring is automatic and invisible to field users.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
