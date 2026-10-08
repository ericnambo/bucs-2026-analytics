# 11: Wide tables scroll sideways on phones

**What to build:** On all five pages (Results, Power ranking, Matchup, Playoff picture, Schedule), a phone-width screen shows the page without sideways page scroll; wide tables scroll sideways inside their own container. This is the minimal phone fix, not the Material 3 restyle: keep today's look.

**Blocked by:** None (can start immediately).

**Status:** done

- [x] At phone width no page has horizontal page scroll; each wide table scrolls inside its container
- [x] A scrolling table container is reachable and scrollable by keyboard and has an accessible name
- [x] Target sizes, focus visibility and contrast stay at the audited standard
- [x] Verified on a real phone and at a narrow browser width
- [x] Desktop layout and print output are unchanged

Source: spec "Implementation Decisions" (minimal phone layout).
