# Gate behavior and password handling

Type: grilling
Status: resolved
Blocked by: 02

## Question

What does a visitor see on gated pages? Where does the check live? How are passwords rotated or revoked? How are gated nav links shown to the public? Decide with Eric.

## Answer

Decided with Eric (research: Soft-gate mechanisms).

- **Unlock lasts:** remembered on the device (`localStorage`), with a visible "Lock" control that clears it. Eric will use it on his phone at practice.
- **Prompt:** an inline form that replaces the content of `<main>` on Matchup and Playoff picture (no dialog, no focus trap). After unlock, focus moves to `<main>` (already `tabindex="-1"`). Form follows the research's a11y rules: labelled `type=password`, `autocomplete="current-password"`, paste/autofill allowed (WCAG 3.3.8), error as text with `role="alert"` and `aria-invalid`.
- **Nav:** Matchup and Playoff picture stay visible to everyone. The locked state shows a "Coach access" heading and a short line saying these pages are for coaches. Copy must not over-promise privacy.
- **Passwords:** a list of 8 SHA-256 hashes checked client-side, shared by one `src/gate.js` loaded on both pages. Hashes are unlabeled in the repo (no coach names). Changing or revoking a password means editing the list and redeploying, which Eric accepts. The real passwords live outside the repo, on paper in Eric's playbook and in his phone notes.
- **Hash method:** plain SHA-256, no PBKDF2 (same practical security for guessable passwords, less complexity).
- **Assumption confirmed:** the Offense/Defense rankings will not be gated, so no gated-only data and no encryption needed.

Honest limit to carry into the spec: gated pages share the public data files, so this hides only the rendered page.
