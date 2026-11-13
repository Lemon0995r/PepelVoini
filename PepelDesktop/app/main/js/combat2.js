'use strict';
// ---------- Бой 2: типы оружия, новая магия, баффы, сложность ----------
ELCOL.arcane = '#c8a0ff';
// --- сложность ---
(function () {
  Object.values(ENEMIES).forEach(d => { if (d.diff) return; d.diff = 1; d.hp = Math.round(d.hp * 1.65); d.atk = Math.round(d.atk * 1.45); d.aggro = Math.round(d.aggro * 1.12); if (d.cd) d.cd *= .85; });
  Object.values(BOSSES).forEach(b => { b.hp = Math.round(b.hp * 1.7); b.atk = Math.round(b.atk * 1.45); });
  Object.values(ITEMS).forEach(d => { if (d.heal && d.t === 'cons') d.heal = Math.round(d.heal * .75); });
})();
// --- статы по типу оружия ---
const _stats0 = stats;
stats = function () {
  const s = _stats0(), w = S.eq.weapon, d = w && ITEMS[w.id]; s.wt = d && d.wt || 'sword';
  const k = (WT[s.wt] || WT.sword).stat; if (k !== 'str') s.atk = Math.round(s.wep + s[k] * 1.6 + s.str * .3);
  if (s.wt === 'dagger') s.crit = Math.min(.55, s.crit + .12);
  const P = G.P; if (P && P.buff && P.buff.str > 0) s.atk = Math.round(s.atk * 1.3);
  return s;
};
// --- урон по игроку: щит, баффы, поправка на защиту ---
const _hurt0 = hurtPlayer;
hurtPlayer = function (raw, src, kx, ky, kind) {
  const P = G.P; if (!P || P.inv > 0 || P.dead || G.mode !== 'play') return false;
  if (!kind) raw += stats().def * .1;
  if (P.buff && P.buff.def > 0) raw *= .65;
  if (P.shT > 0 && P.shHp > 0) {
    const a = Math.min(P.shHp, raw); P.shHp -= a; raw -= a; P.inv = .25; G.spark(P.x, P.y - 8, '#9ab8ff', 8, 70); SND.play('hit');
    G.addFloat(P.x, P.y - 24, 'Щит −' + Math.round(a), '#9ab8ff'); if (P.shHp <= 0) { P.shT = 0; G.toast('Щит разбит'); }
    if (raw < 1) return false;
  }
  return _hurt0(raw, src, kx, ky, kind);
};
// --- оружейные атаки ---
const _atkSword = attackMelee;
function meleeHit(P, st, aim, o) {
  P.face = aim; P.atkCd = o.T; P.comboT = .8; SND.play('swing');
  P.swing = { ang: aim, t: 0, T: o.sT || .2, arc: o.arc, range: o.range, col: st.elem ? ELCOL[st.elem] : o.col || '#fff' };
  P.kx += Math.cos(aim) * (o.lunge || 40); P.ky += Math.sin(aim) * (o.lunge || 40);
  let hit = 0; const lv = skMul('strike');
  enemiesInCone(P, aim, o.range, o.arc).forEach(e => {
    const crit = Math.random() < st.crit + (o.crit || 0), raw = (st.atk + S.p.lvl * 1.5) * o.mult * lv;
    damageEnemy(e, raw, { el: st.elem || 'phys', crit, kb: o.kb, kang: aim, stun: o.stun || 0, magic: o.pierceArmor ? 1 : 0 }); hit++;
  });
  if (hit) { G.hitstop = o.hs || .04; G.addShake(o.shake || 1.2); S.p.mp = Math.min(stats().maxmp, S.p.mp + 1.2 * Math.min(hit, 3)); }
  return hit;
}
attackMelee = function (aim, st) {
  const P = G.P, wt = st.wt, c = P.combo;
  if (wt === 'sword') return _atkSword(aim, st);
  const ec = st.elem ? ELCOL[st.elem] : null;
  if (wt === 'dagger') { P.combo = (c + 1) % 2; return meleeHit(P, st, aim, { T: .16, range: 21, arc: 1.7, mult: c ? .75 : .62, kb: 50, crit: .1, col: '#d8e8ff', sT: .12, lunge: 70, hs: .02, shake: .5 }); }
  if (wt === 'axe') { P.combo = 0; return meleeHit(P, st, aim, { T: .52, range: 30, arc: 2.9, mult: 1.9, kb: 170, pierceArmor: 1, col: '#ffd8a0', hs: .08, shake: 2.4, lunge: 80, sT: .26 }); }
  if (wt === 'hammer') {
    P.combo = 0; const h = meleeHit(P, st, aim, { T: .78, range: 27, arc: 2.3, mult: 2.5, kb: 220, stun: .7, pierceArmor: 1, col: '#ffc890', hs: .1, shake: 4, lunge: 30, sT: .3 });
    const fx = P.x + Math.cos(aim) * 20, fy = P.y + Math.sin(aim) * 20; for (let i = 0; i < 14; i++) { const a = i / 14 * 6.28; G.parts.push({ x: fx, y: fy, vx: Math.cos(a) * 70, vy: Math.sin(a) * 70, life: .3, t: 0, col: '#b8a890', sz: 2 }); } return h;
  }
  if (wt === 'spear') { P.combo = 0; return meleeHit(P, st, aim, { T: .38, range: 47, arc: .6, mult: 1.3, kb: 140, col: '#e0f0ff', sT: .14, lunge: 90, hs: .05 }); }
  if (wt === 'bow') {
    P.face = aim; P.atkCd = .46; SND.play('swing'); P.castT = .6; const crit = Math.random() < st.crit;
    G.projs.push({ x: P.x + Math.cos(aim) * 8, y: P.y - 6 + Math.sin(aim) * 8, vx: Math.cos(aim) * 300, vy: Math.sin(aim) * 300, r: 3, col: ec || '#e8d8a8', dmg: (st.atk + S.p.lvl * 1.5) * 1.2 * skMul('strike'), from: 'p', kind: 'arrow', el: st.elem || 'phys', life: 1.1, phys: 1, pierce: 1, crit, trail: true });
    return 0;
  }
  if (wt === 'staff') {
    if (S.p.mp < 3) { return meleeHit(P, st, aim, { T: .4, range: 22, arc: 1.5, mult: .5, kb: 60 }); }
    S.p.mp -= 3; P.face = aim; P.atkCd = .36; P.castT = .8; SND.play('fireball');
    const el = st.elem || 'arcane', col = ELCOL[el] || '#c8a0ff';
    G.projs.push({ x: P.x + Math.cos(aim) * 8, y: P.y - 8 + Math.sin(aim) * 8, vx: Math.cos(aim) * 210, vy: Math.sin(aim) * 210, r: 4, col, dmg: st.wep * .9 + st.int * 2.2 + S.p.lvl * 1.5, from: 'p', kind: 'fire', el, life: 1.4, crit: Math.random() < st.crit, slowE: el === 'ice' });
    return 0;
  }
  return _atkSword(aim, st);
};
// --- магия ---
G.delayed = [];
const _cast0 = castSkill;
function nearestTo(x, y, rad, except) { let b = null, bd = rad; G.enemies.forEach(e => { if (e.dead || e.spawning || (except && except.has(e))) return; const d = Math.hypot(e.x - x, e.y - y); if (d < bd && los(x, y - 5, e.x, e.y - 5)) { b = e; bd = d; } }); return b; }
function bolt(x1, y1, x2, y2, col) { const n = Math.max(3, Math.hypot(x2 - x1, y2 - y1) / 4 | 0); for (let i = 0; i <= n; i++) { const k = i / n; G.parts.push({ x: x1 + (x2 - x1) * k + rnd(-3, 3), y: y1 + (y2 - y1) * k + rnd(-3, 3), vx: 0, vy: 0, life: .28, t: 0, col: i % 2 ? col : '#fff', sz: 2 }); } }
function mouseWorld() { return [MOUSE.x + G.cam.x, MOUSE.y + G.cam.y]; }
castSkill = function (id, aim, st) {
  if (!['bolt', 'frost', 'shield', 'meteor'].includes(id)) return _cast0(id, aim, st);
  const P = G.P, sk = SKILLS[id], p = S.p; if (!sk || P.dead || G.busy) return;
  if (p.lvl < sk.unlock) return G.toast('Навык «' + sk.n + '» откроется на уровне ' + sk.unlock);
  if ((P.cd[id] || 0) > 0) return; if (p.mp < sk.mp) { G.addFloat(P.x, P.y - 24, 'Мало маны', '#6a9aff'); return; }
  const m = skMul(id), mp = magicPow(st);
  if (id === 'bolt') {
    let cur = null, best = 1e9; G.enemies.forEach(e => { if (e.dead || e.spawning) return; const d = Math.hypot(e.x - P.x, e.y - P.y); if (d > 150 || !los(P.x, P.y - 5, e.x, e.y - 5)) return; const sc = d + Math.abs(angDiff(Math.atan2(e.y - P.y, e.x - P.x), aim)) * 60; if (sc < best) { best = sc; cur = e; } });
    if (!cur) { G.addFloat(P.x, P.y - 24, 'Нет цели', '#aaa'); return; }
    p.mp -= sk.mp; P.cd[id] = sk.cd; P.castT = 1; P.face = aim; P.atkCd = .3; SND.play('nova');
    const seen = new Set(); let px = P.x, py = P.y - 8, dmg = mp * 1.5 * m;
    for (let i = 0; i < 5 && cur; i++) { seen.add(cur); bolt(px, py, cur.x, cur.y - 6, '#ffee6a'); damageEnemy(cur, dmg, { el: 'lightning', magic: 1, kb: 60, kang: Math.atan2(cur.y - py, cur.x - px), stun: .25 }); G.spark(cur.x, cur.y - 6, '#ffee6a', 8, 70); px = cur.x; py = cur.y - 6; dmg *= .8; cur = nearestTo(cur.x, cur.y, 64, seen); }
    G.addShake(2);
  } else if (id === 'frost') {
    p.mp -= sk.mp; P.cd[id] = sk.cd; P.castT = 1; P.face = aim; P.atkCd = .3; SND.play('ice');
    for (let i = -3; i <= 3; i++) { const a = aim + i * .13; G.projs.push({ x: P.x + Math.cos(a) * 8, y: P.y - 7 + Math.sin(a) * 8, vx: Math.cos(a) * 230, vy: Math.sin(a) * 230, r: 3, col: '#bff0ff', dmg: mp * .75 * m, from: 'p', kind: 'ice', el: 'ice', life: .9, slowE: 1 }); }
  } else if (id === 'shield') {
    p.mp -= sk.mp; P.cd[id] = sk.cd; P.castT = 1; SND.play('heal'); P.shT = 8; P.shHp = (45 + st.int * 4 + p.lvl * 6) * m; G.spark(P.x, P.y - 8, '#9ab8ff', 18, 60); G.addFloat(P.x, P.y - 26, 'Щит', '#9ab8ff', true);
  } else if (id === 'meteor') {
    let tx, ty; if (MOUSE.used && G.t - (MOUSE.t || 0) < 3) [tx, ty] = mouseWorld(); else { tx = P.x + Math.cos(aim) * 90; ty = P.y + Math.sin(aim) * 90; }
    const dd = Math.hypot(tx - P.x, ty - P.y); if (dd > 150) { tx = P.x + (tx - P.x) / dd * 150; ty = P.y + (ty - P.y) / dd * 150; }
    p.mp -= sk.mp; P.cd[id] = sk.cd; P.castT = 1; P.atkCd = .4; SND.play('whirl'); G.delayed.push({ k: 'meteor', t: 1, T: 1, x: tx, y: ty, dmg: mp * 3.4 * m, mid: G.mid });
  }
};
// --- расходники ---
const _use0 = useItem;
useItem = function (id) {
  const d = ITEMS[id], P = G.P, st = stats(); if (!d || d.t !== 'cons' || !countItem(id)) return;
  if (d.bag) {
    const need = d.need ? +d.need.slice(3) : 0; if ((S.p.bagLv || 0) < need) return G.toast('Сначала нужна ' + ITEMS[d.need].n.toLowerCase());
    if ((S.p.bagLv || 0) >= +id.slice(3)) return G.toast('У вас уже есть такое улучшение');
    removeItem(id, 1); S.p.bag = (S.p.bag || 0) + d.bag; S.p.bagLv = +id.slice(3); SND.play('levelup'); G.toast('Инвентарь расширен: ' + invMax() + ' ячеек', 'gold'); return;
  }
  if (d.buff) { removeItem(id, 1); P.buff = P.buff || {}; P.buff[d.buff] = 60; SND.play('heal'); G.addFloat(P.x, P.y - 24, d.buff === 'str' ? 'Ярость' : 'Стойкость', '#ffb06a', true); G.spark(P.x, P.y - 8, '#ffb06a', 12, 50); return; }
  if (d.scroll === 'fire') { removeItem(id, 1); explode(P.x, P.y - 4, 56, magicPow(st) * 2.4, 'fire'); G.spark(P.x, P.y - 6, '#ff8a2a', 20, 120); return; }
  return _use0(id);
};
// --- тики: баффы, щит, метеоры ---
const _up0 = updatePlayer;
updatePlayer = function (dt) {
  _up0(dt); const P = G.P; if (!P) return;
  if (P.buff) for (const k in P.buff) if (P.buff[k] > 0) P.buff[k] -= dt;
  if (P.shT > 0) { P.shT -= dt; if (Math.random() < .5) { const a = Math.random() * 6.28; G.parts.push({ x: P.x + Math.cos(a) * 11, y: P.y - 6 + Math.sin(a) * 11, vx: 0, vy: -6, life: .3, t: 0, col: '#9ab8ff', sz: 1 }); } }
  for (let i = G.delayed.length - 1; i >= 0; i--) {
    const q = G.delayed[i]; if (q.mid !== G.mid) { G.delayed.splice(i, 1); continue; } q.t -= dt;
    if (q.t > 0) { const a = Math.random() * 6.28, r = 38; G.parts.push({ x: q.x + Math.cos(a) * r, y: q.y + Math.sin(a) * r * .8, vx: 0, vy: 0, life: .15, t: 0, col: '#ff6a2a', sz: 2 }); G.parts.push({ x: q.x + rnd(-6, 6), y: q.y - q.t * 150, vx: 0, vy: 60, life: .12, t: 0, col: '#ffcc66', sz: 3 }); }
    else {
      G.delayed.splice(i, 1); SND.play('explosion'); G.addShake(7); G.flashT = .12; G.spark(q.x, q.y, '#ffb050', 30, 130);
      for (let j = 0; j < 36; j++) { const a = j / 36 * 6.28; G.parts.push({ x: q.x, y: q.y, vx: Math.cos(a) * 130, vy: Math.sin(a) * 110, life: .5, t: 0, col: j % 2 ? '#ff5a2a' : '#ffd070', sz: 2 }); }
      G.enemies.forEach(e => { if (e.dead) return; if (Math.hypot(e.x - q.x, e.y - q.y) < 42 + (e.boss ? 8 : e.d.sz)) damageEnemy(e, q.dmg, { el: 'fire', magic: 1, kb: 260, kang: Math.atan2(e.y - q.y, e.x - q.x), stun: .6 }); });
    }
  }
};

// --- элитные враги: ~18% обычных врагов сильнее и опаснее ---
const _spawn0 = spawnEnemy;
spawnEnemy = function (t, x, y, o) {
  const e = _spawn0(t, x, y, o);
  if (!e.minion && !e.d.unique && e.d.kind !== 'dummy' && Math.random() < .18) { e.elite = 1; e.d = Object.assign({}, e.d, { atk: Math.round(e.d.atk * 1.35), spd: e.d.spd * 1.12, xp: Math.round(e.d.xp * 2), gold: [e.d.gold[0] * 2, e.d.gold[1] * 2] }); e.hp = e.mhp = Math.round(e.mhp * 1.8); e.d.n = '★ ' + e.d.n; }
  return e;
};
G.spawnEnemy = spawnEnemy;
