import { Link } from "react-router-dom";
import { useAppState, customerName, restoreFromArchive } from "@/lib/data";

export default function Archive() {
  const state = useAppState();
  const archived = state.files.filter((f) => f.archived);

  return (
    <div className="max-w-2xl">
      <p className="text-xs text-ci-muted mb-3">
        The same records CI Drive holds — archiving there is what puts a file here, restoring here is what brings it
        back.
      </p>
      {archived.length === 0 && (
        <p className="text-sm text-ci-muted">
          Nothing archived yet. Archive a file from{" "}
          <Link to="/modules/drive" className="text-ci-accent">
            CI Drive
          </Link>
          .
        </p>
      )}
      <div className="space-y-2">
        {archived.map((f) => (
          <div key={f.id} className="flex items-center justify-between gap-3 rounded-lg border border-ci-border bg-ci-panel px-4 py-3">
            <div>
              <p className="text-sm">{f.name}</p>
              <p className="text-xs text-ci-muted">
                {f.owner}
                {f.customerId && ` · ${customerName(state, f.customerId)}`}
              </p>
            </div>
            <button onClick={() => restoreFromArchive(f.id)} className="text-[11px] text-ci-accent hover:underline shrink-0">
              Restore →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
