'use strict';
// ---------- Панели: инвентарь, персонаж, журнал, карта, магазин, кузница, сохранения, настройки ----------
const SLOT_N = { weapon: 'Оружие', book: 'Книга', armor: 'Броня', helm: 'Шлем', acc: 'Аксессуар' };
const STAT_N = { str: 'Сила', dex: 'Ловкость', int: 'Интеллект', vit: 'Выносливость' };
const STAT_D = { str: 'Урон в ближнем бою', dex: 'Скорость, уклонение, крит', int: 'Магия и запас маны', vit: 'Здоровье и защита' };
const itemName2 = it => ITEMS[it.id].n + (it.up ? ' +' + it.up : '') + (it.en ? ' ✦' : '');
function itemStatsHtml(it) {
  const d = ITEMS[it.id], m = upMul(it.up), out = []; if (d.atk) out.push('Атака +' + Math.round(d.atk * m)); if (d.def) out.push('Защита +' + Math.round(d.def * m));
  ['str', 'dex', 'int', 'vit'].forEach(k => { if (d[k]) out.push(STAT_N[k] + ' +' + d[k]); }); if (d.hp) out.push('HP +' + d.hp); if (d.mp && d.t !== 'cons') out.push('MP +' + d.mp);
  if (d.elem) out.push('Стихия: ' + ({ ice: 'лёд', ash: 'пепел', fire: 'огонь' }[d.elem] || d.elem));
  return '<b' + (d.rare ? ' style="color:#c88aff"' : '') + '>' + esc(itemName2(it)) + '</b><br><span class="muted">' + esc(d.d || '') + '</span>' + (out.length ? '<br><span style="color:#7ad89a">' + out.join(' · ') + '</span>' : '');
}
const cellHtml = (it, i, extra) => { const d = ITEMS[it.id]; return '<div class="cell' + (d.rare ? ' rare' : '') + (extra || '') + '" data-i="' + i + '"><img src="' + itemIcon(d) + '">' + (it.up ? '<span class="up">+' + it.up + '</span>' : '') + (it.n > 1 ? '<em>' + it.n + '</em>' : '') + '</div>'; };
Object.assign(UI, {
  sel: -1, selSlot: null,
  // ---------- инвентарь ----------
  show_inv() {
    const st = stats(), eqH = Object.keys(SLOT_N).map(k => { const it = S.eq[k]; return '<div class="row" style="margin:3px 0"><div class="cell eq-slot' + (it ? '' : '') + '" data-slot="' + k + '">' + (it ? '<img src="' + itemIcon(ITEMS[it.id]) + '">' + (it.up ? '<span class="up">+' + it.up + '</span>' : '') : '') + '</div><div class="muted">' + SLOT_N[k] + '<br><span style="color:#dfe8ff">' + (it ? esc(itemName2(it)) : '—') + '</span></div></div>'; }).join('');
    let sel = this.selSlot ? S.eq[this.selSlot] : S.inv[this.sel]; if (!sel) { this.sel = -1; this.selSlot = null; }
    const d = sel ? ITEMS[sel.id] : null;
    let btns = '';
    if (d) {
      if (this.selSlot) btns = '<button class="btn sm" data-a="un">Снять</button>';
      else { if (isGear(d)) btns += '<button class="btn sm" data-a="eq">Надеть</button>'; if (d.t === 'cons') btns += '<button class="btn sm" data-a="use">Использовать</button>'; if (d.t !== 'quest' && d.t !== 'lore') btns += '<button class="btn sm danger" data-a="drop">Выбросить</button>'; }
    }
    const cmp = d && !this.selSlot && isGear(d) ? this.cmpHtml(sel) : '';
    const s = this.screen('<div class="panel" style="width:min(760px,96vw)"><h2>Инвентарь</h2><div class="row" style="align-items:flex-start;flex-wrap:wrap;justify-content:center;gap:14px">' +
      '<div><div class="grid">' + S.inv.map((it, i) => cellHtml(it, i, i === this.sel && !this.selSlot ? ' sel' : '')).join('') + Array.from({ length: Math.max(0, invMax() - S.inv.length) }, () => '<div class="cell" style="opacity:.35;cursor:default"></div>').join('') + '</div><div class="muted" style="margin-top:6px">Предметов: ' + S.inv.length + ' / ' + invMax() + ' · <span class="gold">⛁ ' + S.p.gold + '</span></div></div>' +
      '<div style="width:230px"><h3>Снаряжение</h3>' + eqH + '<h3>Характеристики</h3><div class="stat"><span>Атака</span><b>' + st.atk + '</b></div><div class="stat"><span>Защита</span><b>' + st.def + '</b></div><div class="stat"><span>Здоровье</span><b>' + Math.ceil(S.p.hp) + '/' + st.maxhp + '</b></div><div class="stat"><span>Мана</span><b>' + Math.ceil(S.p.mp) + '/' + st.maxmp + '</b></div></div></div>' +
      '<div class="ibox" style="min-height:70px;margin-top:8px;padding:10px;border:2px solid #eee;background:#c9c9c9;color:#000">' + (d ? itemStatsHtml(sel) + cmp + '<div style="margin-top:6px">' + btns + '</div>' : '<span class="muted">Выбери предмет. ЛКМ — выбрать, двойной клик — надеть/использовать.</span>') + '</div><button class="btn" id="bk" style="margin-top:8px">Закрыть (I)</button></div>', '', 'inv');
    s.querySelectorAll('.grid .cell[data-i]').forEach(c => { c.onclick = () => { this.sel = +c.dataset.i; this.selSlot = null; SND.play('click'); this.show_inv(); }; c.ondblclick = () => { const it = S.inv[+c.dataset.i], dd = ITEMS[it.id]; if (isGear(dd)) equipIdx(+c.dataset.i); else if (dd.t === 'cons') useItem(it.id); this.sel = -1; this.show_inv(); }; });
    s.querySelectorAll('[data-slot]').forEach(c => c.onclick = () => { if (!S.eq[c.dataset.slot]) return; this.selSlot = c.dataset.slot; this.sel = -1; SND.play('click'); this.show_inv(); });
    s.querySelectorAll('[data-a]').forEach(b => b.onclick = () => {
      const a = b.dataset.a;
      if (a === 'un') { unequip(this.selSlot); this.selSlot = null; } else if (a === 'eq') { equipIdx(this.sel); this.sel = -1; } else if (a === 'use') { useItem(sel.id); if (!S.inv[this.sel] || S.inv[this.sel] !== sel) this.sel = -1; }
      else if (a === 'drop') { if (!isGear(d) || confirm('Выбросить «' + ITEMS[sel.id].n + '»?')) { S.inv.splice(this.sel, 1); this.sel = -1; SND.play('click'); } }
      this.show_inv();
    });
    s.querySelector('#bk').onclick = () => this.close();
  },
  cmpHtml(it) {
    const d = ITEMS[it.id], cur = S.eq[d.t], before = stats(); if (cur === it) return '';
    S.eq[d.t] = it; const after = stats(); S.eq[d.t] = cur; const ln = (n, a, b) => a === b ? '' : '<span style="color:' + (b > a ? '#7ad89a' : '#ff6a6a') + '">' + n + ' ' + (b > a ? '+' : '') + (b - a) + '</span> ';
    const t = ln('Атака', before.atk, after.atk) + ln('Защита', before.def, after.def) + ln('HP', before.maxhp, after.maxhp) + ln('MP', before.maxmp, after.maxmp); return t ? '<div style="margin-top:4px">Если надеть: ' + t + '</div>' : '';
  },
  // ---------- персонаж ----------
  show_char() {
    const p = S.p, st = stats(), s = this.screen('<div class="panel" style="width:min(720px,96vw)"><h2>Арион — уровень ' + p.lvl + '</h2><div class="row" style="align-items:flex-start;flex-wrap:wrap;gap:16px;justify-content:center">' +
      '<div style="width:300px"><h3>Характеристики' + (p.pts ? ' <span class="gold">(очков: ' + p.pts + ')</span>' : '') + '</h3>' +
      Object.keys(STAT_N).map(k => '<div class="stat"><span title="' + STAT_D[k] + '">' + STAT_N[k] + ' <span class="muted">(' + STAT_D[k] + ')</span></span><span><b>' + st[k] + '</b>' + (st[k] !== p[k] ? '<span class="muted"> (' + p[k] + ')</span>' : '') + '<button class="plus" data-st="' + k + '"' + (p.pts ? '' : ' disabled') + '>+</button></span></div>').join('') +
      '<h3>Боевые</h3><div class="stat"><span>Здоровье</span><b>' + Math.ceil(p.hp) + ' / ' + st.maxhp + '</b></div><div class="stat"><span>Мана</span><b>' + Math.ceil(p.mp) + ' / ' + st.maxmp + '</b></div><div class="stat"><span>Атака</span><b>' + st.atk + '</b></div><div class="stat"><span>Защита</span><b>' + st.def + '</b></div><div class="stat"><span>Шанс крита</span><b>' + Math.round(st.crit * 100) + '%</b></div><div class="stat"><span>Уклонение</span><b>' + Math.round(st.dodge * 100) + '%</b></div>' +
      '<div class="stat"><span>Опыт</span><b>' + (p.lvl >= 20 ? 'макс.' : p.xp + ' / ' + xpNeed(p.lvl)) + '</b></div><div class="stat"><span>Убито врагов</span><b>' + S.kills + '</b></div><div class="stat"><span>Время</span><b>' + fmtTime(S.time) + '</b></div></div>' +
      '<div style="width:340px"><h3>Навыки' + (p.spts ? ' <span class="gold">(очков: ' + p.spts + ')</span>' : '') + '</h3>' +
      Object.keys(SKILLS).map(id => { const sk = SKILLS[id], lv = S.skl[id] || 1, lock = p.lvl < sk.unlock; return '<div class="list"><div class="it" style="cursor:default' + (lock ? ';opacity:.5' : '') + '"><img src="' + itemIcon(sk) + '"><div class="grow"><b>' + sk.n + '</b> <span class="muted">' + sk.kind + (sk.key ? ' · клавиша ' + sk.key : '') + '</span><br><span class="muted">' + (lock ? 'Откроется на уровне ' + sk.unlock : sk.d + (sk.mp ? ' MP ' + sk.mp + (sk.cd ? ', перезарядка ' + sk.cd + 'с' : '') : '')) + '</span></div><div style="text-align:right">ур. ' + lv + '/5<br><button class="plus" data-sk="' + id + '"' + (p.spts && !lock && lv < 5 ? '' : ' disabled') + '>+</button></div></div></div>'; }).join('') + '</div></div><button class="btn" id="bk" style="margin-top:10px">Закрыть (C)</button></div>', '', 'char');
    s.querySelectorAll('[data-st]').forEach(b => b.onclick = () => { allocStat(b.dataset.st); clampVitals(); this.show_char(); });
    s.querySelectorAll('[data-sk]').forEach(b => b.onclick = () => { upgradeSkill(b.dataset.sk); this.show_char(); }); s.querySelector('#bk').onclick = () => this.close();
  },
  // ---------- журнал ----------
  qtab: 'active', qsel: null,
  show_quests() {
    const T = this.qtab, ids = Object.keys(S.quests), act = ids.filter(k => S.quests[k].st === 'active'), done = ids.filter(k => S.quests[k].st === 'done');
    let body = '';
    if (T === 'chron') {
      body = Object.keys(CHRONICLES).map(id => { const has = (S.pages || []).includes(id); return '<div class="q' + (has ? '' : ' done') + '"><b>' + (has ? esc(ITEMS[id].n) : '??? Страница не найдена') + '</b>' + (has ? '<br><span class="muted" style="color:#cfd8f0">' + esc(CHRONICLES[id]) + '</span>' : '') + '</div>'; }).join('');
      body = '<div class="muted" style="margin-bottom:6px">Страницы хроник: ' + (S.pages || []).length + ' / ' + Object.keys(CHRONICLES).length + '</div>' + body;
    } else {
      const list = T === 'active' ? act : done; body = list.length ? list.sort((a, b) => (QUESTS[b].main ? 1 : 0) - (QUESTS[a].main ? 1 : 0)).map(k => {
        const q = QUESTS[k], st = S.quests[k], step = q.steps[st.step], open = this.qsel === k;
        return '<div class="q' + (q.main ? ' main' : '') + (T === 'done' ? ' done' : '') + '" data-q="' + k + '"><b>' + (q.main ? '★ ' : '') + esc(q.t) + '</b>' + (T === 'active' && step ? '<br><span class="gold">▸ ' + esc(step.txt) + '</span>' : '') + (open ? '<div class="muted" style="margin-top:4px;color:#444">' + esc(q.d || '') + '</div>' : '') + '</div>';
      }).join('') : '<div class="muted">' + (T === 'active' ? 'Нет активных заданий.' : 'Выполненных заданий нет.') + '</div>';
    }
    const s = this.screen('<div class="panel" style="width:min(640px,96vw)"><h2>Журнал</h2>' + this.tabs([['active', 'Активные (' + act.length + ')'], ['done', 'Выполненные (' + done.length + ')'], ['chron', 'Хроники']], T) + '<div style="max-height:56vh;overflow:auto">' + body + '</div><button class="btn" id="bk" style="margin-top:8px">Закрыть (J)</button></div>', '', 'quests');
    this.bindTabs(s, t => { this.qtab = t; this.show_quests(); }); s.querySelectorAll('[data-q]').forEach(q => q.onclick = () => { this.qsel = this.qsel === q.dataset.q ? null : q.dataset.q; this.show_quests(); }); s.querySelector('#bk').onclick = () => this.close();
  },
  // ---------- карта ----------
  _mm: {}, mapTab: null,
  minimap(id) {
    if (this._mm[id]) return this._mm[id]; const m = id === G.mid ? G.map : buildMap(id), c = mkCanvas(m.w, m.h), x = c.getContext('2d'), im = x.createImageData(m.w, m.h);
    const col = ['#4a8a3a', '#2a6a2a', '#d8b868', '#e8f0f8', '#a8d8f0', '#6a5a66', '#a08860', '#8a8a96', '#2a5a9a', '#8a6a3a', '#e0501a', '#3a6a2a', '#8a6a3a', '#5a5a68'].map(h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);
    for (let i = 0; i < m.w * m.h; i++) { let c3 = col[m.g[i]] || [0, 0, 0], o = m.o[i]; if (o === O.WALL || (o >= O.ROOF && o <= O.PILLAR && o !== O.ROOF + 100) || o === O.ROOFB || o === O.ROOFG) c3 = [58, 58, 72]; else if (o === O.TREE || o === O.JTREE || o === O.PINE) c3 = c3.map(v => v * .7); if (m.g[i] === 255) c3 = [0, 0, 0]; im.data.set([c3[0], c3[1], c3[2], 255], i * 4); }
    x.putImageData(im, 0, 0); return this._mm[id] = c;
  },
  show_map() {
    const ids = Object.keys(REGIONS); S.seen = S.seen || {}; S.seen[G.mid] = 1; const T = this.mapTab && S.seen[this.mapTab] ? this.mapTab : (typeof INTERIORS !== 'undefined' && INTERIORS[G.mid] ? 'capital' : G.mid);
    const s = this.screen('<div class="panel" style="width:min(820px,96vw)"><h2>Карта мира</h2>' + this.tabs(ids.map(i => [i, (S.seen[i] ? '' : '🔒 ') + REGIONS[i].n]), T) + '<div style="text-align:center"><canvas id="mapcv"></canvas></div><div class="muted" id="mapleg" style="margin-top:6px;text-align:center"></div><button class="btn" id="bk" style="margin-top:8px">Закрыть (M)</button></div>', '', 'map');
    this.bindTabs(s, t => { if (!S.seen[t]) return this.toast('Регион ещё не исследован'); this.mapTab = t; this.show_map(); });
    const cv = s.querySelector('#mapcv'); const m = T === G.mid ? G.map : null, mm = S.seen[T] ? this.minimap(T) : null; if (!mm) { s.querySelector('#bk').onclick = () => this.close(); return; }
    const sc = Math.max(1, Math.min(Math.floor(Math.min(innerWidth * .9, 780) / mm.width), Math.floor(Math.min(innerHeight * .6, 520) / mm.height), 8)); cv.width = mm.width * sc; cv.height = mm.height * sc; const x = cv.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(mm, 0, 0, cv.width, cv.height);
    { const exs = m ? m.exits : (S.exits && S.exits[T]) || []; x.font = 'bold ' + Math.max(10, sc * 2 + 4) + 'px sans-serif'; x.textBaseline = 'middle';
      exs.forEach(e => { if (!REGIONS[e.to]) return; const ex = e.x * sc, ey = e.y * sc, ew = Math.max(e.w, 1) * sc, eh = Math.max(e.h, 1) * sc; x.fillStyle = '#ffd24a'; x.fillRect(ex, ey, ew, eh);
        const lb = '→ ' + REGIONS[e.to].n, tw = x.measureText(lb).width; let lx = ex + ew / 2 - tw / 2, ly = ey + eh / 2; lx = Math.max(3, Math.min(cv.width - tw - 3, lx)); ly = ly < 14 ? ey + eh + 9 : ly > cv.height - 14 ? ey - 9 : ly;
        x.fillStyle = 'rgba(10,12,20,.82)'; x.fillRect(lx - 3, ly - 8, tw + 6, 16); x.fillStyle = '#ffd24a'; x.textAlign = 'left'; x.fillText(lb, lx, ly); }); }
    if (m) {
      m.things.forEach(t => { if (t.t === 'save') { x.fillStyle = '#5affff'; x.fillRect(t.x * sc - 1, t.y * sc - 1, sc + 3, sc + 3); } });
      G.npcs.forEach(n => { x.fillStyle = '#7ad89a'; x.fillRect(n.x / TS * sc - 1, n.y / TS * sc - 1, 3, 3); });
      const q = trackedQuest(); G.boss && 0;
      const px = G.P.x / TS * sc, py = G.P.y / TS * sc; x.fillStyle = '#fff'; x.beginPath(); x.arc(px, py, 5, 0, 7); x.fill(); x.fillStyle = '#ff3a3a'; x.beginPath(); x.arc(px, py, 3, 0, 7); x.fill();
    }
    s.querySelector('#mapleg').innerHTML = '<span style="color:#ff3a3a">●</span> Вы · <span style="color:#6aff9a">■</span> Жители · <span style="color:#5affff">■</span> Святилище · <span style="color:#ffd24a">■</span> Переходы (подписано, куда ведёт мост/проход)' + (m ? '' : ' · <i>карта открыта по памяти</i>');
    s.querySelector('#bk').onclick = () => this.close();
  },
  // ---------- магазин ----------
  openShop(npcId) {
    this.shopId = NPCS[npcId].shop; this.shopTab = 'buy'; this.shopNpc = npcId; if (G.mode !== 'ui') { G.mode = 'ui'; } this.from = 'play'; this.name = 'shop'; this.show_shop();
  },
  show_shop() {
    const sh = SHOPS[this.shopId], T = this.shopTab; let list;
    if (T === 'buy') list = sh.stock().map(id => '<div class="it" data-b="' + id + '"><img src="' + itemIcon(ITEMS[id]) + '"><div class="grow">' + itemStatsHtml({ id }) + '</div><div class="gold">⛁ ' + buyPrice(id, this.shopId) + '</div></div>').join('');
    else list = S.inv.map((it, i) => { const v = sellPrice(it); return v ? '<div class="it" data-s="' + i + '"><img src="' + itemIcon(ITEMS[it.id]) + '"><div class="grow"><b>' + esc(itemName2(it)) + '</b>' + (it.n > 1 ? ' ×' + it.n : '') + '</div><div class="gold">⛁ ' + v + '</div></div>' : ''; }).join('') || '<div class="muted">Нечего продавать.</div>';
    const s = this.screen('<div class="panel" style="width:min(560px,96vw)"><h2>' + esc(sh.n) + '</h2><div class="row" style="justify-content:space-between"><div>' + this.tabs([['buy', 'Купить'], ['sell', 'Продать']], T) + '</div><div class="gold" style="font-size:18px">⛁ ' + S.p.gold + '</div></div><div class="list" style="max-height:52vh;overflow:auto">' + list + '</div><button class="btn" id="bk" style="margin-top:8px">Уйти</button></div>', '', 'shop');
    this.bindTabs(s, t => { this.shopTab = t; this.show_shop(); });
    s.querySelectorAll('[data-b]').forEach(e => e.onclick = () => { buyItem(this.shopId, e.dataset.b); this.show_shop(); });
    s.querySelectorAll('[data-s]').forEach(e => e.onclick = () => { sellIdx(+e.dataset.s); this.show_shop(); });
    s.querySelector('#bk').onclick = () => this.close();
  },
  // ---------- кузница ----------
  openForge() { if (G.mode !== 'ui') G.mode = 'ui'; this.from = 'play'; this.name = 'forge'; this.fsel = null; this.show_forge(); },
  show_forge() {
    const items = []; Object.keys(S.eq).forEach(k => { if (S.eq[k]) items.push({ it: S.eq[k], eq: k }); }); S.inv.forEach(it => { if (isGear(ITEMS[it.id])) items.push({ it }); });
    if (this.fsel === null || !items[this.fsel]) this.fsel = items.length ? 0 : null; const cur = items[this.fsel], r = cur && canUpgrade(cur.it);
    let det = '<span class="muted">Нет снаряжения.</span>';
    if (cur) {
      const it = cur.it, d = ITEMS[it.id]; det = itemStatsHtml(it) + '<br>';
      if (!r) det += '<div class="gold" style="margin-top:6px">Максимальное улучшение</div>'; else { const c = r.c; det += '<div style="margin-top:6px">Улучшение до +' + ((it.up || 0) + 1) + ':<br><span style="color:' + (S.p.gold >= c.gold ? '#7ad89a' : '#ff6a6a') + '">⛁ ' + c.gold + '</span> · <span style="color:' + (countItem('ore') >= c.ore ? '#7ad89a' : '#ff6a6a') + '">Руда ' + countItem('ore') + '/' + c.ore + '</span>' + (c.rare ? ' · <span style="color:' + (countItem(c.rare[0]) >= c.rare[1] ? '#7ad89a' : '#ff6a6a') + '">' + ITEMS[c.rare[0]].n + ' ' + countItem(c.rare[0]) + '/' + c.rare[1] + '</span>' : '') + '<br><span class="muted">Бонус растёт на 14% за уровень.</span></div><button class="btn" id="up" style="margin-top:6px"' + (r.ok ? '' : ' disabled') + '>Улучшить</button>'; }
    }
    const s = this.screen('<div class="panel" style="width:min(640px,96vw)"><h2>Кузница Брогара</h2><div class="row" style="align-items:flex-start;flex-wrap:wrap;justify-content:center"><div class="grid" style="grid-template-columns:repeat(5,48px)">' + items.map((e, i) => cellHtml(e.it, i, (i === this.fsel ? ' sel' : '') + (e.eq ? ' eq' : ''))).join('') + '</div><div style="width:260px">' + det + '</div></div><div class="muted" style="margin-top:6px">Золото: ' + S.p.gold + ' · Руда: ' + countItem('ore') + ' · жёлтая рамка — надето</div><button class="btn" id="bk">Уйти</button></div>', '', 'forge');
    s.querySelectorAll('.cell[data-i]').forEach(c => c.onclick = () => { this.fsel = +c.dataset.i; SND.play('click'); this.show_forge(); });
    const up = s.querySelector('#up'); if (up) up.onclick = () => { upgradeItem(cur.it); this.show_forge(); }; s.querySelector('#bk').onclick = () => this.close();
  },
  // ---------- сохранения ----------
  show_saves(fromTitle) {
    const canSave = !!(S && G.P && this.from !== 'title' && this.from !== 'death'); const rows = [0, 1, 2, 3].map(i => {
      const v = readSave(i), nm = i === 0 ? 'Автосохранение' : 'Слот ' + i;
      const info = v ? CHAPTERS[v.chap || 0][0] + ' · ' + REGIONS[v.map].n + ' · ур. ' + v.p.lvl + ' · ' + fmtTime(v.time) + '<br><span class="muted">' + new Date(v.saved || 0).toLocaleString('ru-RU') + '</span>' : '<span class="muted">Пусто</span>';
      return '<div class="it" style="cursor:default"><div class="grow"><b>' + nm + '</b><br>' + info + '</div>' + (i && canSave ? '<button class="btn sm" data-sv="' + i + '">Сохранить</button>' : '') + (v ? '<button class="btn sm" data-ld="' + i + '">Загрузить</button><button class="btn sm danger" data-dl="' + i + '">✕</button>' : '') + '</div>';
    }).join('');
    const s = this.screen('<div class="panel" style="width:min(620px,96vw)"><h2>Сохранения</h2><div class="list">' + rows + '</div><div class="muted">Святилища лечат и обновляют автосохранение.</div><button class="btn" id="bk" style="margin-top:8px">Назад</button></div>', '', 'saves');
    s.querySelectorAll('[data-sv]').forEach(b => b.onclick = () => { saveGame(+b.dataset.sv); this.show_saves(); });
    s.querySelectorAll('[data-ld]').forEach(b => b.onclick = () => { const i = +b.dataset.ld; SND.init(); this.loading(() => loadGame(i)); });
    s.querySelectorAll('[data-dl]').forEach(b => b.onclick = () => { if (confirm('Удалить сохранение?')) { try { localStorage.removeItem(SAVE_KEY(+b.dataset.dl)); } catch (e) { } this.show_saves(); } });
    s.querySelector('#bk').onclick = () => { if (this.from === 'death') { this.name = null; this.death(); } else this.close(); };
  },
  // ---------- настройки ----------
  stab: 'main',
  show_settings() {
    const T = this.stab, sl = (k, n, mn, mx, stp) => '<div class="stat"><span>' + n + '</span><span><input type="range" data-cfg="' + k + '" min="' + mn + '" max="' + mx + '" step="' + (stp || .05) + '" value="' + CFG[k] + '"></span></div>';
    let body;
    if (T === 'main') body = '<h3>Звук</h3>' + sl('master', 'Общая громкость', 0, 1) + sl('sfx', 'Эффекты', 0, 1) + sl('music', 'Музыка', 0, 1) + '<h3>Графика и игра</h3>' + sl('bright', 'Яркость', .6, 1.5) + sl('shake', 'Тряска экрана', 0, 1) + '<div class="stat"><span>Подсказки взаимодействия</span><input type="checkbox" data-cfg="hints"' + (CFG.hints ? ' checked' : '') + '></div><button class="btn" id="fs">Полный экран</button>';
    else body = '<div class="muted" style="margin-bottom:6px">Подставь свои звуки: выбери файл (ogg / mp3 / wav / m4a) для любого события или музыкальной темы. Файлы хранятся в браузере. Либо положи файлы в <b>assets/sounds/&lt;id&gt;.ogg</b> (см. README в этой папке).</div><div style="max-height:44vh;overflow:auto">' + SND.slots.map(sl2 => { const inf = SND.info(sl2.id); return '<div class="sndrow"><span class="nm">' + esc(sl2.name) + '<br><span class="muted">' + sl2.id + ' · ' + (inf ? '<span style="color:#7ad89a">свой: ' + esc(inf.name) + '</span>' : 'по умолчанию') + '</span></span><button class="btn sm" data-t="' + sl2.id + '">▶</button><button class="btn sm" data-u="' + sl2.id + '">Файл</button>' + (inf ? '<button class="btn sm danger" data-c="' + sl2.id + '">Сброс</button>' : '') + '</div>'; }).join('') + '</div><input type="file" id="fin" accept="audio/*,.ogg,.mp3,.wav,.m4a" style="display:none">';
    const s = this.screen('<div class="panel" style="width:min(600px,96vw)"><h2>Настройки</h2>' + this.tabs([['main', 'Общие'], ['sound', 'Звуки (свои файлы)']], T) + body + '<button class="btn" id="bk" style="margin-top:10px">Назад</button></div>', '', 'settings');
    this.bindTabs(s, t => { this.stab = t; this.show_settings(); });
    s.querySelectorAll('[data-cfg]').forEach(el => el.oninput = () => { const k = el.dataset.cfg; CFG[k] = el.type === 'checkbox' ? (el.checked ? 1 : 0) : +el.value; if (['master', 'sfx', 'music'].includes(k)) SND.setVol(k, CFG[k]); saveCfg(); });
    const fs = s.querySelector('#fs'); if (fs) fs.onclick = () => { const d = document.documentElement; (document.fullscreenElement ? document.exitFullscreen() : d.requestFullscreen && d.requestFullscreen()); };
    let target = null; const fin = s.querySelector('#fin');
    s.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { SND.init(); const sl2 = SND.slots.find(x => x.id === b.dataset.t); sl2.music ? SND.music(sl2.id) : SND.play(sl2.id); });
    s.querySelectorAll('[data-u]').forEach(b => b.onclick = () => { target = b.dataset.u; fin.value = ''; fin.click(); });
    s.querySelectorAll('[data-c]').forEach(b => b.onclick = () => { SND.clear(b.dataset.c); this.show_settings(); });
    if (fin) fin.onchange = async () => { const f = fin.files[0]; if (!f || !target) return; SND.init(); try { await SND.setFile(target, f); this.toast('Звук загружен: ' + f.name); } catch (e) { this.toast('Не удалось прочитать файл'); } this.show_settings(); };
    s.querySelector('#bk').onclick = () => { if (this.from === 'play' && G.map && S) SND.music(G.boss ? BOSSES[G.boss.bid].music : REGIONS[G.map.reg].music); this.close(); };
  }
});
// возврат с экрана сохранений после смерти
const _close = UI.close; UI.close = function () { if (this.from === 'death') { this.closeAll(true); this.name = null; return this.death(); } return _close.call(this); };
