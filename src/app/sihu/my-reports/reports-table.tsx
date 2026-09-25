"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CATEGORY_LABELS,
  CATEGORY_OPTIONS,
  CONTENT_TYPE_LABELS,
  statusStyles,
  useSihuSubmissions,
  type SihuCategory,
} from "@/lib/sihu";
import { formatRelativeDate } from "@/lib/format-date";

export function ReportsTable() {
  const submissions = useSihuSubmissions();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SihuCategory | "ALL">("ALL");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return submissions.filter((submission) => {
      const matchesQuery =
        !q ||
        submission.title.toLowerCase().includes(q) ||
        submission.locationName.toLowerCase().includes(q) ||
        submission.reporterName.toLowerCase().includes(q);
      const matchesCategory =
        category === "ALL" || submission.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [submissions, query, category]);

  if (submissions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-sand-200 p-10 text-center">
        <p className="text-sm text-ink-600">No reports submitted yet.</p>
        <Link
          href="/sihu/submit"
          className="mt-4 inline-block rounded-md bg-lake-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-lake-700"
        >
          Submit your first report
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="report-search" className="sr-only">
            Search my reports
          </label>
          <input
            id="report-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title, location, or reporter"
            className="w-full rounded-md border border-sand-200 px-3 py-2 text-sm text-ink-900 outline-none focus:border-lake-600 focus:ring-1 focus:ring-lake-600"
          />
        </div>
        <div>
          <label htmlFor="report-category" className="sr-only">
            Filter by category
          </label>
          <select
            id="report-category"
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as SihuCategory | "ALL")
            }
            className="w-full rounded-md border border-sand-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-lake-600 focus:ring-1 focus:ring-lake-600 sm:w-auto"
          >
            <option value="ALL">All categories</option>
            {CATEGORY_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div
          role="status"
          className="rounded-2xl border border-dashed border-sand-200 p-10 text-center text-sm text-ink-600"
        >
          No reports match your search.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-lg shadow-forest-950/5">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-sand-200 bg-sand-100 text-xs uppercase tracking-wide text-ink-600">
              <tr>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Format</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Reporter</th>
                <th className="px-4 py-3 font-medium">Submitted</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((submission) => (
                <tr
                  key={submission.id}
                  className="border-b border-sand-200 last:border-none hover:bg-sand-50"
                >
                  <td className="px-4 py-3 font-mono text-xs text-ink-600">
                    {submission.id}
                  </td>
                  <td className="px-4 py-3 text-ink-900">{submission.title}</td>
                  <td className="px-4 py-3 text-ink-700">
                    {CONTENT_TYPE_LABELS[submission.contentType]}
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    {CATEGORY_LABELS[submission.category]}
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    {submission.reporterName}
                  </td>
                  <td className="px-4 py-3 text-ink-600">
                    <time dateTime={submission.createdAt}>
                      {formatRelativeDate(submission.createdAt)}
                    </time>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        "rounded-full border px-3 py-1 text-xs font-medium " +
                        statusStyles(submission.status)
                      }
                    >
                      {submission.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
