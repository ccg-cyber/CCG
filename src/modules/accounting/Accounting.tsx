import { useState } from "react";
import {
  useAppState,
  createJournalEntry,
  postJournalEntry,
  cancelJournalEntry,
  createCheque,
  updateChequeStatus,
} from "@/lib/data";
import type { Cheque, Currency, JournalLine } from "@/lib/types";

const JOURNAL_STATUS_STYLE: Record<string, string> = {
  draft: "border-amber-500/30 text-amber-600 bg-amber-500/10",
  posted: "border-emerald-500/30 text-emerald-600 bg-emerald-500/10",
  cancelled: "border-red-500/30 text-red-600 bg-red-500/10",
};

const CHEQUE_STATUS_STYLE: Record<Cheque["status"], string> = {
  pending: "border-amber-500/30 text-amber-600 bg-amber-500/10",
  deposited: "border-ci-accent/30 text-ci-accent bg-ci-accent/10",
  cleared: "border-emerald-500/30 text-emerald-600 bg-emerald-500/10",
  returned: "border-red-500/30 text-red-600 bg-red-500/10",
  cancelled: "border-ci-border text-ci-muted bg-ci-panel2",
};

const CHEQUE_NEXT: Partial<Record<Cheque["status"], Cheque["status"][]>> = {
  pending: ["deposited", "returned", "cancelled"],
  deposited: ["cleared", "returned"],
};

function emptyLine(): JournalLine {
  return { accountCode: "", accountName: "", debit: 0, credit: 0 };
}

export default function Accounting() {
  const state = useAppState();
  const [tab, setTab] = useState<"ledger" | "banking">("ledger");

  // New journal entry form
  const [jvOpen, setJvOpen] = useState(false);
  const [reference, setReference] = useState("");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [lines, setLines] = useState<JournalLine[]>([emptyLine(), emptyLine()]);
  const [jvError, setJvError] = useState<string | null>(null);
  const [postErrors, setPostErrors] = useState<Record<string, string>>({});

  function handlePost(id: string) {
    const result = postJournalEntry(id);
    setPostErrors((e) => {
      const next = { ...e };
      if (result.ok) delete next[id];
      else next[id] = result.error ?? "Could not post this entry.";
      return next;
    });
  }

  // New cheque form
  const [chqOpen, setChqOpen] = useState(false);
  const [chequeNo, setChequeNo] = useState("");
  const [chequeType, setChequeType] = useState<Cheque["type"]>("received");
  const [party, setParty] = useState("");
  const [bank, setBank] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [amount, setAmount] = useState("");
  const [chqCurrency, setChqCurrency] = useState<Currency>("USD");

  function updateLine(i: number, patch: Partial<JournalLine>) {
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }

  function submitJournal() {
    const clean = lines.filter((l) => l.accountCode.trim() && (l.debit > 0 || l.credit > 0));
    if (!reference.trim() || clean.length < 2) {
      setJvError("Add a reference and at least two lines.");
      return;
    }
    createJournalEntry(reference.trim(), currency, clean);
    setReference("");
    setLines([emptyLine(), emptyLine()]);
    setJvError(null);
    setJvOpen(false);
  }

  function submitCheque() {
    if (!chequeNo.trim() || !party.trim() || !dueDate || !amount) return;
    createCheque({
      chequeNo: chequeNo.trim(),
      type: chequeType,
      party: party.trim(),
      bank: bank.trim(),
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate,
      amount: Number(amount),
      currency: chqCurrency,
    });
    setChequeNo("");
    setParty("");
    setBank("");
    setDueDate("");
    setAmount("");
    setChqOpen(false);
  }

  return (
    <div className="max-w-2xl">
      <p className="text-xs text-ci-muted mb-3">
        A journal entry only touches the ledger once posted — debits and credits must balance first, exactly like a
        real general ledger. Cheques track the actual pending → deposited → cleared (or returned) path a bank
        processes them through.
      </p>

      <div className="flex gap-1 mb-4 border-b border-ci-border">
        {(["ledger", "banking"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-xs font-medium border-b-2 -mb-px ${
              tab === t ? "border-ci-accent text-ci-accent" : "border-transparent text-ci-muted"
            }`}
          >
            {t === "ledger" ? "General Ledger" : "Banking & Cheques"}
          </button>
        ))}
      </div>

      {tab === "ledger" && (
        <div>
          <div className="mb-4">
            {!jvOpen ? (
              <button onClick={() => setJvOpen(true)} className="rounded-lg bg-ci-accent px-4 py-2 text-sm font-medium text-white">
                + New journal entry
              </button>
            ) : (
              <div className="rounded-lg border border-ci-border bg-ci-panel p-3 space-y-2">
                <div className="flex flex-wrap gap-2">
                  <input
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="Reference (e.g. October rent)"
                    className="flex-1 min-w-[160px] rounded-md border border-ci-border bg-ci-panel2 px-3 py-1.5 text-sm"
                  />
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                    className="rounded-md border border-ci-border bg-ci-panel2 px-3 py-1.5 text-sm"
                  >
                    <option value="USD">USD</option>
                    <option value="LBP">LBP</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                {lines.map((l, i) => (
                  <div key={i} className="flex flex-wrap gap-2">
                    <input
                      value={l.accountCode}
                      onChange={(e) => updateLine(i, { accountCode: e.target.value })}
                      placeholder="Account code"
                      className="w-24 rounded-md border border-ci-border bg-ci-panel2 px-2 py-1.5 text-xs"
                    />
                    <input
                      value={l.accountName}
                      onChange={(e) => updateLine(i, { accountName: e.target.value })}
                      placeholder="Account name"
                      className="flex-1 min-w-[120px] rounded-md border border-ci-border bg-ci-panel2 px-2 py-1.5 text-xs"
                    />
                    <input
                      type="number"
                      value={l.debit || ""}
                      onChange={(e) => updateLine(i, { debit: Number(e.target.value) || 0, credit: 0 })}
                      placeholder="Debit"
                      className="w-24 rounded-md border border-ci-border bg-ci-panel2 px-2 py-1.5 text-xs"
                    />
                    <input
                      type="number"
                      value={l.credit || ""}
                      onChange={(e) => updateLine(i, { credit: Number(e.target.value) || 0, debit: 0 })}
                      placeholder="Credit"
                      className="w-24 rounded-md border border-ci-border bg-ci-panel2 px-2 py-1.5 text-xs"
                    />
                  </div>
                ))}
                <button onClick={() => setLines((ls) => [...ls, emptyLine()])} className="text-[11px] text-ci-accent">
                  + Add line
                </button>
                {jvError && <p className="text-[11px] text-red-600">{jvError}</p>}
                <div className="flex gap-2 pt-1">
                  <button onClick={submitJournal} className="rounded-md bg-ci-accent px-3 py-1.5 text-xs font-medium text-white">
                    Save as draft
                  </button>
                  <button onClick={() => setJvOpen(false)} className="rounded-md border border-ci-border px-3 py-1.5 text-xs text-ci-muted">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {state.journalEntries.map((j) => {
              const debit = j.lines.reduce((s, l) => s + l.debit, 0);
              const credit = j.lines.reduce((s, l) => s + l.credit, 0);
              return (
                <div key={j.id} className="rounded-lg border border-ci-border bg-ci-panel p-3">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div>
                      <p className="text-sm font-medium">{j.reference}</p>
                      <p className="text-xs text-ci-muted">
                        {j.id.toUpperCase()} · {j.date} · {j.currency}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] ${JOURNAL_STATUS_STYLE[j.status]}`}>
                      {j.status}
                    </span>
                  </div>
                  <ul className="text-xs text-ci-muted space-y-0.5 mb-2">
                    {j.lines.map((l, i) => (
                      <li key={i}>
                        {l.accountCode} — {l.accountName}: {l.debit > 0 ? `Dr ${l.debit.toLocaleString()}` : `Cr ${l.credit.toLocaleString()}`}
                      </li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-ci-muted mb-2">
                    Total debit {debit.toLocaleString()} · Total credit {credit.toLocaleString()}
                  </p>
                  {j.status === "draft" && (
                    <div>
                      <div className="flex gap-3">
                        <button onClick={() => handlePost(j.id)} className="text-[11px] text-ci-accent hover:underline">
                          Post →
                        </button>
                        <button onClick={() => cancelJournalEntry(j.id)} className="text-[11px] text-ci-muted hover:underline">
                          Cancel
                        </button>
                      </div>
                      {postErrors[j.id] && <p className="text-[11px] text-red-600 mt-1">{postErrors[j.id]}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "banking" && (
        <div>
          <div className="mb-4">
            {!chqOpen ? (
              <button onClick={() => setChqOpen(true)} className="rounded-lg bg-ci-accent px-4 py-2 text-sm font-medium text-white">
                + Record cheque
              </button>
            ) : (
              <div className="flex flex-wrap gap-2 rounded-lg border border-ci-border bg-ci-panel p-3">
                <select value={chequeType} onChange={(e) => setChequeType(e.target.value as Cheque["type"])} className="rounded-md border border-ci-border bg-ci-panel2 px-3 py-1.5 text-sm">
                  <option value="received">Received</option>
                  <option value="issued">Issued</option>
                </select>
                <input value={chequeNo} onChange={(e) => setChequeNo(e.target.value)} placeholder="Cheque no." className="w-28 rounded-md border border-ci-border bg-ci-panel2 px-3 py-1.5 text-sm" />
                <input value={party} onChange={(e) => setParty(e.target.value)} placeholder="Party" className="flex-1 min-w-[120px] rounded-md border border-ci-border bg-ci-panel2 px-3 py-1.5 text-sm" />
                <input value={bank} onChange={(e) => setBank(e.target.value)} placeholder="Bank" className="w-32 rounded-md border border-ci-border bg-ci-panel2 px-3 py-1.5 text-sm" />
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="rounded-md border border-ci-border bg-ci-panel2 px-3 py-1.5 text-sm" />
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" className="w-28 rounded-md border border-ci-border bg-ci-panel2 px-3 py-1.5 text-sm" />
                <select value={chqCurrency} onChange={(e) => setChqCurrency(e.target.value as Currency)} className="rounded-md border border-ci-border bg-ci-panel2 px-3 py-1.5 text-sm">
                  <option value="USD">USD</option>
                  <option value="LBP">LBP</option>
                  <option value="EUR">EUR</option>
                </select>
                <button onClick={submitCheque} className="rounded-md bg-ci-accent px-3 py-1.5 text-xs font-medium text-white">Save</button>
                <button onClick={() => setChqOpen(false)} className="rounded-md border border-ci-border px-3 py-1.5 text-xs text-ci-muted">Cancel</button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {state.cheques.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-3 rounded-lg border border-ci-border bg-ci-panel px-4 py-3">
                <div>
                  <p className="text-sm font-medium">
                    #{c.chequeNo} — {c.party} ({c.type})
                  </p>
                  <p className="text-xs text-ci-muted">
                    {c.bank} · {c.amount.toLocaleString()} {c.currency} · due {c.dueDate}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {(CHEQUE_NEXT[c.status] ?? []).map((next) => (
                    <button key={next} onClick={() => updateChequeStatus(c.id, next)} className="text-[11px] text-ci-accent hover:underline">
                      {next} →
                    </button>
                  ))}
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] ${CHEQUE_STATUS_STYLE[c.status]}`}>{c.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
