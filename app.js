/* =========================================================================
   Birriería Ojeda · Sistema de operación
   Prototipo funcional (datos en localStorage)
   ========================================================================= */

/* ---------- Utilidades ------------------------------------------------ */
const $  = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const money = (n) => new Intl.NumberFormat('es-MX', { style:'currency', currency:'MXN', maximumFractionDigits:0 }).format(Number(n || 0));
const num   = (n) => new Intl.NumberFormat('es-MX').format(Number(n || 0));
const todayKey = () => new Date().toLocaleDateString('sv-SE');
const dayKeyOf = (d) => d.toLocaleDateString('sv-SE');
const shiftKey = (days) => { const d = new Date(); d.setDate(d.getDate() + days); return dayKeyOf(d); };
const dateText = (d = new Date()) => d.toLocaleDateString('es-MX', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
const timeText = (d = new Date()) => d.toLocaleTimeString('es-MX', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
const hourMin  = (d = new Date()) => d.toLocaleTimeString('es-MX', { hour:'2-digit', minute:'2-digit' });
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-' + Math.random().toString(16).slice(2));
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const minutesSince = (iso) => (!iso ? 0 : Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000)));

/* ---------- Iconos (SVG en línea) ------------------------------------- */
const ICONS = {
  /* Navegación */
  home:     '<path d="M3.4 10.4 12 3.6l8.6 6.8"/><path d="M5.6 9.4V19a2.2 2.2 0 0 0 2.2 2.2h8.4A2.2 2.2 0 0 0 18.4 19V9.4"/><path d="M9.6 21.2v-5.1a2.4 2.4 0 0 1 4.8 0v5.1"/>',
  receipt:  '<path d="M5.6 3.6a1 1 0 0 1 1-1h10.8a1 1 0 0 1 1 1v17.1l-2.6-1.7-2.4 1.7-2.4-1.7-2.4 1.7-2.6-1.7Z"/><path d="M9 7.8h6M9 11.4h6M9 15h3.4"/>',
  fire:     '<path d="M12 21.4c3.3 0 5.9-2.5 5.9-5.7 0-4.6-4.2-6-3.5-10.8-3 1.7-4.9 4.6-4.9 7.6-.6-.9-1.4-1.6-2.4-2-.7 1.5-1 3.1-1 5.2 0 3.2 2.6 5.7 5.9 5.7Z"/><path d="M12 21.4c1.5 0 2.7-1.2 2.7-2.7 0-1.9-1.8-2.6-1.5-4.6-1.3.8-2.2 2-2.2 3.4 0 .3 0 .6.1.9"/>',
  cash:     '<rect x="2.4" y="5.8" width="19.2" height="12.4" rx="3.2"/><circle cx="12" cy="12" r="2.9"/><path d="M6.3 9.7v4.6M17.7 9.7v4.6"/>',
  minus:    '<path d="M12 3.4v10.9"/><path d="m7.9 10.3 4.1 4.2 4.1-4.2"/><path d="M4.4 16.2v2.4a2.4 2.4 0 0 0 2.4 2.4h10.4a2.4 2.4 0 0 0 2.4-2.4v-2.4"/>',
  chart:    '<path d="M3.4 20.6h17.2"/><rect x="4.8" y="12.4" width="3.7" height="5.8" rx="1.4"/><rect x="10.2" y="8.2" width="3.7" height="10" rx="1.4"/><rect x="15.6" y="4.2" width="3.7" height="14" rx="1.4"/>',
  tag:      '<path d="M6.6 2.8v6.1a2.7 2.7 0 0 0 5.4 0V2.8"/><path d="M9.3 9.5v11.7"/><path d="M17.6 2.8c-1.7 1.1-2.6 2.8-2.6 5.1 0 2 .9 3.4 2.6 4v9.3"/>',

  /* Acciones e indicadores */
  plus:     '<path d="M12 4.8v14.4M4.8 12h14.4"/>',
  search:   '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',
  clock:    '<circle cx="12" cy="12" r="8.8"/><path d="M12 7v5.2l3.4 2"/>',
  check:    '<path d="m5.2 12.6 4.6 4.5L18.8 6.8"/>',
  edit:     '<path d="M4 20.2h4.4L19.2 9.4a2.1 2.1 0 0 0 0-3l-1.6-1.6a2.1 2.1 0 0 0-3 0L3.8 15.6Z"/><path d="m14.2 6.4 3.4 3.4"/>',
  trash:    '<path d="M3.8 6.6h16.4"/><path d="M9.4 6.6V4.9a1.4 1.4 0 0 1 1.4-1.4h2.4a1.4 1.4 0 0 1 1.4 1.4v1.7"/><path d="M6.4 6.6 7.3 19a2 2 0 0 0 2 1.9h5.4a2 2 0 0 0 2-1.9l.9-12.4"/><path d="M10.4 10.6v6M13.6 10.6v6"/>',
  close:    '<path d="M6.2 6.2 17.8 17.8M17.8 6.2 6.2 17.8"/>',
  user:     '<circle cx="12" cy="8" r="3.7"/><path d="M4.6 20.4c.7-3.8 3.7-5.9 7.4-5.9s6.7 2.1 7.4 5.9"/>',
  users:    '<circle cx="9.2" cy="8.2" r="3.3"/><path d="M2.9 19.6c.7-3.4 3.3-5.3 6.3-5.3s5.6 1.9 6.3 5.3"/><path d="M16.2 5.3a3.3 3.3 0 0 1 0 6.4"/><path d="M17.6 14.7c2.1.6 3.4 2.3 3.8 4.6"/>',
  chef:     '<path d="M7.4 20.8h9.2a1 1 0 0 0 1-1v-2H6.4v2a1 1 0 0 0 1 1Z"/><path d="M6.4 17.8c-1.7-1.1-2.8-3-2.8-5.2a5.4 5.4 0 0 1 5.6-5.4 4.2 4.2 0 0 1 5.6 0 5.4 5.4 0 0 1 5.6 5.4c0 2.2-1.1 4.1-2.8 5.2"/>',
  bag:      '<path d="M4.9 8.4a1 1 0 0 1 1-1h12.2a1 1 0 0 1 1 1l.9 11.4a1 1 0 0 1-1 1.1H5a1 1 0 0 1-1-1.1Z"/><path d="M8.8 10.6V6.7a3.2 3.2 0 0 1 6.4 0v3.9"/>',
  trend:    '<path d="m3.4 15.8 5.2-5.4 3.5 3.5 8.5-8.5"/><path d="M15.4 5.4h5.2v5.2"/>',
  down:     '<path d="m3.4 8.2 5.2 5.4 3.5-3.5 8.5 8.5"/><path d="M15.4 18.6h5.2v-5.2"/>',
  wallet:   '<path d="M3.4 8A2.6 2.6 0 0 1 6 5.4h11.4a1.6 1.6 0 0 1 1.6 1.6v1.2"/><rect x="3.4" y="8" width="17.2" height="11.6" rx="2.8"/><circle cx="16.4" cy="13.8" r="1.4"/>',
  table:    '<rect x="2.8" y="4.4" width="18.4" height="10.6" rx="2.4"/><path d="M7.4 15v4.8M16.6 15v4.8"/><path d="M6.6 8.6h10.8"/>',
  alert:    '<path d="M10.3 4.2a2 2 0 0 1 3.4 0l7.1 12.3a2 2 0 0 1-1.7 3H4.9a2 2 0 0 1-1.7-3Z"/><path d="M12 9.6v4M12 17h.01"/>',
  print:    '<path d="M6.8 8.6V4.2a1 1 0 0 1 1-1h8.4a1 1 0 0 1 1 1v4.4"/><rect x="3.2" y="8.6" width="17.6" height="7.6" rx="2.4"/><path d="M6.8 13.4h10.4v6.4a1 1 0 0 1-1 1H7.8a1 1 0 0 1-1-1Z"/>',
  back:     '<path d="M14.8 5.2 8 12l6.8 6.8"/>',
  chev:     '<path d="m6.4 9.4 5.6 5.4 5.6-5.4"/>',
  box:      '<path d="M3.4 7.6 12 3.4l8.6 4.2v8.8L12 20.6l-8.6-4.2Z"/><path d="M3.4 7.6 12 11.8l8.6-4.2M12 11.8v8.8"/>',
  star:     '<path d="m12 3.6 2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.6 9.7l5.8-.8Z"/>',
  cog:      '<circle cx="12" cy="12" r="3.1"/><path d="M19.6 14.4a1.5 1.5 0 0 0 .3 1.7l.1.1a1.8 1.8 0 1 1-2.6 2.6l-.1-.1a1.5 1.5 0 0 0-2.6 1.1v.3a1.8 1.8 0 1 1-3.6 0v-.2a1.5 1.5 0 0 0-2.7-1.1l-.1.1a1.8 1.8 0 1 1-2.6-2.6l.1-.1a1.5 1.5 0 0 0-1.1-2.6h-.3a1.8 1.8 0 1 1 0-3.6h.2a1.5 1.5 0 0 0 1.1-2.7l-.1-.1a1.8 1.8 0 1 1 2.6-2.6l.1.1a1.5 1.5 0 0 0 1.7.3h.1a1.5 1.5 0 0 0 .9-1.4v-.3a1.8 1.8 0 1 1 3.6 0v.2a1.5 1.5 0 0 0 2.6 1.1l.1-.1a1.8 1.8 0 1 1 2.6 2.6l-.1.1a1.5 1.5 0 0 0-.3 1.7v.1a1.5 1.5 0 0 0 1.4.9h.3a1.8 1.8 0 1 1 0 3.6h-.2a1.5 1.5 0 0 0-1.4.9Z"/>',
  key:      '<circle cx="8.2" cy="15.8" r="4.2"/><path d="m11.2 12.8 8-8"/><path d="m16.4 7.6 2.4 2.4M19.2 4.8l2.2 2.2"/>',
  download: '<path d="M12 3.6v11"/><path d="m7.8 10.4 4.2 4.2 4.2-4.2"/><path d="M4.4 16.6v2a2.4 2.4 0 0 0 2.4 2.4h10.4a2.4 2.4 0 0 0 2.4-2.4v-2"/>',
  upload:   '<path d="M12 15V3.8"/><path d="m7.8 8 4.2-4.2L16.2 8"/><path d="M4.4 16.6v2a2.4 2.4 0 0 0 2.4 2.4h10.4a2.4 2.4 0 0 0 2.4-2.4v-2"/>',
  shield:   '<path d="M12 3.2 4.8 6v6c0 4.3 3 7.6 7.2 8.8 4.2-1.2 7.2-4.5 7.2-8.8V6Z"/><path d="m9.2 12.2 2 2 3.6-3.8"/>',
};
const icon = (name, size = 20, cls = '') =>
  `<svg class="ic ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ''}</svg>`;

/* ---------- Catálogo base y usuarios ---------------------------------- */
const DEFAULT_USERS = {
  admin:  { pin:'1234', label:'Administrador', icon:'user'  },
  mesera: { pin:'1111', label:'Mesera',        icon:'users' },
  cocina: { pin:'2222', label:'Cocina',        icon:'chef'  },
  caja:   { pin:'3333', label:'Caja',          icon:'cash'  },
};

const DEFAULT_PRODUCTS = [
  { id:'p1',  category:'ALIMENTOS', name:'Taco suave',            price:35,  active:true },
  { id:'p2',  category:'ALIMENTOS', name:'Taco ahogado',          price:45,  active:true },
  { id:'p3',  category:'ALIMENTOS', name:'Taco dorado',           price:40,  active:true },
  { id:'p4',  category:'ALIMENTOS', name:'Quesabirria',           price:50,  active:true },
  { id:'p5',  category:'ALIMENTOS', name:'Dorado con queso',      price:50,  active:true },
  { id:'p6',  category:'ALIMENTOS', name:'Orden de birria',       price:180, active:true },
  { id:'p7',  category:'ALIMENTOS', name:'Media orden de birria', price:120, active:true },
  { id:'p8',  category:'ALIMENTOS', name:'Torta de birria',       price:120, active:true },
  { id:'p9',  category:'BEBIDAS',   name:'Refresco',              price:35,  active:true },
  { id:'p10', category:'BEBIDAS',   name:'Agua natural',          price:30,  active:true },
];

/** Perfiles con el PIN guardado en Ajustes (o el de fábrica si no se ha cambiado). */
function getUsers() {
  const saved = DB.get('users', null) || {};
  const out = {};
  for (const k of Object.keys(DEFAULT_USERS)) out[k] = { ...DEFAULT_USERS[k], ...(saved[k] || {}) };
  return out;
}
/** Mesas según el número configurado en Ajustes, más "Para llevar". */
function getTables() {
  const n = Math.max(1, Math.min(40, Number(DB.get('tableCount', 8)) || 8));
  return [...Array(n)].map((_, i) => `Mesa ${i + 1}`).concat('Para llevar');
}
const bizName = () => DB.get('bizName', 'Birriería Ojeda');
const EXPENSE_CATS = ['Carne','Insumos','Tortillas','Bebidas','Gas','Servicios','Nómina','Otros'];
const PAY_METHODS = [
  { id:'Efectivo',      icon:'cash'   },
  { id:'Tarjeta',       icon:'wallet' },
  { id:'Transferencia', icon:'trend'  },
];

/* ---------- Persistencia ---------------------------------------------- */
/**
 * Toda la información vive en memoria (STATE) para que las pantallas se dibujen
 * al instante. Cada cambio se guarda en este dispositivo y, si hay nube
 * configurada, se replica en Supabase fila por fila.
 */
const STATE = {};
const stateGet = (key) => STATE[key];
const stateSet = (key, val) => { STATE[key] = val; try { localStorage.setItem('bo_' + key, JSON.stringify(val)); } catch {} };

const DB = {
  get(key, fallback) {
    if (!(key in STATE)) {
      try { STATE[key] = JSON.parse(localStorage.getItem('bo_' + key)); } catch { STATE[key] = null; }
    }
    const v = STATE[key];
    return v === undefined || v === null ? fallback : v;
  },
  set(key, val) {
    stateSet(key, val);
    if (typeof Cloud === 'undefined' || !Cloud.online) return;
    if (key in TABLE_KEYS) cloudSyncArray(key, val || []);
    else if (SETTING_KEYS.indexOf(key) >= 0) cloudSyncSettings();
  },
  remove(key) {
    delete STATE[key];
    try { localStorage.removeItem('bo_' + key); } catch {}
    if (typeof Cloud !== 'undefined' && Cloud.online && SETTING_KEYS.indexOf(key) >= 0) cloudSyncSettings();
  },
};
/** Fondo de caja de un día concreto (si no se capturó, el predeterminado). */
function getFund(k = todayKey()) {
  const m = DB.get('funds', {}) || {};
  return m[k] != null ? Number(m[k]) : Number(DB.get('defaultFund', 0) || 0);
}
function setFund(v, k = todayKey()) {
  const m = DB.get('funds', {}) || {};
  m[k] = Number(v || 0);
  DB.set('funds', m);
}

/* ---------- Estado en memoria ----------------------------------------- */
let session      = null;
let currentPage  = 'home';
let homeRange    = 'hoy';        // hoy | semana
let orderFilter  = 'activas';    // activas | todas | cobradas
let draft        = null;         // { orderId, table, customer, items[] }
let menuFilter   = { cat:'TODO', q:'' };
let menuCats     = [];           // categorías visibles en la hoja de comanda
let payDraft     = { method:'Efectivo', received:0 };
let loginRole    = 'admin';
let loginPin     = '';

/* ---------- Navegación por rol ---------------------------------------- */
/** Todas las pestañas del sistema, en el orden en que se muestran. */
const ALL_PAGES = [
  ['home',     'home',    'Inicio'],
  ['orders',   'receipt', 'Comandas'],
  ['kitchen',  'fire',    'Cocina'],
  ['cashier',  'cash',    'Caja'],
  ['expenses', 'minus',   'Gastos'],
  ['cut',      'chart',   'Corte'],
  ['products', 'tag',     'Menú'],
  ['admin',    'cog',     'Ajustes'],
];
/** Reparto de fábrica; se puede cambiar perfil por perfil desde Ajustes. */
const DEFAULT_NAV = {
  admin:  ['home', 'orders', 'kitchen', 'cashier', 'expenses', 'cut', 'products', 'admin'],
  mesera: ['orders', 'kitchen'],
  cocina: ['kitchen', 'orders'],
  caja:   ['orders', 'cashier', 'expenses', 'cut'],
};

/** Ids de las pestañas de un perfil (las guardadas o las de fábrica). */
function navIds(role) {
  if (!role || !DEFAULT_NAV[role]) return [];
  const saved = (DB.get('users', {}) || {})[role];
  const ids = saved && Array.isArray(saved.pages) && saved.pages.length ? saved.pages : DEFAULT_NAV[role];
  const limpio = (ids || []).filter((id) => ALL_PAGES.some((p) => p[0] === id));
  // El administrador nunca se queda sin Ajustes: si no, no habría cómo volver a entrar.
  if (role === 'admin' && !limpio.includes('admin')) limpio.push('admin');
  // Nadie puede quedarse sin ninguna pestaña.
  return limpio.length ? limpio : (DEFAULT_NAV[role] || []);
}
/** Pestañas de un perfil como tuplas [id, icono, etiqueta]. */
const navOf = (role) => ALL_PAGES.filter((p) => navIds(role).includes(p[0]));

const TITLES = {
  home:     ['Panel',      'Inicio'],
  orders:   ['Ventas',     'Comandas'],
  kitchen:  ['Producción', 'Cocina'],
  cashier:  ['Cobro',      'Caja'],
  expenses: ['Control',    'Gastos'],
  cut:      ['Cierre',     'Corte diario'],
  products: ['Catálogo',   'Menú y precios'],
  admin:    ['Configuración', 'Administración'],
};

/* =========================================================================
   Helpers de dominio
   ========================================================================= */
const allOrders   = () => DB.get('orders', []);
const dayOrders   = (k = todayKey()) => allOrders().filter((o) => o.date === k);
const dayExpenses = (k = todayKey()) => DB.get('expenses', []).filter((e) => e.date === k);
const envioDe     = (o) => Number((o && o.delivery && o.delivery.fee) || 0);
const orderItems$ = (o) => o.items.reduce((s, i) => s + i.price * i.qty, 0);
/** Lo que se cobra: los productos más el envío, si es a domicilio. */
const orderTotal  = (o) => orderItems$(o) + envioDe(o);
const orderPieces = (o) => o.items.reduce((s, i) => s + i.qty, 0);
/** Platos de una comanda. Siempre hay al menos uno; nunca se usa "General". */
const orderPeople = (o) => [...new Set(o.items.map((i) => i.person || 'Plato 1'))];
const itemPerson = (i) => i.person || 'Plato 1';

/**
 * Solo hay dos momentos: la comanda está en cocina, o ya está lista para cobrar.
 * (El estado 'preparing' de versiones anteriores cuenta como "todavía en cocina".)
 */
function orderStatus(o) {
  if (o.paid) return 'paid';
  return o.items.length && o.items.every((i) => i.status === 'ready') ? 'ready' : 'pending';
}
const statusLabel = (s) => ({ pending:'En cocina', ready:'Lista para cobrar', paid:'Cobrada' }[s] || s);
const itemReady = (i) => i.status === 'ready';

function dayStats(k = todayKey()) {
  const orders = dayOrders(k);
  const expenses = dayExpenses(k);
  const paid = orders.filter((o) => o.paid);
  const open = orders.filter((o) => !o.paid);
  const sales = paid.reduce((s, o) => s + orderTotal(o), 0);
  const pending = open.reduce((s, o) => s + orderTotal(o), 0);
  const spent = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  return {
    orders, expenses, paid, open, sales, pending, spent,
    pieces:  orders.reduce((s, o) => s + orderPieces(o), 0),
    ticket:  paid.length ? sales / paid.length : 0,
    utility: sales - spent,
    fund:    getFund(k),
    cash:    getFund(k) + sales - spent,
  };
}

function topProducts(orders, limit = 5) {
  const map = {};
  orders.forEach((o) => o.items.forEach((i) => {
    map[i.name] ??= { qty:0, amount:0 };
    map[i.name].qty += i.qty;
    map[i.name].amount += i.qty * i.price;
  }));
  // El envío no es un producto, pero sí es dinero cobrado: va como renglón aparte.
  const envios = orders.filter((o) => envioDe(o));
  if (envios.length) {
    map['Servicio a domicilio'] = {
      qty: envios.length,
      amount: envios.reduce((t, o) => t + envioDe(o), 0),
    };
  }
  return Object.entries(map)
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}

/* =========================================================================
   Avisos, modales y hojas
   ========================================================================= */
let toastTimer = null;
function toast(msg, kind = '') {
  const t = $('#toast');
  t.className = 'toast show ' + kind;
  t.innerHTML = (kind === 'ok' ? icon('check', 17) : kind === 'err' ? icon('alert', 17) : '') + `<span>${esc(msg)}</span>`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

/** `variant` acepta 'wide' o 'pay' para el ancho del cuadro. */
function openModal(html, variant = '') {
  const cls = variant === true ? 'wide' : (variant || '');
  $('#modalRoot').innerHTML =
    `<div class="modal-backdrop" onclick="if(event.target===this) closeModal()"><div class="modal ${cls}">${html}</div></div>`;
}
function closeModal() { $('#modalRoot').innerHTML = ''; }

function modalHead(eyebrow, title) {
  return `<div class="modal-head"><div><p class="eyebrow red">${esc(eyebrow)}</p><h3>${esc(title)}</h3></div>
    <button class="close-x" onclick="closeModal()">${icon('close', 18)}</button></div>`;
}

function closeSheet() {
  $('#sheetRoot').innerHTML = '';
  document.body.style.overflow = '';
  draft = null;
}

/* =========================================================================
   Sesión / Login
   ========================================================================= */
/** ¿Hay nube configurada pero sin sesión en este equipo? */
function nubePendiente() {
  return typeof Cloud !== 'undefined' && typeof cloudConfig === 'function'
      && !!cloudConfig() && !Cloud.online;
}

function renderLogin() {
  const aviso = $('#loginNotice');
  if (aviso) {
    aviso.innerHTML = nubePendiente()
      ? `<div class="cloud-warn">
           ${icon('alert', 17)}
           <div><b>Este equipo no está sincronizado</b>
             <span>Las comandas que levantes aquí no las verán los demás.</span></div>
           <button class="btn btn-primary btn-sm" onclick="mostrarAccesoNegocio()">Conectar</button>
         </div>`
      : '';
  }
  $('#roleGrid').innerHTML = Object.entries(getUsers()).map(([id, u]) => `
    <button class="role-card ${loginRole === id ? 'on' : ''}" onclick="pickRole('${id}')">
      <span class="role-ic">${icon(u.icon, 19)}</span>
      <span>${u.label}<small>PIN de 4 dígitos</small></span>
    </button>`).join('');

  $('#pinDots').innerHTML = [0, 1, 2, 3].map((i) => `<i class="pin-dot ${loginPin.length > i ? 'on' : ''}"></i>`).join('');

  $('#keypad').innerHTML =
    [1,2,3,4,5,6,7,8,9].map((n) => `<button class="key" onclick="pinPress('${n}')">${n}</button>`).join('') +
    `<button class="key fn" onclick="pinClear()">Borrar</button>` +
    `<button class="key" onclick="pinPress('0')">0</button>` +
    `<button class="key go" onclick="tryLogin()">${icon('check', 20)}</button>`;
}
function pickRole(id) { loginRole = id; loginPin = ''; renderLogin(); }
function pinPress(n) { if (loginPin.length < 4) loginPin += n; renderLogin(); if (loginPin.length === 4) setTimeout(tryLogin, 120); }
function pinClear() { loginPin = loginPin.slice(0, -1); renderLogin(); }

/* La sesión se guarda en este dispositivo para no pedir el PIN cada vez que
   se recarga la página. Es local: nunca viaja a la nube. */
const SESION_KEY = 'bo_sesion';
function guardarSesion(role) { try { localStorage.setItem(SESION_KEY, role); } catch {} }
function borrarSesion() { try { localStorage.removeItem(SESION_KEY); } catch {} }
function leerSesion() {
  try {
    const role = localStorage.getItem(SESION_KEY);
    return role && getUsers()[role] ? role : null;
  } catch { return null; }
}

/** Abre la app con un perfil, venga del PIN o de una sesión ya guardada. */
function abrirSesion(role, saludar) {
  const users = getUsers();
  if (!users[role] || !navOf(role).length) return false;
  session = { role, label: users[role].label };
  guardarSesion(role);

  $('#loginView').classList.add('hidden');
  $('#cloudView').classList.add('hidden');
  $('#appView').classList.remove('hidden');
  $('#userRoleLabel').textContent = session.label;
  $('#userAvatar').textContent = session.label[0];
  applyBranding();

  // Se retoma la pestaña donde se quedó, si ese perfil la tiene permitida.
  const guardada = leerPagina();
  go(guardada && roleAllowed(guardada) ? guardada : navOf(role)[0][0]);
  if (saludar) toast('Bienvenido, ' + session.label, 'ok');
  return true;
}

function tryLogin() {
  const users = getUsers();
  if (users[loginRole].pin !== loginPin) { toast('PIN incorrecto', 'err'); loginPin = ''; renderLogin(); return; }
  loginPin = ''; renderLogin();
  abrirSesion(loginRole, true);
}
function logout() {
  session = null;
  borrarSesion();
  olvidarPagina();
  closeModal(); closeSheet();
  $('#appView').classList.add('hidden');
  mostrarLogin();
}

document.addEventListener('keydown', (e) => {
  if (session) {
    // Escape cierra primero el modal; si no había modal, cierra la hoja de comanda.
    if (e.key === 'Escape') { if ($('#modalRoot').innerHTML) closeModal(); else closeSheet(); }
    return;
  }
  // Si se está escribiendo en un campo (correo, contraseña…) el teclado es de ese
  // campo: no debe alimentar el PIN por detrás.
  const foco = e.target;
  if (foco && (foco.tagName === 'INPUT' || foco.tagName === 'TEXTAREA' ||
               foco.tagName === 'SELECT' || foco.isContentEditable)) return;
  // Tampoco cuando la pantalla visible es la del acceso del negocio.
  if (!$('#cloudView').classList.contains('hidden')) return;
  if ($('#modalRoot').innerHTML) return;

  if (/^[0-9]$/.test(e.key)) pinPress(e.key);
  else if (e.key === 'Backspace') pinClear();
  else if (e.key === 'Enter') tryLogin();
});

/* =========================================================================
   Acceso del negocio (solo cuando hay nube configurada)
   ========================================================================= */
let cloudMode = 'entrar';   // entrar | crear

function renderCloudLogin(aviso) {
  $('#cloudTitle').textContent = cloudMode === 'entrar' ? 'Entra una sola vez' : 'Crea el acceso de tu negocio';
  $('#cloudForm').innerHTML = `
    <div class="field" style="margin-bottom:12px">
      <label>Correo del negocio</label>
      <input id="cloudEmail" type="email" inputmode="email" autocomplete="username" placeholder="birrieria@correo.com">
    </div>
    <div class="field" style="margin-bottom:14px">
      <label>Contraseña</label>
      <input id="cloudPass" type="password" autocomplete="current-password" placeholder="Mínimo 6 caracteres">
    </div>
    ${aviso ? `<div class="cloud-msg ${aviso.tipo}">${esc(aviso.texto)}</div>` : ''}
    <button class="btn btn-primary btn-lg full" id="cloudGo" onclick="cloudSubmit()">
      ${cloudMode === 'entrar' ? 'Entrar' : 'Crear acceso'}
    </button>
    <button class="linkbtn" style="margin-top:10px" onclick="toggleCloudMode()">
      ${cloudMode === 'entrar' ? '¿Es la primera vez? Crea el acceso del negocio' : '¿Ya lo tienes? Entrar'}
    </button>
    <div class="divider"></div>
    <button class="btn btn-line full btn-sm" onclick="cloudSettingsPrompt()">Cambiar la conexión de Supabase</button>
    <button class="linkbtn" style="margin-top:8px" onclick="mostrarLogin()">${icon('back', 14)} Volver a la pantalla de PIN</button>`;

  const pass = $('#cloudPass');
  if (pass) pass.onkeydown = (e) => { if (e.key === 'Enter') cloudSubmit(); };
}
function toggleCloudMode() { cloudMode = cloudMode === 'entrar' ? 'crear' : 'entrar'; renderCloudLogin(); }

async function cloudSubmit() {
  const email = $('#cloudEmail').value.trim();
  const pass = $('#cloudPass').value;
  if (!email || !pass) { renderCloudLogin({ tipo:'err', texto:'Escribe el correo y la contraseña.' }); return; }

  const btn = $('#cloudGo');
  btn.disabled = true;
  btn.textContent = cloudMode === 'entrar' ? 'Entrando…' : 'Creando…';

  const r = cloudMode === 'entrar'
    ? await cloudSignIn(email, pass)
    : await cloudSignUp(email, pass);

  if (r.error) { renderCloudLogin({ tipo:'err', texto:r.error }); return; }
  if (r.pendiente) {
    renderCloudLogin({ tipo:'ok', texto:'Revisa tu correo y confirma la cuenta; después entra con esos datos.' });
    cloudMode = 'entrar';
    return;
  }

  if (cloudMode === 'crear') {
    // Negocio nuevo: se sube lo que ya había en este dispositivo.
    await cloudPushAll();
  } else {
    await cloudPullAll();
    await cloudEmpujarDiferencias();   // lo capturado antes de conectar sube ahora
  }
  cloudListen();
  iniciarLatido();
  engancharDespertares();
  sembrarDefaults();
  applyBranding();
  actualizarEstadoNube();
  mostrarLogin();
  toast('Equipo conectado · ya comparte las comandas', 'ok');
}

/** Deja de usar la nube en este equipo. */
function usarSoloLocal() {
  if (!confirm('Este dispositivo dejará de compartir información con los demás. ¿Continuar?')) return;
  clearCloudConfig();
  Cloud.online = false;
  actualizarEstadoNube();
  mostrarLogin();
}

/** Captura de la dirección y la clave del proyecto de Supabase. */
function cloudSettingsPrompt() {
  const cfg = cloudConfig() || { url:'', key:'' };
  openModal(`${modalHead('Sincronización', 'Conectar con Supabase')}
    <div class="modal-body">
      <div class="field"><label>Project URL</label>
        <input id="cfgUrl" placeholder="https://xxxxxxxx.supabase.co" value="${esc(cfg.url)}"></div>
      <div class="field"><label>Clave anon (public)</label>
        <textarea id="cfgKey" placeholder="eyJhbGciOi…" style="min-height:88px;font-size:12px">${esc(cfg.key)}</textarea></div>
      <p class="muted" style="font-size:12.5px">
        Los dos datos están en Supabase → <b>Settings → API</b>. Se guardan solo en este dispositivo.
      </p>
    </div>
    <div class="modal-foot">
      <button class="btn btn-line" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="guardarCloudConfig()">Guardar y conectar</button>
    </div>`);
}
/** Evita que se pegue por error la llave maestra, que no debe salir del servidor. */
function esClaveSecreta(key) {
  if (/^sb_secret_/i.test(key)) return true;
  try {
    const carga = key.split('.')[1];
    if (!carga) return false;
    const b64 = carga.replace(/-/g, '+').replace(/_/g, '/');
    return /"role"\s*:\s*"service_role"/.test(atob(b64 + '==='.slice((b64.length + 3) % 4)));
  } catch { return false; }
}

async function guardarCloudConfig() {
  const url = $('#cfgUrl').value.trim();
  const key = $('#cfgKey').value.trim();
  if (!/^https:\/\/[^\s/]+\.[^\s/]+/.test(url)) {
    toast('La dirección debe verse como https://xxxx.supabase.co', 'err'); return;
  }
  // Sirven las dos formas: la clave anon de siempre (eyJ…) y la nueva publishable.
  if (key.length < 20) { toast('Esa clave se ve incompleta', 'err'); return; }
  if (esClaveSecreta(key)) { toast('Esa es la clave secreta. Usa la anon / publishable', 'err'); return; }
  saveCloudConfig(url, key);
  Cloud.client = null;
  closeModal();
  const estado = await cloudInit();
  actualizarEstadoNube();
  if (estado === 'listo') { sembrarDefaults(); applyBranding(); toast('Conectado', 'ok'); refresh(); }
  else { mostrarAccesoNegocio(); }
}

/* =========================================================================
   Shell: navegación y reloj
   ========================================================================= */
function navBadges() {
  const st = dayStats();
  const open = st.open;
  return {
    orders:  open.length,
    kitchen: open.filter((o) => orderStatus(o) !== 'ready').length,
    cashier: open.filter((o) => orderStatus(o) === 'ready').length,
  };
}
function renderNav() {
  const b = navBadges();
  $('#navMenu').innerHTML = navOf(session.role).map(([id, ic, label]) => `
    <button class="nav-btn ${currentPage === id ? 'active' : ''}" data-page="${id}">
      ${icon(ic, 19, 'nav-icon')}<span>${label}</span>
      ${b[id] ? `<em class="nav-badge">${b[id]}</em>` : ''}
    </button>`).join('')
    // En celular la barra lateral no se ve: la cuenta va al final de la barra roja.
    + `<button class="nav-btn nav-cuenta" onclick="abrirCuenta()">
         ${icon('user', 19, 'nav-icon')}<span>Cuenta</span></button>`;
  $$('.nav-btn[data-page]').forEach((el) => (el.onclick = () => go(el.dataset.page)));
}
const roleAllowed = (page) => navOf(session && session.role).some((n) => n[0] === page);

/* La pestaña abierta se recuerda en el equipo: recargar en plena corrida no
   debe devolver a nadie al inicio. */
const PAGINA_KEY = 'bo_pagina';
function guardarPagina(p) { try { localStorage.setItem(PAGINA_KEY, p); } catch {} }
function leerPagina() { try { return localStorage.getItem(PAGINA_KEY); } catch { return null; } }
function olvidarPagina() { try { localStorage.removeItem(PAGINA_KEY); } catch {} }

function go(page) {
  if (!roleAllowed(page)) page = navOf(session.role)[0][0];
  currentPage = page;
  guardarPagina(page);
  const [ey, title] = TITLES[page];
  $('#pageEyebrow').textContent = ey;
  $('#pageTitle').textContent = title;
  renderNav();
  renderPage();
  $('.main')?.scrollTo?.({ top: 0 });
  window.scrollTo({ top: 0 });
}
function renderPage() {
  ({ home:renderHome, orders:renderOrders, kitchen:renderKitchen, cashier:renderCashier,
     expenses:renderExpenses, cut:renderCut, products:renderProducts,
     admin:renderAdmin }[currentPage])?.();
}
function refresh() { renderNav(); renderPage(); actualizarEstadoNube(); }

setInterval(() => {
  const d = new Date();
  const t = $('#clockTime'), dd = $('#clockDate');
  if (t) t.textContent = timeText(d);
  if (dd) dd.textContent = dateText(d);
}, 1000);

// Refresco automático de cocina (para los cronómetros), sin interrumpir capturas.
setInterval(() => {
  if (session && currentPage === 'kitchen' && !$('#modalRoot').innerHTML && !$('#sheetRoot').innerHTML) refresh();
}, 20000);

/* =========================================================================
   1 · INICIO — Panel del dueño
   ========================================================================= */
function deltaChip(now, before) {
  if (!before && !now) return `<span class="delta flat">sin datos</span>`;
  if (!before) return `<span class="delta up">${icon('trend', 12)} nuevo</span>`;
  const pct = Math.round(((now - before) / before) * 100);
  const cls = pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat';
  return `<span class="delta ${cls}">${pct > 0 ? icon('trend', 12) : pct < 0 ? icon('down', 12) : ''} ${pct > 0 ? '+' : ''}${pct}%</span>`;
}

function salesByHour(orders) {
  const buckets = {};
  orders.filter((o) => o.paid).forEach((o) => {
    const h = new Date(o.payment?.at || o.createdAt).getHours();
    buckets[h] = (buckets[h] || 0) + orderTotal(o);
  });
  const hours = Object.keys(buckets).map(Number);
  const from = Math.min(11, ...(hours.length ? hours : [11]));
  const to   = Math.max(20, ...(hours.length ? hours : [20]));
  const out = [];
  for (let h = from; h <= to; h++) out.push({ label: String(h).padStart(2, '0'), value: buckets[h] || 0 });
  return out;
}
function salesByDay(days = 7) {
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const k = shiftKey(-i);
    const d = new Date(); d.setDate(d.getDate() - i);
    out.push({
      label: d.toLocaleDateString('es-MX', { weekday:'short' }).replace('.', ''),
      value: dayOrders(k).filter((o) => o.paid).reduce((s, o) => s + orderTotal(o), 0),
    });
  }
  return out;
}
function barChart(data) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return `<div class="chart">${data.map((d) => `
    <div class="bar" title="${esc(d.label)}: ${money(d.value)}">
      <span class="bar-val">${d.value ? Math.round(d.value / 1000 * 10) / 10 + 'k' : ''}</span>
      <span class="bar-track"><i class="bar-fill" style="height:${Math.round((d.value / max) * 100)}%"></i></span>
      <span class="bar-lab">${esc(d.label)}</span>
    </div>`).join('')}</div>`;
}

function renderHome() {
  const st = dayStats();
  const yst = dayStats(shiftKey(-1));
  const st7 = Array.from({ length:7 }, (_, i) => dayStats(shiftKey(-i)));
  const week = st7.reduce((s, d) => s + d.sales, 0);
  const isBoss = session.role === 'admin' || session.role === 'caja';

  const pend  = st.open.filter((o) => orderStatus(o) === 'pending').length;
  const ready = st.open.filter((o) => orderStatus(o) === 'ready').length;
  const busyTables = new Set(st.open.filter((o) => o.table !== 'Para llevar').map((o) => o.table)).size;

  /* --- KPIs --- */
  const kpis = isBoss ? `
    <div class="kpi hero">
      <div class="kpi-top"><span class="kpi-label">Ventas cobradas hoy</span><span class="kpi-ic">${icon('cash', 17)}</span></div>
      <div class="kpi-value">${money(st.sales)}</div>
      <div class="kpi-foot">${deltaChip(st.sales, yst.sales)}<span>vs. ayer ${money(yst.sales)}</span></div>
    </div>
    <div class="kpi green">
      <div class="kpi-top"><span class="kpi-label">Utilidad del día</span><span class="kpi-ic">${icon('trend', 17)}</span></div>
      <div class="kpi-value">${money(st.utility)}</div>
      <div class="kpi-foot"><span>Ventas ${money(st.sales)} − gastos ${money(st.spent)}</span></div>
    </div>
    <div class="kpi blue">
      <div class="kpi-top"><span class="kpi-label">Ticket promedio</span><span class="kpi-ic">${icon('receipt', 17)}</span></div>
      <div class="kpi-value">${money(st.ticket)}</div>
      <div class="kpi-foot">${deltaChip(st.ticket, yst.ticket)}<span>${st.paid.length} venta${st.paid.length === 1 ? '' : 's'} · ${num(st.pieces)} piezas</span></div>
    </div>
    <div class="kpi red">
      <div class="kpi-top"><span class="kpi-label">Efectivo esperado en caja</span><span class="kpi-ic">${icon('wallet', 17)}</span></div>
      <div class="kpi-value">${money(st.cash)}</div>
      <div class="kpi-foot"><span>Fondo de hoy ${money(st.fund)} · gastos ${money(st.spent)}</span></div>
    </div>` : `
    <div class="kpi hero">
      <div class="kpi-top"><span class="kpi-label">Comandas abiertas</span><span class="kpi-ic">${icon('receipt', 17)}</span></div>
      <div class="kpi-value">${st.open.length}</div>
      <div class="kpi-foot"><span>${money(st.pending)} por cobrar</span></div>
    </div>
    <div class="kpi red">
      <div class="kpi-top"><span class="kpi-label">Por preparar</span><span class="kpi-ic">${icon('fire', 17)}</span></div>
      <div class="kpi-value">${pend}</div>
      <div class="kpi-foot"><span>Comandas en cocina</span></div>
    </div>
    <div class="kpi green">
      <div class="kpi-top"><span class="kpi-label">Listas para entregar</span><span class="kpi-ic">${icon('check', 17)}</span></div>
      <div class="kpi-value">${ready}</div>
      <div class="kpi-foot"><span>Avisa a la mesa</span></div>
    </div>
    <div class="kpi blue">
      <div class="kpi-top"><span class="kpi-label">Mesas ocupadas</span><span class="kpi-ic">${icon('table', 17)}</span></div>
      <div class="kpi-value">${busyTables}<span style="font-size:16px;color:var(--muted)"> / ${getTables().length - 1}</span></div>
      <div class="kpi-foot"><span>${num(st.pieces)} piezas vendidas hoy</span></div>
    </div>`;

  /* --- Gráfica --- */
  const chartData = homeRange === 'hoy' ? salesByHour(st.orders) : salesByDay(7);
  const chartTotal = chartData.reduce((s, d) => s + d.value, 0);
  const best = chartData.reduce((a, b) => (b.value > a.value ? b : a), { label:'—', value:0 });

  /* --- Top productos --- */
  const top = topProducts(st.orders, 5);
  const topMax = Math.max(1, ...top.map((t) => t.amount));

  /* --- Mesas --- */
  const tablesBlock = getTables().map((t) => {
    const o = st.open.find((x) => x.table === t);
    const s = o ? orderStatus(o) : null;
    return `<div class="mini-table ${s === 'ready' ? 'ready' : o ? 'busy' : ''}">
      <b>${esc(t.replace('Mesa ', 'M'))}</b><small>${o ? money(orderTotal(o)) : 'Libre'}</small></div>`;
  }).join('');

  /* --- Últimas comandas --- */
  const recent = [...st.orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);

  $('#pageContent').innerHTML = `
    <div class="section-head" style="margin-top:0">
      <div>
        <h3>Hola, ${esc(session.label)}</h3>
        <p style="text-transform:capitalize">${dateText()}</p>
      </div>
      <div class="actions">
        ${roleAllowed('cut') ? `<button class="btn btn-line" onclick="go('cut')">${icon('chart', 17)} Ver corte</button>` : ''}
      </div>
    </div>

    <div class="kpi-grid">${kpis}</div>

    <div class="grid grid-b" style="margin-top:16px">
      <div class="card">
        <div class="card-head">
          <div>
            <div class="card-title">${homeRange === 'hoy' ? 'Ventas por hora' : 'Ventas de los últimos 7 días'}</div>
            <div class="card-sub">${money(chartTotal)} en total · mejor ${homeRange === 'hoy' ? 'hora' : 'día'}: ${esc(best.label)} (${money(best.value)})</div>
          </div>
          <div class="chips">
            <button class="chip ${homeRange === 'hoy' ? 'on red' : ''}" onclick="setHomeRange('hoy')">Hoy</button>
            <button class="chip ${homeRange === 'semana' ? 'on red' : ''}" onclick="setHomeRange('semana')">7 días</button>
          </div>
        </div>
        ${barChart(chartData)}
        ${homeRange === 'semana' ? `<div class="divider"></div><div class="kv"><span>Total de la semana</span><b>${money(week)}</b></div><div class="kv"><span>Promedio diario</span><b>${money(week / 7)}</b></div>` : ''}
      </div>

      <div class="card">
        <div class="card-head"><div><div class="card-title">Lo más vendido hoy</div><div class="card-sub">Por importe generado</div></div>${icon('star', 20, 'muted')}</div>
        ${top.length ? `<div class="rank-list">${top.map((t, i) => `
          <div class="rank-row">
            <span class="rank-n">${i + 1}</span>
            <div style="min-width:0">
              <div class="rank-name">${esc(t.name)}</div>
              <div class="rank-bar"><i style="width:${Math.round((t.amount / topMax) * 100)}%"></i></div>
            </div>
            <div class="rank-val"><b>${money(t.amount)}</b><small>${t.qty} pz</small></div>
          </div>`).join('')}</div>`
        : `<div class="empty" style="padding:26px"><strong>Sin ventas aún</strong>El ranking se llena solo.</div>`}
      </div>
    </div>

    <div class="grid grid-b" style="margin-top:16px">
      <div class="card">
        <div class="card-head">
          <div><div class="card-title">Últimas comandas</div><div class="card-sub">Movimiento más reciente del día</div></div>
          ${roleAllowed('orders') ? `<button class="btn btn-line btn-sm" onclick="go('orders')">Ver todas</button>` : ''}
        </div>
        ${recent.length ? `<div class="grid" style="gap:0">${recent.map((o) => `
          <div class="kv">
            <div style="display:flex;align-items:center;gap:10px;min-width:0">
              <span class="status ${orderStatus(o)}">${statusLabel(orderStatus(o))}</span>
              <div style="min-width:0"><b style="font-weight:700">${esc(o.table)}</b>
              <small class="muted"> · #${esc(o.folio)} · ${esc(o.createdTime)}</small></div>
            </div>
            <b>${money(orderTotal(o))}</b>
          </div>`).join('')}</div>`
        : `<div class="empty" style="padding:26px"><strong>Todavía no hay comandas</strong>Las del día van apareciendo aquí.</div>`}
      </div>

      <div class="card">
        <div class="card-head"><div><div class="card-title">Mesas</div><div class="card-sub">Ocupación en tiempo real</div></div>${icon('table', 20, 'muted')}</div>
        <div class="mini-tables">${tablesBlock}</div>
        ${isBoss ? `<div class="divider"></div>
          <div class="kv"><span>Gastos de hoy</span><b class="text-red">${money(st.spent)}</b></div>
          <div class="kv"><span>Por cobrar</span><b>${money(st.pending)}</b></div>
          <div class="kv"><span>Piezas vendidas</span><b>${num(st.pieces)}</b></div>` : ''}
      </div>
    </div>`;
}
function setHomeRange(r) { homeRange = r; renderHome(); }

/* =========================================================================
   2 · COMANDAS — “+” y bitácora del día
   ========================================================================= */
function renderOrders() {
  const st = dayStats();
  const list = st.orders
    .filter((o) => (orderFilter === 'todas' ? true : orderFilter === 'cobradas' ? o.paid : !o.paid))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  $('#pageContent').innerHTML = `
    <div class="orders-bar">
      <div class="day-strip">
      <div><span>Comandas de hoy</span><b>${st.orders.length}</b></div>
      <i class="sep"></i>
      <div><span>Abiertas</span><b>${st.open.length}</b></div>
      <i class="sep"></i>
      <div><span>Por cobrar</span><b>${money(st.pending)}</b></div>
      <i class="sep"></i>
      <div><span>Cobrado</span><b class="text-green">${money(st.sales)}</b></div>
      <i class="sep"></i>
      <div><span>Piezas</span><b>${num(st.pieces)}</b></div>
      </div>
      <button class="btn btn-primary btn-lg" onclick="newOrder()">${icon('plus', 18)} Nueva comanda</button>
    </div>

    <div class="section-head" style="margin:16px 0 12px">
      <div><h3>Historial del día</h3><p>Todas las comandas levantadas hoy.</p></div>
      <div class="chips">
        <button class="chip ${orderFilter === 'activas' ? 'on red' : ''}" onclick="setOrderFilter('activas')">Abiertas <i class="n">${st.open.length}</i></button>
        <button class="chip ${orderFilter === 'cobradas' ? 'on red' : ''}" onclick="setOrderFilter('cobradas')">Cobradas <i class="n">${st.paid.length}</i></button>
        <button class="chip ${orderFilter === 'todas' ? 'on red' : ''}" onclick="setOrderFilter('todas')">Todas <i class="n">${st.orders.length}</i></button>
      </div>
    </div>

    ${list.length ? `<div class="order-cards">${list.map(orderCard).join('')}</div>`
      : `<div class="empty"><div class="em-ic">${icon('receipt', 22)}</div>
          <strong>No hay comandas en este filtro</strong>Usa el botón <b>+</b> de la orilla derecha para levantar una.</div>`}

    <button class="fab" onclick="newOrder()" title="Nueva comanda" aria-label="Nueva comanda">${icon('plus', 26)}</button>`;
}
function setOrderFilter(f) { orderFilter = f; renderOrders(); }

function orderCard(o) {
  const s = orderStatus(o);
  const shown = o.items.slice(0, 3);
  const rest = o.items.length - shown.length;
  const mins = minutesSince(o.createdAt);
  return `<article class="order-card ${s}">
    <div class="oc-head">
      <div style="min-width:0">
        <div class="oc-table">${esc(o.table)}</div>
        <div class="oc-meta">
          <span>#${esc(o.folio)}</span><span>·</span><span>${esc(o.createdTime)}</span>
          ${o.customer ? `<span>·</span><span>${esc(o.customer)}</span>` : ''}
          ${!o.paid && mins > 0 ? `<span>·</span><span>${mins} min</span>` : ''}
        </div>
        ${o.delivery ? `<div class="entrega-mini">${icon('bag', 13)}<span>${esc(textoEntrega(o))}</span></div>` : ''}
      </div>
      <span class="status ${s}">${statusLabel(s)}</span>
    </div>

    <div class="oc-items">
      ${shown.map((i) => `<div><span>${i.qty} × ${esc(i.name)}</span><span class="money">${money(i.qty * i.price)}</span></div>`).join('')}
      ${rest > 0 ? `<div class="oc-more">+ ${rest} producto${rest > 1 ? 's' : ''} más</div>` : ''}
    </div>

    <div class="oc-foot">
      <div class="oc-total">${money(orderTotal(o))}</div>
      <div class="actions">
        <button class="btn btn-wa btn-sm" title="Enviar por WhatsApp" onclick="enviarWhatsApp('${o.id}')">${icon('users', 15)}</button>
        ${o.paid
          ? `<button class="btn btn-line btn-sm" onclick="viewOrder('${o.id}')">${icon('receipt', 15)} Ticket</button>`
          : `<button class="btn btn-line btn-sm" onclick="editOrder('${o.id}')">${icon('edit', 15)} Editar</button>
             ${roleAllowed('cashier') ? `<button class="btn btn-primary btn-sm" onclick="openPayment('${o.id}')">${icon('cash', 15)} Cobrar</button>` : ''}`}
      </div>
    </div>
  </article>`;
}

/* ---------- Hoja constructora de comandas ----------------------------- */
/** Paso 1: elegir la mesa. Si ya tiene comanda abierta, se abre para seguir capturando. */
function newOrder() {
  const abiertas = dayOrders().filter((o) => !o.paid);
  openModal(`${modalHead('Nueva comanda', '¿En qué mesa?')}
    <div class="modal-body">
      <div class="table-pick">
        ${getTables().map((t) => {
          const o = abiertas.find((x) => x.table === t);
          const llevar = t === 'Para llevar';
          return `<button class="table-opt ${o && !llevar ? 'busy' : ''}" onclick="chooseTable('${t}')">
            <span class="to-ic">${icon(llevar ? 'bag' : 'table', 19)}</span>
            <b>${esc(llevar ? 'Para llevar' : t)}</b>
            <small>${llevar ? 'Pedido nuevo' : o ? statusLabel(orderStatus(o)) + ' · ' + money(orderTotal(o)) : 'Libre'}</small>
          </button>`;
        }).join('')}
      </div>
      <p class="muted" style="font-size:12.5px">Las mesas marcadas ya tienen comanda abierta: al tocarlas se le agregan productos.</p>
    </div>`, 'wide');
}

const esParaLlevar = (mesa) => mesa === 'Para llevar';

function chooseTable(t) {
  const abierta = dayOrders().find((o) => !o.paid && o.table === t);
  closeModal();
  if (abierta && !esParaLlevar(t)) { editOrder(abierta.id); return; }
  draft = { orderId:null, table:t, customer:'', items:[], people:['Plato 1'], person:'Plato 1' };
  menuFilter = { cat:'TODO', q:'' };
  // Un pedido para llevar necesita a dónde va antes de empezar a capturarlo.
  if (esParaLlevar(t)) pedirDatosEntrega(true);
  else openBuilder();
}

/**
 * Datos de entrega. `alEmpezar` es true cuando se está levantando el pedido:
 * al guardar se abre el menú; si no, solo se actualiza lo que ya se capturó.
 */
function pedirDatosEntrega(alEmpezar) {
  const d = draft.delivery || {};
  openModal(`${modalHead('Pedido para llevar', '¿A dónde va?')}
    <div class="modal-body">
      <div class="field"><label>¿A nombre de quién?</label>
        <input id="enNombre" placeholder="Nombre del cliente" value="${esc(draft.customer || '')}"></div>
      <div class="field"><label>Teléfono <i class="opt">opcional</i></label>
        <input id="enTel" type="tel" inputmode="tel" placeholder="10 dígitos" value="${esc(d.phone || '')}"></div>
      <div class="field"><label>Dirección <i class="opt">opcional</i></label>
        <textarea id="enDir" placeholder="Calle, número, colonia">${esc(d.address || '')}</textarea></div>
      <div class="field"><label>Referencias o indicaciones <i class="opt">opcional</i></label>
        <input id="enRef" placeholder="Ej. casa blanca, portón negro, tocar el timbre" value="${esc(d.notes || '')}"></div>
      <div class="field"><label>¿Cómo se entrega?</label>
        <div class="seg2" id="enTipo">
          ${['Pasan por él', 'A domicilio'].map((t) => `
            <button class="${(d.mode || 'Pasan por él') === t ? 'on' : ''}" data-modo="${t}"
              onclick="elegirModoEntrega(this)">${t}</button>`).join('')}
        </div>
      </div>

      <div id="enDomicilio" class="bloque-domicilio ${(d.mode || 'Pasan por él') === 'A domicilio' ? '' : 'hidden'}">
        <p class="lbl" style="margin-bottom:10px">${icon('bag', 15)} Servicio a domicilio</p>
        <div class="field-grid two">
          <div class="field"><label>Costo del envío</label>
            <input id="enCosto" type="number" inputmode="numeric" min="0" placeholder="$0"
                   value="${d.fee != null ? d.fee : ''}" oninput="previoEnvio()"></div>
          <div class="field"><label>Hora aproximada <i class="opt">opcional</i></label>
            <input id="enHora" placeholder="Ej. 8:30 pm" value="${esc(d.eta || '')}"></div>
        </div>
        <div class="field" style="margin-top:12px"><label>¿Quién lo lleva? <i class="opt">opcional</i></label>
          <input id="enRepartidor" placeholder="Nombre de quien reparte" value="${esc(d.courier || '')}"></div>
        <div class="total-line" style="margin-top:12px">
          <span>Productos ${money(draft.items.reduce((t, i) => t + i.price * i.qty, 0))} + envío</span>
          <b id="enTotal">${money(draft.items.reduce((t, i) => t + i.price * i.qty, 0) + Number(d.fee || 0))}</b>
        </div>
      </div>
    </div>
    <div class="modal-foot">
      ${alEmpezar ? `<button class="btn btn-line" onclick="closeModal()">Cancelar</button>`
                  : `<button class="btn btn-line" onclick="closeModal()">Cerrar</button>`}
      <button class="btn btn-primary" onclick="guardarDatosEntrega(${!!alEmpezar})">
        ${alEmpezar ? 'Continuar' : 'Guardar'}</button>
    </div>`);
}

/** Al cambiar de modo se muestra u oculta el apartado de domicilio. */
function elegirModoEntrega(btn) {
  $$('#enTipo button').forEach((b) => b.classList.remove('on'));
  btn.classList.add('on');
  $('#enDomicilio').classList.toggle('hidden', btn.dataset.modo !== 'A domicilio');
  previoEnvio();
}
/** Actualiza el total mientras se escribe el costo del envío. */
function previoEnvio() {
  const el = $('#enTotal');
  if (!el) return;
  const productos = draft.items.reduce((t, i) => t + i.price * i.qty, 0);
  el.textContent = money(productos + Number(($('#enCosto') || {}).value || 0));
}

function guardarDatosEntrega(alEmpezar) {
  const nombre = $('#enNombre').value.trim();
  if (!nombre) { toast('Ponle al menos un nombre al pedido', 'err'); return; }
  const activo = [...$$('#enTipo button')].find((b) => b.classList.contains('on'));

  const modo = activo ? activo.dataset.modo : 'Pasan por él';
  const aDomicilio = modo === 'A domicilio';

  draft.customer = nombre;
  draft.delivery = {
    phone:   $('#enTel').value.trim(),
    address: $('#enDir').value.trim(),
    notes:   $('#enRef').value.trim(),
    mode:    modo,
    // Lo del domicilio solo se guarda si aplica.
    fee:      aDomicilio ? Number($('#enCosto').value || 0) : 0,
    eta:      aDomicilio ? $('#enHora').value.trim() : '',
    courier:  aDomicilio ? $('#enRepartidor').value.trim() : '',
  };
  if (aDomicilio && !draft.delivery.address) { toast('Un envío a domicilio necesita dirección', 'err'); return; }
  closeModal();
  if (alEmpezar) openBuilder();
  else renderTicket();
}

/** Resumen corto para las tarjetas y los tickets. */
function textoEntrega(o) {
  const d = o.delivery;
  if (!d) return '';
  const envio = envioDe(o) ? 'envío ' + money(envioDe(o)) : '';
  return [d.mode, d.phone, d.address, d.notes, envio].filter(Boolean).join(' · ');
}

function editOrder(id) {
  const o = allOrders().find((x) => x.id === id);
  if (!o) return;
  const people = orderPeople(o);
  draft = {
    orderId:o.id, table:o.table, customer:o.customer || '',
    delivery:o.delivery ? { ...o.delivery } : null,
    items:JSON.parse(JSON.stringify(o.items)),
    people: people.length ? people : ['Plato 1'],
    person: people.length ? people[0] : 'Plato 1',
  };
  menuFilter = { cat:'TODO', q:'' };
  openBuilder();
}

function openBuilder() {
  document.body.style.overflow = 'hidden';
  $('#sheetRoot').innerHTML = `
    <div class="sheet-backdrop">
      <div class="sheet">
        <div class="sheet-head">
          <div style="display:flex;align-items:center;gap:12px;min-width:0">
            <button class="close-x" onclick="closeSheet()">${icon('back', 18)}</button>
            <div style="min-width:0">
              <p class="eyebrow red">${draft.orderId ? 'Editar comanda' : 'Nueva comanda'}</p>
              <h3 id="builderTitle">${esc(draft.table)}</h3>
            </div>
          </div>
          ${esParaLlevar(draft.table)
            ? `<button class="btn btn-soft btn-sm" onclick="pedirDatosEntrega(false)">${icon('bag', 15)} Datos de entrega</button>`
            : `<button class="btn btn-line btn-sm" onclick="pickTable()">${icon('table', 15)} Cambiar mesa</button>`}
        </div>

        <div class="sheet-body">
          <div class="menu-pane">
            <div class="people-bar" id="peopleBar"></div>

            <div class="search-box">
              ${icon('search', 18)}
              <input class="input" id="prodSearch" placeholder="Buscar producto…" value="${esc(menuFilter.q)}"
                     oninput="setMenuQuery(this.value)" autocomplete="off">
            </div>
            <div class="cat-tabs" id="catTabs"></div>
            <div id="menuGrid"></div>
          </div>

          <aside class="ticket-pane" id="ticketPane">
            <div class="tk-toggle">
              <i class="grip"></i>
              <button class="tk-expand" onclick="toggleTicket()">
                ${icon('chev', 16)}<b>Ticket</b><span class="tk-count" id="tkCountM">0</span>
                <span class="tk-sum" id="tkSumM">$0</span>
              </button>
              <button class="btn btn-primary" onclick="saveOrder()">${draft.orderId ? 'Guardar' : 'Enviar'}</button>
            </div>

            <div class="tk-head">${icon('receipt', 18)}<b>Ticket</b><span class="tk-count" id="tkCount">0</span></div>
            <div class="tk-body" id="tkBody"></div>
            <div class="tk-foot">
              <div class="tk-line hidden" id="tkEnvio"></div>
              <div class="tk-line"><span id="tkPieces">0 piezas</span><span id="tkTable">${esc(draft.table)}</span></div>
              <div class="tk-total"><span>Total</span><b id="tkTotal">$0</b></div>
              <button class="btn btn-primary btn-lg full" onclick="saveOrder()">
                ${draft.orderId ? icon('check', 18) + ' Guardar cambios' : icon('fire', 18) + ' Enviar a cocina'}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>`;
  renderPeopleBar();
  renderMenu();
  renderTicket();
}

/* ---------- Platos / personas ----------------------------------------- */
const personTotal = (name) => draft.items.filter((i) => i.person === name).reduce((s, i) => s + i.price * i.qty, 0);

function renderPeopleBar() {
  const bar = $('#peopleBar');
  if (!bar) return;
  bar.innerHTML = `
    <span class="pb-label">${icon('users', 15)} Separar por plato</span>
    ${draft.people.map((nombre) => `
      <button class="person-chip ${draft.person === nombre ? 'on' : ''}" onclick="setPerson('${esc(nombre)}')">
        <span>${esc(nombre)}</span><i>${money(personTotal(nombre))}</i>
      </button>`).join('')}
    <button class="person-add" onclick="addPerson()">${icon('plus', 14)} Otro plato</button>
    ${draft.people.length > 1 ? `<button class="person-edit" onclick="renamePerson()" title="Renombrar o quitar">${icon('edit', 14)}</button>` : ''}`;
}
function setPerson(nombre) { draft.person = nombre; renderPeopleBar(); renderMenu(); }
function addPerson() {
  let n = draft.people.length + 1;
  while (draft.people.includes('Plato ' + n)) n++;
  draft.people.push('Plato ' + n);
  draft.person = 'Plato ' + n;
  renderPeopleBar();
  renderTicket();
}
function renamePerson() {
  const actual = draft.person;
  const usados = draft.items.filter((i) => i.person === actual).length;
  openModal(`${modalHead('Plato / persona', actual)}
    <div class="modal-body">
      <div class="field"><label>¿Cómo le decimos?</label>
        <input id="pnName" value="${esc(actual)}" placeholder="Ej. Papá, niño, mesa chica"></div>
      <p class="muted" style="font-size:12.5px">${usados ? `Tiene ${usados} producto${usados === 1 ? '' : 's'}; al renombrarlo se actualizan.` : 'Todavía no tiene productos.'}</p>
    </div>
    <div class="modal-foot">
      ${draft.people.length > 1 ? `<button class="btn btn-danger" onclick="removePerson()">${icon('trash', 15)} Quitar</button>` : ''}
      <button class="btn btn-line" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="savePersonName()">Guardar</button>
    </div>`);
}
function savePersonName() {
  const nuevo = $('#pnName').value.trim();
  const actual = draft.person;
  if (!nuevo) { toast('Ponle un nombre', 'err'); return; }
  if (nuevo !== actual && draft.people.includes(nuevo)) { toast('Ya hay otro plato con ese nombre', 'err'); return; }
  draft.people = draft.people.map((x) => (x === actual ? nuevo : x));
  draft.items.forEach((i) => { if (i.person === actual) i.person = nuevo; });
  draft.person = nuevo;
  closeModal();
  renderPeopleBar();
  renderTicket();
}
function removePerson() {
  const actual = draft.person;
  const usados = draft.items.filter((i) => i.person === actual).length;
  if (usados && !confirm(`Se van a quitar los ${usados} productos de "${actual}". ¿Continuar?`)) return;
  draft.items = draft.items.filter((i) => i.person !== actual);
  draft.people = draft.people.filter((x) => x !== actual);
  if (!draft.people.length) draft.people = ['Plato 1'];
  draft.person = draft.people[0];
  closeModal();
  renderPeopleBar();
  renderTicket();
}

/* ---------- Menú y ticket ---------------------------------------------- */
function setMenuQuery(q) { menuFilter.q = q; renderMenu(); }
function setMenuCat(i) { menuFilter.cat = menuCats[i]; renderMenu(); }
function applyTablePick() {
  draft.customer = $('#custName').value.trim();
  closeModal();
  renderTicket();
}

function renderMenu() {
  const products = DB.get('products', []).filter((p) => p.active);
  const cats = ['TODO', ...new Set(products.map((p) => p.category))];
  menuCats = cats;
  $('#catTabs').innerHTML = cats.map((c, i) =>
    `<button class="chip ${menuFilter.cat === c ? 'on red' : ''}" onclick="setMenuCat(${i})">${c === 'TODO' ? 'Todo' : esc(c)}</button>`).join('');

  const q = menuFilter.q.trim().toLowerCase();
  const shown = products.filter((p) =>
    (menuFilter.cat === 'TODO' || p.category === menuFilter.cat) &&
    (!q || p.name.toLowerCase().includes(q)));

  if (!shown.length) {
    $('#menuGrid').innerHTML = `<div class="empty" style="padding:30px"><strong>Sin resultados</strong>Prueba con otro nombre.</div>`;
    return;
  }
  const groups = [...new Set(shown.map((p) => p.category))];
  $('#menuGrid').innerHTML = groups.map((c) => `
    <div class="cat-title">${esc(c)}</div>
    <div class="product-grid">${shown.filter((p) => p.category === c).map((p) => {
      // El contador muestra lo que lleva el plato activo.
      const inBag = draft.items.filter((i) => i.productId === p.id && i.person === draft.person).reduce((s, i) => s + i.qty, 0);
      return `<button class="product-btn" onclick="addItem('${p.id}')">
        ${inBag ? `<em class="inbag">${inBag}</em>` : ''}
        <strong>${esc(p.name)}</strong><span>${money(p.price)}</span></button>`;
    }).join('')}</div>`).join('');
}

function renderTicket() {
  const body = $('#tkBody');
  if (!body) return;
  const productos = draft.items.reduce((s, i) => s + i.price * i.qty, 0);
  const envio = Number((draft.delivery && draft.delivery.fee) || 0);
  const total = productos + envio;
  const pieces = draft.items.reduce((s, i) => s + i.qty, 0);
  const fila = (i) => `
    <div class="ticket-row">
      <div style="min-width:0">
        <div class="tr-name">${esc(i.name)}</div>
        <button class="tr-note" onclick="editItemNote('${i.id}')">
          ${icon('edit', 12)}<span>${i.note ? esc(i.note) : 'Nota para cocina'}</span>
        </button>
      </div>
      <div class="tr-right">
        <span class="tr-price">${money(i.price * i.qty)}</span>
        <span class="qty">
          <button onclick="changeQty('${i.id}',-1)">−</button><b>${i.qty}</b><button onclick="changeQty('${i.id}',1)">+</button>
        </span>
      </div>
    </div>`;

  if (!draft.items.length) {
    body.innerHTML = `<div class="empty" style="padding:30px 16px;border:0;background:transparent">
      <div class="em-ic">${icon('bag', 22)}</div><strong>Ticket vacío</strong>Toca un producto del menú.</div>`;
  } else {
    body.innerHTML = draft.people.map((nombre) => {
      const suyos = draft.items.filter((i) => i.person === nombre);
      if (!suyos.length) return '';
      return `<div class="tk-group">
        <div class="tk-group-head"><span>${esc(nombre)}</span><b>${money(personTotal(nombre))}</b></div>
        ${suyos.map(fila).join('')}
      </div>`;
    }).join('');
  }

  const lineaEnvio = $('#tkEnvio');
  if (lineaEnvio) {
    lineaEnvio.classList.toggle('hidden', !envio);
    if (envio) lineaEnvio.innerHTML = `<span>Servicio a domicilio</span><b>${money(envio)}</b>`;
  }
  $('#tkTotal').textContent = money(total);
  $('#tkSumM').textContent = money(total);
  $('#tkPieces').textContent = pieces + (pieces === 1 ? ' pieza' : ' piezas');
  $('#tkCount').textContent = pieces;
  $('#tkCountM').textContent = pieces;
  $('#tkTable').textContent = draft.table;
  $('#builderTitle').textContent = draft.table + (draft.customer ? ' · ' + draft.customer : '');
  renderPeopleBar();
  renderMenu();
}
function toggleTicket() { $('#ticketPane')?.classList.toggle('open'); }

function addItem(pid) {
  const p = DB.get('products', []).find((x) => x.id === pid);
  if (!p) return;
  const same = draft.items.find((i) => i.productId === pid && i.person === draft.person && !i.note && i.status === 'pending');
  if (same) same.qty++;
  else draft.items.push({ id:uid(), productId:p.id, name:p.name, price:p.price, qty:1, person:draft.person, note:'', status:'pending' });
  renderTicket();
}
function changeQty(id, d) {
  const i = draft.items.find((x) => x.id === id);
  if (!i) return;
  i.qty += d;
  if (i.qty <= 0) draft.items = draft.items.filter((x) => x.id !== id);
  renderTicket();
}
function editItemNote(id) {
  const i = draft.items.find((x) => x.id === id);
  if (!i) return;
  openModal(`${modalHead('Nota para cocina', i.name)}
    <div class="modal-body">
      <div class="field"><label>¿Algo especial?</label>
        <textarea id="itNote" placeholder="Ej. sin cebolla, bien dorado, salsa aparte">${esc(i.note)}</textarea></div>
    </div>
    <div class="modal-foot">
      <button class="btn btn-line" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="saveItemNote('${id}')">Guardar</button>
    </div>`);
}
function saveItemNote(id) {
  const i = draft.items.find((x) => x.id === id);
  if (i) i.note = $('#itNote').value.trim();
  closeModal();
  renderTicket();
}
function pickTable() {
  const busy = dayOrders().filter((o) => !o.paid && o.id !== draft.orderId).map((o) => o.table);
  openModal(`${modalHead('Ubicación', 'Selecciona la mesa')}
    <div class="modal-body">
      <div class="chips" style="gap:9px">
        ${getTables().map((t) => `<button class="chip ${draft.table === t ? 'on red' : ''}" ${busy.includes(t) && t !== 'Para llevar' ? 'disabled style="opacity:.4"' : ''}
            onclick="setTable('${t}')">${esc(t)}${busy.includes(t) && t !== 'Para llevar' ? ' · ocupada' : ''}</button>`).join('')}
      </div>
      <div class="field"><label>Nombre del cliente (opcional)</label>
        <input id="custName" placeholder="Útil para pedidos para llevar" value="${esc(draft.customer)}"></div>
    </div>
    <div class="modal-foot"><button class="btn btn-primary" onclick="applyTablePick()">Listo</button></div>`);
}
function setTable(t) {
  draft.table = t;
  $$('.modal .chip').forEach((c) => c.classList.remove('on', 'red'));
  [...$$('.modal .chip')].find((c) => c.textContent.trim().startsWith(t))?.classList.add('on', 'red');
}

function saveOrder() {
  if (!draft.items.length) { toast('Agrega por lo menos un producto', 'err'); return; }
  const orders = allOrders();
  if (draft.orderId) {
    const o = orders.find((x) => x.id === draft.orderId);
    o.items = draft.items; o.table = draft.table; o.customer = draft.customer;
    o.delivery = draft.delivery || null;
    o.updatedAt = new Date().toISOString();
  } else {
    orders.push({
      id:uid(),
      folio:String(orders.filter((o) => o.date === todayKey()).length + 1).padStart(3, '0'),
      date:todayKey(), table:draft.table, customer:draft.customer,
      delivery:draft.delivery || null,
      createdAt:new Date().toISOString(), createdTime:hourMin(),
      waiter:session.label, items:draft.items, paid:false,
    });
  }
  DB.set('orders', orders);
  const wasEdit = !!draft.orderId;
  closeSheet();
  toast(wasEdit ? 'Comanda actualizada' : 'Comanda enviada a cocina', 'ok');
  if (currentPage !== 'orders') go('orders'); else refresh();
}

function viewOrder(id) {
  const o = allOrders().find((x) => x.id === id);
  if (!o) return;
  openModal(`${modalHead('Ticket #' + o.folio, o.table)}
    <div class="modal-body">
      <div class="tk-line"><span>${esc(o.createdTime)} · ${esc(o.waiter || '—')}</span><span class="status ${orderStatus(o)}">${statusLabel(orderStatus(o))}</span></div>
      ${o.delivery ? `<div class="entrega-aviso">${icon('bag', 15)}
        <div><b>Para llevar · ${esc(o.delivery.mode || '')}</b>
          ${o.customer ? `<span>${esc(o.customer)}</span>` : ''}
          ${o.delivery.phone ? `<span>Tel. ${esc(o.delivery.phone)}</span>` : ''}
          ${o.delivery.address ? `<span>${esc(o.delivery.address)}</span>` : ''}
          ${o.delivery.notes ? `<span>${esc(o.delivery.notes)}</span>` : ''}</div></div>` : ''}
      ${orderPeople(o).map((nombre) => `
        <div class="tk-group-head" style="margin-top:10px"><span>${esc(nombre)}</span>
          <b>${money(o.items.filter((i) => itemPerson(i) === nombre).reduce((s, i) => s + i.price * i.qty, 0))}</b></div>
        ${o.items.filter((i) => itemPerson(i) === nombre).map((i) => `<div class="kv"><span>${i.qty} × ${esc(i.name)}${i.note ? `<br><small class="muted">${esc(i.note)}</small>` : ''}</span><b>${money(i.qty * i.price)}</b></div>`).join('')}`).join('')}
      ${envioDe(o) ? `<div class="kv"><span>Productos</span><b>${money(orderItems$(o))}</b></div>
        <div class="kv"><span>Servicio a domicilio</span><b>${money(envioDe(o))}</b></div>` : ''}
      <div class="total-line"><span>Total</span><b>${money(orderTotal(o))}</b></div>
      ${o.payment ? `<div class="kv"><span>Pago (${esc(o.payment.method)})</span><b>${money(o.payment.received)}</b></div>
        <div class="kv"><span>Cambio</span><b>${money(o.payment.change)}</b></div>
        <div class="kv"><span>Hora de cobro</span><b>${esc(o.payment.time)}</b></div>` : ''}
    </div>
    <div class="modal-foot">
      <button class="btn btn-wa" onclick="closeModal(); enviarWhatsApp('${o.id}')">${icon('users', 16)} WhatsApp</button>
      <button class="btn btn-line" onclick="imprimirTicket('${o.id}')">${icon('print', 16)} Imprimir</button>
      <button class="btn btn-primary" onclick="closeModal()">Cerrar</button>
    </div>`);
}

/* =========================================================================
   Enviar la comanda por WhatsApp
   -------------------------------------------------------------------------
   Se abre WhatsApp con el mensaje ya escrito. No hace falta ninguna cuenta de
   empresa ni conectar nada: funciona en el celular y en la computadora.
   ========================================================================= */

/** Deja el número como lo espera WhatsApp: país + 10 dígitos, sin signos. */
function telWhatsApp(numero) {
  const d = String(numero || '').replace(/\D/g, '');
  if (!d) return '';
  if (d.length === 10) return '52' + d;                 // México, lo normal aquí
  if (d.length === 11 && d.startsWith('1')) return '52' + d.slice(1);
  return d;                                             // ya viene con país
}

/** Arma el texto del pedido, con los asteriscos que WhatsApp pone en negritas. */
function mensajeComanda(o) {
  const L = [];
  const paraLlevar = !!o.delivery;

  L.push('*' + bizName().toUpperCase() + '*');
  L.push(paraLlevar ? `Pedido para llevar · #${o.folio}` : `${o.table} · #${o.folio}`);
  L.push(`${dateText(new Date(o.createdAt))} · ${o.createdTime}`);
  L.push('');

  if (paraLlevar || o.customer) {
    if (o.customer) L.push(`*Cliente:* ${o.customer}`);
    if (o.delivery) {
      if (o.delivery.mode) L.push(`*Entrega:* ${o.delivery.mode}`);
      if (o.delivery.eta) L.push(`*Hora aprox.:* ${o.delivery.eta}`);
      if (o.delivery.courier) L.push(`*Lo lleva:* ${o.delivery.courier}`);
      if (o.delivery.phone) L.push(`*Teléfono:* ${o.delivery.phone}`);
      if (o.delivery.address) L.push(`*Dirección:* ${o.delivery.address}`);
      if (o.delivery.notes) L.push(`*Referencias:* ${o.delivery.notes}`);
    }
    L.push('');
  }

  L.push('*PEDIDO*');
  const platos = orderPeople(o);
  platos.forEach((plato) => {
    const suyos = o.items.filter((i) => itemPerson(i) === plato);
    if (!suyos.length) return;
    if (platos.length > 1) L.push(`_${plato}_`);
    suyos.forEach((i) => {
      L.push(`• ${i.qty} × ${i.name} — ${money(i.price * i.qty)}${i.note ? ` (${i.note})` : ''}`);
    });
  });

  if (envioDe(o)) {
    L.push('');
    L.push(`Productos — ${money(orderItems$(o))}`);
    L.push(`Servicio a domicilio — ${money(envioDe(o))}`);
  }
  L.push('');
  L.push(`*TOTAL: ${money(orderTotal(o))}*`);
  if (o.paid && o.payment) {
    L.push(`Pagado con ${o.payment.method.toLowerCase()}` +
      (o.payment.change > 0 ? ` · cambio ${money(o.payment.change)}` : ''));
  } else {
    L.push('_Pendiente de cobro_');
  }
  return L.join('\n');
}

function abrirWhatsApp(numero, texto) {
  const base = numero ? 'https://wa.me/' + numero : 'https://wa.me/';
  window.open(base + '?text=' + encodeURIComponent(texto), '_blank');
}

/** Elige a quién mandárselo: al repartidor guardado, al cliente, o a otro contacto. */
function enviarWhatsApp(oid) {
  const o = allOrders().find((x) => x.id === oid);
  if (!o) return;
  const texto = mensajeComanda(o);
  const repartidor = telWhatsApp(DB.get('waReparto', ''));
  const cliente = o.delivery ? telWhatsApp(o.delivery.phone) : '';

  openModal(`${modalHead('Enviar por WhatsApp', (o.delivery ? 'Para llevar' : o.table) + ' · #' + o.folio)}
    <div class="modal-body">
      <pre class="wa-vista">${esc(texto)}</pre>
      <div class="grid" style="gap:8px">
        ${repartidor ? `<button class="btn btn-success full" onclick="closeModal(); abrirWhatsApp('${repartidor}', WA_TEXTO)">
            ${icon('users', 16)} Mandar a quien reparte</button>` : ''}
        ${cliente ? `<button class="btn btn-line full" onclick="closeModal(); abrirWhatsApp('${cliente}', WA_TEXTO)">
            ${icon('user', 16)} Mandar al cliente (${esc(o.delivery.phone)})</button>` : ''}
        <button class="btn ${repartidor || cliente ? 'btn-line' : 'btn-success'} full"
                onclick="closeModal(); abrirWhatsApp('', WA_TEXTO)">
          ${icon('search', 16)} Elegir contacto en WhatsApp</button>
        <button class="btn btn-line full" onclick="copiarComanda()">${icon('receipt', 16)} Copiar el texto</button>
      </div>
      ${!repartidor ? `<p class="muted" style="font-size:12px">
        En <b>Ajustes → Datos del negocio</b> puedes guardar el WhatsApp de quien reparte para
        mandárselo de un toque.</p>` : ''}
    </div>`, 'wide');
  WA_TEXTO = texto;
}

let WA_TEXTO = '';
function copiarComanda() {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(WA_TEXTO).then(
      () => toast('Texto copiado', 'ok'),
      () => toast('No se pudo copiar', 'err'));
  } else {
    toast('No se pudo copiar', 'err');
  }
}

/* =========================================================================
   Ticket impreso
   -------------------------------------------------------------------------
   Antes se mandaba a imprimir la pantalla completa y salía la ventana encima
   del sistema. Ahora se arma un ticket angosto, del ancho de las impresoras
   de caja (80 mm), y se manda solo eso.
   ========================================================================= */
/** Imprime un corte guardado como hoja, no la pantalla completa. */
function imprimirCorte(id) {
  const x = DB.get('cuts', []).find((c) => c.id === id);
  if (!x) return;
  const productos = x.products || topProducts(dayOrders(x.date), 500);
  const gastos = x.expenseList || dayExpenses(x.date);
  // Se reutiliza el mismo documento de los reportes, con el detalle de ese corte.
  const filas = [
    ['Concepto', 'Importe'],
    ['Ventas cobradas', x.sales],
    ['— en efectivo', x.cashSales != null ? x.cashSales : x.sales],
    ['— tarjeta y transferencia', x.cardSales || 0],
    ['Sin cobrar', x.pending || 0],
    ['Gastos', x.expenses],
    ['Utilidad', x.utility],
    ['Fondo inicial', x.initial],
    ['Efectivo que debe haber', x.expected],
    ['Efectivo contado', x.counted],
    ['Diferencia', x.difference],
  ];
  const html = documentoReporte(
    'Corte del ' + cutDayLabel(x) + ' · ' + x.time,
    `<section><h2>Cierre de caja</h2>${tablaPDF(filas, [1])}</section>
     <section><h2>Venta por producto</h2>${tablaPDF(
        [['Producto', 'Piezas', 'Importe']].concat(productos.map((p2) => [p2.name, p2.qty, p2.amount])), [2])}</section>
     <section><h2>Gastos del día</h2>${tablaPDF(
        [['Hora', 'Categoría', 'Descripción', 'Responsable', 'Importe']]
          .concat(gastos.map((g) => [g.time, g.category || 'Otros', g.description, g.responsible, g.amount])), [4])}</section>`);
  imprimirDocumento(html, 'corte-' + x.date);
}

function imprimirTicket(oid) {
  const o = allOrders().find((x) => x.id === oid);
  if (!o) return;

  const linea = (izq, der, clase) =>
    `<div class="ln ${clase || ''}"><span>${izq}</span><b>${der}</b></div>`;

  const platos = orderPeople(o);
  const cuerpo = platos.map((plato) => {
    const suyos = o.items.filter((i) => itemPerson(i) === plato);
    if (!suyos.length) return '';
    return (platos.length > 1 ? `<div class="plato">${esc(plato)}</div>` : '') +
      suyos.map((i) => `
        <div class="art">
          <span class="cant">${i.qty}</span>
          <span class="nom">${esc(i.name)}${i.note ? `<em>${esc(i.note)}</em>` : ''}</span>
          <b>${money(i.price * i.qty)}</b>
        </div>`).join('');
  }).join('');

  const en = o.delivery;
  const pg = o.payment;

  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8">
<title>Ticket ${esc(o.folio)}</title>
<style>
  @page{ size:80mm auto; margin:4mm; }
  *{box-sizing:border-box}
  body{
    margin:0;width:72mm;font-family:"Segoe UI",Arial,Helvetica,sans-serif;
    font-size:11.5px;line-height:1.35;color:#000;
    -webkit-print-color-adjust:exact;print-color-adjust:exact;
  }
  @media screen{
    body{width:auto;max-width:320px;margin:18px auto;padding:16px;background:#fff;
         box-shadow:0 4px 24px rgba(0,0,0,.12);border-radius:10px}
  }
  .cab{text-align:center;margin-bottom:8px}
  .cab h1{margin:0;font-size:15px;letter-spacing:.08em;text-transform:uppercase}
  .cab p{margin:2px 0 0;font-size:10px}
  .sep{border-top:1px dashed #000;margin:7px 0}
  .datos{font-size:10.5px}
  .datos div{display:flex;justify-content:space-between;gap:8px}
  .plato{font-size:10px;font-weight:800;text-transform:uppercase;margin:6px 0 2px;letter-spacing:.04em}
  .art{display:flex;gap:6px;align-items:flex-start;margin-bottom:3px}
  .art .cant{min-width:16px;font-weight:800}
  .art .nom{flex:1;word-break:break-word}
  .art .nom em{display:block;font-style:normal;font-size:9.5px;opacity:.75}
  .art b{white-space:nowrap;font-variant-numeric:tabular-nums}
  .ln{display:flex;justify-content:space-between;gap:8px;margin-bottom:2px}
  .ln b{font-variant-numeric:tabular-nums}
  .ln.total{font-size:15px;font-weight:800;margin:5px 0}
  .entrega{font-size:10.5px;margin-top:6px}
  .entrega b{display:block;text-transform:uppercase;font-size:10px;letter-spacing:.04em}
  .pie{text-align:center;margin-top:10px;font-size:10px}
  .pie .gracias{font-weight:800;font-size:12px;margin-bottom:2px}
  .pie .lema{font-size:10.5px;margin-bottom:5px}
  .pie .chico{font-size:9.5px;opacity:.7}
</style></head><body>

  <div class="cab">
    <h1>${esc(bizName())}</h1>
    <p>Ticket #${esc(o.folio)}</p>
  </div>

  <div class="sep"></div>
  <div class="datos">
    <div><span>${esc(o.table)}</span><span>${esc(o.createdTime)}</span></div>
    <div><span>${esc(dateText(new Date(o.createdAt)))}</span></div>
    ${o.waiter ? `<div><span>Atendió</span><span>${esc(o.waiter)}</span></div>` : ''}
    ${o.customer ? `<div><span>Cliente</span><span>${esc(o.customer)}</span></div>` : ''}
  </div>

  <div class="sep"></div>
  ${cuerpo}
  <div class="sep"></div>

  ${envioDe(o) ? linea('Productos', money(orderItems$(o))) +
                 linea('Servicio a domicilio', money(envioDe(o))) : ''}
  ${linea('TOTAL', money(orderTotal(o)), 'total')}

  ${pg ? `<div class="sep"></div>
    ${linea(esc(pg.method), money(pg.received))}
    ${pg.change > 0 ? linea('Cambio', money(pg.change)) : ''}
    <div class="datos"><div><span>Cobró</span><span>${esc(pg.cashier || '')} · ${esc(pg.time || '')}</span></div></div>`
   : `<div class="sep"></div><div class="ln"><span>Pendiente de cobro</span><b></b></div>`}

  ${en ? `<div class="sep"></div>
    <div class="entrega">
      <b>Para llevar${en.mode ? ' · ' + esc(en.mode) : ''}</b>
      ${en.phone ? `<div>Tel. ${esc(en.phone)}</div>` : ''}
      ${en.address ? `<div>${esc(en.address)}</div>` : ''}
      ${en.notes ? `<div>${esc(en.notes)}</div>` : ''}
      ${en.eta ? `<div>Hora aprox. ${esc(en.eta)}</div>` : ''}
    </div>` : ''}

  <div class="sep"></div>
  <div class="pie">
    <div class="gracias">¡Gracias por su preferencia!</div>
    <div class="lema">En ${esc(bizName())} es un placer atenderte</div>
    <div class="chico">${orderPieces(o)} ${orderPieces(o) === 1 ? 'pieza' : 'piezas'} · impreso ${esc(hourMin())}</div>
  </div>
</body></html>`;

  imprimirDocumento(html, 'ticket-' + o.folio);
}

/* =========================================================================
   3 · COCINA — tablero por estado
   ========================================================================= */
/**
 * Cocina ve una sola lista: las comandas que todavía tienen algo por preparar.
 * En cuanto se marcan todos los productos (o se cobra la cuenta), la comanda
 * desaparece de aquí y se queda esperando en Caja.
 */
function renderKitchen() {
  const enCocina = dayOrders()
    .filter((o) => !o.paid && orderStatus(o) !== 'ready')
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const piezas = enCocina.reduce((t, o) => t + o.items.filter((i) => !itemReady(i)).reduce((x, i) => x + i.qty, 0), 0);

  $('#pageContent').innerHTML = `
    <div class="section-head" style="margin-top:0">
      <div><h3>Por preparar</h3>
        <p>${enCocina.length ? `${enCocina.length} comanda${enCocina.length === 1 ? '' : 's'} · ${piezas} piezas pendientes` : 'Nada en espera'}</p></div>
      <div class="actions">
        ${roleAllowed('orders') ? `<button class="btn btn-line btn-sm" onclick="newOrder()">${icon('plus', 15)} Comanda</button>` : ''}
        <button class="btn btn-line btn-sm" onclick="refresh()">${icon('clock', 15)} Actualizar</button>
      </div>
    </div>

    ${enCocina.length
      ? `<div class="kitchen-grid">${enCocina.map(kitchenCard).join('')}</div>`
      : `<div class="empty"><div class="em-ic">${icon('check', 22)}</div>
          <strong>Cocina al día</strong>No hay nada por preparar. Las comandas nuevas aparecen aquí solas.</div>`}`;
}

function kitchenCard(o) {
  const mins = minutesSince(o.createdAt);
  const timerCls = mins > 20 ? 'late' : mins > 10 ? 'warn' : '';
  const listos = o.items.filter(itemReady).length;

  return `<article class="ticket-card ${mins > 20 ? 'late' : ''}">
    <div class="tc-head">
      <div><h4>${esc(o.table)}</h4>
        <small>#${esc(o.folio)} · ${esc(o.createdTime)}${o.customer ? ' · ' + esc(o.customer) : ''}</small></div>
      <span class="timer ${timerCls}">${mins} min</span>
    </div>
    ${o.delivery ? `<div class="entrega-aviso">${icon('bag', 15)}
      <div><b>Para llevar${o.delivery.mode ? ' · ' + esc(o.delivery.mode) : ''}</b>
        ${o.delivery.address ? `<span>${esc(o.delivery.address)}</span>` : ''}</div></div>` : ''}
    <div class="tc-progress">${listos} de ${o.items.length} productos listos</div>

    ${orderPeople(o).map((plato) => {
      const suyos = o.items.filter((i) => itemPerson(i) === plato);
      const listos = suyos.filter(itemReady).length;
      return `
      <div class="tc-plate ${listos === suyos.length ? 'done' : ''}">
        <span>${esc(plato)}</span><i>${listos}/${suyos.length}</i>
      </div>
      ${suyos.map((i) => `
        <button class="tc-item ${itemReady(i) ? 'done' : ''}" onclick="toggleItemReady('${o.id}','${i.id}')">
          <span class="tc-check">${icon('check', 15)}</span>
          <div>
            <p><span class="tc-qty">${i.qty}</span>${esc(i.name)}</p>
            ${i.note ? `<small>${esc(i.note)}</small>` : ''}
          </div>
        </button>`).join('')}`;
    }).join('')}

    <div class="tc-foot">
      <button class="btn btn-success btn-lg" onclick="markOrderReady('${o.id}')">
        ${icon('check', 17)} Comanda lista</button>
    </div>
  </article>`;
}

/** Un toque marca el producto como listo; otro lo regresa a pendiente. */
function toggleItemReady(oid, iid) {
  const os = allOrders(), o = os.find((x) => x.id === oid), i = o && o.items.find((x) => x.id === iid);
  if (!i) return;
  i.status = itemReady(i) ? 'pending' : 'ready';
  DB.set('orders', os);
  if (o.items.every(itemReady)) toast('Comanda lista · pasa a caja', 'ok');
  refresh();
}

/** Marca toda la comanda: sale de cocina y queda esperando cobro en Caja. */
function markOrderReady(oid) {
  const os = allOrders(), o = os.find((x) => x.id === oid);
  if (!o) return;
  o.items.forEach((i) => (i.status = 'ready'));
  DB.set('orders', os);
  toast(`${o.table} lista · pasa a caja`, 'ok');
  refresh();
}

/* =========================================================================
   4 · CAJA
   ========================================================================= */
function renderCashier() {
  const st = dayStats();
  const list = [...st.open].sort((a, b) => {
    const rank = (o) => (orderStatus(o) === 'ready' ? 0 : 1);
    return rank(a) - rank(b) || new Date(a.createdAt) - new Date(b.createdAt);
  });

  $('#pageContent').innerHTML = `
    <div class="kpi-grid">
      <div class="kpi hero">
        <div class="kpi-top"><span class="kpi-label">Cobrado hoy</span><span class="kpi-ic">${icon('cash', 17)}</span></div>
        <div class="kpi-value">${money(st.sales)}</div>
        <div class="kpi-foot"><span>${st.paid.length} ticket${st.paid.length === 1 ? '' : 's'}</span></div>
      </div>
      <div class="kpi red">
        <div class="kpi-top"><span class="kpi-label">Por cobrar</span><span class="kpi-ic">${icon('receipt', 17)}</span></div>
        <div class="kpi-value">${money(st.pending)}</div>
        <div class="kpi-foot"><span>${st.open.length} comanda${st.open.length === 1 ? '' : 's'} abierta${st.open.length === 1 ? '' : 's'}</span></div>
      </div>
      <div class="kpi green">
        <div class="kpi-top"><span class="kpi-label">Listas para cobrar</span><span class="kpi-ic">${icon('check', 17)}</span></div>
        <div class="kpi-value">${st.open.filter((o) => orderStatus(o) === 'ready').length}</div>
        <div class="kpi-foot"><span>Ya salieron de cocina</span></div>
      </div>
      <div class="kpi blue">
        <div class="kpi-top"><span class="kpi-label">Efectivo esperado</span><span class="kpi-ic">${icon('wallet', 17)}</span></div>
        <div class="kpi-value">${money(st.cash)}</div>
        <div class="kpi-foot"><span>Fondo + ventas − gastos</span></div>
      </div>
    </div>

    <div class="section-head">
      <div><h3>Cuentas por cobrar</h3><p>Toda comanda entra aquí desde que se levanta; las que ya salieron de cocina van primero.</p></div>
      ${roleAllowed('orders') ? `<button class="btn btn-line btn-sm" onclick="newOrder()">${icon('plus', 15)} Nueva comanda</button>` : ''}
    </div>

    ${list.length ? `<div class="grid" style="gap:10px">${list.map((o) => `
      <div class="pay-row">
        <div class="pr-main">
          <strong>${esc(o.table)}</strong>
          <small>#${esc(o.folio)} · ${esc(o.createdTime)} · ${orderPieces(o)} piezas${o.customer ? ' · ' + esc(o.customer) : ''}</small>
          ${o.delivery ? `<small class="text-red">${esc(textoEntrega(o))}</small>` : ''}
        </div>
        <div style="display:flex;align-items:center;gap:14px">
          <span class="status ${orderStatus(o)}">${statusLabel(orderStatus(o))}</span>
          <span class="pr-total">${money(orderTotal(o))}</span>
        </div>
        <div class="pr-actions actions">
          <button class="btn btn-line btn-sm" onclick="editOrder('${o.id}')">${icon('edit', 15)} Editar</button>
          <button class="btn btn-primary" onclick="openPayment('${o.id}')">${icon('cash', 16)} Cobrar</button>
        </div>
      </div>`).join('')}</div>`
    : `<div class="empty"><div class="em-ic">${icon('check', 22)}</div><strong>Sin cobros pendientes</strong>Todo el servicio está al corriente.</div>`}

    ${st.paid.length ? `
      <div class="section-head"><div><h3>Cobros de hoy</h3><p>${st.paid.length} tickets · ${money(st.sales)}</p></div></div>
      <div class="table-wrap"><div class="scroll"><table class="data-table">
        <thead><tr><th>Hora</th><th>Mesa</th><th>Folio</th><th>Forma de pago</th><th class="r">Total</th><th></th></tr></thead>
        <tbody>${[...st.paid].reverse().map((o) => `<tr>
          <td>${esc(o.payment?.time || o.createdTime)}</td>
          <td><strong>${esc(o.table)}</strong></td>
          <td class="muted">#${esc(o.folio)}</td>
          <td>${esc(o.payment?.method || 'Efectivo')}</td>
          <td class="r money">${money(orderTotal(o))}</td>
          <td class="r"><button class="btn btn-line btn-sm" onclick="viewOrder('${o.id}')">Ver</button></td>
        </tr>`).join('')}</tbody>
      </table></div></div>` : ''}`;
}

/** Billetes sugeridos: exacto, redondeos y denominaciones útiles, sin repetir. */
function quickCash(total) {
  const opts = [total, Math.ceil(total / 50) * 50, Math.ceil(total / 100) * 100, 200, 500, 1000];
  return [...new Set(opts)].filter((v) => v >= total).sort((a, b) => a - b).slice(0, 4);
}

/**
 * Cobro en tres pasos: total → forma de pago → con cuánto paga.
 * El teclado en pantalla evita depender del teclado físico en tablet.
 */
function openPayment(oid) {
  const o = allOrders().find((x) => x.id === oid);
  if (!o) return;
  const total = orderTotal(o);
  payDraft = { orderId:oid, total, method:'Efectivo', raw:'' };

  openModal(`${modalHead('Cobro · comanda #' + o.folio, o.table)}
    <div class="modal-body pay-body">
      <div class="pay-total">
        <span>Total a cobrar</span>
        <b>${money(total)}</b>
        <small>${orderPieces(o)} piezas${o.customer ? ' · ' + esc(o.customer) : ''}</small>
      </div>
      ${o.delivery ? `<div class="entrega-aviso">${icon('bag', 15)}
        <div><b>Para llevar · ${esc(o.delivery.mode || '')}</b>
          ${o.delivery.phone ? `<span>Tel. ${esc(o.delivery.phone)}</span>` : ''}
          ${o.delivery.address ? `<span>${esc(o.delivery.address)}</span>` : ''}</div></div>` : ''}

      <div class="pay-grid">
        <div>
          <div class="pay-step"><i class="pay-step-n">1</i> ¿Cómo va a pagar?</div>
          <div class="pay-methods col" id="payMethods">
            ${PAY_METHODS.map((m) => `<button class="${m.id === 'Efectivo' ? 'on' : ''}" data-m="${m.id}"
                onclick="setMethod('${m.id}')">${icon(m.icon, 19)}<span>${m.id}</span></button>`).join('')}
          </div>
          <div class="change-box" id="changeBox"><span>Cambio</span><b id="cashChange">$0</b></div>
        </div>

        <div id="cashBlock">
          <div class="pay-step"><i class="pay-step-n">2</i> ¿Con cuánto paga?</div>
          <div class="cash-quick">
            ${quickCash(total).map((v) => `<button onclick="setCash(${v})">${v === total ? 'Exacto' : money(v)}</button>`).join('')}
          </div>
          <div class="cash-display" id="cashDisplay">$0</div>
          <div class="keypad pay-keypad">
            ${[1,2,3,4,5,6,7,8,9].map((n) => `<button class="key" onclick="payKey('${n}')">${n}</button>`).join('')}
            <button class="key" onclick="payKey('00')">00</button>
            <button class="key" onclick="payKey('0')">0</button>
            <button class="key fn" onclick="payBack()">${icon('back', 18)}</button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-foot">
      <button class="btn btn-line" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary btn-lg" id="payConfirm" onclick="completePayment()">
        ${icon('check', 17)} Cobrar ${money(total)}</button>
    </div>`, 'pay');
  syncPayment();
}

function setMethod(m) {
  payDraft.method = m;
  payDraft.raw = '';
  $$('#payMethods button').forEach((b) => b.classList.toggle('on', b.dataset.m === m));
  const cash = $('#cashBlock');
  cash.style.display = m === 'Efectivo' ? '' : 'none';
  cash.parentElement.classList.toggle('solo', m !== 'Efectivo');
  syncPayment();
}
function payKey(d) { if (payDraft.raw.length < 6) payDraft.raw += d; syncPayment(); }
function payBack() { payDraft.raw = payDraft.raw.slice(0, -1); syncPayment(); }
function setCash(v) { payDraft.raw = String(v); syncPayment(); }

/** Refresca importe recibido, cambio y el botón de confirmar. */
function syncPayment() {
  const efectivo = payDraft.method === 'Efectivo';
  const recibido = efectivo ? Number(payDraft.raw || 0) : payDraft.total;
  const falta = payDraft.total - recibido;
  const box = $('#changeBox'), btn = $('#payConfirm');

  if ($('#cashDisplay')) $('#cashDisplay').textContent = money(recibido);

  if (!efectivo) {
    box.className = 'change-box';
    box.innerHTML = `<span>Pago con ${esc(payDraft.method.toLowerCase())}</span><b>Sin cambio</b>`;
  } else if (falta > 0) {
    box.className = 'change-box err';
    box.innerHTML = `<span>Falta por recibir</span><b>${money(falta)}</b>`;
  } else {
    box.className = 'change-box ok';
    box.innerHTML = `<span>Cambio a devolver</span><b>${money(-falta)}</b>`;
  }
  btn.disabled = efectivo && falta > 0;
}

function completePayment() {
  const { orderId, total, method } = payDraft;
  const recibido = method === 'Efectivo' ? Number(payDraft.raw || 0) : total;
  if (method === 'Efectivo' && recibido < total) { toast('El efectivo recibido es menor al total', 'err'); return; }
  const os = allOrders(), o = os.find((x) => x.id === orderId);
  o.paid = true;
  o.payment = {
    method, received:recibido, change:recibido - total,
    time:hourMin(), at:new Date().toISOString(), cashier:session.label,
  };
  DB.set('orders', os);
  closeModal();
  toast(recibido > total ? `Cobrado · cambio ${money(recibido - total)}` : 'Cobro registrado', 'ok');
  refresh();
}

/* =========================================================================
   5 · GASTOS
   ========================================================================= */
let expenseCat = 'Insumos';

function renderExpenses() {
  const ex = dayExpenses();
  const total = ex.reduce((s, e) => s + Number(e.amount || 0), 0);
  const byCat = {};
  ex.forEach((e) => (byCat[e.category || 'Otros'] = (byCat[e.category || 'Otros'] || 0) + Number(e.amount || 0)));

  $('#pageContent').innerHTML = `
    <div class="grid grid-b" style="margin-top:0">
      <div class="card">
        <div class="card-head"><div><div class="card-title">Registrar un gasto</div>
          <div class="card-sub">La fecha y la hora se guardan solas.</div></div></div>

        <div class="field" style="margin-bottom:14px">
          <label>¿De qué es el gasto?</label>
          <select id="expCat">
            ${EXPENSE_CATS.map((c) => `<option ${expenseCat === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}
          </select>
        </div>

        <div class="field" style="margin-bottom:14px">
          <label>Descripción <i class="opt">opcional</i></label>
          <textarea id="expDesc" placeholder="Escribe aquí qué se compró. Ej. 10 kg de carne y 3 kg de cebolla en el mercado."></textarea>
        </div>

        <div class="field" style="margin-bottom:14px">
          <label>Cantidad</label>
          <input id="expAmount" type="number" inputmode="numeric" min="0" placeholder="$0" class="big-amount">
        </div>

        <div class="field">
          <label>¿Quién lo hizo?</label>
          <input id="expResp" placeholder="Nombre" value="${esc(session.label)}">
        </div>

        <button class="btn btn-primary btn-lg full" style="margin-top:16px" onclick="addExpense()">
          ${icon('plus', 17)} Guardar gasto</button>
      </div>

      <div class="grid" style="gap:14px;align-content:start">
        <div class="kpi red">
          <div class="kpi-top"><span class="kpi-label">Gastos de hoy</span><span class="kpi-ic">${icon('minus', 17)}</span></div>
          <div class="kpi-value">${money(total)}</div>
          <div class="kpi-foot"><span>${ex.length} movimiento${ex.length === 1 ? '' : 's'}</span></div>
        </div>
        <div class="card">
          <div class="card-title" style="margin-bottom:12px">Por categoría</div>
          ${Object.keys(byCat).length
            ? Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([c, v]) => `<div class="kv"><span>${esc(c)}</span><b>${money(v)}</b></div>`).join('')
            : `<p class="muted" style="font-size:13px">Aún no hay gastos registrados hoy.</p>`}
        </div>
      </div>
    </div>

    <div class="section-head"><div><h3>Movimientos de hoy</h3><p style="text-transform:capitalize">${dateText()}</p></div></div>
    ${ex.length ? `<div class="table-wrap"><div class="scroll"><table class="data-table">
        <thead><tr><th>Hora</th><th>Categoría</th><th>Descripción</th><th>Responsable</th><th class="r">Cantidad</th><th></th></tr></thead>
        <tbody>${[...ex].reverse().map((e) => `<tr>
          <td>${esc(e.time)}</td>
          <td><span class="tag">${esc(e.category || 'Otros')}</span></td>
          <td><strong>${esc(e.description)}</strong></td>
          <td>${esc(e.responsible)}</td>
          <td class="r money text-red">− ${money(e.amount)}</td>
          <td class="r"><div class="actions" style="justify-content:flex-end">
            ${e.items && e.items.length > 1 ? `<button class="btn btn-line btn-sm" onclick="viewExpense('${e.id}')">Ver</button>` : ''}
            <button class="btn btn-line btn-sm" onclick="deleteExpense('${e.id}')">${icon('trash', 14)}</button>
          </div></td>
        </tr>`).join('')}</tbody></table></div></div>`
      : `<div class="empty"><div class="em-ic">${icon('minus', 22)}</div><strong>Sin gastos registrados</strong>Captura el primer gasto del día.</div>`}`;
}

function addExpense() {
  expenseCat = $('#expCat').value;
  const description = $('#expDesc').value.trim() || expenseCat;   // la descripción es opcional
  const amount = Number($('#expAmount').value);
  const resp = $('#expResp').value.trim();

  if (!amount) { toast('Captura la cantidad del gasto', 'err'); return; }
  if (!resp) { toast('Indica quién hizo el gasto', 'err'); return; }

  const ex = DB.get('expenses', []);
  ex.push({ id:uid(), date:todayKey(), time:hourMin(), category:expenseCat, description, amount, responsible:resp });
  DB.set('expenses', ex);
  toast('Gasto registrado · ' + money(amount), 'ok');
  renderExpenses();
}

/** Los gastos capturados con la versión anterior traen conceptos: se pueden consultar. */
function viewExpense(id) {
  const e = DB.get('expenses', []).find((x) => x.id === id);
  if (!e) return;
  openModal(`${modalHead(e.category || 'Gasto', e.description)}
    <div class="modal-body">
      <div class="tk-line"><span>${esc(e.time)} · ${esc(e.responsible)}</span></div>
      <div>${(e.items || []).map((i) => `<div class="kv"><span>${esc(i.concept || '(sin concepto)')}</span><b>${money(i.amount)}</b></div>`).join('')}</div>
      <div class="total-line"><span>Total</span><b>${money(e.amount)}</b></div>
    </div>
    <div class="modal-foot"><button class="btn btn-primary" onclick="closeModal()">Cerrar</button></div>`);
}

function deleteExpense(id) {
  const g = DB.get('expenses', []).find((e) => e.id === id);
  if (!confirm(`¿Eliminar el gasto "${g && g.description}" por ${money(g && g.amount)}?`)) return;
  DB.set('expenses', DB.get('expenses', []).filter((e) => e.id !== id));
  toast('Gasto eliminado');
  renderExpenses();
}

/* =========================================================================
   6 · CORTE DIARIO
   ========================================================================= */
/** Números de un día, listos para el corte. */
function cutNumbers(k = todayKey()) {
  const st = dayStats(k);
  const fund = getFund(k);
  const cashSales = st.paid
    .filter((o) => (o.payment && o.payment.method || 'Efectivo') === 'Efectivo')
    .reduce((s, o) => s + orderTotal(o), 0);
  return { ...st, fund, cashSales, cardSales: st.sales - cashSales, expected: fund + cashSales - st.spent };
}

function renderCut() {
  const c = cutNumbers();
  const cuts = [...DB.get('cuts', [])].sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));

  $('#pageContent').innerHTML = `
    <div class="card" style="margin-top:0">
      <div class="field-grid two">
        <div class="field"><label>Fondo inicial de hoy</label>
          <input id="initialFund" type="number" inputmode="numeric" value="${c.fund}" onchange="updateDayFund(this.value)"></div>
        <div class="field"><label>Efectivo contado en caja</label>
          <input id="countedCash" type="number" inputmode="numeric" placeholder="0" class="big-amount" oninput="previewDifference(${c.expected})"></div>
      </div>

      <div class="divider"></div>
      <div class="kv"><span>Fondo inicial</span><b>${money(c.fund)}</b></div>
      <div class="kv"><span>+ Ventas en efectivo</span><b class="text-green">${money(c.cashSales)}</b></div>
      <div class="kv"><span>− Gastos pagados</span><b class="text-red">${money(c.spent)}</b></div>
      <div class="total-line"><span>Efectivo que debe haber</span><b>${money(c.expected)}</b></div>
      <div class="kv" style="margin-top:8px"><span>Diferencia contra lo contado</span><b id="diffPreview">${money(0)}</b></div>

      <button class="btn btn-primary btn-lg full" style="margin-top:16px" onclick="saveCut()">
        ${icon('check', 17)} Guardar corte del día</button>
    </div>

    <div class="section-head">
      <div><h3>Historial de cortes</h3><p>${cuts.length ? `${cuts.length} corte${cuts.length === 1 ? '' : 's'} guardado${cuts.length === 1 ? '' : 's'}. Toca uno para ver todo el detalle.` : 'Aquí se van guardando los cierres de cada día.'}</p></div>
    </div>

    ${cuts.length ? `<div class="table-wrap"><div class="scroll"><table class="data-table">
        <thead><tr><th>Día</th><th>Hora</th><th class="r">Ventas</th><th class="r">Gastos</th><th class="r">Utilidad</th><th class="r">Diferencia</th><th></th></tr></thead>
        <tbody>${cuts.map((x) => `<tr class="clickable" onclick="viewCut('${x.id}')">
          <td><strong style="text-transform:capitalize">${esc(cutDayLabel(x))}</strong></td>
          <td class="muted">${esc(x.time)}</td>
          <td class="r money">${money(x.sales)}</td>
          <td class="r money text-red">${money(x.expenses)}</td>
          <td class="r money text-green">${money(x.utility)}</td>
          <td class="r money ${x.difference === 0 ? 'text-green' : 'text-red'}">${x.difference > 0 ? '+' : ''}${money(x.difference)}</td>
          <td class="r"><button class="btn btn-line btn-sm" onclick="event.stopPropagation();viewCut('${x.id}')">Ver</button></td>
        </tr>`).join('')}</tbody></table></div></div>`
      : `<div class="empty"><div class="em-ic">${icon('chart', 22)}</div>
          <strong>Todavía no hay cortes</strong>Guarda el primero al cerrar el día.</div>`}`;
}

/** "sábado 28 de agosto" a partir de la fecha guardada. */
function cutDayLabel(x) {
  if (x.dateLabel) return x.dateLabel;
  const [y, m, d] = String(x.date).split('-').map(Number);
  return dateText(new Date(y, m - 1, d));
}

/** Cambia el fondo del día que se está cortando, sin tocar los días anteriores. */
function updateDayFund(v) { setFund(v); renderCut(); }
function previewDifference(expected) {
  const n = Number($('#countedCash').value || 0);
  const d = n - expected;
  const el = $('#diffPreview');
  el.textContent = (d > 0 ? '+' : '') + money(d);
  el.className = d === 0 ? 'text-green' : 'text-red';
}

function saveCut() {
  const c = cutNumbers();
  const raw = $('#countedCash').value;
  if (raw === '') { toast('Captura el efectivo contado', 'err'); return; }
  const counted = Number(raw);

  const cuts = DB.get('cuts', []);
  cuts.push({
    id:uid(), date:todayKey(), dateLabel:dateText(), time:timeText(), closedBy:session.label,
    // Números del cierre
    sales:c.sales, cashSales:c.cashSales, cardSales:c.cardSales, pending:c.pending,
    expenses:c.spent, utility:c.utility,
    initial:c.fund, expected:c.expected, counted, difference:counted - c.expected,
    ordersPaid:c.paid.length, ordersPending:c.open.length, pieces:c.pieces, ticket:c.ticket,
    // Fotografía del día, para poder consultarlo después tal como quedó
    products: topProducts(c.orders, 500),
    expenseList: c.expenses.map((e) => ({
      time:e.time, category:e.category, description:e.description,
      amount:e.amount, responsible:e.responsible,
    })),
  });
  DB.set('cuts', cuts);
  toast('Corte guardado', 'ok');
  renderCut();
}

/** Detalle completo de un corte guardado. */
function viewCut(id) {
  const x = DB.get('cuts', []).find((c) => c.id === id);
  if (!x) return;
  // Cortes viejos no traen la fotografía: se reconstruye desde las comandas de ese día.
  const products = x.products || topProducts(dayOrders(x.date), 500);
  const gastos = x.expenseList || dayExpenses(x.date);
  const totalVenta = x.sales + (x.pending || 0);

  openModal(`${modalHead('Corte guardado · ' + x.time, cutDayLabel(x))}
    <div class="modal-body">
      <div class="cut-hero" style="grid-template-columns:repeat(2,1fr)">
        <div class="cut-box dark"><span>Ventas cobradas</span><strong>${money(x.sales)}</strong></div>
        <div class="cut-box green"><span>Utilidad del día</span><strong>${money(x.utility)}</strong></div>
      </div>

      <div>
        <div class="card-title" style="margin-bottom:8px">Resumen de la venta</div>
        <div class="kv"><span>Tickets cobrados</span><b>${x.ordersPaid ?? '—'}</b></div>
        <div class="kv"><span>Piezas vendidas</span><b>${x.pieces != null ? num(x.pieces) : '—'}</b></div>
        <div class="kv"><span>Ticket promedio</span><b>${x.ticket != null ? money(x.ticket) : '—'}</b></div>
        <div class="kv"><span>Cobrado en efectivo</span><b>${money(x.cashSales ?? x.sales)}</b></div>
        <div class="kv"><span>Tarjeta / transferencia</span><b>${money(x.cardSales ?? 0)}</b></div>
        <div class="kv"><span>Quedó sin cobrar</span><b>${money(x.pending || 0)}</b></div>
        <div class="kv"><span>Gastos del día</span><b class="text-red">${money(x.expenses)}</b></div>
        <div class="kv"><span>Cerró el corte</span><b>${esc(x.closedBy || '—')}</b></div>
      </div>

      <div>
        <div class="card-title" style="margin-bottom:8px">Efectivo en caja</div>
        <div class="kv"><span>Fondo inicial</span><b>${money(x.initial)}</b></div>
        <div class="kv"><span>Debía haber</span><b>${money(x.expected)}</b></div>
        <div class="kv"><span>Se contó</span><b>${money(x.counted)}</b></div>
        <div class="total-line"><span>Diferencia</span>
          <b class="${x.difference === 0 ? 'text-green' : 'text-red'}">${x.difference > 0 ? '+' : ''}${money(x.difference)}</b></div>
      </div>

      <div>
        <div class="card-title" style="margin-bottom:8px">Venta por producto</div>
        ${products.length ? `<div class="table-wrap"><div class="scroll"><table class="data-table">
          <thead><tr><th>Producto</th><th class="r">Piezas</th><th class="r">Importe</th><th class="r">%</th></tr></thead>
          <tbody>${products.map((pr) => `<tr>
            <td>${esc(pr.name)}</td><td class="r">${pr.qty}</td><td class="r money">${money(pr.amount)}</td>
            <td class="r muted">${totalVenta ? Math.round((pr.amount / totalVenta) * 100) : 0}%</td>
          </tr>`).join('')}</tbody></table></div></div>`
          : `<p class="muted" style="font-size:13px">Sin productos registrados ese día.</p>`}
      </div>

      <div>
        <div class="card-title" style="margin-bottom:8px">Gastos del día</div>
        ${gastos.length ? `<div class="table-wrap"><div class="scroll"><table class="data-table">
          <thead><tr><th>Hora</th><th>Categoría</th><th>Descripción</th><th>Responsable</th><th class="r">Importe</th></tr></thead>
          <tbody>${gastos.map((g) => `<tr>
            <td>${esc(g.time)}</td><td><span class="tag">${esc(g.category || 'Otros')}</span></td>
            <td>${esc(g.description)}</td><td>${esc(g.responsible)}</td>
            <td class="r money text-red">− ${money(g.amount)}</td>
          </tr>`).join('')}</tbody></table></div></div>`
          : `<p class="muted" style="font-size:13px">No hubo gastos ese día.</p>`}
      </div>
    </div>
    <div class="modal-foot">
      <button class="btn btn-line" onclick="imprimirCorte('${x.id}')">${icon('print', 16)} Imprimir</button>
      <button class="btn btn-primary" onclick="closeModal()">Cerrar</button>
    </div>`, true);
}

/* =========================================================================
   7 · MENÚ Y PRECIOS
   ========================================================================= */
function renderProducts() {
  const ps = DB.get('products', []);
  const cats = [...new Set(ps.map((p) => p.category))];

  $('#pageContent').innerHTML = `
    <div class="section-head" style="margin-top:0">
      <p class="muted" style="font-size:13px">${ps.filter((p) => p.active).length} productos activos de ${ps.length}.</p>
      <button class="btn btn-primary" onclick="editProduct()">${icon('plus', 17)} Nuevo producto</button>
    </div>
    ${cats.map((c) => `
      <div class="section-head" style="margin:20px 0 10px"><div><h3 style="font-size:15px">${esc(c)}</h3></div></div>
      <div class="prod-grid">${ps.filter((p) => p.category === c).map((p) => `
        <article class="prod-card ${p.active ? '' : 'off'}">
          <div class="pc-top">
            <strong>${esc(p.name)}</strong>
            <span class="tag">${p.active ? 'Activo' : 'Oculto'}</span>
          </div>
          <div class="pc-price">${money(p.price)}</div>
          <div class="pc-actions">
            <button class="btn btn-line btn-sm" onclick="editProduct('${p.id}')">${icon('edit', 14)} Editar</button>
            <button class="btn btn-line btn-sm" onclick="toggleProduct('${p.id}')">${p.active ? 'Ocultar' : 'Activar'}</button>
          </div>
        </article>`).join('')}</div>`).join('')}`;
}
function editProduct(id) {
  const p = id ? DB.get('products', []).find((x) => x.id === id) : null;
  const cats = [...new Set(DB.get('products', []).map((x) => x.category))];
  openModal(`${modalHead(p ? 'Editar producto' : 'Nuevo producto', p ? p.name : 'Agregar al menú')}
    <div class="modal-body">
      <div class="field"><label>Nombre del producto</label>
        <input id="epName" value="${esc(p?.name || '')}" placeholder="Ej. Taco de birria"></div>
      <div class="field-grid two">
        <div class="field"><label>Precio</label>
          <input id="epPrice" type="number" inputmode="numeric" min="0" value="${p?.price ?? ''}" placeholder="0"></div>
        <div class="field"><label>Categoría</label>
          <select id="epCat">${cats.map((c) => `<option ${p?.category === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}
            <option value="__new">+ Nueva categoría…</option></select></div>
      </div>
      <div class="field hidden" id="epNewCatWrap"><label>Nombre de la categoría</label><input id="epNewCat" placeholder="Ej. POSTRES"></div>
      <div class="field"><label>Disponible en el menú</label>
        <select id="epActive"><option value="true" ${p?.active !== false ? 'selected' : ''}>Sí</option>
          <option value="false" ${p?.active === false ? 'selected' : ''}>No</option></select></div>
    </div>
    <div class="modal-foot">
      ${p ? `<button class="btn btn-danger" onclick="deleteProduct('${p.id}')">${icon('trash', 15)} Eliminar</button>` : ''}
      <button class="btn btn-line" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="saveProduct('${p?.id || ''}')">Guardar</button>
    </div>`);
  $('#epCat').onchange = (e) => $('#epNewCatWrap').classList.toggle('hidden', e.target.value !== '__new');
}
function saveProduct(id) {
  const name = $('#epName').value.trim();
  const price = Number($('#epPrice').value);
  let cat = $('#epCat').value;
  if (cat === '__new') cat = ($('#epNewCat').value.trim().replace(/['"\\<>]/g, '') || 'OTROS').toUpperCase();
  if (!name || !price) { toast('Captura nombre y precio', 'err'); return; }
  const ps = DB.get('products', []);
  const active = $('#epActive').value === 'true';
  if (id) Object.assign(ps.find((x) => x.id === id), { name, price, category:cat, active });
  else ps.push({ id:uid(), name, price, category:cat, active });
  DB.set('products', ps);
  closeModal();
  toast(id ? 'Producto actualizado' : 'Producto agregado', 'ok');
  renderProducts();
}
function toggleProduct(id) {
  const ps = DB.get('products', []);
  const p = ps.find((x) => x.id === id);
  p.active = !p.active;
  DB.set('products', ps);
  renderProducts();
}
function deleteProduct(id) {
  const p = DB.get('products', []).find((x) => x.id === id);
  if (!confirm(`¿Eliminar "${p?.name}" del menú? Las comandas ya registradas no se modifican.`)) return;
  DB.set('products', DB.get('products', []).filter((x) => x.id !== id));
  closeModal();
  toast('Producto eliminado');
  renderProducts();
}

/* =========================================================================
   8 · ADMINISTRACIÓN — perfiles, negocio y datos
   ========================================================================= */
let adminTab = 'negocio';   // negocio | reportes

function renderAdmin() {
  $('#pageContent').innerHTML = `
    <div class="subtabs">
      <button class="${adminTab === 'negocio' ? 'on' : ''}" onclick="setAdminTab('negocio')">
        ${icon('cog', 16)} Administración</button>
      <button class="${adminTab === 'reportes' ? 'on' : ''}" onclick="setAdminTab('reportes')">
        ${icon('download', 16)} Reportes y respaldo</button>
    </div>
    <div id="adminBody"></div>`;
  if (adminTab === 'negocio') renderAdminNegocio();
  else renderAdminReportes();
}
function setAdminTab(t) { adminTab = t; renderAdmin(); }

function renderAdminNegocio() {
  const users = getUsers();
  const tables = getTables().length - 1;
  const st = dayStats();
  const totalOrders = allOrders().length;

  $('#adminBody').innerHTML = `
    <div class="card" style="margin-top:16px">
      <div class="card-head">
        <div><div class="card-title">Perfiles y accesos</div>
          <div class="card-sub">Cada perfil entra con su PIN de 4 dígitos. Solo tú ves esta pantalla.</div></div>
        ${icon('key', 20, 'muted')}
      </div>
      <div class="profile-grid">
        ${Object.entries(users).map(([id, u]) => `
          <div class="profile-card">
            <span class="profile-ic">${icon(u.icon, 20)}</span>
            <div style="min-width:0;flex:1">
              <strong>${esc(u.label)}</strong>
              <div class="profile-pin">
                <span id="pin-${id}">••••</span>
                <button class="btn btn-line btn-sm" onclick="togglePin('${id}','${u.pin}')" id="pinbtn-${id}">Ver</button>
              </div>
              <div class="tab-tags">${navOf(id).map((n) => `<span class="tab-tag">${n[2]}</span>`).join('')}</div>
            </div>
            <button class="btn btn-soft btn-sm" onclick="editProfile('${id}')">${icon('edit', 14)} Editar</button>
          </div>`).join('')}
      </div>
    </div>

    <div class="card" style="margin-top:16px">
      <div class="card-head">
        <div><div class="card-title">Sincronización entre dispositivos</div>
          <div class="card-sub">Para que la mesera, la cocina y la caja vean las mismas comandas.</div></div>
        ${icon('shield', 20, 'muted')}
      </div>
      ${cloudCardBody()}
    </div>

    <div class="card" style="margin-top:16px">
      <div class="card-head">
        <div><div class="card-title">Logo del negocio</div>
          <div class="card-sub">Sube tu imagen y se usa tal cual en el login, el menú lateral y la pestaña del navegador.</div></div>
        ${icon('star', 20, 'muted')}
      </div>
      <div class="logo-row">
        <div class="logo-preview">
          <img src="${DB.get('logo', null) || 'logo.svg'}" alt="Logo actual">
        </div>
        <div style="flex:1;min-width:0">
          <p style="font-size:13.5px;font-weight:700;margin-bottom:4px">
            ${DB.get('logo', null) ? 'Estás usando tu logo.' : 'Estás usando el logo que trae el sistema.'}
          </p>
          <p class="muted" style="font-size:12.5px;margin-bottom:12px">
            Acepta PNG, JPG o WEBP. Se guarda en este navegador y entra en el respaldo.
          </p>
          <div class="actions">
            <label class="btn btn-primary" style="cursor:pointer">
              ${icon('upload', 16)} ${DB.get('logo', null) ? 'Cambiar logo' : 'Subir mi logo'}
              <input type="file" accept="image/*" class="hidden" onchange="uploadLogo(this)">
            </label>
            ${DB.get('logo', null) ? `<button class="btn btn-line" onclick="removeLogo()">${icon('trash', 15)} Quitar</button>` : ''}
          </div>
        </div>
      </div>
    </div>

    <div class="grid" style="margin-top:16px">
      <div class="card">
        <div class="card-head"><div><div class="card-title">Datos del negocio</div>
          <div class="card-sub">Se aplican en todo el sistema.</div></div>${icon('shield', 20, 'muted')}</div>
        <div class="field" style="margin-bottom:12px">
          <label>Nombre del negocio</label>
          <input id="cfgName" value="${esc(bizName())}" placeholder="Birriería Ojeda">
        </div>
        <p class="muted" style="font-size:12px;margin:-4px 0 12px">El fondo se aplica a los días nuevos; el de hoy se ajusta desde la pestaña Corte.</p>
        <div class="field" style="margin-bottom:12px">
          <label>WhatsApp de quien reparte <i class="opt">opcional</i></label>
          <input id="cfgWa" type="tel" inputmode="tel" placeholder="10 dígitos"
                 value="${esc(DB.get('waReparto', ''))}">
        </div>
        <div class="field-grid two">
          <div class="field"><label>Número de mesas</label>
            <input id="cfgTables" type="number" inputmode="numeric" min="1" max="40" value="${tables}"></div>
          <div class="field"><label>Fondo con el que abres caja</label>
            <input id="cfgFund" type="number" inputmode="numeric" min="0" value="${Number(DB.get('defaultFund', 0))}"></div>
        </div>
        <button class="btn btn-primary full" style="margin-top:14px" onclick="saveSettings()">
          ${icon('check', 16)} Guardar cambios</button>
      </div>

    <div class="card danger-zone" style="margin-top:16px">
      <div class="card-head"><div><div class="card-title">Zona de riesgo</div>
        <div class="card-sub">Estas acciones no se pueden deshacer. Descarga un respaldo antes.</div></div>
        ${icon('alert', 20)}</div>
      <div class="actions">
        <button class="btn btn-danger" onclick="limpiarAnteriores()">
          ${icon('trash', 15)} Borrar lo de días anteriores</button>
        <button class="btn btn-danger" onclick="wipeToday()">Borrar las ${st.orders.length} comandas de hoy</button>
        <button class="btn btn-danger" onclick="wipeAll()">Borrar toda la información</button>
      </div>
      <p class="muted" style="font-size:12px;margin-top:10px">
        <b>Borrar lo de días anteriores</b> deja solo lo de hoy: sirve para dejar fuera las
        pruebas y que las cifras empiecen a contar desde ahora. Se borra también en la nube,
        así que los demás equipos quedan igual.</p>
    </div>`;
}

/** Cuerpo de la tarjeta de sincronización, según cómo esté este dispositivo. */
function cloudCardBody() {
  const cfg = typeof cloudConfig === 'function' ? cloudConfig() : null;
  const libre = typeof cloudLibReady === 'function' && cloudLibReady();

  if (!cfg) {
    return `<div class="cloud-state off">
        <b>Este dispositivo trabaja solo</b>
        <span>Las comandas que se levanten aquí no las ven los demás equipos.</span>
      </div>
      ${!libre ? `<div class="cloud-msg err">No se pudo cargar la librería de Supabase: revisa la conexión a internet.</div>` : ''}
      <button class="btn btn-primary" style="margin-top:14px" onclick="cloudSettingsPrompt()">
        ${icon('upload', 16)} Conectar con Supabase</button>`;
  }

  const correo = Cloud.session && Cloud.session.user ? Cloud.session.user.email : '';
  return `<div class="cloud-state ${Cloud.online ? 'on' : 'off'}">
      <b>${Cloud.online ? 'Conectado y sincronizando' : 'Configurado, pero sin sesión'}</b>
      <span>${Cloud.online ? esc(correo) : 'Falta entrar con el correo del negocio.'}</span>
    </div>
    <div class="kv"><span>Proyecto</span><b style="font-size:12px;font-weight:700">${esc(cfg.url.replace('https://', ''))}</b></div>
    ${Cloud.error ? `<div class="cloud-msg err" style="margin-top:10px">${esc(Cloud.error)}</div>` : ''}
    <div class="actions" style="margin-top:14px">
      <button class="btn btn-line" onclick="revisarConexion()">${icon('search', 15)} Revisar conexión</button>
      <button class="btn btn-line" onclick="cloudSettingsPrompt()">${icon('edit', 15)} Cambiar conexión</button>
      ${Cloud.online
        ? `<button class="btn btn-line" onclick="sincronizarAhora()">${icon('download', 15)} Traer de la nube</button>
           <button class="btn btn-line" onclick="subirTodo()">${icon('upload', 15)} Subir todo a la nube</button>
           <button class="btn btn-danger" onclick="desconectarNube()">Desconectar este equipo</button>`
        : `<button class="btn btn-primary" onclick="mostrarAccesoNegocio()">Entrar al negocio</button>`}
    </div>`;
}

/** Revisa la conexión y dice qué hay realmente en la nube. */
async function revisarConexion() {
  if (!Cloud.client) { toast('Este equipo no tiene la conexión configurada', 'err'); return; }
  toast('Revisando…');

  const correo = Cloud.session && Cloud.session.user ? Cloud.session.user.email : null;
  let filas = null, fallo = null;
  try {
    const c = Cloud.client;
    const [o, p2, e, cu] = await Promise.all([
      c.from('orders').select('id'),
      c.from('products').select('id'),
      c.from('expenses').select('id'),
      c.from('cuts').select('id'),
    ]);
    const err = [o, p2, e, cu].find((r) => r.error);
    if (err) throw new Error(err.error.message);
    filas = {
      comandas: (o.data || []).length,
      productos: (p2.data || []).length,
      gastos: (e.data || []).length,
      cortes: (cu.data || []).length,
    };
  } catch (err) { fallo = err.message; }

  const local = {
    comandas: allOrders().length,
    productos: DB.get('products', []).length,
    gastos: DB.get('expenses', []).length,
    cortes: DB.get('cuts', []).length,
  };

  const fila = (nombre, k) => `<div class="kv"><span>${nombre}</span>
      <b>${local[k]} aquí · ${filas ? filas[k] + ' en la nube' : '—'}</b></div>`;

  const desfasado = filas && Object.keys(local).some((k) => local[k] !== filas[k]);

  openModal(`${modalHead('Diagnóstico', 'Estado de la sincronización')}
    <div class="modal-body">
      <div class="cloud-state ${correo && !fallo ? 'on' : 'off'}">
        <b>${correo ? 'Este equipo entró como ' + esc(correo) : 'Este equipo NO ha entrado al negocio'}</b>
        <span>${correo ? 'Comparte información con los demás equipos que usen ese mismo correo.'
                       : 'Lo que se capture aquí no lo verán los demás.'}</span>
      </div>

      ${fallo ? `<div class="cloud-msg err">${esc(fallo)}</div>` : ''}

      <div>
        <div class="card-title" style="margin-bottom:8px">Qué hay guardado</div>
        ${fila('Comandas', 'comandas')}
        ${fila('Productos del menú', 'productos')}
        ${fila('Gastos', 'gastos')}
        ${fila('Cortes', 'cortes')}
      </div>

      ${desfasado ? `<div class="cloud-msg err">
        Lo de este equipo y lo de la nube no coincide. Usa <b>Subir todo a la nube</b> desde el
        equipo que tenga la información buena, y <b>Traer de la nube</b> en los demás.</div>` : ''}
      ${filas && !filas.comandas && local.comandas ? `<div class="cloud-msg err">
        La nube no tiene ninguna comanda, por eso los demás equipos no ven nada.
        Dale a <b>Subir todo a la nube</b>.</div>` : ''}

      <div class="kv"><span>Aviso instantáneo</span>
        <b class="${Cloud.realtimeOk ? 'text-green' : 'text-red'}">${Cloud.realtimeOk ? 'Conectado' : 'No conectado'}</b></div>
      <div class="kv"><span>Repaso automático</span><b class="text-green">Cada 10 segundos</b></div>
      ${!Cloud.realtimeOk ? `<div class="cloud-msg err">
        El aviso instantáneo no está conectado, así que los cambios tardan hasta 10 segundos en
        llegar. Para que sea inmediato, ejecuta <b>supabase-realtime.sql</b> en Supabase.</div>` : ''}
      <div class="kv"><span>Proyecto</span><b style="font-size:12px">${esc((cloudConfig() || {}).url || '—')}</b></div>
    </div>
    <div class="modal-foot">
      <button class="btn btn-line" onclick="closeModal()">Cerrar</button>
      ${correo ? `<button class="btn btn-primary" onclick="closeModal(); subirTodo()">${icon('upload', 16)} Subir todo</button>` : ''}
    </div>`);
}

async function sincronizarAhora() {
  toast('Actualizando…');
  await cloudPullAll();
  actualizarEstadoNube();
  toast(Cloud.error ? Cloud.error : 'Información al día', Cloud.error ? 'err' : 'ok');
  renderAdmin();
}
/** Manda a la nube todo lo que tenga este equipo: menú, comandas, gastos y cortes. */
async function subirTodo() {
  const n = DB.get('products', []).length;
  if (!confirm(`Se van a subir los ${n} productos del menú y toda la información de este equipo. ¿Continuar?`)) return;
  toast('Subiendo…');
  await cloudPushAll();
  actualizarEstadoNube();
  toast(Cloud.error ? Cloud.error : 'Todo subido a la nube', Cloud.error ? 'err' : 'ok');
  renderAdmin();
}

async function desconectarNube() {
  if (!confirm('Este equipo dejará de compartir información con los demás. La información que ya tiene se queda guardada aquí. ¿Continuar?')) return;
  await cloudSignOut();
  clearCloudConfig();
  actualizarEstadoNube();
  toast('Equipo desconectado');
  renderAdmin();
}

/** Sub-pestaña de descargas: reportes de Excel y respaldo completo. */
function renderAdminReportes() {
  $('#adminBody').innerHTML = `
    <div class="card" style="margin-top:16px">
      <div class="card-head">
        <div><div class="card-title">Descargar reportes</div>
          <div class="card-sub">Elige el periodo y qué quieres, y bájalo en Excel o en PDF.</div></div>
        ${icon('download', 20, 'muted')}
      </div>

      <div class="field" style="max-width:340px;margin-bottom:16px">
        <label>¿De qué periodo?</label>
        <select id="repRange">
          <option value="hoy">Hoy</option>
          <option value="ayer">Ayer</option>
          <option value="semana">Últimos 7 días</option>
          <option value="mes" selected>Este mes</option>
          <option value="mesant">Mes anterior</option>
          <option value="todo">Todo el histórico</option>
        </select>
      </div>

      <div class="rep-head">
        <p class="lbl">¿Qué quieres descargar?</p>
        <div class="actions">
          <button class="linkbtn" onclick="marcarTodosReportes(true)">Todo</button>
          <button class="linkbtn" onclick="marcarTodosReportes(false)">Nada</button>
        </div>
      </div>

      <div class="rep-lista" id="repLista">
        ${REPORTES.map((r) => `
          <button class="rep-opt ${repSeleccion.includes(r.id) ? 'on' : ''}" data-rep="${r.id}"
                  onclick="toggleReporte('${r.id}')">
            <span class="rep-ic">${icon(r.icono, 18)}</span>
            <span class="rep-txt"><b>${r.nombre}</b><small>${r.detalle}</small></span>
            <i class="tick">${icon('check', 13)}</i>
          </button>`).join('')}
      </div>

      <div class="rep-pie">
        <span class="muted" id="repCuenta">${repSeleccion.length} seleccionado${repSeleccion.length === 1 ? '' : 's'}</span>
        <div class="actions">
          <button class="btn btn-line" onclick="descargarPDF()">${icon('print', 16)} Descargar PDF</button>
          <button class="btn btn-primary" onclick="descargarExcel()">${icon('download', 16)} Descargar Excel</button>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:16px">
      <div class="card-head">
        <div><div class="card-title">Respaldo completo</div>
          <div class="card-sub">Toda la información en un archivo, para guardarla o pasarla a otro equipo.</div></div>
        ${icon('box', 20, 'muted')}
      </div>

      <div class="grid grid-2" style="gap:0 24px">
        <div>
          <div class="kv"><span>Comandas guardadas</span><b>${allOrders().length}</b></div>
          <div class="kv"><span>Gastos registrados</span><b>${DB.get('expenses', []).length}</b></div>
        </div>
        <div>
          <div class="kv"><span>Cortes guardados</span><b>${DB.get('cuts', []).length}</b></div>
          <div class="kv"><span>Productos en el menú</span><b>${DB.get('products', []).length}</b></div>
        </div>
      </div>

      <div class="actions" style="margin-top:16px">
        <button class="btn btn-primary" onclick="exportBackup()">${icon('download', 16)} Descargar respaldo</button>
        <label class="btn btn-line" style="cursor:pointer">
          ${icon('upload', 16)} Restaurar desde archivo
          <input type="file" accept="application/json,.json" class="hidden" onchange="importBackup(this)">
        </label>
      </div>
    </div>`;
}

function togglePin(id, pin) {
  const el = $('#pin-' + id), btn = $('#pinbtn-' + id);
  const oculto = el.textContent === '••••';
  el.textContent = oculto ? pin : '••••';
  btn.textContent = oculto ? 'Ocultar' : 'Ver';
}

function editProfile(id) {
  const u = getUsers()[id];
  const activas = navIds(id);
  openModal(`${modalHead('Perfil de acceso', u.label)}
    <div class="modal-body">
      <div class="field"><label>Nombre que se muestra</label>
        <input id="prName" value="${esc(u.label)}"></div>

      <div class="field"><label>PIN de 4 dígitos</label>
        <input id="prPin" inputmode="numeric" maxlength="4" value="${esc(u.pin)}" class="big-amount"
               style="letter-spacing:.4em;text-align:center"></div>

      <div>
        <p class="lbl" style="margin-bottom:9px">¿Qué pestañas puede ver?</p>
        <div class="tab-picker" id="prPages">
          ${ALL_PAGES.map(([pid, ic, label]) => {
            const on = activas.includes(pid);
            const fijo = (id === 'admin' && pid === 'admin');
            return `<button class="tab-opt ${on ? 'on' : ''} ${fijo ? 'fixed' : ''}" data-page="${pid}"
                      ${fijo ? 'disabled' : `onclick="this.classList.toggle('on')"`}>
                      ${icon(ic, 17)}<span>${label}</span>
                      <i class="tick">${icon('check', 13)}</i>
                    </button>`;
          }).join('')}
        </div>
        <p class="muted" style="font-size:12px;margin-top:9px">
          ${id === 'admin'
            ? 'El administrador conserva Ajustes para no quedarse fuera de la configuración.'
            : 'Deja marcada al menos una pestaña. Inicio muestra las ventas del día, así que normalmente se deja solo al administrador.'}
        </p>
      </div>

      <p class="muted" style="font-size:12.5px">Si cambias el PIN, avísale a quien usa este perfil: es su única forma de entrar.</p>
    </div>
    <div class="modal-foot">
      <button class="btn btn-line" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="saveProfile('${id}')">Guardar</button>
    </div>`);
}

function saveProfile(id) {
  const label = $('#prName').value.trim();
  const pin = $('#prPin').value.trim();
  if (!label) { toast('El perfil necesita un nombre', 'err'); return; }
  if (!/^[0-9]{4}$/.test(pin)) { toast('El PIN debe ser de 4 dígitos', 'err'); return; }

  const otros = Object.entries(getUsers()).filter(([k]) => k !== id);
  if (otros.some(([, u]) => u.pin === pin)) { toast('Ese PIN ya lo usa otro perfil', 'err'); return; }

  const pages = [];
  $$('#prPages .tab-opt').forEach((b) => {
    if (b.classList.contains('on')) pages.push(b.dataset.page);
  });
  if (id === 'admin' && !pages.includes('admin')) pages.push('admin');
  if (!pages.length) { toast('Deja marcada al menos una pestaña', 'err'); return; }

  const saved = DB.get('users', {}) || {};
  saved[id] = { ...(saved[id] || {}), label, pin, pages };
  DB.set('users', saved);

  if (session.role === id) {
    session.label = label;
    $('#userRoleLabel').textContent = label;
    $('#userAvatar').textContent = label[0];
  }
  closeModal();
  toast('Perfil actualizado', 'ok');
  if (session.role === id) go(roleAllowed(currentPage) ? currentPage : 'admin');
  else renderAdmin();
}

function saveSettings() {
  const name = $('#cfgName').value.trim() || 'Birriería Ojeda';
  const tables = Math.max(1, Math.min(40, Number($('#cfgTables').value) || 8));
  DB.set('bizName', name);
  DB.set('tableCount', tables);
  DB.set('defaultFund', Number($('#cfgFund').value || 0));
  DB.set('waReparto', $('#cfgWa').value.trim());
  applyBranding();
  toast('Configuración guardada', 'ok');
  renderAdmin();
}

/** Refleja el nombre y el logo del negocio en la barra lateral y el login. */
function applyBranding() {
  const n = bizName();
  const side = $('#sideBrandName');
  if (side) side.textContent = n;
  $$('.brand-panel h1').forEach((h) => { h.textContent = n; });
  document.title = n + ' · Sistema';

  // Si se subió un logo desde Ajustes, manda ese; si no, el archivo de la carpeta.
  const logo = DB.get('logo', null);
  if (!logo) return;
  $$('.brand-logo').forEach((img) => { img.onerror = null; img.src = logo; });
  const fav = document.querySelector('link[rel="icon"]');
  if (fav) fav.href = logo;
}

/* ---------- Logo del negocio ------------------------------------------ */
const LOGO_MAX = 900000;   // ~900 KB en base64; arriba de eso se reduce

function uploadLogo(input) {
  const f = input.files && input.files[0];
  input.value = '';
  if (!f) return;
  if (!/^image\//.test(f.type)) { toast('Elige un archivo de imagen', 'err'); return; }

  const reader = new FileReader();
  reader.onerror = () => toast('No se pudo leer el archivo', 'err');
  reader.onload = () => {
    const dataUrl = String(reader.result);
    // Si cabe, se guarda tal cual: el logo no se toca.
    if (dataUrl.length <= LOGO_MAX) { saveLogo(dataUrl); return; }
    // Si viene muy pesado, solo se reduce de tamaño; el diseño no cambia.
    const img = new Image();
    img.onerror = () => toast('No se pudo leer la imagen', 'err');
    img.onload = () => {
      const lado = 512;
      const escala = Math.min(1, lado / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * escala);
      c.height = Math.round(img.height * escala);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      saveLogo(c.toDataURL('image/png'));
    };
    img.src = dataUrl;
  };
  reader.readAsDataURL(f);
}

function saveLogo(dataUrl) {
  try { DB.set('logo', dataUrl); }
  catch { toast('La imagen pesa demasiado, usa una más chica', 'err'); return; }
  applyBranding();
  toast('Logo actualizado', 'ok');
  renderAdmin();
}

function removeLogo() {
  if (!confirm('¿Quitar el logo y volver al que trae el sistema?')) return;
  DB.remove('logo');
  // La cadena de archivos la define index.html; si no está, se cae al vectorial.
  const fuentes = (typeof LOGO_SOURCES !== 'undefined' && LOGO_SOURCES) || ['logo.png', 'logo.svg'];
  $$('.brand-logo').forEach((img) => {
    img.dataset.i = 0;
    if (typeof logoFallback === 'function') img.onerror = () => logoFallback(img);
    img.src = fuentes[0];
  });
  const fav = document.querySelector('link[rel="icon"]');
  if (fav) fav.href = 'logo.svg';
  toast('Logo quitado');
  renderAdmin();
}

const BACKUP_KEYS = ['products', 'orders', 'expenses', 'cuts', 'funds', 'defaultFund', 'initialFund', 'users', 'tableCount', 'bizName', 'logo'];

function exportBackup() {
  const data = { _sistema:'birrieria-ojeda', _fecha:new Date().toISOString() };
  BACKUP_KEYS.forEach((k) => (data[k] = DB.get(k, null)));
  const blob = new Blob([JSON.stringify(data, null, 2)], { type:'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `respaldo-${bizName().toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${todayKey()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast('Respaldo descargado', 'ok');
}

function importBackup(input) {
  const file = input.files && input.files[0];
  input.value = '';
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    let data;
    try { data = JSON.parse(reader.result); }
    catch { toast('El archivo no es un respaldo válido', 'err'); return; }
    if (data._sistema !== 'birrieria-ojeda') { toast('Ese respaldo no es de este sistema', 'err'); return; }
    if (!confirm('Restaurar el respaldo reemplaza TODA la información actual. ¿Continuar?')) return;
    BACKUP_KEYS.forEach((k) => { if (data[k] !== null && data[k] !== undefined) DB.set(k, data[k]); });
    applyBranding();
    toast('Respaldo restaurado', 'ok');
    refresh();
  };
  reader.readAsText(file);
}

/**
 * Deja solo lo de hoy. Sirve para sacar los días de prueba sin tocar lo que ya
 * es del negocio. Al pasar por DB.set, el borrado también viaja a la nube.
 */
function limpiarAnteriores() {
  const hoy = todayKey();
  const os = allOrders(), ex = DB.get('expenses', []), cu = DB.get('cuts', []);
  const fuera = {
    comandas: os.filter((o) => o.date < hoy).length,
    gastos:   ex.filter((e) => e.date < hoy).length,
    cortes:   cu.filter((c) => c.date < hoy).length,
  };
  const total = fuera.comandas + fuera.gastos + fuera.cortes;
  if (!total) { toast('No hay nada de días anteriores', 'ok'); return; }

  if (!confirm(
    `Se va a borrar todo lo anterior a hoy:

` +
    `· ${fuera.comandas} comanda${fuera.comandas === 1 ? '' : 's'}
` +
    `· ${fuera.gastos} gasto${fuera.gastos === 1 ? '' : 's'}
` +
    `· ${fuera.cortes} corte${fuera.cortes === 1 ? '' : 's'}

` +
    `Lo de hoy se queda. También se borra en la nube, para todos los equipos.
` +
    `Esto no se puede deshacer: descarga un respaldo si quieres conservarlo.`)) return;

  DB.set('orders',   os.filter((o) => o.date >= hoy));
  DB.set('expenses', ex.filter((e) => e.date >= hoy));
  DB.set('cuts',     cu.filter((c) => c.date >= hoy));
  toast(`${total} registros de prueba borrados`, 'ok');
  refresh();
}

function wipeToday() {
  const st = dayStats();
  if (!confirm(`¿Borrar las ${st.orders.length} comandas y ${st.expenses.length} gastos de hoy? No se puede deshacer.`)) return;
  DB.set('orders', allOrders().filter((o) => o.date !== todayKey()));
  DB.set('expenses', DB.get('expenses', []).filter((e) => e.date !== todayKey()));
  DB.set('cuts', DB.get('cuts', []).filter((c) => c.date !== todayKey()));
  toast('Información de hoy borrada');
  refresh();
}
function wipeAll() {
  if (!confirm('Esto borra comandas, gastos, cortes y el menú de TODOS los días. ¿Seguro?')) return;
  if (!confirm('Última confirmación: la información no se puede recuperar sin un respaldo.')) return;
  ['orders', 'expenses', 'cuts'].forEach((k) => DB.set(k, []));
  DB.set('products', DEFAULT_PRODUCTS);
  DB.set('funds', {});
  toast('Información borrada');
  go('home');
}

/* =========================================================================
   9 · REPORTES — Excel y PDF
   ========================================================================= */

/** Genera un CSV que Excel abre con las columnas ya separadas. */
function toCSV(rows) {
  const celda = (v) => {
    const t = String(v === null || v === undefined ? '' : v);
    return /[";\n\r]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t;
  };
  // sep=; le dice a Excel en español cuál es el separador.
  return 'sep=;\r\n' + rows.map((r) => r.map(celda).join(';')).join('\r\n');
}
/** Número con coma decimal, como lo espera Excel en español. */
const nExcel = (n) => String(Number(n || 0).toFixed(2)).replace('.', ',');

function downloadCSV(nombre, rows) {
  if (rows.length <= 1) return false;
  const blob = new Blob(['\ufeff' + toCSV(rows)], { type:'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = nombre + '.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  return true;
}

/** Rango [desde, hasta, etiqueta] según el periodo elegido. */
function rangoDe(kind) {
  const hoy = new Date();
  const y = hoy.getFullYear(), m = hoy.getMonth();
  if (kind === 'hoy')    return [todayKey(), todayKey(), 'hoy'];
  if (kind === 'ayer')   return [shiftKey(-1), shiftKey(-1), 'ayer'];
  if (kind === 'semana') return [shiftKey(-6), todayKey(), 'ultimos-7-dias'];
  if (kind === 'mes')    return [dayKeyOf(new Date(y, m, 1)), dayKeyOf(new Date(y, m + 1, 0)), `${y}-${String(m + 1).padStart(2, '0')}`];
  if (kind === 'mesant') {
    const p = new Date(y, m - 1, 1);
    return [dayKeyOf(p), dayKeyOf(new Date(y, m, 0)), `${p.getFullYear()}-${String(p.getMonth() + 1).padStart(2, '0')}`];
  }
  return ['0000-01-01', '9999-12-31', 'historico'];
}
const enRango = (fecha, a, b) => fecha >= a && fecha <= b;
const archivo = (base, sufijo) => `${base}-${bizName().toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${sufijo}`;

/** Texto del periodo para los encabezados. */
function periodoTexto(kind, a, b) {
  const bonito = (k) => {
    const [y, m, d] = k.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es-MX', { day:'numeric', month:'long', year:'numeric' });
  };
  if (kind === 'todo') return 'Todo el histórico';
  if (a === b) return bonito(a);
  return `Del ${bonito(a)} al ${bonito(b)}`;
}

/* ---------- Los datos de cada reporte, como filas ----------------------- */
function filasResumen(a, b) {
  const dias = [...new Set([
    ...allOrders().map((o) => o.date),
    ...DB.get('expenses', []).map((e) => e.date),
    ...DB.get('cuts', []).map((c) => c.date),
  ])].filter((d) => enRango(d, a, b)).sort();

  const rows = [['Fecha', 'Comandas', 'Tickets cobrados', 'Piezas', 'Ventas cobradas',
                 'Efectivo', 'Tarjeta y transferencia', 'Sin cobrar', 'Gastos', 'Utilidad', 'Ticket promedio']];
  let tV = 0, tG = 0, tU = 0;
  dias.forEach((d) => {
    const c = cutNumbers(d);
    tV += c.sales; tG += c.spent; tU += c.utility;
    rows.push([d, c.orders.length, c.paid.length, c.pieces, c.sales,
      c.cashSales, c.cardSales, c.pending, c.spent, c.utility, c.ticket]);
  });
  if (dias.length) rows.push(['TOTAL', '', '', '', tV, '', '', '', tG, tU, '']);
  return rows;
}

function filasVentas(a, b) {
  const rows = [['Fecha', 'Folio', 'Hora', 'Mesa', 'Cliente', 'Teléfono', 'Dirección', 'Entrega',
                 'Envío', 'Lo llevó', 'Piezas', 'Total', 'Estado',
                 'Forma de pago', 'Recibido', 'Cambio', 'Hora de cobro', 'Cobró', 'Levantó']];
  allOrders().filter((o) => enRango(o.date, a, b))
    .sort((x, y2) => (x.date + x.createdTime).localeCompare(y2.date + y2.createdTime))
    .forEach((o) => {
      const pg = o.payment || {}, en = o.delivery || {};
      rows.push([o.date, o.folio, o.createdTime, o.table, o.customer || '',
        en.phone || '', [en.address, en.notes].filter(Boolean).join(' — '), en.mode || '',
        envioDe(o) || '', en.courier || '', orderPieces(o),
        orderTotal(o), statusLabel(orderStatus(o)),
        o.paid ? (pg.method || 'Efectivo') : '', o.paid ? pg.received : '',
        o.paid ? pg.change : '', pg.time || '', pg.cashier || '', o.waiter || '']);
    });
  return rows;
}

function filasProductos(a, b) {
  const lista = topProducts(allOrders().filter((o) => enRango(o.date, a, b)), 1000);
  const total = lista.reduce((t, p2) => t + p2.amount, 0);
  const rows = [['Producto', 'Piezas vendidas', 'Importe', 'Porcentaje de la venta']];
  lista.forEach((p2) => rows.push([p2.name, p2.qty, p2.amount,
    (total ? (p2.amount / total) * 100 : 0).toFixed(1) + '%']));
  if (lista.length) rows.push(['TOTAL', lista.reduce((t, p2) => t + p2.qty, 0), total, '100%']);
  return rows;
}

function filasGastos(a, b) {
  const rows = [['Fecha', 'Hora', 'Categoría', 'Descripción', 'Concepto', 'Cantidad', 'Responsable']];
  let total = 0;
  DB.get('expenses', []).filter((e) => enRango(e.date, a, b))
    .sort((x, y2) => (x.date + x.time).localeCompare(y2.date + y2.time))
    .forEach((e) => {
      // Los gastos capturados con la versión anterior traen varios conceptos:
      // se baja una fila por cada uno, sin perder la descripción del gasto.
      const items = (e.items && e.items.length) ? e.items : [{ concept:'', amount:e.amount }];
      items.forEach((i) => {
        total += Number(i.amount || 0);
        rows.push([e.date, e.time, e.category || 'Otros', e.description, i.concept || '', i.amount, e.responsible]);
      });
    });
  if (rows.length > 1) rows.push(['TOTAL', '', '', '', '', total, '']);
  return rows;
}

function filasCortes(a, b) {
  const rows = [['Fecha', 'Hora', 'Ventas', 'Efectivo', 'Tarjeta', 'Gastos', 'Utilidad',
                 'Fondo inicial', 'Efectivo esperado', 'Efectivo contado', 'Diferencia', 'Cerró']];
  DB.get('cuts', []).filter((c) => enRango(c.date, a, b))
    .sort((x, y2) => (x.date + x.time).localeCompare(y2.date + y2.time))
    .forEach((c) => rows.push([c.date, c.time, c.sales, c.cashSales != null ? c.cashSales : c.sales,
      c.cardSales || 0, c.expenses, c.utility, c.initial, c.expected, c.counted, c.difference,
      c.closedBy || '']));
  return rows;
}

/** Catálogo de reportes: mismo origen para Excel y para PDF. */
const REPORTES = [
  { id:'corte',     nombre:'Corte del día',        icono:'wallet',  detalle:'Ventas, efectivo y diferencia de hoy' },
  { id:'resumen',   nombre:'Resumen por día',      icono:'chart',   filas:filasResumen,   dinero:[4,5,6,7,8,9,10], detalle:'Una fila por día del periodo' },
  { id:'ventas',    nombre:'Ventas por comanda',   icono:'receipt', filas:filasVentas,    dinero:[8,11,14,15],
    // El Excel lleva las 19 columnas; en papel solo caben las de lectura.
    pdfCols:[0,1,2,3,4,10,11,12,13], detalle:'Cada comanda con su total y forma de pago' },
  { id:'productos', nombre:'Productos vendidos',   icono:'box',     filas:filasProductos, dinero:[2],              detalle:'Piezas e importe de cada producto' },
  { id:'gastos',    nombre:'Gastos',               icono:'minus',   filas:filasGastos,    dinero:[5],              detalle:'Cada concepto con su responsable' },
  { id:'cortes',    nombre:'Cortes guardados',     icono:'check',   filas:filasCortes,    dinero:[2,3,4,5,6,7,8,9,10],
    pdfCols:[0,1,2,5,6,8,9,10], detalle:'Historial de cierres con su diferencia' },
];

let repSeleccion = ['corte', 'resumen', 'ventas', 'gastos'];

function toggleReporte(id) {
  const i = repSeleccion.indexOf(id);
  if (i >= 0) repSeleccion.splice(i, 1); else repSeleccion.push(id);
  $$('#repLista .rep-opt').forEach((b) => b.classList.toggle('on', repSeleccion.includes(b.dataset.rep)));
  const n = repSeleccion.length;
  $('#repCuenta').textContent = n ? `${n} seleccionado${n === 1 ? '' : 's'}` : 'Nada seleccionado';
}
function marcarTodosReportes(todos) {
  repSeleccion = todos ? REPORTES.map((r) => r.id) : [];
  $$('#repLista .rep-opt').forEach((b) => b.classList.toggle('on', repSeleccion.includes(b.dataset.rep)));
  const n = repSeleccion.length;
  $('#repCuenta').textContent = n ? `${n} seleccionado${n === 1 ? '' : 's'}` : 'Nada seleccionado';
}

/* ---------- Descargar en Excel ------------------------------------------ */
function descargarExcel() {
  if (!repSeleccion.length) { toast('Elige al menos un reporte', 'err'); return; }
  const kind = $('#repRange').value;
  const [a, b, suf] = rangoDe(kind);
  let hechos = 0;

  REPORTES.filter((r) => repSeleccion.includes(r.id)).forEach((r) => {
    const rows = r.id === 'corte' ? filasCorteDelDia() : r.filas(a, b);
    // Excel necesita los números con coma decimal.
    const listas = rows.map((fila, iF) => fila.map((v, iC) => {
      if (iF === 0 || !r.dinero || !r.dinero.includes(iC)) return v;
      return v === '' || v === null || v === undefined ? '' : nExcel(v);
    }));
    if (downloadCSV(archivo(r.id, suf), listas)) hechos++;
  });

  toast(hechos ? `${hechos} archivo${hechos === 1 ? '' : 's'} descargado${hechos === 1 ? '' : 's'}` : 'No hay información en ese periodo',
        hechos ? 'ok' : 'err');
}

/** El corte de hoy, en dos columnas. */
function filasCorteDelDia() {
  const c = cutNumbers();
  return [
    ['Concepto', 'Importe'],
    ['Ventas cobradas', c.sales],
    ['— en efectivo', c.cashSales],
    ['— tarjeta y transferencia', c.cardSales],
    ['Sin cobrar', c.pending],
    ['Gastos del día', c.spent],
    ['Utilidad', c.utility],
    ['Fondo inicial', c.fund],
    ['Efectivo que debe haber', c.expected],
    ['Comandas levantadas', c.orders.length],
    ['Tickets cobrados', c.paid.length],
    ['Piezas vendidas', c.pieces],
    ['Ticket promedio', c.ticket],
  ];
}

/* ---------- Descargar en PDF -------------------------------------------- */
/** Tabla con color para el documento; recorta a las columnas que caben en papel. */
function tablaPDF(rows, dinero, cols) {
  if (!rows || rows.length <= 1) return '<p class="vacio">Sin movimientos en este periodo.</p>';

  // Si el reporte declara columnas para papel, se recorta y se reajustan los importes.
  const usar = cols && cols.length ? cols : rows[0].map((_, i) => i);
  const esDinero = new Set();
  usar.forEach((orig, nuevo) => { if (dinero && dinero.includes(orig)) esDinero.add(nuevo); });

  const celda = (v, i) => {
    const num = esDinero.has(i);
    const txt = num && v !== '' && v !== null && v !== undefined ? money(v) : esc(String(v == null ? '' : v));
    return `<td class="${num ? 'num' : ''}">${txt}</td>`;
  };
  const cuerpo = rows.slice(1).map((f) => {
    const esTotal = String(f[0]).toUpperCase() === 'TOTAL';
    return `<tr class="${esTotal ? 'total' : ''}">${usar.map((c, i) => celda(f[c], i)).join('')}</tr>`;
  }).join('');
  return `<table><thead><tr>${usar.map((c) => `<th>${esc(rows[0][c])}</th>`).join('')}</tr></thead><tbody>${cuerpo}</tbody></table>`;
}

/** Bloque especial del corte del día, con tarjetas de color. */
function corteEnPDF() {
  const c = cutNumbers();
  const tarjeta = (t, v, clase) => `<div class="tarjeta ${clase || ''}"><span>${t}</span><b>${money(v)}</b></div>`;
  return `
    <div class="tarjetas">
      ${tarjeta('Ventas cobradas', c.sales, 'oscura')}
      ${tarjeta('Gastos', c.spent, 'roja')}
      ${tarjeta('Utilidad', c.utility, 'verde')}
      ${tarjeta('Sin cobrar', c.pending)}
    </div>
    <table>
      <tbody>
        <tr><td>Fondo inicial</td><td class="num">${money(c.fund)}</td></tr>
        <tr><td>+ Ventas en efectivo</td><td class="num">${money(c.cashSales)}</td></tr>
        <tr><td>+ Tarjeta y transferencia</td><td class="num">${money(c.cardSales)}</td></tr>
        <tr><td>− Gastos</td><td class="num">${money(c.spent)}</td></tr>
        <tr class="total"><td>Efectivo que debe haber</td><td class="num">${money(c.expected)}</td></tr>
        <tr><td>Comandas levantadas</td><td class="num">${c.orders.length}</td></tr>
        <tr><td>Tickets cobrados</td><td class="num">${c.paid.length}</td></tr>
        <tr><td>Piezas vendidas</td><td class="num">${num(c.pieces)}</td></tr>
        <tr><td>Ticket promedio</td><td class="num">${money(c.ticket)}</td></tr>
      </tbody>
    </table>`;
}

/** Plantilla del documento imprimible: portada, secciones y pie. */
function documentoReporte(subtitulo, secciones) {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8">
<title>${esc(bizName())} · Reporte</title>
<style>
  @page { size:A4; margin:12mm 10mm; }
  *{box-sizing:border-box}
  html,body{max-width:100%;overflow-x:hidden}
  body{
    margin:0;padding:0;font-family:"Segoe UI",Arial,Helvetica,sans-serif;color:#16161a;
    font-size:11px;line-height:1.4;
    -webkit-print-color-adjust:exact;print-color-adjust:exact;
  }
  /* Si el reporte se ve en pantalla (celular), se lee cómodo y con márgenes. */
  @media screen{
    body{padding:16px;background:#f4f4f7;font-size:13px}
    .hoja{background:#fff;padding:18px;border-radius:12px;max-width:900px;margin:0 auto;
          box-shadow:0 4px 24px rgba(16,16,22,.08)}
  }
  @media print{ .hoja{padding:0} }
  .portada{
    background:linear-gradient(135deg,#a51420,#6b0c14);color:#fff;
    padding:22px 24px;border-radius:12px;margin-bottom:18px;
  }
  .portada h1{margin:0;font-size:22px;letter-spacing:.04em;text-transform:uppercase}
  .portada p{margin:6px 0 0;font-size:12px;opacity:.85}
  .portada .fecha{margin-top:12px;font-size:10.5px;opacity:.7}
  section{margin-bottom:20px;page-break-inside:auto}
  h2{
    font-size:13px;margin:0 0 9px;padding:7px 11px;border-radius:7px;
    background:#fdf1f2;color:#8c111c;border-left:4px solid #a51420;
  }
  table{width:100%;border-collapse:collapse;margin-bottom:6px;table-layout:fixed}
  th{
    background:#2b2b31;color:#fff;font-size:9px;text-transform:uppercase;
    letter-spacing:.03em;padding:6px 6px;text-align:left;
  }
  td{padding:5px 6px;border-bottom:1px solid #ececf0;word-break:break-word;overflow-wrap:anywhere}
  th:first-child,td:first-child{width:auto}
  thead{display:table-header-group}   /* el encabezado se repite en cada hoja */
  tr{page-break-inside:avoid}
  tbody tr:nth-child(even){background:#fafafc}
  td.num,th:last-child{text-align:right;font-variant-numeric:tabular-nums}
  tr.total td{background:#fdf1f2;font-weight:800;color:#8c111c;border-top:2px solid #a51420}
  .tarjetas{display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap}
  @media screen and (max-width:560px){
    .tarjeta{min-width:calc(50% - 4px)}
    th,td{font-size:11px;padding:6px 5px}
    .portada h1{font-size:19px}
  }
  .tarjeta{
    flex:1;border:1px solid #e7e7ec;border-radius:9px;padding:10px 12px;background:#fff;
  }
  .tarjeta span{display:block;font-size:9.5px;color:#74747e}
  .tarjeta b{display:block;font-size:16px;margin-top:3px}
  .tarjeta.oscura{background:#16161a;border-color:#16161a;color:#fff}
  .tarjeta.oscura span{color:#b9b9c4}
  .tarjeta.roja b{color:#8c111c}
  .tarjeta.verde b{color:#0f7a46}
  .vacio{color:#74747e;font-style:italic;padding:6px 0}
  .pie{margin-top:22px;padding-top:10px;border-top:1px solid #ececf0;font-size:9.5px;color:#74747e;text-align:center}
</style></head><body>
  <div class="hoja">
  <div class="portada">
    <h1>${esc(bizName())}</h1>
    <p>${esc(subtitulo)}</p>
    <div class="fecha">Generado el ${esc(dateText())} a las ${esc(hourMin())}</div>
  </div>
  ${secciones}
  <div class="pie">${esc(bizName())} · Sistema de operación · Hecho por Ximena Ortega</div>
  </div>
</body></html>`;
}

function descargarPDF() {
  if (!repSeleccion.length) { toast('Elige al menos un reporte', 'err'); return; }
  const kind = $('#repRange').value;
  const [a, b] = rangoDe(kind);
  const elegidos = REPORTES.filter((r) => repSeleccion.includes(r.id));

  const secciones = elegidos.map((r) => `
    <section>
      <h2>${esc(r.nombre)}</h2>
      ${r.id === 'corte' ? corteEnPDF() : tablaPDF(r.filas(a, b), r.dinero, r.pdfCols)}
    </section>`).join('');

  const doc = documentoReporte(periodoTexto(kind, a, b), secciones);
  imprimirDocumento(doc, archivo('reporte', rangoDe(kind)[2]));
}

/**
 * Manda el documento a imprimir sin abrir ventanas nuevas: los celulares las
 * bloquean casi siempre. Se usa un marco oculto dentro de la misma página, que
 * es lo que entienden tanto Android como iPhone y la computadora.
 */
function imprimirDocumento(html, nombre) {
  const anterior = document.getElementById('marcoImpresion');
  if (anterior) anterior.remove();

  const marco = document.createElement('iframe');
  marco.id = 'marcoImpresion';
  marco.setAttribute('aria-hidden', 'true');
  marco.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;';
  document.body.appendChild(marco);

  let listo = false;
  const lanzar = () => {
    if (listo) return;
    listo = true;
    try {
      marco.contentWindow.focus();
      marco.contentWindow.print();
      toast('En el diálogo elige "Guardar como PDF"', 'ok');
    } catch (e) {
      // Algún navegador de celular no deja imprimir desde el marco: se descarga.
      descargarDocumento(html, nombre);
    }
    // Se retira después, para no cortar el diálogo de impresión.
    setTimeout(() => marco.remove(), 60000);
  };

  marco.onload = lanzar;
  const d = marco.contentWindow.document;
  d.open();
  d.write(html);
  d.close();
  // Si el marco no avisa que cargó (pasa en algunos móviles), se lanza igual.
  setTimeout(lanzar, 700);
}

/** Último recurso: guardar el reporte como archivo para abrirlo e imprimirlo. */
function descargarDocumento(html, nombre) {
  const blob = new Blob([html], { type:'text/html;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = nombre + '.html';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast('Se descargó el reporte: ábrelo y usa Imprimir para guardarlo en PDF', 'ok');
}

/* =========================================================================
   Arranque
   ========================================================================= */
// Este archivo se carga como script clásico: las funciones declaradas arriba y las
// variables de nivel superior quedan disponibles para los onclick del HTML generado.
$('#logoutBtn').onclick = logout;

/** Cuando otro dispositivo cambia algo, se redibuja lo que se esté viendo. */
function onCloudChange() {
  if (!session) return;
  if ($('#modalRoot').innerHTML || $('#sheetRoot').innerHTML) return;  // no interrumpir una captura
  refresh();
}

/**
 * Siempre se entra por la pantalla de perfiles y PIN. El acceso del negocio
 * solo se abre a propósito, desde el aviso del login o desde Ajustes.
 */
function mostrarLogin() {
  $('#cloudView').classList.add('hidden');
  $('#loginView').classList.remove('hidden');
  renderLogin();
}
function mostrarAccesoNegocio() {
  $('#loginView').classList.add('hidden');
  $('#cloudView').classList.remove('hidden');
  renderCloudLogin();
}

async function arrancar() {
  // Se pinta el login de una vez con lo que hay en el equipo: esperar a la nube
  // dejaba la pantalla a medias unos segundos.
  // Ojo: si hay nube configurada NO se siembra todavía. En un equipo nuevo, el
  // menú de fábrica se tomaría como "capturado aquí" y acabaría mezclándose con
  // el de la nube en vez de ceder ante él.
  const conNube = typeof cloudConfig === 'function' && !!cloudConfig();
  if (!conNube) sembrarDefaults();
  migrarInicio();
  applyBranding();

  // Si este equipo ya había entrado, se retoma el perfil sin volver a pedir el PIN.
  const recordado = leerSesion();
  if (!recordado || !abrirSesion(recordado, false)) mostrarLogin();

  try { await cloudInit(); }
  catch (e) { Cloud.error = e.message; }

  // Ya con la nube puede haber otro nombre, otro logo u otros perfiles.
  sembrarDefaults();
  migrarInicio();
  applyBranding();
  actualizarEstadoNube();

  // Solo se redibuja si la nube trajo algo distinto: si no, la pantalla
  // parpadeaba en cada recarga sin motivo.
  if (session) { if (Cloud.trajoCambios) refresh(); }
  else mostrarLogin();
}

/**
 * Los perfiles guardados con la versión anterior traían Inicio a fuerza.
 * Se les quita una sola vez; después el administrador decide libremente.
 */
function migrarInicio() {
  if (DB.get('navMigrado', false)) return;
  const guardados = DB.get('users', {}) || {};
  let cambio = false;
  Object.keys(guardados).forEach((rol) => {
    if (rol === 'admin' || !Array.isArray(guardados[rol].pages)) return;
    const sinInicio = guardados[rol].pages.filter((x) => x !== 'home');
    if (sinInicio.length !== guardados[rol].pages.length) {
      guardados[rol].pages = sinInicio.length ? sinInicio : DEFAULT_NAV[rol];
      cambio = true;
    }
  });
  if (cambio) DB.set('users', guardados);
  DB.set('navMigrado', true);
}

/** Datos de fábrica, solo si no hay nada guardado ni en la nube ni aquí. */
function sembrarDefaults() {
  // Sin productos no hay con qué levantar comandas. Si la nube todavía no tenía
  // menú, se siembra el de fábrica y de paso se sube.
  if (!DB.get('products', []).length) DB.set('products', DEFAULT_PRODUCTS);
  if (!DB.get('orders', null)) DB.set('orders', []);
  if (!DB.get('expenses', null)) DB.set('expenses', []);
  if (!DB.get('cuts', null)) DB.set('cuts', []);
  if (DB.get('defaultFund', null) === null) DB.set('defaultFund', 0);
  if (!DB.get('funds', null)) DB.set('funds', {});
}

/**
 * Estado de la conexión. Se muestra en la barra lateral y, sobre todo, en la
 * barra de arriba: en celular la barra lateral no se ve y no había forma de
 * enterarse de que el equipo estaba trabajando aislado.
 */
/**
 * Menú de cuenta. En celular la barra lateral no se ve, así que sin esto no
 * había forma de cerrar sesión ni de saber con qué perfil se está trabajando.
 */
function abrirCuenta() {
  const hayNube = typeof Cloud !== 'undefined' && !!cloudConfig();
  const conectado = hayNube && Cloud.online;
  const correo = conectado && Cloud.session && Cloud.session.user ? Cloud.session.user.email : '';

  openModal(`
    <div class="modal-head">
      <div style="display:flex;align-items:center;gap:12px;min-width:0">
        <span class="cuenta-av-grande">${esc((session.label || '?')[0])}</span>
        <div style="min-width:0">
          <p class="eyebrow red">Sesión activa</p>
          <h3>${esc(session.label)}</h3>
        </div>
      </div>
      <button class="close-x" onclick="closeModal()">${icon('close', 18)}</button>
    </div>
    <div class="modal-body">
      <div class="cloud-state ${conectado ? 'on' : 'off'}">
        <b>${conectado ? 'Sincronizado' : hayNube ? 'Este equipo no ha entrado al negocio' : 'Este equipo trabaja solo'}</b>
        <span>${conectado ? esc(correo) + ' · lo que hagas aquí lo ven los demás'
                          : 'Lo que se capture aquí no lo verán los demás equipos.'}</span>
      </div>
      ${!conectado && hayNube
        ? `<button class="btn btn-primary full" onclick="closeModal(); mostrarAccesoNegocio()">
             ${icon('upload', 16)} Conectar este equipo</button>` : ''}
      ${conectado
        ? `<button class="btn btn-line full" onclick="closeModal(); revisarConexion()">
             ${icon('search', 16)} Revisar sincronización</button>` : ''}
      <button class="btn btn-danger full" onclick="closeModal(); logout()">Cerrar sesión</button>
      <p class="firma cuenta">Hecho por <b>Ximena Ortega</b></p>
    </div>`);
}

/** El aviso lleva a conectar el equipo, o muestra el diagnóstico si ya entró. */
function tocarSyncChip() {
  if (typeof Cloud !== 'undefined' && Cloud.online) revisarConexion();
  else mostrarAccesoNegocio();
}

/** cloud.js llama aquí cada vez que sube algo o queda pendiente. */
function onCloudStatus() { actualizarEstadoNube(); }

function actualizarEstadoNube() {
  const hayNube = typeof Cloud !== 'undefined' && !!cloudConfig();
  const conectado = hayNube && Cloud.online;

  const lat = $('#userStatus');
  if (lat) lat.textContent = !hayNube ? 'Solo en este equipo'
    : conectado ? 'Sincronizado' : (Cloud.error ? 'Sin conexión' : 'Falta entrar al negocio');

  const chip = $('#syncChip');
  if (!chip) return;

  // Conectado y con todo subido: no hace falta decir nada.
  if (conectado && !Cloud.pendientes.size && !Cloud.syncing) { chip.classList.add('hidden'); return; }
  chip.classList.remove('hidden');

  if (conectado && Cloud.syncing) {
    chip.className = 'sync-chip trabajando';
    chip.innerHTML = `${icon('upload', 15)}<span>Guardando…</span>`;
    chip.title = 'Subiendo los cambios.';
  } else if (conectado) {
    chip.className = 'sync-chip pendiente';
    chip.innerHTML = `${icon('clock', 15)}<span>Sin guardar</span>`;
    chip.title = 'Hay cambios que no se pudieron subir. Se reintenta solo.';
  } else {
    chip.className = 'sync-chip';
    chip.innerHTML = `${icon('alert', 15)}<span>Sin sincronizar</span>`;
    chip.title = hayNube
      ? 'Este equipo no ha entrado al negocio: lo que hagas aquí no lo ven los demás. Toca para conectarlo.'
      : 'Este equipo trabaja solo.';
  }
}

arrancar();

/* Vista rápida para revisión visual: index.html?demo=admin */
const demoRole = new URLSearchParams(location.search).get('demo');
if (demoRole && getUsers()[demoRole]) {
  sembrarDefaults();
  session = { role: demoRole, label: getUsers()[demoRole].label };
  $('#loginView').classList.add('hidden');
  $('#cloudView').classList.add('hidden');
  $('#appView').classList.remove('hidden');
  $('#userRoleLabel').textContent = session.label;
  $('#userAvatar').textContent = session.label[0];
  go('home');
}
