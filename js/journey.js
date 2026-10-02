/* =====================================================================
   BIBLE BUDDIES — journey.js
   "Journey with Jesus": a first-person, Street-View-style walk through a
   cartoon Bible-lands world (built with three.js, js/vendor/three.min.js).

   TO ADD A STOP: add an entry to JOURNEY_STOPS below (text + Bible refs),
   add a road point near where it should be in ROAD_POINTS, and build its
   scene in buildStopScenes(). Stops are visited in the order listed.
   ===================================================================== */

/* ---------- THE STOPS (story text follows the Bible; quotes are from the
   World English Bible, which is public domain) ---------- */
const JOURNEY_STOPS = [
  {
    id: "bethlehem", place: "Bethlehem", emoji: "⭐",
    title: "Jesus is born", ref: "Luke 2:1–20",
    road: [3, 152],                       // road spot where we stop (x, z)
    paragraphs: [
      "The ruler Caesar Augustus ordered everyone to be counted in their family's home town. So Joseph travelled from Nazareth to Bethlehem, the town of King David, with Mary. (Luke 2:1–5)",
      "While they were there, Mary's baby was born. She wrapped Him in strips of cloth and laid Him in a manger, an animal feeding box, because there was no room for them in the inn. (Luke 2:6–7)",
      "That night an angel of the Lord appeared to shepherds watching their sheep in the fields nearby and told them the good news. The shepherds hurried to Bethlehem and found Mary, Joseph and the baby lying in the manger. (Luke 2:8–16)"
    ],
    verse: { text: "For there is born to you today, in David's city, a Savior, who is Christ the Lord.", ref: "Luke 2:11" }
  },
  {
    id: "jordan", place: "Jordan River", emoji: "🕊️",
    title: "Jesus is baptised", ref: "Matthew 3:13–17",
    road: [68, 60],
    paragraphs: [
      "John the Baptist preached in the wilderness and baptised people in the Jordan River, telling them to turn away from their sins and get ready for the Lord. (Matthew 3:1–6)",
      "Jesus came from Galilee to the Jordan to be baptised by John. John said, \"I need to be baptised by You!\" But Jesus asked him to do it, because it was right. (Matthew 3:13–15)",
      "As soon as Jesus came up out of the water, the heavens were opened. The Spirit of God came down like a dove and rested on Him, and a voice from heaven spoke. (Matthew 3:16–17)"
    ],
    verse: { text: "This is my beloved Son, with whom I am well pleased.", ref: "Matthew 3:17" }
  },
  {
    id: "mountain", place: "The Mountain", emoji: "⛰️",
    title: "Jesus teaches on the mountain", ref: "Matthew 5–7",
    road: [-20, -88],
    paragraphs: [
      "Large crowds followed Jesus. When He saw them, He went up on a mountain and sat down. His disciples came to Him, and He began to teach them. (Matthew 5:1–2)",
      "Jesus taught that God blesses the humble, the kind and the peacemakers, and that His followers are the light of the world. (Matthew 5:3–16)",
      "He taught them how to pray, told them not to worry because God feeds the birds and clothes the lilies of the field, and said that whoever hears His words and does them is like a wise man who built his house on the rock. (Matthew 6:9–13, 6:25–34, 7:24–25)"
    ],
    verse: { text: "Let your light shine before men, that they may see your good works, and glorify your Father who is in heaven.", ref: "Matthew 5:16" }
  },
  {
    id: "bethany", place: "Martha's House, Bethany", emoji: "🏠",
    title: "Jesus visits Martha and Mary", ref: "Luke 10:38–42",
    road: [-58, -182],
    paragraphs: [
      "As Jesus travelled with His disciples, He came to a village where a woman named Martha welcomed Him into her home. John's Gospel tells us this village was Bethany. (Luke 10:38, John 11:1)",
      "Martha's sister Mary sat at Jesus' feet, listening to His teaching. But Martha was busy and worried about all the work of getting things ready. (Luke 10:39–40)",
      "Martha asked Jesus to tell Mary to help her. Jesus answered kindly that Martha was worried about many things, but only one thing is needed, and Mary had chosen the good part: listening to Him. (Luke 10:40–42)"
    ],
    verse: { text: "Martha, Martha, you are anxious and troubled about many things, but one thing is needed. Mary has chosen the good part, which will not be taken away from her.", ref: "Luke 10:41–42" }
  }
];

/* The road we walk along, from start to finish (x, z). Height comes from the land. */
const ROAD_POINTS = [
  [0, 232], [2, 200], [0, 160], [14, 128], [40, 100], [60, 74], [68, 60], [62, 40],
  [44, 10], [22, -25], [14, -50], [10, -74], [-6, -90], [-20, -88], [-30, -118],
  [-40, -140], [-50, -162], [-58, -182], [-60, -206]
];

const WALK = {
  eye: 1.7,          // eye height above the road
  speed: 13,         // walking speed (world units per second)
  bob: 0.06,         // head bob while walking
  roadWidth: 3.4
};

(function () {
  const stage = document.querySelector("[data-journey]");
  if (!stage) return;
  const canvasWrap = stage.querySelector("[data-jw-canvas]");
  const $ = sel => stage.querySelector(sel);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- WebGL check: fall back to a simple list ---------- */
  function webglOK() {
    try { const c = document.createElement("canvas"); return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl"))); }
    catch (e) { return false; }
  }
  if (typeof THREE === "undefined" || !webglOK()) { showFallback(); return; }

  /* ---------- seeded random so the world looks the same every visit ---------- */
  let seed = 20240917;
  function rand() { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
  const rr = (a, b) => a + rand() * (b - a);
  const smooth = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };

  /* ---------- THE LAND (one height function used by ground, road and objects) ---------- */
  const riverX = z => 80 + 6 * Math.sin(z / 35);
  const MOUNT = { x: -32, z: -96, h: 22 };
  function height(x, z) {
    const dr = Math.abs(x - riverX(z));
    const calm = smooth(10, 30, dr);                               // flatter river banks
    let y = (1.1 * Math.sin(x / 23) * Math.cos(z / 31) + 0.7 * Math.sin((x + z) / 17) + 0.4 * Math.cos(x / 9 - z / 13)) * calm;
    const dm = Math.hypot(x - MOUNT.x, z - MOUNT.z);
    y += MOUNT.h * smooth(85, 18, dm);                             // the mountain (flat top)
    y += 38 * smooth(235, 310, Math.hypot(x, z));                  // hills around the edge of the world
    y -= 3.2 * (1 - smooth(5, 13, dr));                            // river channel
    return y;
  }

  /* ---------- three.js setup ---------- */
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  canvasWrap.appendChild(renderer.domElement);
  renderer.domElement.setAttribute("aria-hidden", "true");

  const scene = new THREE.Scene();
  const SKY_TOP = "#5DBDF2", SKY_HORIZON = "#DDF2FF";
  scene.background = skyTexture();
  scene.fog = new THREE.Fog(SKY_HORIZON, 70, 330);
  const camera = new THREE.PerspectiveCamera(62, 1, 0.1, 900);

  scene.add(new THREE.HemisphereLight(0xFFFFFF, 0x9C8A5A, 1.9));
  const sun = new THREE.DirectionalLight(0xFFF3D6, 2.4);
  sun.position.set(-120, 200, 80);
  scene.add(sun);

  function skyTexture() {
    const c = document.createElement("canvas"); c.width = 4; c.height = 256;
    const g = c.getContext("2d"), grd = g.createLinearGradient(0, 0, 0, 256);
    grd.addColorStop(0, SKY_TOP); grd.addColorStop(0.65, SKY_HORIZON); grd.addColorStop(1, SKY_HORIZON);
    g.fillStyle = grd; g.fillRect(0, 0, 4, 256);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  function glowTexture(inner, outer) {
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const g = c.getContext("2d"), grd = g.createRadialGradient(64, 64, 4, 64, 64, 64);
    grd.addColorStop(0, inner); grd.addColorStop(1, outer);
    g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }

  /* ---------- BATCH: bake lots of small static shapes into one mesh (fast on phones) ---------- */
  const batch = { pos: [], nor: [], col: [] };
  const tmpColor = new THREE.Color();
  function bake(obj) {
    obj.updateMatrixWorld(true);
    obj.traverse(m => {
      if (!m.isMesh) return;
      let g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone();
      g.applyMatrix4(m.matrixWorld);
      const p = g.attributes.position.array, n = g.attributes.normal.array;
      tmpColor.copy(m.material.color);
      for (let i = 0; i < p.length; i += 3) {
        batch.pos.push(p[i], p[i + 1], p[i + 2]);
        batch.nor.push(n[i], n[i + 1], n[i + 2]);
        batch.col.push(tmpColor.r, tmpColor.g, tmpColor.b);
      }
      g.dispose();
    });
  }
  function finishBatch() {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(batch.pos, 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute(batch.nor, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(batch.col, 3));
    scene.add(new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true })));
  }

  /* shared shapes + a tiny material cache */
  const G = {
    box: new THREE.BoxGeometry(1, 1, 1),
    cyl: new THREE.CylinderGeometry(0.5, 0.5, 1, 8),
    cone: new THREE.ConeGeometry(0.5, 1, 8),
    ball: new THREE.IcosahedronGeometry(0.5, 1),
    blob: new THREE.DodecahedronGeometry(0.5, 0),
    sphere: new THREE.SphereGeometry(0.5, 9, 7),
    bud: new THREE.IcosahedronGeometry(0.5, 0),
    trunk: new THREE.CylinderGeometry(0.5, 0.5, 1, 6),
    leaf: new THREE.ConeGeometry(0.5, 1, 5)
  };
  const mats = {};
  const mat = hex => mats[hex] || (mats[hex] = new THREE.MeshLambertMaterial({ color: hex, flatShading: true }));
  function part(geo, color, x, y, z, sx, sy, sz, rx = 0, ry = 0, rz = 0) {
    const m = new THREE.Mesh(geo, mat(color));
    m.position.set(x, y, z); m.scale.set(sx, sy, sz); m.rotation.set(rx, ry, rz);
    return m;
  }
  function placeAt(obj, x, z, rotY = 0, lift = 0) { obj.position.set(x, height(x, z) + lift, z); obj.rotation.y = rotY; return obj; }
  const faceTo = (fromX, fromZ, toX, toZ) => Math.atan2(toX - fromX, toZ - fromZ);  // +z of an object faces the target

  /* ---------- THE ROAD (path the camera follows) ---------- */
  const curve = new THREE.CatmullRomCurve3(ROAD_POINTS.map(([x, z]) => new THREE.Vector3(x, height(x, z), z)), false, "catmullrom", 0.5);
  const ROAD_LEN = curve.getLength();
  const roadSamples = curve.getSpacedPoints(500);
  function nearRoad(x, z, clear) {
    for (const p of roadSamples) if ((p.x - x) ** 2 + (p.z - z) ** 2 < clear * clear) return true;
    return false;
  }
  function roadU(x, z) {                       // where along the road (0..1) is closest to (x, z)
    let best = 0, bd = Infinity;
    roadSamples.forEach((p, i) => { const d = (p.x - x) ** 2 + (p.z - z) ** 2; if (d < bd) { bd = d; best = i; } });
    return best / (roadSamples.length - 1);
  }

  /* areas kept clear for the stop scenes */
  const SCENE_AREAS = [[11, 151, 8], [-24, 134, 12], [84, 58, 9], [101, 58, 12], [-38, -100, 14], [-71, -190, 12]];
  function nearStopScene(x, z) { return SCENE_AREAS.some(([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 < r * r); }


  function buildGround() {
    const SIZE = 640, SEG = 160;
    const g = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position, colors = [];
    const grass = new THREE.Color("#7CCB5E"), dry = new THREE.Color("#C9C27A"), sand = new THREE.Color("#E3CF94"),
          high = new THREE.Color("#96C46A"), mud = new THREE.Color("#B9A77A"), c = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), y = height(x, z);
      p.setY(i, y);
      const dr = Math.abs(x - riverX(z));
      const n = 0.5 + 0.5 * Math.sin(x / 19 + Math.cos(z / 23) * 2) * Math.cos(z / 27);
      c.copy(grass).lerp(dry, n * 0.75);
      if (y > 12) c.lerp(high, 0.6);
      if (Math.hypot(x, z) > 240) c.lerp(sand, smooth(240, 300, Math.hypot(x, z)) * 0.8);
      if (dr < 13) c.copy(mud).lerp(grass, smooth(6, 13, dr));
      colors.push(c.r, c.g, c.b);
    }
    g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    g.computeVertexNormals();
    scene.add(new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true })));
  }

  function buildRoad() {
    const N = 700, across = [-1, -0.8, 0, 0.8, 1], pos = [], col = [], idx = [];
    const edge = new THREE.Color("#C9A86A"), mid = new THREE.Color("#EBD3A0"), c = new THREE.Color();
    for (let i = 0; i <= N; i++) {
      const u = i / N, p = curve.getPointAt(u), t = curve.getTangentAt(u);
      const side = new THREE.Vector3(t.z, 0, -t.x).normalize();
      across.forEach(a => {
        const x = p.x + side.x * a * WALK.roadWidth / 2, z = p.z + side.z * a * WALK.roadWidth / 2;
        pos.push(x, height(x, z) + 0.22, z);
        c.copy(Math.abs(a) === 1 ? edge : mid).offsetHSL(0, 0, (rand() - 0.5) * 0.04);
        col.push(c.r, c.g, c.b);
      });
    }
    const W = across.length;
    for (let i = 0; i < N; i++) for (let k = 0; k < W - 1; k++) {
      const a = i * W + k, b = a + 1, d = a + W, e = d + 1;
      idx.push(a, d, b, b, d, e);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.MeshLambertMaterial({ vertexColors: true, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    scene.add(new THREE.Mesh(g, m));
    // pebbles along the edges
    for (let i = 0; i < 260; i++) {
      const u = rand(), p = curve.getPointAt(u), t = curve.getTangentAt(u);
      const s = rand() < 0.5 ? -1 : 1, off = WALK.roadWidth / 2 + rr(0.2, 1.4);
      const x = p.x + t.z * s * off, z = p.z - t.x * s * off, r = rr(0.15, 0.32);
      bake(part(G.blob, ["#A9A196", "#BDB5A8", "#8F887E"][i % 3], x, height(x, z) + r * 0.3, z, r, r * 0.7, r, rand() * 3, rand() * 3, 0));
    }
  }

  function buildRiver() {
    const N = 160, pos = [], idx = [];
    for (let i = 0; i <= N; i++) {
      const z = -300 + 600 * i / N, cx = riverX(z);
      pos.push(cx - 11, -0.9, z, cx + 11, -0.9, z);
      if (i < N) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, new THREE.MeshPhongMaterial({ color: 0x46B3E6, shininess: 80, transparent: true, opacity: 0.88, flatShading: true }));
    scene.add(m);
    // reeds and rocks along the banks
    for (let i = 0; i < 160; i++) {
      const z = rr(-240, 240), s = rand() < 0.5 ? -1 : 1, x = riverX(z) + s * rr(7, 11);
      if (nearRoad(x, z, 3) || nearStopScene(x, z)) continue;
      if (i % 4 === 0) bake(part(G.blob, "#9C958A", x, height(x, z) + 0.2, z, rr(0.6, 1.4), rr(0.5, 0.9), rr(0.6, 1.4), rand(), rand(), 0));
      else for (let k = 0; k < 4; k++) bake(part(G.cone, k % 2 ? "#5FA845" : "#7DBF4E", x + rr(-0.6, 0.6), height(x, z) + 0.9, z + rr(-0.6, 0.6), 0.18, rr(1.4, 2.4), 0.18, rr(-0.15, 0.15), 0, rr(-0.15, 0.15)));
    }
    return { geo: g };
  }

  /* ---------- trees, bushes, flowers, huts ---------- */
  function palm(x, z, s = 1) {
    const g = new THREE.Group(); let px = 0, py = 0;
    const lean = rr(-0.25, 0.25), dir = rand() * 6.28;
    for (let i = 0; i < 4; i++) {
      g.add(part(G.trunk, i % 2 ? "#9B6B3C" : "#8A5C30", px, py + 0.8, 0, 0.42 - i * 0.04, 1.65, 0.42 - i * 0.04));
      py += 1.55; px += lean * 0.37;
    }
    for (let i = 0; i < 7; i++) {
      const a = i / 7 * Math.PI * 2;
      const leaf = part(G.leaf, i % 2 ? "#3FA34D" : "#57B95A", px + Math.sin(a) * 1.4, py + 0.1, Math.cos(a) * 1.4, 0.5, 3.2, 0.18, 0, 0, 0);
      leaf.rotation.set(Math.cos(a) * 1.9, 0, -Math.sin(a) * 1.9, "YXZ");
      g.add(leaf);
    }
    g.add(part(G.blob, "#7A4E2A", px, py - 0.1, 0, 0.7, 0.6, 0.7));
    g.scale.setScalar(s); g.rotation.y = dir;
    bake(placeAt(g, x, z, dir));
  }
  function olive(x, z, s = 1) {
    const g = new THREE.Group();
    g.add(part(G.cyl, "#7B6046", 0, 0.9, 0, 0.45, 1.8, 0.45, 0, 0, 0.12));
    const greens = ["#7FA35A", "#8DB066", "#6E9450"];
    for (let i = 0; i < 4; i++) g.add(part(G.blob, greens[i % 3], rr(-1, 1), rr(2.3, 3.1), rr(-1, 1), rr(1.8, 2.6), rr(1.4, 2), rr(1.8, 2.6), rand(), rand(), 0));
    g.scale.setScalar(s); bake(placeAt(g, x, z, rand() * 6));
  }
  function cypress(x, z, s = 1) {
    const g = new THREE.Group();
    g.add(part(G.cyl, "#6B4A2E", 0, 0.5, 0, 0.35, 1, 0.35));
    g.add(part(G.cone, "#2F8A4A", 0, 3.6, 0, 1.8, 6.4, 1.8));
    g.scale.setScalar(s); bake(placeAt(g, x, z));
  }
  function bush(x, z, s = 1) {
    bake(placeAt(part(G.ball, ["#5DAA4C", "#6CB956", "#4F9A45"][Math.floor(rand() * 3)], 0, 0.5 * s, 0, 1.6 * s, 1.1 * s, 1.6 * s), x, z, rand() * 6));
  }
  function flower(x, z) {
    const colors = ["#FF6F91", "#FFC93C", "#FFFFFF", "#B57CFF", "#FF8A5B"];
    bake(placeAt(part(G.bud, colors[Math.floor(rand() * colors.length)], 0, 0.25, 0, 0.34, 0.3, 0.34), x, z));
  }
  function hut(x, z, rotY, w = 4, d = 4, h = 3, color = "#E4C595") {
    const g = new THREE.Group(), roof = "#D4B07A";
    g.add(part(G.box, color, 0, h / 2, 0, w, h, d));
    g.add(part(G.box, roof, 0, h + 0.15, 0, w + 0.5, 0.3, d + 0.5));
    g.add(part(G.box, color, 0, h + 0.45, d / 2, w + 0.5, 0.4, 0.2));       // little parapet
    g.add(part(G.box, "#6B4426", 0, 0.95, d / 2 + 0.02, 0.9, 1.9, 0.1));    // door
    g.add(part(G.box, "#4A3A2E", w / 4 + 0.3, h * 0.62, d / 2 + 0.02, 0.6, 0.6, 0.1));
    g.add(part(G.box, "#4A3A2E", -w / 4 - 0.3, h * 0.62, d / 2 + 0.02, 0.6, 0.6, 0.1));
    if (rand() < 0.4) g.add(part(G.cyl, "#B5835A", w / 2 + 0.35, 0.5, rr(-d / 3, d / 3), 0.7, 1, 0.7)); // clay jar
    bake(placeAt(g, x, z, rotY));
  }
  function rock(x, z, s = 1) { bake(placeAt(part(G.blob, "#A49C90", 0, 0.4 * s, 0, 1.6 * s, 1.1 * s, 1.4 * s, rand(), rand(), 0), x, z)); }

  function buildScenery() {
    // trees and bushes lining the road (what you see while walking)
    for (let i = 0; i < 220; i++) {
      const u = rand(), p = curve.getPointAt(u), t = curve.getTangentAt(u);
      const s = rand() < 0.5 ? -1 : 1, off = rr(5.5, 26);
      const x = p.x + t.z * s * off, z = p.z - t.x * s * off;
      if (nearRoad(x, z, 5) || Math.abs(x - riverX(z)) < 12 || nearStopScene(x, z)) continue;
      const k = rand();
      if (k < 0.3) palm(x, z, rr(0.8, 1.15)); else if (k < 0.55) olive(x, z, rr(0.8, 1.2));
      else if (k < 0.68) cypress(x, z, rr(0.8, 1.2)); else if (k < 0.9) bush(x, z, rr(0.7, 1.3)); else rock(x, z, rr(0.6, 1.4));
    }
    // further away
    for (let i = 0; i < 210; i++) {
      const a = rand() * Math.PI * 2, r = rr(20, 230), x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (nearRoad(x, z, 8) || Math.abs(x - riverX(z)) < 12 || nearStopScene(x, z)) continue;
      const k = rand();
      if (k < 0.35) olive(x, z, rr(0.9, 1.4)); else if (k < 0.55) cypress(x, z, rr(0.9, 1.4)); else if (k < 0.75) palm(x, z); else bush(x, z, rr(1, 1.8));
    }
    // palms along the river
    for (let i = 0; i < 40; i++) { const z = rr(-230, 230), x = riverX(z) + (rand() < 0.5 ? -1 : 1) * rr(13, 20); if (!nearRoad(x, z, 6) && !nearStopScene(x, z)) palm(x, z, rr(0.9, 1.25)); }
    // flowers
    for (let i = 0; i < 420; i++) {
      const u = rand(), p = curve.getPointAt(u), t = curve.getTangentAt(u), s = rand() < 0.5 ? -1 : 1, off = rr(2.4, 12);
      const x = p.x + t.z * s * off, z = p.z - t.x * s * off;
      if (!nearRoad(x, z, 2.2) && Math.abs(x - riverX(z)) > 12) flower(x, z);
    }
  }

  /* ---------- PEOPLE (simple, friendly cartoon figures) ---------- */
  const SKIN = ["#C68B59", "#B47A4B", "#D49A6A", "#A86F45"];
  const HOOD = new THREE.SphereGeometry(0.5, 9, 5, 0, Math.PI * 2, 0, Math.PI * 0.55);
  const HAIR = new THREE.SphereGeometry(0.5, 9, 5, 0, Math.PI * 2, 0, Math.PI * 0.5);
  const ROBE = new THREE.CylinderGeometry(0.29, 0.44, 1, 9);
  function person(o) {
    const s = o.size || 1, g = new THREE.Group(), skin = o.skin || SKIN[Math.floor(rand() * SKIN.length)];
    const seated = !!o.seated, robeH = seated ? 0.62 : 1.12, base = seated ? 0.32 : 0;
    if (seated) g.add(part(G.box, o.robe, 0, 0.2, 0.25, 0.7, 0.4, 0.9));           // lap and legs
    g.add(part(ROBE, o.robe, 0, base + robeH / 2, 0, 1, robeH, 1));
    if (o.sash) g.add(part(G.cyl, o.sash, 0, base + robeH * 0.62, 0, 0.66, 0.1, 0.66));
    if (o.apron) g.add(part(G.box, o.apron, 0, base + robeH * 0.45, 0.25, 0.45, robeH * 0.7, 0.06));
    if (o.mantle) g.add(part(G.box, o.mantle, 0.08, base + robeH * 0.72, 0, 0.66, robeH * 0.5, 0.62, 0, 0, -0.35));
    const neck = base + robeH;
    g.add(part(G.sphere, skin, 0, neck + 0.2, 0, 0.44, 0.46, 0.44));                 // head
    g.add(part(G.bud, "#2A2422", -0.08, neck + 0.24, 0.2, 0.05, 0.06, 0.04));        // eyes
    g.add(part(G.bud, "#2A2422", 0.08, neck + 0.24, 0.2, 0.05, 0.06, 0.04));
    if (o.hood) g.add(part(HOOD, o.hood, 0, neck + 0.22, -0.04, 0.54, 0.6, 0.56, -0.35, 0, 0));
    if (o.hair) g.add(part(HAIR, o.hair, 0, neck + 0.24, -0.03, 0.48, 0.5, 0.48, -0.3, 0, 0));
    if (o.beard) g.add(part(G.sphere, o.beard, 0, neck + 0.06, 0.12, 0.3, 0.26, 0.24));
    const armY = neck - 0.18, raise = o.armsUp ? -2.3 : (o.armsOut ? -0.9 : -0.25);
    [-1, 1].forEach(side => {
      const arm = part(G.cyl, o.sleeve || o.robe, side * 0.33, armY - 0.22, 0.05, 0.16, 0.55, 0.16, raise, 0, side * 0.25);
      g.add(arm);
      g.add(part(G.bud, skin, side * 0.37, armY - 0.48 * Math.cos(raise) + (o.armsUp ? 0.25 : 0), 0.05 - 0.4 * Math.sin(raise), 0.14, 0.14, 0.14));
    });
    if (o.staff) { g.add(part(G.cyl, "#7A5230", 0.55, 0.95, 0.1, 0.06, 1.9, 0.06)); g.add(part(new THREE.TorusGeometry(0.15, 0.03, 6, 10, Math.PI), "#7A5230", 0.7, 1.9, 0.1, 1, 1, 1)); }
    if (o.jar) g.add(part(G.cyl, "#B5835A", 0.42, armY - 0.35, 0.3, 0.3, 0.42, 0.3));
    g.scale.setScalar(s);
    return g;
  }
  function sheep(x, z, rotY) {
    const g = new THREE.Group();
    for (let i = 0; i < 5; i++) g.add(part(G.ball, "#FFFFFF", rr(-0.3, 0.3), 0.75 + rr(-0.05, 0.12), rr(-0.4, 0.4), 0.75, 0.65, 0.75));
    g.add(part(G.sphere, "#3C3236", 0, 0.8, 0.65, 0.38, 0.42, 0.42));
    [[-0.25, -0.3], [0.25, -0.3], [-0.25, 0.3], [0.25, 0.3]].forEach(([lx, lz]) => g.add(part(G.cyl, "#3C3236", lx, 0.25, lz, 0.1, 0.5, 0.1)));
    bake(placeAt(g, x, z, rotY));
  }
  function blobShadow(x, z, r) {
    const m = new THREE.Mesh(new THREE.CircleGeometry(r, 16), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.15, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.position.set(x, height(x, z) + 0.05, z); scene.add(m);
  }
  function signpost(x, z, rotY, text) {
    const g = new THREE.Group();
    g.add(part(G.cyl, "#7A5230", 0, 1.3, 0, 0.18, 2.6, 0.18));
    g.add(part(G.box, "#A8743F", 0, 2.55, 0, 3.4, 0.95, 0.15));
    bake(placeAt(g, x, z, rotY));
    const c = document.createElement("canvas"); c.width = 512; c.height = 140;
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    const draw = () => {
      const ctx = c.getContext("2d");
      ctx.fillStyle = "#A8743F"; ctx.fillRect(0, 0, 512, 140);
      ctx.fillStyle = "#FFF6E5"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      let fs = 64; ctx.font = `600 ${fs}px Fredoka, "Trebuchet MS", sans-serif`;
      while (ctx.measureText(text).width > 470 && fs > 30) { fs -= 4; ctx.font = `600 ${fs}px Fredoka, "Trebuchet MS", sans-serif`; }
      ctx.fillText(text, 256, 74); tex.needsUpdate = true;
    };
    draw(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
    const board = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 0.9), new THREE.MeshBasicMaterial({ map: tex }));
    board.position.set(0, 2.55, 0.08);
    const holder = new THREE.Group(); holder.add(board);
    const back = board.clone(); back.rotation.y = Math.PI; back.position.z = -0.08; holder.add(back);
    placeAt(holder, x, z, rotY); scene.add(holder);
  }
  function addPerson(o, x, z, rotY, lift = 0) {
    const p = person(o); placeAt(p, x, z, rotY, lift); bake(p);
    if (lift === 0) blobShadow(x, z, 0.55 * (o.size || 1));
    return p;
  }

  /* ---------- THE FOUR STOP SCENES ---------- */
  function buildStopScenes() {
    const A = {};   // animated objects
    const JESUS = { robe: "#F6F1E4", mantle: "#3E7CC4", sash: "#C9A86A", skin: "#C68B59", hair: "#5A3A22", beard: "#5A3A22", size: 1.12 };

    /* 1. BETHLEHEM — the manger, Mary, Joseph, shepherds; an angel over the fields */
    signpost(-3.2, 168, 0, "Bethlehem");
    const B = { x: 11, z: 151 };
    const st = new THREE.Group();                               // simple shelter, open towards the road (west)
    st.add(part(G.box, "#8A5C30", 3, 1.6, 0, 0.3, 3.2, 7));      // back wall
    st.add(part(G.box, "#9B6B3C", 0, 1.6, 3.4, 6, 3.2, 0.3));    // side walls
    st.add(part(G.box, "#9B6B3C", 0, 1.6, -3.4, 6, 3.2, 0.3));
    st.add(part(G.box, "#C9A15E", 0.2, 3.45, 0, 7, 0.3, 7.6, 0, 0, -0.18));   // sloping roof
    [[-2.9, 3.4], [-2.9, -3.4]].forEach(([px, pz]) => st.add(part(G.cyl, "#7A5230", px, 1.6, pz, 0.25, 3.2, 0.25)));
    st.add(part(G.box, "#E8C66A", 0, 0.08, 0, 5.6, 0.16, 6.6));   // straw floor
    st.add(part(G.box, "#8A5C30", 0.9, 0.5, 0, 1.3, 0.6, 2));     // the manger
    st.add(part(G.box, "#F2D06B", 0.9, 0.85, 0, 1.15, 0.15, 1.85)); // hay
    st.add(part(G.cyl, "#FFFFFF", 0.9, 1.02, -0.15, 0.42, 0.9, 0.42, Math.PI / 2, 0, 0));  // baby wrapped in cloth
    st.add(part(G.sphere, "#D49A6A", 0.9, 1.07, 0.42, 0.34, 0.34, 0.34));
    bake(placeAt(st, B.x, B.z, 0));
    const stY = height(B.x, B.z);
    addPerson({ robe: "#7FB3E8", hood: "#3E6FB8", seated: true, skin: "#D49A6A" }, B.x + 0.6, B.z + 1.6, Math.PI);           // Mary
    addPerson({ robe: "#9B7A55", hood: "#C9A15E", beard: "#4A3426", staff: true }, B.x + 1.4, B.z - 1.8, 0);                 // Joseph
    addPerson({ robe: "#C9B48A", hood: "#8A6B47", staff: true, seated: true }, B.x - 0.9, B.z - 2.4, faceTo(B.x - 0.9, B.z - 2.4, B.x + 0.9, B.z));  // a shepherd who hurried to see
    sheep(B.x + 2, B.z + 2.6, -1.2);
    const lamp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture("rgba(255,214,120,.9)", "rgba(255,214,120,0)"), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    lamp.position.set(B.x + 0.9, stY + 1.4, B.z); lamp.scale.set(5, 5, 1); scene.add(lamp);
    // shepherds' field with the angel
    const F = { x: -24, z: 134 };
    for (let i = 0; i < 11; i++) sheep(F.x + rr(-9, 9), F.z + rr(-7, 7), rand() * 6);
    addPerson({ robe: "#C9B48A", hood: "#8A6B47", staff: true, armsOut: true }, F.x + 2, F.z + 3, faceTo(F.x + 2, F.z + 3, F.x, F.z - 2));
    addPerson({ robe: "#B89A6E", hood: "#6E5236", staff: true }, F.x - 3, F.z + 2, faceTo(F.x - 3, F.z + 2, F.x, F.z - 2));
    const angel = new THREE.Group();
    const glowMat = c => new THREE.MeshLambertMaterial({ color: c, emissive: c, emissiveIntensity: 0.55, flatShading: true });
    const robeA = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.6, 1.5, 10), glowMat(0xFFFFFF)); robeA.position.y = 0.75; angel.add(robeA);
    const headA = new THREE.Mesh(G.sphere, glowMat(0xF3D2A8)); headA.scale.setScalar(0.5); headA.position.y = 1.75; angel.add(headA);
    [-1, 1].forEach(sd => { const w = new THREE.Mesh(G.sphere, glowMat(0xFFF6D8)); w.scale.set(0.25, 1.4, 0.9); w.position.set(sd * 0.55, 1.2, -0.25); w.rotation.z = sd * 0.5; angel.add(w); });
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture("rgba(255,240,180,.95)", "rgba(255,240,180,0)"), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    halo.scale.set(9, 9, 1); halo.position.y = 1.1; angel.add(halo);
    angel.position.set(F.x, height(F.x, F.z) + 7, F.z - 2); angel.rotation.y = faceTo(F.x, F.z - 2, F.x, F.z + 6);
    angel.userData.baseY = angel.position.y; scene.add(angel); A.angel = angel;
    // the town of Bethlehem
    [[-10, 178], [-14, 160], [-11, 146], [-30, 172], [-26, 186], [9, 186], [20, 176], [30, 165], [25, 132], [-12, 118], [16, 112], [36, 150], [-40, 156]]
      .forEach(([x, z], i) => { if (!nearRoad(x, z, 5.5) && !nearStopScene(x, z)) hut(x, z, faceTo(x, z, 0, 160), rr(3.6, 5), rr(3.6, 5), rr(2.8, 3.6), i % 3 ? "#E4C595" : "#DDB98A"); });

    /* 2. JORDAN RIVER — John baptises Jesus; the Spirit comes down like a dove */
    const jz = 58, jx = riverX(jz) - 2.5;
    signpost(62, 62, faceTo(62, 62, 66, 48), "Jordan River");
    const jesusR = person(JESUS); jesusR.position.set(jx, -1.45, jz); jesusR.rotation.y = faceTo(jx, jz, 68, 60); bake(jesusR);
    const jnx = riverX(jz + 2.2) - 5.6, jnz = jz + 2.2;
    const john = person({ robe: "#A07A4E", sash: "#5A3A22", hair: "#3A2A1E", beard: "#3A2A1E", armsOut: true, size: 1.08 });
    john.position.set(jnx, Math.max(height(jnx, jnz), -1.1), jnz); john.rotation.y = faceTo(jnx, jnz, jx, jz); bake(john);
    [[73, 50], [72, 70], [75, 74]].forEach(([x, z], i) => addPerson({ robe: ["#C98B6B", "#8FB87A", "#D9B76A"][i], hood: ["#8A4F3A", "#5E8A50", "#A5823A"][i] }, x, z, faceTo(x, z, jx, jz)));
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 3.2, 30, 18, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xFFF1B8, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
    beam.position.set(jx, 14, jz); scene.add(beam); A.beam = beam;
    const dove = new THREE.Group();
    const white = new THREE.MeshLambertMaterial({ color: 0xFFFFFF, emissive: 0xFFFFFF, emissiveIntensity: 0.35 });
    const body = new THREE.Mesh(G.sphere, white); body.scale.set(0.45, 0.4, 0.8); dove.add(body);
    const dh = new THREE.Mesh(G.sphere, white); dh.scale.setScalar(0.3); dh.position.set(0, 0.15, 0.42); dove.add(dh);
    const wings = [-1, 1].map(sd => { const w = new THREE.Mesh(G.sphere, white); w.scale.set(1.1, 0.08, 0.45); w.position.set(sd * 0.55, 0.05, 0); dove.add(w); return w; });
    dove.position.set(jx, 8, jz); dove.rotation.y = faceTo(jx, jz, 68, 60); scene.add(dove);
    A.dove = { obj: dove, wings, x: jx, z: jz };

    /* 3. THE MOUNTAIN — Jesus sits and teaches the crowd */
    const J = { x: -38, z: -100 };
    signpost(-15.5, -84.5, faceTo(-15.5, -84.5, -20, -100), "The Mountain");
    bake(placeAt(part(G.blob, "#A49C90", 0, 0.9, 0, 3.2, 2.2, 3, 0.2, 0.4, 0), J.x, J.z));
    const jm = person(Object.assign({}, JESUS, { seated: true, armsOut: true }));
    placeAt(jm, J.x, J.z, faceTo(J.x, J.z, -20, -88), 1.85); bake(jm);
    const toRoad = Math.atan2(-20 - J.x, -88 - J.z);
    const robes = ["#C98B6B", "#8FB87A", "#D9B76A", "#7FA8D9", "#C9A1D9", "#E3A86B", "#9BC7B8", "#D98F8F"];
    let n = 0;
    for (let ring = 0; ring < 3; ring++) for (let k = 0; k < 9; k++) {
      const a = toRoad + (k - 4) * (0.24 - ring * 0.04), r = 4.5 + ring * 2.4;
      const x = J.x + Math.sin(a) * r, z = J.z + Math.cos(a) * r;
      if (nearRoad(x, z, 2.4) || Math.abs(k - 4) < 1) continue;   // leave an aisle so Jesus can be seen
      addPerson({ robe: robes[n % robes.length], hood: n % 3 ? robes[(n + 3) % robes.length] : null, hair: n % 3 ? null : "#3A2A1E", seated: true, size: 0.95 }, x, z, faceTo(x, z, J.x, J.z));
      n++;
    }
    for (let i = 0; i < 40; i++) { const a = rand() * 6.28, r = rr(5, 18); const x = J.x + Math.cos(a) * r, z = J.z + Math.sin(a) * r; if (!nearRoad(x, z, 2)) flower(x, z); }   // lilies of the field
    const birds = [];
    for (let i = 0; i < 5; i++) {
      const b = new THREE.Group(), m = new THREE.MeshLambertMaterial({ color: 0x5A4E52 });
      b.scale.setScalar(0.7);
      [-1, 1].forEach(sd => { const w = new THREE.Mesh(G.box, m); w.scale.set(1.1, 0.08, 0.35); w.position.x = sd * 0.5; w.rotation.z = sd * 0.35; b.add(w); });
      scene.add(b); birds.push({ obj: b, r: rr(6, 12), sp: rr(0.25, 0.4), ph: rand() * 6.28, h: rr(10, 15) });
    }
    A.birds = { list: birds, cx: J.x, cz: J.z, y: height(J.x, J.z) };

    /* 4. BETHANY — Martha's house: Mary listens at Jesus' feet, Martha is busy */
    const H = { x: -71, z: -190 };
    signpost(-52, -178, faceTo(-52, -178, -60, -192), "Bethany");
    const house = new THREE.Group(), wall = "#E8CDA0";
    house.add(part(G.box, wall, -2.5, 2, 0, 5, 4, 11));                       // main house (back)
    house.add(part(G.box, "#D9B47E", -2.5, 4.15, 0, 5.6, 0.3, 11.6));
    house.add(part(G.box, "#6B4426", 0.02, 1.05, 0, 0.1, 2.1, 1.2));          // door
    house.add(part(G.box, wall, 3, 0.7, 5.3, 6, 1.4, 0.4));                  // courtyard walls
    house.add(part(G.box, wall, 3, 0.7, -5.3, 6, 1.4, 0.4));
    house.add(part(G.box, "#D9C29A", 3, 0.04, 0, 6, 0.08, 10.2));            // courtyard floor
    house.add(part(G.box, "#8A5C30", 2.2, 0.45, -3.2, 1.2, 0.9, 2.4));       // table with bread and jars
    house.add(part(G.cyl, "#E8B86A", 2.0, 1.0, -3.6, 0.45, 0.2, 0.45));
    house.add(part(G.cyl, "#B5835A", 2.4, 1.15, -2.6, 0.35, 0.5, 0.35));
    house.add(part(G.box, "#9B6B3C", 2.6, 0.3, 3, 1, 0.6, 2.2));             // bench
    bake(placeAt(house, H.x, H.z, 0));
    const hy = height(H.x, H.z);
    const jb = person(Object.assign({}, JESUS, { seated: true, armsOut: true })); jb.position.set(H.x + 2.6, hy + 0.3, H.z + 3); jb.rotation.y = faceTo(H.x + 2.6, H.z + 3, H.x + 9, H.z); bake(jb);
    const maryB = person({ robe: "#B07CC6", hood: "#7D4E9A", seated: true, skin: "#D49A6A", size: 0.95 }); maryB.position.set(H.x + 3.9, hy, H.z + 1.9); maryB.rotation.y = faceTo(H.x + 3.9, H.z + 1.9, H.x + 2.6, H.z + 3); bake(maryB);
    const martha = person({ robe: "#E08A4F", hood: "#B5582E", apron: "#FFF6E5", jar: true, armsOut: true, skin: "#C68B59" }); martha.position.set(H.x + 3.6, hy, H.z - 2.2); martha.rotation.y = faceTo(H.x + 3.6, H.z - 2.2, H.x + 2.6, H.z + 3); bake(martha);
    [[0.6, 4.4]].forEach(([dx, dz], i) => { const d = person({ robe: ["#8FB87A", "#7FA8D9"][i], hair: "#3A2A1E", seated: true, size: 0.95 }); d.position.set(H.x + dx, hy, H.z + dz); d.rotation.y = faceTo(H.x + dx, H.z + dz, H.x + 2.6, H.z + 3); bake(d); });
    // a little well and the village of Bethany
    const well = new THREE.Group();
    well.add(part(G.cyl, "#A49C90", 0, 0.5, 0, 1.8, 1, 1.8)); well.add(part(G.cyl, "#3A6E9E", 0, 0.98, 0, 1.3, 0.05, 1.3));
    bake(placeAt(well, H.x - 12, H.z - 9));
    [[-84, -170], [-70, -168], [-88, -205], [-72, -210], [-46, -200], [-44, -214], [-90, -188]]
      .forEach(([x, z]) => { if (!nearRoad(x, z, 5.5) && !nearStopScene(x, z)) hut(x, z, faceTo(x, z, -58, -190), rr(3.6, 5), rr(3.6, 5), rr(2.8, 3.4)); });
    [[-66, -176], [-80, -178], [-66, -206]].forEach(([x, z]) => { if (!nearRoad(x, z, 4)) olive(x, z, 1.1); });

    return A;
  }

  function buildClouds() {
    const list = [], m = new THREE.MeshLambertMaterial({ color: 0xFFFFFF, emissive: 0xFFFFFF, emissiveIntensity: 0.25, flatShading: true });
    for (let i = 0; i < 16; i++) {
      const c = new THREE.Group();
      for (let k = 0; k < 5; k++) { const p = new THREE.Mesh(G.ball, m); p.position.set(k * 3.2 - 6, rr(-0.8, 0.8), rr(-1.5, 1.5)); p.scale.setScalar(rr(4, 7)); c.add(p); }
      c.position.set(rr(-300, 300), rr(55, 85), rr(-300, 300)); scene.add(c); list.push(c);
    }
    return list;
  }
  function buildSun() {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture("rgba(255,250,220,1)", "rgba(255,240,180,0)"), transparent: true, depthWrite: false, fog: false }));
    s.position.copy(sun.position).normalize().multiplyScalar(420); s.scale.set(90, 90, 1); scene.add(s);
  }

  /* ---------- BUILD THE WORLD ---------- */
  const buildStart = performance.now();
  buildGround();
  buildRoad();
  const water = buildRiver();
  buildScenery();
  const anim = buildStopScenes();
  finishBatch();
  const clouds = buildClouds();
  buildSun();
  const buildEnd = performance.now();

  /* ---------- STOPS on the road ---------- */
  const stops = JOURNEY_STOPS.map(s => {
    const u = roadU(s.road[0], s.road[1]);
    const look = { bethlehem: [11.9, 1.1, 151], jordan: [riverX(58) - 3, 0.6, 58.5], mountain: [-37, 2.6, -99], bethany: [-68, 1.2, -189] }[s.id];
    const y = s.id === "jordan" ? look[1] : height(look[0], look[2]) + look[1];
    return Object.assign({}, s, { u, look: new THREE.Vector3(look[0], y, look[2]) });
  });

  /* ---------- CAMERA & WALKING ---------- */
  const state = {
    u: 0, target: 0, stop: -1, mode: "intro", speed: 0, phase: 0,
    yaw: 0, pitch: 0, yawOff: 0, pitchOff: 0, first: true
  };
  const v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), lookV = new THREE.Vector3();

  function eyeAt(u, out) { curve.getPointAt(Math.min(1, Math.max(0, u)), out); out.y += WALK.eye; return out; }
  function desiredAngles() {
    eyeAt(state.u, v1);
    const ahead = Math.min(1, state.u + 10 / ROAD_LEN);
    if (ahead - state.u > 1e-4) eyeAt(ahead, v2); else { curve.getTangentAt(1, v2); v2.multiplyScalar(10).add(v1); }
    v2.y -= 0.25;
    // turn towards the scene as we arrive at a stop
    const focus = state.mode === "walking" || state.mode === "paused" ? stops[state.next] : stops[state.stop];
    if (focus) {
      const dist = Math.abs(focus.u - state.u) * ROAD_LEN;
      const k = 1 - smooth(1, 16, dist);
      v2.lerp(focus.look, k);
    }
    lookV.subVectors(v2, v1).normalize();
    return { yaw: Math.atan2(lookV.x, lookV.z), pitch: Math.asin(Math.max(-1, Math.min(1, lookV.y))) };
  }
  const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));
  function updateCamera(dt, snap) {
    const d = desiredAngles();
    const k = snap ? 1 : 1 - Math.exp(-dt * 4);
    state.yaw += wrap(d.yaw - state.yaw) * k;
    state.pitch += (d.pitch - state.pitch) * k;
    eyeAt(state.u, v1);
    if (state.mode === "walking" && !reduceMotion) v1.y += Math.sin(state.phase) * WALK.bob;
    camera.position.copy(v1);
    const yaw = state.yaw + state.yawOff, pitch = Math.max(-0.7, Math.min(0.6, state.pitch + state.pitchOff));
    camera.lookAt(v1.x + Math.sin(yaw) * Math.cos(pitch), v1.y + Math.sin(pitch), v1.z + Math.cos(yaw) * Math.cos(pitch));
  }

  function walkTo(i) {
    state.next = i; state.target = stops[i].u; state.mode = "walking"; state.speed = 0;
    hideBox(); setStatus(`Walking to ${stops[i].place}…`); updateButtons(); updateProgress();
    if (reduceMotion) fadeJump(stops[i].u, () => arrive(i));
  }
  function arrive(i) {
    state.u = stops[i].u; state.stop = i; state.mode = "atStop"; state.speed = 0;
    setStatus(`📍 Stop ${i + 1} of ${stops.length} · ${stops[i].place}`);
    showStop(i); updateButtons(); updateProgress();
    if (typeof bbAddStars === "function") bbAddStars(1, "journey-" + stops[i].id);
  }
  function forward() {
    if (state.mode === "walking") { state.mode = "paused"; setStatus("Paused. Press ▶ to keep walking."); updateButtons(); return; }
    if (state.mode === "paused") { state.mode = "walking"; setStatus(`Walking to ${stops[state.next].place}…`); updateButtons(); return; }
    if (state.mode === "done") { restart(); return; }
    const next = state.stop + 1;
    if (next < stops.length) walkTo(next); else finish();
  }
  function back() {
    let i = state.mode === "walking" || state.mode === "paused" ? state.next - 1 : state.stop - 1;
    if (state.mode === "done") i = stops.length - 1;
    if (i < 0) { fadeJump(0, () => { state.u = 0; state.stop = -1; state.mode = "intro"; showIntro(); updateButtons(); updateProgress(); }); return; }
    fadeJump(stops[i].u, () => arrive(i));
  }
  function goToStop(i) { hideBox(); fadeJump(stops[i].u, () => arrive(i)); }
  function finish() {
    state.mode = "done"; setStatus("🎉 Journey complete!");
    showBox({
      emoji: "🎉", title: "You finished the journey!", ref: "",
      html: `<p>You walked with Jesus from His birth in Bethlehem, to His baptism in the Jordan River, up the mountain where He taught the crowds, and to Martha and Mary's home in Bethany.</p>
             <p class="jw-verse">“Jesus Christ is the same yesterday, today, and forever.”<span>Hebrews 13:8</span></p>`,
      speak: "You finished the journey! You walked with Jesus from Bethlehem, to the Jordan River, up the mountain, and to Martha and Mary's home in Bethany.",
      primary: "Walk again ↺"
    });
    updateButtons(); updateProgress();
    if (typeof bbAddStars === "function") bbAddStars(2, "journey-complete");
    if (typeof bbCelebrate === "function") bbCelebrate();
  }
  function restart() { fadeJump(0, () => { state.u = 0; state.stop = -1; state.mode = "intro"; showIntro(); updateButtons(); updateProgress(); }); }

  /* fade to white, jump, fade back (used for Back and stop shortcuts) */
  const fader = $("[data-jw-fade]");
  function fadeJump(u, then) {
    fader.classList.add("on");
    setTimeout(() => { state.u = u; state.yawOff = state.pitchOff = 0; then && then(); updateCamera(0, true); fader.classList.remove("on"); }, 380);
  }

  /* ---------- UI ---------- */
  const box = $("[data-jw-box]"), boxBody = $("[data-jw-box-body]"), statusEl = $("[data-jw-status]");
  const fwdBtn = $("[data-jw-forward]"), backBtn = $("[data-jw-back]"), reopen = $("[data-jw-reopen]");
  let boxSpeak = "", boxPrimary = null;
  function setStatus(t) { statusEl.textContent = t; }
  function showBox(o) {
    boxSpeak = o.speak || "";
    boxBody.innerHTML = `
      <div class="jw-box-emoji" aria-hidden="true">${o.emoji}</div>
      <h2 id="jw-box-title">${o.title}</h2>
      ${o.ref ? `<p class="jw-ref">📖 ${o.ref}</p>` : ""}
      ${o.html}
      <div class="jw-box-btns">
        <button type="button" class="btn btn-ghost" data-jw-listen>🔊 Listen</button>
        <button type="button" class="btn btn-primary" data-jw-continue>${o.primary || "Keep walking ▶"}</button>
      </div>`;
    boxBody.querySelector("[data-jw-listen]").addEventListener("click", () => typeof speakText === "function" && speakText(boxSpeak));
    boxBody.querySelector("[data-jw-continue]").addEventListener("click", forward);
    box.hidden = false; reopen.hidden = true;
    requestAnimationFrame(() => box.classList.add("show"));
    boxBody.scrollTop = 0;
  }
  function hideBox(keepReopen) {
    box.classList.remove("show"); box.hidden = true;
    reopen.hidden = !(keepReopen && (state.mode === "atStop" || state.mode === "done"));
    if ("speechSynthesis" in window) speechSynthesis.cancel();
  }
  function showStop(i) {
    const s = stops[i];
    const isLast = i === stops.length - 1;
    showBox({
      emoji: s.emoji, title: `${s.place}: ${s.title}`, ref: s.ref,
      html: s.paragraphs.map(p => `<p>${p}</p>`).join("") + `<p class="jw-verse">“${s.verse.text}”<span>${s.verse.ref}</span></p>`,
      speak: `${s.place}. ${s.title}. ` + s.paragraphs.map(p => p.replace(/\s*\([^)]*\)\s*$/, "")).join(" ") + ` ${s.verse.text}`,
      primary: isLast ? "Finish the journey ▶" : `Walk to ${stops[i + 1].place} ▶`
    });
  }
  function showIntro() {
    setStatus("Ready to walk");
    showBox({
      emoji: "🚶", title: "Journey with Jesus", ref: "",
      html: `<p>Walk along the road and visit ${stops.length} places from Jesus' life. Press <strong>Forward ▶</strong> to start walking. When you arrive, read what happened there.</p>
             <p class="jw-tip">Tip: drag the picture to look around.</p>`,
      speak: `Journey with Jesus. Walk along the road and visit ${stops.length} places from Jesus' life. Press Forward to start walking.`,
      primary: `Start walking to ${stops[0].place} ▶`
    });
  }
  function updateButtons() {
    const walking = state.mode === "walking";
    fwdBtn.innerHTML = walking ? "⏸ Pause" : state.mode === "paused" ? "▶ Keep walking" : state.mode === "done" ? "↺ Walk again" : "Forward ▶";
    fwdBtn.setAttribute("aria-label", walking ? "Pause walking" : "Walk forward");
    backBtn.disabled = state.mode === "intro";
  }
  const dots = [...stage.querySelectorAll("[data-jw-dot]")], walker = $("[data-jw-walker]");
  function updateProgress() {
    dots.forEach((d, i) => {
      d.classList.toggle("done", i <= state.stop || state.mode === "done");
      d.classList.toggle("current", i === state.stop && state.mode === "atStop");
    });
  }
  function placeDots() { dots.forEach((d, i) => { d.style.left = (stops[i].u * 100) + "%"; }); }
  placeDots();

  fwdBtn.addEventListener("click", forward);
  backBtn.addEventListener("click", back);
  $("[data-jw-close]").addEventListener("click", () => hideBox(true));
  reopen.addEventListener("click", () => { if (state.mode === "done") finish(); else showStop(state.stop); });
  dots.forEach((d, i) => d.addEventListener("click", () => goToStop(i)));
  document.querySelectorAll("[data-jw-goto]").forEach(b => b.addEventListener("click", () => {
    stage.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    goToStop(Number(b.dataset.jwGoto));
  }));

  // fullscreen
  const fsBtn = $("[data-jw-fullscreen]");
  if (!stage.requestFullscreen) fsBtn.hidden = true;
  fsBtn.addEventListener("click", () => document.fullscreenElement ? document.exitFullscreen() : stage.requestFullscreen().catch(() => {}));
  document.addEventListener("fullscreenchange", () => { fsBtn.textContent = document.fullscreenElement ? "✕ Exit full screen" : "⛶ Full screen"; resize(); });

  // drag to look around
  const hint = $("[data-jw-hint]");
  let drag = null;
  renderer.domElement.addEventListener("pointerdown", e => { drag = { x: e.clientX, y: e.clientY, yaw: state.yawOff, pitch: state.pitchOff }; renderer.domElement.setPointerCapture(e.pointerId); });
  renderer.domElement.addEventListener("pointermove", e => {
    if (!drag) return;
    const w = renderer.domElement.clientWidth || 1;
    state.yawOff = drag.yaw + (e.clientX - drag.x) / w * 2.6;
    state.pitchOff = Math.max(-0.6, Math.min(0.5, drag.pitch + (e.clientY - drag.y) / w * 1.6));
    if (hint) hint.classList.add("gone");
  });
  ["pointerup", "pointercancel"].forEach(t => renderer.domElement.addEventListener(t, () => { drag = null; }));
  // keyboard
  stage.addEventListener("keydown", e => {
    if (e.target.closest("[data-jw-box]") && e.key !== "Escape") return;
    if (e.key === "ArrowLeft") { state.yawOff += 0.15; e.preventDefault(); }
    else if (e.key === "ArrowRight") { state.yawOff -= 0.15; e.preventDefault(); }
    else if (e.key === "ArrowUp") { forward(); e.preventDefault(); }
    else if (e.key === "ArrowDown") { back(); e.preventDefault(); }
    else if (e.key === "Escape" && !box.hidden) hideBox(true);
  });

  /* ---------- size & loop ---------- */
  function resize() {
    const w = canvasWrap.clientWidth, h = canvasWrap.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    camera.fov = w / h < 0.8 ? 75 : 62; camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvasWrap);
  resize();

  let visible = true;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(stage);

  const clock = new THREE.Clock();
  const waterPos = water.geo.attributes.position;
  function tick() {
    requestAnimationFrame(tick);
    const dt = Math.min(clock.getDelta(), 0.1), t = clock.elapsedTime;
    if (!visible || document.hidden) return;

    if (state.mode === "walking" && !reduceMotion) {
      const left = (state.target - state.u) * ROAD_LEN;
      const vMax = Math.min(WALK.speed, Math.sqrt(2 * 9 * Math.max(left, 0)) + 0.6);  // slow down near the stop
      state.speed = Math.min(vMax, state.speed + 8 * dt);
      state.u = Math.min(state.target, state.u + state.speed * dt / ROAD_LEN);
      state.phase += state.speed * dt * 1.6;
      state.yawOff *= Math.exp(-dt * 2.5); state.pitchOff *= Math.exp(-dt * 2.5);
      if (state.target - state.u < 0.02 / ROAD_LEN) arrive(state.next);
    }
    walker.style.left = (state.u * 100) + "%";
    updateCamera(dt, state.first); state.first = false;

    // gentle life in the world
    for (let i = 0; i < waterPos.count; i++) waterPos.setY(i, -0.9 + Math.sin(t * 1.6 + waterPos.getZ(i) * 0.35 + (i % 2) * 1.3) * 0.07);
    waterPos.needsUpdate = true;
    if (!reduceMotion) {
      anim.angel.position.y = anim.angel.userData.baseY + Math.sin(t * 1.2) * 0.4;
      const d = anim.dove;   // comes down from heaven, then rests above Jesus
      d.obj.position.set(d.x, 3 + 7 * (1 - smooth(0, 8, t)) + Math.sin(t * 1.3) * 0.25, d.z);
      d.wings.forEach((w, i) => { w.rotation.z = (i ? -1 : 1) * Math.sin(t * 9) * 0.5; });
      anim.beam.material.opacity = 0.18 + Math.sin(t * 1.5) * 0.06;
      anim.beam.visible = camera.position.distanceTo(anim.beam.position) < 95;
      anim.birds.list.forEach(b => {
        const a = b.ph + t * b.sp;
        b.obj.position.set(anim.birds.cx + Math.cos(a) * b.r, anim.birds.y + b.h + Math.sin(t * 2 + b.ph) * 0.5, anim.birds.cz + Math.sin(a) * b.r);
        b.obj.rotation.y = -a; b.obj.children.forEach((w, i) => { w.rotation.z = (i ? -1 : 1) * (0.35 + Math.sin(t * 8 + b.ph) * 0.35); });
      });
      clouds.forEach((c, i) => { c.position.x += dt * (1 + i % 3); if (c.position.x > 320) c.position.x = -320; });
    }
    renderer.render(scene, camera);
  }

  showIntro(); updateButtons(); updateProgress();
  stage.classList.add("ready");
  tick();
  window.__journey = { state, stops, ROAD_LEN, forward, back, goToStop, buildMs: Math.round(buildEnd - buildStart) };   // handy for testing

  /* ---------- no 3D available: show the stops as cards ---------- */
  function showFallback() {
    stage.classList.add("no3d");
    stage.innerHTML = `<div class="jw-fallback">
      <p class="notice">Your device can't show the 3D walk, but here is the journey!</p>
      ${JOURNEY_STOPS.map((s, i) => `
        <article class="card">
          <div class="card-icon" aria-hidden="true">${s.emoji}</div>
          <h3>Stop ${i + 1}: ${s.place}: ${s.title}</h3>
          <p class="jw-ref">📖 ${s.ref}</p>
          ${s.paragraphs.map(p => `<p>${p}</p>`).join("")}
          <p class="jw-verse">“${s.verse.text}”<span>${s.verse.ref}</span></p>
        </article>`).join("")}
    </div>`;
  }
})();
