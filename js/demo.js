'use strict';

/* Пример для первого запуска. Показывает приложение в работе и никогда не сохраняется. */
function makeDemoState() {
  const st = blankState(), today = todayKey(), t = now();
  st.profile = { name: 'Анюта', birth: addDays(today, -172), due: null, bedTarget: null };
  st.createdAt = addDays(today, -7);
  let seed = 11;
  const rnd = (a, b) => {
    seed = (seed * 137 + 29) % 1009;
    return a + (seed % (b - a + 1));
  };
  const add = (start, end) => {
    if (start > t) return;
    st.sleeps.push({ id: 'demo' + st.sleeps.length, start, end: end > t ? null : end });
  };
  for (let i = -8; i <= 0; i++) {
    const key = addDays(today, i), next = addDays(key, 1);
    const late = i === -3;
    let cursor = atMinutes(key, 7 * 60 + rnd(-15, 20));
    [[120 + rnd(0, 15), 70 + rnd(0, 20)], [late ? 190 : 140 + rnd(0, 20), late ? 32 : 65 + rnd(0, 20)], [150 + rnd(0, 15), 35 + rnd(0, 10)]].forEach(([ww, dur]) => {
      const start = cursor + ww * MIN, end = start + dur * MIN;
      add(start, end);
      cursor = end;
    });
    const bed = cursor + (late ? 200 : 140 + rnd(0, 20)) * MIN;
    const wake1 = atMinutes(next, 60 + rnd(0, 60));
    add(bed, wake1);
    const back = wake1 + (15 + rnd(0, 15)) * MIN;
    const morning = atMinutes(next, 7 * 60 + rnd(-15, 20));
    if (back < morning && i < 0) add(back, morning);
  }
  st.marks.push({ id: 'd1', date: addDays(today, -3), type: 'teething', note: '' });
  st.foods.push(
    { id: 'f1', food: 'zucchini', date: addDays(today, -6), amount: 10, reaction: 'ok', note: '' },
    { id: 'f2', food: 'zucchini', date: addDays(today, -4), amount: 40, reaction: 'ok', note: '' },
    { id: 'f3', food: 'cauliflower', date: addDays(today, -2), amount: 5, reaction: 'ok', note: '' },
    { id: 'f4', food: 'cauliflower', date: addDays(today, -1), amount: 10, reaction: 'ok', note: '' },
  );
  st.reasons[addDays(today, -3)] = ['walk'];
  return st;
}
