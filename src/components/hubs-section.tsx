import Link from "next/link";

const hubs = [
  {
    name: "SIHU News Hub",
    tag: "Sango Information Hub",
    accent: "lake" as const,
    description:
      "A fast, simple way to report environmental and human-rights news across the Lake Victoria Basin. No file uploads, no extra apps, no cost to the reporter.",
    points: [
      "Water hyacinth tracking, pollution alerts, and blue-economy news",
      "Reporters submit a title, category, location, and a public media link",
      "Community validators review each report and approve or reject it",
      "Every report shows its status: pending, verified, or rejected",
    ],
    persona: "Built for field reporters and community validators",
    ctaHref: "/sihu/submit",
    ctaLabel: "Submit a report",
    secondaryHref: "/sihu/my-reports",
    secondaryLabel: "View reports",
  },
  {
    name: "CFA Conservation Hub",
    tag: "Community Forest Association System",
    accent: "forest" as const,
    description:
      "A complete conservation record-keeping system for Community Forest Associations: nurseries, tree species, and a structured verification process.",
    points: [
      "Tracks multiple sites, nurseries, and planting activity over time",
      "A species registry with indigenous and exotic classification",
      "Works offline in the field and syncs when connection returns",
      "Every submission is checked, then verified by a real person",
    ],
    persona: "Built for CFA members, site managers, and verifiers",
    ctaHref: "/cfa/dashboard",
    ctaLabel: "Open CFA dashboard",
    secondaryHref: "/dashboard",
    secondaryLabel: "My account",
  },
];

export function HubsSection() {
  return (
    <section id="hubs" className="border-b border-sand-200 bg-sand-50">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-wide text-forest-700">
            Two hubs
          </span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
            Built for two different jobs
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-700">
            News reporting and forest conservation need different tools.
            SIHU keeps reporting quick and simple. CFA carries the deeper
            record-keeping that conservation work actually needs.
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          {hubs.map((hub) => (
            <div
              key={hub.name}
              className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-lg shadow-forest-950/5"
            >
              {/* Accent strip */}
              <div
                className={
                  hub.accent === "forest"
                    ? "h-1.5 w-full bg-forest-600"
                    : "h-1.5 w-full bg-lake-600"
                }
              />

              <div className="flex flex-1 flex-col p-8">
                {/* Title leads, tag follows as a small subtitle underneath */}
                <h3 className="text-2xl font-semibold text-ink-900">
                  {hub.name}
                </h3>
                <p
                  className={
                    hub.accent === "forest"
                      ? "mt-1 text-xs font-semibold uppercase tracking-wide text-forest-700"
                      : "mt-1 text-xs font-semibold uppercase tracking-wide text-lake-700"
                  }
                >
                  {hub.tag}
                </p>

                <p className="mt-4 text-sm leading-relaxed text-ink-700">
                  {hub.description}
                </p>

                <ul className="mt-6 space-y-3 border-t border-sand-200 pt-6">
                  {hub.points.map((point) => (
                    <li key={point} className="flex gap-3 text-sm text-ink-700">
                      <span
                        className={
                          hub.accent === "forest"
                            ? "mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-forest-600"
                            : "mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lake-600"
                        }
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-6 text-xs font-medium text-ink-600">
                  {hub.persona}
                </p>

                {/* CTAs */}
                <div className="mt-6 flex gap-3">
                  <Link
                    href={hub.ctaHref}
                    className={
                      hub.accent === "forest"
                        ? "rounded-md bg-forest-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-forest-800"
                        : "rounded-md bg-lake-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-lake-700"
                    }
                  >
                    {hub.ctaLabel}
                  </Link>
                  <Link
                    href={hub.secondaryHref}
                    className={
                      hub.accent === "forest"
                        ? "rounded-md border border-forest-200 px-4 py-2 text-sm font-medium text-forest-700 transition-colors hover:bg-forest-50"
                        : "rounded-md border border-lake-200 px-4 py-2 text-sm font-medium text-lake-700 transition-colors hover:bg-lake-50"
                    }
                  >
                    {hub.secondaryLabel}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
