import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAppState, customerName, archiveFile, uploadFileToDrive, downloadDriveFile } from "@/lib/data";
import { formatBytes } from "@/lib/vfs";
import type { DriveFile } from "@/lib/types";

const ICON: Record<DriveFile["type"], string> = {
  folder: "📁",
  doc: "📄",
  pdf: "📕",
  sheet: "📊",
  file: "📎",
};

export default function Drive() {
  const state = useAppState();
  const files = [...state.files].filter((f) => !f.archived).sort((a, b) => (a.id < b.id ? 1 : -1));
  const [uploading, setUploading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      await uploadFileToDrive(file);
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload(f: DriveFile) {
    setDownloadError(null);
    const result = await downloadDriveFile(f);
    if (!result.ok) setDownloadError(result.error ?? "Download failed.");
  }

  return (
    <div>
      <div className="max-w-3xl flex items-center justify-between mb-3">
        <p className="text-xs text-ci-muted">
          Real uploads store their actual content in this browser's IndexedDB — not localStorage, which can't hold
          binary data at any real size.
        </p>
        <div>
          <input ref={inputRef} type="file" onChange={handleFilePicked} className="hidden" />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-md bg-ci-accent px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50 shrink-0"
          >
            {uploading ? "Uploading…" : "+ Upload file"}
          </button>
        </div>
      </div>
      {downloadError && <p className="max-w-3xl text-xs text-red-600 mb-2">{downloadError}</p>}

      <div className="max-w-3xl rounded-lg border border-ci-border bg-ci-panel overflow-hidden">
        <div className="grid grid-cols-[1fr_100px_140px_120px_60px] gap-2 px-4 py-2 text-[11px] uppercase tracking-wider text-ci-muted border-b border-ci-border">
          <span>Name</span>
          <span>Size</span>
          <span>Owner</span>
          <span>Modified</span>
          <span></span>
        </div>
        {files.map((f) => (
          <div
            key={f.id}
            className="grid grid-cols-[1fr_100px_140px_120px_60px] gap-2 px-4 py-2.5 text-sm hover:bg-ci-panel2 border-b border-ci-border last:border-b-0"
          >
            <span className="flex items-center gap-2 truncate">
              <span>{ICON[f.type]}</span>
              {f.hasBlob ? (
                <button onClick={() => handleDownload(f)} className="truncate text-left text-ci-accent hover:underline">
                  {f.name}
                </button>
              ) : (
                f.name
              )}
              {f.customerId && (
                <span className="text-[10px] text-ci-muted border border-ci-border rounded-full px-1.5 py-0.5">
                  {customerName(state, f.customerId)}
                </span>
              )}
            </span>
            <span className="text-ci-muted">{f.sizeBytes !== undefined ? formatBytes(f.sizeBytes) : "—"}</span>
            <span className={`truncate ${f.owner === "CI Agent" ? "text-ci-accent" : "text-ci-muted"}`}>{f.owner}</span>
            <span className="text-ci-muted">{f.modified}</span>
            {f.type !== "folder" && (
              <button onClick={() => archiveFile(f.id)} className="text-[11px] text-ci-muted hover:text-ci-text text-left">
                Archive
              </button>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-ci-muted mt-2">
        Archived files move to{" "}
        <Link to="/modules/archive" className="text-ci-accent">
          CI Archive
        </Link>{" "}
        — same files, different view.
      </p>
    </div>
  );
}
