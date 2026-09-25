"use client";

import { useState } from "react";
import { PageShell } from "@/components/cfa/page-shell";
import { StatCard } from "@/components/cfa/badges";
import { BarRow } from "@/components/cfa/table";
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
import { addSurvivalObservation } from "@/lib/cfa/actions";
import {
  sortByDateDesc,
  speciesName,
  survivalStats,
  survivalTrend,
} from "@/lib/cfa/inventory";
import { downloadCsv } from "@/lib/cfa/export";
import { survivalTrendExport } from "@/lib/cfa/reports";

export default function SurvivalPage() {
  const state = useCfaState();
  const access = useAccess();
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [eventFilter, setEventFilter] = useState("ALL");

  const stats = survivalStats(state);
  const trend = survivalTrend(state);
  const observations = sortByDateDesc(state.survivalObservations).filter(
    (obs) => eventFilter === "ALL" || obs.plantingEventId === eventFilter,
  );

  return (
    <PageShell
      eyebrow="Conservation impact"
      title="Survival monitoring"
      description="Survival rate is calculated, never typed in. Each observation is kept, so the trend over time stays visible."
    >
      {error && <ErrorNote message={error} />}
      {success && <SuccessNote message={success} />}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Planted" value={stats.totalPlanted.toLocaleString()} />
        <StatCard
          label="Surviving"
          value={stats.totalSurviving.toLocaleString()}
          tone="green"
        />
        <StatCard
          label="Average of latest observations"
          value={`${stats.latestRate}%`}
          tone={stats.latestRate >= 80 ? "green" : "amber"}
        />
        <StatCard
          label="Overall (of all planted)"
          value={`${stats.overallRate}%`}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card
          title="Survival trend by site"
          description="Latest observation for each planting event."
          action={
            access.can("EXPORT_DATA") ? (
              <button
                type="button"
                onClick={() => {
                  const data = survivalTrendExport(state);
                  downloadCsv(
                    `kai-cfa-survival-${new Date().toISOString().slice(0, 10)}.csv`,
                    data.columns,
                    data.rows,
                  );
                }}
                className="text-sm font-medium text-forest-700 hover:underline"
              >
                Export CSV
              </button>
            ) : undefined
          }
        >
          {trend.length === 0 ? (
            <p className="mt-4 text-sm text-ink-600">
              No survival observations yet. Add one below.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {trend.map((point) => (
                <BarRow
                  key={point.eventId}
                  label={`${point.eventLabel} · ${point.date}`}
                  value={point.rate}
                  max={100}
                  suffix="%"
                />
              ))}
            </div>
          )}
        </Card>

        {access.can("RECORD_SURVIVAL") ? (
          <ObservationForm
            onDone={(message, failure) => {
              setSuccess(message);
              setError(failure);
            }}
          />
        ) : (
          <Card title="Add a survival observation">
            <p className="mt-4 text-sm text-ink-600">
              Your role ({access.roleLabel}) cannot add observations.
            </p>
          </Card>
        )}
      </div>

      <div className="mt-6 w-60">
        <Field label="Filter by planting event" htmlFor="surv-filter">
          <Select
            id="surv-filter"
            value={eventFilter}
            onChange={(event) => setEventFilter(event.target.value)}
          >
            <option value="ALL">All events</option>
            {state.plantingEvents.map((event) => (
              <option key={event.id} value={event.id}>
                {event.siteName} · {speciesName(state, event.speciesId)}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Card title="Observation history" className="mt-4">
        {observations.length === 0 ? (
          <EmptyState
            title="No observations recorded"
            description="Walk a planting site and record how many seedlings are still alive."
          />
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-sand-200 text-left text-xs uppercase tracking-wide text-ink-600">
                  <th scope="col" className="py-2 pr-4 font-medium">
                    Date
                  </th>
                  <th scope="col" className="py-2 pr-4 font-medium">
                    Site
                  </th>
                  <th scope="col" className="py-2 pr-4 text-right font-medium">
                    Assessed
                  </th>
                  <th scope="col" className="py-2 pr-4 text-right font-medium">
                    Surviving
                  </th>
                  <th scope="col" className="py-2 pr-4 text-right font-medium">
                    Dead
                  </th>
                  <th scope="col" className="py-2 pr-4 text-right font-medium">
                    Missing
                  </th>
                  <th scope="col" className="py-2 pr-4 text-right font-medium">
                    Rate
                  </th>
                  <th scope="col" className="py-2 pr-4 font-medium">
                    Observer
                  </th>
                </tr>
              </thead>
              <tbody>
                {observations.map((obs) => {
                  const event = state.plantingEvents.find(
                    (item) => item.id === obs.plantingEventId,
                  );
                  const rate =
                    obs.assessed > 0 ? (obs.surviving / obs.assessed) * 100 : 0;
                  return (
                    <tr
                      key={obs.id}
                      className="border-b border-sand-100 align-top last:border-none"
                    >
                      <td className="py-3 pr-4 whitespace-nowrap text-ink-700">
                        {obs.date}
                      </td>
                      <td className="py-3 pr-4 text-ink-700">
                        {event?.siteName ?? obs.plantingEventId}
                        <p className="text-xs text-ink-600">
                          {event ? speciesName(state, event.speciesId) : ""}
                        </p>
                      </td>
                      <td className="py-3 pr-4 text-right text-ink-700">
                        {obs.assessed.toLocaleString()}
                      </td>
                      <td className="py-3 pr-4 text-right font-semibold text-ink-900">
                        {obs.surviving.toLocaleString()}
                      </td>
                      <td className="py-3 pr-4 text-right text-ink-700">
                        {obs.dead.toLocaleString()}
                      </td>
                      <td className="py-3 pr-4 text-right text-ink-700">
                        {obs.missing.toLocaleString()}
                      </td>
                      <td className="py-3 pr-4 text-right font-semibold text-forest-700">
                        {Math.round(rate)}%
                      </td>
                      <td className="py-3 pr-4 text-ink-700">
                        {obs.observerName}
                        {obs.causeOfLoss && (
                          <p className="text-xs text-ink-600">{obs.causeOfLoss}</p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </PageShell>
  );
}

function ObservationForm({
  onDone,
}: {
  onDone: (message?: string, error?: string) => void;
}) {
  const state = useCfaState();
  const access = useAccess();
  const first = state.plantingEvents[0];
  const [form, setForm] = useState({
    plantingEventId: first?.id ?? "",
    date: new Date().toISOString().slice(0, 10),
    observerName: access.currentUser,
    assessed: first ? String(first.quantityPlanted) : "",
    surviving: "",
    dead: "",
    missing: "",
    damaged: "",
    causeOfLoss: "",
    latitude: "",
    longitude: "",
    notes: "",
  });

  if (state.plantingEvents.length === 0) {
    return (
      <Card title="Add a survival observation">
        <p className="mt-4 text-sm text-ink-600">
          Record a planting event first — survival is observed on a planting
          site.
        </p>
      </Card>
    );
  }

  return (
    <Card
      title="Add a survival observation"
      description="Surviving, dead, and missing together cannot exceed the number assessed."
    >
      <form
        className="mt-4 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          const result = addSurvivalObservation({
            plantingEventId: form.plantingEventId,
            date: form.date,
            observerName: form.observerName || access.currentUser || "Unknown",
            assessed: Number(form.assessed) || 0,
            surviving: Number(form.surviving) || 0,
            dead: Number(form.dead) || 0,
            missing: Number(form.missing) || 0,
            damaged: Number(form.damaged) || 0,
            ...(form.causeOfLoss ? { causeOfLoss: form.causeOfLoss } : {}),
            ...(form.notes ? { notes: form.notes } : {}),
            ...(form.latitude ? { latitude: Number(form.latitude) } : {}),
            ...(form.longitude ? { longitude: Number(form.longitude) } : {}),
          });
          onDone(
            result.ok ? "Survival observation recorded." : undefined,
            result.error,
          );
          if (result.ok) {
            setForm((prev) => ({
              ...prev,
              surviving: "",
              dead: "",
              missing: "",
              damaged: "",
              causeOfLoss: "",
              notes: "",
            }));
          }
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Planting event" htmlFor="o-event" className="sm:col-span-2">
            <Select
              id="o-event"
              value={form.plantingEventId}
              onChange={(event) => {
                const next = state.plantingEvents.find(
                  (item) => item.id === event.target.value,
                );
                setForm((prev) => ({
                  ...prev,
                  plantingEventId: event.target.value,
                  assessed: next ? String(next.quantityPlanted) : prev.assessed,
                }));
              }}
              required
            >
              {state.plantingEvents.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.siteName} · {speciesName(state, event.speciesId)} ·{" "}
                  {event.quantityPlanted.toLocaleString()} planted
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Observation date" htmlFor="o-date">
            <TextInput
              id="o-date"
              type="date"
              value={form.date}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, date: event.target.value }))
              }
              required
            />
          </Field>
          <Field label="Observer" htmlFor="o-observer">
            <TextInput
              id="o-observer"
              value={form.observerName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, observerName: event.target.value }))
              }
            />
          </Field>
          <Field label="Number assessed" htmlFor="o-assessed">
            <TextInput
              id="o-assessed"
              type="number"
              min={0}
              value={form.assessed}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, assessed: event.target.value }))
              }
              required
            />
          </Field>
          <Field label="Surviving" htmlFor="o-surviving">
            <TextInput
              id="o-surviving"
              type="number"
              min={0}
              value={form.surviving}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, surviving: event.target.value }))
              }
              required
            />
          </Field>
          <Field label="Dead" htmlFor="o-dead">
            <TextInput
              id="o-dead"
              type="number"
              min={0}
              value={form.dead}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, dead: event.target.value }))
              }
            />
          </Field>
          <Field label="Missing" htmlFor="o-missing">
            <TextInput
              id="o-missing"
              type="number"
              min={0}
              value={form.missing}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, missing: event.target.value }))
              }
            />
          </Field>
          <Field label="Damaged" htmlFor="o-damaged">
            <TextInput
              id="o-damaged"
              type="number"
              min={0}
              value={form.damaged}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, damaged: event.target.value }))
              }
            />
          </Field>
          <Field label="Cause of loss" htmlFor="o-cause">
            <TextInput
              id="o-cause"
              value={form.causeOfLoss}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, causeOfLoss: event.target.value }))
              }
              placeholder="e.g. Dry spell"
            />
          </Field>
          <Field label="Latitude" htmlFor="o-lat">
            <TextInput
              id="o-lat"
              type="number"
              step="any"
              value={form.latitude}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, latitude: event.target.value }))
              }
            />
          </Field>
          <Field label="Longitude" htmlFor="o-lng">
            <TextInput
              id="o-lng"
              type="number"
              step="any"
              value={form.longitude}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, longitude: event.target.value }))
              }
            />
          </Field>
        </div>
        <Field label="Notes" htmlFor="o-notes">
          <TextArea
            id="o-notes"
            rows={2}
            value={form.notes}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, notes: event.target.value }))
            }
          />
        </Field>
        <PrimaryButton type="submit">Record observation</PrimaryButton>
      </form>
    </Card>
  );
}
