"use client";

import {
  ACTIVITY_TYPE_LABELS,
  activityTypeStyles,
  useCfaActivities,
} from "@/lib/cfa-activity";
import { formatRelativeDate } from "@/lib/format-date";

export function RecentActivity() {
  const activities = useCfaActivities().slice(0, 5);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg shadow-forest-950/5">
      <h2 className="text-lg font-semibold text-ink-900">Recent activity</h2>

      {activities.length === 0 ? (
        <p className="mt-4 text-sm text-ink-600">
          Nothing recorded from this browser yet.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {activities.map((activity) => (
            <li
              key={activity.id}
              className="border-b border-sand-200 pb-3 text-sm last:border-none last:pb-0"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink-900">
                    {activity.quantity.toLocaleString()}{" "}
                    {activity.speciesName ?? "seedlings"}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-600">
                    {activity.siteName}, by {activity.recordedBy}{" "}
                    <time dateTime={activity.createdAt}>
                      ({formatRelativeDate(activity.createdAt)})
                    </time>
                  </p>
                </div>
                <span
                  className={
                    "shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium " +
                    activityTypeStyles(activity.activityType)
                  }
                >
                  {ACTIVITY_TYPE_LABELS[activity.activityType]}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
