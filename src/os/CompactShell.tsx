import { useState } from "react";
import { useWindowManager } from "./WindowManagerContext";
import ModuleWindowContent from "./ModuleWindowContent";
import { getModuleById, searchModules } from "@/lib/registry";
import { visibleNotifications } from "@/lib/notifications";
import { useAppState } from "@/lib/data";

/**
 * Phone-width layout: the floating-window desktop metaphor doesn't hold up
 * on a 390px screen — no real handheld OS (Palm, the P800, iOS, Android)
 * shows draggable overlapping windows. Instead: one app fills the screen at
 * a time, a back button returns to a home-screen icon grid, and apps you
 * left keep running in the background (minimized, not closed) so returning
 * to one is instant, exactly like tapping an app icon on a phone.
 */
const HOME_ICONS = [
  "ci-home", "ci-mail", "ci-crm", "ci-drive", "ci-tasks",
  "ci-approval-center", "ci-calendar", "ci-invoicing", "ci-assistant",
];

const ICONS: Record<string, string> = {
  "ci-home": "🏠", "ci-docs": "📄", "ci-mail": "✉️", "ci-crm": "🧭",
  "ci-drive": "🗂️", "ci-tasks": "✅", "ci-approval-center": "✔️",
  "ci-assistant": "💬", "ci-calendar": "📅", "ci-invoicing": "🧾",
};

export default function CompactShell() {
  const { windows, activeId, openWindow, minimizeWindow, closeWindow, focusWindow } = useWindowManager();
  const [query, setQuery] = useState("");
  const state = useAppState();
  const notifCount = visibleNotifications(state).length;

  const active = windows.find((w) => w.id === activeId && !w.minimized);
  const results = query.trim() ? searchModules(query) : null;

  if (active) {
    const mod = getModuleById(active.moduleId);
    return (
      <div className="absolute inset-0 flex flex-col bg-ci-bg" data-testid={`compact-app-${active.moduleId}`}>
        <div className="flex items-center gap-2 border-b border-ci-border bg-ci-panel px-2 shrink-0" style={{ height: 48 }}>
          <button
            onClick={() => minimizeWindow(active.id)}
            aria-label="Back"
            data-testid="compact-back"
            className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-ci-text hover:bg-ci-panel2"
          >
            <span className="text-lg leading-none">‹</span> Home
          </button>
          <span className="flex-1 text-center text-sm font-medium truncate pr-14">{mod?.name}</span>
          <button
            onClick={() => closeWindow(active.id)}
            aria-label="Close"
            data-testid="compact-close"
            className="absolute right-2 rounded-md px-2 py-1.5 text-xs text-ci-muted hover:bg-ci-panel2"
          >
            Close
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          <ModuleWindowContent moduleId={active.moduleId} />
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col bg-ci-bg overflow-hidden">
      <div className="px-4 pt-5 pb-3 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-semibold">Ci</span>
          {notifCount > 0 && (
            <span className="rounded-full bg-red-500/20 text-red-600 border border-red-500/30 px-2 py-0.5 text-xs">
              {notifCount}
            </span>
          )}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search everything — mail, files, customer…"
          className="w-full rounded-full border border-ci-border bg-ci-panel px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ci-accent/40"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {results ? (
          <div className="space-y-1">
            {results.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  openWindow(m.id);
                  setQuery("");
                }}
                className="w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-sm bg-ci-panel hover:bg-ci-panel2 text-left mb-1.5"
              >
                <span>{m.name}</span>
                {m.status === "live" && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />}
              </button>
            ))}
            {results.length === 0 && <p className="text-xs text-ci-muted px-1 py-2">No modules match.</p>}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-3 mb-6">
              {HOME_ICONS.map((id) => {
                const mod = getModuleById(id);
                if (!mod) return null;
                return (
                  <button
                    key={id}
                    onClick={() => openWindow(id)}
                    data-testid={`app-icon-${id}`}
                    className="flex flex-col items-center gap-1.5 text-center"
                  >
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ci-panel text-2xl">
                      {ICONS[id] ?? "🗔"}
                    </span>
                    <span className="text-[11px] text-ci-text leading-tight">{mod.name.replace("CI ", "")}</span>
                  </button>
                );
              })}
            </div>

            {windows.some((w) => w.minimized) && (
              <>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ci-muted mb-2">Running</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {windows.filter((w) => w.minimized).map((w) => {
                    const mod = getModuleById(w.moduleId);
                    if (!mod) return null;
                    return (
                      <button
                        key={w.id}
                        onClick={() => focusWindow(w.id)}
                        data-testid={`running-${w.moduleId}`}
                        className="shrink-0 rounded-lg border border-ci-border bg-ci-panel px-3 py-2 text-xs whitespace-nowrap"
                      >
                        {mod.name}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
