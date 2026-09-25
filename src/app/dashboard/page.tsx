import Link from "next/link";
import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [sihuMembership, cfaMemberships] = await Promise.all([
    prisma.sihuMembership.findUnique({
      where: { userId: session.user.id },
    }),
    prisma.cFAMembership.findMany({
      where: { userId: session.user.id },
      include: { cfa: true },
    }),
  ]);

  const displayName = session.user.name ?? session.user.email ?? "there";

  const hubs = [
    {
      name: "SIHU News Hub",
      description:
        "Submit and review environmental and human-rights reports across the Lake Victoria Basin.",
      membershipLabel: sihuMembership
        ? `${sihuMembership.role} access`
        : "No access yet",
      hasAccess: Boolean(sihuMembership),
      actions: [
        { href: "/sihu/submit", label: "Submit a report" },
        { href: "/sihu/validator", label: "Validator queue" },
        { href: "/sihu/my-reports", label: "My reports" },
      ],
    },
    {
      name: "CFA Conservation Hub",
      description:
        "Track sites, tree species, nursery stock, and the verification pipeline for forest conservation.",
      membershipLabel:
        cfaMemberships.length > 0
          ? cfaMemberships.map((m) => `${m.cfa.name} (${m.role})`).join(", ")
          : "No access yet",
      hasAccess: cfaMemberships.length > 0,
      actions: [{ href: "/cfa/dashboard", label: "Open CFA dashboard" }],
    },
  ];

  return (
    <>
      <AppNav />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-wide text-forest-600">
            Dashboard
          </span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink-900">
            Welcome back, {displayName}
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
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold text-ink-900">
                    {hub.name}
                  </h2>
                  <span
                    className={
                      hub.hasAccess
                        ? "shrink-0 rounded-full border border-forest-200 bg-forest-50 px-2 py-1 text-xs font-medium text-forest-700"
                        : "shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-ink-600"
                    }
                  >
                    {hub.membershipLabel}
                  </span>
                </div>
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
