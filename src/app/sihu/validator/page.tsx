import { AppNav } from "@/components/app-nav";
import { ValidatorQueue } from "./validator-queue";

export default function ValidatorPage() {
  return (
    <>
      <AppNav />
      <main className="flex-1 bg-sand-50">
        <div className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-wide text-lake-600">
            SIHU News Hub
          </span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900">
            Validator queue
          </h1>
          <p className="mt-3 text-base leading-relaxed text-ink-700">
            Open each report&apos;s media link, check that the location and
            content are plausible, then approve or reject with a reason.
          </p>

          <div className="mt-10">
            <ValidatorQueue />
          </div>
        </div>
      </main>
    </>
  );
}
