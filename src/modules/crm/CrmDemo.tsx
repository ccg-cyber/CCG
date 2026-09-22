interface Deal {
  id: number;
  name: string;
  value: string;
  stage: "New" | "Qualified" | "Proposal" | "Won";
}

const DEALS: Deal[] = [
  { id: 1, name: "Nord Retail Group", value: "$18,000", stage: "Proposal" },
  { id: 2, name: "Blue Harbor Logistics", value: "$7,200", stage: "New" },
  { id: 3, name: "Acme Ltd. — renewal", value: "$32,500", stage: "Qualified" },
  { id: 4, name: "Northwind Supplies", value: "$5,400", stage: "Won" },
];

const STAGES: Deal["stage"][] = ["New", "Qualified", "Proposal", "Won"];

export default function CrmDemo() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl">
      {STAGES.map((stage) => (
        <div key={stage} className="rounded-lg border border-ci-border bg-ci-panel p-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ci-muted mb-3">{stage}</h3>
          <div className="space-y-2">
            {DEALS.filter((d) => d.stage === stage).map((d) => (
              <div key={d.id} className="rounded-md border border-ci-border bg-ci-panel2 p-2.5">
                <p className="text-sm font-medium">{d.name}</p>
                <p className="text-xs text-ci-muted">{d.value}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
