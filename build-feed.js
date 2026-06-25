// Builds feed.xml (RSS 2.0) + sitemap.xml from posts/index.json.
// No dependencies. Run: `node build-feed.js`  (also runs in CI on push).
const fs = require("fs");

const SITE = "https://muttaquee.github.io";
const TITLE = "Muttaquee — Blog";
const DESC = "Weekly notes on AI-driven MetaHumans, immersive brand engagement, VR and HCI research.";

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const posts = JSON.parse(fs.readFileSync("posts/index.json", "utf8"))
  .slice()
  .sort((a, b) => (a.date < b.date ? 1 : -1)); // newest first

const items = posts
  .map((p) => {
    const url = `${SITE}/post.html#${encodeURIComponent(p.slug)}`;
    const pub = new Date(p.date + "T09:00:00Z").toUTCString();
    return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="false">${esc(p.slug)}</guid>
      <pubDate>${pub}</pubDate>
      ${(p.tags || []).map((t) => `<category>${esc(t)}</category>`).join("")}
      <description>${esc(p.excerpt || "")}</description>
    </item>`;
  })
  .join("\n");

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/feed.xsl"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(TITLE)}</title>
    <link>${SITE}/blog.html</link>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml" />
    <description>${esc(DESC)}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;
fs.writeFileSync("feed.xml", rss);

// simple sitemap (homepage, blog, each post)
const urls = [`${SITE}/`, `${SITE}/blog.html`, ...posts.map((p) => `${SITE}/post.html#${encodeURIComponent(p.slug)}`)];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n")}
</urlset>
`;
fs.writeFileSync("sitemap.xml", sitemap);

console.log(`Built feed.xml + sitemap.xml (${posts.length} posts).`);
