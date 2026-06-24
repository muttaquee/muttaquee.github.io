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
const glareEls = document.querySelectorAll(".card, .btn, .socials a, .tag-list li");
glareEls.forEach((el) => {
  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    el.style.setProperty("--mx", x + "%");
    el.style.setProperty("--my", y + "%");
  });
});
