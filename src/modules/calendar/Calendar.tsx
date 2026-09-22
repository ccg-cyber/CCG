import { useState } from "react";
import { useAppState, scheduleMeeting, customerName } from "@/lib/data";

export default function Calendar() {
  const state = useAppState();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const sorted = [...state.meetings].sort((a, b) => (a.start < b.start ? -1 : 1));

  function handleSchedule() {
    if (!title.trim() || !date) return;
    scheduleMeeting(title.trim(), new Date(date).toISOString());
    setTitle("");
    setDate("");
  }

  return (
    <div className="max-w-2xl">
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Meeting title…"
          className="flex-1 min-w-[200px] rounded-lg border border-ci-border bg-ci-panel2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ci-accent/40"
        />
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-ci-border bg-ci-panel2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ci-accent/40"
        />
        <button onClick={handleSchedule} className="rounded-lg bg-ci-accent px-4 py-2 text-sm font-medium text-white">
          Schedule
        </button>
      </div>

      <ul className="space-y-2">
        {sorted.map((m) => (
          <li key={m.id} className="rounded-lg border border-ci-border bg-ci-panel px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{m.title}</p>
                <p className="text-xs text-ci-muted mt-0.5">
                  {new Date(m.start).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  {" – "}
                  {new Date(m.end).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                </p>
              </div>
              {m.customerId && (
                <span className="shrink-0 text-[11px] text-ci-muted border border-ci-border rounded-full px-2 py-0.5">
                  {customerName(state, m.customerId)}
                </span>
              )}
            </div>
            <p className="text-xs text-ci-muted mt-1.5">{m.attendees.join(", ")}</p>
          </li>
        ))}
        {sorted.length === 0 && <p className="text-sm text-ci-muted">No meetings scheduled.</p>}
      </ul>
    </div>
  );
}
