// "Ask about me" AI chat widget. Talks to the Cloudflare Worker (which holds the API key).
// ---- 1) After deploying the Worker, paste its URL here: ----
const CHAT_ENDPOINT = "https://muttaquee-chat.pnanto313.workers.dev";
// -----------------------------------------------------------

(function () {
  if (!CHAT_ENDPOINT || CHAT_ENDPOINT.includes("REPLACE-WITH")) {
    console.warn("[chat] CHAT_ENDPOINT not set — edit assets/chat.js with your Worker URL.");
  }

  const history = []; // {role, content}

  // --- build DOM ---
  const btn = document.createElement("button");
  btn.className = "chat-fab";
  btn.type = "button";
  btn.setAttribute("aria-label", "Ask about Muttaquee");
  btn.innerHTML = '<span class="chat-fab-icon">💬</span><span class="chat-fab-label">Ask about me</span>';

  const panel = document.createElement("div");
  panel.className = "chat-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Ask about Muttaquee");
  panel.hidden = true;
  panel.innerHTML = `
    <div class="chat-head">
      <div>
        <strong>Ask about Muttaquee</strong>
        <span class="chat-sub">AI assistant · answers about my work &amp; background</span>
      </div>
      <button class="chat-close" type="button" aria-label="Close">✕</button>
    </div>
    <div class="chat-log" aria-live="polite"></div>
    <form class="chat-form">
      <input class="chat-input" type="text" autocomplete="off"
             placeholder="e.g. What is his PhD about?" maxlength="500" />
      <button class="chat-send" type="submit" aria-label="Send">➤</button>
    </form>`;

  document.body.appendChild(btn);
  document.body.appendChild(panel);

  const log = panel.querySelector(".chat-log");
  const form = panel.querySelector(".chat-form");
  const input = panel.querySelector(".chat-input");
  const sendBtn = panel.querySelector(".chat-send");

  const suggestions = [
    "What is his PhD research about?",
    "What are his key skills?",
    "Which papers has he published?",
    "Is he open to research roles?",
  ];

  function greet() {
    if (log.dataset.greeted) return;
    log.dataset.greeted = "1";
    addBubble("assistant", "Hi! I'm Muttaquee's assistant. Ask me anything about his research, publications, skills, or availability.");
    const chips = document.createElement("div");
    chips.className = "chat-chips";
    suggestions.forEach((s) => {
      const c = document.createElement("button");
      c.type = "button";
      c.className = "chat-chip";
      c.textContent = s;
      c.addEventListener("click", () => { input.value = s; form.requestSubmit(); });
      chips.appendChild(c);
    });
    log.appendChild(chips);
  }

  function addBubble(role, text) {
    const b = document.createElement("div");
    b.className = "chat-bubble chat-" + role;
    b.textContent = text;
    log.appendChild(b);
    log.scrollTop = log.scrollHeight;
    return b;
  }

  function open() { panel.hidden = false; btn.classList.add("open"); greet(); setTimeout(() => input.focus(), 50); }
  function close() { panel.hidden = true; btn.classList.remove("open"); }

  btn.addEventListener("click", () => (panel.hidden ? open() : close()));
  panel.querySelector(".chat-close").addEventListener("click", close);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) close(); });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    input.value = "";
    const chips = log.querySelector(".chat-chips");
    if (chips) chips.remove();

    addBubble("user", q);
    history.push({ role: "user", content: q });

    input.disabled = true; sendBtn.disabled = true;
    const typing = addBubble("assistant", "…");
    typing.classList.add("chat-typing");

    try {
      const res = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json();
      typing.remove();
      if (data.reply) {
        addBubble("assistant", data.reply);
        history.push({ role: "assistant", content: data.reply });
      } else {
        addBubble("assistant", "Sorry — something went wrong. You can email muttaquee97@gmail.com.");
      }
    } catch (err) {
      typing.remove();
      addBubble("assistant", "Couldn't reach the assistant right now. Please email muttaquee97@gmail.com.");
    } finally {
      input.disabled = false; sendBtn.disabled = false; input.focus();
    }
  });
})();
