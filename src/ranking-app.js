// Browser wiring for the power ranking view.
(function () {
  const season = BaflCore.loadSeason({ games: BaflData.games, schedule: BaflData.schedule, settings: BaflSettings.defaultSettings });
  const rows = season.powerRanking();
  const $ = (id) => document.getElementById(id);
  let sort = { key: 'rank', direction: 'asc' };

  const fmt = {
    avgMargin: (v) => (v === null ? 'n/a' : (v > 0 ? '+' : '') + v.toFixed(1)),
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
      tr.append(cell('td', r.rank), team, cell('td', r.record), cell('td', fmt.avgMargin(r.avgMargin)), cell('td', fmt.sos(r.sos)));
      body.appendChild(tr);
    });
    if (announce) {
      const col = BaflRanking.columns.find((c) => c.key === sort.key);
      $('status').textContent = `Sorted by ${col.label}, ${sort.direction === 'asc' ? 'ascending' : 'descending'}.`;
    }
  }

  buildHeader();
  render(false);
})();
