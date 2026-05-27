// Nombre del almacén de caché local para tu PWA de Rendiciones
const CACHE_NAME = 'rendiciones-cache-v1.2';

// Recursos estáticos básicos que se guardarán para que la app cargue de inmediato
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json'
];

// Evento de instalación: Almacena los archivos esenciales en la caché del teléfono
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        }).then(() => {
            return self.skipWaiting();
        })
    );
});

// Evento de activación: Elimina cachés obsoletos de versiones anteriores
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// Evento fetch: Intercepta las peticiones de red.
// Es un requisito indispensable para que Google Chrome apruebe la instalación en tu celular.
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // EXCLUSIÓN CRÍTICA: Forzamos a que las peticiones a Google Sheets (Apps Script) 
    // pasen siempre por internet real y nunca se queden guardadas en caché.
    // De lo contrario, tus registros nuevos no se verían reflejados en tiempo real.
    if (url.hostname.includes('script.google.com') || url.hostname.includes('googleusercontent.com')) {
        return; 
    }

    // Para el resto de archivos locales (HTML, estilos, iconos), intenta cargarlos 
    // desde la caché para máxima velocidad, o búscalos en la red si no están guardados.
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request);
        })
    );
});
