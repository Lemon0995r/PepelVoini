'use strict';
// ---------- Боссы: региональные стражи и Пепельный Король (3 фазы + финальная механика) ----------
ENEMIES.ashcrystal = { n: 'Пепельный кристалл', hp: 90, atk: 0, def: 0, spd: 0, xp: 0, gold: [0, 0], aggro: 0, kind: 'static', wind: 1, cd: 9, reach: 0, spr: 'crystal', sz: 7, drops: [], minion: 1, info: '' };
const BOSS_CFG = {
  forest_guard: { spd: 34, bsc: 1.7, rc: 9 }, castellan: { spd: 52, bsc: 1.25, rc: 8 }, queen: { spd: 58, bsc: 1.9, rc: 9, poison: 1 },
  ice_guardian: { spd: 40, bsc: 1.9, rc: 9, slow: 1 }, ash_king: { spd: 38, bsc: 1, rc: 10 }
};
const bossPhase = e => { const r = e.hp / e.mhp; return e.bid === 'ash_king' ? (r > .5 ? 1 : r > .25 ? 2 : 3) : (r > .5 ? 1 : 2); };

function bossTrigger(t) {
  if (S.flags['bossdone_' + t.id] || G.boss || G.mode !== 'play') return;
  const a = t.area, P = G.P, tx = P.x / TS, ty = P.y / TS; if (tx < a[0] || tx > a[2] || ty < a[1] || ty > a[3]) return;
  if (t.id === 'ash_king' && !F('throne_open')) return;
  const b = BOSSES[t.id], cfg = BOSS_CFG[t.id], x = t.x * TS + 8, y = t.y * TS + 8;
  const e = { boss: 1, bid: t.id, d: { kind: 'boss', n: b.n, sz: b.sz, sc: 1, def: b.def, poison: cfg.poison, slow: cfg.slow }, t: t.id, x, y, hp: b.hp, mhp: b.hp, st: 'intro', stT: 0, dir: 'd', fr: 0, fl: false, aim: 0, kx: 0, ky: 0, flash: 0, dead: 0, tele: null, rc: cfg.rc, bsc: cfg.bsc, phase: 1, invuln: true, clock: 0, sch: [], cd: 1.2, atk: b.atk, area: [a[0] * TS, a[1] * TS, a[2] * TS + TS, a[3] * TS + TS], away: 0, id: ++ENID, spd: cfg.spd, wt: 0, shielded: 0 };
  G.enemies.push(e); G.boss = e; SND.music(b.music); SND.play('boss_roar'); G.addShake(4);
  G.say(BOSS_INTRO[t.id] || [], () => { e.invuln = false; e.st = 'idle'; });
}
const sched = (e, t, fn) => e.sch.push([e.clock + t, fn]);
const hz = (x, y, r, warn, dmg, o) => G.hazards.push(Object.assign({ x, y, r, warn, dur: .25, dmg, t: 0, once: true, burst: 1, sfx: 'explosion' }, o || {}));
function lineHaz(e, ang, len, r, warn, dmg) { for (let i = 14; i <= len; i += r * 1.3) hz(e.x + Math.cos(ang) * i, e.y + Math.sin(ang) * i, r, warn + i * .0035, dmg, { sfx: i < 30 ? 'explosion' : null }); }
function bshot(e, ang, spd, dmg, col, o) { G.projs.push({ x: e.x, y: e.y - 8, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, r: (o && o.r) || 4, col, dmg, from: 'e', kind: 'orb', life: 4, src: e, slow: o && o.slow }); }
function ringShots(e, n, spd, dmg, col, off, o) { for (let i = 0; i < n; i++) bshot(e, off + i / n * 6.283, spd, dmg, col, o); SND.play('fireball'); }
function coneHit(e, reach, arc, dmg, kb) {
  const P = G.P, dd = Math.hypot(P.x - e.x, P.y - e.y); G.addShake(2); SND.play('swing');
  if (dd < reach + 6 && Math.abs(angDiff(Math.atan2(P.y - e.y, P.x - e.x), e.aim)) < arc / 2 + .15 && los(e.x, e.y - 5, P.x, P.y - 5)) hurtPlayer(dmg, e, Math.cos(e.aim) * (kb || 150), Math.sin(e.aim) * (kb || 150));
}
function meleeAtk(e, P, reach, arc, warn, dmg, kb) {
  e.aim = Math.atan2(P.y - e.y, P.x - e.x); faceTo(e, e.aim); e.tele = { type: 'cone', t: 0, T: warn, x: e.x, y: e.y - 4, r: reach, arc, ang: e.aim };
  sched(e, warn, () => { coneHit(e, reach, arc, dmg, kb); e.tele = null; }); SND.play('alert'); return warn + .45;
}
function chargeAtk(e, P, warn, dmg, spd) {
  e.aim = Math.atan2(P.y - e.y, P.x - e.x); faceTo(e, e.aim); e.tele = { type: 'line', t: 0, T: warn, x: e.x, y: e.y - 4, ang: e.aim, r: 150, w: 20 }; SND.play('alert');
  sched(e, warn, () => { e.tele = null; e.bdash = { t: .5, vx: Math.cos(e.aim) * spd, vy: Math.sin(e.aim) * spd, hit: 0, dmg }; SND.play('whirl'); }); return warn + .8;
}
function spawnMinions(e, types, n) {
  for (let i = 0; i < n; i++) { const t = types[i % types.length], p = freeNear(e.x + rnd(-50, 50), e.y + rnd(-40, 40), 40, 7); if (!p) continue; const m = spawnEnemy(t, p[0], p[1]); m.aggro = true; m.st = 'chase'; m.minion = true; m.hx = p[0]; m.hy = p[1]; G.spark(p[0], p[1], '#ff4a3a', 10, 60); }
  SND.play('boss_phase');
}
function arenaPoint(e) { const a = e.area; return [rnd(a[0] + 24, a[2] - 24), rnd(a[1] + 24, a[3] - 24)]; }

// ----- наборы атак: возвращают длительность атаки -----
const BA = {
  forest_guard: {
    near: ph => ph === 1 ? ['swipe', 'slam', 'swipe'] : ['swipe', 'slam', 'thorns', 'roots'], far: ph => ph === 1 ? ['slam', 'roots'] : ['roots', 'thorns', 'slam'],
    swipe: (e, P) => meleeAtk(e, P, 38, 2.1, .75, e.atk * 1.0, 200),
    slam: (e, P) => { hz(P.x, P.y, 38, .95, e.atk * .95); e.tele = null; return 1.7; },
    roots: (e, P) => { e.aim = Math.atan2(P.y - e.y, P.x - e.x); lineHaz(e, e.aim, 190, 13, .7, e.atk * .6); if (bossPhase(e) === 2) { lineHaz(e, e.aim + .5, 160, 12, .9, e.atk * .6); lineHaz(e, e.aim - .5, 160, 12, .9, e.atk * .6); } return 2; },
    thorns: e => { ringShots(e, 10, 90, e.atk * .5, '#6aff6a', e.clock); sched(e, .9, () => ringShots(e, 10, 90, e.atk * .5, '#6aff6a', e.clock + .3)); return 2.2; }
  },
  castellan: {
    near: ph => ph === 1 ? ['combo', 'combo', 'quake'] : ['combo', 'quake', 'bash', 'combo'], far: ph => ph === 1 ? ['charge', 'volley'] : ['charge', 'volley', 'summon'],
    combo: (e, P) => { const w = bossPhase(e) === 2 ? .38 : .5; let t = meleeAtk(e, P, 36, 2.2, w, e.atk * .8, 130);
      for (let i = 1; i <= 2; i++) sched(e, (w + .35) * i, () => { e.aim = Math.atan2(G.P.y - e.y, G.P.x - e.x); e.kx = Math.cos(e.aim) * 120; e.ky = Math.sin(e.aim) * 120; e.tele = { type: 'cone', t: 0, T: w * .8, x: e.x, y: e.y - 4, r: 36, arc: 2.2, ang: e.aim }; sched(e, w * .8, () => { coneHit(e, 36, 2.2, e.atk * (i === 2 ? 1.1 : .8), 160); e.tele = null; }); });
      return t + 1.5; },
    quake: e => { e.tele = { type: 'circle', t: 0, T: .95, x: e.x, y: e.y, r: 54 }; SND.play('alert'); sched(e, .95, () => { e.tele = null; hz(e.x, e.y, 54, 0, e.atk * 1.0, { dur: .2 }); }); return 1.9; },
    bash: (e, P) => meleeAtk(e, P, 30, 1.4, .45, e.atk * .7, 320),
    charge: (e, P) => chargeAtk(e, P, .8, e.atk * 1.15, 300),
    volley: (e, P) => { const a = Math.atan2(P.y - e.y, P.x - e.x); SND.play('alert'); sched(e, .5, () => { for (let i = -2; i <= 2; i++) bshot(e, a + i * .2, 140, e.atk * .5, '#bcc4d8', { r: 3 }); SND.play('swing'); }); return 1.6; },
    summon: e => { if (e.summoned && G.enemies.filter(x => x.minion && !x.dead).length > 1) return meleeAtk(e, G.P, 36, 2.2, .5, e.atk * .8, 130); e.summoned = 1; spawnMinions(e, ['skeleton', 'skeleton'], 2); return 1.6; }
  },
  queen: {
    near: ph => ['sting', 'sting', 'burrow'], far: ph => ph === 1 ? ['spit', 'burrow', 'dash'] : ['spit', 'burrow', 'dash', 'brood'],
    sting: (e, P) => meleeAtk(e, P, 34, 1.9, .4, e.atk * .9, 160), dash: (e, P) => chargeAtk(e, P, .55, e.atk * 1.0, 320),
    spit: (e, P) => { const a = Math.atan2(P.y - e.y, P.x - e.x); e.aim = a; faceTo(e, a); SND.play('alert'); sched(e, .45, () => { for (let i = -1; i <= 1; i++) bshot(e, a + i * .26, 150, e.atk * .5, '#9aff3a', { r: 4 }); SND.play('swing'); }); return 1.4; },
    burrow: (e, P) => { e.invuln = true; e.hide = 1; SND.play('whirl'); const tx = P.x, ty = P.y; hz(tx, ty, 34, 1.3, e.atk * 1.0, { sfx: 'explosion' }); sched(e, 1.25, () => { e.x = tx; e.y = ty; e.hide = 0; e.invuln = false; G.spark(tx, ty, '#c8883a', 16, 90); }); return 2.2; },
    brood: e => { if (G.enemies.filter(x => x.minion && !x.dead).length < 3) spawnMinions(e, ['scorpion', 'scorpion'], 2); return 1.5; }
  },
  ice_guardian: {
    near: ph => ph === 1 ? ['smash', 'nova', 'smash'] : ['smash', 'nova', 'spikes'], far: ph => ph === 1 ? ['bolts', 'spikes'] : ['bolts', 'spikes', 'blizzard', 'bolts'],
    smash: (e, P) => meleeAtk(e, P, 44, 2.0, .9, e.atk * 1.0, 260),
    nova: e => { e.tele = { type: 'circle', t: 0, T: 1.1, x: e.x, y: e.y, r: 62 }; SND.play('ice'); sched(e, 1.1, () => { e.tele = null; hz(e.x, e.y, 62, 0, e.atk * .9, { dur: .2, sfx: 'ice' }); if (Math.hypot(G.P.x - e.x, G.P.y - e.y) < 62) G.P.slow = 2.5; }); return 2; },
    spikes: (e, P) => { hz(P.x, P.y, 30, .9, e.atk * .8, { sfx: 'ice' }); for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283 + e.clock; hz(P.x + Math.cos(a) * 46, P.y + Math.sin(a) * 46, 24, 1.1 + i * .1, e.atk * .7, { sfx: 'ice' }); } return 2.2; },
    bolts: (e, P) => { const a = Math.atan2(P.y - e.y, P.x - e.x); SND.play('ice'); sched(e, .6, () => { for (let i = -2; i <= 2; i++) bshot(e, a + i * .22, 120, e.atk * .5, '#8ad8ff', { slow: 1, r: 4 }); SND.play('ice'); }); return 1.7; },
    blizzard: e => { for (let i = 0; i < 7; i++) { const [x, y] = arenaPoint(e); hz(x, y, 28, .9 + i * .25, e.atk * .8, { sfx: 'ice' }); } hz(G.P.x, G.P.y, 28, 1.0, e.atk * .8, { sfx: 'ice' }); return 3.2; }
  },
  ash_king: {
    near: ph => ph === 1 ? ['swing', 'slam', 'swing'] : ph === 2 ? ['swing2', 'slam', 'burst'] : ['combo3', 'slam', 'beam'],
    far: ph => ph === 1 ? ['overhead', 'charge'] : ph === 2 ? ['burst', 'lava', 'charge', 'summon', 'overhead'] : ['beam', 'storm', 'nova', 'burst'],
    swing: (e, P) => meleeAtk(e, P, 50, 2.1, 1.0, e.atk * 1.0, 260),
    swing2: (e, P) => { const t = meleeAtk(e, P, 52, 2.2, .75, e.atk * 1.0, 240); sched(e, 1.0, () => { e.aim = Math.atan2(G.P.y - e.y, G.P.x - e.x); e.tele = { type: 'cone', t: 0, T: .55, x: e.x, y: e.y - 4, r: 52, arc: 2.4, ang: e.aim }; sched(e, .55, () => { coneHit(e, 52, 2.4, e.atk * 1.1, 260); e.tele = null; }); }); return t + 1.1; },
    slam: e => { e.tele = { type: 'circle', t: 0, T: 1.1, x: e.x, y: e.y, r: 56 }; SND.play('alert'); sched(e, 1.1, () => { e.tele = null; hz(e.x, e.y, 56, 0, e.atk * 1.1, { dur: .2 }); G.addShake(5); }); return 2; },
    overhead: (e, P) => { hz(P.x, P.y, 36, .95, e.atk * 1.0); return 1.8; },
    charge: (e, P) => chargeAtk(e, P, .9, e.atk * 1.2, 280),
    burst: (e, P) => { for (let i = 0; i < 4; i++) { const a = i / 4 * 6.283 + e.clock; hz(P.x + Math.cos(a) * 34, P.y + Math.sin(a) * 34, 28, .8 + i * .22, e.atk * .8); } hz(P.x, P.y, 28, .7, e.atk * .8); return 2.4; },
    lava: e => { for (let i = 0; i < 4; i++) { const [x, y] = arenaPoint(e); hz(x, y, 26, 1.2 + i * .15, e.atk * .35, { dur: 12, once: false, burst: 0, col: 'rgba(255,70,20,.55)' }); } return 1.8; },
    summon: e => { if (G.enemies.filter(x => x.minion && !x.dead && x.t !== 'ashcrystal').length < 3) spawnMinions(e, ['minion_w', 'minion_a', 'minion_w'], 3); return 2; },
    combo3: (e, P) => { let t = meleeAtk(e, P, 54, 2.2, .6, e.atk * .9, 200); for (let i = 1; i <= 2; i++) sched(e, (.6 + .3) * i, () => { e.aim = Math.atan2(G.P.y - e.y, G.P.x - e.x); e.kx = Math.cos(e.aim) * 140; e.ky = Math.sin(e.aim) * 140; e.tele = { type: 'cone', t: 0, T: .5, x: e.x, y: e.y - 4, r: 54, arc: 2.2, ang: e.aim }; sched(e, .5, () => { coneHit(e, 54, 2.2, e.atk * (i === 2 ? 1.25 : .9), 220); e.tele = null; if (i === 2) hz(e.x, e.y, 60, 0, e.atk * .8, { dur: .2 }); }); }); return 3.2; },
    beam: (e, P) => { const a = Math.atan2(P.y - e.y, P.x - e.x); e.aim = a; faceTo(e, a); [0, .75, -.75].forEach((o, i) => lineHaz(e, a + o, 230, 14, 1.0 + i * .25, e.atk * .8)); return 3; },
    storm: e => { ringShots(e, 12, 100, e.atk * .5, '#ff4a5a', e.clock); sched(e, .8, () => ringShots(e, 12, 100, e.atk * .5, '#ff4a5a', e.clock + .26)); sched(e, 1.6, () => ringShots(e, 12, 100, e.atk * .5, '#ff7a5a', e.clock + .5)); return 3; },
    nova: e => { e.tele = { type: 'circle', t: 0, T: 1.2, x: e.x, y: e.y, r: 84 }; SND.play('boss_phase'); sched(e, 1.2, () => { e.tele = null; hz(e.x, e.y, 84, 0, e.atk * 1.0, { dur: .25 }); G.addShake(6); ringShots(e, 16, 110, e.atk * .45, '#ff5a3a', 0); }); return 2.4; }
  }
};

// ----- финальная механика Короля: «Пепельный суд» -----
function startJudgement(e) {
  e.shielded = 1; e.invuln = true; e.judge = 10; e.tele = null; e.st = 'judge'; G.hazards.length = 0; SND.play('boss_roar'); G.flashT = .5; G.addShake(6);
  UI.toast('Валдрис: «Источник зовёт!»\nРазбей пепельные кристаллы, пока не прозвучит приговор!', 'gold');
  for (let i = 0; i < 3; i++) { const [x, y] = [e.area[0] + 40 + i * (e.area[2] - e.area[0] - 80) / 2, e.area[1] + 36 + (i === 1 ? 0 : 60)]; const c = spawnEnemy('ashcrystal', x, y); c.st = 'idle'; c.minion = true; c.hp = c.mhp = 90; }
}
function judgementTick(e, dt) {
  const left = G.enemies.filter(x => x.t === 'ashcrystal' && !x.dead).length; e.judge -= dt; e.jmax = 10;
  if (left === 0) { e.shielded = 0; e.invuln = false; e.st = 'rec'; e.stT = 4; e.stunned = 1; e.judged = 1; G.flashT = .3; SND.play('boss_phase'); UI.toast('Щит пепла разрушен!\nКороль уязвим, бей!', 'gold'); e.vuln = 4; return; }
  if (e.judge <= 0) {
    G.addShake(9); G.flashT = .8; SND.play('nova'); hurtPlayer(Math.round(stats().maxhp * .65), null, 0, 0, 'judge'); e.hp = Math.min(e.mhp, e.hp + e.mhp * .04); e.judge = 10;
    G.addFloat(e.x, e.y - 40, 'Пепельный суд', '#ff4a5a', true);
    G.enemies.filter(x => x.t === 'ashcrystal' && !x.dead).forEach(c => { c.hp = c.mhp; });
  }
}

function updateBossLogic(dt) {
  const e = G.boss; if (!e) return; if (e.dead) { G.boss = null; return; }
  const P = G.P, a = e.area; e.clock += dt; e.fr = (e.fr + dt * 2) % 2; e.cd -= dt; e.vuln = Math.max(0, (e.vuln || 0) - dt);
  for (let i = e.sch.length - 1; i >= 0; i--) if (e.sch[i][0] <= e.clock) { const f = e.sch[i][1]; e.sch.splice(i, 1); f(); }
  if (e.tele) e.tele.t += dt;
  if (e.st === 'intro') return;
  // побег игрока: сброс
  const out = P.x < a[0] - 40 || P.x > a[2] + 40 || P.y < a[1] - 40 || P.y > a[3] + 40; e.away = out ? e.away + dt : 0;
  if (e.away > 6) { e.dead = .65; G.boss = null; G.hazards = []; G.enemies = G.enemies.filter(x => !x.minion); SND.music(REGIONS[G.map.reg].music); G.toast('Босс потерял тебя из виду'); return; }
  // фазы
  const ph = bossPhase(e);
  if (ph !== e.phase) {
    e.phase = ph; SND.play('boss_phase'); G.addShake(7); G.flashT = .4; e.sch.length = 0; e.tele = null; e.invuln = true; e.st = 'rec'; e.stT = 1.6; e.bdash = null; G.hazards.length = 0; e.hide = 0;
    sched(e, 1.6, () => { if (!e.shielded) e.invuln = false; });
    UI.toast(e.bid === 'ash_king' ? (ph === 2 ? 'Валдрис: «Пепел пробуждается...»\nФаза II' : 'Валдрис: «Источник не отпускает!»\nФаза III') : BOSSES[e.bid].n + ' в ярости!', 'gold');
    if (e.bid === 'ash_king' && ph === 2) { sched(e, 1.2, () => spawnMinions(e, ['minion_w', 'minion_a'], 2)); }
  }
  if (e.bid === 'ash_king' && !e.judged && !e.shielded && e.hp / e.mhp < .12 && e.st !== 'intro') startJudgement(e);
  if (e.st === 'judge') { judgementTick(e, dt); faceTo(e, Math.atan2(P.y - e.y, P.x - e.x)); return; }
  // рывок
  if (e.bdash) {
    const d = e.bdash; d.t -= dt; moveBody(e, d.vx * dt, d.vy * dt, e.rc); if (!d.hit && Math.hypot(P.x - e.x, P.y - e.y) < e.rc + 8) { d.hit = 1; hurtPlayer(d.dmg, e, d.vx * .5, d.vy * .5); }
    if (d.t <= 0 || e.bump) { e.bdash = null; e.st = 'rec'; e.stT = Math.max(e.stT || 0, .7); }
    G.parts.push({ x: e.x, y: e.y, vx: 0, vy: -6, life: .3, t: 0, col: '#999', sz: 2 });
  }
  if (e.kx || e.ky) { moveBody(e, e.kx * dt, e.ky * dt, e.rc); e.kx *= Math.pow(.01, dt); e.ky *= Math.pow(.01, dt); }
  e.x = clamp(e.x, a[0] + 10, a[2] - 10); e.y = clamp(e.y, a[1] + 14, a[3] - 6);
  const dd = Math.hypot(P.x - e.x, P.y - e.y), ang = Math.atan2(P.y - e.y, P.x - e.x), spd = e.spd * (ph >= 2 ? 1.25 : 1) * (e.bid === 'ash_king' && ph === 3 ? 1.1 : 1);
  if (e.st === 'rec') { e.stT -= dt; if (e.stT <= 0 && !e.sch.length && !e.bdash) { e.st = 'idle'; e.stunned = 0; e.cd = Math.max(e.cd, rnd(.35, .9) / (ph >= 2 ? 1.3 : 1)); } return; }
  if (e.st === 'idle') {
    if (!e.tele) faceTo(e, ang);
    if (dd > 46 && !P.dead) { const o = e.bump ? .9 : 0; const dx = Math.cos(ang + o) * spd * dt, dy = Math.sin(ang + o) * spd * dt; moveBody(e, dx, dy, e.rc); }
    if (e.cd <= 0 && !P.dead) {
      const set = BA[e.bid], pool = dd < 74 ? set.near(ph) : set.far(ph), name = pool[Math.floor(Math.random() * pool.length)]; e.last = name;
      const dur = set[name](e, P); e.st = 'rec'; e.stT = dur; e.cd = 0;
    }
  }
}
function bossDefeated(e) {
  const b = BOSSES[e.bid]; e.dead = .001; G.boss = null; S.flags['bossdone_' + e.bid] = 1; G.hazards = []; G.projs = [];
  G.enemies.forEach(x => { if (x.minion && !x.dead) { x.dead = .001; } }); SND.play('boss_roar'); G.addShake(8); G.flashT = .6; G.hitstop = .3;
  for (let i = 0; i < 40; i++) { const an = rnd(0, 6.28), s = rnd(30, 140); G.parts.push({ x: e.x, y: e.y - 10, vx: Math.cos(an) * s, vy: Math.sin(an) * s, life: rnd(.5, 1.4), t: 0, col: i % 2 ? '#fff' : '#ffd24a', sz: 2 }); }
  gainXP(b.xp); const g = rint(b.gold[0], b.gold[1]); S.p.gold += g; (b.drops || []).forEach(([id, n]) => giveReward(id, typeof n === 'number' && n > 0 ? 1 : 1));
  QP('boss', e.bid, 1); UI.bossVictory(b.n, b.xp, g, (b.drops || []).map(d => ITEMS[d[0]].n));
  SND.music('m_victory'); const after = () => SND.music(REGIONS[G.map.reg].music);
  setTimeout(() => {
    if (e.bid === 'ash_king') return G.say(kingEndScene());
    G.say(BOSS_OUTRO[e.bid] || [], after); if (!(BOSS_OUTRO[e.bid] || []).length) after();
  }, 2600);
}

// ----- финал и концовки -----
function kingEndScene() {
  return [['Валдрис', '(опускаясь на колени) Достаточно... Пепел отпускает меня. Ты не убил меня, Арион, ты дал мне закончить.'],
    ['Валдрис', 'Источник перед тобой. Три печати способны закрыть его навсегда. Можно взять его силу себе. А можно рассказать миру правду о войне.'],
    ['Валдрис', 'Что бы ты ни выбрал, это будет твоя история.'], { choices: endChoices() }];
}
function endChoices() {
  const seals = ['seal_forest', 'seal_fort', 'seal_winter'].every(i => countItem(i) > 0);
  return [
    ['Запечатать Источник тремя печатями', () => seals ? [['Арион', 'Я закрою его. Пусть мир обойдётся без чудес.'], { fn: () => { setTimeout(() => G.finishGame('seal'), 600); } }] : [['', 'Печатей не хватает. Вернись, когда соберёшь все три.'], { choices: endChoices() }]],
    ['Принять силу Источника', () => [['Арион', 'Если сила нужна миру, пусть она будет в руках того, кто знает её цену.'], { fn: () => { setTimeout(() => G.finishGame('power'), 600); } }]],
    [F('truth_known') ? 'Рассказать правду о войне' : '(Правда о войне: собери все хроники)', () => F('truth_known') ? [['Арион', 'Мир должен узнать, кто начал эту войну.'], { fn: () => { setTimeout(() => G.finishGame('truth'), 600); } }] : [['Валдрис', 'Ты ещё не знаешь всей правды. Хроники войны разбросаны по миру, найди их.'], { choices: endChoices() }]]
  ];
}
G.finishGame = function (key) {
  S.ending = key; S.flags.game_complete = 1; saveGame(0, true); G.mode = 'ending'; SND.music('m_victory'); UI.ending(ENDINGS[key], key);
};
