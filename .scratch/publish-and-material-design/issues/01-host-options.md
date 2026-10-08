# Host options for a public static site

Type: research
Status: resolved
Blocked by: none

## Question

Which hosts suit a public static site with a client-side soft gate (GitHub Pages, Netlify, Cloudflare Pages, others)? Compare free tier, custom domain, repo privacy, deploy flow. Findings go on branch research/hosting.

## Research pointer

Branch `research/hosting` (worktree `.claude/worktrees/agent-ac6adc6bb536d11a1`), file `.scratch/publish-and-material-design/research/01-host-options.md`.

- GitHub Pages: simplest (push to branch, no build, custom domain + HTTPS), but free plan requires a PUBLIC repo.
- Cloudflare Pages: documented private-repo support, 500 builds/mo, unlimited static requests; more setup. Netlify: free but credit-metered; private repos on Free unconfirmed.
- Decision needed: is a public repo acceptable, and custom domain vs default URL? Status left open.

## Answer

Eric: a public repo is fine, and the default URL is fine for now. With those two constraints GitHub Pages wins: simplest (no build), free, HTTPS. Cloudflare Pages and Netlify were not needed.

Consequence to carry forward: the repo is public, so the gate's password list is readable in the source. Fits the chosen soft gate, but passwords are guessable by design. Treat them as a courtesy lock, not security.
