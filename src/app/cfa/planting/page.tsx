"use client";

import { useState } from "react";
import { PageShell } from "@/components/cfa/page-shell";
import { PlantingBadge, StatCard } from "@/components/cfa/badges";
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
import { addPlantingEvent, setPlantingStatus } from "@/lib/cfa/actions";
import {
  availableQuantity,
  nurseryName,
  sortByDateDesc,
  speciesName,
  survivalStats,
} from "@/lib/cfa/inventory";
import {
  PlantingStatusLabels,
  type PlantingEvent,
  type PlantingStatus,
} from "@/lib/cfa/types";

const STATUSES = Object.entries(PlantingStatusLabels) as [PlantingStatus, string][];

export default function PlantingPage() {
  const state = useCfaState();
  const access = useAccess();
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const canRecord = access.can("RECORD_PLANTING");

  const events = sortByDateDesc(state.plantingEvents);
  const survival = survivalStats(state);

  const columns: Column<PlantingEvent>[] = [
    { header: "Date", render: (event) => event.date },
    {
      header: "Site",
      render: (event) => (
        <div>
          <span className="font-medium text-ink-900">{event.siteName}</span>
          <p className="text-xs text-ink-600">
            {speciesName(state, event.speciesId)} ·{" "}
            {nurseryName(state, event.nurseryId)}
          </p>
        </div>
      ),
    },
    {
      header: "Planted",
      align: "right",
      render: (event) => event.quantityPlanted.toLocaleString(),
    },
    {
      header: "Surviving",
      align: "right",
      hideOnMobile: true,
      render: (event) => {
        const observations = state.survivalObservations
          .filter((obs) => obs.plantingEventId === event.id)
          .sort((a, b) => a.date.localeCompare(b.date));
        const latest = observations[observations.length - 1];
        if (!latest) return <span className="text-xs text-ink-600">Not observed</span>;
        return (
          <span className="text-ink-900">
            {latest.surviving.toLocaleString()}{" "}
            <span className="text-xs text-ink-600">
              ({Math.round((latest.surviving / latest.assessed) * 100)}%)
            </span>
          </span>
        );
      },
    },
    {
      header: "Group",
      hideOnMobile: true,
      render: (event) => event.responsibleGroup,
    },
    {
      header: "GPS",
      hideOnMobile: true,
      render: (event) =>
        event.latitude && event.longitude ? (
          <span className="text-xs text-ink-700">
            {event.latitude}, {event.longitude}
          </span>
        ) : (
          <span className="text-xs text-ink-600">—</span>
        ),
    },
    {
      header: "Status",
      render: (event) =>
        canRecord ? (
          <Select
            aria-label={`Status for ${event.id}`}
            value={event.status}
            onChange={(changeEvent) =>
              setPlantingStatus(event.id, changeEvent.target.value as PlantingStatus)
            }
            className="w-40"
          >
            {STATUSES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        ) : (
          <PlantingBadge status={event.status} />
        ),
    },
  ];

  return (
    <PageShell
      eyebrow="Conservation impact"
      title="Planting events"
      description="Planting is its own conservation event, linked back to nursery inventory. Recording one removes the seedlings from stock and opens a survival record."
    >
      {error && <ErrorNote message={error} />}
      {success && <SuccessNote message={success} />}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Planting events"
          value={events.length}
        />
        <StatCard
          label="Seedlings planted"
          value={survival.totalPlanted.toLocaleString()}
          tone="green"
        />
        <StatCard
          label="Surviving"
          value={survival.totalSurviving.toLocaleString()}
        />
        <StatCard
          label="Survival rate"
          value={`${survival.overallRate}%`}
          tone={survival.overallRate >= 80 ? "green" : "amber"}
        />
      </div>

      {canRecord ? (
        <PlantingForm
          onDone={(message, failure) => {
            setSuccess(message);
            setError(failure);
          }}
        />
      ) : (
        <Card title="Record a planting event" className="mt-6">
          <p className="mt-4 text-sm text-ink-600">
            Your role ({access.roleLabel}) cannot record planting events.
          </p>
        </Card>
      )}

      <Card title="Planting history" className="mt-6">
        <DataTable
          columns={columns}
          rows={events}
          rowKey={(event) => event.id}
          empty={
            <EmptyState
              title="No planting events yet"
              description="Record where seedlings went into the ground, with GPS where possible."
            />
          }
        />
      </Card>
    </PageShell>
  );
}

function PlantingForm({
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
    quantityPlanted: "",
    date: new Date().toISOString().slice(0, 10),
    siteName: "",
    latitude: "",
    longitude: "",
    siteDescription: "",
    responsibleGroup: "",
    programId: "",
    landowner: "",
  });

  const available = availableQuantity(state, form.nurseryId, form.speciesId);
  const batches = state.batches.filter(
    (batch) => batch.nurseryId === form.nurseryId && batch.speciesId === form.speciesId,
  );

  return (
    <Card title="Record a planting event" className="mt-6">
      <form
        className="mt-4 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          const result = addPlantingEvent(
            {
              nurseryId: form.nurseryId,
              speciesId: form.speciesId,
              quantityPlanted: Number(form.quantityPlanted),
              date: form.date,
              siteName: form.siteName,
              siteDescription: form.siteDescription,
              responsibleGroup: form.responsibleGroup,
              landowner: form.landowner,
              recordedBy: access.currentUser || "Unknown",
              ...(form.latitude ? { latitude: Number(form.latitude) } : {}),
              ...(form.longitude ? { longitude: Number(form.longitude) } : {}),
              ...(form.seedBatchId ? { seedBatchId: form.seedBatchId } : {}),
              ...(form.programId ? { programId: form.programId } : {}),
            },
            access.currentUser || "Unknown",
          );
          onDone(
            result.ok ? `Planting recorded at ${form.siteName}.` : undefined,
            result.error,
          );
          if (result.ok) {
            setForm((prev) => ({
              ...prev,
              quantityPlanted: "",
              siteName: "",
              siteDescription: "",
            }));
          }
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nursery supplying" htmlFor="p-nursery">
            <Select
              id="p-nursery"
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
            htmlFor="p-species"
            hint={`In stock here: ${available.toLocaleString()}`}
          >
            <Select
              id="p-species"
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
          <Field label="Seed batch" htmlFor="p-batch">
            <Select
              id="p-batch"
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
          <Field label="Quantity planted" htmlFor="p-qty">
            <TextInput
              id="p-qty"
              type="number"
              min={1}
              value={form.quantityPlanted}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, quantityPlanted: event.target.value }))
              }
              required
            />
          </Field>
          <Field label="Planting site" htmlFor="p-site">
            <TextInput
              id="p-site"
              value={form.siteName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, siteName: event.target.value }))
              }
              placeholder="e.g. Chepterit boundary"
              required
            />
          </Field>
          <Field label="Date" htmlFor="p-date">
            <TextInput
              id="p-date"
              type="date"
              value={form.date}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, date: event.target.value }))
              }
              required
            />
          </Field>
          <Field label="Latitude" htmlFor="p-lat">
            <TextInput
              id="p-lat"
              type="number"
              step="any"
              value={form.latitude}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, latitude: event.target.value }))
              }
            />
          </Field>
          <Field label="Longitude" htmlFor="p-lng">
            <TextInput
              id="p-lng"
              type="number"
              step="any"
              value={form.longitude}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, longitude: event.target.value }))
              }
            />
          </Field>
          <Field label="Responsible group" htmlFor="p-group">
            <TextInput
              id="p-group"
              value={form.responsibleGroup}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, responsibleGroup: event.target.value }))
              }
            />
          </Field>
          <Field label="Landowner or site authority" htmlFor="p-landowner">
            <TextInput
              id="p-landowner"
              value={form.landowner}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, landowner: event.target.value }))
              }
            />
          </Field>
          <Field label="Program" htmlFor="p-program">
            <Select
              id="p-program"
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
        <Field label="Site description and conditions" htmlFor="p-desc">
          <TextArea
            id="p-desc"
            rows={2}
            value={form.siteDescription}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, siteDescription: event.target.value }))
            }
          />
        </Field>
        <PrimaryButton type="submit">Record planting</PrimaryButton>
      </form>
    </Card>
  );
}
