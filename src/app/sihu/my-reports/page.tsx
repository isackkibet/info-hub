import { AppNav } from "@/components/app-nav";
import { PreviewNotice } from "@/components/preview-notice";
import { ReportsTable } from "./reports-table";

export default function MyReportsPage() {
  return (
    <>
      <AppNav />
      <main className="flex-1 bg-sand-50">
        <div className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-wide text-lake-600">
            SIHU News Hub
          </span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900">
            My reports
          </h1>
          <p className="mt-3 text-base leading-relaxed text-ink-700">
            Every report submitted from this device, with its current status.
          </p>
          <PreviewNotice>
            Preview mode: this list is stored in this browser, not the
            shared database, so it will not show reports submitted from
            other devices.
          </PreviewNotice>

          <div className="mt-10">
            <ReportsTable />
          </div>
        </div>
      </main>
    </>
  );
}
