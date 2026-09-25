import { useSyncExternalStore } from "react";

export type SihuCategory =
  | "WATER_HYACINTH_TRACKING"
  | "LAKE_CLEANUP"
  | "BLUE_ECONOMY_NEWS"
  | "HUMAN_RIGHTS_REPORT"
  | "POLLUTION_ALERT"
  | "COMMUNITY_DEVELOPMENT_NEWS";

export type SihuStatus = "PENDING" | "VERIFIED" | "REJECTED" | "BATCHED";

export type SihuContentType = "ARTICLE" | "PICTURE" | "VIDEO" | "PODCAST";

export const CONTENT_TYPE_LABELS: Record<SihuContentType, string> = {
  ARTICLE: "Article",
  PICTURE: "Picture",
  VIDEO: "Video",
  PODCAST: "Podcast",
};

export const CONTENT_TYPE_OPTIONS = Object.entries(CONTENT_TYPE_LABELS) as [
  SihuContentType,
  string,
][];

export interface SihuSubmission {
  id: string;
  title: string;
  category: SihuCategory;
  contentType: SihuContentType;
  topic?: string;
  quantity: number;
  locationName: string;
  latitude?: number;
  longitude?: number;
  publicMediaUrl?: string;
  body?: string;
  reporterName: string;
  status: SihuStatus;
  reviewNotes?: string;
  createdAt: string;
}

export const CATEGORY_LABELS: Record<SihuCategory, string> = {
  WATER_HYACINTH_TRACKING: "Water Hyacinth Tracking",
  LAKE_CLEANUP: "Lake Cleanup",
  BLUE_ECONOMY_NEWS: "Blue Economy News",
  HUMAN_RIGHTS_REPORT: "Human Rights Report",
  POLLUTION_ALERT: "Pollution Alert",
  COMMUNITY_DEVELOPMENT_NEWS: "Community Development News",
};

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS) as [
  SihuCategory,
  string,
][];

const STORAGE_KEY = "sihu:submissions";

function isBrowser() {
  return typeof window !== "undefined";
}

function seedSubmissions(): SihuSubmission[] {
  const now = Date.now();
  return [
    {
      id: "SIHU-1001",
      title: "Water hyacinth spreading near Dunga Beach",
      category: "WATER_HYACINTH_TRACKING",
      contentType: "PICTURE",
      topic: "Water hyacinth",
      quantity: 1,
      locationName: "Dunga Beach, Kisumu",
      latitude: -0.1276,
      longitude: 34.7519,
      publicMediaUrl: "https://instagram.com/p/example1",
      reporterName: "Otieno",
      status: "PENDING",
      createdAt: new Date(now - 1000 * 60 * 60 * 6).toISOString(),
    },
    {
      id: "SIHU-1002",
      title: "Community lake cleanup collects fifty bags of waste",
      category: "LAKE_CLEANUP",
      contentType: "VIDEO",
      quantity: 50,
      locationName: "Homa Bay Pier",
      publicMediaUrl: "https://x.com/example/status/2",
      reporterName: "Achieng",
      status: "VERIFIED",
      reviewNotes: "Media confirms location and activity.",
      createdAt: new Date(now - 1000 * 60 * 60 * 30).toISOString(),
    },
    {
      id: "SIHU-1003",
      title: "Suspected effluent discharge near tannery",
      category: "POLLUTION_ALERT",
      contentType: "ARTICLE",
      quantity: 1,
      locationName: "Kisumu Industrial Area",
      body: "Residents near the industrial area have reported an unusual smell and discoloured water over the past week. A follow-up visit is needed to confirm the source before this can be verified.",
      reporterName: "Wanjiru",
      status: "REJECTED",
      reviewNotes: "Location in the write-up does not match the report.",
      createdAt: new Date(now - 1000 * 60 * 60 * 50).toISOString(),
    },
  ];
}

function readSubmissions(): SihuSubmission[] {
  if (!isBrowser()) return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = seedSubmissions();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
  try {
    const parsed = JSON.parse(raw) as SihuSubmission[];
    return parsed.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } catch {
    return [];
  }
}

function saveSubmissions(submissions: SihuSubmission[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
}

const listeners = new Set<() => void>();
let cache: SihuSubmission[] = [];
let cacheReady = false;

function notify() {
  cache = readSubmissions();
  listeners.forEach((listener) => listener());
}

export function subscribeSubmissions(listener: () => void): () => void {
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

export function getSubmissionsSnapshot(): SihuSubmission[] {
  if (!cacheReady) {
    cache = readSubmissions();
    cacheReady = true;
  }
  return cache;
}

export function getServerSubmissionsSnapshot(): SihuSubmission[] {
  return [];
}

export function addSubmission(
  input: Omit<SihuSubmission, "id" | "status" | "createdAt">,
): SihuSubmission {
  const submissions = readSubmissions();
  const highest = submissions.reduce((max, item) => {
    const n = Number(item.id.replace("SIHU-", ""));
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 1000);
  const submission: SihuSubmission = {
    ...input,
    id: `SIHU-${highest + 1}`,
    status: "PENDING",
    createdAt: new Date().toISOString(),
  };
  saveSubmissions([submission, ...submissions]);
  notify();
  return submission;
}

export function updateSubmissionStatus(
  id: string,
  status: SihuStatus,
  reviewNotes?: string,
): void {
  const submissions = readSubmissions();
  const updated = submissions.map((s) =>
    s.id === id ? { ...s, status, reviewNotes } : s,
  );
  saveSubmissions(updated);
  notify();
}

export function useSihuSubmissions(): SihuSubmission[] {
  return useSyncExternalStore(
    subscribeSubmissions,
    getSubmissionsSnapshot,
    getServerSubmissionsSnapshot,
  );
}

export function statusStyles(status: SihuStatus) {
  switch (status) {
    case "PENDING":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "VERIFIED":
      return "bg-forest-50 text-forest-700 border-forest-200";
    case "REJECTED":
      return "bg-red-50 text-red-700 border-red-200";
    case "BATCHED":
      return "bg-lake-50 text-lake-600 border-lake-100";
  }
}
