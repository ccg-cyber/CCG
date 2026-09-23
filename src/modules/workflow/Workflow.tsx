import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppState, createWorkflowRule, setWorkflowRuleEnabled, deleteWorkflowRule, runWorkflows } from "@/lib/data";
import type { WorkflowRule } from "@/lib/types";

const TRIGGER_LABEL: Record<WorkflowRule["trigger"]["type"], string> = {
  "invoice-overdue": "Invoice overdue",
  "low-stock": "Inventory below reorder point",
  "quote-stalled": "Quote sent but not decided",
};

const TEMPLATE_HINT: Record<WorkflowRule["trigger"]["type"], string> = {
  "invoice-overdue": "Use {number} and {customer}",
  "low-stock": "Use {item} and {qty}",
  "quote-stalled": "Use {customer} and {description}",
};

/**
 * The generalized version of CI Marketplace's automations: a human
 * authors a new "when X in module A, do Y in module B" rule here — no
 * code change required — instead of every automation being a hand-wired
 * `if` check inside a mutation function.
 */
export default function Workflow() {
  const state = useAppState();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [triggerType, setTriggerType] = useState<WorkflowRule["trigger"]["type"]>("invoice-overdue");
  const [thresholdDays, setThresholdDays] = useState("7");
  const [template, setTemplate] = useState("");
  const [lastRunCount, setLastRunCount] = useState<number | null>(null);

  useEffect(() => {
    setLastRunCount(runWorkflows());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleCreate() {
    if (!name.trim() || !template.trim()) return;
    const trigger: WorkflowRule["trigger"] =
      triggerType === "invoice-overdue"
        ? { type: "invoice-overdue", thresholdDays: Number(thresholdDays) || 7 }
        : triggerType === "low-stock"
        ? { type: "low-stock" }
        : { type: "quote-stalled", thresholdStatus: "sent" };
    createWorkflowRule(name.trim(), trigger, template.trim());
    setName("");
    setTemplate("");
    setOpen(false);
  }

  return (
    <div className="max-w-2xl space-y-4">
      <p className="text-xs text-ci-muted">
        Rules run against the live shared dataset and create a real{" "}
        <Link to="/modules/tasks" className="text-ci-accent">
          CI Task
        </Link>{" "}
        on each match — once per invoice/item/quote, never a duplicate. This is what turns "someone should follow up
        on that" into something that actually happens without a code change.
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setLastRunCount(runWorkflows())}
          className="rounded-lg bg-ci-accent px-4 py-2 text-sm font-medium text-white"
        >
          Run rules now
        </button>
        {lastRunCount !== null && (
          <span className="text-xs text-ci-muted">
            {lastRunCount > 0 ? `Created ${lastRunCount} task(s).` : "No new matches — up to date."}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {state.workflowRules.map((r) => (
          <div key={r.id} className="rounded-lg border border-ci-border bg-ci-panel p-3">
            <div className="flex items-start justify-between gap-3 mb-1">
              <p className="text-sm font-medium">{r.name}</p>
              <div className="flex items-center gap-2 shrink-0">
                <label className="flex items-center gap-1.5 text-[11px] text-ci-muted cursor-pointer">
                  <input type="checkbox" checked={r.enabled} onChange={(e) => setWorkflowRuleEnabled(r.id, e.target.checked)} />
                  Enabled
                </label>
                <button onClick={() => deleteWorkflowRule(r.id)} className="text-[11px] text-red-600 hover:underline">
                  Delete
                </button>
              </div>
            </div>
            <p className="text-xs text-ci-muted">
              When: {TRIGGER_LABEL[r.trigger.type]}
              {r.trigger.type === "invoice-overdue" && ` (≥ ${r.trigger.thresholdDays} days)`} → create task "
              {r.actionTitleTemplate}"
            </p>
          </div>
        ))}
      </div>

      {!open ? (
        <button onClick={() => setOpen(true)} className="rounded-lg border border-ci-border bg-ci-panel px-4 py-2 text-sm font-medium hover:bg-ci-panel2">
          + New rule
        </button>
      ) : (
        <div className="rounded-lg border border-ci-border bg-ci-panel p-3 space-y-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Rule name"
            className="w-full rounded-md border border-ci-border bg-ci-panel2 px-3 py-1.5 text-sm"
          />
          <div className="flex flex-wrap gap-2">
            <select
              value={triggerType}
              onChange={(e) => setTriggerType(e.target.value as WorkflowRule["trigger"]["type"])}
              className="rounded-md border border-ci-border bg-ci-panel2 px-3 py-1.5 text-sm"
            >
              <option value="invoice-overdue">Invoice overdue</option>
              <option value="low-stock">Inventory below reorder point</option>
              <option value="quote-stalled">Quote sent but not decided</option>
            </select>
            {triggerType === "invoice-overdue" && (
              <input
                type="number"
                value={thresholdDays}
                onChange={(e) => setThresholdDays(e.target.value)}
                placeholder="Days"
                className="w-20 rounded-md border border-ci-border bg-ci-panel2 px-3 py-1.5 text-sm"
              />
            )}
          </div>
          <input
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            placeholder={`Task title template — ${TEMPLATE_HINT[triggerType]}`}
            className="w-full rounded-md border border-ci-border bg-ci-panel2 px-3 py-1.5 text-sm"
          />
          <div className="flex gap-2">
            <button onClick={handleCreate} className="rounded-md bg-ci-accent px-3 py-1.5 text-xs font-medium text-white">
              Save rule
            </button>
            <button onClick={() => setOpen(false)} className="rounded-md border border-ci-border px-3 py-1.5 text-xs text-ci-muted">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
