// Serves images and music uploaded from the admin panel: /img/<key>
import { media } from './lib/db.mjs';

export const config = { path: '/img/*' };

export default async (req) => {
  const key = decodeURIComponent(new URL(req.url).pathname.replace(/^\/img\//, ''));
  if (!/^[a-z0-9]+\.(webp|jpg|png|gif|svg|avif|mp3|m4a|ogg|aac|wav)$/i.test(key)) return new Response('Not found', { status: 404 });
  const res = await media().getWithMetadata(key, { type: 'arrayBuffer' });
  if (!res) return new Response('Not found', { status: 404 });
  const headers = {
    'content-type': res.metadata?.type || 'application/octet-stream',
    'cache-control': 'public, max-age=31536000, immutable',
    'x-content-type-options': 'nosniff',
    'accept-ranges': 'bytes',
    ...(key.endsWith('.svg') ? { 'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'" } : {}),
  };
  // byte ranges → the music player can resume a song from the same second after a page reload
  const size = res.data.byteLength, m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.get('range') || '');
  if (m && (m[1] || m[2])) {
    let start = m[1] ? +m[1] : Math.max(0, size - +m[2]);
    let end = m[1] && m[2] ? Math.min(+m[2], size - 1) : size - 1;
    if (start >= size || start > end) return new Response(null, { status: 416, headers: { 'content-range': `bytes */${size}` } });
    return new Response(res.data.slice(start, end + 1), { status: 206, headers: { ...headers, 'content-range': `bytes ${start}-${end}/${size}`, 'content-length': String(end - start + 1) } });
  }
  return new Response(res.data, { headers });
};
