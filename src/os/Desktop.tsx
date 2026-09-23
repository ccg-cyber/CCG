import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { WindowManagerProvider, useWindowManager } from "./WindowManagerContext";
import Window from "./Window";
import Taskbar from "./Taskbar";
import StartMenu from "./StartMenu";
import ModuleWindowContent from "./ModuleWindowContent";
import { getModule, getModuleById } from "@/lib/registry";

/** A curated, flagship set of icons on the desktop itself — the modules
 * someone opens daily, immediately visible without going through Start. */
const DESKTOP_ICONS = ["ci-home", "ci-docs", "ci-mail", "ci-crm", "ci-drive", "ci-tasks", "ci-approval-center", "ci-assistant"];

const ICONS: Record<string, string> = {
  "ci-home": "🏠",
  "ci-docs": "📄",
  "ci-mail": "✉️",
  "ci-crm": "🧭",
  "ci-drive": "🗂️",
  "ci-tasks": "✅",
  "ci-approval-center": "✔️",
  "ci-assistant": "💬",
};

function DesktopInner() {
  const { windows, activeId, openWindow, closeWindow, focusWindow, minimizeWindow, toggleMaximize, moveWindow, resizeWindow } =
    useWindowManager();
  const location = useLocation();
  const [startOpen, setStartOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const openedHomeRef = useRef(false);

  // URL is a way *in* (a link, a bookmark, a shared /modules/:slug URL
  // opens that window) — not the source of truth for what's open. Several
  // windows can be open at once with one address bar, the same tradeoff
  // any browser-based multi-window surface makes.
  useEffect(() => {
    const match = location.pathname.match(/^\/modules\/([a-z0-9-]+)/);
    if (match) {
      const mod = getModule(match[1]);
      if (mod) openWindow(mod.id);
    } else if (location.pathname === "/" && !openedHomeRef.current) {
      openedHomeRef.current = true;
      openWindow("ci-home");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  function deskSize() {
    return { w: window.innerWidth, h: window.innerHeight - 52 };
  }

  return (
    <div
      className="absolute inset-0 overflow-hidden select-none"
      style={{ background: "radial-gradient(circle at 20% -10%, #1a1f3d 0%, #0b0d18 45%, #0b0d18 100%)" }}
      onMouseDown={() => setSelectedIcon(null)}
    >
      <div className="absolute top-4 left-4 flex flex-col gap-1">
        {DESKTOP_ICONS.map((id) => {
          const mod = getModuleById(id);
          if (!mod) return null;
          return (
            <button
              key={id}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => setSelectedIcon(id)}
              onDoubleClick={() => {
                openWindow(id);
                setSelectedIcon(null);
              }}
              className={`w-20 flex flex-col items-center gap-1 rounded-md px-1 py-2 text-center ${
                selectedIcon === id ? "bg-white/15 ring-1 ring-white/30" : ""
              }`}
            >
              <span className="text-2xl leading-none">{ICONS[id] ?? "🗔"}</span>
              <span className="text-[11px] text-white/90 leading-tight" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.6)" }}>
                {mod.name.replace("CI ", "")}
              </span>
            </button>
          );
        })}
      </div>

      {windows.map((w) => {
        const mod = getModuleById(w.moduleId);
        if (!mod) return null;
        return (
          <Window
            key={w.id}
            win={w}
            title={mod.name}
            active={w.id === activeId}
            onClose={() => closeWindow(w.id)}
            onFocus={() => focusWindow(w.id)}
            onMinimize={() => minimizeWindow(w.id)}
            onToggleMaximize={() => {
              const { w: dw, h: dh } = deskSize();
              toggleMaximize(w.id, dw, dh);
            }}
            onMove={(x, y) => moveWindow(w.id, x, y)}
            onResize={(width, height) => resizeWindow(w.id, width, height)}
          >
            <ModuleWindowContent moduleId={w.moduleId} />
          </Window>
        );
      })}

      <Taskbar startOpen={startOpen} onToggleStart={() => setStartOpen((v) => !v)} />
      <StartMenu
        open={startOpen}
        onClose={() => setStartOpen(false)}
        onOpenModule={(id) => {
          openWindow(id);
          setStartOpen(false);
        }}
      />
    </div>
  );
}

export default function Desktop() {
  return (
    <WindowManagerProvider>
      <DesktopInner />
    </WindowManagerProvider>
  );
}
