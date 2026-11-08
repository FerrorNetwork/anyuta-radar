'use strict';

/* Показ упражнений: у фигурки двигаются суставы, руки взрослого показывают, как помогать.
   Углы и смещения заданы переменными, поэтому на все упражнения хватает нескольких анимаций. */

const EX = { skin: '#ffdcc4', skinD: '#f4c7a8', suit: '#b79bf5', suitD: '#9a7ee8', hand: '#eebd96', sleeve: '#7cc4ff', ink: '#43345f', mat: 'var(--ex-mat)', pink: '#ff85b3', yellow: '#ffc83d', mint: '#3ccfa8', sky: '#5bb8ff', wood: '#e6b27a', white: '#ffffff' };
const exSw = (ox, oy, a, b, inner, t = 2.6, d = 0) => '<g class="sw" style="--ox:' + ox + 'px;--oy:' + oy + 'px;--a:' + a + 'deg;--b:' + b + 'deg;--t:' + t + 's;--d:' + d + 's">' + inner + '</g>';
const exSl = (x0, y0, x1, y1, inner, t = 2.6, d = 0) => '<g class="sl" style="--x0:' + x0 + 'px;--y0:' + y0 + 'px;--x1:' + x1 + 'px;--y1:' + y1 + 'px;--t:' + t + 's;--d:' + d + 's">' + inner + '</g>';
const exSy = (ox, oy, a, b, inner, t = 2.6, d = 0) => '<g class="sy" style="--ox:' + ox + 'px;--oy:' + oy + 'px;--a:' + a + ';--b:' + b + ';--t:' + t + 's;--d:' + d + 's">' + inner + '</g>';
const exSpin = (ox, oy, inner, t = 3.6) => '<g class="spn" style="--ox:' + ox + 'px;--oy:' + oy + 'px;--t:' + t + 's">' + inner + '</g>';
const exGo = (x0, y0, x1, y1, inner, t = 5) => '<g class="go" style="--x0:' + x0 + 'px;--y0:' + y0 + 'px;--x1:' + x1 + 'px;--y1:' + y1 + 'px;--t:' + t + 's">' + inner + '</g>';
const exPulse = (inner, t = 1.3, d = 0) => '<g class="pul" style="--t:' + t + 's;--d:' + d + 's">' + inner + '</g>';
const exCap = (x, y, len, w, fill) => '<rect x="' + (x - w / 2) + '" y="' + (y - w / 2) + '" width="' + w + '" height="' + (len + w) + '" rx="' + w / 2 + '" fill="' + fill + '"/>';
const exAt = (x, y, deg, inner) => '<g transform="rotate(' + deg + ' ' + x + ' ' + y + ')">' + inner + '</g>';
const exOval = (x, y, rx, ry, fill) => '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="' + fill + '"/>';
const exDot = (x, y, r, fill) => '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + fill + '"/>';
const exMat = (y = 134) => '<rect x="12" y="' + y + '" width="216" height="13" rx="6.500" fill="' + EX.mat + '"/>';
const exGround = (y = 146) => '<rect x="10" y="' + y + '" width="220" height="7" rx="3.500" fill="' + EX.mat + '"/>';
const exRattle = (x, y, c = EX.pink) => exCap(x, y + 8, 22, 6, EX.wood) + exDot(x, y, 14, c) + exDot(x - 4, y - 4, 4, '#fff');
const exBall = (x, y, r = 15) => exDot(x, y, r, EX.pink) + '<path d="M' + (x - r) + ' ' + y + 'h' + 2 * r + '" stroke="#fff" stroke-width="3"/><path d="M' + x + ' ' + (y - r) + 'a' + r + ' ' + r + ' 0 0 1 0 ' + 2 * r + 'z" fill="' + EX.yellow + '" opacity=".85"/>';
const exHand = (x, y, r = 10) => exOval(x, y, r + 3, r, EX.hand) + '<path d="M' + (x - r + 2) + ' ' + (y - 3) + 'h' + (2 * r - 3) + '" stroke="' + EX.skinD + '" stroke-width="1.700" stroke-linecap="round"/>';

function exHead(x, y, r, opt = {}) {
  const dx = opt.dx || 0, dy = opt.dy || 0, ex = x + dx, ey = y + dy;
  const eye = opt.eyes === 'closed'
    ? '<path d="M' + (ex - r * .5) + ' ' + (ey - 2) + 'q' + r * .17 + ' ' + r * .2 + ' ' + r * .34 + ' 0M' + (ex + r * .16) + ' ' + (ey - 2) + 'q' + r * .17 + ' ' + r * .2 + ' ' + r * .34 + ' 0" fill="none" stroke="' + EX.ink + '" stroke-width="2.200" stroke-linecap="round"/>'
    : opt.noEyes ? '' : exDot(ex - r * .33, ey - 2, r * .12, EX.ink) + exDot(ex + r * .33, ey - 2, r * .12, EX.ink);
  return '<g transform="rotate(' + (opt.tilt || 0) + ' ' + x + ' ' + y + ')">' +
    exAt(x - r * .45, y - r * .7, -16, '<rect x="' + (x - r * .68) + '" y="' + (y - r * 1.62) + '" width="' + r * .46 + '" height="' + r + '" rx="' + r * .23 + '" fill="#fff" stroke="#e6dcf5" stroke-width="1.500"/><rect x="' + (x - r * .59) + '" y="' + (y - r * 1.48) + '" width="' + r * .24 + '" height="' + r * .62 + '" rx="' + r * .12 + '" fill="#ffc6da"/>') +
    exAt(x + r * .45, y - r * .7, 16, '<rect x="' + (x + r * .22) + '" y="' + (y - r * 1.62) + '" width="' + r * .46 + '" height="' + r + '" rx="' + r * .23 + '" fill="#fff" stroke="#e6dcf5" stroke-width="1.500"/><rect x="' + (x + r * .35) + '" y="' + (y - r * 1.48) + '" width="' + r * .24 + '" height="' + r * .62 + '" rx="' + r * .12 + '" fill="#ffc6da"/>') +
    exDot(x, y, r, EX.skin) + exDot(ex - r * .58, ey + r * .28, r * .17, '#ffb3cb') + exDot(ex + r * .58, ey + r * .28, r * .17, '#ffb3cb') + eye +
    (opt.noEyes ? '' : '<path d="M' + (ex - r * .2) + ' ' + (ey + r * .3) + 'q' + r * .2 + ' ' + r * .22 + ' ' + r * .4 + ' 0" fill="none" stroke="' + EX.ink + '" stroke-width="2" stroke-linecap="round"/>') + '</g>';
}
/* Двухзвенная нога или рука: бедро и голень вращаются каждая вокруг своего сустава */
function exLimb(x, y, upper, lower, uA, uB, lA, lB, color, tip, t, d) {
  const knee = y + upper, end = knee + lower;
  const w = upper > 22 ? 14 : 12;
  return exSw(x, y, uA, uB, exCap(x, y, upper, w, color) + exSw(x, knee, lA, lB, exCap(x, knee, lower, w - 2, color) + (tip === 'foot' ? exOval(x + 6, end + 5, 12, 7, EX.skin) : exDot(x, end + 6, 7, EX.skin)), t, d), t, d);
}
const exStill = deg => [deg, deg];

/* Лёжа на спине, вид сбоку: голова слева */
function exBackBody(armA, armB, t = 2.6) {
  return exOval(92, 114, 40, 20, EX.suit) + exHead(46, 106, 24, { dy: -2 }) +
    exSw(76, 104, armA, armB, exCap(76, 104, 24, 11, EX.suitD) + exDot(76, 136, 7, EX.skin), t);
}
/* На животе, вид сбоку: голова справа */
function exProne(headA, headB, opt = {}) {
  const t = opt.t || 3;
  return exAt(70, 114, 80, exCap(70, 114, 34, 13, EX.suitD) + exOval(70, 152, 7, 11, EX.skinD)) + exAt(72, 120, 86, exCap(72, 120, 34, 13, EX.suit) + exOval(72, 158, 7, 11, EX.skin)) +
    exOval(108, 112, 44, 20, EX.suit) + (opt.arms || (exCap(140, 112, 14, 12, EX.suitD) + exAt(140, 127, -90, exCap(140, 127, 22, 11, EX.skin)))) +
    exSw(146, 104, headA, headB, exHead(166, 90, 24, { dx: 6 }), t);
}
/* Сидит, вид сбоку: лицом вправо */
const exSitLegs = () => exAt(104, 124, -82, exCap(104, 124, 26, 14, EX.suitD)) + exAt(130, 128, -96, exCap(130, 128, 24, 12, EX.suit)) + exOval(158, 124, 8, 11, EX.skin);
function exSitBody(armA, armB, t = 3, opt = {}) {
  return exOval(100, 96, 21, 30, EX.suit) + exHead(104, 48, 23, { dx: 5 }) + exSw(104, 78, armA, armB, exCap(104, 78, 28, 11, EX.suitD) + exDot(104, 114, 7, EX.skin), t, opt.d || 0);
}
/* Стоит, вид сбоку: лицом вправо, стопы на y = 146 */
function exStand(opt = {}) {
  const x = opt.x || 104, t = opt.t || 1.6, l = opt.legs || [-16, 16, 28, 4], r = opt.legs2 || [16, -16, 4, 28];
  return exLimb(x - 2, 92, 25, 21, l[0], l[1], l[2], l[3], EX.suitD, 'foot', t, 0) + exLimb(x + 2, 92, 25, 21, r[0], r[1], r[2], r[3], EX.suit, 'foot', t, 0) +
    exOval(x, 72, 19, 27, EX.suit) + exHead(x + 3, 30, 21, { dx: 5 }) + (opt.arm || exSw(x, 58, -20, 20, exCap(x, 58, 26, 10, EX.suitD) + exDot(x, 92, 6, EX.skin), t));
}
/* На четвереньках */
function exCrawler(t = 1.4) {
  const arm = (x, a, b, c) => exSw(x, 96, a, b, exCap(x, 96, 34, 11, c) + exDot(x, 136, 7, EX.skin), t);
  const leg = (x, a, b, c) => exSw(x, 96, a, b, exCap(x, 96, 18, 13, c) + exAt(x, 120, 76, exCap(x, 120, 22, 11, c) + exOval(x, 150, 7, 8, EX.skin)), t);
  return arm(148, 16, -18, EX.suitD) + leg(84, -18, 12, EX.suitD) + exOval(116, 90, 42, 18, EX.suit) + leg(88, 12, -18, EX.suit) + arm(152, -18, 16, EX.suit) + exHead(174, 70, 21, { dx: 6 });
}
const exTop = (armsA, armsB, t) => {
  const arm = (x, a, b) => exSw(x, 80, a, b, exCap(x, 80, 32, 12, EX.suitD) + exDot(x, 120, 8, EX.skin) + exHand(x, 108, 8), t || 2.8);
  return '<rect x="26" y="6" width="188" height="158" rx="24" fill="' + EX.mat + '"/>' + exAt(108, 134, 8, exCap(108, 134, 18, 13, EX.suit) + exOval(108, 162, 8, 7, EX.skin)) + exAt(132, 134, -8, exCap(132, 134, 18, 13, EX.suit) + exOval(132, 162, 8, 7, EX.skin)) +
    exOval(120, 104, 30, 38, EX.suit) + exHead(120, 48, 26, {}) + (armsA ? arm(97, armsA[0], armsA[1]) + arm(143, armsB[0], armsB[1]) : '');
};
const armsDown = () => exAt(96, 82, 18, exCap(96, 82, 34, 12, EX.suitD) + exDot(96, 122, 8, EX.skin)) + exAt(144, 82, -18, exCap(144, 82, 34, 12, EX.suitD) + exDot(144, 122, 8, EX.skin));

const EX_ART = {
  tummy: () => exMat() + exSl(0, 0, 0, -4, exRattle(214, 96), 1.6) + exProne(14, -16),
  chest: () => '<path d="M4 158C30 112 78 98 130 98c48 0 84 16 106 42v18z" fill="' + EX.sleeve + '"/>' + exDot(32, 88, 26, EX.skinD) + '<path d="M8 84c0-20 16-30 30-26 12 3 20 12 18 22-8-10-22-14-48 4z" fill="#8a6a54"/>' + exDot(40, 86, 3, EX.ink) + '<path d="M38 100q7 5 14 0" fill="none" stroke="' + EX.ink + '" stroke-width="2.400" stroke-linecap="round"/>' +
    exAt(172, 88, -82, exCap(172, 88, 26, 13, EX.suitD)) + exOval(136, 82, 38, 18, EX.suit) + exHand(134, 66, 12) + exSw(106, 78, -14, 14, exHead(86, 66, 21, { dx: -6 }), 3),
  bicycle: () => {
    const T = 2.8;
    return exMat() + exLimb(124, 112, 28, 25, -160, -112, 92, 16, EX.suitD, 'foot', T, -T / 2) + exBackBody(-55, -70, T) +
      exSw(128, 116, -160, -112, exCap(128, 116, 28, 14, EX.suit) + exSw(128, 144, 92, 16, exCap(128, 144, 25, 12, EX.suit) + exOval(134, 174, 12, 7, EX.skin) + exHand(128, 158, 11), T), T);
  },
  hug: () => exTop([100, -32], [-100, 32], 3),
  massage: () => exTop() + armsDown() + '<circle cx="120" cy="108" r="19" fill="none" stroke="#fff" stroke-width="2.500" stroke-dasharray="3 6" stroke-linecap="round"/>' + exSpin(120, 108, exHand(120, 89, 12)),
  track: () => exSl(-74, 0, 74, 0, exRattle(120, 22, EX.yellow), 3.4) + exHead(120, 118, 46, { noEyes: true }) + exDot(100, 112, 11, '#fff') + exDot(140, 112, 11, '#fff') + exSl(-6, 0, 6, 0, exDot(100, 112, 6, EX.ink) + exDot(140, 112, 6, EX.ink), 3.4) + '<path d="M108 136q12 9 24 0" fill="none" stroke="' + EX.ink + '" stroke-width="3" stroke-linecap="round"/>',
  grasp: () => {
    const finger = (x, d) => exSy(x, 88, 1, -.8, exCap(x, 58, 30, 12, EX.skin) + exDot(x, 56, 3.500, EX.skinD), 2.8, d);
    return exCap(120, 134, 40, 44, EX.suit) + exDot(120, 112, 31, EX.skin) + exSl(90, 0, 0, 0, '<rect x="112" y="96" width="156" height="24" rx="12" fill="' + EX.hand + '"/>', 2.8) + finger(98, 0) + finger(112, -.08) + finger(127, -.16) + finger(141, -.24) + exAt(94, 120, 150, exCap(94, 120, 26, 13, EX.skinD));
  },
  swipe: () => '<path d="M50 134Q50 22 130 22T210 134" fill="none" stroke="' + EX.sky + '" stroke-width="6" stroke-linecap="round"/>' + exMat() + exSw(120, 24, -14, 14, '<path d="M120 24v38" stroke="#b9a6d9" stroke-width="2.500"/>' + exDot(120, 72, 14, EX.yellow) + exDot(116, 68, 4, '#fff'), 2.2) +
    exLimb(126, 114, 26, 22, -128, -112, 60, 40, EX.suitD, 'foot', 2.2, 0) + exLimb(128, 116, 26, 22, -120, -106, 60, 30, EX.suit, 'foot', 2.2, -1) + exOval(92, 114, 40, 20, EX.suit) + exHead(46, 106, 24, { dy: -2 }) + exSw(80, 104, -176, -142, exCap(80, 104, 30, 11, EX.suitD) + exDot(80, 142, 7, EX.skin), 2.2),
  sound: () => exSw(120, 150, -9, 11, exHead(120, 104, 46, { dx: 8 }), 2.8) + exSw(216, 86, -16, 16, exRattle(216, 66), .5) + exPulse('<path d="M186 54q-10 12 0 24M176 44q-18 22 0 44" fill="none" stroke="' + EX.sky + '" stroke-width="3.500" stroke-linecap="round"/>', 1),
  lap: () => '<rect x="40" y="130" width="160" height="26" rx="13" fill="' + EX.sleeve + '"/>' + exSy(120, 130, 1, .86, exCap(110, 94, 34, 15, EX.suit) + exCap(130, 94, 34, 15, EX.suit) + exOval(108, 130, 13, 6, EX.skin) + exOval(132, 130, 13, 6, EX.skin), 1.5) +
    exSl(0, 0, 0, 7, exOval(120, 74, 25, 32, EX.suit) + exHead(120, 28, 22, {}) + exHand(92, 76, 12) + exHand(148, 76, 12), 1.5),
  tummyreach: () => exMat() + exSl(0, 0, 0, -4, exRattle(216, 100), 1.6) + exProne(-4, -12, { arms: exCap(140, 112, 14, 12, EX.suitD) + exAt(140, 127, -90, exCap(140, 127, 18, 11, EX.skin)) + exSw(148, 106, -68, -86, exCap(148, 106, 38, 11, EX.suit) + exDot(148, 150, 7, EX.skin), 2.4) , t: 2.4 }),
  pushup: () => exMat() + exAt(70, 118, 84, exCap(70, 118, 34, 13, EX.suitD) + exOval(70, 156, 7, 11, EX.skinD)) + exSw(70, 120, 0, -19, exOval(106, 112, 42, 19, EX.suit) + exSw(138, 110, 0, 19, exCap(138, 110, 24, 12, EX.suitD) + exDot(138, 140, 7, EX.skin), 2.6) + exSw(146, 104, 8, 19, exHead(166, 90, 24, { dx: 6 }), 2.6), 2.6),
  roll: () => '<rect x="26" y="6" width="188" height="158" rx="24" fill="' + EX.mat + '"/>' + exRattle(202, 70) + '<g class="flipA">' + exTop().replace(/<rect x="26"[^>]*>/, '') + armsDown() + exHand(146, 140, 12) + '</g><g class="flipB">' + exAt(108, 134, 8, exCap(108, 134, 18, 13, EX.suit)) + exAt(132, 134, -8, exCap(132, 134, 18, 13, EX.suit)) + exOval(120, 104, 30, 38, EX.suitD) + exDot(120, 48, 26, '#ffe6d6') + exAt(96, 82, 35, exCap(96, 82, 30, 12, EX.suit)) + exAt(144, 82, -35, exCap(144, 82, 30, 12, EX.suit)) + '</g>',
  feet: () => exMat() + exLimb(126, 112, 24, 22, -176, -160, 40, 70, EX.suitD, 'foot', 2.6, -.4) + exOval(92, 114, 40, 20, EX.suit) + exHead(46, 106, 24, { dy: -2 }) + exSw(128, 116, -176, -160, exCap(128, 116, 24, 14, EX.suit) + exSw(128, 140, 40, 70, exCap(128, 140, 22, 12, EX.suit) + exOval(134, 166, 12, 7, EX.skin), 2.6), 2.6) + exSw(82, 100, -118, -96, exCap(82, 100, 42, 11, EX.suitD) + exDot(82, 150, 7, EX.skin), 2.6),
  sit: () => exMat() + '<rect x="30" y="74" width="50" height="60" rx="22" fill="' + EX.sky + '" opacity=".55"/>' + exRattle(204, 100, EX.yellow) + exSitLegs() + exSw(100, 124, -4, 5, exSitBody(-58, -74, 3) + exHand(76, 102, 11) + exHand(124, 108, 11), 3),
  sitreach: () => exMat() + exBall(204, 118) + exSitLegs() + exSw(100, 124, -2, 22, exSitBody(-48, -82, 3), 3),
  transfer: () => exMat() + exAt(92, 126, 62, exCap(92, 126, 34, 14, EX.suit)) + exAt(148, 126, -62, exCap(148, 126, 34, 14, EX.suit)) + exOval(120, 98, 25, 34, EX.suit) + exHead(120, 46, 24, {}) + exSl(-30, 0, 30, 0, exBall(120, 106, 13), 2.8) +
    exSw(96, 80, 20, -18, exCap(96, 80, 26, 11, EX.suitD) + exDot(96, 112, 7, EX.skin), 2.8) + exSw(144, 80, 18, -20, exCap(144, 80, 26, 11, EX.suitD) + exDot(144, 112, 7, EX.skin), 2.8),
  pivot: () => '<rect x="26" y="6" width="188" height="158" rx="24" fill="' + EX.mat + '"/>' + exRattle(62, 36, EX.yellow) + exBall(186, 36, 13) + exRattle(190, 120) + exSw(120, 96, -32, 32, exAt(110, 124, 8, exCap(110, 124, 22, 13, EX.suit)) + exAt(130, 124, -8, exCap(130, 124, 22, 13, EX.suit)) + exOval(120, 96, 28, 36, EX.suitD) + exDot(120, 44, 25, '#ffe6d6') + exAt(98, 74, 142, exCap(98, 74, 28, 12, EX.suit)) + exAt(142, 74, -142, exCap(142, 74, 28, 12, EX.suit)), 3.6),
  crawl: () => exGround() + exGo(-50, 0, 40, 0, exCrawler()) + exRattle(216, 112),
  obstacle: () => exGround() + '<path d="M86 146c10-34 70-34 84 0z" fill="' + EX.sky + '" opacity=".6"/>' + exGo(-74, 0, 44, 0, exSl(0, 0, 0, -18, exCrawler(), 2.5), 5),
  pullstand: () => exGround() + '<rect x="146" y="72" width="80" height="74" rx="14" fill="' + EX.sky + '"/><rect x="138" y="62" width="92" height="20" rx="10" fill="#8ccbff"/>' + exSl(0, 34, 0, 0, exStand({ x: 110, t: 3, legs: [-62, 0, 118, 0], legs2: [-56, 0, 112, 0], arm: exSw(110, 58, -82, -72, exCap(110, 58, 26, 10, EX.suitD) + exDot(110, 92, 6, EX.skin), 3) }), 3),
  squat: () => exGround() + exBall(170, 132, 13) + exSl(0, 0, 0, 34, exStand({ x: 106, t: 3, legs: [0, -62, 0, 118], legs2: [0, -56, 0, 112], arm: exSw(106, 58, -18, -62, exCap(106, 58, 26, 10, EX.suitD) + exDot(106, 92, 6, EX.skin), 3) }), 3),
  cruise: () => exGround() + '<rect x="20" y="60" width="200" height="86" rx="16" fill="' + EX.sky + '"/><rect x="14" y="50" width="212" height="20" rx="10" fill="#8ccbff"/>' + exSl(-40, 0, 40, 0, exCap(106, 96, 24, 14, EX.suit) + exCap(134, 96, 24, 14, EX.suit) + exOval(106, 134, 11, 11, EX.skin) + exOval(134, 134, 11, 11, EX.skin) + exOval(120, 80, 23, 28, EX.suit) + exHead(120, 34, 21, { noEyes: true }) + exAt(100, 62, 120, exCap(100, 62, 18, 10, EX.suitD)) + exAt(140, 62, -120, exCap(140, 62, 18, 10, EX.suitD)), 3.8),
  pushcar: () => exGround() + exGo(-60, 0, 40, 0, exStand({ x: 92, t: 1.2, arm: exAt(92, 58, -78, exCap(92, 58, 34, 10, EX.suitD) + exDot(92, 100, 6, EX.skin)) }) + '<rect x="136" y="86" width="50" height="40" rx="9" fill="' + EX.yellow + '"/><path d="M132 62l6 30" stroke="' + EX.wood + '" stroke-width="6" stroke-linecap="round"/>' + exDot(146, 134, 11, EX.ink) + exDot(178, 134, 11, EX.ink), 5),
  walk: () => exGround() + exGo(-70, 0, 60, 0, exStand({ x: 100, t: 1.1, arm: exSw(100, 58, -112, -92, exCap(100, 58, 26, 10, EX.suitD) + exDot(100, 92, 6, EX.skin), 1.1) }), 5),
  kick: () => exGround() + exSl(0, 0, 54, -12, exBall(164, 131), 1.8) + exLimb(100, 92, 25, 21, 0, 0, 0, 0, EX.suitD, 'foot', 1.8, 0) + exLimb(106, 92, 25, 21, 14, -46, 26, 6, EX.suit, 'foot', 1.8, 0) + exOval(104, 72, 19, 27, EX.suit) + exHead(107, 30, 21, { dx: 5 }) + exSw(104, 58, 10, -30, exCap(104, 58, 26, 10, EX.suitD) + exDot(104, 92, 6, EX.skin), 1.8),
  climb: () => '<path d="M20 146L210 76v70z" fill="' + EX.sky + '" opacity=".55"/>' + exGround() + exGo(-44, 22, 32, -34, exAt(116, 110, -19, exCrawler()), 5),
  dance: () => exGround() + exSw(116, 146, -6, 6, exLimb(106, 92, 25, 21, 8, -8, 10, 18, EX.suitD, 'foot', 1, 0) + exLimb(126, 92, 25, 21, -8, 8, 18, 10, EX.suit, 'foot', 1, 0) + exOval(116, 72, 22, 28, EX.suit) + exHead(116, 30, 21, {}) + exSw(96, 58, 128, 158, exCap(96, 58, 26, 10, EX.suitD) + exDot(96, 92, 6, EX.skin), 1) + exSw(136, 58, -128, -158, exCap(136, 58, 26, 10, EX.suitD) + exDot(136, 92, 6, EX.skin), 1), 1) + exPulse('<path d="M196 40v28" stroke="' + EX.pink + '" stroke-width="4" stroke-linecap="round"/>' + exOval(190, 70, 8, 6, EX.pink) + '<path d="M44 62v24" stroke="' + EX.sky + '" stroke-width="4" stroke-linecap="round"/>' + exOval(38, 88, 8, 6, EX.sky), 1),
  clap: () => exMat() + exOval(120, 98, 26, 36, EX.suit) + exHead(120, 44, 24, {}) + exSw(94, 80, 62, -46, exCap(94, 80, 30, 11, EX.suitD) + exDot(94, 118, 8, EX.skin), .9) + exSw(146, 80, -62, 46, exCap(146, 80, 30, 11, EX.suitD) + exDot(146, 118, 8, EX.skin), .9),
  pincer: () => exAt(146, 118, 168, exCap(146, 118, 20, 13, EX.skinD)) + exAt(158, 124, 150, exCap(158, 124, 16, 12, EX.skinD)) + exCap(122, 150, 30, 46, EX.suit) + exOval(122, 130, 36, 28, EX.skin) + exDot(120, 66, 9, EX.yellow) + exDot(117, 63, 3, '#fff') + exSw(96, 120, 172, 207, exCap(96, 120, 46, 15, EX.skin), 2.4) + exSw(138, 112, 195, 157, exCap(138, 112, 42, 14, EX.skin), 2.4),
  stack: () => exGround() + '<rect x="94" y="110" width="52" height="36" rx="8" fill="' + EX.pink + '"/><rect x="100" y="76" width="42" height="34" rx="8" fill="' + EX.sky + '"/>' + exSl(0, -32, 0, 0, '<rect x="104" y="44" width="36" height="32" rx="7" fill="' + EX.yellow + '"/>', 2.6) + exSl(40, -32, 14, 0, exDot(164, 58, 14, EX.skin), 2.6),
};
Art.ex = (anim, still) => '<svg class="ex-art' + (still ? ' still' : '') + '" viewBox="0 0 240 170" aria-hidden="true"><rect width="240" height="170" rx="24" fill="var(--ex-bg)"/>' + (EX_ART[anim] || EX_ART.tummy)() + '</svg>';

/* Обложки сказок */
const TALE_ART = {
  repka: '<path d="M32 22c13 0 22 10 22 21 0 12-11 16-16 22-3 3-3 6-6 6s-3-3-6-6c-5-6-16-10-16-22 0-11 9-21 22-21z" fill="#ffe0a3"/><path d="M12 38c5-10 12-16 20-16 8 0 15 6 20 16-12-5-28-5-40 0z" fill="#d57fe0"/><path d="M32 22c-4-10-12-15-20-14 2 8 9 15 20 14zM32 22c4-11 12-16 20-15-2 9-9 16-20 15zM32 22c-3-8-1-15 3-19 3 6 3 14-3 19z" fill="#5fc46b"/>',
  hen: '<ellipse cx="32" cy="40" rx="21" ry="17" fill="#fff"/><circle cx="46" cy="24" r="10" fill="#fff"/><path d="M42 15c0-6 4-8 5-4 2-4 6-1 4 3 3 0 3 4 0 5z" fill="#ff6b6b"/><path d="M55 24l7 3-7 3z" fill="#ffb347"/><circle cx="48" cy="22" r="1.800" fill="#43345f"/><path d="M12 36C6 32 4 26 6 21c5 2 8 6 9 10z" fill="#e6dcf5"/><circle cx="24" cy="38" r="3" fill="#c9bbe6"/><circle cx="32" cy="46" r="3" fill="#c9bbe6"/><ellipse cx="20" cy="56" rx="8" ry="6" fill="#ffc83d"/>',
  kolobok: '<circle cx="32" cy="34" r="24" fill="#ffc83d"/><circle cx="24" cy="30" r="3" fill="#7a4a00"/><circle cx="40" cy="30" r="3" fill="#7a4a00"/><path d="M22 41q10 9 20 0" fill="none" stroke="#7a4a00" stroke-width="3" stroke-linecap="round"/><circle cx="17" cy="38" r="4" fill="#ff9d5c" opacity=".7"/><circle cx="47" cy="38" r="4" fill="#ff9d5c" opacity=".7"/>',
  house: '<path d="M10 30 32 8l22 22z" fill="#ff6b6b"/><rect x="15" y="30" width="34" height="28" rx="3" fill="#e6b27a"/><rect x="27" y="40" width="11" height="18" rx="3" fill="#8a5a33"/><rect x="18" y="35" width="8" height="8" rx="2" fill="#bfe6ff"/><rect x="40" y="35" width="7" height="8" rx="2" fill="#bfe6ff"/>',
  mitten: '<path d="M20 12h20c8 0 12 7 12 15v16c0 7-5 13-12 13H26c-8 0-13-6-13-13v-8c-4-1-7-4-7-9 0-6 7-8 11-4l3 3v-3C20 16 20 12 20 12z" fill="#ff85b3"/><path d="M13 50h40" stroke="#fff" stroke-width="4"/><circle cx="32" cy="26" r="3" fill="#fff"/><circle cx="42" cy="34" r="3" fill="#fff"/><circle cx="25" cy="38" r="3" fill="#fff"/>',
  bear: '<circle cx="14" cy="18" r="9" fill="#a8744a"/><circle cx="50" cy="18" r="9" fill="#a8744a"/><circle cx="32" cy="35" r="24" fill="#b98258"/><ellipse cx="32" cy="43" rx="11" ry="9" fill="#efd3b4"/><circle cx="23" cy="30" r="3" fill="#43345f"/><circle cx="41" cy="30" r="3" fill="#43345f"/><ellipse cx="32" cy="39" rx="4" ry="3" fill="#43345f"/><path d="M32 42v4" stroke="#43345f" stroke-width="2"/>',
  hut: '<path d="M8 32 32 10l24 22z" fill="#a8744a"/><rect x="13" y="32" width="38" height="26" fill="#d9a866"/><path d="M13 39h38M13 46h38M13 53h38" stroke="#b98642" stroke-width="2"/><rect x="26" y="40" width="12" height="18" rx="2" fill="#8a5a33"/>',
  moon: '<path d="M41 6a26 26 0 1 0 17 40A22 22 0 0 1 41 6z" fill="#ffe08a"/><path d="M19 30q4 4 8 0" fill="none" stroke="#8a6200" stroke-width="2.400" stroke-linecap="round"/><path d="M21 42q5 4 9 0" fill="none" stroke="#8a6200" stroke-width="2.400" stroke-linecap="round"/>',
  cloud: '<path d="M15 50a13 13 0 0 1-2-26 17 17 0 0 1 32-5 13 13 0 0 1 11 21 10 10 0 0 1-7 10z" fill="#bfe6ff"/><path d="M22 34q3 3 6 0M36 34q3 3 6 0" fill="none" stroke="#43345f" stroke-width="2.200" stroke-linecap="round"/><path d="M29 41q3 2 6 0" fill="none" stroke="#43345f" stroke-width="2.200" stroke-linecap="round"/>',
  star: '<g transform="scale(2.667)"><path d="' + STAR_PATH + '" fill="#ffc83d" stroke="#ffc83d" stroke-width="2" stroke-linejoin="round"/></g><circle cx="26" cy="31" r="2" fill="#7a4a00"/><circle cx="38" cy="31" r="2" fill="#7a4a00"/><path d="M27 38q5 4 10 0" fill="none" stroke="#7a4a00" stroke-width="2.200" stroke-linecap="round"/>',
};
Art.tale = id => artSvg('0 0 64 64', TALE_ART[id] || TALE_ART.star, 'tale');
