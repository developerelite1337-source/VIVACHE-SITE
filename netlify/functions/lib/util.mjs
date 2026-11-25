// Small helpers shared by the functions.

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
  });
}

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export async function body(req) {
  try { return await req.json(); } catch { throw new HttpError(400, 'არასწორი მონაცემები (JSON)'); }
}

export function uid(prefix = '') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export const str = (v, max = 500) => (v == null ? '' : String(v)).trim().slice(0, max);
export const num = (v) => { const n = parseFloat(String(v ?? '').replace(',', '.')); return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null; };
export const int = (v, d = 0) => { const n = parseInt(v, 10); return Number.isFinite(n) ? n : d; };
export const bool = (v) => v === true || v === 1 || v === '1' || v === 'on' || v === 'true';

/** translated field {ka, en} */
export function tr(v, max = 500) {
  if (v && typeof v === 'object') return { ka: str(v.ka, max), en: str(v.en, max) };
  return { ka: str(v, max), en: '' };
}

/** very small HTML sanitizer for admin rich text: keeps basic formatting, drops scripts and handlers */
export function cleanHtml(html, max = 60000) {
  let s = String(html ?? '').slice(0, max);
  s = s.replace(/<\s*(script|style|iframe|object|embed|form|input|button|meta|link)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '');
  s = s.replace(/<\s*(script|style|iframe|object|embed|form|input|button|meta|link)[^>]*\/?>/gi, '');
  s = s.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  s = s.replace(/(href|src)\s*=\s*("|')\s*javascript:[^"']*\2/gi, '$1="#"');
  s = s.replace(/\sstyle\s*=\s*("[^"]*"|'[^']*')/gi, '');
  return s.trim();
}
export function trHtml(v) {
  const o = v && typeof v === 'object' ? v : { ka: v };
  return { ka: cleanHtml(o.ka), en: cleanHtml(o.en) };
}

/** "A5 | 6.50" lines → [{label, price}] */
export function parseVariants(text) {
  return String(text || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean).map((l) => {
    const [label, price] = l.split('|').map((x) => (x || '').trim());
    return { label: label.slice(0, 80), price: num(price) };
  }).filter((v) => v.label);
}

export const isColor = (c) => /^#[0-9a-f]{3,8}$/i.test(String(c || ''));
