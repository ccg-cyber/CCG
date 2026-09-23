import localforage from "localforage";

/**
 * The real Virtual File System: actual binary content, in IndexedDB, kept
 * entirely separate from src/lib/store.ts's business data.
 *
 * CI Drive's DriveFile records (in the main store) are lightweight
 * metadata — name, type, owner, modified — and stay in localStorage
 * because they're small and need to sync instantly with every module
 * that reads them. A file's actual bytes are a different problem
 * entirely: localStorage has a ~5–10MB total quota and can only hold
 * strings, so storing a real upload there would mean base64-encoding it
 * (≈33% larger) into a single JSON blob shared with everything else Ci
 * persists — one large file would either blow the quota outright or
 * make every unrelated save slower. IndexedDB has no such ceiling (quota
 * scales with available disk, typically far more than a browser ever
 * grants localStorage) and stores Blob/File objects natively — the
 * browser's structured-clone algorithm writes them directly without
 * ever holding the whole thing as a JS string, which is what makes a
 * large upload (a multi-GB `.mdb` export, for instance) survivable here
 * instead of a guaranteed crash.
 *
 * A DriveFile record with `hasBlob: true` has its actual content stored
 * here, keyed by that same file's id — the metadata and the bytes are
 * two halves of one record, kept in the store that's actually suited to
 * each half.
 */
const vfsStore = localforage.createInstance({
  name: "ci-os",
  storeName: "vfs_blobs",
  driver: localforage.INDEXEDDB,
  description: "Ci Drive's actual file content — binary blobs, kept separate from business data.",
});

export async function saveFileBlob(fileId: string, blob: Blob): Promise<void> {
  await vfsStore.setItem(fileId, blob);
}

export async function getFileBlob(fileId: string): Promise<Blob | null> {
  const blob = await vfsStore.getItem<Blob>(fileId);
  return blob ?? null;
}

export async function deleteFileBlob(fileId: string): Promise<void> {
  await vfsStore.removeItem(fileId);
}

export async function clearAllBlobs(): Promise<void> {
  await vfsStore.clear();
}

export async function countStoredBlobs(): Promise<number> {
  return vfsStore.length();
}

export interface StorageEstimate {
  usageBytes: number;
  quotaBytes: number;
}

/** Best-effort — the Storage API isn't universal, so callers must handle `null`. */
export async function estimateVfsUsage(): Promise<StorageEstimate | null> {
  if (typeof navigator !== "undefined" && navigator.storage?.estimate) {
    const { usage, quota } = await navigator.storage.estimate();
    return { usageBytes: usage ?? 0, quotaBytes: quota ?? 0 };
  }
  return null;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

/** Triggers a real browser download of a stored blob under its original filename. */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
