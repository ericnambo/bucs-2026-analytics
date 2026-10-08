# Design system options

Type: research
Status: resolved
Blocked by: none

## Question

Which open-source design systems are comprehensive, easy to use, well documented and accessible, and how does each fit this site? Candidates to consider: Material Web, hand-rolled Material 3 tokens, MUI, React Aria / Spectrum, Radix, shadcn/ui, Carbon, Primer, USWDS, GOV.UK. Criteria: docs quality, license, accessibility (conformance claims, known issues), mobile/responsive support, and whether it works without a build step or needs React. Findings go on branch research/design-systems.

## Research pointer

Branch `research/design-systems`, file `.scratch/publish-and-material-design/research/design-systems.md`.

- Only USWDS, GOV.UK Frontend, Carbon Web Components (CDN) and hand-rolled CSS work with no build and no React; MUI, React Aria, Radix, shadcn and Primer React all need React plus a bundler, and Primer CSS is "KTLO mode".
- USWDS and GOV.UK have the strongest published accessibility claims (USWDS: WCAG 2.1 AA aim, VPAT; GOV.UK: "will help meet WCAG 2.2 AA") and still say audit yourself. React Aria has the best screen-reader test matrix of the React options.
- Biggest caveats: GOV.UK precompiled can't be themed and its non-gov branding rules are unclear. USWDS and GOV.UK both look like government sites. Carbon v3 is breaking and ships telemetry. Mobile support, MUI accessibility and Radix maintenance are unverified.

## Answer

Research complete (see Research pointer). The decision is left to the Design system and React decision ticket.
