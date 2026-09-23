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
  SignatureRequest,
  Expense,
  JournalEntry,
  JournalLine,
  Cheque,
  Currency,
  ErpSettings,
  ErpBranch,
  Presentation,
  PresentationSlide,
  DesignProject,
  DesignElement,
  DesignElementType,
  WorkflowRule,
  WorkflowTrigger,
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
  { id: "item-widget-a", sku: "WA-100", name: "Widget A", quantityOnHand: 40, reorderPoint: 20, unitPrice: 12, avgCost: 7.5 },
  { id: "item-widget-b", sku: "WB-200", name: "Widget B", quantityOnHand: 15, reorderPoint: 20, unitPrice: 18, avgCost: 11 },
  { id: "item-assembled-kit", sku: "AK-300", name: "Assembled Kit", quantityOnHand: 0, reorderPoint: 5, unitPrice: 65, avgCost: 26 },
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

const SIGNATURE_REQUESTS: SignatureRequest[] = [
  { id: "sign-acme-renewal", title: "Renewed support agreement", customerId: "cust-acme", documentName: "Acme Ltd. — Support Renewal.pdf", status: "pending" },
  { id: "sign-offer-morgan", title: "New hire offer letter — Morgan Blake", documentName: "Offer Letter — Morgan Blake.pdf", status: "pending" },
];

const EXPENSES: Expense[] = [];

const JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: "jv-0001",
    date: "2026-09-01",
    reference: "September rent",
    currency: "USD",
    status: "posted",
    lines: [
      { accountCode: "6100", accountName: "Rent Expense", debit: 3200, credit: 0 },
      { accountCode: "1000", accountName: "Cash & Bank", debit: 0, credit: 3200 },
    ],
  },
  {
    id: "jv-0002",
    date: "2026-09-15",
    reference: "Acme Ltd. — invoice #1042 collection",
    currency: "USD",
    status: "draft",
    lines: [
      { accountCode: "1000", accountName: "Cash & Bank", debit: 5350, credit: 0 },
      { accountCode: "1100", accountName: "Accounts Receivable", debit: 0, credit: 5350 },
    ],
  },
];

const ERP_SETTINGS: ErpSettings = {
  companyName: "Ci Business OS",
  baseCurrency: "USD",
  fiscalYearStartMonth: 1,
  branches: [{ id: "branch-hq", name: "Headquarters", address: "" }],
};

const PRESENTATIONS: Presentation[] = [
  {
    id: "pres-qbr",
    title: "Q4 Business Review",
    slides: [
      { id: "slide-1", heading: "Q4 Business Review", body: "Ci Business OS — company update" },
      { id: "slide-2", heading: "Pipeline", body: "Nord Retail Group and BlueHarbor deals are progressing through CRM." },
      { id: "slide-3", heading: "Next steps", body: "Close open quotes, clear overdue invoices, launch next campaign." },
    ],
  },
];

const DESIGN_PROJECTS: DesignProject[] = [
  {
    id: "design-social-launch",
    name: "Product Launch — Social Post",
    canvasWidth: 400,
    canvasHeight: 300,
    elements: [
      { id: "el-bg", type: "rect", x: 0, y: 0, w: 400, h: 300, color: "#3457d5" },
      { id: "el-title", type: "text", x: 24, y: 110, w: 350, h: 60, color: "#ffffff", text: "We're live.", fontSize: 32 },
    ],
  },
];

const WORKFLOW_RULES: WorkflowRule[] = [
  {
    id: "wf-overdue-followup",
    name: "Overdue invoice → follow-up task",
    enabled: true,
    trigger: { type: "invoice-overdue", thresholdDays: 7 },
    actionTitleTemplate: "Follow up on overdue invoice #{number} — {customer}",
  },
  {
    id: "wf-low-stock",
    name: "Low stock → reorder task",
    enabled: true,
    trigger: { type: "low-stock" },
    actionTitleTemplate: "Reorder {item} ({qty} left, below reorder point)",
  },
];

const CHEQUES: Cheque[] = [
  {
    id: "chq-0001",
    chequeNo: "004821",
    type: "received",
    party: "Acme Ltd.",
    bank: "Byblos Bank",
    issueDate: "2026-09-10",
    dueDate: "2026-10-10",
    amount: 5350,
    currency: "USD",
    status: "pending",
  },
  {
    id: "chq-0002",
    chequeNo: "112034",
    type: "issued",
    party: "Northwind Supplies",
    bank: "BLOM Bank",
    issueDate: "2026-09-05",
    dueDate: "2026-09-05",
    amount: 4300,
    currency: "USD",
    status: "cleared",
  },
];

/**
 * The catalog CI Marketplace renders. Each id is checked by the exact
 * mutation function that performs the automation it names — turning one
 * off doesn't disable a UI element, it changes what that function does.
 */
export const AUTOMATION_CATALOG = [
  { id: "quote-accepted-advances-deal", name: "Accepted quote advances its CRM deal", description: "CI Sales → CI CRM: accepting a quote moves its linked deal to Won." },
  { id: "po-approved-receives-stock", name: "Approved PO receives inventory", description: "CI Purchasing → CI Inventory: approving a linked PO adds its quantity to stock." },
] as const;

const AUTOMATIONS: Record<string, boolean> = {
  "quote-accepted-advances-deal": true,
  "po-approved-receives-stock": true,
};

const GOVERNANCE = { poAutoApproveThreshold: 0 };

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
  signatureRequests: SIGNATURE_REQUESTS,
  expenses: EXPENSES,
  journalEntries: JOURNAL_ENTRIES,
  cheques: CHEQUES,
  erp: ERP_SETTINGS,
  presentations: PRESENTATIONS,
  designProjects: DESIGN_PROJECTS,
  workflowRules: WORKFLOW_RULES,
  firedWorkflowKeys: [],
  automations: AUTOMATIONS,
  governance: GOVERNANCE,
  dismissedNotificationIds: [],
  uiPreferences: { wallpaper: "default" },
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

/**
 * CI PDF works on CI Drive's own files rather than a separate document
 * type — `DriveFile.type` already distinguishes "pdf" from "doc"/"sheet",
 * so converting or merging just files a new real Drive record, the same
 * pattern CI Sign and CI Scan use for "produces a real filed document."
 */
export function convertToPdf(fileId: string): DriveFile | undefined {
  const file = appStore.get().files.find((f) => f.id === fileId);
  if (!file || file.type === "pdf") return undefined;
  const pdf = addDriveFile({
    name: `${file.name.replace(/\.[^.]+$/, "")}.pdf`,
    type: "pdf",
    owner: file.owner,
    customerId: file.customerId,
  });
  addAuditEvent({ actor: "user", actorName: "You", moduleId: "ci-pdf", action: `Converted "${file.name}" to PDF — filed "${pdf.name}" in CI Drive` });
  return pdf;
}

export function mergePdfFiles(fileIds: string[], mergedName: string): DriveFile | undefined {
  const state = appStore.get();
  const sources = fileIds.map((id) => state.files.find((f) => f.id === id)).filter((f): f is DriveFile => Boolean(f));
  if (sources.length < 2) return undefined;
  const merged = addDriveFile({ name: mergedName, type: "pdf", owner: sources[0].owner });
  addAuditEvent({
    actor: "user",
    actorName: "You",
    moduleId: "ci-pdf",
    action: `Merged ${sources.length} file(s) (${sources.map((f) => f.name).join(", ")}) into "${merged.name}"`,
  });
  return merged;
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
    // Gated by CI Marketplace, same as the quote/deal automation above.
    if (decision === "approved" && po?.itemId && po.quantity && appStore.get().automations["po-approved-receives-stock"]) {
      receiveStock(po.itemId, po.quantity);
    }
  }
}

export function receiveStock(itemId: string, quantity: number, unitCost?: number) {
  const item = appStore.get().inventory.find((i) => i.id === itemId);
  if (!item) return;
  // Weighted-average cost: blend what's already on the shelf with what just
  // arrived, weighted by quantity — never a flat overwrite, so the cost
  // basis stays true even when the same item was bought at different prices
  // across multiple receipts.
  const oldQty = item.quantityOnHand;
  const oldCost = item.avgCost ?? item.unitPrice;
  const inCost = unitCost ?? oldCost;
  const newQty = oldQty + quantity;
  const newAvgCost = newQty > 0 ? (oldQty * oldCost + quantity * inCost) / newQty : inCost;

  appStore.set((s) => ({
    ...s,
    inventory: s.inventory.map((i) =>
      i.id === itemId ? { ...i, quantityOnHand: newQty, avgCost: Math.round(newAvgCost * 100) / 100 } : i
    ),
  }));
  addAuditEvent({
    actor: "system",
    actorName: "Ci Business OS",
    moduleId: "ci-inventory",
    action: `Received ${quantity} unit(s) of ${item.name} (${item.sku}) from an approved purchase order — avg cost now $${newAvgCost.toFixed(2)}`,
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
  const state = appStore.get();
  const underThreshold = amount <= state.governance.poAutoApproveThreshold;
  const po: PurchaseOrder = { id: uid("po"), supplierId, description, amount, status: underThreshold ? "approved" : "pending" };
  appStore.set((s) => ({ ...s, purchaseOrders: [po, ...s.purchaseOrders] }));

  if (underThreshold) {
    // CI Governance's threshold means this never touches a human queue —
    // it's approved the instant it's created, the same way a real spend
    // policy lets small purchases through without a manager's sign-off.
    addAuditEvent({
      actor: "system",
      actorName: "Ci Business OS",
      moduleId: "ci-governance",
      action: `Auto-approved PO ${po.id} ($${amount.toLocaleString()}) — under the $${state.governance.poAutoApproveThreshold.toLocaleString()} threshold`,
    });
    return;
  }

  addApproval({
    title: `Purchase order ${po.id} — $${amount.toLocaleString()} to ${customerName(state, supplierId)}`,
    description,
    moduleId: "ci-purchasing",
    createdBy: "user",
    payload: { kind: "purchase-order", purchaseOrderId: po.id },
  });
}

export function setPoAutoApproveThreshold(value: number) {
  appStore.set((s) => ({ ...s, governance: { ...s.governance, poAutoApproveThreshold: value } }));
  addAuditEvent({ actor: "user", actorName: "You", moduleId: "ci-governance", action: `Set PO auto-approve threshold to $${value.toLocaleString()}` });
}

export function setAutomationEnabled(id: string, enabled: boolean) {
  appStore.set((s) => ({ ...s, automations: { ...s.automations, [id]: enabled } }));
  addAuditEvent({ actor: "user", actorName: "You", moduleId: "ci-marketplace", action: `${enabled ? "Enabled" : "Disabled"} automation "${id}"` });
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

export function startProduction(id: string) {
  const order = appStore.get().productionOrders.find((o) => o.id === id);
  if (!order || (order.status !== "pending" && order.status !== "paused")) return;
  appStore.set((s) => ({
    ...s,
    productionOrders: s.productionOrders.map((o) =>
      o.id === id ? { ...o, status: "in-progress", startedAt: o.startedAt ?? now() } : o
    ),
  }));
  addAuditEvent({ actor: "user", actorName: "You", moduleId: "ci-manufacturing", action: `Started "${order.name}"` });
}

export function pauseProduction(id: string) {
  const order = appStore.get().productionOrders.find((o) => o.id === id);
  if (!order || order.status !== "in-progress") return;
  appStore.set((s) => ({ ...s, productionOrders: s.productionOrders.map((o) => (o.id === id ? { ...o, status: "paused" } : o)) }));
  addAuditEvent({ actor: "user", actorName: "You", moduleId: "ci-manufacturing", action: `Paused "${order.name}"` });
}

export function cancelProduction(id: string) {
  const order = appStore.get().productionOrders.find((o) => o.id === id);
  if (!order || order.status === "completed") return;
  appStore.set((s) => ({ ...s, productionOrders: s.productionOrders.map((o) => (o.id === id ? { ...o, status: "cancelled" } : o)) }));
  addAuditEvent({ actor: "user", actorName: "You", moduleId: "ci-manufacturing", action: `Cancelled "${order.name}"` });
}

/**
 * Completing a run reconciles actual material use against the plan rather
 * than assuming they match — real production wastes material, so `actuals`
 * (itemId -> quantity really consumed) overrides the planned BOM quantity
 * per input where supplied, the same distinction StockSales-style shop-floor
 * systems draw between "what the BOM called for" and "what the floor used."
 */
export function completeProduction(id: string, actuals: Record<string, number> = {}) {
  const state = appStore.get();
  const order = state.productionOrders.find((o) => o.id === id);
  if (!order || !["pending", "in-progress", "paused"].includes(order.status)) return;

  const resolved = order.inputs.map((input) => ({
    ...input,
    consumed: Math.max(0, actuals[input.itemId] ?? input.quantity),
  }));
  const canFulfill = resolved.every((input) => {
    const item = state.inventory.find((i) => i.id === input.itemId);
    return item && item.quantityOnHand >= input.consumed;
  });
  if (!canFulfill) return;

  appStore.set((s) => ({
    ...s,
    inventory: s.inventory.map((item) => {
      const consumed = resolved.find((i) => i.itemId === item.id);
      if (consumed) return { ...item, quantityOnHand: item.quantityOnHand - consumed.consumed };
      if (item.id === order.outputItemId) return { ...item, quantityOnHand: item.quantityOnHand + order.outputQuantity };
      return item;
    }),
    productionOrders: s.productionOrders.map((o) =>
      o.id === id ? { ...o, status: "completed", inputs: resolved, completedAt: now(), startedAt: o.startedAt ?? now() } : o
    ),
  }));

  const outputItem = state.inventory.find((i) => i.id === order.outputItemId);
  const variance = resolved.filter((i) => i.consumed !== i.quantity);
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
    action: `Consumed ${resolved.map((i) => `${i.consumed}x ${state.inventory.find((x) => x.id === i.itemId)?.name ?? i.itemId}`).join(", ")} for "${order.name}"${
      variance.length > 0
        ? ` — actual differed from planned for ${variance.map((v) => state.inventory.find((x) => x.id === v.itemId)?.name ?? v.itemId).join(", ")}`
        : ""
    }`,
  });
}

/**
 * Flexible-packaging BOM math: given a bag's geometry and the laminate
 * layers that make it, returns the film area, weight per piece, total
 * material weight per layer, and the metering (linear meters of film a
 * production line needs to run) — the actual calculation a converting
 * plant uses to plan a run, not a placeholder estimate.
 */
export interface BagMaterial {
  name: string;
  /** grams per cm² of film at this material's thickness — grammage factor */
  factor: number;
}

export type BagKind = "doypack" | "centerSeal" | "sideSeal" | "flatBag";

export interface BagMeteringResult {
  effectiveFilmWidthCm: number;
  weightPerPieceG: number;
  totalWeightKg: number;
  meteringMeters: number;
  layers: { material: string; weightKg: number }[];
}

export function calculateBagMetering(
  kind: BagKind,
  lengthCm: number,
  widthCm: number,
  gussetCm: number,
  quantity: number,
  materials: BagMaterial[]
): BagMeteringResult {
  let areaCm2PerPiece: number;
  let effectiveFilmWidthCm: number;

  if (kind === "centerSeal") {
    effectiveFilmWidthCm = (widthCm + gussetCm) * 2 + 3;
    areaCm2PerPiece = effectiveFilmWidthCm * lengthCm;
  } else if (kind === "sideSeal") {
    effectiveFilmWidthCm = (widthCm + gussetCm) * 2 + 1.5;
    areaCm2PerPiece = effectiveFilmWidthCm * lengthCm;
  } else if (kind === "doypack") {
    areaCm2PerPiece = lengthCm * 2 * widthCm + gussetCm * widthCm;
    effectiveFilmWidthCm = widthCm;
  } else {
    areaCm2PerPiece = lengthCm * widthCm;
    effectiveFilmWidthCm = widthCm;
  }

  const weightPerPieceG = materials.reduce((sum, m) => sum + areaCm2PerPiece * m.factor, 0);
  const totalWeightKg = (weightPerPieceG * quantity) / 1000;
  const meteringMeters = (effectiveFilmWidthCm * quantity) / 100;
  const layers = materials.map((m) => ({
    material: m.name,
    weightKg: Math.round(((areaCm2PerPiece * m.factor * quantity) / 1000) * 10000) / 10000,
  }));

  return {
    effectiveFilmWidthCm: Math.round(effectiveFilmWidthCm * 100) / 100,
    weightPerPieceG: Math.round(weightPerPieceG * 10000) / 10000,
    totalWeightKg: Math.round(totalWeightKg * 100) / 100,
    meteringMeters: Math.round(meteringMeters * 100) / 100,
    layers,
  };
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
  // A locked quote (already accepted or declined) is final — the same
  // reason a confirmed proforma invoice can't be re-sent or re-decided.
  if (!quote || quote.locked) return;

  const locked = decision === "accepted" || decision === "declined";
  appStore.set((s) => ({
    ...s,
    quotes: s.quotes.map((q) => (q.id === id ? { ...q, status: decision, locked } : q)),
  }));

  addAuditEvent({
    actor: "user",
    actorName: "You",
    moduleId: "ci-sales",
    action: `Quote "${quote.description}" marked ${decision}`,
  });

  // Accepting a quote is a business event, not just a status flip — the
  // linked CRM deal should reflect it without a human re-entering the
  // same fact in a second module. Gated by CI Marketplace: turning this
  // automation off means the human keeps that step for themselves.
  if (decision === "accepted" && quote.dealId && appStore.get().automations["quote-accepted-advances-deal"]) {
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

export function signDocument(id: string) {
  const request = appStore.get().signatureRequests.find((r) => r.id === id);
  if (!request || request.status !== "pending") return;

  appStore.set((s) => ({
    ...s,
    signatureRequests: s.signatureRequests.map((r) => (r.id === id ? { ...r, status: "signed", signedAt: now() } : r)),
  }));
  addDriveFile({ customerId: request.customerId, name: request.documentName, type: "pdf", owner: "You" });
  addAuditEvent({
    actor: "user",
    actorName: "You",
    moduleId: "ci-sign",
    action: `Signed "${request.title}", filed "${request.documentName}" in CI Drive`,
  });
}

export function declineSignature(id: string) {
  const request = appStore.get().signatureRequests.find((r) => r.id === id);
  if (!request || request.status !== "pending") return;
  appStore.set((s) => ({
    ...s,
    signatureRequests: s.signatureRequests.map((r) => (r.id === id ? { ...r, status: "declined" } : r)),
  }));
  addAuditEvent({ actor: "user", actorName: "You", moduleId: "ci-sign", action: `Declined "${request.title}"` });
}

export function endMeeting(id: string, actionItemsText: string) {
  const meeting = appStore.get().meetings.find((m) => m.id === id);
  if (!meeting) return;
  const lines = actionItemsText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  for (const line of lines) addTask(`${line} (from "${meeting.title}")`);

  appStore.set((s) => ({
    ...s,
    meetings: s.meetings.map((m) => (m.id === id ? { ...m, completed: true } : m)),
  }));
  addAuditEvent({
    actor: "user",
    actorName: "You",
    moduleId: "ci-meet",
    action: `Ended "${meeting.title}", created ${lines.length} task(s) in CI Tasks`,
  });
}

/**
 * A stand-in for OCR: rather than pretend to read pixels, it parses
 * plain text the way a real OCR/document-intelligence step would hand it
 * off — the point (proving "capture -> structured record -> filed
 * document") doesn't depend on where the text came from.
 */
export function scanReceipt(rawText: string) {
  const lines = rawText.split("\n").map((l) => l.trim()).filter(Boolean);
  const vendor = lines[0] || "Unknown vendor";
  const amountMatch = rawText.match(/\$?\s?(\d+(?:\.\d{2})?)/);
  const amount = amountMatch ? Number(amountMatch[1]) : 0;

  const expense: Expense = { id: uid("exp"), vendor, amount, scannedAt: now() };
  appStore.set((s) => ({ ...s, expenses: [expense, ...s.expenses] }));
  const file = addDriveFile({ name: `Receipt — ${vendor}.pdf`, type: "pdf", owner: "CI Agent" });
  addAuditEvent({
    actor: "agent",
    actorName: "CI Agent",
    moduleId: "ci-scan",
    action: `Scanned receipt from ${vendor} for $${amount.toLocaleString()}, filed "${file.name}" in CI Drive`,
  });
}

/**
 * CI Archive doesn't hold a private copy of "archived files" — it's a
 * filtered view of the exact same CI Drive files, the same pattern CI
 * Notifications established for Home. Archiving a file here is also
 * what makes CI Drive itself stop showing it: one flag, two screens.
 */
export function archiveFile(id: string) {
  const file = appStore.get().files.find((f) => f.id === id);
  if (!file) return;
  appStore.set((s) => ({ ...s, files: s.files.map((f) => (f.id === id ? { ...f, archived: true } : f)) }));
  addAuditEvent({ actor: "user", actorName: "You", moduleId: "ci-archive", action: `Archived "${file.name}"` });
}

export function restoreFromArchive(id: string) {
  const file = appStore.get().files.find((f) => f.id === id);
  if (!file) return;
  appStore.set((s) => ({ ...s, files: s.files.map((f) => (f.id === id ? { ...f, archived: false } : f)) }));
  addAuditEvent({ actor: "user", actorName: "You", moduleId: "ci-archive", action: `Restored "${file.name}" from archive` });
}

/**
 * CI Data Hub's import doesn't write to a staging table of its own — it
 * calls into the same customer list CI Contacts, CI Forms and CI Website
 * all read and write, skipping rows whose email already exists rather
 * than creating a duplicate.
 */
export function importCustomersCsv(csvText: string): { imported: number; skipped: number } {
  const state = appStore.get();
  const existingEmails = new Set(state.customers.map((c) => c.email.toLowerCase()));
  const rows = csvText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(",").map((cell) => cell.trim()));

  const newCustomers: Customer[] = [];
  let skipped = 0;
  for (const [name, email, company] of rows) {
    if (!name || !email) continue;
    if (existingEmails.has(email.toLowerCase())) {
      skipped++;
      continue;
    }
    existingEmails.add(email.toLowerCase());
    newCustomers.push({ id: uid("cust"), name, email, company: company || name, tags: ["imported"] });
  }

  if (newCustomers.length > 0) {
    appStore.set((s) => ({ ...s, customers: [...s.customers, ...newCustomers] }));
  }
  addAuditEvent({
    actor: "user",
    actorName: "You",
    moduleId: "ci-data-hub",
    action: `Imported ${newCustomers.length} customer(s) from CSV (${skipped} skipped as duplicates)`,
  });
  return { imported: newCustomers.length, skipped };
}

export function exportCustomersCsv(state: AppState): string {
  const header = "name,email,company,tags";
  const rows = state.customers.map((c) => `${c.name},${c.email},${c.company},"${c.tags.join(";")}"`);
  return [header, ...rows].join("\n");
}

/**
 * A journal entry is created in draft — editable, not yet real — and only
 * takes effect on the ledger once posted. Posting is gated on debit ===
 * credit, the same non-negotiable rule any double-entry ledger enforces;
 * a journal that doesn't balance is refused rather than posted wrong.
 */
export function createJournalEntry(reference: string, currency: Currency, lines: JournalLine[]): JournalEntry {
  const entry: JournalEntry = {
    id: uid("jv"),
    date: now().slice(0, 10),
    reference,
    currency,
    lines,
    status: "draft",
  };
  appStore.set((s) => ({ ...s, journalEntries: [entry, ...s.journalEntries] }));
  addAuditEvent({ actor: "user", actorName: "You", moduleId: "ci-accounting", action: `Created draft journal entry "${reference}"` });
  return entry;
}

export function postJournalEntry(id: string): { ok: boolean; error?: string } {
  const entry = appStore.get().journalEntries.find((j) => j.id === id);
  if (!entry) return { ok: false, error: "Journal entry not found" };
  if (entry.status !== "draft") return { ok: false, error: "Only draft entries can be posted" };
  const debit = entry.lines.reduce((sum, l) => sum + l.debit, 0);
  const credit = entry.lines.reduce((sum, l) => sum + l.credit, 0);
  if (Math.round((debit - credit) * 100) !== 0) {
    return { ok: false, error: `Not balanced — debit $${debit.toFixed(2)} vs. credit $${credit.toFixed(2)}` };
  }
  appStore.set((s) => ({ ...s, journalEntries: s.journalEntries.map((j) => (j.id === id ? { ...j, status: "posted" } : j)) }));
  addAuditEvent({ actor: "user", actorName: "You", moduleId: "ci-accounting", action: `Posted journal entry "${entry.reference}"` });
  return { ok: true };
}

export function cancelJournalEntry(id: string) {
  const entry = appStore.get().journalEntries.find((j) => j.id === id);
  if (!entry || entry.status === "cancelled") return;
  appStore.set((s) => ({ ...s, journalEntries: s.journalEntries.map((j) => (j.id === id ? { ...j, status: "cancelled" } : j)) }));
  addAuditEvent({ actor: "user", actorName: "You", moduleId: "ci-accounting", action: `Cancelled journal entry "${entry.reference}"` });
}

export function createCheque(cheque: Omit<Cheque, "id" | "status">): Cheque {
  const record: Cheque = { ...cheque, id: uid("chq"), status: "pending" };
  appStore.set((s) => ({ ...s, cheques: [record, ...s.cheques] }));
  addAuditEvent({
    actor: "user",
    actorName: "You",
    moduleId: "ci-accounting",
    action: `Recorded ${cheque.type} cheque #${cheque.chequeNo} — $${cheque.amount.toLocaleString()} ${cheque.currency}, due ${cheque.dueDate}`,
  });
  return record;
}

/** Post-dated cheques move pending → deposited → cleared, or returned
 * (bounced) / cancelled at any point before clearing — the same ladder
 * banks and accounting teams actually track them through. */
export function updateChequeStatus(id: string, status: Cheque["status"]) {
  const cheque = appStore.get().cheques.find((c) => c.id === id);
  if (!cheque) return;
  appStore.set((s) => ({ ...s, cheques: s.cheques.map((c) => (c.id === id ? { ...c, status } : c)) }));
  addAuditEvent({
    actor: "user",
    actorName: "You",
    moduleId: "ci-accounting",
    action: `Cheque #${cheque.chequeNo} marked ${status}`,
  });
}

/**
 * CI ERP Core's master data — company name, base currency, fiscal year,
 * and branches. Every business module (Manufacturing, Inventory,
 * Purchasing, Accounting, Sales, HR, Payroll) sits under this one profile,
 * the same way a real ERP's admin/setup area anchors everything else.
 */
export function updateCompanyProfile(patch: Partial<Pick<ErpSettings, "companyName" | "baseCurrency" | "fiscalYearStartMonth">>) {
  appStore.set((s) => ({ ...s, erp: { ...s.erp, ...patch } }));
  addAuditEvent({ actor: "user", actorName: "You", moduleId: "ci-erp-core", action: "Updated company profile" });
}

export function addBranch(name: string, address: string) {
  const branch: ErpBranch = { id: uid("branch"), name, address };
  appStore.set((s) => ({ ...s, erp: { ...s.erp, branches: [...s.erp.branches, branch] } }));
  addAuditEvent({ actor: "user", actorName: "You", moduleId: "ci-erp-core", action: `Added branch "${name}"` });
}

export function removeBranch(id: string) {
  const branch = appStore.get().erp.branches.find((b) => b.id === id);
  if (!branch) return;
  appStore.set((s) => ({ ...s, erp: { ...s.erp, branches: s.erp.branches.filter((b) => b.id !== id) } }));
  addAuditEvent({ actor: "user", actorName: "You", moduleId: "ci-erp-core", action: `Removed branch "${branch.name}"` });
}

export function createPresentation(title: string): Presentation {
  const presentation: Presentation = {
    id: uid("pres"),
    title,
    slides: [{ id: uid("slide"), heading: title, body: "" }],
  };
  appStore.set((s) => ({ ...s, presentations: [presentation, ...s.presentations] }));
  addAuditEvent({ actor: "user", actorName: "You", moduleId: "ci-present", action: `Created presentation "${title}"` });
  return presentation;
}

export function addSlide(presentationId: string) {
  const slide: PresentationSlide = { id: uid("slide"), heading: "New slide", body: "" };
  appStore.set((s) => ({
    ...s,
    presentations: s.presentations.map((p) => (p.id === presentationId ? { ...p, slides: [...p.slides, slide] } : p)),
  }));
}

export function updateSlide(presentationId: string, slideId: string, patch: Partial<PresentationSlide>) {
  appStore.set((s) => ({
    ...s,
    presentations: s.presentations.map((p) =>
      p.id === presentationId ? { ...p, slides: p.slides.map((sl) => (sl.id === slideId ? { ...sl, ...patch } : sl)) } : p
    ),
  }));
}

export function deleteSlide(presentationId: string, slideId: string) {
  appStore.set((s) => ({
    ...s,
    presentations: s.presentations.map((p) =>
      p.id === presentationId ? { ...p, slides: p.slides.filter((sl) => sl.id !== slideId) } : p
    ),
  }));
}

export function reorderSlide(presentationId: string, slideId: string, direction: -1 | 1) {
  appStore.set((s) => ({
    ...s,
    presentations: s.presentations.map((p) => {
      if (p.id !== presentationId) return p;
      const i = p.slides.findIndex((sl) => sl.id === slideId);
      const j = i + direction;
      if (i < 0 || j < 0 || j >= p.slides.length) return p;
      const slides = [...p.slides];
      [slides[i], slides[j]] = [slides[j], slides[i]];
      return { ...p, slides };
    }),
  }));
}

export function createDesignProject(name: string): DesignProject {
  const project: DesignProject = { id: uid("design"), name, canvasWidth: 400, canvasHeight: 300, elements: [] };
  appStore.set((s) => ({ ...s, designProjects: [project, ...s.designProjects] }));
  addAuditEvent({ actor: "user", actorName: "You", moduleId: "ci-design", action: `Created design "${name}"` });
  return project;
}

export function addDesignElement(projectId: string, type: DesignElementType) {
  const base: Record<DesignElementType, Partial<DesignElement>> = {
    rect: { w: 120, h: 80, color: "#3457d5" },
    circle: { w: 80, h: 80, color: "#6d4fd1" },
    text: { w: 160, h: 40, color: "#1a1f27", text: "Text", fontSize: 18 },
  };
  const element: DesignElement = { id: uid("el"), type, x: 20, y: 20, w: 100, h: 60, color: "#3457d5", ...base[type] };
  appStore.set((s) => ({
    ...s,
    designProjects: s.designProjects.map((p) => (p.id === projectId ? { ...p, elements: [...p.elements, element] } : p)),
  }));
}

export function updateDesignElement(projectId: string, elementId: string, patch: Partial<DesignElement>) {
  appStore.set((s) => ({
    ...s,
    designProjects: s.designProjects.map((p) =>
      p.id === projectId ? { ...p, elements: p.elements.map((el) => (el.id === elementId ? { ...el, ...patch } : el)) } : p
    ),
  }));
}

export function deleteDesignElement(projectId: string, elementId: string) {
  appStore.set((s) => ({
    ...s,
    designProjects: s.designProjects.map((p) =>
      p.id === projectId ? { ...p, elements: p.elements.filter((el) => el.id !== elementId) } : p
    ),
  }));
}

export function createWorkflowRule(name: string, trigger: WorkflowTrigger, actionTitleTemplate: string): WorkflowRule {
  const rule: WorkflowRule = { id: uid("wf"), name, enabled: true, trigger, actionTitleTemplate };
  appStore.set((s) => ({ ...s, workflowRules: [rule, ...s.workflowRules] }));
  addAuditEvent({ actor: "user", actorName: "You", moduleId: "ci-workflow-engine", action: `Created rule "${name}"` });
  return rule;
}

export function setWorkflowRuleEnabled(id: string, enabled: boolean) {
  appStore.set((s) => ({ ...s, workflowRules: s.workflowRules.map((r) => (r.id === id ? { ...r, enabled } : r)) }));
}

export function deleteWorkflowRule(id: string) {
  appStore.set((s) => ({ ...s, workflowRules: s.workflowRules.filter((r) => r.id !== id) }));
}

/**
 * The actual "when X in module A, do Y in module B" engine: a human
 * authors a rule (trigger + task-title template) through CI Workflow
 * Engine's own screen, no code change required, and this evaluates every
 * enabled rule against the live shared state. Each match creates a real
 * CI Task exactly once — `firedWorkflowKeys` is the dedup ledger so
 * running this repeatedly never spams duplicate tasks for the same
 * invoice/item/quote. This is the generalized version of what CI
 * Marketplace's automations do one hardcoded pair at a time.
 */
export function runWorkflows(): number {
  const state = appStore.get();
  const fired = new Set(state.firedWorkflowKeys);
  const newTasks: TaskItem[] = [];
  const newKeys: string[] = [];

  for (const rule of state.workflowRules) {
    if (!rule.enabled) continue;

    if (rule.trigger.type === "invoice-overdue") {
      for (const inv of state.invoices) {
        const key = `${rule.id}:${inv.id}`;
        if (fired.has(key)) continue;
        if (inv.status === "overdue" && (inv.overdueDays ?? 0) >= rule.trigger.thresholdDays) {
          const title = rule.actionTitleTemplate
            .replace("{number}", inv.number)
            .replace("{customer}", customerName(state, inv.customerId));
          newTasks.push({ id: uid("task"), title, done: false, priority: "high", customerId: inv.customerId });
          newKeys.push(key);
        }
      }
    } else if (rule.trigger.type === "low-stock") {
      for (const item of state.inventory) {
        const key = `${rule.id}:${item.id}`;
        if (fired.has(key)) continue;
        if (item.quantityOnHand < item.reorderPoint) {
          const title = rule.actionTitleTemplate.replace("{item}", item.name).replace("{qty}", String(item.quantityOnHand));
          newTasks.push({ id: uid("task"), title, done: false, priority: "medium" });
          newKeys.push(key);
        }
      }
    } else if (rule.trigger.type === "quote-stalled") {
      for (const quote of state.quotes) {
        const key = `${rule.id}:${quote.id}`;
        if (fired.has(key)) continue;
        if (quote.status === rule.trigger.thresholdStatus) {
          const title = rule.actionTitleTemplate
            .replace("{customer}", customerName(state, quote.customerId))
            .replace("{description}", quote.description);
          newTasks.push({ id: uid("task"), title, done: false, priority: "medium", customerId: quote.customerId });
          newKeys.push(key);
        }
      }
    }
  }

  if (newTasks.length > 0) {
    appStore.set((s) => ({
      ...s,
      tasks: [...newTasks, ...s.tasks],
      firedWorkflowKeys: [...s.firedWorkflowKeys, ...newKeys],
    }));
    addAuditEvent({
      actor: "system",
      actorName: "Ci Business OS",
      moduleId: "ci-workflow-engine",
      action: `Ran workflow rules — created ${newTasks.length} task(s): ${newTasks.map((t) => t.title).join("; ")}`,
    });
  }

  return newTasks.length;
}

export function setWallpaper(key: string) {
  appStore.set((s) => ({ ...s, uiPreferences: { ...s.uiPreferences, wallpaper: key } }));
}

export function resetDemoData() {
  appStore.set(SEED);
}
