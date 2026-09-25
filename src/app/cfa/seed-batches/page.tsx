"use client";

import { useState } from "react";
import { PageShell } from "@/components/cfa/page-shell";
import { BatchBadge } from "@/components/cfa/badges";
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
import { addBatch, setBatchStatus } from "@/lib/cfa/actions";
import { nurseryName, speciesName } from "@/lib/cfa/inventory";
import {
  BatchStatusLabels,
  type BatchStatus,
  type SeedBatch,
} from "@/lib/cfa/types";

const STATUSES = Object.entries(BatchStatusLabels) as [BatchStatus, string][];

export default function SeedBatchesPage() {
  const state = useCfaState();
  const access = useAccess();
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const canManage = access.can("MANAGE_BATCHES");

  const columns: Column<SeedBatch>[] = [
    {
      header: "Batch",
      render: (batch) => (
        <span className="font-mono text-xs text-ink-900">{batch.id}</span>
      ),
    },
    { header: "Species", render: (batch) => speciesName(state, batch.speciesId) },
    {
      header: "Nursery",
      hideOnMobile: true,
      render: (batch) => nurseryName(state, batch.nurseryId),
    },
    {
      header: "Source",
      hideOnMobile: true,
      render: (batch) => batch.seedSource,
    },
    {
      header: "Acquired",
      align: "right",
      render: (batch) => batch.quantityAcquired.toLocaleString(),
    },
    {
      header: "Storage",
      hideOnMobile: true,
      render: (batch) => batch.storageLocation,
    },
    {
      header: "Status",
      render: (batch) =>
        canManage ? (
          <Select
            aria-label={`Status for ${batch.id}`}
            value={batch.status}
            onChange={(event) => setBatchStatus(batch.id, event.target.value as BatchStatus)}
            className="w-40"
          >
            {STATUSES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        ) : (
          <BatchBadge status={batch.status} />
        ),
    },
  ];

  return (
    <PageShell
      eyebrow="Traceability"
      title="Seed batches"
      description="A batch links seed source to the seedlings that come out of it, so any tree in the field can be traced back to where its seed was collected."
    >
      {error && <ErrorNote message={error} />}
      {success && <SuccessNote message={success} />}

      {canManage && (
        <div className="mb-4">
          <PrimaryButton type="button" onClick={() => setShowForm((prev) => !prev)}>
            {showForm ? "Close form" : "Record a seed batch"}
          </PrimaryButton>
        </div>
      )}

      {showForm && canManage && (
        <BatchForm
          onDone={(message, failure) => {
            setSuccess(message);
            setError(failure);
            if (!failure) setShowForm(false);
          }}
        />
      )}

      <Card title="Seed batches" className="mt-4">
        <DataTable
          columns={columns}
          rows={state.batches}
          rowKey={(batch) => batch.id}
          empty={
            <EmptyState
              title="No seed batches recorded"
              description="Record a batch as soon as seed arrives so production can be traced to its source."
            />
          }
        />
      </Card>
    </PageShell>
  );
}

function BatchForm({
  onDone,
}: {
  onDone: (message?: string, error?: string) => void;
}) {
  const state = useCfaState();
  const [form, setForm] = useState({
    nurseryId: state.nurseries[0]?.id ?? "",
    speciesId: state.species[0]?.id ?? "",
    seedSource: "",
    collectionLocation: "",
    collectionDate: new Date().toISOString().slice(0, 10),
    acquiredAt: new Date().toISOString().slice(0, 10),
    quantityAcquired: "",
    treatmentMethod: "",
    storageLocation: "",
    responsibleUser: "",
    notes: "",
  });

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const result = addBatch({
      nurseryId: form.nurseryId,
      speciesId: form.speciesId,
      seedSource: form.seedSource,
      collectionLocation: form.collectionLocation,
      collectionDate: form.collectionDate,
      acquiredAt: form.acquiredAt,
      quantityAcquired: Number(form.quantityAcquired) || 0,
      treatmentMethod: form.treatmentMethod,
      storageLocation: form.storageLocation,
      responsibleUser: form.responsibleUser,
      ...(form.notes ? { notes: form.notes } : {}),
    });
    onDone(result.ok ? "Seed batch recorded." : undefined, result.error);
  }

  return (
    <Card title="New seed batch" className="mt-4">
      <form onSubmit={submit} className="mt-4 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nursery" htmlFor="b-nursery">
            <Select
              id="b-nursery"
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
          <Field label="Species" htmlFor="b-species">
            <Select
              id="b-species"
              value={form.speciesId}
              onChange={(event) => setForm((p) => ({ ...p, speciesId: event.target.value }))}
              required
            >
              {state.species.map((species) => (
                <option key={species.id} value={species.id}>
                  {species.commonName}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Seed source" htmlFor="b-source">
            <TextInput
              id="b-source"
              value={form.seedSource}
              onChange={(event) => setForm((p) => ({ ...p, seedSource: event.target.value }))}
              placeholder="e.g. Collected from mother trees"
              required
            />
          </Field>
          <Field label="Collection location" htmlFor="b-location">
            <TextInput
              id="b-location"
              value={form.collectionLocation}
              onChange={(event) => setForm((p) => ({ ...p, collectionLocation: event.target.value }))}
            />
          </Field>
          <Field label="Collection date" htmlFor="b-collected">
            <TextInput
              id="b-collected"
              type="date"
              value={form.collectionDate}
              onChange={(event) => setForm((p) => ({ ...p, collectionDate: event.target.value }))}
            />
          </Field>
          <Field label="Date acquired" htmlFor="b-acquired">
            <TextInput
              id="b-acquired"
              type="date"
              value={form.acquiredAt}
              onChange={(event) => setForm((p) => ({ ...p, acquiredAt: event.target.value }))}
            />
          </Field>
          <Field label="Quantity acquired" htmlFor="b-qty">
            <TextInput
              id="b-qty"
              type="number"
              min={1}
              value={form.quantityAcquired}
              onChange={(event) => setForm((p) => ({ ...p, quantityAcquired: event.target.value }))}
              required
            />
          </Field>
          <Field label="Treatment method" htmlFor="b-treatment">
            <TextInput
              id="b-treatment"
              value={form.treatmentMethod}
              onChange={(event) => setForm((p) => ({ ...p, treatmentMethod: event.target.value }))}
            />
          </Field>
          <Field label="Storage location" htmlFor="b-storage">
            <TextInput
              id="b-storage"
              value={form.storageLocation}
              onChange={(event) => setForm((p) => ({ ...p, storageLocation: event.target.value }))}
            />
          </Field>
          <Field label="Responsible user" htmlFor="b-user">
            <TextInput
              id="b-user"
              value={form.responsibleUser}
              onChange={(event) => setForm((p) => ({ ...p, responsibleUser: event.target.value }))}
            />
          </Field>
        </div>
        <Field label="Notes" htmlFor="b-notes">
          <TextArea
            id="b-notes"
            rows={2}
            value={form.notes}
            onChange={(event) => setForm((p) => ({ ...p, notes: event.target.value }))}
          />
        </Field>
        <PrimaryButton type="submit">Record batch</PrimaryButton>
      </form>
    </Card>
  );
}
