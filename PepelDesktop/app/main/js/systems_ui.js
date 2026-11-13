'use strict';
// ---------- Окна: крафт, зачарование, таланты ----------
Object.assign(UI, {
  openCraft(st) { if (G.mode !== 'ui') G.mode = 'ui'; this.from = 'play'; this.name = 'craft'; this.craftSt = st; this.show_craft(); },
  show_craft() {
    const st = this.craftSt, rs = RECIPES.filter(r => r.st === st);
    const rows = rs.map((r, i) => { const d = ITEMS[r.out], ok = canCraft(r); return '<div class="it" data-r="' + RECIPES.indexOf(r) + '" style="' + (ok ? '' : 'opacity:.6') + '"><img src="' + itemIcon(d) + '"><div class="grow">' + itemStatsHtml({ id: r.out }) + '<div style="margin-top:3px">' + r.mats.map(([id, n]) => '<span style="color:' + (countItem(id) >= n ? '#7ad89a' : '#ff8a8a') + '">' + ITEMS[id].n + ' ' + countItem(id) + '/' + n + '</span>').join(' · ') + '</div></div><div class="gold">⛁ ' + craftGold(r) + '</div></div>'; }).join('');
    const s = this.screen('<div class="panel" style="width:min(620px,96vw)"><h2>' + STATION_N[st] + ': крафт</h2><div class="gold" style="text-align:right">⛁ ' + S.p.gold + '</div><div class="list" style="max-height:56vh;overflow:auto">' + rows + '</div><div class="muted" style="margin-top:4px">Материалы добываются из врагов, руды, трав и сундуков.</div><button class="btn" id="bk" style="margin-top:8px">Назад</button></div>', '', 'craft');
    s.querySelectorAll('[data-r]').forEach(e => e.onclick = () => { craft(RECIPES[+e.dataset.r]); this.show_craft(); }); s.querySelector('#bk').onclick = () => this.close();
  },
  openEnchant() { if (G.mode !== 'ui') G.mode = 'ui'; this.from = 'play'; this.name = 'ench'; this.esel = 0; this.ekind = null; this.show_ench(); },
  show_ench() {
    const items = []; Object.keys(S.eq).forEach(k => { if (S.eq[k]) items.push({ it: S.eq[k], slot: k }); }); S.inv.forEach(it => { const d = ITEMS[it.id]; if (isGear(d)) items.push({ it, slot: d.t }); });
    if (!items[this.esel]) this.esel = 0; const cur = items[this.esel];
    let det = '<span class="muted">Нет снаряжения.</span>', opts = '';
    if (cur) {
      const it = cur.it, l = it.en ? it.en.l : 0; det = itemStatsHtml(it);
      const ks = Object.keys(ENCH).filter(k => ENCH[k].slots.includes(cur.slot));
      opts = ks.map(k => { const nl = (it.en && it.en.k === k) ? l + 1 : 1; if (nl > 3) return '<div class="it" style="opacity:.5;cursor:default"><div class="grow"><b>' + ENCH[k].n + '</b> — максимум</div></div>'; const c = enchCost(nl), ok = S.p.gold >= c.gold && countItem('essence') >= c.ess;
        return '<div class="it" data-e="' + k + '" style="' + (ok ? '' : 'opacity:.6') + '"><div class="grow"><b>' + ENCH[k].n + ' ' + nl + '</b><br><span class="muted">' + ENCH[k].d(nl) + (it.en && it.en.k !== k ? ' · заменит текущее' : '') + '</span></div><div style="text-align:right"><span class="gold">⛁ ' + c.gold + '</span><br><span style="color:' + (countItem('essence') >= c.ess ? '#7ad89a' : '#ff8a8a') + '">Эссенция ' + countItem('essence') + '/' + c.ess + '</span></div></div>'; }).join('');
    }
    const s = this.screen('<div class="panel" style="width:min(680px,96vw)"><h2>Зачарование</h2><div class="row" style="align-items:flex-start;flex-wrap:wrap;justify-content:center;gap:12px"><div class="grid" style="grid-template-columns:repeat(5,48px)">' + items.map((o, i) => '<div class="cell' + (i === this.esel ? ' sel' : '') + '" data-i="' + i + '"><img src="' + itemIcon(ITEMS[o.it.id]) + '">' + (o.it.en ? '<span style="position:absolute;right:1px;top:-2px;color:#b48aff;font-size:11px">✦</span>' : '') + '</div>').join('') + '</div><div style="flex:1;min-width:280px">' + det + '<div class="list" style="margin-top:8px">' + opts + '</div></div></div><div class="muted" style="margin-top:6px">Эссенция падает с элитных врагов (★), боссов и создаётся здесь из кристаллов, осколков пепла и трав.</div><button class="btn" id="bk" style="margin-top:8px">Назад</button></div>', '', 'ench');
    s.querySelectorAll('.cell[data-i]').forEach(c => c.onclick = () => { this.esel = +c.dataset.i; SND.play('click'); this.show_ench(); });
    s.querySelectorAll('[data-e]').forEach(e => e.onclick = () => { const it = cur.it, k = e.dataset.e, nl = (it.en && it.en.k === k) ? it.en.l + 1 : 1, c = enchCost(nl); if (S.p.gold < c.gold || countItem('essence') < c.ess) return G.toast('Не хватает золота или эссенции'); S.p.gold -= c.gold; removeItem('essence', c.ess); it.en = { k, l: nl }; SND.play('levelup'); G.toast('Зачаровано: ' + ENCH[k].n + ' ' + nl, 'gold'); clampVitals(); this.show_ench(); });
    s.querySelector('#bk').onclick = () => this.close();
  },
  show_talents() {
    const left = talLeft(), near = atTower();
    const rows = Object.keys(TAL).map(id => { const r = talent(id); return '<div class="it" data-t="' + id + '" style="cursor:' + (near && left && r < 3 ? 'pointer' : 'default') + (r >= 3 ? ';opacity:.75' : '') + '"><div class="grow"><b>' + TAL[id].n + '</b> <span class="gold">' + '●'.repeat(r) + '○'.repeat(3 - r) + '</span><br><span class="muted">' + TAL[id].d + '</span></div></div>'; }).join('');
    const s = this.screen('<div class="panel" style="width:min(620px,96vw)"><h2>Таланты</h2><div class="row" style="justify-content:space-between"><span>Свободных очков: <b class="gold">' + left + '</b> <span class="muted">(1 за каждый уровень)</span></span></div>' + (near ? '' : '<div style="color:#ffb06a;margin:4px 0">Тратить очки можно только у башни сохранения.</div>') + '<div class="list" style="max-height:54vh;overflow:auto">' + rows + '</div><button class="btn" id="bk" style="margin-top:8px">Назад</button></div>', '', 'tal');
    s.querySelectorAll('[data-t]').forEach(e => e.onclick = () => { addTalent(e.dataset.t); this.show_talents(); }); s.querySelector('#bk').onclick = () => { this.name = 'char'; this.show_char(); };
  }
});
const _sc0 = UI.show_char;
UI.show_char = function () {
  _sc0.call(this); const s = this.cur; if (!s) return; const h = s.querySelector('h2'); if (!h) return;
  const near = atTower(), n = S.p.pts + S.p.spts + talLeft();
  const bar = document.createElement('div'); bar.style.cssText = 'text-align:center;margin:6px 0'; bar.innerHTML = '<button class="btn sm" id="tbtn">Таланты (' + talLeft() + ')</button>' + (n ? ' <span style="color:' + (near ? '#7ad89a' : '#ffb06a') + '">' + (near ? 'Вы у башни — можно тратить очки' : 'Очки тратятся только у башни сохранения') + '</span>' : '');
  h.after(bar); s.querySelector('#tbtn').onclick = () => this.show_talents();
  // навыки: показываем только текущей книги
  const ids = new Set(HOTBAR); s.querySelectorAll('[data-sk]').forEach(b => { if (!ids.has(b.dataset.sk)) { const row = b.closest('.list'); if (row) row.style.display = 'none'; } });
};
// башня: меню действий
const _int0 = interact;
interact = function (near) {
  if (near.k !== 'npc' && near.o.t === 'door') { const o = near.o; SND.play('click'); saveGame(0, true); loadMap(o.to, o.tx, o.ty, false, G.mid); return; }
  if (near.k !== 'npc' && near.o.t === 'save') {
    _int0(near);
    const pts = S.p.pts + S.p.spts + talLeft();
    if (pts > 0) G.say([['', 'У башни можно распределить очки: ' + [S.p.pts && 'характеристик ' + S.p.pts, S.p.spts && 'навыков ' + S.p.spts, talLeft() && 'талантов ' + talLeft()].filter(Boolean).join(', ') + '.'], { choices: [['Открыть персонажа', () => { setTimeout(() => { G.mode = 'ui'; UI.from = 'play'; UI.name = 'char'; UI.show_char(); }, 30); }], ['Позже', () => { }]] }]);
    return;
  }
  return _int0(near);
};

// запоминаем переходы региона, чтобы карта показывала, какой мост куда ведёт, даже для других регионов
(function () { const _lm = loadMap; loadMap = function () { const r = _lm.apply(this, arguments); try { if (G.map && REGIONS[G.mid]) { S.exits = S.exits || {}; S.exits[G.mid] = (G.map.exits || []).map(e => ({ x: e.x, y: e.y, w: e.w, h: e.h, to: e.to })); } } catch (e) { } return r; }; })();
