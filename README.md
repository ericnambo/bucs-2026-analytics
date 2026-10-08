# BAFL Peewee Analytics

Power rankings and playoff outlook for the Bay Area Buccaneers' Peewee team, BAFL 2026 season.

Static site (plain HTML + JS). Open `index.html` in a browser.

## Commands

- `npm test` - run tests
- `npm run check` - validate game data
- `npm run build` - rebuild `data/season-data.js` from the JSON data

## Notes

- Terminology lives in [CONTEXT.md](CONTEXT.md).
- Scoreboard images, the schedule image, and the by-laws PDF are local-only (git-ignored). "Scoreboard" links on the Results page won't work in a fresh clone.
- Coach access (Matchup and Playoff picture pages) is a soft gate: `src/coach-hashes.js` holds 9 unlabeled SHA-256 hashes. Make a hash with `npm run hash`. Real passwords are never stored in the repo.
- Revoke a password: delete its line in `src/coach-hashes.js` and republish.
