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
      id: "sihu",
      name: "SIHU News Hub",
      subtitle: "Sango Information Hub",
      description:
        "Submit and review environmental and human-rights reports across the Lake Victoria Basin.",
      membershipLabel: sihuMembership
        ? `${sihuMembership.role} access`
        : "No access yet",
      hasAccess: Boolean(sihuMembership),
      accent: "lake" as const,
      actions: [
        { href: "/sihu/submit", label: "Submit a report", primary: true },
        { href: "/sihu/validator", label: "Validator queue", primary: false },
        { href: "/sihu/my-reports", label: "My reports", primary: false },
      ],
    },
    {
      id: "cfa",
      name: "CFA Conservation Hub",
      subtitle: "Community Forest Association System",
      description:
        "Track sites, tree species, nursery stock, and the verification pipeline for forest conservation.",
      membershipLabel:
        cfaMemberships.length > 0
          ? cfaMemberships.map((m) => `${m.cfa.name} (${m.role})`).join(", ")
          : "No access yet",
      hasAccess: cfaMemberships.length > 0,
      accent: "forest" as const,
      actions: [
        { href: "/cfa/dashboard", label: "Open CFA dashboard", primary: true },
      ],
    },
  ];

  return (
    <>
      <AppNav />
      <main className="flex-1 bg-sand-50">
        <div className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-wide text-forest-700">
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
                key={hub.id}
                className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-lg shadow-forest-950/5"
              >
                {/* Accent strip */}
                <div
                  className={
                    hub.accent === "forest"
                      ? "h-1.5 w-full bg-forest-600"
                      : "h-1.5 w-full bg-lake-600"
                  }
                />

                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p
                        className={
                          hub.accent === "forest"
                            ? "text-xs font-semibold uppercase tracking-wide text-forest-700"
                            : "text-xs font-semibold uppercase tracking-wide text-lake-700"
                        }
                      >
                        {hub.subtitle}
                      </p>
                      <h2 className="mt-1 text-lg font-semibold text-ink-900">
                        {hub.name}
                      </h2>
                    </div>
                    <span
                      className={
                        hub.hasAccess
                          ? hub.accent === "forest"
                            ? "shrink-0 rounded-full border border-forest-200 bg-forest-50 px-2 py-1 text-xs font-medium text-forest-700"
                            : "shrink-0 rounded-full border border-lake-200 bg-lake-50 px-2 py-1 text-xs font-medium text-lake-700"
                          : "shrink-0 rounded-full border border-sand-200 bg-sand-100 px-2 py-1 text-xs font-medium text-ink-600"
                      }
                    >
                      {hub.membershipLabel}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-ink-600">
                    {hub.description}
                  </p>

                  <div className="mt-6 flex flex-col gap-2">
                    {hub.actions.map((action) => (
                      <Link
                        key={action.href}
                        href={action.href}
                        className={
                          action.primary
                            ? hub.accent === "forest"
                              ? "rounded-md bg-forest-900 px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-forest-800"
                              : "rounded-md bg-lake-600 px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-lake-700"
                            : hub.accent === "forest"
                              ? "rounded-md border border-sand-200 px-4 py-2.5 text-center text-sm font-medium text-ink-700 transition-colors hover:border-forest-200 hover:bg-forest-50 hover:text-forest-700"
                              : "rounded-md border border-sand-200 px-4 py-2.5 text-center text-sm font-medium text-ink-700 transition-colors hover:border-lake-200 hover:bg-lake-50 hover:text-lake-700"
                        }
                      >
                        {action.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
