// ---- Edit your links here ----
const LINKS = {
  email:    "mailto:muttaquee97@gmail.com",
  scholar:  "https://scholar.google.com/citations?user=GzBXtuAAAAAJ&hl=en",
  linkedin: "https://www.linkedin.com/in/muttaquee/",
  orcid:    "https://orcid.org/0009-0007-3708-7727",
};

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

// ---- Liquid background: light + blobs follow the cursor ----
// (updated directly on pointermove; CSS transitions create the water-like lag)
(function liquidBg() {
  const root = document.documentElement.style;
  const update = (x, y) => {
    const px = x / window.innerWidth;   // 0..1
    const py = y / window.innerHeight;  // 0..1
    root.setProperty("--cursor-x", (px * 100).toFixed(1) + "%");
    root.setProperty("--cursor-y", (py * 100).toFixed(1) + "%");
    root.setProperty("--bx", ((px - 0.5) * 100).toFixed(1)); // -50..50
    root.setProperty("--by", ((py - 0.5) * 100).toFixed(1));
  };
  window.addEventListener("pointermove", (e) => update(e.clientX, e.clientY));
  window.addEventListener("mousemove", (e) => update(e.clientX, e.clientY));
})();
