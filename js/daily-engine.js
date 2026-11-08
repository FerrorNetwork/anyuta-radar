'use strict';

/* Факт дня не повторяется, пока не закончатся подходящие по возрасту.
   Первыми идут те, чьё возрастное окно скоро закроется. */
function factSequence(st) {
  const birth = ageBaseKey(st), today = todayKey();
  const begin = st.createdAt > birth ? st.createdAt : birth;
  const stamp = birth + '|' + begin + '|' + today;
  if (factSequence.memo && factSequence.memo.stamp === stamp) return factSequence.memo.seq;
  const lastUsed = new Array(FACTS.length).fill(-1), seq = [];
  const days = Math.max(0, diffDays(today, begin));
  for (let i = 0; i <= days; i++) {
    const key = addDays(begin, i), wk = Math.max(0, diffDays(key, birth) / 7);
    let best = -1, bestScore = Infinity;
    FACTS.forEach((f, idx) => {
      if (wk < f[0] || wk >= f[1]) return;
      const score = lastUsed[idx] < 0 ? f[1] * 1000 + (idx * 37) % 97 : 1e9 + lastUsed[idx];
      if (score < bestScore) { best = idx; bestScore = score; }
    });
    if (best < 0) {
      FACTS.forEach((f, idx) => {
        const score = lastUsed[idx];
        if (score < bestScore) { best = idx; bestScore = score; }
      });
    }
    seq.push({ key, id: best, text: FACTS[best][2] });
    lastUsed[best] = i;
  }
  factSequence.memo = { stamp, seq, begin };
  return seq;
}
function factOf(st, key) {
  const seq = factSequence(st);
  return seq.find(x => x.key === key) || seq[seq.length - 1];
}
function factBounds(st) {
  const seq = factSequence(st);
  return { first: seq[0].key, last: seq[seq.length - 1].key };
}

function gameOf(st, key) {
  const wk = Math.max(0, ageWeeksOn(st, key));
  const list = GAMES.filter(g => wk >= g[0] && wk < g[1]);
  const pool = list.length ? list : GAMES.slice(-6);
  const dayNo = diffDays(key, '2020-01-01');
  const g = pool[((dayNo % pool.length) + pool.length) % pool.length];
  return { title: g[2], text: g[3] };
}

/* «Как она сегодня»: возраст плюс то, что мы знаем о последних днях */
function feelingOf(st, key) {
  const wk = Math.max(0, ageWeeksOn(st, key));
  const band = FEELING_BANDS.find(b => wk < b.to) || FEELING_BANDS[FEELING_BANDS.length - 1];
  const ctx = contextOn(st, key), notes = [];
  if (ctx.leap) notes.push({ tone: 'moon', t: 'Идёт скачок ' + ctx.leap.n + ': ' + ctx.leap.title.toLowerCase(), d: 'Чаще просится на руки и хуже спит. До ' + fmtDayShort(ctx.leap.end) + ' будьте к этому готовы.' });
  if (ctx.regression) notes.push({ tone: 'moon', t: ctx.regression.title, d: ctx.regression.text });
  if (ctx.spurt) notes.push({ tone: 'sun', t: 'Возможен ростовой рывок', d: 'Пару дней аппетит выше обычного.' });
  if (ctx.teething) notes.push({ tone: 'sun', t: 'Режутся зубы', d: 'Дёсны могут быть чувствительными, слюней больше. Предложите прохладный прорезыватель.' });
  if (ctx.ill || ctx.fever) notes.push({ tone: 'bad', t: 'Отмечено недомогание', d: 'Энергии меньше, сон важнее обычного. Следите за температурой и питьём.' });
  if (ctx.vaccine) notes.push({ tone: 'ok', t: 'Недавно была прививка', d: 'В первые 1–2 дня возможны сонливость и каприз.' });
  const idx = sleepIndex(st), sum = daySummary(st, idx, key);
  if (sum.night && (sum.wakes > sum.norm.wakes || sum.nightMin < sum.norm.night[0] * 60 - 60)) {
    notes.push({ tone: 'sun', t: 'Ночь была неровной', d: 'Сегодня она может устать быстрее. Окна в прогнозе короче.' });
  }
  return { ...band, notes };
}

function checkpointFor(st, key) {
  const m = ageMonthsOn(st, key);
  return CHECKPOINTS.find(c => m < c.m + 0.5) || CHECKPOINTS[CHECKPOINTS.length - 1];
}
