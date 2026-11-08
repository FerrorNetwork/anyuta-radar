'use strict';

/* Вкладка «Сон»: радар суток, отметки, прогноз, оценка дня и недели. */

function viewSleep(st) {
  const body = { now: sleepNowView, day: sleepDayView, week: sleepWeekView, norm: sleepNormView }[UI.sub.sleep](st);
  return seg('sleep', [['now', 'Сейчас'], ['day', 'День'], ['week', 'Неделя'], ['norm', 'Нормы']]) + body;
}

const CX = 160;
const polar = (r, deg) => {
  const a = (deg - 90) * Math.PI / 180;
  return [(CX + r * Math.cos(a)).toFixed(2), (CX + r * Math.sin(a)).toFixed(2)];
};
/* Полдень наверху, полночь внизу */
const minToDeg = m => (m / 1440 * 360 + 180) % 360;
function arcPath(r, m0, m1) {
  const span = Math.min(m1 - m0, 1439.9), sweep = span / 1440 * 360;
  const [x0, y0] = polar(r, minToDeg(m0)), [x1, y1] = polar(r, minToDeg(m0 + span));
  return 'M' + x0 + ' ' + y0 + 'A' + r + ' ' + r + ' 0 ' + (sweep > 180 ? 1 : 0) + ' 1 ' + x1 + ' ' + y1;
}
function ringArcs(idx, key, r, w, t) {
  const start = parseKey(key), end = parseKey(addDays(key, 1));
  return idx.segs.map(s => {
    const a = Math.max(s.start, start), b = Math.min(s.end == null ? t : s.end, end);
    if (b <= a) return '';
    return '<path d="' + arcPath(r, (a - start) / MIN, (b - start) / MIN) + '" fill="none" stroke="var(--arc)" stroke-width="' + w + '" stroke-linecap="round"/>';
  }).join('');
}
function dialSvg(st, sn) {
  const t = now(), today = keyOf(t), idx = sn.idx, nowM = minOfDay(t);
  const rings = [[136, 15, today], [116, 10, addDays(today, -1)], [103, 7, addDays(today, -2)]];
  let s = '<svg viewBox="-16 -16 352 352" role="img" aria-label="Сон за сутки: снаружи сегодня, внутри вчера и позавчера">';
  rings.forEach(([r, w]) => { s += '<circle cx="160" cy="160" r="' + r + '" fill="none" stroke="var(--track)" stroke-width="' + w + '"/>'; });
  rings.forEach(([r, w, key], i) => { s += '<g opacity="' + [1, .55, .35][i] + '">' + ringArcs(idx, key, r, w, t) + '</g>'; });
  if (sn.plan) {
    sn.plan.forEach(item => {
      if (keyOf(item.at) !== today) return;
      const a = minOfDay(item.at), b = item.type === 'bed' ? 1439 : Math.min(a + item.dur, 1439);
      if (b > a) s += '<path d="' + arcPath(136, a, b) + '" fill="none" stroke="#ffc83d" stroke-width="10" stroke-linecap="round" stroke-dasharray=".1 15"/>';
    });
  }
  const place = (m, r, size, inner) => {
    const [x, y] = polar(r, minToDeg(m));
    return '<g transform="translate(' + (x - size / 2) + ' ' + (y - size / 2) + ') scale(' + size / 24 + ')">' + inner + '</g>';
  };
  s += place(720, 158, 26, MINI.sun) + place(0, 158, 25, MINI.moon);
  [[360, '6'], [1080, '18']].forEach(([m, label]) => {
    const [x, y] = polar(157, minToDeg(m));
    s += '<text x="' + x + '" y="' + y + '" text-anchor="middle" dominant-baseline="central" font-size="14" font-weight="800" fill="var(--sky-text)">' + label + '</text>';
  });
  s += '<circle cx="160" cy="160" r="96" fill="var(--card)"/>';
  const [wx0, wy0] = polar(144, minToDeg(nowM - 50)), [wx1, wy1] = polar(144, minToDeg(nowM));
  s += '<path d="M' + polar(97, minToDeg(nowM - 50)).join(' ') + 'L' + wx0 + ' ' + wy0 + 'A144 144 0 0 1 ' + wx1 + ' ' + wy1 + 'L' + polar(97, minToDeg(nowM)).join(' ') + 'A97 97 0 0 0 ' + polar(97, minToDeg(nowM - 50)).join(' ') + 'Z" fill="#ffc83d" opacity=".2"/>';
  const [sx, sy] = polar(136, minToDeg(nowM));
  s += '<g transform="translate(' + (sx - 15) + ' ' + (sy - 15) + ') scale(1.25)"><path d="' + STAR_PATH + '" fill="#ffc83d" stroke="#fff" stroke-width="2.4" stroke-linejoin="round"/></g>';
  return s + '</svg>';
}
function bunnyMood(sn) {
  if (sn.state === 'sleeping') return 'asleep';
  if (sn.state === 'nightwake') return 'tired';
  if (sn.state === 'awake' && (sn.overdue || sn.minsLeft <= 15)) return 'tired';
  return sn.state === 'unknown' ? 'happy' : 'awake';
}
function dialCenter(sn) {
  let l = '', v = '—', sub = '', cls = '';
  if (sn.state === 'sleeping') {
    l = sn.seg.type === 'nap' ? 'Дневной сон' : 'Ночной сон';
    v = fmtClock(sn.elapsed);
    sub = 'с ' + fmtTime(sn.seg.start);
    cls = 'moon';
  } else if (sn.state === 'awake') {
    l = 'Не спит';
    v = fmtClock(sn.awake);
    sub = sn.overdue ? 'пора укладывать' : sn.minsLeft > 0 ? 'до сна ' + fmtDur(sn.minsLeft) : 'время укладывать';
    cls = 'sun';
  } else if (sn.state === 'nightwake') {
    l = 'Проснулась ночью';
    v = fmtClock(sn.awake);
    sub = 'ночь продолжается';
    cls = 'sun';
  } else {
    l = 'Нет отметок';
    sub = 'отметьте сон';
  }
  return '<div class="dial-center"><div class="dc-bun">' + Art.bunny(bunnyMood(sn)) + '</div><span class="dc-l">' + l + '</span><strong class="dc-v ' + cls + '">' + v + '</strong><span class="dc-s">' + sub + '</span></div>';
}
const STAR_SPOTS = [[5, 8, 13, 0], [14, 34, 9, 1.1], [3, 62, 11, 2], [90, 40, 10, .6], [93, 70, 14, 1.6], [84, 90, 9, 2.4], [8, 88, 10, .9], [26, 6, 8, 1.8], [72, 5, 9, .3]];
function skyDecor(night) {
  if (night) return '<span class="sky-moon">' + Art.moon() + '</span>' + STAR_SPOTS.map(([x, y, s, d]) => '<span class="twinkle" style="left:' + x + '%;top:' + y + '%;width:' + s + 'px;height:' + s + 'px;animation-delay:' + d + 's">' + Art.star() + '</span>').join('');
  return '<span class="sky-sun">' + Art.sun() + '</span><span class="drift d1">' + Art.cloud() + '</span><span class="drift d2">' + Art.cloud() + '</span><span class="drift d3">' + Art.cloud() + '</span>';
}
function contextTags(st) {
  const c = contextOn(st, todayKey()), tags = [];
  if (c.leap) tags.push(['', 'hop', 'Скачок ' + c.leap.n + ' до ' + fmtDayShort(c.leap.end)]);
  if (c.regression) tags.push(['', 'moon', 'Перестройка сна']);
  if (c.teething) tags.push(['sun', 'tooth', 'Зубы']);
  if (c.ill || c.fever) tags.push(['bad', 'sos', 'Болеет']);
  if (c.vaccine) tags.push(['ok', 'shield', 'После прививки']);
  if (c.spurt) tags.push(['sun', 'sprout', 'Ростовой рывок']);
  return tags.length ? '<div class="chips">' + tags.map(([k, ic, x]) => '<span class="tag ' + k + '">' + Art.mini(ic) + x + '</span>').join('') + '</div>' : '';
}

function nextCard(st, sn) {
  const name = esc(st.profile.name);
  if (sn.state === 'unknown') {
    return '<section class="card">' + ttl('sun', 'С чего начать') + '<p class="h">Когда ' + name + ' сегодня проснулась?</p>' +
      '<p class="small mute">Внесите последнюю ночь, и радар сразу посчитает, когда укладывать.</p>' +
      '<button class="btn primary wide" data-act="addNight">Отметить ночной сон</button></section>';
  }
  if (sn.state === 'nightwake') {
    return '<section class="card">' + ttl('moon', 'Ночь') + '<p class="h">Проснулась в ' + fmtTime(sn.since) + '</p>' +
      '<p class="small">Свет приглушён, голос тихий, без игр. Нажмите «Уснула», когда уснёт снова, и пробуждение засчитается внутри этой ночи.</p></section>';
  }
  if (sn.state === 'sleeping') {
    const nap = sn.seg.type === 'nap', rows = [];
    if (sn.suspicious) rows.push('<p class="small" style="color:var(--berry-ink)">Сон идёт уже ' + fmtDur(sn.elapsed) + '. Может быть, забыли отметить пробуждение? Нажмите на запись ниже, чтобы исправить.</p>');
    else if (sn.overlong) rows.push('<p class="small">Сон длится дольше обычного. Если хотите сохранить ночь, мягко разбудите её.</p>');
    if (nap && sn.expectedEnd && now() < sn.expectedEnd) rows.push('<p class="small mute">Обычно просыпается около ' + fmtTime(sn.expectedEnd) + '.</p>');
    if (nap && sn.wakeBy) rows.push('<p class="small">Чтобы отбой не сдвинулся, разбудите к <b class="num">' + fmtTime(sn.wakeBy) + '</b>.</p>');
    if (!rows.length) rows.push('<p class="note-hand mute">' + (nap ? 'Тише, зайка спит. Отметьте пробуждение, и радар пересчитает день.' : 'Спокойной ночи! Отметьте утренний подъём.') + '</p>');
    return '<section class="card">' + ttl(nap ? 'cloud' : 'moon', nap ? 'Спит днём' : 'Спит ночью') + rows.join('') + '</section>';
  }
  const n = sn.next, isBed = n.type === 'bed';
  const hint = sn.overdue ? 'Окно затянулось на ' + fmtDur(sn.overdue) + '. Укладывайте сейчас, чтобы не накопился перегул.'
    : sn.minsLeft > 0 ? 'Начните ритуал за 15–20 минут до начала, примерно в ' + fmtTime(sn.from - 15 * MIN) + '.' : 'Самое время начинать укладывание.';
  const whys = ['окно ' + fmtClock(n.ww) + ' при норме ' + fmtClock(sn.norm.ww[0]) + '–' + fmtClock(sn.norm.ww[1])];
  if (sn.personal.samples >= 3) whys.push('учтены её удачные окна за 2 недели');
  sn.mods.forEach(m => whys.push(m.why + ' ' + m.min + ' мин'));
  if (sn.badNight) whys.push('после трудной ночи окно короче');
  const missed = sn.awake > Math.max(sn.norm.ww[1] * 2, 300)
    ? '<div class="note-c sun"><b>Похоже, сон не отмечен</b>Она не спит уже ' + fmtDur(sn.awake) + ' по записям. Добавьте пропущенные сны, и прогноз станет точнее.<div style="margin-top:8px"><button class="pill-btn" data-act="addSleep" style="background:var(--card)">Добавить сон</button></div></div>' : '';
  let rest = '';
  const after = sn.plan.slice(1);
  if (after.length) {
    rest = '<div class="tl">' + after.map(i => '<div class="tl-row">' + Art.mini(i.type === 'bed' ? 'moon' : 'cloud') + '<b>' + fmtTime(i.at) + '</b><span>' + (i.type === 'bed' ? 'Отбой' : 'Сон ' + i.index) + '</span><span class="mute small">' + (i.dur ? '≈ ' + fmtDur(i.dur) : '') + '</span></div>').join('') + '</div>';
  }
  return '<section class="card">' + ttl(isBed ? 'moon' : 'cloud', isBed ? 'Когда укладывать на ночь' : 'Когда укладывать: сон ' + n.index) +
    '<div class="next-band">' + (isBed ? Art.moon() : Art.cloud().replace('fill="#fff"', 'fill="#b9a6ff"')) + '<p class="next-time' + (sn.overdue ? ' late' : '') + '">' + fmtTime(sn.from) + '–' + fmtTime(sn.to) + '</p></div>' +
    '<p class="small">' + hint + '</p><p class="tiny">' + whys.join(' · ') + '</p>' + missed + rest + '</section>';
}
function byWhom(id) {
  const item = Sync.doc['sleeps/' + id];
  return item && item.d ? ' · ' + esc(item.d) : '';
}
function logCard(st, sn) {
  const today = todayKey();
  const items = sn.idx.segs.slice(-7).reverse();
  if (!items.length) return '';
  return '<section class="card"><div class="rowline">' + ttl('list', 'Последние записи') + '<button class="pill-btn" data-act="addSleep">Добавить сон</button></div><div class="list">' +
    items.map(s => {
      const d = keyOf(s.start);
      return '<button class="li" data-act="editSleep" data-a="' + esc(s.id) + '">' + liIcon(Art.mini(s.type === 'nap' ? 'cloud' : 'moon')) + '<span class="li-main"><span class="li-t">' + (s.type === 'nap' ? 'Дневной сон' : 'Ночной сон') + (d === today ? '' : ', ' + fmtDayShort(d)) + '</span>' +
        '<span class="li-s" style="display:block">' + fmtTime(s.start) + '–' + (s.end == null ? 'сейчас' : fmtTime(s.end)) + ' · ' + fmtDur(s.dur) + byWhom(s.id) + '</span></span>' + icon('right', 18) + '</button>';
    }).join('') + '</div></section>';
}
function endOfDayCard(st, sn) {
  const idx = sn.idx, today = sn.key, s0 = daySummary(st, idx, today);
  const key = s0.bed ? today : !s0.done.length ? addDays(today, -1) : null;
  if (!key) return '';
  const sum = key === today ? s0 : daySummary(st, idx, key), sc = scoreDay(st, sum);
  if (!sc || sc.partial) return '';
  let week = '';
  if (weekdayOf(key) === 0) {
    const w = weekReport(st, idx, mondayOf(key));
    if (!w.empty) {
      week = '<div class="rowline">' + ttl('crown', 'Итог недели') + '<span class="tag ' + w.grade.tone + '">' + w.score + '</span></div><p class="small">' + w.verdict + '</p><button class="pill-btn" data-act="openWeek" data-a="' + mondayOf(key) + '" style="justify-self:start">Разбор недели</button>';
    }
  }
  return '<section class="card"><div class="rowline">' + ttl('star', 'Итог дня: ' + (key === today ? 'сегодня' : 'вчера')) + starsRow(sc.score) + '</div><p class="small">' + esc(diagnose(st, idx, sum).verdict) + '</p><button class="pill-btn" data-act="openDay" data-a="' + key + '" style="justify-self:start">Разбор дня</button>' + week + '</section>';
}
function sleepNowView(st) {
  const sn = sleepNow(st), sleeping = sn.state === 'sleeping', night = sleeping || sn.state === 'nightwake';
  return '<section class="sky ' + (night ? 'night' : 'day') + '">' + skyDecor(night) + '<div class="dial">' + dialSvg(st, sn) + dialCenter(sn) + '</div>' +
    '<div class="legend"><span><i style="background:var(--arc)"></i>Сон</span><span><i style="background:#ffc83d"></i>Прогноз</span><span>Снаружи сегодня, внутри вчера</span></div></section>' +
    contextTags(st) + (sn.state === 'unknown' ? nextCard(st, sn) : '') +
    '<div><button class="big ' + (sleeping ? 'sun' : 'moon') + '" data-act="toggle"><span class="big-ic">' + (sleeping ? Art.sun() : Art.moon()) + '</span><span>' + (sleeping ? 'Проснулась' : 'Уснула') + '</span></button>' +
    '<div class="past" style="margin-top:14px"><span>' + (sleeping ? 'Проснулась' : 'Уснула') + ', минут назад:</span>' + [5, 10, 20].map(m => '<button class="pill-btn" data-act="toggle" data-a="' + m + '" aria-label="' + m + ' минут назад">' + m + '</button>').join('') + '</div></div>' +
    (sn.state === 'unknown' ? '' : nextCard(st, sn)) + exerciseNudge(st, sn) + endOfDayCard(st, sn) + logCard(st, sn);
}
/* Пока бодрствует и до сна ещё есть время, подсказываем упражнение */
function exerciseNudge(st, sn) {
  if (Store.demo || sn.state !== 'awake' || sn.overdue || sn.minsLeft < 20) return '';
  const next = exercisePlan(st, todayKey()).find(e => !e.finished);
  if (!next) return '';
  return '<section class="card"><div class="rowline">' + ttl('ball', 'Пока бодрствует') + '</div><div class="ex-row"><button class="ex-open" data-act="exOpen" data-a="' + next.id + '"><span class="ex-thumb">' + Art.ex(next.anim, true) + '</span><span class="li-main"><span class="li-t">' + esc(next.title) + '</span><span class="li-s" style="display:block">' + esc(next.time) + '</span></span></button></div></section>';
}

/* Записи сна */
Actions.toggle = el => {
  if (Store.demo) return needSetup();
  const st = Store.state, ago = Number(el.dataset.a) || 0, t = now() - ago * MIN;
  const open = st.sleeps.find(s => s.end == null);
  const prev = JSON.stringify(st.sleeps);
  const undo = () => { Store.update(s => { s.sleeps = JSON.parse(prev); }); refresh(); };
  burst(el);
  if (open) {
    const end = Math.max(t, open.start + MIN);
    if (!ago && now() - open.start < MIN) {
      Store.update(s => { s.sleeps = s.sleeps.filter(x => x.id !== open.id); });
      toast('Отметка отменена');
    } else {
      Store.update(s => { s.sleeps.find(x => x.id === open.id).end = end; });
      toast('Проснулась в ' + fmtTime(end), undo);
    }
  } else {
    const lastEnd = st.sleeps.reduce((m, s) => Math.max(m, s.end || 0), 0);
    const start = Math.max(t, lastEnd + MIN);
    Store.update(s => { s.sleeps.push({ id: uid(), start: Math.min(start, now()), end: null }); });
    toast('Уснула в ' + fmtTime(Math.min(start, now())), undo);
  }
  haptic();
  refresh();
};
const toLocalInput = t => keyOf(t) + 'T' + fmtTime(t);
function sleepSheet(seg, preset) {
  const isNew = !seg, s = seg || preset;
  showSheet(() => ({
    title: isNew ? 'Добавить сон' : 'Изменить сон',
    body: '<form class="form" data-form="sleep"><input type="hidden" name="id" value="' + (isNew ? '' : esc(seg.id)) + '">' +
      '<label class="field"><span>Уснула</span><input type="datetime-local" name="start" id="sl-start" value="' + toLocalInput(s.start) + '" required></label>' +
      '<label class="field"><span>Проснулась. Оставьте пустым, если ещё спит</span><input type="datetime-local" name="end" id="sl-end" value="' + (s.end ? toLocalInput(s.end) : '') + '"></label>' +
      '<label class="field"><span>Какой это сон</span><select name="kind" id="sl-kind"><option value="">Определить автоматически</option><option value="nap"' + (s.kind === 'nap' ? ' selected' : '') + '>Дневной</option><option value="night"' + (s.kind === 'night' ? ' selected' : '') + '>Ночной</option></select></label>' +
      '<p class="err" id="sl-err" hidden></p><button class="btn primary wide" type="submit">Сохранить</button>' +
      (isNew ? '' : '<button class="btn danger wide" type="button" data-act="deleteSleep" data-a="' + esc(seg.id) + '">Удалить запись</button>') + '</form>',
  }));
}
Actions.addSleep = () => {
  const t = now();
  sleepSheet(null, { start: t - 60 * MIN, end: t - 5 * MIN, kind: '' });
};
Actions.addNight = () => {
  if (Store.demo) return needSetup();
  const today = todayKey();
  sleepSheet(null, { start: atMinutes(addDays(today, -1), 21 * 60), end: Math.min(now(), atMinutes(today, 7 * 60)), kind: 'night' });
};
Actions.editSleep = el => {
  const s = Store.state.sleeps.find(x => x.id === el.dataset.a);
  if (s) sleepSheet(s);
};
Actions.deleteSleep = el => {
  if (!confirmTap(el, 'Нажмите ещё раз для удаления')) return;
  const prev = JSON.stringify(Store.state.sleeps);
  if (!mutate(s => { s.sleeps = s.sleeps.filter(x => x.id !== el.dataset.a); })) return;
  closeSheet();
  render();
  toast('Запись удалена', () => { Store.update(s => { s.sleeps = JSON.parse(prev); }); refresh(); });
};
Forms.sleep = (f, d) => {
  if (Store.demo) return needSetup();
  const err = $('#sl-err'), fail = m => { err.textContent = m; err.hidden = false; };
  const start = new Date(d.start).getTime(), end = d.end ? new Date(d.end).getTime() : null;
  if (!start) return fail('Укажите, когда уснула.');
  if (start > now()) return fail('Начало сна не может быть в будущем.');
  if (end != null && end <= start) return fail('Пробуждение должно быть позже засыпания.');
  if (end != null && end > now() + MIN) return fail('Пробуждение не может быть в будущем.');
  if (end != null && end - start > 20 * HOUR) return fail('Сон длиннее 20 часов. Проверьте даты.');
  const others = Store.state.sleeps.filter(s => s.id !== d.id);
  const clash = others.find(s => start < (s.end == null ? now() : s.end) && (end == null ? now() : end) > s.start);
  if (clash) return fail('Пересекается с записью ' + fmtDayShort(keyOf(clash.start)) + ' ' + fmtTime(clash.start) + '–' + (clash.end ? fmtTime(clash.end) : 'сейчас') + '. Измените время или удалите ту запись.');
  if (end == null && others.some(s => s.end == null)) return fail('Сейчас уже идёт другой сон. Завершите его сначала.');
  Store.update(s => {
    const rec = d.id ? s.sleeps.find(x => x.id === d.id) : null;
    const data = { start, end };
    if (d.kind) data.kind = d.kind;
    if (rec) { if (!d.kind) delete rec.kind; Object.assign(rec, data); }
    else s.sleeps.push({ id: uid(), ...data });
  });
  closeSheet();
  render();
  toast('Сохранено');
};

/* День */
function starsRow(score) {
  const n = Math.round(score / 20);
  return '<div class="stars" role="img" aria-label="' + n + ' из 5 звёзд">' + [1, 2, 3, 4, 5].map(i => Art.mini(i <= n ? 'star' : 'starOff')).join('') + '</div>';
}
function scoreHead(score, tone, label, text, note) {
  const mood = score >= 70 ? 'happy' : score >= 55 ? 'awake' : 'tired';
  return '<div class="score-head"><div class="score-bun">' + Art.bunny(mood) + '<b class="score-num">' + score + '</b></div><div class="score-text">' + starsRow(score) + '<span class="tag ' + tone + '" style="justify-self:start">' + label + '</span><p class="small">' + esc(text) + '</p>' + (note ? '<p class="tiny">' + note + '</p>' : '') + '</div></div>';
}
function dateNav(label, act, canNext) {
  return '<div class="datenav"><button class="icon-btn" data-act="' + act + '" data-a="-1" aria-label="Назад">' + icon('left') + '</button><b>' + label + '</b><button class="icon-btn" data-act="' + act + '" data-a="1" aria-label="Вперёд"' + (canNext ? '' : ' disabled') + '>' + icon('right') + '</button></div>';
}
function tipsHtml(items) {
  return '<div class="tips">' + items.map(i => '<div class="tip">' + Art.tip(i.level) + '<p class="tip-t">' + esc(i.title) + '</p>' + (i.why ? '<p class="tip-w">' + esc(i.why) + '</p>' : '') + (i.tip ? '<p class="tip-d">' + esc(i.tip) + '</p>' : '') + '</div>').join('') + '</div>';
}
function dayLabel(key) {
  const rel = relDay(key);
  return (rel === 'сегодня' || rel === 'вчера' ? rel.charAt(0).toUpperCase() + rel.slice(1) + ', ' : WD_FULL[weekdayOf(key)] + ', ') + fmtDay(key);
}
function sleepDayView(st) {
  const idx = sleepIndex(st), today = logicalDay(idx);
  if (!UI.dayKey || UI.dayKey > today) UI.dayKey = today;
  const key = UI.dayKey, sum = daySummary(st, idx, key), sc = scoreDay(st, sum), d = diagnose(st, idx, sum);
  let html = dateNav(dayLabel(key), 'dayNav', key < today);
  if (!sum.hasData) return html + '<section class="card"><div class="hero-art">' + Art.bunny('asleep') + '<div><p class="h2">За этот день записей нет</p><p class="small mute">Добавьте сны на вкладке «Сейчас».</p></div></div></section>';
  if (sc) {
    html += '<section class="card">' + scoreHead(sc.score, sc.grade.tone, sc.grade.label, d.verdict, sc.partial ? 'Предварительно: итог появится после отбоя.' : '') +
      '<div class="parts">' + sc.parts.map(p => '<div><div class="part-top"><span>' + p.label + '</span><span>' + esc(p.note) + '</span></div><div class="bar"><i style="width:' + Math.round(p.f * 100) + '%"></i></div></div>').join('') + '</div></section>';
  }
  if (!sc) {
    html += '<section class="card"><div class="hero-art">' + Art.bunny('awake') + '<div><p class="h2">Для оценки пока мало записей</p><p class="small mute">Не хватает: ' + dayMissing(sum).join(', ') + '.</p></div></div></section>';
  }
  if (sum.windows.length) {
    html += '<section class="card">' + ttl('clock', 'Окна бодрствования') + '<div class="list">' + sum.windows.map(w => {
      const [lo, hi] = sum.norm.ww, delta = w.suspect ? null : w.min > hi + 15 ? '+' + fmtDur(w.min - hi) : w.min < lo - 10 ? '−' + fmtDur(lo - w.min) : null;
      const name = w.pos === 'first' ? 'Первое' : w.pos === 'last' ? 'Перед ночью' : 'Дневное';
      return '<div class="win"><span>' + name + ' · ' + fmtTime(w.from) + '–' + fmtTime(w.to) + '</span><span class="num">' + fmtClock(w.min) + '</span><span class="tiny">норма ' + fmtClock(lo) + '–' + fmtClock(hi) + '</span>' +
        (w.suspect ? '<span class="tag mute" style="justify-self:end">не учтено</span>' : delta ? '<span class="tag bad" style="justify-self:end">' + delta + '</span>' : '<span class="tag ok" style="justify-self:end">в норме</span>') + '</div>';
    }).join('') + '</div></section>';
  }
  html += '<section class="card">' + ttl('bulb', 'Сомнолог') + (d.items.length ? tipsHtml(d.items) : '<p class="small">Отметок пока мало для разбора. Добавьте ночь и дневные сны.</p>') + '</section>';
  const picked = st.reasons[key] || [];
  html += '<section class="card">' + ttl('heart', 'Что помешало держаться графика') + '<p class="tiny">Отметьте, и сомнолог добавит подсказки. Неделя покажет, что мешает чаще всего.</p><div class="chips">' +
    Object.entries(REASONS).map(([id, r]) => '<button class="pill-btn' + (picked.includes(id) ? ' on' : '') + '" data-act="reason" data-a="' + id + '" aria-pressed="' + picked.includes(id) + '">' + r.label + '</button>').join('') + '</div></section>';
  return html;
}
Actions.dayNav = el => {
  const idx = sleepIndex(Store.state);
  UI.dayKey = addDays(UI.dayKey, Number(el.dataset.a));
  if (UI.dayKey > logicalDay(idx)) UI.dayKey = logicalDay(idx);
  render();
};
Actions.reason = el => {
  const key = UI.dayKey, id = el.dataset.a;
  if (!mutate(s => {
    const list = s.reasons[key] || [];
    s.reasons[key] = list.includes(id) ? list.filter(x => x !== id) : [...list, id];
    if (!s.reasons[key].length) delete s.reasons[key];
  })) return;
  render();
};

/* Неделя */
function actogram(idx, days) {
  const L = 34, W = 320 - L - 34, rowH = 26, top = 18, t = now();
  const x = m => (L + m / 1440 * W).toFixed(1);
  let s = '<svg viewBox="0 0 320 ' + (top + rowH * 7 + 4) + '" role="img" aria-label="График сна по дням недели" style="width:100%;height:auto;display:block">';
  [0, 6, 12, 18, 24].forEach(h => {
    const X = x(h * 60);
    s += '<text x="' + X + '" y="10" font-size="11.5" font-weight="800" text-anchor="middle" fill="var(--mute)">' + h + '</text>';
  });
  days.forEach((d, i) => {
    const y = top + i * rowH, start = parseKey(d.key), end = parseKey(addDays(d.key, 1));
    s += '<text x="0" y="' + (y + 17) + '" font-size="13.5" font-weight="800" fill="var(--mute)">' + WD_SHORT[weekdayOf(d.key)] + '</text>';
    s += '<rect x="' + L + '" y="' + (y + 4) + '" width="' + W + '" height="17" rx="8.5" fill="var(--card2)"/>';
    idx.segs.forEach(g => {
      const a = Math.max(g.start, start), b = Math.min(g.end == null ? t : g.end, end);
      if (b <= a) return;
      const x0 = (a - start) / MIN, x1 = (b - start) / MIN;
      s += '<rect x="' + x(x0) + '" y="' + (y + 4) + '" width="' + Math.max(3, (x1 - x0) / 1440 * W).toFixed(1) + '" height="17" rx="5" fill="' + (g.type === 'nap' ? '#ffc83d' : 'var(--grape)') + '"/>';
    });
    if (d.score && d.sum.complete) s += '<text x="320" y="' + (y + 17) + '" font-size="14" font-weight="900" text-anchor="end" fill="var(--ink)">' + d.score.score + '</text>';
  });
  return s + '</svg>';
}
function sleepWeekView(st) {
  const idx = sleepIndex(st), current = mondayOf(logicalDay(idx));
  if (!UI.week || UI.week > current) UI.week = current;
  const w = weekReport(st, idx, UI.week);
  let html = dateNav(fmtRange(UI.week, addDays(UI.week, 6)), 'weekNav', UI.week < current);
  html += '<section class="card">' + ttl('cal', 'Неделя по дням') + actogram(idx, w.days) + '<div class="legend"><span><i style="background:var(--grape)"></i>Ночь</span><span><i style="background:#ffc83d"></i>День</span><span>Справа оценка дня</span></div></section>';
  if (w.empty) return html + '<section class="card"><div class="hero-art">' + Art.bunny('asleep') + '<div><p class="h2">Оценка недели появится после ' + WEEK_MIN_DAYS + ' полных дней</p><p class="small mute">Уже есть: ' + w.scored.length + ' из ' + WEEK_MIN_DAYS + '. Полный день это отмеченные утренний подъём, дневные сны и отбой.</p></div></div></section>';
  const s = w.stats, stat = (v, label) => '<div class="stat"><b>' + v + '</b><span>' + label + '</span></div>';
  html += '<section class="card">' + scoreHead(w.score, w.grade.tone, w.grade.label, w.verdict, 'По ' + w.scored.length + ' ' + plural(w.scored.length, 'дню', 'дням', 'дням') + ' из 7') +
    '<div class="stats">' +
    (s.total != null ? stat(fmtClock(s.total), 'сна за сутки, норма ' + w.norm.total[0] + '–' + w.norm.total[1] + ' ч') : '') +
    (s.night != null ? stat(fmtClock(s.night), 'ночной сон') : '') +
    (s.bed != null ? stat(fmtMinOfDay(s.bed), 'средний отбой') : '') +
    (s.rise != null ? stat(fmtMinOfDay(s.rise), 'средний подъём') : '') +
    (s.wakes != null ? stat(fmtHoursNum(s.wakes.toFixed(1)), 'пробуждений за ночь') : '') +
    (s.windowsPct != null ? stat(s.windowsPct + '%', 'окон в норме') : '') +
    '</div></section>';
  if (w.scored.length >= 2) {
    html += '<section class="card">' + ttl('crown', 'Лучший и трудный день') + '<div class="list"><div class="li"><span class="li-main"><span class="li-t">' + WD_FULL[weekdayOf(w.best.key)] + ', ' + fmtDayShort(w.best.key) + '</span></span><span class="tag ok">' + w.best.score.score + '</span></div>' +
      '<button class="li" data-act="openDay" data-a="' + w.worst.key + '"><span class="li-main"><span class="li-t">' + WD_FULL[weekdayOf(w.worst.key)] + ', ' + fmtDayShort(w.worst.key) + '</span><span class="li-s" style="display:block">Открыть разбор</span></span><span class="tag ' + w.worst.score.grade.tone + '">' + w.worst.score.score + '</span></button></div></section>';
  }
  html += '<section class="card">' + ttl('bulb', 'Сомнолог о неделе') + (w.tips.length ? tipsHtml(w.tips) : '<p class="small">Заметных проблем нет. Продолжайте в том же ритме.</p>') +
    (w.focus ? '<div class="note-c sun"><b>Главная цель на следующую неделю</b>' + esc(w.focus.tip) + '</div>' : '') + '</section>';
  return html;
}
Actions.weekNav = el => {
  UI.week = addDays(UI.week, Number(el.dataset.a) * 7);
  render();
};
Actions.openWeek = el => {
  UI.week = el.dataset.a;
  UI.sub.sleep = 'week';
  render();
  window.scrollTo(0, 0);
};
Actions.openDay = el => {
  UI.dayKey = el.dataset.a;
  UI.sub.sleep = 'day';
  render();
  window.scrollTo(0, 0);
};

/* Нормы */
function sleepNormView(st) {
  const today = todayKey(), weeks = Math.max(0, ageWeeksOn(st, today)), n = normFor(weeks);
  const [a, b] = bedWindow(st, n), range = (x, u) => x[0] === x[1] ? fmtHoursNum(x[0]) + u : fmtHoursNum(x[0]) + '–' + fmtHoursNum(x[1]) + u;
  const stat = (v, label) => '<div class="stat"><b>' + v + '</b><span>' + label + '</span></div>';
  return '<section class="card">' + ttl('clock', 'Ориентир на ' + esc(n.label)) + '<div class="stats">' +
    stat(fmtClock(n.ww[0]) + '–' + fmtClock(n.ww[1]), 'окно бодрствования') + stat(range(n.total, ' ч'), 'сон за сутки') +
    stat(range(n.naps, ''), 'дневных снов') + stat(range(n.day, ' ч'), 'сон днём') + stat(range(n.night, ' ч'), 'сон ночью') +
    stat(fmtMinOfDay(a) + '–' + fmtMinOfDay(b), 'время отбоя') + '</div>' +
    '<p class="tiny">Сон за сутки взят из рекомендаций AASM и National Sleep Foundation. Окна и число снов это практический ориентир сомнологов, а не медицинская норма. У каждого ребёнка они немного свои, и радар учится на её данных.</p></section>' +
    '<section class="card">' + ttl('list', 'Все возрасты') + '<div class="table-wrap"><table><thead><tr><th>Возраст</th><th>Окно</th><th>Снов</th><th>Сутки</th></tr></thead><tbody>' +
    SLEEP_NORMS.map(x => '<tr class="' + (x === n ? 'row-on' : '') + '"><td>' + x.label + '</td><td>' + fmtClock(x.ww[0]) + '–' + fmtClock(x.ww[1]) + '</td><td>' + range(x.naps, '') + '</td><td>' + range(x.total, ' ч') + '</td></tr>').join('') +
    '</tbody></table></div></section>' +
    '<section class="card">' + ttl('shield', 'Безопасный сон до года') + '<ul class="bul"><li>Всегда на спине, на твёрдой ровной поверхности</li><li>В кроватке только натянутая простыня: без подушек, одеял, бортиков и игрушек</li><li>В одной комнате с родителями как минимум первые 6 месяцев, но не в одной постели</li><li>Пеленание прекращают, как только ребёнок пытается переворачиваться</li><li>Уснула в коляске или автокресле: при первой возможности переложите на ровную поверхность</li></ul><p class="tiny">Рекомендации Американской академии педиатрии.</p></section>' +
    '<section class="card">' + ttl('sos', 'Покажите врачу') + '<ul class="bul"><li>Громкий храп, паузы в дыхании, посинение во сне</li><li>Очень трудно разбудить</li><li>Резкое изменение сна вместе с температурой, рвотой, отказом от еды</li><li>Плач, который не удаётся успокоить</li></ul><p class="tiny">Подсказки в приложении не заменяют консультацию врача.</p></section>';
}
