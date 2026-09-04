/* =========================================================================
   Birriería Ojeda · Sincronización con Supabase
   -------------------------------------------------------------------------
   El sistema sigue funcionando igual si no hay nube: en ese caso todo vive
   en localStorage, como antes. Cuando se configura Supabase, esta capa:
     · sube y baja los cambios fila por fila (una comanda = una fila),
     · escucha en tiempo real para que cocina y caja vean lo mismo,
     · guarda además una copia local por si se cae el internet.
   ========================================================================= */

const CLOUD_CFG_KEY = 'bo_cloud_cfg';

/** Claves que viven en su propia tabla; cada elemento del arreglo es una fila. */
const TABLE_KEYS = {
  products: 'products',
  orders:   'orders',
  expenses: 'expenses',
  cuts:     'cuts',
};
/** Claves de configuración: todas juntas en una sola fila de `settings`. */
const SETTING_KEYS = ['users', 'tableCount', 'bizName', 'funds', 'defaultFund', 'initialFund', 'logo', 'waReparto'];

const Cloud = {
  client: null,          // cliente de supabase-js
  session: null,         // sesión activa del negocio
  cfg: null,             // { url, key }
  online: false,         // hay cliente y sesión
  syncing: false,        // hay una subida en curso
  error: null,           // último problema, para mostrarlo en Ajustes
  channels: [],
  /**
   * Espejo de lo que la nube ya tiene confirmado: clave → Map(id → json).
   * Hace falta porque la app trabaja sobre el mismo arreglo que guarda: modifica
   * una comanda y llama a DB.set con ese mismo arreglo. Comparando contra el
   * espejo se sabe de verdad qué cambió.
   */
  espejo: {},
  pendientes: new Set(),   // claves que no se pudieron subir
  reintento: null,
  desde: {},               // último updated_at visto por tabla
  latido: null,            // repaso periódico
  settingsSucio: false,    // hay configuración sin guardar
  sinColumnaEntrega: false, // la base todavía no tiene orders.delivery
  realtimeOk: false,       // ¿el aviso instantáneo quedó conectado?
  trajoCambios: false,     // la última bajada trajo algo distinto
};

const TABLAS = ['products', 'orders', 'expenses', 'cuts'];
const A_OBJETO = {};       // se llena más abajo, cuando existen los convertidores

/** Marca lo que ya está confirmado en la nube. */
function marcarSincronizado(key, filas) {
  Cloud.espejo[key] = new Map((filas || []).map((x) => [x.id, JSON.stringify(x)]));
}

/**
 * Une lo que llega de la nube con lo que este equipo cambió y todavía no sube.
 * Sin esto, un aviso de tiempo real que llegue justo después de editar un precio
 * pisaría el cambio con el valor viejo antes de que alcance a guardarse.
 */
function sinSubirDe(key) {
  const local = (typeof stateGet === 'function' && stateGet(key)) || [];
  const confirmado = Cloud.espejo[key] || new Map();
  const pend = new Map();
  local.forEach((x) => {
    if (confirmado.get(x.id) !== JSON.stringify(x)) pend.set(x.id, x);
  });
  return pend;
}

function fusionarConPendientes(key, filasNube) {
  const sinSubir = sinSubirDe(key);
  if (!sinSubir.size) return filasNube;

  const enLaNube = new Set(filasNube.map((f) => f.id));
  const unido = filasNube.map((f) => (sinSubir.has(f.id) ? sinSubir.get(f.id) : f));
  sinSubir.forEach((v, id) => { if (!enLaNube.has(id)) unido.push(v); });
  return unido;
}

/* ---------- Configuración guardada en este dispositivo ------------------ */
/**
 * Deja solo la dirección del proyecto. En el panel de Supabase la URL aparece
 * como .../rest/v1/, y si se pega así el cliente termina pidiendo
 * /rest/v1/rest/v1/... y el servidor responde "Invalid path specified".
 */
function normalizaUrl(u) {
  const t = String(u || '').trim();
  if (!t) return '';
  try { return new URL(t).origin; }
  catch { return t.replace(/\/(rest|auth|realtime|storage)\/v1\/?$/i, '').replace(/\/+$/, ''); }
}

function cloudConfig() {
  if (Cloud.cfg) return Cloud.cfg;
  try { Cloud.cfg = JSON.parse(localStorage.getItem(CLOUD_CFG_KEY)) || null; } catch { Cloud.cfg = null; }
  // Arregla en el momento una dirección que se haya guardado con el path de más.
  if (Cloud.cfg && Cloud.cfg.url) {
    const limpia = normalizaUrl(Cloud.cfg.url);
    if (limpia !== Cloud.cfg.url) {
      Cloud.cfg.url = limpia;
      try { localStorage.setItem(CLOUD_CFG_KEY, JSON.stringify(Cloud.cfg)); } catch {}
    }
  }
  // Si este equipo no tiene una conexión propia, se usa la que viene en config.js.
  if (!Cloud.cfg && typeof window !== 'undefined' && window.BO_SUPABASE && window.BO_SUPABASE.url) {
    Cloud.cfg = { url: normalizaUrl(window.BO_SUPABASE.url), key: window.BO_SUPABASE.key };
  }
  return Cloud.cfg;
}
function saveCloudConfig(url, key) {
  Cloud.cfg = { url: normalizaUrl(url), key: String(key || '').trim() };
  localStorage.setItem(CLOUD_CFG_KEY, JSON.stringify(Cloud.cfg));
}
function clearCloudConfig() {
  Cloud.cfg = null;
  localStorage.removeItem(CLOUD_CFG_KEY);
}

/* ---------- Carga del cliente ------------------------------------------- */
/** supabase-js viene por CDN; si no cargó (sin internet) se sigue en local. */
function cloudLibReady() {
  return typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function';
}

function buildClient() {
  const cfg = cloudConfig();
  if (!cfg || !cfg.url || !cfg.key || !cloudLibReady()) return null;
  try {
    return window.supabase.createClient(cfg.url, cfg.key, {
      auth: { persistSession: true, autoRefreshToken: true, storageKey: 'bo_auth' },
    });
  } catch (e) {
    Cloud.error = 'No se pudo conectar: ' + e.message;
    return null;
  }
}

/**
 * Deja lista la conexión. Devuelve:
 *   'local'    → sin nube configurada
 *   'sin-sesion' → hay nube pero falta iniciar sesión del negocio
 *   'listo'    → conectado y con datos cargados
 */
async function cloudInit() {
  Cloud.error = null;
  if (!cloudConfig()) return 'local';

  Cloud.client = buildClient();
  if (!Cloud.client) return Cloud.error ? 'local' : 'local';

  const { data } = await Cloud.client.auth.getSession();
  Cloud.session = data ? data.session : null;
  if (!Cloud.session) { Cloud.online = false; return 'sin-sesion'; }

  Cloud.online = true;
  anotarDispositivo(typeof session !== 'undefined' && session ? session.label : null);
  await cloudPullAll();
  await cloudEmpujarDiferencias();   // lo que se editó sin conexión sube ahora
  cloudListen();
  iniciarLatido();
  engancharDespertares();
  return 'listo';
}

async function cloudSignIn(email, password) {
  if (!Cloud.client) Cloud.client = buildClient();
  if (!Cloud.client) return { error: 'Falta configurar la dirección y la clave de Supabase.' };
  const { data, error } = await Cloud.client.auth.signInWithPassword({ email, password });
  if (error) return { error: traducirError(error.message) };
  Cloud.session = data.session;
  Cloud.online = true;
  return {};
}

async function cloudSignUp(email, password) {
  if (!Cloud.client) Cloud.client = buildClient();
  if (!Cloud.client) return { error: 'Falta configurar la dirección y la clave de Supabase.' };
  const { data, error } = await Cloud.client.auth.signUp({ email, password });
  if (error) return { error: traducirError(error.message) };
  // Si el proyecto pide confirmar el correo, todavía no hay sesión.
  if (!data.session) return { pendiente: true };
  Cloud.session = data.session;
  Cloud.online = true;
  return {};
}

async function cloudSignOut() {
  if (Cloud.client) await Cloud.client.auth.signOut();
  cloudStopListening();
  Cloud.session = null;
  Cloud.online = false;
  Cloud.espejo = {};
  Cloud.desde = {};
  Cloud.pendientes.clear();
  detenerLatido();
}

function traducirError(msg) {
  const m = String(msg || '');
  if (/Invalid login credentials/i.test(m)) return 'Correo o contraseña incorrectos.';
  if (/already registered/i.test(m))        return 'Ese correo ya está registrado. Usa "Entrar".';
  if (/Password should be/i.test(m))        return 'La contraseña debe tener al menos 6 caracteres.';
  if (/Unable to validate email/i.test(m))  return 'El correo no parece válido.';
  if (/Email not confirmed/i.test(m))       return 'Falta confirmar el correo desde tu bandeja de entrada.';
  if (/Failed to fetch|NetworkError/i.test(m)) return 'Sin conexión con Supabase. Revisa la dirección del proyecto.';
  return m;
}

/* ---------- Bajar información ------------------------------------------- */
const filaAOrden = (r) => ({
  id: r.id, folio: r.folio, date: r.date, table: r.table_name, customer: r.customer || '',
  createdAt: r.created_at, createdTime: r.created_time, waiter: r.waiter,
  items: r.items || [], paid: !!r.paid, payment: r.payment || undefined,
  delivery: r.delivery || null,
});
const filaAGasto = (r) => ({
  id: r.id, date: r.date, time: r.time, category: r.category, description: r.description,
  amount: Number(r.amount || 0), responsible: r.responsible, items: r.items || undefined,
});
const filaAProducto = (r) => ({
  id: r.id, name: r.name, price: Number(r.price || 0), category: r.category, active: !!r.active,
});
const filaACorte = (r) => ({ ...(r.data || {}), id: r.id, date: r.date, time: r.time });

/** Trae todo de la nube y lo deja en la caché de memoria. */
async function cloudPullAll() {
  const c = Cloud.client;
  if (!c) return;
  try {
    const [pr, or_, ex, cu, se] = await Promise.all([
      c.from('products').select('*'),
      c.from('orders').select('*'),
      c.from('expenses').select('*'),
      c.from('cuts').select('*'),
      c.from('settings').select('*').maybeSingle(),
    ]);
    const fallo = [pr, or_, ex, cu, se].find((r) => r.error);
    if (fallo) throw new Error(fallo.error.message);

    const bajado = {
      products: (pr.data || []).map(filaAProducto),
      orders:   (or_.data || []).map(filaAOrden),
      expenses: (ex.data || []).map(filaAGasto),
      cuts:     (cu.data || []).map(filaACorte),
    };
    const crudo = { products: pr.data, orders: or_.data, expenses: ex.data, cuts: cu.data };
    Cloud.trajoCambios = false;
    Object.keys(bajado).forEach((k) => {
      const antes = JSON.stringify((typeof stateGet === 'function' && stateGet(k)) || []);
      marcarSincronizado(k, bajado[k]);              // lo de la nube queda confirmado
      const unido = fusionarConPendientes(k, bajado[k]);
      stateSet(k, unido);                            // sin perder lo que falta subir
      marcarLeidoHasta(k, crudo[k]);
      if (JSON.stringify(unido) !== antes) Cloud.trajoCambios = true;
    });

    const ajustes = (se.data && se.data.data) || {};
    SETTING_KEYS.forEach((k) => {
      if (ajustes[k] === undefined) return;
      if (JSON.stringify(stateGet(k)) !== JSON.stringify(ajustes[k])) Cloud.trajoCambios = true;
      stateSet(k, ajustes[k]);
    });
    Cloud.error = null;
  } catch (e) {
    Cloud.error = 'No se pudo leer de la nube: ' + e.message;
    Cloud.trajoCambios = true;   // ante la duda, se redibuja
  }
}

/**
 * Trae solo lo que cambió desde la última vez, usando updated_at.
 * Es la red de seguridad: aunque el aviso instantáneo falle o el celular haya
 * estado en reposo, en el siguiente repaso todo queda al día sin traer de
 * vuelta el histórico completo.
 */
async function cloudRefrescar() {
  const c = Cloud.client;
  if (!c || !Cloud.online) return false;
  let hubo = false;

  for (const tabla of TABLAS) {
    const desde = Cloud.desde[tabla] || '1970-01-01T00:00:00Z';
    try {
      const { data, error } = await c.from(tabla).select('*')
        .gte('updated_at', desde).order('updated_at', { ascending: true });
      if (error) throw new Error(error.message);
      if (!data || !data.length) continue;

      const sinSubir = sinSubirDe(tabla);
      const actual = new Map(((typeof stateGet === 'function' && stateGet(tabla)) || []).map((x) => [x.id, x]));
      const espejo = Cloud.espejo[tabla] || (Cloud.espejo[tabla] = new Map());

      data.forEach((r) => {
        const fila = A_OBJETO[tabla](r);
        espejo.set(fila.id, JSON.stringify(fila));   // la nube ya lo tiene así
        if (sinSubir.has(fila.id)) return;           // lo de este equipo manda hasta que suba
        const previo = actual.get(fila.id);
        if (!previo || JSON.stringify(previo) !== JSON.stringify(fila)) {
          actual.set(fila.id, fila);
          hubo = true;
        }
      });

      if (hubo) stateSet(tabla, [...actual.values()]);
      Cloud.desde[tabla] = data[data.length - 1].updated_at;
    } catch (e) {
      Cloud.error = 'No se pudo revisar ' + tabla + ': ' + e.message;
    }
  }

  // Lo que este equipo dejó pendiente se reintenta en el mismo repaso.
  for (const key of [...Cloud.pendientes]) {
    if (key === 'settings') cloudSyncSettings();
    else await cloudSyncArray(key, stateGet(key) || []);
  }
  if (await purgarBorrados()) hubo = true;
  return hubo;
}

/**
 * updated_at no sirve para enterarse de un borrado: la fila ya no está.
 * Cada minuto se pide solo la lista de identificadores y se quita lo que
 * otro equipo haya eliminado, respetando lo que aquí falta por subir.
 */
let ciclosDesdePurga = 0;
async function purgarBorrados() {
  if (++ciclosDesdePurga < 6) return false;
  ciclosDesdePurga = 0;
  const c = Cloud.client;
  if (!c) return false;
  let hubo = false;

  for (const tabla of TABLAS) {
    try {
      const { data, error } = await c.from(tabla).select('id');
      if (error) throw new Error(error.message);
      const vivos = new Set((data || []).map((r) => r.id));
      const sinSubir = sinSubirDe(tabla);
      const local = stateGet(tabla) || [];
      const quedan = local.filter((x) => vivos.has(x.id) || sinSubir.has(x.id));
      if (quedan.length !== local.length) {
        local.forEach((x) => { if (!vivos.has(x.id) && !sinSubir.has(x.id)) Cloud.espejo[tabla].delete(x.id); });
        stateSet(tabla, quedan);
        hubo = true;
      }
    } catch (e) {
      Cloud.error = 'No se pudo revisar borrados en ' + tabla + ': ' + e.message;
    }
  }
  return hubo;
}

/** Guarda hasta dónde se leyó, para pedir solo lo nuevo la próxima vez. */
function marcarLeidoHasta(tabla, filas) {
  const t = (filas || []).map((r) => r.updated_at).filter(Boolean).sort().pop();
  if (t) Cloud.desde[tabla] = t;
}

/** Repaso automático mientras la app esté a la vista. */
function iniciarLatido() {
  detenerLatido();
  Cloud.latido = setInterval(async () => {
    if (!Cloud.online) return;
    if (typeof document !== 'undefined' && document.hidden) return;   // en reposo no gasta datos
    const hubo = await cloudRefrescar();
    anotarDispositivo(typeof session !== 'undefined' && session ? session.label : null);
    if (hubo && typeof onCloudChange === 'function') onCloudChange();
    if (typeof onCloudStatus === 'function') onCloudStatus();
  }, 10000);
}
function detenerLatido() { if (Cloud.latido) { clearInterval(Cloud.latido); Cloud.latido = null; } }

/** Al volver a la app o al recuperar internet, se pone al día de inmediato. */
function engancharDespertares() {
  if (typeof document === 'undefined' || Cloud._enganchado) return;
  Cloud._enganchado = true;
  const alDia = async () => {
    if (!Cloud.online) return;
    const hubo = await cloudRefrescar();
    if (hubo && typeof onCloudChange === 'function') onCloudChange();
    if (typeof onCloudStatus === 'function') onCloudStatus();
  };
  document.addEventListener('visibilitychange', () => { if (!document.hidden) alDia(); });
  if (typeof window !== 'undefined') {
    window.addEventListener('online', alDia);
    window.addEventListener('focus', alDia);
  }
}

/** Vuelve a bajar una sola tabla (lo usa el tiempo real). */
async function cloudPullTable(tabla) {
  const c = Cloud.client;
  if (!c) return;
  try {
    if (tabla === 'settings') {
      const { data } = await c.from('settings').select('*').maybeSingle();
      const ajustes = (data && data.data) || {};
      SETTING_KEYS.forEach((k) => { if (ajustes[k] !== undefined) stateSet(k, ajustes[k]); });
      return;
    }
    const { data, error } = await c.from(tabla).select('*');
    if (error) throw new Error(error.message);
    const mapa = { products: filaAProducto, orders: filaAOrden, expenses: filaAGasto, cuts: filaACorte };
    const filas = (data || []).map(mapa[tabla]);
    marcarLeidoHasta(tabla, data);
    const habiaPendientes = sinSubirDe(tabla).size > 0;
    const unido = fusionarConPendientes(tabla, filas);
    marcarSincronizado(tabla, filas);
    stateSet(tabla, unido);
    // Lo que este equipo tenía sin subir se aprovecha para mandarlo ahora.
    if (habiaPendientes || Cloud.pendientes.has(tabla)) await cloudSyncArray(tabla, unido);
  } catch (e) {
    Cloud.error = 'No se pudo actualizar ' + tabla + ': ' + e.message;
  }
}

/* ---------- Subir cambios ------------------------------------------------ */
const ordenAFila = (o) => {
  const fila = {
    id: o.id, folio: o.folio, date: o.date, table_name: o.table, customer: o.customer || '',
    created_at: o.createdAt, created_time: o.createdTime, waiter: o.waiter || null,
    items: o.items || [], paid: !!o.paid, payment: o.payment || null,
    delivery: o.delivery || null,
  };
  // Si la base todavía no tiene la columna de entrega, se manda sin ella.
  if (Cloud.sinColumnaEntrega) delete fila.delivery;
  return fila;
};
const gastoAFila = (e) => ({
  id: e.id, date: e.date, time: e.time, category: e.category, description: e.description,
  amount: Number(e.amount || 0), responsible: e.responsible, items: e.items || null,
});
const productoAFila = (p) => ({
  id: p.id, name: p.name, price: Number(p.price || 0), category: p.category, active: !!p.active,
});
const corteAFila = (c) => ({ id: c.id, date: c.date, time: c.time, data: c });

const A_FILA = { products: productoAFila, orders: ordenAFila, expenses: gastoAFila, cuts: corteAFila };
Object.assign(A_OBJETO, { products: filaAProducto, orders: filaAOrden, expenses: filaAGasto, cuts: filaACorte });

/**
 * Sube solo lo que cambió respecto a lo que la nube ya tiene confirmado.
 * Cada comanda es una fila, así que dos dispositivos pueden trabajar a la vez
 * sin borrarse el trabajo.
 */
async function cloudSyncArray(key, ahora) {
  const c = Cloud.client;
  const filas = ahora || [];
  if (!c || !Cloud.online) return;

  const confirmado = Cloud.espejo[key] || new Map();
  const cambiados = filas.filter((x) => confirmado.get(x.id) !== JSON.stringify(x));
  const vivos = new Set(filas.map((x) => x.id));
  const borrados = [...confirmado.keys()].filter((id) => !vivos.has(id));
  if (!cambiados.length && !borrados.length) return;

  Cloud.syncing = true;
  try {
    if (cambiados.length) {
      const { error } = await c.from(key).upsert(cambiados.map(A_FILA[key]), { onConflict: 'id' });
      if (error) throw new Error(error.message);
    }
    if (borrados.length) {
      const { error } = await c.from(key).delete().in('id', borrados);
      if (error) throw new Error(error.message);
    }
    // Solo cuando el servidor confirmó se da por sincronizado.
    marcarSincronizado(key, filas);
    Cloud.pendientes.delete(key);
    Cloud.error = null;
  } catch (e) {
    // La columna de entrega es nueva: si la base aún no la tiene, se reintenta sin ella.
    if (!Cloud.sinColumnaEntrega && /delivery/i.test(e.message) &&
        /column|schema cache|PGRST204/i.test(e.message)) {
      Cloud.sinColumnaEntrega = true;
      Cloud.syncing = false;
      return cloudSyncArray(key, ahora);
    }
    // Se deja pendiente para volver a intentarlo; el espejo no se toca.
    Cloud.pendientes.add(key);
    Cloud.error = 'No se pudo guardar en la nube: ' + e.message;
    programarReintento();
  } finally {
    Cloud.syncing = false;
    if (typeof onCloudStatus === 'function') onCloudStatus();
  }
}

/** Vuelve a intentar lo que quedó pendiente, sin atosigar al servidor. */
function programarReintento() {
  if (Cloud.reintento || !Cloud.pendientes.size) return;
  Cloud.reintento = setTimeout(async () => {
    Cloud.reintento = null;
    for (const key of [...Cloud.pendientes]) {
      if (key === 'settings') cloudSyncSettings();
      else await cloudSyncArray(key, stateGet(key) || []);
    }
    if (Cloud.pendientes.size) programarReintento();
  }, 6000);
}

/** Todas las claves de configuración van juntas en una sola fila. */
let settingsTimer = null;
function cloudSyncSettings() {
  Cloud.settingsSucio = true;
  if (!Cloud.client || !Cloud.online) return;
  clearTimeout(settingsTimer);
  // Se agrupa: al cambiar varias opciones seguidas se manda una sola vez.
  settingsTimer = setTimeout(async () => {
    const data = {};
    SETTING_KEYS.forEach((k) => { const v = stateGet(k); if (v !== undefined) data[k] = v; });
    try {
      const owner = Cloud.session && Cloud.session.user && Cloud.session.user.id;
      const { error } = await Cloud.client.from('settings').upsert({ owner, data }, { onConflict: 'owner' });
      if (error) throw new Error(error.message);
      Cloud.settingsSucio = false;
      Cloud.pendientes.delete('settings');
      Cloud.error = null;
    } catch (e) {
      // Igual que las tablas: queda pendiente y se reintenta.
      Cloud.pendientes.add('settings');
      Cloud.error = 'No se pudo guardar la configuración: ' + e.message;
      programarReintento();
    }
    if (typeof onCloudStatus === 'function') onCloudStatus();
  }, 400);
}

/**
 * Sube todo lo que este equipo tenga distinto de lo que la nube confirmó.
 * Cubre lo que se capturó sin internet o antes de entrar al negocio: al
 * conectar, esos cambios se van solos en vez de quedarse aquí.
 */
async function cloudEmpujarDiferencias() {
  if (!Cloud.client || !Cloud.online) return;
  for (const key of TABLAS) {
    if (sinSubirDe(key).size) await cloudSyncArray(key, stateGet(key) || []);
  }
  if (Cloud.settingsSucio) cloudSyncSettings();
}

/** Primera subida: manda lo que ya había en este dispositivo. */
async function cloudPushAll() {
  if (!Cloud.client || !Cloud.online) return;
  for (const key of Object.keys(TABLE_KEYS)) {
    Cloud.espejo[key] = new Map();          // se manda todo, sin comparar
    await cloudSyncArray(key, stateGet(key) || []);
  }
  cloudSyncSettings();
}

/* ---------- Dispositivos ------------------------------------------------ */
/**
 * Cada equipo se anota en una tabla propia con la hora en que se le vio por
 * última vez. Así en Ajustes se puede saber qué tabletas siguen en uso, con
 * qué perfil, y cuáles ya nadie abre.
 */
const DEVICE_KEY = 'bo_dispositivo';

function idDispositivo() {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = 'eq-' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch { return 'eq-sin-guardar'; }
}

/** Nombre corto del aparato, para reconocerlo en la lista. */
function plataformaDispositivo() {
  const nav = (typeof navigator !== 'undefined' && navigator) || {};
  const ua = nav.userAgent || '';
  const tactil = Number(nav.maxTouchPoints || 0) > 1;
  if (/iPhone/i.test(ua)) return 'iPhone';
  if (/iPad/i.test(ua)) return 'iPad';
  // Los iPad nuevos se hacen pasar por Mac: se les nota por la pantalla táctil.
  if (/Macintosh|Mac OS X/i.test(ua)) return tactil ? 'iPad' : 'Mac';
  if (/Android/i.test(ua)) return /Mobile/i.test(ua) ? 'Android' : 'Tablet Android';
  if (/Windows/i.test(ua)) return 'Windows';
  if (/Linux|X11/i.test(ua)) return 'Linux';
  return 'Otro';
}

/** Con qué navegador abren el link. */
function navegadorDispositivo() {
  const ua = (typeof navigator !== 'undefined' && navigator.userAgent) || '';
  if (/Edg/i.test(ua)) return 'Edge';
  if (/OPR|Opera/i.test(ua)) return 'Opera';
  if (/CriOS|Chrome/i.test(ua)) return 'Chrome';
  if (/FxiOS|Firefox/i.test(ua)) return 'Firefox';
  if (/Safari/i.test(ua)) return 'Safari';
  return '';
}

/**
 * Cada equipo lleva su propia libreta de ratos conectados. Si pasaron menos
 * de 30 minutos desde la última señal, se alarga el rato que ya estaba;
 * si no, empieza uno nuevo. Solo se guardan los últimos 40.
 */
const DEVICE_LOG_KEY = 'bo_dispositivo_ratos';
const CORTE_RATO = 30 * 60000;

function apuntarRato() {
  let ratos = [];
  try { ratos = JSON.parse(localStorage.getItem(DEVICE_LOG_KEY) || '[]') || []; } catch { ratos = []; }
  if (!Array.isArray(ratos)) ratos = [];

  const ahora = new Date().toISOString();
  const ultimo = ratos[ratos.length - 1];
  if (ultimo && new Date(ahora) - new Date(ultimo.h) < CORTE_RATO) ultimo.h = ahora;
  else ratos.push({ d: ahora, h: ahora });

  if (ratos.length > 40) ratos = ratos.slice(-40);
  try { localStorage.setItem(DEVICE_LOG_KEY, JSON.stringify(ratos)); } catch {}
  return ratos;
}

let sinColumnasNuevas = false;  // las columnas de navegador e historial pueden faltar
let errorEquipo = null;         // por qué no se pudo anotar este equipo, si es que falló
let anotado = false;            // ¿ya quedó anotado en la nube?

async function anotarDispositivo(perfil) {
  if (!Cloud.client || !Cloud.online) return;
  try {
    const fila = {
      id: idDispositivo(),
      plataforma: plataformaDispositivo(),
      last_seen: new Date().toISOString(),
    };
    // Si nadie ha puesto su PIN todavía, no se pisa el perfil anterior.
    if (perfil) fila.perfil = perfil;
    if (!sinColumnasNuevas) {
      fila.navegador = navegadorDispositivo();
      fila.historial = apuntarRato();
    }

    let { error } = await Cloud.client.from('devices').upsert(fila, { onConflict: 'id' });
    // Si todavía no se corrió el SQL de las columnas nuevas, se manda sin ellas.
    if (error && /navegador|historial|column/i.test(error.message)) {
      sinColumnasNuevas = true;
      delete fila.navegador; delete fila.historial;
      ({ error } = await Cloud.client.from('devices').upsert(fila, { onConflict: 'id' }));
    }
    if (error) throw new Error(error.message);
    errorEquipo = null;
    anotado = true;
  } catch (e) {
    // El problema se guarda para poder verlo en Ajustes, no se esconde.
    errorEquipo = e.message;
    anotado = false;
  }
}

/** Cómo le fue a este equipo al anotarse. Se consulta desde Ajustes. */
function estadoDeEsteEquipo() {
  return { id: idDispositivo(), anotado, error: errorEquipo,
           aparato: plataformaDispositivo(), navegador: navegadorDispositivo() };
}

/** Lista de equipos del negocio, del más reciente al más viejo. */
async function listarDispositivos() {
  if (!Cloud.client || !Cloud.online) return { falta: false, lista: [] };
  try {
    const { data, error } = await Cloud.client.from('devices').select('*').order('last_seen', { ascending: false });
    if (error) throw new Error(error.message);
    return { falta: false, lista: data || [] };
  } catch (e) {
    // Una cosa es que falte la tabla y otra que la nube haya fallado:
    // decirlo mal manda a correr un SQL que no hacia falta.
    const sinTabla = /relation|does not exist|schema cache|devices/i.test(e.message);
    return { falta: sinTabla, error: e.message, lista: [] };
  }
}

async function renombrarDispositivo(id, nombre) {
  if (!Cloud.client || !Cloud.online) return false;
  try {
    const { error } = await Cloud.client.from('devices').update({ nombre }).eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  } catch { return false; }
}

async function olvidarDispositivo(id) {
  if (!Cloud.client || !Cloud.online) return false;
  try {
    const { error } = await Cloud.client.from('devices').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  } catch { return false; }
}

/* ---------- Tiempo real -------------------------------------------------- */
function cloudListen() {
  cloudStopListening();
  const c = Cloud.client;
  if (!c) return;
  ['products', 'orders', 'expenses', 'cuts', 'settings'].forEach((tabla) => {
    const ch = c.channel('bo-' + tabla)
      .on('postgres_changes', { event: '*', schema: 'public', table: tabla }, () => {
        cloudPullTable(tabla).then(() => {
          if (typeof onCloudChange === 'function') onCloudChange(tabla);
        });
      })
      .subscribe((estado) => {
        if (estado === 'SUBSCRIBED') Cloud.realtimeOk = true;
        if (typeof onCloudStatus === 'function') onCloudStatus();
      });
    Cloud.channels.push(ch);
  });
}
function cloudStopListening() {
  Cloud.channels.forEach((ch) => { try { Cloud.client.removeChannel(ch); } catch {} });
  Cloud.channels = [];
  Cloud.realtimeOk = false;
}
