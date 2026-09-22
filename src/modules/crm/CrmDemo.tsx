import { useAppState, moveDealStage } from "@/lib/data";
import type { Deal } from "@/lib/types";

const STAGES: Deal["stage"][] = ["New", "Qualified", "Proposal", "Won"];
const NEXT_STAGE: Record<Deal["stage"], Deal["stage"] | null> = {
  New: "Qualified",
  Qualified: "Proposal",
  Proposal: "Won",
  Won: null,
};

export default function CrmDemo() {
  const state = useAppState();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl">
      {STAGES.map((stage) => (
        <div key={stage} className="rounded-lg border border-ci-border bg-ci-panel p-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ci-muted mb-3">{stage}</h3>
          <div className="space-y-2">
            {state.deals
              .filter((d) => d.stage === stage)
              .map((d) => {
                const next = NEXT_STAGE[d.stage];
                return (
                  <div key={d.id} className="rounded-md border border-ci-border bg-ci-panel2 p-2.5">
                    <p className="text-sm font-medium">{d.name}</p>
                    <p className="text-xs text-ci-muted mb-2">${d.value.toLocaleString()}</p>
                    {next && (
                      <button
                        onClick={() => moveDealStage(d.id, next)}
                        className="text-[11px] text-ci-accent hover:underline"
                      >
                        Move to {next} →
                      </button>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
