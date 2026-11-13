'use strict';
// ---------- Уникальные иконки: у каждого предмета и навыка своя картинка ----------
const _icon0 = itemIcon;
function hsh(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function lin(P, c, x0, y0, x1, y1, t) { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let i = 0; i <= n; i++) { const k = n ? i / n : 0; P(c, Math.round(x0 + (x1 - x0) * k), Math.round(y0 + (y1 - y0) * k), t || 1, t || 1); } }
function shade(c, a) { const n = parseInt(c.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(v + a))); return '#' + [f(n >> 16), f((n >> 8) & 255), f(n & 255)].map(v => v.toString(16).padStart(2, '0')).join(''); }
const GEMS = ['#ff3a4a', '#4ac8ff', '#6aff6a', '#ffd24a', '#c84aff', '#ff8a2a', '#ffffff'];
const ICONS = {
  sword(P, it, h, col) {
    const L = 6 + h % 4, g = (h >> 3) % 4, bl = shade(col, 30), w = (h >> 5) % 2; const hx = 3, hy = 12;
    for (let i = 0; i < L; i++) { P(bl, hx + 1 + i, hy - 1 - i, 2, 2); if (i > 1) P(shade(col, -45), hx + 2 + i, hy - i, 1, 1); }
    P('#fff', hx + 2 + (L >> 1), hy - 2 - (L >> 1), 1, 1); if (w) P(bl, hx + L, hy - L - 1, 1, 1);
    if (g === 0) lin(P, '#c8a040', 2, 9, 6, 13); else if (g === 1) { lin(P, '#c8a040', 1, 10, 7, 14); P('#c8a040', 1, 9); P('#c8a040', 7, 15); } else if (g === 2) { P('#8a8e98', 3, 9, 4, 1); P('#8a8e98', 5, 13, 4, 1); P('#8a8e98', 2, 10); P('#8a8e98', 8, 14); } else { lin(P, shade(col, -20), 2, 10, 7, 12, 2); }
    lin(P, '#6a4a2a', 2, 13, 1, 14, 2); P(GEMS[(h >> 9) % 7], 0, 15);
  },
  dagger(P, it, h, col) { const L = 4 + h % 3, bl = shade(col, 35); for (let i = 0; i < L; i++) P(bl, 5 + i, 10 - i, 2, 2); P(shade(col, -40), 5 + L - 1, 10 - L + 1); lin(P, '#c8a040', 3, 8, 7, 12); lin(P, '#5a3a2a', 2, 12, 4, 10, 2); P(GEMS[(h >> 4) % 7], 1, 13); if ((h >> 7) & 1) P('#fff', 7, 7); },
  axe(P, it, h, col) {
    const bl = shade(col, 25); lin(P, '#7a5a3a', 3, 14, 11, 4, 2); const dbl = h % 2;
    P(bl, 8, 1, 6, 3); P(bl, 9, 4, 6, 3); P(bl, 10, 0, 4, 1); P(shade(col, -45), 12, 5, 3, 3); P('#fff', 9, 2, 1, 1);
    if (dbl) { P(bl, 4, 5, 4, 3); P(bl, 3, 4, 3, 2); P(shade(col, -45), 4, 7, 3, 1); } else if (h & 2) { P('#8a8e98', 9, 7, 3, 1); }
    P(GEMS[(h >> 4) % 7], 2, 14);
  },
  hammer(P, it, h, col) {
    lin(P, '#7a5a3a', 3, 14, 10, 7, 2); const bl = shade(col, 20), big = h % 2;
    P(bl, 7, 1, 8, 5 + big); P(shade(col, -45), 7, 5 + big, 8, 1); P('#fff', 8, 2, 2, 1); P('#6a6e78', 6, 2, 1, 4); P('#6a6e78', 15, 2, 1, 4);
    if (h & 2) { P(GEMS[(h >> 3) % 7], 10, 3, 2, 2); } else { P('#9a9ea8', 12, 2, 2, 2); }
  },
  spear(P, it, h, col) {
    lin(P, '#8a6a3a', 1, 15, 11, 5, 1); lin(P, '#a8845a', 2, 15, 12, 5, 1); const bl = shade(col, 30), t = h % 3;
    if (t === 0) { lin(P, bl, 11, 5, 14, 1, 2); P('#fff', 13, 2); } else if (t === 1) { P(bl, 11, 3, 3, 3); P(bl, 12, 1, 2, 2); P(bl, 14, 0, 1, 1); P(bl, 10, 6, 1, 1); P('#fff', 12, 3); lin(P, '#c8a040', 9, 7, 12, 10); }
    else { P(bl, 10, 1, 4, 3); P(bl, 12, 4, 3, 3); P(shade(col, -40), 13, 5, 2, 1); P(bl, 13, 0, 2, 1); P('#fff', 11, 2); }
    P(GEMS[(h >> 4) % 7], 8, 8);
  },
  bow(P, it, h, col) {
    const wd = shade(col, -10), big = h % 2; const x = 3 + big;
    for (let y = 1; y < 15; y++) { const k = Math.abs(y - 7.5) / 7; P(wd, Math.round(x + (1 - k * k) * (7 - big)), y, 2, 1); }
    lin(P, '#e8e0c8', 4 + big, 1, 4 + big, 14); P(shade(col, 40), 4 + big, 1); P(shade(col, 40), 4 + big, 14);
    if ((h >> 1) & 1) { lin(P, '#c8c0a0', 3, 8, 12, 8); P('#d8d8d8', 13, 8); P('#c04040', 3, 7); P('#c04040', 3, 9); }
    if ((h >> 2) & 1) P(GEMS[(h >> 4) % 7], 9 - big, 7, 2, 2);
  },
  staff(P, it, h, col) {
    lin(P, '#7a5028', 2, 14, 10, 6, 2); const t = h % 5, c2 = shade(col, 40);
    if (t === 0) { P(col, 9, 0, 5, 5); P(c2, 10, 1, 2, 2); P('#fff', 10, 1); lin(P, '#c8a040', 8, 6, 10, 4); }
    else if (t === 1) { P('#c8a040', 9, 4, 4, 1); P(col, 10, 0, 2, 4); P(c2, 11, 0, 1, 3); P(col, 9, 1, 1, 2); P(col, 12, 1, 1, 2); }
    else if (t === 2) { P(col, 8, 0, 2, 5); P(col, 9, 0, 4, 1); P(col, 12, 1, 2, 4); P(c2, 10, 2, 2, 2); P('#fff', 10, 2); }
    else if (t === 3) { P('#d8d0c0', 9, 1, 5, 4); P('#222', 10, 2, 1, 1); P('#222', 12, 2, 1, 1); P(col, 10, 0, 3, 1); P(c2, 9, 5, 2, 1); }
    else { P(col, 11, 0, 2, 2); P(col, 9, 2, 6, 2); P(col, 10, 4, 4, 1); P(c2, 11, 2, 2, 1); P('#c8a040', 9, 5, 1, 2); P('#c8a040', 13, 5, 1, 2); }
  },
  wand(P, it, h, col) { lin(P, '#6a4a2a', 3, 13, 10, 6, 2); P(col, 10, 2, 4, 4); P(shade(col, 50), 11, 3, 2, 2); P('#fff', 11, 3); P(col, 12, 0); P(col, 14, 2); P(col, 8, 2); P(col, 14, 6); },
  armor(P, it, h, col) {
    const rb = it.id && /robe/.test(it.id); const d = shade(col, -45), l = shade(col, 35), s = (h >> 2) % 3;
    if (rb) { P(col, 3, 2, 10, 13); P(d, 3, 11, 10, 4); P(col, 1, 3, 3, 8); P(col, 12, 3, 3, 8); P(d, 7, 2, 2, 13); P(l, 4, 3, 2, 6); P('#c8a040', 3, 8, 10, 1); P('#222', 6, 1, 4, 2); P(GEMS[(h >> 6) % 7], 7, 5, 2, 2); return; }
    P(col, 3, 2, 10, 12); P(d, 3, 10, 10, 4); P(l, 4, 3, 3, 4); P('#111', 6, 2, 4, 2);
    if (s === 0) { P(col, 1, 2, 3, 5); P(col, 12, 2, 3, 5); P(d, 1, 6, 3, 1); P(d, 12, 6, 3, 1); } else if (s === 1) { P(l, 1, 1, 3, 3); P(l, 12, 1, 3, 3); P(col, 1, 4, 3, 3); P(col, 12, 4, 3, 3); P('#fff', 2, 2); } else { P(d, 1, 3, 2, 5); P(d, 13, 3, 2, 5); }
    const e = (h >> 5) % 4; if (e === 0) { P('#c8a040', 7, 5, 2, 5); P('#c8a040', 5, 7, 6, 1); } else if (e === 1) { P('#00000055', 7, 5, 2, 7); } else if (e === 2) { for (let y = 4; y < 12; y += 2) P(d, 4, y, 8, 1); } else { P(GEMS[(h >> 8) % 7], 7, 6, 2, 2); }
    P('#6a4a2a', 3, 11, 10, 1); P('#c8a040', 7, 11, 2, 1);
  },
  helm(P, it, h, col) {
    const d = shade(col, -45), l = shade(col, 35), t = h % 5;
    if (t === 0) { P(col, 3, 3, 10, 9); P(l, 4, 4, 3, 3); P('#111', 5, 8, 6, 2); P(d, 3, 10, 10, 2); P('#c03030', 7, 0, 2, 3); }
    else if (t === 1) { P(col, 3, 4, 10, 8); P(l, 4, 5, 3, 2); P('#111', 4, 8, 8, 1); P(d, 7, 4, 2, 8); P('#e8e0c8', 1, 2, 2, 3); P('#e8e0c8', 13, 2, 2, 3); P('#e8e0c8', 0, 1); P('#e8e0c8', 15, 1); }
    else if (t === 2) { P(col, 2, 6, 12, 7); P(col, 4, 3, 8, 4); P(l, 5, 4, 3, 2); P('#111', 6, 8, 4, 2); P(d, 7, 8, 2, 5); P('#ffd24a', 7, 1, 2, 2); }
    else if (t === 3) { P(col, 3, 2, 10, 4); P(col, 2, 5, 12, 8); P('#111', 5, 6, 6, 5); P(d, 2, 11, 12, 2); P(l, 4, 3, 3, 1); P('#0000', 0, 0); }
    else { P(col, 3, 3, 10, 10); P(col, 5, 1, 6, 3); P(d, 5, 5, 6, 6); P('#111', 6, 6, 4, 4); P(l, 4, 4, 2, 1); P(GEMS[(h >> 6) % 7], 7, 2, 2, 1); }
  },
  ring(P, it, h, col) { const bd = ['#ffd24a', '#c8d0dc', '#d89050'][h % 3]; P(bd, 4, 6, 8, 8); P('#000', 6, 8, 4, 4); P(bd, 5, 5, 6, 1); const t = (h >> 2) % 3; if (t === 0) { P(col, 6, 2, 4, 4); P('#fff', 7, 3); } else if (t === 1) { P(col, 7, 1, 2, 5); P(col, 5, 3, 6, 2); P('#fff', 7, 3); } else { P(col, 5, 3, 6, 2); P(col, 6, 2, 4, 4); P(col, 6, 5, 4, 1); P('#fff', 6, 3); } },
  amulet(P, it, h, col) { const ch = '#c8c8d0'; lin(P, ch, 4, 1, 7, 7); lin(P, ch, 11, 1, 8, 7); const t = h % 3; if (t === 0) { P('#c8a040', 5, 7, 6, 7); P(col, 6, 8, 4, 5); P('#fff', 7, 9); } else if (t === 1) { P(col, 6, 7, 4, 2); P(col, 5, 9, 6, 2); P(col, 6, 11, 4, 2); P(col, 7, 13, 2, 1); P('#fff', 7, 9); } else { P('#c8a040', 4, 8, 8, 6); P(col, 5, 9, 6, 4); P('#c8a040', 7, 7, 2, 1); P('#222', 7, 10, 2, 2); } },
  gem(P, it, h, col) { const t = h % 3; if (t === 0) { P(col, 5, 2, 6, 2); P(col, 3, 4, 10, 4); P(col, 5, 8, 6, 3); P(col, 7, 11, 2, 2); P('#fff', 5, 4, 2, 2); P(shade(col, -60), 9, 6, 4, 2); } else if (t === 1) { P(col, 6, 1, 4, 3); P(col, 4, 4, 8, 7); P(col, 6, 11, 4, 3); P('#fff', 6, 3, 2, 3); P(shade(col, -60), 9, 6, 3, 5); } else { P(col, 7, 1, 2, 2); P(col, 5, 3, 6, 3); P(col, 3, 6, 10, 4); P(col, 5, 10, 6, 3); P('#fff', 6, 5, 2, 2); P(shade(col, -60), 10, 7, 2, 3); } P('#ffffff55', 1, 1); P('#ffffff55', 14, 13); },
  potion(P, it, h, col) { const t = h % 3, g = '#cfd6e4'; if (t === 0) { P(g, 6, 1, 4, 2); P('#8a6a3a', 6, 3, 4, 1); P(g, 5, 4, 6, 2); P(col, 4, 6, 8, 7); P('#fff', 5, 7, 2, 3); P(shade(col, -60), 4, 12, 8, 1); } else if (t === 1) { P('#8a6a3a', 6, 1, 4, 2); P(g, 7, 3, 2, 4); P(col, 5, 7, 6, 6); P(col, 6, 6, 4, 1); P('#fff', 6, 8, 1, 3); P(shade(col, -60), 5, 12, 6, 1); } else { P('#8a6a3a', 5, 1, 6, 2); P(g, 4, 3, 8, 2); P(col, 3, 5, 10, 8); P(g, 3, 13, 10, 1); P('#fff', 4, 6, 2, 4); P('#222', 7, 8, 2, 2); } },
  bag(P, it, h, col) { const d = shade(col, -45), l = shade(col, 35), sz = it.bag >= 10 ? 1 : 0; P(col, 3, 5, 10, 9); P(col, 4, 3, 8, 3); P(d, 4, 5, 8, 1); P(l, 4, 7, 3, 4); P(d, 3, 12, 10, 2); P('#c8a040', 7, 6, 2, 2); P('#6a4a2a', 5, 2, 6, 1); if (it.bag >= 8) { P(d, 1, 7, 2, 5); P(d, 13, 7, 2, 5); } if (it.bag >= 10) { P(GEMS[5], 7, 9, 2, 2); P('#c84aff', 1, 1); P('#c84aff', 14, 2); P('#fff', 13, 12); } },
  pelt(P, it, h, col) { P(col, 3, 4, 10, 9); P(col, 2, 6, 12, 5); P(shade(col, -40), 4, 10, 8, 3); P(shade(col, 40), 5, 5, 4, 2); for (let i = 3; i < 14; i += 2) P(shade(col, -25), i, 13, 1, 2); },
  silk(P, it, h, col) { for (let r = 2; r < 7; r++) { for (let a = 0; a < 20; a++) { const t = a / 20 * 6.28; P(r % 2 ? col : shade(col, -30), Math.round(8 + Math.cos(t) * r), Math.round(8 + Math.sin(t) * r)); } } P('#fff', 6, 5); lin(P, col, 11, 11, 14, 14); },
  scale(P, it, h, col) { for (let r = 0; r < 3; r++) for (let c2 = 0; c2 < 3; c2++) { const x = 2 + c2 * 4 + (r % 2) * 2, y = 2 + r * 4; P(col, x, y, 4, 3); P(shade(col, -50), x, y + 3, 4, 1); P(shade(col, 50), x + 1, y, 1, 1); } },
  ore(P, it, h, col) { P('#555a66', 3, 5, 10, 8); P('#7a808e', 4, 4, 6, 3); P(col, 5, 7, 2, 2); P('#c0c6d4', 9, 8, 2, 2); P('#00000044', 3, 12, 10, 1); },
  teddy(P, it, h, col) { P(col, 4, 3, 3, 3); P(col, 9, 3, 3, 3); P(col, 4, 5, 8, 8); P(shade(col, 40), 6, 8, 4, 3); P('#222', 5, 7, 1, 1); P('#222', 10, 7, 1, 1); P('#222', 7, 9, 2, 1); P('#c03040', 6, 12, 4, 1); },
  parcel(P, it, h, col) { P(col, 2, 5, 12, 9); P(shade(col, -40), 2, 12, 12, 2); P('#c03040', 7, 5, 2, 9); P('#c03040', 2, 9, 12, 1); P('#c03040', 5, 3, 3, 2); P('#c03040', 8, 3, 3, 2); },
  crate(P, it, h, col) { P(col, 2, 3, 12, 11); P(shade(col, -50), 2, 3, 12, 1); P(shade(col, -50), 2, 13, 12, 1); P(shade(col, -50), 2, 3, 1, 11); P(shade(col, -50), 13, 3, 1, 11); lin(P, shade(col, -40), 3, 4, 12, 12); lin(P, shade(col, -40), 12, 4, 3, 12); },
  tablet(P, it, h, col) { P('#8a8e98', 3, 2, 10, 12); P('#a8acb8', 4, 3, 8, 10); P('#8a8e98', 3, 2, 10, 1); for (let y = 5; y < 12; y += 2) P('#555a66', 5, y, 2 + (y * 3) % 5, 1); },
  signet(P, it, h, col) { P('#ffd24a', 4, 6, 8, 8); P('#000', 6, 8, 4, 4); P('#ffd24a', 5, 3, 6, 4); P('#b8861a', 6, 4, 4, 2); P('#fff6b0', 7, 4); },
  seal(P, it, h, col) { P(col, 4, 3, 8, 8); P(col, 3, 5, 10, 4); P(shade(col, -50), 5, 11, 2, 4); P(shade(col, -50), 9, 11, 2, 4); P(shade(col, 60), 5, 4, 3, 3); P('#fff', 7, 6, 2, 2); P(shade(col, -60), 7, 8, 2, 1); },
  lore(P, it, h, col) { const rb = ['#c03040', '#3a6ac0', '#3a9a4a', '#c8a040', '#8a4ac8', '#c06a30'][h % 6]; P('#e8d8a8', 3, 3, 10, 10); P('#c8b078', 3, 3, 10, 1); P('#c8b078', 3, 12, 10, 1); for (let y = 5; y < 11; y += 2) P('#5a3a1a', 5, y, 3 + (h >> (y)) % 4, 1); P(rb, 11, 2, 2, 6); P(rb, 11, 8, 1, 2); P(rb, 12, 8, 1, 1); },
  scrollfire(P, it, h, col) { P('#e8d8a8', 3, 3, 10, 10); P('#c8b078', 3, 3, 10, 1); P('#c8b078', 3, 12, 10, 1); P('#ff8a2a', 7, 5, 3, 5); P('#ffd24a', 8, 6, 1, 3); P('#ff4a2a', 6, 8, 5, 2); },
  // навыки
  sk_fire(P) { P('#c83a1a', 5, 6, 6, 8); P('#ff6a2a', 4, 8, 8, 5); P('#ff9a2a', 6, 3, 4, 8); P('#ffd24a', 7, 1, 2, 4); P('#ffd24a', 6, 7, 4, 5); P('#fff6b0', 7, 9, 2, 3); },
  sk_bolt(P) { const c = '#ffee6a'; lin(P, c, 9, 0, 5, 7, 2); lin(P, c, 5, 7, 10, 8, 2); lin(P, c, 10, 8, 6, 15, 2); P('#fff', 8, 3); P('#fff', 8, 10); P('#ffee6a55', 3, 2, 2, 2); P('#ffee6a55', 12, 11, 2, 2); },
  sk_frost(P) { const c = '#bff0ff'; lin(P, c, 8, 0, 8, 15); lin(P, c, 1, 8, 15, 8); lin(P, '#8ad8ff', 2, 2, 14, 14); lin(P, '#8ad8ff', 14, 2, 2, 14); P('#fff', 7, 7, 2, 2); for (const [x, y] of [[8, 1], [8, 14], [1, 8], [14, 8]]) { P(c, x - 1, y + (y < 8 ? 1 : -1)); P(c, x + 1, y + (y < 8 ? 1 : -1)); } },
  sk_whirl(P) { const c = '#cfd6e4'; for (let a = 0; a < 26; a++) { const t = a / 26 * 5.4 + .3; P(c, Math.round(8 + Math.cos(t) * 6), Math.round(8 + Math.sin(t) * 6), 2, 2); } lin(P, c, 12, 12, 15, 9); lin(P, c, 12, 12, 15, 14); P('#fff', 3, 6); lin(P, '#8a8e98', 7, 7, 9, 9, 2); },
  sk_heal(P) { P('#6aff6a', 6, 2, 4, 12); P('#6aff6a', 2, 6, 12, 4); P('#c8ffc8', 7, 3, 2, 10); P('#c8ffc8', 3, 7, 10, 2); P('#fff', 7, 7, 2, 2); P('#2a9a2a', 6, 13, 4, 1); },
  sk_shield(P) { const c = '#9ab8ff'; P(c, 3, 2, 10, 7); P(c, 4, 9, 8, 3); P(c, 6, 12, 4, 2); P('#d8e4ff', 4, 3, 3, 5); P('#5a78c8', 9, 4, 3, 6); P('#5a78c8', 7, 12, 2, 1); P('#fff', 7, 5, 2, 3); },
  sk_nova(P) { for (let i = 0; i < 12; i++) { const t = i / 12 * 6.28; lin(P, i % 2 ? '#ffb06a' : '#ff5a4a', 8, 8, Math.round(8 + Math.cos(t) * 7), Math.round(8 + Math.sin(t) * 7)); } P('#fff6b0', 6, 6, 4, 4); P('#ffd24a', 7, 7, 2, 2); },
  sk_meteor(P) { lin(P, '#ff6a2a', 1, 1, 8, 8, 3); lin(P, '#ffb050', 3, 1, 9, 7, 2); lin(P, '#ffb050', 1, 3, 7, 9, 2); P('#6a3a2a', 8, 7, 6, 6); P('#8a5a3a', 9, 8, 4, 3); P('#3a2a22', 11, 11, 3, 2); P('#ffd24a', 8, 7, 1, 2); },
  sk_strike(P) { lin(P, '#cfd6e4', 2, 13, 12, 3, 2); P('#c8a040', 3, 10, 4, 1); lin(P, '#8a5a2a', 1, 14, 3, 12, 2); P('#fff', 10, 5); lin(P, '#ffffff88', 12, 8, 15, 5); lin(P, '#ffffff88', 11, 11, 15, 10); },
  sk_dodge(P) { P('#cfd6e4', 8, 3, 3, 3); P('#9aa4b8', 7, 6, 4, 5); lin(P, '#9aa4b8', 8, 10, 5, 13, 2); lin(P, '#9aa4b8', 10, 10, 12, 13, 2); lin(P, '#9aa4b8', 7, 7, 4, 9, 2); P('#ffffff55', 1, 5, 4, 1); P('#ffffff55', 0, 8, 5, 1); P('#ffffff55', 1, 11, 4, 1); }
};
const ICMAP = { scale: 'scale', pelt: 'pelt', silk: 'silk', teddy: 'teddy', parcel: 'parcel', caravan_goods: 'crate', tablet: 'tablet', signet: 'signet', seal_forest: 'seal', seal_fort: 'seal', seal_winter: 'seal', scroll_fire: 'scrollfire' };
itemIcon = function (it) {
  const id = it.id || '', key = id + '|' + it.ic + (it.col || '');
  if (SPR.icons[key]) return SPR.icons[key];
  let kind = ICMAP[id] || it.ic; if (/^chr\d/.test(id)) kind = 'lore'; if (!ICONS[kind]) return _icon0(it);
  const h = hsh(id || it.ic), col = it.col || '#ccc';
  const c = paint(16, 16, P => ICONS[kind](P, it, h, col));
  const u = outline(c).toDataURL(); SPR.icons[key] = u; return u;
};
