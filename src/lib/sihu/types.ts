export const CONTENT_TYPES = [
  "article",
  "guide",
  "news",
  "report",
  "event",
  "podcast",
  "video",
  "document",
] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

export const CONTENT_STATUSES = [
  "draft",
  "in_review",
  "changes_requested",
  "approved",
  "scheduled",
  "published",
  "archived",
] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const VERIFICATION_STATUSES = [
  "unverified",
  "community_verified",
  "verified",
  "disputed",
] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const ROLES = ["reader", "author", "editor", "admin"] as const;
export type SihuRole = (typeof ROLES)[number];

export const TOPIC_LEVELS = ["primary", "secondary"] as const;
export type TopicLevel = (typeof TOPIC_LEVELS)[number];

export const RECURRENCE_FREQUENCIES = ["weekly", "monthly", "quarterly"] as const;
export type RecurrenceFrequency = (typeof RECURRENCE_FREQUENCIES)[number];

export const REPORT_REASONS = [
  "incorrect_information",
  "broken_link",
  "outdated_content",
  "sensitive_material",
  "duplicate_content",
  "other",
] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export const REPORT_STATUSES = ["open", "reviewing", "resolved", "dismissed"] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export type SortOption =
  | "relevance"
  | "newest"
  | "oldest"
  | "updated"
  | "popular"
  | "title_asc";

export interface SihuCategoryEntity {
  id: string;
  name: string;
  slug: string;
  description: string;
  accent: string;
  order: number;
  active: boolean;
}

export interface SihuTag {
  id: string;
  name: string;
  slug: string;
}

export interface SihuTopic {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  parentId?: string;
}

export interface SihuOrganization {
  id: string;
  name: string;
  slug: string;
  kind: "government" | "ngo" | "research" | "community" | "private" | "media";
  country: string;
  website?: string;
  description: string;
}

export interface SihuAuthor {
  id: string;
  name: string;
  slug: string;
  title: string;
  bio: string;
  organizationIds: string[];
  photoUrl?: string;
  joinedAt: string;
}

export interface SihuSource {
  id: string;
  title: string;
  publisher: string;
  url: string;
  publishedAt?: string;
  accessedAt: string;
  verificationStatus: VerificationStatus;
  notes: string;
  linkedContentIds: string[];
}

export interface SihuMediaAsset {
  id: string;
  type: "image" | "video" | "audio" | "document";
  url: string;
  altText: string;
  caption: string;
  credit: string;
  license: string;
  mimeType: string;
  fileSizeBytes: number;
  durationSeconds?: number;
  uploadedBy: string;
  uploadedAt: string;
  referencedBy: string[];
}

export interface SihuRecurrence {
  frequency: RecurrenceFrequency;
  interval: number;
  until?: string;
}

export interface SihuEventDetails {
  startsAt: string;
  endsAt?: string;
  allDay: boolean;
  venue: string;
  address: string;
  latitude?: number;
  longitude?: number;
  registrationUrl?: string;
  capacity?: number;
  recurrence?: SihuRecurrence;
}

export interface SihuContentItem {
  id: string;
  type: ContentType;
  title: string;
  slug: string;
  summary: string;
  body: string;
  status: ContentStatus;
  visibility: "public" | "members";
  categoryId: string;
  authorId: string;
  coAuthorIds: string[];
  organizationIds: string[];
  topicIds: string[];
  tagIds: string[];
  mediaIds: string[];
  sourceIds: string[];
  heroMediaId?: string;
  locale: string;
  verificationStatus: VerificationStatus;
  correctionNotice?: string;
  event?: SihuEventDetails;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  readingMinutes: number;
  featured: boolean;
  version: number;
  publishedAt?: string;
  scheduledAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface SihuRevision {
  id: string;
  contentId: string;
  version: number;
  title: string;
  summary: string;
  body: string;
  status: ContentStatus;
  changedBy: string;
  changeNote: string;
  createdAt: string;
}

export interface SihuReport {
  id: string;
  targetType: "content" | "media" | "source";
  targetId: string;
  reason: ReportReason;
  details: string;
  reporter: string;
  status: ReportStatus;
  createdAt: string;
  resolvedAt?: string;
  resolutionNote?: string;
}

export interface SihuSearchEvent {
  id: string;
  query: string;
  filters: Record<string, string>;
  resultCount: number;
  searchedAt: string;
}

export interface SihuAssistantQuestion {
  id: string;
  question: string;
  answer: string;
  citations: string[];
  sourcesConsidered: number;
  answered: boolean;
  helpful?: boolean;
  askedAt: string;
}

export interface SihuHistoryEntry {
  contentId: string;
  viewedAt: string;
}

export interface SihuNewsletterPrefs {
  email: string;
  topicIds: string[];
  categoryId?: string;
  frequency: "instant" | "weekly" | "monthly";
  confirmed: boolean;
}

export interface SihuAuditEntry {
  id: string;
  actor: string;
  action: string;
  targetType: string;
  targetId: string;
  note: string;
  at: string;
}

export interface SihuSettings {
  siteName: string;
  tagline: string;
  contactEmail: string;
  assistantEnabled: boolean;
  assistantMinSources: number;
  assistantMaxSources: number;
  requireEditorialReview: boolean;
  defaultVisibility: "public" | "members";
  featuredContentIds: string[];
  featuredTopicIds: string[];
}

export interface SihuState {
  schemaVersion: number;
  content: SihuContentItem[];
  revisions: SihuRevision[];
  categories: SihuCategoryEntity[];
  tags: SihuTag[];
  topics: SihuTopic[];
  organizations: SihuOrganization[];
  authors: SihuAuthor[];
  sources: SihuSource[];
  media: SihuMediaAsset[];
  bookmarks: string[];
  follows: { targetType: "topic" | "category" | "author"; targetId: string }[];
  history: SihuHistoryEntry[];
  reports: SihuReport[];
  searchEvents: SihuSearchEvent[];
  assistantQuestions: SihuAssistantQuestion[];
  viewCounts: Record<string, number>;
  newsletter: SihuNewsletterPrefs;
  audit: SihuAuditEntry[];
  settings: SihuSettings;
  role: SihuRole;
  viewerName: string;
}

export const TYPE_LABELS: Record<ContentType, string> = {
  article: "Article",
  guide: "Guide",
  news: "News",
  report: "Report",
  event: "Event",
  podcast: "Podcast",
  video: "Video",
  document: "Document",
};

export const STATUS_LABELS: Record<ContentStatus, string> = {
  draft: "Draft",
  in_review: "In Review",
  changes_requested: "Changes Requested",
  approved: "Approved",
  scheduled: "Scheduled",
  published: "Published",
  archived: "Archived",
};

export const VERIFICATION_LABELS: Record<VerificationStatus, string> = {
  unverified: "Unverified",
  community_verified: "Community Verified",
  verified: "Verified",
  disputed: "Disputed",
};

export const ROLE_LABELS: Record<SihuRole, string> = {
  reader: "Reader",
  author: "Author",
  editor: "Editor",
  admin: "Administrator",
};

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  incorrect_information: "Incorrect information",
  broken_link: "Broken link",
  outdated_content: "Outdated content",
  sensitive_material: "Sensitive material",
  duplicate_content: "Duplicate content",
  other: "Other",
};

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  open: "Open",
  reviewing: "In Review",
  resolved: "Resolved",
  dismissed: "Dismissed",
};

export const TYPE_ROUTE_PREFIX: Record<ContentType, string> = {
  article: "/portal/article",
  guide: "/guides",
  news: "/news",
  report: "/reports",
  event: "/events",
  podcast: "/podcasts",
  video: "/videos",
  document: "/documents",
};

export const RECURRENCE_LABELS: Record<RecurrenceFrequency, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
};
