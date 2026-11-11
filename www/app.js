'use strict';
// ---------- Müzik verisi ----------
const OPEN_MIDI = [64, 59, 55, 50, 45, 40]; // 1. tel (ince Mi) ... 6. tel (kalın Mi)
const NAMES_EN = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const NAMES_TR = ['Do', 'Do♯', 'Re', 'Re♯', 'Mi', 'Fa', 'Fa♯', 'Sol', 'Sol♯', 'La', 'La♯', 'Si'];
const FLAT_TR = ['Do', 'Re♭', 'Re', 'Mi♭', 'Mi', 'Fa', 'Sol♭', 'Sol', 'La♭', 'La', 'Si♭', 'Si'];
const NATURAL = [0, 2, 4, 5, 7, 9, 11];
const isNatural = pc => NATURAL.includes(pc);
const midi = (s, f) => OPEN_MIDI[s] + f;
const pcOf = (s, f) => midi(s, f) % 12;
let naming = 'tr';
const nameOf = pc => (naming === 'tr' ? NAMES_TR : NAMES_EN)[pc];
const nameBoth = pc => isNatural(pc) ? nameOf(pc) : `${nameOf(pc)} / ${FLAT_TR[pc]}`;

// ---------- Seviyeler ----------
const LEVELS = [
  { t: '1. Açık teller', d: 'Altı açık tel: Mi La Re Sol Si Mi. İpucu: kalından inceye "Mi-La-Re-Sol-Si-Mi".', strings: [0, 1, 2, 3, 4, 5], frets: [0, 0], nat: true },
  { t: '2. İnce teller (1-2) · 0-3. perde', d: '1. tel: Mi(0), Fa(1), Sol(3). 2. tel: Si(0), Do(1), Re(3).', strings: [0, 1], frets: [0, 3], nat: true },
  { t: '3. Orta teller (3-4) · 0-3. perde', d: '3. tel: Sol(0), La(2). 4. tel: Re(0), Mi(2), Fa(3).', strings: [2, 3], frets: [0, 3], nat: true },
  { t: '4. Kalın teller (5-6) · 0-3. perde', d: '5. tel: La(0), Si(2), Do(3). 6. tel: Mi(0), Fa(1), Sol(3).', strings: [4, 5], frets: [0, 3], nat: true },
  { t: '5. Tüm teller · 0-3. perde', d: 'Birinci pozisyon doğal notalar. Mi-Fa ve Si-Do arası 1 perde, diğerleri 2 perde.', strings: [0, 1, 2, 3, 4, 5], frets: [0, 3], nat: true },
  { t: '6. Tüm teller · 0-5. perde', d: '5. perde ipucu: 5. perdedeki nota, bir alttaki telin boş sesidir (3. telde 4. perde).', strings: [0, 1, 2, 3, 4, 5], frets: [0, 5], nat: true },
  { t: '7. Tüm tahta · 0-12. perde (doğal)', d: '12. perde = açık telin bir oktav üstü. Tüm doğal notalar.', strings: [0, 1, 2, 3, 4, 5], frets: [0, 12], nat: true },
  { t: '8. Diyezli · 1-2. teller · 0-5. perde', d: '♯ bir perde ileri, ♭ bir perde geri. Mi–Fa ve Si–Do arasında diyez yoktur.', strings: [0, 1], frets: [0, 5], nat: false },
  { t: '9. Diyezli · 3-4. teller · 0-5. perde', d: 'Aynı notanın iki adı vardır: Do♯ = Re♭, Fa♯ = Sol♭.', strings: [2, 3], frets: [0, 5], nat: false },
  { t: '10. Diyezli · 5-6. teller · 0-5. perde', d: 'Kalın tellerde diyez ve bemoller (0-5. perde).', strings: [4, 5], frets: [0, 5], nat: false },
  { t: '11. Diyezli · tüm teller · 0-5. perde', d: 'Tüm tellerde ilk 5 perde, diyezli notalar dahil.', strings: [0, 1, 2, 3, 4, 5], frets: [0, 5], nat: false },
  { t: '12. Tüm tahta · diyez dahil', d: 'Tüm tel ve perdeler (0-12), 12 notanın tamamı.', strings: [0, 1, 2, 3, 4, 5], frets: [0, 12], nat: false },
  { t: '★ Özel: kendin seç', d: 'Aşağıdan telleri, perde aralığını ve diyezleri kendin seç.', custom: true, strings: [0, 1, 2, 3, 4, 5], frets: [0, 5], nat: true },
];
Object.assign(LEVELS[LEVELS.length - 1], JSON.parse(localStorage.getItem('gn_custom') || '{}'));
let level = Math.min(+(localStorage.getItem('gn_level') || 0), LEVELS.length - 1);
const levelPositions = () => {
  const L = LEVELS[level], out = [];
  for (const s of L.strings) for (let f = L.frets[0]; f <= L.frets[1]; f++)
    if (!L.nat || isNatural(pcOf(s, f))) out.push({ s, f });
  return out;
};

// ---------- İlerleme ----------
let stats = JSON.parse(localStorage.getItem('gn_stats') || '{}');
const saveStats = () => localStorage.setItem('gn_stats', JSON.stringify(stats));
const BOX_DAYS = [0, 1, 2, 4, 8];
function record(s, f, ok) {
  const k = s + '-' + f;
  stats[k] = stats[k] || { r: 0, w: 0, box: 0, due: 0 };
  const e = stats[k];
  e[ok ? 'r' : 'w']++;
  e.box = ok ? Math.min((e.box || 0) + 1, 4) : 0;
  e.due = Date.now() + BOX_DAYS[e.box] * 864e5;
  saveStats();
  if (navigator.vibrate) navigator.vibrate(ok ? 25 : [50, 40, 50]);
}
function flashPos(s, f) {
  mark(s, f, 'target', nameOf(pcOf(s, f)));
  setTimeout(() => { const g = posEl(s, f); if (g && g.classList.contains('target')) { g.classList.remove('target'); g.querySelector('text').textContent = ''; } }, 1300);
}

// ---------- Ses (Süre Kontrollü Karplus-Strong Gitar Sentezi + iOS Safari Ses Kilidi Açıcı) ----------
let actx, iosUnlocked = false;
const ksCache = {};
function ensureAudioCtx() {
  if ('audioSession' in navigator) {
    try {
      navigator.audioSession.type = (typeof micStream !== 'undefined' && micStream) ? 'play-and-record' : 'auto';
    } catch (e) { }
  }
  actx = actx || new (window.AudioContext || window.webkitAudioContext)();
  if (actx.state === 'suspended' || actx.state === 'interrupted') {
    try { actx.resume(); } catch (e) { }
  }
  if (!iosUnlocked && actx) {
    try {
      const b = actx.createBuffer(1, 1, 22050), s = actx.createBufferSource();
      s.buffer = b; s.connect(actx.destination); s.start(0);
      iosUnlocked = true;
    } catch (e) { }
  }
  return actx;
}
['touchstart', 'touchend', 'click', 'keydown'].forEach(ev => {
  window.addEventListener(ev, () => {
    if (actx && actx.state !== 'running') {
      try { actx.resume(); } catch (e) { }
    }
  }, { passive: true });
});

function playMidi(m, when, durSec) {
  ensureAudioCtx();
  const tStart = when || actx.currentTime;
  const dur = durSec || 1.35;
  if (!ksCache[m]) {
    const sr = actx.sampleRate, f = 440 * Math.pow(2, (m - 69) / 12), n = Math.round(sr / f), len = Math.floor(sr * 3.2);
    const ab = actx.createBuffer(1, len, sr), d = ab.getChannelData(0), line = new Float32Array(n);
    for (let i = 0; i < n; i++) line[i] = Math.random() * 2 - 1;
    let p = 0;
    for (let i = 0; i < len; i++) {
      const nx = (p + 1) % n;
      d[i] = line[p] * 0.68;
      line[p] = (line[p] + line[nx]) * 0.5 * 0.9968;
      p = nx;
    }
    ksCache[m] = ab;
  }
  const src = actx.createBufferSource(), g = actx.createGain();
  src.buffer = ksCache[m];
  const hold = Math.max(0.06, Math.min(2.9, dur * 0.92));
  const stopAt = Math.min(tStart + 3.15, tStart + hold + 0.09);
  g.gain.setValueAtTime(0.95, tStart);
  g.gain.setValueAtTime(0.92, tStart + hold);
  g.gain.exponentialRampToValueAtTime(0.001, stopAt);
  src.connect(g).connect(actx.destination);
  src.start(tStart);
  src.stop(stopAt + 0.01);
}

// ---------- Tahta (SVG — Dikey Mobil & Yatay Tablet/Masaüstü Çapraz Platform) ----------
const board = document.getElementById('board');
let FRETS = 12;
let boardOrient = localStorage.getItem('gn_orient') || 'auto'; // 'auto' | 'v' | 'h'
const vertical = () => boardOrient === 'v' ? true : boardOrient === 'h' ? false : window.innerWidth < 768;
let isV = vertical();
const getX0 = () => isV ? 68 : 86;
const getScale = () => isV ? (FRETS <= 6 ? 1160 : 790) : 1760;
const fretX = n => getX0() + getScale() * (1 - Math.pow(2, -n / 12));
const posA = f => f === 0 ? (isV ? 39 : 54) : (fretX(f - 1) + fretX(f)) / 2;
const crossC = s => isV ? 52 + (5 - s) * 43 : 30 + s * 38;
const pt = (a, c) => isV ? { x: c, y: a } : { x: a, y: c };
const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs, parent) => {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  (parent || board).appendChild(e); return e;
};
let onPosClick = () => { };
function drawBoard() {
  isV = vertical();
  const X0 = getX0();
  const len = fretX(FRETS) + (isV && FRETS > 7 ? 32 : 48);
  board.setAttribute('viewBox', isV ? `0 0 312 ${len}` : `0 0 ${len} 276`);
  board.innerHTML = '';
  const ob = document.getElementById('orientBtn');
  if (ob) ob.textContent = isV ? '📏 Dikey' : '📏 Yatay';

  const c0 = crossC(isV ? 5 : 0) - 18, c1 = crossC(isV ? 0 : 5) + 18;
  const line = (a1, c1_, a2, c2, attrs) => { const p = pt(a1, c1_), q = pt(a2, c2); el('line', { x1: p.x, y1: p.y, x2: q.x, y2: q.y, ...attrs }); };

  // Koyu abanoz klavye yatağı
  const bedPos = pt(X0 - 4, c0);
  const bedSize = isV ? { width: c1 - c0, height: fretX(FRETS) - X0 + 8 } : { width: fretX(FRETS) - X0 + 8, height: c1 - c0 };
  el('rect', { x: bedPos.x, y: bedPos.y, ...bedSize, fill: '#18191c', stroke: '#35363b', 'stroke-width': 1.8, rx: 6 });

  // Perde aralıklarını hafif zebra tonlamasıyla belirginleştir
  for (let n = 1; n <= FRETS; n++) {
    const a0 = n === 1 ? X0 + 4 : fretX(n - 1);
    const a1 = fretX(n);
    if ([3, 5, 7, 9, 12].includes(n)) {
      const fp = pt(a0, c0 + 1);
      const fs = isV ? { width: c1 - c0 - 2, height: a1 - a0 } : { width: a1 - a0, height: c1 - c0 - 2 };
      el('rect', { x: fp.x, y: fp.y, ...fs, fill: 'rgba(255, 198, 101, 0.035)' });
    }
  }

  // Sedef kakmalar (Inlays — perde tellerinin altında)
  const mid = (crossC(0) + crossC(5)) / 2, q1 = (crossC(1) + crossC(2)) / 2, q2 = (crossC(3) + crossC(4)) / 2;
  const dot = (a, c) => { const p = pt(a, c); el('circle', { cx: p.x, cy: p.y, r: 7, fill: '#4a443b', stroke: '#9d8f7c', 'stroke-width': 1.2, opacity: '0.85' }); };
  for (const n of [3, 5, 7, 9]) if (n <= FRETS) dot(posA(n), mid);
  if (FRETS >= 12) { dot(posA(12), q1); dot(posA(12), q2); }

  // Üst eşik (Kemik / Nut)
  const nut = pt(X0 - 4, c0), nutS = isV ? { width: c1 - c0, height: 8 } : { width: 8, height: c1 - c0 };
  el('rect', { x: nut.x, y: nut.y, ...nutS, fill: '#ebd8be', stroke: '#9d8f7c', 'stroke-width': 1, rx: 2 });

  // Perdeler (Metalik Fret Telleri) ve Perde Numaraları
  for (let n = 1; n <= FRETS; n++) {
    const fa = fretX(n);
    const fwPos = pt(fa - 1.75, c0);
    const fwSize = isV ? { width: c1 - c0, height: 3.5 } : { width: 3.5, height: c1 - c0 };
    el('rect', { x: fwPos.x, y: fwPos.y, ...fwSize, fill: '#8e806d', rx: 1 });
    line(fa - 0.4, c0 + 1, fa - 0.4, c1 - 1, { stroke: '#e8dec8', 'stroke-width': 1.3, opacity: '0.9' });

    const isKeyFret = [3, 5, 7, 9, 12].includes(n);
    const fCol = isKeyFret ? '#ffc665' : '#c7b8a3';
    if (isV) {
      const py = posA(n);
      el('rect', { x: 2, y: py - 10, width: 26, height: 20, rx: 6, fill: isKeyFret ? 'rgba(255,198,101,0.16)' : '#1f1f23', stroke: isKeyFret ? 'rgba(255,198,101,0.4)' : '#2d2e34', 'stroke-width': 1 });
      const tl = el('text', { x: 15, y: py, fill: fCol, 'font-family': 'Space Grotesk, sans-serif', 'font-size': 11.5, 'font-weight': '800', 'text-anchor': 'middle', 'dominant-baseline': 'central' });
      tl.textContent = `${n}P`;
      const tr = el('text', { x: c1 + 14, y: py, fill: fCol, 'font-family': 'Space Grotesk, sans-serif', 'font-size': 12, 'font-weight': '700', 'text-anchor': 'middle', 'dominant-baseline': 'central' });
      tr.textContent = n;
    } else {
      const px = posA(n), py = c1 + 18;
      el('rect', { x: px - 14, y: py - 10, width: 28, height: 20, rx: 6, fill: isKeyFret ? 'rgba(255,198,101,0.16)' : '#1f1f23', stroke: isKeyFret ? 'rgba(255,198,101,0.4)' : '#2d2e34', 'stroke-width': 1 });
      const t = el('text', { x: px, y: py, fill: fCol, 'font-family': 'Space Grotesk, sans-serif', 'font-size': 11.5, 'font-weight': '800', 'text-anchor': 'middle', 'dominant-baseline': 'central' });
      t.textContent = `${n}P`;
    }
  }

  // Teller (3 şeffaf naylon, 3 sarımlı bronz)
  const OPEN_LABEL = ['1·Mi', '2·Si', '3·Sol', '4·Re', '5·La', '6·Mi'];
  for (let s = 0; s < 6; s++) {
    const strCol = s < 3 ? '#e2e8f0' : '#c8a870';
    const strOp = s < 3 ? '0.88' : '0.95';
    line(X0, crossC(s), fretX(FRETS), crossC(s), { stroke: strCol, opacity: strOp, 'stroke-width': 1.4 + s * 0.5, 'stroke-linecap': 'round' });
    const p = pt(isV ? 14 : 18, crossC(s));
    const t = el('text', { x: p.x, y: p.y, fill: s < 2 ? '#ffc665' : '#d4c4b0', 'font-family': 'Space Grotesk, sans-serif', 'font-size': 10.5, 'font-weight': '700', 'text-anchor': 'middle', 'dominant-baseline': 'central' });
    t.textContent = OPEN_LABEL[s];
  }

  // Nota pozisyon daireleri
  const rCircle = (isV && FRETS > 7) ? 13.5 : 17.5;
  for (let s = 0; s < 6; s++) for (let f = 0; f <= FRETS; f++) {
    const g = el('g', { class: 'pos', 'data-s': s, 'data-f': f });
    const p = pt(posA(f), crossC(s));
    el('circle', { cx: p.x, cy: p.y, r: rCircle }, g);
    const t = el('text', { x: p.x, y: p.y }, g); t.textContent = '';
    g.addEventListener('click', () => onPosClick(s, f));
  }
}
const posEl = (s, f) => board.querySelector(`.pos[data-s="${s}"][data-f="${f}"]`);
function hideNotePopover() {
  const pop = document.getElementById('notePopover');
  if (pop) { pop.hidden = true; pop.innerHTML = ''; }
}
function clearMarks() {
  hideNotePopover();
  board.onclick = null;
  board.querySelectorAll('.pos').forEach(g => {
    g.setAttribute('class', 'pos');
    const tx = g.querySelector('text');
    tx.textContent = '';
    tx.removeAttribute('style');
    g.querySelector('circle').removeAttribute('style');
  });
  board.querySelectorAll('.fretMuteMark').forEach(e => e.remove());
}
function mark(s, f, cls, label) {
  const g = posEl(s, f); if (!g) return;
  g.classList.add(cls);
  if (label !== undefined) {
    const t = g.querySelector('text');
    const c = g.querySelector('circle');
    const cx = +c.getAttribute('cx'), cy = +c.getAttribute('cy');
    const pc = pcOf(s, f);
    // Çift satırlı (G / Sol) gösterim: eğer standart nota adıysa üstte harf, altta solfej göster
    if (label === nameOf(pc) && label !== '?' && label !== 'O') {
      const en = NAMES_EN[pc], tr = NAMES_TR[pc];
      t.innerHTML = `<tspan x="${cx}" dy="-3.5" font-size="11.5px" font-weight="800">${en}</tspan><tspan x="${cx}" dy="10.5" font-size="9.5px" font-weight="700" opacity="0.9">${tr}</tspan>`;
    } else if (label === '?') {
      t.innerHTML = `<tspan x="${cx}" dy="-3" font-size="13px" font-weight="900">?</tspan><tspan x="${cx}" dy="10" font-size="8px" font-weight="800">SEÇ</tspan>`;
    } else {
      t.textContent = label;
      t.style.fontSize = label.length > 2 ? '11.5px' : '';
    }
  }
}

// ---------- Durum ve UI ----------
const $ = id => document.getElementById(id);
let mode = 'learn', current = null, correct = 0, total = 0, streak = 0, micTimer = null;
let blitzSec = 0, blitzTimer = null, practiceSub = localStorage.getItem('gn_prac_sub') || 'daily10';
const setFb = (msg, cls) => { $('feedback').textContent = msg; $('feedback').className = cls || ''; };

function hint(s, f) {
  const open = nameOf(pcOf(s, 0));
  return f === 0 ? `${s + 1}. tel boş: ${open}` : `${s + 1}. tel boş ${open} → ${f}. perde = ${nameBoth(pcOf(s, f))}`;
}

function updScore() {
  const sc = $('score');
  if (!total && !streak && !blitzSec) { sc.innerHTML = ''; return; }
  const pct = total ? Math.round(100 * correct / total) : 0;
  const tHtml = blitzSec > 0 ? `<span class="bdg timer">⏱ ${blitzSec}sn</span>` : '';
  sc.innerHTML = `<div class="badges">${tHtml}<span class="bdg">✓ ${correct}/${total} (${pct}%)</span><span class="bdg fire">🔥 ${streak}</span></div>`;
}

function stopBlitz() { clearInterval(blitzTimer); blitzTimer = null; blitzSec = 0; }

const MODE_LABELS = {
  learn: 'KLAVYE & ÖĞREN',
  chord: 'AKOR ATÖLYESİ',
  find: 'HEDEF NOTAYI BUL',
  name: 'BU HANGİ NOTA?',
  staff: 'PORTE NOTA SEHPASI',
  song: 'ŞARKILAR & REPERTUAR',
  daily: 'PRATİK & ZAMAN YARIŞI',
  tuner: 'HASSAS AKORT ALETİ',
  mic: 'MİKROFONLA ÇAL',
  progress: 'USTALIK & İLERLEME',
};

const WORKSHOP_SUBS = [
  ['learn', '🎓 Klavye & Kurallar'],
  ['chord', '🎸 Akor Atölyesi'],
  ['progress', '📊 İlerleme'],
];
const PRACTICE_SUBS = [
  ['daily', '⚡ Yarış'],
  ['find', '🎯 Nota Bul'],
  ['name', '❓ Nota Seç'],
  ['mic', '🎤 Mikrofon'],
];
let lastWorkshopMode = 'learn', lastPracticeMode = 'daily';

function groupOfMode(m) {
  if (['learn', 'chord', 'progress'].includes(m)) return 'workshop';
  if (['daily', 'find', 'name', 'mic'].includes(m)) return 'practice';
  return m;
}

function renderSubTabs(m) {
  const bar = $('subTabs');
  if (!bar) return;
  const grp = groupOfMode(m);
  const subs = grp === 'workshop' ? WORKSHOP_SUBS : grp === 'practice' ? PRACTICE_SUBS : null;
  bar.hidden = !subs;
  if (!subs) { bar.innerHTML = ''; return; }
  bar.innerHTML = subs.map(([id, lbl]) => `<button data-sub="${id}" class="subTabBtn ${m === id ? 'on' : ''}">${lbl}</button>`).join('');
  bar.querySelectorAll('button[data-sub]').forEach(btn => {
    btn.onclick = () => setMode(btn.dataset.sub);
  });
}

function setMode(m) {
  mode = m; stopMic(); stopStaffTimer(); stopBlitz(); current = null; FRETS = 12;
  if (typeof stopSong === 'function') stopSong();
  const grp = groupOfMode(m);
  if (grp === 'workshop') lastWorkshopMode = m;
  if (grp === 'practice') lastPracticeMode = m;
  document.querySelectorAll('#tabs button').forEach(b => {
    const bGrp = b.dataset.group || b.dataset.mode;
    b.classList.toggle('active', bGrp === grp);
    if (bGrp === 'workshop') b.dataset.mode = lastWorkshopMode;
    if (bGrp === 'practice') b.dataset.mode = lastPracticeMode;
  });
  renderSubTabs(m);
  if ($('modeSubLabel')) $('modeSubLabel').textContent = MODE_LABELS[m] || 'KLAVYE & ÖĞREN';
  window.scrollTo(0, 0);
  $('answers').innerHTML = ''; $('micStatus').textContent = ''; $('score').innerHTML = '';
  setFb('');
  correct = total = streak = 0;
  const maxF = Math.max(3, ...levelPositions().map(p => p.f));
  if (['learn', 'find', 'name', 'staff', 'daily', 'mic', 'progress'].includes(m)) {
    FRETS = Math.min(12, Math.max(5, maxF + (maxF < 12 ? 1 : 0)));
  }
  drawBoard(); clearMarks();
  $('tipsBar').hidden = m !== 'learn';
  if ($('learnRules')) $('learnRules').hidden = m !== 'learn';
  $('chordBar').hidden = m !== 'chord';
  $('chordUI').hidden = m !== 'chord';
  $('dailyBar').hidden = m !== 'daily';
  $('staffWrap').hidden = m !== 'staff';
  $('staffBar').hidden = m !== 'staff';
  $('micBar').hidden = !(m === 'mic' || m === 'tuner');
  $('songUI').hidden = m !== 'song'; $('songUI').innerHTML = ''; $('songBottom').hidden = m !== 'song'; $('songBottom').innerHTML = '';
  $('tuner').hidden = m !== 'tuner'; $('boardWrap').style.display = m === 'tuner' ? 'none' : '';
  if ($('studyCard')) $('studyCard').style.display = ['tuner', 'song', 'chord', 'find', 'name', 'daily'].includes(m) ? 'none' : '';
  if ($('promptBox')) $('promptBox').style.display = m === 'tuner' ? 'none' : '';
  if (document.querySelector('header .opts')) document.querySelector('header .opts').style.display = ['tuner', 'chord'].includes(m) ? 'none' : '';
  $('levelDesc').textContent = LEVELS[level].d;
  renderCustom();
  renderMicBar();
  if (m === 'learn') startLearn();
  else if (m === 'chord') startChordMode();
  else if (m === 'find') nextFind();
  else if (m === 'name') nextName();
  else if (m === 'staff') startStaffMode();
  else if (m === 'daily') startPracticeMode();
  else if (m === 'song') startSongMode();
  else if (m === 'tuner') startTuner();
  else if (m === 'mic') startMicMode();
  else showProgress();
}

// ---------- Öğren Modu + Görsel İpuçları + 3 Altın Pratik Kural Kartları ----------
let activeTip = 'none';
function startLearn() {
  activeTip = 'none';
  renderTipsBar();
  renderLearnRules();
  showDefaultLearn();
}

function renderLearnRules() {
  const lr = $('learnRules');
  if (!lr) return;
  lr.innerHTML = `
    <div class="rulesTitle">💡 3 Altın Pratik Kural <small>Solfej Rehberi</small></div>
    <details class="ruleAcc" open>
      <summary><span class="rNum n1">1</span><b>Mi–Fa &amp; Si–Do Kuralı (Yarım Ses)</b><span class="rArr">▾</span></summary>
      <div class="rBody">
        <p>Doğal notalar arasında yalnızca <b>Mi–Fa</b> ve <b>Si–Do</b> aralıkları <em>yarım ses</em> (1 perde) uzaklıktadır. Aralarında boş perde bulunmaz!</p>
        <div class="rDemo"><span>0. Perde: Si</span> ➔ <span class="hi">1. Perde: Do (Bitişik!)</span></div>
        <button class="pill" data-rule="half">Klavyede Göster</button>
      </div>
    </details>
    <details class="ruleAcc">
      <summary><span class="rNum n2">2</span><b>5. Perde Kuralı (Unison Eşdeğer)</b><span class="rArr">▾</span></summary>
      <div class="rBody">
        <p>Bir telin <b>5. perdesindeki</b> nota, bir alt telin <b>boş (0. perde)</b> sesiyle birebir aynıdır. ⚠️ Tek istisna: 3. telde <b>4. perde (Si)</b> = 2. tel boş sesidir.</p>
        <button class="pill" data-rule="fifth">Klavyede Göster</button>
      </div>
    </details>
    <details class="ruleAcc">
      <summary><span class="rNum n3">3</span><b>Oktav Geometrisi (2 Tel, 2 Perde)</b><span class="rArr">▾</span></summary>
      <div class="rBody">
        <p>6. veya 5. teldeki herhangi bir notanın 1 oktav incesini bulmak için: <b>2 tel inceye in ve 2 perde ileri git!</b> (1-2. tel dahilse 3 perde ileri).</p>
        <button class="pill" data-rule="oct">Klavyede Göster</button>
      </div>
    </details>`;
  lr.querySelectorAll('button[data-rule]').forEach(btn => btn.onclick = () => {
    activeTip = btn.dataset.rule;
    renderTipsBar();
    applyVisualTip(activeTip);
    $('boardWrap').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

function showDefaultLearn() {
  FRETS = Math.max(3, ...levelPositions().map(p => p.f)) <= 5 ? 6 : 12;
  drawBoard(); clearMarks();
  $('prompt').textContent = 'Bir noktaya dokun: adını gör, sesini duy.';
  for (const { s, f } of levelPositions()) mark(s, f, 'target', nameOf(pcOf(s, f)));
  onPosClick = (s, f) => {
    playMidi(midi(s, f));
    setFb(`${s + 1}. tel, ${f}. perde = ${nameBoth(pcOf(s, f))}`, 'ok');
  };
}

function renderTipsBar() {
  const b = $('tipsBar');
  b.innerHTML = `
    <div class="tipRow">
      <button data-tp="none" class="pill ${activeTip === 'none' ? 'on' : ''}">📋 Seviye Notaları</button>
      <button data-tp="half" class="pill ${activeTip === 'half' ? 'on' : ''}">⚡ Mi-Fa & Si-Do</button>
      <button data-tp="fifth" class="pill ${activeTip === 'fifth' ? 'on' : ''}">🔗 5. Perde Kuralı</button>
      <button data-tp="oct" class="pill ${activeTip === 'oct' ? 'on' : ''}">🔺 Oktav Üçgeni</button>
    </div>`;
  b.querySelectorAll('button').forEach(btn => btn.onclick = () => {
    activeTip = btn.dataset.tp;
    renderTipsBar();
    applyVisualTip(activeTip);
  });
}

function applyVisualTip(tp) {
  if (tp === 'none') { showDefaultLearn(); setFb(''); return; }
  if (tp === 'half') {
    FRETS = 6; drawBoard(); clearMarks();
    $('prompt').textContent = '⚡ Kural: Mi–Fa ve Si–Do arası bitişiktir (1 perde)!';
    setFb('Diğer tüm doğal notalar arasında 1 boş perde (2 perde mesafe) vardır. Turuncu ve mavi çiftlere dokun!', 'ok');
    const pairs = [[0, 0, 'target'], [0, 1, 'pair'], [1, 0, 'target'], [1, 1, 'pair'], [3, 2, 'target'], [3, 3, 'pair'], [4, 2, 'target'], [4, 3, 'pair'], [5, 0, 'target'], [5, 1, 'pair']];
    pairs.forEach(([s, f, cl]) => mark(s, f, cl, nameOf(pcOf(s, f))));
  } else if (tp === 'fifth') {
    FRETS = 6; drawBoard(); clearMarks();
    $('prompt').textContent = '🔗 5. Perde Kuralı: Bir telin 5. perdesi = alt telin boş sesi';
    setFb('Tek istisna 3. teldir: 3. telin 4. perdesi (Si) = 2. telin boş sesidir. Eşleşen çiftlere dokun!', 'ok');
    const eq = [[5, 5, 'target'], [4, 0, 'pair'], [4, 5, 'target'], [3, 0, 'pair'], [3, 5, 'target'], [2, 0, 'pair'], [2, 4, 'target'], [1, 0, 'pair'], [1, 5, 'target'], [0, 0, 'pair']];
    eq.forEach(([s, f, cl]) => mark(s, f, cl, nameOf(pcOf(s, f))));
  } else if (tp === 'oct') {
    FRETS = 7; drawBoard(); clearMarks();
    $('prompt').textContent = '🔺 Oktav Üçgeni: 2 tel inceye + 2 perde ileri = Aynı Nota!';
    setFb('6-4. ve 5-3. tellerde "2 tel aşağı, 2 perde ileri" (1-2. tel varsa 3 perde ileri) aynı notanın 1 oktav tizidir.', 'ok');
    const octs = [[5, 0, 'target'], [3, 2, 'target'], [5, 3, 'pair'], [3, 5, 'pair'], [4, 3, 'right'], [2, 5, 'right']];
    octs.forEach(([s, f, cl]) => mark(s, f, cl, nameOf(pcOf(s, f))));
  }
  onPosClick = (s, f) => {
    playMidi(midi(s, f));
    setFb(`${s + 1}. tel, ${f}. perde = ${nameBoth(pcOf(s, f))}`, 'ok');
  };
}

// ---------- Akor Kütüphanesi & Akor Çalma Modu ----------
// teller: 0: 1. tel (ince Mi), 1: 2. tel (Si), 2: 3. tel (Sol), 3: 4. tel (Re), 4: 5. tel (La), 5: 6. tel (kalın Mi)
// frets: [s0, s1, s2, s3, s4, s5] (-1: çalınmaz 'X', 0: boş tel 'O', >0: basılan perde)
// fingers: parmak numaraları (1: İşaret, 2: Orta, 3: Yüzük, 4: Serçe)
const CHORDS = [
  { id: 'Em', name: 'Mi Minör (Em)', cat: 'Temel Açık Akorlar', frets: [0, 0, 0, 2, 2, 0], fingers: [0, 0, 0, 3, 2, 0], tip: 'En kolay akor! 4. ve 5. tele bas, tüm telleri çal.' },
  { id: 'Am', name: 'La Minör (Am)', cat: 'Temel Açık Akorlar', frets: [0, 1, 2, 2, 0, -1], fingers: [0, 1, 3, 2, 0, 0], tip: '6. teli çalma (X). 5. telden aşağı doğru çal.' },
  { id: 'C', name: 'Do Majör (C)', cat: 'Temel Açık Akorlar', frets: [0, 1, 0, 2, 3, -1], fingers: [0, 1, 0, 2, 3, 0], tip: 'Klasik açık C akoru. Parmak uçlarıyla basarak diğer telleri boğma.' },
  { id: 'D', name: 'Re Majör (D)', cat: 'Temel Açık Akorlar', frets: [2, 3, 2, 0, -1, -1], fingers: [1, 3, 2, 0, 0, 0], tip: 'Yalnızca ilk 4 teli çal (4. tel açık Re).' },
  { id: 'Dm', name: 'Re Minör (Dm)', cat: 'Temel Açık Akorlar', frets: [1, 3, 2, 0, -1, -1], fingers: [1, 3, 2, 0, 0, 0], tip: '1. telde 1. perdeye işaret parmağı basar. Hüzünlü ses verir.' },
  { id: 'E', name: 'Mi Majör (E)', cat: 'Temel Açık Akorlar', frets: [0, 0, 1, 2, 2, 0], fingers: [0, 0, 1, 3, 2, 0], tip: 'Em şekline 3. tel 1. perdeyi ekle. Tüm telleri güçlü çal.' },
  { id: 'A', name: 'La Majör (A)', cat: 'Temel Açık Akorlar', frets: [0, 2, 2, 2, 0, -1], fingers: [0, 3, 2, 1, 0, 0], tip: '2, 3 ve 4. tellerde aynı 2. perdeye üç parmak yan yana basar.' },
  { id: 'G', name: 'Sol Majör (G)', cat: 'Temel Açık Akorlar', frets: [3, 0, 0, 0, 2, 3], fingers: [3, 0, 0, 0, 1, 2], tip: 'Geniş açık akor. Tüm 6 teli çalabilirsin.' },
  { id: 'A7', name: 'La 7\'li (A7)', cat: '7\'li & Renkli Akorlar', frets: [0, 2, 0, 2, 0, -1], fingers: [0, 3, 0, 2, 0, 0], tip: 'Sadece iki parmakla basılan çok akıcı bir geçiş akoru.' },
  { id: 'B7', name: 'Si 7\'li (B7)', cat: '7\'li & Renkli Akorlar', frets: [2, 0, 2, 1, 2, -1], fingers: [4, 0, 3, 1, 2, 0], tip: 'Em ve E parçalara bağlanan klasik gitarın vazgeçilmez akoru.' },
  { id: 'Fmaj7', name: 'Fa Majör 7 (Fmaj7)', cat: '7\'li & Renkli Akorlar', frets: [0, 1, 2, 3, -1, -1], fingers: [0, 1, 2, 3, 0, 0], tip: 'Barresiz kolay Fa akoru. Akustik ve yumuşak tını verir.' },
];

let curChordId = localStorage.getItem('gn_cur_chord') || 'Em';
let chordPlayTimer = null;

function startChordMode() {
  FRETS = 5;
  drawBoard();
  clearMarks();
  renderChordBar();
  showChord(curChordId);
}

function renderChordBar() {
  const bar = $('chordBar');
  if (!bar) return;
  let h = '<div class="chordPills">';
  CHORDS.forEach(c => {
    h += `<button class="pill ${c.id === curChordId ? 'on' : ''}" data-ch="${c.id}">${c.id}</button>`;
  });
  h += '</div>';
  bar.innerHTML = h;
  bar.querySelectorAll('button[data-ch]').forEach(btn => {
    btn.onclick = () => {
      curChordId = btn.dataset.ch;
      localStorage.setItem('gn_cur_chord', curChordId);
      renderChordBar();
      showChord(curChordId);
    };
  });
}

function showChord(id) {
  clearMarks();
  const c = CHORDS.find(x => x.id === id) || CHORDS[0];
  $('prompt').textContent = `🎸 ${c.name}`;
  setFb(c.tip, 'ok');

  // Mute / Open / Parmak işaretlerini çiz
  // c.frets[s]: s=0 (1. tel) ... s=5 (6. tel)
  for (let s = 0; s < 6; s++) {
    const f = c.frets[s];
    const finger = c.fingers[s];
    if (f === -1) {
      // Çalınmayan tel (X)
      markMute(s, '✕');
    } else if (f === 0) {
      // Boş tel (O)
      mark(s, 0, 'pair', 'O');
    } else {
      // Basılan perde (Parmak no: 1, 2, 3, 4)
      const fingerText = finger ? `${finger}.P` : `${nameOf(pcOf(s, f))}`;
      mark(s, f, 'target', finger ? `${finger}` : nameOf(pcOf(s, f)));
    }
  }

  // Akor Kontrol UI
  const cui = $('chordUI');
  if (cui) {
    const noteNames = [];
    for (let s = 5; s >= 0; s--) {
      const f = c.frets[s];
      if (f >= 0) noteNames.push(`${s + 1}.tel: ${nameOf(pcOf(s, f))}`);
    }
    cui.innerHTML = `
      <div class="chordCard">
        <div class="chDesc"><b>İçerik:</b> ${noteNames.join(' · ')}</div>
        <div class="chBtns">
          <button id="chStrum" class="pill accent">⚡ Taramalı Çal (Strum)</button>
          <button id="chArp" class="pill">🎶 Arpej Çal</button>
        </div>
      </div>`;
    $('chStrum').onclick = () => playChordAudio(c, 'strum');
    $('chArp').onclick = () => playChordAudio(c, 'arpeggio');
  }

  onPosClick = (s, f) => {
    playMidi(midi(s, f));
    setFb(`${s + 1}. tel, ${f}. perde = ${nameBoth(pcOf(s, f))}`, 'ok');
  };
}

function markMute(s, sym) {
  const posNut = pt(posA(0), crossC(s));
  const t = el('text', {
    x: posNut.x, y: posNut.y,
    fill: '#ffb4ab',
    'font-size': '16px',
    'font-weight': '900',
    'text-anchor': 'middle',
    'dominant-baseline': 'central',
    class: 'fretMuteMark'
  });
  t.textContent = sym;
}

function playChordAudio(c, style) {
  if (chordPlayTimer) { clearTimeout(chordPlayTimer); chordPlayTimer = null; }
  const ctx = audioCtx();
  const t0 = ctx.currentTime + 0.05;
  const activeStrings = [];
  // Kalın telden ince tele doğru çal
  for (let s = 5; s >= 0; s--) {
    if (c.frets[s] >= 0) activeStrings.push({ s, f: c.frets[s], m: midi(s, c.frets[s]) });
  }
  const delta = style === 'arpeggio' ? 0.22 : 0.045; // Arpej veya tarama (strum)
  activeStrings.forEach((item, idx) => {
    const playT = t0 + idx * delta;
    playMidi(item.m, playT, 1.8);
    setTimeout(() => {
      flashPos(item.s, item.f);
    }, (playT - ctx.currentTime) * 1000);
  });
}

// ---------- Hedef Seçimi ----------
function pickTarget(prev) {
  const ps = levelPositions();
  if (ps.length <= 1) return ps[0];
  const now = Date.now();
  for (let tries = 0; tries < 6; tries++) {
    const w = ps.map(p => { const e = stats[p.s + '-' + p.f]; if (!e) return 4; return e.due <= now ? 3 + 2 * (4 - (e.box || 0)) : 0.4; });
    let r = Math.random() * w.reduce((a, b) => a + b, 0);
    let pick = ps[0];
    for (let i = 0; i < ps.length; i++) { r -= w[i]; if (r <= 0) { pick = ps[i]; break; } }
    if (!prev || pick.s !== prev.s || pick.f !== prev.f) return pick;
  }
  return ps[Math.floor(Math.random() * ps.length)];
}

function matches(s, pc) {
  const L = LEVELS[level], out = [];
  for (let f = L.frets[0]; f <= L.frets[1]; f++) if (pcOf(s, f) === pc) out.push(f);
  return out;
}

// ---------- Pratik Modu: Günlük 10 Soru & 60 Saniye Zaman Yarışı ----------
const DAILY_N = 10;
function startPracticeMode() {
  stopBlitz();
  correct = total = streak = 0;
  renderDailyBar();
  if (practiceSub === 'blitz60') {
    blitzSec = 60;
    updScore();
    blitzTimer = setInterval(() => {
      blitzSec--;
      updScore();
      if (blitzSec <= 0) {
        stopBlitz();
        clearMarks(); $('answers').innerHTML = ''; onPosClick = () => { };
        const best = +(localStorage.getItem('gn_blitz_best') || 0);
        const isNew = correct > best;
        if (isNew) localStorage.setItem('gn_blitz_best', correct);
        $('prompt').textContent = `⏱ Süre Bitti! Skor: ${correct} doğru`;
        setFb(isNew ? `🏆 YENİ REKOR! (${correct} doğru)` : `En yüksek rekorun: ${Math.max(best, correct)} doğru. Tekrar dene!`, 'ok');
        renderDailyBar();
      }
    }, 1000);
  }
  advance('find');
}

function renderDailyBar() {
  const best = +(localStorage.getItem('gn_blitz_best') || 0);
  const b = $('dailyBar');
  b.innerHTML = `
    <div class="tipRow">
      <button data-pm="daily10" class="pill ${practiceSub === 'daily10' ? 'on' : ''}">📅 Günlük 10 Soru</button>
      <button data-pm="blitz60" class="pill ${practiceSub === 'blitz60' ? 'on' : ''}">⚡ 60sn Zaman Yarışı (Rekor: ${best})</button>
      <button id="pmRestart" class="pill">🔄 Baştan</button>
    </div>`;
  b.querySelectorAll('button[data-pm]').forEach(btn => btn.onclick = () => {
    practiceSub = btn.dataset.pm; localStorage.setItem('gn_prac_sub', practiceSub);
    startPracticeMode();
  });
  $('pmRestart').onclick = () => startPracticeMode();
}

function advance(kind) {
  if (mode === 'daily') {
    if (practiceSub === 'daily10' && total >= DAILY_N) {
      clearMarks(); $('answers').innerHTML = '';
      $('prompt').textContent = `🎉 Günlük Pratik Bitti! ${correct}/${total} doğru`;
      setFb(correct >= 8 ? 'Harika iş! İstersen 60sn Zaman Yarışını dene.' : 'Zayıf notalar aralıklı tekrarla daha sık sorulacak.', 'ok');
      return;
    }
    if (practiceSub === 'blitz60' && blitzSec <= 0) return;
    kind = Math.random() < 0.5 ? 'find' : 'name'; $('answers').innerHTML = '';
  }
  kind === 'find' ? nextFind() : nextName();
}

function nextFind() {
  clearMarks(); current = pickTarget(current); setFb('');
  const pc = pcOf(current.s, current.f);
  $('prompt').textContent = `${current.s + 1}. telde "${nameBoth(pc)}" notasını bul`;
  let locked = false;
  const delay = (mode === 'daily' && practiceSub === 'blitz60') ? 380 : 800;
  onPosClick = (s, f) => {
    if (locked) return;
    playMidi(midi(s, f));
    total++;
    if (s === current.s && pcOf(s, f) === pc) {
      locked = true; correct++; streak++;
      record(current.s, current.f, true);
      mark(s, f, 'right', nameOf(pc)); setFb('Doğru! 🎉', 'ok'); updScore();
      setTimeout(() => advance('find'), delay);
    } else {
      streak = 0; record(current.s, current.f, false);
      mark(s, f, 'wrong', nameOf(pcOf(s, f)));
      flashPos(current.s, matches(current.s, pc)[0]);
      setFb(`Burası ${nameBoth(pcOf(s, f))}. İpucu: ${hint(current.s, matches(current.s, pc)[0])}`, 'bad'); updScore();
    }
  };
  updScore();
}

function showNotePopover(s, f, pcs, onPick) {
  const pop = $('notePopover'), g = posEl(s, f);
  if (!pop || !g) return;
  const c = g.querySelector('circle');
  const cRect = c.getBoundingClientRect();
  let h = `<div class="npHead"><span>🎯 ${s + 1}. Tel, ${f}. Perde — Notayı Seç</span><button class="npClose" aria-label="Kapat">✕</button></div><div class="npGrid">`;
  pcs.forEach(p => {
    const lbl = isNatural(p) ? `<b>${NAMES_TR[p]}</b><small>${NAMES_EN[p]}</small>` : `<b>${NAMES_TR[p]}</b><small>${FLAT_TR[p]}</small>`;
    h += `<button class="npBtn" data-pc="${p}">${lbl}</button>`;
  });
  h += `</div>`;
  pop.innerHTML = h;
  pop.hidden = false;
  // Ekran içinde hedef dairenin hemen altına veya alt yarıdaysa hemen üstüne hizala
  const popH = pop.offsetHeight || 165;
  const vh = window.innerHeight, vw = window.innerWidth;
  let topPx;
  if (cRect.bottom + 12 + popH <= vh - 86) {
    topPx = Math.max(68, cRect.bottom + 12);
  } else {
    topPx = Math.max(68, cRect.top - popH - 12);
  }
  pop.style.top = `${topPx}px`;
  if (vw >= 500) {
    const popW = Math.min(420, vw - 32);
    const leftPx = Math.max(16, Math.min(vw - popW - 16, cRect.left + cRect.width / 2 - popW / 2));
    pop.style.width = `${popW}px`;
    pop.style.left = `${leftPx}px`;
    pop.style.right = 'auto';
  } else {
    pop.style.width = '';
    pop.style.left = '14px';
    pop.style.right = '14px';
  }
  pop.querySelector('.npClose').onclick = e => { e.stopPropagation(); hideNotePopover(); };
  pop.querySelectorAll('.npBtn').forEach(btn => {
    btn.onclick = e => {
      e.stopPropagation();
      onPick(+btn.dataset.pc);
    };
  });
}

function nextName() {
  clearMarks(); current = pickTarget(current); setFb('Klavyedeki "? SEÇ" dairesine dokunarak notayı seç!');
  const pc = pcOf(current.s, current.f);
  mark(current.s, current.f, 'target', '?');
  $('prompt').textContent = `${current.s + 1}. tel, ${current.f}. perde: hangi nota?`;
  const pcs = [...new Set(levelPositions().map(p => pcOf(p.s, p.f)))].sort((a, b) => a - b);
  const box = $('answers'); box.innerHTML = '';
  let locked = false;
  const delay = (mode === 'daily' && practiceSub === 'blitz60') ? 380 : 800;
  const submitGuess = p => {
    if (locked) return;
    playMidi(midi(current.s, current.f)); total++;
    if (p === pc) {
      locked = true; correct++; streak++; record(current.s, current.f, true);
      hideNotePopover();
      mark(current.s, current.f, 'right', nameOf(pc)); setFb('Doğru! 🎉', 'ok'); updScore();
      setTimeout(() => advance('name'), delay);
    } else {
      streak = 0; record(current.s, current.f, false);
      setFb(`Hayır. İpucu: ${hint(current.s, current.f)}`, 'bad'); updScore();
    }
  };
  onPosClick = (s, f) => {
    playMidi(midi(current.s, current.f));
    showNotePopover(current.s, current.f, pcs, submitGuess);
  };
  board.onclick = e => {
    if (e.target.closest('.pos')) return;
    playMidi(midi(current.s, current.f));
    showNotePopover(current.s, current.f, pcs, submitGuess);
  };
  updScore();
}

// ---------- Porte (Gerçek Nota Süreleri: Birlik, İkilik, Noktalı, Dörtlük, Sekizlik) ----------
const LETTER_OF_PC = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6];
const SHARP_PC = pc => !isNatural(pc);

function durLabelTr(b) {
  if (!b) return '';
  if (b >= 3.5) return '4v (Birlik)';
  if (b >= 2.75) return '3v (Noktalı 2\'lik)';
  if (b >= 1.8) return '2v (İkilik)';
  if (b >= 1.35) return '1½v (Noktalı)';
  if (b >= 0.85) return '1v (Dörtlük)';
  if (b >= 0.65) return '¾v';
  if (b >= 0.4) return '½v (Sekizlik)';
  return '¼v (16\'lık)';
}

function durBadgeShort(b) {
  if (!b) return '';
  if (b >= 3.5) return '𝅝 4v';
  if (b >= 2.75) return '𝅗𝅥. 3v';
  if (b >= 1.8) return '𝅗𝅥 2v';
  if (b >= 1.35) return '♩. 1½v';
  if (b >= 0.85) return '♩ 1v';
  if (b >= 0.65) return '♪. ¾v';
  if (b >= 0.4) return '♪ ½v';
  return '♬ ¼v';
}

function drawStaffNotes(notesList, targetSvg, opts) {
  const svg = targetSvg || $('staff'); if (!svg) return;
  svg.innerHTML = '';
  const cfg = Object.assign({
    multiLine: false,
    notesPerRow: window.innerWidth >= 720 ? 6 : 4,
    showStringFret: true,
    large: false,
    onNoteClick: null,
  }, opts || {});

  const totalCount = notesList.length || 1;
  const perRow = cfg.multiLine ? Math.max(1, cfg.notesPerRow) : totalCount;
  const numRows = Math.max(1, Math.ceil(totalCount / perRow));
  const isWide = window.innerWidth >= 700 && (cfg.large || cfg.multiLine || totalCount > 5);
  const W = isWide ? 460 : 316;
  const rowH = 162;
  const totalH = numRows * rowH + 6;
  svg.setAttribute('viewBox', `0 0 ${W} ${totalH}`);
  svg.classList.toggle('largeSheetSvg', !!(cfg.large || cfg.multiLine));

  const mk = (tag, a, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in a) e.setAttribute(k, a[k]);
    (parent || svg).appendChild(e);
    return e;
  };

  for (let r = 0; r < numRows; r++) {
    const rowNotes = notesList.slice(r * perRow, (r + 1) * perRow);
    const yOff = r * rowH;
    const yBottom = yOff + 102;
    const lineGap = 13.5, half = 6.75;
    const xLeft = 12, xRight = W - 12;

    // Satır arka planı (çok satırlı konser sehpasında hafif kart ayrımı)
    if (numRows > 1) {
      mk('rect', { x: 4, y: yOff + 4, width: W - 8, height: rowH - 6, rx: 10, fill: r % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.18)', stroke: '#22242a', 'stroke-width': 1 });
      const mNum = mk('text', { x: xLeft + 2, y: yOff + 19, 'font-family': 'Space Grotesk, sans-serif', 'font-size': 9.5, 'font-weight': '800', fill: '#7a7267' });
      mNum.textContent = `${r + 1}. SATIR`;
    }

    // 5 Dizek çizgisi (Yüksek kontrastlı, net porte çizgileri)
    for (let i = 0; i < 5; i++) {
      const ly = yBottom - i * lineGap;
      mk('line', { x1: xLeft, x2: xRight, y1: ly, y2: ly, stroke: '#495264', 'stroke-width': 1.7 });
    }
    // Sol ve sağ ölçü çizgileri
    mk('line', { x1: xLeft, x2: xLeft, y1: yBottom - 4 * lineGap, y2: yBottom, stroke: '#b8a892', 'stroke-width': 2.5 });
    mk('line', { x1: xRight, x2: xRight, y1: yBottom - 4 * lineGap, y2: yBottom, stroke: '#b8a892', 'stroke-width': 2.5 });
    if (r === numRows - 1) {
      mk('line', { x1: xRight - 4.5, x2: xRight - 4.5, y1: yBottom - 4 * lineGap, y2: yBottom, stroke: '#b8a892', 'stroke-width': 1.3 });
    }

    // Büyük Sol Anahtarı (𝄞)
    const clef = mk('text', { x: xLeft + 5, y: yBottom - 11, 'font-size': 52, fill: '#ffc665', 'font-family': 'serif' });
    clef.textContent = '𝄞';

    const count = rowNotes.length;
    const startX = count === 1 ? (W * 0.54) : 72;
    const usableW = (xRight - 28) - startX;
    const stepX = count <= 1 ? 0 : (usableW / Math.max(1, (cfg.multiLine ? Math.max(count - 1, perRow - 1) : count - 1)));

    rowNotes.forEach((item, idx) => {
      const globalIdx = r * perRow + idx;
      const actualMidi = item.m !== undefined ? item.m : midi(item.s, item.f);
      const w = actualMidi + 12;
      const pc = ((w % 12) + 12) % 12, oct = Math.floor(w / 12) - 1;
      const step = oct * 7 + LETTER_OF_PC[pc];
      const y = yBottom - (step - 30) * half;
      const cx = startX + idx * stepX;
      const col = item.state === 'cur' ? '#ffc665' : item.state === 'hit' ? '#4edea3' : item.state === 'miss' ? '#ff9790' : '#f1f0f4';
      const b = item.b !== undefined ? item.b : 1;
      const isHollow = b >= 1.8;
      const hasStem = b < 3.5;
      const isDotted = Math.abs(b - 1.5) < 0.12 || Math.abs(b - 3) < 0.12 || Math.abs(b - 0.75) < 0.1;
      const flags = b <= 0.3 ? 2 : b <= 0.6 ? 1 : 0;

      const gNote = mk('g', { class: `stNoteHit ${item.state || ''}`, 'data-idx': globalIdx, style: 'cursor:pointer' });

      if (item.state === 'cur') {
        mk('rect', { x: cx - 22, y: yOff + 8, width: 44, height: rowH - 14, rx: 9, fill: 'rgba(255, 198, 101, 0.16)', stroke: 'rgba(255, 198, 101, 0.45)', 'stroke-width': 1.2 }, gNote);
        mk('circle', { cx, cy: y, r: 15.5, fill: 'rgba(255, 198, 101, 0.22)' }, gNote);
      }

      // Ek çizgiler (Ledger lines)
      if (y > yBottom) {
        for (let ly = yBottom + lineGap; ly <= y + 0.5; ly += lineGap) {
          mk('line', { x1: cx - 14, x2: cx + 14, y1: ly, y2: ly, stroke: '#7b8494', 'stroke-width': 1.8 }, gNote);
        }
      }
      if (y < yBottom - 4 * lineGap) {
        for (let ly = yBottom - 5 * lineGap; ly >= y - 0.5; ly -= lineGap) {
          mk('line', { x1: cx - 14, x2: cx + 14, y1: ly, y2: ly, stroke: '#7b8494', 'stroke-width': 1.8 }, gNote);
        }
      }

      // Nota başı (Büyük ve okunaklı)
      if (isHollow) {
        mk('ellipse', { cx, cy: y, rx: 8.6, ry: 6.3, fill: '#121316', stroke: col, 'stroke-width': 2.8, transform: `rotate(-22 ${cx} ${y})` }, gNote);
      } else {
        mk('ellipse', { cx, cy: y, rx: 8.5, ry: 6.4, fill: col, transform: `rotate(-20 ${cx} ${y})` }, gNote);
      }

      // Sap ve Sekizlik/Onaltılık Çengelleri
      const up = y > yBottom - 2 * lineGap;
      if (hasStem) {
        const sx = up ? cx + 7.6 : cx - 7.6;
        const sy1 = up ? y - 1 : y + 1;
        const sy2 = up ? y - 39 : y + 39;
        mk('line', { x1: sx, x2: sx, y1: sy1, y2: sy2, stroke: col, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, gNote);

        for (let fl = 0; fl < flags; fl++) {
          const fy = up ? sy2 + fl * 8.5 : sy2 - fl * 8.5;
          const dPath = up
            ? `M ${sx} ${fy} C ${sx + 10} ${fy + 5}, ${sx + 11} ${fy + 13}, ${sx + 3} ${fy + 19}`
            : `M ${sx} ${fy} C ${sx + 10} ${fy - 5}, ${sx + 11} ${fy - 13}, ${sx + 3} ${fy - 19}`;
          mk('path', { d: dPath, fill: 'none', stroke: col, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, gNote);
        }
      }

      if (isDotted) {
        const onLine = Math.abs(Math.round((yBottom - y) / lineGap) * lineGap - (yBottom - y)) < 1;
        const dotY = onLine ? y - 4.5 : y;
        mk('circle', { cx: cx + 15, cy: dotY, r: 3, fill: col }, gNote);
      }

      if (SHARP_PC(pc)) {
        const t = mk('text', { x: cx - 23, y: y + 6, 'font-size': 19, 'font-weight': 'bold', fill: col }, gNote);
        t.textContent = '♯';
      }

      if (item.showName || item.state === 'hit') {
        const lbl = mk('text', { x: cx, y: yBottom + 36, 'font-family': 'Space Grotesk, sans-serif', 'font-size': 12.8, 'font-weight': '800', fill: col, 'text-anchor': 'middle' }, gNote);
        lbl.textContent = `${nameOf(pc)} (${NAMES_EN[pc]})`;
        if (item.b !== undefined) {
          const dl = mk('text', { x: cx, y: yBottom + 50, 'font-family': 'Space Grotesk, sans-serif', 'font-size': 10, 'font-weight': '700', fill: '#d4c4b0', 'text-anchor': 'middle' }, gNote);
          dl.textContent = durBadgeShort(b);
        }
      } else if (item.b !== undefined) {
        const dl = mk('text', { x: cx, y: yBottom + 40, 'font-family': 'Space Grotesk, sans-serif', 'font-size': 10, 'font-weight': '700', fill: '#9d8f7c', 'text-anchor': 'middle' }, gNote);
        dl.textContent = durBadgeShort(b);
      }

      if (cfg.showStringFret && item.s !== undefined) {
        const strTxt = item.f !== undefined && (cfg.large || item.showName) ? `${item.s + 1}.tel · ${item.f}P` : `${item.s + 1}.tel`;
        const strNum = mk('text', { x: cx, y: yOff + 22, 'font-family': 'Space Grotesk, sans-serif', 'font-size': 10.5, 'font-weight': '800', fill: item.state === 'cur' ? '#ffc665' : '#b8a892', 'text-anchor': 'middle' }, gNote);
        strNum.textContent = strTxt;
      }

      // Dokunma alanı
      mk('rect', { x: cx - 22, y: yOff + 8, width: 44, height: rowH - 14, fill: 'transparent' }, gNote);
      gNote.onclick = e => {
        e.stopPropagation();
        if (typeof cfg.onNoteClick === 'function') cfg.onNoteClick(globalIdx, item);
        else if (item.s !== undefined && item.f !== undefined) playMidi(midi(item.s, item.f), 0, (item.b || 1) * 0.75);
      };
    });
  }
}

let staffSub = localStorage.getItem('gn_staff_sub') || 'sheet';
let staffInput = localStorage.getItem('gn_staff_in') || 'mic';
let staffShowNames = false;
let staffShowStrFret = localStorage.getItem('gn_staff_sf') !== '0';
let staffSheetOnly = localStorage.getItem('gn_staff_sheet_only') === '1';
let staffSeqLen = +(localStorage.getItem('gn_staff_len') || 8);
let staffSeq = [], staffIdx = 0, staffTimer = null;

function stopStaffTimer() { clearTimeout(staffTimer); clearInterval(staffTimer); staffTimer = null; }

function startStaffMode() {
  stopStaffTimer(); stopMic();
  renderStaffBar();
  newStaffSeq();
}

function renderStaffBar() {
  const bar = $('staffBar');
  const isSheet = staffSub === 'sheet' || staffSheetOnly;
  bar.innerHTML = `
    <div class="stModes stModes4">
      <button data-sm="sheet" class="${staffSub === 'sheet' ? 'sel' : ''}">📖 Sadece Notadan Çal</button>
      <button data-sm="step" class="${staffSub === 'step' ? 'sel' : ''}">🤝 Adım Adım</button>
      <button data-sm="listen" class="${staffSub === 'listen' ? 'sel' : ''}">🎧 Dinle & İzle</button>
      <button data-sm="find" class="${staffSub === 'find' ? 'sel' : ''}">🎯 Tek Bul</button>
    </div>
    <div class="stOpts">
      ${(staffSub === 'step' || staffSub === 'sheet') ? `<label>Girdi <select id="stIn"><option value="mic">🎤 Gitarla çal (Mikrofon)</option><option value="touch">✋ Dokunarak / Seçerek</option></select></label>` : ''}
      ${staffSub === 'sheet' ? `<label>Sehpa <select id="stLen"><option value="4">4 Nota (Dev Porte)</option><option value="8">8 Nota (2 Satır Sehpa)</option><option value="12">12 Nota (3 Satır Tam Sehpa)</option></select></label>` : ''}
      ${staffSub !== 'sheet' ? `<button id="stSheetToggle" class="pill ${staffSheetOnly ? 'on' : ''}">🔍 ${staffSheetOnly ? 'Büyük Porte: Açık' : 'Büyük Porte (Klavyesiz)'}</button>` : ''}
      <button id="stNames" class="pill ${staffShowNames ? 'on' : ''}">🔤 Nota Adı: ${staffShowNames ? 'Açık' : 'Kapalı'}</button>
      <button id="stSf" class="pill ${staffShowStrFret ? 'on' : ''}">🎸 Tel/Perde: ${staffShowStrFret ? 'Açık' : 'Kapalı'}</button>
      <button id="stNew" class="pill">🔄 Yeni Nota Sayfası</button>
      ${staffSub === 'listen' ? `<button id="stReplay" class="pill accent">▶ Çal</button>` : `<button id="stHear" class="pill accent">🔊 Hedef Sesi Duy</button>`}
    </div>`;
  bar.querySelectorAll('.stModes button').forEach(b => b.onclick = () => {
    staffSub = b.dataset.sm; localStorage.setItem('gn_staff_sub', staffSub);
    startStaffMode();
  });
  if ($('stIn')) {
    $('stIn').value = staffInput;
    $('stIn').onchange = async e => {
      staffInput = e.target.value; localStorage.setItem('gn_staff_in', staffInput);
      stopMic();
      if (staffInput === 'mic') await startStaffMic();
      updateStaffView();
    };
  }
  if ($('stLen')) {
    $('stLen').value = String(staffSeqLen);
    $('stLen').onchange = e => {
      staffSeqLen = +e.target.value || 8;
      localStorage.setItem('gn_staff_len', String(staffSeqLen));
      newStaffSeq();
    };
  }
  if ($('stSheetToggle')) {
    $('stSheetToggle').onclick = () => {
      staffSheetOnly = !staffSheetOnly;
      localStorage.setItem('gn_staff_sheet_only', staffSheetOnly ? '1' : '0');
      renderStaffBar();
      updateStaffView();
    };
  }
  $('stNames').onclick = () => { staffShowNames = !staffShowNames; renderStaffBar(); updateStaffView(); };
  $('stSf').onclick = () => {
    staffShowStrFret = !staffShowStrFret;
    localStorage.setItem('gn_staff_sf', staffShowStrFret ? '1' : '0');
    renderStaffBar();
    updateStaffView();
  };
  $('stNew').onclick = () => newStaffSeq();
  if ($('stHear')) $('stHear').onclick = () => {
    const cur = staffSeq[staffIdx];
    if (cur) { staffMicMute = (actx ? actx.currentTime : 0) + 1.4; playMidi(midi(cur.s, cur.f)); }
  };
  if ($('stReplay')) $('stReplay').onclick = () => playStaffSeq();
}

async function newStaffSeq() {
  stopStaffTimer();
  const len = staffSub === 'find' ? 1 : staffSub === 'sheet' ? staffSeqLen : 5;
  staffSeq = [];
  let prev = null;
  for (let i = 0; i < len; i++) {
    prev = pickTarget(prev);
    const bVal = len === 1 ? 1 : [1, 0.5, 1.5, 1, 2][(i + Math.floor(Math.random() * 2)) % 5];
    staffSeq.push({ s: prev.s, f: prev.f, b: bVal, state: i === 0 ? 'cur' : '' });
  }
  staffIdx = 0;
  setFb('');
  if ((staffSub === 'step' || staffSub === 'sheet') && staffInput === 'mic') {
    const ok = await startStaffMic();
    if (!ok) { staffInput = 'touch'; if ($('stIn')) $('stIn').value = 'touch'; }
  } else {
    stopMic();
  }
  updateStaffView();
  if (staffSub === 'listen') playStaffSeq();
}

function updateStaffView() {
  clearMarks();
  const isSheetOnly = staffSub === 'sheet' || staffSheetOnly;
  if ($('boardWrap')) $('boardWrap').style.display = (mode === 'staff' && isSheetOnly) ? 'none' : (mode === 'tuner' ? 'none' : '');
  if ($('staffWrap')) $('staffWrap').classList.toggle('sheetStandActive', isSheetOnly);

  const list = staffSeq.map((n, i) => ({
    s: n.s, f: n.f, b: n.b,
    state: i < staffIdx ? 'hit' : i === staffIdx ? 'cur' : '',
    showName: staffShowNames || i < staffIdx,
  }));
  const cur = staffSeq[staffIdx];

  drawStaffNotes(list, $('staff'), {
    large: isSheetOnly,
    multiLine: isSheetOnly && list.length > 4,
    notesPerRow: 4,
    showStringFret: staffShowStrFret,
    onNoteClick: (idx, item) => {
      playMidi(midi(item.s, item.f), 0, (item.b || 1) * 0.75);
      if ((staffSub === 'sheet' || staffSub === 'step') && staffInput === 'touch' && idx === staffIdx) {
        judgeStaffStep('touch', midi(item.s, item.f), item.s, item.f);
      }
    }
  });

  // Alt nota süre kartlarını ve Sadece Notadan Çal modunda hızlı nota seçim butonlarını güncelle
  const dc = $('staffDurCards');
  if (dc) {
    if (staffSeq.length > 1) {
      dc.innerHTML = staffSeq.map((n, i) => {
        const stCls = i < staffIdx ? 'hit' : i === staffIdx ? 'cur' : '';
        const nm = (staffShowNames || i < staffIdx) ? nameOf(pcOf(n.s, n.f)) : (staffShowStrFret ? `${n.s + 1}.Tel` : `Nota ${i + 1}`);
        return `<div class="sdc ${stCls}" data-si="${i}"><b>${i + 1}. ${nm}</b><span>${durBadgeShort(n.b || 1)}</span></div>`;
      }).join('');
      dc.querySelectorAll('.sdc').forEach(elCard => {
        elCard.onclick = () => {
          const idx = +elCard.dataset.si;
          const item = staffSeq[idx];
          if (item) playMidi(midi(item.s, item.f), 0, (item.b || 1) * 0.75);
        };
      });
    } else {
      dc.innerHTML = '';
    }
  }

  // Sadece Notadan Çal (Klavyesiz) ve Dokunarak moddaysa portenin hemen altında nota butonları göster
  const ans = $('answers');
  if (ans) {
    if (isSheetOnly && staffSub !== 'listen' && staffInput === 'touch' && cur) {
      const pcs = [...new Set(levelPositions().map(p => pcOf(p.s, p.f)))];
      ans.innerHTML = `<div class="sheetAnsBar"><span class="sabLbl">🎼 Portedeki ${staffIdx + 1}. Nota Hangisi? (veya nota üzerine dokun):</span><div class="sabBtns">${pcs.map(p => `<button type="button" data-pc="${p}">${NAMES_TR[p]}<small>${NAMES_EN[p]}</small></button>`).join('')}</div></div>`;
      ans.querySelectorAll('button[data-pc]').forEach(btn => {
        btn.onclick = () => {
          const p = +btn.dataset.pc;
          playMidi(midi(cur.s, cur.f), 0, (cur.b || 1) * 0.75);
          judgeStaffStep('pc', p, cur.s, cur.f);
        };
      });
    } else {
      ans.innerHTML = '';
    }
  }

  if (!cur) return;
  if ($('staffTargetLabel')) {
    const tName = (staffShowNames || staffSub === 'listen') ? `${nameBoth(pcOf(cur.s, cur.f))}` : (staffShowStrFret ? `${cur.s + 1}. Teldeki Nota` : `Portedeki Nota`);
    $('staffTargetLabel').textContent = `Hedef (${staffIdx + 1}/${staffSeq.length}): ${tName} · ${durLabelTr(cur.b || 1)}`;
  }
  if (staffSub === 'listen') {
    $('prompt').textContent = '🎧 Büyük Portedeki notaları ritimleriyle dinle ve takip et';
    if (!isSheetOnly) mark(cur.s, cur.f, 'target', nameOf(pcOf(cur.s, cur.f)));
    onPosClick = (s, f) => playMidi(midi(s, f));
  } else if (staffSub === 'sheet' || staffSub === 'step') {
    const sfHint = staffShowStrFret ? ` (${cur.s + 1}. tel · ${durLabelTr(cur.b)})` : ` (${durLabelTr(cur.b)})`;
    $('prompt').textContent = staffInput === 'mic'
      ? `🎤 Sadece Porteye Bakarak Çal — ${staffIdx + 1}/${staffSeq.length}. nota${sfHint}`
      : isSheetOnly
        ? `📖 Portedeki ${staffIdx + 1}/${staffSeq.length}. notayı seç veya nota üstüne dokun${sfHint}`
        : `✋ ${staffIdx + 1}/${staffSeq.length}. notaya dokun${sfHint}`;
    if (staffShowNames && !isSheetOnly) mark(cur.s, cur.f, 'target', nameOf(pcOf(cur.s, cur.f)));
    onPosClick = (s, f) => {
      playMidi(midi(s, f), 0, (cur.b || 1) * 0.75);
      judgeStaffStep('touch', midi(s, f), s, f);
    };
  } else {
    $('prompt').textContent = `🎯 Portedeki notayı tahtada bul (${cur.s + 1}. tel)`;
    onPosClick = (s, f) => {
      playMidi(midi(s, f));
      judgeStaffStep('touch', midi(s, f), s, f);
    };
  }
  updScore();
}

function playStaffSeq() {
  stopStaffTimer();
  staffIdx = 0;
  const step = () => {
    if (mode !== 'staff' || staffSub !== 'listen') { stopStaffTimer(); return; }
    if (staffIdx >= staffSeq.length) {
      stopStaffTimer();
      setFb('Dizi tamamlandı! "🔄 Yeni Nota Sayfası" veya "📖 Sadece Notadan Çal" ile sen dene.', 'ok');
      return;
    }
    const cur = staffSeq[staffIdx];
    const durS = (cur.b || 1) * 0.78;
    updateStaffView();
    playMidi(midi(cur.s, cur.f), 0, durS);
    setFb(`${staffIdx + 1}. nota: ${nameBoth(pcOf(cur.s, cur.f))} · ${durLabelTr(cur.b)} (${cur.s + 1}. tel, ${cur.f}. perde)`, 'ok');
    staffIdx++;
    staffTimer = setTimeout(step, durS * 1000 + 80);
  };
  step();
}

function judgeStaffStep(kind, val, s, f) {
  const cur = staffSeq[staffIdx]; if (!cur) return;
  const targetM = midi(cur.s, cur.f), targetPc = pcOf(cur.s, cur.f);
  const ok = kind === 'touch' ? (val === targetM) : (val === targetPc);
  total++;
  if (ok) {
    correct++; streak++; record(cur.s, cur.f, true);
    mark(cur.s, cur.f, 'right', nameOf(targetPc));
    setFb(`Doğru! ${nameBoth(targetPc)} 🎉`, 'ok');
    staffIdx++;
    updScore();
    if (staffIdx >= staffSeq.length) {
      const isSheetOnly = staffSub === 'sheet' || staffSheetOnly;
      drawStaffNotes(staffSeq.map(n => ({ s: n.s, f: n.f, b: n.b, state: 'hit', showName: true })), $('staff'), {
        large: isSheetOnly,
        multiLine: isSheetOnly && staffSeq.length > 4,
        notesPerRow: 4,
        showStringFret: staffShowStrFret,
      });
      setTimeout(() => { if (mode === 'staff') newStaffSeq(); }, 950);
    } else {
      setTimeout(() => { if (mode === 'staff') updateStaffView(); }, 420);
    }
  } else {
    streak = 0; record(cur.s, cur.f, false);
    if (s !== undefined) mark(s, f, 'wrong', nameOf(pcOf(s, f)));
    flashPos(cur.s, cur.f);
    const heard = (kind === 'mic' || kind === 'pc') ? `Seçilen/Duyulan: ${nameBoth(val)}. ` : '';
    setFb(`${heard}Aranan: ${nameBoth(targetPc)} (${cur.s + 1}. tel, ${cur.f}. perde)`, 'bad');
    updScore();
  }
}

let staffMicMute = 0;
async function startStaffMic() {
  if (micStream) { resetPitchTracker(true); return true; }
  if (!(await startMic(selectedMicId))) return false;
  resetPitchTracker(false);
  micTimer = setInterval(() => {
    if (!analyser || !actx || mode !== 'staff' || (staffSub !== 'step' && staffSub !== 'sheet')) return;
    if (actx.currentTime < staffMicMute) { detectPitch(false); resetPitchTracker(false); return; }
    const ev = pollNoteEvent();
    if (!ev) return;
    if (ev.sustain) {
      $('micStatus').textContent = `🎤 Önceki tel uzuyor (${nameOf(ev.pc)}) — yeni notayı çal`;
      return;
    }
    $('micStatus').textContent = `🎤 Duyulan: ${nameBoth(ev.pc)} (${ev.freq.toFixed(0)} Hz)`;
    if (ev.triggered) judgeStaffStep('mic', ev.pc);
  }, 60);
  return true;
}

// ---------- Akort Aleti (Yarı Dairesel Sent Kadranı + Ölçülen/Hedef Hz + Tel Kartları) ----------
const STRING_FREQ = OPEN_MIDI.map(m => 440 * Math.pow(2, (m - 69) / 12));
const STRING_OCT = [4, 3, 3, 3, 2, 2]; // E4, B3, G3, D3, A2, E2
let tunerString = null, tCents = [], tMiss = 0, lastTunerFreq = 0;
let selectedMicId = localStorage.getItem('gn_mic_dev') || '';

function buildTunerUI() {
  const t = $('tuner');
  t.innerHTML = `
    <div class="tunerTopBar">
      <button id="tMicToggleBtn" class="tAlgoBadge tMicBtn" type="button"><i class="tDot" id="tMicDot"></i> <span id="tMicStateTxt">MİKROFON BAŞLATILIYOR…</span></button>
      <div class="tVuWrap" title="Canlı Mikrofon Ses Seviyesi">
        <span class="tVuLbl">SES</span>
        <div class="tVuTrack"><div id="tVuFill" class="tVuFill"></div></div>
      </div>
      <span class="tConcertBadge">440 Hz</span>
    </div>
    <div id="tMicDevRow" class="tMicDevRow" hidden>
      <label for="tMicSelect">🎙 Mikrofon:</label>
      <select id="tMicSelect" class="tMicSelect"></select>
    </div>
    <div class="tStrCard">
      <div class="tStrHead">
        <span>🎚 Tel Seçimi &amp; Dinleme</span>
        <button id="tAuto" class="tAutoToggle">Oto Algıla</button>
      </div>
      <div id="tStr"></div>
    </div>
    <div class="tGaugeCard">
      <div class="tArcWrap">
        <svg viewBox="0 0 320 180" class="tArcSvg">
          <defs>
            <linearGradient id="pesGrad" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stop-color="#38393c"/>
              <stop offset="85%" stop-color="#fabc4d"/>
              <stop offset="100%" stop-color="#4edea3"/>
            </linearGradient>
            <linearGradient id="tizGrad" x1="0%" x2="100%" y1="0%" y2="0%">
              <stop offset="0%" stop-color="#4edea3"/>
              <stop offset="35%" stop-color="#ffb4ab"/>
              <stop offset="100%" stop-color="#ff535b"/>
            </linearGradient>
          </defs>
          <path d="M 35 155 A 125 125 0 0 1 285 155" fill="none" stroke="#292a2d" stroke-linecap="round" stroke-width="12"/>
          <path d="M 35 155 A 125 125 0 0 1 150 30" fill="none" opacity="0.7" stroke="url(#pesGrad)" stroke-linecap="round" stroke-width="6"/>
          <path d="M 170 30 A 125 125 0 0 1 285 155" fill="none" opacity="0.7" stroke="url(#tizGrad)" stroke-linecap="round" stroke-width="6"/>
          <path d="M 148 30 A 125 125 0 0 1 172 30" fill="none" stroke="#4edea3" stroke-linecap="round" stroke-width="10"/>
          <line stroke="#9d8f7c" stroke-width="2" x1="35" x2="47" y1="155" y2="150"/>
          <text fill="#9d8f7c" font-size="10" font-weight="700" text-anchor="middle" x="30" y="172">-50</text>
          <line stroke="#9d8f7c" stroke-width="2" x1="68" x2="80" y1="96" y2="99"/>
          <text fill="#9d8f7c" font-size="10" font-weight="700" text-anchor="middle" x="54" y="96">-30</text>
          <line stroke="#fabc4d" stroke-width="2.5" x1="123" x2="129" y1="46" y2="58"/>
          <text fill="#fabc4d" font-size="10" font-weight="700" text-anchor="middle" x="114" y="40">-10</text>
          <line stroke="#4edea3" stroke-width="3.5" x1="160" x2="160" y1="20" y2="38"/>
          <circle cx="160" cy="14" fill="#4edea3" r="3.5"/>
          <text fill="#4edea3" font-size="11" font-weight="800" text-anchor="middle" x="160" y="8">0</text>
          <line stroke="#fabc4d" stroke-width="2.5" x1="197" x2="191" y1="46" y2="58"/>
          <text fill="#fabc4d" font-size="10" font-weight="700" text-anchor="middle" x="206" y="40">+10</text>
          <line stroke="#9d8f7c" stroke-width="2" x1="252" x2="240" y1="96" y2="99"/>
          <text fill="#9d8f7c" font-size="10" font-weight="700" text-anchor="middle" x="266" y="96">+30</text>
          <line stroke="#9d8f7c" stroke-width="2" x1="285" x2="273" y1="155" y2="150"/>
          <text fill="#9d8f7c" font-size="10" font-weight="700" text-anchor="middle" x="290" y="172">+50</text>
          <g id="needle" class="idle" transform="rotate(0 160 155)">
            <line id="needleLine" stroke="#fabc4d" stroke-linecap="round" stroke-width="3.5" x1="160" x2="160" y1="155" y2="28"/>
            <polygon id="needleTip" fill="#fabc4d" points="160,18 155,32 165,32"/>
          </g>
          <circle cx="160" cy="155" fill="#1b1b1f" r="12" stroke="#fabc4d" stroke-width="3"/>
          <circle cx="160" cy="155" fill="#fabc4d" r="4.5"/>
        </svg>
      </div>
      <div id="tCents" class="tCentsPill">Bir tel çalın</div>
    </div>
    <div class="tDetailCard">
      <div class="tDetTop">
        <div id="tNote" class="tBigNote">–</div>
        <div id="tStatusBadge" class="tStatusBadge">○ Akort Aranıyor</div>
      </div>
      <div class="tFreqRow">
        <div class="tFreqCol">
          <small>ÖLÇÜLEN FREKANS</small>
          <b id="tMeasHz">– Hz</b>
        </div>
        <div class="tFreqDiv"></div>
        <div class="tFreqCol right">
          <small>HEDEF FREKANS</small>
          <b id="tTargetHz" class="gold">– Hz</b>
        </div>
      </div>
      <div id="tHint" class="tHintBanner">Gitarınızdan bir tel tınlatın</div>
    </div>
    <div id="tBtns">
      <button id="tRef" class="tRefBtn">🔊 Referans Gitar Tınısı Dinle</button>
    </div>`;
  const box = $('tStr');
  for (let s = 5; s >= 0; s--) {
    const b = document.createElement('button'); b.dataset.s = s;
    const pc = OPEN_MIDI[s] % 12;
    b.innerHTML = `<span class="tsNum">${s + 1}</span><b class="tsEn">${NAMES_EN[pc]}<sub>${STRING_OCT[s]}</sub></b><small class="tsTr">${NAMES_TR[pc]}</small>`;
    b.onclick = () => {
      tunerString = s; tCents = []; refreshTunerButtons(); playMidi(OPEN_MIDI[s]);
      tunerMuteUntil = (actx ? actx.currentTime : 0) + 1.15;
      if ($('tTargetHz')) $('tTargetHz').textContent = STRING_FREQ[s].toFixed(2) + ' Hz';
      if ($('tRef')) $('tRef').textContent = `🔊 Referans Gitar Tınısı Dinle (${NAMES_TR[pc]} - ${STRING_FREQ[s].toFixed(1)} Hz)`;
    };
    box.appendChild(b);
  }
  $('tAuto').onclick = () => { tunerString = null; tCents = []; refreshTunerButtons(); };
  $('tRef').onclick = () => {
    const s = tunerString !== null ? tunerString : 0;
    tunerMuteUntil = (actx ? actx.currentTime : 0) + 1.15;
    playMidi(OPEN_MIDI[s]);
  };
  const mBtn = $('tMicToggleBtn');
  if (mBtn) {
    mBtn.onclick = async () => {
      stopMic();
      if (await startMic(selectedMicId)) {
        updateTunerMicStatus(true);
        micTimer = setInterval(tunerTick, 50);
      } else {
        updateTunerMicStatus(false);
      }
    };
  }
  const mSel = $('tMicSelect');
  if (mSel) {
    mSel.onchange = async e => {
      selectedMicId = e.target.value;
      localStorage.setItem('gn_mic_dev', selectedMicId);
      stopMic();
      if (await startMic(selectedMicId)) {
        updateTunerMicStatus(true);
        micTimer = setInterval(tunerTick, 50);
      }
    };
  }
  refreshTunerButtons();
}

function updateTunerMicStatus(active, errMsg) {
  const txt = $('tMicStateTxt'), dot = $('tMicDot'), btn = $('tMicToggleBtn');
  if (txt) txt.textContent = active ? 'MİKROFON DİNLİYOR' : '🎤 MİKROFONU BAŞLAT (DOKUN)';
  if (dot) dot.style.background = active ? '#4edea3' : '#ff535b';
  if (btn) btn.classList.toggle('micOff', !active);
  if (!active) {
    if ($('tStatusBadge')) {
      $('tStatusBadge').textContent = '⚠ Mikrofon Bekleniyor';
      $('tStatusBadge').className = 'tStatusBadge warn';
    }
    if ($('tHint')) {
      $('tHint').innerHTML = `<span>${errMsg || 'Tarayıcıda mikrofonu etkinleştirmek için üstteki <b>"🎤 MİKROFONU BAŞLAT"</b> butonuna dokunun ve izin verin.'}</span>`;
      $('tHint').className = 'tHintBanner bad';
    }
  } else {
    if ($('tStatusBadge') && $('tStatusBadge').textContent.includes('Bekleniyor')) {
      $('tStatusBadge').textContent = '○ Dinliyor… Tel Çalın';
      $('tStatusBadge').className = 'tStatusBadge';
    }
    if ($('tHint') && $('tHint').textContent.includes('etkinleştirmek')) {
      $('tHint').textContent = 'Gitarınızdan bir tel tınlatın — mikrofon dinliyor';
      $('tHint').className = 'tHintBanner';
    }
  }
}

async function populateMicDevices() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
  try {
    const devs = await navigator.mediaDevices.enumerateDevices();
    const mics = devs.filter(d => d.kind === 'audioinput');
    const row = $('tMicDevRow'), sel = $('tMicSelect');
    if (!row || !sel) return;
    if (mics.length <= 1) { row.hidden = true; return; }
    row.hidden = false;
    const activeTrack = micStream && micStream.getAudioTracks()[0];
    const activeDevId = (activeTrack && activeTrack.getSettings && activeTrack.getSettings().deviceId) || selectedMicId;
    sel.innerHTML = mics.map((m, idx) => {
      const lbl = m.label || `Mikrofon ${idx + 1}`;
      const isSel = m.deviceId === activeDevId ? 'selected' : '';
      return `<option value="${m.deviceId}" ${isSel}>${lbl}</option>`;
    }).join('');
  } catch (e) { }
}

function refreshTunerButtons() {
  document.querySelectorAll('#tStr button').forEach(b => b.classList.toggle('sel', +b.dataset.s === tunerString));
  if ($('tAuto')) {
    $('tAuto').classList.toggle('sel', tunerString === null);
    $('tAuto').textContent = tunerString === null ? '✓ Oto Algıla: Açık' : 'Oto Algıla';
  }
}

let tunerMuteUntil = 0;
async function startTuner() {
  onPosClick = () => { };
  $('prompt').textContent = '🎚 Hassas Gitar Akort Aleti';
  $('levelDesc').textContent = 'Teli çal; ibre sol = tel gevşek (sık), sağ = tel fazla gergin (gevşet). Yeşil bölge akort tamam.';
  buildTunerUI(); tCents = []; tMiss = 0;
  const ok = await startMic(selectedMicId);
  updateTunerMicStatus(ok, lastMicError);
  if (!ok) return;
  await populateMicDevices();
  clearInterval(micTimer);
  micTimer = setInterval(tunerTick, 50);
}

function tunerTick() {
  if (!analyser) return;
  if (actx && actx.state !== 'running') {
    try { actx.resume(); } catch (e) { }
  }
  if (actx && actx.currentTime < tunerMuteUntil) {
    detectPitch(true);
    return;
  }
  const f = detectPitch(true);
  const vu = $('tVuFill');
  if (vu) {
    const pct = Math.min(100, Math.round(Math.pow(Math.min(1, lastRms * 14), 0.55) * 100));
    vu.style.width = pct + '%';
  }
  if (f < 0) { if (++tMiss > 16) setNeedle(null); return; }
  tMiss = 0;
  lastTunerFreq = f;
  const fold = ft => { const c = 1200 * Math.log2(f / ft); return c - 1200 * Math.round(c / 1200); };
  let s = tunerString;
  if (s === null) { s = 0; for (let i = 1; i < 6; i++) if (Math.abs(fold(STRING_FREQ[i])) < Math.abs(fold(STRING_FREQ[s]))) s = i; }
  tCents.push(fold(STRING_FREQ[s])); if (tCents.length > 5) tCents.shift();
  const med = [...tCents].sort((a, b) => a - b)[tCents.length >> 1];
  setNeedle(med, s, f);
}

function setNeedle(c, s, measuredHz) {
  const needle = $('needle'); if (!needle) return;
  if (c === null) {
    $('tNote').textContent = '–';
    $('tCents').textContent = 'Bir tel çalın';
    if ($('tMeasHz')) $('tMeasHz').textContent = '– Hz';
    if ($('tStatusBadge')) { $('tStatusBadge').textContent = '○ Dinliyor… Tel Çalın'; $('tStatusBadge').className = 'tStatusBadge'; }
    $('tHint').textContent = 'Gitarınızdan bir tel tınlatın — mikrofon dinliyor'; $('tHint').className = 'tHintBanner';
    needle.setAttribute('transform', 'rotate(0 160 155)');
    needle.setAttribute('class', 'idle');
    tCents = []; return;
  }
  const cl = Math.max(-50, Math.min(50, c));
  const deg = (cl / 50) * 76; // -76 deg .. +76 deg yay açısı
  needle.setAttribute('transform', `rotate(${deg.toFixed(1)} 160 155)`);
  const ok = Math.abs(c) <= 5;
  const near = Math.abs(c) <= 15;
  needle.setAttribute('class', ok ? 'ok' : near ? 'near' : 'far');
  const col = ok ? '#4edea3' : near ? '#fabc4d' : '#ff8b7a';
  if ($('needleLine')) $('needleLine').setAttribute('stroke', col);
  if ($('needleTip')) $('needleTip').setAttribute('fill', col);

  const pc = OPEN_MIDI[s] % 12;
  $('tNote').innerHTML = `<span class="bnEn">${NAMES_EN[pc]}<sub>${STRING_OCT[s]}</sub></span> <span class="bnTr">${nameOf(pc)} <small>(${s + 1}. Tel)</small></span>`;
  const zoneTxt = ok ? '(Tam Akort)' : c < 0 ? '(Pes Bölgesi)' : '(Tiz Bölgesi)';
  $('tCents').innerHTML = `<b>${(c > 0 ? '+' : '') + Math.round(c)} Cent</b> <small>${zoneTxt}</small>`;

  const targetF = STRING_FREQ[s];
  const curF = measuredHz || (targetF * Math.pow(2, c / 1200));
  if ($('tMeasHz')) $('tMeasHz').textContent = curF.toFixed(2) + ' Hz';
  if ($('tTargetHz')) $('tTargetHz').textContent = targetF.toFixed(2) + ' Hz';
  if ($('tRef')) $('tRef').textContent = `🔊 Referans Gitar Tınısı Dinle (${NAMES_TR[pc]} - ${targetF.toFixed(1)} Hz)`;

  // Aktif teli vurgula
  document.querySelectorAll('#tStr button').forEach(b => b.classList.toggle('activeStr', +b.dataset.s === s));

  const amt = Math.abs(c) < 15 ? 'Azıcık' : Math.abs(c) < 35 ? 'Biraz' : 'Epey';
  const diffHz = (targetF - curF);
  const diffStr = (diffHz >= 0 ? '+' : '') + diffHz.toFixed(2) + ' Hz';
  const h = $('tHint');
  const sb = $('tStatusBadge');
  if (ok) {
    h.innerHTML = `<span>✓ <b>Akort Tamam!</b> Tel tam frekansında tınlıyor.</span><b>0.0 Hz</b>`;
    h.className = 'tHintBanner ok';
    if (sb) { sb.textContent = '✓ Kusursuz Akort'; sb.className = 'tStatusBadge ok'; }
  } else if (c < 0) {
    h.innerHTML = `<span>⬆ <b>Teli ${amt} SIK</b> (Ses pes kalıyor)</span><b>${diffStr}</b>`;
    h.className = 'tHintBanner bad';
    if (sb) { sb.textContent = '⚠ Pes (Gevşek)'; sb.className = 'tStatusBadge warn'; }
  } else {
    h.innerHTML = `<span>⬇ <b>Teli ${amt} GEVŞET</b> (Ses fazla tiz)</span><b>${diffStr}</b>`;
    h.className = 'tHintBanner bad';
    if (sb) { sb.textContent = '⚠ Tiz (Gergin)'; sb.className = 'tStatusBadge warn'; }
  }
}

// ---------- Mikrofon, Hassasiyet Ayarı ve Yankı (Sustain) Korumalı Algılayıcı ----------
let micStream = null, micSource = null, micBoostGain = null, micSilentGain = null, analyser = null, buf = null, micLocked = false;
let lastRms = 0, lastMicError = '';
let micSens = localStorage.getItem('gn_mic_sens') || 'normal'; // 'sens' | 'normal' | 'strict'

const SENS_CFG = {
  sens: { rmsMin: 0.0022, onsetRatio: 1.45, centsChange: 65, stableTicks: 2 },
  normal: { rmsMin: 0.0045, onsetRatio: 1.65, centsChange: 75, stableTicks: 3 },
  strict: { rmsMin: 0.0110, onsetRatio: 1.95, centsChange: 90, stableTicks: 4 },
};

function renderMicBar() {
  const b = $('micBar');
  if (!b || b.hidden) return;
  b.innerHTML = `
    <div class="tipRow">
      <span style="font-size:.78rem;opacity:.8">🎤 Mikrofon Hassasiyeti:</span>
      <button data-ms="sens" class="pill ${micSens === 'sens' ? 'on' : ''}">Hassas (Web/Kısık Ses)</button>
      <button data-ms="normal" class="pill ${micSens === 'normal' ? 'on' : ''}">Normal</button>
      <button data-ms="strict" class="pill ${micSens === 'strict' ? 'on' : ''}">Yüksek (Yankı Önleyici)</button>
    </div>`;
  b.querySelectorAll('button[data-ms]').forEach(btn => btn.onclick = () => {
    micSens = btn.dataset.ms; localStorage.setItem('gn_mic_sens', micSens);
    renderMicBar();
  });
}

let ptState = {
  lockedFreq: -1,
  lockedPc: -1,
  minRmsAfterLock: 1,
  rearmedByOnset: false,
  quietCount: 0,
  prevRms1: 0,
  prevRms2: 0,
  candPc: -1,
  candCount: 0,
};

function resetPitchTracker(keepLock) {
  if (!keepLock) {
    ptState.lockedFreq = -1;
    ptState.lockedPc = -1;
  }
  ptState.minRmsAfterLock = lastRms || 1;
  ptState.rearmedByOnset = false;
  ptState.quietCount = 0;
  ptState.candPc = -1;
  ptState.candCount = 0;
}

function lockCurrentPitch(freq, pc) {
  ptState.lockedFreq = freq;
  ptState.lockedPc = pc;
  ptState.minRmsAfterLock = lastRms || 1;
  ptState.rearmedByOnset = false;
  ptState.quietCount = 0;
  ptState.candPc = -1;
  ptState.candCount = 0;
}

function pollNoteEvent() {
  const cfg = SENS_CFG[micSens] || SENS_CFG.normal;
  const f = detectPitch(false);
  const r = lastRms;
  const prevMin = Math.min(ptState.prevRms1, ptState.prevRms2, ptState.minRmsAfterLock);
  const onset = r > cfg.rmsMin * 1.7 && r > prevMin * cfg.onsetRatio;
  ptState.prevRms2 = ptState.prevRms1;
  ptState.prevRms1 = r;

  if (r < ptState.minRmsAfterLock) ptState.minRmsAfterLock = r;
  if (onset) ptState.rearmedByOnset = true;

  if (f < 0 || r < cfg.rmsMin) {
    ptState.quietCount++;
    if (ptState.quietCount >= 3) {
      ptState.lockedFreq = -1;
      ptState.lockedPc = -1;
      ptState.rearmedByOnset = true;
    }
    ptState.candCount = 0;
    return null;
  }
  ptState.quietCount = 0;

  const m = Math.round(69 + 12 * Math.log2(f / 440));
  const pc = ((m % 12) + 12) % 12;

  if (ptState.lockedFreq > 0) {
    const centsDiff = Math.abs(1200 * Math.log2(f / ptState.lockedFreq));
    const foldedDiff = Math.abs(centsDiff - 1200 * Math.round(centsDiff / 1200));
    const distinctPitch = foldedDiff >= cfg.centsChange && pc !== ptState.lockedPc;

    if (!distinctPitch && !ptState.rearmedByOnset) {
      return { freq: f, pc, midi: m, triggered: false, sustain: true };
    }
  }

  if (pc === ptState.candPc) {
    ptState.candCount++;
  } else {
    ptState.candPc = pc;
    ptState.candCount = 1;
  }

  if (ptState.candCount >= cfg.stableTicks) {
    lockCurrentPitch(f, pc);
    return { freq: f, pc, midi: m, triggered: true, sustain: false };
  }
  return { freq: f, pc, midi: m, triggered: false, sustain: false };
}

async function startMic(preferredDeviceId) {
  lastMicError = '';
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    lastMicError = '⚠️ Tarayıcı mikrofon erişimi için HTTPS veya localhost bağlantısı gerektiriyor.';
    $('prompt').textContent = lastMicError;
    return false;
  }
  if ('audioSession' in navigator) {
    try { navigator.audioSession.type = 'play-and-record'; } catch (e) { }
  }
  const devConstraint = preferredDeviceId ? { deviceId: { exact: preferredDeviceId } } : {};
  try {
    micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        ...devConstraint,
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: true,
      }
    });
  } catch (e1) {
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e2) {
      lastMicError = '⚠️ Mikrofon izni verilmedi veya mikrofon bulunamadı. Tarayıcı adres çubuğundan mikrofon iznini açın.';
      $('prompt').textContent = lastMicError;
      return false;
    }
  }
  actx = actx || new (window.AudioContext || window.webkitAudioContext)();
  if (actx.state !== 'running') {
    try { await actx.resume(); } catch (e) { }
  }
  micSource = actx.createMediaStreamSource(micStream);
  micBoostGain = actx.createGain();
  micBoostGain.gain.value = 2.6; // Web/dizüstü mikrofonları için ön-yükseltici (pre-amp)
  analyser = actx.createAnalyser();
  analyser.fftSize = 4096;
  analyser.smoothingTimeConstant = 0;
  micSilentGain = actx.createGain();
  micSilentGain.gain.value = 0; // Hoparlöre ses vermeden Web Audio grafiğini canlı tutar
  micSource.connect(micBoostGain);
  micBoostGain.connect(analyser);
  analyser.connect(micSilentGain);
  micSilentGain.connect(actx.destination);
  buf = new Float32Array(analyser.fftSize);
  resetPitchTracker(false);
  return true;
}

async function startMicMode() {
  onPosClick = () => { };
  if (!(await startMic(selectedMicId))) return;
  nextMic();
  micTimer = setInterval(micTick, 55);
}

function stopMic() {
  clearInterval(micTimer); micTimer = null;
  if (micSource) { try { micSource.disconnect(); } catch (e) { } micSource = null; }
  if (micBoostGain) { try { micBoostGain.disconnect(); } catch (e) { } micBoostGain = null; }
  if (analyser) { try { analyser.disconnect(); } catch (e) { } analyser = null; }
  if (micSilentGain) { try { micSilentGain.disconnect(); } catch (e) { } micSilentGain = null; }
  if (micStream) micStream.getTracks().forEach(t => t.stop());
  micStream = null;
}

function nextMic() {
  clearMarks(); current = pickTarget(current); micLocked = false; setFb('');
  resetPitchTracker(true);
  const pc = pcOf(current.s, current.f);
  $('prompt').textContent = `${current.s + 1}. telde "${nameBoth(pc)}" çal`;
  updScore();
}

function detectPitch(isTuner) {
  if (!analyser || !buf) return -1;
  analyser.getFloatTimeDomainData(buf);
  let rms = 0; for (const v of buf) rms += v * v; rms = Math.sqrt(rms / buf.length);
  lastRms = rms;
  const cfg = SENS_CFG[micSens] || SENS_CFG.normal;
  const minRms = isTuner ? Math.min(0.0014, cfg.rmsMin * 0.5) : cfg.rmsMin;
  if (rms < minRms) return -1;
  const sr = actx.sampleRate, half = buf.length >> 1;
  const minTau = Math.floor(sr / 750), maxTau = Math.min(half - 1, Math.floor(sr / 65));
  const cm = new Float32Array(maxTau + 2);
  let run = 0; cm[0] = 1;
  for (let tau = 1; tau <= maxTau + 1; tau++) {
    let d = 0;
    for (let i = 0; i < half; i++) { const x = buf[i] - buf[i + tau]; d += x * x; }
    run += d; cm[tau] = run ? d * tau / run : 1;
  }
  const thresh = isTuner ? 0.22 : 0.18;
  let chosenTau = -1;
  for (let tau = minTau; tau <= maxTau; tau++) {
    if (cm[tau] < thresh) {
      while (tau + 1 <= maxTau && cm[tau + 1] < cm[tau]) tau++;
      chosenTau = tau;
      break;
    }
  }
  if (chosenTau < 0) {
    let bestTau = minTau, bestVal = cm[minTau];
    for (let tau = minTau + 1; tau <= maxTau; tau++) {
      if (cm[tau] < bestVal) { bestVal = cm[tau]; bestTau = tau; }
    }
    if (bestVal < (isTuner ? 0.32 : 0.25)) chosenTau = bestTau;
  }
  if (chosenTau < 0) return -1;
  const a = cm[chosenTau - 1], b = cm[chosenTau], c2 = cm[chosenTau + 1], den = a - 2 * b + c2;
  const t = den ? chosenTau + (a - c2) / (2 * den) : chosenTau;
  const freq = sr / t;
  return (freq >= 65 && freq <= 750) ? freq : -1;
}

function micTick() {
  if (!analyser || micLocked) return;
  if (actx && actx.state !== 'running') {
    try { actx.resume(); } catch (e) { }
  }
  const ev = pollNoteEvent();
  if (!ev) { $('micStatus').textContent = '🎤 Dinliyorum…'; return; }
  if (ev.sustain) {
    $('micStatus').textContent = `🎤 Önceki tel uzuyor (${nameOf(ev.pc)}) — yeni notayı çal`;
    return;
  }
  $('micStatus').textContent = `🎤 Duyulan: ${nameBoth(ev.pc)} (${ev.freq.toFixed(0)} Hz)`;
  if (!ev.triggered) return;
  const target = pcOf(current.s, current.f);
  if (ev.pc === target) {
    micLocked = true; total++; correct++; streak++; record(current.s, current.f, true);
    mark(current.s, current.f, 'right', nameOf(ev.pc)); setFb('Doğru! 🎉', 'ok'); updScore();
    setTimeout(nextMic, 900);
  } else {
    total++; streak = 0; record(current.s, current.f, false);
    setFb(`${nameBoth(ev.pc)} duydum, hedef ${nameBoth(target)}. İpucu: ${hint(current.s, current.f)}`, 'bad'); updScore();
  }
}

// ---------- İlerleme ekranı ----------
function showProgress() {
  $('prompt').textContent = '📊 Ustalık & Leitner İlerleme Haritası';
  $('levelDesc').textContent = 'Yeşil = Ustalaşıldı (Kutu 3-4), Kehribar = Gelişiyor (Kutu 1-2), Kırmızı = Çalışılmalı. Noktaya dokunarak detay gör.';
  let sumR = 0, sumW = 0, mastered = 0;
  const boxes = [0, 0, 0, 0, 0];
  const lPos = levelPositions();
  for (const { s, f } of lPos) {
    const st = stats[s + '-' + f];
    const g = posEl(s, f); if (!g) continue;
    g.classList.add('target');
    mark(s, f, 'target', nameOf(pcOf(s, f)));
    const c = g.querySelector('circle');
    const bx = st ? (st.box || 0) : 0;
    boxes[Math.min(4, Math.max(0, bx))]++;
    if (bx >= 3) mastered++;
    if (st && (st.r + st.w) > 0) {
      const acc = st.r / (st.r + st.w); sumR += st.r; sumW += st.w;
      c.setAttribute('style', `fill:hsl(${Math.round(acc * 135)},68%,42%);stroke:#e3e2e6;stroke-width:1.5px`);
    }
  }
  const tot = sumR + sumW;
  const pct = tot ? Math.round(100 * sumR / tot) : 0;
  const div = $('answers'); div.innerHTML = '';
  const box = document.createElement('div');
  box.className = 'progCard';
  box.style.width = '100%';
  box.innerHTML = `
    <div class="songMetaGrid" style="margin-bottom:10px">
      <div class="smCard"><span class="smLbl">TOPLAM CEVAP</span><b class="smVal">${tot}</b><small class="smSub">${sumR} doğru · ${sumW} yanlış</small></div>
      <div class="smCard"><span class="smLbl">DOĞRULUK</span><b class="smVal" style="color:var(--secondary)">%${pct}</b><small class="smSub">İsabet oranı</small></div>
      <div class="smCard"><span class="smLbl">USTALIK (K3-4)</span><b class="smVal">${mastered}/${lPos.length}</b><small class="smSub">Bu seviyedeki nota</small></div>
    </div>
    <div class="leitnerRow">
      <span class="ltBox">⏳ Yeni: <b>${boxes[0]}</b></span>
      <span class="ltBox">📦 Kutu 1: <b>${boxes[1]}</b></span>
      <span class="ltBox">📦 Kutu 2: <b>${boxes[2]}</b></span>
      <span class="ltBox">✨ Kutu 3: <b>${boxes[3]}</b></span>
      <span class="ltBox ok">🏆 Kutu 4: <b>${boxes[4]}</b></span>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px">
      <small style="color:var(--on-surface-var)">Klavyedeki her daireye dokunarak kutu ve doğruluk geçmişini görebilirsin.</small>
      <button id="progResetBtn" class="pill">🗑 Sıfırla</button>
    </div>`;
  div.appendChild(box);
  const reset = $('progResetBtn');
  if (reset) reset.onclick = () => { if (confirm('Tüm ilerleme silinsin mi?')) { stats = {}; saveStats(); setMode('progress'); } };
  onPosClick = (s, f) => {
    const st = stats[s + '-' + f] || { r: 0, w: 0, box: 0 };
    playMidi(midi(s, f));
    setFb(`${s + 1}. tel ${f}. perde (${nameBoth(pcOf(s, f))}): ${st.r} doğru, ${st.w} yanlış · Leitner Kutu ${st.box || 0}/4`, 'ok');
  };
}

// ---------- Özel seviye paneli ----------
let customOpen = false;
function renderCustom() {
  const box = $('custom'), L = LEVELS[level];
  const show = L.custom && !['tuner', 'song', 'chord'].includes(mode);
  box.hidden = !show; box.innerHTML = '';
  if (!show) return;
  const opts = [...Array(13).keys()].map(n => `<option value="${n}">${n}</option>`).join('');
  const sList = L.strings.map(s => s + 1).join(',');
  box.innerHTML = `<details class="customDetails" ${customOpen ? 'open' : ''}>
    <summary>⚙️ Özel Filtre: <b>${sList}. Teller · Perde ${L.frets[0]}–${L.frets[1]} · ${L.nat ? 'Doğal' : 'Diyez/Bemol Dahil'}</b> <span class="rArr">▾</span></summary>
    <div class="customBody">
      <div class="cRow"><span>Teller:</span>${[0, 1, 2, 3, 4, 5].map(s => `<label class="cb"><input type="checkbox" data-s="${s}" ${L.strings.includes(s) ? 'checked' : ''}>${s + 1}</label>`).join('')}<button id="cAll">Tümü</button></div>
      <div class="cRow"><label>Perde <select id="cMin">${opts}</select> – <select id="cMax">${opts}</select></label>
      <label class="cb"><input type="checkbox" id="cSharp" ${L.nat ? '' : 'checked'}> Diyez/bemol dahil</label></div>
    </div>
  </details>`;
  const det = box.querySelector('details');
  if (det) det.ontoggle = () => { customOpen = det.open; };
  $('cMin').value = L.frets[0]; $('cMax').value = L.frets[1];
  const apply = (all) => {
    customOpen = true;
    const prev = JSON.stringify({ strings: L.strings, frets: L.frets, nat: L.nat });
    let strings = all ? [0, 1, 2, 3, 4, 5] : [...box.querySelectorAll('input[data-s]')].filter(i => i.checked).map(i => +i.dataset.s);
    let a = +$('cMin').value, b = +$('cMax').value; if (a > b) [a, b] = [b, a];
    L.strings = strings; L.frets = [a, b]; L.nat = !$('cSharp').checked;
    if (!strings.length || levelPositions().length < 2) {
      Object.assign(L, JSON.parse(prev)); setFb('Bu seçimde yeterli nota yok, değişiklik geri alındı.', 'bad'); renderCustom(); return;
    }
    localStorage.setItem('gn_custom', JSON.stringify({ strings: L.strings, frets: L.frets, nat: L.nat }));
    setMode(mode);
  };
  box.querySelectorAll('input,select').forEach(e => e.onchange = () => apply(false));
  $('cAll').onclick = () => apply(true);
}

// ---------- Çapraz Platform Algılama & Kurulum Rehberi (iOS / Android / Masaüstü) ----------
let deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredInstallPrompt = e;
  const ib = $('installBtn');
  if (ib) ib.hidden = false;
});

function initPlatformUI() {
  const ua = navigator.userAgent || '';
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true || !!window.Capacitor;
  const root = document.documentElement;
  root.classList.add(isIOS ? 'plt-ios' : isAndroid ? 'plt-android' : 'plt-desktop');
  if (isStandalone) root.classList.add('plt-standalone');

  const ob = $('orientBtn');
  if (ob) {
    ob.onclick = () => {
      boardOrient = isV ? 'h' : 'v';
      localStorage.setItem('gn_orient', boardOrient);
      if (mode !== 'mic') setMode(mode);
      else drawBoard();
    };
  }

  const ib = $('installBtn');
  if (ib) {
    if (isIOS && !isStandalone) ib.textContent = '🍎 iOS Kur';
    else if (isAndroid && !isStandalone) ib.textContent = '🤖 Kur';
    else ib.textContent = '💻 Platform';
    ib.onclick = async () => {
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        await deferredInstallPrompt.userChoice;
        deferredInstallPrompt = null;
        return;
      }
      showPlatformModal(isIOS, isAndroid, isStandalone);
    };
  }
}

function showPlatformModal(isIOS, isAndroid, isStandalone) {
  const m = $('platModal');
  if (!m) return;
  const curPlt = isIOS ? '🍎 iOS (iPhone / iPad)' : isAndroid ? '🤖 Android Cihaz' : '💻 Masaüstü / Web Tarayıcı';
  m.innerHTML = `
    <div class="pmCard">
      <div class="pmHead">
        <div>
          <span class="ascTag">ÇAPRAZ PLATFORM &amp; KURULUM</span>
          <h3>Nota &amp; Fretboard Atölyesi</h3>
        </div>
        <button id="pmClose" class="npClose" aria-label="Kapat">✕</button>
      </div>
      <div class="pmStatus">Aktif Cihaz: <b>${curPlt}</b> ${isStandalone ? '<span class="pmBadge">✓ Tam Ekran Kurulu</span>' : ''}</div>
      <div class="pmGrid">
        <div class="pmBox ${isIOS ? 'hi' : ''}">
          <b>🍎 iPhone &amp; iPad (iOS Safari)</b>
          <ol>
            <li>Bu sayfayı <b>Safari</b> tarayıcısında açın.</li>
            <li>Ekranın altındaki <b>Paylaş (⬆️)</b> simgesine dokunun.</li>
            <li><b>"Ana Ekrana Ekle"</b> seçeneğine dokunup <b>Ekle</b>'ye basın.</li>
          </ol>
        </div>
        <div class="pmBox ${isAndroid ? 'hi' : ''}">
          <b>🤖 Android Telefon &amp; Tablet</b>
          <ol>
            <li>Tarayıcı menüsünden (⋮) <b>"Uygulamayı Yükle / Ana ekrana ekle"</b> seçeneğine dokunun veya doğrudan <b>APK</b> paketini indirin:</li>
          </ol>
          <a href="GitarNota-Atolyesi.apk" download class="pill accent" style="display:inline-block;margin-top:8px;text-decoration:none">📥 Android APK İndir (4.4 MB)</a>
        </div>
        <div class="pmBox ${!isIOS && !isAndroid ? 'hi' : ''}">
          <b>💻 Bilgisayar (Windows / macOS)</b>
          <ol>
            <li>Chrome veya Edge adres çubuğunun sağındaki <b>📲 Uygulamayı Yükle</b> simgesine tıklayarak masaüstü uygulaması olarak çalıştırabilirsiniz.</li>
            <li>Üstteki <b>📏 Dikey / Yatay</b> butonuyla klavye yönünü dilediğiniz zaman değiştirebilirsiniz.</li>
          </ol>
        </div>
      </div>
    </div>`;
  m.hidden = false;
  $('pmClose').onclick = () => { m.hidden = true; };
  m.onclick = e => { if (e.target === m) m.hidden = true; };
}

// ---------- Başlangıç ----------
function init() {
  initPlatformUI();
  const sel = $('level');
  const groups = [[0, 'Doğal notalar'], [7, 'Diyezli notalar (♯ / ♭)'], [12, 'Özel']]; let og = null;
  LEVELS.forEach((l, i) => {
    const g = groups.find(x => x[0] === i); if (g) { og = document.createElement('optgroup'); og.label = g[1]; sel.appendChild(og); }
    const o = document.createElement('option'); o.value = i; o.textContent = l.t; og.appendChild(o);
  });
  sel.value = level;
  sel.onchange = () => { level = +sel.value; localStorage.setItem('gn_level', level); setMode(mode); };
  document.querySelectorAll('#tabs button').forEach(b => b.onclick = () => setMode(b.dataset.mode));
  let lastV = vertical();
  window.addEventListener('resize', () => { if (vertical() !== lastV) { lastV = vertical(); if (mode !== 'mic') setMode(mode); } });
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => { });
  setMode('learn');
  if (!localStorage.getItem('gn_seen')) onboarding();
}
function onboarding() {
  const steps = [
    ['🎸 Hoş geldin!', 'Gitar tahtasında notaların yerini pratik kurallarla ve ezgilerle öğreneceksin. 1. tel en ince, 6. tel en kalın teldir.'],
    ['🎓 Kurallar & Porte', '"Öğren" sekmesinde 5. Perde ve Oktav kurallarını keşfet. "Porte" sekmesinde notaları adım adım çal.'],
    ['🇹🇷 Türk Ezgileri & Mikrofon', 'Seviyene göre Bülbülüm Altın Kafeste, Katibim, Uzun İnce Bir Yoldayım ve klasik eserleri gitarınla çal!'],
  ];
  let i = 0;
  const ov = document.createElement('div'); ov.id = 'onb';
  const render = () => {
    ov.innerHTML = `<div class="card"><h2>${steps[i][0]}</h2><p>${steps[i][1]}</p><button>${i < steps.length - 1 ? 'İleri' : 'Başla'}</button></div>`;
    ov.querySelector('button').onclick = () => { if (++i < steps.length) render(); else { localStorage.setItem('gn_seen', 1); ov.remove(); } };
  };
  render(); document.body.appendChild(ov);
}
init();
