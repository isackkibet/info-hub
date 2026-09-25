"use client";

import { useState } from "react";
import { PageShell } from "@/components/cfa/page-shell";
import { Badge } from "@/components/cfa/badges";
import {
  Card,
  EmptyState,
  ErrorNote,
  Field,
  PrimaryButton,
  SecondaryButton,
  Select,
  SuccessNote,
  TextInput,
} from "@/components/cfa/fields";
import { useCfaState } from "@/lib/cfa/store";
import { useAccess } from "@/lib/cfa/permissions";
import {
  addSpecies,
  addSpeciesLocalName,
  setSpeciesActive,
} from "@/lib/cfa/actions";
import { aggregateStock, nurseryName } from "@/lib/cfa/inventory";
import {
  SpeciesCategoryLabels,
  SpeciesUseLabels,
  type Species,
  type SpeciesCategory,
  type SpeciesUse,
} from "@/lib/cfa/types";

export default function SpeciesPage() {
  const state = useCfaState();
  const access = useAccess();
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const canManage = access.can("MANAGE_SPECIES");
  const stock = aggregateStock(state);

  return (
    <PageShell
      eyebrow="Catalogue"
      title="Species catalogue"
      description="A shared catalogue is what stops the same tree being entered under four different names. Local names are added as aliases, never as new species."
    >
      {error && <ErrorNote message={error} />}
      {success && <SuccessNote message={success} />}

      {canManage && (
        <div className="mb-4">
          <PrimaryButton type="button" onClick={() => setShowForm((prev) => !prev)}>
            {showForm ? "Close form" : "Add a species"}
          </PrimaryButton>
        </div>
      )}

      {showForm && canManage && (
        <SpeciesForm
          onDone={(message, failure) => {
            setSuccess(message);
            setError(failure);
            if (!failure) setShowForm(false);
          }}
        />
      )}

      {state.species.length === 0 ? (
        <EmptyState
          title="The catalogue is empty"
          description="Add the species this CFA works with. Scientific names must be unique so reports never double-count."
        />
      ) : (
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          {state.species.map((species) => {
            const held = stock.filter((row) => row.speciesId === species.id);
            const total = held.reduce((sum, row) => sum + row.quantity, 0);
            return (
              <Card
                key={species.id}
                title={species.commonName}
                description={species.scientificName}
                action={
                  <Badge tone={species.isActive ? "green" : "sand"}>
                    {species.isActive ? "Active" : "Archived"}
                  </Badge>
                }
              >
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge tone="lake">
                    {SpeciesCategoryLabels[species.category]}
                  </Badge>
                  <Badge>{SpeciesUseLabels[species.use]}</Badge>
                  {species.localNames.map((name) => (
                    <Badge key={name}>{name}</Badge>
                  ))}
                </div>

                {species.growthNotes && (
                  <p className="mt-3 text-sm text-ink-700">{species.growthNotes}</p>
                )}

                <dl className="mt-4 space-y-1 border-t border-sand-200 pt-4 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-ink-600">In stock</dt>
                    <dd className="font-semibold text-ink-900">
                      {total.toLocaleString()}
                    </dd>
                  </div>
                  {held.slice(0, 3).map((row) => (
                    <div key={row.key} className="flex justify-between text-xs">
                      <dt className="text-ink-600">
                        {nurseryName(state, row.nurseryId)}
                      </dt>
                      <dd className="text-ink-900">{row.quantity.toLocaleString()}</dd>
                    </div>
                  ))}
                </dl>

                {canManage && (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-sand-200 pt-4">
                    <LocalNameAdder species={species} />
                    <SecondaryButton
                      type="button"
                      onClick={() => setSpeciesActive(species.id, !species.isActive)}
                    >
                      {species.isActive ? "Archive species" : "Reactivate"}
                    </SecondaryButton>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}

function LocalNameAdder({ species }: { species: Species }) {
  const [name, setName] = useState("");

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!name.trim()) return;
        addSpeciesLocalName(species.id, name);
        setName("");
      }}
      className="flex items-end gap-2"
    >
      <div className="w-40">
        <Field label="Add local name" htmlFor={`alias-${species.id}`}>
          <TextInput
            id={`alias-${species.id}`}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Mukima"
          />
        </Field>
      </div>
      <SecondaryButton type="submit">Add</SecondaryButton>
    </form>
  );
}

function SpeciesForm({
  onDone,
}: {
  onDone: (message?: string, error?: string) => void;
}) {
  const [form, setForm] = useState({
    commonName: "",
    scientificName: "",
    localNames: "",
    category: "INDIGENOUS" as SpeciesCategory,
    use: "RESTORATION" as SpeciesUse,
    growthNotes: "",
  });

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const result = addSpecies({
      commonName: form.commonName,
      scientificName: form.scientificName,
      localNames: form.localNames
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean),
      category: form.category,
      use: form.use,
      ...(form.growthNotes ? { growthNotes: form.growthNotes } : {}),
    });
    onDone(
      result.ok ? `${form.commonName} added to the catalogue.` : undefined,
      result.error,
    );
  }

  return (
    <Card title="New species" className="mt-4">
      <form onSubmit={submit} className="mt-4 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Common name" htmlFor="sp-common">
            <TextInput
              id="sp-common"
              value={form.commonName}
              onChange={(event) => setForm((p) => ({ ...p, commonName: event.target.value }))}
              required
            />
          </Field>
          <Field
            label="Scientific name"
            htmlFor="sp-scientific"
            hint="Must be unique across the catalogue."
          >
            <TextInput
              id="sp-scientific"
              value={form.scientificName}
              onChange={(event) =>
                setForm((p) => ({ ...p, scientificName: event.target.value }))
              }
              required
            />
          </Field>
          <Field label="Category" htmlFor="sp-category">
            <Select
              id="sp-category"
              value={form.category}
              onChange={(event) =>
                setForm((p) => ({
                  ...p,
                  category: event.target.value as SpeciesCategory,
                }))
              }
            >
              {Object.entries(SpeciesCategoryLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Primary use" htmlFor="sp-use">
            <Select
              id="sp-use"
              value={form.use}
              onChange={(event) =>
                setForm((p) => ({ ...p, use: event.target.value as SpeciesUse }))
              }
            >
              {Object.entries(SpeciesUseLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field
          label="Local names"
          htmlFor="sp-locals"
          hint="Comma separated. These become searchable aliases on the same species."
        >
          <TextInput
            id="sp-locals"
            value={form.localNames}
            onChange={(event) => setForm((p) => ({ ...p, localNames: event.target.value }))}
          />
        </Field>
        <Field label="Growth notes" htmlFor="sp-notes">
          <TextInput
            id="sp-notes"
            value={form.growthNotes}
            onChange={(event) => setForm((p) => ({ ...p, growthNotes: event.target.value }))}
          />
        </Field>
        <PrimaryButton type="submit">Add to catalogue</PrimaryButton>
      </form>
    </Card>
  );
}
