// Rule settings: the one place to change how the league rules are applied.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BaflSettings = factory();
})(this, function () {
  const defaultSettings = {
    // A game's point difference is limited to this many points (CONTEXT: Capped margin).
    marginCap: 42,
    // Size of the playoff field (assumed per the user; by-laws do not fix it).
    playoffTeams: 8,
    // Forfeit = 1-0 win (by-law 3.2.6). Counts in the record, not in margin or rating.
    forfeit: { winnerScore: 1, loserScore: 0, countsInMargin: false },
    // Standings points (by-law 5.10.2): win 1, tie half, loss none.
    winPoints: 1,
    tiePoints: 0.5,
  };
  return { defaultSettings };
});
