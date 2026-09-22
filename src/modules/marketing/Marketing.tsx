import { useState } from "react";
import { useAppState, launchCampaign } from "@/lib/data";

export default function Marketing() {
  const state = useAppState();
  const [name, setName] = useState("");
  const newLeads = state.deals.filter((d) => d.stage === "New").length;

  function handleLaunch() {
    if (!name.trim()) return;
    launchCampaign(name.trim());
    setName("");
  }

  return (
    <div className="max-w-2xl">
      <div className="rounded-lg border border-ci-border bg-ci-panel p-4 mb-4">
        <p className="text-sm font-medium mb-1">Launch a campaign to New-stage leads</p>
        <p className="text-xs text-ci-muted mb-3">
          Reads CI CRM directly — {newLeads} deal(s) currently in "New" stage will receive an email via CI Mail.
        </p>
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Campaign name…"
            className="flex-1 rounded-lg border border-ci-border bg-ci-panel2 px-3 py-2 text-sm"
          />
          <button onClick={handleLaunch} disabled={newLeads === 0} className="rounded-lg bg-ci-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-40">
            Launch
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {state.campaigns.map((c) => (
          <div key={c.id} className="flex items-center justify-between gap-3 rounded-lg border border-ci-border bg-ci-panel px-4 py-3">
            <div>
              <p className="text-sm font-medium">{c.name}</p>
              <p className="text-xs text-ci-muted">{c.audienceCount} recipient(s)</p>
            </div>
            <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-400">
              {c.status}
            </span>
          </div>
        ))}
        {state.campaigns.length === 0 && <p className="text-sm text-ci-muted">No campaigns launched yet.</p>}
      </div>
    </div>
  );
}
