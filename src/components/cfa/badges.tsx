"use client";

import type { ReactNode } from "react";
import type {
  BatchStatus,
  CfaStatus,
  NurseryStatus,
  PaymentStatus,
  PlantingStatus,
  ProgramStatus,
  SeedbedStatus,
  VerificationStatus,
} from "@/lib/cfa/types";
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

type Tone = "green" | "lake" | "sand" | "amber" | "red";

const TONE_CLASS: Record<Tone, string> = {
  green: "border-forest-200 bg-forest-50 text-forest-700",
  lake: "border-lake-200 bg-lake-50 text-lake-700",
  sand: "border-sand-200 bg-sand-100 text-ink-700",
  amber: "border-gold-200 bg-gold-50 text-gold-700",
  red: "border-red-200 bg-red-50 text-red-700",
};

export function toneFor(status: string): Tone {
  switch (status) {
    case "ACTIVE":
    case "VERIFIED":
    case "PAID":
    case "CLOSED":
    case "COMPLETED":
    case "APPROVED":
    case "IN":
      return "green";
    case "SUBMITTED":
    case "UNDER_REVIEW":
    case "IN_PROGRESS":
    case "IN_STORAGE":
    case "RECEIVED":
    case "SOWN":
    case "MONITORING":
      return "lake";
    case "DRAFT":
    case "PLANNED":
    case "PLANNING":
    case "PENDING":
    case "PARTIALLY_PAID":
    case "TEMPORARILY_INACTIVE":
      return "sand";
    case "NEEDS_CORRECTION":
    case "MAINTENANCE":
    case "EXHAUSTED":
    case "DISCARDED":
    case "OUT":
      return "amber";
    case "REJECTED":
    case "DISPUTED":
    case "SUSPENDED":
    case "CANCELLED":
    case "ARCHIVED":
    case "INACTIVE":
      return "red";
    default:
      return "sand";
  }
}

export function Badge({
  tone,
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${TONE_CLASS[tone ?? "sand"]}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={toneFor(status)}>{status.replace(/_/g, " ")}</Badge>;
}

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  return <Badge tone={toneFor(status)}>{VerificationStatusLabels[status]}</Badge>;
}

export function NurseryBadge({ status }: { status: NurseryStatus }) {
  return <Badge tone={toneFor(status)}>{NurseryStatusLabels[status]}</Badge>;
}

export function SeedbedBadge({ status }: { status: SeedbedStatus }) {
  return <Badge tone={toneFor(status)}>{SeedbedStatusLabels[status]}</Badge>;
}

export function BatchBadge({ status }: { status: BatchStatus }) {
  return <Badge tone={toneFor(status)}>{BatchStatusLabels[status]}</Badge>;
}

export function PlantingBadge({ status }: { status: PlantingStatus }) {
  return <Badge tone={toneFor(status)}>{PlantingStatusLabels[status]}</Badge>;
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return <Badge tone={toneFor(status)}>{PaymentStatusLabels[status]}</Badge>;
}

export function ProgramBadge({ status }: { status: ProgramStatus }) {
  return <Badge tone={toneFor(status)}>{ProgramStatusLabels[status]}</Badge>;
}

export function CfaBadge({ status }: { status: CfaStatus }) {
  return <Badge tone={toneFor(status)}>{CfaStatusLabels[status]}</Badge>;
}

export function StatCard({
  label,
  value,
  hint,
  tone = "sand",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: Tone;
}) {
  const valueTone: Record<Tone, string> = {
    green: "text-forest-700",
    lake: "text-lake-700",
    sand: "text-ink-900",
    amber: "text-gold-700",
    red: "text-red-700",
  };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-lg shadow-forest-950/5">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-600">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-semibold ${valueTone[tone]}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-600">{hint}</p>}
    </div>
  );
}
