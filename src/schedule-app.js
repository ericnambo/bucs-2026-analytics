// Browser wiring for the Schedule view.
(function () {
  const season = BaflCore.loadSeason({ games: BaflData.games, schedule: BaflData.schedule, settings: BaflSettings.defaultSettings });
  const body = document.getElementById('rows');
  const dateText = (d) => (d ? new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '');
  let lastWeek = null;

  season.scheduleRows().forEach((r) => {
    const tr = body.insertRow();
    if (r.isBucs) tr.className = 'bucs';
    const week = document.createElement('th');
    week.scope = 'row';
    week.textContent = r.week;
    if (r.isBucs) {
      const tag = document.createElement('span');
      tag.className = 'note';
      tag.textContent = 'Bucs game';
      week.appendChild(tag);
    }
    tr.appendChild(week);
    const status = r.forfeit ? 'Final (forfeit)' : r.played ? 'Final' : 'Scheduled';
    const byes = r.week === lastWeek ? '' : r.byes.join(', ') || 'None';
    [dateText(r.date), r.awayName, r.played ? r.awayScore : '', r.homeName, r.played ? r.homeScore : '', status, byes]
      .forEach((text) => { tr.insertCell().textContent = text; });
    lastWeek = r.week;
  });
})();
