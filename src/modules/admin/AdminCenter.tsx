import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppState, setWallpaper, resetDemoData } from "@/lib/data";
import { WALLPAPERS } from "@/os/wallpapers";
import { estimateVfsUsage, countStoredBlobs, clearAllBlobs, formatBytes, type StorageEstimate } from "@/lib/vfs";

/**
 * OS-shell-level settings — appearance and local data — kept separate
 * from CI ERP Core's company/branch/currency master data (that's business
 * setup; this is personal-device setup, the same split a real OS draws
 * between "System Preferences" and a company's own admin console).
 */
export default function AdminCenter() {
  const state = useAppState();
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [confirmingClearFiles, setConfirmingClearFiles] = useState(false);
  const [estimate, setEstimate] = useState<StorageEstimate | null>(null);
  const [blobCount, setBlobCount] = useState<number | null>(null);

  async function refreshStorage() {
    const [est, count] = await Promise.all([estimateVfsUsage(), countStoredBlobs()]);
    setEstimate(est);
    setBlobCount(count);
  }

  useEffect(() => {
    refreshStorage();
  }, []);

  function handleReset() {
    resetDemoData();
    setConfirmingReset(false);
  }

  async function handleClearFiles() {
    await clearAllBlobs();
    setConfirmingClearFiles(false);
    refreshStorage();
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
        <p className="text-sm font-medium mb-1">File storage</p>
        <p className="text-xs text-ci-muted mb-3">
          Files uploaded through{" "}
          <Link to="/modules/drive" className="text-ci-accent">
            CI Drive
          </Link>{" "}
          store their actual content in this browser's IndexedDB, separate from everything else Ci persists — large
          files never touch localStorage's tight quota.
        </p>
        <div className="text-xs text-ci-muted mb-3 space-y-0.5">
          <p>{blobCount ?? "…"} file(s) with real content stored on this device.</p>
          {estimate && (
            <p>
              {formatBytes(estimate.usageBytes)} used of an estimated {formatBytes(estimate.quotaBytes)} this browser
              grants Ci — an estimate the browser reports, not a hard reservation.
            </p>
          )}
        </div>
        {!confirmingClearFiles ? (
          <button
            onClick={() => setConfirmingClearFiles(true)}
            className="rounded-md border border-red-500/30 text-red-600 px-3 py-1.5 text-xs font-medium hover:bg-red-500/5"
          >
            Clear uploaded file content
          </button>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-ci-muted">
              Deletes the stored content of every uploaded file (their CI Drive entries stay, but downloads will fail). Sure?
            </span>
            <button onClick={handleClearFiles} className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white">
              Yes, clear
            </button>
            <button onClick={() => setConfirmingClearFiles(false)} className="rounded-md border border-ci-border px-3 py-1.5 text-xs text-ci-muted">
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-ci-border bg-ci-panel p-4">
        <p className="text-sm font-medium mb-1">Local data</p>
        <p className="text-xs text-ci-muted mb-3">
          Everything else in Ci — invoices, deals, tasks, every module's records — is stored in this browser's
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
