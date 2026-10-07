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
    s.ratingScale = { ...defaultSettings.ratingScale, margin: s.marginScale, adjusted: s.marginScale, ...(overrides && overrides.ratingScale) };
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

  // Rating methods, in tie-break order for "best": when two methods back-test equally, the earlier one wins.
  const METHODS = [
    { key: 'margin', label: 'Avg capped margin', neutral: 0 },
    { key: 'adjusted', label: 'Opponent-adjusted margin', neutral: 0 },
    { key: 'elo', label: 'Elo', neutral: null },
    { key: 'winPct', label: 'Win percentage', neutral: 0.5 },
  ];

  // Elo from the games given. Ratings move once per week from that week's starting values, so game order within a week never matters.
  // Forfeits say nothing about strength and are skipped.
  function computeElo(teams, games, rules) {
    const elo = new Map(teams.map((t) => [t.id, rules.eloStart]));
    const weeks = [...new Set(games.map((g) => g.week))].sort((a, b) => a - b);
    for (const week of weeks) {
      const start = new Map(elo);
      for (const g of games) {
        if (g.week !== week || g.forfeit || !start.has(g.home) || !start.has(g.away)) continue;
        const expectedHome = 1 / (1 + Math.pow(10, (start.get(g.away) - start.get(g.home)) / 400));
        const actualHome = g.tie ? 0.5 : g.winner === g.home ? 1 : 0;
        const delta = rules.eloK * (actualHome - expectedHome);
        elo.set(g.home, elo.get(g.home) + delta);
        elo.set(g.away, elo.get(g.away) - delta);
      }
    }
    return elo;
  }

  // Opponent-adjusted margin: each team's average (margin + opponent's rating), solved by repeating until it settles, centered on zero.
  function computeAdjusted(teams, games) {
    const played = new Map(teams.map((t) => [t.id, []]));
    for (const g of games) {
      if (g.cappedMargin === null || !played.has(g.home) || !played.has(g.away)) continue;
      const homeMargin = g.winner === g.home ? g.cappedMargin : g.winner === g.away ? -g.cappedMargin : 0;
      played.get(g.home).push({ opp: g.away, margin: homeMargin });
      played.get(g.away).push({ opp: g.home, margin: -homeMargin });
    }
    const ids = teams.map((t) => t.id).filter((id) => played.get(id).length);
    let rating = new Map(ids.map((id) => [id, 0]));
    // Each pass averages the new estimate with the old one (damping), so schedules that pair teams in a strict two-sided pattern cannot oscillate.
    for (let i = 0; i < 400; i++) {
      const next = new Map(ids.map((id) => {
        const list = played.get(id);
        const fresh = list.reduce((sum, x) => sum + x.margin + (rating.get(x.opp) || 0), 0) / list.length;
        return [id, (fresh + rating.get(id)) / 2];
      }));
      const mean = [...next.values()].reduce((a, b) => a + b, 0) / ids.length;
      ids.forEach((id) => next.set(id, next.get(id) - mean));
      rating = next;
    }
    return new Map(teams.map((t) => [t.id, rating.has(t.id) ? rating.get(t.id) : null]));
  }

  // Every method's rating for every team, from the games given. null = no data for that team.
  function computeRatings(teams, games, rules) {
    const stats = new Map(teams.map((t) => [t.id, { points: 0, played: 0, marginSum: 0, marginGames: 0 }]));
    for (const g of games) {
      const home = stats.get(g.home);
      const away = stats.get(g.away);
      if (!home || !away) continue;
      home.played++; away.played++;
      if (g.tie) { home.points += rules.tiePoints; away.points += rules.tiePoints; }
      else stats.get(g.winner).points += rules.winPoints;
      if (g.cappedMargin !== null) {
        const homeMargin = g.winner === g.home ? g.cappedMargin : g.winner === g.away ? -g.cappedMargin : 0;
        home.marginSum += homeMargin; home.marginGames++;
        away.marginSum -= homeMargin; away.marginGames++;
      }
    }
    const elo = computeElo(teams, games, rules);
    const adjusted = computeAdjusted(teams, games);
    return new Map(teams.map((t) => {
      const s = stats.get(t.id);
      return [t.id, {
        margin: s.marginGames ? s.marginSum / s.marginGames : null,
        adjusted: adjusted.get(t.id),
        elo: s.played ? elo.get(t.id) : null,
        winPct: s.played ? s.points / s.played : null,
      }];
    }));
  }

  // A rating usable for prediction: teams with no data get a neutral value.
  const ratingValue = (method, rules, r) => {
    const v = r[method.key];
    if (v !== null && v !== undefined) return v;
    return method.neutral === null ? rules.eloStart : method.neutral;
  };

  // Back-test: for each completed week from the cutoff on, rate teams using only earlier weeks, predict each game's winner,
  // and count the winners picked. Ties and forfeits are not tested; a method with equal ratings makes no pick for that game.
  function buildBackTest(teams, games, rules) {
    const tally = new Map(METHODS.map((m) => [m.key, { tested: 0, correct: 0 }]));
    const weeks = [...new Set(games.map((g) => g.week))].filter((w) => w >= rules.backTestStartWeek).sort((a, b) => a - b);
    for (const week of weeks) {
      const ratings = computeRatings(teams, games.filter((g) => g.week < week), rules);
      for (const g of games) {
        if (g.week !== week || g.tie || g.forfeit || !ratings.has(g.home) || !ratings.has(g.away)) continue;
        for (const m of METHODS) {
          const gap = ratingValue(m, rules, ratings.get(g.home)) - ratingValue(m, rules, ratings.get(g.away));
          if (gap === 0) continue;
          const t = tally.get(m.key);
          t.tested++;
          if ((gap > 0 ? g.home : g.away) === g.winner) t.correct++;
        }
      }
    }
    const methods = METHODS.map((m) => {
      const { tested, correct } = tally.get(m.key);
      return { key: m.key, label: m.label, tested, correct, accuracy: tested ? correct / tested : null, isBest: false };
    });
    let best = null;
    for (const m of methods) if (m.accuracy !== null && (best === null || m.accuracy > best.accuracy)) best = m;
    if (best) best.isBest = true;
    return { startWeek: rules.backTestStartWeek, methods, best: best ? best.key : null };
  }

  // The method that drives Power rank and Matchup: the best back-tested one, or capped margin until there is something to test.
  const bestMethod = (backTest) => METHODS.find((m) => m.key === (backTest.best || 'margin'));

  // One row per team: record (ties half), average capped margin, strength of schedule, the other ratings.
  // Forfeits count in the record but carry no margin. Teams with no games (byes) are never charged a loss.
  function buildPowerRanking(teams, games, rules, backTest) {
    const method = bestMethod(backTest);
    const ratings = computeRatings(teams, games, rules);
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
        elo: ratings.get(s.team).elo,
        adjusted: ratings.get(s.team).adjusted,
        rating: ratings.get(s.team)[method.key],
        ratingMethod: method.key,
        sos: oppPcts.length ? oppPcts.reduce((a, b) => a + b, 0) / oppPcts.length : null,
      };
    });
    // Default order: best back-tested rating, then record, then name. No data sorts last.
    const num = (v) => (v === null ? -Infinity : v);
    rows.sort((a, b) => num(b.rating) - num(a.rating) || num(b.winPct) - num(a.winPct) || a.name.localeCompare(b.name));
    rows.forEach((r, i) => { r.rank = i + 1; });
    return rows;
  }

  const logistic = (gap, scale) => 1 / (1 + Math.exp(-gap / scale));

  // Small seedable random number generator (mulberry32), so a simulation can be repeated exactly.
  function makeRandom(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Matchup from the best back-tested method's rating gap.
  // Win probability is a logistic curve of the gap; the method's scale sets how fast it saturates.
  // Predicted margin reads the same curve in points: gap / scale * marginScale.
  function buildMatchup(teams, games, rules, backTest, rows, idA, idB) {
    const names = new Map(teams.map((t) => [t.id, t.name]));
    const rowOf = new Map(rows.map((r) => [r.team, r]));
    const method = bestMethod(backTest);
    const scale = rules.ratingScale[method.key];
    const rating = (id) => ratingValue(method, rules, { [method.key]: rowOf.get(id).rating });
    const gap = rating(idA) - rating(idB);
    const pA = logistic(gap, scale);
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
    const bestResult = backTest.methods.find((m) => m.isBest);
    const confidence = `Small sample: ${names.get(idA)} has played ${rowOf.get(idA).games} games and ${names.get(idB)} ${rowOf.get(idB).games}. `
      + (bestResult
        ? `This prediction uses ${method.label}, the best back-tested method: it picked ${bestResult.correct} of ${bestResult.tested} winners (${Math.round(bestResult.accuracy * 100)}%) from Week ${backTest.startWeek} on. Treat it as a rough guide.`
        : `This prediction uses ${method.label} and has not been back-tested yet, so treat it as a rough guide.`);
    return {
      teamA: { id: idA, name: names.get(idA), rating: rating(idA), winProbability: pA },
      teamB: { id: idB, name: names.get(idB), rating: rating(idB), winProbability: 1 - pA },
      favored,
      favoredName: favored ? names.get(favored) : null,
      winProbability: logistic(Math.abs(gap), scale),
      predictedMargin: (Math.abs(gap) / scale) * rules.marginScale,
      method: method.key,
      confidence,
      commonOpponents,
    };
  }

  // Top seeds by official standings (win 1, tie half). Tied teams are split head-to-head;
  // anything head-to-head cannot split is flagged for coin flip or play-in (by-law 5.11.3), never silently resolved.
  // With a random source (simulation only), ties head-to-head cannot split are settled by coin flip instead of flagged order.
  function buildPlayoffPicture(teams, games, rules, random) {
    const flip = (group) => {
      if (!random) return group;
      const out = [...group];
      for (let k = out.length - 1; k > 0; k--) {
        const m = Math.floor(random() * (k + 1));
        [out[k], out[m]] = [out[m], out[k]];
      }
      return out;
    };
    const names = new Map(teams.map((t) => [t.id, t.name]));
    const rows = new Map(teams.map((t) => [t.id, { team: t.id, name: t.name, isFocus: t.id === rules.focusTeam, wins: 0, losses: 0, ties: 0 }]));
    for (const g of games) {
      if (!rows.has(g.home) || !rows.has(g.away)) continue;
      if (g.tie) { rows.get(g.home).ties++; rows.get(g.away).ties++; }
      else { rows.get(g.winner).wins++; rows.get(g.loser).losses++; }
    }
    const points = (r) => r.wins * rules.winPoints + r.ties * rules.tiePoints;
    const standings = [...rows.values()].sort((a, b) => points(b) - points(a) || a.name.localeCompare(b.name));

    // Points each team earned in games among the tied teams only.
    const headToHead = (group) => {
      const ids = new Set(group.map((r) => r.team));
      const pts = new Map(group.map((r) => [r.team, 0]));
      for (const g of games) {
        if (!ids.has(g.home) || !ids.has(g.away)) continue;
        if (g.tie) { pts.set(g.home, pts.get(g.home) + rules.tiePoints); pts.set(g.away, pts.get(g.away) + rules.tiePoints); }
        else pts.set(g.winner, pts.get(g.winner) + rules.winPoints);
      }
      return pts;
    };

    const ordered = [];
    const flags = [];
    for (let i = 0; i < standings.length;) {
      let j = i;
      while (j < standings.length && points(standings[j]) === points(standings[i])) j++;
      const group = standings.slice(i, j);
      const inField = i < rules.playoffTeams;
      if (group.length === 1) ordered.push({ row: group[0], tie: null });
      else if (group.length === 2) {
        const h2h = headToHead(group);
        const [x, y] = group;
        if (h2h.get(x.team) !== h2h.get(y.team)) {
          (h2h.get(x.team) > h2h.get(y.team) ? [x, y] : [y, x]).forEach((row) => ordered.push({ row, tie: null }));
        } else flip(group).forEach((row) => ordered.push({ row, tie: { kind: 'coin-flip-or-play-in', group } }));
      } else flip(group).forEach((row) => ordered.push({ row, tie: { kind: 'coin-flip-or-play-in', group } }));
      if (inField && ordered.slice(i, j).some((o) => o.tie)) {
        const tiedNames = group.map((r) => r.name);
        flags.push({
          teams: tiedNames,
          seeds: group.map((_, k) => i + k + 1),
          message: `${tiedNames.join(', ')} are tied and head-to-head does not settle it. Coin flip or play-in needed (by-law 5.11.3).`,
        });
      }
      i = j;
    }

    const seeds = ordered.slice(0, rules.playoffTeams).map(({ row, tie }, k) => ({
      seed: k + 1,
      team: row.team,
      name: row.name,
      isFocus: row.isFocus,
      wins: row.wins,
      losses: row.losses,
      ties: row.ties,
      record: `${row.wins}-${row.losses}${row.ties ? '-' + row.ties : ''}`,
      tie: tie ? { kind: tie.kind, with: tie.group.filter((r) => r.team !== row.team).map((r) => names.get(r.team)) } : null,
    }));
    const pairings = [];
    for (let k = 0; k < Math.floor(seeds.length / 2); k++) pairings.push({ high: seeds[k], low: seeds[seeds.length - 1 - k] });
    return { size: rules.playoffTeams, seeds, pairings, flags };
  }

  // Plays the unplayed scheduled games many times using the best method's win probabilities, then the playoffs.
  // Playoff rounds re-seed (best remaining seed meets worst); an odd team out gets a bye. Ties head-to-head cannot split are coin flips.
  // Playoff odds = share of runs in the top seeds; title odds = share of runs that win the playoffs.
  // Contender/Pretender go to teams in today's playoff picture (see settings for thresholds); each carries its reason in text.
  function buildOdds(teams, games, scheduled, rules, backTest, rows, options) {
    const runs = (options && options.runs) || rules.simRuns;
    const seed = options && options.seed !== undefined ? options.seed : rules.simSeed;
    const random = makeRandom(seed);
    const method = bestMethod(backTest);
    const scale = rules.ratingScale[method.key];
    const rowOf = new Map(rows.map((r) => [r.team, r]));
    const rating = (id) => ratingValue(method, rules, { [method.key]: rowOf.get(id).rating });
    const beats = (a, b) => logistic(rating(a) - rating(b), scale);

    const done = new Set(games.map((g) => `${g.week}|${g.home}|${g.away}`));
    const remaining = scheduled.filter((g) => !done.has(`${g.week}|${g.home}|${g.away}`));
    const playoffCount = new Map(teams.map((t) => [t.id, 0]));
    const titleCount = new Map(teams.map((t) => [t.id, 0]));

    for (let run = 0; run < runs; run++) {
      const simulated = remaining.map((g) => {
        const homeWins = random() < beats(g.home, g.away);
        return { week: g.week, home: g.home, away: g.away, tie: false, forfeit: false, winner: homeWins ? g.home : g.away, loser: homeWins ? g.away : g.home };
      });
      let field = buildPlayoffPicture(teams, [...games, ...simulated], rules, random).seeds.map((s) => s.team);
      field.forEach((id) => playoffCount.set(id, playoffCount.get(id) + 1));
      while (field.length > 1) {
        const next = [];
        let lo = 0;
        let hi = field.length - 1;
        for (; lo < hi; lo++, hi--) next.push(random() < beats(field[lo], field[hi]) ? field[lo] : field[hi]);
        if (lo === hi) next.push(field[lo]);
        field = next;
      }
      if (field.length) titleCount.set(field[0], titleCount.get(field[0]) + 1);
    }

    const seedOf = new Map(buildPlayoffPicture(teams, games, rules).seeds.map((s) => [s.team, s.seed]));
    // 100% and 0% are kept for certain outcomes; a simulated near-certainty reads >99% or <1% (same as the page).
    const pct = (p) => {
      const n = Math.round(p * 100);
      return p === 0 || p === 1 ? `${p * 100}%` : n >= 100 ? '>99%' : n < 1 ? '<1%' : `${n}%`;
    };
    return teams.map((t) => {
      const playoffOdds = playoffCount.get(t.id) / runs;
      const titleOdds = titleCount.get(t.id) / runs;
      const seedNum = seedOf.get(t.id);
      const powerRank = rowOf.get(t.id).rank;
      let label = null;
      let reason = null;
      if (seedNum) {
        const gap = powerRank - seedNum;
        const why = [];
        if (gap >= rules.pretenderRankGap) why.push(`its power rank is ${gap} places below its seed`);
        if (playoffOdds < rules.pretenderMinOdds) why.push(`its playoff odds are under ${pct(rules.pretenderMinOdds)}`);
        label = why.length ? 'Pretender' : 'Contender';
        reason = `Seed ${seedNum}, power rank ${powerRank}, playoff odds ${pct(playoffOdds)}: `
          + (why.length ? `${why.join(' and ')}.` : 'power rank and odds support the seed.');
      }
      return { team: t.id, name: t.name, playoffOdds, titleOdds, clinched: playoffOdds === 1, eliminated: playoffOdds === 0, label, reason };
    });
  }

  function loadSeason({ games, schedule, settings }) {
    const rules = mergeSettings(settings);
    const teams = schedule.teams;
    const scheduled = schedule.games;
    const normalized = games.games.map((g) => normalizeGame(g, rules));
    const backTest = buildBackTest(teams, normalized, rules);
    const powerRanking = () => buildPowerRanking(teams, normalized, rules, backTest);
    return {
      powerRanking,
      backTest: () => backTest,
      playoffPicture: () => buildPlayoffPicture(teams, normalized, rules),
      odds: (options) => buildOdds(teams, normalized, scheduled, rules, backTest, powerRanking(), options),
      matchup: (idA, idB) => buildMatchup(teams, normalized, rules, backTest, powerRanking(), idA, idB),
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
