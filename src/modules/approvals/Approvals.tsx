import { useAppState, decideApproval, customerName, currentUserName } from "@/lib/data";

export default function Approvals() {
  const state = useAppState();
  const you = currentUserName();
  const pending = state.approvals.filter((a) => a.status === "pending");
  const decided = state.approvals.filter((a) => a.status !== "pending");

  return (
    <div className="max-w-3xl space-y-6">
      <section>
        <h2 className="text-sm font-semibold mb-3">
          Pending {pending.length > 0 && <span className="text-ci-muted font-normal">({pending.length})</span>}
        </h2>
        {pending.length === 0 && <p className="text-sm text-ci-muted">Nothing waiting on you.</p>}
        <div className="space-y-3">
          {pending.map((a) => {
            const poPayload = a.payload?.kind === "purchase-order" ? a.payload : null;
            const po = poPayload ? state.purchaseOrders.find((p) => p.id === poPayload.purchaseOrderId) : undefined;
            return (
            <div key={a.id} className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-ci-muted mt-0.5">{a.description}</p>
                </div>
                <span className="shrink-0 rounded-full border border-ci-border px-2 py-0.5 text-[11px] text-ci-muted">
                  {a.createdBy === "agent" ? "CI Agent" : you}
                </span>
              </div>

              {po && (
                <div className="rounded-md border border-ci-border bg-ci-panel2 p-3 mb-3 text-xs space-y-1">
                  <p>
                    <span className="text-ci-muted">Supplier:</span> {customerName(state, po.supplierId)}
                  </p>
                  <p>
                    <span className="text-ci-muted">Amount:</span> ${po.amount.toLocaleString()}
                  </p>
                  <p>
                    <span className="text-ci-muted">Description:</span> {po.description}
                  </p>
                </div>
              )}

              {a.payload?.kind === "send-email" && (
                <div className="rounded-md border border-ci-border bg-ci-panel2 p-3 mb-3 text-xs space-y-1">
                  <p>
                    <span className="text-ci-muted">To:</span> {a.payload.to}
                  </p>
                  <p>
                    <span className="text-ci-muted">Subject:</span> {a.payload.subject}
                  </p>
                  <p className="text-ci-muted whitespace-pre-line pt-1 border-t border-ci-border mt-1">
                    {a.payload.body}
                  </p>
                  {a.payload.attachment && (
                    <p className="pt-1">
                      <span className="text-ci-muted">Attachment:</span> {a.payload.attachment}
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => decideApproval(a.id, "approved")}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500"
                >
                  Approve{a.payload?.kind === "send-email" ? " & Send" : ""}
                </button>
                <button
                  onClick={() => decideApproval(a.id, "rejected")}
                  className="rounded-lg border border-ci-border px-3 py-1.5 text-xs text-ci-muted hover:text-ci-text"
                >
                  Reject
                </button>
              </div>
            </div>
            );
          })}
        </div>
      </section>

      {decided.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold mb-3">History</h2>
          <div className="space-y-2">
            {decided.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 rounded-lg border border-ci-border bg-ci-panel px-4 py-2.5 text-sm">
                <span className="truncate">{a.title}</span>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] ${
                    a.status === "approved"
                      ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
                      : "border-red-500/30 text-red-600 bg-red-500/10"
                  }`}
                >
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
