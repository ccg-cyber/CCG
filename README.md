# Ci Business OS

One workspace. One intelligence. The goal is that Ci can replace almost
everything a company normally installs or subscribes to on its PCs — one
account, one permission model, one search index, one audit trail — with AI
agents doing the cross-application work a person used to do by hand.

This repository is the first slice of that: a working shell with the full
90-module architecture registered and navigable, six modules built
end-to-end to prove the pattern, and an "Ask CI" command bar that
demonstrates cross-module orchestration.

Read [`ARCHITECTURE.md`](./ARCHITECTURE.md) for why it's built this way,
and [`MODULES.md`](./MODULES.md) for the full module map (generated from
the code, always current).

## What's here right now

| Module | Status |
|---|---|
| CI Home | ✅ Live — dashboard, notifications, approvals, Ask CI |
| CI Docs | ✅ Live — editable document surface |
| CI Mail | ✅ Live — inbox, message detail |
| CI Drive | ✅ Live — file/folder browser |
| CI CRM | ✅ Live — pipeline board |
| CI Tasks | ✅ Live — to-do list with priorities |
| 84 more modules | ⬜ Registered, searchable, not yet built |

Every other module in the master map — Sheets, ERP, HR, Payroll, Agents,
Approval Center, Security Center, and 78 more — is registered in
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
  - _"Customer X hasn't paid, prepare a statement and draft a follow-up
    email"_ — routes through Accounting → Docs → PDF → Drive → Mail, then
    stops at Approval Center instead of sending anything.
  - _"Show me everything happening with Customer X"_ — fans out across
    CRM, Mail, Accounting, Drive, Support and Calendar.
- Use the top search bar or the sidebar to jump into any of the 90
  modules — live ones show a working screen, everything else shows what
  it's scoped to become.

## Project structure

```
src/
  lib/
    types.ts        Core types: ModuleDefinition, Role, Permission, AuditEvent
    categories.ts    The 10 top-level categories (+ Home)
    registry.ts      All 90 modules — the single source of truth
    permissions.ts   Minimal RBAC stub (CI Identity / CI Permissions)
    ask-ci.ts        Orchestration stub (CI Orchestrator)
  components/        Shell chrome: Sidebar, TopBar, ModuleCard, AskCiBar
  pages/             Home (dashboard) and ModulePage (generic module shell)
  modules/           Real implementations for the six live modules
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
