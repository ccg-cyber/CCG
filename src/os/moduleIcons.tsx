import {
  Home,
  FileText,
  Mail,
  Compass,
  FolderOpen,
  CheckSquare,
  CheckCircle2,
  MessageCircle,
  Calendar,
  Receipt,
  AppWindow,
  type LucideIcon,
} from "lucide-react";

/**
 * Real icons instead of emoji — emoji render inconsistently across
 * platforms/fonts (a different glyph entirely on some Android keyboards,
 * monochrome on some Linux setups) where a vector icon set renders
 * identically everywhere. Shared between Desktop.tsx (desktop icons) and
 * CompactShell.tsx (phone home-screen grid) so both surfaces agree on
 * what each module looks like.
 */
export const MODULE_ICONS: Record<string, LucideIcon> = {
  "ci-home": Home,
  "ci-docs": FileText,
  "ci-mail": Mail,
  "ci-crm": Compass,
  "ci-drive": FolderOpen,
  "ci-tasks": CheckSquare,
  "ci-approval-center": CheckCircle2,
  "ci-assistant": MessageCircle,
  "ci-calendar": Calendar,
  "ci-invoicing": Receipt,
};

export const FALLBACK_ICON: LucideIcon = AppWindow;

export function ModuleIcon({ moduleId, className }: { moduleId: string; className?: string }) {
  const Icon = MODULE_ICONS[moduleId] ?? FALLBACK_ICON;
  return <Icon className={className} strokeWidth={1.75} />;
}
