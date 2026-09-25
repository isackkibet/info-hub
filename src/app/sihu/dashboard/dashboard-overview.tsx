"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  CATEGORY_LABELS,
  CATEGORY_OPTIONS,
  statusStyles,
  useSihuSubmissions,
} from "@/lib/sihu";
import { formatRelativeDate } from "@/lib/format-date";

export function DashboardOverview() {
  const submissions = useSihuSubmissions();

  const stats = useMemo(() => {
    const total = submissions.length;
    const pending = submissions.filter((s) => s.status === "PENDING").length;
    const verified = submissions.filter((s) => s.status === "VERIFIED").length;
    const rejected = submissions.filter((s) => s.status === "REJECTED").length;
    const decided = verified + rejected;
    const verificationRate =
      decided > 0 ? Math.round((verified / decided) * 100) : 0;
    return { total, pending, verified, rejected, verificationRate };
  }, [submissions]);

  const byCategory = useMemo(() => {
    const counts = CATEGORY_OPTIONS.map(([value, label]) => ({
      value,
      label,
      count: submissions.filter((s) => s.category === value).length,
    }));
    const max = Math.max(1, ...counts.map((c) => c.count));
    return counts
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count)
      .map((c) => ({ ...c, percent: Math.round((c.count / max) * 100) }));
  }, [submissions]);

  const pipeline = [
    { stage: "Pending", count: stats.pending },
    { stage: "Verified", count: stats.verified },
    { stage: "Rejected", count: stats.rejected },
  ];
  const pipelineMax = Math.max(1, ...pipeline.map((p) => p.count));

  const recent = submissions.slice(0, 5);

  return (
    <div>
      {/* Stat strip */}
      <div className="grid grid-cols-2 divide-y divide-sand-200 overflow-hidden rounded-2xl bg-white shadow-lg shadow-forest-950/5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:grid-cols-5">
        <Stat label="Total reports" value={stats.total} />
        <Stat label="Pending" value={stats.pending} />
        <Stat label="Verified" value={stats.verified} />
        <Stat label="Rejected" value={stats.rejected} />
        <Stat label="Verification rate" value={`${stats.verificationRate}%`} />
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[3fr_2fr]">
        {/* Reports by category */}
        <div>
          <h2 className="text-lg font-semibold text-ink-900">
            Reports by category
          </h2>
          {byCategory.length === 0 ? (
            <p className="mt-4 text-sm text-ink-600">
              No reports submitted from this browser yet.
            </p>
          ) : (
            <div className="mt-4 space-y-4 rounded-2xl bg-white p-6 shadow-lg shadow-forest-950/5">
              {byCategory.map((c) => (
                <div key={c.value}>
                  <div className="flex items-center justify-between text-xs text-ink-600">
                    <span>{c.label}</span>
                    <span className="font-semibold text-ink-900">{c.count}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-sand-200">
                    <div
                      className="h-2 rounded-full bg-lake-600 transition-all"
                      style={{ width: `${c.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-8">
          {/* Recent reports */}
          <div className="rounded-2xl bg-white p-6 shadow-lg shadow-forest-950/5">
            <h2 className="text-lg font-semibold text-ink-900">Recent reports</h2>
            {recent.length === 0 ? (
              <p className="mt-4 text-sm text-ink-600">
                Nothing recorded from this browser yet.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {recent.map((submission) => (
                  <li
                    key={submission.id}
                    className="border-b border-sand-200 pb-3 text-sm last:border-none last:pb-0"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-ink-900">
                          {submission.title}
                        </p>
                        <p className="mt-0.5 text-xs text-ink-600">
                          {CATEGORY_LABELS[submission.category]}{" "}
                          <time dateTime={submission.createdAt}>
                            ({formatRelativeDate(submission.createdAt)})
                          </time>
                        </p>
                      </div>
                      <span
                        className={
                          "shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium " +
                          statusStyles(submission.status)
                        }
                      >
                        {submission.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/sihu/my-reports"
              className="mt-4 inline-block text-sm font-medium text-lake-600 hover:text-lake-700 hover:underline"
            >
              View all reports
            </Link>
          </div>

          {/* Status pipeline */}
          <div className="rounded-2xl bg-white p-6 shadow-lg shadow-forest-950/5">
            <h2 className="text-lg font-semibold text-ink-900">Status pipeline</h2>
            <div className="mt-4 space-y-4">
              {pipeline.map((item) => (
                <div key={item.stage}>
                  <div className="flex items-center justify-between text-xs text-ink-600">
                    <span>{item.stage}</span>
                    <span className="font-semibold text-ink-900">{item.count}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-sand-200">
                    <div
                      className="h-2 rounded-full bg-lake-600 transition-all"
                      style={{ width: `${(item.count / pipelineMax) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="px-6 py-5">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-600">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-ink-900">{value}</p>
    </div>
  );
}
