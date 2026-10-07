// Browser wiring for the power ranking view.
(function () {
  const season = BaflCore.loadSeason({ games: BaflData.games, schedule: BaflData.schedule, settings: BaflSettings.defaultSettings });
  const rows = season.powerRanking();
  const backTest = season.backTest();
  const $ = (id) => document.getElementById(id);
  let sort = { key: 'rank', direction: 'asc' };

  const fmt = {
    avgMargin: (v) => (v === null ? 'n/a' : (v > 0 ? '+' : '') + v.toFixed(1)),
    adjusted: (v) => (v === null ? 'n/a' : (v > 0 ? '+' : '') + v.toFixed(1)),
    elo: (v) => (v === null ? 'n/a' : Math.round(v)),
    sos: (v) => (v === null ? 'n/a' : v.toFixed(3)),
  };

  function buildHeader() {
    const tr = $('head-row');
    BaflRanking.columns.forEach((c) => {
      const th = document.createElement('th');
      th.scope = 'col';
      th.dataset.key = c.key;
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = c.label;
      if (c.method && c.method === backTest.best) {
        th.className = 'best';
        const tag = document.createElement('span');
        tag.className = 'note';
        tag.textContent = 'Best back-tested';
        b.appendChild(tag);
      }
      b.addEventListener('click', () => {
        sort = sort.key === c.key
          ? { key: c.key, direction: sort.direction === 'asc' ? 'desc' : 'asc' }
          : { key: c.key, direction: c.first };
        render(true);
      });
      th.appendChild(b);
      tr.appendChild(th);
    });
  }

  function cell(tag, text, scope) {
    const c = document.createElement(tag);
    if (scope) c.scope = scope;
    c.textContent = text;
    return c;
  }

  function render(announce) {
    document.querySelectorAll('#head-row th').forEach((th) => {
      if (th.dataset.key === sort.key) th.setAttribute('aria-sort', sort.direction === 'asc' ? 'ascending' : 'descending');
      else th.removeAttribute('aria-sort');
    });
    const body = $('rows');
    body.replaceChildren();
    BaflRanking.sortRows(rows, sort.key, sort.direction).forEach((r) => {
      const tr = document.createElement('tr');
      if (r.isFocus) tr.className = 'bucs';
      const team = cell('th', r.name, 'row');
      if (r.isFocus) {
        const tag = document.createElement('span');
        tag.className = 'note';
        tag.textContent = 'Bucs';
        team.appendChild(tag);
      }
      const tds = [cell('td', r.rank), team, cell('td', r.record), cell('td', fmt.avgMargin(r.avgMargin)), cell('td', fmt.adjusted(r.adjusted)), cell('td', fmt.elo(r.elo)), cell('td', fmt.sos(r.sos))];
      BaflRanking.columns.forEach((c, i) => { if (c.method && c.method === backTest.best) tds[i].className = 'best'; });
      tr.append(...tds);
      body.appendChild(tr);
    });
    if (announce) {
      const col = BaflRanking.columns.find((c) => c.key === sort.key);
      $('status').textContent = `Sorted by ${col.label}, ${sort.direction === 'asc' ? 'ascending' : 'descending'}.`;
    }
  }

  function buildBackTest() {
    const body = $('backtest-rows');
    backTest.methods.forEach((m) => {
      const tr = document.createElement('tr');
      if (m.isBest) tr.className = 'best';
      const name = cell('th', m.label, 'row');
      if (m.isBest) {
        const tag = document.createElement('span');
        tag.className = 'note';
        tag.textContent = 'Best back-tested';
        name.appendChild(tag);
      }
      tr.append(name, cell('td', m.accuracy === null ? 'n/a' : `${Math.round(m.accuracy * 100)}%`), cell('td', `${m.correct} of ${m.tested}`), cell('td', m.tested));
      body.appendChild(tr);
    });
    $('backtest-note').textContent = backTest.best
      ? `Each method rated teams on earlier weeks only, then predicted each game from Week ${backTest.startWeek} on. The best method drives Power rank and the Matchup view. Small sample: treat differences of a game or two as noise.`
      : 'No games to back-test yet. Power rank uses average capped margin.';
  }

  buildHeader();
  buildBackTest();
  render(false);
})();
