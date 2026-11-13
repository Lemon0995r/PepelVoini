'use strict';
// ---------- Запуск: инициализация, масштабирование, касания, главный цикл ----------
(function () {
  const cv = $('cv'), ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = false;
  function resize() {
    const k = Math.min(innerWidth / VW, innerHeight / VH), w = Math.floor(VW * k), h = Math.floor(VH * k);
    cv.style.width = w + 'px'; cv.style.height = h + 'px'; const l = (innerWidth - w) / 2, t = (innerHeight - h) / 2;
    ['hud', 'toast', 'ui'].forEach(id => { const e = $(id); e.style.fontSize = Math.max(12, Math.min(18, h / 22)) + 'px'; });
  }
  const tx = $('tx'), tctx = tx.getContext('2d');
  function resizeTx() { const r = cv.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, LITE ? 1.25 : 2); tx.style.left = r.left + 'px'; tx.style.top = r.top + 'px'; tx.style.width = r.width + 'px'; tx.style.height = r.height + 'px'; tx.width = Math.round(r.width * d); tx.height = Math.round(r.height * d); }
  function flushText() {
    tctx.clearRect(0, 0, tx.width, tx.height); const k = tx.width / VW; tctx.textAlign = 'center'; tctx.lineJoin = 'round';
    for (const [s, x, y, col, size, bold, a] of TXTQ) { tctx.globalAlpha = a; tctx.font = (bold ? 'bold ' : '') + Math.round(size * k * .95) + "px 'Pixelify Sans','Trebuchet MS',Verdana,sans-serif"; tctx.lineWidth = Math.max(2, k * 1.6); tctx.strokeStyle = '#000'; tctx.strokeText(s, x * k, y * k); tctx.fillStyle = col; tctx.fillText(s, x * k, y * k); }
    TXTQ.length = 0; tctx.globalAlpha = 1;
  }
  addEventListener('resize', () => { resize(); resizeTx(); }); resize(); resizeTx();
  if (matchMedia('(pointer:coarse)').matches || 'ontouchstart' in window) document.body.classList.add('touch');
  // касания
  const st = $('stick'), kn = $('knob'); let sid = null;
  function stickMove(e) { const r = st.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2; let dx = e.clientX - cx, dy = e.clientY - cy; const m = Math.hypot(dx, dy), R = r.width / 2; if (m > R) { dx *= R / m; dy *= R / m; } kn.style.left = 36 + dx + 'px'; kn.style.top = 36 + dy + 'px'; TOUCH.ax = dx / R; TOUCH.ay = dy / R; }
  st.addEventListener('pointerdown', e => { sid = e.pointerId; st.setPointerCapture(sid); SND.init(); stickMove(e); e.preventDefault(); });
  st.addEventListener('pointermove', e => { if (e.pointerId === sid) stickMove(e); });
  const endS = e => { if (e.pointerId === sid) { sid = null; TOUCH.ax = TOUCH.ay = 0; kn.style.left = kn.style.top = '36px'; } }; st.addEventListener('pointerup', endS); st.addEventListener('pointercancel', endS);
  document.querySelectorAll('#tbtns button').forEach(b => {
    const k = b.dataset.k, down = e => { e.preventDefault(); SND.init(); if (G.mode === 'dlg') return UI.dlgAdvance(); if (k === 'menu') return G.mode === 'play' ? UI.pause() : (G.mode === 'ui' && UI.close()); if (k === 'atk') MOUSE.down = true, TOUCH.k.atk = 1; else if (/^s\d$/.test(k)) PRESS['Digit' + k[1]] = 1; else if (k === 'roll') PRESS.Space = 1; else if (k === 'use') PRESS.KeyE = 1; else if (k === 'pot') PRESS.KeyQ = 1; };
    b.addEventListener('pointerdown', down); b.addEventListener('pointerup', () => { if (k === 'atk') { MOUSE.down = false; TOUCH.k.atk = 0; } }); b.addEventListener('pointercancel', () => { TOUCH.k.atk = 0; MOUSE.down = false; });
  });
  bindMouse(cv); for (const k of ['master', 'sfx', 'music']) SND.setVol(k, CFG[k]);
  buildSprites(); S = freshState(); loadMap('capital', undefined, undefined, true); G.mode = 'title'; G.fade = 0;
  UI.title();
  let last = performance.now(), seenMap = null;
  function frame(now) {
    let dt = Math.min(.05, (now - last) / 1000); last = now;
    try {
      if (G.mode === 'title') { G.cam.x += 0; }
      G.update(dt); renderWorld(ctx); flushText(); if (G.mode !== 'title' && S && G.P) { UI.showHud(true); if (G.mid && G.mid !== seenMap) { seenMap = G.mid; S.seen = S.seen || {}; S.seen[G.mid] = 1; setTimeout(() => G.banner && UI.banner(G.map.title || REGIONS[G.map.reg].n), 50); } UI.hudTick(); }
      cv.style.filter = (CFG.bright !== 1 ? 'brightness(' + CFG.bright + ')' : '');
    } catch (e) { window._errs = window._errs || {}; const k = String(e && e.stack || e).slice(0, 300); if (!window._errs[k]) { window._errs[k] = 1; console.error(e); } }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  window.addEventListener('error', e => { window._err = window._err || e.error; });
})();
