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

  let deck, first, lock, moves, matches, seconds, timer;

  function build() {
    clearInterval(timer);
    moves = 0; matches = 0; seconds = 0; first = null; lock = false;
    movesEl.textContent = "0"; matchEl.textContent = `0/${MEMORY_PAIRS.length}`; timeEl.textContent = "0s";
    // two cards per pair: the name, and the symbol
    deck = [];
    MEMORY_PAIRS.forEach((p, i) => {
      deck.push({ pair: i, face: p.a, kind: "name" });
      deck.push({ pair: i, face: p.b + "<br><small>" + p.label + "</small>", kind: "sym" });
    });
    deck = shuffle(deck);
    grid.innerHTML = deck.map((c, i) => `
      <button class="mem-card" data-i="${i}" data-pair="${c.pair}" aria-label="Hidden card">
        <span class="mem-inner">
          <span class="mem-face mem-front" aria-hidden="true"></span>
          <span class="mem-face mem-back">${c.face}</span>
        </span>
      </button>`).join("");
    grid.querySelectorAll(".mem-card").forEach(card => card.addEventListener("click", () => flip(card)));
    timer = setInterval(() => { seconds++; timeEl.textContent = seconds + "s"; }, 1000);
  }

  function flip(card) {
    if (lock || card.classList.contains("flipped") || card.classList.contains("matched")) return;
    card.classList.add("flipped");
    if (!first) { first = card; return; }
    moves++; movesEl.textContent = moves;
    if (first.dataset.pair === card.dataset.pair) {
      first.classList.add("matched"); card.classList.add("matched");
      first = null; matches++; matchEl.textContent = `${matches}/${MEMORY_PAIRS.length}`;
      if (matches === MEMORY_PAIRS.length) win();
    } else {
      lock = true;
      setTimeout(() => { first.classList.remove("flipped"); card.classList.remove("flipped"); first = null; lock = false; }, 800);
    }
  }

  function win() {
    clearInterval(timer);
    bbCelebrate();
    bbToast(`Great job! ⭐ ${moves} moves, ${seconds}s`);
    bbAddStars(5, "game-memory");   // rewarded once
  }

  restart && restart.addEventListener("click", build);
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
   Sling a stone to pop the floating "giant worry" balloons.
   Works with mouse, touch and keyboard (arrows to aim, space to shoot).
   =================================================================== */
function initDavidSling() {
  const canvas = document.querySelector("[data-sling-canvas]");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  const ground = H - 28;
  const anchor = { x: 95, y: 250 };
  const stoneR = 9;
  const K = 0.22, GRAV = 0.32, MAXV = 20;
  const DATA = [
    { x: 390, y: 120, word: "Fear",  color: "#FF8A5B" },
    { x: 480, y: 95,  word: "Doubt", color: "#7C5CBF" },
    { x: 560, y: 150, word: "Worry", color: "#4CB4E7" },
    { x: 440, y: 235, word: "Anger", color: "#E9973F" },
    { x: 545, y: 255, word: "Giant", color: "#63C67A" }
  ];
  const scoreEl = document.querySelector("[data-sling-score]");
  const totalEl = document.querySelector("[data-sling-total]");
  const fbEl    = document.querySelector("[data-sling-feedback]");
  const resetBtn= document.querySelector("[data-sling-reset]");

  let balloons, stone, flying, won, score, angle, power, aimVX, aimVY, running = false;

  function recomputeAim() {
    const r = angle * Math.PI / 180;
    aimVX = Math.cos(r) * power * 0.18;
    aimVY = -Math.sin(r) * power * 0.18;
  }
  function reset() {
    balloons = DATA.map(d => ({ x: d.x, y: d.y, r: 30, word: d.word, color: d.color, pop: false, bob: Math.random() * 6.28 }));
    stone = { x: anchor.x, y: anchor.y, vx: 0, vy: 0 };
    flying = false; won = false; score = 0; angle = 42; power = 62;
    recomputeAim();
    if (totalEl) totalEl.textContent = DATA.length;
    if (scoreEl) scoreEl.textContent = 0;
    if (fbEl) fbEl.textContent = "Pull the sling back and let go, or use the arrow keys and space.";
    if (!running) { running = true; loop(); }
  }
  function launch() {
    if (flying || won) return;
    stone.x = anchor.x; stone.y = anchor.y;
    stone.vx = Math.max(-MAXV, Math.min(MAXV, aimVX));
    stone.vy = Math.max(-MAXV, Math.min(MAXV, aimVY));
    flying = true;
  }
  function step() {
    balloons.forEach(b => { if (!b.pop) b.bob += 0.05; });
    if (flying) {
      stone.x += stone.vx; stone.y += stone.vy; stone.vy += GRAV;
      balloons.forEach(b => {
        if (b.pop) return;
        const by = b.y + Math.sin(b.bob) * 6;
        if (Math.hypot(stone.x - b.x, stone.y - by) < b.r + stoneR) {
          b.pop = true; score++;
          if (scoreEl) scoreEl.textContent = score;
          if (typeof bbAddStars === "function") bbAddStars(1, "sling-" + b.word);
          if (score === DATA.length) {
            won = true; flying = false;
            if (fbEl) fbEl.textContent = "David trusted God even when he faced something that seemed impossible. Well done!";
            if (typeof bbCelebrate === "function") bbCelebrate();
          }
        }
      });
      if (stone.y > ground || stone.x > W || stone.x < -20) {
        flying = false; stone.x = anchor.x; stone.y = anchor.y;
      }
    }
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    // ground
    ctx.fillStyle = "#63C67A"; ctx.fillRect(0, ground, W, H - ground);
    ctx.strokeStyle = "#41383B"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, ground); ctx.lineTo(W, ground); ctx.stroke();
    // David (simple cartoon)
    ctx.fillStyle = "#8a5a2b"; ctx.beginPath(); ctx.moveTo(anchor.x - 22, ground); ctx.lineTo(anchor.x, ground - 52); ctx.lineTo(anchor.x + 22, ground); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#f2c48a"; ctx.beginPath(); ctx.arc(anchor.x, ground - 62, 13, 0, 6.28); ctx.fill(); ctx.stroke();
    // sling band + stone at rest
    if (!flying) {
      ctx.strokeStyle = "#8a5a2b"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(anchor.x - 14, ground - 60); ctx.lineTo(anchor.x, anchor.y); ctx.lineTo(anchor.x + 14, ground - 60); ctx.stroke();
      // trajectory preview
      ctx.fillStyle = "rgba(65,56,59,.5)";
      let px = anchor.x, py = anchor.y, vx = aimVX, vy = aimVY;
      for (let t = 0; t < 30; t++) { px += vx; py += vy; vy += GRAV; if (t % 3 === 0) { ctx.beginPath(); ctx.arc(px, py, 2.5, 0, 6.28); ctx.fill(); } }
    }
    // balloons
    balloons.forEach(b => {
      if (b.pop) return;
      const by = b.y + Math.sin(b.bob) * 6;
      ctx.fillStyle = b.color; ctx.strokeStyle = "#41383B"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(b.x, by, b.r, 0, 6.28); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(b.x, by + b.r); ctx.lineTo(b.x, by + b.r + 14); ctx.stroke();
      ctx.fillStyle = "#fff"; ctx.font = "bold 13px Nunito, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(b.word, b.x, by);
    });
    // stone
    ctx.fillStyle = "#6E6266"; ctx.strokeStyle = "#41383B"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(stone.x, stone.y, stoneR, 0, 6.28); ctx.fill(); ctx.stroke();
  }
  function loop() { step(); draw(); requestAnimationFrame(loop); }

  // pointer aiming (mouse + touch)
  function toCanvas(e) {
    const r = canvas.getBoundingClientRect();
    const cx = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    const cy = (e.touches ? e.touches[0].clientY : e.clientY) - r.top;
    return { x: cx * (W / r.width), y: cy * (H / r.height) };
  }
  let dragging = false;
  function onDown(e) { if (won) return; dragging = true; onMove(e); }
  function onMove(e) {
    if (!dragging || flying) return;
    const p = toCanvas(e);
    aimVX = (anchor.x - p.x) * K; aimVY = (anchor.y - p.y) * K;
    const sp = Math.hypot(aimVX, aimVY); if (sp > MAXV) { aimVX *= MAXV / sp; aimVY *= MAXV / sp; }
    e.preventDefault();
  }
  function onUp() { if (dragging && !flying) launch(); dragging = false; }
  canvas.addEventListener("mousedown", onDown); canvas.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);
  canvas.addEventListener("touchstart", onDown, { passive: false });
  canvas.addEventListener("touchmove", onMove, { passive: false });
  window.addEventListener("touchend", onUp);
  // keyboard aiming
  canvas.addEventListener("keydown", e => {
    if (e.key === "ArrowUp") { angle = Math.min(85, angle + 3); recomputeAim(); e.preventDefault(); }
    else if (e.key === "ArrowDown") { angle = Math.max(5, angle - 3); recomputeAim(); e.preventDefault(); }
    else if (e.key === "ArrowRight") { power = Math.min(100, power + 4); recomputeAim(); e.preventDefault(); }
    else if (e.key === "ArrowLeft") { power = Math.max(20, power - 4); recomputeAim(); e.preventDefault(); }
    else if (e.key === " " || e.key === "Enter") { launch(); e.preventDefault(); }
  });
  resetBtn && resetBtn.addEventListener("click", reset);
  reset();
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
