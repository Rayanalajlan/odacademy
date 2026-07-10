const CACHE_NAME = "odacademy-static-v8";
// أيقونات الأقسام (~340KB لكل واحدة) خرجت من الـ precache حتى لا يحمّل
// الجوال ~2MB عند التثبيت؛ تُخزّن تلقائيًا عند أول استخدام عبر معالج fetch.
const STATIC_ASSETS = [
  "/offline.html",
  "/brand/munsaqah-icon-official.png",
  "/site.webmanifest",
  "/favicon.ico",
  "/favicon-16.png",
  "/favicon-32.png",
  "/apple-touch-icon.png",
  "/icons/app-icon-192.png",
  "/icons/app-icon-512.png"
];

async function cacheStaticAssets() {
  const cache = await caches.open(CACHE_NAME);

  await Promise.all(
    STATIC_ASSETS.map(async (asset) => {
      try {
        const response = await fetch(asset, { cache: "reload" });
        if (response.ok) await cache.put(asset, response);
      } catch {
        // لا نوقف تثبيت التطبيق بسبب ملف اختياري واحد.
      }
    })
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(cacheStaticAssets());
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

function shouldSkipCache(request) {
  const url = new URL(request.url);

  return (
    request.method !== "GET" ||
    url.origin !== self.location.origin ||
    request.mode === "navigate" ||
    url.pathname === "/" ||
    url.pathname === "/index.html" ||
    url.pathname.startsWith("/assets/") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.startsWith("/api/") ||
    url.pathname === "/env-config.js"
  );
}

self.addEventListener("fetch", (event) => {
  const request = event.request;

  // تنقّل بدون اتصال: نحاول الشبكة أولًا، وعند الفشل نعرض صفحة offline بدل خطأ المتصفح.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match("/offline.html").then(
          (cached) =>
            cached ||
            new Response("", { status: 503, statusText: "Offline" })
        )
      )
    );
    return;
  }

  if (shouldSkipCache(request)) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }

        return response;
      });
    })
  );
});
