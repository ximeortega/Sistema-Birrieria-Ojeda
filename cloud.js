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
const SETTING_KEYS = ['users', 'tableCount', 'bizName', 'funds', 'defaultFund', 'initialFund', 'logo'];

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
  realtimeOk: false,       // ¿el aviso instantáneo quedó conectado?
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
  await cloudPullAll();
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
    Object.keys(bajado).forEach((k) => {
      marcarSincronizado(k, bajado[k]);              // lo de la nube queda confirmado
      stateSet(k, fusionarConPendientes(k, bajado[k]));  // sin perder lo que falta subir
      marcarLeidoHasta(k, crudo[k]);
    });

    const ajustes = (se.data && se.data.data) || {};
    SETTING_KEYS.forEach((k) => { if (ajustes[k] !== undefined) stateSet(k, ajustes[k]); });
    Cloud.error = null;
  } catch (e) {
    Cloud.error = 'No se pudo leer de la nube: ' + e.message;
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
  for (const key of [...Cloud.pendientes]) await cloudSyncArray(key, stateGet(key) || []);
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
const ordenAFila = (o) => ({
  id: o.id, folio: o.folio, date: o.date, table_name: o.table, customer: o.customer || '',
  created_at: o.createdAt, created_time: o.createdTime, waiter: o.waiter || null,
  items: o.items || [], paid: !!o.paid, payment: o.payment || null,
});
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
      await cloudSyncArray(key, stateGet(key) || []);
    }
    if (Cloud.pendientes.size) programarReintento();
  }, 6000);
}

/** Todas las claves de configuración van juntas en una sola fila. */
let settingsTimer = null;
function cloudSyncSettings() {
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
      Cloud.error = null;
    } catch (e) {
      Cloud.error = 'No se pudo guardar la configuración: ' + e.message;
    }
  }, 400);
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
