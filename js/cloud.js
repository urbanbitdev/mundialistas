/* ================= Cuentas y guardado en internet (Supabase) =================
 * Cada persona entra con usuario y contraseña, y su equipo se guarda en la tabla
 * "partidas" (una fila por cuenta). Si js/config.js está vacío, el juego funciona
 * como antes: guarda sólo en el navegador. */
const CLOUD = { sb: null, user: null, name: '', timer: null, saving: false };
(function initCloud() {
  const c = window.MUNDIALISTAS_CONFIG || {};
  if (!c.supabaseUrl || !c.supabaseKey || !window.supabase || !window.supabase.createClient) return;
  try {
    CLOUD.sb = window.supabase.createClient(c.supabaseUrl, c.supabaseKey, {
      auth: { persistSession: true, autoRefreshToken: true },
      realtime: { params: { eventsPerSecond: 25 } },
    });
  } catch (e) { CLOUD.sb = null; }
})();
const cloudReady = () => !!CLOUD.sb;
const cloudOn = () => !!(CLOUD.sb && CLOUD.user);
// Supabase pide un mail: armamos uno a partir del usuario (no se manda ningún mail)
const userEmail = u => `${u}@jugadores.mundialistas.app`;
const cleanUser = u => String(u || '').trim().toLowerCase();

// Revisa que un equipo guardado tenga sentido (por si cambió la base de jugadores)
function validSave(s) {
  if (!s || typeof s !== 'object' || !Array.isArray(s.squad) || !s.squad.every(id => DB[id])) return null;
  s.xi = (Array.isArray(s.xi) ? s.xi : []).map(id => (id && DB[id] && s.squad.includes(id)) ? id : null);
  if (!FORMATIONS[s.formation]) s.formation = '4-4-2';
  s.ups = s.ups || {}; s.rec = s.rec || { w: 0, d: 0, l: 0, gf: 0, ga: 0 }; s.beaten = s.beaten || {};
  return s;
}

async function cloudStart() {
  app.innerHTML = `<div class="screen narrow"><div class="brand"><div class="ball">⚽</div><h1>MUNDIALISTAS</h1><p>Cargando…</p></div></div>`;
  try {
    const { data } = await CLOUD.sb.auth.getSession();
    if (data && data.session) return cloudEnter(data.session.user);
  } catch (e) { /* sin conexión: mostrar el ingreso */ }
  renderLogin();
}

function renderLogin(mode = 'in') {
  save = null;
  app.innerHTML = `<div class="screen narrow">
    <div class="brand"><div class="ball">⚽</div><h1>MUNDIALISTAS</h1><p>Leyendas de los Mundiales · 1958 – 2026</p></div>
    <div class="panel login">
      <div class="lg-tabs"><button class="${mode === 'in' ? 'on' : ''}" data-lm="in">Entrar</button><button class="${mode === 'up' ? 'on' : ''}" data-lm="up">Crear cuenta</button></div>
      <form id="lg-form" autocomplete="on">
        <label class="lbl" for="lg-u">Nombre de usuario</label>
        <input id="lg-u" name="username" autocomplete="username" maxlength="20" placeholder="Ej: juanma10" autocapitalize="none" spellcheck="false">
        <label class="lbl" for="lg-p">Contraseña</label>
        <input id="lg-p" name="password" type="password" autocomplete="${mode === 'up' ? 'new-password' : 'current-password'}" placeholder="Mínimo 6 letras o números">
        ${mode === 'up' ? '<p class="mut small">Usá letras, números o _ (de 3 a 20). <b>Anotá tu contraseña</b>: como no usamos mail, no se puede recuperar.</p>' : ''}
        <p class="lg-err" id="lg-err" role="alert"></p>
        <button class="big" id="lg-go" type="submit">${mode === 'up' ? '✨ Crear mi cuenta' : '▶ Entrar'}</button>
      </form>
      <p class="mut small center">Tu equipo se guarda en tu cuenta: podés seguir jugando desde cualquier compu o celular.</p>
    </div></div>`;
  app.querySelectorAll('[data-lm]').forEach(b => b.onclick = () => renderLogin(b.dataset.lm));
  $('#lg-form').onsubmit = async e => {
    e.preventDefault();
    const u = cleanUser($('#lg-u').value), pw = $('#lg-p').value, err = $('#lg-err'), btn = $('#lg-go');
    err.textContent = '';
    if (!/^[a-z0-9_]{3,20}$/.test(u)) { err.textContent = 'El usuario tiene que tener de 3 a 20 letras, números o _ (sin espacios ni tildes).'; return; }
    if (pw.length < 6) { err.textContent = 'La contraseña tiene que tener al menos 6 letras o números.'; return; }
    btn.disabled = true; btn.textContent = 'Un momento…';
    try {
      if (mode === 'up') {
        const { data, error } = await CLOUD.sb.auth.signUp({ email: userEmail(u), password: pw, options: { data: { usuario: u } } });
        if (error) throw error;
        if (!data.session) throw new Error('confirm');
        return cloudEnter(data.session.user);
      }
      const { data, error } = await CLOUD.sb.auth.signInWithPassword({ email: userEmail(u), password: pw });
      if (error) throw error;
      return cloudEnter(data.user);
    } catch (ex) {
      const m = String(ex && ex.message || ex);
      err.textContent = /already|registered|exists/i.test(m) ? 'Ese usuario ya existe. Elegí otro, o tocá "Entrar".'
        : /invalid login|credentials/i.test(m) ? 'Usuario o contraseña incorrectos.'
        : m === 'confirm' ? 'Falta un paso en Supabase: desactivar "Confirm email" (está en COMO_PUBLICAR.md).'
        : /fetch|network/i.test(m) ? 'No hay conexión a internet. Probá de nuevo.'
        : 'No se pudo entrar: ' + m;
      btn.disabled = false; btn.textContent = mode === 'up' ? '✨ Crear mi cuenta' : '▶ Entrar';
    }
  };
  $('#lg-u').focus();
}

async function cloudEnter(user) {
  CLOUD.user = user;
  CLOUD.name = (user.user_metadata && user.user_metadata.usuario) || String(user.email || '').split('@')[0];
  app.innerHTML = `<div class="screen narrow"><div class="brand"><div class="ball">⚽</div><h1>MUNDIALISTAS</h1><p>Cargando el equipo de ${esc(CLOUD.name)}…</p></div></div>`;
  let cache = null; try { cache = JSON.parse(localStorage.getItem(saveKey())); } catch (e) { }
  let remote, failed = false;
  try {
    const { data, error } = await CLOUD.sb.from('partidas').select('data, updated_at').eq('user_id', user.id).maybeSingle();
    if (error) throw error;
    remote = data;
  } catch (e) { failed = true; }
  if (failed) {
    save = validSave(cache);
    toast('No se pudo leer tu equipo de internet: uso el que está en esta compu.');
  } else if (remote && remote.data) {
    save = validSave(remote.data);
  } else {
    save = validSave(cache);
    // ¿Hay un equipo de antes, guardado en este navegador sin cuenta?
    let legacy = null; try { legacy = validSave(JSON.parse(localStorage.getItem(SAVE_KEY))); } catch (e) { }
    if (!save && legacy) {
      return askYes(`En esta compu hay un equipo guardado (${legacy.name}). ¿Lo pasamos a tu cuenta?`, () => {
        save = legacy; try { localStorage.removeItem(SAVE_KEY); } catch (e) { }
        persist(); renderMenu();
      }, 'Sí, usar ese equipo', 'No, empezar uno nuevo');
    }
    if (save) persist();
  }
  save ? renderMenu() : renderNewGame();
}

// Guardar en internet: espera un ratito para juntar cambios seguidos
function cloudQueue() {
  if (!cloudOn()) return;
  clearTimeout(CLOUD.timer);
  CLOUD.timer = setTimeout(cloudSaveNow, 800);
}
async function cloudSaveNow() {
  if (!cloudOn()) return;
  clearTimeout(CLOUD.timer); CLOUD.timer = null;
  const uid = CLOUD.user.id, data = save ? JSON.parse(JSON.stringify(save)) : null;
  try {
    const { error } = await CLOUD.sb.from('partidas').upsert({ user_id: uid, data, updated_at: new Date().toISOString() });
    if (error) throw error;
    CLOUD.failed = false;
  } catch (e) {
    if (!CLOUD.failed) toast('No se pudo guardar en internet. Queda guardado en esta compu y se reintenta.');
    CLOUD.failed = true;
    CLOUD.timer = setTimeout(cloudSaveNow, 15000);
  }
}
async function cloudLogout() {
  if (CLOUD.timer) await cloudSaveNow();
  try { await CLOUD.sb.auth.signOut(); } catch (e) { }
  CLOUD.user = null; CLOUD.name = ''; save = null;
  if (typeof leaveOnline === 'function') leaveOnline();
  try { await CLOUD.sb.removeAllChannels(); } catch (e) { }
  window.__supaRoom = null;
  renderLogin();
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && CLOUD.timer) cloudSaveNow(); });

// Barrita del menú: quién está jugando y botón para salir
function cloudBar() {
  if (!cloudOn()) return '';
  return `<div class="cloud-bar"><span>👤 <b>${esc(CLOUD.name)}</b> · ☁️ tu equipo se guarda en internet</span><button class="link" id="cloud-out">Salir</button></div>`;
}
function bindCloudBar() {
  const b = $('#cloud-out');
  if (b) b.onclick = () => askYes(`¿Salir de la cuenta ${CLOUD.name}? Tu equipo queda guardado.`, cloudLogout, 'Sí, salir');
}
