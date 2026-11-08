'use strict';

/* Запуск и обновление показаний */
Store.load();
render();

let lastDay = todayKey();
function tick() {
  if (Store.demo || UI.sheetFn || document.hidden) return;
  const day = todayKey();
  const active = document.activeElement;
  if (active && $('#view').contains(active) && /INPUT|SELECT|TEXTAREA/.test(active.tagName)) return;
  if (day !== lastDay) {
    lastDay = day;
    UI.dayKey = UI.dailyKey = null;
    render();
  } else if (UI.tab === 'sleep' && UI.sub.sleep === 'now') {
    render();
  }
}
setInterval(tick, 30000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });

/* Офлайн-режим работает только у собранного сайта на своём адресе */
if (isOwnSite() && 'serviceWorker' in navigator && window.isSecureContext) {
  navigator.serviceWorker.register('sw.js').catch(() => { /* без офлайна приложение работает как обычно */ });
}
keepData();

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  UI.installEvent = e;
  if (!Store.demo || UI.tab === 'sleep') render();
});
window.addEventListener('appinstalled', () => {
  UI.installEvent = null;
  render();
});
