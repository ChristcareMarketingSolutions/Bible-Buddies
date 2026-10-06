/* =====================================================================
   BIBLE BUDDIES — app.js
   Site-wide behaviour: navigation, search, daily content, verse tools,
   confetti/toast, text-to-speech. Loaded on every page.
   ===================================================================== */

/* Site root (the folder holding index.html), so pages in sub-folders such as
   bible-stories/ can link to the main pages correctly. */
const BB_BASE = document.currentScript ? document.currentScript.src.replace(/js\/app\.js.*$/, "") : "";
function bbUrl(path) { return /^(https?:|mailto:|#|\/)/.test(path) ? path : BB_BASE + path; }


/* ---------- CONFIG (tweak feel here) ---------- */
const CONFIG = {
  confettiCount: 60,
  toastMs: 2600,
  revealOnScroll: true
};

/* ---------- helper: today's index (changes daily, no server) ---------- */
function dayNumber() {
  // days since 1 Jan 1970 in the visitor's own time zone, so it ticks over at their midnight
  const now = new Date();
  return Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
}
function dayIndex(len) {
  return dayNumber() % len;
}
/* Runs fn again whenever a new day starts while the page is still open.
   Phones often bring back an open tab or home-screen app without reloading it,
   so "today's" content must refresh itself when the date changes. */
function onNewDay(fn) {
  let shown = dayNumber();
  const check = () => { const d = dayNumber(); if (d !== shown) { shown = d; fn(); } };
  document.addEventListener("visibilitychange", () => { if (!document.hidden) check(); });
  window.addEventListener("pageshow", check);
  window.addEventListener("focus", check);
  setInterval(check, 60000);
}
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------- MOBILE NAVIGATION ---------- */
function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  const backdrop = document.querySelector(".nav-backdrop");
  if (!toggle || !nav) return;
  const close = () => { nav.classList.remove("open"); backdrop && backdrop.classList.remove("show"); toggle.setAttribute("aria-expanded", "false"); };
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    backdrop && backdrop.classList.toggle("show", open);
    toggle.setAttribute("aria-expanded", String(open));
  });
  backdrop && backdrop.addEventListener("click", close);
  nav.querySelectorAll("a").forEach(a => a.addEventListener("click", close));
  document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
}

/* ---------- SEARCH MODAL ---------- */
function initSearch() {
  const openBtn = document.querySelector("[data-open-search]");
  const modal = document.querySelector("#search-modal");
  if (!openBtn || !modal) return;
  const input = modal.querySelector(".search-input");
  const results = modal.querySelector(".search-results");
  const index = buildSearchIndex();

  let lastFocus = null;
  const open = () => {
    lastFocus = document.activeElement;
    modal.classList.add("open"); input.value = ""; render(""); setTimeout(() => input.focus(), 50);
  };
  const close = () => {
    if (!modal.classList.contains("open")) return;
    modal.classList.remove("open");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  };

  function render(term) {
    term = term.trim().toLowerCase();
    if (!term) { results.innerHTML = `<p class="search-empty">🐑 Type a name — try “Noah”, “Jesus” or “love”.</p>`; return; }
    const hits = index.filter(i => i.key.includes(term)).slice(0, 12);
    if (!hits.length) { results.innerHTML = `<p class="search-empty">🐑 Buddy couldn't find that. Try another word!</p>`; return; }
    results.innerHTML = hits.map(h => `
      <a href="${bbUrl(h.url)}">
        <span class="res-icon">${h.icon}</span>
        <span>${h.title}</span>
        <span class="res-kind">${h.kind}</span>
      </a>`).join("");
  }

  openBtn.addEventListener("click", open);
  modal.querySelector(".modal-close").addEventListener("click", close);
  modal.addEventListener("click", e => { if (e.target === modal) close(); });
  input.addEventListener("input", () => render(input.value));
  document.addEventListener("keydown", e => {
    if (!modal.classList.contains("open")) return;
    if (e.key === "Escape") { close(); return; }
    // keep keyboard focus inside the open search box
    if (e.key === "Tab") {
      const f = [...modal.querySelectorAll("button, input, a[href]")].filter(el => el.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
      else if (!modal.contains(document.activeElement)) { first.focus(); e.preventDefault(); }
    }
  });
}

/* ---------- TODAY'S BIBLE ADVENTURE (home page; stories in js/adventures.js) ---------- */
function initDailyAdventure() {
  const box = document.querySelector("[data-daily-adventure]");
  if (!box || typeof ADVENTURES === "undefined" || !ADVENTURES.length) return;
  const $ = sel => box.querySelector(sel);
  let a;
  const fill = () => {
    const day = dayNumber();
    a = ADVENTURES[day % ADVENTURES.length];
    $("[data-emoji]").textContent = a.emoji;
    $("[data-title]").textContent = a.title;
    $("[data-ref]").textContent = "📖 " + a.ref;
    const story = $("[data-story]"); story.textContent = "";
    a.story.forEach(t => { const p = document.createElement("p"); p.textContent = t; story.append(p); });
    $("[data-fact]").textContent = a.fact;
    $("[data-challenge]").textContent = a.challenge;
    $("[data-q]").textContent = a.question.q;
    const res = $("[data-result]"); res.textContent = "";
    const wrap = $("[data-choices]"); wrap.textContent = "";
    a.question.choices.forEach((c, i) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "adv-choice"; b.textContent = c;
      b.addEventListener("click", () => {
        if (i === a.question.answer) {
          wrap.querySelectorAll("button").forEach(x => { x.disabled = true; });
          b.classList.add("right");
          res.textContent = "✅ Yes, that's right! Well done!";
          if (typeof bbAddStars === "function") bbAddStars(1, "adventure-" + day);
          if (typeof bbConfetti === "function") bbConfetti();
        } else {
          b.classList.add("wrong"); b.disabled = true;
          res.textContent = "Not quite. Have another look at the story and try again!";
        }
      });
      wrap.append(b);
    });
  };
  fill();
  onNewDay(fill);
  $("[data-listen]").addEventListener("click", () => speakText(a.title + ". " + a.story.join(" ")));
}

/* ---------- WHAT WILL YOU DISCOVER TODAY ----------
   Everything here follows today's date: the memory verse is the same as
   "Today's Memory Verse", and the story and game change each day. */
const DISCOVER_GAMES = [
  { id: "memory",    emoji: "🧠", name: "Bible Memory Match", desc: "Match each Bible hero with their picture." },
  { id: "who-am-i",  emoji: "❓", name: "Who Am I?",          desc: "Read the clues and guess the Bible character." },
  { id: "scramble",  emoji: "🔤", name: "Word Scramble",      desc: "Unscramble the Bible word." },
  { id: "quiz",      emoji: "⭐", name: "Bible Quiz",         desc: "Answer the questions and earn stars." },
  { id: "sling",     emoji: "🪨", name: "David's Sling",      desc: "Pop 50 worry balloons with David's sling." },
  { id: "harp",      emoji: "🎵", name: "David's Harp",       desc: "Make music like David and copy Buddy's tune." }
];
function initDiscover() {
  const box = document.querySelector("[data-discover]");
  if (!box) return;
  const $ = sel => box.querySelector(sel);
  const fill = () => {
    const day = dayNumber();
    // story: a different one each day, opening its comic storybook when there is one
    const story = STORIES[day % STORIES.length];
    $("[data-d-story-emoji]").textContent = story.emoji;
    $("[data-d-story]").textContent = story.title;
    $("[data-d-story-desc]").textContent = story.description;
    const sl = $("[data-d-story-link]");
    const hasBook = typeof driveId === "function" && driveId(story.book);
    sl.href = hasBook ? "story.html?s=" + encodeURIComponent(story.id) : "stories.html";
    sl.textContent = hasBook ? "📖 Read Comic Story" : "Read";
    // game of the day
    const g = DISCOVER_GAMES[day % DISCOVER_GAMES.length];
    $("[data-d-game-emoji]").textContent = g.emoji;
    $("[data-d-game]").textContent = g.name;
    $("[data-d-game-desc]").textContent = g.desc;
    $("[data-d-game-link]").href = "games.html#" + g.id;
    // memory verse: exactly today's verse
    const v = verseFor(new Date());
    $("[data-d-verse]").textContent = v.ref;
    $("[data-d-verse-text]").textContent = quoteVerse(v.text);
  };
  fill();
  onNewDay(fill);
}

/* ---------- DAILY MEMORY VERSE (home + verses page) ---------- */
/* VERSES has one verse per calendar date (366 entries, 1 January first), so the
   same date always shows the same verse and no verse repeats within a year. */
function verseIndexFor(date) {
  // position of this month/day in a leap year, so 29 February has its own verse
  return Math.round((Date.UTC(2024, date.getMonth(), date.getDate()) - Date.UTC(2024, 0, 1)) / 86400000) % VERSES.length;
}
function easterSunday(year) {
  // Western (Gregorian) Easter date
  const a = year % 19, b = Math.floor(year / 100), c = year % 100, d = Math.floor(b / 4), e = b % 4,
    f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30,
    i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451),
    month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}
function verseFor(date) {
  if (typeof SPECIAL_VERSES !== "undefined") {
    const e = easterSunday(date.getFullYear());
    const diff = Math.round((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(e.getFullYear(), e.getMonth(), e.getDate())) / 86400000);
    const key = { "-7": "palm", "-2": "friday", "0": "easter" }[diff];
    if (key && SPECIAL_VERSES[key]) return SPECIAL_VERSES[key];
  }
  return VERSES[verseIndexFor(date)];
}
function quoteVerse(t) { return t.includes("“") ? t : `“${t}”`; }   // no extra marks when the verse has its own

function initDailyVerse() {
  document.querySelectorAll("[data-daily-verse]").forEach(box => {
    let offset = 0, v;                       // offset: days after today ("Next verse")
    const hide = box.querySelector("[data-v-hide]");
    const textEl = box.querySelector("[data-v-text]");
    let dayEl = box.querySelector("[data-v-day]");
    if (!dayEl) {
      dayEl = document.createElement("p");
      dayEl.className = "verse-day"; dayEl.setAttribute("data-v-day", "");
      textEl.before(dayEl);
    }
    const show = () => {
      const date = new Date(); date.setDate(date.getDate() + offset);
      v = verseFor(date);
      const label = date.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
      dayEl.textContent = "";
      dayEl.append(`📅 ${offset === 0 ? "Today, " : ""}${label}${v.day ? " · " + v.day : ""}`);
      if (offset !== 0) {
        const back = document.createElement("button");
        back.type = "button"; back.className = "verse-today"; back.textContent = "↺ Back to today";
        back.addEventListener("click", () => { offset = 0; show(); });
        dayEl.append(" ", back);
      }
      if (hide) hide.textContent = "Hide words";
      textEl.textContent = quoteVerse(v.text);
      box.querySelector("[data-v-ref]").textContent = v.ref;
      const ex = box.querySelector("[data-v-explain]");
      if (ex) ex.textContent = v.explain;
    };
    show();
    onNewDay(() => { offset = 0; show(); });
    const next = box.querySelector("[data-v-next]");
    next && next.addEventListener("click", () => { offset = (offset + 1) % 366; show(); });
    hide && hide.addEventListener("click", () => {
      if (hide.textContent === "Hide words") {
        hideWords(textEl, v.text);
        hide.textContent = "Show words";
      } else show();
    });
    const speak = box.querySelector("[data-v-speak]");
    speak && speak.addEventListener("click", () => speakText(v.text + ". " + v.ref));
    // share today's verse as a picture card
    const row = box.querySelector(".btn-row");
    if (row) {
      const b = document.createElement("button");
      b.type = "button"; b.className = "btn btn-grape"; b.textContent = "📤 Share verse";
      b.title = "Grown-ups: share this verse as a picture";
      b.addEventListener("click", () => bbShareVerse(v));
      row.appendChild(b);
    }
  });
}

/* Hide the Words: blank out ~40% of the words, tap to reveal.
   Always works from the original verse text, so hiding twice never loses words. */
function hideWords(el, text) {
  const words = text.split(" ");
  let hidden = words.map(w => Math.random() < 0.4 && w.length > 2);
  if (!hidden.some(Boolean)) hidden = words.map(w => w.length > 3);   // always hide at least one
  const quoted = !text.includes("“");
  el.textContent = quoted ? "“" : "";
  words.forEach((w, k) => {
    if (k) el.append(" ");
    if (!hidden[k]) { el.append(w); return; }
    const b = document.createElement("button");
    b.type = "button"; b.className = "blank";
    b.textContent = "_".repeat(w.length);
    b.setAttribute("aria-label", "Hidden word. Tap to reveal");
    b.addEventListener("click", () => { b.replaceWith(w); });
    el.append(b);
  });
  if (quoted) el.append("”");
}

/* ---------- STORYBOOK PDFs (stored on Google Drive) ---------- */
function driveId(link) {
  if (!link) return "";
  const m = String(link).match(/\/d\/([\w-]{20,})/) || String(link).match(/[?&]id=([\w-]{20,})/);
  return m ? m[1] : (/^[\w-]{20,}$/.test(link) ? link : "");
}
const drivePreviewUrl  = id => `https://drive.google.com/file/d/${id}/preview`;
const driveDownloadUrl = id => `https://drive.google.com/uc?export=download&id=${id}`;

/* Video links for Video Stories: a YouTube link (youtu.be/…, youtube.com/watch?v=…,
   /shorts/…) or a Google Drive link. Returns the player and thumbnail addresses. */
function bbVideo(link) {
  const y = String(link || "").match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/);
  if (y) return { kind: "youtube", id: y[1],
    embed: `https://www.youtube-nocookie.com/embed/${y[1]}?autoplay=1&rel=0&modestbranding=1&playsinline=1`,
    thumb: `https://i.ytimg.com/vi/${y[1]}/hqdefault.jpg` };
  const d = driveId(link);
  if (d) return { kind: "drive", id: d, embed: drivePreviewUrl(d), thumb: `https://drive.google.com/thumbnail?id=${d}&sz=w640` };
  return null;
}

/* ---------- SHARING (for grown-ups) ----------
   Uses the phone's own share sheet when there is one; otherwise shows
   WhatsApp, Facebook, X, email and copy-link buttons. */
const SITE_URL = "https://christcaremarketingsolutions.github.io/Bible-Buddies/";
function bbPageUrl() {
  const c = document.querySelector('link[rel="canonical"]');
  return c ? c.href : location.href.split("#")[0];
}
function bbShare(o = {}) {
  const url = o.url || bbPageUrl();
  const title = o.title || document.title;
  const text = o.text || "A free, fun Bible website for kids: stories, games and a 3D walk with Jesus!";
  // o.files: pictures to attach (e.g. a video thumbnail), so the phone's share sheet shows them
  if (o.files && o.files.length && navigator.canShare && navigator.canShare({ files: o.files })) {
    navigator.share({ files: o.files, title, text: `${text}\n${url}` }).catch(err => {
      if (err && err.name !== "AbortError") navigator.share({ title, text, url }).catch(() => {});
    });
    return;
  }
  if (navigator.share) { navigator.share({ title, text, url }).catch(() => {}); return; }
  let m = document.querySelector("#share-modal");
  if (!m) {
    m = document.createElement("div");
    m.className = "modal"; m.id = "share-modal";
    m.setAttribute("role", "dialog"); m.setAttribute("aria-modal", "true"); m.setAttribute("aria-label", "Share");
    m.innerHTML = `<div class="modal-box share-box">
      <button class="modal-close" type="button" aria-label="Close">✕</button>
      <h2>📤 Share</h2>
      <p class="share-note">Ask a grown-up before sharing.</p>
      <div class="share-grid" data-share-links></div>
      <div class="share-copy"><input class="search-input" data-share-url readonly aria-label="Link to share"><button type="button" class="btn btn-primary" data-share-copy>Copy link</button></div>
    </div>`;
    document.body.appendChild(m);
    const close = () => m.classList.remove("open");
    m.querySelector(".modal-close").addEventListener("click", close);
    m.addEventListener("click", e => { if (e.target === m) close(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
    m.querySelector("[data-share-copy]").addEventListener("click", () => {
      const inp = m.querySelector("[data-share-url]"); inp.select();
      (navigator.clipboard ? navigator.clipboard.writeText(inp.value) : Promise.reject()).catch(() => document.execCommand("copy"));
      bbToast("Link copied! 📋");
    });
  }
  const e = encodeURIComponent;
  m.querySelector("[data-share-links]").innerHTML = [
    ["WhatsApp", "#25D366", `https://wa.me/?text=${e(text + " " + url)}`],
    ["Facebook", "#1877F2", `https://www.facebook.com/sharer/sharer.php?u=${e(url)}`],
    ["X", "#111111", `https://twitter.com/intent/tweet?text=${e(text)}&url=${e(url)}`],
    ["Email", "#7C5CBF", `mailto:?subject=${e(title)}&body=${e(text + "\n\n" + url)}`]
  ].map(([n, c, href]) => `<a class="share-link" style="background:${c}" href="${href}" target="_blank" rel="noopener">${n}</a>`).join("");
  m.querySelector("[data-share-url]").value = url;
  m.classList.add("open");
  setTimeout(() => m.querySelector("[data-share-copy]").focus(), 50);
}
function initShareButtons() {
  const brand = document.querySelector(".footer-brand");
  if (brand && !brand.querySelector("[data-share]")) {
    const b = document.createElement("button");
    b.type = "button"; b.className = "btn btn-primary share-footer"; b.setAttribute("data-share", "");
    b.textContent = "📤 Share Bible Buddies";
    brand.appendChild(b);
  }
  document.querySelectorAll("[data-share]").forEach(b => b.addEventListener("click", () => bbShare({ url: b.dataset.shareUrl || SITE_URL, title: "Bible Buddies: free Bible stories, games and a 3D walk with Jesus for kids" })));
}

/* Today's verse as a square picture card (made in the browser, nothing uploaded) */
function bbShareVerse(v) {
  const S = 1080, c = document.createElement("canvas"); c.width = c.height = S;
  const g = c.getContext("2d");
  const font = (w, px) => `${w} ${px}px Fredoka, "Trebuchet MS", sans-serif`;
  const draw = logo => {
    const grd = g.createLinearGradient(0, 0, 0, S); grd.addColorStop(0, "#4FB7EC"); grd.addColorStop(1, "#BFE6FB");
    g.fillStyle = grd; g.fillRect(0, 0, S, S);
    g.fillStyle = "#63C67A"; g.beginPath(); g.moveTo(0, 930); g.bezierCurveTo(300, 860, 700, 1000, S, 900); g.lineTo(S, S); g.lineTo(0, S); g.fill();
    // card
    const x = 70, y = 200, w = S - 140, h = 640, r = 48;
    g.fillStyle = "rgba(0,0,0,.12)"; roundRect(g, x, y + 14, w, h, r); g.fill();
    g.fillStyle = "#FFF6E5"; g.strokeStyle = "#41383B"; g.lineWidth = 8; roundRect(g, x, y, w, h, r); g.fill(); g.stroke();
    g.fillStyle = "#7C5CBF"; g.font = font(600, 46); g.textAlign = "center"; g.fillText("⭐ Today's Memory Verse", S / 2, y + 90);
    // verse text, wrapped to fit
    let px = 64, lines;
    do { g.font = font(600, px); lines = wrap(g, quoteVerse(v.text), w - 120); px -= 4; } while (lines.length * px * 1.25 > h - 260 && px > 34);
    g.fillStyle = "#41383B"; const lh = (px + 4) * 1.25, top = y + 130 + (h - 260 - lines.length * lh) / 2 + lh * 0.8;
    lines.forEach((ln, k) => g.fillText(ln, S / 2, top + k * lh));
    g.fillStyle = "#F0A500"; g.font = font(700, 50); g.fillText(v.ref, S / 2, y + h - 70);
    if (logo) g.drawImage(logo, 60, 40, 210, 140);
    g.fillStyle = "#41383B"; g.font = font(600, 40); g.textAlign = "right"; g.fillText("Bible Buddies", S - 60, 110);
    g.font = font(500, 28); g.fillText("Learn • Play • Discover Jesus", S - 60, 150);
    g.textAlign = "center"; g.fillStyle = "#FFFFFF"; g.font = font(600, 36); g.fillText("Free Bible stories & games for kids", S / 2, 985);
    g.font = font(500, 27); g.fillText(SITE_URL.replace(/^https:\/\//, "").replace(/\/$/, ""), S / 2, 1035);
    c.toBlob(async blob => {
      const file = new File([blob], "bible-buddies-verse.png", { type: "image/png" });
      const text = `${v.text} (${v.ref}) — from Bible Buddies, a free Bible website for kids: ${SITE_URL}`;
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try { await navigator.share({ files: [file], title: "Today's Memory Verse", text }); return; } catch (e) { if (e.name === "AbortError") return; }
      }
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = file.name; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      bbToast("Verse picture saved! 🖼️ Share it with a grown-up.");
    }, "image/png");
  };
  const logo = new Image();
  logo.onload = () => draw(logo); logo.onerror = () => draw(null);
  logo.src = "images/logo.png";
  (document.fonts && document.fonts.load ? document.fonts.load(font(600, 40)) : Promise.resolve()).catch(() => {});
}
function roundRect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function wrap(g, text, max) {
  const out = []; let line = "";
  text.split(" ").forEach(word => { const t = line ? line + " " + word : word; if (g.measureText(t).width > max && line) { out.push(line); line = word; } else line = t; });
  if (line) out.push(line); return out;
}

/* ---------- RUNNING INSIDE THE ANDROID APP ----------
   The app (android-app/) shows these same pages. Capacitor adds window.Capacitor there. */
const BB_APP = !!(window.Capacitor && typeof window.Capacitor.isNativePlatform === "function" && window.Capacitor.isNativePlatform());
function bbPlugin(name) { return BB_APP && window.Capacitor.Plugins ? window.Capacitor.Plugins[name] || null : null; }
if (BB_APP) document.documentElement.classList.add("is-app");

/* ---------- TEXT-TO-SPEECH ---------- */
function bbStopSpeaking() {
  const tts = bbPlugin("TextToSpeech");
  if (tts) { tts.stop().catch(() => {}); return; }
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}
function speakText(text) {
  const tts = bbPlugin("TextToSpeech");   // in the app: Android's own voice
  if (tts) {
    tts.stop().catch(() => {}).then(() => tts.speak({ text, lang: "en-US", rate: 0.95, pitch: 1.05 }))
      .catch(() => bbToast("Read-aloud isn't available on this device."));
    return;
  }
  if (!("speechSynthesis" in window)) { bbToast("Read-aloud isn't available on this device."); return; }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.95; u.pitch = 1.05;
  window.speechSynthesis.speak(u);
}

/* ---------- CONFETTI + TOAST (used by games/quiz too) ---------- */
function bbConfetti() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const colors = ["#FFC93C", "#4CB4E7", "#63C67A", "#FF8A5B", "#7C5CBF"];
  for (let i = 0; i < CONFIG.confettiCount; i++) {
    const p = document.createElement("div");
    p.className = "confetti-piece";
    p.style.left = Math.random() * 100 + "vw";
    p.style.background = colors[i % colors.length];
    p.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    const dur = 2 + Math.random() * 1.5;
    p.animate(
      [{ transform: `translateY(0) rotate(0)`, opacity: 1 },
       { transform: `translateY(105vh) rotate(${360 + Math.random() * 360}deg)`, opacity: 1 }],
      { duration: dur * 1000, easing: "ease-in" }
    );
    document.body.appendChild(p);
    setTimeout(() => p.remove(), dur * 1000);
  }
}

/* Reusable Buddy the Sheep SVG (used by the dancing celebration) */
const BUDDY_SVG = `<svg viewBox="0 0 120 120" role="img" aria-label="Buddy the Sheep dancing">
  <ellipse cx="60" cy="105" rx="34" ry="7" fill="rgba(0,0,0,.12)"/>
  <circle cx="42" cy="60" r="16" fill="#fff" stroke="#41383B" stroke-width="3"/>
  <circle cx="78" cy="60" r="16" fill="#fff" stroke="#41383B" stroke-width="3"/>
  <circle cx="60" cy="48" r="18" fill="#fff" stroke="#41383B" stroke-width="3"/>
  <ellipse cx="60" cy="70" rx="30" ry="26" fill="#fff" stroke="#41383B" stroke-width="3"/>
  <ellipse cx="60" cy="74" rx="20" ry="18" fill="#4b4043"/>
  <circle cx="53" cy="70" r="4" fill="#fff"/><circle cx="67" cy="70" r="4" fill="#fff"/>
  <circle cx="53" cy="71" r="2" fill="#1c1618"/><circle cx="67" cy="71" r="2" fill="#1c1618"/>
  <path d="M55 80 q5 5 10 0" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <ellipse cx="40" cy="78" rx="6" ry="9" fill="#4b4043"/><ellipse cx="80" cy="78" rx="6" ry="9" fill="#4b4043"/>
  <rect x="48" y="96" width="6" height="14" rx="3" fill="#4b4043"/>
  <rect x="66" y="96" width="6" height="14" rx="3" fill="#4b4043"/>
</svg>`;

/* Dancing Buddy — pops up, dances, then hops away */
let danceTimer;
function bbDanceBuddy() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let el = document.querySelector(".buddy-dance");
  if (el) el.remove();
  el = document.createElement("div");
  el.className = "buddy-dance";
  el.innerHTML = BUDDY_SVG;
  document.body.appendChild(el);
  clearTimeout(danceTimer);
  danceTimer = setTimeout(() => {
    el.classList.add("out");
    setTimeout(() => el.remove(), 420);
  }, 2200);
}

/* One call for the full "correct answer" celebration */
function bbCelebrate() { bbConfetti(); bbDanceBuddy(); }

let toastTimer;
function bbToast(msg) {
  let t = document.querySelector(".toast");
  if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.appendChild(t); }
  t.textContent = msg;
  requestAnimationFrame(() => t.classList.add("show"));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), CONFIG.toastMs);
}

/* ---------- REVEAL ON SCROLL ---------- */
function initReveal() {
  if (!CONFIG.revealOnScroll) return;
  const items = document.querySelectorAll(".reveal");
  if (!items.length || !("IntersectionObserver" in window)) { items.forEach(i => i.classList.add("in")); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  items.forEach(i => io.observe(i));
}

/* ---------- BOOT ---------- */
document.addEventListener("DOMContentLoaded", () => {
  [initNav, initSearch, initDailyAdventure, initDiscover, initDailyVerse, initShareButtons].forEach(fn => {
    try { fn(); } catch (err) { console.error(fn.name, err); }
  });
  initReveal();
  // Android app: the phone's back button closes an open box first, then goes back a page
  const appPlugin = bbPlugin("App");
  if (appPlugin) appPlugin.addListener("backButton", e => {
    const open = document.querySelector(".modal.open");
    if (open) { const x = open.querySelector(".modal-close"); if (x) x.click(); else open.classList.remove("open"); return; }
    const menu = document.querySelector(".nav-toggle[aria-expanded='true']");
    if (menu) { menu.click(); return; }
    bbStopSpeaking();
    if (e && e.canGoBack) history.back(); else appPlugin.exitApp();
  });
  // Android app: a tapped Bible Buddies web link opens the same page inside the app
  if (appPlugin) {
    const openLink = url => {
      const m = String(url || "").match(/\/Bible-Buddies\/?([^?#]*)([?#].*)?$/i);
      if (!m) return;
      // open each link only once (the launch link is reported again on every page)
      try {
        const done = JSON.parse(sessionStorage.getItem("bbLinks") || "[]");
        if (done.includes(url)) return;
        done.push(url); sessionStorage.setItem("bbLinks", JSON.stringify(done.slice(-20)));
      } catch (e) {}
      location.href = BB_BASE + (m[1] || "index.html") + (m[2] || "");
    };
    appPlugin.addListener("appUrlOpen", e => openLink(e && e.url));
    if (appPlugin.getLaunchUrl) appPlugin.getLaunchUrl().then(r => r && openLink(r.url)).catch(() => {});
  }
  // Register service worker for offline use (not needed in the app, which carries its own copy)
  if (!BB_APP && "serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register(BB_BASE + "service-worker.js").catch(() => {});
  }
});
