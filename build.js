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

// --- per-post static HTML pages (p/<slug>.html) with baked-in OG tags for share previews ---
const DEFAULT_OG = `${SITE}/assets/profile.jpg`;
function genPostPage(p) {
  const ogImg = p.cover ? (p.cover.startsWith("http") ? p.cover : SITE + p.cover) : DEFAULT_OG;
  const url = `${SITE}/p/${p.slug}.html`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(p.title)} — Muttaquee</title>
  <meta name="description" content="${esc(p.excerpt)}" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Muttaquee" />
  <meta property="og:title" content="${esc(p.title)}" />
  <meta property="og:description" content="${esc(p.excerpt)}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${esc(ogImg)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(p.title)}" />
  <meta name="twitter:description" content="${esc(p.excerpt)}" />
  <meta name="twitter:image" content="${esc(ogImg)}" />
  <link rel="stylesheet" href="../fonts.css?v=9" />
  <link rel="stylesheet" href="../style.css?v=37" />
</head>
<body>
  <canvas class="ripple-canvas" aria-hidden="true"></canvas>
  <header class="nav">
    <a href="../index.html" class="brand">Muttaquee<span class="dot">.</span></a>
    <nav class="nav-links">
      <a href="../index.html#about">About</a>
      <a href="../index.html#research">Research</a>
      <a href="../index.html#publications">Publications</a>
      <a href="../cv.html?v=2">CV</a>
      <a href="../blog.html" class="active">Blog</a>
      <a href="../index.html#contact">Contact</a>
    </nav>
  </header>
  <article class="section post">
    <a href="../blog.html" class="post-back">← All posts</a>
    <div class="post-meta" id="post-meta"></div>
    <div class="post-body" id="post-body"><p class="muted">Loading…</p></div>
  </article>
  <footer class="footer"><p>© <span id="year"></span> Muttaquee · AI-Driven MetaHumans for Immersive Brand Engagement</p></footer>
  <script src="../assets/marked.min.js"></script>
  <script src="../script.js?v=17" defer></script>
  <script>
    (async function () {
      const slug = ${JSON.stringify(p.slug)};
      const body = document.getElementById("post-body");
      const metaEl = document.getElementById("post-meta");
      try {
        const idx = await (await fetch("../posts/index.json?cb=" + Date.now())).json();
        const meta = idx.find((x) => x.slug === slug);
        let titleHtml = "";
        if (meta) {
          const d = new Date(meta.date + "T00:00:00");
          const date = d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
          const tags = (meta.tags || []).map((t) => '<span class="blog-tag">' + t + '</span>').join("");
          metaEl.innerHTML = '<time>' + date + '</time>' + tags;
          titleHtml = "<h1>" + meta.title + "</h1>";
        }
        const md = (meta && meta.body) || "";
        const cover = meta && meta.cover ? '<img class="post-cover" src="..' + meta.cover + '" alt="" />' : "";
        const video = meta && meta.video ? '<video class="post-video" src="..' + meta.video + '" controls playsinline></video>' : "";
        const link = location.origin + "/p/" + slug + ".html";
        const u = encodeURIComponent(link), t = encodeURIComponent((meta && meta.title) || "");
        const share = '<div class="post-share"><span class="post-share-label">Share</span>' +
          '<a class="share-btn" href="https://www.linkedin.com/sharing/share-offsite/?url=' + u + '" target="_blank" rel="noopener">in</a>' +
          '<a class="share-btn" href="https://www.facebook.com/sharer/sharer.php?u=' + u + '" target="_blank" rel="noopener">f</a>' +
          '<a class="share-btn" href="https://twitter.com/intent/tweet?url=' + u + '&text=' + t + '" target="_blank" rel="noopener">𝕏</a>' +
          '<a class="share-btn" href="https://wa.me/?text=' + t + '%20' + u + '" target="_blank" rel="noopener">✆</a>' +
          '<button class="share-btn share-copy" type="button" data-url="' + link + '">⧉ Copy</button></div>';
        body.innerHTML = titleHtml + cover + video + marked.parse(md) + share +
          '<div class="post-comments"><h3 class="post-comments-title">💬 Comments &amp; reactions</h3></div>';
        body.addEventListener("click", (e) => {
          const c = e.target.closest(".share-copy"); if (!c) return;
          navigator.clipboard && navigator.clipboard.writeText(c.dataset.url);
          const o = c.textContent; c.textContent = "Copied ✓"; setTimeout(() => (c.textContent = o), 1500);
        });
        const g = document.createElement("script");
        const at = { src: "https://giscus.app/client.js", "data-repo": "muttaquee/muttaquee.github.io", "data-repo-id": "R_kgDOTDXe2A", "data-category": "Announcements", "data-category-id": "DIC_kwDOTDXe2M4C_6Is", "data-mapping": "specific", "data-term": slug, "data-strict": "1", "data-reactions-enabled": "1", "data-emit-metadata": "0", "data-input-position": "bottom", "data-theme": "light", "data-lang": "en", crossorigin: "anonymous" };
        Object.entries(at).forEach(([k, v]) => g.setAttribute(k, v)); g.async = true;
        document.querySelector(".post-comments").appendChild(g);
      } catch (e) {
        body.innerHTML = '<p class="muted">Could not load this post. <a href="../blog.html">Back to blog</a>.</p>';
      }
    })();
  </script>
</body>
</html>
`;
}
fs.mkdirSync("p", { recursive: true });
// clear old generated pages, then write current
for (const f of fs.readdirSync("p").filter((f) => f.endsWith(".html"))) fs.unlinkSync(path.join("p", f));
posts.forEach((p) => fs.writeFileSync(path.join("p", `${p.slug}.html`), genPostPage(p)));

// --- feed.xml ---
const items = posts
  .map((p) => {
    const url = `${SITE}/p/${encodeURIComponent(p.slug)}.html`;
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
const urls = [`${SITE}/`, `${SITE}/blog.html`, ...posts.map((p) => `${SITE}/p/${encodeURIComponent(p.slug)}.html`)];
fs.writeFileSync(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n")}
</urlset>
`
);

console.log(`Built index.json + feed.xml + sitemap.xml (${posts.length} posts).`);
