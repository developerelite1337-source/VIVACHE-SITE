// Local preview without the Netlify CLI:  npm run local  →  http://localhost:8888
// Serves /public, runs the same functions (api.mjs, img.mjs) and stores data with the official
// local Netlify Blobs server in .netlify/blobs-local. Mirrors the redirects from netlify.toml.
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BlobsServer } from '@netlify/blobs/server';

const root = fileURLToPath(new URL('..', import.meta.url));
const pub = join(root, 'public');
const PORT = +process.env.PORT || 8888;

// local env (.env if present)
try {
  for (const line of (await readFile(join(root, '.env'), 'utf8')).split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch { /* no .env */ }
// npm run local:libra → test LIBRA mode against the fake Supabase (scripts/fake-supabase.mjs)
if (process.argv.includes('--libra')) {
  await import('./fake-supabase.mjs');
  process.env.SUPABASE_URL = `http://localhost:${process.env.FAKE_SUPABASE_PORT || 54321}`;
  process.env.SUPABASE_ANON_KEY = 'fake-anon-key';
  process.env.SUPABASE_SERVICE_KEY = 'fake-service-key';
  console.log('ℹ LIBRA რეჟიმი ყალბ Supabase-ზე — შესვლა: demo / demo1234');
}
if (!process.env.ADMIN_PASSWORD) { process.env.ADMIN_PASSWORD = 'vivace'; console.log('ℹ ADMIN_PASSWORD არ არის .env-ში — ლოკალურად პაროლია: vivace'); }

const blobs = new BlobsServer({ directory: join(root, '.netlify', 'blobs-local'), token: 'local' });
const { port: bport } = await blobs.start();
const edge = `http://localhost:${bport}`;
process.env.NETLIFY_BLOBS_CONTEXT = Buffer.from(JSON.stringify({ edgeURL: edge, uncachedEdgeURL: edge, siteID: 'local', token: 'local' })).toString('base64');

const api = (await import('../netlify/functions/api.mjs')).default;
const img = (await import('../netlify/functions/img.mjs')).default;

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.json': 'application/json', '.txt': 'text/plain', '.ico': 'image/x-icon' };

async function file(res, p, status = 200) {
  const body = await readFile(p);
  res.writeHead(status, { 'content-type': TYPES[extname(p)] || 'application/octet-stream', 'cache-control': 'no-cache' });
  res.end(body);
}
async function exists(p) { try { return (await stat(p)).isFile(); } catch { return false; } }

async function toRequest(req) {
  const chunks = []; for await (const c of req) chunks.push(c);
  const body = chunks.length && !['GET', 'HEAD'].includes(req.method) ? Buffer.concat(chunks) : undefined;
  return new Request(`http://localhost:${PORT}${req.url}`, { method: req.method, headers: req.headers, body });
}
async function send(res, r) {
  const headers = {}; r.headers.forEach((v, k) => { headers[k] = v; });
  res.writeHead(r.status, headers);
  res.end(Buffer.from(await r.arrayBuffer()));
}

http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x');
    let path = decodeURIComponent(url.pathname);
    if (path.startsWith('/api/')) return send(res, await api(await toRequest(req)));
    if (path.startsWith('/img/')) return send(res, await img(await toRequest(req)));
    if (req.method === 'POST' && path === '/') { res.writeHead(200); return res.end('ok (Netlify Forms works only on Netlify)'); }
    if (path.startsWith('/product/')) return file(res, join(pub, 'product.html'));
    if (path.startsWith('/post/')) return file(res, join(pub, 'article.html'));
    if (path.endsWith('/')) path += 'index.html';
    const p = normalize(join(pub, path));
    if (!p.startsWith(pub)) { res.writeHead(403); return res.end(); }
    if (await exists(p)) return file(res, p);
    if (await exists(p + '.html')) return file(res, p + '.html');
    return file(res, join(pub, '404.html'), 404);
  } catch (e) {
    console.error(e); res.writeHead(500); res.end(String(e));
  }
}).listen(PORT, () => console.log(`\n  Vivace → http://localhost:${PORT}\n  ადმინი → http://localhost:${PORT}/admin/\n`));
