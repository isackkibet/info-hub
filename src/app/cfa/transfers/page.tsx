"use client";

import { useState } from "react";
import { PageShell } from "@/components/cfa/page-shell";
import { StatCard } from "@/components/cfa/badges";
import {
  Card,
  EmptyState,
  ErrorNote,
  Field,
  PrimaryButton,
  Select,
  SuccessNote,
  TextInput,
} from "@/components/cfa/fields";
import { DataTable, type Column } from "@/components/cfa/table";
import { useCfaState } from "@/lib/cfa/store";
import { useAccess } from "@/lib/cfa/permissions";
import { addTransfer } from "@/lib/cfa/actions";
import {
  availableQuantity,
  nurseryName,
  sortByDateDesc,
  speciesName,
} from "@/lib/cfa/inventory";
import type { Transfer } from "@/lib/cfa/types";

export default function TransfersPage() {
  const state = useCfaState();
  const access = useAccess();
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const canRecord = access.can("RECORD_MOVEMENT");

  const transfers = sortByDateDesc(state.transfers);

  const columns: Column<Transfer>[] = [
    { header: "Date", render: (item) => item.date },
    {
      header: "From",
      render: (item) => (
        <div>
          <span className="font-medium text-ink-900">
            {nurseryName(state, item.sourceNurseryId)}
          </span>
          <p className="text-xs text-ink-600">{item.senderName}</p>
        </div>
      ),
    },
    {
      header: "To",
      render: (item) => (
        <div>
          <span className="font-medium text-ink-900">
            {nurseryName(state, item.destinationNurseryId)}
          </span>
          <p className="text-xs text-ink-600">
            {item.destinationProject ?? item.receiverName}
          </p>
        </div>
      ),
    },
    {
      header: "Species",
      hideOnMobile: true,
      render: (item) => speciesName(state, item.speciesId),
    },
    {
      header: "Qty",
      align: "right",
      render: (item) => item.quantity.toLocaleString(),
    },
    { header: "Reason", render: (item) => item.reason },
  ];

  return (
    <PageShell
      eyebrow="Movement"
      title="Transfers"
      description="A transfer always has a source and a destination. Recording one creates a paired outgoing and incoming transaction, so both nurseries stay correct."
    >
      {error && <ErrorNote message={error} />}
      {success && <SuccessNote message={success} />}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Transfers" value={transfers.length} />
        <StatCard
          label="Seedlings moved"
          value={transfers.reduce((sum, item) => sum + item.quantity, 0).toLocaleString()}
        />
        <StatCard
          label="Between nurseries"
          value={transfers.filter((item) => item.sourceNurseryId !== item.destinationNurseryId)
            .length}
        />
        <StatCard
          label="To projects"
          value={transfers.filter((item) => item.destinationProject).length}
        />
      </div>

      {canRecord ? (
        <TransferForm
          onDone={(message, failure) => {
            setSuccess(message);
            setError(failure);
          }}
        />
      ) : (
        <Card title="Record a transfer" className="mt-6">
          <p className="mt-4 text-sm text-ink-600">
            Your role ({access.roleLabel}) cannot record transfers.
          </p>
        </Card>
      )}

      <Card title="Transfer history" className="mt-6">
        <DataTable
          columns={columns}
          rows={transfers}
          rowKey={(item) => item.id}
          empty={
            <EmptyState
              title="No transfers recorded"
              description="Record a transfer above to move stock between beds, nurseries, or projects."
            />
          }
        />
      </Card>
    </PageShell>
  );
}

function TransferForm({
  onDone,
}: {
  onDone: (message?: string, error?: string) => void;
}) {
  const state = useCfaState();
  const [form, setForm] = useState({
    sourceNurseryId: state.nurseries[0]?.id ?? "",
    sourceSeedbedId: "",
    destinationNurseryId: state.nurseries[1]?.id ?? state.nurseries[0]?.id ?? "",
    destinationSeedbedId: "",
    destinationProject: "",
    speciesId: state.species[0]?.id ?? "",
    seedBatchId: "",
    quantity: "",
    date: new Date().toISOString().slice(0, 10),
    reason: "",
    senderName: "",
    receiverName: "",
  });

  const available = availableQuantity(state, form.sourceNurseryId, form.speciesId);
  const sourceBeds = state.seedbeds.filter(
    (bed) => bed.nurseryId === form.sourceNurseryId,
  );
  const destinationBeds = state.seedbeds.filter(
    (bed) => bed.nurseryId === form.destinationNurseryId,
  );

  return (
    <Card title="Record a transfer" className="mt-6">
      <form
        className="mt-4 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          const result = addTransfer({
            sourceNurseryId: form.sourceNurseryId,
            destinationNurseryId: form.destinationNurseryId,
            speciesId: form.speciesId,
            quantity: Number(form.quantity),
            date: form.date,
            reason: form.reason,
            senderName: form.senderName,
            receiverName: form.receiverName,
            ...(form.sourceSeedbedId ? { sourceSeedbedId: form.sourceSeedbedId } : {}),
            ...(form.destinationSeedbedId
              ? { destinationSeedbedId: form.destinationSeedbedId }
              : {}),
            ...(form.destinationProject
              ? { destinationProject: form.destinationProject }
              : {}),
            ...(form.seedBatchId ? { seedBatchId: form.seedBatchId } : {}),
          });
          onDone(
            result.ok
              ? `Transfer recorded: ${Number(form.quantity).toLocaleString()} seedlings moved.`
              : undefined,
            result.error,
          );
          if (result.ok) {
            setForm((prev) => ({ ...prev, quantity: "", reason: "" }));
          }
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="From nursery" htmlFor="t-src-nursery">
            <Select
              id="t-src-nursery"
              value={form.sourceNurseryId}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  sourceNurseryId: event.target.value,
                  sourceSeedbedId: "",
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
          <Field label="From seedbed" htmlFor="t-src-bed">
            <Select
              id="t-src-bed"
              value={form.sourceSeedbedId}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, sourceSeedbedId: event.target.value }))
              }
            >
              <option value="">Nursery-wide</option>
              {sourceBeds.map((bed) => (
                <option key={bed.id} value={bed.id}>
                  {bed.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="To nursery" htmlFor="t-dst-nursery">
            <Select
              id="t-dst-nursery"
              value={form.destinationNurseryId}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  destinationNurseryId: event.target.value,
                  destinationSeedbedId: "",
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
          <Field label="To seedbed" htmlFor="t-dst-bed">
            <Select
              id="t-dst-bed"
              value={form.destinationSeedbedId}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, destinationSeedbedId: event.target.value }))
              }
            >
              <option value="">Nursery-wide</option>
              {destinationBeds.map((bed) => (
                <option key={bed.id} value={bed.id}>
                  {bed.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="To project or group"
            htmlFor="t-project"
            hint="Required when moving out of the nursery to a planting group."
          >
            <TextInput
              id="t-project"
              value={form.destinationProject}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, destinationProject: event.target.value }))
              }
            />
          </Field>
          <Field
            label="Species"
            htmlFor="t-species"
            hint={`In stock at source: ${available.toLocaleString()}`}
          >
            <Select
              id="t-species"
              value={form.speciesId}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, speciesId: event.target.value }))
              }
              required
            >
              {state.species.map((species) => (
                <option key={species.id} value={species.id}>
                  {species.commonName}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Quantity" htmlFor="t-qty">
            <TextInput
              id="t-qty"
              type="number"
              min={1}
              value={form.quantity}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, quantity: event.target.value }))
              }
              required
            />
          </Field>
          <Field label="Date" htmlFor="t-date">
            <TextInput
              id="t-date"
              type="date"
              value={form.date}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, date: event.target.value }))
              }
              required
            />
          </Field>
          <Field label="Reason" htmlFor="t-reason">
            <TextInput
              id="t-reason"
              value={form.reason}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, reason: event.target.value }))
              }
              required
            />
          </Field>
          <Field label="Sender" htmlFor="t-sender">
            <TextInput
              id="t-sender"
              value={form.senderName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, senderName: event.target.value }))
              }
              required
            />
          </Field>
          <Field label="Receiver" htmlFor="t-receiver">
            <TextInput
              id="t-receiver"
              value={form.receiverName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, receiverName: event.target.value }))
              }
              required
            />
          </Field>
        </div>
        <PrimaryButton type="submit">Record transfer</PrimaryButton>
      </form>
    </Card>
  );
}
