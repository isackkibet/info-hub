import Link from "next/link";
import { AppNav } from "@/components/app-nav";
import { DashboardOverview } from "./dashboard-overview";

export default function SihuDashboardPage() {
  return (
    <>
      <AppNav />
      <main className="flex-1 bg-sand-50">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-lake-600">
                SIHU News Hub
              </span>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900">
                Overview
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-700">
                Reports, status, and category breakdowns from this browser,
                in one place.
              </p>
            </div>
            <Link
              href="/sihu/submit"
              className="shrink-0 rounded-md bg-lake-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-lake-700"
            >
              Submit a report
            </Link>
          </div>

          <div className="mt-10">
            <DashboardOverview />
          </div>
        </div>
      </main>
    </>
  );
}
