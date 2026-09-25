"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const groups: { label: string; items: { href: string; label: string }[] }[] = [
  {
    label: "Nursery",
    items: [
      { href: "/cfa/nurseries", label: "Nurseries" },
      { href: "/cfa/seedbeds", label: "Seedbeds" },
      { href: "/cfa/species", label: "Species" },
      { href: "/cfa/seed-batches", label: "Seed batches" },
    ],
  },
  {
    label: "Records",
    items: [
      { href: "/cfa/activities", label: "Activities" },
      { href: "/cfa/planting", label: "Planting" },
      { href: "/cfa/survival", label: "Survival" },
    ],
  },
  {
    label: "Movement",
    items: [
      { href: "/cfa/sales", label: "Sales" },
      { href: "/cfa/donations", label: "Donations" },
      { href: "/cfa/transfers", label: "Transfers" },
    ],
  },
  {
    label: "Reports",
    items: [
      { href: "/cfa/verification", label: "Verification" },
      { href: "/cfa/reports", label: "Reports" },
      { href: "/cfa/programs", label: "Programs" },
    ],
  },
];

export function CfaSubnav() {
  const pathname = usePathname();

  function linkClass(href: string) {
    const active = pathname === href || pathname.startsWith(`${href}/`);
    return active
      ? "rounded-md bg-forest-900 px-3 py-1.5 text-base font-medium text-white"
      : "rounded-md px-3 py-1.5 text-base font-medium text-ink-700 transition-colors hover:bg-forest-50 hover:text-forest-700";
  }

  return (
    <nav aria-label="CFA hub sections" className="border-b border-sand-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
        <div className="flex flex-wrap items-start gap-x-10 gap-y-4">
          <Link href="/cfa/dashboard" className={linkClass("/cfa/dashboard")}>
            Dashboard
          </Link>

          {groups.map((group) => (
            <div key={group.label} className="flex flex-wrap items-center gap-1">
              <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-ink-600">
                {group.label}
              </span>
              {group.items.map((item) => (
                <Link key={item.href} href={item.href} className={linkClass(item.href)}>
                  {item.label}
                </Link>
              ))}
            </div>
          ))}

          <Link href="/cfa/settings" className={linkClass("/cfa/settings")}>
            Settings
          </Link>
        </div>
      </div>
    </nav>
  );
}
