import { useAppState } from "@/lib/data";

export default function Inventory() {
  const state = useAppState();

  return (
    <div className="max-w-2xl">
      <p className="text-xs text-ci-muted mb-3">
        Stock levels update automatically when a linked purchase order is approved in CI Purchasing — nothing here is
        entered by hand.
      </p>
      <div className="rounded-lg border border-ci-border bg-ci-panel overflow-hidden">
        <div className="grid grid-cols-[100px_1fr_140px_140px] gap-2 px-4 py-2 text-[11px] uppercase tracking-wider text-ci-muted border-b border-ci-border">
          <span>SKU</span>
          <span>Item</span>
          <span>On hand</span>
          <span>Reorder point</span>
        </div>
        {state.inventory.map((item) => {
          const low = item.quantityOnHand < item.reorderPoint;
          return (
            <div key={item.id} className="grid grid-cols-[100px_1fr_140px_140px] items-center gap-2 px-4 py-2.5 text-sm border-b border-ci-border last:border-b-0">
              <span className="text-ci-muted">{item.sku}</span>
              <span>{item.name}</span>
              <span className={low ? "text-red-400 font-medium" : ""}>
                {item.quantityOnHand} {low && "· low stock"}
              </span>
              <span className="text-ci-muted">{item.reorderPoint}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
