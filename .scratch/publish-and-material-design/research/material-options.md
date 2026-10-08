# Research: Material Web components vs hand-rolled Material 3 CSS

Ticket: `03-material-options` (research). Researched 2026-10-08. Branch: `research/material`.

## Bottom line

Hand-rolled CSS using Material 3 tokens fits this site better. Material Web (`@material/web`) is a maintained-by-volunteers library with documented buildless use only "for prototyping", and its own issue tracker shows open screen-reader and ARIA bugs. Using the web components would trade a no-build site for a CDN dependency on a library Google has stopped staffing.

## Material Web components

### Status and maintenance
- README banner: "MWC is in maintenance mode pending new maintainers." [README](https://github.com/material-components/material-web)
- Announcement (2024-06-10): MWC "is not deprecated or going away, but Material Design is no longer actively staffing its development." Expect "minimum maintenance"; no new features or components planned; small PRs reviewed case by case. A May 2025 maintainer reply says Material 3 Expressive features are not planned. The thread does not promise bug or security fixes. [Discussion #5642](https://github.com/material-components/material-web/discussions/5642)
- It is still moving: npm `@material/web` latest is 2.5.0, published 2026-07-15 ([npm registry](https://registry.npmjs.org/@material/web)). Recent commits (Oct 2026) include a `labs` snackbar component ([commits](https://api.github.com/repos/material-components/material-web/commits?per_page=3)). Treat this as volunteer-paced, not a roadmap you can rely on.
- Other numbers on the repo page: Apache-2.0, 122 open issues, 62 open PRs.

### Use without a bundler
- Supported only as a prototyping path: import map mapping `"@material/web/"` to `https://esm.run/@material/web/`, then `import '@material/web/all.js'`, and optionally push the typescale stylesheet onto `document.adoptedStyleSheets`. The quick start says "For production, follow the install and build steps below" (npm plus a bundler). [Quick start](https://github.com/material-components/material-web/blob/main/docs/quick-start.md)
- So it works on a static page, but the maintainers do not endorse it for production, and it makes the site depend on a third-party CDN (esm.run) at runtime.
- Browser support: Chrome/Edge 120+, Firefox 119+, Safari 16.4+. [support.md](https://github.com/material-components/material-web/blob/main/docs/support.md)
- Bundle size is documented in `docs/size.md` (not read in detail).

### Accessibility
- The README claims only that it "helps build beautiful and accessible web applications." No WCAG conformance statement was found in the README, `support.md`, or the button docs.
- Component docs give per-component a11y notes. Example, button: add `aria-label` when the visible label needs more context; disabled buttons are not keyboard-focusable, "soft-disabled" ones are. [Button docs](https://github.com/material-components/material-web/blob/main/docs/components/button.md)
- Components are shadow-DOM custom elements. This is a known friction point for cross-root ARIA (label/describedby links across shadow boundaries) and form association.
- Open issues in the official tracker (search "a11y / accessibility / screen reader", 56 results, first page read) include: #5136 md-select with JAWS; #5760 md-menu "Blocked aria-hidden... descendant retained focus"; #5197 switch checkmark "inaccessible color in some generated dark themes"; #5384 Esc on dialog leaves scrim; #5685 `:focus-visible` set on click in a label child; #5514 dialog/select on Safari. [Issue search](https://github.com/material-components/material-web/issues?q=is%3Aissue+is%3Aopen+a11y+OR+accessibility+OR+screen+reader)
- The `accessibility` label search returned 0 results, so the repo does not triage a11y under a label; do not read that as "no a11y bugs."
- Given maintenance mode, these are unlikely to be fixed by Google staff. Eric would need to audit each component used (including NVDA/JAWS) and carry workarounds.

### Fit for this site
The site's pages are tables, rankings, and nav, not form-heavy. The components that would add value (navigation bar/tabs, buttons, selects, dialogs) are the ones with listed open issues. Little to gain.

## Hand-rolled CSS with Material 3 tokens

### What the tokens are
- Material Web's theming docs describe three token layers as CSS custom properties: reference (`--md-ref-*`), system (`--md-sys-*`, e.g. `--md-sys-color-primary`), and component tokens. On the web, "design tokens are CSS custom properties and can be scoped with CSS selectors." [Theming](https://github.com/material-components/material-web/blob/main/docs/theming/README.md)
- The M3 design-token overview is at <https://m3.material.io/foundations/design-tokens/overview>. That site is client-rendered; the fetch tool returned only the title, so claims here come from the GitHub docs, not m3.material.io text. Verify the M3 pages in a browser before relying on them in the spec.
- The theming doc does not say tokens work without the web components; component tokens are tied to `md-*` elements. System tokens are plain CSS variables, so a hand-rolled stylesheet can define and use the same names (`:root { --md-sys-color-primary: ... }`) as its own convention. This is an inference, not an official statement.

### Build needs and maintenance
- No build step, no runtime dependency. One CSS file with `:root` tokens plus a light/dark override via `prefers-color-scheme`.
- Colour roles can be generated once with Material's theme builder (<https://material-foundation.github.io/material-theme-builder/>, not fetched here) and pasted in as CSS variables.
- Maintenance is Eric's: no upstream fixes, but also no upstream regressions or CDN outages.

### Accessibility
- Full control over native elements (`<a>`, `<button>`, `<table>`, `<nav>`) with built-in semantics, which matches the existing audit approach (skip links, current-page nav style, target sizes, NVDA pass in `.scratch/power-ranking-app/`).
- Cost: Eric must implement focus rings, 24px+ targets, state layers, and contrast pairs (`on-*` roles) himself and re-audit. Tokens give the values; M3 contrast pairing must be checked, not assumed.

## Comparison

| | Material Web | Hand-rolled M3 CSS |
|---|---|---|
| Upstream status | Maintenance mode, volunteer-paced | N/A (own code) |
| No-bundler use | Import map + esm.run, "prototyping" only | Native |
| Runtime dependency | Third-party CDN, ES modules | None |
| A11y | Shadow DOM; open ARIA/SR issues; per-component audit | Native semantics; own audit |
| Look fidelity | Exact M3 components | Approximate M3 |
| Effort | Low to start, ongoing audit risk | Moderate CSS up front |

## Open questions for the decision
- How "Material" must it look: tokens, type and shape only, or exact component behaviour (ripples, state layers)?
- Is a CDN runtime dependency acceptable for a public site for parents?
- Self-hosting a vendored copy of `@material/web` (copy files into the repo, no bundler) was not investigated; the quick start does not document it.
- Whether M3 Expressive tokens are wanted (not supported by MWC per the May 2025 reply).
