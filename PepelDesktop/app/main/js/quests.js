'use strict';
// ---------- Инвентарь, экипировка, торговля, задания, диалоги, взаимодействие ----------
const invMax = () => 30 + ((S && S.p && S.p.bag) || 0);
const isStack = id => !isGear(ITEMS[id]);
function countItem(id) { return S.inv.reduce((a, i) => a + (i.id === id ? (i.n || 1) : 0), 0); }
function addItem(id, n, up) {
  n = n || 1; const d = ITEMS[id]; if (!d) return false;
  if (isStack(id)) {
    const ex = S.inv.find(i => i.id === id && i.n < 99);
    if (ex) { ex.n = Math.min(99, ex.n + n); }
    else { if (S.inv.length >= invMax() && d.t !== 'quest' && d.t !== 'lore') return false; S.inv.push({ id, n }); }
  } else { for (let i = 0; i < n; i++) { if (S.inv.length >= invMax()) return i > 0; S.inv.push({ id, up: up || 0 }); } }
  checkQuests(); return true;
}
function removeItem(id, n) {
  n = n || 1;
  for (let i = S.inv.length - 1; i >= 0 && n > 0; i--) { const it = S.inv[i]; if (it.id !== id) continue; const q = it.n || 1, t = Math.min(q, n); n -= t; if (it.n) { it.n -= t; if (it.n <= 0) S.inv.splice(i, 1); } else S.inv.splice(i, 1); }
}
function giveReward(id, n) { if (!addItem(id, n)) G.drops.push({ x: G.P.x, y: G.P.y + 6, id, n, gold: 0, t: 0 }); }
function useItem(id) {
  const d = ITEMS[id], st = stats(), P = G.P; if (!d || d.t !== 'cons' || !countItem(id)) return;
  if (d.heal) S.p.hp = Math.min(st.maxhp, S.p.hp + d.heal); if (d.mp) S.p.mp = Math.min(st.maxmp, S.p.mp + d.mp); if (d.cure) { P.poison = 0; P.slow = 0; }
  removeItem(id, 1); SND.play('heal'); G.addFloat(P.x, P.y - 24, d.heal ? '+' + Math.min(d.heal, 999) : '+' + d.mp + ' MP', d.heal ? '#6aff6a' : '#6a9aff', true); G.spark(P.x, P.y - 8, d.heal ? '#6aff6a' : '#6a9aff', 8, 40);
}
function sellPrice(it) { const d = ITEMS[it.id]; if (!d.price || d.t === 'quest' || d.t === 'lore') return 0; return Math.max(1, Math.floor(d.price * .4 * (1 + .35 * (it.up || 0)))); }
function buyPrice(id, shop) { return Math.round(ITEMS[id].price * (shop === 'hasim' ? 1.15 : 1)); }
const SLOT_OF = { book: 'book', weapon: 'weapon', armor: 'armor', helm: 'helm', acc: 'acc' };
function equipIdx(idx) {
  const it = S.inv[idx]; if (!it || !isGear(ITEMS[it.id])) return; const slot = SLOT_OF[ITEMS[it.id].t], old = S.eq[slot];
  S.eq[slot] = it; S.inv.splice(idx, 1); if (old) S.inv.push(old); SND.play('equip'); clampVitals();
}
function unequip(slot) { const it = S.eq[slot]; if (!it) return; if (S.inv.length >= invMax()) return G.toast('Инвентарь полон'); S.inv.push(it); S.eq[slot] = null; SND.play('equip'); clampVitals(); }
function clampVitals() { const st = stats(); S.p.hp = Math.min(S.p.hp, st.maxhp); S.p.mp = Math.min(S.p.mp, st.maxmp); }
function buyItem(shop, id) {
  const price = buyPrice(id, shop); if (S.p.gold < price) return G.toast('Не хватает золота');
  if (!addItem(id, 1)) return G.toast('Инвентарь полон'); S.p.gold -= price; SND.play('coin');
}
function sellIdx(idx) { const it = S.inv[idx]; if (!it) return; const v = sellPrice(it); if (!v) return G.toast('Это нельзя продать'); S.p.gold += v; if (it.n > 1) it.n--; else S.inv.splice(idx, 1); SND.play('coin'); }
function canUpgrade(it) { if (!it || (it.up || 0) >= MAXUP) return null; const c = upgradeCost(it, it.up || 0); const ok = S.p.gold >= c.gold && countItem('ore') >= c.ore && (!c.rare || countItem(c.rare[0]) >= c.rare[1]); return { c, ok }; }
function upgradeItem(it) {
  const r = canUpgrade(it); if (!r) return G.toast('Достигнут максимальный уровень'); if (!r.ok) return G.toast('Не хватает золота или материалов');
  S.p.gold -= r.c.gold; removeItem('ore', r.c.ore); if (r.c.rare) removeItem(r.c.rare[0], r.c.rare[1]); it.up = (it.up || 0) + 1; SND.play('equip'); SND.play('levelup'); G.toast(ITEMS[it.id].n + ' +' + it.up, 'gold'); clampVitals();
}
function allocStat(k) { if (S.p.pts <= 0) return; S.p[k]++; S.p.pts--; SND.play('click'); }
function upgradeSkill(id) { const sk = SKILLS[id]; if (S.p.spts <= 0 || S.p.lvl < sk.unlock || (S.skl[id] || 1) >= 5) return; S.skl[id] = (S.skl[id] || 1) + 1; S.p.spts--; SND.play('click'); }

// ----- задания -----
const qDone = id => !!(S.quests[id] && S.quests[id].st === 'done');
const qActive = id => !!(S.quests[id] && S.quests[id].st === 'active');
function startQuest(qid) {
  const q = QUESTS[qid]; if (!q || S.quests[qid]) return; S.quests[qid] = { st: 'active', step: 0, n: 0 };
  (q.give || []).forEach(([id, n]) => giveReward(id, n)); SND.play('quest_new'); UI.toast('Новое задание:\n' + q.t, 'gold'); checkQuests();
}
function advance(qid) {
  const q = QUESTS[qid], st = S.quests[qid]; st.step++; st.n = 0;
  if (st.step >= q.steps.length) return completeQuest(qid);
  SND.play('click'); UI.toast('Задание обновлено:\n' + q.steps[st.step].txt); checkQuests();
}
function checkQuests() {
  if (!S || !S.quests) return;
  for (const qid in S.quests) {
    const st = S.quests[qid]; if (st.st !== 'active') continue; const q = QUESTS[qid];
    for (let guard = 0; guard < 6; guard++) {
      const s = q.steps[st.step]; if (!s) break; let ok = false;
      if (s.k === 'item') ok = countItem(s.id) >= (s.n || 1); else if (s.k === 'pages') ok = (S.pages || []).length >= s.n; else break;
      if (!ok) break; if (st.st !== 'active') break; advance(qid); if (st.st !== 'active') break;
    }
  }
}
function QP(kind, id, n, qid) {
  for (const k in S.quests) {
    if (qid && k !== qid) continue; const st = S.quests[k]; if (st.st !== 'active') continue; const q = QUESTS[k], s = q.steps[st.step]; if (!s || s.k !== kind) continue;
    if (kind === 'kill') { if (!s.e.includes(id)) continue; st.n += n; if (st.n >= s.n) advance(k); else UI.toast(s.txt + ': ' + st.n + '/' + s.n); }
    else if (kind === 'interact') { if (s.id !== id) continue; st.n += n; if (st.n >= (s.n || 1)) advance(k); else UI.toast(s.txt + ': ' + st.n + '/' + s.n); }
    else if (kind === 'talk') { if (s.npc !== id) continue; advance(k); }
    else if (s.id === id) advance(k);
  }
}
function completeQuest(qid) {
  const q = QUESTS[qid], st = S.quests[qid]; st.st = 'done'; (q.take || []).forEach(([id, n]) => removeItem(id, n));
  const r = q.reward || {}; if (r.xp) gainXP(r.xp); if (r.gold) S.p.gold += r.gold; (r.items || []).forEach(([id, n]) => giveReward(id, n));
  if (q.flag) S.flags[q.flag] = 1; SND.play('quest_done');
  UI.toast('Задание выполнено:\n' + q.t + (r.xp || r.gold ? '\n+' + (r.xp || 0) + ' оп.  +' + (r.gold || 0) + ' зол.' : ''), 'gold');
  if (qid === 'm5') setTimeout(() => startQuest('m6'), 800);
  if (q.after && !q.noAfter) setTimeout(() => { if (G.mode === 'play') G.say(q.after); }, 1200);
}
function trackedQuest() {
  const act = Object.keys(S.quests).filter(k => S.quests[k].st === 'active'); if (!act.length) return null;
  const k = act.find(x => QUESTS[x].main) || act[0], q = QUESTS[k], st = S.quests[k], s = q.steps[st.step]; if (!s) return null;
  let prog = ''; if (s.k === 'kill' || (s.k === 'interact' && s.n > 1)) prog = ' ' + st.n + '/' + s.n; if (s.k === 'item') prog = ' ' + Math.min(countItem(s.id), s.n) + '/' + s.n; if (s.k === 'pages') prog = ' ' + (S.pages || []).length + '/' + s.n;
  return { id: k, t: q.t, txt: s.txt + prog, main: !!q.main };
}
function npcMarker(id) {
  if (!S) return null;
  for (const k in S.quests) { const st = S.quests[k]; if (st.st !== 'active') continue; const s = QUESTS[k].steps[st.step]; if (s && s.k === 'talk' && s.npc === id) return '?'; }
  for (const k in QUESTS) { const q = QUESTS[k]; if (q.giver === id && !S.quests[k] && !q.auto && q.offer && (!q.req || q.req())) return '!'; }
  return null;
}

// ----- диалоги -----
G.say = function (script, cb) {
  if (!script || !script.length) { if (cb) cb(); return; }
  G.dlgQ = script.slice(); G.dlgCb = cb; G.mode = 'dlg'; UI.showDialog(true); G.dlgNext();
};
G.dlgNext = function () {
  for (let guard = 0; guard < 80; guard++) {
    const it = G.dlgQ.shift();
    if (!it) { UI.showDialog(false); if (G.mode === 'dlg') G.mode = 'play'; const cb = G.dlgCb; G.dlgCb = null; if (cb) cb(); return; }
    if (Array.isArray(it)) { SND.play('dialog_blip'); UI.dialogLine(it[0], it[1]); return; }
    if (it.fn) { const r = it.fn(); if (Array.isArray(r)) G.dlgQ.unshift(...r); continue; }
    if (it.choices) { UI.dialogChoices(it.choices.map(([label, fn]) => [label, () => { const r = fn(); if (Array.isArray(r)) G.dlgQ.unshift(...r); G.dlgNext(); }])); return; }
  }
};
G.talk = function (npcId) {
  if (npcId === 'rein' && !F('rein_free')) return G.say([['Рейн', 'Эй! Выпусти меня! Рычаг от камеры где-то снаружи, западнее решётки.']]);
  const sc = buildTalk(npcId); const nd = NPCS[npcId]; if (nd && nd.board && !sc.some(x => Array.isArray(x) && x[0] !== 'Доска')) { }
  G.say(sc);
};

// ----- взаимодействие с миром -----
function interact(near) {
  const o = near.o, P = G.P;
  if (near.k === 'npc') return G.talk(o.id);
  const key = G.mid + ':' + o.id;
  switch (o.t) {
    case 'chest': {
      if (S.done[key]) return; S.done[key] = 1; SND.play('chest'); const names = [];
      (o.loot || []).forEach(([id, n]) => { giveReward(id, n); names.push(ITEMS[id].n + (n > 1 ? ' ×' + n : '')); }); if (o.gold) { S.p.gold += o.gold; names.push(o.gold + ' зол.'); }
      UI.toast('Сундук:\n' + (names.join(', ') || 'пусто'), 'gold'); G.spark(o.x * TS + 8, o.y * TS + 6, '#ffd24a', 12, 60);
      if (o.trapped) { G.hazards.push({ x: o.x * TS + 8, y: o.y * TS + 10, r: 30, warn: .8, dur: .25, dmg: 10 + S.p.lvl * 4, t: 0, once: true, burst: 1, sfx: 'explosion' }); UI.toast('Сундук заминирован! Отойди!', 'gold'); }
      if (o.ambush) { setTimeout(() => { if (G.mid + ':' + o.id !== key) return; o.ambush.forEach((tp, i) => { const p = freeNear(o.x * TS + 8 + (i - 1) * 22, o.y * TS + 34, 20, 7); if (!p) return; const e = spawnEnemy(tp, p[0], p[1]); e.aggro = true; e.st = 'chase'; G.spark(p[0], p[1], '#c8a0ff', 12, 70); }); SND.play('alert'); G.addShake(3); UI.toast('Засада!', 'gold'); }, 500); }
      break;
    }
    case 'pick': {
      if (S.done[key]) return;
      if (o.q && !qActive(o.q)) return G.say([['', 'Ты не понимаешь, зачем это тебе сейчас. Лучше вернуться сюда с нужным заданием.']]);
      if (o.item) { if (!addItem(o.item, o.n || 1)) return G.toast('Инвентарь полон'); }
      S.done[key] = 1; SND.play('pickup');
      if (o.lore) { S.pages = S.pages || []; if (!S.pages.includes(o.item)) S.pages.push(o.item); UI.toast('Найдена страница хроник:\n' + ITEMS[o.item].n, 'gold'); checkQuests(); setTimeout(() => G.say([['Хроники', CHRONICLES[o.item]]]), 100); }
      else if (o.item) UI.toast('Получено: ' + ITEMS[o.item].n);
      if (o.lines) G.say(o.lines); if (o.grp) groupStep(o); if (o.qi) QP('interact', o.qi, 1); break;
    }
    case 'lever': {
      if (o.q && !qActive(o.q)) return G.say([['', 'Рычаг не поддаётся. Похоже, он реагирует только на тех, кто идёт по следу древней тайны.']]);
      if (o.once && S.done[key]) return; S.done[key] = 1; SND.play('lever'); G.addShake(2);
      if (o.flag) { G.openGate(o.flag); G.toast('Решётка открылась'); } if (o.grp) groupStep(o); if (o.qi) QP('interact', o.qi, 1); break;
    }
    case 'crack': S.done[key] = 1; G.map.o[ix(G.map, o.x, o.y)] = 0; SND.play('break'); G.addShake(3); G.spark(o.x * TS + 8, o.y * TS + 8, '#9a9eac', 18, 90); G.toast('Стена рухнула, открылся тайный проход', 'gold'); break;
    case 'sign': G.say(o.lines); break;
    case 'save': {
      const st = stats(); S.p.hp = st.maxhp; S.p.mp = st.maxmp; P.poison = 0; P.slow = 0; S.respawn = { map: G.mid, x: o.x, y: o.y + 1 }; SND.play('heal');
      G.spark(o.x * TS + 8, o.y * TS, '#ff5a6a', 18, 60); saveGame(0, true); G.toast('Святилище: здоровье и мана восстановлены.\nИгра сохранена (автосохранение).', 'gold'); break;
    }
  }
}
function groupStep(o) {
  const k = 'g_' + o.grp; S.flags[k] = (S.flags[k] || 0) + 1;
  if (S.flags[k] >= o.of) { G.openGate(o.open); G.toast(o.open === 'jtemple_open' ? 'Врата храма открылись!' : o.open === 'fort_open' ? 'Ворота бастиона открылись!' : 'Ледяные врата открылись!', 'gold'); }
  else G.toast(S.flags[k] + ' из ' + o.of);
}

// ----- новая игра -----
G.newGame = function () {
  S = freshState(); const st = stats(); S.p.hp = st.maxhp; S.p.mp = st.maxmp; G.P = null; G.boss = null;
  loadMap('capital', undefined, undefined, true); UI.closeAll(); UI.showHud(true); G.mode = 'play'; G.fade = 1; G.fadeDir = -1;
  SND.music('m_city'); startQuest('m0');
  setTimeout(() => G.say([['', 'Столица. Утро последнего спокойного дня.'], ['', 'Арион просыпается с тяжёлым чувством. Ладонь слегка зудит, как перед грозой. Старейшина Орвен просил зайти к нему, он ждёт на площади.'], ['', 'Управление: WASD — ходьба, ЛКМ или K — удар, Пробел — перекат, E — говорить и действовать, 1–4 — навыки, Q/R — зелья. I — инвентарь, J — журнал, M — карта, C — герой.']]), 600);
};
