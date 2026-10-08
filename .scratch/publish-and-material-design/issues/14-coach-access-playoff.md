# 14: Coach access on Playoff picture

**What to build:** Playoff picture gets the same Coach access gate as Matchup, sharing the same form, password list and unlock memory, so unlocking either page unlocks both. Once unlocked, seeds, tiebreak flags, odds, labels, export and print all work as before.

**Blocked by:** 13 (Coach access on Matchup).

**Status:** done

- [x] Locked Playoff picture shows only the gate; nothing from the analysis is rendered
- [x] Unlocking on one gated page unlocks the other; Lock locks both
- [x] Unlocked, Playoff picture's tables, odds, labels, export and print are unchanged
- [x] Same accessibility behavior as Matchup, re-checked with keyboard and NVDA
- [x] The full test suite passes

Source: spec user stories 6-14; map ticket "Gate behavior and password handling".
