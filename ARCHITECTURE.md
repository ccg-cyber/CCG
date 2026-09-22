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

## One shell, not 90 apps

Every module renders inside the same shell (`src/App.tsx`): same sidebar,
same top command bar, same user session, same permission check. A module
is a component dropped into `ModulePage`, not a separate deployable with
its own login screen. That's what makes cross-module answers possible —
`ModulePage` and every module component share the same registry, the same
`CURRENT_USER`, and (as real modules replace demos) the same underlying
data store.

## Ask CI = a thin orchestrator, built to be replaced

`src/lib/ask-ci.ts` is a deliberately small, deterministic stand-in for
`CI ORCHESTRATOR` (#85): given free text, it decides which modules are
relevant and returns a plan (which modules, what steps, whether it needs
approval). It implements the two worked examples from the product spec:

- **"Show me everything happening with Customer X"** → fans out to CRM,
  Mail, Accounting, Drive, Customer Service, Calendar and summarizes.
- **"Customer X hasn't paid, prepare a statement and email, ask before
  sending"** → drafts through Accounting → Docs → PDF → Drive → Mail, then
  stops at `CI Approval Center` instead of sending.

The point isn't the keyword matching (that gets replaced by a real LLM
router calling into `CI INTELLIGENCE CORE`). The point is the **seam**:
every module is already reachable by name from one router, and every
action that touches the outside world (sending an email, executing a
payment) already has an approval gate in the loop rather than an
afterthought bolted on later. `needsApproval` on the plan type is that
gate; `CI AUTONOMY CONTROL` (#86) is where its real policy will live.

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

Six modules are wired up end-to-end with real interactive state, chosen to
cover one from each side of the platform rather than one whole category:

| Module | Category | Proves |
|---|---|---|
| CI Home | Home | Registry-driven nav, dashboard, Ask CI |
| CI Docs | Work | Editable document surface |
| CI Mail | Communicate | List/detail pattern, multi-account-shaped |
| CI Drive | Files | File/folder browser pattern |
| CI CRM | Business | Pipeline/kanban pattern |
| CI Tasks | Work | Stateful CRUD pattern |

The other 84 are registered with real names, categories, descriptions and
keywords — visible in the sidebar and searchable — but show a "not built
yet" placeholder instead of a screen. That is intentional: the full map
should exist and be navigable before every room has furniture in it.

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

1. **Persistence** — a real data layer so CRM records, tasks, and mail
   aren't reset on refresh, and so cross-module lookups (the Ask CI
   examples) query real joined data instead of hand-written scenarios.
2. **Real auth** (`CI IDENTITY`) replacing the single hardcoded
   `CURRENT_USER`.
3. **A real LLM-backed Ask CI** replacing the regex router, calling actual
   module actions instead of returning canned steps.
4. **CI Approval Center** as a real queue, not a static list on the
   dashboard — so `needsApproval` plans actually land somewhere and can be
   approved or rejected.
5. Promote the next handful of modules from `planned` to `live` based on
   what a real pilot customer actually needs first — likely Sheets,
   Calendar, Invoicing, and Approvals, since Docs/Mail/CRM/Drive/Tasks
   already prove the pattern.
