# 07: Simulation, odds and labels

**What to build:** Simulate the remaining scheduled games many times using the best method's win probabilities to give every team playoff odds and title odds. Teams in the playoff picture are tagged Contender or Pretender with a plain-text reason (for example, seed versus power rank). Thresholds are settings and the simulation is repeatable with a seed.

**Blocked by:** 05, 06

**Status:** ready-for-agent

- [ ] Playoff odds and title odds shown for every team
- [ ] Each team in the picture is tagged Contender or Pretender with a reason in text
- [ ] Same seed gives the same results
- [ ] Clinched teams show 100% and eliminated teams 0%
- [ ] Core module tests use a fixed seed and assert stable properties
