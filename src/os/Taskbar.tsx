import { useEffect, useState } from "react";
import { useWindowManager } from "./WindowManagerContext";
import { getModuleById } from "@/lib/registry";
import { useAppState } from "@/lib/data";
import { visibleNotifications } from "@/lib/notifications";

export default function Taskbar({ startOpen, onToggleStart }: { startOpen: boolean; onToggleStart: () => void }) {
  const { windows, activeId, focusWindow, minimizeWindow } = useWindowManager();
  const state = useAppState();
  const notifCount = visibleNotifications(state).length;
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="absolute bottom-0 left-0 right-0 flex items-center gap-2 px-2 bg-ci-panel/95 backdrop-blur border-t border-ci-border z-[900]"
      style={{ height: 52 }}
    >
      <button
        onClick={onToggleStart}
        className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium shrink-0 ${
          startOpen ? "bg-ci-accent/25 text-white" : "text-ci-text hover:bg-ci-panel2"
        }`}
      >
        <span className="h-4 w-4 rounded-sm bg-gradient-to-br from-ci-accent to-ci-accent2" />
        Start
      </button>

      <div className="flex-1 flex items-center gap-1 overflow-x-auto">
        {windows.map((w) => {
          const mod = getModuleById(w.moduleId);
          if (!mod) return null;
          const isFocused = w.id === activeId && !w.minimized;
          return (
            <button
              key={w.id}
              onClick={() => (isFocused ? minimizeWindow(w.id) : focusWindow(w.id))}
              data-testid={`taskbar-${w.moduleId}`}
              className={`shrink-0 rounded-md px-3 py-1.5 text-xs ${
                isFocused ? "bg-ci-accent/20 border border-ci-accent/40 text-white" : "text-ci-muted hover:bg-ci-panel2 border border-transparent"
              }`}
            >
              {mod.name}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3 text-xs text-ci-muted pr-1 shrink-0">
        {notifCount > 0 && (
          <span className="rounded-full bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5">{notifCount}</span>
        )}
        <span className="font-mono">{now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
      </div>
    </div>
  );
}
