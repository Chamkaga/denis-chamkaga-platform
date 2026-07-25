"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolePermissions = void 0;
exports.hasPermission = hasPermission;
exports.hasAnyPermission = hasAnyPermission;
exports.hasAllPermissions = hasAllPermissions;
exports.canAccessRoute = canAccessRoute;
const Role_enum_1 = require("../enums/Role.enum");
exports.RolePermissions = {
    [Role_enum_1.Role.ADMIN]: [
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
    [Role_enum_1.Role.DEVELOPER]: [
        "Dashboard.READ", "Dashboard.WRITE",
        "CRM.READ", "CRM.WRITE",
        "AI.READ", "AI.WRITE",
        "Support.READ",
        "Media.READ", "Media.WRITE",
        "Settings.READ", "Settings.WRITE",
        "Reports.READ"
    ],
    [Role_enum_1.Role.MANAGER]: [
        "Dashboard.READ",
        "CRM.READ", "CRM.WRITE", "CRM.EXPORT",
        "AI.READ",
        "Support.READ",
        "Media.READ",
        "Reports.READ"
    ],
    [Role_enum_1.Role.FINANCE]: [
        "Dashboard.READ",
        "Ledger.READ", "Ledger.WRITE",
        "Reports.READ"
    ],
    [Role_enum_1.Role.SUPPORT]: [
        "Dashboard.READ",
        "Support.READ", "Support.WRITE",
        "CRM.READ"
    ],
    [Role_enum_1.Role.EDITOR]: [
        "Dashboard.READ",
        "Media.READ", "Media.WRITE"
    ],
    [Role_enum_1.Role.CUSTOMER]: [
        "Dashboard.READ"
    ]
};
function hasPermission(role, permission) {
    const permissions = exports.RolePermissions[role];
    return permissions ? permissions.includes(permission) : false;
}
function hasAnyPermission(role, permissions) {
    const userPerms = exports.RolePermissions[role];
    if (!userPerms)
        return false;
    return permissions.some(p => userPerms.includes(p));
}
function hasAllPermissions(role, permissions) {
    const userPerms = exports.RolePermissions[role];
    if (!userPerms)
        return false;
    return permissions.every(p => userPerms.includes(p));
}
function canAccessRoute(role, requiredPermission) {
    if (!requiredPermission)
        return true;
    return hasPermission(role, requiredPermission);
}
