/* ================= Partido jugable: vos manejás al jugador ================= */
// Cancha en metros: x de 0 (arco de tu equipo) a 105 (arco rival), y de 0 a 68.
const PL = 105, PW = 68, GOAL_HW = 4.2;
const ARC_LENS = [2, 3, 5];               // minutos reales por tiempo
// Niveles de dificultad del partido jugable
let DIFFS_ONLINE;
const DIFFS = {
  facil:   { name: '😊 Fácil',   aiF: 0.78, tk: 0.45, tkc: 0.7, aiErr: 1.7, myErr: 0.65, gk: 0.22, myTk: 0.22, aiShot: 0.6 },
  normal:  { name: '😐 Normal',  aiF: 0.87, tk: 0.75, tkc: 0.85, aiErr: 1.3, myErr: 0.85, gk: 0.1, myTk: 0.1, aiShot: 0.8 },
  dificil: { name: '😈 Difícil', aiF: 0.94, tk: 1, tkc: 1, aiErr: 1, myErr: 1, gk: 0, myTk: 0, aiShot: 1 },
};
const DF = () => (M && (M.online || M.coach)) ? DIFFS_ONLINE : DIFFS[(M && M.diff) || 'facil'];
// Contra un amigo: todo parejo, sin ayudas para nadie
DIFFS_ONLINE = { name: 'Amigos', aiF: 1, tk: 1, tkc: 1, aiErr: 0.85, myErr: 0.85, gk: 0, myTk: 0.12, aiShot: 1 };
// ¿Ese equipo lo maneja una persona? (local siempre; visitante solo contra un amigo)
const humanSide = side => side === 'home' ? !(M && M.coach) : !!(M && M.online && side === 'away');
const ctrlOf = side => side === 'home' ? M.ctrl : M.ctrl2;
function setCtrl(side, p) { if (!humanSide(side)) return; if (side === 'home') M.ctrl = p; else M.ctrl2 = p; }
// Botones de cada lado: los tuyos (teclado / pantalla) o los que manda tu amigo
function sideIn(side) {
  if (side === (M.mySide || 'home')) return { iv: inputVec(), sprint: KEYS.sprint, grab: KEYS.grab, take: () => { const w = M.want; M.want = {}; return w; } };
  if (M.online && M.rin) { const R = M.rin; return { iv: { x: R.x, y: R.y }, sprint: R.sprint, grab: R.grab, take: () => { const w = R.want; R.want = {}; return w; } }; }
  return null;
}
const KEYS = { up: false, down: false, left: false, right: false, sprint: false, grab: false };
const KMAP = {
  ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
  ShiftLeft: 'sprint', ShiftRight: 'sprint', KeyL: 'sprint', Space: 'shoot', KeyK: 'shoot', KeyX: 'pass', KeyJ: 'pass',
  KeyC: 'switch', KeyZ: 'grab', KeyV: 'slide', KeyB: 'slide', KeyP: 'pause', Escape: 'pause',
};
const gauss = () => (rnd() + rnd() + rnd() - 1.5) * 2;
const dirOf = side => side === 'home' ? 1 : -1;
const other = side => side === 'home' ? 'away' : 'home';
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
function nearest(list, x, y, skip) {
  let p = null, d = 1e9;
  for (const q of list) { if (skip && skip(q)) continue; const e = Math.hypot(q.x - x, q.y - y); if (e < d) { d = e; p = q; } }
  return { p, d };
}

/* ----- Jugadores ----- */
function mkP(side, i) {
  const p = { side, i, x: 0, y: 0, vx: 0, vy: 0, fx: dirOf(side), fy: 0, cool: 0, stun: 0, protect: 0, dec: 0, hold: 0, f: null };
  syncP(p); return p;
}
function syncP(p) {
  const Tm = M[p.side], id = Tm.xi[p.i], slot = FORMATIONS[Tm.f][p.i];
  p.id = id; p.slot = slot[0]; p.bx = slot[1]; p.by = slot[2]; p.gk = slot[0] === 'POR'; p.f = Tm.f;
  const s = stats(id, pOvr(id, p.side) - penalty(DB[id].p, slot[0]));
  if (DB[id].p === 'POR') { p.rit = s[4]; p.tir = 35; p.pas = s[2]; p.reg = 35; p.def = 35; p.ref = s[3]; p.gkv = s[4]; }
  else { [p.rit, p.tir, p.pas, p.reg, p.def] = s; p.ref = 25; p.gkv = 35; }
  p.spd0 = 6.2 + p.rit * 0.04;
  p.trait = traitOf(id, pOvr(id, p.side) - penalty(DB[id].p, slot[0]));
  if (p.trait === 'vel') p.spd0 *= 1.03;
}
function speedOf(p) { return p.spd0 * (0.85 + 0.15 * (M[p.side].st[p.id] ?? 100) / 100) * (p.stun > 0 ? 0.35 : 1); }
function syncAll() {
  for (const side of ['home', 'away']) M.P[side].forEach(p => { if (p.id !== M[side].xi[p.i] || p.f !== M[side].f) syncP(p); });
  if (humanSide('home') && (!M.ctrl || M.ctrl.gk)) M.ctrl = nearest(M.P.home, M.ball.x, M.ball.y, q => q.gk).p;
  if (M.online && (!M.ctrl2 || M.ctrl2.gk)) M.ctrl2 = nearest(M.P.away, M.ball.x, M.ball.y, q => q.gk).p;
}
function basePos(p) {
  const x = p.bx * 1.05, y = p.by * 0.68;
  return p.side === 'home' ? { x, y } : { x: PL - x, y: PW - y };
}
function anchor(p) {
  const B = M.ball, d = dirOf(p.side), b = basePos(p), line = LINE[p.slot];
  const att = B.owner && B.owner.side === p.side;
  let x = b.x + (B.x - PL / 2) * 0.5 + d * (att ? [0, 4, 8, 11][line] : -[0, 2, 4, 6][line]);
  let y = b.y + (B.y - PW / 2) * 0.3 + Math.sin(M.clock * 0.7 + p.i * 1.9) * 1.5;
  if (B.owner && !att && line <= 2) {
    // defendiendo: quedarse entre la pelota y el arco propio
    const lim = B.x - d * (line === 1 ? 3 : 0);
    if ((x - lim) * d > 0) x = lim;
    const og = p.side === 'home' ? 0 : PL;
    if (Math.abs(B.x - og) < 35) y += (B.y - y) * (line === 1 ? 0.35 : 0.2);
  }
  // delanteros que entran al área cuando la pelota está cerca del arco rival
  const tg = p.side === 'home' ? PL : 0;
  if (att && line === 3 && Math.abs(B.x - tg) < 30) { x += (tg - d * 9 - x) * 0.5; y += (PW / 2 - y) * 0.4; }
  if (M.coach && p.side === 'home') x += d * M.tac.m * [0, 3, 5, 6][line];
  return { x: clamp(x, 2, PL - 2), y: clamp(y, 2, PW - 2) };
}
function steer(p, vx, vy, dt) {
  const a = Math.min(1, dt * 9);
  p.vx += (vx - p.vx) * a; p.vy += (vy - p.vy) * a;
  p.x = clamp(p.x + p.vx * dt, -1, PL + 1); p.y = clamp(p.y + p.vy * dt, -1, PW + 1);
  const s = Math.hypot(p.vx, p.vy);
  if (s > 0.6) { p.fx = p.vx / s; p.fy = p.vy / s; }
}
function moveTo(p, tx, ty, sp, dt) {
  const dx = tx - p.x, dy = ty - p.y, d = Math.hypot(dx, dy);
  if (d < 0.25) return steer(p, 0, 0, dt);
  const s = Math.min(sp, d * 3);
  steer(p, dx / d * s, dy / d * s, dt);
}

/* ----- Pelota ----- */
function gain(p) {
  const B = M.ball;
  B.z = 0; B.vz = 0;
  B.owner = p; B.vx = B.vy = 0; B.lastSide = p.side; B.lastP = p; B.target = null; B.kind = null; B.gkDone = false; B.fkShot = null;
  p.dec = 0.35;
  if (p.gk) { p.hold = 1.0; p.protect = 1.5; }
  if (!p.gk) setCtrl(p.side, p);
}
function kick(p, tx, ty, speed, err, kind, vz = 0) {
  const B = M.ball, a = Math.atan2(ty - B.y, tx - B.x) + err;
  B.vx = Math.cos(a) * speed; B.vy = Math.sin(a) * speed; B.vz = vz; B.z = B.z || 0; B.hd = false;
  sndKick(Math.min(1, speed / 34));
  B.owner = null; B.lastSide = p.side; B.lastP = p; B.kicker = p; B.kind = kind; B.gkDone = false; B.target = null; B.wallChk = false; B.fkShot = null;
  p.cool = 0.35;
}
function laneBlocked(p, q) {
  const dx = q.x - p.x, dy = q.y - p.y, L2 = dx * dx + dy * dy || 1;
  let n = 0;
  for (const o of M.P[other(p.side)]) {
    const t = clamp(((o.x - p.x) * dx + (o.y - p.y) * dy) / L2, 0, 1);
    if (Math.hypot(p.x + dx * t - o.x, p.y + dy * t - o.y) < 1.8) n++;
  }
  return n;
}
function choosePass(p, dirx, diry, needGood) {
  const fw = dirOf(p.side); let best = null, bs = -1e9;
  for (const q of M.P[p.side]) {
    if (q === p) continue;
    const dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy);
    if (d < 3 || d > 48) continue;
    let s = (dirx || diry) ? (dx * dirx + dy * diry) / d * 40 : dx * fw * 0.5;
    s -= Math.abs(d - 16) * 0.35;
    s += Math.min(8, nearest(M.P[other(p.side)], q.x, q.y).d) * 1.6;
    s -= laneBlocked(p, q) * 14;
    if (q.gk) s -= 30;
    if (s > bs) { bs = s; best = q; }
  }
  return needGood && bs < 4 ? null : best;
}
const goalX = side => side === 'home' ? PL : 0;
// compañero en el área rival para tirarle un centro
function boxMate(p) {
  const gx = goalX(p.side); let best = null, bs = -1e9;
  for (const q of M.P[p.side]) {
    if (q === p || q.gk || !inBox(q.x, q.y, gx)) continue;
    const s = -Math.abs(q.y - PW / 2) - nearest(M.P[other(p.side)], q.x, q.y).d * -2 + LINE[q.slot] * 3;
    if (s > bs) { bs = s; best = q; }
  }
  return best;
}
function doCross(p, q) {
  const gx = goalX(p.side), tx = q ? q.x + q.vx * 0.6 : gx - dirOf(p.side) * 9, ty = q ? q.y + q.vy * 0.6 : PW / 2;
  const d = Math.hypot(tx - p.x, ty - p.y), tf = clamp(0.75 + d * 0.022, 0.9, 1.5);
  // llega a la altura de la cabeza (≈1,7 m) justo donde está el compañero
  kick(p, tx, ty, d / tf, gauss() * (0.02 + (100 - p.pas) / 100 * 0.08), 'cross', (1.7 + 4.9 * tf * tf) / tf);
  M.ball.target = q || null;
  if (q && !q.gk) setCtrl(p.side, q);
}
function doPass(p, q) {
  const d = dist(p, q), lob = d > 24 || (d > 12 && inBox(q.x, q.y, goalX(p.side)) && Math.abs(p.y - PW / 2) > 14);
  if (lob) {
    const tf = clamp(0.7 + d * 0.025, 1, 1.9), lead = tf * 0.6;
    kick(p, q.x + q.vx * lead, q.y + q.vy * lead, d / tf * 0.92, gauss() * (0.02 + (100 - p.pas) / 100 * 0.08), 'pass', 4.9 * tf);
    M.ball.target = q; if (!q.gk) setCtrl(p.side, q);
    return;
  }
  const sp = clamp(9 + 0.62 * d, 12, 31), t = d / (sp * 0.8);
  const err = gauss() * (0.015 + (100 - p.pas) / 100 * 0.09) * (p.trait === 'cer' ? 0.65 : 1);
  kick(p, q.x + q.vx * t * 0.6, q.y + q.vy * t * 0.6, sp, err, 'pass');
  M.ball.target = q;
  if (!q.gk) setCtrl(p.side, q);
}
function doShoot(p, power, aimY) {
  const d = dirOf(p.side), gx = d > 0 ? PL + 0.5 : -0.5, ty = PW / 2 + aimY;
  const dg = Math.hypot(gx - p.x, ty - p.y);
  const err = gauss() * (0.03 + (100 - p.tir) / 100 * 0.13 + Math.max(0, power - 0.85) * 0.3 + dg / 450) * (p.side === 'away' ? DF().aiErr : DF().myErr);
  const vz = M.fk && M.fk.pen ? 0.5 + rnd() * 2 : Math.max(0, 1.2 + (power - 0.6) * 6 + dg * 0.04 + gauss() * 1.1 * (p.side === 'away' ? DF().aiErr : DF().myErr));
  kick(p, gx, ty, 20 + 16 * power, err, 'shot', vz);
  M.shots[p.side === 'home' ? 0 : 1]++;
}
function tackle(p, ai) {
  const B = M.ball, o = B.owner;
  if (p.cool > 0 || p.stun > 0) return;
  p.cool = ai ? 1.0 : 0.6;
  if (!o || o.side === p.side) return;
  if (dist(p, o) > (ai ? 1.8 : 2.4) || o.protect > 0) { if (!ai) p.stun = 0.25; return; }
  const ch = ai ? clamp(0.3 + (p.def - o.reg) / 110, 0.1, 0.6) * (p.side === 'away' ? DF().tkc : 1) : clamp(0.5 + DF().myTk + (p.def - o.reg) / 90, 0.25, 0.92);
  if (rnd() < ch - (o.trait === 'gam' ? 0.12 : 0) + (p.trait === 'mur' ? 0.08 : 0)) {
    if (p.trait === 'mur' && rnd() < 0.25) bubble(p, '¡Acá no pasa nadie!');
    o.stun = 0.5; o.cool = 0.6; gain(p); p.cool = 0;
    if (!ai && rnd() < 0.35) matchLog(`💪 ¡Gran quite de <b>${esc(short(p.id))}</b>!`);
  } else {
    p.stun = ai ? 0.3 : 0.55;
    if (o.trait === 'gam' && rnd() < 0.35) { matchLog(`🎩 ¡Qué gambeta de <b>${esc(short(o.id))}</b>! Lo dejó pagando a ${esc(short(p.id))}.`); bubble(o, '¡Olé!', 1.2); sndRoar(0.35); }
    if (ai && rnd() < (p.side === 'away' ? 0.22 : 0.08)) foul(p, o);
  }
}

/* ----- Barrida ----- */
function startSlide(p) {
  if (p.slide > 0 || p.stun > 0 || p.cool > 0 || p.gk || M.fk) return;
  const B = M.ball, dx = B.x - p.x, dy = B.y - p.y, d = Math.hypot(dx, dy);
  if (d < 6 && d > 0.1) { p.sdx = dx / d; p.sdy = dy / d; } else { const m = Math.hypot(p.fx, p.fy) || 1; p.sdx = p.fx / m; p.sdy = p.fy / m; }
  p.slide = 0.55; p.sHit = false; p.cool = 1.1; p.fx = p.sdx; p.fy = p.sdy;
}
function slideStep(p, dt) {
  const B = M.ball;
  p.slide -= dt;
  const s = 3 + 10 * Math.max(0, p.slide) / 0.55;
  p.vx = p.sdx * s; p.vy = p.sdy * s;
  p.x = clamp(p.x + p.vx * dt, -1, PL + 1); p.y = clamp(p.y + p.vy * dt, -1, PW + 1);
  if (!p.sHit) {
    const o = B.owner;
    if (o && o.side !== p.side && (dist(p, B) < 1.4 || dist(p, o) < 1.3)) {
      p.sHit = true;
      const ch = o.protect > 0 ? 0 : humanSide(p.side)
        ? clamp(0.6 + DF().myTk + (p.def - o.reg) / 90, 0.35, 0.93)
        : clamp(0.35 + (p.def - o.reg) / 110, 0.15, 0.6) * DF().tkc;
      if (rnd() < ch) {
        o.stun = 0.7; o.cool = 0.7; B.owner = null;
        B.vx = p.sdx * 4 + (rnd() - 0.5) * 2; B.vy = p.sdy * 4 + (rnd() - 0.5) * 2;
        B.lastSide = p.side; B.lastP = p; B.kind = null; B.target = null;
        p.cool = Math.max(0, p.slide) + 0.05; p.won = true;
        if (humanSide(p.side) && rnd() < 0.5) matchLog(`🦵 ¡Barrida perfecta de <b>${esc(short(p.id))}</b>!`);
      } else if (o.protect <= 0 && rnd() < 0.65) return foul(p, o);
    } else if (!o && dist(p, B) < 1.3) {
      p.sHit = true; B.vx = p.sdx * 10; B.vy = p.sdy * 10; B.lastSide = p.side; B.lastP = p; B.kind = null; B.target = null;
    }
  }
  if (p.slide <= 0) { p.slide = 0; p.stun = p.won ? 0.15 : 0.45; p.won = false; p.vx = p.vy = 0; }
}

/* ----- Faltas, tiros libres y penales ----- */
const inBox = (x, y, gx) => Math.abs(x - gx) < 16.5 && Math.abs(y - PW / 2) < 20.15;
function foul(p, victim) {
  const side = victim.side, d = dirOf(side), gx = d > 0 ? PL : 0, wasSlide = p.slide > 0;
  p.slide = 0; p.stun = 0.4; victim.stun = 0;
  M.cards = M.cards || {};
  if (!M.cards[p.id] && rnd() < (wasSlide ? 0.45 : 0.22)) {
    M.cards[p.id] = 1; p.yellow = true; react(p, 'protest', pick(PROTEST_SAY), 1.6);
    setTimeout(() => { if (M && !M.ended) { matchLog(`🟨 Tarjeta amarilla para <b>${esc(short(p.id))}</b>.`, 'card'); banner('🟨 AMARILLA · ' + short(p.id), '#facc15'); } }, 900);
  }
  const pen = inBox(victim.x, victim.y, gx);
  const who = esc(short(p.id));
  if (M.online) {
    const tn = sd => sd === 'home' ? esc(M.homeName) : M.r.name;
    matchLog(pen ? `😱 ¡PENAL para ${tn(side)}! Falta de <b>${who}</b> en el área.` : `🟨 Falta de <b>${who}</b>. Tiro libre para ${tn(side)}.`, 'info');
  } else if (pen) matchLog(side === 'home' ? `😱 ¡PENAL! Falta de <b>${who}</b> en el área. ¡Penal para vos!` : `😬 ¡Penal en contra! Falta de <b>${who}</b> en el área.`, 'info');
  else matchLog(side === 'home' ? `🟨 Falta de <b>${who}</b>. ¡Tiro libre para vos!` : `🟨 Falta de <b>${who}</b>. Tiro libre para ${esc(M.r.name)}.`, 'info');
  setFK(side, pen ? gx - d * 11 : victim.x, pen ? PW / 2 : victim.y, pen);
}
function setFK(side, x, y, pen, corner = false) {
  const B = M.ball, d = dirOf(side), gx = d > 0 ? PL : 0, def = other(side);
  x = clamp(x, 1, PL - 1); y = clamp(y, 1, PW - 1);
  const dg = Math.hypot(gx - x, PW / 2 - y), ux = (gx - x) / dg, uy = (PW / 2 - y) / dg;
  for (const q of M.all) { q.vx = q.vy = 0; q.stun = q.cool = q.slide = 0; q.wall = false; q.wallTried = false; q.protect = 0; }
  const field = M.P[side].filter(q => !q.gk);
  const taker = (pen || dg < 35) ? field.slice().sort((a, b) => b.tir - a.tir)[0] : nearest(field, x, y).p;
  taker.x = x - ux * 0.9; taker.y = y - uy * 0.9; taker.fx = ux; taker.fy = uy;
  // barrera
  if (!pen && !corner && dg < 34) {
    const n = dg < 22 ? 4 : 3, wx = x + ux * 9.15, wy = y + uy * 9.15;
    const wall = M.P[def].filter(q => !q.gk).sort((a, b) => Math.hypot(a.x - wx, a.y - wy) - Math.hypot(b.x - wx, b.y - wy)).slice(0, n);
    wall.forEach((q, i) => { const o = (i - (n - 1) / 2) * 0.9; q.x = wx - uy * o; q.y = wy + ux * o; q.fx = -ux; q.fy = -uy; q.wall = true; });
  }
  for (const q of M.all) {
    if (q === taker || q.wall || q.gk) continue;
    if (q.side === def) { const dd = Math.hypot(q.x - x, q.y - y); if (dd < 9.15) { q.x = x + (q.x - x) / (dd || 1) * 9.2; q.y = clamp(y + (q.y - y) / (dd || 1) * 9.2, 1, PW - 1); } }
    if (pen && inBox(q.x, q.y, gx)) q.x = gx - d * 18;
  }
  const gk = M.P[def].find(q => q.gk); if (gk && pen) { gk.x = gx - d * 0.3; gk.y = PW / 2; }
  if (corner) {
    // córner: delanteros al área, defensores marcando
    const spots = [[6, -3], [9, 3], [11, -1], [13, 5], [7, 6]];
    const atk = M.P[side].filter(q => !q.gk && q !== taker).sort((a, b) => b.bx - a.bx).slice(0, 5);
    const dfs = M.P[def].filter(q => !q.gk).sort((a, b) => a.bx - b.bx).slice(0, 5);
    atk.forEach((q, i) => { q.x = gx - d * spots[i][0]; q.y = PW / 2 + spots[i][1]; });
    dfs.forEach((q, i) => { q.x = gx - d * (spots[i][0] - 0.8); q.y = PW / 2 + spots[i][1] + 0.7; });
    if (gk) { gk.x = gx - d * 1; gk.y = PW / 2; }
  }
  B.x = x; B.y = y; B.vx = B.vy = 0; B.owner = null;
  gain(taker); taker.protect = 99; taker.dec = 99;
  M.fk = { side, pen, corner, taker, t: humanSide(side) ? 999 : 1.8, x, y };
  if (corner) { banner('🚩 CÓRNER', '#facc15'); matchLog(`🚩 Córner para ${side === 'home' ? esc(M.homeName || save.name) : M.r.name}.`, 'info'); }
  else sndWhistle(pen ? 2 : 1);
  M.charge = 0; M.want = {}; M.cam = null;
}
function fkStep(dt) {
  const F = M.fk, B = M.ball, t = F.taker;
  if (B.owner !== t) { M.fk = null; t.protect = 0; t.dec = 0.3; M.wallT = 1.2; return false; }
  F.t -= dt;
  const d = dirOf(F.side), gx = d > 0 ? PL : 0;
  for (const p of M.all) {
    if (p === t || p.wall) { steer(p, 0, 0, dt); continue; }
    if (p.gk && !F.corner) { gkMove(p, dt); continue; }
    if (F.corner) { steer(p, 0, 0, dt); continue; }
    const a = anchor(p); moveTo(p, a.x, a.y, speedOf(p) * 0.4, dt);
    if (p.side !== F.side) { const dd = Math.hypot(p.x - F.x, p.y - F.y); if (dd < 9.15) { p.x = F.x + (p.x - F.x) / (dd || 1) * 9.15; p.y = F.y + (p.y - F.y) / (dd || 1) * 9.15; } }
    if (F.pen && inBox(p.x, p.y, gx)) p.x = gx - d * 16.6;
  }
  t.x = F.x - t.fx * 0.9; t.y = F.y - t.fy * 0.9;
  if (humanSide(F.side)) {
    const I = sideIn(F.side), w = I ? I.take() : {};
    if (F.side === (M.mySide || 'home') && M.charge > 0) M.charge += dt;
    const iv = I ? I.iv : { x: 0, y: 0 };
    if (F.corner) { if (w.shoot || w.pass) doCross(t, boxMate(t)); }
    else if (w.shoot) { M.fkAim = iv.y * 3.6; doShoot(t, clamp(w.shoot / 0.8, 0.3, 1), M.fkAim + (rnd() - 0.5) * 0.8); }
    else if (w.pass) { const q = choosePass(t, iv.x || d, iv.y); if (q) doPass(t, q); }
  } else if (F.t <= 0 && F.corner) doCross(t, boxMate(t));
  else if (F.t <= 0) {
    const dg = Math.hypot(gx - F.x, PW / 2 - F.y);
    if (F.pen || dg < 32) M.fkAim = 2, doShoot(t, F.pen ? 0.7 + rnd() * 0.2 : 0.65 + rnd() * 0.3, (rnd() < 0.5 ? -1 : 1) * (1.2 + rnd() * 2.6));
    else { const q = choosePass(t, d, 0); if (q) doPass(t, q); else kick(t, F.x + d * 35, PW / 2, 26, 0, 'pass'); }
  }
  if (B.owner === t) { B.x = F.x; B.y = F.y; B.vx = B.vy = 0; }
  else {
    if (B.kind === 'shot') B.fkShot = F.pen ? 'pen' : 'fk'; M.fk = null; t.protect = 0; t.dec = 0.3; M.wallT = 1.2; }
  return true;
}

// Cabezazos: un jugador debajo de la pelota que viene por el aire
function headers(B) {
  let best = null, bd = 1.1;
  for (const p of M.all) {
    if (p.gk || p.cool > 0 || p.stun > 0 || p.slide > 0) continue;
    const d = dist(p, B); if (d < bd) { bd = d; best = p; }
  }
  if (!best) return;
  B.hd = true;
  const p = best, gx = goalX(p.side), ogx = goalX(other(p.side)), dg = Math.hypot(gx - p.x, PW / 2 - p.y);
  if (dg < 18 && rnd() < 0.85) {
    const ty = PW / 2 + (rnd() - 0.5) * 6;
    kick(p, gx, ty, 15 + p.tir * 0.07, gauss() * (0.05 + (100 - p.tir) / 100 * 0.1), 'shot', 0.6 + rnd() * 2.2);
    M.ball.z = 1.9; M.shots[p.side === 'home' ? 0 : 1]++;
    if (rnd() < 0.6) matchLog(`🤕 ¡Cabezazo de <b>${esc(short(p.id))}</b>!`);
  } else if (Math.abs(p.x - ogx) < 30) {
    // despeje de cabeza, lejos del arco propio
    kick(p, p.x + dirOf(p.side) * 22, p.y + (rnd() - 0.5) * 24, 15, 0, 'clear', 5);
    M.ball.z = 1.9;
  } else {
    const q = choosePass(p, dirOf(p.side), 0);
    if (q) kick(p, q.x, q.y, clamp(dist(p, q) * 0.9, 8, 18), 0.05, 'pass', 2.5); else kick(p, p.x + dirOf(p.side) * 12, p.y, 12, 0, 'pass', 2);
    M.ball.z = 1.9;
  }
  p.cool = 0.4;
}
// Cartel grande en la pantalla (¡PALO!, ¡ATAJADA!, CÓRNER…)
function banner(text, color = '#facc15') { if (M) M.banner = { text, color, t: 1.6 }; }

/* ----- Inteligencia ----- */
function aiCarry(p, dt, sf) {
  const d = dirOf(p.side), gx = d > 0 ? PL : 0;
  if (p.gk) {
    steer(p, 0, 0, dt); p.hold -= dt;
    if (p.hold <= 0) {
      const q = choosePass(p, d, 0, true);
      if (q) doPass(p, q);
      else kick(p, p.x + d * 42, PW / 2 + (rnd() - 0.5) * 34, 24, 0, 'pass', 9);
    }
    return;
  }
  const opp = nearest(M.P[other(p.side)], p.x, p.y);
  let vx = gx - p.x, vy = PW / 2 + (p.y - PW / 2) * 0.6 - p.y, m = Math.hypot(vx, vy) || 1; vx /= m; vy /= m;
  if (opp.d < 5) { vx += (p.x - opp.p.x) / opp.d * 0.6; vy += (p.y - opp.p.y) / opp.d * 0.9; m = Math.hypot(vx, vy) || 1; vx /= m; vy /= m; }
  const sp = speedOf(p) * 0.86 * sf;
  steer(p, vx * sp, vy * sp, dt);
  p.dec -= dt; if (p.dec > 0) return;
  p.dec = 0.22 + rnd() * 0.25;
  const dg = Math.hypot(gx - p.x, PW / 2 - p.y);
  const tm = M.coach && p.side === 'home' ? M.tac.m : 0;
  if (dg < 25 && rnd() < (dg < 15 ? 0.45 : 0.15) * (p.side === 'away' ? DF().aiShot : 1) * (1 + tm * 0.35) * (p.trait === 'gol' ? 1.4 : 1)) {
    const gk = M.P[other(p.side)].find(q => q.gk);
    return doShoot(p, 0.55 + rnd() * 0.35, (gk && gk.y > PW / 2 ? -1 : 1) * (1.4 + rnd() * 2.3));
  }
  if (opp.d < 3.5 && rnd() < (p.trait === 'gam' ? 0.2 : 0.5)) { const q = choosePass(p, 0, 0); if (q) return doPass(p, q); }
  if (rnd() < (0.08 + tm * 0.04) * (p.trait === 'cer' ? 2 : 1)) { const q = choosePass(p, 0, 0, true); if (q && (q.x - p.x) * d > 5) doPass(p, q); }
  // centro desde la punta
  if (Math.abs(p.y - PW / 2) > 18 && Math.abs(gx - p.x) < 22 && rnd() < 0.35) { const q = boxMate(p); if (q) return doCross(p, q); }
}
function gkMove(p, dt) {
  const B = M.ball, d = dirOf(p.side), gl = p.side === 'home' ? 0 : PL, bs = Math.hypot(B.vx, B.vy);
  let tx = gl + d * (1.5 + clamp((35 - Math.abs(B.x - gl)) / 35, 0, 1) * 2.5), ty = clamp(B.y, PW / 2 - 3.5, PW / 2 + 3.5);
  const toward = !B.owner && B.vx * -d > 4;
  if (toward) {
    const tc = (gl + d * 1.2 - B.x) / B.vx;
    if (tc > 0 && tc < 2) { const yc = B.y + B.vy * tc; if (Math.abs(yc - PW / 2) < GOAL_HW + 2) ty = clamp(yc, PW / 2 - GOAL_HW - 1, PW / 2 + GOAL_HW + 1); }
  }
  if (!B.owner && bs < 12 && Math.hypot(B.x - gl, B.y - PW / 2) < 13 && dist(p, B) < nearest(M.P[other(p.side)], B.x, B.y).d) { tx = B.x; ty = B.y; }
  moveTo(p, tx, ty, 5 + p.gkv * 0.04, dt);
  if (toward && !B.gkDone && bs > 8 && (B.z || 0) < 2.6) {
    const dd = dist(p, B);
    if (dd < 1.6 + p.ref / 100 * 1.6) {
      B.gkDone = true;
      const tir = B.kind === 'shot' && B.kicker ? B.kicker.tir : 50;
      const ch = clamp(0.72 + (p.ref - 70) / 50 - (bs - 24) / 30 - (tir - 70) / 160 + (dd < 1.2 ? 0.15 : 0) + (p.side === 'home' ? DF().gk : 0) - (B.fkShot === 'pen' ? 0.4 : B.fkShot === 'fk' ? 0.2 : 0) + (p.trait === 'gk' ? 0.05 : 0), 0.1, 0.95);
      if (dd > 0.9) { p.dive = 0.7; p.diveDir = (B.y + B.vy * 0.1 > p.y ? 1 : -1) * dirOf(p.side); }
      if (rnd() < ch) {
        const si = p.side === 'home' ? 1 : 0;
        if (B.kind === 'shot') { banner('🧤 ¡ATAJADA!', '#38bdf8'); sndRoar(0.5); if (rnd() < 0.4) bubble(p, pick(['¡Mía!', '¡Acá estoy!', '¡No pasa!'])); if (B.kicker) react(B.kicker, 'hands_head', rnd() < 0.5 ? pick(MISS_SAY) : null, 1.2); }
        if (B.kind === 'shot') { M.onT[si]++; matchLog(fmt(pick(T.save), { g: short(p.id), a: short(B.kicker.id) }), 'save'); }
        if (bs < 22 || rnd() < 0.45) gain(p);
        else if (rnd() < 0.5) {  // la manda al córner por arriba del travesaño
          B.vx = -dirOf(p.side) * 3; B.vy = (rnd() - 0.5) * 4; B.vz = 10; B.z = Math.max(B.z || 0, 1); B.lastSide = p.side; B.lastP = p; B.kind = null; p.cool = 0.6;
        } else { B.vx = -B.vx * 0.3; B.vy = (rnd() - 0.5) * 16; B.lastSide = p.side; B.lastP = p; B.kind = null; p.cool = 0.4; }
      }
    }
  }
}
function offBall(p, dt, sf) {
  if (p.gk) return gkMove(p, dt);
  const B = M.ball, theirs = B.owner && B.owner.side !== p.side, sp = speedOf(p) * sf;
  if (B.target === p && !B.owner) return moveTo(p, B.x + B.vx * 0.25, B.y + B.vy * 0.25, sp, dt);
  if (!B.owner || theirs) {
    if (p === M.chaser[p.side] || (theirs && M.coach && p.side === 'home' && M.tac.pr === 2 && p === M.cover.home)) {
      const lead = theirs ? 0.15 : 0.3;
      moveTo(p, B.x + B.vx * lead, B.y + B.vy * lead, sp * (p.side === 'home' ? 0.92 : 0.97), dt);
      if (theirs && dist(p, B.owner) < 1.8 && rnd() < dt * 2.5 * (p.side === 'away' ? DF().tk : 1)) tackle(p, true);
      else if (theirs && dist(p, B.owner) < 3.2 && dist(p, B.owner) > 1.6 && rnd() < dt * 0.35 * (p.side === 'away' ? DF().tk : 0.5)) startSlide(p);
      return;
    }
    if (theirs && p === M.cover[p.side]) {
      const og = p.side === 'home' ? 0 : PL;
      return moveTo(p, B.x + (og - B.x) * 0.35, B.y + (PW / 2 - B.y) * 0.35, sp * 0.8, dt);
    }
  }
  const a = anchor(p); moveTo(p, a.x, a.y, sp * 0.7, dt);
}

/* ----- Controles ----- */
function inputVec() {
  let x = (KEYS.right ? 1 : 0) - (KEYS.left ? 1 : 0) + M.joy.x, y = (KEYS.down ? 1 : 0) - (KEYS.up ? 1 : 0) + M.joy.y;
  const m = Math.hypot(x, y); if (m > 1) { x /= m; y /= m; }
  return { x, y };
}
function press(k) {
  if (!M || !M.arcade || M.paused || M.ended) return;
  if (k === 'shoot') M.charge = 0.001;
  else if (k === 'pass') M.want.pass = true;
  else if (k === 'switch') M.want.sw = true;
  else if (k === 'slide') M.want.slide = true;
  else if (k === 'pause') pauseArc();
  else KEYS[k] = true;
}
function release(k) {
  if (k === 'shoot') { if (M && M.charge > 0) { M.want.shoot = M.charge; M.charge = 0; } }
  else if (k in KEYS) KEYS[k] = false;
}
function clearInput() { Object.keys(KEYS).forEach(k => KEYS[k] = false); if (M) { M.charge = 0; M.want = {}; M.joy = { x: 0, y: 0 }; } const kn = $('#knob'); if (kn) kn.style.transform = ''; }
window.addEventListener('keydown', e => {
  const k = KMAP[e.code]; if (!k || !M || !M.arcade || M.ended || !M.cv || M.paused) return;
  e.preventDefault(); if (!e.repeat) press(k);
});
window.addEventListener('keyup', e => { const k = KMAP[e.code]; if (k && M && M.arcade) release(k); });
window.addEventListener('blur', () => { if (M && M.arcade) clearInput(); });
function pauseArc() { if (!M || M.ended || M.online) return; M.paused = true; clearInput(); openMatchEditor('Partido en pausa'); }
function arcResume() { clearInput(); syncAll(); if (M.needKick) { const s = M.needKick; M.needKick = null; kickoff(s); } }

function userStep(dt) { userStepFor('home', dt); if (M.online) userStepFor('away', dt); }
function userStepFor(side, dt) {
  const I = sideIn(side), p = ctrlOf(side); if (!I || !p) return;
  const B = M.ball, mine = B.owner === p, w = I.take();
  if (side === (M.mySide || 'home') && M.charge > 0) M.charge += dt;
  if (p.slide > 0) return;
  if (w.slide && !mine) { startSlide(p); if (p.slide > 0) return; }
  if (w.sw) {
    const n = nearest(M.P[side], B.x, B.y, q => q.gk || q === p).p;
    if (n && !mine) setCtrl(side, n);
  }
  if (w.pass) {
    if (mine) { const iv = I.iv, q = choosePass(p, iv.x || (iv.y ? 0 : p.fx), iv.y || (iv.x ? 0 : p.fy)); if (q) doPass(p, q); }
    else tackle(p, false);
  }
  if (w.shoot) {
    if (mine) { const iv = I.iv; doShoot(p, clamp(w.shoot / 0.8, 0.25, 1), iv.y * 3.3 + (rnd() - 0.5) * 1.5); }
    else tackle(p, false);
  }
  const c = ctrlOf(side), iv = I.iv, sp = speedOf(c) * (I.sprint ? 1 : 0.78) * (B.owner === c ? 0.9 : 1);
  if (I.grab && B.owner !== c) {
    // botón AGARRAR: corre solo hacia la pelota y, si la tiene un rival, intenta robarla
    moveTo(c, B.x + B.vx * 0.2, B.y + B.vy * 0.2, speedOf(c), dt);
    if (B.owner && B.owner.side !== side && dist(c, B.owner) < 2.2) tackle(c, false);
    return;
  }
  steer(c, iv.x * sp, iv.y * sp, dt);
  if (iv.x || iv.y) { const m = Math.hypot(iv.x, iv.y); c.fx = iv.x / m; c.fy = iv.y / m; }
}
function autoSwitch(dt) { autoSwitchFor('home', 'swT', dt); if (M.online) autoSwitchFor('away', 'swT2', dt); }
function autoSwitchFor(side, key, dt) {
  const B = M.ball;
  M[key] = (M[key] || 0) - dt; if (M[key] > 0) return; M[key] = 0.25;
  if (B.owner && B.owner.side === side) return;
  if (!B.owner && B.target && B.target.side === side) return;
  const cur = ctrlOf(side); if (cur && cur.slide > 0) return;
  const n = nearest(M.P[side], B.x + B.vx * 0.3, B.y + B.vy * 0.3, q => q.gk).p;
  if (n !== cur && (!cur || dist(n, B) + 4 < dist(cur, B))) setCtrl(side, n);
}
function bindTouch() {
  const joy = $('#joy'), knob = $('#knob');
  if (joy) {
    const upd = e => {
      const r = joy.getBoundingClientRect(), R = r.width / 2;
      let x = (e.clientX - r.left - R) / R, y = (e.clientY - r.top - R) / R; const m = Math.hypot(x, y);
      if (m > 1) { x /= m; y /= m; }
      M.joy = Math.hypot(x, y) < 0.18 ? { x: 0, y: 0 } : { x, y };
      knob.style.transform = `translate(${x * R * 0.6}px,${y * R * 0.6}px)`;
    };
    joy.onpointerdown = e => { joy.setPointerCapture(e.pointerId); upd(e); };
    joy.onpointermove = e => { if (joy.hasPointerCapture(e.pointerId)) upd(e); };
    joy.onpointerup = joy.onpointercancel = () => { M.joy = { x: 0, y: 0 }; knob.style.transform = ''; };
  }
  app.querySelectorAll('[data-k]').forEach(b => {
    b.onpointerdown = e => { e.preventDefault(); b.setPointerCapture(e.pointerId); b.classList.add('on'); press(b.dataset.k); };
    b.onpointerup = b.onpointercancel = () => { b.classList.remove('on'); release(b.dataset.k); };
    b.oncontextmenu = e => e.preventDefault();
  });
}

/* ----- Reglas: saques, goles ----- */
function kickoff(side) {
  const B = M.ball;
  for (const p of M.all) {
    const k = (PL / 2 - 1.5) / PL;
    p.x = p.side === 'home' ? p.bx * 1.05 * k : PL - p.bx * 1.05 * k; p.y = basePos(p).y;
    p.vx = p.vy = 0; p.stun = p.cool = p.slide = 0; p.wall = false; p.pose = null; p.fx = dirOf(p.side); p.fy = 0;
  }
  const fw = M.P[side].filter(p => !p.gk).sort((a, b) => b.bx - a.bx), d = dirOf(side);
  fw[0].x = PL / 2 - d * 0.6; fw[0].y = PW / 2;
  fw[1].x = PL / 2 - d * 2; fw[1].y = PW / 2 + 7;
  B.x = PL / 2; B.y = PW / 2; B.vx = B.vy = 0; B.owner = null;
  gain(fw[0]); fw[0].protect = 1.2;
  M.goalT = 0; M.fk = null; M.celeb = null; M.bubbles = [];
  if (!humanSide('home')) M.ctrl = null; else if (side === 'home') M.ctrl = fw[0]; else M.ctrl = nearest(M.P.home, B.x, B.y, q => q.gk).p;
  if (M.online) M.ctrl2 = side === 'away' ? fw[0] : nearest(M.P.away, B.x, B.y, q => q.gk).p;
}
function restart(side, x, y, gkKick) {
  const B = M.ball, team = M.P[side];
  for (const q of M.all) q.slide = 0;
  const t = gkKick ? team.find(p => p.gk) : nearest(team, x, y, p => p.gk).p;
  t.x = x; t.y = y; t.vx = t.vy = 0;
  const cx = PL / 2 - x, cy = PW / 2 - y, m = Math.hypot(cx, cy) || 1; t.fx = cx / m; t.fy = cy / m;
  for (const o of M.P[other(side)]) { const dd = Math.hypot(o.x - x, o.y - y); if (dd < 7) { o.x += (o.x - x) / (dd || 1) * (7 - dd); o.y = clamp(o.y + (o.y - y) / (dd || 1) * (7 - dd), 1, PW - 1); } }
  B.x = x + t.fx * 0.9; B.y = y + t.fy * 0.9; B.vx = B.vy = 0; B.owner = null;
  gain(t); t.protect = 1.3; if (gkKick) t.hold = 1.2;
}
function goal(si) {
  const B = M.ball, side = si ? 'away' : 'home', lp = B.lastP;
  const own = lp && lp.side !== side, id = lp ? lp.id + (own ? ' (e/c)' : '') : '—';
  M.score[si]++; M.scorers[si].push({ id, min: M.min });
  if (B.kind === 'shot' && !own) M.onT[si]++;
  const gk = M.P[other(side)].find(p => p.gk);
  matchLog(own ? `😬 ¡Gol en contra de <b>${esc(short(lp.id))}</b>!` : fmt(pick(T.goal), { a: short(lp.id), g: gk ? short(gk.id) : '' }), 'goal ' + side);
  goalFlash(own ? id : lp.id, si);
  updateHUD();
  B.owner = null; B.vx *= 0.15; B.vy *= 0.15;
  M.goalT = 3.6; M.kickAfter = other(side);
  M.celeb = own ? null : { p: lp, side };
  if (!own && lp) bubble(lp, pick(GOAL_SAY), 2.4);
}
function checkBounds() {
  const B = M.ball;
  if (B.x >= 0 && B.x <= PL && B.y >= 0 && B.y <= PW) return;
  if (B.owner) { B.owner.x = clamp(B.owner.x, 0.5, PL - 0.5); B.owner.y = clamp(B.owner.y, 0.5, PW - 0.5); B.owner = null; }
  if (B.x < 0 || B.x > PL) {
    const off = Math.abs(B.y - PW / 2), z = B.z || 0;
    const post = Math.abs(off - GOAL_HW) < 0.22 && z < 2.44, bar = off < GOAL_HW && Math.abs(z - 2.44) < 0.16;
    if ((post || bar) && Math.abs(B.vx) > 6) {
      B.x = B.x < 0 ? 0.15 : PL - 0.15; B.vx = -B.vx * 0.45; B.vy += (rnd() - 0.5) * 6; if (bar) B.vz = -Math.abs(B.vz || 0) * 0.4 - 1;
      react(B.kicker || B.lastP, 'hands_head', '¡Noooo!', 1.4); B.kind = null; matchLog(post ? '😮 ¡La pelota pegó en el palo!' : '😮 ¡Pegó en el travesaño!', 'miss'); banner(post ? '¡PALO!' : '¡TRAVESAÑO!', '#f8fafc'); sndRoar(0.45);
      return;
    }
    if (off < GOAL_HW && z < 2.44) { sndRoar(1); sndWhistle(1); return goal(B.x > PL ? 0 : 1); }
    if (off < GOAL_HW + 4 && B.kind === 'shot') { react(B.kicker, 'hands_head', pick(MISS_SAY), 1.3); matchLog(z >= 2.44 ? '🙈 ¡Se fue por arriba del travesaño!' : '🙈 ¡Se fue afuera, cerca del palo!', 'miss'); sndRoar(0.3); }
    const def = B.x < 0 ? 'home' : 'away', att = other(def);
    if (B.lastSide === def) { setFK(att, B.x < 0 ? 0.6 : PL - 0.6, B.y < PW / 2 ? 0.6 : PW - 0.6, false, true); }
    else { restart(def, B.x < 0 ? 5.5 : PL - 5.5, PW / 2, true); banner('SAQUE DE ARCO', '#e5e7eb'); }
    return;
  }
  restart(other(B.lastSide || 'home'), clamp(B.x, 1, PL - 1), B.y < 0 ? 0.4 : PW - 0.4); banner('LATERAL', '#e5e7eb');
}

/* ----- Bucle principal ----- */
function staminaMinute() {
  for (const side of ['home', 'away']) M[side].xi.forEach(id => {
    if (!id) return;
    const fis = DB[id].p === 'POR' ? 90 : stats(id, pOvr(id, side))[5];
    const drop = (DB[id].p === 'POR' ? 0.08 : 0.22 + (100 - fis) * 0.006) * (0.8 + rnd() * 0.4);
    M[side].st[id] = Math.max(0, (M[side].st[id] ?? 100) - drop);
  });
}
function arcStep(dt) {
  const B = M.ball;
  M.clock += dt;
  const frac = M.clock / M.halfLen, min = Math.min(45, Math.floor(frac * 45)) + (M.half === 2 ? 45 : 0);
  if (min !== M.min) { M.min = min; staminaMinute(); if (!M.online) aiSubs(); syncAll(); updateHUD(); }
  if (frac >= 1 && M.goalT <= 0 && M.online) return onlineWhistle();
  if (frac >= 1 && M.goalT <= 0) {
    if (M.half === 1) { M.half = 2; M.clock = 0; M.paused = true; M.needKick = 'away'; clearInput(); matchLog('⏸️ Final del primer tiempo.', 'info'); return halftime(); }
    return endMatch();
  }
  for (const p of M.all) { p.cool -= dt; p.stun -= dt; p.protect -= dt; if (p.dive > 0) p.dive -= dt; }
  if (M.banner && (M.banner.t -= dt) <= 0) M.banner = null;
  for (const p of M.all) if (p.pose) { p.pose.t += dt; if (p.pose.dur && p.pose.t > p.pose.dur) p.pose = null; }
  if (M.bubbles) M.bubbles = M.bubbles.filter(b => (b.t -= dt) > 0);
  M.ticks++; M.possSum += B.owner ? (B.owner.side === 'home' ? 1 : 0) : 0.5;

  if (M.goalT > 0) {
    M.goalT -= dt;
    const C = M.celeb;
    for (const p of M.all) {
      if (C && C.p) {
        if (p === C.p) {                                   // el goleador corre al banderín y festeja a su manera
          if (!C.spot) {   // corre unos metros hacia el banderín (no más de 8)
            const fx = C.side === 'home' ? PL - 4 : 4, fy = C.p.y < PW / 2 ? 5 : PW - 5, dd = Math.hypot(fx - p.x, fy - p.y), m = Math.min(1, 8 / (dd || 1));
            C.spot = { x: p.x + (fx - p.x) * m, y: p.y + (fy - p.y) * m }; C.run = 0;
          }
          C.run += dt;
          if (Math.hypot(C.spot.x - p.x, C.spot.y - p.y) > 1.2 && !p.pose && C.run < 1.3) moveTo(p, C.spot.x, C.spot.y, speedOf(p), dt);
          else { steer(p, 0, 0, dt); if (!p.pose) p.pose = { type: look(p).cel, t: 0 }; }
          continue;
        }
        if (p.side === C.side && !p.gk) {                  // los compañeros lo van a abrazar
          const tx = C.p.x - dirOf(p.side) * (1.2 + (p.i % 3) * 0.6), ty = C.p.y + ((p.i % 4) - 1.5) * 0.9;
          if (Math.hypot(tx - p.x, ty - p.y) > 1.4) moveTo(p, tx, ty, speedOf(p) * 0.85, dt);
          else { steer(p, 0, 0, dt); if (!p.pose) p.pose = { type: 'arms_up', t: 0 }; }
          continue;
        }
        if (p.side !== C.side && (p.gk || p.i % 3 === 0)) { steer(p, 0, 0, dt); if (!p.pose) p.pose = { type: 'hands_head', t: 0 }; continue; }
      }
      const a = basePos(p); moveTo(p, a.x, a.y, speedOf(p) * 0.4, dt);
    }
    B.x += B.vx * dt; B.y += B.vy * dt; B.vx *= 0.95; B.vy *= 0.95;
    if (M.goalT <= 0) kickoff(M.kickAfter);
    return;
  }

  if (M.wallT > 0) { M.wallT -= dt; if (M.wallT <= 0) M.all.forEach(q => { q.wall = false; q.wallTried = false; }); }
  if (M.fk && fkStep(dt)) return;
  for (const p of M.all) if (p.slide > 0) slideStep(p, dt);
  if (M.fk) return;
  if (!M.coach) autoSwitch(dt);
  for (const side of ['home', 'away']) {
    const hum = humanSide(side), ctl = ctrlOf(side);
    const list = M.P[side].filter(p => !p.gk && p !== B.owner && (!hum || p !== ctl));
    list.sort((a, b) => dist(a, B) - dist(b, B));
    M.chaser[side] = hum ? (B.owner && B.owner.side !== side && list[0] && dist(list[0], B) < 16 ? list[0] : null) : list[0];
    M.cover[side] = hum ? list[1] && dist(list[1], B) < 25 ? list[1] : null : list[1];
  }
  // presión que pidió el técnico
  if (M.coach && B.owner && B.owner.side === 'away' && M.tac.pr === 0 && B.x > 55) { M.chaser.home = null; M.cover.home = null; }
  if (!M.coach) { userStep(dt); passCall(dt); }
  for (const p of M.all) {
    if (p === M.ctrl || (M.online && p === M.ctrl2) || p.slide > 0) continue;
    const sf = p.side === 'away' ? M.aiF : 1;
    if (B.owner === p) aiCarry(p, dt, sf); else offBall(p, dt, sf);
  }

  if (B.owner) { const o = B.owner; B.x = o.x + o.fx * 0.9; B.y = o.y + o.fy * 0.9; B.vx = o.vx; B.vy = o.vy; B.z = 0; B.vz = 0; }
  else {
    B.x += B.vx * dt; B.y += B.vy * dt;
    B.z = B.z || 0; B.vz = B.vz || 0;
    if (B.z > 0 || B.vz > 0) {
      B.vz -= 9.8 * dt; B.z += B.vz * dt;
      if (B.z <= 0) { B.z = 0; if (B.vz < -2.5) { B.vz = -B.vz * 0.42; B.vx *= 0.82; B.vy *= 0.82; } else B.vz = 0; }
    }
    const air = B.z > 0.05;
    const f = Math.exp(-(air ? 0.1 : 0.6) * dt); B.vx *= f; B.vy *= f;
    if (B.z > 1.1 && B.z < 2.4 && !B.hd) headers(B);
    if (Math.hypot(B.vx, B.vy) < 1.5) { B.vx *= 0.9; B.vy *= 0.9; }
    const bs = Math.hypot(B.vx, B.vy);
    let best = null, bd = 1e9;
    for (const p of M.all) {
      if (p.wall && !B.wallChk && B.kind === 'shot' && dist(p, B) < 1.0) {
        B.wallChk = true;
        if (rnd() < (bs > 28 ? 0.25 : 0.5) * (Math.abs(M.fkAim || 0) > 1.5 ? 0.5 : 1)) { B.vx = -B.vx * 0.3; B.vy = (rnd() - 0.5) * 9; B.kind = null; B.lastSide = p.side; B.lastP = p; break; }
      }
      if (p.cool > 0 || p.stun > 0 || p.slide > 0) continue;
      const z = B.z || 0;
      if (z > (p.gk && inBox(p.x, p.y, p.side === 'home' ? 0 : PL) ? 2.5 : 1.0)) continue;
      const d = dist(p, B), reach = (p.gk && z > 1) ? 1.4 : bs < 17 ? (p.gk ? 1.7 : 1.15) : bs < 26 ? 0.6 : 0;
      if (d < reach && d < bd) { bd = d; best = p; }
    }
    if (best) gain(best);
  }
  checkBounds();
}
function arcFrame(t) {
  if (!M || !M.cv) return;
  const dt = Math.min(0.05, (t - (M.lt || t)) / 1000); M.lt = t;
  if (M.guest) guestFrame(dt);
  else for (let i = 0; i < (M.speed || 1); i++) if (!M.paused && !M.ended) arcStep(dt * 1.1);
  sndTick();
  arcDraw();
  M.raf = requestAnimationFrame(arcFrame);
}

/* ----- Sonido: hinchada, silbato y patadas ----- */
const SND = { ctx: null, crowd: null, on: true, level: 0.06 };
function sndInit() {
  try { SND.on = !(save && save.mute); } catch (e) { }
  if (SND.ctx) { if (SND.ctx.state === 'suspended') SND.ctx.resume().catch(() => {}); return; }
  try {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    const ctx = new AC(), len = ctx.sampleRate * 3, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    let last = 0; for (let i = 0; i < len; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.2; }
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 700; bp.Q.value = 0.5;
    const g = ctx.createGain(); g.gain.value = 0;
    src.connect(bp).connect(g).connect(ctx.destination); src.start();
    SND.ctx = ctx; SND.crowd = g;
  } catch (e) { SND.ctx = null; }
}
function sndTick() {
  if (!SND.ctx || !SND.crowd) return;
  let lv = 0;
  if (SND.on && M && M.cv && !M.ended && !M.paused) {
    const B = M.ball, near = Math.min(B.x, PL - B.x);
    lv = 0.05 + (near < 25 ? (25 - near) / 25 * 0.07 : 0) + (M.goalT > 0 ? 0.25 : 0);
  }
  SND.level += (lv - SND.level) * 0.05;
  SND.crowd.gain.setTargetAtTime(SND.level, SND.ctx.currentTime, 0.1);
}
function sndRoar(v = 1) { if (SND.on) SND.level = Math.max(SND.level, 0.12 + 0.3 * v); }
function sndBeep(f, t0, dur, vol, type = 'sine') {
  const c = SND.ctx; if (!c || !SND.on) return;
  const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(0, c.currentTime + t0); g.gain.linearRampToValueAtTime(vol, c.currentTime + t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + t0 + dur);
  o.connect(g).connect(c.destination); o.start(c.currentTime + t0); o.stop(c.currentTime + t0 + dur + 0.05);
}
function sndWhistle(n = 1) { for (let i = 0; i < n; i++) { sndBeep(2900, i * 0.35, 0.28, 0.06, 'triangle'); sndBeep(3150, i * 0.35, 0.28, 0.03, 'triangle'); } }
function sndKick(pw) { if (pw > 0.45) sndBeep(110 + pw * 60, 0, 0.09, 0.12 * pw); }
function sndStop() { if (SND.crowd && SND.ctx) SND.crowd.gain.setTargetAtTime(0, SND.ctx.currentTime, 0.2); SND.level = 0; }

/* ----- Dibujo: vista tipo transmisión de TV ----- */
const SKINS = ['#f1c9a5', '#e0ac7e', '#c68b59', '#a8693f', '#8d5524', '#5c3a1e', '#f3d2b3'];
const HAIRS = ['#1b1b1b', '#2d1d12', '#4a2f1b', '#6b4423', '#a0703a', '#d9b26a', '#1b1b1b', '#3b2a20'];
const BOOTS = ['#111111', '#111111', '#f8fafc', '#f97316', '#22d3ee', '#facc15', '#ef4444'];
function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16), k = v => clamp(Math.round(f > 1 ? v + (255 - v) * (f - 1) : v * f), 0, 255);
  return '#' + [n >> 16, (n >> 8) & 255, n & 255].map(v => k(v).toString(16).padStart(2, '0')).join('');
}
// Look de cada jugador: sale de su nombre (siempre el mismo), de la época y de algunos ídolos conocidos
const POSES = ['', 'arms_up', 'airplane', 'hands_head', 'knees', 'point', 'protest', 'siu', 'crossed', 'dance', 'baby', 'heart', 'fist'];
const CELEBS = ['arms_up', 'airplane', 'knees', 'point', 'fist', 'dance', 'heart', 'arms_up', 'airplane', 'fist'];
const ICONS = {
  'Carlos Valderrama': { style: 'afro', hair: '#e8c66a', face: 'mustache' },
  'Ruud Gullit': { style: 'dreads', face: 'mustache', H: 1.06 },
  'Edgar Davids': { style: 'dreads', glasses: true },
  'Carles Puyol': { style: 'curlylong', hair: '#3b2a20' },
  'Marouane Fellaini': { style: 'afro', H: 1.08 },
  'Roberto Baggio': { style: 'ponytail', hair: '#2d1d12', face: 'goatee' },
  'Zinedine Zidane': { style: 'bald', H: 1.04 }, 'Fabien Barthez': { style: 'bald' },
  'Ronaldo': { style: 'buzz' }, 'Ronaldinho': { style: 'curlylong', band: '#f8fafc', cel: 'dance' },
  'Sócrates': { style: 'curly', face: 'beard', band: '#f8fafc', H: 1.08, W: 0.9 },
  'Paul Breitner': { style: 'afro', face: 'beard', hair: '#4a2f1b' },
  'Andrea Pirlo': { style: 'long', face: 'beard' },
  'Zlatan Ibrahimović': { style: 'bun', face: 'beard', H: 1.09 },
  'Gareth Bale': { style: 'bun', face: 'beard', cel: 'heart' },
  'Paul Pogba': { style: 'buzz', hair: '#f5d26b', cel: 'dance', H: 1.07 },
  'Mario Balotelli': { style: 'mohawk' }, 'Neymar': { style: 'mohawk', hair: '#a0703a', cel: 'heart' },
  'Taribo West': { style: 'braids', hair: '#16a34a' },
  'Alexi Lalas': { style: 'long', hair: '#b4532a', face: 'goatee' },
  'Rudi Völler': { style: 'curly', face: 'mustache' },
  'René Higuita': { style: 'curlylong' }, 'Jorge Campos': { gkShirt: '#f472b6', H: 0.93 },
  'Lev Yashin': { gkShirt: '#111111' }, 'Petr Čech': { helmet: true, H: 1.08 },
  'Lionel Messi': { face: 'beard', H: 0.94, cel: 'point' }, 'Diego Maradona': { style: 'curly', H: 0.93, cel: 'fist' },
  'Cristiano Ronaldo': { style: 'short', H: 1.06, cel: 'siu' }, 'Kylian Mbappé': { style: 'buzz', cel: 'crossed' },
  'Roger Milla': { cel: 'dance' }, 'Bebeto': { cel: 'baby' }, 'Erling Haaland': { style: 'bun', hair: '#e8c66a', H: 1.09, cel: 'knees' },
  'Sergio Ramos': { face: 'beard' }, 'Johan Cruyff': { style: 'long', W: 0.9 }, 'Mario Kempes': { style: 'long' },
  'Claudio Caniggia': { style: 'long', hair: '#e8c66a' }, 'Gabriel Batistuta': { style: 'long' },
  'Peter Schmeichel': { hair: '#e8c66a', H: 1.08 }, 'Thibaut Courtois': { H: 1.1 }, 'Oliver Kahn': { hair: '#d9b26a' },
  'David Beckham': { hair: '#d9b26a' }, 'Pelé': { style: 'short', cel: 'fist' }, 'Romário': { H: 0.93 },
  'Lamine Yamal': { style: 'curly', W: 0.88 }, 'Bobby Charlton': { style: 'bald' },
};
function look(p) {
  if (!p.look || p.look.id !== p.id) {
    const h = hash(p.id), r = n => (hash(p.id + n) % 1000) / 1000, y = (DB[p.id] && DB[p.id].y) || 2000;
    // peinado según la época
    const W8 = [['short', 40], ['buzz', 14], ['long', y >= 1966 && y <= 1994 ? 22 : 6], ['curly', 10], ['afro', y >= 1970 && y <= 1990 ? 8 : 2],
      ['mohawk', y >= 2002 ? 8 : 0], ['bun', y >= 2014 ? 7 : 0], ['braids', y >= 1994 ? 4 : 0], ['bald', 6], ['ponytail', y >= 1990 ? 3 : 0]];
    let tot = W8.reduce((a, x) => a + x[1], 0), pick = r('st') * tot, style = 'short';
    for (const [k, wgt] of W8) { pick -= wgt; if (pick <= 0) { style = k; break; } }
    const f = r('fc');
    const face = f < (y < 1995 ? 0.25 : 0.04) ? 'mustache' : f < (y < 1995 ? 0.32 : 0.04) + (y >= 2006 ? 0.3 : 0.08) ? 'beard' : f > 0.95 ? 'goatee' : 'none';
    const L = {
      id: p.id, skin: SKINS[h % SKINS.length], hair: HAIRS[(h >> 4) % HAIRS.length], style, face,
      boot: BOOTS[(h >> 17) % BOOTS.length], band: r('bd') < 0.06 ? ['#f8fafc', '#111827', '#ef4444'][(h >> 3) % 3] : null,
      H: 0.93 + r('h') * 0.13 + (p.gk || p.slot === 'DFC' ? 0.04 : 0), W: 0.9 + r('w') * 0.22,
      cel: CELEBS[(h >> 7) % CELEBS.length], sleeves: r('sl') < 0.25,
      num: p.gk ? 1 : [2, 3, 4, 5, 6, 8, 7, 10, 11, 9, 14, 15, 16, 17, 18, 19, 20][p.i % 17],
    };
    Object.assign(L, ICONS[p.id] || {});
    p.look = L;
  }
  return p.look;
}
// Globitos de diálogo arriba de los jugadores
function bubble(p, text, t = 1.8) {
  if (!M || !p) return;
  M.bubbles = (M.bubbles || []).filter(b => b.p !== p);
  if (M.bubbles.length >= 3) M.bubbles.shift();
  M.bubbles.push({ p, text, t });
}
function react(p, type, text, dur = 1.3) { if (!p) return; p.pose = { type, t: 0, dur }; if (text) bubble(p, text); }
const MISS_SAY = ['¡Nooo!', '¡Uffff!', '¡Casi!', '¡Por poquito!'];
const PROTEST_SAY = ['¡No la toqué!', '¡Fue pelota!', '¿Qué cobrás?', '¡Si ni lo toqué!'];
const GOAL_SAY = ['¡GOOOL!', '¡VAMOOOS!', '¡Tomá!', '¡Para vos, mamá!', '¡Golazo!'];
const CALL_SAY = ['¡Pasala!', '¡Acá, acá!', '¡Estoy solo!', '¡Tocá!'];
// Un compañero libre pide la pelota cuando la tenés vos
function passCall(dt) {
  M.callT = (M.callT || 3) - dt; if (M.callT > 0) return;
  M.callT = 3.5 + rnd() * 3;
  const c = M.ctrl, B = M.ball; if (!c || B.owner !== c) return;
  const d = dirOf('home'), mates = M.P.home.filter(q => q !== c && !q.gk && (q.x - c.x) * d > 4 && dist(q, c) < 30 && nearest(M.P.away, q.x, q.y).d > 6);
  if (mates.length) bubble(pick(mates), pick(CALL_SAY), 1.4);
}

function mkCrowd(W, H, cols) {
  const out = [];
  for (const up of [false, true]) {
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const c = cv.getContext('2d'), seed = mulberry(1234);
    const rows = Math.max(6, Math.round(H / 9));
    for (let r = 0; r < rows; r++) {
      const y0 = r * H / rows, rh = H / rows, sc = 0.55 + 0.45 * r / rows;
      c.fillStyle = r % 2 ? '#1e293b' : '#273449'; c.fillRect(0, y0, W, rh + 1);
      const step = 5.2 * sc;
      for (let x = (r % 2) * step / 2; x < W; x += step * (0.8 + seed() * 0.5)) {
        if (seed() < 0.07) continue;                       // asiento vacío
        const team = seed() < 0.75 ? cols[(seed() * cols.length) | 0] : ['#e5e7eb', '#111827', '#64748b', '#f472b6', '#a855f7'][(seed() * 5) | 0];
        const bw = 3.6 * sc, by = y0 + rh * 0.35, raise = up && seed() < 0.55;
        c.fillStyle = team; c.fillRect(x - bw / 2, by, bw, rh * 0.7);
        if (raise) { c.fillRect(x - bw / 2 - 1, by - rh * 0.55, 1.2 * sc, rh * 0.6); c.fillRect(x + bw / 2 - 0.2, by - rh * 0.55, 1.2 * sc, rh * 0.6); }
        c.fillStyle = SKINS[(seed() * SKINS.length) | 0];
        c.beginPath(); c.arc(x, by - 1.3 * sc - (raise ? 1 : 0), 1.5 * sc, 0, 7); c.fill();
        if (seed() < 0.03) { c.fillStyle = cols[(seed() * cols.length) | 0]; c.fillRect(x, by - rh * 1.1, 7 * sc, 4.5 * sc); } // bandera
      }
    }
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(0,0,0,.55)'); g.addColorStop(0.5, 'rgba(0,0,0,.1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    out.push(cv);
  }
  return out;
}
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
let GRASS_PAT = null;
function grassPattern(c) {
  if (GRASS_PAT) return GRASS_PAT;
  const cv = document.createElement('canvas'); cv.width = cv.height = 96;
  const g = cv.getContext('2d'), seed = mulberry(77);
  for (let i = 0; i < 1400; i++) {
    g.fillStyle = seed() < 0.5 ? `rgba(0,0,0,${0.05 + seed() * 0.08})` : `rgba(255,255,255,${0.03 + seed() * 0.05})`;
    g.fillRect(seed() * 96, seed() * 96, 1, 1 + seed() * 2);
  }
  return (GRASS_PAT = c.createPattern(cv, 'repeat'));
}
function arcDraw() {
  const cv = M.cv, dpr = window.devicePixelRatio || 1, w = cv.clientWidth, h = Math.round(w * 0.56);
  if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); cv.style.height = h + 'px'; }
  const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
  const B = M.ball, T = M.clock + (M.rt = (M.rt || 0) + 0.016);
  // Cámara: sigue la pelota de costado, desde arriba de la tribuna (tiembla un poco con los goles)
  const VIEW = w < 520 ? 32 : 40, CD = 60, CH = 32, f = w / VIEW * CD;
  const tgt = clamp(B.x + B.vx * 0.25, VIEW / 2 - 9, PL - VIEW / 2 + 9);
  M.cam = M.cam == null ? tgt : M.cam + (tgt - M.cam) * 0.07;
  const shake = M.goalT > 2.8 ? Math.sin(T * 60) * 2 : 0;
  const horizon = h - h * 0.035 - CH * f / CD + shake;
  const K = y => f / (CD + PW - y);                       // escala según la profundidad
  const SX = (x, y) => w / 2 + (x - M.cam) * K(y), SY = (y, z = 0) => horizon + (CH - z) * K(y);
  const P = (x, y, z) => [SX(x, y), SY(y, z)];
  const path = (pts, close) => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); if (close) c.closePath(); };
  const poly = (pts, fill, stroke) => { path(pts, true); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.stroke(); } };
  const line = pts => { path(pts); c.stroke(); };

  // --- Tribuna con hinchas (se mueve más lento que la cancha) ---
  const tBot = SY(-5.5, 1.1);
  const cols = [M.home.col, M.home.col, M.away.col, M.away.col];
  if (!M.crowd || M.crowd.w !== w) M.crowd = { w, img: mkCrowd(Math.round(w * 1.7), Math.max(10, Math.round(tBot)), cols) };
  const par = (M.cam - PL / 2) / PL * w * 0.6 + w * 0.35;
  const cheering = M.goalT > 0 && Math.sin(T * 14) > 0;
  c.drawImage(M.crowd.img[cheering ? 1 : 0], -par, 0, w * 1.7, tBot);
  // techo y torres de luz
  c.fillStyle = '#0b1220'; c.fillRect(0, 0, w, Math.max(4, tBot * 0.09));
  c.fillStyle = 'rgba(255,255,255,.85)';
  for (let i = 0; i < 24; i++) { const x = ((i * w / 12 - par * 0.9) % (w * 2) + w * 2) % (w * 2); if (x < w) c.fillRect(x, tBot * 0.05, 3, 2); }
  for (const lx of [0.1, 0.9]) {
    const gx = w * lx, gy = tBot * 0.04, gr = c.createRadialGradient(gx, gy, 0, gx, gy, w * 0.22);
    gr.addColorStop(0, 'rgba(255,255,240,.45)'); gr.addColorStop(0.2, 'rgba(255,255,230,.12)'); gr.addColorStop(1, 'rgba(255,255,230,0)');
    c.fillStyle = gr; c.fillRect(0, 0, w, h);
  }

  // --- Pasto: franjas cortadas, textura y luz ---
  poly([P(-45, -5.5), P(PL + 45, -5.5), P(PL + 45, PW + 30), P(-45, PW + 30)], '#1f6a2a');
  for (let i = 0; i < 20; i++) {
    const x0 = i * PL / 20, x1 = x0 + PL / 20;
    poly([P(x0, -3), P(x1, -3), P(x1, PW + 3), P(x0, PW + 3)], i % 2 ? '#2f8f40' : '#2a8139');
  }
  for (let j = 0; j < 6; j++) {                           // cuadriculado suave a lo ancho
    if (j % 2) continue; const y0 = -3 + j * (PW + 6) / 6, y1 = y0 + (PW + 6) / 6;
    poly([P(-3, y0), P(PL + 3, y0), P(PL + 3, y1), P(-3, y1)], 'rgba(255,255,255,.035)');
  }
  path([P(-45, -5.5), P(PL + 45, -5.5), P(PL + 45, PW + 30), P(-45, PW + 30)], true);
  c.fillStyle = grassPattern(c); c.fill();
  // carteles de publicidad (con brillo)
  const adY1 = SY(-5.5), adY0 = SY(-5.5, 1.1);
  c.font = `800 ${Math.max(7, (adY1 - adY0) * 0.62)}px Oswald, Inter, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
  for (let i = -2; i < 14; i++) {
    const x0 = i * 10 - 5, x1 = x0 + 10;
    poly([P(x0, -5.5, 0), P(x1, -5.5, 0), P(x1, -5.5, 1.1), P(x0, -5.5, 1.1)], ['#1d4ed8', '#b91c1c', '#0f766e', '#7c3aed'][(i + 4) % 4]);
    c.fillStyle = 'rgba(255,255,255,.95)';
    c.fillText(i % 3 ? 'MUNDIALISTAS' : '1958 · 2026', SX(x0 + 5, -5.5), (adY0 + adY1) / 2);
  }
  const sh = c.createLinearGradient(0, adY0, 0, adY1); sh.addColorStop(0, 'rgba(255,255,255,.25)'); sh.addColorStop(0.5, 'rgba(255,255,255,0)');
  c.fillStyle = sh; c.fillRect(0, adY0, w, adY1 - adY0);
  c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(0, adY1, w, Math.max(1, K(-5) * 0.3)); // sombra de los carteles

  // --- Líneas de cal ---
  const WL = 'rgba(255,255,255,.88)';
  c.strokeStyle = WL; c.lineWidth = Math.max(1, K(PW / 2) * 0.12); c.lineJoin = 'round';
  poly([P(0, 0), P(PL, 0), P(PL, PW), P(0, PW)], null, WL);
  line([P(PL / 2, 0), P(PL / 2, PW)]);
  const circ = (cx, cy, r, a0 = 0, a1 = Math.PI * 2) => {
    const pts = []; for (let i = 0; i <= 48; i++) { const a = a0 + (a1 - a0) * i / 48; pts.push(P(cx + Math.cos(a) * r, cy + Math.sin(a) * r)); }
    line(pts);
  };
  const dot = (x, y, r) => { const [px, py] = P(x, y); c.fillStyle = WL; c.beginPath(); c.ellipse(px, py, Math.max(1.5, K(y) * r), Math.max(1, K(y) * r * 0.5), 0, 0, 7); c.fill(); };
  circ(PL / 2, PW / 2, 9.15); dot(PL / 2, PW / 2, 0.3);
  [[0, 1], [PL, -1]].forEach(([gx, d]) => {
    poly([P(gx, PW / 2 - 20.15), P(gx + d * 16.5, PW / 2 - 20.15), P(gx + d * 16.5, PW / 2 + 20.15), P(gx, PW / 2 + 20.15)], null, WL);
    poly([P(gx, PW / 2 - 9.16), P(gx + d * 5.5, PW / 2 - 9.16), P(gx + d * 5.5, PW / 2 + 9.16), P(gx, PW / 2 + 9.16)], null, WL);
    const a = Math.acos(5.5 / 9.15);
    circ(gx + d * 11, PW / 2, 9.15, d > 0 ? -a : Math.PI - a, d > 0 ? a : Math.PI + a);
    dot(gx + d * 11, PW / 2, 0.25);
    for (const cy of [0, PW]) circ(gx, cy, 1, d > 0 ? (cy ? -Math.PI / 2 : 0) : (cy ? Math.PI : Math.PI / 2), d > 0 ? (cy ? 0 : Math.PI / 2) : (cy ? Math.PI * 1.5 : Math.PI));
  });
  // banderines del córner
  for (const [x, y] of [[0, 0], [PL, 0], [0, PW], [PL, PW]]) {
    const [px, py] = P(x, y), [, ty] = P(x, y, 1.5), fl = Math.sin(T * 5 + x) * 0.3;
    c.strokeStyle = '#e5e7eb'; c.lineWidth = Math.max(1, K(y) * 0.06); line([[px, py], [px, ty]]);
    poly([[px, ty], [px + K(y) * (0.6 + fl * 0.2), ty + K(y) * 0.18], [px, ty + K(y) * 0.4]], '#facc15');
  }
  // luz del estadio sobre el pasto
  const [mx, my] = P(M.cam, PW / 2), lg = c.createRadialGradient(mx, my, w * 0.1, mx, my, w * 0.75);
  lg.addColorStop(0, 'rgba(255,255,220,.07)'); lg.addColorStop(1, 'rgba(0,0,0,.28)');
  path([P(-45, -5.5), P(PL + 45, -5.5), P(PL + 45, PW + 30), P(-45, PW + 30)], true); c.fillStyle = lg; c.fill();

  // --- Arcos: la red y el palo de atrás antes que los jugadores, el palo de adelante después ---
  const bulge = gx => (M.goalT > 0 && Math.abs(B.x - gx) < 5) ? Math.max(0, Math.sin((3.6 - M.goalT) * 9)) * 0.9 * (M.goalT / 3.6) : 0;
  const drawGoal = (gx, d, front) => {
    const y0 = PW / 2 - GOAL_HW, y1 = PW / 2 + GOAL_HW, bz = bulge(gx), bx = gx - d * (2.2 + bz), H = 2.44;
    const pw = Math.max(2, K(front ? y1 : y0) * 0.13);
    if (!front) {
      c.fillStyle = 'rgba(0,0,0,.18)';                    // sombra del arco
      poly([P(gx, y0), P(bx + d * 0.6, y0 - 0.5), P(bx + d * 0.6, y1 + 0.5), P(gx, y1)]);
      c.fill();
      poly([P(gx, y0, H), P(bx, y0, H * 0.85), P(bx, y1, H * 0.85), P(gx, y1, H)], 'rgba(255,255,255,.07)');
      c.lineWidth = 0.8; c.strokeStyle = 'rgba(255,255,255,.4)';
      for (let i = 0; i <= 10; i++) { const y = y0 + (y1 - y0) * i / 10, b = bz * Math.sin(Math.PI * i / 10); line([P(gx - d * (2.2 + b), y, 0), P(gx - d * (2.2 + b), y, H * 0.85), P(gx, y, H)]); }
      for (let i = 0; i <= 6; i++) { const z = H * 0.85 * i / 6, pts = []; for (let j = 0; j <= 10; j++) pts.push(P(gx - d * (2.2 + bz * Math.sin(Math.PI * j / 10)), y0 + (y1 - y0) * j / 10, z)); line(pts); }
      for (let i = 1; i < 4; i++) { const xx = gx - d * 2.2 * i / 4; line([P(xx, y0, H - (H * 0.15) * i / 4), P(xx, y0, 0)]); }
      line([P(gx, y0, H), P(bx, y0, H * 0.85), P(bx, y0, 0), P(gx, y0, 0)]);
      c.lineWidth = pw; c.strokeStyle = '#f8fafc'; c.lineCap = 'round';
      line([P(gx, y0, 0), P(gx, y0, H)]);
    } else {
      c.lineWidth = 0.8; c.strokeStyle = 'rgba(255,255,255,.4)';
      for (let i = 1; i < 4; i++) { const xx = gx - d * 2.2 * i / 4; line([P(xx, y1, H - (H * 0.15) * i / 4), P(xx, y1, 0)]); }
      line([P(gx, y1, H), P(bx, y1, H * 0.85), P(bx, y1, 0), P(gx, y1, 0)]);
      c.lineCap = 'round'; c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = pw + 1.5;
      line([P(gx, y1, 0), P(gx, y1, H)]); line([P(gx, y0, H), P(gx, y1, H)]);
      c.lineWidth = pw; c.strokeStyle = '#f8fafc';
      line([P(gx, y1, 0), P(gx, y1, H)]); line([P(gx, y0, H), P(gx, y1, H)]);
    }
  };
  drawGoal(0, 1, false); drawGoal(PL, -1, false);

  // --- Sombras de las 4 torres de luz (abajo de todos) ---
  for (const p of M.all) {
    const x = SX(p.x, p.y); if (x < -40 || x > w + 40) continue;
    const y = SY(p.y), k = K(p.y) * 1.4;
    c.fillStyle = 'rgba(0,0,0,.13)';
    for (const a of [0.6, -0.6, 2.5, -2.5]) { c.beginPath(); c.ellipse(x + Math.cos(a) * k * 0.45, y + Math.sin(a) * k * 0.08, k * 0.5, k * 0.1, a * 0.12, 0, 7); c.fill(); }
    c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(x, y, k * 0.3, k * 0.1, 0, 0, 7); c.fill();
  }
  // --- Jugadores y pelota, de atrás hacia adelante ---
  const items = M.all.map(p => ({ y: p.y, p }));
  items.push({ y: B.y + 0.01, ball: true });
  items.sort((a, b) => a.y - b.y);
  for (const it of items) {
    if (it.ball) { drawBall(); continue; }
    const p = it.p, k = K(p.y) * 1.4, x = SX(p.x, p.y), y = SY(p.y);
    if (x < -40 || x > w + 40) { p.lx = p.x; p.ly = p.y; continue; }
    drawPlayer(p, x, y, k);
  }
  drawGoal(0, 1, true); drawGoal(PL, -1, true);

  // --- Viñeta de TV ---
  const vg = c.createRadialGradient(w / 2, h * 0.55, h * 0.45, w / 2, h * 0.55, w * 0.75);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.35)'); c.fillStyle = vg; c.fillRect(0, 0, w, h);

  // --- Marcador como en la tele ---
  {
    const fsb = Math.max(10, Math.round(w / 70)), ab = n => String(n || '').replace(/[^A-Za-zÀ-ÿ ]/g, '').trim().slice(0, 3).toUpperCase() || '---';
    const hN = ab(M.homeName || save.name), aN = M.r.c ? COUNTRIES[M.r.c].k : ab(M.r.name);
    const mins = `${M.min}'`, txt = `${hN}  ${M.score[0]} - ${M.score[1]}  ${aN}`;
    c.font = `800 ${fsb}px Inter, sans-serif`; c.textBaseline = 'middle'; c.textAlign = 'left';
    const tw = c.measureText(txt).width, mw = c.measureText(mins).width, bx = 10, by = 10, bh = fsb * 1.9;
    c.fillStyle = 'rgba(10,14,25,.85)'; c.beginPath(); c.roundRect(bx, by, tw + mw + fsb * 2.6, bh, 6); c.fill();
    c.fillStyle = M.home.col; c.fillRect(bx, by, 4, bh); c.fillStyle = M.away.col; c.fillRect(bx + tw + fsb * 0.9 + 4, by + bh * 0.2, 4, bh * 0.6);
    c.fillStyle = '#f8fafc'; c.fillText(txt, bx + fsb * 0.6, by + bh / 2);
    c.fillStyle = '#22c55e'; c.beginPath(); c.roundRect(bx + tw + fsb * 1.4, by + 3, mw + fsb * 0.9, bh - 6, 4); c.fill();
    c.fillStyle = '#04210f'; c.fillText(mins, bx + tw + fsb * 1.85, by + bh / 2);
    if (M.coach && M.speed > 1) { c.fillStyle = 'rgba(250,204,21,.9)'; c.fillText('▶▶ x' + M.speed, bx, by + bh + fsb); }
  }
  if (M.banner) {
    const bf = Math.max(18, Math.round(w / 26)), al = Math.min(1, M.banner.t * 2);
    c.globalAlpha = al; c.font = `700 ${bf}px Oswald, Inter, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
    const bw2 = c.measureText(M.banner.text).width + bf * 1.6, byy = h * 0.42;
    c.fillStyle = 'rgba(10,14,25,.75)'; c.beginPath(); c.roundRect(w / 2 - bw2 / 2, byy - bf * 0.8, bw2, bf * 1.6, 10); c.fill();
    c.fillStyle = M.banner.color; c.fillText(M.banner.text, w / 2, byy + 1); c.globalAlpha = 1;
  }

  // --- Nombre del jugador que manejás y del rival con la pelota ---
  const fs = Math.max(10, Math.round(w / 75));
  c.font = `800 ${fs}px Inter, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
  const label = (p, color) => {
    const k = K(p.y) * 1.4, x = clamp(SX(p.x, p.y), 50, w - 50), y = SY(p.y) - 2.05 * k * look(p).H - fs * 0.9, t = short(p.id) + (p.trait ? ' ' + TRAITS[p.trait][0] : ''), tw = c.measureText(t).width + 16;
    c.fillStyle = 'rgba(10,14,25,.78)'; c.beginPath(); c.roundRect(x - tw / 2, y - fs * 0.75, tw, fs * 1.5, fs * 0.75); c.fill();
    c.fillStyle = M[p.side].col; c.beginPath(); c.arc(x - tw / 2 + fs * 0.55, y, fs * 0.28, 0, 7); c.fill();
    c.fillStyle = color; c.fillText(t, x + fs * 0.2, y + 1);
    c.beginPath(); c.moveTo(x - 4, y + fs * 0.75); c.lineTo(x + 4, y + fs * 0.75); c.lineTo(x, y + fs * 0.75 + 5); c.fillStyle = 'rgba(10,14,25,.78)'; c.fill();
  };
  if (M.ctrl) {
    label(M.ctrl, '#facc15');
    const p = M.ctrl, x = SX(p.x, p.y);
    if (x < 0 || x > w) { // flecha si tu jugador quedó fuera de la pantalla
      const ax = x < 0 ? 14 : w - 14, ay = SY(p.y) - 10, dd = x < 0 ? -1 : 1;
      c.beginPath(); c.moveTo(ax + dd * 10, ay); c.lineTo(ax - dd * 4, ay - 10); c.lineTo(ax - dd * 4, ay + 10); c.closePath(); c.fillStyle = '#facc15'; c.fill();
    }
    if (M.charge > 0) {
      const k = K(p.y) * 1.4, pw = clamp(M.charge / 0.8, 0, 1), bw = Math.max(44, k * 2.5), by = SY(p.y) + 9;
      c.fillStyle = 'rgba(0,0,0,.65)'; c.beginPath(); c.roundRect(x - bw / 2 - 2, by - 2, bw + 4, 11, 5); c.fill();
      const gg = c.createLinearGradient(x - bw / 2, 0, x + bw / 2, 0); gg.addColorStop(0, '#22c55e'); gg.addColorStop(0.7, '#facc15'); gg.addColorStop(1, '#ef4444');
      c.fillStyle = gg; c.beginPath(); c.roundRect(x - bw / 2, by, Math.max(4, bw * pw), 7, 3.5); c.fill();
    }
  }
  if (M.ctrl2) label(M.ctrl2, '#22d3ee'); else if (B.owner && B.owner.side === 'away') label(B.owner, '#fff');
  if (M.fk) {
    const F = M.fk;
    if (F.side === (M.mySide || 'home') && !F.corner && !M.coach) {   // línea para apuntar
      const iv = inputVec(), d = dirOf(F.side), ty = PW / 2 + iv.y * 3.6;
      c.setLineDash([6, 6]); c.strokeStyle = 'rgba(250,204,21,.9)'; c.lineWidth = 2.5;
      line([P(F.x, F.y), P(d > 0 ? PL : 0, ty)]); c.setLineDash([]);
      const [tx, tyy] = P(d > 0 ? PL : 0, ty, 1.2); c.beginPath(); c.arc(tx, tyy, 6, 0, 7); c.strokeStyle = '#facc15'; c.lineWidth = 2; c.stroke();
    }
    const t1 = F.corner ? '🚩 CÓRNER' : F.pen ? '⚽ ¡PENAL!' : '🟨 TIRO LIBRE', t2 = F.side === (M.mySide || 'home') && !M.coach ? (F.corner ? 'Apretá PASAR o TIRAR para tirar el centro al área' : 'Apuntá con ↑ ↓ (o el círculo) y apretá TIRAR · o PASAR') : `Patea ${F.side === 'home' ? esc(M.homeName || save.name) : M.r.name}…`;
    const bw = Math.min(w - 20, Math.max(260, w * 0.5)), bx = w / 2 - bw / 2, by = h * 0.08;
    c.fillStyle = 'rgba(10,14,25,.82)'; c.beginPath(); c.roundRect(bx, by, bw, fs * 3.4, 10); c.fill();
    c.fillStyle = F.pen ? '#f87171' : '#facc15'; c.font = `800 ${Math.round(fs * 1.35)}px Oswald, Inter, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(t1, w / 2, by + fs * 1.15);
    c.fillStyle = '#e5e7eb'; c.font = `600 ${Math.max(9, Math.round(fs * 0.85))}px Inter, sans-serif`;
    c.fillText(t2, w / 2, by + fs * 2.5);
  }
  // globitos de diálogo
  if (M.bubbles && M.bubbles.length) {
    const bf = Math.max(10, Math.round(w / 85));
    c.font = `800 ${bf}px Inter, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
    for (const b of M.bubbles) {
      const p = b.p, k = K(p.y) * 1.4, bx = SX(p.x, p.y); if (bx < -30 || bx > w + 30) continue;
      const by = SY(p.y) - 2.1 * k * look(p).H - bf * 2.6 - ((p === M.ctrl || p === M.ctrl2) ? bf * 1.6 : 0), tw = c.measureText(b.text).width + bf * 1.2;
      c.globalAlpha = Math.min(1, b.t * 3);
      c.fillStyle = '#f8fafc'; c.beginPath(); c.roundRect(bx - tw / 2, by - bf * 0.85, tw, bf * 1.7, bf * 0.8); c.fill();
      c.beginPath(); c.moveTo(bx - 4, by + bf * 0.8); c.lineTo(bx + 4, by + bf * 0.8); c.lineTo(bx, by + bf * 0.8 + 7); c.fill();
      c.fillStyle = '#0f172a'; c.fillText(b.text, bx, by + 1); c.globalAlpha = 1;
    }
  }
  drawRadar(c, w, h);

  function drawBall() {
    const x = SX(B.x, B.y), gy = SY(B.y), bz = B.z || 0, y = SY(B.y, bz), r = Math.max(2.6, K(B.y) * 0.3), sp = Math.hypot(B.vx, B.vy);
    // estela cuando va rápido
    M.trail = M.trail || [];
    M.trail.push([x, y - r]); if (M.trail.length > 7) M.trail.shift();
    if (sp > 16 && !B.owner) {
      c.lineCap = 'round';
      for (let i = 1; i < M.trail.length; i++) {
        c.strokeStyle = `rgba(255,255,255,${0.06 * i})`; c.lineWidth = r * 2 * i / M.trail.length;
        line([M.trail[i - 1], M.trail[i]]);
      }
    }
    const sh = 1 / (1 + bz * 0.35);
    c.beginPath(); c.ellipse(x + r * 0.4 + bz * K(B.y) * 0.12, gy, r * 1.2 * sh, r * 0.45 * sh, 0, 0, 7); c.fillStyle = `rgba(0,0,0,${0.4 * sh})`; c.fill();
    const bg = c.createRadialGradient(x - r * 0.35, y - r * 1.35, r * 0.1, x, y - r, r);
    bg.addColorStop(0, '#ffffff'); bg.addColorStop(1, '#c9ced6');
    c.beginPath(); c.arc(x, y - r, r, 0, 7); c.fillStyle = bg; c.fill(); c.strokeStyle = 'rgba(0,0,0,.6)'; c.lineWidth = 0.8; c.stroke();
    // gajos que giran
    M.bRot = (M.bRot || 0) + sp * 0.02;
    c.save(); c.beginPath(); c.arc(x, y - r, r, 0, 7); c.clip(); c.fillStyle = '#1f2937';
    for (let i = 0; i < 3; i++) {
      const a = M.bRot + i * 2.1, px = x + Math.cos(a) * r * 0.55, py = y - r + Math.sin(a * 0.7) * r * 0.45;
      c.beginPath(); c.arc(px, py, r * 0.3, 0, 7); c.fill();
    }
    c.restore();
  }
  function drawPlayer(p, x, y, k) {
    const L = look(p), col = M[p.side].col;
    const shirt = p.gk ? (L.gkShirt || (p.side === 'home' ? '#111827' : '#a3e635')) : col;
    const shorts = p.gk ? '#111827' : (lum(col) > 0.75 ? '#1f2937' : (lum(col) < 0.2 ? '#f8fafc' : shade(col, 0.55)));
    const socks = p.gk ? '#111827' : shirt, trim = lum(shirt) > 0.6 ? '#111827' : '#f8fafc', OUT = 'rgba(0,0,0,.55)';
    const pose = p.pose && p.pose.type;
    // paso al correr
    const mv = p.lx == null ? 0 : Math.hypot(p.x - p.lx, p.y - p.ly); p.lx = p.x; p.ly = p.y;
    p.ph = (p.ph || 0) + mv * 1.9;
    const run = Math.min(1, mv * 25), sw = Math.sin(p.ph) * 0.45 * run, face = p.fx < 0 ? -1 : 1;
    const bob = Math.abs(Math.sin(p.ph)) * k * 0.05 * run;
    if (p === M.ctrl || p === M.ctrl2) {
      const rc = p === M.ctrl ? '#facc15' : '#22d3ee', pulse = 1 + Math.sin(T * 6) * 0.06;
      c.beginPath(); c.ellipse(x, y, k * 0.75 * pulse, k * 0.27 * pulse, 0, 0, 7);
      c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = Math.max(3, k * 0.14); c.stroke();
      c.strokeStyle = rc; c.lineWidth = Math.max(2, k * 0.09); c.stroke();
      const ax = x + p.fx * k * 1.15, ay = y + p.fy * k * 0.42;
      c.beginPath(); c.moveTo(ax, ay); c.lineTo(x + p.fx * k * 0.8 - p.fy * k * 0.22, y + p.fy * k * 0.3 + p.fx * k * 0.08);
      c.lineTo(x + p.fx * k * 0.8 + p.fy * k * 0.22, y + p.fy * k * 0.3 - p.fx * k * 0.08); c.closePath(); c.fillStyle = rc; c.fill();
    }
    c.save();
    if (p.slide > 0) {                                     // barrida: tirado en el pasto, con los pies adelante
      c.fillStyle = 'rgba(120,200,110,.7)';
      for (let i = 0; i < 5; i++) c.fillRect(x - face * k * (0.2 + i * 0.25) + Math.sin(T * 40 + i) * 2, y - k * (0.1 + (i % 3) * 0.12), 2, 2);
      c.translate(x, y); c.rotate(-face * 1.2); c.translate(-x, -y);
    } else if (p.dive > 0) {                               // el arquero se tira
      const yy = y - k * 0.4; c.translate(x, yy); c.rotate((p.diveDir || 1) * 1.25 * Math.min(1, (0.7 - p.dive) * 6 + 0.2)); c.translate(-x, -yy);
    } else if (p.stun > 0) { c.translate(x, y); c.rotate(face * -0.35); c.translate(-x, -y); }   // trastabilla después de un quite
    // festejos que mueven todo el cuerpo
    const pt = p.pose ? p.pose.t : 0;
    if (pose === 'siu' && pt < 0.6) c.translate(0, -Math.sin(pt / 0.6 * Math.PI) * k * 0.7);
    if (pose === 'dance') { c.translate(x, y); c.rotate(Math.sin(T * 9) * 0.18); c.translate(-x, -y); }
    if (pose === 'baby') { c.translate(x, y); c.rotate(Math.sin(T * 6) * 0.08); c.translate(-x, -y); }
    const kneel = pose === 'knees';
    if (kneel) c.translate(0, k * 0.42);
    // altura y contextura de cada uno
    c.translate(x, y); c.scale(L.W, L.H); c.translate(-x, -y);
    c.translate(0, -bob);
    const hip = y - k * 0.9, shY = y - k * 1.5, lw = Math.max(1.6, k * 0.17);
    c.lineCap = 'round';
    const limb = (pts, color, wd) => { c.strokeStyle = OUT; c.lineWidth = wd + 1.4; line(pts); c.strokeStyle = color; c.lineWidth = wd; line(pts); };
    if (kneel) {                                           // de rodillas en el pasto
      for (const s2 of [1, -1]) {
        limb([[x + s2 * k * 0.1, hip + k * 0.15], [x + s2 * k * 0.12 + face * k * 0.15, y - k * 0.42]], L.skin, lw);
        limb([[x + s2 * k * 0.12 + face * k * 0.15, y - k * 0.42], [x + s2 * k * 0.1 - face * k * 0.3, y - k * 0.4]], socks, lw);
      }
    } else for (const s2 of [1, -1]) {                     // piernas (la de atrás un poco más oscura)
      const a2 = pose ? 0 : sw * s2, fx = x + Math.sin(a2) * k * 0.55 * face + s2 * k * 0.06, fy = y + bob - Math.max(0, Math.sin(a2)) * k * 0.12;
      const kx = x + s2 * k * 0.08 + Math.sin(a2) * k * 0.32 * face, ky = hip + k * 0.45;
      const dk = s2 > 0 ? 0.8 : 1;
      limb([[x + s2 * k * 0.1, hip + k * 0.15], [kx, ky]], shade(L.skin, dk), lw);
      limb([[kx, ky], [fx, fy - k * 0.05]], shade(socks, dk), lw);
      c.strokeStyle = trim; c.lineWidth = lw * 0.9; line([[kx + (fx - kx) * 0.15, ky + (fy - ky) * 0.15], [kx + (fx - kx) * 0.25, ky + (fy - ky) * 0.25]]);
      limb([[fx, fy - k * 0.03], [fx + face * k * 0.13, fy - k * 0.02]], L.boot, lw * 1.05);
    }
    // short
    c.fillStyle = shorts; c.strokeStyle = OUT; c.lineWidth = 1;
    c.beginPath(); c.roundRect(x - k * 0.24, hip - k * 0.05, k * 0.48, k * 0.3, k * 0.06); c.fill(); c.stroke();
    const hr = k * 0.17, hy = shY - k * 0.19;
    // brazos: normales o en pose de festejo / reacción
    const armPts = s2 => {
      const sx = x + s2 * k * 0.22, sy = shY + k * 0.06, F = s2 === face, wv = Math.sin(T * 10) * k * 0.08;
      switch (pose) {
        case 'arms_up': case 'knees': return [[x + s2 * k * 0.36, shY - k * 0.2], [x + s2 * k * 0.42 + (s2 > 0 ? wv : -wv), shY - k * 0.6]];
        case 'airplane': return [[x + s2 * k * 0.5, sy + k * 0.02], [x + s2 * k * 0.8, sy + k * 0.08]];
        case 'hands_head': return [[x + s2 * k * 0.4, shY - k * 0.12], [x + s2 * k * 0.14, hy - hr * 0.7]];
        case 'point': return F ? [[x + s2 * k * 0.3, shY - k * 0.25], [x + s2 * k * 0.2, shY - k * 0.75]] : null;
        case 'fist': return F ? [[x + s2 * k * 0.42, shY - k * 0.05], [x + s2 * k * 0.38, shY - k * 0.45]] : null;
        case 'siu': return pt < 0.6 ? [[x + s2 * k * 0.3, shY - k * 0.2], [x + s2 * k * 0.3, shY - k * 0.55]] : [[x + s2 * k * 0.45, sy + k * 0.22], [x + s2 * k * 0.62, sy + k * 0.5]];
        case 'crossed': return [[x + s2 * k * 0.28, sy + k * 0.3], [x - s2 * k * 0.14, sy + k * 0.22]];
        case 'dance': return [[x + s2 * k * 0.4, sy - k * 0.05 + Math.sin(T * 9 + s2) * k * 0.15], [x + s2 * k * 0.55, sy - k * 0.35 + Math.sin(T * 9 + s2) * k * 0.2]];
        case 'baby': return [[x + face * k * 0.12 + s2 * k * 0.15, sy + k * 0.3], [x + face * k * 0.32, sy + k * 0.32 + Math.sin(T * 6) * k * 0.06]];
        case 'heart': return [[x + s2 * k * 0.3, sy + k * 0.05], [x + face * k * 0.12 + s2 * k * 0.04, sy + k * 0.12]];
        case 'protest': return [[x + s2 * k * 0.42, sy + k * 0.15], [x + s2 * k * 0.7, sy + k * 0.05]];
        default: return null;
      }
    };
    const arm = s2 => {
      const custom = armPts(s2), sx = x + s2 * k * 0.22, sy = shY + k * 0.06, sleeve = s2 * face < 0 ? shade(shirt, 0.8) : shirt;
      const hand = p.gk ? '#f8fafc' : L.skin;
      if (custom) {
        const [el, hd] = custom, mid = [sx + (el[0] - sx) * 0.55, sy + (el[1] - sy) * 0.55];
        limb([[sx, sy], L.sleeves || p.gk ? el : mid], sleeve, lw * 1.05);
        limb([L.sleeves || p.gk ? el : mid, el, hd], hand, lw * 0.9);
        if (p.gk) { c.fillStyle = '#f8fafc'; c.beginPath(); c.arc(hd[0], hd[1], lw * 0.8, 0, 7); c.fill(); }
        return;
      }
      const a2 = -sw * s2 * 1.2, ex = x + s2 * k * 0.3 + Math.sin(a2) * k * 0.12 * face, ey = shY + k * 0.28;
      const hx = ex + Math.sin(a2) * k * 0.2 * face + s2 * k * 0.02, hy2 = shY + k * 0.55;
      limb([[sx, sy], [ex, ey]], sleeve, lw * 1.05);
      if (L.sleeves || p.gk) limb([[ex, ey], [hx, hy2]], sleeve, lw * 0.95);
      else limb([[ex, ey], [hx, hy2]], hand, lw * 0.9);
      if (p.gk) { c.fillStyle = '#f8fafc'; c.beginPath(); c.arc(hx, hy2, lw * 0.75, 0, 7); c.fill(); }   // guantes
      else if (L.sleeves) { c.fillStyle = L.skin; c.beginPath(); c.arc(hx, hy2, lw * 0.45, 0, 7); c.fill(); }
    };
    arm(-face);
    // camiseta con luz y sombra
    const tg = c.createLinearGradient(x - k * 0.27, shY, x + k * 0.27, shY + k * 0.6);
    tg.addColorStop(0, shade(shirt, 1.25)); tg.addColorStop(0.55, shirt); tg.addColorStop(1, shade(shirt, 0.7));
    c.fillStyle = tg; c.beginPath(); c.roundRect(x - k * 0.27, shY - k * 0.02, k * 0.54, k * 0.62, [k * 0.13, k * 0.13, k * 0.06, k * 0.06]); c.fill();
    c.strokeStyle = OUT; c.lineWidth = 1; c.stroke();
    c.strokeStyle = trim; c.lineWidth = Math.max(1, k * 0.05);   // cuello
    c.beginPath(); c.moveTo(x - k * 0.08, shY); c.lineTo(x, shY + k * 0.08); c.lineTo(x + k * 0.08, shY); c.stroke();
    if (k > 13) {
      c.fillStyle = trim;
      c.font = `800 ${Math.round(k * 0.32)}px Oswald, Inter, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(L.num, x, shY + k * 0.33);
    }
    arm(face);
    // cuello y cabeza
    const hcol = L.hair, back = x - face * hr * 0.15;
    if (L.style === 'afro') { c.fillStyle = hcol; c.beginPath(); c.arc(back, hy - hr * 0.3, hr * 1.6, 0, 7); c.fill(); }
    if (L.style === 'curlylong' || L.style === 'long') { c.fillStyle = hcol; c.beginPath(); c.roundRect(x - face * hr * 1.15 - (face < 0 ? hr * 0.6 : 0), hy - hr * 0.3, hr * 0.62, hr * (L.style === 'long' ? 1.5 : 1.3), hr * 0.25); c.fill(); }
    c.fillStyle = shade(L.skin, 0.85); c.fillRect(x - k * 0.06, shY - k * 0.08, k * 0.12, k * 0.1);
    const hg = c.createRadialGradient(x - hr * 0.4, hy - hr * 0.4, hr * 0.1, x, hy, hr);
    hg.addColorStop(0, shade(L.skin, 1.15)); hg.addColorStop(1, shade(L.skin, 0.85));
    c.fillStyle = hg; c.beginPath(); c.arc(x, hy, hr, 0, 7); c.fill(); c.strokeStyle = OUT; c.lineWidth = 0.8; c.stroke();
    c.fillStyle = shade(L.skin, 0.9); c.beginPath(); c.arc(x + face * hr * 0.92, hy + hr * 0.1, hr * 0.2, 0, 7); c.fill(); // nariz
    if (k > 11) { c.fillStyle = '#1b1b1b'; c.beginPath(); c.arc(x + face * hr * 0.5, hy - hr * 0.12, Math.max(0.7, hr * 0.11), 0, 7); c.fill(); } // ojo
    // barba / bigote
    c.fillStyle = hcol;
    if (L.face === 'beard') { c.globalAlpha = 0.85; c.beginPath(); c.arc(x + face * hr * 0.12, hy + hr * 0.05, hr * 0.98, Math.PI * 0.05, Math.PI * 0.95); c.fill(); c.globalAlpha = 1; }
    else if (L.face === 'mustache') c.fillRect(x + face * hr * 0.5 - hr * 0.28, hy + hr * 0.32, hr * 0.56, hr * 0.14);
    else if (L.face === 'goatee') { c.beginPath(); c.arc(x + face * hr * 0.35, hy + hr * 0.82, hr * 0.22, 0, 7); c.fill(); }
    // pelo
    const cap = (rr = 1.06, dy = 0.15) => { c.beginPath(); c.arc(x - face * hr * 0.1, hy - hr * dy, hr * rr, Math.PI, Math.PI * 2); c.fill(); };
    c.fillStyle = hcol;
    switch (L.style) {
      case 'bald': c.fillStyle = 'rgba(255,255,255,.25)'; c.beginPath(); c.arc(x - hr * 0.3, hy - hr * 0.55, hr * 0.22, 0, 7); c.fill(); break;
      case 'buzz': c.globalAlpha = 0.75; cap(1.0, 0.1); c.globalAlpha = 1; break;
      case 'afro': cap(1.12, 0.2); break;
      case 'mohawk': c.globalAlpha = 0.55; cap(1.0, 0.1); c.globalAlpha = 1; c.beginPath(); c.roundRect(x - hr * 0.2, hy - hr * 1.5, hr * 0.4, hr * 0.75, hr * 0.15); c.fill(); break;
      case 'curly': case 'curlylong': cap(1.06, 0.15); for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(x - face * hr * 0.1 + (i - 2) * hr * 0.42, hy - hr * 0.95 + Math.abs(i - 2) * hr * 0.18, hr * 0.32, 0, 7); c.fill(); } break;
      case 'bun': cap(1.04, 0.15); c.beginPath(); c.arc(x - face * hr * 0.55, hy - hr * 1.1, hr * 0.38, 0, 7); c.fill(); break;
      case 'ponytail': cap(1.04, 0.15); c.beginPath(); c.roundRect(x - face * hr * 1.05 - (face < 0 ? hr * 0.3 : 0), hy - hr * 0.6, hr * 0.3, hr * 1.1, hr * 0.15); c.fill(); break;
      case 'braids': case 'dreads': cap(1.08, 0.15); c.strokeStyle = hcol; c.lineWidth = Math.max(1, hr * (L.style === 'dreads' ? 0.3 : 0.2));
        for (let i = 0; i < 4; i++) line([[x - face * hr * (0.2 + i * 0.25), hy - hr * 0.5], [x - face * hr * (0.45 + i * 0.25), hy + hr * (L.style === 'dreads' ? 1.4 : 1.0)]]); break;
      default: cap(1.06, 0.15);
    }
    if (L.band) { c.fillStyle = L.band; c.fillRect(x - hr * 1.02, hy - hr * 0.55, hr * 2.04, hr * 0.26); }
    if (L.helmet) {   // casco protector (como el de Čech)
      c.fillStyle = '#111827'; c.beginPath(); c.arc(x, hy - hr * 0.05, hr * 1.12, Math.PI * 0.95, Math.PI * 2.05); c.fill();
      c.strokeStyle = '#111827'; c.lineWidth = Math.max(1, hr * 0.18); line([[x - face * hr * 0.6, hy], [x + face * hr * 0.4, hy + hr * 0.9]]);
    }
    if (L.glasses) { c.strokeStyle = '#f97316'; c.lineWidth = Math.max(1, hr * 0.18); line([[x - face * hr * 0.2, hy - hr * 0.15], [x + face * hr * 0.95, hy - hr * 0.15]]); }
    c.restore();
  }
}
function drawRadar(c, w, h) {
  const rw = Math.min(150, w * 0.2), rh = rw * PW / PL, rx = w - rw - 8, ry = 8;
  c.fillStyle = 'rgba(10,14,25,.7)'; c.beginPath(); c.roundRect(rx - 4, ry - 4, rw + 8, rh + 8, 6); c.fill();
  c.fillStyle = 'rgba(34,120,50,.55)'; c.fillRect(rx, ry, rw, rh);
  c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 1; c.strokeRect(rx, ry, rw, rh);
  c.beginPath(); c.moveTo(rx + rw / 2, ry); c.lineTo(rx + rw / 2, ry + rh); c.stroke();
  c.beginPath(); c.arc(rx + rw / 2, ry + rh / 2, rh * 0.13, 0, 7); c.stroke();
  for (const p of M.all) {
    c.fillStyle = p === M.ctrl ? '#facc15' : M[p.side].col;
    c.beginPath(); c.arc(rx + p.x / PL * rw, ry + p.y / PW * rh, p === M.ctrl ? 3.4 : 2.3, 0, 7); c.fill();
    c.strokeStyle = 'rgba(0,0,0,.6)'; c.stroke();
  }
  c.fillStyle = '#fff'; c.beginPath(); c.arc(rx + M.ball.x / PL * rw, ry + M.ball.y / PW * rh, 2, 0, 7); c.fill();
}

/* ----- Arranque ----- */
function addSoundBtn() {
  const mc = app.querySelector('.match-ctrl'); if (!mc || $('#snd-btn')) return;
  const b = document.createElement('button'); b.className = 'chipbtn'; b.id = 'snd-btn';
  const paint = () => { b.textContent = SND.on ? '🔊 Sonido' : '🔇 Sin sonido'; };
  b.onclick = () => { SND.on = !SND.on; if (save) { save.mute = !SND.on; persist(); } sndInit(); paint(); };
  paint(); mc.insertBefore(b, mc.children[1] || null);
}
// Panel del técnico: mentalidad, presión y velocidad del partido
function coachPanel() {
  const tp = $('#tp'); if (!tp) return;
  tp.className = 'coach panel';
  tp.innerHTML = `
    <div class="co-row"><span class="co-lbl">Mentalidad</span><div class="seg" data-t="m">
      <button data-v="-1">🛡️ Defender</button><button data-v="0" class="on">⚖️ Equilibrado</button><button data-v="1">⚔️ Atacar</button></div></div>
    <div class="co-row"><span class="co-lbl">Presión</span><div class="seg" data-t="pr">
      <button data-v="0">🧱 Esperar atrás</button><button data-v="1" class="on">👟 Normal</button><button data-v="2">🔥 Presión alta</button></div></div>
    <div class="co-row"><span class="co-lbl">Velocidad</span><div class="seg" data-t="sp">
      <button data-v="1" class="on">x1</button><button data-v="2">x2</button><button data-v="4">x4</button></div></div>`;
  const said = {
    m: { '-1': '🗣️ El técnico grita: ¡Todos atrás, cuidemos el arco!', '0': '🗣️ El técnico pide: ¡Equilibrio, muchachos!', '1': '🗣️ El técnico grita: ¡Vamos al ataque!' },
    pr: { '0': '🗣️ Indicación: esperar en nuestro campo.', '1': '🗣️ Indicación: presión normal.', '2': '🗣️ Indicación: ¡a presionar arriba, que no piensen!' },
  };
  tp.querySelectorAll('.seg').forEach(seg => seg.onclick = e => {
    const b = e.target.closest('button'); if (!b || !M) return;
    seg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
    const t = seg.dataset.t, v = +b.dataset.v;
    if (t === 'sp') M.speed = v; else { M.tac[t] = v; matchLog(said[t][String(v)], 'info'); }
  });
  const help = app.querySelector('.arc-help'); if (help) help.remove();
}
function arcScreen(left, right) {
  app.innerHTML = `<div class="screen match arc">
    <div class="scoreboard panel">
      <div class="sb-team">${left}</div>
      <div class="sb-score"><span id="sc">0 - 0</span><small id="mn">0'</small></div>
      <div class="sb-team right">${right}</div>
      <div class="sb-goals" id="gl0"></div><div></div><div class="sb-goals right" id="gl1"></div>
    </div>
    <div class="pitch-wrap"><canvas id="cv" tabindex="0"></canvas><div class="goalflash" id="gf"></div></div>
    <div class="touchpad" id="tp">
      <div class="joy-wrap"><div class="joy" id="joy"><div class="knob" id="knob"></div></div><span>Arrastrá el círculo para moverte</span></div>
      <div class="tbtns">
        <button data-k="grab" class="grab">✋ AGARRAR<small>mantené apretado</small></button>
        <button data-k="pass">👟 PASAR</button>
        <button data-k="shoot" class="shoot">⚽ TIRAR<small>mantené = más fuerte</small></button>
        <button data-k="sprint">🏃 CORRER</button>
        <button data-k="slide" class="slide">🦵 BARRER<small>sin pelota</small></button>
        <button data-k="switch">🔄 CAMBIAR</button>
      </div>
    </div>
    <div class="arc-help panel">
      <span><kbd>←↑→↓</kbd> o <kbd>WASD</kbd> moverte</span>
      <span><kbd>X</kbd> pase · sin pelota: quitar</span>
      <span><kbd>Espacio</kbd> tiro (mantené = más fuerte)</span>
      <span><kbd>Shift</kbd> correr</span><span><kbd>Z</kbd> agarrar la pelota</span><span><kbd>V</kbd> barrer</span><span><kbd>C</kbd> cambiar jugador</span><span><kbd>P</kbd> pausa</span>
    </div>
    <div class="match-ctrl">
      <button class="big slim" id="btn-ed">⏸ Pausa / Cambios</button>
      <div class="mstats" id="ms"></div>
    </div>
    <div class="panel arc-feed" id="feed"></div></div>`;
}
function startArcade(key, coach = false) {
  const r = rivalInfo(RIVALS.find(x => x.key === key));
  if (save.xi.filter(Boolean).length < 11) { toast('Tu once está incompleto: completá los 11 titulares'); return renderPre(key); }
  let awayCol = COUNTRIES[r.c].c1;
  if (colDist(awayCol, save.color) < 120) awayCol = COUNTRIES[r.c].c2;
  if (colDist(awayCol, save.color) < 120) awayCol = lum(save.color) > 0.5 ? '#111111' : '#ffffff';
  M = {
    r, arcade: true, min: 0, add: 0, score: [0, 0], shots: [0, 0], onT: [0, 0], possSum: 0, ticks: 0, scorers: [[], []],
    paused: false, ended: false, carded: new Set(), half: 1, clock: 0, halfLen: (save.arcLen || 3) * 60,
    ball: { x: PL / 2, y: PW / 2, vx: 0, vy: 0, owner: null }, want: {}, charge: 0, joy: { x: 0, y: 0 }, goalT: 0, swT: 0,
    chaser: {}, cover: {}, fk: null, wallT: 0, diff: save.arcDiff || 'facil', aiF: coach ? 1 : DIFFS[save.arcDiff || 'facil'].aiF,
    coach, tac: { m: 0, pr: 1 }, speed: 1, cards: {},
    home: { xi: save.xi.slice(), f: save.formation, st: {}, subs: 5, out: new Set(), col: save.color },
    away: { xi: r._xi.slice(), f: r.f, st: {}, subs: 5, out: new Set(), col: awayCol, bench: r.ids.filter(id => !r._xi.includes(id)) },
  };
  arcScreen(`${crest(save.name, save.color, 'sm')}<span>${esc(save.name)}</span>`, `<span>${r.name}</span>${chip(r.c)}`);
  M.cv = $('#cv');
  M.P = { home: FORMATIONS[M.home.f].map((_, i) => mkP('home', i)), away: FORMATIONS[M.away.f].map((_, i) => mkP('away', i)) };
  M.all = [...M.P.home, ...M.P.away];
  kickoff('home');
  $('#btn-ed').onclick = () => pauseArc();
  M.cv.onpointerdown = () => M.cv.focus();
  if (coach) coachPanel(); else bindTouch();
  sndInit(); sndWhistle(1); addSoundBtn();
  matchLog(coach ? `🧑‍💼 ¡Arranca el partido! Sos el técnico de ${esc(save.name)}: mirá el partido, dale indicaciones al equipo y hacé cambios con ⏸ Pausa.`
    : `🏟️ ¡Arranca el partido! Manejás al jugador con el anillo amarillo. ${esc(save.name)} vs ${r.name}.`, 'info');
  updateHUD();
  M.raf = requestAnimationFrame(arcFrame);
}
