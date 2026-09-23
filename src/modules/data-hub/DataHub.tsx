import { useState } from "react";
import { useAppState, importCustomersCsv, exportCustomersCsv } from "@/lib/data";

const SAMPLE = "Riley Chen,riley@newvendor.example,New Vendor Co\nJamie Park,jamie@newvendor.example,New Vendor Co";

export default function DataHub() {
  const state = useAppState();
  const [csv, setCsv] = useState("");
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);
  const [exported, setExported] = useState("");

  function handleImport() {
    if (!csv.trim()) return;
    const r = importCustomersCsv(csv);
    setResult(r);
    setCsv("");
  }

  return (
    <div className="max-w-2xl space-y-6">
      <section className="rounded-lg border border-ci-border bg-ci-panel p-4">
        <h3 className="text-sm font-medium mb-1">Import customers</h3>
        <p className="text-xs text-ci-muted mb-2">
          One per line: name,email,company. Writes straight into CI Contacts' own list — duplicate emails are
          skipped.
        </p>
        <textarea
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          placeholder={SAMPLE}
          className="w-full min-h-[80px] rounded-md border border-ci-border bg-ci-panel2 p-3 text-sm font-mono"
        />
        <div className="flex gap-2 mt-2">
          <button onClick={handleImport} className="rounded-lg bg-ci-accent px-4 py-2 text-sm font-medium text-white">
            Import
          </button>
          <button onClick={() => setCsv(SAMPLE)} className="rounded-lg border border-ci-border px-4 py-2 text-sm text-ci-muted">
            Use sample
          </button>
        </div>
        {result && (
          <p className="text-xs text-ci-muted mt-2">
            Imported {result.imported}, skipped {result.skipped} duplicate(s).
          </p>
        )}
      </section>

      <section className="rounded-lg border border-ci-border bg-ci-panel p-4">
        <h3 className="text-sm font-medium mb-1">Export customers</h3>
        <p className="text-xs text-ci-muted mb-2">Generates a CSV of CI Contacts' current, live list.</p>
        <button onClick={() => setExported(exportCustomersCsv(state))} className="rounded-lg border border-ci-border px-4 py-2 text-sm text-ci-muted mb-2">
          Generate CSV
        </button>
        {exported && (
          <textarea readOnly value={exported} className="w-full min-h-[100px] rounded-md border border-ci-border bg-ci-panel2 p-3 text-xs font-mono" />
        )}
      </section>
    </div>
  );
}
