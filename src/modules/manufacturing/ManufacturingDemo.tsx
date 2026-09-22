import { useAppState, completeProduction } from "@/lib/data";

export default function ManufacturingDemo() {
  const state = useAppState();

  function itemName(id: string) {
    return state.inventory.find((i) => i.id === id)?.name ?? id;
  }
  function stockOf(id: string) {
    return state.inventory.find((i) => i.id === id)?.quantityOnHand ?? 0;
  }

  return (
    <div className="max-w-2xl space-y-3">
      <p className="text-xs text-ci-muted mb-1">
        Completing an order consumes real CI Inventory stock and produces the finished good — the reverse of what CI
        Purchasing does.
      </p>
      {state.productionOrders.map((order) => {
        const canFulfill = order.inputs.every((i) => stockOf(i.itemId) >= i.quantity);
        return (
          <div key={order.id} className="rounded-lg border border-ci-border bg-ci-panel p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="text-sm font-medium">{order.name}</p>
              <span
                className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] ${
                  order.status === "completed"
                    ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                    : "border-amber-500/30 text-amber-400 bg-amber-500/10"
                }`}
              >
                {order.status}
              </span>
            </div>
            <ul className="text-xs text-ci-muted mb-2 space-y-0.5">
              {order.inputs.map((i) => (
                <li key={i.itemId}>
                  Needs {i.quantity}x {itemName(i.itemId)} (have {stockOf(i.itemId)})
                </li>
              ))}
              <li>
                Produces {order.outputQuantity}x {itemName(order.outputItemId)}
              </li>
            </ul>
            {order.status === "pending" && (
              <button
                onClick={() => completeProduction(order.id)}
                disabled={!canFulfill}
                className="text-[11px] text-ci-accent hover:underline disabled:text-ci-muted disabled:no-underline disabled:cursor-not-allowed"
              >
                {canFulfill ? "Complete production →" : "Insufficient stock"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
