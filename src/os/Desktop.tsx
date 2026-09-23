import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { WindowManagerProvider, useWindowManager } from "./WindowManagerContext";
import Window from "./Window";
import Taskbar from "./Taskbar";
import StartMenu from "./StartMenu";
import ModuleWindowContent from "./ModuleWindowContent";
import CompactShell from "./CompactShell";
import { getModule, getModuleById } from "@/lib/registry";

/** Below this width, the floating-window desktop metaphor stops making
 * sense — nothing with a screen this size (Palm, the P800, a phone today)
 * shows draggable overlapping windows. CompactShell takes over instead. */
const COMPACT_BREAKPOINT = 720;

function useCompact() {
  const [compact, setCompact] = useState(() => window.innerWidth < COMPACT_BREAKPOINT);
  useEffect(() => {
    const onResize = () => setCompact(window.innerWidth < COMPACT_BREAKPOINT);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return compact;
}

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
  const compact = useCompact();

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

  if (compact) return <CompactShell />;

  return (
    <div
      className="absolute inset-0 overflow-hidden select-none"
      style={{ background: "radial-gradient(circle at 20% -10%, #e9edf9 0%, #f4f5f8 45%, #f4f5f8 100%)" }}
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
                selectedIcon === id ? "bg-black/8 ring-1 ring-black/15" : ""
              }`}
            >
              <span className="text-2xl leading-none">{ICONS[id] ?? "🗔"}</span>
              <span className="text-[11px] text-ci-text leading-tight">{mod.name.replace("CI ", "")}</span>
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
