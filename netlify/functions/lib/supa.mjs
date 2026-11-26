// Supabase connection — the SAME project that LIBRA FINANCE uploads to (buhpro/cloud/supabase.sql).
//   Libra → Supabase: categories, products (price, stock, photo), shop_settings (shop, delivery, payment, guest_orders), customers
//   Site  → Supabase: orders (vv_place_order) which Libra downloads every minute; accounts (Supabase Auth + vv_* functions)
// Configure with env SUPABASE_URL + SUPABASE_ANON_KEY (public key). Optional SUPABASE_SERVICE_KEY: admin can view site orders.
import { env } from './auth.mjs';
import { HttpError } from './util.mjs';

export const supaUrl = () => (env('SUPABASE_URL') || '').replace(/\/+$/, '');
export const supaOn = () => !!(supaUrl() && env('SUPABASE_ANON_KEY'));
export const serviceOn = () => !!(supaUrl() && env('SUPABASE_SERVICE_KEY'));

const GE = {
  'Invalid login credentials': 'ელფოსტა ან პაროლი არასწორია',
  'Email not confirmed': 'ელფოსტა ჯერ არ არის დადასტურებული — გახსენი წერილი და დააჭირე ბმულს',
  'User already registered': 'ეს ელფოსტა უკვე დარეგისტრირებულია — შედი ან აღადგინე პაროლი',
  'Password should be at least 6 characters': 'პაროლი — მინიმუმ 6 სიმბოლო',
  'Email rate limit exceeded': 'ძალიან ბევრი მოთხოვნა — სცადე რამდენიმე წუთში',
  'For security purposes, you can only request this once every 60 seconds': 'უსაფრთხოებისთვის — სცადე 60 წამში',
  'Unable to validate email address: invalid format': 'ელფოსტის ფორმატი არასწორია',
  'New password should be different from the old password.': 'ახალი პაროლი ძველისგან უნდა განსხვავდებოდეს',
};
const ge = (m) => { m = String(m || ''); for (const k of Object.keys(GE)) if (m.includes(k)) return GE[k]; return m; };

async function call(path, { method = 'GET', body, token, service = false, headers = {} } = {}) {
  const key = service ? env('SUPABASE_SERVICE_KEY') : env('SUPABASE_ANON_KEY');
  const h = { apikey: key, Authorization: `Bearer ${token || key}`, ...headers };
  if (body !== undefined) h['Content-Type'] = 'application/json';
  let r;
  try {
    r = await fetch(`${supaUrl()}/${path}`, { method, headers: h, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch (e) {
    throw new HttpError(502, 'Supabase-თან კავშირი ვერ დამყარდა');
  }
  const text = await r.text();
  let data = null;
  if (text) { try { data = JSON.parse(text); } catch { data = text; } }
  if (!r.ok) {
    const msg = data && (data.msg || data.message || data.error_description || data.error) || `Supabase ${r.status}`;
    throw new HttpError(r.status === 401 || data?.code === 'P0002' ? 401 : r.status >= 500 ? 502 : 422, ge(msg));
  }
  return data;
}

export const rest = (path, o) => call('rest/v1/' + path, o);
export const rpc = (fn, args, o = {}) => call('rest/v1/rpc/' + fn, { method: 'POST', body: args || {}, ...o });
export const authApi = (path, o) => call('auth/v1/' + path, o);

/** all rows of a table (PostgREST returns max ~1000 per request) */
async function all(table, query) {
  const out = [];
  for (let off = 0; off < 50000; off += 1000) {
    const rows = await rest(`${table}?${query}&limit=1000&offset=${off}`);
    out.push(...rows);
    if (rows.length < 1000) break;
  }
  return out;
}

/* ---------------- catalogue from Libra ---------------- */

// default appearance for Libra categories by name (the admin can override everything)
const LOOKS = [
  [/საკანცელარ|კანცელარ|stationery/i, '#2F6BFF', '✏️', '/assets/img/photos/stationery.webp'],
  [/სასკოლ|სკოლ|school|ჩანთ|პენალ/i, '#22C55E', '🎒', '/assets/img/photos/stationery.webp'],
  [/წიგნ|book|ლიტერატ/i, '#8B5CF6', '📚', '/assets/img/photos/books.webp'],
  [/სათამაშ|თამაშ|toy|კონსტრუქ/i, '#FFB020', '🧸', '/assets/img/photos/toys.webp'],
  [/საჩუქ|სასაჩუქ|gift|სუვენ/i, '#FF3D7F', '🎁', '/assets/img/photos/gifts.webp'],
  [/ახალწ|ახალი წ|საახალწლო|new ?year|christmas|ნაძვ/i, '#E11D48', '🎄', '/assets/img/photos/newyear.webp'],
  [/ხატვ|ხელოვ|ფერ|art|საღებ/i, '#14B8A6', '🎨', '/assets/img/photos/stationery.webp'],
];
const PALETTE = ['#2F6BFF', '#8B5CF6', '#FF3D7F', '#FFB020', '#22C55E', '#14B8A6', '#F97316', '#E11D48'];
const PHOTOS = ['stationery', 'books', 'gifts', 'toys', 'newyear'].map((n) => `/assets/img/photos/${n}.webp`);

const textToHtml = (s) => String(s || '').trim() ? String(s).trim().split(/\n{2,}/).map((p) => '<p>' + p.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])).replace(/\n/g, '<br>') + '</p>').join('') : '';
const hasTr = (o) => o && typeof o === 'object' && ((o.ka || '').replace(/<[^>]*>/g, '').trim() || (o.en || '').replace(/<[^>]*>/g, '').trim());

export async function libraCatalog(extras = {}, looks = {}) {
  const [settingsRows, cats, prods] = await Promise.all([
    rest('shop_settings?select=key,value'),
    all('categories', 'select=id,name,parent_id,sort&active=eq.true&order=sort.asc,name.asc'),
    all('products', 'select=id,code,name,description,category_id,unit,price_tetri,in_stock,image_url,allow_cashback,popularity,updated_at&active=eq.true&order=popularity.desc'),
  ]);
  const shop = Object.fromEntries(settingsRows.map((r) => [r.key, r.value]));

  let top = 0;
  const categories = cats.map((c) => {
    const lk = looks[c.id] || {};
    const auto = LOOKS.find(([re]) => re.test(c.name));
    const isTop = !c.parent_id;
    const i = isTop ? top++ : 0;
    return {
      id: c.id, parent: c.parent_id || null, libra: true,
      name: { ka: c.name, en: lk.name_en || '' },
      tagline: lk.tagline || { ka: '', en: '' },
      color: lk.color || (auto ? auto[1] : PALETTE[i % PALETTE.length]),
      icon: lk.icon ?? (auto ? auto[2] : ''),
      image: lk.image || (isTop ? (auto ? auto[3] : PHOTOS[i % PHOTOS.length]) : ''),
      hidden: !!lk.hidden, sort: lk.sort ?? c.sort ?? 0, slug: lk.slug || '',
    };
  });

  const products = prods.map((p) => {
    const x = extras[p.id] || {};
    const price = Math.round(p.price_tetri) / 100;
    return {
      id: p.id, libra: true, code: p.code || '', unit: p.unit || '',
      name: { ka: p.name, en: x.name_en || '' },
      brand: x.brand || '', category_id: p.category_id || null,
      price, old_price: x.old_price && x.old_price > price ? x.old_price : null,
      description: hasTr(x.description) ? x.description : { ka: textToHtml(p.description), en: '' },
      details: x.details || { ka: '', en: '' },
      variants: '', age: x.age || '',
      stock: p.in_stock ? null : 0,
      hot: !!x.hot, isNew: !!x.isNew, hidden: !!x.hidden, sort: x.sort || 0, cats: Array.isArray(x.cats) ? x.cats : [],
      popularity: p.popularity || 0, cashback: p.allow_cashback !== false,
      images: [p.image_url, ...(x.images || [])].filter(Boolean),
      created: String(p.updated_at || '').slice(0, 10),
    };
  });
  // nothing marked ★ yet → the most sold products are "featured"
  if (!products.some((p) => p.hot)) products.slice(0, 8).forEach((p) => { if (p.images.length) p.hot = true; });

  return { categories, products, shop };
}

/** Libra's shop settings → the site's settings shape (Libra is the source of truth for delivery/payment) */
export function applyShop(settings, shop) {
  const s = structuredClone(settings);
  const d = shop.delivery || {}, pay = shop.payment || {}, info = shop.shop || {};
  s.shop = {
    ...s.shop,
    courier: d.courier !== false, pickup: d.pickup !== false,
    delivery_fee: (d.fee_tetri ?? 500) / 100, free_from: (d.free_from_tetri ?? 0) / 100, min_order: (d.min_order_tetri ?? 0) / 100,
    delivery_note: d.note || '',
    pay_cash: !!pay.cash, pay_transfer: !!pay.transfer, pay_card: !!pay.card,
    iban: pay.iban || '', bank: pay.bank || '', recipient: pay.recipient || '',
    bank_details: [pay.recipient, pay.bank, pay.iban].filter(Boolean).join(' · '),
    guest_orders: shop.guest_orders === true || shop.guest_orders === 'true',
  };
  const c = s.contact || {};
  s.contact = { ...c, phone: c.phone || info.phone || '', whatsapp: c.whatsapp || info.whatsapp || '' };
  if (!c.hours?.ka && info.hours) s.contact.hours = { ka: info.hours, en: c.hours?.en || '' };
  if (Array.isArray(shop.levels)) s.levels = shop.levels;        // LIBRA-ს დონეები (სახელი, ბრუნვიდან, %, ფერი)
  s.libra = true;
  return s;
}
