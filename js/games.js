/* =====================================================================
   BIBLE BUDDIES — games.js
   Memory Match, Who Am I?, Word Scramble.
   Each game boots only if its container exists on the page.
   ===================================================================== */

/* ---------- GAME 1: BIBLE MEMORY MATCH ---------- */
function initMemoryMatch() {
  const grid = document.querySelector("[data-memory-grid]");
  if (!grid) return;
  const movesEl = document.querySelector("[data-mem-moves]");
  const matchEl = document.querySelector("[data-mem-matches]");
  const timeEl  = document.querySelector("[data-mem-time]");
  const restart = document.querySelector("[data-mem-restart]");
  const factEl  = document.querySelector("[data-mem-fact]");
  const levelBtns = [...document.querySelectorAll("[data-mem-level]")];
  const LEVELS = { easy: 6, medium: 8, hard: 12 };
  let level = "medium";
  try { level = localStorage.getItem("bibleBuddies.memoryLevel") || "medium"; } catch (e) {}
  if (!LEVELS[level]) level = "medium";

  let deck, pairs, first, lock, moves, matches, seconds, timer;

  function build() {
    clearInterval(timer);
    moves = 0; matches = 0; seconds = 0; first = null; lock = false;
    pairs = shuffle(MEMORY_PAIRS).slice(0, LEVELS[level]);       // a new mix of heroes every game
    movesEl.textContent = "0"; matchEl.textContent = `0/${pairs.length}`; timeEl.textContent = "0s";
    grid.dataset.level = level;
    levelBtns.forEach(b => { const on = b.dataset.memLevel === level; b.classList.toggle("active", on); b.setAttribute("aria-pressed", String(on)); });
    if (factEl) factEl.textContent = "Find the pairs! Each match tells you something from the Bible. 📖";
    // two cards per pair: the name, and the symbol
    deck = [];
    pairs.forEach((p, i) => {
      const longest = Math.max(...p.a.split(" ").map(w => w.length));   // smaller text for long names, so words never break
      deck.push({ pair: i, face: `<span class="mem-name" style="font-size:${Math.min(20, 80 / (longest * 0.58)).toFixed(1)}cqi">${p.a}</span>`, say: p.a, kind: "name" });
      deck.push({ pair: i, face: `<span class="mem-emoji">${p.b}</span><span class="mem-label">${p.label}</span>`, say: p.label, kind: "sym" });
    });
    deck = shuffle(deck);
    grid.innerHTML = deck.map((c, i) => `
      <button class="mem-card mem-k-${c.kind} mem-c${(i + Math.floor(i / 4)) % 4}" data-i="${i}" data-pair="${c.pair}" data-say="${c.say}" aria-label="Card ${i + 1}, hidden">
        <span class="mem-inner">
          <span class="mem-face mem-front" aria-hidden="true"><span class="mem-q">?</span></span>
          <span class="mem-face mem-back">${c.face}<span class="mem-tick" aria-hidden="true">✓</span></span>
        </span>
      </button>`).join("");
    grid.querySelectorAll(".mem-card").forEach(card => card.addEventListener("click", () => flip(card)));
    timer = null;   // the clock starts on the first flip, not when the page loads
  }

  /* Screen readers: say what is on a card once it is turned over */
  function label(card, state) {
    const n = Number(card.dataset.i) + 1;
    card.setAttribute("aria-label", state === "hidden" ? `Card ${n}, hidden` : `Card ${n}, ${card.dataset.say}${state === "matched" ? ", matched" : ""}`);
  }

  function flip(card) {
    if (lock || card.classList.contains("flipped") || card.classList.contains("matched")) return;
    if (!timer) timer = setInterval(() => { seconds++; timeEl.textContent = seconds + "s"; }, 1000);
    card.classList.add("flipped"); label(card, "shown");
    if (!first) { first = card; return; }
    moves++; movesEl.textContent = moves;
    if (first.dataset.pair === card.dataset.pair) {
      first.classList.add("matched"); card.classList.add("matched");
      label(first, "matched"); label(card, "matched");
      const p = pairs[Number(card.dataset.pair)];
      if (factEl) factEl.innerHTML = `<strong>${p.b} ${p.a}:</strong> ${p.fact} <span class="mem-ref">(${p.ref})</span>`;
      first = null; matches++; matchEl.textContent = `${matches}/${pairs.length}`;
      if (matches === pairs.length) win();
    } else {
      lock = true;
      setTimeout(() => {
        first.classList.remove("flipped"); card.classList.remove("flipped");
        label(first, "hidden"); label(card, "hidden");
        first = null; lock = false;
      }, 800);
    }
  }

  function win() {
    clearInterval(timer);
    bbCelebrate();
    bbToast(`Great job! ⭐ ${moves} moves, ${seconds}s`);
    if (factEl) factEl.innerHTML = `🎉 <strong>You found all ${pairs.length} pairs!</strong> Press <strong>New game</strong> for a new mix of Bible heroes.`;
    bbAddStars({ easy: 3, medium: 5, hard: 8 }[level], "game-memory-" + level);   // rewarded once per level
  }

  restart && restart.addEventListener("click", build);
  levelBtns.forEach(b => b.addEventListener("click", () => {
    level = b.dataset.memLevel;
    try { localStorage.setItem("bibleBuddies.memoryLevel", level); } catch (e) {}
    build();
  }));
  build();
}

/* ---------- GAME 2: WHO AM I? ---------- */
function initWhoAmI() {
  const stage = document.querySelector("[data-whoami]");
  if (!stage) return;
  const clueEl = stage.querySelector("[data-clue]");
  const optsEl = stage.querySelector("[data-options]");
  const fbEl   = stage.querySelector("[data-feedback]");
  const nextEl = stage.querySelector("[data-next]");
  let i = 0, answered = false;

  function show() {
    const item = WHO_AM_I[i];
    answered = false;
    clueEl.textContent = item.clue;
    fbEl.textContent = "";
    nextEl.style.visibility = "hidden";
        const shuffled = item.options.slice();
    for (let k = shuffled.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [shuffled[k], shuffled[j]] = [shuffled[j], shuffled[k]]; }
    optsEl.innerHTML = shuffled.map(o => `<button class="q-option" data-o="${o}">${o}</button>`).join("");
    optsEl.querySelectorAll(".q-option").forEach(b => b.addEventListener("click", () => choose(b, item.answer)));
  }
  function choose(btn, answer) {
    if (answered) return;
    answered = true;
    optsEl.querySelectorAll(".q-option").forEach(b => b.disabled = true);
    if (btn.dataset.o === answer) {
      btn.classList.add("correct");
      fbEl.textContent = "That's right! 🎉";
      bbAddStars(2, "whoami-" + i);
      bbCelebrate();
    } else {
      btn.classList.add("wrong");
      optsEl.querySelector(`[data-o="${answer}"]`).classList.add("correct");
      fbEl.textContent = "Almost! The answer is " + answer + ".";
    }
    nextEl.style.visibility = "visible";
  }
  nextEl.addEventListener("click", () => { i = (i + 1) % WHO_AM_I.length; show(); });
  show();
}

/* ---------- GAME 3: WORD SCRAMBLE ---------- */
function initScramble() {
  const stage = document.querySelector("[data-scramble]");
  if (!stage) return;
  const wordEl  = stage.querySelector("[data-scramble-word]");
  const input   = stage.querySelector("[data-scramble-input]");
  const checkEl = stage.querySelector("[data-scramble-check]");
  const skipEl  = stage.querySelector("[data-scramble-skip]");
  const fbEl    = stage.querySelector("[data-scramble-feedback]");
  const scoreEl = stage.querySelector("[data-scramble-score]");
  let current, score = 0;

  function scrambleStr(w) {
    let s;
    do { s = shuffle(w.split("")).join(""); } while (s === w && w.length > 1);
    return s;
  }
  function next() {
    current = SCRAMBLE_WORDS[Math.floor(Math.random() * SCRAMBLE_WORDS.length)];
    wordEl.textContent = scrambleStr(current);
    input.value = ""; fbEl.textContent = ""; input.focus();
  }
  function check() {
    if (input.value.trim().toUpperCase() === current) {
      score++; scoreEl.textContent = score;
      fbEl.textContent = "Correct! ⭐"; fbEl.style.color = "var(--meadow-deep)";
      bbAddStars(1, "scramble-total");   // one-time bonus for playing
      bbCelebrate();
      setTimeout(next, 900);
    } else {
      fbEl.textContent = "Try again!"; fbEl.style.color = "var(--coral-deep)";
    }
  }
  checkEl.addEventListener("click", check);
  skipEl.addEventListener("click", next);
  input.addEventListener("keydown", e => { if (e.key === "Enter") check(); });
  next();
}

document.addEventListener("DOMContentLoaded", () => {
  initMemoryMatch();
  initWhoAmI();
  initScramble();
});

/* ===================================================================
   DAVID'S SLING  (aim and shoot, non-violent)
   50 "worry" balloons float up from the bottom and away off the top.
   Pop as many as you can! Tap where you want the stone to go, or pull
   the sling back and let go, or use the arrow keys and space.
   =================================================================== */
function initDavidSling() {
  const canvas = document.querySelector("[data-sling-canvas]");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = 640, H = 360, dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = W * dpr; canvas.height = H * dpr; ctx.scale(dpr, dpr);
  const ground = H - 28, anchor = { x: 92, y: 250 }, stoneR = 8, GRAV = 900;
  const TOTAL = 50, COLORS = ["#FF8A5B", "#7C5CBF", "#4CB4E7", "#E9973F", "#63C67A", "#F25C8C", "#2EB5A6"];
  const WORDS = ["Fear", "Worry", "Doubt", "Anger", "Grumpy", "Sad", "Lonely", "Pride", "Jealous", "Greedy", "Selfish", "Unkind", "Lies", "Scared", "Upset", "Bossy", "Rude", "Moody"];
  const $ = sel => document.querySelector(sel);
  const scoreEl = $("[data-sling-score]"), missEl = $("[data-sling-missed]"), leftEl = $("[data-sling-left]"), fbEl = $("[data-sling-feedback]"), resetBtn = $("[data-sling-reset]");

  let phase, balloons, stones, bits, texts, released, popped, missed, spawnIn, combo, comboT, angle, power, aimV, dragging, dragged, clouds;
  function reset() {
    phase = "ready"; balloons = []; stones = []; bits = []; texts = [];
    released = 0; popped = 0; missed = 0; spawnIn = 0; combo = 0; comboT = 0;
    angle = 50; power = 70; aimV = null; dragging = false;
    clouds = [0, 1, 2].map(i => ({ x: 120 + i * 220, y: 40 + i * 18, s: 0.8 + i * 0.2 }));
    hud(); say("Tap ▶ Start, then tap the balloons to throw a stone!");
  }
  function start() { if (phase !== "playing") { if (phase === "done") reset(); phase = "playing"; say("Pop the worries before they float away! 🎈"); } }
  function hud() {
    if (scoreEl) scoreEl.textContent = popped;
    if (missEl) missEl.textContent = missed;
    if (leftEl) leftEl.textContent = TOTAL - released;
  }
  const say = t => { if (fbEl) fbEl.textContent = t; };

  /* ---- balloons rise from the bottom ---- */
  function spawn() {
    const n = released, giant = (n + 1) % 10 === 0, prog = n / TOTAL;
    const r = giant ? 40 : 24 + Math.random() * 8;
    balloons.push({
      x: 220 + Math.random() * (W - 250), y: H + r + 20, r, giant,
      vy: -(giant ? 34 : 42 + Math.random() * 30) * (1 + prog * 0.7),
      sway: 8 + Math.random() * 14, ph: Math.random() * 6.28, f: 1 + Math.random(),
      word: giant ? "Giant" : WORDS[n % WORDS.length], color: giant ? "#F4C430" : COLORS[n % COLORS.length]
    });
    released++; hud();
  }
  /* ---- stones ---- */
  function throwStone(vx, vy) {
    if (phase === "ready") start();
    if (phase !== "playing" || stones.length >= 3) return;
    stones.push({ x: anchor.x, y: anchor.y, vx, vy });
    blip(520, 0.05, "triangle");
  }
  function aimAt(tx, ty) {               // velocity that reaches (tx, ty) along a gentle arc
    const dx = tx - anchor.x, dy = ty - anchor.y, d = Math.hypot(dx, dy), sp = 820, t = d / sp;
    return { vx: dx / t, vy: dy / t - 0.5 * GRAV * t };
  }
  function keyAim() { const r = angle * Math.PI / 180, sp = 420 + power * 6; return { vx: Math.cos(r) * sp, vy: -Math.sin(r) * sp }; }

  /* ---- sounds (gentle, made in the browser) ---- */
  let audio;
  function blip(freq, len, type = "sine", slide = 0) {
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      const o = audio.createOscillator(), g = audio.createGain(), t = audio.currentTime;
      o.type = type; o.frequency.setValueAtTime(freq, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + len);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.18, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
      o.connect(g).connect(audio.destination); o.start(t); o.stop(t + len + 0.02);
    } catch (e) {}
  }

  /* ---- game step ---- */
  function step(dt, t) {
    clouds.forEach(c => { c.x += dt * 8 * c.s; if (c.x > W + 60) c.x = -60; });
    if (phase === "playing") {
      spawnIn -= dt;
      if (released < TOTAL && spawnIn <= 0) {
        spawn();
        const prog = released / TOTAL;
        spawnIn = 1.25 - prog * 0.7 + Math.random() * 0.35;
        if (prog > 0.4 && released < TOTAL && Math.random() < 0.25) spawn();      // sometimes two at once
      }
    }
    balloons.forEach(b => { b.y += b.vy * dt; b.ph += dt * b.f; });
    for (let i = balloons.length - 1; i >= 0; i--) {
      if (balloons[i].y < -balloons[i].r - 30) { balloons.splice(i, 1); missed++; combo = 0; hud(); }
    }
    for (let i = stones.length - 1; i >= 0; i--) {
      const s = stones[i];
      s.x += s.vx * dt; s.y += s.vy * dt; s.vy += GRAV * dt;
      for (let k = balloons.length - 1; k >= 0; k--) {
        const b = balloons[k], bx = b.x + Math.sin(b.ph) * b.sway;
        if (Math.hypot(s.x - bx, s.y - b.y) < b.r + stoneR) { pop(b, bx, k); }
      }
      if (s.y > ground + 10 || s.x > W + 30 || s.x < -30 || s.y < -400) stones.splice(i, 1);
    }
    bits.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 500 * dt; p.life -= dt; });
    bits = bits.filter(p => p.life > 0);
    texts.forEach(p => { p.y -= 40 * dt; p.life -= dt; });
    texts = texts.filter(p => p.life > 0);
    comboT -= dt; if (comboT <= 0) combo = 0;
    if (phase === "playing" && released >= TOTAL && balloons.length === 0) finish();
  }
  function pop(b, bx, k) {
    balloons.splice(k, 1); popped++; combo++; comboT = 1.3; hud();
    for (let i = 0; i < 14; i++) { const a = Math.random() * 6.28, v = 80 + Math.random() * 160; bits.push({ x: bx, y: b.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, life: 0.6 + Math.random() * 0.3, c: b.color }); }
    texts.push({ x: bx, y: b.y, text: combo > 1 ? `Combo ×${combo}!` : "Pop!", life: 0.9, c: combo > 1 ? "#F0A500" : "#41383B" });
    blip(b.giant ? 260 : 700 + Math.random() * 200, 0.12, "sine", b.giant ? 90 : 180);
  }
  function finish() {
    phase = "done";
    const best = popped >= 45 ? "Amazing! 🌟" : popped >= 30 ? "Great job! ⭐" : popped >= 15 ? "Well done! 👍" : "Good try! 🙂";
    say(`${best} You popped ${popped} of ${TOTAL} worries. Like David facing Goliath, we can trust God with big things! (1 Samuel 17:45–47)`);
    if (typeof bbAddBest === "function") bbAddBest("sling", Math.floor(popped / 10));
    if (popped >= 30 && typeof bbCelebrate === "function") bbCelebrate();
  }

  /* ---- drawing ---- */
  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "rgba(255,236,150,.9)"; ctx.beginPath(); ctx.arc(560, 52, 26, 0, 6.28); ctx.fill();
    clouds.forEach(c => { ctx.fillStyle = "rgba(255,255,255,.9)"; [[0, 0, 18], [18, -8, 22], [38, 0, 16]].forEach(([dx, dy, r]) => { ctx.beginPath(); ctx.arc(c.x + dx * c.s, c.y + dy * c.s, r * c.s, 0, 6.28); ctx.fill(); }); });
    ctx.fillStyle = "#8BD07A"; ctx.beginPath(); ctx.moveTo(0, ground - 30); ctx.quadraticCurveTo(200, ground - 70, 380, ground - 25); ctx.quadraticCurveTo(520, ground - 55, W, ground - 20); ctx.lineTo(W, ground); ctx.lineTo(0, ground); ctx.fill();
    // balloons
    balloons.forEach(b => {
      const bx = b.x + Math.sin(b.ph) * b.sway, by = b.y;
      ctx.strokeStyle = "rgba(65,56,59,.7)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(bx, by + b.r * 1.12);
      for (let k = 1; k <= 6; k++) ctx.lineTo(bx + Math.sin(b.ph * 2 + k) * 4, by + b.r * 1.12 + k * 7); ctx.stroke();
      ctx.fillStyle = b.color; ctx.strokeStyle = "#41383B"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(bx, by, b.r * 0.92, b.r * 1.08, 0, 0, 6.28); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx - 5, by + b.r * 1.16); ctx.lineTo(bx + 5, by + b.r * 1.16); ctx.lineTo(bx, by + b.r * 1.02); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,.45)"; ctx.beginPath(); ctx.ellipse(bx - b.r * 0.35, by - b.r * 0.4, b.r * 0.18, b.r * 0.3, -0.5, 0, 6.28); ctx.fill();
      ctx.font = `700 ${b.giant ? 17 : 13}px Fredoka, Nunito, sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.lineWidth = 3; ctx.strokeStyle = "rgba(65,56,59,.55)"; ctx.strokeText(b.word, bx, by); ctx.fillStyle = "#fff"; ctx.fillText(b.word, bx, by);
    });
    // pop bits and words
    bits.forEach(p => { ctx.globalAlpha = Math.max(0, p.life / 0.9); ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, 6.28); ctx.fill(); });
    ctx.globalAlpha = 1;
    texts.forEach(p => { ctx.globalAlpha = Math.max(0, p.life / 0.9); ctx.font = "700 18px Fredoka, Nunito, sans-serif"; ctx.textAlign = "center"; ctx.lineWidth = 4; ctx.strokeStyle = "#fff"; ctx.strokeText(p.text, p.x, p.y); ctx.fillStyle = p.c; ctx.fillText(p.text, p.x, p.y); });
    ctx.globalAlpha = 1;
    // ground
    ctx.fillStyle = "#63C67A"; ctx.fillRect(0, ground, W, H - ground);
    ctx.strokeStyle = "#41383B"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, ground); ctx.lineTo(W, ground); ctx.stroke();
    // David
    const dx = anchor.x;
    ctx.fillStyle = "#C98B6B"; ctx.beginPath(); ctx.moveTo(dx - 20, ground); ctx.lineTo(dx - 12, ground - 50); ctx.lineTo(dx + 12, ground - 50); ctx.lineTo(dx + 20, ground); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#8A5C30"; ctx.fillRect(dx - 13, ground - 32, 26, 5);
    ctx.fillStyle = "#D49A6A"; ctx.beginPath(); ctx.arc(dx, ground - 62, 13, 0, 6.28); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#5A3A22"; ctx.beginPath(); ctx.arc(dx, ground - 66, 13, Math.PI, 0); ctx.fill();
    ctx.fillStyle = "#2A2422"; ctx.beginPath(); ctx.arc(dx - 4, ground - 62, 1.8, 0, 6.28); ctx.arc(dx + 5, ground - 62, 1.8, 0, 6.28); ctx.fill();
    ctx.strokeStyle = "#2A2422"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(dx + 1, ground - 58, 4, 0.2, Math.PI - 0.2); ctx.stroke();
    // sling and aim guide
    const v = dragging && aimV ? aimV : (kbAim ? keyAim() : null);
    ctx.strokeStyle = "#7A5230"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(dx - 12, ground - 48); ctx.lineTo(anchor.x, anchor.y); ctx.lineTo(dx + 12, ground - 48); ctx.stroke();
    if (v) {
      ctx.fillStyle = "rgba(65,56,59,.45)"; let px = anchor.x, py = anchor.y, vx = v.vx, vy = v.vy;
      for (let k = 0; k < 26; k++) { px += vx / 60; py += vy / 60; vy += GRAV / 60; if (k % 2 === 0) { ctx.beginPath(); ctx.arc(px, py, 2.5, 0, 6.28); ctx.fill(); } }
    }
    ctx.fillStyle = "#6E6266"; ctx.strokeStyle = "#41383B"; ctx.lineWidth = 2;
    if (stones.length < 3) { ctx.beginPath(); ctx.arc(anchor.x, anchor.y, stoneR, 0, 6.28); ctx.fill(); ctx.stroke(); }
    stones.forEach(s => { ctx.beginPath(); ctx.arc(s.x, s.y, stoneR, 0, 6.28); ctx.fill(); ctx.stroke(); });
    // start / end screens
    if (phase !== "playing") {
      ctx.fillStyle = "rgba(255,253,247,.82)"; ctx.fillRect(0, 0, W, H);
      ctx.textAlign = "center"; ctx.fillStyle = "#41383B";
      if (phase === "ready") {
        ctx.font = "700 30px Fredoka, Nunito, sans-serif"; ctx.fillText("🎈 50 worry balloons are coming!", W / 2, 120);
        ctx.font = "600 18px Fredoka, Nunito, sans-serif"; ctx.fillText("Tap a balloon to throw a stone at it.", W / 2, 158);
        btn("▶ Start", W / 2, 215);
      } else {
        ctx.font = "700 32px Fredoka, Nunito, sans-serif"; ctx.fillText(`You popped ${popped} of ${TOTAL}!`, W / 2, 125);
        ctx.font = "600 18px Fredoka, Nunito, sans-serif"; ctx.fillText("David trusted God when he faced the giant.", W / 2, 162);
        btn("↺ Play again", W / 2, 220);
      }
    }
  }
  function btn(label, x, y) {
    ctx.font = "700 22px Fredoka, Nunito, sans-serif"; const w = ctx.measureText(label).width + 48;
    ctx.fillStyle = "rgba(0,0,0,.15)"; rr(x - w / 2, y - 22 + 5, w, 46); ctx.fill();
    ctx.fillStyle = "#FFC93C"; ctx.strokeStyle = "#41383B"; ctx.lineWidth = 3; rr(x - w / 2, y - 22, w, 46); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#41383B"; ctx.textBaseline = "middle"; ctx.fillText(label, x, y + 1); ctx.textBaseline = "alphabetic";
  }
  function rr(x, y, w, h) { const r = h / 2; ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

  /* ---- loop: only while the game is on screen ---- */
  let visible = true, last = 0;
  if ("IntersectionObserver" in window) new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(canvas);
  function loop(ts) {
    requestAnimationFrame(loop);
    const dt = Math.min(0.05, (ts - last) / 1000 || 0); last = ts;
    if (!visible || document.hidden) return;
    step(dt, ts / 1000); draw(ts / 1000);
  }

  /* ---- input: tap to throw, or pull the sling back and let go ---- */
  function toCanvas(e) {
    const r = canvas.getBoundingClientRect(), p = e.touches ? e.touches[0] || e.changedTouches[0] : e;
    return { x: (p.clientX - r.left) * (W / r.width), y: (p.clientY - r.top) * (H / r.height) };
  }
  let downAt = null, kbAim = false;
  canvas.addEventListener("pointerdown", e => {
    e.preventDefault(); kbAim = false;
    const p = toCanvas(e);
    if (phase !== "playing") { start(); return; }
    downAt = p; dragged = false;
    dragging = Math.hypot(p.x - anchor.x, p.y - anchor.y) < 70;      // grabbed the sling
    if (dragging) aimV = null;
    canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", e => {
    if (!dragging) return;
    const p = toCanvas(e); dragged = true;
    let vx = (anchor.x - p.x) * 9, vy = (anchor.y - p.y) * 9; const sp = Math.hypot(vx, vy), MAX = 1100;
    if (sp > MAX) { vx *= MAX / sp; vy *= MAX / sp; }
    aimV = { vx, vy };
  });
  canvas.addEventListener("pointerup", e => {
    if (!downAt) return;
    const p = toCanvas(e);
    if (dragging && dragged && aimV) throwStone(aimV.vx, aimV.vy);           // sling pulled back and let go
    else if (!dragging || !dragged) { const v = aimAt(p.x, Math.min(p.y, ground - 10)); throwStone(v.vx, v.vy); }   // tap to throw
    dragging = false; aimV = null; downAt = null;
  });
  canvas.addEventListener("pointercancel", () => { dragging = false; aimV = null; downAt = null; });
  canvas.addEventListener("keydown", e => {
    const k = e.key;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "Enter"].includes(k)) e.preventDefault(); else return;
    if (phase !== "playing" && (k === " " || k === "Enter")) { start(); return; }
    kbAim = true;
    if (k === "ArrowUp") angle = Math.min(85, angle + 3);
    else if (k === "ArrowDown") angle = Math.max(10, angle - 3);
    else if (k === "ArrowRight") power = Math.min(100, power + 4);
    else if (k === "ArrowLeft") power = Math.max(20, power - 4);
    else { const v = keyAim(); throwStone(v.vx, v.vy); }
  });
  resetBtn && resetBtn.addEventListener("click", () => { reset(); start(); });
  reset();
  requestAnimationFrame(loop);
  canvas.__sling = { get state() { return { phase, released, popped, missed, onScreen: balloons.length }; }, start, throwAt: (x, y) => { const v = aimAt(x, y); throwStone(v.vx, v.vy); }, balloons: () => balloons };
}

/* ===================================================================
   DAVID'S HARP
   Pluck strings to make music (Web Audio), plus a copy-the-tune game.
   =================================================================== */
function initDavidHarp() {
  const wrap = document.querySelector("[data-harp-strings]");
  if (!wrap) return;
  const NOTES = [
    { f: 261.63, c: "#FF8A5B", h: 184 }, { f: 293.66, c: "#FFC93C", h: 172 },
    { f: 329.63, c: "#63C67A", h: 160 }, { f: 392.00, c: "#4CB4E7", h: 148 },
    { f: 440.00, c: "#7C5CBF", h: 136 }, { f: 523.25, c: "#F26430", h: 124 },
    { f: 587.33, c: "#3FA857", h: 112 }
  ];
  const levelEl = document.querySelector("[data-harp-level]");
  const fbEl    = document.querySelector("[data-harp-feedback]");
  const playBtn = document.querySelector("[data-harp-play]");
  const freeBtn = document.querySelector("[data-harp-free]");
  let audio;
  function ac() { if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)(); return audio; }
  function playNote(f) {
    const a = ac(); const o = a.createOscillator(); const g = a.createGain();
    o.type = "triangle"; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.3, a.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + 0.7);
    o.connect(g).connect(a.destination); o.start(); o.stop(a.currentTime + 0.72);
  }
  let seq = [], step = 0, listening = false;
  const strings = NOTES.map((note, i) => {
    const b = document.createElement("button");
    b.className = "harp-string"; b.style.background = note.c;
    b.style.setProperty("--h", note.h + "px");
    b.setAttribute("aria-label", "Harp string " + (i + 1));
    b.addEventListener("click", () => pluck(i, true));
    wrap.appendChild(b); return b;
  });
  function pluck(i, user) {
    playNote(NOTES[i].f);
    strings[i].classList.add("pluck");
    setTimeout(() => strings[i].classList.remove("pluck"), 160);
    if (user && listening) checkStep(i);
  }
  function rand() { return Math.floor(Math.random() * NOTES.length); }
  function newTune() { seq = [rand()]; startRound(); }
  function startRound() {
    if (levelEl) levelEl.textContent = seq.length;
    if (fbEl) fbEl.textContent = "Listen to Buddy...";
    listening = false; step = 0;
    const gap = 480;
    seq.forEach((idx, k) => setTimeout(() => pluck(idx, false), gap * (k + 1)));
    setTimeout(() => { listening = true; if (fbEl) fbEl.textContent = "Your turn! Copy the tune."; }, gap * (seq.length + 1));
  }
  function checkStep(i) {
    if (i === seq[step]) {
      step++;
      if (step === seq.length) {
        if (typeof bbAddStars === "function") bbAddStars(2, "harp-len-" + seq.length);
        if (seq.length >= 5) {
          if (fbEl) fbEl.textContent = "Beautiful! David played his harp to bring peace to King Saul. (1 Samuel 16:23)";
          if (typeof bbCelebrate === "function") bbCelebrate();
          listening = false;
        } else {
          if (fbEl) fbEl.textContent = "Yes! Here comes a longer tune...";
          seq.push(rand()); listening = false; setTimeout(startRound, 950);
        }
      }
    } else {
      if (fbEl) fbEl.textContent = "Almost! Listen again...";
      listening = false; setTimeout(startRound, 950);
    }
  }
  playBtn && playBtn.addEventListener("click", newTune);
  freeBtn && freeBtn.addEventListener("click", () => { listening = false; if (fbEl) fbEl.textContent = "Free play! Pluck any string you like."; });
}

document.addEventListener("DOMContentLoaded", () => {
  initDavidSling();
  initDavidHarp();
});
