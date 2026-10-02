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
  [initNav, initSearch, initDailyAdventure, initDiscover, initDailyVerse].forEach(fn => {
    try { fn(); } catch (err) { console.error(fn.name, err); }
  });
  initReveal();
  // Register service worker for offline use (ignored when opened via file://)
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  }
});
