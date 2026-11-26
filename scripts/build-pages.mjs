import { writeFileSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
// Regenerates the HTML page shells in /public (they only load the shared CSS/JS). Usage: npm run pages
const out = process.argv[2] || fileURLToPath(new URL('../public', import.meta.url));
// ?v=<content hash> on CSS/JS → browsers load the new version right after a deploy
const v = (p) => { try { return p + '?v=' + createHash('md5').update(readFileSync(out + p)).digest('hex').slice(0, 8); } catch { return p; } };
const DESC = 'VIVACHE — საკანცელარიო, წიგნები, საჩუქრები და სათამაშოები ერთ ფერად მაღაზიაში. ონლაინ შეკვეთა და მიწოდება საქართველოში.';

const contactMain = `<div id="contact-hero"></div>
  <section class="section--tight"><div class="wrap c-grid">
    <div class="c-info" id="contact-info"></div>
    <form class="form-card" id="contact-form" name="contact" method="POST" data-netlify="true" netlify-honeypot="bot-field" data-anim="reveal">
      <input type="hidden" name="form-name" value="contact">
      <p class="hp"><label>Don't fill this out: <input name="bot-field"></label></p>
      <h2 class="h-3" data-i18n="ct_title">დაგვიკავშირდი</h2>
      <div class="row2">
        <label class="field"><span data-i18n="co_name">სახელი და გვარი</span><input name="name" required autocomplete="name"></label>
        <label class="field"><span data-i18n="co_phone">ტელეფონი</span><input name="phone" type="tel" autocomplete="tel"></label>
      </div>
      <label class="field"><span data-i18n="email">ელ-ფოსტა</span><input name="email" type="email" autocomplete="email"></label>
      <label class="field"><span data-i18n="ct_msg">შეტყობინება</span><textarea name="message" rows="5" required></textarea></label>
      <button class="btn btn--accent btn--wide" type="submit"><span data-i18n="ct_send">გაგზავნა</span></button>
    </form>
  </div></section>`;

const loader = '<div class="page-loader"><div class="page-loader__dots">' + ['#FF3D7F', '#FFB020', '#2F6BFF', '#22C55E'].map((c, i) => `<i style="--c:${c};--i:${i}"></i>`).join('') + '</div></div>';

const pages = [
  ['index', 'home', '', ''],
  ['shop', 'shop', 'მაღაზია', ''],
  ['product', 'product', 'პროდუქტი', ''],
  ['news', 'news', 'სიახლეები', ''],
  ['article', 'article', 'სიახლე', ''],
  ['about', 'page', 'ჩვენს შესახებ', 'about'],
  ['delivery', 'page', 'მიწოდება და დაბრუნება', 'delivery'],
  ['terms', 'page', 'წესები და პირობები', 'terms'],
  ['page', 'page', 'VIVACHE', ''],
  ['contact', 'contact', 'კონტაქტი', ''],
  ['checkout', 'checkout', 'შეკვეთის გაფორმება', ''],
  ['404', 'notfound', 'გვერდი ვერ მოიძებნა', ''],
  ['account', 'account', 'ჩემი ანგარიში', ''],
  ['wishlist', 'wishlist', 'რჩეულები', ''],
];

for (const [file, page, title, key] of pages) {
  const t = title ? `${title} · VIVACHE` : 'VIVACHE — საკანცელარიო · წიგნები · საჩუქრები · სათამაშოები';
  const html = `<!doctype html>
<html lang="ka">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${t}</title>
  <meta name="description" content="${DESC}">
  <meta name="theme-color" content="#FFF8F0">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${t}">
  <meta property="og:description" content="${DESC}">
  <meta property="og:locale" content="ka_GE">
  <link rel="icon" href="/assets/img/brand/favicon-64.png" type="image/png">
  <link rel="apple-touch-icon" href="/assets/img/brand/apple-touch-icon.png">
  <meta property="og:image" content="/assets/img/brand/banner.webp">
  ${page === 'checkout' || page === 'notfound' || page === 'account' ? '<meta name="robots" content="noindex">\n  ' : ''}<!-- motion is opt-in: hidden-until-revealed only when motion is allowed; removed if GSAP never loads -->
  <script>(function(d){if(!matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('motion');setTimeout(function(){if(!window.gsap)d.classList.remove('motion');},3000);}try{if(localStorage.getItem('vv_lang')==='en')d.lang='en';}catch(e){}})(document.documentElement);</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Noto+Sans+Georgian:wght@400..900&family=Noto+Sans:wght@400..900&display=swap">
  <link rel="stylesheet" href="${v('/assets/css/site.css')}">
</head>
<body data-page="${page}"${key ? ` data-key="${key}"` : ''}>
  <a class="skip-link" href="#main">მთავარ შინაარსზე გადასვლა</a>
  <div id="app-header"></div>
  <main id="main">
  ${page === 'contact' ? contactMain : loader}
  </main>
  <div id="app-footer"></div>
  <noscript><p style="padding:24px;text-align:center">VIVACHE-ს საიტს JavaScript სჭირდება.</p></noscript>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" defer></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" defer></script>
${['i18n', 'core', 'pages', 'account', 'music', 'newyear'].map((n) => '  <script src="' + v('/assets/js/' + n + '.js') + '" defer></script>').join('\n')}
</body>
</html>
`;
  writeFileSync(`${out}/${file}.html`, html);
}
writeFileSync(`${out}/favicon.svg`, '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="18" fill="#15171A"/><circle cx="20" cy="20" r="7" fill="#FF3D7F"/><circle cx="44" cy="20" r="7" fill="#FFB020"/><circle cx="20" cy="44" r="7" fill="#2F6BFF"/><circle cx="44" cy="44" r="7" fill="#22C55E"/><path d="M22 22l10 22 10-22" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>\n');
writeFileSync(`${out}/robots.txt`, 'User-agent: *\nDisallow: /admin/\nDisallow: /checkout\nDisallow: /api/\n');
console.log('pages ok');
