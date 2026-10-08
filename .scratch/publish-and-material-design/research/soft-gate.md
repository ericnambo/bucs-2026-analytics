# Soft-gate mechanisms research

Ticket: `issues/02-soft-gate-mechanisms.md`. Branch: `research/soft-gate`.
Context: gate `matchup.html` and `playoff.html` with 8 shared passwords. Static site, no build step, vanilla JS. Soft gate (client-side) accepted.

## Bottom line

- A client-side gate is a **courtesy curtain, not security**. Everything the browser needs is downloaded by anyone who requests it. Say so in the README and to coaches.
- Simplest shape: a hashed-list check (SHA-256 or PBKDF2 via `crypto.subtle`), a `sessionStorage` flag, and a tiny shared `src/gate.js` loaded first on each gated page. Prompt as an inline form in `<main>` or a native `<dialog>` opened with `showModal()`.
- Repo-specific finding: gated pages load `data/season-data.js` and the same `src/*.js` as the public pages. Those files are public regardless of the gate, so the gate hides only the rendered UI, not the data. See "Honest limits".

## Mechanisms

### 1. Hashed password list, checked in JS

Ship hashes (not plaintext) in `gate.js`. On submit, normalize the input (trim, lowercase), hash it, compare to the list.

- `SubtleCrypto.digest()` supports SHA-1/256/384/512, returns a Promise of an ArrayBuffer, and takes `TextEncoder`-encoded input. SHA-1 is flagged as not for cryptographic use. [MDN digest]
- `crypto.subtle` is secure-context only. HTTPS, `localhost` and `file://` count as secure; plain `http://` on a real host does not. [MDN digest] [MDN Secure Contexts] Guard with `window.isSecureContext && crypto.subtle`. GitHub Pages serves HTTPS, so production is fine. (MDN's Secure Contexts page did not itself name `crypto.subtle`; the digest page states the restriction.)
- Plain SHA-256 is fast to brute force. The passwords are guessable by design, so hashing buys almost nothing. OWASP says not to rely on fast hashes like SHA-256 for password storage and recommends 600,000 iterations for PBKDF2-HMAC-SHA256 when PBKDF2 is used. [OWASP]
- PBKDF2 is available through `importKey` + `deriveBits` (salt, iterations, hash, length a multiple of 8). MDN's example uses 100,000 iterations and defers to NIST SP 800-132 and OWASP for guidance. [MDN deriveBits] At 600,000 iterations expect a noticeable pause on a phone, so a "Checking..." status message is needed (see a11y).
- Verdict: PBKDF2 with a fixed per-site salt costs about the same code as SHA-256 and slows casual guessing, but cannot protect a low-entropy password. Plain SHA-256 is acceptable if simplicity wins.

Variant: one hash per coach (8 entries) allows revoking one coach by deleting a line, at the cost of a redeploy. No separate need for a shared hash.

### 2. Unlock state in `sessionStorage`

- Lasts for the tab/window session, survives reloads, cleared on close, separate per tab. A page opened via `window.open()` starts with a copy of the opener's storage. [MDN sessionStorage]
- Same-origin scripts can read and write it, so anyone can set the flag in DevTools. (MDN implies this rather than stating it.) [MDN sessionStorage]
- Access can throw `SecurityError` when storage is blocked; wrap in `try/catch` and fall back to prompting on every load. [MDN sessionStorage]
- UX: unlock once per tab, re-enter in each new tab. `localStorage` would persist across visits (friendlier, but stays unlocked on shared devices).
- Store only a marker (e.g. `gate=1`), never the password.

### 3. Per-page guard

a. **Shared `src/gate.js`, loaded first.** Checks the flag; if absent, keeps `<main>` content hidden and shows the prompt; on success reveals content and lets `matchup-app.js` / `playoff-app.js` run. Fits no-build. Avoid a flash of gated content by marking the content `hidden` in HTML and un-hiding on success.
b. **Gate initialization.** `gate.js` exposes a promise (`window.gateReady`) that the app scripts await, so gated app code doesn't run before unlock. Doesn't stop view-source, just avoids rendering.
c. **Redirect to `unlock.html` and back.** More moving parts (return URL, extra page to test) with no real gain for a soft gate. Not recommended.
d. **Encrypt gated payload with AES-GCM using a key derived from the password.** The only variant where the password protects anything: a wrong key makes decryption reject with `OperationError` (GCM is authenticated; use a fresh 96-bit IV per encryption). [MDN encrypt] (The decrypt behavior is from the Web Crypto spec, as relayed by the MDN encrypt fetch; I did not fetch the spec itself.) Needs a build/export step to produce ciphertext and either 8 key-wrapped copies or a data key wrapped 8 times. Only useful if gated pages have data NOT in the public bundle. Today they share `season-data.js`, so this adds complexity for no benefit. Revisit if the Offense/Defense idea adds gated-only data. Still brute-forceable offline because passwords are low entropy.

### 4. Things that do not gate anything

- `noindex` and `robots.txt` affect search listing only; a `noindex` page is still reachable by anyone with the URL. [Google noindex] (Google's page doesn't say "not access control" in so many words.)
- Leaving pages out of the nav: obscurity only.
- A private GitHub repo does not make a Pages site private: private Pages access control requires GitHub Enterprise Cloud. Out of scope (map: soft gate chosen, no server auth). [GitHub Pages visibility]

## Honest limits

- Anyone can view-source or use DevTools to read the hash list, `gate.js` and every data file, or set `sessionStorage` directly. Bypass takes seconds.
- Passwords are guessable by design, so offline guessing against the hash list is trivial whichever hash is used. OWASP's guidance assumes high-entropy secrets stored server-side; neither applies. [OWASP]
- Passwords are shared among 8 coaches and onward to anyone they tell. No revocation without redeploy, no audit trail. Rotation = edit the hash list and redeploy.
- No rate limiting or lockout is possible client-side.
- `data/season-data.js`, `data/games.json`, `data/schedule.json` and all `src/*.js` are served publicly at fixed paths. Unless gated data is separated and encrypted (3d), the gate hides only the UI.
- GitHub Pages docs say Pages sites shouldn't be used for sensitive transactions like sending passwords. [GitHub Pages limits] Here the password is checked locally and never transmitted, and it protects non-sensitive data. Coaches should not reuse these passwords elsewhere.
- `sessionStorage` unlock is lost on tab close; bookmarks to gated pages prompt again.
- Don't call this "secure" or "private" in UI copy. Prefer "Coach access".

## Accessibility of the prompt

### Authentication (SC 3.3.8 Accessible Authentication Minimum, AA)

- Remembering a password is a cognitive function test, allowed only if an exception applies, notably **Mechanism**: password manager support or copy and paste. Blocking paste or autofill fails unless an alternative exists. [WCAG 3.3.8]
- So: don't block paste, don't disable autofill; use a real `<input type="password">` with an associated `<label>`, a `name`, and `autocomplete="current-password"` (meaning "the user's current password"). [WCAG 3.3.8] [MDN autocomplete]
- MDN: `autocomplete="off"` generally doesn't stop password managers and removes help for users with cognitive/motor impairments; avoid it. [MDN autocomplete]
- No CAPTCHA, puzzle, or transcription step.
- Optional "Show password" toggle to reduce typing errors (design suggestion, not required by the cited criteria).
- Prompt copy should say where to get the password ("Ask your coach") without revealing the pattern.
- The 1.3.5 page names `autocomplete` (technique H98) as the technique but does not list `current-password`; MDN is the source for that token. [WCAG 1.3.5]

### Labels and instructions (SC 3.3.2, A)

- Visible `<label>` plus brief instruction if format matters (e.g. "Not case sensitive"). Keep instructions focused. [WCAG 3.3.2]

### Errors and status (SC 3.3.1 A, 3.3.3 AA, 4.1.3 AA)

- A wrong password is an automatically detected input error: identify the field and describe the error in text, not color alone. Techniques: text description (G83/G84/G85), `aria-invalid` (ARIA21), `role="alert"`/live region (ARIA19). [WCAG 3.3.1]
- Status messages must be exposed through role/properties without moving focus. Use `role="alert"` for errors when focus doesn't move; `role="status"` for progress/success (ARIA22), e.g. "Checking..." when PBKDF2 is slow. Using `role="alert"` for non-important content is a failure. [WCAG 4.1.3]
- Suggested pattern: `<p id="gate-error" role="alert">` present in the DOM at load with text injected on failure; set `aria-invalid="true"` on the input; link with `aria-describedby="gate-error gate-hint"`; keep focus in the input; don't clear the field (less retyping, helps 3.3.8). The `aria-describedby` linkage is common practice, but the 3.3.1 page doesn't list it as a technique. [WCAG 3.3.1]
- Wording: "That password didn't match. Check the spelling and try again." SC 3.3.3 has a general security exception but doesn't name authentication; with a single credential a generic message is fine. [WCAG 3.3.3]

### Focus and dialog behavior (SC 2.4.3 A, 2.4.11 AA)

If using `<dialog>`:
- `showModal()` makes the rest of the page inert, implicitly sets `aria-modal="true"`, focuses the first focusable element (or the `autofocus` one), and closes on Esc unless the `cancel` event is prevented. [MDN dialog]
- APG modal pattern: focus moves in, Tab wraps within, Esc closes, focus returns to the opener, labelled by a visible title via `aria-labelledby`, visible close button. [APG dialog-modal]
- A gate on a page that can't be used until unlocked isn't a normal dismissible overlay. Preferred: keep Esc and a visible "Back to Results" link/button so users are never trapped. MDN says always provide an explicit close/cancel button and keep Esc working. [MDN dialog]
- After unlock, close and move focus to `<main>` (pages already have `main tabindex="-1"` and a skip link) or the `<h1>`. SC 2.4.3 says move focus into modals and return it sensibly on dismissal; the exact target after unlock is a design choice. [WCAG 2.4.3]
- Modal dialogs take focus so pass Focus Not Obscured; ensure focus rings stay visible against the backdrop (1.4.11). [WCAG 2.4.11]

If using an inline form: place it in `<main>` under an `<h1>` with a clear locked-state heading, keep gated content `hidden` (not just visually), and on load move focus to the form heading or input. Fewer focus edge cases than a dialog and fits the existing skip link.

### Misc

- Use a real `<form>` with a submit button (Enter submits).
- `<noscript>` message: gated pages need JavaScript.
- Re-run the NVDA pass from `.scratch/power-ranking-app/` audit notes against the prompt; test with a password manager and with paste; check 400% zoom/reflow.
- Follow existing `src/a11y.css` conventions for contrast and target size.

## Open questions for grilling

1. `sessionStorage` (per tab) or `localStorage` (remembered)?
2. Dialog or inline form? Leaning inline; dialog acceptable with an exit to Results.
3. Plain SHA-256 or PBKDF2? Practical security is the same; PBKDF2 adds a progress status message.
4. Will Offense/Defense add gated-only data? If yes, consider AES-GCM (3d).
5. One hash per coach (revoke one) or accept redeploy on any change?
6. Copy that avoids over-promising ("Coach access", not "private").

## Sources

- [MDN digest] https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
- [MDN deriveBits] https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveBits
- [MDN encrypt] https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt
- [MDN Secure Contexts] https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts
- [MDN sessionStorage] https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage
- [MDN autocomplete] https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/autocomplete
- [MDN dialog] https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog
- [OWASP] https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- [WCAG 3.3.8] https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html
- [WCAG 3.3.1] https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html
- [WCAG 3.3.2] https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html
- [WCAG 3.3.3] https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html
- [WCAG 4.1.3] https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html
- [WCAG 1.3.5] https://www.w3.org/WAI/WCAG22/Understanding/identify-input-purpose.html
- [WCAG 2.4.3] https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html
- [WCAG 2.4.11] https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html
- [APG dialog-modal] https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
- [GitHub Pages limits] https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- [GitHub Pages visibility] https://docs.github.com/en/pages/getting-started-with-github-pages/changing-the-visibility-of-your-github-pages-site
- [Google noindex] https://developers.google.com/search/docs/crawling-indexing/block-indexing

Method note: pages were read through a summarizing fetch tool, not the raw text. Statements flagged "design suggestion", "design choice" or "implies" go beyond what the source says.
