'use strict';
// ---------- Звук: синтез по умолчанию + подстановка своих файлов ----------
// Приоритет: файл, загруженный в меню «Настройки → Звук» (хранится в IndexedDB)
//          > файл из папки assets/sounds/ (по manifest.json или по имени <id>.ogg/.mp3/.wav)
//          > встроенный синтезатор.
const SND = (() => {
  let ctx = null, master, gSfx, gMus, noiseBuf;
  const vol = { master: 0.8, sfx: 0.8, music: 0.5 };
  const custom = {};            // id -> { buf, name, src }
  const EXT = ['ogg', 'mp3', 'wav', 'm4a'];

  const NAMES = {
    swing: 'Взмах меча', hit: 'Удар по врагу', crit: 'Критический удар', hurt: 'Герой получает урон',
    death_enemy: 'Смерть врага', player_death: 'Смерть героя', roll: 'Перекат', fireball: 'Огненный шар',
    explosion: 'Взрыв', whirl: 'Вихрь', heal: 'Лечение', nova: 'Пепельная нова', pickup: 'Подбор предмета',
    coin: 'Монеты / покупка', equip: 'Экипировка', levelup: 'Новый уровень', quest_new: 'Новое задание',
    quest_done: 'Задание выполнено', chest: 'Сундук', door: 'Дверь / ворота', lever: 'Рычаг', click: 'Клик в меню',
    menu_open: 'Открытие меню', step: 'Шаги', boss_roar: 'Рёв босса', boss_phase: 'Смена фазы босса',
    ice: 'Лёд', dialog_blip: 'Звук реплик', save: 'Сохранение', ash_wave: 'Пепельная волна',
    break: 'Разрушение', alert: 'Враг заметил героя', ambient_wind: 'Окружение (ветер)',
    m_menu: 'Музыка: главное меню', m_city: 'Музыка: Столица', m_jungle: 'Музыка: Джунгли',
    m_fortress: 'Музыка: Крепость', m_desert: 'Музыка: Пустыня', m_winter: 'Музыка: Зима',
    m_ash: 'Музыка: Пепельный остров', m_boss: 'Музыка: босс', m_boss_final: 'Музыка: Пепельный Король',
    m_victory: 'Музыка: победа / финал'
  };
  const slots = Object.keys(NAMES).filter(k => k !== 'ambient_wind').map(id => ({ id, name: NAMES[id], music: id[0] === 'm' && id[1] === '_' }));

  // ----- инициализация -----
  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; return; }
    master = ctx.createGain(); gSfx = ctx.createGain(); gMus = ctx.createGain();
    gSfx.connect(master); gMus.connect(master); master.connect(ctx.destination);
    applyVol();
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    loadStored().then(loadFolder).then(() => { if (musId) { const m = musId; musId = null; music(m); } });
  }
  function applyVol() { if (!ctx) return; master.gain.value = vol.master; gSfx.gain.value = vol.sfx; gMus.gain.value = vol.music; }
  function setVol(k, v) { vol[k] = clamp(v, 0, 1); applyVol(); }

  // ----- синтез -----
  function tone(f, d, type, v, slide, delay) {
    if (!ctx) return; const t = ctx.currentTime + (delay || 0);
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'square'; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, slide), t + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v || .2, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(gSfx); o.start(t); o.stop(t + d + 0.05);
  }
  function noise(d, v, f0, f1, ft) {
    if (!ctx) return; const t = ctx.currentTime;
    const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    const f = ctx.createBiquadFilter(); f.type = ft || 'lowpass';
    f.frequency.setValueAtTime(f0 || 1000, t); f.frequency.exponentialRampToValueAtTime(Math.max(20, f1 || 300), t + d);
    const g = ctx.createGain(); g.gain.setValueAtTime(v || .2, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    s.connect(f); f.connect(g); g.connect(gSfx); s.start(t); s.stop(t + d + 0.05);
  }
  const SYN = {
    swing: () => noise(.12, .25, 2500, 800, 'bandpass'),
    hit: () => { noise(.1, .4, 1800, 300); tone(160, .1, 'square', .2, 60); },
    crit: () => { noise(.15, .5, 3000, 300); tone(220, .2, 'sawtooth', .25, 70); tone(880, .12, 'square', .12, 1400, .02); },
    hurt: () => { tone(220, .2, 'sawtooth', .25, 90); noise(.15, .2, 900, 200); },
    death_enemy: () => { tone(300, .35, 'square', .2, 50); noise(.3, .2, 1200, 100); },
    player_death: () => { tone(260, 1, 'sawtooth', .3, 40); noise(.8, .2, 800, 60); },
    roll: () => noise(.18, .2, 600, 1800, 'bandpass'),
    fireball: () => { noise(.3, .25, 1500, 400, 'bandpass'); tone(300, .25, 'sawtooth', .12, 700); },
    explosion: () => { noise(.5, .5, 900, 60); tone(90, .4, 'sine', .4, 30); },
    whirl: () => noise(.4, .3, 400, 3000, 'bandpass'),
    heal: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, .25, 'sine', .18, 0, i * .07)),
    nova: () => { tone(80, .7, 'sawtooth', .3, 300); noise(.7, .3, 200, 2500, 'bandpass'); },
    pickup: () => { tone(880, .08, 'square', .12); tone(1320, .1, 'square', .12, 0, .06); },
    coin: () => { tone(1200, .06, 'square', .12); tone(1700, .12, 'square', .12, 0, .05); },
    equip: () => { noise(.1, .25, 3000, 1000, 'highpass'); tone(300, .1, 'triangle', .15); },
    levelup: () => [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, .3, 'square', .15, 0, i * .1)),
    quest_new: () => { tone(440, .15, 'triangle', .2); tone(660, .3, 'triangle', .2, 0, .12); },
    quest_done: () => [392, 523, 659, 784].forEach((f, i) => tone(f, .25, 'triangle', .2, 0, i * .12)),
    chest: () => { tone(200, .1, 'square', .15, 500); tone(900, .2, 'triangle', .15, 0, .12); },
    door: () => { noise(.5, .3, 300, 100); tone(70, .5, 'sawtooth', .2, 40); },
    lever: () => { tone(150, .08, 'square', .2); tone(90, .12, 'square', .2, 0, .08); },
    click: () => tone(700, .05, 'square', .1),
    menu_open: () => { tone(500, .07, 'triangle', .15); tone(700, .07, 'triangle', .15, 0, .05); },
    step: () => noise(.05, .05, 500, 200),
    boss_roar: () => { tone(70, 1.2, 'sawtooth', .4, 40); noise(1.2, .3, 400, 80); },
    boss_phase: () => { tone(110, 1, 'square', .3, 400); noise(.8, .3, 200, 3000, 'bandpass'); },
    ice: () => { tone(1400, .3, 'triangle', .15, 2400); noise(.3, .15, 5000, 2000, 'highpass'); },
    dialog_blip: () => tone(300 + Math.random() * 100, .04, 'square', .05),
    save: () => { tone(660, .15, 'sine', .2); tone(880, .2, 'sine', .2, 0, .12); tone(1320, .3, 'sine', .2, 0, .25); },
    ash_wave: () => { tone(60, .8, 'sawtooth', .35, 180); noise(.8, .3, 300, 1200, 'bandpass'); },
    break: () => noise(.35, .4, 1200, 200),
    alert: () => tone(900, .1, 'square', .1, 1200)
  };

  // ----- воспроизведение (своё или синтез) -----
  let lastPlay = {};
  function play(id, o) {
    if (!ctx || vol.master <= 0) return;
    const now = ctx.currentTime;
    if (lastPlay[id] && now - lastPlay[id] < 0.035) return;   // защита от «каши»
    lastPlay[id] = now;
    const c = custom[id];
    if (c) {
      const s = ctx.createBufferSource(); s.buffer = c.buf;
      s.playbackRate.value = (o && o.rate) || (id === 'dialog_blip' || id === 'step' ? 0.95 + Math.random() * 0.1 : 1);
      const g = ctx.createGain(); g.gain.value = (o && o.vol) || 1;
      s.connect(g); g.connect(gSfx); s.start();
      return;
    }
    if (SYN[id]) SYN[id]();
  }

  // ----- музыка -----
  const THEMES = {
    m_menu: { root: 57, sc: [0, 2, 3, 5, 7, 8, 10], bpm: 66, w: 'triangle', seed: 11, dens: .45, perc: 0 },
    m_city: { root: 60, sc: [0, 2, 4, 5, 7, 9, 11], bpm: 92, w: 'triangle', seed: 22, dens: .6, perc: 0 },
    m_jungle: { root: 55, sc: [0, 2, 3, 7, 8], bpm: 104, w: 'sine', seed: 33, dens: .6, perc: 1 },
    m_fortress: { root: 50, sc: [0, 2, 3, 5, 7, 8, 11], bpm: 78, w: 'square', seed: 44, dens: .4, perc: 1 },
    m_desert: { root: 52, sc: [0, 1, 4, 5, 7, 8, 11], bpm: 88, w: 'triangle', seed: 55, dens: .55, perc: 1 },
    m_winter: { root: 64, sc: [0, 2, 3, 5, 7, 8, 10], bpm: 58, w: 'sine', seed: 66, dens: .35, perc: 0 },
    m_ash: { root: 45, sc: [0, 1, 3, 5, 6, 8, 10], bpm: 72, w: 'sawtooth', seed: 77, dens: .4, perc: 1 },
    m_boss: { root: 48, sc: [0, 1, 3, 5, 7, 8, 10], bpm: 144, w: 'square', seed: 88, dens: .8, perc: 2 },
    m_boss_final: { root: 41, sc: [0, 1, 3, 5, 6, 8, 11], bpm: 156, w: 'sawtooth', seed: 99, dens: .85, perc: 2 },
    m_victory: { root: 60, sc: [0, 2, 4, 7, 9], bpm: 80, w: 'triangle', seed: 111, dens: .6, perc: 0 }
  };
  let musId = null, curSrc = null, curGain = null, timer = null, step = 0, nextT = 0, pat = null, theme = null;
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  function mnote(f, t, d, type, v) {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(curGain); o.start(t); o.stop(t + d + .05);
  }
  function mnoise(t, d, v, f) {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf; const fl = ctx.createBiquadFilter(); fl.type = 'highpass'; fl.frequency.value = f;
    const g = ctx.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    s.connect(fl); fl.connect(g); g.connect(curGain); s.start(t); s.stop(t + d + .02);
  }
  function mkPattern(th) {
    const r = mulberry32(th.seed), n = th.sc.length, mel = []; let p = Math.floor(n / 2);
    for (let i = 0; i < 32; i++) {
      if (r() < th.dens) { p = clamp(p + Math.floor(r() * 5) - 2, 0, n + 2); mel.push(p); } else mel.push(-1);
    }
    return { mel, bass: [0, 0, 4 % n, 0] };
  }
  function degree(th, d) { const n = th.sc.length; const oct = Math.floor(d / n); return th.root + th.sc[((d % n) + n) % n] + 12 * oct; }
  function sched() {
    if (!ctx || !theme || !curGain) return;
    const sd = 60 / theme.bpm / 2;
    if (nextT < ctx.currentTime - .25) nextT = ctx.currentTime + .05;   // после паузы вкладки не догоняем пропущенные ноты
    for (let guard = 0; nextT < ctx.currentTime + 0.3 && guard < 12; guard++) {
      const i = step % 32, t = Math.max(nextT, ctx.currentTime);
      const m = pat.mel[i];
      if (m >= 0) mnote(mtof(degree(theme, m) + 12), t, sd * 1.6, theme.w, .09);
      if (i % 4 === 0) mnote(mtof(degree(theme, pat.bass[(i / 4) % 4 | 0] ) - 12), t, sd * 3.6, theme.perc === 2 ? 'sawtooth' : 'triangle', .16);
      if (i % 16 === 0) { [0, 2, 4].forEach(k => mnote(mtof(degree(theme, k)), t, sd * 14, 'sine', .05)); }
      if (theme.perc >= 1 && i % 2 === 1) mnoise(t, .05, .05, 6000);
      if (theme.perc >= 1 && i % 8 === 0) mnote(70, t, .18, 'sine', .22);
      if (theme.perc === 2 && i % 8 === 4) mnoise(t, .12, .12, 2500);
      nextT += sd; step++;
    }
  }
  function stopCur(fade) {
    if (timer) { clearInterval(timer); timer = null; }
    if (curGain && ctx) {
      const g = curGain, s = curSrc; const t = ctx.currentTime;
      try { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(0, t + (fade || .6)); } catch (e) { }
      setTimeout(() => { try { s && s.stop(); } catch (e) { } try { g.disconnect(); } catch (e) { } }, ((fade || .6) + .1) * 1000);
    }
    curGain = null; curSrc = null;
  }
  function music(id) {
    if (id === musId && curGain) return;
    musId = id;
    if (!ctx) return;
    stopCur(.8);
    if (!id) return;
    curGain = ctx.createGain(); curGain.gain.value = 0; curGain.connect(gMus);
    curGain.gain.linearRampToValueAtTime(1, ctx.currentTime + 1.2);
    const c = custom[id];
    if (c) { const s = ctx.createBufferSource(); s.buffer = c.buf; s.loop = id !== 'm_victory'; s.connect(curGain); s.start(); curSrc = s; return; }
    theme = THEMES[id]; if (!theme) return;
    pat = mkPattern(theme); step = 0; nextT = ctx.currentTime + .1;
    timer = setInterval(sched, 80);
  }

  // ----- пользовательские файлы -----
  function idb() { return new Promise((res, rej) => { const r = indexedDB.open('pepel_snd', 1); r.onupgradeneeded = () => r.result.createObjectStore('f'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); }
  async function dbOp(mode, fn) { const d = await idb(); return new Promise((res, rej) => { const t = d.transaction('f', mode); const rq = fn(t.objectStore('f')); t.oncomplete = () => res(rq && rq.result); t.onerror = () => rej(t.error); }); }
  async function decode(ab) { return await new Promise((res, rej) => ctx.decodeAudioData(ab.slice(0), res, rej)); }
  async function setFile(id, file) {
    init(); if (!ctx) throw new Error('Звук недоступен');
    const ab = await file.arrayBuffer(); const buf = await decode(ab);
    custom[id] = { buf, name: file.name, src: 'user' };
    try { await dbOp('readwrite', s => s.put({ ab, name: file.name }, id)); } catch (e) { }
    if (musId === id) { const m = musId; musId = null; music(m); }
  }
  async function clear(id) {
    delete custom[id];
    try { await dbOp('readwrite', s => s.delete(id)); } catch (e) { }
    if (musId === id) { const m = musId; musId = null; music(m); }
  }
  async function loadStored() {
    if (!window.indexedDB) return;
    try {
      const keys = await dbOp('readonly', s => s.getAllKeys());
      for (const k of keys || []) {
        const v = await dbOp('readonly', s => s.get(k));
        if (v && v.ab) { try { custom[k] = { buf: await decode(v.ab), name: v.name, src: 'user' }; } catch (e) { } }
      }
    } catch (e) { }
  }
  async function fetchBuf(url) { const r = await fetch(url); if (!r.ok) throw 0; return await r.arrayBuffer(); }
  async function loadFolder() {
    if (!/^https?:/.test(location.protocol)) return;       // из file:// браузер не даёт читать файлы — используйте загрузку в меню
    let manifest = null;
    try { const r = await fetch('assets/sounds/manifest.json'); if (r.ok) manifest = await r.json(); } catch (e) { }
    for (const s of slots) {
      if (custom[s.id]) continue;                             // загруженный вручную файл главнее
      const cands = manifest ? (manifest[s.id] ? [manifest[s.id]] : []) : EXT.map(e => s.id + '.' + e);
      for (const f of cands) {
        try { const ab = await fetchBuf('assets/sounds/' + f); custom[s.id] = { buf: await decode(ab), name: f, src: 'folder' }; break; } catch (e) { }
      }
    }
  }
  const info = id => custom[id] ? { name: custom[id].name, src: custom[id].src } : null;
  return { init, play, music, setVol, vol, slots, setFile, clear, info, stopMusic: () => { musId = null; stopCur(.5); }, get ctx() { return ctx; }, get music_id() { return musId; } };
})();
