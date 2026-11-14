// Arrahma page: behaviour for every interactive part. One scroll loop drives everything that follows the
// scroll, and it only does work for parts that are near the screen. Transforms and opacity only.
(function () {
  var qs = function (s, r) { return (r || document).querySelector(s); };
  var qsa = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var ease = function (x) { return x * x * (3 - 2 * x); };
  var lang = function () { return document.documentElement.getAttribute('lang') || 'en'; };
  var rtl = function () { return document.documentElement.getAttribute('dir') === 'rtl'; };
  var T = function (k, v) { return window.siteLang ? window.siteLang.t(k, v) : ''; };
  var plain = function (h) { var d = document.createElement('div'); d.innerHTML = h; return d.textContent.replace(/\s+/g, ' ').trim(); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var onLang = [];
  document.addEventListener('langchange', function () { onLang.forEach(function (f) { f(); }); });
  var progressOf = function (el) { var r = el.getBoundingClientRect(), span = el.offsetHeight - window.innerHeight; return span > 0 ? clamp(-r.top / span, 0, 1) : (r.top < 0 ? 1 : 0); };
  var near = function (el) { var r = el.getBoundingClientRect(); return r.bottom > -100 && r.top < window.innerHeight + 100; };
  var fmt = function (n) { return Math.round(n).toLocaleString('en-US'); };

  // ---------- Gold italic phrase in headings ----------
  var accent = function () {
    qsa('[data-em-en]').forEach(function (el) {
      var phrase = el.getAttribute('data-em-' + lang()) || '', text = el.textContent;
      var i = phrase ? text.lastIndexOf(phrase) : -1;
      el.innerHTML = i < 0 ? esc(text) : esc(text.slice(0, i)) + '<em>' + esc(phrase) + '</em>' + esc(text.slice(i + phrase.length));
    });
  };
  accent(); onLang.push(accent);

  // ---------- Reveal on view; counters ----------
  var io = 'IntersectionObserver' in window && !reduce ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); if (e.target._onIn) { e.target._onIn(); } } });
  }, { rootMargin: '0px 0px -10% 0px' }) : null;
  var whenSeen = function (el, fn) { if (!io) { el.classList.add('is-in'); fn && fn(); return; } el._onIn = fn; io.observe(el); };
  qsa('[data-rv]').forEach(function (el) { whenSeen(el); });
  var countUp = function (b, to, from, ms) {
    if (reduce) { b.textContent = fmt(to); return; }
    var t0 = 0, start = from || 0;
    var step = function (now) { t0 = t0 || now; var p = clamp((now - t0) / (ms || 1400), 0, 1), e = 1 - Math.pow(1 - p, 3); b.textContent = fmt(start + (to - start) * e); if (p < 1) { requestAnimationFrame(step); } };
    requestAnimationFrame(step);
  };
  qsa('[data-count]').forEach(function (b) {
    var to = +b.getAttribute('data-count');
    if (!reduce) { b.textContent = '0'; }
    whenSeen(b, function () { countUp(b, to, 0, to > 1000 ? 1800 : 1300); });
    onLang.push(function () { b.textContent = fmt(to); });
  });

  // ---------- Right-hand rail ----------
  var railLinks = qsa('.a-rail a'), rail = qs('.a-rail');
  var railTargets = railLinks.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var darkIds = { top: 1, vision: 1, aleg: 1, contact: 1 };
  var railTick = function () {
    var line = window.innerHeight * 0.45, on = 0;
    railTargets.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < line) { on = i; } });
    railLinks.forEach(function (a, i) { a.classList.toggle('is-on', i === on); });
    var fly = qs('[data-fly]'), fr = fly && fly.getBoundingClientRect();
    rail.classList.toggle('on-dark', !!darkIds[railTargets[on] && railTargets[on].id] || (fr && fr.top < line && fr.bottom > line));
  };

  // ---------- Hero: the seal drawn in sand; the pointer pushes the grains ----------
  (function () {
    var box = qs('.a-sand'), cv = box && qs('.a-sand-cv', box), imgEl = box && qs('.a-sand-img', box);
    if (!cv || reduce) { return; }
    var ctx = cv.getContext('2d'), W = 0, H = 0, N = 0, hx, hy, px, py, vx, vy, col, data, buf, mouse = { x: -1e4, y: -1e4 }, running = false, ready = false;
    var setup = function () {
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5), size = Math.round(cv.getBoundingClientRect().width * dpr);
      if (!size) { return; }
      W = H = size; cv.width = W; cv.height = H;
      var off = document.createElement('canvas'); off.width = W; off.height = H;
      var o = off.getContext('2d'), inset = W * 0.06;
      o.drawImage(imgEl, inset, inset, W - inset * 2, H - inset * 2);
      var src;
      try { src = o.getImageData(0, 0, W, H).data; } catch (e) { return; }   // opened from disk: keep the plain image
      var step = Math.max(3, Math.round(W / 150)), list = [];
      for (var y = 0; y < H; y += step) {
        for (var x = 0; x < W; x += step) {
          var k = (y * W + x) * 4;
          if (src[k + 3] > 140) { list.push(x, y, src[k], src[k + 1], src[k + 2]); }
        }
      }
      N = list.length / 5;
      hx = new Float32Array(N); hy = new Float32Array(N); px = new Float32Array(N); py = new Float32Array(N); vx = new Float32Array(N); vy = new Float32Array(N); col = new Uint32Array(N);
      for (var i = 0; i < N; i++) {
        hx[i] = px[i] = list[i * 5]; hy[i] = py[i] = list[i * 5 + 1];
        var j = 0.82 + Math.random() * 0.22;   // a little grain in the colour
        var r = Math.min(255, list[i * 5 + 2] * j) | 0, g = Math.min(255, list[i * 5 + 3] * j) | 0, b = Math.min(255, list[i * 5 + 4] * j * 0.92) | 0;
        col[i] = (255 << 24) | (b << 16) | (g << 8) | r;
      }
      data = ctx.createImageData(W, H); buf = new Uint32Array(data.data.buffer);
      ready = true; box.classList.add('is-live'); draw();
    };
    var dot = Math.max(2, Math.round((window.devicePixelRatio || 1) * 1.5));
    var draw = function () {
      buf.fill(0);
      for (var i = 0; i < N; i++) {
        var x = px[i] | 0, y = py[i] | 0;
        if (x < 0 || y < 0 || x >= W - dot || y >= H - dot) { continue; }
        var c = col[i], o = y * W + x;
        for (var dy = 0; dy < dot; dy++) { var row = o + dy * W; for (var dx = 0; dx < dot; dx++) { buf[row + dx] = c; } }
      }
      ctx.putImageData(data, 0, 0);
    };
    var tick = function () {
      var moving = false, R = W * 0.11, R2 = R * R;
      for (var i = 0; i < N; i++) {
        var dx = px[i] - mouse.x, dy = py[i] - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < R2) { var d = Math.sqrt(d2) || 1, f = (1 - d / R) * 3.2; vx[i] += dx / d * f; vy[i] += dy / d * f; }
        vx[i] = (vx[i] + (hx[i] - px[i]) * 0.035) * 0.86; vy[i] = (vy[i] + (hy[i] - py[i]) * 0.035) * 0.86;
        px[i] += vx[i]; py[i] += vy[i];
        if (!moving && (Math.abs(vx[i]) > 0.05 || Math.abs(vy[i]) > 0.05)) { moving = true; }
      }
      draw();
      if (moving || mouse.x > -1e3) { requestAnimationFrame(tick); } else { running = false; }
    };
    var wake = function () { if (ready && !running) { running = true; requestAnimationFrame(tick); } };
    box.addEventListener('pointermove', function (e) {
      var r = cv.getBoundingClientRect(), s = W / r.width;
      mouse.x = (e.clientX - r.left) * s; mouse.y = (e.clientY - r.top) * s; wake();
    });
    box.addEventListener('pointerleave', function () { mouse.x = mouse.y = -1e4; wake(); });
    var start = function () { if (imgEl.complete && imgEl.naturalWidth) { setup(); } else { imgEl.addEventListener('load', setup, { once: true }); } };
    start();
    var rw = 0;
    window.addEventListener('resize', function () { var w = cv.getBoundingClientRect().width; if (Math.abs(w - rw) > 20) { rw = w; ready = false; start(); } });
  })();

  // ---------- Fly-through ----------
  var fly = qs('[data-fly]'), flyStage = fly && qs('.a-fly-stage', fly);
  var flyTick = function () {
    if (!fly || !near(fly)) { return; }
    var t = progressOf(fly);
    var z = ease(clamp((t - 0.12) / 0.6, 0, 1));
    flyStage.style.setProperty('--z', (1 + z * z * 26).toFixed(3));
    flyStage.style.setProperty('--w', (1 - clamp((t - 0.5) / 0.18, 0, 1)).toFixed(3));
    flyStage.style.setProperty('--p', clamp((t - 0.38) / 0.24, 0, 1).toFixed(3));
    flyStage.style.setProperty('--c', clamp((t - 0.74) / 0.14, 0, 1).toFixed(3));
  };

  // ---------- Why Mauritania: panels ----------
  var panels = qsa('[data-panels] li');
  var openPanel = function (li) { panels.forEach(function (p) { p.classList.toggle('is-on', p === li); }); };
  panels.forEach(function (li) {
    if (fine) { li.addEventListener('mouseenter', function () { openPanel(li); }); }
    li.addEventListener('click', function () { openPanel(li); });
    li.addEventListener('focus', function () { openPanel(li); });
  });

  // ---------- Journey: west to east by longitude ----------
  var jr = qs('[data-journey]'), map = jr && qs('.a-map', jr), pins = jr ? qsa('.a-pin', jr) : [], cards = jr ? qsa('.a-sc', jr) : [], ops = jr ? qsa('.a-ops li', jr) : [];
  var OPS = [[1], [2, 3], [4]], jIdx = -1, routeSvg = null, routeBase = null, routeLine = null, routeLen = 0, pinXY = [];
  var placePins = function () {
    if (!map) { return; }
    var w = map.clientWidth, h = map.clientHeight, lons = pins.map(function (p) { return +p.getAttribute('data-lon'); });
    var west = -17.2, east = -5.5, span = window.innerWidth < 641 ? 0.86 : 0.88;
    pinXY = pins.map(function (p, i) {
      var f = (lons[i] - west) / (east - west), x = (rtl() ? 1 - f : f) * w * span + w * 0.02;
      p.style.left = x + 'px';
      var dotR = qs('i', p).getBoundingClientRect(), mr = map.getBoundingClientRect();
      return [dotR.left - mr.left + dotR.width / 2, dotR.top - mr.top + dotR.height / 2];
    });
    if (!routeSvg) {
      routeSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      routeSvg.setAttribute('class', 'a-route'); routeSvg.setAttribute('aria-hidden', 'true');
      routeSvg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none';
      routeBase = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      routeLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      routeBase.setAttribute('style', 'fill:none;stroke:#6B2A22;stroke-width:1.6;stroke-dasharray:5 6;opacity:.55');
      routeLine.setAttribute('style', 'fill:none;stroke:#6B2A22;stroke-width:2.4;stroke-linecap:round');
      routeSvg.appendChild(routeBase); routeSvg.appendChild(routeLine);
      map.insertBefore(routeSvg, map.firstChild.nextSibling);
    }
    routeSvg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    var d = 'M' + pinXY[0][0] + ' ' + pinXY[0][1];
    for (var i = 1; i < pinXY.length; i++) { var a = pinXY[i - 1], b = pinXY[i], mx = (a[0] + b[0]) / 2; d += ' C' + mx + ' ' + (a[1] + 14) + ' ' + mx + ' ' + (b[1] + 14) + ' ' + b[0] + ' ' + b[1]; }
    routeBase.setAttribute('d', d); routeLine.setAttribute('d', d);
    routeLen = routeLine.getTotalLength();
    routeLine.style.strokeDasharray = routeLen; jIdx = -1;
  };
  var segLen = function (k) {   // route length up to pin k
    if (!routeLen || k <= 0) { return 0; }
    var best = routeLen, target = pinXY[k], lo = 0, hi = routeLen;
    for (var s = 0; s <= 40; s++) { var l = hi * s / 40, pt = routeLine.getPointAtLength(l); if (Math.abs(pt.x - target[0]) < 6) { best = l; break; } }
    return best;
  };
  var showSite = function (idx) {
    pins.forEach(function (p, i) { p.classList.toggle('is-on', i === idx); p.classList.toggle('is-done', i < idx); });
    cards.forEach(function (c, i) { c.classList.toggle('is-on', i === idx); });
    ops.forEach(function (o) { o.classList.toggle('is-on', window.innerWidth < 641 || OPS[idx].indexOf(+o.getAttribute('data-op')) > -1); });
  };
  var jTick = function () {
    if (!jr || !near(jr)) { return; }
    if (window.innerWidth < 641) { if (jIdx === -1) { jIdx = 0; showSite(0); } return; }   // phones: the visitor picks a site
    var t = progressOf(jr), f = clamp(t * 1.15, 0, 1) * (pins.length - 1), idx = Math.min(pins.length - 1, Math.floor(f + 0.35));
    if (routeLen) {
      var k = Math.floor(f), a = segLen(k), b = segLen(Math.min(k + 1, pins.length - 1));
      routeLine.style.strokeDashoffset = (routeLen - (a + (b - a) * ease(f - k))).toFixed(1);
    }
    if (idx !== jIdx) {
      jIdx = idx;
      pins.forEach(function (p, i) { p.classList.toggle('is-on', i === idx); p.classList.toggle('is-done', i < idx); });
      cards.forEach(function (c, i) { c.classList.toggle('is-on', i === idx); });
      ops.forEach(function (o) { o.classList.toggle('is-on', window.innerWidth < 641 || OPS[idx].indexOf(+o.getAttribute('data-op')) > -1); });
    }
  };
  pins.forEach(function (p, i) {
    p.addEventListener('click', function () {
      if (window.innerWidth < 641) { jIdx = i; showSite(i); return; }
      var top = window.scrollY + jr.getBoundingClientRect().top + (i / (pins.length - 1)) / 1.15 * (jr.offsetHeight - window.innerHeight);
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  // ---------- Goals: count the planned sites ----------
  var goals = qs('[data-goals]');
  if (goals) {
    var sgs = qsa('.a-sg', goals), picks = qsa('.a-pick button', goals), totals = qsa('[data-total]', goals), nNow = 1;
    sgs.forEach(function (sg) { qsa('.a-dots i', sg).forEach(function (d, k) { d.style.setProperty('--k', k); }); });
    var setN = function (n, animate) {
      var from = nNow; nNow = n;
      picks.forEach(function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-n') === n)); });
      sgs.forEach(function (sg, i) { sg.classList.toggle('is-on', i < n); });
      totals.forEach(function (b) { var base = +b.getAttribute('data-total'); if (animate) { countUp(b, base * n, base * from, 900); } else { b.textContent = fmt(base * n); } });
    };
    picks.forEach(function (b) { b.addEventListener('click', function () { setN(+b.getAttribute('data-n'), true); }); });
    setN(1, false);
    sgs[0].classList.remove('is-on');
    whenSeen(goals, function () { sgs[0].classList.add('is-on'); });
  }

  // ---------- Aleg films: strip and player ----------
  var player = qs('[data-player]');
  if (player) {
    var video = qs('.a-video', player), frames = qsa('.a-frame', player), strip = qs('[data-strip]', player), inner = qs('.a-strip-in', player);
    var cur = frames.length - 1, sx = 0, minX = 0;
    var show = function (i, play) {
      cur = i;
      var f = frames[i];
      frames.forEach(function (x, j) { x.classList.toggle('is-on', j === i); });
      video.pause(); video.removeAttribute('src'); video.load();
      video.poster = f.getAttribute('data-poster');
      player.classList.remove('is-playing');
      qs('.a-clip-h', player).textContent = plain(T(f.getAttribute('data-h')));
      qs('.a-clip-p', player).textContent = qs('span', f).textContent + ' · ' + f.getAttribute('data-dur');
      qs('.a-clip-n', player).textContent = (i + 1) + ' / ' + frames.length;
      if (play) { start(); }
    };
    var start = function () {
      var f = frames[cur];
      if (!video.getAttribute('src')) { video.src = f.getAttribute('data-video'); }
      video.controls = true; player.classList.add('is-playing');
      var p = video.play(); if (p && p.catch) { p.catch(function () {}); }
    };
    qs('.a-play', player).addEventListener('click', start);
    video.addEventListener('ended', function () { player.classList.remove('is-playing'); video.controls = false; });
    // Dragging the strip
    var limits = function () { minX = Math.min(0, strip.clientWidth - inner.scrollWidth); sx = clamp(sx, minX, 0); inner.style.transform = 'translate3d(' + sx + 'px,0,0)'; };
    var down = null, moved = false;
    strip.addEventListener('pointerdown', function (e) { down = { x: e.clientX, s: sx }; moved = false; });
    window.addEventListener('pointermove', function (e) {
      if (!down) { return; }
      var dx = e.clientX - down.x;
      if (Math.abs(dx) > 5) { moved = true; strip.classList.add('is-drag'); }
      if (moved) { sx = clamp(down.s + dx, minX, 0); inner.style.transform = 'translate3d(' + sx + 'px,0,0)'; }
    });
    window.addEventListener('pointerup', function () { down = null; strip.classList.remove('is-drag'); });
    strip.addEventListener('wheel', function (e) { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { sx = clamp(sx - e.deltaX, minX, 0); inner.style.transform = 'translate3d(' + sx + 'px,0,0)'; } }, { passive: true });
    frames.forEach(function (f, i) { f.addEventListener('click', function (e) { if (moved) { e.preventDefault(); return; } show(i, false); }); });
    window.addEventListener('resize', limits);
    limits(); show(cur, false);
    sx = minX; inner.style.transform = 'translate3d(' + sx + 'px,0,0)';
    onLang.push(function () { show(cur, false); });
  }

  // ---------- Development: goal tabs ----------
  qsa('[data-tabs]').forEach(function (box) {
    var tabs = qsa('[data-tab]', box), panelsT = qsa('[data-panel]', box);
    tabs.forEach(function (b) { b.addEventListener('click', function () { var n = b.getAttribute('data-tab'); tabs.forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); }); panelsT.forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== n; }); }); });
  });

  // ---------- Milestones: the dial ----------
  var ms = qs('[data-ms]');
  if (ms) {
    var nodes = qsa('.a-node', ms), items = qsa('.a-ms-list li', ms), ring = qs('.a-ring', ms), mIdx = -1, total = nodes.length, pinned = function () { return window.innerWidth > 640; };
    nodes.forEach(function (n, i) { n.style.setProperty('--a', (i * 360 / total) + 'deg'); });
    items.forEach(function (li, i) { if (!qs('time', li)) { nodes[i].classList.add('is-planned'); } });
    var shortDate = function (li) {
      var tm = qs('time', li);
      if (!tm) { return qs('.a-eyebrow', li).textContent.trim(); }
      var p = tm.getAttribute('datetime').split('-'), d = new Date(+p[0], +p[1] - 1, 1);
      try { return d.toLocaleDateString(lang() === 'ar' ? 'ar' : lang(), { month: 'short', year: 'numeric' }); } catch (e) { return tm.textContent; }
    };
    var setM = function (i) {
      if (i === mIdx) { return; }
      mIdx = i;
      ring.style.setProperty('--rot', (-i * 360 / total) + 'deg');
      ms.style.setProperty('--rot', (-i * 360 / total) + 'deg');
      nodes.forEach(function (n, j) { n.classList.toggle('is-on', j === i); n.style.setProperty('--rot', (-i * 360 / total) + 'deg'); });
      items.forEach(function (li, j) { li.hidden = j !== i; });
      qs('[data-mn]', ms).textContent = i + 1;
      qs('[data-mshort]', ms).textContent = shortDate(items[i]);
      qs('[data-mlong]', ms).textContent = qs('.a-eyebrow', items[i]).textContent.trim();
      qs('[data-mcount]', ms).textContent = (i + 1) + ' ' + plain(T('x.of')) + ' ' + total;
    };
    var go = function (i) {
      i = clamp(i, 0, total - 1);
      if (!pinned()) { setM(i); return; }
      var top = window.scrollY + ms.getBoundingClientRect().top + ((i + 0.5) / total) * (ms.offsetHeight - window.innerHeight);
      window.scrollTo({ top: top, behavior: 'smooth' });
    };
    qsa('[data-step]', ms).forEach(function (b) { b.addEventListener('click', function () { go(mIdx + (+b.getAttribute('data-step')) * (rtl() ? -1 : 1) * (rtl() ? -1 : 1)); }); });
    nodes.forEach(function (n, i) { n.addEventListener('click', function () { go(i); }); });
    var msTick = function () { if (!pinned() || !near(ms)) { return; } setM(Math.min(total - 1, Math.floor(progressOf(ms) * total))); };
    setM(0);
    onLang.push(function () { var i = mIdx; mIdx = -1; setM(i); });
  }

  // ---------- Gallery: a deck of cards ----------
  var deck = qs('[data-deck]');
  if (deck) {
    var src = qsa('.a-gal-src li.media-item'), filt = qsa('.a-filters button'), order = [], top = 0, cardsEl = [];
    var catOf = function (li) { return li.getAttribute('data-cat'); };
    filt.forEach(function (b) {
      var f = b.getAttribute('data-f'), n = src.filter(function (li) { return f === 'all' || (f === 'video' ? li.getAttribute('data-type') === 'video' : catOf(li) === f); }).length;
      qs('b', b).textContent = '· ' + n;
    });
    var renderDeck = function () {
      deck.innerHTML = '';
      cardsEl = [];
      var n = Math.min(4, order.length);
      for (var k = n - 1; k >= 0; k--) {
        var li = order[(top + k) % order.length], btn = qs('.media-open', li), im = qs('img', li), cap = qs('.media-cap', li);
        var c = document.createElement('figure');
        c.className = 'a-card-p';
        c.innerHTML = '<img src="' + im.getAttribute('src') + '" alt="" draggable="false">' + (li.getAttribute('data-type') === 'video' ? '<span class="a-cp-play" aria-hidden="true"></span>' : '') + '<figcaption>' + esc(cap ? cap.textContent : '') + '</figcaption>';
        var rot = [0, -3.5, 4, -6][k];
        c.style.transform = 'translate3d(' + (k * 10 * (rtl() ? -1 : 1)) + 'px,' + (-k * 8) + 'px,0) rotate(' + rot + 'deg) scale(' + (1 - k * 0.03) + ')';
        c.style.zIndex = 10 - k;
        if (k === 0) { c.setAttribute('tabindex', '0'); c.setAttribute('role', 'button'); c.setAttribute('aria-label', (cap ? cap.textContent : '') + ' — ' + plain(T(li.getAttribute('data-type') === 'video' ? 'ui.galPlay' : 'ui.galView'))); c._btn = btn; drag(c); }
        deck.appendChild(c);
        cardsEl.unshift(c);
      }
      qs('[data-dcount]').textContent = (order.length ? top + 1 : 0) + ' / ' + order.length;
      qs('.a-deck-bar i').style.width = (order.length ? (top + 1) / order.length * 100 : 0) + '%';
    };
    var step = function (d) { if (!order.length) { return; } top = (top + d + order.length) % order.length; renderDeck(); };
    var drag = function (c) {
      var st = null, dx = 0, dy = 0;
      c.addEventListener('pointerdown', function (e) { st = { x: e.clientX, y: e.clientY }; dx = dy = 0; c.setPointerCapture(e.pointerId); c.classList.add('is-drag'); });
      c.addEventListener('pointermove', function (e) { if (!st) { return; } dx = e.clientX - st.x; dy = e.clientY - st.y; c.style.transform = 'translate3d(' + dx + 'px,' + dy + 'px,0) rotate(' + (dx * 0.06) + 'deg)'; });
      var end = function () {
        if (!st) { return; }
        st = null; c.classList.remove('is-drag');
        if (Math.abs(dx) > 90) {
          c.style.transform = 'translate3d(' + (dx > 0 ? 1 : -1) * 700 + 'px,' + dy + 'px,0) rotate(' + (dx > 0 ? 24 : -24) + 'deg)'; c.style.opacity = '0';
          setTimeout(function () { step(1); }, 280);
        } else if (Math.abs(dx) < 5 && Math.abs(dy) < 5) { c.style.transform = ''; c._btn.click(); renderDeck(); } else { renderDeck(); }
      };
      c.addEventListener('pointerup', end); c.addEventListener('pointercancel', end);
      c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); c._btn.click(); } });
    };
    var apply = function (f) {
      filt.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-f') === f)); });
      order = src.filter(function (li) { var ok = f === 'all' || (f === 'video' ? li.getAttribute('data-type') === 'video' : catOf(li) === f); li.hidden = !ok; return ok; });
      top = 0; renderDeck();
    };
    filt.forEach(function (b) { b.addEventListener('click', function () { apply(b.getAttribute('data-f')); }); });
    qsa('[data-dstep]').forEach(function (b) { b.addEventListener('click', function () { step(+b.getAttribute('data-dstep') * (rtl() ? -1 : 1)); }); });
    apply('all');
    onLang.push(renderDeck);
  }

  // ---------- Arrahma AI panel ----------
  var ai = qs('[data-ai]');
  if (ai) {
    var log = qs('.a-ai-log', ai), form = qs('.a-ai-form', ai), input = qs('input', form), busy = false, draft = { interest: '', qty: '', loc: '' };
    var KINDS = [[/cattle|cow|bovin|بقر|أبقار|عجول|calves|veau/i, 'Cattle'], [/sheep|mouton|ovin|أغنام|خراف|غنم/i, 'Sheep'], [/camel|dromad|إبل|جمال/i, 'Camels'], [/forage|fourrage|feed|أعلاف|علف/i, 'Forage'],
      [/partner|partenariat|شراك/i, 'Partnership'], [/visit|visite|زيار/i, 'Site visit'], [/slaughter|abattoir|meat|viande|مسلخ|لحوم/i, 'Slaughterhouse / meat']];
    var render = function () {
      Object.keys(draft).forEach(function (k) { qs('[data-f="' + k + '"]', ai).textContent = draft[k] || '—'; });
      var lines = [plain(T('x.d.intro')), plain(T('x.d.interest')) + ': ' + (draft.interest || '—'), plain(T('x.d.qty')) + ': ' + (draft.qty || '—'), plain(T('x.d.loc')) + ': ' + (draft.loc || '—')];
      qs('.a-wa', ai).href = 'https://wa.me/' + ai.getAttribute('data-wa') + '?text=' + encodeURIComponent(lines.join('\n'));
      qs('.a-mail', ai).href = 'mailto:' + ai.getAttribute('data-mail') + '?subject=' + encodeURIComponent(lines[0]) + '&body=' + encodeURIComponent(lines.slice(1).join('\n'));
    };
    var note = function (q) {
      for (var i = 0; i < KINDS.length; i++) { if (KINDS[i][0].test(q)) { draft.interest = KINDS[i][1]; break; } }
      var m = q.match(/(\d[\d.,]*)\s*(head|heads|têtes|رأس|ha|hectares?|tonnes?|tons?|t|طن|هكتار)\b/i); if (m) { draft.qty = m[1] + ' ' + m[2]; }
      var d = q.match(/\b(Aleg|Nouakchott|Hodh[\w\s]*?Chargui|Boghé|Boghe)\b/i) || q.match(/\b(?:to|in|à|en|vers)\s+(\p{Lu}[\p{L}'’-]+)/u) || q.match(/(ألاك|نواكشوط|الحوض الشرقي)/);
      if (d) { draft.loc = d[1]; }
      render();
    };
    var add = function (cls, html) { var b = document.createElement('div'); b.className = 'a-msg ' + cls; b.innerHTML = html; log.appendChild(b); log.scrollTop = log.scrollHeight; return b; };
    var ask = function (q) {
      q = String(q || '').replace(/\s+/g, ' ').trim().slice(0, 600);
      if (!q || busy) { return; }
      busy = true; ai.classList.add('is-busy');
      add('user', '<p>' + esc(q) + '</p>'); note(q); input.value = '';
      var wait = add('bot typing', '<i></i><i></i><i></i>');
      var A = window.siteAssistant;
      (A && A.respond ? A.respond(q) : Promise.resolve({ html: '' })).then(function (r) { wait.remove(); if (r && r.html) { add('bot', r.html); } busy = false; ai.classList.remove('is-busy'); });
    };
    form.addEventListener('submit', function (e) { e.preventDefault(); ask(input.value); });
    qsa('.a-ai-chips button', ai).forEach(function (b) { b.addEventListener('click', function () { ask(b.textContent); }); });
    qsa('.a-ai-langs button', ai).forEach(function (b) { b.addEventListener('click', function () { if (window.siteLang) { window.siteLang.set(b.getAttribute('data-l')); } }); });
    var langOn = function () { qsa('.a-ai-langs button', ai).forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-l') === lang()); }); render(); };
    langOn(); onLang.push(langOn);
  }

  // ---------- Rotating badge text follows the language ----------
  var badge = qs('[data-badge]');
  var badgeText = function () { if (badge) { var s = plain(T('x.since')); badge.textContent = s + s; } };
  badgeText(); onLang.push(badgeText);

  // ---------- One scroll loop ----------
  var queued = false;
  var frame = function () { queued = false; flyTick(); jTick(); if (ms) { msTick(); } railTick(); };
  var queue = function () { if (!queued) { queued = true; requestAnimationFrame(frame); } };
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', function () { placePins(); queue(); });
  window.addEventListener('load', function () { placePins(); queue(); });
  onLang.push(function () { placePins(); queue(); });
  placePins(); frame();
})();
