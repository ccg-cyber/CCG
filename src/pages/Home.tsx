import { CATEGORIES } from "@/lib/categories";
import { MODULES, modulesByCategory } from "@/lib/registry";
import ModuleCard from "@/components/ModuleCard";
import AskCiBar from "@/components/AskCiBar";

const liveCount = MODULES.filter((m) => m.status === "live").length;
const plannedCount = MODULES.filter((m) => m.status !== "live").length;

const NOTIFICATIONS = [
  { id: 1, text: "Invoice #1042 is 12 days overdue — Acme Ltd.", module: "CI Accounting" },
  { id: 2, text: "3 tasks due today in the Q3 Rollout project.", module: "CI Tasks" },
  { id: 3, text: "New lead assigned to you: Nord Retail Group.", module: "CI CRM" },
];

const APPROVALS = [
  { id: 1, text: "Purchase order PO-2201 — $4,300 to Northwind Supplies", module: "CI Purchasing" },
  { id: 2, text: "Statement + follow-up email for Acme Ltd. (agent-prepared)", module: "CI Approval Center" },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Good to see you.</h1>
        <p className="text-ci-muted text-sm mt-1">
          One workspace, one intelligence — {liveCount} module{liveCount === 1 ? "" : "s"} live, {plannedCount} mapped
          and ready to build.
        </p>
      </div>

      <AskCiBar />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-ci-border bg-ci-panel p-4">
          <h2 className="text-sm font-medium mb-3">Notifications</h2>
          <ul className="space-y-2.5">
            {NOTIFICATIONS.map((n) => (
              <li key={n.id} className="flex items-start justify-between gap-3 text-sm">
                <span>{n.text}</span>
                <span className="shrink-0 text-[11px] text-ci-muted">{n.module}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-ci-border bg-ci-panel p-4">
          <h2 className="text-sm font-medium mb-3">Pending your approval</h2>
          <ul className="space-y-2.5">
            {APPROVALS.map((a) => (
              <li key={a.id} className="flex items-start justify-between gap-3 text-sm">
                <span>{a.text}</span>
                <span className="shrink-0 text-[11px] text-ci-muted">{a.module}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {CATEGORIES.filter((c) => c.id !== "home").map((category) => {
        const mods = modulesByCategory(category.id);
        if (mods.length === 0) return null;
        return (
          <section key={category.id}>
            <div className="mb-3">
              <h2 className="text-sm font-semibold">{category.label}</h2>
              <p className="text-xs text-ci-muted">{category.description}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {mods.map((m) => (
                <ModuleCard key={m.id} module={m} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
