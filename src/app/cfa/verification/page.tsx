"use client";

import { useState } from "react";
import { PageShell } from "@/components/cfa/page-shell";
import { Badge, StatCard, VerificationBadge } from "@/components/cfa/badges";
import {
  Card,
  EmptyState,
  ErrorNote,
  Field,
  SecondaryButton,
  Select,
  SuccessNote,
  TextArea,
  TextInput,
} from "@/components/cfa/fields";
import { useCfaState } from "@/lib/cfa/store";
import { useAccess, canVerifyOwnSubmission } from "@/lib/cfa/permissions";
import { decideOnRecord, type DecisionInput } from "@/lib/cfa/actions";
import { nurseryName, speciesName } from "@/lib/cfa/inventory";
import {
  ActivityTypeLabels,
  EntityTypeLabels,
  EvidenceKindLabels,
  VerificationMethodLabels,
  VerificationMethodOptions,
  type EntityType,
  type VerificationMethod,
  type VerificationStatus,
} from "@/lib/cfa/types";
import { formatRelativeDate } from "@/lib/format-date";

interface QueueItem {
  entityType: EntityType;
  entityId: string;
  title: string;
  detail: string;
  submittedBy: string;
  submittedAt: string;
  status: VerificationStatus;
}

export default function VerificationPage() {
  const state = useCfaState();
  const access = useAccess();
  const [statusFilter, setStatusFilter] = useState("SUBMITTED");
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();

  const queue: QueueItem[] = [
    ...state.activities.map((activity) => ({
      entityType: "ACTIVITY" as const,
      entityId: activity.id,
      title: `${ActivityTypeLabels[activity.activityType]} · ${activity.quantity.toLocaleString()} seedlings`,
      detail: `${nurseryName(state, activity.nurseryId)}${activity.speciesId ? ` · ${speciesName(state, activity.speciesId)}` : ""}`,
      submittedBy: activity.recordedBy,
      submittedAt: activity.createdAt,
      status: activity.status,
    })),
    ...state.transactions
      .filter(
        (txn) =>
          !txn.relatedActivityId && txn.verificationStatus === "SUBMITTED",
      )
      .map((txn) => ({
        entityType: "INVENTORY_TRANSACTION" as const,
        entityId: txn.id,
        title: `Transaction ${txn.id}`,
        detail: `${txn.direction} ${txn.quantity} · ${nurseryName(state, txn.nurseryId)}`,
        submittedBy: txn.recordedBy,
        submittedAt: txn.createdAt,
        status: txn.verificationStatus,
      })),
  ];

  const visible = queue.filter(
    (item) => statusFilter === "ALL" || item.status === statusFilter,
  );
  const pending = queue.filter((item) => item.status === "SUBMITTED").length;
  const verified = queue.filter((item) => item.status === "VERIFIED").length;
  const corrections = queue.filter(
    (item) => item.status === "NEEDS_CORRECTION",
  ).length;

  if (!access.can("VERIFY")) {
    return (
      <PageShell
        eyebrow="Trust"
        title="Verification queue"
        description="Only verifiers and CFA administrators can review and decide on submitted records."
      >
        <EmptyState
          title="You do not have verification rights"
          description={`Your role is ${access.roleLabel}. Switch to the verifier role from the control at the top of the page to preview the queue.`}
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Trust"
      title="Verification queue"
      description="A record only counts once it is verified. You cannot verify your own submission, and a verified record is never edited in place — corrections create a new version."
    >
      {error && <ErrorNote message={error} />}
      {success && <SuccessNote message={success} />}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Awaiting review" value={pending} tone={pending > 0 ? "lake" : "sand"} />
        <StatCard label="Verified" value={verified} tone="green" />
        <StatCard
          label="Needs correction"
          value={corrections}
          tone={corrections > 0 ? "amber" : "sand"}
        />
        <StatCard label="Decisions recorded" value={state.verifications.length} />
      </div>

      <div className="mt-6 w-60">
        <Field label="Show" htmlFor="v-status">
          <Select
            id="v-status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="ALL">All records</option>
            <option value="SUBMITTED">Awaiting review</option>
            <option value="UNDER_REVIEW">Under review</option>
            <option value="NEEDS_CORRECTION">Needs correction</option>
            <option value="VERIFIED">Verified</option>
            <option value="REJECTED">Rejected</option>
            <option value="DISPUTED">Disputed</option>
            <option value="DRAFT">Drafts</option>
          </Select>
        </Field>
      </div>

      <div className="mt-4 space-y-4">
        {visible.length === 0 ? (
          <EmptyState
            title="Nothing in this view"
            description="Change the filter, or wait for the next submission from the field."
          />
        ) : (
          visible.map((item) => (
            <QueueCard
              key={`${item.entityType}-${item.entityId}`}
              item={item}
              onDone={(message, failure) => {
                setSuccess(message);
                setError(failure);
              }}
            />
          ))
        )}
      </div>

      <Card
        title="Decision history"
        description="Every decision keeps the previous status, the method used, and who made it."
        className="mt-6"
      >
        {state.verifications.length === 0 ? (
          <p className="mt-4 text-sm text-ink-600">No decisions recorded yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {state.verifications.map((verification) => (
              <li
                key={verification.id}
                className="border-b border-sand-100 pb-3 text-sm last:border-none last:pb-0"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium text-ink-900">
                    {EntityTypeLabels[verification.entityType]} {verification.entityId}
                  </span>
                  <Badge
                    tone={
                      verification.newStatus === "VERIFIED"
                        ? "green"
                        : verification.newStatus === "REJECTED"
                          ? "red"
                          : "amber"
                    }
                  >
                    {verification.previousStatus} → {verification.newStatus}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-ink-600">
                  {verification.method
                    ? VerificationMethodLabels[verification.method]
                    : "No method"}{" "}
                  · reviewed by {verification.reviewedBy ?? "—"} · submitted by{" "}
                  {verification.submittedBy}
                </p>
                {verification.notes && (
                  <p className="mt-1 text-xs text-ink-700">{verification.notes}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </PageShell>
  );
}

function QueueCard({
  item,
  onDone,
}: {
  item: QueueItem;
  onDone: (message?: string, error?: string) => void;
}) {
  const state = useCfaState();
  const access = useAccess();
  const [method, setMethod] = useState<VerificationMethod>("DOCUMENT_REVIEW");
  const [notes, setNotes] = useState("");
  const [open, setOpen] = useState(false);

  const evidence = state.evidence.filter(
    (item2) => item2.entityType === item.entityType && item2.entityId === item.entityId,
  );
  const prior = state.verifications.filter(
    (v) => v.entityType === item.entityType && v.entityId === item.entityId,
  );
  const ownSubmission = !canVerifyOwnSubmission(
    state.role,
    access.currentUser,
    item.submittedBy,
  );

  function decide(decision: DecisionInput["decision"]) {
    const input: DecisionInput = {
      decision,
      method,
      notes,
      reviewer: access.currentUser || "Unknown",
    };
    const result = decideOnRecord(item.entityType, item.entityId, input);
    onDone(
      result.ok
        ? `${EntityTypeLabels[item.entityType]} ${item.entityId} → ${decision.replace("_", " ").toLowerCase()}.`
        : undefined,
      result.error,
    );
    if (result.ok) {
      setNotes("");
      setOpen(false);
    }
  }

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink-900">{item.title}</p>
          <p className="mt-0.5 text-xs text-ink-600">
            {item.entityId} · {item.detail}
          </p>
          <p className="mt-0.5 text-xs text-ink-600">
            Submitted by {item.submittedBy}{" "}
            <time dateTime={item.submittedAt}>
              ({formatRelativeDate(item.submittedAt)})
            </time>
          </p>
        </div>
        <VerificationBadge status={item.status} />
      </div>

      {evidence.length > 0 && (
        <ul className="mt-3 space-y-1 text-xs text-ink-700">
          {evidence.map((item2) => (
            <li key={item2.id} className="flex flex-wrap items-center gap-2">
              <Badge tone="lake">{EvidenceKindLabels[item2.kind]}</Badge>
              <span>{item2.fileName}</span>
              <span className="text-ink-600">· {item2.contentHash}</span>
              <span className="text-ink-600">
                · {item2.latitude ? `${item2.latitude}, ${item2.longitude}` : "no GPS"}
              </span>
            </li>
          ))}
        </ul>
      )}

      {prior.length > 0 && (
        <p className="mt-3 text-xs text-ink-600">
          Previously:{" "}
          {prior
            .map(
              (v) =>
                `${v.previousStatus} → ${v.newStatus} (${v.reviewedBy ?? "pending"})`,
            )
            .join("; ")}
        </p>
      )}

      {ownSubmission ? (
        <p className="mt-4 rounded-md border border-gold-200 bg-gold-50 px-3 py-2 text-xs text-gold-700">
          You recorded this, so you cannot verify it. Ask another verifier.
        </p>
      ) : open ? (
        <div className="mt-4 space-y-3 border-t border-sand-200 pt-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Verification method" htmlFor={`m-${item.entityId}`}>
              <Select
                id={`m-${item.entityId}`}
                value={method}
                onChange={(event) =>
                  setMethod(event.target.value as VerificationMethod)
                }
              >
                {VerificationMethodOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Reviewer" htmlFor={`r-${item.entityId}`}>
              <TextInput id={`r-${item.entityId}`} value={access.currentUser} readOnly />
            </Field>
          </div>
          <Field
            label="Notes"
            htmlFor={`n-${item.entityId}`}
            hint="Required when rejecting or requesting a correction."
          >
            <TextArea
              id={`n-${item.entityId}`}
              rows={2}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            <SecondaryButton type="button" onClick={() => decide("APPROVED")}>
              Approve
            </SecondaryButton>
            <SecondaryButton type="button" onClick={() => decide("CORRECTIONS_REQUESTED")}>
              Request correction
            </SecondaryButton>
            <SecondaryButton type="button" onClick={() => decide("REJECTED")}>
              Reject
            </SecondaryButton>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-2 text-sm text-ink-600 hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 border-t border-sand-200 pt-4">
          <SecondaryButton type="button" onClick={() => setOpen(true)}>
            Review this record
          </SecondaryButton>
        </div>
      )}
    </Card>
  );
}
