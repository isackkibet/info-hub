"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import {
  sihuSubmissionSchema,
  type SihuSubmissionInput,
} from "@/lib/sihu-schema";
import { addSubmission, CATEGORY_OPTIONS } from "@/lib/sihu";

export function SubmitForm() {
  const [trackingId, setTrackingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SihuSubmissionInput>({
    resolver: zodResolver(sihuSubmissionSchema),
    defaultValues: {
      quantity: "1",
      category: "WATER_HYACINTH_TRACKING",
    },
  });

  function onSubmit(data: SihuSubmissionInput) {
    const submission = addSubmission({
      reporterName: data.reporterName,
      title: data.title,
      category: data.category,
      topic: data.topic || undefined,
      quantity: Number(data.quantity),
      locationName: data.locationName,
      latitude: data.latitude ? Number(data.latitude) : undefined,
      longitude: data.longitude ? Number(data.longitude) : undefined,
      publicMediaUrl: data.publicMediaUrl,
    });
    setTrackingId(submission.id);
    reset({ quantity: "1", category: data.category });
  }

  if (trackingId) {
    return (
      <div className="rounded-2xl border border-forest-900/10 bg-white p-8">
        <span className="inline-flex items-center rounded-full border border-forest-700/20 bg-forest-50 px-3 py-1 text-xs font-medium text-forest-700">
          Submitted
        </span>
        <h2 className="mt-4 text-xl font-semibold text-ink-900">
          Report received
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">
          Your tracking ID is
          <span className="ml-1 font-mono font-semibold text-ink-900">
            {trackingId}
          </span>
          . A validator will review it and update its status.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setTrackingId(null)}
            className="rounded-md bg-forest-700 px-4 py-2 text-sm font-medium text-sand-50 transition-colors hover:bg-forest-800"
          >
            Submit another report
          </button>
          <Link
            href="/sihu/my-reports"
            className="rounded-md border border-ink-900/15 px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:border-forest-700/40 hover:text-forest-700"
          >
            View my reports
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 rounded-2xl border border-forest-900/10 bg-white p-8"
      noValidate
    >
      <div>
        <label htmlFor="reporterName" className="text-sm font-medium text-ink-800">
          Your name
        </label>
        <input
          id="reporterName"
          type="text"
          {...register("reporterName")}
          className="mt-2 w-full rounded-md border border-ink-900/15 px-3 py-2 text-sm text-ink-900 outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600"
          placeholder="e.g. Otieno"
        />
        {errors.reporterName && (
          <p className="mt-1 text-xs text-red-600">
            {errors.reporterName.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="title" className="text-sm font-medium text-ink-800">
          Title
        </label>
        <input
          id="title"
          type="text"
          {...register("title")}
          className="mt-2 w-full rounded-md border border-ink-900/15 px-3 py-2 text-sm text-ink-900 outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600"
          placeholder="e.g. Water hyacinth spreading near Dunga Beach"
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className="text-sm font-medium text-ink-800">
            Category
          </label>
          <select
            id="category"
            {...register("category")}
            className="mt-2 w-full rounded-md border border-ink-900/15 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600"
          >
            {CATEGORY_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="topic" className="text-sm font-medium text-ink-800">
            Topic (optional)
          </label>
          <input
            id="topic"
            type="text"
            {...register("topic")}
            className="mt-2 w-full rounded-md border border-ink-900/15 px-3 py-2 text-sm text-ink-900 outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600"
            placeholder="e.g. species or subject name"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div>
          <label htmlFor="quantity" className="text-sm font-medium text-ink-800">
            Quantity
          </label>
          <input
            id="quantity"
            type="number"
            min={1}
            {...register("quantity")}
            className="mt-2 w-full rounded-md border border-ink-900/15 px-3 py-2 text-sm text-ink-900 outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600"
          />
          {errors.quantity && (
            <p className="mt-1 text-xs text-red-600">
              {errors.quantity.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="latitude" className="text-sm font-medium text-ink-800">
            Latitude (optional)
          </label>
          <input
            id="latitude"
            type="text"
            {...register("latitude")}
            className="mt-2 w-full rounded-md border border-ink-900/15 px-3 py-2 text-sm text-ink-900 outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600"
            placeholder="-0.1022"
          />
        </div>

        <div>
          <label htmlFor="longitude" className="text-sm font-medium text-ink-800">
            Longitude (optional)
          </label>
          <input
            id="longitude"
            type="text"
            {...register("longitude")}
            className="mt-2 w-full rounded-md border border-ink-900/15 px-3 py-2 text-sm text-ink-900 outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600"
            placeholder="34.7617"
          />
        </div>
      </div>

      <div>
        <label htmlFor="locationName" className="text-sm font-medium text-ink-800">
          Location name
        </label>
        <input
          id="locationName"
          type="text"
          {...register("locationName")}
          className="mt-2 w-full rounded-md border border-ink-900/15 px-3 py-2 text-sm text-ink-900 outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600"
          placeholder="e.g. Dunga Beach, Kisumu"
        />
        {errors.locationName && (
          <p className="mt-1 text-xs text-red-600">
            {errors.locationName.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="publicMediaUrl" className="text-sm font-medium text-ink-800">
          Public media URL
        </label>
        <input
          id="publicMediaUrl"
          type="text"
          {...register("publicMediaUrl")}
          className="mt-2 w-full rounded-md border border-ink-900/15 px-3 py-2 text-sm text-ink-900 outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600"
          placeholder="https://instagram.com/p/..."
        />
        <p className="mt-1 text-xs text-ink-600">
          Post your photo or video publicly first, then paste the link here.
          No file uploads.
        </p>
        {errors.publicMediaUrl && (
          <p className="mt-1 text-xs text-red-600">
            {errors.publicMediaUrl.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-forest-700 px-4 py-3 text-sm font-semibold text-sand-50 transition-colors hover:bg-forest-800 disabled:opacity-60"
      >
        Submit report
      </button>
    </form>
  );
}
