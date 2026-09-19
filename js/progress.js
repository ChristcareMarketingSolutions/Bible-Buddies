/* =====================================================================
   BIBLE BUDDIES — progress.js
   Stars & badges saved ONLY in the browser (localStorage).
   No accounts, no server, no personal information collected.
   ===================================================================== */

const BB_KEY = "bibleBuddies.progress.v1";

const BADGES = [
  { stars: 10,  name: "Bible Explorer",   emoji: "🌱" },
  { stars: 25,  name: "Bible Buddy",      emoji: "⭐" },
  { stars: 50,  name: "Bible Adventurer", emoji: "🏆" },
  { stars: 100, name: "Faith Explorer",   emoji: "🌟" }
];

function bbLoad() {
  try {
    return JSON.parse(localStorage.getItem(BB_KEY)) || { stars: 0, done: {} };
  } catch { return { stars: 0, done: {} }; }
}
function bbSave(state) {
  try { localStorage.setItem(BB_KEY, JSON.stringify(state)); } catch {}
}

/* Award stars. Pass a unique id (e.g. "quiz-jesus") to only reward once. */
function bbAddStars(amount, uniqueId) {
  const s = bbLoad();
  if (uniqueId) {
    if (s.done[uniqueId]) return s.stars;   // already rewarded
    s.done[uniqueId] = true;
  }
  s.stars += amount;
  bbSave(s);
  bbRenderCounter();
  bbCheckBadge(s.stars, s.stars - amount);
  return s.stars;
}

function bbStars() { return bbLoad().stars; }

function bbCurrentBadge(stars) {
  let earned = null;
  BADGES.forEach(b => { if (stars >= b.stars) earned = b; });
  return earned;
}

function bbCheckBadge(now, before) {
  const justEarned = BADGES.find(b => now >= b.stars && before < b.stars);
  if (justEarned && typeof bbToast === "function") {
    bbToast(`New badge! ${justEarned.emoji} ${justEarned.name}`);
    if (typeof bbConfetti === "function") bbConfetti();
  }
}

function bbRenderCounter() {
  document.querySelectorAll("[data-star-count]").forEach(el => {
    el.textContent = bbStars();
  });
}

function bbResetProgress() {
  if (confirm("Reset all your stars and badges? This can't be undone.")) {
    try { localStorage.removeItem(BB_KEY); } catch {}
    bbRenderCounter();
    if (typeof bbToast === "function") bbToast("Progress reset. Fresh start! 🐑");
    // refresh any reward displays on the page
    document.querySelectorAll("[data-reward-view]").forEach(bbRenderRewardView);
  }
}

function bbRenderRewardView(container) {
  const stars = bbStars();
  const badge = bbCurrentBadge(stars);
  container.innerHTML = `
    <div class="center">
      <div style="font-size:3rem">${badge ? badge.emoji : "🐑"}</div>
      <h3>${stars} Star${stars === 1 ? "" : "s"}</h3>
      <p>${badge ? "Your badge: <strong>" + badge.name + "</strong>" : "Earn 10 stars for your first badge!"}</p>
    </div>
    <div class="grid grid-4" style="margin-top:1rem">
      ${BADGES.map(b => `
        <div class="card center" style="opacity:${stars >= b.stars ? 1 : 0.45}">
          <div style="font-size:2.2rem">${b.emoji}</div>
          <strong>${b.name}</strong>
          <p style="margin:.3rem 0 0">${b.stars} stars</p>
        </div>`).join("")}
    </div>`;
}

document.addEventListener("DOMContentLoaded", () => {
  bbRenderCounter();
  document.querySelectorAll("[data-reward-view]").forEach(bbRenderRewardView);
  const resetBtn = document.querySelector("[data-reset-progress]");
  if (resetBtn) resetBtn.addEventListener("click", bbResetProgress);
});
