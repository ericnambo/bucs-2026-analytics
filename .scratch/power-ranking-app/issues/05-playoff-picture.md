# 05: Playoff picture (as of today)

**What to build:** A view showing the top 8 seeds by official standings as if the playoffs started today, with the 1v8, 2v7, 3v6, 4v5 pairings. Ties are broken head-to-head; unresolved ties are flagged as coin flip or play-in per by-law 5.11.3 rather than silently resolved.

**Blocked by:** 02

**Status:** done

- [x] Top 8 seeds shown with record and the four first-round pairings
- [x] Head-to-head tiebreak applied between two tied teams
- [x] Three-way or unresolved ties are flagged for coin flip or play-in
- [x] Playoff size comes from the settings
- [x] Core module tests cover a clean seeding, a head-to-head tiebreak and a flagged tie
