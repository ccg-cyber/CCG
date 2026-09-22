import { useState } from "react";

const SEED = `Statement of Account — Acme Ltd.

Dear Acme Ltd.,

As of today, the following invoices remain outstanding on your account:

  Invoice #1042   $4,200.00   12 days overdue
  Invoice #1058   $1,150.00   3 days overdue

Total outstanding: $5,350.00

Please let us know if you have any questions, or if a payment is already
in transit. A copy of each invoice is attached.

Kind regards,
Accounts Receivable`;

export default function DocsDemo() {
  const [text, setText] = useState(SEED);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-2 mb-2 text-xs text-ci-muted">
        <button className="rounded border border-ci-border px-2 py-1 font-semibold">B</button>
        <button className="rounded border border-ci-border px-2 py-1 italic">I</button>
        <button className="rounded border border-ci-border px-2 py-1 underline">U</button>
        <span className="mx-1 text-ci-border">|</span>
        <span>Autosaved · v3</span>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full min-h-[420px] rounded-lg border border-ci-border bg-white text-black p-6 text-sm leading-relaxed font-serif focus:outline-none focus:ring-2 focus:ring-ci-accent/40"
      />
    </div>
  );
}
