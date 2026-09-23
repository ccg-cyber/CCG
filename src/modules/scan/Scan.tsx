import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppState, scanReceipt } from "@/lib/data";

const SAMPLE = "Northwind Office Supplies\nPaper, pens, folders\nTotal: $84.50";

export default function Scan() {
  const state = useAppState();
  const [text, setText] = useState("");

  function handleScan() {
    if (!text.trim()) return;
    scanReceipt(text);
    setText("");
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="rounded-lg border border-ci-border bg-ci-panel p-4">
        <p className="text-xs text-ci-muted mb-2">
          No camera needed for this environment — paste what a scan's OCR step would produce. First line becomes the
          vendor; the dollar amount is extracted automatically. Filed straight into{" "}
          <Link to="/modules/drive" className="text-ci-accent">
            CI Drive
          </Link>
          .
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={SAMPLE}
          className="w-full min-h-[90px] rounded-md border border-ci-border bg-ci-panel2 p-3 text-sm font-mono"
        />
        <div className="flex gap-2 mt-2">
          <button onClick={handleScan} className="rounded-lg bg-ci-accent px-4 py-2 text-sm font-medium text-white">
            Scan
          </button>
          <button onClick={() => setText(SAMPLE)} className="rounded-lg border border-ci-border px-4 py-2 text-sm text-ci-muted">
            Use sample
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        {state.expenses.map((e) => (
          <div key={e.id} className="flex items-center justify-between gap-3 rounded-lg border border-ci-border bg-ci-panel px-4 py-2.5 text-sm">
            <span>{e.vendor}</span>
            <span className="text-ci-muted">
              ${e.amount.toLocaleString()} · {new Date(e.scannedAt).toLocaleTimeString()}
            </span>
          </div>
        ))}
        {state.expenses.length === 0 && <p className="text-sm text-ci-muted">No receipts scanned yet.</p>}
      </div>
    </div>
  );
}
