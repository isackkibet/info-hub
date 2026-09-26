"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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
      { href: "/cfa/updates", label: "Updates" },
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
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenGroup(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setOpenGroup(null);
  }, [pathname]);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function groupIsActive(group: (typeof groups)[number]) {
    return group.items.some((item) => isActive(item.href));
  }

  function topLevelLinkClass(href: string) {
    const active = isActive(href);
    return active
      ? "rounded-md bg-forest-900 px-3 py-1.5 text-sm font-medium text-white"
      : "rounded-md px-3 py-1.5 text-sm font-medium text-ink-700 transition-colors hover:bg-forest-50 hover:text-forest-700";
  }

  return (
    <nav aria-label="CFA hub sections" className="bg-white shadow-sm">
      <div ref={navRef} className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-1 py-3">
          <Link href="/cfa/dashboard" className={topLevelLinkClass("/cfa/dashboard")}>
            Dashboard
          </Link>

          {groups.map((group) => {
            const active = groupIsActive(group);
            const open = openGroup === group.label;
            return (
              <div key={group.label} className="relative">
                <button
                  type="button"
                  onClick={() => setOpenGroup(open ? null : group.label)}
                  aria-expanded={open}
                  className={
                    active
                      ? "flex items-center gap-1 rounded-md bg-forest-50 px-3 py-1.5 text-sm font-medium text-forest-700"
                      : "flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-ink-700 transition-colors hover:bg-forest-50 hover:text-forest-700"
                  }
                >
                  {group.label}
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {open && (
                  <div className="absolute left-0 top-full z-20 mt-1.5 w-48 rounded-lg bg-white p-1.5 shadow-lg ring-1 ring-black/5">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={
                          isActive(item.href)
                            ? "block rounded-md bg-forest-900 px-3 py-1.5 text-sm font-medium text-white"
                            : "block rounded-md px-3 py-1.5 text-sm font-medium text-ink-700 transition-colors hover:bg-forest-50 hover:text-forest-700"
                        }
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <Link href="/cfa/settings" className={topLevelLinkClass("/cfa/settings")}>
            Settings
          </Link>
        </div>
      </div>
    </nav>
  );
}
