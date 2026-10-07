const test = require('node:test');
const assert = require('node:assert/strict');
const { loadSeason } = require('../src/core');

// 4-team fixtures: only the played games matter for the playoff picture.
const teams = ['a', 'b', 'c', 'd'].map((id) => ({ id, name: id.toUpperCase() }));
const schedule = { division: 'Peewee', teams, games: [] };
// "x>y" = x beats y 14-0, "x=y" = tie
const games = (...results) => results.map((r, i) => {
  const [x, y] = [r[0], r[2]];
  return { week: i + 1, home: x, away: y, homeScore: r[1] === '>' ? 14 : 7, awayScore: r[1] === '>' ? 0 : 7, source: 'w.jpg' };
});
const picture = (results, settings = { playoffTeams: 4 }) =>
  loadSeason({ games: { games: games(...results) }, schedule, settings }).playoffPicture();

test('a clean season seeds by record and pairs 1v4, 2v3', () => {
  const p = picture(['a>b', 'a>c', 'a>d', 'b>c', 'c>d', 'b>d']);
  assert.deepEqual(p.seeds.map((s) => s.team), ['a', 'b', 'c', 'd']);
  assert.deepEqual(p.seeds.map((s) => s.record), ['3-0', '2-1', '1-2', '0-3']);
  assert.deepEqual(p.pairings.map((x) => [x.high.team, x.low.team]), [['a', 'd'], ['b', 'c']]);
  assert.ok(p.seeds.every((s) => s.tie === null));
  assert.deepEqual(p.flags, []);
});

test('a two-way tie is broken head-to-head', () => {
  const p = picture(['b>a', 'a>c', 'a>d', 'b>c', 'd>b', 'c>d']);
  assert.deepEqual(p.seeds.map((s) => s.team), ['b', 'a', 'c', 'd']);
  assert.ok(p.seeds.every((s) => s.tie === null));
  assert.deepEqual(p.flags, []);
});

test('a three-way tie is flagged for coin flip or play-in, not silently resolved', () => {
  const p = picture(['a>b', 'a>c', 'a>d', 'b>c', 'c>d', 'd>b']);
  assert.equal(p.seeds[0].team, 'a');
  const tied = p.seeds.slice(1);
  assert.deepEqual(tied.map((s) => s.team).sort(), ['b', 'c', 'd']);
  assert.ok(tied.every((s) => s.tie && s.tie.kind === 'coin-flip-or-play-in'));
  assert.equal(p.flags.length, 1);
  assert.deepEqual(p.flags[0].teams.sort(), ['B', 'C', 'D']);
  assert.match(p.flags[0].message, /5\.11\.3/);
});

test('a two-way tie with no head-to-head winner is flagged', () => {
  const p = picture(['a=b', 'a>c', 'a>d', 'b>c', 'b>d', 'c>d']);
  assert.deepEqual(p.seeds.slice(0, 2).map((s) => s.team).sort(), ['a', 'b']);
  assert.ok(p.seeds.slice(0, 2).every((s) => s.tie));
  assert.equal(p.flags.length, 1);
});

test('playoff size comes from settings', () => {
  const p = picture(['a>b', 'a>c', 'a>d', 'b>c', 'c>d', 'b>d'], { playoffTeams: 2 });
  assert.deepEqual(p.seeds.map((s) => s.team), ['a', 'b']);
  assert.deepEqual(p.pairings.map((x) => [x.high.team, x.low.team]), [['a', 'b']]);
});

test('a tie fully outside the playoff field is not flagged', () => {
  const p = picture(['a>b', 'a>c', 'a>d', 'b>c', 'b>d', 'c=d'], { playoffTeams: 2 });
  assert.deepEqual(p.flags, []);
});
