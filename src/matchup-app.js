// Browser wiring for the Matchup view.
(function () {
  const season = BaflCore.loadSeason({ games: BaflData.games, schedule: BaflData.schedule, settings: BaflSettings.defaultSettings });
  const $ = (id) => document.getElementById(id);
  const focus = season.settings.focusTeam;
  const teams = [...season.teams].sort((a, b) => a.name.localeCompare(b.name));
  const nameOf = (id) => season.teams.find((t) => t.id === id).name;

  function fillSelect(select, value) {
    teams.forEach((t) => select.appendChild(new Option(t.name, t.id)));
    select.value = value;
  }

  const next = season.nextOpponent(focus);
  fillSelect($('team-a'), focus);
  fillSelect($('team-b'), next ? next.opponent : teams.find((t) => t.id !== focus).id);
  $('default-note').textContent = next
    ? `Defaults to the Bucs' next scheduled game: Week ${next.week}, ${next.home ? 'at home' : 'away'} against ${nameOf(next.opponent)}.`
    : 'The Bucs have no unplayed scheduled games.';

  function resultText(r) {
    return `Week ${r.week}: ${r.result} ${r.scoreFor}-${r.scoreAgainst}${r.forfeit ? ' (forfeit)' : ''}`;
  }

  function render() {
    const a = $('team-a').value;
    const b = $('team-b').value;
    const common = $('common');
    common.replaceChildren();
    if (a === b) {
      $('summary').textContent = 'Choose two different teams.';
      $('confidence').textContent = '';
      return;
    }
    const m = season.matchup(a, b);
    const pct = Math.round(m.winProbability * 100);
    $('summary').textContent = m.favored
      ? `${m.favoredName} is favored: ${pct}% win probability, predicted margin ${m.predictedMargin.toFixed(1)} points.`
      : 'Too close to call: 50% each, predicted margin 0 points.';
    $('confidence').textContent = m.confidence;

    if (!m.commonOpponents.length) {
      const p = document.createElement('p');
      p.textContent = `${m.teamA.name} and ${m.teamB.name} have no common opponents yet.`;
      common.appendChild(p);
      return;
    }
    const table = document.createElement('table');
    const cap = document.createElement('caption');
    cap.textContent = 'Results against shared opponents';
    table.appendChild(cap);
    const head = table.createTHead().insertRow();
    ['Opponent', m.teamA.name, m.teamB.name].forEach((t) => {
      const th = document.createElement('th');
      th.scope = 'col';
      th.textContent = t;
      head.appendChild(th);
    });
    const body = table.createTBody();
    m.commonOpponents.forEach((o) => {
      const tr = body.insertRow();
      const th = document.createElement('th');
      th.scope = 'row';
      th.textContent = o.name;
      tr.appendChild(th);
      [o.teamA, o.teamB].forEach((list) => {
        tr.insertCell().textContent = list.map(resultText).join('; ');
      });
    });
    const scroller = document.createElement('div');
    scroller.className = 'table-scroll';
    scroller.setAttribute('role', 'region');
    scroller.setAttribute('aria-label', cap.textContent);
    scroller.tabIndex = 0;
    scroller.appendChild(table);
    common.appendChild(scroller);
  }

  $('team-a').addEventListener('change', render);
  $('team-b').addEventListener('change', render);
  render();
})();
