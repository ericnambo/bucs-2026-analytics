// Export logic: builds the same table values the views show, then writes them as CSV or Excel XML.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./ranking'), require('./results'));
  else root.BaflExport = factory(root.BaflRanking, root.BaflResults);
})(this, function (BaflRanking, BaflResults) {
  // Display formatting shared with the views, so exported values match the screen.
  const signed = (v) => (v === null ? 'n/a' : (v > 0 ? '+' : '') + v.toFixed(1));
  const fmt = {
    avgMargin: signed,
    adjusted: signed,
    elo: (v) => (v === null ? 'n/a' : Math.round(v)),
    sos: (v) => (v === null ? 'n/a' : v.toFixed(3)),
  };

  // Exact 100% / 0% only when the outcome is certain; a simulated near-certainty never rounds to them.
  function percent(p, certain) {
    const n = Math.round(p * 100);
    if (certain) return `${n}%`;
    return n >= 100 ? '>99%' : n < 1 ? '<1%' : `${n}%`;
  }

  const oddsOrder = (odds) =>
    [...odds].sort((a, b) => b.playoffOdds - a.playoffOdds || b.titleOdds - a.titleOdds || a.name.localeCompare(b.name));
  const oddsStatus = (o) => (o.clinched ? 'Clinched' : o.eliminated ? 'Eliminated' : 'Alive');

  function rankingTables(season, sort) {
    const rows = BaflRanking.sortRows(season.powerRanking(), sort.key, sort.direction);
    const backTest = season.backTest();
    return [
      {
        title: 'Power ranking',
        headers: BaflRanking.columns.map((c) => c.label),
        rows: rows.map((r) => [r.rank, r.name, r.record, fmt.avgMargin(r.avgMargin), fmt.adjusted(r.adjusted), fmt.elo(r.elo), fmt.sos(r.sos)]),
      },
      {
        title: 'Back-test results by rating method',
        headers: ['Method', 'Accuracy', 'Winners picked', 'Games tested'],
        rows: backTest.methods.map((m) => [m.label, m.accuracy === null ? 'n/a' : `${Math.round(m.accuracy * 100)}%`, `${m.correct} of ${m.tested}`, m.tested]),
      },
    ];
  }

  function resultsTable(season, filters) {
    return {
      title: 'Peewee game results',
      headers: ['Week', 'Away team', 'Away score', 'Home team', 'Home score', 'Notes', 'Source'],
      rows: BaflResults.resultRows(season, filters).map((r) => [r.week, r.awayName, r.awayScore, r.homeName, r.homeScore, r.notes.join('; '), r.source]),
    };
  }

  function playoffTables(season) {
    const picture = season.playoffPicture();
    const odds = season.odds();
    const oddsOf = new Map(odds.map((o) => [o.team, o]));
    const label = (s) => `${s.name} (${s.record})${s.isFocus ? ' - Bucs' : ''}`;
    const focus = season.settings.focusTeam;
    const flags = picture.flags.map((f) => [`Tie flagged for seeds ${f.seeds.join(', ')}: ${f.message}`]);
    return [
      ...(flags.length ? [{ title: 'Tie flags', headers: ['Flag'], rows: flags }] : []),
      {
        title: 'Seeds',
        headers: ['Seed', 'Team', 'Record', 'Tie status', 'Label', 'Reason'],
        rows: picture.seeds.map((s) => {
          const o = oddsOf.get(s.team);
          return [s.seed, s.name, s.record, s.tie ? `Tied with ${s.tie.with.join(', ')}: coin flip or play-in` : 'Settled', o.label, o.reason];
        }),
      },
      {
        title: 'First-round pairings',
        headers: ['Pairing', 'Higher seed', 'Lower seed'],
        rows: picture.pairings.map((p) => [`${p.high.seed} vs ${p.low.seed}`, label(p.high), label(p.low)]),
      },
      {
        title: 'Playoff and title odds',
        headers: ['Team', 'Playoff odds', 'Title odds', 'Status'],
        rows: oddsOrder(odds).map((o) => [
          o.name + (o.team === focus ? ' - Bucs' : ''),
          percent(o.playoffOdds, o.clinched || o.eliminated),
          percent(o.titleOdds, o.eliminated),
          oddsStatus(o),
        ]),
      },
    ];
  }

  const csvCell = (v) => {
    const s = String(v);
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  function toCsv(tables) {
    return tables
      .map((t) => [[t.title], t.headers, ...t.rows].map((row) => row.map(csvCell).join(',') + '\r\n').join(''))
      .join('\r\n');
  }

  const xmlText = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const sheetName = (title) => title.replace(/[[\]:*?/\\]/g, '_').slice(0, 31);

  // SpreadsheetML 2003: plain XML that Excel opens directly, one sheet per table.
  function toExcelXml(tables) {
    const cell = (v) => (typeof v === 'number' && Number.isFinite(v)
      ? `<Cell><Data ss:Type="Number">${v}</Data></Cell>`
      : `<Cell><Data ss:Type="String">${xmlText(v)}</Data></Cell>`);
    const row = (cells, style) => `<Row>${cells.map((v) => cell(v).replace('<Cell>', style ? `<Cell ss:StyleID="${style}">` : '<Cell>')).join('')}</Row>`;
    const sheets = tables.map((t) =>
      `<Worksheet ss:Name="${xmlText(sheetName(t.title))}"><Table>${row(t.headers, 'head')}${t.rows.map((r) => row(r)).join('')}</Table></Worksheet>`);
    return '<?xml version="1.0" encoding="UTF-8"?>\n'
      + '<?mso-application progid="Excel.Sheet"?>\n'
      + '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">'
      + '<Styles><Style ss:ID="head"><Font ss:Bold="1"/></Style></Styles>'
      + sheets.join('') + '</Workbook>';
  }

  return { fmt, percent, oddsOrder, oddsStatus, rankingTables, resultsTable, playoffTables, toCsv, toExcelXml };
});
