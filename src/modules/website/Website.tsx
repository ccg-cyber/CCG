import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppState, submitContactForm } from "@/lib/data";

/**
 * Proves the claim in ARCHITECTURE.md's "a form is an entry point"
 * section: the public website's lead form and CI Forms' internal contact
 * form call the exact same submitContactForm() — a third front door onto
 * the same mutation, costing nothing structurally to add.
 */
export default function Website() {
  const state = useAppState();
  const leadCount = state.customers.filter((c) => c.tags.includes("inbound")).length;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function submit() {
    if (!name.trim() || !email.trim() || !message.trim()) return;
    submitContactForm(name.trim(), email.trim(), "", message.trim());
    setName("");
    setEmail("");
    setMessage("");
    setSent(true);
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="rounded-lg border border-ci-border bg-ci-panel px-4 py-3 text-sm">
        <span className="text-ci-muted">Leads generated via the public site: </span>
        <span className="font-medium">{leadCount}</span>
        <Link to="/modules/contacts" className="text-ci-accent ml-2 text-[11px]">
          View in CI Contacts →
        </Link>
      </div>

      <div className="rounded-xl border border-ci-border bg-white text-ci-bg p-8">
        <h2 className="text-2xl font-semibold mb-1">Get in touch</h2>
        <p className="text-sm text-black/60 mb-5">This mock-up is what a visitor on the real public website sees.</p>
        {sent ? (
          <p className="text-sm text-emerald-700">Thanks — we'll be in touch shortly.</p>
        ) : (
          <div className="space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-md border border-black/15 px-3 py-2 text-sm"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full rounded-md border border-black/15 px-3 py-2 text-sm"
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="How can we help?"
              className="w-full min-h-[80px] rounded-md border border-black/15 px-3 py-2 text-sm"
            />
            <button onClick={submit} className="rounded-md bg-ci-accent px-4 py-2 text-sm font-medium text-white">
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
