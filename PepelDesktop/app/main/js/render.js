const TXTQ = [];
const ptxt = (s, x, y, col, size, bold, a) => TXTQ.push([s, x, y, col, size, bold, a]);
'use strict';
// ---------- Отрисовка мира ----------
const IMGS = {}, TINT = new WeakMap();
function iconImg(it) { const u = itemIcon(it); if (!IMGS[u]) { const i = new Image(); i.src = u; IMGS[u] = i; } return IMGS[u]; }
function tinted(img, col) {
  let m = TINT.get(img); if (!m) { m = {}; TINT.set(img, m); } if (m[col]) return m[col];
  const c = mkCanvas(img.width, img.height), x = c.getContext('2d'); x.drawImage(img, 0, 0); x.globalCompositeOperation = 'source-atop'; x.fillStyle = col; x.fillRect(0, 0, c.width, c.height); return m[col] = c;
}
const lightC = mkCanvas(VW, VH), lightX = lightC.getContext('2d');
const _bits = {};
function bit(name, w, h, fn) { if (!_bits[name]) _bits[name] = paint(w, h, fn); return _bits[name]; }
const chestC = () => outline(bit('chc', 14, 12, P => { P('#6a4422', 1, 3, 12, 8); P('#9a6a38', 1, 3, 12, 3); P('#ffd24a', 6, 5, 2, 3); P('#3a2410', 1, 10, 12, 1); P('#4a2e18', 1, 2, 12, 1); }));
const chestO = () => outline(bit('cho', 14, 12, P => { P('#6a4422', 1, 6, 12, 5); P('#9a6a38', 1, 0, 12, 3); P('#2a1a0a', 2, 5, 10, 2); P('#ffd24a', 5, 7, 4, 2); }));
const signC = () => outline(bit('sgn', 14, 16, P => { P('#5a3a1e', 6, 8, 2, 8); P('#a8803e', 1, 1, 12, 8); P('#6a4a22', 1, 1, 12, 1); P('#2a1a0a', 3, 3, 8, 1); P('#2a1a0a', 3, 5, 6, 1); }));
const boardC = () => outline(bit('brd', 20, 18, P => { P('#5a3a1e', 2, 8, 2, 10); P('#5a3a1e', 16, 8, 2, 10); P('#8a6a3a', 0, 0, 20, 12); P('#c8b078', 2, 2, 16, 8); P('#c33', 4, 3, 3, 3); P('#fff', 9, 3, 4, 3); P('#fff', 5, 7, 5, 2); P('#3a6aa8', 12, 7, 4, 2); }));
const leverC = (on) => outline(bit('lv' + on, 14, 16, P => { P('#5a5e6c', 2, 10, 10, 6); P('#8a8e9c', 3, 9, 8, 2); P('#4a3a2a', on ? 8 : 5, on ? 2 : 2, 2, 8); P(on ? '#6aff6a' : '#ff4a4a', on ? 7 : 4, 0, 4, 3); }));

function spriteOf(e) {
  const d = e.d;
  if (e.boss) {
    const b = BOSSES[e.bid]; if (b.spr === 'king') return SPR.spec.king[e.phase - 1][e.fr & 1]; return SPR.spec[b.spr][e.fr & 1];
  }
  if (d.hum) return humSprite(d.hum, e.dir, e.fr & 3);
  if (d.spr === 'dummy' || d.spr === 'crystal') return SPR.spec[d.spr];
  return SPR.spec[d.spr][e.fr & 1];
}
function drawSpr(ctx, img, x, y, sc, flip, tint, alpha) {
  const w = img.width * sc, h = img.height * sc, px = Math.round(x - w / 2), py = Math.round(y - h + 3 * sc);
  ctx.save(); if (alpha !== undefined) ctx.globalAlpha = alpha;
  if (flip) { ctx.translate(px + w, py); ctx.scale(-1, 1); ctx.drawImage(tint ? tinted(img, tint) : img, 0, 0, w, h); } else ctx.drawImage(tint ? tinted(img, tint) : img, px, py, w, h);
  ctx.restore();
}
function shadow(ctx, x, y, r) { ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(x, y, r, r * .45, 0, 0, 6.3); ctx.fill(); }

function renderWorld(ctx) {
  const m = G.map; if (!m) return;
  const sh = G.shake > 0 ? { x: rnd(-1, 1) * G.shake, y: rnd(-1, 1) * G.shake } : { x: 0, y: 0 };
  const cx = Math.round(G.cam.x + sh.x), cy = Math.round(G.cam.y + sh.y);
  const x0 = Math.max(0, Math.floor(cx / TS)), y0 = Math.max(0, Math.floor(cy / TS)), x1 = Math.min(m.w - 1, Math.floor((cx + VW) / TS)), y1 = Math.min(m.h - 1, Math.floor((cy + VH + 12) / TS));
  ctx.fillStyle = '#05070f'; ctx.fillRect(0, 0, VW, VH);
  const f = Math.floor(G.t * 2) & 1, gt = SPR.tiles.g, ot = SPR.tiles.o, VAR = SPR.tiles.VAR;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const k = y * m.w + x, g = m.g[k], v = ((x * 7 + y * 13) ^ (x * y)) & 3, ff = (g === GR.WATER || g === GR.LAVA) ? f : 0;
    ctx.drawImage(gt, (g * VAR + v) * TS, ff * TS, TS, TS, x * TS - cx, y * TS - cy, TS, TS);
    animTile(ctx, g, x, y, x * TS - cx, y * TS - cy, m);
  }
  // сортируемые объекты
  const L = [];
  for (let y = y0; y <= Math.min(m.h - 1, y1 + 1); y++) for (let x = x0; x <= x1; x++) { const o = m.o[y * m.w + x]; if (o) L.push({ y: (y + 1) * TS - 1, o, x, ty: y }); }
  m.things.forEach(t => { if (t.x !== undefined && !['boss', 'reach'].includes(t.t)) L.push({ y: t.y * TS + 12, th: t }); });
  G.npcs.forEach(n => L.push({ y: n.y, n }));
  G.enemies.forEach(e => L.push({ y: e.y, e }));
  G.drops.forEach(d => L.push({ y: d.y + 2, dr: d }));
  L.push({ y: G.P.y, pl: 1 });
  L.sort((a, b) => a.y - b.y);
  for (const it of L) {
    if (it.o) drawObj(ctx, ot, it.o, it.x, it.ty, cx, cy);
    else if (it.th) drawThing(ctx, it.th, cx, cy);
    else if (it.n) { if (vis(it.n.x, it.n.y)) drawNpc(ctx, it.n, cx, cy); }
    else if (it.e) { if (vis(it.e.x, it.e.y)) drawEnemy(ctx, it.e, cx, cy); }
    else if (it.dr) { if (vis(it.dr.x, it.dr.y)) drawDrop(ctx, it.dr, cx, cy); }
    else if (it.pl) drawPlayer(ctx, cx, cy);
  }
  // телеграфы, снаряды, эффекты
  G.hazards.forEach(h => { if (vis(h.x, h.y)) drawHazard(ctx, h, cx, cy); });
  G.enemies.forEach(e => { if (e.tele && vis(e.x, e.y)) drawTele(ctx, e.tele, cx, cy); });
  G.projs.forEach(p => {
    if (!vis(p.x, p.y)) return;
    const x = p.x - cx, y = p.y - cy; ctx.fillStyle = p.col; ctx.globalAlpha = .35; ctx.beginPath(); ctx.arc(x, y, p.r + 3, 0, 6.3); ctx.fill(); ctx.globalAlpha = 1;
    if (p.kind === 'bolt' || p.kind === 'arrow') { ctx.strokeStyle = p.col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - p.vx * .03, y - p.vy * .03); ctx.stroke(); }
    else { ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(x, y, p.r, 0, 6.3); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, p.r * .45, 0, 6.3); ctx.fill(); }
  });
  G.parts.forEach(p => { ctx.globalAlpha = Math.max(0, 1 - p.t / p.life); ctx.fillStyle = p.col; ctx.fillRect(Math.round(p.x - cx), Math.round(p.y - cy), p.sz, p.sz); }); ctx.globalAlpha = 1;
  // эффект удара
  if (G.P.swing) { const s = G.P.swing, k = clamp(s.t / s.T, 0, 1); ctx.save(); ctx.strokeStyle = s.col; ctx.globalAlpha = (1 - k) * .9; ctx.lineWidth = 3 + (1 - k) * 2; ctx.beginPath(); ctx.arc(G.P.x - cx, G.P.y - cy - 6, s.range * (.7 + k * .3), s.ang - s.arc / 2 + k * .4, s.ang + s.arc / 2 + k * .4); ctx.stroke(); ctx.restore(); }
  animAmbient(ctx, cx, cy, G.dt || 1 / 60);
  weatherDraw(ctx);
  lighting(ctx, cx, cy);
  if (G.mode !== 'title') visionMask(ctx, cx, cy);
  // числа урона
  
  G.floats.forEach(fl => { if (!vis(fl.x, fl.y + 6)) return; ptxt(fl.txt, fl.x - cx, fl.y - cy - fl.t * 22, fl.col, fl.big ? 12 : 9, fl.big, Math.max(0, 1 - fl.t)); });
  if (G.fade > 0) { ctx.fillStyle = 'rgba(0,0,0,' + clamp(G.fade, 0, 1) + ')'; ctx.fillRect(0, 0, VW, VH); }
  if (G.flashT > 0) { ctx.fillStyle = 'rgba(255,255,255,' + G.flashT + ')'; ctx.fillRect(0, 0, VW, VH); G.flashT = Math.max(0, G.flashT - .03); }
  if (G.mode === 'play' && S && S.p.hp / Math.max(1, stats().maxhp) < .25) { ctx.fillStyle = 'rgba(160,0,0,' + (.12 + Math.sin(G.t * 6) * .05) + ')'; ctx.fillRect(0, 0, VW, VH); }
}
function drawNpc(ctx, n, cx, cy) {
  const d = NPCS[n.id]; if (!d) return; const x = n.x - cx, y = n.y - cy; shadow(ctx, x, y, 6);
  if (d.board) { ctx.drawImage(boardC(), Math.round(x - 11), Math.round(y - 19)); } else drawSpr(ctx, humSprite(d.hum, n.dir, Math.floor(n.fr) & 3), x, y + (n.moving ? 0 : Math.sin(G.t * 2.2 + n.x) * .5 - .3), 1, n.fl);
  const mk = npcMarker(n.id); if (mk) ptxt(mk, x, y - 26 + Math.sin(G.t * 4), mk === '!' ? '#ffd24a' : '#6aff9a', 13, true, 1);
  if (G.near && G.near.o === n && CFG.hints) ptxt(d.n, x, y - 32, '#fff', 9, false, 1);
}
function drawEnemy(ctx, e, cx, cy) {
  const x = e.x - cx, y = e.y - cy, d = e.d, sc = e.boss ? 1 : (d.sc || 1);
  if (e.dead) { ctx.globalAlpha = clamp(1 - e.dead / .6, 0, 1); }
  shadow(ctx, x, y + 1, (e.boss ? BOSSES[e.bid].sz : d.sz) * sc * 1.1);
  if (e.boss) { if (e.hide) { ctx.globalAlpha = .15; } const AU = { forest_guard: '120,255,90', castellan: '255,200,80', queen: '255,70,50', ice_guardian: '120,230,255', ash_king: '255,60,50' }[e.bid], R = 30 + Math.sin(G.t * 3) * 3 + (e.phase || 1) * 6, g = ctx.createRadialGradient(x, y - 14, 4, x, y - 14, R); g.addColorStop(0, 'rgba(' + AU + ',.28)'); g.addColorStop(1, 'rgba(' + AU + ',0)'); ctx.fillStyle = g; ctx.fillRect(x - R, y - 14 - R, R * 2, R * 2); }
  const img = spriteOf(e); let tint = null; if (e.flash > 0) tint = '#ffffff'; else if (e.poison > 0 && Math.floor(G.t * 6) & 1) tint = '#5ad04a88'; else if (e.freeze > 0) tint = '#8ad8ff88';
  const off = e.st === 'wind' && !e.boss ? Math.sin(G.t * 40) * .8 : 0;
  drawSpr(ctx, img, x + off, y + (e.st === 'idle' || e.st === 'rec' ? Math.sin(G.t * (e.boss ? 1.8 : 3) + e.id) * (e.boss ? 1.1 : .6) - .3 : 0), e.boss ? (e.bsc || 1) : sc, e.fl, tint);
  ctx.globalAlpha = 1;
  if (!e.dead && !e.boss && e.hp < e.mhp && d.kind !== 'dummy') { const w = 18; ctx.fillStyle = '#000'; ctx.fillRect(x - w / 2 - 1, y - img.height * sc - 3, w + 2, 4); ctx.fillStyle = '#c22'; ctx.fillRect(x - w / 2, y - img.height * sc - 2, w * e.hp / e.mhp, 2); }
  if (e.st === 'wind' && !e.boss) { ctx.fillStyle = '#ff4a4a'; ctx.fillRect(x - 1, y - img.height * sc - 8 + (G.t * 10 & 1), 2, 4); ctx.fillRect(x - 1, y - img.height * sc - 3, 2, 1); }
}
function drawPlayer(ctx, cx, cy) {
  const P = G.P, x = P.x - cx, y = P.y - cy; shadow(ctx, x, y + 1, 6);
  let alpha = P.inv > 0 && !P.roll && Math.floor(G.t * 20) & 1 ? .4 : 1;
  const fr = P.roll ? Math.floor(P.roll * 20) & 3 : Math.floor(P.wt) & 3;
  if (P.roll) { ctx.globalAlpha = .25; drawSpr(ctx, humSprite('hero', P.dir, 1), x - P.vx * .05, y - P.vy * .05, 1, P.fl); ctx.globalAlpha = 1; }
  drawSpr(ctx, humSprite('hero', P.dir, fr), x, y + (Math.hypot(P.vx || 0, P.vy || 0) < 4 && !P.roll ? Math.sin(G.t * 2.4) * .45 - .2 : 0), 1, P.fl, P.hurt > 0 ? '#ff5a5a99' : null, alpha);
  if (P.castT > 0) { ctx.strokeStyle = '#ffd890'; ctx.globalAlpha = P.castT; ctx.beginPath(); ctx.arc(x, y - 6, 12 * (1.5 - P.castT), 0, 6.3); ctx.stroke(); ctx.globalAlpha = 1; }
}
function drawThing(ctx, t, cx, cy) {
  const x = t.x * TS - cx, y = t.y * TS - cy, key = G.mid + ':' + t.id;
  switch (t.t) {
    case 'chest': ctx.drawImage(S.done[key] ? chestO() : chestC(), x + 0, y + 1); if (!S.done[key]) { const k = (G.t * .8 + t.x * .37) % 3; if (k < .5) { ctx.fillStyle = '#fff4b0'; ctx.globalAlpha = Math.sin(k / .5 * 3.14); const sx2 = x + 3 + (k * 18 | 0) % 10, sy2 = y + 1 + (t.y * 3 + (k * 9 | 0)) % 6; ctx.fillRect(sx2, sy2, 1, 1); ctx.fillRect(sx2 - 1, sy2, 3, 1); ctx.fillRect(sx2, sy2 - 1, 1, 3); ctx.globalAlpha = 1; } } break;
    case 'sign': ctx.drawImage(signC(), x, y - 4); break;
    case 'save': { shadow(ctx, x + 8, y + 13, 9); const t = G.t, p = .6 + Math.sin(t * 3) * .25, R = (c, a, b, w, h) => { ctx.fillStyle = c; ctx.fillRect(x + a, y + b, w, h); };
      R('#4a4e5a', -2, 8, 20, 6); R('#6a6e7a', -2, 8, 20, 2); R('#3a3e48', -2, 12, 20, 2);          // ступенчатое основание
      R('#7a7e8a', 2, -10, 12, 19); R('#9a9ea8', 2, -10, 3, 19); R('#5a5e6a', 10, -10, 2, 19);      // тело башни
      for (let r = -8; r < 8; r += 4) { R('#5a5e6a', 2, r, 12, 1); R('#6a6e7a', r % 8 ? 5 : 8, r + 1, 1, 3); }
      R('#6a6e7a', 0, -14, 16, 4); R('#8a8e98', 0, -14, 16, 1); for (let k = 0; k < 4; k++) R('#8a8e98', k * 5, -17, 3, 3); R('#3a3e48', 0, -11, 16, 1);   // зубцы
      R('#15151c', 6, 1, 4, 8); R('#2a2a38', 7, 1, 2, 1); ctx.globalAlpha = .5 + p * .4; R('#ff5a5a', 7, 3, 2, 5); ctx.globalAlpha = 1;   // арка с огнём
      ctx.globalAlpha = p; R('#ff4a5a', 4, -6, 1, 3); R('#ff4a5a', 11, -6, 1, 3); R('#ff8a8a', 7, -7, 2, 1); ctx.globalAlpha = 1;   // руны
      const c = SPR.spec.crystal; ctx.globalAlpha = p * .45; ctx.fillStyle = '#ff4a5a'; ctx.beginPath(); ctx.arc(x + 8, y - 24, 12, 0, 6.3); ctx.fill(); ctx.globalAlpha = 1;
      ctx.drawImage(c, x + 1, y - 38 + Math.sin(t * 2) * 1.5, 14, 14);
      const fl = Math.floor(t * 8) % 2; R('#5a3a1a', -3, 0, 2, 5); R(fl ? '#ffb030' : '#ff8a20', -3, -3, 2, 3); R('#5a3a1a', 17, 0, 2, 5); R(fl ? '#ff8a20' : '#ffb030', 17, -3, 2, 3);
      break; }
    case 'pick': if (S.done[key]) break; { const ic = iconImg(ITEMS[t.item] || { ic: t.ic || 'gem', col: '#fff' }), by = Math.sin(G.t * 3 + t.x) * 1.5; if (t.ic && !t.item) { } ctx.globalAlpha = .4 + Math.sin(G.t * 4) * .15; ctx.fillStyle = t.lore ? '#d8c898' : '#ffe890'; ctx.beginPath(); ctx.arc(x + 8, y + 8, 9, 0, 6.3); ctx.fill(); ctx.globalAlpha = 1; ctx.drawImage(ic, x - 1, y - 1 + by, 18, 18); break; }
    case 'lever': ctx.drawImage(leverC(S.done[key] ? 1 : 0), x + 1, y - 2); break;
    case 'trap': { const s = t.state | 0; if (s === 0) { ctx.fillStyle = '#00000044'; ctx.fillRect(x + 2, y + 2, 12, 12); } else if (s === 1) { ctx.fillStyle = (G.t * 10 & 1) ? '#ff4a4a88' : '#ff4a4a33'; ctx.fillRect(x, y, 16, 16); ctx.fillStyle = '#aaa'; ctx.fillRect(x + 3, y + 10, 2, 3); ctx.fillRect(x + 11, y + 10, 2, 3); } else { ctx.fillStyle = '#c8ccd6'; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) ctx.fillRect(x + 2 + i * 5, y + 2 + j * 5, 2, 5); } break; }
  }
}
function drawDrop(ctx, d, cx, cy) {
  const x = d.x - cx, y = d.y - cy + Math.sin(G.t * 4 + d.x) * 1.5; ctx.globalAlpha = .35; ctx.fillStyle = d.gold ? '#ffd24a' : '#fff'; ctx.beginPath(); ctx.arc(x, y - 4, 7, 0, 6.3); ctx.fill(); ctx.globalAlpha = 1;
  ctx.drawImage(iconImg(d.gold ? { ic: 'coin' } : ITEMS[d.id]), x - 7, y - 12, 14, 14);
}
function drawTele(ctx, t, cx, cy) {
  const a = clamp(t.t / t.T, 0, 1) * .45 + .1; ctx.fillStyle = 'rgba(255,50,50,' + a + ')'; ctx.strokeStyle = 'rgba(255,120,100,' + (a + .2) + ')'; ctx.lineWidth = 1;
  const x = t.x - cx, y = t.y - cy;
  if (t.type === 'circle') { ctx.beginPath(); ctx.arc(x, y, t.r, 0, 6.3); ctx.fill(); ctx.stroke(); }
  else if (t.type === 'cone') { ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, t.r, t.ang - t.arc / 2, t.ang + t.arc / 2); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  else if (t.type === 'line') { ctx.save(); ctx.translate(x, y); ctx.rotate(t.ang); ctx.fillRect(0, -t.w / 2, t.r, t.w); ctx.restore(); }
}
function drawHazard(ctx, h, cx, cy) {
  const x = h.x - cx, y = h.y - cy, k = h.t / h.warn;
  if (h.t < h.warn) { ctx.fillStyle = 'rgba(255,40,40,' + (.15 + k * .3) + ')'; ctx.strokeStyle = 'rgba(255,140,120,.8)'; ctx.beginPath(); ctx.arc(x, y, h.r, 0, 6.3); ctx.fill(); ctx.stroke(); }
  else { ctx.fillStyle = h.col || 'rgba(255,60,30,.65)'; ctx.beginPath(); ctx.arc(x, y, h.r, 0, 6.3); ctx.fill(); ctx.fillStyle = 'rgba(255,200,80,.6)'; ctx.beginPath(); ctx.arc(x, y, h.r * .55, 0, 6.3); ctx.fill(); }
}
function weatherDraw(ctx) {
  const fx = REGIONS[G.map.reg].fx; const dt = 1 / 60;
  G.weather.forEach(w => {
    switch (fx) {
      case 'snow': w.y += (14 + w.z * 30) * dt; w.x += Math.sin(G.t + w.p) * .3 + .25; ctx.fillStyle = '#fff'; ctx.globalAlpha = .5 + w.z * .4; ctx.fillRect(w.x | 0, w.y | 0, w.z > .6 ? 2 : 1, w.z > .6 ? 2 : 1); break;
      case 'ash': w.y += (8 + w.z * 16) * dt; w.x += (10 + w.z * 14) * dt; ctx.fillStyle = w.z > .85 ? '#ff6a3a' : '#9a949c'; ctx.globalAlpha = .4 + w.z * .4; ctx.fillRect(w.x | 0, w.y | 0, 1 + (w.z > .5 ? 1 : 0), 1); break;
      case 'sand': w.x += (50 + w.z * 60) * dt; w.y += 6 * dt; ctx.fillStyle = '#f0d890'; ctx.globalAlpha = .25 + w.z * .3; ctx.fillRect(w.x | 0, w.y | 0, 2, 1); break;
      case 'fireflies': w.x += Math.sin(G.t * .8 + w.p) * .3; w.y += Math.cos(G.t * .6 + w.p) * .25; ctx.fillStyle = '#d8ff6a'; ctx.globalAlpha = (Math.sin(G.t * 3 + w.p) + 1) * .35; ctx.fillRect(w.x | 0, w.y | 0, 2, 2); break;
      case 'dust': w.y -= 3 * dt; w.x += Math.sin(G.t + w.p) * .2; ctx.fillStyle = '#c8c8d8'; ctx.globalAlpha = .25; ctx.fillRect(w.x | 0, w.y | 0, 1, 1); break;
      default: w.x += (12 + w.z * 10) * dt; w.y += (6 + w.z * 8) * dt; ctx.fillStyle = '#8ac84a'; ctx.globalAlpha = .6; ctx.fillRect(w.x | 0, w.y | 0, 2, 1);
    }
    if (w.x > VW) { w.x = -2; w.y = Math.random() * VH; } if (w.y > VH) { w.y = -2; w.x = Math.random() * VW; } if (w.y < -3) w.y = VH; if (w.x < -3) w.x = VW;
  });
  ctx.globalAlpha = 1;
  if (fx === 'ash' && G.map.id === 'ash') { ctx.fillStyle = 'rgba(80,10,10,' + (.05 + Math.sin(G.t * .5) * .03) + ')'; ctx.fillRect(0, 0, VW, VH); }
}
function lighting(ctx, cx, cy) {
  const R = REGIONS[G.map.reg], a = R.ambient; if (!a[3] && !G.map.lights.length) return;
  let night = a[3] * CFG.bright; if (G.map.id === 'ash') night += .1;
  if (G.mid === 'capital' && !night) return;
  lightX.globalCompositeOperation = 'source-over'; lightX.clearRect(0, 0, VW, VH);
  lightX.fillStyle = 'rgba(' + a[0] + ',' + a[1] + ',' + a[2] + ',' + clamp(night, 0, .8) + ')'; lightX.fillRect(0, 0, VW, VH);
  lightX.globalCompositeOperation = 'destination-out';
  const hole = (x, y, r, s) => { const g = lightX.createRadialGradient(x, y, r * .2, x, y, r); g.addColorStop(0, 'rgba(0,0,0,' + s + ')'); g.addColorStop(1, 'rgba(0,0,0,0)'); lightX.fillStyle = g; lightX.fillRect(x - r, y - r, r * 2, r * 2); };
  hole(G.P.x - cx, G.P.y - cy - 6, 80, .85);
  G.map.lights.forEach(l => { const x = l[0] * TS + 8 - cx, y = l[1] * TS + 8 - cy; if (x < -90 || x > VW + 90 || y < -90 || y > VH + 90) return; hole(x, y, l[2] * TS * (.95 + Math.sin(G.t * 7 + l[0]) * .05), .9); });
  G.projs.forEach(p => hole(p.x - cx, p.y - cy, 30, .8));
  ctx.drawImage(lightC, 0, 0);
  ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .13;
  G.map.lights.forEach(l => { const x = l[0] * TS + 8 - cx, y = l[1] * TS + 8 - cy; if (x < -60 || x > VW + 60 || y < -60 || y > VH + 60) return; const g = ctx.createRadialGradient(x, y, 2, x, y, l[2] * TS * .8); g.addColorStop(0, l[3]); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - 100, y - 100, 200, 200); });
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
}

// ---------- Зрение: герой видит только то, что не закрыто стенами ----------
const SB = new Uint8Array(64); [O.WALL, O.ROOF, O.ICEC, O.GATE, O.CRACK, O.DOOR, O.WINDOW, O.ROOFB, O.ROOFG, O.ICEWALL, O.DWALL, O.ASHROCK, O.MOSSWALL, O.SANDWALL, O.CAVEROCK, O.OBSWALL].forEach(i => SB[i] = 1);
const VISR = { capital: 240, jungle: 170, fortress: 200, desert: 220, winter: 185, ash: 195 };
const visC = mkCanvas(VW, VH), visX = visC.getContext('2d');
function sightBlock(tx, ty) { const m = G.map; if (tx < 0 || ty < 0 || tx >= m.w || ty >= m.h) return 1; return SB[m.o[ty * m.w + tx]]; }
const vis = (x, y) => G.mode === 'title' || Math.hypot(x - G.P.x, y - G.P.y) < 30 || canSee(x, y - 6);
function canSee(x, y) {                                   // видна ли точка герою
  const P = G.P, R = (VISR[G.map.reg] || 180) * .94; if (Math.hypot(x - P.x, y - P.y) > R) return false;
  const n = Math.ceil(Math.hypot(x - P.x, y - P.y) / 4); for (let i = 1; i < n; i++) { const t = i / n; if (sightBlock(Math.floor((P.x + (x - P.x) * t) / TS), Math.floor((P.y - 5 + (y - P.y + 5) * t) / TS))) return false; } return true;
}
function visionMask(ctx, cx, cy) {
  const m = G.map, P = G.P, R = VISR[m.reg] || 180, px = P.x, py = P.y - 5, N = LITE ? 170 : 320, pts = [], hits = new Map();
  for (let i = 0; i < N; i++) {
    const a = i / N * 6.2832, dx = Math.cos(a), dy = Math.sin(a); let d, hit = null;
    for (d = 2; d <= R; d += 2) { const tx = Math.floor((px + dx * d) / TS), ty = Math.floor((py + dy * d) / TS); if (sightBlock(tx, ty)) { hit = [tx, ty]; break; } }
    const e = hit ? Math.min(R, d + 7) : R; pts.push([px + dx * e - cx, py + dy * e - cy]);
    if (hit) { const k = hit[0] + ',' + hit[1]; if (!hits.has(k) || hits.get(k) > d) hits.set(k, d); }
  }
  visX.globalCompositeOperation = 'source-over'; visX.globalAlpha = 1; visX.clearRect(0, 0, VW, VH); visX.fillStyle = '#4a4e5c'; visX.fillRect(0, 0, VW, VH);
  visX.globalCompositeOperation = 'destination-out';
  visX.save(); visX.beginPath(); pts.forEach((p, i) => i ? visX.lineTo(p[0], p[1]) : visX.moveTo(p[0], p[1])); visX.closePath(); visX.clip();
  const sx = px - cx, sy = py - cy, g = visX.createRadialGradient(sx, sy, R * .45, sx, sy, R); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  visX.fillStyle = g; visX.fillRect(sx - R, sy - R, R * 2, R * 2); visX.restore();
  hits.forEach((d, k) => {                                // грани и верх стен, на которые упал взгляд
    const [tx, ty] = k.split(',').map(Number); visX.globalAlpha = clamp(1 - Math.pow(d / R, 3), 0, 1);
    for (let j = 0; j <= 2; j++) { if (j > 0 && !sightBlock(tx, ty - j)) break; visX.fillStyle = '#000'; visX.fillRect(tx * TS - cx, (ty - j) * TS - cy - 8, TS, TS + 8); }
  });
  visX.globalAlpha = 1; visX.globalCompositeOperation = 'source-over';
  ctx.globalCompositeOperation = 'saturation'; ctx.drawImage(visC, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = .62; ctx.drawImage(visC, 0, 0); ctx.globalAlpha = 1;
}
