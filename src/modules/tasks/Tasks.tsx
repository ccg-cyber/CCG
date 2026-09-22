import { useState } from "react";
import { useAppState, toggleTask, addTask, customerName } from "@/lib/data";
import type { TaskItem } from "@/lib/types";

export default function Tasks() {
  const state = useAppState();
  const [input, setInput] = useState("");

  function handleAdd() {
    if (!input.trim()) return;
    addTask(input.trim());
    setInput("");
  }

  const priorityColor: Record<TaskItem["priority"], string> = {
    high: "text-red-400 border-red-500/30 bg-red-500/10",
    medium: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    low: "text-ci-muted border-ci-border bg-ci-border/30",
  };

  return (
    <div className="max-w-2xl">
      <div className="flex gap-2 mb-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Add a task…"
          className="flex-1 rounded-lg border border-ci-border bg-ci-panel2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ci-accent/40"
        />
        <button onClick={handleAdd} className="rounded-lg bg-ci-accent px-4 py-2 text-sm font-medium text-white">
          Add
        </button>
      </div>
      <ul className="space-y-2">
        {state.tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-center gap-3 rounded-lg border border-ci-border bg-ci-panel px-3 py-2.5"
          >
            <input
              type="checkbox"
              checked={task.done}
              onChange={() => toggleTask(task.id)}
              className="h-4 w-4 accent-ci-accent"
            />
            <span className={`flex-1 text-sm ${task.done ? "line-through text-ci-muted" : ""}`}>{task.title}</span>
            {task.customerId && (
              <span className="text-[11px] text-ci-muted">{customerName(state, task.customerId)}</span>
            )}
            <span className={`rounded-full border px-2 py-0.5 text-[11px] ${priorityColor[task.priority]}`}>
              {task.priority}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
