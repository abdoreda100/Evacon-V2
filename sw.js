/* Evacon service worker: receives Web Push when website is not open. */
self.addEventListener('push', (event) => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch { /* show generic */ }
  const title = typeof payload.title === 'string' ? payload.title.slice(0, 100) : 'Evacon - إشعار جديد';
  const body = typeof payload.body === 'string' ? payload.body.slice(0, 250) : 'افتح Evacon للاطلاع على التفاصيل.';
  const allowed = new Set(['notifications', 'requests', 'offers', 'followups', 'dashboard']);
  const page = allowed.has(payload.page) ? payload.page : 'notifications';
  event.waitUntil(self.registration.showNotification(title, {
    body,
    icon: './icons/icon-192.png',
    badge: './icons/icon-192.png',
    tag: typeof payload.tag === 'string' ? payload.tag.slice(0, 180) : undefined,
    data: { page },
    dir: 'rtl',
    lang: 'ar',
    renotify: false
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const allowed = new Set(['notifications', 'requests', 'offers', 'followups', 'dashboard']);
  const page = allowed.has(event.notification.data?.page) ? event.notification.data.page : 'notifications';
  event.waitUntil((async () => {
    const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clientsList) {
      if (client.url.startsWith(self.registration.scope)) {
        client.postMessage({ type: 'EVACON_PUSH_OPEN', page });
        return client.focus();
      }
    }
    if (self.clients.openWindow) {
      return self.clients.openWindow(self.registration.scope + '?evaconPage=' + encodeURIComponent(page));
    }
  })());
});
