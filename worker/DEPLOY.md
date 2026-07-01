# "Ask about me" AI — deploy guide (100% free)

The chat widget talks to a small Cloudflare Worker. The Worker holds your **free Google
Gemini** API key (as a secret) and forwards questions to Gemini. The key is **never** in
the website code, so it can't be stolen from the public site. No credit card anywhere.

## What you need (one-time, all free)
1. A **free Gemini API key** — https://aistudio.google.com/apikey → *Create API key*.
   No credit card. Free tier is ~1,500 requests/day — far more than a portfolio needs.
2. A free **Cloudflare account** — https://dash.cloudflare.com/sign-up
3. **Node.js** installed (you already have it).

## Deploy (run inside this `worker/` folder)
```bash
cd worker
npx wrangler login                     # opens browser, log into Cloudflare
npx wrangler secret put GEMINI_API_KEY # paste your Gemini key when prompted
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

## Notes
- Model is `gemini-2.0-flash` (free tier). To change it, edit `MODEL` in `worker.js`.
- CORS is locked to `muttaquee.github.io`, so other sites can't use your bot from a browser.
- Replies are capped at 600 tokens; only the last 12 messages are sent — keeps usage low.
- Gemini's free tier has generous daily limits; if you ever exceed them the widget just
  shows a friendly "email me" fallback.
