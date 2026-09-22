# Ci Business OS — Architecture

## The bet

Companies run on a sprawl of separately-installed and separately-subscribed
software: an office suite, an email client, a CRM, an ERP, a help desk, a
password manager, a backup tool, remote support software, a design tool, a
handful of SaaS dashboards — each with its own login, its own data model,
its own permissions, and no shared memory of the others.

Ci Business OS is the bet that almost all of it can live inside **one
account, one permission model, one search index, one audit trail, and one
intelligence layer** — with AI agents doing the integration work a human
used to do by hand (copy a number from the ERP into an email, attach the
right PDF, remember which customer this is).

That only works if it's actually one system under the hood, not 90 apps
wearing the same paint. This document is the contract for what "one
system" means here, so every module added later fits the same shape
instead of becoming its own island.

## The locked hierarchy

```
Ci Business OS
├─ Home          — command center, one entry point (CI Home, Desktop, Mobile)
├─ Work          — Docs, Sheets, Present, PDF, Notes, Forms, Tasks
├─ Communicate   — Mail, Calendar, Chat, Meet, Contacts, Comms, Notifications
├─ Files         — Drive, Search, Scan, Sign, Archive
├─ Business      — CRM, ERP, Finance, Sales, HR, Inventory, Projects, ...
├─ Create        — Design, Media, Video, Audio, Translate, Website
├─ IT            — Remote, Devices, Security, Backup, Software, Assets
├─ Build         — Database, Builder, Automate, API Hub, Connect, Dev
├─ Intelligence  — Assistant, Agents, Agent Studio, Knowledge, Orchestrator
├─ Control       — Admin, Approvals, Permissions, Audit, Governance
└─ Executive     — Business Intelligence, Control Room
```

Full module-by-module detail, generated from the live registry, is in
[`MODULES.md`](./MODULES.md).

`CI CORE` is not a category — it's the substrate every category sits on:
identity, permissions, the module registry, search, and (eventually) the
agent orchestration layer. In this codebase that's `src/lib/`.

## Why data-driven, not 90 hand-wired apps

The single most important decision in this codebase: **the module map is
data, not code structure.** `src/lib/registry.ts` is a plain array of
`ModuleDefinition` objects (id, slug, category, status, description,
keywords). The sidebar, the command palette, global search, and the
"Ask CI" router all read from that one array.

This means:

- Adding module #91 is adding one object to an array, not restructuring
  navigation, routing, or search.
- A module's `status` (`planned` → `scaffolded` → `live`) is what gates
  whether it shows a real screen or a "not built yet, but it's in the
  system" placeholder — so the full shape of the OS is visible and
  navigable from day one, long before every module is built.
- Nothing about "what modules exist" is duplicated between the sidebar,
  the dashboard grid, and search — there is one source of truth.

## A module's file location is never a guess

Every live module's screen lives at `src/modules/<slug>/<Name>.tsx`,
where `<slug>` is the exact `slug` field from its `registry.ts` entry and
`<Name>` is that slug in PascalCase — `purchasing` is
`src/modules/purchasing/Purchasing.tsx`, `customer-service` is
`src/modules/customer-service/CustomerService.tsx`. No file carries a
`Demo`, `Page`, `Component`, or `View` suffix: these are the product's
real screens, and naming them as anything provisional would be a lie the
codebase tells about itself. The mapping is registered once, in
`MODULE_COMPONENTS` in `src/pages/ModulePage.tsx`, so finding or adding a
module's implementation never requires searching — the slug is the
address.

## One shell, not 90 apps

Every module renders inside the same shell (`src/App.tsx`): same sidebar,
same top command bar, same user session, same permission check. A module
is a component dropped into `ModulePage`, not a separate deployable with
its own login screen. That's what makes cross-module answers possible —
`ModulePage` and every module component share the same registry, the same
`CURRENT_USER`, and (as real modules replace demos) the same underlying
data store.

## One shared dataset, not nine mocks that share names

`src/lib/data.ts` holds the one dataset every live module reads and
writes: `Customer`, `Invoice`, `Deal`, `EmailMessage`, `DriveFile`,
`TaskItem`, `ApprovalRequest`, `AuditEvent` — joined by `customerId`. It's
backed by `src/lib/store.ts`, a ~50-line reactive store (React's
`useSyncExternalStore` + `localStorage`, no external dependency) standing
in for `CI DATABASE` / `CI DATA HUB`.

This is the difference between a demo and a system: "Acme Ltd." in CI CRM
is the exact same record as "Acme Ltd." in CI Mail, CI Drive, and CI
Invoicing — not four components that each hardcode the string "Acme Ltd."
Mutations go through named functions (`decideApproval`, `addDriveFile`,
`toggleTask`, `moveDealStage`, `markInvoicePaid`...) rather than components
poking at shared state directly, so the seam where a real backend
replaces `localStorage` is one file, not forty call sites.

## Ask CI is a real orchestrator, not a description of one

`src/lib/ask-ci.ts` is a deliberately deterministic (pattern-matched, not
LLM-backed) stand-in for `CI ORCHESTRATOR` (#85) — but it is **not a
mock**. It reads the same `appStore` every module reads, and when it acts,
those are real writes other modules immediately show:

- **"Show me everything happening with Acme Ltd."** → looks up the real
  customer, pulls their actual deals/invoices/emails/files out of the
  shared store, and reports real counts and dollar amounts across CRM,
  Mail, Invoicing, Drive, Customer Service, Calendar.
- **"Acme Ltd. hasn't paid, prepare a statement and email, ask before
  sending"** → reads their real overdue invoices, computes the real total,
  calls `addDriveFile()` to actually file a statement in CI Drive, calls
  `addApproval()` to actually open a request in CI Approval Center (visible
  immediately on the Home dashboard, no refresh needed — it's the same
  store), and logs both steps via `addAuditEvent()`. Approving the request
  in the Approval Center calls `decideApproval()`, which actually appends
  the drafted email to CI Mail's inbox. Nothing here is narrated; every
  noun in the plan's step list is something you can click through to and
  verify.

The point of keeping the matching deterministic isn't the regex — it's
proving the **seam** before wiring up a real model: every module is
reachable by name from one router, every write goes through the same
mutation functions a UI button would call, and every action that touches
the outside world is gated by `needsApproval` / `CI Approval Center`
rather than that gate being an afterthought bolted on after an incident.
Swapping the regex matcher for an LLM call into `CI INTELLIGENCE CORE`
means replacing `planFor()`'s body — the data layer, the approval gate,
and every module underneath are unaffected. `CI AUTONOMY CONTROL` (#86) is
where the real policy for that gate will live.

## CI Approval Center and CI Audit close the loop

Both are real, not placeholders:

- **CI Approval Center** (`src/modules/approvals`) reads pending
  `ApprovalRequest`s from the shared store and renders the actual drafted
  payload (to/subject/body/attachment) so a human can judge it, not just a
  one-line description. Approve/Reject call `decideApproval()`, which logs
  to audit and, for a `send-email` payload, actually delivers it into CI
  Mail's inbox.
- **CI Audit** (`src/modules/audit`) renders `AppState.audit` — every
  entry any module or the Ask CI router has logged — newest first, with
  the actor (`user` / `agent` / `system`) visually distinct. This is
  `CI AUDIT` (#79) and a first pass at `CI ACTIVITY / TRACE` (#87)
  simultaneously: a readable "who did what and why" timeline, not a raw
  log dump.

## Permissions and audit as first-class, not bolted on

`src/lib/permissions.ts` defines the shape every module and every agent
action is expected to pass through: `role → module → permission`, with a
distinct `agent-act` permission separate from human `edit`/`approve` —
because "can a human edit this" and "can an agent act on this
autonomously" are different questions from day one, not a distinction
added after an incident. `CI PERMISSIONS` (#57) and `CI IDENTITY` (#55)
replace this stub with a real policy engine and real auth; the shape
carries forward.

`CI AUDIT` (#79) and `CI ACTIVITY / TRACE` (#87) are the other side of the
same coin — everything a human or an agent does should be reconstructible
later as a readable timeline. Not implemented yet in this slice, but the
`AuditEvent` type in `src/lib/types.ts` reserves the shape (`actor`:
`"user" | "agent" | "system"`) so it isn't an afterthought when it's built.

## What's actually live vs. mapped

Twenty-four modules are wired up end-to-end against the one shared dataset:

| Module | Category | Proves |
|---|---|---|
| CI Home | Home | Registry-driven nav, live dashboard, Ask CI |
| CI Docs | Work | Editable document surface |
| CI Sheets | Work | Cross-module live formula (Actual = sum of paid invoices) |
| CI Tasks | Work | Stateful CRUD, persisted |
| CI Mail | Communicate | List/detail pattern; receives agent- and campaign-sent mail |
| CI Calendar | Communicate | Real schedule; closes Ask CI's "no meetings" gap |
| CI Contacts | Communicate | The shared customer list itself, editable |
| CI Notifications | Communicate | Same computed list Home reads, with persisted dismissal |
| CI Drive | Files | File/folder browser; receives agent-filed documents |
| CI CRM | Business | Pipeline/kanban; deals move as a side effect of Sales |
| CI Customer Service | Business | Real tickets; closes Ask CI's "no tickets" gap |
| CI Invoicing | Business | Real invoices/overdue totals feeding Ask CI and Sheets |
| CI Projects | Business | Groups CI Tasks; real progress bars from shared task state |
| CI Sales | Business | Accepting a quote auto-advances its linked CRM deal |
| CI Purchasing | Business | Reused the existing generic approval flow for a second payload kind |
| CI HR | Business | First entity with no customer relationship — tests the pattern |
| CI Inventory | Business | Stock moves as a side effect of an approved PO, two hops from the click |
| CI Marketing | Business | Reads CRM deal stage, writes real CI Mail sends — no fake counts |
| CI Payroll | Business | Reads CI HR's employees — the "two layers deep" test, passed |
| CI Manufacturing | Business | A real BOM: consumes N inputs, produces 1 output, blocks if short |
| CI Attendance | Business | Second module reading/writing CI HR's Employee records |
| CI Contracts | Business | Status computed from a date, not stored — recalculates live |
| CI Approval Center | Control | Real queue, now rendering two different payload kinds |
| CI Audit | Control | Real timeline of every human, agent and system action |

The other 66 are registered with real names, categories, descriptions and
keywords — visible in the sidebar and searchable — but show a "not built
yet" placeholder instead of a screen. That is intentional: the full map
should exist and be navigable before every room has furniture in it.

## Effects now chain two hops deep

CI Inventory extends the "system" actor pattern (see above) one link
further: `decideApproval()` approving a purchase-order payload doesn't
just flip the PO's own status — when that PO names a linked
`InventoryItem` and quantity, it also calls `receiveStock()` directly. One
click in CI Approval Center produces three audit entries at three
different layers (`"You"` approved it, `"Ci Business OS"` marked the PO
approved, `"Ci Business OS"` received the stock), each attributed
correctly, because each mutation function logs its own consequence rather
than the caller trying to describe effects it doesn't own. That's the
scaling property that matters: a chain of five hops through five modules
would still produce five honest audit entries, because the pattern is
"each function logs what it did," not "the top of the call stack
summarizes everything."

## The approval flow generalizes without touching Approval Center's core

CI Purchasing is the first proof that `ApprovalRequest.payload` is
actually a general mechanism, not something built once for the email
scenario and never reused. Adding a second payload kind
(`"purchase-order"`) meant: a new variant on the `payload` union type, one
new branch in `decideApproval()` (flip the linked `PurchaseOrder`'s status
instead of sending mail), and one new rendering block in
`ApprovalCenterDemo.tsx`. The pending-queue logic, the approve/reject
buttons, the history section, and every other module that opens an
approval were untouched. A third kind (a contract needing signature, a
refund needing sign-off) follows the same three-step recipe — this is the
shape `CI APPROVAL CENTER` needs to hold up once real modules multiply
past the two kinds it has today.

## Modules trigger each other — a third actor besides "user" and "agent"

`AuditEvent.actor` has three values: `"user"`, `"agent"`, `"system"`. The
first two are self-explanatory; `"system"` exists for the case CI Sales
demonstrates: accepting a quote (`decideQuote()` in `data.ts`) doesn't just
change the quote's own status — it calls `moveDealStage(dealId, "Won")`
directly, so the linked CI CRM deal updates with no human re-entering the
same fact in a second module, and no LLM in the loop deciding to do it.
The audit trail then shows two distinct entries for one user click: "You
marked the quote accepted" (`actor: "user"`) and "Deal auto-advanced to
Won" (`actor: "system"`) — because those genuinely are two different
facts a business needs to be able to tell apart later ("did a person move
this deal, or did something else move it for them").

This is the pattern `CI WORKFLOW ENGINE` (#47) generalizes: today the
cross-module rule ("accepted quote → won deal") is a hardcoded function
call; the real module replaces it with a configurable rule a human
authors ("when X in module A, do Y in module B"), but the requirement
that the consequence is distinguishable from the action in the audit
trail doesn't change.

## Stack

- **Vite + React + TypeScript** — fast local iteration, no framework
  lock-in yet. Nothing here depends on Vite specifically; the module
  pattern (registry → route → component) ports cleanly to Next.js or
  anything else if/when SSR, multi-tenant auth, or a real backend push the
  decision that way.
- **Tailwind** for styling — utility classes keep 90 module screens
  visually consistent without a hand-maintained component library yet.
- **React Router** for client-side routing — one route (`/modules/:slug`)
  serves all 90 modules by reading the registry, rather than 90 hand-written
  routes.
- No backend yet. Everything is in-memory/mock data. The next real
  milestone is a persistence layer (`CI DATABASE` / `CI DATA HUB`) that
  `CI CORE` and every module read/write through, so "one company database"
  stops being a metaphor.

## Where this goes next (not built yet, in priority order)

1. **A real backend** — `src/lib/store.ts` is `localStorage`-backed, so
   data lives in one browser only and doesn't survive across devices or
   users. The mutation-function seam in `data.ts` is designed so a real
   API/database swaps in without touching any module component — but that
   swap hasn't happened yet.
2. **Real auth** (`CI IDENTITY`) replacing the single hardcoded
   `CURRENT_USER` and the `"*"` role grant in `permissions.ts` with actual
   per-user, per-module RBAC.
3. **A real LLM-backed Ask CI** replacing the pattern-matched `planFor()`
   with a model call into `CI INTELLIGENCE CORE` — the data layer, the
   approval gate, and every module it calls into are already real and
   don't need to change.
4. **CI Autonomy Control** as an actual policy surface — today
   `needsApproval` is hardcoded per intent in `ask-ci.ts`; it should be a
   configurable rule a human sets, not a constant in the router.
5. Promote the next handful of modules from `planned` to `live`. 24 of 90
   are done. Natural next candidates: **CI Legal/Compliance** (CI
   Contracts now tracks expiry; Legal would be the natural next layer —
   policies and compliance checklists referencing those same contracts),
   **CI Recruit** (CI HR has employees but nothing feeds new ones in
   except the manual form; Recruit would be the pipeline that ends in
   `addEmployee()`), and **CI POS** (CI Inventory now has real stock
   levels; POS would be the first module to sell that same stock at the
   register rather than through CI Sales' quote-to-deal path).
