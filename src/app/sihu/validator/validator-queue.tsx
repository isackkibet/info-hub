"use client";

import { useMemo, useState } from "react";
import {
  CATEGORY_LABELS,
  CATEGORY_OPTIONS,
  statusStyles,
  updateSubmissionStatus,
  useSihuSubmissions,
  type SihuCategory,
} from "@/lib/sihu";
import { formatRelativeDate } from "@/lib/format-date";

export function ValidatorQueue() {
  const submissions = useSihuSubmissions();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [statusFilter, setStatusFilter] = useState<"PENDING" | "ALL">("PENDING");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SihuCategory | "ALL">("ALL");

  function handleDecision(id: string, decision: "VERIFIED" | "REJECTED") {
    const note = notes[id]?.trim();
    if (decision === "REJECTED" && !note) {
      alert("A reason is required to reject a report.");
      return;
    }
    updateSubmissionStatus(id, decision, note || undefined);
  }

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return submissions.filter((s) => {
      const matchesStatus =
        statusFilter === "PENDING" ? s.status === "PENDING" : true;
      const matchesCategory = category === "ALL" || s.category === category;
      const matchesQuery =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.locationName.toLowerCase().includes(q) ||
        s.reporterName.toLowerCase().includes(q);
      return matchesStatus && matchesCategory && matchesQuery;
    });
  }, [submissions, statusFilter, category, query]);

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter("PENDING")}
            aria-pressed={statusFilter === "PENDING"}
            className={
              statusFilter === "PENDING"
                ? "rounded-md bg-lake-600 px-3 py-1.5 text-xs font-medium text-white"
                : "rounded-md border border-sand-200 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-sand-100"
            }
          >
            Pending only
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            aria-pressed={statusFilter === "ALL"}
            className={
              statusFilter === "ALL"
                ? "rounded-md bg-lake-600 px-3 py-1.5 text-xs font-medium text-white"
                : "rounded-md border border-sand-200 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-sand-100"
            }
          >
            All reports
          </button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <label htmlFor="queue-search" className="sr-only">
              Search the queue
            </label>
            <input
              id="queue-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title, location, or reporter"
              className="w-full rounded-md border border-sand-200 px-3 py-2 text-sm text-ink-900 outline-none focus:border-lake-600 focus:ring-1 focus:ring-lake-600"
            />
          </div>
          <div>
            <label htmlFor="queue-category" className="sr-only">
              Filter by category
            </label>
            <select
              id="queue-category"
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
      </div>

      {visible.length === 0 && (
        <div
          role="status"
          className="rounded-2xl border border-dashed border-sand-200 p-10 text-center text-sm text-ink-600"
        >
          No reports in this view.
        </div>
      )}

      <div className="space-y-4">
        {visible.map((submission) => (
          <div
            key={submission.id}
            className="rounded-2xl bg-white p-6 shadow-lg shadow-forest-950/5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs text-ink-600">
                  {submission.id}
                </p>
                <h3 className="mt-1 text-base font-semibold text-ink-900">
                  {submission.title}
                </h3>
                <p className="mt-1 text-xs text-ink-600">
                  {CATEGORY_LABELS[submission.category]} in{" "}
                  {submission.locationName}, reported by{" "}
                  {submission.reporterName}
                  {" "}
                  <time dateTime={submission.createdAt}>
                    ({formatRelativeDate(submission.createdAt)})
                  </time>
                </p>
              </div>
              <span
                className={
                  "shrink-0 rounded-full border px-3 py-1 text-xs font-medium " +
                  statusStyles(submission.status)
                }
              >
                {submission.status}
              </span>
            </div>

            <a
              href={submission.publicMediaUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block break-all text-sm font-medium text-lake-600 hover:text-lake-700 hover:underline"
            >
              {submission.publicMediaUrl}
            </a>

            {submission.reviewNotes && (
              <p className="mt-3 rounded-md bg-sand-100 px-3 py-2 text-xs text-ink-700">
                Review note: {submission.reviewNotes}
              </p>
            )}

            {submission.status === "PENDING" && (
              <div className="mt-4 border-t border-sand-200 pt-4">
                <label
                  htmlFor={`notes-${submission.id}`}
                  className="text-xs font-medium text-ink-700"
                >
                  Review notes (required to reject)
                </label>
                <textarea
                  id={`notes-${submission.id}`}
                  rows={2}
                  value={notes[submission.id] ?? ""}
                  onChange={(event) =>
                    setNotes((prev) => ({
                      ...prev,
                      [submission.id]: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-md border border-sand-200 px-3 py-2 text-sm text-ink-900 outline-none focus:border-lake-600 focus:ring-1 focus:ring-lake-600"
                />
                <div className="mt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleDecision(submission.id, "VERIFIED")}
                    className="rounded-md bg-forest-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-forest-700"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDecision(submission.id, "REJECTED")}
                    className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
