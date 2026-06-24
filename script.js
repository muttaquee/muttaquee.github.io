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

// ---- Liquid background: light + blobs trail the cursor with easing ----
(function liquidBg() {
  const root = document.documentElement.style;
  let tx = 50, ty = 50;      // target (cursor) in %
  let cx = 50, cy = 50;      // eased current in %
  window.addEventListener("pointermove", (e) => {
    tx = (e.clientX / window.innerWidth) * 100;
    ty = (e.clientY / window.innerHeight) * 100;
  });
  function frame() {
    // ease toward target → trailing, water-like lag
    cx += (tx - cx) * 0.06;
    cy += (ty - cy) * 0.06;
    root.setProperty("--cursor-x", cx + "%");
    root.setProperty("--cursor-y", cy + "%");
    // offset from center drives blob drift (unitless, multiplied in CSS)
    root.setProperty("--bx", (cx - 50).toFixed(2));
    root.setProperty("--by", (cy - 50).toFixed(2));
    requestAnimationFrame(frame);
  }
  frame();
})();
