# 16: Publish on GitHub Pages

**What to build:** The app is live at its default GitHub Pages address with today's look, the minimal phone fix and the Coach access gate. Some steps are the owner's: changing the repository to public and turning on Pages are outward-facing and hard to reverse, so the agent prepares and checks, and the owner confirms and does them.

**Blocked by:** 10 (Hide the scoreboard links on Results), 11 (Wide tables scroll sideways on phones), 14 (Coach access on Playoff picture), 15 (Load the real coach hashes), 17 (Remove local branches that carry the password hint).

**Status:** in-progress (agent steps done; owner steps 12-15 remain)

- [x] The research agents' worktree folder is git-ignored and nothing untracked is committed by accident
- [x] The README no longer says coach passwords need a separate host, and explains how to republish and how to change a password
- [x] Before going public, a final check of tracked files and history finds no secrets, real passwords or the password pattern
- [ ] The owner changes the repository to public and turns on Pages (confirmed with them first)
- [ ] In a fresh browser on the live address: public pages work, no dead links, both gated pages are locked, and a coach password unlocks them
- [ ] Checked on the owner's phone
- [ ] No analytics, trackers or third-party requests load

Source: spec user stories 1-5, 22-24 and "Implementation Decisions" (hosting); map ticket "Host options for a public static site".
