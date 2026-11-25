// Serves images uploaded from the admin panel: /img/<key>
import { media } from './lib/db.mjs';

export const config = { path: '/img/*' };

export default async (req) => {
  const key = decodeURIComponent(new URL(req.url).pathname.replace(/^\/img\//, ''));
  if (!/^[a-z0-9]+\.(webp|jpg|png|gif|svg|avif)$/i.test(key)) return new Response('Not found', { status: 404 });
  const res = await media().getWithMetadata(key, { type: 'arrayBuffer' });
  if (!res) return new Response('Not found', { status: 404 });
  return new Response(res.data, {
    headers: {
      'content-type': res.metadata?.type || 'application/octet-stream',
      'cache-control': 'public, max-age=31536000, immutable',
      'x-content-type-options': 'nosniff',
      ...(key.endsWith('.svg') ? { 'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'" } : {}),
    },
  });
};
