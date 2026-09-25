import type {
  CfaState,
  InventoryTransaction,
  Nursery,
  Seedbed,
  Species,
  TransactionType,
} from "./types";

export interface MovementTotals {
  opening: number;
  propagation: number;
  acquisition: number;
  transferIn: number;
  transferOut: number;
  sale: number;
  donation: number;
  planting: number;
  mortality: number;
  adjustment: number;
  returnQty: number;
  reserved: number;
}

export const INFLOW_TYPES: TransactionType[] = [
  "OPENING_STOCK",
  "PROPAGATION",
  "ACQUISITION",
  "TRANSFER_IN",
  "RETURN",
];

export function isInflow(type: TransactionType): boolean {
  return INFLOW_TYPES.includes(type);
}

export function isOutflow(type: TransactionType): boolean {
  return !isInflow(type) && type !== "ADJUSTMENT" && type !== "RESERVED" && type !== "RESERVATION_RELEASED";
}

export function directionFor(
  type: TransactionType,
  fallback: "IN" | "OUT" = "IN",
): "IN" | "OUT" {
  if (type === "ADJUSTMENT" || type === "RESERVED" || type === "RESERVATION_RELEASED") {
    return fallback;
  }
  return isInflow(type) ? "IN" : "OUT";
}

export function signedQuantity(txn: InventoryTransaction): number {
  return txn.direction === "IN" ? txn.quantity : -txn.quantity;
}

export function stockKey(
  nurseryId: string,
  speciesId: string,
  seedbedId?: string,
  seedBatchId?: string,
) {
  return [nurseryId, speciesId, seedbedId ?? "-", seedBatchId ?? "-"].join("|");
}

export function aggregateKey(nurseryId: string, speciesId: string) {
  return `${nurseryId}|${speciesId}`;
}

export function sortByDateDesc<T extends { date: string; createdAt: string }>(
  rows: T[],
): T[] {
  return [...rows].sort((a, b) => {
    const byDate = b.date.localeCompare(a.date);
    if (byDate !== 0) return byDate;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export interface StockRow {
  key: string;
  nurseryId: string;
  speciesId: string;
  seedbedId?: string;
  seedBatchId?: string;
  quantity: number;
  verifiedQuantity: number;
  pendingQuantity: number;
  movements: MovementTotals;
}

function emptyTotals(): MovementTotals {
  return {
    opening: 0,
    propagation: 0,
    acquisition: 0,
    transferIn: 0,
    transferOut: 0,
    sale: 0,
    donation: 0,
    planting: 0,
    mortality: 0,
    adjustment: 0,
    returnQty: 0,
    reserved: 0,
  };
}

function applyToTotals(
  totals: MovementTotals,
  txn: InventoryTransaction,
): void {
  const value = txn.quantity;
  switch (txn.transactionType) {
    case "OPENING_STOCK":
      totals.opening += value;
      break;
    case "PROPAGATION":
      totals.propagation += value;
      break;
    case "ACQUISITION":
      totals.acquisition += value;
      break;
    case "TRANSFER_IN":
      totals.transferIn += value;
      break;
    case "TRANSFER_OUT":
      totals.transferOut += value;
      break;
    case "SALE":
      totals.sale += value;
      break;
    case "DONATION":
      totals.donation += value;
      break;
    case "PLANTING":
      totals.planting += value;
      break;
    case "MORTALITY":
      totals.mortality += value;
      break;
    case "ADJUSTMENT":
      totals.adjustment += signedQuantity(txn);
      break;
    case "RETURN":
      totals.returnQty += value;
      break;
    case "RESERVED":
      totals.reserved += value;
      break;
    case "RESERVATION_RELEASED":
      totals.reserved -= value;
      break;
  }
}

export function stockRows(state: CfaState): StockRow[] {
  const rows = new Map<string, StockRow>();

  for (const txn of state.transactions) {
    const key = stockKey(
      txn.nurseryId,
      txn.speciesId,
      txn.seedbedId,
      txn.seedBatchId,
    );
    let row = rows.get(key);
    if (!row) {
      row = {
        key,
        nurseryId: txn.nurseryId,
        speciesId: txn.speciesId,
        seedbedId: txn.seedbedId,
        seedBatchId: txn.seedBatchId,
        quantity: 0,
        verifiedQuantity: 0,
        pendingQuantity: 0,
        movements: emptyTotals(),
      };
      rows.set(key, row);
    }
    const signed = signedQuantity(txn);
    row.quantity += signed;
    applyToTotals(row.movements, txn);
    if (txn.verificationStatus === "VERIFIED") {
      row.verifiedQuantity += signed;
    } else {
      row.pendingQuantity += signed;
    }
  }

  return [...rows.values()]
    .filter((row) => row.quantity !== 0 || row.movements.opening !== 0)
    .sort((a, b) => b.quantity - a.quantity);
}

export function aggregateStock(state: CfaState): StockRow[] {
  const rows = stockRows(state);
  const grouped = new Map<string, StockRow>();

  for (const row of rows) {
    const key = aggregateKey(row.nurseryId, row.speciesId);
    let target = grouped.get(key);
    if (!target) {
      target = {
        key,
        nurseryId: row.nurseryId,
        speciesId: row.speciesId,
        quantity: 0,
        verifiedQuantity: 0,
        pendingQuantity: 0,
        movements: emptyTotals(),
      };
      grouped.set(key, target);
    }
    target.quantity += row.quantity;
    target.verifiedQuantity += row.verifiedQuantity;
    target.pendingQuantity += row.pendingQuantity;
    for (const field of Object.keys(target.movements) as (keyof MovementTotals)[]) {
      target.movements[field] += row.movements[field];
    }
  }

  return [...grouped.values()].sort((a, b) => b.quantity - a.quantity);
}

export function availableQuantity(
  state: CfaState,
  nurseryId: string,
  speciesId: string,
): number {
  return aggregateStock(state)
    .filter((row) => row.nurseryId === nurseryId && row.speciesId === speciesId)
    .reduce((sum, row) => sum + row.quantity, 0);
}

export interface PostingValidation {
  ok: boolean;
  error?: string;
}

export function validatePosting(
  state: CfaState,
  input: {
    transactionType: TransactionType;
    nurseryId: string;
    speciesId: string;
    quantity: number;
    direction: "IN" | "OUT";
  },
): PostingValidation {
  if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
    return { ok: false, error: "Quantity must be a whole number greater than zero." };
  }
  if (!input.nurseryId) {
    return { ok: false, error: "Select a nursery." };
  }
  if (!input.speciesId) {
    return { ok: false, error: "Select a species." };
  }

  if (input.direction === "OUT" && input.transactionType !== "ADJUSTMENT") {
    const available = availableQuantity(state, input.nurseryId, input.speciesId);
    if (input.quantity > available) {
      return {
        ok: false,
        error: `Only ${available.toLocaleString()} in stock for this species at this nursery. Record an authorised adjustment with a reason instead of overselling.`,
      };
    }
  }

  return { ok: true };
}

export interface ReconciliationRow extends StockRow {
  variance: number;
  flag: "OK" | "ADJUSTED" | "PENDING";
}

export function reconciliation(state: CfaState): ReconciliationRow[] {
  return aggregateStock(state).map((row) => {
    const variance = row.movements.adjustment;
    const flag: ReconciliationRow["flag"] =
      variance !== 0 ? "ADJUSTED" : row.pendingQuantity !== 0 ? "PENDING" : "OK";
    return { ...row, variance, flag };
  });
}

export function lowStockRows(state: CfaState, threshold: number): StockRow[] {
  return aggregateStock(state).filter(
    (row) => row.quantity <= threshold && row.quantity >= 0,
  );
}

export interface InventorySummary {
  currentStock: number;
  speciesCount: number;
  activeSeedbeds: number;
  propagated: number;
  planted: number;
  sold: number;
  donated: number;
  transferred: number;
  mortality: number;
  opening: number;
  acquired: number;
  salesValue: number;
  mortalityRate: number;
  survivalRate: number;
}

export function inventorySummary(state: CfaState): InventorySummary {
  const stock = aggregateStock(state);
  const currentStock = stock.reduce((sum, row) => sum + row.quantity, 0);

  const totals = stock.reduce(
    (acc, row) => {
      acc.propagated += row.movements.propagation;
      acc.planted += row.movements.planting;
      acc.sold += row.movements.sale;
      acc.donated += row.movements.donation;
      acc.transferred += row.movements.transferOut;
      acc.mortality += row.movements.mortality;
      acc.opening += row.movements.opening;
      acc.acquired += row.movements.acquisition;
      return acc;
    },
    {
      propagated: 0,
      planted: 0,
      sold: 0,
      donated: 0,
      transferred: 0,
      mortality: 0,
      opening: 0,
      acquired: 0,
    },
  );

  const salesValue = state.sales
    .filter((sale) => sale.paymentStatus !== "CANCELLED")
    .reduce((sum, sale) => sum + sale.quantity * sale.unitPrice, 0);

  const produced = totals.opening + totals.acquired + totals.propagated;
  const mortalityRate =
    produced > 0 ? (totals.mortality / produced) * 100 : 0;

  const survival = survivalStats(state);

  return {
    currentStock,
    speciesCount: stock.length,
    activeSeedbeds: state.seedbeds.filter((bed) => bed.status === "ACTIVE").length,
    propagated: totals.propagated,
    planted: totals.planted,
    sold: totals.sold,
    donated: totals.donated,
    transferred: totals.transferred,
    mortality: totals.mortality,
    opening: totals.opening,
    acquired: totals.acquired,
    salesValue,
    mortalityRate: Math.round(mortalityRate * 10) / 10,
    survivalRate: survival.latestRate,
  };
}

export interface SurvivalStats {
  latestRate: number;
  overallRate: number;
  totalPlanted: number;
  totalSurviving: number;
}

export function survivalStats(state: CfaState): SurvivalStats {
  const totalPlanted = state.plantingEvents.reduce(
    (sum, event) => sum + event.quantityPlanted,
    0,
  );

  let survivingTotal = 0;
  let rateSum = 0;
  let rateCount = 0;

  for (const event of state.plantingEvents) {
    const observations = state.survivalObservations
      .filter((obs) => obs.plantingEventId === event.id)
      .sort((a, b) => a.date.localeCompare(b.date));
    const latest = observations[observations.length - 1];
    if (!latest) continue;
    survivingTotal += latest.surviving;
    const rate = latest.assessed > 0 ? (latest.surviving / latest.assessed) * 100 : 0;
    rateSum += rate;
    rateCount += 1;
  }

  return {
    latestRate: rateCount > 0 ? Math.round((rateSum / rateCount) * 10) / 10 : 0,
    overallRate:
      totalPlanted > 0
        ? Math.round((survivingTotal / totalPlanted) * 1000) / 10
        : 0,
    totalPlanted,
    totalSurviving: survivingTotal,
  };
}

export interface SurvivalPoint {
  eventId: string;
  eventLabel: string;
  date: string;
  rate: number;
  assessed: number;
  surviving: number;
}

export function survivalTrend(state: CfaState): SurvivalPoint[] {
  return state.plantingEvents
    .map((event) => {
      const observations = state.survivalObservations
        .filter((obs) => obs.plantingEventId === event.id)
        .sort((a, b) => a.date.localeCompare(b.date));
      const latest = observations[observations.length - 1];
      if (!latest) return null;
      return {
        eventId: event.id,
        eventLabel: event.siteName,
        date: latest.date,
        rate:
          latest.assessed > 0
            ? Math.round((latest.surviving / latest.assessed) * 1000) / 10
            : 0,
        assessed: latest.assessed,
        surviving: latest.surviving,
      } satisfies SurvivalPoint;
    })
    .filter((point): point is SurvivalPoint => point !== null)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export interface MonthlyMovement {
  month: string;
  label: string;
  propagated: number;
  sold: number;
  donated: number;
  planted: number;
  mortality: number;
}

export function monthlyMovement(state: CfaState): MonthlyMovement[] {
  const buckets = new Map<string, MonthlyMovement>();

  for (const txn of state.transactions) {
    if (txn.verificationStatus === "ARCHIVED") continue;
    const month = txn.date.slice(0, 7);
    let bucket = buckets.get(month);
    if (!bucket) {
      bucket = {
        month,
        label: new Date(`${month}-01T00:00:00`).toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        }),
        propagated: 0,
        sold: 0,
        donated: 0,
        planted: 0,
        mortality: 0,
      };
      buckets.set(month, bucket);
    }
    switch (txn.transactionType) {
      case "PROPAGATION":
        bucket.propagated += txn.quantity;
        break;
      case "SALE":
        bucket.sold += txn.quantity;
        break;
      case "DONATION":
        bucket.donated += txn.quantity;
        break;
      case "PLANTING":
        bucket.planted += txn.quantity;
        break;
      case "MORTALITY":
        bucket.mortality += txn.quantity;
        break;
      default:
        break;
    }
  }

  return [...buckets.values()].sort((a, b) => a.month.localeCompare(b.month));
}

export function nurseryOf(state: CfaState, nurseryId?: string): Nursery | undefined {
  return state.nurseries.find((nursery) => nursery.id === nurseryId);
}

export function speciesOf(state: CfaState, speciesId?: string): Species | undefined {
  return state.species.find((species) => species.id === speciesId);
}

export function seedbedOf(state: CfaState, seedbedId?: string): Seedbed | undefined {
  return state.seedbeds.find((bed) => bed.id === seedbedId);
}

export function nurseryName(state: CfaState, nurseryId?: string): string {
  return nurseryOf(state, nurseryId)?.name ?? "Unassigned";
}

export function speciesName(state: CfaState, speciesId?: string): string {
  return speciesOf(state, speciesId)?.commonName ?? "Unassigned";
}

export function seedbedName(state: CfaState, seedbedId?: string): string {
  if (!seedbedId) return "Nursery-wide";
  return seedbedOf(state, seedbedId)?.name ?? "Unknown bed";
}
