# Public data audit

Type: task
Status: resolved
Blocked by: none

## Question

Confirm what ships publicly: git-ignored scoreboard images (Results 'Scoreboard' links break in a fresh clone), data files, anything that should not be public. Record findings and what to do about the broken links.

## Answer

Audit done (read-only; nothing changed). Facts:

- **The repo is currently PRIVATE** (GitHub). Going public exposes all 22 commits of history and every tracked file, including `.scratch/power-ranking-app/` (spec, tickets, audit notes). Those contain no secrets.
- **Nothing sensitive in tracked code or history.** No passwords, tokens, emails or personal data in `src/`, `scripts/`, `data/`, README, CONTEXT. Data is team slugs, week numbers and scores only; no player names. The raw scoreboard JPGs, schedule image and by-laws PDF were never committed (not in history).
- **Broken links on the public site.** `data/games.json` has a `source` per game (e.g. `BAFL-Scoreboard-Week-1.jpg`), and the Results page (`src/app.js`) links to it. Those files are git-ignored, so on GitHub Pages every "Week N scoreboard" link would 404. Export (`src/export.js`) also writes `source` into output rows.
- **Password scheme leak risk.** This map's Notes (and ticket "Gate behavior and password handling" once written) state the password pattern. If `.scratch/publish-and-material-design/` is committed to the public repo, the scheme is published. Keep the pattern out of committed files (reword, or git-ignore this folder).
- **Housekeeping.** `.claude/worktrees/` (research agent worktrees) is untracked and not git-ignored; don't commit it.

New decision surfaced: what to do about the scoreboard links (new ticket Scoreboard links on the public site).
