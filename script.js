// PaletteLens: checks a colour palette for contrast and colour-blindness.

const LIMIT = 20; // colour difference (delta E) below this = "may be confused". A rule of thumb, tune it.

// Colour-blindness matrices from Machado et al. (2009), applied to linear RGB.
const MODES = {
  'Typical colour vision': null,
  'Protanopia (red-blind)': [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
  'Deuteranopia (green-blind)': [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.01182, 0.04294, 0.968881]],
  'Tritanopia (blue-blind)': [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.3039]]
};

const $ = s => document.querySelector(s);

/* ---------- Colour maths (small pure functions) ---------- */
const hexToRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const rgbToHex = rgb => '#' + rgb.map(v => v.toString(16).padStart(2, '0')).join('');

// sRGB (0-255) -> linear light (0-1), and back
const toLinear = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const toSrgb = c => {
  c = Math.min(1, Math.max(0, c));
  return Math.round(255 * (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055));
};

// How a colour looks under a given vision type
function simulate(hex, matrix) {
  const rgb = hexToRgb(hex);
  if (!matrix) return rgb;
  const lin = rgb.map(toLinear);
  return matrix.map(row => toSrgb(row[0] * lin[0] + row[1] * lin[1] + row[2] * lin[2]));
}

// WCAG contrast ratio: (lighter + 0.05) / (darker + 0.05)
const luminance = rgb => { const [r, g, b] = rgb.map(toLinear); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
const ink = rgb => (contrast(rgb, [0, 0, 0]) > contrast(rgb, [255, 255, 255]) ? '#000' : '#fff');

// Perceived difference between two colours: distance in CIE Lab space
function toLab(rgb) {
  const [r, g, b] = rgb.map(toLinear);
  const x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047;
  const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
  const f = t => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
}
function deltaE(a, b) {
  const [A, B] = [toLab(a), toLab(b)];
  return Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]);
}

function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return rgbToHex([f(0), f(8), f(4)].map(v => Math.round(v * 255)));
}

/* ---------- State ---------- */
let colors = ['#1d3557', '#c62828', '#2e7d32', '#f9a825', '#f1faee'];

// A palette can be shared as a link, e.g. index.html#1d3557-c62828-2e7d32-f9a825-f1faee
const saved = location.hash.slice(1).split('-');
if (saved.length === 5 && saved.every(h => /^[0-9a-f]{6}$/i.test(h))) colors = saved.map(h => '#' + h.toLowerCase());

/* ---------- Build the controls once ---------- */
$('#palette').innerHTML = colors.map((c, i) =>
  `<label><input type="color" value="${c}" data-i="${i}"><span>Colour ${i + 1}</span></label>`).join('');
['#fg', '#bg'].forEach(id => colors.forEach((_, i) => $(id).add(new Option('Colour ' + (i + 1), i))));
$('#bg').value = 4;

/* ---------- Re-draw everything when something changes ---------- */
function update() {
  try { history.replaceState(null, '', '#' + colors.map(c => c.slice(1)).join('-')); } catch (e) { /* some browsers block this on local files */ }

  // 1. The palette as seen under each vision type
  const sims = Object.entries(MODES).map(([name, m]) => [name, colors.map(c => simulate(c, m))]);
  $('#vision').innerHTML = sims.map(([name, list]) => `
    <div class="row"><h3>${name}</h3><div class="strip">${list.map(rgb =>
      `<span class="sw" style="background:${rgbToHex(rgb)};color:${ink(rgb)}">${rgbToHex(rgb)}</span>`).join('')}</div></div>`).join('');

  // 2. Pairs of colours that become hard to tell apart
  const warn = [];
  sims.forEach(([name, list]) => list.forEach((a, i) => list.slice(i + 1).forEach((b, k) => {
    const d = deltaE(a, b);
    if (d < LIMIT) warn.push(`Colour ${i + 1} and colour ${i + k + 2} look alike with ${name} (difference ${Math.round(d)}).`);
  })));
  $('#warnings').innerHTML = warn.length
    ? warn.map(w => `<li>${w}</li>`).join('')
    : '<li class="ok">No confusing pairs found. Nice palette.</li>';

  // 3. Text contrast
  const fgHex = colors[$('#fg').value], bgHex = colors[$('#bg').value];
  const r = contrast(hexToRgb(fgHex), hexToRgb(bgHex));
  $('#preview').style.cssText = `color:${fgHex};background:${bgHex}`;
  $('#ratio').textContent = `Contrast ratio: ${r.toFixed(2)} to 1`;
  $('#chips').innerHTML = [['AA text', 4.5], ['AA large text', 3], ['AAA text', 7]].map(([n, min]) =>
    `<li class="${r >= min ? 'pass' : 'fail'}">${r >= min ? '✓ Pass' : '✗ Fail'} ${n} (${min}:1)</li>`).join('');
}

/* ---------- Events ---------- */
// One listener on the parent handles all five colour inputs (event delegation)
$('#palette').addEventListener('input', e => { colors[e.target.dataset.i] = e.target.value; update(); });
$('#fg').onchange = $('#bg').onchange = update;

$('#random').onclick = () => {
  colors = colors.map(() => hslToHex(Math.random() * 360, 50 + Math.random() * 30, 35 + Math.random() * 35));
  document.querySelectorAll('#palette input').forEach((el, i) => { el.value = colors[i]; });
  update();
};

$('#copy').onclick = async e => {
  const btn = e.currentTarget;
  const css = ':root {\n' + colors.map((c, i) => `  --colour-${i + 1}: ${c};`).join('\n') + '\n}';
  try { await navigator.clipboard.writeText(css); btn.textContent = 'Copied ✓'; } catch (err) { btn.textContent = 'Copy blocked by browser'; }
  setTimeout(() => { btn.textContent = 'Copy as CSS variables'; }, 1500);
};

update();