import { useAppState } from "@/lib/data";
import { MODULES } from "@/lib/registry";

const ACTOR_STYLE: Record<string, string> = {
  user: "border-ci-accent/30 text-ci-accent bg-ci-accent/10",
  agent: "border-ci-accent2/30 text-ci-accent2 bg-ci-accent2/10",
  system: "border-ci-border text-ci-muted bg-ci-border/30",
};

function moduleName(id: string): string {
  return MODULES.find((m) => m.id === id)?.name ?? id;
}

export default function Audit() {
  const state = useAppState();

  return (
    <div className="max-w-3xl">
      <p className="text-xs text-ci-muted mb-3">
        An immutable, readable timeline of every action taken in this workspace — who did it, or which agent did it,
        and why. Every CI Agent write in this app (drafting a statement, filing it, sending an approved email) logs
        here.
      </p>
      <ol className="space-y-2">
        {state.audit.map((e) => (
          <li key={e.id} className="rounded-lg border border-ci-border bg-ci-panel px-4 py-2.5">
            <div className="flex items-center justify-between gap-3 mb-1">
              <div className="flex items-center gap-2">
                <span className={`rounded-full border px-2 py-0.5 text-[11px] ${ACTOR_STYLE[e.actor]}`}>{e.actorName}</span>
                <span className="text-[11px] text-ci-muted">{moduleName(e.moduleId)}</span>
              </div>
              <span className="text-[11px] text-ci-muted shrink-0">{new Date(e.timestamp).toLocaleString()}</span>
            </div>
            <p className="text-sm">{e.action}</p>
            {e.detail && <p className="text-xs text-ci-muted mt-0.5">{e.detail}</p>}
          </li>
        ))}
      </ol>
    </div>
  );
}
