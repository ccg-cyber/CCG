import type { ModuleStatus } from "@/lib/types";

const STYLES: Record<ModuleStatus, string> = {
  live: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  scaffolded: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  planned: "bg-ci-border/60 text-ci-muted border-ci-border",
};

const LABELS: Record<ModuleStatus, string> = {
  live: "Live",
  scaffolded: "Scaffolded",
  planned: "Planned",
};

export default function StatusBadge({ status }: { status: ModuleStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  );
}
