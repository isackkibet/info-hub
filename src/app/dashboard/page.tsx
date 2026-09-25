import Link from "next/link";
import { AppNav } from "@/components/app-nav";

const hubs = [
  {
    href: "/sihu/submit",
    name: "SIHU News Hub",
    description:
      "Submit and review environmental and human-rights reports across the Lake Victoria Basin.",
    actions: [
      { href: "/sihu/submit", label: "Submit a report" },
      { href: "/sihu/validator", label: "Validator queue" },
      { href: "/sihu/my-reports", label: "My reports" },
    ],
  },
  {
    href: "/cfa/dashboard",
    name: "CFA Conservation Hub",
    description:
      "Track sites, tree species, nursery stock, and the verification pipeline for forest conservation.",
    actions: [{ href: "/cfa/dashboard", label: "Open CFA dashboard" }],
  },
];

export default function DashboardPage() {
  return (
    <>
      <AppNav />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-wide text-forest-700">
            Dashboard
          </span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900">
            Choose a hub
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-700">
            Your account can hold membership in either hub, or both. Select
            one to continue.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {hubs.map((hub) => (
              <div
                key={hub.name}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6"
              >
                <h2 className="text-lg font-semibold text-ink-900">
                  {hub.name}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">
                  {hub.description}
                </p>
                <div className="mt-6 flex flex-col gap-2">
                  {hub.actions.map((action, index) => (
                    <Link
                      key={action.href + action.label}
                      href={action.href}
                      className={
                        index === 0
                          ? "rounded-md bg-forest-600 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-forest-700"
                          : "rounded-md border border-slate-200 px-4 py-2 text-center text-sm font-medium text-ink-700 transition-colors hover:border-forest-300 hover:text-forest-700"
                      }
                    >
                      {action.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
