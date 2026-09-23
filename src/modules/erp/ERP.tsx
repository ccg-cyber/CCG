import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppState, updateCompanyProfile, addBranch, removeBranch, monthlyPay } from "@/lib/data";
import type { Currency } from "@/lib/types";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * The one "place" that ties Ci's business modules together as an ERP suite
 * rather than a scatter of separate apps — company profile, branches, and
 * fiscal settings every other module sits under, plus a live command center
 * with real numbers pulled from each module's own data.
 */
export default function ERP() {
  const state = useAppState();
  const { erp } = state;
  const [name, setName] = useState(erp.companyName);
  const [branchName, setBranchName] = useState("");
  const [branchAddress, setBranchAddress] = useState("");

  const pendingPOs = state.purchaseOrders.filter((po) => po.status === "pending").length;
  const lowStock = state.inventory.filter((i) => i.quantityOnHand < i.reorderPoint).length;
  const inProgressOrders = state.productionOrders.filter((o) => o.status === "in-progress").length;
  const draftJournals = state.journalEntries.filter((j) => j.status === "draft").length;
  const openQuotes = state.quotes.filter((q) => q.status === "sent" || q.status === "draft").length;
  const monthlyPayroll = state.employees.filter((e) => e.status !== "offboarded").reduce((sum, e) => sum + monthlyPay(e), 0);

  const modules = [
    { slug: "manufacturing", name: "CI Manufacturing", stat: `${inProgressOrders} order(s) in progress` },
    { slug: "inventory", name: "CI Inventory", stat: `${lowStock} item(s) low on stock` },
    { slug: "purchasing", name: "CI Purchasing", stat: `${pendingPOs} PO(s) awaiting approval` },
    { slug: "accounting", name: "CI Accounting & Finance", stat: `${draftJournals} draft journal(s)` },
    { slug: "sales", name: "CI Sales", stat: `${openQuotes} open quote(s)` },
    { slug: "hr", name: "CI HR", stat: `${state.employees.length} employee(s)` },
    { slug: "payroll", name: "CI Payroll", stat: `$${monthlyPayroll.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo` },
  ];

  return (
    <div className="max-w-2xl space-y-4">
      <p className="text-xs text-ci-muted">
        Company-wide master data — every business module below reads this same profile, currency, and fiscal year,
        the way a real ERP's setup area anchors everything else.
      </p>

      <div className="rounded-lg border border-ci-border bg-ci-panel p-4">
        <p className="text-sm font-medium mb-3">Company profile</p>
        <div className="flex flex-wrap gap-2 mb-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => name.trim() && name !== erp.companyName && updateCompanyProfile({ companyName: name.trim() })}
            placeholder="Company name"
            className="flex-1 min-w-[160px] rounded-md border border-ci-border bg-ci-panel2 px-3 py-1.5 text-sm"
          />
          <select
            value={erp.baseCurrency}
            onChange={(e) => updateCompanyProfile({ baseCurrency: e.target.value as Currency })}
            className="rounded-md border border-ci-border bg-ci-panel2 px-3 py-1.5 text-sm"
          >
            <option value="USD">USD</option>
            <option value="LBP">LBP</option>
            <option value="EUR">EUR</option>
          </select>
          <select
            value={erp.fiscalYearStartMonth}
            onChange={(e) => updateCompanyProfile({ fiscalYearStartMonth: Number(e.target.value) })}
            className="rounded-md border border-ci-border bg-ci-panel2 px-3 py-1.5 text-sm"
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>
                Fiscal year starts {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-lg border border-ci-border bg-ci-panel p-4">
        <p className="text-sm font-medium mb-3">Branches</p>
        <div className="space-y-1.5 mb-3">
          {erp.branches.map((b) => (
            <div key={b.id} className="flex items-center justify-between gap-2 rounded-md bg-ci-panel2 px-3 py-1.5 text-sm">
              <span>
                {b.name} {b.address && <span className="text-ci-muted">— {b.address}</span>}
              </span>
              {erp.branches.length > 1 && (
                <button onClick={() => removeBranch(b.id)} className="text-[11px] text-ci-muted hover:text-red-600">
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
            placeholder="Branch name"
            className="flex-1 min-w-[120px] rounded-md border border-ci-border bg-ci-panel2 px-3 py-1.5 text-sm"
          />
          <input
            value={branchAddress}
            onChange={(e) => setBranchAddress(e.target.value)}
            placeholder="Address (optional)"
            className="flex-1 min-w-[120px] rounded-md border border-ci-border bg-ci-panel2 px-3 py-1.5 text-sm"
          />
          <button
            onClick={() => {
              if (!branchName.trim()) return;
              addBranch(branchName.trim(), branchAddress.trim());
              setBranchName("");
              setBranchAddress("");
            }}
            className="rounded-md bg-ci-accent px-3 py-1.5 text-xs font-medium text-white"
          >
            + Add branch
          </button>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium mb-2">ERP modules</p>
        <div className="grid grid-cols-2 gap-2">
          {modules.map((m) => (
            <Link
              key={m.slug}
              to={`/modules/${m.slug}`}
              className="rounded-lg border border-ci-border bg-ci-panel p-3 hover:bg-ci-panel2"
            >
              <p className="text-sm font-medium">{m.name}</p>
              <p className="text-xs text-ci-muted">{m.stat}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
