# Design system and React decision

Type: grilling
Status: resolved
Blocked by: 07

## Question

Which design system, and does the app stay plain HTML/JS with no build step or move to React? Moving to React would revisit the no-framework, no-build constraint in the power-ranking-app spec, and how GitHub Pages deploys. Decide with Eric.

## Answer

Decided with Eric (research: Design system options, Material Design options).

- **Stay plain HTML/CSS/JS with no build step.** The "no framework, no build step" constraint in the power-ranking-app spec stays. No React rebuild in this effort; React can be a separate learning effort later.
- **Approach: hand-rolled responsive CSS using Material 3 token names** (`--md-sys-*` custom properties in one tokens file). No library or CDN dependency. Material Web, USWDS, GOV.UK and Carbon were not chosen. USWDS is the fallback if hand-rolling proves too heavy.
- **Eric's priorities, in order:** mobile experience for parents, no unmaintained dependency, built-in accessibility, comprehensive docs, the Material look, learning value. Eric carries the accessibility work (his strength); the old audit notes are the regression check.
- **Minimal phone fix ships with the first publish** (for example wrapping wide tables so they scroll sideways). The full mobile-first restyle is a later effort.
- **Build support:** Claude helps in later implementation slices (tokens file and nav first, then tables), with hints first per Eric's learning preference.
