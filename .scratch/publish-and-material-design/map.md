# Map: Publish + Material Design

Label: wayfinder:map

## Destination

A locked set of decisions and a spec covering (a) publishing the BAFL Peewee app publicly with a soft password gate on two pages, and (b) moving to Google Material Design: the order of the two and the high-level approach. No building.

## Notes

- Audience: public = parents league-wide. Gate = 9 shared coach passwords, handed out in person (scheme kept out of this file on purpose, see the Public data audit). No individual logins.
- Gated pages: Matchup (`matchup.html`) and Playoff picture (`playoff.html`). Public: Results, Power ranking, Schedule.
- Gate is a **soft gate** (client-side); leakage of gated data is tolerated.
- Eric is a 13-year accessibility pro: Material choices must hold up to his a11y standards (see audit notes in `.scratch/power-ranking-app/`).
- Consult `CONTEXT.md` and the README (coach-only password note). Refer to tickets by name.
- HITL tickets: use grilling + domain-modeling. Research tickets: research skill.

## Decisions so far

<!-- one line per closed ticket: [title](issues/NN-slug.md): gist -->

- [Host options for a public static site](issues/01-host-options.md): GitHub Pages, public repo OK, default URL for now.
- [Soft-gate mechanisms](issues/02-soft-gate-mechanisms.md): research done; hashed list + sessionStorage is simplest, gate hides only the UI, prompt a11y rules gathered.
- [Material Design options](issues/03-material-options.md): research done; Material Web risky (maintenance mode, a11y issues), hand-rolled M3-token CSS is the leading Material path.
- [Publish first, Material first, or independent?](issues/04-publish-vs-material-order.md): publish first (current look, GitHub Pages); design system choice split out.
- [Design system options](issues/07-design-system-options.md): research done; no-build+no-React options are USWDS, GOV.UK, Carbon WC (CDN), hand-rolled CSS; MUI, React Aria, Radix, shadcn, Primer need React + a bundler.
- [Public data audit](issues/06-public-data-audit.md): repo is private now; nothing sensitive in code or history; scoreboard links would 404; keep the password scheme out of committed files.
- [Scoreboard links on the public site](issues/09-scoreboard-links.md): hide the links in the first public version; whether the column stays at all is a later question.
- [Gate behavior and password handling](issues/05-gate-behavior.md): inline coach form, remembered on device with a Lock control, nav links visible to all, 9 unlabeled SHA-256 hashes, redeploy to change.
- [Design system and React decision](issues/08-design-system-and-react.md): stay plain HTML/CSS/JS; hand-rolled responsive CSS with Material 3 token names; minimal phone fix ships with the first publish.

## Not yet specified

- Analytics and privacy for parent visitors (default: none; confirm in the spec).
- Table and nav layout on phones, theming details, and the a11y re-audit plan: design work for the restyle effort, not decisions this map needs.

## Out of scope

- The actual restyle, building the gate, and deployment.
- Individual logins and server-side auth (soft gate chosen).
- Redesigning or removing the scoreboard-link column, or linking to the league Facebook posts (later exploration, not part of publishing).
