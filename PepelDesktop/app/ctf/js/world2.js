'use strict';
// ---------- Карты: Крепость, Пустыня, Зима, Пепельный остров ----------
const REC = (m, id, x, y, lines) => pickup(m, id, x, y, null, { qi: 'rec', q: 'm3', label: 'Запись кастеляна', ic: 'scroll', grp: 'rec', of: 3, open: 'fort_open', lines });

MAPS.fortress = () => {
  const m = newMap('fortress', 56, 44, GR.DSTONE, 'fortress'), r = mulberry32(303);
  ringG(m, 0, 0, 56, 44, 2, GR.WATER);
  fillG(m, 6, 3, 44, 38, GR.DSTONE); scatter(m, r, [], 0, 0, 0, 0, 0);
  for (let i = 0; i < 90; i++) { const x = rint(7, 48), y = rint(4, 39); m.g[ix(m, x, y)] = GR.DGRASS; }
  ringO(m, 6, 3, 44, 38, O.DWALL); fillO(m, 6, 20, 1, 5, 0); fillO(m, 27, 40, 2, 1, 0);
  path(m, [[3, 22], [27, 22]], GR.STONE, 2); path(m, [[27, 22], [27, 39]], GR.STONE, 2); path(m, [[27, 18], [27, 22]], GR.STONE, 2);
  path(m, [[10, 8], [10, 22]], GR.STONE, 1); path(m, [[44, 10], [44, 22]], GR.STONE, 1); path(m, [[10, 30], [44, 30]], GR.STONE, 1);
  // внутренний бастион
  ringO(m, 18, 5, 21, 12, O.DWALL); fillG(m, 19, 6, 19, 10, GR.STONE); fillO(m, 19, 6, 19, 10, 0); clearKeep(m, 19, 6, 19, 10);
  gateAt(m, 'fort_open', [[27, 16], [28, 16]]); fillG(m, 27, 16, 2, 1, GR.STONE);
  [[21, 8], [35, 8], [21, 13], [35, 13]].forEach(([x, y]) => { setO(m, x, y, O.PILLAR); LT(m, x, y, 4, '#ff8a4a'); });
  T(m, { t: 'boss', id: 'castellan', x: 28, y: 9, area: [20, 7, 36, 15] }); chest(m, 'fort_keep', 20, 7, [['potion_hp2', 2]], 100);
  // записи
  REC(m, 'rec1', 10, 7, [['Запись 1', '«Источник под нашей охраной. Лорд-регент требует передать ему ключи».']]);
  REC(m, 'rec2', 44, 9, [['Запись 2', '«Дом Эльдарнов заплатил страже. Король не должен был выйти из долины живым».']]);
  REC(m, 'rec3', 17, 35, [['Запись 3', '«Приказ запереть ворота подписан изнутри. Я, кастелян, исполнил. Да простят меня павшие».']]);
  // камера Рейна
  ringO(m, 41, 26, 7, 5, O.DWALL); fillG(m, 42, 27, 5, 3, GR.STONE); fillO(m, 42, 27, 5, 3, 0); gateAt(m, 'rein_free', [[44, 30], [45, 30]]);
  NP(m, 'rein', 45, 28); pickup(m, 'cell', 39, 29, null, { t: 'lever', flag: 'rein_free', label: 'Рычаг камеры', once: 1 });
  chest(m, 'fort_cell', 46, 27, [['amulet_guard', 0].slice(0, 0), ['potion_hp', 2]].filter(a => a.length), 60);
  // ловушки
  [[26, 26], [27, 26], [28, 26], [29, 26], [14, 22], [14, 23], [40, 22], [40, 23], [20, 30], [34, 30]].forEach(([x, y]) => T(m, { t: 'trap', x, y, ph: (x * 7 + y) % 30 / 10 }));
  T(m, { t: 'sign', x: 5 + 1, y: 21, lines: [['Надпись', '«Пока стоят ворота — стоит королевство». Ниже кто-то нацарапал: «Ворота пали».']] });
  secretRoom(m, 'fort_sec', 9, 33, 5, 3, 11, 'chr3', [['armor_chain', 1]], 80);
  T(m, { t: 'save', x: 29, y: 19 });
  [[24, 6], [30, 18], [12, 4], [44, 5]].forEach(([x, y]) => { setO(m, x, y, O.TORCH); LT(m, x, y, 5); });
  scatter(m, r, [O.RUBBLE, O.RUBBLE, O.BONES, O.CRATE, O.BARREL], 60, 7, 4, 48, 39, [GR.STONE, GR.DSTONE, GR.DGRASS]);
  scatter(m, r, [O.PILLAR, O.DWALL], 14, 8, 5, 47, 38, [GR.DSTONE]);
  SP(m, 'skeleton', 20, 25, 3, 4); SP(m, 'skeleton', 36, 26, 3, 4); SP(m, 'skeleton', 12, 14, 2, 3); SP(m, 'skeleton', 42, 34, 2, 3); SP(m, 'knight', 33, 22, 1, 1); SP(m, 'knight', 14, 30, 1, 1); SP(m, 'knight', 44, 14, 1, 1);
  SP(m, 'crossbow', 24, 33, 2, 3); SP(m, 'crossbow', 36, 34, 2, 3); SP(m, 'crossbow', 20, 12, 1, 1); SP(m, 'bandit', 14, 18, 2, 2); SP(m, 'ruinguard', 30, 36, 1, 1);
  EX(m, 0, 20, 1, 5, 'jungle', 61, 22); EX(m, 27, 43, 2, 1, 'desert', 29, 3);
  bridge(m, 0, 20, 6, 5); bridge(m, 27, 40, 2, 4);
  m.start = [4, 22]; return m;
};

MAPS.desert = () => {
  const m = newMap('desert', 60, 44, GR.SAND, 'desert'), r = mulberry32(404);
  ringG(m, 0, 0, 60, 44, 2, GR.WATER);
  path(m, [[3, 22], [56, 22]], GR.PATH, 2); path(m, [[29, 3], [29, 40]], GR.PATH, 2); path(m, [[14, 22], [14, 26]], GR.PATH, 1);
  blob(m, 14, 19, 5, 3, GR.WATER, r); [[9, 17], [19, 16], [18, 22], [10, 22]].forEach(([x, y]) => setO(m, x, y, O.PALM)); LT(m, 14, 24, 6, '#ffb050');
  fillG(m, 23, 14, 14, 14, GR.DSTONE); clearKeep(m, 23, 14, 14, 14);
  [[24, 15], [35, 15], [24, 26], [35, 26], [29, 17], [30, 17]].forEach(([x, y], i) => i < 4 ? setO(m, x, y, O.PILLAR) : 0);
  [[26, 18], [33, 18], [26, 24], [33, 24]].forEach(([x, y]) => setO(m, x, y, O.RUBBLE));
  chest(m, 'des_ruin', 30, 15, [['potion_hp2', 2], ['scale', 1]], 90);
  T(m, { t: 'sign', x: 28, y: 20, lines: [['Надпись', '«Здесь шли караваны за водой, а несли оружие».']] });
  // арена царицы
  blob(m, 49, 9, 7, 5, GR.DSTONE, null); clearKeep(m, 42, 4, 15, 11); for (let a = 0; a < 40; a++) { const t = a / 40 * Math.PI * 2; const x = Math.round(49 + Math.cos(t) * 7.5), y = Math.round(9 + Math.sin(t) * 5.5); if (!m.keep[ix(m, x, y)]) setO(m, x, y, O.SROCK); }
  T(m, { t: 'boss', id: 'queen', x: 49, y: 9, area: [43, 5, 55, 13] });
  path(m, [[49, 15], [49, 22]], GR.PATH, 2);
  NP(m, 'hasim', 14, 25); NP(m, 'idris', 24, 30);
  [[10, 34], [42, 32], [52, 24]].forEach(([x, y], i) => { setO(m, x + 1, y, O.CRATE); pickup(m, 'crate' + i, x, y, 'caravan_goods', { qi: 'crate', q: 's_caravan', label: 'Ящик с полумесяцем', ic: 'book' }); });
  secretRoom(m, 'des_sec', 40, 36, 5, 3, 42, 'chr4', [['amulet_sand', 1]], 120);
  T(m, { t: 'save', x: 5, y: 20 });
  scatter(m, r, [O.CACTUS, O.CACTUS, O.SROCK, O.BONES, O.DEAD], 180, 2, 2, 57, 41, [GR.SAND]);
  SP(m, 'scorpion', 20, 34, 3, 4); SP(m, 'scorpion', 46, 30, 3, 4); SP(m, 'jackal', 38, 8, 3, 4); SP(m, 'jackal', 12, 8, 3, 4); SP(m, 'mummy', 26, 20, 2, 2); SP(m, 'mummy', 33, 22, 2, 2); SP(m, 'raider', 44, 22, 3, 3); SP(m, 'raider', 12, 36, 3, 3); SP(m, 'scorpion', 6, 30, 2, 3);
  EX(m, 0, 21, 1, 4, 'capital', 59, 23); EX(m, 29, 0, 2, 1, 'fortress', 27, 38); EX(m, 29, 43, 2, 1, 'winter', 30, 4);
  EX(m, 59, 21, 1, 4, 'ash', 3, 24, () => F('winter_done'), 'Мост на Пепельный остров закрыт. Нужны три печати.');
  bridge(m, 0, 21, 4, 4); bridge(m, 29, 0, 2, 4); bridge(m, 29, 40, 2, 4); bridge(m, 56, 21, 4, 4);
  m.start = [4, 22]; return m;
};

MAPS.winter = () => {
  const m = newMap('winter', 60, 44, GR.SNOW, 'winter'), r = mulberry32(505);
  ringG(m, 0, 0, 60, 44, 2, GR.WATER);
  blob(m, 36, 14, 6, 4, GR.ICE, r); blob(m, 18, 30, 7, 4, GR.ICE, r);
  path(m, [[30, 3], [30, 24], [46, 24], [46, 28]], GR.SNOW, 2); path(m, [[30, 12], [10, 12], [10, 22]], GR.SNOW, 2); path(m, [[30, 24], [24, 24], [24, 34]], GR.SNOW, 2); path(m, [[34, 18], [48, 18], [48, 12]], GR.SNOW, 2);
  house(m, 26, 7, 5, O.ROOFB, 2); NP(m, 'skald', 28, 10); LT(m, 28, 9, 5);
  // ледяная пещера
  blob(m, 12, 8, 7, 5, GR.ICE, r); clearKeep(m, 6, 4, 14, 9); [[7, 5], [15, 5], [8, 11], [16, 10], [11, 4], [18, 8]].forEach(([x, y]) => { setO(m, x, y, O.ICEC); LT(m, x, y, 3, '#8ad8ff'); });
  [[9, 7], [13, 6], [14, 10]].forEach(([x, y], i) => pickup(m, 'fc' + i, x, y, 'crystal', { qi: 'fcrystal', q: 's_winter', label: 'Ледяной кристалл', ic: 'crystal' }));
  chest(m, 'win_cave', 10, 9, [['potion_mp2', 2]], 100);
  // руны
  [[10, 21], [48, 11], [24, 34]].forEach(([x, y], i) => pickup(m, 'rune' + i, x, y, null, { t: 'lever', qi: 'rune', q: 'm5', label: 'Ледяная руна', once: 1, grp: 'rune', of: 3, open: 'winter_open' }));
  // арена Кхарна
  ringO(m, 37, 27, 18, 14, O.ICEWALL); fillG(m, 38, 28, 16, 12, GR.ICE); fillO(m, 38, 28, 16, 12, 0); clearKeep(m, 38, 28, 16, 12);
  gateAt(m, 'winter_open', [[45, 27], [46, 27]], O.ICEWALL); fillG(m, 45, 27, 2, 1, GR.ICE);
  [[40, 30], [52, 30], [40, 38], [52, 38]].forEach(([x, y]) => { setO(m, x, y, O.ICEC); LT(m, x, y, 4, '#8ad8ff'); });
  T(m, { t: 'boss', id: 'ice_guardian', x: 46, y: 34, area: [39, 29, 53, 39] });
  secretRoom(m, 'win_sec', 50, 6, 5, 3, 52, 'chr5', [['armor_frost', 1]], 150);
  T(m, { t: 'sign', x: 31, y: 5, lines: [['Надпись', '«Лёд — не проклятие. Лёд — замок». Далее надпись стёрта пургой.']] });
  T(m, { t: 'save', x: 32, y: 6 });
  scatter(m, r, [O.PINE, O.PINE, O.PINE, O.ROCK, O.DEAD], 200, 2, 2, 57, 41, [GR.SNOW]);
  scatter(m, r, [O.ICEC], 12, 2, 2, 57, 41, [GR.ICE]);
  SP(m, 'frostwolf', 20, 20, 3, 4); SP(m, 'frostwolf', 44, 8, 3, 4); SP(m, 'frostwolf', 12, 36, 3, 4); SP(m, 'wraith', 36, 14, 2, 3); SP(m, 'wraith', 16, 28, 2, 3); SP(m, 'wraith', 8, 16, 2, 3);
  SP(m, 'frozen', 24, 30, 2, 3); SP(m, 'frozen', 34, 22, 2, 3); SP(m, 'frozen', 50, 20, 2, 3); SP(m, 'yeti', 20, 38, 1, 1); SP(m, 'yeti', 54, 22, 1, 1);
  EX(m, 29, 0, 2, 1, 'desert', 29, 41); bridge(m, 29, 0, 2, 4);
  m.start = [30, 4]; return m;
};

MAPS.ash = () => {
  const m = newMap('ash', 72, 48, GR.ASH, 'ash'), r = mulberry32(606);
  ringG(m, 0, 0, 72, 48, 2, GR.WATER);
  path(m, [[3, 24], [55, 24]], GR.PATH, 2); path(m, [[20, 24], [20, 15]], GR.PATH, 2); path(m, [[20, 24], [20, 38]], GR.PATH, 2); path(m, [[40, 24], [40, 12]], GR.PATH, 2);
  for (let i = 0; i < 14; i++) blob(m, rint(6, 52), rint(6, 42), rint(1, 2), rint(1, 2), GR.LAVA, r);
  path(m, [[3, 24], [55, 24]], GR.PATH, 2);
  // деревня
  [[10, 16], [14, 28], [24, 16], [26, 29], [32, 18]].forEach(([x, y], k) => { ringO(m, x, y, 5, 4, O.DWALL); fillG(m, x + 1, y + 1, 3, 2, GR.DSTONE); fillO(m, x + 1, y + 1, 3, 2, 0); setO(m, x + 2, y + 3, 0); setO(m, x + (k % 2 ? 0 : 4), y + 1, 0); clearKeep(m, x + 2, y + 3, 1, 1); });
  T(m, { t: 'reach', id: 'ash_village', area: [8, 14, 34, 34] });
  T(m, { t: 'sign', x: 6, y: 22, lines: [['Надпись', '«Здесь стояла деревня Пепельная Падь. Те, кто остался, ушли в огонь добровольно».']] });
  // жрец и Эдрик
  NP(m, 'edrik', 50, 24); LT(m, 50, 24, 6, '#c88aff');
  SP(m, 'priest', 44, 24, 1, 0);
  T(m, { t: 'save', x: 4, y: 22 }); T(m, { t: 'save', x: 52, y: 22 });
  // врата и трон
  ringO(m, 56, 11, 15, 26, O.DWALL); fillG(m, 57, 12, 13, 24, GR.DSTONE); fillO(m, 57, 12, 13, 24, 0); clearKeep(m, 57, 12, 13, 24);
  gateAt(m, 'throne_open', [[56, 23], [56, 24]]); fillG(m, 56, 23, 1, 2, GR.DSTONE);
  [[59, 14], [67, 14], [59, 33], [67, 33], [59, 24], [67, 24]].forEach(([x, y]) => { setO(m, x, y, O.PILLAR); LT(m, x, y, 5, '#ff4a3a'); });
  for (let i = 0; i < 18; i++) { const x = rint(58, 68), y = rint(13, 34); if (!m.o[ix(m, x, y)]) m.g[ix(m, x, y)] = GR.LAVA; }
  fillG(m, 60, 21, 7, 7, GR.DSTONE); fillO(m, 60, 21, 7, 7, 0);
  T(m, { t: 'boss', id: 'ash_king', x: 64, y: 24, area: [58, 13, 69, 34] });
  secretRoom(m, 'ash_sec', 20, 40, 5, 3, 22, 'chr6', [['elixir', 1], ['potion_hp2', 2]], 250);
  scatter(m, r, [O.ASHROCK, O.ASHROCK, O.DEAD, O.RUBBLE, O.BONES], 220, 2, 2, 54, 45, [GR.ASH]);
  SP(m, 'hound', 12, 22, 3, 3); SP(m, 'ashwar', 18, 18, 2, 3); SP(m, 'ashwar', 28, 32, 2, 3); SP(m, 'hound', 26, 22, 3, 3); SP(m, 'asharch', 30, 20, 2, 3); SP(m, 'asharch', 14, 34, 2, 3); SP(m, 'ashmage', 22, 30, 2, 3); SP(m, 'ashmage', 34, 28, 1, 1);
  SP(m, 'ashorc', 38, 14, 1, 1); SP(m, 'ashorc', 40, 34, 1, 1); SP(m, 'ashwar', 40, 18, 2, 3); SP(m, 'asharch', 46, 30, 2, 3); SP(m, 'ashmage', 48, 18, 1, 1);
  EX(m, 0, 23, 1, 4, 'desert', 56, 22); bridge(m, 0, 23, 4, 4);
  m.start = [4, 24]; return m;
};

function buildCore(id) {
  const m = MAPS[id](); const clr = (x, y) => { if (inb(m, x, y)) m.o[ix(m, x, y)] = 0; };
  m.npcs.forEach(n => clr(n.x, n.y));
  m.things.forEach(t => { if (t.t !== 'crack' && t.x !== undefined) clr(t.x, t.y); if (t.jl) { t.grp = 'jl'; t.of = 2; t.open = 'jtemple_open'; } });
  m.exits.forEach(e => { for (let j = 0; j < e.h; j++) for (let i = 0; i < e.w; i++) clr(e.x + i, e.y + j); });
  protect(m); if (DECO[id]) DECO[id](m, mulberry32(id.length * 977 + m.w));
  m.npcs.forEach(n => clr(n.x, n.y)); m.things.forEach(t => { if (t.t !== 'crack' && t.x !== undefined) clr(t.x, t.y); });
  return connect(m);
}
