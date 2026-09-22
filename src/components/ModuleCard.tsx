import { Link } from "react-router-dom";
import type { ModuleDefinition } from "@/lib/types";
import StatusBadge from "./StatusBadge";

export default function ModuleCard({ module: m }: { module: ModuleDefinition }) {
  return (
    <Link
      to={`/modules/${m.slug}`}
      className="group flex flex-col gap-2 rounded-xl border border-ci-border bg-ci-panel p-4 hover:border-ci-accent/50 hover:bg-ci-panel2 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-sm">{m.name}</h3>
        <StatusBadge status={m.status} />
      </div>
      <p className="text-xs text-ci-muted leading-relaxed">{m.description}</p>
      {m.replaces && <p className="text-[11px] text-ci-muted/70">Replaces: {m.replaces}</p>}
    </Link>
  );
}
