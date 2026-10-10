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

  let phase, balloons, stones, bits, texts, fx, shake, released, popped, missed, spawnIn, combo, comboT, angle, power, aimV, dragging, dragged, clouds;
  function reset() {
    phase = "ready"; balloons = []; stones = []; bits = []; texts = []; fx = []; shake = 0;
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
    bits.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (p.g ?? 500) * dt; p.vx *= 1 - 1.2 * dt; p.rot += p.spin * dt; p.life -= dt; });
    fx.forEach(f => { f.t += dt; if (f.kind === "string") { f.y += f.vy * dt; f.vy += 420 * dt; f.rot += f.spin * dt; } });
    fx = fx.filter(f => f.t < f.dur);
    shake = Math.max(0, shake - dt * 2.5);
    bits = bits.filter(p => p.life > 0);
    texts.forEach(p => { p.y -= 40 * dt; p.life -= dt; });
    texts = texts.filter(p => p.life > 0);
    comboT -= dt; if (comboT <= 0) combo = 0;
    if (phase === "playing" && released >= TOTAL && balloons.length === 0) finish();
  }
  function pop(b, bx, k) {
    balloons.splice(k, 1); popped++; combo++; comboT = 1.3; hud();
    const R = b.r, big = b.giant ? 1.6 : 1;
    // 1. the balloon swells and flashes for a split second, then bursts
    fx.push({ kind: "swell", x: bx, y: b.y, r: R, c: b.color, t: 0, dur: 0.12 });
    // 2. shock rings
    fx.push({ kind: "ring", x: bx, y: b.y, r: R, c: "#fff", t: 0, dur: 0.45 });
    fx.push({ kind: "ring", x: bx, y: b.y, r: R * 0.6, c: b.color, t: -0.06, dur: 0.5 });
    // 3. rubber shreds in the balloon's colour, plus confetti and sparkles
    for (let i = 0; i < 12 * big; i++) { const a = Math.random() * 6.28, v = 120 + Math.random() * 200 * big; bits.push({ kind: "shred", x: bx + Math.cos(a) * R * 0.6, y: b.y + Math.sin(a) * R * 0.6, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80, g: 600, rot: a, spin: (Math.random() - 0.5) * 18, sz: 5 + Math.random() * 6, life: 0.7 + Math.random() * 0.4, max: 1.1, c: b.color }); }
    const CONF = ["#FFC93C", "#4CB4E7", "#FF7AA8", "#7ED957", "#B388FF", "#fff"];
    for (let i = 0; i < 16 * big; i++) { const a = Math.random() * 6.28, v = 60 + Math.random() * 220 * big; bits.push({ kind: "conf", x: bx, y: b.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 120, g: 260, rot: a, spin: (Math.random() - 0.5) * 14, sz: 3 + Math.random() * 3, life: 0.9 + Math.random() * 0.6, max: 1.5, c: CONF[i % CONF.length] }); }
    for (let i = 0; i < 6 * big; i++) { const a = Math.random() * 6.28, v = 40 + Math.random() * 90; bits.push({ kind: "star", x: bx, y: b.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, g: -30, rot: 0, spin: 3, sz: 5 + Math.random() * 5, life: 0.8 + Math.random() * 0.4, max: 1.2, c: "#FFD84D" }); }
    // 4. the string drops away, wriggling
    fx.push({ kind: "string", x: bx, y: b.y + R * 1.12, vy: -40, rot: 0, spin: (Math.random() - 0.5) * 4, t: 0, dur: 1.1 });
    // 5. the worry word floats up and fades away
    fx.push({ kind: "word", x: bx, y: b.y, text: b.word, giant: b.giant, t: 0, dur: 1 });
    if (b.giant) shake = 1;
    texts.push({ x: Math.min(W - 80, Math.max(80, bx)), y: Math.max(30, b.y - R - 6), text: b.giant ? "GIANT POP!" : combo > 1 ? `Combo ×${combo}!` : "Pop!", life: 0.9, c: b.giant ? "#E2A400" : combo > 1 ? "#F0A500" : "#41383B", big: b.giant || combo > 2 });
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
    ctx.save();
    if (shake > 0) ctx.translate((Math.random() - 0.5) * 10 * shake, (Math.random() - 0.5) * 10 * shake);
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
    // pop animation
    drawFx();
    texts.forEach(p => { const age = 0.9 - p.life, sc = age < 0.15 ? 0.6 + age / 0.15 * 0.6 : 1.2 - Math.min(0.2, (age - 0.15)); ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 0.5)); ctx.font = `700 ${Math.round((p.big ? 24 : 18) * sc)}px Fredoka, Nunito, sans-serif`; ctx.textAlign = "center"; ctx.lineWidth = 4; ctx.strokeStyle = "#fff"; ctx.strokeText(p.text, p.x, p.y); ctx.fillStyle = p.c; ctx.fillText(p.text, p.x, p.y); });
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
    ctx.restore();
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
  function drawFx() {
    fx.forEach(f => {
      if (f.t < 0) return;
      const k = f.t / f.dur;
      if (f.kind === "swell") {
        const r = f.r * (1 + k * 0.35);
        ctx.globalAlpha = 1; ctx.fillStyle = f.c; ctx.beginPath(); ctx.ellipse(f.x, f.y, r * 0.92, r * 1.08, 0, 0, 6.28); ctx.fill();
        ctx.globalAlpha = k; ctx.fillStyle = "#fff"; ctx.fill();
      } else if (f.kind === "ring") {
        const e = 1 - Math.pow(1 - k, 3);
        ctx.globalAlpha = 1 - k; ctx.strokeStyle = f.c; ctx.lineWidth = 6 * (1 - k) + 1;
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r * (0.8 + e * 1.4), 0, 6.28); ctx.stroke();
      } else if (f.kind === "string") {
        ctx.globalAlpha = 1 - k; ctx.strokeStyle = "#41383B"; ctx.lineWidth = 1.5;
        ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.rot); ctx.beginPath(); ctx.moveTo(0, 0);
        for (let j = 1; j <= 6; j++) ctx.lineTo(Math.sin(f.t * 14 + j) * 5, j * 7);
        ctx.stroke(); ctx.restore();
      } else if (f.kind === "word") {
        ctx.globalAlpha = Math.max(0, 1 - k * 1.2); ctx.font = `700 ${f.giant ? 17 : 13}px Fredoka, Nunito, sans-serif`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.save(); ctx.translate(f.x, f.y - k * 50); ctx.scale(1 + k * 0.5, 1 + k * 0.5);
        ctx.lineWidth = 3; ctx.strokeStyle = "rgba(65,56,59,.55)"; ctx.strokeText(f.text, 0, 0); ctx.fillStyle = "#fff"; ctx.fillText(f.text, 0, 0);
        ctx.restore(); ctx.textBaseline = "alphabetic";
      }
    });
    bits.forEach(p => {
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life / (p.max * 0.5))); ctx.fillStyle = p.c;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      if (p.kind === "shred") { ctx.strokeStyle = "rgba(65,56,59,.6)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-p.sz, 0); ctx.quadraticCurveTo(0, -p.sz, p.sz, 0); ctx.quadraticCurveTo(0, p.sz * 0.3, -p.sz, 0); ctx.fill(); ctx.stroke(); }
      else if (p.kind === "conf") { ctx.fillRect(-p.sz, -p.sz / 2, p.sz * 2, p.sz); }
      else if (p.kind === "star") { ctx.beginPath(); for (let j = 0; j < 8; j++) { const rr2 = j % 2 ? p.sz * 0.4 : p.sz, a = j * Math.PI / 4; ctx.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2); } ctx.closePath(); ctx.fill(); }
      else { ctx.beginPath(); ctx.arc(0, 0, 4, 0, 6.28); ctx.fill(); }
      ctx.restore();
    });
    ctx.globalAlpha = 1;
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
   A glowing harp drawn on a canvas. Tap a string, or sweep a finger
   across the strings to strum them (like a glissando). The strings are
   tuned to a pentatonic scale, so every sweep sounds sweet. Each note
   blows a little of King Saul's storm cloud away (1 Samuel 16:23).
   Plus: Buddy plays "Jesus Loves Me", and a copy-the-tune game.
   =================================================================== */
function initDavidHarp() {
  const canvas = document.querySelector("[data-harp-canvas]");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const levelEl = document.querySelector("[data-harp-level]");
  const calmEl  = document.querySelector("[data-harp-calm]");
  const fbEl    = document.querySelector("[data-harp-feedback]");
  const playBtn = document.querySelector("[data-harp-play]");
  const songBtn = document.querySelector("[data-harp-song]");
  const freeBtn = document.querySelector("[data-harp-free]");
  const W = 640, H = 400;
  const calmMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  // C major pentatonic, low (long string, left) to high (short string, right)
  const NOTES = [
    { f: 261.63, c: "#FF8A5B", n: "C" }, { f: 293.66, c: "#FFC93C", n: "D" },
    { f: 329.63, c: "#63C67A", n: "E" }, { f: 392.00, c: "#4CB4E7", n: "G" },
    { f: 440.00, c: "#7C5CBF", n: "A" }, { f: 523.25, c: "#F26430", n: "C" },
    { f: 587.33, c: "#F0A500", n: "D" }, { f: 659.25, c: "#3FA857", n: "E" }
  ];
  const X0 = 196, GAP = 36, BOTTOM = 318;
  const strings = NOTES.map((note, i) => {
    const x = X0 + i * GAP;
    return { ...note, x, top: 92 + i * 13, amp: 0, phase: 0, glow: 0, hint: 0, last: 0 };
  });

  /* ---------- sound: a plucked string (Karplus-Strong) with a soft echo ---------- */
  let audio, master, buffers = [];
  const voices = [];
  function ac() {
    if (audio) return audio;
    audio = new (window.AudioContext || window.webkitAudioContext)();
    master = audio.createGain(); master.gain.value = 0.55;
    const verb = audio.createConvolver(), wet = audio.createGain();
    const len = Math.floor(audio.sampleRate * 1.6), ir = audio.createBuffer(2, len, audio.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let n = 0; n < len; n++) d[n] = (Math.random() * 2 - 1) * Math.pow(1 - n / len, 3);
    }
    verb.buffer = ir; wet.gain.value = 0.22;
    master.connect(audio.destination);
    master.connect(verb).connect(wet).connect(audio.destination);
    return audio;
  }
  function stringSound(f) {
    const a = audio, sr = a.sampleRate, len = Math.floor(sr * 2.4);
    const buf = a.createBuffer(1, len, sr), out = buf.getChannelData(0);
    const period = Math.max(2, Math.round(sr / f)), ring = new Float32Array(period);
    let prev = 0;
    for (let k = 0; k < period; k++) { prev = 0.55 * prev + 0.45 * (Math.random() * 2 - 1); ring[k] = prev; }
    let idx = 0;
    for (let n = 0; n < len; n++) {
      const next = (idx + 1) % period;
      const v = ring[idx];
      ring[idx] = 0.4985 * (v + ring[next]);    // average + tiny loss = a ringing string
      out[n] = v * Math.min(1, n / 40);
      idx = next;
    }
    return buf;
  }
  function playNote(i, vol = 1) {
    const a = ac();
    if (a.state === "suspended") a.resume();
    if (!buffers[i]) buffers[i] = stringSound(NOTES[i].f);
    const src = a.createBufferSource(), g = a.createGain();
    src.buffer = buffers[i]; g.gain.value = 0.9 * vol;
    src.connect(g).connect(master); src.start();
    voices.push(src);
    src.onended = () => { const k = voices.indexOf(src); if (k >= 0) voices.splice(k, 1); };
    if (voices.length > 14) { try { voices.shift().stop(); } catch (e) {} }   // fast sweeps: drop the oldest voice
  }

  /* ---------- the story: Saul's storm cloud blows away as David plays ---------- */
  let calm = 0, calmDone = false;
  function addCalm(n) {
    if (calmDone) return;
    calm = Math.min(100, calm + n);
    if (calmEl) calmEl.textContent = Math.round(calm) + "%";
    if (calm >= 100) {
      calmDone = true;
      say("King Saul feels peaceful! David played his harp, and Saul felt better. (1 Samuel 16:23)");
      if (typeof bbAddStars === "function") bbAddStars(2, "harp-calm");
      if (typeof bbCelebrate === "function") bbCelebrate();
      [0, 2, 4, 5, 7].forEach((s, k) => setTimeout(() => pluck(s, false, 1), 120 * k));
    }
  }
  function say(t) { if (fbEl) fbEl.textContent = t; }

  /* ---------- light and music notes ---------- */
  const sparks = [], trail = [];
  function pluck(i, user, dir) {
    const s = strings[i], now = performance.now();
    if (user && now - s.last < 70) return;             // one pluck per string per sweep
    s.last = now;
    playNote(i, user ? 1 : 0.85);
    s.amp = 9; s.phase = 0; s.glow = 1; s.dir = dir || 1;
    const count = calmMotion ? 1 : 3;
    for (let k = 0; k < count; k++) {
      sparks.push({
        x: s.x + (Math.random() - 0.5) * 18, y: s.top + Math.random() * (BOTTOM - s.top) * 0.6,
        vx: (Math.random() - 0.5) * 30, vy: -40 - Math.random() * 40, life: 1, c: s.c,
        ch: k === 0 ? "♪♫♬"[Math.floor(Math.random() * 3)] : "✦", wob: Math.random() * 6
      });
    }
    if (user) { addCalm(1.6); if (listening) checkStep(i); }
  }

  /* ---------- touch / mouse: tap or sweep across strings ---------- */
  let down = false, last = null;
  function pos(e) {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height };
  }
  const onString = (s, y) => y > s.top - 14 && y < BOTTOM + 14;
  function nearest(p) {
    let best = -1, bd = GAP / 2;
    strings.forEach((s, i) => { const d = Math.abs(p.x - s.x); if (d < bd && onString(s, p.y)) { bd = d; best = i; } });
    return best;
  }
  function sweep(a, b) {
    const hits = [];
    strings.forEach((s, i) => {
      if ((a.x - s.x) * (b.x - s.x) >= 0 || a.x === b.x) return;   // did not cross this string
      const t = (s.x - a.x) / (b.x - a.x), y = a.y + (b.y - a.y) * t;
      if (onString(s, y)) hits.push({ i, t });
    });
    hits.sort((m, n) => m.t - n.t).forEach(h => pluck(h.i, true, Math.sign(b.x - a.x)));
  }
  canvas.addEventListener("pointerdown", e => {
    e.preventDefault();
    down = true; last = pos(e);
    try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
    const i = nearest(last);
    if (i >= 0) pluck(i, true, 1);
  });
  canvas.addEventListener("pointermove", e => {
    const p = pos(e);
    trail.push({ x: p.x, y: p.y, life: 1 });
    if (trail.length > 40) trail.shift();
    // drag to strum; a mouse may also strum just by gliding over the strings in free play
    if (last && (down || (e.pointerType === "mouse" && !listening && !buddyBusy))) sweep(last, p);
    last = p;
  });
  const lift = () => { down = false; };
  canvas.addEventListener("pointerup", lift);
  canvas.addEventListener("pointercancel", lift);
  canvas.addEventListener("pointerleave", () => { if (!down) last = null; });

  // keyboard: 1-8 or A S D F G H J K
  const KEYS = "asdfghjk";
  canvas.addEventListener("keydown", e => {
    let i = "12345678".indexOf(e.key);
    if (i < 0) i = KEYS.indexOf(e.key.toLowerCase());
    if (i >= 0) { e.preventDefault(); pluck(i, true, 1); }
  });

  /* ---------- Buddy plays: copy-the-tune game and a song ---------- */
  let seq = [], step = 0, listening = false, buddyBusy = false, timers = [];
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function stopBuddy() { timers.forEach(clearTimeout); timers = []; buddyBusy = false; }
  function buddyPlays(i) { strings[i].hint = 1; pluck(i, false, 1); }
  function rand() {
    let r; do { r = Math.floor(Math.random() * NOTES.length); } while (seq.length && r === seq[seq.length - 1]);
    return r;
  }
  function newTune() { stopBuddy(); seq = []; seq.push(rand()); startRound(); }
  function startRound() {
    if (levelEl) levelEl.textContent = seq.length;
    say("Listen to Buddy... watch which strings light up!");
    listening = false; step = 0; buddyBusy = true;
    const gap = 560;
    seq.forEach((idx, k) => later(() => buddyPlays(idx), gap * (k + 1)));
    later(() => { buddyBusy = false; listening = true; say("Your turn! Tap the same strings."); }, gap * (seq.length + 1));
  }
  function checkStep(i) {
    if (i === seq[step]) {
      step++;
      if (step === seq.length) {
        listening = false;
        if (typeof bbAddStars === "function") bbAddStars(2, "harp-len-" + seq.length);
        if (seq.length >= 5) {
          say("Beautiful! David played his harp to bring peace to King Saul. (1 Samuel 16:23)");
          if (typeof bbCelebrate === "function") bbCelebrate();
        } else {
          say("Yes! Here comes a longer tune...");
          seq.push(rand()); later(startRound, 950);
        }
      }
    } else {
      listening = false;
      say("Almost! Listen again...");
      later(startRound, 950);
    }
  }
  // "Jesus Loves Me" — every note is on David's harp: [string, beats]
  const SONG = [
    [3,1],[2,1],[2,1],[1,1],[2,1],[3,1],[3,2],
    [4,1],[4,1],[5,1],[4,1],[4,1],[3,1],[3,2],
    [3,1],[2,1],[2,1],[1,1],[2,1],[3,1],[3,2],
    [4,1],[4,1],[3,1],[0,1],[2,1],[1,1],[0,2]
  ];
  function playSong() {
    stopBuddy(); listening = false; buddyBusy = true;
    say("Buddy is playing \"Jesus Loves Me\" on David's harp. 🎶");
    let t = 300;
    SONG.forEach(([i, beats]) => { later(() => buddyPlays(i), t); t += beats * 380; });
    later(() => { buddyBusy = false; say("Now you try! Sweep your finger across the strings."); }, t + 300);
  }
  playBtn && playBtn.addEventListener("click", newTune);
  songBtn && songBtn.addEventListener("click", playSong);
  freeBtn && freeBtn.addEventListener("click", () => {
    stopBuddy(); listening = false;
    say("Free play! Tap a string, or sweep across them all.");
  });

  /* ---------- drawing ---------- */
  function fitCanvas() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  const mix = (a, b, t) => a.map((v, k) => Math.round(v + (b[k] - v) * t));
  const rgb = c => `rgb(${c[0]},${c[1]},${c[2]})`;
  const STARS = Array.from({ length: 34 }, () => ({ x: Math.random() * W, y: Math.random() * 190, r: Math.random() * 1.6 + 0.4, p: Math.random() * 6 }));

  function drawSky(t, k) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, rgb(mix([46, 40, 84], [255, 196, 120], k)));
    g.addColorStop(0.6, rgb(mix([92, 78, 130], [255, 230, 180], k)));
    g.addColorStop(1, rgb(mix([60, 52, 96], [214, 242, 201], k)));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // stars fade as the dawn comes
    ctx.fillStyle = "#fff";
    STARS.forEach(s => {
      ctx.globalAlpha = (1 - k) * (0.5 + 0.5 * Math.sin(t * 2 + s.p));
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill();
    });
    ctx.globalAlpha = 1;
    // sun rises behind the cloud
    const sy = 150 - 70 * k, sun = ctx.createRadialGradient(540, sy, 10, 540, sy, 110);
    sun.addColorStop(0, `rgba(255,236,150,${0.2 + 0.8 * k})`); sun.addColorStop(1, "rgba(255,236,150,0)");
    ctx.fillStyle = sun; ctx.fillRect(400, 0, 240, 300);
    ctx.fillStyle = `rgba(255,214,90,${k})`;
    ctx.beginPath(); ctx.arc(540, sy, 34, 0, 7); ctx.fill();
    // rainbow when Saul is at peace
    if (k > 0.85) {
      ctx.globalAlpha = (k - 0.85) / 0.15 * 0.5; ctx.lineWidth = 7;
      ["#FF8A5B", "#FFC93C", "#63C67A", "#4CB4E7", "#7C5CBF"].forEach((c, n) => {
        ctx.strokeStyle = c; ctx.beginPath(); ctx.arc(330, 420, 330 - n * 7, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
      });
      ctx.globalAlpha = 1;
    }
    // hills
    ctx.fillStyle = rgb(mix([52, 74, 70], [99, 198, 122], k));
    ctx.beginPath(); ctx.moveTo(0, H); ctx.quadraticCurveTo(160, 300, 330, 350); ctx.quadraticCurveTo(500, 395, 640, 320); ctx.lineTo(640, H); ctx.fill();
  }

  function drawStorm(t, k) {
    const a = 1 - k;
    if (a <= 0.02) return;
    const cx = 540 + k * 120, cy = 70 - k * 30;
    ctx.globalAlpha = a;
    // rain
    ctx.strokeStyle = "rgba(190,210,255,.7)"; ctx.lineWidth = 2;
    for (let n = 0; n < 9; n++) {
      const x = cx - 60 + n * 15, y = cy + 30 + ((t * 160 + n * 37) % 70);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 4, y + 10); ctx.stroke();
    }
    // the dark cloud
    ctx.fillStyle = rgb(mix([70, 66, 92], [235, 238, 245], k));
    [[-48, 8, 30], [-16, -8, 38], [22, 2, 32], [52, 12, 24], [0, 18, 36]].forEach(([dx, dy, r]) => {
      ctx.beginPath(); ctx.arc(cx + dx, cy + dy, r * (0.6 + 0.4 * a), 0, 7); ctx.fill();
    });
    // a flash of lightning now and then, while the cloud is still dark
    if (a > 0.5 && Math.sin(t * 1.3) > 0.985) {
      ctx.strokeStyle = "#FFE680"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(cx, cy + 30); ctx.lineTo(cx - 10, cy + 55); ctx.lineTo(cx + 4, cy + 58); ctx.lineTo(cx - 8, cy + 85); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawSaul(t, k) {
    // King Saul listens on his throne: his face changes as he feels better
    const x = 560, y = 300;
    ctx.fillStyle = "rgba(0,0,0,.18)";
    ctx.beginPath(); ctx.ellipse(x, y + 52, 46, 8, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "#8B4A2B"; ctx.fillRect(x - 34, y - 20, 68, 70);          // throne
    ctx.fillStyle = "#C97A22"; ctx.fillRect(x - 28, y - 14, 56, 60);
    ctx.font = "44px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const face = k < 0.34 ? "😣" : k < 0.67 ? "😐" : k < 1 ? "🙂" : "😊";
    ctx.fillText(face, x, y + 14 + (k >= 1 ? Math.sin(t * 4) * 2 : 0));
    ctx.font = "28px serif"; ctx.fillText("👑", x, y - 22);
    ctx.font = "700 13px Fredoka, sans-serif"; ctx.fillStyle = "#fff";
    ctx.fillText("King Saul", x, y + 66);
  }

  function drawHarp(t) {
    const left = X0 - 32, right = X0 + GAP * 7 + 32;
    // glowing aura behind the harp grows with each note
    const aura = ctx.createRadialGradient(330, 210, 20, 330, 210, 230);
    aura.addColorStop(0, `rgba(255,220,140,${0.15 + 0.25 * calm / 100})`); aura.addColorStop(1, "rgba(255,220,140,0)");
    ctx.fillStyle = aura; ctx.fillRect(80, 0, 500, H);
    // arms
    const wood = ctx.createLinearGradient(left, 0, right, 0);
    wood.addColorStop(0, "#E9A93F"); wood.addColorStop(0.5, "#FFD27A"); wood.addColorStop(1, "#C97A22");
    ctx.lineCap = "round"; ctx.strokeStyle = wood; ctx.lineWidth = 16;
    ctx.beginPath(); ctx.moveTo(left + 10, BOTTOM); ctx.bezierCurveTo(left - 30, 220, left - 10, 110, left + 6, 64); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(right - 10, BOTTOM); ctx.bezierCurveTo(right + 24, 240, right + 20, 190, right + 10, 160); ctx.stroke();
    // slanted crossbar: long strings on the left, short on the right
    ctx.lineWidth = 14;
    ctx.beginPath(); ctx.moveTo(left - 2, strings[0].top - 18); ctx.lineTo(right + 18, strings[7].top + 6); ctx.stroke();
    // tuning pegs
    ctx.fillStyle = "#8B4A2B";
    strings.forEach(s => { ctx.beginPath(); ctx.arc(s.x, s.top - 4, 4, 0, 7); ctx.fill(); });
    // strings
    strings.forEach(s => {
      const wiggle = s.amp * Math.sin(s.phase) * (s.dir || 1);
      const midY = (s.top + BOTTOM) / 2;
      if (s.glow > 0.02 || s.hint > 0.02) {
        ctx.save();
        ctx.shadowColor = s.c; ctx.shadowBlur = 24 * Math.max(s.glow, s.hint);
        ctx.strokeStyle = s.c; ctx.globalAlpha = Math.max(s.glow, s.hint); ctx.lineWidth = 9;
        ctx.beginPath(); ctx.moveTo(s.x, s.top); ctx.quadraticCurveTo(s.x + wiggle * 2, midY, s.x, BOTTOM); ctx.stroke();
        ctx.restore();
      }
      ctx.strokeStyle = s.c; ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.moveTo(s.x, s.top); ctx.quadraticCurveTo(s.x + wiggle * 2, midY, s.x, BOTTOM); ctx.stroke();
      // a little star shows the string Buddy just played
      if (s.hint > 0.05) {
        ctx.globalAlpha = s.hint; ctx.font = "22px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("⭐", s.x, s.top - 26 - 6 * s.hint); ctx.globalAlpha = 1;
      }
    });
    // sound box
    const box = ctx.createLinearGradient(0, BOTTOM - 6, 0, BOTTOM + 52);
    box.addColorStop(0, "#C97A22"); box.addColorStop(1, "#8B4A2B");
    ctx.fillStyle = box;
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(left - 14, BOTTOM - 6, right - left + 28, 54, 20) : ctx.rect(left - 14, BOTTOM - 6, right - left + 28, 54); ctx.fill();
    ctx.fillStyle = "#5c2f1a"; ctx.beginPath(); ctx.ellipse(330, BOTTOM + 22, 26, 12, 0, 0, 7); ctx.fill();
    // note letters on the box
    ctx.font = "700 12px Fredoka, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "#FFF6E5";
    strings.forEach((s, i) => ctx.fillText(i + 1, s.x, BOTTOM + 40));
  }

  function drawTrail() {
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    trail.forEach(p => {
      const near = strings.reduce((a, s) => Math.abs(s.x - p.x) < Math.abs(a.x - p.x) ? s : a, strings[0]);
      const r = 26 * p.life, g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      g.addColorStop(0, near.c + "88"); g.addColorStop(1, near.c + "00");
      ctx.fillStyle = g; ctx.fillRect(p.x - r, p.y - r, r * 2, r * 2);
    });
    ctx.restore();
  }

  function drawSparks() {
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    sparks.forEach(p => {
      ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.c;
      ctx.font = (p.ch === "✦" ? 14 : 24) + "px serif";
      ctx.fillText(p.ch, p.x + Math.sin(p.wob) * 6, p.y);
    });
    ctx.globalAlpha = 1;
  }

  let shown = 0, prevT = 0, visible = true, raf = 0;
  function frame(ms) {
    const t = ms / 1000, dt = Math.min(0.05, prevT ? t - prevT : 0.016);
    prevT = t;
    shown += (calm / 100 - shown) * Math.min(1, dt * 3);       // ease the sky towards the calm level
    strings.forEach(s => {
      s.phase += dt * 55; s.amp *= Math.pow(0.04, dt);
      s.glow *= Math.pow(0.08, dt); s.hint *= Math.pow(0.15, dt);
    });
    for (let k = sparks.length - 1; k >= 0; k--) {
      const p = sparks[k];
      p.x += p.vx * dt; p.y += p.vy * dt; p.wob += dt * 5; p.life -= dt * 0.7;
      if (p.life <= 0) sparks.splice(k, 1);
    }
    for (let k = trail.length - 1; k >= 0; k--) { trail[k].life -= dt * 3; if (trail[k].life <= 0) trail.splice(k, 1); }

    drawSky(t, shown); drawStorm(t, shown); drawSaul(t, shown);
    drawHarp(t); drawTrail(); drawSparks();
    raf = visible ? requestAnimationFrame(frame) : 0;
  }
  // pause the animation while the harp is scrolled off screen
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(es => {
      visible = es[0].isIntersecting;
      if (visible && !raf) { prevT = 0; raf = requestAnimationFrame(frame); }
    }).observe(canvas);
  }
  fitCanvas();
  addEventListener("resize", fitCanvas);
  raf = requestAnimationFrame(frame);
  canvas.__harp = { get state() { return { calm, calmDone, listening, buddyBusy, seq: seq.slice(), step }; }, pluck: i => pluck(i, true, 1), strings };
}

document.addEventListener("DOMContentLoaded", () => {
  initDavidSling();
  initDavidHarp();
});
