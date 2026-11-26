/* ==========================================================================
   Vivace — storefront core
   data (/api/catalog) → shell (promo bar, header, drawers, footer) → page renderer (pages.js) → motion
   ========================================================================== */
(function () {
  'use strict';
  var VV = (window.VV = window.VV || {});
  var root = document.documentElement;

  /* ---------------- language & text ---------------- */
  VV.lang = localStorage.getItem('vv_lang') === 'en' ? 'en' : 'ka';
  root.lang = VV.lang;
  VV.t = function (k, rep) {
    var s = (window.VV_I18N[VV.lang] || {})[k] || window.VV_I18N.ka[k] || k;
    if (rep) Object.keys(rep).forEach(function (r) { s = s.replace(':' + r, rep[r]); });
    return s;
  };
  VV.tr = function (o) {
    if (!o) return '';
    if (typeof o === 'string') return o;
    return o[VV.lang] || o.ka || o.en || '';
  };
  VV.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  };
  VV.money = function (n) { return (Math.round((+n || 0) * 100) / 100).toFixed(2) + ' ₾'; };
  VV.qs = function (k) { return new URLSearchParams(location.search).get(k); };
  VV.date = function (d) {
    try { return new Date(d).toLocaleDateString(VV.lang === 'ka' ? 'ka-GE' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return d; }
  };

  /* ---------------- icons ---------------- */
  var P = {
    menu: 'M4 7h16M4 12h16M4 17h16', close: 'M6 6l12 12M18 6 6 18', search: 'M20 20l-4.2-4.2M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z',
    cart: 'M6 8h12l-1 12H7L6 8zM9 8V6a3 3 0 0 1 6 0v2', globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18',
    'arrow-right': 'M5 12h14M13 6l6 6-6 6', 'arrow-left': 'M19 12H5M11 6l-6 6 6 6', 'arrow-up-right': 'M7 17 17 7M8 7h9v9',
    'chevron-down': 'M6 9l6 6 6-6', 'chevron-right': 'M9 6l6 6-6 6', plus: 'M12 5v14M5 12h14', minus: 'M5 12h14',
    trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13', check: 'M5 12l5 5 9-10', truck: 'M3 6h11v10H3zM14 10h4l3 3v3h-7M7.5 19.5a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6zM17.5 19.5a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6z',
    gift: 'M4 11h16v9H4zM3 7h18v4H3zM12 7v13M12 7C10 3 6 4 7.5 7M12 7c2-4 6-3 4.5 0', shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4',
    refresh: 'M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6', phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2',
    mail: 'M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM3 7l9 6 9-6', pin: 'M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12zM12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
    clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2', facebook: 'M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z',
    instagram: 'M8 3h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM17.5 6.5h.01',
    tiktok: 'M14 3v11a4 4 0 1 1-4-4M14 3c0 3 2 5 5 5', star: 'M12 3l2.8 5.8 6.2.9-4.5 4.4 1 6.2-5.5-3-5.5 3 1-6.2L3 9.7l6.2-.9z',
    spark: 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6',
    share: 'M6 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18 8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18 20.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM8.2 10.9l7.6-3.8M8.2 13.1l7.6 3.8',
    filter: 'M4 6h16M7 12h10M10 18h4', heart: 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z',
    user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0', card: 'M3 6h18v12H3zM3 10h18M7 15h4',
    eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', logout: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10',
    whatsapp: 'M4 20l1.3-4.2A8 8 0 1 1 8.4 19zM9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 1a5 5 0 0 1-2.4-2.4l1-1-1-2z', music: 'M9 18V6l11-2v12M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
    upload: 'M12 20V8M7 13l5-5 5 5M4 4h16', copy: 'M9 9h11v11H9zM5 15H4V4h11v1', file: 'M6 3h8l4 4v14H6zM14 3v4h4M9 13h6M9 17h6',
  };
  VV.icon = function (n, cls) {
    return '<svg class="icon ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true"><path d="' + (P[n] || '') + '"/></svg>';
  };

  /* ---------------- catalogue helpers ---------------- */
  VV.data = null;
  // id ან ლათინური მისამართი (slug): /shop?cat=autleti — ძველი ბმულებიც (id-ით) მუშაობს
  VV.cat = function (id) {
    if (!id) return null;
    var list = VV.data.categories || [];
    return list.find(function (c) { return c.id === id; }) || list.find(function (c) { return c.slug === id; })
      || list.find(function (c) { return (c.merged || []).indexOf(id) > -1; }) || null;
  };
  VV.catUrl = function (c) { c = typeof c === 'string' ? VV.cat(c) : c; return c ? '/shop?cat=' + encodeURIComponent(c.slug || c.id) : '/shop'; };
  VV.topCats = function () {
    return VV.data.categories.filter(function (c) { return !c.parent; }).sort(function (a, b) { return (a.sort || 0) - (b.sort || 0); });
  };
  VV.children = function (id) {
    return VV.data.categories.filter(function (c) { return c.parent === id; }).sort(function (a, b) { return (a.sort || 0) - (b.sort || 0); });
  };
  VV.descendants = function (id) {
    var cc = VV.cat(id); if (cc) id = cc.id;
    var out = [id];
    VV.children(id).forEach(function (c) { out = out.concat(VV.descendants(c.id)); });
    return out;
  };
  VV.topOf = function (id) {
    var c = VV.cat(id), guard = 0;
    while (c && c.parent && guard++ < 10) c = VV.cat(c.parent);
    return c;
  };
  VV.catColor = function (id) {
    var c = VV.cat(id);
    if (c && c.color) return c.color;
    var top = VV.topOf(id);
    return (top && top.color) || '#FF3D7F';
  };
  VV.inCat = function (p, catId) {
    var ds = VV.descendants(catId);
    return ds.indexOf(p.category_id) > -1 || (p.cats || []).some(function (x) { return ds.indexOf(x) > -1; });
  };
  // variant lines hold REGULAR prices; a product discount (old_price → price) applies to every variant
  VV.variants = function (p) {
    var ratio = p.old_price && p.price && p.old_price > p.price ? p.price / p.old_price : 1;
    return String(p.variants || '').split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean).map(function (l) {
      var parts = l.split('|'); var price = parseFloat(String(parts[1] || '').replace(',', '.'));
      if (!isFinite(price)) return { label: parts[0].trim(), price: p.price, old: ratio < 1 ? p.old_price : 0 };
      return { label: parts[0].trim(), price: Math.round(price * ratio * 100) / 100, old: ratio < 1 ? price : 0 };
    });
  };
  VV.disc = function (p) { return p.old_price && p.price && p.old_price > p.price ? Math.round((1 - p.price / p.old_price) * 100) : 0; };
  VV.minPrice = function (p) {
    var vs = VV.variants(p);
    if (!vs.length) return p.price;
    return Math.min.apply(null, vs.map(function (v) { return v.price || Infinity; }));
  };
  VV.productUrl = function (p) { return '/product/' + encodeURIComponent(p.id); };
  VV.product = function (id) { return VV.data.products.find(function (p) { return p.id === id; }); };
  VV.img = function (p) { return (p.images || [])[0] || ''; };
  VV.inStock = function (p) { return p.stock == null || p.stock > 0; };

  /* product card (same anatomy as the akzonobel p-card) */
  VV.card = function (p, isTop) {
    if (isTop !== true) isTop = (VV.data.top || []).slice(0, 12).indexOf(p.id) > -1;
    var name = VV.esc(VV.tr(p.name)), d = VV.disc(p), vs = VV.variants(p), color = VV.catColor(p.category_id);
    var price = p.price ? (vs.length > 1 ? '<small>' + VV.t('from') + '</small> ' + VV.money(VV.minPrice(p)) : VV.money(p.price)) : '';
    var badges = (isTop ? '<span class="badge badge--top">★ ' + VV.t('top_badge') + '</span>' : '') + (d ? '<span class="badge badge--sale">−' + d + '%</span>' : '') + (p.isNew ? '<span class="badge badge--new">' + VV.t('new') + '</span>' : '') + (p.age ? '<span class="badge badge--age">' + VV.esc(p.age) + '</span>' : '');
    var quick = p.price && vs.length < 2 && VV.inStock(p);
    var w = VV.wish.has(p.id);
    return '<article class="p-card' + (VV.inStock(p) ? '' : ' is-out') + '" style="--t:' + color + '" data-anim="item">' +
      '<button type="button" class="wish-btn' + (w ? ' is-on' : '') + '" data-wish="' + VV.esc(p.id) + '" aria-pressed="' + w + '" aria-label="' + VV.t('wish_add') + '">' + VV.icon('heart') + '</button>' +
      '<div class="p-card__media">' +
        (VV.img(p) ? '<img src="' + VV.esc(VV.img(p)) + '" alt="' + name + '" loading="lazy" decoding="async">' : '<span class="ph">' + VV.icon('gift', 'icon--lg') + '<small>' + VV.t('no_photo') + '</small></span>') +
        '<span class="p-card__badges">' + badges + '</span></div>' +
      '<div class="p-card__body">' +
        (p.brand ? '<span class="p-card__brand">' + VV.esc(p.brand) + '</span>' : (VV.cat(p.category_id) ? '<span class="p-card__brand">' + VV.esc(VV.tr(VV.cat(p.category_id).name)) + '</span>' : '')) +
        '<h3 class="p-card__title"><a class="p-card__link" href="' + VV.productUrl(p) + '">' + name + '</a></h3>' +
        '<div class="p-card__foot">' +
          (p.price ? '<span class="p-card__price">' + (d ? '<s>' + VV.money(p.old_price) + '</s>' : '') + price + '</span>' : '<span class="status status--ask">' + VV.t('price_on_request') + '</span>') +
          (quick ? '<button type="button" class="p-card__add" data-add="' + VV.esc(p.id) + '" aria-label="' + VV.t('add_to_cart') + ': ' + name + '">' + VV.icon('plus') + '</button>'
                 : '<span class="p-card__go" aria-hidden="true">' + VV.icon('arrow-up-right', 'icon--sm') + '</span>') +
        '</div></div></article>';
  };

  /* ---------------- Google Maps pin (contact page, footer) ---------------- */
  VV.map = function () {
    var c = (VV.data.settings.contact || {}), q = (c.map_coords || '').trim() || c.map_query || VV.tr(c.address);
    return {
      link: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q),
      route: 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(q),
      embed: 'https://maps.google.com/maps?q=' + encodeURIComponent(q) + '&z=17&hl=' + (VV.lang === 'ka' ? 'ka' : 'en') + '&output=embed',
    };
  };

  /* ---------------- wishlist (localStorage, like akzonobelgeo /wishlist) ---------------- */
  VV.wish = {
    ids: function () { try { var v = JSON.parse(localStorage.getItem('vv_wish')); return Array.isArray(v) ? v.filter(function (x) { return typeof x === 'string'; }) : []; } catch (e) { return []; } },
    has: function (id) { return VV.wish.ids().indexOf(id) > -1; },
    toggle: function (id) {
      var ids = VV.wish.ids(), i = ids.indexOf(id), on = i < 0;
      if (on) ids.unshift(id); else ids.splice(i, 1);
      localStorage.setItem('vv_wish', JSON.stringify(ids.slice(0, 200)));
      VV.wish.render(); return on;
    },
    render: function () {
      var n = VV.data ? VV.wish.ids().filter(function (id) { return VV.product(id); }).length : 0;
      document.querySelectorAll('.wish-badge').forEach(function (b) { b.textContent = n || ''; b.setAttribute('data-count', n); });
    },
  };

  /* ---------------- customer session (Supabase via /api/account) ---------------- */
  VV.acc = {
    token: function () { return localStorage.getItem('vv_token') || ''; },
    set: function (t) { if (t) localStorage.setItem('vv_token', t); else { localStorage.removeItem('vv_token'); sessionStorage.removeItem('vv_me'); } },
    call: function (action, data) {
      return fetch('/api/account/' + action, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(Object.assign({ token: VV.acc.token() }, data || {})) })
        .then(function (r) { return r.json().then(function (j) { if (!r.ok) { var e = new Error(j.error || 'HTTP ' + r.status); e.status = r.status; throw e; } return j; }); });
    },
    me: function (fresh) {
      if (!VV.acc.token()) return Promise.resolve(null);
      var c = sessionStorage.getItem('vv_me');
      if (c && !fresh) { try { return Promise.resolve(JSON.parse(c)); } catch (e) { /* */ } }
      return VV.acc.call('me').then(function (me) { sessionStorage.setItem('vv_me', JSON.stringify(me)); VV.acc.badge(me); return me; })
        .catch(function (e) { if (e.status === 401) VV.acc.set(''); return null; });
    },
    badge: function (me) {
      var b = document.querySelector('.acc-btn'); if (!b) return;
      if (me) {
        var ini = String(me.full_name || me.username || 'V').trim().split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
        b.classList.add('is-in'); b.innerHTML = '<span class="acc-btn__ini">' + VV.esc(ini) + '</span>';
        b.setAttribute('aria-label', VV.t('account'));
      }
    },
  };

  /* ---------------- weather (Open-Meteo, free, no key) ---------------- */
  var WMO = [[0, '☀️', 'მზიანი', 'Sunny'], [1, '🌤️', 'უმეტესად მზიანი', 'Mostly sunny'], [2, '⛅', 'ნაწილობრივ ღრუბლიანი', 'Partly cloudy'], [3, '☁️', 'ღრუბლიანი', 'Cloudy'],
    [48, '🌫️', 'ნისლი', 'Fog'], [57, '🌦️', 'ჟინჟღილი', 'Drizzle'], [67, '🌧️', 'წვიმა', 'Rain'], [77, '🌨️', 'თოვლი', 'Snow'], [82, '🌧️', 'თავსხმა', 'Showers'], [86, '🌨️', 'თოვლიანი', 'Snow showers'], [99, '⛈️', 'ჭექა-ქუხილი', 'Thunderstorm']];
  function wmo(code) { for (var i = 0; i < WMO.length; i++) if (code <= WMO[i][0]) return WMO[i]; return WMO[WMO.length - 1]; }
  VV.weather = function () {
    var w = VV.data.settings.weather || {}, chip = document.getElementById('weather-chip');
    if (!chip || w.enabled === false) return;
    var show = function (lat, lon, city) {
      var key = 'vv_wx_' + Number(lat).toFixed(2) + Number(lon).toFixed(2), cached = null;
      try { cached = JSON.parse(sessionStorage.getItem(key)); } catch (e) { /* */ }
      var draw = function (d) {
        var cur = d.current, m = wmo(cur.weather_code);
        chip.hidden = false;
        chip.querySelector('.wx-chip__btn').innerHTML = '<span class="wx-ico">' + m[1] + '</span><b>' + Math.round(cur.temperature_2m) + '°</b><small>' + VV.esc(city || '') + '</small>';
        var days = d.daily.time.slice(0, 6).map(function (t, i) {
          var dm = wmo(d.daily.weather_code[i]), dt = new Date(t + 'T12:00');
          var name = i ? dt.toLocaleDateString(VV.lang === 'ka' ? 'ka-GE' : 'en-GB', { weekday: 'short' }) : VV.t('today');
          return '<li style="--i:' + i + '"><span>' + VV.esc(name) + '</span><i>' + dm[1] + '</i><b>' + Math.round(d.daily.temperature_2m_max[i]) + '°</b><small>' + Math.round(d.daily.temperature_2m_min[i]) + '°</small>' +
            (d.daily.precipitation_probability_max ? '<em>' + (d.daily.precipitation_probability_max[i] || 0) + '%</em>' : '') + '</li>';
        }).join('');
        chip.querySelector('.wx-pop').innerHTML = '<div class="wx-now" style="--wx:' + (cur.is_day ? '#FFB020' : '#4F46E5') + '"><span class="wx-now__ico">' + m[1] + '</span><div><b>' + Math.round(cur.temperature_2m) + '°C</b><span>' + VV.esc(m[VV.lang === 'ka' ? 2 : 3]) + '</span><small>' + VV.esc(city || '') + ' · ' + VV.t('wind') + ' ' + Math.round(cur.wind_speed_10m) + ' კმ/სთ</small></div></div>' +
          '<h4>' + VV.t('weather_5') + '</h4><ul class="wx-days">' + days + '</ul><p class="wx-src">Open-Meteo</p>';
      };
      if (cached && Date.now() - cached.t < 30 * 60 * 1000) return draw(cached.d);
      fetch('https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&current=temperature_2m,weather_code,wind_speed_10m,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=6')
        .then(function (r) { return r.json(); }).then(function (d) { if (!d.current) return; sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), d: d })); draw(d); })
        .catch(function () { /* weather is optional */ });
    };
    var fallback = function () { show(w.lat, w.lon, w.city); };
    if (w.auto === false) return fallback();
    var g = null;
    try { g = JSON.parse(sessionStorage.getItem('vv_geo')); } catch (e) { /* */ }
    var use = function (geo) { if (geo && geo.lat != null && geo.lon != null) show(geo.lat, geo.lon, geo.city || geo.country || w.city); else fallback(); };
    if (g) return use(g);
    fetch('/api/geo').then(function (r) { return r.ok ? r.json() : null; })
      .then(function (geo) { if (geo) sessionStorage.setItem('vv_geo', JSON.stringify(geo)); use(geo); })
      .catch(fallback);
  };

  /* ---------------- product card frame colour (follows the top strip, admin can override) ---------------- */
  var FRAMES = {
    rainbow: 'linear-gradient(90deg,#FF3D7F,#FFB020,#22C55E,#2F6BFF,#8B5CF6)',
    blackfriday: 'linear-gradient(90deg,#111,#FFD400,#111)', sale: 'linear-gradient(90deg,#C8102E,#FF3D7F)',
    dark: 'linear-gradient(90deg,#15171A,#4A4E55)', pink: 'linear-gradient(90deg,#FF3D7F,#8B5CF6)',
    ocean: 'linear-gradient(90deg,#2F6BFF,#14B8A6)', sun: 'linear-gradient(90deg,#FFB020,#F97316)', mint: 'linear-gradient(90deg,#22C55E,#14B8A6)',
  };
  VV.applyFrame = function () {
    var c = VV.data.settings.cards || {}, pr = VV.data.settings.promo || {}, key = c.frame || 'auto', val;
    if (key === 'auto') key = pr.enabled === false ? 'rainbow' : ({ news: 'rainbow', blackfriday: 'blackfriday', sale: 'sale', default: 'dark' }[pr.style] || 'rainbow');
    val = key === 'custom' && /^#[0-9a-f]{3,8}$/i.test(c.color || '') ? 'linear-gradient(' + c.color + ',' + c.color + ')' : (FRAMES[key] || FRAMES.rainbow);
    root.style.setProperty('--frame', val);
  };

  /* ---------------- cart (localStorage) ---------------- */
  var CART_KEY = 'vv_cart';
  VV.cart = {
    items: function () {
      var v = null; try { v = JSON.parse(localStorage.getItem(CART_KEY)); } catch (e) { /* */ }
      if (!Array.isArray(v)) { if (v != null) localStorage.removeItem(CART_KEY); return []; } // old VIVACHE app stored an object here
      return v.filter(function (x) { return x && typeof x.id === 'string' && +x.qty > 0; });
    },
    save: function (items) { localStorage.setItem(CART_KEY, JSON.stringify(items)); VV.cart.render(); },
    add: function (id, variant, qty) {
      var items = VV.cart.items(), key = id + '|' + (variant || '');
      var it = items.find(function (x) { return x.id + '|' + (x.variant || '') === key; });
      if (it) it.qty = Math.min(99, it.qty + (qty || 1)); else items.push({ id: id, variant: variant || '', qty: qty || 1 });
      VV.cart.save(items);
    },
    set: function (i, qty) { var items = VV.cart.items(); if (!items[i]) return; if (qty < 1) items.splice(i, 1); else items[i].qty = Math.min(99, qty); VV.cart.save(items); },
    clear: function () { VV.cart.save([]); },
    lines: function () {
      return VV.cart.items().map(function (it) {
        var p = VV.product(it.id); if (!p) return null;
        var price = p.price, vs = VV.variants(p);
        if (vs.length) { var v = vs.find(function (x) { return x.label === it.variant; }) || vs[0]; price = v.price; it.variant = v.label; }
        return { p: p, variant: it.variant, qty: it.qty, price: price || 0, total: (price || 0) * it.qty };
      }).filter(Boolean);
    },
    subtotal: function () { return VV.cart.lines().reduce(function (s, l) { return s + l.total; }, 0); },
    count: function () { return VV.cart.items().reduce(function (s, l) { return s + l.qty; }, 0); },
    render: function () {
      var n = VV.cart.count();
      document.querySelectorAll('.cart-badge').forEach(function (b) { b.textContent = n || ''; b.setAttribute('data-count', n); });
      var body = document.getElementById('cart-body'), foot = document.getElementById('cart-foot');
      if (!body || !VV.data) return;
      var lines = VV.cart.lines();
      if (!lines.length) {
        body.innerHTML = '<div class="cart-empty">' + VV.icon('cart') + '<p><b>' + VV.t('cart_empty') + '</b><br>' + VV.t('cart_empty_t') + '</p><a class="btn btn--ghost btn--sm" href="/shop">' + VV.t('all_products') + '</a></div>';
        foot.hidden = true; return;
      }
      body.innerHTML = lines.map(function (l, i) {
        return '<div class="cart-item">' +
          '<img class="cart-item__img" src="' + VV.esc(VV.img(l.p)) + '" alt="">' +
          '<div><a class="cart-item__name" href="' + VV.productUrl(l.p) + '">' + VV.esc(VV.tr(l.p.name)) + '</a>' +
          '<div class="cart-item__meta">' + (l.variant ? VV.esc(l.variant) + ' · ' : '') + VV.money(l.price) + '</div>' +
          '<div class="qty qty--sm"><button type="button" data-qty="' + i + '" data-d="-1" aria-label="−">' + VV.icon('minus', 'icon--sm') + '</button><span>' + l.qty + '</span><button type="button" data-qty="' + i + '" data-d="1" aria-label="+">' + VV.icon('plus', 'icon--sm') + '</button></div></div>' +
          '<div class="cart-item__end"><b>' + VV.money(l.total) + '</b><button type="button" class="cart-item__rm" data-rm="' + i + '" aria-label="' + VV.t('remove') + '">' + VV.icon('trash', 'icon--sm') + '</button></div></div>';
      }).join('');
      var sub = VV.cart.subtotal(), shop = VV.data.settings.shop || {}, free = +shop.free_from || 0;
      var pct = free ? Math.min(100, Math.round(sub / free * 100)) : 100;
      foot.hidden = false;
      foot.innerHTML = (free ? '<div class="free-bar"><span>' + (sub >= free ? VV.t('free_ok') : VV.t('left_free', { sum: VV.money(free - sub) })) + '</span><i style="--p:' + pct + '%"></i></div>' : '') +
        '<div class="cart-total"><span>' + VV.t('subtotal') + '</span><strong>' + VV.money(sub) + '</strong></div>' +
        '<a class="btn btn--accent btn--wide" href="/checkout">' + VV.t('checkout') + ' ' + VV.icon('arrow-right', 'icon--sm') + '</a>';
    },
  };

  /* ---------------- toast, confetti, fly-to-cart ---------------- */
  VV.toast = function (msg, err) {
    var t = document.getElementById('toast'); if (!t) return;
    t.querySelector('span').textContent = msg; t.classList.toggle('is-err', !!err); t.classList.add('is-on');
    clearTimeout(VV._tt); VV._tt = setTimeout(function () { t.classList.remove('is-on'); }, 2600);
  };
  var COLORS = ['#FF3D7F', '#FFB020', '#2F6BFF', '#22C55E', '#8B5CF6', '#14B8A6', '#F97316'];
  VV.confetti = function (x, y, n) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    for (var i = 0; i < (n || 22); i++) {
      var s = document.createElement('i'); s.className = 'confetti';
      s.style.background = COLORS[i % COLORS.length]; s.style.left = x + 'px'; s.style.top = y + 'px';
      if (i % 3 === 0) s.style.borderRadius = '50%';
      document.body.appendChild(s);
      var a = Math.random() * Math.PI * 2, v = 60 + Math.random() * 120;
      s.animate([
        { transform: 'translate(-50%,-50%) rotate(0)', opacity: 1 },
        { transform: 'translate(' + (Math.cos(a) * v) + 'px,' + (Math.sin(a) * v - 60) + 'px) rotate(' + (Math.random() * 720) + 'deg)', opacity: 1, offset: .7 },
        { transform: 'translate(' + (Math.cos(a) * v * 1.2) + 'px,' + (Math.sin(a) * v + 40) + 'px) rotate(' + (Math.random() * 900) + 'deg)', opacity: 0 },
      ], { duration: 900 + Math.random() * 500, easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = (function (el) { return function () { el.remove(); }; })(s);
    }
  };
  VV.fly = function (img) {
    var target = document.querySelector('.site-header [data-drawer-open="cart-drawer"]');
    if (!img || !target || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var a = img.getBoundingClientRect(), b = target.getBoundingClientRect();
    var c = img.cloneNode(); c.className = 'fly-img';
    c.style.cssText = 'left:' + a.left + 'px;top:' + a.top + 'px;width:' + a.width + 'px;height:' + a.height + 'px';
    document.body.appendChild(c);
    c.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: 'translate(' + (b.left + b.width / 2 - a.left - a.width / 2) + 'px,' + (b.top + b.height / 2 - a.top - a.height / 2) + 'px) scale(.12)', opacity: .6 },
    ], { duration: 750, easing: 'cubic-bezier(.5,-0.3,.6,1)' }).onfinish = function () {
      c.remove(); target.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { duration: 400 });
    };
  };
  VV.addToCart = function (id, variant, qty, fromEl) {
    VV.cart.add(id, variant, qty);
    var card = fromEl && fromEl.closest('.p-card, .pd, .band-prod');
    VV.fly(card && card.querySelector('img'));
    if (fromEl) { var r = fromEl.getBoundingClientRect(); VV.confetti(r.left + r.width / 2, r.top + r.height / 2); }
    VV.toast(VV.t('added'));
  };

  /* ---------------- drag-able endless marquee ---------------- */
  VV.marquee = function (lane) {
    if (lane._mq) return;
    lane._mq = true;
    var track = lane.querySelector(lane.getAttribute('data-track') || '.mq-track');
    if (!track) return;
    var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var speed = reduced ? 0 : parseFloat(lane.getAttribute('data-speed') || '-30');
    var x = 0, w = 0, last = performance.now(), hover = false, drag = null, moved = false, visible = true;
    function measure() { w = track.scrollWidth / 2; }
    measure(); window.addEventListener('resize', measure);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(lane);
    function wrap() { if (w > 0) x = ((x % w) + w) % w - w; }
    function frame(t) {
      if (!lane.isConnected) return;                                 // page changed → stop this loop
      var dt = Math.min(64, t - last) / 1000; last = t;
      if (visible) {
        if (!drag && !(hover && lane.hasAttribute('data-hover-pause'))) x += speed * dt;
        wrap(); track.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0)';
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    lane.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hover = true; });
    lane.addEventListener('pointerleave', function () { hover = false; });
    lane.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      drag = { sx: e.clientX, x0: x }; moved = false; lane.classList.add('is-drag');
    });
    window.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.sx;
      if (Math.abs(dx) > 5) { moved = true; }
      x = drag.x0 + dx; wrap();
    }, { passive: true });
    window.addEventListener('pointerup', function () { drag = null; lane.classList.remove('is-drag'); });
    lane.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    lane.addEventListener('dragstart', function (e) { e.preventDefault(); });
  };

  /* ---------------- shell: promo bar, header, drawers, footer ---------------- */
  function logo(cls) {
    var s = VV.data.settings.site || {};
    if (s.logo) return '<img class="logo-img ' + (cls || '') + '" src="' + VV.esc(s.logo) + '" alt="' + VV.esc(s.name || 'VIVACHE') + '" width="150" height="40">';
    return '<span class="logo-word ' + (cls || '') + '" aria-label="' + VV.esc(s.name || 'Vivace') + '">' + VV.esc(s.name || 'Vivace').split('').map(function (ch, i) { return '<i style="--i:' + i + '">' + ch + '</i>'; }).join('') + '</span>';
  }
  VV.logo = logo;

  function promoBar() {
    var pr = VV.data.settings.promo || {};
    if (!pr.enabled) return '';
    var bits = [];
    if (VV.tr(pr.text)) bits.push('<a href="' + VV.esc(pr.link || '/shop') + '"><b>' + VV.esc(VV.tr(pr.text)) + '</b></a>');
    if (pr.news) VV.data.news.filter(function (n) { return n.pinned; }).slice(0, 4).forEach(function (n) {
      bits.push('<a href="/post/' + encodeURIComponent(n.id) + '">' + VV.icon('spark', 'icon--sm') + ' ' + VV.esc(VV.tr(n.title)) + '</a>');
    });
    if (!bits.length) return '';
    var set = '<div class="promo__set">' + bits.map(function (b) { return '<span class="promo__item">' + b + '</span>'; }).join('') + '</div>';
    var reps = bits.length < 3 ? 3 : 2, row = '';
    for (var i = 0; i < reps; i++) row += set;
    var ends = pr.ends ? new Date(pr.ends) : null, timer = ends && ends > new Date() ? '<div class="promo__timer">' + VV.icon('clock', 'icon--sm') + ' <span>' + VV.t('ends_in') + '</span> <b data-countdown="' + ends.toISOString() + '">—</b></div>' : '';
    return '<div class="promo promo--' + VV.esc(pr.style || 'default') + '" role="region" aria-label="promo">' +
      '<div class="promo__lane" data-mq data-track=".promo__row" data-speed="-45" data-hover-pause><div class="promo__row">' + row + row + '</div></div>' + timer + '</div>';
  }

  function header() {
    var top = VV.topCats(), path = location.pathname, cat = VV.qs('cat');
    var mega = top.map(function (c) {
      return '<div class="mega__group" style="--t:' + (c.color || '#FF3D7F') + '"><a class="mega__title" href="' + VV.catUrl(c) + '"><span class="mega__ic">' + VV.esc(c.icon || '•') + '</span>' + VV.esc(VV.tr(c.name)) + '</a>' +
        '<ul class="mega__list">' + VV.children(c.id).map(function (s) { return '<li><a href="' + VV.catUrl(s) + '">' + VV.esc(VV.tr(s.name)) + '</a></li>'; }).join('') + '</ul></div>';
    }).join('');
    var menu = (VV.data.settings.menu || []).filter(function (m) { return !m.hidden && (VV.tr(m.label) || m.mega); });
    mega += '<div class="mega__foot"><a class="btn btn--accent btn--sm" href="/shop">' + VV.t('all_products') + ' ' + VV.icon('arrow-right', 'icon--sm') + '</a><a class="btn btn--ghost btn--sm" href="/shop?sale=1">' + VV.t('sale') + '</a></div>';
    var popular = VV.data.products.filter(function (p) { return p.hot; }).slice(0, 4).map(function (p) { return '<a class="chip" href="' + VV.productUrl(p) + '">' + VV.esc(VV.tr(p.name)) + '</a>'; }).join('');

    var html = promoBar() +
      '<header class="site-header">' +
        '<div class="scroll-progress" aria-hidden="true"></div>' +
        '<div class="wrap site-header__bar">' +
          '<button class="tool-btn burger" type="button" data-drawer-open="menu-drawer" aria-label="' + VV.t('menu') + '">' + VV.icon('menu') + '</button>' +
          '<a class="site-logo" href="/" aria-label="' + VV.t('home') + '">' + logo() + '</a>' +
          '<nav class="nav" aria-label="' + VV.t('menu') + '"><ul class="nav__list">' +
            menu.map(function (m) {
              var label = VV.esc(VV.tr(m.label) || VV.t('products')), href = VV.esc(m.url || '/shop');
              if (m.mega) return '<li class="nav__item"><a class="nav__link" href="' + href + '" data-nav="' + href + '" aria-haspopup="true">' + label + ' ' + VV.icon('chevron-down') + '</a><div class="mega mega--' + Math.min(top.length, 5) + '">' + mega + '</div></li>';
              return '<li class="nav__item"><a class="nav__link" href="' + href + '" data-nav="' + href + '"' + (/^https?:/.test(m.url || '') ? ' target="_blank" rel="noopener"' : '') + '>' + label + '</a></li>';
            }).join('') +
          '</ul></nav>' +
          '<div class="header-tools">' +
            '<div class="wx-chip" id="weather-chip" hidden><button class="wx-chip__btn" type="button" data-toggle="wx-pop" aria-expanded="false" aria-label="' + VV.t('weather') + '"></button><div class="wx-pop" id="wx-pop"></div></div>' +
            '<button class="tool-btn" type="button" data-toggle="search-panel" aria-expanded="false" aria-label="' + VV.t('search') + '">' + VV.icon('search') + '</button>' +
            '<a class="tool-btn tool-btn--wish" href="/wishlist" aria-label="' + VV.t('wishlist') + '">' + VV.icon('heart') + '<span class="wish-badge" data-count="0"></span></a>' +
            (VV.data.settings.auth ? '<a class="tool-btn acc-btn" href="/account" aria-label="' + VV.t('sign_in') + '">' + VV.icon('user') + '</a>' : '') +
            '<button class="lang-btn" type="button" data-lang aria-label="' + VV.t('language') + '">' + VV.icon('globe', 'icon--sm') + ' ' + (VV.lang === 'ka' ? 'EN' : 'ქა') + '</button>' +
            '<button class="tool-btn tool-btn--cart" type="button" data-drawer-open="cart-drawer" aria-label="' + VV.t('cart') + '">' + VV.icon('cart') + '<span class="cart-badge" data-count="0"></span></button>' +
          '</div>' +
        '</div>' +
        '<div class="search-panel" id="search-panel"><div class="wrap">' +
          '<form class="search-field" role="search" action="/shop">' + VV.icon('search') +
            '<input type="search" name="q" placeholder="' + VV.t('search_placeholder') + '" autocomplete="off" aria-label="' + VV.t('search') + '" required>' +
            '<button class="btn btn--accent btn--sm" type="submit">' + VV.t('search_submit') + '</button></form>' +
          '<div class="search-live" id="search-live"></div>' +
          '<div class="search-hints"><span class="chip chip--plain">' + VV.t('popular') + ':</span>' + popular + '</div>' +
        '</div></div>' +
      '</header>' +

      '<div class="drawer drawer--left" id="menu-drawer" aria-hidden="true"><div class="drawer__scrim" data-drawer-close></div>' +
        '<div class="drawer__panel" role="dialog" aria-modal="true" aria-label="' + VV.t('menu') + '">' +
          '<div class="drawer__head">' + logo('logo-word--sm') + '<button class="tool-btn" type="button" data-drawer-close aria-label="' + VV.t('close') + '">' + VV.icon('close') + '</button></div>' +
          '<div class="drawer__body"><div class="m-cats">' + top.map(function (c) {
            return '<a class="m-cat" style="--t:' + (c.color || '#FF3D7F') + '" href="' + VV.catUrl(c) + '"><span>' + VV.esc(c.icon || '•') + '</span><b>' + VV.esc(VV.tr(c.name)) + '</b></a>';
          }).join('') + '</div>' +
          '<ul class="m-nav">' +
            menu.map(function (m) { return '<li><a href="' + VV.esc(m.url || '/shop') + '">' + VV.esc(VV.tr(m.label) || VV.t('products')) + VV.icon('chevron-right') + '</a></li>'; }).join('') +
            (VV.data.settings.auth ? '<li><a href="/account">' + VV.t('account') + VV.icon('chevron-right') + '</a></li>' : '') +
            '<li><a href="/wishlist">' + VV.t('wishlist') + VV.icon('chevron-right') + '</a></li>' +
            '<li><a href="/shop?sale=1">' + VV.t('sale') + ' 🔥' + VV.icon('chevron-right') + '</a></li>' +
            '<li><a href="/delivery">' + VV.t('delivery') + VV.icon('chevron-right') + '</a></li>' +
            '<li><a href="/terms">' + VV.t('terms') + VV.icon('chevron-right') + '</a></li>' +
          '</ul>' +
          '<button class="btn btn--ghost btn--sm" type="button" data-lang>' + VV.icon('globe', 'icon--sm') + (VV.lang === 'ka' ? ' English' : ' ქართული') + '</button>' +
          '</div></div></div>' +

      '<div class="drawer drawer--right" id="cart-drawer" aria-hidden="true"><div class="drawer__scrim" data-drawer-close></div>' +
        '<div class="drawer__panel" role="dialog" aria-modal="true" aria-label="' + VV.t('cart') + '">' +
          '<div class="drawer__head"><b class="drawer__title">' + VV.icon('cart') + ' ' + VV.t('cart') + '</b><button class="tool-btn" type="button" data-drawer-close aria-label="' + VV.t('close') + '">' + VV.icon('close') + '</button></div>' +
          '<div class="drawer__body" id="cart-body"></div><div class="drawer__foot" id="cart-foot" hidden></div>' +
        '</div></div>';
    document.getElementById('app-header').innerHTML = html;
  }

  function footer() {
    var s = VV.data.settings, c = s.contact || {}, y = new Date().getFullYear();
    var soc = [['facebook', c.facebook], ['instagram', c.instagram], ['tiktok', c.tiktok]].filter(function (x) { return x[1]; })
      .map(function (x) { return '<a class="soc" href="' + VV.esc(x[1]) + '" target="_blank" rel="noopener" aria-label="' + x[0] + '">' + VV.icon(x[0]) + '</a>'; }).join('');
    document.getElementById('app-footer').innerHTML =
      '<footer class="site-footer">' +
        '<div class="footer-wave" aria-hidden="true">' + COLORS.map(function (col, i) { return '<i style="--c:' + col + ';--i:' + i + '"></i>'; }).join('') + '</div>' +
        '<div class="wrap footer-grid">' +
          '<div class="footer-brand">' + logo('logo-word--light') + '<p>' + VV.esc(VV.tr(s.site.tagline)) + '</p><p class="muted-l">' + VV.t('made') + '</p><div class="socs">' + soc + '</div></div>' +
          '<div><h4>' + VV.t('f_shop') + '</h4><ul>' + VV.topCats().map(function (t) { return '<li><a href="' + VV.catUrl(t) + '">' + VV.esc(VV.tr(t.name)) + '</a></li>'; }).join('') + '<li><a href="/shop?sale=1">' + VV.t('sale') + '</a></li></ul></div>' +
          '<div><h4>' + VV.t('f_help') + '</h4><ul><li><a href="/delivery">' + VV.t('delivery') + '</a></li><li><a href="/about">' + VV.t('about') + '</a></li><li><a href="/news">' + VV.t('news') + '</a></li><li><a href="/contact">' + VV.t('contact') + '</a></li><li><a href="/terms">' + VV.t('terms') + '</a></li></ul></div>' +
          '<div><h4>' + VV.t('contact') + '</h4><ul class="footer-contact">' +
            (c.phone ? '<li>' + VV.icon('phone', 'icon--sm') + '<a href="tel:' + VV.esc(c.phone.replace(/\s/g, '')) + '">' + VV.esc(c.phone) + '</a></li>' : '') +
            (c.email ? '<li>' + VV.icon('mail', 'icon--sm') + '<a href="mailto:' + VV.esc(c.email) + '">' + VV.esc(c.email) + '</a></li>' : '') +
            (VV.tr(c.address) ? '<li>' + VV.icon('pin', 'icon--sm') + '<a href="' + VV.map().link + '" target="_blank" rel="noopener">' + VV.esc(VV.tr(c.address)) + '</a></li>' : '') +
            (c.whatsapp ? '<li>' + VV.icon('whatsapp', 'icon--sm') + '<a href="https://wa.me/' + VV.esc(String(c.whatsapp).replace(/\D/g, '')) + '" target="_blank" rel="noopener">WhatsApp</a></li>' : '') +
            (VV.tr(c.hours) ? '<li>' + VV.icon('clock', 'icon--sm') + '<span>' + VV.esc(VV.tr(c.hours)) + '</span></li>' : '') +
          '</ul></div>' +
        '</div>' +
        '<div class="wrap footer-bottom"><span>© ' + y + ' ' + VV.esc(s.site.name || 'VIVACHE') + '. ' + VV.t('rights') + '</span><span class="footer-author">' + VV.t('author') + ': <b>ლაშა დიასამიძე</b></span><span class="footer-dots">' + COLORS.slice(0, 5).map(function (col) { return '<i style="background:' + col + '"></i>'; }).join('') + '</span></div>' +
      '</footer>' +
      '<div class="toast" id="toast" role="status" aria-live="polite">' + VV.icon('check', 'icon--sm') + '<span></span></div>';
  }

  /* ---------------- interactions ---------------- */
  function openDrawer(id) {
    var d = document.getElementById(id); if (!d) return;
    d.classList.add('is-open'); d.setAttribute('aria-hidden', 'false'); document.body.classList.add('no-scroll');
    var f = d.querySelector('.drawer__panel button, .drawer__panel a'); if (f) setTimeout(function () { f.focus(); }, 50);
  }
  function closeDrawers() {
    document.querySelectorAll('.drawer.is-open').forEach(function (d) { d.classList.remove('is-open'); d.setAttribute('aria-hidden', 'true'); });
    document.body.classList.remove('no-scroll');
  }
  VV.openCart = function () { openDrawer('cart-drawer'); };

  function bind() {
    document.addEventListener('click', function (e) {
      var t = e.target;
      var o = t.closest('[data-drawer-open]'); if (o) { e.preventDefault(); openDrawer(o.getAttribute('data-drawer-open')); return; }
      if (t.closest('[data-drawer-close]')) { closeDrawers(); return; }
      var tg = t.closest('[data-toggle]');
      if (tg) {
        var p = document.getElementById(tg.getAttribute('data-toggle')); var on = !p.classList.contains('is-open');
        p.classList.toggle('is-open', on); tg.setAttribute('aria-expanded', on);
        if (on) setTimeout(function () { var i = p.querySelector('input'); if (i) i.focus(); }, 60);
        return;
      }
      if (t.closest('[data-lang]')) { localStorage.setItem('vv_lang', VV.lang === 'ka' ? 'en' : 'ka'); location.reload(); return; }
      var wb = t.closest('[data-wish]');
      if (wb) {
        e.preventDefault(); var on = VV.wish.toggle(wb.getAttribute('data-wish'));
        document.querySelectorAll('[data-wish="' + wb.getAttribute('data-wish') + '"]').forEach(function (x) { x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on); });
        if (on) { var rr = wb.getBoundingClientRect(); VV.confetti(rr.left + rr.width / 2, rr.top + rr.height / 2, 12); }
        VV.toast(VV.t(on ? 'wish_added' : 'wish_removed')); return;
      }
      var add = t.closest('[data-add]');
      if (add) { e.preventDefault(); VV.addToCart(add.getAttribute('data-add'), add.getAttribute('data-variant') || '', 1, add); return; }
      var q = t.closest('[data-qty]');
      if (q) { var i = +q.getAttribute('data-qty'), it = VV.cart.items()[i]; if (it) VV.cart.set(i, it.qty + (+q.getAttribute('data-d'))); return; }
      var rm = t.closest('[data-rm]'); if (rm) { VV.cart.set(+rm.getAttribute('data-rm'), 0); return; }
      var wx = document.getElementById('wx-pop');
      if (wx && wx.classList.contains('is-open') && !t.closest('.wx-chip')) wx.classList.remove('is-open');
      var sp = document.getElementById('search-panel');
      if (sp && sp.classList.contains('is-open') && !t.closest('.search-panel, [data-toggle="search-panel"]')) {
        sp.classList.remove('is-open'); var b = document.querySelector('[data-toggle="search-panel"]'); if (b) b.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeDrawers(); var sp = document.getElementById('search-panel'); if (sp) sp.classList.remove('is-open'); }
    });
    // live search in the header panel
    var input = document.querySelector('.search-field input'), live = document.getElementById('search-live');
    if (input) input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      if (q.length < 2) { live.innerHTML = ''; return; }
      var res = VV.search(q).slice(0, 6);
      live.innerHTML = res.map(function (p) {
        return '<a class="live-hit" href="' + VV.productUrl(p) + '"><img src="' + VV.esc(VV.img(p)) + '" alt=""><span>' + VV.esc(VV.tr(p.name)) + '</span><b>' + (p.price ? VV.money(p.price) : '') + '</b></a>';
      }).join('') || '<p class="muted">' + VV.t('nothing') + '</p>';
    });
    // header state on scroll
    var hdr = document.querySelector('.site-header');
    var onScroll = function () { if (hdr) hdr.classList.toggle('is-scrolled', window.scrollY > 10); };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    // countdowns
    // countdowns (queried on every tick: page sections render after the shell)
    if (VV.data.settings.promo && VV.data.settings.promo.ends) {
      var tick = function () {
        document.querySelectorAll('[data-countdown]').forEach(function (el) {
          var ms = new Date(el.getAttribute('data-countdown')) - new Date();
          if (ms <= 0) { el.textContent = '00:00:00'; return; }
          var s = Math.floor(ms / 1000), d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), ss = s % 60;
          var pad = function (n) { return (n < 10 ? '0' : '') + n; };
          el.textContent = (d ? d + VV.t('d') + ' ' : '') + pad(h) + ':' + pad(m) + ':' + pad(ss);
        });
      };
      tick(); setInterval(tick, 1000);
    }
    // soft navigation between pages (no reload → music, cart drawer and header stay alive)
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === '_blank' || a.hasAttribute('download') || a.hasAttribute('data-reload')) return;
      var href = a.getAttribute('href');
      if (!href || href[0] !== '/' || href.indexOf('//') === 0) return;
      var u = new URL(href, location.href);
      if (/^\/(admin|img|api|assets)(\/|$)/.test(u.pathname) || /\.(pdf|zip|png|jpe?g|webp|mp3)$/i.test(u.pathname)) return;
      if (u.pathname === location.pathname && u.search === location.search && u.hash) return;   // same page anchor
      e.preventDefault();
      VV.navigate(u.pathname + u.search + u.hash);
    });
    document.addEventListener('submit', function (e) {
      var fm = e.target;
      if (!fm.matches || !fm.matches('form[role=search]')) return;
      e.preventDefault();
      VV.navigate((fm.getAttribute('action') || '/shop') + '?' + new URLSearchParams(new FormData(fm)).toString());
    });
    window.addEventListener('popstate', function () { VV.navigate(location.pathname + location.search + location.hash, false); });
  }

  /* ---------------- router ---------------- */
  var leaving = [];
  VV.onLeave = function (fn) { leaving.push(fn); };
  VV.route = function (pathname) {
    var p = String(pathname || '/').replace(/\.html$/, '').replace(/\/+$/, '') || '/';
    if (p === '/' || p === '/index') return ['home'];
    if (p === '/product' || p.indexOf('/product/') === 0) return ['product'];
    if (p === '/article' || p.indexOf('/post/') === 0) return ['article'];
    var simple = { '/shop': 'shop', '/news': 'news', '/contact': 'contact', '/checkout': 'checkout', '/account': 'account', '/wishlist': 'wishlist', '/404': 'notfound' };
    if (simple[p]) return [simple[p]];
    if (p === '/about' || p === '/delivery' || p === '/terms') return ['page', p.slice(1)];
    var m = p.match(/^\/p\/([a-z0-9-]+)$/i);
    if (m) return ['page', m[1].toLowerCase()];
    return ['notfound'];
  };
  VV.navigate = function (href, push) {
    if (push !== false) history.pushState({ vv: 1 }, '', href);
    leaving.splice(0).forEach(function (fn) { try { fn(); } catch (e) { /* */ } });
    if (window.ScrollTrigger) window.ScrollTrigger.getAll().forEach(function (t) { t.kill(); });
    closeDrawers();
    var sp = document.getElementById('search-panel'); if (sp) sp.classList.remove('is-open');
    var u = new URL(href, location.href), r = VV.route(u.pathname);
    document.body.setAttribute('data-page', r[0]);
    if (r[1]) document.body.setAttribute('data-key', r[1]); else document.body.removeAttribute('data-key');
    document.getElementById('main').innerHTML = '';
    VV.renderPage();
    if (u.hash) { var el = document.getElementById(u.hash.slice(1)); if (el) { setTimeout(function () { el.scrollIntoView({ behavior: 'smooth' }); }, 80); return; } }
    window.scrollTo(0, 0);
  };
  VV.renderPage = function () {
    var page = document.body.getAttribute('data-page') || 'home';
    try { (VV.pages[page] || VV.pages.notfound)(); } catch (e) { console.error(e); }
    var path = location.pathname;
    document.querySelectorAll('[data-nav]').forEach(function (a) {
      var h = a.getAttribute('data-nav'), on = h !== '/' && (path === h || path.indexOf(h + '/') === 0 || (h === '/shop' && path.indexOf('/product/') === 0) || (h === '/news' && path.indexOf('/post/') === 0));
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    VV.motion();
  };

  VV.search = function (q) {
    q = q.toLowerCase();
    return VV.data.products.filter(function (p) {
      return [p.name && p.name.ka, p.name && p.name.en, p.brand, p.code].join(' ').toLowerCase().indexOf(q) > -1;
    });
  };

  /* ---------------- motion (GSAP, same hooks as akzonobel front2) ---------------- */
  VV.motion = function () {
    document.querySelectorAll('[data-mq]').forEach(VV.marquee);
    var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
    var gsap = window.gsap, ST = window.ScrollTrigger;
    if (reduced || !gsap) {
      root.classList.remove('motion');
      document.querySelectorAll('[data-count]').forEach(function (el) { el.textContent = Number(el.getAttribute('data-count')).toLocaleString(); });
      return;
    }
    if (ST) gsap.registerPlugin(ST);
    gsap.defaults({ overwrite: 'auto' });

    function split(el) {
      if (el._split) return el._split;
      var walk = function (node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (n) {
          if (n.nodeType === 3) {
            var frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach(function (part) {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
              var m = document.createElement('span'); m.className = 'w-mask';
              var w = document.createElement('span'); w.className = 'w'; w.textContent = part;
              m.appendChild(w); frag.appendChild(m);
            });
            node.replaceChild(frag, n);
          } else if (n.nodeType === 1) walk(n);
        });
      };
      walk(el);
      return (el._split = el.querySelectorAll('.w'));
    }
    VV.splitWords = split;

    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    gsap.utils.toArray('[data-split="words"]').forEach(function (el) {
      if (el.closest('.hero-slide:not(.is-active)')) return;
      var words = split(el); gsap.set(el, { autoAlpha: 1 });
      tl.fromTo(words, { yPercent: 110 }, { yPercent: 0, duration: 0.8, stagger: 0.07 }, 0);
    });
    var intro = gsap.utils.toArray('[data-anim="intro"]:not([data-split])');
    if (intro.length) tl.fromTo(intro, { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.08, clearProps: 'transform' }, 0.15);

    gsap.utils.toArray('[data-anim="reveal"]').forEach(function (el) {
      var tw = { y: 0, autoAlpha: 1, duration: 0.7, ease: 'power2.out', clearProps: 'transform' };
      if (ST) tw.scrollTrigger = { trigger: el, start: 'top 85%', once: true };
      gsap.fromTo(el, { y: 30, autoAlpha: 0 }, tw);
    });
    var items = gsap.utils.toArray('[data-anim="item"]');
    if (items.length && ST) {
      gsap.set(items, { y: 28, autoAlpha: 0 });
      ST.batch(items, { start: 'top 92%', once: true, onEnter: function (b) { gsap.to(b, { y: 0, autoAlpha: 1, duration: 0.6, ease: 'back.out(1.4)', stagger: 0.06, clearProps: 'transform' }); } });
    } else if (items.length) gsap.to(items, { autoAlpha: 1 });

    gsap.utils.toArray('[data-count]').forEach(function (el) {
      var end = Number(el.getAttribute('data-count')) || 0, o = { v: 0 };
      gsap.to(o, { v: end, duration: 1.6, ease: 'power2.out', scrollTrigger: ST ? { trigger: el, start: 'top 92%', once: true } : undefined,
        onUpdate: function () { el.textContent = Math.round(o.v).toLocaleString(); } });
    });
    if (ST) gsap.utils.toArray('[data-parallax]').forEach(function (el) {
      var k = parseFloat(el.getAttribute('data-parallax')) || 0.1;
      gsap.fromTo(el, { y: function () { return window.innerHeight * k; } }, { y: function () { return -window.innerHeight * k; }, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
    });
    var bar = document.querySelector('.scroll-progress');
    if (bar && ST) gsap.to(bar, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

    if (fine) {
      gsap.utils.toArray('[data-magnetic]').forEach(function (el) {
        var xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' }), yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });
        el.addEventListener('pointermove', function (e) {
          var r = el.getBoundingClientRect();
          xTo(gsap.utils.clamp(-1, 1, (e.clientX - r.left - r.width / 2) / (r.width / 2)) * 8);
          yTo(gsap.utils.clamp(-1, 1, (e.clientY - r.top - r.height / 2) / (r.height / 2)) * 5);
        });
        el.addEventListener('pointerleave', function () { xTo(0); yTo(0); });
      });
      gsap.utils.toArray('[data-tilt]').forEach(function (el) {
        var tx = gsap.quickTo(el, 'rotationY', { duration: .5, ease: 'power3.out' }), ty = gsap.quickTo(el, 'rotationX', { duration: .5, ease: 'power3.out' });
        el.addEventListener('pointermove', function (e) { var r = el.getBoundingClientRect(); tx(((e.clientX - r.left) / r.width - .5) * 16); ty(-((e.clientY - r.top) / r.height - .5) * 12); });
        el.addEventListener('pointerleave', function () { tx(0); ty(0); });
      });
      // colourful cursor: the arrow changes colour as the mouse travels (akzonobel motion.js idea)
      if (!VV._cursor) (VV._cursor = 1) && (function () {
        var cache = {}, cur = '', idx = 0, travel = 0, lx = 0, ly = 0, raf = 0, want = COLORS[0];
        function uri(svg) { return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")'; }
        function make(c) {
          if (cache[c]) return cache[c];
          var arrow = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><path d="M6 3.5v18.2l4.6-4.4 3.1 6.9 3.2-1.4-3-6.8h6.4z" fill="' + c + '" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';
          var hand = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><path d="M10.5 13V5.2a1.7 1.7 0 0 1 3.4 0V12m0-1.2a1.7 1.7 0 0 1 3.4 0V12.5m0-.6a1.7 1.7 0 0 1 3.4 0v1.4m0-.3a1.7 1.7 0 0 1 3.4 0v4.2c0 4-2.9 7.3-7 7.3h-1.6c-2.4 0-4-1-5.3-2.9l-3.6-5.2a1.8 1.8 0 0 1 2.9-2.1l2.4 2.7z" fill="' + c + '" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';
          return (cache[c] = [uri(arrow) + ' 6 3.5, auto', uri(hand) + ' 12 4, pointer']);
        }
        function apply() { raf = 0; if (want === cur) return; cur = want; var m = make(cur); root.style.setProperty('--cursor', m[0]); root.style.setProperty('--cursor-hand', m[1]); }
        root.classList.add('has-cursor'); want = COLORS[0]; apply();
        window.addEventListener('pointermove', function (e) {
          if (e.pointerType !== 'mouse') return;
          var t = e.target.closest && e.target.closest('[style*="--t"]');
          travel += Math.abs(e.clientX - lx) + Math.abs(e.clientY - ly); lx = e.clientX; ly = e.clientY;
          if (travel > 700) { travel = 0; idx = (idx + 1) % COLORS.length; }
          var c = t ? getComputedStyle(t).getPropertyValue('--t').trim() : '';
          want = /^#[0-9a-f]{3,8}$/i.test(c) ? c : COLORS[idx];
          if (!raf) raf = requestAnimationFrame(apply);
        }, { passive: true });
      })();
    }
    if (ST) setTimeout(function () { ST.refresh(); }, 400);
  };

  /* ---------------- boot ---------------- */
  VV.pages = VV.pages || {};
  VV.setTitle = function (t) { document.title = t ? t + ' · ' + (VV.data.settings.site.name || 'Vivace') : (VV.data.settings.site.name || 'Vivace') + ' — ' + VV.tr(VV.data.settings.site.tagline); };

  async function boot() {
    try {
      var r = await fetch('/api/catalog', { headers: { accept: 'application/json' } });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      VV.data = await r.json();
    } catch (e) {
      console.error(e);
      document.getElementById('main').innerHTML = '<section class="section"><div class="wrap empty-state"><h1 class="h-2">Vivace</h1><p class="lead">' + VV.t('error') + '</p><p class="muted">API: /api/catalog — ' + VV.esc(e.message) + '</p></div></section>';
      return;
    }
    // remove the old VIVACHE app's service worker + caches (it served stale files)
    if ('serviceWorker' in navigator) navigator.serviceWorker.getRegistrations().then(function (rs) { rs.forEach(function (r) { r.unregister(); }); }).catch(function () {});
    if (window.caches) caches.keys().then(function (ks) { ks.forEach(function (k) { caches.delete(k); }); }).catch(function () {});
    var safe = function (fn) { try { fn(); } catch (e) { console.error(e); } };
    safe(VV.applyFrame);
    header(); footer();
    safe(bind); safe(VV.cart.render); safe(VV.wish.render); safe(VV.weather);
    if (VV.music) safe(VV.music.init);
    if (VV.data.settings.auth) VV.acc.me().then(VV.acc.badge);
    if (VV.newyear) try { VV.newyear(); } catch (e) { console.error(e); }
    // the HTML file decides the first page; the router keeps it consistent for /p/<slug> pages
    var r0 = VV.route(location.pathname);
    if (r0[0] === 'page' && r0[1]) document.body.setAttribute('data-key', r0[1]);
    history.replaceState({ vv: 1 }, '', location.href);
    VV.renderPage();
    document.body.classList.add('is-ready');
  }
  // deferred scripts run while readyState is "interactive" and before DOMContentLoaded: wait for pages.js + GSAP
  if (document.readyState === 'complete') boot(); else document.addEventListener('DOMContentLoaded', boot);
})();
