"use client";

import { useState } from "react";
import { PageShell } from "@/components/cfa/page-shell";
import { NurseryBadge } from "@/components/cfa/badges";
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
import { useCfaState } from "@/lib/cfa/store";
import { useAccess } from "@/lib/cfa/permissions";
import { addNursery, setNurseryStatus } from "@/lib/cfa/actions";
import {
  aggregateStock,
  inventorySummary,
  speciesName,
  survivalStats,
} from "@/lib/cfa/inventory";
import {
  NurseryStatusLabels,
  NurseryTypeLabels,
  type Nursery,
  type NurseryStatus,
} from "@/lib/cfa/types";

const STATUSES = Object.entries(NurseryStatusLabels) as [NurseryStatus, string][];

export default function NurseriesPage() {
  const state = useCfaState();
  const access = useAccess();
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const canManage = access.can("MANAGE_NURSERIES");

  return (
    <PageShell
      eyebrow="CFA structure"
      title="Nurseries"
      description="Every nursery belongs to exactly one CFA. A CFA can run several, and each one can be assigned its own manager."
    >
      {error && <ErrorNote message={error} />}
      {success && <SuccessNote message={success} />}

      {canManage && (
        <div className="mb-4">
          <PrimaryButton type="button" onClick={() => setShowForm((prev) => !prev)}>
            {showForm ? "Close form" : "Add a nursery"}
          </PrimaryButton>
        </div>
      )}

      {showForm && canManage && (
        <NurseryForm
          onDone={(message, failure) => {
            setSuccess(message);
            setError(failure);
            if (!failure) setShowForm(false);
          }}
        />
      )}

      {state.nurseries.length === 0 ? (
        <EmptyState
          title="No nurseries yet"
          description="A CFA must register at least one nursery before seedlings can be tracked."
        />
      ) : (
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          {state.nurseries.map((nursery) => (
            <NurseryCard
              key={nursery.id}
              nursery={nursery}
              canManage={canManage}
              onStatus={(status) => setNurseryStatus(nursery.id, status)}
            />
          ))}
        </div>
      )}
    </PageShell>
  );
}

function NurseryCard({
  nursery,
  canManage,
  onStatus,
}: {
  nursery: Nursery;
  canManage: boolean;
  onStatus: (status: NurseryStatus) => void;
}) {
  const state = useCfaState();
  const stock = aggregateStock(state).filter(
    (row) => row.nurseryId === nursery.id,
  );
  const summary = inventorySummary({ ...state, nurseries: [nursery] });
  const beds = state.seedbeds.filter((bed) => bed.nurseryId === nursery.id);
  const pending = state.activities.filter(
    (activity) => activity.nurseryId === nursery.id && activity.status === "SUBMITTED",
  ).length;
  const corrections = state.activities.filter(
    (activity) => activity.nurseryId === nursery.id && activity.status === "NEEDS_CORRECTION",
  ).length;

  return (
    <Card
      title={nursery.name}
      description={`${nursery.community}, ${nursery.ward} · ${NurseryTypeLabels[nursery.nurseryType]}`}
      action={<NurseryBadge status={nursery.status} />}
    >
      <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-sand-200 pt-4 sm:grid-cols-4">
        <Metric label="Current stock" value={summary.currentStock.toLocaleString()} />
        <Metric label="Species" value={summary.speciesCount} />
        <Metric
          label="Active beds"
          value={beds.filter((bed) => bed.status === "ACTIVE").length}
        />
        <Metric
          label="Survival"
          value={`${survivalStats(state).latestRate}%`}
        />
        <Metric label="Propagated" value={summary.propagated.toLocaleString()} />
        <Metric label="Planted" value={summary.planted.toLocaleString()} />
        <Metric label="Sold" value={summary.sold.toLocaleString()} />
        <Metric label="Donated" value={summary.donated.toLocaleString()} />
        <Metric label="Transferred" value={summary.transferred.toLocaleString()} />
        <Metric label="Mortality" value={summary.mortality.toLocaleString()} />
        <Metric label="Pending" value={pending} />
        <Metric label="Needs correction" value={corrections} />
      </dl>

      <dl className="mt-4 space-y-1 border-t border-sand-200 pt-4 text-sm text-ink-700">
        <Row label="Manager" value={nursery.managerName} />
        <Row label="Contact" value={nursery.contactPhone} />
        <Row label="Water source" value={nursery.waterSource} />
        <Row label="Capacity" value={`${nursery.capacity.toLocaleString()} seedlings`} />
        <Row
          label="Location"
          value={
            nursery.latitude && nursery.longitude
              ? `${nursery.latitude}, ${nursery.longitude}`
              : nursery.location
          }
        />
        {nursery.notes && <Row label="Notes" value={nursery.notes} />}
      </dl>

      {stock.length > 0 && (
        <div className="mt-4 border-t border-sand-200 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-600">
            Stock by species
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {stock.map((row) => (
              <li key={row.key} className="flex justify-between">
                <span className="text-ink-700">{speciesName(state, row.speciesId)}</span>
                <span className="font-semibold text-ink-900">
                  {row.quantity.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {beds.length > 0 && (
        <div className="mt-4 border-t border-sand-200 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-600">
            Seedbeds
          </p>
          <ul className="mt-2 space-y-1 text-sm">
            {beds.map((bed) => (
              <li key={bed.id} className="flex justify-between">
                <span className="text-ink-700">
                  {bed.name} · {bed.propagationMethod.replace(/_/g, " ").toLowerCase()}
                </span>
                <span className="text-xs text-ink-600">{bed.status}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {canManage && (
        <div className="mt-4 border-t border-sand-200 pt-4">
          <Field label="Operating status" htmlFor={`status-${nursery.id}`}>
            <Select
              id={`status-${nursery.id}`}
              value={nursery.status}
              onChange={(event) => onStatus(event.target.value as NurseryStatus)}
            >
              {STATUSES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <p className="mt-2 text-xs text-ink-600">
            A nursery with recorded history is archived, never deleted.
          </p>
        </div>
      )}
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-xs text-ink-600">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-ink-900">{value}</dd>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-600">{label}</dt>
      <dd className="text-right text-ink-900">{value}</dd>
    </div>
  );
}

function NurseryForm({
  onDone,
}: {
  onDone: (message?: string, error?: string) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    county: "",
    subCounty: "",
    ward: "",
    community: "",
    location: "",
    latitude: "",
    longitude: "",
    managerName: "",
    contactPhone: "",
    establishedAt: new Date().toISOString().slice(0, 10),
    nurseryType: "PROPAGATION" as Nursery["nurseryType"],
    waterSource: "",
    capacity: "",
    notes: "",
  });

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const result = addNursery({
      name: form.name,
      county: form.county,
      subCounty: form.subCounty,
      ward: form.ward,
      community: form.community,
      location: form.location,
      managerName: form.managerName,
      contactPhone: form.contactPhone,
      establishedAt: form.establishedAt,
      nurseryType: form.nurseryType,
      waterSource: form.waterSource,
      capacity: Number(form.capacity) || 0,
      ...(form.latitude ? { latitude: Number(form.latitude) } : {}),
      ...(form.longitude ? { longitude: Number(form.longitude) } : {}),
      ...(form.notes ? { notes: form.notes } : {}),
    });
    onDone(
      result.ok ? `Nursery "${form.name}" created.` : undefined,
      result.error,
    );
  }

  return (
    <Card title="New nursery" className="mt-4">
      <form onSubmit={submit} className="mt-4 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nursery name" htmlFor="nur-name">
            <TextInput
              id="nur-name"
              value={form.name}
              onChange={(event) => setForm((p) => ({ ...p, name: event.target.value }))}
              required
            />
          </Field>
          <Field label="Nursery type" htmlFor="nur-type">
            <Select
              id="nur-type"
              value={form.nurseryType}
              onChange={(event) =>
                setForm((p) => ({
                  ...p,
                  nurseryType: event.target.value as Nursery["nurseryType"],
                }))
              }
            >
              {Object.entries(NurseryTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="County" htmlFor="nur-county">
            <TextInput
              id="nur-county"
              value={form.county}
              onChange={(event) => setForm((p) => ({ ...p, county: event.target.value }))}
            />
          </Field>
          <Field label="Sub-county" htmlFor="nur-subcounty">
            <TextInput
              id="nur-subcounty"
              value={form.subCounty}
              onChange={(event) => setForm((p) => ({ ...p, subCounty: event.target.value }))}
            />
          </Field>
          <Field label="Ward" htmlFor="nur-ward">
            <TextInput
              id="nur-ward"
              value={form.ward}
              onChange={(event) => setForm((p) => ({ ...p, ward: event.target.value }))}
            />
          </Field>
          <Field label="Community" htmlFor="nur-community">
            <TextInput
              id="nur-community"
              value={form.community}
              onChange={(event) => setForm((p) => ({ ...p, community: event.target.value }))}
            />
          </Field>
          <Field label="Physical location" htmlFor="nur-location">
            <TextInput
              id="nur-location"
              value={form.location}
              onChange={(event) => setForm((p) => ({ ...p, location: event.target.value }))}
            />
          </Field>
          <Field label="Manager" htmlFor="nur-manager">
            <TextInput
              id="nur-manager"
              value={form.managerName}
              onChange={(event) => setForm((p) => ({ ...p, managerName: event.target.value }))}
              required
            />
          </Field>
          <Field label="Contact phone" htmlFor="nur-phone">
            <TextInput
              id="nur-phone"
              value={form.contactPhone}
              onChange={(event) => setForm((p) => ({ ...p, contactPhone: event.target.value }))}
            />
          </Field>
          <Field label="Water source" htmlFor="nur-water">
            <TextInput
              id="nur-water"
              value={form.waterSource}
              onChange={(event) => setForm((p) => ({ ...p, waterSource: event.target.value }))}
            />
          </Field>
          <Field label="Approximate capacity" htmlFor="nur-capacity">
            <TextInput
              id="nur-capacity"
              type="number"
              min={0}
              value={form.capacity}
              onChange={(event) => setForm((p) => ({ ...p, capacity: event.target.value }))}
            />
          </Field>
          <Field label="Latitude" htmlFor="nur-lat">
            <TextInput
              id="nur-lat"
              type="number"
              step="any"
              value={form.latitude}
              onChange={(event) => setForm((p) => ({ ...p, latitude: event.target.value }))}
            />
          </Field>
          <Field label="Longitude" htmlFor="nur-lng">
            <TextInput
              id="nur-lng"
              type="number"
              step="any"
              value={form.longitude}
              onChange={(event) => setForm((p) => ({ ...p, longitude: event.target.value }))}
            />
          </Field>
        </div>
        <Field label="Notes" htmlFor="nur-notes">
          <TextArea
            id="nur-notes"
            rows={2}
            value={form.notes}
            onChange={(event) => setForm((p) => ({ ...p, notes: event.target.value }))}
          />
        </Field>
        <PrimaryButton type="submit">Create nursery</PrimaryButton>
      </form>
    </Card>
  );
}
