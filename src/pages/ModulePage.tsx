import { useParams, Link } from "react-router-dom";
import { getModule } from "@/lib/registry";
import { CATEGORIES } from "@/lib/categories";
import StatusBadge from "@/components/StatusBadge";
import DocsDemo from "@/modules/docs/DocsDemo";
import MailDemo from "@/modules/mail/MailDemo";
import DriveDemo from "@/modules/drive/DriveDemo";
import CrmDemo from "@/modules/crm/CrmDemo";
import TasksDemo from "@/modules/tasks/TasksDemo";
import InvoicingDemo from "@/modules/invoicing/InvoicingDemo";
import ApprovalCenterDemo from "@/modules/approvals/ApprovalCenterDemo";
import AuditDemo from "@/modules/audit/AuditDemo";
import CalendarDemo from "@/modules/calendar/CalendarDemo";
import CustomerServiceDemo from "@/modules/customer-service/CustomerServiceDemo";
import ContactsDemo from "@/modules/contacts/ContactsDemo";
import SheetsDemo from "@/modules/sheets/SheetsDemo";
import ProjectsDemo from "@/modules/projects/ProjectsDemo";
import SalesDemo from "@/modules/sales/SalesDemo";
import NotificationsDemo from "@/modules/notifications/NotificationsDemo";
import PurchasingDemo from "@/modules/purchasing/PurchasingDemo";
import HRDemo from "@/modules/hr/HRDemo";

const DEMOS: Record<string, React.ComponentType> = {
  "ci-docs": DocsDemo,
  "ci-mail": MailDemo,
  "ci-drive": DriveDemo,
  "ci-crm": CrmDemo,
  "ci-tasks": TasksDemo,
  "ci-invoicing": InvoicingDemo,
  "ci-approval-center": ApprovalCenterDemo,
  "ci-audit": AuditDemo,
  "ci-calendar": CalendarDemo,
  "ci-customer-service": CustomerServiceDemo,
  "ci-contacts": ContactsDemo,
  "ci-sheets": SheetsDemo,
  "ci-projects": ProjectsDemo,
  "ci-sales": SalesDemo,
  "ci-notifications": NotificationsDemo,
  "ci-purchasing": PurchasingDemo,
  "ci-hr": HRDemo,
};

export default function ModulePage() {
  const { slug } = useParams();
  const module = slug ? getModule(slug) : undefined;

  if (!module) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-ci-muted">Module not found.</p>
        <Link to="/" className="text-ci-accent text-sm">
          Back to Home
        </Link>
      </div>
    );
  }

  const category = CATEGORIES.find((c) => c.id === module.category);
  const Demo = DEMOS[module.id];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div>
        <p className="text-xs text-ci-muted mb-1">{category?.label}</p>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">{module.name}</h1>
          <StatusBadge status={module.status} />
        </div>
        <p className="text-sm text-ci-muted mt-1 max-w-2xl">{module.description}</p>
        {module.replaces && <p className="text-xs text-ci-muted/70 mt-1">Replaces: {module.replaces}</p>}
      </div>

      {Demo ? (
        <Demo />
      ) : (
        <div className="rounded-xl border border-dashed border-ci-border bg-ci-panel p-8 text-center max-w-2xl">
          <p className="text-sm text-ci-muted">
            {module.name} is registered in the Ci Business OS module map but not yet built. It slots into the{" "}
            <strong className="text-ci-text">{category?.label}</strong> category, following the same shell,
            permission model and audit trail as every live module.
          </p>
        </div>
      )}
    </div>
  );
}
