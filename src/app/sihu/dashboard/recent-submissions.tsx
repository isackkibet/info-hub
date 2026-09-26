"use client";

import type { Submission, User } from "@prisma/client";

type SubmissionWithUser = Submission & {
  user: Pick<User, "name" | "email">;
};

const CATEGORY_LABELS: Record<string, string> = {
  WATER_HYACINTH_TRACKING: "Water Hyacinth",
  LAKE_CLEANUP: "Lake Cleanup",
  BLUE_ECONOMY_NEWS: "Blue Economy",
  HUMAN_RIGHTS_REPORT: "Human Rights",
  POLLUTION_ALERT: "Pollution Alert",
  COMMUNITY_DEVELOPMENT_NEWS: "Community Dev",
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  VERIFIED: "bg-forest-50 text-forest-700",
  REJECTED: "bg-red-50 text-red-700",
  BATCHED: "bg-lake-50 text-lake-700",
};

export function RecentSubmissions({
  submissions,
}: {
  submissions: SubmissionWithUser[];
}) {
  if (submissions.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm shadow-forest-950/5">
        <p className="text-sm text-ink-600">No submissions yet.</p>
        <a
          href="/sihu/submit"
          className="mt-3 inline-block text-sm font-medium text-lake-600 hover:underline"
        >
          Submit the first one →
        </a>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm shadow-forest-950/5">
      <table className="w-full text-left text-sm">
        <thead className="bg-sand-100 text-xs uppercase tracking-wide text-ink-600">
          <tr>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Location</th>
            <th className="px-4 py-3 font-medium">Reporter</th>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((s, index) => (
            <tr
              key={s.id}
              className={`hover:bg-sand-50 ${index % 2 === 1 ? "bg-sand-50/60" : ""}`}
            >
              <td className="px-4 py-3">
                <p className="max-w-[200px] truncate font-medium text-ink-900">
                  {s.title}
                </p>
                <p className="font-mono text-xs text-ink-600">{s.id}</p>
              </td>
              <td className="px-4 py-3 text-ink-700">
                {CATEGORY_LABELS[s.category] ?? s.category}
              </td>
              <td className="px-4 py-3 text-ink-700">{s.locationName}</td>
              <td className="px-4 py-3 text-ink-700">
                {s.user.name ?? s.user.email}
              </td>
              <td className="px-4 py-3 text-ink-600">
                {new Date(s.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[s.status] ?? ""}`}
                >
                  {s.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
