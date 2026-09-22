import { useState } from "react";
import { Link } from "react-router-dom";
import { planFor, type AskCiPlan } from "@/lib/ask-ci";

const EXAMPLES = [
  "Customer X hasn't paid, prepare a statement and draft a follow-up email",
  "Show me everything happening with Customer X",
  "I need a video editor",
];

export default function AskCiBar() {
  const [input, setInput] = useState("");
  const [plan, setPlan] = useState<AskCiPlan | null>(null);

  function run(q: string) {
    if (!q.trim()) return;
    setPlan(planFor(q));
  }

  return (
    <div className="rounded-xl border border-ci-border bg-ci-panel p-4">
      <div className="flex items-center gap-2 text-sm font-medium mb-2">
        <span className="h-2 w-2 rounded-full bg-gradient-to-br from-ci-accent to-ci-accent2" />
        Ask CI
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(input);
        }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tell CI what you need — it decides which modules to use…"
          className="flex-1 rounded-lg border border-ci-border bg-ci-panel2 px-3 py-2 text-sm placeholder:text-ci-muted focus:outline-none focus:ring-2 focus:ring-ci-accent/40"
        />
        <button
          type="submit"
          className="rounded-lg bg-ci-accent px-4 py-2 text-sm font-medium text-white hover:bg-ci-accent/90"
        >
          Ask
        </button>
      </form>

      {!plan && (
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => {
                setInput(ex);
                run(ex);
              }}
              className="rounded-full border border-ci-border px-3 py-1 text-xs text-ci-muted hover:text-ci-text hover:border-ci-accent/50"
            >
              {ex}
            </button>
          ))}
        </div>
      )}

      {plan && (
        <div className="mt-4 rounded-lg border border-ci-border bg-ci-panel2 p-4">
          <p className="text-sm mb-3">{plan.summary}</p>
          {plan.steps.length > 0 && (
            <ol className="space-y-1.5 mb-3">
              {plan.steps.map((step, i) => (
                <li key={i} className="flex gap-2 text-xs text-ci-muted">
                  <span className="text-ci-accent font-medium">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          )}
          {plan.modules.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {plan.modules.map((m) => (
                <Link
                  key={m.id}
                  to={`/modules/${m.slug}`}
                  className="rounded-full bg-ci-border/50 px-2.5 py-1 text-[11px] hover:bg-ci-accent/20"
                >
                  {m.name}
                </Link>
              ))}
            </div>
          )}
          {plan.needsApproval && (
            <div className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] text-amber-400">
              Routed to CI Approval Center — nothing happens without your sign-off
            </div>
          )}
          <button
            onClick={() => {
              setPlan(null);
              setInput("");
            }}
            className="block mt-3 text-xs text-ci-muted hover:text-ci-text"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
