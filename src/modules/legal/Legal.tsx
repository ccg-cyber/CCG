import { Link } from "react-router-dom";
import { useAppState, customerName, contractStatus, reviewPolicy } from "@/lib/data";

export default function Legal() {
  const state = useAppState();
  const atRisk = state.contracts.filter((c) => contractStatus(c.expiresOn) !== "active");

  return (
    <div className="max-w-2xl space-y-6">
      <section>
        <h2 className="text-sm font-semibold mb-2">At-risk contracts</h2>
        <p className="text-xs text-ci-muted mb-3">Reads CI Contracts directly — nothing duplicated here.</p>
        {atRisk.length === 0 && <p className="text-sm text-ci-muted">Nothing expiring soon.</p>}
        <div className="space-y-2">
          {atRisk.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-2.5 text-sm">
              <span>
                {c.title} — {customerName(state, c.customerId)}
              </span>
              <Link to="/modules/contracts" className="text-[11px] text-ci-accent shrink-0">
                Review in CI Contracts →
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold mb-3">Compliance policies</h2>
        <div className="space-y-2">
          {state.policies.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3 rounded-lg border border-ci-border bg-ci-panel px-4 py-3">
              <div>
                <p className="text-sm font-medium">{p.name}</p>
                <p className="text-xs text-ci-muted">Last reviewed {p.lastReviewed}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {p.status === "needs-review" && (
                  <button onClick={() => reviewPolicy(p.id)} className="text-[11px] text-ci-accent hover:underline">
                    Mark reviewed →
                  </button>
                )}
                <span
                  className={`rounded-full border px-2 py-0.5 text-[11px] ${
                    p.status === "compliant"
                      ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                      : "border-amber-500/30 text-amber-400 bg-amber-500/10"
                  }`}
                >
                  {p.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
