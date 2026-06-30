const CACHE_NAME = 'video-downloader-cache-v1';
const urlsToCache = [
  './index.html',
  './style.css',
  './script.js',
  './icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  // تەنها بۆ فایچەکانی لۆکاڵ کار دەکات، بۆ API کار ناکات بۆ ئەوەی داتای تازە بهێنێت
  if (event.request.url.startsWith('http') && !event.request.url.includes('rapidapi.com')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(event.request);
        })
    );
  }
});
