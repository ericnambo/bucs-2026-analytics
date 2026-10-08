# Spec: Publish the BAFL Peewee app with a coach gate and a phone-friendly look

Status: ready-for-agent

Source: the decisions in `map.md` (every ticket there is resolved) and the research in `research/`. Read those for the reasoning; this spec holds the build.

## Problem Statement

The BAFL Peewee analytics app only runs from a folder on the owner's computer. Parents across the league cannot see standings, power rankings, the schedule or results, and the owner cannot open it on a phone at practice. Two views, Matchup and Playoff picture, are coach-only analysis and should not be shown to every parent without a light lock. The pages were also built for wide screens (wide tables, no phone layout), so on a phone they are hard to use.

## Solution

Publish the app as a public website with a free, no-build host (GitHub Pages, default URL). Parents see Results, Power ranking and Schedule freely. Matchup and Playoff picture sit behind a "Coach access" form that accepts any of 8 shared coach passwords and remembers the coach on that device until they lock it. This is a soft gate: it hides the pages, not the data, and the app says nothing that over-promises privacy. A small amount of responsive CSS makes every page usable on a phone (wide tables scroll sideways) and the scoreboard links, which would be broken, are hidden. The restyle to Material 3 token names comes after publishing, as separate work.

## User Stories

1. As a parent, I want to open the app at a public web address, so that I can check the Bucs and the league without being sent files.
2. As a parent, I want to see Results, Power ranking and Schedule without a password, so that I am not blocked from the basics.
3. As a parent on a phone, I want every public page to fit and scroll sensibly, so that I can read it at the field.
4. As a parent on a phone, I want wide tables to scroll sideways inside the page instead of breaking the layout, so that I can read every column.
5. As a parent, I want the Results page to show scores without dead "scoreboard" links, so that nothing I tap leads to an error.
6. As a parent, I want Matchup and Playoff picture to be clearly marked for coaches, so that I understand why I am asked for a password.
7. As a parent who taps a coach page, I want a short plain explanation and a way back to the public pages, so that I am not stuck.
8. As a coach, I want to enter my password once on my phone and stay unlocked, so that I do not retype it at every practice.
9. As a coach, I want a visible Lock control, so that I can clear access on a shared or borrowed device.
10. As a coach, I want a wrong password to tell me so in text, so that I know to try again without losing what I typed.
11. As a coach, I want to paste or autofill my password, so that I am not forced to type it on a phone.
12. As a coach, I want focus to land on the page content after I unlock, so that I can start using Matchup or Playoff picture at once.
13. As a coach on Matchup, I want the same prediction and common-opponents view as before once unlocked, so that nothing about the analysis changes.
14. As a coach on Playoff picture, I want seeds, tiebreak flags, odds, labels and export to work as before once unlocked, so that nothing regresses.
15. As the owner, I want 8 separate passwords, so that I can retire one coach's password without changing the rest.
16. As the owner, I want to change or revoke a password by editing a list and republishing, so that I need no server or accounts.
17. As the owner, I want the real passwords kept out of the repository, on paper and in my phone notes, so that publishing the repo does not publish them.
18. As the owner, I want hashes in the repo to be unlabeled, so that they do not name coaches.
19. As the owner, I want the gate wording to say "Coach access" and not promise privacy, so that nobody believes the data is secret.
20. As a screen reader user, I want the password field labeled, errors announced, and focus managed, so that the gate is usable without sight.
21. As a keyboard-only user, I want to reach, fill and submit the gate and the Lock control without a mouse, so that I am not locked out.
22. As the owner, I want the first published version to keep today's look, so that publishing is small and any problem is easy to trace.
23. As the owner, I want the public site to expose no personal data, tokens or private files, so that making the repo public is safe.
24. As the owner, I want the app to keep opening from a plain folder too, so that the no-build, no-server rule still holds.
25. As a future maintainer, I want a test of the password check, so that I can change the gate without breaking who gets in.
26. As the owner, I want the later Material 3 restyle to start from plain responsive pages, so that it builds on a working phone layout.

## Implementation Decisions

- **Hosting**: GitHub Pages, public repository, default URL. No custom domain for now. Publishing needs no build step because the app is plain HTML/CSS/JS. Making the repository public also publishes all of its history and tracked files; the audit found no secrets or personal data, and the raw scoreboard images, schedule image and by-laws PDF were never committed.
- **Stack constraint stays**: plain HTML/CSS/JS, no framework, no build step, no server. The earlier spec's tech rule is unchanged.
- **Gate scope**: only Matchup and Playoff picture are gated. Results, Power ranking and Schedule stay public. The Offense/Defense rankings idea stays public too, so no gated-only data exists.
- **Soft gate, honestly**: gated pages load the same data and scripts as public pages, so the gate hides only the rendered page. Copy must not say "private" or "secure"; the form is headed "Coach access" with a short line that these pages are for coaches.
- **One new module, the gate**: written in the same dual browser/Node style as the other modules. Its public answer is: given a typed password and the list of accepted hashes, is access granted? It uses SHA-256 and returns a yes/no. It is the only logic the spec adds.
- **Password list**: 8 SHA-256 hashes, unlabeled, held in one place the gate reads. Changing or revoking a password means editing that list and republishing. The real passwords live only on paper and in the owner's phone notes, never in the repository, issues, specs or commit messages.
- **Unlock memory**: remembered on the device (local storage) with a visible Lock control that clears it. If storage is unavailable the gate must still work for the current page view.
- **Prompt**: an inline form that replaces the main content of Matchup and Playoff picture (no pop-up dialog, no focus trap). Labeled password input with autocomplete for a current password; paste and autofill allowed (WCAG 3.3.8); the error is text with an alert role and an invalid state on the input; the field is not cleared on error; a visible way back to the public pages (for example Results). After unlock, focus moves to the main content, which is already focusable.
- **Navigation**: Matchup and Playoff picture stay visible to everyone in the nav. The current-page style and skip link behave as today.
- **Scoreboard links hidden**: in the first public version the Results page does not show "Week N scoreboard" links. Whether the export keeps each game's scoreboard filename while links are hidden is an implementation call; either is acceptable, and it must be recorded in the ticket that does it. Whether the column stays at all is a later question.
- **Minimal phone layout**: part of the first publish. Wide tables on every page scroll sideways inside their container without breaking the page, and text and controls remain readable and meet the existing target-size and focus rules. This is not the full restyle.
- **Material 3 restyle (later, separate work)**: hand-rolled responsive CSS using Material 3 token names as CSS custom properties in one tokens file; no library and no CDN dependency. The owner carries the accessibility work and uses the earlier audit notes as the regression check. USWDS is the documented fallback.
- **Order**: publish first with today's look plus the minimal phone fix and the gate; restyle afterwards.
- **Existing behavior unchanged**: rankings, matchup, playoff picture, odds, labels, export and print all produce the same results as before.

## Testing Decisions

- A good test checks only external behavior through the gate module's public answer, never how the hash is computed internally or how the page draws the form.
- Tested module: the gate (new seam; the only one). It is built test-first with Node's built-in test runner, matching the existing modules' tests.
- Cases: a correct password is accepted; a wrong one is rejected; an empty value is rejected; surrounding whitespace and letter case follow whatever rule the owner picks and are asserted either way; an empty or missing hash list rejects everything; each of several fixture hashes is accepted independently; removing one hash from the list rejects that password and still accepts the others. Fixtures use made-up passwords, never the real ones.
- Prior art: the existing test files for the core, results and ranking modules use the same runner and small fixtures.
- Everything else is verified by hand, as the existing pages are: keyboard-only pass, NVDA pass, contrast and target sizes against WCAG 2.2 AA, a real phone for the table scrolling, the locked and unlocked states of both gated pages, and a fresh-browser check of the published site (no broken scoreboard links, nothing unexpected loads).
- The full existing test suite and the data check must still pass.

## Out of Scope

- The Material 3 restyle itself, and full mobile-first redesign of tables and navigation.
- Real security: server-side auth, individual logins, encrypted data, rate limiting.
- A custom domain, analytics, cookies or tracking for parent visitors (default: none).
- Redesigning or removing the scoreboard-link column, publishing the scoreboard images, or linking to the league's Facebook posts.
- React or any framework or build step; other design systems.
- Offense/Defense rankings, other divisions, weekly data entry tools.
- Deployment automation beyond switching on GitHub Pages.

## Further Notes

- Domain terms: use the glossary in `CONTEXT.md` (Results, Power rank, Matchup, Playoff picture). "Coach access" is the user-facing name for the gate.
- Research behind each decision is in `research/` (hosting, soft gate, Material, design systems); the owner's choices and reasons are in the resolved tickets under `issues/`.
- Open items to confirm while building: that no analytics are added, and whether the export keeps the scoreboard filename.
- Do not write the password scheme or any real password into the repository.
