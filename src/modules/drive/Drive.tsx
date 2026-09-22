import { useAppState, customerName } from "@/lib/data";
import type { DriveFile } from "@/lib/types";

const ICON: Record<DriveFile["type"], string> = {
  folder: "📁",
  doc: "📄",
  pdf: "📕",
  sheet: "📊",
};

export default function Drive() {
  const state = useAppState();
  const files = [...state.files].sort((a, b) => (a.id < b.id ? 1 : -1));

  return (
    <div className="max-w-3xl rounded-lg border border-ci-border bg-ci-panel overflow-hidden">
      <div className="grid grid-cols-[1fr_140px_120px] gap-2 px-4 py-2 text-[11px] uppercase tracking-wider text-ci-muted border-b border-ci-border">
        <span>Name</span>
        <span>Owner</span>
        <span>Modified</span>
      </div>
      {files.map((f) => (
        <div
          key={f.id}
          className="grid grid-cols-[1fr_140px_120px] gap-2 px-4 py-2.5 text-sm hover:bg-ci-panel2 border-b border-ci-border last:border-b-0"
        >
          <span className="flex items-center gap-2 truncate">
            <span>{ICON[f.type]}</span>
            {f.name}
            {f.customerId && (
              <span className="text-[10px] text-ci-muted border border-ci-border rounded-full px-1.5 py-0.5">
                {customerName(state, f.customerId)}
              </span>
            )}
          </span>
          <span className={`truncate ${f.owner === "CI Agent" ? "text-ci-accent" : "text-ci-muted"}`}>{f.owner}</span>
          <span className="text-ci-muted">{f.modified}</span>
        </div>
      ))}
    </div>
  );
}
