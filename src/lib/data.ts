import { createStore, useStore } from "./store";
import type {
  AppState,
  Customer,
  Invoice,
  EmailMessage,
  DriveFile,
  Deal,
  TaskItem,
  ApprovalRequest,
  AuditEvent,
} from "./types";

/**
 * The shared company dataset every live module reads and writes through.
 * This is what makes "Ask CI: show me everything about Customer X" a real
 * query instead of a canned string — CRM, Mail, Drive and Accounting all
 * point at the same customerId.
 */
function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function now(): string {
  return new Date().toISOString();
}

const CUSTOMERS: Customer[] = [
  { id: "cust-acme", name: "Acme Ltd.", email: "billing@acme.example", company: "Acme Ltd.", tags: ["key account"] },
  { id: "cust-nord", name: "Nord Retail Group", email: "procurement@nordretail.example", company: "Nord Retail Group", tags: ["prospect"] },
  { id: "cust-northwind", name: "Northwind Supplies", email: "orders@northwind.example", company: "Northwind Supplies", tags: ["supplier", "customer"] },
  { id: "cust-blueharbor", name: "Blue Harbor Logistics", email: "ops@blueharbor.example", company: "Blue Harbor Logistics", tags: ["prospect"] },
];

const INVOICES: Invoice[] = [
  { id: "inv-1042", customerId: "cust-acme", number: "1042", amount: 4200, issuedDate: "2026-09-08", dueDate: "2026-09-10", status: "overdue", overdueDays: 12 },
  { id: "inv-1058", customerId: "cust-acme", number: "1058", amount: 1150, issuedDate: "2026-09-17", dueDate: "2026-09-19", status: "overdue", overdueDays: 3 },
  { id: "inv-1061", customerId: "cust-nord", number: "1061", amount: 6400, issuedDate: "2026-09-15", dueDate: "2026-10-15", status: "pending" },
  { id: "inv-1030", customerId: "cust-northwind", number: "1030", amount: 5400, issuedDate: "2026-08-01", dueDate: "2026-08-15", status: "paid" },
];

const EMAILS: EmailMessage[] = [
  { id: "em-1", customerId: "cust-acme", from: "Acme Ltd. — Billing", subject: "Re: Invoice #1042", body: "We're processing payment now, apologies for the delay on our end. Should clear within 2-3 business days.", time: "2026-09-22T09:14:00Z", unread: true },
  { id: "em-2", customerId: "cust-nord", from: "Nord Retail Group", subject: "Proposal follow-up", body: "Thanks for the call yesterday — a few questions on pricing for the enterprise tier before we can move forward.", time: "2026-09-22T08:02:00Z", unread: true },
  { id: "em-3", customerId: "cust-northwind", from: "Northwind Supplies", subject: "PO-2201 confirmation", body: "Confirming receipt of your purchase order, shipping Monday. Tracking number to follow.", time: "2026-09-21T14:00:00Z", unread: false },
  { id: "em-4", from: "CI Security Center", subject: "Weekly security digest", body: "No critical alerts this week. 2 devices pending patch, scheduled for the weekend maintenance window.", time: "2026-09-21T07:00:00Z", unread: false },
];

const FILES: DriveFile[] = [
  { id: "file-acme-folder", customerId: "cust-acme", name: "Acme Ltd.", type: "folder", modified: "2 days ago", owner: "You" },
  { id: "file-northwind-folder", customerId: "cust-northwind", name: "Northwind Supplies", type: "folder", modified: "1 week ago", owner: "You" },
  { id: "file-rollout-plan", name: "Q3 Rollout Plan.docx", type: "doc", modified: "Today", owner: "You" },
  { id: "file-forecast", name: "Sales Forecast.sheet", type: "sheet", modified: "Yesterday", owner: "You" },
];

const DEALS: Deal[] = [
  { id: "deal-nord", customerId: "cust-nord", name: "Nord Retail Group", value: 18000, stage: "Proposal" },
  { id: "deal-blueharbor", customerId: "cust-blueharbor", name: "Blue Harbor Logistics", value: 7200, stage: "New" },
  { id: "deal-acme-renewal", customerId: "cust-acme", name: "Acme Ltd. — renewal", value: 32500, stage: "Qualified" },
  { id: "deal-northwind", customerId: "cust-northwind", name: "Northwind Supplies", value: 5400, stage: "Won" },
];

const TASKS: TaskItem[] = [
  { id: "task-1", title: "Approve PO-2201 for Northwind Supplies", done: false, priority: "high", customerId: "cust-northwind" },
  { id: "task-2", title: "Review Q3 rollout timeline", done: false, priority: "medium" },
  { id: "task-3", title: "Send follow-up to Nord Retail Group", done: true, priority: "low", customerId: "cust-nord" },
];

const APPROVALS: ApprovalRequest[] = [
  {
    id: "appr-po-2201",
    title: "Purchase order PO-2201 — $4,300 to Northwind Supplies",
    description: "Restocking order for Q4 inventory, within budget.",
    moduleId: "ci-purchasing",
    createdBy: "user",
    status: "pending",
    createdAt: now(),
  },
];

const AUDIT: AuditEvent[] = [
  { id: uid("audit"), actor: "system", actorName: "Ci Business OS", moduleId: "ci-home", action: "Workspace initialized with seed data", timestamp: now() },
];

const SEED: AppState = {
  customers: CUSTOMERS,
  invoices: INVOICES,
  emails: EMAILS,
  files: FILES,
  deals: DEALS,
  tasks: TASKS,
  approvals: APPROVALS,
  audit: AUDIT,
};

export const appStore = createStore<AppState>("ci-os-app-state-v1", SEED);

export function useAppState(): AppState {
  return useStore(appStore);
}

// ── Selectors ────────────────────────────────────────────────────────

export function findCustomerByName(state: AppState, query: string): Customer | undefined {
  const q = query.toLowerCase();
  return state.customers.find((c) => q.includes(c.name.toLowerCase()) || q.includes(c.company.toLowerCase()));
}

export function getCustomerBundle(state: AppState, customerId: string) {
  return {
    customer: state.customers.find((c) => c.id === customerId),
    deals: state.deals.filter((d) => d.customerId === customerId),
    invoices: state.invoices.filter((i) => i.customerId === customerId),
    emails: state.emails.filter((e) => e.customerId === customerId),
    files: state.files.filter((f) => f.customerId === customerId),
    tasks: state.tasks.filter((t) => t.customerId === customerId),
  };
}

export function customerName(state: AppState, customerId?: string): string {
  if (!customerId) return "—";
  return state.customers.find((c) => c.id === customerId)?.name ?? "Unknown";
}

// ── Mutations ────────────────────────────────────────────────────────

export function addAuditEvent(event: Omit<AuditEvent, "id" | "timestamp">) {
  appStore.set((s) => ({
    ...s,
    audit: [{ ...event, id: uid("audit"), timestamp: now() }, ...s.audit],
  }));
}

export function addDriveFile(file: Omit<DriveFile, "id" | "modified"> & { modified?: string }): DriveFile {
  const newFile: DriveFile = { ...file, id: uid("file"), modified: file.modified ?? "Just now" };
  appStore.set((s) => ({ ...s, files: [newFile, ...s.files] }));
  return newFile;
}

export function addApproval(request: Omit<ApprovalRequest, "id" | "createdAt" | "status">): ApprovalRequest {
  const approval: ApprovalRequest = { ...request, id: uid("appr"), createdAt: now(), status: "pending" };
  appStore.set((s) => ({ ...s, approvals: [approval, ...s.approvals] }));
  return approval;
}

export function decideApproval(id: string, decision: "approved" | "rejected") {
  const state = appStore.get();
  const approval = state.approvals.find((a) => a.id === id);
  if (!approval) return;

  appStore.set((s) => ({
    ...s,
    approvals: s.approvals.map((a) => (a.id === id ? { ...a, status: decision } : a)),
  }));

  addAuditEvent({
    actor: "user",
    actorName: "You",
    moduleId: approval.moduleId,
    action: decision === "approved" ? `Approved: ${approval.title}` : `Rejected: ${approval.title}`,
  });

  if (decision === "approved" && approval.payload?.kind === "send-email") {
    const { to, subject, body } = approval.payload;
    appStore.set((s) => ({
      ...s,
      emails: [
        { id: uid("em"), from: `You → ${to}`, subject, body, time: now(), unread: false },
        ...s.emails,
      ],
    }));
    addAuditEvent({
      actor: "agent",
      actorName: "CI Agent",
      moduleId: "ci-mail",
      action: `Sent email to ${to}: "${subject}"`,
    });
  }
}

export function toggleTask(id: string) {
  appStore.set((s) => ({
    ...s,
    tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
  }));
}

export function addTask(title: string) {
  const task: TaskItem = { id: uid("task"), title, done: false, priority: "medium" };
  appStore.set((s) => ({ ...s, tasks: [task, ...s.tasks] }));
}

export function markEmailRead(id: string) {
  appStore.set((s) => ({
    ...s,
    emails: s.emails.map((e) => (e.id === id ? { ...e, unread: false } : e)),
  }));
}

export function moveDealStage(id: string, stage: Deal["stage"]) {
  appStore.set((s) => ({
    ...s,
    deals: s.deals.map((d) => (d.id === id ? { ...d, stage } : d)),
  }));
}

export function markInvoicePaid(id: string) {
  const state = appStore.get();
  const invoice = state.invoices.find((i) => i.id === id);
  appStore.set((s) => ({
    ...s,
    invoices: s.invoices.map((i) => (i.id === id ? { ...i, status: "paid", overdueDays: undefined } : i)),
  }));
  if (invoice) {
    addAuditEvent({
      actor: "user",
      actorName: "You",
      moduleId: "ci-invoicing",
      action: `Marked invoice #${invoice.number} as paid`,
    });
  }
}

export function resetDemoData() {
  appStore.set(SEED);
}
