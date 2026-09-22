interface FileRow {
  id: number;
  name: string;
  type: "folder" | "doc" | "pdf" | "sheet";
  modified: string;
  owner: string;
}

const FILES: FileRow[] = [
  { id: 1, name: "Acme Ltd.", type: "folder", modified: "2 days ago", owner: "You" },
  { id: 2, name: "Northwind Supplies", type: "folder", modified: "1 week ago", owner: "You" },
  { id: 3, name: "Q3 Rollout Plan.docx", type: "doc", modified: "Today", owner: "You" },
  { id: 4, name: "Statement — Acme Ltd.pdf", type: "pdf", modified: "3 hours ago", owner: "CI Agent" },
  { id: 5, name: "Sales Forecast.sheet", type: "sheet", modified: "Yesterday", owner: "You" },
];

const ICON: Record<FileRow["type"], string> = {
  folder: "📁",
  doc: "📄",
  pdf: "📕",
  sheet: "📊",
};

export default function DriveDemo() {
  return (
    <div className="max-w-3xl rounded-lg border border-ci-border bg-ci-panel overflow-hidden">
      <div className="grid grid-cols-[1fr_120px_120px] gap-2 px-4 py-2 text-[11px] uppercase tracking-wider text-ci-muted border-b border-ci-border">
        <span>Name</span>
        <span>Owner</span>
        <span>Modified</span>
      </div>
      {FILES.map((f) => (
        <div key={f.id} className="grid grid-cols-[1fr_120px_120px] gap-2 px-4 py-2.5 text-sm hover:bg-ci-panel2 border-b border-ci-border last:border-b-0">
          <span className="flex items-center gap-2 truncate">
            <span>{ICON[f.type]}</span>
            {f.name}
          </span>
          <span className="text-ci-muted truncate">{f.owner}</span>
          <span className="text-ci-muted">{f.modified}</span>
        </div>
      ))}
    </div>
  );
}
