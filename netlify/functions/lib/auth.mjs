// Admin sessions: stateless HMAC-signed tokens. Password comes from the ADMIN_PASSWORD env variable.
import { createHmac, timingSafeEqual } from 'node:crypto';

const DAY = 24 * 60 * 60 * 1000;
const env = (k) => (typeof Netlify !== 'undefined' && Netlify.env ? Netlify.env.get(k) : process.env[k]) || '';

function secret() {
  return env('ADMIN_SECRET') || ('vivace:' + env('ADMIN_PASSWORD'));
}
const b64 = (s) => Buffer.from(s).toString('base64url');
const sign = (data) => createHmac('sha256', secret()).update(data).digest('base64url');

function safeEqual(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
}

export function passwordConfigured() { return env('ADMIN_PASSWORD').length > 0; }

export function checkPassword(pw) {
  const real = env('ADMIN_PASSWORD');
  if (!real) return false;
  // compare hashes so length differences don't leak
  const h = (s) => createHmac('sha256', 'cmp').update(String(s)).digest('hex');
  return safeEqual(h(pw), h(real));
}

export function issueToken(name = 'admin', days = 7) {
  const payload = b64(JSON.stringify({ n: name, exp: Date.now() + days * DAY }));
  return payload + '.' + sign(payload);
}

export function verify(req) {
  const h = req.headers.get('authorization') || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  const [payload, sig] = token.split('.');
  if (!payload || !sig || !passwordConfigured() || !safeEqual(sig, sign(payload))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return data.exp > Date.now() ? data : null;
  } catch { return null; }
}

export { env };
