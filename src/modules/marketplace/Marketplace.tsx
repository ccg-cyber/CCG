import { useAppState, setAutomationEnabled, AUTOMATION_CATALOG } from "@/lib/data";

/**
 * Not a catalog of things to "install" that don't exist yet — a real
 * on/off switch for the cross-module automations already built. Turning
 * one off changes what the underlying mutation function actually does,
 * verified in ARCHITECTURE.md's automation-chain sections.
 */
export default function Marketplace() {
  const state = useAppState();

  return (
    <div className="max-w-2xl space-y-2">
      <p className="text-xs text-ci-muted mb-2">
        Toggling one off takes effect on the next matching action — nothing here is just a UI flag.
      </p>
      {AUTOMATION_CATALOG.map((a) => {
        const enabled = state.automations[a.id] ?? true;
        return (
          <div key={a.id} className="flex items-center justify-between gap-3 rounded-lg border border-ci-border bg-ci-panel px-4 py-3">
            <div>
              <p className="text-sm font-medium">{a.name}</p>
              <p className="text-xs text-ci-muted">{a.description}</p>
            </div>
            <button
              onClick={() => setAutomationEnabled(a.id, !enabled)}
              className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-medium ${
                enabled ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-ci-border/40 text-ci-muted border border-ci-border"
              }`}
            >
              {enabled ? "On" : "Off"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
