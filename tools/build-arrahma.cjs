// Builds the Arrahma page in its final design (the layout from the client's reference video).
//   node tools/build-arrahma.cjs <source arrahma page> <output file>
// The source page supplies every text, translation (window.I18N), form and media list; this file only
// lays them out and adds short labels for the new parts (English, Arabic, French).
const fs = require('fs');
const path = require('path');
const [srcFile, outFile] = process.argv.slice(2);
const src = fs.readFileSync(srcFile, 'utf8');
// Version stamp from the contents of the CSS and JS files: a changed file gets a new address, so browsers never mix old and new
const V = require('crypto').createHash('md5').update(['assets/css/bawadi.css','assets/css/arrahma.css','assets/css/base.css','assets/css/corporate.css','assets/css/wheel.css','assets/css/assistant.css','assets/js/bawadi.js','assets/js/arrahma.js','assets/js/assistant.js','assets/js/i18n.js','assets/js/site.js','assets/js/wheel.js'].map(function (f) { try { return require('fs').readFileSync(require('path').join(__dirname, '..', f)); } catch (e) { return ''; } }).join('')).digest('hex').slice(0, 10);
const must = (ok, label) => { if (!ok) { throw new Error('Arrahma build: not found: ' + label); } return ok; };
const grab = (re, label) => must((src.match(re) || [])[0], label);
const textOf = (key) => {
  const m = src.match(new RegExp('<(\\w+)[^>]*\\sdata-i18n="' + key.replace(/\./g, '\\.') + '"[^>]*>([\\s\\S]*?)</\\1>'));
  return must(m, 'text ' + key)[2];
};
const altOf = (key) => must((src.match(new RegExp('alt="([^"]*)" data-i18n-alt="' + key.replace(/\./g, '\\.') + '"')) || [])[1], 'alt ' + key);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const M = '../assets/media/arrahma/', P = '../assets/img/photos/';

// ---------- Labels for the new parts ----------
const NEW = {
  en: {
    'as.open': 'Ask Arrahma AI', 'x.group': 'The Bawadi Al Dain group', 'x.dubai': 'Dubai', 'x.mau': 'Mauritania',
    'x.nav.sites': 'Sites', 'x.nav.farm': 'The farm', 'x.nav.films': 'Aleg films', 'x.nav.contact': 'Contact', 'x.ask': 'Ask Arrahma AI',
    'x.sand': 'Move your cursor through the sand', 'x.scroll': 'Scroll', 'x.est': 'Established', 'x.first': 'First site, 2025', 'x.forage': 'Forage',
    'x.ground': 'From the ground up', 'x.crops': 'Crops',
    'x.country': 'Country', 'x.hq': 'Head office', 'x.established': 'Established', 'x.groupk': 'Group', 'x.since': 'Since 2023 · Nouakchott · ',
    'x.hover': 'Hover or tap each panel.',
    'x.ops.h': 'From the coast to <em>Hodh Ech Chargui</em>', 'x.ops.p': 'Scroll to travel west to east. Sites are placed by their real longitude.',
    'x.ops.reported': 'As reported by the company', 'x.atlantic': 'Atlantic', 'x.since25': 'Since 2025', 'x.planned': 'Second site · planned 2027',
    'x.choose': 'Choose how many of the planned sites to count.', 'x.site': 'Site', 'x.calves': 'calves', 'x.sheep': 'sheep', 'x.camels': 'camels',
    'x.dots': 'Each dot is 1,000 head. Per 120-day cycle, at each site’s design capacity.',
    'x.drag': 'Drag the film strip, choose a frame, then press play.', 'x.concept': 'Design concept', 'x.target': 'Target capacity',
    'x.cap1': '50 cattle', 'x.cap1u': 'an hour', 'x.cap2': '200 sheep', 'x.cap2u': 'an hour', 'x.cap3': '50 camels', 'x.cap3u': 'a day',
    'x.milestone': 'Milestone', 'x.of': 'of',
    'x.deck': 'Drag the top card away, or use the arrows.', 'x.prev': 'Previous', 'x.next': 'Next',
    'x.ai.eyebrow': 'Arrahma AI', 'x.ai.h': 'Ask us, in <em>three languages</em>',
    'x.ai.p': 'Livestock and forage, partnerships, site visits or general questions — in English, Arabic or French. Arrahma AI answers from company information and prepares your enquiry for the Nouakchott office.',
    'x.ai.hello': 'Marhaba — bienvenue! I’m Arrahma AI. Ask about our livestock and forage, the Aleg site, the Nouakchott slaughterhouse project, partnerships or site visits.',
    'x.ai.c1': 'What does Arrahma do?', 'x.ai.c2': 'Tell me about the Aleg site', 'x.ai.c3': 'Slaughterhouse capacity?', 'x.ai.c4': 'I want to partner with you',
    'x.ai.ph': 'Ask in English, عربي or Français — e.g. can I visit Aleg?', 'x.ai.ask': 'Ask',
    'x.d.interest': 'Interest', 'x.d.qty': 'Quantity / size', 'x.d.loc': 'Location', 'x.d.wa': 'Send on WhatsApp', 'x.d.mail': 'Email us', 'x.d.foot': 'Draft builds as you chat',
    'x.d.intro': 'Enquiry via the Arrahma website'
  },
  ar: {
    'as.open': 'اسأل مساعد الرحمة', 'x.group': 'مجموعة بوادي الضعين', 'x.dubai': 'دبي', 'x.mau': 'موريتانيا',
    'x.nav.sites': 'المواقع', 'x.nav.farm': 'المزرعة', 'x.nav.films': 'أفلام ألاك', 'x.nav.contact': 'تواصل', 'x.ask': 'اسأل مساعد الرحمة',
    'x.sand': 'حرّك المؤشر عبر الرمال', 'x.scroll': 'مرّر', 'x.est': 'سنة التأسيس', 'x.first': 'الموقع الأول، 2025', 'x.forage': 'أعلاف',
    'x.ground': 'من الأرض نبدأ', 'x.crops': 'المحاصيل',
    'x.country': 'الدولة', 'x.hq': 'المقر الرئيسي', 'x.established': 'سنة التأسيس', 'x.groupk': 'المجموعة', 'x.since': 'منذ 2023 · نواكشوط · ',
    'x.hover': 'مرّر المؤشر فوق كل لوحة أو المسها.',
    'x.ops.h': 'من الساحل إلى <em>الحوض الشرقي</em>', 'x.ops.p': 'مرّر للتنقل من الغرب إلى الشرق. المواقع موضوعة بحسب خطوط الطول الحقيقية.',
    'x.ops.reported': 'بحسب ما أفادت به الشركة', 'x.atlantic': 'الأطلسي', 'x.since25': 'منذ 2025', 'x.planned': 'الموقع الثاني · مخطط له 2027',
    'x.choose': 'اختر عدد المواقع المخطط لها التي تريد احتسابها.', 'x.site': 'الموقع', 'x.calves': 'عجل', 'x.sheep': 'رأس من الأغنام', 'x.camels': 'من الإبل',
    'x.dots': 'كل نقطة تمثل 1,000 رأس، لكل دورة مدتها 120 يومًا، وفق الطاقة التصميمية لكل موقع.',
    'x.drag': 'اسحب شريط الفيلم واختر لقطة ثم اضغط تشغيل.', 'x.concept': 'التصميم المقترح', 'x.target': 'الطاقة المستهدفة',
    'x.cap1': '50 رأس بقر', 'x.cap1u': 'في الساعة', 'x.cap2': '200 رأس غنم', 'x.cap2u': 'في الساعة', 'x.cap3': '50 من الإبل', 'x.cap3u': 'في اليوم',
    'x.milestone': 'المرحلة', 'x.of': 'من',
    'x.deck': 'اسحب البطاقة العليا جانبًا، أو استخدم الأسهم.', 'x.prev': 'السابق', 'x.next': 'التالي',
    'x.ai.eyebrow': 'مساعد الرحمة', 'x.ai.h': 'اسألنا <em>بثلاث لغات</em>',
    'x.ai.p': 'المواشي والأعلاف، الشراكات، زيارات المواقع أو الأسئلة العامة — بالعربية أو الإنجليزية أو الفرنسية. يجيب مساعد الرحمة من معلومات الشركة ويجهّز استفسارك لمكتب نواكشوط.',
    'x.ai.hello': 'مرحبًا! أنا مساعد الرحمة. اسأل عن مواشينا وأعلافنا، وموقع ألاك، ومشروع مسلخ نواكشوط، والشراكات أو زيارات المواقع.',
    'x.ai.c1': 'ما هي أنشطة الرحمة؟', 'x.ai.c2': 'حدّثني عن موقع ألاك', 'x.ai.c3': 'ما طاقة المسلخ؟', 'x.ai.c4': 'أرغب في الشراكة معكم',
    'x.ai.ph': 'اسأل بالعربية أو English أو Français — مثال: هل يمكنني زيارة ألاك؟', 'x.ai.ask': 'اسأل',
    'x.d.interest': 'الاهتمام', 'x.d.qty': 'الكمية / الحجم', 'x.d.loc': 'الموقع', 'x.d.wa': 'أرسل عبر واتساب', 'x.d.mail': 'راسلنا بالبريد', 'x.d.foot': 'تُبنى المسودة أثناء المحادثة',
    'x.d.intro': 'استفسار عبر موقع الرحمة'
  },
  fr: {
    'as.open': 'Demander à l’IA Arrahma', 'x.group': 'Le groupe Bawadi Al Dain', 'x.dubai': 'Dubaï', 'x.mau': 'Mauritanie',
    'x.nav.sites': 'Sites', 'x.nav.farm': 'La ferme', 'x.nav.films': 'Films d’Aleg', 'x.nav.contact': 'Contact', 'x.ask': 'Demander à l’IA Arrahma',
    'x.sand': 'Passez le curseur dans le sable', 'x.scroll': 'Défiler', 'x.est': 'Création', 'x.first': 'Premier site, 2025', 'x.forage': 'Fourrage',
    'x.ground': 'Depuis la terre', 'x.crops': 'Cultures',
    'x.country': 'Pays', 'x.hq': 'Siège social', 'x.established': 'Création', 'x.groupk': 'Groupe', 'x.since': 'Depuis 2023 · Nouakchott · ',
    'x.hover': 'Survolez ou touchez chaque panneau.',
    'x.ops.h': 'De la côte au <em>Hodh Ech Chargui</em>', 'x.ops.p': 'Faites défiler pour voyager d’ouest en est. Les sites sont placés selon leur longitude réelle.',
    'x.ops.reported': 'Selon la société', 'x.atlantic': 'Atlantique', 'x.since25': 'Depuis 2025', 'x.planned': 'Deuxième site · prévu en 2027',
    'x.choose': 'Choisissez combien de sites prévus compter.', 'x.site': 'Site', 'x.calves': 'veaux', 'x.sheep': 'moutons', 'x.camels': 'dromadaires',
    'x.dots': 'Chaque point représente 1 000 têtes, par cycle de 120 jours, à la capacité nominale de chaque site.',
    'x.drag': 'Faites glisser la pellicule, choisissez une image, puis lancez la lecture.', 'x.concept': 'Concept', 'x.target': 'Capacité visée',
    'x.cap1': '50 bovins', 'x.cap1u': 'par heure', 'x.cap2': '200 ovins', 'x.cap2u': 'par heure', 'x.cap3': '50 dromadaires', 'x.cap3u': 'par jour',
    'x.milestone': 'Étape', 'x.of': 'sur',
    'x.deck': 'Écartez la carte du dessus, ou utilisez les flèches.', 'x.prev': 'Précédent', 'x.next': 'Suivant',
    'x.ai.eyebrow': 'IA Arrahma', 'x.ai.h': 'Posez vos questions, en <em>trois langues</em>',
    'x.ai.p': 'Élevage et fourrage, partenariats, visites de sites ou questions générales — en français, en anglais ou en arabe. L’IA Arrahma répond à partir des informations de la société et prépare votre demande pour le bureau de Nouakchott.',
    'x.ai.hello': 'Marhaba — bienvenue ! Je suis l’IA Arrahma. Posez vos questions sur notre élevage et notre fourrage, le site d’Aleg, le projet d’abattoir de Nouakchott, les partenariats ou les visites.',
    'x.ai.c1': 'Que fait Arrahma ?', 'x.ai.c2': 'Parlez-moi du site d’Aleg', 'x.ai.c3': 'Capacité de l’abattoir ?', 'x.ai.c4': 'Je souhaite un partenariat',
    'x.ai.ph': 'Écrivez en français, English ou عربي — ex. : puis-je visiter Aleg ?', 'x.ai.ask': 'Demander',
    'x.d.interest': 'Intérêt', 'x.d.qty': 'Quantité / taille', 'x.d.loc': 'Lieu', 'x.d.wa': 'Envoyer sur WhatsApp', 'x.d.mail': 'Nous écrire', 'x.d.foot': 'Le brouillon se remplit pendant la conversation',
    'x.d.intro': 'Demande via le site Arrahma'
  }
};
const en = (k) => (k in NEW.en ? NEW.en[k] : textOf(k));
const t = (k) => `data-i18n="${k}">${en(k)}`;
// Heading with an accent phrase per language (wrapped in <em> by the page script)
const em = (o) => ` data-em-en="${esc(o.en)}" data-em-ar="${esc(o.ar)}" data-em-fr="${esc(o.fr)}"`;
const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii', 'xiii', 'xiv'];
const img = (s, w, h, alt, extra) => `<img src="${s}" alt="${alt || ''}" width="${w}" height="${h}" loading="lazy" decoding="async"${extra || ''}>`;

// ---------- Parts reused from the source page ----------
let head = grab(/^[\s\S]*?<\/head>/, 'head');
head = head.replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2\?[^"]*" rel="stylesheet">/, '<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,300;1,9..144,400;1,9..144,500&family=Nunito+Sans:wght@400;600;700;800&family=Amiri:ital,wght@0,400;0,700;1,400&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap" rel="stylesheet">');
head = head.replace(/<link rel="stylesheet" href="[^"]*(?:brochure|style|wheel|design-\d[^"]*)\.css[^"]*">\n?/g, '');
head = head.replace(/(<link rel="stylesheet" href="\.\.\/assets\/css\/corporate\.css[^"]*">)/, `$1\n<link rel="stylesheet" href="../assets/css/arrahma.css?v=${V}">\n<link rel="stylesheet" href="../assets/css/assistant.css?v=${V}">`);
head = head.replace(/<meta name="theme-color" content="[^"]*">/, '<meta name="theme-color" content="#1C1410">');
const i18nScript = grab(/<script>\s*var ARRAHMA[\s\S]*?<\/script>/, 'i18n script');
const form = grab(/<form class="enq"[\s\S]*?<\/form>/, 'form');
const galleryList = grab(/<ul class="media-grid" data-gallery>[\s\S]*?<\/ul>/, 'gallery list');
const cos = grab(/<div class="ar-cos">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, 'group companies').replace(/<\/div>\s*<\/div>$/, '');
const msRows = [...grab(/<dl class="ms-table">[\s\S]*?<\/dl>/, 'milestones').matchAll(/<div[^>]*>\s*<dt>([\s\S]*?)<\/dt>\s*<dd data-i18n="([^"]+)">([\s\S]*?)<\/dd>\s*<\/div>/g)];
must(msRows.length === 7, 'seven milestones');
const arabicName = must((src.match(/<span lang="ar" dir="rtl">(الرحمة للإنتاج الزراعي[^<]*)<\/span>/) || [])[1], 'arabic name');
const seal400 = '../assets/img/logos/arrahma-seal-400.png';
// Aleg clips, in stage order
const build = grab(/<ol class="ar-build"[\s\S]*?<\/ol>/, 'aleg stages');
const clips = [];
[...build.matchAll(/<li class="ar-stage"[\s\S]*?<\/li>(?=\s*(?:<li|<\/ol>))/g)].forEach((st, si) => {
  const hk = (st[0].match(/<h3 data-i18n="([^"]+)"/) || [])[1], pk = (st[0].match(/<p data-i18n="(bd\.\dp)"/) || [])[1];
  [...st[0].matchAll(/data-video="([^"]+)" data-poster="([^"]+)" data-w="(\d+)" data-h="(\d+)"[\s\S]*?media-dur ltr">([^<]*)<[\s\S]*?media-cap" data-i18n="([^"]+)"/g)]
    .forEach((m) => clips.push({ video: m[1], poster: m[2], w: m[3], h: m[4], dur: m[5], cap: m[6], hk, pk, stage: si }));
});
must(clips.length >= 10, 'aleg clips');
// Contact rows
const info = grab(/<dl class="info-list">[\s\S]*?<\/dl>/, 'contact list');

// ---------- Page ----------
const SECTIONS = [['top', 'x.nav.sites'], ['about', 'nav.about'], ['story', 'st.eyebrow'], ['why', 'wy.eyebrow'], ['vision', 'vs.eyebrow'], ['journey', 'x.nav.sites'], ['production', 'x.nav.farm'],
  ['goals', 'gl.eyebrow'], ['aleg', 'x.nav.films'], ['development', 'nav.development'], ['milestones', 'nav.milestones'], ['gallery', 'nav.gallery'], ['ask', 'x.ai.eyebrow'], ['sites', 'sites.eyebrow'], ['contact', 'x.nav.contact']];

const whyImgs = [[M + 'harrowing-poster.jpg', 960, 540], [M + 'herd-range-poster.jpg', 640, 360], [P + 'feedlot-three-men.jpg', 1280, 720], [M + 'cattle.jpg', 1020, 765], [P + 'omani-delegation-vet-directorate.jpg', 1024, 576], [M + 'maize-seedlings.jpg', 1600, 1200]];
const journeySites = [
  { k: 1, lon: -15.98, lat: '18.1°N · 15.9°W', label: 'x.hq', img: [P + 'nouakchott-slaughterhouse-render-1000.jpg', 1000, 666], ops: [1] },
  { k: 2, lon: -13.92, lat: '17.1°N · 13.9°W', label: 'x.since25', img: [M + 'aleg-drone-2-poster.jpg', 960, 540], ops: [2, 3] },
  { k: 3, lon: -7.25, lat: '16.6°N · 7.3°W', label: 'x.planned', img: [M + 'harrowing-poster.jpg', 960, 540], ops: [4] }
];

const body = `<body class="company arrahma ar2">
<a class="skip-link" href="#main" data-i18n="ui.skip">Skip to content</a>

<header class="a-head" data-nav>
  <div class="a-group"><div class="a-wrap">
    <span class="a-group-k" data-i18n="x.group">${NEW.en['x.group']}</span><i aria-hidden="true">·</i>
    <a href="../" data-keep-lang><span lang="en">Bawadi Al Dain</span> · <span data-i18n="x.dubai">Dubai</span></a><i aria-hidden="true">·</i>
    <a href="./" data-keep-lang aria-current="page"><span lang="fr">Arrahma</span> · <span data-i18n="x.mau">Mauritania</span></a>
  </div></div>
  <div class="a-bar"><div class="a-wrap a-bar-in">
    <a class="a-brand" href="#top" data-i18n-aria-label="brand.aria" aria-label="Arrahma — back to top">
      <img src="../assets/img/logos/arrahma-seal-160.png" alt="" width="160" height="153">
      <span lang="fr"><b>Arrahma</b><small>Production Agricole et Animale</small></span>
    </a>
    <nav id="main-nav" class="a-nav" data-i18n-aria-label="nav.aria" aria-label="Main">
      <a href="#about" data-i18n="nav.about">About</a>
      <a href="#journey" data-i18n="x.nav.sites">Sites</a>
      <a href="#production" data-i18n="x.nav.farm">The farm</a>
      <a href="#aleg" data-i18n="x.nav.films">Aleg films</a>
      <a href="#development" data-i18n="nav.development">Development</a>
      <a href="#milestones" data-i18n="nav.milestones">Milestones</a>
      <a href="#gallery" data-i18n="nav.gallery">Gallery</a>
      <a href="#contact" data-i18n="x.nav.contact">Contact</a>
    </nav>
    <div class="lang-switch a-lang" role="group" aria-label="Language" data-i18n-aria-label="ui.langs" data-lang-switch>
      <button type="button" data-lang="en" lang="en" aria-label="English">EN</button>
      <button type="button" data-lang="ar" lang="ar" aria-label="العربية">عربي</button>
      <button type="button" data-lang="fr" lang="fr" aria-label="Français">FR</button>
    </div>
    <a class="a-askbtn" href="#ask" data-i18n="x.ask">Ask Arrahma AI</a>
    <button class="nav-toggle a-toggle" type="button" data-nav-toggle aria-expanded="false" aria-controls="main-nav"><span></span><span></span><span class="sr-only" data-i18n="ui.menu">Menu</span></button>
  </div></div>
</header>

<nav class="a-rail" aria-hidden="true">${SECTIONS.map(([id, k]) => `<a href="#${id}" tabindex="-1"><span data-i18n="${k}">${en(k)}</span><i></i></a>`).join('')}</nav>

<main id="main">
  <section id="top" class="a-hero" aria-labelledby="hero-title" data-hero>
    <p class="a-bigar" aria-hidden="true" lang="ar" dir="rtl">الرحمة</p>
    <div class="a-wrap a-hero-grid">
      <div class="a-hero-text">
        <p class="a-arname" lang="ar" dir="rtl">${arabicName.replace(/\s*ش\.ذ\.م\.م\s*$/, '')}</p>
        <h1 id="hero-title" class="a-title"><span class="a-name" lang="fr">Arr<em>ahma</em></span><span class="a-sub" lang="fr">Production Agricole et Animale</span></h1>
        <p class="a-kick" ${t('hero.eyebrow')}</p>
        <p class="a-tag" ${t('hero.tag')}</p>
        <div class="a-actions"><a class="a-btn" href="#about" ${t('hero.cta1')}</a><a class="a-btn a-ghost" href="#contact" ${t('hero.cta2')}</a></div>
        <dl class="a-stats">
          <div><dt class="ltr">2023</dt><dd ${t('x.est')}</dd></div>
          <div><dt lang="fr">Aleg</dt><dd ${t('x.first')}</dd></div>
          <div><dt class="ltr">330 ha</dt><dd ${t('x.forage')}</dd></div>
        </dl>
      </div>
      <div class="a-sand" aria-hidden="true">
        <p class="a-sand-hint" ${t('x.sand')}</p>
        <div class="a-sand-ring"><img class="a-sand-img" src="${seal400}" alt="" width="400" height="383"><canvas class="a-sand-cv"></canvas></div>
      </div>
    </div>
    <span class="a-scroll" ${t('x.scroll')}</span>
  </section>

  <section class="a-fly" data-fly aria-labelledby="fly-title">
    <div class="a-fly-stage">
      <p class="a-fly-k" ${t('x.ground')}</p>
      <img class="a-fly-photo" src="${M}maize-seedlings.jpg" alt="${esc(textOf('g.maize-seedlings'))}" data-i18n-alt="g.maize-seedlings" width="1600" height="1200" decoding="async">
      <h2 id="fly-title" class="a-fly-word" lang="fr" dir="ltr"><span>ARRAHMA</span></h2>
      <div class="a-fly-card"><p class="a-eyebrow" ${t('x.crops')}</p><p class="a-fly-h" ${t('pr.cp')}</p></div>
    </div>
  </section>

  <section id="about" class="a-sec a-cream" aria-labelledby="about-title">
    <div class="a-wrap a-about">
      <div class="a-about-text" data-rv>
        <p class="a-eyebrow"><span data-i18n="about.eyebrow">About Us</span> — <span data-i18n="about.cb">Mauritania</span></p>
        <h2 id="about-title" class="a-h2" ${t('about.h2')}</h2>
        <p class="a-drop" ${t('about.p1')}</p>
        <p ${t('about.p2')}</p>
        <p ${t('about.p3')}</p>
        <dl class="a-facts">
          <div><dt ${t('x.country')}</dt><dd ${t('about.cb')}</dd></div>
          <div><dt ${t('x.hq')}</dt><dd ${t('sites.1h')}</dd></div>
          <div><dt ${t('x.established')}</dt><dd class="ltr">2023</dd></div>
          <div><dt ${t('x.groupk')}</dt><dd lang="en">Bawadi Al Dain</dd></div>
        </dl>
      </div>
      <div class="a-about-art" data-rv>
        <figure class="a-arch">${img(P + 'seedlings-field-inspection.jpg', 810, 1080, esc(altOf('about.alt')), ' data-i18n-alt="about.alt"')}</figure>
        <figure class="a-small">${img(P + 'seed-drill-tractor-2.jpg', 1080, 810)}</figure>
        <div class="a-badge" aria-hidden="true"><svg viewBox="0 0 120 120"><defs><path id="a-badge-p" d="M60 60m-44 0a44 44 0 1 1 88 0a44 44 0 1 1 -88 0"/></defs><text><textPath href="#a-badge-p" data-badge>${NEW.en['x.since'].repeat(2)}</textPath></text></svg><b class="ltr">2023</b></div>
      </div>
    </div>
  </section>

  <section id="story" class="a-sec a-cream2" aria-labelledby="story-title">
    <div class="a-wrap">
      <p class="a-eyebrow" ${t('st.eyebrow')}</p>
      <h2 id="story-title" class="a-h2"${em({ en: '35 years', ar: '35 عامًا', fr: '35 ans' })} ${t('st.h2')}</h2>
      <div class="a-story">
        <div class="a-story-l">
          <p class="a-count"><b data-count="35" class="ltr">35</b><sup>+</sup></p>
          <p ${t('st.p1')}</p>
          <p ${t('st.p2')}</p>
        </div>
        <article class="a-founder" data-rv>
          <img class="a-founder-seal" src="../assets/img/logos/arrahma-seal-160.png" alt="" width="160" height="153">
          <p class="a-eyebrow" ${t('st.frole')}</p>
          <h3 ${t('st.fn')}</h3>
          <p ${t('st.fp')}</p>
          <h4 ${t('st.ah')}</h4>
          <ol class="a-roman">${[1, 2, 3, 4, 5, 6].map((i) => `<li><span>${ROMAN[i - 1]}</span><p ${t('st.a' + i)}</p></li>`).join('')}</ol>
          <p class="a-sign" ${t('st.fn')}</p>
        </article>
      </div>
      <div class="a-team" data-rv>
        <p class="a-count a-count-sm"><b data-count="40" class="ltr">40</b><sup>+</sup></p>
        <div><p class="a-eyebrow" ${t('st.th')}</p><h3 ${t('st.tn')}</h3><p class="a-team-r" ${t('st.tr')}</p><p ${t('st.tp')}</p></div>
      </div>
    </div>
  </section>

  <section id="why" class="a-sec a-cream" aria-labelledby="why-title">
    <div class="a-wrap">
      <p class="a-eyebrow" ${t('wy.eyebrow')}</p>
      <h2 id="why-title" class="a-h2"${em({ en: 'Mauritania', ar: 'موريتانيا؟', fr: 'Mauritanie' })} ${t('wy.h2')}</h2>
      <p class="a-lead"><span ${t('wy.note')}</span><br><span ${t('x.hover')}</span></p>
      <ol class="a-panels" data-panels>${[1, 2, 3, 4, 5, 6].map((i) => `<li${i === 1 ? ' class="is-on"' : ''} tabindex="0">${img(whyImgs[i - 1][0], whyImgs[i - 1][1], whyImgs[i - 1][2])}<span class="a-pn">${ROMAN[i - 1]}</span><p ${t('wy.' + i)}</p></li>`).join('')}</ol>
    </div>
  </section>

  <section id="vision" class="a-sec a-dark" aria-labelledby="vision-title">
    <div class="a-wrap a-vision">
      <div data-rv>
        <p class="a-eyebrow"><span data-i18n="vs.eyebrow">Vision and Values</span></p>
        <h2 id="vision-title" class="sr-only" ${t('vs.h2')}</h2>
        <p class="a-vision-big"${em({ en: 'renewing and developing', ar: 'لتجديد', fr: 'renouveau et du développement' })} ${t('vs.p1')}</p>
        <p class="a-vision-sm" ${t('vs.p2')}</p>
      </div>
      <div class="a-values" data-rv>
        <h3 class="sr-only" ${t('vs.vh')}</h3>
        <p ${t('vs.vp')}</p>
        <div class="a-valbox"><h4 ${t('vs.eh')}</h4><ul>${[1, 2, 3, 4, 5, 6, 7].map((i) => `<li ${t('vs.e' + i)}</li>`).join('')}</ul></div>
        <div class="a-valbox"><h4 ${t('vs.ch')}</h4><ul>${[1, 2, 3].map((i) => `<li ${t('vs.c' + i)}</li>`).join('')}</ul></div>
      </div>
    </div>
  </section>

  <section id="journey" class="a-journey" data-journey aria-labelledby="journey-title">
    <div class="a-journey-stage">
      <div class="a-wrap">
        <p class="a-eyebrow"><span data-i18n="ops.eyebrow">Our Operations</span> — <span data-i18n="x.ops.reported">As reported by the company</span></p>
        <h2 id="journey-title" class="a-h2" ${t('x.ops.h')}</h2>
        <p class="a-lead" ${t('x.ops.p')}</p>
        <div class="a-map">
          <svg class="a-dunes" viewBox="0 0 1000 200" preserveAspectRatio="none" aria-hidden="true"><path class="d1" d="M0 120C120 90 230 80 360 104s260 40 380 10 190-30 260-12v78H0Z"/><path class="d2" d="M0 150c140-30 290-38 450-14s330 30 550-8v72H0Z"/><path class="route" d="" /></svg>
          <span class="a-atl" ${t('x.atlantic')}</span>
          ${journeySites.map((s) => `<button type="button" class="a-pin" data-pin="${s.k - 1}" data-lon="${s.lon}"><b ${t('sites.' + s.k + 'h')}</b><i></i><small class="ltr">${s.lat}</small></button>`).join('')}
          <div class="a-sitecard">${journeySites.map((s) => `<div class="a-sc" data-sc="${s.k - 1}">${img(s.img[0], s.img[1], s.img[2])}<div><p class="a-eyebrow" ${t(s.label)}</p><h3 ${t('sites.' + s.k + 'h')}</h3><p ${t('sites.' + s.k + 'p')}</p></div></div>`).join('')}</div>
        </div>
        <ol class="a-ops">${[1, 2, 3, 4].map((i) => `<li data-op="${i}"><p class="a-meta" ${t('ops.' + i + 'm')}</p><h3 ${t('ops.' + i + 'h')}</h3><p ${t('ops.' + i + 'p')}</p></li>`).join('')}</ol>
      </div>
    </div>
  </section>

  <section id="production" class="a-sec a-cream" aria-labelledby="prod-title">
    <div class="a-wrap a-prod">
      <div class="a-prod-text">
        <p class="a-eyebrow" ${t('pr.eyebrow')}</p>
        <h2 id="prod-title" class="a-h2"${em({ en: 'Boghé and Aleg', ar: 'بوغي وألاك', fr: 'Boghé et Aleg' })} ${t('pr.h2')}</h2>
        <p ${t('pr.p')}</p>
        <p class="a-count a-count-xl"><b data-count="50000" class="ltr" data-i18n="pr.capb">${textOf('pr.capb')}</b></p>
        <p class="a-cap" ${t('pr.cap')}</p>
        <h3 ${t('pr.ch')}</h3>
        <ul class="a-chips">${[1, 2, 3, 4, 5].map((i) => `<li ${t('pr.c' + i)}</li>`).join('')}</ul>
        <p ${t('pr.cp')}</p>
        <p ${t('pr.fruit')}</p>
        <h3 ${t('pr.dh')}</h3>
        <p ${t('pr.dp')}</p>
        <p ${t('pr.water')}</p>
        <ul class="a-chips a-chips-sm">${[1, 2, 3, 4, 5].map((i) => `<li ${t('pr.x' + i)}</li>`).join('')}</ul>
      </div>
      <div class="a-prod-art">
        <figure class="a-arch a-arch-t">${img(M + 'seedling-row.jpg', 1200, 1600, esc(textOf('g.seedling-row')), ' data-i18n-alt="g.seedling-row"')}</figure>
        <figure class="a-ph">${img(M + 'herd.jpg', 1020, 765, esc(textOf('g.herd')), ' data-i18n-alt="g.herd"')}</figure>
        <figure class="a-ph">${img(P + 'seed-drill-tractor-2.jpg', 1080, 810, esc(textOf('gal.5c')), ' data-i18n-alt="gal.5c"')}</figure>
      </div>
    </div>
  </section>

  <section id="goals" class="a-sec a-cream" aria-labelledby="goals-title">
    <div class="a-wrap">
      <div class="a-goals" data-goals>
        <div class="a-goals-top">
          <div>
            <p class="a-eyebrow" ${t('gl.eyebrow')}</p>
            <h2 id="goals-title" class="a-h3"${em({ en: 'across Mauritania', ar: 'في أنحاء موريتانيا', fr: 'en Mauritanie' })} ${t('gl.h2')}</h2>
            <p><span ${t('gl.p')}</span> <span ${t('x.choose')}</span></p>
          </div>
          <div class="a-pick" role="group">${[1, 2, 3, 4, 5].map((i) => `<button type="button" data-n="${i}" aria-pressed="${i === 1}" class="ltr">${i}</button>`).join('')}</div>
        </div>
        <div class="a-sitegrid">${[1, 2, 3, 4, 5].map((i) => `<div class="a-sg" data-sg="${i}"><p><span data-i18n="x.site">Site</span> <span class="ltr">${i}</span></p><div class="a-dots" aria-hidden="true">${'<i class="c"></i>'.repeat(20)}${'<i class="s"></i>'.repeat(30)}${'<i class="m"></i>'.repeat(3)}</div></div>`).join('')}</div>
        <div class="a-totals">
          <p><i class="c"></i><b class="ltr" data-total="20000">20,000</b><span data-i18n="x.calves">calves</span><span class="sr-only" data-i18n="gl.k1">${textOf('gl.k1')}</span></p>
          <p><i class="s"></i><b class="ltr" data-total="30000">30,000</b><span data-i18n="x.sheep">sheep</span><span class="sr-only" data-i18n="gl.k2">${textOf('gl.k2')}</span></p>
          <p><i class="m"></i><b class="ltr" data-total="3000">3,000</b><span data-i18n="x.camels">camels</span><span class="sr-only" data-i18n="gl.k3">${textOf('gl.k3')}</span></p>
        </div>
        <p class="a-note"><span ${t('x.dots')}</span> <span ${t('gl.note')}</span></p>
      </div>
    </div>
  </section>

  <section id="aleg" class="a-sec a-dark" aria-labelledby="build-title">
    <div class="a-wrap">
      <div class="a-aleg-head">
        <div><p class="a-eyebrow" ${t('bd.eyebrow')}</p><h2 id="build-title" class="a-h2"${em({ en: 'Aleg', ar: 'ألاك', fr: 'd’Aleg' })} ${t('bd.h2')}</h2></div>
        <p><span ${t('bd.p')}</span> <span ${t('x.drag')}</span></p>
      </div>
      <div class="a-player" data-player>
        <div class="a-screen">
          <video class="a-video" playsinline preload="none" poster="${clips[clips.length - 1].poster}"></video>
          <button type="button" class="a-play" data-i18n-aria-label="ui.galPlay" aria-label="Play video"><i></i></button>
        </div>
        <div class="a-player-cap"><div><h3 class="a-clip-h"></h3><p class="a-clip-p"></p></div><span class="a-clip-n ltr"></span></div>
        <div class="a-strip" data-strip><div class="a-strip-in">${clips.map((c, i) => `<button type="button" class="a-frame" data-i="${i}" data-video="${c.video}" data-poster="${c.poster}" data-dur="${c.dur}" data-h="${c.hk}" data-p="${c.pk}"><img src="${c.poster}" alt="" width="${c.w}" height="${c.h}" loading="lazy" decoding="async" draggable="false"><span ${t(c.cap)}</span></button>`).join('')}</div></div>
        <div hidden>${[...new Set(clips.map((c) => c.hk))].map((k) => `<span ${t(k)}</span>`).join('')}${[...new Set(clips.map((c) => c.pk))].map((k) => `<span ${t(k)}</span>`).join('')}</div>
      </div>
    </div>
  </section>

  <section id="development" class="a-sec a-cream" aria-labelledby="dev-title">
    <div class="a-wrap">
      <p class="a-eyebrow" ${t('dev.eyebrow')}</p>
      <h2 id="dev-title" class="a-h2"${em({ en: 'Slaughterhouse', ar: 'العصري', fr: 'moderne' })} ${t('dev.h2')}</h2>
      <figure class="a-render" data-rv>
        <span class="a-tag-pill" ${t('x.concept')}</span>
        ${img(P + 'nouakchott-slaughterhouse-render.jpg', 1280, 853, esc(altOf('dev.alt')), ' data-i18n-alt="dev.alt"')}
        <figcaption><span class="a-eyebrow" ${t('x.target')}</span><div class="a-capgrid"><p><b ${t('x.cap1')}</b><small ${t('x.cap1u')}</small></p><p><b ${t('x.cap2')}</b><small ${t('x.cap2u')}</small></p><p><b ${t('x.cap3')}</b><small ${t('x.cap3u')}</small></p></div></figcaption>
      </figure>
      <div class="a-two"><p ${t('dev.p1')}</p><p ${t('dev.p2')}</p></div>
      <ul class="a-plans">${[1, 2, 3, 4].map((i) => `<li><h3 ${t('dev.l' + i + 'b')}</h3><p ${t('dev.l' + i)}</p></li>`).join('')}</ul>
      <div class="a-tabs" data-tabs>
        <div class="a-tablist" role="tablist"><button type="button" role="tab" aria-selected="true" data-tab="0" ${t('gl.sh')}</button><button type="button" role="tab" aria-selected="false" data-tab="1" ${t('gl.lh')}</button></div>
        <ol class="a-goal-list" data-panel="0">${[1, 2, 3, 4, 5].map((i) => `<li><span>${ROMAN[i - 1]}</span><p ${t('gl.s' + i)}</p></li>`).join('')}</ol>
        <ol class="a-goal-list" data-panel="1" hidden>${[1, 2, 3, 4, 5, 6].map((i) => `<li><span>${ROMAN[i - 1]}</span><p ${t('gl.l' + i)}</p></li>`).join('')}</ol>
        <p class="a-note" ${t('gl.note')}</p>
      </div>
      <div class="a-hodh" data-rv>
        <div><h3 ${t('gl.hh')}</h3><p ${t('gl.hp1')}</p><p ${t('gl.hp2')}</p></div>
        <div><h4 ${t('gl.bh')}</h4><ul>${[1, 2, 3, 4, 5, 6].map((i) => `<li ${t('gl.b' + i)}</li>`).join('')}</ul><p class="a-note" ${t('gl.note')}</p></div>
      </div>
    </div>
  </section>

  <section id="milestones" class="a-ms" data-ms aria-labelledby="ms-title">
    <div class="a-ms-stage">
      <div class="a-wrap">
        <p class="a-eyebrow" ${t('ms.eyebrow')}</p>
        <h2 id="ms-title" class="a-h2"${em({ en: 'progress', ar: 'مسيرتنا', fr: 'parcours' })} ${t('ms.h2')}</h2>
        <p class="sr-only" ${t('ms.p')}</p>
        <div class="a-ms-grid">
          <div class="a-dial" aria-hidden="true">
            <div class="a-ring">${msRows.map((r, i) => `<button type="button" class="a-node ltr" data-m="${i}" tabindex="-1">${i + 1}</button>`).join('')}</div>
            <div class="a-dial-c"><small><span data-i18n="x.milestone">Milestone</span> <span class="ltr" data-mn>1</span></small><b data-mshort></b><span data-mlong></span></div>
          </div>
          <div class="a-ms-info">
            <ol class="a-ms-list">${msRows.map((r, i) => `<li data-m="${i}"${i ? ' hidden' : ''}><p class="a-eyebrow">${r[1]}</p><h3 data-i18n="${r[2]}">${r[3]}</h3></li>`).join('')}</ol>
            <div class="a-ms-nav"><button type="button" class="a-round" data-step="-1" data-i18n-aria-label="x.prev" aria-label="Previous"><i></i></button><button type="button" class="a-round a-next" data-step="1" data-i18n-aria-label="x.next" aria-label="Next"><i></i></button><span class="ltr" data-mcount>1 / 7</span></div>
            <figure class="a-ms-ph">${img(P + 'feedlot-official-visit-900.jpg', 900, 677, esc(altOf('ms.alt')), ' data-i18n-alt="ms.alt"')}</figure>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="gallery" class="a-sec a-cream" aria-labelledby="gal-title">
    <div class="a-wrap a-gal">
      <div class="a-gal-text">
        <p class="a-eyebrow" ${t('gal.eyebrow')}</p>
        <h2 id="gal-title" class="a-h2"${em({ en: 'site', ar: 'مواقعنا', fr: 'terrain' })} ${t('gal.h2')}</h2>
        <p><span ${t('gal.p')}</span> <span ${t('x.deck')}</span></p>
        <div class="a-filters" role="group">
          <button type="button" data-f="all" aria-pressed="true"><span ${t('wh.all')}</span> <b class="ltr"></b></button>
          <button type="button" data-f="livestock" aria-pressed="false"><span ${t('wh.live')}</span> <b class="ltr"></b></button>
          <button type="button" data-f="farming" aria-pressed="false"><span ${t('wh.farm')}</span> <b class="ltr"></b></button>
          <button type="button" data-f="visits" aria-pressed="false"><span ${t('wh.visits')}</span> <b class="ltr"></b></button>
          <button type="button" data-f="video" aria-pressed="false"><span ${t('wh.vid')}</span> <b class="ltr"></b></button>
        </div>
        <div class="a-deck-nav"><button type="button" class="a-round" data-dstep="-1" data-i18n-aria-label="x.prev" aria-label="Previous"><i></i></button><button type="button" class="a-round a-next" data-dstep="1" data-i18n-aria-label="x.next" aria-label="Next"><i></i></button><span class="a-deck-bar"><i></i></span><span class="ltr" data-dcount></span></div>
      </div>
      <div class="a-deck" data-deck aria-label="Gallery"></div>
      <div class="a-gal-src">${galleryList}</div>
    </div>
  </section>

  <section id="ask" class="a-sec a-cream" aria-labelledby="ai-title">
    <div class="a-wrap">
      <div class="a-ai" data-ai data-wa="22241320898" data-mail="ghazafi@bawadialdain.com">
        <div class="a-ai-l">
          <p class="a-eyebrow" ${t('x.ai.eyebrow')}</p>
          <h2 id="ai-title" class="a-h3" ${t('x.ai.h')}</h2>
          <p ${t('x.ai.p')}</p>
          <div class="a-ai-langs"><button type="button" data-l="en" lang="en">English</button><button type="button" data-l="ar" lang="ar">عربي</button><button type="button" data-l="fr" lang="fr">Français</button></div>
        </div>
        <div class="a-ai-r">
          <div class="a-ai-log" role="log" aria-live="polite" tabindex="0"><div class="a-msg bot"><p ${t('x.ai.hello')}</p></div></div>
          <div class="a-ai-chips"><button type="button" ${t('x.ai.c1')}</button><button type="button" ${t('x.ai.c2')}</button><button type="button" ${t('x.ai.c3')}</button><button type="button" ${t('x.ai.c4')}</button><button type="button" lang="fr">Que fait Arrahma ?</button><button type="button" lang="ar">ما هي أنشطتكم؟</button></div>
          <form class="a-ai-form" novalidate><input type="text" maxlength="600" autocomplete="off" placeholder="${esc(NEW.en['x.ai.ph'])}" data-i18n-placeholder="x.ai.ph" aria-label="${esc(NEW.en['x.ask'])}" data-i18n-aria-label="x.ask"><button type="submit" ${t('x.ai.ask')}</button></form>
          <div class="a-draft">
            <dl><div><dt ${t('x.d.interest')}</dt><dd data-f="interest">—</dd></div><div><dt ${t('x.d.qty')}</dt><dd data-f="qty">—</dd></div><div><dt ${t('x.d.loc')}</dt><dd data-f="loc">—</dd></div></dl>
            <div class="a-draft-act"><a class="a-wa" href="https://wa.me/22241320898" target="_blank" rel="noopener" ${t('x.d.wa')}</a><a class="a-mail" href="mailto:ghazafi@bawadialdain.com" ${t('x.d.mail')}</a></div>
            <p class="a-draft-foot"><span ${t('x.d.foot')}</span> · <a class="ltr" href="tel:+22241320898">+222 41 32 08 98</a> · <a class="ltr" href="mailto:ghazafi@bawadialdain.com">ghazafi@bawadialdain.com</a></p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="sites" class="a-sec a-cream" aria-labelledby="sites-title">
    <div class="a-wrap">
      <p class="a-eyebrow" ${t('sites.eyebrow')}</p>
      <h2 id="sites-title" class="a-h2"${em({ en: 'operate', ar: 'نعمل', fr: 'présents' })} ${t('sites.h2')}</h2>
      <div class="a-cards3">${[1, 2, 3].map((i) => `<div class="a-card"><h3 ${t('sites.' + i + 'h')}</h3><p ${t('sites.' + i + 'p')}</p></div>`).join('')}</div>
      <h3 class="a-h4" ${t('gr.h')}</h3>
      <p class="a-lead" ${t('gr.p')}</p>
      ${cos.replace('class="ar-cos"', 'class="a-cards4"').replace(/class="ar-co"/g, 'class="a-card"').replace(/href="\.\.\/"/g, 'href="../"')}
    </div>
  </section>

  <section id="contact" class="a-sec a-dark contact-section" aria-labelledby="contact-title">
    <div class="a-wrap a-contact">
      <div>
        <p class="a-eyebrow" ${t('con.eyebrow')}</p>
        <h2 id="contact-title" class="a-h2"${em({ en: 'touch', ar: 'معنا', fr: 'contacter' })} ${t('con.h2')}</h2>
        <p class="a-lead" ${t('con.p')}</p>
        ${info.replace('class="info-list"', 'class="a-info"')}
      </div>
      <div class="a-form">
        <h3 ${t('con.formh')}</h3>
        <p ${t('con.formp')}</p>
        ${form}
      </div>
    </div>
  </section>
</main>

<footer class="a-foot">
  <div class="a-wrap a-foot-in">
    <p><img src="../assets/img/logos/arrahma-seal-160.png" alt="" width="160" height="153"><span ${t('f.copy')}</span></p>
    <p lang="ar" dir="rtl">${arabicName}</p>
  </div>
</footer>

${i18nScript}
<script>/* Labels for the parts added by this design */
(function(){var I=window.I18N=window.I18N||{},A=${JSON.stringify(NEW).replace(/</g, '\\u003c')};Object.keys(A).forEach(function(l){I[l]=I[l]||{};Object.keys(A[l]).forEach(function(k){I[l][k]=A[l][k];});});})();
</script>
<script src="../assets/js/i18n.js?v=${V}"></script>
<script src="../assets/js/site.js?v=${V}"></script>
<script src="../assets/js/assistant-kb.js?v=${V}"></script>
<script src="../assets/js/assistant.js?v=${V}"></script>
<script src="../assets/js/arrahma.js?v=${V}"></script>
</body>
</html>
`;
fs.writeFileSync(outFile, head + '\n' + body);
console.log('Arrahma page written: ' + path.basename(outFile) + ' (' + clips.length + ' Aleg clips, ' + msRows.length + ' milestones)');
