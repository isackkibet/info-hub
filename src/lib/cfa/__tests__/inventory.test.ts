import assert from "node:assert/strict";
import { test } from "node:test";
import { buildSeedState } from "../seed";
import {
  aggregateStock,
  availableQuantity,
  inventorySummary,
  monthlyMovement,
  sortByDateDesc,
  stockRows,
  survivalStats,
  survivalTrend,
  validatePosting,
} from "../inventory";
import type { CfaState, InventoryTransaction } from "../types";

const state = buildSeedState();

function txn(
  overrides: Partial<InventoryTransaction> & Pick<InventoryTransaction, "transactionType" | "nurseryId" | "speciesId" | "quantity" | "direction">,
): InventoryTransaction {
  return {
    id: `T-${Math.random().toString(36).slice(2, 8)}`,
    date: "2026-01-01",
    source: "test",
    recordedBy: "tester",
    verificationStatus: "VERIFIED",
    createdAt: new Date(0).toISOString(),
    ...overrides,
  };
}

function withTransactions(extra: InventoryTransaction[]): CfaState {
  return { ...state, transactions: [...state.transactions, ...extra] };
}

test("stock is derived from the transaction ledger, never stored", () => {
  const prunus = aggregateStock(state).find(
    (row) => row.nurseryId === "NUR-KAPSABET" && row.speciesId === "SP-PRUNUS",
  );
  assert.ok(prunus, "expected a Prunus row for Kapsabet");
  // 1200 opening + 800 propagated - 300 sold - 40 mortality - 200 donated - 260 planted
  assert.equal(prunus.quantity, 1200);
  assert.equal(prunus.movements.opening, 1200);
  assert.equal(prunus.movements.propagation, 800);
  assert.equal(prunus.movements.sale, 300);
  assert.equal(prunus.movements.donation, 200);
  assert.equal(prunus.movements.planting, 260);
  assert.equal(prunus.movements.mortality, 40);
});

test("aggregate stock rolls up seedbed and batch level rows", () => {
  const rows = aggregateStock(state).filter(
    (row) => row.nurseryId === "NUR-KAPSABET" && row.speciesId === "SP-VITEX",
  );
  assert.equal(rows.length, 1, "Kapsabet Vitex must be a single aggregate row");
  // 1500 opening + 1500 propagated - 250 sold - 30 mortality - 200 planted - 100 transferred out
  assert.equal(rows[0].quantity, 2420);
});

test("pending transactions count toward operational stock and are separated from verified", () => {
  const row = aggregateStock(state).find(
    (item) => item.nurseryId === "NUR-KAPSABET" && item.speciesId === "SP-CROTON",
  );
  assert.ok(row);
  // 1000 propagated - 100 sold - 20 mortality - 50 donated + 250 pending propagation
  assert.equal(row.quantity, 1080);
  assert.equal(row.pendingQuantity, 250);
  assert.equal(row.verifiedQuantity, 830);
});

test("stock rows collapse when the same bed and batch are used", () => {
  const bed = stockRows(state).filter(
    (row) => row.nurseryId === "NUR-KAPSABET" && row.speciesId === "SP-CROTON",
  );
  assert.equal(bed.length, 2, "expected separate rows for SB-KC-B and SB-KC-C");
  assert.equal(
    bed.reduce((sum, row) => sum + row.quantity, 0),
    1080,
  );
});

test("an outflow larger than stock is rejected", () => {
  const check = validatePosting(state, {
    transactionType: "SALE",
    nurseryId: "NUR-KAPSABET",
    speciesId: "SP-PRUNUS",
    quantity: 1201,
    direction: "OUT",
  });
  assert.equal(check.ok, false);
  assert.match(check.error ?? "", /1,200 in stock/);
});

test("an outflow equal to the available balance is allowed", () => {
  const check = validatePosting(state, {
    transactionType: "SALE",
    nurseryId: "NUR-KAPSABET",
    speciesId: "SP-PRUNUS",
    quantity: 1200,
    direction: "OUT",
  });
  assert.equal(check.ok, true);
});

test("an adjustment is the only way to take stock below zero", () => {
  const check = validatePosting(state, {
    transactionType: "ADJUSTMENT",
    nurseryId: "NUR-KAPSABET",
    speciesId: "SP-PRUNUS",
    quantity: 5000,
    direction: "OUT",
  });
  assert.equal(check.ok, true, "adjustments are reasoned, not blocked");
});

test("quantity must be a positive whole number", () => {
  for (const quantity of [0, -5, 1.5]) {
    const check = validatePosting(state, {
      transactionType: "ACQUISITION",
      nurseryId: "NUR-KAPSABET",
      speciesId: "SP-PRUNUS",
      quantity,
      direction: "IN",
    });
    assert.equal(check.ok, false, `expected ${quantity} to be rejected`);
  }
});

test("a species with no transactions reports zero available", () => {
  assert.equal(availableQuantity(state, "NUR-KAPSABET", "SP-UNKNOWN"), 0);
  assert.equal(
    validatePosting(state, {
      transactionType: "SALE",
      nurseryId: "NUR-KAPSABET",
      speciesId: "SP-UNKNOWN",
      quantity: 1,
      direction: "OUT",
    }).ok,
    false,
  );
});

test("a paired transfer moves stock between nurseries without changing the total", () => {
  const before = inventorySummary(state).currentStock;
  const moved = withTransactions([
    txn({
      transactionType: "TRANSFER_OUT",
      nurseryId: "NUR-KAPSABET",
      speciesId: "SP-PRUNUS",
      quantity: 300,
      direction: "OUT",
    }),
    txn({
      transactionType: "TRANSFER_IN",
      nurseryId: "NUR-KAPTAGAT",
      speciesId: "SP-PRUNUS",
      quantity: 300,
      direction: "IN",
    }),
  ]);
  assert.equal(inventorySummary(moved).currentStock, before);
  assert.equal(availableQuantity(moved, "NUR-KAPSABET", "SP-PRUNUS"), 900);
  assert.equal(availableQuantity(moved, "NUR-KAPTAGAT", "SP-PRUNUS"), 300);
});

test("adjustments are signed in the movement totals", () => {
  const adjusted = withTransactions([
    txn({
      transactionType: "ADJUSTMENT",
      nurseryId: "NUR-KAPSABET",
      speciesId: "SP-PRUNUS",
      quantity: 25,
      direction: "OUT",
      source: "Recount shortfall",
    }),
  ]);
  const row = aggregateStock(adjusted).find(
    (item) => item.nurseryId === "NUR-KAPSABET" && item.speciesId === "SP-PRUNUS",
  );
  assert.ok(row);
  assert.equal(row.movements.adjustment, -25);
  assert.equal(row.quantity, 1175);
});

test("reserving stock holds it without removing it", () => {
  const reserved = withTransactions([
    txn({
      transactionType: "RESERVED",
      nurseryId: "NUR-KAPSABET",
      speciesId: "SP-PRUNUS",
      quantity: 100,
      direction: "OUT",
    }),
  ]);
  const row = aggregateStock(reserved).find(
    (item) => item.nurseryId === "NUR-KAPSABET" && item.speciesId === "SP-PRUNUS",
  );
  assert.ok(row);
  assert.equal(row.movements.reserved, 100);
});

test("survival rate is calculated from the latest observation per site", () => {
  const stats = survivalStats(state);
  // PLT-0001 latest: 238/246, PLT-0002: 184/200, PLT-0003: 337/350, PLT-0004: not observed
  const expectedLatest = ((238 / 246) * 100 + (184 / 200) * 100 + (337 / 350) * 100) / 3;
  assert.equal(stats.latestRate, Math.round(expectedLatest * 10) / 10);
  assert.equal(stats.totalPlanted, 1110);
  assert.equal(stats.totalSurviving, 759);
});

test("an older observation never overrides a newer one", () => {
  const trend = survivalTrend(state);
  const chepterit = trend.find((point) => point.eventId === "PLT-0001");
  assert.ok(chepterit);
  assert.equal(chepterit.date, state.survivalObservations[1].date);
  assert.equal(chepterit.surviving, 238);
  assert.equal(trend.length, 3, "sites with no observation are not plotted");
});

test("summary sales value ignores cancelled sales", () => {
  const withCancelled: CfaState = {
    ...state,
    sales: [
      ...state.sales,
      {
        ...state.sales[0],
        id: "SALE-CANCELLED",
        quantity: 10,
        unitPrice: 1000,
        paymentStatus: "CANCELLED",
      },
    ],
  };
  assert.equal(
    inventorySummary(withCancelled).salesValue,
    inventorySummary(state).salesValue,
  );
});

test("monthly movement buckets by month and ignores archived entries", () => {
  const months = monthlyMovement(state);
  assert.ok(months.length > 0);
  for (let i = 1; i < months.length; i += 1) {
    assert.ok(months[i - 1].month < months[i].month, "months must be chronological");
  }
  const archived = monthlyMovement({
    ...state,
    transactions: state.transactions.map((item) => ({
      ...item,
      verificationStatus: "ARCHIVED" as const,
    })),
  });
  assert.equal(archived.length, 0);
});

test("sorting falls back to creation time within the same date", () => {
  const rows = sortByDateDesc([
    { id: "a", date: "2026-02-02", createdAt: "2026-02-02T09:00:00.000Z" },
    { id: "b", date: "2026-02-02", createdAt: "2026-02-02T11:00:00.000Z" },
    { id: "c", date: "2026-02-03", createdAt: "2026-02-03T08:00:00.000Z" },
  ]);
  assert.deepEqual(
    rows.map((row) => row.id),
    ["c", "b", "a"],
  );
});
