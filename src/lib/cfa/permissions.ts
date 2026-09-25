"use client";

import type { CfaRole } from "./types";
import { RoleLabels } from "./types";
import { useCfaState } from "./store";

export type Permission =
  | "VIEW_CFA"
  | "MANAGE_MEMBERS"
  | "MANAGE_NURSERIES"
  | "MANAGE_SEEDBEDS"
  | "MANAGE_SPECIES"
  | "MANAGE_BATCHES"
  | "POST_INVENTORY"
  | "ADJUST_STOCK"
  | "RECORD_ACTIVITY"
  | "RECORD_MOVEMENT"
  | "RECORD_PLANTING"
  | "RECORD_SURVIVAL"
  | "MANAGE_PROGRAMS"
  | "VIEW_FINANCIALS"
  | "VERIFY"
  | "GENERATE_REPORT"
  | "EXPORT_DATA";

const MATRIX: Record<CfaRole, Permission[]> = {
  MEMBER: [
    "VIEW_CFA",
    "RECORD_ACTIVITY",
    "RECORD_SURVIVAL",
    "VIEW_FINANCIALS",
  ],
  NURSERY_MANAGER: [
    "VIEW_CFA",
    "MANAGE_NURSERIES",
    "MANAGE_SEEDBEDS",
    "MANAGE_SPECIES",
    "MANAGE_BATCHES",
    "POST_INVENTORY",
    "ADJUST_STOCK",
    "RECORD_ACTIVITY",
    "RECORD_MOVEMENT",
    "RECORD_PLANTING",
    "RECORD_SURVIVAL",
    "MANAGE_PROGRAMS",
    "VIEW_FINANCIALS",
    "GENERATE_REPORT",
    "EXPORT_DATA",
  ],
  VERIFIER: [
    "VIEW_CFA",
    "VERIFY",
    "RECORD_SURVIVAL",
    "GENERATE_REPORT",
    "EXPORT_DATA",
  ],
  ADMIN: [
    "VIEW_CFA",
    "MANAGE_MEMBERS",
    "MANAGE_NURSERIES",
    "MANAGE_SEEDBEDS",
    "MANAGE_SPECIES",
    "MANAGE_BATCHES",
    "POST_INVENTORY",
    "ADJUST_STOCK",
    "RECORD_ACTIVITY",
    "RECORD_MOVEMENT",
    "RECORD_PLANTING",
    "RECORD_SURVIVAL",
    "MANAGE_PROGRAMS",
    "VIEW_FINANCIALS",
    "VERIFY",
    "GENERATE_REPORT",
    "EXPORT_DATA",
  ],
};

export function can(role: CfaRole, permission: Permission): boolean {
  return MATRIX[role].includes(permission);
}

export function canVerifyOwnSubmission(
  role: CfaRole,
  currentUser: string,
  submittedBy: string,
): boolean {
  if (!can(role, "VERIFY")) return false;
  return currentUser.trim().toLowerCase() !== submittedBy.trim().toLowerCase();
}

export const PERMISSION_LABELS: Record<Permission, string> = {
  VIEW_CFA: "View CFA records",
  MANAGE_MEMBERS: "Manage members and roles",
  MANAGE_NURSERIES: "Create and manage nurseries",
  MANAGE_SEEDBEDS: "Create and manage seedbeds",
  MANAGE_SPECIES: "Maintain the species catalogue",
  MANAGE_BATCHES: "Maintain seed batches",
  POST_INVENTORY: "Post inventory transactions",
  ADJUST_STOCK: "Authorise stock adjustments",
  RECORD_ACTIVITY: "Record nursery activities",
  RECORD_MOVEMENT: "Record sales, donations and transfers",
  RECORD_PLANTING: "Record planting events",
  RECORD_SURVIVAL: "Record survival observations",
  MANAGE_PROGRAMS: "Manage programs and initiatives",
  VIEW_FINANCIALS: "View financial values",
  VERIFY: "Verify submitted records",
  GENERATE_REPORT: "Generate reports",
  EXPORT_DATA: "Export data",
};

export function permissionsFor(role: CfaRole): Permission[] {
  return MATRIX[role];
}

export interface AccessContext {
  role: CfaRole;
  roleLabel: string;
  currentUser: string;
  can: (permission: Permission) => boolean;
}

export function useAccess(): AccessContext {
  const state = useCfaState();
  return {
    role: state.role,
    roleLabel: RoleLabels[state.role],
    currentUser: state.currentUser,
    can: (permission: Permission) => can(state.role, permission),
  };
}
