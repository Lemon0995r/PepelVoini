'use strict';
// ---------- Боссы: защита от «зависаний» и закрытие арены ----------
const _ubl = updateBossLogic;
updateBossLogic = function (dt) {
  const e = G.boss; if (e && !e.dead) {
    const P = G.P, a = e.area;
    // арена закрывается: игрок не может выйти, пока босс жив
    if (!P.dead && e.st !== 'rec' || true) { P.x = clamp(P.x, a[0] + 5, a[2] - 5); P.y = clamp(P.y, a[1] + 8, a[3] - 5); }
    e.away = 0;
    if (e.st !== 'intro' && e.st !== 'judge') {
      // watchdog: застрял в rec
      if (e.st === 'rec') { e.recT = (e.recT || 0) + dt; if (e.recT > Math.max(e.stT, 0) + 3.5) { e.sch.length = 0; e.bdash = null; e.tele = null; e.st = 'idle'; e.cd = .3; e.recT = 0; if (!e.shielded && e.phase === (e.phase || 1) && !e.hide) e.invuln = false; } } else e.recT = 0;
      // watchdog: стоит на месте, хотя должен идти
      const dd = Math.hypot(P.x - e.x, P.y - e.y); e.wx = e.wx === undefined ? e.x : e.wx; e.wy = e.wy === undefined ? e.y : e.wy; e.wt = (e.wt || 0) + dt;
      if (e.st === 'idle' && dd > 60 && !e.tele) {
        if (Math.hypot(e.x - e.wx, e.y - e.wy) > 4) { e.wx = e.x; e.wy = e.y; e.wt = 0; }
        else if (e.wt > 1.1) {
          e.wt = 0; // обход: рывок вбок, потом блинк к игроку
          if (e.wn = (e.wn || 0) + 1, e.wn % 2) { const ang = Math.atan2(P.y - e.y, P.x - e.x) + (Math.random() < .5 ? 1.4 : -1.4); e.kx = Math.cos(ang) * 180; e.ky = Math.sin(ang) * 180; }
          else { const p = freeNear(P.x + rnd(-60, 60), P.y + rnd(-60, 60), 30, e.rc); if (p) { G.spark(e.x, e.y - 8, '#c8a0ff', 12, 80); e.x = p[0]; e.y = p[1]; G.spark(e.x, e.y - 8, '#c8a0ff', 12, 80); } }
        }
      } else { e.wx = e.x; e.wy = e.y; e.wt = 0; }
      // watchdog: бесконечная неуязвимость
      if (e.invuln && !e.shielded && !e.hide && e.st === 'idle') { e.invT = (e.invT || 0) + dt; if (e.invT > 2.5) { e.invuln = false; e.invT = 0; } } else e.invT = 0;
    }
  }
  if (e && !e.dead && e.st !== 'intro' && e.st !== 'judge') {
    const P = G.P;
    if (e.st === 'rec') {
      if (!e._rec) { e._rec = 1; e.stT = Math.max(.35, e.stT * .5); }               // короткая пауза после атаки
      if (!e.tele && !e.bdash && !e.hide && !P.dead && !e.sch.length) {              // не стоять: сближаться/кружить
        const dd = Math.hypot(P.x - e.x, P.y - e.y), ang = Math.atan2(P.y - e.y, P.x - e.x), sp = e.spd * .75 * (e.phase >= 2 ? 1.2 : 1);
        if (dd > 40) moveBody(e, Math.cos(ang) * sp * dt, Math.sin(ang) * sp * dt, e.rc);
        else { const o = ang + (e.bid.length % 2 ? 1.57 : -1.57); moveBody(e, Math.cos(o) * sp * .5 * dt, Math.sin(o) * sp * .5 * dt, e.rc); }
        e.fr = (e.fr + dt * 2) % 2;
      }
    } else e._rec = 0;
    if (e.st === 'idle' && e.cd > .5) e.cd = Math.min(e.cd, .5);
  }
  _ubl(dt);
};
// визуальный барьер арены
const _rw = renderWorld;
renderWorld = function (ctx) {
  _rw(ctx); const e = G.boss; if (!e || e.dead || !e.area) return;
  const a = e.area, cx = Math.round(G.cam.x), cy = Math.round(G.cam.y), t = G.t || 0, k = .5 + .5 * Math.sin(t * 5);
  ctx.save(); ctx.strokeStyle = 'rgba(190,150,255,' + (.45 + k * .35) + ')'; ctx.lineWidth = 2; ctx.setLineDash([6, 4]); ctx.lineDashOffset = -t * 20;
  ctx.strokeRect(a[0] - cx, a[1] - cy, a[2] - a[0], a[3] - a[1]);
  ctx.strokeStyle = 'rgba(120,80,220,' + (.18 + k * .15) + ')'; ctx.lineWidth = 6; ctx.setLineDash([]); ctx.strokeRect(a[0] - cx, a[1] - cy, a[2] - a[0], a[3] - a[1]);
  ctx.restore();
};
