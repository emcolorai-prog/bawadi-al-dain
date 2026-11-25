// Builds the website: the Bawadi Al Dain page (index.html) and the Arrahma page (arrahma/index.html).
//
//   node tools/build-site.cjs
//
// Reads   tools/source/bawadi.html, tools/source/arrahma.html   (all texts, translations, forms and media lists)
// Writes  index.html                    (Bawadi Al Dain; design code in tools/bawadi-design.js, assets/css/bawadi.css, assets/js/bawadi.js)
//         arrahma/index.html            (Arrahma; built by tools/build-arrahma.cjs, assets/css/arrahma.css, assets/js/arrahma.js)
//         assets/data/site-kb.json, assets/js/assistant-kb.js   (what the AI assistant knows)
// To change any text, edit it in tools/source/ (all languages are there), then run this script again.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const root = path.resolve(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const write = (f, s) => { fs.mkdirSync(path.dirname(path.join(root, f)), { recursive: true }); fs.writeFileSync(path.join(root, f), s); };
// Version stamp from the contents of the CSS and JS files: a changed file gets a new address, so browsers never mix old and new
const V = require('crypto').createHash('md5').update(['assets/css/bawadi.css','assets/css/arrahma.css','assets/css/base.css','assets/css/corporate.css','assets/css/wheel.css','assets/css/assistant.css','assets/js/bawadi.js','assets/js/arrahma.js','assets/js/assistant.js','assets/js/i18n.js','assets/js/site.js','assets/js/wheel.js'].map(function (f) { try { return require('fs').readFileSync(require('path').join(__dirname, '..', f)); } catch (e) { return ''; } }).join('')).digest('hex').slice(0, 10);
const design = require('./bawadi-design.cjs');

const img = (cls, src, w, h, extra) => `<img class="${cls}" src="${src}" alt="" width="${w}" height="${h}"${extra || ''}>`;
const DESIGN = {
  fonts: 'family=Montserrat:ital,wght@0,600;0,700;0,800;0,900;1,800;1,900&family=Nunito+Sans:wght@400;600;700&family=JetBrains+Mono:wght@500;700&family=Sacramento&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Aref+Ruqaa:wght@400;700',
  hero: [img('hx hx1', 'assets/img/photos/cattle-pen.jpg', 1280, 960, ' fetchpriority="high"')]
};

// Clean photographs that take the place of each brochure cut-out, in page order.
// [main photo, second photo]; the main photo keeps the original description (alt) unless altKey is set.
const MEDIA = [
  { key: 'agriculture', a: ['assets/img/photos/seed-drill-tractor-1.jpg', 1080, 810], b: ['assets/img/brochure/peanuts.jpg', 784, 756] },
  { key: 'cattle-sheep', a: ['assets/img/photos/cattle-pen.jpg', 1280, 960], b: ['assets/media/bawadi/sheep-pens.jpg', 1175, 770] },
  { key: 'camels', a: ['assets/img/brochure/camels.jpg', 740, 900] },
  { key: 'gum-arabic', a: ['assets/img/photos/gum-arabic-basket.jpg', 1040, 780], b: ['assets/img/photos/gum-arabic-raw.jpg', 1280, 720] },
  { key: 'grains-oilseeds', a: ['assets/img/brochure/grains-oils.jpg', 720, 520], b: ['assets/img/brochure/sunflower-oil.jpg', 672, 536] },
  { key: 'meat', a: ['assets/img/brochure/meat-processing.jpg', 571, 900], b: ['assets/media/bawadi/meat-hall-1.jpg', 1280, 1280] },
  { key: 'factories', a: ['assets/img/brochure/oil-factory.jpg', 700, 445], b: ['assets/img/brochure/feed-factory.jpg', 560, 345] },
  { key: 'projects', a: ['assets/img/brochure/rubu-kordofan.jpg', 635, 415], b: ['assets/img/brochure/qarnaya.jpg', 645, 315] },
  { key: 'offer', a: ['assets/media/bawadi/warehouse-1.jpg', 1280, 960], b: ['assets/img/photos/hero-cattle-720.jpg', 720, 550], altKey: 'g.wh1', alt: 'Sacks stacked in the warehouse' }
];

function must(html, re, label) {
  if (!re.test(html)) { throw new Error('Pattern not found: ' + label); }
  return html;
}

// ---------- Bawadi page ----------
function buildBawadi(src) {
  const d = DESIGN;
  let h = src;

  // Stylesheets and fonts
  must(h, /<link href="https:\/\/fonts\.googleapis\.com\/css2\?[^"]*" rel="stylesheet">/, 'fonts');
  h = h.replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2\?[^"]*" rel="stylesheet">/,
    `<link href="https://fonts.googleapis.com/css2?${d.fonts}&display=swap" rel="stylesheet">`);
  h = h.replace(/<link rel="stylesheet" href="assets\/css\/brochure\.css[^"]*">\n?/, '');
  must(h, /<link rel="stylesheet" href="assets\/css\/spreads\.css[^"]*">/, 'spreads.css');
  h = h.replace(/<link rel="stylesheet" href="assets\/css\/spreads\.css[^"]*">\n?/, '');
  h = h.replace(/(<link rel="stylesheet" href="assets\/css\/wheel\.css[^"]*">)/,
    `$1\n<link rel="stylesheet" href="assets/css/bawadi.css?v=${V}">\n<link rel="stylesheet" href="assets/css/assistant.css?v=${V}">`);
  h = h.replace('<body class="company bawadi spreads">', '<body class="company bawadi d3">');

  // Hero: clean photographs instead of the brochure collage
  const heroRe = /<div class="bw-cover-art" aria-hidden="true">[\s\S]*?<\/picture>\s*<\/div>/;
  must(h, heroRe, 'hero art');
  h = h.replace(heroRe, `<div class="bw-cover-art" aria-hidden="true">\n        ${d.hero.join('\n        ')}\n      </div>`);

  // Brochure cut-outs -> clean photographs
  let i = 0;
  h = h.replace(/<figure class="bw-spread-img"( data-reveal)?>([\s\S]*?)<\/figure>/g, (m, reveal, inner) => {
    const md = MEDIA[i++];
    if (!md) { throw new Error('More brochure figures than replacements'); }
    const alt = (inner.match(/ alt="([^"]*)"/) || [])[1] || '';
    const altKey = (inner.match(/ data-i18n-alt="([^"]*)"/) || [])[1] || '';
    const useAlt = md.alt || alt, useKey = md.altKey || altKey;
    let out = `<figure class="bw-media${md.b ? ' bw-media-2' : ''}" data-media="${md.key}"${reveal || ''}>`;
    out += `<img class="m1" src="${md.a[0]}" alt="${useAlt}"${useKey ? ` data-i18n-alt="${useKey}"` : ''} width="${md.a[1]}" height="${md.a[2]}" loading="lazy" decoding="async">`;
    if (md.b) { out += `<img class="m2" src="${md.b[0]}" alt="" width="${md.b[1]}" height="${md.b[2]}" loading="lazy" decoding="async">`; }
    return out + '</figure>';
  });
  if (i !== MEDIA.length) { throw new Error('Expected ' + MEDIA.length + ' brochure figures, found ' + i); }

  // Assistant
  h = h.replace(/(<script src="assets\/js\/wheel\.js[^"]*"><\/script>)/,
    `$1\n<script src="assets/js/assistant-kb.js?v=${V}"></script>\n<script src="assets/js/assistant.js?v=${V}"></script>`);
  // The design's own page parts (hero wordmark, trade board, journey, AI terminal)
  h = design.bawadi(h, src, V);
  return h;
}

// ---------- Knowledge base for the assistant: every section's text, in English ----------
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const decode = (s) => s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e) => {
  if (e[0] === '#') { return String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)); }
  return e.toLowerCase() in ENT ? ENT[e.toLowerCase()] : m;
});
const clean = (s) => decode(s.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').replace(/\s+([.,;:])/g, '$1').trim();

function extract(html, page, company) {
  let main = (html.match(/<main[\s\S]*<\/footer>/) || [''])[0];
  main = main.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<svg[\s\S]*?<\/svg>/g, '')
    .replace(/<form[\s\S]*?<\/form>/g, '')
    .replace(/<img\b[^>]*?\salt="([^"]+)"[^>]*>/g, ' $1 ')
    .replace(/<div class="bw-wheel"[\s\S]*?(?=<div class="media-filter")/g, '')
    .replace(/<div class="media-filter"[\s\S]*?<\/div>/g, '');
  // Gallery captions become one short list
  main = main.replace(/<ul class="media-grid"[\s\S]*?<\/ul>/g, (m) => {
    const caps = [...new Set([...m.matchAll(/<p class="media-cap"[^>]*>([\s\S]*?)<\/p>/g)].map((x) => clean(x[1])))];
    const videos = (m.match(/data-type="video"/g) || []).length, photos = (m.match(/data-type="photo"/g) || []).length;
    return `<p>The gallery holds ${photos} photos and ${videos} videos. They show: ${caps.join('; ')}.</p>`;
  });
  const chunks = [];
  let section = 'top', cur = null, pending = '';   // pending: a small label printed above the next heading
  const push = () => { if (cur && cur.text.join(' ').trim().length > 20) { chunks.push({ page, company, section: cur.section, title: cur.title, text: cur.text.join('\n') }); } cur = null; };
  const start = (title) => { push(); cur = { section, title, text: [] }; };
  const label = () => { if (pending && cur) { cur.text.push('(' + pending + ')'); } pending = ''; };
  // Walk the block elements in order
  const re = /<(section|footer)\b([^>]*)>|<(h[1-4])\b[^>]*>([\s\S]*?)<\/\3>|<(p|li|figcaption)\b[^>]*>([\s\S]*?)<\/\5>|<div>\s*<dt\b[^>]*>([\s\S]*?)<\/dt>\s*<dd\b[^>]*>([\s\S]*?)<\/dd>\s*<\/div>|<div class="fact"><b[^>]*>([\s\S]*?)<\/b><span[^>]*>([\s\S]*?)<\/span><\/div>|<span class="(?:co|ar-co)"[^>]*>([\s\S]*?)<\/span>|<li><b[^>]*>([\s\S]*?)<\/b><span[^>]*>([\s\S]*?)<\/span><\/li>|<div[^>]*data-reveal[^>]*><dt[^>]*>([\s\S]*?)<\/dt><dd[^>]*>([\s\S]*?)<\/dd><\/div>/g;
  let m;
  while ((m = re.exec(main))) {
    if (m[1]) {
      push();
      section = m[1] === 'footer' ? 'footer' : ((m[2].match(/id="([^"]+)"/) || [])[1] || section);
      cur = { section, title: '', text: [] };
    } else if (m[3]) {
      const t = clean(m[4].replace(/<img[^>]*alt="([^"]*)"[^>]*>/g, '$1'));
      if (!t) { continue; }
      if (cur && !cur.title && !cur.text.length) { cur.title = t; } else if (m[3] === 'h4' && cur) { cur.text.push(t + ':'); } else { start(t); }
      label();
    } else if (m[5]) {
      const t = clean(m[6]);
      if (/^<p class="((bw|ar)-meta|eyebrow|ar-eyebrow|bw-label)\b/.test(m[0])) { pending = /^\d+$/.test(t) ? '' : t; continue; }
      if (t && cur) { cur.text.push(m[5] === 'li' ? '- ' + t : t); }
    } else if (m[7] !== undefined || m[14] !== undefined) {
      const k = clean(m[7] !== undefined ? m[7] : m[14]), v = clean((m[7] !== undefined ? m[8] : m[15]).replace(/<\/(span|a)>\s*<(span|a)/g, '</$1>, <$2'));
      if (cur) { cur.text.push('- ' + k + ': ' + v); }
    } else if (m[9] !== undefined) {
      if (cur) { cur.text.push('- ' + clean(m[9]) + ': ' + clean(m[10])); }
    } else if (m[11] !== undefined) {
      if (cur) { cur.text.push('Company: ' + clean(m[11])); }
    } else if (m[12] !== undefined) {
      if (cur) { cur.text.push('- ' + clean(m[12]) + ': ' + clean(m[13])); }
    }
  }
  push();
  return chunks;
}

// ---------- Run ----------
const bawadiSrc = read('tools/source/bawadi.html');
const arrahmaSrc = read('tools/source/arrahma.html');
write('index.html', buildBawadi(bawadiSrc));
console.log(execFileSync(process.execPath, [path.join(__dirname, 'build-arrahma.cjs'), path.join(root, 'tools/source/arrahma.html'), path.join(root, 'arrahma/index.html')]).toString().trim());

const kb = {
  generated: new Date().toISOString().slice(0, 10),
  pages: {
    bawadi: { name: 'Bawadi Al Dain General Trading L.L.C', url: 'https://bawadialdaingroup.com/' },
    arrahma: { name: 'Arrahma pour la Production Agricole et Animale – SARL', url: 'https://bawadialdaingroup.com/arrahma/' }
  },
  chunks: extract(bawadiSrc, 'bawadi', 'Bawadi Al Dain General Trading L.L.C').concat(extract(arrahmaSrc, 'arrahma', 'Arrahma pour la Production Agricole et Animale – SARL'))
};
write('assets/data/site-kb.json', JSON.stringify(kb, null, 1));
write('assets/js/assistant-kb.js', '// Generated by tools/build-site.js from tools/source/. Do not edit by hand.\nwindow.SITE_KB = ' + JSON.stringify(kb) + ';\n');
// Every local stylesheet and script gets the same content-based version, so browsers fetch the new files after each change
['index.html', 'arrahma/index.html'].forEach((f) => {
  write(f, read(f).replace(/((?:href|src)="(?:\.\.\/)?assets\/(?:css|js)\/[^"?]+\.(?:css|js))(?:\?v=[^"]*)?"/g, '$1?v=' + V + '"'));
});
console.log('Bawadi page written: index.html');
console.log('Knowledge base: ' + kb.chunks.length + ' passages, ' + kb.chunks.reduce((n, c) => n + c.text.length, 0) + ' characters');
