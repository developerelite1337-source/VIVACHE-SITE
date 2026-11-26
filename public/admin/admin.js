/* ==========================================================================
   Vivace admin — single-page panel (hash routes), same screens & behaviour as akzonobelgeo admin v2.
   Data: /api/admin/* (Netlify Functions + Blobs). Auth: Bearer token from /api/admin/login.
   ========================================================================== */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const T = (o) => (o && typeof o === 'object' ? o.ka || o.en || '' : o || '');
  const money = (n) => (Math.round((+n || 0) * 100) / 100).toFixed(2) + ' ₾';
  const fmtDate = (d) => { try { return new Date(d).toLocaleString('ka-GE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return d; } };
  const LANGS = [['ka', 'KA'], ['en', 'EN']];
  const COLORS = ['#FF3D7F', '#FFB020', '#2F6BFF', '#22C55E', '#8B5CF6', '#14B8A6', '#F97316'];
  const STATUS = { new: 'ახალი', confirmed: 'დადასტურებული', processing: 'მუშავდება', shipped: 'გაგზავნილი', completed: 'დასრულებული', cancelled: 'გაუქმებული' };
  const PAY = { cash: 'ნაღდი მიღებისას', transfer: 'საბანკო გადარიცხვა', card: 'ბარათით მიღებისას' };

  const A = { token: localStorage.getItem('vv_admin') || '', data: null, dirty: false, lastHash: '' };

  /* ---------------- icons ---------------- */
  const P = {
    app: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z', cart: 'M6 8h12l-1 12H7L6 8zM9 8V6a3 3 0 0 1 6 0v2', box: 'M3 7l9-4 9 4-9 4-9-4zM3 7v10l9 4 9-4V7M12 11v10',
    menu: 'M4 7h16M4 12h16M4 17h16', tag: 'M3 12V4h8l10 10-8 8L3 12zM7.5 8.5h.01', star: 'M12 3l2.8 5.8 6.2.9-4.5 4.4 1 6.2-5.5-3-5.5 3 1-6.2L3 9.7l6.2-.9z',
    image: 'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M15 9.5h.01', swatch: 'M3 8h18M3 16h18M7 4v16M17 4v16', zap: 'M13 2 4 14h7l-1 8 9-12h-7z', info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 8h.01M11 12h1v5h1',
    file: 'M6 3h8l4 4v14H6zM14 3v4h4M9 13h6M9 17h6', gear: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
    plus: 'M12 5v14M5 12h14', search: 'M20 20l-4.2-4.2M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z', trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13', 'arrow-up-right': 'M7 17 17 7M8 7h9v9',
    'chevron-right': 'M9 6l6 6-6 6', logout: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10', print: 'M7 9V3h10v6M7 17H4v-6h16v6h-3M7 14h10v7H7z', download: 'M12 4v12M7 11l5 5 5-5M4 20h16',
    upload: 'M12 20V8M7 13l5-5 5 5M4 4h16', check: 'M5 12l5 5 9-10', eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', 'eye-off': 'M3 3l18 18M10.6 6.1A9.6 9.6 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3.2 3.9M6.6 6.6A17 17 0 0 0 2 12s3.5 6 10 6a9.4 9.4 0 0 0 4.4-1.1',
    tree: 'M12 2l5 7h-3l4 6h-4l4 6H6l4-6H6l4-6H7zM12 21v2', link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
    music: 'M9 18V6l11-2v12M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z', globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18', phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2',
  };
  const icon = (n, cls = 'icon--sm') => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${P[n] || ''}"/></svg>`;

  /* ---------------- api ---------------- */
  async function api(method, path, body, raw) {
    const opt = { method, headers: { authorization: 'Bearer ' + A.token } };
    if (raw) { opt.body = raw; opt.headers['content-type'] = raw.type || 'application/octet-stream'; }
    else if (body !== undefined) { opt.body = JSON.stringify(body); opt.headers['content-type'] = 'application/json'; }
    const r = await fetch('/api/admin/' + path, opt);
    let j = null; try { j = await r.json(); } catch { /* empty */ }
    if (r.status === 401 && path !== 'login') { logout(true); throw new Error('სესია ამოიწურა — შედი თავიდან'); }
    if (!r.ok) throw new Error((j && j.error) || 'შეცდომა ' + r.status);
    return j;
  }

  /* ---------------- toast / confirm ---------------- */
  let tt;
  function toast(msg, err) {
    const t = $('#ad-toast'); t.innerHTML = (err ? '' : icon('check')) + ' ' + esc(msg);
    t.classList.toggle('is-err', !!err); t.classList.add('is-on');
    clearTimeout(tt); tt = setTimeout(() => t.classList.remove('is-on'), 2800);
  }
  function confirmBox(text, ok = 'წაშლა', title = 'დარწმუნებული ხარ?', danger = true) {
    const d = $('#ad-confirm');
    $('[data-confirm-text]', d).textContent = text; $('[data-confirm-title]', d).textContent = title;
    const b = $('[data-confirm-ok]', d); b.textContent = ok; b.className = 'ad-btn ' + (danger ? 'ad-btn--danger' : 'ad-btn--accent');
    d.showModal();
    return new Promise((res) => d.addEventListener('close', () => res(d.returnValue === 'ok'), { once: true }));
  }
  const fail = (e) => { console.error(e); toast(e.message || String(e), true); };

  /* ---------------- field builders ---------------- */
  function trField(name, label, value, o = {}) {
    value = value && typeof value === 'object' ? value : { ka: value || '', en: '' };
    const tabs = LANGS.map(([l, L], i) => `<button type="button" data-lang="${l}" aria-selected="${i ? 'false' : 'true'}" class="${(value[l] || '').replace(/<[^>]*>/g, '').trim() ? 'has' : ''}">${L}</button>`).join('');
    const panes = LANGS.map(([l], i) => {
      const v = value[l] || '';
      const n = `${name}.${l}`;
      let input;
      if (o.type === 'rich') input = richEditor(n, v, o.ph);
      else if (o.type === 'text') input = `<textarea name="${n}" rows="${o.rows || 3}" placeholder="${esc(o.ph || '')}">${esc(v)}</textarea>`;
      else input = `<input type="text" name="${n}" value="${esc(v)}" placeholder="${esc(o.ph || '')}"${o.required && l === 'ka' ? ' required' : ''}>`;
      return `<div data-pane="${l}"${i ? ' hidden' : ''}>${input}</div>`;
    }).join('');
    return `<div class="ad-tr"><div class="ad-tr__head"><span class="ad-tr__label">${esc(label)}${o.required ? ' <b class="req">*</b>' : ''}</span><div class="ad-tr__tabs" role="tablist">${tabs}</div></div>${panes}${o.hint ? `<small class="ad-hint">${o.hint}</small>` : ''}</div>`;
  }
  function richEditor(name, html, ph) {
    return `<div class="ad-rich"><div class="ad-rich__bar">
      <button type="button" data-cmd="bold" title="მუქი"><b>B</b></button><button type="button" data-cmd="italic" title="დახრილი"><i>I</i></button>
      <button type="button" data-cmd="formatBlock" data-arg="h3" title="სათაური">H</button><button type="button" data-cmd="formatBlock" data-arg="p" title="აბზაცი">¶</button>
      <button type="button" data-cmd="insertUnorderedList" title="სია">•</button><button type="button" data-cmd="insertOrderedList" title="დანომრილი სია">1.</button>
      <button type="button" data-cmd="createLink" title="ბმული">🔗</button><button type="button" data-cmd="removeFormat" title="ფორმატის მოხსნა">⌫</button></div>
      <div class="ad-rich__area" contenteditable="true" data-rich="${name}" data-ph="${esc(ph || 'ტექსტი…')}">${html || ''}</div></div>`;
  }
  const field = (name, label, value, o = {}) => `<label class="ad-field"><span>${label}${o.required ? ' <b class="req">*</b>' : ''}${o.sub ? ` <small>${o.sub}</small>` : ''}</span>${
    o.type === 'textarea' ? `<textarea name="${name}" rows="${o.rows || 4}" placeholder="${esc(o.ph || '')}">${esc(value)}</textarea>`
    : `<input type="${o.type || 'text'}" name="${name}" value="${esc(value ?? '')}" placeholder="${esc(o.ph || '')}"${o.attrs || ''}${o.required ? ' required' : ''}>`}${o.hint ? `<small class="ad-hint">${o.hint}</small>` : ''}</label>`;
  const sw = (name, label, on, hint) => `<label class="ad-check ad-check--switch"><input type="checkbox" name="${name}" ${on ? 'checked' : ''}> <span>${label}${hint ? `<small class="ad-hint" style="font-weight:500">${hint}</small>` : ''}</span></label>`;
  const select = (name, label, opts, value, hint) => `<label class="ad-field"><span>${label}</span><select name="${name}">${opts.map(([v, l]) => `<option value="${esc(v)}"${String(v) === String(value ?? '') ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select>${hint ? `<small class="ad-hint">${hint}</small>` : ''}</label>`;
  const imagesField = (name, list) => `<div class="ad-imgs" data-images="${name}" data-value="${esc(JSON.stringify(list || []))}"></div>
    <label class="ad-drop" data-drop>${icon('plus', '')}<input type="file" accept="image/*" multiple data-upload="${name}"><span>სურათის ატვირთვა<br><small>JPG, PNG, WebP, SVG · რამდენიმე ერთად · გადაათრიე რიგითობისთვის</small></span></label>`;
  const imageField = (name, value, hint) => `<div data-image="${name}" data-value="${esc(value || '')}"></div>
    <label class="ad-drop" data-drop>${icon('plus', '')}<input type="file" accept="image/*" data-upload1="${name}"><span>${value ? 'სურათის შეცვლა' : 'სურათის ატვირთვა'}<br><small>${hint || 'JPG, PNG, WebP, SVG'}</small></span></label>`;

  function setPath(obj, path, v) {
    const ks = path.split('.'); let o = obj;
    ks.slice(0, -1).forEach((k) => { o[k] = o[k] && typeof o[k] === 'object' ? o[k] : {}; o = o[k]; });
    o[ks[ks.length - 1]] = v;
  }
  function collect(form) {
    const out = {};
    $$('[name]', form).forEach((el) => {
      if (el.closest('[data-ignore]') || !el.name) return;
      if (el.type === 'radio') { if (el.checked) setPath(out, el.name, el.value); return; }
      setPath(out, el.name, el.type === 'checkbox' ? el.checked : el.value);
    });
    $$('[data-rich]', form).forEach((ed) => setPath(out, ed.dataset.rich, ed.innerHTML.trim() === '<br>' ? '' : ed.innerHTML));
    $$('[data-images]', form).forEach((b) => setPath(out, b.dataset.images, JSON.parse(b.dataset.value || '[]')));
    $$('[data-image]', form).forEach((b) => setPath(out, b.dataset.image, b.dataset.value || ''));
    $$('[data-picks]', form).forEach((b) => setPath(out, b.dataset.picks, JSON.parse(b.dataset.value || '[]')));
    return out;
  }

  /* images: client-side resize → upload */
  async function resize(file, max = 1600) {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || !window.createImageBitmap) return file;
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    const blob = await new Promise((r) => c.toBlob(r, 'image/webp', 0.86));
    return blob && blob.size < file.size ? blob : file;
  }
  async function upload(file) {
    const blob = await resize(file);
    if (blob.size > 5 * 1024 * 1024) throw new Error('სურათი 5MB-ზე დიდია');
    return (await api('POST', 'upload', undefined, blob)).url;
  }
  function renderImages(box) {
    const list = JSON.parse(box.dataset.value || '[]');
    box.innerHTML = list.map((src, i) => `<figure class="ad-img" data-src="${esc(src)}"><img src="${esc(src)}" alt=""><div class="ad-img__acts">${i ? `<button type="button" data-cover="${i}" title="მთავარ სურათად">★</button>` : ''}<button type="button" class="is-del" data-del-img="${i}" title="წაშლა">✕</button></div></figure>`).join('');
    if (window.Sortable && !box._sortable) box._sortable = Sortable.create(box, { animation: 160, onEnd: () => { box.dataset.value = JSON.stringify($$('.ad-img', box).map((f) => f.dataset.src)); renderImages(box); dirty(); } });
  }
  function renderImage(box) {
    const v = box.dataset.value;
    box.innerHTML = v ? `<div class="ad-single"><img src="${esc(v)}" alt=""><button type="button" data-clear-img title="წაშლა">✕</button></div>` : '';
  }

  function dirty() { A.dirty = true; }
  function bindForm(root) {
    $$('[data-images]', root).forEach(renderImages);
    $$('[data-image]', root).forEach(renderImage);
    root.addEventListener('input', (e) => { if (!e.target.closest('[data-ignore]')) dirty(); if (e.target.closest('.ad-tr')) markTabs(e.target.closest('.ad-tr')); });
    root.addEventListener('click', (e) => {
      const tab = e.target.closest('.ad-tr__tabs button');
      if (tab) {
        const tr = tab.closest('.ad-tr'), l = tab.dataset.lang;
        $$('.ad-tr__tabs button', tr).forEach((b) => b.setAttribute('aria-selected', b === tab));
        $$('[data-pane]', tr).forEach((p) => { p.hidden = p.dataset.pane !== l; });
        return;
      }
      const cmd = e.target.closest('[data-cmd]');
      if (cmd) {
        e.preventDefault();
        const area = cmd.closest('.ad-rich').querySelector('.ad-rich__area'); area.focus();
        let arg = cmd.dataset.arg || null;
        if (cmd.dataset.cmd === 'createLink') { arg = prompt('ბმული (https://…)'); if (!arg) return; }
        document.execCommand(cmd.dataset.cmd, false, arg); dirty(); return;
      }
      const cover = e.target.closest('[data-cover]'), del = e.target.closest('[data-del-img]');
      if (cover || del) {
        const box = e.target.closest('[data-images]'); const list = JSON.parse(box.dataset.value);
        if (cover) { const [x] = list.splice(+cover.dataset.cover, 1); list.unshift(x); } else list.splice(+del.dataset.delImg, 1);
        box.dataset.value = JSON.stringify(list); renderImages(box); dirty(); return;
      }
      const clr = e.target.closest('[data-clear-img]');
      if (clr) { const box = clr.closest('[data-image]'); box.dataset.value = ''; renderImage(box); dirty(); }
    });
    root.addEventListener('change', async (e) => {
      const multi = e.target.dataset.upload, single = e.target.dataset.upload1;
      if (!multi && !single) return;
      const drop = e.target.closest('.ad-drop'); drop.classList.add('is-busy');
      try {
        const files = [...e.target.files];
        if (multi) {
          const box = $(`[data-images="${multi}"]`, root); const list = JSON.parse(box.dataset.value || '[]');
          for (const f of files) list.push(await upload(f));
          box.dataset.value = JSON.stringify(list); renderImages(box);
        } else {
          const box = $(`[data-image="${single}"]`, root); box.dataset.value = await upload(files[0]); renderImage(box);
        }
        dirty(); toast('სურათი აიტვირთა');
      } catch (err) { fail(err); } finally { drop.classList.remove('is-busy'); e.target.value = ''; }
    });
    $$('[data-drop]', root).forEach((d) => {
      d.addEventListener('dragover', () => d.classList.add('is-over'));
      ['dragleave', 'drop'].forEach((ev) => d.addEventListener(ev, () => d.classList.remove('is-over')));
    });
  }
  function markTabs(tr) {
    $$('.ad-tr__tabs button', tr).forEach((b) => {
      const pane = $(`[data-pane="${b.dataset.lang}"]`, tr); const el = $('input, textarea, [data-rich]', pane);
      const v = el ? (el.value ?? el.innerText ?? '') : '';
      b.classList.toggle('has', String(v || (el && el.innerText) || '').trim().length > 0);
    });
  }

  /* ---------------- data helpers ---------------- */
  const D = () => A.data;
  const cat = (id) => D().categories.find((c) => c.id === id);
  const kids = (id) => D().categories.filter((c) => (c.parent || null) === (id || null)).sort((a, b) => (a.sort || 0) - (b.sort || 0));
  const desc = (id) => [id, ...kids(id).flatMap((c) => desc(c.id))];
  function catTree(exclude) {
    const out = [];
    const walk = (pid, d) => kids(pid).forEach((c) => { if (exclude && desc(exclude).includes(c.id)) return; out.push([c.id, T(c.name), d]); walk(c.id, d + 1); });
    walk(null, 0); return out;
  }
  const catPath = (id) => { const parts = []; let c = cat(id), g = 0; while (c && g++ < 8) { parts.unshift(T(c.name)); c = cat(c.parent); } return parts.join(' › '); };
  const product = (id) => D().products.find((p) => p.id === id);
  const disc = (p) => (p.old_price && p.price && p.old_price > p.price ? Math.round((1 - p.price / p.old_price) * 100) : 0);
  const thumb = (src) => `<span class="ad-thumb">${src ? `<img src="${esc(src)}" alt="" loading="lazy">` : `<span class="ad-thumb__none">${icon('image')}</span>`}</span>`;
  function upsert(coll, item) {
    const list = D()[coll]; const i = list.findIndex((x) => x.id === item.id);
    if (i > -1) list[i] = item; else list.unshift(item);
  }
  async function saveItem(coll, id, obj, label) {
    const isNew = id === 'new';
    const item = await api(isNew ? 'POST' : 'PUT', isNew ? coll : `${coll}/${id}`, obj);
    upsert(coll, item); A.dirty = false;
    toast(isNew ? `${label} შეიქმნა` : 'შენახულია');
    if (isNew) go(`#/${coll}/${item.id}`); else route();
    return item;
  }
  async function deleteItem(coll, id, text, back) {
    if (!(await confirmBox(text))) return;
    await api('DELETE', `${coll}/${id}`);
    D()[coll] = D()[coll].filter((x) => x.id !== id); A.dirty = false;
    toast('წაიშალა'); go(back);
  }
  async function saveSettings(part, msg = 'შენახულია') {
    A.data.settings = await api('PUT', 'settings', part);
    toast(msg); A.dirty = false;
  }
  const go = (h) => { A.dirty = false; location.hash = h; };

  /* ============================== VIEWS ============================== */
  const V = {};

  /* ---------- dashboard ---------- */
  V.dashboard = () => {
    const d = D(), o = d.orders || { count: 0, recent: [] };
    const now = new Date(), month = o.recent.filter((x) => new Date(x.created).getMonth() === now.getMonth() && new Date(x.created).getFullYear() === now.getFullYear());
    const nNew = o.recent.filter((x) => x.status === 'new').length;
    const priced = d.products.filter((p) => p.price).length, sale = d.products.filter(disc).length;
    const noPhoto = d.products.filter((p) => !(p.images || []).length).length, noCat = d.products.filter((p) => !p.category_id || !cat(p.category_id)).length, hidden = d.products.filter((p) => p.hidden).length;
    const bf = d.settings.promo?.style === 'blackfriday' && d.settings.promo?.enabled;
    return {
      title: 'მთავარი',
      html: `<div class="ad-hello"><div><h2>გამარჯობა 👋</h2><p>${d.libra ? 'პროდუქცია, ფასები, მარაგი და კატეგორიები მოდის LIBRA FINANCE-დან ავტომატურად. აქედან მართავ საიტის იერსახეს, აქციებს, სიახლეებს და ახალ წელს.' : 'აქედან მართავ VIVACHE-ს პროდუქციას, კატეგორიებს, აქციებს, სიახლეებს და შეკვეთებს.'}</p></div>
        <div class="ad-hello__actions">${d.libra ? `<a class="ad-btn ad-btn--accent" href="#/products">${icon('box')} პროდუქცია</a>` : `<a class="ad-btn ad-btn--accent" href="#/products/new">${icon('plus')} პროდუქტი</a>`}<a class="ad-btn" href="#/news/new">${icon('info')} სიახლე</a><a class="ad-btn" href="#/promo">${icon('zap')} აქციები</a></div></div>
        ${d.libra ? (d.libraError ? `<div class="ad-flash ad-flash--err">${icon('info')} <span><b>LIBRA FINANCE / Supabase-თან კავშირი ვერ დამყარდა:</b> ${esc(d.libraError)}. შეამოწმე Netlify-ში SUPABASE_URL და SUPABASE_ANON_KEY.</span></div>`
          : `<div class="ad-flash ad-flash--ok">${icon('check')} <span><b>LIBRA FINANCE დაკავშირებულია</b> — ${d.products.length} პროდუქტი, ${d.categories.length} კატეგორია. Libra-ში ცვლილება საიტზე ~1 წუთში ჩანს.</span></div>`) : ''}
        ${d.settings.newyear?.enabled ? `<div class="ad-flash ad-flash--info">🎄 <span>საახალწლო რეჟიმი ჩართულია (თოვლი, სანტა, ელფები, მუსიკა). <a class="ad-link" href="#/newyear">მართვა →</a></span></div>` : ''}
        ${bf ? `<div class="ad-flash ad-flash--info">${icon('zap')} <span>„შავი პარასკევის“ რეჟიმი ჩართულია — ზედა ზოლი და მთავარი გვერდის ზოლი შავ-ყვითელ სტილშია. <a class="ad-link" href="#/promo">მართვა →</a></span></div>` : ''}
        <div class="ad-stats">
          <a class="ad-stat ad-stat--accent" href="#/orders"><small>ახალი შეკვეთები</small><b>${nNew}</b><span>ამ თვეში ${month.length} · ${money(month.filter((x) => x.status !== 'cancelled').reduce((s, x) => s + (x.total || 0), 0))}</span></a>
          <a class="ad-stat" href="#/products" style="--c:#2F6BFF"><small>პროდუქცია</small><b>${d.products.length}</b><span>${priced} ფასით · ${sale} ფასდაკლებით</span></a>
          <a class="ad-stat" href="#/categories" style="--c:#FFB020"><small>კატეგორიები</small><b>${d.categories.length}</b><span>${d.brands.length} ბრენდი</span></a>
          <a class="ad-stat" href="#/news" style="--c:#22C55E"><small>სიახლეები</small><b>${d.news.length}</b><span>${d.news.filter((n) => n.pinned).length} ზედა ზოლში</span></a>
        </div>
        <div class="ad-grid2">
          <section class="ad-card"><div class="ad-card__head"><h3>ბოლო შეკვეთები</h3><a class="ad-link" href="#/orders">ყველა →</a></div>
            ${o.recent.length ? ordersTable(o.recent.slice(0, 8)) : `<div class="ad-empty">${icon('cart', '')}<p>შეკვეთები ჯერ არ არის. საიტიდან გაკეთებული შეკვეთები აქ გამოჩნდება.</p></div>`}</section>
          <section class="ad-card"><div class="ad-card__head"><h3>რა სჭირდება ყურადღებას</h3></div><ul class="ad-todo">
            <li><a href="#/products?f=noprice"><b>${d.products.length - priced}</b><span>პროდუქტს ფასი არ აქვს — საიტზე „ფასი დაზუსტდება“ ჩანს</span>${icon('chevron-right')}</a></li>
            <li><a href="#/products?f=nophoto"><b>${noPhoto}</b><span>პროდუქტს სურათი არ აქვს</span>${icon('chevron-right')}</a></li>
            <li><a href="#/products?f=nocat"><b>${noCat}</b><span>პროდუქტი კატეგორიის გარეშეა</span>${icon('chevron-right')}</a></li>
            <li><a href="#/products?f=hidden"><b>${hidden}</b><span>პროდუქტი დამალულია საიტზე</span>${icon('chevron-right')}</a></li>
          </ul></section>
        </div>`,
      mount: bindRowLinks,
    };
  };
  function ordersTable(rows) {
    return `<table class="ad-table"><thead><tr><th>ნომერი</th><th>კლიენტი</th><th>ჯამი</th><th>სტატუსი</th><th>თარიღი</th></tr></thead><tbody>${rows.map((o) =>
      `<tr data-href="#/orders/${esc(o.id)}"><td><a href="#/orders/${esc(o.id)}"><b>${esc(o.number)}</b></a></td><td>${esc(o.name)}<br><small class="muted">${esc(o.phone)}</small></td><td>${money(o.total)}</td><td><span class="ad-pill ad-pill--${o.status}">${STATUS[o.status] || o.status}</span></td><td><small>${fmtDate(o.created)}</small></td></tr>`).join('')}</tbody></table>`;
  }
  function bindRowLinks(el) { el.addEventListener('click', (e) => { const tr = e.target.closest('tr[data-href]'); if (tr && !e.target.closest('a, button, input, label')) location.hash = tr.dataset.href; }); }

  /* ---------- orders ---------- */
  const OL = { status: '', q: '', page: 1 };
  V.orders = async () => {
    if (D().libra && !D().service) return {
      title: 'შეკვეთები',
      html: `<section class="ad-card"><div class="ad-empty">${icon('cart', '')}<p><b>საიტის შეკვეთები პირდაპირ LIBRA FINANCE-ში ჩადის</b><br>Libra → ონლაინ მაღაზია → შეკვეთები. იქ იღებ, ამზადებ და ასრულებ — სტატუსს მყიდველი საიტზე, თავის ანგარიშში ხედავს.</p>
        <p class="ad-hint">აქაც რომ ჩანდეს (მხოლოდ სანახავად), Netlify-ში დაამატე ცვლადი <code>SUPABASE_SERVICE_KEY</code> (Supabase → Project Settings → API → service_role) და გააკეთე Redeploy.</p></div></section>`,
    };
    const qs = new URLSearchParams({ status: OL.status, q: OL.q, page: OL.page });
    const r = await api('GET', 'orders?' + qs);
    const pages = Math.ceil(r.total / r.per);
    return {
      title: 'შეკვეთები',
      html: `<div class="ad-toolbar"><div class="ad-search">${icon('search')}<input type="search" value="${esc(OL.q)}" placeholder="ნომერი, სახელი ან ტელეფონი…" data-oq></div></div>
        <div class="ad-chips">${[['', 'ყველა'], ...Object.entries(STATUS)].map(([k, l]) => `<button type="button" data-os="${k}" class="${OL.status === k ? 'is-on' : ''}">${l}</button>`).join('')}</div>
        <section class="ad-card ad-card--flush">${r.rows.length ? ordersTable(r.rows) : `<div class="ad-empty">${icon('cart', '')}<p>შეკვეთა ვერ მოიძებნა.</p></div>`}</section>
        ${pages > 1 ? `<div class="ad-pages">${Array.from({ length: pages }, (_, i) => `<button type="button" data-op="${i + 1}" class="${OL.page === i + 1 ? 'is-on' : ''}">${i + 1}</button>`).join('')}<small>სულ ${r.total}</small></div>` : ''}`,
      mount(el) {
        bindRowLinks(el);
        el.addEventListener('click', (e) => {
          const s = e.target.closest('[data-os]'); if (s) { OL.status = s.dataset.os; OL.page = 1; route(); }
          const p = e.target.closest('[data-op]'); if (p) { OL.page = +p.dataset.op; route(); }
        });
        let t; $('[data-oq]', el).addEventListener('input', (e) => { clearTimeout(t); t = setTimeout(() => { OL.q = e.target.value; OL.page = 1; route(true); }, 400); });
      },
    };
  };
  V.order = async (id) => {
    const o = await api('GET', 'orders/' + id);
    const c = o.customer || {};
    if (o.libra) return {
      title: 'შეკვეთა ' + o.number, crumbs: '<a href="#/orders">შეკვეთები</a> / ' + esc(o.number),
      actions: `<button class="ad-btn" type="button" onclick="print()">${icon('print')} ბეჭდვა</button>`,
      html: `<div class="ad-flash ad-flash--info">${icon('info')} <span>შეკვეთა მუშავდება LIBRA FINANCE-ში — სტატუსი იქ იცვლება. ${o.imported ? 'Libra-მ უკვე ჩამოიტანა ✓' : 'Libra ჩამოიტანს უახლოეს წუთში.'}</span></div>
        <div class="ad-edit"><div class="ad-edit__main"><section class="ad-card ad-card--flush"><table class="ad-table"><thead><tr><th></th><th>პროდუქტი</th><th>ფასი</th><th>რაოდ.</th><th>ჯამი</th></tr></thead><tbody>
          ${o.items.map((i) => `<tr><td class="ad-thumb">${i.image ? `<img src="${esc(i.image)}" alt="">` : ''}</td><td><b>${esc(i.name)}</b></td><td>${money(i.price)}</td><td>× ${i.qty}</td><td><b>${money(i.total)}</b></td></tr>`).join('')}
        </tbody><tfoot><tr><td colspan="4">ჯამი</td><td>${money(o.subtotal)}</td></tr><tr><td colspan="4">მიწოდება</td><td>${o.delivery_fee ? money(o.delivery_fee) : 'უფასო'}</td></tr>${o.cashback ? `<tr><td colspan="4">ქეშბექით</td><td>−${money(o.cashback)}</td></tr>` : ''}<tr class="ad-total"><td colspan="4">გადასახდელი</td><td>${money(o.total)}</td></tr></tfoot></table></section>
        <section class="ad-card"><h3>კლიენტი</h3><dl class="ad-dl"><dt>სახელი</dt><dd>${esc(c.name)}</dd><dt>ტელეფონი</dt><dd><a href="tel:${esc(c.phone)}">${esc(c.phone)}</a></dd>
          <dt>მიწოდება</dt><dd>${o.delivery === 'pickup' ? 'მაღაზიიდან გატანა' : 'კურიერი — ' + esc(c.address)}</dd><dt>გადახდა</dt><dd>${PAY[o.payment] || esc(o.payment)}</dd><dt>თარიღი</dt><dd>${fmtDate(o.created)}</dd>
          ${c.note ? `<dt>კომენტარი</dt><dd>${esc(c.note)}</dd>` : ''}${o.admin_note ? `<dt>Libra-ს შენიშვნა</dt><dd>${esc(o.admin_note)}</dd>` : ''}</dl></section></div>
        <aside class="ad-edit__side"><section class="ad-card"><h3>სტატუსი</h3><span class="ad-pill ad-pill--${o.status}">${STATUS[o.status] || o.status}</span><p class="ad-hint">Libra: <code>${esc(o.libra_status)}</code></p></section></aside></div>`,
    };
    return {
      title: 'შეკვეთა ' + o.number, crumbs: '<a href="#/orders">შეკვეთები</a> / ' + esc(o.number),
      actions: `<button class="ad-btn" type="button" onclick="print()">${icon('print')} ბეჭდვა</button>`,
      html: `<div class="ad-edit"><div class="ad-edit__main">
          <section class="ad-card ad-card--flush"><table class="ad-table"><thead><tr><th></th><th>პროდუქტი</th><th>ფასი</th><th>რაოდ.</th><th>ჯამი</th></tr></thead><tbody>
            ${o.items.map((i) => `<tr><td class="ad-thumb">${i.image ? `<img src="${esc(i.image)}" alt="">` : ''}</td><td><a class="ad-strong" href="/product/${esc(i.id)}" target="_blank">${esc(i.name)}</a>${i.variant ? `<br><small class="muted">${esc(i.variant)}</small>` : ''}</td><td>${money(i.price)}</td><td>× ${i.qty}</td><td><b>${money(i.total)}</b></td></tr>`).join('')}
          </tbody><tfoot><tr><td colspan="4">ჯამი</td><td>${money(o.subtotal)}</td></tr><tr><td colspan="4">მიწოდება</td><td>${o.delivery_fee ? money(o.delivery_fee) : 'უფასო'}</td></tr><tr class="ad-total"><td colspan="4">სულ</td><td>${money(o.total)}</td></tr></tfoot></table></section>
          <section class="ad-card"><h3>კლიენტი</h3><dl class="ad-dl">
            <dt>სახელი</dt><dd>${esc(c.name)}</dd><dt>ტელეფონი</dt><dd><a href="tel:${esc(c.phone)}">${esc(c.phone)}</a></dd>
            ${c.email ? `<dt>ელ-ფოსტა</dt><dd><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></dd>` : ''}
            <dt>მიწოდება</dt><dd>${o.delivery === 'pickup' ? 'მაღაზიიდან გატანა' : 'კურიერი — ' + esc([c.city, c.address].filter(Boolean).join(', '))}</dd>
            <dt>გადახდა</dt><dd>${PAY[o.payment] || esc(o.payment)}</dd><dt>ენა</dt><dd>${o.lang === 'en' ? 'English' : 'ქართული'}</dd><dt>თარიღი</dt><dd>${fmtDate(o.created)}</dd>
            ${c.note ? `<dt>კომენტარი</dt><dd>${esc(c.note)}</dd>` : ''}</dl></section>
          <section class="ad-card no-print"><h3>შიდა შენიშვნა</h3><form class="ad-form" data-note><label class="ad-field"><textarea name="admin_note" rows="3" placeholder="მხოლოდ ადმინისტრატორებისთვის">${esc(o.admin_note)}</textarea></label><button class="ad-btn ad-btn--sm" type="submit">შენიშვნის შენახვა</button></form></section>
        </div><aside class="ad-edit__side no-print">
          <section class="ad-card"><h3>სტატუსი</h3><div class="ad-status-btns">${Object.entries(STATUS).map(([k, l]) => `<button type="button" data-st="${k}" class="${o.status === k ? 'is-on' : ''}">${l}</button>`).join('')}</div></section>
          <section class="ad-card"><h3>ისტორია</h3><ul class="ad-timeline">${(o.history || []).map((h) => `<li><b>${STATUS[h.status] || h.status}</b> <small class="muted">${fmtDate(h.at)}</small></li>`).join('')}</ul></section>
          <section class="ad-card ad-card--danger"><h3>წაშლა</h3><button type="button" class="ad-btn ad-btn--danger-ghost ad-btn--sm" data-del-order>${icon('trash')} შეკვეთის წაშლა</button></section>
        </aside></div>`,
      mount(el) {
        el.addEventListener('click', async (e) => {
          const st = e.target.closest('[data-st]');
          if (st) { try { await api('PATCH', 'orders/' + id, { status: st.dataset.st }); syncOrder(id, st.dataset.st); toast('სტატუსი: ' + STATUS[st.dataset.st]); route(); } catch (x) { fail(x); } }
          if (e.target.closest('[data-del-order]') && (await confirmBox(`შეკვეთა ${o.number} სამუდამოდ წაიშლება.`))) {
            try { await api('DELETE', 'orders/' + id); D().orders.recent = D().orders.recent.filter((x) => x.id !== id); toast('წაიშალა'); go('#/orders'); } catch (x) { fail(x); }
          }
        });
        $('[data-note]', el).addEventListener('submit', async (e) => { e.preventDefault(); try { await api('PATCH', 'orders/' + id, collect(e.target)); A.dirty = false; toast('შენახულია'); } catch (x) { fail(x); } });
      },
    };
  };
  function syncOrder(id, status) { const r = (D().orders?.recent || []).find((x) => x.id === id); if (r) r.status = status; updateBadges(); }

  /* ---------- products ---------- */
  const PL = { q: '', cat: '', f: '', sort: 'new', page: 1 };
  const FILTERS = [['', 'ყველა'], ['priced', 'ფასით'], ['noprice', 'ფასის გარეშე'], ['sale', 'ფასდაკლებით'], ['nophoto', 'სურათის გარეშე'], ['nocat', 'კატეგორიის გარეშე'], ['hot', 'რჩეული ★'], ['new', 'ახალი'], ['hidden', 'დამალული']];
  V.products = (_, query) => {
    if (query.get('f') != null) PL.f = query.get('f');
    const per = 30;
    let list = D().products.filter((p) => {
      if (PL.cat && !desc(PL.cat).includes(p.category_id)) return false;
      const f = PL.f;
      if (f === 'priced' && !p.price) return false; if (f === 'noprice' && p.price) return false; if (f === 'sale' && !disc(p)) return false;
      if (f === 'nophoto' && (p.images || []).length) return false; if (f === 'nocat' && p.category_id && cat(p.category_id)) return false;
      if (f === 'hot' && !p.hot) return false; if (f === 'new' && !p.isNew) return false; if (f === 'hidden' && !p.hidden) return false;
      if (PL.q) { const q = PL.q.toLowerCase(); if (![p.id, p.name?.ka, p.name?.en, p.brand, p.code].join(' ').toLowerCase().includes(q)) return false; }
      return true;
    });
    if (PL.sort === 'name') list.sort((a, b) => T(a.name).localeCompare(T(b.name), 'ka'));
    else if (PL.sort === 'price') list.sort((a, b) => (a.price || 0) - (b.price || 0));
    else list.sort((a, b) => String(b.created || '').localeCompare(String(a.created || '')));
    const pages = Math.ceil(list.length / per); PL.page = Math.min(PL.page, pages || 1);
    const rows = list.slice((PL.page - 1) * per, PL.page * per);
    return {
      title: 'პროდუქცია',
      actions: D().libra ? '<span class="ad-tag ad-tag--libra">LIBRA FINANCE</span>' : `<a class="ad-btn ad-btn--accent" href="#/products/new">${icon('plus')} ახალი პროდუქტი</a>`,
      html: `<div class="ad-toolbar" data-ignore><div class="ad-search">${icon('search')}<input type="search" value="${esc(PL.q)}" placeholder="სახელი, ბრენდი, კოდი ან ID…" data-pq></div>
          <select class="ad-select" data-pcat><option value="">ყველა კატეგორია</option>${catTree().map(([id, n, d]) => `<option value="${id}"${PL.cat === id ? ' selected' : ''}>${'— '.repeat(d)}${esc(n)}</option>`).join('')}</select>
          <select class="ad-select" data-psort><option value="new">ახალი პირველი</option><option value="name"${PL.sort === 'name' ? ' selected' : ''}>სახელით</option><option value="price"${PL.sort === 'price' ? ' selected' : ''}>ფასით</option></select></div>
        <div class="ad-chips">${FILTERS.map(([k, l]) => `<button type="button" data-pf="${k}" class="${PL.f === k ? 'is-on' : ''}">${l}</button>`).join('')}</div>
        <section class="ad-card ad-card--flush">${rows.length ? `<table class="ad-table ad-table--products"><thead><tr><th></th><th>დასახელება</th><th>კოდი</th><th>კატეგორია</th><th>ფასი, ₾</th><th title="ძველი ფასი — ფასდაკლებისთვის">ძველი</th><th title="რჩეული (მთავარ გვერდზე)">★</th><th title="საიტზე ჩანს">👁</th><th></th></tr></thead><tbody>
          ${rows.map((p) => `<tr class="${p.hidden ? 'is-off' : ''}" data-id="${esc(p.id)}">${'<td class="ad-thumb">' + ((p.images || [])[0] ? `<img src="${esc(p.images[0])}" alt="" loading="lazy">` : `<span class="ad-thumb__none">${icon('image')}</span>`) + '</td>'}
            <td><a class="ad-strong" href="#/products/${esc(p.id)}">${esc(T(p.name)) || '— უსახელო'}</a> ${disc(p) ? `<span class="ad-tag ad-tag--sale">−${disc(p)}%</span>` : ''}${p.isNew ? ' <span class="ad-tag ad-tag--new">ახალი</span>' : ''}${p.brand ? `<br><small class="muted">${esc(p.brand)}</small>` : ''}</td>
            <td><small>${esc(p.code)}</small></td><td><small>${esc(catPath(p.category_id)) || '—'}</small></td>
            <td><input class="ad-price" type="number" step="0.01" min="0" value="${p.price ?? ''}" placeholder="—" data-quick="price" aria-label="ფასი"${p.libra ? ' readonly title="ფასი LIBRA FINANCE-დან"' : ''}></td>
            <td><input class="ad-price ad-price--old" type="number" step="0.01" min="0" value="${p.old_price ?? ''}" placeholder="—" data-quick="old_price" aria-label="ძველი ფასი"></td>
            <td><label class="ad-star"><input type="checkbox" ${p.hot ? 'checked' : ''} data-quick="hot" aria-label="რჩეული"><span>★</span></label></td>
            <td><label class="ad-eye"><input type="checkbox" ${p.hidden ? 'checked' : ''} data-quick="hidden" aria-label="დამალვა"><span>${icon(p.hidden ? 'eye-off' : 'eye')}</span></label></td>
            <td class="ad-row-actions"><a class="ad-btn ad-btn--sm" href="#/products/${esc(p.id)}">რედაქტირება</a></td></tr>`).join('')}
          </tbody></table>` : `<div class="ad-empty">${icon('search', '')}<p>პროდუქტი ვერ მოიძებნა.</p></div>`}</section>
        ${pages > 1 ? `<div class="ad-pages">${Array.from({ length: pages }, (_, i) => `<button type="button" data-pp="${i + 1}" class="${PL.page === i + 1 ? 'is-on' : ''}">${i + 1}</button>`).join('')}<small>სულ ${list.length}</small></div>` : `<p class="ad-hint">სულ ${list.length}</p>`}
        ${D().libra ? '<div class="ad-flash ad-flash--info" style="margin-top:14px">' + icon('info') + ' <span>სახელი, ფასი, მარაგი, კატეგორია და ფოტო მოდის <b>LIBRA FINANCE</b>-დან. აქ ცვლი მხოლოდ საიტის დამატებებს: ★ რჩეული, დამალვა, ძველი ფასი (გადახაზული), ბრენდი, დამატებითი ფოტოები და აღწერა.</span></div>' : ''}
        <p class="ad-hint">ფასი სიიდანვე იცვლება — ჩაწერე და გადადი სხვა ველზე, ავტომატურად შეინახება. „ძველი ფასი“ ფასზე მეტი თუ არის, საიტზე ფასდაკლების ნიშანი (−%) გამოჩნდება. ფასის გარეშე პროდუქტი საიტზე „ფასი დაზუსტდება“-თი ჩანს.</p>`,
      mount(el) {
        let t;
        $('[data-pq]', el).addEventListener('input', (e) => { clearTimeout(t); t = setTimeout(() => { PL.q = e.target.value; PL.page = 1; route(true); }, 250); });
        $('[data-pcat]', el).addEventListener('change', (e) => { PL.cat = e.target.value; PL.page = 1; route(); });
        $('[data-psort]', el).addEventListener('change', (e) => { PL.sort = e.target.value; route(); });
        el.addEventListener('click', (e) => {
          const f = e.target.closest('[data-pf]'); if (f) { PL.f = f.dataset.pf; PL.page = 1; history.replaceState(null, '', '#/products'); route(); }
          const p = e.target.closest('[data-pp]'); if (p) { PL.page = +p.dataset.pp; route(); }
        });
        el.addEventListener('change', async (e) => {
          const q = e.target.dataset.quick; if (!q) return;
          const id = e.target.closest('tr').dataset.id;
          const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
          try {
            const item = await api('PATCH', 'products/' + id, { [q]: val }); upsert('products', item);
            if (e.target.classList.contains('ad-price')) { e.target.classList.add('is-saved'); setTimeout(() => e.target.classList.remove('is-saved'), 1200); }
            if (q === 'hidden') { e.target.closest('tr').classList.toggle('is-off', item.hidden); e.target.nextElementSibling.innerHTML = icon(item.hidden ? 'eye-off' : 'eye'); }
            if (q === 'old_price' && val && !item.old_price) { e.target.value = ''; toast('ძველი ფასი უნდა იყოს ახალ ფასზე მეტი', true); return; }
            toast('შენახულია');
          } catch (x) { fail(x); }
        });
      },
    };
  };

  V.product = (id) => {
    if (D().libra) return libraProduct(id);
    const isNew = id === 'new';
    const p = isNew ? { name: {}, description: {}, details: {}, images: [], stock: null, sort: 0 } : product(id);
    if (!p) return notFound();
    const title = isNew ? 'ახალი პროდუქტი' : T(p.name) || 'პროდუქტი';
    const brands = D().brands.map((b) => `<option value="${esc(b.name)}">`).join('');
    return {
      title, crumbs: `<a href="#/products">პროდუქცია</a> / ${isNew ? 'ახალი' : esc(p.id)}`,
      actions: `${!isNew ? `<a class="ad-btn" href="/product/${esc(p.id)}" target="_blank" rel="noopener">${icon('arrow-up-right')} საიტზე ნახვა</a>` : ''}<button class="ad-btn ad-btn--accent" type="submit" form="f">შენახვა</button>`,
      html: `<form id="f" class="ad-edit" novalidate><div class="ad-edit__main">
          <section class="ad-card"><h3>ძირითადი ინფორმაცია</h3>
            ${trField('name', 'დასახელება', p.name, { required: true })}
            <label class="ad-field"><span>ბრენდი</span><input type="text" name="brand" value="${esc(p.brand)}" list="brand-list" placeholder="მაგ.: PaperLab, ToyMoon"><datalist id="brand-list">${brands}</datalist><small class="ad-hint">ბრენდის სახელით საიტზე ფილტრი და ბრენდების ზოლი მუშაობს.</small></label></section>
          <section class="ad-card"><h3>აღწერა</h3>${trField('description', 'მოკლე აღწერა', p.description, { type: 'rich' })}${trField('details', 'დეტალები (მასალა, ზომა, ასაკი…)', p.details, { type: 'rich' })}</section>
        </div><aside class="ad-edit__side">
          <section class="ad-card"><h3>ფასი და მარაგი <span data-disc></span></h3>
            <div class="ad-row2">${field('price', 'ფასი (₾)', p.price ?? '', { type: 'number', attrs: ' step="0.01" min="0"', ph: 'ცარიელი = ფასი დაზუსტდება' })}${field('old_price', 'ძველი ფასი (₾)', p.old_price ?? '', { type: 'number', attrs: ' step="0.01" min="0"', ph: 'ფასდაკლებისთვის' })}</div>
            ${field('variants', 'ზომები / ვარიანტები და ფასები', p.variants, { type: 'textarea', rows: 3, sub: '(თითო ხაზზე: „A5 | 8.90“)', ph: 'A5 | 8.90\nA4 | 12.90', hint: 'ჩაწერე ჩვეულებრივი ფასები — თუ პროდუქტს ფასდაკლება აქვს (ძველი ფასი), იგივე % ავტომატურად აკლდება ყველა ვარიანტს.' })}
            <div class="ad-row3">${field('code', 'კოდი', p.code)}${field('age', 'ასაკი', p.age, { ph: '3+' })}${field('stock', 'მარაგი', p.stock ?? '', { type: 'number', attrs: ' min="0" step="1"', ph: '∞' })}</div>
            ${sw('hot', 'რჩეული ★ (მთავარ გვერდზე)', p.hot)}${sw('isNew', '„ახალი“ ნიშანი', p.isNew)}${sw('hidden', 'დამალული (საიტზე არ ჩანს)', p.hidden)}</section>
          <section class="ad-card"><h3>კატეგორია</h3>${select('category_id', 'კატეგორია', [['', '— კატეგორიის გარეშე —'], ...catTree().map(([cid, n, d]) => [cid, '— '.repeat(d) + n])], p.category_id)}
            ${field('sort', 'რიგითობა', p.sort ?? 0, { type: 'number', sub: '(ნაკლები = წინ)' })}</section>
          <section class="ad-card"><h3>სურათები</h3>${imagesField('images', p.images)}<p class="ad-hint">გამჭვირვალე ფონის PNG/WebP საუკეთესოდ გამოიყურება. პირველი სურათი — მთავარია.</p></section>
          ${isNew ? '' : `<section class="ad-card ad-card--danger"><h3>წაშლა</h3><p class="ad-hint" style="margin:0 0 10px">პროდუქტი სამუდამოდ წაიშლება.</p><button type="button" class="ad-btn ad-btn--danger-ghost ad-btn--sm" data-del>${icon('trash')} პროდუქტის წაშლა</button></section>`}
        </aside></form>`,
      mount(el) {
        const f = $('#f', el); bindForm(f);
        const upd = () => { const pr = +f.elements.namedItem("price").value, old = +f.elements.namedItem("old_price").value; $('[data-disc]', el).innerHTML = pr && old > pr ? `<span class="ad-discount">−${Math.round((1 - pr / old) * 100)}%</span>` : ''; };
        f.elements.namedItem("price").addEventListener('input', upd); f.elements.namedItem("old_price").addEventListener('input', upd); upd();
        f.addEventListener('submit', async (e) => {
          e.preventDefault();
          const x = collect(f);
          if (!x.name.ka && !x.name.en) { toast('დასახელება სავალდებულოა', true); return; }
          try { await saveItem('products', id, x, 'პროდუქტი'); } catch (err) { fail(err); }
        });
        const del = $('[data-del]', el); if (del) del.addEventListener('click', () => deleteItem('products', id, `პროდუქტი „${title}“ სამუდამოდ წაიშლება.`, '#/products').catch(fail));
      },
    };
  };

  /* ---------- categories ---------- */
  V.categories = () => {
    if (D().libra) return libraCategories();
    const count = (id) => D().products.filter((p) => desc(id).includes(p.category_id)).length;
    const tree = (pid) => { const ks = kids(pid); return ks.length ? `<ul class="ad-tree" data-sort-cats>${ks.map((c) => {
      const top = cat(c.id) && !c.parent;
      return `<li data-id="${esc(c.id)}"><div class="ad-tree__row${c.hidden ? ' is-hidden' : ''}"><span class="ad-handle">⋮⋮</span><span class="ad-tree__dot" style="--c:${top ? esc(c.color || '#eee') : '#fff'}">${esc(c.icon || '')}</span><a class="ad-tree__name" href="#/categories/${esc(c.id)}">${esc(T(c.name))}</a><span class="ad-tree__count" title="პროდუქტი">${count(c.id)}</span><a class="ad-btn ad-btn--sm ad-btn--ghost" href="#/categories/new?parent=${esc(c.id)}">${icon('plus')}</a></div>${tree(c.id)}</li>`;
    }).join('')}</ul>` : ''; };
    return {
      title: 'კატეგორიები', actions: `<a class="ad-btn ad-btn--accent" href="#/categories/new">${icon('plus')} ახალი კატეგორია</a>`,
      html: `<p class="ad-hint" style="margin:0 0 14px;font-size:14px">ზედა დონის კატეგორიები საიტზე „მიმართულებებად“ ჩანს (ფერი, ემოჯი, აღწერა) და მენიუში. გადაათრიე <b>⋮⋮</b> რიგითობისთვის — ინახება ავტომატურად.</p>
        <section class="ad-card">${tree(null) || `<div class="ad-empty"><p>კატეგორიები ჯერ არ არის.</p></div>`}</section>`,
      mount(el) {
        if (!window.Sortable) return;
        $$('[data-sort-cats]', el).forEach((ul) => Sortable.create(ul, { handle: '.ad-handle', animation: 160, onEnd: async () => {
          const ids = $$('li[data-id]', el).map((li) => li.dataset.id);
          try { await api('POST', 'categories/order', { ids }); ids.forEach((cid, i) => { const c = cat(cid); if (c) c.sort = i + 1; }); toast('რიგითობა შენახულია'); } catch (x) { fail(x); }
        } }));
      },
    };
  };
  V.category = (id, q) => {
    if (D().libra) return libraCategory(id);
    const isNew = id === 'new';
    const c = isNew ? { name: {}, tagline: {}, parent: q.get('parent') || null, color: COLORS[D().categories.length % COLORS.length], icon: '' } : cat(id);
    if (!c) return notFound();
    const title = isNew ? 'ახალი კატეგორია' : T(c.name);
    return {
      title, crumbs: `<a href="#/categories">კატეგორიები</a> / ${isNew ? 'ახალი' : esc(c.id)}`,
      actions: `${!isNew ? `<a class="ad-btn" href="/shop?cat=${esc(c.id)}" target="_blank">${icon('arrow-up-right')} საიტზე</a>` : ''}<button class="ad-btn ad-btn--accent" type="submit" form="f">შენახვა</button>`,
      html: `<form id="f" class="ad-edit" novalidate><div class="ad-edit__main"><section class="ad-card">
          ${trField('name', 'სახელი', c.name, { required: true })}${trField('tagline', 'მოკლე აღწერა (ჩანს „მიმართულების“ ბარათზე)', c.tagline)}
          ${select('parent', 'მშობელი კატეგორია', [['', '— ზედა დონე (მიმართულება) —'], ...catTree(isNew ? null : c.id).map(([cid, n, d]) => [cid, '— '.repeat(d) + n])], c.parent)}
          ${isNew ? field('id', 'ID (ბმულისთვის, ლათინურად)', '', { ph: 'მაგ.: notebooks', hint: 'ცარიელი = ავტომატურად. შემდეგ ვეღარ შეიცვლება.' }) : ''}</section></div>
        <aside class="ad-edit__side"><section class="ad-card"><h3>გარეგნობა</h3>
          <div class="ad-row2">${field('color', 'ფერი', c.color || '#FF3D7F', { type: 'color' })}${field('icon', 'ემოჯი', c.icon, { ph: '✏️', attrs: ' maxlength="8"' })}</div>
          <p class="ad-hint" style="margin:-6px 0 14px">ფერი და ემოჯი ზედა დონის კატეგორიაზე ჩანს: მენიუ, ბარათები, ფილტრები, პროდუქტის ბარათის ფონი.</p>
          <span class="ad-field"><span>ბარათის სურათი <small>(არასავალდებულო — ცარიელი = პროდუქტების კოლაჟი)</small></span></span>${imageField('image', c.image)}
          ${sw('hidden', 'დამალული (საიტზე არ ჩანს)', c.hidden)}</section>
          ${isNew ? '' : `<section class="ad-card ad-card--danger"><h3>წაშლა</h3><p class="ad-hint" style="margin:0 0 10px">ქვეკატეგორიები ზემოთ გადავა, პროდუქცია დარჩება კატეგორიის გარეშე.</p><button type="button" class="ad-btn ad-btn--danger-ghost ad-btn--sm" data-del>${icon('trash')} კატეგორიის წაშლა</button></section>`}
        </aside></form>`,
      mount(el) {
        const f = $('#f', el); bindForm(f);
        f.addEventListener('submit', async (e) => { e.preventDefault(); try { const item = await saveItemNoNav('categories', id, collect(f)); A.data.categories = await api('GET', 'data').then((d) => d.categories); go('#/categories/' + item.id); } catch (x) { fail(x); } });
        const del = $('[data-del]', el); if (del) del.addEventListener('click', async () => { try { await deleteItem('categories', id, `კატეგორია „${title}“ წაიშლება.`, '#/categories'); await reload(); } catch (x) { fail(x); } });
      },
    };
  };
  async function saveItemNoNav(coll, id, obj) {
    const isNew = id === 'new';
    const item = await api(isNew ? 'POST' : 'PUT', isNew ? coll : `${coll}/${id}`, obj);
    upsert(coll, item); A.dirty = false; toast(isNew ? 'შეიქმნა' : 'შენახულია'); return item;
  }

  /* ---------- brands ---------- */
  V.brands = () => {
    const list = [...D().brands].sort((a, b) => (a.sort || 0) - (b.sort || 0));
    return {
      title: 'ბრენდები', actions: `<a class="ad-btn ad-btn--accent" href="#/brands/new">${icon('plus')} ახალი ბრენდი</a>`,
      html: `<p class="ad-hint" style="margin:0 0 14px;font-size:14px">ბრენდები მოძრავ ზოლში ჩანს მთავარ გვერდზე. ლოგო არ არის — ჩანს სახელი ბრენდის ფერით. გადაათრიე <b>⋮⋮</b> რიგითობისთვის.</p>
        <div class="ad-list" data-sort-brands>${list.map((b) => `<article class="ad-row" data-id="${esc(b.id)}"><span class="ad-handle">⋮⋮</span><span class="ad-brand-swatch" style="--c:${esc(b.color)}">${b.logo ? `<img src="${esc(b.logo)}" alt="">` : esc(b.name)}</span>
          <div class="ad-row__body"><a class="ad-strong" href="#/brands/${esc(b.id)}">${esc(b.name)}</a><small class="muted">${D().products.filter((p) => p.brand === b.name).length} პროდუქტი</small></div><a class="ad-btn ad-btn--sm" href="#/brands/${esc(b.id)}">რედაქტირება</a></article>`).join('') || `<div class="ad-empty"><p>ბრენდები ჯერ არ არის.</p></div>`}</div>`,
      mount(el) { sortableList($('[data-sort-brands]', el), 'brands'); },
    };
  };
  function sortableList(box, coll) {
    if (!window.Sortable || !box) return;
    Sortable.create(box, { handle: '.ad-handle', animation: 160, onEnd: async () => {
      const ids = $$('[data-id]', box).map((x) => x.dataset.id);
      try { await api('POST', coll + '/order', { ids }); ids.forEach((id, i) => { const it = D()[coll].find((x) => x.id === id); if (it) it.sort = i + 1; }); toast('რიგითობა შენახულია'); } catch (x) { fail(x); }
    } });
  }
  V.brand = (id) => {
    const isNew = id === 'new', b = isNew ? { color: COLORS[D().brands.length % COLORS.length] } : D().brands.find((x) => x.id === id);
    if (!b) return notFound();
    return {
      title: isNew ? 'ახალი ბრენდი' : b.name, crumbs: `<a href="#/brands">ბრენდები</a> / ${isNew ? 'ახალი' : esc(b.name)}`,
      actions: `<button class="ad-btn ad-btn--accent" type="submit" form="f">შენახვა</button>`,
      html: `<form id="f" class="ad-edit" novalidate><div class="ad-edit__main"><section class="ad-card">${field('name', 'სახელი', b.name, { required: true })}${field('url', 'ბმული (არასავალდებულო)', b.url, { ph: 'https://' })}${field('color', 'ფერი', b.color, { type: 'color' })}</section></div>
        <aside class="ad-edit__side"><section class="ad-card"><h3>ლოგო</h3>${imageField('logo', b.logo, 'SVG ან გამჭვირვალე PNG')}</section>
        ${isNew ? '' : `<section class="ad-card ad-card--danger"><h3>წაშლა</h3><button type="button" class="ad-btn ad-btn--danger-ghost ad-btn--sm" data-del>${icon('trash')} ბრენდის წაშლა</button></section>`}</aside></form>`,
      mount(el) {
        const f = $('#f', el); bindForm(f);
        f.addEventListener('submit', async (e) => { e.preventDefault(); try { await saveItem('brands', id, collect(f), 'ბრენდი'); } catch (x) { fail(x); } });
        const del = $('[data-del]', el); if (del) del.addEventListener('click', () => deleteItem('brands', id, `ბრენდი „${b.name}“ წაიშლება (პროდუქცია დარჩება).`, '#/brands').catch(fail));
      },
    };
  };

  /* ---------- hero slides ---------- */
  V.heroList = () => {
    const list = [...D().hero].sort((a, b) => (a.sort || 0) - (b.sort || 0));
    return {
      title: 'მთავარი გვერდის ქავერი', actions: `<a class="ad-btn ad-btn--accent" href="#/hero/new">${icon('plus')} ახალი სლაიდი</a>`,
      html: `<p class="ad-hint" style="margin:0 0 14px;font-size:14px">ქავერის სლაიდები მთავარი გვერდის თავში (ავტომატურად იცვლება 7 წამში). თითო სლაიდს აქვს ფერი, ტექსტები, ღილაკები და 4 პროდუქტი ან საკუთარი სურათი. გადაათრიე <b>⋮⋮</b> რიგითობისთვის.</p>
        <div class="ad-list" data-sort-hero>${list.map((h) => { const imgs = h.image ? [h.image] : h.bg ? [h.bg] : (h.products || []).map(product).filter(Boolean).map((p) => (p.images || [])[0]);
          return `<article class="ad-row${h.hidden ? ' is-off' : ''}" data-id="${esc(h.id)}"><span class="ad-handle">⋮⋮</span><span class="ad-row__media ${h.bg || h.image ? 'ad-row__media--photo' : 'ad-row__media--multi'}" style="--c:${esc(h.color)}">${imgs.map((s) => `<img src="${esc(s)}" alt="">`).join('')}</span>
            <div class="ad-row__body"><a class="ad-strong" href="#/hero/${esc(h.id)}">${esc(T(h.title).replace(/<[^>]+>/g, ''))}</a><small class="muted">${esc(T(h.eyebrow))}${h.hidden ? ' · დამალული' : ''}</small></div><a class="ad-btn ad-btn--sm" href="#/hero/${esc(h.id)}">რედაქტირება</a></article>`; }).join('') || `<div class="ad-empty"><p>სლაიდები ჯერ არ არის.</p></div>`}</div>`,
      mount(el) { sortableList($('[data-sort-hero]', el), 'hero'); },
    };
  };
  function productPicker(name, ids, max = 4) {
    return `<div data-picks="${name}" data-max="${max}" data-value="${esc(JSON.stringify(ids || []))}"><div class="ad-pick-list" data-pick-list></div>
      <div class="ad-search" style="margin-bottom:8px">${icon('search')}<input type="search" placeholder="პროდუქტის ძებნა…" data-pick-q data-ignore></div><div class="ad-show ad-show--results" data-pick-res style="max-height:260px"></div></div>`;
  }
  function bindPicker(root) {
    $$('[data-picks]', root).forEach((box) => {
      const max = +box.dataset.max || 4;
      const draw = () => {
        const ids = JSON.parse(box.dataset.value || '[]');
        $('[data-pick-list]', box).innerHTML = ids.map((id, i) => { const p = product(id); return p ? `<div class="ad-pick-item" title="${esc(T(p.name))}"><img src="${esc((p.images || [])[0] || '')}" alt=""><button type="button" data-unpick="${i}">✕</button></div>` : ''; }).join('');
        search();
      };
      const search = () => {
        const q = $('[data-pick-q]', box).value.toLowerCase(), ids = JSON.parse(box.dataset.value || '[]');
        const res = D().products.filter((p) => !ids.includes(p.id) && (p.images || []).length && (!q || [T(p.name), p.brand, p.code].join(' ').toLowerCase().includes(q))).slice(0, 12);
        $('[data-pick-res]', box).innerHTML = res.map((p) => `<div class="ad-show__item">${thumb((p.images || [])[0])}<div class="ad-show__body"><b>${esc(T(p.name))}</b><small class="muted">${p.price ? money(p.price) : ''}</small></div><button type="button" class="ad-btn ad-btn--sm" data-pick="${esc(p.id)}"${ids.length >= max ? ' disabled' : ''}>+</button></div>`).join('');
      };
      box.addEventListener('click', (e) => {
        const ids = JSON.parse(box.dataset.value || '[]');
        const a = e.target.closest('[data-pick]'), r = e.target.closest('[data-unpick]');
        if (a && ids.length < max) ids.push(a.dataset.pick); else if (r) ids.splice(+r.dataset.unpick, 1); else return;
        box.dataset.value = JSON.stringify(ids); dirty(); draw();
      });
      $('[data-pick-q]', box).addEventListener('input', search);
      draw();
    });
  }
  V.hero = (id) => {
    const isNew = id === 'new', h = isNew ? { color: COLORS[D().hero.length % COLORS.length], products: [], title: {}, eyebrow: {}, lead: {}, cta: { ka: 'იყიდე ახლა', en: 'Shop now' }, cta_url: '/shop', cta2: {}, cta2_url: '' } : D().hero.find((x) => x.id === id);
    if (!h) return notFound();
    return {
      title: isNew ? 'ახალი სლაიდი' : T(h.title).replace(/<[^>]+>/g, ''), crumbs: `<a href="#/hero">მთავარი გვერდის ქავერი</a> / ${isNew ? 'ახალი' : esc(h.id)}`,
      actions: `<a class="ad-btn" href="/" target="_blank">${icon('arrow-up-right')} საიტზე</a><button class="ad-btn ad-btn--accent" type="submit" form="f">შენახვა</button>`,
      html: `<form id="f" class="ad-edit" novalidate><div class="ad-edit__main"><section class="ad-card"><h3>ტექსტები</h3>
          ${trField('eyebrow', 'ზედა წარწერა', h.eyebrow, { ph: 'მაგ.: შავი პარასკევი · 27–30 ნოემბერი' })}
          ${trField('title', 'სათაური', h.title, { hint: 'გამოსაყოფი სიტყვები ჩასვი &lt;em&gt;…&lt;/em&gt;-ში — სლაიდის ფერით გამოჩნდება.' })}
          ${trField('lead', 'ტექსტი', h.lead, { type: 'text' })}</section>
          <section class="ad-card"><h3>ღილაკები</h3><div class="ad-row2">${trField('cta', 'პირველი ღილაკი', h.cta)}${field('cta_url', 'ბმული', h.cta_url, { ph: '/shop?sale=1' })}</div>
          <div class="ad-row2">${trField('cta2', 'მეორე ღილაკი', h.cta2)}${field('cta2_url', 'ბმული', h.cta2_url, { ph: '/shop?cat=toys' })}</div>
          <p class="ad-hint">ბმულის მაგალითები: <code>/shop</code>, <code>/shop?cat=toys</code>, <code>/shop?sale=1</code>, <code>/product/p15</code>, <code>/news</code></p></section></div>
        <aside class="ad-edit__side"><section class="ad-card"><h3>სლაიდის ტიპი</h3>
            ${select('layout', 'განლაგება', [['photo', 'ფოტო ფონზე + ტექსტი'], ['banner', 'მხოლოდ ბანერი (მთლიანი სურათი)']], h.layout || 'photo')}
            ${field('color', 'სლაიდის ფერი', h.color, { type: 'color' })}${sw('hidden', 'დამალული', h.hidden)}</section>
          <section class="ad-card"><h3>ფონის ფოტო <small class="muted">(„ფოტო ფონზე“)</small></h3>
            <div class="ad-photos" data-photo-pick>${PHOTOS.map(([p, l]) => `<button type="button" class="ad-photo${h.bg === p ? ' is-on' : ''}" data-bg="${p}" title="${l}"><img src="${p.replace('.webp', '-sm.webp')}" alt=""><span>${l}</span></button>`).join('')}</div>
            ${imageField('bg', h.bg, 'ან ატვირთე შენი ფოტო — ჰორიზონტალური, 1600px+')}</section>
          <section class="ad-card"><h3>ბანერის სურათი <small class="muted">(„მხოლოდ ბანერი“)</small></h3>${imageField('image', h.image, 'მაგ. VIVACHE-ს ბანერი 1522×496')}</section>
          <section class="ad-card"><h3>პროდუქცია ფოტოზე <small class="muted">(2-მდე)</small></h3>${productPicker('products', h.products)}</section>
          ${isNew ? '' : `<section class="ad-card ad-card--danger"><h3>წაშლა</h3><button type="button" class="ad-btn ad-btn--danger-ghost ad-btn--sm" data-del>${icon('trash')} სლაიდის წაშლა</button></section>`}</aside></form>`,
      mount(el) {
        const f = $('#f', el); bindForm(f); bindPicker(f);
        $('[data-photo-pick]', el).addEventListener('click', (e) => {
          const b = e.target.closest('[data-bg]'); if (!b) return;
          $('.ad-photo', el).forEach((x) => x.classList.toggle('is-on', x === b));
          const box = $('[data-image="bg"]', f); box.dataset.value = b.dataset.bg; renderImage(box); dirty();
        });
        f.addEventListener('submit', async (e) => { e.preventDefault(); try { await saveItem('hero', id, collect(f), 'სლაიდი'); } catch (x) { fail(x); } });
        const del = $('[data-del]', el); if (del) del.addEventListener('click', () => deleteItem('hero', id, 'სლაიდი წაიშლება.', '#/hero').catch(fail));
      },
    };
  };

  /* ---------- home band (akzonobel "მთავარი გვერდის ზოლი") ---------- */
  function autoBand() {
    const b = D().settings.band || {}; const all = D().products.filter((p) => !p.hidden && (p.images || []).length);
    let list = all; const src = b.source || 'all';
    if (src === 'sale') list = all.filter(disc); else if (src === 'hot') list = all.filter((p) => p.hot); else if (src !== 'all') list = all.filter((p) => desc(src).includes(p.category_id));
    if (list.length < 4) list = all;
    if (b.featured) list = [...list].sort((x, y) => y.hot - x.hot);
    return list.slice(0, Math.max(4, +b.count || 16));
  }
  V.band = () => {
    const b = D().settings.band || {}, manual = b.mode === 'manual' && (b.manual || []).length;
    const styles = [['default', 'ჩვეულებრივი', 'მუქი, ფერადი'], ['blackfriday', 'შავი პარასკევი', 'შავი + ყვითელი'], ['sale', 'აქცია', 'წითელი']];
    const sources = [['all', 'ყველა პროდუქცია'], ['sale', 'მხოლოდ ფასდაკლებული'], ['hot', 'მხოლოდ რჩეული ★'], ...catTree().filter(([, , d]) => d === 0).map(([id, n]) => [id, 'კატეგორია: ' + n])];
    const item = (p, i, list) => `<article class="ad-show__item" data-id="${esc(p.id)}">${list ? '<span class="ad-handle">⋮⋮</span>' : ''}${thumb((p.images || [])[0])}<div class="ad-show__body"><a class="ad-strong" href="#/products/${esc(p.id)}">${esc(T(p.name))}</a><small class="muted">${p.price ? money(p.price) : 'ფასი დაზუსტდება'}${disc(p) ? ` · <b style="color:#B91C1C">−${disc(p)}%</b>` : ''}</small></div>${list ? `<button type="button" class="ad-btn ad-btn--sm ad-btn--danger-ghost" data-unband="${esc(p.id)}" title="მოხსნა">✕</button>` : ''}</article>`;
    return {
      title: 'მთავარი გვერდის ზოლი', actions: `<a class="ad-btn" href="/#band" target="_blank">${icon('arrow-up-right')} საიტზე</a>`,
      html: `<p class="ad-hint" style="margin:0 0 16px;font-size:14px">„ყველა პროდუქტის“ მოძრავი ზოლი მთავარ გვერდზე (ორ რიგად + მოძრავი სიტყვები). აირჩიე რეჟიმი: <b>ავტომატური</b> — პროდუქცია თავისით ირჩევა შენი წესებით, ან <b>ხელით არჩეული</b> — მხოლოდ შენი სია, შენი რიგით. აქციებისთვის (მაგ. შავი პარასკევი) შეცვალე სტილი, ნიშანი და სათაური.</p>
        <div class="ad-modes"><button type="button" class="ad-mode${!manual ? ' is-on' : ''}" data-mode="auto"><b>ავტომატური</b><small>წესებით, შეიძლება ყოველდღე იცვლებოდეს</small></button>
          <button type="button" class="ad-mode${manual ? ' is-on' : ''}" data-mode="manual"><b>ხელით არჩეული</b><small>${manual ? b.manual.length + ' პროდუქტი შენი რიგით' : 'დაიწყება ახლანდელი სიით'}</small></button></div>
        <div class="ad-edit"><div class="ad-edit__main">
          <section class="ad-card"><h3>ზოლის სტილი და აქცია</h3><div class="ad-styles">${styles.map(([k, l, s]) => `<button type="button" class="ad-style ad-style--${k}${(b.style || 'default') === k ? ' is-on' : ''}" data-bstyle="${k}">${l}<small>${s}</small></button>`).join('')}</div>
            <form class="ad-form" id="bf">${field('badge', 'აქციის ნიშანი', b.badge, { ph: 'BLACK FRIDAY · −40%', hint: 'ცარიელი = არ ჩანს' })}
              ${trField('eyebrow', 'ზედა წარწერა', b.eyebrow)}${trField('title', 'სათაური', b.title)}${trField('meta', 'ქვედა ხაზი', b.meta, { hint: '<code>:products</code> და <code>:brands</code> ჩაენაცვლება რიცხვებით' })}
              <div class="ad-row2">${trField('btn', 'ღილაკის წარწერა', b.btn)}${field('url', 'ღილაკის ბმული', b.url, { ph: '/shop?sale=1' })}</div>
              ${trField('words', 'მოძრავი სიტყვები (მძიმით)', b.words, { type: 'text', rows: 2 })}
              <button class="ad-btn ad-btn--accent" type="submit">ტექსტების შენახვა</button></form></section>
          ${!manual ? `<section class="ad-card"><h3>ავტომატური რეჟიმის წესები</h3><form class="ad-form" id="br"><div class="ad-row2">${field('count', 'პროდუქტების რაოდენობა', b.count || 16, { type: 'number', attrs: ' min="4" max="40"' })}${select('source', 'საიდან', sources, b.source || 'all')}</div>
              ${sw('featured', 'ჯერ რჩეული (★) პროდუქცია', b.featured)}${sw('daily', 'ყოველდღე სხვა შერჩევა', b.daily)}<button class="ad-btn ad-btn--accent" type="submit">წესების შენახვა</button></form>
              <p class="ad-hint">ავტომატურად ირჩევა მხოლოდ სურათიანი პროდუქცია. თუ შერჩეულში 4-ზე ნაკლებია — ჩანს ყველა პროდუქცია.</p></section>
            <section class="ad-card"><div class="ad-card__head"><h3>ახლა საიტზე <span class="muted">· ${autoBand().length}</span></h3><button type="button" class="ad-btn ad-btn--sm" data-mode="manual">ამ სიის ხელით რედაქტირება</button></div><div class="ad-show ad-show--grid">${autoBand().map((p) => item(p)).join('')}</div></section>`
          : `<section class="ad-card"><div class="ad-card__head"><h3>ზოლში არჩეული პროდუქცია <span class="muted">· ${b.manual.length}</span></h3><button type="button" class="ad-btn ad-btn--sm ad-btn--ghost" data-band-clear>სიის გასუფთავება</button></div>
              <p class="ad-hint" style="margin:0 0 10px">გადაათრიე <b>⋮⋮</b> რიგითობისთვის — ინახება ავტომატურად. ✕ — მოხსნა.</p><div class="ad-show" data-band-list>${b.manual.map(product).filter(Boolean).map((p) => item(p, 0, true)).join('')}</div></section>`}
        </div><aside class="ad-edit__side"><section class="ad-card ad-sticky"><h3>პროდუქციის დამატება</h3>
          <div class="ad-search" style="margin-bottom:12px">${icon('search')}<input type="search" placeholder="იწყე წერა: სახელი, ბრენდი ან კოდი…" data-band-q></div>
          ${!manual ? '<p class="ad-hint" style="margin:-4px 0 10px">დამატებისას ზოლი გადავა „ხელით არჩეულ“ რეჟიმზე (ახლანდელი სიით + ეს პროდუქტი).</p>' : ''}<div class="ad-show ad-show--results" data-band-res></div></section></aside></div>`,
      mount(el) {
        const save = async (part, msg) => { try { await saveSettings({ band: part }, msg); route(); } catch (x) { fail(x); } };
        const cur = () => (D().settings.band.mode === 'manual' && D().settings.band.manual?.length ? D().settings.band.manual : autoBand().map((p) => p.id));
        $$('form', el).forEach(bindForm);
        el.addEventListener('click', async (e) => {
          const m = e.target.closest('[data-mode]');
          if (m) { const mode = m.dataset.mode; await save(mode === 'manual' ? { mode, manual: cur() } : { mode: 'auto' }, mode === 'manual' ? 'ხელით არჩეული რეჟიმი' : 'ავტომატური რეჟიმი'); return; }
          const s = e.target.closest('[data-bstyle]'); if (s) { await save({ style: s.dataset.bstyle }, 'სტილი შეიცვალა'); return; }
          const add = e.target.closest('[data-band-add]'); if (add) { const ids = cur().filter((x) => x !== add.dataset.bandAdd); ids.push(add.dataset.bandAdd); await save({ mode: 'manual', manual: ids }, 'დაემატა ზოლში'); return; }
          const rm = e.target.closest('[data-unband]'); if (rm) { await save({ manual: cur().filter((x) => x !== rm.dataset.unband) }, 'მოიხსნა'); return; }
          if (e.target.closest('[data-band-clear]') && (await confirmBox('არჩეული სია გასუფთავდება და ზოლი ავტომატურ რეჟიმზე გადავა.', 'გასუფთავება'))) await save({ mode: 'auto', manual: [] }, 'სია გასუფთავდა');
        });
        $('#bf', el).addEventListener('submit', (e) => { e.preventDefault(); const x = collect(e.target); save(x, 'ტექსტები შენახულია'); });
        const br = $('#br', el); if (br) br.addEventListener('submit', (e) => { e.preventDefault(); const x = collect(e.target); x.count = +x.count || 16; save(x, 'წესები შენახულია'); });
        const list = $('[data-band-list]', el);
        if (list && window.Sortable) Sortable.create(list, { handle: '.ad-handle', animation: 160, onEnd: () => save({ manual: $$('[data-id]', list).map((x) => x.dataset.id) }, 'რიგითობა შენახულია') });
        const q = $('[data-band-q]', el), res = $('[data-band-res]', el);
        const search = () => {
          const s = q.value.toLowerCase(), inSet = cur();
          const found = D().products.filter((p) => !p.hidden && (!s || [T(p.name), p.brand, p.code].join(' ').toLowerCase().includes(s))).slice(0, 30);
          res.innerHTML = found.map((p) => `<div class="ad-show__item">${thumb((p.images || [])[0])}<div class="ad-show__body"><b>${esc(T(p.name))}</b><small class="muted">${p.price ? money(p.price) : 'ფასი დაზუსტდება'}</small></div>${inSet.includes(p.id) ? '<span class="ad-tag ad-tag--new">ზოლშია</span>' : `<button type="button" class="ad-btn ad-btn--sm" data-band-add="${esc(p.id)}">+ დამატება</button>`}</div>`).join('') || '<p class="ad-hint">ვერაფერი მოიძებნა</p>';
        };
        q.addEventListener('input', search); search();
      },
    };
  };

  /* ---------- promo: top strip, black friday, bulk discounts ---------- */
  V.promo = () => {
    const pr = D().settings.promo || {};
    const styles = [['default', 'ჩვეულებრივი', 'მუქი'], ['blackfriday', 'შავი პარასკევი', 'შავი + ყვითელი + ტაიმერი'], ['sale', 'აქცია', 'წითელი'], ['news', 'სიახლეები', 'ცისარტყელა']];
    const scopes = [['all', 'ყველა პროდუქცია'], ['hot', 'მხოლოდ რჩეული ★'], ...catTree().map(([id, n, d]) => [id, '— '.repeat(d) + n])];
    const onSale = D().products.filter(disc).length;
    return {
      title: 'აქციები · შავი პარასკევი',
      html: `<div class="ad-grid2"><div class="ad-stack">
          <section class="ad-card"><div class="ad-card__head"><h3>ზედა ზოლი (სიახლეები / აქცია)</h3></div>
            <div class="ad-promo-prev ad-promo-prev--${esc(pr.style || 'default')}" data-prev><span>${esc(T(pr.text))}</span>${pr.ends ? '<em>⏱ ტაიმერი</em>' : ''}</div>
            <form class="ad-form" id="pf">${sw('enabled', 'ზოლი ჩართულია (ყველა გვერდის თავში)', pr.enabled)}
              ${select('style', 'სტილი', styles.map(([k, l, s]) => [k, `${l} — ${s}`]), pr.style || 'default')}
              ${trField('text', 'ტექსტი', pr.text, { ph: 'BLACK FRIDAY · ფასდაკლებები 40%-მდე' })}
              <div class="ad-row2">${field('link', 'ბმული', pr.link, { ph: '/shop?sale=1' })}${field('ends', 'აქციის დასასრული (ტაიმერი)', (pr.ends || '').slice(0, 16), { type: 'datetime-local', hint: 'ცარიელი = ტაიმერის გარეშე' })}</div>
              ${sw('news', 'ზოლში აჩვენე „ზედა ზოლში“ მონიშნული სიახლეები', pr.news, 'სიახლის რედაქტირებისას: „ზედა ზოლში ჩვენება“')}
              <button class="ad-btn ad-btn--accent" type="submit">შენახვა</button></form></section>
        </div><div class="ad-stack">
          <section class="ad-card ad-card--bf"><h3>⚡ შავი პარასკევის რეჟიმი</h3><p class="ad-hint" style="margin:0 0 14px">ერთი ღილაკით: ზედა ზოლი და მთავარი გვერდის ზოლი შავ-ყვითელ სტილზე, ნიშანი „BLACK FRIDAY“, ზოლში მხოლოდ ფასდაკლებული პროდუქცია. ფასდაკლებები ქვემოთ დააყენე.</p>
            <div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="ad-btn ad-btn--accent" data-preset="bf">${icon('zap')} ჩართვა</button><button type="button" class="ad-btn" data-preset="off">აქციის დასრულება</button></div></section>
          ${D().libra ? `<section class="ad-card"><h3>ფასდაკლება <span class="muted">· ახლა ${onSale} პროდუქტზე</span></h3><p class="ad-hint" style="margin:0">ფასები მოდის <b>LIBRA FINANCE</b>-დან, ამიტომ ფასდაკლებას Libra-ში აკეთებ (ფასების სია) — საიტზე და სალაროში ერთი ფასი იქნება. საიტზე გადახაზული „ძველი ფასი“ და −% ნიშანი ჩაწერე პროდუქციის სიაში, სვეტში „ძველი“.</p><a class="ad-btn ad-btn--sm" style="margin-top:12px" href="#/products">${icon('box')} პროდუქცია</a></section>` : `
          <section class="ad-card"><h3>ფასდაკლება ერთად <span class="muted">· ახლა ${onSale} პროდუქტზე</span></h3>
            <form class="ad-form" id="df" data-ignore><div class="ad-row2">${select('scope', 'რომელ პროდუქციაზე', scopes, 'all')}${field('percent', 'ფასდაკლება %', 20, { type: 'number', attrs: ' min="1" max="90"' })}</div>
              <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="ad-btn ad-btn--dark" type="submit" data-act="apply">ფასდაკლების დაყენება</button><button class="ad-btn ad-btn--danger-ghost" type="submit" data-act="remove">ფასდაკლების მოხსნა</button></div></form>
            <p class="ad-hint">დაყენებისას ახლანდელი ფასი „ძველ ფასად“ ინახება და ახალი ფასი იკლებს %-ით. მოხსნისას ფასი ძველს უბრუნდება. ცალკეულ პროდუქტზე ფასს პროდუქციის სიიდანაც შეცვლი.</p></section>`}
        </div></div>`,
      mount(el) {
        const f = $('#pf', el); bindForm(f);
        const prev = $('[data-prev]', el);
        f.addEventListener('input', () => { prev.className = 'ad-promo-prev ad-promo-prev--' + f.elements.namedItem('style').value; prev.querySelector('span').textContent = f.elements.namedItem('text.ka').value; });
        f.addEventListener('submit', async (e) => { e.preventDefault(); try { await saveSettings({ promo: collect(f) }); } catch (x) { fail(x); } });
        el.addEventListener('click', async (e) => {
          const p = e.target.closest('[data-preset]'); if (!p) return;
          const on = p.dataset.preset === 'bf';
          if (!(await confirmBox(on ? 'ზედა ზოლი და მთავარი გვერდის ზოლი გადავა „შავი პარასკევის“ სტილზე.' : 'ზოლები ჩვეულებრივ სტილს დაუბრუნდება (ფასდაკლებები ცალკე მოხსენი).', on ? 'ჩართვა' : 'დასრულება', on ? 'შავი პარასკევი' : 'აქციის დასრულება', false))) return;
          const end = new Date(Date.now() + 4 * 864e5).toISOString().slice(0, 10) + 'T23:59';
          try {
            await saveSettings(on ? {
              promo: { enabled: true, style: 'blackfriday', text: { ka: 'BLACK FRIDAY · ფასდაკლებები 40%-მდე', en: 'BLACK FRIDAY · up to 40% off' }, link: '/shop?sale=1', ends: D().settings.promo?.ends || end, news: true },
              band: { style: 'blackfriday', badge: 'BLACK FRIDAY', source: 'sale', mode: 'auto', title: { ka: 'შავი პარასკევის შეთავაზებები', en: 'Black Friday deals' }, btn: { ka: 'ყველა ფასდაკლება', en: 'All deals' }, url: '/shop?sale=1' },
            } : {
              promo: { style: 'news', text: { ka: 'უფასო მიწოდება 100 ₾-დან · სასაჩუქრე შეფუთვა', en: 'Free delivery from 100 GEL · Gift wrapping' }, link: '/shop', ends: '' },
              band: { style: 'default', badge: '', source: 'all', title: { ka: 'ყველა პროდუქტი', en: 'All products' }, btn: { ka: 'ყველა პროდუქტი', en: 'All products' }, url: '/shop' },
            }, on ? 'შავი პარასკევი ჩაირთო ⚡' : 'აქცია დასრულდა');
            route(); renderNav();
          } catch (x) { fail(x); }
        });
        const df = $('#df', el);
        if (df) df.addEventListener('submit', async (e) => {
          e.preventDefault();
          const act = e.submitter?.dataset.act || 'apply', x = collect(df);
          const scopeName = (sel => sel.options[sel.selectedIndex])(df.elements.namedItem("scope")).text.replace(/^[—\s]+/, '');
          if (!(await confirmBox(act === 'apply' ? `„${scopeName}“ — ფასდაკლება ${x.percent}%.` : `„${scopeName}“ — ფასდაკლება მოიხსნება, ფასები ძველს დაუბრუნდება.`, act === 'apply' ? 'დაყენება' : 'მოხსნა', 'ფასდაკლება', act !== 'apply'))) return;
          try { const r = await api('POST', 'products/discount', { scope: x.scope, percent: +x.percent, action: act }); await reload(); toast(`შეიცვალა ${r.changed} პროდუქტი`); route(); } catch (err) { fail(err); }
        });
      },
    };
  };

  /* ---------- news ---------- */
  V.newsList = () => {
    const list = [...D().news].sort((a, b) => String(b.date).localeCompare(String(a.date)));
    return {
      title: 'სიახლეები', actions: `<a class="ad-btn ad-btn--accent" href="#/news/new">${icon('plus')} ახალი სიახლე</a>`,
      html: `<div class="ad-news">${list.map((n) => `<a class="ad-news__card${n.hidden ? ' is-off' : ''}" href="#/news/${esc(n.id)}"><span class="ad-news__img" style="--c:${esc(n.color)}">${n.image ? `<img src="${esc(n.image)}" alt="">` : ''}</span>
        <small class="muted">${esc(n.date)}${n.pinned ? ' · <b style="color:#BE185D">ზედა ზოლში</b>' : ''}${n.hidden ? ' · დამალული' : ''}</small><b>${esc(T(n.title))}</b></a>`).join('') || `<div class="ad-empty"><p>სიახლეები ჯერ არ არის.</p></div>`}</div>`,
    };
  };
  V.news = (id) => {
    const isNew = id === 'new', n = isNew ? { title: {}, excerpt: {}, text: {}, color: COLORS[D().news.length % COLORS.length], date: new Date().toISOString().slice(0, 10) } : D().news.find((x) => x.id === id);
    if (!n) return notFound();
    const title = isNew ? 'ახალი სიახლე' : T(n.title);
    return {
      title, crumbs: `<a href="#/news">სიახლეები</a> / ${isNew ? 'ახალი' : esc(n.id)}`,
      actions: `${!isNew ? `<a class="ad-btn" href="/post/${esc(n.id)}" target="_blank">${icon('arrow-up-right')} საიტზე</a>` : ''}<button class="ad-btn ad-btn--accent" type="submit" form="f">${isNew ? 'გამოქვეყნება' : 'შენახვა'}</button>`,
      html: `<form id="f" class="ad-edit" novalidate><div class="ad-edit__main"><section class="ad-card">${trField('title', 'სათაური', n.title, { required: true })}${trField('excerpt', 'მოკლე აღწერა (ბარათზე)', n.excerpt, { type: 'text', rows: 2 })}${trField('text', 'ტექსტი', n.text, { type: 'rich' })}</section></div>
        <aside class="ad-edit__side"><section class="ad-card"><h3>გამოქვეყნება</h3><div class="ad-row2">${field('date', 'თარიღი', n.date, { type: 'date' })}${field('color', 'ფერი', n.color, { type: 'color' })}</div>
          ${sw('pinned', 'ზედა ზოლში ჩვენება', n.pinned, 'სათაური მოძრავ ზედა ზოლში გამოჩნდება')}${sw('hidden', 'დამალული', n.hidden)}</section>
          <section class="ad-card"><h3>მთავარი სურათი</h3>${imageField('image', n.image, 'ჰორიზონტალური ან გამჭვირვალე PNG')}</section>
          ${isNew ? '' : `<section class="ad-card ad-card--danger"><h3>წაშლა</h3><button type="button" class="ad-btn ad-btn--danger-ghost ad-btn--sm" data-del>${icon('trash')} სიახლის წაშლა</button></section>`}</aside></form>`,
      mount(el) {
        const f = $('#f', el); bindForm(f);
        f.addEventListener('submit', async (e) => { e.preventDefault(); const x = collect(f); if (!x.title.ka && !x.title.en) { toast('სათაური სავალდებულოა', true); return; } try { await saveItem('news', id, x, 'სიახლე'); } catch (err) { fail(err); } });
        const del = $('[data-del]', el); if (del) del.addEventListener('click', () => deleteItem('news', id, `სიახლე „${title}“ წაიშლება.`, '#/news').catch(fail));
      },
    };
  };

  /* ---------- pages: about / delivery / terms + own pages (/p/<slug>) ---------- */
  const PAGES = { about: 'ჩვენს შესახებ', delivery: 'მიწოდება და დაბრუნება', terms: 'წესები და პირობები' };
  const pageUrl = (key) => (PAGES[key] ? '/' + key : '/p/' + key);
  const slugify = (s) => String(s || '').toLowerCase().trim()
    .replace(/[ა-ჰ]/g, (ch) => ({ ა: 'a', ბ: 'b', გ: 'g', დ: 'd', ე: 'e', ვ: 'v', ზ: 'z', თ: 't', ი: 'i', კ: 'k', ლ: 'l', მ: 'm', ნ: 'n', ო: 'o', პ: 'p', ჟ: 'zh', რ: 'r', ს: 's', ტ: 't', უ: 'u', ფ: 'p', ქ: 'k', ღ: 'gh', ყ: 'k', შ: 'sh', ჩ: 'ch', ც: 'ts', ძ: 'dz', წ: 'ts', ჭ: 'ch', ხ: 'kh', ჯ: 'j', ჰ: 'h' }[ch] || ''))
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
  V.pagesList = () => {
    const pages = D().pages || {};
    const keys = [...Object.keys(PAGES), ...Object.keys(pages).filter((k) => !PAGES[k])];
    const inMenu = (k) => (D().settings.menu || []).some((m) => m.url === pageUrl(k) && !m.hidden);
    return {
      title: 'გვერდები', actions: `<button type="button" class="ad-btn ad-btn--accent" data-new-page>${icon('plus')} ახალი გვერდი</button>`,
      html: `<div class="ad-flash ad-flash--info">${icon('info')} <span>ახალი გვერდი (მაგ.: „ეს საინტერესოა“, „თავსატეხები“) იხსნება მისამართზე <b>/p/სახელი</b>. შექმნისას შეგიძლია პირდაპირ მთავარ მენიუშიც დაამატო — მენიუს რიგი და სახელები: <a class="ad-link" href="#/menu">მთავარი მენიუ</a>.</span></div>
        <section class="ad-card"><table class="ad-table"><thead><tr><th>გვერდი</th><th>მისამართი</th><th>მენიუში</th><th></th></tr></thead><tbody>
        ${keys.map((k) => `<tr><td><a class="ad-link" href="#/pages/${esc(k)}"><b>${esc(T(pages[k]?.title) || PAGES[k] || k)}</b></a>${PAGES[k] ? ' <span class="ad-tag ad-tag--muted">ძირითადი</span>' : ''}</td>
          <td><a class="ad-link" href="${pageUrl(k)}" target="_blank" rel="noopener">${pageUrl(k)}</a></td><td>${inMenu(k) ? '✓' : '<span class="muted">—</span>'}</td>
          <td style="text-align:right;white-space:nowrap"><a class="ad-btn ad-btn--sm" href="#/pages/${esc(k)}">რედაქტირება</a>${PAGES[k] ? '' : ` <button type="button" class="ad-btn ad-btn--sm ad-btn--danger-ghost" data-del-page="${esc(k)}">${icon('trash')}</button>`}</td></tr>`).join('')}
        </tbody></table></section>
        <dialog class="ad-dialog" id="np"><form method="dialog" class="ad-form" id="npf"><h3>ახალი გვერდი</h3>
          ${field('title', 'სათაური', '', { ph: 'ეს საინტერესოა', required: true })}${field('slug', 'მისამართი (ლათინურად)', '', { ph: 'saintereso', hint: 'გვერდი გაიხსნება: /p/<b>მისამართი</b>' })}
          ${sw('menu', 'მთავარ მენიუში დამატება', true)}
          <div style="display:flex;gap:8px;justify-content:flex-end"><button type="button" class="ad-btn" data-np-cancel>გაუქმება</button><button class="ad-btn ad-btn--accent" type="submit">შექმნა</button></div></form></dialog>`,
      mount(el) {
        const dlg = $('#np', el), f = $('#npf', el), slug = f.elements.namedItem('slug');
        $('[data-new-page]', document).addEventListener('click', () => { f.reset(); dlg.showModal(); });
        $('[data-np-cancel]', el).addEventListener('click', () => dlg.close());
        f.elements.namedItem('title').addEventListener('input', (e) => { if (!slug.dataset.touched) slug.value = slugify(e.target.value); });
        slug.addEventListener('input', () => { slug.dataset.touched = '1'; });
        f.addEventListener('submit', async (e) => {
          e.preventDefault();
          const title = f.elements.namedItem('title').value.trim(), key = slugify(slug.value || title) || ('page-' + Date.now().toString(36));
          if (!title) { toast('სათაური სავალდებულოა', true); return; }
          if ((D().pages || {})[key] || PAGES[key]) { toast('ასეთი მისამართი უკვე არსებობს', true); return; }
          try {
            A.data.pages = await api('PUT', 'pages/' + key, { title: { ka: title, en: '' }, lead: {}, text: { ka: '<p>' + esc(title) + '</p>', en: '' } });
            if (f.elements.namedItem('menu').checked) await saveSettings({ menu: [...(D().settings.menu || []), { id: 'm' + Date.now().toString(36), label: { ka: title, en: '' }, url: '/p/' + key, mega: false, hidden: false }] }, 'გვერდი შეიქმნა და მენიუში დაემატა');
            else toast('გვერდი შეიქმნა');
            dlg.close(); go('#/pages/' + key);
          } catch (x) { fail(x); }
        });
        el.addEventListener('click', async (e) => {
          const d = e.target.closest('[data-del-page]'); if (!d) return;
          const k = d.dataset.delPage;
          if (!(await confirmBox(`გვერდი „${T(D().pages[k]?.title) || k}“ წაიშლება (მენიუდანაც).`))) return;
          try {
            A.data.pages = await api('DELETE', 'pages/' + k);
            const menu = (D().settings.menu || []).filter((m) => m.url !== '/p/' + k);
            if (menu.length !== (D().settings.menu || []).length) await saveSettings({ menu }, 'წაიშალა'); else toast('წაიშალა');
            route();
          } catch (x) { fail(x); }
        });
      },
    };
  };
  V.page = (key) => {
    const pg = D().pages[key];
    if (!pg && !PAGES[key]) return notFound();
    const p = pg || { title: {}, lead: {}, text: {} }, name = PAGES[key] || T(p.title) || key;
    return {
      title: name, crumbs: `<a href="#/pages">გვერდები</a> / ${esc(name)}`,
      actions: `<a class="ad-btn" href="${pageUrl(key)}" target="_blank">${icon('arrow-up-right')} საიტზე</a><button class="ad-btn ad-btn--accent" type="submit" form="f">შენახვა</button>`,
      html: `<form id="f" class="ad-edit" novalidate><div class="ad-edit__main"><section class="ad-card">${trField('title', 'სათაური', p.title)}${trField('lead', 'შესავალი', p.lead, { type: 'text', rows: 2 })}${trField('text', 'ტექსტი', p.text, { type: 'rich' })}</section></div>
        <aside class="ad-edit__side"><section class="ad-card"><h3>სურათი</h3>${imageField('image', p.image)}</section>
        <section class="ad-card"><p class="ad-hint" style="margin:0">მისამართი: <a class="ad-link" href="${pageUrl(key)}" target="_blank">${pageUrl(key)}</a><br>მენიუში ჩვენება: <a class="ad-link" href="#/menu">მთავარი მენიუ</a></p></section>
        ${key === 'about' ? '<section class="ad-card"><p class="ad-hint" style="margin:0">რიცხვების ზოლი (პროდუქტი, ბრენდი, წელი, მაღაზია) — <a class="ad-link" href="#/settings">პარამეტრები → რიცხვები</a></p></section>' : ''}</aside></form>`,
      mount(el) {
        const f = $('#f', el); bindForm(f);
        f.addEventListener('submit', async (e) => { e.preventDefault(); try { A.data.pages = await api('PUT', 'pages/' + key, collect(f)); A.dirty = false; toast('შენახულია'); } catch (x) { fail(x); } });
      },
    };
  };

  /* ---------- main menu ---------- */
  function linkOptions() {
    const pages = D().pages || {};
    return [['/shop', 'პროდუქცია (მაღაზია)'], ['/news', 'სიახლეები'], ['/contact', 'კონტაქტი'], ['/about', 'ჩვენს შესახებ'], ['/delivery', 'მიწოდება'], ['/terms', 'წესები და პირობები'], ['/shop?sale=1', 'ფასდაკლებები'], ['/wishlist', 'რჩეულები'],
      ...Object.keys(pages).filter((k) => !PAGES[k]).map((k) => ['/p/' + k, T(pages[k].title) || k]),
      ...D().categories.filter((c) => !c.parent).map((c) => ['/shop?cat=' + c.id, 'კატეგორია: ' + T(c.name)])];
  }
  V.menu = () => {
    const menu = D().settings.menu || [];
    const row = (m) => `<li class="ad-mrow${m.hidden ? ' is-off' : ''}" data-id="${esc(m.id)}"><span class="ad-mrow__grip" title="გადაათრიე">⋮⋮</span>
      <input type="text" data-k="ka" value="${esc(T(m.label) || m.label?.ka || '')}" placeholder="სახელი" aria-label="სახელი">
      <input type="text" data-k="en" value="${esc(m.label?.en || '')}" placeholder="English" aria-label="English">
      <input type="text" data-k="url" value="${esc(m.url || '')}" list="menu-links" placeholder="/p/..." aria-label="ბმული">
      <label class="ad-check" title="ჩამოსაშლელი მენიუ კატეგორიებით"><input type="checkbox" data-k="mega"${m.mega ? ' checked' : ''}> <span>კატეგორიები</span></label>
      <label class="ad-check"><input type="checkbox" data-k="hidden"${m.hidden ? ' checked' : ''}> <span>დამალვა</span></label>
      <button type="button" class="ad-btn ad-btn--sm ad-btn--danger-ghost" data-del-m title="წაშლა">${icon('trash')}</button></li>`;
    return {
      title: 'მთავარი მენიუ', actions: `<a class="ad-btn" href="/" target="_blank">${icon('arrow-up-right')} საიტზე</a><button class="ad-btn ad-btn--accent" type="button" data-save-menu>შენახვა</button>`,
      html: `<div class="ad-flash ad-flash--info">${icon('info')} <span>საიტის ზედა მენიუ: გადაათრიე ⋮⋮ რიგის შესაცვლელად, შეცვალე სახელი, ბმული, დამალე ან წაშალე. „კატეგორიები“ — ამ პუნქტზე გამოჩნდება LIBRA-ს კატეგორიების ჩამოსაშლელი მენიუ. ახალი გვერდისთვის (მაგ. „თავსატეხები“) ჯერ შექმენი <a class="ad-link" href="#/pages">გვერდები</a>-ში.</span></div>
        <section class="ad-card"><ul class="ad-menu-list" id="ml">${menu.map(row).join('')}</ul>
          <datalist id="menu-links">${linkOptions().map(([u, l]) => `<option value="${esc(u)}">${esc(l)}</option>`).join('')}</datalist>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button type="button" class="ad-btn ad-btn--sm" data-add-m>${icon('plus')} პუნქტის დამატება</button>
          <a class="ad-btn ad-btn--sm ad-btn--ghost" href="#/pages">${icon('file')} ახალი გვერდის შექმნა</a></div></section>`,
      mount(el) {
        const ml = $('#ml', el);
        if (window.Sortable) Sortable.create(ml, { handle: '.ad-mrow__grip', animation: 160, onEnd: dirty });
        el.addEventListener('input', dirty);
        el.addEventListener('click', (e) => {
          if (e.target.closest('[data-add-m]')) { ml.insertAdjacentHTML('beforeend', row({ id: 'm' + Date.now().toString(36), label: { ka: '', en: '' }, url: '' })); $('li:last-child input', ml).focus(); dirty(); }
          const d = e.target.closest('[data-del-m]'); if (d) { d.closest('li').remove(); dirty(); }
        });
        $('[data-save-menu]', document).addEventListener('click', async () => {
          const items = $$('li', ml).map((li) => {
            const g = (k) => $(`[data-k="${k}"]`, li);
            return { id: li.dataset.id, label: { ka: g('ka').value.trim(), en: g('en').value.trim() }, url: g('url').value.trim() || '/', mega: g('mega').checked, hidden: g('hidden').checked };
          }).filter((m) => m.label.ka || m.label.en);
          let seen = false; items.forEach((m) => { if (m.mega) { if (seen) m.mega = false; seen = true; } });
          try { await saveSettings({ menu: items }); route(); } catch (x) { fail(x); }
        });
      },
    };
  };

  /* ---------- home page sections ---------- */
  const SECTION_INFO = {
    hero: ['ქავერი (სლაიდერი)', '#/hero', false], band: ['მოძრავი ზოლი', '#/band', false],
    top: ['პროდუქცია · ტოპ გაყიდვადი', '', true], directions: ['კატეგორიები (ფოტოებით)', '#/categories', true],
    hot: ['რჩეული პროდუქცია (ჩანართებით)', '#/products', true], sale: ['ფასდაკლებული პროდუქცია', '', true],
    features: ['უპირატესობები (მიწოდება, საჩუქარი…)', '', false], news: ['სიახლეები', '#/news', true],
    cashback: ['ქეშბექ ბარათი', '#/settings', false], brands: ['ბრენდების ზოლი', '#/brands', true], text: ['ტექსტური ბლოკი', '', true],
  };
  V.sections = () => {
    const list = D().settings.sections || [];
    const two = (k, label, v) => `<div class="ad-field"><span>${label}</span><div class="ad-row2"><input type="text" data-k="${k}.ka" value="${esc(v?.ka ?? (typeof v === 'string' ? v : ''))}" placeholder="ქართულად"><input type="text" data-k="${k}.en" value="${esc(v?.en || '')}" placeholder="English"></div></div>`;
    const card = (s) => {
      const [name, link, texts] = SECTION_INFO[s.key] || [s.key, '', false];
      const counted = ['top', 'hot', 'sale'].includes(s.key);
      return `<li class="ad-sec${s.enabled === false ? ' is-off' : ''}" data-key="${esc(s.key)}"><div class="ad-sec__head"><span class="ad-mrow__grip" title="გადაათრიე">⋮⋮</span>
        <label class="ad-check ad-check--switch"><input type="checkbox" data-k="enabled"${s.enabled !== false ? ' checked' : ''}> <span><b>${esc(name)}</b></span></label>
        <span class="ad-sec__acts">${link ? `<a class="ad-btn ad-btn--sm ad-btn--ghost" href="${link}">შიგთავსი →</a>` : ''}${texts || counted ? '<button type="button" class="ad-btn ad-btn--sm" data-open>ტექსტები</button>' : ''}${s.key === 'text' ? `<button type="button" class="ad-btn ad-btn--sm ad-btn--danger-ghost" data-del-s>${icon('trash')}</button>` : ''}</span></div>
        <div class="ad-sec__body" hidden>
          ${s.key === 'top' ? '<p class="ad-hint">საიტზე გაყიდული პროდუქცია ავტომატურად ხდება „ტოპ გაყიდვადი“ (LIBRA-ს გაყიდვებიც ითვლება) და ★ ნიშნით პირველი ჩანს. სანამ გაყიდვები არ არის — ჩანს შერეული პროდუქცია.</p>' : ''}
          ${texts ? two('eyebrow', 'ზედა წარწერა', s.eyebrow) + two('title', 'სათაური', s.title) + two('lead', 'ტექსტი', s.lead) + `<div class="ad-row2">${two('btn', 'ღილაკი', s.btn)}<label class="ad-field"><span>ღილაკის ბმული</span><input type="text" data-k="url" value="${esc(s.url || '')}" list="menu-links" placeholder="/shop"></label></div>` : ''}
          ${counted ? `<label class="ad-field"><span>რამდენი პროდუქტი</span><input type="number" min="4" max="48" data-k="count" value="${esc(s.count || (s.key === 'hot' ? 8 : 12))}"></label>` : ''}
        </div></li>`;
    };
    return {
      title: 'მთავარი გვერდის სექციები', actions: `<a class="ad-btn" href="/" target="_blank">${icon('arrow-up-right')} საიტზე</a><button class="ad-btn ad-btn--accent" type="button" data-save-sec>შენახვა</button>`,
      html: `<div class="ad-flash ad-flash--info">${icon('info')} <span>მთავარი გვერდი ზემოდან ქვემოთ: გადაათრიე ⋮⋮ რიგისთვის, ჩართე/გამორთე, შეცვალე სათაურები და ტექსტები. ცარიელი ტექსტი = სტანდარტული.</span></div>
        <section class="ad-card"><ul class="ad-sec-list" id="sl">${list.map(card).join('')}</ul>
          <datalist id="menu-links">${linkOptions().map(([u, l]) => `<option value="${esc(u)}">${esc(l)}</option>`).join('')}</datalist>
          <div style="display:flex;gap:8px;margin-top:12px"><button type="button" class="ad-btn ad-btn--sm" data-add-text>${icon('plus')} ტექსტური ბლოკის დამატება</button>
          ${list.some((s) => s.key === 'top') ? '' : `<button type="button" class="ad-btn ad-btn--sm" data-add-top>${icon('plus')} პროდუქციის ბადე</button>`}</div></section>`,
      mount(el) {
        const sl = $('#sl', el);
        if (window.Sortable) Sortable.create(sl, { handle: '.ad-mrow__grip', animation: 160, onEnd: dirty });
        el.addEventListener('input', dirty);
        el.addEventListener('click', (e) => {
          const o = e.target.closest('[data-open]'); if (o) { const b = $('.ad-sec__body', o.closest('li')); b.hidden = !b.hidden; }
          const d = e.target.closest('[data-del-s]'); if (d) { d.closest('li').remove(); dirty(); }
          if (e.target.closest('[data-add-text]')) { sl.insertAdjacentHTML('beforeend', card({ key: 'text', enabled: true })); $('li:last-child .ad-sec__body', sl).hidden = false; dirty(); }
          if (e.target.closest('[data-add-top]')) { sl.insertAdjacentHTML('afterbegin', card({ key: 'top', enabled: true, count: 12 })); dirty(); }
        });
        $('[data-save-sec]', document).addEventListener('click', async () => {
          const sections = $$('li.ad-sec', sl).map((li) => {
            const s = { key: li.dataset.key };
            $$('[data-k]', li).forEach((i) => {
              if (i.type === 'checkbox') s[i.dataset.k] = i.checked;
              else if (i.dataset.k === 'count') s.count = Math.max(4, Math.min(48, +i.value || 12));
              else setPath(s, i.dataset.k, i.value.trim());
            });
            return s;
          });
          try { await saveSettings({ sections }); route(); } catch (x) { fail(x); }
        });
      },
    };
  };

  /* ---------- music ---------- */
  const AUDIO_EXT = { mp3: 'audio/mpeg', m4a: 'audio/mp4', ogg: 'audio/ogg', aac: 'audio/aac', wav: 'audio/wav' };
  V.music = () => {
    const mu = D().settings.music || {}, tracks = mu.tracks || [];
    const row = (t) => `<li class="ad-mrow" data-id="${esc(t.id)}" data-src="${esc(t.src)}"><span class="ad-mrow__grip" title="გადაათრიე">⋮⋮</span>
      <button type="button" class="ad-btn ad-btn--sm" data-play title="მოსმენა">▶</button>
      <input type="text" data-k="title" value="${esc(t.title || '')}" placeholder="სიმღერის სახელი" aria-label="სახელი">
      <a class="ad-link ad-mrow__src" href="${esc(t.src)}" target="_blank" rel="noopener" title="${esc(t.src)}">${esc(t.src.split('/').pop().slice(0, 28))}</a>
      <label class="ad-check"><input type="checkbox" data-k="hidden"${t.hidden ? ' checked' : ''}> <span>გამორთვა</span></label>
      <button type="button" class="ad-btn ad-btn--sm ad-btn--danger-ghost" data-del-t title="წაშლა">${icon('trash')}</button></li>`;
    return {
      title: 'მუსიკა', actions: `<button class="ad-btn ad-btn--accent" type="button" data-save-mu>შენახვა</button>`,
      html: `<div class="ad-flash ad-flash--info">${icon('info')} <span>მუსიკა უკრავს მთელ საიტზე და გვერდიდან გვერდზე გადასვლისას <b>არ წყდება</b>. ბრაუზერები ხმას რთავენ მხოლოდ მომხმარებლის პირველი დაჭერის შემდეგ — მუსიკა დაიწყება საიტზე პირველივე დაჭერისას (სტუმარს შეუძლია გამორთოს 🎵 ღილაკით, ქვედა კუთხეში).</span></div>
        <div class="ad-grid2"><section class="ad-card"><h3>ფლეილისტი</h3>
          <ul class="ad-menu-list" id="tl">${tracks.map(row).join('') || ''}</ul>${tracks.length ? '' : '<p class="ad-hint" data-empty>შენი სიმღერები ჯერ არ არის — ატვირთე MP3 ან დაამატე ბმული.</p>'}
          <label class="ad-drop" data-drop>${icon('plus', '')}<input type="file" accept="audio/*,.mp3,.m4a,.ogg,.wav" multiple data-audio><span>მუსიკის ატვირთვა<br><small>MP3, M4A, OGG · თითო ფაილი 5.8 MB-მდე (128 kbps MP3 ≈ 6 წუთი)</small></span></label>
          <div class="ad-row2" style="margin-top:10px"><input type="url" data-url placeholder="ან ბმული: https://…/song.mp3"><button type="button" class="ad-btn" data-add-url>${icon('link')} ბმულით დამატება</button></div>
          <p class="ad-hint">გამოიყენე მხოლოდ მუსიკა, რომლის გამოყენების უფლებაც გაქვს (საკუთარი, ლიცენზირებული ან უფასო ლიცენზიით).</p></section>
        <section class="ad-card"><h3>პარამეტრები</h3><form class="ad-form" id="muf">
          ${sw('enabled', 'მუსიკა საიტზე', mu.enabled !== false)}${sw('autoplay', 'ავტომატური ჩართვა', mu.autoplay !== false, 'იწყება სტუმრის პირველივე დაჭერით / შეხებით')}
          ${sw('builtin', '🎄 საახალწლო მელოდიები', mu.builtin !== false, 'Jingle Bells, We Wish You…, Deck the Halls, Silent Night — ფაილების გარეშე, ფლეილისტის ბოლოს')}
          ${sw('shuffle', 'შემთხვევითი რიგი', mu.shuffle)}
          <label class="ad-field"><span>ხმის დონე <b data-vol>${Math.round((mu.volume ?? 0.6) * 100)}%</b></span><input type="range" name="volume" min="0.1" max="1" step="0.05" value="${mu.volume ?? 0.6}"></label></form></section></div>`,
      mount(el) {
        const tl = $('#tl', el), f = $('#muf', el); let player = null;
        if (window.Sortable) Sortable.create(tl, { handle: '.ad-mrow__grip', animation: 160, onEnd: dirty });
        el.addEventListener('input', (e) => { dirty(); if (e.target.name === 'volume') $('[data-vol]', el).textContent = Math.round(e.target.value * 100) + '%'; });
        const add = (src, title) => { const em = $('[data-empty]', el); if (em) em.remove(); tl.insertAdjacentHTML('beforeend', row({ id: 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), src, title })); dirty(); };
        el.addEventListener('click', (e) => {
          const p = e.target.closest('[data-play]');
          if (p) {
            const src = p.closest('li').dataset.src;
            if (player && player.dataset.src === src && !player.paused) { player.pause(); p.textContent = '▶'; return; }
            if (player) player.pause(); $$('[data-play]', el).forEach((b) => { b.textContent = '▶'; });
            player = new Audio(src); player.dataset.src = src; player.volume = +f.elements.namedItem('volume').value; player.play().catch(fail); p.textContent = '❚❚';
          }
          const d = e.target.closest('[data-del-t]'); if (d) { d.closest('li').remove(); dirty(); }
          if (e.target.closest('[data-add-url]')) {
            const u = $('[data-url]', el).value.trim();
            if (!/^https?:\/\/\S+$/i.test(u)) { toast('ჩაწერე სრული ბმული (https://…)', true); return; }
            add(u, decodeURIComponent(u.split('/').pop().replace(/\.[a-z0-9]+(\?.*)?$/i, '')).replace(/[-_]+/g, ' ')); $('[data-url]', el).value = '';
          }
        });
        $('[data-audio]', el).addEventListener('change', async (e) => {
          const drop = e.target.closest('.ad-drop'); drop.classList.add('is-busy');
          try {
            for (const file of [...e.target.files]) {
              const ext = (file.name.split('.').pop() || '').toLowerCase();
              const type = AUDIO_EXT[ext] || file.type;
              if (!type || !type.startsWith('audio/')) throw new Error(file.name + ' — მუსიკის ფაილი არ არის');
              if (file.size > 5.8 * 1024 * 1024) throw new Error(file.name + ' — 5.8 MB-ზე დიდია. შეკუმშე 128 kbps MP3-ად ან დაამატე ბმულით');
              const url = (await api('POST', 'upload', undefined, new Blob([file], { type }))).url;
              add(url, file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '));
            }
            toast('აიტვირთა — არ დაგავიწყდეს „შენახვა“');
          } catch (x) { fail(x); } finally { drop.classList.remove('is-busy'); e.target.value = ''; }
        });
        $('[data-save-mu]', document).addEventListener('click', async () => {
          const x = collect(f); x.volume = +x.volume;
          x.tracks = $$('li', tl).map((li) => ({ id: li.dataset.id, src: li.dataset.src, title: $('[data-k="title"]', li).value.trim() || 'VIVACHE', hidden: $('[data-k="hidden"]', li).checked }));
          try { if (player) player.pause(); await saveSettings({ music: x }); route(); } catch (err) { fail(err); }
        });
      },
    };
  };

  /* ---------- settings ---------- */
  /* ---------- built-in photos (generated for VIVACHE) ---------- */
  const PHOTOS = [['/assets/img/photos/newyear.webp', 'საახალწლო'], ['/assets/img/photos/stationery.webp', 'საკანცელარიო'], ['/assets/img/photos/books.webp', 'წიგნები'], ['/assets/img/photos/toys.webp', 'სათამაშოები'], ['/assets/img/photos/gifts.webp', 'საჩუქრები']];
  const libraTag = '<span class="ad-tag ad-tag--libra" title="LIBRA FINANCE-დან">LIBRA</span>';
  const ro = (label, value) => `<div class="ad-field"><span>${label} ${libraTag}</span><div class="ad-ro">${value || '<span class="muted">—</span>'}</div></div>`;

  /* ---------- LIBRA product: Libra fields read-only + site extras ---------- */
  function libraProduct(id) {
    const p = product(id);
    if (!p) return notFound();
    const brands = D().brands.map((b) => `<option value="${esc(b.name)}">`).join('');
    const extra = (p.images || []).slice(1);
    return {
      title: T(p.name), crumbs: `<a href="#/products">პროდუქცია</a> / ${esc(p.code || p.id.slice(0, 8))}`,
      actions: `<a class="ad-btn" href="/product/${esc(p.id)}" target="_blank" rel="noopener">${icon('arrow-up-right')} საიტზე ნახვა</a><button class="ad-btn ad-btn--accent" type="submit" form="f">შენახვა</button>`,
      html: `<div class="ad-flash ad-flash--info">${icon('info')} <span>სახელი, ფასი, მარაგი, კატეგორია და მთავარი ფოტო მოდის <b>LIBRA FINANCE</b>-დან — ცვლილება Libra-ში გააკეთე. აქ ამატებ მხოლოდ საიტის დეტალებს.</span></div>
        <form id="f" class="ad-edit" novalidate><div class="ad-edit__main">
          <section class="ad-card"><h3>LIBRA FINANCE-დან</h3><div class="ad-row2">${ro('დასახელება', esc(p.name.ka))}${ro('კოდი', esc(p.code))}</div>
            <div class="ad-row3">${ro('ფასი', `<b>${money(p.price)}</b>`)}${ro('მარაგი', p.stock === 0 ? '<span style="color:#DC2626;font-weight:800">ამოიწურა</span>' : '<span style="color:#16A34A;font-weight:800">მარაგშია</span>')}${ro('ერთეული', esc(p.unit))}</div>
            ${ro('კატეგორია', esc(catPath(p.category_id)))}</section>
          <section class="ad-card"><h3>საიტზე</h3>
            ${field('name.en', 'სახელი ინგლისურად', p.name.en, { ph: 'English name (optional)' })}
            <label class="ad-field"><span>ბრენდი</span><input type="text" name="brand" value="${esc(p.brand)}" list="brand-list" placeholder="მაგ.: PaperLab"><datalist id="brand-list">${brands}</datalist></label>
            ${trField('description', 'აღწერა (ცარიელი = Libra-ს აღწერა)', p.description, { type: 'rich' })}${trField('details', 'დეტალები (მასალა, ზომა, ასაკი…)', p.details, { type: 'rich' })}</section>
        </div><aside class="ad-edit__side">
          <section class="ad-card"><h3>ფასდაკლების ჩვენება <span data-disc></span></h3>
            ${field('old_price', 'ძველი ფასი (გადახაზული, ₾)', p.old_price ?? '', { type: 'number', attrs: ' step="0.01" min="0"', ph: 'ცარიელი = ფასდაკლება არ ჩანს', hint: `ახლანდელი ფასი Libra-დან: <b>${money(p.price)}</b>. ძველი ფასი მეტი თუ არის, საიტზე −% ნიშანი გამოჩნდება.` })}
            <input type="hidden" name="price" value="${p.price}"></section>
          <section class="ad-card"><h3>ნიშნები</h3>${sw('hot', 'რჩეული ★ (მთავარ გვერდზე)', p.hot)}${sw('isNew', '„ახალი“ ნიშანი', p.isNew)}${sw('hidden', 'საიტზე დამალვა', p.hidden)}
            <div class="ad-row2">${field('age', 'ასაკი', p.age, { ph: '3+' })}${field('sort', 'რიგითობა', p.sort ?? 0, { type: 'number' })}</div></section>
          <section class="ad-card"><h3>ფოტოები</h3>${p.images[0] ? `<figure class="ad-img ad-img--libra"><img src="${esc(p.images[0])}" alt=""></figure><p class="ad-hint" style="margin:0 0 10px">მთავარი ფოტო — LIBRA-დან. ქვემოთ დაამატე დამატებითი.</p>` : '<p class="ad-hint">Libra-ში ფოტო არ აქვს — დაამატე Libra-ში ან აქ.</p>'}${imagesField('images', extra)}</section>
        </aside></form>`,
      mount(el) {
        const f = $('#f', el); bindForm(f);
        const old = f.elements.namedItem('old_price');
        const upd = () => { const pr = p.price, o = +old.value; $('[data-disc]', el).innerHTML = pr && o > pr ? `<span class="ad-discount">−${Math.round((1 - pr / o) * 100)}%</span>` : ''; };
        old.addEventListener('input', upd); upd();
        f.addEventListener('submit', async (e) => {
          e.preventDefault();
          const x = collect(f); x.name_en = x.name?.en || ''; delete x.name;
          try { const item = await api('PUT', 'products/' + id, x); upsert('products', item); A.dirty = false; toast('შენახულია'); route(); } catch (err) { fail(err); }
        });
      },
    };
  }

  /* ---------- LIBRA categories: tree from Libra, appearance from the site ---------- */
  function libraCategories() {
    const count = (id) => D().products.filter((p) => desc(id).includes(p.category_id)).length;
    const tree = (pid) => { const ks = kids(pid); return ks.length ? `<ul class="ad-tree">${ks.map((c) => `<li><div class="ad-tree__row${c.hidden ? ' is-hidden' : ''}">
        ${!c.parent && c.image ? `<span class="ad-tree__pic"><img src="${esc(c.image)}" alt=""></span>` : ''}<span class="ad-tree__dot" style="--c:${c.parent ? '#fff' : esc(c.color)}">${esc(c.icon || '')}</span>
        <a class="ad-tree__name" href="#/categories/${esc(c.id)}">${esc(T(c.name))}</a><span class="ad-tree__count" title="პროდუქტი">${count(c.id)}</span>
        <a class="ad-btn ad-btn--sm ad-btn--ghost" href="#/categories/${esc(c.id)}">იერსახე</a></div>${tree(c.id)}</li>`).join('')}</ul>` : ''; };
    return {
      title: 'კატეგორიები', actions: '<span class="ad-tag ad-tag--libra">LIBRA FINANCE</span>',
      html: `<div class="ad-flash ad-flash--info">${icon('info')} <span>კატეგორიები და ქვეკატეგორიები მოდის <b>LIBRA FINANCE</b>-დან და ავტომატურად ერწყმის საიტს: ახალი კატეგორია Libra-ში → საიტზე ~1 წუთში, პროდუქცია თავის ადგილას. აქ ცვლი იერსახეს: ფერი, ემოჯი, ფოტო, აღწერა, ინგლისური სახელი, დამალვა, რიგითობა.</span></div>
        <section class="ad-card">${tree(null) || `<div class="ad-empty"><p>Libra-დან კატეგორიები ჯერ არ მოსულა. შეამოწმე Libra → ონლაინ მაღაზია → სინქრონიზაცია.</p></div>`}</section>`,
    };
  }
  function libraCategory(id) {
    const c = cat(id);
    if (!c) return notFound();
    const top = !c.parent;
    return {
      title: T(c.name), crumbs: `<a href="#/categories">კატეგორიები</a> / ${esc(T(c.name))}`,
      actions: `<a class="ad-btn" href="/shop?cat=${esc(c.id)}" target="_blank">${icon('arrow-up-right')} საიტზე</a><button class="ad-btn ad-btn--accent" type="submit" form="f">შენახვა</button>`,
      html: `<form id="f" class="ad-edit" novalidate><div class="ad-edit__main"><section class="ad-card">
          <div class="ad-row2">${ro('სახელი', esc(c.name.ka))}${ro('მშობელი კატეგორია', c.parent ? esc(T(cat(c.parent)?.name)) : 'ზედა დონე (მიმართულება)')}</div>
          ${field('name.en', 'სახელი ინგლისურად', c.name.en, { ph: 'English name' })}
          ${trField('tagline', 'მოკლე აღწერა (ჩანს კატეგორიის ბარათზე)', c.tagline)}
          ${field('sort', 'რიგითობა საიტზე', c.sort ?? '', { type: 'number', hint: 'ცარიელი = Libra-ს რიგი. ნაკლები = წინ.' })}</section></div>
        <aside class="ad-edit__side"><section class="ad-card"><h3>გარეგნობა</h3>
          <div class="ad-row2">${field('color', 'ფერი', c.color || '#FF3D7F', { type: 'color' })}${field('icon', 'ემოჯი', c.icon, { ph: '✏️', attrs: ' maxlength="8"' })}</div>
          ${top ? `<span class="ad-field"><span>ბარათის ფოტო</span></span><div class="ad-photos" data-photo-pick>${PHOTOS.map(([p, l]) => `<button type="button" class="ad-photo${c.image === p ? ' is-on' : ''}" data-bg="${p}" title="${l}"><img src="${p.replace('.webp', '-sm.webp')}" alt=""><span>${l}</span></button>`).join('')}</div>${imageField('image', c.image, 'ან ატვირთე შენი ფოტო')}` : '<p class="ad-hint">ფოტო და ფერი ძირითადად ზედა დონის კატეგორიაზე ჩანს.</p>'}
          ${sw('hidden', 'საიტზე დამალვა', c.hidden)}</section></aside></form>`,
      mount(el) {
        const f = $('#f', el); bindForm(f);
        const pick = $('[data-photo-pick]', el);
        if (pick) pick.addEventListener('click', (e) => {
          const b = e.target.closest('[data-bg]'); if (!b) return;
          $$('.ad-photo', el).forEach((x) => x.classList.toggle('is-on', x === b));
          const box = $('[data-image="image"]', f); box.dataset.value = b.dataset.bg; renderImage(box); dirty();
        });
        f.addEventListener('submit', async (e) => {
          e.preventDefault();
          const x = collect(f); x.name_en = x.name?.en || ''; delete x.name;
          try { const item = await api('PUT', 'categories/' + id, x); upsert('categories', item); A.dirty = false; toast('შენახულია'); route(); } catch (err) { fail(err); }
        });
      },
    };
  }

  /* ---------- New Year mode ---------- */
  V.newyear = () => {
    const ny = D().settings.newyear || {};
    const opts = [['snow', '❄️ თოვლი', 'ნაზი თოვლი მთელ საიტზე'], ['garland', '💡 გირლიანდა', 'მოციმციმე ნათურები მენიუს ქვეშ'], ['santa', '🎅 სანტა კლაუსი', 'სანტა ირმებით ჩრდილოეთიდან მოფრინავს ~40 წამში ერთხელ'],
      ['elves', '🧝 ელფები', 'ეკრანის კუთხეებიდან იხედებიან და ხელს გიქნევენ (კომპიუტერზე)'], ['countdown', '⏳ ახალ წლამდე ტაიმერი', 'ქვედა კუთხეში — დღეები, საათები, წუთები']];
    return {
      title: 'საახალწლო რეჟიმი', actions: `<a class="ad-btn" href="/" target="_blank">${icon('arrow-up-right')} საიტზე</a>`,
      html: `<div class="ad-hello ad-hello--ny"><div><h2>🎄 ახალი წელი საიტზე</h2><p>ერთი ღილაკით ჩართე ან გამორთე მთელი სადღესასწაულო გარემო. ცალკეული ელემენტები ქვემოთ.</p></div>
          <div class="ad-hello__actions"><button type="button" class="ad-btn ${ny.enabled ? '' : 'ad-btn--accent'}" data-ny-all="${ny.enabled ? 'off' : 'on'}">${ny.enabled ? 'გამორთვა' : '🎄 ჩართვა'}</button></div></div>
        <div class="ad-grid2"><section class="ad-card"><h3>ელემენტები ${ny.enabled ? '<span class="ad-tag ad-tag--new">ჩართულია</span>' : '<span class="ad-tag ad-tag--muted">გამორთულია</span>'}</h3>
          <form class="ad-form" id="nyf">${opts.map(([k, l, h]) => sw(k, l, ny[k] !== false, h)).join('')}<button class="ad-btn ad-btn--accent" type="submit">შენახვა</button></form></section>
          <section class="ad-card"><h3>რჩევები</h3><ul class="ad-list" style="display:block;padding-left:18px;margin:0;line-height:1.8">
            <li>მუსიკა (საახალწლო მელოდიებიც) იმართება ცალკე: <a class="ad-link" href="#/music">მუსიკა</a>.</li>
            <li>ვისაც მოძრაობა გამორთული აქვს (prefers-reduced-motion), თოვლი და სანტა არ ჩანს.</li>
            <li>ქავერზე დაამატე საახალწლო სლაიდი: <a class="ad-link" href="#/hero">მთავარი გვერდის ქავერი</a> (ფოტო „საახალწლო“ უკვე არის).</li>
            <li>შობის მერე გამორთე ერთი ღილაკით — ყველაფერი ქრება.</li></ul></section></div>`,
      mount(el) {
        const f = $('#nyf', el); bindForm(f);
        f.addEventListener('submit', async (e) => { e.preventDefault(); try { await saveSettings({ newyear: collect(f) }); renderNav(); route(); } catch (x) { fail(x); } });
        $('[data-ny-all]', el).addEventListener('click', async (e) => {
          const on = e.target.closest('[data-ny-all]').dataset.nyAll === 'on';
          try { await saveSettings({ newyear: { enabled: on } }, on ? 'საახალწლო რეჟიმი ჩაირთო 🎄' : 'საახალწლო რეჟიმი გამოირთო'); renderNav(); route(); } catch (x) { fail(x); }
        });
      },
    };
  };

  /* ---------- settings ---------- */
  const CITIES = [['ბათუმი', 41.6168, 41.6367], ['თბილისი', 41.7151, 44.8271], ['ქუთაისი', 42.2679, 42.6946], ['რუსთავი', 41.5495, 44.9934], ['ზუგდიდი', 42.5088, 41.8709], ['ფოთი', 42.1462, 41.6719], ['ქობულეთი', 41.8214, 41.7792], ['გორი', 41.9842, 44.1158], ['თელავი', 41.9198, 45.4731], ['ზესტაფონი', 42.1100, 43.0322]];
  V.settings = () => {
    const s = D().settings, c = s.contact || {}, sh = s.shop || {}, n = s.numbers || {}, h = s.home || {}, w = s.weather || {}, cb = s.cashback || {};
    const libra = D().libra;
    const mapQ = (c.map_coords || '').trim() || c.map_query || T(c.address);
    return {
      title: 'საიტის პარამეტრები', actions: `<button class="ad-btn ad-btn--accent" type="submit" form="f">შენახვა</button>`,
      html: `<form id="f" class="ad-edit" novalidate><div class="ad-edit__main">
          <section class="ad-card"><h3>საიტი</h3><div class="ad-row2">${field('site.name', 'მაღაზიის სახელი', s.site?.name)}<div></div></div>${trField('site.tagline', 'სლოგანი', s.site?.tagline)}
            <span class="ad-field"><span>ლოგო <small>(ცარიელი = ფერადი ასოებით)</small></span></span>${imageField('site.logo', s.site?.logo, 'SVG ან გამჭვირვალე PNG/WebP, ჰორიზონტალური')}</section>
          <section class="ad-card"><h3>კონტაქტი</h3><div class="ad-row3">${field('contact.phone', 'ტელეფონი', c.phone, { hint: libra ? 'ცარიელი = Libra-ს ტელეფონი' : '' })}${field('contact.whatsapp', 'WhatsApp', c.whatsapp, { ph: '995599000000' })}${field('contact.email', 'ელ-ფოსტა', c.email, { type: 'email' })}</div>
            ${trField('contact.address', 'მისამართი', c.address)}${trField('contact.hours', 'სამუშაო საათები', c.hours, { hint: libra ? 'ცარიელი = Libra-ს სამუშაო საათები' : '' })}
            <div class="ad-row2">${field('contact.map_query', 'Google Maps — მისამართი რუკისთვის', c.map_query, { ph: 'Melikishvili 2nd Lane 1, Batumi, Georgia' })}${field('contact.map_coords', 'ან ზუსტი კოორდინატები (lat,lng)', c.map_coords, { ph: '41.6461,41.6345', hint: 'Google Maps-ში დააჭირე მარჯვენა ღილაკით პინს → პირველი ხაზი (კოორდინატები) დააკოპირე' })}</div>
            <div class="ad-map-prev"><iframe src="https://maps.google.com/maps?q=${encodeURIComponent(mapQ)}&z=16&output=embed" loading="lazy" title="map"></iframe><a class="ad-btn ad-btn--sm" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQ)}" target="_blank" rel="noopener">${icon('arrow-up-right')} Google Maps</a></div>
            <div class="ad-row3">${field('contact.facebook', 'Facebook', c.facebook, { ph: 'https://facebook.com/…' })}${field('contact.instagram', 'Instagram', c.instagram, { ph: 'https://instagram.com/…' })}${field('contact.tiktok', 'TikTok', c.tiktok, { ph: 'https://tiktok.com/@…' })}</div></section>
          ${libra ? `<section class="ad-card"><h3>შეკვეთა, მიწოდება და გადახდა ${libraTag}</h3><p class="ad-hint" style="margin:-6px 0 12px">ეს პარამეტრები მოდის LIBRA FINANCE-დან (Libra → ონლაინ მაღაზია → პარამეტრები) — შეკვეთის ჯამი Supabase-ში მათით ითვლება.</p>
            <dl class="ad-dl"><dt>კურიერი</dt><dd>${sh.courier ? 'კი · ' + money(sh.delivery_fee) + (sh.free_from ? ' · უფასო ' + money(sh.free_from) + '-დან' : '') : 'არა'}</dd><dt>მაღაზიიდან გატანა</dt><dd>${sh.pickup ? 'კი' : 'არა'}</dd>
              <dt>მინ. შეკვეთა</dt><dd>${sh.min_order ? money(sh.min_order) : '—'}</dd><dt>გადახდა</dt><dd>${[sh.pay_cash && 'ნაღდი', sh.pay_transfer && 'გადარიცხვა', sh.pay_card && 'ბარათი'].filter(Boolean).join(' · ')}</dd>
              <dt>რეკვიზიტები</dt><dd>${esc(sh.bank_details) || '—'}</dd><dt>სტუმრის შეკვეთა</dt><dd>${sh.guest_orders ? '<span style="color:#16A34A">ჩართულია ✓</span>' : '<span style="color:#DC2626">გამორთულია</span> — ჩართე Libra-ში: „შეკვეთა ანგარიშის გარეშეც“'}</dd></dl></section>`
          : `<section class="ad-card"><h3>შეკვეთა და მიწოდება</h3><div class="ad-row2">${field('shop.delivery_fee', 'მიწოდების ფასი (₾)', sh.delivery_fee, { type: 'number', attrs: ' step="0.01" min="0"' })}${field('shop.free_from', 'უფასო მიწოდება (₾-დან)', sh.free_from, { type: 'number', attrs: ' step="0.01" min="0"', hint: '0 = ყოველთვის ფასიანი' })}</div>
            <div class="ad-row2"><div>${sw('shop.courier', 'კურიერით მიწოდება', sh.courier !== false)}${sw('shop.pickup', 'მაღაზიიდან გატანა', sh.pickup)}</div><div>${sw('shop.pay_cash', 'ნაღდი მიღებისას', sh.pay_cash)}${sw('shop.pay_transfer', 'საბანკო გადარიცხვა', sh.pay_transfer)}${sw('shop.pay_card', 'ბარათით მიღებისას', sh.pay_card)}</div></div>
            ${field('shop.bank_details', 'საბანკო რეკვიზიტები (ჩანს გადარიცხვის არჩევისას)', sh.bank_details, { type: 'textarea', rows: 3, ph: 'GE00TB0000000000000000 · შპს ვივაჩე' })}</section>`}
          <section class="ad-card"><h3>ქეშბექ ბარათის სექცია</h3>${sw('cashback.enabled', 'მთავარ გვერდზე ჩვენება', cb.enabled !== false)}
            ${trField('cashback.eyebrow', 'ზედა წარწერა', cb.eyebrow)}${trField('cashback.title', 'სათაური', cb.title)}${trField('cashback.lead', 'ტექსტი', cb.lead, { type: 'text' })}${trField('cashback.btn', 'ღილაკი', cb.btn)}
            <span class="ad-field"><span>ბარათის ფოტო</span></span>${imageField('cashback.image', cb.image)}</section>
        </div><aside class="ad-edit__side">
          <section class="ad-card"><h3>მთავარი გვერდი და მენიუ</h3><p class="ad-hint" style="margin:0">სექციების რიგი, ჩართვა და ტექსტები — <a class="ad-link" href="#/sections">სექციები</a><br>ზედა მენიუ — <a class="ad-link" href="#/menu">მთავარი მენიუ</a><br>მუსიკა — <a class="ad-link" href="#/music">მუსიკა</a></p></section>
          <section class="ad-card"><h3>🖼 პროდუქტის ბარათის ჩარჩო</h3>
            ${select('cards.frame', 'ჩარჩოს ფერი', [['auto', 'ავტომატური — მოძრავი ზოლის ფერებით'], ['rainbow', 'ფერადი (ცისარტყელა)'], ['pink', 'ვარდისფერი'], ['ocean', 'ლურჯი'], ['sun', 'მზისფერი'], ['mint', 'მწვანე'], ['dark', 'მუქი'], ['custom', 'ჩემი ფერი ↓']], (s.cards || {}).frame || 'auto')}
            ${field('cards.color', 'ჩემი ფერი', (s.cards || {}).color || '#FF3D7F', { type: 'color' })}
            <p class="ad-hint" style="margin:0">„ავტომატური“: როცა <a class="ad-link" href="#/band">მოძრავ ზოლს</a> შეუცვლი სტილს (შავი პარასკევი, ფასდაკლება, სიახლე…), ჩარჩოც იმავე ფერებს იღებს.</p></section>
          <section class="ad-card"><h3>☀️ ამინდის ვიჯეტი</h3>${sw('weather.enabled', 'ჰედერში ჩვენება', w.enabled !== false)}${sw('weather.auto', 'სტუმრის ქალაქის ამინდი', w.auto !== false, 'ავტომატურად ადგენს, საიდან შემოვიდა სტუმარი (ქვეყანა / ქალაქი). ვერ დადგინდა → ქვემოთ არჩეული ქალაქი')}
            <label class="ad-field"><span>ქალაქი (სტანდარტული)</span><select data-city data-ignore>${CITIES.map(([nm, la, lo]) => `<option value="${nm}|${la}|${lo}"${w.city === nm ? ' selected' : ''}>${nm}</option>`).join('')}</select></label>
            <input type="hidden" name="weather.city" value="${esc(w.city || 'ბათუმი')}"><input type="hidden" name="weather.lat" value="${w.lat ?? 41.6168}"><input type="hidden" name="weather.lon" value="${w.lon ?? 41.6367}">
            <p class="ad-hint">პროგნოზი: Open-Meteo (უფასო, გასაღების გარეშე).</p></section>
          <section class="ad-card"><h3>რიცხვები</h3><p class="ad-hint" style="margin:-8px 0 12px">ცარიელი = ავტომატურად ითვლება</p><div class="ad-row2">${field('numbers.products', 'პროდუქტი', n.products, { type: 'number' })}${field('numbers.brands', 'ბრენდი', n.brands, { type: 'number' })}${field('numbers.years', 'წელი ბაზარზე', n.years, { type: 'number' })}${field('numbers.stores', 'მაღაზია', n.stores, { type: 'number' })}</div></section>
          <section class="ad-card" data-ignore><h3>ბექაპი</h3><p class="ad-hint" style="margin:-8px 0 12px">საიტის კონტენტი (ქავერი, ზოლი, სიახლეები, გვერდები, პარამეტრები, კატეგორიების იერსახე, პროდუქტების დამატებები) ერთ JSON ფაილად.${libra ? ' პროდუქცია და შეკვეთები LIBRA-შია.' : ''}</p>
            <div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="ad-btn ad-btn--sm" data-export>${icon('download')} ჩამოტვირთვა</button><label class="ad-btn ad-btn--sm">${icon('upload')} აღდგენა<input type="file" accept="application/json" data-import hidden></label></div></section>
        </aside></form>`,
      mount(el) {
        const f = $('#f', el); bindForm(f);
        $('[data-city]', el).addEventListener('change', (e) => {
          const [nm, la, lo] = e.target.value.split('|');
          f.elements.namedItem('weather.city').value = nm; f.elements.namedItem('weather.lat').value = la; f.elements.namedItem('weather.lon').value = lo; dirty();
        });
        f.addEventListener('submit', async (e) => {
          e.preventDefault(); const x = collect(f);
          if (x.shop) ['delivery_fee', 'free_from'].forEach((k) => { x.shop[k] = +x.shop[k] || 0; });
          x.weather.lat = +x.weather.lat; x.weather.lon = +x.weather.lon;
          try { await saveSettings(x); route(); } catch (err) { fail(err); }
        });
        $('[data-export]', el).addEventListener('click', async () => {
          try {
            const data = await api('GET', 'export');
            const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
            a.download = 'vivache-backup-' + new Date().toISOString().slice(0, 10) + '.json'; a.click();
          } catch (x) { fail(x); }
        });
        $('[data-import]', el).addEventListener('change', async (e) => {
          const file = e.target.files[0]; if (!file) return;
          if (!(await confirmBox('ახლანდელი კონტენტი ჩანაცვლდება ფაილიდან.', 'აღდგენა'))) return;
          try { await api('POST', 'import', JSON.parse(await file.text())); await reload(); toast('აღდგენილია'); route(); } catch (x) { fail(x); }
        });
      },
    };
  };

  function notFound() { return { title: 'ვერ მოიძებნა', html: `<div class="ad-empty">${icon('search', '')}<p>ჩანაწერი ვერ მოიძებნა. <a class="ad-link" href="#/">მთავარზე →</a></p></div>` }; }

  /* ============================== shell & router ============================== */
  const NAV = [
    ['', 'app', 'მთავარი', '#FFFFFF'],
    ['orders', 'cart', 'შეკვეთები', '#FF3D7F', 'orders'],
    '— კატალოგი',
    ['products', 'box', 'პროდუქცია', '#2F6BFF'],
    ['categories', 'menu', 'კატეგორიები', '#FFB020'],
    ['brands', 'star', 'ბრენდები', '#22C55E'],
    '— მთავარი გვერდი',
    ['hero', 'image', 'მთავარი გვერდის ქავერი', '#8B5CF6'],
    ['sections', 'app', 'სექციები (რიგი, ტექსტები)', '#FFB020'],
    ['band', 'swatch', 'მთავარი გვერდის ზოლი', '#14B8A6'],
    ['promo', 'zap', 'აქციები · შავი პარასკევი', '#FFD400', 'bf'],
    ['newyear', 'tree', 'საახალწლო რეჟიმი', '#22C55E', 'ny'],
    '— კონტენტი',
    ['news', 'info', 'სიახლეები', '#F97316'],
    ['pages', 'file', 'გვერდები', '#FF3D7F'],
    '— საიტი',
    ['menu', 'menu', 'მთავარი მენიუ', '#2F6BFF'],
    ['music', 'music', 'მუსიკა', '#FF3D7F'],
    ['settings', 'gear', 'პარამეტრები', '#FFFFFF'],
  ];
  function renderNav() {
    const cur = location.hash.replace(/^#\/?/, '').split('?')[0];
    $('#ad-nav').innerHTML = NAV.map((n) => {
      if (typeof n === 'string') return `<div class="ad-nav__sep">${n.slice(2)}</div>`;
      const [path, ic, label, color, badge] = n;
      const on = path === '' ? cur === '' : cur === path || cur.startsWith(path + '/') || (path === 'hero' && cur.startsWith('hero'));
      let b = '';
      if (badge === 'orders') { const k = (D().orders?.recent || []).filter((o) => o.status === 'new').length; if (k) b = `<em class="ad-badge">${k}</em>`; }
      if (badge === 'ny' && D().settings.newyear?.enabled) b = '<em class="ad-badge ad-badge--ny">ON</em>';
      if (badge === 'bf' && D().settings.promo?.enabled && D().settings.promo?.style === 'blackfriday') b = '<em class="ad-badge ad-badge--bf">ON</em>';
      return `<a href="#/${path}" class="${on ? 'is-on' : ''}" style="--c:${color}">${icon(ic)}<span>${label}</span>${b}</a>`;
    }).join('');
  }
  const updateBadges = renderNav;

  function shell() {
    $('#app').innerHTML = `<div class="ad"><aside class="ad-side" id="ad-side">
        <a class="ad-logo" href="#/"><img class="ad-logo__img" src="/assets/img/brand/logo.webp" alt="VIVACHE"><span>მართვა</span></a>
        <nav class="ad-nav" id="ad-nav"></nav>
        <div class="ad-author"><small>პროექტის ავტორი</small><b>ლაშა დიასამიძე</b></div>
        <div class="ad-side__foot"><a href="/" target="_blank" rel="noopener">${icon('arrow-up-right')}<span>საიტის ნახვა</span></a><button type="button" data-logout>${icon('logout')}<span>გასვლა</span></button></div></aside>
      <div class="ad-main"><header class="ad-top"><button type="button" class="ad-burger" aria-label="მენიუ" data-side>${icon('menu', '')}</button>
          <div class="ad-top__title"><div class="ad-crumbs" id="ad-crumbs"></div><h1 id="ad-title"></h1></div><div class="ad-top__actions" id="ad-actions"></div>
          <div class="ad-me"><span class="ad-me__av">V</span></div></header>
        <main class="ad-content" id="ad-content"></main></div></div>`;
    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-side]')) $('#ad-side').classList.toggle('is-open');
      else if (e.target.closest('.ad-nav a')) $('#ad-side').classList.remove('is-open');
      if (e.target.closest('[data-logout]')) logout();
    });
  }

  const ROUTES = [
    [/^$/, V.dashboard], [/^orders$/, V.orders], [/^orders\/(.+)$/, V.order],
    [/^products$/, V.products], [/^products\/(.+)$/, V.product],
    [/^categories$/, V.categories], [/^categories\/(.+)$/, V.category],
    [/^brands$/, V.brands], [/^brands\/(.+)$/, V.brand],
    [/^hero$/, V.heroList], [/^hero\/(.+)$/, V.hero], [/^band$/, V.band], [/^promo$/, V.promo], [/^newyear$/, V.newyear],
    [/^news$/, V.newsList], [/^news\/(.+)$/, V.news], [/^pages$/, V.pagesList], [/^pages\/(.+)$/, V.page], [/^settings$/, V.settings],
    [/^menu$/, V.menu], [/^sections$/, V.sections], [/^music$/, V.music],
  ];
  let routing = 0;
  async function route(keepFocus) {
    const raw = location.hash.replace(/^#\/?/, '');
    const [path, qs] = raw.split('?');
    const r = ROUTES.find(([re]) => re.test(path));
    const n = ++routing;
    const focusSel = keepFocus && document.activeElement && document.activeElement.matches('input[type=search]') ? '[' + [...document.activeElement.attributes].find((a) => a.name.startsWith('data-'))?.name + ']' : null;
    try {
      const view = r ? await r[1](decodeURIComponent((path.match(r[0]) || [])[1] || ''), new URLSearchParams(qs || '')) : notFound();
      if (n !== routing) return;
      $('#ad-title').textContent = view.title || '';
      $('#ad-crumbs').innerHTML = view.crumbs || '';
      $('#ad-actions').innerHTML = view.actions || '';
      const c = $('#ad-content'); const fresh = c.cloneNode(false); c.replaceWith(fresh);
      fresh.innerHTML = view.html || '';
      if (view.mount) view.mount(fresh);
      document.title = (view.title || 'მართვა') + ' · VIVACHE';
      renderNav(); A.dirty = false; A.lastHash = location.hash;
      if (focusSel) { const i = $(focusSel); if (i) { i.focus(); const v = i.value; i.value = ''; i.value = v; } }
      else if (!keepFocus) window.scrollTo(0, 0);
    } catch (e) { fail(e); }
  }
  window.addEventListener('hashchange', () => {
    if (A.dirty && location.hash !== A.lastHash && !confirm('შეუნახავი ცვლილებები დაიკარგება. გავაგრძელო?')) { history.replaceState(null, '', A.lastHash || '#/'); return; }
    route();
  });
  window.addEventListener('beforeunload', (e) => { if (A.dirty) { e.preventDefault(); e.returnValue = ''; } });

  async function reload() { A.data = await api('GET', 'data'); }

  /* ---------------- login ---------------- */
  function loginView(msg) {
    $('#app').innerHTML = `<div class="ad-login"><div class="ad-login__art" aria-hidden="true">${[...COLORS, ...COLORS].map((c, i) => `<i style="--c:${c};--i:${i}"></i>`).join('')}</div>
      <form class="ad-login__card" id="login"><div class="ad-logo"><img class="ad-logo__img" src="/assets/img/brand/logo.webp" alt="VIVACHE"></div><h1>მართვის პანელი</h1>
        ${msg ? `<div class="ad-flash ad-flash--err">${esc(msg)}</div>` : ''}
        <label class="ad-field"><span>პაროლი</span><input type="password" name="password" required autocomplete="current-password" autofocus></label>
        <label class="ad-check"><input type="checkbox" name="remember"> <span>დამიმახსოვრე 30 დღით</span></label>
        <button class="ad-btn ad-btn--accent ad-btn--wide" type="submit">შესვლა</button>
        <small class="ad-hint" style="text-align:center">პაროლი იწერება Netlify-ში: Site configuration → Environment variables → <code>ADMIN_PASSWORD</code></small></form></div>`;
    $('#login').addEventListener('submit', async (e) => {
      e.preventDefault(); const b = e.submitter || $('#login button'); b.disabled = true;
      try {
        const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password: e.target.elements.namedItem("password").value, remember: e.target.elements.namedItem("remember").checked }) });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.error || 'შეცდომა ' + r.status);
        A.token = j.token; localStorage.setItem('vv_admin', A.token); start();
      } catch (x) { loginView(x.message); }
    });
  }
  function logout(expired) { A.token = ''; localStorage.removeItem('vv_admin'); A.data = null; loginView(expired ? 'სესია ამოიწურა — შედი თავიდან' : ''); }

  async function start() {
    if (!A.token) return loginView();
    try { await reload(); } catch (e) { if (A.token) loginView(e.message); return; }
    shell(); route();
  }
  if (document.readyState === 'complete') start(); else window.addEventListener('DOMContentLoaded', start);
})();
