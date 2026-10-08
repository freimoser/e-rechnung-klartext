// Registriert den Service Worker erst, wenn die Seite fertig geladen und der Browser im Leerlauf ist.
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  const register = () => navigator.serviceWorker.register('/e-rechnung-klartext/sw.js', { scope: '/e-rechnung-klartext/' }).catch(() => {});
  window.addEventListener('load', () => {
    setTimeout(() => {
      if ('requestIdleCallback' in window) requestIdleCallback(register, { timeout: 5000 });
      else register();
    }, 3000);
  });
}
