// VIVACHE API — one function, all routes under /api/*
//
// Two modes:
//   • LIBRA mode (env SUPABASE_URL + SUPABASE_ANON_KEY): categories, products, prices, stock, photos, delivery & payment
//     come from LIBRA FINANCE via Supabase; orders go to Supabase (vv_place_order) and Libra downloads them;
//     customer accounts = Supabase Auth + Libra login (vv_* functions). The site adds appearance & extras in Netlify Blobs.
//   • DEMO mode (no Supabase env): everything lives in Netlify Blobs (seed data), orders in Blobs.
//
// Public
//   GET    /api/catalog                     everything the storefront needs (CDN-cached, purged on admin writes)
//   POST   /api/orders                      place an order (prices always re-calculated on the server / in Supabase)
//   POST   /api/account/:action             login | register | forgot | email-session | reset | me | profile | phone |
//                                           password | logout | order | cancel | proof      (LIBRA mode)
//   POST   /api/admin/login                 { password } → { token }
// Admin (Authorization: Bearer <token>)
//   GET    /api/admin/data                  all collections + orders summary
//   POST/PUT/PATCH/DELETE /api/admin/:coll[/:id]    products, news, categories, brands, hero
//   POST   /api/admin/:coll/order           { ids } drag & drop order
//   PUT    /api/admin/settings | /api/admin/pages/:key
//   POST   /api/admin/products/discount     bulk discount (DEMO mode only — in LIBRA mode prices come from Libra)
//   GET/PATCH/DELETE /api/admin/orders[/:id]
//   POST   /api/admin/upload                raw image → { url }
//   GET    /api/admin/export · POST /api/admin/import
import { purgeCache } from '@netlify/functions';
import * as db from './lib/db.mjs';
import * as supa from './lib/supa.mjs';
import { checkPassword, issueToken, verify, passwordConfigured, env } from './lib/auth.mjs';
import { json, body, uid, str, num, int, bool, tr, trHtml, parseVariants, isColor, HttpError } from './lib/util.mjs';

export const config = { path: '/api/*' };

const ITEM_COLLS = ['products', 'news', 'categories', 'brands', 'hero'];
const STATUSES = ['new', 'confirmed', 'processing', 'shipped', 'completed', 'cancelled'];
const LIBRA_MSG = 'ეს მონაცემი LIBRA FINANCE-დან მოდის — შეცვალე Libra-ში (საიტზე ~1 წუთში განახლდება).';

export default async (req, context) => {
  const url = new URL(req.url);
  const parts = url.pathname.replace(/^\/api\/?/, '').replace(/\/+$/, '').split('/').filter(Boolean);
  const m = req.method;
  try {
    if (m === 'GET' && parts[0] === 'catalog') return await catalog();
    // visitor's approximate location from Netlify's edge (IP based, no browser permission) — used by the weather widget
    if (m === 'GET' && parts[0] === 'geo') {
      const g = (context && context.geo) || {};
      return json({ city: g.city || '', country: (g.country && g.country.name) || '', code: (g.country && g.country.code) || '',
        lat: g.latitude ?? null, lon: g.longitude ?? null, tz: g.timezone || '' }, 200, { 'cache-control': 'private, no-store' });
    }
    if (m === 'POST' && parts[0] === 'orders') return await createOrder(req);
    if (m === 'POST' && parts[0] === 'account') return await account(req, parts[1], url);
    if (parts[0] === 'admin') {
      if (m === 'POST' && parts[1] === 'login') return await login(req);
      if (!verify(req)) return json({ error: 'unauthorized' }, 401);
      return await admin(req, m, parts.slice(1), url);
    }
    return json({ error: 'not found' }, 404);
  } catch (e) {
    if (e instanceof HttpError) return json({ error: e.message }, e.status);
    console.error(e);
    return json({ error: 'სერვერის შეცდომა: ' + (e.message || e) }, 500);
  }
};

/* ============================== data (both modes) ============================== */

async function load(all = false) {
  const d = await db.getMany(['settings', 'categories', 'brands', 'products', 'news', 'hero', 'pages', 'extras', 'looks']);
  if (supa.supaOn()) {
    try {
      const L = await supa.libraCatalog(d.extras, d.looks);
      d.categories = L.categories; d.products = L.products; d.settings = supa.applyShop(d.settings, L.shop);
    } catch (e) {
      console.error('libra catalogue', e);
      d.libraError = e.message || String(e);
      d.categories = []; d.products = []; d.settings = { ...d.settings, libra: true };
    }
  }
  d.settings.auth = supa.supaOn();
  if (!all) {
    d.categories = d.categories.filter((c) => !c.hidden);
    d.products = d.products.filter((p) => !p.hidden);
  }
  return d;
}

async function catalog() {
  const d = await load();
  const data = {
    settings: d.settings, categories: d.categories, brands: d.brands, products: d.products,
    news: d.news.filter((n) => !n.hidden).sort((a, b) => String(b.date).localeCompare(String(a.date))),
    hero: d.hero.filter((h) => !h.hidden).sort((a, b) => (a.sort || 0) - (b.sort || 0)),
    pages: d.pages, top: await topSellers(d.products), now: new Date().toISOString(),
  };
  // Libra changes arrive every minute → short CDN cache; admin writes purge it immediately
  return json(data, 200, {
    'cache-control': 'public, max-age=0, must-revalidate',
    'netlify-cdn-cache-control': `public, durable, s-maxage=${supa.supaOn() ? 60 : 300}, stale-while-revalidate=120`,
    'netlify-cache-tag': 'catalog',
  });
}

/** best-selling product ids: LIBRA's 90-day sales (store + delivered site orders), plus site orders when visible */
async function topSellers(products) {
  const score = new Map();
  const add = (id, n) => { if (id) score.set(id, (score.get(id) || 0) + n); };
  try {
    if (supa.supaOn()) {
      products.forEach((p) => { if (p.popularity > 0) add(p.id, p.popularity); });
      if (supa.serviceOn()) {
        const rows = await supa.rest('orders?select=items,status&order=created_at.desc&limit=500', { service: true }).catch(() => []);
        rows.filter((o) => o.status !== 'cancelled').forEach((o) => (o.items || []).forEach((i) => add(i.product_id, (i.qty || 1) * 3)));
      }
    } else {
      const keys = (await db.listOrderKeys()).slice(0, 100);
      const orders = (await Promise.all(keys.map(db.getOrder))).filter(Boolean);
      orders.filter((o) => o.status !== 'cancelled').forEach((o) => (o.items || []).forEach((i) => add(i.id, i.qty || 1)));
    }
  } catch (e) { console.error('top sellers', e); }
  const live = new Set(products.map((p) => p.id));
  return [...score.entries()].filter(([id]) => live.has(id)).sort((a, b) => b[1] - a[1]).slice(0, 24).map(([id]) => id);
}

async function purge() {
  try { await purgeCache({ tags: ['catalog'] }); } catch { /* local dev */ }
}

/* ============================== orders ============================== */

function variantPrice(p, label) {
  const vs = parseVariants(p.variants);
  if (!vs.length) return { price: p.price, label: '' };
  const v = vs.find((x) => x.label === label) || vs[0];
  // variant lines hold regular prices; the product discount (old_price → price) applies to them too
  const ratio = p.old_price && p.price && p.old_price > p.price ? p.price / p.old_price : 1;
  return { price: v.price != null ? Math.round(v.price * ratio * 100) / 100 : p.price, label: v.label };
}

async function createOrder(req) {
  const b = await body(req);
  if (b.website) return json({ ok: true, number: 'V-0' }); // honeypot
  const c = b.customer || {};
  const customer = {
    name: str(c.name, 120), phone: str(c.phone, 40), email: str(c.email, 120),
    city: str(c.city, 80), address: str(c.address, 300), note: str(c.note, 1000),
  };
  const delivery = b.delivery === 'pickup' ? 'pickup' : 'courier';
  const payment = ['cash', 'transfer', 'card'].includes(b.payment) ? b.payment : 'cash';
  const items = (Array.isArray(b.items) ? b.items : []).slice(0, 100);

  if (supa.supaOn()) {
    // prices, stock, delivery fee, cashback and guest rules are all checked inside Supabase (vv_place_order)
    const r = await supa.rpc('vv_place_order', {
      p_token: str(b.token, 200) || null,
      p_items: items.map((i) => ({ product_id: str(i.id, 60), qty: Math.min(999, Math.max(1, int(i.qty, 1))) })),
      p_delivery: delivery,
      p_address: delivery === 'courier' ? [customer.city, customer.address].filter(Boolean).join(', ') : null,
      p_comment: [customer.note, customer.email && 'ელფოსტა: ' + customer.email].filter(Boolean).join(' · ') || null,
      p_use_cashback: Math.max(0, Math.round((num(b.use_cashback) || 0) * 100)),
      p_name: customer.name || null, p_phone: customer.phone || null, p_payment: payment,
    });
    notifyTelegram({
      number: r.number, customer, delivery, total: r.total_tetri / 100,
      items: items.map((i) => ({ name: str(i.name, 120) || i.id, qty: int(i.qty, 1), total: 0 })),
    }).catch((e) => console.error('telegram', e));
    return json({ ok: true, id: r.id, number: r.number, total: r.total_tetri / 100, cashback: r.cashback_tetri / 100, delivery_fee: r.delivery_tetri / 100, payment });
  }

  if (customer.name.length < 2) throw new HttpError(422, 'შეიყვანე სახელი');
  if (customer.phone.replace(/\D/g, '').length < 9) throw new HttpError(422, 'შეიყვანე სწორი ტელეფონის ნომერი');
  const { products, settings } = await db.getMany(['products', 'settings']);
  const shop = settings.shop || {};
  const lines = [];
  for (const it of items.slice(0, 60)) {
    const p = products.find((x) => x.id === it.id && !x.hidden);
    if (!p) continue;
    const { price, label } = variantPrice(p, it.variant);
    const qty = Math.min(99, Math.max(1, int(it.qty, 1)));
    lines.push({ id: p.id, name: p.name.ka || p.name.en, variant: label, price: price || 0, qty, image: (p.images || [])[0] || '', total: Math.round((price || 0) * qty * 100) / 100 });
  }
  if (!lines.length) throw new HttpError(422, 'კალათა ცარიელია');
  if (delivery === 'courier' && customer.address.length < 4) throw new HttpError(422, 'შეიყვანე მიწოდების მისამართი');
  const subtotal = Math.round(lines.reduce((s, i) => s + i.total, 0) * 100) / 100;
  const fee = delivery === 'pickup' || (shop.free_from && subtotal >= shop.free_from) ? 0 : (num(shop.delivery_fee) || 0);
  const now = new Date();
  const key = db.orderKey(now.getTime());
  const number = 'V-' + now.toISOString().slice(2, 10).replace(/-/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);
  const order = {
    id: key.slice(7), number, status: 'new', created: now.toISOString(), customer, delivery, payment,
    items: lines, subtotal, delivery_fee: fee, total: Math.round((subtotal + fee) * 100) / 100,
    lang: b.lang === 'en' ? 'en' : 'ka', admin_note: '', history: [{ at: now.toISOString(), status: 'new' }],
  };
  await db.putOrder(key, order);
  await notifyTelegram(order).catch((e) => console.error('telegram', e));
  return json({ ok: true, number, total: order.total, payment });
}

async function notifyTelegram(o) {
  const token = env('TELEGRAM_BOT_TOKEN'), chat = env('TELEGRAM_CHAT_ID');
  if (!token || !chat) return;
  const lines = [
    `🛍 ახალი შეკვეთა ${o.number}`,
    `👤 ${o.customer.name || ''} · ${o.customer.phone || ''}`,
    o.delivery === 'pickup' ? '🏬 მაღაზიიდან გატანა' : `🚚 ${o.customer.city || ''} ${o.customer.address || ''}`,
    '', ...o.items.map((i) => `• ${i.name} × ${i.qty}${i.total ? ' = ' + i.total.toFixed(2) + ' ₾' : ''}`),
    '', `💰 სულ: ${Number(o.total).toFixed(2)} ₾`,
  ];
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ chat_id: chat, text: lines.join('\n') }),
  });
}

/* ============================== customer accounts (LIBRA mode) ============================== */

async function account(req, action, url) {
  if (!supa.supaOn()) throw new HttpError(503, 'ანგარიშები ჯერ არ არის ჩართული (Supabase არ არის დაკავშირებული).');
  const b = await body(req);
  const tok = str(b.token, 200);
  const back = (path) => {
    const origin = req.headers.get('origin') || url.origin;
    return encodeURIComponent(origin.replace(/\/+$/, '') + (path || '/account'));
  };
  const exchange = async (accessToken) => (await supa.rpc('vv_email_session', {}, { token: accessToken })).token;

  switch (action) {
    case 'login': {
      const contact = str(b.contact, 160), password = String(b.password || '');
      if (!contact || !password) throw new HttpError(422, 'შეიყვანე ელფოსტა / ლოგინი და პაროლი');
      if (contact.includes('@')) {
        const s = await supa.authApi('token?grant_type=password', { method: 'POST', body: { email: contact.toLowerCase(), password } });
        return json({ token: await exchange(s.access_token) });
      }
      const r = await supa.rpc('vv_login', { p_username: contact, p_password: password });
      if (r.error) throw new HttpError(401, r.error);
      return json({ token: r.token });
    }
    case 'register': {
      const first = str(b.first_name, 80), last = str(b.last_name, 80), email = str(b.email, 160).toLowerCase(), password = String(b.password || '');
      if (first.length < 2) throw new HttpError(422, 'შეიყვანე სახელი');
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new HttpError(422, 'ელფოსტის ფორმატი არასწორია');
      if (password.length < 8) throw new HttpError(422, 'პაროლი — მინიმუმ 8 სიმბოლო');
      if (!bool(b.consent)) throw new HttpError(422, 'რეგისტრაციისთვის საჭიროა თანხმობა პერსონალური მონაცემების დამუშავებაზე');
      const r = await supa.authApi('signup?redirect_to=' + back('/account'), {
        method: 'POST', body: { email, password, data: { full_name: [first, last].filter(Boolean).join(' '), consent: true } },
      });
      if (r && r.access_token) return json({ token: await exchange(r.access_token) }); // email confirmation turned off
      return json({ confirm: true, email });
    }
    case 'forgot': {
      const email = str(b.email || b.contact, 160).toLowerCase();
      if (!email.includes('@')) throw new HttpError(422, 'შეიყვანე ელფოსტა. ლოგინით (Libra-დან) შესვლის პაროლს მაღაზია აღგიდგენს.');
      await supa.authApi('recover?redirect_to=' + back('/account'), { method: 'POST', body: { email } });
      return json({ ok: true });
    }
    case 'email-session':
      return json({ token: await exchange(str(b.access_token, 4000)) });
    case 'reset': {
      const access = str(b.access_token, 4000), password = String(b.password || '');
      if (password.length < 8) throw new HttpError(422, 'პაროლი — მინიმუმ 8 სიმბოლო');
      await supa.authApi('user', { method: 'PUT', token: access, body: { password } });
      return json({ token: await exchange(access) });
    }
    case 'me': return json(await supa.rpc('vv_me', { p_token: tok }));
    case 'profile': await supa.rpc('vv_update_profile', { p_token: tok, p_name: str(b.name, 120) }); return json({ ok: true });
    case 'phone': await supa.rpc('vv_update_phone', { p_token: tok, p_phone: str(b.phone, 40) }); return json({ ok: true });
    case 'password': await supa.rpc('vv_change_password', { p_token: tok, p_old: String(b.old || ''), p_new: String(b.new || '') }); return json({ ok: true });
    case 'logout': await supa.rpc('vv_logout', { p_token: tok }).catch(() => null); return json({ ok: true });
    case 'order': return json(await supa.rpc('vv_order', { p_token: tok, p_id: str(b.id, 60) }));
    case 'cancel': await supa.rpc('vv_cancel_order', { p_token: tok, p_id: str(b.id, 60) }); return json({ ok: true });
    case 'proof': return json(await supa.rpc('vv_upload_proof', { p_token: tok, p_order: str(b.order, 60), p_data: String(b.data || ''), p_mime: str(b.mime, 40) }));
  }
  throw new HttpError(404, 'not found');
}

/* ============================== admin ============================== */

async function login(req) {
  const b = await body(req);
  if (!passwordConfigured()) throw new HttpError(503, 'ADMIN_PASSWORD არ არის მითითებული Netlify-ის Environment variables-ში.');
  if (!checkPassword(b.password || '')) {
    await new Promise((r) => setTimeout(r, 600));
    throw new HttpError(401, 'პაროლი არასწორია');
  }
  return json({ token: issueToken(str(b.name, 40) || 'admin', b.remember ? 30 : 7) });
}

const LIBRA_ORDER_STATUS = { new: 'new', accepted: 'confirmed', preparing: 'processing', ready: 'processing', delivering: 'shipped', done: 'completed', cancelled: 'cancelled' };
const libraSummary = (o) => ({ id: o.id, number: o.number, status: LIBRA_ORDER_STATUS[o.status] || o.status, libra_status: o.status, created: o.created_at, total: (o.total_tetri || 0) / 100, name: o.full_name, phone: o.phone, items: (o.items || []).length });

async function adminOrdersSummary() {
  if (supa.supaOn()) {
    if (!supa.serviceOn()) return { count: 0, recent: [], libra: true, service: false };
    const rows = await supa.rest('orders?select=id,number,status,created_at,total_tetri,full_name,phone,items&order=created_at.desc&limit=60', { service: true }).catch(() => []);
    return { count: rows.length, recent: rows.map(libraSummary), libra: true, service: true };
  }
  const keys = await db.listOrderKeys();
  const recent = (await Promise.all(keys.slice(0, 60).map(db.getOrder))).filter(Boolean);
  return { count: keys.length, recent: recent.map(summary) };
}

async function admin(req, m, p, url) {
  const [a, b] = p;
  const libra = supa.supaOn();

  if (m === 'GET' && a === 'data') {
    const d = await load(true);
    return json({ ...d, libra, service: supa.serviceOn(), orders: await adminOrdersSummary() });
  }
  if (a === 'upload' && m === 'POST') return upload(req);
  if (a === 'export' && m === 'GET') return json({ app: 'vivace', exported: new Date().toISOString(), ...(await db.getMany(db.COLLECTIONS)) });
  if (a === 'import' && m === 'POST') {
    const data = await body(req);
    if (data.app !== 'vivace') throw new HttpError(422, 'ეს არ არის VIVACHE-ს ბექაპის ფაილი');
    for (const n of db.COLLECTIONS) if (data[n] != null) await db.put(n, data[n]);
    await purge();
    return json({ ok: true });
  }
  if (a === 'settings' && m === 'PUT') {
    const next = db.deepMerge(await db.get('settings'), await body(req));
    delete next.libra; delete next.auth;
    await db.put('settings', next); await purge();
    return json(libra ? (await load(true)).settings : next);
  }
  if (a === 'pages' && b && m === 'DELETE') {
    const key = b.replace(/[^a-z0-9-]/gi, '');
    if (['about', 'delivery', 'terms'].includes(key)) throw new HttpError(409, 'ძირითადი გვერდი არ იშლება — შეგიძლია მენიუდან მოხსნა');
    const pages = await db.get('pages'); delete pages[key];
    await db.put('pages', pages); await purge();
    return json(pages);
  }
  if (a === 'pages' && b && m === 'PUT') {
    const pages = await db.get('pages'); const x = await body(req);
    pages[b.replace(/[^a-z0-9-]/gi, '')] = { title: tr(x.title, 200), lead: tr(x.lead, 600), text: trHtml(x.text), image: str(x.image, 400) };
    await db.put('pages', pages); await purge();
    return json(pages);
  }
  if (a === 'orders') return orders(req, m, b, url);
  if (a === 'products' && b === 'discount' && m === 'POST') {
    if (libra) throw new HttpError(409, 'ფასები LIBRA FINANCE-დან მოდის — ფასდაკლება Libra-ში დააყენე (ფასების სია). საიტზე „ძველი ფასი“ პროდუქტის გვერდიდან ჩაწერე.');
    return bulkDiscount(await body(req));
  }

  // LIBRA mode: products & categories belong to Libra — the site stores only extras / appearance
  if (libra && (a === 'products' || a === 'categories')) {
    const store = a === 'products' ? 'extras' : 'looks';
    if (!b || b === 'order' || m === 'POST' || m === 'DELETE') throw new HttpError(409, LIBRA_MSG);
    if (m !== 'PUT' && m !== 'PATCH') throw new HttpError(405, 'method');
    const map = await db.get(store);
    const x = await body(req);
    const prev = map[b] || {};
    map[b] = a === 'products' ? productExtras(m === 'PATCH' ? { ...prev, ...x } : x) : categoryLook(m === 'PATCH' ? { ...prev, ...x } : x);
    await db.put(store, map); await purge();
    const fresh = await load(true);
    const item = fresh[a].find((y) => y.id === b);
    if (!item) throw new HttpError(404, 'ვერ მოიძებნა (Libra-ში წაშლილია?)');
    return json(item);
  }

  if (ITEM_COLLS.includes(a)) {
    const list = await db.get(a);
    if (b === 'order' && m === 'POST') {
      const ids = (await body(req)).ids || [];
      ids.forEach((id, i) => { const it = list.find((x) => x.id === id); if (it) it.sort = i + 1; });
      list.sort((x, y) => (x.sort || 0) - (y.sort || 0));
      await db.put(a, list); await purge();
      return json({ ok: true });
    }
    if (m === 'POST' && !b) {
      const item = normalize(a, await body(req), null, list);
      list.unshift(item); await db.put(a, list); await purge();
      return json(item, 201);
    }
    const i = list.findIndex((x) => x.id === b);
    if (i < 0) throw new HttpError(404, 'ვერ მოიძებნა');
    if (m === 'PUT') list[i] = normalize(a, await body(req), list[i], list);
    else if (m === 'PATCH') list[i] = normalize(a, { ...list[i], ...(await body(req)) }, list[i], list);
    else if (m === 'DELETE') {
      const [gone] = list.splice(i, 1);
      if (a === 'categories') list.forEach((x) => { if (x.parent === gone.id) x.parent = gone.parent || null; });
      await db.put(a, list); await purge();
      return json({ ok: true });
    } else throw new HttpError(405, 'method');
    await db.put(a, list); await purge();
    return json(list[i]);
  }
  throw new HttpError(404, 'not found');
}

const imgs = (x) => (Array.isArray(x) ? x : []).map((s) => str(s, 400)).filter(Boolean).slice(0, 12);

function productExtras(x) {
  const old = num(x.old_price);
  return {
    name_en: str(x.name?.en ?? x.name_en, 200), brand: str(x.brand, 80), age: str(x.age, 20),
    old_price: old || null, hot: bool(x.hot), isNew: bool(x.isNew), hidden: bool(x.hidden), sort: int(x.sort, 0),
    description: trHtml(x.description), details: trHtml(x.details),
    // the first image of a Libra product is Libra's photo — keep only the extra ones
    images: imgs(x.images).filter((s) => !/\/storage\/v1\/object\/public\/products\//.test(s)),
  };
}
function categoryLook(x) {
  return {
    name_en: str(x.name?.en ?? x.name_en, 120), tagline: tr(x.tagline, 200), color: isColor(x.color) ? x.color : '',
    icon: str(x.icon, 8), image: str(x.image, 400), hidden: bool(x.hidden),
    ...(x.sort !== undefined && x.sort !== '' ? { sort: int(x.sort, 0) } : {}),
  };
}

function normalize(coll, x, prev, list) {
  const id = prev?.id || str(x.id, 60).replace(/[^a-z0-9_-]/gi, '') || uid(coll[0]);
  if (!prev && list.some((y) => y.id === id)) throw new HttpError(409, 'ეს ID უკვე არსებობს');
  switch (coll) {
    case 'products': {
      const name = tr(x.name, 200);
      if (!name.ka && !name.en) throw new HttpError(422, 'დასახელება სავალდებულოა');
      const price = num(x.price), old = num(x.old_price);
      return {
        id, name, brand: str(x.brand, 80), category_id: str(x.category_id, 60) || null,
        price, old_price: old && price && old > price ? old : null,
        description: trHtml(x.description), details: trHtml(x.details),
        variants: str(x.variants, 2000), code: str(x.code, 60), age: str(x.age, 20),
        stock: x.stock === '' || x.stock == null ? null : int(x.stock, 0),
        hot: bool(x.hot), isNew: bool(x.isNew), hidden: bool(x.hidden), sort: int(x.sort, 0),
        images: imgs(x.images), created: prev?.created || new Date().toISOString().slice(0, 10), updated: new Date().toISOString(),
      };
    }
    case 'news': {
      const title = tr(x.title, 300);
      if (!title.ka && !title.en) throw new HttpError(422, 'სათაური სავალდებულოა');
      return {
        id, title, excerpt: tr(x.excerpt, 600), text: trHtml(x.text), image: str(x.image, 400),
        color: isColor(x.color) ? x.color : '#2F6BFF', date: str(x.date, 10) || new Date().toISOString().slice(0, 10),
        pinned: bool(x.pinned), hidden: bool(x.hidden),
      };
    }
    case 'categories': {
      const name = tr(x.name, 120);
      if (!name.ka && !name.en) throw new HttpError(422, 'სახელი სავალდებულოა');
      let parent = str(x.parent, 60) || null;
      if (parent === id || (parent && !list.some((y) => y.id === parent))) parent = null;
      return {
        id, parent, name, tagline: tr(x.tagline, 200), color: isColor(x.color) ? x.color : '',
        icon: str(x.icon, 8), image: str(x.image, 400), hidden: bool(x.hidden), sort: int(x.sort, prev?.sort || list.length + 1),
      };
    }
    case 'brands': {
      const name = str(x.name, 80);
      if (!name) throw new HttpError(422, 'სახელი სავალდებულოა');
      return { id, name, logo: str(x.logo, 400), url: str(x.url, 400), color: isColor(x.color) ? x.color : '#15171A', sort: int(x.sort, prev?.sort || list.length + 1) };
    }
    case 'hero': {
      return {
        id, layout: x.layout === 'banner' ? 'banner' : 'photo',
        eyebrow: tr(x.eyebrow, 120), title: tr(x.title, 300), lead: tr(x.lead, 600),
        cta: tr(x.cta, 60), cta_url: str(x.cta_url, 300), cta2: tr(x.cta2, 60), cta2_url: str(x.cta2_url, 300),
        color: isColor(x.color) ? x.color : '#FF3D7F', image: str(x.image, 400), bg: str(x.bg, 400),
        products: (Array.isArray(x.products) ? x.products : []).map((s) => str(s, 60)).filter(Boolean).slice(0, 4),
        hidden: bool(x.hidden), sort: int(x.sort, prev?.sort || list.length + 1),
      };
    }
  }
  throw new HttpError(400, 'unknown collection');
}

async function bulkDiscount(b) {
  const list = await db.get('products');
  const cats = await db.get('categories');
  const scope = str(b.scope, 60) || 'all';
  const inScope = (p) => {
    if (scope === 'all') return true;
    if (scope === 'hot') return p.hot;
    let c = cats.find((x) => x.id === p.category_id);
    while (c) { if (c.id === scope) return true; c = cats.find((x) => x.id === c.parent); }
    return false;
  };
  const pct = Math.min(90, Math.max(1, int(b.percent, 0)));
  let n = 0;
  for (const p of list) {
    if (!inScope(p)) continue;
    if (b.action === 'remove') { if (p.old_price) { p.price = p.old_price; p.old_price = null; n++; } }
    else if (p.price) { const base = p.old_price || p.price; p.old_price = base; p.price = Math.round(base * (100 - pct)) / 100; n++; }
  }
  await db.put('products', list); await purge();
  return json({ ok: true, changed: n });
}

/* ---------- orders (admin) ---------- */
const summary = (o) => ({ id: o.id, number: o.number, status: o.status, created: o.created, total: o.total, name: o.customer?.name, phone: o.customer?.phone, items: o.items?.length || 0 });

async function orders(req, m, id, url) {
  if (supa.supaOn()) {
    // LIBRA mode: orders live in Supabase and are processed in LIBRA FINANCE (statuses come back from there)
    if (!supa.serviceOn()) throw new HttpError(409, 'შეკვეთები მუშავდება LIBRA FINANCE-ში (ონლაინ მაღაზია → შეკვეთები). საიტის ადმინში სანახავად Netlify-ში დაამატე SUPABASE_SERVICE_KEY.');
    if (m !== 'GET') throw new HttpError(409, 'შეკვეთის სტატუსი LIBRA FINANCE-ში იცვლება.');
    if (!id) {
      const status = url.searchParams.get('status') || '', q = (url.searchParams.get('q') || '').trim();
      const page = Math.max(1, int(url.searchParams.get('page'), 1)), per = 30;
      const back = Object.entries(LIBRA_ORDER_STATUS).filter(([, v]) => v === status).map(([k]) => k);
      let qs = `orders?select=id,number,status,created_at,total_tetri,full_name,phone,items&order=created_at.desc&limit=${per}&offset=${(page - 1) * per}`;
      if (back.length) qs += `&status=in.(${back.join(',')})`;
      if (q) qs += `&or=(number.ilike.*${encodeURIComponent(q)}*,full_name.ilike.*${encodeURIComponent(q)}*,phone.ilike.*${encodeURIComponent(q)}*)`;
      const rows = await supa.rest(qs, { service: true, headers: { Prefer: 'count=exact' } });
      return json({ total: (page - 1) * per + rows.length + (rows.length === per ? 1 : 0), page, per, rows: rows.map(libraSummary), libra: true });
    }
    const [o] = await supa.rest(`orders?id=eq.${encodeURIComponent(id)}&select=*`, { service: true });
    if (!o) throw new HttpError(404, 'შეკვეთა ვერ მოიძებნა');
    return json({
      id: o.id, number: o.number, status: LIBRA_ORDER_STATUS[o.status] || o.status, libra_status: o.status, libra: true, created: o.created_at,
      customer: { name: o.full_name, phone: o.phone, address: o.address || '', note: o.comment || '' },
      delivery: o.delivery, payment: o.payment, admin_note: o.status_note || '',
      items: (o.items || []).map((i) => ({ id: i.product_id, name: i.name, price: i.price_tetri / 100, qty: i.qty, total: i.amount_tetri / 100, image: i.image_url || '' })),
      subtotal: o.subtotal_tetri / 100, delivery_fee: o.delivery_tetri / 100, cashback: o.cashback_tetri / 100, total: o.total_tetri / 100,
      imported: o.imported, history: [{ at: o.created_at, status: 'new' }, ...(o.updated_at && o.updated_at !== o.created_at ? [{ at: o.updated_at, status: LIBRA_ORDER_STATUS[o.status] || o.status }] : [])],
    });
  }
  if (!id && m === 'GET') {
    const keys = await db.listOrderKeys();
    const status = url.searchParams.get('status') || '';
    const q = (url.searchParams.get('q') || '').toLowerCase();
    const page = Math.max(1, int(url.searchParams.get('page'), 1));
    const per = 30;
    if (status || q) {
      let all = [];
      for (let i = 0; i < keys.length; i += 50) all.push(...(await Promise.all(keys.slice(i, i + 50).map(db.getOrder))));
      all = all.filter(Boolean).filter((o) => (!status || o.status === status) && (!q || [o.number, o.customer?.name, o.customer?.phone].join(' ').toLowerCase().includes(q)));
      return json({ total: all.length, page, per, rows: all.slice((page - 1) * per, page * per).map(summary) });
    }
    const rows = (await Promise.all(keys.slice((page - 1) * per, page * per).map(db.getOrder))).filter(Boolean).map(summary);
    return json({ total: keys.length, page, per, rows });
  }
  const key = 'orders/' + String(id).replace(/[^a-z0-9-]/gi, '');
  const o = await db.getOrder(key);
  if (!o) throw new HttpError(404, 'შეკვეთა ვერ მოიძებნა');
  if (m === 'GET') return json(o);
  if (m === 'PATCH') {
    const x = await body(req);
    if (x.status && STATUSES.includes(x.status) && x.status !== o.status) {
      o.status = x.status; o.history = [...(o.history || []), { at: new Date().toISOString(), status: x.status }];
    }
    if (x.admin_note != null) o.admin_note = str(x.admin_note, 2000);
    await db.putOrder(key, o);
    return json(o);
  }
  if (m === 'DELETE') { await db.deleteOrder(key); return json({ ok: true }); }
  throw new HttpError(405, 'method');
}

/* ---------- uploads ---------- */
const TYPES = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/svg+xml': 'svg', 'image/avif': 'avif',
  'audio/mpeg': 'mp3', 'audio/mp3': 'mp3', 'audio/ogg': 'ogg', 'audio/mp4': 'm4a', 'audio/x-m4a': 'm4a', 'audio/aac': 'aac', 'audio/wav': 'wav', 'audio/x-wav': 'wav' };
async function upload(req) {
  const type = (req.headers.get('content-type') || '').split(';')[0].trim();
  if (!TYPES[type]) throw new HttpError(415, 'დასაშვებია სურათი (JPG, PNG, WebP, GIF, SVG) ან მუსიკა (MP3, M4A, OGG, WAV)');
  const buf = await req.arrayBuffer();
  const audio = type.startsWith('audio/');
  // Netlify Functions accept request bodies up to ~6 MB
  if (buf.byteLength > (audio ? 5.8 : 5) * 1024 * 1024) throw new HttpError(413, audio ? 'მუსიკის ფაილი 5.8 MB-ზე დიდია — შეკუმშე (128 kbps MP3) ან დაამატე ბმულით' : 'სურათი 5MB-ზე დიდია');
  if (type === 'image/svg+xml' && /<script|on\w+\s*=/i.test(Buffer.from(buf).toString())) throw new HttpError(422, 'SVG შეიცავს სკრიპტს');
  const key = uid() + '.' + TYPES[type];
  await db.media().set(key, buf, { metadata: { type } });
  return json({ url: '/img/' + key }, 201);
}
