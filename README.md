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
- Coach-only password access is a future goal. GitHub Pages can't gate a site, and private-repo Pages needs a paid plan, so that will mean a separate host.
