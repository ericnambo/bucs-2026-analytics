// Core module: loads season data, applies rule settings, and checks the data.
// Plain script that works in Node (require) and in the browser (window.BaflCore).
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./settings').defaultSettings);
  } else {
    root.BaflCore = factory(root.BaflSettings.defaultSettings);
  }
})(this, function (defaultSettings) {
  const isScore = (n) => Number.isInteger(n) && n >= 0;

  function mergeSettings(overrides) {
    const s = { ...defaultSettings, ...overrides };
    s.forfeit = { ...defaultSettings.forfeit, ...(overrides && overrides.forfeit) };
    return s;
  }

  function isForfeitScore(game, settings) {
    const { winnerScore, loserScore } = settings.forfeit;
    const hi = Math.max(game.homeScore, game.awayScore);
    const lo = Math.min(game.homeScore, game.awayScore);
    return hi === winnerScore && lo === loserScore;
  }

  function normalizeGame(game, settings) {
    const { homeScore, awayScore } = game;
    const tie = homeScore === awayScore;
    const winner = tie ? null : homeScore > awayScore ? game.home : game.away;
    const loser = tie ? null : winner === game.home ? game.away : game.home;
    const forfeit = game.forfeit === true;
    const margin = Math.abs(homeScore - awayScore);
    const noMargin = forfeit && !settings.forfeit.countsInMargin;
    return {
      week: game.week,
      home: game.home,
      away: game.away,
      homeScore,
      awayScore,
      source: game.source,
      forfeit,
      flag: game.flag || null,
      tie,
      winner,
      loser,
      cappedMargin: noMargin ? null : Math.min(margin, settings.marginCap),
    };
  }

  // One row per team: record (ties half), average capped margin, strength of schedule.
  // Forfeits count in the record but carry no margin. Teams with no games (byes) are never charged a loss.
  function buildPowerRanking(teams, games, rules) {
    const stats = new Map(teams.map((t) => [t.id, { team: t.id, name: t.name, wins: 0, losses: 0, ties: 0, marginSum: 0, marginGames: 0, opponents: [] }]));
    for (const g of games) {
      const home = stats.get(g.home);
      const away = stats.get(g.away);
      if (!home || !away) continue;
      home.opponents.push(g.away);
      away.opponents.push(g.home);
      if (g.tie) { home.ties++; away.ties++; }
      else { stats.get(g.winner).wins++; stats.get(g.loser).losses++; }
      if (g.cappedMargin !== null) {
        const homeMargin = g.winner === g.home ? g.cappedMargin : g.winner === g.away ? -g.cappedMargin : 0;
        home.marginSum += homeMargin; home.marginGames++;
        away.marginSum -= homeMargin; away.marginGames++;
      }
    }
    const played = (s) => s.wins + s.losses + s.ties;
    const points = (s) => s.wins * rules.winPoints + s.ties * rules.tiePoints;
    const winPct = (s) => (played(s) ? points(s) / played(s) : null);
    const rows = [...stats.values()].map((s) => {
      const oppPcts = s.opponents.map((id) => winPct(stats.get(id))).filter((p) => p !== null);
      return {
        team: s.team,
        name: s.name,
        isFocus: s.team === rules.focusTeam,
        games: played(s),
        wins: s.wins,
        losses: s.losses,
        ties: s.ties,
        record: `${s.wins}-${s.losses}${s.ties ? '-' + s.ties : ''}`,
        winPct: winPct(s),
        avgMargin: s.marginGames ? s.marginSum / s.marginGames : null,
        sos: oppPcts.length ? oppPcts.reduce((a, b) => a + b, 0) / oppPcts.length : null,
      };
    });
    // Default order: capped margin, then record, then name. No data sorts last.
    const num = (v) => (v === null ? -Infinity : v);
    rows.sort((a, b) => num(b.avgMargin) - num(a.avgMargin) || num(b.winPct) - num(a.winPct) || a.name.localeCompare(b.name));
    rows.forEach((r, i) => { r.rank = i + 1; });
    return rows;
  }

  // Matchup from capped margin (ticket 06 swaps in the best back-tested method).
  // Win probability is a logistic curve of the rating gap; marginScale sets how fast it saturates.
  function buildMatchup(teams, games, rules, rows, idA, idB) {
    const names = new Map(teams.map((t) => [t.id, t.name]));
    const rowOf = new Map(rows.map((r) => [r.team, r]));
    const rating = (id) => rowOf.get(id).avgMargin || 0;
    const gap = rating(idA) - rating(idB);
    const pA = 1 / (1 + Math.exp(-gap / rules.marginScale));
    const favored = gap === 0 ? null : gap > 0 ? idA : idB;
    const resultsOf = (id, opp) => games
      .filter((g) => (g.home === id && g.away === opp) || (g.away === id && g.home === opp))
      .map((g) => {
        const mine = g.home === id;
        return {
          week: g.week,
          scoreFor: mine ? g.homeScore : g.awayScore,
          scoreAgainst: mine ? g.awayScore : g.homeScore,
          result: g.tie ? 'T' : g.winner === id ? 'W' : 'L',
          forfeit: g.forfeit,
        };
      })
      .sort((x, y) => x.week - y.week);
    const opponentsOf = (id) => new Set(games.filter((g) => g.home === id || g.away === id).map((g) => (g.home === id ? g.away : g.home)));
    const oppB = opponentsOf(idB);
    const commonOpponents = [...opponentsOf(idA)]
      .filter((id) => oppB.has(id) && id !== idA && id !== idB)
      .sort((x, y) => names.get(x).localeCompare(names.get(y)))
      .map((id) => ({ id, name: names.get(id), teamA: resultsOf(idA, id), teamB: resultsOf(idB, id) }));
    const confidence = `Small sample: ${names.get(idA)} has played ${rowOf.get(idA).games} games and ${names.get(idB)} ${rowOf.get(idB).games}. `
      + 'This prediction uses average capped margin only and has not been back-tested yet, so treat it as a rough guide.';
    return {
      teamA: { id: idA, name: names.get(idA), rating: rating(idA), winProbability: pA },
      teamB: { id: idB, name: names.get(idB), rating: rating(idB), winProbability: 1 - pA },
      favored,
      favoredName: favored ? names.get(favored) : null,
      winProbability: 1 / (1 + Math.exp(-Math.abs(gap) / rules.marginScale)),
      predictedMargin: Math.abs(gap),
      confidence,
      commonOpponents,
    };
  }

  function loadSeason({ games, schedule, settings }) {
    const rules = mergeSettings(settings);
    const teams = schedule.teams;
    const scheduled = schedule.games;
    const normalized = games.games.map((g) => normalizeGame(g, rules));
    return {
      powerRanking: () => buildPowerRanking(teams, normalized, rules),
      matchup: (idA, idB) => buildMatchup(teams, normalized, rules, buildPowerRanking(teams, normalized, rules), idA, idB),
      // First scheduled game for the team with no result yet.
      nextOpponent(id) {
        const done = new Set(normalized.map((g) => `${g.week}|${g.home}|${g.away}`));
        const next = scheduled
          .filter((g) => (g.home === id || g.away === id) && !done.has(`${g.week}|${g.home}|${g.away}`))
          .sort((a, b) => a.week - b.week)[0];
        return next ? { week: next.week, opponent: next.home === id ? next.away : next.home, home: next.home === id } : null;
      },
      division: schedule.division,
      settings: rules,
      teams,
      schedule: scheduled,
      games: normalized,
      // Every scheduled game, with its score once played, and the teams on bye that week.
      scheduleRows() {
        const names = new Map(teams.map((t) => [t.id, t.name]));
        const dates = new Map((schedule.weeks || []).map((w) => [w.week, w.date]));
        const result = new Map(normalized.map((g) => [`${g.week}|${g.home}|${g.away}`, g]));
        return [...scheduled].sort((a, b) => a.week - b.week).map((g) => {
          const r = result.get(`${g.week}|${g.home}|${g.away}`);
          return {
            week: g.week,
            date: dates.get(g.week) || null,
            home: g.home,
            away: g.away,
            homeName: names.get(g.home),
            awayName: names.get(g.away),
            homeScore: r ? r.homeScore : null,
            awayScore: r ? r.awayScore : null,
            played: Boolean(r),
            forfeit: Boolean(r && r.forfeit),
            isBucs: g.home === rules.focusTeam || g.away === rules.focusTeam,
            byes: this.byes(g.week).map((id) => names.get(id)),
          };
        });
      },
      // Teams with no scheduled game in a week. Byes are ignored in all calculations.
      byes(week) {
        const playing = new Set();
        scheduled.filter((g) => g.week === week).forEach((g) => { playing.add(g.home); playing.add(g.away); });
        return teams.map((t) => t.id).filter((id) => !playing.has(id));
      },
    };
  }

  function checkSeason({ games, schedule, settings }) {
    const rules = mergeSettings(settings);
    const names = new Map(schedule.teams.map((t) => [t.id, t.name]));
    const name = (id) => names.get(id) || id;
    const label = (g) => `${name(g.away)} @ ${name(g.home)}`;
    const problems = [];
    const add = (week, game, code, message) => problems.push({ week, game, code, message });

    const played = games.games;
    const weeks = [...new Set(played.map((g) => g.week))].sort((a, b) => a - b);

    for (const g of played) {
      const where = `Week ${g.week}, ${label(g)}`;
      for (const id of [g.home, g.away]) {
        if (!names.has(id)) add(g.week, label(g), 'unknown-team', `${where}: team "${id}" is not in the schedule's team list.`);
      }
      if (!isScore(g.homeScore) || !isScore(g.awayScore)) {
        add(g.week, label(g), 'bad-score', `${where}: score is missing or not a whole number (${g.awayScore} - ${g.homeScore}).`);
        continue;
      }
      if (isForfeitScore(g, rules) !== (g.forfeit === true)) {
        const { winnerScore, loserScore } = rules.forfeit;
        add(g.week, label(g), 'forfeit-flag-mismatch',
          `${where}: score is ${g.awayScore}-${g.homeScore} but forfeit flag is ${g.forfeit === true ? 'set' : 'not set'} (a forfeit is ${winnerScore}-${loserScore}).`);
      }
    }

    for (const week of weeks) {
      const inWeek = played.filter((g) => g.week === week);
      const count = new Map();
      for (const g of inWeek) for (const id of [g.home, g.away]) count.set(id, (count.get(id) || 0) + 1);
      for (const [id, n] of count) {
        if (n > 1) add(week, null, 'team-plays-twice', `Week ${week}: ${name(id)} appears in ${n} games.`);
      }

      const sched = schedule.games.filter((g) => g.week === week);
      const key = (g) => `${g.home}|${g.away}`;
      const scheduledKeys = new Set(sched.map(key));
      for (const g of inWeek) {
        if (!scheduledKeys.has(key(g))) {
          add(week, label(g), 'pairing-mismatch', `Week ${week}, ${label(g)}: this pairing is not on the schedule for that week.`);
        }
      }

      const playedKeys = new Set(inWeek.map(key));
      for (const s of sched) {
        if (playedKeys.has(key(s))) continue;
        for (const id of [s.home, s.away]) {
          if (!count.has(id)) add(week, label(s), 'missing-team', `Week ${week}: ${name(id)} has no result but is scheduled (${label(s)}).`);
        }
      }
    }

    return { ok: problems.length === 0, problems };
  }

  return { loadSeason, checkSeason };
});
