// Change this cache version whenever deploying updated website assets.
const CACHE = 'toyhaven-v3';
const ASSETS = [
  "./",
  "./logo.svg",
  "./products.html",
  "./cart.html",
  "./manifest.json",
  "./style.css",
  "./favicon.svg",
  "./checkout.html",
  "./support.html",
  "./wishlist.html",
  "./index.html",
  "./script.js",
  "./carousel.js",
  "./products-data.js",
  "./icons/icons-192.png",
  "./icons/icons-512.png",
  "./images/dungeon-deck.jpg",
  "./images/rally-racer.jpg",
  "./images/wooden-chess.jpg",
  "./images/muscle-car.jpg",
  "./images/sports-car.jpg",
  "./images/wooden-blocks.jpg",
  "./images/chibi-hero.jpg",
  "./images/cyberpunk-statue.jpg",
  "./images/mecha-warrior.svg",
  "./images/mecha-warrior.jpg",
  "./images/rc-drone.jpg",
  "./images/teddy-bear.jpg",
  "./images/board-game.jpg"
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('toyhaven-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
// Network first keeps deployed pages fresh; cache provides offline access.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).then(response => {
    if (response.ok) { const copy = response.clone(); event.waitUntil(caches.open(CACHE).then(cache => cache.put(event.request, copy))); }
    return response;
  }).catch(async () => {
    const cached = await caches.match(event.request, {ignoreSearch:true});
    return cached || new Response('This resource is unavailable offline.', {status:503, headers:{'Content-Type':'text/plain'}});
  }));
});
