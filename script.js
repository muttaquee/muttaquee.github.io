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
