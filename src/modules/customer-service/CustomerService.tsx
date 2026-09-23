import { useAppState, customerName, advanceTicketStatus } from "@/lib/data";
import type { SupportTicket } from "@/lib/types";

const STATUS_STYLE: Record<SupportTicket["status"], string> = {
  open: "bg-red-500/15 text-red-600 border-red-500/30",
  pending: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  closed: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
};

const NEXT_LABEL: Record<SupportTicket["status"], string | null> = {
  open: "Mark pending",
  pending: "Close ticket",
  closed: null,
};

export default function CustomerService() {
  const state = useAppState();
  const sorted = [...state.tickets].sort((a, b) => (a.status === "closed" ? 1 : -1));

  return (
    <div className="max-w-2xl space-y-2">
      {sorted.map((t) => {
        const next = NEXT_LABEL[t.status];
        return (
          <div key={t.id} className="rounded-lg border border-ci-border bg-ci-panel px-4 py-3">
            <div className="flex items-start justify-between gap-3 mb-1">
              <p className="text-sm font-medium">{t.subject}</p>
              <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] ${STATUS_STYLE[t.status]}`}>{t.status}</span>
            </div>
            <p className="text-xs text-ci-muted">
              {customerName(state, t.customerId)} · {t.priority} priority · updated {new Date(t.lastUpdate).toLocaleDateString()}
            </p>
            {next && (
              <button onClick={() => advanceTicketStatus(t.id)} className="mt-2 text-[11px] text-ci-accent hover:underline">
                {next} →
              </button>
            )}
          </div>
        );
      })}
      {sorted.length === 0 && <p className="text-sm text-ci-muted">No tickets.</p>}
    </div>
  );
}
