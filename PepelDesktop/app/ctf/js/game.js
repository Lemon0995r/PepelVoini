'use strict';
// ---------- Ядро: состояние, ввод, карта, камера, главный цикл ----------
let S = null;
const CFG = Object.assign({ master: .8, sfx: .8, music: .5, shake: 1, hints: 1, bright: 1 }, (() => { try { return JSON.parse(localStorage.getItem('pepel_cfg')) || {}; } catch (e) { return {}; } })());
function saveCfg() { try { localStorage.setItem('pepel_cfg', JSON.stringify(CFG)); } catch (e) { } }
const KEYS = {}, PRESS = {}, MOUSE = { x: VW / 2, y: VH / 2, down: false, clicked: false, used: false };
const CHAPTERS = [['Пролог', 'Последний спокойный день'], ['Глава I', 'Следы прошлого'], ['Глава II', 'Забытые земли'], ['Глава III', 'Земля вечной зимы'], ['Глава IV', 'Пепельный остров'], ['Финал', 'Последний пепел']];

const G = {
  mode: 'title', map: null, mid: null, P: null, enemies: [], npcs: [], projs: [], parts: [], floats: [], drops: [], hazards: [], boss: null,
  t: 0, shake: 0, hitstop: 0, fade: 0, fadeCb: null, cam: { x: 0, y: 0 }, near: null, exitCd: 0, banner: null, ui: null, weather: [], busy: 0
};

function freshState() {
  const s = { v: 1, p: { lvl: 1, xp: 0, hp: 100, mp: 40, gold: 20, str: 6, dex: 5, int: 5, vit: 6, pts: 0, spts: 0 }, skl: { strike: 1, dodge: 1, fire: 1, heal: 1, whirl: 1, nova: 1 },
    inv: [{ id: 'bread', n: 3 }, { id: 'potion_hp', n: 3 }], eq: { weapon: { id: 'sword_rust', up: 0 }, armor: null, helm: null, acc: null, book: { id: 'tome_fire1' } },
    quests: {}, flags: {}, done: {}, map: 'capital', x: 0, y: 0, time: 0, kills: 0, ending: null, seen: {}, pages: [] };
  return s;
}
function xpNeed(l) { return 10 * l * l + 50 * l; }
function stats() {
  const p = S.p, g = { str: 0, dex: 0, int: 0, vit: 0, def: 0, hp: 0, mp: 0, atk: 0 }; let elem = null;
  Object.values(S.eq).filter(Boolean).forEach(it => {
    const d = ITEMS[it.id], m = upMul(it.up);
    ['str', 'dex', 'int', 'vit', 'hp', 'mp'].forEach(k => { if (d[k]) g[k] += d[k]; });
    if (d.def) g.def += d.def * m; if (d.atk) g.atk += d.atk * m; if (d.elem) elem = d.elem;
  });
  const str = p.str + g.str, dex = p.dex + g.dex, int = p.int + g.int, vit = p.vit + g.vit;
  return { str, dex, int, vit, wep: g.atk, atk: Math.round(g.atk + str * 1.6), def: Math.round(g.def + vit * .6), maxhp: Math.round(50 + vit * 7 + p.lvl * 8 + g.hp), maxmp: Math.round(20 + int * 3 + p.lvl * 2 + g.mp),
    spd: 68 + dex * 1.1, crit: Math.min(.4, .03 + dex * .007), dodge: Math.min(.4, dex * .005 * (1 + .25 * ((S.skl.dodge || 1) - 1))), elem };
}

// ----- ввод -----
function typing() { const a = document.activeElement; return a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.tagName === 'SELECT'); }
addEventListener('keydown', e => {
  if (typing()) return; SND.init();
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) e.preventDefault();
  if (!e.repeat) PRESS[e.code] = 1; KEYS[e.code] = 1;
});
addEventListener('keyup', e => { KEYS[e.code] = 0; });
addEventListener('blur', () => { for (const k in KEYS) KEYS[k] = 0; MOUSE.down = false; });
function bindMouse(cv) {
  const upd = e => { const r = cv.getBoundingClientRect(); MOUSE.x = (e.clientX - r.left) / r.width * VW; MOUSE.y = (e.clientY - r.top) / r.height * VH; MOUSE.used = true; };
  cv.addEventListener('mousemove', upd);
  cv.addEventListener('mousedown', e => { SND.init(); if (e.button === 0) { upd(e); MOUSE.down = true; MOUSE.clicked = true; } if (e.button === 2) PRESS.MouseR = 1; });
  addEventListener('mouseup', () => { MOUSE.down = false; });
  cv.addEventListener('contextmenu', e => e.preventDefault());
}
const wasP = k => { const v = PRESS[k]; PRESS[k] = 0; return v; };

// ----- карта и столкновения -----
function objSolidAt(px, py) { const m = G.map, tx = Math.floor(px / TS), ty = Math.floor(py / TS); if (tx < 0 || ty < 0 || tx >= m.w || ty >= m.h) return true; return !!OBJ_SOLID[m.o[ty * m.w + tx]]; }
function solidAt(px, py) {
  const m = G.map, tx = Math.floor(px / TS), ty = Math.floor(py / TS); if (tx < 0 || ty < 0 || tx >= m.w || ty >= m.h) return true;
  const k = ty * m.w + tx; return m.g[k] === GR.WATER || !!OBJ_SOLID[m.o[k]];
}
function boxFree(x, y, r) {
  if (solidAt(x - r, y - r * .5) || solidAt(x + r, y - r * .5) || solidAt(x - r, y + r * .5) || solidAt(x + r, y + r * .5)) return false;
  const ts = G.map.things; for (let i = 0; i < ts.length; i++) { const t = ts[i]; if ((t.t === 'chest' || t.t === 'save') && Math.abs(x - (t.x * TS + 8)) < r + 6 && Math.abs(y - (t.y * TS + 12)) < r + 4) return false; }
  return true;
}
function moveBody(b, dx, dy, r) {
  b.bump = 0;
  if (dx) { if (boxFree(b.x + dx, b.y, r)) b.x += dx; else b.bump = 1; }
  if (dy) { if (boxFree(b.x, b.y + dy, r)) b.y += dy; else b.bump = 1; }
}
function los(x0, y0, x1, y1) { const d = Math.hypot(x1 - x0, y1 - y0), n = Math.ceil(d / 6); for (let i = 1; i < n; i++) { const t = i / n; if (objSolidAt(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t)) return false; } return true; }
function freeNear(x, y, rad, r) {
  for (let i = 0; i < 24; i++) { const a = Math.random() * 6.28, d = Math.random() * rad, px = x + Math.cos(a) * d, py = y + Math.sin(a) * d; if (boxFree(px, py, r || 5) && G.map.g[Math.floor(py / TS) * G.map.w + Math.floor(px / TS)] !== GR.LAVA) return [px, py]; }
  return boxFree(x, y, r || 5) ? [x, y] : null;
}

// ----- загрузка карты -----
function openGateTiles(m, flag) { m.gates.forEach(g => { if (g.flag === flag) g.tiles.forEach(([x, y]) => { m.o[ix(m, x, y)] = 0; }); }); }
function loadMap(id, tx, ty, instant, from) {
  const go = () => {
    const m = buildMap(id);
    { const dr = from && tx === undefined && m.things.find(t => t.t === 'door' && t.to === from); if (dr) { tx = dr.x; ty = dr.y + 1; } }
    if (from && tx === undefined) { const ex = m.exits.find(e => e.to === from); if (ex && ex.spawn) { tx = ex.spawn[0]; ty = ex.spawn[1]; } else if (ex) { const cx = ex.x + (ex.w >> 1), cy = ex.y + (ex.h >> 1); if (ex.x === 0) { tx = 4; ty = cy; } else if (ex.x >= m.w - 1) { tx = m.w - 5; ty = cy; } else if (ex.y === 0) { tx = cx; ty = 4; } else { tx = cx; ty = m.h - 5; } } } G.map = m; G.mid = id; S.map = id;
    Object.keys(S.flags).forEach(f => { if (S.flags[f]) openGateTiles(m, f); });
    m.things.forEach(t => { if (t.t === 'crack' && S.done[id + ':' + t.id]) m.o[ix(m, t.x, t.y)] = 0; });
    G.enemies = []; G.projs = []; G.parts = []; G.floats = []; G.drops = []; G.hazards = []; G.boss = null; G.near = null;
    G.npcs = m.npcs.map(n => ({ id: n.id, x: n.x * TS + 8, y: n.y * TS + 14, hx: n.x * TS + 8, hy: n.y * TS + 14, dir: 'd', fr: 0, wt: Math.random() * 3, tx: 0, ty: 0 }));
    m.spawns.forEach(sp => {
      const d = ENEMIES[sp.t]; if (d.unique && S.flags['u_' + sp.t]) return;
      for (let i = 0; i < sp.n; i++) { const p = freeNear(sp.x * TS + 8, sp.y * TS + 8, sp.sp * TS, d.sz); if (p) spawnEnemy(sp.t, p[0], p[1], { grp: sp.x * 100 + sp.y }); }
    });
    const px = (tx === undefined ? m.start[0] : tx) * TS + 8, py = (ty === undefined ? m.start[1] : ty) * TS + 8;
    G.P = G.P || {}; Object.assign(G.P, { x: px, y: py, vx: 0, vy: 0, dir: 'd', face: 1.57, fr: 0, wt: 0, atk: 0, combo: 0, comboT: 0, roll: 0, inv: 0, hurt: 0, kx: 0, ky: 0, stun: 0, swing: null, poison: 0, slow: 0, cd: {}, castT: 0, dead: 0 });
    SND.music(REGIONS[m.reg].music); initWeather(m.reg);
    G.exitCd = 1.2; G.banner = { t: 3, name: REGIONS[m.reg].n, sub: '' };
    if (S.map !== id || true) S.map = id;
    SND.init();
  };
  if (instant) { go(); G.fade = 0; return; }
  G.fadeCb = go; G.fade = 1; G.fadeDir = 1;
}
function initWeather(reg) {
  const n = Math.round(({ capital: 20, jungle: 30, fortress: 30, desert: 70, winter: 110, ash: 90 }[reg] || 20) * (LITE ? .45 : 1)); G.weather = [];
  for (let i = 0; i < n; i++) G.weather.push({ x: Math.random() * VW, y: Math.random() * VH, z: Math.random(), p: Math.random() * 6.28 });
}

// ----- сохранение -----
const SAVE_KEY = n => 'pepel_save_' + n;
function saveGame(slot, quiet) {
  try {
    S.x = Math.round(G.P.x); S.y = Math.round(G.P.y); S.saved = Date.now(); S.chap = chapterIdx();
    localStorage.setItem(SAVE_KEY(slot), JSON.stringify(S)); if (!quiet) { SND.play('save'); G.toast('Игра сохранена'); } return true;
  } catch (e) { G.toast('Не удалось сохранить'); return false; }
}
function readSave(slot) {
  try {
    const raw = localStorage.getItem(SAVE_KEY(slot)); if (!raw) return null; const s = JSON.parse(raw);
    if (!s || !s.p || !s.inv || !s.eq || !s.quests || !s.flags || !ITEMS) return null;
    const d = freshState(); for (const k in d) if (s[k] === undefined) s[k] = d[k];
    s.inv = s.inv.filter(i => i && ITEMS[i.id]); Object.keys(s.eq).forEach(k => { if (s.eq[k] && !ITEMS[s.eq[k].id]) s.eq[k] = null; });
    if (!MAPS[s.map]) s.map = 'capital';
    return s;
  } catch (e) { return null; }
}
function loadGame(slot) {
  const s = readSave(slot); if (!s) { G.toast('Сохранение повреждено или отсутствует'); return false; }
  S = s; G.P = null; loadMap(S.map, undefined, undefined, true);
  G.P.x = S.x || G.P.x; G.P.y = S.y || G.P.y; if (!boxFree(G.P.x, G.P.y, 4)) { const m = G.map; G.P.x = m.start[0] * TS + 8; G.P.y = m.start[1] * TS + 8; }
  const st = stats(); S.p.hp = clamp(S.p.hp, 1, st.maxhp); S.p.mp = clamp(S.p.mp, 0, st.maxmp);
  G.mode = 'play'; G.fade = 1; G.fadeDir = -1; UI.closeAll(); UI.showHud(true); return true;
}
function chapterIdx() { return F('ash_done') ? 5 : F('winter_done') ? 4 : F('fort_done') ? 3 : F('ch1_done') ? 2 : qDone('m0') ? 1 : 0; }

// ----- вспомогательное -----
G.toast = (txt, cls) => UI.toast(txt, cls);
G.floatMsg = txt => UI.toast(txt, 'gold');
G.addFloat = (x, y, txt, col, big) => G.floats.push({ x, y, txt, col: col || '#fff', t: 0, big });
G.addShake = v => { G.shake = Math.max(G.shake, v * CFG.shake); };
G.spark = (x, y, col, n, sp) => { for (let i = 0; i < (n || 6); i++) { const a = Math.random() * 6.28, s = rnd(20, sp || 80); G.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rnd(.2, .5), t: 0, col: col || '#fff', sz: 1 + (Math.random() < .3 ? 1 : 0), g: 0 }); } };
G.openGate = flag => { S.flags[flag] = 1; openGateTiles(G.map, flag); SND.play('door'); G.addShake(2); };
G.openThroneGate = () => G.openGate('throne_open');
G.healService = () => { if (S.p.gold < 15) return G.toast('Не хватает золота'); S.p.gold -= 15; const st = stats(); S.p.hp = st.maxhp; S.p.mp = st.maxmp; SND.play('heal'); G.toast('Мирена исцелила тебя'); };

// ----- главный цикл -----
G.update = function (dt) {
  G.t += dt; G.dt = dt;
  if (G.fade > 0 || G.fadeDir) {
    if (G.fadeDir === 1) { G.fade += dt * 3; if (G.fade >= 1) { G.fade = 1; G.fadeDir = -1; const cb = G.fadeCb; G.fadeCb = null; if (cb) cb(); } }
    else if (G.fadeDir === -1) { G.fade -= dt * 2.5; if (G.fade <= 0) { G.fade = 0; G.fadeDir = 0; } }
  }
  if (G.banner) { G.banner.t -= dt; if (G.banner.t <= 0) G.banner = null; }
  G.shake = Math.max(0, G.shake - dt * 14);
  if (G.mode === 'play') {
    if (G.hitstop > 0) { G.hitstop -= dt; } else {
      if (!G.busy) { S.time += dt; updatePlayer(dt); }
      updateEnemies(dt); updateProjs(dt); updateBossLogic(dt); updateHazards(dt); updateWorld(dt);
    }
    if (wasP('Escape')) UI.pause();
    if (wasP('KeyI')) UI.open('inv'); if (wasP('KeyJ')) UI.open('quests'); if (wasP('KeyM')) UI.open('map'); if (wasP('KeyC')) UI.open('char');
  } else if (G.mode === 'title') { updateWorld(dt); }
  updateFx(dt);
  for (const k in PRESS) PRESS[k] = 0; MOUSE.clicked = false;
};
function updateFx(dt) {
  for (let i = G.parts.length - 1; i >= 0; i--) { const p = G.parts[i]; p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (p.g || 0) * dt; if (p.t > p.life) G.parts.splice(i, 1); }
  if (G.parts.length > (LITE ? 220 : 500)) G.parts.splice(0, G.parts.length - (LITE ? 220 : 500));
  for (let i = G.floats.length - 1; i >= 0; i--) { const f = G.floats[i]; f.t += dt; if (f.t > 1) G.floats.splice(i, 1); }
}
function updateWorld(dt) {
  const P = G.P; if (!P || !G.map) return;
  // камера
  const tx = clamp(P.x - VW / 2, 0, G.map.w * TS - VW), ty = clamp(P.y - VH / 2, 0, G.map.h * TS - VH);
  G.cam.x = lerp(G.cam.x, tx, Math.min(1, dt * 8)); G.cam.y = lerp(G.cam.y, ty, Math.min(1, dt * 8));
  if (G.mode !== 'play') return;
  // NPC блуждают
  G.npcs.forEach(n => {
    const d = NPCS[n.id]; if (!d || !d.wander) return; n.wt -= dt;
    if (n.wt <= 0) { n.wt = rnd(1.5, 4); n.tx = n.hx + rnd(-30, 30); n.ty = n.hy + rnd(-20, 20); }
    const dx = n.tx - n.x, dy = n.ty - n.y, dd = Math.hypot(dx, dy);
    if (dd > 3 && dist(n, P) > 26) { const s = 22 * dt; const ox = n.x, oy = n.y; moveBody(n, dx / dd * s, dy / dd * s, 4); n.fr = (n.fr + dt * 6) % 4; n.dir = Math.abs(dx) > Math.abs(dy) ? 's' : dy < 0 ? 'u' : 'd'; n.fl = dx < 0; void ox; void oy; } else n.fr = 0;
  });
  // ловушки, области
  G.map.things.forEach(t => {
    if (t.t === 'trap') { const c = (G.t + t.ph) % 3; t.state = c < 1.4 ? 0 : c < 2 ? 1 : c < 2.5 ? 2 : 0; if (t.state === 2 && !P.inv && Math.floor(P.x / TS) === t.x && Math.floor(P.y / TS) === t.y) { hurtPlayer(14 + S.p.lvl, null, 0, 0, 'trap'); } }
    if (t.t === 'reach' && !S.done['reach:' + t.id]) { const a = t.area; if (P.x / TS > a[0] && P.x / TS < a[2] && P.y / TS > a[1] && P.y / TS < a[3]) { S.done['reach:' + t.id] = 1; QP('reach', t.id, 1); } }
    if (t.t === 'boss') bossTrigger(t);
  });
  // лава
  const gk = G.map.g[Math.floor(P.y / TS) * G.map.w + Math.floor(P.x / TS)];
  if (gk === GR.LAVA && !P.roll) { P.lava = (P.lava || 0) - dt; if (P.lava <= 0) { P.lava = .5; hurtPlayer(6 + S.p.lvl, null, 0, 0, 'lava'); } }
  // выходы
  G.exitCd -= dt;
  if (G.exitCd <= 0 && !G.fadeCb) {
    const ptx = Math.floor(P.x / TS), pty = Math.floor(P.y / TS);
    for (const e of G.map.exits) if (ptx >= e.x && ptx < e.x + e.w && pty >= e.y && pty < e.y + e.h) {
      if (e.req && !e.req()) { G.toast(e.msg || 'Путь закрыт.'); G.exitCd = 2; const c = { x: (e.x + e.w / 2) * TS, y: (e.y + e.h / 2) * TS }; const a = angTo(c, { x: G.map.w * TS / 2, y: G.map.h * TS / 2 }); P.x += Math.cos(a) * 28; P.y += Math.sin(a) * 28; break; }
      saveGame(0, true); loadMap(e.to, undefined, undefined, false, G.mid); break;
    }
  }
  // что рядом
  findNear();
}
function findNear() {
  const P = G.P; let best = null, bd = 24;
  G.npcs.forEach(n => { const d = dist(n, P); if (d < bd) { bd = d; best = { k: 'npc', o: n, label: (NPCS[n.id] || {}).board ? 'Читать' : 'Говорить: ' + (NPCS[n.id] || { n: n.id }).n } } });
  G.map.things.forEach(t => {
    if (t.x === undefined || ['trap', 'boss', 'reach'].includes(t.t)) return;
    if (t.t === 'chest' && S.done[G.mid + ':' + t.id]) return; if ((t.t === 'pick' || (t.t === 'lever' && t.once)) && S.done[G.mid + ':' + t.id]) return;
    if (t.t === 'crack' && S.done[G.mid + ':' + t.id]) return;
    const d = Math.hypot(t.x * TS + 8 - P.x, t.y * TS + 10 - P.y); if (d < bd) { bd = d; best = { k: 'thing', o: t, label: t.label || { chest: 'Открыть сундук', pick: 'Подобрать', lever: 'Использовать', crack: 'Осмотреть трещину', sign: 'Читать', save: 'Башня: лечение, сохранение, улучшения' }[t.t] || 'Взаимодействие' } };
  });
  G.near = best;
  if (best && wasP('KeyE') && !G.busy) interact(best);
}
