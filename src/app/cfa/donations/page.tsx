"use client";

import { useState } from "react";
import { PageShell } from "@/components/cfa/page-shell";
import { StatCard, VerificationBadge } from "@/components/cfa/badges";
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
import { addDonation } from "@/lib/cfa/actions";
import {
  availableQuantity,
  nurseryName,
  sortByDateDesc,
  speciesName,
} from "@/lib/cfa/inventory";
import type { Donation } from "@/lib/cfa/types";

export default function DonationsPage() {
  const state = useCfaState();
  const access = useAccess();
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const canRecord = access.can("RECORD_MOVEMENT");

  const donations = sortByDateDesc(state.donations);
  const recipients = new Set(donations.map((item) => item.recipientName)).size;

  const columns: Column<Donation>[] = [
    { header: "Date", render: (item) => item.date },
    {
      header: "Recipient",
      render: (item) => (
        <div>
          <span className="font-medium text-ink-900">{item.recipientName}</span>
          {item.recipientContact && (
            <p className="text-xs text-ink-600">{item.recipientContact}</p>
          )}
        </div>
      ),
    },
    {
      header: "Species",
      hideOnMobile: true,
      render: (item) => speciesName(state, item.speciesId),
    },
    {
      header: "Nursery",
      hideOnMobile: true,
      render: (item) => nurseryName(state, item.nurseryId),
    },
    {
      header: "Qty",
      align: "right",
      render: (item) => item.quantity.toLocaleString(),
    },
    { header: "Purpose", render: (item) => item.purpose },
    {
      header: "Planting location",
      hideOnMobile: true,
      render: (item) => item.plantingLocation,
    },
    {
      header: "Status",
      render: (item) => {
        const activityId = state.transactions.find(
          (txn) => txn.relatedEntityId === item.id,
        )?.relatedActivityId;
        const activity = state.activities.find((a) => a.id === activityId);
        return activity ? (
          <VerificationBadge status={activity.status} />
        ) : (
          <span className="text-xs text-ink-600">—</span>
        );
      },
    },
  ];

  return (
    <PageShell
      eyebrow="Movement"
      title="Donations"
      description="A donation always names a recipient. Recording one posts an outgoing transaction and creates an activity for verification."
    >
      {error && <ErrorNote message={error} />}
      {success && <SuccessNote message={success} />}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Donations" value={donations.length} />
        <StatCard
          label="Seedlings donated"
          value={donations.reduce((sum, item) => sum + item.quantity, 0).toLocaleString()}
          tone="green"
        />
        <StatCard label="Recipients" value={recipients} />
        <StatCard
          label="Program-linked"
          value={donations.filter((item) => item.programId).length}
        />
      </div>

      {canRecord ? (
        <DonationForm
          onDone={(message, failure) => {
            setSuccess(message);
            setError(failure);
          }}
        />
      ) : (
        <Card title="Record a donation" className="mt-6">
          <p className="mt-4 text-sm text-ink-600">
            Your role ({access.roleLabel}) cannot record donations.
          </p>
        </Card>
      )}

      <Card title="Donation history" className="mt-6">
        <DataTable
          columns={columns}
          rows={donations}
          rowKey={(item) => item.id}
          empty={
            <EmptyState
              title="No donations recorded"
              description="Record a donation above with the recipient and the planting location."
            />
          }
        />
      </Card>
    </PageShell>
  );
}

function DonationForm({
  onDone,
}: {
  onDone: (message?: string, error?: string) => void;
}) {
  const state = useCfaState();
  const access = useAccess();
  const [form, setForm] = useState({
    nurseryId: state.nurseries[0]?.id ?? "",
    speciesId: state.species[0]?.id ?? "",
    seedBatchId: "",
    quantity: "",
    date: new Date().toISOString().slice(0, 10),
    recipientName: "",
    recipientContact: "",
    purpose: "",
    plantingLocation: "",
    programId: "",
    notes: "",
  });

  const available = availableQuantity(state, form.nurseryId, form.speciesId);
  const batches = state.batches.filter(
    (batch) => batch.nurseryId === form.nurseryId && batch.speciesId === form.speciesId,
  );

  return (
    <Card title="Record a donation" className="mt-6">
      <form
        className="mt-4 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          const result = addDonation(
            {
              nurseryId: form.nurseryId,
              speciesId: form.speciesId,
              quantity: Number(form.quantity),
              date: form.date,
              recipientName: form.recipientName,
              recipientContact: form.recipientContact || undefined,
              purpose: form.purpose,
              plantingLocation: form.plantingLocation,
              recordedBy: access.currentUser || "Unknown",
              ...(form.seedBatchId ? { seedBatchId: form.seedBatchId } : {}),
              ...(form.programId ? { programId: form.programId } : {}),
              ...(form.notes ? { notes: form.notes } : {}),
            },
            access.currentUser || "Unknown",
          );
          onDone(
            result.ok
              ? `Donation recorded for ${form.recipientName}.`
              : undefined,
            result.error,
          );
          if (result.ok) {
            setForm((prev) => ({
              ...prev,
              quantity: "",
              recipientName: "",
              recipientContact: "",
            }));
          }
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nursery" htmlFor="d-nursery">
            <Select
              id="d-nursery"
              value={form.nurseryId}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  nurseryId: event.target.value,
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
            label="Species"
            htmlFor="d-species"
            hint={`In stock here: ${available.toLocaleString()}`}
          >
            <Select
              id="d-species"
              value={form.speciesId}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  speciesId: event.target.value,
                  seedBatchId: "",
                }))
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
          <Field label="Seed batch" htmlFor="d-batch">
            <Select
              id="d-batch"
              value={form.seedBatchId}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, seedBatchId: event.target.value }))
              }
            >
              <option value="">Not batch-specific</option>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.id}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Quantity" htmlFor="d-qty">
            <TextInput
              id="d-qty"
              type="number"
              min={1}
              value={form.quantity}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, quantity: event.target.value }))
              }
              required
            />
          </Field>
          <Field label="Recipient" htmlFor="d-recipient" hint="A donation must name who receives it.">
            <TextInput
              id="d-recipient"
              value={form.recipientName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, recipientName: event.target.value }))
              }
              required
            />
          </Field>
          <Field label="Recipient contact" htmlFor="d-contact">
            <TextInput
              id="d-contact"
              value={form.recipientContact}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, recipientContact: event.target.value }))
              }
            />
          </Field>
          <Field label="Date" htmlFor="d-date">
            <TextInput
              id="d-date"
              type="date"
              value={form.date}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, date: event.target.value }))
              }
              required
            />
          </Field>
          <Field label="Purpose" htmlFor="d-purpose">
            <TextInput
              id="d-purpose"
              value={form.purpose}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, purpose: event.target.value }))
              }
            />
          </Field>
          <Field label="Planting location" htmlFor="d-location">
            <TextInput
              id="d-location"
              value={form.plantingLocation}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, plantingLocation: event.target.value }))
              }
            />
          </Field>
          <Field label="Program" htmlFor="d-program">
            <Select
              id="d-program"
              value={form.programId}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, programId: event.target.value }))
              }
            >
              <option value="">Not linked to a program</option>
              {state.programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label="Notes" htmlFor="d-notes">
          <TextArea
            id="d-notes"
            rows={2}
            value={form.notes}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, notes: event.target.value }))
            }
          />
        </Field>
        <PrimaryButton type="submit">Record donation</PrimaryButton>
      </form>
    </Card>
  );
}
