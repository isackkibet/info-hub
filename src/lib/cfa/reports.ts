import { aggregateStock, sortByDateDesc, survivalTrend } from "./inventory";
import type { CfaState } from "./types";
import {
  ActivityTypeLabels,
  NurseryStatusLabels,
  PaymentStatusLabels,
  ProgramStatusLabels,
  SpeciesCategoryLabels,
  SpeciesUseLabels,
  TransactionTypeLabels,
  VerificationStatusLabels,
} from "./types";

export type ReportKey =
  | "PRODUCTION"
  | "SPECIES"
  | "MONTHLY"
  | "IMPACT"
  | "VERIFICATION";

export interface ReportDefinition {
  key: ReportKey;
  title: string;
  description: string;
  columns: string[];
  rows: (string | number)[][];
  json: Record<string, unknown>;
}

function isoDay() {
  return new Date().toISOString().slice(0, 10);
}

export function buildReports(state: CfaState): Record<ReportKey, ReportDefinition> {
  return {
    PRODUCTION: productionReport(state),
    SPECIES: speciesReport(state),
    MONTHLY: monthlyReport(state),
    IMPACT: impactReport(state),
    VERIFICATION: verificationReport(state),
  };
}

function meta(state: CfaState) {
  return {
    cfa: state.cfa.name,
    registrationNumber: state.cfa.registrationNumber,
    reportingPeriod: `${isoDay()}`,
    generatedAt: new Date().toISOString(),
    dataSource: "KAI CFA nursery inventory ledger (local preview data)",
    methodology:
      "Stock is calculated from posted inventory transactions only. No stock figure is typed in by hand.",
  };
}

function productionReport(state: CfaState): ReportDefinition {
  const rows = aggregateStock(state).map((row) => {
    const nursery = state.nurseries.find((n) => n.id === row.nurseryId);
    const species = state.species.find((s) => s.id === row.speciesId);
    return [
      nursery?.name ?? row.nurseryId,
      nursery ? NurseryStatusLabels[nursery.status] : "Unknown",
      species?.commonName ?? row.speciesId,
      species?.scientificName ?? "",
      row.movements.opening,
      row.movements.propagation,
      row.movements.acquisition,
      row.movements.transferIn,
      row.movements.mortality,
      row.movements.sale,
      row.movements.donation,
      row.movements.planting,
      row.movements.transferOut,
      row.movements.adjustment,
      row.quantity,
    ];
  });

  return {
    key: "PRODUCTION",
    title: "Nursery production report",
    description:
      "Per nursery and species: opening stock, production, losses, movement, and closing stock.",
    columns: [
      "Nursery",
      "Nursery status",
      "Species",
      "Scientific name",
      "Opening",
      "Propagated",
      "Acquired",
      "Transferred in",
      "Mortality",
      "Sold",
      "Donated",
      "Planted",
      "Transferred out",
      "Adjustments",
      "Closing stock",
    ],
    rows,
    json: { ...meta(state), report: "PRODUCTION", lines: rows },
  };
}

function speciesReport(state: CfaState): ReportDefinition {
  const grouped = new Map<
    string,
    {
      commonName: string;
      scientificName: string;
      category: string;
      use: string;
      produced: number;
      planted: number;
      sold: number;
      donated: number;
      dead: number;
      stock: number;
    }
  >();

  for (const row of aggregateStock(state)) {
    const species = state.species.find((s) => s.id === row.speciesId);
    if (!species) continue;
    const entry = grouped.get(species.id) ?? {
      commonName: species.commonName,
      scientificName: species.scientificName,
      category: SpeciesCategoryLabels[species.category],
      use: SpeciesUseLabels[species.use],
      produced: 0,
      planted: 0,
      sold: 0,
      donated: 0,
      dead: 0,
      stock: 0,
    };
    entry.produced +=
      row.movements.opening + row.movements.propagation + row.movements.acquisition;
    entry.planted += row.movements.planting;
    entry.sold += row.movements.sale;
    entry.donated += row.movements.donation;
    entry.dead += row.movements.mortality;
    entry.stock += row.quantity;
    grouped.set(species.id, entry);
  }

  const rows = [...grouped.values()].map((entry) => [
    entry.commonName,
    entry.scientificName,
    entry.category,
    entry.use,
    entry.produced,
    entry.sold,
    entry.donated,
    entry.planted,
    entry.dead,
    entry.stock,
  ]);

  return {
    key: "SPECIES",
    title: "Species report",
    description: "Produced, moved, lost, and remaining for every species in the catalogue.",
    columns: [
      "Species",
      "Scientific name",
      "Category",
      "Use",
      "Produced",
      "Sold",
      "Donated",
      "Planted",
      "Dead",
      "Current stock",
    ],
    rows,
    json: { ...meta(state), report: "SPECIES", lines: rows },
  };
}

function monthlyReport(state: CfaState): ReportDefinition {
  const months = new Map<string, number[]>();
  for (const txn of state.transactions) {
    const month = txn.date.slice(0, 7);
    const entry = months.get(month) ?? [0, 0, 0, 0, 0, 0, 0];
    const signed = txn.direction === "IN" ? txn.quantity : -txn.quantity;
    if (txn.transactionType === "PROPAGATION") entry[0] += txn.quantity;
    if (txn.transactionType === "SALE") entry[1] += txn.quantity;
    if (txn.transactionType === "DONATION") entry[2] += txn.quantity;
    if (txn.transactionType === "PLANTING") entry[3] += txn.quantity;
    if (txn.transactionType === "MORTALITY") entry[4] += txn.quantity;
    entry[5] += signed;
    entry[6] += txn.verificationStatus === "VERIFIED" ? 1 : 0;
    months.set(month, entry);
  }

  const rows = [...months.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, values]) => [
      month,
      values[0],
      values[1],
      values[2],
      values[3],
      values[4],
      values[5],
      values[6],
    ]);

  return {
    key: "MONTHLY",
    title: "Monthly activity report",
    description:
      "Seedlings propagated, moved, planted, and lost per month, with net movement and verified entries.",
    columns: [
      "Month",
      "Propagated",
      "Sold",
      "Donated",
      "Planted",
      "Mortality",
      "Net movement",
      "Verified transactions",
    ],
    rows,
    json: { ...meta(state), report: "MONTHLY", lines: rows },
  };
}

function impactReport(state: CfaState): ReportDefinition {
  const stock = aggregateStock(state);
  const produced = stock.reduce(
    (sum, row) =>
      sum + row.movements.opening + row.movements.propagation + row.movements.acquisition,
    0,
  );
  const planted = stock.reduce((sum, row) => sum + row.movements.planting, 0);
  const surviving = state.survivalObservations
    .filter((obs) => {
      const siblings = state.survivalObservations.filter(
        (item) => item.plantingEventId === obs.plantingEventId,
      );
      return (
        siblings.every((item) => item.date <= obs.date) &&
        siblings.some((item) => item.date === obs.date)
      );
    })
    .reduce((sum, obs) => sum + obs.surviving, 0);

  const verified = state.activities.filter(
    (activity) => activity.status === "VERIFIED",
  ).length;
  const withEvidence = new Set(state.evidence.map((item) => item.entityId)).size;
  const withGps = state.activities.filter(
    (activity) => activity.latitude !== undefined,
  ).length;

  const rows: (string | number)[][] = [
    ["Seedlings produced (opening + propagated + acquired)", produced],
    ["Seedlings planted", planted],
    ["Seedlings surviving (latest observation per site)", surviving],
    ["Overall survival rate (%)", planted > 0 ? Math.round((surviving / planted) * 1000) / 10 : 0],
    ["Species tracked", new Set(stock.map((row) => row.speciesId)).size],
    ["Planting sites", state.plantingEvents.length],
    ["Participating recorders", new Set(state.activities.map((a) => a.recordedBy)).size],
    ["Verified activities", verified],
    ["Records carrying evidence", withEvidence],
    ["Activities captured with GPS", withGps],
    ["Nurseries reporting", state.nurseries.length],
    ["Programs linked", state.programs.length],
  ];

  return {
    key: "IMPACT",
    title: "Conservation impact report",
    description:
      "What the CFA has produced, planted, and kept alive, and how much of it is evidenced.",
    columns: ["Measure", "Value"],
    rows,
    json: { ...meta(state), report: "IMPACT", measures: Object.fromEntries(rows) },
  };
}

function verificationReport(state: CfaState): ReportDefinition {
  const statuses = [
    "SUBMITTED",
    "UNDER_REVIEW",
    "VERIFIED",
    "REJECTED",
    "NEEDS_CORRECTION",
    "DISPUTED",
  ] as const;

  const counts = statuses.map(
    (status) =>
      [
        VerificationStatusLabels[status],
        state.activities.filter((activity) => activity.status === status).length,
      ] as [string, number],
  );

  const reviewed = state.verifications.filter((item) => item.reviewedAt);
  const totalHours = reviewed.reduce((sum, item) => {
    const start = new Date(item.submittedAt).getTime();
    const end = new Date(item.reviewedAt as string).getTime();
    return sum + Math.max(0, end - start);
  }, 0);

  const verifiers = new Set(
    state.verifications.map((item) => item.reviewedBy).filter(Boolean),
  );

  const rows: (string | number)[][] = [
    ...counts,
    ["Total activities", state.activities.length],
    ["Drafts", state.activities.filter((a) => a.status === "DRAFT").length],
    ["Evidence items", state.evidence.length],
    ["Decisions recorded", state.verifications.length],
    [
      "Average time to verify (hours)",
      reviewed.length > 0
        ? Math.round((totalHours / reviewed.length / 3600000) * 10) / 10
        : 0,
    ],
    ["Active verifiers", verifiers.size],
  ];

  return {
    key: "VERIFICATION",
    title: "Verification report",
    description:
      "Submission counts by status, evidence coverage, and how long verification takes.",
    columns: ["Measure", "Value"],
    rows,
    json: { ...meta(state), report: "VERIFICATION", measures: Object.fromEntries(rows) },
  };
}

export function transactionExport(state: CfaState) {
  const rows = sortByDateDesc(state.transactions).map((txn) => [
    txn.id,
    txn.date,
    TransactionTypeLabels[txn.transactionType],
    txn.direction,
    txn.quantity,
    state.nurseries.find((n) => n.id === txn.nurseryId)?.name ?? txn.nurseryId,
    state.species.find((s) => s.id === txn.speciesId)?.commonName ?? txn.speciesId,
    txn.source,
    txn.destination ?? "",
    txn.recordedBy,
    VerificationStatusLabels[txn.verificationStatus],
  ]);

  return {
    columns: [
      "Transaction ID",
      "Date",
      "Type",
      "Direction",
      "Quantity",
      "Nursery",
      "Species",
      "Source",
      "Destination",
      "Recorded by",
      "Verification",
    ],
    rows,
  };
}

export function activityExport(state: CfaState) {
  const rows = sortByDateDesc(state.activities).map((activity) => [
    activity.id,
    activity.date,
    ActivityTypeLabels[activity.activityType],
    activity.quantity,
    state.nurseries.find((n) => n.id === activity.nurseryId)?.name ?? activity.nurseryId,
    state.species.find((s) => s.id === activity.speciesId)?.commonName ?? "",
    activity.recordedBy,
    VerificationStatusLabels[activity.status],
    activity.notes ?? "",
  ]);

  return {
    columns: [
      "Activity ID",
      "Date",
      "Type",
      "Quantity",
      "Nursery",
      "Species",
      "Recorded by",
      "Verification",
      "Notes",
    ],
    rows,
  };
}

export function survivalTrendExport(state: CfaState) {
  const rows = survivalTrend(state).map((point) => [
    point.eventId,
    point.eventLabel,
    point.date,
    point.assessed,
    point.surviving,
    point.rate,
  ]);

  return {
    columns: [
      "Planting event",
      "Site",
      "Observation date",
      "Assessed",
      "Surviving",
      "Survival rate (%)",
    ],
    rows,
  };
}

export function salesExport(state: CfaState) {
  const rows = sortByDateDesc(state.sales).map((sale) => [
    sale.id,
    sale.date,
    sale.buyerName,
    state.species.find((s) => s.id === sale.speciesId)?.commonName ?? "",
    sale.quantity,
    sale.unitPrice,
    sale.currency,
    sale.quantity * sale.unitPrice,
    PaymentStatusLabels[sale.paymentStatus],
    sale.destination,
  ]);

  return {
    columns: [
      "Sale ID",
      "Date",
      "Buyer",
      "Species",
      "Quantity",
      "Unit price",
      "Currency",
      "Total",
      "Payment",
      "Destination",
    ],
    rows,
  };
}

export function programsExport(state: CfaState) {
  const rows = state.programs.map((program) => [
    program.id,
    program.name,
    program.organisation,
    program.programType,
    program.startDate,
    program.endDate ?? "",
    ProgramStatusLabels[program.status],
    program.isPublic ? "Public" : "CFA only",
    program.contactName,
  ]);

  return {
    columns: [
      "Program ID",
      "Name",
      "Organisation",
      "Type",
      "Start",
      "End",
      "Status",
      "Visibility",
      "Contact",
    ],
    rows,
  };
}
