// Push notification + PWA service worker
// This file must be served from /public/sw.js

const CACHE_NAME = "flamencalia-v1";
const OFFLINE_URL = "/";

// Cache essential assets on install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        cache.addAll([
          OFFLINE_URL,
          "/icons/icon-192.png",
          "/icons/icon-512.png",
          "/cliente/Abanico.svg",
        ]),
      ),
  );
  self.skipWaiting();
});

// Clean old caches on activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
        ),
      ),
  );
  self.clients.claim();
});

// Network-first strategy for navigation, cache-first for static assets
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL)),
    );
  }
});

self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};

  const options = {
    body: data.body || "Tienes una nueva notificación",
    icon: "/cliente/flamencalia.jpg",
    badge: "/cliente/flamencalia.jpg",
    data: {
      url: data.url || "/dashboard",
    },
    tag: data.tag || "flamencalia-notification",
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "Flamencalia", options),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(url) && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      }),
  );
});
