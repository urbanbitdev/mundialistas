'use strict';
/* ================= Utilidades ================= */
const SAVE_KEY = 'mundialistas_save_v1';
const app = document.getElementById('app');
const modalEl = document.getElementById('modal');
const rnd = Math.random;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = a => a[Math.floor(rnd() * a.length)];
const $ = s => document.querySelector(s);
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function lum(hex) { const n = parseInt(hex.slice(1), 16); const r = n >> 16, g = (n >> 8) & 255, b = n & 255; return (0.299 * r + 0.587 * g + 0.114 * b) / 255; }
function colDist(a, b) { const x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16); return Math.hypot((x >> 16) - (y >> 16), ((x >> 8) & 255) - ((y >> 8) & 255), (x & 255) - (y & 255)); }
function toast(msg) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.classList.add('out'), 1800); setTimeout(() => t.remove(), 2300); }
// Pregunta "¿Seguro?" dentro del juego (las ventanitas del navegador no andan en el link compartido)
function askYes(msg, onYes, yes = 'Sí', no = 'Cancelar') {
  const o = document.createElement('div'); o.className = 'ask';
  o.innerHTML = `<div class="ask-box panel"><p>${esc(msg)}</p><div class="ask-btns"><button class="chipbtn" data-a="no">${esc(no)}</button><button class="big slim" data-a="yes">${esc(yes)}</button></div></div>`;
  o.onclick = e => { const b = e.target.closest('[data-a]'); if (!b && e.target !== o) return; o.remove(); if (b && b.dataset.a === 'yes') onYes(); };
  document.body.appendChild(o); o.querySelector('[data-a=yes]').focus();
}
function fmt(s, o) { return s.replace(/\{(\w)\}/g, (_, k) => `<b>${esc(o[k] || '')}</b>`); }

/* ================= Posiciones y formaciones ================= */
const LINE = { POR: 0, LD: 1, DFC: 1, LI: 1, MCD: 2, MC: 2, MCO: 2, MD: 2, MI: 2, ED: 3, EI: 3, DC: 3 };
const LINE_NAME = ['Arquero', 'Defensa', 'Medio', 'Delantero'];
const PAIRS = {};
[['LD', 'LI', 3], ['DFC', 'LD', 5], ['DFC', 'LI', 5], ['MC', 'MCD', 3], ['MC', 'MCO', 3], ['MCD', 'MCO', 7],
 ['MD', 'MI', 2], ['MC', 'MD', 6], ['MC', 'MI', 6], ['ED', 'EI', 2], ['ED', 'MD', 3], ['EI', 'MI', 3],
 ['DC', 'ED', 5], ['DC', 'EI', 5], ['DC', 'MCO', 6], ['ED', 'MCO', 6], ['EI', 'MCO', 6], ['LD', 'MD', 7],
 ['LI', 'MI', 7], ['DFC', 'MCD', 7]].forEach(([a, b, v]) => { PAIRS[[a, b].sort().join('-')] = v; });
function penalty(pos, slot) {
  if (pos === slot) return 0;
  if (pos === 'POR' || slot === 'POR') return 40;
  const k = [pos, slot].sort().join('-');
  if (PAIRS[k] != null) return PAIRS[k];
  const d = Math.abs(LINE[pos] - LINE[slot]);
  return d === 0 ? 6 : d === 1 ? 14 : 24;
}
// [posición, x (0 = arco propio, 100 = arco rival), y (0 = izquierda, 100 = derecha)]
const FORMATIONS = {
  '4-4-2': [['POR', 6, 50], ['LD', 26, 84], ['DFC', 22, 62], ['DFC', 22, 38], ['LI', 26, 16], ['MD', 52, 84], ['MC', 48, 60], ['MC', 48, 40], ['MI', 52, 16], ['DC', 78, 60], ['DC', 78, 40]],
  '4-3-3': [['POR', 6, 50], ['LD', 26, 84], ['DFC', 22, 62], ['DFC', 22, 38], ['LI', 26, 16], ['MC', 50, 70], ['MCD', 42, 50], ['MC', 50, 30], ['ED', 76, 82], ['DC', 82, 50], ['EI', 76, 18]],
  '4-2-3-1': [['POR', 6, 50], ['LD', 26, 84], ['DFC', 22, 62], ['DFC', 22, 38], ['LI', 26, 16], ['MCD', 42, 62], ['MCD', 42, 38], ['MD', 64, 82], ['MCO', 64, 50], ['MI', 64, 18], ['DC', 84, 50]],
  '4-2-4': [['POR', 6, 50], ['LD', 26, 84], ['DFC', 22, 62], ['DFC', 22, 38], ['LI', 26, 16], ['MC', 46, 62], ['MC', 46, 38], ['ED', 76, 86], ['DC', 80, 62], ['DC', 80, 38], ['EI', 76, 14]],
  '3-5-2': [['POR', 6, 50], ['DFC', 22, 74], ['DFC', 20, 50], ['DFC', 22, 26], ['MD', 52, 88], ['MC', 46, 64], ['MCO', 60, 50], ['MC', 46, 36], ['MI', 52, 12], ['DC', 80, 60], ['DC', 80, 40]],
  '5-3-2': [['POR', 6, 50], ['LD', 32, 88], ['DFC', 22, 70], ['DFC', 20, 50], ['DFC', 22, 30], ['LI', 32, 12], ['MC', 50, 70], ['MCD', 44, 50], ['MC', 50, 30], ['DC', 78, 60], ['DC', 78, 40]],
};

/* ================= Base de datos ================= */
const DB = {}, RIVALS = [];
for (const t of TEAMS_RAW) {
  const ids = [];
  for (const s of t.p) {
    const [n, pos, o, y] = s.split('|');
    if (!DB[n]) {
      if (!pos) { console.warn('Jugador sin datos:', n); continue; }
      DB[n] = { id: n, n, c: t.c, y: y ? +y : t.y, p: pos, o: +o };
    }
    ids.push(n);
  }
  RIVALS.push({ key: t.c + '-' + t.y, c: t.c, y: t.y, f: t.f, ids, name: COUNTRIES[t.c].n + ' ' + t.y });
}

const FIELD_LABELS = ['RIT', 'TIR', 'PAS', 'REG', 'DEF', 'FÍS'];
const GK_LABELS = ['EST', 'MAN', 'SAQ', 'REF', 'VEL', 'COL'];
const PROFILE = {
  DC: [2, 6, -7, 1, -38, 1], ED: [8, -1, -2, 5, -38, -8], EI: [8, -1, -2, 5, -38, -8], MCO: [-2, 1, 4, 5, -28, -10],
  MC: [-6, -6, 5, 1, -8, -2], MD: [5, -6, 2, 2, -16, -5], MI: [5, -6, 2, 2, -16, -5], MCD: [-10, -15, 0, -7, 4, 4],
  DFC: [-10, -32, -12, -18, 5, 4], LD: [4, -22, -4, -6, 1, -4], LI: [4, -22, -4, -6, 1, -4], POR: [2, 0, -9, 3, -28, 1],
};
function stats(id, o) { const p = DB[id]; o = o == null ? ovr(id) : o; return PROFILE[p.p].map((d, i) => clamp(Math.round(o + d + (hash(p.n + i) % 9) - 4), 20, 99)); }

/* ================= Guardado ================= */
let save = null;
function load() {
  try { save = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { save = null; }
  if (save && (!Array.isArray(save.squad) || !save.squad.every(id => DB[id]))) save = null;
  if (save) save.xi = save.xi.map(id => (id && DB[id] && save.squad.includes(id)) ? id : null);
}
// Cada cuenta guarda su copia en el navegador con su propia clave (dos hermanos en la misma compu no se mezclan)
const saveKey = () => (typeof cloudOn === 'function' && cloudOn()) ? SAVE_KEY + ':' + CLOUD.user.id : SAVE_KEY;
function persist() {
  try { localStorage.setItem(saveKey(), JSON.stringify(save)); } catch (e) { /* sin almacenamiento */ }
  if (typeof cloudQueue === 'function') cloudQueue();
}
function ovr(id) { return Math.min(99, DB[id].o + ((save && save.ups[id]) || 0)); }
const baseOvr = id => DB[id].o;
const tier = o => o >= 93 ? 'icon' : o >= 85 ? 'elite' : o >= 75 ? 'gold' : o >= 65 ? 'silver' : 'bronze';
// Nombre corto único para cada jugador (evita dos "Santos", dos "Saint-Vil", etc.)
const SHORT = (() => {
  const clean = n => n.replace(/"[^"]*"\s*/g, '');
  const cand = n => { const c = clean(n); return c.length <= 12 ? c : c.split(' ').slice(-1)[0]; };
  const count = {};
  Object.keys(DB).forEach(n => { const k = cand(n); count[k] = (count[k] || 0) + 1; });
  const out = {};
  Object.keys(DB).forEach(n => {
    let s = cand(n);
    if (count[s] > 1) { const parts = clean(n).split(' '); s = parts.length > 1 ? parts[0][0] + '. ' + parts.slice(-1)[0] : clean(n); }
    out[n] = s;
  });
  const seen = {};
  Object.keys(out).forEach(n => { const s = out[n]; if (seen[s]) { out[n] = clean(n); out[seen[s]] = clean(seen[s]); } else seen[s] = n; });
  return out;
})();
const short = n => SHORT[n] || n;
// Estilo de juego de cada jugador (le da personalidad en los partidos)
const TRAITS = { gol: ['🎯', 'Goleador'], gam: ['🎩', 'Gambeteador'], cer: ['🧠', 'Cerebro'], vel: ['⚡', 'Veloz'], mur: ['🧱', 'Muralla'], lid: ['💪', 'Incansable'], gk: ['🧤', 'Manos seguras'] };
// algunos ídolos con su estilo de siempre
const TRAIT_FIX = { 'Diego Maradona': 'gam', 'Garrincha': 'gam', 'Ronaldinho': 'gam', 'Neymar': 'gam', 'Lionel Messi': 'gam', 'Jay-Jay Okocha': 'gam',
  'Zinedine Zidane': 'cer', 'Johan Cruyff': 'cer', 'Andrés Iniesta': 'cer', 'Andrea Pirlo': 'cer', 'Luka Modrić': 'cer',
  'Franz Beckenbauer': 'mur', 'Paolo Maldini': 'mur', 'Franco Baresi': 'mur', 'Lev Yashin': 'gk', 'Petr Čech': 'gk', 'Ronaldo': 'gol', 'Erling Haaland': 'gol' };
function traitOf(id, o) {
  const p = DB[id]; if (!p) return null;
  if (TRAIT_FIX[id]) return TRAIT_FIX[id];
  const s = stats(id, o == null ? ovr(id) : o);
  if (p.p === 'POR') return s[3] >= 82 ? 'gk' : null;
  const opts = [['vel', s[0] - 86], ['gol', s[1] - 84], ['cer', s[2] - 84], ['gam', s[3] - 85], ['mur', s[4] - 82], ['lid', s[5] - 86]].sort((a, b) => b[1] - a[1]);
  return opts[0][1] >= 0 ? opts[0][0] : null;
}
function traitChip(id, o) { const t = traitOf(id, o); return t ? `<div class="pc-trait">${TRAITS[t][0]} ${TRAITS[t][1]}</div>` : ''; }
// Buscar sin importar tildes ni letras raras (Čech = Cech, Ødegaard = Odegaard)
const nrm = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[øØ]/g, 'o').replace(/[łŁ]/g, 'l').replace(/ß/g, 'ss').replace(/[đĐ]/g, 'd').replace(/ı/g, 'i').toLowerCase();
function chip(c) { const C = COUNTRIES[c]; return `<span class="chip" style="background:${C.c1};color:${lum(C.c1) > 0.6 ? '#111' : '#fff'};border-color:${C.c2}">${C.k}</span>`; }
function crest(name, color, size = '') {
  const ini = name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return `<div class="crest ${size}" style="--cc:${color};color:${lum(color) > 0.6 ? '#111' : '#fff'}">${esc(ini || 'FC')}</div>`;
}

function autoLineup(ids, f, of) {
  const slots = FORMATIONS[f], pairs = [];
  slots.forEach(([s], i) => ids.forEach(id => {
    const natGK = s === 'POR' && DB[id].p === 'POR' ? 100 : 0;
    pairs.push([of(id) - penalty(DB[id].p, s) * 1.6 + natGK, i, id]);
  }));
  pairs.sort((a, b) => b[0] - a[0]);
  const xi = Array(slots.length).fill(null), used = new Set();
  for (const [, i, id] of pairs) { if (xi[i] || used.has(id)) continue; xi[i] = id; used.add(id); }
  return xi;
}
function xiAvg(xi, f, of) {
  const sl = FORMATIONS[f]; let s = 0;
  xi.forEach((id, i) => { if (id) s += of(id) - penalty(DB[id].p, sl[i][0]); });
  return s / 11;
}
function rivalInfo(r) { if (!r._xi) { r._xi = autoLineup(r.ids, r.f, baseOvr); r._avg = xiAvg(r._xi, r.f, baseOvr); } return r; }
const myAvg = () => xiAvg(save.xi, save.formation, ovr);
function rewardPts(rAvg) { const d = rAvg - myAvg(); return d >= 6 ? 3 : d >= -3 ? 2 : 1; }
function difficulty(rAvg) { const d = rAvg - myAvg(); return d < -3 ? ['Fácil', 'easy'] : d < 3 ? ['Pareja', 'even'] : d < 9 ? ['Difícil', 'hard'] : ['Leyenda', 'legend']; }

/* ================= Navegación ================= */
const TEAM_COLORS = ['#e63946', '#1d4ed8', '#16a34a', '#f59e0b', '#7c3aed', '#0f172a', '#f8fafc', '#ec4899'];
let EDC = null;   // contexto del editor de alineación
let M = null;     // partido en curso
let POST = null;  // estado post-partido

function stopMatchLoops() { if (M) { clearTimeout(M.to); cancelAnimationFrame(M.raf); M.cv = null; } if (typeof sndStop === 'function') sndStop(); }
function go(where, arg) {
  closeModal();
  if (where !== 'post') stopMatchLoops();
  window.scrollTo(0, 0);
  ({
    menu: renderMenu, squad: renderSquad, rivals: renderRivals, pre: () => renderPre(arg),
    play: () => startArcade(arg, true), arcade: () => startArcade(arg), newgame: renderNewGame, post: renderPost,
    reset: () => askYes('¿Borrar tu equipo y empezar de cero?', () => { try { localStorage.removeItem(saveKey()); } catch (e) { } save = null; if (typeof cloudOn === 'function' && cloudOn()) cloudSaveNow(); renderNewGame(); }, 'Sí, borrar'),
  }[where] || renderMenu)();
}
app.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) go(b.dataset.go, b.dataset.arg); });

/* ================= Nueva partida ================= */
function renderNewGame() {
  let color = TEAM_COLORS[0];
  app.innerHTML = `<div class="screen narrow">
    <div class="brand"><div class="ball">⚽</div><h1>MUNDIALISTAS</h1><p>Leyendas de los Mundiales · 1958 – 2026</p></div>
    <div class="panel">
      <h3>Creá tu equipo</h3>
      <label class="lbl">Nombre del club</label>
      <input id="ng-name" maxlength="22" placeholder="Ej: Los Cracks FC" autocomplete="off">
      <label class="lbl">Color</label>
      <div class="swatches">${TEAM_COLORS.map((c, i) => `<button class="sw ${i ? '' : 'on'}" data-c="${c}" style="background:${c}"></button>`).join('')}</div>
      <p class="mut">En el próximo paso elegís los jugadores que quieras para tu plantel, de cualquier Mundial entre 1958 y 2026. Ganá partidos para subirles la media y fichar figuras de las selecciones que venzas.</p>
      <button class="big" id="ng-go">Elegir jugadores →</button>
    </div></div>`;
  app.querySelectorAll('.sw').forEach(b => b.onclick = () => { app.querySelectorAll('.sw').forEach(x => x.classList.remove('on')); b.classList.add('on'); color = b.dataset.c; });
  $('#ng-go').onclick = () => renderDraft($('#ng-name').value.trim() || 'Mi Equipo', color);
}

/* ================= Elegir jugadores (plantel inicial o agregar más) ================= */
const DRAFT_NEED = [2, 6, 6, 4]; // mínimo de arqueros, defensores, mediocampistas y delanteros
const SQUAD_MAX = 26;
const OVR_FILTERS = [['Todas', 0, 99], ['90+', 90, 99], ['85–89', 85, 89], ['75–84', 75, 84], ['65–74', 65, 74], ['59–64', 59, 64]];
// mode 'new': armar el plantel al crear el equipo. mode 'add': sumar jugadores desde la Plantilla.
function renderDraft(name, color, mode = 'new') {
  const adding = mode === 'add';
  const owned = adding ? save.squad : [];
  const room = adding ? SQUAD_MAX - owned.length : SQUAD_MAX;
  const pool = Object.values(DB).filter(p => !owned.includes(p.id))
    .sort((a, b) => b.o - a.o || LINE[a.p] - LINE[b.p] || a.n.localeCompare(b.n));
  const D = { picked: [], filter: -1, q: '', of: 0 };
  const count = l => D.picked.filter(id => LINE[DB[id].p] === l).length;
  const ready = () => adding ? D.picked.length > 0 : DRAFT_NEED.every((n, l) => count(l) >= n);

  app.innerHTML = `<div class="screen">
    <header class="bar"><button class="back" id="dr-back">← Volver</button><h2>${adding ? 'Agregar jugadores' : 'Elegí tu plantel'}</h2><span class="mut">${esc(name)}</span></header>
    <p class="mut center">${adding
      ? `Elegí los jugadores que quieras sumar. Te quedan <b>${room}</b> lugares (máximo ${SQUAD_MAX}).`
      : `Elegí a quien quieras, de cualquier Mundial entre 1958 y 2026. Mínimo ${DRAFT_NEED[0]} arqueros, ${DRAFT_NEED[1]} defensores, ${DRAFT_NEED[2]} mediocampistas y ${DRAFT_NEED[3]} delanteros. Podés llevar hasta ${SQUAD_MAX}.`}</p>
    <div class="panel draft-head">
      <div class="need" id="dr-need"></div>
      <div class="dr-actions">
        ${adding ? '' : '<button class="chipbtn" id="dr-rand">🎲 Completar al azar</button>'}
        <button class="chipbtn" id="dr-clear">Vaciar</button>
        <button class="big slim" id="dr-ok">${adding ? 'Agregar al plantel' : 'Confirmar plantel'}</button>
      </div>
    </div>
    <div class="dr-filters">
      ${['Todos', ...LINE_NAME].map((t, i) => `<button class="chipbtn ${i ? '' : 'on'}" data-f="${i - 1}">${t}</button>`).join('')}
      <input id="dr-q" placeholder="Buscar por nombre, país o año…">
    </div>
    <div class="dr-filters"><span class="mut">Media:</span>
      ${OVR_FILTERS.map(([t], i) => `<button class="chipbtn ${i ? '' : 'on'}" data-of="${i}">${t}</button>`).join('')}
    </div>
    <div class="draft-grid" id="dr-list"></div></div>`;

  function paint() {
    $('#dr-need').innerHTML = (adding ? '' : DRAFT_NEED.map((n, l) => `<span class="${count(l) >= n ? 'done' : ''}"><i class="bpos l${l}">${['POR', 'DEF', 'MED', 'DEL'][l]}</i><b>${count(l)}/${n}</b></span>`).join('')) +
      `<span class="tot">Elegidos <b>${D.picked.length}/${room}</b></span>`;
    $('#dr-ok').disabled = !ready();
    const q = nrm(D.q.trim()), [, lo, hi] = OVR_FILTERS[D.of];
    const list = pool.filter(p => (D.filter < 0 || LINE[p.p] === D.filter) && p.o >= lo && p.o <= hi &&
      (!q || nrm(p.n).includes(q) || nrm(COUNTRIES[p.c].n).includes(q) || String(p.y) === q));
    const MAXL = 300;
    $('#dr-list').innerHTML = (list.length > MAXL ? `<p class="mut dr-more">Mostrando ${MAXL} de ${list.length} jugadores. Buscá por nombre, país o año para encontrar más.</p>` : '') + list.slice(0, MAXL).map(p => {
      const on = D.picked.includes(p.id), full = !on && D.picked.length >= room;
      const s = stats(p.id, p.o), L = p.p === 'POR' ? GK_LABELS : FIELD_LABELS;
      return `<button class="dpick ${on ? 'on' : ''} ${full ? 'full' : ''}" data-id="${esc(p.id)}">
        <span class="bovr ${tier(p.o)}">${p.o}</span>
        <span class="bname">${esc(p.n)}<small>${chip(p.c)} ${COUNTRIES[p.c].n} · Mundial ${p.y}</small>
          <small class="dstats">${L.map((l, i) => `${l} ${s[i]}`).join(' · ')}${(t => t ? ` · ${TRAITS[t][0]} ${TRAITS[t][1]}` : '')(traitOf(p.id, p.o))}</small></span>
        <span class="bpos l${LINE[p.p]}">${p.p}</span>
        <span class="check">${on ? '✓' : '+'}</span></button>`;
    }).join('') || '<p class="mut">No hay jugadores con ese filtro.</p>';
  }
  $('#dr-list').onclick = e => {
    const b = e.target.closest('[data-id]'); if (!b) return;
    const id = b.dataset.id;
    if (D.picked.includes(id)) D.picked = D.picked.filter(x => x !== id);
    else if (D.picked.length >= room) return toast(`Llegaste al máximo de ${SQUAD_MAX} jugadores. Sacá uno para cambiarlo.`);
    else D.picked.push(id);
    paint();
  };
  app.querySelectorAll('[data-f]').forEach(b => b.onclick = () => {
    D.filter = +b.dataset.f; app.querySelectorAll('[data-f]').forEach(x => x.classList.toggle('on', x === b)); paint();
  });
  app.querySelectorAll('[data-of]').forEach(b => b.onclick = () => {
    D.of = +b.dataset.of; app.querySelectorAll('[data-of]').forEach(x => x.classList.toggle('on', x === b)); paint();
  });
  $('#dr-q').oninput = e => { D.q = e.target.value; paint(); };
  if (!adding) $('#dr-rand').onclick = () => {
    DRAFT_NEED.forEach((n, l) => {
      const opts = shuffle(pool.filter(p => LINE[p.p] === l && !D.picked.includes(p.id)));
      while (count(l) < n && opts.length && D.picked.length < room) D.picked.push(opts.pop().id);
    });
    paint();
  };
  $('#dr-clear').onclick = () => { D.picked = []; paint(); };
  $('#dr-back').onclick = () => adding ? go('squad') : renderNewGame();
  $('#dr-ok').onclick = () => {
    if (!ready()) return;
    if (adding) {
      save.squad.push(...D.picked); persist(); go('squad');
      toast(D.picked.length === 1 ? `¡${D.picked[0]} se suma al equipo!` : `¡${D.picked.length} jugadores nuevos en el plantel!`);
      return;
    }
    const squad = D.picked.slice();
    save = { v: 1, name, color, squad, ups: {}, formation: '4-4-2', xi: [], rec: { w: 0, d: 0, l: 0, gf: 0, ga: 0 }, beaten: {} };
    save.xi = autoLineup(squad, '4-4-2', ovr);
    persist();
    renderFormationPick(true);
  };
  paint();
}

/* ================= Elegir formación (al crear el equipo o desde la Plantilla) ================= */
const PICK_FORMS = [
  ['4-4-2', 'La clásica', 'Dos delanteros y un medio de cuatro. Pareja en todo.'],
  ['4-3-3', 'Ataque por afuera', 'Un 9 y dos extremos rápidos por las bandas.'],
  ['4-2-3-1', 'Con enganche', 'Un 10 detrás del 9 y dos volantes que cuidan.'],
  ['3-5-2', 'Medio lleno', 'Tres defensores y cinco en el medio para tener la pelota.'],
  ['5-3-2', 'Bien cerrado', 'Cinco atrás: difícil que te hagan goles.'],
];
function renderFormationPick(first = false) {
  let f = PICK_FORMS.some(x => x[0] === save.formation) ? save.formation : '4-4-2';
  window.scrollTo(0, 0);
  app.innerHTML = `<div class="screen">
    <header class="bar">${first ? '<span></span>' : '<button class="back" data-go="squad">← Plantilla</button>'}<h2>Elegí tu formación</h2><span class="mut">${esc(save.name)}</span></header>
    <p class="mut center">Tocá una formación y mirá cómo se paran tus jugadores en la cancha. Después la podés cambiar cuando quieras en la Plantilla.</p>
    <div class="fp-list">${PICK_FORMS.map(([k, t, d]) => `<button class="fp-card" data-fp="${k}"><b>${k}</b><span>${t}</span><small>${d}</small></button>`).join('')}</div>
    <div class="fp-main">
      <div class="pitch-v fp-pitch" id="fp-pitch"></div>
      <div class="fp-side panel">
        <div class="fp-avg">Media del 11<b id="fp-avg"></b></div>
        <p class="mut" id="fp-desc"></p>
        <button class="big" id="fp-ok">✅ Usar esta formación</button>
      </div>
    </div></div>`;
  let xi = [];
  const paint = () => {
    xi = autoLineup(save.squad, f, ovr);
    app.querySelectorAll('[data-fp]').forEach(b => b.classList.toggle('on', b.dataset.fp === f));
    $('#fp-pitch').innerHTML = '<div class="pv-mark"></div>' + FORMATIONS[f].map(([pos, x, y], i) => {
      const id = xi[i], st = `left:${y}%;top:${(100 - x) * 0.86 + 6}%`;
      if (!id) return `<div class="slot empty" style="${st}"><div class="mini"><span class="mo">–</span><span class="mp">${pos}</span></div><div class="mn">Vacío</div></div>`;
      const pen = penalty(DB[id].p, pos), o = ovr(id) - pen;
      return `<div class="slot ${pen >= 10 ? 'bad' : pen > 0 ? 'meh' : ''}" style="${st}"><div class="mini ${tier(o)}"><span class="mo">${o}</span><span class="mp">${pos}</span></div><div class="mn">${esc(short(DB[id].n))}</div></div>`;
    }).join('');
    $('#fp-avg').textContent = Math.round(xiAvg(xi, f, ovr));
    const info = PICK_FORMS.find(x => x[0] === f);
    $('#fp-desc').innerHTML = `<b>${info[1]}.</b> ${info[2]}`;
  };
  app.querySelectorAll('[data-fp]').forEach(b => b.onclick = () => { f = b.dataset.fp; paint(); });
  $('#fp-ok').onclick = () => {
    save.formation = f; save.xi = xi; persist();
    go('squad');
    toast(first ? `¡Equipo listo con ${f}! Acá podés acomodar tu once.` : `Formación ${f} elegida`);
  };
  paint();
}

/* ================= Menú ================= */
function renderMenu() {
  if (!save) return renderNewGame();
  const r = save.rec, top = save.squad.slice().sort((a, b) => ovr(b) - ovr(a)).slice(0, 3);
  const beaten = Object.keys(save.beaten).length;
  app.innerHTML = `<div class="screen narrow">
    <div class="brand small"><div class="ball">⚽</div><h1>MUNDIALISTAS</h1><p>Leyendas de los Mundiales · 1958 – 2026</p></div>
    <div class="panel club">
      ${crest(save.name, save.color, 'lg')}
      <div class="club-info"><h2>${esc(save.name)}</h2>
        <div class="kpis"><span><b>${Math.round(myAvg())}</b>Media del 11</span><span><b>${r.w}-${r.d}-${r.l}</b>G-E-P</span><span><b>${beaten}/${RIVALS.length}</b>Selecciones vencidas</span></div>
      </div>
    </div>
    <div class="menu-btns">
      <button class="big" id="quick-play">🎮 ¡Jugar yo! (partido rápido)</button>
      <button class="big alt" id="friends-btn">👥 Jugar con amigos</button>
      <button class="big alt" data-go="rivals">⚽ Elegir rival</button>
      <label class="arc-len center-sel">Dificultad <select id="menu-diff">${Object.entries(DIFFS).map(([k, d]) => `<option value="${k}" ${k === (save.arcDiff || 'facil') ? 'selected' : ''}>${d.name}</option>`).join('')}</select></label>
      <button class="big alt" data-go="squad">📋 Plantilla</button>
    </div>
    <h4 class="sec">Tus figuras</h4>
    <div class="top3">${top.map(id => cardHTML(id)).join('')}</div>
    <button class="link danger" data-go="reset">Empezar de nuevo</button>
    ${typeof cloudBar === 'function' ? cloudBar() : ''}
  </div>`;
  if (typeof bindCloudBar === 'function') bindCloudBar();
  $('#menu-diff').onchange = e => { save.arcDiff = e.target.value; persist(); };
  $('#friends-btn').onclick = () => renderFriends();
  // Partido rápido: rival de nivel parecido al tuyo, y lo jugás vos
  $('#quick-play').onclick = () => {
    const my = myAvg(), near = RIVALS.map(rivalInfo).filter(r => Math.abs(r._avg - my) <= 6);
    go('arcade', pick(near.length ? near : RIVALS).key);
  };
}

function cardHTML(id, o = ovr(id), extra = '') {
  const p = DB[id], s = stats(id, o), L = p.p === 'POR' ? GK_LABELS : FIELD_LABELS;
  return `<div class="pcard ${tier(o)}">
    <div class="pc-top"><div class="pc-ovr">${o}<small>${p.p}</small></div><div class="pc-flag">${chip(p.c)}<small>Mundial ${p.y}</small></div></div>
    <div class="pc-name">${esc(p.n)}</div>
    ${traitChip(id, o)}
    <div class="pc-stats">${L.map((l, i) => `<div class="st"><b>${s[i]}</b><span>${l}</span></div>`).join('')}</div>
    ${extra}</div>`;
}

/* ================= Plantilla ================= */
function renderSquad() {
  app.innerHTML = `<div class="screen"><header class="bar"><button class="back" data-go="menu">← Menú</button><h2>Plantilla</h2><span class="mut">${save.squad.length}/${SQUAD_MAX} jugadores</span></header>
    <div class="squad-actions"><button class="big slim alt" id="sq-form">🧩 Elegir formación</button><button class="big slim" id="sq-add" ${save.squad.length >= SQUAD_MAX ? 'disabled' : ''}>➕ Agregar jugadores</button>${save.squad.length >= SQUAD_MAX ? '<span class="mut">Plantel lleno: liberá a alguien para sumar otro.</span>' : ''}</div><div id="ed"></div></div>`;
  EDC = { mode: 'save', sel: null, el: $('#ed') };
  renderEditor();
  $('#sq-add').onclick = () => renderDraft(save.name, save.color, 'add');
  $('#sq-form').onclick = () => renderFormationPick(false);
}

/* ================= Editor de alineación (antes y durante el partido) ================= */
const edXI = () => EDC.mode === 'match' ? M.home.xi : save.xi;
const edF = () => EDC.mode === 'match' ? M.home.f : save.formation;
function edBench() {
  const xi = edXI();
  return save.squad.filter(id => !xi.includes(id)).sort((a, b) => LINE[DB[a].p] - LINE[DB[b].p] || ovr(b) - ovr(a));
}
function renderEditor() {
  const match = EDC.mode === 'match', xi = edXI(), f = edF(), sl = FORMATIONS[f];
  const isSel = (t, v) => EDC.sel && EDC.sel.t === t && (t === 'xi' ? EDC.sel.i === v : EDC.sel.id === v);
  const slots = sl.map(([pos, x, y], i) => {
    const id = xi[i], st = `left:${y}%;top:${(100 - x) * 0.86 + 6}%`;
    if (!id) return `<button class="slot empty ${isSel('xi', i) ? 'sel' : ''}" data-xi="${i}" style="${st}"><div class="mini"><span class="mo">–</span><span class="mp">${pos}</span></div><div class="mn">Vacío</div></button>`;
    const p = DB[id], pen = penalty(p.p, pos), o = ovr(id);
    const stam = match ? Math.round(M.home.st[id] ?? 100) : null;
    return `<button class="slot ${isSel('xi', i) ? 'sel' : ''} ${pen >= 10 ? 'bad' : pen > 0 ? 'meh' : ''}" data-xi="${i}" style="${st}">
      <div class="mini ${tier(o)}"><span class="mo">${o - pen}</span><span class="mp">${pos}</span></div>
      <div class="mn">${esc(short(p.n))}</div>
      ${stam != null ? `<div class="stam"><i style="width:${stam}%;background:${stam > 60 ? '#22c55e' : stam > 35 ? '#facc15' : '#ef4444'}"></i></div>` : ''}
    </button>`;
  }).join('');
  const bench = edBench().map(id => {
    const p = DB[id], o = ovr(id), out = match && M.home.out.has(id);
    return `<button class="brow ${isSel('b', id) ? 'sel' : ''} ${out ? 'out' : ''}" data-bench="${esc(id)}">
      <span class="bpos l${LINE[p.p]}">${p.p}</span>
      <span class="bname">${esc(p.n)}<small>${COUNTRIES[p.c].n} · Mundial ${p.y}${out ? ' · reemplazado' : ''}</small></span>
      <span class="bovr ${tier(o)}">${o}</span></button>`;
  }).join('');
  let selId = null;
  if (EDC.sel) selId = EDC.sel.t === 'xi' ? xi[EDC.sel.i] : EDC.sel.id;
  const detail = selId ? cardHTML(selId, ovr(selId), !match ? `<button class="link danger" data-act="release">Liberar del plantel</button>` : '')
    : `<div class="hint">👆 Tocá un jugador para ver sus estadísticas.<br>Tocá otro para <b>intercambiarlos</b> (titular ↔ titular, o titular ↔ suplente).<br><span class="mut">El número del 11 ya descuenta si juega fuera de su posición.</span></div>`;
  EDC.el.innerHTML = `<div class="editor">
    <div class="ed-top">
      <label>Formación <select data-form>${Object.keys(FORMATIONS).map(k => `<option ${k === f ? 'selected' : ''}>${k}</option>`).join('')}</select></label>
      <button class="chipbtn" data-act="auto">✨ Auto${match ? ' (reacomodar)' : ''}</button>
      <span class="avg">Media del 11: <b>${Math.round(xiAvg(xi, f, ovr))}</b></span>
      ${match ? `<span class="subs">Cambios restantes: <b>${M.home.subs}</b></span>` : ''}
    </div>
    <div class="ed-grid">
      <div class="pitch-v"><div class="pv-mark"></div>${slots}</div>
      <div class="ed-side">
        <div class="detail">${detail}</div>
        <h4 class="sec">Suplentes (${edBench().length})</h4>
        <div class="bench">${bench || '<p class="mut">No hay suplentes.</p>'}</div>
      </div>
    </div></div>`;
  EDC.el.querySelector('[data-form]').onchange = e => {
    if (match) M.home.f = e.target.value; else { save.formation = e.target.value; persist(); }
    if (match) matchLog(`📐 ${esc(save.name)} cambia a ${e.target.value}.`, 'sub');
    EDC.sel = null; renderEditor(); EDC.onChange && EDC.onChange();
  };
  EDC.el.onclick = edClick;
}
function edClick(e) {
  const a = e.target.closest('[data-xi],[data-bench],[data-act]');
  if (!a) return;
  const match = EDC.mode === 'match';
  if (a.dataset.act === 'auto') {
    if (match) M.home.xi = autoLineup(M.home.xi.filter(Boolean), M.home.f, ovr);
    else { save.xi = autoLineup(save.squad, save.formation, ovr); persist(); }
    EDC.sel = null; renderEditor(); EDC.onChange && EDC.onChange(); return;
  }
  if (a.dataset.act === 'release') {
    const id = EDC.sel.t === 'xi' ? save.xi[EDC.sel.i] : EDC.sel.id;
    if (save.squad.length <= 14) return toast('Necesitás al menos 14 jugadores en el plantel');
    return askYes(`¿Liberar a ${id}? Se pierde su progreso.`, () => {
      save.squad = save.squad.filter(x => x !== id); save.xi = save.xi.map(x => x === id ? null : x); delete save.ups[id];
      persist(); EDC.sel = null; renderEditor(); EDC.onChange && EDC.onChange();
    }, 'Sí, liberar');
  }
  const cur = a.dataset.xi != null ? { t: 'xi', i: +a.dataset.xi } : { t: 'b', id: a.dataset.bench };
  const s = EDC.sel;
  if (!s) { EDC.sel = cur; return renderEditor(); }
  EDC.sel = null;
  if (s.t === cur.t && (s.t === 'xi' ? s.i === cur.i : s.id === cur.id)) return renderEditor();
  if (s.t === 'b' && cur.t === 'b') { EDC.sel = cur; return renderEditor(); }
  const xi = edXI();
  if (s.t === 'xi' && cur.t === 'xi') { [xi[s.i], xi[cur.i]] = [xi[cur.i], xi[s.i]]; }
  else {
    const slot = s.t === 'xi' ? s.i : cur.i, inId = s.t === 'b' ? s.id : cur.id, outId = xi[slot];
    if (match) {
      if (M.home.out.has(inId)) { toast('Ese jugador ya fue reemplazado'); return renderEditor(); }
      if (M.home.subs <= 0) { toast('No te quedan cambios'); return renderEditor(); }
      M.home.subs--; M.home.out.add(outId); M.home.st[inId] = 100;
      matchLog(`🔁 Cambio en ${esc(save.name)}: entra <b>${esc(inId)}</b>, sale ${esc(outId)}.`, 'sub');
    }
    xi[slot] = inId;
  }
  if (!match) persist();
  renderEditor(); EDC.onChange && EDC.onChange();
}

/* ================= Elegir rival ================= */
// Filtro de la lista de rivales (se recuerda mientras jugás)
const RIV_F = { y: 0, q: '' };
function renderRivals() {
  const years = [...new Set(RIVALS.map(r => r.y))].sort((a, b) => a - b);
  app.innerHTML = `<div class="screen"><header class="bar"><button class="back" data-go="menu">← Menú</button><h2>Elegí rival</h2><span class="mut">Tu media: <b>${Math.round(myAvg())}</b></span></header>
    <p class="mut center">Cuanto más fuerte el rival, más puntos de mejora ganás si lo vencés.</p>
    <div class="dr-filters"><span class="mut">Mundial:</span>
      ${[0, ...years].map(y => `<button class="chipbtn ${RIV_F.y === y ? 'on' : ''}" data-ry="${y}">${y || 'Todos'}</button>`).join('')}</div>
    <div class="dr-filters"><input id="rv-q" placeholder="Buscar país…" value="${esc(RIV_F.q)}" autocomplete="off"></div>
    <div class="rivals" id="rv-list"></div></div>`;
  const paint = () => {
    const q = nrm(RIV_F.q.trim());
    const list = RIVALS.map(rivalInfo).filter(r => (!RIV_F.y || r.y === RIV_F.y) && (!q || nrm(COUNTRIES[r.c].n).includes(q)))
      .sort((a, b) => a._avg - b._avg);
    $('#rv-list').innerHTML = rivalCards(list) || '<p class="mut">No hay selecciones con ese filtro.</p>';
  };
  app.querySelectorAll('[data-ry]').forEach(b => b.onclick = () => {
    RIV_F.y = +b.dataset.ry; app.querySelectorAll('[data-ry]').forEach(x => x.classList.toggle('on', x === b)); paint();
  });
  $('#rv-q').oninput = e => { RIV_F.q = e.target.value; paint(); };
  paint();
}
function rivalCards(list) {
  return list.map(r => {
      const [dl, dc] = difficulty(r._avg), pts = rewardPts(r._avg);
      return `<button class="rival ${save.beaten[r.key] ? 'beaten' : ''}" data-go="pre" data-arg="${r.key}">
        ${chip(r.c)}<div class="rv-name">${COUNTRIES[r.c].n}<small>Mundial ${r.y} · ${r.f}</small></div>
        <div class="rv-avg ${tier(Math.round(r._avg))}">${Math.round(r._avg)}</div>
        <div class="rv-foot"><span class="diff ${dc}">${dl}</span><span class="mut">+${pts} pts</span>${save.beaten[r.key] ? '<span class="ok">✓ Vencido</span>' : ''}</div>
      </button>`;
  }).join('');
}

/* ================= Previa ================= */
function renderPre(key) {
  const r = rivalInfo(RIVALS.find(x => x.key === key));
  app.innerHTML = `<div class="screen"><header class="bar"><button class="back" data-go="rivals">← Rivales</button><h2>Previa</h2><span></span></header>
    <div class="versus panel">
      <div class="vs-side">${crest(save.name, save.color)}<b>${esc(save.name)}</b><span class="vs-avg" id="pre-avg">${Math.round(myAvg())}</span></div>
      <div class="vs-mid">VS<small>Premio: +${rewardPts(r._avg)} pts de mejora</small></div>
      <div class="vs-side">${chip(r.c)}<b>${r.name}</b><span class="vs-avg">${Math.round(r._avg)}</span></div>
    </div>
    <details class="panel rival-xi"><summary>Ver el plantel de ${r.name} (${r.f})</summary>
      <div class="rx">${r.ids.map(id => `<span class="rxp"><i class="bpos l${LINE[DB[id].p]}">${DB[id].p}</i>${esc(DB[id].n)} <b>${DB[id].o}</b></span>`).join('')}</div></details>
    <h4 class="sec">Tu alineación</h4>
    <div id="ed"></div>
    <div class="play-row">
      <button class="big" data-go="arcade" data-arg="${key}">🎮 ¡Jugarlo yo!</button>
      <label class="arc-len">Dificultad <select id="arc-diff">${Object.entries(DIFFS).map(([k, d]) => `<option value="${k}" ${k === (save.arcDiff || 'facil') ? 'selected' : ''}>${d.name}</option>`).join('')}</select></label>
      <label class="arc-len">Cada tiempo dura <select id="arc-len">${ARC_LENS.map(n => `<option value="${n}" ${n === (save.arcLen || 3) ? 'selected' : ''}>${n} min</option>`).join('')}</select></label>
      <button class="big alt" data-go="play" data-arg="${key}">🧑‍💼 Dirigir como técnico</button>
    </div></div>`;
  $('#arc-len').onchange = e => { save.arcLen = +e.target.value; persist(); };
  $('#arc-diff').onchange = e => { save.arcDiff = e.target.value; persist(); };
  EDC = { mode: 'save', sel: null, el: $('#ed'), onChange: () => { $('#pre-avg').textContent = Math.round(myAvg()); } };
  renderEditor();
}

/* ================= Partido ================= */
const SPEEDS = { 1: 650, 2: 320, 4: 120 };
const SHOOT_W = { DC: 6, ED: 3.5, EI: 3.5, MCO: 3, MD: 2, MI: 2, MC: 1.5, MCD: 0.6, LD: 0.5, LI: 0.5, DFC: 0.4, POR: 0 };
const PASS_W = { MCO: 4, MC: 3, MD: 3, MI: 3, ED: 2.5, EI: 2.5, DC: 1.5, LD: 1.5, LI: 1.5, MCD: 1.5, DFC: 0.5, POR: 0 };
const DEF_W = { DFC: 4, MCD: 3, LD: 2.5, LI: 2.5, MC: 1.5, MD: 1, MI: 1, MCO: 0.5, ED: 0.3, EI: 0.3, DC: 0.2, POR: 0 };
const RATE_W = { // [ataque, medio, defensa]
  LD: [0.1, 0.3, 1], LI: [0.1, 0.3, 1], DFC: [0.03, 0.15, 1], MCD: [0.15, 0.9, 0.6], MC: [0.3, 1, 0.35],
  MCO: [0.7, 0.85, 0.1], MD: [0.5, 0.8, 0.3], MI: [0.5, 0.8, 0.3], ED: [1, 0.35, 0.05], EI: [1, 0.35, 0.05], DC: [1, 0.2, 0.03],
};
const T = {
  lost: ['{d} le gana el duelo a {a} y corta el ataque.', '{a} intenta la gambeta pero {d} se la quita limpia.', 'Gran cierre de {d} ante {a}.', 'Pase largo buscando a {a}... la intercepta {d}.', '{a} encara, pero {d} lo frena justo.'],
  miss: ['Remate de {a}... ¡afuera por poquito!', '{a} le pega desde lejos y se va por arriba del travesaño.', '¡Uff! {a} la tira desviada.', '{a} define cruzado y la pelota se va rozando el palo.'],
  missA: ['Centro de {p}, cabezazo de {a}... ¡desviado!', '{p} lo deja solo a {a}, que la tira afuera. ¡Increíble!'],
  save: ['¡Atajadón de {g}! Gran remate de {a}.', '{g} vuela y saca al córner el disparo de {a}.', 'Tiro de {a}, bien contenido por {g}.', '{a} queda mano a mano... ¡y {g} se la tapa!'],
  goal: ['¡GOOOL de {a}! Definición perfecta.', '¡GOL! {a} la manda a guardar.', '¡GOLAZO de {a}! Nada que hacer para {g}.'],
  goalA: ['¡GOL! Pase de {p} y {a} la empuja.', '¡GOOOL! {p} asiste y {a} no perdona.', '¡GOL! Paredita entre {p} y {a}, que define al gol.'],
  flavor: ['{a} maneja la pelota en el medio.', 'Toque y toque, {a} busca espacios.', '{a} abre la pelota a la banda.', '{a} pide la pelota y arma el juego.'],
  card: ['🟨 Amarilla para {d} por una falta sobre {a}.', '🟨 {d} se lleva la amarilla por cortar el avance de {a}.'],
};

function pOvr(id, side) { if (M && M.ovr) return M.ovr[side][id] ?? DB[id].o; return side === 'home' ? ovr(id) : DB[id].o; }
function stamF(side, id) { return 0.8 + 0.2 * (M[side].st[id] ?? 100) / 100; }
function rate(side) {
  const Tm = M[side], F = FORMATIONS[Tm.f]; let a = 0, aw = 0, m = 0, mw = 0, d = 0, dw = 0, gk = 40;
  F.forEach(([slot], i) => {
    const id = Tm.xi[i]; if (!id) return;
    const pen = penalty(DB[id].p, slot), e = (pOvr(id, side) - pen) * stamF(side, id);
    if (slot === 'POR') { const s = stats(id, pOvr(id, side)); gk = DB[id].p === 'POR' ? (s[0] + s[1] + s[3]) / 3 * stamF(side, id) : 35; return; }
    const w = RATE_W[slot]; a += e * w[0]; aw += w[0]; m += e * w[1]; mw += w[1]; d += e * w[2]; dw += w[2];
  });
  return { att: a / aw, mid: m / mw, def: d / dw, gk };
}
function pickBy(side, W, statIdx, exclude) {
  const Tm = M[side], F = FORMATIONS[Tm.f], c = [];
  F.forEach(([slot], i) => {
    const id = Tm.xi[i]; if (!id || id === exclude) return;
    const s = stats(id, pOvr(id, side))[statIdx];
    const w = (W[slot] || 0) * Math.pow(s / 70, 2);
    if (w > 0) c.push([id, w]);
  });
  let tot = c.reduce((s, x) => s + x[1], 0), r = rnd() * tot;
  for (const [id, w] of c) { r -= w; if (r <= 0) return id; }
  return c.length ? c[0][0] : Tm.xi.find(Boolean);
}

function startMatch(key) {
  const r = rivalInfo(RIVALS.find(x => x.key === key));
  if (save.xi.filter(Boolean).length < 11) { toast('Tu once está incompleto: completá los 11 titulares'); return renderPre(key); }
  let awayCol = COUNTRIES[r.c].c1;
  if (colDist(awayCol, save.color) < 120) awayCol = COUNTRIES[r.c].c2;
  if (colDist(awayCol, save.color) < 120) awayCol = lum(save.color) > 0.5 ? '#111111' : '#ffffff';
  M = {
    r, min: 0, add: 0, score: [0, 0], shots: [0, 0], onT: [0, 0], possSum: 0, ticks: 0, scorers: [[], []],
    speed: 1, paused: false, ended: false, ball: { x: 50, y: 50, tx: 50, ty: 50 }, carded: new Set(),
    home: { xi: save.xi.slice(), f: save.formation, st: {}, subs: 5, out: new Set(), col: save.color },
    away: { xi: r._xi.slice(), f: r.f, st: {}, subs: 5, out: new Set(), col: awayCol, bench: r.ids.filter(id => !r._xi.includes(id)) },
  };
  app.innerHTML = `<div class="screen match">
    <div class="scoreboard panel">
      <div class="sb-team">${crest(save.name, save.color, 'sm')}<span>${esc(save.name)}</span></div>
      <div class="sb-score"><span id="sc">0 - 0</span><small id="mn">0'</small></div>
      <div class="sb-team right"><span>${r.name}</span>${chip(r.c)}</div>
      <div class="sb-goals" id="gl0"></div><div></div><div class="sb-goals right" id="gl1"></div>
    </div>
    <div class="match-grid">
      <div class="pitch-wrap"><canvas id="cv"></canvas><div class="goalflash" id="gf"></div></div>
      <div class="feed panel" id="feed"></div>
    </div>
    <div class="match-ctrl">
      <button class="big slim" id="btn-ed">⏸ Cambios / Táctica</button>
      <div class="speed">${[1, 2, 4].map(s => `<button data-sp="${s}" class="${s === 1 ? 'on' : ''}">x${s}</button>`).join('')}</div>
      <div class="mstats" id="ms"></div>
    </div></div>`;
  M.cv = $('#cv');
  app.querySelectorAll('[data-sp]').forEach(b => b.onclick = () => { M.speed = +b.dataset.sp; app.querySelectorAll('[data-sp]').forEach(x => x.classList.toggle('on', x === b)); });
  $('#btn-ed').onclick = () => { if (M.ended) return; M.paused = true; openMatchEditor('Partido en pausa'); };
  matchLog(`🏟️ ¡Arranca el partido! ${esc(save.name)} vs ${r.name}.`, 'info');
  updateHUD();
  M.raf = requestAnimationFrame(frame);
  schedule();
}
function schedule() { clearTimeout(M.to); M.to = setTimeout(tick, SPEEDS[M.speed]); }
function minuteLabel() { return M.min > 90 ? `90+${M.min - 90}'` : M.min > 45 && M.ticks === 45 && M.paused ? "45'" : `${M.min}'`; }
function matchLog(html, cls = '') {
  if (!M) return;
  const f = $('#feed'); if (!f) return;
  const d = document.createElement('div'); d.className = 'ev ' + cls; d.innerHTML = `<span class="min">${M.min}'</span><span>${html}</span>`;
  f.prepend(d); while (f.children.length > 80) f.lastChild.remove();
  if (M.onLog) M.onLog(d.lastChild.textContent, cls);
}
function tick() {
  if (!M || M.paused || M.ended) return;
  M.min++;
  for (const side of ['home', 'away']) {
    M[side].xi.forEach(id => {
      if (!id) return;
      const fis = DB[id].p === 'POR' ? 90 : stats(id, pOvr(id, side))[5];
      const drop = DB[id].p === 'POR' ? 0.08 : 0.22 + (100 - fis) * 0.006;
      M[side].st[id] = Math.max(0, (M[side].st[id] ?? 100) - drop * (0.8 + rnd() * 0.4));
    });
  }
  const rH = rate('home'), rA = rate('away');
  const pH = Math.pow(rH.mid, 4) / (Math.pow(rH.mid, 4) + Math.pow(rA.mid, 4));
  M.possSum += pH; M.ticks++;
  if (rnd() < 0.38) attack(rnd() < pH ? 0 : 1, rH, rA);
  else {
    const s = rnd() < pH ? 0 : 1;
    M.ball.tx = 50 + (s ? -1 : 1) * (rnd() * 25 - 5); M.ball.ty = 20 + rnd() * 60;
    if (rnd() < 0.1) matchLog(fmt(pick(T.flavor), { a: short(pickBy(s ? 'away' : 'home', PASS_W, 2)) }));
  }
  if (rnd() < 0.035) {
    const s = rnd() < 0.5 ? 0 : 1, d = pickBy(s ? 'away' : 'home', DEF_W, 4);
    if (d && !M.carded.has(d)) { M.carded.add(d); matchLog(fmt(pick(T.card), { d: short(d), a: short(pickBy(s ? 'home' : 'away', SHOOT_W, 3)) }), 'card'); }
  }
  aiSubs();
  if (M.min === 89) { M.add = 1 + Math.floor(rnd() * 5); matchLog(`⏱️ Se jugarán ${M.add} minutos de descuento.`, 'info'); }
  updateHUD();
  if (M.min === 45) { M.paused = true; matchLog('⏸️ Final del primer tiempo.', 'info'); return halftime(); }
  if (M.min >= 90 + M.add) return endMatch();
  schedule();
}
function attack(s, rH, rA) {
  const A = s ? 'away' : 'home', D = s ? 'home' : 'away', ra = s ? rA : rH, rd = s ? rH : rA, dir = s ? -1 : 1;
  const shooter = pickBy(A, SHOOT_W, 1), defender = pickBy(D, DEF_W, 4);
  const gkId = M[D].xi[0] || '';
  const p = clamp(0.42 + (ra.att - rd.def) / 85, 0.15, 0.72);
  M.ball.tx = 50 + dir * (18 + rnd() * 22); M.ball.ty = 20 + rnd() * 60;
  if (rnd() > p) { if (rnd() < 0.4) matchLog(fmt(pick(T.lost), { a: short(shooter), d: short(defender) })); return; }
  M.shots[s]++;
  const assist = rnd() < 0.65 ? pickBy(A, PASS_W, 2, shooter) : null;
  const tir = stats(shooter, pOvr(shooter, A))[1] * stamF(A, shooter);
  const o = { a: short(shooter), p: assist ? short(assist) : '', d: short(defender), g: short(gkId) };
  setTimeout(() => { if (M && !M.ended) { M.ball.tx = 50 + dir * (46 + rnd() * 3); M.ball.ty = 40 + rnd() * 20; } }, 180);
  if (rnd() > clamp(0.4 + (tir - 70) / 120, 0.22, 0.72)) { matchLog(fmt(pick(assist ? T.missA : T.miss), o), 'miss'); return; }
  M.onT[s]++;
  const gp = clamp(0.34 + (tir - rd.gk) / 110, 0.12, 0.62);
  if (rnd() < gp) {
    M.score[s]++; M.scorers[s].push({ id: shooter, min: M.min > 90 ? `90+${M.min - 90}` : M.min });
    matchLog(fmt(pick(assist ? T.goalA : T.goal), o), 'goal ' + (s ? 'away' : 'home'));
    goalFlash(shooter, s);
    setTimeout(() => { if (M && !M.ended) { M.ball.tx = 50 + dir * 51; M.ball.ty = 48 + rnd() * 4; } }, 260);
    setTimeout(() => { if (M) { M.ball.x = M.ball.tx = 50; M.ball.y = M.ball.ty = 50; } }, 1400);
  } else matchLog(fmt(pick(T.save), o), 'save');
}
function goalFlash(id, s) {
  const g = $('#gf'); if (!g) return;
  g.innerHTML = `<div>¡GOOOL!</div><small>${esc(id)} · ${s ? M.r.name : esc(M.homeName || save.name)}</small>`;
  g.classList.remove('show'); void g.offsetWidth; g.classList.add('show');
}
function aiSubs() {
  const A = M.away;
  if (![60, 68, 76].includes(M.min) || !A.bench.length || A.subs <= 0) return;
  const F = FORMATIONS[A.f]; let worst = -1, ws = 101;
  A.xi.forEach((id, i) => { if (i && id && (A.st[id] ?? 100) < ws) { ws = A.st[id] ?? 100; worst = i; } });
  if (worst < 0 || ws > 75) return;
  const slot = F[worst][0];
  const cand = A.bench.slice().sort((a, b) => (DB[b].o - penalty(DB[b].p, slot)) - (DB[a].o - penalty(DB[a].p, slot)))[0];
  if (DB[cand].o - penalty(DB[cand].p, slot) < (DB[A.xi[worst]].o - penalty(DB[A.xi[worst]].p, slot)) * 0.85) return;
  const outId = A.xi[worst]; A.xi[worst] = cand; A.bench = A.bench.filter(x => x !== cand); A.subs--;
  matchLog(`🔁 Cambio en ${M.r.name}: entra <b>${esc(cand)}</b>, sale ${esc(outId)}.`, 'sub');
}
function updateHUD() {
  if (!$('#sc')) return;
  $('#sc').textContent = `${M.score[0]} - ${M.score[1]}`;
  $('#mn').textContent = M.min > 90 ? `90+${M.min - 90}'` : `${M.min}'`;
  const gl = s => M.scorers[s].map(g => `⚽ ${esc(short(g.id))} ${g.min}'`).join('<br>');
  $('#gl0').innerHTML = gl(0); $('#gl1').innerHTML = gl(1);
  const pos = M.ticks ? Math.round(M.possSum / M.ticks * 100) : 50;
  $('#ms').innerHTML = `<span>Posesión <b>${pos}%</b> – <b>${100 - pos}%</b></span><span>Remates <b>${M.shots[0]}</b> – <b>${M.shots[1]}</b></span><span>Al arco <b>${M.onT[0]}</b> – <b>${M.onT[1]}</b></span>`;
}

/* ----- Cancha animada ----- */
function frame(t) {
  if (!M || !M.cv) return;
  const cv = M.cv, dpr = window.devicePixelRatio || 1, w = cv.clientWidth, h = Math.round(w * 0.64);
  if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); cv.style.height = h + 'px'; }
  const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
  const m = w * 0.035, X = x => m + x / 100 * (w - 2 * m), Y = y => m + y / 100 * (h - 2 * m);
  for (let i = 0; i < 12; i++) { c.fillStyle = i % 2 ? '#2f8b40' : '#2a7f3a'; c.fillRect(i * w / 12, 0, w / 12 + 1, h); }
  c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 1.5;
  c.strokeRect(X(0), Y(0), X(100) - X(0), Y(100) - Y(0));
  c.beginPath(); c.moveTo(X(50), Y(0)); c.lineTo(X(50), Y(100)); c.stroke();
  c.beginPath(); c.arc(X(50), Y(50), (h - 2 * m) * 0.14, 0, Math.PI * 2); c.stroke();
  [[0, 1], [100, -1]].forEach(([gx, d]) => {
    c.strokeRect(Math.min(X(gx), X(gx + d * 16)), Y(21), Math.abs(X(gx + d * 16) - X(gx)), Y(79) - Y(21));
    c.strokeRect(Math.min(X(gx), X(gx + d * 6)), Y(37), Math.abs(X(gx + d * 6) - X(gx)), Y(63) - Y(37));
    c.fillStyle = 'rgba(255,255,255,.9)'; c.fillRect(d > 0 ? X(gx) - 5 : X(gx), Y(44), 5, Y(56) - Y(44));
  });
  const b = M.ball; b.x += (b.tx - b.x) * 0.07; b.y += (b.ty - b.y) * 0.07;
  const r = Math.max(6, w * 0.016);
  ['home', 'away'].forEach((side, si) => {
    const Tm = M[side], F = FORMATIONS[Tm.f];
    F.forEach(([slot, fx, fy], i) => {
      if (!Tm.xi[i]) return;
      let x = si ? 100 - fx : fx, y = si ? 100 - fy : fy;
      const k = slot === 'POR' ? 0.06 : 0.32;
      x += (b.x - 50) * k + Math.sin(t / 900 + i * 1.7 + si) * 1.2;
      y += (b.y - 50) * (slot === 'POR' ? 0.1 : 0.18) + Math.cos(t / 1100 + i * 2.3 + si) * 1.2;
      x = clamp(x, 1, 99); y = clamp(y, 2, 98);
      c.beginPath(); c.arc(X(x), Y(y), r, 0, Math.PI * 2);
      c.fillStyle = slot === 'POR' ? (si ? '#9ca3af' : '#111827') : Tm.col; c.fill();
      c.lineWidth = 2; c.strokeStyle = lum(Tm.col) > 0.6 ? '#111' : '#fff'; c.stroke();
      c.fillStyle = slot === 'POR' ? '#fff' : (lum(Tm.col) > 0.6 ? '#111' : '#fff');
      c.font = `700 ${Math.round(r * 1.05)}px Inter, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(i + 1, X(x), Y(y) + 0.5);
    });
  });
  c.beginPath(); c.arc(X(b.x) + 2, Y(b.y) + 2, r * 0.55, 0, Math.PI * 2); c.fillStyle = 'rgba(0,0,0,.3)'; c.fill();
  c.beginPath(); c.arc(X(b.x), Y(b.y), r * 0.55, 0, Math.PI * 2); c.fillStyle = '#fff'; c.fill(); c.strokeStyle = '#111'; c.lineWidth = 1; c.stroke();
  M.raf = requestAnimationFrame(frame);
}

/* ----- Pausa / entretiempo ----- */
function openModal(html) { modalEl.innerHTML = `<div class="modal-card">${html}</div>`; modalEl.classList.remove('hidden'); }
function closeModal() { modalEl.classList.add('hidden'); modalEl.innerHTML = ''; }
function resumeMatch() { closeModal(); EDC = null; if (M && !M.ended) { M.paused = false; if (M.arcade) arcResume(); else schedule(); } }
function openMatchEditor(title) {
  openModal(`<div class="mhead"><h3>${title} · ${M.min}'</h3><div class="mh-btns"><button class="link danger" id="m-quit">Abandonar</button><button class="big slim" id="m-res">Reanudar ▶</button></div></div><div id="med"></div>`);
  EDC = { mode: 'match', sel: null, el: $('#med') };
  renderEditor();
  $('#m-res').onclick = resumeMatch;
  $('#m-quit').onclick = () => askYes('¿Abandonar? Se cuenta como derrota 0-3.', () => { M.score = [0, 3]; M.scorers = [[], []]; M.forfeit = true; closeModal(); endMatch(); }, 'Sí, abandonar');
}
function halftime() {
  const pos = Math.round(M.possSum / M.ticks * 100);
  openModal(`<div class="mhead"><h3>Entretiempo</h3></div>
    <div class="ht"><div class="ht-score">${esc(save.name)} <b>${M.score[0]} - ${M.score[1]}</b> ${M.r.name}</div>
    <p class="mut">Posesión ${pos}% · Remates ${M.shots[0]}-${M.shots[1]} · Al arco ${M.onT[0]}-${M.onT[1]}</p>
    <div class="menu-btns"><button class="big alt" id="ht-ed">🔁 Hacer cambios</button><button class="big" id="ht-go">Segundo tiempo ▶</button></div></div>`);
  $('#ht-go').onclick = resumeMatch;
  $('#ht-ed').onclick = () => openMatchEditor('Entretiempo');
}
function endMatch() {
  M.ended = true; clearTimeout(M.to);
  const [a, b] = M.score, win = a > b, draw = a === b;
  save.rec[win ? 'w' : draw ? 'd' : 'l']++; save.rec.gf += a; save.rec.ga += b;
  POST = { pts: 0, signed: null, cands: [] };
  if (win) {
    save.beaten[M.r.key] = true;
    POST.pts = rewardPts(M.r._avg);
    POST.cands = shuffle(M.r.ids.filter(id => !save.squad.includes(id))).slice(0, 3);
  }
  persist();
  matchLog(`🏁 ¡Final! ${esc(save.name)} ${a} - ${b} ${M.r.name}`, 'info');
  updateHUD();
  setTimeout(() => go('post'), M.forfeit ? 0 : 1500);
}

/* ================= Post-partido ================= */
function renderPost() {
  stopMatchLoops();
  const [a, b] = M.score, win = a > b, draw = a === b;
  const res = win ? ['¡VICTORIA!', 'win'] : draw ? ['EMPATE', 'draw'] : ['DERROTA', 'loss'];
  const scorers = s => M.scorers[s].map(g => `⚽ ${esc(g.id)} ${g.min}'`).join('<br>') || '<span class="mut">—</span>';
  let html = `<div class="screen narrow">
    <div class="result ${res[1]} panel"><h2>${res[0]}</h2>
      <div class="res-row"><div>${crest(save.name, save.color)}<b>${esc(save.name)}</b><div class="scs">${scorers(0)}</div></div>
      <div class="res-score">${a} - ${b}</div>
      <div>${chip(M.r.c)}<b>${M.r.name}</b><div class="scs">${scorers(1)}</div></div></div>
      <p class="mut">Remates ${M.shots[0]}-${M.shots[1]} · Al arco ${M.onT[0]}-${M.onT[1]}</p></div>`;
  if (win) {
    const list = save.squad.slice().sort((x, y) => ovr(y) - ovr(x));
    html += `<div class="panel"><h3>Subí la media de tus jugadores</h3>
      <p class="mut">Te quedan <b class="pts">${POST.pts}</b> punto${POST.pts === 1 ? '' : 's'}. Cada punto suma +1 de media (máximo 99).</p>
      <div class="ups">${list.map(id => {
        const o = ovr(id), p = DB[id], gained = save.ups[id] || 0;
        return `<div class="uprow"><span class="bpos l${LINE[p.p]}">${p.p}</span><span class="bname">${esc(p.n)}<small>${COUNTRIES[p.c].n} · Mundial ${p.y}${gained ? ` · +${gained} total` : ''}</small></span>
          <span class="bovr ${tier(o)}">${o}</span><button class="plus" data-up="${esc(id)}" ${POST.pts <= 0 || o >= 99 ? 'disabled' : ''}>+1</button></div>`;
      }).join('')}</div></div>`;
    html += `<div class="panel"><h3>Fichá un jugador de ${M.r.name}</h3>`;
    if (POST.signed) html += `<p>✅ Fichaste a <b>${esc(POST.signed)}</b>. Ya está en tu plantilla.</p>`;
    else if (!POST.cands.length) html += `<p class="mut">Ya tenés a todos los jugadores de este plantel.</p>`;
    else if (save.squad.length >= SQUAD_MAX) html += `<p class="mut">Tu plantel está lleno (26). Liberá a alguien desde la Plantilla para poder fichar.</p>`;
    else html += `<p class="mut">Elegí uno (opcional):</p><div class="signs">${POST.cands.map(id => cardHTML(id, DB[id].o, `<button class="big slim" data-sign="${esc(id)}">Fichar</button>`)).join('')}</div>`;
    html += `</div>`;
  } else {
    html += `<p class="center mut">${draw ? 'Con el empate no hay mejoras. ¡Ganá para subir medias!' : 'Revisá la alineación y probá de nuevo.'}</p>`;
  }
  html += `<div class="menu-btns"><button class="big" id="post-go">Continuar</button><button class="big alt" data-go="pre" data-arg="${M.r.key}">Revancha</button></div></div>`;
  app.innerHTML = html;
  app.querySelectorAll('[data-up]').forEach(btn => btn.onclick = () => {
    if (POST.pts <= 0) return;
    const id = btn.dataset.up; if (ovr(id) >= 99) return;
    save.ups[id] = (save.ups[id] || 0) + 1; POST.pts--; persist(); renderPost();
  });
  app.querySelectorAll('[data-sign]').forEach(btn => btn.onclick = () => {
    const id = btn.dataset.sign; save.squad.push(id); POST.signed = id; persist(); toast(`¡${id} se suma al equipo!`); renderPost();
  });
  $('#post-go').onclick = () => {
    if (POST.pts > 0) return askYes(`Todavía te quedan ${POST.pts} punto(s) sin usar. ¿Seguir igual y perderlos?`, () => go('menu'), 'Seguir igual', 'Volver a usarlos');
    go('menu');
  };
}

/* ================= Inicio ================= */
load();
// Esperar a que carguen todos los scripts (play.js define la dificultad que usa el menú)
window.addEventListener('DOMContentLoaded', () => {
  if (typeof cloudReady === 'function' && cloudReady()) { save = null; cloudStart(); }
  else save ? renderMenu() : renderNewGame();
});
