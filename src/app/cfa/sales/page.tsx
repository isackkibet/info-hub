"use client";

import { useState } from "react";
import { PageShell } from "@/components/cfa/page-shell";
import { PaymentBadge, StatCard } from "@/components/cfa/badges";
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
import { addSale, setPaymentStatus } from "@/lib/cfa/actions";
import {
  availableQuantity,
  nurseryName,
  sortByDateDesc,
  speciesName,
} from "@/lib/cfa/inventory";
import { downloadCsv } from "@/lib/cfa/export";
import { salesExport } from "@/lib/cfa/reports";
import { PaymentStatusLabels, type PaymentStatus, type Sale } from "@/lib/cfa/types";

const STATUSES = Object.entries(PaymentStatusLabels) as [PaymentStatus, string][];

export default function SalesPage() {
  const state = useCfaState();
  const access = useAccess();
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const canRecord = access.can("RECORD_MOVEMENT");
  const canSeeMoney = access.can("VIEW_FINANCIALS");

  const sales = sortByDateDesc(state.sales);
  const outstanding = state.sales
    .filter((sale) => sale.paymentStatus === "PENDING" || sale.paymentStatus === "PARTIALLY_PAID")
    .reduce((sum, sale) => sum + sale.quantity * sale.unitPrice, 0);
  const revenue = state.sales
    .filter((sale) => sale.paymentStatus === "PAID")
    .reduce((sum, sale) => sum + sale.quantity * sale.unitPrice, 0);

  const columns: Column<Sale>[] = [
    { header: "Date", render: (sale) => sale.date },
    {
      header: "Buyer",
      render: (sale) => (
        <div>
          <span className="font-medium text-ink-900">{sale.buyerName}</span>
          {sale.buyerContact && (
            <p className="text-xs text-ink-600">{sale.buyerContact}</p>
          )}
        </div>
      ),
    },
    {
      header: "Species",
      hideOnMobile: true,
      render: (sale) => speciesName(state, sale.speciesId),
    },
    {
      header: "Qty",
      align: "right",
      render: (sale) => sale.quantity.toLocaleString(),
    },
    ...(canSeeMoney
      ? [
          {
            header: "Value",
            align: "right" as const,
            render: (sale: Sale) =>
              `${(sale.quantity * sale.unitPrice).toLocaleString()} ${sale.currency}`,
          },
        ]
      : []),
    {
      header: "Destination",
      hideOnMobile: true,
      render: (sale) => sale.destination,
    },
    {
      header: "Payment",
      render: (sale) =>
        canRecord ? (
          <Select
            aria-label={`Payment status for ${sale.id}`}
            value={sale.paymentStatus}
            onChange={(event) =>
              setPaymentStatus(sale.id, event.target.value as PaymentStatus)
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
          <PaymentBadge status={sale.paymentStatus} />
        ),
    },
  ];

  return (
    <PageShell
      eyebrow="Movement"
      title="Sales"
      description="Recording a sale posts an outgoing transaction and creates an activity for verification. Kai records the sale; it is not an accounting system."
    >
      {error && <ErrorNote message={error} />}
      {success && <SuccessNote message={success} />}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Sales recorded" value={sales.length} />
        <StatCard
          label="Seedlings sold"
          value={sales.reduce((sum, sale) => sum + sale.quantity, 0).toLocaleString()}
        />
        {canSeeMoney ? (
          <>
            <StatCard
              label="Paid"
              value={revenue.toLocaleString()}
              hint="KES"
              tone="green"
            />
            <StatCard
              label="Outstanding"
              value={outstanding.toLocaleString()}
              hint="KES pending or part-paid"
              tone={outstanding > 0 ? "amber" : "sand"}
            />
          </>
        ) : (
          <StatCard label="Buyers" value={new Set(sales.map((s) => s.buyerName)).size} />
        )}
      </div>

      {canRecord ? (
        <SaleForm
          onDone={(message, failure) => {
            setSuccess(message);
            setError(failure);
          }}
        />
      ) : (
        <Card title="Record a sale" className="mt-6">
          <p className="mt-4 text-sm text-ink-600">
            Your role ({access.roleLabel}) cannot record sales.
          </p>
        </Card>
      )}

      <Card
        title="Sales history"
        className="mt-6"
        action={
          access.can("EXPORT_DATA") ? (
            <button
              type="button"
              onClick={() => {
                const data = salesExport(state);
                downloadCsv(
                  `kai-cfa-sales-${new Date().toISOString().slice(0, 10)}.csv`,
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
        <DataTable
          columns={columns}
          rows={sales}
          rowKey={(sale) => sale.id}
          empty={
            <EmptyState
              title="No sales recorded"
              description="Record a sale above. Kai will check the stock first and refuse to oversell."
            />
          }
        />
      </Card>
    </PageShell>
  );
}

function SaleForm({
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
    buyerName: "",
    buyerContact: "",
    unitPrice: "",
    currency: "KES",
    purpose: "",
    destination: "",
    programId: "",
    notes: "",
  });

  const available = availableQuantity(state, form.nurseryId, form.speciesId);
  const batches = state.batches.filter(
    (batch) => batch.nurseryId === form.nurseryId && batch.speciesId === form.speciesId,
  );

  return (
    <Card title="Record a sale" className="mt-6">
      <form
        className="mt-4 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          const result = addSale(
            {
              nurseryId: form.nurseryId,
              speciesId: form.speciesId,
              quantity: Number(form.quantity),
              date: form.date,
              buyerName: form.buyerName,
              buyerContact: form.buyerContact || undefined,
              unitPrice: Number(form.unitPrice) || 0,
              currency: form.currency,
              paymentStatus: "PENDING",
              purpose: form.purpose,
              destination: form.destination,
              recordedBy: access.currentUser || "Unknown",
              ...(form.seedBatchId ? { seedBatchId: form.seedBatchId } : {}),
              ...(form.programId ? { programId: form.programId } : {}),
              ...(form.notes ? { notes: form.notes } : {}),
            },
            access.currentUser || "Unknown",
          );
          onDone(
            result.ok
              ? `Sale recorded. ${Number(form.quantity).toLocaleString()} seedlings left ${nurseryName(state, form.nurseryId)}.`
              : undefined,
            result.error,
          );
          if (result.ok) {
            setForm((prev) => ({
              ...prev,
              quantity: "",
              buyerName: "",
              buyerContact: "",
              destination: "",
            }));
          }
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nursery" htmlFor="s-nursery">
            <Select
              id="s-nursery"
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
            htmlFor="s-species"
            hint={`In stock here: ${available.toLocaleString()}`}
          >
            <Select
              id="s-species"
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
          <Field label="Seed batch" htmlFor="s-batch">
            <Select
              id="s-batch"
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
          <Field
            label="Quantity"
            htmlFor="s-qty"
            hint="Kai refuses to sell more than the ledger holds."
          >
            <TextInput
              id="s-qty"
              type="number"
              min={1}
              value={form.quantity}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, quantity: event.target.value }))
              }
              required
            />
          </Field>
          <Field label="Buyer" htmlFor="s-buyer">
            <TextInput
              id="s-buyer"
              value={form.buyerName}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, buyerName: event.target.value }))
              }
              required
            />
          </Field>
          <Field label="Buyer contact" htmlFor="s-contact">
            <TextInput
              id="s-contact"
              value={form.buyerContact}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, buyerContact: event.target.value }))
              }
            />
          </Field>
          <Field label="Price per seedling" htmlFor="s-price">
            <TextInput
              id="s-price"
              type="number"
              min={0}
              step="any"
              value={form.unitPrice}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, unitPrice: event.target.value }))
              }
            />
          </Field>
          <Field label="Currency" htmlFor="s-currency">
            <TextInput
              id="s-currency"
              value={form.currency}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, currency: event.target.value }))
              }
            />
          </Field>
          <Field label="Date" htmlFor="s-date">
            <TextInput
              id="s-date"
              type="date"
              value={form.date}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, date: event.target.value }))
              }
              required
            />
          </Field>
          <Field label="Destination" htmlFor="s-destination">
            <TextInput
              id="s-destination"
              value={form.destination}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, destination: event.target.value }))
              }
              placeholder="Where the seedlings are going"
            />
          </Field>
          <Field label="Purpose" htmlFor="s-purpose">
            <TextInput
              id="s-purpose"
              value={form.purpose}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, purpose: event.target.value }))
              }
            />
          </Field>
          <Field label="Program" htmlFor="s-program">
            <Select
              id="s-program"
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
        <Field label="Notes" htmlFor="s-notes">
          <TextArea
            id="s-notes"
            rows={2}
            value={form.notes}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, notes: event.target.value }))
            }
          />
        </Field>
        <PrimaryButton type="submit">Record sale</PrimaryButton>
      </form>
    </Card>
  );
}
