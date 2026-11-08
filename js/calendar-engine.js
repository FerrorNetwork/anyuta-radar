'use strict';

/* Что и когда ждать: скачки, перестройки сна, зубы. Отметки родителей сдвигают прогноз. */

const LEAPS = [
  { n: 1, from: 4.5, to: 5.5, title: 'Чувства обостряются',
    about: 'Свет, звуки и прикосновения ощущаются резче. Пищеварение и обмен веществ работают активнее.',
    signs: ['Больше плачет и просится на руки', 'Хуже засыпает без контакта', 'Чаще просит грудь или бутылочку'],
    help: ['Приглушите свет и звук', 'Побольше контакта кожа к коже', 'Говорите тихо и медленно'],
    skills: ['Дольше смотрит на лица', 'Появляются первые осмысленные улыбки', 'Начинает реагировать на знакомый голос'] },
  { n: 2, from: 7.5, to: 9.5, title: 'Замечает повторы',
    about: 'Мир начинает складываться в узоры: повторяющиеся звуки, форма предметов, собственные руки.',
    signs: ['Снижается аппетит или, наоборот, частые кормления', 'Требует постоянного внимания', 'Беспокойный дневной сон'],
    help: ['Покажите контрастные картинки', 'Рассматривайте вместе её ручки', 'Повторяйте простые звуки в ответ'],
    skills: ['Рассматривает кисти рук', 'Следит за предметом глазами', 'Гулит короткими сериями'] },
  { n: 3, from: 11.5, to: 12.5, title: 'Плавные движения',
    about: 'Движения становятся менее резкими, голос начинает менять высоту и громкость.',
    signs: ['Требует держать на руках', 'Быстрее утомляется от игрушек', 'Короткие дневные сны'],
    help: ['Плавно покачивайте под музыку', 'Давайте время на животике', 'Отвечайте на её звуки'],
    skills: ['Плавнее поворачивает голову', 'Тянет руку к игрушке', 'Смеётся или пробует смеяться'] },
  { n: 4, from: 14.5, to: 19.5, title: 'Цепочки действий',
    about: 'Самый длинный из ранних периодов. Она связывает шаги: увидела, потянулась, схватила. Обычно совпадает с перестройкой сна.',
    signs: ['Ночью просыпается чаще', 'Отвлекается во время кормления', 'Плачет при смене обстановки'],
    help: ['Кормите в тихой комнате', 'Держите одинаковый ритуал перед сном', 'Подавайте игрушки, которые можно схватить'],
    skills: ['Хватает игрушку и тянет в рот', 'Переворачивается', 'Узнаёт знакомых людей издалека'] },
  { n: 5, from: 22.5, to: 26.5, title: 'Расстояние и связи',
    about: 'Понимает, что предметы и люди находятся далеко или близко. Замечает, что мама ушла. Осваивает причину и следствие.',
    signs: ['Тревожится, когда вы выходите из комнаты', 'Сон снова становится рваным', 'Чаще просит на ручки'],
    help: ['Предупреждайте голосом, когда уходите', 'Играйте в прятки с платком', 'Давайте бросать и поднимать игрушки'],
    skills: ['Бросает предметы и смотрит, куда упали', 'Перекладывает игрушку из руки в руку', 'Лепечет слогами'] },
  { n: 6, from: 33.5, to: 37.5, title: 'Группы и категории',
    about: 'Начинает понимать, что предметы объединяются: еда, животные, игрушки, люди.',
    signs: ['Боится незнакомых людей', 'Цепляется за родителей', 'Сложнее укладывается днём'],
    help: ['Называйте предметы и их группы', 'Сортируйте вместе крупные игрушки', 'Дайте время привыкнуть к гостям'],
    skills: ['Отличает кошку от собаки в книжке', 'Подражает жестам', 'Рассматривает мелкие детали'] },
  { n: 7, from: 41.5, to: 46.5, title: 'Порядок действий',
    about: 'Понимает, что действия идут в определённой последовательности: положить, закрыть, достать.',
    signs: ['Протестует при смене занятия', 'Настроение резко меняется', 'Ночные пробуждения с желанием играть'],
    help: ['Проговаривайте шаги вслух', 'Складывайте и доставайте вместе', 'Предупреждайте о смене занятия'],
    skills: ['Складывает предметы в коробку', 'Подаёт вещь по просьбе', 'Пробует есть ложкой'] },
  { n: 8, from: 50.5, to: 54.5, title: 'Планы и цели',
    about: 'Появляются собственные намерения. Она добивается своего разными способами и расстраивается, если не получается.',
    signs: ['Частые протесты и истерики', 'Отказывается от привычной еды', 'Сопротивляется укладыванию'],
    help: ['Давайте выбор из двух вариантов', 'Спокойно держите границы', 'Хвалите попытки, а не только результат'],
    skills: ['Пробует разные способы решить задачу', 'Настаивает на своём', 'Использует предметы по назначению'] },
  { n: 9, from: 59.5, to: 64.5, title: 'Правила и гибкость',
    about: 'Проверяет, как работают правила, и наблюдает за реакцией взрослых.',
    signs: ['Намеренно делает то, что нельзя', 'Много проверок границ', 'Перепады настроения'],
    help: ['Правила должны быть одинаковыми у всех взрослых', 'Коротко объясняйте запрет', 'Предлагайте разрешённую замену'],
    skills: ['Подражает домашним делам', 'Изображает действия понарошку', 'Понимает простые просьбы'] },
  { n: 10, from: 70.5, to: 75.5, title: 'Своё «я»',
    about: 'Осознаёт себя отдельным человеком со своими желаниями. Начинается долгий путь к самостоятельности.',
    signs: ['Часто говорит «нет» словом или жестом', 'Ревнует внимание', 'Хочет всё делать сама'],
    help: ['Оставляйте время на «сама»', 'Называйте её чувства словами', 'Давайте небольшие поручения'],
    skills: ['Узнаёт себя в зеркале', 'Показывает, что ей нравится', 'Играет рядом с другими детьми'] },
];

const REGRESSIONS = [
  { from: 15, to: 20, title: 'Перестройка сна около 4 месяцев', text: 'Сон становится циклическим, как у взрослых. Обычно это постоянное изменение: дальше помогает навык засыпания и ровный режим.' },
  { from: 34, to: 44, title: 'Сон в 8–10 месяцев', text: 'Ползание, вставание и тревога разлуки часто будят ночью. Обычно длится 2–6 недель.' },
  { from: 50, to: 56, title: 'Сон около года', text: 'Первые шаги и попытки отказаться от второго дневного сна. Не спешите с переходом на один сон.' },
  { from: 76, to: 84, title: 'Сон в 18 месяцев', text: 'Зубы, речь и настойчивое «нет» влияют на укладывание. Помогают предсказуемые границы.' },
  { from: 102, to: 110, title: 'Сон около 2 лет', text: 'Страхи, воображение и перемены в семье могут сдвинуть засыпание. Ритуал важнее обычного.' },
];

const GROWTH_SPURTS = [
  { from: 2, to: 3, title: 'Ростовой рывок: 2–3 недели' },
  { from: 5.5, to: 6.5, title: 'Ростовой рывок: 6 недель' },
  { from: 11.5, to: 13, title: 'Ростовой рывок: 3 месяца' },
  { from: 25, to: 27, title: 'Ростовой рывок: 6 месяцев' },
  { from: 38, to: 40, title: 'Ростовой рывок: 9 месяцев' },
];

const NAP_TRANSITIONS = [
  { from: 17, to: 26, title: 'Переход с 4 снов на 3' },
  { from: 26, to: 39, title: 'Переход с 3 снов на 2' },
  { from: 56, to: 78, title: 'Переход с 2 снов на 1' },
];

/* Сроки прорезывания: таблица Американской стоматологической ассоциации. */
const TEETH = [
  { id: 'lci', name: 'Нижние центральные резцы', jaw: 'low', pos: 0, from: 6, to: 10 },
  { id: 'uci', name: 'Верхние центральные резцы', jaw: 'up', pos: 0, from: 8, to: 12 },
  { id: 'uli', name: 'Верхние боковые резцы', jaw: 'up', pos: 1, from: 9, to: 13 },
  { id: 'lli', name: 'Нижние боковые резцы', jaw: 'low', pos: 1, from: 10, to: 16 },
  { id: 'um1', name: 'Верхние первые моляры', jaw: 'up', pos: 3, from: 13, to: 19 },
  { id: 'lm1', name: 'Нижние первые моляры', jaw: 'low', pos: 3, from: 14, to: 18 },
  { id: 'uca', name: 'Верхние клыки', jaw: 'up', pos: 2, from: 16, to: 22 },
  { id: 'lca', name: 'Нижние клыки', jaw: 'low', pos: 2, from: 17, to: 23 },
  { id: 'lm2', name: 'Нижние вторые моляры', jaw: 'low', pos: 4, from: 23, to: 31 },
  { id: 'um2', name: 'Верхние вторые моляры', jaw: 'up', pos: 4, from: 25, to: 33 },
];

const MARK_TYPES = {
  leap_start: { label: 'Начался скачок', color: 'moon' },
  leap_end: { label: 'Скачок закончился', color: 'moon' },
  fussy: { label: 'Капризный день', color: 'sun' },
  teething: { label: 'Режутся зубы', color: 'sun' },
  fever: { label: 'Температура', color: 'bad' },
  ill: { label: 'Болеет', color: 'bad' },
  vaccine: { label: 'Прививка', color: 'ok' },
  skill: { label: 'Новый навык', color: 'ok' },
  note: { label: 'Заметка', color: 'mute' },
};

function weekWindow(base, a, b) {
  return [addDays(base, Math.round(a * 7)), addDays(base, Math.round(b * 7))];
}

function leapSchedule(st) {
  const base = leapBaseKey(st), today = todayKey();
  const startMarks = new Map(), endMarks = new Map();
  st.marks.forEach(m => {
    if (m.type === 'leap_start' && m.leap) startMarks.set(m.leap, m);
    if (m.type === 'leap_end' && m.leap) endMarks.set(m.leap, m);
  });
  const diffs = [];
  let lastMarked = 0;
  LEAPS.forEach(l => {
    const m = startMarks.get(l.n);
    if (m) {
      diffs.push(diffDays(m.date, weekWindow(base, l.from, l.to)[0]));
      lastMarked = l.n;
    }
  });
  const recent = diffs.slice(-3);
  const shift = recent.length ? clamp(Math.round(avg(recent) * 0.7), -14, 14) : 0;
  return LEAPS.map(l => {
    const [ps, pe] = weekWindow(base, l.from, l.to);
    const sm = startMarks.get(l.n), em = endMarks.get(l.n);
    const sh = !sm && l.n > lastMarked ? shift : 0;
    const start = sm ? sm.date : addDays(ps, sh);
    let end = em ? em.date : addDays(start, diffDays(pe, ps));
    if (end < start) end = start;
    const status = end < today || (em && em.date <= today) ? 'done' : start > today ? 'next' : 'now';
    return { ...l, start, end, predStart: ps, predEnd: pe, shift: sh, marked: !!sm, closed: !!em, status };
  });
}
function leapOn(st, key) {
  return leapSchedule(st).find(l => l.start <= key && key <= l.end && !(l.closed && l.end < key)) || null;
}
function nearestLeap(st, key) {
  let best = null, bestDist = 22;
  leapSchedule(st).forEach(l => {
    const dist = key < l.start ? diffDays(l.start, key) : key > l.end ? diffDays(key, l.end) : 0;
    if (dist < bestDist) { best = l; bestDist = dist; }
  });
  return best;
}
function windowOn(list, base, key) {
  return list.find(w => {
    const [a, b] = weekWindow(base, w.from, w.to);
    return a <= key && key <= b;
  }) || null;
}
const regressionOn = (st, key) => windowOn(REGRESSIONS, ageBaseKey(st), key);
const spurtOn = (st, key) => windowOn(GROWTH_SPURTS, ageBaseKey(st), key);
const transitionOn = (st, key) => windowOn(NAP_TRANSITIONS, ageBaseKey(st), key);

/* Зубы: на сколько месяцев раньше или позже таблицы идёт именно она */
function toothOffset(st) {
  const base = ageBaseKey(st), diffs = [];
  TEETH.forEach(t => {
    ['l', 'r'].forEach(side => {
      const d = st.teeth[t.id + '-' + side];
      if (d) diffs.push(diffDays(d, base) / 30.4375 - (t.from + t.to) / 2);
    });
  });
  return diffs.length ? clamp(avg(diffs) * 0.8, -4, 6) : 0;
}
function monthsToKey(base, m) {
  return addDays(base, Math.round(m * 30.4375));
}
function toothPlan(st) {
  const base = ageBaseKey(st), off = toothOffset(st), today = todayKey();
  return TEETH.map(t => {
    const left = st.teeth[t.id + '-l'] || null, right = st.teeth[t.id + '-r'] || null;
    const count = (left ? 1 : 0) + (right ? 1 : 0);
    const from = monthsToKey(base, t.from + off), to = monthsToKey(base, t.to + off);
    const expected = monthsToKey(base, (t.from + t.to) / 2 + off);
    const status = count === 2 ? 'done' : to < today ? 'late' : from <= today ? 'now' : 'next';
    return { ...t, left, right, count, months: t.from + '–' + t.to, from_label: 'Обычно в ' + t.from + '–' + t.to + ' мес · ' + fmtRange(from, to), from, to, expected, status };
  });
}
const nextTeeth = st => toothPlan(st).filter(t => t.count < 2).sort((a, b) => (a.expected < b.expected ? -1 : 1));

/* Лента «Скоро» */
function upcomingEvents(st) {
  const today = todayKey(), base = ageBaseKey(st), out = [];
  leapSchedule(st).forEach(l => {
    if (l.status === 'done') return;
    out.push({ id: 'leap' + l.n, kind: 'leap', title: 'Скачок ' + l.n + ': ' + l.title, text: l.about, start: l.start, end: l.end, leap: l, shift: l.shift });
  });
  REGRESSIONS.forEach(r => {
    const [a, b] = weekWindow(base, r.from, r.to);
    if (b >= today) out.push({ id: 'reg' + r.from, kind: 'sleep', title: r.title, text: r.text, start: a, end: b });
  });
  GROWTH_SPURTS.forEach(r => {
    const [a, b] = weekWindow(base, r.from, r.to);
    if (b >= today) out.push({ id: 'sp' + r.from, kind: 'growth', title: r.title, text: 'Два-три дня повышенного аппетита и более частых кормлений. Сроки индивидуальны.', start: a, end: b });
  });
  NAP_TRANSITIONS.forEach(r => {
    const [a, b] = weekWindow(base, r.from, r.to);
    if (b >= today) out.push({ id: 'nt' + r.from, kind: 'sleep', title: r.title, text: 'Переходите, когда один из снов стабильно не получается 1–2 недели, а отбой уезжает слишком поздно.', start: a, end: b });
  });
  const teeth = nextTeeth(st);
  if (teeth.length) {
    const t = teeth[0], from = t.from < today ? today : t.from;
    out.push({
      id: 'tooth', kind: 'tooth', title: t.name, start: from, end: t.to < from ? from : t.to,
      text: t.status === 'late' ? 'Срок по таблице прошёл. Разброс большой, но стоит показать педиатру или стоматологу.' : 'Ожидаем примерно ' + fmtDay(t.expected) + (toothOffset(st) ? ' с учётом уже вышедших зубов.' : '.'),
    });
  }
  if (!st.foods.length) {
    const [a, b] = weekWindow(base, 17, 26);
    if (b >= today) out.push({ id: 'feed', kind: 'feed', title: 'Окно начала прикорма', text: 'Не раньше 4 месяцев и не позже 6. ВОЗ советует начинать в 6 месяцев.', start: a, end: b });
  }
  return out.sort((x, y) => {
    const ax = x.start <= today ? 0 : 1, ay = y.start <= today ? 0 : 1;
    return ax - ay || (x.start < y.start ? -1 : x.start > y.start ? 1 : 0);
  });
}
