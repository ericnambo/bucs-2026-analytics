// Rule settings: the one place to change how the league rules are applied.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BaflSettings = factory();
})(this, function () {
  const defaultSettings = {
    // A game's point difference is limited to this many points (CONTEXT: Capped margin).
    marginCap: 42,
    // The team the app highlights as "the Bucs".
    focusTeam: 'bay-area-buccaneers',
    // Size of the playoff field (assumed per the user; by-laws do not fix it).
    playoffTeams: 8,
    // Forfeit = 1-0 win (by-law 3.2.6). Counts in the record, not in margin or rating.
    forfeit: { winnerScore: 1, loserScore: 0, countsInMargin: false },
    // Standings points (by-law 5.10.2): win 1, tie half, loss none.
    winPoints: 1,
    tiePoints: 0.5,
    // Matchup: points of rating gap per logistic step; larger = probabilities stay closer to 50%.
    marginScale: 14,
    // Back-test starts at this week: teams are rated on earlier weeks only, so Weeks 1-2 build the first ratings.
    backTestStartWeek: 3,
    // Elo: starting rating and how far one game can move it.
    eloStart: 1500,
    eloK: 32,
    // Rating gap per logistic step for each method (margin methods use marginScale; Elo uses the standard 400-point scale).
    ratingScale: { elo: 400 / Math.LN10, winPct: 0.3 },
    // Simulation: how many seasons to play out, and the seed that makes the result repeatable.
    simRuns: 5000,
    simSeed: 2026,
    // Pretender: a team in the playoff picture whose power rank is this many places below its seed or more,
    // or whose playoff odds are under the minimum. Otherwise Contender.
    pretenderRankGap: 4,
    pretenderMinOdds: 0.5,
  };
  return { defaultSettings };
});
