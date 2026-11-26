/* VIVACHE — site music (admin → მუსიკა).
   Playlist = the admin's own tracks (uploaded MP3/M4A/OGG or a link) + optional built-in New Year carols
   (public-domain melodies synthesised in the browser, no files). The site navigates without reloading,
   so the music keeps playing from page to page; after a full reload it resumes the same track and position.
   Autoplay: browsers allow sound only after the visitor's first click/tap/key on the page — the player starts
   immediately if the browser permits, otherwise on that first interaction (unless the visitor turned it off). */
(function () {
  'use strict';
  var VV = window.VV = window.VV || {};

  /* ---------------- built-in carols: "NOTE beats" ---------------- */
  var CAROLS = [
    { title: 'Jingle Bells', bpm: 168, bells: true, notes:
      'E4 1,E4 1,E4 2,E4 1,E4 1,E4 2,E4 1,G4 1,C4 1.5,D4 .5,E4 4,F4 1,F4 1,F4 1.5,F4 .5,F4 1,E4 1,E4 1,E4 .5,E4 .5,E4 1,D4 1,D4 1,E4 1,D4 2,G4 2,' +
      'E4 1,E4 1,E4 2,E4 1,E4 1,E4 2,E4 1,G4 1,C4 1.5,D4 .5,E4 4,F4 1,F4 1,F4 1.5,F4 .5,F4 1,E4 1,E4 1,E4 .5,E4 .5,G4 1,G4 1,F4 1,D4 1,C4 4' },
    { title: 'We Wish You a Merry Christmas', bpm: 150, notes:
      'D4 1,G4 1,G4 .5,A4 .5,G4 .5,F#4 .5,E4 1,E4 1,E4 1,A4 1,A4 .5,B4 .5,A4 .5,G4 .5,F#4 1,D4 1,D4 1,B4 1,B4 .5,C5 .5,B4 .5,A4 .5,G4 1,E4 1,D4 .5,D4 .5,E4 1,A4 1,F#4 1,G4 2,R 1,' +
      'D4 1,G4 1,G4 1,G4 1,F#4 2,F#4 1,G4 1,F#4 1,E4 1,D4 2,A4 1,B4 1,A4 .5,A4 .5,G4 .5,G4 .5,D5 1,D4 1,D4 .5,D4 .5,E4 1,A4 1,F#4 1,G4 3' },
    { title: 'Deck the Halls', bpm: 140, notes:
      'G4 1.5,F4 .5,E4 1,D4 1,C4 1,D4 1,E4 1,C4 1,D4 .5,E4 .5,F4 .5,D4 .5,E4 1.5,D4 .5,C4 1,B3 1,C4 2,' +
      'G4 1.5,F4 .5,E4 1,D4 1,C4 1,D4 1,E4 1,C4 1,D4 .5,E4 .5,F4 .5,D4 .5,E4 1.5,D4 .5,C4 1,B3 1,C4 2,' +
      'D4 1.5,E4 .5,F4 1,D4 1,E4 1.5,F4 .5,G4 1,D4 1,E4 .5,F#4 .5,G4 1,A4 .5,B4 .5,C5 1,B4 1,A4 1,G4 2,' +
      'G4 1.5,F4 .5,E4 1,D4 1,C4 1,D4 1,E4 1,C4 1,A4 .5,A4 .5,A4 .5,A4 .5,G4 1.5,F4 .5,E4 1,D4 1,C4 2' },
    { title: 'Silent Night', bpm: 210, soft: true, notes:
      'G4 3,A4 1,G4 2,E4 6,G4 3,A4 1,G4 2,E4 6,D5 4,D5 2,B4 6,C5 4,C5 2,G4 6,A4 4,A4 2,C5 3,B4 1,A4 2,G4 3,A4 1,G4 2,E4 6,' +
      'A4 4,A4 2,C5 3,B4 1,A4 2,G4 3,A4 1,G4 2,E4 6,D5 4,D5 2,F5 3,D5 1,B4 2,C5 6,E5 6,C5 3,G4 1,E4 2,G4 3,F4 1,D4 2,C4 12' },
  ];
  var IDX = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
  function freq(n) { var m = n.match(/^([A-G]#?)(\d)$/); return 440 * Math.pow(2, ((+m[2] + 1) * 12 + IDX[m[1]] - 69) / 12); }

  var Synth = {
    ctx: null, master: null, timer: null, noise: null,
    play: function (song, volume, onend) {
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return onend && onend();
      this.stop();
      var ctx = this.ctx = new AC(); this.master = ctx.createGain(); this.master.gain.value = Math.max(0.05, volume || 0.6) * 0.9; this.master.connect(ctx.destination);
      if (ctx.state === 'suspended') ctx.resume();
      var beat = 60 / song.bpm, t = ctx.currentTime + .15, b = 0, self = this;
      song.notes.split(',').forEach(function (tok) {
        var p = tok.trim().split(/\s+/), dur = parseFloat(p[1]) * beat;
        if (p[0] !== 'R') self.note(freq(p[0]), t, dur, song.soft);
        if (song.bells && Math.abs(b - Math.round(b)) < .01) self.bell(t);
        if (Math.abs(b % (song.bpm > 200 ? 6 : 2)) < .01) self.bass(freq(p[0] === 'R' ? 'C3' : p[0].replace(/\d/, '3')), t, Math.min(dur * 2, 1.2));
        t += dur; b += parseFloat(p[1]);
      });
      this.timer = setTimeout(function () { self.stop(); if (onend) onend(); }, (t - ctx.currentTime + 1.4) * 1000);
      return ctx.state !== 'suspended';
    },
    stop: function () { clearTimeout(this.timer); if (this.ctx) { try { this.ctx.close(); } catch (e) { /* */ } } this.ctx = null; this.noise = null; },
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
  };

  /* ---------------- shared floating dock (music + New Year countdown) ---------------- */
  VV.dock = function () {
    var d = document.querySelector('.ny-dock');
    if (!d) { d = document.createElement('div'); d.className = 'ny-dock'; document.body.appendChild(d); }
    return d;
  };

  /* ---------------- player ---------------- */
  var P = VV.music = {
    cfg: null, list: [], i: 0, on: false, audio: null,
    init: function () {
      var cfg = P.cfg = (VV.data && VV.data.settings.music) || {};
      if (cfg.enabled === false) return;
      var list = (cfg.tracks || []).filter(function (t) { return t && t.src && !t.hidden; }).map(function (t) { return { title: t.title || 'VIVACHE', src: t.src }; });
      if (cfg.builtin !== false) CAROLS.forEach(function (c, k) { list.push({ title: c.title, carol: k }); });
      if (!list.length) return;
      if (cfg.shuffle) {
        var seed = +(sessionStorage.getItem('vv_mus_seed') || Math.floor(Math.random() * 1e6));
        sessionStorage.setItem('vv_mus_seed', seed);
        list = list.map(function (t, k) { return [((seed * (k + 7)) % 997), t]; }).sort(function (a, b) { return a[0] - b[0]; }).map(function (x) { return x[1]; });
      }
      P.list = list;
      var st = {}; try { st = JSON.parse(sessionStorage.getItem('vv_mus')) || {}; } catch (e) { /* */ }
      P.i = st.i >= 0 && st.i < list.length ? st.i : 0;
      P.resumeAt = st.t || 0;
      P.dock();
      var off = localStorage.getItem('vv_music') === 'off';
      if (cfg.autoplay !== false && !off) {
        // try right away (allowed if the visitor already interacted with the site before) …
        if (!P.list[P.i].carol && P.list[P.i].src) P.start(true);
        // … otherwise on the first click / tap / key anywhere on the page
        var go = function (e) {
          if (e.target.closest && e.target.closest('.ny-dock')) return;
          ['pointerdown', 'click', 'keydown', 'touchstart'].forEach(function (ev) { document.removeEventListener(ev, go, true); });
          if (!P.on && localStorage.getItem('vv_music') !== 'off') P.start();
        };
        ['pointerdown', 'click', 'keydown', 'touchstart'].forEach(function (ev) { document.addEventListener(ev, go, true); });
      }
    },
    save: function () { try { sessionStorage.setItem('vv_mus', JSON.stringify({ i: P.i, t: P.audio && !P.audio.paused ? P.audio.currentTime : 0 })); } catch (e) { /* */ } },
    start: function (quiet) {
      P.on = true; P.play(quiet);
      if (!quiet) localStorage.setItem('vv_music', 'on');
    },
    stop: function () {
      P.on = false; localStorage.setItem('vv_music', 'off');
      if (P.audio) P.audio.pause();
      Synth.stop(); P.ui();
    },
    play: function (quiet) {
      var tr = P.list[P.i], vol = P.cfg.volume != null ? +P.cfg.volume : 0.6;
      Synth.stop(); if (P.audio) P.audio.pause();
      if (tr.carol != null) {
        Synth.play(CAROLS[tr.carol], vol, function () { if (P.on) P.next(); });
      } else {
        var a = P.audio || (P.audio = new Audio());
        a.preload = 'auto'; a.volume = Math.min(1, Math.max(0, vol));
        if (a.getAttribute('data-src') !== tr.src) { a.src = tr.src; a.setAttribute('data-src', tr.src); }
        a.onended = function () { P.resumeAt = 0; if (P.on) P.next(); };
        a.onerror = function () { if (P.on) setTimeout(P.next, 600); };
        a.ontimeupdate = function () { if (Math.floor(a.currentTime) % 3 === 0) P.save(); };
        if (P.resumeAt) { try { a.currentTime = P.resumeAt; } catch (e) { /* */ } P.resumeAt = 0; }
        var pr = a.play();
        if (pr && pr.catch) pr.catch(function () { if (quiet) { P.on = false; P.ui(); } });   // browser blocked autoplay → wait for a click
      }
      P.save(); P.ui();
    },
    next: function () { P.resumeAt = 0; P.i = (P.i + 1) % P.list.length; if (P.audio) P.audio.removeAttribute('data-src'); if (P.on) P.play(); else { P.save(); P.ui(); } },
    toggle: function () { if (P.on) P.stop(); else P.start(); },
    dock: function () {
      var d = VV.dock();
      if (d.querySelector('.ny-music')) return;
      var box = document.createElement('span'); box.className = 'ny-mus';
      box.innerHTML = '<button type="button" class="ny-music" aria-pressed="false" title="' + VV.t('music_play') + '"><span class="ny-music__icon">' + VV.icon('music', 'icon--sm') + '</span><span class="ny-eq"><i></i><i></i><i></i><i></i></span></button>' +
        '<button type="button" class="ny-next" title="' + VV.t('music_next') + '" aria-label="' + VV.t('music_next') + '">▶▶</button><span class="ny-song"></span>';
      d.insertBefore(box, d.firstChild);
      box.querySelector('.ny-music').addEventListener('click', P.toggle);
      box.querySelector('.ny-next').addEventListener('click', function () { if (!P.on) P.start(); else P.next(); });
      P.ui();
    },
    ui: function () {
      var b = document.querySelector('.ny-music'); if (!b) return;
      b.classList.toggle('is-on', P.on); b.setAttribute('aria-pressed', P.on);
      b.title = VV.t(P.on ? 'music_pause' : 'music_play');
      var n = document.querySelector('.ny-song'); if (n && P.list[P.i]) n.textContent = '♪ ' + P.list[P.i].title;
    },
  };
  window.addEventListener('pagehide', function () { P.save(); });
})();
