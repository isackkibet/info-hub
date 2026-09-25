import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import "./helpers/browser";
import { getCfaState, resetCfaData } from "../store";
import * as actions from "../actions";
import { availableQuantity } from "../inventory";
import type { CfaState } from "../types";

const NURSERY = "NUR-KAPSABET";
const OTHER_NURSERY = "NUR-KAPTAGAT";
const SPECIES = "SP-PRUNUS";
const RECORDER = "Achieng";

let state: CfaState;

beforeEach(() => {
  resetCfaData();
  actions.setCurrentUser(RECORDER);
  state = getCfaState();
});

function sale(quantity: number, buyer = "Test buyer") {
  return actions.addSale(
    {
      nurseryId: NURSERY,
      speciesId: SPECIES,
      quantity,
      date: "2026-03-01",
      buyerName: buyer,
      unitPrice: 100,
      currency: "KES",
      paymentStatus: "PENDING",
      purpose: "Test",
      destination: "Test plot",
      recordedBy: RECORDER,
    },
    RECORDER,
  );
}

test("a valid sale writes one sale, one activity and one linked transaction", () => {
  const before = availableQuantity(getCfaState(), NURSERY, SPECIES);
  const result = sale(200);
  assert.equal(result.ok, true);

  const after = getCfaState();
  assert.equal(after.sales.length, state.sales.length + 1);
  assert.equal(after.activities.length, state.activities.length + 1);
  assert.equal(after.transactions.length, state.transactions.length + 1);
  assert.equal(availableQuantity(after, NURSERY, SPECIES), before - 200);

  const saleId = result.id as string;
  const linked = after.transactions.filter((txn) => txn.relatedEntityId === saleId);
  assert.equal(linked.length, 1);
  assert.equal(linked[0].transactionType, "SALE");
  assert.equal(linked[0].direction, "OUT");
  assert.equal(linked[0].quantity, 200);
  assert.equal(linked[0].verificationStatus, "SUBMITTED");
});

test("an oversell is rejected and leaves no partial record behind", () => {
  const available = availableQuantity(getCfaState(), NURSERY, SPECIES);
  const result = sale(available + 1);
  assert.equal(result.ok, false);
  assert.match(result.error ?? "", /Only .* in stock/);

  const after = getCfaState();
  assert.equal(after.sales.length, state.sales.length, "no sale row");
  assert.equal(after.activities.length, state.activities.length, "no activity row");
  assert.equal(after.transactions.length, state.transactions.length, "no transaction");
  assert.equal(availableQuantity(after, NURSERY, SPECIES), available);
});

test("a donation that would oversell is rejected atomically", () => {
  const available = availableQuantity(getCfaState(), NURSERY, SPECIES);
  const result = actions.addDonation(
    {
      nurseryId: NURSERY,
      speciesId: SPECIES,
      quantity: available + 500,
      date: "2026-03-01",
      recipientName: "Chepterit Primary",
      purpose: "Shade trees",
      plantingLocation: "School compound",
      recordedBy: RECORDER,
    },
    RECORDER,
  );
  assert.equal(result.ok, false);
  const after = getCfaState();
  assert.equal(after.donations.length, state.donations.length);
  assert.equal(after.transactions.length, state.transactions.length);
});

test("a transfer posts a matched outgoing and incoming entry", () => {
  const sourceBefore = availableQuantity(getCfaState(), NURSERY, SPECIES);
  const destinationBefore = availableQuantity(getCfaState(), OTHER_NURSERY, SPECIES);

  const result = actions.addTransfer({
    sourceNurseryId: NURSERY,
    destinationNurseryId: OTHER_NURSERY,
    destinationProject: "Kaptagat woodlot",
    speciesId: SPECIES,
    quantity: 150,
    date: "2026-03-02",
    reason: "Woodlot restock",
    senderName: RECORDER,
    receiverName: "Kiptoo",
  });
  assert.equal(result.ok, true);

  const after = getCfaState();
  assert.equal(availableQuantity(after, NURSERY, SPECIES), sourceBefore - 150);
  assert.equal(
    availableQuantity(after, OTHER_NURSERY, SPECIES),
    destinationBefore + 150,
  );

  const transferId = result.id as string;
  const paired = after.transactions.filter((txn) => txn.relatedEntityId === transferId);
  assert.equal(paired.length, 2);
  assert.deepEqual(
    paired.map((txn) => txn.transactionType).sort(),
    ["TRANSFER_IN", "TRANSFER_OUT"],
  );
  assert.equal(paired[0].quantity, paired[1].quantity);
});

test("a transfer larger than source stock writes nothing", () => {
  const available = availableQuantity(getCfaState(), NURSERY, SPECIES);
  const result = actions.addTransfer({
    sourceNurseryId: NURSERY,
    destinationNurseryId: OTHER_NURSERY,
    speciesId: SPECIES,
    quantity: available + 1,
    date: "2026-03-02",
    reason: "Too much",
    senderName: RECORDER,
    receiverName: "Kiptoo",
  });
  assert.equal(result.ok, false);
  const after = getCfaState();
  assert.equal(after.transfers.length, state.transfers.length);
  assert.equal(after.transactions.length, state.transactions.length);
  assert.equal(availableQuantity(after, NURSERY, SPECIES), available);
});

test("a transfer to the same nursery needs a named destination", () => {
  const result = actions.addTransfer({
    sourceNurseryId: NURSERY,
    destinationNurseryId: NURSERY,
    speciesId: SPECIES,
    quantity: 10,
    date: "2026-03-02",
    reason: "Rearranging",
    senderName: RECORDER,
    receiverName: RECORDER,
  });
  assert.equal(result.ok, false);
  assert.match(result.error ?? "", /destination bed, project, or another nursery/);
});

test("a transfer from and to the same bed is rejected", () => {
  const result = actions.addTransfer({
    sourceNurseryId: NURSERY,
    sourceSeedbedId: "SB-KC-A",
    destinationNurseryId: NURSERY,
    destinationSeedbedId: "SB-KC-A",
    speciesId: SPECIES,
    quantity: 10,
    date: "2026-03-02",
    reason: "No-op",
    senderName: RECORDER,
    receiverName: RECORDER,
  });
  assert.equal(result.ok, false);
});

test("a planting event removes stock and links the activity", () => {
  const before = availableQuantity(getCfaState(), NURSERY, SPECIES);
  const result = actions.addPlantingEvent(
    {
      nurseryId: NURSERY,
      speciesId: SPECIES,
      quantityPlanted: 100,
      date: "2026-03-03",
      siteName: "Chepterit north",
      siteDescription: "Mixed boundary planting",
      responsibleGroup: "Chepterit Youth Group",
      landowner: "Chepterit Forest Owners",
      recordedBy: RECORDER,
    },
    RECORDER,
  );
  assert.equal(result.ok, true);

  const after = getCfaState();
  assert.equal(availableQuantity(after, NURSERY, SPECIES), before - 100);
  const event = after.plantingEvents.find((item) => item.id === result.id);
  assert.ok(event);
  assert.equal(event.status, "IN_PROGRESS");

  const linked = after.transactions.filter((txn) => txn.relatedEntityId === event.id);
  assert.equal(linked.length, 1);
  assert.equal(linked[0].transactionType, "PLANTING");
});

test("a planting event beyond available stock is rejected atomically", () => {
  const available = availableQuantity(getCfaState(), NURSERY, SPECIES);
  const result = actions.addPlantingEvent(
    {
      nurseryId: NURSERY,
      speciesId: SPECIES,
      quantityPlanted: available + 1,
      date: "2026-03-03",
      siteName: "Impossible site",
      siteDescription: "",
      responsibleGroup: "",
      landowner: "",
      recordedBy: RECORDER,
    },
    RECORDER,
  );
  assert.equal(result.ok, false);
  const after = getCfaState();
  assert.equal(after.plantingEvents.length, state.plantingEvents.length);
  assert.equal(after.transactions.length, state.transactions.length);
});

test("a mortality activity is rejected when it exceeds stock, and no activity is left", () => {
  const available = availableQuantity(getCfaState(), NURSERY, SPECIES);
  const result = actions.addActivity(
    {
      activityType: "MORTALITY",
      nurseryId: NURSERY,
      speciesId: SPECIES,
      quantity: available + 10,
      date: "2026-03-04",
    },
    RECORDER,
  );
  assert.equal(result.ok, false);
  assert.equal(getCfaState().activities.length, state.activities.length);
});

test("a propagation activity adds stock exactly once", () => {
  const before = availableQuantity(getCfaState(), NURSERY, SPECIES);
  const result = actions.addActivity(
    {
      activityType: "PROPAGATION",
      nurseryId: NURSERY,
      speciesId: SPECIES,
      seedbedId: "SB-KC-B",
      quantity: 75,
      date: "2026-03-05",
    },
    RECORDER,
  );
  assert.equal(result.ok, true);
  const after = getCfaState();
  assert.equal(availableQuantity(after, NURSERY, SPECIES), before + 75);
  const activity = after.activities.find((item) => item.id === result.id);
  assert.equal(
    after.transactions.filter((txn) => txn.relatedActivityId === activity?.id).length,
    1,
  );
});

test("a draft activity does not touch stock until it is submitted", () => {
  const before = availableQuantity(getCfaState(), NURSERY, SPECIES);
  const draft = actions.addActivity(
    {
      activityType: "PROPAGATION",
      nurseryId: NURSERY,
      speciesId: SPECIES,
      quantity: 500,
      date: "2026-03-06",
      asDraft: true,
    },
    RECORDER,
  );
  assert.equal(draft.ok, true);
  assert.equal(getCfaState().activities[0].status, "DRAFT");
  assert.equal(availableQuantity(getCfaState(), NURSERY, SPECIES), before);
});

test("a verified activity cannot be edited and a submitted one is locked", () => {
  const verified = getCfaState().activities.find((item) => item.status === "VERIFIED");
  assert.ok(verified);
  const editVerified = actions.updateActivity(verified.id, { quantity: 1 }, RECORDER);
  assert.equal(editVerified.ok, false);
  assert.match(editVerified.error ?? "", /cannot be edited/);

  const submitted = getCfaState().activities.find((item) => item.status === "SUBMITTED");
  assert.ok(submitted);
  const editSubmitted = actions.updateActivity(submitted.id, { quantity: 1 }, RECORDER);
  assert.equal(editSubmitted.ok, false);
  assert.match(editSubmitted.error ?? "", /locked/);

  const draft = getCfaState().activities.find((item) => item.status === "DRAFT");
  assert.ok(draft);
  assert.equal(
    actions.updateActivity(draft.id, { quantity: 950 }, RECORDER).ok,
    true,
  );
});

test("reversing a transaction adds an equal and opposite entry", () => {
  const original = getCfaState().transactions.find(
    (txn) => txn.transactionType === "SALE" && txn.verificationStatus === "VERIFIED",
  );
  assert.ok(original);
  const before = availableQuantity(getCfaState(), original.nurseryId, original.speciesId);

  const result = actions.reverseTransaction(original.id, "Entered against the wrong sale", RECORDER);
  assert.equal(result.ok, true);

  const after = getCfaState();
  const reversal = after.transactions.find((txn) => txn.id === result.id);
  assert.ok(reversal);
  assert.equal(reversal.relatedEntityId, original.id);
  assert.equal(reversal.direction, original.direction === "IN" ? "OUT" : "IN");
  assert.equal(reversal.quantity, original.quantity);
  assert.equal(availableQuantity(after, original.nurseryId, original.speciesId), before + original.quantity);
});

test("a verifier cannot approve their own submission", () => {
  actions.setCurrentUser("Mwangi");
  const target = getCfaState().activities.find((item) => item.status === "SUBMITTED");
  assert.ok(target);
  actions.setCurrentUser(target.recordedBy);
  const result = actions.decideOnRecord("ACTIVITY", target.id, {
    decision: "APPROVED",
    method: "DOCUMENT_REVIEW",
    notes: "",
    reviewer: target.recordedBy,
  });
  assert.equal(result.ok, false);
  assert.match(result.error ?? "", /own submission/);
});

test("rejecting without a reason is refused", () => {
  const target = getCfaState().activities.find((item) => item.status === "SUBMITTED");
  assert.ok(target);
  const result = actions.decideOnRecord("ACTIVITY", target.id, {
    decision: "REJECTED",
    method: "DOCUMENT_REVIEW",
    notes: "   ",
    reviewer: "Mwangi",
  });
  assert.equal(result.ok, false);
  assert.match(result.error ?? "", /reason is required/);
});

test("approving a record records the decision and moves it to verified", () => {
  const target = getCfaState().activities.find((item) => item.status === "SUBMITTED");
  assert.ok(target);
  const result = actions.decideOnRecord("ACTIVITY", target.id, {
    decision: "APPROVED",
    method: "FIELD_VISIT",
    notes: "Counted on site.",
    reviewer: "Mwangi",
  });
  assert.equal(result.ok, true);

  const after = getCfaState();
  const activity = after.activities.find((item) => item.id === target.id);
  assert.equal(activity?.status, "VERIFIED");

  const decision = after.verifications.find((item) => item.id === result.id);
  assert.ok(decision);
  assert.equal(decision.previousStatus, "SUBMITTED");
  assert.equal(decision.newStatus, "VERIFIED");
  assert.equal(decision.reviewedBy, "Mwangi");
  assert.equal(decision.evidenceIds.length, 1, "linked evidence is captured");
});

test("survival observations cannot exceed the number assessed", () => {
  const result = actions.addSurvivalObservation({
    plantingEventId: "PLT-0001",
    date: "2026-03-07",
    observerName: RECORDER,
    assessed: 100,
    surviving: 80,
    dead: 30,
    missing: 5,
    damaged: 0,
  });
  assert.equal(result.ok, false);
  assert.equal(getCfaState().survivalObservations.length, state.survivalObservations.length);
});

test("a species cannot be added twice under the same scientific name", () => {
  const duplicate = actions.addSpecies({
    commonName: "Prunus",
    scientificName: "Prunus africana",
    localNames: [],
    category: "INDIGENOUS",
    use: "MEDICINAL",
  });
  assert.equal(duplicate.ok, false);
  assert.match(duplicate.error ?? "", /already exists/);
});

test("every mutation leaves an audit entry", () => {
  const before = getCfaState().auditLog.length;
  sale(10);
  const entries = getCfaState().auditLog;
  assert.equal(entries.length, before + 1);
  assert.equal(entries[0].event, "ACTIVITY_SUBMITTED");
  assert.equal(entries[0].entityType, "SALE");
});
