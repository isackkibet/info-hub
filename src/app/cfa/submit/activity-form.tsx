"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import {
  cfaActivitySchema,
  type CfaActivityInput,
} from "@/lib/cfa-activity-schema";
import { addActivity, ACTIVITY_TYPE_OPTIONS } from "@/lib/cfa-activity";
import { cfaSites, cfaSpeciesSample } from "@/lib/cfa-mock";

export function ActivityForm() {
  const [activityId, setActivityId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CfaActivityInput>({
    resolver: zodResolver(cfaActivitySchema),
    defaultValues: {
      activityType: "PROPAGATION",
      siteName: cfaSites[0]?.name ?? "",
      quantity: "1",
    },
  });

  function onSubmit(data: CfaActivityInput) {
    const activity = addActivity({
      recordedBy: data.recordedBy,
      activityType: data.activityType,
      siteName: data.siteName,
      speciesName: data.speciesName || undefined,
      quantity: Number(data.quantity),
      notes: data.notes || undefined,
    });
    setActivityId(activity.id);
    reset({
      activityType: data.activityType,
      siteName: data.siteName,
      quantity: "1",
    });
  }

  if (activityId) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-2xl bg-white p-8 shadow-lg shadow-forest-950/5"
      >
        <span className="inline-flex items-center rounded-full border border-forest-200 bg-forest-50 px-3 py-1 text-xs font-medium text-forest-700">
          Recorded
        </span>
        <h2 className="mt-4 text-xl font-semibold text-ink-900">
          Activity logged
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">
          Reference ID{" "}
          <span className="font-mono font-semibold text-ink-900">
            {activityId}
          </span>
          . It now appears in recent activity on the dashboard.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setActivityId(null)}
            className="rounded-md bg-forest-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-forest-700"
          >
            Record another activity
          </button>
          <Link
            href="/cfa/dashboard"
            className="rounded-md border border-sand-200 px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:border-forest-200 hover:text-forest-700"
          >
            View dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 rounded-2xl bg-white p-8 shadow-lg shadow-forest-950/5"
      noValidate
    >
      <div>
        <label htmlFor="recordedBy" className="text-sm font-medium text-ink-800">
          Your name
        </label>
        <input
          id="recordedBy"
          type="text"
          required
          aria-required="true"
          aria-invalid={errors.recordedBy ? "true" : undefined}
          aria-describedby={errors.recordedBy ? "recordedBy-error" : undefined}
          {...register("recordedBy")}
          className="mt-2 w-full rounded-md border border-sand-200 px-3 py-2 text-sm text-ink-900 outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600"
          placeholder="e.g. Achieng"
        />
        {errors.recordedBy && (
          <p id="recordedBy-error" role="alert" className="mt-1 text-xs text-red-600">
            {errors.recordedBy.message}
          </p>
        )}
      </div>

      <div>
        <p className="text-sm font-medium text-ink-800">What happened</p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {ACTIVITY_TYPE_OPTIONS.map(([value, label]) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2 rounded-md border border-sand-200 px-3 py-2 text-sm text-ink-700 has-[:checked]:border-forest-600 has-[:checked]:bg-forest-50 has-[:checked]:text-forest-700"
            >
              <input
                type="radio"
                value={value}
                {...register("activityType")}
                className="h-3.5 w-3.5 accent-forest-600"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="siteName" className="text-sm font-medium text-ink-800">
            Site or nursery
          </label>
          <select
            id="siteName"
            required
            aria-required="true"
            {...register("siteName")}
            className="mt-2 w-full rounded-md border border-sand-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600"
          >
            {cfaSites.map((site) => (
              <option key={site.name} value={site.name}>
                {site.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="speciesName" className="text-sm font-medium text-ink-800">
            Species (optional)
          </label>
          <select
            id="speciesName"
            {...register("speciesName")}
            className="mt-2 w-full rounded-md border border-sand-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600"
          >
            <option value="">Not species-specific</option>
            {cfaSpeciesSample.map((species) => (
              <option key={species.name} value={species.name}>
                {species.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="quantity" className="text-sm font-medium text-ink-800">
          Quantity
        </label>
        <input
          id="quantity"
          type="number"
          min={1}
          required
          aria-required="true"
          aria-invalid={errors.quantity ? "true" : undefined}
          aria-describedby={errors.quantity ? "quantity-error" : undefined}
          {...register("quantity")}
          className="mt-2 w-full max-w-xs rounded-md border border-sand-200 px-3 py-2 text-sm text-ink-900 outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600"
        />
        {errors.quantity && (
          <p id="quantity-error" role="alert" className="mt-1 text-xs text-red-600">
            {errors.quantity.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="notes" className="text-sm font-medium text-ink-800">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          rows={3}
          {...register("notes")}
          className="mt-2 w-full rounded-md border border-sand-200 px-3 py-2 text-sm text-ink-900 outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600"
          placeholder="Any useful field context"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-forest-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-forest-700 disabled:opacity-60"
      >
        Record activity
      </button>
    </form>
  );
}
