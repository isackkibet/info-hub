const phases = [
  {
    phase: "Phase 0",
    title: "Shared foundation",
    detail: "Next.js and TypeScript scaffold, Tailwind, Prisma and PostgreSQL, auth, and session handling.",
  },
  {
    phase: "Phase 1",
    title: "SIHU vertical",
    detail: "Submission form, validator queue, and a steward's report history: the fastest path to a demoable product.",
  },
  {
    phase: "Phase 2",
    title: "CFA vertical",
    detail: "Sites, species inventory, offline field submission, the automated clean layer, and verification.",
  },
  {
    phase: "Phase 3",
    title: "Shared anchoring",
    detail: "Deploy the anchoring contract, batch-commit verified records from both hubs, and add the admin dashboard.",
  },
  {
    phase: "Phase 4",
    title: "Unified dashboard",
    detail: "A hub picker based on membership, plus platform-wide admin views across users, anchoring, and species.",
  },
];

const stack = [
  "Next.js 14+ (App Router)",
  "TypeScript",
  "PostgreSQL with PostGIS",
  "Prisma",
  "Tailwind CSS",
  "Avalanche C-Chain",
];

export function BuildPlan() {
  return (
    <section id="build-plan" className="border-b border-forest-900/10">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="grid gap-14 lg:grid-cols-[2fr_1fr]">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-forest-700">
              Delivery
            </span>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
              A phased build, SIHU first
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-700">
              SIHU is the lean vertical and reaches a working, demoable
              product fastest. CFA is a larger effort and follows once its
              own five sub-phases are brought in during Phase 2.
            </p>

            <ol className="mt-10 space-y-6">
              {phases.map((item) => (
                <li
                  key={item.phase}
                  className="flex flex-col gap-1 border-l-2 border-forest-700/20 pl-6 sm:flex-row sm:items-baseline sm:gap-6"
                >
                  <span className="w-24 shrink-0 text-xs font-semibold uppercase tracking-wide text-forest-700">
                    {item.phase}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink-900">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-600">
                      {item.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl border border-forest-900/10 bg-sand-100/60 p-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-600">
              Technology stack
            </p>
            <ul className="mt-5 space-y-3">
              {stack.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-sm text-ink-800"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-forest-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
