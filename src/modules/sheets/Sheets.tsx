import { useAppState, paidTotalForCustomer, setTarget } from "@/lib/data";

/**
 * CI Sheets' first real slice: a revenue forecast table where "Actual" is
 * a live formula (sum of paid invoices per customer, pulled straight from
 * the same store CI Invoicing reads) and "Target" is an editable cell —
 * the same target/actual/variance pattern a real spreadsheet formula
 * would compute, without building a general formula engine yet.
 */
export default function Sheets() {
  const state = useAppState();
  const totalTarget = state.customers.reduce((sum, c) => sum + (state.targets[c.id] ?? 0), 0);
  const totalActual = state.customers.reduce((sum, c) => sum + paidTotalForCustomer(state, c.id), 0);

  return (
    <div className="max-w-2xl">
      <p className="text-xs text-ci-muted mb-3">
        Revenue Forecast — "Actual" is a live formula (sum of paid invoices per customer from CI Invoicing), not typed
        in. Edit a target and the variance recalculates.
      </p>
      <div className="rounded-lg border border-ci-border bg-ci-panel overflow-hidden">
        <div className="grid grid-cols-[1fr_120px_120px_120px] gap-2 px-4 py-2 text-[11px] uppercase tracking-wider text-ci-muted border-b border-ci-border">
          <span>Customer</span>
          <span>Target</span>
          <span>Actual</span>
          <span>Variance</span>
        </div>
        {state.customers.map((c) => {
          const target = state.targets[c.id] ?? 0;
          const actual = paidTotalForCustomer(state, c.id);
          const variance = actual - target;
          return (
            <div key={c.id} className="grid grid-cols-[1fr_120px_120px_120px] items-center gap-2 px-4 py-2 text-sm border-b border-ci-border last:border-b-0">
              <span className="truncate">{c.name}</span>
              <input
                type="number"
                value={target}
                onChange={(e) => setTarget(c.id, Number(e.target.value) || 0)}
                className="w-24 rounded-md border border-ci-border bg-ci-panel2 px-2 py-1 text-sm"
              />
              <span>${actual.toLocaleString()}</span>
              <span className={variance >= 0 ? "text-emerald-400" : "text-red-400"}>
                {variance >= 0 ? "+" : ""}${variance.toLocaleString()}
              </span>
            </div>
          );
        })}
        <div className="grid grid-cols-[1fr_120px_120px_120px] items-center gap-2 px-4 py-2.5 text-sm font-medium bg-ci-panel2">
          <span>Total</span>
          <span>${totalTarget.toLocaleString()}</span>
          <span>${totalActual.toLocaleString()}</span>
          <span className={totalActual - totalTarget >= 0 ? "text-emerald-400" : "text-red-400"}>
            {totalActual - totalTarget >= 0 ? "+" : ""}${(totalActual - totalTarget).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
