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
  Meeting,
  SupportTicket,
  Project,
  Quote,
  PurchaseOrder,
  Employee,
  InventoryItem,
  Campaign,
  ProductionOrder,
  Contract,
  CompliancePolicy,
  Candidate,
  Sale,
  Shipment,
  Asset,
  Article,
  ChatChannel,
  ChatMessage,
  FormSubmission,
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

const PROJECTS: Project[] = [
  { id: "proj-q3-rollout", name: "Q3 Rollout", dueDate: "2026-09-30", status: "on-track" },
];

const TASKS: TaskItem[] = [
  { id: "task-1", title: "Approve PO-2201 for Northwind Supplies", done: false, priority: "high", customerId: "cust-northwind" },
  { id: "task-2", title: "Review Q3 rollout timeline", done: false, priority: "medium", projectId: "proj-q3-rollout" },
  { id: "task-3", title: "Send follow-up to Nord Retail Group", done: true, priority: "low", customerId: "cust-nord" },
  { id: "task-4", title: "Finalize rollout comms plan", done: false, priority: "medium", projectId: "proj-q3-rollout" },
  { id: "task-5", title: "Migrate legacy data", done: true, priority: "high", projectId: "proj-q3-rollout" },
];

const QUOTES: Quote[] = [
  { id: "quote-nord", customerId: "cust-nord", dealId: "deal-nord", description: "Enterprise tier — annual", amount: 18000, status: "sent" },
  { id: "quote-blueharbor", customerId: "cust-blueharbor", dealId: "deal-blueharbor", description: "Standard tier — annual", amount: 7200, status: "draft" },
];

const INVENTORY: InventoryItem[] = [
  { id: "item-widget-a", sku: "WA-100", name: "Widget A", quantityOnHand: 40, reorderPoint: 20, unitPrice: 12 },
  { id: "item-widget-b", sku: "WB-200", name: "Widget B", quantityOnHand: 15, reorderPoint: 20, unitPrice: 18 },
  { id: "item-assembled-kit", sku: "AK-300", name: "Assembled Kit", quantityOnHand: 0, reorderPoint: 5, unitPrice: 65 },
];

const SALES: Sale[] = [];

const PRODUCTION_ORDERS: ProductionOrder[] = [
  {
    id: "po-mfg-1",
    name: "Assemble Kits — Batch 1",
    inputs: [
      { itemId: "item-widget-a", quantity: 2 },
      { itemId: "item-widget-b", quantity: 1 },
    ],
    outputItemId: "item-assembled-kit",
    outputQuantity: 1,
    status: "pending",
  },
];

const PURCHASE_ORDERS: PurchaseOrder[] = [
  { id: "po-2201", supplierId: "cust-northwind", description: "Q4 inventory restock — Widget B", amount: 4300, status: "pending", itemId: "item-widget-b", quantity: 50 },
];

const CAMPAIGNS: Campaign[] = [];

const APPROVALS: ApprovalRequest[] = [
  {
    id: "appr-po-2201",
    title: "Purchase order PO-2201 — $4,300 to Northwind Supplies",
    description: "Restocking order for Q4 inventory, within budget.",
    moduleId: "ci-purchasing",
    createdBy: "user",
    status: "pending",
    createdAt: now(),
    payload: { kind: "purchase-order", purchaseOrderId: "po-2201" },
  },
];

const AUDIT: AuditEvent[] = [
  { id: uid("audit"), actor: "system", actorName: "Ci Business OS", moduleId: "ci-home", action: "Workspace initialized with seed data", timestamp: now() },
];

const MEETINGS: Meeting[] = [
  { id: "meet-rollout", title: "Internal — Q3 rollout sync", start: "2026-09-23T16:00:00Z", end: "2026-09-23T16:30:00Z", attendees: ["You", "Ops team"] },
  { id: "meet-nord", customerId: "cust-nord", title: "Pricing call — Nord Retail Group", start: "2026-09-24T15:00:00Z", end: "2026-09-24T15:30:00Z", attendees: ["You", "Nord Retail Group"] },
  { id: "meet-acme", customerId: "cust-acme", title: "Quarterly review — Acme Ltd.", start: "2026-09-25T18:00:00Z", end: "2026-09-25T19:00:00Z", attendees: ["You", "Acme Ltd."] },
];

const TICKETS: SupportTicket[] = [
  { id: "tick-acme-login", customerId: "cust-acme", subject: "Login issue after last update", status: "open", priority: "medium", createdAt: "2026-09-20T10:00:00Z", lastUpdate: "2026-09-21T09:00:00Z" },
  { id: "tick-northwind-delivery", customerId: "cust-northwind", subject: "Delivery delay question", status: "closed", priority: "low", createdAt: "2026-09-10T10:00:00Z", lastUpdate: "2026-09-12T10:00:00Z" },
];

const EMPLOYEES: Employee[] = [
  { id: "emp-1", name: "Jordan Reyes", role: "Account Manager", department: "Sales", startDate: "2024-03-01", status: "active", baseSalary: 72000, ptoBalance: 12 },
  { id: "emp-2", name: "Priya Nair", role: "Support Engineer", department: "Customer Service", startDate: "2023-11-15", status: "active", baseSalary: 68000, ptoBalance: 8 },
  { id: "emp-3", name: "Sam Okafor", role: "Operations Analyst", department: "Operations", startDate: "2026-09-01", status: "onboarding", baseSalary: 60000, ptoBalance: 15 },
];

const CONTRACTS: Contract[] = [
  { id: "contract-acme", customerId: "cust-acme", title: "Annual support agreement", expiresOn: "2026-10-05" },
  { id: "contract-northwind", customerId: "cust-northwind", title: "Vendor supply agreement", expiresOn: "2027-01-15" },
];

const POLICIES: CompliancePolicy[] = [
  { id: "policy-data-retention", name: "Data retention policy", status: "compliant", lastReviewed: "2026-06-01" },
  { id: "policy-access-review", name: "Quarterly access review", status: "needs-review", lastReviewed: "2026-03-15" },
];

const CANDIDATES: Candidate[] = [
  { id: "cand-1", name: "Morgan Blake", role: "Sales Development Rep", department: "Sales", offerSalary: 58000, stage: "interview" },
  { id: "cand-2", name: "Iris Chen", role: "Support Engineer", department: "Customer Service", offerSalary: 64000, stage: "applied" },
];

const SHIPMENTS: Shipment[] = [
  { id: "ship-acme-1", customerId: "cust-acme", description: "Replacement parts — 3 units", status: "pending" },
  { id: "ship-nord-1", customerId: "cust-nord", description: "Initial order — enterprise tier hardware", status: "delivered", carrier: "FastFreight", dispatchedAt: "2026-09-15T09:00:00Z", deliveredAt: "2026-09-18T14:00:00Z" },
];

const ASSETS: Asset[] = [
  { id: "asset-laptop-1", name: "MacBook Pro 16\"", type: "laptop", purchaseDate: "2024-03-01", purchaseCost: 2800, usefulLifeYears: 4, assignedToEmployeeId: "emp-1", status: "in-use" },
  { id: "asset-laptop-2", name: "ThinkPad X1", type: "laptop", purchaseDate: "2023-11-15", purchaseCost: 1900, usefulLifeYears: 4, assignedToEmployeeId: "emp-2", status: "in-use" },
  { id: "asset-phone-1", name: "iPhone 15", type: "phone", purchaseDate: "2025-01-10", purchaseCost: 999, usefulLifeYears: 3, status: "in-storage" },
];

const ARTICLES: Article[] = [
  {
    id: "article-onboarding",
    title: "Employee onboarding checklist",
    body: "1. Add the employee in CI HR.\n2. Assign a laptop and phone in CI Assets.\n3. Grant system access via CI Identity.\n4. Schedule a first-week check-in in CI Calendar.",
    tags: ["hr", "onboarding"],
    updatedAt: "2026-08-01",
  },
  {
    id: "article-overdue",
    title: "How to handle an overdue invoice",
    body: "Ask CI to draft a statement: \"<Customer> hasn't paid, prepare a statement and draft a follow-up email.\" It files the statement in CI Drive and opens a request in CI Approval Center — review the draft before approving, since approving sends it immediately.",
    tags: ["finance", "process"],
    updatedAt: "2026-09-10",
  },
];

const TARGETS: Record<string, number> = {
  "cust-acme": 40000,
  "cust-nord": 20000,
  "cust-northwind": 6000,
  "cust-blueharbor": 10000,
};

const CHANNELS: ChatChannel[] = [
  { id: "chan-general", name: "general" },
  { id: "chan-sales", name: "sales" },
];

const CHAT_MESSAGES: ChatMessage[] = [
  { id: "chat-1", channelId: "chan-general", from: "Priya Nair", text: "Heads up — deploying the Q3 rollout changes this afternoon.", time: "2026-09-22T13:00:00Z" },
  { id: "chat-2", channelId: "chan-general", from: "Sam Okafor", text: "Noted, I'll hold off on the maintenance window until tomorrow.", time: "2026-09-22T13:05:00Z" },
  { id: "chat-3", channelId: "chan-sales", from: "Jordan Reyes", text: "Nord Retail Group's quote just got accepted 🎉", time: "2026-09-22T12:40:00Z" },
];

const FORM_SUBMISSIONS: FormSubmission[] = [];

const SEED: AppState = {
  customers: CUSTOMERS,
  invoices: INVOICES,
  emails: EMAILS,
  files: FILES,
  deals: DEALS,
  tasks: TASKS,
  approvals: APPROVALS,
  audit: AUDIT,
  meetings: MEETINGS,
  tickets: TICKETS,
  targets: TARGETS,
  projects: PROJECTS,
  quotes: QUOTES,
  purchaseOrders: PURCHASE_ORDERS,
  employees: EMPLOYEES,
  inventory: INVENTORY,
  campaigns: CAMPAIGNS,
  productionOrders: PRODUCTION_ORDERS,
  contracts: CONTRACTS,
  policies: POLICIES,
  candidates: CANDIDATES,
  sales: SALES,
  shipments: SHIPMENTS,
  assets: ASSETS,
  articles: ARTICLES,
  channels: CHANNELS,
  chatMessages: CHAT_MESSAGES,
  formSubmissions: FORM_SUBMISSIONS,
  dismissedNotificationIds: [],
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
    meetings: state.meetings.filter((m) => m.customerId === customerId),
    tickets: state.tickets.filter((t) => t.customerId === customerId),
  };
}

export function paidTotalForCustomer(state: AppState, customerId: string): number {
  return state.invoices
    .filter((i) => i.customerId === customerId && i.status === "paid")
    .reduce((sum, i) => sum + i.amount, 0);
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

  if (approval.payload?.kind === "purchase-order") {
    const { purchaseOrderId } = approval.payload;
    const poStatus = decision === "approved" ? "approved" : "rejected";
    const po = appStore.get().purchaseOrders.find((p) => p.id === purchaseOrderId);
    appStore.set((s) => ({
      ...s,
      purchaseOrders: s.purchaseOrders.map((p) => (p.id === purchaseOrderId ? { ...p, status: poStatus } : p)),
    }));
    addAuditEvent({
      actor: "system",
      actorName: "Ci Business OS",
      moduleId: "ci-purchasing",
      action: `Purchase order ${purchaseOrderId} marked ${poStatus} following approval decision`,
    });

    // A PO tied to an inventory item isn't just paperwork — approving it
    // is the real-world event that puts stock on the shelf. CI Inventory
    // reflects that without anyone re-entering the receipt by hand.
    if (decision === "approved" && po?.itemId && po.quantity) {
      receiveStock(po.itemId, po.quantity);
    }
  }
}

export function receiveStock(itemId: string, quantity: number) {
  const item = appStore.get().inventory.find((i) => i.id === itemId);
  if (!item) return;
  appStore.set((s) => ({
    ...s,
    inventory: s.inventory.map((i) => (i.id === itemId ? { ...i, quantityOnHand: i.quantityOnHand + quantity } : i)),
  }));
  addAuditEvent({
    actor: "system",
    actorName: "Ci Business OS",
    moduleId: "ci-inventory",
    action: `Received ${quantity} unit(s) of ${item.name} (${item.sku}) from an approved purchase order`,
  });
}

export function launchCampaign(name: string): Campaign {
  const state = appStore.get();
  const newLeadDeals = state.deals.filter((d) => d.stage === "New");
  const audience = newLeadDeals
    .map((d) => state.customers.find((c) => c.id === d.customerId))
    .filter((c): c is Customer => Boolean(c));

  const campaign: Campaign = { id: uid("camp"), name, status: "active", audienceCount: audience.length, launchedAt: now() };
  appStore.set((s) => ({ ...s, campaigns: [campaign, ...s.campaigns] }));

  const newEmails = audience.map((c) => ({
    id: uid("em"),
    customerId: c.id,
    from: `You → ${c.email}`,
    subject: name,
    body: `Hi ${c.name} team,\n\nWe wanted to reach out with something we think is relevant to where you are today. Happy to set up time if useful.\n\nBest,\nCi Business OS`,
    time: now(),
    unread: false,
  }));
  if (newEmails.length > 0) {
    appStore.set((s) => ({ ...s, emails: [...newEmails, ...s.emails] }));
  }

  addAuditEvent({
    actor: "agent",
    actorName: "CI Agent",
    moduleId: "ci-marketing",
    action: `Launched campaign "${name}" to ${audience.length} New-stage lead(s)`,
    detail: audience.map((c) => c.name).join(", ") || undefined,
  });

  return campaign;
}

export function monthlyPay(employee: Employee): number {
  return employee.baseSalary / 12;
}

export function runPayroll() {
  const state = appStore.get();
  const active = state.employees.filter((e) => e.status !== "offboarded");
  const total = active.reduce((sum, e) => sum + monthlyPay(e), 0);
  addAuditEvent({
    actor: "user",
    actorName: "You",
    moduleId: "ci-payroll",
    action: `Ran payroll for ${active.length} employee(s): $${total.toLocaleString(undefined, { maximumFractionDigits: 0 })} total`,
  });
}

export function createPurchaseOrder(supplierId: string, description: string, amount: number) {
  const po: PurchaseOrder = { id: uid("po"), supplierId, description, amount, status: "pending" };
  appStore.set((s) => ({ ...s, purchaseOrders: [po, ...s.purchaseOrders] }));
  addApproval({
    title: `Purchase order ${po.id} — $${amount.toLocaleString()} to ${customerName(appStore.get(), supplierId)}`,
    description,
    moduleId: "ci-purchasing",
    createdBy: "user",
    payload: { kind: "purchase-order", purchaseOrderId: po.id },
  });
}

export function addEmployee(name: string, role: string, department: string, baseSalary: number) {
  const employee: Employee = {
    id: uid("emp"),
    name,
    role,
    department,
    startDate: now().slice(0, 10),
    status: "onboarding",
    baseSalary,
    ptoBalance: 15,
  };
  appStore.set((s) => ({ ...s, employees: [...s.employees, employee] }));
  addAuditEvent({ actor: "user", actorName: "You", moduleId: "ci-hr", action: `Added employee ${name} (${role})` });
}

export function logTimeOff(employeeId: string, days: number) {
  const employee = appStore.get().employees.find((e) => e.id === employeeId);
  if (!employee || employee.ptoBalance < days) return;
  appStore.set((s) => ({
    ...s,
    employees: s.employees.map((e) => (e.id === employeeId ? { ...e, ptoBalance: e.ptoBalance - days } : e)),
  }));
  addAuditEvent({
    actor: "user",
    actorName: "You",
    moduleId: "ci-attendance",
    action: `Logged ${days} day(s) off for ${employee.name} (${employee.ptoBalance - days} remaining)`,
  });
}

export function completeProduction(id: string) {
  const state = appStore.get();
  const order = state.productionOrders.find((o) => o.id === id);
  if (!order || order.status !== "pending") return;

  const canFulfill = order.inputs.every((input) => {
    const item = state.inventory.find((i) => i.id === input.itemId);
    return item && item.quantityOnHand >= input.quantity;
  });
  if (!canFulfill) return;

  appStore.set((s) => ({
    ...s,
    inventory: s.inventory.map((item) => {
      const consumed = order.inputs.find((i) => i.itemId === item.id);
      if (consumed) return { ...item, quantityOnHand: item.quantityOnHand - consumed.quantity };
      if (item.id === order.outputItemId) return { ...item, quantityOnHand: item.quantityOnHand + order.outputQuantity };
      return item;
    }),
    productionOrders: s.productionOrders.map((o) => (o.id === id ? { ...o, status: "completed" } : o)),
  }));

  const outputItem = state.inventory.find((i) => i.id === order.outputItemId);
  addAuditEvent({
    actor: "user",
    actorName: "You",
    moduleId: "ci-manufacturing",
    action: `Completed "${order.name}" — produced ${order.outputQuantity} unit(s) of ${outputItem?.name ?? order.outputItemId}`,
  });
  addAuditEvent({
    actor: "system",
    actorName: "Ci Business OS",
    moduleId: "ci-inventory",
    action: `Consumed ${order.inputs.map((i) => `${i.quantity}x ${state.inventory.find((x) => x.id === i.itemId)?.name ?? i.itemId}`).join(", ")} for "${order.name}"`,
  });
}

export type ContractStatus = "active" | "expiring-soon" | "expired";

export function contractStatus(expiresOn: string, referenceDate = new Date()): ContractStatus {
  const days = (new Date(expiresOn).getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24);
  if (days < 0) return "expired";
  if (days <= 30) return "expiring-soon";
  return "active";
}

export function renewContract(id: string) {
  const contract = appStore.get().contracts.find((c) => c.id === id);
  if (!contract) return;
  const next = new Date(contract.expiresOn);
  next.setFullYear(next.getFullYear() + 1);
  const nextISO = next.toISOString().slice(0, 10);
  appStore.set((s) => ({
    ...s,
    contracts: s.contracts.map((c) => (c.id === id ? { ...c, expiresOn: nextISO } : c)),
  }));
  addAuditEvent({
    actor: "user",
    actorName: "You",
    moduleId: "ci-contracts",
    action: `Renewed "${contract.title}" through ${nextISO}`,
  });
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

export function scheduleMeeting(title: string, startISO: string, customerId?: string) {
  const start = new Date(startISO);
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  const meeting: Meeting = {
    id: uid("meet"),
    customerId,
    title,
    start: start.toISOString(),
    end: end.toISOString(),
    attendees: ["You"],
  };
  appStore.set((s) => ({ ...s, meetings: [...s.meetings, meeting] }));
  addAuditEvent({ actor: "user", actorName: "You", moduleId: "ci-calendar", action: `Scheduled "${title}"` });
}

export function advanceTicketStatus(id: string) {
  const order: SupportTicket["status"][] = ["open", "pending", "closed"];
  const state = appStore.get();
  const ticket = state.tickets.find((t) => t.id === id);
  if (!ticket) return;
  const next = order[Math.min(order.indexOf(ticket.status) + 1, order.length - 1)];
  appStore.set((s) => ({
    ...s,
    tickets: s.tickets.map((t) => (t.id === id ? { ...t, status: next, lastUpdate: now() } : t)),
  }));
  addAuditEvent({
    actor: "user",
    actorName: "You",
    moduleId: "ci-customer-service",
    action: `Ticket "${ticket.subject}" moved to ${next}`,
  });
}

export function addCustomer(name: string, email: string, company: string) {
  const customer: Customer = { id: uid("cust"), name, email, company, tags: [] };
  appStore.set((s) => ({ ...s, customers: [...s.customers, customer] }));
  addAuditEvent({ actor: "user", actorName: "You", moduleId: "ci-contacts", action: `Added contact ${name}` });
}

export function setTarget(customerId: string, value: number) {
  appStore.set((s) => ({ ...s, targets: { ...s.targets, [customerId]: value } }));
}

export function projectProgress(state: AppState, projectId: string): { done: number; total: number } {
  const tasks = state.tasks.filter((t) => t.projectId === projectId);
  return { done: tasks.filter((t) => t.done).length, total: tasks.length };
}

export function addProject(name: string, dueDate: string) {
  const project: Project = { id: uid("proj"), name, dueDate, status: "on-track" };
  appStore.set((s) => ({ ...s, projects: [...s.projects, project] }));
  addAuditEvent({ actor: "user", actorName: "You", moduleId: "ci-projects", action: `Created project "${name}"` });
}

export function decideQuote(id: string, decision: "sent" | "accepted" | "declined") {
  const state = appStore.get();
  const quote = state.quotes.find((q) => q.id === id);
  if (!quote) return;

  appStore.set((s) => ({
    ...s,
    quotes: s.quotes.map((q) => (q.id === id ? { ...q, status: decision } : q)),
  }));

  addAuditEvent({
    actor: "user",
    actorName: "You",
    moduleId: "ci-sales",
    action: `Quote "${quote.description}" marked ${decision}`,
  });

  // Accepting a quote is a business event, not just a status flip — the
  // linked CRM deal should reflect it without a human re-entering the
  // same fact in a second module.
  if (decision === "accepted" && quote.dealId) {
    moveDealStage(quote.dealId, "Won");
    addAuditEvent({
      actor: "system",
      actorName: "Ci Business OS",
      moduleId: "ci-crm",
      action: `Deal auto-advanced to Won — quote "${quote.description}" was accepted`,
    });
  }
}

export function dismissNotification(id: string) {
  appStore.set((s) => ({ ...s, dismissedNotificationIds: [...s.dismissedNotificationIds, id] }));
}

export function reviewPolicy(id: string) {
  const policy = appStore.get().policies.find((p) => p.id === id);
  if (!policy) return;
  appStore.set((s) => ({
    ...s,
    policies: s.policies.map((p) => (p.id === id ? { ...p, status: "compliant", lastReviewed: now().slice(0, 10) } : p)),
  }));
  addAuditEvent({ actor: "user", actorName: "You", moduleId: "ci-legal", action: `Reviewed policy "${policy.name}" — marked compliant` });
}

const STAGE_ORDER: Candidate["stage"][] = ["applied", "interview", "offer", "hired"];

export function advanceCandidate(id: string) {
  const state = appStore.get();
  const candidate = state.candidates.find((c) => c.id === id);
  if (!candidate || candidate.stage === "hired" || candidate.stage === "rejected") return;
  const next = STAGE_ORDER[Math.min(STAGE_ORDER.indexOf(candidate.stage) + 1, STAGE_ORDER.length - 1)];

  appStore.set((s) => ({
    ...s,
    candidates: s.candidates.map((c) => (c.id === id ? { ...c, stage: next } : c)),
  }));
  addAuditEvent({ actor: "user", actorName: "You", moduleId: "ci-recruit", action: `${candidate.name} moved to ${next}` });

  // Hiring isn't just a label change — it's the real-world event that
  // creates the employee record CI HR (and everything reading it, like
  // CI Payroll and CI Attendance) will show from now on.
  if (next === "hired") {
    addEmployee(candidate.name, candidate.role, candidate.department, candidate.offerSalary);
    addAuditEvent({
      actor: "system",
      actorName: "Ci Business OS",
      moduleId: "ci-hr",
      action: `Created employee record for ${candidate.name} from an accepted offer`,
    });
  }
}

export function rejectCandidate(id: string) {
  const candidate = appStore.get().candidates.find((c) => c.id === id);
  if (!candidate) return;
  appStore.set((s) => ({
    ...s,
    candidates: s.candidates.map((c) => (c.id === id ? { ...c, stage: "rejected" } : c)),
  }));
  addAuditEvent({ actor: "user", actorName: "You", moduleId: "ci-recruit", action: `${candidate.name} rejected` });
}

export function sellStock(itemId: string, quantity: number) {
  const item = appStore.get().inventory.find((i) => i.id === itemId);
  if (!item || item.quantityOnHand < quantity || quantity <= 0) return;
  const total = item.unitPrice * quantity;

  appStore.set((s) => ({
    ...s,
    inventory: s.inventory.map((i) => (i.id === itemId ? { ...i, quantityOnHand: i.quantityOnHand - quantity } : i)),
    sales: [{ id: uid("sale"), itemId, quantity, total, timestamp: now() }, ...s.sales],
  }));
  addAuditEvent({
    actor: "user",
    actorName: "You",
    moduleId: "ci-pos",
    action: `Sold ${quantity}x ${item.name} for $${total.toLocaleString()}`,
  });
}

export function dispatchShipment(id: string, carrier: string) {
  const shipment = appStore.get().shipments.find((s) => s.id === id);
  if (!shipment || shipment.status !== "pending") return;
  appStore.set((s) => ({
    ...s,
    shipments: s.shipments.map((sh) => (sh.id === id ? { ...sh, status: "in-transit", carrier, dispatchedAt: now() } : sh)),
  }));
  addAuditEvent({ actor: "user", actorName: "You", moduleId: "ci-logistics", action: `Dispatched "${shipment.description}" via ${carrier}` });
}

export function deliverShipment(id: string) {
  const shipment = appStore.get().shipments.find((s) => s.id === id);
  if (!shipment || shipment.status !== "in-transit") return;
  appStore.set((s) => ({
    ...s,
    shipments: s.shipments.map((sh) => (sh.id === id ? { ...sh, status: "delivered", deliveredAt: now() } : sh)),
  }));
  addAuditEvent({ actor: "user", actorName: "You", moduleId: "ci-logistics", action: `Marked "${shipment.description}" delivered` });
}

export function assetCurrentValue(asset: Asset, referenceDate = new Date()): number {
  const ageYears = (referenceDate.getTime() - new Date(asset.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  const remaining = Math.max(0, 1 - ageYears / asset.usefulLifeYears);
  return Math.round(asset.purchaseCost * remaining);
}

export function assignAsset(assetId: string, employeeId: string) {
  const state = appStore.get();
  const asset = state.assets.find((a) => a.id === assetId);
  const employee = state.employees.find((e) => e.id === employeeId);
  if (!asset || !employee) return;
  appStore.set((s) => ({
    ...s,
    assets: s.assets.map((a) => (a.id === assetId ? { ...a, assignedToEmployeeId: employeeId, status: "in-use" } : a)),
  }));
  addAuditEvent({ actor: "user", actorName: "You", moduleId: "ci-assets", action: `Assigned "${asset.name}" to ${employee.name}` });
}

export function unassignAsset(assetId: string) {
  const asset = appStore.get().assets.find((a) => a.id === assetId);
  if (!asset) return;
  appStore.set((s) => ({
    ...s,
    assets: s.assets.map((a) => (a.id === assetId ? { ...a, assignedToEmployeeId: undefined, status: "in-storage" } : a)),
  }));
  addAuditEvent({ actor: "user", actorName: "You", moduleId: "ci-assets", action: `Returned "${asset.name}" to storage` });
}

export function saveArticle(id: string, title: string, body: string) {
  appStore.set((s) => ({
    ...s,
    articles: s.articles.map((a) => (a.id === id ? { ...a, title, body, updatedAt: now().slice(0, 10) } : a)),
  }));
  addAuditEvent({ actor: "user", actorName: "You", moduleId: "ci-knowledge", action: `Updated article "${title}"` });
}

export function postMessage(channelId: string, text: string) {
  if (!text.trim()) return;
  appStore.set((s) => ({
    ...s,
    chatMessages: [...s.chatMessages, { id: uid("chat"), channelId, from: "You", text: text.trim(), time: now() }],
  }));
}

export function createTicket(customerId: string, subject: string, priority: "low" | "medium" | "high" = "medium") {
  appStore.set((s) => ({
    ...s,
    tickets: [
      ...s.tickets,
      { id: uid("tick"), customerId, subject, status: "open", priority, createdAt: now(), lastUpdate: now() },
    ],
  }));
}

export function addCandidate(name: string, role: string, department: string, offerSalary: number) {
  appStore.set((s) => ({
    ...s,
    candidates: [...s.candidates, { id: uid("cand"), name, role, department, offerSalary, stage: "applied" }],
  }));
}

function recordFormSubmission(formName: string, summary: string) {
  appStore.set((s) => ({
    ...s,
    formSubmissions: [{ id: uid("sub"), formName, summary, createdAt: now() }, ...s.formSubmissions],
  }));
  addAuditEvent({ actor: "user", actorName: "You", moduleId: "ci-forms", action: `${formName}: ${summary}` });
}

/**
 * CI Forms' whole point: a submission isn't stored as its own opaque
 * blob, it becomes a real record in the module that owns that kind of
 * data — a support ticket, a recruiting candidate — the same way CI
 * Recruit's "hired" stage becomes a real CI HR employee.
 */
export function submitContactForm(name: string, email: string, company: string, message: string) {
  const state = appStore.get();
  let customer = state.customers.find((c) => c.email.toLowerCase() === email.toLowerCase());
  if (!customer) {
    customer = { id: uid("cust"), name, email, company: company || name, tags: ["inbound"] };
    appStore.set((s) => ({ ...s, customers: [...s.customers, customer!] }));
  }
  createTicket(customer.id, message.slice(0, 80) || "Contact request", "medium");
  recordFormSubmission("Contact request form", `Created a ticket for ${customer.name}`);
}

export function submitJobApplicationForm(name: string, role: string, department: string, offerSalary: number) {
  addCandidate(name, role, department, offerSalary);
  recordFormSubmission("Job application form", `Added ${name} to CI Recruit as a candidate`);
}

export interface SearchResult {
  source: string;
  href: string;
  title: string;
  detail: string;
}

/**
 * A real search across the business data every live module writes to —
 * distinct from the module-registry search in the top bar, which only
 * finds modules by name. This finds records.
 */
export function searchAllRecords(state: AppState, query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const results: SearchResult[] = [];
  const push = (source: string, href: string, title: string, detail: string) => results.push({ source, href, title, detail });

  for (const c of state.customers) {
    if (c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.company.toLowerCase().includes(q)) {
      push("CI Contacts", "/modules/contacts", c.name, c.email);
    }
  }
  for (const i of state.invoices) {
    if (i.number.includes(q)) push("CI Invoicing", "/modules/invoicing", `Invoice #${i.number}`, `${customerName(state, i.customerId)} · $${i.amount.toLocaleString()}`);
  }
  for (const e of state.emails) {
    if (e.subject.toLowerCase().includes(q) || e.body.toLowerCase().includes(q)) push("CI Mail", "/modules/mail", e.subject, e.from);
  }
  for (const f of state.files) {
    if (f.name.toLowerCase().includes(q)) push("CI Drive", "/modules/drive", f.name, f.owner);
  }
  for (const t of state.tasks) {
    if (t.title.toLowerCase().includes(q)) push("CI Tasks", "/modules/tasks", t.title, t.done ? "done" : t.priority);
  }
  for (const t of state.tickets) {
    if (t.subject.toLowerCase().includes(q)) push("CI Customer Service", "/modules/customer-service", t.subject, customerName(state, t.customerId));
  }
  for (const c of state.contracts) {
    if (c.title.toLowerCase().includes(q)) push("CI Contracts", "/modules/contracts", c.title, customerName(state, c.customerId));
  }
  for (const e of state.employees) {
    if (e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q)) push("CI HR", "/modules/hr", e.name, e.role);
  }
  for (const a of state.articles) {
    if (a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q)) push("CI Knowledge", "/modules/knowledge", a.title, a.tags.join(", "));
  }
  for (const d of state.deals) {
    if (d.name.toLowerCase().includes(q)) push("CI CRM", "/modules/crm", d.name, `${d.stage} · $${d.value.toLocaleString()}`);
  }
  for (const m of state.chatMessages) {
    if (m.text.toLowerCase().includes(q)) {
      const channel = state.channels.find((c) => c.id === m.channelId);
      push("CI Chat", "/modules/chat", `#${channel?.name ?? m.channelId}`, `${m.from}: ${m.text}`);
    }
  }
  for (const c of state.candidates) {
    if (c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q)) push("CI Recruit", "/modules/recruit", c.name, `${c.role} · ${c.stage}`);
  }

  return results.slice(0, 40);
}

export function resetDemoData() {
  appStore.set(SEED);
}
