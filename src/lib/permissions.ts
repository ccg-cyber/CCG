import type { Permission, Role, CurrentUser } from "./types";

/**
 * Minimal RBAC substrate. This is the seam every module and every agent
 * action is meant to pass through — CI PERMISSIONS (#57) and CI IDENTITY
 * (#55) will replace this with a real policy engine, but the shape (role ->
 * module -> permission list) is what the rest of the platform builds on,
 * so it's established here rather than deferred.
 */
const ROLES: Role[] = [
  {
    id: "owner",
    name: "Owner / GM",
    grants: { "*": ["view", "edit", "approve", "admin", "agent-act"] },
  },
];

export const CURRENT_USER: CurrentUser = {
  id: "u-1",
  name: "You",
  email: "owner@company.example",
  roleId: "owner",
};

export function can(user: CurrentUser, moduleId: string, permission: Permission): boolean {
  const role = ROLES.find((r) => r.id === user.roleId);
  if (!role) return false;
  const grants = role.grants[moduleId] ?? role.grants["*"] ?? [];
  return grants.includes(permission);
}
