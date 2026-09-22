import { NavLink } from "react-router-dom";
import { CATEGORIES } from "@/lib/categories";
import { modulesByCategory } from "@/lib/registry";

export default function Sidebar() {
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-ci-border bg-ci-panel h-screen sticky top-0 overflow-y-auto">
      <div className="px-4 py-4 border-b border-ci-border">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-gradient-to-br from-ci-accent to-ci-accent2" />
          <span className="font-semibold tracking-tight">Ci Business OS</span>
        </div>
      </div>

      <nav className="flex-1 px-2 py-3 text-sm">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex items-center gap-2 rounded-md px-3 py-2 mb-3 ${
              isActive ? "bg-ci-accent/15 text-white" : "text-ci-muted hover:bg-ci-panel2 hover:text-ci-text"
            }`
          }
        >
          Home
        </NavLink>

        {CATEGORIES.filter((c) => c.id !== "home").map((category) => {
          const mods = modulesByCategory(category.id);
          if (mods.length === 0) return null;
          return (
            <div key={category.id} className="mb-4">
              <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-ci-muted">
                {category.label}
              </div>
              <div className="flex flex-col">
                {mods.map((m) => (
                  <NavLink
                    key={m.id}
                    to={`/modules/${m.slug}`}
                    className={({ isActive }) =>
                      `flex items-center justify-between rounded-md px-3 py-1.5 ${
                        isActive ? "bg-ci-accent/15 text-white" : "text-ci-muted hover:bg-ci-panel2 hover:text-ci-text"
                      }`
                    }
                  >
                    <span className="truncate">{m.name}</span>
                    {m.status === "live" && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
