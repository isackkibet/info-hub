"use client";

import Link from "next/link";
import { setCurrentUser, setRole } from "@/lib/cfa/actions";
import { useCfaState } from "@/lib/cfa/store";
import { RoleLabels } from "@/lib/cfa/types";
import type { CfaRole } from "@/lib/cfa/types";

const ROLES = Object.entries(RoleLabels) as [CfaRole, string][];

export function AccessSwitcher() {
  const state = useCfaState();

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <label htmlFor="cfa-role" className="text-ink-600">
        Acting as
      </label>
      <select
        id="cfa-role"
        value={state.role}
        onChange={(event) => setRole(event.target.value as CfaRole)}
        className="rounded-md border border-sand-200 bg-white px-2 py-1 text-xs font-medium text-ink-900 outline-none focus:border-forest-600"
      >
        {ROLES.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <label htmlFor="cfa-user" className="sr-only">
        Recorder name
      </label>
      <input
        id="cfa-user"
        value={state.currentUser}
        onChange={(event) => setCurrentUser(event.target.value)}
        placeholder="Your name"
        className="w-32 rounded-md border border-sand-200 bg-white px-2 py-1 text-xs text-ink-900 outline-none focus:border-forest-600"
      />
    </div>
  );
}

export function RecordActivityLink() {
  return (
    <Link
      href="/cfa/activities"
      className="shrink-0 rounded-md bg-forest-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-forest-700"
    >
      + Record Activity
    </Link>
  );
}
