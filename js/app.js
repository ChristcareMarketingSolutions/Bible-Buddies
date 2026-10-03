/* =====================================================================
   BIBLE BUDDIES — app.js
   Site-wide behaviour: navigation, search, daily content, verse tools,
   confetti/toast, text-to-speech. Loaded on every page.
   ===================================================================== */

/* ---------- CONFIG (tweak feel here) ---------- */
const CONFIG = {
  confettiCount: 60,
  toastMs: 2600,
  revealOnScroll: true
};

/* ---------- helper: today's index (changes daily, no server) ---------- */
function dayIndex(len) {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const day = Math.floor((now - start) / 86400000);
  return day % len;
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
      <a href="${h.url}">
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

/* ---------- TODAY'S BIBLE ADVENTURE ---------- */
function initDailyAdventure() {
  const box = document.querySelector("[data-daily-adventure]");
  if (!box) return;
  const s = STORIES[dayIndex(STORIES.length)];
  box.querySelector("[data-title]").textContent = s.title;
  box.querySelector("[data-desc]").textContent = s.description;
  const em = box.querySelector("[data-emoji]");
  if (em) em.textContent = s.emoji;
}

/* ---------- WHAT WILL YOU DISCOVER TODAY ---------- */
function initDiscover() {
  const box = document.querySelector("[data-discover]");
  if (!box) return;
  const draw = () => {
    const story = STORIES[Math.floor(Math.random() * STORIES.length)];
    const verse = VERSES[Math.floor(Math.random() * VERSES.length)];
    box.querySelector("[data-d-story]").textContent = story.title;
    box.querySelector("[data-d-verse]").textContent = verse.ref;
  };
  draw();
  const btn = document.querySelector("[data-discover-btn]");
  btn && btn.addEventListener("click", draw);
}

/* ---------- DAILY MEMORY VERSE (home + verses page) ---------- */
function initDailyVerse() {
  document.querySelectorAll("[data-daily-verse]").forEach(box => {
    let i = dayIndex(VERSES.length);
    const hide = box.querySelector("[data-v-hide]");
    const show = () => {
      const v = VERSES[i];
      if (hide) hide.textContent = "Hide words";
      box.querySelector("[data-v-text]").textContent = `“${v.text}”`;
      box.querySelector("[data-v-ref]").textContent = v.ref;
      const ex = box.querySelector("[data-v-explain]");
      if (ex) ex.textContent = v.explain;
    };
    show();
    const next = box.querySelector("[data-v-next]");
    next && next.addEventListener("click", () => { i = (i + 1) % VERSES.length; show(); });
    hide && hide.addEventListener("click", () => {
      if (hide.textContent === "Hide words") {
        hideWords(box.querySelector("[data-v-text]"), VERSES[i].text);
        hide.textContent = "Show words";
      } else show();
    });
    const speak = box.querySelector("[data-v-speak]");
    speak && speak.addEventListener("click", () => speakText(VERSES[i].text + ". " + VERSES[i].ref));
    // share today's verse as a picture card
    const row = box.querySelector(".btn-row");
    if (row) {
      const b = document.createElement("button");
      b.type = "button"; b.className = "btn btn-grape"; b.textContent = "📤 Share verse";
      b.title = "Grown-ups: share this verse as a picture";
      b.addEventListener("click", () => bbShareVerse(VERSES[i]));
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
  el.textContent = "“";
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
  el.append("”");
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
    do { g.font = font(600, px); lines = wrap(g, `“${v.text}”`, w - 120); px -= 4; } while (lines.length * px * 1.25 > h - 260 && px > 34);
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

/* ---------- TEXT-TO-SPEECH ---------- */
function speakText(text) {
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
  // Register service worker for offline use (ignored when opened via file://)
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  }
});
