"use client";

import { useState } from "react";
import { PageShell } from "@/components/cfa/page-shell";
import { SeedbedBadge } from "@/components/cfa/badges";
import {
  Card,
  EmptyState,
  ErrorNote,
  Field,
  PrimaryButton,
  Select,
  SuccessNote,
  TextArea,
  TextInput,
} from "@/components/cfa/fields";
import { DataTable, type Column } from "@/components/cfa/table";
import { useCfaState } from "@/lib/cfa/store";
import { useAccess } from "@/lib/cfa/permissions";
import { addSeedbed, setSeedbedStatus } from "@/lib/cfa/actions";
import { nurseryName, speciesName } from "@/lib/cfa/inventory";
import {
  PropagationMethodLabels,
  SeedbedStatusLabels,
  type Seedbed,
  type SeedbedStatus,
} from "@/lib/cfa/types";

const STATUSES = Object.entries(SeedbedStatusLabels) as [SeedbedStatus, string][];

export default function SeedbedsPage() {
  const state = useCfaState();
  const access = useAccess();
  const [showForm, setShowForm] = useState(false);
  const [nurseryFilter, setNurseryFilter] = useState("ALL");
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const canManage = access.can("MANAGE_SEEDBEDS");

  const rows = state.seedbeds.filter(
    (bed) => nurseryFilter === "ALL" || bed.nurseryId === nurseryFilter,
  );

  function stockOf(bed: Seedbed) {
    return state.transactions
      .filter((txn) => txn.seedbedId === bed.id)
      .reduce(
        (sum, txn) => sum + (txn.direction === "IN" ? txn.quantity : -txn.quantity),
        0,
      );
  }

  const columns: Column<Seedbed>[] = [
    {
      header: "Seedbed",
      render: (bed) => (
        <span className="font-medium text-ink-900">{bed.name}</span>
      ),
    },
    {
      header: "Nursery",
      render: (bed) => nurseryName(state, bed.nurseryId),
    },
    {
      header: "Method",
      hideOnMobile: true,
      render: (bed) => PropagationMethodLabels[bed.propagationMethod],
    },
    {
      header: "In bed",
      align: "right",
      render: (bed) => stockOf(bed).toLocaleString(),
    },
    {
      header: "Capacity",
      align: "right",
      hideOnMobile: true,
      render: (bed) => bed.capacity.toLocaleString(),
    },
    {
      header: "Manager",
      hideOnMobile: true,
      render: (bed) => bed.managerName,
    },
    {
      header: "Status",
      render: (bed) =>
        canManage ? (
          <Select
            aria-label={`Status for ${bed.name}`}
            value={bed.status}
            onChange={(event) => setSeedbedStatus(bed.id, event.target.value as SeedbedStatus)}
            className="w-40"
          >
            {STATUSES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        ) : (
          <SeedbedBadge status={bed.status} />
        ),
    },
  ];

  return (
    <PageShell
      eyebrow="Nursery structure"
      title="Seedbeds"
      description="A bed holds any number of species and batches. Its stock is always calculated from transactions, so a bed is never over- or under-filled by hand."
    >
      {error && <ErrorNote message={error} />}
      {success && <SuccessNote message={success} />}

      <div className="flex flex-wrap items-end gap-4">
        <div className="w-60">
          <Field label="Nursery" htmlFor="sb-filter">
            <Select
              id="sb-filter"
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
        {canManage && (
          <PrimaryButton type="button" onClick={() => setShowForm((prev) => !prev)}>
            {showForm ? "Close form" : "Add a seedbed"}
          </PrimaryButton>
        )}
      </div>

      {showForm && canManage && (
        <SeedbedForm
          onDone={(message, failure) => {
            setSuccess(message);
            setError(failure);
            if (!failure) setShowForm(false);
          }}
        />
      )}

      <Card title="All seedbeds" className="mt-6">
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(bed) => bed.id}
          empty={
            <EmptyState
              title="No seedbeds yet"
              description="Seedbeds are where propagation happens. Add one to start tracking stock by bed."
            />
          }
        />
      </Card>

      {rows.some((bed) => {
        const txns = state.transactions.filter((txn) => txn.seedbedId === bed.id);
        return txns.length > 0;
      }) && (
        <Card
          title="Species per bed"
          description="Which species and batches are currently held in each bed."
          className="mt-6"
        >
          <div className="mt-4 space-y-4">
            {rows.map((bed) => {
              const speciesInBed = new Set(
                state.transactions
                  .filter((txn) => txn.seedbedId === bed.id)
                  .map((txn) => txn.speciesId),
              );
              if (speciesInBed.size === 0) return null;
              return (
                <div key={bed.id}>
                  <p className="text-sm font-semibold text-ink-900">{bed.name}</p>
                  <p className="mt-1 text-xs text-ink-600">
                    {nurseryName(state, bed.nurseryId)} ·{" "}
                    {[...speciesInBed].map((id) => speciesName(state, id)).join(", ")}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </PageShell>
  );
}

function SeedbedForm({
  onDone,
}: {
  onDone: (message?: string, error?: string) => void;
}) {
  const state = useCfaState();
  const [form, setForm] = useState({
    nurseryId: state.nurseries[0]?.id ?? "",
    name: "",
    locationInNursery: "",
    establishedAt: new Date().toISOString().slice(0, 10),
    capacity: "",
    propagationMethod: "NURSERY_BED" as Seedbed["propagationMethod"],
    managerName: "",
    notes: "",
  });

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const result = addSeedbed({
      nurseryId: form.nurseryId,
      name: form.name,
      locationInNursery: form.locationInNursery,
      establishedAt: form.establishedAt,
      capacity: Number(form.capacity) || 0,
      propagationMethod: form.propagationMethod,
      managerName: form.managerName,
      ...(form.notes ? { notes: form.notes } : {}),
    });
    onDone(result.ok ? `Seedbed "${form.name}" created.` : undefined, result.error);
  }

  return (
    <Card title="New seedbed" className="mt-4">
      <form onSubmit={submit} className="mt-4 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nursery" htmlFor="sb-nursery">
            <Select
              id="sb-nursery"
              value={form.nurseryId}
              onChange={(event) => setForm((p) => ({ ...p, nurseryId: event.target.value }))}
              required
            >
              {state.nurseries.map((nursery) => (
                <option key={nursery.id} value={nursery.id}>
                  {nursery.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Seedbed name or number" htmlFor="sb-name">
            <TextInput
              id="sb-name"
              value={form.name}
              onChange={(event) => setForm((p) => ({ ...p, name: event.target.value }))}
              placeholder="e.g. Seedbed D"
              required
            />
          </Field>
          <Field label="Location within nursery" htmlFor="sb-location">
            <TextInput
              id="sb-location"
              value={form.locationInNursery}
              onChange={(event) => setForm((p) => ({ ...p, locationInNursery: event.target.value }))}
            />
          </Field>
          <Field label="Propagation method" htmlFor="sb-method">
            <Select
              id="sb-method"
              value={form.propagationMethod}
              onChange={(event) =>
                setForm((p) => ({
                  ...p,
                  propagationMethod: event.target.value as Seedbed["propagationMethod"],
                }))
              }
            >
              {Object.entries(PropagationMethodLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Capacity (seedlings)" htmlFor="sb-capacity">
            <TextInput
              id="sb-capacity"
              type="number"
              min={0}
              value={form.capacity}
              onChange={(event) => setForm((p) => ({ ...p, capacity: event.target.value }))}
            />
          </Field>
          <Field label="Assigned manager" htmlFor="sb-manager">
            <TextInput
              id="sb-manager"
              value={form.managerName}
              onChange={(event) => setForm((p) => ({ ...p, managerName: event.target.value }))}
            />
          </Field>
          <Field label="Established on" htmlFor="sb-date">
            <TextInput
              id="sb-date"
              type="date"
              value={form.establishedAt}
              onChange={(event) => setForm((p) => ({ ...p, establishedAt: event.target.value }))}
            />
          </Field>
        </div>
        <Field label="Notes" htmlFor="sb-notes">
          <TextArea
            id="sb-notes"
            rows={2}
            value={form.notes}
            onChange={(event) => setForm((p) => ({ ...p, notes: event.target.value }))}
          />
        </Field>
        <PrimaryButton type="submit">Create seedbed</PrimaryButton>
      </form>
    </Card>
  );
}
