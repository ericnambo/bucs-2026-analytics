# BAFL Peewee Analytics

Power rankings and playoff outlook for the Bay Area Buccaneers' Peewee team, BAFL 2026 season.

Static site (plain HTML + JS). Open `index.html` in a browser. Published on GitHub Pages from the `main` branch (root folder).

## Commands

- `npm test` - run tests
- `npm run check` - validate game data
- `npm run build` - rebuild `data/season-data.js` from the JSON data
- `npm run hash` - make a SHA-256 hash for a coach password

## Republish

GitHub Pages serves `main`. Commit and push to `main`; the live site updates in a minute or two. Run `npm test` first.

## Change or revoke a coach password

Coach access (Matchup and Playoff picture pages) is a soft gate: it hides the pages, not the data. `src/coach-hashes.js` holds 9 unlabeled SHA-256 hashes. Real passwords are never stored in the repo.

- Change: run `npm run hash`, type the new password, replace the old line in `src/coach-hashes.js` with the printed hash, then republish.
- Revoke: delete its line in `src/coach-hashes.js` and republish.

## Notes

- Terminology lives in [CONTEXT.md](CONTEXT.md).
- Scoreboard images, the schedule image, and the by-laws PDF are local-only (git-ignored). The Results page hides its "Scoreboard" links on the published site.
