"use client";

import { useState } from "react";
import { PageShell } from "@/components/cfa/page-shell";
import { Badge, ProgramBadge, StatCard } from "@/components/cfa/badges";
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
import { useCfaState } from "@/lib/cfa/store";
import { useAccess } from "@/lib/cfa/permissions";
import { addProgram, setProgramStatus } from "@/lib/cfa/actions";
import { downloadCsv } from "@/lib/cfa/export";
import { programsExport } from "@/lib/cfa/reports";
import { ProgramStatusLabels, type ProgramStatus } from "@/lib/cfa/types";

const STATUSES = Object.entries(ProgramStatusLabels) as [ProgramStatus, string][];

export default function ProgramsPage() {
  const state = useCfaState();
  const access = useAccess();
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [showForm, setShowForm] = useState(false);
  const canManage = access.can("MANAGE_PROGRAMS");

  const programs = state.programs;

  return (
    <PageShell
      eyebrow="Partnerships"
      title="Programs and initiatives"
      description="Programs tie planting events, stock movements, and partners to a shared goal, so a funder can see the seedlings their money produced."
    >
      {error && <ErrorNote message={error} />}
      {success && <SuccessNote message={success} />}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Programs" value={programs.length} />
        <StatCard
          label="Active"
          value={programs.filter((p) => p.status === "ACTIVE").length}
          tone="green"
        />
        <StatCard
          label="Planning"
          value={programs.filter((p) => p.status === "PLANNING").length}
        />
        <StatCard
          label="Plantings linked"
          value={state.plantingEvents.filter((p) => p.programId).length}
        />
      </div>

      {canManage && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <PrimaryButton type="button" onClick={() => setShowForm((prev) => !prev)}>
            {showForm ? "Close form" : "Add a program"}
          </PrimaryButton>
          {access.can("EXPORT_DATA") && (
            <SecondaryButton
              type="button"
              onClick={() => {
                const data = programsExport(state);
                downloadCsv(
                  `kai-cfa-programs-${new Date().toISOString().slice(0, 10)}.csv`,
                  data.columns,
                  data.rows,
                );
              }}
            >
              Export CSV
            </SecondaryButton>
          )}
        </div>
      )}

      {showForm && canManage && (
        <ProgramForm
          onDone={(message, failure) => {
            setSuccess(message);
            setError(failure);
            if (!failure) setShowForm(false);
          }}
        />
      )}

      {programs.length === 0 ? (
        <EmptyState
          title="No programs yet"
          description="Create a program to link planting events and partners to a shared goal."
        />
      ) : (
        <div className="mt-6 space-y-4">
          {programs.map((program) => {
            const plantings = state.plantingEvents.filter(
              (event) => event.programId === program.id,
            );
            const observations = state.survivalObservations.filter((obs) =>
              plantings.some((event) => event.id === obs.plantingEventId),
            );
            const stockIn = state.transactions.filter(
              (txn) => txn.programId === program.id,
            );
            const seedlings = plantings.reduce(
              (sum, event) => sum + event.quantityPlanted,
              0,
            );

            return (
              <Card
                key={program.id}
                title={program.name}
                description={`${program.organisation} · ${program.programType}`}
                action={
                  <div className="flex items-center gap-2">
                    <Badge tone={program.isPublic ? "green" : "sand"}>
                      {program.isPublic ? "Public" : "CFA only"}
                    </Badge>
                    <ProgramBadge status={program.status} />
                  </div>
                }
              >
                {program.description && (
                  <p className="mt-3 text-sm text-ink-700">{program.description}</p>
                )}

                <dl className="mt-4 grid grid-cols-2 gap-4 border-t border-sand-200 pt-4 sm:grid-cols-4">
                  <div>
                    <dt className="text-xs text-ink-600">Seedlings planted</dt>
                    <dd className="mt-1 text-sm font-semibold text-ink-900">
                      {seedlings.toLocaleString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink-600">Planting sites</dt>
                    <dd className="mt-1 text-sm font-semibold text-ink-900">
                      {plantings.length}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink-600">Survival observations</dt>
                    <dd className="mt-1 text-sm font-semibold text-ink-900">
                      {observations.length}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink-600">Ledger entries</dt>
                    <dd className="mt-1 text-sm font-semibold text-ink-900">
                      {stockIn.length}
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 space-y-1 border-t border-sand-200 pt-4 text-sm text-ink-700">
                  <div className="flex justify-between gap-4">
                    <span className="text-ink-600">Runs</span>
                    <span className="text-right text-ink-900">
                      {program.startDate} → {program.endDate ?? "ongoing"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-ink-600">Contact</span>
                    <span className="text-right text-ink-900">{program.contactName}</span>
                  </div>
                  {program.notes && (
                    <div className="flex justify-between gap-4">
                      <span className="text-ink-600">Notes</span>
                      <span className="text-right text-ink-900">{program.notes}</span>
                    </div>
                  )}
                </div>

                {canManage && (
                  <div className="mt-4 border-t border-sand-200 pt-4">
                    <Field label="Status" htmlFor={`prog-${program.id}`}>
                      <Select
                        id={`prog-${program.id}`}
                        value={program.status}
                        onChange={(event) =>
                          setProgramStatus(
                            program.id,
                            event.target.value as ProgramStatus,
                          )
                        }
                        className="w-48"
                      >
                        {STATUSES.map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </Select>
                    </Field>
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

function ProgramForm({
  onDone,
}: {
  onDone: (message?: string, error?: string) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    organisation: "",
    programType: "",
    description: "",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: "",
    contactName: "",
    isPublic: false,
    notes: "",
  });

  return (
    <Card title="New program" className="mt-4">
      <form
        className="mt-4 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          const result = addProgram({
            name: form.name,
            organisation: form.organisation,
            programType: form.programType,
            description: form.description,
            startDate: form.startDate,
            contactName: form.contactName,
            isPublic: form.isPublic,
            ...(form.endDate ? { endDate: form.endDate } : {}),
            ...(form.notes ? { notes: form.notes } : {}),
          });
          onDone(
            result.ok ? `Program "${form.name}" created.` : undefined,
            result.error,
          );
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Program name" htmlFor="prog-name">
            <TextInput
              id="prog-name"
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
              required
            />
          </Field>
          <Field label="Partner organisation" htmlFor="prog-org">
            <TextInput
              id="prog-org"
              value={form.organisation}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, organisation: event.target.value }))
              }
              required
            />
          </Field>
          <Field label="Program type" htmlFor="prog-type">
            <TextInput
              id="prog-type"
              value={form.programType}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, programType: event.target.value }))
              }
              placeholder="e.g. Agroforestry, restoration, livelihood"
              required
            />
          </Field>
          <Field label="Contact person" htmlFor="prog-contact">
            <TextInput
              id="prog-contact"
              value={form.contactName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, contactName: event.target.value }))
              }
            />
          </Field>
          <Field label="Start date" htmlFor="prog-start">
            <TextInput
              id="prog-start"
              type="date"
              value={form.startDate}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, startDate: event.target.value }))
              }
              required
            />
          </Field>
          <Field label="End date" htmlFor="prog-end" hint="Leave blank if ongoing.">
            <TextInput
              id="prog-end"
              type="date"
              value={form.endDate}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, endDate: event.target.value }))
              }
            />
          </Field>
        </div>
        <Field label="Description" htmlFor="prog-desc">
          <TextArea
            id="prog-desc"
            rows={2}
            value={form.description}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, description: event.target.value }))
            }
          />
        </Field>
        <Field label="Notes" htmlFor="prog-notes">
          <TextInput
            id="prog-notes"
            value={form.notes}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, notes: event.target.value }))
            }
          />
        </Field>
        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input
            type="checkbox"
            checked={form.isPublic}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, isPublic: event.target.checked }))
            }
            className="h-4 w-4 rounded border-sand-300 text-forest-600"
          />
          List this program on the public page
        </label>
        <PrimaryButton type="submit">Create program</PrimaryButton>
      </form>
    </Card>
  );
}
