// Add accepted or published papers here once; the homepage and CV render from this list.
// Set peerReviewed: false for items that should not appear under CV peer-reviewed publications.
window.PUBLICATIONS = [
  {
    year: "2026",
    title: "AI-Driven MetaHuman for Immersive VR Property Tours: Design and Early Evaluation",
    authors: ["Talukder, M. G. M.", "Iqbal, M. Z.", "Akinade, O."],
    myAuthorName: "Talukder, M. G. M.",
    type: "Conference Paper",
    venue: "ACM Proceedings",
    cvVenue: "Proceedings of the 2026 ACM International Conference on Interactive Media Experiences (IMX '26)",
    details: "548-552. Work-in-Progress paper.",
    doi: "10.1145/3788851.3815040",
    peerReviewed: true,
    selected: true,
  },
  {
    year: "2026",
    title: "Machine Learning-Based Diabetes Risk Prediction via DiaHealth Dataset with Explainable AI and Streamlit Deployment",
    authors: ["Adeyemi, S.", "Iqbal, M. Z.", "Talukder, M. G. M."],
    myAuthorName: "Talukder, M. G. M.",
    type: "Journal Article",
    venue: "Future Internet",
    cvVenue: "Future Internet",
    details: "18(6), 331.",
    doi: "10.3390/fi18060331",
    peerReviewed: true,
    selected: true,
  },
  {
    year: "2026",
    title: "Beyond AI Adoption: A Systematic Literature Review and Integrative Framework of Value Creation in SMEs",
    authors: [],
    myAuthorName: "Talukder, M. G. M.",
    type: "Journal Article",
    venue: "Journal of Small Business & Entrepreneurship",
    cvVenue: "Journal of Small Business & Entrepreneurship",
    details: "",
    doi: "",
    status: "Under Review",
    peerReviewed: false,
    selected: true,
  },
  {
    year: "2026",
    title: "Evaluating Conversational AI Agents in Immersive Virtual Reality: A Scoping Review of Methods, Measures, and Open Challenges",
    authors: [],
    myAuthorName: "Talukder, M. G. M.",
    type: "Journal Article",
    venue: "International Journal of Human-Computer Studies",
    cvVenue: "International Journal of Human-Computer Studies",
    details: "",
    doi: "",
    status: "Under Review",
    peerReviewed: false,
    selected: true,
  },
  {
    year: "2026",
    title: "Evaluating the Integration of AI-Driven Metahuman Agents into Virtual Reality for Realistic Property Tours",
    authors: [],
    myAuthorName: "Talukder, M. G. M.",
    type: "Journal Article",
    venue: "International Journal of Human-Computer Studies",
    cvVenue: "International Journal of Human-Computer Studies",
    details: "",
    doi: "",
    status: "Under Review",
    peerReviewed: false,
    selected: true,
  },
  {
    year: "2026",
    title: "Ethical and Privacy Issues of AI-Driven Metahuman Agents in Virtual Reality",
    authors: [],
    myAuthorName: "Talukder, M. G. M.",
    type: "Journal Article",
    venue: "AI and Ethics",
    cvVenue: "AI and Ethics",
    details: "",
    doi: "",
    status: "Under Review",
    peerReviewed: false,
    selected: true,
  },
  {
    year: "2026",
    title: "Role of Artificial Intelligence in Reshaping Workplaces: Applications, Challenges, and Future Prospects",
    authors: [],
    myAuthorName: "Talukder, M. G. M.",
    type: "Journal Article",
    venue: "Discover Informatics",
    cvVenue: "Discover Informatics",
    details: "",
    doi: "",
    status: "Under Review",
    peerReviewed: false,
    selected: true,
  },
  {
    year: "2025",
    title: "Exploring the Nexus: A Systematic Literature Review on Meta-Influencers in Immersive Brand Engagement",
    authors: ["Talukder, M. G. M.", "Akinade, O.", "Iqbal, M. Z."],
    myAuthorName: "Talukder, M. G. M.",
    type: "Journal Article",
    venue: "Metaverse",
    cvVenue: "Metaverse",
    details: "6(4), Article 8225.",
    doi: "10.54517/m8225",
    peerReviewed: true,
    selected: true,
  },
  {
    year: "2025",
    title: "Data-Driven Predictive Modelling of Lifestyle Risk Factors for Cardiovascular Health",
    authors: ["Kissi, S. A.", "Talukder, M. G. M.", "Iqbal, M. Z."],
    myAuthorName: "Talukder, M. G. M.",
    type: "Journal Article",
    venue: "Electronics",
    cvVenue: "Electronics",
    details: "14(14), 2906.",
    doi: "10.3390/electronics14142906",
    peerReviewed: true,
    selected: true,
  },
  {
    year: "2023",
    title: "Identifying the Role of Digital Marketing in Changing Consumers' Buying Decision",
    authors: ["Talukder, M. G. M."],
    myAuthorName: "Talukder, M. G. M.",
    type: "MSc Dissertation",
    venue: "University of South-Eastern Norway",
    cvVenue: "University of South-Eastern Norway",
    details: "",
    doi: "10.13140/RG.2.2.32545.47204",
    peerReviewed: false,
    selected: true,
  },
];

// ---- Render: homepage = year-grouped glossy boxes; CV = peer-reviewed citation list ----
(function renderPublications() {
  const pubs = window.PUBLICATIONS || [];
  const doiUrl = (d) => "https://doi.org/" + d;
  const authors = (p, bold) =>
    p.authors.map((a) => (bold && a === p.myAuthorName ? "<strong>" + a + "</strong>" : a)).join(", ");

  // group by year, newest first
  const byYear = {};
  pubs.forEach((p) => { (byYear[p.year] = byYear[p.year] || []).push(p); });
  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));

  // homepage
  const home = document.getElementById("publication-list");
  if (home) {
    home.innerHTML = years.map((y) => `
      <div class="pub-year-group">
        <div class="pub-year-bar">${y}</div>
        <ul class="pub-year-list">
          ${byYear[y].map((p) => `
            <li class="pub-item">
              <span class="pub-marker">◎</span>
              <span class="pub-text">${authors(p, false) ? authors(p, false) + " " : ""}<em>“${p.title}”</em> <strong>${p.venue}</strong>${p.status ? ` <span class="pub-status">(${p.status})</span>` : ""}${p.doi ? ` <a class="pub-doi" href="${doiUrl(p.doi)}" target="_blank" rel="noopener">DOI</a>` : ""}</span>
            </li>`).join("")}
        </ul>
      </div>`).join("");
  }

  // CV (peer-reviewed only)
  const cv = document.getElementById("cv-publication-list");
  if (cv) {
    const reviewed = pubs.filter((p) => p.peerReviewed);
    cv.innerHTML = reviewed.map((p) => {
      const link = p.doi ? ` <a href="${doiUrl(p.doi)}" target="_blank" rel="noopener">doi.org/${p.doi}</a>` : "";
      const det = p.details ? `, ${p.details}` : ".";
      return `<li>${authors(p, true)} (${p.year}). ${p.title}. <em>${p.cvVenue}</em>${det}${link}</li>`;
    }).join("");
  }
})();
