import {
  Home,
  Monitor,
  Smartphone,
  FileText,
  FileSpreadsheet,
  Presentation,
  FileType,
  StickyNote,
  ClipboardList,
  CheckSquare,
  Mail,
  Calendar,
  Contact,
  MessagesSquare,
  Video,
  Radio,
  Bell,
  FolderOpen,
  Search,
  ScanLine,
  PenLine,
  Archive,
  Compass,
  Kanban,
  TrendingUp,
  Headphones,
  Megaphone,
  Building2,
  Calculator,
  Receipt,
  ShoppingCart,
  Package,
  CreditCard,
  Factory,
  Truck,
  UserCog,
  Wallet,
  Clock,
  UserPlus,
  Wrench,
  FileSignature,
  DoorOpen,
  Palette,
  Image,
  Clapperboard,
  Music2,
  Languages,
  ShoppingBag,
  MonitorSmartphone,
  LifeBuoy,
  Cpu,
  PackageSearch,
  RefreshCw,
  ShieldCheck,
  HardDrive,
  Printer,
  Globe,
  WifiOff,
  Boxes,
  Database,
  Blocks,
  Zap,
  Workflow,
  Webhook,
  Link2,
  Server,
  Code2,
  Store,
  Layers,
  Bot,
  Network,
  Sparkles,
  BookOpen,
  ScanText,
  Brain,
  Waypoints,
  GitMerge,
  Mic,
  Scale,
  CheckCircle2,
  IdCard,
  Lock,
  KeyRound,
  Settings,
  History,
  Landmark,
  SlidersHorizontal,
  Activity,
  BarChart3,
  Gauge,
  AppWindow,
  type LucideIcon,
} from "lucide-react";

/**
 * Real icons instead of emoji — emoji render inconsistently across
 * platforms/fonts (a different glyph entirely on some Android keyboards,
 * monochrome on some Linux setups) where a vector icon set renders
 * identically everywhere. Shared by every surface that shows a module as
 * a tappable/clickable shortcut — Desktop.tsx's icon column, CompactShell's
 * phone hub and search results, and LockScreen has its own fixed icon
 * since it appears before any module context exists.
 *
 * Every one of the 90 modules in registry.ts gets its own entry — not just
 * the dozen actually pinned as shortcuts — because search results and the
 * Start menu resolve any module by id, and a generic fallback icon on
 * most rows read as unfinished rather than curated. Picked for what the
 * module *does* (CI Sheets gets a spreadsheet, not a generic file), and
 * kept distinct within a category where two modules could otherwise be
 * confused (CI Scan's scan-line vs CI OCR's scan-text).
 */
export const MODULE_ICONS: Record<string, LucideIcon> = {
  // Home
  "ci-home": Home,
  "ci-desktop": Monitor,
  "ci-mobile": Smartphone,
  // Work
  "ci-docs": FileText,
  "ci-sheets": FileSpreadsheet,
  "ci-present": Presentation,
  "ci-pdf": FileType,
  "ci-notes": StickyNote,
  "ci-forms": ClipboardList,
  "ci-tasks": CheckSquare,
  // Communicate
  "ci-mail": Mail,
  "ci-calendar": Calendar,
  "ci-contacts": Contact,
  "ci-chat": MessagesSquare,
  "ci-meet": Video,
  "ci-communications": Radio,
  "ci-notifications": Bell,
  // Files
  "ci-drive": FolderOpen,
  "ci-search": Search,
  "ci-scan": ScanLine,
  "ci-sign": PenLine,
  "ci-archive": Archive,
  // Business
  "ci-crm": Compass,
  "ci-projects": Kanban,
  "ci-sales": TrendingUp,
  "ci-customer-service": Headphones,
  "ci-marketing": Megaphone,
  "ci-erp-core": Building2,
  "ci-accounting": Calculator,
  "ci-invoicing": Receipt,
  "ci-purchasing": ShoppingCart,
  "ci-inventory": Package,
  "ci-pos": CreditCard,
  "ci-manufacturing": Factory,
  "ci-logistics": Truck,
  "ci-hr": UserCog,
  "ci-payroll": Wallet,
  "ci-attendance": Clock,
  "ci-recruit": UserPlus,
  "ci-maintenance": Wrench,
  "ci-contracts": FileSignature,
  "ci-portals": DoorOpen,
  // Create
  "ci-design": Palette,
  "ci-media": Image,
  "ci-video": Clapperboard,
  "ci-audio": Music2,
  "ci-translate": Languages,
  "ci-website": ShoppingBag,
  // IT
  "ci-remote": MonitorSmartphone,
  "ci-it-desk": LifeBuoy,
  "ci-devices": Cpu,
  "ci-software-center": PackageSearch,
  "ci-patch": RefreshCw,
  "ci-security-center": ShieldCheck,
  "ci-backup": HardDrive,
  "ci-print": Printer,
  "ci-browser": Globe,
  "ci-offline": WifiOff,
  "ci-assets": Boxes,
  // Build
  "ci-database": Database,
  "ci-builder": Blocks,
  "ci-automate": Zap,
  "ci-workflow-engine": Workflow,
  "ci-api-hub": Webhook,
  "ci-connect": Link2,
  "ci-data-hub": Server,
  "ci-dev": Code2,
  "ci-marketplace": Store,
  "ci-industry-packs": Layers,
  // Intelligence
  "ci-assistant": Bot,
  "ci-agents": Network,
  "ci-agent-studio": Sparkles,
  "ci-knowledge": BookOpen,
  "ci-ocr": ScanText,
  "ci-intelligence-core": Brain,
  "ci-memory": Waypoints,
  "ci-orchestrator": GitMerge,
  "ci-voice": Mic,
  // Control
  "ci-legal": Scale,
  "ci-approval-center": CheckCircle2,
  "ci-identity": IdCard,
  "ci-vault": Lock,
  "ci-permissions": KeyRound,
  "ci-admin-center": Settings,
  "ci-audit": History,
  "ci-governance": Landmark,
  "ci-autonomy-control": SlidersHorizontal,
  "ci-activity-trace": Activity,
  // Executive
  "ci-bi": BarChart3,
  "ci-control-room": Gauge,
};

export const FALLBACK_ICON: LucideIcon = AppWindow;

export function ModuleIcon({ moduleId, className }: { moduleId: string; className?: string }) {
  const Icon = MODULE_ICONS[moduleId] ?? FALLBACK_ICON;
  return <Icon className={className} strokeWidth={1.75} />;
}

/**
 * A per-category tint, shared by every surface that renders a module as a
 * shortcut (Desktop icons, the phone hub, Start menu rows) — a color means
 * the same category everywhere in Ci, not a different scheme per screen.
 */
export const CATEGORY_ICON_STYLE: Record<string, { bg: string; text: string }> = {
  home: { bg: "bg-ci-accent/10", text: "text-ci-accent" },
  work: { bg: "bg-sky-500/10", text: "text-sky-600" },
  communicate: { bg: "bg-violet-500/10", text: "text-violet-600" },
  files: { bg: "bg-amber-500/10", text: "text-amber-600" },
  business: { bg: "bg-emerald-500/10", text: "text-emerald-600" },
  create: { bg: "bg-pink-500/10", text: "text-pink-600" },
  it: { bg: "bg-cyan-500/10", text: "text-cyan-600" },
  build: { bg: "bg-orange-500/10", text: "text-orange-600" },
  intelligence: { bg: "bg-fuchsia-500/10", text: "text-fuchsia-600" },
  control: { bg: "bg-rose-500/10", text: "text-rose-600" },
  executive: { bg: "bg-indigo-500/10", text: "text-indigo-600" },
};

export function moduleIconStyle(category: string | undefined): { bg: string; text: string } {
  return CATEGORY_ICON_STYLE[category ?? "home"] ?? CATEGORY_ICON_STYLE.home;
}
