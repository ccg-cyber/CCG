import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { WindowManagerProvider, useWindowManager } from "./WindowManagerContext";
import Window from "./Window";
import Taskbar from "./Taskbar";
import StartMenu from "./StartMenu";
import ModuleWindowContent from "./ModuleWindowContent";
import CompactShell from "./CompactShell";
import WindowErrorBoundary from "./WindowErrorBoundary";
import { ModuleIcon } from "./moduleIcons";
import { WALLPAPERS, DEFAULT_WALLPAPER } from "./wallpapers";
import { getModule, getModuleById } from "@/lib/registry";
import { useAppState } from "@/lib/data";

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


function DesktopInner() {
  const { windows, activeId, openWindow, closeWindow, focusWindow, minimizeWindow, toggleMaximize, moveWindow, resizeWindow } =
    useWindowManager();
  const location = useLocation();
  const [startOpen, setStartOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const openedHomeRef = useRef(false);
  const compact = useCompact();
  const uiState = useAppState();
  const wallpaperCss = WALLPAPERS[uiState.uiPreferences.wallpaper]?.css ?? WALLPAPERS[DEFAULT_WALLPAPER].css;

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
      // Only force Home open on a genuinely empty desktop — a restored
      // session already has its own windows and its own focus, and
      // shouldn't be reshuffled just because the URL happens to be "/".
      if (windows.length === 0) openWindow("ci-home");
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
      style={{ background: wallpaperCss }}
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
              onClick={() => {
                setSelectedIcon(id);
                openWindow(id);
              }}
              className={`group w-20 flex flex-col items-center gap-1 rounded-md px-1 py-2 text-center transition-colors ${
                selectedIcon === id ? "bg-black/8 ring-1 ring-black/15" : "hover:bg-black/5"
              }`}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 shadow-sm text-ci-accent transition-transform duration-150 group-hover:scale-110 group-hover:shadow-md group-active:scale-95">
                <ModuleIcon moduleId={id} className="h-5 w-5" />
              </span>
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
            <WindowErrorBoundary key={w.id} moduleName={mod.name} onClose={() => closeWindow(w.id)}>
              <ModuleWindowContent moduleId={w.moduleId} />
            </WindowErrorBoundary>
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
