'use strict';
// ---------- Карты: помощники + Столица + Джунгли ----------
NPCS.board = { n: 'Доска объявлений', role: 'Задания', board: 1 };
ENEMIES.dummy = { n: 'Тренировочный манекен', hp: 400, atk: 0, def: 0, spd: 0, xp: 0, gold: [0, 0], aggro: 0, kind: 'dummy', wind: 1, cd: 9, reach: 0, spr: 'dummy', sz: 6, drops: [], info: '' };

const MAPS = {};
function newMap(id, w, h, g0, reg) {
  return { id, w, h, reg, g: new Uint8Array(w * h).fill(g0), o: new Uint8Array(w * h), keep: new Uint8Array(w * h),
    npcs: [], spawns: [], things: [], exits: [], lights: [], gates: [], start: [w >> 1, h >> 1] };
}
const ix = (m, x, y) => y * m.w + x;
const inb = (m, x, y) => x >= 0 && y >= 0 && x < m.w && y < m.h;
function fillG(m, x, y, w, h, g) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (inb(m, i, j)) m.g[ix(m, i, j)] = g; }
function fillO(m, x, y, w, h, o) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (inb(m, i, j)) m.o[ix(m, i, j)] = o; }
function ringO(m, x, y, w, h, o) { for (let i = x; i < x + w; i++) { setO(m, i, y, o); setO(m, i, y + h - 1, o); } for (let j = y; j < y + h; j++) { setO(m, x, j, o); setO(m, x + w - 1, j, o); } }
function ringG(m, x, y, w, h, t, g) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (i < x + t || j < y + t || i >= x + w - t || j >= y + h - t) m.g[ix(m, i, j)] = g; }
function setO(m, x, y, o) { if (inb(m, x, y)) m.o[ix(m, x, y)] = o; }
function blob(m, cx, cy, rx, ry, g, r) {
  for (let j = cy - ry - 1; j <= cy + ry + 1; j++) for (let i = cx - rx - 1; i <= cx + rx + 1; i++) {
    const d = ((i - cx) / rx) ** 2 + ((j - cy) / ry) ** 2; if (d < 1 - (r ? r() * .35 : 0) && inb(m, i, j)) { m.g[ix(m, i, j)] = g; if (g === GR.WATER || g === GR.LAVA) m.o[ix(m, i, j)] = 0; }
  }
}
function path(m, pts, g, wid) {
  wid = wid || 2;
  const dot = (x, y) => { for (let j = 0; j < wid; j++) for (let i = 0; i < wid; i++) if (inb(m, x + i, y + j)) { const k = ix(m, x + i, y + j); if (m.g[k] !== GR.WATER) m.g[k] = g; m.o[k] = 0; m.keep[k] = 1; } };
  for (let n = 0; n < pts.length - 1; n++) {
    let [x, y] = pts[n]; const [x1, y1] = pts[n + 1];
    while (x !== x1) { dot(x, y); x += Math.sign(x1 - x); }
    while (y !== y1) { dot(x, y); y += Math.sign(y1 - y); }
    dot(x1, y1);
  }
}
function clearKeep(m, x, y, w, h) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (inb(m, i, j)) { m.keep[ix(m, i, j)] = 1; m.o[ix(m, i, j)] = 0; } }
function scatter(m, r, objs, n, x0, y0, x1, y1, grounds) {
  let placed = 0, tries = n * 12;
  while (placed < n && tries-- > 0) {
    const x = rint(x0, x1), y = rint(y0, y1), k = ix(m, x, y); if (!inb(m, x, y)) continue;
    const rr = r(); const x2 = Math.floor(x0 + rr * (x1 - x0 + 1)); void x2;
    if (m.o[k] || m.keep[k]) continue; if (grounds && !grounds.includes(m.g[k])) continue;
    if (m.g[k] === GR.WATER || m.g[k] === GR.LAVA || m.g[k] === GR.BRIDGE) continue;
    m.o[k] = Array.isArray(objs) ? objs[Math.floor(r() * objs.length)] : objs; placed++;
  }
}
function house(m, x, y, w, roof, door) {
  fillO(m, x, y, w, 1, roof); fillO(m, x, y + 1, w, 1, O.WALL);
  for (let i = 1; i < w - 1; i += 2) setO(m, x + i, y + 1, O.WINDOW);
  setO(m, x + (door === undefined ? w >> 1 : door), y + 1, O.DOOR); clearKeep(m, x + (door === undefined ? w >> 1 : door), y + 2, 1, 1);
}
const T = (m, o) => { m.things.push(o); return o; };
const NP = (m, id, x, y) => m.npcs.push({ id, x, y });
const SP = (m, t, x, y, n, sp) => m.spawns.push({ t, x, y, n: n || 1, sp: sp || 2 });
const EX = (m, x, y, w, h, to, tx, ty, req, msg) => m.exits.push({ x, y, w, h, to, tx, ty, req, msg });
const LT = (m, x, y, r, c) => m.lights.push([x, y, r || 5, c || '#ffb050']);
function bridge(m, x, y, w, h) { fillG(m, x, y, w, h, GR.BRIDGE); fillO(m, x, y, w, h, 0); clearKeep(m, x, y, w, h); }
function chest(m, id, x, y, loot, gold) { return T(m, { t: 'chest', id, x, y, loot: loot || [], gold: gold || 0 }); }
function pickup(m, id, x, y, item, o) { return T(m, Object.assign({ t: 'pick', id, x, y, item, n: 1 }, o || {})); }
function crack(m, id, x, y) { setO(m, x, y, O.CRACK); return T(m, { t: 'crack', id, x, y }); }
function secretRoom(m, id, x, y, w, h, cx, chr, loot, gold) {      // комната со стеной-трещиной снизу
  fillG(m, x, y, w, h, GR.STONE); ringO(m, x - 1, y - 1, w + 2, h + 2, O.WALL); fillG(m, x - 1, y - 1, w + 2, h + 2, GR.STONE); fillG(m, x, y, w, h, GR.DSTONE);
  fillO(m, x, y, w, h, 0); clearKeep(m, x, y, w, h);
  crack(m, id + '_c', cx, y + h); chest(m, id + '_ch', x + 1, y, loot, gold); pickup(m, id + '_chr', x + w - 2, y, chr, { lore: 1 });
  LT(m, x + w / 2, y + h / 2, 4, '#9ac8ff');
}
function gateAt(m, flag, tiles, o) { m.gates.push({ flag, tiles }); tiles.forEach(([x, y]) => setO(m, x, y, o || O.GATE)); }

// ======================= СТОЛИЦА =======================
MAPS.capital = () => {
  const m = newMap('capital', 64, 48, GR.GRASS, 'capital'), r = mulberry32(101);
  ringG(m, 0, 0, 64, 48, 2, GR.WATER);
  fillG(m, 18, 12, 29, 23, GR.STONE);
  path(m, [[31, 4], [31, 40]], GR.PATH, 2); path(m, [[6, 23], [56, 23]], GR.PATH, 2); path(m, [[26, 19], [37, 19]], GR.PATH, 1);
  fillG(m, 26, 19, 12, 8, GR.PATH); clearKeep(m, 26, 19, 12, 8);
  path(m, [[10, 24], [10, 30], [6, 42]], GR.PATH, 2); path(m, [[35, 35], [35, 42], [55, 42]], GR.PATH, 2); path(m, [[56, 23], [56, 36]], GR.PATH, 2);
  ringO(m, 18, 12, 29, 23, O.WALL);
  // проёмы: запад, восток, юг; север — закрытые ворота
  fillO(m, 18, 22, 1, 4, 0); fillO(m, 46, 22, 1, 4, 0); fillO(m, 31, 34, 2, 1, 0); clearKeep(m, 18, 22, 1, 4); clearKeep(m, 46, 22, 1, 4); clearKeep(m, 31, 34, 2, 1);
  gateAt(m, 'ch1_done', [[31, 12], [32, 12]]);
  setO(m, 30, 13, O.TORCH); setO(m, 33, 13, O.TORCH); LT(m, 30, 13, 6); LT(m, 33, 13, 6); LT(m, 30, 33, 6); LT(m, 33, 33, 6);
  // дома
  house(m, 20, 14, 6, O.ROOFB, 3); house(m, 34, 14, 5, O.ROOF, 2); house(m, 40, 14, 5, O.ROOFG, 2);
  house(m, 20, 28, 6, O.ROOF, 3); house(m, 40, 28, 6, O.ROOFB, 2); house(m, 27, 29, 4, O.ROOFG, 2);
  setO(m, 32, 20, O.STATUE); setO(m, 35, 17, O.BARREL); setO(m, 38, 17, O.BARREL); setO(m, 26, 17, O.CRATE); setO(m, 19, 17, O.BARREL);
  LT(m, 32, 21, 7, '#ffd890');
  // тренировочная площадка
  fillG(m, 34, 30, 7, 4, GR.WOOD); ringO(m, 33, 29, 9, 1, O.CRATE); setO(m, 37, 29, 0);
  SP(m, 'dummy', 35, 31, 1, 0); SP(m, 'dummy', 37, 32, 1, 0); SP(m, 'dummy', 39, 31, 1, 0);
  T(m, { t: 'sign', x: 37, y: 28, lines: [['Табличка', 'ТРЕНИРОВОЧНАЯ ПЛОЩАДКА. Бей манекены: ЛКМ / K — клинок, пробел — перекат, 1–4 — умения, Q/R — зелья.']] });
  // NPC
  NP(m, 'orven', 30, 22); NP(m, 'liara', 36, 17); NP(m, 'brogar', 22, 17); NP(m, 'darek', 30, 15); NP(m, 'mirena', 42, 17);
  NP(m, 'tim', 28, 26); NP(m, 'bert', 24, 25); NP(m, 'nela', 43, 25); NP(m, 'board', 28, 21);
  T(m, { t: 'save', x: 34, y: 22 });
  // за пределами: озеро, часовня, каменоломня, руины
  blob(m, 16, 8, 5, 3, GR.WATER, r);
  fillG(m, 3, 4, 7, 6, GR.STONE);
  secretRoom(m, 'cap_chapel', 4, 5, 5, 3, 6, 'chr1', [['amulet_vit', 1]], 50);
  fillG(m, 4, 5, 5, 3, GR.DSTONE);
  [[5, 10], [6, 11], [7, 10], [8, 11], [4, 11]].forEach(([x, y]) => { setO(m, x, y, O.BUSH); });
  m.o[ix(m, 6, 8)] = O.CRACK;
  pickup(m, 'teddy', 11, 13, 'teddy', { qi: 'teddy', q: 's_tim', label: 'Плюшевый мишка', ic: 'scroll' });
  fillG(m, 3, 20, 10, 9, GR.STONE); [[4, 21], [7, 22], [10, 21], [5, 25], [9, 26], [12, 24], [4, 28]].forEach(([x, y], i) => { setO(m, x, y, O.ROCK); pickup(m, 'ore' + i, x + 1, y, 'ore', { label: 'Жила руды', ic: 'ore' }); });
  clearKeep(m, 3, 20, 10, 9); fillO(m, 3, 20, 10, 9, 0);
  [[4, 21], [7, 22], [10, 21], [5, 25], [9, 26], [12, 24], [4, 28]].forEach(([x, y]) => { setO(m, x, y, O.ROCK); });
  fillG(m, 5, 37, 12, 7, GR.STONE); [[6, 38], [10, 38], [15, 38], [6, 42], [15, 42]].forEach(([x, y]) => setO(m, x, y, O.PILLAR));
  [[8, 40], [13, 40], [9, 42], [12, 38]].forEach(([x, y]) => setO(m, x, y, O.RUBBLE));
  pickup(m, 'tablet', 11, 41, 'tablet', { qi: 'tablet', q: 'm1', label: 'Древняя табличка', ic: 'scroll' });
  T(m, { t: 'sign', x: 9, y: 39, lines: [['Надпись', '«Здесь Дом Эльдарнов принёс клятву у Источника. Да будет она нерушима».']] });
  chest(m, 'cap_ruin', 14, 41, [['potion_mp', 2], ['herb', 2]], 30);
  // лагерь разбойников
  fillG(m, 50, 31, 9, 8, GR.PATH); [[51, 32], [57, 32], [52, 37], [56, 37]].forEach(([x, y], i) => setO(m, x, y, i % 2 ? O.BARREL : O.CRATE));
  chest(m, 'cap_camp', 54, 34, [['potion_hp', 2], ['antidote', 1]], 45); LT(m, 54, 35, 5);
  // растительность
  scatter(m, r, [O.TREE, O.TREE, O.BUSH, O.FLOWER], 260, 2, 2, 61, 45, [GR.GRASS]);
  // враги
  SP(m, 'wolf', 40, 40, 3, 4); SP(m, 'wolf', 50, 18, 3, 4); SP(m, 'goblin', 22, 40, 3, 4); SP(m, 'goblin', 48, 28, 2, 3); SP(m, 'bandit', 54, 35, 4, 3); SP(m, 'wolf', 22, 33, 2, 3); SP(m, 'orc', 12, 40, 1, 1); SP(m, 'goblin', 8, 30, 2, 2);
  EX(m, 31, 0, 2, 1, 'jungle', 31, 52); EX(m, 63, 22, 1, 4, 'desert', 3, 22, () => F('jungle_done'), 'Мост завален. Капитан Дарек: «Сначала разберись с Джунглями».');
  bridge(m, 31, 0, 2, 4); bridge(m, 60, 22, 4, 4);
  m.start = [31, 25]; return m;
};

// ======================= ДЖУНГЛИ =======================
MAPS.jungle = () => {
  const m = newMap('jungle', 64, 56, GR.JGRASS, 'jungle'), r = mulberry32(202);
  ringG(m, 0, 0, 64, 56, 2, GR.WATER);
  path(m, [[31, 52], [31, 17]], GR.PATH, 2); path(m, [[31, 40], [8, 40], [8, 28]], GR.PATH, 2); path(m, [[32, 33], [62, 33], [62, 20], [56, 20]], GR.PATH, 2);
  path(m, [[40, 33], [40, 46]], GR.PATH, 2); path(m, [[48, 33], [50, 40]], GR.PATH, 2);
  path(m, [[56, 20], [56, 9], [52, 9]], GR.PATH, 1);
  // храм
  ringO(m, 24, 3, 17, 14, O.WALL); fillG(m, 25, 4, 15, 12, GR.STONE); fillO(m, 25, 4, 15, 12, 0); clearKeep(m, 25, 4, 15, 12);
  gateAt(m, 'jtemple_open', [[31, 16], [32, 16]]); fillG(m, 31, 16, 2, 1, GR.STONE);
  [[27, 6], [37, 6], [27, 13], [37, 13]].forEach(([x, y]) => { setO(m, x, y, O.PILLAR); LT(m, x, y, 4, '#7aff9a'); });
  T(m, { t: 'boss', id: 'forest_guard', x: 32, y: 8, area: [26, 5, 38, 14] });
  chest(m, 'jun_temple', 26, 5, [['potion_hp2', 1]], 80);
  // рычаги
  pickup(m, 'jl1', 8, 27, null, { t: 'lever', qi: 'jlever', q: 'm2', label: 'Рунный рычаг', once: 1, jl: 1 });
  pickup(m, 'jl2', 40, 47, null, { t: 'lever', qi: 'jlever', q: 'm2', label: 'Рунный рычаг', once: 1, jl: 1 });
  m.things.forEach(t => { if (t.jl) { t.t = 'lever'; delete t.item; } });
  T(m, { t: 'save', x: 29, y: 19 });
  NP(m, 'ila', 29, 49);
  // следы разведчика
  pickup(m, 'scout', 50, 41, 'signet', { qi: 'scout', q: 's_scout', label: 'Останки разведчика', ic: 'ring' });
  setO(m, 49, 42, O.BONES);
  // травы
  [[14, 44], [20, 36], [41, 24], [58, 40], [24, 26], [12, 12]].forEach(([x, y], i) => pickup(m, 'herb' + i, x, y, 'herb', { label: 'Лесная трава', ic: 'herb' }));
  // пещера пауков
  blob(m, 14, 44, 7, 5, GR.DGRASS, r); LT(m, 14, 44, 6, '#a060ff'); chest(m, 'jun_cave', 17, 46, [['art_forest', 0].slice(0, 0), ['potion_mp2', 1]].filter(a => a.length), 120);
  secretRoom(m, 'jun_sec', 50, 5, 5, 3, 52, 'chr2', [['ring_int', 1]], 60);  // растительность
  scatter(m, r, [O.JTREE, O.JTREE, O.JTREE, O.PALM, O.BUSH, O.FLOWER], 900, 2, 2, 61, 53, [GR.JGRASS, GR.DGRASS]);
  // враги
  SP(m, 'goblin', 28, 44, 3, 4); SP(m, 'goblin', 44, 38, 3, 4); SP(m, 'wolf', 20, 24, 3, 4); SP(m, 'wolf', 52, 28, 3, 4); SP(m, 'spider', 14, 44, 4, 4); SP(m, 'spider', 54, 40, 2, 3);
  SP(m, 'ruinguard', 26, 20, 1, 1); SP(m, 'ruinguard', 38, 20, 1, 1); SP(m, 'goblin', 24, 36, 3, 4); SP(m, 'bandit', 46, 16, 2, 3); SP(m, 'orc', 12, 20, 1, 1); SP(m, 'spider', 40, 26, 2, 3);
  EX(m, 31, 55, 2, 1, 'capital', 31, 4); EX(m, 63, 20, 1, 4, 'fortress', 3, 22);
  bridge(m, 31, 52, 2, 4); bridge(m, 60, 20, 4, 4);
  m.start = [31, 51]; return m;
};
