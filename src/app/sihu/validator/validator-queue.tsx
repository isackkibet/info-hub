"use client";

import { useState } from "react";
import {
  CATEGORY_LABELS,
  statusStyles,
  updateSubmissionStatus,
  useSihuSubmissions,
} from "@/lib/sihu";

export function ValidatorQueue() {
  const submissions = useSihuSubmissions();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<"PENDING" | "ALL">("PENDING");

  function handleDecision(id: string, decision: "VERIFIED" | "REJECTED") {
    const note = notes[id]?.trim();
    if (decision === "REJECTED" && !note) {
      alert("A reason is required to reject a report.");
      return;
    }
    updateSubmissionStatus(id, decision, note || undefined);
  }

  const visible = submissions.filter((s) =>
    filter === "PENDING" ? s.status === "PENDING" : true,
  );

  return (
    <div>
      {/* Filter toggle */}
      <div className="mb-6 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setFilter("PENDING")}
          className={
            filter === "PENDING"
              ? "rounded-md bg-lake-600 px-3 py-1.5 text-xs font-medium text-white"
              : "rounded-md border border-sand-200 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-sand-100"
          }
        >
          Pending only
        </button>
        <button
          type="button"
          onClick={() => setFilter("ALL")}
          className={
            filter === "ALL"
              ? "rounded-md bg-lake-600 px-3 py-1.5 text-xs font-medium text-white"
              : "rounded-md border border-sand-200 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-sand-100"
          }
        >
          All reports
        </button>
      </div>

      {visible.length === 0 && (
        <div className="rounded-2xl border border-dashed border-sand-200 p-10 text-center text-sm text-ink-600">
          No reports in this view.
        </div>
      )}

      <div className="space-y-4">
        {visible.map((submission) => (
          <div
            key={submission.id}
            className="rounded-2xl border border-sand-200 bg-white p-6"
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
