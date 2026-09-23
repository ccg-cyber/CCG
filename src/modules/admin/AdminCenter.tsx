import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppState, setWallpaper, resetDemoData } from "@/lib/data";
import { WALLPAPERS } from "@/os/wallpapers";

/**
 * OS-shell-level settings — appearance and local data — kept separate
 * from CI ERP Core's company/branch/currency master data (that's business
 * setup; this is personal-device setup, the same split a real OS draws
 * between "System Preferences" and a company's own admin console).
 */
export default function AdminCenter() {
  const state = useAppState();
  const [confirmingReset, setConfirmingReset] = useState(false);

  function handleReset() {
    resetDemoData();
    setConfirmingReset(false);
  }

  return (
    <div className="max-w-2xl space-y-4">
      <p className="text-xs text-ci-muted">
        Company profile, branches, and currency live in{" "}
        <Link to="/modules/erp" className="text-ci-accent">
          CI ERP Core
        </Link>{" "}
        — this is device-level appearance and local data instead.
      </p>

      <div className="rounded-lg border border-ci-border bg-ci-panel p-4">
        <p className="text-sm font-medium mb-3">Desktop wallpaper</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {Object.entries(WALLPAPERS).map(([key, w]) => (
            <button
              key={key}
              onClick={() => setWallpaper(key)}
              className={`flex flex-col items-center gap-1.5 rounded-md p-1.5 ${
                state.uiPreferences.wallpaper === key ? "ring-2 ring-ci-accent" : ""
              }`}
            >
              <span className="h-12 w-full rounded-md border border-ci-border" style={{ background: w.css }} />
              <span className="text-[11px] text-ci-muted">{w.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-ci-border bg-ci-panel p-4">
        <p className="text-sm font-medium mb-1">Local data</p>
        <p className="text-xs text-ci-muted mb-3">
          Everything in Ci — invoices, deals, files, tasks, every module's data — is stored in this browser's
          localStorage. It's real, and it persists across reloads, but it's local to this device until Ci has a
          real backend.
        </p>
        {!confirmingReset ? (
          <button
            onClick={() => setConfirmingReset(true)}
            className="rounded-md border border-red-500/30 text-red-600 px-3 py-1.5 text-xs font-medium hover:bg-red-500/5"
          >
            Reset all demo data
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-ci-muted">This erases everything you've entered and reseeds the demo data. Sure?</span>
            <button onClick={handleReset} className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white">
              Yes, reset
            </button>
            <button onClick={() => setConfirmingReset(false)} className="rounded-md border border-ci-border px-3 py-1.5 text-xs text-ci-muted">
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
