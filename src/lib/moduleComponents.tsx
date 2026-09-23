import Home from "@/pages/Home";
import Docs from "@/modules/docs/Docs";
import Mail from "@/modules/mail/Mail";
import Drive from "@/modules/drive/Drive";
import CRM from "@/modules/crm/CRM";
import Tasks from "@/modules/tasks/Tasks";
import Invoicing from "@/modules/invoicing/Invoicing";
import Accounting from "@/modules/accounting/Accounting";
import ERP from "@/modules/erp/ERP";
import Present from "@/modules/present/Present";
import Design from "@/modules/design/Design";
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
import Sign from "@/modules/sign/Sign";
import Meet from "@/modules/meet/Meet";
import Scan from "@/modules/scan/Scan";
import Archive from "@/modules/archive/Archive";
import Assistant from "@/modules/assistant/Assistant";
import Website from "@/modules/website/Website";
import Marketplace from "@/modules/marketplace/Marketplace";
import Governance from "@/modules/governance/Governance";
import DataHub from "@/modules/data-hub/DataHub";

/**
 * Registry module id -> its real component. This is the one place that
 * connects "the module is live" (registry.ts) to "here's its screen"
 * (src/modules/<slug>/<Name>.tsx) — every module's implementation lives
 * at exactly the path its slug predicts, so finding or adding one never
 * requires searching: CI Purchasing is src/modules/purchasing/Purchasing.tsx,
 * full stop. CI Home is the one exception to the folder convention — it
 * predates the module system as the shell's own dashboard — so it's
 * listed here as src/pages/Home.tsx rather than src/modules/home/Home.tsx.
 *
 * Consumed by the OS shell (src/os/ModuleWindowContent.tsx): every module,
 * home included, opens as a window through this same map — there's no
 * special-cased "home page" route anymore.
 */
export const MODULE_COMPONENTS: Record<string, React.ComponentType> = {
  "ci-home": Home,
  "ci-docs": Docs,
  "ci-mail": Mail,
  "ci-drive": Drive,
  "ci-crm": CRM,
  "ci-tasks": Tasks,
  "ci-invoicing": Invoicing,
  "ci-accounting": Accounting,
  "ci-erp-core": ERP,
  "ci-present": Present,
  "ci-design": Design,
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
  "ci-sign": Sign,
  "ci-meet": Meet,
  "ci-scan": Scan,
  "ci-archive": Archive,
  "ci-assistant": Assistant,
  "ci-website": Website,
  "ci-marketplace": Marketplace,
  "ci-governance": Governance,
  "ci-data-hub": DataHub,
};
