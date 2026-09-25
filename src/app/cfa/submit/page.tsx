import { AppNav } from "@/components/app-nav";
import { ActivityForm } from "./activity-form";

export default function CfaSubmitPage() {
  return (
    <>
      <AppNav />
      <main className="flex-1 bg-sand-50">
        <div className="mx-auto max-w-2xl px-6 py-16 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-wide text-forest-700">
            CFA Conservation Hub
          </span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900">
            Record activity
          </h1>
          <p className="mt-3 text-base leading-relaxed text-ink-700">
            Log what happened at a site or nursery: propagation, watering,
            planting, sales, donations, transfers, or a loss.
          </p>

          <div className="mt-10">
            <ActivityForm />
          </div>
        </div>
      </main>
    </>
  );
}
