const principles = [
  {
    title: "Field-optimized UX",
    detail:
      "Low friction, offline-tolerant mobile entry, designed for low-connectivity areas.",
  },
  {
    title: "Evidence-first architecture",
    detail:
      "Every claim needs supporting context: photos, species breakdowns, GPS bounds, or participant logs.",
  },
  {
    title: "Clean data is not verified data",
    detail:
      "Clean data has passed automated checks. Verified data has passed human review. The two states are never conflated.",
  },
  {
    title: "Attributable and provenance-aware",
    detail:
      "Every record traces back to a specific contributor, hub, site, and timestamp.",
  },
  {
    title: "Quiet Web3",
    detail:
      "Wallet signatures and cryptographic hashes anchor records without requiring field users to touch gas fees or a wallet UI.",
  },
];

export function Principles() {
  return (
    <section id="principles" className="border-b border-forest-900/10 bg-sand-100/60">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-wide text-forest-700">
            Core principles
          </span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
            Observe, submit, verify, anchor
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-700">
            Observe on the ground, submit field data, clean and validate,
            attach evidence, verify independently, publish transparently,
            and unlock conservation finance.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {principles.map((principle) => (
            <div
              key={principle.title}
              className="rounded-2xl border border-forest-900/10 bg-white p-6"
            >
              <h3 className="text-base font-semibold text-ink-900">
                {principle.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                {principle.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
