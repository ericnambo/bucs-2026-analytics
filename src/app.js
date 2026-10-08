// Browser wiring for the results view.
(function () {
  const season = BaflCore.loadSeason({ games: BaflData.games, schedule: BaflData.schedule, settings: BaflSettings.defaultSettings });
  const options = BaflResults.filterOptions(season);
  const $ = (id) => document.getElementById(id);

  function addOption(select, value, text) {
    const o = document.createElement('option');
    o.value = value;
    o.textContent = text;
    select.appendChild(o);
  }
  options.weeks.forEach((w) => addOption($('week'), w, `Week ${w}`));
  options.teams.forEach((t) => addOption($('team'), t.id, t.name));

  function cell(tag, text, scope) {
    const c = document.createElement(tag);
    if (scope) c.scope = scope;
    c.textContent = text;
    return c;
  }

  function render() {
    const rows = BaflResults.resultRows(season, { week: $('week').value, team: $('team').value });
    const body = $('rows');
    body.replaceChildren();
    rows.forEach((r) => {
      const tr = document.createElement('tr');
      if (r.isBucs) tr.className = 'bucs';
      const week = cell('th', r.week, 'row');
      if (r.isBucs) {
        const tag = document.createElement('span');
        tag.className = 'note';
        tag.textContent = 'Bucs game';
        week.appendChild(tag);
      }
      tr.append(week, cell('td', r.awayName), cell('td', r.awayScore), cell('td', r.homeName), cell('td', r.homeScore));
      const notes = cell('td', '');
      r.notes.forEach((n) => {
        const s = document.createElement('span');
        s.className = 'note';
        s.textContent = n;
        notes.appendChild(s);
      });
      tr.append(notes);
      body.appendChild(tr);
    });
    $('status').textContent = `Showing ${rows.length} of ${season.games.length} games.`;
  }

  $('week').addEventListener('change', render);
  $('team').addEventListener('change', render);
  $('reset').addEventListener('click', () => { $('week').value = ''; $('team').value = ''; render(); });
  BaflExportUI.mount({ filename: 'bafl-peewee-results', getTables: () => [BaflExport.resultsTable(season, { week: $('week').value, team: $('team').value })] });
  render();
})();
