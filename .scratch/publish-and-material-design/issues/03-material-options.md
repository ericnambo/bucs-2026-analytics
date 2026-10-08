# Material Design options

Type: research
Status: resolved
Blocked by: none

## Question

Material Web components vs hand-rolled Material-style CSS on this no-build static site: a11y status, build/bundle needs, maintenance. Findings go on branch research/material.

## Research pointer

Branch `research/material`, file `.scratch/publish-and-material-design/research/material-options.md`.

- Material Web is in maintenance mode (no staffed dev since 2024-06; still releasing, v2.5.0 July 2026); buildless use via import map + esm.run is documented as prototyping only.
- A11y: no conformance claim; shadow-DOM components with open screen-reader/ARIA issues (md-select/JAWS, md-menu, dialog, switch dark-theme contrast).
- Leaning: hand-rolled CSS with `--md-sys-*` token names fits the no-build site; m3.material.io pages could not be fetched (client-rendered), so verify there.

## Answer

Research complete (see Research pointer). Material Web is a risky base (maintenance mode, buildless use is prototype-only, open a11y issues); hand-rolled CSS with M3 token names is the leading way to get the Material look. Eric wants the design system choice kept open (see Design system options), so this is one input, not the decision.
