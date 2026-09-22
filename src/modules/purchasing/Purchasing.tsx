import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppState, customerName, createPurchaseOrder } from "@/lib/data";
import type { PurchaseOrder } from "@/lib/types";

const STATUS_STYLE: Record<PurchaseOrder["status"], string> = {
  pending: "border-amber-500/30 text-amber-400 bg-amber-500/10",
  approved: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
  rejected: "border-red-500/30 text-red-400 bg-red-500/10",
  ordered: "border-ci-accent/30 text-ci-accent bg-ci-accent/10",
};

export default function Purchasing() {
  const state = useAppState();
  const suppliers = state.customers.filter((c) => c.tags.includes("supplier"));
  const [open, setOpen] = useState(false);
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id ?? "");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  function handleCreate() {
    if (!supplierId || !description.trim() || !amount) return;
    createPurchaseOrder(supplierId, description.trim(), Number(amount));
    setDescription("");
    setAmount("");
    setOpen(false);
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-4">
        {!open ? (
          <button onClick={() => setOpen(true)} className="rounded-lg bg-ci-accent px-4 py-2 text-sm font-medium text-white">
            + New purchase order
          </button>
        ) : (
          <div className="flex flex-wrap gap-2 rounded-lg border border-ci-border bg-ci-panel p-3">
            <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="rounded-md border border-ci-border bg-ci-panel2 px-3 py-1.5 text-sm">
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="flex-1 min-w-[160px] rounded-md border border-ci-border bg-ci-panel2 px-3 py-1.5 text-sm" />
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" className="w-28 rounded-md border border-ci-border bg-ci-panel2 px-3 py-1.5 text-sm" />
            <button onClick={handleCreate} className="rounded-md bg-ci-accent px-3 py-1.5 text-xs font-medium text-white">Submit for approval</button>
            <button onClick={() => setOpen(false)} className="rounded-md border border-ci-border px-3 py-1.5 text-xs text-ci-muted">Cancel</button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {state.purchaseOrders.map((po) => (
          <div key={po.id} className="flex items-center justify-between gap-3 rounded-lg border border-ci-border bg-ci-panel px-4 py-3">
            <div>
              <p className="text-sm font-medium">
                {po.id.toUpperCase()} — {customerName(state, po.supplierId)}
              </p>
              <p className="text-xs text-ci-muted">
                {po.description} · ${po.amount.toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {po.status === "pending" && (
                <Link to="/modules/approvals" className="text-[11px] text-ci-accent">
                  Review →
                </Link>
              )}
              <span className={`rounded-full border px-2 py-0.5 text-[11px] ${STATUS_STYLE[po.status]}`}>{po.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
