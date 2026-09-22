import { useState } from "react";
import { useAppState, sellStock } from "@/lib/data";

export default function POS() {
  const state = useAppState();
  const [itemId, setItemId] = useState(state.inventory[0]?.id ?? "");
  const [quantity, setQuantity] = useState("1");
  const item = state.inventory.find((i) => i.id === itemId);
  const total = item ? item.unitPrice * (Number(quantity) || 0) : 0;

  function handleSell() {
    if (!item) return;
    sellStock(itemId, Number(quantity));
    setQuantity("1");
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="rounded-lg border border-ci-border bg-ci-panel p-4">
        <p className="text-xs text-ci-muted mb-3">
          Sells directly against CI Inventory's real stock — a different path from CI Sales' quote-to-deal flow.
        </p>
        <div className="flex flex-wrap items-end gap-2">
          <select value={itemId} onChange={(e) => setItemId(e.target.value)} className="rounded-lg border border-ci-border bg-ci-panel2 px-3 py-2 text-sm">
            {state.inventory.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name} — ${i.unitPrice} ({i.quantityOnHand} in stock)
              </option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-20 rounded-lg border border-ci-border bg-ci-panel2 px-3 py-2 text-sm"
          />
          <button
            onClick={handleSell}
            disabled={!item || Number(quantity) < 1 || (item?.quantityOnHand ?? 0) < Number(quantity)}
            className="rounded-lg bg-ci-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            Sell for ${total.toLocaleString()}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        {state.sales.map((s) => {
          const soldItem = state.inventory.find((i) => i.id === s.itemId);
          return (
            <div key={s.id} className="flex items-center justify-between gap-3 rounded-lg border border-ci-border bg-ci-panel px-4 py-2.5 text-sm">
              <span>
                {s.quantity}x {soldItem?.name ?? s.itemId}
              </span>
              <span className="text-ci-muted">
                ${s.total.toLocaleString()} · {new Date(s.timestamp).toLocaleTimeString()}
              </span>
            </div>
          );
        })}
        {state.sales.length === 0 && <p className="text-sm text-ci-muted">No sales yet.</p>}
      </div>
    </div>
  );
}
