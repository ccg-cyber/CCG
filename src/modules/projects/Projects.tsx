import { useAppState, projectProgress, toggleTask } from "@/lib/data";

export default function Projects() {
  const state = useAppState();

  return (
    <div className="max-w-2xl space-y-4">
      {state.projects.map((p) => {
        const { done, total } = projectProgress(state, p.id);
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        const tasks = state.tasks.filter((t) => t.projectId === p.id);
        return (
          <div key={p.id} className="rounded-lg border border-ci-border bg-ci-panel p-4">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-medium">{p.name}</h3>
              <span className="text-[11px] text-ci-muted">Due {p.dueDate}</span>
            </div>
            <div className="h-1.5 rounded-full bg-ci-border overflow-hidden mb-3">
              <div className="h-full bg-ci-accent" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-xs text-ci-muted mb-3">
              {done}/{total} tasks complete ({pct}%)
            </p>
            <ul className="space-y-1.5">
              {tasks.map((t) => (
                <li key={t.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)} className="h-3.5 w-3.5 accent-ci-accent" />
                  <span className={t.done ? "line-through text-ci-muted" : ""}>{t.title}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
      {state.projects.length === 0 && <p className="text-sm text-ci-muted">No projects yet.</p>}
    </div>
  );
}
