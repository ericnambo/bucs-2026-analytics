// Browser wiring for the Playoff picture view.
(function () {
  const season = BaflCore.loadSeason({ games: BaflData.games, schedule: BaflData.schedule, settings: BaflSettings.defaultSettings });
  const picture = season.playoffPicture();
  const odds = season.odds();
  const oddsOf = new Map(odds.map((o) => [o.team, o]));
  const label = (s) => `${s.name} (${s.record})${s.isFocus ? ' - Bucs' : ''}`;

  const flags = document.getElementById('flags');
  picture.flags.forEach((f) => {
    const p = document.createElement('p');
    p.className = 'flag';
    p.textContent = `Tie flagged for seeds ${f.seeds.join(', ')}: ${f.message}`;
    flags.appendChild(p);
  });

  const seeds = document.getElementById('seeds');
  picture.seeds.forEach((s) => {
    const tr = seeds.insertRow();
    if (s.isFocus) tr.className = 'bucs';
    const seed = document.createElement('th');
    seed.scope = 'row';
    seed.textContent = s.seed;
    tr.appendChild(seed);
    const team = tr.insertCell();
    team.textContent = s.name;
    if (s.isFocus) {
      const tag = document.createElement('span');
      tag.className = 'note';
      tag.textContent = 'Bucs';
      team.appendChild(tag);
    }
    tr.insertCell().textContent = s.record;
    tr.insertCell().textContent = s.tie ? `Tied with ${s.tie.with.join(', ')}: coin flip or play-in` : 'Settled';
    const o = oddsOf.get(s.team);
    const labelCell = tr.insertCell();
    labelCell.textContent = o.label;
    const why = document.createElement('span');
    why.className = 'note';
    why.textContent = o.reason;
    labelCell.appendChild(why);
  });

  // Exact 100% / 0% only when the outcome is certain; a simulated near-certainty never rounds to them.
  const percent = (p, certain) => {
    const n = Math.round(p * 100);
    if (certain) return `${n}%`;
    return n >= 100 ? '>99%' : n < 1 ? '<1%' : `${n}%`;
  };
  const oddsBody = document.getElementById('odds');
  [...odds].sort((a, b) => b.playoffOdds - a.playoffOdds || b.titleOdds - a.titleOdds || a.name.localeCompare(b.name)).forEach((o) => {
    const tr = oddsBody.insertRow();
    if (o.team === season.settings.focusTeam) tr.className = 'bucs';
    const th = document.createElement('th');
    th.scope = 'row';
    th.textContent = o.name + (o.team === season.settings.focusTeam ? ' - Bucs' : '');
    tr.appendChild(th);
    tr.insertCell().textContent = percent(o.playoffOdds, o.clinched || o.eliminated);
    tr.insertCell().textContent = percent(o.titleOdds, o.eliminated);
    tr.insertCell().textContent = o.clinched ? 'Clinched' : o.eliminated ? 'Eliminated' : 'Alive';
  });
  document.getElementById('odds-note').textContent =
    `Simulated: the remaining scheduled games played ${season.settings.simRuns.toLocaleString()} times using the best back-tested rating. Odds are rough guides, not promises.`;

  const pairings = document.getElementById('pairings');
  picture.pairings.forEach((p) => {
    const tr = pairings.insertRow();
    const th = document.createElement('th');
    th.scope = 'row';
    th.textContent = `${p.high.seed} vs ${p.low.seed}`;
    tr.appendChild(th);
    tr.insertCell().textContent = label(p.high);
    tr.insertCell().textContent = label(p.low);
  });
})();
