// Registriert den Service Worker erst nach dem Laden, damit er die Seite nicht bremst.
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      navigator.serviceWorker.register('/e-rechnung-klartext/sw.js', { scope: '/e-rechnung-klartext/' }).catch(() => {});
    }, 1500);
  });
}
