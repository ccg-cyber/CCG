import { useState } from "react";

interface Email {
  id: number;
  from: string;
  subject: string;
  preview: string;
  time: string;
  unread: boolean;
}

const EMAILS: Email[] = [
  { id: 1, from: "Acme Ltd. — Billing", subject: "Re: Invoice #1042", preview: "We're processing payment now, apologies for the delay...", time: "9:14 AM", unread: true },
  { id: 2, from: "Nord Retail Group", subject: "Proposal follow-up", preview: "Thanks for the call yesterday — a few questions on pricing...", time: "8:02 AM", unread: true },
  { id: 3, from: "Northwind Supplies", subject: "PO-2201 confirmation", preview: "Confirming receipt of your purchase order, shipping Monday...", time: "Yesterday", unread: false },
  { id: 4, from: "CI Security Center", subject: "Weekly security digest", preview: "No critical alerts this week. 2 devices pending patch...", time: "Yesterday", unread: false },
];

export default function MailDemo() {
  const [selected, setSelected] = useState<Email>(EMAILS[0]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4 max-w-4xl">
      <ul className="space-y-1">
        {EMAILS.map((email) => (
          <li key={email.id}>
            <button
              onClick={() => setSelected(email)}
              className={`w-full text-left rounded-lg border px-3 py-2.5 ${
                selected.id === email.id ? "border-ci-accent/50 bg-ci-accent/10" : "border-ci-border bg-ci-panel hover:bg-ci-panel2"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`text-sm truncate ${email.unread ? "font-semibold" : ""}`}>{email.from}</span>
                <span className="text-[11px] text-ci-muted shrink-0">{email.time}</span>
              </div>
              <p className={`text-xs truncate ${email.unread ? "text-ci-text" : "text-ci-muted"}`}>{email.subject}</p>
            </button>
          </li>
        ))}
      </ul>

      <div className="rounded-lg border border-ci-border bg-ci-panel p-4">
        <h3 className="font-medium mb-1">{selected.subject}</h3>
        <p className="text-xs text-ci-muted mb-4">
          {selected.from} · {selected.time}
        </p>
        <p className="text-sm leading-relaxed">{selected.preview}</p>
      </div>
    </div>
  );
}
