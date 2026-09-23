import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppState, convertToPdf, mergePdfFiles } from "@/lib/data";

/**
 * Works directly on CI Drive's own files — DriveFile.type already
 * distinguishes "pdf" from "doc"/"sheet", so there's no separate document
 * type to keep in sync. Converting or merging files a real new record in
 * CI Drive, same as CI Sign and CI Scan.
 */
export default function PDF() {
  const state = useAppState();
  const files = state.files.filter((f) => !f.archived && f.type !== "folder");
  const pdfs = files.filter((f) => f.type === "pdf");
  const others = files.filter((f) => f.type !== "pdf");

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [mergedName, setMergedName] = useState("Merged document.pdf");

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleMerge() {
    if (selected.size < 2) return;
    mergePdfFiles([...selected], mergedName.trim() || "Merged document.pdf");
    setSelected(new Set());
  }

  return (
    <div className="max-w-2xl space-y-4">
      <p className="text-xs text-ci-muted">
        Convert any CI Drive file to PDF, or select two or more to merge into one — both file a real new document in{" "}
        <Link to="/modules/drive" className="text-ci-accent">
          CI Drive
        </Link>
        , the same as everything else here.
      </p>

      <div>
        <p className="text-sm font-medium mb-2">Convert to PDF</p>
        <div className="space-y-1.5">
          {others.map((f) => (
            <div key={f.id} className="flex items-center justify-between gap-2 rounded-lg border border-ci-border bg-ci-panel px-3 py-2">
              <span className="text-sm truncate">{f.name}</span>
              <button onClick={() => convertToPdf(f.id)} className="text-[11px] text-ci-accent hover:underline shrink-0">
                Convert →
              </button>
            </div>
          ))}
          {others.length === 0 && <p className="text-xs text-ci-muted">Everything in Drive is already a PDF.</p>}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Merge into one PDF</p>
        <div className="space-y-1.5 mb-2">
          {files.map((f) => (
            <label key={f.id} className="flex items-center gap-2 rounded-lg border border-ci-border bg-ci-panel px-3 py-2 cursor-pointer">
              <input type="checkbox" checked={selected.has(f.id)} onChange={() => toggle(f.id)} />
              <span className="text-sm truncate">{f.name}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={mergedName}
            onChange={(e) => setMergedName(e.target.value)}
            className="flex-1 rounded-md border border-ci-border bg-ci-panel2 px-3 py-1.5 text-sm"
          />
          <button
            onClick={handleMerge}
            disabled={selected.size < 2}
            className="rounded-md bg-ci-accent px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
          >
            Merge {selected.size >= 2 ? `${selected.size} files` : ""} →
          </button>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium mb-2">PDFs in CI Drive</p>
        <div className="space-y-1.5">
          {pdfs.map((f) => (
            <div key={f.id} className="rounded-lg border border-ci-border bg-ci-panel px-3 py-2 text-sm">
              {f.name}
            </div>
          ))}
          {pdfs.length === 0 && <p className="text-xs text-ci-muted">None yet — convert or merge a file above.</p>}
        </div>
      </div>
    </div>
  );
}
