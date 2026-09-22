import { MODULES, searchModules } from "./registry";
import type { ModuleDefinition } from "./types";

/**
 * CI ORCHESTRATOR (#85), in miniature.
 *
 * The real orchestrator takes a business objective and decides which
 * modules and agents must cooperate — reading the module registry,
 * checking permissions, and either acting or routing to CI APPROVAL
 * CENTER. This is a deterministic stand-in for that reasoning step so the
 * "type instead of navigate" experience is real, not just described.
 */

export interface AskCiPlan {
  query: string;
  summary: string;
  modules: ModuleDefinition[];
  steps: string[];
  needsApproval: boolean;
}

function findModule(id: string): ModuleDefinition {
  const m = MODULES.find((x) => x.id === id);
  if (!m) throw new Error(`Unknown module: ${id}`);
  return m;
}

export function planFor(query: string): AskCiPlan {
  const q = query.toLowerCase();

  // Canned scenario 1 — "show me everything happening with Customer X"
  if (/(show|everything|find).*(customer|client)/.test(q) || /customer .* (info|status|history)/.test(q)) {
    const modules = ["ci-crm", "ci-mail", "ci-accounting", "ci-drive", "ci-customer-service", "ci-calendar"].map(findModule);
    return {
      query,
      summary: "Pulling every record tied to this customer across the modules that hold a piece of the relationship.",
      modules,
      steps: [
        "CI CRM — pull opportunity stage, owner, last activity",
        "CI Mail — surface the last 20 messages in the thread",
        "CI Accounting & Finance — outstanding invoices and payment history",
        "CI Drive — contracts and shared documents",
        "CI Customer Service — open or recent support tickets",
        "CI Calendar — upcoming and past meetings",
      ],
      needsApproval: false,
    };
  }

  // Canned scenario 2 — unpaid customer, prepare statement + email, ask before sending
  if (/(hasn.?t paid|overdue|unpaid|outstanding)/.test(q)) {
    const modules = ["ci-accounting", "ci-docs", "ci-pdf", "ci-drive", "ci-mail", "ci-approval-center"].map(findModule);
    return {
      query,
      summary: "Preparing a statement and a draft follow-up email — nothing sends until you approve it.",
      modules,
      steps: [
        "CI Accounting & Finance — gather unpaid invoices and balance",
        "CI Docs — draft a professional statement of account",
        "CI PDF — attach the unpaid invoices as PDF",
        "CI Drive — file the statement in the customer's folder",
        "CI Mail — draft a polite follow-up email with attachments",
        "CI Approval Center — hold for your sign-off before sending",
      ],
      needsApproval: true,
    };
  }

  // Generic fallback — keyword search across the registry
  const hits = searchModules(q).slice(0, 6);
  if (hits.length > 0) {
    return {
      query,
      summary: `Found ${hits.length} module${hits.length === 1 ? "" : "s"} that can help with this.`,
      modules: hits,
      steps: hits.map((m) => `${m.name} — ${m.description}`),
      needsApproval: false,
    };
  }

  return {
    query,
    summary: "No module in the registry matches this yet — try a different phrasing, or this may need a new module.",
    modules: [],
    steps: [],
    needsApproval: false,
  };
}
