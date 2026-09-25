"use client";

import Link from "next/link";
import { CATEGORY_LABELS, statusStyles, useSihuSubmissions } from "@/lib/sihu";

export function ReportsTable() {
  const submissions = useSihuSubmissions();

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
    <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-sand-200 bg-sand-100 text-xs uppercase tracking-wide text-ink-600">
          <tr>
            <th className="px-4 py-3 font-medium">ID</th>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Reporter</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((submission) => (
            <tr
              key={submission.id}
              className="border-b border-sand-200 last:border-none hover:bg-sand-50"
            >
              <td className="px-4 py-3 font-mono text-xs text-ink-600">
                {submission.id}
              </td>
              <td className="px-4 py-3 text-ink-900">{submission.title}</td>
              <td className="px-4 py-3 text-ink-700">
                {CATEGORY_LABELS[submission.category]}
              </td>
              <td className="px-4 py-3 text-ink-700">
                {submission.reporterName}
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
  );
}
