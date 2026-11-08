'use strict';

/* Вся графика приложения нарисована кодом: зайка, небо, наклейки, еда. */

const Art = {};
const artSvg = (vb, body, cls) => '<svg class="art' + (cls ? ' ' + cls : '') + '" viewBox="' + vb + '" aria-hidden="true">' + body + '</svg>';

function bunnyBody(mood) {
  const bun = ' fill="var(--bun)" stroke="var(--bun-line)" stroke-width="3" stroke-linejoin="round"';
  const inner = ' fill="var(--bun-in)"';
  const line = ' fill="none" stroke="#43345f" stroke-width="4.5" stroke-linecap="round"';
  const thin = ' fill="none" stroke="#43345f" stroke-width="3.2" stroke-linecap="round"';
  const asleep = mood === 'asleep';
  const earL = '<g class="ear-l"><path d="M52 72C38 46 32 18 44 10c12-7 26 20 30 56z"' + bun + '/><path d="M56 64C46 44 42 26 48 20c7-5 16 16 19 42z"' + inner + '/></g>';
  const earR = asleep
    ? '<path d="M100 70c20-16 50-14 54 0 4 14-26 22-48 16z"' + bun + '/><path d="M108 74c16-10 36-8 39-1 2 8-19 12-35 8z"' + inner + '/>'
    : '<g class="ear-r"><path d="M108 72c14-26 20-54 8-62-12-7-26 20-30 56z"' + bun + '/><path d="M104 64c10-20 14-38 8-44-7-5-16 16-19 42z"' + inner + '/></g>';
  const eye = x => {
    if (asleep) return '<path d="M' + (x - 9) + ' 100q9 10 18 0"' + line + '/>';
    if (mood === 'happy') return '<path d="M' + (x - 9) + ' 105q9-12 18 0"' + line + '/>';
    if (mood === 'tired') return '<path d="M' + (x - 9) + ' 100h18"' + line + '/><path d="M' + (x - 6) + ' 101a6 6 0 0 0 12 0z" fill="#43345f"/>';
    return '<circle cx="' + x + '" cy="102" r="8" fill="#43345f"/><circle cx="' + (x + 3) + '" cy="99" r="2.8" fill="#fff"/>';
  };
  const mouth = mood === 'tired' ? '<ellipse cx="80" cy="129" rx="6" ry="7.5" fill="#d9577f"/>'
    : asleep ? '<path d="M74 127q6 4 12 0"' + thin + '/>'
      : mood === 'happy' ? '<path d="M68 124q12 15 24 0z" fill="#e8557f"/>'
        : '<path d="M80 122v3M80 125q-6 7-12 2M80 125q6 7 12 2"' + thin + '/>';
  const zzz = asleep ? '<g class="zzz" font-weight="800" font-family="Nunito, sans-serif" fill="#b9a6ff"><text x="122" y="46" font-size="17">z</text><text x="134" y="30" font-size="22">z</text><text x="148" y="12" font-size="27">z</text></g>' : '';
  return earL + earR + '<ellipse cx="80" cy="104" rx="52" ry="44"' + bun + '/>' +
    '<path d="M60 70 42 58c-4 8-4 16 0 24z" fill="#ff85b3"/><path d="M60 70l18-12c4 8 4 16 0 24z" fill="#ff85b3"/><circle cx="60" cy="70" r="6.5" fill="#ff5c97"/>' +
    '<circle cx="42" cy="122" r="10" fill="#ffb3cb" opacity=".8"/><circle cx="118" cy="122" r="10" fill="#ffb3cb" opacity=".8"/>' +
    eye(58) + eye(102) + '<path d="M75 115q5-4 10 0-2 5-5 6-3-1-5-6z" fill="#ff85a8"/>' + mouth + zzz;
}
Art.bunny = (mood = 'awake') => artSvg('0 0 160 160', bunnyBody(mood), 'bunny ' + mood);

Art.sun = () => artSvg('0 0 64 64', '<path d="M32 5v7M32 52v7M5 32h7M52 32h7M13 13l5 5M46 46l5 5M13 51l5-5M46 18l5-5" stroke="#ffb020" stroke-width="5" stroke-linecap="round"/><circle cx="32" cy="32" r="16" fill="#ffc83d"/><circle cx="26" cy="30" r="2.4" fill="#7a4a00"/><circle cx="38" cy="30" r="2.4" fill="#7a4a00"/><path d="M26 37q6 5 12 0" fill="none" stroke="#7a4a00" stroke-width="2.4" stroke-linecap="round"/><circle cx="22" cy="36" r="3" fill="#ff9d5c" opacity=".7"/><circle cx="42" cy="36" r="3" fill="#ff9d5c" opacity=".7"/>');
Art.moon = () => artSvg('0 0 64 64', '<path d="M41 6a26 26 0 1 0 17 40A22 22 0 0 1 41 6z" fill="#ffe08a"/><path d="M19 30q4 4 8 0" fill="none" stroke="#8a6200" stroke-width="2.4" stroke-linecap="round"/><path d="M21 42q5 4 9 0" fill="none" stroke="#8a6200" stroke-width="2.4" stroke-linecap="round"/><circle cx="16" cy="38" r="3" fill="#ffb37a" opacity=".7"/>');
Art.cloud = () => artSvg('0 0 100 60', '<path d="M24 56a17 17 0 0 1-2-34 23 23 0 0 1 43-7 18 18 0 0 1 25 16 13 13 0 0 1-3 25z" fill="#fff"/>');
const STAR_PATH = 'M12 2.6l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.5l-5.9 3.1 1.2-6.5L2.5 9.5l6.6-.9z';
Art.star = (color = '#ffd76a') => artSvg('0 0 24 24', '<path d="' + STAR_PATH + '" fill="' + color + '" stroke="' + color + '" stroke-width="2" stroke-linejoin="round"/>');

Art.owl = () => artSvg('0 0 110 120', '<path d="M24 34 20 14l18 10zM86 34l4-20-18 10z" fill="#9a7ee8"/><ellipse cx="55" cy="72" rx="38" ry="44" fill="#b79bf5"/><ellipse cx="55" cy="86" rx="25" ry="27" fill="#ece3ff"/><path d="M42 80q4 4 8 0M60 80q4 4 8 0M50 92q5 4 10 0" fill="none" stroke="#c6b3f3" stroke-width="3" stroke-linecap="round"/><path d="M18 66c-8 12-8 28 2 38 6-8 8-24 4-38zM92 66c8 12 8 28-2 38-6-8-8-24-4-38z" fill="#9a7ee8"/><circle cx="39" cy="52" r="15" fill="#fff"/><circle cx="71" cy="52" r="15" fill="#fff"/><circle cx="41" cy="52" r="8" fill="#43345f"/><circle cx="69" cy="52" r="8" fill="#43345f"/><circle cx="44" cy="49" r="2.6" fill="#fff"/><circle cx="72" cy="49" r="2.6" fill="#fff"/><path d="M50 62h10l-5 9z" fill="#ffb347"/><path d="M55 5 88 19 55 33 22 19z" fill="#43345f"/><path d="M84 21v15" stroke="#ffc83d" stroke-width="3" stroke-linecap="round"/><circle cx="84" cy="39" r="4" fill="#ffc83d"/>');
Art.bottle = () => artSvg('0 0 64 64', '<path d="M28 5c0-3 8-3 8 0l1 8h-10z" fill="#ffc6a0"/><rect x="21" y="12" width="22" height="8" rx="3" fill="#ff85b3"/><path d="M22 20h20c3 4 4 8 4 12v22a6 6 0 0 1-6 6H24a6 6 0 0 1-6-6V32c0-4 1-8 4-12z" fill="#dff1ff"/><path d="M18 38h28v16a6 6 0 0 1-6 6H24a6 6 0 0 1-6-6z" fill="#fff"/><path d="M27 32h10M27 40h10M27 48h10" stroke="#8ccbff" stroke-width="2.5" stroke-linecap="round"/>');
Art.balloons = () => artSvg('0 0 90 90', '<path d="M28 44c2 12-4 24 2 42M60 40c-2 14 4 28-4 46" fill="none" stroke="#b9a6d9" stroke-width="2"/><ellipse cx="28" cy="26" rx="18" ry="22" fill="#ff85b3"/><path d="M24 48h8l-4-5z" fill="#ff85b3"/><ellipse cx="60" cy="22" rx="18" ry="21" fill="#ffc83d"/><path d="M56 43h8l-4-5z" fill="#ffc83d"/><ellipse cx="22" cy="18" rx="4" ry="7" fill="#fff" opacity=".55"/><ellipse cx="54" cy="14" rx="4" ry="7" fill="#fff" opacity=".55"/>');

/* Маленькие наклейки */
const MINI = {
  star: '<path d="' + STAR_PATH + '" fill="#ffc83d" stroke="#ffc83d" stroke-width="2" stroke-linejoin="round"/>',
  starOff: '<path d="' + STAR_PATH + '" fill="var(--line)" stroke="var(--line)" stroke-width="2" stroke-linejoin="round"/>',
  heart: '<path d="M12 20.5S3.5 15.6 3.5 9.2A4.7 4.7 0 0 1 12 6.6a4.7 4.7 0 0 1 8.5 2.6c0 6.4-8.5 11.3-8.5 11.3z" fill="#ff6fa3"/>',
  moon: '<path d="M15.5 3a9.4 9.4 0 1 0 5.8 14.4A8 8 0 0 1 15.5 3z" fill="#8c6cf0"/><circle cx="19" cy="6" r="1.4" fill="#ffc83d"/>',
  sun: '<path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2" stroke="#ffb020" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="12" r="5.2" fill="#ffc83d"/>',
  cloud: '<path d="M7 19a4.6 4.6 0 0 1-.6-9.2 6 6 0 0 1 11.3-1.6A4.8 4.8 0 0 1 18 19z" fill="#8ccbff"/>',
  rain: '<path d="M7 15a4.2 4.2 0 0 1-.6-8.4 5.6 5.6 0 0 1 10.6-1.4A4.4 4.4 0 0 1 17.6 15z" fill="#b5a9d6"/><path d="M8 18l-1 3M13 18l-1 3M18 18l-1 3" stroke="#5bb8ff" stroke-width="2" stroke-linecap="round"/>',
  bulb: '<path d="M12 2.5a6.8 6.8 0 0 0-4 12.3c.7.6 1 1.3 1 2.2h6c0-.9.3-1.6 1-2.2a6.8 6.8 0 0 0-4-12.3z" fill="#ffc83d"/><rect x="9" y="18" width="6" height="3.5" rx="1.5" fill="#a99bcf"/>',
  clock: '<circle cx="12" cy="12" r="9.5" fill="#5bb8ff"/><path d="M12 7v5.4l3.4 2" stroke="#fff" stroke-width="2.2" stroke-linecap="round" fill="none"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="4" fill="#fff" stroke="#e5daf5" stroke-width="1.4"/><path d="M3 9a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v1H3z" fill="#ff85b3"/><circle cx="8.5" cy="14.5" r="1.5" fill="#8c6cf0"/><circle cx="15.5" cy="14.5" r="1.5" fill="#ffc83d"/>',
  tooth: '<path d="M7.5 3.5c1.8 0 3 1 4.5 1s2.7-1 4.5-1c3 0 4.5 2.6 4 6-.3 2.2-1.2 3.6-1.6 5.6-.4 2.4-.6 5.4-2.2 5.4-1.9 0-1.5-5-4.7-5s-2.8 5-4.7 5c-1.6 0-1.8-3-2.2-5.4-.4-2-1.3-3.4-1.6-5.6-.5-3.4 1-6 4-6z" fill="#fff" stroke="#d9cdee" stroke-width="1.4"/><circle cx="9.5" cy="9.5" r="1" fill="#43345f"/><circle cx="14.5" cy="9.5" r="1" fill="#43345f"/><path d="M10 12q2 1.6 4 0" stroke="#43345f" stroke-width="1.2" fill="none" stroke-linecap="round"/>',
  spoon: '<path d="M9 13.5 3.2 19.3a1.8 1.8 0 0 0 2.5 2.5l5.8-5.8" fill="#ffb37a"/><ellipse cx="15" cy="9" rx="5.6" ry="6.8" transform="rotate(45 15 9)" fill="#ff9a5c"/><ellipse cx="15.3" cy="8.7" rx="3" ry="4" transform="rotate(45 15.3 8.7)" fill="#ffd2b3"/>',
  sprout: '<path d="M12 22v-9" stroke="#3ccfa8" stroke-width="2.4" stroke-linecap="round"/><path d="M12 14C12 9 8.5 6 3 6c0 5.5 3.5 8 9 8z" fill="#3ccfa8"/><path d="M12 11c0-4.4 3-7.5 9-7.5 0 5.5-3.5 7.5-9 7.5z" fill="#6fe0bf"/>',
  hop: '<path d="M2 21c3-7 6-9 10-9s7 2 10 9z" fill="#6fd08f"/><path d="M4 11C6 5 11 3 15 7" fill="none" stroke="#5bb8ff" stroke-width="2" stroke-linecap="round" stroke-dasharray="1 3.6"/><path d="M19 3.2l.9 1.9 2.1.3-1.5 1.5.3 2.1-1.8-1-1.9 1 .4-2.1L16 5.4l2.1-.3z" fill="#ffc83d"/>',
  book: '<path d="M2.5 5.5C6 4 9.5 4.3 12 6.2v14c-2.5-1.8-6-2-9.5-.7z" fill="#5bb8ff"/><path d="M21.5 5.5C18 4 14.5 4.3 12 6.2v14c2.5-1.8 6-2 9.5-.7z" fill="#8ccbff"/>',
  ball: '<circle cx="12" cy="12" r="9.5" fill="#ff85b3"/><path d="M12 2.5a9.5 9.5 0 0 1 0 19" fill="#ffc83d"/><path d="M2.5 12h19" stroke="#fff" stroke-width="2.2"/>',
  warn: '<path d="M12 3 2.5 20h19z" fill="#ff9a5c" stroke="#ff9a5c" stroke-width="2.4" stroke-linejoin="round"/><path d="M12 9.5v5" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><circle cx="12" cy="17.4" r="1.4" fill="#fff"/>',
  sos: '<circle cx="12" cy="12" r="9.5" fill="#ff5c7f"/><path d="M12 7v10M7 12h10" stroke="#fff" stroke-width="3" stroke-linecap="round"/>',
  shield: '<path d="M12 2.5 4 5.5V11c0 5.2 3.3 9 8 10.5 4.7-1.5 8-5.3 8-10.5V5.5z" fill="#3ccfa8"/><path d="m8.5 12 2.5 2.5 4.5-5" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
  crown: '<path d="M3.5 18.5 2.5 7l5.5 4.5L12 4.5l4 7L21.5 7l-1 11.5z" fill="#ffc83d" stroke="#ffc83d" stroke-width="1.5" stroke-linejoin="round"/><circle cx="12" cy="15" r="1.6" fill="#ff85b3"/>',
  plate: '<circle cx="12" cy="12" r="9.5" fill="#dff1ff"/><circle cx="12" cy="12" r="6" fill="#fff"/><path d="M9.5 13.5c1-3 4-3.8 5.5-3 .2 2.6-2.2 5-5.5 3z" fill="#6fd08f"/>',
  list: '<rect x="3.5" y="3" width="17" height="18" rx="4" fill="#ffe08a"/><path d="M7.5 8.5h9M7.5 12.5h9M7.5 16.5h5" stroke="#b58400" stroke-width="2" stroke-linecap="round"/>',
  syncOk: '<path d="M7 19a4.6 4.6 0 0 1-.6-9.2 6 6 0 0 1 11.3-1.6A4.8 4.8 0 0 1 18 19z" fill="#6fe0bf"/><path d="m9 13.5 2.2 2.2 4-4.4" fill="none" stroke="#fff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>',
  syncBusy: '<path d="M7 19a4.6 4.6 0 0 1-.6-9.2 6 6 0 0 1 11.3-1.6A4.8 4.8 0 0 1 18 19z" fill="#8ccbff"/><circle cx="8.5" cy="14" r="1.3" fill="#fff"/><circle cx="12" cy="14" r="1.3" fill="#fff"/><circle cx="15.5" cy="14" r="1.3" fill="#fff"/>',
  syncOff: '<path d="M7 19a4.6 4.6 0 0 1-.6-9.2 6 6 0 0 1 11.3-1.6A4.8 4.8 0 0 1 18 19z" fill="#c9c0dc"/><path d="M9 11.5l6 6M15 11.5l-6 6" stroke="#fff" stroke-width="2.1" stroke-linecap="round"/>',
  syncBad: '<path d="M7 19a4.6 4.6 0 0 1-.6-9.2 6 6 0 0 1 11.3-1.6A4.8 4.8 0 0 1 18 19z" fill="#ff85a0"/><path d="M12 10.5v4" stroke="#fff" stroke-width="2.3" stroke-linecap="round"/><circle cx="12" cy="16.6" r="1.2" fill="#fff"/>',
};
Art.mini = name => artSvg('0 0 24 24', MINI[name] || MINI.star, 'mini');
Art.tip = level => Art.mini({ warn: 'rain', note: 'heart', info: 'bulb', good: 'star' }[level] || 'bulb');

/* Еда: один рисунок на продукт или похожую группу */
const bowl = c => '<path d="M9 24a15 12 0 0 1 30 0z" fill="' + c + '"/><path d="M6 24h36c0 11-8 18-18 18S6 35 6 24z" fill="#8ccbff"/><path d="M12 30c2 4 5 6 9 7" stroke="#c9e7ff" stroke-width="2.4" stroke-linecap="round" fill="none"/>';
const FOOD_ART = {
  zucchini: '<g transform="rotate(-28 24 24)"><rect x="5" y="17" width="38" height="14" rx="7" fill="#62b868"/><rect x="11" y="20" width="24" height="3" rx="1.5" fill="#a6e39b"/><rect x="40" y="21" width="6" height="6" rx="2" fill="#8a6a3e"/></g>',
  cauli: '<path d="M8 32c4 8 10 11 16 11s12-3 16-11c-5 2-11 3-16 3s-11-1-16-3z" fill="#7fc97a"/><circle cx="15" cy="22" r="9" fill="#fff4dc"/><circle cx="24" cy="15" r="10" fill="#fff4dc"/><circle cx="33" cy="22" r="9" fill="#fff4dc"/><circle cx="24" cy="26" r="10" fill="#fff8ea"/>',
  broccoli: '<path d="M19 44c-1-6-2-11-2-16h14c0 5-1 10-2 16z" fill="#a3dc7a"/><circle cx="14" cy="21" r="9" fill="#4caf50"/><circle cx="24" cy="13" r="10" fill="#43a047"/><circle cx="34" cy="21" r="9" fill="#4caf50"/><circle cx="24" cy="23" r="9" fill="#66bb6a"/>',
  pumpkin: '<ellipse cx="24" cy="29" rx="20" ry="15" fill="#ff9a3d"/><ellipse cx="24" cy="29" rx="11" ry="15" fill="#ffae5e"/><ellipse cx="24" cy="29" rx="4" ry="15" fill="#ffc07f"/><path d="M22 15c0-4 2-7 6-9l3 3c-3 1-4 3-4 6z" fill="#6ca65a"/>',
  carrot: '<path d="M32 17c-6-4-13-1-16 5L7 40c-1 2 1 3 3 2l18-8c6-3 9-12 4-17z" fill="#ff9a3d"/><path d="M15 30l4 2M21 23l4 2.5M19 36l3 1.5" stroke="#e87b1e" stroke-width="2" stroke-linecap="round"/><path d="M31 18c0-6 3-11 8-13 1 5-1 9-4 12 4-2 8-2 11 0-3 4-8 5-12 4z" fill="#5fc46b"/>',
  potato: '<path d="M9 28c0-11 9-18 20-17 9 1 13 9 11 17-2 9-10 13-18 12C14 39 9 35 9 28z" fill="#d9a866"/><circle cx="19" cy="23" r="1.6" fill="#b98642"/><circle cx="29" cy="20" r="1.6" fill="#b98642"/><circle cx="31" cy="30" r="1.6" fill="#b98642"/><circle cx="20" cy="33" r="1.6" fill="#b98642"/>',
  apple: '<path d="M24 15c-3-4-8-5-12-2-6 4-6 13-3 20 3 6 7 10 11 10 2 0 3-1 4-1s2 1 4 1c4 0 8-4 11-10 3-7 3-16-3-20-4-3-9-2-12 2z" fill="#ff6b6b"/><path d="M24 15c0-4 2-8 7-9 0 5-2 8-7 9z" fill="#5fc46b"/><ellipse cx="15" cy="21" rx="3" ry="5" fill="#fff" opacity=".4"/>',
  pear: '<path d="M24 11c4 0 6 3 7 7 1 4 8 8 8 16 0 6-7 10-15 10S9 40 9 34c0-8 7-12 8-16 1-4 3-7 7-7z" fill="#c9dc5f"/><path d="M24 11c0-3 1-5 3-7" stroke="#8a6a3e" stroke-width="2.4" stroke-linecap="round"/><path d="M26 9c2-3 6-4 9-3-1 3-5 5-9 3z" fill="#5fc46b"/>',
  banana: '<path d="M7 12c2 17 15 29 33 27 2 0 3-3 1-4-12-2-22-10-27-23-1-4-7-4-7 0z" fill="#ffd23f"/><path d="M7 12c-1-3 2-5 4-5l3 4c-3 0-5 0-7 1z" fill="#a98b3c"/>',
  plum: '<circle cx="24" cy="27" r="16" fill="#8e5bd0"/><ellipse cx="17" cy="22" rx="3" ry="5" fill="#fff" opacity=".35"/><path d="M24 11c1-4 4-6 8-7 0 4-3 7-8 7z" fill="#5fc46b"/>',
  peach: '<circle cx="24" cy="27" r="17" fill="#ffb38a"/><path d="M24 10c-5 6-6 20 0 34" fill="none" stroke="#f08f63" stroke-width="2.2" stroke-linecap="round"/><path d="M24 11c1-4 4-6 8-7 0 4-3 7-8 7z" fill="#5fc46b"/>',
  berries: '<circle cx="16" cy="30" r="9" fill="#e8476b"/><circle cx="32" cy="30" r="9" fill="#e8476b"/><circle cx="24" cy="18" r="9" fill="#ef5f80"/><path d="M24 9c-2-3-5-4-8-4 1 3 4 5 8 4zM24 9c2-3 5-4 8-4-1 3-4 5-8 4z" fill="#5fc46b"/>',
  drum: '<path d="M29 7c7 0 13 5 13 13 0 8-8 13-15 11l-7 7c1 3-2 7-5 6-1-1-2-2-2-3-1 0-2-1-3-2-1-3 3-6 6-5l7-7C21 20 21 7 29 7z" fill="#e8a35c"/><ellipse cx="31" cy="16" rx="4" ry="6" transform="rotate(30 31 16)" fill="#f5c78d"/>',
  steak: '<path d="M8 22C8 12 20 7 31 10c9 2 13 9 11 17-2 9-12 13-22 11C13 37 8 30 8 22z" fill="#e86f6f"/><path d="M12 22c0-7 9-10 18-9 6 1 9 6 8 12-1 6-9 9-16 8-6-1-10-5-10-11z" fill="#f28d8d"/><circle cx="27" cy="23" r="4" fill="#fff0e6"/>',
  patty: '<ellipse cx="24" cy="27" rx="19" ry="14" fill="#c98a5a"/><ellipse cx="24" cy="23" rx="16" ry="10" fill="#dca272"/><path d="M15 21q3-3 6 0M26 20q3-3 6 0" stroke="#b5764a" stroke-width="2" fill="none" stroke-linecap="round"/>',
  liver: '<path d="M8 22c0-8 8-12 18-11 10 1 15 7 14 14-1 8-8 13-14 12-5-1-5-5-9-6-5-1-9-3-9-9z" fill="#a0403c"/><ellipse cx="20" cy="19" rx="6" ry="3" fill="#c76a63"/>',
  fishW: '<path d="M6 24c6-11 20-13 30-3l8-7c1 6 1 14 0 20l-8-7C26 37 12 35 6 24z" fill="#bfdfff"/><circle cx="16" cy="22" r="2.4" fill="#43345f"/><path d="M24 17c3 4 3 10 0 14" stroke="#8fc1ee" stroke-width="2" fill="none" stroke-linecap="round"/>',
  fishP: '<path d="M6 24c6-11 20-13 30-3l8-7c1 6 1 14 0 20l-8-7C26 37 12 35 6 24z" fill="#ffa58f"/><circle cx="16" cy="22" r="2.4" fill="#43345f"/><path d="M24 17c3 4 3 10 0 14" stroke="#f0806a" stroke-width="2" fill="none" stroke-linecap="round"/>',
  yolk: '<circle cx="24" cy="24" r="19" fill="#fff8ea" stroke="#efe2c8" stroke-width="2"/><circle cx="24" cy="24" r="10" fill="#ffc83d"/><ellipse cx="21" cy="21" rx="3" ry="2" fill="#fff" opacity=".6"/>',
  egg: '<path d="M24 5c9 0 15 14 15 23 0 9-7 15-15 15S9 37 9 28C9 19 15 5 24 5z" fill="#fff4e0" stroke="#efe2c8" stroke-width="2"/><ellipse cx="19" cy="20" rx="3" ry="5" fill="#fff"/>',
  curd: '<path d="M14 20c1-8 19-8 20 0z" fill="#fff"/><path d="M10 20h28l-3 22a3 3 0 0 1-3 3H16a3 3 0 0 1-3-3z" fill="#ff8fb4"/><path d="M12 30h24" stroke="#ffc6da" stroke-width="3"/>',
  kefir: '<rect x="19" y="4" width="10" height="6" rx="2" fill="#5bb8ff"/><path d="M19 10h10v5l6 8v20a3 3 0 0 1-3 3H16a3 3 0 0 1-3-3V23l6-8z" fill="#eaf6ff"/><path d="M13 27h22v9H13z" fill="#8ccbff"/>',
  cheese: '<path d="M5 29 33 11c7 3 10 10 10 18z" fill="#ffe08a"/><path d="M5 29h38v11a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z" fill="#ffc83d"/><circle cx="16" cy="36" r="3" fill="#ffe08a"/><circle cx="31" cy="35" r="4" fill="#ffe08a"/><circle cx="31" cy="22" r="2.5" fill="#ffc83d"/>',
  lentil: bowl('#ff9a5c') + '<circle cx="18" cy="19" r="2" fill="#e2743a"/><circle cx="25" cy="16" r="2" fill="#e2743a"/><circle cx="31" cy="20" r="2" fill="#e2743a"/>',
  peas: '<path d="M5 18c9 18 26 25 39 22-5-13-20-27-39-22z" fill="#7fc97a"/><circle cx="16" cy="24" r="4.5" fill="#a6e39b"/><circle cx="24" cy="29" r="4.5" fill="#a6e39b"/><circle cx="32" cy="33" r="4.5" fill="#a6e39b"/>',
  nut: '<path d="M13 11c-7 3-9 12-5 18 2 3 6 3 9 4 3 1 4 4 6 7 4 6 13 6 18 0 4-6 2-14-4-17-3-2-6-2-8-4-2-3-2-7-6-9-3-1-7 0-10 1z" fill="#ddb07a"/><path d="M14 18l3 3M21 13l3 3M31 28l3 3M26 35l3 3" stroke="#bd8a50" stroke-width="2" stroke-linecap="round"/>',
  bread: '<path d="M10 21c-5-2-5-12 4-13h20c9 1 9 11 4 13v18a3 3 0 0 1-3 3H13a3 3 0 0 1-3-3z" fill="#d99a54"/><path d="M14 22c-4-2-4-9 2-10h16c6 1 6 8 2 10v15a2 2 0 0 1-2 2H16a2 2 0 0 1-2-2z" fill="#f6d9a8"/>',
  oil: '<rect x="20" y="3" width="8" height="6" rx="2" fill="#6ca65a"/><path d="M20 9h8v6c5 3 8 8 8 13v14a3 3 0 0 1-3 3H15a3 3 0 0 1-3-3V28c0-5 3-10 8-13z" fill="#ffd23f"/><path d="M12 30h24v8H12z" fill="#fff4cc"/>',
  butter: '<path d="M6 24 16 14h26v14L32 38H6z" fill="#ffe27a"/><path d="M6 24h26v14H6z" fill="#ffd24d"/><path d="M32 24l10-10v14L32 38z" fill="#f2bf30"/>',
  bowlB: bowl('#9a6a3e'), bowlW: bowl('#fff4dc'), bowlY: bowl('#ffd23f'), bowlO: bowl('#e6cf9f'), bowlC: bowl('#f3e3bd'),
};
const FOOD_PICK = { zucchini: 'zucchini', cauliflower: 'cauli', broccoli: 'broccoli', pumpkin: 'pumpkin', carrot: 'carrot', potato: 'potato', buckwheat: 'bowlB', rice: 'bowlW', corn: 'bowlY', oats: 'bowlO', wheat: 'bowlC', apple: 'apple', pear: 'pear', banana: 'banana', plum: 'plum', peach: 'peach', berries: 'berries', turkey: 'drum', chicken: 'drum', rabbit: 'patty', beef: 'steak', liver: 'liver', fish_white: 'fishW', salmon: 'fishP', yolk: 'yolk', egg_whole: 'egg', curd: 'curd', kefir: 'kefir', cheese: 'cheese', lentils: 'lentil', peas: 'peas', nuts: 'nut', bread: 'bread', oil: 'oil', butter: 'butter' };
Art.food = id => artSvg('0 0 48 48', FOOD_ART[FOOD_PICK[id]] || FOOD_ART.bowlW, 'food');
const CAT_PICK = { veg: 'carrot', grain: 'bowlY', fruit: 'apple', meat: 'drum', fish: 'fishW', egg: 'yolk', dairy: 'kefir', other: 'nut' };
Art.cat = id => (id === 'all' ? Art.mini('plate') : artSvg('0 0 48 48', FOOD_ART[CAT_PICK[id]], 'food'));

/* Зуб на карте: у прорезавшегося есть лицо */
Art.toothFace = (w, h) => '<circle cx="-5" cy="-2" r="1.9" fill="#43345f"/><circle cx="5" cy="-2" r="1.9" fill="#43345f"/><path d="M-4 3q4 3.4 8 0" fill="none" stroke="#43345f" stroke-width="1.8" stroke-linecap="round"/><circle cx="-9" cy="2" r="2" fill="#ffb3cb" opacity=".8"/><circle cx="9" cy="2" r="2" fill="#ffb3cb" opacity=".8"/>';
