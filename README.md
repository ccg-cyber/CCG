# Ci Business OS

One workspace. One intelligence. The goal is that Ci can replace almost
everything a company normally installs or subscribes to on its PCs — one
account, one permission model, one search index, one audit trail — with AI
agents doing the cross-application work a person used to do by hand.

This repository is the first slice of that: a working shell with the full
90-module architecture registered and navigable, nine modules built
end-to-end against **one real shared dataset** (not nine disconnected
demos), and an "Ask CI" command bar that actually drafts documents, files
them in Drive, and opens a real approval — not a description of what it
would do.

Read [`ARCHITECTURE.md`](./ARCHITECTURE.md) for why it's built this way,
and [`MODULES.md`](./MODULES.md) for the full module map (generated from
the code, always current).

## What's here right now

| Module | Status |
|---|---|
| CI Home | ✅ Live — dashboard, notifications, approvals, Ask CI |
| CI Docs | ✅ Live — editable document surface |
| CI Sheets | ✅ Live — revenue forecast with a live cross-module formula |
| CI Mail | ✅ Live — inbox wired to shared customer data |
| CI Calendar | ✅ Live — real meetings, schedule new ones |
| CI Contacts | ✅ Live — the shared customer list, add new contacts |
| CI Drive | ✅ Live — file/folder browser, shows agent-filed documents |
| CI CRM | ✅ Live — pipeline board, deals advance stages |
| CI Customer Service | ✅ Live — real tickets, advance their status |
| CI Tasks | ✅ Live — to-do list, add/complete, persisted |
| CI Invoicing | ✅ Live — real invoices, overdue totals |
| CI Approval Center | ✅ Live — real queue, approve/reject with consequences |
| CI Audit | ✅ Live — immutable log of every human and agent action |
| CI Projects | ✅ Live — groups tasks, real progress bars |
| CI Sales | ✅ Live — accepting a quote auto-advances its CRM deal |
| CI Notifications | ✅ Live — shared, dismissible, same data Home reads |
| 74 more modules | ⬜ Registered, searchable, not yet built |

All sixteen live modules read and write **one shared, persisted dataset**
(`src/lib/data.ts`, backed by `localStorage`) keyed around real customer
records — so a deal in CRM, an invoice in Invoicing, a thread in Mail, and
a file in Drive for "Acme Ltd." are the *same* Acme Ltd., not four
separate mocks that happen to share a name.

Every other module in the master map — Sheets, ERP, HR, Payroll, Agents,
Security Center, and 78 more — is registered in
[`src/lib/registry.ts`](./src/lib/registry.ts), appears in the sidebar and
in search, and opens to a page that says exactly what it is and what
category it belongs to. Nothing is hidden; nothing is faked as "done."

## Getting started

```bash
npm install
npm run dev       # local dev server
npm run build     # typecheck + production build
```

## Try it

- Open the app and type into **Ask CI** on the home page:
  - _"Acme Ltd. hasn't paid, prepare a statement and draft a follow-up
    email"_ — reads Acme Ltd.'s real overdue invoices, drafts a statement,
    **actually files it in CI Drive**, drafts the follow-up, and **actually
    opens a pending request in CI Approval Center** — watch the Home
    dashboard's "Pending your approval" panel update live. Approve it and
    the email really appears at the top of CI Mail's inbox; every step is
    logged in CI Audit.
  - _"Show me everything happening with Acme Ltd."_ — fans out across CRM,
    Mail, Invoicing, Drive, Customer Service and Calendar using the same
    shared data: real deal stage, real overdue total, the real open ticket
    count, and the real next meeting date — nothing hardcoded per query.
- Open **CI Sales**, accept the Nord Retail Group quote, then open **CI
  CRM** — their deal has moved to "Won" without touching CRM at all. Check
  **CI Audit** and you'll see two entries: "You" accepted the quote, and
  "Ci Business OS" (the system actor) logged the automatic deal advance
  separately — the audit trail distinguishes a human action from its
  automated consequence.
- Use the top search bar or the sidebar to jump into any of the 90
  modules — live ones show a working screen, everything else shows what
  it's scoped to become.

## Project structure

```
src/
  lib/
    types.ts        Core + entity types: ModuleDefinition, Customer, Invoice,
                     Deal, ApprovalRequest, AuditEvent, AppState...
    categories.ts    The 10 top-level categories (+ Home)
    registry.ts      All 90 modules — the single source of truth for nav/search
    store.ts         Tiny reactive, localStorage-backed store (no dependency)
    data.ts          The shared dataset every live module reads/writes,
                     plus selectors (getCustomerBundle) and mutations
                     (decideApproval, addDriveFile, toggleTask...)
    permissions.ts   Minimal RBAC stub (CI Identity / CI Permissions)
    ask-ci.ts        Orchestrator: reads real data, performs real writes,
                     gates outbound actions behind an approval
  components/        Shell chrome: Sidebar, TopBar, ModuleCard, AskCiBar
  pages/             Home (dashboard) and ModulePage (generic module shell)
  modules/           Real implementations for the nine live modules
scripts/
  gen-modules-doc.mjs  Regenerates MODULES.md from the registry
```

## Adding a module

1. Add one entry to `MODULES` in `src/lib/registry.ts` — id, slug, name,
   category, status, description, keywords.
2. Run `node scripts/gen-modules-doc.mjs` to refresh `MODULES.md`.
3. It's now live in the sidebar and search with a "not built yet" page.
4. When ready to build it, add a component under `src/modules/<name>/`
   and register it in the `DEMOS` map in `src/pages/ModulePage.tsx`, then
   flip its `status` to `"live"`.

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the fuller process.
