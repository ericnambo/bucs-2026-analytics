// Results view logic: turns the season into table rows and filter choices.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BaflResults = factory();
})(this, function () {

  function resultRows(season, filters) {
    const week = filters && filters.week ? Number(filters.week) : null;
    const team = filters && filters.team ? filters.team : null;
    const names = new Map(season.teams.map((t) => [t.id, t.name]));
    return season.games
      .filter((g) => (!week || g.week === week) && (!team || g.home === team || g.away === team))
      .map((g) => {
        const isBucs = g.home === season.settings.focusTeam || g.away === season.settings.focusTeam;
        const notes = [];
        if (isBucs) notes.push('Bucs game');
        if (g.forfeit) notes.push('Forfeit');
        if (g.flag) notes.push(`Check extraction: ${g.flag}`);
        return {
          week: g.week,
          awayName: names.get(g.away) || g.away,
          homeName: names.get(g.home) || g.home,
          awayScore: g.awayScore,
          homeScore: g.homeScore,
          source: g.source,
          isBucs,
          notes,
        };
      });
  }

  function filterOptions(season) {
    return {
      weeks: [...new Set(season.games.map((g) => g.week))].sort((a, b) => a - b),
      teams: season.teams.map((t) => ({ id: t.id, name: t.name })).sort((a, b) => a.name.localeCompare(b.name)),
    };
  }

  return { resultRows, filterOptions };
});
