// Nombre del caché de la aplicación
const CACHE_NAME = 'rendiciones-cache-v1';

// Archivos locales que se pueden guardar para carga rápida
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json'
];

// Evento de instalación: guarda los archivos básicos en caché
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        }).then(() => {
            return self.skipWaiting();
        })
    );
});

// Evento de activación: limpia versiones viejas de caché
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

// Evento fetch: Requerido para habilitar el instalador nativo de la PWA.
// Excluimos las llamadas a Google Apps Script para que los datos de tus rendiciones se actualicen siempre en tiempo real.
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // Si la petición va dirigida a Google Apps Script, se fuerza el paso directo por red (sin usar caché)
    if (url.hostname.includes('script.google.com') || url.hostname.includes('googleusercontent.com')) {
        return; 
    }

    // Para archivos locales estáticos (HTML, CSS o iconos), intenta leerlos de caché y si no los busca en la red
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request);
        })
    );
});
