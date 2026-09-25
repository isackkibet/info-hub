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
    <section id="trust-layer" className="border-b border-sand-200 bg-white">
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

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-sand-200 bg-sand-200 sm:grid-cols-2 lg:grid-cols-4">
          {pipeline.map((item) => (
            <div key={item.step} className="bg-white p-6">
              <span className="text-xs font-semibold tabular-nums text-forest-600">
                {item.step}
              </span>
              <h3 className="mt-3 text-base font-semibold text-ink-900">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">
                {item.detail}
              </p>
            </div>
          ))}
        </div>

        {/* Trust callout */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-forest-100 bg-forest-50 p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-forest-800">
              No wallets, no gas fees
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-700">
              Field users never sign a transaction or touch a wallet. The
              proof is created and anchored automatically, in the background,
              on their behalf.
            </p>
          </div>
          <div className="rounded-2xl border border-lake-100 bg-lake-50 p-6">
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
