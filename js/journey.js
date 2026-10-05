/* =====================================================================
   BIBLE BUDDIES — journey.js
   "Journey with Jesus": a first-person, Street-View-style walk through a
   cartoon Bible-lands world, built with three.js (js/vendor/three.min.js).

   The stops and their text live in js/journey-stops.js.
   Each stop's 3D scene is built in SCENES below (same id as the stop).
   ===================================================================== */
(function () {
  const stage = document.querySelector("[data-journey]");
  if (!stage || typeof JOURNEY_STOPS === "undefined") return;
  const STOPS = JOURNEY_STOPS, CHAPTERS = JOURNEY_CHAPTERS;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = sel => stage.querySelector(sel);

  renderStopCards();
  function webglOK() {
    try { const c = document.createElement("canvas"); return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl"))); }
    catch (e) { return false; }
  }
  if (typeof THREE === "undefined" || !webglOK()) { showFallback(); return; }

  /* ================= SETTINGS ================= */
  const WALK = { eye: 1.7, speed: 10, accel: 5.3, brake: 6, bob: 0.06, roadWidth: 3.4 };
  const LAYOUT = { perRow: 8, colGap: 82, rowGap: 210, x0: -287, z0: 420 };
  const SCENE_DIST = 13;                 // how far each scene sits from the road
  const TILE = 160, CHUNK = 120, VIEW = 290;
  const SCENE_SIDE = {};                 // optional: force a side of the road (1 or -1) for a stop id
  const MOODS = {
    day:   { top: "#5DBDF2", hor: "#DDF2FF", sun: 2.4, sunCol: "#FFF3D6", hemi: 1.9, sky: "#FFFFFF", ground: "#9C8A5A", stars: 0, cloud: "#FFFFFF", glow: 0 },
    dusk:  { top: "#3D5795", hor: "#F8B47E", sun: 1.5, sunCol: "#FFB57A", hemi: 1.3, sky: "#FFD9B8", ground: "#7A6448", stars: 0.25, cloud: "#FFD9C2", glow: 0.6 },
    night: { top: "#0C163A", hor: "#2C3D70", sun: 0.7, sunCol: "#A9BCFF", hemi: 0.9, sky: "#9FB2E8", ground: "#2E2A3A", stars: 1, cloud: "#56608A", glow: 1 },
    storm: { top: "#3E4652", hor: "#7E8896", sun: 0.8, sunCol: "#C9D2DE", hemi: 1.25, sky: "#C2CAD6", ground: "#4E5056", stars: 0, cloud: "#5E6672", glow: 0.4 },
    dark:  { top: "#2E2536", hor: "#6E5A62", sun: 0.7, sunCol: "#D9B0B0", hemi: 1.25, sky: "#B8A4B0", ground: "#3A3036", stars: 0, cloud: "#4A3E48", glow: 0.5 },
    dawn:  { top: "#6E92D8", hor: "#FFD1A0", sun: 1.8, sunCol: "#FFD9A6", hemi: 1.5, sky: "#FFE6CC", ground: "#8C7A5A", stars: 0.1, cloud: "#FFE9D6", glow: 0.3 }
  };

  /* ================= SMALL HELPERS ================= */
  let seed = 7319;
  function rand() { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
  const rr = (a, b) => a + rand() * (b - a);
  const pick = arr => arr[Math.floor(rand() * arr.length)];
  const smooth = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
  const wrapA = a => Math.atan2(Math.sin(a), Math.cos(a));
  const tick = () => new Promise(r => setTimeout(r, 0));

  /* ================= LAYOUT: where every stop sits ================= */
  const slots = [];
  let slot = 0;
  STOPS.forEach((s, i) => {
    if (s.travel === "fade" && i > 0) { slots.push({ same: true }); return; }
    const r = Math.floor(slot / LAYOUT.perRow), c = slot % LAYOUT.perRow, col = r % 2 ? LAYOUT.perRow - 1 - c : c;
    slots.push({ x: LAYOUT.x0 + col * LAYOUT.colGap, z: LAYOUT.z0 - r * LAYOUT.rowGap, row: r });
    slot++;
  });
  slots.forEach((p, i) => { if (p.same) { const q = slots[i - 1], dir = q.row % 2 ? -1 : 1; Object.assign(p, { x: q.x + dir * 9, z: q.z, row: q.row }); } });
  const ctrl = [[slots[0].x - 45, slots[0].z]];
  slots.forEach((p, i) => {
    ctrl.push([p.x, p.z]);
    const n = slots[i + 1];
    if (!n || n.same) return;
    if (n.row === p.row) ctrl.push([(p.x + n.x) / 2, p.z + (i % 2 ? 8 : -8)]);
    else { const sx = Math.sign(p.x); ctrl.push([p.x + sx * 45, p.z - 30], [p.x + sx * 70, p.z - LAYOUT.rowGap / 2], [p.x + sx * 45, n.z + 30]); }
  });
  { const L = slots[slots.length - 1], dir = L.row % 2 ? -1 : 1; ctrl.push([L.x + dir * 50, L.z]); }

  /* ================= THE LAND ================= */
  const bumps = [], lakes = [], zones = [];       // filled by the scenes' FEATURES
  function lakeQ(L, x, z) {
    const dx = x - L.x, dz = z - L.z, c = Math.cos(L.rot), s = Math.sin(L.rot);
    const lx = dx * c - dz * s, lz = dx * s + dz * c;
    return Math.sqrt((lx / L.rx) ** 2 + (lz / L.rz) ** 2);
  }
  function height(x, z) {
    let base = 0.9 * Math.sin(x / 23) * Math.cos(z / 31) + 0.6 * Math.sin((x + z) / 17) + 0.3 * Math.cos(x / 9 - z / 13);
    let carve = 0;
    for (const L of lakes) {
      const q = lakeQ(L, x, z);
      if (q < 1.9) { base *= smooth(0.9, 1.8, q); carve = Math.max(carve, 3.4 * (1 - smooth(0.85, 1.12, q))); }
    }
    let y = 1.0 + base - carve;
    for (const b of bumps) {
      const d = Math.hypot(x - b.x, z - b.z);
      if (d < b.r) y += b.h * smooth(b.r, b.r * (b.top || 0.25), d) + (b.rough ? Math.sin(x * 0.7) * Math.cos(z * 0.6) * b.rough * smooth(b.r, b.r * 0.5, d) : 0);
    }
    return y;
  }

  /* ================= THREE.JS SETUP ================= */
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  const canvasWrap = $("[data-jw-canvas]");
  canvasWrap.appendChild(renderer.domElement);
  renderer.domElement.setAttribute("aria-hidden", "true");
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xDDF2FF, 60, VIEW - 30);
  const camera = new THREE.PerspectiveCamera(62, 1, 0.1, VIEW + 20);
  const hemi = new THREE.HemisphereLight(0xFFFFFF, 0x9C8A5A, 1.9); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xFFF3D6, 2.4); sun.position.set(-120, 200, 80); scene.add(sun);

  function glowTexture(inner, outer) {
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const g = c.getContext("2d"), grd = g.createRadialGradient(64, 64, 2, 64, 64, 64);
    grd.addColorStop(0, inner); grd.addColorStop(1, outer); g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  const GLOW_GOLD = glowTexture("rgba(255,224,140,1)", "rgba(255,224,140,0)");
  const GLOW_WHITE = glowTexture("rgba(255,255,245,1)", "rgba(255,250,220,0)");
  const GLOW_FIRE = glowTexture("rgba(255,170,80,1)", "rgba(255,120,40,0)");

  /* sky dome + stars + sun, all following the camera */
  const skyUni = { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(VIEW, 24, 16), new THREE.ShaderMaterial({
    uniforms: skyUni, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: "varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: "uniform vec3 top; uniform vec3 hor; varying vec3 vP; void main(){ float h = normalize(vP).y; gl_FragColor = vec4(mix(hor, top, smoothstep(-0.02, 0.55, h)), 1.0); }"
  }));
  sky.renderOrder = -10; sky.frustumCulled = false; scene.add(sky);
  const starGeo = new THREE.BufferGeometry(), sp = [];
  for (let i = 0; i < 700; i++) { const a = rand() * 6.283, e = rr(0.08, 1.45), r = VIEW * 0.92; sp.push(Math.cos(a) * Math.cos(e) * r, Math.sin(e) * r, Math.sin(a) * Math.cos(e) * r); }
  starGeo.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xFFFFFF, size: 2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false }));
  stars.renderOrder = -9; stars.frustumCulled = false; scene.add(stars);
  const sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW_WHITE, transparent: true, depthWrite: false, fog: false }));
  sunSprite.scale.set(60, 60, 1); scene.add(sunSprite);

  /* ================= BATCHING (fast drawing on phones) =================
     Static shapes are merged into one mesh per area of the map, so the
     phone only draws what is near the camera. */
  const flatMat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
  const smoothMat = new THREE.MeshLambertMaterial({ vertexColors: true });
  const _v = new THREE.Vector3(), _nm = new THREE.Matrix3();
  class Batch {
    constructor(m) { this.mat = m; this.p = new Float32Array(3 * 4096); this.n = new Float32Array(3 * 4096); this.c = new Float32Array(3 * 4096); this.ix = new Uint32Array(8192); this.v = 0; this.i = 0; }
    grow(nv, ni) {
      const need = (this.v + nv) * 3;
      if (need > this.p.length) { let L = this.p.length; while (L < need) L *= 2; for (const k of ["p", "n", "c"]) { const a = new Float32Array(L); a.set(this[k]); this[k] = a; } }
      if (this.i + ni > this.ix.length) { let L = this.ix.length; while (L < this.i + ni) L *= 2; const a = new Uint32Array(L); a.set(this.ix); this.ix = a; }
    }
    add(geo, m, nm, col) {
      const P = geo.attributes.position, N = geo.attributes.normal, nv = P.count, idx = geo.index, ni = idx ? idx.count : nv;
      this.grow(nv, ni);
      const base = this.v;
      for (let k = 0; k < nv; k++) {
        _v.fromBufferAttribute(P, k).applyMatrix4(m); const o = (base + k) * 3;
        this.p[o] = _v.x; this.p[o + 1] = _v.y; this.p[o + 2] = _v.z;
        _v.fromBufferAttribute(N, k).applyMatrix3(nm).normalize();
        this.n[o] = _v.x; this.n[o + 1] = _v.y; this.n[o + 2] = _v.z;
        this.c[o] = col.r; this.c[o + 1] = col.g; this.c[o + 2] = col.b;
      }
      if (idx) for (let k = 0; k < ni; k++) this.ix[this.i + k] = base + idx.getX(k);
      else for (let k = 0; k < ni; k++) this.ix[this.i + k] = base + k;
      this.v += nv; this.i += ni;
    }
    mesh() {
      if (!this.v) return null;
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(this.p.slice(0, this.v * 3), 3));
      g.setAttribute("normal", new THREE.BufferAttribute(this.n.slice(0, this.v * 3), 3));
      g.setAttribute("color", new THREE.BufferAttribute(this.c.slice(0, this.v * 3), 3));
      g.setIndex(new THREE.BufferAttribute(this.ix.slice(0, this.i), 1));
      g.computeBoundingSphere();
      return new THREE.Mesh(g, this.mat);
    }
  }
  const chunks = new Map();
  function bake(obj) {
    obj.updateMatrixWorld(true);
    const key = Math.floor(obj.position.x / CHUNK) + "," + Math.floor(obj.position.z / CHUNK);
    let ch = chunks.get(key); if (!ch) chunks.set(key, ch = { flat: new Batch(flatMat), smooth: new Batch(smoothMat) });
    obj.traverse(m => {
      if (!m.isMesh) return;
      _nm.getNormalMatrix(m.matrixWorld);
      (m.userData.smooth ? ch.smooth : ch.flat).add(m.geometry, m.matrixWorld, _nm, m.material.color);
    });
    return obj;
  }
  function finishChunks() { chunks.forEach(ch => { [ch.flat.mesh(), ch.smooth.mesh()].forEach(m => m && scene.add(m)); }); chunks.clear(); }

  /* shared shapes */
  const G = {
    box: new THREE.BoxGeometry(1, 1, 1),
    cyl: new THREE.CylinderGeometry(0.5, 0.5, 1, 8),
    cylS: new THREE.CylinderGeometry(0.5, 0.5, 1, 16),
    cone: new THREE.ConeGeometry(0.5, 1, 8),
    ball: new THREE.IcosahedronGeometry(0.5, 1),
    blob: new THREE.DodecahedronGeometry(0.5, 0),
    bud: new THREE.IcosahedronGeometry(0.5, 0),
    head: new THREE.SphereGeometry(0.5, 18, 14),
    s12: new THREE.SphereGeometry(0.5, 12, 9),
    s8: new THREE.SphereGeometry(0.5, 8, 6),
    hood: new THREE.SphereGeometry(0.5, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.56),
    cap: new THREE.SphereGeometry(0.5, 14, 7, 0, Math.PI * 2, 0, Math.PI * 0.5),
    robe: new THREE.CylinderGeometry(0.3, 0.46, 1, 16),
    smile: new THREE.TorusGeometry(0.5, 0.18, 6, 12, Math.PI),
    leafy: new THREE.IcosahedronGeometry(0.5, 1),
    pyramid: new THREE.ConeGeometry(0.5, 1, 4),
    hull: new THREE.SphereGeometry(0.5, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
    stone: new THREE.CylinderGeometry(1.45, 1.45, 0.45, 20),
    door: new THREE.CircleGeometry(1.2, 20)
  };
  const mats = {};
  const mat = hex => mats[hex] || (mats[hex] = new THREE.MeshLambertMaterial({ color: hex }));
  function part(geo, color, x, y, z, sx, sy, sz, rx = 0, ry = 0, rz = 0, smoothPart = false) {
    const m = new THREE.Mesh(geo, mat(color));
    m.position.set(x, y, z); m.scale.set(sx, sy, sz); m.rotation.set(rx, ry, rz);
    if (smoothPart) m.userData.smooth = true;
    return m;
  }
  const sm = (geo, color, x, y, z, sx, sy, sz, rx, ry, rz) => part(geo, color, x, y, z, sx, sy, sz, rx || 0, ry || 0, rz || 0, true);

  /* ================= CHARACTERS (friendly faces, like Buddy the Sheep) ================= */
  const SKIN = ["#C68B59", "#B47A4B", "#D49A6A", "#A86F45", "#BF8456"];
  const ROBES = ["#C98B6B", "#8FB87A", "#D9B76A", "#7FA8D9", "#C9A1D9", "#E3A86B", "#9BC7B8", "#D98F8F", "#B5A27E", "#8FA6C9"];
  const HAIR = ["#3A2A1E", "#4A3426", "#2A2422", "#5A3A22"];
  // arm poses: [forward angle, outward angle] for left and right arm
  const ARMS = {
    down: [[0.12, 0.2], [0.12, 0.2]], out: [[-1.05, 0.35], [-1.05, 0.35]], up: [[-2.75, 0.3], [-2.75, 0.3]],
    pray: [[-1.25, -0.42], [-1.25, -0.42]], hold: [[-0.95, -0.28], [-0.95, -0.28]], oneUp: [[0.12, 0.2], [-2.6, 0.25]],
    reach: [[0.12, 0.2], [-1.45, 0.1]], wave: [[0.12, 0.2], [-2.3, 0.6]], hips: [[0.2, 0.55], [0.2, 0.55]]
  };
  const JESUS = { robe: "#F6F1E4", mantle: "#3E7CC4", sash: "#C9A86A", skin: "#C68B59", hair: "#5A3A22", beard: "#5A3A22", size: 1.1 };
  const MARY = { robe: "#8DBBEA", hood: "#3E6FB8", skin: "#D49A6A" };
  const JOSEPH = { robe: "#9B7A55", hood: "#C9A15E", beard: "#4A3426", skin: "#C68B59" };
  const PETER = { robe: "#8FB87A", mantle: "#5E8A50", hair: "#8A8A8A", beard: "#8A8A8A", skin: "#BF8456" };
  const disciple = i => i === 0 ? Object.assign({}, PETER) : { robe: ROBES[i % ROBES.length], mantle: i % 3 ? null : ROBES[(i + 4) % ROBES.length], hair: HAIR[i % HAIR.length], beard: i % 4 === 1 ? null : HAIR[(i + 1) % HAIR.length], skin: SKIN[i % SKIN.length] };
  const villager = i => ({ robe: ROBES[(i * 3) % ROBES.length], hood: i % 2 ? ROBES[(i * 7 + 2) % ROBES.length] : null, hair: i % 2 ? null : HAIR[i % HAIR.length], beard: i % 5 === 0 ? HAIR[i % HAIR.length] : null, skin: SKIN[(i * 2) % SKIN.length] });
  const SOLDIER = { robe: "#B5412F", sash: "#6B4426", helmet: "#9AA0A8", skin: "#C68B59", holds: "spear" };
  const PRIEST = { robe: "#E8E4DA", mantle: "#3A5BA0", turban: "#FFFFFF", beard: "#6A6A6A", skin: "#C68B59" };
  const P = (...o) => Object.assign({}, ...o);

  function person(o) {
    const s = o.size || 1, g = new THREE.Group(), skin = o.skin || pick(SKIN), pose = o.pose || "stand";
    const robeH = pose === "seated" ? 0.6 : pose === "kneel" ? 0.7 : 1.12, base = pose === "seated" ? 0.34 : 0;
    if (pose === "seated") g.add(sm(G.s12, o.robe, 0, 0.2, 0.28, 0.7, 0.4, 0.95));
    if (pose === "kneel") g.add(sm(G.s12, o.robe, 0, 0.18, -0.15, 0.7, 0.36, 0.9));
    g.add(sm(G.robe, o.robe, 0, base + robeH / 2, 0, 1, robeH, 1));
    const neck = base + robeH;
    g.add(sm(G.s12, o.robe, 0, neck - 0.04, 0, 0.62, 0.28, 0.46));                 // shoulders
    if (o.sash) g.add(sm(G.cylS, o.sash, 0, base + robeH * 0.6, 0, 0.7, 0.09, 0.7));
    if (o.apron) g.add(part(G.box, o.apron, 0, base + robeH * 0.45, 0.27, 0.46, robeH * 0.7, 0.05));
    if (o.mantle) g.add(part(G.box, o.mantle, 0.06, base + robeH * 0.72, 0.02, 0.7, robeH * 0.42, 0.66, 0, 0, -0.42));
    if (o.breast) g.add(part(G.box, o.breast, 0, neck - 0.32, 0.24, 0.3, 0.3, 0.05));
    if (pose === "stand") [-1, 1].forEach(d => g.add(sm(G.s8, "#5A3E2A", d * 0.13, 0.05, 0.14, 0.15, 0.09, 0.26)));
    // head with a friendly face
    const hy = neck + 0.27;
    g.add(sm(G.head, skin, 0, hy, 0, 0.56, 0.58, 0.54));
    [-1, 1].forEach(d => {
      g.add(sm(G.s8, "#FFFFFF", d * 0.1, hy + 0.04, 0.235, 0.105, 0.13, 0.05));        // eye
      g.add(sm(G.s8, "#2A2422", d * 0.1, hy + 0.03, 0.258, 0.065, 0.08, 0.03));        // pupil
      g.add(sm(G.s8, "#FFFFFF", d * 0.085, hy + 0.06, 0.272, 0.025, 0.025, 0.012));    // sparkle
      g.add(sm(G.s8, "#F4A6AE", d * 0.17, hy - 0.06, 0.2, 0.085, 0.05, 0.03));         // rosy cheek
    });
    g.add(sm(G.s8, skin, 0, hy - 0.02, 0.27, 0.06, 0.05, 0.05));                       // nose
    if (o.beard) g.add(sm(G.head, o.beard, 0, hy - 0.16, 0.1, 0.44, 0.32, 0.36));
    g.add(sm(G.smile, "#4C3E38", 0, hy - 0.1, o.beard ? 0.285 : 0.262, 0.055, 0.04, 0.04, 0, 0, Math.PI));
    if (o.hair) g.add(sm(G.cap, o.hair, 0, hy + 0.02, -0.03, 0.6, 0.62, 0.6, -0.35));
    if (o.hood) g.add(sm(G.hood, o.hood, 0, hy + 0.01, -0.05, 0.63, 0.68, 0.64, -0.45));
    if (o.turban) g.add(sm(G.cylS, o.turban, 0, hy + 0.27, 0, 0.5, 0.22, 0.5));
    if (o.helmet) { g.add(sm(G.cap, o.helmet, 0, hy + 0.05, 0, 0.62, 0.62, 0.62)); g.add(part(G.box, "#B5412F", 0, hy + 0.36, 0, 0.06, 0.16, 0.4)); }
    // arms rotate at the shoulder
    const arms = o.arms ? (Array.isArray(o.arms) ? o.arms : ARMS[o.arms] || ARMS.down) : ARMS.down;
    const hands = [];
    [-1, 1].forEach((d, k) => {
      const a = new THREE.Group(); a.position.set(d * 0.3, neck - 0.08, 0.02);
      a.rotation.set(arms[k][0], 0, arms[k][1] * d);
      a.add(sm(G.cylS, o.sleeve || o.robe, 0, -0.25, 0, 0.17, 0.5, 0.17));
      a.add(sm(G.s8, skin, 0, -0.52, 0, 0.15, 0.15, 0.15));
      g.add(a); hands.push(a);
    });
    const held = {
      spear: () => part(G.cyl, "#7A5230", 0, -0.2, 0, 0.05, 2.4, 0.05),
      staff: () => part(G.cyl, "#7A5230", 0, -0.3, 0, 0.06, 1.9, 0.06),
      scroll: () => part(G.cylS, "#F3E3B8", 0, -0.58, 0.08, 0.16, 0.5, 0.16, 0, 0, Math.PI / 2),
      jar: () => sm(G.s12, "#B5835A", 0, -0.68, 0.06, 0.3, 0.36, 0.3),
      bread: () => sm(G.s12, "#E2B36A", 0, -0.62, 0.08, 0.3, 0.14, 0.24),
      cup: () => part(G.cylS, "#C9A15E", 0, -0.62, 0.06, 0.14, 0.18, 0.14),
      dove: () => sm(G.s12, "#FFFFFF", 0, -0.62, 0.1, 0.22, 0.18, 0.3),
      branch: () => { const b = new THREE.Group(); b.add(part(G.cyl, "#6B8F3A", 0, -0.2, 0, 0.03, 1.1, 0.03)); for (let i = 0; i < 4; i++) b.add(part(G.s8, "#5BAA45", (i % 2 ? 0.12 : -0.12), 0.1 + i * 0.18, 0, 0.28, 0.08, 0.12, 0, 0, i % 2 ? 0.5 : -0.5)); return b; },
      whip: () => part(G.cyl, "#8A6B47", 0, -0.75, 0.1, 0.03, 0.6, 0.03, 0.6)
    };
    if (o.holds && held[o.holds]) { const h = held[o.holds](); hands[o.holdIn === "left" ? 0 : 1].add(h); if (o.holds === "spear" || o.holds === "staff") h.rotation.x = -arms[1][0]; }
    if (o.baby) g.add(sm(G.s12, "#FFFFFF", 0, neck - 0.32, 0.3, 0.3, 0.26, 0.42), sm(G.head, "#D49A6A", 0, neck - 0.22, 0.46, 0.18, 0.18, 0.18));
    if (o.jarHead) g.add(sm(G.s12, "#B5835A", 0, hy + 0.42, 0, 0.36, 0.32, 0.36));
    g.scale.setScalar(s);
    if (pose === "lying") { const w = new THREE.Group(); g.rotation.x = -Math.PI / 2; g.position.set(0, 0.28, 0.85 * s); w.add(g); return w; }
    return g;
  }

  /* animals */
  function sheep() {
    const g = new THREE.Group(), wool = "#FCF6E9";
    [[0, 0.78, 0, 0.8], [-0.28, 0.72, 0.25, 0.6], [0.28, 0.72, 0.25, 0.6], [-0.28, 0.72, -0.28, 0.6], [0.28, 0.72, -0.28, 0.6], [0, 0.95, -0.1, 0.62], [0, 0.66, -0.45, 0.55]]
      .forEach(([x, y, z, r]) => g.add(sm(G.s12, wool, x, y, z, r, r * 0.9, r)));
    g.add(sm(G.head, "#6E5A52", 0, 0.98, 0.55, 0.5, 0.46, 0.44));
    [-0.1, 0, 0.1].forEach(x => g.add(sm(G.s12, wool, x, 1.2, 0.48, 0.24, 0.2, 0.22)));
    [-1, 1].forEach(d => {
      g.add(sm(G.s8, "#5A4842", d * 0.3, 1.0, 0.5, 0.12, 0.26, 0.1, 0, 0, d * 1.0));
      g.add(sm(G.s8, "#E79A9A", d * 0.31, 0.99, 0.53, 0.06, 0.16, 0.05, 0, 0, d * 1.0));
      g.add(sm(G.s8, "#FFFFFF", d * 0.1, 1.03, 0.74, 0.1, 0.12, 0.05));
      g.add(sm(G.s8, "#2A2422", d * 0.1, 1.02, 0.765, 0.06, 0.075, 0.03));
      g.add(sm(G.s8, "#FFFFFF", d * 0.085, 1.05, 0.778, 0.022, 0.022, 0.01));
      g.add(sm(G.s8, "#F4A6AE", d * 0.16, 0.92, 0.72, 0.07, 0.045, 0.03));
    });
    g.add(sm(G.s8, "#4C3E38", 0, 0.92, 0.77, 0.08, 0.05, 0.04));
    g.add(sm(G.smile, "#4C3E38", 0, 0.86, 0.765, 0.05, 0.035, 0.03, 0, 0, Math.PI));
    [[-0.22, -0.25], [0.22, -0.25], [-0.22, 0.25], [0.22, 0.25]].forEach(([x, z]) => g.add(sm(G.cylS, "#4C3E38", x, 0.22, z, 0.12, 0.44, 0.12)));
    return g;
  }
  function quad(o) {   // donkey, camel, pig, ox
    const g = new THREE.Group(), c = o.color, len = o.len || 1.1, legH = o.legH || 0.7, bodyY = legH + o.bodyH * 0.4;
    g.add(sm(G.s12, c, 0, bodyY, 0, o.bodyW, o.bodyH, len * 1.6));
    if (o.hump) g.add(sm(G.s12, c, 0, bodyY + o.bodyH * 0.5, -0.05, 0.55, 0.6, 0.7));
    const neckLen = o.neck || 0.4;
    g.add(sm(G.cylS, c, 0, bodyY + o.bodyH * 0.3 + neckLen * 0.4, len * 0.75, 0.3, neckLen + 0.2, 0.3, 0.55));
    const hz = len * 0.75 + neckLen * 0.45, hy = bodyY + o.bodyH * 0.35 + neckLen * 0.8, hl = o.headL || 0.55;
    g.add(sm(G.head, c, 0, hy, hz, o.headW || 0.36, 0.38, hl));
    if (o.snout) g.add(sm(G.cylS, o.snout, 0, hy - 0.02, hz + hl / 2, 0.22, 0.12, 0.2, Math.PI / 2));
    if (o.muzzle) g.add(sm(G.s12, o.muzzle, 0, hy - 0.08, hz + 0.22, 0.28, 0.24, 0.3));
    [-1, 1].forEach(d => {
      g.add(sm(G.s8, o.ear || c, d * 0.13, hy + 0.22, hz - 0.1, 0.1, o.earL || 0.3, 0.08, -0.3, 0, d * 0.35));
      g.add(sm(G.s8, "#FFFFFF", d * 0.12, hy + 0.06, hz + 0.18, 0.08, 0.09, 0.05));
      g.add(sm(G.s8, "#2A2422", d * 0.125, hy + 0.055, hz + 0.2, 0.05, 0.06, 0.03));
      if (o.horns) g.add(part(G.cone, "#F1E6C8", d * 0.22, hy + 0.2, hz - 0.05, 0.08, 0.35, 0.08, 0, 0, d * -1.1));
    });
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([dx, dz]) => g.add(sm(G.cylS, o.legs || c, dx * o.bodyW * 0.32, legH / 2, dz * len * 0.55, 0.16, legH, 0.16)));
    g.add(part(G.cyl, o.tail || c, 0, bodyY, -len * 0.8, 0.05, 0.5, 0.05, 0.6));
    if (o.mane) g.add(part(G.box, o.mane, 0, hy - 0.05, hz - 0.45, 0.08, 0.35, 0.5, 0.5));
    return g;
  }
  const DONKEY = { color: "#A39C96", bodyW: 0.7, bodyH: 0.7, len: 0.9, legH: 0.65, ear: "#8A847F", earL: 0.42, muzzle: "#D8D2CC", mane: "#5A5550", neck: 0.45 };
  const CAMEL = { color: "#C9A06A", bodyW: 0.8, bodyH: 0.8, len: 1.1, legH: 1.25, hump: true, neck: 1.0, headL: 0.6, ear: "#B5895A", earL: 0.15 };
  const PIG = { color: "#F2A7B2", bodyW: 0.75, bodyH: 0.65, len: 0.75, legH: 0.3, neck: 0.05, headL: 0.45, snout: "#E58A99", earL: 0.2 };
  const OX = { color: "#8A5A3C", bodyW: 0.95, bodyH: 0.9, len: 1.1, legH: 0.7, horns: true, muzzle: "#C9A68A", neck: 0.3, earL: 0.2 };
  function fish(color) { const g = new THREE.Group(); g.add(sm(G.s12, color, 0, 0, 0, 0.18, 0.2, 0.5)); g.add(part(G.cone, color, 0, 0, -0.3, 0.2, 0.25, 0.08, Math.PI / 2)); return g; }

  /* ================= BUILDINGS & PROPS (flat-shaded, low poly) ================= */
  function house(w = 4, d = 4, h = 3, color = "#E4C595", o = {}) {
    const g = new THREE.Group(), roof = o.roof || "#D4B07A";
    g.add(part(G.box, color, 0, h / 2, 0, w, h, d));
    g.add(part(G.box, roof, 0, h + 0.15, 0, w + 0.5, 0.3, d + 0.5));
    g.add(part(G.box, color, 0, h + 0.45, -d / 2 - 0.05, w + 0.5, 0.4, 0.2));
    g.add(part(G.box, "#6B4426", 0, 0.95, d / 2 + 0.02, 0.9, 1.9, 0.1));
    [-1, 1].forEach(s => g.add(part(G.box, "#4A3A2E", s * (w / 4 + 0.35), h * 0.62, d / 2 + 0.02, 0.55, 0.55, 0.1)));
    if (o.stairs) for (let k = 0; k < 5; k++) g.add(part(G.box, color, w / 2 + 0.45, 0.3 + k * 0.55, d / 2 - 0.5 - k * 0.55, 0.9, 0.6, 0.6));
    if (rand() < 0.5) g.add(sm(G.s12, "#B5835A", w / 2 + 0.4, 0.45, d / 2 - 0.4, 0.6, 0.8, 0.6));
    return g;
  }
  function room(w = 9, d = 6.4, h = 3.6, color = "#E8CDA0") {   // a house with its front wall open, so we can see inside
    const g = new THREE.Group();
    g.add(part(G.box, color, 0, h / 2, -d / 2, w, h, 0.4));
    [-1, 1].forEach(s => g.add(part(G.box, color, s * w / 2, h / 2, 0, 0.4, h, d)));
    g.add(part(G.box, "#D9B47E", 0, h + 0.15, -0.2, w + 0.8, 0.3, d + 0.8));
    g.add(part(G.box, "#D9C29A", 0, 0.05, 0, w, 0.1, d));
    return g;
  }
  function temple() {
    const g = new THREE.Group(), stone = "#EDE3CF", white = "#F6F1E6", gold = "#E8B84A";
    g.add(part(G.box, stone, 0, 0.4, -2, 26, 0.8, 20));                                           // courtyard platform
    for (let k = 0; k < 3; k++) g.add(part(G.box, stone, 0, 0.13 + k * 0.27, 9.5 - k * 0.5, 10, 0.27, 1.2));
    g.add(part(G.box, white, 0, 4.8, -8, 9, 8, 7));                                               // sanctuary
    g.add(part(G.box, gold, 0, 8.95, -8, 9.3, 0.4, 7.3));
    g.add(part(G.box, gold, 0, 2.6, -4.45, 2.4, 3.6, 0.12));                                        // golden doors
    for (let k = -2; k <= 2; k++) if (k) g.add(part(G.cylS, white, k * 1.6, 3.4, -4.1, 0.6, 5.2, 0.6));
    g.add(part(G.box, white, 0, 6.15, -4.1, 7.2, 0.5, 1.3));
    [-1, 1].forEach(s => {                                                                         // side colonnades
      for (let k = 0; k < 6; k++) g.add(part(G.cylS, white, s * 12.2, 2.6, 6 - k * 3.4, 0.5, 3.6, 0.5));
      g.add(part(G.box, "#D9CBAE", s * 12.2, 4.55, -2.5, 2.2, 0.35, 19));
      g.add(part(G.box, stone, s * 13.2, 2.4, -2.5, 0.4, 4, 19));
    });
    return g;
  }
  function synagogue() {
    const g = new THREE.Group(), stone = "#D8CBB0";
    g.add(part(G.box, stone, 0, 2.6, -2.5, 11, 5.2, 7));
    g.add(part(G.box, "#C6B796", 0, 5.4, -2.5, 11.6, 0.4, 7.6));
    g.add(part(G.box, stone, 0, 0.2, 2, 11, 0.4, 3.2));
    for (let k = -2; k <= 2; k++) g.add(part(G.cylS, "#EFE6D2", k * 2.4, 2.6, 3.2, 0.55, 4.4, 0.55));
    g.add(part(G.box, "#C6B796", 0, 4.95, 3.2, 11, 0.5, 0.9));
    g.add(part(G.box, "#4A3A2E", 0, 1.6, 1.02, 2.2, 3.2, 0.1));
    return g;
  }
  function wallSeg(len, h = 6, color = "#D9C49E") {
    const g = new THREE.Group();
    g.add(part(G.box, color, 0, h / 2, 0, len, h, 1.6));
    for (let x = -len / 2 + 0.6; x < len / 2; x += 1.6) g.add(part(G.box, color, x, h + 0.4, 0, 0.8, 0.8, 1.6));
    return g;
  }
  function gate(color = "#D9C49E") {
    const g = new THREE.Group();
    [-1, 1].forEach(s => { g.add(part(G.box, color, s * 3.4, 4, 0, 3, 8, 3)); for (let k = -1; k <= 1; k++) g.add(part(G.box, color, s * 3.4 + k, 8.4, 0, 0.7, 0.8, 3)); });
    g.add(part(G.box, color, 0, 6.6, 0, 4, 2.8, 2.4));
    g.add(part(G.box, "#4A3A2E", 0, 2.6, 0.2, 3.8, 5.2, 2.2));
    return g;
  }
  function table(len = 4, h = 0.55, color = "#8A5C30") { const g = new THREE.Group(); g.add(part(G.box, color, 0, h, 0, len, 0.12, 1.1)); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => g.add(part(G.box, color, a * (len / 2 - 0.2), h / 2, b * 0.4, 0.12, h, 0.12))); return g; }
  const bread = () => sm(G.s12, "#E2B36A", 0, 0, 0, 0.32, 0.15, 0.24);
  function boat(color = "#8A5C30", sail = true) {
    const g = new THREE.Group();
    g.add(sm(G.hull, color, 0, 0.55, 0, 2.6, 1.4, 6.2));
    g.add(part(G.box, "#A8743F", 0, 0.52, 0, 2.3, 0.1, 5.4));
    if (sail) { g.add(part(G.cyl, "#6B4426", 0, 2.8, 0.6, 0.12, 4.6, 0.12)); g.add(part(G.box, "#F4EEDC", 0, 3.1, 0.75, 0.05, 2.8, 1.9)); }
    return g;
  }
  function fire() { const g = new THREE.Group(); for (let k = 0; k < 4; k++) g.add(part(G.cyl, "#5A3A22", 0, 0.15, 0, 0.18, 1.3, 0.18, Math.PI / 2, k * 0.8, 0)); [0, 1, 2].forEach(k => g.add(part(G.blob, "#8C877E", Math.cos(k * 2.1) * 0.8, 0.15, Math.sin(k * 2.1) * 0.8, 0.45, 0.3, 0.45))); return g; }
  function stoneJar() { const g = new THREE.Group(); g.add(sm(G.s12, "#B8B0A2", 0, 0.55, 0, 0.75, 1.1, 0.75)); g.add(sm(G.cylS, "#A69D8E", 0, 1.08, 0, 0.42, 0.14, 0.42)); return g; }
  function basket(filled = true) { const g = new THREE.Group(); g.add(part(G.cyl, "#B08850", 0, 0.25, 0, 0.7, 0.5, 0.7)); if (filled) g.add(sm(G.s12, "#E2B36A", 0, 0.52, 0, 0.55, 0.22, 0.55)); return g; }
  function cross(h = 5) { const g = new THREE.Group(); g.add(part(G.box, "#6B4A2E", 0, h / 2, 0, 0.32, h, 0.32)); g.add(part(G.box, "#6B4A2E", 0, h * 0.78, 0, 2.6, 0.3, 0.3)); return g; }
  function well() { const g = new THREE.Group(); g.add(part(G.cylS, "#A49C90", 0, 0.5, 0, 1.9, 1, 1.9)); g.add(part(G.cylS, "#3A6E9E", 0, 0.98, 0, 1.4, 0.05, 1.4)); [-1, 1].forEach(s => g.add(part(G.cyl, "#7A5230", s * 0.85, 1.6, 0, 0.12, 1.4, 0.12))); g.add(part(G.cyl, "#7A5230", 0, 2.25, 0, 0.1, 1.9, 0.1, 0, 0, Math.PI / 2)); return g; }
  function bed() { const g = new THREE.Group(); g.add(part(G.box, "#8A5C30", 0, 0.3, 0, 1.1, 0.3, 2.1)); g.add(part(G.box, "#F1E6D2", 0, 0.5, 0, 1, 0.12, 2)); g.add(sm(G.s12, "#FFFFFF", 0, 0.62, -0.75, 0.6, 0.18, 0.35)); return g; }
  function tombRock() {
    const g = new THREE.Group(), rock = "#9C958A";
    [[0, 2.4, -1.5, 9, 5.5, 5], [-3.5, 1.6, -0.8, 4.5, 3.6, 4], [3.6, 1.8, -1, 4.5, 4, 4.2], [0, 4.6, -2.2, 6, 3, 4]].forEach(([x, y, z, a, b, c]) => g.add(part(G.blob, rock, x, y, z, a, b, c, 0.2, x * 0.1, 0)));
    g.add(part(G.door, "#1E1A18", 0, 1.3, 1.05, 1, 1.15, 1));
    return g;
  }
  const roundStone = () => part(G.stone, "#8F887E", 0, 1.45, 0, 1, 1, 1, Math.PI / 2, 0, 0);

  /* trees: round and tall ones only */
  function olive(s = 1) { const g = new THREE.Group(); g.add(part(G.cyl, "#7B6046", 0, 0.9, 0, 0.45, 1.8, 0.45, 0, 0, 0.12)); const greens = ["#7FA35A", "#8DB066", "#6E9450"]; for (let i = 0; i < 4; i++) g.add(part(G.blob, greens[i % 3], rr(-1, 1), rr(2.3, 3.1), rr(-1, 1), rr(1.8, 2.6), rr(1.4, 2), rr(1.8, 2.6), rand(), rand(), 0)); g.scale.setScalar(s); return g; }
  function cypress(s = 1) { const g = new THREE.Group(); g.add(part(G.cyl, "#6B4A2E", 0, 0.5, 0, 0.35, 1, 0.35)); g.add(part(G.cone, "#2F8A4A", 0, 3.6, 0, 1.8, 6.4, 1.8)); g.scale.setScalar(s); return g; }
  function roundTree(s = 1) { const g = new THREE.Group(); g.add(part(G.cyl, "#7A5532", 0, 1.3, 0, 0.5, 2.6, 0.5)); const greens = ["#5DAA4C", "#6CB956", "#4F9A45"]; [[0, 3.6, 0, 3.4], [-1, 3.0, 0.5, 2.4], [1.1, 3.1, -0.3, 2.5]].forEach(([x, y, z, r], i) => g.add(part(G.leafy, greens[i], x, y, z, r, r * 0.9, r))); g.scale.setScalar(s); return g; }
  const bush = (s = 1) => part(G.ball, pick(["#5DAA4C", "#6CB956", "#4F9A45"]), 0, 0.5 * s, 0, 1.6 * s, 1.1 * s, 1.6 * s);
  const rockShape = (s = 1, c = "#A49C90") => part(G.blob, c, 0, 0.4 * s, 0, 1.6 * s, 1.1 * s, 1.4 * s, rand(), rand(), 0);
  const flower = () => part(G.bud, pick(["#FF6F91", "#FFC93C", "#FFFFFF", "#B57CFF", "#FF8A5B"]), 0, 0.25, 0, 0.34, 0.3, 0.34);

  /* ================= THE ROAD ================= */
  const curve = new THREE.CatmullRomCurve3(ctrl.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, "catmullrom", 0.5);
  const ROAD_LEN = curve.getLength();
  const roadSamples = curve.getSpacedPoints(Math.round(ROAD_LEN / 4));
  const roadGrid = new Map();
  roadSamples.forEach((p, i) => { const k = Math.floor(p.x / 20) + "," + Math.floor(p.z / 20); if (!roadGrid.has(k)) roadGrid.set(k, []); roadGrid.get(k).push(i); });
  function nearRoad(x, z, clear, skipU) {
    const gx = Math.floor(x / 20), gz = Math.floor(z / 20), R = Math.ceil(clear / 20);
    for (let a = gx - R; a <= gx + R; a++) for (let b = gz - R; b <= gz + R; b++) {
      const l = roadGrid.get(a + "," + b); if (!l) continue;
      for (const i of l) {
        const p = roadSamples[i];
        if ((p.x - x) ** 2 + (p.z - z) ** 2 < clear * clear && !(skipU !== undefined && Math.abs(i / (roadSamples.length - 1) - skipU) * ROAD_LEN < 45)) return true;
      }
    }
    return false;
  }
  function roadU(x, z) { let best = 0, bd = Infinity; roadSamples.forEach((p, i) => { const d = (p.x - x) ** 2 + (p.z - z) ** 2; if (d < bd) { bd = d; best = i; } }); return best / (roadSamples.length - 1); }

  /* ================= STOP FRAMES: each stop's scene spot beside the road ================= */
  const frames = STOPS.map((s, i) => {
    const u = roadU(slots[i].x, slots[i].z), p = curve.getPointAt(u), t = curve.getTangentAt(u);
    return { i, id: s.id, u, px: p.x, pz: p.z, tx: t.x, tz: t.z };
  });
  function setFrame(f, side, dist) {
    const nx = f.tz * side, nz = -f.tx * side;           // from the road towards the scene
    f.side = side; f.dist = dist;
    f.cx = f.px + nx * dist; f.cz = f.pz + nz * dist;
    f.Zx = -nx; f.Zz = -nz;                              // local +z faces the road
    f.Xx = f.Zz; f.Xz = -f.Zx;
    f.rot = Math.atan2(f.Zx, f.Zz);
  }
  const W = (f, lx, lz) => ({ x: f.cx + f.Xx * lx + f.Zx * lz, z: f.cz + f.Xz * lx + f.Zz * lz });
  // land features around some scenes: lake [x, z, radiusAlong, radiusAcross], bump [x, z, radius, height, flatTop, rocky], desert radius
  const FEATURES = {
    jordan: [{ lake: [0, -9, 95, 6.5] }],
    "galilee-call": [{ lake: [0, -44, 70, 32] }],
    storm: [{ lake: [0, -48, 80, 38], waves: 0.32 }],
    gadara: [{ lake: [14, -52, 60, 30] }, { bump: [-16, -18, 28, 6, 0.2] }],
    feeding: [{ lake: [0, -60, 70, 30] }, { bump: [0, -14, 34, 3, 0.4] }],
    "water-walk": [{ lake: [0, -46, 80, 36], waves: 0.18 }],
    breakfast: [{ lake: [0, -40, 70, 30] }],
    "peter-preaches": [{ lake: [12, -6, 4, 3] }],
    transfiguration: [{ bump: [0, -31, 30, 8, 0.33] }],
    commission: [{ bump: [0, -31, 30, 7, 0.33] }],
    ascension: [{ bump: [0, -30, 34, 8, 0.35] }],
    golgotha: [{ bump: [0, -16, 22, 5, 0.3] }],
    caesarea: [{ bump: [0, -26, 22, 12, 0.3, 1.2] }],
    samaria: [{ bump: [-10, -55, 40, 14, 0.25] }],
    "nazareth-synagogue": [{ bump: [16, -30, 26, 8, 0.3] }],
    wilderness: [{ desert: 110 }, { bump: [-20, -30, 26, 9, 0.2, 1.4] }, { bump: [22, -38, 30, 12, 0.2, 1.4] }],
    egypt: [{ desert: 110 }],
    damascus: [{ desert: 90 }]
  };
  function lakeOf(f, ft) { const [lx, lz, rx, rz] = ft.lake, w = W(f, lx, lz); return { x: w.x, z: w.z, rx, rz, rot: f.rot, waves: ft.waves || 0.06 }; }
  function conflicts(f, list) {           // would this scene (or its lake / hill) cover the road somewhere?
    for (const ft of list) {
      if (ft.lake) { const L = lakeOf(f, ft); for (const p of roadSamples) if (lakeQ(L, p.x, p.z) < 1.3) return true; }
      if (ft.bump) { const [lx, lz, r] = ft.bump, w = W(f, lx, lz); if (nearRoad(w.x, w.z, r * 0.85)) return true; }
    }
    return nearRoad(f.cx, f.cz, 20, f.u);
  }
  frames.forEach((f, i) => {
    if (slots[i].same) { const q = frames[i - 1]; Object.assign(f, { side: q.side, dist: q.dist, cx: q.cx, cz: q.cz, Zx: q.Zx, Zz: q.Zz, Xx: q.Xx, Xz: q.Xz, rot: q.rot, shared: true }); return; }
    const prefer = SCENE_SIDE[STOPS[i].id] || (i % 2 ? 1 : -1), list = FEATURES[STOPS[i].id] || [];
    setFrame(f, prefer, SCENE_DIST);
    if (conflicts(f, list)) { setFrame(f, -prefer, SCENE_DIST); if (conflicts(f, list)) setFrame(f, prefer, SCENE_DIST); }
    for (const ft of list) {
      if (ft.lake) lakes.push(lakeOf(f, ft));
      if (ft.bump) { const [lx, lz, r, h, top, rough] = ft.bump, w = W(f, lx, lz); bumps.push({ x: w.x, z: w.z, r, h, top, rough }); }
      if (ft.desert) zones.push({ x: f.cx, z: f.cz, r: ft.desert });
    }
  });

  /* ================= MAIN BUILD (in small steps so the page stays responsive) ================= */
  const anims = [], toggles = [], lamps = [], waters = [];
  const statusEl = $("[data-jw-status]");
  async function build() {
    const t0 = performance.now();
    statusEl.textContent = "Building the world… 0%";
    buildTerrain(); await tick();
    buildRoad(); buildWater(); await tick();
    for (let i = 0; i < STOPS.length; i++) {
      const fn = SCENES[STOPS[i].id];
      if (fn) fn(sceneHelper(frames[i]), frames[i]);
      if (i % 4 === 3) { statusEl.textContent = `Building the world… ${Math.round((i + 1) / STOPS.length * 80)}%`; await tick(); }
    }
    buildScenery(); await tick();
    finishChunks(); buildClouds();
    return Math.round(performance.now() - t0);
  }

  /* ---------- ground tiles (only near the road) ---------- */
  function buildTerrain() {
    const need = new Set();
    roadSamples.forEach((p, k) => { if (k % 5) return; for (let a = -2; a <= 2; a++) for (let b = -2; b <= 2; b++) need.add((Math.floor(p.x / TILE) + a) + "," + (Math.floor(p.z / TILE) + b)); });
    const grass = new THREE.Color("#7CCB5E"), dry = new THREE.Color("#C9C27A"), sand = new THREE.Color("#E6CF96"), high = new THREE.Color("#9CC46E"),
          mud = new THREE.Color("#B9A77A"), rockC = new THREE.Color("#B7AE9C"), c = new THREE.Color(), c2 = new THREE.Color();
    const tmat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
    need.forEach(key => {
      const [tx, tz] = key.split(",").map(Number), SEG = 36;
      const g = new THREE.PlaneGeometry(TILE, TILE, SEG, SEG); g.rotateX(-Math.PI / 2); g.translate(tx * TILE + TILE / 2, 0, tz * TILE + TILE / 2);
      const Pa = g.attributes.position, col = new Float32Array(Pa.count * 3);
      for (let k = 0; k < Pa.count; k++) {
        const x = Pa.getX(k), z = Pa.getZ(k), y = height(x, z); Pa.setY(k, y);
        const n = 0.5 + 0.5 * Math.sin(x / 19 + Math.cos(z / 23) * 2) * Math.cos(z / 27);
        c.copy(grass).lerp(dry, n * 0.7);
        let de = 0; for (const zn of zones) de = Math.max(de, smooth(zn.r, zn.r * 0.55, Math.hypot(x - zn.x, z - zn.z)));
        if (de) c.lerp(sand, de);
        if (y > 7) c.lerp(high, 0.5);
        for (const b of bumps) if (b.rough && Math.hypot(x - b.x, z - b.z) < b.r * 0.8) c.lerp(rockC, 0.65);
        if (y < 0.2) c.copy(c2.copy(mud).lerp(c, smooth(-0.9, 0.2, y)));
        col[k * 3] = c.r; col[k * 3 + 1] = c.g; col[k * 3 + 2] = c.b;
      }
      g.setAttribute("color", new THREE.BufferAttribute(col, 3)); g.computeVertexNormals(); g.computeBoundingSphere();
      scene.add(new THREE.Mesh(g, tmat));
    });
  }
  function buildRoad() {
    const N = Math.round(ROAD_LEN / 1.3), across = [-1, -0.8, 0, 0.8, 1], pos = new Float32Array((N + 1) * 15), col = new Float32Array((N + 1) * 15);
    const edge = new THREE.Color("#C9A86A"), mid = new THREE.Color("#EBD3A0"), c = new THREE.Color();
    for (let i = 0; i <= N; i++) {
      const u = i / N, p = curve.getPointAt(u), t = curve.getTangentAt(u);
      across.forEach((a, k) => {
        const x = p.x + t.z * a * WALK.roadWidth / 2, z = p.z - t.x * a * WALK.roadWidth / 2, o = (i * 5 + k) * 3;
        pos[o] = x; pos[o + 1] = height(x, z) + 0.22; pos[o + 2] = z;
        c.copy(Math.abs(a) === 1 ? edge : mid).offsetHSL(0, 0, (rand() - 0.5) * 0.04); col[o] = c.r; col[o + 1] = c.g; col[o + 2] = c.b;
      });
    }
    const rmat = new THREE.MeshLambertMaterial({ vertexColors: true, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    const posAttr = new THREE.BufferAttribute(pos, 3), colAttr = new THREE.BufferAttribute(col, 3);
    const STEP = 90;                                     // road pieces, so each can be skipped when out of view
    for (let s = 0; s < N; s += STEP) {
      const idx = [], box = new THREE.Box3();
      for (let i = s; i < Math.min(N, s + STEP); i++) for (let k = 0; k < 4; k++) {
        const a = i * 5 + k, b = a + 1, d = a + 5, e = d + 1; idx.push(a, d, b, b, d, e);
        box.expandByPoint(_v.set(pos[a * 3], pos[a * 3 + 1], pos[a * 3 + 2]));
      }
      const g = new THREE.BufferGeometry(); g.setAttribute("position", posAttr); g.setAttribute("color", colAttr); g.setIndex(idx); g.computeVertexNormals();
      g.boundingSphere = box.getBoundingSphere(new THREE.Sphere()); g.boundingSphere.radius += 3;
      scene.add(new THREE.Mesh(g, rmat));
    }
    for (let i = 0; i < ROAD_LEN / 7; i++) {
      const u = rand(), p = curve.getPointAt(u), t = curve.getTangentAt(u), s = rand() < 0.5 ? -1 : 1, off = WALK.roadWidth / 2 + rr(0.2, 1.4);
      const x = p.x + t.z * s * off, z = p.z - t.x * s * off, r = rr(0.15, 0.3);
      bake(part(G.blob, pick(["#A9A196", "#BDB5A8", "#8F887E"]), x, height(x, z) + r * 0.3, z, r, r * 0.7, r, rand() * 3, rand() * 3, 0));
    }
  }
  function buildWater() {
    lakes.forEach(L => {
      const g = new THREE.PlaneGeometry(L.rx * 2.4, L.rz * 2.4, 28, 16); g.rotateX(-Math.PI / 2); g.rotateY(L.rot);
      const m = new THREE.Mesh(g, new THREE.MeshPhongMaterial({ color: 0x46B3E6, shininess: 70, transparent: true, opacity: 0.9, flatShading: true }));
      m.position.set(L.x, -0.9, L.z); scene.add(m);
      waters.push({ mesh: m, base: g.attributes.position.array.slice(), amp: L.waves, x: L.x, z: L.z });
      const c = Math.cos(L.rot), s = Math.sin(L.rot);
      for (let k = 0; k < (L.rx + L.rz) * 1.2; k++) {          // reeds and rocks on the shore
        const a = rand() * 6.283, lx = Math.cos(a) * L.rx * rr(1.1, 1.3), lz = Math.sin(a) * L.rz * rr(1.1, 1.3);
        const x = L.x + lx * c + lz * s, z = L.z - lx * s + lz * c;
        if (nearRoad(x, z, 3) || nearScene(x, z, -4)) continue;
        if (k % 3 === 0) { const r = rockShape(rr(0.4, 0.9), "#9C958A"); r.position.set(x, height(x, z), z); bake(r); }
        else for (let q = 0; q < 3; q++) bake(part(G.cone, q % 2 ? "#5FA845" : "#7DBF4E", x + rr(-0.6, 0.6), height(x, z) + 0.9, z + rr(-0.6, 0.6), 0.16, rr(1.4, 2.2), 0.16, rr(-0.15, 0.15), 0, rr(-0.15, 0.15)));
      }
    });
  }
  function nearScene(x, z, extra = 0) { return frames.some(f => (f.cx - x) ** 2 + (f.cz - z) ** 2 < (17 + extra) ** 2); }
  function inLake(x, z, m = 1.25) { return lakes.some(L => lakeQ(L, x, z) < m); }
  function onBump(x, z) { return bumps.some(b => Math.hypot(x - b.x, z - b.z) < b.r * (b.top || 0.25) * 1.3); }
  function inDesert(x, z) { return zones.some(zn => Math.hypot(x - zn.x, z - zn.z) < zn.r * 0.8); }

  function buildScenery() {
    const put = (o, x, z) => { o.position.set(x, height(x, z), z); o.rotation.y = rand() * 6.28; bake(o); };
    const n = Math.round(ROAD_LEN / 5);
    for (let i = 0; i < n; i++) {
      const u = rand(), p = curve.getPointAt(u), t = curve.getTangentAt(u), s = rand() < 0.5 ? -1 : 1, off = rr(6, 40);
      const x = p.x + t.z * s * off, z = p.z - t.x * s * off;
      if (nearRoad(x, z, 5.5) || nearScene(x, z) || inLake(x, z) || onBump(x, z)) continue;
      const k = rand();
      if (inDesert(x, z)) { if (k < 0.5) put(rockShape(rr(0.6, 1.6), "#C2A982"), x, z); else if (k < 0.62) put(bush(rr(0.5, 0.8)), x, z); continue; }
      if (k < 0.32) put(olive(rr(0.8, 1.25)), x, z); else if (k < 0.5) put(roundTree(rr(0.8, 1.2)), x, z);
      else if (k < 0.66) put(cypress(rr(0.8, 1.25)), x, z); else if (k < 0.86) put(bush(rr(0.7, 1.3)), x, z); else put(rockShape(rr(0.5, 1.2)), x, z);
    }
    for (let i = 0; i < ROAD_LEN / 2.5; i++) {
      const u = rand(), p = curve.getPointAt(u), t = curve.getTangentAt(u), s = rand() < 0.5 ? -1 : 1, off = rr(2.4, 12);
      const x = p.x + t.z * s * off, z = p.z - t.x * s * off;
      if (!nearRoad(x, z, 2.2) && !inLake(x, z) && !inDesert(x, z) && !nearScene(x, z, -6)) { const fl = flower(); fl.position.set(x, height(x, z), z); bake(fl); }
    }
  }
  const cloudMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF, emissive: 0xFFFFFF, emissiveIntensity: 0.25, flatShading: true });
  const clouds = [];
  function buildClouds() {
    for (let i = 0; i < 40; i++) {
      const c = new THREE.Group();
      for (let k = 0; k < 5; k++) { const p = new THREE.Mesh(G.ball, cloudMat); p.position.set(k * 3.2 - 6, rr(-0.8, 0.8), rr(-1.5, 1.5)); p.scale.setScalar(rr(4, 7)); c.add(p); }
      const q = roadSamples[Math.floor(rand() * roadSamples.length)];
      c.position.set(q.x + rr(-150, 150), rr(50, 80), q.z + rr(-150, 150)); scene.add(c); clouds.push(c);
    }
  }

  /* ================= SCENE HELPER (local coordinates; +z faces the road) ================= */
  function sceneHelper(f) {
    const S = {
      f,
      y: (lx, lz) => { const w = W(f, lx, lz); return height(w.x, w.z); },
      put(obj, lx, lz, lrot = 0, lift = 0, absY) { const w = W(f, lx, lz); obj.position.set(w.x, absY !== undefined ? absY : height(w.x, w.z) + lift, w.z); obj.rotation.y = f.rot + lrot; return obj; },
      bake(obj, lx, lz, lrot, lift, absY) { S.put(obj, lx, lz, lrot, lift, absY); return bake(obj); },
      add(obj, lx, lz, lrot, lift, absY) { S.put(obj, lx, lz, lrot, lift, absY); scene.add(obj); return obj; },
      face: (lx, lz, tx, tz) => Math.atan2(tx - lx, tz - lz),
      person(o, lx, lz, lrot = 0, lift = 0, absY) { return S.bake(person(o), lx, lz, lrot, lift, absY); },
      faceP(o, lx, lz, tx, tz, lift = 0) { return S.person(o, lx, lz, S.face(lx, lz, tx, tz), lift); },
      crowd(n, cx, cz, r1, r2, tx, tz, opts = {}) {
        const a0 = opts.a0 !== undefined ? opts.a0 : -1.2, a1 = opts.a1 !== undefined ? opts.a1 : 1.2;
        for (let k = 0; k < n; k++) {
          const a = a0 + (k / Math.max(1, n - 1)) * (a1 - a0), r = rr(r1, r2);
          const x = cx + Math.sin(a) * r + rr(-0.4, 0.4), z = cz + Math.cos(a) * r + rr(-0.4, 0.4);
          const o = P(villager(k + (opts.seed || 0)), opts.o || {}, { size: opts.size || rr(0.92, 1.05) });
          if (opts.pose) o.pose = opts.pose;
          S.faceP(o, x, z, tx, tz);
        }
      },
      houses(list, color) { list.forEach(([lx, lz, w, d, h, rot]) => { const wp = W(f, lx, lz); if (!nearRoad(wp.x, wp.z, Math.max(w, d) * 0.7 + 2)) S.bake(house(w, d, h, color || pick(["#E4C595", "#DDB98A", "#E8CDA0"])), lx, lz, rot || 0); }); },
      trees(list, kind = olive) { list.forEach(([lx, lz, s]) => { const wp = W(f, lx, lz); if (!nearRoad(wp.x, wp.z, 4)) S.bake(kind(s || 1), lx, lz, rand() * 6); }); },
      sign(text, lx = -7.5, lz = 8) { signpost(S, text, lx, lz); },
      glow(lx, ly, lz, size = 4, tex = GLOW_GOLD, always = false) {
        const g = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
        const w = W(f, lx, lz); g.position.set(w.x, height(w.x, w.z) + ly, w.z); g.scale.set(size, size, 1); scene.add(g);
        lamps.push({ s: g, always }); return g;
      },
      anim(fn) { anims.push({ x: f.cx, z: f.cz, fn }); },
      angel(lx, ly, lz, rotTo) { const a = angelFigure(); S.add(a, lx, lz, rotTo || 0, ly); const base = a.position.y; S.anim(t => { a.position.y = base + Math.sin(t * 1.2 + lx) * 0.35; }); return a; },
      glowPerson(o, lx, lz, lrot = 0, lift = 0) {
        const p = person(o); p.traverse(m => { if (m.isMesh) m.material = new THREE.MeshLambertMaterial({ color: m.material.color, emissive: m.material.color, emissiveIntensity: 0.55 }); });
        return S.add(p, lx, lz, lrot, lift);
      },
      flame(lx, lz, lift, s = 1) { const fl = new THREE.Mesh(G.cone, new THREE.MeshBasicMaterial({ color: 0xFF9A3D })); S.add(fl, lx, lz, 0, lift); fl.scale.set(0.8 * s, 1.2 * s, 0.8 * s); const b = fl.scale.y; S.anim(t => { fl.scale.y = b * (1 + Math.sin(t * 12 + lx) * 0.18); }); return fl; }
    };
    return S;
  }
  function angelFigure() {
    const g = new THREE.Group(), gm = c => new THREE.MeshLambertMaterial({ color: c, emissive: c, emissiveIntensity: 0.55 });
    const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.62, 1.5, 16), gm(0xFFFFFF)); robe.position.y = 0.75; g.add(robe);
    const head = new THREE.Mesh(G.head, gm(0xF3D2A8)); head.scale.setScalar(0.56); head.position.y = 1.78; g.add(head);
    const hair = new THREE.Mesh(G.cap, gm(0xF2D27A)); hair.scale.setScalar(0.6); hair.position.set(0, 1.8, -0.03); hair.rotation.x = -0.35; g.add(hair);
    [-1, 1].forEach(d => {
      const w = new THREE.Mesh(G.s12, gm(0xFFF6D8)); w.scale.set(0.22, 1.5, 0.9); w.position.set(d * 0.55, 1.25, -0.3); w.rotation.z = d * 0.5; g.add(w);
      const e = new THREE.Mesh(G.s8, new THREE.MeshBasicMaterial({ color: 0x2A2422 })); e.scale.set(0.06, 0.07, 0.03); e.position.set(d * 0.1, 1.8, 0.27); g.add(e);
    });
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW_GOLD, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    halo.scale.set(6, 6, 1); halo.position.y = 1.2; g.add(halo);
    return g;
  }
  function doveFigure() {
    const d = new THREE.Group(), wm = new THREE.MeshLambertMaterial({ color: 0xFFFFFF, emissive: 0xFFFFFF, emissiveIntensity: 0.35 });
    const body = new THREE.Mesh(G.s12, wm); body.scale.set(0.45, 0.4, 0.8); d.add(body);
    const h = new THREE.Mesh(G.s12, wm); h.scale.setScalar(0.3); h.position.set(0, 0.15, 0.42); d.add(h);
    d.userData.w = [-1, 1].map(s => { const w = new THREE.Mesh(G.s12, wm); w.scale.set(1.1, 0.08, 0.45); w.position.set(s * 0.55, 0.05, 0); d.add(w); return w; });
    return d;
  }
  function cloudPuff(n, size, emissive) {
    const c = new THREE.Group(), m = emissive ? new THREE.MeshLambertMaterial({ color: 0xFFFFFF, emissive: 0xFFF6D8, emissiveIntensity: emissive }) : cloudMat;
    for (let q = 0; q < n; q++) { const p = new THREE.Mesh(G.ball, m); p.position.set((q - (n - 1) / 2) * size * 0.6, rr(-0.3, 0.3) * size, rr(-0.4, 0.4) * size); p.scale.setScalar(size * rr(0.8, 1.15)); c.add(p); }
    return c;
  }
  function signpost(S, text, lx, lz) {
    let wp = W(S.f, lx, lz);
    if (nearRoad(wp.x, wp.z, 2.8)) { lz -= 2.5; wp = W(S.f, lx, lz); }
    const g = new THREE.Group();
    g.add(part(G.cyl, "#7A5230", 0, 1.3, 0, 0.18, 2.6, 0.18));
    g.add(part(G.box, "#A8743F", 0, 2.55, 0, 3.6, 0.95, 0.15));
    S.bake(g, lx, lz, 0.45);
    const c = document.createElement("canvas"); c.width = 512; c.height = 136;
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    const draw = () => {
      const ctx = c.getContext("2d"); ctx.fillStyle = "#A8743F"; ctx.fillRect(0, 0, 512, 136);
      ctx.fillStyle = "#FFF6E5"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      let fs = 62; ctx.font = `600 ${fs}px Fredoka, "Trebuchet MS", sans-serif`;
      while (ctx.measureText(text).width > 480 && fs > 26) { fs -= 4; ctx.font = `600 ${fs}px Fredoka, "Trebuchet MS", sans-serif`; }
      ctx.fillText(text, 256, 72); tex.needsUpdate = true;
    };
    draw(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
    const holder = new THREE.Group(), boardMat = new THREE.MeshBasicMaterial({ map: tex });
    const board = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 0.93), boardMat); board.position.set(0, 2.55, 0.08); holder.add(board);
    const back = new THREE.Mesh(board.geometry, boardMat); back.rotation.y = Math.PI; back.position.set(0, 2.55, -0.08); holder.add(back);
    S.add(holder, lx, lz, 0.45);
  }

  /* ================= THE 40 SCENES =================
     Local coordinates: x runs along the road, +z points towards the road,
     so negative z is further away. The camera looks at about (0, -1.5). */
  const SCENES = {
    "nazareth-angel"(S) {
      S.sign("Nazareth");
      S.bake(house(5, 4.5, 3.2, "#E8CDA0"), 0, -4);
      S.faceP(P(MARY, { arms: "pray" }), 1.2, 0.2, -1.8, 0.6);
      S.angel(-1.9, 0.6, 0.6, S.face(-1.9, 0.6, 1.2, 0.2));
      S.houses([[-9, -6, 4, 4, 3], [9, -7, 4.5, 4, 3.2], [-14, 2, 4, 4, 2.8], [14, 0, 4, 4, 3]]);
      S.trees([[6, -12, 1], [-6, -13, 1.1]], roundTree); S.trees([[-11, -12, 1]], cypress);
      S.bake(well(), 6, 1.5);
    },
    bethlehem(S) {
      S.sign("Bethlehem");
      const st = new THREE.Group();
      st.add(part(G.box, "#8A5C30", 0, 1.6, -3, 7, 3.2, 0.3));
      [-1, 1].forEach(s => st.add(part(G.box, "#9B6B3C", s * 3.4, 1.6, 0, 0.3, 3.2, 6)));
      st.add(part(G.box, "#C9A15E", 0, 3.45, -0.2, 7.6, 0.3, 7, 0.18, 0, 0));
      [-1, 1].forEach(s => st.add(part(G.cyl, "#7A5230", s * 3.4, 1.6, 2.9, 0.25, 3.2, 0.25)));
      st.add(part(G.box, "#E8C66A", 0, 0.08, 0, 6.6, 0.16, 5.6));
      st.add(part(G.box, "#8A5C30", 0, 0.5, -0.8, 2, 0.6, 1.3)); st.add(part(G.box, "#F2D06B", 0, 0.85, -0.8, 1.85, 0.15, 1.15));
      st.add(sm(G.s12, "#FFFFFF", -0.15, 1.02, -0.8, 0.85, 0.36, 0.42)); st.add(sm(G.head, "#D49A6A", 0.42, 1.07, -0.8, 0.32, 0.32, 0.32));
      S.bake(st, 0, -2);
      S.faceP(P(MARY, { pose: "kneel", arms: "pray" }), -1.6, -2.2, 0, -2.8);
      S.faceP(P(JOSEPH, { holds: "staff" }), 1.8, -3.4, 0, -2.8);
      S.faceP({ robe: "#C9B48A", hood: "#8A6B47", pose: "kneel", arms: "pray" }, 0.6, -0.2, 0, -2.8);
      S.faceP({ robe: "#B89A6E", hood: "#6E5236", holds: "staff" }, -2.6, 1.2, 0, -2.8);
      S.bake(sheep(), 2.6, 0.6, -0.8); S.bake(sheep(), -3.8, -0.8, 1.2);
      S.glow(0, 1.4, -2.6, 6);
      S.houses([[-11, -6, 4.5, 4, 3.2], [10, -8, 4, 4.5, 3], [-16, 3, 4, 4, 2.8], [15, -1, 4.5, 4, 3.2], [-4, -14, 5, 4, 3.4]]);
      [[-11, -3.8], [10, -5.6], [15, 1.3]].forEach(([x, z]) => S.glow(x, 1.9, z, 2.6));
      for (let k = 0; k < 7; k++) S.bake(sheep(), 18 + rr(-5, 5), -18 + rr(-5, 5), rand() * 6);
      S.faceP({ robe: "#C9B48A", hood: "#8A6B47", holds: "staff", arms: "up" }, 15, -14, 18, -22);
      S.angel(19, 7, -22, S.face(19, -22, 15, -14));
    },
    "temple-presented"(S) {
      S.sign("Jerusalem Temple");
      S.bake(temple(), 0, -11);
      S.faceP({ robe: "#F1EDE3", mantle: "#6E8FBF", hair: "#F2F2F2", beard: "#F2F2F2", baby: true, arms: "hold" }, 0, -1, 2, 1);
      S.faceP(P(MARY), 2, 1, 0, -1);
      S.faceP(P(JOSEPH, { holds: "dove", arms: "hold" }), 3.4, 0.2, 0, -1);
      S.faceP({ robe: "#9A7FB8", hood: "#D9D2E6", arms: "up", size: 0.95 }, -2.4, 0.4, 0, -1);
      S.crowd(5, 0, -1, 6, 8, 0, -1, { seed: 3, a0: -2.4, a1: -1.4 });
    },
    egypt(S) {
      S.sign("Egypt");
      const pyr = (s, lx, lz) => S.bake(part(G.pyramid, "#E2C48A", 0, s / 2, 0, s * 1.4, s, s * 1.4, 0, Math.PI / 4, 0), lx, lz);
      pyr(22, -30, -70); pyr(16, 6, -82); pyr(12, 30, -66);
      S.bake(house(5, 4, 3, "#F1E4C8", { roof: "#E2D2AC" }), 0, -5);
      S.faceP(P(MARY, { baby: true, arms: "hold", pose: "seated" }), -1.4, -0.6, 2, 2);
      S.faceP(P(JOSEPH, { holds: "staff" }), 1.6, -0.4, -1, 2);
      S.bake(quad(CAMEL), 7, -1, -1.2); S.bake(quad(DONKEY), -6, 0, 0.9);
      S.trees([[-9, -9, 0.8], [10, -10, 0.9]], roundTree);
    },
    "nazareth-home"(S) {
      S.sign("Nazareth");
      S.bake(house(6, 5, 3.4, "#E8CDA0", { stairs: true }), 0, -6);
      S.bake(table(3.4, 0.8, "#A0703F"), 0, -1);
      for (let k = 0; k < 3; k++) S.bake(part(G.box, "#C9935A", 0, 0.1 + k * 0.12, 0, 3.2, 0.1, 0.5), -4.4, 1 - k * 0.6, 0.2);
      S.faceP(P(JOSEPH, { hood: null, hair: "#4A3426", arms: "hold", apron: "#C9A15E" }), 1.1, -1.9, 0, -1);
      S.faceP({ robe: "#EFE3C8", sash: "#8A6B47", hair: "#5A3A22", skin: "#C68B59", size: 0.72, arms: "hold" }, -1, -0.1, 0, -1);
      S.faceP(P(MARY, { holds: "jar", arms: "hold" }), 3.2, -2.8, 0, -1);
      S.houses([[-10, -7, 4, 4, 3], [11, -6, 4.5, 4, 3.2], [15, 3, 4, 4, 3]]);
      S.trees([[-8, -14, 1], [7, -15, 1.1]], roundTree); S.bake(well(), -7, 2);
    },
    "temple-boy"(S) {
      S.sign("Jerusalem Temple");
      S.bake(temple(), 0, -11);
      S.person({ robe: "#EFE3C8", sash: "#8A6B47", hair: "#5A3A22", skin: "#C68B59", size: 0.8, pose: "seated", arms: "out" }, 0, -2.6, 0, 0.8);
      for (let k = 0; k < 6; k++) { const a = -1.4 + k * 0.56, x = Math.sin(a) * 3.2, z = -2.6 + Math.cos(a) * 2.6; S.faceP(P(PRIEST, { pose: "seated", holds: k % 2 ? "scroll" : null, arms: k % 2 ? "hold" : "down", mantle: ROBES[k], skin: SKIN[k % 5] }), x, z, 0, -2.6, 0.8); }
      S.faceP(P(MARY, { arms: "out" }), 5.6, 1.4, 0, -2.6); S.faceP(P(JOSEPH), 6.8, 0.6, 0, -2.6);
    },
    jordan(S) {
      S.sign("Jordan River");
      S.person(P(JESUS, { arms: "pray" }), 0, -8.5, 0, 0, -1.15);
      S.person({ robe: "#A07A4E", sash: "#5A3A22", hair: "#3A2A1E", beard: "#3A2A1E", arms: "out", size: 1.06 }, -2, -6.8, S.face(-2, -6.8, 0, -8.5), 0, -0.95);
      S.crowd(3, -7, -2, 0.5, 2, 0, -8, { seed: 5 }); S.crowd(3, 7, -2, 0.5, 2, 0, -8, { seed: 8 });
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 3, 30, 18, 1, true), new THREE.MeshBasicMaterial({ color: 0xFFF1B8, transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
      S.add(beam, 0, -8.5, 0, 0, 14);
      const dove = doveFigure(); S.add(dove, 0, -8.5, 0, 0, 3.4);
      S.anim(t => { dove.position.y = 3.4 + Math.sin(t * 1.3) * 0.25; dove.userData.w.forEach((w, i) => { w.rotation.z = (i ? -1 : 1) * Math.sin(t * 9) * 0.5; }); beam.material.opacity = 0.16 + Math.sin(t * 1.5) * 0.06; });
      S.trees([[-14, 4, 1], [14, 3, 1.1], [-20, -2, 1]], roundTree);
    },
    wilderness(S) {
      S.sign("The Wilderness");
      S.bake(rockShape(1.7, "#C2A982"), 0, -3);
      S.person(P(JESUS, { pose: "kneel", arms: "pray" }), 0, -1.2, 0, 0.1);
      [[-2.4, -0.4], [-3, 0.8], [2.6, 0.2], [3.2, 1.2], [-1.6, 1.6]].forEach(([x, z]) => S.bake(sm(G.s12, "#B9A98E", 0, 0.25, 0, 0.6, 0.45, 0.55), x, z));
      S.angel(3.4, 0.2, -2.2, S.face(3.4, -2.2, 0, -1.2));
      for (let k = 0; k < 10; k++) S.bake(rockShape(rr(0.8, 2.2), "#C2A982"), rr(-16, 16), rr(-18, -6));
    },
    "galilee-call"(S) {
      S.sign("Sea of Galilee");
      const b = boat(); S.add(b, 6, -14, 0.5, 0, -1.25);
      S.anim(t => { b.rotation.z = Math.sin(t * 1.1) * 0.04; });
      ["#C98B6B", "#7FA8D9", "#B5A27E"].forEach((c, k) => { const p = person({ robe: c, hair: HAIR[k], beard: k === 2 ? "#8A8A8A" : null, pose: "seated", arms: "hold" }); p.position.set(-0.6 + k * 0.6, 0.55, -1.6 + k * 1.4); b.add(p); });
      S.faceP(P(PETER, { arms: "hold" }), -2, -4.4, 0, 0);
      S.faceP(disciple(1), -3.4, -3.6, 0, 0);
      S.bake(part(G.box, "#C9B48A", 0, 0.08, 0, 2.4, 0.06, 1.6, 0, 0.3, 0), -2.6, -6);
      S.faceP(P(JESUS, { arms: "out" }), 1.5, 0.5, -2.4, -4);
      S.bake(boat("#9B6B3C", false), -9, -6, 1.2);
    },
    cana(S) {
      S.sign("Cana");
      S.bake(house(8, 5, 3.4, "#E8CDA0"), 0, -8);
      for (let k = 0; k < 4; k++) S.bake(part(G.cyl, "#7A5230", 0, 1.5, 0, 0.15, 3, 0.15), -5 + k * 3.4, -4.4);
      S.bake(part(G.box, "#6E9450", 0, 3.1, 0, 11, 0.25, 1.6), 0, -4.4);                      // vine trellis with grapes
      for (let k = 0; k < 8; k++) S.bake(sm(G.s8, "#7B4A9E", 0, 2.75, 0, 0.3, 0.45, 0.3), -4.8 + k * 1.35, -4.2);
      S.bake(table(6, 0.6), 0, -3);
      for (let k = 0; k < 6; k++) { if (k !== 2 && k !== 3) S.faceP(villager(k + 2), -2.5 + k, -3.9, -2.5 + k, -2); S.bake(bread(), -2.4 + k, -3, 0, 0.7); }
      S.faceP({ robe: "#FFFFFF", hood: "#FFFFFF", skin: "#D49A6A" }, -0.5, -4.1, -0.5, -2);
      S.faceP({ robe: "#5A6E9E", hair: "#3A2A1E", skin: "#BF8456" }, 0.5, -4.1, 0.5, -2);
      for (let k = 0; k < 6; k++) S.bake(stoneJar(), -5 + k * 1.1, 1.5);
      S.faceP(P(JESUS, { arms: "out" }), 3.6, 0, -2, 1.5);
      S.faceP(P(MARY), 4.8, -1.2, -2, 1.5);
      S.faceP({ robe: "#B5A27E", apron: "#F1E6D2", holds: "jar", arms: "hold" }, -1.8, 2.6, -3, 1.5);
      S.faceP({ robe: "#9BC7B8", apron: "#F1E6D2", holds: "cup", arms: "hold" }, 0.6, 2.6, -1, 1.5);
    },
    "temple-cleansed"(S) {
      S.sign("Jerusalem Temple");
      S.bake(temple(), 0, -12);
      S.faceP(P(JESUS, { arms: "oneUp", holds: "whip" }), 0, -1, 0, 3);
      [[-3, 0.5, 0.6], [3.4, 0, -0.5]].forEach(([x, z, r]) => { const t = table(2.2, 0.55); t.rotation.x = 1.3; const tg = new THREE.Group(); tg.add(t); S.bake(tg, x, z, r, 0.4); for (let k = 0; k < 5; k++) S.bake(part(G.cylS, "#E8B84A", 0, 0.05, 0, 0.16, 0.04, 0.16), x + rr(-1, 1), z + rr(0.4, 1.4)); });
      S.bake(sheep(), -5, 2.6, 2.2); S.bake(sheep(), -6.4, 1.2, 2.6); S.bake(quad(OX), 6, 2.6, -2.2);
      S.faceP(villager(4), -4, -3, -6, 3); S.faceP(villager(5), 4.4, -3, 6, 3);
      for (let k = 0; k < 3; k++) S.bake(part(G.box, "#B08850", 0, 0.4, 0, 0.9, 0.8, 0.7), 6.5 + k, -1.5);
    },
    samaria(S) {
      S.sign("Samaria");
      S.bake(well(), 0, -1.5);
      S.person(P(JESUS, { pose: "seated", arms: "out" }), -1.6, -2.4, S.face(-1.6, -2.4, 1.6, -0.5), 0.6);
      S.faceP({ robe: "#D98F8F", hood: "#A25A5A", jarHead: true, arms: "up", skin: "#C68B59" }, 1.8, -0.4, -1.6, -2.4);
      S.trees([[-8, -6, 1], [8, -7, 1.1]], olive); S.trees([[-10, 2, 1]], cypress);
      S.houses([[-16, -14, 4, 4, 3], [14, -15, 4.5, 4, 3]]);
    },
    "nazareth-synagogue"(S) {
      S.sign("Nazareth");
      S.bake(synagogue(), 0, -5);
      S.faceP(P(JESUS, { holds: "scroll", arms: "hold" }), 0, -1.6, 0, 3);
      S.bake(part(G.box, "#8A5C30", 0, 0.5, 0, 1, 1, 0.6), 0, -0.9);
      for (let k = 0; k < 8; k++) S.faceP(P(villager(k), { pose: "seated" }), -3.5 + (k % 4) * 2.3, 1.8 + Math.floor(k / 4) * 1.8, 0, -1.6);
      S.houses([[-12, -6, 4, 4, 3], [12, -4, 4, 4, 3]]);
    },
    "capernaum-healing"(S) {
      S.sign("Capernaum");
      S.bake(house(6, 5, 3.2, "#E4C595"), 0, -5);
      S.bake(bed(), -1.2, -0.8, Math.PI / 2);
      S.person({ robe: "#C9A1D9", hood: "#8A6BA0", skin: "#D49A6A", pose: "seated" }, -1.4, -0.8, Math.PI / 2, 0.45);
      S.person(P(JESUS, { arms: "reach" }), 0.6, -0.9, -Math.PI / 2);
      S.crowd(9, 0, -1, 5, 8, 0, -1, { seed: 7, a0: -1.3, a1: 1.3 });
      [[-5, 3], [5.5, 2.5]].forEach(([x, z]) => S.person(P(villager(x > 0 ? 1 : 2), { pose: "lying" }), x, z, 0.6));
      S.glow(-2.5, 2.1, -2.4, 3); S.glow(2.6, 2.1, -2.4, 3);
      S.houses([[-11, -7, 4, 4, 3], [11, -6, 4.5, 4, 3.2]]);
    },
    storm(S) {
      S.sign("Sea of Galilee");
      const b = boat(); b.scale.setScalar(1.3); S.add(b, 0, -14, 0.3, 0, -1.25);
      for (let k = 0; k < 4; k++) { const p = person(P(disciple(k), { pose: "seated", arms: k % 2 ? "up" : "out" })); p.position.set(k % 2 ? 0.55 : -0.55, 0.55, -1.8 + k * 0.9); b.add(p); }
      const j = person(P(JESUS, { arms: "oneUp" })); j.position.set(0, 0.55, 1.8); b.add(j);
      S.anim(t => { b.rotation.z = Math.sin(t * 2.1) * 0.16; b.rotation.x = Math.sin(t * 1.6) * 0.08; b.position.y = -1.25 + Math.sin(t * 2.4) * 0.25; });
      for (let k = 0; k < 6; k++) S.add(cloudPuff(4, rr(5, 7)), rr(-30, 30), rr(-60, -30), 0, 0, rr(22, 30));
    },
    gadara(S) {
      S.sign("Gadara");
      S.person(P(JESUS, { arms: "out" }), -1.5, -1, S.face(-1.5, -1, 1, -0.4));
      S.person({ robe: "#EFE3C8", sash: "#8A6B47", hair: "#3A2A1E", beard: "#3A2A1E", pose: "seated", arms: "pray" }, 1, -0.4, S.face(1, -0.4, -1.5, -1));
      S.crowd(4, -7, -3, 1, 2.5, 0, -1, { seed: 9 });
      for (let k = 0; k < 10; k++) S.bake(quad(PIG), 8 + rr(-4, 6), -20 + rr(-6, 4), S.face(0, 0, 14, -52) + rr(-0.3, 0.3));
      [[-16, -14], [-12, -18]].forEach(([x, z]) => S.bake(rockShape(2.4, "#9C958A"), x, z));
      S.houses([[16, 2, 4, 4, 3]]);
    },
    jairus(S) {
      S.sign("Capernaum");
      S.bake(room(8, 6.8, 3.4), 0, -3);
      S.bake(bed(), 1.5, -4.2, Math.PI / 2);
      S.person({ robe: "#F6E6EF", hair: "#3A2A1E", skin: "#D49A6A", size: 0.78, arms: "reach" }, 0.2, -3.2, S.face(0.2, -3.2, -1, -3));
      S.person(P(JESUS, { arms: "reach" }), -1.2, -3, S.face(-1.2, -3, 0.2, -3.2));
      S.faceP({ robe: "#5A6E9E", mantle: "#C9A15E", hair: "#3A2A1E", beard: "#3A2A1E", arms: "up" }, 2.6, -1.6, 0.2, -3.2);
      S.faceP({ robe: "#C98B6B", hood: "#8A4F3A", arms: "pray", skin: "#C68B59" }, 3.2, -0.4, 0.2, -3.2);
      [0, 4, 5].forEach((d, k) => S.faceP(disciple(d), -3 + k * 1.1, -0.6 + (k % 2) * 0.5, 0.2, -3.2));
    },
    feeding(S) {
      S.sign("Bethsaida");
      S.person(P(JESUS, { arms: "up", holds: "bread" }), 0, -3, 0, 0);
      S.faceP({ robe: "#D9B76A", hair: "#3A2A1E", size: 0.7, arms: "hold" }, 1.5, -2.2, 0, -3);
      S.bake(basket(), 1.7, -1.4);
      [[-8, -3], [8, -4], [0, -11], [-9, -11], [9, -12]].forEach(([cx, cz], gI) => { for (let k = 0; k < 7; k++) { const a = k / 7 * 6.28; S.faceP(P(villager(gI * 7 + k), { pose: "seated", size: 0.95 }), cx + Math.sin(a) * 2.2, cz + Math.cos(a) * 1.6, cx, cz); } });
      for (let k = 0; k < 12; k++) S.bake(basket(), 4 + (k % 6) * 1.2, 1.5 + Math.floor(k / 6) * 1.3);
      S.faceP(P(disciple(2), { holds: "bread", arms: "hold" }), -4, -2, -8, -3); S.faceP(P(disciple(3), { holds: "bread", arms: "hold" }), 4, -2.5, 8, -4);
    },
    "water-walk"(S) {
      S.sign("Sea of Galilee");
      const b = boat(); S.add(b, -6, -24, 0.9, 0, -1.25);
      for (let k = 0; k < 4; k++) { const p = person(P(disciple(k + 1), { pose: "seated", arms: k % 2 ? "up" : "out" })); p.position.set(k % 2 ? 0.55 : -0.55, 0.55, -1.8 + k * 0.9); b.add(p); }
      S.anim(t => { b.rotation.z = Math.sin(t * 1.7) * 0.1; b.position.y = -1.25 + Math.sin(t * 2) * 0.16; });
      const j = S.glowPerson(P(JESUS, { arms: "reach" }), 1.5, -15, S.face(1.5, -15, -0.2, -13.4)); j.position.y = -0.95;
      S.person(P(PETER, { arms: "up" }), -0.2, -13.4, S.face(-0.2, -13.4, 1.5, -15), 0, -1.6);
      const gl = S.glow(1.5, 0.4, -15, 7, GLOW_WHITE, true); gl.position.y = 0.4;
    },
    "bread-of-life"(S) {
      S.sign("Capernaum");
      S.bake(synagogue(), 0, -6);
      S.faceP(P(JESUS, { arms: "out" }), 0, -2.4, 0, 3);
      S.crowd(12, 0, -2.4, 4, 7, 0, -2.4, { seed: 11, a0: -1.2, a1: 1.2 });
      S.houses([[-13, -6, 4, 4, 3], [13, -5, 4, 4, 3.2], [-15, 4, 4, 4, 3]]);
    },
    caesarea(S) {
      S.sign("Caesarea Philippi");
      for (let k = 0; k < 6; k++) S.bake(rockShape(rr(2, 3.4), "#A8A094"), rr(-12, 12), rr(-14, -8));
      S.faceP(P(JESUS, { arms: "out" }), 0, -2.6, 0, 2);
      S.faceP(P(PETER, { arms: "out" }), 1.6, 0.8, 0, -2.6);
      for (let k = 1; k < 9; k++) { const a = -2.6 + k * 0.58, x = Math.sin(a) * 4, z = -0.6 + Math.cos(a) * 3.2; if (Math.hypot(x - 1.6, z - 0.8) > 1.2) S.faceP(disciple(k), x, z, 0, -2.6); }
      S.trees([[-14, 2, 1.1], [14, 0, 1]], roundTree);
    },
    transfiguration(S) {
      S.sign("The Mountain");
      S.glowPerson(P(JESUS, { robe: "#FFFFFF", mantle: "#FFFFFF", sash: "#FFF2C0", arms: "out" }), 0, -24);
      S.glow(0, 1.2, -24, 12, GLOW_WHITE, true);
      S.person({ robe: "#C9A15E", mantle: "#8A5C30", hair: "#E8E8E8", beard: "#E8E8E8" }, -2.6, -23.6, S.face(-2.6, -23.6, 0, -24));      // Moses
      S.person({ robe: "#8A6B47", sash: "#5A3A22", hair: "#3A2A1E", beard: "#3A2A1E" }, 2.6, -23.6, S.face(2.6, -23.6, 0, -24));       // Elijah
      [[-5, -21.6], [-6.2, -23], [5.4, -21.8]].forEach(([x, z], k) => S.person(P(disciple([0, 4, 5][k]), { pose: "kneel", arms: "pray" }), x, z, S.face(x, z, 0, -24)));
      const cl = cloudPuff(6, 3.2, 0.7); S.add(cl, 0, -27, 0, 7.5);
      const y0 = cl.position.y; S.anim(t => { cl.position.y = y0 + Math.sin(t * 0.8) * 0.4; });
    },
    greatest(S) {
      S.sign("Galilee");
      S.bake(roundTree(1.5), 0, -7);
      S.person(P(JESUS, { pose: "seated", arms: "out" }), 0, -3, 0, 0.5);
      S.bake(rockShape(0.9, "#A49C90"), 0, -3.4);
      S.faceP({ robe: "#F2C14E", hair: "#3A2A1E", size: 0.62, skin: "#D49A6A", arms: "wave" }, 0, -0.6, 0, 3);
      for (let k = 0; k < 8; k++) { const a = -1.9 + k * 0.54, x = Math.sin(a) * 4, z = -1.6 + Math.cos(a) * 3.4; S.faceP(P(disciple(k), { pose: k % 3 ? "stand" : "seated" }), x, z, 0, -0.6); }
      S.houses([[-12, -8, 4, 4, 3], [12, -9, 4.5, 4, 3]]);
    },
    bethany(S) {
      S.sign("Bethany");
      S.bake(room(9, 6.4, 3.6), 0, -3);
      S.bake(table(4, 0.45), 0, -4.6);
      for (let k = 0; k < 4; k++) S.bake(bread(), -1.5 + k, -4.6, 0, 0.55);
      S.person(P(JESUS, { pose: "seated", arms: "out" }), -1.6, -3.2, Math.PI / 2 - 0.3, 0.3);
      S.person({ robe: "#B07CC6", hood: "#7D4E9A", pose: "kneel", arms: "pray", skin: "#D49A6A", holds: "jar" }, 0, -2.6, -Math.PI / 2 - 0.3);
      S.faceP({ robe: "#E08A4F", hood: "#B5582E", apron: "#FFF6E5", holds: "bread", arms: "hold", skin: "#C68B59" }, 2.6, -2.2, -1.6, -3.2);
      S.person({ robe: "#8FA6C9", hair: "#3A2A1E", beard: "#3A2A1E", pose: "seated", arms: "out" }, 1.4, -5.4, 0.3, 0.3);     // Lazarus
      S.person(P(disciple(5), { pose: "seated" }), -1.2, -5.6, -0.2, 0.3);
      S.glow(-3, 2.6, -5.2, 3); S.glow(3, 2.6, -5.2, 3);
      S.houses([[-13, -6, 4, 4, 3], [12, -7, 4.5, 4, 3]]); S.trees([[-9, 4, 1], [9, 5, 1.1]], olive);
    },
    entry(S) {
      S.sign("Jerusalem");
      S.bake(gate(), 0, -22);
      [-1, 1].forEach(s => S.bake(wallSeg(26), s * 18, -22));
      S.bake(quad(DONKEY), 0, -6, Math.PI / 2 + 0.2);
      S.person(P(JESUS, { pose: "seated", arms: "out" }), 0, -6, Math.PI / 2 + 0.2, 1.15);
      for (let k = 0; k < 7; k++) S.bake(part(G.box, ROBES[k], 0, 0.06, 0, 1.6, 0.06, 1, 0, rr(-0.4, 0.4), 0), -9 + k * 2.6, -6.2 + rr(-0.6, 0.6));
      for (let k = 0; k < 8; k++) S.bake(sm(G.s8, "#5BAA45", 0, 0.08, 0, 0.5, 0.06, 1.4, 0, rr(0, 3), 0), -10 + k * 2.6, -5 + rr(-0.6, 0.6));
      S.crowd(9, 0, -6, 3.2, 4.5, 0, -6, { seed: 13, a0: -2.6, a1: -0.6, o: { holds: "branch", arms: "oneUp" } });
      S.crowd(9, 0, -6, 3.2, 4.5, 0, -6, { seed: 21, a0: 0.6, a1: 2.6, o: { holds: "branch", arms: "oneUp" } });
      S.trees([[-14, -12, 1], [14, -12, 1.1]], roundTree);
    },
    "temple-teaching"(S) {
      S.sign("Jerusalem Temple");
      S.bake(temple(), 0, -12);
      S.person(P(JESUS, { pose: "seated", arms: "out" }), 0, -2, 0, 0.8);
      S.faceP(P(PRIEST, { arms: "out" }), -3, -0.4, 0, -2); S.faceP(P(PRIEST, { mantle: "#8A3A3A", arms: "hips" }), -4.2, -1.6, 0, -2);
      S.faceP(P(PRIEST, { mantle: "#3A7A5A" }), -2.6, -2.6, 0, -2);
      S.crowd(8, 0, -2, 3.8, 6, 0, -2, { seed: 17, a0: 0.4, a1: 2.2, pose: "seated" });
    },
    "last-supper"(S) {
      S.sign("Upper Room");
      const h = new THREE.Group(), wall = "#E8CDA0";
      h.add(part(G.box, wall, 0, 1.6, -3, 11, 3.2, 6)); h.add(part(G.box, "#D9C29A", 0, 3.3, 0, 11.4, 0.25, 7));
      h.add(part(G.box, wall, 0, 5, -3.4, 11, 3.4, 0.4)); [-1, 1].forEach(s => h.add(part(G.box, wall, s * 5.5, 5, -0.2, 0.4, 3.4, 6.8))); h.add(part(G.box, "#D4B07A", 0, 6.8, -0.4, 11.8, 0.3, 7.4));
      for (let k = 0; k < 6; k++) h.add(part(G.box, wall, 6.3, 0.3 + k * 0.55, 3 - k * 0.6, 1.2, 0.6, 0.7));
      S.bake(h, 0, -3);
      const fy = S.y(0, -3) + 3.42;
      S.bake(table(7, 0.5), 0, -3.6, 0, 0, fy);
      [-2.5, -1, 1, 2.5].forEach(x => S.bake(bread(), x, -3.6, 0, 0, fy + 0.62)); S.bake(part(G.cylS, "#C9A15E", 0, 0, 0, 0.18, 0.24, 0.18), 0.4, -3.4, 0, 0, fy + 0.68);
      S.person(P(JESUS, { pose: "seated", holds: "bread", arms: "hold" }), 0, -4.5, 0, 0, fy);
      for (let k = 0; k < 12; k++) { const side = k < 6 ? -1 : 1, j = k % 6, x = side * (0.9 + j * 0.85), z = j < 4 ? -4.5 : -2.6; S.person(P(disciple(k), { pose: "seated" }), x, z, z > -3 ? Math.PI : 0, 0, fy); }
      S.glow(-3.5, 6.2, -5, 3); S.glow(3.5, 6.2, -5, 3);
    },
    gethsemane(S) {
      S.sign("Gethsemane");
      [[-6, -6, 1.2], [6, -7, 1.3], [-9, 1, 1], [9, 0, 1.1], [0, -12, 1.3], [-12, -10, 1], [12, -12, 1.2]].forEach(([x, z, s]) => S.bake(olive(s), x, z, rand() * 6));
      S.bake(rockShape(1.3, "#A49C90"), 0, -3.2);
      S.person(P(JESUS, { pose: "kneel", arms: "pray" }), 0, -1.8, Math.PI);
      [[-3.4, 1.4, 0.4], [3, 1.8, -0.5], [-0.6, 3, 1.2]].forEach(([x, z, r], k) => S.person(P(disciple([0, 4, 5][k]), { pose: "lying" }), x, z, r));
      S.glow(0, 1.2, -1.8, 4, GLOW_WHITE);
    },
    trial(S) {
      S.sign("Jerusalem");
      [-1, 1].forEach(s => S.bake(wallSeg(10, 4), s * 7, -9));
      S.bake(part(G.box, "#C9B48A", 0, 0.4, 0, 4, 0.8, 3), 0, -6.5);
      S.person(P(PRIEST, { mantle: "#3A4FA0", breast: "#E8B84A", pose: "seated", arms: "out" }), 0, -6.6, 0, 0.8);
      S.faceP(P(JESUS, { arms: "hold" }), 0, -2.4, 0, -6.6);
      S.faceP(P(SOLDIER), -1.6, -1.6, 0, -6.6); S.faceP(P(SOLDIER), 1.6, -1.6, 0, -6.6);
      for (let k = 0; k < 6; k++) S.faceP(P(PRIEST, { mantle: ROBES[k + 2], pose: "seated", turban: k % 2 ? "#FFFFFF" : null, hair: k % 2 ? null : "#6A6A6A" }), (k < 3 ? -1 : 1) * (4 + (k % 3) * 1.4), -4.5 + (k % 3) * 1.2, 0, -2.4);
      S.bake(fire(), 6, 2); S.glow(6, 1, 2, 5, GLOW_FIRE); S.flame(6, 2, 0.7);
      S.faceP(P(PETER, { pose: "seated" }), 7.4, 2.8, 6, 2);
    },
    golgotha(S) {
      S.sign("Golgotha");
      [-4, 0, 4].forEach((x, k) => S.bake(cross(k === 1 ? 6 : 5), x, -16));
      S.faceP(P(MARY, { arms: "pray" }), -1.2, 2.2, 0, -16);
      S.faceP({ robe: "#C98B6B", hair: "#5A3A22", skin: "#D49A6A" }, 0.2, 2.4, 0, -16);
      S.faceP({ robe: "#D98F8F", hood: "#9A4A5A", arms: "pray" }, -2.6, 2.8, 0, -16);
      S.faceP({ robe: "#C9A1D9", hood: "#7D4E9A" }, 1.6, 3, 0, -16);
      S.faceP(P(SOLDIER), -6, -10, 0, -16); S.faceP(P(SOLDIER, { holds: null, arms: "pray" }), 4.6, -9.4, 0, -16);
    },
    tomb(S) {
      S.sign("The Garden Tomb", -13, 5);
      S.bake(tombRock(), 0, -7);
      const closed = S.add(roundStone(), 0, -5.75);
      const guards = [-2.6, 2.6].map(x => S.add(person(P(SOLDIER)), x, -4.4, 0));
      const open = S.add(roundStone(), 3.4, -4.6, 0.25);
      const ang = angelFigure(); S.add(ang, 3.4, -4.6, S.face(3.4, -4.6, 0, 2), 2.6);
      const fallen = [0, 1].map(k => S.add(person(P(SOLDIER, { pose: "lying" })), k ? 5.6 : -3.4, -2.6 + k, k ? 2 : -1.2));
      const women = [{ robe: "#D98F8F", hood: "#9A4A5A" }, { robe: "#C9A1D9", hood: "#7D4E9A" }];
      const sitting = women.map((o, k) => S.add(person(P(o, { pose: "seated" })), -3 + k * 1.4, 1.6, S.face(-3 + k * 1.4, 1.6, 0, -6)));
      const running = women.map((o, k) => S.add(person(P(o, { arms: k ? "out" : "up" })), -1.2 + k * 1.6, 0.4, S.face(0, 0.4, 0, -6)));
      const tombIdx = STOPS.findIndex(s => s.id === "tomb");
      toggles.push(i => {
        const before = i <= tombIdx;
        [closed, ...guards, ...sitting].forEach(o => { o.visible = before; });
        [open, ang, ...fallen, ...running].forEach(o => { o.visible = !before; });
      });
      S.trees([[-10, -4, 1], [10, -5, 1.2], [-12, 4, 0.9]], olive);
      for (let k = 0; k < 14; k++) S.bake(flower(), rr(-9, 9), rr(0, 6));
    },
    "empty-tomb"() { /* the same garden as "tomb": the stone is rolled away when you arrive */ },
    emmaus(S) {
      S.sign("Emmaus");
      [[-1.4, -2.4], [0, -2], [1.4, -2.4]].forEach(([x, z], k) => S.person(k === 1 ? P(JESUS, { arms: "out" }) : P(villager(k + 30), { hood: null, hair: HAIR[k], beard: HAIR[k + 1] }), x, z, S.face(x, z, x + 5, z + 0.5) + (k === 1 ? -0.4 : 0)));
      S.houses([[10, -10, 5, 4.5, 3.2], [16, -4, 4, 4, 3], [4, -16, 4.5, 4, 3]]);
      S.bake(table(2.4, 0.6), 10, -5.5); S.bake(bread(), 10, -5.5, 0, 0.72);
      S.glow(10, 2, -7.6, 3);
      S.trees([[-8, -8, 1.1], [-12, 2, 1]], olive);
    },
    appears(S) {
      S.sign("Jerusalem");
      S.bake(room(10, 6.4, 3.6), 0, -3);
      S.glowPerson(P(JESUS, { arms: "out" }), 0, -3.2); S.glow(0, 1.2, -3.2, 6, GLOW_WHITE, true);
      for (let k = 0; k < 10; k++) { const a = -2.2 + k * 0.49, x = Math.sin(a) * 3.2, z = -3.2 + Math.cos(a) * 2.6; S.faceP(P(disciple(k), { arms: k % 3 ? "down" : "up" }), x, z, 0, -3.2); }
      S.bake(table(1.6, 0.6), 2.4, -5.2); S.bake(fish("#C9C4B8"), 2.4, -5.2, 0, 0.75);
      S.glow(-4, 2.8, -5, 3); S.glow(4, 2.8, -5, 3);
    },
    breakfast(S) {
      S.sign("Sea of Galilee");
      const b = boat(); S.add(b, 6, -16, 0.8, 0, -1.25);
      for (let k = 0; k < 3; k++) { const p = person(P(disciple(k + 2), { pose: "seated", arms: "hold" })); p.position.set(0, 0.55, -1.5 + k * 1.3); b.add(p); }
      const net = new THREE.Group(); net.add(part(G.box, "#C9B48A", 0, 0, 0, 2.6, 0.3, 2.2));
      for (let k = 0; k < 12; k++) { const fsh = fish(pick(["#A9C4D6", "#C9C4B8"])); fsh.position.set(rr(-1, 1), 0.2, rr(-0.8, 0.8)); fsh.rotation.y = rand() * 6; net.add(fsh); }
      S.add(net, 3.4, -13.2, 0, 0, -0.8);
      S.bake(fire(), -1, -2); S.glow(-1, 1, -2, 4, GLOW_FIRE); S.flame(-1, -2, 0.7, 0.9);
      for (let k = 0; k < 3; k++) S.bake(fish("#C9935A"), -1.4 + k * 0.4, -2.4, 0, 0.4);
      S.bake(bread(), -0.2, -1.4, 0, 0.3);
      S.faceP(P(JESUS, { arms: "out" }), -2.8, -3, 3.4, -10);
      S.faceP(P(PETER, { arms: "up" }), 1.6, -6.4, -2.8, -3);
      S.anim(t => { b.rotation.z = Math.sin(t) * 0.04; });
    },
    commission(S) {
      S.sign("Galilee Mountain");
      S.person(P(JESUS, { arms: "up" }), 0, -25);
      S.glow(0, 1.5, -25, 9, GLOW_WHITE, true);
      for (let k = 0; k < 11; k++) { const a = -2.4 + k * 0.48, x = Math.sin(a) * 3.8, z = -25 + Math.cos(a) * 2.2; S.faceP(P(disciple(k), { pose: z > -24 ? "kneel" : "stand", arms: k % 2 ? "pray" : "down" }), x, z, 0, -25); }
      S.trees([[-14, -10, 1], [14, -12, 1.1]], roundTree);
    },
    ascension(S) {
      S.sign("Mount of Olives");
      const j = S.glowPerson(P(JESUS, { arms: "up" }), 0, -24, 0, 7);
      const cl = cloudPuff(5, 2.2, 0.5); S.add(cl, 0, -24, 0, 6.6);
      const y0 = j.position.y, c0 = cl.position.y;
      S.anim(t => { const k = Math.sin(t * 0.6) * 0.5; j.position.y = y0 + k; cl.position.y = c0 + k; });
      S.glow(0, 9, -24, 12, GLOW_WHITE, true);
      for (let k = 0; k < 11; k++) { const a = -1.7 + k * 0.34, x = Math.sin(a) * 6, z = -24 + Math.cos(a) * 5; S.faceP(P(disciple(k), { arms: k % 3 ? "up" : "down" }), x, z, 0, -24); }
      S.faceP({ robe: "#FFFFFF", hair: "#F2D27A", arms: "out" }, -2.2, -16, 0, -14); S.faceP({ robe: "#FFFFFF", hair: "#F2D27A", arms: "out" }, 2.2, -16, 0, -14);
      [[-12, -20, 1.1], [12, -22, 1], [-9, -32, 1.2], [9, -33, 1]].forEach(([x, z, s]) => S.bake(olive(s), x, z, rand() * 6));
    },
    pentecost(S) {
      S.sign("Jerusalem");
      S.bake(room(11, 6.4, 3.8), 0, -3);
      for (let k = 0; k < 12; k++) {
        const x = -4.2 + (k % 6) * 1.7, z = k < 6 ? -5.4 : -3.2, o = k === 11 ? P(MARY, { pose: "seated", arms: "up" }) : P(disciple(k), { pose: "seated", arms: k % 2 ? "up" : "pray" });
        S.person(o, x, z, 0);
        S.flame(x, z, 1.75, 0.3); S.glow(x, 1.75, z, 1.2, GLOW_FIRE, true);
      }
      S.houses([[-14, -6, 4, 4, 3.2], [14, -6, 4, 4, 3]]);
    },
    "peter-preaches"(S) {
      S.sign("Jerusalem");
      [-1, 1].forEach(s => S.bake(wallSeg(14, 5), s * 10, -14));
      for (let k = 0; k < 3; k++) S.bake(part(G.box, "#E2D6BC", 0, 0.2 + k * 0.4, 0, 6 - k * 1.2, 0.4, 3 - k * 0.6), -4, -6);
      S.person(P(PETER, { arms: "oneUp" }), -4, -6, 0, 1.2);
      for (let k = 0; k < 4; k++) S.person(disciple(k + 2), -6.4 + k * 1.6, -8, 0, 0.8);
      S.crowd(14, -4, -6, 4, 8, -4, -6, { seed: 31, a0: -0.9, a1: 1.6 });
      S.faceP(disciple(6), 12, -9.6, 12, -6);
      S.person(villager(40), 12, -6.4, 0, 0, -1.55);
      S.person(P(disciple(7), { arms: "out" }), 13.6, -5.2, S.face(13.6, -5.2, 12, -6.4), 0, -1.45);
    },
    damascus(S) {
      S.sign("Road to Damascus");
      S.bake(gate("#E2D2AC"), 0, -60); [-1, 1].forEach(s => S.bake(wallSeg(30, 6, "#E2D2AC"), s * 20, -60));
      S.person({ robe: "#5A6E9E", mantle: "#8A3A3A", hair: "#3A2A1E", beard: "#3A2A1E", pose: "lying" }, 0, -2, 0.4);
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 4.5, 40, 20, 1, true), new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.32, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
      S.add(beam, 0, -1.4, 0, 18);
      S.glow(0, 1.5, -1.4, 14, GLOW_WHITE, true);
      S.anim(t => { beam.material.opacity = 0.26 + Math.sin(t * 2) * 0.08; });
      S.faceP(P(villager(50), { arms: "up" }), -3, 0.6, 0, -1); S.faceP(P(villager(51), { arms: "out" }), 3.2, 0.4, 0, -1); S.faceP(villager(52), 4.2, -2, 0, -1);
      S.bake(quad(DONKEY), -6, -3, 1);
    }
  };

  /* ================= WALKING ================= */
  const LOOKS = { transfiguration: [0, 1.4, -23], commission: [0, 1.4, -24], ascension: [0, 5, -22], golgotha: [0, 2.5, -14], "water-walk": [0, 0, -16, true], storm: [0, 0.5, -14, true], damascus: [0, 1, -2], "galilee-call": [1, 0.6, -8], jordan: [0, 0.2, -8, true], egypt: [0, 1.5, -4], "last-supper": [0, 4.2, -4], feeding: [0, 1.4, -4], entry: [0, 1.6, -7], tomb: [0, 1.6, -4], "empty-tomb": [0, 1.6, -4] };
  // gentle zoom when arriving at scenes that are further away (1 = no zoom)
  const ZOOM = { jordan: 0.6, transfiguration: 0.5, commission: 0.5, ascension: 0.7, storm: 0.5, "water-walk": 0.62, "galilee-call": 0.75, golgotha: 0.75, breakfast: 0.75, "last-supper": 0.8, feeding: 0.8, gadara: 0.8 };
  let zoomNow = 1;
  const stops = STOPS.map((s, i) => {
    const f = frames[i], L = LOOKS[s.id] || [0, 1.2, -1.5], w = W(f, L[0], L[2]);
    return Object.assign({}, s, { u: f.u, zoom: ZOOM[s.id] || 1, look: new THREE.Vector3(w.x, L[3] ? L[1] : height(w.x, w.z) + L[1], w.z), chapter: CHAPTERS.filter(c => c.from <= i + 1).pop() });
  });
  const state = { u: 0, stop: -1, next: 0, mode: "loading", speed: 0, phase: 0, yaw: 0, pitch: 0, yawOff: 0, pitchOff: 0, first: true };
  const v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), lookV = new THREE.Vector3();
  function eyeAt(u, out) { curve.getPointAt(Math.min(1, Math.max(0, u)), out); out.y = height(out.x, out.z) + 0.22 + WALK.eye; return out; }
  const moving = () => state.mode === "walking" || state.mode === "paused";
  function focusIndex() { return moving() ? state.next : Math.max(0, state.stop); }
  function desiredAngles() {
    eyeAt(state.u, v1);
    const ahead = Math.min(1, state.u + 10 / ROAD_LEN);
    if (ahead - state.u > 1e-5) eyeAt(ahead, v2); else { curve.getTangentAt(1, v2); v2.multiplyScalar(10).add(v1); }
    v2.y -= 0.25;
    const fs = stops[moving() ? state.next : state.stop];
    zoomTarget = 1;
    if (fs) { const dist = Math.abs(fs.u - state.u) * ROAD_LEN, k = 1 - smooth(1, 16, dist); v2.lerp(fs.look, k); zoomTarget = 1 + (fs.zoom - 1) * k; }
    lookV.subVectors(v2, v1).normalize();
    return { yaw: Math.atan2(lookV.x, lookV.z), pitch: Math.asin(Math.max(-1, Math.min(1, lookV.y))) };
  }
  let zoomTarget = 1;
  function updateCamera(dt, snap) {
    const d = desiredAngles(), k = snap ? 1 : 1 - Math.exp(-dt * 4);
    zoomNow += (zoomTarget - zoomNow) * (snap ? 1 : 1 - Math.exp(-dt * 2));
    const fov = baseFov * zoomNow; if (Math.abs(camera.fov - fov) > 0.01) { camera.fov = fov; camera.updateProjectionMatrix(); }
    state.yaw += wrapA(d.yaw - state.yaw) * k; state.pitch += (d.pitch - state.pitch) * k;
    eyeAt(state.u, v1);
    if (state.mode === "walking" && !reduceMotion) v1.y += Math.sin(state.phase) * WALK.bob;
    camera.position.copy(v1);
    const yaw = state.yaw + state.yawOff, pitch = Math.max(-0.7, Math.min(0.75, state.pitch + state.pitchOff));
    camera.lookAt(v1.x + Math.sin(yaw) * Math.cos(pitch), v1.y + Math.sin(pitch), v1.z + Math.cos(yaw) * Math.cos(pitch));
  }
  function applyToggles() { const i = focusIndex(); toggles.forEach(fn => fn(i)); }

  /* time of day blends between stops */
  const moodNow = {}, cA = new THREE.Color(), cB = new THREE.Color();
  function moodAt() {
    let a, b, k = 0;
    if (moving()) {
      const from = Math.max(0, state.next - 1), uA = state.next > 0 ? stops[from].u : 0, uB = stops[state.next].u;
      a = MOODS[stops[from].mood]; b = MOODS[stops[state.next].mood]; k = smooth(0.2, 0.85, (state.u - uA) / Math.max(1e-6, uB - uA));
    } else a = b = MOODS[stops[Math.max(0, state.stop)].mood];
    for (const key in a) moodNow[key] = typeof a[key] === "number" ? a[key] + (b[key] - a[key]) * k : cA.set(a[key]).lerp(cB.set(b[key]), k).getHex();
    return moodNow;
  }
  // rain for the storm
  const rainGeo = new THREE.BufferGeometry(), rp = new Float32Array(600 * 6);
  for (let i = 0; i < 600; i++) { const x = rr(-30, 30), y = rr(0, 25), z = rr(-30, 30); rp.set([x, y, z, x + 0.15, y - 0.9, z], i * 6); }
  rainGeo.setAttribute("position", new THREE.BufferAttribute(rp, 3));
  const rain = new THREE.LineSegments(rainGeo, new THREE.LineBasicMaterial({ color: 0xB9C6D6, transparent: true, opacity: 0.6 }));
  rain.visible = false; rain.frustumCulled = false; scene.add(rain);
  let flash = 0;
  function applyMood(t) {
    const m = moodAt();
    skyUni.top.value.setHex(m.top); skyUni.hor.value.setHex(m.hor); scene.fog.color.setHex(m.hor);
    sun.color.setHex(m.sunCol); sun.intensity = m.sun; hemi.color.setHex(m.sky); hemi.groundColor.setHex(m.ground);
    const fs = stops[focusIndex()], stormy = state.mode !== "intro" && fs.mood === "storm" && Math.abs(fs.u - state.u) * ROAD_LEN < 60;
    if (stormy && !reduceMotion && Math.random() < 0.004) flash = 1;
    flash *= 0.85;
    hemi.intensity = m.hemi + flash * 2.5;
    stars.material.opacity = m.stars;
    cloudMat.color.setHex(m.cloud); cloudMat.emissive.setHex(m.cloud);
    sunSprite.material.color.setHex(m.sunCol);
    lamps.forEach(l => { l.s.material.opacity = l.always ? 1 : 0.15 + m.glow * 0.85; });
    rain.visible = stormy;
    if (stormy) rain.position.set(camera.position.x, camera.position.y - 4 - (t * 30) % 4, camera.position.z);
  }

  /* ================= UI ================= */
  const box = $("[data-jw-box]"), boxBody = $("[data-jw-box-body]");
  const fwdBtn = $("[data-jw-forward]"), backBtn = $("[data-jw-back]"), reopen = $("[data-jw-reopen]");
  const fader = $("[data-jw-fade]"), fadeText = $("[data-jw-fade-text]");
  const SAVE_KEY = "bibleBuddies.journey.v2";
  const saved = (() => { try { return Number(localStorage.getItem(SAVE_KEY)) || 0; } catch (e) { return 0; } })();
  const save = i => { try { localStorage.setItem(SAVE_KEY, String(i)); } catch (e) {} };
  let boxSpeak = "";
  const setStatus = t => { statusEl.textContent = t; };
  function showBox(o) {
    boxSpeak = o.speak || "";
    boxBody.innerHTML = `
      ${o.chapter ? `<p class="jw-chapter">${o.chapter}</p>` : ""}
      <div class="jw-box-emoji" aria-hidden="true">${o.emoji}</div>
      <h2 id="jw-box-title">${o.title}</h2>
      ${o.ref ? `<p class="jw-ref">📖 ${o.ref}</p>` : ""}
      ${o.html}
      <div class="jw-box-btns">
        <button type="button" class="btn btn-ghost" data-jw-listen>🔊 Listen</button>
        <button type="button" class="btn btn-primary" data-jw-continue>${o.primary}</button>
        ${o.extra || ""}
      </div>`;
    boxBody.querySelector("[data-jw-listen]").addEventListener("click", () => typeof speakText === "function" && speakText(boxSpeak));
    boxBody.querySelector("[data-jw-continue]").addEventListener("click", forward);
    const ex = boxBody.querySelector("[data-jw-extra]"); if (ex && o.onExtra) ex.addEventListener("click", o.onExtra);
    box.hidden = false; reopen.hidden = true; requestAnimationFrame(() => box.classList.add("show")); boxBody.scrollTop = 0;
  }
  function hideBox(keepReopen) {
    box.classList.remove("show"); box.hidden = true;
    reopen.hidden = !(keepReopen && (state.mode === "atStop" || state.mode === "done"));
    if (typeof bbStopSpeaking === "function") bbStopSpeaking(); else if ("speechSynthesis" in window) speechSynthesis.cancel();
  }
  function showStop(i) {
    const s = stops[i], last = i === stops.length - 1;
    showBox({
      chapter: `Stop ${i + 1} of ${stops.length} · ${s.chapter.title}`, emoji: s.emoji, title: `${s.place}: ${s.title}`, ref: s.ref,
      html: s.paragraphs.map(p => `<p>${p}</p>`).join("") + `<p class="jw-verse">“${s.verse.text}”<span>${s.verse.ref}</span></p>`,
      speak: `${s.place}. ${s.title}. ` + s.paragraphs.map(p => p.replace(/\s*\([^)]*\)\s*$/, "")).join(" ") + ` ${s.verse.text}`,
      primary: last ? "Finish the journey ▶" : `Walk to ${stops[i + 1].place} ▶`,
      extra: typeof bbShare === "function" ? `<button type="button" class="btn btn-grape" data-jw-extra title="Grown-ups: share this stop">📤 Share</button>` : "",
      onExtra: () => bbShare({ url: stopUrl(i), title: `${s.place}: ${s.title} | Journey with Jesus`, text: `Walk with Jesus to ${s.place} (${s.ref}) in this free 3D Bible walk for kids!` })
    });
  }
  function stopUrl(i) { return (typeof SITE_URL !== "undefined" ? SITE_URL : location.href.split("#")[0].replace(/[^/]*$/, "")) + "meet-jesus.html#stop-" + (i + 1); }
  function showIntro() {
    setStatus("Ready to walk");
    const cont = saved > 0 && saved < stops.length;
    showBox({
      emoji: "🚶", title: "Journey with Jesus",
      html: `<p>Walk along the road through ${stops.length} places from Jesus' life, from Nazareth and Bethlehem to the very first Christians. Press <strong>Forward ▶</strong> to start walking. When you arrive, read what happened there.</p>
             <p class="jw-tip">Tip: drag the picture to look around. Tap ☰ Stops to jump to any place.</p>`,
      speak: `Journey with Jesus. Walk through ${stops.length} places from Jesus' life. Press Forward to start walking.`,
      primary: `Start at ${stops[0].place} ▶`,
      extra: cont ? `<button type="button" class="btn btn-sky" data-jw-extra>Continue at stop ${saved + 1} ▶</button>` : "",
      onExtra: () => goToStop(saved)
    });
  }
  function updateButtons() {
    const walking = state.mode === "walking";
    fwdBtn.innerHTML = walking ? "⏸ Pause" : state.mode === "paused" ? "▶ Keep walking" : state.mode === "done" ? "↺ Walk again" : "Forward ▶";
    fwdBtn.setAttribute("aria-label", walking ? "Pause walking" : "Walk forward");
    backBtn.disabled = state.mode === "intro" || state.mode === "loading";
    fwdBtn.disabled = state.mode === "loading";
  }
  const ticksEl = $("[data-jw-ticks]"), walker = $("[data-jw-walker]");
  ticksEl.innerHTML = stops.map((s, i) => `<span class="jw-tick" style="left:${(s.u * 100).toFixed(2)}%" title="${i + 1}. ${s.place}"></span>`).join("");
  const tickEls = [...ticksEl.children];
  function updateProgress() { tickEls.forEach((t, i) => { t.classList.toggle("done", i <= state.stop || state.mode === "done"); t.classList.toggle("current", i === state.stop && state.mode === "atStop"); }); }

  function walkTo(i) {
    const s = stops[i];
    if (s.travel === "fade") { hideBox(); fadeJump(s.u, () => arrive(i), s.travelText); return; }
    state.next = i; state.mode = "walking"; state.speed = 0;
    hideBox(); setStatus(`Walking to ${s.place}…`); updateButtons(); updateProgress(); applyToggles();
    if (reduceMotion) fadeJump(s.u, () => arrive(i));
  }
  function arrive(i) {
    state.u = stops[i].u; state.stop = i; state.next = i; state.mode = "atStop"; state.speed = 0;
    setStatus(`📍 ${i + 1} of ${stops.length} · ${stops[i].place}`);
    applyToggles(); showStop(i); updateButtons(); updateProgress(); save(i);
    try { history.replaceState(null, "", "#stop-" + (i + 1)); } catch (e) {}
    if (typeof bbAddStars === "function") bbAddStars(1, "journey-" + stops[i].id);
  }
  function forward() {
    if (state.mode === "loading") return;
    if (state.mode === "walking") { state.mode = "paused"; setStatus("Paused. Press ▶ to keep walking."); updateButtons(); return; }
    if (state.mode === "paused") { state.mode = "walking"; setStatus(`Walking to ${stops[state.next].place}…`); updateButtons(); return; }
    if (state.mode === "done") { restart(); return; }
    const n = state.stop + 1;
    if (n < stops.length) walkTo(n); else finish();
  }
  function back() {
    if (state.mode === "loading" || state.mode === "intro") return;
    let i = moving() ? state.next - 1 : state.stop - 1;
    if (state.mode === "done") i = stops.length - 1;
    if (i < 0) { restart(); return; }
    fadeJump(stops[i].u, () => arrive(i));
  }
  function goToStop(i) { hideBox(); closePanel(); fadeJump(stops[i].u, () => arrive(i)); }
  function restart() { try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {} fadeJump(0, () => { state.u = 0; state.stop = -1; state.next = 0; state.mode = "intro"; applyToggles(); showIntro(); updateButtons(); updateProgress(); }); }
  function finish() {
    state.mode = "done"; setStatus("🎉 Journey complete!"); save(0);
    showBox({
      emoji: "🎉", title: "You finished the journey!",
      html: `<p>You walked with Jesus through ${stops.length} places: His birth, His teaching and miracles, His death and resurrection, all the way to the first Christians sharing the Good News.</p>
             <p class="jw-verse">“Jesus Christ is the same yesterday, today, and forever.”<span>Hebrews 13:8</span></p>`,
      speak: "You finished the journey! You walked with Jesus from His birth all the way to the first Christians sharing the good news. Jesus Christ is the same yesterday, today, and forever.",
      primary: "Walk again ↺",
      extra: typeof bbShare === "function" ? `<button type="button" class="btn btn-grape" data-jw-extra>📤 Share the journey</button>` : "",
      onExtra: () => bbShare({ url: stopUrl(0).replace(/#stop-1$/, "#walk"), title: "Journey with Jesus: a free 3D Bible walk for kids", text: `I walked with Jesus through ${stops.length} places from the Bible! Try this free 3D walk for kids:` })
    });
    updateButtons(); updateProgress();
    if (typeof bbAddStars === "function") bbAddStars(2, "journey-complete");
    if (typeof bbCelebrate === "function") bbCelebrate();
  }
  function fadeJump(u, then, text) {
    fadeText.textContent = text || ""; fader.classList.add("on");
    setTimeout(() => {
      state.u = u; state.yawOff = state.pitchOff = 0; then && then(); updateCamera(0, true);
      setTimeout(() => fader.classList.remove("on"), text ? 1600 : 0);
    }, 420);
  }

  /* stops panel */
  const panel = $("[data-jw-panel]"), panelList = $("[data-jw-panel-list]");
  panelList.innerHTML = CHAPTERS.map((c, ci) => {
    const end = (CHAPTERS[ci + 1] ? CHAPTERS[ci + 1].from : stops.length + 1) - 1;
    return `<li class="jw-panel-ch">${c.title}</li>` + stops.slice(c.from - 1, end).map((s, k) => { const i = c.from - 1 + k; return `<li><button type="button" data-jw-go="${i}"><span>${i + 1}</span> ${s.emoji} ${s.place}: ${s.title}</button></li>`; }).join("");
  }).join("");
  panelList.querySelectorAll("[data-jw-go]").forEach(b => b.addEventListener("click", () => { if (state.mode !== "loading") goToStop(Number(b.dataset.jwGo)); }));
  function closePanel() { panel.hidden = true; }
  $("[data-jw-stops]").addEventListener("click", () => { panel.hidden = !panel.hidden; if (!panel.hidden) { const cur = panelList.querySelector(`[data-jw-go="${Math.max(0, state.stop)}"]`); cur && cur.scrollIntoView({ block: "center" }); } });
  $("[data-jw-panel-close]").addEventListener("click", closePanel);

  fwdBtn.addEventListener("click", forward);
  backBtn.addEventListener("click", back);
  $("[data-jw-close]").addEventListener("click", () => hideBox(true));
  reopen.addEventListener("click", () => { if (state.mode === "done") finish(); else showStop(state.stop); });
  document.querySelectorAll("[data-jw-goto]").forEach(b => b.addEventListener("click", () => {
    stage.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    if (state.mode !== "loading") goToStop(Number(b.dataset.jwGoto));
  }));
  const fsBtn = $("[data-jw-fullscreen]");
  if (!stage.requestFullscreen) fsBtn.hidden = true;
  fsBtn.addEventListener("click", () => document.fullscreenElement ? document.exitFullscreen() : stage.requestFullscreen().catch(() => {}));
  document.addEventListener("fullscreenchange", () => { fsBtn.textContent = document.fullscreenElement ? "✕ Exit" : "⛶ Full screen"; resize(); });

  const hint = $("[data-jw-hint]");
  let drag = null;
  renderer.domElement.addEventListener("pointerdown", e => { drag = { x: e.clientX, y: e.clientY, yaw: state.yawOff, pitch: state.pitchOff }; renderer.domElement.setPointerCapture(e.pointerId); });
  renderer.domElement.addEventListener("pointermove", e => {
    if (!drag) return;
    const w = renderer.domElement.clientWidth || 1;
    state.yawOff = drag.yaw + (e.clientX - drag.x) / w * 2.6;
    state.pitchOff = Math.max(-0.6, Math.min(0.6, drag.pitch + (e.clientY - drag.y) / w * 1.6));
    if (hint) hint.classList.add("gone");
  });
  ["pointerup", "pointercancel"].forEach(t => renderer.domElement.addEventListener(t, () => { drag = null; }));
  stage.addEventListener("keydown", e => {
    if (e.target.closest("[data-jw-box], [data-jw-panel]") && e.key !== "Escape") return;
    if (e.key === "ArrowLeft") { state.yawOff += 0.15; e.preventDefault(); }
    else if (e.key === "ArrowRight") { state.yawOff -= 0.15; e.preventDefault(); }
    else if (e.key === "ArrowUp") { forward(); e.preventDefault(); }
    else if (e.key === "ArrowDown") { back(); e.preventDefault(); }
    else if (e.key === "Escape") { if (!panel.hidden) closePanel(); else if (!box.hidden) hideBox(true); }
  });

  let baseFov = 62;
  function resize() {
    const w = canvasWrap.clientWidth, h = canvasWrap.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; baseFov = w / h < 0.8 ? 75 : 62; camera.fov = baseFov * zoomNow; camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvasWrap); resize();
  let visible = true;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(stage);

  /* ================= LOOP ================= */
  const clock = new THREE.Clock();
  function loop() {
    requestAnimationFrame(loop);
    const dt = Math.min(clock.getDelta(), 0.1), t = clock.elapsedTime;
    if (!visible || document.hidden || state.mode === "loading") return;
    if (state.mode === "walking" && !reduceMotion) {
      const left = (stops[state.next].u - state.u) * ROAD_LEN;
      const vMax = Math.min(WALK.speed, Math.sqrt(2 * WALK.brake * Math.max(left, 0)) + 0.4);
      state.speed = Math.min(vMax, state.speed + WALK.accel * dt);
      state.u = Math.min(stops[state.next].u, state.u + state.speed * dt / ROAD_LEN);
      state.phase += state.speed * dt * 1.6;
      state.yawOff *= Math.exp(-dt * 2.5); state.pitchOff *= Math.exp(-dt * 2.5);
      if (stops[state.next].u - state.u < 0.02 / ROAD_LEN) arrive(state.next);
    }
    walker.style.left = (state.u * 100) + "%";
    updateCamera(dt, state.first); state.first = false;
    sky.position.copy(camera.position); stars.position.copy(camera.position);
    sunSprite.position.copy(camera.position).add(_v.copy(sun.position).normalize().multiplyScalar(VIEW * 0.85));
    applyMood(t);
    if (!reduceMotion) {
      const cx = camera.position.x, cz = camera.position.z;
      anims.forEach(a => { if ((a.x - cx) ** 2 + (a.z - cz) ** 2 < 170 * 170) a.fn(t, dt); });
      waters.forEach(wt => {
        if ((wt.x - cx) ** 2 + (wt.z - cz) ** 2 > 220 * 220) return;
        const Pa = wt.mesh.geometry.attributes.position, B = wt.base;
        for (let k = 0; k < Pa.count; k++) Pa.array[k * 3 + 1] = Math.sin(t * 1.6 + B[k * 3 + 2] * 0.35 + B[k * 3] * 0.2) * wt.amp;
        Pa.needsUpdate = true;
      });
      clouds.forEach((c, i) => { c.position.x += dt * (1 + i % 3); });
    }
    renderer.render(scene, camera);
  }

  /* ================= START ================= */
  updateButtons();
  build().then(ms => {
    state.mode = "intro"; applyToggles(); showIntro(); updateButtons(); updateProgress();
    stage.classList.add("ready");
    const m = location.hash.match(/^#stop-(\d+)$/), n = m ? Number(m[1]) : 0;   // shared link to a stop
    if (n >= 1 && n <= stops.length) goToStop(n - 1);
    window.__journey = { state, stops, ROAD_LEN, forward, back, goToStop, buildMs: ms, renderer, frames };
  }).catch(err => { console.error(err); showFallback(); });
  loop();

  /* ================= PAGE HELPERS ================= */
  function renderStopCards() {
    const wrap = document.querySelector("[data-jw-cards]"); if (!wrap) return;
    wrap.innerHTML = CHAPTERS.map((c, ci) => {
      const end = (CHAPTERS[ci + 1] ? CHAPTERS[ci + 1].from : STOPS.length + 1) - 1;
      return `<h3 class="jw-cards-ch">${c.title}</h3><div class="jw-cards">` + STOPS.slice(c.from - 1, end).map((s, k) => {
        const i = c.from - 1 + k;
        return `<button type="button" class="jw-card" data-jw-goto="${i}"><span class="jw-card-n">${i + 1}</span><span class="jw-card-e" aria-hidden="true">${s.emoji}</span><strong>${s.place}</strong><span>${s.title}</span><small>📖 ${s.ref}</small></button>`;
      }).join("") + `</div>`;
    }).join("");
  }
  function showFallback() {
    stage.classList.add("no3d");
    stage.innerHTML = `<div class="jw-fallback"><p class="notice">Your device can't show the 3D walk, but here is the whole journey!</p>
      ${STOPS.map((s, i) => `<article class="card" id="jw-stop-${i}"><div class="card-icon" aria-hidden="true">${s.emoji}</div><h3>Stop ${i + 1}: ${s.place}: ${s.title}</h3><p class="jw-ref">📖 ${s.ref}</p>${s.paragraphs.map(p => `<p>${p}</p>`).join("")}<p class="jw-verse">“${s.verse.text}”<span>${s.verse.ref}</span></p></article>`).join("")}</div>`;
    document.querySelectorAll("[data-jw-goto]").forEach(b => b.addEventListener("click", () => { const a = document.getElementById("jw-stop-" + b.dataset.jwGoto); a && a.scrollIntoView({ behavior: "smooth", block: "start" }); }));
  }
})();
