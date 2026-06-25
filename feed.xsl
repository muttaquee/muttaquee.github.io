<?xml version="1.0" encoding="UTF-8"?>
<!-- Styles the RSS feed into a friendly page when opened in a browser.
     Feed readers ignore this and parse the raw XML. -->
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" encoding="UTF-8" indent="yes" />
  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title><xsl:value-of select="rss/channel/title" /></title>
        <style>
          :root { --bg:#eef1f4; --card:#fff; --text:#18222e; --muted:#56616f; --teal:#f1592b; --line:#dde2e8; }
          * { box-sizing:border-box; margin:0; padding:0; }
          body { font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; background:var(--bg); color:var(--text); line-height:1.6; padding:40px 20px; }
          .wrap { max-width:720px; margin:0 auto; }
          .banner { background:rgba(241,89,43,0.08); border:1px solid rgba(241,89,43,0.2); border-radius:16px; padding:20px 24px; margin-bottom:32px; }
          .banner h2 { font-size:1.05rem; margin-bottom:6px; color:var(--teal); }
          .banner p { color:var(--muted); font-size:0.95rem; }
          .banner code { background:#fff; border:1px solid var(--line); padding:3px 8px; border-radius:6px; font-size:0.9em; word-break:break-all; }
          h1 { font-size:1.9rem; letter-spacing:-0.02em; margin-bottom:6px; }
          .sub { color:var(--muted); margin-bottom:32px; }
          .item { background:var(--card); border:1px solid var(--line); border-radius:16px; padding:22px 24px; margin-bottom:16px; transition:.15s; }
          .item:hover { box-shadow:0 10px 26px rgba(24,34,46,0.1); transform:translateY(-2px); }
          .item .date { font-size:0.8rem; color:var(--muted); font-weight:600; }
          .item h3 { margin:6px 0 8px; font-size:1.2rem; }
          .item h3 a { color:var(--text); text-decoration:none; }
          .item h3 a:hover { color:var(--teal); }
          .item p { color:var(--muted); font-size:0.96rem; }
          .home { display:inline-block; margin-top:24px; color:var(--teal); font-weight:600; text-decoration:none; }
        </style>
      </head>
      <body>
        <div class="wrap">
          <div class="banner">
            <h2>⌁ This is an RSS feed</h2>
            <p>Copy this page's URL into a feed reader (Feedly, NetNewsWire, Inoreader…) to get new posts automatically. No raw XML to deal with — that's just what subscribing apps read.</p>
          </div>
          <h1><xsl:value-of select="rss/channel/title" /></h1>
          <p class="sub"><xsl:value-of select="rss/channel/description" /></p>
          <xsl:for-each select="rss/channel/item">
            <div class="item">
              <div class="date"><xsl:value-of select="pubDate" /></div>
              <h3><a href="{link}"><xsl:value-of select="title" /></a></h3>
              <p><xsl:value-of select="description" /></p>
            </div>
          </xsl:for-each>
          <a class="home" href="/blog.html">← Back to the blog</a>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
