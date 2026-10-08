# Research: open-source design systems for the BAFL Peewee site

Ticket: `07-design-system-options` (research). Researched 2026-10-08. Branch: `research/design-systems`.

Context: small static HTML/JS site, no build step today. Owner is a 13-year accessibility professional, beginner developer, uses React at work. Main goal is a good mobile experience; wants comprehensive docs, open source, accessible.

## Bottom line

- **Only four candidates can be used with no build step and no React:** USWDS, GOV.UK Frontend, Carbon Web Components, and Material Web (the last is "prototyping only" per its own docs). Hand-rolled Material 3 token CSS also needs no build.
- **USWDS and GOV.UK Frontend are the best fit on the stated criteria** (plain HTML/CSS/JS, precompiled download, strongest published accessibility claims and docs). Both look like a government site and carry caveats (below). Neither is Material.
- **MUI, React Aria, Radix, shadcn/ui and Primer React all need React plus a bundler.** They only make sense if the site is rebuilt as a React app, which is a bigger decision than choosing a look (ticket map: "no framework, no build step" revisit is still open).
- **Carbon Web Components** works from a CDN, but v3 is a breaking change in progress and it sends IBM Telemetry by default (check opt-out; matters for a parents-facing site).
- **Primer CSS is in "KTLO mode"**, so it is not a good new adoption.
- No candidate lets you skip an accessibility audit. The ones with the best published claims (USWDS, GOV.UK) both say so explicitly.

## Summary table

"No-build" = usable by copying/linking files into a static site, no npm/bundler. Versions from the npm registry on 2026-10-08.

| System | Version | License | No-build, no React? | Published a11y claim | Notes |
|---|---|---|---|---|---|
| USWDS | 3.14.0 | CC0 / public domain, plus font and icon licences | Yes (precompiled zip) | WCAG 2.0 AA legal baseline, aims 2.1 AA; Section 508; VPAT 2.5 | Mobile-first media queries; US-gov look |
| GOV.UK Frontend | 6.5.1 | MIT (code); content under OGL v3 | Yes (precompiled zip, "testing only") | "Will help your service meet level AA of WCAG 2.2" | Branding rules for non-gov use; no Sass customisation in precompiled |
| Carbon Web Components | 2.65.0 | Apache-2.0 | Yes via CDN | Follows IBM checklist "based on WCAG AA" | v3 breaking; telemetry |
| Material Web | 2.5.0 | Apache-2.0 | Prototype only (import map + esm.run) | None | Maintenance mode; see `material-options.md` |
| Hand-rolled M3 tokens | n/a | n/a | Yes | Your own | See `material-options.md` |
| MUI (Material UI) | 9.4.0 | MIT | No: React + Emotion | No statement found on the pages read | Material Design 2 per docs |
| React Aria Components | 1.22.0 | Apache-2.0 | No: React | Tested on VoiceOver, JAWS, NVDA, TalkBack | Unstyled; best a11y behaviours |
| Radix Primitives | 1.7.0 (`radix-ui`) | MIT | No: React | Follows WAI-ARIA APG, "basic keyboard support" | Unstyled; maintenance question |
| shadcn/ui | CLI 4.21.4 | MIT | No: React + Tailwind | "Accessible", no detail | Copies code into your repo |
| Primer React | 38.40.1 | MIT | No: React 18/19 | Not found | GitHub look |
| Primer CSS | 22.3.2 | MIT | Sass source only documented | n/a | "KTLO mode" |

## A. Works without a build step (static site, no React)

### USWDS (U.S. Web Design System)
- **Docs:** large site with 47 listed components plus patterns, design tokens, utilities and templates. [Components](https://designsystem.digital.gov/components/overview/)
- **No-build use:** the README says to download the package from the latest release, uncompress it, then reference `uswds-init.min.js` and the minified stylesheet in `<head>`, and load `uswds.min.js` at the end of `<body>`. [README](https://github.com/uswds/uswds). The compile docs cover only the npm + Sass route and do not describe the download, so the precompiled path is documented only in the README. [Compile page](https://designsystem.digital.gov/documentation/getting-started/developers/phase-two-compile/)
- **License:** mostly worldwide public domain / CC0 1.0. Not public domain: fonts (Source Sans Pro, Merriweather, Public Sans, Font Awesome under SIL OFL 1.1), Roboto Mono and Google Material Icons (Apache-2.0), some normalize files (MIT). GSA keeps its trademarks. [LICENSE.md](https://github.com/uswds/uswds/blob/develop/LICENSE.md). npm lists the licence as "SEE LICENSE IN LICENSE.md".
- **Accessibility:** legal baseline WCAG 2.0 AA, aims for 2.1 AA, works toward some 2.2 criteria. Accessibility conformance report (VPAT 2.5) assessed 44 components of USWDS 3.11.0 in March 2025, published May 2025; per-component status is still marked "(in progress)". Testing: VoiceOver and JAWS, keyboard, zoom, touch; pa11y and axe on every change. It says "Building with accessible USWDS components does not guarantee an accessible service." [Accessibility](https://designsystem.digital.gov/documentation/accessibility/). The README states it "conforms to the standards of Section 508" and "meets WCAG 2.0 AA". [README](https://github.com/uswds/uswds)
- **Mobile:** README: "Media queries are built mobile first." [README](https://github.com/uswds/uswds). The component overview page had no mobile-specific guidance.
- **Fit:** strongest docs and a11y reporting of the candidates. Look is plainly "U.S. government". Customising (colours, fonts) is designed around Sass tokens, which needs a build; with the precompiled files you would override with your own CSS. *Not verified:* how much theming the precompiled CSS allows.

### GOV.UK Frontend
- **No-build use:** download `release-<VERSION>.zip` from GitHub releases, copy `assets`, the `.css` and the `.js` files into the public folder, and link them. The docs warn: "In your live application, you should install with Node.js package manager (npm) instead." Precompiled limits: cannot change Sass settings such as colours or fonts, cannot import individual components, cannot use Nunjucks macros. [Precompiled files](https://frontend.design-system.service.gov.uk/install-using-precompiled-files/)
- **License:** code is MIT; content is under Open Government Licence v3.0 "except where otherwise stated". [README](https://github.com/alphagov/govuk-frontend). The licence pages read did not say who may use the GOV.UK brand, Crown crest or Transport font. Guidance for non-government use exists ("without GOV.UK branding", needs v6.3.0 or later): use the Generic header, set `$govuk-font-family` to a different font stack, redefine the brand colour in Sass, and replace favicons and images. [Without branding](https://frontend.design-system.service.gov.uk/using-govuk-frontend-without-govuk-branding/). Note that this guidance assumes Sass, which the precompiled route cannot do.
- **Accessibility:** using Frontend "will help your service meet level AA of WCAG 2.2"; you "must still check" your service, especially if you modify components. [README](https://github.com/alphagov/govuk-frontend). The design-system accessibility page read gave no version/level claim, no AT testing details and no known-issues list; it links to an accessibility statement that could not be fetched (404 at the URL guessed). [Accessibility page](https://design-system.service.gov.uk/accessibility/)
- **Browsers:** grade A to D; JavaScript enhancements run only in grades A, B and C. [README](https://github.com/alphagov/govuk-frontend)
- **Mobile:** not verified from a primary source in this pass.
- **Fit:** excellent form, error and content patterns; plain HTML. Visually distinctive and tied to government services, and the non-gov branding route fights the precompiled limits.

### Carbon Web Components (IBM Carbon)
- **No-build use:** "All components are also available via CDN" from v1.16.0, with a module script per component; npm/ESM use needs a bundler such as Vite. Latest CDN example in docs is v2.24.0 while npm latest is 2.65.0, so the docs example is stale. [Carbon WC docs](https://carbondesignsystem.com/developing/frameworks/web-components/)
- **v3 risk:** README says in v3 "importing a component's class file no longer registers its element", and lists several v2 features deprecated. [README](https://github.com/carbon-design-system/carbon/blob/main/packages/web-components/README.md)
- **Telemetry:** the package uses IBM Telemetry to collect anonymized usage metrics, with opt-out instructions. [README](https://github.com/carbon-design-system/carbon/blob/main/packages/web-components/README.md). Check what it does at runtime for visitors vs install time (not verified).
- **License:** Apache-2.0 (npm and README).
- **Accessibility:** "Carbon components follow the IBM Accessibility Checklist which is based on WCAG AA, Section 508, and European standards"; colour themes "strive to comply" with WCAG 2.1 AA contrast. No test results, no named screen readers, no known limits. [Carbon a11y](https://carbondesignsystem.com/guidelines/accessibility/overview/)
- **Styles:** need `@carbon/styles` (Sass) for full styling; a plain-CSS CDN path for styles was not verified.
- **Fit:** enterprise/dashboard look, shadow-DOM custom elements (same cross-root ARIA friction noted for Material Web). Heavier than this site needs.

### Material Web and hand-rolled Material 3 tokens
Already researched on branch `research/material` (file `.scratch/publish-and-material-design/research/material-options.md`). Key points: Material Web is in maintenance mode, buildless use is "prototyping" only, open screen-reader/ARIA issues; hand-rolled CSS with `--md-sys-*` token names is the buildless Material route. Registry check: `@material/web` 2.5.0, Apache-2.0, published 2026-07-15.

## B. Needs React and/or a bundler

All of these were verified as React-only via npm peer dependencies (2026-10-08). They would require moving this site to a build step (for example Vite + React), which is the open "revisit no framework" question in the map.

### MUI (Material UI)
- "An open-source React component library that implements Google's Material Design." Docs say "Material UI supports Material Design 2"; no Material 3 statement found on the pages read. [Getting started](https://mui.com/material-ui/getting-started/)
- MIT; ~1.4k open issues. [GitHub](https://github.com/mui/material-ui). Peer deps: React 17-19, Emotion. [npm](https://www.npmjs.com/package/@mui/material)
- Accessibility: no statement on the pages read (the accessibility guide URL guessed returned 404). Not verified.
- Fit: the most direct way to get "Material" in React, but it is Material 2 look and the heaviest option.

### React Aria Components / React Spectrum (Adobe)
- "Over 50 components", unstyled ("style-free out of the box"), hooks layer (`react-aria`) and component layer (`react-aria-components`). Spectrum S2 is the styled system built on it. [react-aria.adobe.com](https://react-aria.adobe.com/)
- Licence Apache-2.0 (npm; not stated on the landing page).
- Accessibility: the strongest testing claim of the React options. Tested on VoiceOver (macOS, iOS), JAWS and NVDA (Windows), TalkBack (Android). Does not claim WCAG conformance; WCAG is a "good resource to reference". "Automated accessibility testing tools sometimes catch false positives." [Quality](https://react-aria.adobe.com/quality#accessibility)
- Mobile: touch-optimised interactions (long press, drag-off-to-cancel), behaviours work for touch screen reader users; 30+ languages, RTL. [react-aria.adobe.com](https://react-aria.adobe.com/)
- Fit: best choice if the site becomes a React app and Eric wants to own the visual design (for example M3 tokens in CSS) with trustworthy behaviour. Non-React use was not found.

### Radix Primitives
- Unstyled, "focus on accessibility, customization and developer experience". [Intro](https://www.radix-ui.com/primitives/docs/overview/introduction). MIT, "Maintained by @workos", 129 open issues, 140 open PRs on the repo page. [GitHub](https://github.com/radix-ui/primitives)
- Accessibility: "follow the WAI-ARIA authoring practices", "basic keyboard support", tested in "commonly used assistive technologies" (none named); developer must supply labels. [Accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility)
- Maintenance: secondary sources (a 2026 comparison article, aggregator pages) say development has slowed under WorkOS and that Base UI (from the MUI team) is positioned as an alternative. **Unverified opinion, no primary source found.** Check the commit history yourself.

### shadcn/ui
- "This is not a component library. It is how you build your component library." Distributes component source code via CLI; styled with Tailwind CSS ("You need to install Tailwind CSS"); supported setups are Next.js, Vite, TanStack Start, Laravel, React Router, Astro, manual React. [Docs](https://ui.shadcn.com/docs), [Installation](https://ui.shadcn.com/docs/installation), [Manual](https://ui.shadcn.com/docs/installation/manual)
- MIT per npm (`shadcn` 4.21.4). Accessibility: described as "accessible" with no standards or testing detail on the page read. Its components are built on Radix (and Base UI per a secondary source), so a11y depends on those.
- Fit: you own the code, but it needs React + Tailwind + a build and a CLI. Not Material.

### Primer (GitHub)
- Primer React 38.40.1 (MIT, React 18/19 peers). Primer CSS 22.3.2 (MIT): README says "This project is in KTLO mode!" and points to Primer React / view_components for fuller patterns. Sass source is the documented entry point; a plain `<link>`/CDN route was not documented on the page read. [primer/css](https://github.com/primer/css)
- Accessibility: the page read (primer.style/accessibility) was a landing page with no conformance claim. Not verified.
- Fit: GitHub-style look; not recommended as a new adoption.

## Cross-cutting findings

1. **Buildless is a short list.** If the build step stays out, the real choice is: USWDS, GOV.UK Frontend, Carbon Web Components (CDN), Material Web (prototype), or hand-rolled CSS.
2. **Two vendor pitfalls for the buildless government kits:** theming usually assumes Sass (GOV.UK explicitly cannot be themed in the precompiled build), and the look signals "government".
3. **Accessibility claims are weaker than they sound.** Only USWDS (VPAT, named AT) and GOV.UK (WCAG 2.2 AA "will help") give a level; React Aria gives the best AT test matrix but no WCAG level; Carbon, Radix and shadcn give general statements. All say you still need your own audit. This matches the existing approach in `.scratch/power-ranking-app/` audit notes.
4. **Mobile:** only USWDS ("mobile first") and React Aria (touch behaviours, TalkBack/VoiceOver iOS testing) have a primary-source mobile statement in what was read. For the rest, mobile support is unverified here. For a site of tables and rankings, responsive layout is mostly your own CSS whichever you pick.
5. **Docs quality:** not rated numerically. USWDS, GOV.UK, Carbon and React Aria all have dedicated documentation sites; MUI, Radix, shadcn, Primer do too. Material Web docs live in the GitHub repo (`docs/`).

## Could not verify / caveats

- Did not read the sites rendering client-side beyond what WebFetch returned; page summaries come from an automated fetch, not full-page reads. Quotes are from those summaries.
- GOV.UK: no primary statement found for non-government use of the Crown, brand or font; the accessibility statement URL returned 404; mobile support not checked.
- USWDS: whether precompiled CSS can be re-themed; the accessibility conformance report itself was not opened.
- MUI: accessibility guide URL 404; no a11y or Material 3 statement read.
- Carbon: plain-CSS styles via CDN, telemetry runtime behaviour, browser support.
- Radix maintenance status: secondary sources only. React Aria licence read from npm, not the site.
- Release dates and versions are from the npm registry on 2026-10-08, not release notes.
- m3.material.io is client-rendered and was not readable (carried over from `material-options.md`).

## Possible next steps (for the decision ticket, not decided here)

- Decide first whether a build step/React is acceptable; that removes half the list.
- If buildless: prototype one page (for example Power ranking) in USWDS precompiled and in hand-rolled M3 CSS, then audit both on a phone with NVDA/VoiceOver/TalkBack.
- If React: React Aria Components + own M3-token CSS is the best-evidenced a11y base among the React options.
