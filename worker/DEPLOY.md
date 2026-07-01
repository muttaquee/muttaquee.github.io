# "Ask about me" AI — deploy guide

The chat widget on the site talks to a small Cloudflare Worker. The Worker holds your
Anthropic API key (as a secret) and forwards questions to Claude. The key is **never**
in the website code, so it can't be stolen from the public site.

## What you need (one-time)
1. An **Anthropic API key** — https://console.anthropic.com → *API Keys* → create key.
   Add a little credit + set a monthly spend limit (Billing → Limits). Claude Haiku is cheap;
   a portfolio's traffic costs cents.
2. A free **Cloudflare account** — https://dash.cloudflare.com/sign-up
3. **Node.js** installed (you already have it).

## Deploy (5 commands, run inside this `worker/` folder)
```bash
cd worker
npx wrangler login                    # opens browser, log into Cloudflare
npx wrangler secret put ANTHROPIC_API_KEY   # paste your Anthropic key when prompted
npx wrangler deploy                    # prints your Worker URL
```
`wrangler deploy` prints a URL like:
```
https://muttaquee-chat.<your-subdomain>.workers.dev
```
Copy that URL.

## Connect the site
1. Open `assets/chat.js` (top of file) and replace:
   ```js
   const CHAT_ENDPOINT = "https://REPLACE-WITH-YOUR-WORKER.workers.dev";
   ```
   with your real Worker URL.
2. Bump the version so browsers refetch: in `publications.html` and `cv.html`, change
   `assets/chat.js?v=1` → `assets/chat.js?v=2`.
3. Commit + push. Done — the 💬 "Ask about me" button now works.

## Updating your info later
The AI's knowledge lives in `SYSTEM_PROMPT` inside `worker.js`. Edit it, then rerun
`npx wrangler deploy`. (The website's publications come from `papers.js`; keep the two
in rough sync when you add a paper.)

## Cost control
- Set a hard monthly limit in the Anthropic console.
- The Worker caps each reply to 600 tokens and keeps only the last 12 messages.
- CORS is locked to `muttaquee.github.io`, so other sites can't use your bot from a browser.
