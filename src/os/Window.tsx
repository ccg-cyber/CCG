import { useRef, type ReactNode } from "react";
import type { OSWindow } from "./WindowManagerContext";

interface Props {
  win: OSWindow;
  title: string;
  active: boolean;
  onClose: () => void;
  onFocus: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onMove: (x: number, y: number) => void;
  onResize: (width: number, height: number) => void;
  children: ReactNode;
}

export default function Window({ win, title, active, onClose, onFocus, onMinimize, onToggleMaximize, onMove, onResize, children }: Props) {
  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; originW: number; originH: number } | null>(null);

  if (win.minimized) return null;

  function onDragMove(e: MouseEvent) {
    const d = dragRef.current;
    if (!d) return;
    onMove(Math.max(0, d.originX + (e.clientX - d.startX)), Math.max(0, d.originY + (e.clientY - d.startY)));
  }
  function stopDrag() {
    dragRef.current = null;
    window.removeEventListener("mousemove", onDragMove);
    window.removeEventListener("mouseup", stopDrag);
  }
  function startDrag(e: React.MouseEvent) {
    onFocus();
    if (win.maximized) return;
    dragRef.current = { startX: e.clientX, startY: e.clientY, originX: win.x, originY: win.y };
    window.addEventListener("mousemove", onDragMove);
    window.addEventListener("mouseup", stopDrag);
  }

  function onResizeMove(e: MouseEvent) {
    const r = resizeRef.current;
    if (!r) return;
    onResize(Math.max(360, r.originW + (e.clientX - r.startX)), Math.max(240, r.originH + (e.clientY - r.startY)));
  }
  function stopResize() {
    resizeRef.current = null;
    window.removeEventListener("mousemove", onResizeMove);
    window.removeEventListener("mouseup", stopResize);
  }
  function startResize(e: React.MouseEvent) {
    e.stopPropagation();
    onFocus();
    resizeRef.current = { startX: e.clientX, startY: e.clientY, originW: win.width, originH: win.height };
    window.addEventListener("mousemove", onResizeMove);
    window.addEventListener("mouseup", stopResize);
  }

  return (
    <div
      onMouseDown={onFocus}
      data-testid={`window-${win.moduleId}`}
      className={`absolute flex flex-col rounded-lg overflow-hidden border shadow-2xl ${active ? "border-ci-accent/50" : "border-ci-border"}`}
      style={{ left: win.x, top: win.y, width: win.width, height: win.height, zIndex: 10 + win.zIndex }}
    >
      <div
        onMouseDown={startDrag}
        onDoubleClick={onToggleMaximize}
        data-testid="window-titlebar"
        className={`flex items-center justify-between px-3 py-2 select-none border-b border-ci-border ${
          win.maximized ? "cursor-default" : "cursor-move"
        } ${active ? "bg-ci-panel2" : "bg-ci-panel"}`}
      >
        <span className="text-xs font-medium truncate">{title}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={onMinimize}
            aria-label="Minimize"
            className="h-5 w-5 flex items-center justify-center rounded hover:bg-black/8 text-ci-muted text-xs leading-none"
          >
            ─
          </button>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={onToggleMaximize}
            aria-label={win.maximized ? "Restore" : "Maximize"}
            className="h-5 w-5 flex items-center justify-center rounded hover:bg-black/8 text-ci-muted text-xs leading-none"
          >
            {win.maximized ? "❐" : "□"}
          </button>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={onClose}
            aria-label="Close"
            className="h-5 w-5 flex items-center justify-center rounded hover:bg-red-500/80 hover:text-white text-ci-muted text-xs leading-none"
          >
            ×
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-ci-bg">{children}</div>
      {!win.maximized && (
        <div onMouseDown={startResize} className="absolute bottom-0 right-0 h-4 w-4 cursor-nwse-resize" aria-hidden />
      )}
    </div>
  );
}
