# Ci Business OS

One workspace. One intelligence. The goal is that Ci can replace almost
everything a company normally installs or subscribes to on its PCs — one
account, one permission model, one search index, one audit trail — with AI
agents doing the cross-application work a person used to do by hand.

This repository is the first slice of that: a real desktop — boot
sequence, icons, draggable/resizable windows, a taskbar, a Start menu —
not an admin dashboard with a sidebar. The full 90-module architecture is
registered and reachable from it, 42 modules are built end-to-end against
**one real shared dataset** (not 42 disconnected demos), and an "Ask CI"
command bar actually drafts documents, files them in Drive, and opens a
real approval — not a description of what it would do.

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
| CI Purchasing | ✅ Live — real POs, wired to the existing approval flow |
| CI HR | ✅ Live — employees by department; not customer-centric data |
| CI Inventory | ✅ Live — stock restocks itself when a PO is approved |
| CI Marketing | ✅ Live — launches real emails to real CRM leads |
| CI Payroll | ✅ Live — reads CI HR's employee data, computes real pay |
| CI Manufacturing | ✅ Live — a real BOM that consumes and produces real stock |
| CI Attendance | ✅ Live — real PTO balances on top of CI HR's employees |
| CI Contracts | ✅ Live — expiry-driven status, computed, not hardcoded |
| CI Legal | ✅ Live — reads CI Contracts' at-risk list, real policy reviews |
| CI Recruit | ✅ Live — hiring a candidate creates their real CI HR record |
| CI POS | ✅ Live — sells against real CI Inventory, independent of CI Sales |
| CI Logistics | ✅ Live — real dispatch/delivery status ladder |
| CI Assets | ✅ Live — live depreciation formula, assignable to CI HR employees |
| CI Knowledge | ✅ Live — the first non-transactional module: durable content |
| CI Chat | ✅ Live — real channels and messages, persisted |
| CI Forms | ✅ Live — a submission creates a real ticket or a real candidate |
| CI Search | ✅ Live — searches real records across all 36 modules, not just names |
| CI Sign | ✅ Live — signing a document actually files it in CI Drive |
| CI Meet | ✅ Live — ending a meeting with action items creates real CI Tasks |
| CI Scan | ✅ Live — parses a receipt into a real expense, files it in CI Drive |
| CI Archive | ✅ Live — a filtered view of CI Drive; archiving moves files here |
| CI Assistant | ✅ Live — Ask CI's own address, the same component as on Home |
| CI Website | ✅ Live — a public lead form calling the same mutation CI Forms uses |
| CI Marketplace | ✅ Live — real on/off switches for the built-in automations |
| CI Governance | ✅ Live — a spend threshold that changes real approval behavior |
| CI Data Hub | ✅ Live — CSV import/export into CI Contacts' real list |
| 48 more modules | ⬜ Registered, searchable, not yet built |

All forty-two live modules (nearly half the full map) read and write **one shared, persisted dataset**
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

## Deploying

`npm run dev` is for local development only — it has no build
optimizations and its hot-reload websocket has no way to work through a
reverse proxy on a public domain. For a real deployment (behind nginx,
Caddy, Cloudflare Tunnel, or anything similar), build and serve the
static output instead:

```bash
npm install
npm run build                          # writes dist/
npm run preview -- --host              # serves dist/, binds all interfaces
```

`vite.config.ts` already lists the domain this app is deployed behind
(`os.cierp.uk`) in `preview.allowedHosts` — Vite rejects requests whose
`Host` header isn't recognized, so add any additional domain there too.
Keep the preview process running persistently (`pm2`, a systemd unit, or
equivalent) rather than in a foreground terminal, and point your reverse
proxy at the port it prints (`5173` by default here, set in
`vite.config.ts`).

For anything beyond a single always-on preview process — multiple
replicas, zero-downtime redeploys — serve the `dist/` folder directly
from a static file server (nginx, Caddy, or a static host) instead of
`vite preview`, which is meant for local verification of a build, not
long-running production traffic.

## Try it

- **Watch it boot.** Loading the app plays a real boot sequence — a
  progress bar and a status log, like a machine starting up, not a page
  loading. Click, or press any key, to skip straight to the desktop.
- **It's a desktop, not a dashboard.** Double-click an icon (Home, Docs,
  Mail, CRM, Drive, Tasks, Approval Center, Assistant) to open it in a
  real window: drag it by the titlebar, resize from the bottom-right
  corner, double-click the titlebar to maximize, minimize/restore from
  the taskbar. Open several at once — CI CRM and CI Invoicing side by
  side — and they behave like two windows, not two pages replacing each
  other.
- Click **Start** (bottom-left) for every other module — type to filter,
  or browse by category. This replaces both the old sidebar tree and a
  separate search box with one launcher, the way a real OS's app launcher
  is both at once.
- Type into **Ask CI** in the CI Home window:
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
- Approve the PO-2201 purchase order in **CI Approval Center**, then open
  **CI Inventory** — Widget B's stock goes from 15 to 65 and its "low
  stock" flag clears, with no manual stock entry.
- Launch a campaign in **CI Marketing** — it reads CI CRM's "New"-stage
  deals as the audience and actually adds a sent email per lead to CI
  Mail, so the recipient count you see is real, not a placeholder.
- Submit the job application form in **CI Forms** — the applicant
  immediately appears as a real candidate in **CI Recruit**, and is
  findable through **CI Search** the moment you submit, with no reload.
- Turn off "Approved PO receives inventory" in **CI Marketplace**, then
  approve the seeded PO-2201 in **CI Approval Center** — CI Inventory's
  stock stays put, proving the toggle changes real behavior, not just a
  label. Turn it back on and the same approval will receive stock again.
- Set a threshold in **CI Governance**, then create a new purchase order
  under it in **CI Purchasing** — it's approved instantly, with no trip
  through CI Approval Center at all.
## Project structure

```
src/
  lib/
    types.ts           Core + entity types: ModuleDefinition, Customer, Invoice,
                        Deal, ApprovalRequest, AuditEvent, AppState...
    categories.ts       The 10 top-level categories (+ Home)
    registry.ts         All 90 modules — the single source of truth for nav/search
    store.ts            Tiny reactive, localStorage-backed store (no dependency)
    data.ts             The shared dataset every live module reads/writes,
                        plus selectors (getCustomerBundle) and mutations
                        (decideApproval, addDriveFile, toggleTask...)
    permissions.ts      Minimal RBAC stub (CI Identity / CI Permissions)
    ask-ci.ts           Orchestrator: reads real data, performs real writes,
                        gates outbound actions behind an approval
    moduleComponents.tsx  Module id -> real component, one map for all 90
  os/                  The shell itself — a desktop, not a dashboard:
    BootScreen.tsx       Boot sequence, once per real page load
    WindowManagerContext.tsx  Real window state: position, size, z-order,
                        minimized/maximized (reducer, not CSS tricks)
    Window.tsx           Draggable, resizable window frame
    Desktop.tsx          Wallpaper, desktop icons, the open-window render loop
    Taskbar.tsx          Open windows, live clock, notification count
    StartMenu.tsx        Browse-by-category + type-to-find, in one launcher
    ModuleWindowContent.tsx  What renders inside a window: the real module,
                        or the honest "not built yet" placeholder
  pages/
    Home.tsx             CI Home's content — Ask CI, notifications, approvals,
                        the module grid — registered like any other module
  modules/              Real implementations for the 42 live modules
scripts/
  gen-modules-doc.mjs  Regenerates MODULES.md from the registry
```

## Adding a module

1. Add one entry to `MODULES` in `src/lib/registry.ts` — id, slug, name,
   category, status, description, keywords.
2. Run `node scripts/gen-modules-doc.mjs` to refresh `MODULES.md`.
3. It's now reachable from Start and opens as a window with a "not built
   yet" placeholder.
4. When ready to build it, the file location is never a guess: a module
   with slug `<slug>` lives at `src/modules/<slug>/<Name>.tsx`, where
   `<Name>` is the slug in PascalCase (`purchasing` → `Purchasing.tsx`,
   `customer-service` → `CustomerService.tsx`). No `Demo`, `Page`, or
   `Component` suffix — these are the real screens, not placeholders for
   real ones. It renders inside a resizable window (as small as 360×240),
   so design for that, not a full browser tab. Register it in
   `MODULE_COMPONENTS` in `src/lib/moduleComponents.tsx`, then flip its
   `status` to `"live"`.

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the fuller process.
