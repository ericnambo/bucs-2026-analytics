# 17: Remove local branches that carry the password hint

**What to build:** Right before going public, once the gate has proved it works, delete the local branches and worktrees whose history contains the password-pattern hint, so publishing cannot expose it. At least the local branch `research/soft-gate` holds it (commit `e74d772`); no remote branch does. Do this last on purpose: those branches hold the research behind the gate, so keep them until the gate is verified. Deleting a branch is hard to reverse, so confirm each one with the owner first.

**Blocked by:** 10 (Hide the scoreboard links on Results), 11 (Wide tables scroll sideways on phones), 13 (Coach access on Matchup), 14 (Coach access on Playoff picture), 15 (Load the real coach hashes).

**Blocks:** 16 (Publish on GitHub Pages).

**Status:** ready-for-agent

- [ ] Every local branch and the `worktree-agent-*` branches are searched for the hint; the result is listed for the owner
- [ ] The owner confirms which branches to delete; branches not yet merged are called out
- [ ] Confirmed branches and their worktrees are deleted
- [ ] A search of all remaining branches and tags finds no coach names, real passwords or the password pattern
- [ ] Only then does the owner make the repository public (ticket 16)

Source: ticket 16 ("final check of tracked files and history"); ticket 06 audit note to keep the password scheme out of committed files.
