import { AppNav } from "@/components/app-nav";
import { ReportsTable } from "./reports-table";

export default function MyReportsPage() {
  return (
    <>
      <AppNav />
      <main className="flex-1 bg-slate-50">
        <div className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-wide text-lake-600">
            SIHU News Hub
          </span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900">
            My reports
          </h1>
          <p className="mt-3 text-base leading-relaxed text-ink-700">
            Every report submitted from this device, with its current
            status.
          </p>

          <div className="mt-10">
            <ReportsTable />
          </div>
        </div>
      </main>
    </>
  );
}
