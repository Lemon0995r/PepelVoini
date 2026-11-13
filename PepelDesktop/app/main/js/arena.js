'use strict';
// ---------- Арены боссов: узоры пола, колонны, факелы, декор по краям ----------
const ARENA_STYLE = {
  forest_guard: { base: GR.DGRASS, ring: GR.STONE, core: GR.STONE, col: '#7aff5a', pil: O.PILLAR, edge: [O.BUSH, O.FLOWER, O.JTREE, O.BUSH], scat: [O.ROCK, O.FLOWER, O.BUSH], lamp: '#8aff6a' },
  castellan: { base: GR.DSTONE, ring: GR.STONE, core: GR.STONE, check: 1, col: '#ffcc66', pil: O.PILLAR, edge: [O.CRATE, O.BARREL, O.STATUE], scat: [O.RUBBLE, O.RUBBLE, O.BONES], lamp: '#ffb04a' },
  queen: { base: GR.SAND, ring: GR.DSTONE, core: GR.PATH, col: '#ff8a4a', pil: O.RUBBLE, edge: [O.ROCK, O.CACTUS, O.DEAD, O.SROCK], scat: [O.BONES, O.BONES, O.RUBBLE, O.SROCK], lamp: '#ff7a3a' },
  ice_guardian: { base: GR.ICE, ring: GR.SNOW, core: GR.STONE, col: '#8ae8ff', pil: O.ICEC, edge: [O.PINE, O.ICEC, O.ROCK, O.PINE], scat: [O.ROCK, O.ICEC], lamp: '#8ae0ff' },
  ash_king: { base: GR.DSTONE, ring: GR.ASH, core: GR.STONE, col: '#ff4a2a', pil: O.PILLAR, edge: [O.DEAD, O.ASHROCK, O.STATUE, O.BONES], scat: [O.BONES, O.RUBBLE, O.ASHROCK], lamp: '#ff4a2a', lava: 1 }
};
function arenaDeco(m, r) {
  m.things.filter(t => t.t === 'boss').forEach(t => {
    const st = ARENA_STYLE[t.id]; if (!st) return; const [x0, y0, x1, y1] = t.area, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, rx = (x1 - x0) / 2 + .5, ry = (y1 - y0) / 2 + .5;
    const free = (x, y) => inb(m, x, y) && !m.keep[ix(m, x, y)] && !m.o[ix(m, x, y)] && !HARD.includes(m.g[ix(m, x, y)]);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const k = ix(m, x, y); if (!inb(m, x, y) || HARD.includes(m.g[k]) || m.o[k] === O.WALL || m.o[k] === O.DWALL) continue;
      const d = Math.hypot((x - cx) / rx, (y - cy) / ry); let g = st.base;
      if (st.check && (x + y) % 2) g = st.ring; if (d < .2) g = st.core; else if (Math.abs(d - .62) < .08 || Math.abs(d - .86) < .05 && (x + y) % 3 === 0) g = st.ring;
      if (!st.check && d >= .2 && d < .9 && (Math.abs(x - cx) < .6 || Math.abs(y - cy) < .6) && d < .62) g = st.core;
      if (!m.keep[k] || !m.o[k]) m.g[k] = g;
    }
    // колонны и свет по периметру
    const put = (x, y, o) => { if (free(x, y)) m.o[ix(m, x, y)] = o; };
    [[x0 + 1, y0 + 1], [x1 - 1, y0 + 1], [x0 + 1, y1 - 1], [x1 - 1, y1 - 1]].forEach(([x, y]) => { put(x, y, st.pil); if (m.o[ix(m, x, y)] === st.pil) LT(m, x, y, 6, st.lamp); });
    for (let x = x0 + 3; x < x1 - 2; x += 4) { put(x, y0 + 1, st.edge[(x * 7) % st.edge.length]); if (r() < .6) put(x + 1, y1 - 1, st.edge[(x * 3) % st.edge.length]); }
    for (let y = y0 + 3; y < y1 - 2; y += 4) { put(x0 + 1, y, st.edge[(y * 5) % st.edge.length]); put(x1 - 1, y, st.edge[(y * 3) % st.edge.length]); }
    if (st.pil === O.PILLAR) for (let y = y0 + 4; y < y1 - 3; y += 5) { lamp(m, x0 + 2, y, st.lamp, 5); lamp(m, x1 - 2, y, st.lamp, 5); }
    for (let i = 0; i < 14; i++) put(rint(x0 + 1, x1 - 1), rint(y0 + 1, y1 - 1), st.scat[Math.floor(r() * st.scat.length)]);
    if (st.lava) [[x0 + 1, y0 + 2], [x1 - 1, y1 - 2], [x0 + 1, y1 - 2], [x1 - 1, y0 + 2]].forEach(([x, y]) => { for (let j = -1; j <= 0; j++) for (let i = -1; i <= 0; i++) { const px = x + i, py = y + j; if (inb(m, px, py) && !m.keep[ix(m, px, py)] && px > x0 && px < x1 && py > y0 && py < y1) { m.g[ix(m, px, py)] = GR.LAVA; m.o[ix(m, px, py)] = 0; } } LT(m, x, y, 3, '#ff4a1a'); });
    if (t.id === 'ash_king') { put(Math.round(cx), y0 + 1, O.STATUE); LT(m, Math.round(cx), y0 + 1, 8, '#ff2a2a'); }
  });
}
Object.keys(DECO).forEach(id => { const old = DECO[id]; DECO[id] = (m, r) => { old(m, r); arenaDeco(m, r); }; });

// ----- общий декор регионов: больше растительности, камней, костей, огней -----
const EXTRA = {
  capital: [[[GR.GRASS], [O.FLOWER, O.FLOWER, O.BUSH, O.ROCK], .05], [[GR.PATH, GR.STONE], [O.BARREL, O.CRATE], .006]],
  jungle: [[[GR.JGRASS, GR.DGRASS], [O.FLOWER, O.BUSH, O.BUSH, O.ROCK, O.BONES], .06]],
  fortress: [[[GR.DSTONE, GR.STONE], [O.RUBBLE, O.RUBBLE, O.BONES, O.CRATE, O.BARREL], .025], [[GR.GRASS, GR.DGRASS], [O.BUSH, O.ROCK, O.DEAD], .03]],
  desert: [[[GR.SAND], [O.BONES, O.ROCK, O.SROCK, O.CACTUS, O.DEAD], .03]],
  winter: [[[GR.SNOW], [O.ROCK, O.PINE, O.ICEC, O.DEAD], .035]],
  ash: [[[GR.ASH, GR.DSTONE], [O.BONES, O.RUBBLE, O.ASHROCK, O.DEAD, O.BONES], .05]]
};
const CAMPS = { capital: '#ffb050', jungle: '#ffb050', fortress: '#ffb050', desert: '#ffb050', winter: '#ffd890', ash: '#ff6a3a' };
function extraDeco(m, r, id) {
  const ars = m.things.filter(t => t.t === 'boss').map(t => t.area), inA = (x, y) => ars.some(a => x >= a[0] - 1 && x <= a[2] + 1 && y >= a[1] - 1 && y <= a[3] + 1);
  (EXTRA[id] || []).forEach(([gr, objs, dens]) => {
    for (let y = 2; y < m.h - 2; y++) for (let x = 2; x < m.w - 2; x++) { const k = ix(m, x, y); if (m.keep[k] || m.o[k] || inA(x, y) || !gr.includes(m.g[k]) || r() > dens) continue;
      if (m.g[ix(m, x + 1, y)] === GR.PATH && gr.includes(GR.GRASS) && r() < .7) continue; m.o[k] = objs[Math.floor(r() * objs.length)]; }
  });
  for (let n = 0, t = 0; n < 10 && t < 400; t++) { const x = rint(4, m.w - 5), y = rint(4, m.h - 5); if (okT(m, x, y) && !inA(x, y) && ![GR.WATER, GR.LAVA].includes(m.g[ix(m, x, y)])) { m.o[ix(m, x, y)] = O.TORCH; LT(m, x, y, 5, CAMPS[id]); n++; } }
}
Object.keys(DECO).forEach(id => { const old = DECO[id]; DECO[id] = (m, r) => { old(m, r); extraDeco(m, r, id); }; });
