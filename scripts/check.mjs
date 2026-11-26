// Build-time sanity check (runs on Netlify as the build command): required files exist, JS parses.
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const must = [
  'public/index.html', 'public/shop.html', 'public/product.html', 'public/checkout.html', 'public/contact.html', 'public/404.html',
  'public/assets/css/site.css', 'public/assets/js/core.js', 'public/assets/js/pages.js', 'public/assets/js/i18n.js', 'public/assets/js/account.js', 'public/assets/js/newyear.js', 'public/account.html', 'public/wishlist.html', 'public/terms.html', 'public/page.html', 'public/assets/js/music.js',
  'public/admin/index.html', 'public/admin/admin.js', 'public/admin/admin.css',
  'netlify/functions/api.mjs', 'netlify/functions/img.mjs', 'netlify/functions/lib/supa.mjs',
];
let bad = 0;
for (const f of must) if (!existsSync(f)) { console.error('✗ missing', f); bad++; }
for (const f of must.filter((x) => /\.m?js$/.test(x))) {
  try { execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' }); } catch (e) { console.error('✗ syntax', f, String(e.stderr)); bad++; }
}
if (!readFileSync('public/contact.html', 'utf8').includes('data-netlify="true"')) { console.error('✗ contact form is not a Netlify form'); bad++; }
if (bad) process.exit(1);
console.log('✓ Vivace check passed (' + must.length + ' files)');
