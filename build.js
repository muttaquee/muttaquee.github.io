// Builds posts/index.json + feed.xml + sitemap.xml from the markdown posts.
// Each post is posts/<slug>.md with YAML frontmatter (title, date, tags, excerpt) + body.
// No dependencies. Runs locally (`node build.js`) and in CI on every push.
const fs = require("fs");
const path = require("path");

const SITE = "https://muttaquee.github.io";
const TITLE = "Muttaquee — Blog";
const DESC = "Weekly notes on AI-driven MetaHumans, immersive brand engagement, VR and HCI research.";
const POSTS_DIR = "posts";

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// --- tiny YAML frontmatter parser (handles the fields we use) ---
function parseFrontmatter(raw) {
  const m = raw.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: raw };
  const lines = m[1].split(/\r?\n/);
  const body = m[2];
  const data = {};
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (kv) {
      const key = kv[1];
      let val = kv[2].trim();
      if (val === "") {
        // block list of "- item" lines
        const list = [];
        let j = i + 1;
        while (j < lines.length && /^\s*-\s+/.test(lines[j])) {
          list.push(lines[j].replace(/^\s*-\s+/, "").trim().replace(/^["']|["']$/g, ""));
          j++;
        }
        data[key] = list;
        i = j;
        continue;
      } else if (val.startsWith("[") && val.endsWith("]")) {
        data[key] = val.slice(1, -1).split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
      } else {
        // gather YAML folded continuation lines (indented, not a new key or list item)
        let j = i + 1;
        while (
          j < lines.length &&
          /^\s+\S/.test(lines[j]) &&
          !/^\s*-\s+/.test(lines[j]) &&
          !/^[A-Za-z0-9_]+:\s/.test(lines[j].trim())
        ) {
          val += " " + lines[j].trim();
          j++;
        }
        data[key] = val.replace(/^["']|["']$/g, "");
        i = j;
        continue;
      }
    }
    i++;
  }
  return { data, body };
}

function firstParagraph(body) {
  const text = body.replace(/^#.*$/m, "").replace(/[#>*_`]/g, "").trim();
  const p = text.split(/\n\s*\n/)[0] || "";
  return p.replace(/\s+/g, " ").slice(0, 180).trim();
}

// --- read all posts ---
const files = fs.existsSync(POSTS_DIR)
  ? fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"))
  : [];

const posts = files
  .map((file) => {
    const slug = file.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
    const { data, body } = parseFrontmatter(raw);
    return {
      slug,
      title: data.title || slug,
      date: (data.date || "").slice(0, 10),
      tags: Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : [],
      excerpt: data.excerpt || firstParagraph(body),
      cover: data.cover || "",
      video: data.video || "",
      body: body.trim(),   // embedded so the blog needs no .md fetch (Jekyll 404s raw .md)
    };
  })
  .filter((p) => p.date)
  .sort((a, b) => (a.date < b.date ? 1 : -1)); // newest first

fs.writeFileSync(path.join(POSTS_DIR, "index.json"), JSON.stringify(posts, null, 2) + "\n");

// --- feed.xml ---
const items = posts
  .map((p) => {
    const url = `${SITE}/post.html?slug=${encodeURIComponent(p.slug)}`;
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

fs.writeFileSync(
  "feed.xml",
  `<?xml version="1.0" encoding="UTF-8"?>
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
`
);

// --- sitemap.xml ---
const urls = [`${SITE}/`, `${SITE}/blog.html`, ...posts.map((p) => `${SITE}/post.html?slug=${encodeURIComponent(p.slug)}`)];
fs.writeFileSync(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n")}
</urlset>
`
);

console.log(`Built index.json + feed.xml + sitemap.xml (${posts.length} posts).`);
