import { useSyncExternalStore } from "react";

export interface CfaUpdate {
  id: string;
  authorName: string;
  title: string;
  body: string;
  createdAt: string;
}

const STORAGE_KEY = "cfa:updates";

function isBrowser() {
  return typeof window !== "undefined";
}

function seedUpdates(): CfaUpdate[] {
  const now = Date.now();
  return [
    {
      id: "CFA-UPD-1001",
      authorName: "Chebet",
      title: "Community planting day this Saturday",
      body: "We are planting 300 indigenous seedlings at Site A starting 8am. Bring your own water and gloves if you have them.",
      createdAt: new Date(now - 1000 * 60 * 60 * 20).toISOString(),
    },
    {
      id: "CFA-UPD-1002",
      authorName: "Kiptoo",
      title: "Nursery C water pump needs repair",
      body: "The pump at Nursery C has been leaking since Tuesday. Members near the nursery, please water the seedbeds by hand until it is fixed.",
      createdAt: new Date(now - 1000 * 60 * 60 * 44).toISOString(),
    },
  ];
}

function readUpdates(): CfaUpdate[] {
  if (!isBrowser()) return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = seedUpdates();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
  try {
    const parsed = JSON.parse(raw) as CfaUpdate[];
    return parsed.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } catch {
    return [];
  }
}

function saveUpdates(updates: CfaUpdate[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updates));
}

const listeners = new Set<() => void>();
let cache: CfaUpdate[] = [];
let cacheReady = false;

function notify() {
  cache = readUpdates();
  listeners.forEach((listener) => listener());
}

function subscribeUpdates(listener: () => void): () => void {
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

function getUpdatesSnapshot(): CfaUpdate[] {
  if (!cacheReady) {
    cache = readUpdates();
    cacheReady = true;
  }
  return cache;
}

function getServerUpdatesSnapshot(): CfaUpdate[] {
  return [];
}

export function addUpdate(input: Omit<CfaUpdate, "id" | "createdAt">): CfaUpdate {
  const updates = readUpdates();
  const highest = updates.reduce((max, item) => {
    const n = Number(item.id.replace("CFA-UPD-", ""));
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 1000);
  const update: CfaUpdate = {
    ...input,
    id: `CFA-UPD-${highest + 1}`,
    createdAt: new Date().toISOString(),
  };
  saveUpdates([update, ...updates]);
  notify();
  return update;
}

export function useCfaUpdates(): CfaUpdate[] {
  return useSyncExternalStore(
    subscribeUpdates,
    getUpdatesSnapshot,
    getServerUpdatesSnapshot,
  );
}
