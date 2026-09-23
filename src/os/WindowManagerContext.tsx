import { createContext, useContext, useEffect, useReducer, type ReactNode } from "react";
import { getModuleById } from "@/lib/registry";

/**
 * Real window state: position, size, stacking order, minimized/maximized —
 * not a metaphor. This is what makes opening CI CRM and CI Mail at once
 * behave like two windows on a desktop instead of two routes replacing
 * each other.
 *
 * Persisted to its own localStorage key (separate from src/lib/store.ts's
 * business data) — a real OS resumes whatever you had open when you wake
 * it, it doesn't reboot to a bare desktop every time. On mobile especially,
 * the browser/PWA reloads the page far more often than a person chooses
 * to — every "start from the beginning" on reopen was exactly this state
 * being thrown away on every real page load, which is the opposite of
 * "you shouldn't need to exit."
 */
const WINDOWS_STORAGE_KEY = "ci-os-windows-v1";

export interface OSWindow {
  id: string;
  moduleId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  minimized: boolean;
  maximized: boolean;
  prevBounds?: { x: number; y: number; width: number; height: number };
}

type Action =
  | { type: "OPEN"; moduleId: string }
  | { type: "CLOSE"; id: string }
  | { type: "FOCUS"; id: string }
  | { type: "MINIMIZE"; id: string }
  | { type: "TOGGLE_MAXIMIZE"; id: string; deskWidth: number; deskHeight: number }
  | { type: "MOVE"; id: string; x: number; y: number }
  | { type: "RESIZE"; id: string; width: number; height: number };

interface State {
  windows: OSWindow[];
  nextZ: number;
  activeId: string | null;
}

const EMPTY_STATE: State = { windows: [], nextZ: 1, activeId: null };

function loadPersistedState(): State {
  try {
    const raw = localStorage.getItem(WINDOWS_STORAGE_KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw) as State;
    // A module removed or renamed since this was saved shouldn't resurrect
    // as a broken window — drop anything that no longer resolves.
    const windows = (parsed.windows ?? []).filter((w) => getModuleById(w.moduleId));
    return { windows, nextZ: parsed.nextZ ?? 1, activeId: windows.some((w) => w.id === parsed.activeId) ? parsed.activeId : null };
  } catch {
    return EMPTY_STATE;
  }
}

/** Whether this browser already has a Ci session to resume — used to skip
 * the boot sequence on anything but a genuine first/cold start. */
export function hasRestorableSession(): boolean {
  return loadPersistedState().windows.length > 0;
}

const DEFAULT_WIDTH = 860;
const DEFAULT_HEIGHT = 580;
const MIN_WIDTH = 360;
const MIN_HEIGHT = 240;

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "OPEN": {
      const existing = state.windows.find((w) => w.moduleId === action.moduleId);
      if (existing) {
        return {
          windows: state.windows.map((w) => (w.id === existing.id ? { ...w, minimized: false, zIndex: state.nextZ } : w)),
          nextZ: state.nextZ + 1,
          activeId: existing.id,
        };
      }
      const count = state.windows.length;
      const width = Math.min(DEFAULT_WIDTH, Math.max(MIN_WIDTH, window.innerWidth - 40));
      const height = Math.min(DEFAULT_HEIGHT, Math.max(MIN_HEIGHT, window.innerHeight - 120));
      const id = `win-${action.moduleId}-${Date.now()}`;
      const newWin: OSWindow = {
        id,
        moduleId: action.moduleId,
        // Offset clear of the desktop icon column (roughly x:0-110) so
        // the first window opened doesn't immediately bury every icon —
        // a real OS lets this happen too once you've moved windows
        // around, but it shouldn't be the very first thing you see.
        x: 150 + (count % 8) * 26,
        y: 30 + (count % 8) * 26,
        width,
        height,
        zIndex: state.nextZ,
        minimized: false,
        maximized: false,
      };
      return { windows: [...state.windows, newWin], nextZ: state.nextZ + 1, activeId: id };
    }
    case "CLOSE": {
      const windows = state.windows.filter((w) => w.id !== action.id);
      const activeId = state.activeId === action.id ? windows[windows.length - 1]?.id ?? null : state.activeId;
      return { ...state, windows, activeId };
    }
    case "FOCUS": {
      if (!state.windows.some((w) => w.id === action.id)) return state;
      return {
        windows: state.windows.map((w) => (w.id === action.id ? { ...w, minimized: false, zIndex: state.nextZ } : w)),
        nextZ: state.nextZ + 1,
        activeId: action.id,
      };
    }
    case "MINIMIZE": {
      const windows = state.windows.map((w) => (w.id === action.id ? { ...w, minimized: true } : w));
      const activeId = state.activeId === action.id ? null : state.activeId;
      return { ...state, windows, activeId };
    }
    case "TOGGLE_MAXIMIZE": {
      return {
        ...state,
        windows: state.windows.map((w) => {
          if (w.id !== action.id) return w;
          if (w.maximized) {
            const prev = w.prevBounds ?? { x: 60, y: 40, width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT };
            return { ...w, maximized: false, x: prev.x, y: prev.y, width: prev.width, height: prev.height, prevBounds: undefined };
          }
          return {
            ...w,
            maximized: true,
            prevBounds: { x: w.x, y: w.y, width: w.width, height: w.height },
            x: 6,
            y: 6,
            width: Math.max(MIN_WIDTH, action.deskWidth - 12),
            height: Math.max(MIN_HEIGHT, action.deskHeight - 12),
          };
        }),
      };
    }
    case "MOVE":
      return { ...state, windows: state.windows.map((w) => (w.id === action.id ? { ...w, x: action.x, y: action.y } : w)) };
    case "RESIZE":
      return { ...state, windows: state.windows.map((w) => (w.id === action.id ? { ...w, width: action.width, height: action.height } : w)) };
    default:
      return state;
  }
}

interface WindowManagerValue {
  windows: OSWindow[];
  activeId: string | null;
  openWindow: (moduleId: string) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  toggleMaximize: (id: string, deskWidth: number, deskHeight: number) => void;
  moveWindow: (id: string, x: number, y: number) => void;
  resizeWindow: (id: string, width: number, height: number) => void;
}

const WindowManagerContext = createContext<WindowManagerValue | null>(null);

export function WindowManagerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadPersistedState);

  useEffect(() => {
    try {
      localStorage.setItem(WINDOWS_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // best-effort only — losing window-restore state is not worth surfacing an error over
    }
  }, [state]);

  const value: WindowManagerValue = {
    windows: state.windows,
    activeId: state.activeId,
    openWindow: (moduleId) => dispatch({ type: "OPEN", moduleId }),
    closeWindow: (id) => dispatch({ type: "CLOSE", id }),
    focusWindow: (id) => dispatch({ type: "FOCUS", id }),
    minimizeWindow: (id) => dispatch({ type: "MINIMIZE", id }),
    toggleMaximize: (id, deskWidth, deskHeight) => dispatch({ type: "TOGGLE_MAXIMIZE", id, deskWidth, deskHeight }),
    moveWindow: (id, x, y) => dispatch({ type: "MOVE", id, x, y }),
    resizeWindow: (id, width, height) => dispatch({ type: "RESIZE", id, width, height }),
  };

  return <WindowManagerContext.Provider value={value}>{children}</WindowManagerContext.Provider>;
}

export function useWindowManager(): WindowManagerValue {
  const ctx = useContext(WindowManagerContext);
  if (!ctx) throw new Error("useWindowManager must be used within WindowManagerProvider");
  return ctx;
}
