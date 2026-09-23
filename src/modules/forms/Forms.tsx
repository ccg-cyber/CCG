import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppState, submitContactForm, submitJobApplicationForm } from "@/lib/data";

export default function Forms() {
  const state = useAppState();

  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactCompany, setContactCompany] = useState("");
  const [contactMessage, setContactMessage] = useState("");

  const [appName, setAppName] = useState("");
  const [appRole, setAppRole] = useState("");
  const [appDept, setAppDept] = useState("");
  const [appSalary, setAppSalary] = useState("");

  function submitContact() {
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) return;
    submitContactForm(contactName.trim(), contactEmail.trim(), contactCompany.trim(), contactMessage.trim());
    setContactName("");
    setContactEmail("");
    setContactCompany("");
    setContactMessage("");
  }

  function submitApplication() {
    if (!appName.trim() || !appRole.trim() || !appDept.trim() || !appSalary) return;
    submitJobApplicationForm(appName.trim(), appRole.trim(), appDept.trim(), Number(appSalary));
    setAppName("");
    setAppRole("");
    setAppDept("");
    setAppSalary("");
  }

  return (
    <div className="max-w-2xl space-y-6">
      <p className="text-xs text-ci-muted">
        Submitting a form here doesn't just log an entry — it creates a real record in the module that owns it.
      </p>

      <section className="rounded-lg border border-ci-border bg-ci-panel p-4">
        <h3 className="text-sm font-medium mb-1">Contact request</h3>
        <p className="text-xs text-ci-muted mb-3">
          Creates or finds a customer in <Link to="/modules/contacts" className="text-ci-accent">CI Contacts</Link>{" "}
          and opens a ticket in <Link to="/modules/customer-service" className="text-ci-accent">CI Customer Service</Link>.
        </p>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Name" className="rounded-md border border-ci-border bg-ci-panel2 px-3 py-1.5 text-sm" />
          <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="Email" className="rounded-md border border-ci-border bg-ci-panel2 px-3 py-1.5 text-sm" />
          <input value={contactCompany} onChange={(e) => setContactCompany(e.target.value)} placeholder="Company (optional)" className="col-span-2 rounded-md border border-ci-border bg-ci-panel2 px-3 py-1.5 text-sm" />
          <textarea value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} placeholder="Message" className="col-span-2 rounded-md border border-ci-border bg-ci-panel2 px-3 py-1.5 text-sm min-h-[60px]" />
        </div>
        <button onClick={submitContact} className="rounded-lg bg-ci-accent px-4 py-1.5 text-xs font-medium text-white">
          Submit
        </button>
      </section>

      <section className="rounded-lg border border-ci-border bg-ci-panel p-4">
        <h3 className="text-sm font-medium mb-1">Job application</h3>
        <p className="text-xs text-ci-muted mb-3">
          Adds the applicant to <Link to="/modules/recruit" className="text-ci-accent">CI Recruit</Link>'s pipeline at the "applied" stage.
        </p>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input value={appName} onChange={(e) => setAppName(e.target.value)} placeholder="Name" className="rounded-md border border-ci-border bg-ci-panel2 px-3 py-1.5 text-sm" />
          <input value={appRole} onChange={(e) => setAppRole(e.target.value)} placeholder="Role applied for" className="rounded-md border border-ci-border bg-ci-panel2 px-3 py-1.5 text-sm" />
          <input value={appDept} onChange={(e) => setAppDept(e.target.value)} placeholder="Department" className="rounded-md border border-ci-border bg-ci-panel2 px-3 py-1.5 text-sm" />
          <input type="number" value={appSalary} onChange={(e) => setAppSalary(e.target.value)} placeholder="Expected salary" className="rounded-md border border-ci-border bg-ci-panel2 px-3 py-1.5 text-sm" />
        </div>
        <button onClick={submitApplication} className="rounded-lg bg-ci-accent px-4 py-1.5 text-xs font-medium text-white">
          Submit
        </button>
      </section>

      {state.formSubmissions.length > 0 && (
        <section>
          <h3 className="text-sm font-medium mb-2">Recent submissions</h3>
          <div className="space-y-1.5">
            {state.formSubmissions.map((s) => (
              <div key={s.id} className="rounded-lg border border-ci-border bg-ci-panel px-4 py-2.5 text-sm">
                <span className="text-ci-muted">{s.formName}:</span> {s.summary}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
