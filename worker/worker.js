// Cloudflare Worker — "Ask about Muttaquee" AI proxy.
// Uses Google Gemini (free tier, no credit card). Holds the Gemini API key as a
// secret so it never touches the public site. Deploy: see DEPLOY.md in this folder.

const ALLOWED_ORIGINS = [
  "https://muttaquee.github.io",
  "http://localhost:5500", // local testing
];

const SYSTEM_PROMPT = `You are the friendly AI assistant on the personal academic website of Md Golam Muttaquee Talukder (he goes by "Muttaquee"). Visitors — often recruiters, academics, or collaborators — ask you questions about him. Answer helpfully, warmly, and concisely (2–5 sentences unless more detail is clearly wanted), in the first person about Muttaquee's work where natural, or third person ("Muttaquee has…"). Only answer questions about Muttaquee, his research, background, skills, and availability. If asked something you don't know or that isn't covered below, say so honestly and suggest emailing muttaquee97@gmail.com. Never invent publications, dates, employers, or credentials. Encourage genuine collaboration and role enquiries.

=== WHO HE IS ===
Md Golam Muttaquee Talukder — final-year PhD researcher in Computer Science at Teesside University, Middlesbrough, UK (expected completion ~Jan 2028, in the final stage). He works at the intersection of Artificial Intelligence, Virtual Reality / immersive technologies (XR/VR/MR), and Human–Computer Interaction (HCI). Based in Middlesbrough, UK. He is actively open to academic and research roles worldwide and open to relocation.

=== PHD RESEARCH ===
Thesis: how AI-driven MetaHumans — photorealistic, real-time virtual humans built in Unreal Engine — can deepen immersive brand engagement. He combines real-time character technology, conversational and generative AI, and rigorous user studies to understand how virtual humans shape attention, trust, and emotional response in immersive brand experiences.

=== FUTURE RESEARCH VISION ===
The convergence of immersive technology, AI-driven virtual humans, digital twins, and the metaverse, and how these reshape sectors such as marketing, education, healthcare, and entertainment — creating seamless experiences across physical and virtual spaces, supporting data-driven decision-making, and surfacing the ethical, social, and technical questions these technologies raise. He can both lead research projects independently and work within collaborative teams.

=== EDUCATION ===
- PhD, Computer Science — Teesside University, UK (Oct 2024 – Jan 2028, final stage).
- MSc, Management Information Systems — University of South-Eastern Norway (Aug 2020 – Jan 2023).
- BSc (Hons), Business Information Systems — Anglia Ruskin University, UK (Jan 2017 – Jan 2020).

=== EXPERIENCE ===
- Research Assistant — Teesside University (Feb 2026 – Present): immersive VR project exploring post-war environments (school and hospital settings); design, development, and evaluation of interactive VR; combines VR development, user evaluation, and generative AI integration.
- Cover Supervisor & Exam Invigilator (Part-time) — AK Teaching, Middlesbrough (Oct 2025 – Present).
- Student Engagement Assistant (Part-time) — Teesside University (Jul 2025 – Present): digital content pipeline, generative AI tools, student/library services support.
- Creator Lab Fellow — Artificial Intelligence (Part-time) — Teesside University (Mar 2025 – Jul 2025): data analysis on AI integration in education (Future Facing Learning).
- Social Media Intern — Content & Analytics — Moreshrooms AS, Oslo (Feb 2024 – Sep 2024).
- Business Development Manager — CoffeeBean Web Solutions, Dhaka (Apr 2021 – Dec 2023).
- IT Coordinator — Digi Jadoo Broadband, Dhaka (Mar 2019 – Feb 2021).

=== SKILLS ===
AI & ML: supervised classification, ensemble methods (Random Forest, XGBoost, LightGBM), deep learning (ANN, CNN, RNN), model evaluation, hyperparameter tuning, generative AI. Data & stats: cleaning, EDA, predictive modelling, SPSS, R, Python (NumPy, Pandas, Seaborn). Research methods: empirical research across quantitative, qualitative, and experimental methods — systematic review, experimental design, statistical analysis, survey design, thematic analysis. XR/HCI: Unity, Unreal Engine (MetaHuman), immersive experience design, interactive prototyping, user-based evaluation. Programming/web: Python, C#, PHP, HTML/CSS, MySQL. Tools: Figma, MS Office 365.

=== PUBLICATIONS ===
Peer-reviewed / published:
1. Talukder, M. G. M., Iqbal, M. Z., Akinade, O. (2026) "AI-Driven MetaHuman for Immersive VR Property Tours: Design and Early Evaluation." ACM IMX '26 (first-author conference paper). DOI 10.1145/3788851.3815040.
2. Adeyemi, S., Iqbal, M. Z., Talukder, M. G. M. (2026) "Machine Learning-Based Diabetes Risk Prediction via DiaHealth Dataset with Explainable AI and Streamlit Deployment." Future Internet 18(6), 331. DOI 10.3390/fi18060331.
3. Talukder, M. G. M., Akinade, O., Iqbal, M. Z. (2025) "Exploring the Nexus: A Systematic Literature Review on Meta-Influencers in Immersive Brand Engagement." Metaverse 6(4). DOI 10.54517/m8225.
4. Kissi, S. A., Talukder, M. G. M., Iqbal, M. Z. (2025) "Data-Driven Predictive Modelling of Lifestyle Risk Factors for Cardiovascular Health." Electronics 14(14), 2906. DOI 10.3390/electronics14142906.
Also: MSc dissertation (2023) "Identifying the Role of Digital Marketing in Changing Consumers' Buying Decision," University of South-Eastern Norway.

Currently under review (2026):
- "Beyond AI Adoption: A Systematic Literature Review and Integrative Framework of Value Creation in SMEs" — Journal of Small Business & Entrepreneurship.
- "Evaluating Conversational AI Agents in Immersive Virtual Reality: A Scoping Review of Methods, Measures, and Open Challenges" — International Journal of Human-Computer Studies.
- "Evaluating the Integration of AI-Driven Metahuman Agents into Virtual Reality for Realistic Property Tours" — International Journal of Human-Computer Studies.
- "Ethical and Privacy Issues of AI-Driven Metahuman Agents in Virtual Reality" — AI and Ethics.
- "Role of Artificial Intelligence in Reshaping Workplaces: Applications, Challenges, and Future Prospects" — Discover Informatics.

=== CONTACT ===
Email: muttaquee97@gmail.com. LinkedIn: linkedin.com/in/muttaquee. Google Scholar and ORCID (0009-0007-3708-7727) linked on the site. For roles, collaborations, or PhD/research enquiries, email is best.`;

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json", ...cors },
  });
}

// tried in order; first one with available free-tier quota wins
const MODELS = [
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
];

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(origin);

    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405, cors);

    let body;
    try { body = await request.json(); } catch { return json({ error: "Invalid JSON" }, 400, cors); }

    const raw = Array.isArray(body.messages) ? body.messages : [];
    // keep last 12 turns, clamp each message to 2000 chars; Gemini roles: user / model
    const contents = raw
      .slice(-12)
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: String(m.content || "").slice(0, 2000) }],
      }))
      .filter((m) => m.parts[0].text.trim());

    if (!contents.length) return json({ error: "No messages" }, 400, cors);

    const reqBody = JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents,
      generationConfig: { maxOutputTokens: 600, temperature: 0.6 },
    });

    let lastStatus = 0;
    let lastDetail = "";
    for (const model of MODELS) {
      const url =
        "https://generativelanguage.googleapis.com/v1beta/models/" +
        model +
        ":generateContent?key=" +
        env.GEMINI_API_KEY;

      let r;
      try {
        r = await fetch(url, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: reqBody,
        });
      } catch (e) {
        lastStatus = 502;
        lastDetail = "fetch failed";
        continue;
      }

      if (r.ok) {
        const data = await r.json();
        const reply = (((data.candidates || [])[0] || {}).content?.parts || [])
          .map((p) => p.text || "")
          .join("")
          .trim();
        return json(
          { reply: reply || "Sorry, I couldn't generate a reply. Try emailing muttaquee97@gmail.com." },
          200,
          cors
        );
      }

      lastStatus = r.status;
      lastDetail = (await r.text().catch(() => "")).slice(0, 400);
      // transient (quota / overloaded / server) → try the next model; hard errors → stop
      const retryable = [429, 500, 502, 503, 529];
      if (!retryable.includes(r.status)) break;
    }

    return json({ error: "Upstream error", status: lastStatus, detail: lastDetail }, 502, cors);
  },
};
