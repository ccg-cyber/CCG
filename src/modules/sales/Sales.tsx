import { useAppState, customerName, decideQuote } from "@/lib/data";
import type { Quote } from "@/lib/types";

const STATUS_STYLE: Record<Quote["status"], string> = {
  draft: "border-ci-border text-ci-muted bg-ci-border/30",
  sent: "border-amber-500/30 text-amber-400 bg-amber-500/10",
  accepted: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
  declined: "border-red-500/30 text-red-400 bg-red-500/10",
};

export default function Sales() {
  const state = useAppState();

  return (
    <div className="max-w-2xl space-y-2">
      <p className="text-xs text-ci-muted mb-2">
        Accepting a quote automatically advances its linked CI CRM deal to "Won" — no need to update both.
      </p>
      {state.quotes.map((q) => (
        <div key={q.id} className="rounded-lg border border-ci-border bg-ci-panel px-4 py-3">
          <div className="flex items-start justify-between gap-3 mb-1">
            <div>
              <p className="text-sm font-medium">{q.description}</p>
              <p className="text-xs text-ci-muted">
                {customerName(state, q.customerId)} · ${q.amount.toLocaleString()}
              </p>
            </div>
            <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] ${STATUS_STYLE[q.status]}`}>{q.status}</span>
          </div>
          <div className="flex gap-2 mt-2">
            {q.status === "draft" && (
              <button onClick={() => decideQuote(q.id, "sent")} className="text-[11px] text-ci-accent hover:underline">
                Mark sent →
              </button>
            )}
            {q.status === "sent" && (
              <>
                <button onClick={() => decideQuote(q.id, "accepted")} className="text-[11px] text-emerald-400 hover:underline">
                  Mark accepted →
                </button>
                <button onClick={() => decideQuote(q.id, "declined")} className="text-[11px] text-red-400 hover:underline">
                  Mark declined →
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
