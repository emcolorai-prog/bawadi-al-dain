// Bawadi Al Dain page ("Canopy"): the page parts this design adds around the original content.
// Used by tools/build-designs.js. The live text is reused through its translation keys, so it stays
// in step with index.html; only short labels for the new parts are written here (English + Arabic,
// and French for the Arrahma page).

const vm = require('vm');

function i18nOf(html) {
  const a = html.search(/<script>\s*var /), b = html.indexOf('</script>', html.indexOf('window.I18N'));
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(html.slice(html.indexOf('>', a) + 1, b), ctx);
  return ctx.window.I18N || {};
}
function must(ok, label) { if (!ok) { throw new Error('Design 3: pattern not found: ' + label); } }
// The page's own (default-language) text for a translation key
function textOf(html, key) {
  const m = html.match(new RegExp('<(\\w+)[^>]*\\sdata-i18n="' + key.replace(/\./g, '\\.') + '"[^>]*>([\\s\\S]*?)</\\1>'));
  must(m, 'text for ' + key);
  return m[2];
}
const firstSentence = (s) => s.slice(0, s.indexOf('. ') + 1);
const middleSentence = (s) => s.slice(s.indexOf('. ') + 2, s.lastIndexOf('. ') + 1);
const js = (o) => JSON.stringify(o).replace(/</g, '\\u003c');
const img = (src, w, h, extra) => `<img src="${src}" alt="" width="${w}" height="${h}"${extra || ' loading="lazy" decoding="async"'}>`;
const leaf = '<i class="t3-sep" aria-hidden="true"></i>';

// =====================================================================================
// Bawadi Al Dain
// =====================================================================================
const B_NEW = {
  en: {
    'as.open': 'Ask Bawadi AI',
    't3.askph': 'Ask Bawadi AI — “Can you ship camels to Riyadh?”', 't3.askbtn': 'Ask AI',
    't3.m.sunflower': 'Sunflower', 't3.m.hibiscus': 'Hibiscus', 't3.m.baobab': 'Baobab', 't3.m.cattle': 'Cattle', 't3.m.sheep': 'Sheep',
    't3.desk.eyebrow': 'Dubai trade desk', 't3.desk.h': 'What moves <em>through Dubai</em>', 't3.desk.tap': 'Select any row to ask Bawadi AI.',
    't3.b.open': 'Desk open · enquiries welcome', 't3.b.c1': 'Commodity', 't3.b.c2': 'Origin', 't3.b.c3': 'Use', 't3.b.c4': 'Status',
    't3.o.sudan': 'Sudan', 't3.o.darfur': 'Darfur',
    't3.u1': 'Food · beverage · pharma', 't3.u2': 'Cleaned · sifted · sacked', 't3.u3': 'Food · animal feed', 't3.u4': 'Live · dest. vet rules',
    't3.u5': 'Oilseed · oil · peanut cake', 't3.u6': 'Oilseed',
    't3.s1': 'On enquiry', 't3.s2': 'Group range',
    't3.q.about': 'Tell me about {x}',
    't3.j.label': 'From soil to port', 't3.j.hint': 'Scroll to fly through', 't3.j.stage': 'Stage', 't3.j.nav': 'Stages',
    't3.j1h': 'Grow', 't3.j2h': 'Forest', 't3.j3h': 'Hull &amp; sort', 't3.j4h': 'Process', 't3.j5h': 'Herds', 't3.j6h': 'Meat', 't3.j7h': 'Dubai',
    't3.lines': 'Six lines, <em>one group</em>',
    't3.dubai': 'Dubai', 't3.erbil': 'Erbil', 't3.qingdao': 'Qingdao',
    't3.ai.eyebrow': 'Bawadi AI', 't3.ai.h': 'Ask. Draft. <em>Ship.</em>',
    't3.ai.p': 'Ask about products, capacity, livestock rules or certifications. Your trade enquiry drafts itself as you chat — then send it to the desk on WhatsApp or email.',
    't3.ai.bar': 'Bawadi AI · Trade terminal', 't3.ai.ph': 'Ask in English or عربي — e.g. 20 containers of sorghum to Jeddah', 't3.ai.ask': 'Ask',
    't3.ai.hello': 'Marhaba! I’m Bawadi AI. Ask about our gum arabic, sorghum, livestock, capacity or certifications — I’ll draft your enquiry for the Dubai trade desk.',
    't3.ai.c1': 'What do you trade?', 't3.ai.c2': 'Can you ship camels to Riyadh?', 't3.ai.c3': 'Price for 500 MT gum arabic CIF Hamburg', 't3.ai.c4': 'What is your oil capacity?',
    't3.ai.c5': 'ما هي منتجاتكم؟',
    't3.d.title': 'Draft trade enquiry · Bawadi Al Dain · Dubai', 't3.d.product': 'Product', 't3.d.qty': 'Quantity', 't3.d.dest': 'Destination', 't3.d.stamp': 'Draft',
    't3.d.wa': 'Send on WhatsApp', 't3.d.mail': 'Email us', 't3.d.foot': 'Draft builds as you chat',
    't3.d.intro': 'Enquiry via website', 't3.d.live': 'Livestock'
  },
  ar: {
    'as.open': 'اسأل مساعد بوادي',
    't3.askph': 'اسأل مساعد بوادي — «هل تشحنون الإبل إلى الرياض؟»', 't3.askbtn': 'اسأل',
    't3.m.sunflower': 'زهرة الشمس', 't3.m.hibiscus': 'الكركدي', 't3.m.baobab': 'التبلدي', 't3.m.cattle': 'الأبقار', 't3.m.sheep': 'الأغنام',
    't3.desk.eyebrow': 'مكتب التجارة في دبي', 't3.desk.h': 'ما يمرّ <em>عبر دبي</em>', 't3.desk.tap': 'اختر أي صف لتسأل مساعد بوادي.',
    't3.b.open': 'المكتب مفتوح · نرحّب بالاستفسارات', 't3.b.c1': 'السلعة', 't3.b.c2': 'المنشأ', 't3.b.c3': 'الاستخدام', 't3.b.c4': 'الحالة',
    't3.o.sudan': 'السودان', 't3.o.darfur': 'دارفور',
    't3.u1': 'أغذية · مشروبات · أدوية', 't3.u2': 'منظّف · منخول · معبّأ', 't3.u3': 'غذاء · علف حيواني', 't3.u4': 'حيّة · وفق اشتراطات الوجهة',
    't3.u5': 'بذور زيتية · زيت · أمباز', 't3.u6': 'بذور زيتية',
    't3.s1': 'عند الطلب', 't3.s2': 'ضمن منتجات المجموعة',
    't3.q.about': 'أخبرني عن {x}',
    't3.j.label': 'من التربة إلى الميناء', 't3.j.hint': 'مرّر للتنقّل بين المراحل', 't3.j.stage': 'المرحلة', 't3.j.nav': 'المراحل',
    't3.j1h': 'الزراعة', 't3.j2h': 'الغابات', 't3.j3h': 'التقشير والفرز', 't3.j4h': 'التصنيع', 't3.j5h': 'القطعان', 't3.j6h': 'اللحوم', 't3.j7h': 'دبي',
    't3.lines': 'ستة خطوط، <em>مجموعة واحدة</em>',
    't3.dubai': 'دبي', 't3.erbil': 'أربيل', 't3.qingdao': 'تشينغداو',
    't3.ai.eyebrow': 'مساعد بوادي', 't3.ai.h': 'اسأل. جهّز. <em>اشحن.</em>',
    't3.ai.p': 'اسأل عن المنتجات والطاقة الإنتاجية واشتراطات الماشية والشهادات. تُصاغ مسودة استفسارك التجاري أثناء المحادثة، ثم أرسلها إلى المكتب عبر واتساب أو البريد الإلكتروني.',
    't3.ai.bar': 'مساعد بوادي · منصّة التجارة', 't3.ai.ph': 'اسأل بالعربية أو English — مثال: 20 حاوية ذرة رفيعة إلى جدة', 't3.ai.ask': 'اسأل',
    't3.ai.hello': 'مرحبًا! أنا مساعد بوادي. اسأل عن الصمغ العربي أو الذرة الرفيعة أو الماشية أو الطاقة الإنتاجية أو الشهادات، وسأجهّز مسودة استفسارك لمكتب التجارة في دبي.',
    't3.ai.c1': 'ما هي منتجاتكم؟', 't3.ai.c2': 'هل تشحنون الإبل إلى الرياض؟', 't3.ai.c3': 'سعر 500 طن صمغ عربي CIF هامبورغ', 't3.ai.c4': 'ما طاقة مصنع الزيوت؟',
    't3.ai.c5': 'What do you trade?',
    't3.d.title': 'مسودة استفسار تجاري · بوادي الضعين · دبي', 't3.d.product': 'المنتج', 't3.d.qty': 'الكمية', 't3.d.dest': 'الوجهة', 't3.d.stamp': 'مسودة',
    't3.d.wa': 'أرسل عبر واتساب', 't3.d.mail': 'راسلنا بالبريد', 't3.d.foot': 'تُبنى المسودة أثناء المحادثة',
    't3.d.intro': 'استفسار عبر الموقع', 't3.d.live': 'الماشية'
  }
};

// The trade board: [commodity key, origin key, use key, status key]
const BOARD = [
  ['p1', 't3.o.sudan', 't3.u1', 't3.s1'], ['p2', 't3.o.sudan', 't3.u2', 't3.s1'], ['p3', 't3.o.sudan', 't3.u3', 't3.s1'],
  ['t3.m.cattle', 't3.o.sudan', 't3.u4', 't3.s1'], ['t3.m.sheep', 't3.o.sudan', 't3.u4', 't3.s1'], ['ln.2h', 't3.o.sudan', 't3.u4', 't3.s1'],
  ['cr.1b', 't3.o.darfur', 't3.u5', 't3.s2'], ['cr.5b', 't3.o.sudan', 't3.u6', 't3.s2']
];
// The journey: [title key, text key, [fact keys], photo, width, height]
const JOURNEY = [
  ['t3.j1h', 'ln.6p', ['sd.f4b', 'sd.f1b'], 'assets/img/photos/seed-drill-tractor-1.jpg', 1080, 810],
  ['t3.j2h', 't3.j2p', ['p1', 'p2'], 'assets/img/photos/gum-arabic-basket.jpg', 1040, 780],
  ['t3.j3h', 't3.j3p', ['fc.3b', 'fc.4b'], 'assets/media/bawadi/processing-line.jpg', 1280, 960],
  ['t3.j4h', 't3.j4p', ['fc.1ab', 'fc.1cb'], 'assets/img/brochure/oil-factory.jpg', 700, 445],
  ['t3.j5h', 'ln.1p2', ['ln.1h', 'ln.2h'], 'assets/img/photos/cattle-pen.jpg', 1280, 960],
  ['t3.j6h', 'ln.3p2', ['fc.6b'], 'assets/media/bawadi/meat-hall-1.jpg', 1280, 1280],
  ['t3.j7h', 'about.p2', ['c.3'], 'assets/img/brochure/dubai-port.jpg', 719, 830]
];
const MARQUEE = ['cr.5b', 't3.m.sunflower', 't3.m.hibiscus', 't3.m.baobab', 'p1', 'p2', 'p3', 't3.m.cattle', 't3.m.sheep', 'ln.2h', 'cr.1b'];

function bawadi(h, src, V) {
  const dict = i18nOf(src);
  const ar = dict.ar || {};
  const add = { en: Object.assign({}, B_NEW.en), ar: Object.assign({}, B_NEW.ar) };
  // English text for any key: the new labels above, or the page's own text
  const en = (k) => (k in add.en ? add.en[k] : textOf(src, k));
  const t = (k) => `data-i18n="${k}">${en(k)}`;
  // Short journey texts: one sentence taken from a paragraph of the page, in both languages
  [['t3.j2p', 'ln.4p', firstSentence], ['t3.j3p', 'ln.5p2', middleSentence], ['t3.j4p', 'fc.1p', firstSentence]].forEach(([k, from, cut]) => {
    add.en[k] = cut(textOf(src, from));
    must(ar[from], 'Arabic for ' + from);
    add.ar[k] = cut(ar[from]);
    must(add.en[k].length > 20 && add.ar[k].length > 20, 'sentence for ' + k);
  });

  h = h.replace(/<meta name="theme-color" content="[^"]*">/, '<meta name="theme-color" content="#0A2314">');

  // ---- Header: the company switch moves into the header, beside the language switch ----
  must(/<nav class="group-bar"[\s\S]*?<\/nav>\s*/.test(h), 'group bar');
  h = h.replace(/<nav class="group-bar"[\s\S]*?<\/nav>\s*/, '');
  must(/(<a class="brand"[^>]*>)\s*(<img[^>]*>)\s*<\/a>/.test(h), 'brand');
  h = h.replace(/(<a class="brand"[^>]*>)\s*(<img[^>]*>)\s*<\/a>/,
    '$1<span class="t3-logo">$2</span><span class="brand-name" lang="en" dir="ltr"><b>Bawadi Al Dain</b><small>General Trading L.L.C</small></span></a>');
  must(h.includes('<div class="lang-switch"'), 'language switch');
  h = h.replace('<div class="lang-switch"',
    `<div class="co-switch" role="group" aria-label="Our companies" data-i18n-aria-label="ui.companies"><a href="./" data-keep-lang aria-current="page" lang="en" title="Bawadi Al Dain General Trading L.L.C">Bawadi</a><a href="arrahma/" data-keep-lang lang="fr" title="Arrahma pour la Production Agricole et Animale – SARL">Arrahma</a></div>\n    <div class="lang-switch"`);

  // ---- Hero ----
  const heroRe = /<section class="bw-cover"[\s\S]*?<\/section>/;
  const hero = (h.match(heroRe) || [''])[0];
  must(hero, 'hero');
  const house = (hero.match(/<p class="bw-house">[\s\S]*?<\/p>/) || [''])[0];
  const creds = (hero.match(/<ul class="bw-facts-line"[\s\S]*?<\/ul>/) || [''])[0];
  must(house && creds, 'hero parts');
  const items = MARQUEE.map((k) => `<span ${t(k)}</span>${leaf}`).join('');
  h = h.replace(heroRe, `<section class="bw-cover t3-hero" aria-labelledby="hero-title">
    <div class="t3-leaves" aria-hidden="true">
      <span class="t3-leaf l1">${img('assets/img/photos/gum-arabic-basket.jpg', 1040, 780, ' decoding="async"')}</span>
      <span class="t3-leaf l2">${img('assets/img/photos/cattle-pen.jpg', 1280, 960, ' decoding="async"')}</span>
      <span class="t3-leaf l3">${img('assets/img/brochure/camels.jpg', 740, 900, ' decoding="async"')}</span>
      <span class="t3-leaf l4">${img('assets/img/photos/sorghum-heads.jpg', 765, 1020, ' decoding="async"')}</span>
    </div>
    <div class="t3-hero-in">
      <h1 id="hero-title" class="t3-word" lang="en" dir="ltr"><span class="sr-only">Bawadi Al Dain General Trading L.L.C</span><span class="t3-word-fill" aria-hidden="true">BAWADI</span><span class="t3-word-sub" aria-hidden="true"><i></i><b>AL DAIN</b><i></i></span></h1>
      <p class="t3-place"><span ${t('hero.eyebrow')}</span></p>
      ${house}
      <p class="bw-cover-lede"><strong ${t('hero.head')}</strong> <span ${t('hero.lede')}</span></p>
      <div class="bw-actions">
        <a class="btn" href="#contact" ${t('band.cta')}</a>
        <a class="btn btn-ghost" href="#products" ${t('hero.cta1')}</a>
      </div>
      <form class="t3-ask" data-t3-ask novalidate>
        <span class="t3-spark" aria-hidden="true">✦</span>
        <input type="text" name="q" maxlength="300" autocomplete="off" placeholder="${add.en['t3.askph']}" data-i18n-placeholder="t3.askph" aria-label="${add.en['as.open']}" data-i18n-aria-label="as.open">
        <button type="submit" ${t('t3.askbtn')}</button>
      </form>
    </div>
    <div class="t3-marquee" aria-hidden="true"><div class="t3-marquee-track"><div>${items}</div><div>${items}</div></div></div>
    <div class="wrap">${creds.replace('class="bw-facts-line"', 'class="bw-facts-line t3-creds"')}</div>
  </section>`);

  // ---- Trade board and journey, between "About" and "Products" ----
  const rows = BOARD.map((r) => `<tr><th scope="row"><button type="button" data-t3-row ${t(r[0])}</button></th><td ${t(r[1])}</td><td ${t(r[2])}</td><td class="st${r[3] === 't3.s2' ? ' st2' : ''}" ${t(r[3])}</td></tr>`).join('\n          ');
  const stages = JOURNEY.map((s, i) => {
    const n = String(i + 1).padStart(2, '0');
    return `<li class="t3-j-item" data-i="${i}">
          <figure class="t3-j-img" aria-hidden="true"><span class="t3-j-num ltr">${n}</span><span class="t3-j-shape">${img(s[3], s[4], s[5])}</span></figure>
          <div class="t3-j-card">
            <p class="t3-j-stage"><span ${t('t3.j.stage')}</span> <span class="ltr">${n} / 0${JOURNEY.length}</span></p>
            <h3 ${t(s[0])}</h3>
            <p ${t(s[1])}</p>
            <ul class="t3-j-facts">${s[2].map((k) => `<li ${t(k)}</li>`).join('')}</ul>
          </div>
        </li>`;
  }).join('\n        ');
  const jnav = JOURNEY.map((s, i) => `<button type="button" data-go="${i}"><span class="ltr">${String(i + 1).padStart(2, '0')}</span><span ${t(s[0])}</span><i aria-hidden="true"></i></button>`).join('');
  must(h.includes('<section id="products"'), 'products section');
  h = h.replace('<section id="products"', `<section id="desk" class="section t3-desk" aria-labelledby="desk-title">
    <div class="wrap">
      <div class="t3-desk-head" data-reveal>
        <div>
          <p class="eyebrow" ${t('t3.desk.eyebrow')}</p>
          <h2 id="desk-title" ${t('t3.desk.h')}</h2>
        </div>
        <p><span ${t('prod.p')}</span> <span ${t('t3.desk.tap')}</span></p>
      </div>
      <div class="t3-board" data-t3-board data-reveal>
        <div class="t3-board-top"><span><span class="ltr" lang="en">Bawadi Al Dain</span> · <span ${t('f.addr')}</span></span><span class="t3-open"><i aria-hidden="true"></i><span ${t('t3.b.open')}</span></span></div>
        <table>
          <thead><tr><th scope="col" ${t('t3.b.c1')}</th><th scope="col" ${t('t3.b.c2')}</th><th scope="col" ${t('t3.b.c3')}</th><th scope="col" ${t('t3.b.c4')}</th></tr></thead>
          <tbody>
          ${rows}
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <section id="journey" class="t3-journey" aria-labelledby="journey-title" data-t3-journey>
    <div class="t3-j-track"><div class="t3-j-sticky">
      <h2 class="t3-j-top" id="journey-title"><span ${t('t3.j.label')}</span><i aria-hidden="true">·</i><span class="t3-j-hint" ${t('t3.j.hint')}</span></h2>
      <ol class="t3-j-list">
        ${stages}
      </ol>
      <nav class="t3-j-nav" aria-label="${add.en['t3.j.nav']}" data-i18n-aria-label="t3.j.nav">${jnav}</nav>
    </div></div>
    <p class="wrap t3-j-note" ${t('sd.note')}</p>
  </section>

  <section id="products"`);

  // ---- Products: the name in the other language under each card; a headline for the six lines ----
  let cards = 0;
  h = h.replace(/(<div class="bw-prod-body">[\s\S]*?<h3 data-i18n="(p\d)">([^<]*)<\/h3>[\s\S]*?<\/p>)(<\/div>)/g, (m, a, key, name, z) => {
    cards++;
    must(ar[key], 'Arabic for ' + key);
    return `${a}<p class="t3-alt" aria-hidden="true"><span lang="ar" dir="rtl">${ar[key]}</span><span lang="en" dir="ltr">${name}</span></p>${z}`;
  });
  must(cards === 4, 'four product cards');
  must(/<h3 class="bw-sub" data-i18n="ln\.h">[^<]*<\/h3>/.test(h), 'product lines heading');
  h = h.replace(/<h3 class="bw-sub" data-i18n="ln\.h">([^<]*)<\/h3>/,
    `<div class="t3-linehead" data-reveal><p class="eyebrow" data-i18n="ln.h">$1</p><h3 class="t3-big" ${t('t3.lines')}</h3></div>`);

  // ---- AI terminal, before the gallery ----
  const tel = (src.match(/<a href="tel:(\+971\d+)" class="ltr">([^<]+)<\/a>/) || []);
  const mail = (src.match(/data-mailto="([^"]+)"/) || [])[1];
  must(tel[1] && mail, 'phone and email');
  must(h.includes('<section id="gallery"'), 'gallery section');
  h = h.replace('<section id="gallery"', `<section id="ask" class="section t3-ai" aria-labelledby="ai-title">
    <div class="wrap t3-ai-grid">
      <div class="t3-term" data-t3-term data-wa="${tel[1].replace('+', '')}" data-mail="${mail}">
        <p class="t3-term-bar"><span ${t('t3.ai.bar')}</span><span class="ltr" aria-hidden="true">EN / <span lang="ar">عربي</span></span></p>
        <div class="t3-term-log" role="log" aria-live="polite" tabindex="0"><div class="t3-msg bot"><p ${t('t3.ai.hello')}</p></div></div>
        <div class="t3-term-chips">
          <button type="button" ${t('t3.ai.c1')}</button><button type="button" ${t('t3.ai.c2')}</button><button type="button" ${t('t3.ai.c3')}</button><button type="button" ${t('t3.ai.c4')}</button><button type="button" class="t3-chip-alt" ${t('t3.ai.c5')}</button>
        </div>
        <form class="t3-term-form" novalidate>
          <input type="text" name="q" maxlength="600" autocomplete="off" placeholder="${add.en['t3.ai.ph']}" data-i18n-placeholder="t3.ai.ph" aria-label="${add.en['as.open']}" data-i18n-aria-label="as.open">
          <button type="submit" ${t('t3.ai.ask')}</button>
        </form>
        <div class="t3-draft">
          <p class="t3-draft-title" ${t('t3.d.title')}</p>
          <span class="t3-stamp" aria-hidden="true" ${t('t3.d.stamp')}</span>
          <dl>
            <div><dt ${t('t3.d.product')}</dt><dd data-f="product">—</dd></div>
            <div><dt ${t('t3.d.qty')}</dt><dd data-f="qty">—</dd></div>
            <div><dt ${t('t3.d.dest')}</dt><dd data-f="dest">—</dd></div>
          </dl>
          <div class="t3-draft-actions">
            <a class="t3-wa" href="https://wa.me/${tel[1].replace('+', '')}" target="_blank" rel="noopener" ${t('t3.d.wa')}</a>
            <a class="t3-mail" href="mailto:${mail}" ${t('t3.d.mail')}</a>
          </div>
          <p class="t3-draft-foot"><span ${t('t3.d.foot')}</span> · <a href="tel:${tel[1]}" class="ltr">${tel[2]}</a> · <a href="mailto:${mail}" class="ltr">${mail}</a></p>
        </div>
      </div>
      <div class="t3-ai-copy" data-reveal>
        <p class="eyebrow" ${t('t3.ai.eyebrow')}</p>
        <h2 id="ai-title" ${t('t3.ai.h')}</h2>
        <p ${t('t3.ai.p')}</p>
        <p class="t3-small" ${t('prod.p')}</p>
      </div>
    </div>
  </section>

  <section id="gallery"`);

  // ---- Contact: email, phone and website share the first (lime) card ----
  const group = (k) => { const m = h.match(new RegExp('<div><dt data-i18n="' + k.replace('.', '\\.') + '">[\\s\\S]*?</dd></div>')); must(m, 'contact row ' + k); return m[0]; };
  const inner = (s) => s.replace(/^<div>/, '').replace(/<\/div>$/, '');
  const g1 = group('con.k2'), g2 = group('con.k3'), g3 = group('con.k8');
  h = h.replace(g2, '').replace(g3, '').replace(g1, `<div class="t3-lead">${inner(g1)}${inner(g2)}${inner(g3)}</div>`);

  // ---- Section headings whose last words are set in the accent colour ----
  [['about-title', 2], ['exp-title', 2, 1], ['mem-title', 2], ['prod-title', 1], ['offer-title', 1], ['gal-title', 1], ['contact-title', 1]].forEach(([id, n, nAr]) => {
    must(h.includes(`id="${id}"`), 'heading ' + id);
    h = h.replace(`id="${id}"`, `id="${id}" data-accent="${n}"${nAr ? ` data-accent-ar="${nAr}"` : ''}`);
  });
  // "Agriculture, oils and" in the script face, "livestock in Sudan" in capitals
  must(h.includes('id="sudan-title"'), 'heading sudan-title');
  h = h.replace('id="sudan-title"', 'id="sudan-title" data-script="3" data-script-ar="4"');

  // ---- Expansion: the points of the network drawing, named from the page's own words ----
  must(h.includes('<div class="bw-countries">'), 'countries');
  h = h.replace('<div class="bw-countries">', `<ul class="t3-net-names" hidden><li data-p="dubai" ${t('t3.dubai')}</li><li data-p="sudan" ${t('t3.o.sudan')}</li><li data-p="mauritania" ${t('ex.1h')}</li><li data-p="kenya" ${t('ex.2h')}</li><li data-p="somaliland" ${t('ex.3h')}</li><li data-p="erbil" ${t('t3.erbil')}</li><li data-p="qingdao" ${t('t3.qingdao')}</li></ul>
      <div class="bw-countries">`);

  // ---- Footer wordmark ----
  must(h.includes('<footer class="site-footer footer-light">'), 'footer');
  h = h.replace('<footer class="site-footer footer-light">', '<footer class="site-footer footer-light">\n  <div class="t3-footmark" aria-hidden="true" lang="en" dir="ltr"><div class="t3-fm-track"><span>BAWADI AL DAIN</span><i></i><span>BAWADI AL DAIN</span><i></i><span>BAWADI AL DAIN</span><i></i><span>BAWADI AL DAIN</span><i></i></div></div>');

  // ---- New labels (both languages) and this design's script ----
  must(/<script src="assets\/js\/i18n\.js[^"]*"><\/script>/.test(h), 'i18n.js');
  h = h.replace(/(<script src="assets\/js\/i18n\.js[^"]*"><\/script>)/,
    `<script>/* Labels for the parts added by design 3 */\n(function(){var I=window.I18N=window.I18N||{},A=${js(add)};Object.keys(A).forEach(function(l){I[l]=I[l]||{};Object.keys(A[l]).forEach(function(k){I[l][k]=A[l][k];});});})();\n</script>\n$1`);
  must(/<script src="assets\/js\/assistant\.js[^"]*"><\/script>/.test(h), 'assistant.js');
  h = h.replace(/(<script src="assets\/js\/assistant\.js[^"]*"><\/script>)/, `$1\n<script src="assets/js/bawadi.js?v=${V}"></script>`);
  return h;
}

module.exports = { bawadi };
