import { redirect } from "next/navigation";
import Link from "next/link";
import { AppNav } from "@/components/app-nav";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { RecentSubmissions } from "./recent-submissions";

export default async function SihuDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const membership = await prisma.sihuMembership.findUnique({
    where: { userId: session.user.id },
  });

  // Fetch stats and recent submissions in parallel
  const [total, pending, verified, rejected, batched, recent] =
    await Promise.all([
      prisma.submission.count(),
      prisma.submission.count({ where: { status: "PENDING" } }),
      prisma.submission.count({ where: { status: "VERIFIED" } }),
      prisma.submission.count({ where: { status: "REJECTED" } }),
      prisma.submission.count({ where: { status: "BATCHED" } }),
      prisma.submission.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { user: { select: { name: true, email: true } } },
      }),
    ]);

  const role = membership?.role ?? null;

  return (
    <>
      <AppNav />
      <main className="flex-1 bg-sand-50">
        <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">

          {/* Page header */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-lake-600">
                SIHU — Sango Information Hub
              </span>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-900">
                Dashboard
              </h1>
              <p className="mt-1 text-sm text-ink-600">
                Lake Victoria Basin environmental and human-rights reports.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {role && (
                <span className="rounded-full border border-lake-200 bg-lake-50 px-3 py-1 text-xs font-semibold text-lake-700">
                  {role}
                </span>
              )}
              <Link
                href="/sihu/submit"
                className="rounded-md bg-lake-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-lake-700"
              >
                Submit report
              </Link>
              {(role === "VALIDATOR" || role === "ADMIN") && (
                <Link
                  href="/sihu/validator"
                  className="rounded-md border border-lake-200 px-4 py-2 text-sm font-medium text-lake-700 transition-colors hover:bg-lake-50"
                >
                  Validator queue
                </Link>
              )}
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
            <StatCard label="Total reports" value={total} color="ink" />
            <StatCard label="Pending" value={pending} color="amber" />
            <StatCard label="Verified" value={verified} color="forest" />
            <StatCard label="Rejected" value={rejected} color="red" />
            <StatCard label="On-chain" value={batched} color="lake" />
          </div>

          {/* Verification progress bar */}
          {total > 0 && (
            <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm shadow-forest-950/5">
              <div className="mb-3 flex items-center justify-between text-xs text-ink-600">
                <span className="font-medium">Verification progress</span>
                <span>
                  {Math.round(((verified + batched) / total) * 100)}% verified
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-sand-200">
                <div
                  className="h-2.5 rounded-full bg-forest-600 transition-all"
                  style={{
                    width: `${Math.round(((verified + batched) / total) * 100)}%`,
                  }}
                />
              </div>
              <div className="mt-3 flex gap-4 text-xs text-ink-600">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  {pending} pending
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-forest-600" />
                  {verified} verified
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-lake-600" />
                  {batched} anchored
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-400" />
                  {rejected} rejected
                </span>
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <QuickAction
              href="/sihu/submit"
              title="Submit a report"
              description="File a new environmental or human-rights report."
              accent="lake"
            />
            <QuickAction
              href="/sihu/my-reports"
              title="My reports"
              description="View all reports you have submitted from this account."
              accent="lake"
            />
            {(role === "VALIDATOR" || role === "ADMIN") && (
              <QuickAction
                href="/sihu/validator"
                title="Validator queue"
                description={`${pending} report${pending === 1 ? "" : "s"} waiting for review.`}
                accent="amber"
              />
            )}
          </div>

          {/* Recent submissions */}
          <div className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-ink-900">
                Recent submissions
              </h2>
              <Link
                href="/sihu/my-reports"
                className="text-xs font-medium text-lake-600 hover:underline"
              >
                View all
              </Link>
            </div>
            <RecentSubmissions submissions={recent} />
          </div>
        </div>
      </main>
    </>
  );
}

// ── Local sub-components ──────────────────────────────────────────────────────

type StatColor = "ink" | "amber" | "forest" | "red" | "lake";

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: StatColor;
}) {
  const strip: Record<StatColor, string> = {
    ink: "bg-ink-700",
    amber: "bg-amber-400",
    forest: "bg-forest-600",
    red: "bg-red-400",
    lake: "bg-lake-600",
  };
  const text: Record<StatColor, string> = {
    ink: "text-ink-900",
    amber: "text-amber-700",
    forest: "text-forest-700",
    red: "text-red-700",
    lake: "text-lake-700",
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm shadow-forest-950/5">
      <div className={`h-1 w-full ${strip[color]}`} />
      <div className="p-4">
        <p className="text-xs font-medium text-ink-600">{label}</p>
        <p className={`mt-1 text-2xl font-semibold ${text[color]}`}>
          {value.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  title,
  description,
  accent,
}: {
  href: string;
  title: string;
  description: string;
  accent: "lake" | "amber";
}) {
  const border = accent === "lake" ? "border-lake-200" : "border-amber-200";
  const bg = accent === "lake" ? "hover:bg-lake-50" : "hover:bg-amber-50";
  const heading = accent === "lake" ? "text-lake-700" : "text-amber-700";

  return (
    <Link
      href={href}
      className={`group rounded-2xl border ${border} bg-white p-5 transition-colors ${bg} shadow-sm shadow-forest-950/5`}
    >
      <p className={`text-sm font-semibold ${heading}`}>{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-ink-600">{description}</p>
    </Link>
  );
}
