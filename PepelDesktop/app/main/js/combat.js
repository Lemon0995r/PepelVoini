'use strict';
// ---------- Бой: игрок, навыки, враги (ИИ), снаряды, добыча ----------
const TOUCH = { ax: 0, ay: 0, k: {} };
const skLv = id => (S.skl && S.skl[id]) || 1;
const skMul = id => 1 + .18 * (skLv(id) - 1);
const ELCOL = { phys: '#ffffff', fire: '#ff8a2a', ice: '#8ad8ff', ash: '#ff5a4a' };
let ENID = 0;

function spawnEnemy(t, x, y, o) {
  const d = ENEMIES[t]; o = o || {};
  const e = { t, d, x, y, hx: x, hy: y, hp: d.hp, mhp: d.hp, st: 'idle', stT: rnd(0, 2), dir: 'd', fr: 0, fl: false, ang: rnd(0, 6.28), aim: 0, kx: 0, ky: 0, flash: 0, cd: rnd(.4, 1.4), poison: 0, burn: 0, slow: 0,
    aggro: false, lost: 0, dead: 0, tele: null, rc: clamp(d.sz * .55, 3, 7), id: ++ENID, idx: ENID % 4, combo: 0, comboT: 0, dash: 0, grp: o.grp, minion: !!d.minion, wt: 0, tx: x, ty: y };
  G.enemies.push(e); return e;
}
G.spawnEnemy = spawnEnemy;
G.event = name => {
  if (name === 'ash_goblins') {
    const m = G.map, gx = (m.core ? m.core.x + 31 : 31) * TS, gy = (m.core ? m.core.y + 38 : 38) * TS;
    for (let i = 0; i < 3; i++) { const p = freeNear(gx + (i - 1) * 24, gy + 20, 24, 6) || [gx, gy]; const e = spawnEnemy('goblin', p[0], p[1]); e.aggro = true; e.st = 'chase'; e.hp = e.mhp = 22; e.ash = 1; }
    G.toast('Пепельные гоблины у южных ворот!'); SND.play('alert');
  }
};

// ----- урон -----
function resOf(e, el) { const r = e.boss ? BOSSES[e.bid].res : e.d.res; return r && r[el] !== undefined ? r[el] : 1; }
function damageEnemy(e, raw, o) {
  o = o || {}; if (e.dead || e.invuln) { if (e.invuln && !e.dead) G.addFloat(e.x, e.y - 18, 'Неуязвим', '#aaa'); return 0; }
  const el = o.el || 'phys', rs = resOf(e, el), def = e.boss ? BOSSES[e.bid].def : e.d.def;
  let dmg = raw * rs - def * (o.magic ? .3 : .6); dmg = Math.max(1, Math.round(dmg * rnd(.92, 1.08)));
  const crit = o.crit; if (crit) dmg = Math.round(dmg * 1.7);
  if (e.d.kind === 'dummy') { e.hp = e.mhp; } else e.hp -= dmg;
  e.flash = .1; e.aggro = true; e.lost = 0; if (e.st === 'idle' || e.st === 'ret') e.st = 'chase';
  G.addFloat(e.x, e.y - 20, String(dmg), crit ? '#ffd24a' : rs > 1.1 ? '#ff9a4a' : rs < .6 ? '#8a98c0' : ELCOL[el] === '#ffffff' ? '#fff' : ELCOL[el], crit);
  if (rs > 1.1 && !crit) G.addFloat(e.x + 10, e.y - 28, 'уязвим', '#ff9a4a');
  if (o.kb && !e.boss && e.d.kind !== 'heavy') { const a = o.kang; e.kx = Math.cos(a) * o.kb; e.ky = Math.sin(a) * o.kb; }
  if (o.stun && !e.boss) { e.st = 'stun'; e.stT = o.stun; e.tele = null; e.combo = 0; }
  else if (o.kb && !e.boss && e.st === 'wind' && e.d.kind !== 'heavy') { e.st = 'stun'; e.stT = .2; e.tele = null; }
  if (el === 'ice') e.slow = 2; if (el === 'fire') e.burn = 2.5;
  G.spark(e.x, e.y - 8, crit ? '#ffd24a' : ELCOL[el], crit ? 10 : 5, 70); SND.play(crit ? 'crit' : 'hit');
  if (e.d.kind !== 'dummy' && e.hp <= 0) killEnemy(e);
  return dmg;
}
function killEnemy(e) {
  if (e.dead) return; e.dead = .001; e.tele = null; const d = e.d;
  if (e.boss) { bossDefeated(e); return; }
  SND.play('death_enemy'); G.spark(e.x, e.y - 6, '#ddd', 12, 90); if (e.minion) return;
  S.kills = (S.kills || 0) + 1; gainXP(d.xp); QP('kill', e.t, 1);
  const g = rint(d.gold[0], d.gold[1]); if (g > 0) dropAt(e.x, e.y, null, g);
  (d.drops || []).forEach(([id, p]) => { if (Math.random() < p) dropAt(e.x + rnd(-6, 6), e.y + rnd(-4, 4), id, 1); });
  if (d.unique) S.flags['u_' + e.t] = 1;
  G.addFloat(e.x, e.y - 30, '+' + d.xp + ' оп.', '#ffd24a');
}
function dropAt(x, y, id, n) { G.drops.push({ x, y, id, n, gold: id ? 0 : n, t: 0 }); }
function gainXP(n) {
  if (!n) return; const p = S.p; if (p.lvl >= 20) return; p.xp += n;
  while (p.lvl < 20 && p.xp >= xpNeed(p.lvl)) {
    p.xp -= xpNeed(p.lvl); p.lvl++; p.pts += 3; p.spts += 1; const st = stats(); p.hp = st.maxhp; p.mp = st.maxmp;
    SND.play('levelup'); G.flashT = .35; UI.toast('Новый уровень: ' + p.lvl + '\n+3 очка характеристик, +1 очко навыка', 'gold');
    Object.keys(SKILLS).forEach(k => { if (SKILLS[k].unlock === p.lvl) UI.toast('Открыт навык: ' + SKILLS[k].n, 'gold'); });
    G.spark(G.P.x, G.P.y - 8, '#ffd24a', 24, 110);
  }
  if (p.lvl >= 20) p.xp = 0;
}
function hurtPlayer(raw, src, kx, ky, kind) {
  const P = G.P, st = stats(); if (P.inv > 0 || P.dead || G.mode !== 'play') return false;
  if (!kind && Math.random() < st.dodge) { G.addFloat(P.x, P.y - 22, 'Уклонение', '#6a9aff'); SND.play('roll'); P.inv = .25; return false; }
  let dmg = kind ? raw : Math.max(1, Math.round(raw * rnd(.9, 1.1) - st.def * .45));
  if (kind === 'trap' || kind === 'lava') dmg = Math.max(1, Math.round(raw - st.def * .2));
  dmg = Math.max(1, Math.round(dmg)); S.p.hp -= dmg; P.hurt = .18; P.inv = kind === 'lava' ? .1 : .5; P.kx = kx || 0; P.ky = ky || 0; P.castT = 0;
  G.addFloat(P.x, P.y - 22, '-' + dmg, '#ff5a5a', true); G.addShake(dmg > st.maxhp * .2 ? 5 : 2.5); SND.play('hurt'); G.spark(P.x, P.y - 8, '#ff3a3a', 6, 70);
  if (src && src.d) { if (src.d.poison) { P.poison = 4; G.addFloat(P.x, P.y - 32, 'яд', '#5ad04a'); } if (src.d.slow) P.slow = 2.5; }
  if (S.p.hp <= 0) { S.p.hp = 0; P.dead = .001; G.mode = 'dead'; SND.play('player_death'); SND.music(null); UI.death(); }
  return true;
}
G.respawn = () => {
  const st = stats(); S.p.hp = st.maxhp; S.p.mp = st.maxmp; S.p.gold = Math.floor(S.p.gold * .9); const r = S.respawn || { map: 'capital' };
  G.mode = 'play'; G.P.dead = 0; G.P.poison = 0; G.P.slow = 0; UI.closeAll(); UI.showHud(true); loadMap(r.map, r.x, r.y); G.toast('Вы возрождены. Потеряно 10% золота.');
};

// ----- игрок -----
function aimAngle() {
  const P = G.P; if (MOUSE.used && (MOUSE.down || G.t - (MOUSE.t || 0) < 3)) return Math.atan2(MOUSE.y - (P.y - G.cam.y - 6), MOUSE.x - (P.x - G.cam.x));
  return P.face;
}
addEventListener('mousemove', () => { MOUSE.t = G.t; });
function findPotion(kind) { const lst = kind === 'hp' ? ['bread', 'potion_hp', 'potion_hp2'] : ['potion_mp', 'potion_mp2']; return lst.find(id => countItem(id) > 0); }
function usePotion(kind) {
  const id = findPotion(kind), st = stats(); if (!id) return G.toast(kind === 'hp' ? 'Нет лечебных зелий' : 'Нет зелий маны');
  if (kind === 'hp' && S.p.hp >= st.maxhp) return G.toast('Здоровье полное'); if (kind === 'mp' && S.p.mp >= st.maxmp) return G.toast('Мана полная');
  useItem(id);
}
function updatePlayer(dt) {
  const P = G.P, st = stats(), p = S.p; if (P.dead) return;
  const K = KEYS, T_ = TOUCH.k;
  let mx = (K.KeyD || K.ArrowRight ? 1 : 0) - (K.KeyA || K.ArrowLeft ? 1 : 0) + TOUCH.ax, my = (K.KeyS || K.ArrowDown ? 1 : 0) - (K.KeyW || K.ArrowUp ? 1 : 0) + TOUCH.ay;
  const ml = Math.hypot(mx, my); if (ml > 1) { mx /= ml; my /= ml; }
  P.inv = Math.max(0, P.inv - dt); P.hurt = Math.max(0, P.hurt - dt); P.castT = Math.max(0, P.castT - dt * 2); P.rcd = Math.max(0, (P.rcd || 0) - dt); P.atkCd = Math.max(0, (P.atkCd || 0) - dt);
  P.comboT = Math.max(0, P.comboT - dt); if (!P.comboT) P.combo = 0; for (const k in P.cd) if (P.cd[k] > 0) P.cd[k] -= dt;
  if (P.swing) { P.swing.t += dt; if (P.swing.t > P.swing.T) P.swing = null; }
  // яд, замедление, восстановление
  if (P.poison > 0) { P.poison -= dt; P.pt = (P.pt || 0) - dt; if (P.pt <= 0) { P.pt = 1; hurtPlayer(2 + p.lvl * .5, null, 0, 0, 'poison'); } } if (P.slow > 0) P.slow -= dt;
  p.mp = Math.min(st.maxmp, p.mp + (1.6 + st.int * .1) * dt); p.hp = Math.min(st.maxhp, p.hp);
  // направление взгляда
  const aim = aimAngle(); if (ml > .1 && !(MOUSE.down && MOUSE.used)) P.face = Math.atan2(my, mx); else P.face = aim;
  const fa = P.face; P.fl = Math.cos(fa) < 0; P.dir = Math.abs(Math.cos(fa)) > Math.abs(Math.sin(fa)) * 1.1 ? 's' : Math.sin(fa) < 0 ? 'u' : 'd';
  // перекат
  if ((wasP('Space') || wasP('ShiftLeft') || TOUCH.k.roll) && P.rcd <= 0 && !P.roll && !P.stun) {
    TOUCH.k.roll = 0; const a = ml > .1 ? Math.atan2(my, mx) : fa; P.roll = .28; P.rcd = .6; P.rdx = Math.cos(a); P.rdy = Math.sin(a); P.inv = Math.max(P.inv, .26 + skLv('dodge') * .03); SND.play('roll'); P.swing = null;
  }
  let vx = 0, vy = 0;
  if (P.roll > 0) { P.roll -= dt; vx = P.rdx * 190; vy = P.rdy * 190; if (Math.random() < .5) G.parts.push({ x: P.x, y: P.y - 2, vx: 0, vy: -4, life: .3, t: 0, col: '#9ab', sz: 2 }); }
  else {
    const sp = st.spd * (P.slow > 0 ? .6 : 1) * (P.atkCd > 0 ? .6 : 1); vx = mx * sp; vy = my * sp;
    if (ml > .1) { P.wt += dt * 9; if (Math.floor(P.wt * 1.4) !== Math.floor((P.wt - dt * 9) * 1.4) && Math.floor(P.wt) % 2 === 0) SND.play('step'); } else P.wt = 0;
  }
  vx += P.kx; vy += P.ky; P.kx *= Math.pow(.001, dt); P.ky *= Math.pow(.001, dt);
  const ox = P.x, oy = P.y; moveBody(P, vx * dt, vy * dt, 4);
  for (const n of G.npcs) if (Math.hypot(P.x - n.x, P.y - n.y) < 8) { P.x = ox; P.y = oy; break; }
  // атака
  const wantAtk = (MOUSE.down && MOUSE.used) || K.KeyK || T_.atk;
  if (wantAtk && P.atkCd <= 0 && !G.busy) { if (P.roll > 0) { P.roll = 0; P.rcd = Math.min(P.rcd, .25); } attackMelee(aim, st); }
  const cast = (id) => castSkill(id, aim, st);
  HOTBAR.forEach((id, i) => { if (wasP('Digit' + (i + 1)) || wasP('Numpad' + (i + 1)) || T_['s' + (i + 1)]) { T_['s' + (i + 1)] = 0; cast(id); } });
  if (wasP('KeyQ') || T_.pot) { T_.pot = 0; usePotion('hp'); } if (wasP('KeyR')) usePotion('mp');
  if (T_.use) { T_.use = 0; PRESS.KeyE = 1; } if (T_.menu) { T_.menu = 0; UI.pause(); }
  // добыча
  for (let i = G.drops.length - 1; i >= 0; i--) {
    const d = G.drops[i]; d.t += dt; const dd = Math.hypot(P.x - d.x, P.y - d.y);
    if (dd < 40 && d.t > .35) { const a = Math.atan2(P.y - d.y, P.x - d.x); d.x += Math.cos(a) * 140 * dt; d.y += Math.sin(a) * 140 * dt; }
    if (dd < 10 && d.t > .35) {
      if (d.gold) { p.gold += d.gold; SND.play('coin'); G.addFloat(P.x, P.y - 24, '+' + d.gold + ' зол.', '#ffd24a'); G.drops.splice(i, 1); }
      else if (addItem(d.id, d.n)) { SND.play('pickup'); G.addFloat(P.x, P.y - 24, itemName(d.id), '#9fd0ff'); G.drops.splice(i, 1); }
      else if (!d.warn) { d.warn = 1; G.toast('Инвентарь полон'); }
    }
    if (d.t > 120) G.drops.splice(i, 1);
  }
}
function enemiesInCone(P, ang, range, arc) {
  const out = [];
  for (const e of G.enemies) {
    if (e.dead || e.spawning) continue; const er = e.boss ? BOSSES[e.bid].sz * .7 : e.d.sz * (e.d.sc || 1) * .8, d = Math.hypot(e.x - P.x, e.y - P.y);
    if (d > range + er) continue; const a = Math.atan2(e.y - P.y, e.x - P.x), tol = arc / 2 + Math.atan2(er, Math.max(d, 4));
    if (Math.abs(angDiff(a, ang)) > tol) continue; if (!los(P.x, P.y - 5, e.x, e.y - 5)) continue; out.push(e);
  } return out;
}
function attackMelee(aim, st) {
  const P = G.P, c = P.combo, mult = [1, 1.05, 1.6][c], range = [26, 27, 32][c], arc = [1.9, 1.9, 2.5][c], T = [.26, .26, .38][c];
  P.face = aim; P.atkCd = T; P.comboT = .75; P.combo = (c + 1) % 3; SND.play('swing');
  P.swing = { ang: aim, t: 0, T: .2, arc, range, col: st.elem ? ELCOL[st.elem] : c === 2 ? '#ffe9a0' : '#ffffff' };
  const lv = skMul('strike'); P.kx += Math.cos(aim) * 55; P.ky += Math.sin(aim) * 55;
  let hit = 0;
  enemiesInCone(P, aim, range, arc).forEach(e => {
    const crit = Math.random() < st.crit, raw = (st.atk + S.p.lvl * 1.5) * mult * lv;
    damageEnemy(e, raw, { el: st.elem || 'phys', crit, kb: c === 2 ? 190 : 110, kang: aim, stun: c === 2 ? .35 : 0 }); hit++;
  });
  if (hit) { G.hitstop = c === 2 ? .07 : .04; G.addShake(c === 2 ? 2.5 : 1.2); S.p.mp = Math.min(stats().maxmp, S.p.mp + 1.5 * hit); }
  // манекены и объекты: удар по ящикам не нужен
}
function magicPow(st) { return (10 + st.int * 2.4) * (1 + .12 * (S.p.lvl - 1)); }
function castSkill(id, aim, st) {
  const P = G.P, sk = SKILLS[id], p = S.p; if (!sk || P.dead || G.busy) return;
  if (p.lvl < sk.unlock) return G.toast('Навык «' + sk.n + '» откроется на уровне ' + sk.unlock);
  if ((P.cd[id] || 0) > 0) return; if (p.mp < sk.mp) { G.addFloat(P.x, P.y - 24, 'Мало маны', '#6a9aff'); return; }
  p.mp -= sk.mp; P.cd[id] = sk.cd * (1 - Math.min(.3, (skLv(id) - 1) * .06)); P.castT = 1; const m = skMul(id);
  if (id === 'fire') {
    P.face = aim; P.atkCd = .3; SND.play('fireball');
    G.projs.push({ x: P.x + Math.cos(aim) * 8, y: P.y - 6 + Math.sin(aim) * 8, vx: Math.cos(aim) * 190, vy: Math.sin(aim) * 190, r: 4, col: '#ff8a2a', dmg: magicPow(st) * 1.25 * m, from: 'p', kind: 'fire', el: 'fire', life: 1.6, splash: 28 });
  } else if (id === 'whirl') {
    SND.play('whirl'); P.swing = { ang: 0, t: 0, T: .35, arc: 6.28, range: 38, col: '#cfd6e4' }; P.atkCd = .3; P.inv = Math.max(P.inv, .2);
    let n = 0; G.enemies.forEach(e => { if (e.dead) return; const d = Math.hypot(e.x - P.x, e.y - P.y); if (d < 40 + (e.boss ? 10 : e.d.sz) && los(P.x, P.y - 5, e.x, e.y - 5)) { damageEnemy(e, (st.atk + p.lvl * 1.5) * 1.3 * m, { kb: 220, kang: Math.atan2(e.y - P.y, e.x - P.x), stun: .7, crit: Math.random() < st.crit }); n++; } });
    if (n) { G.hitstop = .06; G.addShake(3); }
  } else if (id === 'heal') {
    const amt = Math.round((28 + st.int * 3.2) * m); p.hp = Math.min(st.maxhp, p.hp + amt); SND.play('heal'); G.addFloat(P.x, P.y - 24, '+' + amt, '#6aff6a', true); G.spark(P.x, P.y - 8, '#6aff6a', 16, 50); P.poison = 0;
  } else if (id === 'nova') {
    SND.play('nova'); G.addShake(6); G.flashT = .15; P.atkCd = .4; P.inv = Math.max(P.inv, .3);
    for (let i = 0; i < 48; i++) { const a = i / 48 * 6.28; G.parts.push({ x: P.x, y: P.y - 6, vx: Math.cos(a) * 170, vy: Math.sin(a) * 170, life: .5, t: 0, col: i % 2 ? '#ff5a4a' : '#ffb06a', sz: 2 }); }
    G.enemies.forEach(e => { if (e.dead) return; const d = Math.hypot(e.x - P.x, e.y - P.y); if (d < 84 && los(P.x, P.y - 5, e.x, e.y - 5)) damageEnemy(e, magicPow(st) * 2.1 * m, { el: 'ash', magic: 1, kb: 260, kang: Math.atan2(e.y - P.y, e.x - P.x), stun: .6 }); });
    G.projs = G.projs.filter(q => q.from === 'p' || Math.hypot(q.x - P.x, q.y - P.y) > 84);
  }
}

// ----- снаряды и области -----
function explode(x, y, rad, dmg, el, except) {
  G.spark(x, y, '#ffb050', 16, 100); G.addShake(2); SND.play('explosion');
  for (let i = 0; i < 18; i++) { const a = i / 18 * 6.28; G.parts.push({ x, y, vx: Math.cos(a) * 80, vy: Math.sin(a) * 80, life: .3, t: 0, col: '#ff6a2a', sz: 2 }); }
  G.enemies.forEach(e => { if (e.dead || e === except) return; if (Math.hypot(e.x - x, e.y - y) < rad + (e.boss ? 8 : e.d.sz) && los(x, y, e.x, e.y - 4)) damageEnemy(e, dmg * .6, { el, magic: 1, kb: 120, kang: Math.atan2(e.y - y, e.x - x) }); });
}
function updateProjs(dt) {
  const P = G.P;
  for (let i = G.projs.length - 1; i >= 0; i--) {
    const q = G.projs[i]; q.x += q.vx * dt; q.y += q.vy * dt; q.life -= dt; let dead = q.life <= 0;
    if (!dead && objSolidAt(q.x, q.y)) { dead = true; G.spark(q.x, q.y, q.col, 5, 50); if (q.splash) explode(q.x, q.y, q.splash, q.dmg, q.el); }
    else if (!dead && q.from === 'e') { if (Math.hypot(q.x - P.x, q.y - (P.y - 5)) < q.r + 5) { if (hurtPlayer(q.dmg, q.src, q.vx * .2, q.vy * .2)) { if (q.slow) P.slow = 2.5; } dead = true; G.spark(q.x, q.y, q.col, 6, 60); } }
    else if (!dead && q.from === 'p') {
      for (const e of G.enemies) { if (e.dead) continue; if (q.hs && q.hs.has(e)) continue; const er = e.boss ? BOSSES[e.bid].sz * .7 : e.d.sz * (e.d.sc || 1) * .8; if (Math.hypot(q.x - e.x, q.y - (e.y - 5)) < q.r + er) { damageEnemy(e, q.dmg, { el: q.el, magic: q.phys ? 0 : 1, crit: q.crit, kb: 90, kang: Math.atan2(q.vy, q.vx), slow: q.slowE }); if (q.splash) explode(q.x, q.y, q.splash, q.dmg, q.el, e); if (q.pierce) { (q.hs = q.hs || new Set()).add(e); q.dmg *= .85; } else { dead = true; break; } } }
    }
    if (q.trail !== false && Math.random() < .5) G.parts.push({ x: q.x, y: q.y, vx: rnd(-8, 8), vy: rnd(-8, 8), life: .25, t: 0, col: q.col, sz: 1 });
    if (dead) G.projs.splice(i, 1);
  }
}
function updateHazards(dt) {
  const P = G.P;
  for (let i = G.hazards.length - 1; i >= 0; i--) {
    const h = G.hazards[i]; h.t += dt;
    if (h.t >= h.warn) {
      if (!h.fired) { h.fired = 1; if (h.sfx) SND.play(h.sfx); if (h.burst) { G.addShake(3); G.spark(h.x, h.y, '#ff6a3a', 14, 90); } }
      h.tick = (h.tick || 0) - dt; if (h.tick <= 0 && !(P.roll > 0 && !h.unavoid)) { h.tick = h.once ? 99 : .4; if (Math.hypot(P.x - h.x, P.y - h.y) < h.r) hurtPlayer(h.dmg, null, 0, 0, 'hazard'); }
    }
    if (h.t > h.warn + h.dur) G.hazards.splice(i, 1);
  }
}

// ----- ИИ врагов -----
function eAngle(e, t) { return Math.atan2(t.y - e.y, t.x - e.x); }
function steer(e, ang, spd, dt) {
  for (const off of [0, .8, -.8, 1.6, -1.6]) {
    const a = ang + off, dx = Math.cos(a) * spd * dt, dy = Math.sin(a) * spd * dt;
    if (boxFree(e.x + dx, e.y + dy, e.rc)) { e.x += dx; e.y += dy; e.fr = (e.fr + dt * 7) % 4; e.ang = a; faceTo(e, a); return true; }
  } return false;
}
function faceTo(e, a) { e.fl = Math.cos(a) < 0; e.dir = Math.abs(Math.cos(a)) > Math.abs(Math.sin(a)) ? 's' : Math.sin(a) < 0 ? 'u' : 'd'; }
function startAttack(e, P) {
  const d = e.d, k = d.kind; e.aim = eAngle(e, P); faceTo(e, e.aim); e.st = 'wind'; e.stT = d.wind * (k === 'combo' ? .8 : 1); e.T0 = e.stT; SND.play('alert');
  const t = { t: 0, T: e.stT, x: e.x, y: e.y - 4, ang: e.aim };
  if (k === 'heavy') { t.type = 'circle'; t.x = e.x + Math.cos(e.aim) * d.reach * .75; t.y = e.y + Math.sin(e.aim) * d.reach * .75; t.r = d.reach * .9 + 4; }
  else if (k === 'lunge') { t.type = 'line'; t.r = 70; t.w = 10; }
  else if (k === 'ranged' || k === 'caster') { t.type = 'line'; t.r = Math.min(d.reach, 120); t.w = k === 'caster' ? 22 : 4; }
  else { t.type = 'cone'; t.r = d.reach + 4; t.arc = 1.7; }
  e.tele = t; e.hit = 0;
}
function enemyStrike(e, P) {
  const d = e.d, k = d.kind, dmg = d.atk;
  const strikeMelee = (reach, arc, kb) => { const dd = Math.hypot(P.x - e.x, P.y - e.y); if (dd < reach + 4 && Math.abs(angDiff(eAngle(e, P), e.aim)) < arc / 2 + Math.atan2(5, Math.max(dd, 4)) && los(e.x, e.y - 5, P.x, P.y - 5)) hurtPlayer(dmg, e, Math.cos(e.aim) * kb, Math.sin(e.aim) * kb); };
  if (k === 'melee' || k === 'pack') { strikeMelee(d.reach, 1.7, 120); SND.play('swing'); }
  else if (k === 'heavy') {
    const cx = e.x + Math.cos(e.aim) * d.reach * .75, cy = e.y + Math.sin(e.aim) * d.reach * .75; G.addShake(3); SND.play('explosion'); G.spark(cx, cy, '#aaa', 10, 80);
    if (Math.hypot(P.x - cx, P.y - cy) < d.reach * .9 + 4 && los(e.x, e.y - 5, P.x, P.y - 5)) hurtPlayer(dmg, e, Math.cos(e.aim) * 200, Math.sin(e.aim) * 200);
  } else if (k === 'combo') { strikeMelee(d.reach, 1.9, 90); SND.play('swing'); e.kx += Math.cos(e.aim) * 90; e.ky += Math.sin(e.aim) * 90; }
  else if (k === 'lunge') { e.dash = .22; e.dashHit = 0; e.kx = Math.cos(e.aim) * 250; e.ky = Math.sin(e.aim) * 250; SND.play('swing'); }
  else if (k === 'ranged' || k === 'caster') {
    const shots = k === 'caster' ? [-.3, 0, .3] : [0], col = { bolt: '#d0d0d0', arrow: '#d8c8a0', ice: '#8ad8ff', ashorb: '#ff4a5a' }[d.proj] || '#fff';
    shots.forEach(o => G.projs.push({ x: e.x, y: e.y - 6, vx: Math.cos(e.aim + o) * 135, vy: Math.sin(e.aim + o) * 135, r: k === 'caster' ? 5 : 3, col, dmg, from: 'e', kind: d.proj === 'bolt' || d.proj === 'arrow' ? d.proj : 'orb', life: 3, src: e, slow: d.slow }));
    SND.play(d.proj === 'ice' ? 'ice' : d.proj === 'ashorb' ? 'fireball' : 'swing');
  }
}
function updateEnemies(dt) {
  const P = G.P;
  for (let i = G.enemies.length - 1; i >= 0; i--) {
    const e = G.enemies[i]; if (e.dead) { e.dead += dt; if (e.dead > .7) G.enemies.splice(i, 1); continue; }
    if (e.boss) { e.flash = Math.max(0, e.flash - dt); continue; }
    const d = e.d, dd = Math.hypot(P.x - e.x, P.y - e.y); if (dd > 460 && e.st === 'idle') continue;
    e.flash = Math.max(0, e.flash - dt); e.cd -= dt; e.slow = Math.max(0, e.slow - dt);
    if (e.burn > 0) { e.burn -= dt; e.bt = (e.bt || 0) - dt; if (e.bt <= 0) { e.bt = .5; if (d.kind !== 'dummy') { e.hp -= 3 + S.p.lvl; G.addFloat(e.x, e.y - 18, '🔥', '#ff8a2a'); if (e.hp <= 0) killEnemy(e); } } }
    if (e.dead) continue;
    if (e.kx || e.ky) { moveBody(e, e.kx * dt, e.ky * dt, e.rc); e.kx *= Math.pow(.005, dt); e.ky *= Math.pow(.005, dt); if (Math.abs(e.kx) < 3) e.kx = 0; if (Math.abs(e.ky) < 3) e.ky = 0; }
    if (d.kind === 'dummy') continue;
    const spd = d.spd * (e.slow > 0 ? .55 : 1), sees = dd < d.aggro && los(e.x, e.y - 5, P.x, P.y - 5) && !P.dead;
    if (e.dash > 0) { e.dash -= dt; if (!e.dashHit && dd < e.rc + 8 && !P.roll) { e.dashHit = 1; hurtPlayer(d.atk, e, Math.cos(e.aim) * 140, Math.sin(e.aim) * 140); } if (e.dash <= 0) { e.st = 'rec'; e.stT = .5; e.tele = null; } continue; }
    switch (e.st) {
      case 'idle':
        e.stT -= dt; if (e.stT <= 0) { e.stT = rnd(1.5, 3.5); e.tx = e.hx + rnd(-36, 36); e.ty = e.hy + rnd(-28, 28); }
        { const tx = e.tx - e.x, ty = e.ty - e.y, td = Math.hypot(tx, ty); if (td > 3 && e.stT < 2.2) steer(e, Math.atan2(ty, tx), spd * .35, dt); else e.fr = 0; }
        if (sees || (e.aggro && dd < d.aggro * 1.5)) { e.st = 'chase'; e.aggro = true; e.lost = 0; SND.play('alert'); G.enemies.forEach(o => { if (o !== e && !o.dead && o.grp === e.grp && o.grp !== undefined && o.st === 'idle' && Math.hypot(o.x - e.x, o.y - e.y) < 120) { o.st = 'chase'; o.aggro = true; } }); }
        break;
      case 'chase': {
        if (!sees) { e.lost += dt; } else e.lost = 0;
        if (e.lost > 4 || dd > d.aggro * 2.4 + 80 || Math.hypot(e.x - e.hx, e.y - e.hy) > 300) { e.st = 'ret'; e.aggro = false; e.tele = null; break; }
        const ang = eAngle(e, P), want = d.reach * .85;
        if (d.kind === 'ranged' || d.kind === 'caster') {
          if (dd < d.reach * .4) steer(e, ang + Math.PI, spd, dt); else if (dd > d.reach * .8 || !sees) steer(e, ang, spd, dt); else { e.fr = 0; faceTo(e, ang); }
          if (sees && e.cd <= 0 && dd < d.reach) startAttack(e, P);
        } else {
          let tgt = ang;
          if (d.kind === 'pack' && dd > want + 18) { const off = (e.idx - 1.5) * .55, a2 = ang + off * (dd < 70 ? 1.4 : .6); tgt = a2; }
          if (dd > want * .8) steer(e, tgt, spd * (d.kind === 'pack' && dd < 60 ? 1.15 : 1), dt); else { e.fr = 0; faceTo(e, ang); }
          if (sees && e.cd <= 0 && dd < (d.kind === 'lunge' ? d.reach + 26 : d.reach * .95)) startAttack(e, P);
        }
        break;
      }
      case 'wind':
        e.stT -= dt; e.tele.t += dt; e.fr = 0;
        if (d.kind !== 'heavy' && d.kind !== 'lunge') { e.aim = lerp(e.aim, e.aim + angDiff(eAngle(e, P), e.aim), dt * 3); e.tele.ang = e.aim; e.tele.x = e.x; e.tele.y = e.y - 4; }
        if (e.stT <= 0) {
          enemyStrike(e, P); e.tele = null; if (d.kind === 'lunge') break;
          if (d.kind === 'combo' && e.combo < 2) { e.combo++; e.st = 'wind'; e.stT = d.wind * .6; e.T0 = e.stT; e.aim = eAngle(e, P); e.tele = { type: 'cone', t: 0, T: e.stT, x: e.x, y: e.y - 4, r: d.reach + 4, arc: 1.9, ang: e.aim }; }
          else { e.combo = 0; e.st = 'rec'; e.stT = d.kind === 'pack' ? .7 : .45; e.cd = d.cd * rnd(.85, 1.2); e.retreat = d.kind === 'pack'; }
        }
        break;
      case 'rec':
        e.stT -= dt; if (e.retreat) steer(e, eAngle(e, P) + Math.PI, spd * .8, dt); if (e.stT <= 0) { e.st = 'chase'; e.retreat = false; }
        break;
      case 'stun': e.stT -= dt; e.tele = null; if (e.stT <= 0) e.st = 'chase'; break;
      case 'ret': {
        const tx = e.hx - e.x, ty = e.hy - e.y, td = Math.hypot(tx, ty); e.hp = Math.min(e.mhp, e.hp + e.mhp * .1 * dt); steer(e, Math.atan2(ty, tx), spd * .9, dt);
        if (td < 8) { e.st = 'idle'; e.stT = 1; } if (sees && dd < d.aggro * .6) { e.st = 'chase'; e.aggro = true; }
        break;
      }
    }
    // мягкое расталкивание
    for (let j = 0; j < G.enemies.length; j++) { const o = G.enemies[j]; if (o === e || o.dead || o.boss) continue; const ox = e.x - o.x, oy = e.y - o.y, od = Math.hypot(ox, oy); if (od < 9 && od > .1) moveBody(e, ox / od * 24 * dt, oy / od * 24 * dt, e.rc); }
  }
}
