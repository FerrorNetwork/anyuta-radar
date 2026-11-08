'use strict';

/* Семейная синхронизация. Записи лежат в приватном репозитории GitHub, по файлу на месяц.
   У каждой записи есть время изменения: при расхождении побеждает более поздняя.
   Без сети изменения копятся на телефоне и уходят, когда связь появится. */

const SYNC_REPO = 'FerrorNetwork/anyuta-radar-data';
const SYNC_DIR = 'data';
const SYNC_STORE = 'anyuta-radar-sync';
const SYNC_EVERY = 15000;
const SYNC_ARRAYS = ['sleeps', 'marks', 'foods'];
const SYNC_MAPS = ['teeth', 'reasons', 'skills', 'ready'];
const SYNC_PROFILE = ['name', 'birth', 'due', 'bedTarget'];

function syncFlatten(st) {
  const out = {};
  if (st.profile) SYNC_PROFILE.forEach(f => { if (st.profile[f] !== undefined) out['profile/' + f] = st.profile[f]; });
  if (st.createdAt) out['created/at'] = st.createdAt;
  SYNC_ARRAYS.forEach(c => st[c].forEach(r => { out[c + '/' + r.id] = r; }));
  SYNC_MAPS.forEach(c => Object.keys(st[c]).forEach(k => { out[c + '/' + k] = st[c][k]; }));
  return out;
}
function syncSnapshot(st) {
  const flat = syncFlatten(st), out = {};
  Object.keys(flat).forEach(k => { out[k] = JSON.stringify(flat[k]); });
  return out;
}
function syncBuildState(doc) {
  const st = blankState(), profile = {};
  Object.keys(doc).forEach(key => {
    const item = doc[key];
    if (item.del) return;
    const cut = key.indexOf('/'), c = key.slice(0, cut), id = key.slice(cut + 1);
    if (c === 'profile') profile[id] = item.v;
    else if (c === 'created') st.createdAt = item.v;
    else if (SYNC_ARRAYS.includes(c)) st[c].push(item.v);
    else if (SYNC_MAPS.includes(c)) st[c][id] = item.v;
  });
  st.profile = profile.birth ? { name: 'Анюта', due: null, bedTarget: null, ...profile } : null;
  return st;
}
/* В какой файл попадает запись: по месяцу события, остальное в общий */
function syncPartition(key, value) {
  const cut = key.indexOf('/'), c = key.slice(0, cut);
  if (c === 'sleeps') return keyOf(value.start).slice(0, 7);
  if (c === 'marks' || c === 'foods') return value.date.slice(0, 7);
  if (c === 'reasons') return key.slice(cut + 1, cut + 8);
  return 'core';
}
/* Время для записей, сделанных до подключения. Профиль уступает данным семьи */
function syncNaturalTime(key, v) {
  const c = key.slice(0, key.indexOf('/'));
  if (c === 'sleeps') return v.end || v.start;
  if (c === 'marks' || c === 'foods') return parseKey(v.date);
  if (c === 'reasons') return parseKey(key.slice(key.indexOf('/') + 1));
  if (c === 'teeth' || c === 'skills') return parseKey(v);
  return 1;
}
function syncNewer(a, b) {
  return a.t > b.t || (a.t === b.t && JSON.stringify(a) > JSON.stringify(b));
}
/* Оба родителя могли отметить один и тот же сон почти одновременно */
function mergeSleepDuplicates(list) {
  const a = list.map(s => ({ ...s })).sort((x, y) => x.start - y.start);
  let changed = false;
  for (let i = 0; i < a.length - 1;) {
    const x = a[i], y = a[i + 1], xEnd = x.end == null ? Infinity : x.end;
    if (y.start < xEnd && y.start - x.start <= 20 * MIN) {
      x.end = x.end != null && y.end != null ? Math.max(x.end, y.end) : (x.end != null ? x.end : y.end != null ? y.end : null);
      a.splice(i + 1, 1);
      changed = true;
      continue;
    }
    if (x.end == null) {
      x.end = y.start;
      changed = true;
    }
    i++;
  }
  return changed ? a : null;
}
function b64encode(text) {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 8192) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192));
  return btoa(bin);
}
function b64decode(b64) {
  const bin = atob(b64.replace(/\s/g, '')), bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

const SYNC_MESSAGES = {
  auth: 'Код семьи не подошёл или истёк. Создайте новый и подключитесь заново.',
  access: 'GitHub не дал доступ к записям. Проверьте, что у кода есть право на чтение и запись.',
  offline: 'Нет связи с GitHub. Отметки сохранены на телефоне и уйдут, когда связь появится.',
};

const Sync = {
  token: null, device: '', doc: {}, shas: {}, dirty: {}, etag: null,
  status: 'off', lastOk: 0, clock: 0, running: false, again: false, timer: null, poller: null,

  available() { return typeof isOwnSite === 'function' && isOwnSite(); },
  active() { return !!this.token; },
  load() {
    let raw = null;
    try { raw = localStorage.getItem(SYNC_STORE); } catch (e) { return; }
    if (!raw) return;
    try {
      const o = JSON.parse(raw);
      Object.assign(this, { token: o.token, device: o.device, doc: o.doc || {}, shas: o.shas || {}, dirty: o.dirty || {}, etag: o.etag || null, lastOk: o.lastOk || 0, clock: o.clock || 0 });
      this.status = 'idle';
    } catch (e) { /* повреждённая запись: телефон подключится заново */ }
  },
  persist() {
    if (!this.token) return;
    const { token, device, doc, shas, dirty, etag, lastOk, clock } = this;
    try { localStorage.setItem(SYNC_STORE, JSON.stringify({ token, device, doc, shas, dirty, etag, lastOk, clock })); } catch (e) { /* нет места: данные останутся в памяти до следующего запуска */ }
  },
  setStatus(s) {
    this.status = s;
    if (typeof renderSyncBadge === 'function') renderSyncBadge();
  },
  message() { return SYNC_MESSAGES[this.status] || ''; },
  stamp() {
    this.clock = Math.max(now(), this.clock + 1);
    return this.clock;
  },
  /* Сравниваем записи до и после действия и отмечаем, что изменилось */
  noteLocal(before) {
    const after = syncSnapshot(Store.state), t = this.stamp();
    let changed = false;
    new Set([...Object.keys(before), ...Object.keys(after)]).forEach(k => {
      if (before[k] === after[k]) return;
      const gone = after[k] === undefined, value = JSON.parse(gone ? before[k] : after[k]);
      const old = this.doc[k], p = old && old.p ? old.p : syncPartition(k, value);
      this.doc[k] = gone ? { t, p, d: this.device, del: 1 } : { t, p, d: this.device, v: value };
      this.dirty[p] = (this.dirty[p] || 0) + 1;
      changed = true;
    });
    if (changed) {
      this.persist();
      this.schedule(1200);
    }
  },
  schedule(ms) {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.run(), ms);
  },
  api(path, opts = {}) {
    return fetch('https://api.github.com/repos/' + SYNC_REPO + path, {
      cache: 'no-store', ...opts,
      headers: { Accept: 'application/vnd.github+json', Authorization: 'Bearer ' + this.token, 'X-GitHub-Api-Version': '2022-11-28', ...(opts.headers || {}) },
    });
  },
  fail(res) {
    const e = new Error('GitHub ' + res.status);
    e.kind = res.status === 401 ? 'auth' : res.status === 403 || res.status === 404 ? 'access' : 'offline';
    return e;
  },
  async list(force) {
    const headers = this.etag && !force ? { 'If-None-Match': this.etag } : {};
    const res = await this.api('/contents/' + SYNC_DIR, { headers });
    if (res.status === 304) return null;
    if (res.status === 404) return { files: {}, etag: null };
    if (!res.ok) throw this.fail(res);
    const files = {};
    (await res.json()).forEach(f => { if (f.name.endsWith('.json')) files[f.name.slice(0, -5)] = f.sha; });
    return { files, etag: res.headers.get('ETag') };
  },
  async getFile(p) {
    const path = '/contents/' + SYNC_DIR + '/' + p + '.json';
    const res = await this.api(path);
    if (!res.ok) throw this.fail(res);
    const j = await res.json();
    let text;
    if (j.content) text = b64decode(j.content);
    else {
      const raw = await this.api(path, { headers: { Accept: 'application/vnd.github.raw+json' } });
      if (!raw.ok) throw this.fail(raw);
      text = await raw.text();
    }
    return { items: JSON.parse(text).items || {}, sha: j.sha };
  },
  async putFile(p) {
    const items = {};
    Object.keys(this.doc).forEach(k => {
      if (this.doc[k].p !== p) return;
      const { p: skip, ...rest } = this.doc[k];
      items[k] = rest;
    });
    const body = { message: 'Записи ' + p, content: b64encode(JSON.stringify({ v: 1, items })) };
    if (this.shas[p]) body.sha = this.shas[p];
    const res = await this.api('/contents/' + SYNC_DIR + '/' + p + '.json', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (res.status === 409 || res.status === 422) return { conflict: true };
    if (!res.ok) throw this.fail(res);
    return { sha: (await res.json()).content.sha };
  },
  mergeFile(p, items, changed) {
    Object.keys(items).forEach(k => {
      const remote = { ...items[k], p }, local = this.doc[k];
      if (!local || syncNewer(remote, local)) {
        this.doc[k] = remote;
        changed.push(k);
      }
    });
    const ahead = Object.keys(this.doc).some(k => this.doc[k].p === p && (!items[k] || syncNewer(this.doc[k], { ...items[k], p })));
    if (ahead) this.dirty[p] = (this.dirty[p] || 0) + 1;
    else delete this.dirty[p];
  },
  applyRemote(changed) {
    const quiet = Store.demo, prev = new Map(Store.state.sleeps.map(s => [s.id, s]));
    const next = syncBuildState(this.doc);
    if (!next.profile) return;
    Store.adopt(next);
    const merged = mergeSleepDuplicates(Store.state.sleeps);
    if (merged) Store.update(s => { s.sleeps = merged; });
    if (!quiet && changed.length <= 4) this.announce(changed, prev);
    if (typeof refreshFromSync === 'function') refreshFromSync();
  },
  /* Говорим второму родителю, что сейчас отметил первый */
  announce(changed, prev) {
    changed.forEach(k => {
      if (!k.startsWith('sleeps/') || typeof toast !== 'function') return;
      const item = this.doc[k];
      if (!item || !item.v || !item.d || item.d === this.device) return;
      const old = prev.get(item.v.id);
      if (item.v.end == null) toast(item.d + ': уснула в ' + fmtTime(item.v.start));
      else if (!old || old.end == null) toast(item.d + ': проснулась в ' + fmtTime(item.v.end));
    });
  },
  /* Один проход: забрать чужое, объединить, отправить своё. Возвращает true при столкновении */
  async cycle(force) {
    const listed = await this.list(force);
    if (listed) {
      const changed = [];
      for (const p of Object.keys(listed.files)) {
        if (this.shas[p] === listed.files[p]) continue;
        const file = await this.getFile(p);
        this.mergeFile(p, file.items, changed);
        this.shas[p] = file.sha;
      }
      this.etag = listed.etag;
      if (changed.length) this.applyRemote(changed);
    }
    for (const p of Object.keys(this.dirty)) {
      const mark = this.dirty[p];
      const res = await this.putFile(p);
      this.etag = null;
      if (res.conflict) return true;
      this.shas[p] = res.sha;
      if (this.dirty[p] === mark) delete this.dirty[p];
    }
    return false;
  },
  async run(force) {
    if (!this.token) return;
    if (this.running) { this.again = true; return; }
    this.running = true;
    this.setStatus('busy');
    try {
      let conflict = true;
      for (let attempt = 0; attempt < 5 && conflict; attempt++) conflict = await this.cycle(force || attempt > 0);
      if (conflict) throw Object.assign(new Error('конфликт'), { kind: 'offline' });
      this.lastOk = now();
      this.setStatus('ok');
    } catch (e) {
      this.setStatus(e.kind || 'offline');
    } finally {
      this.running = false;
      this.persist();
      if (this.again) {
        this.again = false;
        this.schedule(300);
      }
    }
  },
  /* Записи, сделанные на телефоне до подключения */
  seed() {
    this.doc = {};
    this.dirty = {};
    if (Store.demo) return;
    const flat = syncFlatten(Store.state);
    Object.keys(flat).forEach(k => {
      const p = syncPartition(k, flat[k]);
      this.doc[k] = { t: syncNaturalTime(k, flat[k]), p, d: this.device, v: flat[k] };
      this.dirty[p] = 1;
    });
  },
  async connect(token, device) {
    this.token = token.trim();
    this.device = device;
    let res;
    try { res = await this.api(''); }
    catch (e) { this.token = null; throw Object.assign(new Error('сеть'), { kind: 'offline' }); }
    if (!res.ok) { const err = this.fail(res); this.token = null; throw err; }
    this.seed();
    this.shas = {};
    this.etag = null;
    this.persist();
    await this.run(true);
    this.startLoop();
  },
  startLoop() {
    if (!this.token || this.poller) return;
    this.poller = setInterval(() => { if (!document.hidden) this.run(); }, SYNC_EVERY);
    if (!this.listening) {
      this.listening = true;
      document.addEventListener('visibilitychange', () => { if (!document.hidden) this.run(); });
      window.addEventListener('online', () => this.run());
    }
  },
  /* Только этот телефон: записи семьи остаются в репозитории и на других устройствах */
  disconnect() {
    clearInterval(this.poller);
    clearTimeout(this.timer);
    this.poller = null;
    this.token = null;
    this.doc = {};
    this.shas = {};
    this.dirty = {};
    this.etag = null;
    this.status = 'off';
    try { localStorage.removeItem(SYNC_STORE); } catch (e) { /* хранение недоступно, стирать нечего */ }
  },
};
