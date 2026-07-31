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
      <div class="chat-head-title">
        <strong>Ask about Muttaquee</strong>
        <span class="chat-sub">AI assistant · answers about my work &amp; background</span>
      </div>
      <div class="chat-head-btns">
        <button class="chat-speak" type="button" aria-label="Toggle spoken replies" title="Read answers aloud">🔈</button>
        <button class="chat-min" type="button" aria-label="Minimise" title="Minimise"
          onclick="var p=this.closest('.chat-panel');p.hidden=true;var f=document.querySelector('.chat-fab');if(f)f.classList.remove('open');">–</button>
        <button class="chat-close" type="button" aria-label="Close" title="Close"
          onclick="var p=this.closest('.chat-panel');p.hidden=true;var f=document.querySelector('.chat-fab');if(f)f.classList.remove('open');">✕</button>
      </div>
    </div>
    <div class="chat-log" aria-live="polite"></div>
    <form class="chat-form">
      <button class="chat-mic" type="button" aria-label="Speak your question" title="Speak your question" hidden>🎤</button>
      <input class="chat-input" type="text" autocomplete="off"
             placeholder="Type, or tap the mic to speak" maxlength="500" />
      <button class="chat-send" type="submit" aria-label="Send">➤</button>
    </form>`;

  document.body.appendChild(btn);
  document.body.appendChild(panel);

  const log = panel.querySelector(".chat-log");
  const form = panel.querySelector(".chat-form");
  const input = panel.querySelector(".chat-input");
  const sendBtn = panel.querySelector(".chat-send");
  const micBtn = panel.querySelector(".chat-mic");
  const speakBtn = panel.querySelector(".chat-speak");

  // ---- Voice: text-to-speech (read answers aloud), toggleable + remembered ----
  const tts = window.speechSynthesis;
  let speakOn = false;
  try { speakOn = localStorage.getItem("chatSpeak") === "1"; } catch (e) {}
  function renderSpeak() { speakBtn.textContent = speakOn ? "🔊" : "🔈"; speakBtn.classList.toggle("on", speakOn); }
  function speak(text) {
    if (!speakOn || !tts) return;
    tts.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.02; u.pitch = 1; u.lang = "en-GB";
    tts.speak(u);
  }
  if (!tts) speakBtn.hidden = true;
  renderSpeak();
  speakBtn.addEventListener("click", () => {
    speakOn = !speakOn;
    try { localStorage.setItem("chatSpeak", speakOn ? "1" : "0"); } catch (e) {}
    if (!speakOn && tts) tts.cancel();
    renderSpeak();
  });

  // ---- Voice: speech-to-text (speak your question). Chrome / Edge / Safari only. ----
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recog = null, listening = false;
  if (SR) {
    micBtn.hidden = false;
    recog = new SR();
    recog.lang = "en-GB";
    recog.interimResults = false;
    recog.maxAlternatives = 1;
    recog.addEventListener("result", (e) => {
      const t = e.results[0][0].transcript;
      input.value = t;
    });
    recog.addEventListener("end", () => {
      listening = false;
      micBtn.classList.remove("listening");
      if (input.value.trim()) form.requestSubmit();
    });
    recog.addEventListener("error", () => { listening = false; micBtn.classList.remove("listening"); });
    micBtn.addEventListener("click", () => {
      if (listening) { recog.stop(); return; }
      if (tts) tts.cancel();
      input.value = "";
      try { recog.start(); listening = true; micBtn.classList.add("listening"); } catch (e) {}
    });
  }

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

  function open(focusInput) {
    panel.hidden = false;
    btn.classList.add("open");
    greet();
    if (focusInput) setTimeout(() => input.focus(), 50);
  }
  function close() {
    panel.hidden = true;
    btn.classList.remove("open");
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    // remember the dismissal for this browser session — no auto-pop-up on other pages
    try { sessionStorage.setItem("chatDismissed", "1"); } catch (e) {}
  }

  btn.addEventListener("click", () => (panel.hidden ? open(true) : close()));
  // delegation: any click landing on (or inside) minimise/close hides the panel
  panel.addEventListener("click", (e) => {
    if (e.target.closest(".chat-min") || e.target.closest(".chat-close")) close();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) close(); });

  // auto-open on page load (greeting + suggested questions) — but stay closed once dismissed this session
  let dismissed = false;
  try { dismissed = !!sessionStorage.getItem("chatDismissed"); } catch (e) {}
  if (!dismissed) open(false);

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
        speak(data.reply);
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
