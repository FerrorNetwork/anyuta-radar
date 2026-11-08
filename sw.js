'use strict';

/* Кэширует приложение, чтобы оно открывалось без интернета. Номер версии подставляет сборка сайта. */
const CACHE = 'radar-9bb451327f';
const FONTS = 'radar-fonts';
const FILES = ['./', 'index.html', 'css/app.css', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png',
  ...['core', 'sync', 'art', 'calendar-engine', 'sleep-engine', 'demo', 'data-feeding', 'data-daily', 'data-facts-extra', 'daily-engine', 'ui', 'view-sleep', 'view-calendar', 'view-feeding', 'view-daily', 'view-settings', 'app'].map(f => 'js/' + f + '.js')];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== FONTS).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET') return;
  if (/^fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(caches.open(FONTS).then(c => c.match(req).then(hit => hit || fetch(req).then(res => { c.put(req, res.clone()); return res; }))));
    return;
  }
  if (url.origin !== self.location.origin) return;
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).catch(() => (req.mode === 'navigate' ? caches.match('./') : Response.error()))));
});
