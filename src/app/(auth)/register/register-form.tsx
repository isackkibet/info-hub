"use client";

import { useActionState } from "react";
import { registerAction, type RegisterState } from "./actions";

const initialState: RegisterState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    registerAction,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-2xl bg-white p-8 shadow-lg shadow-forest-950/5"
      noValidate
    >
      {/* Name */}
      <div>
        <label htmlFor="name" className="text-sm font-medium text-ink-800">
          Full name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          className="mt-2 w-full rounded-md border border-sand-200 px-3 py-2 text-sm text-ink-900 outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600"
          placeholder="e.g. Otieno Achieng"
        />
        {state.fieldErrors?.name && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.name}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="text-sm font-medium text-ink-800">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-2 w-full rounded-md border border-sand-200 px-3 py-2 text-sm text-ink-900 outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600"
          placeholder="you@example.com"
        />
        {state.fieldErrors?.email && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.email}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="text-sm font-medium text-ink-800">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          className="mt-2 w-full rounded-md border border-sand-200 px-3 py-2 text-sm text-ink-900 outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600"
          placeholder="At least 8 characters"
        />
        {state.fieldErrors?.password && (
          <p className="mt-1 text-xs text-red-600">{state.fieldErrors.password}</p>
        )}
      </div>

      {/* Confirm password */}
      <div>
        <label htmlFor="confirmPassword" className="text-sm font-medium text-ink-800">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          className="mt-2 w-full rounded-md border border-sand-200 px-3 py-2 text-sm text-ink-900 outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600"
          placeholder="Repeat your password"
        />
        {state.fieldErrors?.confirmPassword && (
          <p className="mt-1 text-xs text-red-600">
            {state.fieldErrors.confirmPassword}
          </p>
        )}
      </div>

      {/* Top-level error */}
      {state.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-forest-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-forest-800 disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
