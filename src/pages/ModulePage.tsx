import { useParams, Link } from "react-router-dom";
import { getModule } from "@/lib/registry";
import { CATEGORIES } from "@/lib/categories";
import StatusBadge from "@/components/StatusBadge";
import Docs from "@/modules/docs/Docs";
import Mail from "@/modules/mail/Mail";
import Drive from "@/modules/drive/Drive";
import CRM from "@/modules/crm/CRM";
import Tasks from "@/modules/tasks/Tasks";
import Invoicing from "@/modules/invoicing/Invoicing";
import Approvals from "@/modules/approvals/Approvals";
import Audit from "@/modules/audit/Audit";
import Calendar from "@/modules/calendar/Calendar";
import CustomerService from "@/modules/customer-service/CustomerService";
import Contacts from "@/modules/contacts/Contacts";
import Sheets from "@/modules/sheets/Sheets";
import Projects from "@/modules/projects/Projects";
import Sales from "@/modules/sales/Sales";
import Notifications from "@/modules/notifications/Notifications";
import Purchasing from "@/modules/purchasing/Purchasing";
import HR from "@/modules/hr/HR";
import Inventory from "@/modules/inventory/Inventory";
import Marketing from "@/modules/marketing/Marketing";
import Payroll from "@/modules/payroll/Payroll";
import Manufacturing from "@/modules/manufacturing/Manufacturing";
import Attendance from "@/modules/attendance/Attendance";
import Contracts from "@/modules/contracts/Contracts";
import Legal from "@/modules/legal/Legal";
import Recruit from "@/modules/recruit/Recruit";
import POS from "@/modules/pos/POS";
import Logistics from "@/modules/logistics/Logistics";
import Assets from "@/modules/assets/Assets";
import Knowledge from "@/modules/knowledge/Knowledge";
import Chat from "@/modules/chat/Chat";
import Forms from "@/modules/forms/Forms";
import Search from "@/modules/search/Search";

/**
 * Registry module id -> its real component. This is the one place that
 * connects "the module is live" (registry.ts) to "here's its screen"
 * (src/modules/<slug>/<Name>.tsx) — every module's implementation lives
 * at exactly the path its slug predicts, so finding or adding one never
 * requires searching: CI Purchasing is src/modules/purchasing/Purchasing.tsx,
 * full stop.
 */
const MODULE_COMPONENTS: Record<string, React.ComponentType> = {
  "ci-docs": Docs,
  "ci-mail": Mail,
  "ci-drive": Drive,
  "ci-crm": CRM,
  "ci-tasks": Tasks,
  "ci-invoicing": Invoicing,
  "ci-approval-center": Approvals,
  "ci-audit": Audit,
  "ci-calendar": Calendar,
  "ci-customer-service": CustomerService,
  "ci-contacts": Contacts,
  "ci-sheets": Sheets,
  "ci-projects": Projects,
  "ci-sales": Sales,
  "ci-notifications": Notifications,
  "ci-purchasing": Purchasing,
  "ci-hr": HR,
  "ci-inventory": Inventory,
  "ci-marketing": Marketing,
  "ci-payroll": Payroll,
  "ci-manufacturing": Manufacturing,
  "ci-attendance": Attendance,
  "ci-contracts": Contracts,
  "ci-legal": Legal,
  "ci-recruit": Recruit,
  "ci-pos": POS,
  "ci-logistics": Logistics,
  "ci-assets": Assets,
  "ci-knowledge": Knowledge,
  "ci-chat": Chat,
  "ci-forms": Forms,
  "ci-search": Search,
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
  const ModuleScreen = MODULE_COMPONENTS[module.id];

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

      {ModuleScreen ? (
        <ModuleScreen />
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
