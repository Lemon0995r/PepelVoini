'use strict';
// ---------- Детализация карт: ручьи, пляжи, руины, лагеря, освещение + проверка проходимости ----------
const HARD = [GR.WATER, GR.LAVA, GR.BRIDGE];
const okT = (m, x, y) => inb(m, x, y) && !m.keep[ix(m, x, y)] && !m.o[ix(m, x, y)] && !HARD.includes(m.g[ix(m, x, y)]);
function protect(m) {
  const mark = (x, y, rad) => { for (let j = -rad; j <= rad; j++) for (let i = -rad; i <= rad; i++) if (inb(m, x + i, y + j)) m.keep[ix(m, x + i, y + j)] = 1; };
  m.npcs.forEach(n => mark(n.x, n.y, 1));
  m.things.forEach(t => { if (t.t === 'crack') mark(t.x, t.y + 1, 0); else if (t.x !== undefined) mark(t.x, t.y, 1); });
  m.exits.forEach(e => mark(e.x + (e.w >> 1), e.y + (e.h >> 1), 2)); m.spawns.forEach(s => mark(s.x, s.y, 1)); mark(m.start[0], m.start[1], 2);
}
function ringK(m, x, y, w, h, o, gaps) {
  for (let i = x; i < x + w; i++) for (let j = y; j < y + h; j++) {
    if (i > x && i < x + w - 1 && j > y && j < y + h - 1) continue; if (!inb(m, i, j)) continue; const k = ix(m, i, j);
    if (m.keep[k] || HARD.includes(m.g[k])) continue; m.o[k] = o;
  }
  (gaps || []).forEach(([gx, gy]) => { if (inb(m, gx, gy)) m.o[ix(m, gx, gy)] = 0; });
}
function ruinBox(m, r, x, y, w, h, o, floor) {                    // разрушенное здание с проломами
  ringK(m, x, y, w, h, o);
  for (let i = x + 1; i < x + w - 1; i++) for (let j = y + 1; j < y + h - 1; j++) { const k = ix(m, i, j); if (m.keep[k] || HARD.includes(m.g[k])) continue; m.g[k] = floor; m.o[k] = 0; if (r() < .1) m.o[k] = O.RUBBLE; else if (r() < .05) m.o[k] = O.BONES; }
  for (let n = 0; n < Math.max(2, (w + h) / 4 | 0); n++) { const side = rint(0, 3); const gx = side < 2 ? rint(x + 1, x + w - 2) : (side === 2 ? x : x + w - 1), gy = side < 2 ? (side ? y : y + h - 1) : rint(y + 1, y + h - 2); if (inb(m, gx, gy) && m.o[ix(m, gx, gy)] === o) m.o[ix(m, gx, gy)] = r() < .5 ? O.RUBBLE : 0; }
  const dx = x + (w >> 1); [[dx, y + h - 1], [dx, y + h - 2], [dx, y + h]].forEach(([a, b]) => { if (inb(m, a, b)) m.o[ix(m, a, b)] = 0; });
}
function patches(m, r, from, to, n, rmin, rmax) {
  for (let q = 0; q < n; q++) {
    const cx = rint(3, m.w - 4), cy = rint(3, m.h - 4), rx = rnd(rmin, rmax), ry = rnd(rmin, rmax);
    for (let j = Math.floor(cy - ry - 1); j <= cy + ry + 1; j++) for (let i = Math.floor(cx - rx - 1); i <= cx + rx + 1; i++) {
      if (!inb(m, i, j)) continue; const k = ix(m, i, j); const d = ((i - cx) / rx) ** 2 + ((j - cy) / ry) ** 2; if (d < 1 - r() * .4 && from.includes(m.g[k]) && !m.keep[k]) m.g[k] = to;
    }
  }
}
function grove(m, r, cx, cy, rad, objs, dens, grounds) {
  for (let j = cy - rad; j <= cy + rad; j++) for (let i = cx - rad; i <= cx + rad; i++) {
    const d = Math.hypot(i - cx, j - cy) / rad; if (d > 1 || !okT(m, i, j)) continue; if (grounds && !grounds.includes(m.g[ix(m, i, j)])) continue;
    if (r() < dens * (1 - d * .6)) m.o[ix(m, i, j)] = objs[Math.floor(r() * objs.length)];
  }
}
function shore(m, from, to) {
  if (!m.final) { m.shoreArgs = [from, to]; return; }
  const W = m.w, set = [];
  for (let y = 0; y < m.h; y++) for (let x = 0; x < W; x++) { const k = y * W + x; if (!from.includes(m.g[k]) || m.keep[k]) continue; if ((x > 0 && m.g[k - 1] === GR.WATER) || (x < W - 1 && m.g[k + 1] === GR.WATER) || (y > 0 && m.g[k - W] === GR.WATER) || (y < m.h - 1 && m.g[k + W] === GR.WATER)) set.push(k); }
  set.forEach(k => { m.g[k] = to; });
}
function halo(m, x0, y0, x1, y1, from, to, rad) {                  // кайма вокруг воды (оазис)
  const hit = [];
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { if (!inb(m, x, y) || !from.includes(m.g[ix(m, x, y)])) continue; for (let j = -rad; j <= rad; j++) for (let i = -rad; i <= rad; i++) if (inb(m, x + i, y + j) && m.g[ix(m, x + i, y + j)] === GR.WATER) { hit.push(ix(m, x, y)); j = rad; break; } }
  hit.forEach(k => { m.g[k] = to; });
}
function river(m, r, pts, wid, g) {
  const ph = r() * 6;
  for (let n = 0; n < pts.length - 1; n++) {
    const [x0, y0] = pts[n], [x1, y1] = pts[n + 1], L = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1, horiz = Math.abs(x1 - x0) > Math.abs(y1 - y0);
    for (let s = 0; s <= L; s++) {
      const t = s / L; let x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t; const wob = Math.sin(ph + s * .35 + n) * 1.2; if (horiz) y += wob; else x += wob;
      const px = Math.round(x), py = Math.round(y);
      for (let j = 0; j < wid; j++) for (let i = 0; i < wid; i++) {
        if (!inb(m, px + i, py + j)) continue; const k = ix(m, px + i, py + j); if (m.g[k] === GR.WATER && g !== GR.WATER) continue;
        if (m.keep[k]) { if (g === GR.WATER || g === GR.LAVA) { m.g[k] = GR.BRIDGE; m.o[k] = 0; } } else { m.g[k] = g; m.o[k] = 0; }
      }
    }
  }
}
const lamp = (m, x, y, col, r) => { if (okT(m, x, y)) { m.o[ix(m, x, y)] = O.TORCH; LT(m, x, y, r || 5, col || '#ffb050'); } };
const putObj = (m, x, y, o) => { if (okT(m, x, y)) m.o[ix(m, x, y)] = o; };

const DECO = {};
DECO.capital = (m, r) => {
  patches(m, r, [GR.GRASS], GR.DGRASS, 16, 2, 4); patches(m, r, [GR.GRASS], GR.JGRASS, 5, 1.5, 3);
  // дом Ариона с садиком
  house(m, 12, 31, 5, O.ROOFG, 2); T(m, { t: 'sign', x: 14, y: 34, lines: [['Табличка', 'Дом Ариона. Здесь пахнет старым деревом и домашним хлебом.']] });
  [[11, 33], [17, 33]].forEach(([x, y]) => putObj(m, x, y, O.BARREL)); [[12, 34], [16, 34], [13, 35], [15, 35], [17, 35]].forEach(([x, y]) => putObj(m, x, y, O.FLOWER)); LT(m, 14, 33, 4, '#ffd890');
  // ферма
  house(m, 51, 5, 5, O.ROOF, 2); for (let y = 9; y <= 13; y += 2) for (let x = 48; x <= 58; x++) { if (!inb(m, x, y) || m.keep[ix(m, x, y)]) continue; m.g[ix(m, x, y)] = GR.DGRASS; if (m.g[ix(m, x, y + 1)] !== GR.WATER) putObj(m, x, y, r() < .8 ? O.FLOWER : O.BUSH); }
  [[49, 7], [58, 7]].forEach(([x, y]) => putObj(m, x, y, O.BARREL)); LT(m, 53, 7, 4, '#ffd890');
  // городские детали
  [[30, 17], [33, 17], [30, 29], [33, 29], [24, 22], [40, 22], [24, 25], [40, 25], [26, 32], [44, 32], [20, 22], [44, 22]].forEach(([x, y]) => lamp(m, x, y, '#ffc070', 6));
  fillG(m, 19, 19, 5, 3, GR.GRASS); fillG(m, 41, 19, 5, 3, GR.GRASS);
  [[19, 19], [23, 19], [19, 21], [23, 21], [41, 19], [45, 19], [41, 21]].forEach(([x, y]) => putObj(m, x, y, O.BUSH)); [[20, 20], [21, 20], [22, 20], [42, 20], [43, 20], [44, 20], [21, 19], [43, 21]].forEach(([x, y]) => putObj(m, x, y, O.FLOWER));
  [[27, 25], [28, 25]].forEach(([x, y]) => putObj(m, x, y, O.CRATE)); [[36, 25], [37, 25]].forEach(([x, y]) => putObj(m, x, y, O.BARREL));
  [[58, 21], [58, 26], [8, 22], [8, 25]].forEach(([x, y]) => lamp(m, x, y, '#ffc070', 5)); lamp(m, 31, 40, '#ffc070', 5); lamp(m, 34, 40, '#ffc070', 5);
  grove(m, r, 8, 15, 5, [O.TREE, O.TREE, O.BUSH], .6, [GR.GRASS, GR.DGRASS]); grove(m, r, 58, 44, 5, [O.TREE, O.BUSH], .6); grove(m, r, 24, 41, 4, [O.TREE, O.BUSH, O.FLOWER], .5); grove(m, r, 44, 8, 5, [O.TREE, O.TREE, O.BUSH], .55);
  scatter(m, r, [O.FLOWER, O.FLOWER, O.BUSH], 140, 3, 3, 60, 44, [GR.GRASS, GR.DGRASS]); shore(m, [GR.GRASS, GR.DGRASS], GR.SAND);
};
DECO.jungle = (m, r) => {
  patches(m, r, [GR.JGRASS], GR.DGRASS, 18, 2, 5); patches(m, r, [GR.JGRASS], GR.GRASS, 8, 2, 4);
  river(m, r, [[2, 32], [14, 31], [26, 32]], 2, GR.WATER); river(m, r, [[44, 3], [44, 29]], 2, GR.WATER); blob(m, 44, 30, 3, 2, GR.WATER, r);
  [[30, 22], [33, 22], [30, 26], [33, 26], [30, 30], [33, 30], [30, 36], [33, 36]].forEach(([x, y]) => putObj(m, x, y, O.STATUE)); [[30, 18], [33, 18], [30, 24], [33, 24]].forEach(([x, y]) => lamp(m, x, y, '#7aff9a', 5));
  ruinBox(m, r, 13, 16, 7, 5, O.DWALL, GR.DSTONE); ruinBox(m, r, 48, 24, 6, 5, O.DWALL, GR.DSTONE); ruinBox(m, r, 34, 38, 7, 5, O.DWALL, GR.DSTONE); LT(m, 16, 18, 4, '#7aff9a'); LT(m, 51, 26, 4, '#7aff9a');
  for (let i = 0; i < 18; i++) grove(m, r, rint(5, 58), rint(5, 50), rint(3, 5), [O.JTREE, O.JTREE, O.PALM, O.BUSH], .7);
  scatter(m, r, [O.FLOWER, O.BUSH, O.BONES], 120, 3, 3, 60, 52, [GR.JGRASS, GR.DGRASS]); scatter(m, r, [O.RUBBLE, O.PILLAR], 14, 3, 3, 60, 52, [GR.JGRASS]);
  shore(m, [GR.JGRASS, GR.DGRASS, GR.GRASS], GR.SAND);
};
DECO.fortress = (m, r) => {
  patches(m, r, [GR.DSTONE], GR.STONE, 14, 2, 4);
  ruinBox(m, r, 11, 10, 6, 5, O.DWALL, GR.STONE); ruinBox(m, r, 12, 25, 6, 4, O.DWALL, GR.STONE); ruinBox(m, r, 40, 18, 6, 4, O.DWALL, GR.STONE); ruinBox(m, r, 30, 33, 6, 4, O.DWALL, GR.STONE); ruinBox(m, r, 8, 17, 4, 4, O.DWALL, GR.STONE);
  [[26, 39], [29, 39], [8, 20], [8, 25], [26, 21], [29, 21], [20, 31], [35, 31], [14, 5], [40, 5], [47, 20], [14, 17]].forEach(([x, y]) => lamp(m, x, y, '#ff9a4a', 5));
  scatter(m, r, [O.RUBBLE, O.RUBBLE, O.BONES, O.BARREL], 50, 7, 4, 48, 39, [GR.DSTONE, GR.STONE, GR.DGRASS]);
  for (let i = 0; i < 10; i++) { const x = rint(7, 48), y = i % 2 ? 4 : 39; if (okT(m, x, y)) m.o[ix(m, x, y)] = O.RUBBLE; }
  scatter(m, r, [O.BUSH, O.DEAD], 20, 7, 4, 48, 39, [GR.DGRASS]);
};
DECO.desert = (m, r) => {
  patches(m, r, [GR.SAND], GR.PATH, 12, 2, 5);
  halo(m, 6, 12, 22, 26, [GR.SAND, GR.PATH], GR.GRASS, 2); [[8, 15], [20, 15], [8, 20], [20, 21], [12, 15], [16, 23], [11, 23]].forEach(([x, y]) => putObj(m, x, y, O.PALM));
  [[7, 18], [9, 23], [18, 24], [19, 18]].forEach(([x, y]) => putObj(m, x, y, O.BUSH)); scatter(m, r, [O.FLOWER, O.BUSH], 24, 6, 13, 21, 25, [GR.GRASS]);
  house(m, 10, 27, 3, O.ROOF, 1); house(m, 17, 27, 3, O.ROOFG, 1); [[13, 28], [14, 29], [15, 28], [9, 30], [20, 30]].forEach(([x, y]) => putObj(m, x, y, y % 2 ? O.CRATE : O.BARREL)); lamp(m, 14, 27, '#ffb050', 6); lamp(m, 15, 24, '#ffb050', 5);
  ruinBox(m, r, 8, 6, 7, 5, O.WALL, GR.DSTONE); ruinBox(m, r, 50, 28, 6, 5, O.WALL, GR.DSTONE); ruinBox(m, r, 4, 35, 5, 4, O.WALL, GR.DSTONE);
  [[27, 21], [32, 21], [27, 17], [32, 17]].forEach(([x, y]) => putObj(m, x, y, O.STATUE)); [[24, 14], [35, 14], [24, 27], [35, 27]].forEach(([x, y]) => lamp(m, x, y, '#ffb050', 4));
  [[43, 5], [55, 5], [43, 13], [55, 13]].forEach(([x, y]) => lamp(m, x, y, '#ff6a2a', 5));
  for (let i = 0; i < 6; i++) grove(m, r, rint(5, 54), rint(5, 40), 3, [O.CACTUS, O.SROCK, O.DEAD, O.BONES], .35, [GR.SAND, GR.PATH]);
};
DECO.winter = (m, r) => {
  patches(m, r, [GR.SNOW], GR.STONE, 6, 2, 3); patches(m, r, [GR.SNOW], GR.ICE, 8, 2, 4);
  river(m, r, [[18, 12], [22, 18], [20, 26], [18, 30]], 2, GR.ICE); river(m, r, [[40, 18], [50, 20], [56, 24]], 2, GR.ICE);
  ruinBox(m, r, 16, 17, 6, 5, O.ICEWALL, GR.ICE); ruinBox(m, r, 44, 19, 6, 4, O.ICEWALL, GR.ICE); ruinBox(m, r, 6, 28, 6, 4, O.ICEWALL, GR.ICE); ruinBox(m, r, 34, 5, 5, 4, O.ICEWALL, GR.ICE);
  lamp(m, 31, 10, '#ff8a2a', 7); lamp(m, 25, 10, '#ff8a2a', 5); [[28, 20], [28, 28], [40, 26]].forEach(([x, y]) => lamp(m, x, y, '#8ad8ff', 5));
  for (let i = 0; i < 16; i++) grove(m, r, rint(5, 55), rint(5, 40), rint(3, 5), [O.PINE, O.PINE, O.PINE, O.ROCK], .6, [GR.SNOW]);
  scatter(m, r, [O.ICEC, O.ROCK], 14, 3, 3, 58, 40, [GR.ICE, GR.STONE]); shore(m, [GR.SNOW], GR.ICE);
};
DECO.ash = (m, r) => {
  patches(m, r, [GR.ASH], GR.DSTONE, 16, 2, 4); patches(m, r, [GR.ASH], GR.DGRASS, 4, 1, 2);
  river(m, r, [[24, 3], [30, 12], [29, 30], [30, 46]], 2, GR.LAVA);
  ruinBox(m, r, 8, 30, 6, 5, O.DWALL, GR.DSTONE); ruinBox(m, r, 36, 8, 6, 5, O.DWALL, GR.DSTONE); ruinBox(m, r, 44, 32, 6, 5, O.DWALL, GR.DSTONE); ruinBox(m, r, 14, 4, 6, 4, O.DWALL, GR.DSTONE);
  [[50, 21], [50, 27], [53, 21], [53, 27], [6, 21], [6, 27], [38, 21], [38, 28]].forEach(([x, y]) => lamp(m, x, y, '#ff4a2a', 6));
  [[52, 23], [52, 26]].forEach(([x, y]) => putObj(m, x, y, O.STATUE));
  for (let i = 0; i < 6; i++) { const cx = rint(8, 50), cy = rint(6, 42); blob(m, cx, cy, 3, 2, GR.DSTONE, r); if (okT(m, cx, cy)) m.o[ix(m, cx, cy)] = O.ASHROCK; }
  let n = 0; for (let y = 0; y < m.h && n < 26; y++) for (let x = 0; x < m.w && n < 26; x++) if (m.g[ix(m, x, y)] === GR.LAVA && (x * 7 + y * 3) % 13 === 0) { LT(m, x, y, 3, '#ff4a1a'); n++; }
  for (let i = 0; i < 8; i++) grove(m, r, rint(5, 52), rint(5, 44), rint(2, 4), [O.DEAD, O.ASHROCK, O.BONES, O.RUBBLE], .4, [GR.ASH, GR.DSTONE]);
  shore(m, [GR.ASH], GR.DSTONE);
};

