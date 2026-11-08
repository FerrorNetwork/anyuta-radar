'use strict';

/* Сомнолог: классификация снов, прогноз следующего укладывания, оценки, разбор причин.
   Суммарный сон: AASM и National Sleep Foundation. Окна бодрствования: практический ориентир. */

const SLEEP_NORMS = [
  { to: 4, label: '0–4 недели', ww: [35, 60], naps: [5, 8], total: [14, 17], day: [6, 9], night: [8, 10], bed: [1260, 1410], nap: 50, wakes: 4, schedule: false },
  { to: 8, label: '1–2 месяца', ww: [45, 75], naps: [4, 6], total: [14, 17], day: [6, 8], night: [8, 10], bed: [1230, 1380], nap: 50, wakes: 4, schedule: false },
  { to: 12, label: '2–3 месяца', ww: [60, 90], naps: [4, 5], total: [14, 17], day: [5, 7], night: [9, 10.5], bed: [1200, 1350], nap: 50, wakes: 3, schedule: false },
  { to: 17, label: '3–4 месяца', ww: [75, 120], naps: [3, 5], total: [14, 17], day: [4, 6], night: [9.5, 11], bed: [1170, 1290], nap: 50, wakes: 3, schedule: true },
  { to: 22, label: '4–5 месяцев', ww: [90, 135], naps: [3, 4], total: [12, 16], day: [3.5, 5], night: [10, 11.5], bed: [1140, 1260], nap: 55, wakes: 3, schedule: true },
  { to: 26, label: '5–6 месяцев', ww: [105, 150], naps: [3, 4], total: [12, 16], day: [3, 4.5], night: [10, 11.5], bed: [1140, 1230], nap: 60, wakes: 2, schedule: true },
  { to: 31, label: '6–7 месяцев', ww: [120, 165], naps: [2, 3], total: [12, 16], day: [2.5, 4], night: [10, 12], bed: [1140, 1230], nap: 65, wakes: 2, schedule: true },
  { to: 35, label: '7–8 месяцев', ww: [135, 195], naps: [2, 3], total: [12, 16], day: [2.5, 3.5], night: [10, 12], bed: [1140, 1230], nap: 70, wakes: 2, schedule: true },
  { to: 44, label: '8–10 месяцев', ww: [150, 210], naps: [2, 2], total: [12, 16], day: [2, 3.5], night: [10, 12], bed: [1140, 1230], nap: 75, wakes: 2, schedule: true },
  { to: 56, label: '10–13 месяцев', ww: [180, 240], naps: [2, 2], total: [12, 16], day: [2, 3], night: [10, 12], bed: [1140, 1230], nap: 75, wakes: 1, schedule: true },
  { to: 65, label: '13–15 месяцев', ww: [210, 300], naps: [1, 2], total: [11, 14], day: [1.5, 3], night: [10, 12], bed: [1140, 1230], nap: 85, wakes: 1, schedule: true },
  { to: 78, label: '15–18 месяцев', ww: [270, 360], naps: [1, 2], total: [11, 14], day: [1.5, 2.5], night: [10, 12], bed: [1140, 1230], nap: 110, wakes: 1, schedule: true },
  { to: 104, label: '18–24 месяца', ww: [300, 390], naps: [1, 1], total: [11, 14], day: [1.5, 2.5], night: [10, 12], bed: [1140, 1260], nap: 110, wakes: 1, schedule: true },
  { to: 1e4, label: 'от 2 лет', ww: [330, 420], naps: [0, 1], total: [10, 13], day: [1, 2], night: [10, 11.5], bed: [1170, 1260], nap: 100, wakes: 1, schedule: true },
];
const normFor = weeks => SLEEP_NORMS.find(n => weeks < n.to) || SLEEP_NORMS[SLEEP_NORMS.length - 1];

const REASONS = {
  walk: { label: 'Прогулка, коляска', tip: 'Сон в движении часто поверхностный. Планируйте прогулку так, чтобы первый сон дня проходил дома, а коляска приходилась на второй.' },
  road: { label: 'Дорога, поездка', tip: 'После дороги дайте день на восстановление: окна на 10–15 минут короче и отбой чуть раньше.' },
  guests: { label: 'Гости, шум', tip: 'После насыщенного общения начинайте укладывание раньше и добавьте 10 минут тихого времени.' },
  feed: { label: 'Сдвинулось кормление', tip: 'Голод и сон часто спорят. Кормите за 20–30 минут до укладывания, чтобы сытость не превращалась в засыпание на груди или бутылочке.' },
  wouldnt: { label: 'Долго не засыпала', tip: 'Если засыпание занимает больше 25–30 минут, окно могло быть неподходящим. Проверьте, не было ли оно слишком коротким или длинным, и запишите ранние признаки усталости.' },
  sick: { label: 'Болеет', tip: 'Во время болезни сон важнее графика. Обычный режим вернётся за 3–5 дней после выздоровления.' },
  teeth: { label: 'Зубы', tip: 'Дискомфорт от зубов обычно длится несколько дней. Прохладный прорезыватель перед сном и обезболивающее только по совету педиатра. Высокая температура зубами не объясняется.' },
  leap: { label: 'Капризы, скачок', tip: 'В такие дни сокращайте окна на 10–15 минут и добавляйте контакт перед сном. Новые правила лучше вводить после этого периода.' },
  vaccine: { label: 'Прививка', tip: 'После прививки сонливость или беспокойство на 1–2 дня обычны. Давайте спать, когда просит.' },
  us: { label: 'Мы не успели', tip: 'Напоминание за 20 минут до окна помогает: ритуал занимает время, и начинать его стоит до усталости.' },
  env: { label: 'Жарко, душно, светло', tip: 'В комнате лучше 20–22 °C, плотные шторы и проветривание перед сном.' },
};

function sleepIndex(st, t = now()) {
  const stamp = Store.rev + ':' + Math.floor(t / MIN) + ':' + st.sleeps.length;
  if (sleepIndex.memo && sleepIndex.memo.st === st && sleepIndex.memo.stamp === stamp) return sleepIndex.memo.idx;
  const segs = st.sleeps.slice().sort((a, b) => a.start - b.start).map(s => ({ ...s }));
  segs.forEach((s, i) => {
    const prev = segs[i - 1], m = minOfDay(s.start), dur = ((s.end == null ? t : s.end) - s.start) / MIN;
    s.dur = Math.max(0, dur);
    if (s.kind === 'nap' || s.kind === 'night') { s.type = s.kind; return; }
    const crosses = keyOf(s.start) !== keyOf(s.end == null ? t : s.end);
    const gap = prev && prev.end != null ? (s.start - prev.end) / MIN : Infinity;
    const continues = prev && prev.type === 'night' && gap <= 150 && (m >= 1110 || m < 390);
    const night = m < 300 || (m >= 1110 && (dur >= 120 || crosses || (s.end == null && m >= 1140))) || (crosses && dur >= 240) || continues;
    s.type = night ? 'night' : 'nap';
  });
  const blocks = [];
  let open = null;
  segs.forEach(s => {
    if (s.type !== 'night') { open = null; return; }
    const gap = open && open.end != null ? (s.start - open.end) / MIN : null;
    if (open && gap != null && gap <= 180) {
      open.wakes.push({ from: open.end, to: s.start, min: gap });
      open.end = s.end == null ? null : s.end;
      open.asleep += s.dur;
      open.segs.push(s);
    } else {
      open = { start: s.start, end: s.end == null ? null : s.end, asleep: s.dur, wakes: [], segs: [s] };
      blocks.push(open);
    }
  });
  blocks.forEach(b => {
    b.bedKey = minOfDay(b.start) < 300 ? addDays(keyOf(b.start), -1) : keyOf(b.start);
    b.wakeKey = b.end == null ? null : keyOf(b.end);
  });
  const idx = { segs, blocks };
  sleepIndex.memo = { st, stamp, idx };
  return idx;
}

/* «Сегодня» для родителя начинается с утреннего подъёма, а не с полуночи */
function logicalDay(idx, t = now()) {
  const last = idx.segs[idx.segs.length - 1];
  if (last && last.end == null && last.type === 'night') {
    const b = idx.blocks[idx.blocks.length - 1];
    return b.bedKey;
  }
  return minOfDay(t) < 300 ? addDays(keyOf(t), -1) : keyOf(t);
}

function daySummary(st, idx, key, t = now()) {
  const dayStart = parseKey(key), dayEnd = parseKey(addDays(key, 1));
  const weeks = Math.max(0, ageWeeksOn(st, key));
  const norm = normFor(weeks);
  let night = null;
  idx.blocks.forEach(b => { if (b.wakeKey === key && b.bedKey < key) night = b; });
  const bed = idx.blocks.find(b => b.bedKey === key) || null;
  const naps = idx.segs.filter(s => s.type === 'nap' && s.start >= dayStart && s.start < dayEnd);
  const windows = [];
  const pushWin = (from, to, pos, target) => {
    const min = (to - from) / MIN;
    if (min <= 0) return;
    windows.push({ from, to, min, pos, target, suspect: min > Math.max(norm.ww[1] * 2, 300) });
  };
  let prev = night ? night.end : null;
  naps.forEach(n => {
    if (prev != null) pushWin(prev, n.start, windows.length === 0 && night ? 'first' : 'mid', n);
    prev = n.end == null ? null : n.end;
  });
  if (bed && prev != null) pushWin(prev, bed.start, 'last', bed);
  const done = naps.filter(n => n.end != null);
  const napMin = naps.reduce((s, n) => s + n.dur, 0);
  const shortNaps = done.filter(n => n.dur < 40);
  const complete = !!bed || key < keyOf(t);
  return {
    key, weeks, norm, night, bed, naps, done, windows, napMin, shortNaps, complete,
    hasData: !!(night || naps.length || bed),
    nightMin: night ? night.asleep : null,
    totalMin: night ? night.asleep + napMin : null,
    wakes: night ? night.wakes.length : null,
    awakeNightMin: night ? night.wakes.reduce((s, w) => s + w.min, 0) : 0,
  };
}

function contextOn(st, key) {
  const recent = (type, days) => st.marks.some(m => m.type === type && m.date <= key && diffDays(key, m.date) <= days);
  const toothNear = Object.values(st.teeth).some(d => Math.abs(diffDays(key, d)) <= 3);
  return {
    leap: leapOn(st, key), regression: regressionOn(st, key), spurt: spurtOn(st, key),
    teething: recent('teething', 3) || toothNear, ill: recent('ill', 3), fever: recent('fever', 2),
    vaccine: recent('vaccine', 2), fussy: recent('fussy', 1),
  };
}

function bedWindow(st, norm) {
  const t = st.profile.bedTarget;
  return t != null ? [t - 30, t + 30] : norm.bed;
}

function bandScore(v, lo, hi, softLo, softHi) {
  if (v < lo) return clamp(1 - (lo - v) / softLo, 0, 1);
  if (v > hi) return clamp(1 - (v - hi) / softHi, 0, 1);
  return 1;
}

/* Чего не хватает, чтобы честно оценить день */
function dayMissing(sum) {
  const missing = [];
  if (!sum.night) missing.push('утренний подъём');
  if (sum.complete && !sum.bed) missing.push('отбой');
  if (sum.windows.some(w => w.suspect)) missing.push('пропущенный дневной сон');
  if (!sum.complete && sum.night && !sum.windows.length) missing.push('хотя бы один дневной сон');
  return missing;
}

function scoreDay(st, sum) {
  if (!sum.hasData || dayMissing(sum).length) return null;
  const { norm, complete } = sum, parts = [];
  const add = (id, label, max, f, note) => {
    const v = clamp(f, 0, 1);
    parts.push({ id, label, max, f: v, pts: Math.round(v * max), note });
  };
  if (complete && sum.totalMin != null) {
    add('total', 'Сон за сутки', 30, bandScore(sum.totalMin, norm.total[0] * 60, norm.total[1] * 60, 180, 120),
      fmtDur(sum.totalMin) + ' при норме ' + norm.total[0] + '–' + norm.total[1] + ' ч');
  }
  if (sum.night) {
    const dur = bandScore(sum.nightMin, norm.night[0] * 60, norm.night[1] * 60 + 60, 150, 120);
    const ws = 1 - Math.max(0, sum.wakes - norm.wakes) / 3;
    const awake = 1 - Math.max(0, sum.awakeNightMin - 60) / 120;
    add('night', 'Ночь', 20, dur * 0.5 + clamp(ws, 0, 1) * 0.35 + clamp(awake, 0, 1) * 0.15,
      fmtDur(sum.nightMin) + ', пробуждений: ' + sum.wakes);
  }
  const valid = sum.windows.filter(w => !w.suspect);
  if (valid.length) {
    const [lo, hi] = norm.ww;
    const f = avg(valid.map(w => (w.min > hi + 15 ? clamp(1 - (w.min - hi - 15) / 40, 0, 1) : w.min < lo - 10 ? clamp(1 - (lo - 10 - w.min) / 60, 0.2, 1) : 1)));
    const ok = valid.filter(w => w.min <= hi + 15 && w.min >= lo - 10).length;
    add('windows', 'Окна бодрствования', norm.schedule ? 25 : 10, f, 'в норме ' + ok + ' из ' + valid.length);
  }
  if (norm.schedule && complete && sum.naps.length) {
    const n = sum.done.length, [a, b] = norm.naps;
    const count = n >= a && n <= b ? 1 : Math.abs(n - (n < a ? a : b)) === 1 ? 0.5 : 0.1;
    const shortShare = sum.weeks >= 22 && n ? sum.shortNaps.length / n : 0;
    add('naps', 'Дневные сны', 10, count * 0.6 + (1 - shortShare) * 0.4, n + ' при норме ' + (a === b ? a : a + '–' + b));
  }
  if (norm.schedule && sum.bed) {
    const [a, b] = bedWindow(st, norm), m = bedMinutes(sum.bed.start);
    add('bed', 'Время отбоя', 15, bandScore(m, a, b, 120, 120), fmtTime(sum.bed.start) + ' при цели ' + fmtMinOfDay(a) + '–' + fmtMinOfDay(b));
  }
  if (!parts.length) return null;
  const score = Math.round(100 * parts.reduce((s, p) => s + p.f * p.max, 0) / parts.reduce((s, p) => s + p.max, 0));
  return { score, parts, partial: !complete, grade: gradeOf(score) };
}
function gradeOf(s) {
  if (s >= 85) return { label: 'Отличный сон', tone: 'ok' };
  if (s >= 70) return { label: 'Хороший сон', tone: 'ok' };
  if (s >= 55) return { label: 'Неровный сон', tone: 'warn' };
  return { label: 'Трудный сон', tone: 'bad' };
}
/* Отбой после полуночи считаем поздним вечером, а не ранним утром */
function bedMinutes(t) {
  const m = minOfDay(t);
  return m < 300 ? m + 1440 : m;
}

/* Разбор дня: почему не получилось держаться графика и что сделать */
function diagnose(st, idx, sum) {
  const items = [], { norm, weeks, key } = sum;
  const ctx = contextOn(st, key), [lo, hi] = norm.ww;
  const valid = sum.windows.filter(w => !w.suspect);
  const add = (level, title, why, tip) => items.push({ level, title, why, tip });
  const span = w => fmtTime(w.from) + '–' + fmtTime(w.to);

  if (sum.windows.some(w => w.suspect)) {
    add('info', 'Похоже, пропущен сон', 'Между отметками слишком большой промежуток. Он не попал в расчёт, чтобы не портить оценку.', 'Откройте «Добавить сон» и внесите пропущенный, если он был.');
  }
  if (norm.schedule) {
    const over = valid.filter(w => w.min > hi + 15).sort((a, b) => b.min - a.min);
    if (over.length) {
      const w = over[0], extra = Math.round(w.min - hi);
      const after = w.target.dur != null && w.pos !== 'last' && w.target.end != null && w.target.dur < 40 ? ' Следующий сон после него продлился всего ' + fmtDur(w.target.dur) + '.' : '';
      add('warn', (over.length > 1 ? over.length + ' окна затянулись, самое длинное ' : 'Окно затянулось ') + span(w),
        'Бодрствовала ' + fmtClock(w.min) + ', это на ' + fmtDur(extra) + ' дольше возрастной нормы. Перегуленный ребёнок часто выглядит бодрым, но засыпает труднее и спит короче.' + after,
        'Начинайте укладывание за 15–20 минут до конца окна. Ранние признаки усталости: взгляд в одну точку, потеря интереса, потирание глаз.');
    }
    const under = valid.filter(w => w.min < lo - 15 && w.pos !== 'first');
    if (under.length) {
      const w = under[0];
      add('info', 'Окно ' + span(w) + ' оказалось коротким', 'Всего ' + fmtClock(w.min) + ' при норме от ' + fmtClock(lo) + '. Давление сна могло не успеть накопиться.', 'Если она долго засыпает или быстро просыпается, попробуйте увеличить это окно на 10–15 минут.');
    }
    const first = valid.find(w => w.pos === 'first');
    if (first && first.min < lo - 25) {
      add('info', 'Первый сон начался очень рано', 'После подъёма прошло только ' + fmtDur(first.min) + '. Такой сон часто продолжает ночь и сбивает остальной день.', 'Сдвигайте первое укладывание на 10 минут позже каждые 2–3 дня.');
    }
    if (weeks >= 22 && sum.shortNaps.length >= 2) {
      add('warn', 'Короткие дневные сны: ' + sum.shortNaps.length, 'Сны короче 40 минут обычно означают один цикл сна. Причиной бывает перегул, яркий свет, шум или засыпание с помощью, которую после пробуждения не получается повторить.', 'Сделайте комнату темнее, включите ровный белый шум на безопасной громкости и подождите 5–10 минут перед тем, как забирать из кроватки.');
    } else if (weeks < 22 && sum.shortNaps.length >= 2) {
      add('info', 'Короткие дневные сны в этом возрасте нормальны', 'До 5–6 месяцев циклы дневного сна ещё не связаны между собой.', 'Следите за тем, чтобы следующее окно после короткого сна было на 10–15 минут короче.');
    }
    if (sum.complete && sum.naps.length) {
      const n = sum.done.length, [a, b] = norm.naps;
      if (n < a) add('warn', 'Снов меньше нормы: ' + n + ' вместо ' + (a === b ? a : a + '–' + b), 'Дефицит дневного сна обычно приводит к перегулу к вечеру и более частым ночным пробуждениям.', 'Если сон не получается в кроватке, сделайте один сон в коляске или на руках, чтобы день не рассыпался.');
      if (n > b) add('info', 'Снов больше нормы: ' + n, 'Иногда так бывает после нескольких коротких снов. Если повторяется, ребёнок мог перерасти этот режим.', 'Проверьте вкладку «Календарь»: не подходит ли время перехода на меньшее число снов.');
    }
    if (sum.complete && sum.napMin > norm.day[1] * 60 + 30) {
      add('warn', 'Дневного сна много: ' + fmtDur(sum.napMin), 'Норма в этом возрасте до ' + fmtHoursNum(norm.day[1]) + ' ч. Лишний сон днём часто забирает его у ночи.', 'Ограничьте самый длинный сон. Мягко будите, когда он превышает 2 часа.');
    } else if (sum.complete && sum.naps.length && sum.napMin < norm.day[0] * 60 - 30) {
      add('info', 'Дневного сна мало: ' + fmtDur(sum.napMin), 'Норма в этом возрасте от ' + fmtHoursNum(norm.day[0]) + ' ч.', 'Сегодня лучше отбой пораньше: ранний отбой компенсирует нехватку дневного сна.');
    }
    if (sum.bed && sum.done.length) {
      const lastNap = sum.done[sum.done.length - 1], gap = (sum.bed.start - lastNap.end) / MIN;
      if (gap < lo - 20) add('warn', 'Последний сон слишком близко к отбою', 'От пробуждения до ночного сна прошло только ' + fmtDur(gap) + '. Вечернее давление сна не успело накопиться.', 'Будите с последнего сна так, чтобы до отбоя оставалось не меньше ' + fmtClock(lo) + '.');
    }
    if (sum.bed) {
      const [a, b] = bedWindow(st, norm), m = bedMinutes(sum.bed.start);
      if (m > b + 20) {
        const lw = valid.find(w => w.pos === 'last');
        const cause = lw && lw.min > hi + 15 ? 'Последнее окно получилось слишком длинным.' : sum.done.length && minOfDay(sum.done[sum.done.length - 1].end) > 1050 ? 'Последний сон закончился поздно и потянул отбой за собой.' : 'Причина не видна по записям, отметьте её ниже.';
        add('warn', 'Поздний отбой: ' + fmtTime(sum.bed.start), 'Цель ' + fmtMinOfDay(a) + '–' + fmtMinOfDay(b) + '. ' + cause, 'Сдвигайте отбой на 15 минут раньше каждые 2–3 дня. Если в вашей семье привычен другой отбой, укажите его в настройках, и оценка будет считать от него.');
      } else if (m < a - 30) {
        add('info', 'Ранний отбой: ' + fmtTime(sum.bed.start), 'Раньше цели на ' + fmtDur(a - m) + '. После недосыпа днём это правильное решение.', 'Если отбой ранний и без причины, возможен слишком ранний подъём утром.');
      }
    }
  }
  if (sum.night && sum.wakes > norm.wakes) {
    const cause = ctx.teething ? 'Отмечены зубы, это частая причина.' : ctx.leap ? 'Сейчас идёт скачок ' + ctx.leap.n + '.' : ctx.regression ? 'Сейчас период: ' + ctx.regression.title.toLowerCase() + '.' : 'Проверьте вчерашнее последнее окно и засыпание.';
    add('warn', 'Ночных пробуждений: ' + sum.wakes, 'Для этого возраста обычно до ' + norm.wakes + '. ' + cause, weeks >= 26 ? 'Давайте шанс заснуть самой: подождите 2–3 минуты перед подходом. Необходимость ночных кормлений обсудите с педиатром.' : 'До 6 месяцев ночные кормления обычно нужны. Держите свет приглушённым и не начинайте игр.');
  }
  if (sum.night && minOfDay(sum.night.end) < 345 && norm.schedule) {
    add('warn', 'Ранний подъём: ' + fmtTime(sum.night.end), 'Частые причины: свет с улицы, поздний отбой, долгое последнее окно.', 'Плотные шторы и отбой раньше на 15–20 минут. Первые 10 минут после пробуждения не включайте свет.');
  }
  if (sum.complete && sum.totalMin != null) {
    if (sum.totalMin < norm.total[0] * 60 - 30) add('warn', 'Мало сна за сутки: ' + fmtDur(sum.totalMin), 'Минимум для возраста ' + norm.total[0] + ' ч.', 'Завтра окна короче на 10–15 минут и отбой пораньше.');
    if (sum.totalMin > norm.total[1] * 60 + 60) add('info', 'Много сна за сутки: ' + fmtDur(sum.totalMin), 'Больше верхней границы нормы. Разовый случай бывает при болезни и скачке.', 'Если несколько дней подряд её трудно разбудить, покажите педиатру.');
  }
  const ctxNotes = [];
  if (ctx.leap) ctxNotes.push('идёт скачок ' + ctx.leap.n);
  if (ctx.regression) ctxNotes.push(ctx.regression.title.toLowerCase());
  if (ctx.spurt) ctxNotes.push('возможен ростовой рывок');
  if (ctx.teething) ctxNotes.push('режутся зубы');
  if (ctx.ill) ctxNotes.push('болеет');
  if (ctx.fever) ctxNotes.push('температура');
  if (ctx.vaccine) ctxNotes.push('была прививка');
  if (ctxNotes.length && items.some(i => i.level === 'warn')) {
    add('info', 'Что влияло на этот день', 'Сейчас: ' + ctxNotes.join(', ') + '. Отклонения в такие дни ожидаемы.', 'Сохраняйте ритуал и не вводите новые правила. Окна в прогнозе уже сокращены.');
  }
  (st.reasons[key] || []).forEach(r => {
    if (REASONS[r]) add('note', REASONS[r].label, 'Вы отметили это как причину.', REASONS[r].tip);
  });
  if (norm.schedule && valid.length >= 2 && valid.every(w => w.min <= hi + 15 && w.min >= lo - 10)) {
    add('good', 'Все окна бодрствования в норме', 'Давление сна накапливалось как нужно.', '');
  }
  if (sum.night && sum.wakes <= norm.wakes && sum.nightMin >= norm.night[0] * 60) {
    add('good', 'Ночь в пределах нормы', fmtDur(sum.nightMin) + ', пробуждений: ' + sum.wakes + '.', '');
  }
  if (norm.schedule && sum.bed) {
    const [a, b] = bedWindow(st, norm), m = bedMinutes(sum.bed.start);
    if (m >= a && m <= b) add('good', 'Отбой вовремя', 'Уснула в ' + fmtTime(sum.bed.start) + '.', '');
  }
  const order = { warn: 0, note: 1, info: 2, good: 3 };
  items.sort((a, b) => order[a.level] - order[b.level]);
  const main = items.find(i => i.level === 'warn');
  const verdict = !sum.hasData ? 'Записей за этот день нет.'
    : dayMissing(sum).length ? 'Записей пока мало для оценки.'
      : !norm.schedule ? 'В этом возрасте графика ещё нет. Важнее накормить, дать поспать и следить за признаками усталости.'
      : main ? 'Главное за день: ' + main.title.charAt(0).toLowerCase() + main.title.slice(1) + '.'
        : 'День прошёл близко к возрастному графику.';
  return { verdict, items };
}

/* Прогноз укладывания */
function personalProfile(st, idx, t) {
  const out = { first: [], mid: [], last: [] }, napLens = [];
  const today = keyOf(t);
  for (let i = 0; i <= 14; i++) {
    const s = daySummary(st, idx, addDays(today, -i), t);
    s.windows.filter(w => !w.suspect).forEach(w => {
      const good = w.pos === 'last' ? w.target.segs[0].dur >= 180 : w.target.end != null && w.target.dur >= 45;
      if (good) out[w.pos].push(w.min);
    });
    s.done.filter(n => minOfDay(n.start) < 975).forEach(n => napLens.push(n.dur));
  }
  const pick = a => (a.length >= 3 ? median(a) : null);
  return { first: pick(out.first), mid: pick(out.mid), last: pick(out.last), nap: napLens.length >= 3 ? median(napLens) : null, samples: out.first.length + out.mid.length + out.last.length };
}

function wwMods(ctx, weeks) {
  const mods = [];
  if (weeks < 8) return mods;
  if (ctx.ill || ctx.fever) mods.push({ min: -15, why: 'болезнь' });
  if (ctx.leap) mods.push({ min: -10, why: 'скачок' });
  if (ctx.teething) mods.push({ min: -10, why: 'зубы' });
  if (ctx.vaccine) mods.push({ min: -10, why: 'прививка' });
  return mods;
}
const roundTo5 = v => Math.round(v / 5) * 5;

function targetWindow(pos, c, prevDur) {
  const { norm, mods, personal } = c, [lo, hi] = norm.ww;
  const f = { first: 0.2, mid: 0.55, last: 0.95 }[pos];
  let v = lo + (hi - lo) * f;
  if (personal[pos] != null) v = v * 0.4 + personal[pos] * 0.6;
  let adj = mods.reduce((s, m) => s + m.min, 0);
  if (prevDur != null && prevDur < 40 && c.weeks >= 12) adj -= 15;
  if (prevDur != null && prevDur >= norm.nap * 1.6) adj += 10;
  if (pos === 'first' && c.badNight) adj -= 15;
  return roundTo5(clamp(v + Math.max(adj, -30), lo - 10, hi + 20));
}

function buildPlan(st, t0, napsDone, c, tNow) {
  const items = [], { norm } = c, [minN, maxN] = norm.naps;
  const [bedE, bedL] = bedWindow(st, norm);
  const base = parseKey(keyOf(t0));
  let t = t0, n = napsDone, prevDur = c.lastNap, first = c.isFirst;
  for (let guard = 0; guard < 9; guard++) {
    const lastWW = targetWindow('last', c, prevDur);
    const bedAt = t + lastWW * MIN, bedM = (bedAt - base) / MIN;
    const pos = first ? 'first' : 'mid';
    const ww = targetWindow(pos, c, prevDur);
    const planned = t + ww * MIN;
    const at = Math.max(planned, tNow);
    const atM = (at - base) / MIN;
    /* Сон без шанса на нормальное окно перед отбоем только сдвинет ночь */
    const tooLate = atM > bedL - norm.ww[0] - 30;
    if ((bedM >= bedE && n >= minN) || n >= maxN || bedM >= bedL || tooLate) {
      let bed = bedAt;
      if (n >= maxN && bedM < bedE) bed = Math.max(bedAt, Math.min(base + (bedE - 45) * MIN, t + (norm.ww[1] + 15) * MIN));
      if (bedM > bedL) bed = Math.max(t + norm.ww[0] * MIN, base + bedL * MIN);
      items.push({ type: 'bed', at: Math.max(bed, tNow), planned: bed, ww: (bed - t) / MIN });
      break;
    }
    let dur = c.typicalNap;
    if (atM >= 975) dur = Math.min(dur, 40);
    items.push({ type: 'nap', index: n + 1, at, planned, ww, dur });
    t = at + dur * MIN;
    prevDur = dur;
    n++;
    first = false;
  }
  return items;
}

function sleepNow(st, t = now()) {
  const idx = sleepIndex(st, t);
  const last = idx.segs[idx.segs.length - 1] || null;
  const today = keyOf(t), weeks = Math.max(0, ageWeeksOn(st, today)), norm = normFor(weeks);
  const key = logicalDay(idx, t), ctx = contextOn(st, today);
  const personal = personalProfile(st, idx, t);
  const typicalNap = personal.nap ? Math.round(personal.nap * 0.5 + norm.nap * 0.5) : norm.nap;
  const base = { idx, last, weeks, norm, key, ctx, personal, typicalNap };
  if (!last) return { ...base, state: 'unknown' };
  if (last.end == null) {
    const nap = last.type === 'nap', elapsed = last.dur;
    let wakeBy = null, overlong = false;
    if (nap && norm.schedule) {
      const dayBase = parseKey(keyOf(last.start));
      const [, bedL] = bedWindow(st, norm);
      wakeBy = dayBase + (bedL - norm.ww[0]) * MIN;
      if (minOfDay(last.start) < 840) wakeBy = null;
      overlong = elapsed > Math.max(norm.nap * 2.2, 150);
    }
    return { ...base, state: 'sleeping', seg: last, elapsed, expectedEnd: nap ? last.start + typicalNap * MIN : null, wakeBy, overlong, suspicious: nap ? elapsed > 300 : elapsed > 16 * 60 };
  }
  const awake = (t - last.end) / MIN;
  if (awake > 16 * 60) return { ...base, state: 'unknown', stale: true };
  const m = minOfDay(t);
  if (last.type === 'night' && (m < 300 || m >= 1290) && (minOfDay(last.end) < 300 || minOfDay(last.end) >= 1200)) {
    return { ...base, state: 'nightwake', awake, since: last.end };
  }
  const sum = daySummary(st, idx, key, t);
  const badNight = !!sum.night && (sum.nightMin < norm.night[0] * 60 - 60 || sum.wakes > norm.wakes + 1);
  const lastNapDone = sum.done[sum.done.length - 1] || null;
  const mods = wwMods(ctx, weeks);
  const c = { norm, weeks, mods, personal, badNight, typicalNap, lastNap: last.type === 'nap' ? last.dur : null, isFirst: last.type === 'night' && !lastNapDone };
  const plan = buildPlan(st, last.end, sum.done.length, c, t);
  const next = plan[0];
  const overdue = (t - next.planned) / MIN;
  return {
    ...base, state: 'awake', since: last.end, awake, sum, plan, next, mods, badNight,
    from: next.at - 10 * MIN, to: next.at + 15 * MIN,
    overdue: overdue > 15 ? overdue : 0,
    minsLeft: (next.planned - t) / MIN,
  };
}

/* Неделя: понедельник – воскресенье. Оцениваем, когда отмечено хотя бы три полных дня */
const WEEK_MIN_DAYS = 3;
function weekReport(st, idx, monday, t = now()) {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const key = addDays(monday, i);
    const sum = daySummary(st, idx, key, t);
    days.push({ key, sum, score: scoreDay(st, sum) });
  }
  const scored = days.filter(d => d.score && d.sum.complete);
  if (scored.length < WEEK_MIN_DAYS) return { days, scored, empty: true };
  const score = Math.round(avg(scored.map(d => d.score.score)));
  const of = f => { const v = days.map(f).filter(x => x != null); return v.length ? v : null; };
  const totals = of(d => d.sum.complete ? d.sum.totalMin : null);
  const nights = of(d => d.sum.nightMin);
  const napCounts = of(d => (d.sum.complete && d.sum.done.length ? d.sum.done.length : null));
  const wakes = of(d => d.sum.wakes);
  const beds = of(d => (d.sum.bed ? bedMinutes(d.sum.bed.start) : null));
  const rises = of(d => (d.sum.night ? minOfDay(d.sum.night.end) : null));
  const allWins = days.flatMap(d => d.sum.windows.filter(w => !w.suspect).map(w => ({ w, norm: d.sum.norm })));
  const okWins = allWins.filter(({ w, norm }) => w.min <= norm.ww[1] + 15 && w.min >= norm.ww[0] - 10).length;
  const stats = {
    total: totals && avg(totals), night: nights && avg(nights), naps: napCounts && avg(napCounts), wakes: wakes && avg(wakes),
    bed: beds && avg(beds), bedSpread: beds && beds.length >= 3 ? Math.max(...beds) - Math.min(...beds) : null,
    rise: rises && avg(rises), riseSpread: rises && rises.length >= 3 ? Math.max(...rises) - Math.min(...rises) : null,
    windowsPct: allWins.length ? Math.round(100 * okWins / allWins.length) : null,
  };
  const norm = days[3].sum.norm, tips = [];
  const best = [...scored].sort((a, b) => b.score.score - a.score.score)[0];
  const worst = [...scored].sort((a, b) => a.score.score - b.score.score)[0];
  if (stats.bedSpread != null && stats.bedSpread > 60) {
    tips.push({ level: 'warn', title: 'Отбой гуляет на ' + fmtDur(stats.bedSpread), why: 'Разница между самым ранним и самым поздним отбоем больше часа. Внутренним часам сложно настроиться.', tip: 'Выберите одно окно отбоя шириной 30 минут и держитесь его всю следующую неделю.', weight: 3 });
  }
  if (stats.riseSpread != null && stats.riseSpread > 60) {
    tips.push({ level: 'warn', title: 'Утренний подъём плавает на ' + fmtDur(stats.riseSpread), why: 'Режим всего дня строится от утра.', tip: 'Начинайте день в одно и то же время с разбросом не больше 30 минут: свет, завтрак, голоса.', weight: 2 });
  }
  if (stats.windowsPct != null && stats.windowsPct < 70) {
    const over = allWins.filter(({ w, norm: n }) => w.min > n.ww[1] + 15).length;
    const under = allWins.filter(({ w, norm: n }) => w.min < n.ww[0] - 10).length;
    tips.push({ level: 'warn', title: 'В норму попало ' + stats.windowsPct + '% окон', why: over >= under ? 'Чаще всего окна затягивались, это копит усталость к вечеру.' : 'Чаще всего окна были слишком короткими, сны могли получаться поверхностными.', tip: over >= under ? 'Укладывайте по прогнозу из вкладки «Сейчас», начинайте ритуал за 15–20 минут.' : 'Увеличьте окна на 10–15 минут и наблюдайте за длиной снов.', weight: 3 });
  }
  if (stats.total != null && stats.total < norm.total[0] * 60) {
    tips.push({ level: 'warn', title: 'В среднем сна меньше нормы', why: fmtDur(stats.total) + ' в сутки при минимуме ' + norm.total[0] + ' ч.', tip: 'Самый простой способ добрать сон: сдвинуть отбой на 20–30 минут раньше.', weight: 4 });
  }
  if (stats.wakes != null && stats.wakes > norm.wakes + 0.5) {
    tips.push({ level: 'warn', title: 'Ночных пробуждений больше обычного', why: 'В среднем ' + fmtHoursNum(stats.wakes.toFixed(1)) + ' за ночь при типичных до ' + norm.wakes + '.', tip: 'Убедитесь, что засыпание вечером такое же, как при ночных пробуждениях. Если она засыпает самостоятельно вечером, ночью это получается чаще.', weight: 2 });
  }
  const overDays = days.filter(d => d.sum.windows.some(w => !w.suspect && w.min > d.sum.norm.ww[1] + 15));
  const nextNight = d => { const n = days.find(x => x.key === addDays(d.key, 1)); return n && n.sum.wakes != null ? n.sum.wakes : null; };
  const worse = overDays.map(nextNight).filter(x => x != null);
  const calmDays = days.filter(d => !overDays.includes(d)).map(nextNight).filter(x => x != null);
  if (worse.length >= 2 && calmDays.length >= 2 && avg(worse) - avg(calmDays) >= 0.75) {
    tips.push({ level: 'info', title: 'Перегул днём отражается на ночи', why: 'После дней с затянутым окном она просыпалась в среднем ' + fmtHoursNum(avg(worse).toFixed(1)) + ' раза за ночь, а после ровных дней ' + fmtHoursNum(avg(calmDays).toFixed(1)) + '.', tip: 'Для неё это явная связь. Держите особенно внимательно последнее окно дня.', weight: 3 });
  }
  const counts = {};
  days.forEach(d => (st.reasons[d.key] || []).forEach(r => { counts[r] = (counts[r] || 0) + 1; }));
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  if (top && top[1] >= 2 && REASONS[top[0]]) {
    tips.push({ level: 'note', title: 'Чаще всего мешало: ' + REASONS[top[0]].label.toLowerCase(), why: top[1] + ' ' + plural(top[1], 'день', 'дня', 'дней') + ' за неделю.', tip: REASONS[top[0]].tip, weight: 2 });
  }
  const trans = transitionHint(st, idx, addDays(monday, 6), t);
  if (trans) tips.push({ ...trans, weight: 3 });
  tips.sort((a, b) => b.weight - a.weight);
  const focus = tips.find(x => x.level === 'warn') || tips[0] || null;
  const verdict = score >= 85 ? 'Очень ровная неделя. Менять ничего не нужно.'
    : score >= 70 ? 'Хорошая неделя, основа режима работает.'
      : score >= 55 ? 'Неделя с заметными сбоями. Сосредоточьтесь на одном изменении.'
        : 'Тяжёлая неделя. Начните с самого простого шага и не пытайтесь исправить всё сразу.';
  return { days, scored, score, grade: gradeOf(score), stats, tips, focus, best, worst, verdict, norm };
}

function transitionHint(st, idx, endKey, t = now()) {
  const trans = transitionOn(st, endKey);
  if (!trans) return null;
  let signs = 0, seen = 0;
  for (let i = 0; i < 5; i++) {
    const s = daySummary(st, idx, addDays(endKey, -i), t);
    if (!s.bed || !s.done.length) continue;
    seen++;
    const last = s.done[s.done.length - 1];
    const lateNap = minOfDay(last.start) >= 1020, lateBed = bedMinutes(s.bed.start) > bedWindow(st, s.norm)[1];
    if (lateNap || lateBed) signs++;
  }
  if (seen >= 4 && signs >= 3) {
    return { level: 'info', title: 'Возможно, пора: ' + trans.title.toLowerCase(), why: 'В ' + signs + ' из ' + seen + ' последних дней последний сон поздний или отбой уезжал.', tip: 'Попробуйте 3 дня подряд обходиться без последнего сна и сдвинуть отбой на 30 минут раньше. Если станет хуже, вернитесь и повторите через 1–2 недели.' };
  }
  return null;
}
