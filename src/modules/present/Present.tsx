import { useState } from "react";
import { useAppState, createPresentation, addSlide, updateSlide, deleteSlide, reorderSlide } from "@/lib/data";

export default function Present() {
  const state = useAppState();
  const [selectedId, setSelectedId] = useState<string | null>(state.presentations[0]?.id ?? null);
  const [newTitle, setNewTitle] = useState("");
  const [activeSlideId, setActiveSlideId] = useState<string | null>(null);
  const [presenting, setPresenting] = useState(false);

  const presentation = state.presentations.find((p) => p.id === selectedId);
  const activeSlide = presentation?.slides.find((s) => s.id === activeSlideId) ?? presentation?.slides[0];

  function handleCreate() {
    if (!newTitle.trim()) return;
    const p = createPresentation(newTitle.trim());
    setSelectedId(p.id);
    setActiveSlideId(p.slides[0]?.id ?? null);
    setNewTitle("");
  }

  if (!presentation) {
    return (
      <div className="max-w-2xl">
        <p className="text-xs text-ci-muted mb-3">Real slide decks — an outline editor and a presenter view, not a document with bullet points pretending to be slides.</p>
        <div className="flex gap-2 mb-4">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Presentation title"
            className="flex-1 rounded-md border border-ci-border bg-ci-panel2 px-3 py-1.5 text-sm"
          />
          <button onClick={handleCreate} className="rounded-md bg-ci-accent px-3 py-1.5 text-xs font-medium text-white">
            + New presentation
          </button>
        </div>
        <div className="space-y-2">
          {state.presentations.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setSelectedId(p.id);
                setActiveSlideId(p.slides[0]?.id ?? null);
              }}
              className="w-full text-left rounded-lg border border-ci-border bg-ci-panel p-3 hover:bg-ci-panel2"
            >
              <p className="text-sm font-medium">{p.title}</p>
              <p className="text-xs text-ci-muted">{p.slides.length} slide(s)</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (presenting && activeSlide) {
    return (
      <div className="absolute inset-0 bg-ci-text flex flex-col items-center justify-center text-center p-8" onClick={() => setPresenting(false)}>
        <h1 className="text-3xl font-bold text-white mb-4">{activeSlide.heading}</h1>
        <p className="text-lg text-white/80 max-w-xl whitespace-pre-wrap">{activeSlide.body}</p>
        <p className="absolute bottom-4 text-xs text-white/40">Click anywhere to exit</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setSelectedId(null)} className="text-xs text-ci-accent">
          ← All presentations
        </button>
        <button
          onClick={() => setPresenting(true)}
          disabled={!activeSlide}
          className="rounded-md bg-ci-accent px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
        >
          Present →
        </button>
      </div>
      <p className="text-sm font-medium mb-2">{presentation.title}</p>

      <div className="flex gap-1.5 overflow-x-auto mb-3 pb-1">
        {presentation.slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setActiveSlideId(s.id)}
            className={`shrink-0 w-24 h-16 rounded-md border p-1.5 text-left text-[10px] overflow-hidden ${
              activeSlide?.id === s.id ? "border-ci-accent bg-ci-panel2" : "border-ci-border bg-ci-panel"
            }`}
          >
            <span className="text-ci-muted">{i + 1}.</span> {s.heading}
          </button>
        ))}
        <button
          onClick={() => addSlide(presentation.id)}
          className="shrink-0 w-24 h-16 rounded-md border border-dashed border-ci-border text-xs text-ci-muted hover:bg-ci-panel2"
        >
          + Slide
        </button>
      </div>

      {activeSlide && (
        <div className="rounded-lg border border-ci-border bg-ci-panel p-4 space-y-2">
          <input
            value={activeSlide.heading}
            onChange={(e) => updateSlide(presentation.id, activeSlide.id, { heading: e.target.value })}
            className="w-full rounded-md border border-ci-border bg-ci-panel2 px-3 py-1.5 text-sm font-medium"
            placeholder="Slide heading"
          />
          <textarea
            value={activeSlide.body}
            onChange={(e) => updateSlide(presentation.id, activeSlide.id, { body: e.target.value })}
            placeholder="Slide body"
            rows={5}
            className="w-full rounded-md border border-ci-border bg-ci-panel2 px-3 py-1.5 text-sm resize-none"
          />
          <div className="flex gap-3">
            <button onClick={() => reorderSlide(presentation.id, activeSlide.id, -1)} className="text-[11px] text-ci-muted hover:underline">
              ↑ Move up
            </button>
            <button onClick={() => reorderSlide(presentation.id, activeSlide.id, 1)} className="text-[11px] text-ci-muted hover:underline">
              ↓ Move down
            </button>
            {presentation.slides.length > 1 && (
              <button
                onClick={() => {
                  deleteSlide(presentation.id, activeSlide.id);
                  setActiveSlideId(null);
                }}
                className="text-[11px] text-red-600 hover:underline"
              >
                Delete slide
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
