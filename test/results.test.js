const test = require('node:test');
const assert = require('node:assert/strict');
const { loadSeason } = require('../src/core');
const { resultRows, filterOptions } = require('../src/results');

const teams = [
  { id: 'bay-area-buccaneers', name: 'Bay Area Buccaneers' },
  { id: 'b', name: 'B' },
  { id: 'c', name: 'C' },
  { id: 'd', name: 'D' },
];
const schedule = { division: 'Peewee', teams, games: [] };
const g = (week, home, homeScore, away, awayScore, extra = {}) => ({
  week, home, away, homeScore, awayScore, source: `week-${week}.jpg`, ...extra,
});
const season = loadSeason({
  settings: { focusTeam: 'bay-area-buccaneers' },
  schedule,
  games: {
    games: [
      g(1, 'bay-area-buccaneers', 0, 'b', 18),
      g(1, 'c', 7, 'd', 14),
      g(2, 'd', 1, 'bay-area-buccaneers', 0, { forfeit: true }),
      g(2, 'b', 0, 'c', 0, { flag: '0-0 reading: confirm' }),
    ],
  },
});

test('one row per game with names, score and source link', () => {
  const rows = resultRows(season);
  assert.equal(rows.length, 4);
  assert.deepEqual(
    { week: rows[0].week, away: rows[0].awayName, home: rows[0].homeName, awayScore: rows[0].awayScore, homeScore: rows[0].homeScore, source: rows[0].source },
    { week: 1, away: 'B', home: 'Bay Area Buccaneers', awayScore: 18, homeScore: 0, source: 'week-1.jpg' },
  );
});

test('filters by week and by team', () => {
  assert.equal(resultRows(season, { week: 2 }).length, 2);
  assert.equal(resultRows(season, { team: 'bay-area-buccaneers' }).length, 2);
  assert.equal(resultRows(season, { week: 1, team: 'd' }).length, 1);
  assert.equal(resultRows(season, { week: '', team: '' }).length, 4);
});

test('forfeits and flags are marked in text; Bucs games are marked', () => {
  const rows = resultRows(season);
  assert.deepEqual(rows[0].notes, ['Bucs game']);
  assert.deepEqual(rows[2].notes, ['Bucs game', 'Forfeit']);
  assert.deepEqual(rows[3].notes, ['Check extraction: 0-0 reading: confirm']);
  assert.equal(rows[2].isBucs, true);
  assert.equal(rows[1].isBucs, false);
});

test('filter options list weeks played and teams by name', () => {
  const o = filterOptions(season);
  assert.deepEqual(o.weeks, [1, 2]);
  assert.deepEqual(o.teams.map((t) => t.name), ['B', 'Bay Area Buccaneers', 'C', 'D']);
});

test('data/season-data.js is in sync with the JSON files (run npm run build)', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const dir = path.join(__dirname, '..', 'data');
  const read = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const js = fs.readFileSync(path.join(dir, 'season-data.js'), 'utf8');
  const embedded = JSON.parse(js.slice(js.indexOf('{'), js.lastIndexOf('}') + 1));
  assert.deepEqual(embedded, { games: read('games.json'), schedule: read('schedule.json') });
});
