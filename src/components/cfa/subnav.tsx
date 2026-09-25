"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BatchStatusLabels,
  CfaStatusLabels,
  NurseryStatusLabels,
  PaymentStatusLabels,
  PlantingStatusLabels,
  ProgramStatusLabels,
  SeedbedStatusLabels,
  VerificationStatusLabels,
} from "@/lib/cfa/types";

export function CfaSubnav() {
  const pathname = usePathname();
  const items = [
    { href: "/cfa/dashboard", label: "Dashboard" },
    { href: "/cfa/nurseries", label: "Nurseries" },
    { href: "/cfa/seedbeds", label: "Seedbeds" },
    { href: "/cfa/species", label: "Species" },
    { href: "/cfa/seed-batches", label: "Seed batches" },
    { href: "/cfa/inventory", label: "Inventory" },
    { href: "/cfa/activities", label: "Activities" },
    { href: "/cfa/planting", label: "Planting" },
    { href: "/cfa/survival", label: "Survival" },
    { href: "/cfa/sales", label: "Sales" },
    { href: "/cfa/donations", label: "Donations" },
    { href: "/cfa/transfers", label: "Transfers" },
    { href: "/cfa/verification", label: "Verification" },
    { href: "/cfa/reports", label: "Reports" },
    { href: "/cfa/programs", label: "Programs" },
    { href: "/cfa/settings", label: "Settings" },
  ];

  return (
    <nav
      aria-label="CFA hub sections"
      className="border-b border-sand-200 bg-white"
    >
      <div className="mx-auto max-w-7xl overflow-x-auto px-6 lg:px-8">
        <ul className="flex min-w-max gap-1 py-2">
          {items.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={
                    active
                      ? "block rounded-md bg-forest-900 px-3 py-1.5 text-sm font-medium text-white"
                      : "block rounded-md px-3 py-1.5 text-sm text-ink-700 transition-colors hover:bg-forest-50 hover:text-forest-700"
                  }
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
