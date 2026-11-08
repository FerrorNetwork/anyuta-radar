'use strict';

/* Вкладка «Развитие»: факт дня, как она себя чувствует, вехи возраста. */

function viewDaily(st) {
  const today = todayKey(), bounds = factBounds(st);
  if (!UI.dailyKey || UI.dailyKey > today) UI.dailyKey = today;
  if (UI.dailyKey < bounds.first) UI.dailyKey = bounds.first;
  const key = UI.dailyKey, fact = factOf(st, key), feel = feelingOf(st, key), game = gameOf(st, key), cp = checkpointFor(st, key);
  const age = calAge(st.profile.birth, key), name = esc(st.profile.name);
  const dayNo = age.total + 1;
  const canPrev = key > bounds.first, canNext = key < today;
  const done = cp.items.filter((_, i) => st.skills['c' + cp.m + '-' + i]).length;
  const rows = [['sprout', 'Тело', feel.body], ['heart', 'Настроение', feel.mood], ['star', 'Что ей нужно', feel.needs]];
  return '<div class="datenav"><button class="icon-btn" data-act="dailyNav" data-a="-1" aria-label="Предыдущий день"' + (canPrev ? '' : ' disabled') + '>' + icon('left') + '</button><b>' + dayLabel(key) + '</b><button class="icon-btn" data-act="dailyNav" data-a="1" aria-label="Следующий день"' + (canNext ? '' : ' disabled') + '>' + icon('right') + '</button></div>' +
    '<div class="owl-row">' + Art.owl() + '<section class="bubble">' + ttl('bulb', dayNo + '-й день жизни') + '<p class="fact-text">' + esc(fact.text) + '</p></section></div>' +
    '<section class="card">' + ttl('heart', 'Как ' + name + ' сегодня') + '<div class="stack" style="gap:11px">' + rows.map(([ic, t, x]) => '<div class="feel">' + Art.mini(ic) + '<b>' + t + '</b><p>' + esc(x) + '</p></div>').join('') + '</div>' +
    (feel.notes.length ? '<div class="stack">' + feel.notes.map(n => '<div class="note-c ' + (n.tone === 'moon' ? '' : n.tone) + '"><b>' + esc(n.t) + '</b>' + esc(n.d) + '</div>').join('') + '</div>' : '') + '</section>' +
    '<section class="card">' + ttl('ball', 'Игра дня') + '<p class="h2">' + esc(game.title) + '</p><p class="small">' + esc(game.text) + '</p></section>' +
    '<section class="card"><div class="rowline">' + ttl('star', 'Звёздочки к ' + cp.m + ' ' + plural(cp.m, 'месяцу', 'месяцам', 'месяцам')) + '<span class="tag sun">' + done + ' из ' + cp.items.length + '</span></div>' +
    '<div>' + cp.items.map((t, i) => { const id = 'c' + cp.m + '-' + i, on = !!st.skills[id]; return '<button class="check' + (on ? ' on' : '') + '" data-act="skill" data-a="' + id + '" aria-pressed="' + on + '"><span class="box">' + Art.mini(on ? 'star' : 'starOff') + '</span><span>' + esc(t) + '</span></button>'; }).join('') + '</div>' +
    '<p class="tiny">Источник: чек-листы CDC. Их выполняют 75% и более детей этого возраста. Если какой-то вехи нет, это повод обсудить её с педиатром, а не диагноз.</p></section>' +
    '<section class="card">' + ttl('sos', 'Срочно к врачу, если') + '<ul class="bul">' + RED_FLAGS.map(r => '<li>' + r + '</li>').join('') + '</ul></section>';
}
Actions.dailyNav = el => {
  UI.dailyKey = addDays(UI.dailyKey, Number(el.dataset.a));
  render();
};
Actions.skill = el => {
  const id = el.dataset.a, on = Store.state.skills[id];
  if (!on) burst(el.querySelector('.box'));
  if (!mutate(s => { if (s.skills[id]) delete s.skills[id]; else s.skills[id] = todayKey(); })) return;
  render();
};
