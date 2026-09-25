"use client";

import { useMemo, useState } from "react";
import { PageShell } from "@/components/cfa/page-shell";
import { Badge, VerificationBadge } from "@/components/cfa/badges";
import {
  Card,
  EmptyState,
  ErrorNote,
  Field,
  PrimaryButton,
  SecondaryButton,
  Select,
  SuccessNote,
  TextArea,
  TextInput,
} from "@/components/cfa/fields";
import { DataTable, type Column } from "@/components/cfa/table";
import { useCfaState } from "@/lib/cfa/store";
import { useAccess } from "@/lib/cfa/permissions";
import {
  addActivity,
  addEvidence,
  discardDraft,
  submitActivity,
  updateActivity,
} from "@/lib/cfa/actions";
import {
  nurseryName,
  seedbedName,
  sortByDateDesc,
  speciesName,
} from "@/lib/cfa/inventory";
import {
  ActivityTypeLabels,
  EvidenceKindLabels,
  VerificationStatusLabels,
  type Activity,
  type ActivityType,
  type EvidenceKind,
  type VerificationStatus,
} from "@/lib/cfa/types";

/**
 * Movement types are recorded on their own pages so that buyer, recipient,
 * destination, and payment data are never lost. They still appear in the log
 * because each one creates a linked activity and inventory transaction.
 */
const LOG_ONLY_TYPES: ActivityType[] = [
  "SEED_COLLECTION",
  "SOWING",
  "GERMINATION",
  "PRICKING_OUT",
  "POTTING",
  "WATERING",
  "WEEDING",
  "PEST_MANAGEMENT",
  "FERTILIZATION",
  "HARDENING",
  "SEEDLING_MOVEMENT",
  "OTHER",
];

const STOCK_TYPES: ActivityType[] = ["PROPAGATION", "MORTALITY"];

const TYPE_OPTIONS: ActivityType[] = [...STOCK_TYPES, ...LOG_ONLY_TYPES];

const MOVEMENT_PAGES: { type: ActivityType; page: string; label: string }[] = [
  { type: "SALE", page: "/cfa/sales", label: "Sales" },
  { type: "DONATION", page: "/cfa/donations", label: "Donations" },
  { type: "TRANSFER", page: "/cfa/transfers", label: "Transfers" },
  { type: "PLANTING", page: "/cfa/planting", label: "Planting events" },
];

export default function ActivitiesPage() {
  const state = useCfaState();
  const access = useAccess();
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [nurseryFilter, setNurseryFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const canRecord = access.can("RECORD_ACTIVITY");

  const rows = useMemo(
    () =>
      sortByDateDesc(state.activities).filter(
        (activity) =>
          (statusFilter === "ALL" || activity.status === statusFilter) &&
          (nurseryFilter === "ALL" || activity.nurseryId === nurseryFilter) &&
          (typeFilter === "ALL" || activity.activityType === typeFilter),
      ),
    [state.activities, statusFilter, nurseryFilter, typeFilter],
  );

  const drafts = state.activities.filter((a) => a.status === "DRAFT").length;

  const columns: Column<Activity>[] = [
    {
      header: "Date",
      render: (activity) => <span className="whitespace-nowrap">{activity.date}</span>,
    },
    {
      header: "Activity",
      render: (activity) => (
        <div>
          <span className="font-medium text-ink-900">
            {ActivityTypeLabels[activity.activityType]}
          </span>
          <span className="ml-2 text-xs text-ink-600">
            {activity.quantity.toLocaleString()} seedlings
          </span>
          {activity.notes && (
            <p className="mt-0.5 max-w-xs text-xs text-ink-600">{activity.notes}</p>
          )}
        </div>
      ),
    },
    {
      header: "Nursery",
      render: (activity) => nurseryName(state, activity.nurseryId),
    },
    {
      header: "Species / bed",
      hideOnMobile: true,
      render: (activity) => (
        <div className="text-xs text-ink-700">
          <p>{activity.speciesId ? speciesName(state, activity.speciesId) : "—"}</p>
          <p className="text-ink-600">
            {activity.seedbedId ? seedbedName(state, activity.seedbedId) : "Nursery-wide"}
          </p>
        </div>
      ),
    },
    {
      header: "Recorded by",
      hideOnMobile: true,
      render: (activity) => activity.recordedBy,
    },
    {
      header: "Evidence",
      align: "right",
      hideOnMobile: true,
      render: (activity) =>
        state.evidence.filter((item) => item.entityId === activity.id).length,
    },
    {
      header: "Status",
      render: (activity) => <VerificationBadge status={activity.status} />,
    },
    ...(canRecord
      ? [
          {
            header: "",
            render: (activity: Activity) => (
              <div className="flex flex-wrap justify-end gap-2 text-xs">
                {activity.status === "DRAFT" && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const result = submitActivity(activity.id);
                        setError(result.error);
                        setSuccess(
                          result.ok ? "Draft submitted for verification." : undefined,
                        );
                      }}
                      className="font-medium text-forest-700 hover:underline"
                    >
                      Submit
                    </button>
                    <button
                      type="button"
                      onClick={() => discardDraft(activity.id)}
                      className="font-medium text-red-600 hover:underline"
                    >
                      Discard
                    </button>
                  </>
                )}
                {(activity.status === "DRAFT" ||
                  activity.status === "NEEDS_CORRECTION") && (
                  <EditActivityButton activity={activity} />
                )}
              </div>
            ),
          } satisfies Column<Activity>,
        ]
      : []),
  ];

  return (
    <PageShell
      eyebrow="Field log"
      title="Activity log"
      description="One clear action for the field: what happened, where, which species or batch, how many, when. Propagation and mortality also post to the inventory ledger automatically."
    >
      {error && <ErrorNote message={error} />}
      {success && <SuccessNote message={success} />}

      {canRecord ? (
        <ActivityForm
          onDone={(message, failure) => {
            setSuccess(message);
            setError(failure);
          }}
        />
      ) : (
        <Card title="Record activity">
          <p className="mt-4 text-sm text-ink-600">
            Your role ({access.roleLabel}) can read the log but not add entries.
            Switch to a nursery member, manager, or administrator role to record
            activity.
          </p>
        </Card>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div>
          <Field label="Status" htmlFor="a-status">
            <Select
              id="a-status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="ALL">All statuses</option>
              {(Object.keys(VerificationStatusLabels) as VerificationStatus[]).map(
                (status) => (
                  <option key={status} value={status}>
                    {VerificationStatusLabels[status]}
                  </option>
                ),
              )}
            </Select>
          </Field>
        </div>
        <div>
          <Field label="Nursery" htmlFor="a-nursery">
            <Select
              id="a-nursery"
              value={nurseryFilter}
              onChange={(event) => setNurseryFilter(event.target.value)}
            >
              <option value="ALL">All nurseries</option>
              {state.nurseries.map((nursery) => (
                <option key={nursery.id} value={nursery.id}>
                  {nursery.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div>
          <Field label="Activity type" htmlFor="a-type">
            <Select
              id="a-type"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              <option value="ALL">All types</option>
              {TYPE_OPTIONS.map((type) => (
                <option key={type} value={type}>
                  {ActivityTypeLabels[type]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </div>

      <Card
        title={`Activity log${drafts > 0 ? ` · ${drafts} draft${drafts === 1 ? "" : "s"}` : ""}`}
        description="A submitted activity is locked to its author until a verifier returns it."
        className="mt-4"
      >
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(activity) => activity.id}
          empty={
            <EmptyState
              title="Nothing matches this filter"
              description="Change the filters, or record the first activity above."
            />
          }
        />
      </Card>

      <Card
        title="Attach evidence"
        description="Photos, receipts, GPS points, and attendance sheets. Evidence metadata is stored with the record; the file itself needs a backend to upload to."
        className="mt-6"
      >
        <EvidenceForm
          onDone={(message, failure) => {
            setSuccess(message);
            setError(failure);
          }}
        />
      </Card>
    </PageShell>
  );
}

function ActivityForm({
  onDone,
}: {
  onDone: (message?: string, error?: string) => void;
}) {
  const state = useCfaState();
  const access = useAccess();
  const [form, setForm] = useState({
    activityType: "PROPAGATION" as ActivityType,
    nurseryId: state.nurseries[0]?.id ?? "",
    speciesId: "",
    seedbedId: "",
    seedBatchId: "",
    quantity: "",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
    latitude: "",
    longitude: "",
    programId: "",
  });
  const [fieldError, setFieldError] = useState<string>();

  const needsSpecies = STOCK_TYPES.includes(form.activityType);
  const seedbeds = state.seedbeds.filter((bed) => bed.nurseryId === form.nurseryId);
  const batches = state.batches.filter(
    (batch) => batch.nurseryId === form.nurseryId,
  );

  function submit(asDraft: boolean) {
    if (!form.nurseryId) {
      setFieldError("Select the nursery where this happened.");
      return;
    }
    if (needsSpecies && !form.speciesId) {
      setFieldError(
        `${ActivityTypeLabels[form.activityType]} needs a species so stock can be updated.`,
      );
      return;
    }
    const quantity = Number(form.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      setFieldError("Quantity must be a whole number of at least 1.");
      return;
    }
    setFieldError(undefined);

    const result = addActivity(
      {
        activityType: form.activityType,
        nurseryId: form.nurseryId,
        speciesId: needsSpecies ? form.speciesId : form.speciesId || undefined,
        seedbedId: form.seedbedId || undefined,
        seedBatchId: form.seedBatchId || undefined,
        quantity,
        date: form.date,
        notes: form.notes || undefined,
        latitude: form.latitude ? Number(form.latitude) : undefined,
        longitude: form.longitude ? Number(form.longitude) : undefined,
        programId: form.programId || undefined,
        asDraft,
      },
      access.currentUser || "Unknown",
    );

    onDone(
      result.ok
        ? asDraft
          ? "Draft saved. Submit it when you are ready."
          : "Activity recorded and submitted for verification."
        : undefined,
      result.error,
    );

    if (result.ok && !asDraft) {
      setForm((prev) => ({ ...prev, quantity: "", notes: "" }));
    }
  }

  return (
    <Card
      title="Record an activity"
      description="What happened, where, which species or batch, how many, when, and any evidence you want to attach afterwards."
    >
      <div className="mt-4 space-y-4">
        <Field error={fieldError}>
          <span className="text-sm font-medium text-ink-800">What happened?</span>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TYPE_OPTIONS.map((type) => (
              <label
                key={type}
                className="flex cursor-pointer items-center gap-2 rounded-md border border-sand-200 px-3 py-2 text-sm text-ink-700 has-[:checked]:border-forest-600 has-[:checked]:bg-forest-50 has-[:checked]:text-forest-700"
              >
                <input
                  type="radio"
                  name="activityType"
                  value={type}
                  checked={form.activityType === type}
                  onChange={() =>
                    setForm((prev) => ({ ...prev, activityType: type }))
                  }
                  className="h-3.5 w-3.5 accent-forest-600"
                />
                {ActivityTypeLabels[type]}
              </label>
            ))}
          </div>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Where did it happen?" htmlFor="af-nursery">
            <Select
              id="af-nursery"
              value={form.nurseryId}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  nurseryId: event.target.value,
                  seedbedId: "",
                  seedBatchId: "",
                }))
              }
              required
            >
              {state.nurseries.map((nursery) => (
                <option key={nursery.id} value={nursery.id}>
                  {nursery.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="Which species or batch?"
            htmlFor="af-species"
            hint={needsSpecies ? "Required — this activity changes stock." : undefined}
          >
            <Select
              id="af-species"
              value={form.speciesId}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, speciesId: event.target.value }))
              }
              required={needsSpecies}
            >
              <option value="">{needsSpecies ? "Select a species" : "Not species-specific"}</option>
              {state.species.map((species) => (
                <option key={species.id} value={species.id}>
                  {species.commonName}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Seedbed" htmlFor="af-seedbed">
            <Select
              id="af-seedbed"
              value={form.seedbedId}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, seedbedId: event.target.value }))
              }
            >
              <option value="">Nursery-wide</option>
              {seedbeds.map((bed) => (
                <option key={bed.id} value={bed.id}>
                  {bed.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Seed batch" htmlFor="af-batch">
            <Select
              id="af-batch"
              value={form.seedBatchId}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, seedBatchId: event.target.value }))
              }
            >
              <option value="">Not batch-specific</option>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.id} · {speciesName(state, batch.speciesId)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="How many?" htmlFor="af-qty">
            <TextInput
              id="af-qty"
              type="number"
              min={1}
              step={1}
              value={form.quantity}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, quantity: event.target.value }))
              }
              required
            />
          </Field>
          <Field label="When?" htmlFor="af-date">
            <TextInput
              id="af-date"
              type="date"
              value={form.date}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, date: event.target.value }))
              }
              required
            />
          </Field>
          <Field label="Latitude (optional)" htmlFor="af-lat">
            <TextInput
              id="af-lat"
              type="number"
              step="any"
              value={form.latitude}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, latitude: event.target.value }))
              }
            />
          </Field>
          <Field label="Longitude (optional)" htmlFor="af-lng">
            <TextInput
              id="af-lng"
              type="number"
              step="any"
              value={form.longitude}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, longitude: event.target.value }))
              }
            />
          </Field>
          <Field label="Program (optional)" htmlFor="af-program" className="sm:col-span-2">
            <Select
              id="af-program"
              value={form.programId}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, programId: event.target.value }))
              }
            >
              <option value="">Not linked to a program</option>
              {state.programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name} · {program.organisation}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Notes" htmlFor="af-notes">
          <TextArea
            id="af-notes"
            rows={2}
            value={form.notes}
            onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
            placeholder="Anything a verifier would need to check this"
          />
        </Field>

        <div className="flex flex-wrap items-center gap-3">
          <PrimaryButton type="button" onClick={() => submit(false)}>
            Save and submit
          </PrimaryButton>
          <SecondaryButton type="button" onClick={() => submit(true)}>
            Save as draft
          </SecondaryButton>
          {STOCK_TYPES.includes(form.activityType) && (
            <Badge tone="lake">Posts to the inventory ledger</Badge>
          )}
        </div>

        <div className="border-t border-sand-200 pt-4">
          <p className="text-sm font-medium text-ink-800">
            Moving seedlings out of a nursery
          </p>
          <p className="mt-1 text-xs text-ink-600">
            Sales, donations, transfers, and planting each need extra details,
            so they get their own pages. Each one still creates an activity and
            an inventory transaction automatically.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {MOVEMENT_PAGES.map((item) => (
              <a
                key={item.type}
                href={item.page}
                className="rounded-md border border-sand-200 px-3 py-1.5 text-xs text-ink-700 transition-colors hover:border-forest-200 hover:text-forest-700"
              >
                {ActivityTypeLabels[item.type]} →
              </a>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

function EditActivityButton({ activity }: { activity: Activity }) {
  const access = useAccess();
  const [editing, setEditing] = useState(false);
  const [quantity, setQuantity] = useState(String(activity.quantity));
  const [notes, setNotes] = useState(activity.notes ?? "");

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="font-medium text-forest-700 hover:underline"
      >
        Edit
      </button>
    );
  }

  return (
    <form
      className="flex items-center gap-1"
      onSubmit={(event) => {
        event.preventDefault();
        const result = updateActivity(
          activity.id,
          { quantity: Number(quantity), notes: notes || undefined },
          access.currentUser || "Unknown",
        );
        if (result.ok) setEditing(false);
      }}
    >
      <input
        aria-label="Quantity"
        type="number"
        min={1}
        value={quantity}
        onChange={(event) => setQuantity(event.target.value)}
        className="w-16 rounded border border-sand-200 px-1 py-0.5 text-xs"
      />
      <input
        aria-label="Notes"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Notes"
        className="w-32 rounded border border-sand-200 px-1 py-0.5 text-xs"
      />
      <button type="submit" className="font-medium text-forest-700 hover:underline">
        Save
      </button>
      <button
        type="button"
        onClick={() => setEditing(false)}
        className="text-ink-600 hover:underline"
      >
        Cancel
      </button>
    </form>
  );
}

function EvidenceForm({
  onDone,
}: {
  onDone: (message?: string, error?: string) => void;
}) {
  const state = useCfaState();
  const access = useAccess();
  const [form, setForm] = useState({
    entityId: state.activities[0]?.id ?? "",
    kind: "PHOTO" as EvidenceKind,
    fileName: "",
    fileType: "image/jpeg",
    reference: "",
    captureDate: new Date().toISOString().slice(0, 10),
    visibility: "CFA_ONLY" as const,
    consentStatus: "GRANTED" as const,
  });

  const options = [
    ...state.activities.map((a) => ({
      id: a.id,
      label: `${a.id} · ${ActivityTypeLabels[a.activityType]} · ${a.date}`,
    })),
    ...state.sales.map((s) => ({ id: s.id, label: `${s.id} · Sale to ${s.buyerName}` })),
    ...state.donations.map((d) => ({
      id: d.id,
      label: `${d.id} · Donation to ${d.recipientName}`,
    })),
    ...state.transfers.map((t) => ({ id: t.id, label: `${t.id} · Transfer` })),
    ...state.plantingEvents.map((p) => ({
      id: p.id,
      label: `${p.id} · Planting at ${p.siteName}`,
    })),
  ];

  function entityTypeFor(id: string) {
    if (state.activities.some((a) => a.id === id)) return "ACTIVITY" as const;
    if (state.sales.some((s) => s.id === id)) return "SALE" as const;
    if (state.donations.some((d) => d.id === id)) return "DONATION" as const;
    if (state.transfers.some((t) => t.id === id)) return "TRANSFER" as const;
    return "PLANTING_EVENT" as const;
  }

  return (
    <form
      className="mt-4 space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const result = addEvidence(entityTypeFor(form.entityId), form.entityId, {
          kind: form.kind,
          fileName: form.fileName,
          fileType: form.fileType,
          reference: form.reference,
          captureDate: form.captureDate,
          uploadedBy: access.currentUser || "Unknown",
          visibility: form.visibility,
          consentStatus: form.consentStatus,
        });
        onDone(
          result.ok ? `Evidence attached to ${form.entityId}.` : undefined,
          result.error,
        );
        if (result.ok) setForm((prev) => ({ ...prev, fileName: "", reference: "" }));
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Attach to record" htmlFor="ev-record">
          <Select
            id="ev-record"
            value={form.entityId}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, entityId: event.target.value }))
            }
            required
          >
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Evidence type" htmlFor="ev-kind">
          <Select
            id="ev-kind"
            value={form.kind}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, kind: event.target.value as EvidenceKind }))
            }
          >
            {Object.entries(EvidenceKindLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="File name" htmlFor="ev-file">
          <TextInput
            id="ev-file"
            value={form.fileName}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, fileName: event.target.value }))
            }
            placeholder="e.g. seedbed-b.jpg"
            required
          />
        </Field>
        <Field
          label="File reference"
          htmlFor="ev-ref"
          hint="Where the file lives once uploads are connected to a backend."
        >
          <TextInput
            id="ev-ref"
            value={form.reference}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, reference: event.target.value }))
            }
            placeholder="camera://2026/seedbed-b.jpg"
          />
        </Field>
        <Field label="Capture date" htmlFor="ev-date">
          <TextInput
            id="ev-date"
            type="date"
            value={form.captureDate}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, captureDate: event.target.value }))
            }
          />
        </Field>
        <Field label="Visibility" htmlFor="ev-visibility">
          <Select
            id="ev-visibility"
            value={form.visibility}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                visibility: event.target.value as typeof form.visibility,
              }))
            }
          >
            <option value="PUBLIC">Public</option>
            <option value="CFA_ONLY">CFA only</option>
            <option value="VERIFIER_ONLY">Verifier only</option>
            <option value="PRIVATE">Private</option>
          </Select>
        </Field>
      </div>
      <PrimaryButton type="submit">Attach evidence</PrimaryButton>
    </form>
  );
}
