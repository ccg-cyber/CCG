import { useState } from "react";
import { useAppState, saveArticle } from "@/lib/data";

/**
 * The first module that isn't transactional — every other live module
 * stores records that move through states (an invoice becomes paid, a
 * deal becomes won). An Article just... is, until someone edits it. That
 * makes this the simplest slice: no status ladder, no cross-module
 * trigger, just durable content with an edit-in-place surface — the
 * pattern CI Docs already uses.
 */
export default function Knowledge() {
  const state = useAppState();
  const [selectedId, setSelectedId] = useState(state.articles[0]?.id ?? "");
  const selected = state.articles.find((a) => a.id === selectedId) ?? state.articles[0];
  const [draft, setDraft] = useState(selected?.body ?? "");
  const [editing, setEditing] = useState(false);

  function select(id: string) {
    setSelectedId(id);
    setDraft(state.articles.find((a) => a.id === id)?.body ?? "");
    setEditing(false);
  }

  function save() {
    if (!selected) return;
    saveArticle(selected.id, selected.title, draft);
    setEditing(false);
  }

  if (!selected) return <p className="text-sm text-ci-muted">No articles yet.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4 max-w-4xl">
      <ul className="space-y-1">
        {state.articles.map((a) => (
          <li key={a.id}>
            <button
              onClick={() => select(a.id)}
              className={`w-full text-left rounded-lg border px-3 py-2 text-sm ${
                selected.id === a.id ? "border-ci-accent/50 bg-ci-accent/10" : "border-ci-border bg-ci-panel hover:bg-ci-panel2"
              }`}
            >
              {a.title}
            </button>
          </li>
        ))}
      </ul>

      <div className="rounded-lg border border-ci-border bg-ci-panel p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-sm">{selected.title}</h3>
          <span className="text-[11px] text-ci-muted">Updated {selected.updatedAt}</span>
        </div>
        <div className="flex flex-wrap gap-1 mb-3">
          {selected.tags.map((t) => (
            <span key={t} className="rounded-full border border-ci-border px-2 py-0.5 text-[10px] text-ci-muted">
              {t}
            </span>
          ))}
        </div>
        {editing ? (
          <>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full min-h-[160px] rounded-md border border-ci-border bg-ci-panel2 p-3 text-sm whitespace-pre-line focus:outline-none focus:ring-2 focus:ring-ci-accent/40"
            />
            <button onClick={save} className="mt-2 text-[11px] text-ci-accent hover:underline">
              Save →
            </button>
          </>
        ) : (
          <>
            <p className="text-sm whitespace-pre-line leading-relaxed">{selected.body}</p>
            <button onClick={() => setEditing(true)} className="mt-3 text-[11px] text-ci-accent hover:underline">
              Edit →
            </button>
          </>
        )}
      </div>
    </div>
  );
}
