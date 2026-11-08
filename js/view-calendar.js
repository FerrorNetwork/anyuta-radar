'use strict';

/* Вкладка «Календарь»: дорожка скачков, месяц с отметками, карта зубов. */

function viewCalendar(st) {
  const body = { soon: calSoonView, month: calMonthView, teeth: calTeethView }[UI.sub.cal](st);
  return seg('cal', [['soon', 'Скоро'], ['month', 'Месяц'], ['teeth', 'Зубы']]) + body;
}

function whenLabel(start, end) {
  const today = todayKey();
  if (start <= today && today <= end) return 'идёт сейчас, до ' + fmtDayShort(end);
  return relDay(start) + ' · ' + fmtRange(start, end);
}
function eventKind(kind) {
  return { leap: ['', 'Скачок', 'hop'], sleep: ['', 'Сон', 'moon'], tooth: ['sun', 'Зубы', 'tooth'], growth: ['ok', 'Рост', 'sprout'], feed: ['warn', 'Прикорм', 'spoon'] }[kind];
}
/* Зайка прыгает по холмикам: каждый холмик это скачок */
function hopTrack(st) {
  const leaps = leapSchedule(st), gap = 88, x0 = 56, H = 186, stopY = 118;
  const W = x0 * 2 + gap * (leaps.length - 1), X = i => x0 + i * gap;
  const nowI = leaps.findIndex(l => l.status === 'now'), nextI = leaps.findIndex(l => l.status === 'next');
  const between = nowI < 0 && nextI > 0;
  const bx = nowI >= 0 ? X(nowI) : between ? X(nextI) - gap / 2 : nextI === 0 ? X(0) : X(leaps.length - 1);
  const by = between ? 22 : 40;
  let s = '<svg class="hop-svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="group" aria-label="Дорожка скачков">';
  s += '<rect x="0" y="148" width="' + W + '" height="38" fill="var(--mint-soft)"/>';
  leaps.forEach((l, i) => { s += '<path d="M' + (X(i) - 62) + ' 150q62-66 124 0z" fill="' + (l.status === 'done' ? 'var(--mint-soft)' : 'var(--sky-soft)') + '"/>'; });
  leaps.slice(0, -1).forEach((l, i) => { s += '<path d="M' + X(i) + ' ' + (stopY - 24) + 'Q' + (X(i) + gap / 2) + ' ' + (stopY - 74) + ' ' + X(i + 1) + ' ' + (stopY - 24) + '" fill="none" stroke="var(--sky)" stroke-width="3" stroke-linecap="round" stroke-dasharray=".1 9" opacity=".7"/>'; });
  leaps.forEach((l, i) => {
    const x = X(i), fill = l.status === 'done' ? 'var(--mint)' : l.status === 'now' ? '#ffc83d' : 'var(--card)';
    const ink = l.status === 'done' ? 'var(--on-mint)' : l.status === 'now' ? '#4a3000' : 'var(--sky-ink)';
    s += '<g class="hop-stop" data-act="leapOpen" data-a="' + l.n + '" role="button" tabindex="0" aria-label="Скачок ' + l.n + '"><circle cx="' + x + '" cy="' + stopY + '" r="22" fill="' + fill + '" stroke="var(--card)" stroke-width="3"/>';
    if (l.status === 'done') s += '<g transform="translate(' + (x - 13) + ' ' + (stopY - 13) + ') scale(1.08)"><path d="' + STAR_PATH + '" fill="#ffd76a" stroke="#ffd76a" stroke-width="2" stroke-linejoin="round"/></g>';
    else s += '<text x="' + x + '" y="' + (stopY + 7) + '" text-anchor="middle" font-size="20" font-weight="900" fill="' + ink + '">' + l.n + '</text>';
    s += '<text x="' + x + '" y="174" text-anchor="middle" font-size="13" font-weight="800" fill="var(--sky-ink)">' + fmtDayShort(l.start) + '</text></g>';
  });
  s += '<g transform="translate(' + (bx - 34) + ' ' + by + ') scale(.43)"><g class="hop-bun">' + bunnyBody('happy') + '</g></g>';
  return '<div class="hop-wrap" id="hop-wrap" data-focus="' + bx + '">' + s + '</svg></div>';
}
function calSoonView(st) {
  const events = upcomingEvents(st), today = todayKey();
  const shift = leapSchedule(st).find(l => l.shift);
  let html = '<section class="card">' + ttl('hop', 'Дорожка скачков') + hopTrack(st) + '<p class="tiny">Нажмите на холмик, чтобы открыть скачок.</p></section>';
  html += '<section class="card">' + ttl('star', 'Что ждём');
  html += '<div>' + events.slice(0, 6).map(e => {
    const [cls, label, ic] = eventKind(e.kind), active = e.start <= today && today <= e.end;
    return '<div class="ev"><div class="ev-top"><p class="ev-t">' + esc(e.title) + '</p><span class="tag ' + cls + '" style="flex:none">' + Art.mini(ic) + label + '</span></div><p class="ev-when">' + whenLabel(e.start, e.end) + '</p>' + (e.text ? '<p class="small">' + esc(e.text) + '</p>' : '') +
      (e.kind === 'leap' ? '<div class="btn-row" style="margin-top:6px"><button class="pill-btn" data-act="leapOpen" data-a="' + e.leap.n + '">Подробнее</button>' + (active && !e.leap.marked ? '<button class="pill-btn" data-act="leapMark" data-a="start" data-b="' + e.leap.n + '">Подтвердить начало</button>' : '') + (active && e.leap.marked && !e.leap.closed ? '<button class="pill-btn" data-act="leapMark" data-a="end" data-b="' + e.leap.n + '">Закончился</button>' : '') + '</div>' : '') + '</div>';
  }).join('') + '</div></section>';
  if (shift) html += '<div class="note-c"><b>Прогноз подстроен под ваши отметки</b>Следующие скачки сдвинуты на ' + Math.abs(shift.shift) + ' ' + plural(Math.abs(shift.shift), 'день', 'дня', 'дней') + (shift.shift > 0 ? ' позже' : ' раньше') + ' обычного.</div>';
  html += '<p class="tiny">Сроки опираются на наблюдения Ван де Рейт и Плойе и считаются от предполагаемой даты родов. Независимые исследования не подтвердили точную привязку к неделям, поэтому считайте календарь ориентиром, а ваши отметки важнее него.</p>';
  return html;
}
function leapSheet(n) {
  showSheet(() => {
    const l = leapSchedule(Store.state).find(x => x.n === n);
    const list = a => '<ul class="bul">' + a.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>';
    return {
      title: 'Скачок ' + l.n + ': ' + l.title,
      body: '<p class="small mute">' + fmtRange(l.start, l.end) + ' · ' + relDay(l.start) + (l.shift ? ' · сдвиг по вашим отметкам' : '') + '</p><p>' + esc(l.about) + '</p>' +
        '<div class="stack">' + ttl('rain', 'Как это выглядит') + list(l.signs) + '</div><div class="stack">' + ttl('heart', 'Чем помочь') + list(l.help) + '</div><div class="stack">' + ttl('star', 'Что появится потом') + list(l.skills) + '</div>' +
        '<div class="btn-row"><button class="btn ' + (l.marked ? 'ghost' : 'primary') + '" data-act="leapMark" data-a="start" data-b="' + n + '">' + (l.marked ? 'Снять отметку начала' : 'Начался сегодня') + '</button>' +
        '<button class="btn ghost" data-act="leapMark" data-a="end" data-b="' + n + '">' + (l.closed ? 'Снять отметку конца' : 'Закончился сегодня') + '</button></div><p class="tiny">Начало и конец можно поставить на любую дату во вкладке «Месяц».</p>',
    };
  });
}
Actions.leapOpen = el => leapSheet(Number(el.dataset.a));
Actions.leapMark = el => {
  const n = Number(el.dataset.b), type = el.dataset.a === 'start' ? 'leap_start' : 'leap_end', today = todayKey();
  const exists = Store.state.marks.find(m => m.type === type && m.leap === n);
  if (!mutate(s => {
    if (exists) s.marks = s.marks.filter(m => m.id !== exists.id);
    else s.marks.push({ id: uid(), date: today, type, leap: n, note: '' });
  })) return;
  haptic();
  refresh();
  toast(exists ? 'Отметка снята' : type === 'leap_start' ? 'Отмечено. Следующие скачки пересчитаны' : 'Отмечено');
};

/* Месяц */
function monthData(st) {
  const base = ageBaseKey(st), byDay = {};
  const put = (k, v) => { (byDay[k] = byDay[k] || []).push(v); };
  st.marks.forEach(m => put(m.date, { dot: MARK_TYPES[m.type].color, mark: m }));
  Object.entries(st.teeth).forEach(([id, d]) => { put(d, { dot: 'sun', tooth: id }); });
  st.foods.filter(f => f.reaction !== 'ok').forEach(f => put(f.date, { dot: 'bad', food: f }));
  return { byDay, leaps: leapSchedule(st), regs: REGRESSIONS.map(r => { const [a, b] = weekWindow(base, r.from, r.to); return { ...r, a, b }; }) };
}
function calMonthView(st) {
  const today = todayKey();
  if (!UI.month) UI.month = today.slice(0, 7) + '-01';
  const first = UI.month, [y, m] = first.split('-').map(Number), md = monthData(st);
  const start = mondayOf(first), cells = [];
  for (let i = 0; i < 42; i++) cells.push(addDays(start, i));
  const last = cells.findIndex((k, i) => i >= 28 && i % 7 === 0 && Number(k.split('-')[1]) !== m);
  const list = last > 0 ? cells.slice(0, last) : cells;
  const grid = list.map(k => {
    const inMonth = Number(k.split('-')[1]) === m, leap = md.leaps.some(l => l.start <= k && k <= l.end), reg = md.regs.some(r => r.a <= k && k <= r.b);
    const dots = (md.byDay[k] || []).slice(0, 3).map(x => '<i class="' + x.dot + '"></i>').join('');
    return '<button class="cal-cell' + (inMonth ? '' : ' out') + (leap ? ' leap' : reg ? ' reg' : '') + (k === today ? ' today' : '') + '" data-act="dayOpen" data-a="' + k + '" aria-label="' + fmtDay(k) + '"><span>' + Number(k.split('-')[2]) + '</span><span class="cal-dots">' + dots + '</span></button>';
  }).join('');
  return dateNav(MONTHS_NOM[m - 1] + ' ' + y, 'monthNav', true) +
    '<section class="card"><div class="cal-head"><span>Пн</span><span>Вт</span><span>Ср</span><span>Чт</span><span>Пт</span><span>Сб</span><span>Вс</span></div><div class="cal-grid">' + grid + '</div>' +
    '<div class="legend"><span><i style="background:var(--band-leap)"></i>Скачок</span><span><i style="background:var(--band-reg)"></i>Перестройка сна</span><span><i style="background:var(--peach)"></i>Зубы, капризы</span><span><i style="background:var(--mint)"></i>Навык, прививка</span></div></section>' +
    '<p class="tiny">Нажмите на день, чтобы поставить отметку: начался скачок, зубы, температура, прививка, новый навык. Отметки уточняют прогноз и подсказки сомнолога.</p>';
}
Actions.monthNav = el => {
  const [y, m] = UI.month.split('-').map(Number);
  UI.month = keyOf(new Date(y, m - 1 + Number(el.dataset.a), 1));
  render();
};
function daySheet(key) {
  showSheet(() => {
    const st = Store.state, leaps = leapSchedule(st).filter(l => l.start <= key && key <= l.end);
    const base = ageBaseKey(st), regs = REGRESSIONS.filter(r => { const [a, b] = weekWindow(base, r.from, r.to); return a <= key && key <= b; });
    const marks = st.marks.filter(m => m.date === key);
    const teeth = Object.entries(st.teeth).filter(([, d]) => d === key);
    const info = [...leaps.map(l => 'Скачок ' + l.n + ': ' + l.title), ...regs.map(r => r.title), ...teeth.map(([id]) => toothName(id) + ' прорезался')];
    return {
      title: fmtDay(key) + ', ' + WD_FULL[weekdayOf(key)],
      body: (info.length ? '<ul class="bul">' + info.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>' : '') +
        (marks.length ? '<div class="stack">' + ttl('list', 'Ваши отметки') + '<div class="list">' + marks.map(m => '<div class="li"><span class="li-main"><span class="li-t">' + MARK_TYPES[m.type].label + (m.leap ? ' ' + m.leap : '') + '</span>' + (m.note ? '<span class="li-s" style="display:block">' + esc(m.note) + '</span>' : '') + '</span><button class="pill-btn" data-act="removeMark" data-a="' + m.id + '">Убрать</button></div>').join('') + '</div></div>' : '') +
        '<div class="stack">' + ttl('star', 'Поставить отметку') + '<label class="field"><span>Комментарий, если нужен</span><input type="text" id="mark-note" maxlength="120"></label><div class="chips">' +
        Object.entries(MARK_TYPES).map(([id, t]) => '<button class="pill-btn" data-act="addMark" data-a="' + id + '" data-b="' + key + '">' + t.label + '</button>').join('') + '</div></div>',
    };
  });
}
Actions.dayOpen = el => daySheet(el.dataset.a);
Actions.addMark = el => {
  const type = el.dataset.a, date = el.dataset.b, st = Store.state, noteEl = $('#mark-note');
  const note = noteEl ? noteEl.value.trim() : '';
  let leap;
  if (type === 'leap_start' || type === 'leap_end') {
    const near = Store.demo ? null : nearestLeap(st, date);
    if (!Store.demo && !near) return toast('Рядом с этой датой скачков не ожидается');
    leap = near ? near.n : undefined;
  }
  if (!mutate(s => {
    if (leap) s.marks = s.marks.filter(m => !(m.type === type && m.leap === leap));
    const mark = { id: uid(), date, type, note };
    if (leap) mark.leap = leap;
    s.marks.push(mark);
  })) return;
  haptic();
  burst(el, 6);
  refresh();
  toast('Отмечено: ' + MARK_TYPES[type].label.toLowerCase());
};
Actions.removeMark = el => {
  const prev = JSON.stringify(Store.state.marks);
  if (!mutate(s => { s.marks = s.marks.filter(m => m.id !== el.dataset.a); })) return;
  refresh();
  toast('Отметка убрана', () => { Store.update(s => { s.marks = JSON.parse(prev); }); refresh(); });
};

/* Зубы */
function toothName(id) {
  const [typeId, side] = id.split('-'), t = TEETH.find(x => x.id === typeId);
  return t.name.replace('Нижние', 'Нижний').replace('Верхние', 'Верхний').replace('центральные', 'центральный').replace('боковые', 'боковой').replace('первые', 'первый').replace('вторые', 'второй').replace('резцы', 'резец').replace('моляры', 'моляр').replace('клыки', 'клык') + (side === 'l' ? ', левый' : ', правый');
}
function jawSvg(plan) {
  const angles = [9, 28, 47, 66, 87], sizes = [[28, 24], [26, 24], [24, 26], [30, 27], [32, 29]];
  let s = '<svg viewBox="0 0 340 290" role="group" aria-label="Карта зубов">';
  const gum = up => {
    const pts = [];
    for (let d = -96; d <= 96; d += 8) {
      const r = d * Math.PI / 180;
      pts.push((170 + 126 * Math.sin(r)).toFixed(1) + ' ' + (up ? 124 - 104 * Math.cos(r) : 166 + 104 * Math.cos(r)).toFixed(1));
    }
    return '<polyline points="' + pts.join(',') + '" fill="none" stroke="var(--gum)" stroke-width="46" stroke-linecap="round" stroke-linejoin="round"/>';
  };
  s += gum(true) + gum(false);
  const draw = (t, side, jawUp) => {
    const deg = angles[t.pos], rad = deg * Math.PI / 180, sign = side === 'l' ? -1 : 1;
    const x = 170 + sign * 126 * Math.sin(rad);
    const y = jawUp ? 124 - 104 * Math.cos(rad) : 166 + 104 * Math.cos(rad);
    const [w, h] = sizes[t.pos], rot = jawUp ? sign * deg : -sign * deg;
    const done = t[side === 'l' ? 'left' : 'right'], cls = done ? 'done' : t.status === 'now' ? 'now' : t.status === 'late' ? 'late' : '';
    const id = t.id + '-' + side;
    return '<g class="tooth ' + cls + '" data-act="toothOpen" data-a="' + id + '" role="button" aria-label="' + esc(toothName(id)) + '" tabindex="0" transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + rot + ')"><rect x="' + (-w / 2) + '" y="' + (-h / 2) + '" width="' + w + '" height="' + h + '" rx="9"/>' + (done ? Art.toothFace() : '') + '</g>';
  };
  plan.forEach(t => ['l', 'r'].forEach(side => { s += draw(t, side, t.jaw === 'up'); }));
  s += '<text x="170" y="118" text-anchor="middle" font-size="13.5" font-weight="800" fill="var(--mute)">верхние</text><text x="170" y="182" text-anchor="middle" font-size="13.5" font-weight="800" fill="var(--mute)">нижние</text>';
  return s + '</svg>';
}
function calTeethView(st) {
  const plan = toothPlan(st), total = Object.keys(st.teeth).length, next = nextTeeth(st), off = toothOffset(st);
  const nextT = next[0];
  const headline = !total && nextT ? 'Первый зуб ждём ' + (nextT.from > todayKey() ? 'с ' + fmtDay(nextT.from) : 'в ближайшие месяцы') : nextT ? 'Дальше: ' + nextT.name.toLowerCase() : 'Все 20 молочных зубов на месте';
  const windowText = nextT ? (nextT.status === 'late' ? 'Срок по таблице прошёл, покажите педиатру или стоматологу' : 'Окно ' + fmtRange(nextT.from < todayKey() ? todayKey() : nextT.from, nextT.to) + ', вероятнее всего около ' + fmtDayShort(nextT.expected)) : '';
  return '<section class="card"><div class="rowline">' + ttl('tooth', 'Прорезалось') + '<span class="tag sky">' + total + ' из 20</span></div><p class="h">' + esc(headline) + '</p><p class="small">' + esc(windowText) + '</p>' +
    (off && total ? '<p class="tiny">Зубы идут ' + (off < 0 ? 'раньше' : 'позже') + ' таблицы примерно на ' + fmtHoursNum(Math.abs(off).toFixed(1)) + ' мес, прогноз учитывает это.</p>' : '') +
    '<div class="jaw">' + jawSvg(plan) + '</div><div class="legend"><span><i style="background:#fff;box-shadow:inset 0 0 0 2px #d9cdee"></i>Вышел</span><span><i style="background:var(--sunny)"></i>Сейчас в окне</span><span>Нажмите на зуб, чтобы отметить</span></div></section>' +
    '<section class="card">' + ttl('list', 'Порядок прорезывания') + '<div class="list">' + plan.map(t => '<div class="li"><span class="li-main"><span class="li-t">' + t.name + '</span><span class="li-s" style="display:block">' + t.from_label + '</span></span><span class="tag ' + (t.status === 'done' ? 'ok' : t.status === 'now' ? 'sun' : t.status === 'late' ? 'bad' : 'mute') + '">' + (t.count ? t.count + ' из 2' : t.status === 'now' ? 'в окне' : t.status === 'late' ? 'позже срока' : 'впереди') + '</span></div>').join('') + '</div><p class="tiny">Сроки: таблица Американской стоматологической ассоциации.</p></section>' +
    '<section class="card">' + ttl('heart', 'Когда режутся зубы') + '<ul class="bul"><li>Обычно: больше слюней, припухшие дёсны, тянет всё в рот, немного капризничает</li><li>Помогают: чистый палец или прохладный прорезыватель, массаж дёсен</li><li>Не используйте гели с бензокаином и янтарные бусы</li><li>Температура выше 38 °C, понос и сильный плач зубами не объясняются: покажите врачу</li></ul></section>';
}
Actions.toothOpen = el => {
  const id = el.dataset.a;
  showSheet(() => {
    const d = Store.state.teeth[id] || null, [typeId] = id.split('-'), t = toothPlan(Store.state).find(x => x.id === typeId);
    return {
      title: toothName(id),
      body: '<p class="small mute">Обычно появляется в ' + t.months + ' мес</p><form class="form" data-form="tooth"><input type="hidden" name="id" value="' + id + '"><label class="field"><span>Когда прорезался</span><input type="date" name="date" id="tooth-date" value="' + (d || todayKey()) + '" max="' + todayKey() + '" required></label><button class="btn primary wide" type="submit">Сохранить</button>' + (d ? '<button class="btn danger wide" type="button" data-act="toothClear" data-a="' + id + '">Убрать отметку</button>' : '') + '</form>',
    };
  });
};
Forms.tooth = (f, d) => {
  if (!mutate(s => { s.teeth[d.id] = d.date; })) return;
  burst(f.querySelector('button[type=submit]'), 12);
  closeSheet();
  haptic();
  render();
  toast('Ура, новый зубик! Прогноз обновлён');
};
Actions.toothClear = el => {
  if (!mutate(s => { delete s.teeth[el.dataset.a]; })) return;
  closeSheet();
  render();
  toast('Отметка убрана');
};
