import { Link } from "react-router-dom";
import { CATEGORIES } from "@/lib/categories";
import { MODULES, modulesByCategory } from "@/lib/registry";
import { useAppState, customerName } from "@/lib/data";
import ModuleCard from "@/components/ModuleCard";
import AskCiBar from "@/components/AskCiBar";

const liveCount = MODULES.filter((m) => m.status === "live").length;
const plannedCount = MODULES.filter((m) => m.status !== "live").length;

export default function Home() {
  const state = useAppState();
  const overdueInvoices = state.invoices.filter((i) => i.status === "overdue");
  const openHighPriorityTasks = state.tasks.filter((t) => !t.done && t.priority === "high");
  const unreadEmails = state.emails.filter((e) => e.unread);
  const pendingApprovals = state.approvals.filter((a) => a.status === "pending");

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
            {overdueInvoices.map((inv) => (
              <li key={inv.id} className="flex items-start justify-between gap-3 text-sm">
                <span>
                  Invoice #{inv.number} is {inv.overdueDays} days overdue — {customerName(state, inv.customerId)}.
                </span>
                <Link to="/modules/invoicing" className="shrink-0 text-[11px] text-ci-accent">
                  CI Invoicing
                </Link>
              </li>
            ))}
            {openHighPriorityTasks.map((t) => (
              <li key={t.id} className="flex items-start justify-between gap-3 text-sm">
                <span>{t.title}</span>
                <Link to="/modules/tasks" className="shrink-0 text-[11px] text-ci-accent">
                  CI Tasks
                </Link>
              </li>
            ))}
            {unreadEmails.length > 0 && (
              <li className="flex items-start justify-between gap-3 text-sm">
                <span>{unreadEmails.length} unread message(s) in your inbox.</span>
                <Link to="/modules/mail" className="shrink-0 text-[11px] text-ci-accent">
                  CI Mail
                </Link>
              </li>
            )}
            {overdueInvoices.length === 0 && openHighPriorityTasks.length === 0 && unreadEmails.length === 0 && (
              <li className="text-sm text-ci-muted">Nothing needs your attention.</li>
            )}
          </ul>
        </div>
        <div className="rounded-xl border border-ci-border bg-ci-panel p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium">Pending your approval</h2>
            {pendingApprovals.length > 0 && (
              <Link to="/modules/approvals" className="text-[11px] text-ci-accent">
                View all →
              </Link>
            )}
          </div>
          <ul className="space-y-2.5">
            {pendingApprovals.map((a) => (
              <li key={a.id} className="flex items-start justify-between gap-3 text-sm">
                <span>{a.title}</span>
                <span className="shrink-0 text-[11px] text-ci-muted">
                  {a.createdBy === "agent" ? "CI Agent" : "You"}
                </span>
              </li>
            ))}
            {pendingApprovals.length === 0 && <li className="text-sm text-ci-muted">Nothing waiting on you.</li>}
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
