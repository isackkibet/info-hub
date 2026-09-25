export type CfaStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "ACTIVE"
  | "SUSPENDED"
  | "ARCHIVED";

export type NurseryStatus =
  | "PLANNED"
  | "ACTIVE"
  | "TEMPORARILY_INACTIVE"
  | "CLOSED"
  | "ARCHIVED";

export type SeedbedStatus =
  | "PLANNED"
  | "ACTIVE"
  | "FULL"
  | "MAINTENANCE"
  | "INACTIVE";

export type SpeciesCategory = "INDIGENOUS" | "EXOTIC";

export type SpeciesUse =
  | "FRUIT"
  | "TIMBER"
  | "AGROFORESTRY"
  | "RESTORATION"
  | "MEDICINAL"
  | "FODDER"
  | "RIPARIAN"
  | "OTHER";

export type BatchStatus =
  | "RECEIVED"
  | "IN_STORAGE"
  | "SOWN"
  | "IN_PRODUCTION"
  | "DISTRIBUTED"
  | "EXHAUSTED"
  | "DISCARDED";

export type TransactionType =
  | "OPENING_STOCK"
  | "PROPAGATION"
  | "ACQUISITION"
  | "TRANSFER_IN"
  | "TRANSFER_OUT"
  | "SALE"
  | "DONATION"
  | "PLANTING"
  | "MORTALITY"
  | "ADJUSTMENT"
  | "RETURN"
  | "RESERVED"
  | "RESERVATION_RELEASED";

export type ActivityType =
  | "PROPAGATION"
  | "SEED_COLLECTION"
  | "SOWING"
  | "GERMINATION"
  | "PRICKING_OUT"
  | "POTTING"
  | "WATERING"
  | "WEEDING"
  | "PEST_MANAGEMENT"
  | "FERTILIZATION"
  | "HARDENING"
  | "SEEDLING_MOVEMENT"
  | "SALE"
  | "DONATION"
  | "TRANSFER"
  | "PLANTING"
  | "MORTALITY"
  | "OTHER";

export type VerificationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "VERIFIED"
  | "REJECTED"
  | "NEEDS_CORRECTION"
  | "DISPUTED"
  | "ARCHIVED";

export type VerificationMethod =
  | "DOCUMENT_REVIEW"
  | "PHOTO_REVIEW"
  | "GPS_REVIEW"
  | "FIELD_VISIT"
  | "PEER_CONFIRMATION"
  | "PROGRAM_REVIEW"
  | "REMOTE_SENSING"
  | "COMMUNITY_VALIDATION";

export type PlantingStatus =
  | "PLANNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "MONITORING"
  | "CLOSED";

export type PaymentStatus =
  | "PENDING"
  | "PARTIALLY_PAID"
  | "PAID"
  | "CANCELLED";

export type ProgramStatus = "PLANNING" | "ACTIVE" | "COMPLETED" | "ARCHIVED";

export type Visibility = "PUBLIC" | "CFA_ONLY" | "VERIFIER_ONLY" | "PRIVATE";

export type Direction = "IN" | "OUT";

export type CfaRole = "MEMBER" | "NURSERY_MANAGER" | "VERIFIER" | "ADMIN";

export type EvidenceKind =
  | "PHOTO"
  | "VIDEO"
  | "GPS"
  | "DOCUMENT"
  | "RECEIPT"
  | "ATTENDANCE"
  | "FIELD_NOTE"
  | "SURVEY"
  | "VERIFICATION_REPORT"
  | "COMMUNITY_CONFIRMATION";

export type AuditEvent =
  | "USER_CREATED"
  | "CFA_CREATED"
  | "MEMBER_INVITED"
  | "ROLE_CHANGED"
  | "NURSERY_CREATED"
  | "SEEDBED_CREATED"
  | "BATCH_CREATED"
  | "ACTIVITY_CREATED"
  | "ACTIVITY_SUBMITTED"
  | "ACTIVITY_EDITED"
  | "ACTIVITY_VERIFIED"
  | "ACTIVITY_REJECTED"
  | "INVENTORY_ADJUSTED"
  | "REPORT_GENERATED"
  | "EVIDENCE_UPLOADED"
  | "DATA_EXPORTED";

export type EntityType =
  | "ACTIVITY"
  | "INVENTORY_TRANSACTION"
  | "PLANTING_EVENT"
  | "SALE"
  | "DONATION"
  | "TRANSFER";

export interface CfaProfile {
  id: string;
  name: string;
  registrationNumber: string;
  country: string;
  county: string;
  subCounty: string;
  ward: string;
  community: string;
  description: string;
  mission: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  latitude?: number;
  longitude?: number;
  establishedAt: string;
  leaderName: string;
  status: CfaStatus;
  isPublic: boolean;
}

export interface Nursery {
  id: string;
  cfaId: string;
  name: string;
  county: string;
  subCounty: string;
  ward: string;
  community: string;
  location: string;
  latitude?: number;
  longitude?: number;
  managerName: string;
  contactPhone: string;
  establishedAt: string;
  nurseryType: "PROPAGATION" | "NURSERY" | "ORCHARD" | "TREE_FARM";
  waterSource: string;
  capacity: number;
  status: NurseryStatus;
  notes?: string;
}

export interface Seedbed {
  id: string;
  nurseryId: string;
  name: string;
  locationInNursery: string;
  establishedAt: string;
  capacity: number;
  propagationMethod:
    | "DIRECT_SOWING"
    | "NURSERY_BED"
    | "CONTAINER"
    | "CUTTINGS"
    | "GRAFTING";
  status: SeedbedStatus;
  managerName: string;
  notes?: string;
}

export interface Species {
  id: string;
  commonName: string;
  scientificName: string;
  localNames: string[];
  category: SpeciesCategory;
  use: SpeciesUse;
  growthNotes?: string;
  isActive: boolean;
}

export interface SeedBatch {
  id: string;
  nurseryId: string;
  speciesId: string;
  seedSource: string;
  collectionLocation: string;
  collectionDate: string;
  acquiredAt: string;
  quantityAcquired: number;
  treatmentMethod: string;
  storageLocation: string;
  responsibleUser: string;
  status: BatchStatus;
  notes?: string;
}

export interface InventoryTransaction {
  id: string;
  transactionType: TransactionType;
  nurseryId: string;
  seedbedId?: string;
  speciesId: string;
  seedBatchId?: string;
  quantity: number;
  direction: Direction;
  date: string;
  programId?: string;
  source: string;
  destination?: string;
  relatedActivityId?: string;
  relatedEntityId?: string;
  recordedBy: string;
  notes?: string;
  verificationStatus: VerificationStatus;
  createdAt: string;
}

export interface Activity {
  id: string;
  activityType: ActivityType;
  nurseryId: string;
  seedbedId?: string;
  speciesId?: string;
  seedBatchId?: string;
  quantity: number;
  date: string;
  recordedBy: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
  programId?: string;
  status: VerificationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PlantingEvent {
  id: string;
  nurseryId: string;
  speciesId: string;
  seedBatchId?: string;
  quantityPlanted: number;
  date: string;
  siteName: string;
  latitude?: number;
  longitude?: number;
  siteDescription: string;
  responsibleGroup: string;
  programId?: string;
  landowner: string;
  status: PlantingStatus;
  recordedBy: string;
  createdAt: string;
}

export interface SurvivalObservation {
  id: string;
  plantingEventId: string;
  date: string;
  observerName: string;
  assessed: number;
  surviving: number;
  dead: number;
  missing: number;
  damaged: number;
  causeOfLoss?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  createdAt: string;
}

export interface Sale {
  id: string;
  nurseryId: string;
  speciesId: string;
  seedBatchId?: string;
  quantity: number;
  date: string;
  buyerName: string;
  buyerContact?: string;
  unitPrice: number;
  currency: string;
  paymentStatus: PaymentStatus;
  purpose: string;
  destination: string;
  programId?: string;
  recordedBy: string;
  notes?: string;
  createdAt: string;
}

export interface Donation {
  id: string;
  nurseryId: string;
  speciesId: string;
  seedBatchId?: string;
  quantity: number;
  date: string;
  recipientName: string;
  recipientContact?: string;
  purpose: string;
  plantingLocation: string;
  programId?: string;
  recordedBy: string;
  notes?: string;
  createdAt: string;
}

export interface Transfer {
  id: string;
  sourceNurseryId: string;
  sourceSeedbedId?: string;
  destinationNurseryId: string;
  destinationSeedbedId?: string;
  destinationProject?: string;
  speciesId: string;
  seedBatchId?: string;
  quantity: number;
  date: string;
  reason: string;
  senderName: string;
  receiverName: string;
  createdAt: string;
}

export interface Program {
  id: string;
  name: string;
  organisation: string;
  description: string;
  programType: string;
  startDate: string;
  endDate?: string;
  contactName: string;
  status: ProgramStatus;
  isPublic: boolean;
  notes?: string;
}

export interface Evidence {
  id: string;
  entityType: EntityType;
  entityId: string;
  kind: EvidenceKind;
  fileName: string;
  fileType: string;
  reference: string;
  contentHash: string;
  uploadedBy: string;
  captureDate: string;
  latitude?: number;
  longitude?: number;
  visibility: Visibility;
  consentStatus: "GRANTED" | "PENDING" | "WITHHELD";
  verificationStatus: VerificationStatus;
  createdAt: string;
}

export interface Verification {
  id: string;
  entityType: EntityType;
  entityId: string;
  submittedBy: string;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  method?: VerificationMethod;
  evidenceIds: string[];
  notes?: string;
  decision?: "APPROVED" | "REJECTED" | "CORRECTIONS_REQUESTED";
  previousStatus?: VerificationStatus;
  newStatus?: VerificationStatus;
}

export interface AuditEntry {
  id: string;
  event: AuditEvent;
  entityType?: string;
  entityId?: string;
  actor: string;
  details?: string;
  at: string;
}

export interface CfaState {
  cfa: CfaProfile;
  role: CfaRole;
  currentUser: string;
  nurseries: Nursery[];
  seedbeds: Seedbed[];
  species: Species[];
  batches: SeedBatch[];
  transactions: InventoryTransaction[];
  activities: Activity[];
  plantingEvents: PlantingEvent[];
  survivalObservations: SurvivalObservation[];
  sales: Sale[];
  donations: Donation[];
  transfers: Transfer[];
  programs: Program[];
  evidence: Evidence[];
  verifications: Verification[];
  auditLog: AuditEntry[];
}

export const CfaStatusLabels: Record<CfaStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  ACTIVE: "Active",
  SUSPENDED: "Suspended",
  ARCHIVED: "Archived",
};

export const NurseryStatusLabels: Record<NurseryStatus, string> = {
  PLANNED: "Planned",
  ACTIVE: "Active",
  TEMPORARILY_INACTIVE: "Temporarily inactive",
  CLOSED: "Closed",
  ARCHIVED: "Archived",
};

export const SeedbedStatusLabels: Record<SeedbedStatus, string> = {
  PLANNED: "Planned",
  ACTIVE: "Active",
  FULL: "Full",
  MAINTENANCE: "Maintenance",
  INACTIVE: "Inactive",
};

export const SpeciesCategoryLabels: Record<SpeciesCategory, string> = {
  INDIGENOUS: "Indigenous",
  EXOTIC: "Exotic",
};

export const SpeciesUseLabels: Record<SpeciesUse, string> = {
  FRUIT: "Fruit",
  TIMBER: "Timber",
  AGROFORESTRY: "Agroforestry",
  RESTORATION: "Restoration",
  MEDICINAL: "Medicinal",
  FODDER: "Fodder",
  RIPARIAN: "Riparian",
  OTHER: "Other",
};

export const BatchStatusLabels: Record<BatchStatus, string> = {
  RECEIVED: "Received",
  IN_STORAGE: "In storage",
  SOWN: "Sown",
  IN_PRODUCTION: "In production",
  DISTRIBUTED: "Distributed",
  EXHAUSTED: "Exhausted",
  DISCARDED: "Discarded",
};

export const TransactionTypeLabels: Record<TransactionType, string> = {
  OPENING_STOCK: "Opening stock",
  PROPAGATION: "Propagation",
  ACQUISITION: "Acquisition",
  TRANSFER_IN: "Transfer in",
  TRANSFER_OUT: "Transfer out",
  SALE: "Sale",
  DONATION: "Donation",
  PLANTING: "Planting",
  MORTALITY: "Mortality",
  ADJUSTMENT: "Adjustment",
  RETURN: "Return",
  RESERVED: "Reserved",
  RESERVATION_RELEASED: "Reservation released",
};

export const ActivityTypeLabels: Record<ActivityType, string> = {
  PROPAGATION: "Propagation",
  SEED_COLLECTION: "Seed collection",
  SOWING: "Sowing",
  GERMINATION: "Germination",
  PRICKING_OUT: "Pricking out",
  POTTING: "Potting",
  WATERING: "Watering",
  WEEDING: "Weeding",
  PEST_MANAGEMENT: "Pest management",
  FERTILIZATION: "Fertilization",
  HARDENING: "Hardening",
  SEEDLING_MOVEMENT: "Seedling movement",
  SALE: "Sale",
  DONATION: "Donation",
  TRANSFER: "Transfer",
  PLANTING: "Planting",
  MORTALITY: "Mortality",
  OTHER: "Other",
};

export const ActivityTypeOptions = Object.entries(
  ActivityTypeLabels,
) as [ActivityType, string][];

export const VerificationStatusLabels: Record<VerificationStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under review",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
  NEEDS_CORRECTION: "Needs correction",
  DISPUTED: "Disputed",
  ARCHIVED: "Archived",
};

export const VerificationMethodLabels: Record<VerificationMethod, string> = {
  DOCUMENT_REVIEW: "Document review",
  PHOTO_REVIEW: "Photo review",
  GPS_REVIEW: "GPS review",
  FIELD_VISIT: "Field visit",
  PEER_CONFIRMATION: "Peer confirmation",
  PROGRAM_REVIEW: "Program review",
  REMOTE_SENSING: "Remote-sensing review",
  COMMUNITY_VALIDATION: "Community validation",
};

export const VerificationMethodOptions = Object.entries(
  VerificationMethodLabels,
) as [VerificationMethod, string][];

export const PlantingStatusLabels: Record<PlantingStatus, string> = {
  PLANNED: "Planned",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  MONITORING: "Monitoring",
  CLOSED: "Closed",
};

export const PaymentStatusLabels: Record<PaymentStatus, string> = {
  PENDING: "Pending",
  PARTIALLY_PAID: "Partially paid",
  PAID: "Paid",
  CANCELLED: "Cancelled",
};

export const ProgramStatusLabels: Record<ProgramStatus, string> = {
  PLANNING: "Planning",
  ACTIVE: "Active",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
};

export const VisibilityLabels: Record<Visibility, string> = {
  PUBLIC: "Public",
  CFA_ONLY: "CFA only",
  VERIFIER_ONLY: "Verifier only",
  PRIVATE: "Private",
};

export const RoleLabels: Record<CfaRole, string> = {
  MEMBER: "Nursery member",
  NURSERY_MANAGER: "Nursery manager",
  VERIFIER: "Verifier",
  ADMIN: "CFA administrator",
};

export const EntityTypeLabels: Record<EntityType, string> = {
  ACTIVITY: "Activity",
  INVENTORY_TRANSACTION: "Inventory transaction",
  PLANTING_EVENT: "Planting event",
  SALE: "Sale",
  DONATION: "Donation",
  TRANSFER: "Transfer",
};

export const EvidenceKindLabels: Record<EvidenceKind, string> = {
  PHOTO: "Photo",
  VIDEO: "Video",
  GPS: "GPS point",
  DOCUMENT: "Document",
  RECEIPT: "Receipt",
  ATTENDANCE: "Attendance sheet",
  FIELD_NOTE: "Field note",
  SURVEY: "Survey",
  VERIFICATION_REPORT: "Verification report",
  COMMUNITY_CONFIRMATION: "Community confirmation",
};

export const NurseryTypeLabels: Record<Nursery["nurseryType"], string> = {
  PROPAGATION: "Propagation nursery",
  NURSERY: "Tree nursery",
  ORCHARD: "Orchard",
  TREE_FARM: "Tree farm",
};

export const PropagationMethodLabels: Record<
  Seedbed["propagationMethod"],
  string
> = {
  DIRECT_SOWING: "Direct sowing",
  NURSERY_BED: "Nursery bed",
  CONTAINER: "Container",
  CUTTINGS: "Cuttings",
  GRAFTING: "Grafting",
};
