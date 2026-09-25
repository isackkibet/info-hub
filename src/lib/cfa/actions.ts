"use client";

import { directionFor, validatePosting } from "./inventory";
import { canVerifyOwnSubmission } from "./permissions";
import { getCfaState, nextId, nowIso, recordAudit, updateState } from "./store";
import type {
  Activity,
  ActivityType,
  BatchStatus,
  CfaRole,
  Donation,
  EntityType,
  Evidence,
  EvidenceKind,
  InventoryTransaction,
  Nursery,
  NurseryStatus,
  PlantingEvent,
  PlantingStatus,
  Program,
  Sale,
  Seedbed,
  SeedbedStatus,
  SeedBatch,
  Species,
  SurvivalObservation,
  TransactionType,
  Transfer,
  VerificationMethod,
  VerificationStatus,
  Visibility,
} from "./types";

export interface ActionResult {
  ok: boolean;
  error?: string;
  id?: string;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function hash(value: string) {
  let acc = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    acc ^= value.charCodeAt(i);
    acc = Math.imul(acc, 16777619);
  }
  return `sha256:${(acc >>> 0).toString(16).padStart(8, "0")}`;
}

export function setRole(role: CfaRole) {
  updateState((state) => ({ ...state, role }));
}

export function setCurrentUser(name: string) {
  updateState((state) => ({ ...state, currentUser: name }));
}

export function updateCfaProfile(patch: Partial<import("./types").CfaProfile>) {
  updateState((state) => ({
    ...state,
    cfa: { ...state.cfa, ...patch },
    auditLog: recordAudit(state, {
      event: "CFA_CREATED",
      entityType: "CFA",
      entityId: state.cfa.id,
      details: "CFA profile updated.",
    }),
  }));
}

export function addNursery(
  input: Omit<Nursery, "id" | "cfaId" | "status"> & { status?: NurseryStatus },
): ActionResult {
  const id = nextId("NUR");
  updateState((state) => ({
    ...state,
    nurseries: [
      ...state.nurseries,
      { ...input, id, cfaId: state.cfa.id, status: input.status ?? "PLANNED" },
    ],
    auditLog: recordAudit(state, {
      event: "NURSERY_CREATED",
      entityType: "NURSERY",
      entityId: id,
      details: `Nursery "${input.name}" created.`,
    }),
  }));
  return { ok: true, id };
}

export function setNurseryStatus(id: string, status: NurseryStatus) {
  updateState((state) => ({
    ...state,
    nurseries: state.nurseries.map((nursery) =>
      nursery.id === id ? { ...nursery, status } : nursery,
    ),
  }));
}

export function addSeedbed(
  input: Omit<Seedbed, "id" | "status"> & { status?: SeedbedStatus },
): ActionResult {
  const id = nextId("SB");
  updateState((state) => ({
    ...state,
    seedbeds: [
      ...state.seedbeds,
      { ...input, id, status: input.status ?? "PLANNED" },
    ],
    auditLog: recordAudit(state, {
      event: "SEEDBED_CREATED",
      entityType: "SEEDBED",
      entityId: id,
      details: `Seedbed "${input.name}" created.`,
    }),
  }));
  return { ok: true, id };
}

export function setSeedbedStatus(id: string, status: SeedbedStatus) {
  updateState((state) => ({
    ...state,
    seedbeds: state.seedbeds.map((bed) =>
      bed.id === id ? { ...bed, status } : bed,
    ),
  }));
}

export function addSpecies(input: Omit<Species, "id" | "isActive">): ActionResult {
  const duplicate = input.scientificName.trim().toLowerCase();
  const state = getCfaState();
  if (
    state.species.some(
      (species) => species.scientificName.trim().toLowerCase() === duplicate,
    )
  ) {
    return {
      ok: false,
      error: "A species with that scientific name already exists in the catalogue.",
    };
  }
  const id = nextId("SP");
  updateState((current) => ({
    ...current,
    species: [...current.species, { ...input, id, isActive: true }],
  }));
  return { ok: true, id };
}

export function setSpeciesActive(id: string, isActive: boolean) {
  updateState((state) => ({
    ...state,
    species: state.species.map((species) =>
      species.id === id ? { ...species, isActive } : species,
    ),
  }));
}

export function addSpeciesLocalName(id: string, localName: string) {
  const trimmed = localName.trim();
  if (!trimmed) return;
  updateState((state) => ({
    ...state,
    species: state.species.map((species) =>
      species.id === id && !species.localNames.includes(trimmed)
        ? { ...species, localNames: [...species.localNames, trimmed] }
        : species,
    ),
  }));
}

export function addBatch(
  input: Omit<SeedBatch, "id" | "status"> & { status?: BatchStatus },
): ActionResult {
  const id = nextId("BATCH");
  updateState((state) => ({
    ...state,
    batches: [
      ...state.batches,
      { ...input, id, status: input.status ?? "RECEIVED" },
    ],
    auditLog: recordAudit(state, {
      event: "BATCH_CREATED",
      entityType: "SEED_BATCH",
      entityId: id,
      details: `Seed batch for ${input.quantityAcquired} seeds recorded.`,
    }),
  }));
  return { ok: true, id };
}

export function setBatchStatus(id: string, status: BatchStatus) {
  updateState((state) => ({
    ...state,
    batches: state.batches.map((batch) =>
      batch.id === id ? { ...batch, status } : batch,
    ),
  }));
}

export interface TransactionInput {
  transactionType: TransactionType;
  nurseryId: string;
  speciesId: string;
  quantity: number;
  date: string;
  seedbedId?: string;
  seedBatchId?: string;
  programId?: string;
  source: string;
  destination?: string;
  notes?: string;
  relatedActivityId?: string;
  relatedEntityId?: string;
  verificationStatus?: VerificationStatus;
  direction?: "IN" | "OUT";
}

export function postTransaction(
  input: TransactionInput,
  actor: string,
): ActionResult {
  const direction = input.direction ?? directionFor(input.transactionType);
  const check = validatePosting(getCfaState(), {
    transactionType: input.transactionType,
    nurseryId: input.nurseryId,
    speciesId: input.speciesId,
    quantity: input.quantity,
    direction,
  });
  if (!check.ok) return { ok: false, error: check.error };

  const id = nextId("TX");
  const txn: InventoryTransaction = {
    id,
    transactionType: input.transactionType,
    nurseryId: input.nurseryId,
    speciesId: input.speciesId,
    quantity: input.quantity,
    direction,
    date: input.date || today(),
    source: input.source,
    recordedBy: actor,
    verificationStatus: input.verificationStatus ?? "SUBMITTED",
    createdAt: nowIso(),
    ...(input.seedbedId ? { seedbedId: input.seedbedId } : {}),
    ...(input.seedBatchId ? { seedBatchId: input.seedBatchId } : {}),
    ...(input.programId ? { programId: input.programId } : {}),
    ...(input.destination ? { destination: input.destination } : {}),
    ...(input.notes ? { notes: input.notes } : {}),
    ...(input.relatedActivityId
      ? { relatedActivityId: input.relatedActivityId }
      : {}),
    ...(input.relatedEntityId ? { relatedEntityId: input.relatedEntityId } : {}),
  };

  updateState((current) => ({
    ...current,
    transactions: [txn, ...current.transactions],
    auditLog:
      input.transactionType === "ADJUSTMENT"
        ? recordAudit(current, {
            event: "INVENTORY_ADJUSTED",
            entityType: "INVENTORY_TRANSACTION",
            entityId: id,
            details: `${direction} ${input.quantity} adjustment: ${input.source}`,
          })
        : current.auditLog,
  }));

  return { ok: true, id };
}

export function reverseTransaction(
  id: string,
  reason: string,
  actor: string,
): ActionResult {
  const original = getCfaState().transactions.find((txn) => txn.id === id);
  if (!original) return { ok: false, error: "Transaction not found." };

  const result = postTransaction(
    {
      transactionType: original.transactionType,
      nurseryId: original.nurseryId,
      speciesId: original.speciesId,
      quantity: original.quantity,
      date: today(),
      seedbedId: original.seedbedId,
      seedBatchId: original.seedBatchId,
      programId: original.programId,
      direction: original.direction === "IN" ? "OUT" : "IN",
      source: `Reversal of ${original.id}`,
      notes: reason,
      relatedEntityId: original.id,
    },
    actor,
  );

  if (result.ok) {
    updateState((current) => ({
      ...current,
      auditLog: recordAudit(current, {
        event: "INVENTORY_ADJUSTED",
        entityType: "INVENTORY_TRANSACTION",
        entityId: result.id ?? id,
        details: `Reversed ${original.id}: ${reason}`,
      }),
    }));
  }

  return result;
}

export function setTransactionStatus(
  id: string,
  verificationStatus: VerificationStatus,
) {
  updateState((state) => ({
    ...state,
    transactions: state.transactions.map((txn) =>
      txn.id === id ? { ...txn, verificationStatus } : txn,
    ),
  }));
}

const STOCK_EFFECT_TYPES: Partial<Record<ActivityType, TransactionType>> = {
  PROPAGATION: "PROPAGATION",
  MORTALITY: "MORTALITY",
};

export interface ActivityInput {
  activityType: ActivityType;
  nurseryId: string;
  speciesId?: string;
  seedbedId?: string;
  seedBatchId?: string;
  quantity: number;
  date: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
  programId?: string;
  asDraft?: boolean;
}

export function addActivity(
  input: ActivityInput,
  actor: string,
): ActionResult {
  const id = nextId("ACT");
  const now = nowIso();
  const activity: Activity = {
    id,
    activityType: input.activityType,
    nurseryId: input.nurseryId,
    quantity: input.quantity,
    date: input.date || today(),
    recordedBy: actor,
    status: input.asDraft ? "DRAFT" : "SUBMITTED",
    createdAt: now,
    updatedAt: now,
    ...(input.speciesId ? { speciesId: input.speciesId } : {}),
    ...(input.seedbedId ? { seedbedId: input.seedbedId } : {}),
    ...(input.seedBatchId ? { seedBatchId: input.seedBatchId } : {}),
    ...(input.notes ? { notes: input.notes } : {}),
    ...(input.latitude !== undefined ? { latitude: input.latitude } : {}),
    ...(input.longitude !== undefined ? { longitude: input.longitude } : {}),
    ...(input.programId ? { programId: input.programId } : {}),
  };

  updateState((state) => ({
    ...state,
    activities: [activity, ...state.activities],
    auditLog: recordAudit(state, {
      event: input.asDraft ? "ACTIVITY_CREATED" : "ACTIVITY_SUBMITTED",
      entityType: "ACTIVITY",
      entityId: id,
      details: `${input.activityType} of ${input.quantity} recorded.`,
    }),
  }));

  if (input.asDraft) return { ok: true, id };

  const stockType = STOCK_EFFECT_TYPES[input.activityType];
  if (!stockType || !input.speciesId) return { ok: true, id };

  const direction = directionFor(stockType);
  const validation = validatePosting(getCfaState(), {
      transactionType: stockType,
      nurseryId: input.nurseryId,
      speciesId: input.speciesId,
      quantity: input.quantity,
      direction,
    },
  );
  if (!validation.ok) return { ok: true, id };

  const txnResult = postTransaction(
    {
      transactionType: stockType,
      nurseryId: input.nurseryId,
      speciesId: input.speciesId,
      quantity: input.quantity,
      date: input.date || today(),
      seedbedId: input.seedbedId,
      seedBatchId: input.seedBatchId,
      programId: input.programId,
      direction,
      source: `${input.activityType} activity`,
      relatedActivityId: id,
    },
    actor,
  );

  return { ok: true, id: txnResult.id ?? id };
}

export function updateActivity(
  id: string,
  patch: Partial<ActivityInput>,
  actor: string,
): ActionResult {
  const existing = getCfaState().activities.find((activity) => activity.id === id);
  if (!existing) return { ok: false, error: "Activity not found." };
  if (existing.status === "VERIFIED") {
    return {
      ok: false,
      error: "Verified activities cannot be edited. Ask a verifier to request a correction.",
    };
  }
  if (existing.status === "SUBMITTED" || existing.status === "UNDER_REVIEW") {
    return {
      ok: false,
      error: "Submitted activities are locked until a verifier returns them.",
    };
  }

  updateState((current) => ({
    ...current,
    activities: current.activities.map((activity) =>
      activity.id === id
        ? {
            ...activity,
            ...patch,
            status: "SUBMITTED",
            updatedAt: nowIso(),
          }
        : activity,
    ),
    auditLog: recordAudit(current, {
      event: "ACTIVITY_EDITED",
      entityType: "ACTIVITY",
      entityId: id,
      details: `Activity updated by ${actor}.`,
    }),
  }));

  return { ok: true, id };
}

export function submitActivity(id: string): ActionResult {
  updateState((state) => ({
    ...state,
    activities: state.activities.map((activity) =>
      activity.id === id
        ? { ...activity, status: "SUBMITTED", updatedAt: nowIso() }
        : activity,
    ),
    auditLog: recordAudit(state, {
      event: "ACTIVITY_SUBMITTED",
      entityType: "ACTIVITY",
      entityId: id,
      details: "Activity submitted for verification.",
    }),
  }));
  return { ok: true, id };
}

export function discardDraft(id: string): ActionResult {
  updateState((state) => ({
    ...state,
    activities: state.activities
      .filter((activity) => activity.id !== id)
      .map((activity) => ({ ...activity })),
  }));
  return { ok: true, id };
}

export function addEvidence(
  entityType: EntityType,
  entityId: string,
  input: {
    kind: EvidenceKind;
    fileName: string;
    fileType: string;
    reference: string;
    captureDate: string;
    uploadedBy: string;
    visibility: Visibility;
    consentStatus: Evidence["consentStatus"];
    latitude?: number;
    longitude?: number;
  },
): ActionResult {
  const id = nextId("EVD");
  const evidence: Evidence = {
    id,
    entityType,
    entityId,
    kind: input.kind,
    fileName: input.fileName,
    fileType: input.fileType,
    reference: input.reference,
    contentHash: hash(`${input.reference}:${input.fileName}:${input.captureDate}`),
    uploadedBy: input.uploadedBy,
    captureDate: input.captureDate,
    visibility: input.visibility,
    consentStatus: input.consentStatus,
    verificationStatus: "SUBMITTED",
    createdAt: nowIso(),
    ...(input.latitude !== undefined ? { latitude: input.latitude } : {}),
    ...(input.longitude !== undefined ? { longitude: input.longitude } : {}),
  };

  updateState((state) => ({
    ...state,
    evidence: [evidence, ...state.evidence],
    auditLog: recordAudit(state, {
      event: "EVIDENCE_UPLOADED",
      entityType: entityType,
      entityId,
      details: `${input.kind} "${input.fileName}" attached to ${entityType} ${entityId}.`,
    }),
  }));

  return { ok: true, id };
}

export interface DecisionInput {
  decision: "APPROVED" | "REJECTED" | "CORRECTIONS_REQUESTED";
  method: VerificationMethod;
  notes: string;
  reviewer: string;
}

const DECISION_STATUS: Record<
  DecisionInput["decision"],
  VerificationStatus
> = {
  APPROVED: "VERIFIED",
  REJECTED: "REJECTED",
  CORRECTIONS_REQUESTED: "NEEDS_CORRECTION",
};

export function decideOnRecord(
  entityType: EntityType,
  entityId: string,
  input: DecisionInput,
): ActionResult {
  const state = getCfaState();
  const submittedBy = findSubmitter(state, entityType, entityId);
  if (!submittedBy) {
    return { ok: false, error: "Record not found." };
  }
  if (input.decision !== "APPROVED" && !input.notes.trim()) {
    return { ok: false, error: "A reason is required to reject or return a record." };
  }
  if (!canVerifyOwnSubmission(state.role, input.reviewer, submittedBy)) {
    return {
      ok: false,
      error: "You cannot verify your own submission.",
    };
  }

  const previousStatus = findStatus(state, entityType, entityId);
  const newStatus = DECISION_STATUS[input.decision];
  const verificationId = nextId("VER");
  const evidenceIds = state.evidence
    .filter((item) => item.entityType === entityType && item.entityId === entityId)
    .map((item) => item.id);

  updateState((current) => ({
    ...current,
    activities: current.activities.map((activity) =>
      entityType === "ACTIVITY" && activity.id === entityId
        ? { ...activity, status: newStatus, updatedAt: nowIso() }
        : activity,
    ),
    transactions: current.transactions.map((txn) =>
      entityType === "INVENTORY_TRANSACTION" && txn.id === entityId
        ? { ...txn, verificationStatus: newStatus }
        : txn.relatedActivityId === entityId &&
            txn.verificationStatus !== "VERIFIED"
          ? { ...txn, verificationStatus: newStatus }
          : txn,
    ),
    evidence: current.evidence.map((item) =>
      item.entityType === entityType && item.entityId === entityId
        ? { ...item, verificationStatus: newStatus }
        : item,
    ),
    verifications: [
      {
        id: verificationId,
        entityType,
        entityId,
        submittedBy,
        submittedAt: findSubmittedAt(current, entityType, entityId),
        reviewedBy: input.reviewer,
        reviewedAt: nowIso(),
        method: input.method,
        evidenceIds,
        notes: input.notes,
        decision: input.decision,
        previousStatus,
        newStatus,
      },
      ...current.verifications,
    ],
    auditLog: recordAudit(current, {
      event:
        input.decision === "APPROVED"
          ? "ACTIVITY_VERIFIED"
          : "ACTIVITY_REJECTED",
      entityType,
      entityId,
      details: `${input.decision.replace("_", " ").toLowerCase()} by ${input.reviewer} using ${input.method.toLowerCase().replace(/_/g, " ")}.`,
      actor: input.reviewer,
    }),
  }));

  return { ok: true, id: verificationId };
}

function findSubmitter(
  state: import("./types").CfaState,
  entityType: EntityType,
  entityId: string,
): string | undefined {
  switch (entityType) {
    case "ACTIVITY":
      return state.activities.find((a) => a.id === entityId)?.recordedBy;
    case "INVENTORY_TRANSACTION":
      return state.transactions.find((t) => t.id === entityId)?.recordedBy;
    case "SALE":
      return state.sales.find((s) => s.id === entityId)?.recordedBy;
    case "DONATION":
      return state.donations.find((d) => d.id === entityId)?.recordedBy;
    case "TRANSFER":
      return state.transfers.find((t) => t.id === entityId)?.senderName;
    case "PLANTING_EVENT":
      return state.plantingEvents.find((p) => p.id === entityId)?.recordedBy;
    default:
      return undefined;
  }
}

function findSubmittedAt(
  state: import("./types").CfaState,
  entityType: EntityType,
  entityId: string,
): string {
  const prior = state.verifications.find(
    (v) => v.entityType === entityType && v.entityId === entityId,
  );
  if (prior) return prior.submittedAt;
  switch (entityType) {
    case "ACTIVITY":
      return state.activities.find((a) => a.id === entityId)?.createdAt ?? nowIso();
    case "INVENTORY_TRANSACTION":
      return (
        state.transactions.find((t) => t.id === entityId)?.createdAt ?? nowIso()
      );
    case "SALE":
      return state.sales.find((s) => s.id === entityId)?.createdAt ?? nowIso();
    case "DONATION":
      return (
        state.donations.find((d) => d.id === entityId)?.createdAt ?? nowIso()
      );
    case "TRANSFER":
      return (
        state.transfers.find((t) => t.id === entityId)?.createdAt ?? nowIso()
      );
    case "PLANTING_EVENT":
      return (
        state.plantingEvents.find((p) => p.id === entityId)?.createdAt ?? nowIso()
      );
    default:
      return nowIso();
  }
}

function findStatus(
  state: import("./types").CfaState,
  entityType: EntityType,
  entityId: string,
): VerificationStatus {
  if (entityType === "ACTIVITY") {
    return state.activities.find((a) => a.id === entityId)?.status ?? "SUBMITTED";
  }
  if (entityType === "INVENTORY_TRANSACTION") {
    return (
      state.transactions.find((t) => t.id === entityId)?.verificationStatus ??
      "SUBMITTED"
    );
  }
  const linkedActivityId = state.transactions.find(
    (t) => t.relatedEntityId === entityId,
  )?.relatedActivityId;
  return (
    state.activities.find((a) => a.id === linkedActivityId)?.status ?? "SUBMITTED"
  );
}

export function addSale(input: Omit<Sale, "id" | "createdAt">, actor: string): ActionResult {
  if (!input.buyerName.trim()) {
    return { ok: false, error: "A sale needs buyer information." };
  }
  const id = nextId("SALE");
  const sale: Sale = { ...input, id, createdAt: nowIso() };

  const activityId = nextId("ACT");
  const activity: Activity = {
    id: activityId,
    activityType: "SALE",
    nurseryId: sale.nurseryId,
    speciesId: sale.speciesId,
    quantity: sale.quantity,
    date: sale.date,
    recordedBy: actor,
    status: "SUBMITTED",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    ...(sale.seedBatchId ? { seedBatchId: sale.seedBatchId } : {}),
    ...(sale.programId ? { programId: sale.programId } : {}),
    ...(sale.notes ? { notes: sale.notes } : {}),
  };

  updateState((state) => ({
    ...state,
    sales: [sale, ...state.sales],
    activities: [activity, ...state.activities],
    auditLog: recordAudit(state, {
      event: "ACTIVITY_SUBMITTED",
      entityType: "SALE",
      entityId: id,
      details: `Sale of ${sale.quantity} seedlings to ${sale.buyerName}.`,
    }),
  }));

  const txn = postTransaction(
    {
      transactionType: "SALE",
      nurseryId: sale.nurseryId,
      speciesId: sale.speciesId,
      seedBatchId: sale.seedBatchId,
      quantity: sale.quantity,
      date: sale.date,
      direction: "OUT",
      source: `Sale to ${sale.buyerName}`,
      destination: sale.destination,
      programId: sale.programId,
      relatedActivityId: activityId,
      relatedEntityId: id,
      notes: sale.notes,
    },
    actor,
  );

  if (!txn.ok) return txn;
  return { ok: true, id };
}

export function setPaymentStatus(id: string, paymentStatus: Sale["paymentStatus"]) {
  updateState((state) => ({
    ...state,
    sales: state.sales.map((sale) =>
      sale.id === id ? { ...sale, paymentStatus } : sale,
    ),
  }));
}

export function addDonation(
  input: Omit<Donation, "id" | "createdAt">,
  actor: string,
): ActionResult {
  if (!input.recipientName.trim()) {
    return { ok: false, error: "A donation needs a named recipient." };
  }
  const id = nextId("DON");
  const donation: Donation = { ...input, id, createdAt: nowIso() };

  const activityId = nextId("ACT");
  const activity: Activity = {
    id: activityId,
    activityType: "DONATION",
    nurseryId: donation.nurseryId,
    speciesId: donation.speciesId,
    quantity: donation.quantity,
    date: donation.date,
    recordedBy: actor,
    status: "SUBMITTED",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    ...(donation.seedBatchId ? { seedBatchId: donation.seedBatchId } : {}),
    ...(donation.programId ? { programId: donation.programId } : {}),
    ...(donation.notes ? { notes: donation.notes } : {}),
  };

  updateState((state) => ({
    ...state,
    donations: [donation, ...state.donations],
    activities: [activity, ...state.activities],
    auditLog: recordAudit(state, {
      event: "ACTIVITY_SUBMITTED",
      entityType: "DONATION",
      entityId: id,
      details: `Donation of ${donation.quantity} seedlings to ${donation.recipientName}.`,
    }),
  }));

  const txn = postTransaction(
    {
      transactionType: "DONATION",
      nurseryId: donation.nurseryId,
      speciesId: donation.speciesId,
      seedBatchId: donation.seedBatchId,
      quantity: donation.quantity,
      date: donation.date,
      direction: "OUT",
      source: `Donation to ${donation.recipientName}`,
      destination: donation.plantingLocation,
      programId: donation.programId,
      relatedActivityId: activityId,
      relatedEntityId: id,
      notes: donation.notes,
    },
    actor,
  );

  if (!txn.ok) return txn;
  return { ok: true, id };
}

export function addTransfer(input: Omit<Transfer, "id" | "createdAt">): ActionResult {
  if (input.sourceNurseryId === input.destinationNurseryId && !input.destinationSeedbedId && !input.destinationProject) {
    return {
      ok: false,
      error: "A transfer must identify a destination bed, project, or another nursery.",
    };
  }
  const id = nextId("TRF");
  const transfer: Transfer = { ...input, id, createdAt: nowIso() };

  updateState((state) => ({
    ...state,
    transfers: [transfer, ...state.transfers],
    auditLog: recordAudit(state, {
      event: "ACTIVITY_SUBMITTED",
      entityType: "TRANSFER",
      entityId: id,
      details: `Transfer of ${transfer.quantity} seedlings recorded.`,
    }),
  }));

  const out = postTransaction(
    {
      transactionType: "TRANSFER_OUT",
      nurseryId: transfer.sourceNurseryId,
      seedbedId: transfer.sourceSeedbedId,
      speciesId: transfer.speciesId,
      seedBatchId: transfer.seedBatchId,
      quantity: transfer.quantity,
      date: transfer.date,
      direction: "OUT",
      source: "Transfer out",
      destination: transfer.destinationProject ?? "Destination nursery",
      relatedEntityId: id,
      notes: transfer.reason,
    },
    transfer.senderName,
  );

  if (!out.ok) return out;

  const inResult = postTransaction(
    {
      transactionType: "TRANSFER_IN",
      nurseryId: transfer.destinationNurseryId,
      seedbedId: transfer.destinationSeedbedId,
      speciesId: transfer.speciesId,
      seedBatchId: transfer.seedBatchId,
      quantity: transfer.quantity,
      date: transfer.date,
      direction: "IN",
      source: "Transfer in",
      destination: transfer.receiverName,
      relatedEntityId: id,
      notes: transfer.reason,
    },
    transfer.receiverName,
  );

  if (!inResult.ok) return inResult;
  return { ok: true, id };
}

export function addPlantingEvent(
  input: Omit<PlantingEvent, "id" | "createdAt" | "status">,
  actor: string,
): ActionResult {
  const id = nextId("PLT");
  const event: PlantingEvent = {
    ...input,
    id,
    status: "IN_PROGRESS",
    createdAt: nowIso(),
  };

  const activityId = nextId("ACT");
  const activity: Activity = {
    id: activityId,
    activityType: "PLANTING",
    nurseryId: event.nurseryId,
    speciesId: event.speciesId,
    quantity: event.quantityPlanted,
    date: event.date,
    recordedBy: actor,
    status: "SUBMITTED",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    ...(event.seedBatchId ? { seedBatchId: event.seedBatchId } : {}),
    ...(event.programId ? { programId: event.programId } : {}),
    ...(event.siteDescription ? { notes: event.siteDescription } : {}),
  };

  updateState((state) => ({
    ...state,
    plantingEvents: [event, ...state.plantingEvents],
    activities: [activity, ...state.activities],
    auditLog: recordAudit(state, {
      event: "ACTIVITY_SUBMITTED",
      entityType: "PLANTING_EVENT",
      entityId: id,
      details: `${event.quantityPlanted} seedlings planted at ${event.siteName}.`,
    }),
  }));

  const txn = postTransaction(
    {
      transactionType: "PLANTING",
      nurseryId: event.nurseryId,
      speciesId: event.speciesId,
      seedBatchId: event.seedBatchId,
      quantity: event.quantityPlanted,
      date: event.date,
      direction: "OUT",
      source: `Planting at ${event.siteName}`,
      destination: event.siteName,
      programId: event.programId,
      relatedActivityId: activityId,
      relatedEntityId: id,
    },
    actor,
  );

  if (!txn.ok) return txn;
  return { ok: true, id };
}

export function setPlantingStatus(id: string, status: PlantingStatus) {
  updateState((state) => ({
    ...state,
    plantingEvents: state.plantingEvents.map((event) =>
      event.id === id ? { ...event, status } : event,
    ),
  }));
}

export function addSurvivalObservation(
  input: Omit<SurvivalObservation, "id" | "createdAt">,
): ActionResult {
  if (input.surviving + input.dead + input.missing > input.assessed) {
    return {
      ok: false,
      error: "Surviving, dead and missing cannot add up to more than the number assessed.",
    };
  }
  const id = nextId("OBS");
  const observation: SurvivalObservation = { ...input, id, createdAt: nowIso() };

  updateState((state) => ({
    ...state,
    survivalObservations: [observation, ...state.survivalObservations],
  }));

  return { ok: true, id };
}

export function addProgram(input: Omit<Program, "id" | "status">): ActionResult {
  const id = nextId("PROG");
  updateState((state) => ({
    ...state,
    programs: [...state.programs, { ...input, id, status: "PLANNING" }],
  }));
  return { ok: true, id };
}

export function setProgramStatus(id: string, status: Program["status"]) {
  updateState((state) => ({
    ...state,
    programs: state.programs.map((program) =>
      program.id === id ? { ...program, status } : program,
    ),
  }));
}
