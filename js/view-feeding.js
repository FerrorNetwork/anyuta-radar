'use strict';

/* Вкладка «Прикорм»: план, каталог продуктов, таблица доз, меню, безопасность. */

function viewFeeding(st) {
  const body = { plan: feedPlanView, foods: feedFoodsView, dose: feedDoseView, menu: feedMenuView, safe: feedSafeView }[UI.sub.feed](st);
  return seg('feed', [['plan', 'План'], ['foods', 'Продукты'], ['dose', 'Дозы'], ['menu', 'Меню'], ['safe', 'Важно']]) + body;
}

function rampHtml(product, months, dayNo) {
  if (product.ramp) {
    return '<div class="ramp">' + product.ramp.map((r, i) => '<div class="' + (dayNo === i + 1 ? 'on' : '') + '"><b>День ' + (i + 1) + '</b>' + r + '</div>').join('') + '</div>';
  }
  const target = product.dose ? doseTarget(product.dose, months) : null;
  if (!target) return '';
  const unit = DOSES.find(d => d.key === product.dose).unit;
  const steps = rampFor(target);
  return '<div class="ramp">' + steps.map((g, i) => '<div class="' + (dayNo === i + 1 ? 'on' : '') + '"><b>День ' + (i + 1) + (i === steps.length - 1 && steps.length > 3 ? ' и далее' : '') + '</b>' + (unit === 'г' && product.dose !== 'oil' && product.dose !== 'butter' ? fmtSpoon(g) : g + ' ' + unit) + '</div>').join('') + '</div>';
}
function feedPlanView(st) {
  const f = feedingNow(st), months = f.months;
  let html = '';
  if (f.tooEarly) {
    const open = addDays(ageBaseKey(st), 17 * 7), left = diffDays(open, f.today), six = addDays(st.profile.birth, 182);
    html += '<section class="card"><div class="hero-art">' + Art.bottle() + '<div><p class="h">Пока только молоко</p><p class="note-hand mute">Прикорм ещё рано, и это хорошо</p></div></div>' +
      '<div class="stats"><div class="stat"><b>' + left + '</b><span>' + plural(left, 'день', 'дня', 'дней') + ' до 4 месяцев, раньше прикорм не вводят</span></div><div class="stat"><b>' + fmtDayShort(six) + '</b><span>6 месяцев, срок по рекомендации ВОЗ</span></div></div>' +
      '<p class="small">До 17 недель кишечник и почки не готовы к другой пище. Если есть показания, срок определяет педиатр.</p></section>';
  } else if (!f.started) {
    html += '<section class="card"><div class="hero-art">' + Art.food('zucchini') + '<div><p class="h">' + (months < 6 ? 'Окно начала прикорма открыто' : 'Пора начинать прикорм') + '</p></div></div><p class="small">' + (months < 6 ? 'Российская программа: с 4 до 6 месяцев. ВОЗ: в 6 месяцев на фоне грудного вскармливания. Здоровым детям чаще начинают ближе к 5–6 месяцам, а при плохой прибавке веса срок и первый продукт подскажет педиатр.' : 'После 6 месяцев одного молока уже недостаточно: особенно нужны железо и цинк. Начните на этой неделе, если врач не советовал иное.') + '</p></section>' +
      '<section class="card">' + ttl('star', 'Готова ли она') + '<div>' + FEED_READY.map(r => '<button class="check' + (st.ready[r.id] ? ' on' : '') + '" data-act="ready" data-a="' + r.id + '" aria-pressed="' + !!st.ready[r.id] + '"><span class="box">' + Art.mini(st.ready[r.id] ? 'star' : 'starOff') + '</span><span><span class="li-t">' + r.t + '</span><span class="li-s" style="display:block">' + r.d + '</span></span></button>').join('') + '</div></section>';
  }
  if (f.current) {
    const p = f.current.product, dayNo = diffDays(f.today, f.current.status.first) + 1;
    html += '<section class="card">' + ttl('spoon', 'Вводим сейчас') + '<div class="rowline"><div style="display:flex;align-items:center;gap:10px;min-width:0">' + liIcon(Art.food(p.id), 'food-ic') + '<p class="h">' + p.name + '</p></div><span class="tag warn">День ' + dayNo + '</span></div>' + rampHtml(p, months, dayNo) + '<div class="btn-row"><button class="btn primary" data-act="logFood" data-a="' + p.id + '">Записать порцию</button><button class="btn ghost" data-act="productOpen" data-a="' + p.id + '">О продукте</button></div></section>';
  }
  if (!f.tooEarly && f.next) {
    const p = f.next;
    html += '<section class="card">' + ttl('star', 'Следующий продукт') + '<div style="display:flex;align-items:center;gap:10px">' + liIcon(Art.food(p.id), 'food-ic') + '<p class="h">' + p.name + '</p></div><p class="small">' + esc(p.good) + '</p>' +
      (f.waitDays ? '<p class="small mute">Подождите ещё ' + f.waitDays + ' ' + plural(f.waitDays, 'день', 'дня', 'дней') + ': наблюдаем за предыдущим продуктом.</p>' : '') +
      '<div class="btn-row"><button class="btn primary" data-act="logFood" data-a="' + p.id + '">Попробовали</button><button class="btn ghost" data-act="productOpen" data-a="' + p.id + '">Как приготовить</button></div></section>';
  }
  html += '<section class="card">' + ttl('hop', 'Маршрут по возрасту') + '<div class="list">' + FEED_STAGES.map(s => {
    const on = months >= s.from && months < s.to, done = months >= s.to;
    return '<div class="ev"><div class="ev-top"><p class="ev-t">' + s.title + '</p><span class="tag ' + (on ? 'warn' : 'mute') + '" style="flex:none">' + (s.to > 90 ? 'с ' + s.from + ' мес' : s.from + '–' + s.to + ' мес') + '</span></div>' + (done ? '' : '<p class="small">' + esc(s.text) + '</p>') + '</div>';
  }).join('') + '</div></section>';
  html += '<section class="card">' + ttl('bulb', 'Правила введения') + '<div class="tips">' + FEED_RULES.map(r => '<div class="tip">' + Art.mini('heart') + '<p class="tip-t">' + r.t + '</p><p class="tip-w">' + r.d + '</p></div>').join('') + '</div></section>';
  return html;
}
Actions.ready = el => {
  const id = el.dataset.a;
  if (!mutate(s => { s.ready[id] = !s.ready[id]; })) return;
  render();
};

function feedFoodsView(st) {
  const status = foodStatus(st), months = ageMonthsOn(st, todayKey());
  const cats = [['all', 'Все'], ...Object.entries(FOOD_CATS)];
  const list = PRODUCTS.filter(p => UI.foodCat === 'all' || p.cat === UI.foodCat);
  return '<div class="scroller">' + cats.map(([id, label]) => '<button class="pill-btn' + (UI.foodCat === id ? ' on' : '') + '" data-act="foodCat" data-a="' + id + '">' + Art.cat(id) + label + '</button>').join('') + '</div>' +
    '<section class="card"><div class="list">' + list.map(p => {
      const s = status[p.id], early = p.from > months;
      const badge = s ? (s.worst === 'strong' ? '<span class="tag bad">реакция</span>' : s.worst === 'mild' ? '<span class="tag warn">осторожно</span>' : '<span class="tag ok">пробовали</span>') : early ? '<span class="tag mute">с ' + p.from + ' мес</span>' : '<span class="tag warn">можно</span>';
      return '<button class="li" data-act="productOpen" data-a="' + p.id + '">' + liIcon(Art.food(p.id), 'food-ic') + '<span class="li-main"><span class="li-t">' + p.name + '</span><span class="li-s" style="display:block">' + FOOD_CATS[p.cat] + ', с ' + p.from + ' мес' + (p.allergen ? ', аллерген' : '') + '</span></span>' + badge + '</button>';
    }).join('') + '</div></section>';
}
Actions.foodCat = el => { UI.foodCat = el.dataset.a; render(); };

Actions.productOpen = el => {
  const id = el.dataset.a;
  showSheet(() => {
    const st = Store.state, p = PRODUCTS.find(x => x.id === id), months = ageMonthsOn(st, todayKey()), log = st.foods.filter(f => f.food === id).sort((a, b) => (a.date < b.date ? 1 : -1));
    const dose = p.dose ? doseValue(p.dose, months) : null, unit = p.dose ? DOSES.find(d => d.key === p.dose).unit : '';
    const block = (ic, t, x) => '<div class="stack">' + ttl(ic, t) + '<p class="small">' + esc(x) + '</p></div>';
    return {
      title: p.name,
      body: '<div style="display:flex;align-items:center;gap:12px">' + liIcon(Art.food(id), 'food-ic') + '<div class="chips"><span class="tag warn">С ' + p.from + ' мес</span>' + (p.allergen ? '<span class="tag bad">Аллерген</span>' : '') + (dose && dose !== '–' ? '<span class="tag sun">В её возрасте: ' + dose + ' ' + unit + '</span>' : '') + '</div></div>' +
        (p.from > months ? '<p class="small">В её возрасте этот продукт пока рано. Подходящий срок: ' + p.from + ' мес.</p>' : '') +
        block('heart', 'Чем полезно', p.good) + block('spoon', 'Как приготовить', p.how) +
        '<div class="stack">' + ttl('plate', 'Блюда') + '<ul class="bul">' + p.dishes.map(d => '<li>' + esc(d) + '</li>').join('') + '</ul></div>' +
        (p.ramp || (p.dose && doseTarget(p.dose, months)) ? '<div class="stack">' + ttl('hop', 'Примерная лесенка порций') + rampHtml(p, months, 0) + '<p class="tiny">Если появится реакция, не увеличивайте порцию.</p></div>' : '') +
        '<div class="level ok"><p class="h2">Что нормально</p><p class="small">' + esc(p.normal) + '</p></div>' +
        '<div class="level warn"><p class="h2">На что смотреть</p><p class="small">' + esc(p.watch) + '</p></div>' +
        (log.length ? '<div class="stack">' + ttl('list', 'Дневник') + '<div class="list">' + log.map(f => '<div class="li"><span class="li-main"><span class="li-t">' + fmtDayShort(f.date) + (f.amount ? ' · ' + f.amount + ' ' + (unit || 'г') : '') + '</span><span class="li-s" style="display:block">' + { ok: 'Без реакции', mild: 'Лёгкая реакция', strong: 'Сильная реакция' }[f.reaction] + (f.note ? ' · ' + esc(f.note) : '') + '</span></span><button class="pill-btn" data-act="removeFood" data-a="' + f.id + '">Убрать</button></div>').join('') + '</div></div>' : '') +
        '<button class="btn primary wide" data-act="logFood" data-a="' + id + '">Записать порцию</button>',
    };
  });
};
Actions.logFood = el => {
  if (Store.demo) return needSetup();
  const id = el.dataset.a, p = PRODUCTS.find(x => x.id === id);
  showSheet(() => ({
    title: p.name + ': порция',
    body: '<form class="form" data-form="food"><input type="hidden" name="food" value="' + id + '">' +
      '<label class="field"><span>Дата</span><input type="date" name="date" id="food-date" value="' + todayKey() + '" max="' + todayKey() + '" required></label>' +
      '<label class="field"><span>Сколько съела, г или мл</span><input type="number" name="amount" id="food-amount" inputmode="decimal" min="0" max="400" step="any"></label>' +
      '<label class="field"><span>Как перенесла</span><select name="reaction" id="food-reaction"><option value="ok">Без реакции</option><option value="mild">Лёгкая: пятна у рта, газы, запор</option><option value="strong">Сильная: сыпь, рвота, отёк</option></select></label>' +
      '<label class="field"><span>Заметка</span><input type="text" name="note" id="food-note" maxlength="120"></label>' +
      '<button class="btn primary wide" type="submit">Сохранить</button></form>',
  }));
};
Forms.food = (f, d) => {
  Store.update(s => { s.foods.push({ id: uid(), food: d.food, date: d.date, amount: d.amount ? Number(d.amount) : null, reaction: d.reaction, note: d.note.trim() }); });
  closeSheet();
  haptic();
  render();
  toast(d.reaction === 'strong' ? 'Записано. Уберите продукт и покажите врачу' : 'Записано');
};
Actions.removeFood = el => {
  const prev = JSON.stringify(Store.state.foods);
  if (!mutate(s => { s.foods = s.foods.filter(f => f.id !== el.dataset.a); })) return;
  refresh();
  toast('Запись убрана', () => { Store.update(s => { s.foods = JSON.parse(prev); }); refresh(); });
};

function feedDoseView(st) {
  const months = ageMonthsOn(st, todayKey()), col = doseColIdx(months), show12 = months >= 12, tooEarly = ageWeeksOn(st, todayKey()) < 17;
  const current = show12 || tooEarly ? [] : DOSES.filter(d => d.v[col] !== '–');
  return (current.length ? '<section class="card">' + ttl('spoon', 'В её возрасте, ' + DOSE_COLS[col] + ' мес') + '<div class="list">' + current.map(d => '<div class="li"><span class="li-main"><span class="li-t">' + d.name + '</span>' + (d.note ? '<span class="li-s" style="display:block">' + d.note + '</span>' : '') + '</span><span class="num" style="font-weight:900;white-space:nowrap">' + d.v[col] + ' ' + d.unit + '</span></div>').join('') + '</div></section>' : '') +
    '<section class="card">' + ttl('list', 'Объёмы по возрасту, месяцы') + '<div class="table-wrap"><table><thead><tr><th>Продукт</th>' +
    DOSE_COLS.map((c, i) => '<th class="' + (i === col && !show12 && !tooEarly ? 'col-on' : '') + '">' + c + '</th>').join('') + '</tr></thead><tbody>' +
    DOSES.map(d => '<tr><td class="name">' + d.name + ', ' + d.unit + (d.note ? '<br><span class="tiny">' + d.note + '</span>' : '') + '</td>' + d.v.map((v, i) => '<td class="' + (i === col && !show12 && !tooEarly ? 'col-on' : '') + '">' + v + '</td>').join('') + '</tr>').join('') +
    '</tbody></table></div><p class="tiny">Объёмы: Программа оптимизации вскармливания детей первого года жизни в РФ, 2019. Сок в таблицу не включён: ВОЗ и NHS советуют не давать его до года. Для мяса первое число относится к пюре, второе к отварному мясу.</p>' +
    (show12 ? '<p class="small">После года порции растут постепенно и зависят от аппетита. Смотрите вкладку «Меню».</p>' : '') + '</section>' +
    '<section class="card">' + ttl('hop', 'Примерная лесенка нового продукта') + '<div class="ramp"><div><b>День 1</b>½ ч. л.</div><div><b>День 2</b>1 ч. л.</div><div><b>День 3</b>2 ч. л.</div><div><b>День 4</b>4 ч. л.</div><div><b>День 5</b>≈ 40 г</div><div><b>День 6</b>≈ 80 г</div><div><b>День 7</b>полная порция</div></div><p class="tiny">Увеличивать можно медленнее. Новый продукт не вводят, пока предыдущий не доведён до приемлемой порции и нет реакции.</p></section>';
}

function feedMenuView(st) {
  const months = ageMonthsOn(st, todayKey());
  const m = MENUS.find(x => months >= x.from && months < x.to);
  const dishes = DISHES.filter(d => d.age <= Math.max(months, 5.5));
  return (m ? '<section class="card">' + ttl('plate', 'Примерный день: ' + m.t) + '<div class="tl">' + m.rows.map(r => '<div class="tl-row" style="grid-template-columns:96px 1fr"><b>' + r[0] + '</b><span>' + r[1] + '</span></div>').join('') + '</div><p class="tiny">Новые продукты вводите по одному и только после того, как ребёнок уже знаком с основой меню.</p></section>' : '<section class="card"><div class="hero-art">' + Art.bottle() + '<p class="small">Примерное меню появится, когда наступит время прикорма. Пока вся еда это молоко.</p></div></section>') +
    '<section class="card">' + ttl('spoon', 'Блюда на будущее') + '<div class="list">' + dishes.map(d => '<details class="ev"><summary class="ev-t" style="cursor:pointer;min-height:28px">' + d.t + ' <span class="tag mute" style="margin-left:4px">с ' + d.age + ' мес</span></summary><p class="small"><b>Состав:</b> ' + esc(d.i) + '</p><p class="small">' + esc(d.s) + '</p></details>').join('') + '</div></section>';
}

function feedSafeView() {
  return '<section class="stack" style="gap:10px">' + REACTION_LEVELS.map(l => '<div class="level ' + l.tone + '"><p class="h2">' + l.t + '</p><ul class="bul small">' + l.items.map(i => '<li>' + i + '</li>').join('') + '</ul></div>').join('') + '</section>' +
    '<section class="card">' + ttl('sos', 'Если подавилась') + '<p class="small">' + esc(FIRST_AID) + '</p></section>' +
    '<section class="card">' + ttl('warn', 'Нельзя') + '<div class="tips">' + NEVER_FOODS.map(n => '<div class="tip">' + Art.mini('warn') + '<p class="tip-t">' + n.t + '</p><p class="tip-w">' + n.d + '</p></div>').join('') + '</div></section>' +
    '<section class="card">' + ttl('warn', 'Риск подавиться') + '<ul class="bul">' + CHOKE_FOODS.map(c => '<li>' + c + '</li>').join('') + '</ul></section>' +
    '<section class="card">' + ttl('shield', 'Аллергены') + '<p class="small">Яйцо, арахис, рыбу, глютен и молочный белок вводят по одному и в малых количествах. Откладывать их без показаний не стоит: задержка введения арахиса и яиц может повышать риск аллергии. Если у ребёнка экзема или в семье есть пищевая аллергия, сначала поговорите с педиатром.</p><p class="tiny">В российской программе срок для рыбы и желтка позже, чем в рекомендациях NHS. Приложение показывает российский срок и отмечает разницу. Выбор обсудите с врачом.</p></section>';
}
