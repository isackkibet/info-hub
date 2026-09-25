"use client";

import { useMemo, useState } from "react";
import { PageShell } from "@/components/cfa/page-shell";
import { Badge, StatCard, VerificationBadge } from "@/components/cfa/badges";
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
import { DataTable, type Column } from "@/components/cfa/table";
import { useCfaState } from "@/lib/cfa/store";
import { useAccess } from "@/lib/cfa/permissions";
import {
  postTransaction,
  reverseTransaction,
  type TransactionInput,
} from "@/lib/cfa/actions";
import {
  aggregateStock,
  availableQuantity,
  directionFor,
  lowStockRows,
  nurseryName,
  reconciliation,
  seedbedName,
  sortByDateDesc,
  speciesName,
  type StockRow,
} from "@/lib/cfa/inventory";
import { downloadCsv, downloadJson } from "@/lib/cfa/export";
import { transactionExport } from "@/lib/cfa/reports";
import {
  TransactionTypeLabels,
  type InventoryTransaction,
  type TransactionType,
} from "@/lib/cfa/types";

const TABS = ["Current stock", "Transactions", "Reconciliation", "Post movement"] as const;
type Tab = (typeof TABS)[number];

const MANUAL_TYPES: TransactionType[] = [
  "OPENING_STOCK",
  "ACQUISITION",
  "PROPAGATION",
  "MORTALITY",
  "ADJUSTMENT",
  "RETURN",
];

export default function InventoryPage() {
  const state = useCfaState();
  const access = useAccess();
  const [tab, setTab] = useState<Tab>("Current stock");
  const [nurseryFilter, setNurseryFilter] = useState("ALL");
  const [speciesFilter, setSpeciesFilter] = useState("ALL");
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();

  const aggregate = useMemo(() => aggregateStock(state), [state]);
  const rows = useMemo(
    () =>
      aggregate.filter(
        (row) =>
          (nurseryFilter === "ALL" || row.nurseryId === nurseryFilter) &&
          (speciesFilter === "ALL" || row.speciesId === speciesFilter),
      ),
    [aggregate, nurseryFilter, speciesFilter],
  );

  const transactions = useMemo(
    () =>
      sortByDateDesc(state.transactions).filter(
        (txn) =>
          (nurseryFilter === "ALL" || txn.nurseryId === nurseryFilter) &&
          (speciesFilter === "ALL" || txn.speciesId === speciesFilter),
      ),
    [state.transactions, nurseryFilter, speciesFilter],
  );

  const recon = useMemo(() => reconciliation(state), [state]);
  const low = useMemo(() => lowStockRows(state, 500), [state]);

  function exportTransactions(format: "csv" | "json") {
    const data = transactionExport(state);
    const stamp = new Date().toISOString().slice(0, 10);
    if (format === "csv") {
      downloadCsv(`kai-cfa-transactions-${stamp}.csv`, data.columns, data.rows);
    } else {
      downloadJson(`kai-cfa-transactions-${stamp}.json`, {
        generatedAt: new Date().toISOString(),
        cfa: state.cfa.name,
        columns: data.columns,
        rows: data.rows,
      });
    }
  }

  const stockColumns: Column<StockRow>[] = [
    {
      header: "Species",
      render: (row) => (
        <span className="font-medium text-ink-900">
          {speciesName(state, row.speciesId)}
        </span>
      ),
    },
    { header: "Nursery", render: (row) => nurseryName(state, row.nurseryId) },
    {
      header: "Propagated",
      align: "right",
      hideOnMobile: true,
      render: (row) => row.movements.propagation.toLocaleString(),
    },
    {
      header: "Moved out",
      align: "right",
      hideOnMobile: true,
      render: (row) =>
        (
          row.movements.sale +
          row.movements.donation +
          row.movements.planting +
          row.movements.transferOut
        ).toLocaleString(),
    },
    {
      header: "Mortality",
      align: "right",
      hideOnMobile: true,
      render: (row) => row.movements.mortality.toLocaleString(),
    },
    {
      header: "In stock",
      align: "right",
      render: (row) => (
        <span className="font-semibold text-ink-900">
          {row.quantity.toLocaleString()}
        </span>
      ),
    },
    {
      header: "Unverified",
      align: "right",
      hideOnMobile: true,
      render: (row) =>
        row.pendingQuantity === 0 ? (
          <span className="text-xs text-ink-600">—</span>
        ) : (
          <span className="text-xs font-medium text-gold-700">
            {row.pendingQuantity > 0 ? "+" : ""}
            {row.pendingQuantity.toLocaleString()}
          </span>
        ),
    },
  ];

  const txnColumns: Column<InventoryTransaction>[] = [
    {
      header: "ID",
      render: (txn) => (
        <span className="font-mono text-xs text-ink-600">{txn.id}</span>
      ),
    },
    { header: "Date", render: (txn) => txn.date },
    {
      header: "Type",
      render: (txn) => (
        <span className="font-medium text-ink-900">
          {TransactionTypeLabels[txn.transactionType]}
        </span>
      ),
    },
    {
      header: "Qty",
      align: "right",
      render: (txn) => (
        <span
          className={
            txn.direction === "IN"
              ? "font-semibold text-forest-700"
              : "font-semibold text-gold-700"
          }
        >
          {txn.direction === "IN" ? "+" : "−"}
          {txn.quantity.toLocaleString()}
        </span>
      ),
    },
    {
      header: "Nursery",
      hideOnMobile: true,
      render: (txn) => (
        <div>
          <span>{nurseryName(state, txn.nurseryId)}</span>
          <p className="text-xs text-ink-600">
            {seedbedName(state, txn.seedbedId)}
          </p>
        </div>
      ),
    },
    { header: "Species", render: (txn) => speciesName(state, txn.speciesId) },
    {
      header: "Recorded by",
      hideOnMobile: true,
      render: (txn) => txn.recordedBy,
    },
    {
      header: "Status",
      render: (txn) => <VerificationBadge status={txn.verificationStatus} />,
    },
    ...(access.can("ADJUST_STOCK")
      ? [
          {
            header: "",
            render: (txn: InventoryTransaction) => (
              <button
                type="button"
                onClick={() => {
                  const reason = window.prompt(
                    `Why is ${txn.id} being reversed? Corrections keep the original record and add a reversal.`,
                  );
                  if (!reason) return;
                  const result = reverseTransaction(txn.id, reason, access.currentUser);
                  setError(result.error);
                  setSuccess(result.ok ? `Reversal posted for ${txn.id}.` : undefined);
                }}
                className="text-xs font-medium text-forest-700 hover:underline"
              >
                Reverse
              </button>
            ),
          } satisfies Column<InventoryTransaction>,
        ]
      : []),
  ];

  return (
    <PageShell
      eyebrow="Inventory"
      title="Inventory ledger"
      description="Current stock is always calculated from transactions. There is no field anywhere in Kai where a stock number can be typed in."
    >
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total in stock"
          value={aggregate.reduce((sum, row) => sum + row.quantity, 0).toLocaleString()}
          tone="green"
        />
        <StatCard label="Transactions" value={state.transactions.length.toLocaleString()} />
        <StatCard
          label="Unverified quantity"
          value={aggregate
            .reduce((sum, row) => sum + row.pendingQuantity, 0)
            .toLocaleString()}
          tone="amber"
        />
        <StatCard label="Low stock lines" value={low.length} tone={low.length > 0 ? "amber" : "sand"} />
      </div>

      {(error || success) && (
        <div className="mt-4 space-y-2">
          <ErrorNote message={error} />
          <SuccessNote message={success} />
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={
              tab === item
                ? "rounded-md bg-forest-900 px-3 py-1.5 text-sm font-medium text-white"
                : "rounded-md border border-sand-200 px-3 py-1.5 text-sm text-ink-700 transition-colors hover:border-forest-200 hover:text-forest-700"
            }
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <div className="w-56">
          <Field label="Nursery" htmlFor="filter-nursery">
            <Select
              id="filter-nursery"
              value={nurseryFilter}
              onChange={(event) => setNurseryFilter(event.target.value)}
            >
              <option value="ALL">All nurseries</option>
              {state.nurseries.map((nursery) => (
                <option key={nursery.id} value={nursery.id}>
                  {nursery.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="w-56">
          <Field label="Species" htmlFor="filter-species">
            <Select
              id="filter-species"
              value={speciesFilter}
              onChange={(event) => setSpeciesFilter(event.target.value)}
            >
              <option value="ALL">All species</option>
              {state.species.map((species) => (
                <option key={species.id} value={species.id}>
                  {species.commonName}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </div>

      {tab === "Current stock" && (
        <Card
          title="Current stock"
          description="Balances by nursery and species, with the movements behind each balance."
        >
          <DataTable
            columns={stockColumns}
            rows={rows}
            rowKey={(row) => row.key}
            empty={
              <p className="text-sm text-ink-600">
                No stock matches this filter. Post an opening stock or record a
                propagation activity.
              </p>
            }
          />
        </Card>
      )}

      {tab === "Transactions" && (
        <Card
          title="Transaction history"
          description="Append-only. A verified transaction is never edited in place — corrections add a reversal."
          action={
            <div className="flex gap-2">
              <SecondaryButton type="button" onClick={() => exportTransactions("csv")}>
                Export CSV
              </SecondaryButton>
              <SecondaryButton type="button" onClick={() => exportTransactions("json")}>
                Export JSON
              </SecondaryButton>
            </div>
          }
        >
          <DataTable
            columns={txnColumns}
            rows={transactions}
            rowKey={(txn) => txn.id}
            empty={<p className="text-sm text-ink-600">No transactions recorded yet.</p>}
          />
        </Card>
      )}

      {tab === "Reconciliation" && (
        <Card
          title="Stock reconciliation"
          description="Where the ledger has been adjusted, or still holds unverified entries, it is flagged here."
        >
          <DataTable
            columns={[
              {
                header: "Species",
                render: (row: (typeof recon)[number]) => (
                  <span className="font-medium text-ink-900">
                    {speciesName(state, row.speciesId)}
                  </span>
                ),
              },
              {
                header: "Nursery",
                render: (row: (typeof recon)[number]) => nurseryName(state, row.nurseryId),
              },
              {
                header: "Ledger balance",
                align: "right",
                render: (row: (typeof recon)[number]) =>
                  row.quantity.toLocaleString(),
              },
              {
                header: "Verified balance",
                align: "right",
                hideOnMobile: true,
                render: (row: (typeof recon)[number]) =>
                  row.verifiedQuantity.toLocaleString(),
              },
              {
                header: "Variance",
                align: "right",
                render: (row: (typeof recon)[number]) =>
                  row.variance === 0 ? (
                    <span className="text-xs text-ink-600">—</span>
                  ) : (
                    <span className="font-medium text-gold-700">
                      {row.variance > 0 ? "+" : ""}
                      {row.variance.toLocaleString()}
                    </span>
                  ),
              },
              {
                header: "Status",
                render: (row: (typeof recon)[number]) => (
                  <Badge
                    tone={
                      row.flag === "OK"
                        ? "green"
                        : row.flag === "ADJUSTED"
                          ? "amber"
                          : "lake"
                    }
                  >
                    {row.flag === "OK"
                      ? "Balanced"
                      : row.flag === "ADJUSTED"
                        ? "Adjusted"
                        : "Pending verification"}
                  </Badge>
                ),
              },
            ]}
            rows={recon}
            rowKey={(row) => row.key}
            empty={<p className="text-sm text-ink-600">Nothing to reconcile yet.</p>}
          />
        </Card>
      )}

      {tab === "Post movement" && (
        <PostMovementCard
          onDone={(message, failure) => {
            setSuccess(message);
            setError(failure);
          }}
        />
      )}
    </PageShell>
  );
}

function PostMovementCard({
  onDone,
}: {
  onDone: (message?: string, error?: string) => void;
}) {
  const state = useCfaState();
  const access = useAccess();
  const [form, setForm] = useState({
    transactionType: "OPENING_STOCK" as TransactionType,
    nurseryId: state.nurseries[0]?.id ?? "",
    speciesId: state.species[0]?.id ?? "",
    seedbedId: "",
    seedBatchId: "",
    quantity: "",
    date: new Date().toISOString().slice(0, 10),
    source: "",
    destination: "",
    notes: "",
  });

  const canPost = access.can("POST_INVENTORY");
  const isAdjustment = form.transactionType === "ADJUSTMENT";
  const [adjustmentDirection, setAdjustmentDirection] = useState<"IN" | "OUT">("OUT");
  const direction = isAdjustment ? adjustmentDirection : directionFor(form.transactionType);
  const available =
    form.nurseryId && form.speciesId
      ? availableQuantity(state, form.nurseryId, form.speciesId)
      : 0;

  const seedbeds = state.seedbeds.filter(
    (bed) => bed.nurseryId === form.nurseryId,
  );
  const batches = state.batches.filter(
    (batch) => batch.nurseryId === form.nurseryId,
  );

  if (!canPost) {
    return (
      <Card title="Post a movement">
        <p className="mt-4 text-sm text-ink-600">
          Your role ({access.roleLabel}) can read the ledger but cannot post
          transactions. Ask a nursery manager or the CFA administrator.
        </p>
      </Card>
    );
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const input: TransactionInput = {
      transactionType: form.transactionType,
      nurseryId: form.nurseryId,
      speciesId: form.speciesId,
      quantity: Number(form.quantity),
      date: form.date,
      direction,
      source: form.source || TransactionTypeLabels[form.transactionType],
      ...(form.seedbedId ? { seedbedId: form.seedbedId } : {}),
      ...(form.seedBatchId ? { seedBatchId: form.seedBatchId } : {}),
      ...(form.destination ? { destination: form.destination } : {}),
      ...(form.notes ? { notes: form.notes } : {}),
    };
    const result = postTransaction(input, access.currentUser || "Unknown");
    onDone(
      result.ok ? `Posted ${input.quantity} as ${TransactionTypeLabels[form.transactionType]}.` : undefined,
      result.error,
    );
    if (result.ok) {
      setForm((prev) => ({ ...prev, quantity: "", source: "", notes: "" }));
    }
  }

  return (
    <Card
      title="Post a movement"
      description="For opening stock, acquisitions, mortality, and authorised adjustments. Sales, donations, transfers, and planting have their own pages so the buyer, recipient, and destination are always captured."
    >
      <form onSubmit={submit} className="mt-4 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Transaction type" htmlFor="txn-type">
            <Select
              id="txn-type"
              value={form.transactionType}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  transactionType: event.target.value as TransactionType,
                }))
              }
            >
              {MANUAL_TYPES.map((type) => (
                <option key={type} value={type}>
                  {TransactionTypeLabels[type]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Date" htmlFor="txn-date">
            <TextInput
              id="txn-date"
              type="date"
              value={form.date}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, date: event.target.value }))
              }
              required
            />
          </Field>
          <Field label="Nursery" htmlFor="txn-nursery">
            <Select
              id="txn-nursery"
              value={form.nurseryId}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  nurseryId: event.target.value,
                  seedbedId: "",
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
          <Field label="Species" htmlFor="txn-species">
            <Select
              id="txn-species"
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
          <Field label="Seedbed (optional)" htmlFor="txn-seedbed">
            <Select
              id="txn-seedbed"
              value={form.seedbedId}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, seedbedId: event.target.value }))
              }
            >
              <option value="">Nursery-wide</option>
              {seedbeds.map((bed) => (
                <option key={bed.id} value={bed.id}>
                  {bed.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Seed batch (optional)" htmlFor="txn-batch">
            <Select
              id="txn-batch"
              value={form.seedBatchId}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, seedBatchId: event.target.value }))
              }
            >
              <option value="">Not batch-specific</option>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.id} · {speciesName(state, batch.speciesId)}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label={isAdjustment ? "Adjustment quantity" : "Quantity"}
            htmlFor="txn-qty"
            hint={
              isAdjustment
                ? `Available: ${available.toLocaleString()}. An adjustment must carry a reason.`
                : `Available at this nursery: ${available.toLocaleString()}`
            }
          >
            <TextInput
              id="txn-qty"
              type="number"
              min={1}
              step={1}
              value={form.quantity}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, quantity: event.target.value }))
              }
              required
            />
          </Field>
          <Field label="Direction" htmlFor="txn-direction" hint="Adjustments can go either way.">
            {isAdjustment ? (
              <Select
                id="txn-direction"
                value={adjustmentDirection}
                onChange={(event) =>
                  setAdjustmentDirection(event.target.value as "IN" | "OUT")
                }
              >
                <option value="OUT">Reduce stock</option>
                <option value="IN">Increase stock</option>
              </Select>
            ) : (
              <div
                id="txn-direction"
                className="rounded-md border border-sand-200 bg-sand-50 px-3 py-2 text-sm text-ink-700"
              >
                {direction === "IN" ? "Adds to stock" : "Removes from stock"}
              </div>
            )}
          </Field>
        </div>

        {isAdjustment && !access.can("ADJUST_STOCK") && (
          <ErrorNote message="Only a nursery manager or CFA administrator can authorise an adjustment." />
        )}

        <Field
          label={isAdjustment ? "Reason for the adjustment" : "Source"}
          htmlFor="txn-source"
          hint={isAdjustment ? "Explain the discrepancy. This is stored in the audit log." : undefined}
        >
          <TextInput
            id="txn-source"
            value={form.source}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, source: event.target.value }))
            }
            placeholder={isAdjustment ? "e.g. Physical count found 40 fewer" : "e.g. Register carry-over"}
            required={isAdjustment}
          />
        </Field>

        <Field label="Destination (optional)" htmlFor="txn-destination">
          <TextInput
            id="txn-destination"
            value={form.destination}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, destination: event.target.value }))
            }
          />
        </Field>

        <Field label="Notes (optional)" htmlFor="txn-notes">
          <TextArea
            id="txn-notes"
            rows={2}
            value={form.notes}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, notes: event.target.value }))
            }
          />
        </Field>

        <div className="flex flex-wrap items-center gap-3">
          <PrimaryButton
            type="submit"
            disabled={isAdjustment && !access.can("ADJUST_STOCK")}
          >
            Post to ledger
          </PrimaryButton>
        </div>
      </form>
    </Card>
  );
}
