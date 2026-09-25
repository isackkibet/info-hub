"use client";

import type { ReactNode } from "react";

export interface Column<T> {
  header: string;
  render: (row: T) => ReactNode;
  align?: "left" | "right";
  hideOnMobile?: boolean;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  empty,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  empty: ReactNode;
}) {
  if (rows.length === 0) {
    return <div className="mt-4">{empty}</div>;
  }

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-sand-200 text-left text-xs uppercase tracking-wide text-ink-600">
            {columns.map((column) => (
              <th
                key={column.header}
                scope="col"
                className={`py-2 pr-4 font-medium ${
                  column.align === "right" ? "text-right" : ""
                } ${column.hideOnMobile ? "hidden sm:table-cell" : ""}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              className="border-b border-sand-100 align-top last:border-none"
            >
              {columns.map((column) => (
                <td
                  key={column.header}
                  className={`py-3 pr-4 text-ink-700 ${
                    column.align === "right" ? "text-right" : ""
                  } ${column.hideOnMobile ? "hidden sm:table-cell" : ""}`}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function BarRow({
  label,
  value,
  max,
  suffix = "",
}: {
  label: string;
  value: number;
  max: number;
  suffix?: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs text-ink-700">
        <span className="truncate">{label}</span>
        <span className="font-semibold text-ink-900">
          {value.toLocaleString()}
          {suffix}
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-sand-200">
        <div
          className="h-2 rounded-full bg-forest-600"
          style={{ width: `${Math.max(pct, value > 0 ? 2 : 0)}%` }}
        />
      </div>
    </div>
  );
}
