'use strict';
// ---------- Анимации мира: ветер в листве, волны, пена, лава, огонь, живность ----------
const SWAY = new Uint8Array(40); [O.TREE, O.JTREE, O.PINE, O.PALM, O.BUSH, O.FLOWER, O.DEAD].forEach(i => SWAY[i] = 1);
const hash2 = (x, y) => ((x * 73856093) ^ (y * 19349663)) >>> 0;
function drawObj(ctx, ot, o, tx, ty, cx, cy) {
  const x = tx * TS - cx, y = ty * TS - cy - 8, t = G.t;
  if (SWAY[o]) {
    const amp = (o === O.FLOWER ? 1.1 : o === O.BUSH ? .8 : o === O.DEAD ? .3 : o === O.PINE ? .7 : 1.1), ph = t * (o === O.FLOWER ? 2.4 : 1.5) + tx * .7 + ty * .45, sw = Math.sin(ph) * amp + Math.sin(ph * 2.3 + 1) * amp * .35, rows = o === O.FLOWER || o === O.BUSH ? [[0, 12, .7], [12, 24, 0]] : [[0, 6, 1], [6, 12, .6], [12, 18, .25], [18, 24, 0]];
    for (const [a, b, k] of rows) ctx.drawImage(ot, o * TS, a, TS, b - a, Math.round(x + sw * k), y + a, TS, b - a);
    return;
  }
  ctx.drawImage(ot, o * TS, 0, TS, 24, x, y, TS, 24);
  if (o === O.TORCH) {
    const f = Math.sin(t * 13 + tx * 3) * .5 + Math.sin(t * 7.3 + ty) * .5, fx = x + 8, fy = y + 6;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .55 + f * .15; ctx.fillStyle = '#ff9a2a'; ctx.beginPath(); ctx.ellipse(fx, fy, 3 + f * .6, 4.5 + f * 1.2, 0, 0, 6.3); ctx.fill();
    ctx.fillStyle = '#ffe070'; ctx.globalAlpha = .7; ctx.beginPath(); ctx.ellipse(fx, fy + 1, 1.6, 2.6 + f * .5, 0, 0, 6.3); ctx.fill(); ctx.restore();
    if (Math.random() < .03) AMB.sparks.push({ x: tx * TS + 8, y: ty * TS - 2, vx: rnd(-6, 6), vy: rnd(-26, -12), l: rnd(.5, 1) , t: 0 });
  } else if (o === O.FURNACE) {
    const f = Math.sin(t * 9 + tx) * .5 + Math.sin(t * 5.1) * .5;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .45 + f * .2; ctx.fillStyle = '#ff7a1a'; ctx.fillRect(x + 5, y + 13, 6, 6); ctx.globalAlpha = .25 + f * .1; ctx.beginPath(); ctx.arc(x + 8, y + 16, 12, 0, 6.3); ctx.fill(); ctx.restore();
    if (Math.random() < .08) AMB.sparks.push({ x: tx * TS + 8, y: ty * TS - 6, vx: rnd(-8, 8), vy: rnd(-34, -16), l: rnd(.5, 1.1), t: 0 });
  } else if (o === O.CAULDRON) {
    const k = (t * 2 + tx) % 2; ctx.fillStyle = '#9aff9a'; ctx.globalAlpha = .8; ctx.fillRect(x + 5 + Math.sin(t * 3 + tx) * 2 + 2, y + 10 - (k % 1) * 4, 2, 2); ctx.globalAlpha = 1;
  } else if (o === O.ICEC) {
    const k = (t * 1.2 + tx * .31 + ty * .17) % 3; if (k < .35) { ctx.fillStyle = '#fff'; ctx.globalAlpha = Math.sin(k / .35 * 3.14); ctx.fillRect(x + 5 + (tx * 7 & 5), y + 4 + (ty * 5 & 7), 1, 1); ctx.fillRect(x + 4 + (tx * 7 & 5), y + 4 + (ty * 5 & 7), 3, 1) ; ctx.globalAlpha = 1; }
  } else if (o === O.ASHROCK) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .18 + Math.sin(t * 2 + tx) * .12; ctx.fillStyle = '#ff3a1a'; ctx.fillRect(x + 4, y + 14, 8, 4); ctx.restore();
  } else if (o === O.ROOF || o === O.ROOFB || o === O.ROOFG) {
    if ((hash2(tx, ty) & 31) === 0 && G.mid === 'capital' && Math.random() < .04) AMB.smoke.push({ x: tx * TS + 8, y: ty * TS - 4, t: 0 });
  } else if (o === O.STATUE && G.mid === 'ash') {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .15 + Math.sin(t * 3) * .1; ctx.fillStyle = '#ff2a2a'; ctx.fillRect(x + 6, y + 5, 4, 2); ctx.restore();
  } else if (o === O.BONES && G.mid === 'ash' && (hash2(tx, ty) & 7) === 0) {
    ctx.globalAlpha = .5 + Math.sin(t * 5 + tx) * .4; ctx.fillStyle = '#6aff9a'; ctx.fillRect(x + 8, y + 16 - ((t * 6 + tx) % 6), 1, 1); ctx.globalAlpha = 1;
  }
}
function animTile(ctx, g, tx, ty, sx, sy, m) {
  const t = G.t, h = hash2(tx, ty);
  if (g === GR.WATER) {
    const w = (t * 7 + (h & 15)) % 20; ctx.fillStyle = 'rgba(255,255,255,.22)';
    if (w < 8) ctx.fillRect(sx + Math.round(w) + (h >> 4 & 3), sy + (h >> 6 & 7) * 2 + 1, 4, 1);
    if (((t * 1.3 + (h & 31) * .21) % 5) < .15) { ctx.fillStyle = '#fff'; ctx.fillRect(sx + (h >> 3 & 11) + 2, sy + (h >> 9 & 11) + 2, 1, 1); }
    const W = m.w, k = ty * W + tx, fo = Math.sin(t * 2.2 + tx * .8 + ty * .6) * .8 + .8; ctx.fillStyle = 'rgba(235,248,255,.65)';
    if (tx > 0 && m.g[k - 1] !== GR.WATER && m.g[k - 1] !== GR.BRIDGE) { ctx.fillRect(sx, sy + 1, 1 + (fo | 0), 14); ctx.fillRect(sx + 1 + (fo | 0), sy + 2 + ((t * 3 + ty) & 3) * 3, 1, 2); }
    if (tx < W - 1 && m.g[k + 1] !== GR.WATER && m.g[k + 1] !== GR.BRIDGE) { ctx.fillRect(sx + 15 - (fo | 0), sy + 1, 1 + (fo | 0), 14); }
    if (ty > 0 && m.g[k - W] !== GR.WATER && m.g[k - W] !== GR.BRIDGE) ctx.fillRect(sx + 1, sy, 14, 1 + (fo | 0));
    if (ty < m.h - 1 && m.g[k + W] !== GR.WATER && m.g[k + W] !== GR.BRIDGE) ctx.fillRect(sx + 1, sy + 15 - (fo | 0), 14, 1 + (fo | 0));
    if (Math.random() < .00035) AMB.fish.push({ x: tx * TS + 8, y: ty * TS + 8, t: 0 });
  } else if (g === GR.LAVA) {
    ctx.fillStyle = 'rgba(255,120,20,' + (.1 + Math.sin(t * 2 + tx + ty) * .08) + ')'; ctx.fillRect(sx, sy, 16, 16);
    const b = (t * 1.5 + (h & 15) * .3) % 3; if (b < .6) { ctx.fillStyle = '#ffe070'; const r = Math.sin(b / .6 * 3.14) * 2.4; ctx.fillRect(sx + (h >> 3 & 11) + 2, sy + (h >> 7 & 11) + 2, Math.max(1, r | 0), Math.max(1, r | 0)); }
    if (Math.random() < .0006) AMB.sparks.push({ x: tx * TS + 8, y: ty * TS + 8, vx: rnd(-8, 8), vy: rnd(-34, -16), l: rnd(.6, 1.3), t: 0, big: 1 });
  } else if (g === GR.GRASS || g === GR.JGRASS || g === GR.DGRASS) {
    if ((h & 3) === 0) { const s = Math.round(Math.sin(t * 2 + tx * .6 + ty * .3) * 1.2), bx = sx + (h >> 4 & 7) + 3, by = sy + (h >> 8 & 7) + 6; ctx.fillStyle = g === GR.JGRASS ? '#3e9a46' : g === GR.DGRASS ? '#4f8a3a' : '#7ac05a'; ctx.fillRect(bx + s, by - 3, 1, 1); ctx.fillRect(bx + (s >> 1), by - 2, 1, 2); ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(bx, by, 1, 1); }
  } else if (g === GR.SNOW || g === GR.ICE) {
    const k = (t * .9 + (h & 63) * .17) % 6; if (k < .3) { ctx.fillStyle = '#fff'; ctx.globalAlpha = Math.sin(k / .3 * 3.14) * .9; const px = sx + (h >> 5 & 11) + 2, py = sy + (h >> 10 & 11) + 2; ctx.fillRect(px, py, 1, 1); if (g === GR.ICE) { ctx.fillRect(px - 1, py, 3, 1); ctx.fillRect(px, py - 1, 1, 3); } ctx.globalAlpha = 1; }
  } else if (g === GR.SAND) {
    if ((h & 7) === 0) { ctx.fillStyle = 'rgba(255,255,255,.14)'; const o = Math.round(Math.sin(t * 1.2 + tx * .5) * 2); ctx.fillRect(sx + 3 + o, sy + 8, 6, 1); }
  } else if (g === GR.ASH && (h & 15) === 0) {
    ctx.fillStyle = 'rgba(255,90,40,' + (.3 + Math.sin(t * 3 + tx * 2 + ty) * .25) + ')'; ctx.fillRect(sx + (h >> 4 & 11) + 2, sy + (h >> 8 & 11) + 2, 1, 1);
  }
}
// ----- живность и частицы -----
const AMB = { mid: null, sparks: [], smoke: [], fish: [], crit: [], birds: [] };
function ambInit() {
  AMB.mid = G.mid; AMB.sparks = []; AMB.smoke = []; AMB.fish = []; AMB.crit = []; AMB.birds = []; const m = G.map, r = G.map.reg;
  const spawn = (n, kind, ok) => { for (let i = 0, t = 0; i < n && t < 300; t++) { const x = rint(2, m.w - 3) * TS, y = rint(2, m.h - 3) * TS; if (ok && !ok(m.g[(y / TS | 0) * m.w + (x / TS | 0)])) continue; AMB.crit.push({ k: kind, x, y, vx: 0, vy: 0, p: Math.random() * 6, a: Math.random() * 6.28, rest: 0 }); i++; } };
  if (r === 'capital' || r === 'jungle') spawn(r === 'jungle' ? 30 : 24, 'bfly', g => g === GR.GRASS || g === GR.JGRASS);
  if (r === 'fortress' || r === 'ash') spawn(14, 'bat');
  if (r === 'winter') spawn(8, 'owl', g => g === GR.SNOW);
  if (r === 'desert') spawn(8, 'tumble', g => g === GR.SAND);
  if (r === 'capital' || r === 'desert' || r === 'jungle') for (let i = 0; i < 4; i++) AMB.birds.push({ x: rnd(0, m.w * TS), y: rnd(0, m.h * TS), a: rnd(0, 6.28), v: rnd(24, 36), p: rnd(0, 6) });
}
function animAmbient(ctx, cx, cy, dt) {
  if (!G.map) return; if (AMB.mid !== G.mid) ambInit(); dt = Math.min(dt, .05); const P = G.P, t = G.t, sx = x => Math.round(x - cx), sy = y => Math.round(y - cy);
  // искры
  AMB.sparks = AMB.sparks.filter(s => (s.t += dt) < s.l); AMB.sparks.forEach(s => { s.x += s.vx * dt + Math.sin(t * 8 + s.l * 9) * .2; s.y += s.vy * dt; s.vy *= .99; if (!vis(s.x, s.y)) return; ctx.globalAlpha = 1 - s.t / s.l; ctx.fillStyle = s.t / s.l < .5 ? '#ffd060' : '#ff6a2a'; ctx.fillRect(sx(s.x), sy(s.y), s.big ? 2 : 1, s.big ? 2 : 1); });
  // дым
  AMB.smoke = AMB.smoke.filter(s => (s.t += dt) < 2.4); AMB.smoke.forEach(s => { s.y -= 10 * dt; s.x += 5 * dt + Math.sin(s.t * 2) * .2; if (!vis(s.x, s.y)) return; ctx.globalAlpha = .35 * (1 - s.t / 2.4); ctx.fillStyle = '#ccc'; const r = 1 + s.t * 1.4; ctx.fillRect(sx(s.x - r / 2), sy(s.y - r / 2), r, r); });
  // рыба
  AMB.fish = AMB.fish.filter(f => (f.t += dt) < 1); AMB.fish.forEach(f => { if (!vis(f.x, f.y)) return; const k = f.t; ctx.globalAlpha = 1 - k; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(sx(f.x), sy(f.y), 2 + k * 7, 1 + k * 3, 0, 0, 6.3); ctx.stroke(); if (k < .5) { ctx.fillStyle = '#8ac8ff'; ctx.globalAlpha = 1; ctx.fillRect(sx(f.x) - 2, sy(f.y - Math.sin(k * 6.28) * 6) - 3, 4, 2); ctx.fillRect(sx(f.x) + 2, sy(f.y - Math.sin(k * 6.28) * 6) - 4, 2, 2); } });
  // существа
  AMB.crit.forEach(c => {
    const d = Math.hypot(c.x - P.x, c.y - P.y);
    if (c.k === 'bfly') { c.a += Math.sin(t * 2 + c.p) * dt * 3; let sp = 14; if (d < 40) { c.a = Math.atan2(c.y - P.y, c.x - P.x); sp = 40; } c.x += Math.cos(c.a) * sp * dt; c.y += Math.sin(c.a) * sp * dt * .7; if (!vis(c.x, c.y)) return; const w = Math.sin(t * 22 + c.p) > 0 ? 3 : 1, col = ['#ff7ab8', '#ffd24a', '#8ac8ff', '#ffffff'][(c.p * 3 | 0) % 4]; ctx.globalAlpha = 1; ctx.fillStyle = col; ctx.fillRect(sx(c.x) - w, sy(c.y) - 2, w, 2); ctx.fillRect(sx(c.x) + 1, sy(c.y) - 2, w, 2); ctx.fillStyle = '#222'; ctx.fillRect(sx(c.x), sy(c.y) - 1, 1, 2); }
    else if (c.k === 'bat') { c.a += (Math.random() - .5) * dt * 9; c.x += Math.cos(c.a) * 38 * dt; c.y += Math.sin(c.a) * 24 * dt; if (!vis(c.x, c.y)) return; const w = Math.sin(t * 18 + c.p) > 0; ctx.globalAlpha = .9; ctx.fillStyle = '#18141e'; const x = sx(c.x), y = sy(c.y) - 14 + Math.sin(t * 3 + c.p) * 3; ctx.fillRect(x - 1, y, 3, 2); ctx.fillRect(x - 4, y + (w ? -1 : 1), 3, 1); ctx.fillRect(x + 2, y + (w ? -1 : 1), 3, 1); ctx.fillRect(x - 5, y + (w ? 0 : 2), 1, 1); ctx.fillRect(x + 5, y + (w ? 0 : 2), 1, 1); ctx.fillStyle = '#f33'; ctx.fillRect(x, y, 1, 1); }
    else if (c.k === 'owl') { if (!vis(c.x, c.y)) return; const bl = (t * .5 + c.p) % 4 < .1; ctx.globalAlpha = 1; ctx.fillStyle = '#eee'; ctx.fillRect(sx(c.x) - 2, sy(c.y) - 6, 5, 6); ctx.fillStyle = '#bbb'; ctx.fillRect(sx(c.x) - 2, sy(c.y) - 6, 5, 1); ctx.fillStyle = bl ? '#eee' : '#111'; ctx.fillRect(sx(c.x) - 1, sy(c.y) - 5, 1, 1); ctx.fillRect(sx(c.x) + 1, sy(c.y) - 5, 1, 1); ctx.fillStyle = '#f90'; ctx.fillRect(sx(c.x), sy(c.y) - 4, 1, 1); if (d < 50 && Math.random() < .02) { c.x += rnd(-30, 30); c.y -= 10; } }
    else if (c.k === 'tumble') { c.x += (22 + Math.sin(c.p + t) * 6) * dt; c.y += Math.sin(t * 1.3 + c.p) * 6 * dt; if (c.x > G.map.w * TS) c.x = 0; if (!vis(c.x, c.y)) return; const x = sx(c.x), y = sy(c.y) - 4 - Math.abs(Math.sin(t * 5 + c.p)) * 3; ctx.globalAlpha = 1; ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, 3.2, t * 4, t * 4 + 5); ctx.stroke(); ctx.beginPath(); ctx.arc(x, y, 1.6, -t * 5, -t * 5 + 4); ctx.stroke(); }
  });
  // птицы: тени скользят по земле
  AMB.birds.forEach(b => { b.a += Math.sin(t * .3 + b.p) * dt * .5; b.x += Math.cos(b.a) * b.v * dt; b.y += Math.sin(b.a) * b.v * dt; const W = G.map.w * TS, H = G.map.h * TS; b.x = (b.x + W) % W; b.y = (b.y + H) % H; if (!vis(b.x, b.y)) return; ctx.globalAlpha = .22; ctx.fillStyle = '#000'; const x = sx(b.x), y = sy(b.y), w = Math.sin(t * 9 + b.p) > 0 ? 2 : 0; ctx.fillRect(x - 4, y + w, 3, 1); ctx.fillRect(x + 1, y + w, 3, 1); ctx.fillRect(x - 1, y + 1, 2, 2); });
  ctx.globalAlpha = 1;
}
