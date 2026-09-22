import { useAppState, monthlyPay, runPayroll } from "@/lib/data";

export default function Payroll() {
  const state = useAppState();
  const active = state.employees.filter((e) => e.status !== "offboarded");
  const total = active.reduce((sum, e) => sum + monthlyPay(e), 0);

  return (
    <div className="max-w-2xl">
      <p className="text-xs text-ci-muted mb-3">
        Reads CI HR's employee records directly — add someone in CI HR and they appear here with a computed monthly
        pay, no re-entry.
      </p>
      <div className="rounded-lg border border-ci-border bg-ci-panel overflow-hidden mb-4">
        <div className="grid grid-cols-[1fr_1fr_120px] gap-2 px-4 py-2 text-[11px] uppercase tracking-wider text-ci-muted border-b border-ci-border">
          <span>Employee</span>
          <span>Role</span>
          <span>Monthly pay</span>
        </div>
        {active.map((e) => (
          <div key={e.id} className="grid grid-cols-[1fr_1fr_120px] items-center gap-2 px-4 py-2.5 text-sm border-b border-ci-border last:border-b-0">
            <span>{e.name}</span>
            <span className="text-ci-muted">{e.role}</span>
            <span>${monthlyPay(e).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          </div>
        ))}
        <div className="grid grid-cols-[1fr_1fr_120px] items-center gap-2 px-4 py-2.5 text-sm font-medium bg-ci-panel2">
          <span>Total</span>
          <span />
          <span>${total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        </div>
      </div>
      <button onClick={runPayroll} className="rounded-lg bg-ci-accent px-4 py-2 text-sm font-medium text-white">
        Run payroll for this period
      </button>
    </div>
  );
}
