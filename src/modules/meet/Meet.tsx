import { useState } from "react";
import { useAppState, endMeeting } from "@/lib/data";

export default function Meet() {
  const state = useAppState();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const upcoming = [...state.meetings].sort((a, b) => (a.start < b.start ? -1 : 1));

  function finish(id: string) {
    endMeeting(id, notes);
    setNotes("");
    setActiveId(null);
  }

  return (
    <div className="max-w-2xl space-y-2">
      <p className="text-xs text-ci-muted mb-1">Reads CI Calendar's meetings. Ending one with action items creates real CI Tasks.</p>
      {upcoming.map((m) => (
        <div key={m.id} className="rounded-lg border border-ci-border bg-ci-panel px-4 py-3">
          <div className="flex items-start justify-between gap-3 mb-1">
            <div>
              <p className="text-sm font-medium">{m.title}</p>
              <p className="text-xs text-ci-muted">{new Date(m.start).toLocaleString()}</p>
            </div>
            {m.completed && (
              <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-400">
                ended
              </span>
            )}
          </div>

          {!m.completed &&
            (activeId === m.id ? (
              <div className="mt-2">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={"Action items, one per line…"}
                  className="w-full min-h-[80px] rounded-md border border-ci-border bg-ci-panel2 p-2 text-sm"
                />
                <button onClick={() => finish(m.id)} className="mt-1 text-[11px] text-ci-accent hover:underline">
                  End meeting & create tasks →
                </button>
              </div>
            ) : (
              <button onClick={() => setActiveId(m.id)} className="text-[11px] text-ci-accent hover:underline">
                Start meeting →
              </button>
            ))}
        </div>
      ))}
    </div>
  );
}
