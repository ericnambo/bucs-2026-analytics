const test = require('node:test');
const assert = require('node:assert/strict');
const { loadSeason } = require('../src/core');

// 4 teams, top 2 make the playoffs. Weeks 1-2 played; week 3 (a v d, b v c) still to come.
// a is 2-0 and wins every tiebreak, so a is clinched; d is 0-2 and cannot catch the pack, so d is out.
const teams = ['a', 'b', 'c', 'd'].map((id) => ({ id, name: id.toUpperCase() }));
const sched = [[1, 'a', 'b'], [1, 'c', 'd'], [2, 'a', 'c'], [2, 'b', 'd'], [3, 'a', 'd'], [3, 'b', 'c']];
const schedule = { division: 'Peewee', teams, games: sched.map(([week, home, away]) => ({ week, home, away })) };
const played = sched.slice(0, 4).map(([week, home, away]) => ({ week, home, away, homeScore: 14, awayScore: 0, source: 'w.jpg' }));
const season = (settings = {}, rows = played) =>
  loadSeason({ games: { games: rows }, schedule, settings: { playoffTeams: 2, simRuns: 2000, simSeed: 7, ...settings } });
const byTeam = (odds) => new Map(odds.map((o) => [o.team, o]));

test('same seed gives the same odds, a different seed does not', () => {
  const s = season();
  assert.deepEqual(s.odds(), s.odds());
  assert.deepEqual(s.odds({ seed: 1 }), s.odds({ seed: 1 }));
  assert.notDeepEqual(s.odds({ seed: 1 }), s.odds({ seed: 2 }));
});

test('every team gets playoff and title odds that add up', () => {
  const odds = season().odds();
  assert.equal(odds.length, 4);
  assert.ok(odds.every((o) => o.playoffOdds >= 0 && o.playoffOdds <= 1 && o.titleOdds >= 0 && o.titleOdds <= 1));
  assert.ok(Math.abs(odds.reduce((n, o) => n + o.playoffOdds, 0) - 2) < 1e-9);
  assert.ok(Math.abs(odds.reduce((n, o) => n + o.titleOdds, 0) - 1) < 1e-9);
});

test('a clinched team shows 100% and an eliminated team 0%', () => {
  const o = byTeam(season().odds());
  assert.equal(o.get('a').playoffOdds, 1);
  assert.equal(o.get('d').playoffOdds, 0);
  assert.equal(o.get('d').titleOdds, 0);
  assert.equal(o.get('a').clinched, true);
  assert.equal(o.get('d').eliminated, true);
  assert.equal(o.get('b').clinched, false);
});

test('with nothing left to play, odds are the picture', () => {
  const done = sched.slice(4).map(([week, home, away]) => ({ week, home, away, homeScore: 14, awayScore: 0, source: 'w.jpg' }));
  const o = byTeam(season({}, [...played, ...done]).odds());
  assert.deepEqual(['a', 'b', 'c', 'd'].map((id) => o.get(id).playoffOdds), [1, 1, 0, 0]);
});

test('teams in the picture are labeled with a reason; others are not', () => {
  const o = byTeam(season().odds());
  for (const id of ['a', 'b']) {
    assert.ok(['Contender', 'Pretender'].includes(o.get(id).label));
    assert.match(o.get(id).reason, /seed \d/i);
    assert.match(o.get(id).reason, /power rank \d/i);
  }
  assert.equal(o.get('c').label, null);
  assert.equal(o.get('d').label, null);
});

test('a seed far above its power rank is a Pretender, thresholds come from settings', () => {
  const lenient = byTeam(season({ pretenderRankGap: 99, pretenderMinOdds: 0 }).odds());
  assert.ok([...lenient.values()].filter((o) => o.label).every((o) => o.label === 'Contender'));
  const strict = byTeam(season({ pretenderRankGap: 99, pretenderMinOdds: 1.01 }).odds());
  assert.ok([...strict.values()].filter((o) => o.label).every((o) => o.label === 'Pretender'));
  assert.match([...strict.values()].find((o) => o.label).reason, /playoff odds/i);
});
