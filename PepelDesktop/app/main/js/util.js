'use strict';
const LITE = !!(window.PHONE || /[?&]lite/.test(location.search) || (matchMedia('(pointer:coarse)').matches && Math.min(screen.width, screen.height) < 900));
// ---------- Общие утилиты ----------
const TS = 16;                       // размер тайла
const VW = 480, VH = 270;            // виртуальное разрешение
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rnd = (a, b) => a + Math.random() * (b - a);
const rint = (a, b) => Math.floor(rnd(a, b + 1));
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const lerp = (a, b, t) => a + (b - a) * t;
const angTo = (a, b) => Math.atan2(b.y - a.y, b.x - a.x);
function angDiff(a, b) { let d = (a - b) % (Math.PI * 2); if (!isFinite(d)) return 0; if (d > Math.PI) d -= Math.PI * 2; else if (d < -Math.PI) d += Math.PI * 2; return d; }
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function fmtTime(s) { s = Math.floor(s); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); return h + ' ч ' + String(m).padStart(2, '0') + ' мин'; }
