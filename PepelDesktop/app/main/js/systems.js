'use strict';
// ---------- Системы: книги заклинаний, таланты, зачарования, крафт, башни ----------
ELCOL.holy = '#fff4b0';
const SCHOOLS = { fire: { n: 'Огонь', col: '#ff8a2a' }, storm: { n: 'Буря', col: '#ffee6a' }, frost: { n: 'Мороз', col: '#8ad8ff' }, holy: { n: 'Свет', col: '#fff0a0' }, ash: { n: 'Пепел', col: '#ff5a4a' } };
// новые заклинания
Object.assign(SKILLS, {
  firewall: { n: 'Огненная стена', kind: 'Магический', unlock: 1, mp: 20, cd: 7, d: 'Стена огня горит несколько секунд и жжёт всех, кто в неё войдёт.', ic: 'sk_firewall', col: '#ff8a2a' },
  tempest: { n: 'Грозовой шторм', kind: 'Магический', unlock: 1, mp: 34, cd: 12, d: 'Серия молний бьёт по области вокруг цели.', ic: 'sk_tempest', col: '#ffee6a' },
  blizzard: { n: 'Метель', kind: 'Магический', unlock: 1, mp: 32, cd: 11, d: 'Зона мороза: замедляет и ранит врагов в течение 4 секунд.', ic: 'sk_blizzard', col: '#8ad8ff' },
  smite: { n: 'Кара небес', kind: 'Магический', unlock: 1, mp: 22, cd: 4, d: 'Столп света по ближайшему врагу. Часть урона лечит вас.', ic: 'sk_smite', col: '#fff0a0' },
  drain: { n: 'Похищение жизни', kind: 'Магический', unlock: 1, mp: 15, cd: 3, d: 'Луч пепла отнимает здоровье врага и возвращает вам половину.', ic: 'sk_drain', col: '#c04a8a' }
});
Object.keys(SKILLS).forEach(k => { SKILLS[k].id = k; if (k !== 'strike' && k !== 'dodge') SKILLS[k].unlock = 1; });
// ---- книги ----
const BOOKDEF = {
  fire: { names: ['Фолиант искр', 'Фолиант пламени', 'Книга преисподней'], spells: ['fire', 'firewall', 'nova'], plus: 'meteor' },
  storm: { names: ['Книга ряби', 'Книга бури', 'Скрижали грозы'], spells: ['bolt', 'whirl', 'shield'], plus: 'tempest' },
  frost: { names: ['Книга инея', 'Книга метели', 'Манускрипт вечной зимы'], spells: ['frost', 'shield', 'heal'], plus: 'blizzard' },
  holy: { names: ['Молитвенник', 'Книга рассвета', 'Скрижали заката'], spells: ['heal', 'smite', 'shield'], plus: 'nova' },
  ash: { names: ['Пепельный свиток', 'Книга углей', 'Заветы Пепла'], spells: ['drain', 'nova', 'shield'], plus: 'meteor' }
};
const TIER = { lvl: [1, 8, 14], price: [150, 700, 2200], mul: [1, 1.3, 1.7] };
Object.keys(BOOKDEF).forEach(sc => BOOKDEF[sc].names.forEach((nm, i) => {
  const b = BOOKDEF[sc], id = 'tome_' + sc + (i + 1);
  ITEMS[id] = { id, n: nm, t: 'book', ic: 'tome', col: SCHOOLS[sc].col, school: sc, tier: i + 1, lvl: TIER.lvl[i], price: i === 0 && sc === 'fire' ? 0 : TIER.price[i], int: i * 2, rare: i > 0, spells: b.spells, plus: b.plus,
    d: 'Школа: ' + SCHOOLS[sc].n + '. Сила магии ×' + TIER.mul[i] + '. Заклинания: ' + b.spells.map(s => SKILLS[s].n).join(', ') + '. Усиленное (нужен посох школы «' + SCHOOLS[sc].n + '»): ' + SKILLS[b.plus].n + '. Требуется уровень ' + TIER.lvl[i] + '.' };
}));
Object.assign(ITEMS.staff_novice, { school: 'holy' }); ITEMS.staff_arcane.school = 'all'; ITEMS.staff_fire.school = 'fire'; ITEMS.staff_storm.school = 'storm'; ITEMS.wand_spark.school = 'storm'; ITEMS.staff_frost.school = 'frost'; ITEMS.staff_ash.school = 'ash';
ITEMS.staff_holy = { id: 'staff_holy', n: 'Посох рассвета', t: 'weapon', wt: 'staff', ic: 'staff', col: '#fff0a0', price: 520, atk: 12, int: 7, school: 'holy', d: 'Усиливает магию Света. +7 к интеллекту.' };
Object.keys(ITEMS).forEach(k => { const d = ITEMS[k]; if (d.wt === 'staff' && d.school && !/Школа/.test(d.d)) d.d += ' Школа: ' + (SCHOOLS[d.school] ? SCHOOLS[d.school].n : 'любая') + ' — усиливает книги этой школы и открывает их усиленное заклинание.'; });
ITEMS.essence = { id: 'essence', n: 'Эссенция', t: 'mat', ic: 'essence', col: '#c8a0ff', price: 90, d: 'Сгусток магии. Нужен для зачарований.' };
const curBook = () => { const b = S && S.eq && S.eq.book; return b ? ITEMS[b.id] : null; };
const curStaff = () => { const w = S && S.eq && S.eq.weapon, d = w && ITEMS[w.id]; return d && d.wt === 'staff' ? d : null; };
const staffMatches = () => { const b = curBook(), s = curStaff(); return !!(b && s && (s.school === b.school || s.school === 'all')); };
const talent = id => (S && S.p && S.p.tal && S.p.tal[id]) || 0;
function spellMul() { const b = curBook(); let m = 1; if (b) m *= TIER.mul[b.tier - 1]; if (staffMatches()) m *= 1.3; return m * (1 + talent('arcana') * .1); }
function refreshHotbar() {
  if (!S || !S.eq) return;
  if (!S.eq.book && !S.inv.some(i => ITEMS[i.id] && ITEMS[i.id].t === 'book')) S.eq.book = { id: 'tome_fire1' };
  const b = curBook(), ids = b ? b.spells.slice() : ['whirl']; if (b && staffMatches()) ids.push(b.plus);
  const k = ids.join(); if (refreshHotbar.k === k) return; refreshHotbar.k = k; HOTBAR.length = 0; ids.forEach(i => HOTBAR.push(i));
}
const _mp1 = magicPow; magicPow = function (st) { return _mp1(st) * spellMul(); };
// надевание книг: проверка уровня
const _eq1 = equipIdx;
equipIdx = function (idx) { const it = S.inv[idx], d = it && ITEMS[it.id]; if (d && d.lvl && S.p.lvl < d.lvl) return G.toast('Нужен уровень ' + d.lvl); _eq1(idx); refreshHotbar.k = null; refreshHotbar(); };
const _un1 = unequip; unequip = function (slot) { _un1(slot); refreshHotbar.k = null; refreshHotbar(); };
// ---- таланты ----
const TAL = {
  brute: { n: 'Мощь', d: '+8% к урону оружия за ранг' }, guard: { n: 'Каменная кожа', d: '+4 к защите за ранг' }, vit: { n: 'Живучесть', d: '+30 к здоровью за ранг' },
  swift: { n: 'Проворство', d: '+4% к скорости за ранг' }, arcana: { n: 'Сила мысли', d: '+10% к силе заклинаний за ранг' }, focus: { n: 'Концентрация', d: '−8% перезарядки заклинаний за ранг' },
  regen: { n: 'Медитация', d: '+1.2 маны в секунду за ранг' }, leech: { n: 'Жажда крови', d: '+2% вампиризма за ранг' }, marksman: { n: 'Меткость', d: 'Лук и кинжал: +10% урона и +2% крита за ранг' },
  berserk: { n: 'Берсерк', d: '+12% урона, пока здоровье ниже 40%, за ранг' }, lucky: { n: 'Удачливый', d: '+20% золота за ранг' }, smith: { n: 'Мастер-кузнец', d: '−10% цен крафта и улучшений за ранг' }
};
const talSpent = () => Object.values((S.p.tal) || {}).reduce((a, b) => a + b, 0);
const talLeft = () => Math.max(0, S.p.lvl - 1 - talSpent());
function addTalent(id) { if (!atTower()) return G.toast('Очки можно тратить только у башни сохранения'); S.p.tal = S.p.tal || {}; if (talLeft() <= 0 || (S.p.tal[id] || 0) >= 3) return; S.p.tal[id] = (S.p.tal[id] || 0) + 1; SND.play('click'); clampVitals(); }
// ---- зачарования ----
const ENCH = {
  sharp: { n: 'Острота', slots: ['weapon'], d: l => '+' + 8 * l + '% к атаке' }, flame: { n: 'Пламя', slots: ['weapon'], d: l => 'Огонь, +' + 3 * l + ' к атаке' }, frost: { n: 'Иней', slots: ['weapon'], d: l => 'Лёд, +' + 3 * l + ' к атаке' },
  storm: { n: 'Молния', slots: ['weapon'], d: l => 'Молния, +' + 3 * l + ' к атаке' }, vamp: { n: 'Вампиризм', slots: ['weapon'], d: l => l * 3 + '% урона лечит вас' }, crit: { n: 'Меткость', slots: ['weapon', 'acc'], d: l => '+' + 3 * l + '% шанс крита' },
  fort: { n: 'Стойкость', slots: ['armor', 'helm'], d: l => '+' + 3 * l + ' защиты' }, vital: { n: 'Жизнь', slots: ['armor', 'helm', 'acc'], d: l => '+' + 25 * l + ' здоровья' }, thorn: { n: 'Шипы', slots: ['armor'], d: l => 'Возвращает ' + 25 * l + '% урона атакующему' },
  evade: { n: 'Ловкость', slots: ['armor', 'helm', 'acc'], d: l => '+' + 2 * l + '% уклонения' }, mind: { n: 'Разум', slots: ['book', 'helm', 'acc'], d: l => '+' + 15 * l + ' маны, +' + 5 * l + '% силы магии' }
};
const enchCost = l => ({ gold: 80 * l * l + 60, ess: l + 1 });
const _st2 = stats;
stats = function () {
  const s = _st2(), P = G.P; s.ls = 0; s.thorn = 0; s.cdr = 0; s.mpr = 0; s.luck = 0; s.smith = 0; let atkM = 1;
  Object.values(S.eq).forEach(it => {
    if (!it || !it.en) return; const l = it.en.l, k = it.en.k;
    if (k === 'sharp') atkM += .08 * l; else if (k === 'flame') { s.elem = 'fire'; s.atk += 3 * l; } else if (k === 'frost') { s.elem = 'ice'; s.atk += 3 * l; } else if (k === 'storm') { s.elem = 'lightning'; s.atk += 3 * l; }
    else if (k === 'vamp') s.ls += .03 * l; else if (k === 'crit') s.crit += .03 * l; else if (k === 'fort') s.def += 3 * l; else if (k === 'vital') s.maxhp += 25 * l; else if (k === 'thorn') s.thorn += .25 * l;
    else if (k === 'evade') s.dodge = Math.min(.4, s.dodge + .02 * l); else if (k === 'mind') { s.maxmp += 15 * l; s.spm = (s.spm || 0) + .05 * l; }
  });
  const T_ = k => talent(k); atkM += .08 * T_('brute'); if (s.wt === 'bow' || s.wt === 'dagger') { atkM += .1 * T_('marksman'); s.crit += .02 * T_('marksman'); }
  if (S.p.hp < s.maxhp * .4) atkM += .12 * T_('berserk');
  s.atk = Math.round(s.atk * atkM); s.def += 4 * T_('guard'); s.maxhp += 30 * T_('vit'); s.spd *= 1 + .04 * T_('swift'); s.ls += .02 * T_('leech'); s.cdr = .08 * T_('focus'); s.mpr = 1.2 * T_('regen'); s.luck = T_('lucky'); s.smith = T_('smith');
  s.crit = Math.min(.6, s.crit); return s;
};
const _de2 = damageEnemy;
damageEnemy = function (e, raw, o) {
  const d = _de2(e, raw, o); if (d > 0 && !(o && o.noLS)) { const st = stats(); if (st.ls > 0) { const h = Math.max(1, Math.round(d * st.ls)); S.p.hp = Math.min(st.maxhp, S.p.hp + h); if (Math.random() < .4) G.addFloat(G.P.x, G.P.y - 24, '+' + h, '#c04a8a'); } } return d;
};
const _hp2 = hurtPlayer;
hurtPlayer = function (raw, src, kx, ky, kind) {
  const hp0 = S.p.hp, r = _hp2(raw, src, kx, ky, kind);
  if (r && src && src.hp > 0 && !src.dead && src.d && !kind) { const th = stats().thorn; if (th > 0) damageEnemy(src, Math.max(1, (hp0 - S.p.hp) * th), { magic: 1, noLS: 1 }); }
  return r;
};
const _da2 = dropAt; dropAt = function (x, y, id, n) { if (!id && n > 0) n = Math.round(n * (1 + .2 * talent('lucky'))); return _da2(x, y, id, n); };
const _ke2 = killEnemy;
killEnemy = function (e) { const was = e.dead; _ke2(e); if (!was && e.elite && !e.boss && Math.random() < .7) dropAt(e.x, e.y, 'essence', 1); else if (!was && !e.boss && !e.minion && Math.random() < .03) dropAt(e.x, e.y, 'essence', 1); };
// сложность: только в мире, перки учтены в stats
// ---- башни: только там можно тратить очки ----
function atTower() { if (!G.map || !G.P) return false; return G.map.things.some(t => t.t === 'save' && Math.hypot(G.P.x - (t.x * TS + 8), G.P.y - (t.y * TS + 8)) < 44); }
const _as = allocStat; allocStat = function (k) { if (S.p.pts > 0 && !atTower()) return G.toast('Очки можно тратить только у башни сохранения'); _as(k); };
const _us = upgradeSkill; upgradeSkill = function (id) { if (S.p.spts > 0 && !atTower()) return G.toast('Очки можно тратить только у башни сохранения'); _us(id); };
// ---- новые заклинания и зоны ----
G.zones = []; G.strikes = [];
const _cast2 = castSkill;
function aimPoint(aim, maxd) { const P = G.P; let tx, ty; if (MOUSE.used && G.t - (MOUSE.t || 0) < 3) { tx = MOUSE.x + G.cam.x; ty = MOUSE.y + G.cam.y; } else { tx = P.x + Math.cos(aim) * 80; ty = P.y + Math.sin(aim) * 80; } const d = Math.hypot(tx - P.x, ty - P.y); if (d > maxd) { tx = P.x + (tx - P.x) / d * maxd; ty = P.y + (ty - P.y) / d * maxd; } return [tx, ty]; }
castSkill = function (id, aim, st) {
  if (!['firewall', 'tempest', 'blizzard', 'smite', 'drain'].includes(id)) { const m0 = S.p.mp, c0 = G.P.cd[id] || 0; _cast2(id, aim, st); const P = G.P; if (st.cdr && P.cd[id] > c0) P.cd[id] *= 1 - st.cdr; return; }
  const P = G.P, sk = SKILLS[id], p = S.p; if (!sk || P.dead || G.busy) return;
  if ((P.cd[id] || 0) > 0) return; if (p.mp < sk.mp) { G.addFloat(P.x, P.y - 24, 'Мало маны', '#6a9aff'); return; }
  const m = skMul(id), mp = magicPow(st), cd = sk.cd * (1 - Math.min(.3, (skLv(id) - 1) * .06)) * (1 - (st.cdr || 0));
  const near = (rad) => { let b = null, bs = 1e9; G.enemies.forEach(e => { if (e.dead || e.spawning) return; const d = Math.hypot(e.x - P.x, e.y - P.y); if (d > rad || !los(P.x, P.y - 5, e.x, e.y - 5)) return; const sc = d + Math.abs(angDiff(Math.atan2(e.y - P.y, e.x - P.x), aim)) * 60; if (sc < bs) { bs = sc; b = e; } }); return b; };
  if (id === 'firewall') {
    p.mp -= sk.mp; P.cd[id] = cd; P.castT = 1; P.face = aim; P.atkCd = .3; SND.play('fireball');
    const [tx, ty] = aimPoint(aim, 70), px = -Math.sin(aim), py = Math.cos(aim);
    for (let i = -3; i <= 3; i++) G.zones.push({ x: tx + px * i * 14, y: ty + py * i * 14, r: 12, t: 0, dur: 4.5, tick: .4, tk: .1, dmg: mp * .55 * m, el: 'fire', col: '#ff7a2a', mid: G.mid });
  } else if (id === 'blizzard') {
    p.mp -= sk.mp; P.cd[id] = cd; P.castT = 1; P.atkCd = .35; SND.play('ice'); const [tx, ty] = aimPoint(aim, 110);
    G.zones.push({ x: tx, y: ty, r: 46, t: 0, dur: 4.5, tick: .5, tk: .1, dmg: mp * .5 * m, el: 'ice', col: '#cfeaff', mid: G.mid });
  } else if (id === 'tempest') {
    p.mp -= sk.mp; P.cd[id] = cd; P.castT = 1; P.atkCd = .35; SND.play('nova'); const [tx, ty] = aimPoint(aim, 120);
    for (let i = 0; i < 8; i++) G.strikes.push({ x: tx + rnd(-48, 48), y: ty + rnd(-40, 40), t: .25 + i * .22, dmg: mp * 1.25 * m, mid: G.mid });
  } else if (id === 'smite') {
    const e = near(140); if (!e) { G.addFloat(P.x, P.y - 24, 'Нет цели', '#aaa'); return; }
    p.mp -= sk.mp; P.cd[id] = cd; P.castT = 1; P.face = aim; P.atkCd = .3; SND.play('nova');
    for (let i = 0; i < 14; i++) G.parts.push({ x: e.x + rnd(-3, 3), y: e.y - 40 + i * 3.5, vx: 0, vy: 0, life: .35, t: 0, col: i % 2 ? '#fff4b0' : '#fff', sz: 2 });
    const d = damageEnemy(e, mp * 3 * m, { el: 'holy', magic: 1, kb: 80, kang: Math.atan2(e.y - P.y, e.x - P.x), stun: .3, noLS: 1 }); const h = Math.round(d * .15); S.p.hp = Math.min(st.maxhp, S.p.hp + h); G.addFloat(P.x, P.y - 24, '+' + h, '#6aff6a'); G.addShake(2.5);
  } else if (id === 'drain') {
    const e = near(130); if (!e) { G.addFloat(P.x, P.y - 24, 'Нет цели', '#aaa'); return; }
    p.mp -= sk.mp; P.cd[id] = cd; P.castT = 1; P.face = aim; P.atkCd = .25; SND.play('whirl');
    for (let i = 0; i <= 14; i++) { const k = i / 14; G.parts.push({ x: P.x + (e.x - P.x) * k + rnd(-2, 2), y: P.y - 6 + (e.y - 6 - P.y + 6) * k + rnd(-2, 2), vx: (P.x - e.x) * .6, vy: (P.y - e.y) * .6, life: .35, t: 0, col: i % 2 ? '#c04a8a' : '#ff5a8a', sz: 2 }); }
    const d = damageEnemy(e, mp * 1.7 * m, { el: 'ash', magic: 1, noLS: 1 }); const h = Math.round(d * .5); S.p.hp = Math.min(st.maxhp, S.p.hp + h); G.addFloat(P.x, P.y - 24, '+' + h, '#c04a8a', true);
  }
};
const _up2 = updatePlayer;
updatePlayer = function (dt) {
  refreshHotbar(); _up2(dt); const P = G.P; if (!P) return; const st = stats();
  if (st.mpr) S.p.mp = Math.min(st.maxmp, S.p.mp + st.mpr * dt); if (st.cdr) for (const k in P.cd) if (P.cd[k] > 0) P.cd[k] -= dt * st.cdr;
  for (let i = G.zones.length - 1; i >= 0; i--) {
    const z = G.zones[i]; if (z.mid !== G.mid || (z.t += dt) > z.dur) { G.zones.splice(i, 1); continue; }
    if (Math.random() < .6) G.parts.push({ x: z.x + rnd(-z.r, z.r), y: z.y + rnd(-z.r * .6, z.r * .6), vx: rnd(-6, 6), vy: z.el === 'fire' ? rnd(-40, -20) : rnd(10, 30), life: .4, t: 0, col: z.col, sz: 2 });
    if ((z.tk -= dt) <= 0) { z.tk = z.tick; G.enemies.forEach(e => { if (!e.dead && Math.hypot(e.x - z.x, e.y - z.y) < z.r + (e.boss ? 8 : e.d.sz)) damageEnemy(e, z.dmg, { el: z.el, magic: 1, noLS: 1 }); }); }
  }
  for (let i = G.strikes.length - 1; i >= 0; i--) {
    const q = G.strikes[i]; if (q.mid !== G.mid) { G.strikes.splice(i, 1); continue; } q.t -= dt;
    if (q.t > 0) { if (q.t < .2) G.parts.push({ x: q.x + rnd(-2, 2), y: q.y, vx: 0, vy: 0, life: .1, t: 0, col: '#ffee6a', sz: 2 }); continue; }
    G.strikes.splice(i, 1); SND.play('hit'); G.addShake(1.5); for (let j = 0; j < 12; j++) G.parts.push({ x: q.x + rnd(-2, 2), y: q.y - j * 4, vx: 0, vy: 0, life: .25, t: 0, col: j % 2 ? '#ffee6a' : '#fff', sz: 2 });
    G.enemies.forEach(e => { if (!e.dead && Math.hypot(e.x - q.x, e.y - q.y) < 18 + (e.boss ? 8 : e.d.sz)) damageEnemy(e, q.dmg, { el: 'lightning', magic: 1, noLS: 1, stun: .2 }); });
  }
};
// ---- крафт ----
const RECIPES = [
  { st: 'forge', out: 'sword_steel', mats: [['ore', 8]], gold: 150 }, { st: 'forge', out: 'axe_battle', mats: [['ore', 6], ['pelt', 2]], gold: 120 }, { st: 'forge', out: 'spear_iron', mats: [['ore', 5], ['pelt', 1]], gold: 90 },
  { st: 'forge', out: 'hammer_war', mats: [['ore', 8], ['pelt', 2]], gold: 180 }, { st: 'forge', out: 'dag_stiletto', mats: [['ore', 4], ['silk', 1]], gold: 80 }, { st: 'forge', out: 'armor_chain', mats: [['ore', 10], ['pelt', 2]], gold: 200 },
  { st: 'forge', out: 'helm_iron', mats: [['ore', 5]], gold: 70 }, { st: 'forge', out: 'helm_horned', mats: [['ore', 6], ['pelt', 2]], gold: 110 }, { st: 'forge', out: 'armor_scale', mats: [['scale', 8], ['ore', 4]], gold: 300 },
  { st: 'forge', out: 'spear_halberd', mats: [['ore', 10], ['scale', 3]], gold: 260 }, { st: 'forge', out: 'axe_frost', mats: [['crystal', 6], ['ore', 8]], gold: 500 }, { st: 'forge', out: 'spear_ice', mats: [['crystal', 5], ['ore', 6]], gold: 450 },
  { st: 'forge', out: 'armor_frost', mats: [['crystal', 8], ['pelt', 6]], gold: 600 }, { st: 'forge', out: 'axe_ash', mats: [['ash_shard', 6], ['ore', 10]], gold: 800 }, { st: 'forge', out: 'hammer_ash', mats: [['ash_shard', 8], ['ore', 12]], gold: 900 },
  { st: 'forge', out: 'sword_ash', mats: [['ash_shard', 8], ['ore', 10], ['essence', 2]], gold: 1000 }, { st: 'forge', out: 'armor_ash', mats: [['ash_shard', 10], ['ore', 10], ['pelt', 4]], gold: 1100 },
  { st: 'tailor', out: 'bag1', mats: [['pelt', 6], ['silk', 2]], gold: 60 }, { st: 'tailor', out: 'bag2', mats: [['pelt', 10], ['silk', 6], ['scale', 2]], gold: 200 }, { st: 'tailor', out: 'bag3', mats: [['pelt', 14], ['silk', 10], ['crystal', 4]], gold: 600 },
  { st: 'tailor', out: 'bow_long', mats: [['pelt', 3], ['silk', 4]], gold: 120 }, { st: 'tailor', out: 'bow_elven', mats: [['silk', 8], ['herb', 4]], gold: 260 }, { st: 'tailor', out: 'bow_frost', mats: [['crystal', 4], ['silk', 6]], gold: 520 },
  { st: 'tailor', out: 'armor_ranger', mats: [['pelt', 8], ['silk', 2]], gold: 180 }, { st: 'tailor', out: 'armor_leather', mats: [['pelt', 5]], gold: 60 }, { st: 'tailor', out: 'robe_apprentice', mats: [['silk', 6]], gold: 100 },
  { st: 'tailor', out: 'robe_arcane', mats: [['silk', 12], ['crystal', 3]], gold: 400 }, { st: 'tailor', out: 'hood_mage', mats: [['silk', 4]], gold: 90 },
  { st: 'alch', out: 'potion_hp', mats: [['herb', 2]], gold: 5 }, { st: 'alch', out: 'potion_hp2', mats: [['herb', 4], ['ore', 1]], gold: 20 }, { st: 'alch', out: 'potion_mp', mats: [['herb', 2]], gold: 5 }, { st: 'alch', out: 'potion_mp2', mats: [['herb', 4], ['crystal', 1]], gold: 25 },
  { st: 'alch', out: 'antidote', mats: [['herb', 2]], gold: 5 }, { st: 'alch', out: 'elixir', mats: [['herb', 6], ['essence', 1]], gold: 60 }, { st: 'alch', out: 'potion_str', mats: [['herb', 4], ['pelt', 1]], gold: 30 }, { st: 'alch', out: 'potion_def', mats: [['herb', 4], ['scale', 1]], gold: 30 },
  { st: 'alch', out: 'scroll_fire', mats: [['herb', 2], ['ash_shard', 1]], gold: 15 },
  { st: 'ench', out: 'essence', mats: [['crystal', 2]], gold: 20 }, { st: 'ench', out: 'essence', mats: [['ash_shard', 2]], gold: 20 }, { st: 'ench', out: 'essence', mats: [['herb', 10]], gold: 40 }
];
const STATION_N = { forge: 'Кузница', tailor: 'Швейная', alch: 'Алхимия', ench: 'Чародейка' };
const craftGold = r => Math.round(r.gold * (1 - .1 * (S.p.tal && S.p.tal.smith || 0)));
function canCraft(r) { return S.p.gold >= craftGold(r) && r.mats.every(([id, n]) => countItem(id) >= n); }
function craft(r) {
  if (!canCraft(r)) return G.toast('Не хватает золота или материалов');
  const d = ITEMS[r.out]; if (!isStack(r.out) && S.inv.length >= invMax() + r.mats.reduce((a, [id, n]) => a + (countItem(id) === n ? 1 : 0), 0)) return G.toast('Инвентарь полон');
  S.p.gold -= craftGold(r); r.mats.forEach(([id, n]) => removeItem(id, n)); if (!addItem(r.out, 1)) giveReward(r.out, 1); SND.play('equip'); G.toast('Создано: ' + d.n, 'gold');
}
// предметы: подсказка про зачарование
const _ish = itemStatsHtml; itemStatsHtml = function (it) { const e = it.en && ENCH[it.en.k]; return _ish(it) + (e ? '<br><span style="color:#b48aff">✦ ' + e.n + ' ' + it.en.l + ': ' + e.d(it.en.l) + '</span>' : ''); };
// сумки и эссенция у боссов
BOSSES.forest_guard.drops.push(['bag2', 1]); BOSSES.ice_guardian.drops.push(['bag3', 1]); BOSSES.castellan.drops.push(['essence', 1]); BOSSES.queen.drops.push(['essence', 1]); BOSSES.ice_guardian.drops.push(['essence', 1]);
// иконки
Object.assign(ICONS, {
  tome(P, it, h, col) { const d = shade(col, -50), l = shade(col, 40), t = it.tier || 1; P(col, 3, 2, 10, 12); P(d, 3, 2, 2, 12); P(d, 3, 13, 10, 1); P(l, 6, 3, 6, 1); P('#e8e0c8', 12, 3, 1, 10); P('#c8a040', 7, 6 + (t > 1 ? 0 : 1), 4, 4); P(d, 8, 7, 2, 2); if (t > 1) { P('#c8a040', 3, 2, 10, 1); P('#c8a040', 3, 13, 10, 1); } if (t > 2) { P('#fff', 4, 4); P('#fff', 11, 11); P('#ffffff66', 1, 8); P('#ffffff66', 14, 5); } },
  essence(P, it, h, col) { P('#6a4a9a', 5, 3, 6, 3); P(col, 4, 6, 8, 6); P(shade(col, 50), 5, 7, 2, 3); P('#6a4a9a', 6, 12, 4, 2); P('#fff', 7, 8); P('#ffffff77', 12, 3); P('#ffffff77', 2, 10); },
  sk_firewall(P) { for (let x = 1; x < 15; x += 3) { P('#c83a1a', x, 8 + (x % 2) * 2, 3, 6); P('#ff7a2a', x, 6 + (x % 2) * 2, 2, 6); P('#ffd24a', x, 4 + (x % 2) * 3, 1, 4); } },
  sk_tempest(P) { P('#5a5a6a', 1, 1, 14, 5); P('#7a7a8a', 3, 0, 8, 3); lin(P, '#ffee6a', 6, 6, 4, 10, 2); lin(P, '#ffee6a', 4, 10, 7, 11, 2); lin(P, '#ffee6a', 7, 11, 5, 15, 2); lin(P, '#ffee6a', 12, 6, 11, 12, 1); },
  sk_blizzard(P) { P('#cfeaff', 1, 2, 14, 2); P('#cfeaff', 3, 6, 10, 2); P('#8ad8ff', 2, 10, 12, 2); for (const [x, y] of [[3, 4], [8, 5], [12, 4], [5, 8], [10, 9], [2, 13], [7, 13], [13, 13]]) P('#fff', x, y, 2, 2); },
  sk_smite(P) { P('#fff4b0', 6, 0, 4, 12); P('#fff', 7, 0, 2, 12); P('#fff4b0', 3, 11, 10, 2); P('#fff4b0', 1, 13, 14, 2); P('#ffffff88', 4, 2, 1, 6); P('#ffffff88', 11, 2, 1, 6); },
  sk_drain(P) { P('#c04a8a', 3, 3, 10, 10); P('#8a2a5a', 5, 5, 6, 6); P('#ff5a8a', 6, 6, 4, 4); P('#fff', 7, 7, 2, 2); lin(P, '#ff5a8a', 1, 14, 5, 10); lin(P, '#ff5a8a', 15, 14, 11, 10); P('#c04a8a', 7, 1, 2, 2); }
});
ICMAP.essence = 'essence';
