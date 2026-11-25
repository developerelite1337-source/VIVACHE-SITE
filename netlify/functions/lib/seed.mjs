// Demo content written to Netlify Blobs on first run. Everything here is editable in /admin.
const I = (f) => `/assets/img/seed/${f}.svg`;
const t = (ka, en) => ({ ka, en });

const categories = [
  { id: 'stationery', parent: null, name: t('საკანცელარიო', 'Stationery'), tagline: t('რვეულები, კალმები, ჩანთები და ხატვა', 'Notebooks, pens, bags and art'), color: '#2F6BFF', icon: '✏️', sort: 1 },
  { id: 'books', parent: null, name: t('წიგნები', 'Books'), tagline: t('ზღაპრები, რომანები და სასწავლო წიგნები', 'Fairy tales, novels and learning'), color: '#8B5CF6', icon: '📚', sort: 2 },
  { id: 'gifts', parent: null, name: t('საჩუქრები', 'Gifts'), tagline: t('სასაჩუქრე ყუთები, დეკორი და ბარათები', 'Gift boxes, decor and cards'), color: '#FF3D7F', icon: '🎁', sort: 3 },
  { id: 'toys', parent: null, name: t('სათამაშოები', 'Toys'), tagline: t('რბილი სათამაშოები, კონსტრუქტორები, თავსატეხები', 'Plush, building sets, puzzles'), color: '#FFB020', icon: '🧸', sort: 4 },

  { id: 'notebooks', parent: 'stationery', name: t('რვეულები და ბლოკნოტები', 'Notebooks & pads'), sort: 1 },
  { id: 'pens', parent: 'stationery', name: t('კალმები და ფანქრები', 'Pens & pencils'), sort: 2 },
  { id: 'bags', parent: 'stationery', name: t('ზურგჩანთები და პენალები', 'Backpacks & cases'), sort: 3 },
  { id: 'art', parent: 'stationery', name: t('ხატვა და ხელოვნება', 'Art supplies'), sort: 4 },
  { id: 'kids-books', parent: 'books', name: t('საბავშვო წიგნები', 'Children\'s books'), sort: 1 },
  { id: 'fiction', parent: 'books', name: t('მხატვრული ლიტერატურა', 'Fiction'), sort: 2 },
  { id: 'learning', parent: 'books', name: t('სასწავლო და შემეცნებითი', 'Learning'), sort: 3 },
  { id: 'gift-sets', parent: 'gifts', name: t('სასაჩუქრე ნაკრებები', 'Gift sets'), sort: 1 },
  { id: 'decor', parent: 'gifts', name: t('დეკორი და სახლი', 'Decor & home'), sort: 2 },
  { id: 'cards', parent: 'gifts', name: t('ბარათები და დღესასწაული', 'Cards & party'), sort: 3 },
  { id: 'plush', parent: 'toys', name: t('რბილი სათამაშოები', 'Plush toys'), sort: 1 },
  { id: 'construct', parent: 'toys', name: t('კონსტრუქტორები', 'Building sets'), sort: 2 },
  { id: 'puzzles', parent: 'toys', name: t('თავსატეხები და სამაგიდო', 'Puzzles & board games'), sort: 3 },
  { id: 'active', parent: 'toys', name: t('მანქანები და აქტიური თამაში', 'Cars & active play'), sort: 4 },
].map((c) => ({ tagline: t('', ''), color: '', icon: '', image: '', hidden: false, ...c }));

const brands = [
  { id: 'b1', name: 'PaperLab', color: '#2F6BFF' },
  { id: 'b2', name: 'ColorPop', color: '#FF3D7F' },
  { id: 'b3', name: 'Bookland', color: '#8B5CF6' },
  { id: 'b4', name: 'ToyMoon', color: '#FFB020' },
  { id: 'b5', name: 'GiftBox Co.', color: '#14B8A6' },
  { id: 'b6', name: 'Vivace Kids', color: '#F97316' },
  { id: 'b7', name: 'Little Genius', color: '#22C55E' },
].map((b, i) => ({ logo: '', url: '', sort: i + 1, ...b }));

const P = (id, category_id, brand, ka, en, price, old_price, img, extra = {}) => ({
  id, category_id, brand, name: t(ka, en), price, old_price, images: [I(img)],
  description: t(`<p>${extra.dka || 'ხარისხიანი და ფერადი — იდეალურია ყოველდღიური გამოყენებისთვის და საჩუქრად.'}</p>`, `<p>${extra.den || 'Colourful and well made — perfect for everyday use and as a gift.'}</p>`),
  details: t('<ul><li>ოფიციალური მომწოდებლისგან</li><li>მიწოდება თბილისში 24 საათში</li></ul>', '<ul><li>From the official supplier</li><li>Delivery in Tbilisi within 24 hours</li></ul>'),
  variants: extra.variants || '', code: extra.code || id.toUpperCase(), age: extra.age || '', stock: extra.stock ?? 20,
  hot: !!extra.hot, isNew: !!extra.isNew, hidden: false, sort: extra.sort || 0, created: '2026-11-' + String(10 + (parseInt(id.slice(1), 10) % 15)).padStart(2, '0'),
});

const products = [
  P('p1', 'notebooks', 'PaperLab', 'სპირალური რვეული · 96 ფურცელი', 'Spiral notebook · 96 sheets', 6.5, 8.9, 'notebook', { hot: true, variants: 'A5 | 8.90\nA4 | 12.90', dka: 'მყარი ყდა, 80 გ/მ² ქაღალდი, უჯრედიანი ან ხაზიანი.' }),
  P('p2', 'pens', 'ColorPop', 'ფერადი ფანქრები · 24 ფერი', 'Coloured pencils · 24 colours', 14.9, 19.9, 'pencils', { hot: true, age: '3+' }),
  P('p3', 'pens', 'ColorPop', 'გელის კალმების ნაკრები · 12 ცალი', 'Gel pen set · 12 pcs', 11.5, null, 'pens', { isNew: true }),
  P('p4', 'bags', 'Vivace Kids', 'სასკოლო ზურგჩანთა „კოსმოსი“', 'School backpack “Cosmos”', 89, 119, 'backpack', { hot: true, age: '6+', dka: 'ორთოპედიული ზურგი, ამრეკლი ზოლები, 3 განყოფილება.' }),
  P('p5', 'art', 'ColorPop', 'აკვარელის ნაკრები · 18 ფერი + ფუნჯი', 'Watercolour set · 18 colours + brush', 18.9, null, 'paints', { age: '4+' }),
  P('p6', 'notebooks', 'PaperLab', 'წებოვანი ფურცლები · ნეონი', 'Sticky notes · neon', 4.9, null, 'sticky', { isNew: true }),
  P('p7', 'kids-books', 'Bookland', 'ზღაპრები ძილის წინ · ილუსტრირებული', 'Bedtime stories · illustrated', 24.9, null, 'book-kids', { hot: true, age: '3+' }),
  P('p8', 'fiction', 'Bookland', 'რომანების კოლექცია · 3 წიგნი', 'Novel collection · 3 books', 59, 75, 'books', {}),
  P('p9', 'learning', 'Little Genius', 'ინგლისური ბავშვებისთვის · სავარჯიშო წიგნი', 'English for kids · workbook', 16.5, null, 'book-learn', { isNew: true, age: '5+' }),
  P('p10', 'learning', 'Little Genius', 'ბავშვის გლობუსი შუქით', 'Illuminated kids globe', 49, null, 'globe', { age: '5+' }),
  P('p11', 'gift-sets', 'GiftBox Co.', 'სასაჩუქრე ყუთი „სიურპრიზი“', 'Gift box “Surprise”', 39, 52, 'giftbox', { hot: true, variants: 'პატარა | 52\nდიდი | 89' }),
  P('p12', 'decor', 'GiftBox Co.', 'კერამიკული ფინჯანი · ფერადი', 'Ceramic mug · colourful', 19.9, null, 'mug', {}),
  P('p13', 'decor', 'GiftBox Co.', 'არომატული სანთელი · ვანილი', 'Scented candle · vanilla', 22, null, 'candle', { isNew: true }),
  P('p14', 'cards', 'PaperLab', 'მისალოცი ბარათები · 10 ცალი', 'Greeting cards · 10 pcs', 12, null, 'cards', {}),
  P('p15', 'plush', 'ToyMoon', 'რბილი დათუნია · 40 სმ', 'Teddy bear · 40 cm', 45, 59, 'teddy', { hot: true, age: '0+', variants: '40 სმ | 59\n60 სმ | 95' }),
  P('p16', 'construct', 'ToyMoon', 'კონსტრუქტორი · 250 დეტალი', 'Building set · 250 pieces', 69, null, 'blocks', { hot: true, isNew: true, age: '6+' }),
  P('p17', 'puzzles', 'Little Genius', 'თავსატეხი „ქალაქი“ · 500 ნაწილი', 'Puzzle “City” · 500 pieces', 27, null, 'puzzle', { age: '8+' }),
  P('p18', 'active', 'ToyMoon', 'რადიომართვადი მანქანა', 'Remote control car', 79, 99, 'car', { hot: true, age: '6+' }),
  P('p19', 'active', 'Vivace Kids', 'სათამაშო რაკეტა · შუქით და ხმით', 'Toy rocket · lights & sound', 35, null, 'rocket', { isNew: true, age: '3+' }),
  P('p20', 'cards', 'Vivace Kids', 'ბუშტების ნაკრები · დღესასწაული', 'Party balloon set', 9.9, null, 'balloons', {}),
];

const news = [
  { id: 'n1', date: '2026-11-24', pinned: true, color: '#111111', image: I('giftbox'),
    title: t('შავი პარასკევი Vivace-ში — ფასდაკლებები 40%-მდე', 'Black Friday at Vivace — up to 40% off'),
    excerpt: t('27–30 ნოემბერს ფასდაკლება სათამაშოებზე, საჩუქრებსა და სასკოლო ნივთებზე.', 'From 27 to 30 November: discounts on toys, gifts and school supplies.'),
    text: t('<p>ოთხი დღის განმავლობაში ასობით პროდუქტი სპეციალურ ფასად. აქცია მოქმედებს როგორც ონლაინ, ისე მაღაზიებში.</p><h3>რა შედის აქციაში</h3><ul><li>სათამაშოები — 30%-მდე</li><li>სასკოლო ზურგჩანთები — 25%</li><li>სასაჩუქრე ყუთები — 25%</li></ul>', '<p>Hundreds of products at special prices for four days, online and in our stores.</p>') },
  { id: 'n2', date: '2026-11-18', pinned: true, color: '#FF3D7F', image: I('teddy'),
    title: t('საახალწლო საჩუქრების გზამკვლევი', 'New Year gift guide'),
    excerpt: t('შევარჩიეთ საუკეთესო საჩუქრები ყველა ასაკისთვის — 10 ლარიდან.', 'The best gifts for every age — from 10 GEL.'),
    text: t('<p>ბავშვებისთვის, მასწავლებლებისთვის, კოლეგებისთვის — ყველასთვის მოიძებნება რაღაც განსაკუთრებული.</p>', '<p>For kids, teachers and colleagues — something special for everyone.</p>') },
  { id: 'n3', date: '2026-11-10', pinned: false, color: '#2F6BFF', image: I('backpack'),
    title: t('სასკოლო ნივთების ახალი კოლექცია', 'New school collection'),
    excerpt: t('ახალი ზურგჩანთები, პენალები და რვეულები უკვე მაღაზიაშია.', 'New backpacks, cases and notebooks are in store.'),
    text: t('<p>ფერადი, მსუბუქი და გამძლე — ახალი კოლექცია შექმნილია ყოველდღიური სასკოლო ცხოვრებისთვის.</p>', '<p>Colourful, light and durable — made for everyday school life.</p>') },
].map((n) => ({ hidden: false, ...n }));

const PH = (n) => `/assets/img/photos/${n}.webp`;
const hero = [
  { id: 'h0', layout: 'banner', color: '#FFD400', image: '/assets/img/brand/banner.webp', bg: '', products: [],
    eyebrow: t('', ''), title: t('VIVACHE — საკანცელარიო, წიგნები, საჩუქრები, სათამაშოები', 'VIVACHE — stationery, books, gifts, toys'), lead: t('', ''),
    cta: t('პროდუქცია', 'Products'), cta_url: '/shop', cta2: t('', ''), cta2_url: '' },
  { id: 'h1', layout: 'photo', color: '#E11D48', image: '', bg: PH('newyear'), products: ['p15', 'p11'],
    eyebrow: t('საახალწლო კოლექცია', 'New Year collection'),
    title: t('ჯადოსნური ახალი წელი <em>ვივაჩესთან</em>', 'A magical New Year <em>with VIVACHE</em>'),
    lead: t('საჩუქრები, სათამაშოები და სადღესასწაულო დეკორი მთელი ოჯახისთვის — ლამაზ შეფუთვაში.', 'Gifts, toys and festive decor for the whole family — beautifully wrapped.'),
    cta: t('საჩუქრების ნახვა', 'Shop gifts'), cta_url: '/shop?cat=gifts', cta2: t('ფასდაკლებები', 'Deals'), cta2_url: '/shop?sale=1' },
  { id: 'h2', layout: 'photo', color: '#2F6BFF', image: '', bg: PH('stationery'), products: ['p4', 'p2'],
    eyebrow: t('საკანცელარიო', 'Stationery'),
    title: t('ყველაფერი სწავლისთვის <em>ერთ ადგილას</em>', 'Everything for school <em>in one place</em>'),
    lead: t('რვეულები, კალმები, ზურგჩანთები და ხატვის ნაკრებები — ფერადი და ხარისხიანი.', 'Notebooks, pens, backpacks and art sets — colourful and well made.'),
    cta: t('საკანცელარიო', 'Stationery'), cta_url: '/shop?cat=stationery', cta2: t('ყველა პროდუქტი', 'All products'), cta2_url: '/shop' },
  { id: 'h3', layout: 'photo', color: '#8B5CF6', image: '', bg: PH('books'), products: ['p7'],
    eyebrow: t('წიგნები', 'Books'),
    title: t('წიგნები, რომლებიც <em>ოცნებას აღვიძებს</em>', 'Books that <em>spark dreams</em>'),
    lead: t('ზღაპრები, რომანები და შემეცნებითი წიგნები პატარებისა და დიდებისთვის.', 'Fairy tales, novels and learning books for little and big readers.'),
    cta: t('წიგნები', 'Books'), cta_url: '/shop?cat=books', cta2: t('სიახლეები', 'News'), cta2_url: '/news' },
  { id: 'h4', layout: 'photo', color: '#FFB020', image: '', bg: PH('toys'), products: ['p16'],
    eyebrow: t('სათამაშოები', 'Toys'),
    title: t('თამაში, ფანტაზია <em>და დიდი ღიმილი</em>', 'Play, imagination <em>and big smiles</em>'),
    lead: t('რბილი სათამაშოები, კონსტრუქტორები და თავსატეხები ყველა ასაკისთვის.', 'Plush toys, building sets and puzzles for every age.'),
    cta: t('სათამაშოები', 'Toys'), cta_url: '/shop?cat=toys', cta2: t('კატეგორიები', 'Categories'), cta2_url: '/#directions' },
].map((h, i) => ({ hidden: false, sort: i + 1, ...h }));

const pages = {
  about: {
    title: t('ჩვენს შესახებ', 'About us'),
    lead: t('VIVACHE — ფერადი მაღაზია ბათუმში, სადაც სკოლა, კითხვა, თამაში და საჩუქრები ერთმანეთს ხვდება.', 'VIVACHE is a colourful store in Batumi where school, reading, play and gifts meet.'),
    text: t('<p>ჩვენ ვარჩევთ პროდუქციას, რომელიც ბავშვებს ახალისებს და მშობლებს ენდობა: საკანცელარიო ნივთები, წიგნები, სათამაშოები და საჩუქრები, რომლებსაც დიდხანს ახსოვთ.</p><p>ყოველ ყიდვაზე გროვდება <b>ქეშბექი</b> VIVACHE-ს ბარათზე — გამოიყენე მაღაზიაშიც და ონლაინაც.</p><p>გვეწვიეთ მაღაზიაში ან შეუკვეთეთ ონლაინ.</p>', '<p>We choose products kids love and parents trust: stationery, books, toys and gifts people remember.</p><p>Every purchase earns <b>cashback</b> on your VIVACHE card — use it in store and online.</p>'),
    image: PH('gifts'),
  },
  delivery: {
    title: t('მიწოდება და დაბრუნება', 'Delivery & returns'),
    lead: t('როგორ მუშაობს შეკვეთა, მიწოდება და დაბრუნება.', 'How ordering, delivery and returns work.'),
    text: t('<h3>მიწოდება</h3><p>ბათუმში — კურიერით, რეგიონებში — 2–4 სამუშაო დღეში. შეკვეთა შეგიძლია მაღაზიიდანაც გაიტანო.</p><h3>გადახდა</h3><p>ნაღდი ანგარიშსწორება მიღებისას ან საბანკო გადარიცხვა. ქეშბექის ბალანსით გადახდა — ანგარიშზე შესულ მომხმარებლებს.</p><h3>დაბრუნება</h3><p>გამოუყენებელი ნივთის დაბრუნება შესაძლებელია 14 დღის განმავლობაში.</p>', '<h3>Delivery</h3><p>Courier in Batumi, regions in 2–4 working days, or pick up in store.</p><h3>Returns</h3><p>Unused items can be returned within 14 days.</p>'),
    image: '',
  },
};

const settings = {
  site: { name: 'VIVACHE', tagline: t('საკანცელარიო · წიგნები · საჩუქრები · სათამაშოები', 'Stationery · Books · Gifts · Toys'), logo: '/assets/img/brand/logo.webp' },
  promo: {
    enabled: true, style: 'blackfriday', // default | blackfriday | sale | news
    text: t('BLACK FRIDAY · ფასდაკლებები 40%-მდე · 27–30 ნოემბერი', 'BLACK FRIDAY · up to 40% off · 27–30 November'),
    link: '/shop?sale=1', ends: '2026-11-30T23:59', news: true,
  },
  band: {
    style: 'blackfriday', badge: 'BLACK FRIDAY · −40%',
    eyebrow: t('VIVACHE', 'VIVACHE'), title: t('შავი პარასკევის შეთავაზებები', 'Black Friday deals'),
    meta: t(':products პროდუქტი · :brands ბრენდი', ':products products · :brands brands'),
    btn: t('ყველა ფასდაკლება', 'All deals'), url: '/shop?sale=1',
    mode: 'auto', manual: [], count: 16, featured: true, daily: false, source: 'all',
    words: t('რვეულები, კალმები, წიგნები, საჩუქრები, სათამაშოები, თავსატეხები, ზურგჩანთები, ფერადი ფანქრები, ბარათები, კონსტრუქტორები', 'Notebooks, Pens, Books, Gifts, Toys, Puzzles, Backpacks, Pencils, Cards, Building sets'),
  },
  newyear: { enabled: true, snow: true, garland: true, santa: true, elves: true, music: true, countdown: true },
  weather: { enabled: true, city: 'ბათუმი', lat: 41.6168, lon: 41.6367 },
  cashback: {
    enabled: true, image: '/assets/img/brand/cashback-card.webp',
    eyebrow: t('ქეშბექ ბარათი', 'Cashback card'),
    title: t('ყოველი ყიდვა გიბრუნდება', 'Every purchase pays you back'),
    lead: t('VIVACHE-ს ქეშბექ ბარათით ყოველ ყიდვაზე ბალანსი გროვდება. გამოიყენე მაღაზიაშიც და საიტზეც — შედი ანგარიშზე და ნახე შენი ბალანსი.', 'Collect cashback on every purchase with your VIVACHE card and spend it in store or online.'),
    btn: t('ჩემი ბარათი', 'My card'),
  },
  numbers: { products: '', brands: '', years: '', stores: '1' },
  contact: {
    phone: '', whatsapp: '', email: '',
    address: t('ბათუმი, მელიქიშვილის II შესახვევი №1', 'Batumi, 1 Melikishvili 2nd Lane'),
    hours: t('', ''),
    map_query: 'Melikishvili 2nd Lane 1, Batumi, Georgia', map_coords: '',
    facebook: '', instagram: '', tiktok: '',
  },
  shop: { delivery_fee: 5, free_from: 50, pickup: true, courier: true, pay_cash: true, pay_transfer: true, pay_card: false, bank_details: '', guest_orders: true },
  home: { hero: true, band: true, directions: true, hot: true, sale: true, features: true, news: true, cashback: true, brands: true },
};

export const seed = { categories, brands, products, news, hero, pages, settings, extras: {}, looks: {} };
