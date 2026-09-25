import { AppNav } from "@/components/app-nav";
import {
  cfaPipeline,
  cfaSites,
  cfaSpeciesSample,
  cfaTotals,
} from "@/lib/cfa-mock";

export default function CfaDashboardPage() {
  return (
    <>
      <AppNav />
      <main className="flex-1 bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-wide text-forest-700">
            CFA Conservation Hub
          </span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900">
            Kapsabet Forest Association
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-700">
            A preview with sample data. Site management, species records,
            offline field submission, and live verification will appear
            here as they go live.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Active sites" value={cfaTotals.activeSites} />
            <StatCard
              label="Trees recorded"
              value={cfaTotals.totalTrees.toLocaleString()}
            />
            <StatCard
              label="Trees surviving"
              value={cfaTotals.surviving.toLocaleString()}
            />
            <StatCard label="Species tracked" value={cfaTotals.speciesCount} />
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-[3fr_2fr]">
            <div>
              <h2 className="text-lg font-semibold text-ink-900">
                Sites and nurseries
              </h2>
              <div className="mt-4 space-y-4">
                {cfaSites.map((site) => (
                  <div
                    key={site.name}
                    className="rounded-2xl border border-slate-200 bg-white p-6"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="text-base font-semibold text-ink-900">
                        {site.name}
                      </h3>
                      <span className="text-xs text-ink-600">
                        {site.areaHectares} ha
                      </span>
                    </div>
                    <dl className="mt-4 grid grid-cols-3 gap-4 border-t border-slate-200 pt-4">
                      <div>
                        <dt className="text-xs text-ink-600">Total trees</dt>
                        <dd className="mt-1 text-sm font-semibold text-ink-900">
                          {site.totalTrees.toLocaleString()}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-ink-600">Species</dt>
                        <dd className="mt-1 text-sm font-semibold text-ink-900">
                          {site.species}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-ink-600">Surviving</dt>
                        <dd className="mt-1 text-sm font-semibold text-ink-900">
                          {site.surviving.toLocaleString()}
                        </dd>
                      </div>
                    </dl>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="text-lg font-semibold text-ink-900">
                  Verification pipeline
                </h2>
                <div className="mt-4 space-y-3">
                  {cfaPipeline.map((item) => (
                    <div key={item.stage}>
                      <div className="flex items-center justify-between text-xs text-ink-600">
                        <span>{item.stage}</span>
                        <span>{item.count}</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-sand-200">
                        <div
                          className="h-2 rounded-full bg-forest-600"
                          style={{
                            width: `${Math.min(
                              100,
                              (item.count /
                                Math.max(
                                  ...cfaPipeline.map((p) => p.count),
                                )) *
                                100,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="text-lg font-semibold text-ink-900">
                  Species registry sample
                </h2>
                <ul className="mt-4 space-y-3">
                  {cfaSpeciesSample.map((species) => (
                    <li
                      key={species.name}
                      className="flex items-center justify-between border-b border-forest-900/5 pb-3 text-sm last:border-none last:pb-0"
                    >
                      <div>
                        <p className="font-medium text-ink-900">
                          {species.name}
                        </p>
                        <p className="text-xs text-ink-600">
                          {species.purpose}
                        </p>
                      </div>
                      <span className="rounded-full border border-forest-200 bg-forest-50 px-2 py-1 text-xs text-forest-700">
                        {species.classification}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-600">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-ink-900">{value}</p>
    </div>
  );
}
