// Categories: one tree for the site, whatever the source.
//  • same name on the same level = one category (LIBRA duplicates, or a site category named like a LIBRA one);
//  • every category gets a readable Latin address: /shop?cat=<slug>  (e.g. „აუთლეტი“ → autleti, editable);
//  • a product may also be shown in extra categories (p.cats — e.g. „აუთლეტი“).

const KA = { ა: 'a', ბ: 'b', გ: 'g', დ: 'd', ე: 'e', ვ: 'v', ზ: 'z', თ: 't', ი: 'i', კ: 'k', ლ: 'l', მ: 'm', ნ: 'n', ო: 'o', პ: 'p',
  ჟ: 'zh', რ: 'r', ს: 's', ტ: 't', უ: 'u', ფ: 'p', ქ: 'k', ღ: 'gh', ყ: 'k', შ: 'sh', ჩ: 'ch', ც: 'ts', ძ: 'dz', წ: 'ts', ჭ: 'ch',
  ხ: 'kh', ჯ: 'j', ჰ: 'h' };

export function slugify(s) {
  return String(s || '').toLowerCase().trim()
    .replace(/[ა-ჰ]/g, (ch) => KA[ch] || '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48);
}

const norm = (s) => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();

// თემატიკით: ფერი, ემოჯი, ფოტო — ახალი კატეგორია ავტომატურად იღებს (ადმინში ყველაფერი იცვლება)
const P = (n) => `/assets/img/photos/${n}.webp`, C = (n) => `/assets/img/covers/${n}.webp`;
export const LOOKS = [
  [/აუთლეტ|outlet|ფასდაკლ|sale|აქცი|ლიკვიდ/i, '#E11D48', '🏷️', C('news')],
  [/ზღაპ|ამბ|საინტერეს|გამოცან|თავსატეხ|გასართ|ცოდნ|fun|fairy|puzzle|riddle/i, '#F59E0B', '🧩', C('interesting')],
  [/საკანცელარ|კანცელარ|stationery|კალამ|ფანქ|რვეულ|ბლოკნოტ/i, '#2F6BFF', '✏️', P('stationery')],
  [/სასკოლ|სკოლ|school|ჩანთ|პენალ/i, '#22C55E', '🎒', P('stationery')],
  [/წიგნ|book|ლიტერატ|სახელმძღვ/i, '#8B5CF6', '📚', P('books')],
  [/სათამაშ|თამაშ|toy|კონსტრუქ|ბავშვ|kids/i, '#FFB020', '🧸', P('toys')],
  [/საჩუქ|სასაჩუქ|gift|სუვენ|ნაკრებ/i, '#FF3D7F', '🎁', P('gifts')],
  [/ახალწ|ახალი წ|საახალწლო|new ?year|christmas|ნაძვ|შობ/i, '#E11D48', '🎄', P('newyear')],
  [/ხატვ|ხელოვ|ფერ|art|საღებ|ხელსაქმ|craft/i, '#14B8A6', '🎨', P('stationery')],
  [/ოფის|office|ქაღალდ|paper|პრინტ/i, '#0EA5E9', '🗂️', C('terms')],
];
export const PALETTE = ['#2F6BFF', '#8B5CF6', '#FF3D7F', '#FFB020', '#22C55E', '#14B8A6', '#F97316', '#E11D48'];
export function autoLook(name, i = 0) {
  const a = LOOKS.find(([re]) => re.test(name || ''));
  return a ? { color: a[1], icon: a[2], image: a[3] } : { color: PALETTE[i % PALETTE.length], icon: '✨', image: C('shop') };
}
const nameOf = (c) => norm((c.name && (c.name.ka || c.name.en)) || '');

/** site categories (Blobs „sitecats“) → the common category shape */
export function siteCats(list) {
  return (list || []).map((c, i) => { const au = autoLook(c.name?.ka || c.name?.en, i); return {
    id: c.id, site: true, libra: false, parent: c.parent || null,
    name: { ka: c.name?.ka || '', en: c.name?.en || '' }, tagline: c.tagline || { ka: '', en: '' },
    color: c.color || au.color, icon: c.icon || au.icon, image: c.image || (c.parent ? '' : au.image), slug: c.slug || '',
    hidden: !!c.hidden, sort: c.sort ?? 0,
  }; });
}

/**
 * Merge + slugs. Mutates products (category_id / cats point to the merged category).
 * Returns the final category list; merged ones carry `merged: [ids]`.
 */
export function finalize(categories, products) {
  const byId = new Map(categories.map((c) => [c.id, c]));
  const count = new Map();
  products.forEach((p) => [p.category_id, ...(p.cats || [])].forEach((id) => id && count.set(id, (count.get(id) || 0) + 1)));
  const depth = (c) => { let d = 0, x = c; while (x && x.parent && d < 12) { x = byId.get(x.parent); d++; } return d; };
  const alias = {};
  const canon = (id) => { let g = 0; while (id && alias[id] && g++ < 20) id = alias[id]; return id; };

  // parents first; on each level: LIBRA first, then the one with more products
  const order = [...categories].sort((a, b) => depth(a) - depth(b) || (b.libra ? 1 : 0) - (a.libra ? 1 : 0)
    || (count.get(b.id) || 0) - (count.get(a.id) || 0));
  const seen = new Map();
  for (const c of order) {
    const key = (c.parent ? canon(c.parent) : '') + '|' + nameOf(c);
    if (!nameOf(c)) continue;
    const k = seen.get(key);
    if (!k) { seen.set(key, c); continue; }
    alias[c.id] = k.id;
    (k.merged ||= []).push(c.id);
    if (c.site) {                                    // the site's settings win over LIBRA's automatic look
      for (const f of ['color', 'icon', 'image', 'slug']) if (c[f] && (f === 'slug' || !c.explicit || c.explicit[f])) k[f] = c[f];
      if (c.tagline && (c.tagline.ka || c.tagline.en)) k.tagline = c.tagline;
      if (c.name.en && !k.name.en) k.name = { ...k.name, en: c.name.en };
      if (c.hidden) k.hidden = true;
      k.siteTwin = c.id;
    }
  }
  const out = categories.filter((c) => !alias[c.id]).map((c) => ({ ...c, parent: c.parent ? canon(c.parent) : null }));
  products.forEach((p) => {
    if (p.category_id) p.category_id = canon(p.category_id);
    p.cats = [...new Set((p.cats || []).map(canon))].filter((x) => x && x !== p.category_id);
  });
  const used = new Set();
  for (const c of [...out].sort((a, b) => (a.libra ? 0 : 1) - (b.libra ? 0 : 1))) {
    const base = slugify(c.slug) || slugify(nameOf(c)) || 'cat';
    let s = base, i = 2;
    while (used.has(s)) s = `${base}-${i++}`;
    used.add(s);
    c.slug = s;
  }
  return out;
}
