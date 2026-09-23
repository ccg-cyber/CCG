import { useState } from "react";
import { useAppState, postMessage } from "@/lib/data";

export default function Chat() {
  const state = useAppState();
  const [channelId, setChannelId] = useState(state.channels[0]?.id ?? "");
  const [input, setInput] = useState("");
  const messages = state.chatMessages.filter((m) => m.channelId === channelId);

  function send() {
    if (!input.trim()) return;
    postMessage(channelId, input);
    setInput("");
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4 max-w-3xl">
      <ul className="space-y-1">
        {state.channels.map((c) => (
          <li key={c.id}>
            <button
              onClick={() => setChannelId(c.id)}
              className={`w-full text-left rounded-lg border px-3 py-2 text-sm ${
                channelId === c.id ? "border-ci-accent/50 bg-ci-accent/10" : "border-ci-border bg-ci-panel hover:bg-ci-panel2"
              }`}
            >
              # {c.name}
            </button>
          </li>
        ))}
      </ul>

      <div className="flex flex-col rounded-lg border border-ci-border bg-ci-panel">
        <div className="flex-1 space-y-3 p-4 min-h-[280px]">
          {messages.map((m) => (
            <div key={m.id}>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium">{m.from}</span>
                <span className="text-[11px] text-ci-muted">{new Date(m.time).toLocaleTimeString()}</span>
              </div>
              <p className="text-sm text-ci-text/90">{m.text}</p>
            </div>
          ))}
          {messages.length === 0 && <p className="text-sm text-ci-muted">No messages yet.</p>}
        </div>
        <div className="flex gap-2 border-t border-ci-border p-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={`Message #${state.channels.find((c) => c.id === channelId)?.name ?? ""}`}
            className="flex-1 rounded-lg border border-ci-border bg-ci-panel2 px-3 py-2 text-sm"
          />
          <button onClick={send} className="rounded-lg bg-ci-accent px-4 py-2 text-sm font-medium text-white">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
