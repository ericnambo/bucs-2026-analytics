const test = require('node:test');
const assert = require('node:assert/strict');
const { loadSeason } = require('../src/core');
const E = require('../src/export');

const teams = ['bay-area-buccaneers', 'b', 'c', 'd'].map((id) => ({ id, name: id === 'b' ? 'B, "Bees"' : id.toUpperCase() }));
const sched = [[1, 'bay-area-buccaneers', 'b'], [1, 'c', 'd'], [2, 'bay-area-buccaneers', 'c'], [2, 'b', 'd'], [3, 'bay-area-buccaneers', 'd'], [3, 'b', 'c'], [4, 'c', 'd']];
const schedule = { division: 'Peewee', teams, games: sched.map(([week, home, away]) => ({ week, home, away })) };
const scores = [[14, 0], [7, 21], [28, 6], [0, 12], [35, 7], [13, 13]];
const games = sched.slice(0, 6).map(([week, home, away], i) => ({ week, home, away, homeScore: scores[i][0], awayScore: scores[i][1], source: `w${week}.jpg`, ...(i === 3 ? { forfeit: true } : {}) }));
const season = loadSeason({ games: { games }, schedule, settings: { playoffTeams: 2, simRuns: 500, simSeed: 3, focusTeam: 'bay-area-buccaneers' } });

test('ranking table follows the on-screen sort and formatting', () => {
  const t = E.rankingTables(season, { key: 'name', direction: 'desc' })[0];
  assert.deepEqual(t.headers.slice(0, 3), ['Power rank', 'Team', 'Record']);
  assert.deepEqual(t.rows.map((r) => r[1]), ['D', 'C', 'BAY-AREA-BUCCANEERS', 'B, "Bees"']);
  const row = season.powerRanking().find((r) => r.name === 'C');
  const out = t.rows.find((r) => r[1] === 'C');
  assert.equal(out[2], row.record);
  assert.equal(out[3], E.fmt.avgMargin(row.avgMargin));
  assert.equal(out[5], E.fmt.elo(row.elo));
  assert.equal(out[6], E.fmt.sos(row.sos));
});

test('ranking export includes the back-test table', () => {
  const tables = E.rankingTables(season, { key: 'rank', direction: 'asc' });
  assert.equal(tables.length, 2);
  assert.deepEqual(tables[1].headers, ['Method', 'Accuracy', 'Winners picked', 'Games tested']);
});

test('results table honors filters and joins notes', () => {
  const all = E.resultsTable(season, {});
  assert.equal(all.rows.length, 6);
  assert.deepEqual(all.headers, ['Week', 'Away team', 'Away score', 'Home team', 'Home score', 'Notes', 'Source']);
  const wk2 = E.resultsTable(season, { week: '2' });
  assert.equal(wk2.rows.length, 2);
  assert.ok(wk2.rows.some((r) => r[5].includes('Forfeit')));
  assert.equal(wk2.rows[0][6], 'w2.jpg');
});

test('playoff tables match the on-screen seeds, pairings and odds', () => {
  const tables = E.playoffTables(season);
  const [seeds, pairings, odds] = tables.filter((x) => x.title !== 'Tie flags');
  assert.equal(tables.length - 3, season.playoffPicture().flags.length ? 1 : 0);
  const pic = season.playoffPicture();
  assert.equal(seeds.rows.length, pic.seeds.length);
  assert.equal(seeds.rows[0][0], pic.seeds[0].seed);
  assert.equal(pairings.rows.length, pic.pairings.length);
  const o = season.odds().find((x) => x.name === odds.rows[0][0].replace(' - Bucs', ''));
  assert.equal(odds.rows[0][1], E.percent(o.playoffOdds, o.clinched || o.eliminated));
  assert.equal(odds.rows[0][3], o.clinched ? 'Clinched' : o.eliminated ? 'Eliminated' : 'Alive');
});

test('percent never shows a false 100% or 0%', () => {
  assert.equal(E.percent(0.999, false), '>99%');
  assert.equal(E.percent(0.001, false), '<1%');
  assert.equal(E.percent(1, true), '100%');
});

test('CSV quotes commas, quotes and newlines, with a title row per table', () => {
  const csv = E.toCsv([{ title: 'T', headers: ['a', 'b'], rows: [['x,y', 'say "hi"'], [1, 'l1\nl2']] }]);
  assert.equal(csv, 'T\r\na,b\r\n"x,y","say ""hi"""\r\n1,"l1\nl2"\r\n');
});

test('CSV separates several tables with a blank line', () => {
  const csv = E.toCsv([{ title: 'A', headers: ['h'], rows: [[1]] }, { title: 'B', headers: ['h'], rows: [[2]] }]);
  assert.equal(csv, 'A\r\nh\r\n1\r\n\r\nB\r\nh\r\n2\r\n');
});

test('Excel XML has one sheet per table, escaped text and numeric cells', () => {
  const xml = E.toExcelXml([{ title: 'Seeds: [1]', headers: ['Team'], rows: [['A & <B>'], [3]] }]);
  assert.match(xml, /<Worksheet ss:Name="Seeds_ _1_">/);
  assert.match(xml, /<Data ss:Type="String">A &amp; &lt;B&gt;<\/Data>/);
  assert.match(xml, /<Data ss:Type="Number">3<\/Data>/);
});
