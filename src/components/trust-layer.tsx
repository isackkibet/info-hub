const pipeline = [
  {
    step: "01",
    title: "Collect verified records",
    detail:
      "A daily cron job at 00:00 UTC, plus a manual trigger, gathers every verified SIHU submission and CFA activity that has no batch yet.",
  },
  {
    step: "02",
    title: "Hash and build a Merkle tree",
    detail:
      "Each record is hashed with SHA-256 over its id, payload, and creation time, source-agnostic across both hubs, then combined into one Merkle root.",
  },
  {
    step: "03",
    title: "Anchor on Avalanche",
    detail:
      "The root is committed on-chain through a single InfoHubAnchor contract call: one owner-gated transaction covering every included record.",
  },
  {
    step: "04",
    title: "Attach and audit",
    detail:
      "On success, every included record is stamped with the resulting batch id. On failure, nothing is attached and the next run retries automatically.",
  },
];

export function TrustLayer() {
  return (
    <section id="trust-layer" className="border-b border-forest-900/10">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-wide text-forest-700">
            Shared trust layer
          </span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
            One anchoring engine for both hubs
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-700">
            A verified SIHU report and a verified CFA planting record can
            land in the same on-chain batch. One contract, one daily
            transaction, one audit trail, regardless of which hub the
            record came from.
          </p>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-forest-900/10 bg-forest-900/10 sm:grid-cols-2 lg:grid-cols-4">
          {pipeline.map((item) => (
            <div key={item.step} className="bg-white p-6">
              <span className="text-xs font-semibold text-forest-500">
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

        <div className="mt-8 rounded-2xl border border-forest-900/10 bg-forest-950 p-8 text-sand-50">
          <p className="text-xs font-semibold uppercase tracking-wide text-forest-300">
            Quiet Web3
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-sand-100">
            Field users never sign a transaction and never touch a wallet
            UI or gas fees. Wallet signatures and cryptographic hashes
            anchor records to Avalanche entirely in the background, on
            their behalf.
          </p>
        </div>
      </div>
    </section>
  );
}
