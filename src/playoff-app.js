// Browser wiring for the Playoff picture view.
(function () {
  const season = BaflCore.loadSeason({ games: BaflData.games, schedule: BaflData.schedule, settings: BaflSettings.defaultSettings });
  const picture = season.playoffPicture();
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
  });

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
