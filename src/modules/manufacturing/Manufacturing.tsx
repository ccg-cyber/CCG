import { useState } from "react";
import {
  useAppState,
  startProduction,
  pauseProduction,
  cancelProduction,
  completeProduction,
  calculateBagMetering,
  type BagKind,
} from "@/lib/data";
import type { ProductionOrder } from "@/lib/types";

const STATUS_STYLE: Record<ProductionOrder["status"], string> = {
  pending: "border-ci-muted/30 text-ci-muted bg-ci-panel2",
  "in-progress": "border-ci-accent/30 text-ci-accent bg-ci-accent/10",
  paused: "border-amber-500/30 text-amber-600 bg-amber-500/10",
  completed: "border-emerald-500/30 text-emerald-600 bg-emerald-500/10",
  cancelled: "border-red-500/30 text-red-600 bg-red-500/10",
};

function OrderCard({ order }: { order: ProductionOrder }) {
  const state = useAppState();
  const [actuals, setActuals] = useState<Record<string, string>>({});

  function itemName(id: string) {
    return state.inventory.find((i) => i.id === id)?.name ?? id;
  }
  function stockOf(id: string) {
    return state.inventory.find((i) => i.id === id)?.quantityOnHand ?? 0;
  }

  const canFulfill = order.inputs.every((i) => stockOf(i.itemId) >= (Number(actuals[i.itemId]) || i.quantity));
  const active = order.status === "pending" || order.status === "in-progress" || order.status === "paused";

  return (
    <div className="rounded-lg border border-ci-border bg-ci-panel p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="text-sm font-medium">{order.name}</p>
        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] ${STATUS_STYLE[order.status]}`}>{order.status}</span>
      </div>
      <ul className="text-xs text-ci-muted mb-2 space-y-1">
        {order.inputs.map((i) => (
          <li key={i.itemId} className="flex items-center gap-2">
            <span>
              Needs {i.quantity}x {itemName(i.itemId)} (have {stockOf(i.itemId)})
            </span>
            {order.status === "in-progress" && (
              <input
                type="number"
                placeholder={`actual (default ${i.quantity})`}
                value={actuals[i.itemId] ?? ""}
                onChange={(e) => setActuals((a) => ({ ...a, [i.itemId]: e.target.value }))}
                className="w-32 rounded border border-ci-border bg-ci-panel2 px-1.5 py-0.5 text-[11px]"
              />
            )}
          </li>
        ))}
        <li>
          Produces {order.outputQuantity}x {itemName(order.outputItemId)}
        </li>
      </ul>

      {active && (
        <div className="flex gap-3">
          {order.status === "pending" && (
            <button onClick={() => startProduction(order.id)} className="text-[11px] text-ci-accent hover:underline">
              Start →
            </button>
          )}
          {order.status === "in-progress" && (
            <>
              <button onClick={() => pauseProduction(order.id)} className="text-[11px] text-amber-600 hover:underline">
                Pause
              </button>
              <button
                onClick={() => {
                  const parsed: Record<string, number> = {};
                  for (const [k, v] of Object.entries(actuals)) if (v) parsed[k] = Number(v);
                  completeProduction(order.id, parsed);
                }}
                disabled={!canFulfill}
                className="text-[11px] text-ci-accent hover:underline disabled:text-ci-muted disabled:no-underline disabled:cursor-not-allowed"
              >
                {canFulfill ? "Complete →" : "Insufficient stock"}
              </button>
            </>
          )}
          {order.status === "paused" && (
            <button onClick={() => startProduction(order.id)} className="text-[11px] text-ci-accent hover:underline">
              Resume →
            </button>
          )}
          <button onClick={() => cancelProduction(order.id)} className="text-[11px] text-ci-muted hover:underline">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

const BAG_KINDS: { value: BagKind; label: string }[] = [
  { value: "doypack", label: "Doypack (stand-up pouch)" },
  { value: "centerSeal", label: "Center seal" },
  { value: "sideSeal", label: "Side seal" },
  { value: "flatBag", label: "Flat bag" },
];

/** The bag-geometry material calculator: given a pouch's dimensions and its
 * laminate layers, works out film area, weight per piece, total material
 * weight, and metering (linear meters a production line needs to run) — the
 * actual math a converting/flexible-packaging plant uses to plan a run. */
function MeteringCalculator() {
  const [kind, setKind] = useState<BagKind>("doypack");
  const [length, setLength] = useState("20");
  const [width, setWidth] = useState("15");
  const [gusset, setGusset] = useState("5");
  const [quantity, setQuantity] = useState("1000");
  const [materialName, setMaterialName] = useState("PET 12");
  const [factor, setFactor] = useState("0.0012");

  const result = calculateBagMetering(
    kind,
    Number(length) || 0,
    Number(width) || 0,
    Number(gusset) || 0,
    Number(quantity) || 0,
    [{ name: materialName, factor: Number(factor) || 0 }]
  );

  return (
    <div className="rounded-lg border border-ci-border bg-ci-panel p-4 mb-4">
      <p className="text-sm font-medium mb-1">Bag material calculator</p>
      <p className="text-xs text-ci-muted mb-3">
        For converting/flexible-packaging runs: enter a bag's geometry and one laminate layer to see the film area,
        weight per piece, and metering (linear meters) a production line would need.
      </p>
      <div className="flex flex-wrap gap-2 mb-3">
        <select value={kind} onChange={(e) => setKind(e.target.value as BagKind)} className="rounded-md border border-ci-border bg-ci-panel2 px-2 py-1.5 text-xs">
          {BAG_KINDS.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </select>
        <input type="number" value={length} onChange={(e) => setLength(e.target.value)} placeholder="Length cm" className="w-24 rounded-md border border-ci-border bg-ci-panel2 px-2 py-1.5 text-xs" />
        <input type="number" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="Width cm" className="w-24 rounded-md border border-ci-border bg-ci-panel2 px-2 py-1.5 text-xs" />
        <input type="number" value={gusset} onChange={(e) => setGusset(e.target.value)} placeholder="Gusset cm" className="w-24 rounded-md border border-ci-border bg-ci-panel2 px-2 py-1.5 text-xs" />
        <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Quantity" className="w-24 rounded-md border border-ci-border bg-ci-panel2 px-2 py-1.5 text-xs" />
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        <input value={materialName} onChange={(e) => setMaterialName(e.target.value)} placeholder="Material name" className="flex-1 min-w-[120px] rounded-md border border-ci-border bg-ci-panel2 px-2 py-1.5 text-xs" />
        <input type="number" step="0.0001" value={factor} onChange={(e) => setFactor(e.target.value)} placeholder="g/cm² factor" className="w-28 rounded-md border border-ci-border bg-ci-panel2 px-2 py-1.5 text-xs" />
      </div>
      <div className="text-xs text-ci-muted space-y-0.5">
        <p>Effective film width: {result.effectiveFilmWidthCm} cm</p>
        <p>Weight per piece: {result.weightPerPieceG} g</p>
        <p>Total material weight: {result.totalWeightKg} kg</p>
        <p>Metering: {result.meteringMeters} m</p>
      </div>
    </div>
  );
}

export default function Manufacturing() {
  const state = useAppState();

  return (
    <div className="max-w-2xl space-y-3">
      <p className="text-xs text-ci-muted mb-1">
        Completing an order consumes real CI Inventory stock and produces the finished good — the reverse of what CI
        Purchasing does. Actual material use is reconciled against the plan at completion, not just assumed.
      </p>
      <MeteringCalculator />
      {state.productionOrders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
