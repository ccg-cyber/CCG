import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppState, searchAllRecords } from "@/lib/data";

export default function Search() {
  const state = useAppState();
  const [query, setQuery] = useState("");
  const results = searchAllRecords(state, query);

  const grouped = results.reduce<Record<string, typeof results>>((acc, r) => {
    (acc[r.source] ??= []).push(r);
    return acc;
  }, {});

  return (
    <div className="max-w-2xl">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search customers, invoices, mail, files, tickets, employees, chat…"
        className="w-full rounded-lg border border-ci-border bg-ci-panel px-4 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-ci-accent/40"
      />

      {!query.trim() && (
        <p className="text-sm text-ci-muted">
          Searches real records across every live module's data — not just module names, which the top bar already
          covers.
        </p>
      )}

      {query.trim() && results.length === 0 && <p className="text-sm text-ci-muted">No matches.</p>}

      {Object.entries(grouped).map(([source, items]) => (
        <div key={source} className="mb-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ci-muted mb-1.5">{source}</h3>
          <div className="space-y-1.5">
            {items.map((r, i) => (
              <Link
                key={i}
                to={r.href}
                className="flex items-center justify-between gap-3 rounded-lg border border-ci-border bg-ci-panel px-4 py-2.5 text-sm hover:bg-ci-panel2"
              >
                <span>{r.title}</span>
                <span className="text-xs text-ci-muted truncate max-w-[16rem]">{r.detail}</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
