"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import {
  sihuSubmissionSchema,
  type SihuSubmissionInput,
} from "@/lib/sihu-schema";
import { addSubmission, CATEGORY_OPTIONS, CONTENT_TYPE_OPTIONS } from "@/lib/sihu";

export function SubmitForm() {
  const [trackingId, setTrackingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SihuSubmissionInput>({
    resolver: zodResolver(sihuSubmissionSchema),
    defaultValues: {
      quantity: "1",
      category: "WATER_HYACINTH_TRACKING",
      contentType: "PICTURE",
    },
  });

  const contentType = watch("contentType");
  const isArticle = contentType === "ARTICLE";

  function onSubmit(data: SihuSubmissionInput) {
    const submission = addSubmission({
      reporterName: data.reporterName,
      title: data.title,
      category: data.category,
      contentType: data.contentType,
      topic: data.topic || undefined,
      quantity: Number(data.quantity),
      locationName: data.locationName,
      latitude: data.latitude ? Number(data.latitude) : undefined,
      longitude: data.longitude ? Number(data.longitude) : undefined,
      publicMediaUrl: data.publicMediaUrl || undefined,
      body: data.body || undefined,
    });
    setTrackingId(submission.id);
    reset({ quantity: "1", category: data.category, contentType: data.contentType });
  }

  if (trackingId) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-2xl bg-white p-8 shadow-lg shadow-forest-950/5"
      >
        <span className="inline-flex items-center rounded-full border border-lake-200 bg-lake-50 px-3 py-1 text-xs font-medium text-lake-700">
          Submitted
        </span>
        <h2 className="mt-4 text-xl font-semibold text-ink-900">
          Report received
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">
          Your tracking ID is{" "}
          <span className="font-mono font-semibold text-ink-900">
            {trackingId}
          </span>
          . A validator will review it and update its status.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setTrackingId(null)}
            className="rounded-md bg-lake-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-lake-700"
          >
            Submit another report
          </button>
          <Link
            href="/sihu/my-reports"
            className="rounded-md border border-sand-200 px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:border-lake-200 hover:text-lake-700"
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
      className="space-y-6 rounded-2xl bg-white p-8 shadow-lg shadow-forest-950/5"
      noValidate
    >
      <div>
        <label htmlFor="reporterName" className="text-sm font-medium text-ink-800">
          Your name
        </label>
        <input
          id="reporterName"
          type="text"
          required
          aria-required="true"
          aria-invalid={errors.reporterName ? "true" : undefined}
          aria-describedby={errors.reporterName ? "reporterName-error" : undefined}
          {...register("reporterName")}
          className="mt-2 w-full rounded-md border border-sand-200 px-3 py-2 text-sm text-ink-900 outline-none focus:border-lake-600 focus:ring-1 focus:ring-lake-600"
          placeholder="e.g. Otieno"
        />
        {errors.reporterName && (
          <p id="reporterName-error" role="alert" className="mt-1 text-xs text-red-600">
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
          required
          aria-required="true"
          aria-invalid={errors.title ? "true" : undefined}
          aria-describedby={errors.title ? "title-error" : undefined}
          {...register("title")}
          className="mt-2 w-full rounded-md border border-sand-200 px-3 py-2 text-sm text-ink-900 outline-none focus:border-lake-600 focus:ring-1 focus:ring-lake-600"
          placeholder="e.g. Water hyacinth spreading near Dunga Beach"
        />
        {errors.title && (
          <p id="title-error" role="alert" className="mt-1 text-xs text-red-600">
            {errors.title.message}
          </p>
        )}
      </div>

      <div>
        <p className="text-sm font-medium text-ink-800">Format</p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {CONTENT_TYPE_OPTIONS.map(([value, label]) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2 rounded-md border border-sand-200 px-3 py-2 text-sm text-ink-700 has-checked:border-lake-600 has-checked:bg-lake-50 has-checked:text-lake-700"
            >
              <input
                type="radio"
                value={value}
                {...register("contentType")}
                className="h-3.5 w-3.5 accent-lake-600"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className="text-sm font-medium text-ink-800">
            Category
          </label>
          <select
            id="category"
            required
            aria-required="true"
            {...register("category")}
            className="mt-2 w-full rounded-md border border-sand-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-lake-600 focus:ring-1 focus:ring-lake-600"
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
            className="mt-2 w-full rounded-md border border-sand-200 px-3 py-2 text-sm text-ink-900 outline-none focus:border-lake-600 focus:ring-1 focus:ring-lake-600"
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
            required
            aria-required="true"
            aria-invalid={errors.quantity ? "true" : undefined}
            aria-describedby={errors.quantity ? "quantity-error" : undefined}
            {...register("quantity")}
            className="mt-2 w-full rounded-md border border-sand-200 px-3 py-2 text-sm text-ink-900 outline-none focus:border-lake-600 focus:ring-1 focus:ring-lake-600"
          />
          {errors.quantity && (
            <p id="quantity-error" role="alert" className="mt-1 text-xs text-red-600">
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
            className="mt-2 w-full rounded-md border border-sand-200 px-3 py-2 text-sm text-ink-900 outline-none focus:border-lake-600 focus:ring-1 focus:ring-lake-600"
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
            className="mt-2 w-full rounded-md border border-sand-200 px-3 py-2 text-sm text-ink-900 outline-none focus:border-lake-600 focus:ring-1 focus:ring-lake-600"
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
          required
          aria-required="true"
          aria-invalid={errors.locationName ? "true" : undefined}
          aria-describedby={errors.locationName ? "locationName-error" : undefined}
          {...register("locationName")}
          className="mt-2 w-full rounded-md border border-sand-200 px-3 py-2 text-sm text-ink-900 outline-none focus:border-lake-600 focus:ring-1 focus:ring-lake-600"
          placeholder="e.g. Dunga Beach, Kisumu"
        />
        {errors.locationName && (
          <p id="locationName-error" role="alert" className="mt-1 text-xs text-red-600">
            {errors.locationName.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="publicMediaUrl" className="text-sm font-medium text-ink-800">
          Public link {isArticle && "(optional if you write the article below)"}
        </label>
        <input
          id="publicMediaUrl"
          type="text"
          aria-invalid={errors.publicMediaUrl ? "true" : undefined}
          aria-describedby={
            errors.publicMediaUrl
              ? "publicMediaUrl-hint publicMediaUrl-error"
              : "publicMediaUrl-hint"
          }
          {...register("publicMediaUrl")}
          className="mt-2 w-full rounded-md border border-sand-200 px-3 py-2 text-sm text-ink-900 outline-none focus:border-lake-600 focus:ring-1 focus:ring-lake-600"
          placeholder="https://instagram.com/p/..."
        />
        <p id="publicMediaUrl-hint" className="mt-1 text-xs text-ink-600">
          Post your picture, video, or podcast publicly first, then paste the
          link here. No file uploads.
        </p>
        {errors.publicMediaUrl && (
          <p id="publicMediaUrl-error" role="alert" className="mt-1 text-xs text-red-600">
            {errors.publicMediaUrl.message}
          </p>
        )}
      </div>

      {isArticle && (
        <div>
          <label htmlFor="body" className="text-sm font-medium text-ink-800">
            Write the article
          </label>
          <textarea
            id="body"
            rows={6}
            {...register("body")}
            className="mt-2 w-full rounded-md border border-sand-200 px-3 py-2 text-sm text-ink-900 outline-none focus:border-lake-600 focus:ring-1 focus:ring-lake-600"
            placeholder="Write your report directly here, or use the public link above instead."
          />
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-lake-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-lake-700 disabled:opacity-60"
      >
        Submit report
      </button>
    </form>
  );
}
