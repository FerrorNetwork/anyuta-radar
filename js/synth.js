'use strict';

/* Мелодии и звуки для сна синтезируются прямо на телефоне, файлов с музыкой в приложении нет.
   Все мелодии старинные и свободны от авторских прав. */

const SYNTH_RATE = 16000;
const NOTE_BASE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function noteFreq(name) {
  const m = name.match(/^([A-G])([#b]?)(\d)$/);
  if (!m) throw new Error('Неизвестная нота: ' + name);
  const semis = NOTE_BASE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (Number(m[3]) + 1) * 12;
  return 440 * Math.pow(2, (semis - 69) / 12);
}
const CHORD_NOTES = {
  C: ['C3', 'G3', 'C4', 'E4'], F: ['F2', 'C4', 'F3', 'A3'], G: ['G2', 'D3', 'G3', 'B3'], G7: ['G2', 'F3', 'G3', 'B3'],
  Am: ['A2', 'E3', 'A3', 'C4'], Em: ['E3', 'B3', 'E4', 'G3'], E: ['E3', 'B3', 'G#3', 'E4'], Dm: ['D3', 'A3', 'D4', 'F3'],
};
const TUNES = [
  { id: 'brahms', title: 'Колыбельная Брамса', note: 'Самая известная колыбельная в мире', bpm: 66, beats: 3, pickup: 1, loudness: .55,
    chords: 'C C F C G7 G7 G7 C F C F C F C G7 C',
    notes: 'E4:.5 E4:.5 G4:2 E4:.5 E4:.5 G4:2 E4:.5 G4:.5 C5:1 B4:1.5 A4:.5 A4:1 G4:1 D4:.5 E4:.5 F4:2 D4:.5 E4:.5 F4:2 D4:.5 F4:.5 B4:.5 A4:.5 G4:1 B4:1 C5:2 C4:.5 C4:.5 C5:2 A4:.5 F4:.5 G4:2 E4:.5 C4:.5 F4:1 G4:1 A4:1 G4:2 C4:.5 C4:.5 C5:2 A4:.5 F4:.5 G4:2 E4:.5 C4:.5 F4:1 E4:1 D4:1 C4:3' },
  { id: 'twinkle', title: 'Мерцай, звёздочка', note: 'Французская песенка, её любил Моцарт', bpm: 76, beats: 2, pickup: 0, loudness: .55,
    chords: 'C C F C F C G C C G C G C G C G C C F C F C G C',
    notes: 'C4 C4 G4 G4 A4 A4 G4:2 F4 F4 E4 E4 D4 D4 C4:2 G4 G4 F4 F4 E4 E4 D4:2 G4 G4 F4 F4 E4 E4 D4:2 C4 C4 G4 G4 A4 A4 G4:2 F4 F4 E4 E4 D4 D4 C4:2' },
  { id: 'lune', title: 'При свете луны', note: 'Старинная французская песня', bpm: 72, beats: 4, pickup: 0, loudness: .55,
    chords: 'C C C C C C C C G Dm G G C C C C',
    notes: 'C4 C4 C4 D4 E4:2 D4:2 C4 E4 D4 D4 C4:4 C4 C4 C4 D4 E4:2 D4:2 C4 E4 D4 D4 C4:4 D4 D4 D4 D4 A3:2 A3:2 D4 C4 B3 A3 G3:4 C4 C4 C4 D4 E4:2 D4:2 C4 E4 D4 D4 C4:4' },
  { id: 'jacques', title: 'Братец Яков', note: 'Весёлая песенка для бодрых минут', bpm: 92, beats: 4, pickup: 0, loudness: .55,
    chords: 'C C C C C C C C',
    notes: 'C4 D4 E4 C4 C4 D4 E4 C4 E4 F4 G4:2 E4 F4 G4:2 G4:.5 A4:.5 G4:.5 F4:.5 E4 C4 G4:.5 A4:.5 G4:.5 F4:.5 E4 C4 C4 G3 C4:2 C4 G3 C4:2' },
  { id: 'greensleeves', title: 'Зелёные рукава', note: 'Английская мелодия XVI века', bpm: 96, beats: 3, pickup: 1, loudness: .55,
    chords: 'Am C G Em Am Am E E Am C G Em Am E Am',
    notes: 'A4 C5:2 D5 E5:1.5 F5:.5 E5 D5:2 B4 G4:1.5 A4:.5 B4 C5:2 A4 A4:1.5 G#4:.5 A4 B4:2 G#4 E4:2 A4 C5:2 D5 E5:1.5 F5:.5 E5 D5:2 B4 G4:1.5 A4:.5 B4 C5:1.5 B4:.5 A4 G#4:1.5 F#4:.5 G#4 A4:3' },
  { id: 'joy', title: 'Ода к радости', note: 'Бетховен, тихая музыкальная шкатулка', bpm: 84, beats: 4, pickup: 0, loudness: .55,
    chords: 'C G C G C G C C G C G G C G C C',
    notes: 'E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 E4:1.5 D4:.5 D4:2 E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 D4:1.5 C4:.5 C4:2 D4 D4 E4 C4 D4 E4:.5 F4:.5 E4 C4 D4 E4:.5 F4:.5 E4 D4 C4 D4 G3:2 E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 D4:1.5 C4:.5 C4:2' },
  { id: 'bach', title: 'Прелюдия Баха', note: 'Спокойные переливы для засыпания', bpm: 58, loudness: .42,
    arps: ['C4 E4 G4 C5 E5', 'C4 D4 A4 D5 F5', 'B3 D4 G4 D5 F5', 'C4 E4 G4 C5 E5', 'C4 E4 A4 E5 A5', 'C4 D4 F#4 A4 D5', 'B3 D4 G4 D5 G5', 'B3 C4 E4 G4 C5', 'A3 C4 E4 G4 C5', 'D3 A3 D4 F#4 C5', 'G3 B3 D4 G4 B4', 'G3 Bb3 E4 G4 C#5', 'F3 A3 D4 A4 D5', 'F3 Ab3 D4 F4 B4', 'E3 G3 C4 G4 C5', 'E3 F3 A3 C4 F4', 'D3 F3 A3 C4 F4', 'G2 D3 G3 B3 F4', 'C3 E3 G3 C4 E4'] },
];
const SOUNDS = [
  { id: 'white', title: 'Белый шум', note: 'Ровный шум, как у вентилятора' },
  { id: 'pink', title: 'Мягкий шум', note: 'Глуше и спокойнее белого' },
  { id: 'rain', title: 'Дождик', note: 'Тихий дождь за окном' },
  { id: 'sea', title: 'Море', note: 'Медленные волны' },
  { id: 'heart', title: 'Как в животике', note: 'Сердцебиение и низкий гул' },
];

/* Колокольчик музыкальной шкатулки. Синусы и затухание считаются рекуррентно: так в десятки раз быстрее */
function addBell(buf, at, freq, amp, tail = 1.9) {
  const start = Math.floor(at * SYNTH_RATE), len = Math.min(buf.length - start, Math.floor(tail * SYNTH_RATE));
  const step = 1 / SYNTH_RATE, w = 2 * Math.PI * freq * step, attackLen = .007 * SYNTH_RATE;
  const c1 = 2 * Math.cos(w), c2 = 2 * Math.cos(2 * w), c3 = 2 * Math.cos(3.01 * w);
  let a1 = 0, b1 = Math.sin(w), a2 = 0, b2 = Math.sin(2 * w), a3 = 0, b3 = Math.sin(3.01 * w);
  let env = 1, env2 = .28, env3 = .07;
  const k = Math.exp(-(2 + freq / 520) * step), k2 = Math.exp(-4 * step), k3 = Math.exp(-9 * step);
  for (let i = 0; i < len; i++) {
    const attack = i < attackLen ? i / attackLen : 1;
    buf[start + i] += amp * attack * env * (a1 + env2 * a2 + env3 * a3);
    const n1 = c1 * b1 - a1, n2 = c2 * b2 - a2, n3 = c3 * b3 - a3;
    a1 = b1; b1 = n1; a2 = b2; b2 = n2; a3 = b3; b3 = n3;
    env *= k; env2 *= k2; env3 *= k3;
  }
}
function normalize(buf, peak) {
  let max = 0;
  for (let i = 0; i < buf.length; i++) max = Math.max(max, Math.abs(buf[i]));
  if (max > 0) { const k = peak / max; for (let i = 0; i < buf.length; i++) buf[i] *= k; }
  return buf;
}
function parseNotes(s) {
  return s.trim().split(/\s+/).map(x => {
    const [n, d] = x.split(':');
    return [n, d === undefined ? 1 : Number(d)];
  });
}
function renderTune(t) {
  const beat = 60 / t.bpm;
  if (t.arps) {
    const pattern = [0, 1, 2, 3, 4, 2, 3, 4, 0, 1, 2, 3, 4, 2, 3, 4], step = beat / 4;
    const buf = new Float32Array(Math.ceil((t.arps.length * 16 * step + 3) * SYNTH_RATE));
    t.arps.forEach((bar, b) => {
      const tones = bar.split(' ');
      pattern.forEach((p, i) => addBell(buf, .15 + (b * 16 + i) * step, noteFreq(tones[p]), .34, 1.3));
    });
    return normalize(buf, t.loudness);
  }
  const notes = parseNotes(t.notes), total = notes.reduce((s, n) => s + n[1], 0);
  const buf = new Float32Array(Math.ceil((total * beat + 3) * SYNTH_RATE));
  let at = .15;
  notes.forEach(([n, d]) => { addBell(buf, at, noteFreq(n), .6); at += d * beat; });
  t.chords.split(' ').forEach((name, bar) => {
    const chord = CHORD_NOTES[name], start = .15 + (t.pickup + bar * t.beats) * beat;
    addBell(buf, start, noteFreq(chord[0]), .2);
    for (let b = 1; b < t.beats; b++) addBell(buf, start + b * beat, noteFreq(chord[1 + (b - 1) % 3]), .13);
  });
  return normalize(buf, t.loudness);
}

function randomizer(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296 * 2 - 1;
  };
}
/* Склеиваем конец с началом, чтобы шум звучал без щелчка при повторе */
function seamless(raw, fade) {
  const n = raw.length - fade, out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    if (i < fade) { const k = i / fade; out[i] = raw[i] * Math.sqrt(k) + raw[n + i] * Math.sqrt(1 - k); }
    else out[i] = raw[i];
  }
  return out;
}
function pinkNoise(len, seed) {
  const r = randomizer(seed), out = new Float32Array(len);
  let b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < len; i++) {
    const w = r();
    b0 = .99765 * b0 + w * .099046;
    b1 = .963 * b1 + w * .2965164;
    b2 = .57 * b2 + w * 1.0526913;
    out[i] = b0 + b1 + b2 + w * .1848;
  }
  return out;
}
function brownNoise(len, seed) {
  const r = randomizer(seed), out = new Float32Array(len);
  let v = 0;
  for (let i = 0; i < len; i++) {
    v = (v + r() * .02) * .998;
    out[i] = v;
  }
  return out;
}
function renderSound(id) {
  const secs = id === 'heart' ? 20 : 24, n = secs * SYNTH_RATE, fade = SYNTH_RATE;
  if (id === 'white') {
    const r = randomizer(7), raw = new Float32Array(n + fade);
    for (let i = 0; i < raw.length; i++) raw[i] = r();
    return normalize(seamless(raw, fade), .22);
  }
  if (id === 'pink') return normalize(seamless(pinkNoise(n + fade, 11), fade), .28);
  if (id === 'rain') {
    const noise = pinkNoise(n + fade, 23), raw = new Float32Array(n + fade), r = randomizer(5);
    let prev = 0;
    for (let i = 0; i < raw.length; i++) { raw[i] = (noise[i] - prev * .75) * .7; prev = noise[i]; }
    const out = seamless(raw, fade);
    for (let d = 0; d < 900; d++) {
      const at = Math.floor((r() + 1) / 2 * (n - 400)), amp = .6 + Math.abs(r());
      for (let i = 0; i < 400; i++) out[at + i] += r() * amp * Math.exp(-i / 70);
    }
    return normalize(out, .3);
  }
  if (id === 'sea') {
    const noise = pinkNoise(n + fade, 31), raw = seamless(noise, fade), out = new Float32Array(n);
    let low = 0;
    for (let i = 0; i < n; i++) {
      const phase = i / n * 4 * 2 * Math.PI, swell = .28 + .72 * Math.pow((1 - Math.cos(phase)) / 2, 1.6);
      low += (raw[i] - low) * (.06 + .2 * swell);
      out[i] = low * swell;
    }
    return normalize(out, .34);
  }
  const rumble = seamless(brownNoise(n + fade, 41), fade), out = new Float32Array(n), beats = 24, period = n / beats;
  for (let i = 0; i < n; i++) out[i] = rumble[i] * .55;
  const thump = (start, freq, amp) => {
    for (let i = 0; i < 2600; i++) {
      const t = i / SYNTH_RATE;
      out[(start + i) % n] += amp * Math.min(1, t / .012) * Math.exp(-t * 18) * Math.sin(2 * Math.PI * freq * t);
    }
  };
  for (let b = 0; b < beats; b++) {
    const at = Math.floor(b * period);
    thump(at, 56, 1);
    thump(at + Math.floor(.26 * SYNTH_RATE), 48, .62);
  }
  return normalize(out, .42);
}
/* 16-битный WAV: такой файл играет обычный элемент audio, и звук не зависит от переключателя беззвучного режима */
function encodeWav(samples) {
  const n = samples.length, view = new DataView(new ArrayBuffer(44 + n * 2));
  const text = (o, s) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
  text(0, 'RIFF');
  view.setUint32(4, 36 + n * 2, true);
  text(8, 'WAVEfmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, SYNTH_RATE, true);
  view.setUint32(28, SYNTH_RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  text(36, 'data');
  view.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, samples[i])) * 32767, true);
  return new Uint8Array(view.buffer);
}
function renderTrack(id) {
  const tune = TUNES.find(t => t.id === id);
  return tune ? renderTune(tune) : renderSound(id);
}
