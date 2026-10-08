# 07: Simulation, odds and labels

**What to build:** Simulate the remaining scheduled games many times using the best method's win probabilities to give every team playoff odds and title odds. Teams in the playoff picture are tagged Contender or Pretender with a plain-text reason (for example, seed versus power rank). Thresholds are settings and the simulation is repeatable with a seed.

**Blocked by:** 05, 06

**Status:** done

- [x] Playoff odds and title odds shown for every team
- [x] Each team in the picture is tagged Contender or Pretender with a reason in text
- [x] Same seed gives the same results
- [x] Clinched teams show 100% and eliminated teams 0%
- [x] Core module tests use a fixed seed and assert stable properties
