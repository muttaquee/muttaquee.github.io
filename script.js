// ---- Edit your links here ----
const LINKS = {
  email:    "mailto:muttaquee97@gmail.com",
  scholar:  "https://scholar.google.com/citations?user=GzBXtuAAAAAJ&hl=en",
  linkedin: "https://www.linkedin.com/in/muttaquee/",
  orcid:    "https://orcid.org/0009-0007-3708-7727",
};

function doiHref(doi) {
  return doi ? "https://doi.org/" + doi : "";
}

function renderAuthors(publication) {
  const fragment = document.createDocumentFragment();
  publication.authors.forEach((author, index) => {
    if (index > 0) {
      const finalSeparator = author.toLowerCase() === "et al." ? ", " : ", & ";
      fragment.appendChild(document.createTextNode(index === publication.authors.length - 1 ? finalSeparator : ", "));
    }
    const el = author === publication.myAuthorName ? document.createElement("strong") : document.createTextNode(author);
    if (el.nodeType === Node.ELEMENT_NODE) el.textContent = author;
    fragment.appendChild(el);
  });
  return fragment;
}

function renderPublications() {
  const publications = Array.isArray(window.PUBLICATIONS) ? window.PUBLICATIONS : [];
  const homeList = document.getElementById("publication-list");
  const cvList = document.getElementById("cv-publication-list");

  if (homeList) {
    homeList.replaceChildren();
    publications.filter((publication) => publication.selected).forEach((publication) => {
      const li = document.createElement("li");
      li.className = "pub";

      const year = document.createElement("div");
      year.className = "pub-year";
      year.textContent = publication.year;

      const body = document.createElement("div");
      body.className = "pub-body";

      const title = document.createElement("p");
      title.className = "pub-title";
      title.textContent = publication.title;

      const meta = document.createElement("p");
      meta.className = "pub-meta";
      meta.textContent = [publication.type, publication.venue, publication.year].filter(Boolean).join(" · ");

      const links = document.createElement("div");
      links.className = "pub-links";
      if (publication.doi) {
        const doi = document.createElement("a");
        doi.href = doiHref(publication.doi);
        doi.target = "_blank";
        doi.rel = "noopener";
        doi.textContent = "DOI";
        links.appendChild(doi);
      }

      body.append(title, meta, links);
      li.append(year, body);
      homeList.appendChild(li);
    });
  }

  if (cvList) {
    cvList.replaceChildren();
    publications.filter((publication) => publication.peerReviewed).forEach((publication) => {
      const li = document.createElement("li");
      li.appendChild(renderAuthors(publication));
      li.appendChild(document.createTextNode(` (${publication.year}). ${publication.title}. `));

      const venue = document.createElement("em");
      venue.textContent = publication.cvVenue || publication.venue;
      li.appendChild(venue);

      if (publication.details) li.appendChild(document.createTextNode(`, ${publication.details}`));
      if (publication.doi) {
        li.appendChild(document.createTextNode(" "));
        const doi = document.createElement("a");
        doi.href = doiHref(publication.doi);
        doi.target = "_blank";
        doi.rel = "noopener";
        doi.textContent = `doi.org/${publication.doi}`;
        li.appendChild(doi);
      }
      cvList.appendChild(li);
    });
  }
}

renderPublications();

// Wire up every element with data-link to the matching URL
document.querySelectorAll("[data-link]").forEach((el) => {
  const key = el.getAttribute("data-link");
  if (LINKS[key]) {
    el.href = LINKS[key];
    if (key !== "email") {
      el.target = "_blank";
      el.rel = "noopener";
    }
  }
});

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// ---- Mouse-tracking glare on glass surfaces (iOS-style) ----
const glareEls = document.querySelectorAll(".card, .btn, .socials a, .tag-list li, .nav");
glareEls.forEach((el) => {
  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    el.style.setProperty("--mx", x + "%");
    el.style.setProperty("--my", y + "%");
  });
});

// ---- Water ripple background (classic height-field simulation) ----
(function waterRipple() {
  const canvas = document.querySelector(".ripple-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const SCALE = 0.32;          // sim resolution vs viewport (perf)
  const SIM_MS = 33;           // cap sim at ~30fps to free the main thread
  const DAMP = 0.945;           // wave energy decay
  let W, H, prev, curr, src, out;

  function buildSource() {
    // colored "water" image the ripples will distort (site palette)
    ctx.fillStyle = "#fbf5ea";
    ctx.fillRect(0, 0, W, H);
    // warm cream-palette gradient (the referenced tones)
    const blobs = [
      ["rgba(237,213,192,0.95)", 0.15, 0.18],  // EDD5C0
      ["rgba(241,221,203,0.90)", 0.85, 0.14],  // F1DDCB
      ["rgba(244,229,213,0.88)", 0.72, 0.88],  // F4E5D5
      ["rgba(248,237,224,0.85)", 0.18, 0.90],  // F8EDE0
    ];
    for (const [c, gx, gy] of blobs) {
      const g = ctx.createRadialGradient(gx * W, gy * H, 0, gx * W, gy * H, Math.max(W, H) * 0.55);
      g.addColorStop(0, c);
      g.addColorStop(1, "rgba(251,245,234,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
    src = ctx.getImageData(0, 0, W, H);
    out = ctx.createImageData(W, H);
    out.data.set(src.data);     // edges stay = source
  }

  const vw = () => Math.max(window.innerWidth || 0, document.documentElement.clientWidth || 0, 320);
  const vh = () => Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0, 480);
  function resize() {
    W = Math.max(60, Math.floor(vw() * SCALE));
    H = Math.max(60, Math.floor(vh() * SCALE));
    canvas.width = W;
    canvas.height = H;
    prev = new Float32Array(W * H);
    curr = new Float32Array(W * H);
    buildSource();
  }

  function drop(clientX, clientY, power) {
    const ix = Math.floor(clientX * SCALE);
    const iy = Math.floor(clientY * SCALE);
    const r = 2;
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const px = ix + dx, py = iy + dy;
        if (px > 0 && px < W - 1 && py > 0 && py < H - 1) prev[py * W + px] += power;
      }
    }
  }

  // cursor leaves a trail of ripples; faster = stronger
  let lx = null, ly = null, lt = 0;
  window.addEventListener("mousemove", (e) => {
    const now = performance.now();
    let power = 220;
    if (lx !== null) {
      const speed = Math.hypot(e.clientX - lx, e.clientY - ly) / Math.max(now - lt, 16);
      power = Math.min(520, 160 + speed * 120);
    }
    drop(e.clientX, e.clientY, power);
    lx = e.clientX; ly = e.clientY; lt = now;
  });

  let lastSim = 0;
  function step(ts) {
    requestAnimationFrame(step);
    if (ts - lastSim < SIM_MS) return;     // cap framerate (keeps running so waves settle naturally)
    lastSim = ts;
    const s = src.data, o = out.data;
    for (let y = 1; y < H - 1; y++) {
      const row = y * W;
      for (let x = 1; x < W - 1; x++) {
        const i = row + x;
        let v = (prev[i - 1] + prev[i + 1] + prev[i - W] + prev[i + W]) * 0.5 - curr[i];
        v *= DAMP;
        curr[i] = v;
        // refraction: displace source sample by local wave gradient
        const dx = (prev[i - 1] - prev[i + 1]) | 0;
        const dy = (prev[i - W] - prev[i + W]) | 0;
        let sx = x + dx, sy = y + dy;
        if (sx < 0) sx = 0; else if (sx >= W) sx = W - 1;
        if (sy < 0) sy = 0; else if (sy >= H) sy = H - 1;
        const si = (sy * W + sx) * 4, di = i * 4;
        o[di] = s[si]; o[di + 1] = s[si + 1]; o[di + 2] = s[si + 2]; o[di + 3] = 255;
      }
    }
    const tmp = prev; prev = curr; curr = tmp;
    ctx.putImageData(out, 0, 0);
  }

  function start() {
    resize();
    window.addEventListener("resize", resize);
    requestAnimationFrame(step);
  }
  // start after first paint / idle so it never blocks initial render
  if ("requestIdleCallback" in window) {
    requestIdleCallback(start, { timeout: 600 });
  } else {
    setTimeout(start, 200);
  }
})();
