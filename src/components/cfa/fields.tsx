"use client";

import type { ReactNode } from "react";

const inputClass =
  "w-full rounded-md border border-sand-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className = "",
}: {
  label?: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-ink-800">
          {label}
        </label>
      )}
      <div className={label ? "mt-2" : undefined}>{children}</div>
      {hint && !error && <p className="mt-1 text-xs text-ink-600">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return <input {...rest} className={`${inputClass} ${className}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = "", ...rest } = props;
  return <textarea {...rest} className={`${inputClass} ${className}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = "", children, ...rest } = props;
  return (
    <select {...rest} className={`${inputClass} ${className}`}>
      {children}
    </select>
  );
}

export function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = "", ...rest } = props;
  return (
    <button
      {...rest}
      className={`rounded-md bg-forest-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-forest-700 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    />
  );
}

export function SecondaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = "", ...rest } = props;
  return (
    <button
      {...rest}
      className={`rounded-md border border-sand-200 px-4 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:border-forest-200 hover:bg-forest-50 hover:text-forest-700 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    />
  );
}

export function Card({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl bg-white p-6 shadow-lg shadow-forest-950/5 ${className}`}
    >
      {(title || action) && (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-lg font-semibold text-ink-900">{title}</h2>}
            {description && (
              <p className="mt-1 text-sm text-ink-600">{description}</p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-sand-200 bg-sand-50 px-6 py-10 text-center">
      <p className="text-sm font-semibold text-ink-900">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-ink-600">{description}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function ErrorNote({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
    >
      {message}
    </p>
  );
}

export function SuccessNote({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="status"
      className="rounded-md border border-forest-200 bg-forest-50 px-3 py-2 text-sm text-forest-700"
    >
      {message}
    </p>
  );
}
