'use strict';
// ---------- Интерфейс: HUD, диалоги, всплывающие сообщения, главное и пауза-меню, смерть, победа ----------
const $ = id => document.getElementById(id);
const UI = {
  cur: null, from: 'play', hudEl: null, R: {}, dlgEl: null, choiceN: 0,
  root() { return $('ui'); },
  toast(txt, cls) {
    const box = $('toast'); if (!box) return; const d = document.createElement('div'); d.className = 't ' + (cls || ''); d.textContent = txt; box.appendChild(d);
    while (box.children.length > 3) box.removeChild(box.firstChild);
    setTimeout(() => { d.style.transition = 'opacity .4s'; d.style.opacity = 0; setTimeout(() => d.remove(), 450); }, 2600);
  },
  // ----- HUD -----
  showHud(on) {
    const h = $('hud'); h.style.display = on ? 'block' : 'none'; if (!on) return;
    if (this.hudEl) return; this.hudEl = 1;
    h.innerHTML = '<div class="bars"><div class="lvl"></div><div class="bar hp"><i></i><span></span></div><div class="bar mp"><i></i><span></span></div><div class="bar xp"><i></i></div></div>' +
      '<div class="status"></div><div class="info"></div><div class="quest"></div><div class="boss" style="display:none"><div class="bn"></div><div class="bar"><i></i></div></div><div class="hot"></div><div class="hint" style="display:none"></div><div class="banner"></div>';
    const q = s => h.querySelector(s); this.R = { lvl: q('.lvl'), hp: q('.hp i'), hpt: q('.hp span'), mp: q('.mp i'), mpt: q('.mp span'), xp: q('.xp i'), st: q('.status'), info: q('.info'), quest: q('.quest'), boss: q('.boss'), bn: q('.bn'), bb: q('.boss i'), hot: q('.hot'), hint: q('.hint'), ban: q('.banner') };
    const R = this.R; R.ban.style.cssText = 'position:absolute;left:0;right:0;top:34%;text-align:center;font-size:34px;color:#fff;text-shadow:2px 2px 0 #000,0 0 18px #000;letter-spacing:3px;opacity:0;transition:opacity .6s;pointer-events:none';
    // слоты: 4 навыка + 2 зелья
    const slots = [0, 1, 2, 3].map(i => '<div class="slot" data-i="' + i + '"><b>' + (i + 1) + '</b><img><em></em><div class="cd"></div></div>').join('') + '<div class="slot" data-p="hp"><b>Q</b><img><em></em></div><div class="slot" data-p="mp"><b>R</b><img><em></em></div>';
    R.hot.innerHTML = slots; this.slotEls = [...R.hot.children];
    this.slotEls.forEach(el => {
      el.style.pointerEvents = 'auto'; el.onclick = () => { if (G.mode !== 'play') return; const i = el.dataset.i; if (i !== undefined) { if (HOTBAR[+i]) PRESS['Digit' + (+i + 1)] = 1; } else usePotion(el.dataset.p); };
      if (el.dataset.p) el.querySelector('img').src = itemIcon({ ic: 'potion', col: el.dataset.p === 'hp' ? '#dd3344' : '#3a8aff' });
    });
  },
  hudTick() {
    const R = this.R; if (!S || !G.P || !R.hp || G.mode === 'title') return; const p = S.p, st = stats(), P = G.P;
    const k = [p.hp | 0, st.maxhp, p.mp | 0, st.maxmp, p.xp | 0, p.lvl, p.gold, G.mid, G.near && G.near.label, (trackedQuest() || {}).txt, G.boss && (G.boss.hp | 0), P.poison > 0, P.slow > 0, G.mode, p.pts, S.inv.length, HOTBAR.map(i => (P.cd[i] > 0) + '' + (p.mp >= SKILLS[i].mp) + i).join(), p.spts, (typeof talLeft === 'function' ? talLeft() : 0), countItem('potion_hp'), countItem('potion_mp'), G.banner && G.banner.name].join('|');
    const cdk = HOTBAR.map(i => Math.round((P.cd[i] || 0) * 10)).join(); if (k === this._k && cdk === this._cdk) return; this._k = k; this._cdk = cdk;
    R.lvl.textContent = 'Арион · ур. ' + p.lvl + ((p.pts || p.spts || (typeof talLeft === 'function' && talLeft())) ? '  (есть очки — у башни)' : '');
    R.hp.style.width = clamp(p.hp / st.maxhp, 0, 1) * 100 + '%'; R.hpt.textContent = (p.hp | 0) + ' / ' + st.maxhp;
    R.mp.style.width = clamp(p.mp / st.maxmp, 0, 1) * 100 + '%'; R.mpt.textContent = (p.mp | 0) + ' / ' + st.maxmp;
    R.xp.style.width = (p.lvl >= 20 ? 100 : clamp(p.xp / xpNeed(p.lvl), 0, 1) * 100) + '%';
    R.st.innerHTML = (P.poison > 0 ? '<span style="color:#5ad04a">☣ яд</span> ' : '') + (P.slow > 0 ? '<span style="color:#8ad8ff">❄ замедление</span>' : '');
    R.info.innerHTML = '<span class="gold">⛁ ' + p.gold + '</span><br>' + REGIONS[G.map.reg].n;
    const q = trackedQuest(); R.quest.innerHTML = q ? '<b>' + esc(q.t) + '</b>' + esc(q.txt) : '<span class="muted">Нет активных заданий (J)</span>';
    if (G.boss && !G.boss.dead) { R.boss.style.display = 'block'; R.bn.textContent = BOSSES[G.boss.bid].n + (G.boss.shielded ? ' — щит пепла!' : ''); R.bb.style.width = clamp(G.boss.hp / G.boss.mhp, 0, 1) * 100 + '%'; } else R.boss.style.display = 'none';
    if (G.near && G.mode === 'play' && CFG.hints) { R.hint.style.display = 'block'; R.hint.textContent = (matchMedia('(pointer:coarse)').matches ? '[E] ' : 'E — ') + G.near.label; } else R.hint.style.display = 'none';
    this.slotEls.forEach(el => {
      const id = el.dataset.i !== undefined ? HOTBAR[+el.dataset.i] : null, em = el.querySelector('em'), cd = el.querySelector('.cd');
      if (el.dataset.i !== undefined) { const img = el.querySelector('img'); if (id) { const u = itemIcon(SKILLS[id]); if (img.getAttribute('src') !== u) img.src = u; img.style.visibility = 'visible'; } else { img.style.visibility = 'hidden'; el.classList.add('off'); em.textContent = ''; cd.style.height = 0; return; } }
      if (id) { const sk = SKILLS[id], lock = p.lvl < sk.unlock, c = P.cd[id] || 0; el.classList.toggle('off', lock || p.mp < sk.mp); em.textContent = lock ? '🔒' + sk.unlock : sk.mp; cd.style.height = c > 0 ? clamp(c / (sk.cd || 1), 0, 1) * 100 + '%' : 0; }
      else { const n = countItem(el.dataset.p === 'hp' ? 'potion_hp' : 'potion_mp') + (el.dataset.p === 'hp' ? countItem('potion_hp2') : countItem('potion_mp2')); em.textContent = n; el.classList.toggle('off', !n); }
    });
  },
  banner(txt) { const b = this.R.ban; if (!b) return; b.textContent = txt; b.style.opacity = 1; clearTimeout(this._bt); this._bt = setTimeout(() => b.style.opacity = 0, 2400); },
  // ----- диалог -----
  showDialog(on) {
    const r = this.root(); if (!on) { if (this.dlgEl) { this.dlgEl.remove(); this.dlgEl = null; } return; }
    if (this.dlgEl) return; const d = document.createElement('div'); d.id = 'dlg'; d.innerHTML = '<div class="box"><div class="who"></div><div class="tx"></div><div class="ch"></div><div class="nx">E / Пробел / клик ▶</div></div>';
    d.onclick = e => { if (!this.choiceN && !e.target.closest('.btn')) this.dlgAdvance(); }; r.appendChild(d); this.dlgEl = d;
  },
  dlgAdvance() { if (this.typing && this.typing.i < this.typing.s.length) { this.typing.i = this.typing.s.length; this.typing.el.textContent = this.typing.s; return; } if (G.mode === 'dlg' && !this.choiceN) G.dlgNext(); },
  dialogLine(who, text) {
    const d = this.dlgEl; if (!d) return; this.choiceN = 0; d.querySelector('.ch').innerHTML = ''; d.querySelector('.nx').style.display = 'block';
    const w = d.querySelector('.who'); w.textContent = who || ''; w.style.display = who ? 'block' : 'none'; const el = d.querySelector('.tx'); el.style.cssText = who ? '' : 'font-style:italic;color:#ccc';
    clearInterval(this._ty); const T = this.typing = { s: text, i: 0, el }; el.textContent = '';
    this._ty = setInterval(() => { T.i += 2; el.textContent = text.slice(0, T.i); if (T.i >= text.length) clearInterval(this._ty); }, 22);
  },
  dialogChoices(ch) {
    const d = this.dlgEl; if (!d) return; this.choiceN = ch.length; d.querySelector('.nx').style.display = 'none'; const box = d.querySelector('.ch'); box.innerHTML = '';
    ch.forEach(([label, fn], i) => { const b = document.createElement('button'); b.className = 'btn'; b.style.margin = '2px 0'; b.textContent = (i + 1) + '. ' + label; b.onclick = () => { this.choiceN = 0; SND.play('click'); fn(); }; box.appendChild(b); });
    this.choices = ch;
  },
  // ----- экраны -----
  screen(html, cls, id) { const r = this.root(); this.closeAll(true); const s = document.createElement('div'); s.className = 'scr ' + (cls || ''); if (id) s.id = id; s.innerHTML = html; r.appendChild(s); this.cur = s; return s; },
  closeAll(keepMode) { if (this.cur) { this.cur.remove(); this.cur = null; } if (!keepMode && G.mode === 'ui') G.mode = 'play'; this.tab = null; },
  pauseGame() { if (G.mode === 'play') { this.from = 'play'; G.mode = 'ui'; return true; } return false; },
  open(name) {
    if (G.mode === 'ui' && this.cur && this.name === name && this.from === 'play') return this.close();
    if (G.mode === 'play') { G.mode = 'ui'; this.from = 'play'; } else if (G.mode !== 'ui' && G.mode !== 'title') return;
    if (!S) return; this.name = name; SND.play('click'); this['show_' + name] && this['show_' + name]();
  },
  close() { SND.play('click'); this.closeAll(true); if (this.from === 'title') { G.mode = 'title'; this.title(); } else if (this.from === 'pause') { this.pause(true); } else G.mode = 'play'; this.name = null; },
  tabs(list, cur, key) { return '<div class="tabs">' + list.map(([id, n]) => '<div class="tab' + (id === cur ? ' on' : '') + '" data-tab="' + id + '">' + n + '</div>').join('') + '</div>'; },
  bindTabs(el, fn) { el.querySelectorAll('[data-tab]').forEach(t => t.onclick = () => { SND.play('click'); fn(t.dataset.tab); }); },
  // ----- главное меню -----
  title() {
    G.mode = 'title'; this.from = 'title'; this.showHud(false); SND.music('m_menu'); const hasSave = [0, 1, 2, 3].some(i => readSave(i));
    const s = this.screen('<div class="tcol"><div class="orn">✦ ━━━━━━━━ ✦</div><div class="logo2"><span>ПЕПЕЛ</span><span class="v">ВОЙНЫ</span></div><div class="orn">✦ ━━━━━━━━ ✦</div><div class="menu">' +
      (hasSave ? '<button class="btn" id="t_cont">Продолжить</button>' : '') + '<button class="btn" id="t_new">Новая игра</button>' + (hasSave ? '<button class="btn" id="t_load">Загрузить</button>' : '') +
      '<button class="btn" id="t_set">Настройки</button><button class="btn" id="t_help">Управление</button></div></div>', '', 'title');
    s.style.background = 'radial-gradient(ellipse at 30% 40%,#00000066 0,#000000f2 80%)';
    const b = id => s.querySelector('#' + id);
    if (b('t_cont')) b('t_cont').onclick = () => { SND.init(); let best = null, bt = 0; [0, 1, 2, 3].forEach(i => { const v = readSave(i); if (v && (v.saved || 0) >= bt) { bt = v.saved || 0; best = i; } }); UI.loading(() => loadGame(best)); };
    b('t_new').onclick = () => { SND.init(); UI.loading(() => G.newGame()); };
    if (b('t_load')) b('t_load').onclick = () => { SND.init(); this.name = 'saves'; this.show_saves(true); };
    b('t_set').onclick = () => { SND.init(); this.name = 'settings'; this.show_settings(); };
    b('t_help').onclick = () => { this.name = 'help'; this.show_help(); };
  },
  loading(fn) {
    const s = this.screen('<div style="text-align:center"><div class="logo" style="text-align:center;font-size:44px;margin:0 0 20px">ПЕПЕЛ ВОЙНЫ</div><div class="muted" id="ldt">Загрузка мира...</div><div class="bar" style="width:260px;margin:12px auto"><i id="ldb" style="background:#fff;width:0"></i></div><div class="muted" style="max-width:380px;margin:auto" id="ldh"></div></div>', '', 'loading');
    s.style.background = '#05070f'; const tips = ['Перекат даёт неуязвимость на долю секунды.', 'У каждого босса есть сигналы: следи за красными зонами.', 'Кузнец Брогар улучшает снаряжение за золото и руду.', 'Святилища лечат и сохраняют игру.', 'Туман скрывает врагов: ориентируйся по свету и звуку.'];
    s.querySelector('#ldh').textContent = 'Совет: ' + pick(tips); let n = 0; const bar = s.querySelector('#ldb'), iv = setInterval(() => { n += 20; bar.style.width = Math.min(n, 100) + '%'; }, 40);
    setTimeout(() => { clearInterval(iv); try { fn(); } catch (e) { console.error(e); this.title(); this.toast('Ошибка загрузки: ' + e.message); } }, 280);
  },
  show_help() {
    const s = this.screen('<div class="panel" style="width:min(520px,94vw)"><h2>Управление</h2><div class="list" style="line-height:1.7;font-size:15px">' +
      '<b>WASD / стрелки</b> — движение<br><b>ЛКМ / J-зона мыши</b> — атака в сторону курсора (серия из 3 ударов)<br><b>Пробел</b> — перекат (неуязвимость)<br><b>1–4</b> — навыки (огонь, вихрь, лечение, нова)<br><b>Q / R</b> — зелье здоровья / маны<br><b>E</b> — действие<br>' +
      '<b>I</b> — инвентарь · <b>C</b> — персонаж · <b>J</b> — журнал · <b>M</b> — карта · <b>Esc</b> — пауза<br><span class="muted">На телефоне: стик слева, кнопки справа.</span></div><button class="btn" id="bk" style="margin-top:12px">Назад</button></div>');
    s.querySelector('#bk').onclick = () => this.close();
  },
  // ----- пауза -----
  pause(again) {
    if (!again) { if (G.mode !== 'play') return; G.mode = 'ui'; } this.from = 'play'; this.name = 'pause'; SND.play('click');
    const s = this.screen('<div class="panel menu"><h2>Пауза</h2><button class="btn" id="p_r">Продолжить</button><button class="btn" id="p_i">Инвентарь</button><button class="btn" id="p_c">Персонаж</button><button class="btn" id="p_j">Журнал</button><button class="btn" id="p_m">Карта</button><button class="btn" id="p_s">Сохранить / загрузить</button><button class="btn" id="p_o">Настройки</button><button class="btn danger" id="p_t">В главное меню</button></div>');
    const b = id => s.querySelector('#' + id); b('p_r').onclick = () => { this.closeAll(); this.name = null; };
    const sub = n => () => { this.closeAll(true); this.from = 'pause'; this.name = n; this['show_' + n](); };
    b('p_i').onclick = sub('inv'); b('p_c').onclick = sub('char'); b('p_j').onclick = sub('quests'); b('p_m').onclick = sub('map'); b('p_s').onclick = sub('saves'); b('p_o').onclick = sub('settings');
    b('p_t').onclick = () => { if (confirm('Выйти в меню? Несохранённый прогресс будет потерян.')) { this.closeAll(true); G.boss = null; S = null; G.P = null; this.hudEl = null; this.title(); loadMap('capital', undefined, undefined, true); G.mode = 'title'; this.title(); } };
  },
  // ----- смерть / победа над боссом / концовка -----
  death() {
    SND.music(null); G.mode = 'dead'; this.showHud(true);
    const s = this.screen('<div style="text-align:center"><div style="font-size:54px;color:#c02a2a;text-shadow:3px 3px 0 #000;letter-spacing:4px">ВЫ ПАЛИ</div><div class="muted" style="margin:10px 0 18px">Арион теряет сознание. Пепел помнит...</div><div style="width:260px;margin:auto"><button class="btn" id="d_r">Возродиться у святилища</button><button class="btn" id="d_l">Загрузить игру</button><button class="btn danger" id="d_t">В главное меню</button></div></div>', '', 'death');
    s.style.background = 'rgba(30,0,0,.82)'; s.querySelector('#d_r').onclick = () => G.respawn();
    s.querySelector('#d_l').onclick = () => { this.from = 'death'; this.name = 'saves'; this.show_saves(); };
    s.querySelector('#d_t').onclick = () => { this.closeAll(true); S = null; G.P = null; G.boss = null; this.hudEl = null; loadMap('capital', undefined, undefined, true); this.title(); };
  },
  bossVictory(name, xp, gold, drops) {
    const d = document.createElement('div'); d.className = 'scr clear'; d.style.cssText = 'pointer-events:none;flex-direction:column;animation:tin .4s'; d.innerHTML = '<div style="font-size:42px;color:#fff;text-shadow:3px 3px 0 #000,0 0 22px #ff9a2a;letter-spacing:3px">ПОБЕДА</div><div style="font-size:18px;text-shadow:1px 1px 0 #000;margin-top:6px">' + esc(name) + ' повержен</div><div style="font-size:14px;margin-top:8px;color:#cfe0ff;text-shadow:1px 1px 0 #000">+' + xp + ' опыта · +' + gold + ' золота' + (drops.length ? '<br>Добыча: ' + drops.map(esc).join(', ') : '') + '</div>';
    this.root().appendChild(d); setTimeout(() => { d.style.transition = 'opacity .8s'; d.style.opacity = 0; setTimeout(() => d.remove(), 900); }, 3600);
  },
  ending(en, key) {
    this.showHud(false); const mins = fmtTime(S.time);
    const s = this.screen('<div class="panel" style="width:min(560px,94vw);text-align:center"><div class="muted">КОНЦОВКА</div><h2 style="font-size:28px;color:#fff">' + esc(en.t) + '</h2><div style="line-height:1.5;margin:10px 0">' + esc(en.d) + '</div><div class="muted">Время игры: ' + mins + ' · Убито врагов: ' + S.kills + ' · Уровень: ' + S.p.lvl + '</div><div class="muted" style="margin-top:6px">Хроник найдено: ' + (S.pages || []).length + ' из ' + Object.keys(CHRONICLES).length + '</div><h2 style="margin-top:16px;font-size:24px">Пепел войны</h2><button class="btn" id="e_c">Продолжить исследование мира</button><button class="btn" id="e_t">В главное меню</button></div>', '', 'ending');
    s.style.background = 'rgba(2,3,10,.92)';
    s.querySelector('#e_c').onclick = () => { this.closeAll(true); G.mode = 'play'; this.hudEl = this.hudEl; this.showHud(true); SND.music(REGIONS[G.map.reg].music); };
    s.querySelector('#e_t').onclick = () => { this.closeAll(true); S = null; G.P = null; G.boss = null; this.hudEl = null; loadMap('capital', undefined, undefined, true); this.title(); };
  }
};
// ----- клавиши в интерфейсе -----
addEventListener('keydown', e => {
  if (typeof typing === 'function' && typing()) return;
  const c = e.code;
  if (G.mode === 'dlg') {
    if (['KeyE', 'Space', 'Enter'].includes(c) && !e.repeat) { e.preventDefault(); PRESS[c] = 0; UI.dlgAdvance(); }
    else if (/^Digit[1-9]$/.test(c) && UI.choiceN) { const i = +c.slice(5) - 1; if (UI.choices[i]) { PRESS[c] = 0; UI.choiceN = 0; UI.choices[i][1](); } }
    return;
  }
  if (G.mode === 'ui') {
    const map = { KeyI: 'inv', KeyJ: 'quests', KeyM: 'map', KeyC: 'char' };
    if (c === 'Escape') { PRESS[c] = 0; if (UI.name === 'pause' || !UI.name) { UI.closeAll(); UI.name = null; } else UI.close(); }
    else if (map[c] && UI.from === 'play' && UI.name !== 'saves' && UI.name !== 'settings') { PRESS[c] = 0; if (UI.name === map[c]) UI.close(); else { UI.closeAll(true); UI.name = map[c]; UI.from = 'play'; UI['show_' + map[c]](); } }
    return;
  }
  if (G.mode === 'title' && c === 'Escape' && UI.name) UI.close();
});
