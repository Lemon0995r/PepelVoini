'use strict';
// ---------- Новые NPC, лавки и мини-игры ----------
Object.assign(ITEMS, {
  fish: { id: 'fish', n: 'Свежая рыба', t: 'cons', ic: 'fish', col: '#8ab8d8', price: 14, heal: 38, d: 'Запечённая рыба. Лечит 38 здоровья.' },
  pearl: { id: 'pearl', n: 'Речная жемчужина', t: 'mat', ic: 'gem', col: '#f0f0ff', price: 160, d: 'Редкая находка. Дорого стоит.' }
});
Object.assign(ICONS, { fish(P, it, h, col) { P(col, 2, 6, 10, 5); P(shade(col, 40), 4, 5, 6, 2); P(shade(col, -40), 4, 10, 6, 1); P(col, 12, 4, 3, 3); P(col, 12, 9, 3, 3); P('#111', 4, 7); P('#fff', 3, 7); } });
Object.assign(NPCS, {
  seyra: { n: 'Чародейка Сейра', hum: 'seyra', role: 'Зачарователь', shop: 'seyra', ench: 1, craft: 'ench' },
  noel: { n: 'Архивариус Ноэль', hum: 'noel', role: 'Хранитель книг', shop: 'noel' },
  kenn: { n: 'Кенн-Игрок', hum: 'kenn', role: 'Игрок в кости', acts: ['dice'] },
  tomas: { n: 'Рыбак Томас', hum: 'tomas', role: 'Рыбак', acts: ['fish'] },
  dorn: { n: 'Охотник Дорн', hum: 'dorn', role: 'Заказы на охоту', acts: ['bounty'] },
  tarin: { n: 'Лучница Тарин', hum: 'tarin', role: 'Тир', acts: ['shoot'] },
  zafir: { n: 'Зафир', hum: 'zafir', role: 'Странствующий торговец', shop: 'zafir', acts: ['memory'] },
  vera: { n: 'Хозяйка Вера', hum: 'vera', role: 'Таверна', shop: 'vera', acts: ['rest', 'rumor'] }
});
NPCS.brogar.craft = 'forge'; NPCS.liara.craft = 'tailor'; NPCS.mirena.craft = 'alch';
const _stk = {}; ['liara'].forEach(k => { _stk[k] = SHOPS[k].stock; });
SHOPS.liara.stock = () => _stk.liara().concat(['fish']);
SHOPS.noel = { n: 'Книжная лавка Ноэль', stock: () => { const out = []; Object.keys(BOOKDEF).forEach(sc => { out.push('tome_' + sc + '1'); if (F('jungle_done') || S.p.lvl >= 8) out.push('tome_' + sc + '2'); if (F('winter_done') || S.p.lvl >= 14) out.push('tome_' + sc + '3'); }); return out.filter(i => i !== 'tome_fire1' || !S.eq.book || S.eq.book.id !== 'tome_fire1'); } };
SHOPS.seyra = { n: 'Лавка чародейки', stock: () => ['essence', 'staff_holy', 'staff_novice', 'staff_arcane', 'scroll_fire', 'potion_mp2'] };
SHOPS.vera = { n: 'Таверна «Пьяный гоблин»', stock: () => ['bread', 'fish', 'potion_hp', 'potion_mp'] };
SHOPS.zafir = { n: 'Караван Зафира', stock: () => { const pool = ['ring_str', 'ring_dex', 'ring_int', 'amulet_vit', 'amulet_guard', 'amulet_sand', 'bow_elven', 'dag_viper', 'staff_storm', 'axe_battle', 'hammer_war', 'spear_halberd', 'armor_scale', 'robe_arcane', 'potion_str', 'potion_def', 'elixir', 'essence', 'tome_storm2', 'tome_frost2', 'tome_holy2', 'bag2']; const seed = Math.floor((S.time || 0) / 600), r = mulberry32(seed * 7 + 13), out = []; while (out.length < 7) { const k = pool[Math.floor(r() * pool.length)]; if (!out.includes(k)) out.push(k); } return out; } };
Object.assign(IDLE, {
  seyra: () => [['Сейра', 'Магия не берётся из воздуха. Принеси эссенцию, и я вплету в твоё снаряжение силу.']],
  noel: () => [['Ноэль', 'Книга хранит заклинания. Посох лишь усиливает их, и только если школа совпадает.']],
  kenn: () => [['Кенн', 'Золото любит смелых. Сыграем?']],
  tomas: () => [['Томас', 'Рыба сегодня клюёт. Ну, или это опять ботинок.']],
  dorn: () => [['Дорн', 'Чудовищ вокруг всё больше. Кто-то должен их считать. Я плачу за каждую голову.']],
  tarin: () => [['Тарин', 'Меткость приходит с тренировкой. Хочешь проверить глаз?']],
  zafir: () => [['Зафир', 'Мой караван обходит весь мир! Товар у меня каждый день разный.']],
  vera: () => [['Вера', 'Заходи, герой. Еда горячая, постель мягкая, слухи свежие.']]
});
const RUMORS = ['Говорят, в пещерах прячутся тайники. Ищи трещины в стенах и странные камни.', 'Элитные твари (отмечены ★) иногда роняют эссенцию для зачарований.', 'Посох школы, что совпадает с твоей книгой, открывает усиленное заклинание.', 'Очки характеристик можно тратить только у башен сохранения. Они же лечат.', 'Дорн платит за охоту. Один заказ за раз, зато щедро.', 'Бездонная сумка есть у каравана Зафира. Но она дорогая.', 'Боссы не любят, когда уходят с поля боя. Выход закрывается до самой победы.'];
const ACTS = {
  dice: { label: 'Сыграть в кости', run() { UI.go('dice'); } }, fish: { label: 'Порыбачить', run() { UI.go('fish'); } }, shoot: { label: 'Стрелковый тир (10 зол.)', run() { UI.go('shoot'); } },
  memory: { label: 'Игра рун (память)', run() { UI.go('memory'); } }, bounty: { label: 'Заказы на охоту', run() { UI.go('bounty'); } },
  rest: { label: 'Отдохнуть и сохраниться (20 зол.)', run() { if (S.p.gold < 20) return G.toast('Не хватает золота'); S.p.gold -= 20; const st = stats(); S.p.hp = st.maxhp; S.p.mp = st.maxmp; saveGame(0, true); SND.play('heal'); G.toast('Вы отдохнули. Игра сохранена.', 'gold'); } },
  rumor: { label: 'Послушать слухи', run() { G.say([['Вера', RUMORS[Math.floor(Math.random() * RUMORS.length)]]]); } }
};
Object.assign(UI, {
  go(name) { if (G.mode !== 'ui') G.mode = 'ui'; this.from = 'play'; this.name = name; this['show_' + name](); },
  stopMini() { if (this._raf) cancelAnimationFrame(this._raf); this._raf = 0; if (this._mt) clearInterval(this._mt); this._mt = 0; },
  mini(title, body, extra) { this.stopMini(); const s = this.screen('<div class="panel" style="width:min(520px,96vw)"><h2>' + title + '</h2><div class="gold" style="text-align:right">⛁ ' + S.p.gold + '</div>' + body + '<button class="btn" id="bk" style="margin-top:8px">Уйти</button></div>', '', 'mini'); s.querySelector('#bk').onclick = () => { this.stopMini(); this.close(); }; return s; },
  // ----- кости -----
  show_dice(msg, d1, d2) {
    this.dbet = this.dbet || 20; const bets = [10, 20, 50, 100, 250];
    const s = this.mini('Кости Кенна', '<div style="text-align:center;font-size:40px;margin:8px">' + (d1 ? '🎲 ' + d1 + ' + ' + d2 + ' = <b>' + (d1 + d2) + '</b>' : '🎲 🎲') + '</div><div style="text-align:center;min-height:24px;color:#ffd24a">' + (msg || 'Ставь на сумму двух кубиков') + '</div><div class="row" style="justify-content:center;gap:6px;margin:8px 0">' + bets.map(b => '<button class="btn sm' + (b === this.dbet ? ' sel' : '') + '" data-b="' + b + '">' + b + '</button>').join('') + '</div><div class="row" style="justify-content:center;gap:8px"><button class="btn" data-g="low">Меньше 7 (×2)</button><button class="btn" data-g="seven">Ровно 7 (×5)</button><button class="btn" data-g="high">Больше 7 (×2)</button></div>');
    s.querySelectorAll('[data-b]').forEach(b => b.onclick = () => { this.dbet = +b.dataset.b; this.show_dice(msg, d1, d2); });
    s.querySelectorAll('[data-g]').forEach(b => b.onclick = () => {
      const bet = this.dbet; if (S.p.gold < bet) return G.toast('Не хватает золота'); S.p.gold -= bet; const a = rint(1, 6), c = rint(1, 6), sum = a + c, g = b.dataset.g; SND.play('click');
      const win = g === 'low' ? sum < 7 : g === 'high' ? sum > 7 : sum === 7, mul = g === 'seven' ? 5 : 2;
      if (win) { S.p.gold += bet * mul; SND.play('coin'); this.show_dice('Победа! +' + bet * (mul - 1) + ' зол.', a, c); } else this.show_dice('Не повезло. −' + bet + ' зол.', a, c);
    });
  },
  // ----- рыбалка -----
  show_fish() {
    const F_ = this.fs = { cast: 0, got: [], pos: 0, zc: .5, zw: .22, dir: 1, active: false };
    const s = this.mini('Рыбалка', '<div id="fmsg" style="text-align:center;min-height:22px;color:#ffd24a">Закинуть удочку стоит 5 зол. Всего 5 забросов.</div><div style="position:relative;height:30px;background:#10202c;border:2px solid #8ab8d8;margin:10px 0"><div id="fzone" style="position:absolute;top:0;bottom:0;background:#3aa86a"></div><div id="fmark" style="position:absolute;top:-4px;bottom:-4px;width:6px;background:#fff"></div></div><div class="row" style="justify-content:center"><button class="btn" id="fgo">Забросить (5 зол.)</button><button class="btn" id="fhit" disabled>ПОДСЕЧЬ!</button></div><div id="flist" class="muted" style="text-align:center;margin-top:6px"></div>');
    const mark = s.querySelector('#fmark'), zone = s.querySelector('#fzone'), msg = s.querySelector('#fmsg'), go = s.querySelector('#fgo'), hit = s.querySelector('#fhit'); let last = performance.now();
    const place = () => { zone.style.left = (F_.zc - F_.zw / 2) * 100 + '%'; zone.style.width = F_.zw * 100 + '%'; }; place();
    const loop = now => { const dt = (now - last) / 1000; last = now; if (F_.active) { F_.pos += F_.dir * dt * (.9 + F_.cast * .15); if (F_.pos > 1) { F_.pos = 1; F_.dir = -1; } if (F_.pos < 0) { F_.pos = 0; F_.dir = 1; } mark.style.left = F_.pos * 100 + '%'; } this._raf = requestAnimationFrame(loop); }; this._raf = requestAnimationFrame(loop);
    go.onclick = () => { if (F_.active || F_.cast >= 5) return; if (S.p.gold < 5) return G.toast('Не хватает золота'); S.p.gold -= 5; F_.cast++; F_.active = true; F_.pos = 0; F_.dir = 1; F_.zc = .2 + Math.random() * .6; F_.zw = Math.max(.1, .24 - F_.cast * .02); place(); hit.disabled = false; go.disabled = true; msg.textContent = 'Заброс ' + F_.cast + '/5: жми, когда поплавок в зелёной зоне!'; SND.play('click'); };
    hit.onclick = () => { if (!F_.active) return; F_.active = false; hit.disabled = true; const d = Math.abs(F_.pos - F_.zc); let r = null; if (d < F_.zw / 2) { r = d < F_.zw * .12 && Math.random() < .4 ? 'pearl' : 'fish'; addItem(r, 1) || giveReward(r, 1); F_.got.push(r); SND.play('coin'); msg.textContent = r === 'pearl' ? 'Жемчужина!' : 'Поймал рыбу!'; } else { msg.textContent = 'Сорвалась...'; }
      s.querySelector('#flist').textContent = 'Улов: рыба ×' + F_.got.filter(x => x === 'fish').length + ', жемчуг ×' + F_.got.filter(x => x === 'pearl').length; if (F_.cast >= 5) { msg.textContent += ' Рыбалка окончена.'; go.disabled = true; } else go.disabled = false; };
  },
  // ----- тир -----
  show_shoot() {
    if (S.p.gold < 10) { this.close(); return G.toast('Нужно 10 золота'); } S.p.gold -= 10;
    const s = this.mini('Тир Тарин', '<div class="muted" style="text-align:center">Попадай в мишени (кольца дают больше очков). Красные — бомбы, не трогай! 20 секунд.</div><canvas id="shc" width="440" height="230" style="width:100%;background:#1a2a1a;border:2px solid #6aaa4a;touch-action:none;cursor:crosshair"></canvas><div id="shs" style="text-align:center">Очки: 0 · Время: 20</div>');
    const c = s.querySelector('#shc'), x = c.getContext('2d'), st = { score: 0, t: 20, ts: [], sp: 0, over: false };
    c.onpointerdown = e => { if (st.over) return; const r = c.getBoundingClientRect(), mx = (e.clientX - r.left) / r.width * 440, my = (e.clientY - r.top) / r.height * 230; SND.play('swing'); for (let i = st.ts.length - 1; i >= 0; i--) { const t = st.ts[i], d = Math.hypot(t.x - mx, t.y - my); if (d < t.r) { st.score += t.bomb ? -3 : d < t.r * .35 ? 3 : d < t.r * .7 ? 2 : 1; if (t.bomb) SND.play('hurt'); else SND.play('hit'); st.ts.splice(i, 1); break; } } };
    let last = performance.now();
    const loop = now => {
      const dt = Math.min(.05, (now - last) / 1000); last = now; if (!st.over) { st.t -= dt; st.sp -= dt; if (st.sp <= 0) { st.sp = .5 + Math.random() * .5; const dir = Math.random() < .5 ? 1 : -1; st.ts.push({ x: dir > 0 ? -20 : 460, y: 30 + Math.random() * 170, vx: dir * (60 + Math.random() * 80 + (20 - st.t) * 3), r: 14 + Math.random() * 8, bomb: Math.random() < .2 }); } st.ts.forEach(t => t.x += t.vx * dt); st.ts = st.ts.filter(t => t.x > -30 && t.x < 470); if (st.t <= 0) { st.over = true; const g = Math.max(0, st.score) * 4; S.p.gold += g; gainXP(Math.max(0, st.score) * 2); let m = 'Итог: ' + st.score + ' очков, награда ' + g + ' зол.'; if (st.score >= 20 && !F('shoot_prize')) { S.flags.shoot_prize = 1; giveReward('bow_long', 1); m += ' Приз: Длинный лук!'; } s.querySelector('#shs').textContent = m; } else s.querySelector('#shs').textContent = 'Очки: ' + st.score + ' · Время: ' + Math.ceil(st.t); }
      x.fillStyle = '#1a2a1a'; x.fillRect(0, 0, 440, 230); st.ts.forEach(t => { if (t.bomb) { x.fillStyle = '#c03030'; x.beginPath(); x.arc(t.x, t.y, t.r, 0, 6.3); x.fill(); x.fillStyle = '#fff'; x.fillRect(t.x - 2, t.y - 8, 4, 16); x.fillRect(t.x - 8, t.y - 2, 16, 4); } else { [[1, '#fff'], [.7, '#c83a3a'], [.35, '#ffd24a']].forEach(([k, col]) => { x.fillStyle = col; x.beginPath(); x.arc(t.x, t.y, t.r * k, 0, 6.3); x.fill(); }); } });
      this._raf = requestAnimationFrame(loop);
    }; this._raf = requestAnimationFrame(loop);
  },
  // ----- руны (память) -----
  show_memory(msg) {
    const cols = ['#d84a4a', '#4a8ad8', '#4ad86a', '#d8c84a'], st = this.ms = this.ms || { seq: [], inp: 0, play: false, round: 0 }; if (!st.play) { st.seq = []; st.inp = 0; st.round = 0; }
    const s = this.mini('Игра рун Зафира', '<div id="mm" style="text-align:center;min-height:24px;color:#ffd24a">' + (msg || 'Запомни порядок рун и повтори. До 8 раундов. Каждый раунд — золото.') + '</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0">' + cols.map((c, i) => '<button class="btn" data-m="' + i + '" style="height:70px;background:' + c + '55;border-color:' + c + '"></button>').join('') + '</div><div class="row" style="justify-content:center"><button class="btn" id="mgo">' + (st.play ? '...' : 'Начать') + '</button></div>');
    const btns = [...s.querySelectorAll('[data-m]')], mm = s.querySelector('#mm'); const flash = (i, on) => { btns[i].style.background = on ? cols[i] : cols[i] + '55'; };
    const showSeq = () => { st.inp = 0; st.lock = true; let k = 0; mm.textContent = 'Смотри...'; this._mt = setInterval(() => { if (k > 0) flash(st.seq[k - 1], false); if (k >= st.seq.length) { clearInterval(this._mt); this._mt = 0; st.lock = false; mm.textContent = 'Повтори!'; return; } flash(st.seq[k], true); SND.play('click'); k++; }, 600); };
    s.querySelector('#mgo').onclick = () => { if (st.play) return; st.play = true; st.seq = [rint(0, 3)]; st.round = 1; showSeq(); s.querySelector('#mgo').textContent = '...'; };
    btns.forEach((b, i) => b.onclick = () => {
      if (!st.play || st.lock) return; flash(i, true); setTimeout(() => flash(i, false), 150); SND.play('click');
      if (st.seq[st.inp] !== i) { st.play = false; SND.play('hurt'); this.show_memory('Ошибка! Пройдено раундов: ' + (st.round - 1)); return; }
      st.inp++; if (st.inp >= st.seq.length) { const g = st.round * 12; S.p.gold += g; SND.play('coin'); if (st.round >= 8) { st.play = false; const n = F('mem_prize') ? 1 : 2; S.flags.mem_prize = 1; giveReward('essence', n); this.show_memory('Победа! Эссенция ×' + n); return; } st.seq.push(rint(0, 3)); st.round++; mm.textContent = 'Верно! +' + g + ' зол. Раунд ' + st.round; st.lock = true; setTimeout(showSeq, 700); }
    });
  },
  // ----- заказы на охоту -----
  show_bounty() {
    const POOL = [['wolf', 'Волков', 6, 120, 1], ['goblin', 'Гоблинов', 8, 100, 1], ['bandit', 'Разбойников', 5, 170, 1], ['orc', 'Орков', 3, 260, 3], ['spider', 'Пауков', 6, 190, 4], ['skeleton', 'Скелетов', 6, 230, 6], ['scorpion', 'Скорпионов', 6, 260, 8], ['jackal', 'Шакалов', 6, 220, 8], ['frostwolf', 'Ледяных волков', 5, 340, 11], ['ashwar', 'Пепельных воинов', 5, 480, 14]];
    const b = S.bounty; let body;
    if (b) { const done = b.have >= b.n; body = '<div class="it" style="cursor:default"><div class="grow"><b>Заказ: ' + b.name + ' ×' + b.n + '</b><br>Убито: <b class="' + (done ? 'gold' : '') + '">' + Math.min(b.have, b.n) + ' / ' + b.n + '</b><br>Награда: ⛁ ' + b.gold + ', опыт ' + b.xp + ', эссенция</div></div>' + (done ? '<button class="btn" id="bturn">Сдать заказ</button>' : '<div class="muted">Вернись, когда выполнишь.</div>') + '<button class="btn sm" id="bdrop" style="margin-top:6px">Отказаться</button>'; }
    else { const r = mulberry32(Math.floor((S.time || 0) / 300) * 31 + 5), av = POOL.filter(p => S.p.lvl >= p[4] && S.p.lvl <= p[4] + 12), pick = []; while (pick.length < Math.min(3, av.length)) { const p = av[Math.floor(r() * av.length)]; if (!pick.includes(p)) pick.push(p); }
      body = '<div class="list">' + pick.map((p, i) => '<div class="it" data-p="' + i + '"><div class="grow"><b>Убить: ' + p[1] + ' ×' + p[2] + '</b><br><span class="muted">Награда: ⛁ ' + Math.round(p[3] * p[2] / 3 * (1 + S.p.lvl * .08)) + ' + эссенция</span></div></div>').join('') + '</div>'; this._bp = pick; }
    const s = this.mini('Заказы Дорна', body);
    const t = s.querySelector('#bturn'); if (t) t.onclick = () => { S.p.gold += b.gold; gainXP(b.xp); giveReward('essence', 1); S.bounty = null; S.bountyDone = (S.bountyDone || 0) + 1; SND.play('levelup'); G.toast('Заказ выполнен!', 'gold'); this.show_bounty(); };
    const dr = s.querySelector('#bdrop'); if (dr) dr.onclick = () => { S.bounty = null; this.show_bounty(); };
    s.querySelectorAll('[data-p]').forEach(e => e.onclick = () => { const p = this._bp[+e.dataset.p]; S.bounty = { t: p[0], name: p[1], n: p[2], have: 0, gold: Math.round(p[3] * p[2] / 3 * (1 + S.p.lvl * .08)), xp: p[2] * 14 + S.p.lvl * 10 }; SND.play('click'); G.toast('Заказ принят: ' + p[1] + ' ×' + p[2], 'gold'); this.show_bounty(); });
  }
});
const _ke3 = killEnemy;
killEnemy = function (e) { const was = e.dead; _ke3(e); if (!was && S.bounty && e.t === S.bounty.t && !e.minion && S.bounty.have < S.bounty.n) { S.bounty.have++; UI.toast('Заказ Дорна: ' + S.bounty.have + ' / ' + S.bounty.n); } };
