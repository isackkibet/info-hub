"use client";

import { useState } from "react";
import { PageShell } from "@/components/cfa/page-shell";
import { CfaBadge } from "@/components/cfa/badges";
import {
  Card,
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
import { useAccess, PERMISSION_LABELS, permissionsFor } from "@/lib/cfa/permissions";
import { updateCfaProfile, setRole } from "@/lib/cfa/actions";
import { resetCfaData } from "@/lib/cfa/store";
import { downloadJson } from "@/lib/cfa/export";
import { CfaStatusLabels, RoleLabels, type CfaRole, type CfaStatus } from "@/lib/cfa/types";

const ROLES = Object.entries(RoleLabels) as [CfaRole, string][];
const STATUSES = Object.entries(CfaStatusLabels) as [CfaStatus, string][];

export default function SettingsPage() {
  const state = useCfaState();
  const access = useAccess();
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [confirmReset, setConfirmReset] = useState(false);

  const canEdit = access.can("MANAGE_MEMBERS") || access.role === "ADMIN";
  const granted = permissionsFor(state.role);

  return (
    <PageShell
      eyebrow="Configuration"
      title="Settings"
      description="CFA profile, roles, and local preview data. This preview keeps everything in your browser and never writes to the database."
    >
      {error && <ErrorNote message={error} />}
      {success && <SuccessNote message={success} />}

      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileCard
          canEdit={canEdit}
          onDone={(message, failure) => {
            setSuccess(message);
            setError(failure);
          }}
        />

        <div className="space-y-6">
          <Card
            title="CFA status"
            description="Registration and public visibility."
            action={<CfaBadge status={state.cfa.status} />}
          >
            <div className="mt-4 space-y-4">
              <Field label="Operating status" htmlFor="cfa-status">
                <Select
                  id="cfa-status"
                  value={state.cfa.status}
                  disabled={!canEdit}
                  onChange={(event) => {
                    updateCfaProfile({ status: event.target.value as CfaStatus });
                    setSuccess("CFA status updated.");
                  }}
                >
                  {STATUSES.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>
              <label className="flex items-center gap-2 text-sm text-ink-700">
                <input
                  type="checkbox"
                  checked={state.cfa.isPublic}
                  disabled={!canEdit}
                  onChange={(event) => {
                    updateCfaProfile({ isPublic: event.target.checked });
                    setSuccess("Public visibility updated.");
                  }}
                  className="h-4 w-4 rounded border-sand-300 text-forest-600"
                />
                Show this CFA on the public directory
              </label>
            </div>
          </Card>

          <Card
            title="Acting role"
            description="A demo control. Real authorization would come from the signed-in account, not the browser."
          >
            <div className="mt-4 space-y-3">
              <Field label="Role" htmlFor="settings-role">
                <Select
                  id="settings-role"
                  value={state.role}
                  onChange={(event) => setRole(event.target.value as CfaRole)}
                >
                  {ROLES.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>
              <ul className="grid gap-1 border-t border-sand-200 pt-3 text-xs text-ink-700 sm:grid-cols-2">
                {granted.map((permission) => (
                  <li key={permission}>✓ {PERMISSION_LABELS[permission]}</li>
                ))}
              </ul>
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card
          title="Preview data"
          description="Reset restores the demo nurseries, ledger, and activities in this browser only."
        >
          <div className="mt-4 space-y-3">
            <p className="text-sm text-ink-700">
              {state.transactions.length.toLocaleString()} transactions,{" "}
              {state.activities.length.toLocaleString()} activities,{" "}
              {state.plantingEvents.length.toLocaleString()} planting events stored
              under <code className="text-xs">kai:cfa:v1</code>.
            </p>
            {confirmReset ? (
              <div className="flex flex-wrap items-center gap-3 rounded-md border border-red-200 bg-red-50 px-3 py-2">
                <span className="text-sm text-red-700">
                  This discards every change made in this browser.
                </span>
                <PrimaryButton
                  type="button"
                  onClick={() => {
                    resetCfaData();
                    setConfirmReset(false);
                    setSuccess("Preview data reset to the demo dataset.");
                  }}
                >
                  Yes, reset
                </PrimaryButton>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="text-sm text-ink-700 hover:underline"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <SecondaryButton type="button" onClick={() => setConfirmReset(true)}>
                Reset preview data
              </SecondaryButton>
            )}
          </div>
        </Card>

        <Card
          title="Audit trail"
          description={`The last ${Math.min(state.auditLog.length, 25)} events recorded in this browser.`}
        >
          {state.auditLog.length === 0 ? (
            <p className="mt-4 text-sm text-ink-600">Nothing recorded yet.</p>
          ) : (
            <>
              <ul className="mt-4 max-h-80 space-y-2 overflow-y-auto pr-1 text-xs">
                {state.auditLog.slice(0, 25).map((entry) => (
                  <li key={entry.id} className="border-b border-sand-100 pb-2 last:border-none">
                    <span className="font-medium text-ink-900">
                      {entry.event.replace(/_/g, " ").toLowerCase()}
                    </span>
                    <span className="text-ink-600">
                      {" "}
                      · {entry.actor || "unknown"} ·{" "}
                      {new Date(entry.at).toLocaleString()}
                    </span>
                    {entry.details && (
                      <p className="mt-0.5 text-ink-700">{entry.details}</p>
                    )}
                  </li>
                ))}
              </ul>
              {access.can("EXPORT_DATA") && (
                <div className="mt-4">
                  <SecondaryButton
                    type="button"
                    onClick={() =>
                      downloadJson(
                        `kai-cfa-audit-${new Date().toISOString().slice(0, 10)}.json`,
                        { auditLog: state.auditLog },
                      )
                    }
                  >
                    Export audit JSON
                  </SecondaryButton>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </PageShell>
  );
}

function ProfileCard({
  canEdit,
  onDone,
}: {
  canEdit: boolean;
  onDone: (message?: string, error?: string) => void;
}) {
  const state = useCfaState();
  const [form, setForm] = useState({
    name: state.cfa.name,
    registrationNumber: state.cfa.registrationNumber,
    country: state.cfa.country,
    county: state.cfa.county,
    subCounty: state.cfa.subCounty,
    ward: state.cfa.ward,
    community: state.cfa.community,
    description: state.cfa.description,
    mission: state.cfa.mission,
    contactName: state.cfa.contactName,
    contactPhone: state.cfa.contactPhone,
    contactEmail: state.cfa.contactEmail,
    latitude: state.cfa.latitude?.toString() ?? "",
    longitude: state.cfa.longitude?.toString() ?? "",
    leaderName: state.cfa.leaderName,
  });

  return (
    <Card title="CFA profile" description="Registration details and mission.">
      <form
        className="mt-4 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          const { latitude, longitude, ...profile } = form;
          updateCfaProfile({
            ...profile,
            ...(latitude ? { latitude: Number(latitude) } : {}),
            ...(longitude ? { longitude: Number(longitude) } : {}),
          });
          onDone("CFA profile saved.");
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="CFA name" htmlFor="s-name">
            <TextInput
              id="s-name"
              value={form.name}
              disabled={!canEdit}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
              required
            />
          </Field>
          <Field label="Registration number" htmlFor="s-reg">
            <TextInput
              id="s-reg"
              value={form.registrationNumber}
              disabled={!canEdit}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, registrationNumber: event.target.value }))
              }
              required
            />
          </Field>
          <Field label="Country" htmlFor="s-country">
            <TextInput
              id="s-country"
              value={form.country}
              disabled={!canEdit}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, country: event.target.value }))
              }
            />
          </Field>
          <Field label="County" htmlFor="s-county">
            <TextInput
              id="s-county"
              value={form.county}
              disabled={!canEdit}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, county: event.target.value }))
              }
            />
          </Field>
          <Field label="Sub-county" htmlFor="s-subcounty">
            <TextInput
              id="s-subcounty"
              value={form.subCounty}
              disabled={!canEdit}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, subCounty: event.target.value }))
              }
            />
          </Field>
          <Field label="Ward" htmlFor="s-ward">
            <TextInput
              id="s-ward"
              value={form.ward}
              disabled={!canEdit}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, ward: event.target.value }))
              }
            />
          </Field>
          <Field label="Community" htmlFor="s-community">
            <TextInput
              id="s-community"
              value={form.community}
              disabled={!canEdit}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, community: event.target.value }))
              }
            />
          </Field>
          <Field label="Leader" htmlFor="s-leader">
            <TextInput
              id="s-leader"
              value={form.leaderName}
              disabled={!canEdit}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, leaderName: event.target.value }))
              }
            />
          </Field>
          <Field label="Contact name" htmlFor="s-contact">
            <TextInput
              id="s-contact"
              value={form.contactName}
              disabled={!canEdit}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, contactName: event.target.value }))
              }
            />
          </Field>
          <Field label="Contact phone" htmlFor="s-phone">
            <TextInput
              id="s-phone"
              value={form.contactPhone}
              disabled={!canEdit}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, contactPhone: event.target.value }))
              }
            />
          </Field>
          <Field label="Contact email" htmlFor="s-email">
            <TextInput
              id="s-email"
              type="email"
              value={form.contactEmail}
              disabled={!canEdit}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, contactEmail: event.target.value }))
              }
            />
          </Field>
          <Field label="Latitude" htmlFor="s-lat">
            <TextInput
              id="s-lat"
              type="number"
              step="any"
              value={form.latitude}
              disabled={!canEdit}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, latitude: event.target.value }))
              }
            />
          </Field>
          <Field label="Longitude" htmlFor="s-lng">
            <TextInput
              id="s-lng"
              type="number"
              step="any"
              value={form.longitude}
              disabled={!canEdit}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, longitude: event.target.value }))
              }
            />
          </Field>
        </div>
        <Field label="Mission" htmlFor="s-mission">
          <TextArea
            id="s-mission"
            rows={2}
            value={form.mission}
            disabled={!canEdit}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, mission: event.target.value }))
            }
          />
        </Field>
        <Field label="Description" htmlFor="s-description">
          <TextArea
            id="s-description"
            rows={2}
            value={form.description}
            disabled={!canEdit}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, description: event.target.value }))
            }
          />
        </Field>
        {canEdit ? (
          <PrimaryButton type="submit">Save profile</PrimaryButton>
        ) : (
          <p className="text-sm text-ink-600">
            Only a CFA administrator can edit the profile.
          </p>
        )}
      </form>
    </Card>
  );
}
