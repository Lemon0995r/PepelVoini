'use strict';
// ---------- Секреты: пещеры, ловушки, засады, тайники ----------
const CAVE = {
  capital: { den: ['goblin', 'wolf', 'bandit'], loot: [[['ring_str', 1]], [['amulet_vit', 1]], [['potion_hp2', 2], ['ore', 3]]], col: '#ffb050', n: 3 },
  jungle: { den: ['spider', 'spider', 'goblin'], loot: [[['ring_dex', 1]], [['potion_mp2', 2], ['silk', 3]], [['amulet_guard', 1]]], col: '#8aff6a', n: 3 },
  fortress: { den: ['skeleton', 'knight', 'crossbow'], loot: [[['ring_int', 1]], [['potion_hp2', 2], ['ore', 4]], [['helm_iron', 1], ['potion_mp2', 1]]], col: '#9ac8ff', n: 2 },
  desert: { den: ['scorpion', 'mummy', 'jackal'], loot: [[['amulet_sand', 1]], [['potion_hp2', 2], ['scale', 2]], [['ring_str', 1]]], col: '#ffc060', n: 3 },
  winter: { den: ['frostwolf', 'wraith', 'frozen'], loot: [[['crystal', 3]], [['ring_int', 1], ['potion_mp2', 1]], [['armor_frost', 1]]], col: '#8ae0ff', n: 3 },
  ash: { den: ['hound', 'ashwar', 'ashmage'], loot: [[['ash_shard', 3]], [['elixir', 1]], [['potion_hp2', 3], ['ash_shard', 2]]], col: '#ff5a3a', n: 3 }
};
const DIG = { capital: ['herb', 'ore'], jungle: ['herb', 'silk'], fortress: ['ore', 'potion_mp'], desert: ['scale', 'ore'], winter: ['crystal', 'ore'], ash: ['ash_shard', 'ore'] };
const BIOME_WALL = {
  capital: { wall: O.CAVEROCK, floor: GR.PATH }, jungle: { wall: O.MOSSWALL, floor: GR.STONE }, fortress: { wall: O.WALL, floor: GR.DSTONE },
  desert: { wall: O.SANDWALL, floor: GR.PATH }, winter: { wall: O.ICEWALL, floor: GR.ICE }, ash: { wall: O.OBSWALL, floor: GR.DSTONE }
};
// форма и тип секрета зависят от биома
const TYPES = {
  capital: [{ shape: 'blob', name: 'Пещера контрабандистов' }, { shape: 'ellipse', name: 'Старый подвал' }, { shape: 'diamond', name: 'Тайная кладовая' }],
  jungle: [{ shape: 'cross', name: 'Заросший храм' }, { shape: 'ellipse', name: 'Полое дерево' }, { shape: 'blob', name: 'Логово пауков' }],
  fortress: [{ shape: 'rect', name: 'Темница', inner: [[3, 2], [3, 3], [5, 2], [5, 3]] }, { shape: 'cross', name: 'Склеп' }],
  desert: [{ shape: 'octagon', name: 'Гробница' }, { shape: 'L', name: 'Раскоп' }, { shape: 'blob', name: 'Пещера' }],
  winter: [{ shape: 'blob', name: 'Ледяная пещера' }, { shape: 'diamond', name: 'Замёрзший грот' }, { shape: 'ellipse', name: 'Ледяной зал' }],
  ash: [{ shape: 'ellipse', name: 'Лавовая пещера', altar: 1 }, { shape: 'octagon', name: 'Пепельный алтарь', altar: 1 }, { shape: 'blob', name: 'Обугленная пещера' }]
};
const DECOR = { capital: [O.BARREL, O.CRATE, O.BARREL], jungle: [O.BUSH, O.BUSH, O.FLOWER], fortress: [O.BONES, O.RUBBLE, O.BONES], desert: [O.BONES, O.RUBBLE, O.BONES], winter: [O.ICEC, O.RUBBLE, O.ICEC], ash: [O.RUBBLE, O.BONES, O.RUBBLE] };
function makeMask(shape, r, W, H) {
  const cx = (W - 1) / 2, cy = (H - 1) / 2, M = [];
  for (let j = 0; j < H; j++) { M.push([]); for (let i = 0; i < W; i++) {
    const dx = (i - cx) / (W / 2 + .1), dy = (j - cy) / (H / 2 + .1); let on = false;
    if (shape === 'ellipse') on = dx * dx + dy * dy <= 1;
    else if (shape === 'diamond') on = Math.abs(dx) + Math.abs(dy) <= 1.12;
    else if (shape === 'cross') on = Math.abs(i - cx) <= 1 || Math.abs(j - cy) <= 1;
    else if (shape === 'L') on = i <= cx || j >= cy + 1;
    else if (shape === 'octagon') on = Math.max(Math.abs(dx), Math.abs(dy), (Math.abs(dx) + Math.abs(dy)) * .72) <= .98;
    else if (shape === 'rect') on = true;
    else on = dx * dx + dy * dy <= .55 + r() * .75;           // blob
    M[j].push(on); } }
  for (let j = 0; j < H; j++) M[j][(W - 1) >> 1] = true; // центральный проход
  
  // оставляем только связную область от центра
  const seen = M.map(r2 => r2.map(() => false)), st = [[(W - 1) >> 1, H >> 1]]; seen[H >> 1][(W - 1) >> 1] = true;
  while (st.length) { const [i, j] = st.pop(); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([a, b]) => { const u = i + a, w = j + b; if (u >= 0 && w >= 0 && u < W && w < H && M[w][u] && !seen[w][u]) { seen[w][u] = true; st.push([u, w]); } }); }
  return seen;
}
function addSecrets(m, id) {
  const cf = CAVE[id]; if (!cf) return m; const r = mulberry32(id.length * 7919 + m.w), core = m.core, W0 = 9, H0 = 7, taken = [], occ = new Uint8Array(m.w * m.h), occS = new Uint8Array(m.w * m.h);
  const mark = (x, y, d) => { for (let j = -d; j <= d; j++) for (let i = -d; i <= d; i++) if (inb(m, x + i, y + j)) occ[ix(m, x + i, y + j)] = 1; };
  m.npcs.forEach(n => mark(n.x, n.y, 3)); m.things.forEach(t => { if (t.x !== undefined) mark(t.x, t.y, 3); }); m.exits.forEach(e => mark(e.x + (e.w >> 1), e.y + (e.h >> 1), 5)); m.spawns.forEach(q => { for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) if (inb(m, q.x + i, q.y + j)) occS[ix(m, q.x + i, q.y + j)] = 1; }); mark(m.start[0], m.start[1], 4); m.gates.forEach(g => g.tiles.forEach(([x, y]) => mark(x, y, 2)));
  let strict = true, loose = false, W = W0, H = H0;
  const area = (x, y) => { const pd = strict ? 2 : loose ? 0 : 1; for (let j = y - pd; j <= y + H + pd; j++) for (let i = x - pd; i <= x + W + pd - 1; i++) { if (!inb(m, i, j)) return false; const k = ix(m, i, j); if (m.g[k] === GR.WATER || m.g[k] === GR.LAVA || m.g[k] === GR.BRIDGE || occ[k] || (!loose && occS[k])) return false; const o = m.o[k]; if (o === O.WALL || o === O.DWALL || o === O.ROOF || o === O.ROOFB || o === O.ROOFG || o === O.GATE || o === O.DOOR || o === O.WINDOW || o === O.ICEWALL || (strict && m.g[k] === GR.PATH) || (core && inCore(core, i, j) && (id === 'capital'))) return false; } return !taken.some(t => Math.abs(t[0] - x) < (strict ? 14 : 11) && Math.abs(t[1] - y) < (strict ? 12 : 10)); };
  const trapAt = (x, y, ph) => T(m, { t: 'trap', x, y, ph });
  for (let n = 0; n < cf.n; n++) {
    strict = true; let pos = null; W = W0; H = H0; loose = false; for (let t = 0; t < 6000 && !pos; t++) { if (t === 1500) strict = false; if (t === 3000) { W = 7; H = 5; } if (t === 4500) loose = true; const mg = strict ? 8 : 4, x = rint2(r, mg, m.w - W - mg), y = rint2(r, mg, m.h - H - mg - 2); if (area(x, y)) pos = [x, y]; } if (!pos) continue;
    const [x, y] = pos; taken.push(pos); const cid = 'cv' + n, v = n % 4, ty0 = TYPES[id][n % TYPES[id].length], bw = BIOME_WALL[id];
    const CX = (W - 1) >> 1, mask = makeMask(ty0.shape, r, W, H), inM = (i, j) => i >= 0 && j >= 0 && i < W && j < H && mask[j][i];
    m.spawns = m.spawns.filter(q => q.x < x - 2 || q.x > x + W + 1 || q.y < y - 2 || q.y > y + H + 1);
    // стены вокруг всей формы
    fillO(m, x - 2, y - 2, W + 4, H + 4, 0);
    for (let j = -1; j <= H; j++) for (let i = -1; i <= W; i++) {
      let near = false; for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) if (inM(i + di, j + dj)) near = true;
      const k = ix(m, x + i, y + j); if (inM(i, j)) { m.g[k] = bw.floor; m.o[k] = 0; } else if (near) { m.g[k] = bw.floor; m.o[k] = bw.wall; }
      m.keep[k] = 1; }
    if (ty0.inner && W === 9) ty0.inner.forEach(([i, j]) => setO(m, x + i, y + j, bw.wall));
    // верхняя и нижняя точки по центральной колонке
    let top = 0; while (!inM(CX, top)) top++; let bot = H - 1; while (!inM(CX, bot)) bot--;
    const cx = x + CX, cy = y + top, ex = cx, ey = y + bot + 1;
    crack(m, cid + '_c', ex, ey); m.keep[ix(m, ex, ey + 1)] = 1; m.o[ix(m, ex, ey + 1)] = 0; m.keep[ix(m, ex, ey)] = 1;
    // факелы на стенах у верхнего края
    [CX - 2, CX + 2].forEach(i => { let j = 0; while (j < H && !inM(i, j)) j++; if (j < H) { setO(m, x + i, y + j - 1, O.TORCH); LT(m, x + i, y + j, 3, '#ffb050'); } });
    LT(m, cx, y + (H >> 1), 5, cf.col);
    const cells = []; for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) if (inM(i, j) && !(ty0.inner && W === 9 && ty0.inner.some(q => q[0] === i && q[1] === j))) cells.push([x + i, y + j]);
    const side = cells.filter(([i, j]) => Math.abs(i - cx) >= 2 && j > cy && j < y + bot - 0);
    DECOR[id].forEach(o => { for (let t = 0; t < 4; t++) { const c = side[Math.floor(r() * side.length)]; if (c && !m.o[ix(m, c[0], c[1])]) { setO(m, c[0], c[1], o); break; } } });
    const loot = cf.loot[n % cf.loot.length], gold = 60 + n * 40, mid = [x + CX, y + (H >> 1)];
    const cellsIn = (i0, i1, j0, j1) => cells.filter(([i, j]) => i >= x + i0 && i <= x + i1 && j >= y + j0 && j <= y + j1 && !m.o[ix(m, i, j)]);
    if (ty0.altar) setO(m, mid[0], mid[1], O.STATUE);
    const chestAt = ty0.altar ? [cx, cy] : [cx, cy];
    if (v === 0) {                         // сокровищница с шипами
      chest(m, cid + '_ch', chestAt[0], chestAt[1], loot, gold); cellsIn(1, W - 2, top + 1, top + 4).forEach(([i, j], q) => { if (Math.abs(i - cx) <= 3 && !(i === cx && j <= cy + 1) && q % 2 === 0) trapAt(i, j, (i + j) * .35); });
    } else if (v === 1) {                  // логово
      chest(m, cid + '_ch', chestAt[0], chestAt[1], loot, gold); SP(m, cf.den[0], mid[0], mid[1] + 1, 2, 2); SP(m, cf.den[1], mid[0], mid[1] + 1, 1, 2);
    } else if (v === 2) {                  // засада: сундук оживляет стражей
      chest(m, cid + '_ch', chestAt[0], chestAt[1], loot, gold).ambush = [cf.den[2], cf.den[0], cf.den[1]]; cellsIn(1, W - 2, top + 2, H).slice(0, 2).forEach(([i, j]) => setO(m, i, j, O.BONES));
    } else {                               // сундук-мина
      const c = chest(m, cid + '_ch', chestAt[0], chestAt[1], loot, gold); c.trapped = 1; const pk = cellsIn(1, W - 2, top + 2, H).filter(c2 => c2[0] !== cx);
      if (pk[0]) pickup(m, cid + '_p', pk[0][0], pk[0][1], DIG[id][0]); if (pk.length > 1) pickup(m, cid + '_q', pk[pk.length - 1][0], pk[pk.length - 1][1], DIG[id][1]);
    }
    clearKeep(m, cx, cy, 1, 1);
    // подсказки снаружи
    setO(m, ex - 2, ey + 1, O.ROCK); setO(m, ex + 2, ey + 2, O.ROCK);
  }
  // ловушки у ничейных сундуков в руинах
  m.things.filter(t => t.t === 'chest' && /^w\d/.test(t.id)).forEach((c, i) => { if (i % 2) return; [[-1, 0], [1, 0], [0, 1], [0, 2]].forEach(([dx, dy], q) => { const x = c.x + dx, y = c.y + dy, k = ix(m, x, y); if (inb(m, x, y) && !m.o[k] && !HARD.includes(m.g[k]) && !m.keep[k]) trapAt(x, y, q * .6); }); });
  // клады: сверкающие тайники в глухих углах
  for (let n = 0, t = 0; n < 4 && t < 400; t++) { const p = randLand(m, r, core || { x: -9, y: -9, w: 0, h: 0 }, id === 'capital', 1); if (!p) break; const k = ix(m, p[0], p[1]); if (m.g[k] === GR.WATER || taken.some(q => Math.hypot(q[0] - p[0], q[1] - p[1]) < 6)) continue; pickup(m, 'dg' + n, p[0], p[1], DIG[id][n % 2], { n: 1 + (n % 2) }); m.keep[k] = 1; n++; }
  return connect(m);
}
[O.MOSSWALL, O.SANDWALL, O.CAVEROCK, O.OBSWALL].forEach(i => WALLISH.add(i));
const rint2 = (r, a, b) => Math.floor(a + r() * (b - a + 1));
const _buildMap0 = buildMap;
buildMap = function (id) { const rr = Math.random; const m = _buildMap0(id); Math.random = mulberry32(id.length * 31 + 7); try { return addSecrets(m, id); } finally { Math.random = rr; } };
