import { useState } from "react";
import { useAppState, markEmailRead, customerName } from "@/lib/data";

export default function MailDemo() {
  const state = useAppState();
  const sorted = [...state.emails].sort((a, b) => (a.time < b.time ? 1 : -1));
  const [selectedId, setSelectedId] = useState<string>(sorted[0]?.id ?? "");
  const selected = sorted.find((e) => e.id === selectedId) ?? sorted[0];

  function select(id: string) {
    setSelectedId(id);
    markEmailRead(id);
  }

  if (!selected) return <p className="text-sm text-ci-muted">No messages.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4 max-w-4xl">
      <ul className="space-y-1">
        {sorted.map((email) => (
          <li key={email.id}>
            <button
              onClick={() => select(email.id)}
              className={`w-full text-left rounded-lg border px-3 py-2.5 ${
                selected.id === email.id ? "border-ci-accent/50 bg-ci-accent/10" : "border-ci-border bg-ci-panel hover:bg-ci-panel2"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`text-sm truncate ${email.unread ? "font-semibold" : ""}`}>{email.from}</span>
                <span className="text-[11px] text-ci-muted shrink-0">{new Date(email.time).toLocaleDateString()}</span>
              </div>
              <p className={`text-xs truncate ${email.unread ? "text-ci-text" : "text-ci-muted"}`}>{email.subject}</p>
            </button>
          </li>
        ))}
      </ul>

      <div className="rounded-lg border border-ci-border bg-ci-panel p-4">
        <h3 className="font-medium mb-1">{selected.subject}</h3>
        <p className="text-xs text-ci-muted mb-4">
          {selected.from} · {new Date(selected.time).toLocaleString()}
          {selected.customerId && ` · ${customerName(state, selected.customerId)}`}
        </p>
        <p className="text-sm leading-relaxed whitespace-pre-line">{selected.body}</p>
      </div>
    </div>
  );
}
