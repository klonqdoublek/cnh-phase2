# .reference/

`cnh-tm-phase2/` is the deployed build of the original Phase 2 prototype
(https://cnh-tm-phase2.vercel.app, owner Korn, stack `@bbl-web/ui-components`),
mirrored on 2026-10-12 so it can be compared side by side with this rebuild.
The source repo was not available.

- `index.html`, `assets/`, `img/`, `illustrations/`, `samples/`, `webds-icons/`, `bbl-logo.svg` —
  the build as served. Serve it with `python3 -m http.server 5176 --bind 127.0.0.1`
  from that folder and open `http://127.0.0.1:5176/#/broadcast`.
- `app-extract.js` — the app's own code, cut out of the bundle and prettified
  (library code removed). Local variable names are minified; function, constant
  and copy names are the original ones.
- `app-extract.css` — the app's own stylesheet, cut out of the bundle.

Nothing here is imported by `src/`. The folder starts with a dot so the webds
audit (`npm run audit`) skips it; it holds the original's literal values.
`webds-icons/` is a symlink to `public/webds-icons`, not a mirror — the
original serves the same files (checked byte for byte on `plus-16.svg`).
