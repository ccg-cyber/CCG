import { useState } from "react";
import { useAppState, customerName, dispatchShipment, deliverShipment } from "@/lib/data";
import type { Shipment } from "@/lib/types";

const STATUS_STYLE: Record<Shipment["status"], string> = {
  pending: "border-ci-border text-ci-muted bg-ci-border/30",
  "in-transit": "border-amber-500/30 text-amber-400 bg-amber-500/10",
  delivered: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
};

export default function Logistics() {
  const state = useAppState();
  const [carrierInput, setCarrierInput] = useState<Record<string, string>>({});

  return (
    <div className="max-w-2xl space-y-2">
      {state.shipments.map((s) => (
        <div key={s.id} className="rounded-lg border border-ci-border bg-ci-panel px-4 py-3">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <p className="text-sm font-medium">{s.description}</p>
              <p className="text-xs text-ci-muted">
                {customerName(state, s.customerId)}
                {s.carrier && ` · ${s.carrier}`}
              </p>
            </div>
            <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] ${STATUS_STYLE[s.status]}`}>{s.status}</span>
          </div>

          {s.status === "pending" && (
            <div className="flex gap-2">
              <input
                value={carrierInput[s.id] ?? ""}
                onChange={(e) => setCarrierInput((c) => ({ ...c, [s.id]: e.target.value }))}
                placeholder="Carrier name…"
                className="flex-1 rounded-md border border-ci-border bg-ci-panel2 px-2 py-1 text-xs"
              />
              <button
                onClick={() => dispatchShipment(s.id, carrierInput[s.id] || "Standard Carrier")}
                className="text-[11px] text-ci-accent hover:underline shrink-0"
              >
                Dispatch →
              </button>
            </div>
          )}
          {s.status === "in-transit" && (
            <button onClick={() => deliverShipment(s.id)} className="text-[11px] text-ci-accent hover:underline">
              Mark delivered →
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
