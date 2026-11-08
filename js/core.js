'use strict';

/* Время, даты, форматирование и хранение. Все остальные файлы опираются на этот. */

const MIN = 6e4, HOUR = 36e5, DAY = 864e5;
let nowOverride = null;
const now = () => (nowOverride == null ? Date.now() : nowOverride);

const pad = n => String(n).padStart(2, '0');
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const avg = a => a.reduce((s, x) => s + x, 0) / a.length;
const median = a => {
  const s = [...a].sort((x, y) => x - y), m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function keyOf(t) {
  const d = new Date(t);
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}
function parseKey(k) {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d).getTime();
}
function addDays(k, n) {
  const [y, m, d] = k.split('-').map(Number);
  return keyOf(new Date(y, m - 1, d + n));
}
const diffDays = (a, b) => Math.round((parseKey(a) - parseKey(b)) / DAY);
const todayKey = () => keyOf(now());
function minOfDay(t) {
  const d = new Date(t);
  return d.getHours() * 60 + d.getMinutes();
}
function atMinutes(key, m) {
  const [y, mo, d] = key.split('-').map(Number);
  return new Date(y, mo - 1, d, 0, m).getTime();
}
function mondayOf(key) {
  return addDays(key, -((new Date(parseKey(key)).getDay() + 6) % 7));
}

const MONTHS_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
const MONTHS_NOM = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const WD_SHORT = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const WD_FULL = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];

function plural(n, one, few, many) {
  const a = Math.abs(n) % 100, b = a % 10;
  if (a > 10 && a < 20) return many;
  if (b > 1 && b < 5) return few;
  return b === 1 ? one : many;
}
function fmtTime(t) {
  const d = new Date(t);
  return pad(d.getHours()) + ':' + pad(d.getMinutes());
}
function fmtMinOfDay(m) {
  m = ((Math.round(m) % 1440) + 1440) % 1440;
  return pad(Math.floor(m / 60)) + ':' + pad(m % 60);
}
function fmtDur(min) {
  min = Math.round(min);
  const h = Math.floor(min / 60), m = min % 60;
  if (!h) return m + ' мин';
  return m ? h + ' ч ' + m + ' мин' : h + ' ч';
}
function fmtClock(min) {
  min = Math.max(0, Math.round(min));
  return Math.floor(min / 60) + ':' + pad(min % 60);
}
const fmtHoursNum = h => String(h).replace('.', ',');
function fmtDay(key) {
  const [, m, d] = key.split('-').map(Number);
  return d + ' ' + MONTHS_GEN[m - 1];
}
function fmtDayShort(key) {
  const [, m, d] = key.split('-').map(Number);
  return d + ' ' + MONTHS_SHORT[m - 1];
}
function fmtRange(a, b) {
  if (a === b) return fmtDayShort(a);
  const [, m1, d1] = a.split('-').map(Number), [, m2, d2] = b.split('-').map(Number);
  return m1 === m2 ? d1 + '–' + d2 + ' ' + MONTHS_SHORT[m2 - 1] : fmtDayShort(a) + ' – ' + fmtDayShort(b);
}
const weekdayOf = key => new Date(parseKey(key)).getDay();
function relDay(key, base = todayKey()) {
  const n = diffDays(key, base);
  if (n === 0) return 'сегодня';
  if (n === 1) return 'завтра';
  if (n === -1) return 'вчера';
  const a = Math.abs(n), word = a + ' ' + plural(a, 'день', 'дня', 'дней');
  return n > 0 ? 'через ' + word : word + ' назад';
}

/* Возраст */
function calAge(fromKey, toKey) {
  const [y1, m1, d1] = fromKey.split('-').map(Number), [y2, m2, d2] = toKey.split('-').map(Number);
  let months = (y2 - y1) * 12 + (m2 - m1), days = d2 - d1;
  if (days < 0) {
    months--;
    days += new Date(y2, m2 - 1, 0).getDate();
  }
  return { months, days: Math.max(0, days), total: diffDays(toKey, fromKey) };
}
function fmtAge(a) {
  if (a.total < 0) return 'ещё не родилась';
  if (a.months < 1) return a.total + ' ' + plural(a.total, 'день', 'дня', 'дней');
  if (a.months < 24) return a.months + ' мес' + (a.days ? ' ' + a.days + ' дн' : '');
  const y = Math.floor(a.months / 12), m = a.months % 12;
  return y + ' ' + plural(y, 'год', 'года', 'лет') + (m ? ' ' + m + ' мес' : '');
}
/* Развитие считаем от ПДР, если родилась раньше срока (скорректированный возраст). */
const ageBaseKey = st => (st.profile.due && st.profile.due > st.profile.birth ? st.profile.due : st.profile.birth);
/* Скачки всегда отсчитывают от предполагаемой даты родов. */
const leapBaseKey = st => st.profile.due || st.profile.birth;
const ageWeeksOn = (st, key) => diffDays(key, ageBaseKey(st)) / 7;
const ageMonthsOn = (st, key) => diffDays(key, ageBaseKey(st)) / 30.4375;

/* Хранилище: всё лежит в браузере этого телефона. */
function blankState() {
  return {
    v: 1, profile: null, createdAt: todayKey(),
    sleeps: [], marks: [], teeth: {}, foods: [], reasons: {}, skills: {}, ready: {}, exlog: {},
  };
}
const Store = {
  key: 'anyuta-radar-v1', state: null, demo: false, rev: 0, canPersist: true,
  load() {
    let raw = null;
    try { raw = localStorage.getItem(this.key); } catch (e) { this.canPersist = false; }
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.profile && parsed.profile.birth) {
          this.state = Object.assign(blankState(), parsed);
          this.demo = false;
          return;
        }
      } catch (e) { /* повреждённая запись: откроем пример и предложим настройку */ }
    }
    this.state = makeDemoState();
    this.demo = true;
  },
  save() {
    if (this.demo) return;
    try { localStorage.setItem(this.key, JSON.stringify(this.state)); this.canPersist = true; }
    catch (e) { this.canPersist = false; }
  },
  update(fn) {
    if (this.demo) return false;
    const before = Sync.active() ? syncSnapshot(this.state) : null;
    fn(this.state);
    this.rev++;
    this.save();
    if (before) Sync.noteLocal(before);
    return true;
  },
  start(profile) {
    this.state = blankState();
    this.state.profile = profile;
    this.demo = false;
    this.rev++;
    this.save();
    if (Sync.active()) Sync.noteLocal({});
  },
  replace(obj) {
    const before = Sync.active() && !this.demo ? syncSnapshot(this.state) : {};
    this.state = Object.assign(blankState(), obj);
    this.demo = false;
    this.rev++;
    this.save();
    if (Sync.active()) Sync.noteLocal(before);
  },
  /* Состояние, собранное из записей семьи */
  adopt(next) {
    this.state = next;
    this.demo = false;
    this.rev++;
    this.save();
  },
  wipe() {
    Sync.disconnect();
    try { localStorage.removeItem(this.key); } catch (e) { /* хранение недоступно, стирать нечего */ }
    this.state = makeDemoState();
    this.demo = true;
    this.rev++;
  },
};
/* Просим браузер не удалять записи при нехватке места */
function keepData() {
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {}); }
  catch (e) { /* браузер не поддерживает, данные хранятся как обычно */ }
}
function isValidBackup(o) {
  return !!(o && o.profile && /^\d{4}-\d{2}-\d{2}$/.test(o.profile.birth || '') && Array.isArray(o.sleeps));
}
