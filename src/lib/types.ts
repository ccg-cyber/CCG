/**
 * Ci Business OS — core types.
 *
 * The whole platform is described as data (the module registry) rendered by
 * one shell. Adding a real module means: (1) build it, (2) point its entry
 * at a route, (3) flip its status. The navigation, search, permissions and
 * "Ask CI" router all read from this registry — nothing is hardcoded twice.
 */

/** The ten top-level groups under CI Business OS, plus Home and Core. */
export type ModuleCategory =
  | "home"
  | "work"
  | "communicate"
  | "files"
  | "business"
  | "create"
  | "it"
  | "build"
  | "intelligence"
  | "control"
  | "executive";

export type ModuleStatus =
  | "live" // implemented in this codebase, real UI/state
  | "scaffolded" // route + placeholder UI exists
  | "planned"; // registered, no UI yet

export interface ModuleDefinition {
  /** Stable identifier, e.g. "ci-docs" */
  id: string;
  /** URL-safe slug used in routing, e.g. "docs" */
  slug: string;
  /** Display name, e.g. "CI Docs" */
  name: string;
  /** What it replaces, if anything — shown as context in the UI */
  replaces?: string;
  category: ModuleCategory;
  status: ModuleStatus;
  /** One-line description of scope */
  description: string;
  /** Keywords the command bar / Ask CI matches against */
  keywords: string[];
}

export interface CategoryDefinition {
  id: ModuleCategory;
  label: string;
  description: string;
}

export type Permission = "view" | "edit" | "approve" | "admin" | "agent-act";

export interface Role {
  id: string;
  name: string;
  /** module id -> permissions granted */
  grants: Record<string, Permission[]>;
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  roleId: string;
}

export interface AuditEvent {
  id: string;
  actor: "user" | "agent" | "system";
  actorName: string;
  moduleId: string;
  action: string;
  timestamp: string;
  detail?: string;
}
