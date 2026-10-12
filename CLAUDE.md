# CLAUDE.md

## What this is

Phase 2 of the **Customer Notification Hub (CNH)** console: Import templates and Broadcast message, on top of the Phase 1 notification list. This repo is a **rebuild on webds** of Korn's prototype (https://cnh-tm-phase2.vercel.app, built on `@bbl-web/ui-components`), started 2026-10-12 to enhance it. The original source was not available; `.reference/` holds the deployed build and the app code cut out of it (see `.reference/README.md`).

The webds flow archive already records this delivery as `cnh-phase2` (`get_flow`): its routes, rulings, open questions P2-1…P2-20 and gaps. Read it before changing a flow.

## Commands

```bash
npm run dev     # http://localhost:5175 (strictPort; 5173/5174 belong to other projects)
npm run build   # typecheck + production build
npm run audit   # webds consumer audit
node scripts/webds-add.mjs <item> …   # install webds registry items verbatim
```

Reference build, for side-by-side checks: `cd .reference/cnh-tm-phase2 && python3 -m http.server 5176 --bind 127.0.0.1`.

Headless Chrome on this machine needs `--no-proxy-server`, or every request to the dev server hangs.

## Routes

Hash routes, one per state, the same as the original build — the flow archive and the Task flow button point at them. `src/App.tsx` owns them all.

- Notification management: `#/list`, `#/list/{loading,error,empty}`, `#/list/import[/<state>]`, `#/create[/loading|/fail]`, `#/edit/<id>`
- Broadcast: `#/broadcast`, `#/broadcast/{empty,submitted,draft-saved}`, `#/broadcast/create[/<preset>]`, `#/broadcast/view/<id>`, `#/broadcast/edit/<id>`
- `#/login`

`?panel=0` hides the Task flow button (the task flow renders screens in iframes with it). `?flow=1` opens the task flow on load.

## Design system — webds

Same rules as the CMS prototype:

- **Nothing the registry ships may be hand-written.** Install with `scripts/webds-add.mjs`; files land at `src/<target>` byte-identical, so `npm run audit` can tell an install from an edit.
- **Never edit `src/components/bbl/`, `src/components/patterns/` or `src/components/tools/`.** They are installed.
- `@/bbl/*` and `@/patterns/*` alias onto those folders (`vite.config.ts`, `tsconfig.app.json`).
- **Every value is a token.** No literal hex. App code imports `cn` from `@/lib/cn` (twMerge); `@/lib/utils` is the installed clsx-only one.
- No dark mode. Fonts come from webds (`styles/bbl-fonts.css`).
- CNH's own patterns were measured on this product: `product-shell`, `sign-in-split`, `console-page`, `form-section-card`, `form-field`, `detail-drawer`, `profile-menu`. Prefer them.
- Tailwind scans `src/` only (`source('./')` in `src/index.css`), so the 6 MB reference bundle stays out of the build.
- `noUnusedParameters` is off because the installed `task-flow-view` has an unused map parameter.

## Content rule

Copy, labels, statuses and fixtures are transcribed from the original build (`.reference/cnh-tm-phase2/app-extract.js`), never composed. A changed label is a decision; record it.

## Layout of the code

```
src/App.tsx                 routes and app state
src/shell/AppShell.tsx      product-shell + profile row/menu + log-out dialog
src/pages/Login.tsx         sign-in-split
src/pages/notifications/    list (Dashboard) + Import dialog
src/pages/template/         Create/Edit notification + view drawer
src/pages/broadcast/        list, drawer (list/), Create/Edit (create/)
src/data/                   records, copy and rules ported from the original
src/prototype/              Task flow runner (dev chrome, not product UI)
.reference/                 the original build, for comparison only
```
