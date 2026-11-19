/* ================= Amigos e invitaciones =================
 * Versión web (con cuenta): cada jugador tiene su lista de amigos (se guarda con su equipo).
 * Para jugar, tocás a un amigo conectado: le llega una notificación con "Aceptar" o
 * "Rechazar". Si acepta, el partido arranca solo.
 * Los mensajes viajan por un "buzón" en Supabase Realtime: un canal por usuario. */
const AMI = { inbox: null, pending: null, notif: null, notifT: null, waitT: null };
const amiOn = () => typeof cloudOn === 'function' && cloudOn();
const okUser = u => typeof u === 'string' && /^[a-z0-9_]{3,20}$/.test(u);
const inboxName = u => 'mundialistas-inbox-' + u;
const myUser = () => CLOUD.name;
function friendsList() { return (save && Array.isArray(save.amigos)) ? save.amigos.filter(okUser) : []; }
function addFriendLocal(u) {
  if (!save || !okUser(u) || u === myUser()) return false;
  save.amigos = friendsList();
  if (save.amigos.includes(u)) return false;
  save.amigos.push(u); persist(); return true;
}
// ¿Quién está conectado? (los que tienen el juego abierto con su cuenta)
function onlineUsers() {
  const room = window.__supaRoomReady; if (!room) return {};
  const out = {};
  for (const p of room.peers()) if (!p.isMe && p.presence && okUser(p.presence.usuario)) out[p.presence.usuario] = { equipo: cleanName(p.presence.equipo) || '', col: okColor(p.presence.color) ? p.presence.color : '#64748b' };
  return out;
}

// Al entrar con la cuenta: abrir mi buzón y avisar que estoy conectado
async function amiStart() {
  if (!amiOn() || AMI.inbox) return;
  try {
    const ch = CLOUD.sb.channel(inboxName(myUser()), { config: { broadcast: { self: false } } });
    ch.on('broadcast', { event: 'msg' }, ({ payload }) => { try { onInbox(payload); } catch (e) { } });
    ch.subscribe(); AMI.inbox = ch;
  } catch (e) { AMI.inbox = null; }
  amiPresence();
}
async function amiPresence() {
  if (!amiOn()) return;
  try {
    const room = await getRoom(); if (!room) return;
    window.__supaRoomReady = room;
    room.presence({ usuario: myUser(), equipo: save ? cleanName(save.name) : '', color: save && okColor(save.color) ? save.color : null });
    if (!AMI.peersHook) { AMI.peersHook = true; room.onPeers(() => { if ($('#fr') && NET && !NET.role) paintLobby(); }); }
  } catch (e) { }
}
function amiStop() {
  AMI.inbox = null; AMI.pending = null; window.__supaRoomReady = null; AMI.peersHook = false;
  closeNotif();
}

// Mandar un mensaje al buzón de otro jugador
async function sendTo(u, payload) {
  if (!amiOn() || !okUser(u)) throw new Error('no');
  const ch = CLOUD.sb.channel(inboxName(u), { config: { broadcast: { self: false } } });
  await new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error('timeout')), 8000);
    ch.subscribe(s => { if (s === 'SUBSCRIBED') { clearTimeout(t); res(); } else if (s === 'CHANNEL_ERROR' || s === 'TIMED_OUT') { clearTimeout(t); rej(new Error(s)); } });
  });
  await ch.send({ type: 'broadcast', event: 'msg', payload: { ...payload, from: myUser() } });
  setTimeout(() => { CLOUD.sb.removeChannel(ch).catch(() => {}); }, 1500);
}

// Llegó algo a mi buzón
function onInbox(m) {
  if (!m || typeof m !== 'object' || !okUser(m.from) || m.from === myUser()) return;
  const code = String(m.code || ''), from = m.from;
  if (m.type === 'invite' && /^\d{4}$/.test(code)) {
    if (M && M.cv && !M.ended) { sendTo(from, { type: 'reply', ok: false, why: 'jugando', code }).catch(() => {}); return; }
    showInvite(from, cleanName(m.equipo) || '', code);
  } else if (m.type === 'reply' && AMI.pending && AMI.pending.code === code && AMI.pending.to === from) {
    clearTimeout(AMI.waitT);
    if (m.ok) paintWait(`<h3>¡${esc(from)} aceptó! 🎉</h3><p class="mut">Entrando a la cancha…</p>`, false);
    else {
      const why = m.why === 'jugando' ? 'está jugando otro partido' : m.why === 'tiempo' ? 'no respondió' : 'no puede jugar ahora';
      AMI.pending = null;
      paintWait(`<h3>😕 ${esc(from)} ${why}</h3><p class="mut">Probá de nuevo en un rato o invitá a otro amigo.</p>`, false);
      setTimeout(() => { if ($('#fr') && !(M && M.online && !M.ended)) renderFriends(); }, 2600);
    }
  } else if (m.type === 'cancel' && AMI.notif && AMI.notif.code === code && AMI.notif.from === from) {
    closeNotif(); toast(`${from} canceló la invitación`);
  } else if (m.type === 'friend') {
    if (addFriendLocal(from)) { toast(`👥 ${from} te agregó como amigo`); if ($('#fr') && NET && !NET.role) paintLobby(); }
  }
}

// La notificación con Aceptar / Rechazar (aparece en cualquier pantalla)
function showInvite(from, equipo, code) {
  closeNotif();
  const n = document.createElement('div'); n.className = 'notif'; n.setAttribute('role', 'alertdialog');
  n.innerHTML = `<div class="nt-ball">⚽</div><div class="nt-txt"><b>${esc(from)}</b> te invita a jugar un partido${equipo ? `<small>con ${esc(equipo)}</small>` : ''}</div>
    <div class="nt-btns"><button class="nt-no" data-a="no">Rechazar</button><button class="nt-yes big slim" data-a="yes">✅ Aceptar</button></div><div class="nt-bar"></div>`;
  document.body.appendChild(n);
  AMI.notif = { el: n, from, code };
  if (typeof sndInit === 'function') { sndInit(); sndBeep(880, 0, 0.15, 0.08); sndBeep(1320, 0.18, 0.2, 0.08); }
  n.onclick = e => {
    const b = e.target.closest('[data-a]'); if (!b) return;
    const yes = b.dataset.a === 'yes';
    closeNotif();
    sendTo(from, { type: 'reply', ok: yes, code }).catch(() => {});
    if (yes) acceptInvite(from, code);
  };
  AMI.notifT = setTimeout(() => { if (AMI.notif && AMI.notif.code === code) { closeNotif(); sendTo(from, { type: 'reply', ok: false, why: 'tiempo', code }).catch(() => {}); } }, 40000);
}
function closeNotif() { clearTimeout(AMI.notifT); if (AMI.notif) { AMI.notif.el.remove(); AMI.notif = null; } }
async function acceptInvite(from, code) {
  addFriendLocal(from);
  stopMatchLoops(); closeModal();
  await renderFriends();
  if (NET && !NET.role) joinSala(code);
  else toast('No se pudo conectar con el partido. Probá de nuevo.');
}

// Invitar a un amigo: armo la cancha y le mando la invitación
async function inviteFriend(u) {
  if (!NET || NET.role) return;
  if (!onlineUsers()[u]) return toast(`${u} no está conectado ahora. Cuando abra el juego, aparece con 🟢.`);
  await createSala({ invite: u });
  if (!NET || NET.role !== 'host') return;
  AMI.pending = { to: u, code: NET.code };
  try { await sendTo(u, { type: 'invite', code: NET.code, equipo: save ? cleanName(save.name) : '' }); }
  catch (e) { AMI.pending = null; toast('No se pudo mandar la invitación. Revisá tu internet.'); return renderFriends(); }
  paintWait(`<div class="fr-wait-ball">⚽</div><h3>Invitación enviada a ${esc(u)}</h3><p class="mut">Esperando que acepte… Si acepta, el partido arranca solo.</p>`);
  const cancel = $('#fr-cancel');
  if (cancel) cancel.onclick = () => { if (AMI.pending) sendTo(AMI.pending.to, { type: 'cancel', code: AMI.pending.code }).catch(() => {}); AMI.pending = null; clearTimeout(AMI.waitT); renderFriends(); };
  clearTimeout(AMI.waitT);
  AMI.waitT = setTimeout(() => {
    if (AMI.pending && AMI.pending.to === u && !(M && M.online && !M.ended)) onInbox({ type: 'reply', ok: false, why: 'tiempo', code: AMI.pending.code, from: u });
  }, 45000);
}

// Pantalla de amigos (reemplaza a "Crear sala" en la versión web)
function paintFriendsList() {
  const on = onlineUsers(), list = friendsList().slice().sort((a, b) => (on[b] ? 1 : 0) - (on[a] ? 1 : 0) || a.localeCompare(b));
  const keep = $('#am-u') ? $('#am-u').value : '', focus = document.activeElement && document.activeElement.id === 'am-u';
  $('#fr').innerHTML = `
    <div class="panel fr-box"><h3>👥 Mis amigos</h3>
      ${list.length ? `<div class="fr-list">${list.map(u => {
        const o = on[u];
        return `<div class="am-row ${o ? 'on' : ''}">
          ${crest(o && o.equipo ? o.equipo : u, o ? o.col : '#475569', 'sm')}
          <span class="fr-n"><b>${esc(u)}</b><small>${o ? `🟢 Conectado${o.equipo ? ' · ' + esc(o.equipo) : ''}` : '⚪ Desconectado'}</small></span>
          <button class="big slim am-play" data-inv="${u}" ${o ? '' : 'disabled'}>⚽ Jugar</button>
          <button class="am-del" data-del="${u}" aria-label="Sacar a ${u} de mis amigos">✕</button>
        </div>`;
      }).join('')}</div>` : '<p class="mut">Todavía no agregaste amigos. Escribí el usuario de tu amigo acá abajo.</p>'}
    </div>
    <div class="panel fr-box"><h3>➕ Agregar un amigo</h3>
      <p class="mut small">Pedile a tu amigo su <b>nombre de usuario</b> (el que usa para entrar al juego). El tuyo es <b>${esc(myUser())}</b>.</p>
      <div class="fr-code"><input id="am-u" maxlength="20" placeholder="Usuario de tu amigo" autocomplete="off" autocapitalize="none" spellcheck="false"><button class="big slim" id="am-add">Agregar</button></div>
    </div>`;
  const inp = $('#am-u'); inp.value = keep; if (focus) inp.focus();
  const add = () => {
    const u = cleanUser(inp.value);
    if (!okUser(u)) return toast('El usuario tiene de 3 a 20 letras, números o _');
    if (u === myUser()) return toast('Ese sos vos 😄');
    if (!addFriendLocal(u)) return toast(`${u} ya está en tus amigos`);
    sendTo(u, { type: 'friend' }).catch(() => {});
    inp.value = ''; toast(`👥 ${u} agregado a tus amigos`); paintFriendsList();
  };
  $('#am-add').onclick = add;
  inp.onkeydown = e => { if (e.key === 'Enter') add(); };
  app.querySelectorAll('[data-inv]').forEach(b => b.onclick = () => inviteFriend(b.dataset.inv));
  app.querySelectorAll('[data-del]').forEach(b => b.onclick = () => askYes(`¿Sacar a ${b.dataset.del} de tus amigos?`, () => {
    save.amigos = friendsList().filter(x => x !== b.dataset.del); persist(); paintFriendsList();
  }, 'Sí, sacar'));
}
