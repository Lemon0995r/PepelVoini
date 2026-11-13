'use strict';
// ---------- Город: интерьеры (кузница, лавка, лекарня, библиотека, башня, таверна), жильё, новые NPC ----------
const INTERIORS = {};
function mkInterior(id, title, build) {
  INTERIORS[id] = () => {
    const m = newMap(id, 32, 20, GR.DSTONE, 'capital'); m.title = title;
    fillG(m, 6, 4, 20, 12, GR.WOOD); ringO(m, 6, 4, 20, 12, O.WALL); fillO(m, 15, 15, 2, 1, 0); fillG(m, 15, 15, 2, 1, GR.WOOD);
    for (let x = 7; x < 25; x += 4) setO(m, x, 4, O.WINDOW);
    LT(m, 10, 6, 8, '#ffcf8a'); LT(m, 21, 6, 8, '#ffcf8a'); LT(m, 15, 11, 9, '#ffd8a0');
    build(m); m.start = [15, 13];
    T(m, { t: 'door', x: 15, y: 15, to: 'capital', label: 'Выйти на улицу' }); T(m, { t: 'door', x: 16, y: 15, to: 'capital', label: 'Выйти на улицу' }); for (let j = 4; j < 16; j++) for (let i = 6; i < 26; i++) m.keep[ix(m, i, j)] = 1; fillO(m, 15, 15, 2, 1, 0); return m;
  };
}
// маленькие помощники для интерьера
const put = (m, o, pts) => pts.forEach(([x, y]) => setO(m, x, y, o));
const row = (m, o, x0, x1, y) => { for (let x = x0; x <= x1; x++) setO(m, x, y, o); };
mkInterior('in_forge', 'Кузница Брогара', m => {
  put(m, O.FURNACE, [[8, 5], [10, 5]]); LT(m, 9, 6, 6, '#ff7a2a'); put(m, O.RACK, [[13, 5], [15, 5], [17, 5]]); put(m, O.BANNER, [[20, 5], [23, 5]]);
  put(m, O.ANVIL, [[9, 8], [21, 8]]); put(m, O.BARREL, [[7, 13], [24, 7], [24, 13]]); put(m, O.CRATE, [[7, 12], [23, 13]]); row(m, O.COUNTER, 13, 18, 8); put(m, O.RUG, [[14, 12], [15, 12], [16, 12], [17, 12]]);
  NP(m, 'brogar', 15, 7);
});
mkInterior('in_shop', 'Лавка Лиары', m => {
  row(m, O.SHELF, 8, 23, 5); put(m, O.STALL, [[8, 8], [22, 8]]); row(m, O.COUNTER, 12, 19, 9); put(m, O.CRATE, [[7, 13], [8, 13], [24, 12]]); put(m, O.BARREL, [[24, 13], [23, 13]]); put(m, O.RUG, [[13, 12], [14, 12], [15, 12], [16, 12], [17, 12]]); put(m, O.BANNER, [[7, 8], [24, 8]]);
  NP(m, 'liara', 15, 8);
});
mkInterior('in_clinic', 'Лекарня сестры Мирены', m => {
  put(m, O.BED, [[7, 6], [7, 9], [7, 12], [24, 6], [24, 9]]); put(m, O.CAULDRON, [[20, 6], [11, 6]]); row(m, O.SHELF, 13, 18, 5); row(m, O.COUNTER, 14, 17, 8); put(m, O.RUG, [[14, 12], [15, 12], [16, 12], [17, 12]]); put(m, O.TABLE, [[21, 11]]);
  NP(m, 'mirena', 15, 7);
});
mkInterior('in_library', 'Книжная лавка Ноэль', m => {
  row(m, O.SHELF, 8, 14, 5); row(m, O.SHELF, 17, 23, 5); row(m, O.SHELF, 8, 10, 7); row(m, O.SHELF, 21, 23, 7); row(m, O.COUNTER, 13, 18, 10); put(m, O.TABLE, [[9, 11], [22, 11], [9, 13]]); put(m, O.RUG, [[14, 13], [15, 13], [16, 13], [17, 13]]); put(m, O.BANNER, [[15, 5]]);
  NP(m, 'noel', 15, 9);
});
mkInterior('in_tower', 'Башня чародейки', m => {
  put(m, O.CAULDRON, [[8, 6], [23, 6]]); row(m, O.SHELF, 10, 13, 5); row(m, O.SHELF, 18, 21, 5); put(m, O.BANNER, [[15, 5]]); row(m, O.COUNTER, 13, 18, 9); put(m, O.RUG, [[12, 12], [13, 12], [14, 12], [15, 12], [16, 12], [17, 12], [18, 12], [19, 12]]); put(m, O.STATUE, [[8, 12], [23, 12]]); put(m, O.TABLE, [[22, 9]]);
  NP(m, 'seyra', 15, 8);
});
mkInterior('in_tavern', 'Таверна «Пьяный гоблин»', m => {
  row(m, O.COUNTER, 8, 14, 7); put(m, O.BARREL, [[8, 5], [9, 5], [10, 5], [13, 5], [14, 5]]); put(m, O.SHELF, [[11, 5], [12, 5]]); put(m, O.TABLE, [[9, 10], [13, 12], [19, 8], [22, 11], [20, 13], [8, 13]]); put(m, O.NOTICE, [[24, 5]]); put(m, O.BANNER, [[18, 5], [21, 5]]); put(m, O.RUG, [[15, 9], [16, 9], [15, 10], [16, 10]]); put(m, O.HAY, [[24, 13]]);
  NP(m, 'vera', 11, 6); NP(m, 'kenn', 19, 9); NP(m, 'dorn', 22, 12);
});
// где находится дверь каждого дома (вход снаружи): [интерьер, x_двери, y_двери]
const DOORS = [['in_forge', 23, 15], ['in_shop', 36, 15], ['in_clinic', 42, 15], ['in_library', 23, 29], ['in_tower', 42, 29], ['in_tavern', 29, 30]];
const INTERIOR_N = { in_forge: 'Кузница', in_shop: 'Лавка Лиары', in_clinic: 'Лекарня', in_library: 'Книжная лавка', in_tower: 'Башня чародейки', in_tavern: 'Таверна' };
const SIGN_TXT = { in_forge: 'КУЗНИЦА · улучшения, крафт', in_shop: 'ЛАВКА ЛИАРЫ · товары, сумки, швейная', in_clinic: 'ЛЕКАРНЯ · зелья, алхимия, лечение', in_library: 'КНИЖНАЯ ЛАВКА · книги заклинаний', in_tower: 'БАШНЯ ЧАРОДЕЙКИ · зачарования', in_tavern: 'ТАВЕРНА «ПЬЯНЫЙ ГОБЛИН» · отдых, игры, заказы' };
function freeSpot(m, x, y, rad) {
  for (let r = 0; r <= (rad || 4); r++) for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) { if (Math.max(Math.abs(i), Math.abs(j)) !== r) continue; const px = x + i, py = y + j; if (!inb(m, px, py)) continue; const k = ix(m, px, py), g = m.g[k]; if (m.o[k] || g === GR.WATER || g === GR.LAVA || m.things.some(t => t.x === px && t.y === py) || m.npcs.some(n => n.x === px && n.y === py)) continue; return [px, py]; }
  return [x, y];
}
const _cap = MAPS.capital;
MAPS.capital = () => {
  const m = _cap(); m.npcs = m.npcs.filter(n => !['brogar', 'liara', 'mirena'].includes(n.id));
  DOORS.forEach(([id, dx, dy]) => {
    const ey = dy + (dy < 20 ? 2 : 1); clearKeep(m, dx, ey, 1, 2); T(m, { t: 'door', x: dx, y: ey, to: id, tx: 15, ty: 13, label: 'Войти: ' + INTERIOR_N[id] });
    const sp = freeSpot(m, dx + 1, dy + (dy < 20 ? 2 : 1), 2); T(m, { t: 'sign', x: sp[0], y: sp[1], lines: [['Вывеска', SIGN_TXT[id]]] });
  });
  // жилой квартал: колодец, ограды, сено, лавки с навесами
  const place = (o, x, y) => { const p = freeSpot(m, x, y, 3); setO(m, p[0], p[1], o); return p; };
  place(O.WELL, 31, 28); place(O.STALL, 25, 20); place(O.STALL, 38, 21); place(O.NOTICE, 27, 21); place(O.HAY, 44, 33); place(O.HAY, 45, 32);
  for (let x = 20; x <= 25; x++) { const p = freeSpot(m, x, 27, 0); if (p[0] === x && p[1] === 27) setO(m, x, 27, O.FENCE); }
  for (let x = 41; x <= 45; x++) { const p = freeSpot(m, x, 27, 0); if (p[0] === x && p[1] === 27) setO(m, x, 27, O.FENCE); }
  // NPC на площади и за стеной
  const nt = freeSpot(m, 15, 12, 4); NP(m, 'tomas', nt[0], nt[1]);
  // подарок: сумка у старта
  const bg = freeSpot(m, 33, 25, 3); chest(m, 'cap_bag', bg[0], bg[1], [['bag1', 1]], 0);
  const sg = freeSpot(m, bg[0] + 1, bg[1], 2); T(m, { t: 'sign', x: sg[0], y: sg[1], lines: [['Записка Орвена', 'Арион, возьми эту сумку. Она расширит твой инвентарь. Остальные сумки можно сшить у Лиары (материалы: кожа, шёлк) или найти у боссов и торговцев.']] });
  return m;
};
// новые NPC в других регионах
const _jun = MAPS.jungle; MAPS.jungle = () => { const m = _jun(); const p = freeSpot(m, m.start[0] + 3, m.start[1] - 2, 5); NP(m, 'tarin', p[0], p[1]); return m; };
const _des = MAPS.desert; MAPS.desert = () => { const m = _des(); const p = freeSpot(m, m.start[0] + 3, m.start[1] - 2, 5); NP(m, 'zafir', p[0], p[1]); return m; };
// карты-интерьеры минуют островную генерацию
const _bm = buildMap; buildMap = function (id) { return INTERIORS[id] ? INTERIORS[id]() : _bm(id); };
