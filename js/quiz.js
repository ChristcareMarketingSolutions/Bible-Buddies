/* =====================================================================
   BIBLE BUDDIES — quiz.js
   Multiple-choice quiz. No public leaderboard (child-safe): the score
   is just the child's own "Bible Buddy Score".
   ===================================================================== */
function initQuiz() {
  const stage = document.querySelector("[data-quiz]");
  if (!stage) return;
  const qNumEl  = stage.querySelector("[data-q-num]");
  const qTextEl = stage.querySelector("[data-q-text]");
  const optsEl  = stage.querySelector("[data-q-options]");
  const fbEl    = stage.querySelector("[data-q-feedback]");
  const nextEl  = stage.querySelector("[data-q-next]");
  const fillEl  = stage.querySelector("[data-q-fill]");
  const resultEl= stage.querySelector("[data-q-result]");
  const panelEl = stage.querySelector("[data-q-panel]");

  let i = 0, score = 0, answered = false;

  function show() {
    const item = QUIZ[i];
    answered = false;
    qNumEl.textContent = `Question ${i + 1} of ${QUIZ.length}`;
    qTextEl.textContent = item.q;
    fbEl.textContent = "";
    nextEl.style.visibility = "hidden";
    fillEl.style.width = (i / QUIZ.length) * 100 + "%";
    optsEl.innerHTML = item.options.map((o, k) => `<button class="q-option" data-k="${k}">${o}</button>`).join("");
    optsEl.querySelectorAll(".q-option").forEach(b => b.addEventListener("click", () => choose(b, item.answer)));
  }
  function choose(btn, answer) {
    if (answered) return;
    answered = true;
    optsEl.querySelectorAll(".q-option").forEach(b => b.disabled = true);
    if (Number(btn.dataset.k) === answer) {
      btn.classList.add("correct"); score++;
      fbEl.textContent = "Correct! ⭐"; fbEl.style.color = "var(--meadow-deep)";
      bbCelebrate();
    } else {
      btn.classList.add("wrong");
      optsEl.querySelector(`[data-k="${answer}"]`).classList.add("correct");
      fbEl.textContent = "Good try!"; fbEl.style.color = "var(--coral-deep)";
    }
    nextEl.style.visibility = "visible";
    nextEl.textContent = (i === QUIZ.length - 1) ? "See my score" : "Next question";
  }
  function finish() {
    panelEl.style.display = "none";
    fillEl.style.width = "100%";
    resultEl.style.display = "block";
    resultEl.innerHTML = `
      <div class="center">
        <div style="font-size:3rem" class="pop-in">🌟</div>
        <h2>Your Bible Buddy Score</h2>
        <p style="font-size:1.4rem"><strong>${score} / ${QUIZ.length}</strong></p>
        <p>${score === QUIZ.length ? "Perfect! Amazing work! 🎉" : "Well done, keep exploring!"}</p>
        <button class="btn btn-primary btn-lg" data-q-again>Play again</button>
      </div>`;
    bbConfetti();
    bbAddStars(Math.max(1, Math.round(score / 2)), "quiz-run-" + Date.now() % 100000);
    resultEl.querySelector("[data-q-again]").addEventListener("click", () => {
      i = 0; score = 0; resultEl.style.display = "none"; panelEl.style.display = "block"; show();
    });
  }
  nextEl.addEventListener("click", () => {
    if (i === QUIZ.length - 1) finish();
    else { i++; show(); }
  });
  show();
}
document.addEventListener("DOMContentLoaded", initQuiz);
