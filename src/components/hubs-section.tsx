const hubs = [
  {
    name: "SIHU News Hub",
    tag: "Sango Information Hub",
    accent: "lake" as const,
    description:
      "A lean civic media desk for environmental and human-rights reporting across the Lake Victoria Basin. Optimized for speed and zero cost: no file uploads, no cloud storage, no crypto friction.",
    points: [
      "Water hyacinth tracking, pollution alerts, and blue-economy news",
      "Field reporters submit a title, category, location, and a public media link",
      "Community validators review and approve or reject with a reason",
      "Status moves from Pending to Verified or Rejected, then Batched",
    ],
    persona: "Built for field reporters and community validators",
  },
  {
    name: "CFA Conservation Hub",
    tag: "Community Forest Association System",
    accent: "forest" as const,
    description:
      "The full-depth forest conservation system for Community Forest Associations and Kenya Forest Service partners: nurseries, species inventory, and a structured verification network.",
    points: [
      "Multi-site tree nurseries and time-aware planting and mortality logs",
      "Species registry with indigenous and exotic classification",
      "Offline-tolerant mobile field submission with evidence uploads",
      "Verification pipeline: Raw, Clean, Verified, then Anchored",
    ],
    persona: "Built for CFA members, site managers, and verifiers",
  },
];

export function HubsSection() {
  return (
    <section id="hubs" className="border-b border-forest-900/10 bg-sand-100/60">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-wide text-forest-700">
            Two hubs
          </span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
            Purpose-built for two different jobs
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-700">
            SIHU data is a claim, a piece of evidence, and a verdict. CFA
            data carries real structure: nursery stock, survival rates, and
            site boundaries that conservation finance needs to query
            directly. Keeping them as two hubs avoids overengineering SIHU
            and avoids flattening away CFA&apos;s inventory logic.
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          {hubs.map((hub) => (
            <div
              key={hub.name}
              className="flex flex-col rounded-2xl border border-forest-900/10 bg-white p-8"
            >
              <div className="flex items-center justify-between">
                <span
                  className={
                    hub.accent === "forest"
                      ? "text-xs font-semibold uppercase tracking-wide text-forest-700"
                      : "text-xs font-semibold uppercase tracking-wide text-lake-600"
                  }
                >
                  {hub.tag}
                </span>
                <span
                  className={
                    hub.accent === "forest"
                      ? "h-2 w-2 rounded-full bg-forest-500"
                      : "h-2 w-2 rounded-full bg-lake-500"
                  }
                />
              </div>

              <h3 className="mt-3 text-2xl font-semibold text-ink-900">
                {hub.name}
              </h3>

              <p className="mt-4 text-sm leading-relaxed text-ink-700">
                {hub.description}
              </p>

              <ul className="mt-6 space-y-3 border-t border-forest-900/10 pt-6">
                {hub.points.map((point) => (
                  <li key={point} className="flex gap-3 text-sm text-ink-700">
                    <span
                      className={
                        hub.accent === "forest"
                          ? "mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-forest-500"
                          : "mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lake-500"
                      }
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-6 text-xs font-medium text-ink-600">
                {hub.persona}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
