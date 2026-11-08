'use strict';

/* Общие детали интерфейса: шапка, меню, шторки, уведомления, обработка нажатий. */

const $ = (s, r = document) => r.querySelector(s);
const UI = { tab: 'sleep', sub: { sleep: 'now', cal: 'soon', feed: 'plan', day: 'today', fun: 'poems' }, dayKey: null, week: null, month: null, dailyKey: null, exKey: null, cpM: null, foodCat: 'all', poemKind: 'all', sheetFn: null };
const Actions = {}, Forms = {};

const ICONS = {
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  left: '<path d="M15 5l-7 7 7 7"/>',
  right: '<path d="M9 5l7 7-7 7"/>',
  sliders: '<path d="M4 7h9M19 7h1M4 17h1M11 17h9"/><circle cx="16" cy="7" r="2.6"/><circle cx="8" cy="17" r="2.6"/>',
};
const icon = (n, s = 22) => '<svg class="ic" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[n] + '</svg>';
const ttl = (ic, text) => '<p class="eyebrow">' + Art.mini(ic) + '<span>' + text + '</span></p>';
const liIcon = (ic, cls) => '<span class="li-ic' + (cls ? ' ' + cls : '') + '">' + ic + '</span>';

function seg(group, items) {
  const active = UI.sub[group];
  return '<div class="seg" role="tablist">' + items.map(([id, label]) =>
    '<button role="tab" aria-selected="' + (id === active) + '" class="' + (id === active ? 'on' : '') + '" data-act="sub" data-a="' + group + '" data-b="' + id + '">' + label + '</button>').join('') + '</div>';
}
function renderTabs() {
  const tabs = [['sleep', 'Сон', 'moon'], ['cal', 'Календарь', 'hop'], ['feed', 'Прикорм', 'spoon'], ['day', 'Развитие', 'sprout'], ['fun', 'Забавы', 'note']];
  $('#tabs').innerHTML = '<div class="inner">' + tabs.map(([id, label, ic]) =>
    '<button data-act="tab" data-a="' + id + '" class="' + (UI.tab === id ? 'on' : '') + '"' + (UI.tab === id ? ' aria-current="page"' : '') + '><span class="tab-ic">' + Art.mini(ic) + '</span><span>' + label + '</span></button>').join('') + '</div>';
}
function greeting() {
  const h = new Date(now()).getHours();
  return h < 5 || h >= 23 ? 'Доброй ночи' : h < 12 ? 'Доброе утро' : h < 18 ? 'Добрый день' : 'Добрый вечер';
}
function syncBadgeInner() {
  const s = Sync.status;
  const name = s === 'busy' ? 'syncBusy' : s === 'ok' || s === 'idle' ? 'syncOk' : s === 'off' ? 'syncOff' : 'syncBad';
  return Art.mini(s === 'offline' ? 'syncOff' : name);
}
function renderSyncBadge() {
  const b = $('#sync-badge');
  if (!b) return;
  b.className = 'icon-btn sync-badge ' + Sync.status;
  b.innerHTML = syncBadgeInner();
}
function header(st) {
  const a = calAge(st.profile.birth, todayKey());
  const corrected = ageBaseKey(st) !== st.profile.birth ? ' · скорр. ' + fmtAge(calAge(ageBaseKey(st), todayKey())) : '';
  const sync = Sync.available() ? '<button id="sync-badge" class="icon-btn sync-badge ' + Sync.status + '" data-act="settings" aria-label="Синхронизация">' + syncBadgeInner() + '</button>' : '';
  return '<header class="top"><div class="avatar">' + Art.bunny('happy') + '</div><div class="top-main"><p class="hello">' + greeting() + '!</p><h1 class="kid">' + esc(st.profile.name) + '</h1><p class="age">' + fmtAge(a) + corrected + '</p></div>' +
    '<div class="top-side">' + sync + '<button class="icon-btn" data-act="settings" aria-label="Настройки">' + icon('sliders', 22) + '</button></div></header>';
}

const isOwnSite = () => {
  const b = document.documentElement.dataset.build;
  return !!b && b !== 'dev' && window.top === window.self;
};
const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIOS = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
const INSTALL_HIDDEN = 'radar-install-hidden';
function installHidden() {
  try { return !!localStorage.getItem(INSTALL_HIDDEN); } catch (e) { return false; }
}
function canOfferInstall() {
  return isOwnSite() && !isStandalone() && (navigator.maxTouchPoints > 0 || /Android|iPhone|iPad|iPod/.test(navigator.userAgent));
}
function installHowTo() {
  if (UI.installEvent) return 'Иконка появится на экране, и приложение будет работать без интернета.';
  if (isIOS()) return 'Откройте в Safari, нажмите «Поделиться», затем «На экран „Домой“». На iPhone записи из браузера в установленное приложение не переносятся, поэтому лучше установить сразу.';
  return 'Откройте меню браузера и выберите «Добавить на главный экран» или «Установить приложение».';
}
function installBlock() {
  if (UI.tab !== 'sleep' || UI.sub.sleep !== 'now' || !canOfferInstall() || installHidden()) return '';
  return '<section class="card flat"><div class="rowline"><p class="h2">Установите приложение на телефон</p><button class="icon-btn" data-act="installHide" aria-label="Скрыть подсказку">' + icon('x') + '</button></div><p class="small">' + installHowTo() + '</p>' +
    (UI.installEvent ? '<button class="btn primary wide" data-act="install">Установить</button>' : '') + '</section>';
}
Actions.installHide = () => {
  try { localStorage.setItem(INSTALL_HIDDEN, '1'); } catch (e) { /* хранение недоступно, подсказка вернётся */ }
  render();
};
Actions.install = () => {
  const ev = UI.installEvent;
  if (!ev) return;
  ev.prompt();
  ev.userChoice.finally(() => { UI.installEvent = null; render(); });
};

/* Праздники: месяц жизни и сотый день */
function partyBlock(st) {
  if (Store.demo || (UI.tab !== 'day' && !(UI.tab === 'sleep' && UI.sub.sleep === 'now'))) return '';
  const a = calAge(st.profile.birth, todayKey()), name = esc(st.profile.name);
  let title = '';
  if (a.total + 1 === 100) title = 'Сегодня сотый день!';
  else if (a.months > 0 && a.days === 0) title = name + ': ' + (a.months < 12 ? a.months + ' ' + plural(a.months, 'месяц', 'месяца', 'месяцев') : Math.floor(a.months / 12) + ' ' + plural(Math.floor(a.months / 12), 'год', 'года', 'лет') + (a.months % 12 ? ' и ' + (a.months % 12) + ' мес' : '')) + '!';
  if (!title) return '';
  return '<section class="card party"><div class="hero-art">' + Art.balloons() + '<div><p class="h">' + title + '</p><p class="note-hand">Поздравляем маленькую именинницу и её родителей</p></div></div></section>';
}

function connectForm(ids) {
  return '<form class="form" data-form="connect">' +
    '<label class="field"><span>Код семьи</span><input type="password" name="token" id="' + ids + '-token" autocomplete="off" autocapitalize="off" spellcheck="false" required></label>' +
    '<label class="field"><span>Кто пользуется этим телефоном</span><select name="device" id="' + ids + '-device"><option>Мама</option><option>Папа</option><option>Бабушка</option><option>Дедушка</option><option>Няня</option></select></label>' +
    '<p class="err" data-connect-err hidden></p>' +
    '<button class="btn primary wide" type="submit">Подключить</button></form>';
}
function setupFields() {
  return '<form class="form" data-form="setup">' +
    '<label class="field"><span>Имя</span><input type="text" name="name" id="setup-name" value="Анюта" maxlength="24" required></label>' +
    '<label class="field"><span>Дата рождения</span><input type="date" name="birth" id="setup-birth" max="' + todayKey() + '" required></label>' +
    '<details><summary>Родилась раньше или позже срока?</summary><label class="field" style="margin-top:8px"><span>Предполагаемая дата родов</span><input type="date" name="due" id="setup-due"></label></details>' +
    '<p class="err" id="setup-err" hidden></p>' +
    '<button class="btn primary wide" type="submit">Начать</button></form>';
}
function demoBlock() {
  if (!Store.demo) return Store.canPersist ? '' : '<div class="banner">Браузер не даёт сохранять данные. Записи пропадут после закрытия.</div>';
  if (UI.tab !== 'sleep' || UI.sub.sleep !== 'now') {
    return '<div class="banner"><span>Сейчас показан пример</span><button class="pill-btn" data-act="goSetup">Настроить</button></div>';
  }
  if (Sync.available()) {
    return '<section class="setup" id="setup"><div class="setup-head">' + Art.bunny('happy') + '<div><p class="h">Привет! Откроем дневник?</p><p class="small">Вставьте код семьи. Он нужен один раз на каждом телефоне.</p></div></div>' + connectForm('first') +
      '<details><summary>Начать без синхронизации</summary><div style="margin-top:8px">' + setupFields() + '</div></details></section>';
  }
  return '<section class="setup" id="setup"><div class="setup-head">' + Art.bunny('happy') + '<div><p class="h">Укажите дату рождения</p><p class="small">Ниже пример, как всё будет выглядеть.</p></div></div>' + setupFields() + '</section>';
}

function render() {
  const st = Store.state;
  document.body.dataset.tab = UI.tab;
  const views = { sleep: viewSleep, cal: viewCalendar, feed: viewFeeding, day: viewDaily, fun: viewFun };
  $('#view').innerHTML = header(st) + installBlock() + demoBlock() + partyBlock(st) + views[UI.tab](st);
  renderTabs();
  const hop = $('#hop-wrap');
  if (hop) hop.scrollLeft = Number(hop.dataset.focus) - hop.clientWidth / 2;
}
/* Пришли записи с другого телефона */
function refreshFromSync() {
  const a = document.activeElement;
  if (UI.sheetFn || (a && /INPUT|SELECT|TEXTAREA/.test(a.tagName))) return;
  render();
}

/* Шторки */
function showSheet(fn) {
  UI.sheetFn = fn;
  drawSheet(true);
}
function drawSheet(enter) {
  const root = $('#sheet'), { title, body } = UI.sheetFn();
  const prev = $('.sheet-body', root), scroll = prev ? prev.scrollTop : 0;
  root.innerHTML = '<div class="sheet-back" data-act="closeSheet"></div><div class="sheet-panel' + (enter ? ' enter' : '') + '" role="dialog" aria-modal="true" aria-label="' + esc(title) + '" tabindex="-1">' +
    '<div class="sheet-grab"></div><div class="sheet-head"><h3>' + esc(title) + '</h3><button class="icon-btn" data-act="closeSheet" aria-label="Закрыть">' + icon('x') + '</button></div>' +
    '<div class="sheet-body">' + body + '</div></div>';
  root.hidden = false;
  document.documentElement.classList.add('locked');
  $('.sheet-body', root).scrollTop = scroll;
  if (enter) $('.sheet-panel', root).focus({ preventScroll: true });
}
function closeSheet() {
  UI.sheetFn = null;
  $('#sheet').hidden = true;
  $('#sheet').innerHTML = '';
  document.documentElement.classList.remove('locked');
}
function refresh() {
  render();
  if (UI.sheetFn) drawSheet(false);
}

let toastTimer = null;
function toast(msg, undo) {
  const el = $('#toast');
  el.innerHTML = '<span>' + esc(msg) + '</span>' + (undo ? '<button data-act="toastUndo">Отменить</button>' : '');
  el.hidden = false;
  UI.undo = undo || null;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; UI.undo = null; }, undo ? 6000 : 3000);
}
const haptic = () => {
  try { if (navigator.vibrate && (!navigator.userActivation || navigator.userActivation.hasBeenActive)) navigator.vibrate(12); }
  catch (e) { /* нет вибрации */ }
};
/* Брызги звёздочек от нажатия */
function burst(el, count = 9) {
  if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const r = el.getBoundingClientRect(), fx = $('#fx'), colors = ['#ffc83d', '#ff85b3', '#8c6cf0', '#3ccfa8', '#5bb8ff'];
  for (let i = 0; i < count; i++) {
    const s = document.createElement('span'), a = i / count * Math.PI * 2, d = 42 + Math.random() * 34;
    s.className = 'spark';
    s.innerHTML = Art.star(colors[i % colors.length]);
    s.style.left = (r.left + r.width / 2) + 'px';
    s.style.top = (r.top + r.height / 2) + 'px';
    s.style.setProperty('--dx', Math.cos(a) * d + 'px');
    s.style.setProperty('--dy', Math.sin(a) * d + 'px');
    fx.appendChild(s);
    setTimeout(() => s.remove(), 800);
  }
}

/* Первое нажатие просит подтверждения, второе выполняет */
function confirmTap(el, label) {
  if (el.dataset.armed) return true;
  el.dataset.armed = '1';
  const old = el.textContent;
  el.textContent = label;
  setTimeout(() => { if (el.isConnected) { delete el.dataset.armed; el.textContent = old; } }, 4000);
  return false;
}
function needSetup() {
  closeSheet();
  UI.tab = 'sleep';
  UI.sub.sleep = 'now';
  render();
  window.scrollTo(0, 0);
  toast('Это пример. Сначала подключите дневник');
}
/* Изменения в примере не сохраняются: проводим к настройке */
function mutate(fn) {
  if (Store.demo) { needSetup(); return false; }
  Store.update(fn);
  return true;
}

Actions.tab = el => {
  if (UI.tab === el.dataset.a) { window.scrollTo(0, 0); return; }
  UI.tab = el.dataset.a;
  render();
  window.scrollTo(0, 0);
};
Actions.sub = el => {
  UI.sub[el.dataset.a] = el.dataset.b;
  render();
  window.scrollTo(0, 0);
};
Actions.closeSheet = () => closeSheet();
Actions.goSetup = () => {
  UI.tab = 'sleep';
  UI.sub.sleep = 'now';
  render();
  window.scrollTo(0, 0);
};
Actions.toastUndo = () => {
  if (UI.undo) UI.undo();
  UI.undo = null;
  $('#toast').hidden = true;
};

Forms.setup = (f, d) => {
  const today = todayKey(), err = $('#setup-err');
  const fail = m => { err.textContent = m; err.hidden = false; };
  if (!d.birth) return fail('Укажите дату рождения.');
  if (d.birth > today) return fail('Дата рождения не может быть в будущем.');
  if (diffDays(today, d.birth) > 365 * 5) return fail('Приложение рассчитано на детей до 5 лет. Проверьте год.');
  if (d.due && Math.abs(diffDays(d.due, d.birth)) > 100) return fail('Дата родов слишком далеко от даты рождения. Проверьте её.');
  Store.start({ name: (d.name || 'Анюта').trim().slice(0, 24) || 'Анюта', birth: d.birth, due: d.due || null, bedTarget: null });
  keepData();
  render();
  window.scrollTo(0, 0);
  toast('Готово. Отметьте первый сон');
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const fn = Actions[el.dataset.act];
  if (fn) fn(el, e);
});
document.addEventListener('submit', e => {
  const f = e.target.closest('form[data-form]');
  if (!f) return;
  e.preventDefault();
  Forms[f.dataset.form](f, Object.fromEntries(new FormData(f)));
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && UI.sheetFn) closeSheet();
});
