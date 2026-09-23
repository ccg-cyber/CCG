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

/**
 * Shared business entities.
 *
 * These are the "one company database" the architecture doc talks about,
 * in miniature: a customer connects to deals, invoices, mail, and files
 * without any module owning a private copy of the truth. Real CI CRM /
 * ERP / Accounting modules replace this with a real database; the shape
 * (entities joined by customerId, read through src/lib/data.ts) carries
 * forward.
 */
export interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  tags: string[];
}

export interface Invoice {
  id: string;
  customerId: string;
  number: string;
  amount: number;
  issuedDate: string;
  dueDate: string;
  status: "paid" | "overdue" | "pending";
  overdueDays?: number;
}

export interface EmailMessage {
  id: string;
  customerId?: string;
  from: string;
  subject: string;
  body: string;
  time: string;
  unread: boolean;
}

export interface DriveFile {
  id: string;
  customerId?: string;
  name: string;
  type: "folder" | "doc" | "pdf" | "sheet";
  modified: string;
  owner: string;
  archived?: boolean;
}

export interface Deal {
  id: string;
  customerId: string;
  name: string;
  value: number;
  stage: "New" | "Qualified" | "Proposal" | "Won";
}

export interface TaskItem {
  id: string;
  title: string;
  done: boolean;
  priority: "low" | "medium" | "high";
  customerId?: string;
  projectId?: string;
}

export interface ApprovalRequest {
  id: string;
  title: string;
  description: string;
  moduleId: string;
  createdBy: "agent" | "user";
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  payload?:
    | {
        kind: "send-email";
        to: string;
        subject: string;
        body: string;
        attachment?: string;
      }
    | {
        kind: "purchase-order";
        purchaseOrderId: string;
      };
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  description: string;
  amount: number;
  status: "pending" | "approved" | "rejected" | "ordered";
  /** When set, approving this PO restocks the linked inventory item automatically. */
  itemId?: string;
  quantity?: number;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  startDate: string;
  status: "active" | "onboarding" | "offboarded";
  /** Annual base salary — the simplest real slice of "payroll". */
  baseSalary: number;
  ptoBalance: number;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  quantityOnHand: number;
  reorderPoint: number;
  unitPrice: number;
  /** Weighted-average purchase cost per unit — recomputed on every receipt as
   * (oldQty*oldCost + receivedQty*receivedCost) / newQty, never overwritten
   * outright, so it reflects the true blended cost of what's on the shelf. */
  avgCost?: number;
}

export interface Sale {
  id: string;
  itemId: string;
  quantity: number;
  total: number;
  timestamp: string;
}

export interface Campaign {
  id: string;
  name: string;
  status: "draft" | "active" | "completed";
  audienceCount: number;
  launchedAt?: string;
}

export interface ProductionOrder {
  id: string;
  name: string;
  /** `quantity` is the planned BOM requirement; `consumed` is filled in at
   * completion with what was actually used — usually the same number, but
   * real production runs waste material, so the two are tracked separately
   * rather than assuming the plan and the actual are always equal. */
  inputs: { itemId: string; quantity: number; consumed?: number }[];
  outputItemId: string;
  outputQuantity: number;
  status: "pending" | "in-progress" | "paused" | "completed" | "cancelled";
  machine?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface Contract {
  id: string;
  customerId: string;
  title: string;
  expiresOn: string;
}

export interface CompliancePolicy {
  id: string;
  name: string;
  status: "compliant" | "needs-review";
  lastReviewed: string;
}

export interface Candidate {
  id: string;
  name: string;
  role: string;
  department: string;
  offerSalary: number;
  stage: "applied" | "interview" | "offer" | "hired" | "rejected";
}

export interface Shipment {
  id: string;
  customerId: string;
  description: string;
  carrier?: string;
  status: "pending" | "in-transit" | "delivered";
  dispatchedAt?: string;
  deliveredAt?: string;
}

export interface Asset {
  id: string;
  name: string;
  type: "laptop" | "phone" | "vehicle" | "furniture" | "license";
  purchaseDate: string;
  purchaseCost: number;
  usefulLifeYears: number;
  assignedToEmployeeId?: string;
  status: "in-use" | "in-storage" | "retired";
}

export interface Article {
  id: string;
  title: string;
  body: string;
  tags: string[];
  updatedAt: string;
}

export interface ChatChannel {
  id: string;
  name: string;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  from: string;
  text: string;
  time: string;
}

export interface FormSubmission {
  id: string;
  formName: string;
  summary: string;
  createdAt: string;
}

export interface SignatureRequest {
  id: string;
  title: string;
  customerId?: string;
  documentName: string;
  status: "pending" | "signed" | "declined";
  signedAt?: string;
}

export interface Expense {
  id: string;
  vendor: string;
  amount: number;
  scannedAt: string;
}

export interface Meeting {
  id: string;
  customerId?: string;
  title: string;
  start: string;
  end: string;
  attendees: string[];
  completed?: boolean;
}

export interface SupportTicket {
  id: string;
  customerId: string;
  subject: string;
  status: "open" | "pending" | "closed";
  priority: "low" | "medium" | "high";
  createdAt: string;
  lastUpdate: string;
}

export interface Project {
  id: string;
  name: string;
  dueDate: string;
  status: "on-track" | "at-risk" | "done";
}

export interface Quote {
  id: string;
  customerId: string;
  dealId?: string;
  description: string;
  amount: number;
  status: "draft" | "sent" | "accepted" | "declined";
  /** Set once a decision is made (accepted or declined) — a locked quote's
   * numbers can never change again, the same reason a confirmed invoice
   * doesn't get its total edited after the fact. */
  locked?: boolean;
}

export type Currency = "USD" | "LBP" | "EUR";

export interface JournalLine {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  reference: string;
  currency: Currency;
  lines: JournalLine[];
  /** Draft entries can still be edited; posting checks debit === credit and
   * then locks it, the way a real ledger never lets a posted entry drift —
   * correcting a mistake means a new reversing entry, not editing history. */
  status: "draft" | "posted" | "cancelled";
}

export interface Cheque {
  id: string;
  chequeNo: string;
  type: "received" | "issued";
  party: string;
  bank: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  currency: Currency;
  /** Post-dated cheques move through this exact ladder in practice: banked
   * on the date written, held until due, then cleared or bounced. */
  status: "pending" | "deposited" | "cleared" | "returned" | "cancelled";
}

export interface ErpBranch {
  id: string;
  name: string;
  address: string;
}

/** CI ERP Core's master data — company-wide settings every other business
 * module reads. This is the one "place" that identifies Ci's ERP suite as
 * one system: everything under Business (Manufacturing, Inventory,
 * Purchasing, Accounting, Sales, HR, Payroll) sits under one company
 * profile and currency, the way a real ERP's admin/setup area does. */
export interface ErpSettings {
  companyName: string;
  baseCurrency: Currency;
  fiscalYearStartMonth: number;
  branches: ErpBranch[];
}

export interface PresentationSlide {
  id: string;
  heading: string;
  body: string;
}

export interface Presentation {
  id: string;
  title: string;
  slides: PresentationSlide[];
}

export type DesignElementType = "rect" | "circle" | "text";

export interface DesignElement {
  id: string;
  type: DesignElementType;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  text?: string;
  fontSize?: number;
}

export interface DesignProject {
  id: string;
  name: string;
  canvasWidth: number;
  canvasHeight: number;
  elements: DesignElement[];
}

export interface AppState {
  customers: Customer[];
  invoices: Invoice[];
  emails: EmailMessage[];
  files: DriveFile[];
  deals: Deal[];
  tasks: TaskItem[];
  approvals: ApprovalRequest[];
  audit: AuditEvent[];
  meetings: Meeting[];
  tickets: SupportTicket[];
  /** CI Sheets — revenue forecast targets by customer, the simplest real slice of "forecasting". */
  targets: Record<string, number>;
  projects: Project[];
  quotes: Quote[];
  purchaseOrders: PurchaseOrder[];
  employees: Employee[];
  inventory: InventoryItem[];
  campaigns: Campaign[];
  productionOrders: ProductionOrder[];
  contracts: Contract[];
  policies: CompliancePolicy[];
  candidates: Candidate[];
  sales: Sale[];
  shipments: Shipment[];
  assets: Asset[];
  articles: Article[];
  channels: ChatChannel[];
  chatMessages: ChatMessage[];
  formSubmissions: FormSubmission[];
  signatureRequests: SignatureRequest[];
  expenses: Expense[];
  journalEntries: JournalEntry[];
  cheques: Cheque[];
  erp: ErpSettings;
  presentations: Presentation[];
  designProjects: DesignProject[];
  /** CI Marketplace — which of the built-in cross-module automations are switched on. */
  automations: Record<string, boolean>;
  /** CI Governance — org-wide policy values other modules' logic reads. */
  governance: { poAutoApproveThreshold: number };
  /** Notifications a user has dismissed — notifications themselves are computed, not stored, so read state is the only thing that needs persisting. */
  dismissedNotificationIds: string[];
}
