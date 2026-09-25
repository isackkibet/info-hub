"use client";

import type { ReactNode } from "react";
import { AppNav } from "@/components/app-nav";
import { AccessSwitcher, RecordActivityLink } from "./access";
import { CfaSubnav } from "./subnav";

export function PageShell({
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <AppNav />
      <CfaSubnav />
      <main className="flex-1 bg-sand-50">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              {eyebrow && (
                <span className="text-xs font-semibold uppercase tracking-wide text-forest-700">
                  {eyebrow}
                </span>
              )}
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink-900">
                {title}
              </h1>
              {description && (
                <p className="mt-2 text-sm leading-relaxed text-ink-700">
                  {description}
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {actions}
              <RecordActivityLink />
            </div>
          </div>

          <div className="mt-4">
            <AccessSwitcher />
          </div>

          <div className="mt-6">{children}</div>
        </div>
      </main>
    </>
  );
}
