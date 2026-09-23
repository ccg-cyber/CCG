import { useRef, useState } from "react";
import { useAppState, createDesignProject, addDesignElement, updateDesignElement, deleteDesignElement } from "@/lib/data";
import type { DesignElementType } from "@/lib/types";

/**
 * A real canvas, not a screenshot of one: elements are draggable, editable,
 * and persisted through the same mutation-function seam every other module
 * uses. Scoped to what a window this small can actually do well — banners,
 * social posts, simple brochures — rather than pretending to be Photoshop.
 */
export default function Design() {
  const state = useAppState();
  const [selectedId, setSelectedId] = useState<string | null>(state.designProjects[0]?.id ?? null);
  const [newName, setNewName] = useState("");
  const [activeElId, setActiveElId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);

  const project = state.designProjects.find((p) => p.id === selectedId);
  const activeEl = project?.elements.find((el) => el.id === activeElId);

  function handleCreate() {
    if (!newName.trim()) return;
    const p = createDesignProject(newName.trim());
    setSelectedId(p.id);
    setNewName("");
  }

  function onElementMouseDown(e: React.MouseEvent, elId: string, elX: number, elY: number) {
    e.stopPropagation();
    const canvasBox = canvasRef.current?.getBoundingClientRect();
    if (!canvasBox) return;
    dragState.current = { id: elId, offsetX: e.clientX - canvasBox.left - elX, offsetY: e.clientY - canvasBox.top - elY };
    setActiveElId(elId);

    function onMove(ev: MouseEvent) {
      const box = canvasRef.current?.getBoundingClientRect();
      if (!box || !dragState.current || !project) return;
      const x = Math.round(ev.clientX - box.left - dragState.current.offsetX);
      const y = Math.round(ev.clientY - box.top - dragState.current.offsetY);
      updateDesignElement(project.id, dragState.current.id, { x: Math.max(0, x), y: Math.max(0, y) });
    }
    function onUp() {
      dragState.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  if (!project) {
    return (
      <div className="max-w-2xl">
        <p className="text-xs text-ci-muted mb-3">Banners, social posts, and simple brochures on a real draggable canvas — not a mockup of one.</p>
        <div className="flex gap-2 mb-4">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Design name"
            className="flex-1 rounded-md border border-ci-border bg-ci-panel2 px-3 py-1.5 text-sm"
          />
          <button onClick={handleCreate} className="rounded-md bg-ci-accent px-3 py-1.5 text-xs font-medium text-white">
            + New design
          </button>
        </div>
        <div className="space-y-2">
          {state.designProjects.map((p) => (
            <button key={p.id} onClick={() => setSelectedId(p.id)} className="w-full text-left rounded-lg border border-ci-border bg-ci-panel p-3 hover:bg-ci-panel2">
              <p className="text-sm font-medium">{p.name}</p>
              <p className="text-xs text-ci-muted">{p.elements.length} element(s)</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const TOOLS: { type: DesignElementType; label: string }[] = [
    { type: "rect", label: "+ Rectangle" },
    { type: "circle", label: "+ Circle" },
    { type: "text", label: "+ Text" },
  ];

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setSelectedId(null)} className="text-xs text-ci-accent">
          ← All designs
        </button>
        <p className="text-sm font-medium">{project.name}</p>
      </div>

      <div className="flex gap-2 mb-3">
        {TOOLS.map((t) => (
          <button
            key={t.type}
            onClick={() => addDesignElement(project.id, t.type)}
            className="rounded-md border border-ci-border bg-ci-panel px-3 py-1.5 text-xs hover:bg-ci-panel2"
          >
            {t.label}
          </button>
        ))}
      </div>

      <div
        ref={canvasRef}
        onMouseDown={() => setActiveElId(null)}
        data-testid="design-canvas"
        className="relative overflow-hidden rounded-lg border border-ci-border mb-3"
        style={{ width: project.canvasWidth, height: project.canvasHeight, background: "#fff" }}
      >
        {project.elements.map((el) => (
          <div
            key={el.id}
            data-testid={`design-el-${el.id}`}
            onMouseDown={(e) => onElementMouseDown(e, el.id, el.x, el.y)}
            className={`absolute cursor-move flex items-center justify-center select-none ${
              activeElId === el.id ? "ring-2 ring-ci-accent" : ""
            } ${el.type === "circle" ? "rounded-full" : ""}`}
            style={{
              left: el.x,
              top: el.y,
              width: el.w,
              height: el.h,
              background: el.type === "text" ? "transparent" : el.color,
              color: el.type === "text" ? el.color : undefined,
              fontSize: el.fontSize,
              fontWeight: el.type === "text" ? 600 : undefined,
            }}
          >
            {el.type === "text" && el.text}
          </div>
        ))}
      </div>

      {activeEl && (
        <div className="rounded-lg border border-ci-border bg-ci-panel p-3 flex flex-wrap items-center gap-2">
          {activeEl.type === "text" && (
            <input
              value={activeEl.text ?? ""}
              onChange={(e) => updateDesignElement(project.id, activeEl.id, { text: e.target.value })}
              className="flex-1 min-w-[100px] rounded-md border border-ci-border bg-ci-panel2 px-2 py-1 text-xs"
            />
          )}
          <input
            type="color"
            value={activeEl.color}
            onChange={(e) => updateDesignElement(project.id, activeEl.id, { color: e.target.value })}
            className="h-7 w-10 rounded border border-ci-border bg-ci-panel2"
          />
          <button
            onClick={() => {
              deleteDesignElement(project.id, activeEl.id);
              setActiveElId(null);
            }}
            className="text-[11px] text-red-600 hover:underline"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
