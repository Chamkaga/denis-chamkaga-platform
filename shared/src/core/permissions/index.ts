import { Role } from '../enums/Role.enum.js';


export type Permission =
  | "Dashboard.READ"
  | "Dashboard.WRITE"
  | "CRM.READ"
  | "CRM.WRITE"
  | "CRM.DELETE"
  | "CRM.EXPORT"
  | "AI.READ"
  | "AI.WRITE"
  | "Support.READ"
  | "Support.WRITE"
  | "Media.READ"
  | "Media.WRITE"
  | "Users.READ"
  | "Users.WRITE"
  | "Settings.READ"
  | "Settings.WRITE"
  | "Ledger.READ"
  | "Ledger.WRITE"
  | "Reports.READ";

export const RolePermissions: Record<Role, Permission[]> = {
  [Role.OWNER]: [
    "Dashboard.READ", "Dashboard.WRITE",
    "CRM.READ", "CRM.WRITE", "CRM.DELETE", "CRM.EXPORT",
    "AI.READ", "AI.WRITE",
    "Support.READ", "Support.WRITE",
    "Media.READ", "Media.WRITE",
    "Users.READ", "Users.WRITE",
    "Settings.READ", "Settings.WRITE",
    "Ledger.READ", "Ledger.WRITE",
    "Reports.READ"
  ],
  [Role.SUPER_ADMIN]: [
    "Dashboard.READ", "Dashboard.WRITE",
    "CRM.READ", "CRM.WRITE", "CRM.DELETE", "CRM.EXPORT",
    "AI.READ", "AI.WRITE",
    "Support.READ", "Support.WRITE",
    "Media.READ", "Media.WRITE",
    "Users.READ", "Users.WRITE",
    "Settings.READ", "Settings.WRITE",
    "Ledger.READ", "Ledger.WRITE",
    "Reports.READ"
  ],
  [Role.ADMIN]: [
    "Dashboard.READ", "Dashboard.WRITE",
    "CRM.READ", "CRM.WRITE", "CRM.DELETE", "CRM.EXPORT",
    "AI.READ", "AI.WRITE",
    "Support.READ", "Support.WRITE",
    "Media.READ", "Media.WRITE",
    "Users.READ", "Users.WRITE",
    "Settings.READ", "Settings.WRITE",
    "Ledger.READ", "Ledger.WRITE",
    "Reports.READ"
  ],
  [Role.DEVELOPER]: [
    "Dashboard.READ", "Dashboard.WRITE",
    "CRM.READ", "CRM.WRITE",
    "AI.READ", "AI.WRITE",
    "Support.READ",
    "Media.READ", "Media.WRITE",
    "Settings.READ", "Settings.WRITE",
    "Reports.READ"
  ],
  [Role.MANAGER]: [
    "Dashboard.READ",
    "CRM.READ", "CRM.WRITE", "CRM.EXPORT",
    "AI.READ",
    "Support.READ",
    "Media.READ",
    "Reports.READ"
  ],
  [Role.FINANCE]: [
    "Dashboard.READ",
    "Ledger.READ", "Ledger.WRITE",
    "Reports.READ"
  ],
  [Role.SUPPORT]: [
    "Dashboard.READ",
    "Support.READ", "Support.WRITE",
    "CRM.READ"
  ],
  [Role.EDITOR]: [
    "Dashboard.READ",
    "Media.READ", "Media.WRITE"
  ],
  [Role.CUSTOMER]: [
    "Dashboard.READ"
  ]
};

export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = RolePermissions[role];
  return permissions ? permissions.includes(permission) : false;
}

export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  const userPerms = RolePermissions[role];
  if (!userPerms) return false;
  return permissions.some(p => userPerms.includes(p));
}

export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  const userPerms = RolePermissions[role];
  if (!userPerms) return false;
  return permissions.every(p => userPerms.includes(p));
}

export function canAccessRoute(role: Role | string, requiredPermission?: Permission): boolean {
  if (!requiredPermission) return true;
  if (role === 'super_admin' || role === 'admin' || role === Role.ADMIN) return true;
  return hasPermission(role as Role, requiredPermission);
}
