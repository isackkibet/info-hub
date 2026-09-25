const pipeline = [
  {
    step: "01",
    title: "Records are collected",
    detail:
      "Every verified report and activity from both hubs is gathered automatically, once a day.",
  },
  {
    step: "02",
    title: "A single proof is built",
    detail:
      "Each record gets a unique digital fingerprint, and all of them are combined into one proof.",
  },
  {
    step: "03",
    title: "The proof is anchored",
    detail:
      "That proof is written to the Avalanche blockchain in one transaction, covering every record in the batch.",
  },
  {
    step: "04",
    title: "Records become auditable",
    detail:
      "Anyone can later confirm a record was included, and that it has not been changed since.",
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
            A verified SIHU report and a verified CFA planting record can
            land in the same daily proof. One system, one audit trail,
            regardless of which hub the record came from.
          </p>
        </div>

        <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {pipeline.map((item, index) => (
            <div key={item.step} className="relative pl-1">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest-900 text-sm font-semibold tabular-nums text-white">
                  {item.step}
                </span>
                {index < pipeline.length - 1 && (
                  <span className="hidden h-px flex-1 bg-sand-200 lg:block" />
                )}
              </div>
              <h3 className="mt-4 text-base font-semibold text-ink-900">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                {item.detail}
              </p>
            </div>
          ))}
        </div>

        {/* Trust callout */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl bg-forest-50 p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-forest-800">
              No wallets, no gas fees
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-700">
              Field users never sign a transaction or touch a wallet. The
              proof is created and anchored automatically, in the background,
              on their behalf.
            </p>
          </div>
          <div className="rounded-2xl bg-lake-50 p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-lake-700">
              SIHU + CFA, one chain
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-700">
              Water reports and forest records share the same daily proof
              batch, anchored once to the Avalanche C-Chain. One tamper-evident
              audit trail for both hubs.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
