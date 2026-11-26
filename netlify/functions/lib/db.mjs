// Data layer on Netlify Blobs.
//   store "vivace"        → one JSON document per collection (settings, categories, brands, products, news, hero, pages)
//                           + one document per order under "orders/…"
//   store "vivace-media"  → uploaded images (served by /img/*)
// The first read of an empty collection writes the demo data from seed.mjs.
import { getStore } from '@netlify/blobs';
import { seed } from './seed.mjs';

// extras = site-only fields for Libra products {id: {...}}, looks = appearance of Libra categories {id: {...}}
export const COLLECTIONS = ['settings', 'categories', 'brands', 'products', 'news', 'hero', 'pages', 'extras', 'looks', 'sitecats'];
const OBJECT_COLLS = ['settings', 'pages', 'extras', 'looks'];

export const store = () => getStore({ name: 'vivace', consistency: 'strong' });
export const media = () => getStore({ name: 'vivace-media', consistency: 'strong' });

export async function get(name) {
  const s = store();
  let v = await s.get(name, { type: 'json' });
  if (v == null) {
    v = structuredClone(seed[name] ?? (OBJECT_COLLS.includes(name) ? {} : []));
    await s.setJSON(name, v);
  }
  if (name === 'settings') v = deepMerge(structuredClone(seed.settings), v);
  if (name === 'pages') v = { ...structuredClone(seed.pages), ...v };
  return v;
}

export async function put(name, value) {
  if (!COLLECTIONS.includes(name)) throw new Error('unknown collection ' + name);
  await store().setJSON(name, value);
  return value;
}

export async function getMany(names) {
  const vals = await Promise.all(names.map(get));
  return Object.fromEntries(names.map((n, i) => [n, vals[i]]));
}

/* ---------- orders: one blob each, key sorts newest first ---------- */
const MAXT = 9999999999999;
export function orderKey(ts = Date.now()) {
  return 'orders/' + String(MAXT - ts).padStart(13, '0') + '-' + Math.random().toString(36).slice(2, 6);
}
export async function listOrderKeys() {
  const { blobs } = await store().list({ prefix: 'orders/' });
  return blobs.map((b) => b.key).sort();
}
export async function getOrder(key) { return store().get(key, { type: 'json' }); }
export async function putOrder(key, order) { await store().setJSON(key, order); return order; }
export async function deleteOrder(key) { await store().delete(key); }

function deepMerge(base, over) {
  if (!over || typeof over !== 'object' || Array.isArray(over)) return over ?? base;
  const out = { ...base };
  for (const k of Object.keys(over)) {
    out[k] = base && typeof base[k] === 'object' && !Array.isArray(base[k]) && base[k] !== null ? deepMerge(base[k], over[k]) : over[k];
  }
  return out;
}
export { deepMerge };
