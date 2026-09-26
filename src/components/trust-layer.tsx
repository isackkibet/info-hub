const pipeline = [
  {
    step: "01",
    title: "Collected",
    detail: "Verified records synced daily from both hubs.",
  },
  {
    step: "02",
    title: "Fingerprinted",
    detail: "Each record combined into one proof.",
  },
  {
    step: "03",
    title: "Anchored",
    detail: "Written to Avalanche in a single transaction.",
  },
  {
    step: "04",
    title: "Auditable",
    detail: "Anyone can verify it was included, unchanged.",
  },
];

export function TrustLayer() {
  return (
    <section id="trust-layer" className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-wide text-forest-700">
            Shared trust layer
          </span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
            One proof, covering both hubs
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-700">
            Every verified record, from <strong className="font-semibold text-ink-900">either hub</strong>,
            joins the same daily audit trail.
          </p>
        </div>

        <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {pipeline.map((item) => (
            <div key={item.step}>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest-900 text-sm font-semibold tabular-nums text-white">
                {item.step}
              </span>
              <h3 className="mt-4 text-base font-semibold text-ink-900">
                {item.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-600">
                {item.detail}
              </p>
            </div>
          ))}
        </div>

        {/* Trust callout */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl bg-forest-50 p-6">
            <p className="text-sm font-semibold text-forest-800">
              No wallets. No gas fees.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-700">
              Anchoring happens automatically, in the background.
            </p>
          </div>
          <div className="rounded-2xl bg-lake-50 p-6">
            <p className="text-sm font-semibold text-lake-700">
              SIHU + CFA, one chain
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-700">
              One tamper-evident audit trail, anchored to Avalanche.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
