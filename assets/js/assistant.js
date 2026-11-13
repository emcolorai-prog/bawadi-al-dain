// Website assistant: a chat panel that answers questions about the companies from the website's own content.
//
// How it answers
//   1. If api/chat.php is installed and has an API key, the question is answered by Claude, which is given
//      the full text of both websites (assets/data/site-kb.json) and told to answer only from it.
//   2. Otherwise (no key yet, static hosting, or the files opened from a computer) it answers by itself:
//      it searches the website text and replies with the matching passage and a link to the section.
// The visitor's language (English, Arabic, French) follows the language switch of the page.
// Loaded after i18n.js and assistant-kb.js. Styles: assets/css/assistant.css.
(function () {
  if (window.__siteAssistant) { return; }
  window.__siteAssistant = true;

  var KB = window.SITE_KB || { chunks: [], pages: {} };
  var me = document.currentScript || document.querySelector('script[src*="assistant.js"]');
  var base = me ? me.src.replace(/assets\/js\/assistant\.js.*$/, '') : '';
  var API = base + 'api/chat.php';
  var page = document.body.classList.contains('arrahma') ? 'arrahma' : 'bawadi';
  var other = page === 'bawadi' ? 'arrahma' : 'bawadi';
  var lang = function () { return window.siteLang ? window.siteLang.get() : (document.documentElement.lang || 'en'); };
  var canAsk = location.protocol !== 'file:';   // the API needs a web server
  try { if (sessionStorage.getItem('as-local') === '1') { canAsk = false; } } catch (e) {}

  // ---------- Wording ----------
  var NAME = { bawadi: 'Bawadi Al Dain', arrahma: 'Arrahma' };
  var T = {
    en: {
      title: 'Ask {name}', sub: 'Website assistant', open: 'Ask a question', close: 'Close the assistant', send: 'Send',
      ph: 'Ask about products, projects, offices…',
      hello: 'Hello! I am the website assistant for {name}. Ask me about the companies, their products, projects and locations, or how to get in touch.',
      chips: ['What products do you trade?', 'Where are your offices?', 'Tell me about the Mauritania project', 'How do I send an enquiry?'],
      note: 'Answers come from this website. For quotes and availability, please contact the team.',
      typing: 'Writing a reply', more: 'Read this on the page', also: 'Related',
      none: 'I could not find that on the website. You can ask about products, production in Sudan, the expansion into Mauritania, Kenya, Somaliland and Iraq, memberships or contact details. For anything else, please write to {email}.',
      price: 'Prices are not published on the website. Availability, grade, origin and terms are confirmed for each enquiry: send the product, quantity and destination and the team will reply by email.',
      contactLead: 'Here is how to reach the team:', enquire: 'Open the enquiry form',
      thanks: 'You are welcome. Is there anything else you would like to know?',
      busy: 'The assistant is busy at the moment. Please try again in a minute.',
      onOther: 'on the {name} website'
    },
    ar: {
      title: 'اسأل {name}', sub: 'مساعد الموقع', open: 'اطرح سؤالًا', close: 'إغلاق المساعد', send: 'إرسال',
      ph: 'اسأل عن المنتجات أو المشاريع أو المكاتب…',
      hello: 'مرحبًا! أنا مساعد موقع {name}. اسألني عن الشركات ومنتجاتها ومشاريعها ومواقعها، أو عن طريقة التواصل معنا.',
      chips: ['ما المنتجات التي تتاجرون بها؟', 'أين تقع مكاتبكم؟', 'حدثني عن مشروع موريتانيا', 'كيف أرسل استفسارًا؟'],
      note: 'الإجابات مأخوذة من هذا الموقع. لعروض الأسعار والتوفر يرجى التواصل مع الفريق.',
      typing: 'جارٍ كتابة الرد', more: 'اقرأ ذلك في الصفحة', also: 'ذو صلة',
      none: 'لم أجد ذلك في الموقع. يمكنك السؤال عن المنتجات، والإنتاج في السودان، والتوسّع في موريتانيا وكينيا وأرض الصومال والعراق، والعضويات، أو بيانات التواصل. ولأي أمر آخر يرجى مراسلتنا على {email}.',
      price: 'الأسعار غير منشورة في الموقع. يتم تأكيد التوفر والدرجة والمنشأ والشروط لكل استفسار: أرسل المنتج والكمية والوجهة وسيرد الفريق بالبريد الإلكتروني.',
      contactLead: 'يمكنك التواصل مع الفريق عبر:', enquire: 'فتح نموذج الاستفسار',
      thanks: 'على الرحب والسعة. هل تودّ معرفة شيء آخر؟',
      busy: 'المساعد مشغول حاليًا. يرجى المحاولة بعد دقيقة.',
      onOther: 'في موقع {name}'
    },
    fr: {
      title: 'Demandez à {name}', sub: 'Assistant du site', open: 'Poser une question', close: 'Fermer l’assistant', send: 'Envoyer',
      ph: 'Produits, projets, bureaux…',
      hello: 'Bonjour ! Je suis l’assistant du site {name}. Posez-moi vos questions sur les sociétés, leurs produits, leurs projets et leurs sites, ou sur la façon de nous contacter.',
      chips: ['Quels produits proposez-vous ?', 'Où sont vos bureaux ?', 'Parlez-moi du site d’Aleg', 'Comment envoyer une demande ?'],
      note: 'Les réponses proviennent de ce site. Pour un devis ou une disponibilité, contactez l’équipe.',
      typing: 'Réponse en cours', more: 'Lire ce passage sur la page', also: 'Voir aussi',
      none: 'Je n’ai pas trouvé cette information sur le site. Vous pouvez m’interroger sur les produits, la production, les sites, les projets ou les coordonnées. Pour toute autre question, écrivez à {email}.',
      price: 'Les prix ne sont pas publiés sur le site. Disponibilité, qualité, origine et conditions sont confirmées pour chaque demande : indiquez le produit, la quantité et la destination, l’équipe vous répondra par e-mail.',
      contactLead: 'Voici comment joindre l’équipe :', enquire: 'Ouvrir le formulaire de contact',
      thanks: 'Avec plaisir. Souhaitez-vous savoir autre chose ?',
      busy: 'L’assistant est occupé pour le moment. Veuillez réessayer dans une minute.',
      onOther: 'sur le site {name}'
    }
  };
  var EMAIL = { bawadi: 'info@bawadialdaingroup.com', arrahma: 'ghazafi@bawadialdain.com' };
  function t(k, vars) {
    var s = (T[lang()] || T.en)[k]; if (s == null) { s = T.en[k]; }
    if (typeof s !== 'string') { return s; }
    vars = vars || {}; if (!('name' in vars)) { vars.name = NAME[page]; } if (!('email' in vars)) { vars.email = EMAIL[page]; }
    Object.keys(vars).forEach(function (v) { s = s.split('{' + v + '}').join(vars[v]); });
    return s;
  }
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  // ---------- Search over the website text (used when the AI service is not available) ----------
  var STOP = {};
  ('a an the and or of to in on at for from by with as is are was were be been it its this that these those do does did you your yours we our us i me my he she they them their can could would should will shall may might have has had about tell what which who whom whose where when why how please any some there here not no yes more most very also than then into over under up out if so know give explain describe information info detail details want need like ' +
   'le la les un une des du de et ou a au aux en dans sur pour par avec est sont que qui quoi ou quel quelle quels quelles vous votre vos nous notre nos je me mon ma mes il elle ils elles ce cet cette ces se sa son ses ne pas plus comment pourquoi quand ' +
   'في من على الى إلى عن مع هل ما ماذا هو هي هم هذا هذه ذلك تلك التي الذي الذين ان أن إن او أو و ثم لا نعم كيف اين أين متى لماذا كم لي لك لكم لنا انا أنا نحن انت أنت انتم أنتم عند كل قد كان كانت يكون بها به فيها فيه لها له منها منه عليها عليه لديكم عندكم التي').split(' ').forEach(function (w) { STOP[norm(w)] = 1; });
  // Words that say little about which passage is meant (the companies' own names, "project", "company"...)
  var LOW = {};
  'bawadi dain arrahma company companie group project business firm work website site بوادي الضعين الرحمه شركه مجموعه مشروع societe groupe projet entreprise'.split(' ').forEach(function (w) { LOW[w] = 0.3; });
  var SYN = {
    phone: ['telephone', 'tel', 'mobile', 'call', 'number', 'whatsapp'], telephone: ['phone', 'mobile'], call: ['phone', 'mobile'], number: ['phone', 'mobile'],
    email: ['mail', 'e-mail'], mail: ['email'], address: ['office', 'located', 'location'], location: ['office', 'address', 'site'], located: ['office', 'address'], offices: ['office', 'address'],
    cow: ['cattle'], cows: ['cattle'], beef: ['cattle', 'meat'], goat: ['goats', 'sheep'], lamb: ['sheep'], camel: ['camels'], animals: ['livestock'], animal: ['livestock'],
    gum: ['arabic', 'talha', 'hashab'], acacia: ['gum'], peanut: ['peanuts', 'groundnuts'], peanuts: ['groundnuts'], groundnut: ['peanuts', 'groundnuts'], oil: ['oils', 'oilseeds'], grain: ['grains', 'sorghum'],
    owner: ['founder', 'chairman', 'founded', 'founding'], founder: ['chairman', 'founded', 'founding'], founded: ['founder', 'founding', 'established', 'chairman'], established: ['founded', 'founding', 'since'], started: ['established', 'founding'], ceo: ['chairman', 'founder'], boss: ['chairman', 'founder'],
    licence: ['licensed', 'license'], license: ['licensed'], certificate: ['certification', 'iso', 'haccp', 'halal'], certified: ['certification', 'iso', 'haccp', 'halal'], certifications: ['certification', 'iso', 'haccp', 'halal'],
    partner: ['partners'], factory: ['factories', 'facility', 'facilities'], factories: ['factory', 'facilities'], slaughterhouse: ['slaughter', 'slaughterhouses'], abattoir: ['slaughterhouse', 'slaughter'],
    export: ['exports'], countries: ['mauritania', 'kenya', 'somaliland', 'iraq', 'sudan'], country: ['mauritania', 'kenya', 'somaliland', 'iraq', 'sudan'], uae: ['dubai', 'emirates'], emirates: ['dubai', 'uae'],
    services: ['offer'], service: ['offer'], sell: ['products', 'trade'], buy: ['products', 'enquiry'], order: ['enquiry'], membership: ['memberships', 'chamber', 'member'], history: ['established', 'since', 'story'], capacity: ['head', 'mt'],
    'هاتف': ['الهاتف', 'جوال'], 'رقم': ['الهاتف'], 'بريد': ['البريد'], 'عنوان': ['مكتب', 'المقر'], 'ابقار': ['الماشيه', 'ابقار'], 'جمال': ['الابل', 'ابل'], 'ابل': ['الابل'], 'منتجات': ['المنتجات'],
    telephone_fr: [], bureau: ['siege', 'adresse'], adresse: ['siege', 'bureau'], betail: ['elevage', 'cheptel'], produits: ['production', 'cultures']
  };
  function norm(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[̀-ًͯ-ْٰـ]/g, '')
      .replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/[’']/g, ' ');
  }
  function stem(w) {
    if (/^[a-z]+$/.test(w)) {
      if (w.length > 4 && /ies$/.test(w)) { return w.slice(0, -3) + 'y'; }
      if (w.length > 3 && /s$/.test(w) && !/ss$/.test(w)) { return w.slice(0, -1); }
      return w;
    }
    if (/^[؀-ۿ]+$/.test(w)) {
      var m = w.match(/^(وال|بال|كال|فال|لل|ال|و)(.{3,})$/);
      return m ? m[2] : w;
    }
    return w;
  }
  function words(s) {
    return norm(s).split(/[^\p{L}\p{N}]+/u).filter(function (w) { return w && !STOP[w] && (w.length > 1 || /\d/.test(w)); }).map(stem);
  }

  // Passages of this page, read from the page itself so they are in the visitor's language
  function pagePassages() {
    var out = [];
    var skip = 'form, .bw-wheel, .media-grid, .media-filter, nav, script, .as-root';
    [].forEach.call(document.querySelectorAll('main section, footer.site-footer'), function (sec) {
      var id = sec.id || (sec.tagName === 'FOOTER' ? 'contact' : 'top');
      var cur = { page: page, section: id, title: '', lines: [] }, pending = '';
      var flush = function () { if (cur.lines.join(' ').length > 20) { out.push(cur); } };
      var label = function () { if (pending) { cur.lines.push('(' + pending + ')'); } pending = ''; };
      [].forEach.call(sec.querySelectorAll('h1, h2, h3, h4, p, li, dt, dd, figcaption, .co, .ar-co'), function (el) {
        if (el.closest(skip) || el.closest('section, footer') !== sec) { return; }
        var img = el.querySelector('img[alt]');
        var ownText = [].some.call(el.childNodes, function (n) { return n.nodeType === 3 && n.nodeValue.trim(); });
        var parts = el.children.length > 1 && !ownText ? [].map.call(el.children, function (n) { return n.textContent; }) : [el.textContent || ''];
        var text = parts.map(function (x) { return x.replace(/\s+/g, ' ').trim(); }).filter(Boolean).join(el.tagName === 'DD' ? ', ' : ' · ') || (img ? img.alt : '');
        if (!text) { return; }
        var tag = el.tagName;
        if (el.matches('.bw-meta, .ar-meta, .eyebrow, .ar-eyebrow, .bw-label')) { pending = /^[\d\u0660-\u0669]+$/.test(text) ? '' : text; return; }
        if (tag === 'H1' || tag === 'H2' || tag === 'H3') {
          if (!cur.title && !cur.lines.length) { cur.title = text; } else { flush(); cur = { page: page, section: id, title: text, lines: [] }; }
          label();
        } else if (tag === 'H4') { cur.lines.push(text + ':'); label(); }
        else if (tag === 'DT') { cur.lines.push(text + ':'); }
        else if (tag === 'LI') { cur.lines.push('- ' + text); }
        else if (tag === 'DD' && cur.lines.length && /:$/.test(cur.lines[cur.lines.length - 1])) { cur.lines[cur.lines.length - 1] = '- ' + cur.lines[cur.lines.length - 1] + ' ' + text; }
        else { cur.lines.push(text); }
      });
      flush();
    });
    return out;
  }
  var index = [];
  function buildIndex() {
    var list = [];
    var en = lang() === 'en';
    KB.chunks.forEach(function (c) {
      list.push({ page: c.page, section: c.section, title: c.title, lines: c.text.split('\n') });
    });
    // In Arabic or French the page's own text comes first; the English passages stay behind it,
    // so a question typed in English is still answered
    if (!en || !list.some(function (c) { return c.page === page; })) { list = pagePassages().concat(list); }
    var df = {};
    list.forEach(function (c) {
      c.tw = {}; words(c.title).forEach(function (w) { c.tw[w] = 1; });
      c.bw = {}; words(c.lines.join(' ')).forEach(function (w) { c.bw[w] = (c.bw[w] || 0) + 1; });
      Object.keys(Object.assign({}, c.tw, c.bw)).forEach(function (w) { df[w] = (df[w] || 0) + 1; });
    });
    index = list; index.df = df; index.n = list.length || 1;
  }
  function hit(map, w) {   // exact word, or a shared stem of five letters or more
    if (map[w]) { return map[w]; }
    if (w.length < 5) { return 0; }
    var p = w.slice(0, Math.max(5, w.length - 2)), best = 0;
    for (var k in map) { if (k.length >= 5 && (k.indexOf(p) === 0 || w.indexOf(k.slice(0, Math.max(5, k.length - 2))) === 0)) { best = Math.max(best, map[k] * 0.7); } }
    return best;
  }
  function search(q) {
    var qs = words(q), all = {};
    qs.forEach(function (w) { all[w] = LOW[w] || 1; (SYN[w] || []).forEach(function (s) { words(s).forEach(function (x) { if (!(x in all)) { all[x] = 0.6; } }); }); });
    var terms = Object.keys(all);
    if (!terms.length) { return []; }
    var nq = norm(q);
    var wantOther = other === 'arrahma' ? /arrahma|mauritan|nouakchott|aleg|brakna|موريتاني|الرحم/.test(nq) : /bawadi|dubai|sudan|kenya|iraq|somaliland|gum|بوادي|دبي|السودان/.test(nq);
    return index.map(function (c) {
      var score = 0, matched = 0;
      terms.forEach(function (w) {
        var idf = Math.log(1 + index.n / (1 + (index.df[w] || 0)));
        var b = hit(c.bw, w), ti = hit(c.tw, w);
        if (b || ti) { matched += all[w] === 1 ? 1 : 0.34; }
        score += all[w] * idf * ((b ? b / (b + 1.2) : 0) + (ti ? 1.6 : 0));
      });
      if (c.page === page) { score *= 1.12; } else if (wantOther) { score *= 1.25; }
      if (c.section === 'footer') { score *= 0.5; }
      return { c: c, score: score, matched: matched };
    }).filter(function (r) { return r.matched >= Math.min(1, qs.length) && r.score > 0.9; })
      .sort(function (a, b) { return b.score - a.score; });
  }
  function linkTo(c) {
    if (c.page === page) { return '#' + (c.section === 'footer' || c.section === 'top' ? 'top' : c.section); }
    var tab = document.querySelector('.co-tab:not([aria-current])');
    var href = tab ? tab.getAttribute('href').replace(/[?#].*$/, '') : (other === 'arrahma' ? 'arrahma/' : '../');
    return href + '?lang=' + lang() + '#' + (c.section === 'footer' || c.section === 'top' ? 'top' : c.section);
  }
  function passageHtml(c, q, max) {
    var qs = words(q), picked = [], len = 0;
    var lines = c.lines.filter(function (l) { return l && l.length > 1; });
    var scored = lines.map(function (l, i) { var ws = words(l), n = 0; qs.forEach(function (w) { if (ws.some(function (x) { return x === w || (w.length >= 5 && x.indexOf(w.slice(0, 5)) === 0); })) { n++; } }); return { l: l, i: i, n: n }; });
    var total = lines.join(' ').length;
    var keep = total <= max ? scored : scored.filter(function (s) { return s.n > 0; });
    if (!keep.length) { keep = scored.slice(0, 3); }
    keep.sort(function (a, b) { return a.i - b.i; }).forEach(function (s) { if (len < max) { picked.push(s.l); len += s.l.length; } });
    var html = '', inList = false;
    picked.forEach(function (l) {
      var li = /^- /.test(l);
      if (li && !inList) { html += '<ul>'; inList = true; }
      if (!li && inList) { html += '</ul>'; inList = false; }
      html += li ? '<li>' + linkify(esc(l.slice(2))) + '</li>' : '<p>' + linkify(esc(l)) + '</p>';
    });
    return html + (inList ? '</ul>' : '');
  }
  function linkify(s) {
    return s.replace(/([\w.+-]+@[\w-]+\.[\w.-]+)/g, '<a href="mailto:$1">$1</a>')
      .replace(/(\+\d[\d ]{7,16}\d)/g, function (m) { return '<a class="ltr" href="tel:' + m.replace(/ /g, '') + '">' + m + '</a>'; });
  }
  var RX = {
    hello: /^\s*(hi|hello|hey|good (morning|afternoon|evening)|salam|assalam|bonjour|salut|bonsoir|مرحبا|اهلا|السلام عليكم|السلام|هلا)(?![\p{L}])/u,
    thanks: /^\s*(thanks|thank you|thx|merci|شكرا)(?![\p{L}])/u,
    price: /\b(price|prices|pricing|cost|costs|quote|quotation|how much|rate|rates|prix|tarif|tarifs|devis|combien)\b|سعر|اسعار|تكلف|(^|\s)بكم(\s|$)/,
    products: /\b(products?|trade|trading|sell|selling|commodit\w+|produits?|vendez)\b|منتج|تتاجر|تبيع/,
    contact: /\b(contact|phone|telephone|mobile|call|whatsapp|email|e-mail|mail|address|reach|get in touch|office|offices|located|location|enquiry|inquiry|enquire|telephone|adresse|bureau|joindre|contacter|coordonnees)\b|اتصال|تواصل|هاتف|جوال|بريد|عنوان|مكتب|مكاتب|استفسار/
  };
  function localAnswer(q) {
    var nq = norm(q);
    if (RX.hello.test(nq) && words(q).length <= 3) { return '<p>' + esc(t('hello')) + '</p>'; }
    if (RX.thanks.test(nq) && words(q).length <= 3) { return '<p>' + esc(t('thanks')) + '</p>'; }
    var foot = function (label, href) { return '<p class="as-src"><a href="' + esc(href) + '">' + esc(label) + '</a></p>'; };
    if (RX.price.test(nq)) { return '<p>' + esc(t('price')) + '</p>' + foot(t('enquire'), '#contact'); }
    var res = search(q);
    if (RX.contact.test(nq)) {
      var con = index.filter(function (c) { return c.section === 'contact' && c.lines.length > 3; });
      con.sort(function (a, b) { return (a.page === page ? 0 : 1) - (b.page === page ? 0 : 1); });
      var wantOther = other === 'arrahma' ? /arrahma|mauritan|nouakchott|موريتاني/.test(nq) : /bawadi|dubai|دبي|بوادي/.test(nq);
      if (wantOther) { con.reverse(); }
      if (con.length) {
        var c0 = con[0];
        var lines = c0.lines.filter(function (l) { return l && !/^\(.*\)$/.test(l); });
        var hasPhone = function (l) { return /\+\d[\d ]{7,}/.test(l); }, hasMail = function (l) { return /@/.test(l); };
        var pick;
        if (/\b(phone|telephone|mobile|call|whatsapp|number)\b|هاتف|جوال|رقم/.test(nq)) { pick = lines.filter(hasPhone); }
        else if (/\b(email|e-mail|mail|courriel)\b|بريد/.test(nq)) { pick = lines.filter(hasMail); }
        else if (/\b(address|office|offices|located|location|where|adresse|bureau|bureaux)\b|عنوان|مكتب|مكاتب|اين|مقر/.test(nq)) { pick = lines.filter(function (l) { return /:/.test(l) && !hasMail(l) && !/www\./.test(l); }); }
        else { pick = lines.slice(0, 4); }
        if (!pick.length) { pick = lines.slice(0, 4); }
        return '<p>' + esc(t('contactLead')) + '</p>' + passageHtml({ lines: pick }, q, 2000) + foot(c0.page === page ? t('enquire') : t('more') + ' ' + t('onOther', { name: NAME[c0.page] }), linkTo(c0));
      }
    }
    var general = words(q).filter(function (w) { return !LOW[w] && !/^(product|trade|trading|sell|selling|offer|commodity|commoditie|good|deal|produit|vendez|proposez|منتج|منتجات|تتاجرون|تبيعون|بضائع)$/.test(w); });
    if (RX.products.test(nq) && !general.length) {
      var secId = page === 'bawadi' ? 'products' : 'production';
      var items = index.filter(function (c) { return c.page === page && c.section === secId && c.title; });
      if (items.length > 1) {
        var list = '<ul>' + items.slice(0, 11).map(function (c) {
          var first = c.lines.filter(function (l) { return l && !/^\(.*\)$/.test(l) && !/^- /.test(l); })[0] || '';
          first = first.length > 110 ? first.slice(0, first.lastIndexOf(' ', 110)) + '…' : first;
          return '<li><strong>' + esc(c.title) + '</strong>' + (first ? ': ' + esc(first) : '') + '</li>';
        }).join('') + '</ul>';
        return list + foot(t('more'), '#' + secId);
      }
    }
    if (!res.length) { return '<p>' + linkify(esc(t('none'))) + '</p>'; }
    var top = res[0], html = '';
    if (top.c.title) { html += '<p><strong>' + esc(top.c.title) + '</strong></p>'; }
    html += passageHtml(top.c, q, 620);
    html += foot(t('more') + (top.c.page === page ? '' : ' ' + t('onOther', { name: NAME[top.c.page] })), linkTo(top.c));
    var second = res.filter(function (r) { return r.c !== top.c && r.c.title && r.c.title !== top.c.title && r.score >= top.score * 0.72; })[0];
    if (second && second.score >= top.score * 0.86) {
      html += '<p><strong>' + esc(second.c.title) + '</strong></p>' + passageHtml(second.c, q, 420) +
        foot(t('more') + (second.c.page === page ? '' : ' ' + t('onOther', { name: NAME[second.c.page] })), linkTo(second.c));
    } else if (second) { html += '<p class="as-src">' + esc(t('also')) + ': <a href="' + esc(linkTo(second.c)) + '">' + esc(second.c.title) + '</a></p>'; }
    return html;
  }

  // ---------- Replies from the AI service ----------
  function mdToHtml(text) {
    var out = '', inList = false;
    String(text).replace(/\r/g, '').split('\n').forEach(function (line) {
      var l = line.trim();
      if (!l) { if (inList) { out += '</ul>'; inList = false; } return; }
      var li = /^([-*•]|\d+[.)])\s+/.test(l);
      var body = esc(l.replace(/^([-*•]|\d+[.)])\s+/, '').replace(/^#{1,4}\s+/, ''))
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\[([^\]]+)\]\(((?:https?:\/\/|mailto:|tel:|#)[^)\s]+)\)/g, '<a href="$2">$1</a>');
      if (!/<a /.test(body)) { body = linkify(body); }
      if (li) { if (!inList) { out += '<ul>'; inList = true; } out += '<li>' + body + '</li>'; }
      else { if (inList) { out += '</ul>'; inList = false; } out += '<p>' + body + '</p>'; }
    });
    return out + (inList ? '</ul>' : '');
  }
  var history = [];   // [{role, content}] as plain text, for the AI service
  function askService(q) {
    var ctrl = 'AbortController' in window ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) { ctrl.abort(); } }, 45000);
    return fetch(API, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: ctrl ? ctrl.signal : undefined,
      body: JSON.stringify({ messages: history.slice(-12), lang: lang(), page: page })
    }).then(function (r) {
      clearTimeout(timer);
      return r.text().then(function (body) {
        var data = null; try { data = JSON.parse(body); } catch (e) {}
        if (r.status === 429) { return { busy: true }; }
        if (!r.ok || !data || typeof data.reply !== 'string' || !data.reply.trim()) { return { off: true, temporary: r.status >= 500 && r.status !== 503 }; }
        return { reply: data.reply };
      });
    }).catch(function () { clearTimeout(timer); return { off: true, temporary: true }; });
  }

  // ---------- Panel ----------
  var root = document.createElement('div');
  root.className = 'as-root';
  var mark = base + (page === 'arrahma' ? 'assets/img/logos/arrahma-seal-160.png' : 'assets/img/logos/bawadi-mark.png');
  root.innerHTML =
    '<button type="button" class="as-fab" aria-expanded="false" aria-controls="as-panel">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H11l-4.6 3.7A.9.9 0 0 1 5 19v-3.1A2.5 2.5 0 0 1 4 13.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8.5 8.5h7M8.5 11.5h4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' +
      '<span class="as-fab-label"></span></button>' +
    '<section id="as-panel" class="as-panel" role="dialog" aria-modal="false" hidden>' +
      '<header class="as-head"><span class="as-avatar"><img src="' + mark + '" alt="" width="40" height="40"></span>' +
        '<span class="as-id"><strong></strong><small></small></span>' +
        '<button type="button" class="as-close"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button></header>' +
      '<div class="as-log" role="log" aria-live="polite" tabindex="0"></div>' +
      '<div class="as-chips"></div>' +
      '<form class="as-form" novalidate><textarea rows="1" maxlength="600"></textarea>' +
        '<button type="submit"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12h13M12.5 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button></form>' +
      '<p class="as-note"></p>' +
    '</section>';
  document.body.appendChild(root);
  var $ = function (s) { return root.querySelector(s); };
  var fab = $('.as-fab'), panel = $('.as-panel'), log = $('.as-log'), chips = $('.as-chips'), form = $('.as-form'), input = $('textarea');
  var hello = null, busy = false;

  function add(role, html) {
    var b = document.createElement('div');
    b.className = 'as-msg as-' + role;
    b.innerHTML = html;
    log.appendChild(b);
    log.scrollTop = log.scrollHeight;
    return b;
  }
  function wording() {
    // A page may name its assistant (translation key "as.open"); otherwise the general wording is used
    var label = (window.siteLang && window.siteLang.t('as.open')) || t('open');
    $('.as-fab-label').textContent = label;
    fab.setAttribute('aria-label', label);
    panel.setAttribute('aria-label', t('title'));
    $('.as-id strong').textContent = t('title');
    $('.as-id small').textContent = t('sub');
    $('.as-close').setAttribute('aria-label', t('close'));
    input.placeholder = t('ph'); input.setAttribute('aria-label', t('ph'));
    form.querySelector('button').setAttribute('aria-label', t('send'));
    $('.as-note').textContent = t('note');
    if (hello) { hello.innerHTML = '<p>' + esc(t('hello')) + '</p>'; }
    chips.innerHTML = '';
    t('chips').forEach(function (c) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = c;
      b.addEventListener('click', function () { ask(c); });
      chips.appendChild(b);
    });
  }
  function setOpen(open) {
    panel.hidden = !open;
    root.classList.toggle('is-open', open);
    fab.setAttribute('aria-expanded', String(open));
    if (open) {
      if (!hello) { hello = add('bot', '<p>' + esc(t('hello')) + '</p>'); }
      if (window.matchMedia('(min-width: 700px)').matches) { input.focus(); }
    }
  }
  function ask(q) {
    q = String(q || '').replace(/\s+/g, ' ').trim().slice(0, 600);
    if (!q || busy) { return; }
    busy = true; root.classList.add('is-busy');
    chips.hidden = true;
    add('user', '<p>' + esc(q) + '</p>');
    history.push({ role: 'user', content: q });
    input.value = ''; grow();
    var wait = add('bot as-typing', '<span class="sr-only">' + esc(t('typing')) + '</span><i></i><i></i><i></i>');
    reply(q).then(function (r) {
      wait.remove();
      var b = add('bot', r.html);
      busy = false; root.classList.remove('is-busy');
      // links to a section of this page close the panel on small screens
      [].forEach.call(b.querySelectorAll('a[href^="#"]'), function (a) { a.addEventListener('click', function () { if (window.innerWidth < 700) { setOpen(false); } }); });
    });
  }
  // Answers a question that is already the last entry of the conversation: the AI service when it is
  // available, the built-in answers otherwise. Resolves { html } and keeps the conversation history.
  function reply(q) {
    var local = function () {
      return new Promise(function (res) { setTimeout(function () { res({ html: localAnswer(q) }); }, 350); });
    };
    var first = !canAsk ? local() : askService(q).then(function (r) {
      if (r.reply) { return { html: mdToHtml(r.reply), plain: r.reply }; }
      if (r.busy) { return { html: '<p>' + esc(t('busy')) + '</p>', busy: true }; }
      if (!r.temporary) { canAsk = false; try { sessionStorage.setItem('as-local', '1'); } catch (e) {} }
      return local();
    });
    return first.then(function (r) {
      if (r.busy) { history.pop(); return r; }
      if (!r.plain) { var d = document.createElement('div'); d.innerHTML = r.html; r.plain = d.textContent; }
      history.push({ role: 'assistant', content: r.plain });
      return r;
    });
  }
  // For a page's own chat box (design 3's terminal): same answers, same conversation, no panel
  function respond(q) {
    q = String(q || '').replace(/\s+/g, ' ').trim().slice(0, 600);
    if (!q) { return Promise.resolve({ html: '' }); }
    history.push({ role: 'user', content: q });
    return reply(q);
  }
  function grow() { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 120) + 'px'; }

  fab.addEventListener('click', function () { setOpen(panel.hidden); });
  $('.as-close').addEventListener('click', function () { setOpen(false); fab.focus(); });
  form.addEventListener('submit', function (e) { e.preventDefault(); ask(input.value); });
  input.addEventListener('input', grow);
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); ask(input.value); } });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden && root.contains(document.activeElement)) { setOpen(false); fab.focus(); } });
  document.addEventListener('langchange', function () { wording(); buildIndex(); });

  wording();
  buildIndex();
  // For checks from the console: siteAssistant.answer('question') returns the built-in answer as HTML
  window.siteAssistant = { open: function () { setOpen(true); }, ask: ask, answer: localAnswer, respond: respond };
  if (/[?&]assistant=open\b/.test(location.search)) { setOpen(true); }
})();
