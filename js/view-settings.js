'use strict';

/* Настройки, синхронизация семьи, резервная копия и источники. */

function syncSection() {
  if (!Sync.available()) return '';
  if (!Sync.active()) {
    return '<div class="sync-box">' + ttl('cloud', 'Общий дневник семьи') + '<p class="small mute">Вставьте код семьи, и записи появятся на всех телефонах.</p>' + connectForm('set') + '</div>';
  }
  const last = Sync.lastOk ? (keyOf(Sync.lastOk) === todayKey() ? 'сегодня в ' : fmtDayShort(keyOf(Sync.lastOk)) + ' в ') + fmtTime(Sync.lastOk) : 'ещё не было';
  const pending = Object.keys(Sync.dirty).length;
  const msg = Sync.message();
  return '<div class="sync-box">' + ttl('syncOk', 'Общий дневник семьи') +
    '<p class="small">Этот телефон: <b>' + esc(Sync.device) + '</b>. Последняя сверка: ' + last + '.' + (pending ? ' Ждут отправки: ' + pending + '.' : '') + '</p>' +
    (msg ? '<p class="err">' + msg + '</p>' : '') +
    '<button class="btn ghost wide" data-act="syncNow">Сверить сейчас</button>' +
    '<button class="btn ghost wide" data-act="syncOff">Отключить этот телефон</button></div>';
}
Actions.settings = () => {
  showSheet(() => {
    const st = Store.state, p = st.profile;
    if (Store.demo) {
      return { title: 'Настройки', body: syncSection() + '<p class="small">Сейчас показан пример.</p>' + restoreHtml('Уже вели записи в другом месте? Вставьте резервную копию сюда.') + sourcesHtml() };
    }
    return {
      title: 'Настройки',
      body: syncSection() + '<form class="form" data-form="settings">' +
        '<label class="field"><span>Имя</span><input type="text" name="name" id="set-name" value="' + esc(p.name) + '" maxlength="24" required></label>' +
        '<label class="field"><span>Дата рождения</span><input type="date" name="birth" id="set-birth" value="' + p.birth + '" max="' + todayKey() + '" required></label>' +
        '<label class="field"><span>Предполагаемая дата родов</span><input type="date" name="due" id="set-due" value="' + (p.due || '') + '"></label>' +
        '<label class="field"><span>Привычный отбой, если он отличается от нормы</span><input type="time" name="bed" id="set-bed" value="' + (p.bedTarget != null ? fmtMinOfDay(p.bedTarget) : '') + '"></label>' +
        '<p class="err" id="set-err" hidden></p><button class="btn primary wide" type="submit">Сохранить</button></form>' +
        '<div class="stack">' + ttl('shield', 'Резервная копия') + '<p class="small mute">' + (Sync.active() ? 'Записи хранятся на телефоне и в закрытом дневнике семьи. Копия нужна на всякий случай.' : 'Все данные хранятся только в этом браузере. Копируйте резервную копию время от времени и храните её, например, в заметках.') + '</p>' +
        '<button class="btn ghost wide" data-act="copyBackup">Скопировать копию данных</button>' + restoreHtml('') + '</div>' +
        '<button class="btn danger wide" data-act="wipe">Стереть данные на этом телефоне</button>' + sourcesHtml(),
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
  return '<div class="stack">' + ttl('book', 'Источники') + '<div class="sources">' + links.map(([t, u]) => '<a href="' + u + '" target="_blank" rel="noopener">' + t + '</a>').join('') + '</div><p class="tiny">Приложение помогает наблюдать и не заменяет педиатра. Подсказки строятся по встроенным правилам и вашим записям.</p></div>';
}
Forms.connect = async (f, d) => {
  const err = f.querySelector('[data-connect-err]'), btn = f.querySelector('button[type=submit]');
  err.hidden = true;
  btn.disabled = true;
  btn.textContent = 'Подключаю…';
  try {
    await Sync.connect(d.token, d.device);
    keepData();
    if (UI.sheetFn) closeSheet();
    render();
    window.scrollTo(0, 0);
    toast(Sync.status === 'ok' ? 'Готово, дневник подключён' : Sync.message());
  } catch (e) {
    err.textContent = SYNC_MESSAGES[e.kind] || SYNC_MESSAGES.offline;
    err.hidden = false;
    btn.disabled = false;
    btn.textContent = 'Подключить';
  }
};
Actions.syncNow = async () => {
  await Sync.run(true);
  refresh();
  toast(Sync.status === 'ok' ? 'Всё сверено' : Sync.message());
};
Actions.syncOff = el => {
  if (!confirmTap(el, 'Отключить? Нажмите ещё раз')) return;
  Sync.disconnect();
  closeSheet();
  render();
  toast('Телефон отключён. Записи семьи сохранены');
};
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
Actions.copyBackup = () => {
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
  if (!confirmTap(el, Sync.active() ? 'Стереть здесь? Записи семьи останутся' : 'Удалить всё безвозвратно? Нажмите ещё раз')) return;
  Store.wipe();
  closeSheet();
  render();
  window.scrollTo(0, 0);
  toast('Данные на этом телефоне стёрты');
};
