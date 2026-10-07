# 04: Matchup view

**What to build:** The user picks two teams (defaulting to the Bucs' next scheduled opponent) and sees the favored team, win probability, predicted margin, a confidence note and common opponents with scores. At this stage the prediction uses capped margin; ticket 06 swaps in the best back-tested method. First real use: Bucs vs Sagemont, Week 9.

**Blocked by:** 03

**Status:** ready-for-agent

- [ ] Defaults to the Bucs' next scheduled opponent
- [ ] Shows favored team, win probability and predicted margin
- [ ] Shows a confidence note that mentions the small sample
- [ ] Lists common opponents with each team's result against them
- [ ] Works fully by keyboard and screen reader
- [ ] Core module tests cover favored side, symmetry (swapping teams flips the result) and no common opponents
