# 13: Coach access on Matchup

**What to build:** Matchup opens to an inline "Coach access" form instead of its content. A correct coach password unlocks the page, focus moves to the main content, and the device remembers the unlock. A visible Lock control clears it. A wrong password shows a text error and keeps what was typed. The form explains these pages are for coaches, offers a way back to the public pages, and does not promise privacy. Matchup and Playoff picture stay visible in the nav for everyone. The list holds clearly marked demo hashes for now. Add "Coach access" to the project glossary.

**Blocked by:** 12 (Coach password check and hash helper).

**Status:** ready-for-agent

- [ ] Locked state: Matchup shows only the Coach access form, the explanation and the link back; no analysis is rendered
- [ ] Unlocked state: Matchup behaves exactly as before
- [ ] Labeled password input with current-password autocomplete; paste and autofill allowed
- [ ] Error is text with an alert role and an invalid state on the input; the field is not cleared
- [ ] After unlock focus lands on the main content; the Lock control is keyboard reachable and visible, and locking returns to the form
- [ ] If device storage is unavailable the gate still works for the current page view
- [ ] Wording says "Coach access" and does not claim the data is private or secure
- [ ] Demo hashes are clearly marked as placeholders to be replaced
- [ ] Keyboard-only and NVDA passes done; results added to the audit notes
- [ ] The full test suite passes

Source: spec user stories 6-12, 19-21; map ticket "Gate behavior and password handling".
