import { useSyncExternalStore } from "react";

export type CfaActivityType =
  | "PROPAGATION"
  | "SOWING"
  | "WATERING"
  | "PEST_MANAGEMENT"
  | "SALE"
  | "DONATION"
  | "TRANSFER"
  | "PLANTING"
  | "MORTALITY"
  | "OTHER";

export const ACTIVITY_TYPE_LABELS: Record<CfaActivityType, string> = {
  PROPAGATION: "Propagation",
  SOWING: "Sowing",
  WATERING: "Watering",
  PEST_MANAGEMENT: "Pest management",
  SALE: "Sale",
  DONATION: "Donation",
  TRANSFER: "Transfer",
  PLANTING: "Planting",
  MORTALITY: "Mortality",
  OTHER: "Other",
};

export const ACTIVITY_TYPE_OPTIONS = Object.entries(ACTIVITY_TYPE_LABELS) as [
  CfaActivityType,
  string,
][];

export type CfaVerificationStatus = "UNVERIFIED" | "VERIFIED" | "REJECTED";

export interface CfaActivity {
  id: string;
  activityType: CfaActivityType;
  siteName: string;
  speciesName?: string;
  quantity: number;
  notes?: string;
  recordedBy: string;
  verificationStatus: CfaVerificationStatus;
  reviewNotes?: string;
  createdAt: string;
}

const STORAGE_KEY = "cfa:activities";

function isBrowser() {
  return typeof window !== "undefined";
}

function seedActivities(): CfaActivity[] {
  const now = Date.now();
  return [
    {
      id: "CFA-ACT-1001",
      activityType: "PROPAGATION",
      siteName: "Nursery C",
      speciesName: "Vitex keniensis",
      quantity: 500,
      recordedBy: "Achieng",
      verificationStatus: "UNVERIFIED",
      createdAt: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
    },
    {
      id: "CFA-ACT-1002",
      activityType: "PLANTING",
      siteName: "Site A, Kapsabet Forest",
      speciesName: "Prunus africana",
      quantity: 200,
      notes: "Planted along the eastern boundary during the community day.",
      recordedBy: "Kiptoo",
      verificationStatus: "VERIFIED",
      reviewNotes: "Confirmed against site photos and GPS log.",
      createdAt: new Date(now - 1000 * 60 * 60 * 28).toISOString(),
    },
    {
      id: "CFA-ACT-1003",
      activityType: "MORTALITY",
      siteName: "Site B, Kaptagat Riparian Buffer",
      speciesName: "Dombeya torrida",
      quantity: 12,
      notes: "Dry spell affected recently planted seedlings.",
      recordedBy: "Chebet",
      verificationStatus: "UNVERIFIED",
      createdAt: new Date(now - 1000 * 60 * 60 * 52).toISOString(),
    },
  ];
}

function readActivities(): CfaActivity[] {
  if (!isBrowser()) return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = seedActivities();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
  try {
    const parsed = JSON.parse(raw) as CfaActivity[];
    return parsed.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } catch {
    return [];
  }
}

function saveActivities(activities: CfaActivity[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
}

const listeners = new Set<() => void>();
let cache: CfaActivity[] = [];
let cacheReady = false;

function notify() {
  cache = readActivities();
  listeners.forEach((listener) => listener());
}

function subscribeActivities(listener: () => void): () => void {
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

function getActivitiesSnapshot(): CfaActivity[] {
  if (!cacheReady) {
    cache = readActivities();
    cacheReady = true;
  }
  return cache;
}

function getServerActivitiesSnapshot(): CfaActivity[] {
  return [];
}

export function addActivity(
  input: Omit<CfaActivity, "id" | "createdAt">,
): CfaActivity {
  const activities = readActivities();
  const highest = activities.reduce((max, item) => {
    const n = Number(item.id.replace("CFA-ACT-", ""));
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 1000);
  const activity: CfaActivity = {
    ...input,
    id: `CFA-ACT-${highest + 1}`,
    createdAt: new Date().toISOString(),
  };
  saveActivities([activity, ...activities]);
  notify();
  return activity;
}

export function useCfaActivities(): CfaActivity[] {
  return useSyncExternalStore(
    subscribeActivities,
    getActivitiesSnapshot,
    getServerActivitiesSnapshot,
  );
}

export function activityTypeStyles(type: CfaActivityType) {
  switch (type) {
    case "PLANTING":
    case "PROPAGATION":
    case "SOWING":
      return "bg-forest-50 text-forest-700 border-forest-200";
    case "SALE":
    case "DONATION":
    case "TRANSFER":
      return "bg-lake-50 text-lake-700 border-lake-200";
    case "MORTALITY":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-sand-100 text-ink-700 border-sand-200";
  }
}
