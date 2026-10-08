# Soft-gate mechanisms

Type: research
Status: resolved
Blocked by: none

## Question

What client-side options exist for gating matchup.html and playoff.html with 8 shared passwords (hashed list check, sessionStorage unlock, per-page guard)? Limits, and accessibility of the password prompt. Findings go on branch research/soft-gate.

## Research pointer

Branch `research/soft-gate`, file `.scratch/publish-and-material-design/research/soft-gate.md` (worktree: `.claude/worktrees/agent-acf2fb5a20dd6f16b`).

- Simplest: hashed list (SHA-256 or PBKDF2 via `crypto.subtle`) + `sessionStorage` flag + shared `src/gate.js`. Bypassable in seconds; gated pages share public data files, so only the UI is hidden.
- A11y: labelled `type=password` with `autocomplete="current-password"`, allow paste/autofill (SC 3.3.8), `role="alert"` + `aria-invalid` errors, a visible exit if using `<dialog>`, focus to `<main>` after unlock.
- Open: sessionStorage vs localStorage, dialog vs inline form, SHA-256 vs PBKDF2, whether Offense/Defense adds gated-only data (would make AES-GCM worthwhile).

## Answer

Research complete (see Research pointer). Facts for the gate-behavior decision: gated pages share the public data bundle, so a gate only hides the rendered page; simplest viable design is a hashed list + sessionStorage flag + one shared script; prompt must follow WCAG 3.3.8 and the error/focus patterns above. Choices are left to the Gate behavior and password handling ticket.
