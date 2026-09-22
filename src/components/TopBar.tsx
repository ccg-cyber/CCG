import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchModules } from "@/lib/registry";
import { CURRENT_USER } from "@/lib/permissions";

export default function TopBar() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const results = query.trim() ? searchModules(query).slice(0, 8) : [];

  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-ci-border bg-ci-bg/90 backdrop-blur px-4 py-3">
      <div className="relative flex-1 max-w-xl">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search everything — mail, files, customers, invoices, modules…"
          className="w-full rounded-lg border border-ci-border bg-ci-panel px-4 py-2 text-sm text-ci-text placeholder:text-ci-muted focus:outline-none focus:ring-2 focus:ring-ci-accent/40"
        />
        {open && results.length > 0 && (
          <div className="absolute mt-1 w-full rounded-lg border border-ci-border bg-ci-panel2 shadow-xl overflow-hidden">
            {results.map((m) => (
              <button
                key={m.id}
                onMouseDown={() => navigate(`/modules/${m.slug}`)}
                className="flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-ci-border/40"
              >
                <span>{m.name}</span>
                <span className="text-xs text-ci-muted truncate max-w-[16rem]">{m.description}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-3 text-sm">
        <span className="text-ci-muted hidden sm:inline">{CURRENT_USER.name}</span>
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-ci-accent to-ci-accent2 flex items-center justify-center text-xs font-semibold">
          {CURRENT_USER.name.slice(0, 1)}
        </div>
      </div>
    </header>
  );
}
