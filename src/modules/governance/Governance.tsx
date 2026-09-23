import { useState } from "react";
import { useAppState, setPoAutoApproveThreshold } from "@/lib/data";

export default function Governance() {
  const state = useAppState();
  const [value, setValue] = useState(String(state.governance.poAutoApproveThreshold));

  function save() {
    const n = Number(value);
    if (Number.isNaN(n) || n < 0) return;
    setPoAutoApproveThreshold(n);
  }

  return (
    <div className="max-w-2xl">
      <div className="rounded-lg border border-ci-border bg-ci-panel p-4">
        <h3 className="text-sm font-medium mb-1">Purchase order auto-approval threshold</h3>
        <p className="text-xs text-ci-muted mb-3">
          A new purchase order in CI Purchasing at or below this amount is approved automatically — no CI Approval
          Center queue, no human sign-off. Above it, nothing changes.
        </p>
        <div className="flex gap-2">
          <span className="flex items-center text-sm text-ci-muted">$</span>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-32 rounded-lg border border-ci-border bg-ci-panel2 px-3 py-2 text-sm"
          />
          <button onClick={save} className="rounded-lg bg-ci-accent px-4 py-2 text-sm font-medium text-white">
            Save
          </button>
        </div>
        <p className="text-xs text-ci-muted mt-3">
          Currently: <span className="text-ci-text">${state.governance.poAutoApproveThreshold.toLocaleString()}</span>
        </p>
      </div>
    </div>
  );
}
