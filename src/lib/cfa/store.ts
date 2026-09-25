"use client";

import { useSyncExternalStore } from "react";
import type { AuditEntry, CfaState } from "./types";
import { buildSeedState } from "./seed";

const STORAGE_KEY = "kai:cfa:v1";

function isBrowser() {
  return typeof window !== "undefined";
}

export function emptyState(): CfaState {
  return {
    cfa: {
      id: "cfa-demo",
      name: "Kapsabet Forest Association",
      registrationNumber: "CFA/NKE/2019/042",
      country: "Kenya",
      county: "Nandi",
      subCounty: "Kapsabet",
      ward: "Kapsabet",
      community: "Kapsabet",
      description: "",
      mission: "",
      contactName: "",
      contactPhone: "",
      contactEmail: "",
      establishedAt: new Date(0).toISOString(),
      leaderName: "",
      status: "DRAFT",
      isPublic: false,
    },
    role: "ADMIN",
    currentUser: "",
    nurseries: [],
    seedbeds: [],
    species: [],
    batches: [],
    transactions: [],
    activities: [],
    plantingEvents: [],
    survivalObservations: [],
    sales: [],
    donations: [],
    transfers: [],
    programs: [],
    evidence: [],
    verifications: [],
    auditLog: [],
  };
}

const EMPTY_STATE = emptyState();

function readState(): CfaState {
  if (!isBrowser()) return EMPTY_STATE;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = buildSeedState();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<CfaState>;
    return { ...EMPTY_STATE, ...parsed };
  } catch {
    return EMPTY_STATE;
  }
}

function writeState(state: CfaState) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const listeners = new Set<() => void>();
let cache: CfaState = EMPTY_STATE;
let cacheReady = false;

function snapshot(): CfaState {
  if (!cacheReady) {
    cache = readState();
    cacheReady = true;
  }
  return cache;
}

function notify() {
  cache = readState();
  cacheReady = true;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (isBrowser()) {
    window.addEventListener("storage", notify);
  }
  return () => {
    listeners.delete(listener);
    if (isBrowser()) {
      window.removeEventListener("storage", notify);
    }
  };
}

export function useCfaState(): CfaState {
  return useSyncExternalStore(subscribe, snapshot, () => EMPTY_STATE);
}

export function getCfaState(): CfaState {
  return snapshot();
}

export function updateState(mutate: (state: CfaState) => CfaState) {
  const next = mutate(snapshot());
  writeState(next);
  notify();
}

export function resetCfaData() {
  writeState(buildSeedState());
  notify();
}

let idCounter = 0;

export function nextId(prefix: string): string {
  idCounter += 1;
  const stamp = Date.now().toString(36).slice(-5);
  const salt = Math.random().toString(36).slice(2, 5);
  return `${prefix}-${stamp}${idCounter}${salt}`.toUpperCase();
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function recordAudit(
  state: CfaState,
  entry: Omit<AuditEntry, "id" | "at" | "actor"> & { actor?: string },
): AuditEntry[] {
  const audit: AuditEntry = {
    id: nextId("AUD"),
    actor: entry.actor ?? state.currentUser,
    at: nowIso(),
    event: entry.event,
    entityType: entry.entityType,
    entityId: entry.entityId,
    details: entry.details,
  };
  return [audit, ...state.auditLog].slice(0, 500);
}
