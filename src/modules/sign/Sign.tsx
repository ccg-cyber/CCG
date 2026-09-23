import { Link } from "react-router-dom";
import { useAppState, customerName, signDocument, declineSignature } from "@/lib/data";

export default function Sign() {
  const state = useAppState();
  const pending = state.signatureRequests.filter((r) => r.status === "pending");
  const decided = state.signatureRequests.filter((r) => r.status !== "pending");

  return (
    <div className="max-w-2xl space-y-6">
      <section>
        <h2 className="text-sm font-semibold mb-2">Awaiting signature</h2>
        <p className="text-xs text-ci-muted mb-3">Signing files the document in CI Drive automatically.</p>
        <div className="space-y-2">
          {pending.map((r) => (
            <div key={r.id} className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3">
              <p className="text-sm font-medium">{r.title}</p>
              <p className="text-xs text-ci-muted mb-2">
                {r.documentName}
                {r.customerId && ` · ${customerName(state, r.customerId)}`}
              </p>
              <div className="flex gap-2">
                <button onClick={() => signDocument(r.id)} className="text-[11px] text-emerald-600 hover:underline">
                  Sign →
                </button>
                <button onClick={() => declineSignature(r.id)} className="text-[11px] text-red-600 hover:underline">
                  Decline
                </button>
              </div>
            </div>
          ))}
          {pending.length === 0 && <p className="text-sm text-ci-muted">Nothing waiting on a signature.</p>}
        </div>
      </section>

      {decided.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold mb-2">History</h2>
          <div className="space-y-1.5">
            {decided.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 rounded-lg border border-ci-border bg-ci-panel px-4 py-2.5 text-sm">
                <span>{r.title}</span>
                <span className="flex items-center gap-2 shrink-0">
                  {r.status === "signed" && (
                    <Link to="/modules/drive" className="text-[11px] text-ci-accent">
                      View in Drive →
                    </Link>
                  )}
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[11px] ${
                      r.status === "signed"
                        ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
                        : "border-red-500/30 text-red-600 bg-red-500/10"
                    }`}
                  >
                    {r.status}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
