'use strict';
// ---------- Острова: органичные берега, размеры по схеме, рельеф, дикие земли, проходимость ----------
// Площади островов относятся как на схеме: Столица > Пепельный остров ≈ Зима > Джунгли > Пустыня ≈ Крепость.
const SHAPE = {
  capital: { W: 120, H: 104, ox: 28, oy: 28, p: 2.6, amp: 1, base: GR.GRASS },
  jungle: { W: 72, H: 58, ox: 4, oy: 1, p: 2.6, amp: 1, base: GR.JGRASS },
  fortress: { W: 56, H: 44, ox: 0, oy: 0, p: 5, amp: .6, base: GR.DSTONE, nat: [GR.DSTONE, GR.STONE] },
  desert: { W: 60, H: 44, ox: 0, oy: 0, p: 2.6, amp: 1, base: GR.SAND },
  winter: { W: 100, H: 70, ox: 20, oy: 14, p: 2.8, amp: 1, base: GR.SNOW },
  ash: { W: 104, H: 84, ox: 12, oy: 18, p: 3.2, amp: .9, base: GR.ASH }
};
const NAT = [GR.GRASS, GR.JGRASS, GR.SAND, GR.SNOW, GR.ICE, GR.ASH, GR.DGRASS];
const WALLISH = new Set([O.WALL, O.DWALL, O.ICEWALL, O.ROOF, O.ROOFB, O.ROOFG, O.WINDOW, O.DOOR, O.GATE, O.PILLAR, O.CRACK, O.STATUE, O.TORCH]);
const SOFTO = new Set([O.TREE, O.JTREE, O.PINE, O.CACTUS, O.ROCK, O.DEAD, O.BUSH, O.FLOWER, O.BONES, O.RUBBLE, O.PALM, O.SROCK, O.CRATE, O.BARREL, O.STATUE, O.TORCH, O.ASHROCK, O.ICEC]);

class MinHeap {
  constructor() { this.a = []; }
  get size() { return this.a.length; }
  push(d, k) { const a = this.a; a.push([d, k]); let i = a.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (a[p][0] <= a[i][0]) break;[a[p], a[i]] = [a[i], a[p]]; i = p; } }
  pop() { const a = this.a, top = a[0], last = a.pop(); if (a.length) { a[0] = last; let i = 0; for (; ;) { let l = 2 * i + 1, r = l + 1, s = i; if (l < a.length && a[l][0] < a[s][0]) s = l; if (r < a.length && a[r][0] < a[s][0]) s = r; if (s === i) break;[a[s], a[i]] = [a[i], a[s]]; i = s; } } return top; }
}
// гарантия проходимости: всё нужное достижимо; при необходимости прорубаем проход (воду заменяем сушей)
function connect(m) {
  const W = m.w, H = m.h, N = W * H, reach = new Uint8Array(N), gateK = new Set(); m.gates.forEach(g => g.tiles.forEach(([x, y]) => gateK.add(y * W + x)));
  const pass = k => m.g[k] !== GR.WATER && (!OBJ_SOLID[m.o[k]] || m.o[k] === O.CRACK || gateK.has(k));
  const D4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const flood = seed => { const st = [seed]; while (st.length) { const k = st.pop(); if (reach[k]) continue; reach[k] = 1; const x = k % W, y = (k / W) | 0; for (const [dx, dy] of D4) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; const nk = ny * W + nx; if (!reach[nk] && pass(nk)) st.push(nk); } } };
  const s0 = m.start[1] * W + m.start[0]; if (m.g[s0] === GR.WATER && m.base !== undefined) m.g[s0] = m.base; m.o[s0] = 0; flood(s0);
  const tg = [...m.npcs.map(n => [n.x, n.y]), ...m.things.filter(t => t.x !== undefined && t.t !== 'crack').map(t => [t.x, t.y]), ...m.exits.map(e => [e.x + (e.w >> 1), e.y + (e.h >> 1)]), ...m.spawns.map(s => [s.x, s.y])];
  let fixed = 0;
  for (const [tx, ty] of tg) {
    if (!inb(m, tx, ty)) continue; const t0 = ty * W + tx; if (reach[t0]) continue;
    const dist = new Float32Array(N).fill(1e9), prev = new Int32Array(N).fill(-1), hp = new MinHeap(); dist[t0] = 0; hp.push(0, t0); let goal = -1;
    while (hp.size) {
      const [d, k] = hp.pop(); if (d > dist[k]) continue; if (reach[k]) { goal = k; break; }
      const x = k % W, y = (k / W) | 0;
      for (const [dx, dy] of D4) {
        const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; const nk = ny * W + nx;
        if (m.g[nk] === GR.WATER && m.base === undefined) continue;
        const c = m.g[nk] === GR.WATER ? 8 : pass(nk) ? 1 : SOFTO.has(m.o[nk]) ? 3 : 25; if (d + c < dist[nk]) { dist[nk] = d + c; prev[nk] = k; hp.push(d + c, nk); }
      }
    }
    if (goal < 0) continue;
    for (let k = goal; k >= 0; k = prev[k]) { if (m.g[k] === GR.WATER) { m.g[k] = m.base; m.o[k] = 0; } else if (!pass(k)) m.o[k] = 0; }
    flood(t0); fixed++;
  }
  m.fixed = fixed; return m;
}

// ---------- помощники ----------
const inCore = (c, x, y) => x >= c.x && y >= c.y && x < c.x + c.w && y < c.y + c.h;
function landAround(m, x, y, rad) { for (let j = -rad; j <= rad; j++) for (let i = -rad; i <= rad; i++) { if (!inb(m, x + i, y + j) || m.g[ix(m, x + i, y + j)] === GR.WATER) return false; } return true; }
function randLand(m, r, c, pad, rad) {
  for (let i = 0; i < 400; i++) {
    const x = Math.floor(5 + r() * (m.w - 10)), y = Math.floor(5 + r() * (m.h - 10)); if (pad && inCore(c, x, y)) continue;
    const k = ix(m, x, y); if (HARD.includes(m.g[k]) || m.keep[k] || m.o[k] || !landAround(m, x, y, rad || 2)) continue; return [x, y];
  } return null;
}
function ridgeLine(m, r, x, y, len, obj, hillG) {
  let a = r() * 6.28, n = 0;
  for (let i = 0; i < len; i++) {
    a += (r() - .5) * .7; x += Math.cos(a); y += Math.sin(a); const tx = Math.round(x), ty = Math.round(y); if (!inb(m, tx, ty)) break;
    if (okT(m, tx, ty) && landAround(m, tx, ty, 1)) { if (r() > .12) { m.o[ix(m, tx, ty)] = obj; n++; } if (hillG !== undefined) [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const k = ix(m, tx + dx, ty + dy); if (inb(m, tx + dx, ty + dy) && NAT.includes(m.g[k]) && !m.keep[k]) m.g[k] = hillG; }); }
  } return n;
}
const POI_LOOT = {
  capital: [[['potion_hp', 2], ['bread', 2]], [['potion_mp', 2], ['herb', 3]], [['ore', 3]], [['antidote', 2], ['potion_hp', 1]]],
  jungle: [[['herb', 3], ['potion_hp2', 1]], [['potion_mp', 2], ['silk', 2]], [['ring_dex', 1]]],
  winter: [[['crystal', 2], ['potion_mp2', 1]], [['potion_hp2', 2]], [['ring_int', 1]], [['crystal', 3]]],
  ash: [[['ash_shard', 3], ['potion_hp2', 2]], [['potion_mp2', 2]], [['ash_shard', 2], ['elixir', 1]], [['ring_str', 1], ['ash_shard', 2]]]
};
const WILD = {
  capital: { trees: [O.TREE, O.TREE, O.BUSH, O.FLOWER], patch: GR.DGRASS, ridge: O.ROCK, hill: GR.STONE, lake: GR.WATER, groves: 40, ridges: 8, lakes: 5, pois: 7, wall: O.WALL, floor: GR.DSTONE,
    spawns: [['wolf', 3], ['wolf', 3], ['goblin', 3], ['goblin', 3], ['bandit', 3], ['bandit', 3], ['orc', 1], ['wolf', 4], ['goblin', 4], ['orc', 1]] },
  jungle: { trees: [O.JTREE, O.JTREE, O.PALM, O.BUSH], patch: GR.DGRASS, ridge: O.ROCK, hill: GR.STONE, lake: GR.WATER, groves: 8, ridges: 5, lakes: 2, pois: 2, wall: O.DWALL, floor: GR.DSTONE, spawns: [['spider', 3], ['goblin', 3], ['wolf', 3]] },
  fortress: { trees: [O.RUBBLE, O.BUSH], patch: GR.STONE, ridge: O.ROCK, hill: GR.STONE, groves: 0, ridges: 2, lakes: 0, pois: 0, spawns: [] },
  desert: { trees: [O.CACTUS, O.SROCK, O.DEAD], patch: GR.PATH, ridge: O.SROCK, hill: GR.PATH, groves: 4, ridges: 6, lakes: 0, pois: 0, spawns: [] },
  winter: { trees: [O.PINE, O.PINE, O.PINE, O.ROCK], patch: GR.ICE, ridge: O.ICEC, hill: GR.STONE, lake: GR.ICE, groves: 36, ridges: 9, lakes: 5, pois: 7, wall: O.ICEWALL, floor: GR.ICE,
    spawns: [['frostwolf', 3], ['frostwolf', 3], ['wraith', 2], ['wraith', 3], ['frozen', 3], ['frozen', 2], ['yeti', 1], ['frostwolf', 4], ['yeti', 1]] },
  ash: { trees: [O.DEAD, O.ASHROCK, O.BONES, O.RUBBLE], patch: GR.DSTONE, ridge: O.ASHROCK, hill: GR.DSTONE, lake: GR.LAVA, groves: 30, ridges: 9, lakes: 5, pois: 7, wall: O.DWALL, floor: GR.DSTONE,
    spawns: [['ashwar', 3], ['hound', 3], ['asharch', 3], ['ashmage', 2], ['ashorc', 1], ['hound', 4], ['ashwar', 3], ['ashorc', 1], ['ashmage', 2]] }
};
function wilderness(m, id, r, core) {
  const c = WILD[id], pad = id === 'capital' || id === 'winter' || id === 'ash' || id === 'jungle';
  for (let i = 0; i < 18; i++) { const p = randLand(m, r, core, pad, 2); if (p) patches1(m, r, p[0], p[1], c.patch); }
  for (let i = 0; i < c.lakes; i++) { const p = randLand(m, r, core, pad, 4); if (!p) continue; blob(m, p[0], p[1], 3 + (r() * 4 | 0), 2 + (r() * 3 | 0), c.lake, r); if (c.lake === GR.LAVA) LT(m, p[0], p[1], 5, '#ff4a1a'); }
  for (let i = 0; i < c.ridges; i++) { const p = randLand(m, r, core, pad, 2); if (p) ridgeLine(m, r, p[0], p[1], 14 + (r() * 22 | 0), c.ridge, c.hill); }
  for (let i = 0; i < c.groves; i++) { const p = randLand(m, r, core, pad, 2); if (p) grove(m, r, p[0], p[1], 3 + (r() * 4 | 0), c.trees, .65); }
  for (let i = 0; i < c.pois; i++) {
    const p = randLand(m, r, core, pad, 4); if (!p) continue; const w = 6 + (r() * 3 | 0), h = 5 + (r() * 2 | 0), x = p[0] - (w >> 1), y = p[1] - (h >> 1);
    ruinBox(m, r, x, y, w, h, c.wall, c.floor);
    const loot = POI_LOOT[id][i % POI_LOOT[id].length]; const cx = x + 1 + (r() * (w - 3) | 0), cy = y + 1 + (r() * (h - 3) | 0);
    m.o[ix(m, cx, cy)] = 0; chest(m, 'w' + i, cx, cy, loot, 30 + (r() * 90 | 0)); m.keep[ix(m, cx, cy)] = 1;
    const sp = c.spawns[(i * 2) % c.spawns.length]; if (sp) SP(m, sp[0], p[0], p[1] + h, Math.min(2, sp[1]), 3); LT(m, p[0], p[1], 4, id === 'ash' ? '#ff4a2a' : id === 'winter' ? '#8ad8ff' : '#ffb050');
  }
  c.spawns.forEach(([t, n]) => { const p = randLand(m, r, core, pad, 3); if (p) SP(m, t, p[0], p[1], n, 4); });
  const sea = Math.floor(m.w * m.h / 450); for (let i = 0; i < sea; i++) { const x = rint(1, m.w - 2), y = rint(1, m.h - 2), k = ix(m, x, y); if (m.g[k] !== GR.WATER || m.o[k] || m.keep[k]) continue; let near = false; for (let j = -3; j <= 3 && !near; j++) for (let q = -3; q <= 3; q++) if (inb(m, x + q, y + j) && ![GR.WATER, GR.BRIDGE].includes(m.g[ix(m, x + q, y + j)])) { near = true; break; } if (near && !(m.g[k - 1] === GR.BRIDGE || m.g[k + 1] === GR.BRIDGE)) m.o[k] = r() < .5 ? O.ROCK : O.SROCK; }
}
function patches1(m, r, cx, cy, to) { const rx = 2 + r() * 5, ry = 2 + r() * 4; for (let j = Math.floor(cy - ry); j <= cy + ry; j++) for (let i = Math.floor(cx - rx); i <= cx + rx; i++) { if (!inb(m, i, j)) continue; const k = ix(m, i, j); const d = ((i - cx) / rx) ** 2 + ((j - cy) / ry) ** 2; if (d < 1 - r() * .4 && NAT.includes(m.g[k]) && !m.keep[k]) m.g[k] = to; } }

// ---------- форма острова ----------
function shape(core, id) {
  const S0 = SHAPE[id], r = mulberry32(id.length * 313 + core.w * 7), W = S0.W, H = S0.H, ox = S0.ox, oy = S0.oy, cw = core.w, ch = core.h;
  const M = newMap(id, W, H, S0.base, core.reg); M.base = S0.base; const cr = { x: ox, y: oy, w: cw, h: ch };
  // 1. вкладываем «ядро»; его рамка из воды становится сушей
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const cx = x - ox, cy = y - oy; if (cx < 0 || cy < 0 || cx >= cw || cy >= ch) continue; const k = ix(M, x, y), ck = cy * cw + cx;
    let g = core.g[ck]; const edge = Math.min(cx, cy, cw - 1 - cx, ch - 1 - cy);
    if (edge < 2 && g === GR.WATER) g = S0.base; if (edge < 6 && g === GR.BRIDGE) g = GR.PATH;
    M.g[k] = g; M.o[k] = core.o[ck]; M.keep[k] = core.keep[ck];
  }
  const sh = (x, y) => [x + ox, y + oy];
  M.npcs = core.npcs.map(n => ({ id: n.id, x: n.x + ox, y: n.y + oy })); M.spawns = core.spawns.map(s => ({ ...s, x: s.x + ox, y: s.y + oy }));
  M.lights = core.lights.map(l => [l[0] + ox, l[1] + oy, l[2], l[3]]); M.gates = core.gates.map(g => ({ flag: g.flag, tiles: g.tiles.map(([x, y]) => sh(x, y)) })); M.start = sh(core.start[0], core.start[1]);
  M.things = core.things; M.things.forEach(t => { if (t.x !== undefined) { t.x += ox; t.y += oy; } if (t.area) t.area = [t.area[0] + ox, t.area[1] + oy, t.area[2] + ox, t.area[3] + oy]; });
  M.shoreArgs = core.shoreArgs;
  // 2. береговая линия: зашумлённый суперэллипс
  const ph = [r() * 6.28, r() * 6.28, r() * 6.28, r() * 6.28], mg = S0.W > 100 ? 7 : 2, rx = (W - 2 * mg) / 2, ry = (H - 2 * mg) / 2, cx0 = W / 2, cy0 = H / 2, A = S0.amp, P = S0.p, nat = NAT.concat(S0.nat || []);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const u = (x - cx0) / rx, v = (y - cy0) / ry, th = Math.atan2(v, u), s = Math.pow(Math.pow(Math.abs(u), P) + Math.pow(Math.abs(v), P), 1 / P);
    const B = 1 + A * (.11 * Math.sin(3 * th + ph[0]) + .07 * Math.sin(5 * th + ph[1]) + .05 * Math.sin(9 * th + ph[2]) + .03 * Math.sin(14 * th + ph[3])) + (((x * 73856093) ^ (y * 19349663)) % 100) / 100 * .03 * A;
    const k = ix(M, x, y);
    if (s > B) { if (nat.includes(M.g[k]) && !WALLISH.has(M.o[k])) { M.g[k] = GR.WATER; M.o[k] = 0; M.keep[k] = 0; } }
  }
  // 3. сохранить сушу под важными точками
  const disc = (x, y, rad) => { for (let j = -rad; j <= rad; j++) for (let i = -rad; i <= rad; i++) if (inb(M, x + i, y + j) && M.g[ix(M, x + i, y + j)] === GR.WATER) M.g[ix(M, x + i, y + j)] = M.base; };
  M.npcs.forEach(n => disc(n.x, n.y, 2)); M.things.forEach(t => { if (t.x !== undefined) disc(t.x, t.y, 2); }); disc(M.start[0], M.start[1], 3);
  // 4. выходы: дорога до берега + мост до края карты
  M.exits = core.exits.map(e => {
    const dir = e.x === 0 ? 'W' : e.x + e.w >= cw ? 'E' : e.y === 0 ? 'N' : 'S', X = e.x + ox, Y = e.y + oy;
    let ne;
    if (dir === 'W') { for (let x = X + e.w; x >= 0; x--) for (let j = 0; j < e.h; j++) lay(M, x, Y + j); ne = { x: 0, y: Y, w: 1, h: e.h }; }
    else if (dir === 'E') { for (let x = X - 1; x < W; x++) for (let j = 0; j < e.h; j++) lay(M, x, Y + j); ne = { x: W - 1, y: Y, w: 1, h: e.h }; }
    else if (dir === 'N') { for (let y = Y + e.h; y >= 0; y--) for (let i = 0; i < e.w; i++) lay(M, X + i, y); ne = { x: X, y: 0, w: e.w, h: 1 }; }
    else { for (let y = Y - 1; y < H; y++) for (let i = 0; i < e.w; i++) lay(M, X + i, y); ne = { x: X, y: H - 1, w: e.w, h: 1 }; }
    const opp = { W: 'E', E: 'W', N: 'S', S: 'N' }[dir], pt = { W: [5, Y + (e.h >> 1)], E: [W - 6, Y + (e.h >> 1)], N: [X + (e.w >> 1), 5], S: [X + (e.w >> 1), H - 6] }[dir];
    M.ports = M.ports || {}; M.ports[dir] = pt;
    return Object.assign({}, e, ne, { port: opp, tx: undefined, ty: undefined });
  });
  function lay(m, x, y) { if (!inb(m, x, y)) return; const k = ix(m, x, y); m.g[k] = m.g[k] === GR.WATER ? GR.BRIDGE : (m.g[k] === GR.BRIDGE ? GR.BRIDGE : (NAT.includes(m.g[k]) ? GR.PATH : m.g[k])); m.o[k] = 0; m.keep[k] = 1; }
  // 5. дикие земли, рельеф, пляжи
  M.spawns = M.spawns.filter(s => M.g[ix(M, s.x, s.y)] !== GR.WATER);
  wilderness(M, id, r, cr);
  M.final = 1; if (M.shoreArgs) shore(M, M.shoreArgs[0], M.shoreArgs[1]);
  M.lights = M.lights.filter(l => inb(M, l[0] | 0, l[1] | 0)); M.core = cr;
  return connect(M);
}
function buildMap(id) {
  const rr = Math.random; Math.random = mulberry32(id.length * 977 + 13);
  try { return shape(buildCore(id), id); } finally { Math.random = rr; }
}
