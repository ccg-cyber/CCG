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
`MODULE_COMPONENTS` in `src/lib/moduleComponents.tsx`, so finding or
adding a module's implementation never requires searching — the slug is
the address.

## One machine, not 90 apps — the shell is an operating system

The shell went through two designs. The first (`src/pages/Home.tsx` as a
routed "/" page, a permanent sidebar, a top search bar, each module as its
own full-page route) was honest about the data but wrong about the feel:
it read as an admin dashboard — a sidebar, cards, a page per section —
because that's the shape every SaaS back-office tool takes, and this
isn't supposed to be another one of those. "Business OS" was a name, not
yet an experience.

The shell now is a real desktop, in `src/os/`:

- **`BootScreen.tsx`** — a boot sequence that plays once per real page
  load (mounted unconditionally by `App.tsx`; client-side navigation
  within the OS never re-triggers it, the same way switching windows on a
  real machine doesn't reboot it). A progress bar, a scrolling status log,
  click or any key to skip. The point isn't decoration — it's the first
  five seconds telling you that you're entering something, not that a
  webpage is loading.
- **`WindowManagerContext.tsx`** — a reducer holding real window state:
  position, size, z-order, minimized/maximized, keyed by a stable id per
  open module instance. Opening an already-open module focuses it rather
  than duplicating it; closing, minimizing, maximizing, dragging and
  resizing are all real reducer actions, not CSS tricks. Deliberately
  *not* persisted to `src/lib/store.ts` — window layout is ephemeral UI
  chrome, not business data, and resets on reload the way a real OS's
  window positions don't survive a full power-cycle either.
- **`Window.tsx`** — the actual draggable, resizable frame: mouse-driven
  drag on the titlebar, a resize handle, minimize/maximize/close buttons,
  double-click-titlebar-to-maximize. No drag/resize library — plain
  `mousedown`/`mousemove`/`mouseup` listeners attached to `window` for the
  duration of the gesture, consistent with the rest of the stack's "no
  dependency you don't need" discipline.
- **`Desktop.tsx`** — the wallpaper, a curated column of desktop icons
  (double-click to open, matching real OS semantics), and the render loop
  over open windows. It also owns the one piece of routing logic left: a
  `useLocation()` effect that opens a window when the URL matches
  `/modules/:slug` (so old links, `Link`s inside module components, and
  bookmarks all still work) and opens `CI Home` by default the first time
  the OS reaches `/`. The URL is a way *in* — a link opens a window — not
  a source of truth for everything that's open; several windows can be
  open under one address bar entry, the same tradeoff any browser-based
  multi-window surface makes.
- **`Taskbar.tsx`** and **`StartMenu.tsx`** — replace the old sidebar and
  top search bar with one pattern instead of two: Start is both "browse
  every module by category" and "type to find one," the way a real OS
  launcher is, rather than a permanent tree plus a separate search box.
  The taskbar lists open windows (click to focus, click again to
  minimize — standard taskbar semantics) and carries the one piece of
  system chrome that's always visible regardless of what's open: a live
  clock and an unread/pending-approval count.
- **`ModuleWindowContent.tsx`** — what actually renders inside a window's
  body. This is a near-verbatim port of what the old `ModulePage.tsx`
  did (module recap header + `MODULE_COMPONENTS[module.id]`, or the
  honest "not built yet" placeholder for the 48 still `planned`) — the
  *content* logic didn't need to change at all, only its container. Every
  module component in `src/modules/` is untouched by this rewrite; the
  same 42 built modules run today, just inside window chrome instead of
  a routed page.

`src/pages/ModulePage.tsx`, `src/components/Sidebar.tsx` and
`src/components/TopBar.tsx` are gone — replaced, not kept as an
alternate "classic" mode, because a shell that half-feels like an OS
isn't the thing being built. `src/pages/Home.tsx` survives as `CI Home`'s
window content (registered in `MODULE_COMPONENTS` like every other
module — there's no special-cased home page anymore, just a module that
happens to auto-open first).

## Two shells, not one shrunk to fit — and an install, not just a tab

A floating, draggable, resizable window is a desktop-mouse idea. No
handheld device has ever shipped that metaphor — not Palm OS, not the
Sony Ericsson P800, not iOS, not Android — because you can't drag a
titlebar with a thumb on a 6-inch screen and there's no reason to want
to. Below `COMPACT_BREAKPOINT` (720px, in `Desktop.tsx`), the app doesn't
shrink the desktop down; it swaps to a completely different shell built
for the constraint: **`CompactShell.tsx`**. One app fills the screen at a
time. A back button (`‹ Home`) returns to a home-screen icon grid — the
same `WindowManagerContext` state, just rendered differently: the
foreground module is whichever window is `activeId` and not `minimized`;
"Back" doesn't close it, it minimizes it, so it keeps running in the
background and reappears instantly in a "Running" strip on the home
screen, the way switching apps on a real phone never actually quits them.
Both shells read the exact same window-manager state and the exact same
`MODULE_COMPONENTS` — a module built once runs correctly in a floating
860×580 window and in a full-screen phone view, because it was already
required to work as small as 360×240.

The other half of "you shouldn't need to exit" is literal, not just a
feeling: Ci is installable. `public/manifest.webmanifest` plus the
`apple-mobile-web-app-capable` / `msapplication-*` meta tags in
`index.html` mean "Add to Home Screen" on iOS/Android or "Install" in any
Chromium or Safari desktop browser puts a real icon in the dock, Start
menu, or home screen — launching with **zero browser chrome**, no address
bar, no tabs, indistinguishable at a glance from a native app. A minimal
network-first service worker (`public/sw.js`) caches what it fetches so a
second launch is instant and the shell still opens offline, while never
pinning you to a stale build — it always tries the network first and only
falls back to cache when there isn't one. This is the honest version of
"one OS-feeling app on Windows, Mac, and mobile": Ci cannot replace the
kernel underneath any of those, but it can be the one icon you open and
never need to leave, on all three, which is the actual thing being asked
for.

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

Forty-two modules — nearly half the full map — are wired up end-to-end against the one shared dataset:

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
| CI Recruit | Business | Hiring a candidate calls addEmployee() — a real CI HR record, not a status label |
| CI POS | Business | Sells against real CI Inventory stock via a second, independent code path from CI Sales |
| CI Legal | Control | Reads CI Contracts' at-risk list directly — zero duplicated logic |
| CI Approval Center | Control | Real queue, now rendering two different payload kinds |
| CI Audit | Control | Real timeline of every human, agent and system action |
| CI Logistics | Business | Real dispatch → in-transit → delivered ladder against real customers |
| CI Assets | IT | Live depreciation formula; assignable to real CI HR employees |
| CI Knowledge | Intelligence | First non-transactional module — durable content, not a status ladder |
| CI Chat | Communicate | First synchronous module — persisted channels and messages |
| CI Forms | Work | First module other modules are *consumed through* — a submission creates a real ticket or candidate, not a stored blob |
| CI Search | Files | Searches real records across all 36 live modules — distinct from the module-name search in the top bar |
| CI Sign | Files | Signing calls addDriveFile() directly — a real document lands in CI Drive |
| CI Meet | Communicate | Reads CI Calendar's meetings; ending one creates real CI Tasks from typed action items |
| CI Scan | Files | A text-based stand-in for OCR that still produces a real record and a real filed document |
| CI Archive | Files | A filtered view of CI Drive's own files — archiving there changes what Drive itself shows |
| CI Assistant | Intelligence | Ask CI given its own address — the same component embedded on Home, not a copy |
| CI Website | Create | A third front door onto submitContactForm() — the public-site path costs nothing structurally |
| CI Marketplace | Build | Real on/off switches for the built-in cross-module automations — verified to actually change behavior |
| CI Governance | Control | A spend threshold read by createPurchaseOrder() itself, not a display of a policy nobody enforces |
| CI Data Hub | Build | CSV import/export straight into CI Contacts' real list — a fourth front door, after Forms, Website and manual entry |

The other 48 are registered with real names, categories, descriptions and
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
`src/modules/approvals/Approvals.tsx`. The pending-queue logic, the approve/reject
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

## A form is an entry point, not a data type

CI Forms has no `Form` entity in `AppState` and no generic "submissions"
table beyond a lightweight history list for its own screen. A form
submission calls the exact same mutation function a human clicking a
button elsewhere would call — `submitContactForm()` calls `createTicket()`,
the same function CI Customer Service's own logic would use; a job
application calls `addCandidate()`, the same one CI Recruit's "+ Add
candidate" button would call if it had one. The form is a UI in front of
an existing capability, not a new capability of its own.

That's deliberate, and it's the same reasoning behind
`CI ORCHESTRATOR`/Ask CI: neither a form nor a natural-language request
should need its own private write path into the data. Both are just
different front doors onto the same set of mutation functions every
module already exposes — which is also why adding a third front door
later (an API call from `CI API HUB`, say) costs nothing structurally.

## Stack

- **Vite + React + TypeScript** — fast local iteration, no framework
  lock-in yet. Nothing here depends on Vite specifically; the module
  pattern (registry → route → component) ports cleanly to Next.js or
  anything else if/when SSR, multi-tenant auth, or a real backend push the
  decision that way.
- **Tailwind** for styling — utility classes keep 90 module screens
  visually consistent without a hand-maintained component library yet.
- **React Router**, used narrowly — no `<Routes>`/`<Route>` matching
  anymore, just `useLocation()` inside `Desktop.tsx` so a `/modules/:slug`
  URL or a `Link` still opens the right window. The desktop itself is one
  component tree, not route-swapped pages, which is what lets several
  modules stay open — and stay real windows — at once.
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
4. **CI Autonomy Control** as an actual policy surface for Ask CI
   specifically — today `needsApproval` is still hardcoded per intent in
   `ask-ci.ts`. CI Governance now proves the pattern this needs
   (`state.governance` read by a mutation function, edited through a real
   module screen) for one rule, a purchasing threshold; Autonomy Control
   is the same pattern applied to Ask CI's own approval gate.
5. Promote the next handful of modules from `planned` to `live`. 42 of 90
   are done — nearly half the map. Natural next candidates: **CI
   Workflow Engine** (the "system" actor pattern and CI Marketplace's
   automation toggles are both hand-written today; Workflow Engine is
   where a human authors a new "when X in module A, do Y in module B"
   rule instead of it requiring a code change), **CI Industry Packs**
   (CI Marketplace toggles automations one at a time; a pack would be a
   named bundle of settings — targets, thresholds, automations — applied
   together), and **CI Identity** (priority 2 above, now overdue: every
   module still trusts the single hardcoded `CURRENT_USER`).

## Two flavors of control plane: automations and policy

CI Marketplace and CI Governance both let a human change another
module's behavior without touching code, but they're deliberately
different shapes, because they answer different questions:

- **CI Marketplace** (`state.automations: Record<string, boolean>`)
  answers "should this cross-module side effect happen at all." Each
  entry in `AUTOMATION_CATALOG` names an `if` check already sitting
  inside a mutation function — `decideQuote()` checks
  `automations["quote-accepted-advances-deal"]` before calling
  `moveDealStage()`, `decideApproval()` checks
  `automations["po-approved-receives-stock"]` before calling
  `receiveStock()`. Turning one off doesn't remove a feature; it makes a
  human keep a step that was being done for them.
- **CI Governance** (`state.governance`) answers "where's the line,"
  not "on or off." `poAutoApproveThreshold` is a number
  `createPurchaseOrder()` compares an amount against, and crossing it
  changes which code path a new PO takes entirely — auto-approved with a
  `system`-actor audit entry below the line, a normal `CI Approval
  Center` request above it.

Both are proof that "a human sets a rule here, a mutation function
somewhere else reads it" is a general pattern this codebase can keep
reusing — not something built once for these two cases. `CI WORKFLOW
ENGINE` and `CI AUTONOMY CONTROL` are where it goes next: the same shape,
generalized from a fixed catalog of hardcoded checks to rules a human
authors at runtime.

## A bug the verification process actually caught

`searchModules()` (used by the top bar's search and by Ask CI's keyword
fallback) shipped in the very first commit checking whether a module's
name/description/keywords *contained the entire query string* — which
only ever matches when someone types a short phrase that happens to be a
literal substring of a module's text. It was never wrong for the two
demo scenarios or single-word searches, so nothing caught it through many
rounds of verification. It surfaced only when CI Assistant was given its
own page and "I need a video editor" — one of the three example buttons
that had existed since the first commit — was actually clicked for the
first time and returned "no module matches." The fix (score modules by
how many significant words match, after stripping stopwords like "i" and
"need") is in the same commit as CI Archive/Assistant/Website. The lesson
this leaves for the roadmap: **exercising every UI affordance at least
once, not just the paths a given batch's work touches, is part of what
"verified" needs to mean going forward** — a passing build and a
correct-looking screenshot are necessary, not sufficient.
