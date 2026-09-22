import { useState } from "react";
import { useAppState, addCustomer } from "@/lib/data";

export default function ContactsDemo() {
  const state = useAppState();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");

  function handleAdd() {
    if (!name.trim() || !email.trim()) return;
    addCustomer(name.trim(), email.trim(), company.trim() || name.trim());
    setName("");
    setEmail("");
    setCompany("");
    setOpen(false);
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-4">
        {!open ? (
          <button onClick={() => setOpen(true)} className="rounded-lg bg-ci-accent px-4 py-2 text-sm font-medium text-white">
            + Add contact
          </button>
        ) : (
          <div className="flex flex-wrap gap-2 rounded-lg border border-ci-border bg-ci-panel p-3">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="rounded-md border border-ci-border bg-ci-panel2 px-3 py-1.5 text-sm" />
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="rounded-md border border-ci-border bg-ci-panel2 px-3 py-1.5 text-sm" />
            <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" className="rounded-md border border-ci-border bg-ci-panel2 px-3 py-1.5 text-sm" />
            <button onClick={handleAdd} className="rounded-md bg-ci-accent px-3 py-1.5 text-xs font-medium text-white">Save</button>
            <button onClick={() => setOpen(false)} className="rounded-md border border-ci-border px-3 py-1.5 text-xs text-ci-muted">Cancel</button>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-ci-border bg-ci-panel overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_1fr_120px] gap-2 px-4 py-2 text-[11px] uppercase tracking-wider text-ci-muted border-b border-ci-border">
          <span>Name</span>
          <span>Email</span>
          <span>Company</span>
          <span>Tags</span>
        </div>
        {state.customers.map((c) => (
          <div key={c.id} className="grid grid-cols-[1fr_1fr_1fr_120px] gap-2 px-4 py-2.5 text-sm border-b border-ci-border last:border-b-0">
            <span className="truncate">{c.name}</span>
            <span className="truncate text-ci-muted">{c.email}</span>
            <span className="truncate text-ci-muted">{c.company}</span>
            <span className="flex flex-wrap gap-1">
              {c.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-ci-border px-1.5 py-0.5 text-[10px] text-ci-muted">
                  {tag}
                </span>
              ))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
