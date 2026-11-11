'use strict';
// ---------- Şarkı modu: Gerçek Ritimli Türk Ezgileri, Klasik Melodiler, Porte Görünümü ve Yankı Korumalı Mikrofon ----------
const POS = {
  E2: [6, 0], F2: [6, 1], Fs2: [6, 2], G2: [6, 3], Gs2: [6, 4],
  A2: [5, 0], Bb2: [5, 1], B2: [5, 2], C3: [5, 3], Cs3: [5, 4],
  D3: [4, 0], Ds3: [4, 1], E3: [4, 2], F3: [4, 3], Fs3: [4, 4],
  G3: [3, 0], Gs3: [3, 1], A3: [3, 2], Bb3: [3, 3],
  B3: [2, 0], C4: [2, 1], Cs4: [2, 2], D4: [2, 3], Ds4: [2, 4],
  E4: [1, 0], F4: [1, 1], Fs4: [1, 2], G4: [1, 3], Gs4: [1, 4], A4: [1, 5], B4: [1, 7], C5: [1, 8], D5: [1, 10], E5: [1, 12],
};
const S = str => str.trim().split(/\s+/).map(t => {
  const [n, b] = t.split(':'); const [s, f] = POS[n];
  return { s: s - 1, f, b: b ? +b : 1 };
});

// Notasyon:
// :.5  = Sekizlik (½ vuruş, hızlı)
// :1   = Dörtlük (1 vuruş, normal)
// :1.5 = Noktalı dörtlük (1½ vuruş)
// :2   = İkilik (2 vuruş, uzun)
// :3   = Noktalı ikilik (3 vuruş)
const SONGS = [
  { id: 'walk', t: 'Tel Yürüyüşü (Açık Teller)', cat: 'Başlangıç', sub: 'Açık Tel Etüdü • 1–6. Tel', lv: 0, bpm: 84,
    notes: S('E2:1 E2:1 A2:1 A2:1 D3:1 D3:1 G3:2 B3:1 B3:1 E4:1 E4:1 B3:.5 G3:.5 D3:.5 A2:.5 E2:2') },
  { id: 'bulbul', t: '🇹🇷 Bülbülüm Altın Kafeste', cat: 'Türk Ezgisi', sub: 'Rumeli Türküsü • Uşşak Makamı', lv: 1, bpm: 88,
    notes: S('E4:1 F4:.5 G4:.5 F4:1 E4:1 D4:.5 E4:.5 D4:1 C4:2 B3:1 C4:.5 D4:.5 E4:1 D4:1 C4:.5 D4:.5 C4:1 B3:2 E4:1 D4:.5 C4:.5 D4:1 E4:1 D4:.5 C4:.5 B3:1 D4:1 C4:1 B3:2') },
  { id: 'ode', t: 'Neşe Ode (Beethoven)', cat: 'Klasik', sub: 'L. v. Beethoven • 9. Senfoni', lv: 1, bpm: 96,
    notes: S('E4:1 E4:1 F4:1 G4:1 G4:1 F4:1 E4:1 D4:1 C4:1 C4:1 D4:1 E4:1 E4:1.5 D4:.5 D4:2 E4:1 E4:1 F4:1 G4:1 G4:1 F4:1 E4:1 D4:1 C4:1 C4:1 D4:1 E4:1 D4:1.5 C4:.5 C4:2') },
  { id: 'mary', t: 'Küçük Kuzu', cat: 'Başlangıç', sub: 'Klasik Başlangıç Melodisi • 1–2. Tel', lv: 1, bpm: 96,
    notes: S('E4:1.5 D4:.5 C4:1 D4:1 E4:1 E4:1 E4:2 D4:1 D4:1 D4:2 E4:1 G4:1 G4:2 E4:1.5 D4:.5 C4:1 D4:1 E4:1 E4:1 E4:1 E4:1 D4:1 D4:1 E4:1 D4:1 C4:2') },
  { id: 'mid', t: 'Orta Tel Melodisi', cat: 'Etüt', sub: 'Pozisyon Çalışması • 3–4. Tel', lv: 2, bpm: 86,
    notes: S('G3:1 A3:.5 G3:.5 F3:1 E3:1 D3:.5 E3:.5 F3:1 G3:2 A3:1 G3:.5 F3:.5 E3:1 F3:1 D3:2') },
  { id: 'bass', t: 'Bas Yürüyüşü', cat: 'Etüt', sub: 'Başparmak (p) Etüdü • 5–6. Tel', lv: 3, bpm: 86,
    notes: S('A2:1 B2:.5 C3:.5 B2:1 A2:1 G2:.5 F2:.5 E2:2 E2:.5 F2:.5 G2:1 A2:.5 B2:.5 C3:1 B2:1 A2:2') },
  { id: 'uskudar', t: '🇹🇷 Üsküdar\'a Gider İken (Katibim)', cat: 'Türk Ezgisi', sub: 'Anonim İstanbul Türküsü • Nihavend', lv: 4, bpm: 92,
    notes: S('A3:.5 B3:.5 C4:1 D4:.5 E4:.5 E4:1 D4:.5 C4:.5 D4:1 B3:.5 C4:.5 A3:2 A3:.5 B3:.5 C4:1 D4:.5 E4:.5 E4:1 D4:.5 C4:.5 B3:1 C4:.5 B3:.5 A3:2') },
  { id: 'canakkale', t: '🇹🇷 Çanakkale Türküsü', cat: 'Türk Ezgisi', sub: 'Kastamonu Yöresi • Segâh Esintisi', lv: 4, bpm: 78,
    notes: S('E4:1.5 F4:.5 G4:1 E4:1 F4:1.5 D4:.5 E4:1 C4:1 D4:2 D4:1.5 E4:.5 F4:1 D4:1 E4:1.5 C4:.5 D4:1 B3:1 C4:1 A3:2') },
  { id: 'sarigelin', t: '🇹🇷 Sarı Gelin', cat: 'Türk Ezgisi', sub: 'Erzurum / Kafkas Türküsü • Kürdî', lv: 4, bpm: 82,
    notes: S('E4:1.5 D4:.5 C4:1 B3:1 A3:.5 B3:.5 C4:1 D4:2 D4:1.5 C4:.5 B3:1 A3:1 G3:.5 A3:.5 B3:1 A3:2') },
  { id: 'frere_s', t: 'Kardeş Jacques', cat: 'Dünya', sub: 'Fransız Halk Melodisi • Kanon', lv: 4, bpm: 96,
    notes: S('C4:1 D4:1 E4:1 C4:1 C4:1 D4:1 E4:1 C4:1 E4:1 F4:1 G4:2 E4:1 F4:1 G4:2 G4:.5 A3:.5 G4:.5 F4:.5 E4:1 C4:1 C4:1 G3:1 C4:2') },
  { id: 'uzunince', t: '🇹🇷 Uzun İnce Bir Yoldayım', cat: 'Türk Ezgisi', sub: 'Âşık Veysel Şatıroğlu • Hüseyni', lv: 5, bpm: 86,
    notes: S('E4:.5 E4:.5 E4:1 D4:.5 E4:.5 F4:1 E4:.5 D4:.5 C4:1 D4:.5 E4:.5 C4:1 D4:.5 B3:.5 C4:1 A3:2 D4:.5 D4:.5 D4:1 C4:.5 D4:.5 E4:1 D4:.5 C4:.5 B3:1 C4:.5 D4:.5 B3:1 C4:1 A3:2') },
  { id: 'twinkle', t: 'Küçük Yıldız', cat: 'Klasik', sub: 'W. A. Mozart • Ah! vous dirai-je', lv: 5, bpm: 94,
    notes: S('C4:1 C4:1 G4:1 G4:1 A4:1 A4:1 G4:2 F4:1 F4:1 E4:1 E4:1 D4:1 D4:1 C4:2 G4:1 G4:1 F4:1 F4:1 E4:1 E4:1 D4:2 C4:1 C4:1 G4:1 G4:1 A4:1 A4:1 G4:2 F4:1 F4:1 E4:1 E4:1 D4:1 D4:1 C4:2') },
  { id: 'hicaz_ince', t: '🇹🇷 İnce Tellerde Diyez Ezgisi', cat: 'Türk Ezgisi', sub: 'Hicaz Makamı Etüdü • 1–2. Tel', lv: 7, bpm: 86,
    notes: S('E4:1 F4:.5 Gs4:.5 A4:1 Gs4:.5 F4:.5 E4:1 Ds4:.5 E4:.5 F4:2 E4:1 D4:.5 Cs4:.5 D4:1 E4:.5 F4:.5 E4:1 C4:.5 B3:.5 E4:2') },
  { id: 'furelise', t: 'Für Elise (Beethoven · Diyezli)', cat: 'Klasik', sub: 'L. v. Beethoven • La Minör (Am)', lv: 10, bpm: 92,
    notes: S('E4:.5 Ds4:.5 E4:.5 Ds4:.5 E4:.5 B3:.5 D4:.5 C4:.5 A3:1.5 C3:.5 E3:.5 A3:.5 B3:1.5 E3:.5 Gs3:.5 B3:.5 C4:1.5 E3:.5 E4:.5 Ds4:.5 E4:.5 Ds4:.5 E4:.5 B3:.5 D4:.5 C4:.5 A3:2') },
  { id: 'greensleeves', t: 'Greensleeves (Diyezli)', cat: 'Dünya', sub: '16. Yüzyıl İngiliz Rönesans Ezgisi', lv: 10, bpm: 88,
    notes: S('A3:1 C4:2 D4:1 E4:1.5 Fs4:.5 E4:1 D4:2 B3:1 G3:1.5 A3:.5 B3:1 C4:2 A3:1 A3:1.5 Gs3:.5 A3:1 B3:2 Gs3:1 E3:2') },
  { id: 'samanyolu', t: '🇹🇷 Samanyolu (Diyezli)', cat: 'Türk Ezgisi', sub: 'Metin Bükey • Klasik Gitar Düzenlemesi', lv: 10, bpm: 88,
    notes: S('A4:1 E4:1 E4:2 D4:.5 F4:.5 E4:.5 D4:.5 C4:1 B3:1 A3:2 B3:.5 C4:.5 D4:1 B3:.5 C4:.5 A3:1 Gs3:1 E4:2') },
  { id: 'romance', t: 'Romance Anonimo (Klasik Gitar)', cat: 'Klasik', sub: 'İspanyol Klasik Başyapıtı • Mi Minör', lv: 11, bpm: 84,
    notes: S('B4:1 B4:1 B4:1 B4:1 A4:1 G4:1 G4:1 Fs4:1 E4:2 E4:1 G4:1 B4:1 E5:1 D5:1 C5:1 C5:1 B4:1 A4:2') },
];

const MODES = [['listen', '🎧', 'Dinle'], ['together', '🤝', 'Birlikte'], ['turns', '🔁', 'Sırayla'], ['solo', '🎸', 'Tek başıma']];
const MODE_HELP = {
  listen: 'Uygulama şarkıyı gerçek nota süreleriyle (dörtlük, sekizlik, ikilik) çalar; portede ve tahtada izle.',
  together: 'Adım adım: gösterilen notayı çalınca bir sonrakine geçer. Nota süreleri (½v, 1v, 2v) portede ve kutularda görünür.',
  turns: 'Önce uygulama kendi ritmiyle çalar, sonra sıra sana geçer.',
  solo: '4 vuruşluk geri sayımdan sonra şarkıyı gerçek ritmiyle kendin çalarsın ve yıldız kazanırsın.',
};
const SEG = { one: 1, phrase: 4, full: 9999 };

const getStars = () => JSON.parse(localStorage.getItem('gn_stars') || '{}');
let sm = Object.assign({ mode: 'together', seg: 'phrase', input: 'touch', bpm: 84, metro: false, showStaff: true, sheetOnly: false, sheetNames: true, sheetSf: true, sheetBig: true },
  JSON.parse(localStorage.getItem('gn_song') || '{}'));
const saveSm = () => localStorage.setItem('gn_song', JSON.stringify(sm));
let song = null, run = null, micMuteUntil = 0, inSong = false;

const audioCtx = () => {
  actx = actx || new (window.AudioContext || window.webkitAudioContext)();
  if (actx.state === 'suspended') actx.resume();
  return actx;
};

// ---------- Metronom ----------
function pulse(accent) {
  const d = $('mDot'); if (!d) return;
  d.className = accent ? 'hi' : 'lo'; setTimeout(() => { d.className = ''; }, 90);
}
function click(when, accent) {
  const c = audioCtx(), o = c.createOscillator(), g = c.createGain();
  o.type = 'square'; o.frequency.value = accent ? 1600 : 1100;
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(accent ? 0.22 : 0.12, when + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, when + 0.05);
  o.connect(g).connect(c.destination); o.start(when); o.stop(when + 0.06);
  setTimeout(() => pulse(accent), Math.max(0, (when - c.currentTime) * 1000));
}
const Metro = {
  timer: null, next: 0, beat: 0,
  start() {
    if (this.timer) return;
    const c = audioCtx(); this.next = c.currentTime + 0.08; this.beat = 0;
    this.timer = setInterval(() => {
      while (this.next < c.currentTime + 0.15) { click(this.next, this.beat % 4 === 0); this.next += 60 / sm.bpm; this.beat++; }
    }, 25);
  },
  stop() { clearInterval(this.timer); this.timer = null; },
};

// ---------- Zamanlı çalma (Nota Süresine Göre Uzun/Kısa Ses) ----------
function runTimed(o) {
  const c = audioCtx(); Metro.stop();
  const spb = 60 / sm.bpm, notes = song.notes, from = o.from || 0, to = o.to === undefined ? notes.length : o.to;
  const ev = []; let b = 0;
  for (let i = from; i < to; i++) { ev.push({ i, at: b, b: notes[i].b }); b += notes[i].b; }
  const total = b, cin = o.countIn ? 4 : 0, t0 = c.currentTime + 0.2 + cin * spb, tc0 = t0 - cin * spb;
  const clicks = cin + Math.ceil(total);
  let nk = 0, ne = 0, done = false; const timers = [];
  const after = (when, fn) => timers.push(setTimeout(fn, Math.max(0, (when - c.currentTime) * 1000)));
  const r = { t0, spb, ev, end: t0 + total * spb };
  const tick = () => {
    const lim = c.currentTime + 0.15;
    while (nk < clicks && tc0 + nk * spb < lim) {
      const t = tc0 + nk * spb, k = nk;
      if (k < cin || sm.metro) click(t, k % 4 === 0);
      if (k < cin && o.onCount) after(t, () => o.onCount(k + 1));
      nk++;
    }
    while (ne < ev.length && t0 + ev[ne].at * spb < lim) {
      const e = ev[ne], t = t0 + e.at * spb, n = notes[e.i];
      const durSec = e.b * spb;
      if (o.sound) playMidi(midi(n.s, n.f), t, durSec);
      after(t, () => o.onNote && o.onNote(e.i)); ne++;
    }
    if (!done && nk >= clicks && ne >= ev.length) { done = true; clearInterval(r.timer); after(r.end, () => o.onDone && o.onDone()); }
  };
  r.stop = () => { clearInterval(r.timer); timers.forEach(clearTimeout); };
  r.timer = setInterval(tick, 25); tick();
  return r;
}

// ---------- Mikrofon (şarkı modu): frekans değişimi + onset ile yankı filtreli ----------
async function startSongMic() {
  if (micStream) { resetPitchTracker(false); return true; }
  if (!(await startMic())) return false;
  resetPitchTracker(false);
  micTimer = setInterval(songMicTick, 60);
  return true;
}

function songMicTick() {
  if (!analyser || !actx) return;
  if (actx.currentTime < micMuteUntil) {
    detectPitch();
    resetPitchTracker(false);
    return;
  }
  const ev = pollNoteEvent();
  const ms = $('spMic');
  if (!ev) {
    if (ms) ms.textContent = '🎤 Dinliyorum…';
    return;
  }
  if (ev.sustain) {
    if (ms) ms.textContent = `🎤 Önceki tel uzuyor (${nameOf(ev.pc)}) — yeni notayı çal`;
    return;
  }
  if (ms) ms.textContent = `🎤 Duyulan: ${nameBoth(ev.pc)} (${ev.freq.toFixed(0)} Hz)`;
  if (ev.triggered) {
    userPlayed('mic', ev.pc);
  }
}

// ---------- Mod girişi / çıkışı ----------
function startSongMode() { inSong = true; song = null; onPosClick = boardTap; renderSong(); }
function stopSong() { inSong = false; stopRun(true); Metro.stop(); song = null; }
function stopRun(noRender) {
  if (run) { if (run.timed) run.timed.stop(); clearInterval(run.watch); }
  run = null; stopMic();
  if (!noRender && inSong) { render(); setStartLabel(); if (sm.metro) Metro.start(); }
}
function endRun() { stopRun(true); render(); setStartLabel(); if (inSong && sm.metro) Metro.start(); }

// ---------- Arayüz ----------
const metroHTML = () => `<div id="metro"><button id="mToggle" class="${sm.metro ? 'on' : ''}">🥁 Metronom: ${sm.metro ? 'Açık' : 'Kapalı'}</button>
  <label>♩ <input type="range" id="bpm" min="40" max="160" value="${sm.bpm}"> <b id="bpmL">${sm.bpm}</b> BPM</label><i id="mDot"></i></div>`;
function bindMetro() {
  $('mToggle').onclick = () => {
    sm.metro = !sm.metro; saveSm();
    $('mToggle').className = sm.metro ? 'on' : ''; $('mToggle').textContent = `🥁 Metronom: ${sm.metro ? 'Açık' : 'Kapalı'}`;
    const timedActive = run && run.timed;
    if (sm.metro) { if (!timedActive) Metro.start(); } else Metro.stop();
  };
  $('bpm').oninput = e => { sm.bpm = +e.target.value; $('bpmL').textContent = sm.bpm; saveSm(); };
}

function chipDurInfo(b) {
  if (b >= 3.5) return { cls: 'd-whole', sym: '𝅝 4v' };
  if (b >= 2.75) return { cls: 'd-half-dot', sym: '𝅗𝅥. 3v' };
  if (b >= 1.8) return { cls: 'd-half', sym: '𝅗𝅥 2v' };
  if (b >= 1.35) return { cls: 'd-qtr-dot', sym: '♩. 1½v' };
  if (b >= 0.85) return { cls: 'd-qtr', sym: '♩ 1v' };
  return { cls: 'd-eighth', sym: '♪ ½v' };
}

let songCatFilter = 'all';

function renderSong() {
  const ui = $('songUI'), bot = $('songBottom'); ui.innerHTML = ''; bot.innerHTML = '';
  if (!song) {
    $('boardWrap').style.display = 'none';
    if ($('promptBox')) $('promptBox').style.display = 'none';
    setFb('');
    const st = getStars();
    const cats = [['all', 'Tümü'], ['tr', '🇹🇷 Türk Ezgileri'], ['classic', '🎻 Klasik & Dünya'], ['study', '🎸 Başlangıç & Etüt']];
    let h = `<div class="songCatBar">${cats.map(c => `<button data-cat="${c[0]}" class="pill ${songCatFilter === c[0] ? 'on' : ''}">${c[1]}</button>`).join('')}</div>`;
    h += '<div class="songList">';
    const filtered = SONGS.filter(sg => {
      if (songCatFilter === 'tr') return sg.cat === 'Türk Ezgisi';
      if (songCatFilter === 'classic') return sg.cat === 'Klasik' || sg.cat === 'Dünya';
      if (songCatFilter === 'study') return sg.cat === 'Başlangıç' || sg.cat === 'Etüt';
      return true;
    });
    filtered.forEach(sg => {
      const locked = !LEVELS[level].custom && sg.lv > level, stars = st[sg.id] || 0;
      const pct = stars === 3 ? 100 : stars === 2 ? 68 : stars === 1 ? 35 : 0;
      const badgeCls = sg.cat === 'Türk Ezgisi' ? 'cat tr' : 'cat';
      const minS = Math.min(...sg.notes.map(n => n.s)) + 1, maxS = Math.max(...sg.notes.map(n => n.s)) + 1;
      h += `<div class="songCard ${stars === 3 ? 'done' : ''} ${locked ? 'locked' : ''}" data-id="${sg.id}">
        <div class="scMeta"><span class="${badgeCls}">${sg.cat}</span><span class="scSub">${sg.sub || ''}</span></div>
        <div class="scTop"><b>${sg.t}</b><span class="stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</span></div>
        <div class="scProgTrack"><div class="scProgFill ${stars === 3 ? 'full' : ''}" style="width:${pct}%"></div></div>
        <div class="scFoot">
          <small>${locked ? '🔒 ' + LEVELS[sg.lv].t.split('·')[0].trim() + ' gerekli' : `Seviye ${sg.lv + 1} · ${minS}-${maxS}. Tel · ${sg.notes.length} Nota · ♩=${sg.bpm || 84}`}</small>
          <div class="scBtnGroup">
            <button class="scBtn sheet" data-id="${sg.id}" data-act="sheet" ${locked ? 'disabled' : ''}>📖 Notadan</button>
            <button class="scBtn listen" data-id="${sg.id}" data-act="listen" ${locked ? 'disabled' : ''}>🎧 Dinle</button>
            <button class="scBtn play" data-id="${sg.id}" data-act="play" ${locked ? 'disabled' : ''}>▶ Çal</button>
          </div>
        </div></div>`;
    });
    h += `</div>
      <div class="makamInfoCard">
        <b>🎶 Makam ve Klasik Gitar Uyumu</b>
        <p>Türk ezgilerini klasik gitarda icra ederken <i>♩. noktalı</i> ve <i>♪ sekizlik</i> ritim sürelerine dikkat etmek ezginin doğal duygusunu ortaya çıkarır.</p>
      </div>`;
    ui.innerHTML = h;
    bot.innerHTML = metroHTML() + '<div class="spacer"></div>';
    ui.querySelectorAll('.songCatBar button').forEach(b => b.onclick = () => {
      songCatFilter = b.dataset.cat; renderSong();
    });
    const openSong = (id, act) => {
      const target = SONGS.find(x => x.id === id);
      if (!target) return;
      if (!LEVELS[level].custom && target.lv > level) return;
      song = target;
      if (song.bpm) { sm.bpm = song.bpm; saveSm(); }
      if (act === 'sheet') {
        sm.sheetOnly = true; sm.showStaff = true;
        if (sm.mode === 'listen') sm.mode = 'together';
        saveSm();
      } else if (act === 'listen') {
        sm.mode = 'listen'; saveSm();
      } else if (act === 'play' && sm.mode === 'listen') {
        sm.mode = 'together'; saveSm();
      }
      renderSong();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (act === 'listen') setTimeout(() => startRun(), 150);
    };
    ui.querySelectorAll('.scBtn').forEach(b => b.onclick = e => {
      e.stopPropagation();
      openSong(b.dataset.id, b.dataset.act);
    });
    ui.querySelectorAll('.songCard').forEach(card => card.onclick = () => {
      openSong(card.dataset.id, 'open');
    });
    bindMetro(); if (sm.metro) Metro.start();
    return;
  }
  if ($('promptBox')) $('promptBox').style.display = '';
  $('boardWrap').style.display = sm.sheetOnly ? 'none' : '';
  FRETS = Math.min(12, Math.max(3, ...song.notes.map(n => n.f)) + 1); drawBoard(); onPosClick = boardTap;
  $('prompt').textContent = `🎵 ${song.t}`;
  setFb(sm.sheetOnly
    ? '📖 Sadece Notadan Çal modu aktif — Büyük portedeki notalara bakarak gitarınla çal veya notaların üzerine dokun.'
    : 'Aşağıdan "▶ Şarkıyı Başlat" butonuna dokunarak dinleyebilir veya çalabilirsin.', 'ok');
  $('levelDesc').textContent = song.sub || '';
  const minS = Math.min(...song.notes.map(n => n.s)) + 1, maxS = Math.max(...song.notes.map(n => n.s)) + 1;
  const chips = song.notes.map((n, i) => {
    const di = chipDurInfo(n.b);
    return `<span class="chip ${di.cls}" data-i="${i}"><b>${nameOf(pcOf(n.s, n.f))}</b><small>${n.s + 1}.T/${n.f}.P · ${di.sym}</small></span>`;
  }).join('');
  ui.innerHTML = `
    <div class="spBar">
      <button id="spBack">← Repertuar</button>
      <div class="spViewBtns">
        <button id="spSheetOnlyBtn" class="pill ${sm.sheetOnly ? 'on accent' : ''}">📖 Sadece Notadan Çal</button>
        ${!sm.sheetOnly ? `<button id="spStaffBtn" class="pill ${sm.showStaff ? 'on' : ''}">🎼 Porte: ${sm.showStaff ? 'Açık' : 'Kapalı'}</button>` : ''}
      </div>
    </div>
    <div id="spCtl">
      <button id="spStart">▶ Şarkıyı Başlat</button>
      ${sm.mode === 'together' || sm.mode === 'turns' ? '<button id="spHear">🔊 Sesi Duy</button>' : ''}
    </div>
    <div id="spModes">${MODES.map(m => `<button data-m="${m[0]}" class="${sm.mode === m[0] ? 'sel' : ''}">${m[1]} <span>${m[2]}</span></button>`).join('')}</div>
    <div class="help" id="spHelp">${MODE_HELP[sm.mode]}</div>
    <div class="spOpts">
      ${sm.mode === 'turns' ? `<label>Parça <select id="spSeg"><option value="one">Tek nota</option><option value="phrase">Cümle (4 nota)</option><option value="full">Tam şarkı</option></select></label>` : ''}
      ${sm.mode !== 'listen' ? `<label>Girdi <select id="spIn"><option value="mic">🎤 Gitar (mikrofon)</option><option value="touch">✋ Dokunarak</option></select></label>` : ''}
      ${sm.mode !== 'listen' && sm.input === 'mic' ? `<label>Yankı Filtresi <select id="spSens"><option value="sens">Hassas</option><option value="normal">Normal</option><option value="strict">Yüksek</option></select></label>` : ''}
    </div>
    ${metroHTML()}
    <div class="spStatsRow">
      <div class="spStatBox"><small>ZORLUK</small><b>Seviye ${song.lv + 1}</b></div>
      <div class="spStatBox"><small>TEMPO</small><b class="emerald">${sm.bpm} BPM</b></div>
      <div class="spStatBox"><small>ÖLÇÜ &amp; TEL</small><b>4/4 · ${minS}-${maxS}.Tel</b></div>
    </div>
    <div id="songStaffWrap" class="${sm.sheetOnly ? 'sheetStandActive' : ''}" ${(sm.showStaff || sm.sheetOnly) ? '' : 'hidden'}>
      ${sm.sheetOnly ? `
      <div class="sheetStandToolbar">
        <span class="sstTitle">🎼 Tam Boy Nota Sehpası (${song.notes.length} Nota)</span>
        <div class="sstActions">
          <button id="spShNames" class="pill ${sm.sheetNames ? 'on' : ''}">🔤 Nota Adı: ${sm.sheetNames ? 'Açık' : 'Kapalı'}</button>
          <button id="spShSf" class="pill ${sm.sheetSf ? 'on' : ''}">🎸 Tel/Perde: ${sm.sheetSf ? 'Açık' : 'Kapalı'}</button>
          <button id="spShBig" class="pill ${sm.sheetBig ? 'on' : ''}">🔍 ${sm.sheetBig ? 'Dev (4 Nota/Satır)' : 'Geniş (6 Nota/Satır)'}</button>
        </div>
      </div>` : ''}
      <svg id="songStaff" viewBox="0 0 316 168"></svg>
      <div class="durLegend"><span>♪ ½v: Kısa (Sekizlik)</span><span>♩ 1v: Normal (Dörtlük)</span><span>♩. 1½v: Noktalı</span><span>𝅗𝅥 2v: Uzun (İkilik)</span></div>
    </div>
    <div id="strip" ${sm.sheetOnly ? 'hidden' : ''}>${chips}</div>
    <div id="spMic"></div>`;
  bot.innerHTML = '<div class="spacer"></div>';
  $('spBack').onclick = () => { stopRun(true); song = null; renderSong(); };
  $('spSheetOnlyBtn').onclick = () => {
    sm.sheetOnly = !sm.sheetOnly;
    if (sm.sheetOnly) sm.showStaff = true;
    saveSm();
    renderSong();
  };
  if ($('spStaffBtn')) {
    $('spStaffBtn').onclick = () => { sm.showStaff = !sm.showStaff; saveSm(); $('songStaffWrap').hidden = !sm.showStaff; render(); };
  }
  if ($('spShNames')) {
    $('spShNames').onclick = () => { sm.sheetNames = !sm.sheetNames; saveSm(); renderSong(); };
  }
  if ($('spShSf')) {
    $('spShSf').onclick = () => { sm.sheetSf = !sm.sheetSf; saveSm(); renderSong(); };
  }
  if ($('spShBig')) {
    $('spShBig').onclick = () => { sm.sheetBig = !sm.sheetBig; saveSm(); renderSong(); };
  }
  $('spModes').querySelectorAll('button').forEach(b => b.onclick = () => { stopRun(true); sm.mode = b.dataset.m; saveSm(); renderSong(); });
  if ($('spSeg')) { $('spSeg').value = sm.seg; $('spSeg').onchange = e => { sm.seg = e.target.value; saveSm(); }; }
  if ($('spIn')) { $('spIn').value = sm.input; $('spIn').onchange = e => { sm.input = e.target.value; saveSm(); renderSong(); }; }
  if ($('spSens')) { $('spSens').value = micSens; $('spSens').onchange = e => { micSens = e.target.value; localStorage.setItem('gn_mic_sens', micSens); }; }
  $('spStart').onclick = startRun;
  if ($('spHear')) $('spHear').onclick = hearAgain;
  bindMetro(); setStartLabel(); render();
  if (sm.metro && !run) Metro.start();
}
function setStartLabel() { const b = $('spStart'); if (b) b.textContent = run ? '⏹ Çalışmayı Durdur' : '▶ Şarkıyı Başlat'; }

function render() {
  if (!inSong || !song) return;
  clearMarks();
  if ($('boardWrap')) $('boardWrap').style.display = sm.sheetOnly ? 'none' : '';
  const strip = $('strip');
  const stepping = run && (run.type === 'together' || (run.type === 'turns' && run.phase === 'user'));
  const activeIdx = run ? (stepping ? run.idx : run.cur) : 0;

  document.querySelectorAll('#strip .chip').forEach(ch => {
    const i = +ch.dataset.i;
    const di = chipDurInfo(song.notes[i].b);
    ch.className = `chip ${di.cls}` + (run && run.hit[i] ? ' hit' : '') + (run && run.miss[i] ? ' miss' : '') +
      (run && activeIdx === i ? ' cur' : '');
  });
  const cc = document.querySelector('#strip .chip.cur');
  if (cc && strip) strip.scrollTop = cc.offsetTop - strip.clientHeight / 2;

  // Şarkı portesini güncelle (Sadece Notadan Çal modunda tüm şarkıyı çok satırlı büyük sehpa olarak, normal modda 5'li pencere olarak çiz)
  if ((sm.showStaff || sm.sheetOnly) && $('songStaff')) {
    if (sm.sheetOnly) {
      const fullList = song.notes.map((n, gi) => ({
        s: n.s, f: n.f, b: n.b,
        state: run && run.hit[gi] ? 'hit' : run && run.miss[gi] ? 'miss' : gi === activeIdx ? 'cur' : '',
        showName: sm.sheetNames || (run && run.hit[gi]),
      }));
      drawStaffNotes(fullList, $('songStaff'), {
        large: true,
        multiLine: true,
        notesPerRow: sm.sheetBig ? 4 : 6,
        showStringFret: sm.sheetSf,
        onNoteClick: (idx, item) => {
          boardTap(item.s, item.f);
        }
      });
    } else {
      const center = Math.max(0, activeIdx);
      const start = Math.floor(center / 5) * 5;
      const slice = song.notes.slice(start, start + 5).map((n, k) => {
        const gi = start + k;
        return {
          s: n.s, f: n.f, b: n.b,
          state: run && run.hit[gi] ? 'hit' : run && run.miss[gi] ? 'miss' : gi === activeIdx ? 'cur' : '',
          showName: true,
        };
      });
      drawStaffNotes(slice, $('songStaff'), {
        large: false,
        multiLine: false,
        showStringFret: true,
        onNoteClick: (idx, item) => {
          boardTap(item.s, item.f);
        }
      });
    }
  }

  if (!run || sm.sheetOnly) return;
  let t = -1;
  if (run.type === 'together') t = run.idx;
  else if (run.type === 'turns' && run.phase === 'user') { if (run.hintIdx === run.idx) t = run.idx; }
  else t = run.cur;
  if (t >= 0 && t < song.notes.length) {
    const n = song.notes[t];
    mark(n.s, n.f, 'target', nameOf(pcOf(n.s, n.f)));
  }
}

// ---------- Oyun akışı ----------
async function startRun() {
  if (run) { stopRun(); return; }
  if (!song) return;
  if (sm.input === 'mic' && sm.mode !== 'listen') {
    const ok = await startSongMic();
    if (!ok) { sm.input = 'touch'; saveSm(); if ($('spIn')) $('spIn').value = 'touch'; }
  }
  begin();
}
function begin() {
  const N = song.notes.length;
  Metro.stop(); stopRunTimers();
  run = { type: sm.mode, idx: 0, errors: 0, hit: [], miss: [], errN: [], cur: -1, hintIdx: -1, phase: '', segStart: 0, segEnd: 0 };
  setStartLabel(); setFb('');
  if (run.type === 'listen') {
    $('prompt').textContent = '🎧 Dinle…';
    run.timed = runTimed({
      sound: true,
      onNote: i => {
        if (!run) return;
        run.cur = i;
        const n = song.notes[i];
        setFb(`${i + 1}/${N}: ${nameBoth(pcOf(n.s, n.f))} · ${durLabelTr(n.b)} (${n.s + 1}. tel, ${n.f}. perde)`, 'ok');
        render();
      },
      onDone: () => { if (!run) return; endRun(); $('prompt').textContent = song.t; setFb('Şimdi "Birlikte" veya "Sırayla" modunu seçip sen dene!', 'ok'); }
    });
  } else if (run.type === 'together') {
    const n0 = song.notes[0];
    $('prompt').textContent = `🤝 1/${N}: ${nameBoth(pcOf(n0.s, n0.f))} · ${durLabelTr(n0.b)} (${n0.s + 1}. tel, ${n0.f}. perde)`;
    render();
  } else if (run.type === 'turns') {
    playSeg();
  } else {
    run.timed = runTimed({
      sound: false, countIn: true,
      onCount: k => { if (run) $('prompt').textContent = `Hazır ol… ${k}`; },
      onNote: i => { if (run) { run.cur = i; if (i === 0) $('prompt').textContent = '🎸 Ritimle Çal!'; render(); } },
      onDone: () => setTimeout(() => {
        if (!run || run.type !== 'solo') return;
        const hits = run.hit.filter(Boolean).length;
        finish(hits / N, `${hits}/${N} nota doğru zamanda`);
      }, 600)
    });
    run.watch = setInterval(soloWatch, 80);
  }
}
function stopRunTimers() { if (run) { if (run.timed) run.timed.stop(); clearInterval(run.watch); } }

function playSeg() {
  if (!run) return;
  const N = song.notes.length;
  run.phase = 'app'; run.segEnd = Math.min(run.segStart + SEG[sm.seg], N);
  run.idx = run.segStart; run.cur = -1; run.hintIdx = -1;
  $('prompt').textContent = '🎧 Önce uygulamayı ritmiyle dinle…'; setFb('');
  if (run.timed) run.timed.stop();
  run.timed = runTimed({
    from: run.segStart, to: run.segEnd, sound: true,
    onNote: i => { if (run) { run.cur = i; render(); } },
    onDone: () => {
      if (!run) return;
      run.phase = 'user'; run.cur = -1;
      micMuteUntil = (actx ? actx.currentTime : 0) + 0.35;
      resetPitchTracker(false);
      $('prompt').textContent = `🎸 Sıra sende! (${run.segEnd - run.segStart} nota)`; render();
    }
  });
  micMuteUntil = run.timed.end + 0.5;
}
function hearAgain() {
  if (!run) return;
  const spb = 60 / sm.bpm;
  if (run.type === 'together') {
    const n = song.notes[run.idx];
    const durS = n.b * spb;
    micMuteUntil = (actx ? actx.currentTime : 0) + durS + 0.4;
    playMidi(midi(n.s, n.f), 0, durS);
  } else if (run.type === 'turns' && run.phase === 'user') playSeg();
}

const noteMatches = (n, kind, val) => kind === 'touch' ? val === midi(n.s, n.f) : val === pcOf(n.s, n.f);
const hintText = n => `${nameBoth(pcOf(n.s, n.f))} (${durLabelTr(n.b)}) · ${n.s + 1}. tel, ${n.f}. perde`;

function boardTap(s, f) {
  if (run && run.type === 'turns' && run.phase !== 'user') return;
  const m = midi(s, f);
  const spb = 60 / sm.bpm;
  let durS = 1.0;
  if (run && song) {
    const idx = (run.type === 'together' || (run.type === 'turns' && run.phase === 'user')) ? run.idx : run.cur;
    if (idx >= 0 && idx < song.notes.length) durS = song.notes[idx].b * spb;
  }
  playMidi(m, 0, durS);
  if (run && run.type !== 'listen') userPlayed('touch', m, s, f);
  else setFb(`${s + 1}. tel, ${f}. perde = ${nameBoth(pcOf(s, f))}`);
}
function userPlayed(kind, val, s, f) {
  if (!run) return;
  if (run.type === 'together' || (run.type === 'turns' && run.phase === 'user')) stepJudge(kind, val, s, f);
  else if (run.type === 'solo') soloJudge(kind, val, s, f);
}
function stepJudge(kind, val, s, f) {
  const N = song.notes.length, n = song.notes[run.idx];
  if (noteMatches(n, kind, val)) {
    run.hit[run.idx] = true; record(n.s, n.f, true); run.idx++; run.hintIdx = -1;
    if (run.type === 'together') {
      if (run.idx >= N) return finish(N / (N + run.errors), `${run.errors} hata`);
      const nx = song.notes[run.idx];
      $('prompt').textContent = `🤝 ${run.idx + 1}/${N}: ${nameBoth(pcOf(nx.s, nx.f))} · ${durLabelTr(nx.b)} (${nx.s + 1}. tel, ${nx.f}. perde)`;
      setFb(`✓ Doğru! Sıradaki: ${durLabelTr(nx.b)}`, 'ok'); render();
    } else if (run.idx >= run.segEnd) {
      if (run.segEnd >= N) return finish(N / (N + run.errors), `${run.errors} hata`);
      setFb('Güzel! Sıradaki parça geliyor…', 'ok'); run.phase = 'wait'; render();
      setTimeout(() => { if (run) { run.segStart = run.segEnd; playSeg(); } }, 800);
    } else {
      const nx = song.notes[run.idx];
      setFb(`✓ Doğru (${durLabelTr(nx.b)} sırada)`, 'ok'); render();
    }
  } else {
    run.errors++; record(n.s, n.f, false);
    run.errN[run.idx] = (run.errN[run.idx] || 0) + 1;
    const heard = kind === 'mic' ? ` (duyulan: ${nameBoth(val)})` : '';
    if (run.type === 'together' || run.errN[run.idx] >= 2) { run.hintIdx = run.idx; setFb(`Hayır${heard} — aranan: ${hintText(n)}`, 'bad'); }
    else setFb(`Hayır${heard}, tekrar dene`, 'bad');
    render();
    if (kind === 'touch' && s !== undefined) { mark(s, f, 'wrong', nameOf(pcOf(s, f))); setTimeout(render, 500); }
  }
}
function soloJudge(kind, val, s, f) {
  const T = run.timed; if (!T) return;
  const now = actx.currentTime, mic = kind === 'mic';
  const pre = (mic ? 0.25 : 0.35) * T.spb, post = mic ? 0.45 : 0.15;
  for (const e of T.ev) {
    if (run.hit[e.i] || run.miss[e.i]) continue;
    const n = song.notes[e.i];
    if (now >= T.t0 + e.at * T.spb - pre && now <= T.t0 + (e.at + e.b) * T.spb + post && noteMatches(n, kind, val)) {
      run.hit[e.i] = true; record(n.s, n.f, true); setFb('✓', 'ok'); render(); return;
    }
  }
  setFb(kind === 'mic' ? `Duyulan ${nameBoth(val)}: beklenen nota değil` : 'Yanlış nota ya da zamanı kaçtı', 'bad');
}
function soloWatch() {
  if (!run || run.type !== 'solo' || !run.timed) return;
  const T = run.timed, now = actx.currentTime, post = (sm.input === 'mic' ? 0.45 : 0.15); let ch = false;
  for (const e of T.ev) {
    if (run.hit[e.i] || run.miss[e.i]) continue;
    if (now > T.t0 + (e.at + e.b) * T.spb + post) { run.miss[e.i] = true; const n = song.notes[e.i]; record(n.s, n.f, false); ch = true; }
  }
  if (ch) render();
}
function finish(acc, detail) {
  const stars = acc >= 0.9 ? 3 : acc >= 0.7 ? 2 : acc >= 0.4 ? 1 : 0;
  const st = getStars();
  if (stars > (st[song.id] || 0)) { st[song.id] = stars; localStorage.setItem('gn_stars', JSON.stringify(st)); }
  endRun();
  $('prompt').textContent = stars ? `🎉 Bitti! ${'⭐'.repeat(stars)}` : 'Bitti, tekrar dene 💪';
  setFb(detail, stars ? 'ok' : 'bad');
}
