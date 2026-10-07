Status: ready-for-agent

# Spec: Bucs Peewee Power Ranking App

## Problem Statement

As a coach or parent of the Bay Area Buccaneers Peewee team, I only have the official standings (won-loss) and a pile of weekly scoreboard images. Standings alone don't tell me how strong each team really is, who is likely to win an upcoming game (this weekend: Bucs vs Sagemont), or which teams in the playoff picture are real contenders versus pretenders flattered by their record. The scores are locked in images, so I can't sort, compare or review them.

## Solution

A local, no-server web app that turns the Peewee scores from the source scoreboards and the 2026 schedule into one data file, then offers four views: a power ranking table of all 18 teams (with the best back-tested rating highlighted), a matchup prediction for any two teams, the playoff picture with simulated playoff odds and contender/pretender labels, and a results table of every past game linked to its source scoreboard for verification. The Bucs are highlighted throughout. Everything is accessible (WCAG 2.2 AA) and exportable.

## User Stories

1. As a Bucs coach, I want to see all 18 Peewee teams in a sortable power ranking table, so that I can see where the Bucs really stand.
2. As a Bucs coach, I want each team's official record (W-L, ties as half) shown beside its power rank, so that I can compare standing against strength.
3. As a Bucs coach, I want average capped margin per game as a column, so that I can see how dominant each team is.
4. As a Bucs coach, I want strength of schedule as a column, so that I can tell whether a record was built against weak or strong opponents.
5. As a Bucs coach, I want an Elo rating column, so that I can see a running strength estimate.
6. As a Bucs coach, I want an opponent-adjusted rating column, so that margins are corrected for who each team played.
7. As a Bucs coach, I want every rating method back-tested on past weeks, so that I know which one actually predicts winners.
8. As a Bucs coach, I want the best back-tested column highlighted (in text as well as color), so that I know which number to trust.
9. As a Bucs coach, I want to see each method's back-test accuracy and sample size, so that I can judge how much to trust it.
10. As a Bucs coach, I want the Bucs row visibly highlighted, so that I can find my team instantly.
11. As a Bucs coach, I want to sort the table by any column, so that I can look at the league from different angles.
12. As a Bucs coach, I want to choose two teams and see a Matchup, so that I can prepare for an upcoming game.
13. As a Bucs coach, I want the Matchup to name the favored team and give a win probability, so that I know how likely each side is to win.
14. As a Bucs coach, I want a predicted margin in the Matchup, so that I know how close the game is expected to be.
15. As a Bucs coach, I want a confidence note on the Matchup (based on games played and back-test accuracy), so that I don't over-trust a small sample.
16. As a Bucs coach, I want to see common opponents and how each team did against them, so that I have concrete evidence behind the prediction.
17. As a Bucs coach, I want the Matchup to default to the Bucs' next scheduled opponent, so that this week's question is one click away.
18. As a Bucs coach, I want to see the playoff picture as if the playoffs started today (top 8 seeds, 1v8, 2v7, 3v6, 4v5), so that I know where the Bucs sit.
19. As a Bucs coach, I want seeds to follow the by-law tiebreakers (head-to-head, then coin flip or play-in flagged), so that the picture matches how BAFL decides.
20. As a Bucs coach, I want ties that need a coin flip or play-in clearly flagged rather than silently resolved, so that I'm not misled.
21. As a Bucs coach, I want simulated playoff odds for every team using the remaining schedule, so that I see who is likely to get in.
22. As a Bucs coach, I want simulated title odds for teams in the picture, so that I see who is likely to win it all.
23. As a Bucs coach, I want each team in the picture labeled Contender or Pretender, so that I can separate real threats from flattered records.
24. As a Bucs coach, I want the label explained in plain text (for example, "seed 3, power rank 11"), so that I understand why.
25. As a Bucs coach, I want a Results view listing every past game as a table row, so that I can review the season.
26. As a Bucs coach, I want to filter results by week and by team, so that I can find games quickly.
27. As a Bucs coach, I want each result to link to its source scoreboard image, so that I can verify the score myself.
28. As a Bucs coach, I want forfeits clearly marked in Results, so that I don't read a 1-0 as a real score.
29. As a Bucs coach, I want games with extraction problems flagged in Results, so that I know what to double-check.
30. As a parent, I want a plain, readable ranking I can understand without statistics knowledge, so that I can follow the season.
31. As a parent, I want to export the ranking and results to CSV or Excel, so that I can share them.
32. As a parent, I want a print-friendly version, so that I can print or save a PDF.
33. As a user relying on a keyboard or screen reader, I want every view to be fully operable and understandable that way, so that I can use the app (WCAG 2.2 AA).
34. As a user with color-vision differences, I want status (Bucs, Contender, Pretender, best column) shown in text, so that color is never the only signal.
35. As the data maintainer, I want all season data in one human-editable file, so that I can fix a score by hand.
36. As the data maintainer, I want to load new weeks by extracting new scoreboard images, with hand typing as a fallback, so that updates are easy.
37. As the data maintainer, I want automatic data checks (each team plays at most once per week, pairings match the schedule, both teams present), so that extraction mistakes are caught.
38. As the data maintainer, I want a 1-0 score recognized as a forfeit, so that it counts as a win without distorting margins.
39. As the data maintainer, I want the data checks to say exactly which week and game is wrong, so that I can fix it fast.
40. As the data maintainer, I want rule settings (margin cap 42, playoff size 8, forfeit and tie handling) in one place, so that I can change them without touching logic.
41. As the data maintainer, I want the division stored as a field, so that other divisions could be added later without redesign.
42. As the data maintainer, I want the app to open from a folder with no server or install, so that setup is trivial.
43. As the data maintainer, I want bye weeks ignored in all calculations, so that missing games never count as losses.
44. As a user, I want the rankings recalculated automatically when I add a week, so that I don't run extra steps.

## Implementation Decisions

- **Scope**: Peewee division only, 18 teams, 2026 season. Division is a data field so other divisions can be added later.
- **One core module** is the only logic seam. It takes season data (games, remaining schedule, settings) and exposes: a data check (problems with week and game), the power ranking table with all rating columns and back-test results, a Matchup for two teams, the playoff picture with seeds and tiebreak flags, and playoff/title odds with Contender/Pretender labels. The web page is a thin layer over it.
- **Single source of truth**: one human-editable data file for games (week, home team, away team, scores, source scoreboard reference, forfeit flag) and one for the schedule, with extraction flags where reading an image was uncertain.
- **Rating methods** (all computed, compared by back-test): win percentage with ties as half; average capped margin; Elo; opponent-adjusted margin. Strength of schedule is a separate descriptive column.
- **Back-test**: for each completed week from an early cutoff onward, rate teams using only earlier weeks, predict that week's winners, and score the method by how often it picks the winner (with the number of games reported). The best method is highlighted and drives Power rank, Matchup and simulation.
- **Matchup**: win probability and predicted margin come from the best method's rating gap; show a confidence note and common opponents with scores.
- **Playoff picture**: top 8 by official standings (win 1, tie half), seeded for 1v8, 2v7, 3v6, 4v5; ties broken head-to-head, and unresolved ties flagged as coin flip or play-in per by-law 5.11.3.
- **Simulation**: simulate the remaining scheduled games many times using the best method's win probabilities to produce playoff odds and title odds. Contender = in the picture with power rank and odds supporting the seed; Pretender = in the picture but power rank or odds much weaker than the seed. Thresholds are settings; each label carries a plain-text reason. Simulation must be repeatable (seedable).
- **Rules as settings**: margin cap 42; forfeits count in W-L but not in margin or rating; ties count one half; byes ignored; playoff size 8.
- **Data rules from by-laws**: forfeit = 1-0 win (3.2.6); standings are won-loss only (5.10.2); peewee has no overtime so ties stand (3.2.16).
- **Views**: Power ranking table, Matchup, Playoff picture, Results. Bucs always highlighted (text and style).
- **Data extraction**: Weeks 1-8 Peewee scores and the schedule are read from the images into the data files and verified by the user via the Results view and data checks. New weeks are added the same way, with hand editing as fallback. The extraction itself is a separate task from the core module.
- **Tech**: plain HTML/CSS/JS, no framework, no build step, no server; opens from a folder. Export to CSV and Excel; print stylesheet. Hosting (for example GitHub Pages) may come later.
- **Accessibility**: WCAG 2.2 AA; semantic tables, keyboard-sortable columns, visible focus, status in text not color alone.

## Testing Decisions

- A good test exercises only external behavior through the core module's public answers (rankings, matchup, playoff picture, odds, data check) using small season fixtures, and never asserts on internal math steps.
- Only the core module is unit-tested. It is built test-first, one behavior at a time, using Node's built-in test runner.
- Fixtures include: a tiny 4-team season with a known ranking; a forfeit; a tie; a bye; a head-to-head tiebreak; a three-way tie needing a coin-flip flag; a malformed season that must produce the right data-check message.
- Simulation tests use a fixed seed and assert on stable properties (odds sum to the right totals, a team with a clinched seed shows 100%, an eliminated team shows 0%), not exact random output.
- The web page is not unit-tested; it is verified by hand against WCAG 2.2 AA (keyboard only, screen reader, contrast, print).
- Prior art: none, since the repo has no code yet.

## Out of Scope

- Divisions other than Peewee (Freshman, Sophomore, Junior, Senior) beyond keeping division as a field.
- Player-level stats, rosters, weights or eligibility.
- Hosting, accounts, multi-user editing or a backend.
- Automatically reading images inside the app (extraction is done outside the app by Claude and verified by the user).
- Predicting playoff-round results beyond the odds simulation.
- Cheer and drill results.

## Further Notes

- The by-laws do not fix the 2026 playoff format; 8 teams is assumed per the user, as a setting.
- First real use: Bucs vs Sagemont, Week 9, Saturday 10/10/2026, Bucs at home.
- Eight weeks of data (about 8 games per team) is a small sample; the app should say so rather than imply precision.
- Glossary terms are defined in the repo's domain glossary and should be used consistently.
