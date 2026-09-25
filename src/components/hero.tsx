export function Hero() {
  return (
    <section
      id="top"
      className="relative isolate overflow-hidden"
      style={{ minHeight: "calc(100vh - 4rem)" }}
    >
      {/* Background image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hero-bg.jpg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      {/* Overlays — keep text readable */}
      <div className="absolute inset-0 bg-forest-950/70" />
      <div className="absolute inset-0 bg-linear-to-r from-forest-950/85 via-forest-950/50 to-forest-950/20" />
      <div className="absolute inset-0 bg-linear-to-b from-forest-950/20 via-transparent to-forest-950/40" />

      {/* Content */}
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center px-6 py-24 lg:px-8">
        <div className="max-w-2xl">
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-white backdrop-blur-sm">
            Unified Environmental Info Hub
          </span>

          <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl">
            One platform,{" "}
            <span className="text-forest-300">two hubs,</span>{" "}
            one shared trust layer
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80 drop-shadow">
            The SIHU News Hub and the CFA Conservation Hub turn scattered
            environmental and conservation information into structured,
            trustworthy records, verified by real people and backed by
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

          {/* Hub mini preview */}
          <div className="mt-12 grid grid-cols-2 gap-4 border-t border-white/10 pt-8">
            <div className="rounded-xl border border-lake-300/30 bg-lake-900/40 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-lake-300">SIHU</p>
              <p className="mt-1 text-sm font-medium text-white">Water &amp; Civic Reports</p>
              <p className="mt-1 text-xs text-white/60">Lake Victoria Basin</p>
            </div>
            <div className="rounded-xl border border-forest-300/30 bg-forest-900/40 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-forest-300">CFA</p>
              <p className="mt-1 text-sm font-medium text-white">Forest Conservation</p>
              <p className="mt-1 text-xs text-white/60">Community Forest Associations</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
