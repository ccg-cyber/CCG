import { useState } from "react";
import { CATEGORIES } from "@/lib/categories";
import { modulesByCategory, searchModules } from "@/lib/registry";
import { ModuleIcon, moduleIconStyle } from "./moduleIcons";

/**
 * Replaces both the old sidebar's category tree and the old top bar's
 * search box — a launcher, the way a real OS's Start menu or app
 * launcher is both "browse everything" and "type to find it" in one
 * surface, not two.
 */
export default function StartMenu({
  open,
  onClose,
  onOpenModule,
}: {
  open: boolean;
  onClose: () => void;
  onOpenModule: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  if (!open) return null;

  const results = query.trim() ? searchModules(query) : null;

  function pick(id: string) {
    onOpenModule(id);
    setQuery("");
  }

  return (
    <>
      <div className="fixed inset-0 z-[940]" onClick={onClose} />
      <div className="absolute bottom-14 left-2 w-[420px] max-h-[70vh] overflow-y-auto rounded-lg border border-ci-border bg-ci-panel shadow-2xl z-[950] p-3">
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type to find a module…"
          className="w-full rounded-md border border-ci-border bg-ci-panel2 px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-ci-accent/40"
        />

        {results ? (
          <div className="space-y-1">
            {results.map((m) => {
              const s = moduleIconStyle(m.category);
              return (
                <button
                  key={m.id}
                  onClick={() => pick(m.id)}
                  className="w-full flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-ci-panel2 text-left"
                >
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${s.bg} ${s.text}`}>
                    <ModuleIcon moduleId={m.id} className="h-3.5 w-3.5" />
                  </span>
                  <span className="flex-1 truncate">{m.name}</span>
                  {m.status === "live" && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />}
                </button>
              );
            })}
            {results.length === 0 && <p className="text-xs text-ci-muted px-2 py-2">No modules match.</p>}
          </div>
        ) : (
          CATEGORIES.filter((c) => c.id !== "home").map((cat) => {
            const mods = modulesByCategory(cat.id);
            if (mods.length === 0) return null;
            const s = moduleIconStyle(cat.id);
            return (
              <div key={cat.id} className="mb-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ci-muted px-2 mb-1">{cat.label}</p>
                {mods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => pick(m.id)}
                    className="w-full flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-ci-panel2 text-left"
                  >
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${s.bg} ${s.text}`}>
                      <ModuleIcon moduleId={m.id} className="h-3.5 w-3.5" />
                    </span>
                    <span className="flex-1 truncate">{m.name}</span>
                    {m.status === "live" && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />}
                  </button>
                ))}
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
