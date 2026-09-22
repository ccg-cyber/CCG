import { useAppState, logTimeOff } from "@/lib/data";

export default function AttendanceDemo() {
  const state = useAppState();

  return (
    <div className="max-w-2xl">
      <p className="text-xs text-ci-muted mb-3">Reads CI HR's employee records — the same list, the same balances.</p>
      <div className="space-y-2">
        {state.employees.map((e) => (
          <div key={e.id} className="flex items-center justify-between gap-3 rounded-lg border border-ci-border bg-ci-panel px-4 py-3">
            <div>
              <p className="text-sm font-medium">{e.name}</p>
              <p className="text-xs text-ci-muted">{e.ptoBalance} day(s) PTO remaining</p>
            </div>
            <button
              onClick={() => logTimeOff(e.id, 1)}
              disabled={e.ptoBalance < 1}
              className="text-[11px] text-ci-accent hover:underline disabled:text-ci-muted disabled:no-underline"
            >
              Log 1 day off
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
