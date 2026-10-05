/* Bible Buddies — offline support.
   Pages, CSS and JS are always checked with the server first (so visitors
   always get your latest update) and the saved copy is only used when
   offline. Images load instantly from the cache and refresh in the background.
   You no longer need to bump CACHE_VERSION on every update; only bump it if
   you rename or remove files in the ASSETS list below. */
const CACHE_VERSION = "bible-buddies-v11";
const ASSETS = [
  "index.html", "stories.html", "story.html", "comics.html", "games.html", "colouring.html",
  "explorer.html", "memory-verses.html", "meet-jesus.html", "teachers.html",
  "about.html", "contact.html", "404.html", "journey.html",
  "css/style.css", "js/data.js", "js/adventures.js", "js/app.js", "js/progress.js", "js/games.js", "js/quiz.js", "js/helper.js", "js/journey-stops.js", "js/journey.js", "js/vendor/three.min.js",
  "manifest.json", "favicon.ico", "images/logo.png", "images/favicon.svg", "images/favicon-32.png", "images/favicon-48.png", "images/apple-touch-icon.png", "images/icon-192.png", "images/icon-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE_VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});

function saveCopy(request, response) {
  if (response && response.ok && response.type === "basic") {
    const copy = response.clone();
    caches.open(CACHE_VERSION).then(c => c.put(request, copy));
  }
  return response;
}

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;

  // Pages: network first, then the saved copy, then the friendly 404 page.
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req, { cache: "no-cache" }).then(res => saveCopy(req, res))
        .catch(() => caches.match(req, { ignoreSearch: true })
          .then(hit => hit || (new URL(req.url).pathname.endsWith("/") ? caches.match("index.html") : null))
          .then(hit => hit || caches.match("404.html")))
    );
    return;
  }

  // CSS, JS and data: network first so they always match the page, saved copy when offline.
  if (["style", "script", "manifest"].includes(req.destination) || /\.(css|js|json)$/.test(new URL(req.url).pathname)) {
    e.respondWith(fetch(req, { cache: "no-cache" }).then(res => saveCopy(req, res)).catch(() => caches.match(req, { ignoreSearch: true })));
    return;
  }

  // Images and media: cached copy straight away, refreshed in the background.
  e.respondWith(
    caches.match(req).then(hit => {
      const fresh = fetch(req).then(res => saveCopy(req, res));
      if (hit) { fresh.catch(() => {}); return hit; }
      return fresh;
    })
  );
});
