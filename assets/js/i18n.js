// Language support shared by the company websites (English, Arabic, French).
//
// Markup:  <html lang="en" data-langs="en,ar,fr">   languages this page offers; lang= is the language written in the HTML
//          <h1 data-i18n="hero.title">Text in the page's default language</h1>
//          <img data-i18n-alt="hero.alt" alt="...">
//          <meta name="description" data-i18n-content="_desc" content="...">
//          <div class="lang-switch" data-lang-switch><button type="button" data-lang="en">EN</button>…</div>
//          <a href="../arrahma/" data-keep-lang>…</a>   (carries the visitor's language to another page)
// Each page defines window.I18N = { ar: {...}, fr: {...} } before this file loads.
// Text already in the HTML is captured as the default language, so a page
// dictionary only needs the other languages.
(function () {
  var html = document.documentElement;
  var base = html.getAttribute('lang') || 'en';
  var langs = (html.getAttribute('data-langs') || 'en,ar').split(',').map(function (s) { return s.trim(); });
  var RTL = { ar: true };
  var dict = window.I18N || {};
  langs.forEach(function (l) { dict[l] = dict[l] || {}; });
  var STORE = 'site-lang';
  var supported = function (l) { return langs.indexOf(l) > -1; };

  // Interface wording shared by every page (forms, menus, switchers)
  var UI = {
    en: {
      'ui.skip': 'Skip to content', 'ui.menu': 'Menu', 'ui.menuClose': 'Close menu',
      'ui.langs': 'Language', 'ui.companies': 'Our companies', 'ui.explore': 'Explore our companies',
      'ui.subjectLbl': 'Subject', 'ui.name': 'Full name', 'ui.company': 'Company', 'ui.email': 'Email', 'ui.phone': 'Phone', 'ui.message': 'Your enquiry',
      'ui.optional': '(optional)', 'ui.required': 'required',
      'ui.preview': 'Preview only: your enquiry was checked but not sent. On the live website it will be delivered to {email}.',
      'ui.send': 'Send enquiry', 'ui.sending': 'Sending…',
      'ui.formNote': 'Your enquiry is emailed directly to the company. Your details are used only to reply to you.',
      'ui.sent': 'Thank you, {name}. Your enquiry has been sent to {company}. The team will reply to {email}.',
      'ui.fail': 'Sorry, your enquiry could not be sent just now. Please try again in a moment, or email it directly to {link}.',
      'ui.err.required': 'Please fill in this field.', 'ui.err.email': 'Please enter a valid email address, for example name@company.com.',
      'ui.err.short': 'Please write at least 10 characters so we can understand your enquiry.',
      'ui.err.summary': 'Please correct the highlighted fields.',
      'ui.ok': 'Your email app should now open with your message to {email}. If it does not, please write to us directly at {link}.',
      'ui.subject': 'Website enquiry from {name}',
      'ui.galShow': 'Show', 'ui.galAll': 'All', 'ui.galPhotos': 'Photos', 'ui.galVideos': 'Videos',
      'ui.galClose': 'Close', 'ui.galPrev': 'Previous', 'ui.galNext': 'Next', 'ui.galPlay': 'Play video', 'ui.galView': 'View photo'
    },
    ar: {
      'ui.skip': 'الانتقال إلى المحتوى', 'ui.menu': 'القائمة', 'ui.menuClose': 'إغلاق القائمة',
      'ui.langs': 'اللغة', 'ui.companies': 'شركاتنا', 'ui.explore': 'تعرّف على شركاتنا',
      'ui.subjectLbl': 'الموضوع', 'ui.name': 'الاسم الكامل', 'ui.company': 'الشركة', 'ui.email': 'البريد الإلكتروني', 'ui.phone': 'رقم الهاتف', 'ui.message': 'استفسارك',
      'ui.optional': '(اختياري)', 'ui.required': 'مطلوب',
      'ui.preview': 'نسخة للمراجعة فقط: تم التحقق من استفسارك لكنه لم يُرسل. على الموقع الرسمي سيصل إلى {email}.',
      'ui.send': 'إرسال الاستفسار', 'ui.sending': 'جارٍ الإرسال…',
      'ui.formNote': 'يُرسل استفسارك مباشرة إلى بريد الشركة، ولا تُستخدم بياناتك إلا للرد عليك.',
      'ui.sent': 'شكرًا لك يا {name}. تم إرسال استفسارك إلى {company}، وسيرد الفريق على {email}.',
      'ui.fail': 'عذرًا، تعذّر إرسال استفسارك الآن. يرجى المحاولة بعد قليل، أو إرساله مباشرة إلى {link}.',
      'ui.err.required': 'يرجى تعبئة هذا الحقل.', 'ui.err.email': 'يرجى إدخال بريد إلكتروني صحيح، مثل name@company.com.',
      'ui.err.short': 'يرجى كتابة 10 أحرف على الأقل لنتمكن من فهم استفسارك.',
      'ui.err.summary': 'يرجى تصحيح الحقول المحددة.',
      'ui.ok': 'من المفترض أن يفتح تطبيق البريد الآن وفيه رسالتك إلى {email}. إذا لم يحدث ذلك، يرجى مراسلتنا مباشرة على {link}.',
      'ui.subject': 'استفسار من الموقع الإلكتروني — {name}',
      'ui.galShow': 'عرض', 'ui.galAll': 'الكل', 'ui.galPhotos': 'الصور', 'ui.galVideos': 'الفيديو',
      'ui.galClose': 'إغلاق', 'ui.galPrev': 'السابق', 'ui.galNext': 'التالي', 'ui.galPlay': 'تشغيل الفيديو', 'ui.galView': 'عرض الصورة'
    },
    fr: {
      'ui.skip': 'Aller au contenu', 'ui.menu': 'Menu', 'ui.menuClose': 'Fermer le menu',
      'ui.langs': 'Langue', 'ui.companies': 'Nos sociétés', 'ui.explore': 'Découvrez nos sociétés',
      'ui.subjectLbl': 'Objet', 'ui.name': 'Nom complet', 'ui.company': 'Société', 'ui.email': 'E-mail', 'ui.phone': 'Téléphone', 'ui.message': 'Votre demande',
      'ui.optional': '(facultatif)', 'ui.required': 'obligatoire',
      'ui.preview': 'Aperçu uniquement : votre demande a été vérifiée mais n’a pas été envoyée. Sur le site en ligne, elle sera transmise à {email}.',
      'ui.send': 'Envoyer la demande', 'ui.sending': 'Envoi en cours…',
      'ui.formNote': 'Votre demande est envoyée directement par e-mail à la société. Vos coordonnées servent uniquement à vous répondre.',
      'ui.sent': 'Merci, {name}. Votre demande a été envoyée à {company}. L’équipe vous répondra à l’adresse {email}.',
      'ui.fail': 'Désolé, votre demande n’a pas pu être envoyée pour le moment. Veuillez réessayer dans un instant, ou l’envoyer directement à {link}.',
      'ui.err.required': 'Veuillez remplir ce champ.', 'ui.err.email': 'Veuillez saisir une adresse e-mail valide, par exemple nom@societe.com.',
      'ui.err.short': 'Veuillez écrire au moins 10 caractères afin que nous puissions comprendre votre demande.',
      'ui.err.summary': 'Veuillez corriger les champs signalés.',
      'ui.ok': 'Votre messagerie devrait s’ouvrir avec votre message à {email}. Si ce n’est pas le cas, écrivez-nous directement à {link}.',
      'ui.subject': 'Demande via le site web — {name}',
      'ui.galShow': 'Afficher', 'ui.galAll': 'Tout', 'ui.galPhotos': 'Photos', 'ui.galVideos': 'Vidéos',
      'ui.galClose': 'Fermer', 'ui.galPrev': 'Précédent', 'ui.galNext': 'Suivant', 'ui.galPlay': 'Lire la vidéo', 'ui.galView': 'Voir la photo'
    }
  };
  langs.forEach(function (l) {
    var ui = UI[l] || {};
    Object.keys(ui).forEach(function (k) { if (!(k in dict[l])) { dict[l][k] = ui[k]; } });
  });

  var textNodes = [].slice.call(document.querySelectorAll('[data-i18n]'));
  var attrNames = ['alt', 'aria-label', 'placeholder', 'title', 'content'];
  var attrNodes = {};
  attrNames.forEach(function (a) { attrNodes[a] = [].slice.call(document.querySelectorAll('[data-i18n-' + a + ']')); });

  // Capture the default-language text that is already in the page
  textNodes.forEach(function (n) {
    var k = n.getAttribute('data-i18n');
    if (!(k in dict[base])) { dict[base][k] = n.innerHTML; }
  });
  attrNames.forEach(function (a) {
    attrNodes[a].forEach(function (n) {
      var k = n.getAttribute('data-i18n-' + a);
      if (!(k in dict[base])) { dict[base][k] = n.getAttribute(a) || ''; }
    });
  });
  if (!('_title' in dict[base])) { dict[base]._title = document.title; }

  // Report untranslated keys to the browser console, so no language is left half-done
  langs.forEach(function (l) {
    if (l === base) { return; }
    var missing = Object.keys(dict[base]).filter(function (k) { return !(k in dict[l]); });
    if (missing.length && window.console) { console.warn('[i18n] ' + l + ': missing ' + missing.join(', ')); }
  });

  var current = base;
  var pref = null;   // the language the visitor chose, carried to the other company websites

  function t(key, vars) {
    var s = (key in dict[current]) ? dict[current][key] : dict[base][key];
    if (s == null) { return ''; }
    if (vars) { Object.keys(vars).forEach(function (v) { s = s.split('{' + v + '}').join(vars[v]); }); }
    return s;
  }

  // Find the section the reader is looking at, so a language switch keeps their place
  function anchorPoint() {
    var items = document.querySelectorAll('main [id], footer');
    for (var i = 0; i < items.length; i++) {
      var r = items[i].getBoundingClientRect();
      if (r.bottom > 80) { return { el: items[i], top: r.top }; }
    }
    return null;
  }

  function remember(l) {
    pref = l;
    try { localStorage.setItem(STORE, l); } catch (e) {}
  }

  function apply(lang, keepPlace) {
    var spot = keepPlace && window.scrollY > 40 ? anchorPoint() : null;
    current = supported(lang) ? lang : base;
    html.setAttribute('lang', current);
    html.setAttribute('dir', RTL[current] ? 'rtl' : 'ltr');
    textNodes.forEach(function (n) { n.innerHTML = t(n.getAttribute('data-i18n')); });
    attrNames.forEach(function (a) {
      attrNodes[a].forEach(function (n) { n.setAttribute(a, t(n.getAttribute('data-i18n-' + a))); });
    });
    document.title = t('_title') || document.title;
    document.querySelectorAll('[data-lang-switch] [data-lang]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === current));
    });
    // Links to the other websites carry the visitor's chosen language. A site that does
    // not offer it (French on Bawadi) falls back to English by itself.
    var carry = pref || current;
    document.querySelectorAll('a[data-keep-lang]').forEach(function (a) {
      // Keep the page and any #section, replace only the language
      if (!a.hasAttribute('data-href')) { a.setAttribute('data-href', a.getAttribute('href')); }
      var m = a.getAttribute('data-href').match(/^([^?#]*)(?:\?[^#]*)?(#.*)?$/);
      var path = m[1];
      // Clean folder links (arrahma/) work on the web host; when the files are opened
      // directly from a computer, point them at the folder's index.html instead
      if (location.protocol === 'file:' && /\/$/.test(path)) { path += 'index.html'; }
      a.setAttribute('href', path + '?lang=' + carry + (m[2] || ''));
    });
    try {
      var u = new URL(location.href);
      // Only show ?lang= in the address when it differs from the page default or was already there
      if ((u.searchParams.has('lang') || current !== base) && u.searchParams.get('lang') !== current) {
        u.searchParams.set('lang', current); history.replaceState(null, '', u);
      }
    } catch (e) {}
    if (spot) {
      var r = spot.el.getBoundingClientRect();
      var prev = html.style.scrollBehavior;
      html.style.scrollBehavior = 'auto';
      window.scrollBy(0, r.top - spot.top);
      html.style.scrollBehavior = prev;
    }
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: current } }));
  }

  // Start: ?lang= in the address, then the visitor's saved choice, then the page default
  var q = null, saved = null;
  try { q = new URLSearchParams(location.search).get('lang'); } catch (e) {}
  try { saved = localStorage.getItem(STORE); } catch (e) {}   // storage may be blocked
  if (/^(en|ar|fr)$/.test(q || '')) { remember(q); } else if (/^(en|ar|fr)$/.test(saved || '')) { pref = saved; }
  var start = supported(q) ? q : supported(saved) ? saved : base;

  document.querySelectorAll('[data-lang-switch] [data-lang]').forEach(function (b) {
    b.addEventListener('click', function () {
      var l = b.getAttribute('data-lang');
      remember(l);
      apply(l, true);
    });
  });

  window.siteLang = { get: function () { return current; }, set: function (l) { remember(l); apply(l, true); }, t: t };
  apply(start, false);
})();
