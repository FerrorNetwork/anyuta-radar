'use strict';

/* Общие детали интерфейса: иконки, шторки, уведомления, обработка нажатий. */

const $ = (s, r = document) => r.querySelector(s);
const UI = { tab: 'sleep', sub: { sleep: 'now', cal: 'soon', feed: 'plan' }, dayKey: null, week: null, month: null, dailyKey: null, foodCat: 'all', sheetFn: null };
const Actions = {}, Forms = {};

const ICONS = {
  moon: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.2 4.2l1.5 1.5M18.3 18.3l1.5 1.5M2.5 12h2M19.5 12h2M4.2 19.8l1.5-1.5M18.3 5.7l1.5-1.5"/>',
  wave: '<path d="M2.5 12c2-7 4-7 6 0s4 7 6 0 4-7 6.5 0"/>',
  spoon: '<ellipse cx="12" cy="7.5" rx="4" ry="5"/><path d="M12 12.5V22"/>',
  sprout: '<path d="M12 21v-9M12 12c0-4-3-6.5-7.5-6.5C4.5 10 7.5 12 12 12ZM12 9.5c0-3 2.6-5 6.5-5 0 4-2.6 5-6.5 5Z"/>',
  sliders: '<path d="M4 7h9M19 7h1M4 17h1M11 17h9"/><circle cx="16" cy="7" r="2.6"/><circle cx="8" cy="17" r="2.6"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  left: '<path d="M15 5l-7 7 7 7"/>',
  right: '<path d="M9 5l7 7-7 7"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
};
const icon = (n, s = 22) => '<svg class="ic" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[n] + '</svg>';

function seg(group, items) {
  const active = UI.sub[group];
  return '<div class="seg" role="tablist">' + items.map(([id, label]) =>
    '<button role="tab" aria-selected="' + (id === active) + '" class="' + (id === active ? 'on' : '') + '" data-act="sub" data-a="' + group + '" data-b="' + id + '">' + label + '</button>').join('') + '</div>';
}
function renderTabs() {
  const tabs = [['sleep', 'Сон', 'moon'], ['cal', 'Календарь', 'wave'], ['feed', 'Прикорм', 'spoon'], ['day', 'Развитие', 'sprout']];
  $('#tabs').innerHTML = '<div class="inner">' + tabs.map(([id, label, ic]) =>
    '<button data-act="tab" data-a="' + id + '" class="' + (UI.tab === id ? 'on' : '') + '"' + (UI.tab === id ? ' aria-current="page"' : '') + '>' + icon(ic, 24) + '<span>' + label + '</span></button>').join('') + '</div>';
}
function header(st) {
  const a = calAge(st.profile.birth, todayKey());
  const corrected = ageBaseKey(st) !== st.profile.birth ? ' · скорр. ' + fmtAge(calAge(ageBaseKey(st), todayKey())) : '';
  return '<header class="top"><div><h1 class="kid">' + esc(st.profile.name) + '</h1><p class="age">' + fmtAge(a) + corrected + '</p></div>' +
    '<button class="icon-btn" data-act="settings" aria-label="Настройки">' + icon('sliders', 24) + '</button></header>';
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
function demoBlock() {
  if (!Store.demo) return Store.canPersist ? '' : '<div class="banner">Браузер не даёт сохранять данные. Записи пропадут после закрытия.</div>';
  if (UI.tab !== 'sleep' || UI.sub.sleep !== 'now') {
    return '<div class="banner"><span>Сейчас показан пример</span><button class="pill-btn" data-act="goSetup">Указать дату</button></div>';
  }
  return '<section class="setup" id="setup"><p class="h">Укажите дату рождения, и радар настроится под неё</p>' +
    '<p class="small">Ниже пример, как всё будет выглядеть. Настоящие записи появятся после настройки.</p>' +
    '<form class="form" data-form="setup">' +
    '<label class="field"><span>Имя</span><input type="text" name="name" id="setup-name" value="Анюта" maxlength="24" required></label>' +
    '<label class="field"><span>Дата рождения</span><input type="date" name="birth" id="setup-birth" max="' + todayKey() + '" required></label>' +
    '<details><summary>Родилась раньше или позже срока?</summary><label class="field" style="margin-top:8px"><span>Предполагаемая дата родов</span><input type="date" name="due" id="setup-due"></label></details>' +
    '<p class="err" id="setup-err" hidden></p>' +
    '<button class="btn primary wide" type="submit">Начать</button></form></section>';
}

function render() {
  const st = Store.state;
  const views = { sleep: viewSleep, cal: viewCalendar, feed: viewFeeding, day: viewDaily };
  $('#view').innerHTML = header(st) + installBlock() + demoBlock() + views[UI.tab](st);
  renderTabs();
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
  toast('Это пример. Сначала укажите дату рождения');
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
