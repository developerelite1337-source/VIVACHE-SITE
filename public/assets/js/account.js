/* VIVACHE — "My account" (same flow & layout as akzonobelgeo /account), on Supabase:
     sign in    → email + password (Supabase Auth)  or  login + password assigned in LIBRA FINANCE (vv_login)
     register   → Supabase Auth sign-up (confirmation e-mail) → existing LIBRA customer with the same e-mail is linked
     forgot     → Supabase recovery e-mail → back here with #access_token&type=recovery → new password
     cabinet    → vv_me: cashback card & balance, orders (status from LIBRA), store receipts, settings            */
(function () {
  'use strict';
  var VV = window.VV, P = (VV.pages = VV.pages || {});
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var e = function (s) { return VV.esc(s); }, I = function (n, c) { return VV.icon(n, c); };

  var T = {
    ka: {
      title: 'ჩემი ანგარიში', eyebrow: 'VIVACHE ანგარიში', h1: 'შედი და <em>მიიღე მეტი</em>', lead: 'ქეშბექის ბალანსი, შეკვეთების სტატუსი და მაღაზიის ჩეკები — ერთ ადგილას.',
      b1: 'ქეშბექი ყოველ ყიდვაზე', b2: 'შეკვეთის სტატუსი რეალურ დროში', b3: 'სწრაფი შეკვეთა — მონაცემები დამახსოვრებულია',
      tab_login: 'შესვლა', tab_register: 'რეგისტრაცია', contact: 'ელფოსტა ან ლოგინი', contact_ph: 'name@mail.com ან მაღაზიის ლოგინი', password: 'პაროლი', show_pw: 'პაროლის ჩვენება',
      forgot: 'დაგავიწყდა პაროლი?', login_btn: 'შესვლა', first_name: 'სახელი', last_name: 'გვარი', by_email: 'ელფოსტით', by_phone: 'ტელეფონით', sms_off: 'ტელეფონით რეგისტრაცია მალე დაემატება — ახლა გამოიყენე ელფოსტა.',
      email: 'ელფოსტა', email_ph: 'name@mail.com', password_ph: 'მინიმუმ 8 სიმბოლო', password2: 'გაიმეორე პაროლი', register_btn: 'რეგისტრაცია',
      consent: 'ვეთანხმები პერსონალური მონაცემების დამუშავებას და <a href="/terms">მომსახურების პირობებს</a>', forgot_title: 'პაროლის აღდგენა',
      forgot_lead: 'ჩაწერე ელფოსტა — გამოგიგზავნით აღდგენის ბმულს. მაღაზიის ლოგინის პაროლს მაღაზია აღგიდგენს.', forgot_btn: 'ბმულის გაგზავნა', back_login: '← შესვლაზე დაბრუნება',
      reset_title: 'ახალი პაროლი', reset_btn: 'პაროლის შენახვა', new_password: 'ახალი პაროლი', sent_title: 'შეამოწმე ელფოსტა 📬', sent_reg: 'დასადასტურებელი ბმული გაიგზავნა მისამართზე', sent_reg2: 'დააჭირე ბმულს წერილში — ავტომატურად შეხვალ ანგარიშზე.', sent_forgot: 'თუ ეს ელფოსტა რეგისტრირებულია, აღდგენის ბმული გაიგზავნა.',
      pw_mismatch: 'პაროლები არ ემთხვევა', pw_short: 'პაროლი — მინიმუმ 8 სიმბოლო', need_consent: 'მონიშნე თანხმობა', fill: 'შეავსე ველები',
      card_q: 'გაქვს VIVACHE-ს ქეშბექ ბარათი?', card_q_t: 'დარეგისტრირდი იმავე ელფოსტით, რაც მაღაზიაში მიუთითე — ბარათი ავტომატურად მიებმება.',
      hello: 'გამარჯობა,', logout: 'გასვლა', since: 'ქეშბექი', welcome: 'მოგესალმებით! ანგარიში მზადაა.',
      stat_orders: 'შეკვეთა', stat_spent: 'დახარჯული', stat_active: 'აქტიური შეკვეთა', stat_cb: 'ქეშბექის ბალანსი',
      tab_overview: 'მიმოხილვა', tab_orders: 'შეკვეთები', tab_cashback: 'ქეშბექი და ჩეკები', tab_settings: 'პარამეტრები',
      q_catalog: 'პროდუქცია', q_wish: 'რჩეულები', q_sale: 'ფასდაკლებები', q_contact: 'კონტაქტი',
      last_orders: 'ბოლო შეკვეთები', all_orders: 'ყველა', no_orders: 'შეკვეთები ჯერ არ გაქვს.', shop: 'დაიწყე შოპინგი',
      card: 'ქეშბექ ბარათი', card_none: 'ბარათი ჯერ არ არის მიბმული — მიუთითე ეს ელფოსტა მაღაზიაში და ბარათი მოგენიჭება.', available: 'ხელმისაწვდომი', reserved: 'დაჯავშნილია შეკვეთებში', earn: 'ქეშბექი ყოველ ყიდვაზე',
      moves: 'ქეშბექის მოძრაობა', receipts: 'ჩეკები მაღაზიიდან', no_moves: 'მოძრაობა ჯერ არ არის.', no_receipts: 'ჩეკები ჯერ არ არის.',
      name: 'სახელი და გვარი', phone: 'ტელეფონი', save: 'შენახვა', saved: 'შენახულია', change_pw: 'პაროლის შეცვლა', old_pw: 'ძველი პაროლი', pw_email: 'ელფოსტით შესვლის პაროლი იცვლება აღდგენის ბმულით.', send_reset: 'აღდგენის ბმული',
      login_name: 'ლოგინი', cancel: 'შეკვეთის გაუქმება', cancel_q: 'გავაუქმო შეკვეთა?', cancelled: 'შეკვეთა გაუქმდა', proof: 'გადარიცხვის ქვითარი', proof_up: 'ქვითრის ატვირთვა', proof_done: 'ქვითარი ატვირთულია',
      st_new: 'ახალი', st_accepted: 'მიღებული', st_preparing: 'მზადდება', st_ready: 'მზადაა გასატანად', st_delivering: 'გზაშია', st_done: 'დასრულებული', st_cancelled: 'გაუქმებული',
      pickup: 'მაღაზიიდან გატანა', courier: 'კურიერი', subtotal: 'ჯამი', delivery: 'მიწოდება', cashback_used: 'ქეშბექით', total: 'სულ', pay: 'გადახდა',
      lvl: ['სტარტი', 'ვერცხლი', 'ოქრო', 'ბრილიანტი'], lvl_next: 'შემდეგ დონემდე', lvl_top: 'უმაღლესი დონე 🎉', strength: ['სუსტი', 'საშუალო', 'კარგი', 'ძლიერი'],
    },
    en: {
      title: 'My account', eyebrow: 'VIVACHE account', h1: 'Sign in and <em>get more</em>', lead: 'Cashback balance, order status and store receipts — in one place.',
      b1: 'Cashback on every purchase', b2: 'Live order status', b3: 'Faster checkout — your details are saved',
      tab_login: 'Sign in', tab_register: 'Register', contact: 'Email or login', contact_ph: 'name@mail.com or store login', password: 'Password', show_pw: 'Show password',
      forgot: 'Forgot password?', login_btn: 'Sign in', first_name: 'First name', last_name: 'Last name', by_email: 'By email', by_phone: 'By phone', sms_off: 'Phone sign-up is coming soon — please use email.',
      email: 'Email', email_ph: 'name@mail.com', password_ph: 'At least 8 characters', password2: 'Repeat password', register_btn: 'Create account',
      consent: 'I agree to the processing of personal data and the <a href="/terms">terms</a>', forgot_title: 'Reset password',
      forgot_lead: 'Enter your email and we will send a reset link. Store-login passwords are reset by the store.', forgot_btn: 'Send link', back_login: '← Back to sign in',
      reset_title: 'New password', reset_btn: 'Save password', new_password: 'New password', sent_title: 'Check your email 📬', sent_reg: 'We sent a confirmation link to', sent_reg2: 'Click the link in the email — you will be signed in automatically.', sent_forgot: 'If this email is registered, a reset link has been sent.',
      pw_mismatch: 'Passwords do not match', pw_short: 'Password — at least 8 characters', need_consent: 'Please accept the terms', fill: 'Please fill in the fields',
      card_q: 'Have a VIVACHE cashback card?', card_q_t: 'Register with the same email you gave in store — your card links automatically.',
      hello: 'Hello,', logout: 'Sign out', since: 'Cashback', welcome: 'Welcome! Your account is ready.',
      stat_orders: 'Orders', stat_spent: 'Spent', stat_active: 'Active orders', stat_cb: 'Cashback balance',
      tab_overview: 'Overview', tab_orders: 'Orders', tab_cashback: 'Cashback & receipts', tab_settings: 'Settings',
      q_catalog: 'Products', q_wish: 'Wishlist', q_sale: 'Deals', q_contact: 'Contact',
      last_orders: 'Recent orders', all_orders: 'All', no_orders: 'No orders yet.', shop: 'Start shopping',
      card: 'Cashback card', card_none: 'No card linked yet — give this email in store to get one.', available: 'Available', reserved: 'Reserved in orders', earn: 'cashback on every purchase',
      moves: 'Cashback history', receipts: 'Store receipts', no_moves: 'No movements yet.', no_receipts: 'No receipts yet.',
      name: 'Full name', phone: 'Phone', save: 'Save', saved: 'Saved', change_pw: 'Change password', old_pw: 'Old password', pw_email: 'Email sign-in passwords are changed with a reset link.', send_reset: 'Reset link',
      login_name: 'Login', cancel: 'Cancel order', cancel_q: 'Cancel this order?', cancelled: 'Order cancelled', proof: 'Transfer receipt', proof_up: 'Upload receipt', proof_done: 'Receipt uploaded',
      st_new: 'New', st_accepted: 'Accepted', st_preparing: 'Preparing', st_ready: 'Ready for pickup', st_delivering: 'On the way', st_done: 'Completed', st_cancelled: 'Cancelled',
      pickup: 'Pick up in store', courier: 'Courier', subtotal: 'Subtotal', delivery: 'Delivery', cashback_used: 'Cashback', total: 'Total', pay: 'Payment',
      lvl: ['Start', 'Silver', 'Gold', 'Diamond'], lvl_next: 'to next level', lvl_top: 'Top level 🎉', strength: ['Weak', 'Fair', 'Good', 'Strong'],
    },
  };
  var t = function (k) { return (T[VV.lang] || T.ka)[k] || T.ka[k] || k; };
  var GEL = function (tetri) { return VV.money((+tetri || 0) / 100); };
  var fdate = function (d) { try { return new Date(d).toLocaleDateString(VV.lang === 'ka' ? 'ka-GE' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); } catch (x) { return d; } };

  /* ---------- barcode (EAN-13 for 12/13-digit cards, Code 39 otherwise) ---------- */
  var EL = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011'];
  var ER = EL.map(function (s) { return s.replace(/./g, function (c) { return c === '0' ? '1' : '0'; }); });
  var EG = ER.map(function (s) { return s.split('').reverse().join(''); });
  var PAR = ['LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG', 'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'];
  var C39 = { 0: 'nnnwwnwnn', 1: 'wnnwnnnnw', 2: 'nnwwnnnnw', 3: 'wnwwnnnnn', 4: 'nnnwwnnnw', 5: 'wnnwwnnnn', 6: 'nnwwwnnnn', 7: 'nnnwnnwnw', 8: 'wnnwnnwnn', 9: 'nnwwnnwnn', A: 'wnnnnwnnw', B: 'nnwnnwnnw', C: 'wnwnnwnnn', D: 'nnnnwwnnw', E: 'wnnnwwnnn', F: 'nnwnwwnnn', G: 'nnnnnwwnw', H: 'wnnnnwwnn', I: 'nnwnnwwnn', J: 'nnnnwwwnn', K: 'wnnnnnnww', L: 'nnwnnnnww', M: 'wnwnnnnwn', N: 'nnnnwnnww', O: 'wnnnwnnwn', P: 'nnwnwnnwn', Q: 'nnnnnnwww', R: 'wnnnnnwwn', S: 'nnwnnnwwn', T: 'nnnnwnwwn', U: 'wwnnnnnnw', V: 'nwwnnnnnw', W: 'wwwnnnnnn', X: 'nwnnwnnnw', Y: 'wwnnwnnnn', Z: 'nwwnwnnnn', '-': 'nwnnnnwnw', '.': 'wwnnnnwnn', ' ': 'nwwnnnwnn', '*': 'nwnnwnwnn' };
  function barcode(code) {
    code = String(code || '').trim();
    var bits = '', label = code;
    if (/^\d{12,13}$/.test(code)) {
      var d = code.slice(0, 12).split('').map(Number);
      var sum = d.reduce(function (s, x, i) { return s + x * (i % 2 ? 3 : 1); }, 0);
      d.push((10 - sum % 10) % 10);
      var par = PAR[d[0]];
      bits = '101' + d.slice(1, 7).map(function (x, i) { return (par[i] === 'L' ? EL : EG)[x]; }).join('') + '01010' + d.slice(7).map(function (x) { return ER[x]; }).join('') + '101';
      label = d[0] + ' ' + d.slice(1, 7).join('') + ' ' + d.slice(7).join('');
    } else {
      ('*' + code.toUpperCase().replace(/[^0-9A-Z\-. ]/g, '') + '*').split('').forEach(function (ch) {
        (C39[ch] || C39['-']).split('').forEach(function (w, i) { var n = w === 'w' ? 3 : 1, c = i % 2 ? '0' : '1'; for (var k = 0; k < n; k++) bits += c; });
        bits += '0';
      });
    }
    var x = 0, rects = '';
    for (var i = 0; i < bits.length; i++) { if (bits[i] === '1') { var j = i; while (bits[j + 1] === '1') j++; rects += '<rect x="' + i + '" y="0" width="' + (j - i + 1) + '" height="50"/>'; i = j; } }
    x = bits.length;
    return '<svg class="barcode" viewBox="-6 0 ' + (x + 12) + ' 50" preserveAspectRatio="none" role="img" aria-label="' + e(code) + '"><rect x="-6" width="' + (x + 12) + '" height="50" fill="#fff"/><g fill="#111">' + rects + '</g></svg><small class="barcode__txt">' + e(label) + '</small>';
  }
  VV.barcode = barcode;

  /* ---------- page ---------- */
  P.account = function () {
    VV.setTitle(t('title'));
    if (!VV.data.settings.auth) {
      document.getElementById('main').innerHTML = '<section class="section"><div class="wrap empty-state">' + I('user', 'icon--lg') + '<h2 class="h-2">' + t('title') + '</h2><p>' + (VV.lang === 'ka' ? 'ანგარიშები ჩაირთვება Supabase-თან დაკავშირების შემდეგ.' : 'Accounts will be enabled once Supabase is connected.') + '</p></div></section>';
      return;
    }
    var h = new URLSearchParams(location.hash.slice(1));
    if (h.get('error_description')) { history.replaceState(null, '', location.pathname); return authView('login', decodeURIComponent(h.get('error_description').replace(/\+/g, ' '))); }
    if (h.get('access_token')) {
      var at = h.get('access_token'), type = h.get('type');
      history.replaceState(null, '', location.pathname + location.search);
      if (type === 'recovery') return authView('reset', '', at);
      return VV.acc.call('email-session', { access_token: at }).then(function (j) { VV.acc.set(j.token); cabinet(true); }).catch(function (x) { authView('login', x.message); });
    }
    if (VV.acc.token()) cabinet(); else authView('login');
  };

  function next() { var n = VV.qs('next'); return n && n[0] === '/' && n[1] !== '/' ? n : ''; }
  function eye() { return '<button type="button" class="acc-pw__eye" data-eye aria-label="' + t('show_pw') + '">' + I('eye', 'icon--sm') + '</button>'; }

  /* ================= sign in / register / forgot / reset ================= */
  function authView(mode, msg, accessToken) {
    var cb = VV.data.settings.cashback || {};
    document.getElementById('main').innerHTML =
      '<section class="acc-auth"><div class="acc-art" aria-hidden="true"><svg class="acc-art__splash" viewBox="0 0 600 600"><path d="M300 40c60 0 70 60 120 70s110-10 120 50-50 80-40 130 60 90 10 140-100 0-140 40-40 90-100 90-70-60-120-80-120 20-140-40 40-90 20-140-60-70-20-120 100-20 140-60 70-80 130-80z"/></svg>' +
        '<i class="acc-art__drop d1"></i><i class="acc-art__drop d2"></i><i class="acc-art__drop d3"></i><span class="acc-art__chip c1"></span><span class="acc-art__chip c2"></span><span class="acc-art__chip c3"></span><span class="acc-art__chip c4"></span></div>' +
      '<div class="wrap acc-auth__grid"><div class="acc-auth__intro">' +
        '<nav class="crumbs"><a href="/">' + VV.t('home') + '</a> <span>/</span> <b>' + t('title') + '</b></nav>' +
        '<span class="eyebrow" data-anim="intro">' + t('eyebrow') + '</span><h1 class="h-display acc-auth__title">' + t('h1') + '</h1><p class="lead" data-anim="intro">' + t('lead') + '</p>' +
        '<ul class="acc-perks" data-anim="intro"><li style="--t:#22C55E">' + I('card', 'icon--sm') + t('b1') + '</li><li style="--t:#2F6BFF">' + I('truck', 'icon--sm') + t('b2') + '</li><li style="--t:#FF3D7F">' + I('check', 'icon--sm') + t('b3') + '</li></ul></div>' +
      '<div class="acc-card" data-anim="intro">' +
        '<div class="acc-tabs" role="tablist"' + (mode === 'login' || mode === 'register' ? '' : ' hidden') + '><button type="button" role="tab" aria-selected="' + (mode !== 'register') + '" data-mode="login">' + t('tab_login') + '</button><button type="button" role="tab" aria-selected="' + (mode === 'register') + '" data-mode="register">' + t('tab_register') + '</button><span class="acc-tabs__ink"></span></div>' +
        // login
        '<form class="acc-form" data-form="login" novalidate' + (mode === 'login' ? '' : ' hidden') + '>' +
          '<label class="acc-field"><span>' + t('contact') + '</span><input name="contact" autocomplete="username" placeholder="' + t('contact_ph') + '" maxlength="160" required></label>' +
          '<label class="acc-field"><span>' + t('password') + '</span><span class="acc-pw"><input name="password" type="password" autocomplete="current-password" required>' + eye() + '</span></label>' +
          '<button type="button" class="acc-link acc-forgot" data-goto="forgot">' + t('forgot') + '</button>' +
          '<p class="acc-msg" data-msg role="status"></p><button class="btn btn--accent btn--lg acc-go" type="submit">' + t('login_btn') + ' ' + I('arrow-right', 'icon--sm') + '</button></form>' +
        // register
        '<form class="acc-form" data-form="register" novalidate' + (mode === 'register' ? '' : ' hidden') + '>' +
          '<div class="acc-names"><label class="acc-field"><span>' + t('first_name') + '</span><input name="first_name" autocomplete="given-name" maxlength="80" required></label><label class="acc-field"><span>' + t('last_name') + '</span><input name="last_name" autocomplete="family-name" maxlength="80"></label></div>' +
          '<div class="acc-switch" role="radiogroup"><label><input type="radio" name="channel" value="email" checked> ' + I('mail', 'icon--sm') + ' ' + t('by_email') + '</label><label class="is-off" title="' + t('sms_off') + '"><input type="radio" name="channel" value="phone" disabled> ' + I('phone', 'icon--sm') + ' ' + t('by_phone') + '</label></div>' +
          '<label class="acc-field"><span>' + t('email') + '</span><input name="email" type="email" inputmode="email" autocomplete="email" placeholder="' + t('email_ph') + '" maxlength="160" required></label>' +
          '<div class="acc-names"><label class="acc-field"><span>' + t('password') + '</span><span class="acc-pw"><input name="password" type="password" autocomplete="new-password" placeholder="' + t('password_ph') + '" minlength="8" required>' + eye() + '</span></label><label class="acc-field"><span>' + t('password2') + '</span><input name="password2" type="password" autocomplete="new-password" minlength="8" required></label></div>' +
          '<div class="acc-meter" data-meter aria-hidden="true"><i></i><i></i><i></i><i></i><small></small></div>' +
          '<label class="acc-consent"><input type="checkbox" name="consent"> <span>' + t('consent') + '</span></label>' +
          '<p class="acc-msg" data-msg role="status"></p><button class="btn btn--accent btn--lg acc-go" type="submit">' + t('register_btn') + ' ' + I('arrow-right', 'icon--sm') + '</button></form>' +
        // forgot
        '<form class="acc-form" data-form="forgot" novalidate' + (mode === 'forgot' ? '' : ' hidden') + '><h2 class="acc-form__title">' + t('forgot_title') + '</h2><p class="acc-sent">' + t('forgot_lead') + '</p>' +
          '<label class="acc-field"><span>' + t('email') + '</span><input name="email" type="email" autocomplete="email" placeholder="' + t('email_ph') + '" required></label>' +
          '<p class="acc-msg" data-msg role="status"></p><button class="btn btn--accent btn--lg acc-go" type="submit">' + t('forgot_btn') + ' ' + I('arrow-right', 'icon--sm') + '</button><button type="button" class="acc-link" data-goto="login">' + t('back_login') + '</button></form>' +
        // reset (from e-mail link)
        '<form class="acc-form" data-form="reset" novalidate' + (mode === 'reset' ? '' : ' hidden') + '><h2 class="acc-form__title">' + t('reset_title') + '</h2>' +
          '<div class="acc-names"><label class="acc-field"><span>' + t('new_password') + '</span><span class="acc-pw"><input name="password" type="password" autocomplete="new-password" placeholder="' + t('password_ph') + '" minlength="8" required>' + eye() + '</span></label><label class="acc-field"><span>' + t('password2') + '</span><input name="password2" type="password" autocomplete="new-password" minlength="8" required></label></div>' +
          '<div class="acc-meter" data-meter aria-hidden="true"><i></i><i></i><i></i><i></i><small></small></div>' +
          '<p class="acc-msg" data-msg role="status"></p><button class="btn btn--accent btn--lg acc-go" type="submit">' + t('reset_btn') + ' ' + I('check', 'icon--sm') + '</button></form>' +
        // sent
        '<div class="acc-form acc-done" data-form="sent" hidden><div class="acc-done__icon">' + I('mail', 'icon--lg') + '</div><h2 class="acc-form__title">' + t('sent_title') + '</h2><p class="acc-sent" data-sent></p><button type="button" class="acc-link" data-goto="login">' + t('back_login') + '</button></div>' +
        '<a class="acc-card-link" href="/#cashback"><img src="' + e(cb.image || '/assets/img/brand/cashback-card.webp') + '" alt="" width="74" height="50" loading="lazy"><span><b>' + t('card_q') + '</b><small>' + t('card_q_t') + '</small></span>' + I('arrow-right', 'icon--sm') + '</a>' +
      '</div></div></section>';

    var card = $('.acc-card');
    function show(m) {
      $$('[data-form]', card).forEach(function (f) { f.hidden = f.getAttribute('data-form') !== m; });
      var tabs = $('.acc-tabs', card); tabs.hidden = !(m === 'login' || m === 'register');
      $$('[data-mode]', card).forEach(function (b) { b.setAttribute('aria-selected', b.getAttribute('data-mode') === m); });
      ink();
      var f = $('[data-form="' + m + '"] input', card); if (f) f.focus();
    }
    function ink() {
      var on = $('[data-mode][aria-selected="true"]', card), bar = $('.acc-tabs__ink', card);
      if (on && bar) { bar.style.width = on.offsetWidth + 'px'; bar.style.transform = 'translateX(' + on.offsetLeft + 'px)'; }
    }
    setTimeout(ink, 50); window.addEventListener('resize', ink);
    if (msg) { var mm = $('[data-form="' + mode + '"] [data-msg]', card); if (mm) { mm.textContent = msg; mm.className = 'acc-msg is-err'; } }

    card.addEventListener('click', function (ev) {
      var m = ev.target.closest('[data-mode]'); if (m) show(m.getAttribute('data-mode'));
      var g = ev.target.closest('[data-goto]'); if (g) show(g.getAttribute('data-goto'));
      var ey = ev.target.closest('[data-eye]');
      if (ey) { var inp = ey.parentNode.querySelector('input'); inp.type = inp.type === 'password' ? 'text' : 'password'; ey.classList.toggle('is-on', inp.type === 'text'); }
    });
    card.addEventListener('input', function (ev) {
      if (ev.target.name !== 'password') return;
      var meter = ev.target.form && ev.target.form.querySelector('[data-meter]'); if (!meter) return;
      var v = ev.target.value, sc = 0;
      if (v.length >= 8) sc++; if (/[A-Z]/.test(v) && /[a-z]/.test(v)) sc++; if (/\d/.test(v)) sc++; if (/[^A-Za-z0-9]/.test(v) || v.length >= 12) sc++;
      meter.setAttribute('data-s', v ? Math.max(1, sc) : 0);
      meter.querySelector('small').textContent = v ? t('strength')[Math.max(1, sc) - 1] : '';
    });

    function busy(f, on) { var b = $('.acc-go', f); if (b) { b.disabled = on; b.classList.toggle('is-busy', on); } }
    function say(f, text, ok) { var m = $('[data-msg]', f); m.textContent = text || ''; m.className = 'acc-msg' + (text ? (ok ? ' is-ok' : ' is-err') : ''); if (text && !ok) f.animate && f.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'translateX(0)' }], { duration: 300 }); }
    function done(token) {
      VV.acc.set(token);
      var n = next(); if (n) { location.href = n; return; }
      cabinet(true);
    }

    card.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var f = ev.target, kind = f.getAttribute('data-form'), d = Object.fromEntries(new FormData(f));
      say(f, '');
      if (kind === 'login') {
        if (!d.contact || !d.password) return say(f, t('fill'));
        busy(f, true);
        VV.acc.call('login', { contact: d.contact.trim(), password: d.password }).then(function (j) { done(j.token); }).catch(function (x) { say(f, x.message); }).finally(function () { busy(f, false); });
      } else if (kind === 'register') {
        if (!d.first_name || !d.email || !d.password) return say(f, t('fill'));
        if (d.password.length < 8) return say(f, t('pw_short'));
        if (d.password !== d.password2) return say(f, t('pw_mismatch'));
        if (!d.consent) return say(f, t('need_consent'));
        busy(f, true);
        VV.acc.call('register', { first_name: d.first_name, last_name: d.last_name, email: d.email.trim(), password: d.password, consent: true })
          .then(function (j) {
            if (j.token) return done(j.token);
            $('[data-sent]', card).innerHTML = t('sent_reg') + ' <b>' + e(j.email) + '</b>.<br>' + t('sent_reg2');
            show('sent');
          }).catch(function (x) { say(f, x.message); }).finally(function () { busy(f, false); });
      } else if (kind === 'forgot') {
        if (!d.email) return say(f, t('fill'));
        busy(f, true);
        VV.acc.call('forgot', { email: d.email.trim() }).then(function () { $('[data-sent]', card).textContent = t('sent_forgot'); show('sent'); })
          .catch(function (x) { say(f, x.message); }).finally(function () { busy(f, false); });
      } else if (kind === 'reset') {
        if (d.password.length < 8) return say(f, t('pw_short'));
        if (d.password !== d.password2) return say(f, t('pw_mismatch'));
        busy(f, true);
        VV.acc.call('reset', { access_token: accessToken, password: d.password }).then(function (j) { done(j.token); }).catch(function (x) { say(f, x.message); }).finally(function () { busy(f, false); });
      }
    });
    if (window.gsap) window.gsap.fromTo('.acc-card, .acc-auth__intro > *', { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .7, stagger: .06, ease: 'power3.out' });
    else $$('[data-anim]').forEach(function (x) { x.style.visibility = 'visible'; });
  }

  /* ================= cabinet ================= */
  var FLOW = ['new', 'accepted', 'preparing', 'ready', 'done'];
  /* დონე: LIBRA-დან (me.level_*), ან LIBRA-ს დონეების სიით ბრუნვიდან; ძველი ვერსიისთვის — სტანდარტული საფეხურები */
  function libraLevel(me, spent) {
    var L = (VV.data.settings.levels || []).slice().sort(function (a, b) { return a.from_tetri - b.from_tetri; });
    if (!me.level_name && !L.length) return null;
    var turn = me.turnover_tetri != null ? me.turnover_tetri / 100 : spent;
    var i = 0; while (i < L.length - 1 && turn >= L[i + 1].from_tetri / 100) i++;
    var cur = L[i] || { name: me.level_name, from_tetri: 0, color: me.level_color };
    var next = me.next_level_name ? { name: me.next_level_name, from_tetri: me.next_level_from } : L[i + 1];
    var from = (cur.from_tetri || 0) / 100, to = next ? next.from_tetri / 100 : 0;
    return { i: Math.min(i, 3), name: me.level_name || cur.name, color: me.level_color || cur.color, ladder: L,
      pct: next ? Math.max(3, Math.min(100, Math.round((turn - from) / Math.max(to - from, 1) * 100))) : 100,
      next: next ? next.name : '', left: next ? Math.max(0, to - turn) : 0, turnover: turn };
  }
  function level(spent) {
    var steps = [0, 200, 500, 1500], i = 0;
    while (i < 3 && spent >= steps[i + 1]) i++;
    var pct = i === 3 ? 100 : Math.round((spent - steps[i]) / (steps[i + 1] - steps[i]) * 100);
    return { i: i, name: t('lvl')[i], pct: pct, next: i < 3 ? t('lvl')[i + 1] : '', left: i < 3 ? steps[i + 1] - spent : 0 };
  }
  function orderHtml(o, open) {
    var flow = o.delivery === 'courier' ? ['new', 'accepted', 'preparing', 'delivering', 'done'] : FLOW;
    var idx = flow.indexOf(o.status), cancelled = o.status === 'cancelled';
    var items = (o.items || []).map(function (it) {
      return '<li><img src="' + e(it.image_url || (VV.product(it.product_id) ? VV.img(VV.product(it.product_id)) : '')) + '" alt="" loading="lazy"><span>' + e(it.name) + '<small>' + it.qty + ' × ' + GEL(it.price_tetri) + '</small></span><b>' + GEL(it.amount_tetri) + '</b></li>';
    }).join('');
    return '<details class="cab-order' + (cancelled ? ' is-cancelled' : '') + '"' + (open ? ' open' : '') + ' data-order="' + e(o.id) + '"><summary><span class="cab-order__no">' + e(o.number) + '</span><span class="cab-order__date">' + fdate(o.created_at) + '</span>' +
      '<span class="cab-pill cab-pill--' + e(o.status) + '">' + t('st_' + o.status) + '</span><b class="cab-order__sum">' + GEL(o.total_tetri) + '</b>' + I('chevron-down', 'icon--sm') + '</summary>' +
      (cancelled ? '' : '<ol class="cab-flow">' + flow.map(function (s, i) { return '<li class="' + (i < idx ? 'is-done' : i === idx ? 'is-now' : '') + '"><i></i><span>' + t('st_' + s) + '</span></li>'; }).join('') + '</ol>') +
      (o.status_note ? '<p class="cab-order__note">' + I('spark', 'icon--sm') + ' ' + e(o.status_note) + '</p>' : '') +
      '<ul class="cab-items">' + items + '</ul>' +
      '<dl class="cab-tot"><dt>' + t('subtotal') + '</dt><dd>' + GEL(o.subtotal_tetri) + '</dd><dt>' + t('delivery') + ' · ' + t(o.delivery) + '</dt><dd>' + GEL(o.delivery_tetri) + '</dd>' +
      (o.cashback_tetri ? '<dt>' + t('cashback_used') + '</dt><dd class="ok">−' + GEL(o.cashback_tetri) + '</dd>' : '') + '<dt class="big">' + t('total') + '</dt><dd class="big">' + GEL(o.total_tetri) + '</dd></dl>' +
      (o.address ? '<p class="cab-order__addr">' + I('pin', 'icon--sm') + ' ' + e(o.address) + '</p>' : '') +
      '<div class="cab-order__acts">' +
        (o.payment === 'transfer' && ['done', 'cancelled'].indexOf(o.status) < 0 ? (o.proof_at ? '<span class="cab-ok">' + I('check', 'icon--sm') + ' ' + t('proof_done') + '</span>' : '<label class="btn btn--ghost btn--sm">' + I('upload', 'icon--sm') + ' ' + t('proof_up') + '<input type="file" hidden accept="image/jpeg,image/png,image/webp,application/pdf" data-proof="' + e(o.id) + '"></label><small class="cab-proof-msg"></small>') : '') +
        (o.status === 'new' ? '<button type="button" class="btn btn--ghost btn--sm cab-cancel" data-cancel="' + e(o.id) + '">' + t('cancel') + '</button>' : '') +
      '</div></details>';
  }
  function cardHtml(me) {
    var reserved = (me.bonus_tetri || 0) - (me.available_tetri || 0);
    return '<div class="vcard" data-tilt><div class="vcard__top"><img src="/assets/img/brand/logo.webp" alt="VIVACHE"><span>ქეშბექ ბარათი<br><b>CASHBACK CARD</b></span></div>' +
      '<div class="vcard__bal"><small>' + t('available') + '</small><b>' + GEL(me.available_tetri) + '</b>' + (reserved > 0 ? '<em>' + t('reserved') + ': ' + GEL(reserved) + '</em>' : '') + '</div>' +
      (me.card_code ? '<div class="vcard__code">' + barcode(me.card_code) + '</div>' : '<p class="vcard__none">' + t('card_none') + '</p>') +
      (me.earn_pct ? '<span class="vcard__pct">' + Number(me.earn_pct) + '%</span>' : '') + '<span class="vcard__shine"></span></div>';
  }

  function cabinet(welcome, tab) {
    var main = document.getElementById('main');
    main.innerHTML = '<div class="page-loader"><div class="page-loader__dots"><i style="--c:#FF3D7F;--i:0"></i><i style="--c:#FFB020;--i:1"></i><i style="--c:#2F6BFF;--i:2"></i><i style="--c:#22C55E;--i:3"></i></div></div>';
    VV.acc.me(true).then(function (me) {
      if (!me) return authView('login');
      VV.acc.badge(me);
      var orders = me.orders || [], receipts = me.receipts || [], moves = me.moves || [];
      var spent = (receipts.reduce(function (s, r) { return s + Math.max(0, r.total_tetri); }, 0) + orders.filter(function (o) { return o.status === 'done'; }).reduce(function (s, o) { return s + o.total_tetri; }, 0)) / 100;
      var active = orders.filter(function (o) { return ['done', 'cancelled'].indexOf(o.status) < 0; }).length;
      if (me.turnover_tetri != null && me.level_name) spent = me.turnover_tetri / 100;      // LIBRA-ს მთლიანი ბრუნვა (მაღაზია + საიტი)
      var lv = libraLevel(me, spent) || level(spent), name = me.full_name || me.username || '';
      var ini = String(name || 'V').trim().split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
      tab = tab || VV.qs('tab') || 'overview';
      var c = VV.data.settings.contact || {};
      var wa = c.whatsapp ? 'https://wa.me/' + String(c.whatsapp).replace(/\D/g, '') : '/contact';

      main.innerHTML = '<section class="cab"><div class="cab-hero"><div class="cab-hero__art" aria-hidden="true"><i class="b1"></i><i class="b2"></i><i class="b3"></i>' +
          '<svg class="cab-hero__wave" viewBox="0 0 1440 120" preserveAspectRatio="none"><path d="M0 70c180-50 360-50 540 0s360 50 540 0 270-40 360-20v70H0z"/></svg>' +
          '<span class="cab-hero__sw s1"></span><span class="cab-hero__sw s2"></span><span class="cab-hero__sw s3"></span><span class="cab-hero__sw s4"></span><span class="cab-hero__sw s5"></span></div>' +
        '<div class="wrap cab-hero__in"><div class="cab-ava"><span>' + e(ini) + '</span><i class="cab-ava__ring"></i></div>' +
          '<div class="cab-hero__who"><nav class="crumbs crumbs--light"><a href="/">' + VV.t('home') + '</a> <span>/</span> <b>' + t('title') + '</b></nav>' +
          '<h1 class="cab-hello"><small>' + t('hello') + '</small> ' + e(name) + '</h1>' +
          '<div class="cab-badges"><span class="cab-level cab-level--' + lv.i + '"' + (lv.color ? ' style="background:' + e(lv.color) + ';color:#fff"' : '') + '>★ ' + e(lv.name) + '</span>' + (me.earn_pct ? '<span class="cab-since">' + t('since') + ' ' + Number(me.earn_pct) + '%</span>' : '') + (me.card_code ? '<span class="cab-since">' + I('card', 'icon--sm') + ' ' + e(me.card_code) + '</span>' : '') + '</div>' +
          '<div class="cab-progress"><i style="--p:' + lv.pct + '%"></i><small>' + (lv.next ? lv.next + ' — ' + VV.money(lv.left) + ' ' + t('lvl_next') : t('lvl_top')) + '</small></div>' +
          (lv.ladder && lv.ladder.length ? '<div class="cab-ladder">' + lv.ladder.map(function (x) { var on = x.name === lv.name; return '<span class="cab-step' + (on ? ' is-on' : '') + '" style="--c:' + e(x.color || '#fff') + '"><b>' + e(x.name) + '</b><small>' + VV.money(x.from_tetri / 100) + '+ · ' + Number(x.earn_pct) + '%</small></span>'; }).join('') + '</div>' : '') + '</div>' +
          '<button class="btn btn--ghost btn--sm cab-out" type="button" data-logout>' + I('logout', 'icon--sm') + ' ' + t('logout') + '</button></div></div>' +
        '<div class="wrap">' + (welcome ? '<div class="cab-toast is-ok">🎉 ' + t('welcome') + '</div>' : '') +
          '<div class="cab-stats">' +
            '<div class="cab-stat" style="--c:#FF3D7F">' + I('cart') + '<strong data-count="' + orders.length + '">' + orders.length + '</strong><span>' + t('stat_orders') + '</span></div>' +
            '<div class="cab-stat" style="--c:#22C55E">' + I('card') + '<strong>' + Math.round(spent) + ' ₾</strong><span>' + t('stat_spent') + '</span></div>' +
            '<div class="cab-stat" style="--c:#2F6BFF">' + I('truck') + '<strong data-count="' + active + '">' + active + '</strong><span>' + t('stat_active') + '</span></div>' +
            '<div class="cab-stat cab-stat--cb" style="--c:#FFB020">' + I('spark') + '<strong>' + GEL(me.available_tetri) + '</strong><span>' + t('stat_cb') + '</span></div></div>' +
          '<nav class="cab-tabs" role="tablist">' + [['overview', 'user'], ['orders', 'truck'], ['cashback', 'card'], ['settings', 'filter']].map(function (x) {
            return '<button type="button" role="tab" data-tab="' + x[0] + '" aria-selected="' + (tab === x[0]) + '">' + I(x[1], 'icon--sm') + ' ' + t('tab_' + x[0]) + (x[0] === 'orders' && orders.length ? ' <em>' + orders.length + '</em>' : '') + '</button>';
          }).join('') + '<span class="cab-tabs__ink"></span></nav>' +

          // overview
          '<div class="cab-pane" data-pane="overview"' + (tab === 'overview' ? '' : ' hidden') + '><div class="cab-grid"><div class="cab-main">' +
            '<div class="cab-quick"><a href="/shop" style="--c:#FF3D7F">' + I('cart') + '<span>' + t('q_catalog') + '</span></a><a href="/wishlist" style="--c:#8B5CF6">' + I('heart') + '<span>' + t('q_wish') + '</span></a>' +
            '<a href="/shop?sale=1" style="--c:#FFB020">' + I('spark') + '<span>' + t('q_sale') + '</span></a><a href="' + e(wa) + '"' + (c.whatsapp ? ' target="_blank" rel="noopener"' : '') + ' style="--c:#22C55E">' + I(c.whatsapp ? 'whatsapp' : 'phone') + '<span>' + (c.whatsapp ? 'WhatsApp' : t('q_contact')) + '</span></a></div>' +
            '<div class="cab-block"><div class="cab-block__head"><h2>' + t('last_orders') + '</h2>' + (orders.length > 3 ? '<button type="button" class="acc-link" data-tab="orders">' + t('all_orders') + ' →</button>' : '') + '</div>' +
            (orders.length ? orders.slice(0, 3).map(function (o, i) { return orderHtml(o, i === 0); }).join('') : '<div class="cab-empty"><span class="cab-empty__art"><i></i><i></i><i></i></span><p>' + t('no_orders') + '</p><a class="btn btn--accent" href="/shop">' + t('shop') + ' ' + I('arrow-right', 'icon--sm') + '</a></div>') + '</div></div>' +
            '<aside class="cab-side"><h3>' + t('card') + '</h3>' + cardHtml(me) + '</aside></div></div>' +

          // orders
          '<div class="cab-pane" data-pane="orders"' + (tab === 'orders' ? '' : ' hidden') + '>' + (orders.length ? orders.map(function (o, i) { return orderHtml(o, i === 0); }).join('') : '<div class="cab-empty"><span class="cab-empty__art"><i></i><i></i><i></i></span><p>' + t('no_orders') + '</p><a class="btn btn--accent" href="/shop">' + t('shop') + '</a></div>') + '</div>' +

          // cashback & receipts
          '<div class="cab-pane" data-pane="cashback"' + (tab === 'cashback' ? '' : ' hidden') + '><div class="cab-grid"><div class="cab-main">' +
            '<div class="cab-block"><div class="cab-block__head"><h2>' + t('moves') + '</h2></div>' + (moves.length ? '<ul class="cab-moves">' + moves.map(function (m) {
              var plus = m.amount > 0;
              return '<li class="' + (plus ? 'is-plus' : 'is-minus') + '"><i>' + (plus ? '+' : '−') + '</i><span>' + e(m.note || (plus ? '+' : '')) + '<small>' + fdate(m.at) + '</small></span><b>' + (plus ? '+' : '−') + GEL(Math.abs(m.amount)) + '</b></li>';
            }).join('') + '</ul>' : '<p class="muted">' + t('no_moves') + '</p>') + '</div>' +
            '<div class="cab-block"><div class="cab-block__head"><h2>' + t('receipts') + '</h2></div>' + (receipts.length ? receipts.map(function (r) {
              return '<details class="cab-order"><summary><span class="cab-order__no">' + I('file', 'icon--sm') + ' ' + e(r.number || '') + '</span><span class="cab-order__date">' + fdate(r.at) + '</span><b class="cab-order__sum">' + GEL(r.total_tetri) + '</b>' + I('chevron-down', 'icon--sm') + '</summary>' +
                '<ul class="cab-items">' + (r.items || []).map(function (it) { return '<li><span>' + e(it.name) + '<small>× ' + it.qty + '</small></span><b>' + GEL(it.amount) + '</b></li>'; }).join('') + '</ul></details>';
            }).join('') : '<p class="muted">' + t('no_receipts') + '</p>') + '</div></div>' +
            '<aside class="cab-side"><h3>' + t('card') + '</h3>' + cardHtml(me) + '</aside></div></div>' +

          // settings
          '<div class="cab-pane" data-pane="settings"' + (tab === 'settings' ? '' : ' hidden') + '><div class="cab-settings">' +
            '<form class="cab-card" data-set="profile"><h3>' + I('user', 'icon--sm') + ' ' + t('name') + '</h3><label class="field"><input name="name" value="' + e(me.full_name || '') + '" maxlength="120"></label><button class="btn btn--accent btn--sm">' + t('save') + '</button><small class="cab-set-msg"></small></form>' +
            '<form class="cab-card" data-set="phone"><h3>' + I('phone', 'icon--sm') + ' ' + t('phone') + '</h3><label class="field"><input name="phone" type="tel" value="' + e((me.phone || '').replace('+995', '')) + '" placeholder="5XX XX XX XX"></label><button class="btn btn--accent btn--sm">' + t('save') + '</button><small class="cab-set-msg"></small></form>' +
            (me.username ? '<form class="cab-card" data-set="password"><h3>' + I('eye', 'icon--sm') + ' ' + t('change_pw') + ' <small class="muted">(' + t('login_name') + ': ' + e(me.username) + ')</small></h3><div class="row2"><label class="field"><span>' + t('old_pw') + '</span><input name="old" type="password" autocomplete="current-password"></label><label class="field"><span>' + t('new_password') + '</span><input name="new" type="password" autocomplete="new-password"></label></div><button class="btn btn--accent btn--sm">' + t('save') + '</button><small class="cab-set-msg"></small></form>'
              : '<div class="cab-card"><h3>' + I('eye', 'icon--sm') + ' ' + t('change_pw') + '</h3><p class="muted">' + t('pw_email') + '</p><button type="button" class="btn btn--ghost btn--sm" data-reset>' + t('send_reset') + '</button></div>') +
            '<div class="cab-card cab-card--out"><button class="btn btn--ghost" type="button" data-logout>' + I('logout', 'icon--sm') + ' ' + t('logout') + '</button></div>' +
          '</div></div>' +
        '</div></section>';

      var root = $('.cab');
      function inkMove() { var on = $('[data-tab][aria-selected="true"]', root), bar = $('.cab-tabs__ink', root); if (on && bar) { bar.style.width = on.offsetWidth + 'px'; bar.style.transform = 'translateX(' + on.offsetLeft + 'px)'; } }
      setTimeout(inkMove, 50); window.addEventListener('resize', inkMove);
      function setTab(k) {
        $$('.cab-tabs [data-tab]', root).forEach(function (b) { b.setAttribute('aria-selected', b.getAttribute('data-tab') === k); });
        $$('[data-pane]', root).forEach(function (p) { p.hidden = p.getAttribute('data-pane') !== k; });
        inkMove(); history.replaceState(null, '', '/account' + (k === 'overview' ? '' : '?tab=' + k));
      }
      root.addEventListener('click', function (ev) {
        var tb = ev.target.closest('[data-tab]'); if (tb) { setTab(tb.getAttribute('data-tab')); return; }
        if (ev.target.closest('[data-logout]')) { VV.acc.call('logout').finally(function () { VV.acc.set(''); location.href = '/account'; }); return; }
        if (ev.target.closest('[data-reset]')) { VV.acc.set(''); authView('forgot'); return; }
        var cn = ev.target.closest('[data-cancel]');
        if (cn && confirm(t('cancel_q'))) VV.acc.call('cancel', { id: cn.getAttribute('data-cancel') }).then(function () { VV.toast(t('cancelled')); cabinet(false, 'orders'); }).catch(function (x) { VV.toast(x.message, true); });
      });
      root.addEventListener('change', function (ev) {
        var pf = ev.target.closest('[data-proof]'); if (!pf) return;
        VV.uploadProof(pf.getAttribute('data-proof'), pf.files[0], pf.closest('.cab-order__acts').querySelector('.cab-proof-msg'));
      });
      root.addEventListener('submit', function (ev) {
        ev.preventDefault();
        var f = ev.target, kind = f.getAttribute('data-set'), d = Object.fromEntries(new FormData(f)), msg = $('.cab-set-msg', f);
        var call = kind === 'profile' ? VV.acc.call('profile', { name: d.name }) : kind === 'phone' ? VV.acc.call('phone', { phone: d.phone }) : VV.acc.call('password', { old: d.old, new: d.new });
        msg.textContent = '…';
        call.then(function () { msg.textContent = '✓ ' + t('saved'); msg.className = 'cab-set-msg is-ok'; sessionStorage.removeItem('vv_me'); if (kind === 'password') f.reset(); })
          .catch(function (x) { msg.textContent = x.message; msg.className = 'cab-set-msg is-err'; });
      });
      if (welcome) { var r = $('.cab-hello').getBoundingClientRect(); setTimeout(function () { VV.confetti(r.left + 120, r.top + 20, 40); }, 300); }
      if (window.gsap) {
        window.gsap.fromTo('.cab-hero__in > *, .cab-stat, .cab-tabs', { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .6, stagger: .05, ease: 'power3.out' });
        $$('.vcard').forEach(function (el) {
          el.addEventListener('pointermove', function (ev) { var b = el.getBoundingClientRect(); el.style.transform = 'perspective(900px) rotateY(' + ((ev.clientX - b.left) / b.width - .5) * 14 + 'deg) rotateX(' + -((ev.clientY - b.top) / b.height - .5) * 10 + 'deg)'; });
          el.addEventListener('pointerleave', function () { el.style.transform = ''; });
        });
      }
    });
  }
})();
