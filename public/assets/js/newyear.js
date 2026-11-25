/* VIVACHE — New Year mode (admin → „საახალწლო რეჟიმი“): snow, garland, Santa's sleigh, elves, countdown, carols.
   The music is synthesised in the browser (Web Audio) from public-domain carol melodies — no audio files, no copyright,
   and it switches to the next carol by itself. Browsers allow sound only after a click, so it starts from the 🎵 button
   (and resumes on the next visit after the first click if the visitor left it on). */
(function () {
  'use strict';
  var VV = window.VV = window.VV || {};
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- carols: "NOTE beats" ---------------- */
  var SONGS = [
    { ka: 'Jingle Bells', bpm: 168, bells: true, notes:
      'E4 1,E4 1,E4 2,E4 1,E4 1,E4 2,E4 1,G4 1,C4 1.5,D4 .5,E4 4,F4 1,F4 1,F4 1.5,F4 .5,F4 1,E4 1,E4 1,E4 .5,E4 .5,E4 1,D4 1,D4 1,E4 1,D4 2,G4 2,' +
      'E4 1,E4 1,E4 2,E4 1,E4 1,E4 2,E4 1,G4 1,C4 1.5,D4 .5,E4 4,F4 1,F4 1,F4 1.5,F4 .5,F4 1,E4 1,E4 1,E4 .5,E4 .5,G4 1,G4 1,F4 1,D4 1,C4 4' },
    { ka: 'We Wish You a Merry Christmas', bpm: 150, notes:
      'D4 1,G4 1,G4 .5,A4 .5,G4 .5,F#4 .5,E4 1,E4 1,E4 1,A4 1,A4 .5,B4 .5,A4 .5,G4 .5,F#4 1,D4 1,D4 1,B4 1,B4 .5,C5 .5,B4 .5,A4 .5,G4 1,E4 1,D4 .5,D4 .5,E4 1,A4 1,F#4 1,G4 2,R 1,' +
      'D4 1,G4 1,G4 1,G4 1,F#4 2,F#4 1,G4 1,F#4 1,E4 1,D4 2,A4 1,B4 1,A4 .5,A4 .5,G4 .5,G4 .5,D5 1,D4 1,D4 .5,D4 .5,E4 1,A4 1,F#4 1,G4 3' },
    { ka: 'Deck the Halls', bpm: 140, notes:
      'G4 1.5,F4 .5,E4 1,D4 1,C4 1,D4 1,E4 1,C4 1,D4 .5,E4 .5,F4 .5,D4 .5,E4 1.5,D4 .5,C4 1,B3 1,C4 2,' +
      'G4 1.5,F4 .5,E4 1,D4 1,C4 1,D4 1,E4 1,C4 1,D4 .5,E4 .5,F4 .5,D4 .5,E4 1.5,D4 .5,C4 1,B3 1,C4 2,' +
      'D4 1.5,E4 .5,F4 1,D4 1,E4 1.5,F4 .5,G4 1,D4 1,E4 .5,F#4 .5,G4 1,A4 .5,B4 .5,C5 1,B4 1,A4 1,G4 2,' +
      'G4 1.5,F4 .5,E4 1,D4 1,C4 1,D4 1,E4 1,C4 1,A4 .5,A4 .5,A4 .5,A4 .5,G4 1.5,F4 .5,E4 1,D4 1,C4 2' },
    { ka: 'Silent Night', bpm: 210, soft: true, notes:
      'G4 3,A4 1,G4 2,E4 6,G4 3,A4 1,G4 2,E4 6,D5 4,D5 2,B4 6,C5 4,C5 2,G4 6,A4 4,A4 2,C5 3,B4 1,A4 2,G4 3,A4 1,G4 2,E4 6,' +
      'A4 4,A4 2,C5 3,B4 1,A4 2,G4 3,A4 1,G4 2,E4 6,D5 4,D5 2,F5 3,D5 1,B4 2,C5 6,E5 6,C5 3,G4 1,E4 2,G4 3,F4 1,D4 2,C4 12' },
  ];
  var IDX = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
  function freq(n) { var m = n.match(/^([A-G]#?)(\d)$/); return 440 * Math.pow(2, ((+m[2] + 1) * 12 + IDX[m[1]] - 69) / 12); }

  var Music = {
    ctx: null, master: null, timer: null, song: +localStorage.getItem('vv_song') || 0, on: false,
    start: function () {
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      if (!this.ctx) { this.ctx = new AC(); this.master = this.ctx.createGain(); this.master.gain.value = .55; this.master.connect(this.ctx.destination); }
      this.ctx.resume(); this.on = true; localStorage.setItem('vv_music', 'on');
      this.play(this.song); Music.ui();
    },
    stop: function () {
      this.on = false; localStorage.setItem('vv_music', 'off'); clearTimeout(this.timer);
      if (this.ctx) { this.ctx.close(); this.ctx = null; }
      Music.ui();
    },
    next: function () { this.song = (this.song + 1) % SONGS.length; localStorage.setItem('vv_song', this.song); if (this.on) { clearTimeout(this.timer); var self = this; if (this.ctx) this.ctx.close(); this.ctx = null; this.start(); } else Music.ui(); },
    play: function (i) {
      var s = SONGS[i], ctx = this.ctx, beat = 60 / s.bpm, t = ctx.currentTime + .15, self = this, b = 0;
      s.notes.split(',').forEach(function (tok) {
        var p = tok.trim().split(/\s+/), dur = parseFloat(p[1]) * beat;
        if (p[0] !== 'R') self.note(freq(p[0]), t, dur, s.soft);
        if (s.bells && Math.abs(b - Math.round(b)) < .01) self.bell(t);
        if (Math.abs(b % (s.bpm > 200 ? 6 : 2)) < .01) self.bass(freq(p[0] === 'R' ? 'C3' : p[0].replace(/\d/, '3')), t, Math.min(dur * 2, 1.2));
        t += dur; b += parseFloat(p[1]);
      });
      this.timer = setTimeout(function () { if (!self.on) return; self.song = (i + 1) % SONGS.length; localStorage.setItem('vv_song', self.song); self.play(self.song); Music.ui(); }, (t - ctx.currentTime + 1.6) * 1000);
    },
    note: function (f, t, dur, soft) {
      var ctx = this.ctx, g = ctx.createGain(), o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), g2 = ctx.createGain();
      o1.type = 'triangle'; o1.frequency.value = f; o2.type = 'sine'; o2.frequency.value = f * 2; g2.gain.value = .28;
      var peak = soft ? .16 : .22, len = Math.min(Math.max(dur * 1.5, .35), 2.2);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + .012); g.gain.exponentialRampToValueAtTime(.0008, t + len);
      o1.connect(g); o2.connect(g2); g2.connect(g); g.connect(this.master);
      o1.start(t); o2.start(t); o1.stop(t + len + .05); o2.stop(t + len + .05);
    },
    bass: function (f, t, len) {
      var ctx = this.ctx, g = ctx.createGain(), o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f / 2;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.12, t + .02); g.gain.exponentialRampToValueAtTime(.0008, t + len);
      o.connect(g); g.connect(this.master); o.start(t); o.stop(t + len + .05);
    },
    bell: function (t) {
      var ctx = this.ctx;
      if (!this.noise) { var n = ctx.sampleRate * .2, buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0); for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; this.noise = buf; }
      var src = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), g = ctx.createGain();
      src.buffer = this.noise; hp.type = 'highpass'; hp.frequency.value = 7000;
      g.gain.setValueAtTime(.09, t); g.gain.exponentialRampToValueAtTime(.0008, t + .12);
      src.connect(hp); hp.connect(g); g.connect(this.master); src.start(t); src.stop(t + .15);
    },
    ui: function () {
      var b = document.querySelector('.ny-music'); if (!b) return;
      b.classList.toggle('is-on', this.on);
      b.setAttribute('aria-pressed', this.on);
      var n = document.querySelector('.ny-song'); if (n) n.textContent = '♪ ' + SONGS[this.song].ka;
    },
  };
  VV.music = Music;

  /* ---------------- art ---------------- */
  var SLEIGH = '<svg viewBox="0 0 520 150" aria-hidden="true">' +
    '<g class="ny-deer ny-deer--1"><path d="M40 70 q-8-22 6-34 M46 36 l-10-10 M46 36 l2-14 M52 40 q10-20 26-14 M64 30 l2-12 M72 28 l12-6" stroke="#8B5A2B" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="80" cy="82" rx="34" ry="17" fill="#A0672F"/><circle cx="50" cy="60" r="13" fill="#A0672F"/><circle cx="39" cy="62" r="5" fill="#E11D48" class="ny-nose"/><circle cx="52" cy="56" r="2.2" fill="#111"/>' +
      '<g class="ny-legs" stroke="#7A4A1F" stroke-width="5" stroke-linecap="round"><path d="M60 94 l-6 22"/><path d="M72 96 l4 22"/><path d="M96 96 l-4 22"/><path d="M106 92 l8 22"/></g><path d="M112 78 q8-4 10 4" stroke="#fff" stroke-width="4" fill="none"/></g>' +
    '<g class="ny-deer ny-deer--2" transform="translate(110 4)"><path d="M40 70 q-8-22 6-34 M46 36 l-10-10 M46 36 l2-14 M52 40 q10-20 26-14 M64 30 l2-12" stroke="#8B5A2B" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="80" cy="82" rx="34" ry="17" fill="#B5773A"/><circle cx="50" cy="60" r="13" fill="#B5773A"/><circle cx="39" cy="62" r="4" fill="#5B3716"/><circle cx="52" cy="56" r="2.2" fill="#111"/>' +
      '<g class="ny-legs" stroke="#7A4A1F" stroke-width="5" stroke-linecap="round"><path d="M60 94 l-6 22"/><path d="M72 96 l4 22"/><path d="M96 96 l-4 22"/><path d="M106 92 l8 22"/></g></g>' +
    '<path d="M110 84 L330 96 M220 90 L330 98" stroke="#FFD400" stroke-width="2.5"/>' +
    '<g class="ny-santa"><path d="M330 60 h120 q30 0 30 30 v10 q0 18-22 18 h-118 q-14 0-14-14z" fill="#DC2626"/><path d="M330 112 q-8 22 30 22 h120 q18 0 22-18" stroke="#FFD400" stroke-width="6" fill="none" stroke-linecap="round"/>' +
      '<path d="M330 60 h120" stroke="#FFD400" stroke-width="6"/><ellipse cx="455" cy="52" rx="26" ry="22" fill="#7C4A1E"/><circle cx="450" cy="38" r="6" fill="#22C55E"/><rect x="440" y="44" width="12" height="10" fill="#2F6BFF"/>' +
      '<circle cx="392" cy="52" r="24" fill="#DC2626"/><circle cx="392" cy="22" r="14" fill="#FCD7B6"/><path d="M378 26 q14 26 28 0 q-2 18-14 20 q-12-2-14-20z" fill="#fff"/>' +
      '<path d="M376 16 q14-26 34-4 q-10 4-34 4z" fill="#DC2626"/><circle cx="412" cy="10" r="6" fill="#fff"/><rect x="376" y="14" width="32" height="6" rx="3" fill="#fff"/><circle cx="387" cy="22" r="1.8" fill="#111"/><circle cx="397" cy="22" r="1.8" fill="#111"/>' +
      '<path d="M368 50 q-20 0-30 12" stroke="#DC2626" stroke-width="9" stroke-linecap="round" fill="none" class="ny-wave"/><circle cx="337" cy="63" r="6" fill="#fff"/></g></svg>';
  function elf(c1, c2) {
    return '<svg viewBox="0 0 120 150" aria-hidden="true"><path d="M20 62 q40-70 80 0z" fill="' + c1 + '"/><path d="M60 0 q30 10 26 40" stroke="' + c1 + '" stroke-width="12" fill="none" stroke-linecap="round"/><circle cx="86" cy="42" r="7" fill="#FFD400"/>' +
      '<rect x="18" y="56" width="84" height="12" rx="6" fill="#fff"/><path d="M22 84 l-18-14 18 2z M98 84 l18-14-18 2z" fill="#FCD7B6"/><circle cx="60" cy="88" r="30" fill="#FCD7B6"/>' +
      '<circle cx="49" cy="84" r="3.5" fill="#111"/><circle cx="71" cy="84" r="3.5" fill="#111"/><circle cx="43" cy="96" r="5" fill="#FDA4AF"/><circle cx="77" cy="96" r="5" fill="#FDA4AF"/><path d="M50 100 q10 10 20 0" stroke="#B45309" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<path d="M30 150 q0-34 30-34 q30 0 30 34z" fill="' + c2 + '"/><rect x="30" y="128" width="60" height="8" fill="#111"/><rect x="54" y="127" width="12" height="10" fill="#FFD400"/>' +
      '<path class="ny-elf__arm" d="M88 128 q20-10 24-30" stroke="' + c2 + '" stroke-width="10" stroke-linecap="round" fill="none"/><circle class="ny-elf__hand" cx="112" cy="96" r="7" fill="#FCD7B6"/></svg>';
  }

  /* ---------------- snow ---------------- */
  function snow() {
    var cv = document.createElement('canvas'); cv.className = 'ny-snow'; cv.setAttribute('aria-hidden', 'true');
    var ctx = null;
    try { ctx = cv.getContext('2d'); } catch (e) { /* no canvas */ }
    if (!ctx) return;
    document.body.appendChild(cv);
    var W, H, flakes = [], dpr = Math.min(2, window.devicePixelRatio || 1), run = true;
    function size() { W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr; cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px'; }
    size(); addEventListener('resize', size);
    var n = Math.min(150, Math.round(innerWidth * innerHeight / 11000));
    for (var i = 0; i < n; i++) flakes.push({ x: Math.random() * W, y: Math.random() * H, r: (Math.random() * 2.6 + .8) * dpr, s: Math.random() * .6 + .3, w: Math.random() * Math.PI * 2, o: Math.random() * .5 + .45 });
    document.addEventListener('visibilitychange', function () { run = !document.hidden; if (run) requestAnimationFrame(tick); });
    var wind = 0;
    function tick() {
      if (!run) return;
      ctx.clearRect(0, 0, W, H);
      wind += (Math.sin(Date.now() / 4000) * .4 - wind) * .01;
      for (var i = 0; i < flakes.length; i++) {
        var f = flakes[i];
        f.y += f.s * dpr * 1.2; f.w += .02; f.x += (Math.sin(f.w) * .5 + wind) * dpr;
        if (f.y > H + 5) { f.y = -5; f.x = Math.random() * W; }
        if (f.x > W + 5) f.x = -5; if (f.x < -5) f.x = W + 5;
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,' + f.o + ')'; ctx.shadowColor = 'rgba(120,160,255,.5)'; ctx.shadowBlur = 4 * dpr; ctx.fill();
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function garland() {
    var h = document.querySelector('.site-header'); if (!h || h.querySelector('.ny-garland')) return;
    var g = document.createElement('div'); g.className = 'ny-garland'; g.setAttribute('aria-hidden', 'true');
    var cols = ['#E11D48', '#FFD400', '#22C55E', '#2F6BFF', '#FF3D7F', '#F97316'], n = Math.ceil(innerWidth / 46), html = '';
    for (var i = 0; i < n; i++) html += '<i style="--c:' + cols[i % cols.length] + ';--i:' + (i % 6) + ';left:' + (i * 46 + 18) + 'px;top:' + (Math.sin(i * 1.1) * 3 + 6) + 'px"></i>';
    g.innerHTML = '<svg preserveAspectRatio="none" viewBox="0 0 100 10"><path d="M0 2 Q 2.5 9 5 2 T 10 2 T 15 2 T 20 2 T 25 2 T 30 2 T 35 2 T 40 2 T 45 2 T 50 2 T 55 2 T 60 2 T 65 2 T 70 2 T 75 2 T 80 2 T 85 2 T 90 2 T 95 2 T 100 2" stroke="#1F3D2B" stroke-width=".5" fill="none" vector-effect="non-scaling-stroke"/></svg>' + html;
    h.appendChild(g);
  }

  function santa() {
    var s = document.createElement('div'); s.className = 'ny-sleigh'; s.innerHTML = SLEIGH + '<span class="ny-bubble">ჰო-ჰო-ჰო! 🎁</span>';
    document.body.appendChild(s);
    var fly = function () { s.classList.remove('is-flying'); void s.offsetWidth; s.style.top = (110 + Math.random() * 160) + 'px'; s.classList.add('is-flying'); };
    setTimeout(fly, 2500); setInterval(fly, 38000);
    s.addEventListener('click', function (e) { VV.confetti && VV.confetti(e.clientX, e.clientY, 30); });
  }

  function elves() {
    var spots = [['left', '#16A34A', '#DC2626'], ['right', '#DC2626', '#16A34A']];
    spots.forEach(function (sp, k) {
      var el = document.createElement('button'); el.type = 'button'; el.className = 'ny-elf ny-elf--' + sp[0]; el.setAttribute('aria-label', 'elf');
      el.innerHTML = elf(sp[1], sp[2]) + '<span class="ny-bubble">' + (k ? (VV.lang === 'ka' ? 'გილოცავ! ✨' : 'Merry Xmas! ✨') : (VV.lang === 'ka' ? 'საჩუქრები გელოდება! 🎁' : 'Gifts await! 🎁')) + '</span>';
      document.body.appendChild(el);
      var peek = function () { el.classList.add('is-up'); setTimeout(function () { el.classList.remove('is-up'); }, 6500); };
      setTimeout(peek, 6000 + k * 9000); setInterval(peek, 26000 + k * 7000);
      el.addEventListener('click', function (e) { VV.confetti && VV.confetti(e.clientX, e.clientY - 40, 26); if (!Music.on) Music.start(); else Music.next(); });
    });
  }

  function dock(cfg) {
    var d = document.createElement('div'); d.className = 'ny-dock';
    var parts = '';
    if (cfg.music !== false) parts += '<button type="button" class="ny-music" aria-pressed="false" title="' + VV.t('ny_music') + '"><span class="ny-music__icon">' + VV.icon('music', 'icon--sm') + '</span><span class="ny-eq"><i></i><i></i><i></i><i></i></span></button>' +
      '<button type="button" class="ny-next" title="▶▶" aria-label="next">▶▶</button><span class="ny-song"></span>';
    if (cfg.countdown !== false) {
      var y = new Date().getFullYear(), ny = new Date((new Date().getMonth() === 0 && new Date().getDate() <= 7 ? y : y + 1) + '-01-01T00:00:00');
      parts += '<span class="ny-count">🎄 <span>' + VV.t('ny_until') + '</span> <b data-ny="' + ny.toISOString() + '"></b></span>';
    }
    d.innerHTML = parts; document.body.appendChild(d);
    var b = d.querySelector('[data-ny]');
    if (b) {
      var tick = function () {
        var ms = new Date(b.getAttribute('data-ny')) - new Date();
        if (ms <= 0 || ms > 360 * 864e5) { b.textContent = VV.t('ny_happy'); d.querySelector('.ny-count span').hidden = true; return; }
        var s = Math.floor(ms / 1000), dd = Math.floor(s / 86400), hh = Math.floor(s % 86400 / 3600), mm = Math.floor(s % 3600 / 60), ss = s % 60;
        var p = function (n) { return (n < 10 ? '0' : '') + n; };
        b.textContent = dd + ' ' + VV.t('ny_days') + ' ' + p(hh) + ':' + p(mm) + ':' + p(ss);
      };
      tick(); setInterval(tick, 1000);
    }
    var mb = d.querySelector('.ny-music');
    if (mb) {
      mb.addEventListener('click', function () { if (Music.on) Music.stop(); else Music.start(); });
      d.querySelector('.ny-next').addEventListener('click', function () { Music.next(); });
      Music.ui();
      // visitor left the music on last time → resume on the first click anywhere (browsers block autoplay)
      if (localStorage.getItem('vv_music') === 'on') {
        var go = function (ev) { if (ev.target.closest('.ny-dock')) return; document.removeEventListener('pointerdown', go, true); if (!Music.on) Music.start(); };
        document.addEventListener('pointerdown', go, true);
        mb.classList.add('is-hint');
      }
    }
  }

  VV.newyear = function () {
    var cfg = (VV.data && VV.data.settings.newyear) || {};
    if (!cfg.enabled) return;
    document.documentElement.classList.add('ny');
    if (cfg.garland !== false) garland();
    if (!reduced) {
      if (cfg.snow !== false) snow();
      if (cfg.santa !== false) santa();
      if (cfg.elves !== false && innerWidth > 640) elves();
    }
    dock(cfg);
  };
})();
