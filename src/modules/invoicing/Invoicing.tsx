import { useAppState, customerName, markInvoicePaid } from "@/lib/data";
import type { Invoice } from "@/lib/types";

const STATUS_STYLE: Record<Invoice["status"], string> = {
  paid: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  overdue: "bg-red-500/15 text-red-600 border-red-500/30",
  pending: "bg-amber-500/15 text-amber-600 border-amber-500/30",
};

export default function Invoicing() {
  const state = useAppState();
  const invoices = [...state.invoices].sort((a, b) => (a.status === "overdue" ? -1 : 1));
  const totalOutstanding = state.invoices
    .filter((i) => i.status !== "paid")
    .reduce((sum, i) => sum + i.amount, 0);
  const totalOverdue = state.invoices.filter((i) => i.status === "overdue").reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex gap-4">
        <div className="rounded-lg border border-ci-border bg-ci-panel px-4 py-3">
          <p className="text-xs text-ci-muted">Outstanding</p>
          <p className="text-lg font-semibold">${totalOutstanding.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3">
          <p className="text-xs text-red-600">Overdue</p>
          <p className="text-lg font-semibold text-red-600">${totalOverdue.toLocaleString()}</p>
        </div>
      </div>

      <div className="rounded-lg border border-ci-border bg-ci-panel overflow-hidden">
        <div className="grid grid-cols-[100px_1fr_100px_110px_100px] gap-2 px-4 py-2 text-[11px] uppercase tracking-wider text-ci-muted border-b border-ci-border">
          <span>Invoice</span>
          <span>Customer</span>
          <span>Amount</span>
          <span>Due</span>
          <span>Status</span>
        </div>
        {invoices.map((inv) => (
          <div
            key={inv.id}
            className="grid grid-cols-[100px_1fr_100px_110px_100px] items-center gap-2 px-4 py-2.5 text-sm border-b border-ci-border last:border-b-0"
          >
            <span>#{inv.number}</span>
            <span className="truncate">{customerName(state, inv.customerId)}</span>
            <span>${inv.amount.toLocaleString()}</span>
            <span className="text-ci-muted text-xs">
              {inv.status === "overdue" ? `${inv.overdueDays} days overdue` : inv.dueDate}
            </span>
            <span className="flex items-center gap-2">
              <span className={`rounded-full border px-2 py-0.5 text-[11px] ${STATUS_STYLE[inv.status]}`}>{inv.status}</span>
              {inv.status !== "paid" && (
                <button onClick={() => markInvoicePaid(inv.id)} className="text-[11px] text-ci-accent hover:underline">
                  Mark paid
                </button>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
