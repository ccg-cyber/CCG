# Contributing to Ci Business OS

This project is a registry-driven module platform: almost every
contribution is either **(a) a new module registration**, **(b) building
out a module that already exists as a placeholder**, or **(c) shell/core
work** (routing, permissions, search, the Ask CI router). Knowing which
one you're doing decides where to start.

## Before you start

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # typecheck (tsc -b) + production build — must pass before a PR
```

There's no test suite yet. Until there is, `npm run build` passing is the
minimum bar — it runs a full TypeScript check across the app.

## Registering a new module

If a module you need isn't in [`MODULES.md`](./MODULES.md) yet:

1. Add one object to `MODULES` in `src/lib/registry.ts`:
   ```ts
   { id: "ci-example", slug: "example", name: "CI Example",
     category: "business", status: "planned",
     description: "One sentence describing its scope.",
     keywords: ["example", "synonym"] }
   ```
2. `category` must be one of the ten locked groups in
   `src/lib/categories.ts` (`work`, `communicate`, `files`, `business`,
   `create`, `it`, `build`, `intelligence`, `control`, `executive`) or
   `home`. Don't invent an eleventh category without discussing it first —
   the hierarchy is meant to stay fixed while modules move within it.
3. Run `node scripts/gen-modules-doc.mjs` and commit the regenerated
   `MODULES.md` alongside your registry change.

That's it — the module now appears in the sidebar, in global search, and
in Ask CI's keyword matching, with a placeholder screen.

## Building out a module

1. Create `src/modules/<slug>/<Name>.tsx`, where `<slug>` matches the
   module's `slug` in `registry.ts` exactly and `<Name>` is that slug in
   PascalCase (`sign` → `Sign.tsx`, `customer-service` →
   `CustomerService.tsx`, `hr`/`crm` → `HR.tsx`/`CRM.tsx`, acronym kept
   uppercase). This mapping is fixed and never abbreviated further —
   anyone should be able to find a module's implementation from its name
   alone, without grep. Keep it a self-contained component — it should not
   assume anything about the shell beyond what's in `src/lib/`.
2. Register it in `MODULE_COMPONENTS` in `src/lib/moduleComponents.tsx`.
3. Flip the module's `status` in the registry: `"planned"` →
   `"scaffolded"` (opens as a window with placeholder content) → `"live"`
   (real, working UI).
4. Regenerate `MODULES.md`.

A module reaching for shared state (a customer record CRM and Mail both
need, for example) should go through `src/lib/` rather than importing
another module's internals directly — that boundary is what keeps 90
modules from becoming 90 tangled ones.

## Core / shell changes

Changes to `src/lib/types.ts`, `permissions.ts`, `ask-ci.ts`,
`categories.ts`, or the OS shell (`src/os/` — `Desktop.tsx`,
`Window.tsx`, `WindowManagerContext.tsx`, `Taskbar.tsx`, `StartMenu.tsx`,
`ModuleWindowContent.tsx`, `BootScreen.tsx`) affect every module at once.
Call this out explicitly in the PR description — what changes for
existing live modules, and why it doesn't break the placeholder windows
for the other ~48.

A module's own component (`src/modules/<slug>/<Name>.tsx`) should never
assume it's running full-page — it renders inside a resizable window
that can be as small as 360×240, so design for that, not for a browser
tab.

## Commit and PR conventions

- Conventional commit style: `feat(crm): add deal detail view`,
  `fix(ask-ci): match "overdue" as unpaid-invoice intent`,
  `docs(architecture): note persistence as next milestone`.
- PR description should say: what changed, why, and — if it touches the
  registry or shell — which modules or categories it affects.
- Keep changes scoped to one module or one clear cross-cutting concern per
  PR. A PR that touches five unrelated modules is five PRs.

## Reporting issues

Include: what module/category it's in (or "shell/core" if not
module-specific), what you expected, what happened, and how to reproduce
it. If it's a data/architecture gap (a module that should exist but
doesn't, or belongs in a different category), say so directly — the
module map in `MODULES.md` is expected to evolve.

## Security

Don't open a public issue for a security concern. This is an early-stage,
mock-data prototype with no real backend or secrets yet, but the same
discipline should start now: report privately rather than filing publicly.
