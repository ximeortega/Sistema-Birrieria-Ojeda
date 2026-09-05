/* =========================================================================
   Birriería Ojeda · Copia local del sistema
   Guarda los archivos de la página para que abra aunque no haya internet.

   Regla de oro: primero se pregunta a la red y solo si no contesta se usa
   la copia. Así nadie trabaja con una versión vieja —ni con precios
   viejos— por tener guardado algo de ayer.
   ========================================================================= */
const CAJA = 'birrieria-ojeda-v1';

const SUPABASE_JS = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js';

const ARCHIVOS = [
  './', './index.html', './styles.css',
  './app.js', './cloud.js', './config.js', './xlsx.js',
  './logo.jpg', './manifest.webmanifest',
  SUPABASE_JS,
];

/** ¿Vale la pena guardar una copia de esto? */
function seGuarda(url) {
  return url.origin === self.location.origin || url.hostname === 'cdn.jsdelivr.net';
}

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const caja = await caches.open(CAJA);
    // Si alguno falla no se cae la instalación: se guarda lo que sí se pueda.
    await Promise.allSettled(ARCHIVOS.map((u) => caja.add(u)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const cajas = await caches.keys();
    await Promise.all(cajas.filter((c) => c !== CAJA).map((c) => caches.delete(c)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const pedido = e.request;

  // Cobros, guardados y todo lo que no sea una simple lectura va directo.
  if (pedido.method !== 'GET') return;

  const url = new URL(pedido.url);
  // La nube nunca se guarda aquí: sus datos tienen que ser los del momento.
  if (url.hostname.endsWith('supabase.co')) return;

  e.respondWith((async () => {
    try {
      const deLaRed = await fetch(pedido);
      if (deLaRed && deLaRed.ok && seGuarda(url)) {
        const caja = await caches.open(CAJA);
        caja.put(pedido, deLaRed.clone());
      }
      return deLaRed;
    } catch (falla) {
      const copia = await caches.match(pedido);
      if (copia) return copia;
      // Sin señal y sin copia exacta: al menos se abre la pantalla principal.
      if (pedido.mode === 'navigate') {
        const inicio = await caches.match('./index.html');
        if (inicio) return inicio;
      }
      throw falla;
    }
  })());
});
