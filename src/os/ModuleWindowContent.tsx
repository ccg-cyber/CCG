import { getModuleById } from "@/lib/registry";
import { CATEGORIES } from "@/lib/categories";
import StatusBadge from "@/components/StatusBadge";
import { MODULE_COMPONENTS } from "@/lib/moduleComponents";

/**
 * What every window's body actually renders: the module's real component
 * from MODULE_COMPONENTS, or — for the 48 still `planned` — the same
 * honest "not built yet" placeholder ModulePage.tsx used to show, now
 * inside window chrome instead of a full routed page. CI Home skips the
 * recap header since Home.tsx already establishes its own context.
 */
export default function ModuleWindowContent({ moduleId }: { moduleId: string }) {
  const module = getModuleById(moduleId);
  if (!module) return <p className="p-4 text-sm text-ci-muted">Module not found.</p>;

  const category = CATEGORIES.find((c) => c.id === module.category);
  const ModuleScreen = MODULE_COMPONENTS[module.id];
  const isHome = module.id === "ci-home";

  return (
    <div className={isHome ? "" : "p-4"}>
      {!isHome && (
        <div className="mb-4">
          <p className="text-xs text-ci-muted mb-1">{category?.label}</p>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold">{module.name}</h2>
            <StatusBadge status={module.status} />
          </div>
          <p className="text-xs text-ci-muted mt-1">{module.description}</p>
          {module.replaces && <p className="text-[11px] text-ci-muted/70 mt-0.5">Replaces: {module.replaces}</p>}
        </div>
      )}

      {ModuleScreen ? (
        <ModuleScreen />
      ) : (
        <div className="rounded-xl border border-dashed border-ci-border bg-ci-panel p-6 text-center text-sm text-ci-muted">
          {module.name} is registered in the Ci Business OS module map but not yet built. It slots into the{" "}
          <strong className="text-ci-text">{category?.label}</strong> category, following the same shell, permission
          model and audit trail as every live module.
        </div>
      )}
    </div>
  );
}
