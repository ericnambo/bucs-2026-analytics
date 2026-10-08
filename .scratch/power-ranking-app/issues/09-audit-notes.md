# 09 audit notes: WCAG 2.2 AA

Audited all five views (Power ranking, Matchup, Playoff picture, Schedule, Results) and the print layout by reading the markup, CSS and render code. The user does the final manual check with a screen reader and keyboard.

## Already passing
- Tables use caption, `th scope="col"` and `th scope="row"`. Sort buttons sit inside `th` with `aria-sort`, and a `role="status"` line announces "Sorted by X".
- Filters are labelled selects; "Showing N of M games" is announced. Matchup result and tie flags are live regions.
- Status is never color-only: Bucs, Best back-tested, Contender/Pretender, Tie flagged and odds status all have text.
- Contrast: body text #1a1a1a on #fff; links #0b4fa8 on white and on the tinted rows (all above 7:1); table borders #767676 (4.5:1); focus ring #0b4fa8 3px. Print is black on white.
- External scoreboard links name the target and say they open a new tab.

## Fixed in this pass
- Added a "Skip to main content" link and a focusable `main` on every view (2.4.1).
- Results: Bucs rows were highlighted by color and bold only; they now carry a "Bucs game" text tag, matching the Schedule view (1.4.1).
- Current page in the nav now has bold + underline as well as `aria-current` (1.4.1).
- Results filter form has an accessible name.
- Minimum 24px target size on buttons and selects (2.5.8).
- Shared styles live in `src/a11y.css`.

## Deliberately left open
- Wide tables scroll sideways at very narrow widths (320px). Data tables are exempt from the reflow rule (1.4.10), so left as is.
- Empty score cells for unplayed games on the Schedule are blank; the Status column says "Scheduled".
- Not tested with a real screen reader or in forced-colors mode; that is the manual check.
