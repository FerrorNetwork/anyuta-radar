'use strict';

/* Вкладка «Забавы»: стишки, сказки и мелодии с плеером. */

function viewFun(st) {
  const body = { poems: funPoemsView, tales: funTalesView, music: funMusicView }[UI.sub.fun](st);
  return seg('fun', [['poems', 'Стишки'], ['tales', 'Сказки'], ['music', 'Мелодии']]) + body;
}
const withName = (text, st) => esc(text).replace(/\{name\}/g, esc(st.profile.name));

function funPoemsView(st) {
  const kinds = [['all', 'Все'], ...Object.entries(POEM_KINDS)];
  const weeks = ageWeeksOn(st, todayKey());
  const list = POEMS.filter(p => (UI.poemKind === 'all' || p.kind === UI.poemKind) && !(p.from > weeks));
  const icons = { game: 'ball', sleep: 'moon', ours: 'heart', classic: 'book' };
  return '<div class="scroller">' + kinds.map(([id, label]) => '<button class="pill-btn' + (UI.poemKind === id ? ' on' : '') + '" data-act="poemKind" data-a="' + id + '">' + label + '</button>').join('') + '</div>' +
    '<section class="card"><div class="list">' + list.map(p => '<button class="li" data-act="poemOpen" data-a="' + p.id + '">' + liIcon(Art.mini(icons[p.kind])) + '<span class="li-main"><span class="li-t">' + esc(p.title) + '</span><span class="li-s" style="display:block">' + withName(p.text.split('\n')[0], st) + '</span></span>' + icon('right', 18) + '</button>').join('') + '</div></section>' +
    '<p class="tiny">Потешки народные, стихи классиков. Раздел «Про нас» написан специально для приложения. Ритм и ваш голос сейчас важнее смысла.</p>';
}
Actions.poemKind = el => { UI.poemKind = el.dataset.a; render(); };
Actions.poemOpen = el => {
  const p = POEMS.find(x => x.id === el.dataset.a), st = Store.state;
  showSheet(() => ({
    title: p.title,
    body: (p.author ? '<p class="small mute">' + esc(p.author) + '</p>' : '') + '<p class="poem">' + withName(p.text, st) + '</p>' + (p.how ? '<div class="note-c"><b>Как читать</b>' + esc(p.how) + '</div>' : ''),
  }));
};

function funTalesView(st) {
  const bed = TALES.filter(t => t.sleep), folk = TALES.filter(t => !t.sleep);
  const row = t => '<button class="li" data-act="taleOpen" data-a="' + t.id + '">' + liIcon(Art.tale(t.art), 'food-ic') + '<span class="li-main"><span class="li-t">' + esc(t.title) + '</span><span class="li-s" style="display:block">' + t.min + ' мин чтения</span></span>' + icon('right', 18) + '</button>';
  return '<section class="card">' + ttl('moon', 'На ночь') + '<div class="list">' + bed.map(row).join('') + '</div></section>' +
    '<section class="card">' + ttl('book', 'Народные сказки') + '<div class="list">' + folk.map(row).join('') + '</div></section>' +
    '<p class="tiny">Младенцам полезно слушать живую речь задолго до того, как станет понятен сюжет. Народные сказки пересказаны для этого приложения.</p>';
}
Actions.taleOpen = el => {
  const t = TALES.find(x => x.id === el.dataset.a), st = Store.state;
  showSheet(() => ({
    title: t.title,
    body: '<div class="tale-art">' + Art.tale(t.art) + '</div><div class="tale">' + t.text.map(x => '<p>' + withName(x, st) + '</p>').join('') + '</div>',
  }));
};

/* Плеер: звук остаётся играть при переходе между вкладками */
const Player = {
  audio: null, id: null, urls: {}, stopTimer: null, stopAt: 0, wake: null, minutes: 0,
  url(id) {
    if (!this.urls[id]) this.urls[id] = URL.createObjectURL(new Blob([encodeWav(renderTrack(id))], { type: 'audio/wav' }));
    return this.urls[id];
  },
  title() {
    const t = [...TUNES, ...SOUNDS].find(x => x.id === this.id);
    return t ? t.title : '';
  },
  async holdScreen() {
    try { if (navigator.wakeLock) this.wake = await navigator.wakeLock.request('screen'); }
    catch (e) { /* экран погаснет как обычно */ }
  },
  releaseScreen() {
    if (this.wake) { this.wake.release().catch(() => {}); this.wake = null; }
  },
  play(id) {
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.loop = true;
    }
    this.id = id;
    this.audio.src = this.url(id);
    const started = this.audio.play();
    if (started && started.catch) started.catch(() => { this.stop(); toast('Браузер не дал включить звук. Нажмите ещё раз'); });
    this.holdScreen();
    this.applyTimer();
    drawPlayer();
  },
  stop() {
    if (this.audio) this.audio.pause();
    this.id = null;
    clearTimeout(this.stopTimer);
    this.stopAt = 0;
    this.releaseScreen();
    drawPlayer();
  },
  setMinutes(m) {
    this.minutes = m;
    this.applyTimer();
    drawPlayer();
  },
  applyTimer() {
    clearTimeout(this.stopTimer);
    this.stopAt = 0;
    if (this.id && this.minutes) {
      this.stopAt = Date.now() + this.minutes * MIN;
      this.stopTimer = setTimeout(() => { this.stop(); if (UI.tab === 'fun') render(); }, this.minutes * MIN);
    }
  },
};
function drawPlayer() {
  const el = $('#player'), on = !!Player.id;
  document.body.classList.toggle('has-player', on);
  el.hidden = !on;
  if (!on) { el.innerHTML = ''; return; }
  const left = Player.stopAt ? ' · ещё ' + Math.max(1, Math.ceil((Player.stopAt - Date.now()) / MIN)) + ' мин' : '';
  el.innerHTML = '<div class="eq"><i></i><i></i><i></i></div><span class="player-t">' + esc(Player.title()) + '<span class="mute">' + left + '</span></span><button class="pill-btn" data-act="playStop">Стоп</button>';
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) return;
  if (Player.id) { Player.holdScreen(); drawPlayer(); }
});

function trackRow(t, ic) {
  const on = Player.id === t.id;
  return '<button class="li" data-act="playTrack" data-a="' + t.id + '" aria-pressed="' + on + '">' + liIcon(on ? '<div class="eq"><i></i><i></i><i></i></div>' : Art.mini(ic)) + '<span class="li-main"><span class="li-t">' + esc(t.title) + '</span><span class="li-s" style="display:block">' + esc(t.note) + '</span></span><span class="tag ' + (on ? 'bad' : 'mute') + '">' + (on ? 'играет' : 'включить') + '</span></button>';
}
function funMusicView() {
  const timers = [[0, 'Без таймера'], [15, '15 мин'], [30, '30 мин'], [60, '60 мин']];
  return '<section class="card">' + ttl('moon', 'Звуки для сна') + '<div class="list">' + SOUNDS.map(t => trackRow(t, 'cloud')).join('') + '</div></section>' +
    '<section class="card">' + ttl('note', 'Музыкальная шкатулка') + '<div class="list">' + TUNES.map(t => trackRow(t, 'note')).join('') + '</div></section>' +
    '<section class="card">' + ttl('clock', 'Выключить через') + '<div class="chips">' + timers.map(([m, l]) => '<button class="pill-btn' + (Player.minutes === m ? ' on' : '') + '" data-act="playTimer" data-a="' + m + '">' + l + '</button>').join('') + '</div><p class="tiny">Таймер надёжно срабатывает, пока приложение открыто. Экран во время звука не гаснет.</p></section>' +
    '<div class="note-c sun"><b>Берегите слух</b>Ставьте телефон подальше от кроватки, примерно в 2 метрах, и на небольшую громкость. Шум лучше выключать после засыпания, а не оставлять на всю ночь.</div>';
}
Actions.playTrack = el => {
  const id = el.dataset.a;
  if (Player.id === id) Player.stop();
  else Player.play(id);
  render();
};
Actions.playStop = () => { Player.stop(); if (UI.tab === 'fun') render(); };
Actions.playTimer = el => { Player.setMinutes(Number(el.dataset.a)); render(); };
