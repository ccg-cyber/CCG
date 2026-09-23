import { useAppState, customerName, renewContract, contractStatus } from "@/lib/data";
import type { ContractStatus } from "@/lib/data";

const STATUS_STYLE: Record<ContractStatus, string> = {
  active: "border-emerald-500/30 text-emerald-600 bg-emerald-500/10",
  "expiring-soon": "border-amber-500/30 text-amber-600 bg-amber-500/10",
  expired: "border-red-500/30 text-red-600 bg-red-500/10",
};

export default function Contracts() {
  const state = useAppState();

  return (
    <div className="max-w-2xl space-y-2">
      {state.contracts.map((c) => {
        const status = contractStatus(c.expiresOn);
        return (
          <div key={c.id} className="flex items-center justify-between gap-3 rounded-lg border border-ci-border bg-ci-panel px-4 py-3">
            <div>
              <p className="text-sm font-medium">{c.title}</p>
              <p className="text-xs text-ci-muted">
                {customerName(state, c.customerId)} · expires {c.expiresOn}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {status !== "active" && (
                <button onClick={() => renewContract(c.id)} className="text-[11px] text-ci-accent hover:underline">
                  Renew →
                </button>
              )}
              <span className={`rounded-full border px-2 py-0.5 text-[11px] ${STATUS_STYLE[status]}`}>{status}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
