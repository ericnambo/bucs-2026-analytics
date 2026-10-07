# BAFL Peewee Analytics

Power rankings and playoff outlook for the Bay Area Buccaneers' Peewee team in the Bay Area Football League (BAFL), 2026 season.

## Language

### League structure

**Club**:
A BAFL organization that fields one team in each division (e.g. the Bay Area Buccaneers).
_Avoid_: Organization, program

**Division**:
An age/weight tier of play (Peewee, Freshman, Sophomore, Junior, Senior). This app covers Peewee only.
_Avoid_: Level, class, league

**Team**:
A club's squad within one division. "The Bucs" means the Peewee team unless stated otherwise.
_Avoid_: Club (when meaning one division's squad)

**Week**:
One numbered round of the regular-season schedule (Weeks 1-11). A team may have a bye.
_Avoid_: Round, game day

**Game**:
One contest between two teams in a week, with a final score.
_Avoid_: Match (reserve "Matchup" for the prediction view)

**Forfeit**:
A game awarded 1-0 to the opponent because a team could not field the minimum players. It counts in the record but carries no real margin.
_Avoid_: Default, walkover

### Standing and strength

**Standings**:
The official won-loss ranking from by-law 5.10.2: a win is 1 point, a tie is half, a loss is none.
_Avoid_: Rankings (reserve for power ranking)

**Capped margin**:
A game's point difference limited to 42, so blowouts do not distort strength.
_Avoid_: Point differential, spread

**Rating**:
A number estimating a team's true strength, produced by one method (e.g. Elo, opponent-adjusted margin).
_Avoid_: Score, grade

**Power rank**:
A team's position when sorted by the best back-tested rating, regardless of record.
_Avoid_: Standing, seed

**Back-test**:
Checking a rating method by predicting each past week from earlier weeks and counting how often it picks the winner.
_Avoid_: Validation, accuracy test

### Playoffs and outlook

**Seed**:
A team's playoff position by official standings and by-law tiebreakers (head-to-head, then coin flip or play-in).
_Avoid_: Rank, power rank

**Playoff picture**:
The set of top-8 seeds if the playoffs started today.
_Avoid_: Bracket (the bracket is the 1v8, 2v7, 3v6, 4v5 pairing of the picture)

**Playoff odds**:
A team's simulated chance of making the playoffs, from simulating the remaining games many times.
_Avoid_: Probability to qualify

**Contender**:
A team in the playoff picture whose power rank and playoff odds support its seed.
_Avoid_: Favorite

**Pretender**:
A team in the playoff picture whose seed is flattered by its record: its power rank or playoff odds are much weaker than its seed.
_Avoid_: Fraud, fluke

**Matchup**:
A prediction for two chosen teams: favored side, win probability, predicted margin, and common opponents.
_Avoid_: Game (a game has already been or will be played)

### Data

**Source scoreboard**:
The weekly scoreboard image a game's score was read from; every game links back to it for verification.
_Avoid_: Raw data, screenshot
