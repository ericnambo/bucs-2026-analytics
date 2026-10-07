// Usage: npm run check
// Runs the data check on data/games.json against data/schedule.json.
const fs = require('node:fs');
const path = require('node:path');
const { checkSeason } = require('../src/core');
const { defaultSettings } = require('../src/settings');

const read = (file) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', file), 'utf8'));
const games = read('games.json');
const schedule = read('schedule.json');
const { ok, problems } = checkSeason({ games, schedule, settings: defaultSettings });

if (ok) {
  console.log(`PASS: ${games.games.length} games checked against the schedule, no problems.`);
} else {
  console.log(`FAIL: ${problems.length} problem(s) to fix in data/games.json:\n`);
  for (const p of problems) console.log(`  [${p.code}] ${p.message}`);
  process.exitCode = 1;
}

const flagged = games.games.filter((g) => g.flag);
if (flagged.length) {
  console.log(`\nNote: ${flagged.length} game(s) carry an extraction flag to double-check against the scoreboard:`);
  for (const g of flagged) console.log(`  Week ${g.week}, ${g.away} @ ${g.home} (${g.source}): ${g.flag}`);
}
