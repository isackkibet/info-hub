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

  const topCategories = byCategory.slice(0, 2);
  const moreCategories = byCategory.length - topCategories.length;

  const recent = submissions.slice(0, 2);
  const moreReports = submissions.length - recent.length;

  return (
    <div>
      {/* Stat strip: the one place totals live */}
      <div className="grid grid-cols-2 divide-y divide-sand-200 overflow-hidden rounded-2xl bg-white shadow-lg shadow-forest-950/5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:grid-cols-5">
        <Stat label="Total reports" value={stats.total} />
        <Stat label="Pending review" value={stats.pending} />
        <Stat label="Verified" value={stats.verified} />
        <Stat label="Rejected" value={stats.rejected} />
        <Stat
          label="Verification rate"
          value={`${stats.verificationRate}%`}
          hint="Share of decided reports that passed"
        />
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[3fr_2fr]">
        {/* Recent reports leads: it's what you actually came to check */}
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink-900">
              Recent reports
            </h2>
            <Link
              href="/sihu/my-reports"
              className="text-sm font-medium text-lake-600 hover:text-lake-700 hover:underline"
            >
              View all
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-sand-200 p-10 text-center text-sm text-ink-600">
              Nothing recorded from this browser yet.
            </div>
          ) : (
            <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-lg shadow-forest-950/5">
              <ul>
                {recent.map((submission) => (
                  <li
                    key={submission.id}
                    className="border-b border-sand-200 px-6 py-4 last:border-none"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-ink-900">
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
              {moreReports > 0 && (
                <Link
                  href="/sihu/my-reports"
                  className="block border-t border-sand-200 px-6 py-3 text-center text-sm font-medium text-lake-600 hover:text-lake-700 hover:underline"
                >
                  {moreReports} more report{moreReports === 1 ? "" : "s"}
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Category breakdown: a supporting view, not a repeat of the stat strip */}
        <div>
          <h2 className="text-lg font-semibold text-ink-900">
            Top categories
          </h2>
          {topCategories.length === 0 ? (
            <p className="mt-4 text-sm text-ink-600">
              No reports submitted from this browser yet.
            </p>
          ) : (
            <div className="mt-4 space-y-4 rounded-2xl bg-white p-6 shadow-lg shadow-forest-950/5">
              {topCategories.map((c) => (
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
              {moreCategories > 0 && (
                <p className="text-xs text-ink-600">
                  {moreCategories} more categor{moreCategories === 1 ? "y" : "ies"}{" "}
                  with reports
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="px-6 py-5">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-600">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-ink-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-600">{hint}</p>}
    </div>
  );
}
