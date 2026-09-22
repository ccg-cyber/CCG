import { useAppState, assetCurrentValue, assignAsset, unassignAsset } from "@/lib/data";

export default function Assets() {
  const state = useAppState();

  return (
    <div className="max-w-2xl space-y-2">
      <p className="text-xs text-ci-muted mb-1">Current value is computed from purchase cost, age and useful life — a live formula, not a stored number.</p>
      {state.assets.map((a) => {
        const employee = state.employees.find((e) => e.id === a.assignedToEmployeeId);
        return (
          <div key={a.id} className="rounded-lg border border-ci-border bg-ci-panel px-4 py-3">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <p className="text-sm font-medium">{a.name}</p>
                <p className="text-xs text-ci-muted">
                  {a.type} · bought {a.purchaseDate} · ${assetCurrentValue(a).toLocaleString()} current value
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] ${
                  a.status === "in-use" ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" : "border-ci-border text-ci-muted bg-ci-border/30"
                }`}
              >
                {employee ? employee.name : a.status}
              </span>
            </div>
            {employee ? (
              <button onClick={() => unassignAsset(a.id)} className="text-[11px] text-ci-muted hover:text-ci-text">
                Return to storage
              </button>
            ) : (
              <select
                onChange={(e) => e.target.value && assignAsset(a.id, e.target.value)}
                defaultValue=""
                className="rounded-md border border-ci-border bg-ci-panel2 px-2 py-1 text-xs"
              >
                <option value="" disabled>
                  Assign to…
                </option>
                {state.employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        );
      })}
    </div>
  );
}
