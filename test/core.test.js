const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadSeason, checkSeason } = require('../src/core');
const { defaultSettings } = require('../src/settings');

// Tiny 4-team season: 3 weeks scheduled, weeks 1-2 played. Week 3 has a bye for D.
const teams = ['a', 'b', 'c', 'd'].map((id) => ({ id, name: id.toUpperCase() }));
const schedule = {
  division: 'Peewee',
  teams,
  games: [
    { week: 1, home: 'a', away: 'b' },
    { week: 1, home: 'c', away: 'd' },
    { week: 2, home: 'b', away: 'c' },
    { week: 2, home: 'd', away: 'a' },
    { week: 3, home: 'a', away: 'c' },
    { week: 3, home: 'b', away: 'd' },
    { week: 4, home: 'a', away: 'd' },
  ],
};
const g = (week, home, homeScore, away, awayScore, extra = {}) => ({
  week, home, away, homeScore, awayScore, source: `week-${week}.jpg`, ...extra,
});
const cleanGames = () => [g(1, 'a', 20, 'b', 6), g(1, 'c', 7, 'd', 14), g(2, 'b', 13, 'c', 0), g(2, 'd', 1, 'a', 0, { forfeit: true })];
const load = (games, settings) => loadSeason({ games: { division: 'Peewee', games }, schedule, settings });

test('a clean season passes the data check', () => {
  const result = checkSeason({ games: { division: 'Peewee', games: cleanGames() }, schedule });
  assert.equal(result.ok, true);
  assert.deepEqual(result.problems, []);
});

test('games are normalized with winner and capped margin', () => {
  const season = load([g(1, 'a', 50, 'b', 3)]);
  const [game] = season.games;
  assert.equal(game.winner, 'a');
  assert.equal(game.loser, 'b');
  assert.equal(game.tie, false);
  assert.equal(game.cappedMargin, defaultSettings.marginCap);
  assert.equal(defaultSettings.marginCap, 42);
});

test('margin cap comes from settings', () => {
  const season = load([g(1, 'a', 50, 'b', 3)], { marginCap: 10 });
  assert.equal(season.games[0].cappedMargin, 10);
});

test('a forfeit still has a winner but carries no margin', () => {
  const season = load(cleanGames());
  const forfeit = season.games.find((x) => x.forfeit);
  assert.equal(forfeit.winner, 'd');
  assert.equal(forfeit.loser, 'a');
  assert.equal(forfeit.cappedMargin, null);
});

test('a tie has no winner and zero margin', () => {
  const season = load([g(1, 'a', 14, 'b', 14)]);
  const [game] = season.games;
  assert.equal(game.tie, true);
  assert.equal(game.winner, null);
  assert.equal(game.loser, null);
  assert.equal(game.cappedMargin, 0);
});

test('a bye is a team with no scheduled game that week', () => {
  const season = load(cleanGames());
  assert.deepEqual(season.byes(4).sort(), ['b', 'c']);
  assert.deepEqual(season.byes(1), []);
});

test('weeks with byes do not cause data-check problems', () => {
  const games = [...cleanGames(), g(3, 'a', 10, 'c', 0), g(3, 'b', 10, 'd', 0), g(4, 'a', 3, 'd', 0)];
  assert.deepEqual(checkSeason({ games: { games }, schedule }).problems, []);
});

test('extraction flags are kept and are not problems', () => {
  const games = [g(1, 'a', 0, 'b', 0, { flag: 'check this' }), g(1, 'c', 7, 'd', 14)];
  const season = load(games);
  assert.equal(season.games[0].flag, 'check this');
  assert.deepEqual(checkSeason({ games: { games }, schedule }).problems, []);
});

test('malformed: a team playing twice in a week names the week and team', () => {
  const games = [...cleanGames(), g(1, 'a', 3, 'c', 0)];
  const { ok, problems } = checkSeason({ games: { games }, schedule });
  assert.equal(ok, false);
  const p = problems.find((x) => x.code === 'team-plays-twice');
  assert.ok(p);
  assert.equal(p.week, 1);
  assert.match(p.message, /Week 1/);
  assert.match(p.message, /\bA\b/);
});

test('malformed: a pairing that disagrees with the schedule names the game', () => {
  const games = cleanGames();
  games[0] = g(1, 'a', 20, 'c', 6); // schedule says A v B and C v D
  const { problems } = checkSeason({ games: { games }, schedule });
  const p = problems.find((x) => x.code === 'pairing-mismatch');
  assert.ok(p);
  assert.equal(p.week, 1);
  assert.match(p.message, /Week 1/);
  assert.match(p.message, /C @ A/);
});

test('malformed: a team with a scheduled game but no result is reported as missing', () => {
  const games = cleanGames().filter((x) => !(x.week === 1 && x.home === 'c'));
  const { problems } = checkSeason({ games: { games }, schedule });
  const missing = problems.filter((x) => x.code === 'missing-team').map((x) => x.message).join(' | ');
  assert.match(missing, /Week 1/);
  assert.match(missing, /\bC\b/);
  assert.match(missing, /\bD\b/);
});

test('malformed: an unknown team id is reported', () => {
  const games = [...cleanGames(), g(3, 'a', 10, 'zzz', 0)];
  const { problems } = checkSeason({ games: { games }, schedule });
  const p = problems.find((x) => x.code === 'unknown-team');
  assert.ok(p);
  assert.match(p.message, /zzz/);
});

test('malformed: a 1-0 score without the forfeit flag, and a forfeit flag without 1-0', () => {
  const games = cleanGames();
  games[3] = g(2, 'd', 1, 'a', 0); // forfeit flag removed
  games[2] = g(2, 'b', 13, 'c', 0, { forfeit: true }); // flag but not 1-0
  const codes = checkSeason({ games: { games }, schedule }).problems.map((x) => x.code);
  assert.equal(codes.filter((c) => c === 'forfeit-flag-mismatch').length, 2);
});

test('malformed: a missing or non-numeric score is reported', () => {
  const games = cleanGames();
  games[0] = g(1, 'a', 'x', 'b', 6);
  const p = checkSeason({ games: { games }, schedule }).problems.find((x) => x.code === 'bad-score');
  assert.ok(p);
  assert.equal(p.week, 1);
});

test('the real 2026 Peewee data passes the check', () => {
  const read = (f) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', f), 'utf8'));
  const raw = { games: read('games.json'), schedule: read('schedule.json') };
  const result = checkSeason(raw);
  assert.deepEqual(result.problems, []);
  const season = loadSeason({ ...raw, settings: defaultSettings });
  assert.equal(season.teams.length, 18);
  assert.equal(season.games.length, 65);
  assert.equal(season.games.filter((x) => x.forfeit).length, 2);
});

// --- Power ranking table ---
const byId = (rows, id) => rows.find((r) => r.team === id);

test('power ranking orders by capped margin; forfeits count in record but not margin', () => {
  const rows = load(cleanGames()).powerRanking();
  assert.deepEqual(rows.map((r) => r.team), ['a', 'd', 'b', 'c']);
  assert.deepEqual(rows.map((r) => r.rank), [1, 2, 3, 4]);
  const d = byId(rows, 'd');
  assert.equal(d.wins, 2);
  assert.equal(d.record, '2-0');
  assert.equal(d.avgMargin, 7); // the forfeit adds no margin
  assert.equal(byId(rows, 'b').avgMargin, -0.5);
  assert.equal(byId(rows, 'c').avgMargin, -10);
});

test('strength of schedule is the average win percentage of opponents faced', () => {
  const rows = load(cleanGames()).powerRanking();
  assert.equal(byId(rows, 'a').sos, 0.75);
  assert.equal(byId(rows, 'd').sos, 0.25);
});

test('a tie counts half a win to each side and the record shows it', () => {
  const rows = load([g(1, 'a', 14, 'b', 14)]).powerRanking();
  const a = byId(rows, 'a');
  assert.equal(a.record, '0-0-1');
  assert.equal(a.winPct, 0.5);
  assert.equal(a.avgMargin, 0);
});

test('equal margins fall back to record, then name', () => {
  const rows = load([g(1, 'a', 10, 'b', 10), g(1, 'c', 10, 'd', 10), g(2, 'a', 10, 'c', 0), g(2, 'b', 0, 'd', 10)]).powerRanking();
  // margins: a +5, c -5, b -5, d +5 ; a (1-0-1) and d (1-0-1) tie, b and c tie
  assert.deepEqual(rows.map((r) => r.team), ['a', 'd', 'b', 'c']);
});

test('a team with a bye or no games is listed with no losses and no margin', () => {
  const season = loadSeason({
    games: { division: 'Peewee', games: [g(1, 'a', 20, 'b', 6)] },
    schedule: { ...schedule, teams: [...teams, { id: 'e', name: 'E' }] },
  });
  const e = byId(season.powerRanking(), 'e');
  assert.equal(e.games, 0);
  assert.equal(e.record, '0-0');
  assert.equal(e.avgMargin, null);
  assert.equal(e.sos, null);
  assert.equal(e.winPct, null);
  assert.equal(season.powerRanking().at(-1).team, 'e');
});

test('rows flag the focus team', () => {
  const season = loadSeason({ games: { division: 'Peewee', games: cleanGames() }, schedule, settings: { focusTeam: 'c' } });
  const rows = season.powerRanking();
  assert.equal(byId(rows, 'c').isFocus, true);
  assert.equal(byId(rows, 'a').isFocus, false);
});

test('matchup names the favored team, win probability and predicted margin', () => {
  const m = load(cleanGames()).matchup('a', 'c');
  assert.equal(m.favored, 'a');
  assert.ok(m.winProbability > 0.5 && m.winProbability < 1);
  assert.ok(m.predictedMargin > 0);
});

test('matchup is symmetric: swapping teams flips the side but not the favorite', () => {
  const season = load(cleanGames());
  const ac = season.matchup('a', 'c');
  const ca = season.matchup('c', 'a');
  assert.equal(ca.favored, ac.favored);
  assert.equal(ca.winProbability, ac.winProbability);
  assert.equal(ca.predictedMargin, ac.predictedMargin);
  assert.equal(ca.teamA.id, 'c');
  assert.ok(Math.abs(ca.teamA.winProbability - (1 - ac.teamA.winProbability)) < 1e-12);
});

test('matchup between evenly rated teams has no favorite', () => {
  const m = load([g(1, 'a', 14, 'b', 14)]).matchup('a', 'b');
  assert.equal(m.favored, null);
  assert.equal(m.winProbability, 0.5);
  assert.equal(m.predictedMargin, 0);
});

test('matchup lists common opponents with each team\'s result', () => {
  const m = load(cleanGames()).matchup('a', 'c');
  assert.deepEqual(m.commonOpponents.map((o) => o.id), ['b', 'd']);
  const b = m.commonOpponents.find((o) => o.id === 'b');
  assert.deepEqual(b.teamA.map((r) => [r.week, r.scoreFor, r.scoreAgainst, r.result]), [[1, 20, 6, 'W']]);
  assert.deepEqual(b.teamB.map((r) => [r.week, r.scoreFor, r.scoreAgainst, r.result]), [[2, 0, 13, 'L']]);
});

test('matchup with no common opponents says so and still predicts', () => {
  const m = load([g(1, 'a', 20, 'b', 6), g(1, 'c', 7, 'd', 14)]).matchup('a', 'c');
  assert.deepEqual(m.commonOpponents, []);
  assert.ok(m.favored);
});

test('matchup confidence note mentions the small sample', () => {
  const m = load(cleanGames()).matchup('a', 'c');
  assert.match(m.confidence, /small sample/i);
  assert.match(m.confidence, /2 games/);
});

test('next opponent is the first scheduled game without a result', () => {
  const season = load(cleanGames());
  assert.deepEqual(season.nextOpponent('a'), { week: 3, opponent: 'c', home: true });
  assert.equal(season.nextOpponent('d').opponent, 'b');
  assert.equal(load(cleanGames()).nextOpponent('zzz'), null);
});
