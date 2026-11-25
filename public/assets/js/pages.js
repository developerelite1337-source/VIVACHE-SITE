/* Vivace — page renderers. Each one fills <main id="main"> from VV.data, then core.js runs the motion. */
(function () {
  'use strict';
  var VV = (window.VV = window.VV || {});
  var P = (VV.pages = VV.pages || {});
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var main = function (html) { document.getElementById('main').innerHTML = html; };
  var e = function (s) { return VV.esc(s); };
  var I = function (n, c) { return VV.icon(n, c); };
  var COLORS = ['#FF3D7F', '#FFB020', '#2F6BFF', '#22C55E', '#8B5CF6', '#14B8A6'];

  function sortProducts(list) {
    return list.slice().sort(function (a, b) { return (b.hot - a.hot) || ((a.sort || 0) - (b.sort || 0)) || ((b.popularity || 0) - (a.popularity || 0)) || String(b.created).localeCompare(String(a.created)); });
  }
  function grid(list) { return '<div class="p-grid">' + list.map(VV.card).join('') + '</div>'; }
  function sectionHead(eyebrow, title, lead, link) {
    return '<div class="section__head" data-anim="reveal"><div><span class="eyebrow">' + e(eyebrow) + '</span><h2 class="h-1">' + e(title) + '</h2>' + (lead ? '<p class="lead">' + e(lead) + '</p>' : '') + '</div>' +
      (link ? '<a class="btn btn--ghost" href="' + link[1] + '" data-magnetic>' + e(link[0]) + ' ' + I('arrow-right', 'icon--sm') + '</a>' : '') + '</div>';
  }
  function crumbs(list) {
    return '<nav class="crumbs" aria-label="breadcrumbs"><a href="/">' + VV.t('home') + '</a>' + list.map(function (c) { return ' <span>/</span> ' + (c[1] ? '<a href="' + c[1] + '">' + e(c[0]) + '</a>' : '<b>' + e(c[0]) + '</b>'); }).join('') + '</nav>';
  }
  function pageHero(eyebrow, title, lead, color, extra) {
    return '<section class="page-hero" style="--t:' + (color || '#FF3D7F') + '"><div class="page-hero__shapes" aria-hidden="true"><i></i><i></i><i></i></div><div class="wrap">' + (extra || '') +
      '<span class="eyebrow" data-anim="intro">' + e(eyebrow) + '</span><h1 class="h-display" data-split="words">' + e(title) + '</h1>' + (lead ? '<p class="lead" data-anim="intro">' + e(lead) + '</p>' : '') + '</div></section>';
  }
  function newsCard(n, big) {
    return '<a class="n-card' + (big ? ' n-card--big' : '') + '" href="/post/' + encodeURIComponent(n.id) + '" style="--t:' + (n.color || '#2F6BFF') + '" data-anim="item">' +
      '<div class="n-card__media">' + (n.image ? '<img src="' + e(n.image) + '" alt="" loading="lazy">' : '') + '</div>' +
      '<div class="n-card__body"><time>' + VV.date(n.date) + '</time><h3>' + e(VV.tr(n.title)) + '</h3>' + (VV.tr(n.excerpt) ? '<p>' + e(VV.tr(n.excerpt)) + '</p>' : '') +
      '<span class="link-arrow">' + VV.t('read_more') + ' ' + I('arrow-right', 'icon--sm') + '</span></div></a>';
  }
  function stats() {
    var n = VV.data.settings.numbers || {};
    return {
      products: +n.products || VV.data.products.length,
      brands: +n.brands || VV.data.brands.length,
      years: +n.years || 0, stores: +n.stores || 0,
    };
  }

  /* ============================== HOME ============================== */
  P.home = function () {
    var D = VV.data, home = D.settings.home || {}, html = '';
    VV.setTitle('');
    if (home.hero !== false && D.hero.length) html += heroHtml();
    if (home.band !== false) html += bandHtml();
    if (home.directions !== false) html += directionsHtml();
    if (home.hot !== false) html += hotHtml();
    if (home.sale !== false) html += saleHtml();
    if (home.features !== false) html += featuresHtml();
    if (home.news !== false && D.news.length) html += '<section class="section news-sec"><div class="wrap">' + sectionHead(VV.t('news_eyebrow'), VV.t('news_title'), '', [VV.t('see_all'), '/news']) +
      '<div class="n-grid">' + D.news.slice(0, 3).map(function (n, i) { return newsCard(n, i === 0); }).join('') + '</div></div></section>';
    if (home.cashback !== false && (VV.data.settings.cashback || {}).enabled !== false) html += cashbackHtml();
    if (home.brands !== false && D.brands.length) html += brandsHtml();
    main(html);
    initHero(); initHotTabs();
    if (VV.data.settings.auth && $('#cb-me')) VV.acc.me().then(function (me) { if (me) $('#cb-me').innerHTML = '<b>' + VV.money((me.available_tetri || 0) / 100) + '</b> ' + VV.t('cb_available'); });
  };

  function heroHtml() {
    var st = stats();
    var slides = VV.data.hero.map(function (h, i) {
      if (h.layout === 'banner' && h.image) {
        return '<div class="hero-slide hero-slide--banner' + (i === 0 ? ' is-active' : '') + '" data-slide="' + i + '" style="--t:' + (h.color || '#FFD400') + '" aria-roledescription="slide">' +
          '<div class="wrap"><a class="hero-banner" href="' + e(h.cta_url || '/shop') + '"><img src="' + e(h.image) + '" alt="' + e(VV.tr(h.title).replace(/<[^>]+>/g, '')) + '"' + (i ? ' loading="lazy"' : ' fetchpriority="high"') + '><span class="hero-banner__shine"></span></a></div></div>';
      }
      var prods = (h.products || []).map(VV.product).filter(Boolean);
      if (h.bg) {
        var T2 = i === 0 ? 'h1' : 'h2';
        return '<div class="hero-slide hero-slide--photo' + (i === 0 ? ' is-active' : '') + '" data-slide="' + i + '" style="--t:' + (h.color || '#FF3D7F') + '" aria-roledescription="slide">' +
          '<div class="hero-slide__bg"><img src="' + e(h.bg) + '" alt=""' + (i ? ' loading="lazy"' : ' fetchpriority="high"') + '></div>' +
          '<div class="wrap hero__grid hero__grid--photo"><div class="hero__copy hero__glass">' +
            (VV.tr(h.eyebrow) ? '<span class="eyebrow eyebrow--pill">' + e(VV.tr(h.eyebrow)) + '</span>' : '') +
            '<' + T2 + ' class="h-display hero__title" data-split="words">' + VV.tr(h.title).replace(/<(?!\/?em>)[^>]*>/g, '') + '</' + T2 + '>' +
            (VV.tr(h.lead) ? '<p class="lead">' + e(VV.tr(h.lead)) + '</p>' : '') +
            '<div class="hero__actions">' +
              (VV.tr(h.cta) ? '<a class="btn btn--accent" href="' + e(h.cta_url || '/shop') + '" data-magnetic>' + e(VV.tr(h.cta)) + ' ' + I('arrow-right', 'icon--sm') + '</a>' : '') +
              (VV.tr(h.cta2) ? '<a class="btn btn--light" href="' + e(h.cta2_url || '/shop') + '" data-magnetic>' + e(VV.tr(h.cta2)) + '</a>' : '') +
            '</div></div>' +
          '<div class="hero-float">' + prods.slice(0, 2).map(function (p, k) { return '<a class="hero-float__p hero-float__p--' + k + '" href="' + VV.productUrl(p) + '" style="--t:' + VV.catColor(p.category_id) + '"><img src="' + e(VV.img(p)) + '" alt="' + e(VV.tr(p.name)) + '"><span><b>' + e(VV.tr(p.name)) + '</b>' + (p.price ? '<em>' + VV.money(p.price) + '</em>' : '') + '</span></a>'; }).join('') + '</div>' +
          '</div></div>';
      }
      var art = h.image
        ? '<img class="hero-art__img" src="' + e(h.image) + '" alt="">'
        : prods.map(function (p, k) { return '<a class="hero-art__p hero-art__p--' + k + '" href="' + VV.productUrl(p) + '" style="--t:' + VV.catColor(p.category_id) + '"><img src="' + e(VV.img(p)) + '" alt="' + e(VV.tr(p.name)) + '">' + (p.price ? '<span class="hero-art__tag">' + VV.money(p.price) + '</span>' : '') + '</a>'; }).join('');
      var T = i === 0 ? 'h1' : 'h2';
      return '<div class="hero-slide' + (i === 0 ? ' is-active' : '') + '" data-slide="' + i + '" style="--t:' + (h.color || '#FF3D7F') + '" aria-roledescription="slide">' +
        '<div class="wrap hero__grid"><div class="hero__copy">' +
          (VV.tr(h.eyebrow) ? '<span class="eyebrow eyebrow--pill"' + (i === 0 ? ' data-anim="intro"' : '') + '>' + e(VV.tr(h.eyebrow)) + '</span>' : '') +
          '<' + T + ' class="h-display hero__title" data-split="words">' + VV.tr(h.title).replace(/<(?!\/?em>)[^>]*>/g, '') + '</' + T + '>' +
          (VV.tr(h.lead) ? '<p class="lead"' + (i === 0 ? ' data-anim="intro"' : '') + '>' + e(VV.tr(h.lead)) + '</p>' : '') +
          '<div class="hero__actions"' + (i === 0 ? ' data-anim="intro"' : '') + '>' +
            (VV.tr(h.cta) ? '<a class="btn btn--accent" href="' + e(h.cta_url || '/shop') + '" data-magnetic>' + e(VV.tr(h.cta)) + ' ' + I('arrow-right', 'icon--sm') + '</a>' : '') +
            (VV.tr(h.cta2) ? '<a class="btn btn--ghost" href="' + e(h.cta2_url || '/shop') + '" data-magnetic>' + e(VV.tr(h.cta2)) + '</a>' : '') +
          '</div>' +
          (i === 0 ? '<div class="hero__meta" data-anim="intro"><div><strong data-count="' + st.products + '">' + st.products + '</strong><span>' + VV.t('items') + '</span></div><div><strong data-count="' + st.brands + '">' + st.brands + '</strong><span>' + VV.t('brands') + '</span></div>' + (st.years ? '<div><strong data-count="' + st.years + '">' + st.years + '</strong><span>' + VV.t('years') + '</span></div>' : '') + '</div>' : '') +
        '</div><div class="hero-art"><span class="hero-art__ring"></span><span class="hero-art__blob"></span>' + art + '</div></div></div>';
    }).join('');
    var dots = VV.data.hero.map(function (h, i) { return '<button type="button" class="hero-dot' + (i === 0 ? ' is-on' : '') + '" data-slide-to="' + i + '" aria-label="' + (i + 1) + '"><i></i></button>'; }).join('');
    return '<section class="hero" id="hero"><div class="hero__shapes" aria-hidden="true">' +
      ['circle', 'star', 'tri', 'ring', 'circle', 'squig'].map(function (s, i) { return '<i class="shape shape--' + s + '" style="--c:' + COLORS[i % COLORS.length] + ';--i:' + i + '" data-parallax="' + (0.04 + i * 0.02) + '"></i>'; }).join('') +
      '</div><div class="hero-slides">' + slides + '</div>' +
      (VV.data.hero.length > 1 ? '<div class="wrap hero-nav"><button type="button" class="tool-btn" data-slide-step="-1" aria-label="prev">' + I('arrow-left') + '</button><div class="hero-dots">' + dots + '</div><button type="button" class="tool-btn" data-slide-step="1" aria-label="next">' + I('arrow-right') + '</button></div>' : '') +
      '</section>';
  }

  function initHero() {
    var hero = $('#hero'); if (!hero) return;
    var slides = $$('.hero-slide', hero), dots = $$('.hero-dot', hero), cur = 0, timer, DUR = 7000;
    if (slides.length < 2) return;
    hero.style.setProperty('--dur', DUR + 'ms');
    function go(n) {
      n = (n + slides.length) % slides.length; if (n === cur) return;
      slides[cur].classList.remove('is-active'); dots[cur].classList.remove('is-on');
      cur = n; slides[cur].classList.add('is-active'); dots[cur].classList.add('is-on');
      hero.style.setProperty('--hero-t', slides[cur].style.getPropertyValue('--t'));
      var g = window.gsap;
      if (g && VV.splitWords && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        var title = $('.hero__title', slides[cur]); var w = VV.splitWords(title); g.set(title, { autoAlpha: 1 });
        g.fromTo(w, { yPercent: 110 }, { yPercent: 0, duration: .7, stagger: .06, ease: 'power3.out' });
        g.fromTo($$('.eyebrow, .lead, .hero__actions', slides[cur]), { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .6, stagger: .07, delay: .1, ease: 'power2.out' });
        g.fromTo($$('.hero-art__p, .hero-art__img', slides[cur]), { scale: .6, autoAlpha: 0, rotate: -8 }, { scale: 1, autoAlpha: 1, rotate: 0, duration: .8, stagger: .08, ease: 'back.out(1.6)' });
      }
      restart();
    }
    function restart() { clearTimeout(timer); timer = setTimeout(function () { go(cur + 1); }, DUR); dots.forEach(function (d) { var i = d.querySelector('i'); i.style.animation = 'none'; void i.offsetWidth; i.style.animation = ''; }); }
    hero.addEventListener('click', function (ev) {
      var t = ev.target.closest('[data-slide-to]'); if (t) go(+t.getAttribute('data-slide-to'));
      var s = ev.target.closest('[data-slide-step]'); if (s) go(cur + (+s.getAttribute('data-slide-step')));
    });
    hero.addEventListener('pointerenter', function () { hero.classList.add('is-paused'); clearTimeout(timer); });
    hero.addEventListener('pointerleave', function () { hero.classList.remove('is-paused'); restart(); });
    var sx = null;
    hero.addEventListener('touchstart', function (ev) { sx = ev.touches[0].clientX; }, { passive: true });
    hero.addEventListener('touchend', function (ev) { if (sx == null) return; var dx = ev.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) go(cur + (dx < 0 ? 1 : -1)); sx = null; });
    hero.style.setProperty('--hero-t', slides[0].style.getPropertyValue('--t'));
    restart();
  }

  /* moving band — same logic as admin2 "მთავარი გვერდის ზოლი" (auto / manual, promo styles) */
  VV.bandProducts = function () {
    var b = VV.data.settings.band || {}, all = VV.data.products.filter(function (p) { return VV.img(p); });
    if (b.mode === 'manual' && (b.manual || []).length) return b.manual.map(VV.product).filter(Boolean);
    var src = b.source || 'all', list = all;
    if (src === 'sale') list = all.filter(VV.disc);
    else if (src === 'hot') list = all.filter(function (p) { return p.hot; });
    else if (src !== 'all') list = all.filter(function (p) { return VV.inCat(p, src); });
    if (list.length < 4) list = all;
    if (b.daily) {
      var seed = +new Date().toISOString().slice(0, 10).replace(/-/g, '');
      list = list.map(function (p, i) { return [((seed * (i + 7)) % 997), p]; }).sort(function (x, y) { return x[0] - y[0]; }).map(function (x) { return x[1]; });
    }
    if (b.featured) list = list.slice().sort(function (x, y) { return y.hot - x.hot; });
    return list.slice(0, Math.max(4, +b.count || 16));
  };

  function bandHtml() {
    var b = VV.data.settings.band || {}, prods = VV.bandProducts(), st = stats();
    if (!prods.length) return '';
    var half = Math.ceil(prods.length / 2);
    var rows = prods.length > 4 ? [prods.slice(0, half), prods.slice(half)] : [prods];
    rows = rows.map(function (r) { var out = r.slice(); while (r.length && out.length < 8) out = out.concat(r); return out; });
    function prodSet(row, copy) {
      return '<div class="band__set"' + (copy ? ' aria-hidden="true"' : '') + '>' + row.map(function (p) {
        var d = VV.disc(p);
        return '<a class="band-prod" href="' + VV.productUrl(p) + '" style="--t:' + VV.catColor(p.category_id) + '"' + (copy ? ' tabindex="-1"' : '') + '>' +
          '<span class="band-prod__img"><img src="' + e(VV.img(p)) + '" alt="" loading="lazy" draggable="false"></span>' +
          (d ? '<span class="band-prod__off">−' + d + '%</span>' : '') +
          '<span class="band-prod__name">' + e(VV.tr(p.name)) + '</span>' +
          '<span class="band-prod__buy"><em>' + (p.price ? (d ? '<s>' + VV.money(p.old_price) + '</s> ' : '') + VV.money(p.price) : VV.t('price_on_request')) + '</em><b>' + VV.t('order_now') + ' ' + I('arrow-right', 'icon--sm') + '</b></span></a>';
      }).join('') + '</div>';
    }
    var lanes = rows.map(function (row, r) {
      return '<div class="band__lane" data-mq data-track=".band__row" data-speed="' + (r ? 24 : -28) + '" data-hover-pause><div class="band__row">' + prodSet(row) + prodSet(row, 1) + '</div></div>';
    }).join('');
    var words = VV.tr(b.words).split(',').map(function (w) { return w.trim(); }).filter(Boolean);
    if (words.length) {
      var ws = '<div class="band__set">' + words.map(function (w, i) { return '<span style="--c:' + COLORS[i % COLORS.length] + '">' + e(w) + '</span>'; }).join('') + '</div>';
      lanes += '<div class="band__lane" data-mq data-track=".band__row" data-speed="34" aria-hidden="true"><div class="band__row band__row--words">' + ws + ws + '</div></div>';
    }
    var meta = e(VV.tr(b.meta)).replace(':products', '<b>' + st.products + '</b>').replace(':brands', '<b>' + st.brands + '</b>');
    return '<section class="section--tight home-band" id="band"><div class="wrap"><div class="band band--' + e(b.style || 'default') + '" data-anim="reveal">' +
      '<div class="band__copy">' + (b.badge ? '<span class="band__badge">' + e(b.badge) + '</span>' : '') +
        '<span class="eyebrow">' + e(VV.tr(b.eyebrow)) + '</span><h2 class="band__title">' + e(VV.tr(b.title)) + '</h2><p class="band__meta">' + meta + '</p>' +
        (VV.data.settings.promo && VV.data.settings.promo.ends && new Date(VV.data.settings.promo.ends) > new Date() && b.style !== 'default' ? '<p class="band__timer">' + I('clock', 'icon--sm') + ' ' + VV.t('ends_in') + ' <b data-countdown="' + new Date(VV.data.settings.promo.ends).toISOString() + '">—</b></p>' : '') +
        '<a class="btn btn--light" href="' + e(b.url || '/shop') + '" data-magnetic>' + e(VV.tr(b.btn) || VV.t('all_products')) + ' ' + I('arrow-right', 'icon--sm') + '</a></div>' +
      '<div class="band__stage">' + lanes + '</div></div></div></section>';
  }

  function directionsHtml() {
    var cats = VV.topCats();
    return '<section class="section" id="directions"><div class="wrap">' + sectionHead(VV.t('dir_eyebrow'), VV.t('dir_title'), VV.t('dir_lead'), [VV.t('all_products'), '/shop']) +
      '<div class="dir-grid">' + cats.map(function (c, i) {
        var prods = VV.data.products.filter(function (p) { return VV.inCat(p, c.id); });
        var imgs = prods.filter(VV.img).slice(0, 3);
        return '<a class="dir-card" href="/shop?cat=' + c.id + '" style="--t:' + (c.color || COLORS[i % COLORS.length]) + '" data-anim="item" data-tilt>' +
          '<div class="dir-card__media"><span class="dir-card__icon">' + e(c.icon || '★') + '</span>' +
            (c.image ? '<img class="dir-card__cover" src="' + e(c.image) + '" alt="" loading="lazy"><span class="dir-card__shade"></span>' : imgs.map(function (p, k) { return '<img class="dir-card__p dir-card__p--' + k + '" src="' + e(VV.img(p)) + '" alt="" loading="lazy">'; }).join('')) +
          '</div><div class="dir-card__body"><h3 class="dir-card__title">' + e(VV.tr(c.name)) + '</h3><p class="dir-card__tag">' + e(VV.tr(c.tagline)) + '</p>' +
          (VV.children(c.id).length ? '<div class="dir-card__subs">' + VV.children(c.id).slice(0, 4).map(function (sc) { return '<span>' + e(VV.tr(sc.name)) + '</span>'; }).join('') + '</div>' : '') +
          '<div class="dir-card__foot"><span class="chip">' + prods.length + ' ' + VV.t('items') + '</span><span class="dir-card__go">' + I('arrow-up-right') + '</span></div></div></a>';
      }).join('') + '</div></div></section>';
  }

  function hotHtml() {
    var cats = VV.topCats();
    var list = sortProducts(VV.data.products.filter(function (p) { return p.hot; }));
    if (list.length < 4) list = sortProducts(VV.data.products);
    return '<section class="section section--soft" id="hot"><div class="wrap">' + sectionHead(VV.t('hot_eyebrow'), VV.t('hot_title'), '', [VV.t('see_all'), '/shop']) +
      '<div class="tabs" role="tablist" data-anim="reveal"><button type="button" role="tab" class="tab is-on" data-hot="">' + VV.t('all') + '</button>' +
      cats.map(function (c) { return '<button type="button" role="tab" class="tab" style="--t:' + c.color + '" data-hot="' + c.id + '">' + e(c.icon || '') + ' ' + e(VV.tr(c.name)) + '</button>'; }).join('') + '</div>' +
      '<div id="hot-grid">' + grid(list.slice(0, 8)) + '</div></div></section>';
  }
  function initHotTabs() {
    var box = $('#hot-grid'); if (!box) return;
    $$('[data-hot]').forEach(function (b) {
      b.addEventListener('click', function () {
        $$('[data-hot]').forEach(function (x) { x.classList.toggle('is-on', x === b); });
        var id = b.getAttribute('data-hot');
        var list = sortProducts(VV.data.products.filter(function (p) { return !id || VV.inCat(p, id); }));
        if (!id) list = list.filter(function (p) { return p.hot; }).concat(list.filter(function (p) { return !p.hot; }));
        box.innerHTML = grid(list.slice(0, 8));
        if (window.gsap) window.gsap.fromTo($$('.p-card', box), { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .45, stagger: .04, ease: 'back.out(1.4)' });
        else $$('.p-card', box).forEach(function (c) { c.style.opacity = 1; });
      });
    });
  }

  function saleHtml() {
    var list = VV.data.products.filter(VV.disc).sort(function (a, b) { return VV.disc(b) - VV.disc(a); });
    if (!list.length) return '';
    return '<section class="section" id="sale"><div class="wrap">' + sectionHead(VV.t('sale_eyebrow'), VV.t('sale_title'), '', [VV.t('see_all'), '/shop?sale=1']) +
      '<div class="rail">' + list.slice(0, 12).map(VV.card).join('') + '</div></div></section>';
  }

  function featuresHtml() {
    var f = [['truck', 'f1', '#2F6BFF'], ['gift', 'f2', '#FF3D7F'], ['shield', 'f3', '#22C55E'], ['refresh', 'f4', '#FFB020']];
    return '<section class="section--tight"><div class="wrap"><ul class="features">' + f.map(function (x) {
      var sub = VV.t(x[1] + '_t'), ff = (VV.data.settings.shop || {}).free_from;
      if (x[1] === 'f1' && ff) sub = VV.lang === 'ka' ? VV.money(ff) + '-დან ყველა შეკვეთაზე' : 'On orders from ' + VV.money(ff);
      return '<li class="feature" style="--t:' + x[2] + '" data-anim="item"><span class="feature__icon">' + I(x[0], 'icon--lg') + '</span><div><b>' + VV.t(x[1]) + '</b><small>' + sub + '</small></div></li>';
    }).join('') + '</ul></div></section>';
  }

  function cashbackHtml() {
    var cb = VV.data.settings.cashback || {}, ka = VV.lang === 'ka';
    return '<section class="section cashback" id="cashback"><div class="wrap cashback__grid"><div data-anim="reveal"><span class="eyebrow">' + e(VV.tr(cb.eyebrow) || VV.t('cb_eyebrow')) + '</span><h2 class="h-1">' + e(VV.tr(cb.title)) + '</h2><p class="lead">' + e(VV.tr(cb.lead)) + '</p>' +
      '<ul class="cashback__perks"><li style="--t:#22C55E">' + I('refresh', 'icon--sm') + (ka ? 'ქეშბექი ყოველ ყიდვაზე — მაღაზიაშიც და ონლაინაც' : 'Cashback on every purchase, in store and online') + '</li>' +
      '<li style="--t:#2F6BFF">' + I('cart', 'icon--sm') + (ka ? 'გადაიხადე ქეშბექით საიტზე შეკვეთისას' : 'Pay with cashback when you order online') + '</li>' +
      '<li style="--t:#FF3D7F">' + I('user', 'icon--sm') + (ka ? 'ბალანსი, ჩეკები და შეკვეთები — შენს ანგარიშზე' : 'Balance, receipts and orders in your account') + '</li></ul>' +
      '<div class="hero__actions"><a class="btn btn--accent" href="' + (VV.data.settings.auth ? '/account' : '/contact') + '" data-magnetic>' + I('card', 'icon--sm') + ' ' + e(VV.tr(cb.btn) || VV.t('account')) + '</a><span class="cashback__me" id="cb-me"></span></div></div>' +
      '<div class="cashback__visual" data-anim="reveal"><div class="cashback__card" data-tilt><img src="' + e(cb.image || '/assets/img/brand/cashback-card.webp') + '" alt="' + e(VV.tr(cb.eyebrow)) + '" loading="lazy"></div>' +
      '<i class="coin coin--1">₾</i><i class="coin coin--2">₾</i><i class="coin coin--3">%</i></div></div></section>';
  }

  function giftHtml() {
    return '<section class="section giftcard"><div class="wrap giftcard__grid"><div data-anim="reveal"><span class="eyebrow">' + VV.t('gc_eyebrow') + '</span><h2 class="h-1">' + VV.t('gc_title') + '</h2><p class="lead">' + VV.t('gc_lead') + '</p>' +
      '<a class="btn btn--accent" href="/contact" data-magnetic>' + VV.t('gc_cta') + ' ' + I('arrow-right', 'icon--sm') + '</a></div>' +
      '<div class="giftcard__visual" data-anim="reveal"><div class="gcard" data-tilt><span class="gcard__shine"></span><div class="gcard__top">' + VV.logo('logo-word--light') + I('gift', 'icon--lg') + '</div>' +
      '<div class="gcard__amount">100 ₾</div><div class="gcard__bottom"><span>GIFT CARD</span><span>•••• 2026</span></div></div></div></div></section>';
  }

  function brandsHtml() {
    var set = '<div class="brands__set">' + VV.data.brands.map(function (b) {
      var inner = b.logo ? '<img src="' + e(b.logo) + '" alt="' + e(b.name) + '" draggable="false">' : '<span>' + e(b.name) + '</span>';
      return '<a class="brand-pill" style="--t:' + (b.color || '#15171A') + '" href="/shop?brand=' + encodeURIComponent(b.name) + '">' + inner + '</a>';
    }).join('') + '</div>';
    return '<section class="section--tight brands-sec"><div class="wrap"><h2 class="h-3 brands-sec__title" data-anim="reveal">' + VV.t('brands_title') + '</h2></div>' +
      '<div class="brands" data-mq data-track=".brands__row" data-speed="-36" data-hover-pause><div class="brands__row">' + set + set + set + set + '</div></div></section>';
  }

  /* ============================== SHOP ============================== */
  P.shop = function () {
    var D = VV.data, st = { cat: VV.qs('cat') || '', q: VV.qs('q') || '', brand: VV.qs('brand') || '', sale: VV.qs('sale') === '1', stock: false, sort: VV.qs('sort') || 'pop', min: '', max: '', limit: 12 };
    var cat = st.cat && VV.cat(st.cat), top = cat ? VV.topOf(cat.id) : null, color = cat ? VV.catColor(cat.id) : '#FF3D7F';
    var title = cat ? VV.tr(cat.name) : st.sale ? VV.t('sale') : VV.t('products');
    VV.setTitle(title);
    var crumbList = [[VV.t('products'), cat || st.sale ? '/shop' : '']];
    if (cat && top && top.id !== cat.id) crumbList.push([VV.tr(top.name), '/shop?cat=' + top.id]);
    if (cat) crumbList.push([VV.tr(cat.name), '']);
    var subs = cat ? VV.children(cat.id) : VV.topCats();
    var chips = subs.length ? '<div class="chips" data-anim="intro">' + subs.map(function (s) { return '<a class="chip chip--cat" style="--t:' + VV.catColor(s.id) + '" href="/shop?cat=' + s.id + '">' + e(s.icon ? s.icon + ' ' : '') + e(VV.tr(s.name)) + '</a>'; }).join('') + '</div>' : '';
    var lead = cat ? VV.tr(cat.tagline) : '';

    var tree = '<ul class="tree"><li><a href="/shop" class="' + (!st.cat ? 'is-on' : '') + '">' + VV.t('all_products') + ' <em>' + D.products.length + '</em></a></li>' + VV.topCats().map(function (c) {
      var n = D.products.filter(function (p) { return VV.inCat(p, c.id); }).length;
      var open = cat && (cat.id === c.id || (top && top.id === c.id));
      return '<li style="--t:' + c.color + '"><a href="/shop?cat=' + c.id + '" class="' + (st.cat === c.id ? 'is-on' : '') + '"><i></i>' + e(VV.tr(c.name)) + ' <em>' + n + '</em></a>' +
        (open ? '<ul>' + VV.children(c.id).map(function (s) { return '<li><a href="/shop?cat=' + s.id + '" class="' + (st.cat === s.id ? 'is-on' : '') + '">' + e(VV.tr(s.name)) + ' <em>' + D.products.filter(function (p) { return VV.inCat(p, s.id); }).length + '</em></a></li>'; }).join('') + '</ul>' : '') + '</li>';
    }).join('') + '</ul>';
    var brands = Array.from(new Set(D.products.map(function (p) { return p.brand; }).filter(Boolean))).sort();

    main(pageHero(VV.t('products'), title, lead, color, crumbs(crumbList)).replace('</div></section>', chips + '</div></section>') +
      '<section class="section--tight shop"><div class="wrap shop__grid">' +
        '<aside class="shop__side" id="shop-side"><div class="shop__side-head"><b>' + VV.t('filters') + '</b><button class="tool-btn" type="button" data-close-filters aria-label="' + VV.t('close') + '">' + I('close') + '</button></div>' +
          '<div class="side-block"><h4>' + VV.t('categories') + '</h4>' + tree + '</div>' +
          '<div class="side-block"><h4>' + VV.t('price') + '</h4><div class="price-range"><input type="number" min="0" placeholder="0" data-f="min" aria-label="min"><span>—</span><input type="number" min="0" placeholder="500" data-f="max" aria-label="max"></div></div>' +
          '<div class="side-block"><label class="switch"><input type="checkbox" data-f="sale"' + (st.sale ? ' checked' : '') + '><span></span>' + VV.t('only_sale') + '</label><label class="switch"><input type="checkbox" data-f="stock"><span></span>' + VV.t('only_stock') + '</label></div>' +
          (brands.length ? '<div class="side-block"><h4>' + VV.t('brand') + '</h4><div class="brand-list">' + brands.map(function (b) { return '<label class="check"><input type="radio" name="brand" value="' + e(b) + '" data-f="brand"' + (st.brand === b ? ' checked' : '') + '><span>' + e(b) + '</span></label>'; }).join('') + '<label class="check"><input type="radio" name="brand" value="" data-f="brand"' + (!st.brand ? ' checked' : '') + '><span>' + VV.t('all') + '</span></label></div></div>' : '') +
        '</aside>' +
        '<div class="shop__main"><div class="toolbar"><div class="search-inline">' + I('search', 'icon--sm') + '<input type="search" value="' + e(st.q) + '" placeholder="' + VV.t('search_placeholder') + '" data-f="q" aria-label="' + VV.t('search') + '"></div>' +
          '<select class="select" data-f="sort" aria-label="' + VV.t('sort') + '"><option value="pop">' + VV.t('sort_pop') + '</option><option value="new">' + VV.t('sort_new') + '</option><option value="cheap">' + VV.t('sort_cheap') + '</option><option value="exp">' + VV.t('sort_exp') + '</option></select>' +
          '<button class="btn btn--ghost btn--sm shop__filters-btn" type="button" data-open-filters>' + I('filter', 'icon--sm') + ' ' + VV.t('filters') + '</button></div>' +
          '<p class="shop__count" id="shop-count"></p><div id="shop-grid"></div><div class="shop__more" id="shop-more"></div></div>' +
      '</div></section>');
    $('[data-f="sort"]').value = st.sort;

    function apply(reset) {
      if (reset) st.limit = 12;
      var list = D.products.filter(function (p) {
        if (st.cat && !VV.inCat(p, st.cat)) return false;
        if (st.brand && p.brand !== st.brand) return false;
        if (st.sale && !VV.disc(p)) return false;
        if (st.stock && !VV.inStock(p)) return false;
        if (st.min !== '' && (p.price || 0) < +st.min) return false;
        if (st.max !== '' && (p.price || 0) > +st.max) return false;
        if (st.q) { var q = st.q.toLowerCase(); if ([p.name.ka, p.name.en, p.brand, p.code].join(' ').toLowerCase().indexOf(q) < 0) return false; }
        return true;
      });
      if (st.sort === 'new') list.sort(function (a, b) { return String(b.created).localeCompare(String(a.created)) || (b.isNew - a.isNew); });
      else if (st.sort === 'cheap') list.sort(function (a, b) { return (a.price || 1e9) - (b.price || 1e9); });
      else if (st.sort === 'exp') list.sort(function (a, b) { return (b.price || 0) - (a.price || 0); });
      else list = sortProducts(list);
      $('#shop-count').innerHTML = VV.t('found') + ': <b>' + list.length + '</b>';
      $('#shop-grid').innerHTML = list.length ? grid(list.slice(0, st.limit)) :
        '<div class="empty-state">' + I('search', 'icon--lg') + '<h3>' + VV.t('nothing') + '</h3><p>' + VV.t('nothing_t') + '</p><a class="btn btn--ghost btn--sm" href="/shop">' + VV.t('reset') + '</a></div>';
      $('#shop-more').innerHTML = list.length > st.limit ? '<button class="btn btn--ghost" type="button" data-more>' + VV.t('load_more') + ' (' + (list.length - st.limit) + ')</button>' : '';
      if (window.gsap) window.gsap.fromTo($$('#shop-grid .p-card'), { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .4, stagger: .03, ease: 'power2.out' });
      else $$('#shop-grid .p-card').forEach(function (c) { c.style.opacity = 1; });
      var u = new URLSearchParams(); if (st.cat) u.set('cat', st.cat); if (st.q) u.set('q', st.q); if (st.brand) u.set('brand', st.brand); if (st.sale) u.set('sale', '1'); if (st.sort !== 'pop') u.set('sort', st.sort);
      history.replaceState(null, '', '/shop' + (u.toString() ? '?' + u : ''));
    }
    var deb;
    $('.shop').addEventListener('input', function (ev) {
      var f = ev.target.getAttribute('data-f'); if (!f) return;
      st[f] = ev.target.type === 'checkbox' ? ev.target.checked : ev.target.value;
      clearTimeout(deb); deb = setTimeout(function () { apply(true); }, f === 'q' || f === 'min' || f === 'max' ? 250 : 0);
    });
    $('.shop').addEventListener('click', function (ev) {
      if (ev.target.closest('[data-more]')) { st.limit += 12; apply(); }
      if (ev.target.closest('[data-open-filters]')) $('#shop-side').classList.add('is-open');
      if (ev.target.closest('[data-close-filters]')) $('#shop-side').classList.remove('is-open');
    });
    apply(true);
  };

  /* ============================== PRODUCT ============================== */
  P.product = function () {
    var id = decodeURIComponent(location.pathname.split('/product/')[1] || VV.qs('id') || '').replace(/\/$/, '');
    var p = VV.product(id);
    if (!p) return P.notfound();
    var name = VV.tr(p.name), color = VV.catColor(p.category_id), cat = VV.cat(p.category_id), top = cat && VV.topOf(cat.id);
    var vs = VV.variants(p), d = VV.disc(p), imgs = (p.images || []).length ? p.images : [''];
    VV.setTitle(name);
    var cl = [[VV.t('shop'), '/shop']];
    if (top && top !== cat) cl.push([VV.tr(top.name), '/shop?cat=' + top.id]);
    if (cat) cl.push([VV.tr(cat.name), '/shop?cat=' + cat.id]);
    cl.push([name, '']);
    var stock = !VV.inStock(p) ? '<span class="status status--out">' + VV.t('out_stock') + '</span>' : p.price ? '<span class="status status--ok">' + VV.t('in_stock') + '</span>' : '<span class="status status--ask">' + VV.t('preorder') + '</span>';
    var related = sortProducts(VV.data.products.filter(function (x) { return x.id !== p.id && top && VV.inCat(x, top.id); })).slice(0, 4);

    main('<section class="pd-wrap" style="--t:' + color + '"><div class="wrap">' + crumbs(cl) +
      '<div class="pd">' +
        '<div class="pd__gallery" data-anim="intro"><div class="pd__stage"><span class="pd__blob"></span><span class="pd__blob pd__blob--2"></span>' +
          (imgs[0] ? '<img id="pd-img" src="' + e(imgs[0]) + '" alt="' + e(name) + '">' : '<span class="ph">' + I('gift', 'icon--lg') + '</span>') +
          '<span class="p-card__badges">' + (d ? '<span class="badge badge--sale">−' + d + '%</span>' : '') + (p.isNew ? '<span class="badge badge--new">' + VV.t('new') + '</span>' : '') + '</span></div>' +
          (imgs.length > 1 ? '<div class="pd__thumbs">' + imgs.map(function (src, i) { return '<button type="button" class="' + (i ? '' : 'is-on') + '" data-src="' + e(src) + '"><img src="' + e(src) + '" alt=""></button>'; }).join('') + '</div>' : '') +
        '</div>' +
        '<div class="pd__info">' +
          (p.brand ? '<a class="pd__brand" href="/shop?brand=' + encodeURIComponent(p.brand) + '" data-anim="intro">' + e(p.brand) + '</a>' : '') +
          '<h1 class="pd__title" data-split="words">' + e(name) + '</h1>' +
          '<div class="pd__meta" data-anim="intro">' + stock + (p.age ? '<span class="chip">' + VV.t('age') + ': ' + e(p.age) + '</span>' : '') + (p.code ? '<span class="chip">' + VV.t('code') + ': ' + e(p.code) + '</span>' : '') + (p.unit ? '<span class="chip">' + VV.t('unit') + ': ' + e(p.unit) + '</span>' : '') + '</div>' +
          '<div class="pd__price" id="pd-price" data-anim="intro"></div>' +
          (vs.length ? '<div class="pd__variants" data-anim="intro"><span class="pd__label">' + VV.t('variant') + '</span><div class="vchips">' + vs.map(function (v, i) { return '<button type="button" class="vchip' + (i ? '' : ' is-on') + '" data-v="' + i + '">' + e(v.label) + (v.price ? ' <small>' + VV.money(v.price) + '</small>' : '') + '</button>'; }).join('') + '</div></div>' : '') +
          (p.price && VV.inStock(p) ? '<div class="pd__buy" data-anim="intro"><div class="qty"><button type="button" data-pq="-1" aria-label="−">' + I('minus', 'icon--sm') + '</button><input type="number" id="pd-qty" value="1" min="1" max="99" aria-label="' + VV.t('quantity') + '"><button type="button" data-pq="1" aria-label="+">' + I('plus', 'icon--sm') + '</button></div>' +
            '<button class="btn btn--accent btn--lg" type="button" id="pd-add" data-magnetic>' + I('cart', 'icon--sm') + ' ' + VV.t('add_to_cart') + '</button>' +
            '<button class="btn btn--ghost btn--lg" type="button" id="pd-buy">' + VV.t('buy_now') + '</button>' +
            '<button class="btn btn--ghost btn--lg btn--icon wish-btn wish-btn--lg' + (VV.wish.has(p.id) ? ' is-on' : '') + '" type="button" data-wish="' + e(p.id) + '" aria-label="' + VV.t('wish_add') + '">' + I('heart') + '</button></div>' +
            (VV.data.settings.auth && p.cashback !== false ? '<p class="pd__cb">' + I('card', 'icon--sm') + ' ' + (VV.lang === 'ka' ? 'ამ ყიდვაზე VIVACHE-ს ქეშბექ ბარათზე ბალანსი დაგერიცხება' : 'This purchase earns cashback on your VIVACHE card') + ' · <a href="/account">' + VV.t('account') + '</a></p>' : '')
            : '<div class="pd__buy" data-anim="intro"><a class="btn btn--accent btn--lg" href="/contact">' + I('phone', 'icon--sm') + ' ' + VV.t('contact') + '</a></div>') +
          '<ul class="pd__perks" data-anim="intro"><li>' + I('truck', 'icon--sm') + VV.t('del_1') + '</li><li>' + I('gift', 'icon--sm') + VV.t('f2_t') + '</li><li>' + I('refresh', 'icon--sm') + VV.t('f4_t') + '</li></ul>' +
          '<div class="pd__tabs" data-anim="intro"><div class="tabs" role="tablist"><button type="button" class="tab is-on" data-pt="desc">' + VV.t('description') + '</button>' + (VV.tr(p.details) ? '<button type="button" class="tab" data-pt="det">' + VV.t('details') + '</button>' : '') + '<button type="button" class="tab" data-pt="del">' + VV.t('delivery_info') + '</button></div>' +
            '<div class="rich" data-pane="desc">' + (VV.tr(p.description) || '') + '</div>' +
            '<div class="rich" data-pane="det" hidden>' + (VV.tr(p.details) || '') + '</div>' +
            '<div class="rich" data-pane="del" hidden><ul><li>' + VV.t('del_1') + '</li><li>' + VV.t('del_2') + '</li><li>' + VV.t('del_3') + '</li></ul><p><a class="link-arrow" href="/delivery">' + VV.t('delivery') + ' ' + I('arrow-right', 'icon--sm') + '</a></p></div></div>' +
          '<button type="button" class="share-btn" id="pd-share">' + I('share', 'icon--sm') + ' ' + VV.t('share') + '</button>' +
        '</div></div></div></section>' +
      (related.length ? '<section class="section--tight"><div class="wrap">' + sectionHead(VV.tr(top.name), VV.t('related'), '', [VV.t('see_all'), '/shop?cat=' + top.id]) + grid(related) + '</div></section>' : ''));

    var vi = 0;
    function price() {
      var v = vs[vi], pr = v ? v.price : p.price, old = v ? v.old : (d ? p.old_price : 0);
      $('#pd-price').innerHTML = pr ? (old ? '<s>' + VV.money(old) + '</s>' : '') + '<b>' + VV.money(pr) + '</b>' + (d ? '<span class="badge badge--sale">−' + d + '%</span>' : '') : '<b class="pd__ask">' + VV.t('price_on_request') + '</b>';
    }
    price();
    var wrap = $('.pd-wrap');
    wrap.addEventListener('click', function (ev) {
      var v = ev.target.closest('[data-v]');
      if (v) { vi = +v.getAttribute('data-v'); $$('.vchip').forEach(function (x) { x.classList.toggle('is-on', x === v); }); price(); }
      var th = ev.target.closest('[data-src]');
      if (th) { $$('.pd__thumbs button').forEach(function (x) { x.classList.toggle('is-on', x === th); }); var im = $('#pd-img'); im.classList.remove('is-swap'); void im.offsetWidth; im.src = th.getAttribute('data-src'); im.classList.add('is-swap'); }
      var pq = ev.target.closest('[data-pq]');
      if (pq) { var q = $('#pd-qty'); q.value = Math.min(99, Math.max(1, (+q.value || 1) + (+pq.getAttribute('data-pq')))); }
      var t = ev.target.closest('[data-pt]');
      if (t) { $$('[data-pt]').forEach(function (x) { x.classList.toggle('is-on', x === t); }); $$('[data-pane]').forEach(function (x) { x.hidden = x.getAttribute('data-pane') !== t.getAttribute('data-pt'); }); }
    });
    var add = $('#pd-add'), buy = $('#pd-buy');
    var label = function () { return vs[vi] ? vs[vi].label : ''; };
    if (add) add.addEventListener('click', function () { VV.addToCart(p.id, label(), +$('#pd-qty').value || 1, add); });
    if (buy) buy.addEventListener('click', function () { VV.cart.add(p.id, label(), +$('#pd-qty').value || 1); location.href = '/checkout'; });
    $('#pd-share').addEventListener('click', function () {
      if (navigator.share) navigator.share({ title: name, url: location.href }).catch(function () {});
      else navigator.clipboard.writeText(location.href).then(function () { VV.toast(VV.t('copied')); });
    });
  };

  /* ============================== NEWS ============================== */
  P.news = function () {
    VV.setTitle(VV.t('news'));
    var list = VV.data.news;
    main(pageHero(VV.t('news_eyebrow'), VV.t('news_title'), '', '#8B5CF6', crumbs([[VV.t('news'), '']])) +
      '<section class="section--tight"><div class="wrap"><div class="n-grid n-grid--all">' + list.map(function (n, i) { return newsCard(n, i === 0); }).join('') + '</div></div></section>');
  };
  P.article = function () {
    var id = decodeURIComponent(location.pathname.split('/post/')[1] || VV.qs('id') || '').replace(/\/$/, '');
    var n = VV.data.news.find(function (x) { return x.id === id; });
    if (!n) return P.notfound();
    VV.setTitle(VV.tr(n.title));
    var other = VV.data.news.filter(function (x) { return x.id !== n.id; }).slice(0, 3);
    main('<article class="article" style="--t:' + (n.color || '#2F6BFF') + '"><div class="wrap wrap--narrow">' + crumbs([[VV.t('news'), '/news'], [VV.tr(n.title), '']]) +
      '<time class="eyebrow" data-anim="intro">' + VV.date(n.date) + '</time><h1 class="h-1" data-split="words">' + e(VV.tr(n.title)) + '</h1>' + (VV.tr(n.excerpt) ? '<p class="lead" data-anim="intro">' + e(VV.tr(n.excerpt)) + '</p>' : '') + '</div>' +
      (n.image ? '<div class="wrap"><div class="article__media" data-anim="reveal"><img src="' + e(n.image) + '" alt=""></div></div>' : '') +
      '<div class="wrap wrap--narrow"><div class="rich rich--lg" data-anim="reveal">' + VV.tr(n.text) + '</div></div></article>' +
      (other.length ? '<section class="section--tight"><div class="wrap">' + sectionHead(VV.t('news_eyebrow'), VV.t('news_title'), '', [VV.t('see_all'), '/news']) + '<div class="n-grid">' + other.map(function (x) { return newsCard(x); }).join('') + '</div></div></section>' : ''));
  };

  /* ============================== CONTENT PAGES ============================== */
  P.page = function () {
    var key = document.body.getAttribute('data-key') || 'about', pg = (VV.data.pages || {})[key];
    if (!pg) return P.notfound();
    VV.setTitle(VV.tr(pg.title));
    var st = stats();
    main(pageHero(VV.data.settings.site.name || 'Vivace', VV.tr(pg.title), VV.tr(pg.lead), key === 'about' ? '#FF3D7F' : '#2F6BFF', crumbs([[VV.tr(pg.title), '']])) +
      '<section class="section--tight"><div class="wrap page-body' + (pg.image ? ' page-body--img' : '') + '"><div class="rich rich--lg" data-anim="reveal">' + VV.tr(pg.text) + '</div>' +
      (pg.image ? '<div class="page-body__img" data-anim="reveal" data-tilt><img src="' + e(pg.image) + '" alt=""></div>' : '') + '</div></section>' +
      (key === 'about' ? '<section class="section--tight"><div class="wrap"><div class="numbers">' +
        [[st.products, VV.t('items'), '#FF3D7F'], [st.brands, VV.t('brands'), '#2F6BFF'], [st.years, VV.t('years'), '#FFB020'], [st.stores, VV.t('stores'), '#22C55E']].filter(function (x) { return x[0]; })
          .map(function (x) { return '<div class="number" style="--t:' + x[2] + '" data-anim="item"><strong data-count="' + x[0] + '">' + x[0] + '</strong><span>' + x[1] + '</span></div>'; }).join('') +
        '</div></div></section>' + featuresHtml() : ''));
  };

  P.contact = function () {
    var c = VV.data.settings.contact || {}, mp = VV.map();
    VV.setTitle(VV.t('contact'));
    var hero = document.getElementById('contact-hero');
    hero.outerHTML = pageHero(VV.t('contact'), VV.t('ct_title'), VV.t('ct_lead'), '#14B8A6', crumbs([[VV.t('contact'), '']]));
    var wa = c.whatsapp ? 'https://wa.me/' + String(c.whatsapp).replace(/\D/g, '') : '';
    var cards = [
      ['pin', VV.t('address'), VV.tr(c.address), mp.link, '#FF3D7F'],
      ['phone', VV.t('phone'), c.phone, c.phone ? 'tel:' + c.phone.replace(/\s/g, '') : '', '#2F6BFF'],
      ['whatsapp', 'WhatsApp', c.whatsapp ? '+' + String(c.whatsapp).replace(/\D/g, '') : '', wa, '#22C55E'],
      ['mail', VV.t('email'), c.email, c.email ? 'mailto:' + c.email : '', '#8B5CF6'],
      ['clock', VV.t('hours'), VV.tr(c.hours), '', '#FFB020'],
    ].filter(function (x) { return x[2]; });
    $('#contact-info').innerHTML = cards.map(function (x) {
      var v = x[3] ? '<a href="' + e(x[3]) + '"' + (/^http/.test(x[3]) ? ' target="_blank" rel="noopener"' : '') + '>' + e(x[2]) + '</a>' : '<span>' + e(x[2]) + '</span>';
      return '<div class="c-card" style="--t:' + x[4] + '" data-anim="item"><span class="c-card__icon">' + I(x[0]) + '</span><div><small>' + x[1] + '</small>' + v + '</div></div>';
    }).join('') +
      '<div class="c-map" data-anim="reveal"><iframe src="' + e(mp.embed) + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Google Maps" allowfullscreen></iframe>' +
      '<div class="c-map__pin" aria-hidden="true"><span></span></div>' +
      '<div class="c-map__bar"><span>' + I('pin', 'icon--sm') + ' ' + e(VV.tr(c.address)) + '</span><div><a class="btn btn--accent btn--sm" href="' + e(mp.link) + '" target="_blank" rel="noopener">' + I('pin', 'icon--sm') + ' ' + VV.t('open_map') + '</a>' +
      '<a class="btn btn--light btn--sm" href="' + e(mp.route) + '" target="_blank" rel="noopener">' + I('arrow-up-right', 'icon--sm') + ' ' + VV.t('directions') + '</a></div></div></div>';
    $$('[data-i18n]').forEach(function (el) { el.textContent = VV.t(el.getAttribute('data-i18n')); });
    var f = $('#contact-form');
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var btn = f.querySelector('button[type=submit]'); btn.disabled = true;
      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(new FormData(f)).toString() })
        .then(function (r) { if (!r.ok) throw new Error(r.status); f.reset(); VV.toast(VV.t('ct_sent')); var r2 = btn.getBoundingClientRect(); VV.confetti(r2.left + r2.width / 2, r2.top); })
        .catch(function () { VV.toast(VV.t('error'), true); })
        .finally(function () { btn.disabled = false; });
    });
  };

  /* ============================== WISHLIST ============================== */
  P.wishlist = function () {
    VV.setTitle(VV.t('wishlist'));
    function draw() {
      var list = VV.wish.ids().map(VV.product).filter(Boolean);
      main(pageHero(VV.t('wishlist'), VV.t('wishlist'), '', '#FF3D7F', crumbs([[VV.t('wishlist'), '']])) +
        '<section class="section--tight"><div class="wrap">' + (list.length ? grid(list) :
        '<div class="empty-state">' + I('heart', 'icon--lg') + '<h3>' + VV.t('wish_empty') + '</h3><p>' + VV.t('wish_empty_t') + '</p><a class="btn btn--accent" href="/shop">' + VV.t('products') + '</a></div>') + '</div></section>');
      $$('.p-card').forEach(function (c) { c.style.opacity = 1; c.style.visibility = 'visible'; });
    }
    draw();
    document.addEventListener('click', function (ev) { if (ev.target.closest('[data-wish]')) setTimeout(draw, 50); });
  };

  /* ============================== CHECKOUT ============================== */
  P.checkout = function () {
    VV.setTitle(VV.t('co_title'));
    var S = VV.data.settings, shop = S.shop || {}, libra = !!S.auth, me = null;
    var head = pageHero(VV.t('cart'), VV.t('co_title'), '', '#FFB020', crumbs([[VV.t('co_title'), '']]));
    var ka = VV.lang === 'ka';

    function render() {
      var lines = VV.cart.lines();
      if (!lines.length) {
        main(head + '<section class="section--tight"><div class="wrap"><div class="empty-state">' + I('cart', 'icon--lg') + '<h3>' + VV.t('cart_empty') + '</h3><p>' + VV.t('cart_empty_t') + '</p><a class="btn btn--accent" href="/shop">' + VV.t('products') + '</a></div></div></section>');
        return;
      }
      var guestOk = !libra || shop.guest_orders || me;
      var pays = [['cash', shop.pay_cash], ['transfer', shop.pay_transfer], ['card', shop.pay_card]].filter(function (x) { return x[1]; });
      if (!pays.length) pays = [['cash', true]];
      var who = libra ? (me ? '<div class="co-me"><span class="co-me__av">' + e(String(me.full_name || me.username || 'V').slice(0, 1)) + '</span><div><b>' + e(me.full_name || me.username || '') + '</b><small>' + (me.card_code ? VV.t('cb_card') + ' · ' + e(me.card_code) : VV.t('account')) + '</small></div><a class="btn btn--ghost btn--sm" href="/account">' + VV.t('account') + '</a></div>'
        : '<div class="co-login"><div><b>' + (shop.guest_orders ? VV.t('co_guest') : VV.t('co_login_needed')) + '</b><small>' + VV.t('co_or_login') + '</small></div><a class="btn btn--accent btn--sm" href="/account?next=/checkout">' + I('user', 'icon--sm') + ' ' + VV.t('sign_in') + '</a></div>') : '';
      var cbBox = libra && me && (me.available_tetri || 0) > 0 ? '<div class="co-card co-card--cb" data-anim="reveal"><label class="switch"><input type="checkbox" id="use-cb"><span></span><b>' + VV.t('cb_use') + '</b></label>' +
        '<p class="co-cb__info">' + VV.t('cb_available') + ': <b>' + VV.money(me.available_tetri / 100) + '</b> · ' + VV.t('cb_max') + ' ' + (me.max_redeem_pct || 100) + '%</p></div>' : '';

      main(head + '<section class="section--tight"><div class="wrap co">' +
        '<form class="co__form" id="co-form" novalidate>' + who +
          (guestOk ? '' : '<div class="co-card co-card--lock">' + I('user', 'icon--lg') + '<h3>' + VV.t('co_login_needed') + '</h3><a class="btn btn--accent" href="/account?next=/checkout">' + VV.t('sign_in') + '</a></div>') +
          '<div class="co-card" data-anim="reveal"' + (guestOk ? '' : ' hidden') + '><h3><span>1</span>' + VV.t('co_contact') + '</h3><div class="row2">' +
            '<label class="field"><span>' + VV.t('co_name') + ' *</span><input name="name" required autocomplete="name" value="' + e(me && me.full_name || '') + '"></label>' +
            '<label class="field"><span>' + VV.t('co_phone') + ' *</span><input name="phone" type="tel" required autocomplete="tel" placeholder="5XX XX XX XX" value="' + e(me && me.phone ? me.phone.replace('+995', '') : '') + '"></label></div>' +
            (me ? '' : '<label class="field"><span>' + VV.t('co_email') + '</span><input name="email" type="email" autocomplete="email"></label>') +
            '<input type="text" name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true"></div>' +
          '<div class="co-card" data-anim="reveal"' + (guestOk ? '' : ' hidden') + '><h3><span>2</span>' + VV.t('co_delivery') + '</h3><div class="opts">' +
            (shop.courier !== false ? '<label class="opt"><input type="radio" name="delivery" value="courier" checked><span>' + I('truck') + '<b>' + VV.t('co_courier') + '</b><small>' + (shop.delivery_fee ? VV.money(shop.delivery_fee) : VV.t('co_free')) + (shop.free_from ? ' · ' + (ka ? 'უფასო ' + VV.money(shop.free_from) + '-დან' : 'free from ' + VV.money(shop.free_from)) : '') + '</small></span></label>' : '') +
            (shop.pickup ? '<label class="opt"><input type="radio" name="delivery" value="pickup"' + (shop.courier === false ? ' checked' : '') + '><span>' + I('pin') + '<b>' + VV.t('co_pickup') + '</b><small>' + e(VV.tr((S.contact || {}).address)) + '</small></span></label>' : '') +
            '</div><div class="co-addr"><div class="row2"><label class="field"><span>' + VV.t('co_city') + '</span><input name="city" value="' + (ka ? 'ბათუმი' : 'Batumi') + '" autocomplete="address-level2"></label>' +
            '<label class="field"><span>' + VV.t('co_address') + ' *</span><input name="address" autocomplete="street-address"></label></div></div>' +
            (shop.delivery_note ? '<p class="note">' + e(shop.delivery_note) + '</p>' : '') +
            '<label class="field"><span>' + VV.t('co_note') + '</span><textarea name="note" rows="3"></textarea></label></div>' +
          '<div class="co-card" data-anim="reveal"' + (guestOk ? '' : ' hidden') + '><h3><span>3</span>' + VV.t('co_payment') + '</h3><div class="opts">' + pays.map(function (x, i) {
            return '<label class="opt"><input type="radio" name="payment" value="' + x[0] + '"' + (i ? '' : ' checked') + '><span>' + I(x[0] === 'transfer' ? 'refresh' : x[0] === 'card' ? 'card' : 'check') + '<b>' + VV.t('pay_' + x[0]) + '</b></span></label>';
          }).join('') + '</div>' + (shop.bank_details ? '<div class="note iban" id="bank-note" hidden><b>' + VV.t('co_iban') + '</b><span>' + e(shop.bank_details) + '</span>' + (shop.iban ? '<button type="button" class="btn btn--ghost btn--sm" data-copy="' + e(shop.iban) + '">' + I('copy', 'icon--sm') + ' IBAN</button>' : '') + '</div>' : '') + '</div>' +
          cbBox +
        '</form>' +
        '<aside class="co__sum" data-anim="reveal"><div class="co-card co-card--sum"><h3>' + VV.t('co_summary') + '</h3><div id="co-lines"></div><div id="co-totals"></div>' +
          '<button class="btn btn--accent btn--wide btn--lg" type="submit" form="co-form" id="co-submit"' + (guestOk ? '' : ' disabled') + '>' + VV.t('co_submit') + ' ' + I('arrow-right', 'icon--sm') + '</button>' +
          '<p class="co__terms">' + VV.t('co_terms') + ' <a href="/delivery">' + VV.t('delivery') + '</a></p>' + (libra && !me ? '<p class="co__terms">' + VV.t('cb_note') + '</p>' : '') + '<p class="co__err" id="co-err" role="alert"></p></div></aside>' +
      '</div></section>');
      totals();
      var form = $('#co-form');
      form.addEventListener('change', totals);
      form.addEventListener('submit', submit);
      form.addEventListener('click', function (ev) {
        var cp = ev.target.closest('[data-copy]'); if (cp) navigator.clipboard.writeText(cp.getAttribute('data-copy')).then(function () { VV.toast(VV.t('copied_iban')); });
      });
      $$('[data-anim]', document.getElementById('main')).forEach(function (x) { x.style.visibility = 'visible'; });
    }
    function calc() {
      var sub = VV.cart.subtotal();
      var del = ($('input[name=delivery]:checked') || {}).value || 'courier';
      var fee = del === 'pickup' || (shop.free_from && sub >= shop.free_from) ? 0 : (+shop.delivery_fee || 0);
      var cb = 0, use = $('#use-cb');
      if (use && use.checked && me) cb = Math.min(me.available_tetri / 100, Math.floor(sub * (me.max_redeem_pct || 100)) / 100, sub);
      return { sub: sub, fee: fee, cb: Math.round(cb * 100) / 100, del: del };
    }
    function totals() {
      var lines = VV.cart.lines(), c = calc();
      $('.co-addr').hidden = c.del === 'pickup';
      var bn = $('#bank-note'); if (bn) bn.hidden = (($('input[name=payment]:checked') || {}).value !== 'transfer');
      $('#co-lines').innerHTML = lines.map(function (l) {
        return '<div class="co-line"><img src="' + e(VV.img(l.p)) + '" alt=""><span><b>' + e(VV.tr(l.p.name)) + '</b><small>' + (l.variant ? e(l.variant) + ' · ' : '') + l.qty + ' × ' + VV.money(l.price) + '</small></span><em>' + VV.money(l.total) + '</em></div>';
      }).join('');
      $('#co-totals').innerHTML = '<dl class="co-tot"><dt>' + VV.t('subtotal') + '</dt><dd>' + VV.money(c.sub) + '</dd><dt>' + VV.t('co_delivery_fee') + '</dt><dd>' + (c.fee ? VV.money(c.fee) : '<b class="ok">' + VV.t('co_free') + '</b>') + '</dd>' +
        (c.cb ? '<dt>' + VV.t('co_cashback') + '</dt><dd class="ok">−' + VV.money(c.cb) + '</dd>' : '') +
        '<dt class="big">' + VV.t('co_total') + '</dt><dd class="big">' + VV.money(c.sub + c.fee - c.cb) + '</dd></dl>' +
        (shop.min_order && c.sub < shop.min_order ? '<p class="co__err">' + VV.t('co_min') + ': ' + VV.money(shop.min_order) + '</p>' : '');
    }
    function submit(ev) {
      ev.preventDefault();
      var f = ev.target, fd = new FormData(f), err = $('#co-err'), btn = $('#co-submit'), c = calc();
      err.textContent = '';
      var bad = ['name', 'phone'].concat(c.del === 'pickup' ? [] : ['address']).filter(function (k) { return !String(fd.get(k) || '').trim(); });
      $$('.field input', f).forEach(function (i) { i.classList.toggle('is-bad', bad.indexOf(i.name) > -1); });
      if (bad.length) { err.textContent = '* ' + VV.t('co_contact'); f.querySelector('.is-bad').focus(); return; }
      btn.disabled = true; btn.textContent = VV.t('co_sending');
      fetch('/api/orders', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          lang: VV.lang, website: fd.get('website'), delivery: fd.get('delivery'), payment: fd.get('payment'), token: VV.acc.token(), use_cashback: c.cb,
          customer: { name: fd.get('name'), phone: fd.get('phone'), email: fd.get('email'), city: fd.get('city'), address: fd.get('address'), note: fd.get('note') },
          items: VV.cart.items().map(function (it) { var p = VV.product(it.id); return Object.assign({ name: p ? VV.tr(p.name) : '' }, it); }),
        }),
      }).then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || r.status); return j; }); })
        .then(function (j) {
          VV.cart.clear(); sessionStorage.removeItem('vv_me');
          var transfer = j.payment === 'transfer' && shop.bank_details;
          main(head.split(VV.t('co_title')).join(VV.t('co_ok')) + '<section class="section--tight"><div class="wrap"><div class="success" id="success">' +
            '<div class="success__icon">' + I('check', 'icon--lg') + '</div><h2 class="h-2">' + VV.t('co_ok') + '</h2><p class="lead">' + VV.t('co_ok_t') + ': <b>' + e(j.number) + '</b> · ' + VV.money(j.total) + (j.cashback ? ' <small>(' + VV.t('co_cashback') + ' −' + VV.money(j.cashback) + ')</small>' : '') + '</p><p>' + VV.t('co_ok_call') + '</p>' +
            (transfer ? '<div class="note iban"><b>' + VV.t('co_iban') + '</b><span>' + e(shop.bank_details) + '</span><span>' + (ka ? 'დანიშნულება: ' : 'Reference: ') + e(j.number) + '</span></div>' : '') +
            (transfer && me && j.id ? '<form class="proof" id="proof"><label class="ad-drop proof__drop"><input type="file" accept="image/jpeg,image/png,image/webp,application/pdf">' + I('upload') + '<span><b>' + VV.t('co_proof') + '</b><small>' + VV.t('co_proof_t') + '</small></span></label><p class="proof__msg" id="proof-msg"></p></form>' : '') +
            '<div class="hero__actions" style="justify-content:center"><a class="btn btn--accent" href="/">' + VV.t('co_back') + '</a>' + (me ? '<a class="btn btn--ghost" href="/account?tab=orders">' + VV.t('co_my_orders') + '</a>' : '') + '</div></div></div></section>');
          window.scrollTo(0, 0);
          var pf = $('#proof');
          if (pf) pf.addEventListener('change', function (e2) { VV.uploadProof(j.id, e2.target.files[0], $('#proof-msg')); });
          setTimeout(function () { var r = $('#success').getBoundingClientRect(); for (var k = 0; k < 3; k++) setTimeout(function () { VV.confetti(r.left + Math.random() * r.width, r.top + 60, 30); }, k * 250); }, 200);
        })
        .catch(function (x) { err.textContent = x.message || VV.t('error'); btn.disabled = false; btn.innerHTML = VV.t('co_submit') + ' ' + I('arrow-right', 'icon--sm'); });
    }
    if (libra && VV.acc.token()) VV.acc.me(true).then(function (m) { me = m; render(); }); else render();
    window.addEventListener('storage', render);
  };

  /* transfer receipt → Supabase (vv_upload_proof) → LIBRA downloads it */
  VV.uploadProof = function (orderId, file, msg) {
    if (!file) return;
    if (file.size > 2.5 * 1024 * 1024) { msg.textContent = 'მაქს. 2.5 MB'; return; }
    msg.textContent = VV.t('co_sending');
    var rd = new FileReader();
    rd.onload = function () {
      VV.acc.call('proof', { order: orderId, data: String(rd.result).split(',')[1], mime: file.type })
        .then(function () { msg.innerHTML = I('check', 'icon--sm') + ' ' + VV.t('co_proof_ok'); msg.classList.add('is-ok'); })
        .catch(function (x) { msg.textContent = x.message; });
    };
    rd.readAsDataURL(file);
  };

  /* ============================== 404 ============================== */
  P.notfound = function () {
    VV.setTitle(VV.t('not_found'));
    main('<section class="section"><div class="wrap empty-state empty-state--big"><div class="big404" aria-hidden="true">' + '404'.split('').map(function (ch, i) { return '<i style="--c:' + COLORS[i] + ';--i:' + i + '">' + ch + '</i>'; }).join('') + '</div>' +
      '<h1 class="h-2">' + VV.t('not_found') + '</h1><p class="lead">' + VV.t('not_found_t') + '</p><div class="hero__actions"><a class="btn btn--accent" href="/">' + VV.t('home') + '</a><a class="btn btn--ghost" href="/shop">' + VV.t('all_products') + '</a></div></div></section>');
  };
})();
