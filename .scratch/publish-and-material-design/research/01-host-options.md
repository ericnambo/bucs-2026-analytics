# Research: host options for a public static site

Ticket: `.scratch/publish-and-material-design/issues/01-host-options.md`
Researched: 2026-10-08. Primary sources only (official docs). Pricing/limits change; re-check before committing.

Context: static HTML/JS, no build, public audience, client-side soft gate, free tier preferred, beginner owner.

## Comparison

| | GitHub Pages | Cloudflare Pages | Netlify |
|---|---|---|---|
| Free tier | Yes | Yes | Yes (credit-based) |
| Repo privacy on free | Repo must be public [1] | Public or private repos supported [6] | Not documented in sources fetched (private repos listed under Pro on pricing page) [9] |
| Custom domain | Yes: apex, www, subdomain [3] | Yes: 100 per project on Free [5] | Yes, with SSL [9] |
| HTTPS | Automatic on github.io; custom domains supported once DNS is correct [4] | Not verified in fetched pages | Custom domains "with SSL" [9] |
| Deploy flow | Push to branch/folder, or GitHub Actions [2][10] | Git push auto-deploys; or Direct Upload (drag-drop/Wrangler) [6][7] | Git push, drag-and-drop, or CLI [8] |
| Build step needed | No for plain files [10] | Build command/output dir set in setup; static folder OK [6] | Auto-detected; drag-drop publishes as-is [8] |
| Limits | Site 1 GB; 100 GB/mo soft bandwidth; 10 builds/hr soft [11] | 500 builds/mo; 20,000 files; 25 MiB/file [5]; static requests free and unlimited [12] | 300 credits; 20 credits/GB bandwidth, 15 credits/production deploy [9] |
| Default URL | `<user>.github.io/<repo>` style (project site path) [3] | `<project>.pages.dev` (name from project) [6] | `<name>.netlify.app` (renameable) [8] |
| Use restrictions | Not for commercial/e-commerce/SaaS hosting [11] | none noted in fetched pages | none stated on pricing page [9] |

## Findings by host

### GitHub Pages
- Free plan requires a public repository [1]. Fits here: the data is already client-side and leakage is tolerated, but the repo source (including the gate passwords in JS) is public too. Note the Pages docs warn that sites are public even from private repos on plans that allow it [1].
- Two publish modes: "Deploy from a branch" (root or `/docs`, each push publishes) or GitHub Actions. Branch mode is recommended when you don't need build control [2][10]. Plain static files need no build [10].
- Custom domain supported; docs recommend a `www` subdomain; CNAME for subdomains, A/ALIAS/ANAME for apex. A `CNAME` file in the repo does not set the domain; use Settings [3][10].
- HTTPS automatic on github.io; "Enforce HTTPS" is a repo admin setting [4].
- Soft limits: 1 GB site, 100 GB/month bandwidth, 10 builds/hour (not applied to custom Actions workflows) [11]. Ample for a youth-league site.
- Terms: not intended as free hosting for commercial sites; no handling of passwords or credit cards [11]. A client-side shared-password gate is not handling real credentials in a transactional sense, but worth noting wording.
- Lowest moving parts: the repo already lives on GitHub (recent commit "publish to GitHub").

### Cloudflare Pages
- Git integration supports private and public repos [6]. Pushes auto-deploy; non-production branches and PRs get preview deployments [6].
- Direct Upload alternative (Wrangler or drag-and-drop). Choosing it is permanent for that project: cannot switch to Git integration later [7].
- Free limits: 500 builds/month, 20,000 files, 25 MiB per file, 100 custom domains [5]. Static asset requests free and unlimited [12].
- Cloudflare also offers hosting static sites on Workers static assets (`assets` block in Wrangler config) [13]; static requests free and unlimited [14]. The fetched docs make no statement comparing it to Pages or deprecating Pages; verify current guidance before choosing.
- More setup surface (Cloudflare account, project settings) than GitHub Pages.

### Netlify
- Three deploy paths: Git, drag-and-drop at app.netlify.com/drop, CLI [8]. Drag-and-drop publishes files as-is when not logged in; best under 50 MB [8].
- Free plan: 300 credits, metered (20 credits/GB bandwidth, 15 per production deploy) [9]. Credit exhaustion behavior was not in the fetched page; check before relying on it.
- Custom domains with SSL on Free [9]. Private org repos listed under Pro [9]; individual private repo handling on Free not confirmed.
- Credit-metered pricing is the hardest of the three to reason about for a beginner.

## Fit against the stated constraints
- No build, public audience, soft gate: all three serve static files; none provides server-side gating on the free tier in the pages fetched, which matches the soft-gate decision.
- Free + beginner + repo already on GitHub: GitHub Pages has the shortest path (Settings > Pages > branch). Cost: repo must be public.
- If the repo should stay private: Cloudflare Pages (documented support) is the documented option; Netlify unconfirmed.
- Custom domain is available on all three free tiers; domain purchase is separate (not covered by these docs).

## Open items for the human decision
- Is a public repo acceptable (shows source and the gate's passwords in JS)? Drives GitHub Pages vs Cloudflare Pages.
- Custom domain wanted, or default URL fine? (Feeds the "Domain / URL naming" fog item.)
- Not verified: Cloudflare HTTPS/default URL format, Netlify private-repo and credit-exhaustion behavior (two doc URLs returned 404).

## Sources
1. https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
2. https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
3. https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages
4. https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https
5. https://developers.cloudflare.com/pages/platform/limits/
6. https://developers.cloudflare.com/pages/get-started/git-integration/
7. https://developers.cloudflare.com/pages/get-started/direct-upload/
8. https://docs.netlify.com/start/overview/
9. https://www.netlify.com/pricing/
10. (same as 2; Actions vs branch, no build required)
11. https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
12. https://developers.cloudflare.com/pages/functions/pricing/
13. https://developers.cloudflare.com/workers/static-assets/
14. https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/
