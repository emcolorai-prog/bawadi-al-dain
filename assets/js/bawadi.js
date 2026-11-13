// Bawadi Al Dain page: behaviour for the parts of the design that move or respond.
//   - headings: the last words of a heading are set in the accent colour
//   - trade board: split-flap letters; selecting a row asks the assistant about that commodity
//   - journey: a scroll-through scene on wide screens (a plain list everywhere else)
//   - key figures count up when they come into view
//   - a small drawing of the group's network beside "Regional expansion"
//   - AI terminal: the assistant inside the page, with a draft enquiry that fills in as you chat
// Everything degrades to plain, readable content without this file.
(function () {
  var body = document.body;
  if (!body.classList.contains('d3')) { return; }
  var L = window.siteLang;
  var t = function (k, v) { return L ? L.t(k, v) : ''; };
  var lang = function () { return document.documentElement.getAttribute('lang') || 'en'; };
  var rtl = function () { return document.documentElement.getAttribute('dir') === 'rtl'; };
  var qs = function (s, r) { return (r || document).querySelector(s); };
  var qsa = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var plain = function (html) { var d = document.createElement('div'); d.innerHTML = html; return d.textContent.replace(/\s+/g, ' ').trim(); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var lerp = function (a, b, x) { return a + (b - a) * x; };
  var ease = function (x) { return x * x * (3 - 2 * x); };
  var onLang = [];
  document.addEventListener('langchange', function () { onLang.forEach(function (f) { f(); }); });
  var seen = function (el, fn, margin) {
    if (!('IntersectionObserver' in window)) { fn(); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); fn(); } }); }, { rootMargin: margin || '0px 0px -12% 0px' });
    io.observe(el);
  };

  // ---------- Headings: accent words, and a script lead-in ----------
  function leafOf(h) {
    var el = h;
    while (el.children.length === 1 && !el.firstElementChild.children.length && el.textContent.trim() === el.firstElementChild.textContent.trim()) { el = el.firstElementChild; }
    return el.children.length ? null : el;
  }
  function count(h, name) { return +(h.getAttribute(name + '-' + lang()) || h.getAttribute(name)) || 0; }
  function headings() {
    qsa('[data-accent]').forEach(function (h) {
      var el = leafOf(h), n = count(h, 'data-accent');
      if (!el || !n) { return; }
      var w = el.textContent.trim().split(/\s+/);
      if (w.length <= n) { return; }
      el.innerHTML = esc(w.slice(0, -n).join(' ')) + ' <em>' + esc(w.slice(-n).join(' ')) + '</em>';
    });
    qsa('[data-script]').forEach(function (h) {
      var el = leafOf(h), n = count(h, 'data-script');
      if (!el || !n) { return; }
      var w = el.textContent.trim().split(/\s+/);
      if (w.length <= n) { return; }
      el.innerHTML = '<span class="t3-script">' + esc(w.slice(0, -n).join(' ')) + '</span> ' + esc(w.slice(-n).join(' '));
    });
  }
  headings();
  onLang.push(headings);

  // ---------- Trade board ----------
  var board = qs('[data-t3-board]');
  var askTerminal = function (q) { if (window.siteAssistant) { window.siteAssistant.open(); window.siteAssistant.ask(q); } };   // replaced below when the terminal exists
  if (board) {
    var GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·', flapTimer = null, shown = false;
    var cells = function () { return qsa('tbody th button, tbody td', board); };
    var build = function (fresh) {
      var whole = lang() === 'ar' || window.innerWidth < 760;   // Arabic letters join up, so the whole word sits on one flap
      cells().forEach(function (c) {
        if (fresh || !c.hasAttribute('data-text')) { c.setAttribute('data-text', c.textContent.replace(/\s+/g, ' ').trim()); }
        var text = c.getAttribute('data-text');
        var flaps = whole ? '<i class="fl w">' + esc(text) + '</i>'
          : text.toUpperCase().split('').map(function (ch) { return ch === ' ' ? '<i class="fl sp"></i>' : '<i class="fl" data-c="' + esc(ch) + '">' + esc(ch) + '</i>'; }).join('');
        c.innerHTML = '<span class="sr-only">' + esc(text) + '</span><span class="fls" aria-hidden="true">' + flaps + '</span>';
      });
      if (shown) { flap(); }
    };
    var flap = function () {
      clearInterval(flapTimer);
      var tiles = qsa('.fl[data-c]', board);
      if (reduce || !tiles.length) { return; }
      var rows = qsa('tbody tr', board);
      tiles.forEach(function (el) {
        var row = rows.indexOf(el.closest('tr')), col = [].indexOf.call(el.parentNode.children, el);
        el._left = 4 + row * 2 + Math.floor(col / 2) + Math.floor(Math.random() * 5);
      });
      flapTimer = setInterval(function () {
        var busy = false;
        tiles.forEach(function (el) {
          if (el._left > 0) {
            el._left--; busy = true;
            el.textContent = el._left ? GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length)) : el.getAttribute('data-c');
            el.classList.remove('tick'); void el.offsetWidth; el.classList.add('tick');
          }
        });
        if (!busy) { clearInterval(flapTimer); }
      }, 60);
    };
    build(true);
    seen(board, function () { shown = true; flap(); });
    onLang.push(function () { build(true); });
    var narrow = window.innerWidth < 760;
    window.addEventListener('resize', function () { var n = window.innerWidth < 760; if (n !== narrow) { narrow = n; build(false); } });
    board.addEventListener('click', function (e) {
      var tr = e.target.closest && e.target.closest('tbody tr');
      if (!tr) { return; }
      askTerminal(t('t3.q.about', { x: qs('th button', tr).getAttribute('data-text') }), true);
    });
  }

  // ---------- Journey ----------
  var J = qs('[data-t3-journey]');
  if (J) {
    var track = qs('.t3-j-track', J), items = qsa('.t3-j-item', J), figs = items.map(function (i) { return qs('.t3-j-img', i); });
    var navs = qsa('.t3-j-nav button', J), n = items.length, live = false, queued = false;
    track.style.setProperty('--steps', n - 1);
    var frame = function () {
      queued = false;
      if (!live) { return; }
      var vh = window.innerHeight, vw = document.documentElement.clientWidth;
      var travel = track.offsetHeight - vh;
      var f = clamp(-track.getBoundingClientRect().top / travel, 0, 1) * (n - 1);
      var w = figs[0].offsetWidth, h = figs[0].offsetHeight, cy = vh * 0.5, flip = rtl();
      var cx = function (i) { return (i % 2 ? 0.6 : 0.42) * vw; };
      figs.forEach(function (fig, i) {
        var d = f - i, x, y = cy, s, o, z;
        if (d < -1.3 || d > 1) { fig.style.opacity = 0; fig.style.visibility = 'hidden'; return; }
        if (d <= 0) {
          // waiting beside the current photograph, then growing into its place
          var e = ease(clamp(d + 1, 0, 1));
          var peek = cx(i - 1) + (i % 2 ? 1 : -1) * w * 0.6;
          x = i ? lerp(peek, cx(i), e) : cx(i);
          y = lerp(cy + vh * 0.03, cy, e);
          s = i ? lerp(0.3, 1, e) : 1;
          o = d < -1 ? clamp((d + 1.3) / 0.3, 0, 1) : 1;
          z = d > -0.5 ? 3 : 2;
        } else {
          // flying past the viewer
          s = lerp(1, 2.5, d * d * 0.85 + d * 0.15);
          x = cx(i) + (i % 2 ? 1 : -1) * vw * 0.34 * d;
          o = 1 - clamp((d - 0.12) / 0.5, 0, 1);
          z = 4;
        }
        if (flip) { x = vw - x; }
        fig.style.visibility = 'visible';
        fig.style.opacity = o.toFixed(3);
        fig.style.zIndex = z;
        fig.style.transform = 'translate3d(' + (x - w / 2).toFixed(1) + 'px,' + (y - h / 2).toFixed(1) + 'px,0) scale(' + s.toFixed(4) + ')';
      });
      var on = Math.round(f);
      items.forEach(function (it, i) { it.classList.toggle('is-on', i === on); });
      navs.forEach(function (b, i) { b.classList.toggle('is-on', i === on); if (i === on) { b.setAttribute('aria-current', 'step'); } else { b.removeAttribute('aria-current'); } });
    };
    var queue = function () { if (!queued) { queued = true; requestAnimationFrame(frame); } };
    var mode = function () {
      var want = !reduce && window.innerWidth >= 1000 && window.innerHeight >= 600;
      if (want !== live) {
        live = want;
        J.classList.toggle('is-live', live);
        if (!live) { figs.forEach(function (fig) { fig.style.cssText = ''; }); items.forEach(function (it) { it.classList.remove('is-on'); }); }
      }
      queue();
    };
    navs.forEach(function (b, i) {
      b.addEventListener('click', function () {
        var top = window.scrollY + track.getBoundingClientRect().top + (i / (n - 1)) * (track.offsetHeight - window.innerHeight);
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', mode);
    window.addEventListener('load', mode);
    onLang.push(queue);
    mode();
  }

  // ---------- Key figures count up ----------
  qsa('.facts:not(.bw-facts-sm) .fact b, [data-count]').forEach(function (b) {
    if (reduce) { return; }
    var raf = 0;
    seen(b, function () {
      var m = b.textContent.match(/^(\D*?)(\d(?:[\d,.\u00A0\u202F ]*\d)?)(.*)$/);
      if (!m) { return; }
      var target = parseInt(m[2].replace(/\D/g, ''), 10), sep = (m[2].match(/\D/) || [''])[0], t0 = 0;
      if (!(target > 9)) { return; }
      var group = function (v) { return sep ? String(v).replace(/\B(?=(\d{3})+$)/g, sep) : String(v); };
      var step = function (now) {
        t0 = t0 || now;
        var p = clamp((now - t0) / 1300, 0, 1), v = Math.round(target * (0.72 + 0.28 * (1 - Math.pow(1 - p, 3))));
        b.textContent = m[1] + group(v) + m[3];
        if (p < 1) { raf = requestAnimationFrame(step); }
      };
      raf = requestAnimationFrame(step);
    });
    onLang.push(function () { cancelAnimationFrame(raf); });
  });

  // ---------- Network drawing beside "Regional expansion" ----------
  var names = qs('.t3-net-names'), head = names && qs('.section-head', names.parentNode);
  if (names && head) {
    // [longitude, latitude] of each point; the hub is Dubai
    var P = { dubai: [55.3, 25.2], sudan: [32.5, 15.6], mauritania: [-15.9, 18.1], kenya: [36.8, -1.3], somaliland: [44.1, 9.6], erbil: [44.0, 36.2] };
    var net = document.createElement('div');
    net.className = 't3-net';
    net.setAttribute('aria-hidden', 'true');
    head.appendChild(net);
    var draw = function () {
      var xy = function (k) { return [(P[k][0] + 24) / 86 * 400 + 40, (44 - P[k][1]) / 52 * 250 + 30]; };
      var hub = xy('dubai'), svg = '<svg viewBox="0 0 480 320" role="presentation" focusable="false">';
      [150, 112, 74].forEach(function (r) { svg += '<circle class="ring" cx="240" cy="160" r="' + r + '"/>'; });
      Object.keys(P).forEach(function (k) {
        if (k === 'dubai') { return; }
        var p = xy(k), mx = (p[0] + hub[0]) / 2, my = Math.min(p[1], hub[1]) - Math.abs(hub[0] - p[0]) * 0.22 - 14;
        svg += '<path class="arc" d="M' + hub[0].toFixed(1) + ' ' + hub[1].toFixed(1) + ' Q' + mx.toFixed(1) + ' ' + my.toFixed(1) + ' ' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + '"/>';
      });
      Object.keys(P).forEach(function (k) {
        var p = xy(k), isHub = k === 'dubai', li = qs('[data-p="' + k + '"]', names), label = li ? li.textContent.trim() : '';
        var left = k === 'sudan' || k === 'mauritania', dev = k === 'kenya' || k === 'somaliland';
        if (isHub) { svg += '<circle class="pulse" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="7"/>'; }
        svg += '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="' + (isHub ? 7 : 4.2) + '" fill="' + (isHub || dev ? 'var(--lime)' : '#fff') + '"/>';
        svg += '<text x="' + (p[0] + (left ? -11 : 12)).toFixed(1) + '" y="' + (p[1] + (k === 'erbil' ? -9 : left ? 18 : 4)).toFixed(1) + '" text-anchor="' + (left !== rtl() ? 'end' : 'start') + '" direction="' + (rtl() ? 'rtl' : 'ltr') + '">' + esc(label) + '</text>';
      });
      net.innerHTML = svg + '</svg>';
    };
    draw();
    onLang.push(draw);
  }

  // ---------- AI terminal and the draft enquiry ----------
  var term = qs('[data-t3-term]');
  if (term) {
    var log = qs('.t3-term-log', term), form = qs('.t3-term-form', term), input = qs('input', form), busy = false;
    var draft = { product: null, qty: '', dest: '' };
    var KINDS = [
      [/gum\s*arabic|hashab|صمغ\s*(ال)?عربي|الصمغ\s*العربي|هشاب/i, 'p1'], [/talha|طلح/i, 'p2'], [/sorghum|ذرة/i, 'p3'],
      [/camel|إبل|ابل|جمال/i, 'ln.2h', 1], [/cattle|cows?\b|bulls?\b|calves|أبقار|ابقار|بقر|عجول/i, 't3.m.cattle', 1], [/sheep|goats?\b|أغنام|اغنام|خراف|ضأن|ماعز/i, 't3.m.sheep', 1],
      [/livestock|ماشية|مواشي/i, 'p4'], [/peanut|groundnut|فول\s*سوداني/i, 'cr.1b'], [/sesame|سمسم/i, 'cr.5b'],
      [/sunflower|زهرة\s*الشمس|عباد\s*الشمس/i, 't3.m.sunflower'], [/hibiscus|كركدي/i, 't3.m.hibiscus'], [/baobab|تبلدي/i, 't3.m.baobab']
    ];
    var productText = function () {
      if (!draft.product) { return ''; }
      var name = plain(t(draft.product[1]));
      return draft.product[2] ? plain(t('t3.d.live')) + ' – ' + name : name;
    };
    var render = function () {
      var v = { product: productText(), qty: draft.qty, dest: draft.dest };
      Object.keys(v).forEach(function (k) { var dd = qs('[data-f="' + k + '"]', term); dd.textContent = v[k] || '—'; dd.setAttribute('dir', 'auto'); });
      var lines = [plain(t('t3.d.intro'))];
      [['product', 't3.d.product'], ['qty', 't3.d.qty'], ['dest', 't3.d.dest']].forEach(function (r) { lines.push(plain(t(r[1])) + ': ' + (v[r[0]] || '—')); });
      qs('.t3-wa', term).href = 'https://wa.me/' + term.getAttribute('data-wa') + '?text=' + encodeURIComponent(lines.join('\n'));
      qs('.t3-mail', term).href = 'mailto:' + term.getAttribute('data-mail') + '?subject=' + encodeURIComponent(lines[0]) + '&body=' + encodeURIComponent(lines.slice(1).join('\n'));
    };
    var note = function (q) {
      for (var i = 0; i < KINDS.length; i++) {
        // a new product starts a new draft: the earlier quantity and destination no longer apply
        if (KINDS[i][0].test(q)) { if (draft.product !== KINDS[i]) { draft.qty = ''; draft.dest = ''; } draft.product = KINDS[i]; break; }
      }
      var m = q.match(/(\d[\d.,]*)\s*(mt|metric\s*tons?|tons?|tonnes?|kg|containers?|fcl|head|bags?|sacks?|طن|حاوية|حاويات|رأس|راس|كيس)/i);
      if (m) { draft.qty = m[1] + ' ' + (/^(mt|kg|fcl)$/i.test(m[2]) ? m[2].toUpperCase() : m[2].toLowerCase()); }
      var d = q.match(/\b(?:cif|cfr|fob|cnf)\s+([\p{L}][\p{L}'’-]+)/iu) || q.match(/\b(?:to|in|for)\s+(\p{Lu}[\p{L}'’-]+(?:\s+\p{Lu}[\p{L}'’-]+)?)/u) || q.match(/(?:إلى|الى)\s+([\p{L}]+(?:\s+ال[\p{L}]+)?)/u);
      if (d) { draft.dest = d[1]; }
      render();
    };
    var add = function (cls, html) {
      var b = document.createElement('div');
      b.className = 't3-msg ' + cls;
      b.innerHTML = html;
      log.appendChild(b);
      log.scrollTop = log.scrollHeight;
      return b;
    };
    askTerminal = function (q, bring) {
      q = String(q || '').replace(/\s+/g, ' ').trim().slice(0, 600);
      if (!q || busy) { return; }
      if (bring) { term.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); }
      busy = true; term.classList.add('is-busy');
      add('user', '<p>' + esc(q) + '</p>');
      note(q);
      input.value = '';
      var wait = add('bot typing', '<i></i><i></i><i></i>');
      var A = window.siteAssistant;
      (A && A.respond ? A.respond(q) : Promise.resolve({ html: '' })).then(function (r) {
        wait.remove();
        if (r && r.html) { add('bot', r.html); }
        busy = false; term.classList.remove('is-busy');
      });
    };
    form.addEventListener('submit', function (e) { e.preventDefault(); askTerminal(input.value); });
    qsa('.t3-term-chips button', term).forEach(function (b) { b.addEventListener('click', function () { askTerminal(b.textContent); }); });
    render();
    onLang.push(render);
  }
  // The question box in the hero: asks in the terminal (or in the assistant panel on pages without one)
  qsa('[data-t3-ask]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var inp = qs('input', f), q = inp.value.trim() || (plain(inp.getAttribute('placeholder')).match(/[“«"]([^”»"]+)[”»"]/) || [])[1] || '';
      inp.value = '';
      askTerminal(q, true);
    });
  });
})();
