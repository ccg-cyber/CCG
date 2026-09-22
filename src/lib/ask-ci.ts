import { MODULES, searchModules } from "./registry";
import type { ModuleDefinition } from "./types";
import {
  appStore,
  findCustomerByName,
  getCustomerBundle,
  addDriveFile,
  addApproval,
  addAuditEvent,
} from "./data";

/**
 * CI ORCHESTRATOR (#85), in miniature.
 *
 * The real orchestrator takes a business objective and decides which
 * modules and agents must cooperate — reading the module registry,
 * checking permissions, and either acting or routing to CI APPROVAL
 * CENTER. This version is deterministic (pattern matching, not an LLM)
 * but it is NOT a mock: it reads the same shared store every module
 * reads, and when it acts (drafting a statement, filing it in Drive,
 * opening an approval) those are real writes — visible immediately in
 * CI Drive and CI Approval Center, not just described in this panel.
 */

export interface AskCiPlan {
  query: string;
  summary: string;
  modules: ModuleDefinition[];
  steps: string[];
  needsApproval: boolean;
  approvalId?: string;
}

function findModule(id: string): ModuleDefinition {
  const m = MODULES.find((x) => x.id === id);
  if (!m) throw new Error(`Unknown module: ${id}`);
  return m;
}

const KNOWN_CUSTOMERS_HINT =
  "Try naming a real account: Acme Ltd., Nord Retail Group, Northwind Supplies, or Blue Harbor Logistics.";

export function planFor(query: string): AskCiPlan {
  const q = query.toLowerCase();
  const state = appStore.get();
  const customer = findCustomerByName(state, q);

  const wantsOverview = /(show|everything|find).*(happening|going on)|customer .* (info|status|history)|what.?s going on with/.test(q);
  const wantsUnpaidChase = /(hasn.?t paid|overdue|unpaid|outstanding|chase)/.test(q);

  // ── Scenario 1: cross-module customer overview (read-only) ─────────
  if (wantsOverview) {
    if (!customer) {
      return {
        query,
        summary: `Couldn't match a customer in that query. ${KNOWN_CUSTOMERS_HINT}`,
        modules: [],
        steps: [],
        needsApproval: false,
      };
    }
    const bundle = getCustomerBundle(state, customer.id);
    const modules = ["ci-crm", "ci-mail", "ci-invoicing", "ci-drive", "ci-customer-service", "ci-calendar"].map(findModule);
    const overdueTotal = bundle.invoices.filter((i) => i.status === "overdue").reduce((sum, i) => sum + i.amount, 0);

    addAuditEvent({
      actor: "agent",
      actorName: "CI Assistant",
      moduleId: "ci-orchestrator",
      action: `Answered "show me everything about ${customer.name}"`,
      detail: `Read ${bundle.deals.length} deal(s), ${bundle.invoices.length} invoice(s), ${bundle.emails.length} email(s), ${bundle.files.length} file(s)`,
    });

    return {
      query,
      summary: `${customer.name}: ${bundle.deals.length} deal(s), ${bundle.invoices.length} invoice(s)${
        overdueTotal > 0 ? ` ($${overdueTotal.toLocaleString()} overdue)` : ""
      }, ${bundle.emails.length} email thread(s), ${bundle.files.length} file(s) on record.`,
      modules,
      steps: [
        `CI CRM — ${bundle.deals.map((d) => `${d.name} (${d.stage}, $${d.value.toLocaleString()})`).join("; ") || "no open deals"}`,
        `CI Mail — ${bundle.emails.length} message(s), ${bundle.emails.filter((e) => e.unread).length} unread`,
        `CI Invoicing — ${bundle.invoices.length} invoice(s), $${overdueTotal.toLocaleString()} overdue`,
        `CI Drive — ${bundle.files.length} file(s) in their folder`,
        `CI Customer Service — ${bundle.tickets.filter((t) => t.status !== "closed").length} open ticket(s) of ${bundle.tickets.length} total`,
        `CI Calendar — ${bundle.meetings.map((m) => `${m.title} (${new Date(m.start).toLocaleString()})`).join("; ") || "no upcoming meetings on record"}`,
      ],
      needsApproval: false,
    };
  }

  // ── Scenario 2: chase unpaid invoices — draft, file, hold for approval ──
  if (wantsUnpaidChase) {
    if (!customer) {
      return {
        query,
        summary: `Couldn't match a customer in that query. ${KNOWN_CUSTOMERS_HINT}`,
        modules: [],
        steps: [],
        needsApproval: false,
      };
    }
    const overdue = state.invoices.filter((i) => i.customerId === customer.id && i.status === "overdue");
    if (overdue.length === 0) {
      return {
        query,
        summary: `${customer.name} has no overdue invoices on record — nothing to chase.`,
        modules: [findModule("ci-invoicing")],
        steps: [],
        needsApproval: false,
      };
    }
    const total = overdue.reduce((sum, i) => sum + i.amount, 0);
    const invoiceLines = overdue.map((i) => `  Invoice #${i.number}   $${i.amount.toLocaleString()}   ${i.overdueDays ?? "?"} days overdue`).join("\n");
    const statementText = `Statement of Account — ${customer.name}\n\nDear ${customer.name},\n\nAs of today, the following invoices remain outstanding on your account:\n\n${invoiceLines}\n\nTotal outstanding: $${total.toLocaleString()}\n\nPlease let us know if you have any questions, or if a payment is already in transit.\n\nKind regards,\nAccounts Receivable`;
    const emailBody = `Hi ${customer.name} team,\n\nJust a friendly note that ${overdue.length} invoice(s) totaling $${total.toLocaleString()} are past due. I've attached a full statement — let us know if anything looks off, or if payment is already on its way.\n\nThanks,\nAccounts Receivable`;

    const file = addDriveFile({
      customerId: customer.id,
      name: `Statement — ${customer.name}.pdf`,
      type: "pdf",
      owner: "CI Agent",
    });

    const approval = addApproval({
      title: `Send statement + follow-up to ${customer.name}`,
      description: `Drafted from ${overdue.length} overdue invoice(s) totaling $${total.toLocaleString()}. Filed as "${file.name}" in CI Drive.`,
      moduleId: "ci-approval-center",
      createdBy: "agent",
      payload: {
        kind: "send-email",
        to: customer.email,
        subject: `Statement of Account — ${customer.name}`,
        body: emailBody,
        attachment: file.name,
      },
    });

    addAuditEvent({
      actor: "agent",
      actorName: "CI Agent",
      moduleId: "ci-accounting",
      action: `Drafted statement for ${customer.name}, filed in CI Drive, opened approval`,
      detail: statementText.slice(0, 120) + "…",
    });

    const modules = ["ci-accounting", "ci-docs", "ci-pdf", "ci-drive", "ci-mail", "ci-approval-center"].map(findModule);
    return {
      query,
      summary: `Drafted a statement for $${total.toLocaleString()} across ${overdue.length} overdue invoice(s), filed it in CI Drive, and drafted a follow-up email. Nothing sends until you approve it.`,
      modules,
      steps: [
        `CI Accounting & Finance — gathered ${overdue.length} overdue invoice(s), $${total.toLocaleString()} total`,
        "CI Docs — drafted the statement of account",
        `CI Drive — filed "${file.name}" in ${customer.name}'s folder`,
        `CI Mail — drafted follow-up to ${customer.email}`,
        "CI Approval Center — holding for your sign-off before sending",
      ],
      needsApproval: true,
      approvalId: approval.id,
    };
  }

  // ── Fallback: keyword search across the module registry ────────────
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
