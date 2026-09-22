import { useState } from "react";
import { useAppState, addEmployee } from "@/lib/data";
import type { Employee } from "@/lib/types";

const STATUS_STYLE: Record<Employee["status"], string> = {
  active: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
  onboarding: "border-amber-500/30 text-amber-400 bg-amber-500/10",
  offboarded: "border-ci-border text-ci-muted bg-ci-border/30",
};

export default function HRDemo() {
  const state = useAppState();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("");
  const [salary, setSalary] = useState("");

  function handleAdd() {
    if (!name.trim() || !role.trim() || !department.trim() || !salary) return;
    addEmployee(name.trim(), role.trim(), department.trim(), Number(salary));
    setName("");
    setRole("");
    setDepartment("");
    setSalary("");
    setOpen(false);
  }

  const byDept = state.employees.reduce<Record<string, Employee[]>>((acc, e) => {
    (acc[e.department] ??= []).push(e);
    return acc;
  }, {});

  return (
    <div className="max-w-2xl">
      <div className="mb-4">
        {!open ? (
          <button onClick={() => setOpen(true)} className="rounded-lg bg-ci-accent px-4 py-2 text-sm font-medium text-white">
            + Add employee
          </button>
        ) : (
          <div className="flex flex-wrap gap-2 rounded-lg border border-ci-border bg-ci-panel p-3">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="rounded-md border border-ci-border bg-ci-panel2 px-3 py-1.5 text-sm" />
            <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role" className="rounded-md border border-ci-border bg-ci-panel2 px-3 py-1.5 text-sm" />
            <input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Department" className="rounded-md border border-ci-border bg-ci-panel2 px-3 py-1.5 text-sm" />
            <input type="number" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="Annual salary" className="w-32 rounded-md border border-ci-border bg-ci-panel2 px-3 py-1.5 text-sm" />
            <button onClick={handleAdd} className="rounded-md bg-ci-accent px-3 py-1.5 text-xs font-medium text-white">Save</button>
            <button onClick={() => setOpen(false)} className="rounded-md border border-ci-border px-3 py-1.5 text-xs text-ci-muted">Cancel</button>
          </div>
        )}
      </div>

      {Object.entries(byDept).map(([dept, employees]) => (
        <div key={dept} className="mb-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ci-muted mb-2">{dept}</h3>
          <div className="space-y-2">
            {employees.map((e) => (
              <div key={e.id} className="flex items-center justify-between gap-3 rounded-lg border border-ci-border bg-ci-panel px-4 py-2.5">
                <div>
                  <p className="text-sm font-medium">{e.name}</p>
                  <p className="text-xs text-ci-muted">
                    {e.role} · since {e.startDate}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] ${STATUS_STYLE[e.status]}`}>{e.status}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
