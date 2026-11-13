'use strict';
// ---------- Процедурный pixel art: персонажи, враги, тайлы, иконки ----------
const SPR = { hum: {}, spec: {}, icons: {}, tiles: null };

function outline(src, col) {
  const w = src.width, h = src.height, c = mkCanvas(w + 2, h + 2), x = c.getContext('2d');
  const sd = src.getContext('2d').getImageData(0, 0, w, h).data;
  const o = x.createImageData(w + 2, h + 2), od = o.data;
  const al = (px, py) => (px < 0 || py < 0 || px >= w || py >= h) ? 0 : sd[(py * w + px) * 4 + 3];
  const oc = col || [12, 10, 22];
  for (let py = -1; py <= h; py++) for (let px = -1; px <= w; px++) {
    const i = ((py + 1) * (w + 2) + (px + 1)) * 4;
    if (al(px, py) > 0) { const s = (py * w + px) * 4; od[i] = sd[s]; od[i + 1] = sd[s + 1]; od[i + 2] = sd[s + 2]; od[i + 3] = 255; }
    else if (al(px - 1, py) || al(px + 1, py) || al(px, py - 1) || al(px, py + 1)) { od[i] = oc[0]; od[i + 1] = oc[1]; od[i + 2] = oc[2]; od[i + 3] = 255; }
  }
  x.putImageData(o, 0, 0); return c;
}
function paint(w, h, fn) { const c = mkCanvas(w, h), x = c.getContext('2d'); const P = (col, a, b, ww, hh) => { x.fillStyle = col; x.fillRect(a, b, ww || 1, hh || 1); }; fn(P, x); return c; }

// ----- стили гуманоидов -----
const HSTYLE = {
  seyra: { skin: '#f0c4a0', hair: '#6a2a8a', out: '#7a3aa8', out2: '#c8a0f0', robe: 1, boots: '#3a2a4a', hat: 'hood', hoodc: '#5a2a7a', staff: 1, gem: '#c8a0ff' },
  noel: { skin: '#e0b090', hair: '#c8c8d0', beard: '#c8c8d0', out: '#3a5a4a', out2: '#8ab898', robe: 1, boots: '#2a2a20' },
  kenn: { skin: '#d8a078', hair: '#222', out: '#8a2a2a', out2: '#e8c84a', pants: '#2a2a34', boots: '#2a2018', hat: 'turban', hoodc: '#1a1a22', belt: '#e8c84a' },
  tomas: { skin: '#d8a078', hair: '#8a6a3a', beard: '#9a8a6a', out: '#4a7a8a', out2: '#2a4a5a', pants: '#4a4a3a', boots: '#2a2a20', hat: 'hood', hoodc: '#c8b870' },
  dorn: { skin: '#e0b090', hair: '#3a2a1a', beard: '#3a2a1a', out: '#5a4a3a', out2: '#8a6a3a', pants: '#3a3a2a', boots: '#2a2018', cape: '#4a3a28', axe: 1 },
  tarin: { skin: '#f0c4a0', hair: '#2a5a2a', out: '#3a7a3a', out2: '#6aaa4a', pants: '#3a3a2a', boots: '#3a2a1a', bow: 1, hat: 'hood', hoodc: '#2a5a2a' },
  zafir: { skin: '#c89868', hair: '#222', out: '#d8a838', out2: '#8a2a2a', robe: 1, boots: '#5a3a2a', hat: 'turban', hoodc: '#e8e0c8' },
  vera: { skin: '#f0c4a0', hair: '#a83a2a', out: '#8a3a5a', out2: '#e8c0d0', robe: 1, boots: '#3a2a2a', belt: '#e8c84a' },
  hero: { skin: '#e8b890', hair: '#1c1c2e', out: '#3c4a6e', out2: '#2a3552', pants: '#2a2a3a', boots: '#5a3a2a', belt: '#8a6a3a', cape: '#27458f', sword: 1 },
  orven: { skin: '#e0b090', hair: '#e8e8ee', beard: '#e8e8ee', out: '#7a5a4a', out2: '#5a3f33', robe: 1, boots: '#3a2a20', staff: 1, gem: '#ffcf4a', hat: 'hood', hoodc: '#6a4a3a' },
  liara: { skin: '#f0c4a0', hair: '#8a4a2a', out: '#3a6fb8', out2: '#ffffff', robe: 1, boots: '#4a3a2a', belt: '#e8e0d0' },
  brogar: { skin: '#d8a078', hair: '#5a2e1a', beard: '#5a2e1a', out: '#6a5a4a', out2: '#d86a20', pants: '#3a2e28', boots: '#2a2018', apron: '#4a3a2e', belt: '#222' },
  darek: { skin: '#e0b090', hair: '#555', out: '#8a98b0', out2: '#566078', pants: '#3a4054', boots: '#2a2e3a', hat: 'helm', metal: '#a8b4c8', spear: 1 },
  mirena: { skin: '#f0c4a0', hair: '#d8d8f0', out: '#e8eefc', out2: '#7a9ad8', robe: 1, boots: '#6a7aa0', hat: 'hood', hoodc: '#e8eefc', staff: 1, gem: '#ffe08a' },
  tim: { skin: '#f0c4a0', hair: '#8a5a30', out: '#e8e8e0', out2: '#4a6a3a', pants: '#3a5a8a', boots: '#4a3020', kid: 1 },
  villager: { skin: '#e0b090', hair: '#6a4a2a', out: '#8a6a4a', out2: '#6a4a30', pants: '#4a3a2a', boots: '#2a2018' },
  villager2: { skin: '#d8a078', hair: '#9a9a9a', out: '#7a4a6a', out2: '#5a3050', robe: 1, boots: '#3a2a30' },
  ila: { skin: '#e0b090', hair: '#2a5a2a', out: '#3a7a3a', out2: '#2a5a2a', pants: '#4a3a20', boots: '#3a2a18', hat: 'hood', hoodc: '#2a5a2a' },
  hasim: { skin: '#b88058', hair: '#222', beard: '#222', out: '#c8a050', out2: '#a07830', robe: 1, boots: '#5a3a20', hat: 'turban', hoodc: '#e8e0c8' },
  rein: { skin: '#d8a888', hair: '#4a3a2a', beard: '#4a3a2a', out: '#6a6458', out2: '#4a443a', pants: '#3a3630', boots: '#2a2620' },
  skald: { skin: '#e0b898', hair: '#a8a8b0', beard: '#c8c8d0', out: '#5a6a8a', out2: '#e8f0ff', pants: '#3a3a4a', boots: '#2a2a30', hat: 'hood', hoodc: '#e8f0ff' },
  edrik: { skin: '#b8c8e8', hair: '#d8e0f8', beard: '#d8e0f8', out: '#7a68b8', out2: '#4a3a88', robe: 1, boots: '#3a2a60', hat: 'hood', hoodc: '#5a4a98', staff: 1, gem: '#c88aff' },
  bandit: { skin: '#d8a078', hair: '#222', out: '#5a3a30', out2: '#3a2420', pants: '#2a2420', boots: '#1a1612', hat: 'hood', hoodc: '#4a2e26', dagger: 1, mask: 1 },
  skeleton: { skin: '#e8e8d8', hair: '#e8e8d8', out: '#cfcfbd', out2: '#8a8a78', pants: '#bcbcaa', boots: '#9a9a88', skull: 1, shield: 1 },
  mummy: { skin: '#cbbf98', hair: '#cbbf98', out: '#d8cfa8', out2: '#a89c78', pants: '#c8bd98', boots: '#b0a584', wrap: 1 },
  knight: { skin: '#9aa', hair: '#667', out: '#7a8498', out2: '#4a5268', pants: '#505870', boots: '#30364a', hat: 'helm', metal: '#8e9ab0', shield: 1, ghost: 1 },
  crossbow: { skin: '#d8b090', hair: '#5a4020', out: '#5a6a4a', out2: '#3a4a2e', pants: '#3a3a2a', boots: '#2a2418', hat: 'helm', metal: '#7a8070', bow: 1 },
  ashwar: { skin: '#80707a', hair: '#201820', out: '#3a3040', out2: '#c0302a', pants: '#2a2230', boots: '#1a141e', hat: 'helm', metal: '#4a3e58', glow: '#ff3a2a', dagger: 1 },
  asharch: { skin: '#80707a', hair: '#201820', out: '#4a3a44', out2: '#a02a2a', pants: '#2a2230', boots: '#1a141e', hat: 'hood', hoodc: '#3a2a38', bow: 1, glow: '#ff3a2a' },
  ashmage: { skin: '#80707a', hair: '#201820', out: '#5a2a4a', out2: '#e03a4a', robe: 1, boots: '#2a1a2a', hat: 'hood', hoodc: '#40203a', staff: 1, gem: '#ff3a4a', glow: '#ff3a2a' },
  orc: { skin: '#6a9a3a', hair: '#201a10', out: '#5a4030', out2: '#3a2a20', pants: '#3a2e24', boots: '#2a2018', axe: 1, tusk: 1, wide: 1 },
  priest: { skin: '#80707a', hair: '#201820', out: '#3a1830', out2: '#ff4060', robe: 1, boots: '#201020', hat: 'hood', hoodc: '#2a1020', staff: 1, gem: '#ff6080', glow: '#ff3a4a' },
  ashorc: { skin: '#7a6a7a', hair: '#201a20', out: '#4a3040', out2: '#c0302a', pants: '#2a2028', boots: '#1a1418', axe: 1, tusk: 1, wide: 1, glow: '#ff3a2a' },
  scorpwar: { skin: '#b88058', hair: '#222', out: '#a88040', out2: '#785820', pants: '#5a4020', boots: '#3a2810', hat: 'turban', hoodc: '#8a6a30', dagger: 1 }
};

function humanoid(st, dir, fr) {
  const c = paint(16, 20, (P) => {
    const o = st.out, sk = st.skin, hr = st.hair, bt = st.boots || '#222', legA = fr === 1 ? -1 : fr === 3 ? 1 : 0, k = !!st.kid;
    const top = k ? 3 : 0;
    const side = dir === 's';
    if (st.cape && dir !== 's') P(st.cape, 3, 7 + top, 10, 9 - top);
    if (st.cape && side) P(st.cape, 3, 7 + top, 4, 9 - top);
    // ноги / роба
    if (st.robe) { P(o, 4, 12 + top, 8, 6 - top); P(st.out2, 4, 17, 8, 1); if (fr === 1 || fr === 3) P(o, 4, 18, 8, 1); P(bt, 5, 18, 2, 1); P(bt, 9, 18, 2, 1); }
    else if (side) { P(st.pants, 6 + legA, 13 + top, 2, 3 - top / 2); P(bt, 6 + legA, 16 - (legA ? 0 : 0), 2, 2); P(st.pants, 8 - legA, 13 + top, 2, 3 - top / 2); P(bt, 8 - legA, 16, 2, 2); }
    else { const l1 = legA < 0 ? 1 : 0, l2 = legA > 0 ? 1 : 0; P(st.pants, 5, 13 + top, 2, 3 - l1); P(bt, 5, 16 - l1, 2, 2); P(st.pants, 9, 13 + top, 2, 3 - l2); P(bt, 9, 16 - l2, 2, 2); }
    // тело
    const bw = st.wide ? 10 : 8, bx = st.wide ? 3 : 4;
    if (side) { P(o, 5, 7 + top, 6, 6 - top); P(st.belt || '#222', 5, 11, 6, 1); }
    else { P(o, bx, 7 + top, bw, 6 - top); P(st.belt || st.out2, bx, 11, bw, 1); P(st.out2, bx, 7 + top, bw, 1); }
    if (st.apron && dir === 'd') P(st.apron, 5, 8, 6, 7);
    if (st.wrap) { P(st.out2, bx, 9, bw, 1); P(st.out2, bx, 12, bw, 1); }
    if (st.glow && dir === 'd') { P(st.glow, 7, 9, 2, 1); P(st.glow, 8, 10, 1, 1); }
    // руки
    if (side) { P(o, 7, 8 + top, 2, 4 - top / 2); P(sk, 7, 12, 2, 1); }
    else { P(o, bx - 1, 8 + top, 1, 4); P(o, bx + bw, 8 + top, 1, 4); P(sk, bx - 1, 12, 1, 1); P(sk, bx + bw, 12, 1, 1); }
    // голова
    const hy = k ? 3 : 2, hs = k ? 6 : 5;
    if (side) {
      P(sk, 5, hy, 6, hs); P(hr, 4, hy - 1, 7, 3); P(hr, 4, hy + 1, 2, 4); P('#111', 9, hy + 2);
      if (st.beard) P(st.beard, 8, hy + 4, 3, 2);
    } else if (dir === 'u') {
      P(sk, 5, hy, 6, hs); P(hr, 4, hy - 1, 8, hs + 1);
    } else {
      P(sk, 5, hy, 6, hs); P(hr, 4, hy - 1, 8, 3); P(hr, 4, hy + 1, 1, 3); P(hr, 11, hy + 1, 1, 3);
      P('#111', 6, hy + 3); P('#111', 9, hy + 3);
      if (st.beard) { P(st.beard, 5, hy + 4, 6, 3); P(st.beard, 6, hy + 7, 4, 1); }
      if (st.tusk) { P('#f0f0d0', 6, hy + 5); P('#f0f0d0', 9, hy + 5); }
    }
    if (st.skull) { if (dir === 'd') { P('#111', 6, hy + 2, 2, 2); P('#111', 8, hy + 2, 2, 2); P('#111', 7, hy + 4, 2, 1); } }
    // головные уборы
    if (st.hat === 'hood') { if (dir === 's') { P(st.hoodc, 4, hy - 1, 7, 3); P(st.hoodc, 3, hy, 3, 6); } else { P(st.hoodc, 4, hy - 2, 8, 3); P(st.hoodc, 3, hy - 1, 2, 7); P(st.hoodc, 11, hy - 1, 2, 7); if (dir === 'u') P(st.hoodc, 4, hy, 8, 6); } }
    if (st.hat === 'helm') { P(st.metal, 4, hy - 1, 8, 4); P(st.metal, 4, hy + 2, 1, 4); P(st.metal, 11, hy + 2, 1, 4); if (dir === 'd') { P('#111', 6, hy + 2, 4, 1); P(st.metal, 7, hy + 3, 2, 3); } if (dir === 'u') P(st.metal, 4, hy, 8, 5); P('#c03030', 7, hy - 2, 2, 1); }
    if (st.hat === 'turban') { P(st.hoodc, 4, hy - 2, 8, 4); P(st.hoodc, 5, hy - 3, 6, 1); }
    if (st.mask && dir === 'd') P('#2a1a1a', 5, hy + 3, 6, 3);
    if (dir === 'u' && st.cape) {
      const cd = '#1a2d63', cl = '#3d62c0', hy2 = hy;
      for (const x of [5, 8, 10]) P(cd, x, 9 + top, 1, 6 - top); for (const x of [4, 7, 11]) P(cl, x, 8 + top, 1, 4);
      for (let x = 3; x < 13; x++) if ((x + legA + 4) % 2) P(cd, x, 15, 1, 1); else P(st.cape, x, 15, 1, 1);
      P(o, 3, 7 + top, 2, 2); P(o, 11, 7 + top, 2, 2); P(st.out2, 3, 8 + top, 2, 1); P(st.out2, 11, 8 + top, 2, 1);
      P('#c8a040', 7, 7 + top, 2, 1); P(st.belt || '#8a6a3a', 4, 11, 8, 1); P('#c8a040', 7, 11, 2, 1);
      for (let i = 0; i < 8; i++) P(i > 5 ? '#6a4a2a' : '#3a2a1a', 4 + i, 14 - i);
      for (let i = 0; i < 7; i++) P('#5a4430', 5 + i, 14 - i);
      P('#c8a040', 11, 6 + top); P('#c8a040', 12, 6 + top); P('#cfd6e4', 12, 5 + top); P('#8a6a3a', 11, 7 + top);
      P('#33334a', 6, hy2, 1, 3); P('#33334a', 9, hy2 + 1, 1, 3); P(hr, 5, hy2 + hs, 6, 1); P('#2a2a3e', 7, hy2 + hs - 1, 2, 2);
    }
    // предметы
    if (st.staff) { const sx = side ? 10 : 13; P('#8a5a2a', sx, 3, 1, 15); P(st.gem || '#fc4', sx - 1, 1, 3, 3); }
    if (st.spear) { const sx = side ? 10 : 13; P('#8a6a3a', sx, 2, 1, 16); P('#dfe6f0', sx - 1, 0, 3, 3); }
    if (st.sword && dir !== 'u') { P('#cfd6e4', side ? 4 : 2, 11, 1, 5); P('#8a6a3a', side ? 4 : 2, 10, 1, 1); }
    if (st.dagger && dir !== 'u') { P('#cfd6e4', side ? 10 : 13, 11, 1, 3); }
    if (st.axe) { P('#8a6a3a', side ? 11 : 13, 6, 1, 9); P('#bcc4d0', side ? 11 : 13, 5, 3, 3); }
    if (st.shield && dir === 'd') { P('#7a5a3a', 1, 8, 3, 5); P('#bbb', 2, 9, 1, 3); }
    if (st.bow) { P('#7a5a2a', side ? 11 : 13, 5, 1, 10); P('#ddd', side ? 12 : 14, 6, 1, 8); }
  });
  return outline(c);
}
const DIRS = ['d', 'u', 's'];
function humSprite(key, dir, fr) {
  const id = key + dir + fr; if (!SPR.hum[id]) SPR.hum[id] = humanoid(HSTYLE[key], dir, fr); return SPR.hum[id];
}

// ----- особые существа -----
function mkGoblin(fr) { return outline(paint(14, 14, (P) => {
  P('#4a8a2a', 3, 1, 8, 6); P('#4a8a2a', 1, 2, 2, 3); P('#4a8a2a', 11, 2, 2, 3); P('#d83', 4, 3, 2, 2); P('#d83', 8, 3, 2, 2); P('#111', 5, 4); P('#111', 9, 4);
  P('#f0f0d0', 5, 6); P('#f0f0d0', 8, 6);
  P('#6a4a2a', 3, 7, 8, 4); P('#3a2a18', 3, 10, 8, 1);
  const l = fr ? 1 : 0; P('#3a6a1a', 4, 11, 2, 2 - l); P('#3a6a1a', 8, 11, 2, 2 - (1 - l));
  P('#8a5a2a', 12, 5, 1, 7); P('#a87a3a', 11, 3, 3, 3); }));
}
function mkSpider(fr) { return outline(paint(18, 12, (P) => {
  P('#2a1a3a', 5, 3, 8, 6); P('#3a2a50', 6, 2, 6, 2); P('#e22', 6, 4); P('#e22', 11, 4); P('#e22', 8, 3); P('#e22', 9, 3);
  P('#6a2a8a', 8, 6, 2, 2);
  for (let i = 0; i < 4; i++) { const yy = 2 + i * 2 + (fr && i % 2 ? 1 : 0); P('#1a1024', 0 + i % 2, yy, 5, 1); P('#1a1024', 13 - i % 2, yy, 5, 1); }
}));
}
function mkWolf(fr, pal) { const p = pal || ['#6a6e78', '#4a4e58', '#cfd2d8']; return outline(paint(22, 14, (P) => {
  P(p[0], 3, 4, 14, 6); P(p[1], 3, 4, 14, 2); P(p[0], 15, 2, 6, 6); P(p[0], 19, 4, 3, 3); P('#111', 21, 5); P('#fc4', 18, 3); P(p[1], 16, 0, 2, 3); P(p[0], 0, 3, 4, 2); P(p[0], 0, 2, 2, 1);
  const o = fr ? 1 : 0; P(p[1], 4 + o, 10, 2, 3); P(p[1], 8 - o, 10, 2, 3); P(p[1], 12 + o, 10, 2, 3); P(p[1], 15 - o, 10, 2, 3); P(p[2], 16, 6, 4, 1); }));
}
function mkScorpion(fr, big) { return outline(paint(22, 16, (P) => {
  const b = big ? '#8a2a1a' : '#b8782a', d = big ? '#5a1a10' : '#7a4a18';
  P(b, 6, 6, 10, 6); P(d, 6, 6, 10, 2); P(b, 16, 7, 4, 4); P('#111', 18, 8); P('#111', 19, 8);
  P(b, 2, 3, 4, 3); P(b, 0, 1, 4, 3); P(d, 0, 0, 2, 2); P(b, 3, 6, 3, 2); P('#e22', 17, 7);
  P(d, 5, 2, 3, 5); P(d, 5, 1, 4, 2); P('#d4f', 7, 0, 2, 2);
  const o = fr ? 1 : 0; for (let i = 0; i < 3; i++) { P(d, 8 + i * 3 + (i % 2 ? o : -o), 12, 1, 3); } }));
}
function mkWraith(fr) { return outline(paint(16, 20, (P) => {
  P('#9ad4ff', 4, 2, 8, 10); P('#cfeaff', 5, 3, 6, 4); P('#2a6aa8', 6, 5, 1, 2); P('#2a6aa8', 9, 5, 1, 2); P('#6aa8e0', 3, 8, 10, 8);
  const w = fr ? 1 : 0; P('#6aa8e0', 3 + w, 16, 3, 3); P('#6aa8e0', 7 - w, 16, 3, 4); P('#6aa8e0', 11 + w, 16, 2, 3); P('#e8f8ff', 2, 9, 1, 5); P('#e8f8ff', 13, 9, 1, 5); }));
}
function mkGolem(fr, col) { const c = col || ['#7a8aa0', '#a8bad0', '#5a6a80']; return outline(paint(24, 26, (P) => {
  P(c[0], 6, 2, 12, 9); P(c[1], 7, 3, 4, 3); P('#ff5a3a', 8, 6, 2, 2); P('#ff5a3a', 14, 6, 2, 2);
  P(c[0], 3, 11, 18, 9); P(c[2], 3, 17, 18, 3); P(c[0], 0, 11, 4, 9); P(c[0], 20, 11, 4, 9); P(c[1], 1, 12, 2, 3);
  const o = fr ? 1 : 0; P(c[2], 6, 20, 5, 6 - o); P(c[2], 13, 20, 5, 5 + o);
  P(c[1], 10, 12, 4, 2); }));
}
function mkHound(fr) { return mkWolf(fr, ['#3a2a30', '#201418', '#ff4a3a']); }
function mkJackal(fr) { return mkWolf(fr, ['#b8985a', '#8a6a38', '#f0e0b0']); }
function mkFrostWolf(fr) { return mkWolf(fr, ['#cfe4f4', '#8ab4d4', '#ffffff']); }
function mkCrystal(hp) { return outline(paint(16, 24, (P) => {
  P('#ff4a5a', 6, 0, 4, 4); P('#ff7a8a', 4, 4, 8, 12); P('#c01a3a', 8, 4, 4, 12); P('#ff4a5a', 5, 16, 6, 6); P('#fff', 6, 6, 1, 4); }), [40, 6, 20]);
}
function mkDummy() { return outline(paint(16, 20, (P) => { P('#8a5a2a', 7, 8, 2, 12); P('#c8a060', 4, 2, 8, 9); P('#a07a40', 4, 2, 8, 1); P('#d33', 6, 5, 4, 1); P('#d33', 7, 4, 2, 3); P('#6a4a2a', 3, 8, 10, 2); }));
}
function mkBear() { return outline(paint(10, 10, (P) => { P('#9a6a3a', 2, 2, 6, 6); P('#9a6a3a', 1, 1, 2, 2); P('#9a6a3a', 7, 1, 2, 2); P('#111', 3, 4); P('#111', 6, 4); P('#d4a070', 4, 5, 2, 2); }));
}

// ----- боссы -----
function mkAshKing(phase, fr) {
  const s = phase === 3 ? ['#2a1218', '#ff2a2a', '#ff7a5a'] : phase === 2 ? ['#2a1a30', '#d83a3a', '#ff8a6a'] : ['#2a2438', '#a83a4a', '#c8a0a0'];
  return outline(paint(48, 56, (P) => {
    const up = fr ? 1 : 0;
    // плащ
    P('#1a1020', 8, 18, 32, 30); P('#2a1830', 10, 20, 28, 28); P('#1a1020', 4, 40, 40, 10); P(s[0], 6, 46, 36, 4);
    // ноги
    P('#1c1624', 14, 44, 8, 10); P('#1c1624', 26, 44, 8, 10); P('#3a3048', 13, 52, 10, 3); P('#3a3048', 25, 52, 10, 3);
    // торс-доспех
    P('#3a3048', 12, 18, 24, 22); P('#4a4058', 14, 20, 20, 8); P('#2a2438', 12, 34, 24, 6); P(s[1], 21, 22, 6, 12); P(s[2], 23, 24, 2, 6);
    // наплечники с шипами
    P('#4a4058', 6, 14, 10, 8); P('#4a4058', 32, 14, 10, 8); P('#6a6078', 6, 14, 10, 2); P('#6a6078', 32, 14, 10, 2);
    P('#8a8098', 8, 8, 2, 7); P('#8a8098', 12, 10, 2, 5); P('#8a8098', 36, 10, 2, 5); P('#8a8098', 38, 8, 2, 7);
    // руки
    P('#3a3048', 4, 22, 7, 16); P('#3a3048', 37, 22, 7, 16); P('#2a2438', 4, 36, 7, 4); P('#2a2438', 37, 36, 7, 4);
    // шлем + корона
    P('#3a3048', 17, 6, 14, 14); P('#4a4058', 18, 7, 12, 4); P('#0a0610', 20, 12, 8, 3); P(s[1], 21, 13, 2, 1); P(s[1], 25, 13, 2, 1); P('#2a2438', 17, 16, 14, 5);
    P('#8a8098', 15, 2, 3, 8); P('#8a8098', 20, 0, 3, 8); P('#8a8098', 25, 0, 3, 8); P('#8a8098', 30, 2, 3, 8); P(s[1], 21, 0, 1, 3); P(s[1], 26, 0, 1, 3);
    // красные трещины/пламя
    P(s[1], 16, 26 + up, 2, 1); P(s[1], 30, 30 - up, 2, 1); P(s[2], 12, 38, 1, 2);
    // оружие слева (меч)
    P('#4a3a3a', 1, 20, 3, 22); P(s[1], 2, 8, 1, 14); P(s[2], 1, 6, 3, 3);
  }), [20, 4, 24]);
}
const ell = (P, col, cx, cy, rx, ry) => { for (let y = -ry; y <= ry; y++) { const w = Math.round(rx * Math.sqrt(1 - (y * y) / (ry * ry + .01))); P(col, cx - w, cy + y, w * 2 + 1, 1); } };
function mkForestGuard(fr) { return outline(paint(48, 56, (P) => {
  const o = fr ? 1 : 0;
  // корни-ноги
  P('#2a1a10', 10, 44, 8, 10 - o); P('#2a1a10', 30, 44, 8, 9 + o); P('#3a2616', 6, 50, 8, 4); P('#3a2616', 34, 50, 8, 4); P('#2a1a10', 19, 46, 4, 8); P('#2a1a10', 26, 46, 4, 8);
  // ствол-туловище
  ell(P, '#4a3220', 24, 32, 14, 17); ell(P, '#5e4229', 22, 30, 11, 14); for (let i = 0; i < 6; i++) P('#3a2616', 12 + i * 4 + (i % 2), 18 + (i % 3), 1, 24 - (i % 3) * 2);
  P('#7a5a38', 17, 20, 2, 12); P('#7a5a38', 27, 24, 2, 10);
  // мох и грибы
  P('#4a8a3a', 14, 22, 6, 3); P('#6aa84a', 15, 22, 3, 1); P('#4a8a3a', 28, 34, 7, 3); P('#6aa84a', 30, 34, 3, 1); P('#c85a3a', 31, 40, 3, 2); P('#f0e0c0', 32, 42, 1, 2);
  // светящаяся грудь
  ell(P, '#2a1208', 24, 34, 4, 5); ell(P, '#7aff4a', 24, 34, 2, 3); P('#d8ffb0', 24, 33, 1, 2);
  // руки-ветви
  P('#4a3220', 3, 18, 9, 5); P('#5e4229', 1, 22, 6, 18); P('#3a2616', 4, 22, 2, 18); P('#4a3220', 36, 18, 9, 5); P('#5e4229', 41, 22, 6, 18); P('#3a2616', 42, 22, 2, 18);
  for (let i = 0; i < 4; i++) { P('#3a2616', 0 + i * 2, 38 + (i % 2), 1, 5); P('#3a2616', 41 + i * 2, 38 + (i % 2), 1, 5); }
  ell(P, '#3a7a2a', 4, 16, 5, 4); ell(P, '#4a9a3a', 43, 16, 5, 4);
  // голова-кора
  ell(P, '#5e4229', 24, 11, 10, 9); ell(P, '#7a5a38', 21, 9, 6, 5); P('#2a1208', 18, 10, 4, 4); P('#2a1208', 27, 10, 4, 4);
  P('#ffb03a', 19, 11, 2, 2); P('#ffb03a', 28, 11, 2, 2); P('#fff2a0', 19, 11, 1, 1); P('#fff2a0', 28, 11, 1, 1); P('#1a0c06', 21, 16, 7, 2); P('#e8d8b0', 22, 16, 1, 1); P('#e8d8b0', 26, 16, 1, 1);
  // крона и рога-ветви
  P('#3a2616', 14, 1, 2, 8); P('#3a2616', 32, 1, 2, 8); P('#3a2616', 12, 0, 2, 3); P('#3a2616', 34, 0, 2, 3);
  const sw = fr ? 1 : 0; ell(P, '#2a6a2a', 24, 3 + sw, 12, 4); ell(P, '#3a8a3a', 20, 2, 7, 3); ell(P, '#5ab04a', 18, 1, 3, 2); ell(P, '#2a6a2a', 11, 5, 4, 3); ell(P, '#2a6a2a', 37, 5, 4, 3);
  P('#e84a6a', 14, 3, 2, 2); P('#e84a6a', 33, 2, 2, 2); P('#ffd0e0', 14, 3, 1, 1);
}), [10, 20, 8]); }
function mkIceGuard(fr) { return outline(paint(44, 56, (P) => {
  const o = fr ? 1 : 0;
  // ноги-глыбы
  P('#2a5a98', 11, 40, 9, 14 - o); P('#2a5a98', 25, 40, 9, 13 + o); P('#4a88c8', 12, 40, 4, 12 - o); P('#4a88c8', 26, 40, 4, 11 + o); P('#8ac8f0', 9, 52 - o, 12, 3); P('#8ac8f0', 24, 51 + o, 12, 3);
  // торс
  P('#3a78b8', 10, 20, 24, 24); P('#5aa0e0', 12, 22, 20, 8); P('#2a5a98', 10, 38, 24, 6); P('#8ac8f0', 13, 23, 4, 10); P('#cfeaff', 14, 24, 1, 6);
  for (let i = 0; i < 5; i++) { P('#2a5a98', 12 + i * 4, 30 + (i % 2) * 3, 1, 8); }
  // ядро
  ell(P, '#1a3a68', 22, 32, 5, 6); ell(P, '#5affff', 22, 32, 3, 4); ell(P, '#ffffff', 22, 31, 1, 2);
  // плечи с шипами
  P('#4a88c8', 3, 16, 12, 9); P('#4a88c8', 29, 16, 12, 9); P('#cfeaff', 4, 16, 10, 2); P('#cfeaff', 30, 16, 10, 2);
  P('#8ac8f0', 5, 8, 3, 9); P('#cfeaff', 6, 6, 1, 3); P('#8ac8f0', 10, 11, 3, 6); P('#8ac8f0', 31, 11, 3, 6); P('#8ac8f0', 36, 8, 3, 9); P('#cfeaff', 37, 6, 1, 3);
  // руки-кулаки
  P('#3a78b8', 1, 24, 8, 16); P('#3a78b8', 35, 24, 8, 16); P('#5aa0e0', 2, 24, 3, 14); P('#5aa0e0', 36, 24, 3, 14);
  ell(P, '#8ac8f0', 5, 42 + o, 6, 5); ell(P, '#8ac8f0', 39, 42 - o + 1, 6, 5); P('#cfeaff', 3, 40, 3, 2); P('#cfeaff', 37, 40, 3, 2);
  // голова и ледяная корона
  P('#4a88c8', 14, 6, 16, 14); P('#8ac8f0', 15, 7, 6, 4); P('#0a1a38', 17, 12, 10, 3); P('#5affff', 18, 12, 3, 2); P('#5affff', 24, 12, 3, 2); P('#cfeaff', 18, 12, 1, 1); P('#cfeaff', 24, 12, 1, 1); P('#2a5a98', 14, 16, 16, 4);
  P('#cfeaff', 14, 1, 3, 8); P('#8ac8f0', 15, 0, 1, 3); P('#cfeaff', 19, 0, 3, 8); P('#ffffff', 20, 0, 1, 4); P('#cfeaff', 24, 0, 3, 8); P('#ffffff', 25, 0, 1, 4); P('#cfeaff', 29, 1, 3, 8);
  // иней
  P('#ffffff', 11, 30, 1, 1); P('#ffffff', 31, 36, 1, 1); P('#ffffff', 8, 20, 1, 1); P('#ffffff', 35, 20, 1, 1);
}), [8, 24, 52]); }
function mkQueen(fr) { return outline(paint(56, 40, (P) => {
  const o = fr ? 1 : 0, b = '#9a2a1a', d = '#5a1a10', l = '#d4503a', y = '#e8b83a';
  // ноги (4 пары)
  for (let i = 0; i < 4; i++) { const x = 14 + i * 7, w = (i + fr) % 2 ? 1 : 0; P(d, x, 24, 2, 8 + w); P(d, x - 3, 30 + w, 5, 2); P(d, x + 5, 24, 2, 8 - w); P(d, x + 5, 30 - w, 5, 2); }
  // тело-панцирь
  ell(P, b, 28, 20, 17, 10); ell(P, l, 26, 17, 12, 5); for (let i = 0; i < 5; i++) P(d, 16 + i * 6, 12, 1, 16);
  P(y, 20, 14, 2, 2); P(y, 33, 14, 2, 2); P(y, 26, 22, 3, 2);
  // голова и глаза
  ell(P, b, 46, 19, 7, 7); ell(P, l, 45, 17, 4, 3); P('#111', 48, 17, 3, 3); P('#ff3a3a', 49, 17, 2, 2); P('#111', 48, 22, 3, 2); P('#ff3a3a', 44, 15, 2, 2);
  P(d, 52, 21, 3, 1); P(d, 52, 23, 3, 1);
  // клешни
  P(b, 50, 8, 4, 6); ell(P, b, 53, 6, 4, 5); P(d, 54, 2, 2, 5); P('#cfa', 54, 1, 1, 2); P(b, 50, 28, 4, 6); ell(P, b, 53, 34, 4, 4); P(d, 54, 36, 2, 3);
  // корона-шипы
  P(y, 40, 8, 2, 6); P(y, 44, 5, 2, 8); P(y, 48, 8, 2, 5); P('#fff4b0', 44, 5, 1, 2);
  // хвост с жалом (изгиб)
  P(b, 6, 14, 6, 5); P(d, 6, 14, 6, 1); ell(P, b, 6, 10, 4, 4); ell(P, b, 4, 4 + o, 3, 3); P(d, 3, 6, 1, 4);
  P(b, 1, 1 + o, 4, 3); P('#8aff3a', 0, 0 + o, 3, 3); P('#d8ffa0', 0, 0 + o, 1, 1); P('#8aff3a', 1, 5 + o, 1, 2);
  // подбрюшье
  P(d, 14, 28, 28, 2);
}), [36, 8, 8]); }
function mkCastellan(fr) { return outline(paint(44, 52, (P) => {
  const o = fr ? 1 : 0;
  // плащ
  P('#7a1a22', 10, 16, 24, 30); P('#a02a32', 12, 18, 6, 26); P('#5a1018', 28, 20, 6, 26); P('#5a1018', 8, 42, 28, 4);
  // ноги и сапоги
  P('#2a3046', 14, 40, 7, 10 - o); P('#2a3046', 23, 40, 7, 9 + o); P('#4a5470', 13, 48 - o, 9, 3); P('#4a5470', 22, 47 + o, 9, 3);
  // доспех
  P('#4a5470', 12, 16, 20, 24); P('#7a88b0', 14, 18, 16, 6); P('#a8b6d8', 15, 19, 5, 3); P('#2a3046', 12, 34, 20, 4); P('#ffd24a', 21, 22, 2, 10); P('#ffd24a', 17, 26, 10, 2); P('#2a3046', 12, 30, 20, 1);
  // наплечники
  ell(P, '#5a6486', 10, 18, 6, 5); ell(P, '#5a6486', 34, 18, 6, 5); P('#a8b6d8', 7, 15, 5, 2); P('#a8b6d8', 32, 15, 5, 2); P('#ffd24a', 8, 12, 2, 4); P('#ffd24a', 34, 12, 2, 4);
  // щит слева
  P('#2a3046', 0, 20, 10, 16); P('#5a6486', 1, 21, 8, 14); P('#7a1a22', 2, 22, 6, 12); P('#ffd24a', 4, 24, 2, 8); P('#ffd24a', 2, 28, 6, 2);
  // шлем с плюмажем
  P('#4a5470', 15, 4, 14, 14); P('#7a88b0', 16, 5, 10, 4); P('#0a0a12', 17, 10, 10, 3); P('#ff4a3a', 18, 11, 2, 1); P('#ff4a3a', 24, 11, 2, 1); P('#2a3046', 15, 14, 14, 4); P('#a8b6d8', 21, 4, 2, 10);
  const pl = fr ? 1 : 0; P('#c02a2a', 20, 0, 4, 5); P('#e84a4a', 19 - pl, 0, 2, 3); P('#c02a2a', 16 - pl, 2, 4, 3); P('#8a1a1a', 14 - pl, 4, 3, 5);
  // меч справа
  P('#7a5a3a', 36, 30, 3, 8); P('#ffd24a', 33, 28, 9, 2); P('#e8eefc', 36, 4, 3, 24); P('#ffffff', 37, 5, 1, 20); P('#a8b6d8', 38, 4, 1, 24); P('#e8eefc', 37, 2, 1, 2);
}), [10, 12, 30]); }

// ----- иконки предметов (16x16 -> dataURL) -----
function itemIcon(it) {
  const key = it.ic + (it.col || '');
  if (SPR.icons[key]) return SPR.icons[key];
  const col = it.col || '#ccc';
  const c = paint(16, 16, (P) => {
    switch (it.ic) {
      case 'potion': P('#cfd6e4', 6, 1, 4, 2); P('#8a6a3a', 6, 3, 4, 1); P('#cfd6e4', 5, 4, 6, 2); P(col, 4, 6, 8, 7); P('#fff', 5, 7, 2, 3); P('#00000044', 4, 12, 8, 1); P(col, 5, 13, 6, 1); break;
      case 'sword': for (let i = 0; i < 10; i++) P(i > 7 ? '#8a6a3a' : '#cfd6e4', 3 + i, 12 - i, 2, 2); P(col, 2, 11, 3, 3); P('#8a6a3a', 1, 13, 3, 2); P('#fff', 7, 7, 1, 1); break;
      case 'staff': for (let i = 0; i < 12; i++) P('#8a5a2a', 3 + i, 13 - i); P(col, 11, 1, 4, 4); P('#fff', 12, 2, 1, 1); break;
      case 'armor': P(col, 3, 2, 10, 12); P('#00000033', 3, 10, 10, 4); P('#ffffff44', 4, 3, 3, 4); P('#111', 6, 2, 4, 2); P('#00000055', 7, 5, 2, 7); P(col, 1, 2, 3, 5); P(col, 12, 2, 3, 5); break;
      case 'helm': P(col, 3, 3, 10, 9); P('#ffffff44', 4, 4, 3, 3); P('#111', 5, 8, 6, 2); P('#00000033', 3, 10, 10, 2); P('#c03030', 7, 1, 2, 2); break;
      case 'ring': P('#ffd24a', 5, 5, 6, 6); P('#0000', 6, 6, 4, 4); P('#000', 6, 6, 4, 4); P('#ffd24a', 6, 6, 1, 1); P(col, 6, 2, 4, 4); P('#fff', 7, 3, 1, 1); break;
      case 'amulet': P('#cfcfcf', 5, 1, 1, 6); P('#cfcfcf', 10, 1, 1, 6); P('#cfcfcf', 6, 6, 4, 1); P(col, 5, 8, 6, 6); P('#fff', 6, 9, 1, 2); break;
      case 'ore': P('#555a66', 3, 5, 10, 8); P('#7a808e', 4, 4, 6, 3); P(col, 5, 7, 2, 2); P('#c0c6d4', 9, 8, 2, 2); P('#00000044', 3, 12, 10, 1); break;
      case 'herb': P('#2a6a2a', 7, 6, 2, 8); P(col, 3, 3, 4, 4); P(col, 9, 2, 4, 4); P('#8ae88a', 4, 4, 1, 1); P(col, 5, 8, 3, 2); P(col, 9, 8, 3, 2); break;
      case 'crystal': P(col, 6, 1, 4, 3); P(col, 4, 4, 8, 8); P('#fff', 5, 5, 2, 4); P('#00000033', 9, 5, 3, 7); P(col, 6, 12, 4, 2); break;
      case 'bread': P('#c88a3a', 2, 6, 12, 6); P('#e8b060', 3, 5, 10, 3); P('#8a5a20', 5, 6, 1, 3); P('#8a5a20', 8, 6, 1, 3); P('#8a5a20', 11, 6, 1, 3); break;
      case 'key': P(col, 3, 3, 5, 5); P('#0000', 4, 4, 3, 3); P('#000', 5, 5, 1, 1); P(col, 7, 6, 7, 2); P(col, 11, 8, 2, 3); P(col, 13, 8, 1, 2); break;
      case 'scroll': P('#e8d8a8', 3, 3, 10, 10); P('#c8b078', 3, 3, 10, 1); P('#c8b078', 3, 12, 10, 1); P('#5a3a1a', 5, 5, 6, 1); P('#5a3a1a', 5, 7, 6, 1); P('#5a3a1a', 5, 9, 4, 1); break;
      case 'book': P(col, 3, 2, 10, 12); P('#00000044', 3, 2, 2, 12); P('#ffd24a', 6, 5, 5, 1); P('#ffd24a', 6, 8, 4, 1); break;
      case 'gem': P(col, 5, 3, 6, 3); P(col, 3, 6, 10, 3); P(col, 5, 9, 6, 3); P('#fff', 6, 4, 2, 2); P('#00000033', 8, 8, 5, 3); break;
      case 'coin': P('#ffd24a', 4, 4, 8, 8); P('#fff6b0', 5, 5, 2, 2); P('#b8861a', 4, 11, 8, 1); P('#b8861a', 7, 6, 2, 4); break;
      case 'shard': P(col, 7, 1, 3, 5); P(col, 5, 6, 7, 6); P('#fff', 7, 3, 1, 4); P('#00000044', 10, 6, 2, 6); P(col, 6, 12, 4, 2); break;
      case 'tail': P(col, 3, 3, 3, 3); P(col, 5, 6, 4, 3); P(col, 8, 9, 4, 3); P('#d4f', 11, 11, 3, 3); break;
      case 'mirror': P('#8a6a3a', 3, 3, 10, 10); P('#9ad4ff', 4, 4, 8, 8); P('#fff', 5, 5, 2, 3); break;
      default: P(col, 4, 4, 8, 8);
    }
  });
  const o = outline(c); const u = o.toDataURL(); SPR.icons[key] = u; return u;
}

// ----- тайлы -----
const GR = { GRASS: 0, JGRASS: 1, SAND: 2, SNOW: 3, ICE: 4, ASH: 5, PATH: 6, STONE: 7, WATER: 8, BRIDGE: 9, LAVA: 10, DGRASS: 11, WOOD: 12, DSTONE: 13 };
const O = { NONE: 0, TREE: 1, JTREE: 2, PINE: 3, CACTUS: 4, ROCK: 5, DEAD: 6, WALL: 7, ROOF: 8, PILLAR: 9, ICEC: 10, BUSH: 11, FLOWER: 12, BONES: 13, GATE: 14, CRACK: 15, DOOR: 16, WINDOW: 17, ROOFB: 18, ROOFG: 19, PALM: 20, STATUE: 21, SROCK: 22, TORCH: 23, CRATE: 24, BARREL: 25, RUBBLE: 26, ASHROCK: 27, ICEWALL: 28, DWALL: 29, MOSSWALL: 30, SANDWALL: 31, CAVEROCK: 32, OBSWALL: 33, ANVIL: 34, FURNACE: 35, STALL: 36, WELL: 37, RACK: 38, FENCE: 39, SHELF: 40, COUNTER: 41, TABLE: 42, BED: 43, HAY: 44, BANNER: 45, CAULDRON: 46, NOTICE: 47, RUG: 48 };
const OBJ_SOLID = new Uint8Array(64); [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47].forEach(i => OBJ_SOLID[i] = 1);
const OBJ_TALL = new Uint8Array(64); [1, 2, 3, 4, 6, 9, 10, 20, 21, 23].forEach(i => OBJ_TALL[i] = 1);   // рисуются выше тайла

function buildTiles() {
  const r = mulberry32(777);
  const gcols = {
    [GR.GRASS]: ['#3f8a2e', '#4a9a36', '#357a28'], [GR.JGRASS]: ['#2a7a2a', '#338a30', '#1f6a24'], [GR.SAND]: ['#e8c868', '#f0d478', '#d8b858'],
    [GR.SNOW]: ['#e8f0f8', '#f4f8ff', '#d4e0ee'], [GR.ICE]: ['#8ac8f0', '#a0d8f8', '#74b4e0'], [GR.ASH]: ['#4a4650', '#524e5a', '#3e3a46'],
    [GR.PATH]: ['#a08058', '#b09068', '#907048'], [GR.STONE]: ['#7a7e88', '#868a94', '#6e727c'], [GR.WATER]: ['#1f78c8', '#2a88d8', '#1a68b4'],
    [GR.BRIDGE]: ['#8a5a30', '#9a6a3a', '#6a4220'], [GR.LAVA]: ['#4a4650', '#524e5a', '#3e3a46'], [GR.DGRASS]: ['#35652a', '#3a6e2e', '#2c5a24'],
    [GR.WOOD]: ['#8a6a40', '#9a7a4a', '#7a5a34'], [GR.DSTONE]: ['#4a4e5a', '#545866', '#40444e']
  };
  const NG = 14, VAR = 4;
  const gt = mkCanvas(NG * VAR * TS, 2 * TS), gx = gt.getContext('2d');
  for (let g = 0; g < NG; g++) for (let v = 0; v < VAR; v++) for (let f = 0; f < 2; f++) {
    const ox = (g * VAR + v) * TS, oy = f * TS, cl = gcols[g];
    gx.fillStyle = cl[0]; gx.fillRect(ox, oy, TS, TS);
    const n = 14;
    for (let i = 0; i < n; i++) { gx.fillStyle = cl[1 + (r() < .5 ? 1 : 0)]; gx.fillRect(ox + (r() * 15 | 0), oy + (r() * 15 | 0), 1 + (r() * 2 | 0), 1); }
    if (g === GR.GRASS || g === GR.JGRASS || g === GR.DGRASS) { gx.fillStyle = cl[2]; for (let i = 0; i < 4; i++) { const px = ox + (r() * 14 | 0), py = oy + 2 + (r() * 12 | 0); gx.fillRect(px, py, 1, 2); } }
    if (g === GR.WATER) { gx.fillStyle = '#6ab8f0'; const sh = f ? 3 : 0; for (let i = 0; i < 3; i++) gx.fillRect(ox + ((v * 5 + i * 5 + sh) % 14), oy + 3 + i * 5, 3, 1); }
    if (g === GR.ICE) { gx.fillStyle = '#e8f8ff'; gx.fillRect(ox + 3 + v, oy + 2, 4, 1); gx.fillRect(ox + 8, oy + 9 + v % 2, 5, 1); }
    if (g === GR.BRIDGE) { gx.fillStyle = cl[2]; for (let i = 0; i < 4; i++) gx.fillRect(ox, oy + i * 4 + 3, TS, 1); gx.fillStyle = '#4a2a14'; gx.fillRect(ox, oy, 2, TS); gx.fillRect(ox + 14, oy, 2, TS); }
    if (g === GR.STONE || g === GR.DSTONE) { gx.fillStyle = cl[2]; gx.fillRect(ox, oy + 7, TS, 1); gx.fillRect(ox + 7, oy, 1, 8); gx.fillRect(ox + 3, oy + 8, 1, 8); gx.fillRect(ox + 12, oy + 8, 1, 8); }
    if (g === GR.PATH) { gx.fillStyle = cl[2]; gx.fillRect(ox + 2 + v, oy + 4, 2, 1); gx.fillRect(ox + 9, oy + 11, 2, 1); }
    if (g === GR.WOOD) { gx.fillStyle = cl[2]; for (let i = 0; i < 4; i++) gx.fillRect(ox, oy + i * 4 + 3, TS, 1); }
    if (g === GR.LAVA) { gx.fillStyle = f ? '#ff6a2a' : '#ff3a1a'; gx.fillRect(ox + 1, oy + 4, 7, 2); gx.fillRect(ox + 7, oy + 5, 2, 7); gx.fillRect(ox + 8, oy + 11, 6, 2); gx.fillStyle = '#ffc84a'; gx.fillRect(ox + 3, oy + 4, 3, 1); gx.fillRect(ox + 8, oy + 8, 1, 3); }
  }
  // объекты: высота 24 (тайл + 8 вверх)
  const NO = 56, ot = mkCanvas(NO * TS, 24), ox2 = ot.getContext('2d');
  const OP = (i, fn) => { const c = paint(TS, 24, fn); ox2.drawImage(outline(c).getContext('2d').canvas, 1, 1, TS, 24, i * TS, 0, TS, 24); ox2.drawImage(c, i * TS, 0); };
  const draw = (i, fn) => { const c = paint(TS, 24, fn); const o = outline(c); ox2.drawImage(o, 1, 1, TS, 24, i * TS, 0, TS, 24); };
  const tree = (i, c1, c2, c3, trunk) => draw(i, P => { P(trunk, 6, 15, 4, 9); P(c3, 1, 6, 14, 10); P(c1, 2, 2, 12, 11); P(c2, 4, 3, 5, 4); P(c3, 3, 10, 10, 3); P(c2, 9, 8, 3, 3); });
  tree(O.TREE, '#2f7a28', '#4aa03a', '#1f5a1e', '#5a3a1e');
  tree(O.JTREE, '#1f7a2a', '#3ab04a', '#14561e', '#4a2e18');
  draw(O.PINE, P => { P('#4a3020', 7, 18, 2, 6); P('#1f5a3a', 4, 12, 8, 6); P('#2a7a4a', 3, 14, 10, 4); P('#1f5a3a', 5, 7, 6, 6); P('#2a7a4a', 6, 3, 4, 5); P('#f4f8ff', 5, 8, 6, 1); P('#f4f8ff', 4, 14, 3, 1); P('#f4f8ff', 6, 4, 3, 1); });
  draw(O.CACTUS, P => { P('#2a8a3a', 6, 6, 4, 18); P('#3aa04a', 7, 7, 1, 15); P('#2a8a3a', 2, 10, 4, 3); P('#2a8a3a', 2, 6, 2, 7); P('#2a8a3a', 10, 12, 4, 3); P('#2a8a3a', 12, 8, 2, 7); P('#f8e8a0', 5, 8); P('#f8e8a0', 10, 14); });
  draw(O.ROCK, P => { P('#8a8e98', 2, 12, 12, 10); P('#a8acb6', 3, 11, 8, 4); P('#6a6e78', 2, 18, 12, 4); P('#c8ccd6', 4, 12, 3, 1); });
  draw(O.ASHROCK, P => { P('#3a3640', 1, 6, 14, 16); P('#4a4650', 3, 3, 9, 8); P('#2a2630', 9, 10, 6, 12); P('#ff3a2a', 5, 12, 1, 5); P('#ff3a2a', 6, 16, 1, 3); P('#5a5660', 4, 4, 3, 1); });
  draw(O.SROCK, P => { P('#c8a868', 2, 12, 12, 10); P('#e0c488', 3, 11, 8, 4); P('#a88848', 2, 18, 12, 4); });
  draw(O.DEAD, P => { P('#4a3a30', 7, 8, 2, 16); P('#4a3a30', 3, 6, 5, 2); P('#4a3a30', 8, 10, 5, 2); P('#4a3a30', 3, 3, 2, 4); P('#4a3a30', 11, 7, 2, 4); P('#6a5a50', 7, 9, 1, 12); });
  const ovl = (i, fn) => ox2.drawImage(paint(TS, 24, fn), 0, 0, TS, 24, i * TS, 0, TS, 24);
  const brick = (i, a, b, c) => draw(i, P => { P(a, 0, 8, TS, 16); for (let y = 0; y < 4; y++) { P(b, 0, 8 + y * 4 + 3, TS, 1); for (let x = 0; x < 3; x++) P(b, ((x * 6) + (y % 2) * 3) % 16, 8 + y * 4, 1, 3); } P(c, 0, 8, TS, 2); P('#00000033', 0, 21, TS, 3); });
  brick(O.WALL, '#7a7e8c', '#5a5e6c', '#a0a4b4');
  brick(O.DWALL, '#4a4658', '#2e2a3a', '#6a667a');
  brick(O.ICEWALL, '#9ad0f0', '#6aa8d8', '#e0f4ff');
  brick(O.MOSSWALL, '#5c6a58', '#3c4a3c', '#8aaa6a'); ovl(O.MOSSWALL, P => { P('#4a9a3a', 1, 8, 4, 3); P('#3a8a2a', 9, 8, 5, 2); P('#4a9a3a', 3, 13, 2, 5); P('#3a8a2a', 11, 15, 2, 6); P('#6aca4a', 2, 8, 2, 1); });
  brick(O.SANDWALL, '#c8a868', '#a08848', '#ecd49a'); ovl(O.SANDWALL, P => { P('#8a6a38', 6, 12, 1, 3); P('#8a6a38', 7, 15, 2, 1); P('#e8c878', 11, 9, 2, 1); });
  brick(O.CAVEROCK, '#6a4e3a', '#46301f', '#a08060'); ovl(O.CAVEROCK, P => { P('#8a6a4a', 2, 10, 3, 2); P('#2e1e12', 9, 14, 4, 2); P('#8a6a4a', 11, 18, 2, 2); });
  brick(O.OBSWALL, '#2c2630', '#16121a', '#6a4a58'); ovl(O.OBSWALL, P => { P('#ff4a2a', 3, 11, 1, 4); P('#ff7a3a', 4, 14, 1, 3); P('#ff4a2a', 11, 12, 1, 5); P('#ff7a3a', 10, 16, 1, 3); });
  const roof = (i, a, b) => draw(i, P => { P(a, 0, 6, TS, 18); for (let y = 0; y < 5; y++) P(b, 0, 8 + y * 4, TS, 1); P('#00000033', 0, 21, TS, 3); P('#ffffff33', 0, 6, TS, 2); });
  roof(O.ROOF, '#a8432e', '#7a2e1e'); roof(O.ROOFB, '#3a5ea8', '#284480'); roof(O.ROOFG, '#4a7a3a', '#305a28');
  draw(O.WINDOW, P => { P('#8a7a6a', 0, 6, TS, 18); P('#4a3a2a', 4, 10, 8, 8); P('#ffd870', 5, 11, 6, 6); P('#4a3a2a', 7, 11, 1, 6); P('#4a3a2a', 5, 13, 6, 1); P('#00000033', 0, 21, TS, 3); });
  draw(O.DOOR, P => { P('#8a7a6a', 0, 6, TS, 18); P('#4a2e18', 3, 9, 10, 15); P('#6a4426', 4, 10, 8, 14); P('#ffd24a', 10, 17, 1, 2); P('#00000033', 0, 21, TS, 3); });
  draw(O.PILLAR, P => { P('#9a9eac', 4, 6, 8, 16); P('#b8bccc', 5, 6, 3, 15); P('#7a7e8c', 3, 4, 10, 3); P('#7a7e8c', 3, 20, 10, 4); P('#00000033', 9, 7, 3, 14); });
  draw(O.ICEC, P => { P('#8ad0ff', 5, 2, 6, 22); P('#cfeeff', 6, 3, 2, 18); P('#4a98d8', 9, 6, 2, 16); P('#8ad0ff', 2, 12, 4, 12); P('#8ad0ff', 11, 14, 3, 10); });
  draw(O.BUSH, P => { P('#2a7a2a', 2, 12, 12, 10); P('#3a9a3a', 3, 11, 6, 5); P('#1f5a1f', 2, 19, 12, 3); });
  draw(O.FLOWER, P => { P('#ff6a8a', 3, 14, 2, 2); P('#ffe84a', 9, 17, 2, 2); P('#fff', 6, 12, 2, 2); P('#6a9aff', 11, 13, 2, 2); });
  draw(O.BONES, P => { P('#e0e0d0', 3, 16, 7, 2); P('#e0e0d0', 5, 14, 2, 6); P('#e8e8d8', 9, 15, 4, 4); P('#111', 10, 16); });
  draw(O.GATE, P => { P('#5a5e6c', 0, 6, TS, 18); for (let i = 0; i < 4; i++) P('#2a2a34', 2 + i * 4, 6, 2, 18); P('#9a9aaa', 0, 6, TS, 2); P('#9a9aaa', 0, 14, TS, 2); P('#00000033', 0, 21, TS, 3); });
  draw(O.CRACK, P => { P('#7a7e8c', 0, 8, TS, 16); P('#5a5e6c', 0, 15, TS, 1); P('#2a2a34', 7, 8, 1, 4); P('#2a2a34', 6, 12, 2, 3); P('#2a2a34', 8, 15, 1, 4); P('#2a2a34', 7, 19, 2, 2); P('#00000033', 0, 21, TS, 3); });
  draw(O.PALM, P => { P('#7a5a30', 7, 10, 2, 14); P('#9a7a40', 7, 12, 1, 4); P('#2a8a3a', 1, 5, 6, 3); P('#2a8a3a', 9, 5, 6, 3); P('#3aa04a', 4, 2, 8, 4); P('#2a8a3a', 0, 8, 4, 2); P('#2a8a3a', 12, 8, 4, 2); P('#5a3a20', 6, 9, 2, 2); });
  draw(O.STATUE, P => { P('#8a8e9c', 3, 20, 10, 4); P('#a8acbc', 5, 4, 6, 17); P('#c8ccdc', 6, 2, 4, 5); P('#6a6e7c', 9, 8, 2, 12); });
  draw(O.TORCH, P => { P('#5a3a1e', 7, 14, 2, 10); P('#ffd24a', 6, 8, 4, 6); P('#ff7a2a', 7, 9, 2, 4); P('#fff6b0', 7, 11, 1, 2); });
  draw(O.CRATE, P => { P('#9a6a38', 2, 10, 12, 12); P('#6a4422', 2, 10, 12, 1); P('#6a4422', 2, 21, 12, 1); P('#6a4422', 2, 10, 1, 12); P('#6a4422', 13, 10, 1, 12); P('#7a5228', 4, 12, 8, 1); P('#7a5228', 4, 18, 8, 1); P('#7a5228', 8, 12, 1, 8); });
  draw(O.BARREL, P => { P('#8a5a2e', 3, 8, 10, 14); P('#a8743a', 4, 9, 3, 12); P('#3a3a44', 3, 11, 10, 1); P('#3a3a44', 3, 19, 10, 1); });
  draw(O.RUBBLE, P => { P('#6a6e78', 2, 17, 5, 4); P('#8a8e98', 7, 15, 6, 5); P('#5a5e68', 4, 19, 8, 3); });
  draw(O.ANVIL, P => { P('#3a3a44', 3, 20, 10, 3); P('#5a5a68', 4, 16, 8, 5); P('#8a8e9c', 2, 13, 12, 4); P('#aab0c0', 2, 13, 12, 1); P('#5a5a68', 11, 14, 4, 2); P('#2a2a34', 5, 22, 6, 2); });
  draw(O.FURNACE, P => { P('#6a5e56', 1, 6, 14, 18); P('#8a7e74', 1, 6, 14, 2); P('#4a403a', 1, 22, 14, 2); P('#2a1410', 4, 12, 8, 8); P('#ff6a1a', 5, 14, 6, 5); P('#ffb030', 6, 15, 4, 3); P('#6a5e56', 6, 1, 4, 6); P('#4a403a', 6, 0, 4, 2); P('#8a7e74', 2, 9, 12, 1); });
  draw(O.STALL, P => { for (let i = 0; i < 8; i++) { P(i % 2 ? '#f0f0f0' : '#c8403a', i * 2, 4, 2, 5); } P('#a02e2a', 0, 9, 16, 1); P('#7a5230', 1, 10, 2, 14); P('#7a5230', 13, 10, 2, 14); P('#9a6a3a', 0, 15, 16, 4); P('#6a4422', 0, 19, 16, 1); P('#e84a4a', 3, 13, 2, 2); P('#e8c84a', 7, 13, 2, 2); P('#6ac84a', 11, 13, 2, 2); });
  draw(O.WELL, P => { P('#7a7e8c', 2, 14, 12, 9); P('#9a9eac', 2, 14, 12, 2); P('#1a2a4a', 4, 15, 8, 3); P('#5a3a1e', 2, 4, 2, 11); P('#5a3a1e', 12, 4, 2, 11); P('#7a4a2a', 1, 3, 14, 2); P('#a8432e', 2, 1, 12, 3); P('#8a8e9c', 7, 5, 1, 9); });
  draw(O.RACK, P => { P('#6a4a2a', 1, 8, 14, 2); P('#6a4a2a', 1, 8, 2, 15); P('#6a4a2a', 13, 8, 2, 15); P('#cfd6e4', 4, 6, 1, 14); P('#cfd6e4', 7, 9, 1, 12); P('#8a6a3a', 10, 7, 1, 13); P('#bcc4d0', 9, 6, 3, 3); P('#c8a040', 3, 17, 3, 1); });
  draw(O.FENCE, P => { P('#8a6a3a', 0, 13, 16, 2); P('#8a6a3a', 0, 18, 16, 2); for (let i = 1; i < 16; i += 5) { P('#9a7a46', i, 10, 3, 14); P('#b8945a', i, 10, 3, 2); } });
  draw(O.SHELF, P => { P('#5a3a22', 0, 4, 16, 20); P('#7a5230', 1, 5, 14, 18); for (const y of [10, 16, 22]) P('#5a3a22', 1, y, 14, 1); const cl = ['#c8403a', '#3a6ac8', '#4aa84a', '#c8a040', '#8a4ac8', '#e8e0c8']; for (let r = 0; r < 3; r++) for (let i = 0; i < 6; i++) P(cl[(i + r * 2) % 6], 2 + i * 2, 5 + r * 6 + (i % 2), 2, 5 - (i % 2)); });
  draw(O.COUNTER, P => { P('#9a6a3a', 0, 12, 16, 12); P('#c08a4a', 0, 11, 16, 3); P('#6a4422', 0, 22, 16, 2); P('#7a5230', 2, 15, 12, 6); P('#e8c84a', 4, 9, 2, 2); P('#cfd6e4', 9, 8, 1, 3); });
  draw(O.TABLE, P => { P('#7a5230', 1, 14, 14, 3); P('#9a6a3a', 1, 12, 14, 3); P('#5a3a1e', 2, 17, 2, 6); P('#5a3a1e', 12, 17, 2, 6); P('#e8e0c8', 5, 10, 3, 3); P('#c8403a', 10, 10, 2, 3); });
  draw(O.BED, P => { P('#5a3a1e', 1, 8, 14, 16); P('#e8e0d8', 2, 9, 12, 5); P('#4a6ac8', 2, 14, 12, 8); P('#6a8ae8', 2, 14, 12, 2); P('#3a3a44', 1, 22, 14, 2); });
  draw(O.HAY, P => { P('#d8b848', 1, 12, 14, 11); P('#e8cc68', 2, 11, 12, 4); P('#a88830', 1, 20, 14, 3); P('#a88830', 4, 14, 1, 6); P('#a88830', 9, 13, 1, 7); });
  draw(O.BANNER, P => { P('#5a3a1e', 1, 4, 14, 2); P('#a8302a', 3, 6, 10, 14); P('#a8302a', 3, 20, 3, 3); P('#a8302a', 10, 20, 3, 3); P('#e8c84a', 6, 9, 4, 4); P('#e8c84a', 7, 13, 2, 4); });
  draw(O.CAULDRON, P => { P('#2a2a34', 2, 12, 12, 9); P('#3a3a48', 1, 11, 14, 3); P('#6aff6a', 3, 12, 10, 2); P('#2a2a34', 3, 21, 3, 3); P('#2a2a34', 10, 21, 3, 3); P('#5a3a1e', 0, 22, 16, 2); P('#ff7a2a', 5, 22, 6, 2); });
  draw(O.NOTICE, P => { P('#6a4422', 1, 6, 14, 12); P('#a8845a', 2, 7, 12, 10); P('#e8e0c8', 3, 8, 4, 5); P('#e8e0c8', 8, 9, 4, 4); P('#c8403a', 5, 8, 1, 1); P('#5a3a1e', 7, 18, 2, 6); });
  draw(O.RUG, P => { P('#8a2a3a', 1, 14, 14, 9); P('#c8a040', 1, 14, 14, 1); P('#c8a040', 1, 22, 14, 1); P('#e8c84a', 5, 17, 6, 3); P('#6a1a2a', 3, 16, 10, 1); });
  SPR.tiles = { g: gt, o: ot, NG, VAR };
}

// ----- сборка всех спрайтов -----
function buildSprites() {
  buildTiles();
  const S = SPR.spec;
  const two = (name, fn, ...a) => { S[name] = [fn(0, ...a), fn(1, ...a)]; };
  two('goblin', mkGoblin); two('spider', mkSpider); two('wolf', mkWolf); two('hound', mkHound); two('jackal', mkJackal); two('frostwolf', mkFrostWolf);
  two('scorpion', mkScorpion); two('wraith', mkWraith); two('golem', mkGolem); two('golem_ice', mkGolem, ['#6aa8e0', '#cfeaff', '#2a5a98']); two('forestguard', mkForestGuard); two('iceguard', mkIceGuard);
  two('castellan', mkCastellan); two('queen', mkQueen);
  S.king = [1, 2, 3].map(p => [mkAshKing(p, 0), mkAshKing(p, 1)]);
  S.crystal = mkCrystal(); S.dummy = mkDummy(); S.bear = mkBear();
  Object.keys(HSTYLE).forEach(k => DIRS.forEach(d => [0, 1, 2, 3].forEach(f => humSprite(k, d, f))));
}
