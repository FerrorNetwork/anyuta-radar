'use strict';

/* Вкладка «Развитие»: факт дня, упражнения с показом, вехи возраста. */

function viewDaily(st) {
  const body = { today: dailyTodayView, ex: exercisesView, miles: milestonesView }[UI.sub.day](st);
  return seg('day', [['today', 'Сегодня'], ['ex', 'Упражнения'], ['miles', 'Вехи']]) + body;
}
function dailyTodayView(st) {
  const today = todayKey(), bounds = factBounds(st);
  if (!UI.dailyKey || UI.dailyKey > today) UI.dailyKey = today;
  if (UI.dailyKey < bounds.first) UI.dailyKey = bounds.first;
  const key = UI.dailyKey, fact = factOf(st, key), feel = feelingOf(st, key), game = gameOf(st, key);
  const age = calAge(st.profile.birth, key), name = esc(st.profile.name);
  const dayNo = age.total + 1;
  const canPrev = key > bounds.first, canNext = key < today;
  const rows = [['sprout', 'Тело', feel.body], ['heart', 'Настроение', feel.mood], ['star', 'Что ей нужно', feel.needs]];
  const plan = exercisePlan(st, today), finished = plan.filter(x => x.finished).length;
  return '<div class="datenav"><button class="icon-btn" data-act="dailyNav" data-a="-1" aria-label="Предыдущий день"' + (canPrev ? '' : ' disabled') + '>' + icon('left') + '</button><b>' + dayLabel(key) + '</b><button class="icon-btn" data-act="dailyNav" data-a="1" aria-label="Следующий день"' + (canNext ? '' : ' disabled') + '>' + icon('right') + '</button></div>' +
    '<div class="owl-row">' + Art.owl() + '<section class="bubble">' + ttl('bulb', dayNo + '-й день жизни') + '<p class="fact-text">' + esc(fact.text) + '</p></section></div>' +
    '<button class="card ex-link" data-act="sub" data-a="day" data-b="ex"><span class="rowline">' + ttl('ball', 'Упражнения на сегодня') + '<span class="tag sun">' + finished + ' из ' + plan.length + '</span></span></button>' +
    '<section class="card">' + ttl('heart', 'Как ' + name + ' сегодня') + '<div class="stack" style="gap:11px">' + rows.map(([ic, t, x]) => '<div class="feel">' + Art.mini(ic) + '<b>' + t + '</b><p>' + esc(x) + '</p></div>').join('') + '</div>' +
    (feel.notes.length ? '<div class="stack">' + feel.notes.map(n => '<div class="note-c ' + (n.tone === 'moon' ? '' : n.tone) + '"><b>' + esc(n.t) + '</b>' + esc(n.d) + '</div>').join('') + '</div>' : '') + '</section>' +
    '<section class="card">' + ttl('ball', 'Игра дня') + '<p class="h2">' + esc(game.title) + '</p><p class="small">' + esc(game.text) + '</p></section>' +
    '<section class="card">' + ttl('sos', 'Срочно к врачу, если') + '<ul class="bul">' + RED_FLAGS.map(r => '<li>' + r + '</li>').join('') + '</ul></section>';
}
Actions.dailyNav = el => {
  UI.dailyKey = addDays(UI.dailyKey, Number(el.dataset.a));
  render();
};

/* Чек-лист упражнений */
function exStars(e) {
  let html = '';
  for (let i = 0; i < e.times; i++) html += Art.mini(i < e.done ? 'star' : 'starOff');
  return '<span class="ex-stars">' + html + '</span>';
}
function exRow(e) {
  return '<div class="ex-row"><button class="ex-open" data-act="exOpen" data-a="' + e.id + '"><span class="ex-thumb">' + Art.ex(e.anim, true) + '</span><span class="li-main"><span class="li-t">' + esc(e.title) + '</span><span class="li-s" style="display:block">' + esc(e.time) + (e.times > 1 ? ', ' + e.times + ' ' + plural(e.times, 'раз', 'раза', 'раз') + ' в день' : '') + '</span>' + exStars(e) + '</span></button>' +
    '<button class="ex-tick' + (e.finished ? ' on' : '') + '" data-act="exTick" data-a="' + e.id + '" aria-label="' + (e.finished ? 'Отменить отметку' : 'Отметить подход') + '">' + (e.finished ? '✓' : '+') + '</button></div>';
}
function exercisesView(st) {
  const today = todayKey();
  if (!UI.exKey || UI.exKey > today) UI.exKey = today;
  const key = UI.exKey, plan = exercisePlan(st, key), todo = plan.filter(e => !e.finished), done = plan.filter(e => e.finished);
  const allDone = plan.length > 0 && !todo.length, streak = exerciseStreak(st, today), name = esc(st.profile.name);
  const stars = plan.map((e, i) => Art.mini(i < done.length ? 'star' : 'starOff')).join('');
  const line = allDone ? 'Всё сделано! ' + name + ' молодец, и вы тоже.' : done.length ? 'Отлично идём, осталось ' + todo.length + '.' : 'Начните с того, что ей нравится больше всего.';
  return '<div class="datenav"><button class="icon-btn" data-act="exNav" data-a="-1" aria-label="Предыдущий день">' + icon('left') + '</button><b>' + dayLabel(key) + '</b><button class="icon-btn" data-act="exNav" data-a="1" aria-label="Следующий день"' + (key < today ? '' : ' disabled') + '>' + icon('right') + '</button></div>' +
    '<section class="card"><div class="hero-art"><div>' + Art.bunny(allDone ? 'happy' : 'awake') + '</div><div class="stack" style="gap:5px"><p class="h">Сделано ' + done.length + ' из ' + plan.length + '</p><div class="stars">' + stars + '</div><p class="note-hand mute">' + line + '</p>' + (streak > 1 ? '<span class="tag sun" style="justify-self:start">' + Art.mini('crown') + streak + ' ' + plural(streak, 'день', 'дня', 'дней') + ' подряд</span>' : '') + '</div></div></section>' +
    (todo.length ? '<section class="card">' + ttl('list', 'Надо сделать') + '<div class="list">' + todo.map(exRow).join('') + '</div></section>' : '') +
    (done.length ? '<section class="card">' + ttl('star', 'Сделали') + '<div class="list">' + done.map(exRow).join('') + '</div></section>' : '') +
    '<section class="card">' + ttl('bulb', 'Как заниматься') + '<ul class="bul"><li>Когда она бодрая и в хорошем настроении, удобно после сна или смены подгузника</li><li>На полу, на пледе: на кровати и столике опасно</li><li>Морщится, отворачивается, плачет: остановитесь и попробуйте позже</li><li>Не надо делать всё подряд. Лучше понемногу несколько раз в день</li></ul></section>' +
    '<section class="card">' + ttl('sos', 'Покажите педиатру, если') + '<ul class="bul"><li>Перестала делать то, что уже умела</li><li>Не пользуется одной стороной тела или одна ручка и ножка заметно слабее</li><li>Кажется слишком вялой или, наоборот, напряжённой</li><li>Голова постоянно наклонена в одну сторону</li><li>Дрожит всем телом</li></ul><p class="tiny">По материалам AAP, ВОЗ и CDC. Упражнения не заменяют осмотр. Если у малышки есть особенности здоровья, план стоит согласовать с врачом.</p></section>';
}
Actions.exNav = el => {
  UI.exKey = addDays(UI.exKey, Number(el.dataset.a));
  render();
};
function tickExercise(id, source) {
  if (Store.demo) return needSetup();
  const key = UI.exKey || todayKey(), logKey = key + ':' + id;
  const e = exercisePlan(Store.state, key).find(x => x.id === id);
  if (!e) return;
  const next = e.finished ? 0 : e.done + 1;
  if (next > e.done) burst(source);
  haptic();
  Store.update(s => { if (next) s.exlog[logKey] = next; else delete s.exlog[logKey]; });
  refresh();
  const after = exercisePlan(Store.state, key);
  if (next && after.every(x => x.finished)) toast('Все упражнения на сегодня сделаны!');
}
Actions.exTick = el => tickExercise(el.dataset.a, el);
Actions.exOpen = el => {
  const id = el.dataset.a;
  showSheet(() => {
    const st = Store.state, e = exercisePlan(st, UI.exKey || todayKey()).find(x => x.id === id) || { ...EXERCISES.find(x => x.id === id), done: 0, finished: false, time: '' };
    const poem = e.rhyme ? POEMS.find(p => p.id === e.rhyme) : null;
    return {
      title: e.title,
      body: '<div class="ex-show">' + Art.ex(e.anim) + '</div>' +
        '<div class="chips"><span class="tag sky">' + Art.mini('clock') + esc(e.time) + '</span>' + (e.times > 1 ? '<span class="tag sun">' + e.times + ' ' + plural(e.times, 'раз', 'раза', 'раз') + ' в день</span>' : '') + '</div>' +
        '<p class="small">' + esc(e.why) + '</p>' +
        '<div class="stack">' + ttl('list', 'Как делать') + '<ol class="steps">' + e.steps.map(s => '<li>' + esc(s) + '</li>').join('') + '</ol></div>' +
        (e.goal ? '<div class="note-c"><b>Сколько нужно</b>' + esc(e.goal) + '</div>' : '') +
        (poem ? '<div class="note-c ok"><b>Стишок под упражнение</b><p class="poem-small">' + withName(poem.text, st) + '</p></div>' : '') +
        (e.care ? '<div class="note-c sun"><b>Важно</b>' + esc(e.care) + '</div>' : '') +
        '<button class="btn primary wide" data-act="exTick" data-a="' + id + '">' + (e.finished ? 'Отменить отметку' : e.times > 1 ? 'Сделали подход, ' + e.done + ' из ' + e.times : 'Сделали') + '</button>',
    };
  });
};

function milestonesView(st) {
  const key = todayKey(), current = checkpointFor(st, key);
  const cp = CHECKPOINTS.find(c => c.m === UI.cpM) || current;
  const done = cp.items.filter((_, i) => st.skills['c' + cp.m + '-' + i]).length;
  return '<div class="scroller">' + CHECKPOINTS.map(c => '<button class="pill-btn' + (c.m === cp.m ? ' on' : '') + '" data-act="cpPick" data-a="' + c.m + '">' + c.m + ' мес</button>').join('') + '</div>' +
    '<section class="card"><div class="rowline">' + ttl('star', 'Звёздочки к ' + cp.m + ' ' + plural(cp.m, 'месяцу', 'месяцам', 'месяцам')) + '<span class="tag sun">' + done + ' из ' + cp.items.length + '</span></div>' +
    '<div>' + cp.items.map((t, i) => { const id = 'c' + cp.m + '-' + i, on = !!st.skills[id]; return '<button class="check' + (on ? ' on' : '') + '" data-act="skill" data-a="' + id + '" aria-pressed="' + on + '"><span class="box">' + Art.mini(on ? 'star' : 'starOff') + '</span><span>' + esc(t) + '</span></button>'; }).join('') + '</div>' +
    '<p class="tiny">Источник: чек-листы CDC. Их выполняют 75% и более детей этого возраста. Если какой-то вехи нет, это повод обсудить её с педиатром, а не диагноз.</p></section>';
}
Actions.cpPick = el => { UI.cpM = Number(el.dataset.a); render(); };
Actions.skill = el => {
  const id = el.dataset.a, on = Store.state.skills[id];
  if (!on) burst(el.querySelector('.box'));
  if (!mutate(s => { if (s.skills[id]) delete s.skills[id]; else s.skills[id] = todayKey(); })) return;
  render();
};
