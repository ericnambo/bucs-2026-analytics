# 03: Power ranking table

**What to build:** A view listing all 18 Peewee teams with official record (ties half), average capped margin per game and strength of schedule. Columns sort, the Bucs are highlighted in text and style, and the default order is by capped margin with record as the tie-break.

**Blocked by:** 02

**Status:** ready-for-agent

- [ ] All 18 teams shown with record, capped margin and strength of schedule
- [ ] Forfeits count in the record but not in margin; byes are ignored
- [ ] Any column sorts by keyboard and the sort state is announced
- [ ] Bucs row is identifiable without color
- [ ] Core module tests cover ranking on small fixture seasons, including forfeit, tie and bye
