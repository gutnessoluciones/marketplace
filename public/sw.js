// Push notification service worker
// This file must be served from /public/sw.js

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
