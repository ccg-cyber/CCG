import { useState } from "react";

interface Task {
  id: number;
  title: string;
  done: boolean;
  priority: "low" | "medium" | "high";
}

const SEED: Task[] = [
  { id: 1, title: "Approve PO-2201 for Northwind Supplies", done: false, priority: "high" },
  { id: 2, title: "Review Q3 rollout timeline", done: false, priority: "medium" },
  { id: 3, title: "Send follow-up to Nord Retail Group", done: true, priority: "low" },
];

export default function TasksDemo() {
  const [tasks, setTasks] = useState<Task[]>(SEED);
  const [input, setInput] = useState("");

  function addTask() {
    if (!input.trim()) return;
    setTasks((t) => [{ id: Date.now(), title: input.trim(), done: false, priority: "medium" }, ...t]);
    setInput("");
  }

  function toggle(id: number) {
    setTasks((t) => t.map((task) => (task.id === id ? { ...task, done: !task.done } : task)));
  }

  const priorityColor: Record<Task["priority"], string> = {
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
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Add a task…"
          className="flex-1 rounded-lg border border-ci-border bg-ci-panel2 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ci-accent/40"
        />
        <button onClick={addTask} className="rounded-lg bg-ci-accent px-4 py-2 text-sm font-medium text-white">
          Add
        </button>
      </div>
      <ul className="space-y-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-center gap-3 rounded-lg border border-ci-border bg-ci-panel px-3 py-2.5"
          >
            <input type="checkbox" checked={task.done} onChange={() => toggle(task.id)} className="h-4 w-4 accent-ci-accent" />
            <span className={`flex-1 text-sm ${task.done ? "line-through text-ci-muted" : ""}`}>{task.title}</span>
            <span className={`rounded-full border px-2 py-0.5 text-[11px] ${priorityColor[task.priority]}`}>
              {task.priority}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
