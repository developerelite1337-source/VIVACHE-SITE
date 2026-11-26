// FAKE Supabase for local testing of LIBRA mode (no real keys needed): npm run local:libra
// Mimics what buhpro/cloud/supabase.sql + LIBRA FINANCE provide: tables shop_settings / categories / products / orders,
// vv_* functions (login, email session, me, place_order, cancel, proof …) and Supabase Auth (signup, token, recover, user).
// Test account (as if LIBRA assigned it):  login "demo" · password "demo1234" · cashback card 8859450163099.
// Email sign-ups are confirmed by opening  http://localhost:54321/fake/confirm?email=…  (prints the link in the console).
import http from 'node:http';
import { randomUUID, randomBytes } from 'node:crypto';

const PORT = +process.env.FAKE_SUPABASE_PORT || 54321;
const now = () => new Date().toISOString();
const U = () => randomUUID();

/* ---------- LIBRA data ---------- */
const cat = (name, parent, sort) => ({ id: U(), name, parent_id: parent, sort, active: true });
const C = {};
C.st = cat('საკანცელარიო', null, 1); C.nb = cat('რვეულები და ბლოკნოტები', C.st.id, 1); C.pen = cat('კალმები და ფანქრები', C.st.id, 2); C.bag = cat('სასკოლო ჩანთები', C.st.id, 3); C.art = cat('ხატვის ნივთები', C.st.id, 4);
C.bk = cat('წიგნები', null, 2); C.kb = cat('საბავშვო წიგნები', C.bk.id, 1); C.tb = cat('სახელმძღვანელოები', C.bk.id, 2);
C.ty = cat('სათამაშოები', null, 3); C.pl = cat('რბილი სათამაშოები', C.ty.id, 1); C.co = cat('კონსტრუქტორები და თავსატეხები', C.ty.id, 2); C.car = cat('მანქანები', C.ty.id, 3);
C.gf = cat('სასაჩუქრე', null, 4); C.gs = cat('სასაჩუქრე ნაკრებები', C.gf.id, 1); C.dc = cat('დეკორი', C.gf.id, 2);
C.ny = cat('საახალწლო', null, 5); C.nt = cat('ნაძვის სათამაშოები', C.ny.id, 1);
const categories = Object.values(C);

const img = (n) => `/assets/img/seed/${n}.svg`;
const prod = (name, c, price, image, extra = {}) => ({ id: U(), code: 'LB' + Math.floor(1000 + Math.random() * 8999), name, description: extra.d || 'ხარისხიანი პროდუქცია VIVACHE-დან.\nიდეალურია ყოველდღიური გამოყენებისთვის.', category_id: c.id, unit: 'ცალი', price_tetri: Math.round(price * 100), in_stock: extra.out ? false : true, image_url: img(image), allow_cashback: true, active: true, popularity: extra.pop || Math.floor(Math.random() * 40), updated_at: now() });
const products = [
  prod('რვეული A5 · 48 ფურცელი', C.nb, 2.5, 'notebook', { pop: 120 }), prod('წებოვანი ფურცლები · ნეონი', C.nb, 3.2, 'sticky', { pop: 60 }),
  prod('ფერადი ფანქრები · 24 ფერი', C.pen, 12.9, 'pencils', { pop: 95 }), prod('გელის კალმები · 12 ცალი', C.pen, 9.5, 'pens', { pop: 70 }),
  prod('ზურგჩანთა „კოსმოსი“', C.bag, 79, 'backpack', { pop: 50 }), prod('აკვარელის ნაკრები', C.art, 15.9, 'paints', { pop: 44 }),
  prod('ზღაპრები ძილის წინ', C.kb, 22, 'book-kids', { pop: 80 }), prod('ინგლისური ბავშვებისთვის', C.tb, 14.5, 'book-learn', { pop: 30 }),
  prod('რომანების კოლექცია', C.bk, 49, 'books', { pop: 20 }), prod('რბილი დათუნია 40 სმ', C.pl, 39, 'teddy', { pop: 110 }),
  prod('კონსტრუქტორი 250 დეტალი', C.co, 59, 'blocks', { pop: 66 }), prod('თავსატეხი 500 ნაწილი', C.co, 24, 'puzzle', { pop: 25 }),
  prod('რადიომართვადი მანქანა', C.car, 69, 'car', { pop: 58 }), prod('სასაჩუქრე ყუთი', C.gs, 35, 'giftbox', { pop: 40 }),
  prod('კერამიკული ფინჯანი', C.dc, 17.9, 'mug', { pop: 15, out: true }), prod('ბუშტების ნაკრები', C.nt, 8.9, 'balloons', { pop: 35 }),
  prod('სათამაშო რაკეტა', C.ty, 29, 'rocket', { pop: 33 }), prod('სანთელი · ვანილი', C.dc, 19, 'candle', { pop: 12 }),
];
const shop_settings = [
  { key: 'shop', value: { name: 'VIVACHE', phone: '+995 599 00 00 00', whatsapp: '995599000000', address: 'ბათუმი', hours: 'ორშ–კვ · 10:00–20:00', map_url: '' }, is_public: true },
  { key: 'delivery', value: { courier: true, pickup: true, fee_tetri: 500, free_from_tetri: 5000, min_order_tetri: 0, note: '' }, is_public: true },
  { key: 'guest_orders', value: true, is_public: true },
  { key: 'levels', value: [{ name: 'სტარტი', from_tetri: 0, earn_pct: 3, color: '#22C55E' }, { name: 'ვერცხლი', from_tetri: 50000, earn_pct: 4, color: '#94A3B8' }, { name: 'ოქრო', from_tetri: 150000, earn_pct: 5, color: '#F59E0B' }, { name: 'ბრილიანტი', from_tetri: 400000, earn_pct: 7, color: '#8B5CF6' }], is_public: true },
  { key: 'payment', value: { cash: true, transfer: true, card: false, iban: 'GE00TB0000000000000000', bank: 'თიბისი', recipient: 'შპს ვივაჩე' }, is_public: true },
];

/* ---------- customers / auth ---------- */
const demoId = U();
const customers = [{ id: demoId, username: 'demo', password: 'demo1234', email: null, auth_user_id: null, phone: '+995599123456', full_name: 'ნინო ბერიძე', card_code: '8859450163099', bonus_tetri: 1250, earn_pct: 5, max_redeem_pct: 50, status: 'active', created_at: now(), level_name: 'ვერცხლი', level_color: '#94A3B8', turnover_tetri: 82000, next_level_name: 'ოქრო', next_level_from: 150000 }];
const moves = [{ customer_id: demoId, at: now(), kind: 'earn', amount: 450, note: 'ჩეკი 000123' }, { customer_id: demoId, at: now(), kind: 'earn', amount: 800, note: 'ჩეკი 000101' }];
const receipts = [{ customer_id: demoId, number: '000123', at: now(), total_tetri: 9000, items: [{ name: 'ფერადი ფანქრები', qty: 2, amount: 2580 }, { name: 'რვეული A5', qty: 4, amount: 1000 }] }];
const users = []; // Supabase Auth users {id, email, password, meta, confirmed}
const sessions = new Map(); // token → customer_id
const orders = [];
const proofs = [];
let orderNo = 1;

const err = (msg, code = 'P0001', status = 400) => { const e = new Error(msg); e.code = code; e.status = status; throw e; };
const session = (t) => sessions.get(t) || null;
const newSession = (cid) => { const t = randomBytes(32).toString('hex'); sessions.set(t, cid); return t; };
const normPhone = (p) => { let d = String(p || '').replace(/\D/g, ''); if (d.startsWith('995')) d = d.slice(3); d = d.replace(/^0/, ''); if (!/^5\d{8}$/.test(d)) err('ტელეფონის ნომერი არასწორია (მაგ. 5XX XX XX XX)'); return '+995' + d; };
const available = (c) => Math.max(0, c.bonus_tetri - orders.filter((o) => o.customer_id === c.id && !o.cashback_settled && o.status !== 'cancelled').reduce((s, o) => s + o.cashback_tetri, 0));
const setting = (k) => shop_settings.find((s) => s.key === k)?.value;

const RPC = {
  vv_login({ p_username, p_password }) {
    const c = customers.find((x) => x.username === String(p_username || '').trim().toLowerCase());
    if (!c || c.password !== p_password) return { error: 'მომხმარებელი ან პაროლი არასწორია' };
    return { token: newSession(c.id) };
  },
  vv_email_session(_, authUser) {
    if (!authUser || !authUser.confirmed) err('ელფოსტა ჯერ არ არის დადასტურებული', 'P0002');
    const c = customers.find((x) => x.auth_user_id === authUser.id);
    return { token: newSession(c.id) };
  },
  vv_me({ p_token }) {
    const cid = session(p_token); if (!cid) err('შესვლა საჭიროა', 'P0002');
    const c = customers.find((x) => x.id === cid);
    return {
      phone: c.phone, full_name: c.full_name, card_code: c.card_code, status: c.status, bonus_tetri: c.bonus_tetri, available_tetri: available(c),
      earn_pct: c.earn_pct, max_redeem_pct: c.max_redeem_pct, username: c.username,
      level_name: c.level_name ?? null, level_color: c.level_color ?? null, turnover_tetri: c.turnover_tetri ?? 0, next_level_name: c.next_level_name ?? null, next_level_from: c.next_level_from ?? null,
      moves: moves.filter((m) => m.customer_id === cid), receipts: receipts.filter((r) => r.customer_id === cid),
      orders: orders.filter((o) => o.customer_id === cid).slice().reverse().map(({ imported, cashback_settled, customer_id, ...o }) => o),
    };
  },
  vv_update_profile({ p_token, p_name }) { const cid = session(p_token); if (!cid) err('შესვლა საჭიროა', 'P0002'); customers.find((x) => x.id === cid).full_name = p_name || null; return null; },
  vv_update_phone({ p_token, p_phone }) { const cid = session(p_token); if (!cid) err('შესვლა საჭიროა', 'P0002'); customers.find((x) => x.id === cid).phone = normPhone(p_phone); return null; },
  vv_change_password({ p_token, p_old, p_new }) {
    const cid = session(p_token); if (!cid) err('შესვლა საჭიროა', 'P0002');
    const c = customers.find((x) => x.id === cid);
    if (c.password !== p_old) err('ძველი პაროლი არასწორია');
    if (String(p_new || '').length < 6) err('ახალი პაროლი — მინიმუმ 6 სიმბოლო');
    c.password = p_new; return null;
  },
  vv_logout({ p_token }) { sessions.delete(p_token); return null; },
  vv_place_order({ p_token, p_items, p_delivery, p_address, p_comment, p_use_cashback, p_name, p_phone, p_payment = 'cash' }) {
    const pay = setting('payment'), d = setting('delivery');
    if (!pay[p_payment]) err('გადახდის ეს ხერხი ახლა მიუწვდომელია');
    if (!Array.isArray(p_items) || !p_items.length) err('კალათა ცარიელია');
    if (!['courier', 'pickup'].includes(p_delivery) || !d[p_delivery]) err('მიწოდების ეს ტიპი ახლა მიუწვდომელია');
    if (p_delivery === 'courier' && String(p_address || '').trim().length < 5) err('მიუთითე მიწოდების მისამართი');
    const cid = session(p_token); let c = null, ph, nm;
    if (cid) { c = customers.find((x) => x.id === cid); ph = p_phone ? normPhone(p_phone) : c.phone; if (!ph) err('მიუთითე საკონტაქტო ტელეფონი'); if (p_phone) c.phone = ph; nm = (p_name || '').trim() || c.full_name; }
    else { if (setting('guest_orders') !== true) err('შეკვეთისთვის შედი შენს ანგარიშზე', 'P0002'); ph = normPhone(p_phone); nm = (p_name || '').trim(); }
    if (!nm) err('მიუთითე სახელი');
    let sub = 0; const lines = [];
    for (const it of p_items) {
      const p = products.find((x) => x.id === it.product_id && x.active);
      if (!p) err('ერთ-ერთი პროდუქტი აღარ იყიდება — განაახლე კალათა');
      if (!p.in_stock) err(`„${p.name}“ ამჟამად არ არის მარაგში`);
      lines.push({ product_id: p.id, name: p.name, price_tetri: p.price_tetri, qty: it.qty, amount_tetri: p.price_tetri * it.qty, image_url: p.image_url });
      sub += p.price_tetri * it.qty;
    }
    const fee = p_delivery === 'courier' && sub < (d.free_from_tetri || 0) ? d.fee_tetri : 0;
    let cb = 0;
    if (p_use_cashback > 0) { if (!c) err('ქეშბექის გამოსაყენებლად შედი ანგარიშზე'); cb = Math.min(p_use_cashback, available(c), Math.floor(sub * c.max_redeem_pct / 100), sub); }
    const o = { id: U(), number: 'V-' + String(orderNo++).padStart(5, '0'), customer_id: cid, phone: ph, full_name: nm, items: lines, subtotal_tetri: sub, delivery_tetri: fee, cashback_tetri: cb, total_tetri: sub + fee - cb, delivery: p_delivery, address: p_delivery === 'courier' ? p_address : null, comment: p_comment, payment: p_payment, status: 'new', status_note: null, imported: false, cashback_settled: false, proof_at: null, created_at: now(), updated_at: now() };
    orders.push(o);
    console.log(`[fake-supabase] new order ${o.number} ${(o.total_tetri / 100).toFixed(2)} ₾ (${nm}) — LIBRA would download it now`);
    return { id: o.id, number: o.number, total_tetri: o.total_tetri, cashback_tetri: cb, delivery_tetri: fee, subtotal_tetri: sub };
  },
  vv_order({ p_token, p_id }) { const o = orders.find((x) => x.id === p_id && x.customer_id === session(p_token)); return o || null; },
  vv_cancel_order({ p_token, p_id }) {
    const o = orders.find((x) => x.id === p_id && x.customer_id === session(p_token) && x.status === 'new');
    if (!o) err('შეკვეთა უკვე მიღებულია — გასაუქმებლად დაგვირეკე');
    o.status = 'cancelled'; o.status_note = 'გააუქმა მყიდველმა'; o.updated_at = now(); return null;
  },
  vv_upload_proof({ p_token, p_order, p_data, p_mime }) {
    const o = orders.find((x) => x.id === p_order && x.customer_id === session(p_token));
    if (!o) err('შეკვეთა ვერ მოიძებნა'); if (o.payment !== 'transfer') err('ქვითარი საჭიროა მხოლოდ გადმორიცხვისას');
    if (!['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(p_mime)) err('ფაილი: ფოტო (JPG, PNG) ან PDF');
    if ((p_data || '').length * 0.75 < 100) err('ფაილი ცარიელია ან დაზიანებულია');
    proofs.push({ order_id: p_order, mime: p_mime }); o.proof_at = now(); return { ok: true };
  },
};

/* ---------- HTTP ---------- */
const send = (res, status, data) => { res.writeHead(status, { 'content-type': 'application/json', 'access-control-allow-origin': '*' }); res.end(data === undefined ? '' : JSON.stringify(data)); };
const authUserFrom = (req) => { const t = (req.headers.authorization || '').replace('Bearer ', ''); return users.find((u) => 'at-' + u.id === t) || null; };

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const chunks = []; for await (const c of req) chunks.push(c);
  let body = {}; try { body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {}; } catch { /* */ }
  const p = url.pathname, q = url.searchParams;
  try {
    if (p === '/fake/confirm') {
      const u = users.find((x) => x.email === q.get('email')); if (!u) return send(res, 404, { error: 'no user' });
      u.confirmed = true; customers.find((c) => c.auth_user_id === u.id).email_confirmed = true;
      return send(res, 200, { ok: true, access_token: 'at-' + u.id, redirect: `${u.redirect || ''}#access_token=at-${u.id}&type=signup` });
    }
    if (p === '/auth/v1/signup' && req.method === 'POST') {
      const email = String(body.email || '').toLowerCase();
      if (users.some((u) => u.email === email)) return send(res, 200, { id: U(), email }); // like Supabase: no enumeration
      if (String(body.password || '').length < 6) return send(res, 422, { msg: 'Password should be at least 6 characters' });
      if (!body.data?.consent) return send(res, 500, { msg: 'რეგისტრაციისთვის პერსონალური მონაცემების თანხმობა საჭიროა' });
      const u = { id: U(), email, password: body.password, meta: body.data || {}, confirmed: false, redirect: q.get('redirect_to') };
      users.push(u);
      const match = customers.find((c) => (c.email || '').toLowerCase() === email && !c.auth_user_id);
      if (match) Object.assign(match, { auth_user_id: u.id }); else customers.push({ id: u.id, auth_user_id: u.id, email, full_name: u.meta.full_name || null, phone: null, card_code: null, bonus_tetri: 0, earn_pct: 0, max_redeem_pct: 100, status: 'active', created_at: now() });
      console.log(`[fake-supabase] confirm e-mail: http://localhost:${PORT}/fake/confirm?email=${encodeURIComponent(email)}`);
      return send(res, 200, { id: u.id, email, confirmation_sent_at: now() });
    }
    if (p === '/auth/v1/token' && q.get('grant_type') === 'password') {
      const u = users.find((x) => x.email === String(body.email || '').toLowerCase());
      if (!u || u.password !== body.password) return send(res, 400, { error: 'invalid_grant', error_description: 'Invalid login credentials' });
      if (!u.confirmed) return send(res, 400, { error: 'invalid_grant', error_description: 'Email not confirmed' });
      return send(res, 200, { access_token: 'at-' + u.id, token_type: 'bearer', user: { id: u.id, email: u.email } });
    }
    if (p === '/auth/v1/recover') { console.log('[fake-supabase] recovery e-mail to', body.email); return send(res, 200, {}); }
    if (p === '/auth/v1/user' && req.method === 'PUT') { const u = authUserFrom(req); if (!u) return send(res, 401, { msg: 'invalid token' }); u.password = body.password; u.confirmed = true; return send(res, 200, { id: u.id }); }

    if (p.startsWith('/rest/v1/rpc/')) {
      const fn = RPC[p.slice(13)]; if (!fn) return send(res, 404, { message: 'function not found' });
      return send(res, 200, fn(body, authUserFrom(req)));
    }
    if (p.startsWith('/rest/v1/')) {
      const table = p.slice(9);
      const service = (req.headers.apikey || '') === 'fake-service-key';
      let rows = { shop_settings, categories: categories.filter((c) => c.active), products: products.filter((x) => x.active), orders: service ? orders.slice().reverse() : null }[table];
      if (!rows) return send(res, 401, { message: 'permission denied' });
      if (table === 'orders' && q.get('id')) rows = rows.filter((o) => 'eq.' + o.id === q.get('id'));
      const off = +q.get('offset') || 0, lim = +q.get('limit') || 1000;
      return send(res, 200, rows.slice(off, off + lim));
    }
    send(res, 404, { message: 'not found' });
  } catch (e) {
    send(res, e.status || 400, { code: e.code || 'P0001', message: e.message });
  }
}).listen(PORT, () => console.log(`[fake-supabase] http://localhost:${PORT}  (login: demo / demo1234)`));

export { products, categories, orders };
