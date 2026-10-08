# 06: Rating methods and back-test

**What to build:** Add Elo and an opponent-adjusted rating as columns, back-test every method on Weeks 1-8 (rate using earlier weeks, predict each next week, count winners picked), and highlight the best back-tested column in text and style. The Power rank and the Matchup view then use the best method. Show each method's accuracy and number of games tested.

**Blocked by:** 03, 04

**Status:** done

- [x] Elo and opponent-adjusted columns appear in the ranking table
- [x] Each method shows back-test accuracy and sample size
- [x] Best method is highlighted without relying on color alone
- [x] Power rank and Matchup use the best method
- [x] Core module tests cover back-test scoring on a fixture season with a known best method
