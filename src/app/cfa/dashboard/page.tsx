"use client";

import Link from "next/link";
import { PageShell } from "@/components/cfa/page-shell";
import { StatCard, VerificationBadge } from "@/components/cfa/badges";
import { BarRow } from "@/components/cfa/table";
import { Card } from "@/components/cfa/fields";
import { useCfaState } from "@/lib/cfa/store";
import {
  aggregateStock,
  inventorySummary,
  lowStockRows,
  monthlyMovement,
  nurseryName,
  speciesName,
  survivalTrend,
} from "@/lib/cfa/inventory";
import {
  ActivityTypeLabels,
  VerificationStatusLabels,
  type VerificationStatus,
} from "@/lib/cfa/types";
import { formatRelativeDate } from "@/lib/format-date";

const PIPELINE: VerificationStatus[] = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "VERIFIED",
  "NEEDS_CORRECTION",
  "REJECTED",
];

export default function CfaDashboardPage() {
  const state = useCfaState();
  const summary = inventorySummary(state);
  const stock = aggregateStock(state);
  const months = monthlyMovement(state);
  const trend = survivalTrend(state);
  const low = lowStockRows(state, 500);

  const pipelineCounts = PIPELINE.map((status) => ({
    status,
    count: state.activities.filter((activity) => activity.status === status).length,
  }));
  const maxPipeline = Math.max(
    1,
    ...pipelineCounts.map((item) => item.count),
  );

  const speciesMax = Math.max(1, ...stock.map((row) => row.quantity));
  const monthMax = Math.max(
    1,
    ...months.map((month) => Math.max(month.propagated, month.planted, month.sold)),
  );

  const recent = [...state.activities]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);

  return (
    <PageShell
      eyebrow="CFA Conservation Hub"
      title={state.cfa.name}
      description="Every figure on this page is calculated from the nursery inventory ledger and activity log. Nothing here is typed in by hand."
    >
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard
          label="Current stock"
          value={summary.currentStock.toLocaleString()}
          hint="Seedlings on hand across all nurseries"
          tone="green"
        />
        <StatCard
          label="Species tracked"
          value={summary.speciesCount}
          hint={`${state.species.length} in the catalogue`}
        />
        <StatCard
          label="Active seedbeds"
          value={summary.activeSeedbeds}
          hint={`${state.seedbeds.length} total`}
        />
        <StatCard
          label="Propagated"
          value={summary.propagated.toLocaleString()}
          hint="This ledger's production"
        />
        <StatCard
          label="Survival rate"
          value={`${summary.survivalRate}%`}
          hint="Latest observation per planting site"
          tone={summary.survivalRate >= 80 ? "green" : "amber"}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Planted" value={summary.planted.toLocaleString()} />
        <StatCard label="Sold" value={summary.sold.toLocaleString()} />
        <StatCard label="Donated" value={summary.donated.toLocaleString()} />
        <StatCard
          label="Mortality"
          value={summary.mortality.toLocaleString()}
          hint={`${summary.mortalityRate}% of everything produced`}
          tone={summary.mortalityRate > 20 ? "amber" : "sand"}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="space-y-6">
          <Card
            title="Stock by species"
            description="Closing stock per nursery and species, from posted transactions only."
            action={
              <Link
                href="/cfa/inventory"
                className="text-sm font-medium text-forest-700 hover:underline"
              >
                Open inventory
              </Link>
            }
          >
            {stock.length === 0 ? (
              <p className="mt-4 text-sm text-ink-600">
                No stock has been posted yet. Record an opening stock or a
                propagation activity to start the ledger.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {stock.slice(0, 8).map((row) => (
                  <BarRow
                    key={row.key}
                    label={`${speciesName(state, row.speciesId)} · ${nurseryName(state, row.nurseryId)}`}
                    value={row.quantity}
                    max={speciesMax}
                  />
                ))}
              </div>
            )}
          </Card>

          <Card
            title="Movement by month"
            description="Production, planting, and sale volumes per month."
          >
            {months.length === 0 ? (
              <p className="mt-4 text-sm text-ink-600">No dated movements yet.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {months.slice(-8).map((month) => (
                  <div key={month.month} className="rounded-lg border border-sand-200 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-600">
                      {month.label}
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-ink-700 sm:grid-cols-5">
                      <span>Propagated {month.propagated.toLocaleString()}</span>
                      <span>Planted {month.planted.toLocaleString()}</span>
                      <span>Sold {month.sold.toLocaleString()}</span>
                      <span>Donated {month.donated.toLocaleString()}</span>
                      <span>Lost {month.mortality.toLocaleString()}</span>
                    </div>
                    <div className="mt-2">
                      <BarRow
                        label="Production"
                        value={month.propagated}
                        max={monthMax}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card
            title="Survival trend"
            description="Latest survival observation for each planting site. Earlier observations are kept, never overwritten."
          >
            {trend.length === 0 ? (
              <p className="mt-4 text-sm text-ink-600">
                No survival observations recorded yet.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {trend.map((point) => (
                  <BarRow
                    key={point.eventId}
                    label={`${point.eventLabel} · ${point.surviving}/${point.assessed} alive`}
                    value={point.rate}
                    max={100}
                    suffix="%"
                  />
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Verification pipeline" description="Activity status counts.">
            <div className="mt-4 space-y-3">
              {pipelineCounts.map((item) => (
                <div key={item.status}>
                  <div className="flex items-center justify-between text-xs text-ink-600">
                    <span>{VerificationStatusLabels[item.status]}</span>
                    <span className="font-semibold text-ink-900">{item.count}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-sand-200">
                    <div
                      className="h-2 rounded-full bg-forest-600"
                      style={{
                        width: `${Math.round((item.count / maxPipeline) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/cfa/verification"
              className="mt-4 inline-block text-sm font-medium text-forest-700 hover:underline"
            >
              Open verification queue
            </Link>
          </Card>

          {low.length > 0 && (
            <Card
              title="Low stock"
              description="Species at or below 500 seedlings in stock."
            >
              <ul className="mt-4 space-y-2">
                {low.map((row) => (
                  <li
                    key={row.key}
                    className="flex items-baseline justify-between border-b border-sand-100 pb-2 text-sm last:border-none last:pb-0"
                  >
                    <span className="text-ink-700">
                      {speciesName(state, row.speciesId)}
                      <span className="block text-xs text-ink-600">
                        {nurseryName(state, row.nurseryId)}
                      </span>
                    </span>
                    <span className="font-semibold text-ink-900">
                      {row.quantity.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card title="Recent activity" description="Latest entries from the log.">
            {recent.length === 0 ? (
              <p className="mt-4 text-sm text-ink-600">Nothing recorded yet.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {recent.map((activity) => (
                  <li
                    key={activity.id}
                    className="border-b border-sand-100 pb-3 last:border-none last:pb-0"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-ink-900">
                          {activity.quantity.toLocaleString()}{" "}
                          {activity.speciesId
                            ? speciesName(state, activity.speciesId)
                            : "seedlings"}
                        </p>
                        <p className="mt-0.5 text-xs text-ink-600">
                          {ActivityTypeLabels[activity.activityType]} ·{" "}
                          {nurseryName(state, activity.nurseryId)} ·{" "}
                          {activity.recordedBy}{" "}
                          <time dateTime={activity.createdAt}>
                            ({formatRelativeDate(activity.createdAt)})
                          </time>
                        </p>
                      </div>
                      <VerificationBadge status={activity.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Actions" description="The most common jobs, one tap away.">
            <div className="mt-4 grid gap-2">
              {[
                { href: "/cfa/activities", label: "Record an activity" },
                { href: "/cfa/nurseries", label: "Add or manage a nursery" },
                { href: "/cfa/seedbeds", label: "Add a seedbed" },
                { href: "/cfa/species", label: "Update the species catalogue" },
                { href: "/cfa/sales", label: "Record a sale" },
                { href: "/cfa/donations", label: "Record a donation" },
                { href: "/cfa/planting", label: "Log a planting event" },
                { href: "/cfa/survival", label: "Add a survival observation" },
                { href: "/cfa/reports", label: "Generate a report" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md border border-sand-200 px-3 py-2 text-sm text-ink-700 transition-colors hover:border-forest-200 hover:bg-forest-50 hover:text-forest-700"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
