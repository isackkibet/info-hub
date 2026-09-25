"use client";

import { useMemo, useState } from "react";
import { PageShell } from "@/components/cfa/page-shell";
import { StatCard } from "@/components/cfa/badges";
import { BarRow } from "@/components/cfa/table";
import {
  Card,
  EmptyState,
  Field,
  SecondaryButton,
  Select,
} from "@/components/cfa/fields";
import { useCfaState } from "@/lib/cfa/store";
import { useAccess } from "@/lib/cfa/permissions";
import { downloadCsv, downloadJson } from "@/lib/cfa/export";
import { monthlyMovement, survivalTrend } from "@/lib/cfa/inventory";
import {
  buildReports,
  transactionExport,
  type ReportKey,
} from "@/lib/cfa/reports";

const REPORT_ORDER: ReportKey[] = [
  "PRODUCTION",
  "SPECIES",
  "MONTHLY",
  "IMPACT",
  "VERIFICATION",
];

export default function ReportsPage() {
  const state = useCfaState();
  const access = useAccess();
  const [active, setActive] = useState<ReportKey>("PRODUCTION");
  const [nurseryFilter, setNurseryFilter] = useState("ALL");

  const reports = useMemo(() => buildReports(state), [state]);
  const report = reports[active];
  const monthly = monthlyMovement(state);
  const trend = survivalTrend(state);

  const canReport = access.can("GENERATE_REPORT");
  const canExport = access.can("EXPORT_DATA");

  if (!canReport) {
    return (
      <PageShell
        eyebrow="Reporting"
        title="Reports"
        description="Reports are generated from the inventory ledger, so a figure always traces back to the transactions behind it."
      >
        <EmptyState
          title="You cannot generate reports"
          description={`Your role is ${access.roleLabel}. Switch roles from the control above to preview reporting.`}
        />
      </PageShell>
    );
  }

  const stamp = new Date().toISOString().slice(0, 10);
  const scoped =
    nurseryFilter === "ALL"
      ? state
      : {
          ...state,
          nurseries: state.nurseries.filter((n) => n.id === nurseryFilter),
          seedbeds: state.seedbeds.filter((b) => b.nurseryId === nurseryFilter),
          transactions: state.transactions.filter(
            (t) => t.nurseryId === nurseryFilter,
          ),
          activities: state.activities.filter(
            (a) => a.nurseryId === nurseryFilter,
          ),
        };
  const scopedReports = nurseryFilter === "ALL" ? reports : buildReports(scoped);

  return (
    <PageShell
      eyebrow="Reporting"
      title="Reports"
      description="Every figure below is calculated from posted inventory transactions and survival observations. Nothing is typed in by hand, and each report can be exported as CSV or JSON."
    >
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <div className="space-y-4">
          <Card title="Report">
            <ul className="mt-2 space-y-1">
              {REPORT_ORDER.map((key) => (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => setActive(key)}
                    aria-current={active === key ? "true" : undefined}
                    className={
                      active === key
                        ? "w-full rounded-md bg-forest-900 px-3 py-2 text-left text-sm font-medium text-white"
                        : "w-full rounded-md px-3 py-2 text-left text-sm text-ink-700 transition-colors hover:bg-forest-50 hover:text-forest-700"
                    }
                  >
                    {reports[key].title}
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          <Field label="Nursery" htmlFor="report-nursery">
            <Select
              id="report-nursery"
              value={nurseryFilter}
              onChange={(event) => setNurseryFilter(event.target.value)}
            >
              <option value="ALL">All nurseries</option>
              {state.nurseries.map((nursery) => (
                <option key={nursery.id} value={nursery.id}>
                  {nursery.name}
                </option>
              ))}
            </Select>
          </Field>

          {canExport && (
            <Card title="Export">
              <div className="mt-3 flex flex-col gap-2">
                <SecondaryButton
                  type="button"
                  onClick={() =>
                    downloadCsv(
                      `kai-cfa-${active.toLowerCase()}-${stamp}.csv`,
                      report.columns,
                      report.rows,
                    )
                  }
                >
                  CSV
                </SecondaryButton>
                <SecondaryButton
                  type="button"
                  onClick={() =>
                    downloadJson(
                      `kai-cfa-${active.toLowerCase()}-${stamp}.json`,
                      report.json,
                    )
                  }
                >
                  JSON
                </SecondaryButton>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card
            title={scopedReports[active].title}
            description={scopedReports[active].description}
          >
            {scopedReports[active].rows.length === 0 ? (
              <p className="mt-4 text-sm text-ink-600">
                Nothing to report for this selection yet.
              </p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-sand-200 text-left text-xs uppercase tracking-wide text-ink-600">
                      {scopedReports[active].columns.map((column, index) => (
                        <th
                          key={column}
                          scope="col"
                          className={`py-2 pr-4 font-medium ${
                            index === 0 ? "text-left" : "text-right"
                          }`}
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {scopedReports[active].rows.map((row, rowIndex) => (
                      <tr
                        key={`${scopedReports[active].key}-${rowIndex}`}
                        className="border-b border-sand-100 last:border-none"
                      >
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className={`py-2 pr-4 text-ink-700 ${
                              cellIndex === 0 ? "" : "text-right"
                            }`}
                          >
                            {typeof cell === "number"
                              ? cell.toLocaleString()
                              : cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {active === "MONTHLY" && monthly.length > 0 && (
            <Card
              title="Monthly movement"
              description="Net movement per month, from the same transactions as the report above."
            >
              <div className="mt-4 space-y-3">
                {monthly.map((month) => {
                  const net =
                    month.propagated -
                    month.sold -
                    month.donated -
                    month.planted -
                    month.mortality;
                  const max = Math.max(
                    ...monthly.map((m) =>
                      Math.max(m.propagated, m.sold, m.donated, m.planted),
                    ),
                    1,
                  );
                  return (
                    <div key={month.month}>
                      <div className="flex items-baseline justify-between text-xs text-ink-700">
                        <span>{month.label}</span>
                        <span className="font-semibold text-ink-900">
                          net {net.toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-sand-200">
                        <div
                          className="h-2 rounded-full bg-lake-500"
                          style={{
                            width: `${Math.max(
                              Math.round((month.propagated / max) * 100),
                              month.propagated > 0 ? 2 : 0,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {active === "IMPACT" && trend.length > 0 && (
            <Card
              title="Survival by planting site"
              description="Latest observation per site."
            >
              <div className="mt-4 space-y-3">
                {trend.map((point) => (
                  <BarRow
                    key={point.eventId}
                    label={`${point.eventLabel} · ${point.date}`}
                    value={point.rate}
                    max={100}
                    suffix="%"
                  />
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {canExport && (
        <Card
          title="Raw ledger exports"
          description="The underlying transaction and activity records behind every figure on this page."
          className="mt-6"
        >
          <div className="mt-4 flex flex-wrap gap-2">
            <SecondaryButton
              type="button"
              onClick={() => {
                const data = transactionExport(scoped);
                downloadCsv(`kai-cfa-transactions-${stamp}.csv`, data.columns, data.rows);
              }}
            >
              Transactions CSV
            </SecondaryButton>
            <SecondaryButton
              type="button"
              onClick={() =>
                downloadJson(`kai-cfa-ledger-${stamp}.json`, {
                  generatedAt: new Date().toISOString(),
                  cfa: state.cfa.name,
                  registrationNumber: state.cfa.registrationNumber,
                  dataSource: "KAI CFA nursery inventory ledger (local preview data)",
                  transactions: transactionExport(scoped).rows,
                })
              }
            >
              Ledger JSON
            </SecondaryButton>
          </div>
        </Card>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Reports available" value={REPORT_ORDER.length} />
        <StatCard
          label="Ledger transactions"
          value={state.transactions.length}
        />
        <StatCard label="Planting sites" value={trend.length} />
        <StatCard label="Months covered" value={monthly.length} />
      </div>
    </PageShell>
  );
}
