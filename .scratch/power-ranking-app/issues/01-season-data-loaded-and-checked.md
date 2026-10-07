# 01: Season data loaded and checked

**What to build:** Weeks 1-8 Peewee scores and the 2026 schedule extracted from the source scoreboards and schedule image into the season data files (a 1-0 score is a forfeit). The core module loads them, applies the rule settings (margin cap 42, playoffs 8, forfeit and tie handling), and runs a data check that reports problems by week and game. The user can run the check and see a clear pass or a list of fixes.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [x] Every Weeks 1-8 Peewee game is in the data with week, home team, away team, scores and source scoreboard reference
- [x] The full schedule (Weeks 1-11, byes included) is in the data
- [x] Forfeits (1-0) are flagged; uncertain readings carry an extraction flag
- [x] Data check catches: a team playing twice in a week, pairings that disagree with the schedule, a missing team
- [x] Rule settings live in one place and are applied by the core module
- [x] Core module tests (built test-first) cover a clean season, a forfeit, a tie, a bye, and a malformed season with the right message
- [x] User has reviewed the extracted data against the images
