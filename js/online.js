/* ================= Jugar contra amigos (en línea) =================
 * Usa la "sala" del link de Claude: cada amigo abre el juego, uno crea una sala
 * y el otro entra. El que crea la sala hace correr el partido y le manda a su
 * amigo dónde está cada jugador; el amigo le manda qué botones aprieta.
 * Todo lo que llega del otro lado se revisa antes de usarlo. */
let NET = null;
const ROOM_PREFIX = 'mundial-';
const LOG_CLS = ['', 'info', 'goal home', 'goal away', 'save', 'sub', 'card', 'miss'];

async function getRoom() {
  if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname) && /[?&]fake/.test(location.search)) return fakeRoom();
  // Versión web: salas con Supabase (hace falta haber entrado con tu cuenta)
  if (typeof cloudOn === 'function' && cloudOn()) { try { return await supaRoom(); } catch (e) { return null; } }
  try { return (window.claude && typeof window.claude.use === 'function') ? await window.claude.use('room') : null; } catch (e) { return null; }
}
const num = (v, d = 0) => (typeof v === 'number' && Number.isFinite(v)) ? v : (Number.isFinite(+v) && v !== null && v !== '' ? +v : d);
const okColor = c => typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c);
const cleanName = n => String(n || '').replace(/[<>&"'`\\\u0000-\u001f\u007f]/g, '').trim().slice(0, 22);

function myTeam() {
  const o = {}; save.xi.forEach(id => { if (id) o[id] = ovr(id); });
  return { n: cleanName(save.name) || 'Mi Equipo', c: okColor(save.color) ? save.color : '#e63946', f: save.formation, xi: save.xi.slice(), o };
}
// Revisa el equipo que manda el otro (puede venir cualquier cosa)
function cleanTeam(t) {
  if (!t || typeof t !== 'object' || !FORMATIONS[t.f] || !Array.isArray(t.xi)) return null;
  if (t.xi.length !== FORMATIONS[t.f].length || !t.xi.every(id => typeof id === 'string' && DB[id])) return null;
  if (new Set(t.xi).size !== t.xi.length) return null;
  const o = {}, src = (t.o && typeof t.o === 'object') ? t.o : {};
  t.xi.forEach(id => { o[id] = clamp(Math.round(num(src[id], DB[id].o)), DB[id].o, 99); });
  return { n: cleanName(t.n) || 'Amigos FC', c: okColor(t.c) ? t.c : '#e63946', f: t.f, xi: t.xi.slice(), o };
}

/* ----- Pantalla de salas ----- */
async function renderFriends() {
  leaveOnline();
  if (!save) return renderNewGame();
  stopMatchLoops(); closeModal(); window.scrollTo(0, 0);
  app.innerHTML = `<div class="screen narrow">
    <header class="bar"><button class="back" id="fr-back">← Menú</button><h2>Jugar con amigos</h2><span></span></header>
    <div id="fr"><div class="panel"><p class="mut">Conectando con tus amigos…</p></div></div></div>`;
  $('#fr-back').onclick = () => { leaveOnline(); go('menu'); };
  if (save.xi.filter(Boolean).length < 11) {
    $('#fr').innerHTML = `<div class="panel"><p>Antes de jugar, completá tus 11 titulares en la Plantilla.</p><button class="big" data-go="squad">📋 Ir a la Plantilla</button></div>`;
    return;
  }
  const room = await getRoom();
  if (!$('#fr') || NET) return;
  if (!room) {
    $('#fr').innerHTML = `<div class="panel fr-box"><h3>No se puede conectar acá</h3>
      ${typeof cloudReady === 'function' && cloudReady()
        ? '<p>No se pudo conectar con la sala. Revisá tu internet y probá de nuevo.</p>'
        : '<p>Para jugar contra amigos, los dos tienen que abrir el juego <b>desde el link</b>, con su cuenta iniciada.</p>'}</div>`;
    return;
  }
  NET = { room, unsubs: [], g: null, role: null, opp: null, me: cleanTeam(myTeam()), seq: 0, lastK: 0, lastAt: 0,
    cnt: { s: 0, sp: 0, p: 0, sl: 0, sw: 0 }, last: [0, 0, 0, 0, 0], logs: [], logN: 0, seenLog: 0 };
  NET.unsubs.push(room.onPeers(() => paintLobby(), e => netErr(e)));
  paintLobby();
}
function paintLobby() {
  if (!NET || NET.role || !$('#fr')) return;
  const keep = $('#fr-code') ? $('#fr-code').value : '', hadFocus = document.activeElement && document.activeElement.id === 'fr-code';
  const salas = NET.room.peers().filter(p => !p.isMe && p.presence && /^\d{4}$/.test(String(p.presence.sala || '')));
  $('#fr').innerHTML = `
    <div class="panel fr-box"><h3>Crear una sala</h3>
      <p class="mut">Creás una sala y tu amigo entra desde su compu o celular. Jugás con <b>${esc(save.name)}</b>.</p>
      <button class="big" id="fr-new">➕ Crear sala</button></div>
    <div class="panel fr-box"><h3>Salas de tus amigos</h3>
      ${salas.length ? `<div class="fr-list">${salas.map(p => {
        const code = String(p.presence.sala), n = cleanName(p.presence.club) || 'Un amigo', c = okColor(p.presence.col) ? p.presence.col : '#64748b';
        return `<button class="fr-sala" data-code="${code}">${crest(n, c, 'sm')}<span class="fr-n"><b>${esc(n)}</b><small>Sala ${code}</small></span><span class="fr-go">Entrar ▶</span></button>`;
      }).join('')}</div>` : '<p class="mut">Todavía no hay salas abiertas. Cuando un amigo cree una, aparece acá.</p>'}
      <div class="fr-code"><input id="fr-code" inputmode="numeric" maxlength="4" placeholder="Número de sala" autocomplete="off"><button class="big slim" id="fr-join">Entrar</button></div>
    </div>`;
  const inp = $('#fr-code'); inp.value = keep; if (hadFocus) inp.focus();
  $('#fr-new').onclick = createSala;
  $('#fr-join').onclick = () => joinSala(inp.value.trim());
  inp.onkeydown = e => { if (e.key === 'Enter') joinSala(inp.value.trim()); };
  app.querySelectorAll('.fr-sala').forEach(b => b.onclick = () => joinSala(b.dataset.code));
}
function paintWait(html, cancel = true) {
  if (!$('#fr')) return;
  $('#fr').innerHTML = `<div class="panel fr-box fr-wait">${html}${cancel ? '<button class="big alt" id="fr-cancel">Cancelar</button>' : ''}</div>`;
  if (cancel) $('#fr-cancel').onclick = () => renderFriends();
}
function netErr(e) {
  if (M && M.online && !M.ended) return oppLeft('Se cortó la conexión.');
  if ($('#fr')) $('#fr').innerHTML = `<div class="panel fr-box"><h3>Se cortó la conexión</h3><p class="mut">Cerrá y volvé a abrir el juego desde el link de Claude.</p></div>`;
}

/* ----- Crear sala (el que crea hace correr el partido) ----- */
async function createSala() {
  if (!NET || NET.role) return;
  const code = String(1000 + Math.floor(rnd() * 9000));
  NET.role = 'host'; NET.code = code;
  paintWait('<p>Creando la sala…</p>', false);
  try { NET.g = await NET.room.join(ROOM_PREFIX + code); } catch (e) { NET.role = null; toast('No se pudo crear la sala. Probá de nuevo.'); return paintLobby(); }
  if (!NET) return;
  NET.room.presence({ sala: code, club: NET.me.n, col: NET.me.c }).catch(() => {});
  NET.g.presence({ role: 'host', team: NET.me, len: save.arcLen || 3 }).catch(() => {});
  paintWait(`<div class="fr-big">${code}</div><h3>¡Sala creada! Esperando a tu amigo…</h3>
    <p class="mut">Decile que abra el juego, toque <b>👥 Jugar con amigos</b> y entre a tu sala. El partido arranca solo cuando entra.</p>`);
  NET.unsubs.push(NET.g.onPeers(ch => hostPeers(ch), e => netErr(e)));
}
function hostPeers(ch) {
  if (!NET || NET.role !== 'host') return;
  if (!NET.started) {
    const gst = ch.peers.find(p => !p.isMe && p.presence && p.presence.role === 'guest' && cleanTeam(p.presence.team));
    if (gst) hostStart(gst);
    return;
  }
  const opp = ch.peers.find(p => p.peer === NET.opp);
  if (!opp) { if (!M.ended) oppLeft('Tu amigo se fue del partido.'); return; }
  readGuest(opp.presence);
}
function hostStart(gst) {
  if (NET.started) return;
  NET.started = true; NET.opp = gst.peer;
  NET.g.presence({ vs: gst.peer }).catch(() => {});
  NET.room.presence({ sala: null, club: null, col: null }).catch(() => {});
  buildOnlineMatch(NET.me, cleanTeam(gst.presence.team), 'host', save.arcLen || 3);
  NET.timer = setInterval(hostSend, 50);
  hostSend();
}
function readGuest(pr) {
  if (!pr || !M || !M.rin) return;
  const R = M.rin, inp = Array.isArray(pr.in) ? pr.in : [0, 0, 0, 0];
  let x = clamp(num(inp[0]) / 100, -1, 1), y = clamp(num(inp[1]) / 100, -1, 1); const m = Math.hypot(x, y); if (m > 1) { x /= m; y /= m; }
  R.x = x; R.y = y; R.sprint = !!inp[2]; R.grab = !!inp[3];
  if (Array.isArray(pr.a) && pr.a.length === 5) {
    const a = pr.a.map(v => num(v)), L = NET.last;
    if (a[0] > L[0]) R.want.shoot = clamp(a[1] || 0.4, 0.05, 2);
    if (a[2] > L[2]) R.want.pass = true;
    if (a[3] > L[3]) R.want.slide = true;
    if (a[4] > L[4]) R.want.sw = true;
    NET.last = a;
  }
}
function snap() {
  const B = M.ball, idx = p => p ? M.all.indexOf(p) : -1, pl = [];
  for (const p of M.all) pl.push(Math.round(p.x * 10), Math.round(p.y * 10), Math.round(p.fx * 9), Math.round(p.fy * 9), (p.slide > 0 ? 1 : 0) | (p.stun > 0 ? 2 : 0) | (p.wall ? 4 : 0) | (p.dive > 0 ? 8 : 0) | (p.diveDir < 0 ? 16 : 0));
  return {
    k: ++NET.seq, t: Math.round(M.clock * 10) / 10, h: M.half, m: M.min, s: M.score.slice(), b: [Math.round(B.x * 10), Math.round(B.y * 10), Math.round((B.z || 0) * 10)], bn: M.banner ? [String(M.banner.text).slice(0, 40), M.banner.color] : 0,
    o: idx(B.owner), p: pl, c1: idx(M.ctrl), c2: idx(M.ctrl2), gt: M.goalT > 0 ? Math.round(M.goalT * 10) : 0,
    fk: M.fk ? [M.fk.side === 'home' ? 0 : 1, M.fk.pen ? 1 : 0, Math.round(M.fk.x * 10), Math.round(M.fk.y * 10)] : 0,
    st: [M.shots[0], M.shots[1], M.onT[0], M.onT[1], M.ticks ? Math.round(M.possSum / M.ticks * 100) : 50], e: M.ended ? 1 : 0,
  };
}
function hostSend() {
  if (!NET || !NET.g || !M || !M.online) return;
  const patch = { g: snap(), lg: NET.logs.slice(), gl: M.scorers.map(a => a.slice(-8).map(x => [String(x.id).slice(0, 40), x.min])) };
  if (JSON.stringify(patch).length > 3200) patch.lg = [];
  NET.g.presence(patch).catch(() => {});
}

/* ----- Entrar a la sala de un amigo ----- */
async function joinSala(code) {
  if (!NET || NET.role) return;
  if (!/^\d{4}$/.test(code)) return toast('El número de sala tiene 4 números');
  NET.role = 'guest'; NET.code = code;
  paintWait(`<p>Entrando a la sala ${code}…</p>`);
  try { NET.g = await NET.room.join(ROOM_PREFIX + code); } catch (e) { NET.role = null; toast('No pude entrar a esa sala'); return paintLobby(); }
  if (!NET) return;
  NET.g.presence({ role: 'guest', team: NET.me }).catch(() => {});
  NET.unsubs.push(NET.g.onPeers(ch => guestPeers(ch), e => netErr(e)));
  NET.joinT = setTimeout(() => {
    if (NET && NET.role === 'guest' && !NET.started) paintWait(`<h3>No encontré a nadie en la sala ${code}</h3><p class="mut">Revisá el número con tu amigo, o pedile que cree la sala otra vez.</p>`);
  }, 10000);
}
function guestPeers(ch) {
  if (!NET || NET.role !== 'guest') return;
  const host = ch.peers.find(p => !p.isMe && p.presence && p.presence.role === 'host');
  const me = ch.peers.find(p => p.sameTab);
  if (!NET.started) {
    if (!host || !me) return;
    if (host.presence.vs && host.presence.vs !== me.peer) { clearTimeout(NET.joinT); return paintWait('<h3>Esa sala ya está jugando</h3><p class="mut">Pedile a tu amigo que cree otra sala.</p>'); }
    const H = cleanTeam(host.presence.team);
    if (host.presence.vs === me.peer && host.presence.g && H) {
      if (NET.started) return;
      NET.started = true; clearTimeout(NET.joinT); NET.opp = host.peer;
      buildOnlineMatch(H, NET.me, 'guest', clamp(Math.round(num(host.presence.len, 3)), 1, 5));
      NET.timer = setInterval(guestSend, 50);
      applySnap(host.presence);
    }
    return;
  }
  if (!host || host.peer !== NET.opp) { if (!M.ended) oppLeft('Tu amigo se fue del partido.'); return; }
  applySnap(host.presence);
}
function guestSend() {
  if (!NET || !NET.g || !M || !M.guest || M.ended) return;
  const iv = inputVec(), c = NET.cnt;
  NET.g.presence({ in: [Math.round(iv.x * 100), Math.round(iv.y * 100), KEYS.sprint ? 1 : 0, KEYS.grab ? 1 : 0], a: [c.s, c.sp, c.p, c.sl, c.sw] }).catch(() => {});
}
// En la compu del amigo: el partido no se calcula, se dibuja con lo que manda la sala
function guestFrame(dt) {
  const w = M.want, c = NET ? NET.cnt : null; M.want = {};
  if (c) {
    if (w.shoot) { c.s++; c.sp = Math.round(w.shoot * 100) / 100; }
    if (w.pass) c.p++; if (w.slide) c.sl++; if (w.sw) c.sw++;
  }
  if (M.charge > 0) M.charge += dt;
  M.clock += dt;
  const a = Math.min(1, dt * 14);
  for (const p of M.all) {
    if (p.tx == null) continue;
    if (Math.hypot(p.tx - p.x, p.ty - p.y) > 8) { p.x = p.tx; p.y = p.ty; } else { p.x += (p.tx - p.x) * a; p.y += (p.ty - p.y) * a; }
  }
  const B = M.ball;
  if (B.tx != null) {
    const bvx = (B.tx - B.x), bvy = (B.ty - B.y);
    if (Math.hypot(bvx, bvy) > 10) { B.x = B.tx; B.y = B.ty; } else { const k = Math.min(1, dt * 18); B.x += bvx * k; B.y += bvy * k; }
    B.vx = bvx * 4; B.vy = bvy * 4;
    if (B.tz != null) B.z = (B.z || 0) + (B.tz - (B.z || 0)) * Math.min(1, dt * 18);
  }
  if (!M.ended && NET && NET.lastAt && performance.now() - NET.lastAt > 8000) oppLeft('Se cortó la conexión con tu amigo.');
}
function applySnap(pr) {
  const S = pr && pr.g;
  if (!M || !M.guest || !S || typeof S !== 'object' || !Array.isArray(S.p) || S.p.length !== M.all.length * 5) return;
  const k = num(S.k); if (!(k > NET.lastK)) return;
  NET.lastK = k; NET.lastAt = performance.now();
  M.all.forEach((p, i) => {
    const j = i * 5;
    p.tx = clamp(num(S.p[j]) / 10, -2, PL + 2); p.ty = clamp(num(S.p[j + 1]) / 10, -2, PW + 2);
    const fx = num(S.p[j + 2]), fy = num(S.p[j + 3]), m = Math.hypot(fx, fy); if (m) { p.fx = fx / m; p.fy = fy / m; }
    const fl = num(S.p[j + 4]); p.slide = fl & 1 ? 0.3 : 0; p.stun = fl & 2 ? 0.2 : 0; p.wall = !!(fl & 4); if (fl & 8) { if (!(p.dive > 0)) p.dive = 0.7; p.diveDir = fl & 16 ? -1 : 1; } else p.dive = 0;
  });
  const B = M.ball, bb = Array.isArray(S.b) ? S.b : [];
  B.tx = clamp(num(bb[0], 525) / 10, -5, PL + 5); B.ty = clamp(num(bb[1], 340) / 10, -5, PW + 5); B.tz = clamp(num(bb[2], 0) / 10, 0, 30);
  M.banner = Array.isArray(S.bn) ? { text: String(S.bn[0]).slice(0, 40), color: okColor(S.bn[1]) ? S.bn[1] : '#facc15', t: 1 } : null;
  B.owner = M.all[num(S.o, -1)] || null;
  M.ctrl = M.all[num(S.c2, -1)] || null;     // vos (visitante): anillo amarillo
  M.ctrl2 = M.all[num(S.c1, -1)] || null;    // tu amigo: anillo celeste
  if (Math.abs(num(S.t) - M.clock) > 1) M.clock = num(S.t);
  const half = num(S.h) === 2 ? 2 : 1;
  if (half !== M.half) { M.half = half; toast('¡Segundo tiempo!'); }
  M.goalT = clamp(num(S.gt) / 10, 0, 5);
  M.fk = Array.isArray(S.fk) ? { side: S.fk[0] ? 'away' : 'home', pen: !!S.fk[1], x: clamp(num(S.fk[2]) / 10, 0, PL), y: clamp(num(S.fk[3]) / 10, 0, PW) } : null;
  if (Array.isArray(pr.gl) && pr.gl.length === 2) {
    M.scorers = pr.gl.map(a => Array.isArray(a) ? a.slice(-8).filter(x => Array.isArray(x)).map(x => ({ id: String(x[0]).slice(0, 40), min: clamp(Math.round(num(x[1])), 0, 99) })) : []);
  }
  const sc = Array.isArray(S.s) ? [clamp(Math.round(num(S.s[0])), 0, 99), clamp(Math.round(num(S.s[1])), 0, 99)] : M.score;
  if (sc[0] > M.score[0] || sc[1] > M.score[1]) {
    const si = sc[1] > M.score[1] ? 1 : 0, last = M.scorers[si][M.scorers[si].length - 1];
    M.score = sc; goalFlash(last ? last.id : '¡Gol!', si); sndRoar(1); sndWhistle(1);
  }
  M.score = sc;
  M.min = clamp(Math.round(num(S.m)), 0, 90);
  if (Array.isArray(S.st)) {
    M.shots = [num(S.st[0]), num(S.st[1])].map(v => clamp(Math.round(v), 0, 999)); M.onT = [num(S.st[2]), num(S.st[3])].map(v => clamp(Math.round(v), 0, 999));
    M.ticks = 100; M.possSum = clamp(num(S.st[4], 50), 0, 100);
  }
  if (Array.isArray(pr.lg)) for (const l of pr.lg) {
    if (!Array.isArray(l) || !(num(l[0]) > NET.seenLog)) continue;
    NET.seenLog = num(l[0]);
    matchLog(esc(String(l[1]).slice(0, 200)), LOG_CLS.includes(l[2]) ? l[2] : '');
  }
  const hud = JSON.stringify([M.score, M.min, M.shots, M.onT, Math.round(M.possSum), M.scorers]);
  if (hud !== NET.hud) { NET.hud = hud; updateHUD(); }
  if (num(S.e) && !M.ended) { M.ended = true; setTimeout(() => renderOnlineResult(), 1500); }
}

/* ----- Armar el partido (igual en las dos compus) ----- */
function buildOnlineMatch(H, A, role, len) {
  stopMatchLoops(); closeModal(); clearInput();
  let awayCol = A.c;
  if (colDist(awayCol, H.c) < 120) awayCol = lum(H.c) > 0.5 ? '#111111' : '#ffffff';
  M = {
    r: { name: A.n, key: null }, arcade: true, online: true, guest: role === 'guest', mySide: role === 'host' ? 'home' : 'away', homeName: H.n,
    ovr: { home: H.o, away: A.o }, min: 0, add: 0, score: [0, 0], shots: [0, 0], onT: [0, 0], possSum: 0, ticks: 0, scorers: [[], []],
    paused: false, ended: false, carded: new Set(), half: 1, clock: 0, halfLen: len * 60,
    ball: { x: PL / 2, y: PW / 2, z: 0, vx: 0, vy: 0, vz: 0, owner: null }, want: {}, charge: 0, joy: { x: 0, y: 0 }, goalT: 0, swT: 0, swT2: 0,
    chaser: {}, cover: {}, fk: null, wallT: 0, diff: 'normal', aiF: 1, rin: { x: 0, y: 0, sprint: false, grab: false, want: {} },
    home: { xi: H.xi.slice(), f: H.f, st: {}, subs: 0, out: new Set(), col: H.c },
    away: { xi: A.xi.slice(), f: A.f, st: {}, subs: 0, out: new Set(), col: awayCol, bench: [] },
  };
  arcScreen(`${crest(H.n, H.c, 'sm')}<span>${esc(H.n)}</span>`, `<span>${esc(A.n)}</span>${crest(A.n, awayCol, 'sm')}`);
  M.cv = $('#cv');
  M.P = { home: FORMATIONS[M.home.f].map((_, i) => mkP('home', i)), away: FORMATIONS[M.away.f].map((_, i) => mkP('away', i)) };
  M.all = [...M.P.home, ...M.P.away];
  kickoff('home');
  if (M.guest) { const t = M.ctrl; M.ctrl = M.ctrl2; M.ctrl2 = t; }
  const be = $('#btn-ed'); be.textContent = '🚪 Salir del partido';
  be.onclick = () => askYes('¿Salir del partido? Tu amigo se queda sin rival.', () => { leaveOnline(); go('menu'); }, 'Sí, salir');
  const ph = [...app.querySelectorAll('.arc-help span')].pop(); if (ph && /pausa/.test(ph.textContent)) ph.remove();
  M.cv.onpointerdown = () => M.cv.focus();
  bindTouch(); sndInit(); sndWhistle(1); addSoundBtn();
  const mine = role === 'host' ? H : A, theirs = role === 'host' ? A : H;
  matchLog(`👥 ¡Partido contra tu amigo! Vos sos <b>${esc(mine.n)}</b> (anillo amarillo) y atacás hacia la ${role === 'host' ? 'derecha →' : 'izquierda ←'}. Tu amigo maneja a <b>${esc(theirs.n)}</b> (anillo celeste).`, 'info');
  if (!M.guest) M.onLog = (text, cls) => { NET.logN++; NET.logs.push([NET.logN, String(text).slice(0, 140), cls || '']); if (NET.logs.length > 4) NET.logs.shift(); };
  updateHUD();
  M.raf = requestAnimationFrame(arcFrame);
}
// Fin de cada tiempo en el partido contra un amigo (lo decide el que creó la sala)
function onlineWhistle() {
  if (M.half === 1) {
    M.half = 2; M.clock = 0;
    matchLog('⏸️ ¡Fin del primer tiempo! Arranca el segundo.', 'info'); toast('¡Segundo tiempo!');
    kickoff('away'); return;
  }
  M.ended = true; updateHUD();
  matchLog(`🏁 ¡Final! ${esc(M.homeName)} ${M.score[0]} - ${M.score[1]} ${M.r.name}`, 'info');
  hostSend();
  setTimeout(() => renderOnlineResult(), 1500);
}
function oppLeft(msg) {
  if (!M || !M.online || M.ended) return;
  M.ended = true;
  renderOnlineResult(msg);
}
function renderOnlineResult(note) {
  if (!M || !M.online || M.shown) return;
  M.shown = true;
  stopMatchLoops(); if (NET) { clearInterval(NET.timer); NET.timer = null; }
  const my = M.mySide === 'home' ? 0 : 1, a = M.score[my], b = M.score[1 - my];
  const res = note ? ['PARTIDO CORTADO', 'draw'] : a > b ? ['¡GANASTE!', 'win'] : a === b ? ['EMPATE', 'draw'] : ['PERDISTE', 'loss'];
  if (!note) { save.friends = save.friends || { w: 0, d: 0, l: 0 }; save.friends[a > b ? 'w' : a === b ? 'd' : 'l']++; persist(); }
  const fr = save.friends || { w: 0, d: 0, l: 0 };
  const gl = s => M.scorers[s].map(g => `⚽ ${esc(short(g.id))} ${g.min}'`).join('<br>') || '<span class="mut">—</span>';
  app.innerHTML = `<div class="screen narrow">
    <div class="result ${res[1]} panel"><h2>${res[0]}</h2>
      <div class="ht-score">${esc(M.homeName)} <b>${M.score[0]} - ${M.score[1]}</b> ${M.r.name}</div>
      <div class="or-goals"><div>${gl(0)}</div><div>${gl(1)}</div></div>
      ${note ? `<p class="mut">${esc(note)}</p>` : ''}
      <p class="mut">Contra amigos: <b>${fr.w}</b> ganados · <b>${fr.d}</b> empatados · <b>${fr.l}</b> perdidos</p></div>
    <div class="menu-btns"><button class="big" id="or-again">👥 Jugar otra vez</button><button class="big alt" id="or-menu">Volver al menú</button></div></div>`;
  $('#or-again').onclick = () => renderFriends();
  $('#or-menu').onclick = () => { leaveOnline(); go('menu'); };
}
function leaveOnline() {
  if (!NET) return;
  const N = NET; NET = null;
  clearInterval(N.timer); clearTimeout(N.joinT);
  N.unsubs.forEach(u => { try { u(); } catch (e) { } });
  if (N.g) N.g.leave().catch(() => {});
  N.room.presence({ sala: null, club: null, col: null }).catch(() => {});
  if (M && M.online) { M.ended = true; stopMatchLoops(); }
}

/* ----- Salas con Supabase (versión web) -----
 * Imita la "sala" de Claude: cada jugador manda su estado (presence) por un canal de
 * Supabase Realtime, como mucho ~11 veces por segundo, y cada 2 s avisa que sigue ahí. */
function supaRoom() {
  if (window.__supaRoom) return window.__supaRoom;
  const sb = CLOUD.sb, me = Math.random().toString(36).slice(2, 10), rooms = {};
  const mk = name => new Promise((resolve, reject) => {
    const ch = sb.channel('mundialistas-' + name, { config: { broadcast: { self: false, ack: false } } });
    const peers = new Map(), subs = new Set();
    let mine = {}, closed = false, lastSent = 0, sendT = null, ready = false;
    const self = () => ({ peer: me, by: CLOUD.user ? CLOUD.user.id : null, isMe: true, sameTab: true, kind: 'viewer', guest: false, presence: mine, updatedAt: Date.now() });
    const snapshot = () => [self(), ...[...peers.values()].map(x => x.p)];
    const fire = (joined = [], left = [], updated = []) => setTimeout(() => { const ps = snapshot(); subs.forEach(f => { try { f({ peers: ps, joined, left, updated }); } catch (e) { } }); }, 0);
    const send = () => {
      if (closed || !ready) return;
      lastSent = Date.now(); sendT = null;
      ch.send({ type: 'broadcast', event: 'p', payload: { peer: me, presence: mine } }).catch(() => {});
    };
    const queue = () => { if (sendT) return; const wait = Math.max(0, 90 - (Date.now() - lastSent)); sendT = setTimeout(send, wait); };
    ch.on('broadcast', { event: 'p' }, ({ payload }) => {
      if (!payload || typeof payload.peer !== 'string' || payload.peer === me) return;
      const had = peers.has(payload.peer), pr = (payload.presence && typeof payload.presence === 'object') ? payload.presence : {};
      const p = { peer: payload.peer, by: null, isMe: false, sameTab: false, kind: 'viewer', guest: false, presence: pr, updatedAt: Date.now() };
      peers.set(payload.peer, { p, seen: Date.now() });
      if (!had) queue();            // que el nuevo también nos vea
      fire(had ? [] : [p], [], had ? [p] : []);
    });
    ch.on('broadcast', { event: 'bye' }, ({ payload }) => {
      const x = payload && peers.get(payload.peer); if (!x) return;
      peers.delete(payload.peer); fire([], [x.p]);
    });
    const keep = setInterval(() => {
      if (closed) return;
      send();
      const now = Date.now();
      for (const [k, x] of peers) if (now - x.seen > 7000) { peers.delete(k); fire([], [x.p]); }
    }, 2000);
    const api = {
      name,
      presence: async patch => { for (const k in patch) { if (patch[k] === null) delete mine[k]; else mine[k] = patch[k]; } mine = { ...mine }; queue(); fire(); },
      peers: snapshot,
      onPeers: (f, onErr) => { subs.add(f); setTimeout(() => f({ peers: snapshot(), joined: snapshot(), left: [], updated: [] }), 0); return () => subs.delete(f); },
      connected: () => ready && !closed,
      leave: async () => {
        if (closed) return; closed = true; clearInterval(keep); clearTimeout(sendT); subs.clear(); delete rooms[name];
        try { await ch.send({ type: 'broadcast', event: 'bye', payload: { peer: me } }); } catch (e) { }
        try { await sb.removeChannel(ch); } catch (e) { }
      },
    };
    let settled = false;
    ch.subscribe(status => {
      if (status === 'SUBSCRIBED') { ready = true; send(); if (!settled) { settled = true; resolve(api); } }
      else if ((status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') && !settled) { settled = true; clearInterval(keep); reject(new Error(status)); }
    });
    setTimeout(() => { if (!settled) { settled = true; clearInterval(keep); reject(new Error('timeout')); } }, 10000);
    window.addEventListener('beforeunload', () => { if (!closed) ch.send({ type: 'broadcast', event: 'bye', payload: { peer: me } }).catch(() => {}); });
  });
  window.__supaRoom = mk('lobby').then(lobby => ({ ...lobby, join: name => rooms[name] || (rooms[name] = mk(name).catch(e => { delete rooms[name]; throw e; })) }))
    .catch(e => { window.__supaRoom = null; throw e; });
  return window.__supaRoom;
}

/* ----- Sala de prueba (solo en la compu de desarrollo, con ?fake en la dirección) ----- */
function fakeRoom() {
  if (window.__fakeRoom) return window.__fakeRoom;
  const me = Math.random().toString(36).slice(2, 10);
  function mk(name) {
    const ch = new BroadcastChannel('fr-' + name), peers = new Map(), subs = new Set();
    let mine = {}, closed = false;
    const self = () => ({ peer: me, by: null, isMe: true, sameTab: true, kind: 'viewer', guest: false, presence: mine, updatedAt: Date.now() });
    const snapshot = () => [self(), ...peers.values()];
    const fire = (joined = [], left = [], updated = []) => setTimeout(() => { const ps = snapshot(); subs.forEach(f => f({ peers: ps, joined, left, updated })); }, 0);
    ch.onmessage = e => {
      const d = e.data;
      if (d.t === 'p') {
        const had = peers.has(d.peer), p = { peer: d.peer, by: null, isMe: false, sameTab: false, kind: 'viewer', guest: false, presence: d.presence, updatedAt: Date.now() };
        peers.set(d.peer, p); if (!had) ch.postMessage({ t: 'p', peer: me, presence: mine });
        fire(had ? [] : [p], [], had ? [p] : []);
      } else if (d.t === 'bye') { const p = peers.get(d.peer); peers.delete(d.peer); if (p) fire([], [p]); }
    };
    const api = {
      name,
      presence: async patch => { for (const k in patch) { if (patch[k] === null) delete mine[k]; else mine[k] = patch[k]; } mine = { ...mine }; if (!closed) ch.postMessage({ t: 'p', peer: me, presence: mine }); fire(); },
      peers: snapshot,
      onPeers: f => { subs.add(f); setTimeout(() => f({ peers: snapshot(), joined: snapshot(), left: [], updated: [] }), 0); return () => subs.delete(f); },
      connected: () => true,
      leave: async () => { if (closed) return; closed = true; ch.postMessage({ t: 'bye', peer: me }); ch.close(); subs.clear(); delete rooms[name]; },
    };
    ch.postMessage({ t: 'p', peer: me, presence: mine });
    window.addEventListener('beforeunload', () => { if (!closed) ch.postMessage({ t: 'bye', peer: me }); });
    return api;
  }
  const rooms = {}, lobby = mk('lobby');
  return (window.__fakeRoom = { ...lobby, join: async name => rooms[name] || (rooms[name] = mk(name)) });
}
