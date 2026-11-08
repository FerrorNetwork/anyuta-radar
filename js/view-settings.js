'use strict';

/* Настройки, резервная копия и источники. */

Actions.settings = () => {
  showSheet(() => {
    const st = Store.state, p = st.profile;
    if (Store.demo) {
      return { title: 'Настройки', body: '<p class="small">Сейчас показан пример. Настройки появятся, когда вы укажете дату рождения.</p><button class="btn primary wide" data-act="closeAndSetup">Указать дату</button>' + restoreHtml('Уже вели записи в другом месте? Вставьте резервную копию сюда.') + sourcesHtml() };
    }
    return {
      title: 'Настройки',
      body: '<form class="form" data-form="settings">' +
        '<label class="field"><span>Имя</span><input type="text" name="name" id="set-name" value="' + esc(p.name) + '" maxlength="24" required></label>' +
        '<label class="field"><span>Дата рождения</span><input type="date" name="birth" id="set-birth" value="' + p.birth + '" max="' + todayKey() + '" required></label>' +
        '<label class="field"><span>Предполагаемая дата родов</span><input type="date" name="due" id="set-due" value="' + (p.due || '') + '"></label>' +
        '<label class="field"><span>Привычный отбой, если он отличается от нормы</span><input type="time" name="bed" id="set-bed" value="' + (p.bedTarget != null ? fmtMinOfDay(p.bedTarget) : '') + '"></label>' +
        '<p class="err" id="set-err" hidden></p><button class="btn primary wide" type="submit">Сохранить</button></form>' +
        '<div class="stack"><p class="eyebrow">Резервная копия</p><p class="small mute">Все данные хранятся только в этом браузере. Если очистить его данные, записи пропадут. Копируйте резервную копию время от времени и храните её, например, в заметках.</p>' +
        '<button class="btn ghost wide" data-act="copyBackup">Скопировать копию данных</button>' + restoreHtml('') + '</div>' +
        '<button class="btn danger wide" data-act="wipe">Стереть все данные</button>' + sourcesHtml(),
    };
  });
};
function restoreHtml(lead) {
  return (lead ? '<p class="small">' + lead + '</p>' : '') +
    '<textarea id="backup-text" placeholder="Вставьте сюда резервную копию, чтобы восстановить данные" aria-label="Резервная копия"></textarea><p class="err" id="backup-err" hidden></p>' +
    '<button class="btn ghost wide" data-act="restoreBackup">Восстановить из копии</button>';
}
function sourcesHtml() {
  const links = [
    ['AASM: сон у детей', 'https://aasm.org/resources/pdf/pediatricsleepdurationmethods.pdf'],
    ['AAP: безопасный сон', 'https://www.healthychildren.org/English/ages-stages/baby/sleep/Pages/A-Parents-Guide-to-Safe-Sleep.aspx'],
    ['ВОЗ: прикорм 6–23 месяца, 2023', 'https://www.who.int/publications/i/item/9789240081864'],
    ['ESPGHAN: прикорм, 2017', 'https://www.espghan.org/dam/jcr%3A3d960daa-e2f3-499f-9df9-2da682976cec/2017%20Complementary_Feeding__A_Position_Paper_by_the.21.pdf'],
    ['Программа вскармливания РФ, 2019', 'https://old-minzdrav.midural.ru/uploads/document/4908/optimizatsii-vskarmlivaniya-detej-pervogo-goda-zhizni.pdf'],
    ['NHS: аллергены и безопасность прикорма', 'https://www.nhs.uk/best-start-in-life/baby/weaning/safe-weaning/food-allergies/'],
    ['ADA: прорезывание зубов', 'https://www.mouthhealthy.org/all-topics-a-z/eruption-charts'],
    ['AAP: прорезывание и температура', 'https://www.healthychildren.org/English/ages-stages/baby/teething-tooth-care/Pages/Teething-Pain.aspx'],
    ['CDC: вехи развития', 'https://www.cdc.gov/act-early/milestones/index.html'],
  ];
  return '<div class="stack"><p class="eyebrow">Источники</p><div class="sources">' + links.map(([t, u]) => '<a href="' + u + '" target="_blank" rel="noopener">' + t + '</a>').join('') + '</div><p class="tiny">Приложение помогает наблюдать и не заменяет педиатра. Подсказки строятся по встроенным правилам и вашим записям.</p></div>';
}
Actions.closeAndSetup = () => { closeSheet(); Actions.goSetup(); };
Forms.settings = (f, d) => {
  const err = $('#set-err'), fail = m => { err.textContent = m; err.hidden = false; };
  if (!d.birth || d.birth > todayKey()) return fail('Проверьте дату рождения.');
  if (d.due && Math.abs(diffDays(d.due, d.birth)) > 100) return fail('Дата родов слишком далеко от даты рождения.');
  let bed = null;
  if (d.bed) {
    const [h, m] = d.bed.split(':').map(Number);
    bed = h * 60 + m;
    if (bed < 300) bed += 1440;
  }
  Store.update(s => {
    s.profile.name = d.name.trim().slice(0, 24) || 'Анюта';
    s.profile.birth = d.birth;
    s.profile.due = d.due || null;
    s.profile.bedTarget = bed;
  });
  closeSheet();
  render();
  toast('Сохранено');
};
Actions.copyBackup = el => {
  const text = JSON.stringify(Store.state);
  const fallback = () => {
    const area = $('#backup-text');
    area.value = text;
    area.focus();
    area.select();
    toast('Выделите текст и скопируйте');
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => toast('Копия скопирована. Сохраните её в заметках'), fallback);
  } else fallback();
};
Actions.restoreBackup = el => {
  const err = $('#backup-err'), raw = $('#backup-text').value.trim();
  const fail = m => { err.textContent = m; err.hidden = false; };
  err.hidden = true;
  if (!raw) return fail('Сначала вставьте текст копии в поле выше.');
  let obj;
  try { obj = JSON.parse(raw); } catch (e) { return fail('Текст копии повреждён. Скопируйте его заново.'); }
  if (!isValidBackup(obj)) return fail('Это не похоже на копию данных радара.');
  if (!confirmTap(el, 'Заменить все записи? Нажмите ещё раз')) return;
  Store.replace(obj);
  closeSheet();
  render();
  toast('Данные восстановлены');
};
Actions.wipe = el => {
  if (!confirmTap(el, 'Удалить всё безвозвратно? Нажмите ещё раз')) return;
  Store.wipe();
  closeSheet();
  render();
  window.scrollTo(0, 0);
  toast('Все данные стёрты');
};
